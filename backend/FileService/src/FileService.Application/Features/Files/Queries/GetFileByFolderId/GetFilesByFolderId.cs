using System.Text.Json;
using MediatR;
using FileService.Application.DTOs;
using Microsoft.EntityFrameworkCore;
using FileService.Application.Common.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using FileService.Application.Common.Exceptions;

namespace FileService.Application.Features.Files.Queries.GetFilesByFolderId
{
    // 1️⃣ The Query: Requests a List of FileDto
    public record GetFilesByFolderIdQuery(Guid FolderId) : IRequest<List<FileDto>>;

    // 2️⃣ The Handler
    public class GetFilesByFolderIdQueryHandler 
        : IRequestHandler<GetFilesByFolderIdQuery, List<FileDto>>
    {
        private readonly IApplicationDbContext _context;
        private readonly IDistributedCache _cache;

        public GetFilesByFolderIdQueryHandler(IApplicationDbContext context, IDistributedCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public static readonly DistributedCacheEntryOptions CacheOptions = new()
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
        };

        public async Task<List<FileDto>> Handle(
            GetFilesByFolderIdQuery request,
            CancellationToken cancellationToken)
        {
            // 🔹 1. Check Cache
            // We use a distinct key pattern for the "list" of files
            var cacheKey = $"files:folder:{request.FolderId}";
            var cached = await _cache.GetStringAsync(cacheKey, cancellationToken);

            if (cached != null)
            {
                Console.WriteLine($"[REDIS HIT] {cacheKey}");
                return JsonSerializer.Deserialize<List<FileDto>>(cached)!;
            }

            // 🔹 2. Query Database
            // We filter by FolderId and ensure the file isn't deleted
            var files = await _context.FileEntries
                .AsNoTracking()
                .Where(f => f.FolderId == request.FolderId && f.DeletedAt == null)
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

            // 🔹 3. Set Cache
            // Even if the list is empty, we cache it to prevent hammering the DB for empty folders
            await _cache.SetStringAsync(
                cacheKey,
                JsonSerializer.Serialize(files),
                CacheOptions,
                cancellationToken);

            return files;
        }
    }
}