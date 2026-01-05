using MediatR;
using Microsoft.EntityFrameworkCore;
using FileService.Application.Common.Interfaces;
using FileService.Application.Common.Exceptions;
using FileService.Domain.Entities;
using FileService.Domain.Enums;
using Microsoft.Extensions.Caching.Distributed;

namespace FileService.Application.Features.Files.Commands.DeleteFile
{
    public record DeleteFileCommand(
        Guid FileId,
        string PerformedBy,
        string? Notes
    ) : IRequest;
    
    public class DeleteFileCommandHandler : IRequestHandler<DeleteFileCommand>
    {
        private readonly IApplicationDbContext _context;
        private readonly IDistributedCache _cache;

        public DeleteFileCommandHandler(IApplicationDbContext context, IDistributedCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task<Unit> Handle(DeleteFileCommand request, CancellationToken cancellationToken)
        {
            // 1️⃣ Load file
            var file = await _context.FileEntries
                .FirstOrDefaultAsync(
                    f => f.Id == request.FileId && f.DeletedAt == null,
                    cancellationToken);

            if (file == null)
            {
                throw new NotFoundException($"File with ID {request.FileId} not found");
            }

            // 👇 CRITICAL FIX: Capture the FolderId here so we can use it later
            var folderId = file.FolderId; 

            // 2️⃣ Soft delete
            file.DeletedAt = DateTime.UtcNow;
            file.IsLatest = false;

            // 3️⃣ Create history entry
            var history = new FileHistory
            {
                Id = Guid.NewGuid(),
                FileEntryId = file.Id,
                Action = FileAction.Deleted,
                Notes = request.Notes,
                Timestamp = DateTime.UtcNow,
                PerformedBy = request.PerformedBy 
            };

            _context.FileHistories.Add(history);

            // 4️⃣ Persist
            await _context.SaveChangesAsync(cancellationToken);

            // 5️⃣ OPTIMIZED CACHE INVALIDATION
            var tasks = new List<Task>();

            // A. Remove the single file details
            tasks.Add(_cache.RemoveAsync($"file:{request.FileId}", cancellationToken));

            // B. FIX: Use the 'folderId' variable we captured above
            tasks.Add(_cache.RemoveAsync($"files:folder:{folderId}", cancellationToken));

            // C. Clear the main list of folders (updates counts)
            tasks.Add(_cache.RemoveAsync("folders:all", cancellationToken));
            
            // D. Clear specific Folder Details metadata
            tasks.Add(_cache.RemoveAsync($"folder:{folderId}", cancellationToken));
            tasks.Add(_cache.RemoveAsync("history:recent", cancellationToken));
            
            await Task.WhenAll(tasks);

            return Unit.Value;
        }
    }
}