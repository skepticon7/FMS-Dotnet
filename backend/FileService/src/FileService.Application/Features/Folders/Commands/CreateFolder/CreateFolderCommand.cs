using MediatR;
using FileService.Application.Common.Interfaces;
using FileService.Domain.Entities;
using Microsoft.Extensions.Caching.Distributed;

namespace FileService.Application.Features.Folders.Commands.CreateFolder
{
    // 1️⃣ The Command
    public record CreateFolderCommand(
        string Name,
        string? Type,
        string? PatientId,
        string? DoctorId
    ) : IRequest<Guid>;

    // 2️⃣ The Handler
    public class CreateFolderCommandHandler
        : IRequestHandler<CreateFolderCommand, Guid>
    {
        private readonly IApplicationDbContext _context;
        private readonly IDistributedCache _cache;

        public CreateFolderCommandHandler(
            IApplicationDbContext context,
            IDistributedCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task<Guid> Handle(
            CreateFolderCommand request,
            CancellationToken cancellationToken)
        {
            var entity = new Folder
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Type = request.Type,
                PatientId = request.PatientId,  
                DoctorId = request.DoctorId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Folders.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);

            // 🔥 Cache invalidation
            await InvalidateCaches(entity, cancellationToken);

            return entity.Id;
        }

        private async Task InvalidateCaches(
            Folder folder,
            CancellationToken cancellationToken)
        {
            // Folder lists
            await _cache.RemoveAsync("folders:all", cancellationToken);

            if (!string.IsNullOrEmpty(folder.PatientId))
            {
                await _cache.RemoveAsync(
                    $"folders:patient:{folder.PatientId}",
                    cancellationToken);
            }

            if (!string.IsNullOrEmpty(folder.DoctorId))
            {
                await _cache.RemoveAsync(
                    $"folders:doctor:{folder.DoctorId}",
                    cancellationToken);
            }
        }
    }
}
