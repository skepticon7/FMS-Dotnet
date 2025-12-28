using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using FileService.Application.Common.Interfaces;
using FileService.Application.DTOs;

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

        // Use a static options instance for performance
        private static readonly JsonSerializerOptions _jsonOptions = new() 
        { 
            PropertyNameCaseInsensitive = true 
        };

        public GetFoldersByDoctorIdQueryHandler(
            IApplicationDbContext context,
            IDistributedCache cache)
        {
            _context = context;
            _cache = cache;
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