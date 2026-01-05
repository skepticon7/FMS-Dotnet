using MediatR;
using FileService.Domain.Enums;
using FileService.Application.Common.Exceptions;
using FileService.Application.Common.Interfaces;
using FileService.Application.Features.FilesFoldersStats.Queries;
using Microsoft.EntityFrameworkCore;
using FileService.Domain.Entities;
using Microsoft.Extensions.Caching.Distributed; // 1. Add namespace

namespace FileService.Application.Features.Files.Commands.UpdateFile
{
    public record UpdateFileCommand(
        Guid FileId,
        string FileName,
        MedicalFileType FileType,
        string Checksum,
        string PerformedBy,
        string? Notes
    ) : IRequest;

    public class UpdateFileCommandHandler
        : IRequestHandler<UpdateFileCommand>
    {
        private readonly IApplicationDbContext _context;
        private readonly IDistributedCache _cache; // 2. Add Cache Interface

        // 3. Inject Cache in Constructor
        public UpdateFileCommandHandler(IApplicationDbContext context, IDistributedCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task<Unit> Handle(
            UpdateFileCommand request,
            CancellationToken cancellationToken)
        {
            // --- Existing Logic ---
            var file = await _context.FileEntries
                .FirstOrDefaultAsync(
                    f => f.Id == request.FileId && f.DeletedAt == null,
                    cancellationToken);

            if (file == null)
            {
                throw new NotFoundException($"File with ID {request.FileId} not found");
            }

            file.FileName = request.FileName;
            file.FileType = request.FileType;
            file.Checksum = request.Checksum;

            var history = new FileHistory
            {
                Id = Guid.NewGuid(),
                FileEntryId = file.Id,
                Action = FileAction.Updated,
                Notes = request.Notes,
                Timestamp = DateTime.UtcNow,
                PerformedBy = request.PerformedBy
            };

            _context.FileHistories.Add(history);

            await _context.SaveChangesAsync(cancellationToken);
            // ---------------------
   

            // 4️⃣ CACHE INVALIDATION
            // Remove the specific file from cache so the next "GetById" fetches fresh data
            await _cache.RemoveAsync($"file:{request.FileId}", cancellationToken);

            // Remove the "All Files" list so the next "GetAll" fetches fresh data
            await _cache.RemoveAsync("files:all", cancellationToken);
            await _cache.RemoveAsync("history:recent", cancellationToken);

            return Unit.Value;
        }
    }
}