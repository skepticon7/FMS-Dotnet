using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using FileService.Application.Common.Interfaces;
using FileService.Application.DTOs;
using FileService.Application.Common.Exceptions;

namespace FileService.Application.Features.Folders.Queries
{
    // 1️⃣ The Query
    public record GetFolderByIdQuery(Guid Id) : IRequest<FolderDto>;

    // 2️⃣ The Handler
    public class GetFolderByIdQueryHandler
        : IRequestHandler<GetFolderByIdQuery, FolderDto>
    {
        private readonly IApplicationDbContext _context;
        private readonly IDistributedCache _cache;
        

        public GetFolderByIdQueryHandler(
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

        public async Task<FolderDto> Handle(
            GetFolderByIdQuery request,
            CancellationToken cancellationToken)
        {
            var cacheKey = $"folder:{request.Id}";

            // 🔹 1. Try Redis first
            var cached = await _cache.GetStringAsync(cacheKey, cancellationToken);
            if (cached != null)
            {
                return JsonSerializer.Deserialize<FolderDto>(cached)!;
            }

            // 🔹 2. Query DB
            var folder = await _context.Folders
                .AsNoTracking()
                .Where(f => f.Id == request.Id && f.DeletedAt == null)
                .Select(f => new FolderDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    Type = f.Type,
                    DoctorId = f.DoctorId,
                    PatientId = f.PatientId,
                    CreatedAt = f.CreatedAt
                })
                .FirstOrDefaultAsync(cancellationToken);

            // 🔹 3. Not found
            if (folder == null)
            {
                throw new NotFoundException(
                    $"Folder with ID {request.Id} not found");
            }

            // 🔹 4. Cache result
            await _cache.SetStringAsync(
                cacheKey,
                JsonSerializer.Serialize(folder),
                CacheOptions,
                cancellationToken);

            return folder;
        }
    }
}
