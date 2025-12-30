using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using FileService.Application.Common.Interfaces;
using FileService.Domain.Entities;
using FileService.Domain.Enums;
using Microsoft.Extensions.Caching.Distributed;
using FileService.Application.Common.Exceptions;

namespace FileService.Application.Features.Files.Commands.UploadFile
{
    public record UploadFileCommand(
        Guid FolderId,
        IFormFile File,
        MedicalFileType FileType, 
        string UploadedBy,       
        string? Notes
    ) : IRequest<Guid>;


    public class UploadFileCommandHandler : IRequestHandler<UploadFileCommand, Guid>
    {
        private readonly IApplicationDbContext _context;
        private readonly IFileStorageService _storage;
        private readonly IAzureFileStorageService _azureStorage;
        private readonly IDistributedCache _cache;

        public UploadFileCommandHandler(
            IApplicationDbContext context, 
            IFileStorageService storage, 
            IAzureFileStorageService azureStorage, 
            IDistributedCache cache)
        {
            _context = context;
            _storage = storage;
            _azureStorage = azureStorage;
            _cache = cache;
        }

        public async Task<Guid> Handle(UploadFileCommand request, CancellationToken cancellationToken)
        {
            // A. Validate Folder Exists
            var folder = await _context.Folders
                .FirstOrDefaultAsync(f => f.Id == request.FolderId, cancellationToken);

            if (folder == null)
            {
                throw new NotFoundException($"Folder with ID {request.FolderId} not found.");
            }

            // B. Versioning Logic
            var existingFile = await _context.FileEntries
                .Where(f => f.FolderId == request.FolderId 
                         && f.FileName == request.File.FileName 
                         && f.IsLatest 
                         && f.DeletedAt == null)
                .FirstOrDefaultAsync(cancellationToken);

            int newVersion = 1;

            if (existingFile != null)
            {
                existingFile.IsLatest = false;
                newVersion = existingFile.Version + 1;
            }

            // C. Upload to Storage
            var storagePath = await _storage.SaveFileAsync(request.File, request.FolderId.ToString());
            var azurePath = await _azureStorage.SaveFileAsync(request.File, request.FolderId.ToString());

            // D. Create File Entry
            var newFileEntry = new FileEntry
            {
                Id = Guid.NewGuid(),
                FolderId = request.FolderId,
                FileName = request.File.FileName,
                ContentType = request.File.ContentType,
                FileType = request.FileType,
                Size = request.File.Length,
                StoragePath = storagePath,
                Checksum = "PENDING_CALCULATION", 
                Version = newVersion,
                IsLatest = true,
                UploadedAt = DateTime.UtcNow,
                UploadedBy = request.UploadedBy
            };

            // E. Create History Log
            var history = new FileHistory
            {
                Id = Guid.NewGuid(),
                FileEntryId = newFileEntry.Id,
                Action = existingFile == null ? FileAction.Created : FileAction.Updated,
                Notes = request.Notes,
                Timestamp = DateTime.UtcNow,
                PerformedBy = request.UploadedBy
            };

            newFileEntry.Histories.Add(history);

            // F. Save to DB
            _context.FileEntries.Add(newFileEntry);
            await _context.SaveChangesAsync(cancellationToken);

            // --- G. CACHE INVALIDATION ---
            
            // 1. Invalidate the "All Files" list (CRITICAL FIX)
            // This ensures the next "Get All" call fetches the new file from DB
            await _cache.RemoveAsync("files:all", cancellationToken);

            // 2. (Optional) Clear specific file cache if you were doing an update
            // We use ':' to match the convention in your GetById query
            await _cache.RemoveAsync($"file:{newFileEntry.Id}", cancellationToken);
            
            return newFileEntry.Id;
        }
    }
}