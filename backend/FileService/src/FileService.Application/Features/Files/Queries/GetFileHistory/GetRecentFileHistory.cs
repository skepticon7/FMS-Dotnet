using System.Text.Json;
using MediatR;
using FileService.Application.DTOs;
using Microsoft.EntityFrameworkCore;
using FileService.Application.Common.Interfaces;
using Microsoft.Extensions.Caching.Distributed;

namespace FileService.Application.Features.Files.Queries.GetFileHistory
{
    // 1. The Request
    public record GetRecentFileHistoryQuery : IRequest<List<FileHistoryDto>>;

    // 2. The Handler
    public class GetRecentFileHistoryQueryHandler 
        : IRequestHandler<GetRecentFileHistoryQuery, List<FileHistoryDto>>
    {
        private readonly IApplicationDbContext _context;
        private readonly IDistributedCache _cache;

        public GetRecentFileHistoryQueryHandler(IApplicationDbContext context, IDistributedCache cache)
        {
            _context = context;
            _cache = cache;
        }

        // Cache short-lived (e.g., 2 mins) because history changes frequently
        public static readonly DistributedCacheEntryOptions CacheOptions = new()
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(2)
        };

        public async Task<List<FileHistoryDto>> Handle(
            GetRecentFileHistoryQuery request,
            CancellationToken cancellationToken)
        {
            var cacheKey = "history:recent";

            // A. Try Cache
            var cached = await _cache.GetStringAsync(cacheKey, cancellationToken);
            if (cached != null)
            {
                // Console.WriteLine($"[REDIS HIT] {cacheKey}");
                return JsonSerializer.Deserialize<List<FileHistoryDto>>(cached)!;
            }

            // B. Query Database (The "Last 10" Logic)
            var history = await _context.FileHistories
                .AsNoTracking()
                .Include(h => h.FileEntry) // Join to get FileName
                .OrderByDescending(h => h.Timestamp)
                .Take(10)
                .Select(h => new FileHistoryDto
                {
                    Id = h.Id,
                    FileId = h.FileEntryId,
                    // Handle potential nulls if a file was hard-deleted but history remains
                    FileName = h.FileEntry != null ? h.FileEntry.FileName : "Unknown File", 
                    Action = h.Action,
                    Notes = h.Notes,
                    Timestamp = h.Timestamp,
                    PerformedBy = h.PerformedBy
                })
                .ToListAsync(cancellationToken);

            // C. Set Cache
            await _cache.SetStringAsync(
                cacheKey,
                JsonSerializer.Serialize(history),
                CacheOptions,
                cancellationToken);

            return history;
        }
    }
}