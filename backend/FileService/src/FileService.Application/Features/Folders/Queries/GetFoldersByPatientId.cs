using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using MassTransit; // 👈 Needed for RPC
using Contracts.Users; // 👈 Your shared contracts namespace
using FileService.Application.Common.Interfaces;
using FileService.Application.DTOs;
using FileService.Application.Common.Exceptions;
namespace FileService.Application.Features.Folders.Queries
{
    // 1️⃣ The Query
    public record GetFoldersByPatientIdQuery(string PatientId) : IRequest<List<FolderDto>>;

    // 2️⃣ The Handler
    public class GetFoldersByPatientIdQueryHandler 
        : IRequestHandler<GetFoldersByPatientIdQuery, List<FolderDto>>
    {
        private readonly IApplicationDbContext _context;
        private readonly IDistributedCache _cache;
        
        // 👇 Inject the MassTransit Client
        private readonly IRequestClient<ValidateUsersRequest> _validateUsersClient;

        // Static options for better performance
        private static readonly JsonSerializerOptions _jsonOptions = new() 
        { 
            PropertyNameCaseInsensitive = true 
        };

        public GetFoldersByPatientIdQueryHandler(
            IApplicationDbContext context,
            IDistributedCache cache,
            IRequestClient<ValidateUsersRequest> validateUsersClient) // 👈 Inject it here
        {
            _context = context;
            _cache = cache;
            _validateUsersClient = validateUsersClient;
        }

        public async Task<List<FolderDto>> Handle(
            GetFoldersByPatientIdQuery request,
            CancellationToken cancellationToken)
        {
            // 🔑 CRITICAL: This key matches the invalidation logic
            var cacheKey = $"folders:patient:{request.PatientId}";

            // 🔹 1. Try Redis first
            var cached = await _cache.GetStringAsync(cacheKey, cancellationToken);
            if (!string.IsNullOrEmpty(cached))
            {
                return JsonSerializer.Deserialize<List<FolderDto>>(cached, _jsonOptions)!;
            }

            // 🔹 2. Query DB
            var folders = await _context.Folders
                .AsNoTracking()
                .Where(f => f.PatientId == request.PatientId && f.DeletedAt == null)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FolderDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    Type = f.Type,
                    DoctorId = f.DoctorId,
                    PatientId = f.PatientId,
                    CreatedAt = f.CreatedAt
                })
                .ToListAsync(cancellationToken);

            // 🔹 3. "Verify-on-Empty" Logic
            if (folders.Count == 0)
            {
                // Parse ID to long (User Service requirement)
                if (!long.TryParse(request.PatientId, out var patientIdLong))
                {
                    // Invalid format = definitely doesn't exist
                    throw new NotFoundException($"Patient with ID '{request.PatientId}' was not found (Invalid Format).");
                }

                // Call User Service via MassTransit
                // Note: We pass -1 for DoctorId because we only care about the Patient here
                var response = await _validateUsersClient.GetResponse<ValidateUsersResponse>(
                    new ValidateUsersRequest(DoctorId: -1, PatientId: patientIdLong), 
                    cancellationToken
                );

                if (!response.Message.PatientExists)
                {
                    // This creates a 404 response (handled by your Middleware)
                    throw new NotFoundException($"Patient with ID '{request.PatientId}' was not found.");
                }

                // If code reaches here, the Patient exists but just has 0 folders.
                // We return the empty list [] correctly.
            }

            // 🔹 4. Cache result
            // Only cache if we found folders or verified the user exists
            await _cache.SetStringAsync(
                cacheKey,
                JsonSerializer.Serialize(folders, _jsonOptions),
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
                },
                cancellationToken);

            return folders;
        }
    }
}