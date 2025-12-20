using System.Text.Json;
using MediatR;
using FileService.Application.DTOs;
using Microsoft.EntityFrameworkCore;
using FileService.Application.Common.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using FileService.Application.Common.Exceptions;

namespace FileService.Application.Features.Files.Queries.GetFileById
{
    public record GetFileByIdQuery(Guid Id) : IRequest<FileDto>;
    public class GetFileByIdQueryHandler 
        : IRequestHandler<GetFileByIdQuery, FileDto>
    {
        private readonly IApplicationDbContext _context;
        private readonly IDistributedCache _cache;
        public GetFileByIdQueryHandler(IApplicationDbContext context , IDistributedCache cache)
        {
            _context = context;
            _cache = cache;
        }
        
        public static readonly DistributedCacheEntryOptions CacheOptions = new()
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
        };
        public async Task<FileDto> Handle(
            GetFileByIdQuery request,
            CancellationToken cancellationToken)
        {
            var cacheKey = $"file:{request.Id}";
            var cached = await _cache.GetStringAsync(cacheKey, cancellationToken);
            if (cached != null)
            {
                Console.WriteLine($"[REDIS HIT] {cacheKey}");
                return JsonSerializer.Deserialize<FileDto>(cached)!;
            }
            var file = await _context.FileEntries
                .AsNoTracking()
                .Where(f => f.Id == request.Id && f.DeletedAt == null)
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
                .FirstOrDefaultAsync(cancellationToken);

            if (file == null)
            {
                throw new NotFoundException($"File with ID {request.Id} not found");
            }

            await _cache.SetStringAsync(
                cacheKey,
                JsonSerializer.Serialize(file),
                CacheOptions,
                cancellationToken);

            return file;
        }
    }
    
}