using MediatR;
using UserService.Application.Common.Abstractions;
using UserService.Application.DTOs;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;

namespace UserService.Application.Features.Stats.Queries;

public class GetManagerDashboardStat
{
    public record GetManagerDashboardStatQuery : IRequest<ManagerDashboardStatDTO>;

    public class GetManagerDashboardStatHandler
        (IDoctorRepository _doctorRepository) 
        : IRequestHandler<GetManagerDashboardStatQuery, ManagerDashboardStatDTO>
    {
        public async Task<ManagerDashboardStatDTO> Handle(GetManagerDashboardStatQuery request, CancellationToken cancellationToken)
        {
            var activeDoctors = await _doctorRepository.GetDoctorsCount(cancellationToken);
            return new ManagerDashboardStatDTO
            {
                ActiveDoctors = activeDoctors
            };
        }
    }
}