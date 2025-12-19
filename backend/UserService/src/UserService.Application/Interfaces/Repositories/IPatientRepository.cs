using UserService.Application.DTOs;
using UserService.Application.Features.Patients.Queries.GetPatients;
using UserService.Domain.Entities;

namespace UserService.Application.Interfaces;

public interface IPatientRepository
{
    Task<Patient> CreatePatientAsync(Patient patient , CancellationToken cancellationToken = default);
    Task<Patient> UpdatePatientAsync(Patient patient , CancellationToken cancellationToken = default);
    Task<Patient?> GetPatientByIdAsync(long id , CancellationToken cancellationToken = default);
    Task<Patient?> GetPatientByEmailAsync(string email , CancellationToken cancellationToken = default);
    Task<Patient> DeletePatientAsync(Patient patient , CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<Patient>, int totalCount)> GetPatientsAsync(GetPatientsQuery query,
        CancellationToken cancellationToken = default);
    
    Task<PatientStatsDTO> GetPatientsStats(CancellationToken cancellationToken = default);

}