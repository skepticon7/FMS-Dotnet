using System.Text.Json;
using System.Text.Json.Nodes;
using FileService.Application.Common.Interfaces;
using FileService.Application.DTOs;
using FileService.Application.Features.Files.Queries.GetAllFiles;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;

namespace FileService.Application.Features.FilesFoldersStats.Queries;

public class GetFilesAndFoldersStats
{
    public record GetFilesAndFoldersStatsByDoctorIdOrManagerQuery(long? DoctorId) : IRequest<ManagerOrDoctorDashboardStatsDTO>;

    public class GetFilesAndFoldersStatsByDoctorIdOrManagerHandler
        : IRequestHandler<GetFilesAndFoldersStatsByDoctorIdOrManagerQuery, ManagerOrDoctorDashboardStatsDTO>
    {
        
        private readonly IApplicationDbContext _context;

        public GetFilesAndFoldersStatsByDoctorIdOrManagerHandler(
            IApplicationDbContext context, 
            IDistributedCache cache)
        {
            _context = context;
        }
        
        public async Task<ManagerOrDoctorDashboardStatsDTO> Handle(GetFilesAndFoldersStatsByDoctorIdOrManagerQuery request, CancellationToken cancellationToken)
        {
            
            
            var query = _context.Folders
                .AsNoTracking()
                .Where(f => request.DoctorId == null || f.DoctorId == request.DoctorId.ToString());

            var totalFolders = await query.CountAsync(cancellationToken);

            var totalFiles = await query.SelectMany(f => f.Files).CountAsync(cancellationToken);

            var totalSize = query.Where(f => f.DeletedAt == null).SelectMany(f => f.Files).Sum(fi => fi.Size);

            var stats = new ManagerOrDoctorDashboardStatsDTO
            {
                TotalFolders = totalFolders,
                TotalFiles = totalFiles,
                TotalSize = totalSize
            };
            
                return stats;

        }
    }
}