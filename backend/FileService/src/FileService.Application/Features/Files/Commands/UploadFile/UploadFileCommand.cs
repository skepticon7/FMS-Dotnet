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
    // 1. The Command
    public record UploadFileCommand(
        Guid FolderId,
        IFormFile File,
        MedicalFileType FileType, // e.g. MRI, Prescription
        string UploadedBy,        // Usually from User Claims
        string? Notes
    ) : IRequest<Guid>;

    // 2. The Handler
    public class UploadFileCommandHandler : IRequestHandler<UploadFileCommand, Guid>
    {
        private readonly IApplicationDbContext _context;
        private readonly IFileStorageService _storage;
        private readonly IAzureFileStorageService _azureStorage;
        private readonly IDistributedCache _cache;

        

        public UploadFileCommandHandler(IApplicationDbContext context, IFileStorageService storage , IAzureFileStorageService azureStorage , IDistributedCache cache)
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
                // In a real app, use a custom NotFoundException here
                throw new NotFoundException($"Folder with ID {request.FolderId} not found.");
            }

            // B. Versioning Logic: Check if file exists
            var existingFile = await _context.FileEntries
                .Where(f => f.FolderId == request.FolderId 
                         && f.FileName == request.File.FileName 
                         && f.IsLatest 
                         && f.DeletedAt == null)
                .FirstOrDefaultAsync(cancellationToken);

            int newVersion = 1;

            if (existingFile != null)
            {
                // Mark old file as not latest
                existingFile.IsLatest = false;
                newVersion = existingFile.Version + 1;
            }

            // C. Upload to Physical Storage (Local/S3)
            // We use the Folder ID as the subfolder name to keep things organized
            var storagePath = await _storage.SaveFileAsync(request.File, request.FolderId.ToString());
            // D. Create File Entry
            var newFileEntry = new FileEntry
            {
                Id = Guid.NewGuid(),
                FolderId = request.FolderId,
                FileName = request.File.FileName,
                ContentType = request.File.ContentType,
                FileType = request.FileType, // <--- Using your new Enum
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
            await _cache.RemoveAsync($"file-{newFileEntry.Id}", cancellationToken);
            
            return newFileEntry.Id;
        }
    }
}