using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using FileService.Application.Common.Interfaces;
using FileService.Application.DTOs;

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

        // Static options for better performance
        private static readonly JsonSerializerOptions _jsonOptions = new() 
        { 
            PropertyNameCaseInsensitive = true 
        };

        public GetFoldersByPatientIdQueryHandler(
            IApplicationDbContext context,
            IDistributedCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task<List<FolderDto>> Handle(
            GetFoldersByPatientIdQuery request,
            CancellationToken cancellationToken)
        {
            // 🔑 CRITICAL: This key matches the invalidation logic in CreateFolderCommandHandler
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
                .OrderByDescending(f => f.CreatedAt) // Show newest folders first
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
            // 5 minute expiration is standard for lists that might change occasionally
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