using MediatR;
using Microsoft.EntityFrameworkCore;
using FileService.Application.Common.Interfaces;
using FileService.Application.Common.Exceptions;
using FileService.Domain.Entities;
using FileService.Domain.Enums;

namespace FileService.Application.Features.Files.Commands.DeleteFile
{
    public record DeleteFileCommand(
        Guid FileId,
        string PerformedBy,
        string? Notes
    ) : IRequest;
    
    public class DeleteFileCommandHandler
        : IRequestHandler<DeleteFileCommand>
    {
        private readonly IApplicationDbContext _context;

        public DeleteFileCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(
            DeleteFileCommand request,
            CancellationToken cancellationToken)
        {
            // 1️⃣ Load file
            var file = await _context.FileEntries
                .FirstOrDefaultAsync(
                    f => f.Id == request.FileId && f.DeletedAt == null,
                    cancellationToken);

            if (file == null)
            {
                throw new NotFoundException(
                    $"File with ID {request.FileId} not found");
            }

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

            return Unit.Value;
        }
    }
}