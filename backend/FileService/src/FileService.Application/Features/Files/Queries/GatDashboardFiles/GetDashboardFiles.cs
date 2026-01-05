using Contracts.Users;
using FileService.Application.Common.Exceptions;
using FileService.Application.Common.Interfaces;
using FileService.Application.DTOs;
using MassTransit;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;

namespace FileService.Application.Features.Files.Queries.GetFileById.GatDashboardFiles;

public class GetDashboardFiles
{
    public record GetDashboardFilesQuery(long? DoctorId) : IRequest<List<FileDto>>;

    public class GetDashboardFilesHandler
        (
            IApplicationDbContext _context,
            IDistributedCache _cache,
            IRequestClient<ValidateUsersRequest> _validateUsersClient
                ) : IRequestHandler<GetDashboardFilesQuery, List<FileDto>>
    {
        public async Task<List<FileDto>> Handle(GetDashboardFilesQuery request, CancellationToken cancellationToken)
        {
            if (request.DoctorId != null)
            {
                var response = await _validateUsersClient.GetResponse<ValidateUsersResponse>(
                    new ValidateUsersRequest(DoctorId: request.DoctorId, PatientId: null),
                    cancellationToken
                );

                if (!response.Message.DoctorExists)
                    throw new NotFoundException($"Doctor with ID {request.DoctorId} does not exist.");
            }
            
          
            
            var files = await _context.FileEntries
                .AsNoTracking()
                .Where(f => request.DoctorId == null || f.Folder.DoctorId == request.DoctorId.ToString())
                .OrderByDescending(f => f.UploadedAt)
                .Take(5)
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
                
            
            return files;
        }
    }
}