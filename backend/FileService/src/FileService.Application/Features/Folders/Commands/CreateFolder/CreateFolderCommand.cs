using MediatR;
using FileService.Application.Common.Interfaces;
using FileService.Domain.Entities;
using Microsoft.Extensions.Caching.Distributed;
using MassTransit;
using Contracts.Users;
using Contracts.Folders; // Reference the new event namespace
using FileService.Application.Common.Exceptions;

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
    public class CreateFolderCommandHandler : IRequestHandler<CreateFolderCommand, Guid>
    {
        private readonly IApplicationDbContext _context;
        private readonly IDistributedCache _cache;
        private readonly IPublishEndpoint _publishEndpoint;
        private readonly IRequestClient<ValidateUsersRequest> _validateUsersClient;

        public CreateFolderCommandHandler(
            IApplicationDbContext context,
            IDistributedCache cache,
            IPublishEndpoint publishEndpoint,
            IRequestClient<ValidateUsersRequest> validateUsersClient)
        {
            _context = context;
            _cache = cache;
            _publishEndpoint = publishEndpoint;
            _validateUsersClient = validateUsersClient;
        }

        public async Task<Guid> Handle(CreateFolderCommand request, CancellationToken cancellationToken)
        {
            // 🔹 1. Safe Parsing & Validation
            if (string.IsNullOrWhiteSpace(request.DoctorId) || !long.TryParse(request.DoctorId, out var doctorIdLong))
                throw new ValidationException("A valid numeric DoctorId is required.");

            if (string.IsNullOrWhiteSpace(request.PatientId) || !long.TryParse(request.PatientId, out var patientIdLong))
                throw new ValidationException("A valid numeric PatientId is required.");

            // 🔹 2. External Validation (RPC)
            // We use the parsed long values here
            var response = await _validateUsersClient.GetResponse<ValidateUsersResponse>(
                new ValidateUsersRequest(DoctorId: doctorIdLong, PatientId: patientIdLong),
                cancellationToken
            );

            if (!response.Message.DoctorExists)
                throw new ValidationException($"Doctor with ID {request.DoctorId} does not exist.");

            if (!response.Message.PatientExists)
                throw new ValidationException($"Patient with ID {request.PatientId} does not exist.");

            // 🔹 3. Create Entity
            var entity = new Folder
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Type = request.Type,
                PatientId = request.PatientId, // Stored as string in this DB
                DoctorId = request.DoctorId,   // Stored as string in this DB
                CreatedAt = DateTime.UtcNow
            };

            _context.Folders.Add(entity);

            // 🔹 4. Publish Event (Using MassTransit Outbox is recommended here)
            // Notice we publish 'FolderCreated', NOT 'CreateFolderCommand'
            await _publishEndpoint.Publish(new FolderCreated(
                FolderId: entity.Id,
                Name: entity.Name,
                Type: entity.Type,
                PatientId: entity.PatientId,
                DoctorId: entity.DoctorId,
                CreatedAt: entity.CreatedAt
            ), cancellationToken);

            // 🔹 5. Save Changes
            // If using Outbox, the event is saved to DB here and sent later automatically
            await _context.SaveChangesAsync(cancellationToken);

            // 🔹 6. Invalidate Cache
            // We do this AFTER save ensures data is actually in DB
            await InvalidateCaches(entity, cancellationToken);

            return entity.Id;
        }

        private async Task InvalidateCaches(Folder folder, CancellationToken cancellationToken)
        {
            // Only invalidate if you are actually caching a "GetAll" list (often not recommended for large sets)
            // await _cache.RemoveAsync("folders:all", cancellationToken); 

            if (!string.IsNullOrEmpty(folder.PatientId))
            {
                // Invalidate the "GetFoldersByPatient" query
                await _cache.RemoveAsync($"folders:patient:{folder.PatientId}", cancellationToken);
            }

            if (!string.IsNullOrEmpty(folder.DoctorId))
            {
                // Invalidate the "GetFoldersByDoctor" query we wrote earlier
                await _cache.RemoveAsync($"folders:doctor:{folder.DoctorId}", cancellationToken);
            }
        }
    }
}