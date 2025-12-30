using MediatR;
using Microsoft.EntityFrameworkCore;
using FileService.Application.Common.Interfaces;
using FileService.Application.Common.Exceptions;
using FileService.Domain.Entities;
using FileService.Domain.Enums;
using MassTransit;
using Microsoft.Extensions.Caching.Distributed; // 1. Add Namespace

namespace FileService.Application.Features.Folders.Commands.DeleteFolder
{
    public record DeleteFolderCommand(
        Guid FolderId,
        string PerformedBy,
        string? Notes
    ) : IRequest;
    
    public record FolderDeletedEvent(
        Guid FolderId,
        string? PatientId,
        string? DoctorId
    );
    public record FileDeletedEvent(
        Guid FileId,
        Guid FolderId,
        string FileName
    );

    public class DeleteFolderCommandHandler
        : IRequestHandler<DeleteFolderCommand>
    {
        private readonly IApplicationDbContext _context;
        private readonly IPublishEndpoint _publishEndpoint;
        private readonly IDistributedCache _cache; // 2. Add Cache Field

        public DeleteFolderCommandHandler(
            IApplicationDbContext context,
            IPublishEndpoint publishEndpoint,
            IDistributedCache cache) // 3. Inject Cache
        {
            _context = context;
            _publishEndpoint = publishEndpoint;
            _cache = cache;
        }

        public async Task<Unit> Handle(
            DeleteFolderCommand request,
            CancellationToken cancellationToken)
        {
            // 1️⃣ Load folder with files
            var folder = await _context.Folders
                .Include(f => f.Files)
                .Where(f => f.DeletedAt == null)
                .FirstOrDefaultAsync(
                    f => f.Id == request.FolderId,
                    cancellationToken);

            if (folder == null)
            {
                throw new NotFoundException(
                    $"Folder with ID {request.FolderId} not found");
            }

            var now = DateTime.UtcNow;

            // 2️⃣ Soft delete folder
            folder.DeletedAt = now;

            // 3️⃣ Soft delete all files
            // Capture the list of affected files for cache clearing later
            var affectedFiles = folder.Files.Where(f => f.DeletedAt == null).ToList();

            foreach (var file in affectedFiles)
            {
                file.DeletedAt = now;
                file.IsLatest = false;

                // 3️⃣a File history
                _context.FileHistories.Add(new FileHistory
                {
                    Id = Guid.NewGuid(),
                    FileEntryId = file.Id,
                    Action = FileAction.Deleted,
                    Notes = request.Notes ?? "Folder deleted",
                    Timestamp = now,
                    PerformedBy = request.PerformedBy
                });

                // 3️⃣b Publish file deleted event
                await _publishEndpoint.Publish(
                    new FileDeletedEvent(
                        FileId: file.Id,
                        FolderId: folder.Id,
                        FileName: file.FileName
                    ),
                    cancellationToken);
            }

            // 4️⃣ Persist DB changes
            await _context.SaveChangesAsync(cancellationToken);

            // 5️⃣ Publish Folder Deleted Event
            await _publishEndpoint.Publish(
                new FolderDeletedEvent(
                    FolderId: folder.Id,
                    PatientId: folder.PatientId,
                    DoctorId: folder.DoctorId
                ),
                cancellationToken);

            // 6️⃣ OPTIMIZED CACHE INVALIDATION
            await InvalidateCaches(folder, affectedFiles, cancellationToken);

            return Unit.Value;
        }

        private async Task InvalidateCaches(Folder folder, List<FileEntry> deletedFiles, CancellationToken cancellationToken)
        {
            var tasks = new List<Task>();

            // --- Folder Cache Invalidations ---
            
            // Remove the specific folder
            tasks.Add(_cache.RemoveAsync($"folder:{folder.Id}", cancellationToken));
            
            // Remove the main folder list
            tasks.Add(_cache.RemoveAsync("folders:all", cancellationToken));

            // Remove Patient/Doctor specific lists
            if (!string.IsNullOrEmpty(folder.PatientId))
            {
                tasks.Add(_cache.RemoveAsync($"folders:patient:{folder.PatientId}", cancellationToken));
            }

            if (!string.IsNullOrEmpty(folder.DoctorId))
            {
                tasks.Add(_cache.RemoveAsync($"folders:doctor:{folder.DoctorId}", cancellationToken));
            }

            // --- File Cache Invalidations (Crucial!) ---
            
            // Remove the main file list because we deleted files
            if (deletedFiles.Any())
            {
                tasks.Add(_cache.RemoveAsync("files:all", cancellationToken));
            }

            // Remove individual file caches for every file that was deleted
            foreach (var file in deletedFiles)
            {
                tasks.Add(_cache.RemoveAsync($"file:{file.Id}", cancellationToken));
            }

            // Execute all Redis commands in parallel
            await Task.WhenAll(tasks);
        }
    }
}