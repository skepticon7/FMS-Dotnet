using MediatR;
using Microsoft.EntityFrameworkCore;
using FileService.Application.Common.Interfaces;
using FileService.Application.Common.Exceptions;
using FileService.Domain.Entities;
using FileService.Domain.Enums;
using MassTransit;

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

        public DeleteFolderCommandHandler(
            IApplicationDbContext context,
            IPublishEndpoint publishEndpoint)
        {
            _context = context;
            _publishEndpoint = publishEndpoint;
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
            foreach (var file in folder.Files.Where(f => f.DeletedAt == null))
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

            // 5️⃣ Publish folder deleted event
            await _publishEndpoint.Publish(
                new FolderDeletedEvent(
                    FolderId: folder.Id,
                    PatientId: folder.PatientId,
                    DoctorId: folder.DoctorId
                ),
                cancellationToken);

            return Unit.Value;
        }
    }
}