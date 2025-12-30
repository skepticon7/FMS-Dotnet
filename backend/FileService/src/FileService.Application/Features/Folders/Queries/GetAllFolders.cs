using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using FileService.Application.Common.Interfaces;
using FileService.Application.DTOs;

namespace FileService.Application.Features.Folders.Queries
{
    // 1️⃣ The Query: Returns a List of FolderDto
    public record GetAllFoldersQuery : IRequest<List<FolderDto>>;

    // 2️⃣ The Handler
    public class GetAllFoldersQueryHandler 
        : IRequestHandler<GetAllFoldersQuery, List<FolderDto>>
    {
        private readonly IApplicationDbContext _context;
        private readonly IDistributedCache _cache;

        public GetAllFoldersQueryHandler(
            IApplicationDbContext context, 
            IDistributedCache cache)
        {
            _context = context;
            _cache = cache;
        }

        private static readonly DistributedCacheEntryOptions CacheOptions = new()
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
        };

        public async Task<List<FolderDto>> Handle(
            GetAllFoldersQuery request, 
            CancellationToken cancellationToken)
        {
            // Define a key for the entire list
            var cacheKey = "folders:all";

            // 🔹 1. Try Redis first
            var cached = await _cache.GetStringAsync(cacheKey, cancellationToken);
            if (cached != null)
            {
                return JsonSerializer.Deserialize<List<FolderDto>>(cached)!;
            }

            // 🔹 2. Query DB
            var folders = await _context.Folders
                .AsNoTracking()
                .Where(f => f.DeletedAt == null) // Filter soft-deleted
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
            await _cache.SetStringAsync(
                cacheKey,
                JsonSerializer.Serialize(folders),
                CacheOptions,
                cancellationToken);

            return folders;
        }
    }
}