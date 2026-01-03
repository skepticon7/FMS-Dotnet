using MediatR;
using FileService.Application.Common.Interfaces;
using FileService.Domain.Entities;
using Microsoft.Extensions.Caching.Distributed;
using MassTransit;
using Contracts.Folders; // Assuming FolderUpdated exists here
using FileService.Application.Common.Exceptions;
using Contracts.Users;

namespace FileService.Application.Features.Folders.Commands.UpdateFolder
{
    // 1️⃣ The Command
    // We need the ID to find it, and the fields we allow to be changed.
    public record UpdateFolderCommand(
        Guid Id,
        string Name,
        string? Type,
        string? PatientId,
        string? DoctorId
    ) : IRequest<Unit>;

    // 2️⃣ The Handler
    public class UpdateFolderCommandHandler : IRequestHandler<UpdateFolderCommand, Unit>
    {
        private readonly IApplicationDbContext _context;
        private readonly IDistributedCache _cache;
        private readonly IPublishEndpoint _publishEndpoint;
        private readonly IRequestClient<ValidateUsersRequest> _validateUsersClient; // 👈 Re-introduced

        public UpdateFolderCommandHandler(
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

        public async Task<Unit> Handle(UpdateFolderCommand request, CancellationToken cancellationToken)
        {
            // 🔹 1. Fetch Entity
            var entity = await _context.Folders
                .FindAsync(new object[] { request.Id }, cancellationToken);

            if (entity == null)
                throw new NotFoundException(nameof(Folder) + request.Id);

            // 🔹 2. Capture OLD IDs (Crucial for Cache Invalidation)
            var oldDoctorId = entity.DoctorId;
            var oldPatientId = entity.PatientId;

            // 🔹 3. Determine New IDs
            // Use the new one if provided, otherwise keep the old one
            var newDoctorIdStr = request.DoctorId ?? entity.DoctorId;
            var newPatientIdStr = request.PatientId ?? entity.PatientId;

            bool doctorChanged = newDoctorIdStr != oldDoctorId;
            bool patientChanged = newPatientIdStr != oldPatientId;

            // 🔹 4. Validate Users (Only if IDs changed)
            if (doctorChanged || patientChanged)
            {
                // Parse IDs safely
                if (!long.TryParse(newDoctorIdStr, out var doctorIdLong))
                    throw new ValidationException("Invalid DoctorId format.");
                
                if (!long.TryParse(newPatientIdStr, out var patientIdLong))
                    throw new ValidationException("Invalid PatientId format.");

                // RPC Call to Identity Service
                var response = await _validateUsersClient.GetResponse<ValidateUsersResponse>(
                    new ValidateUsersRequest(DoctorId: doctorIdLong, PatientId: patientIdLong),
                    cancellationToken
                );

                if (doctorChanged && !response.Message.DoctorExists)
                    throw new ValidationException($"Doctor with ID {newDoctorIdStr} does not exist.");

                if (patientChanged && !response.Message.PatientExists)
                    throw new ValidationException($"Patient with ID {newPatientIdStr} does not exist.");
            }

            // 🔹 5. Update Fields
            entity.Name = request.Name;
            entity.Type = request.Type;
            entity.DoctorId = newDoctorIdStr;
            entity.PatientId = newPatientIdStr;

            // 🔹 6. Publish Event
            await _publishEndpoint.Publish(new FolderUpdated(
                FolderId: entity.Id,
                Name: entity.Name,
                Type: entity.Type,
                PatientId: entity.PatientId,
                DoctorId: entity.DoctorId,
                UpdatedAt: DateTime.UtcNow
            ), cancellationToken);

            // 🔹 7. Save
            await _context.SaveChangesAsync(cancellationToken);

            // 🔹 8. Invalidate Caches (Complex)
            await InvalidateCaches(entity.Id, oldDoctorId, newDoctorIdStr, oldPatientId, newPatientIdStr, cancellationToken);

            return Unit.Value;
        }

        private async Task InvalidateCaches(
            Guid folderId, 
            string? oldDoc, string? newDoc, 
            string? oldPat, string? newPat, 
            CancellationToken ct)
        {
            // 1. Remove specific folder
            await _cache.RemoveAsync($"folder:{folderId}", ct);
            
            // 2. Remove "All" list
            await _cache.RemoveAsync("folders:all", ct);

            // 3. Clear Doctor Lists
            if (!string.IsNullOrEmpty(oldDoc)) 
                await _cache.RemoveAsync($"folders:doctor:{oldDoc}", ct); // Remove from old doctor
            if (!string.IsNullOrEmpty(newDoc) && newDoc != oldDoc) 
                await _cache.RemoveAsync($"folders:doctor:{newDoc}", ct); // Remove from new doctor (to refresh)

            // 4. Clear Patient Lists
            if (!string.IsNullOrEmpty(oldPat)) 
                await _cache.RemoveAsync($"folders:patient:{oldPat}", ct); // Remove from old patient
            if (!string.IsNullOrEmpty(newPat) && newPat != oldPat) 
                await _cache.RemoveAsync($"folders:patient:{newPat}", ct); // Remove from new patient
        }
    }
}