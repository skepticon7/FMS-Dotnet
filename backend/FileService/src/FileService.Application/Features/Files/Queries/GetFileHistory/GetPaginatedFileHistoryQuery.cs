using MediatR;
using FileService.Application.DTOs;
using Microsoft.EntityFrameworkCore;
using FileService.Application.Common.Interfaces;

namespace FileService.Application.Features.Files.Queries.GetPaginatedFileHistory
{
    public record GetPaginatedFileHistoryQuery(int PageNumber, int PageSize) : IRequest<List<FileHistoryDto>>;

    public class GetPaginatedFileHistoryQueryHandler : IRequestHandler<GetPaginatedFileHistoryQuery, List<FileHistoryDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetPaginatedFileHistoryQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<FileHistoryDto>> Handle(GetPaginatedFileHistoryQuery request, CancellationToken cancellationToken)
        {
            return await _context.FileHistories
                .AsNoTracking()
                
                // 👇 THIS IS THE MISSING LINE 👇
                .IgnoreQueryFilters() 
                // 👆 This forces EF Core to include "Deleted" files in the join
                
                .Include(h => h.FileEntry)
                .OrderByDescending(h => h.Timestamp) // Keeps newest on top
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(h => new FileHistoryDto
                {
                    Id = h.Id,
                    FileId = h.FileEntryId,
                    // Now this will correctly show the name even if deleted
                    FileName = h.FileEntry != null ? h.FileEntry.FileName : "Unknown/Hard Deleted",
                    Action = h.Action,
                    Notes = h.Notes,
                    Timestamp = h.Timestamp,
                    PerformedBy = h.PerformedBy
                })
                .ToListAsync(cancellationToken);
        }
    }
}