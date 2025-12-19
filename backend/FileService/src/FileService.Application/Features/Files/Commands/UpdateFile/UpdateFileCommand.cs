using MediatR;
using FileService.Domain.Enums;
using FileService.Application.Common.Exceptions;
using FileService.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using FileService.Domain.Entities;
namespace FileService.Application.Features.Files.Commands.UpdateFile

{
    public record UpdateFileCommand(
        Guid FileId,
        string FileName,
        MedicalFileType FileType,
        string Checksum ,
        string PerformedBy,
        string? Notes
    ) : IRequest;
    
    public class UpdateFileCommandHandler
        : IRequestHandler<UpdateFileCommand>
    {
        private readonly IApplicationDbContext _context;

        public UpdateFileCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(
            UpdateFileCommand request,
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

            // 2️⃣ Update metadata
            file.FileName = request.FileName;
            file.FileType = request.FileType;
            file.Checksum = request.Checksum;
            
            // 3️⃣ Create history entry
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

            // 4️⃣ Save changes
            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}