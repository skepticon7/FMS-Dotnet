using UserService.Application.Common.Abstractions;
using UserService.Application.DTOs;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.Patients.Queries.GetPatientsStats;

public class GetPatientsStatsHandler(IPatientRepository _patientRepository) : IQueryHandler<GetPatientsStatsQuery , PatientStatsDTO>
{
    public async Task<PatientStatsDTO> Handle(GetPatientsStatsQuery request, CancellationToken cancellationToken)
    {
        return await _patientRepository.GetPatientsStats([] , cancellationToken);
    }
}