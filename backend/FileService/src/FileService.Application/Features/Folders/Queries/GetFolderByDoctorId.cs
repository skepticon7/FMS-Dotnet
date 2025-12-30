using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using FileService.Application.Common.Interfaces;
using FileService.Application.DTOs;
using MassTransit;
using Contracts.Users;
using FileService.Application.Common.Exceptions;
namespace FileService.Application.Features.Folders.Queries

{
    // 1️⃣ The Query
    // We return a List<FolderDto> because a doctor usually has multiple folders.
    public record GetFoldersByDoctorIdQuery(string DoctorId) : IRequest<List<FolderDto>>;

    // 2️⃣ The Handler
    public class GetFoldersByDoctorIdQueryHandler : IRequestHandler<GetFoldersByDoctorIdQuery, List<FolderDto>>
    {
        private readonly IApplicationDbContext _context;
        private readonly IDistributedCache _cache;
        private readonly IRequestClient<ValidateUsersRequest> _validateUsersClient;
        

        // Use a static options instance for performance
        private static readonly JsonSerializerOptions _jsonOptions = new() 
        { 
            PropertyNameCaseInsensitive = true 
        };

        public GetFoldersByDoctorIdQueryHandler(
            IApplicationDbContext context,
            IDistributedCache cache,
            IRequestClient<ValidateUsersRequest> validateUsersClient)
        {
            _context = context;
            _cache = cache;
            _validateUsersClient = validateUsersClient;
        }

        public async Task<List<FolderDto>> Handle(
            GetFoldersByDoctorIdQuery request,
            CancellationToken cancellationToken)
        {
            // 🔑 CRITICAL: This key matches the one we invalidate in CreateFolderCommandHandler
            var cacheKey = $"folders:doctor:{request.DoctorId}";

            // 🔹 1. Try Redis first
            var cached = await _cache.GetStringAsync(cacheKey, cancellationToken);
            if (!string.IsNullOrEmpty(cached))
            {
                return JsonSerializer.Deserialize<List<FolderDto>>(cached, _jsonOptions)!;
            }

            // 🔹 2. Query DB
            // We store IDs as strings in the Command, so we query as strings here
            var folders = await _context.Folders
                .AsNoTracking()
                .Where(f => f.DoctorId == request.DoctorId && f.DeletedAt == null)
                .OrderByDescending(f => f.CreatedAt) // Most recent folders first
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
            if (folders.Count == 0)
            {
                // We need to check if the doctor actually exists.
                // We must parse the ID to long because your contract requires it.
                if (!long.TryParse(request.DoctorId, out var doctorIdLong))
                {
                    // If the ID isn't even a number, it definitely doesn't exist in your SQL User DB.
                    throw new NotFoundException($"Doctor with ID '{request.DoctorId}' was not found (Invalid Format).");
                }

                // Call User Service via MassTransit
                // We pass -1 or 0 for PatientId because we don't care about patients in this specific query.
                var response = await _validateUsersClient.GetResponse<ValidateUsersResponse>(
                    new ValidateUsersRequest(DoctorId: doctorIdLong, PatientId: -1), 
                    cancellationToken
                );

                if (!response.Message.DoctorExists)
                {
                    // This creates a 404 response
                    throw new NotFoundException($"Doctor with ID '{request.DoctorId}' was not found.");
                }
                
                // If code reaches here, the Doctor exists but just has 0 folders.
                // We return the empty list [] correctly.
            }

            // 🔹 3. Cache result
            // We use a shorter expiration (e.g., 5 mins) for lists because they change often
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