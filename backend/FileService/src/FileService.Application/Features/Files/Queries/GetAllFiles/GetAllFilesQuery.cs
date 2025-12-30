using System.Text.Json;
using MediatR;
using FileService.Application.DTOs;
using Microsoft.EntityFrameworkCore;
using FileService.Application.Common.Interfaces;
using Microsoft.Extensions.Caching.Distributed;

namespace FileService.Application.Features.Files.Queries.GetAllFiles
{
    // Request returns a List of FileDto
    public record GetAllFilesQuery : IRequest<List<FileDto>>;

    public class GetAllFilesQueryHandler 
        : IRequestHandler<GetAllFilesQuery, List<FileDto>>
    {
        private readonly IApplicationDbContext _context;
        private readonly IDistributedCache _cache;

        public GetAllFilesQueryHandler(IApplicationDbContext context, IDistributedCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public static readonly DistributedCacheEntryOptions CacheOptions = new()
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
        };

        public async Task<List<FileDto>> Handle(
            GetAllFilesQuery request,
            CancellationToken cancellationToken)
        {
            // Define a generic key for the full list
            var cacheKey = "files:all";
            
            // 1. Try to get from Cache
            var cached = await _cache.GetStringAsync(cacheKey, cancellationToken);
            if (cached != null)
            {
                Console.WriteLine($"[REDIS HIT] {cacheKey}");
                return JsonSerializer.Deserialize<List<FileDto>>(cached)!;
            }

            // 2. Query Database if Cache Miss
            var files = await _context.FileEntries
                .AsNoTracking()
                .Where(f => f.DeletedAt == null) // Filter out soft-deleted files
                .Select(f => new FileDto
                {
                    Id = f.Id,
                    FolderId = f.FolderId,
                    FileName = f.FileName,
                    ContentType = f.ContentType,
                    FileType = f.FileType,
                    Size = f.Size,
                    StoragePath = f.StoragePath,
                    Version = f.Version,
                    IsLatest = f.IsLatest,
                    UploadedAt = f.UploadedAt,
                    UploadedBy = f.UploadedBy
                })
                .ToListAsync(cancellationToken);

            // 3. Set Cache
            await _cache.SetStringAsync(
                cacheKey,
                JsonSerializer.Serialize(files),
                CacheOptions,
                cancellationToken);

            return files;
        }
    }
}