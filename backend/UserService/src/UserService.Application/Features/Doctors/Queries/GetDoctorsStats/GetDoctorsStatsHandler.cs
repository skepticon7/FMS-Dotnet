using Microsoft.VisualBasic;
using UserService.Application.Common.Abstractions;
using UserService.Application.DTOs;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.Doctors.Queries.GetDoctorsStats;

public class GetDoctorsStatsHandler(IDoctorRepository _doctorRepository) : IQueryHandler<GetDoctorsStatsQuery , DoctorStatsDTO>
{
    public async Task<DoctorStatsDTO> Handle(GetDoctorsStatsQuery request, CancellationToken cancellationToken)
    {
        return await _doctorRepository.GetDoctorsStatsAsync(cancellationToken);
    }
}