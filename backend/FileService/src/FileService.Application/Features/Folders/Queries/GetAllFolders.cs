using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using FileService.Application.Common.Interfaces;
using FileService.Application.DTOs;

namespace FileService.Application.Features.Folders.Queries
{
    public record GetAllFoldersQuery : IRequest<List<FolderDto>>;

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
            var cacheKey = "folders:all";

            // 🔹 1. FAST PATH: Try Redis first
            // We re-enabled this because we verified the DB logic works.
            var cached = await _cache.GetStringAsync(cacheKey, cancellationToken);
            if (cached != null)
            {
                // If found in cache, return immediately (skips DB)
                return JsonSerializer.Deserialize<List<FolderDto>>(cached)!;
            }

            // 🔹 2. SLOW PATH: Query DB
            // Only runs if cache is empty (expired or invalidated)
            var folders = await _context.Folders
                .AsNoTracking()
                .Where(f => f.DeletedAt == null)
                .Select(f => new FolderDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    Type = f.Type,
                    DoctorId = f.DoctorId,
                    PatientId = f.PatientId,
                    CreatedAt = f.CreatedAt,
                    
                    FileCount = f.Files.Count(fe => fe.DeletedAt == null) 
                })
                .ToListAsync(cancellationToken);

            await _cache.SetStringAsync(
                cacheKey,
                JsonSerializer.Serialize(folders),
                CacheOptions,
                cancellationToken);

            return folders;
        }
    }
}