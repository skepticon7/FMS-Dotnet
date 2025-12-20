using UserService.Application.DTOs;
using UserService.Application.Features.Doctors.Queries.GetDoctors;
using UserService.Domain.Entities;

namespace UserService.Application.Interfaces;

public interface IDoctorRepository
{
    Task<Doctor> CreateDoctorAsync(Doctor doctor , CancellationToken cancellationToken = default);
    Task<Doctor?> GetDoctorByIdAsync(long id , CancellationToken cancellationToken = default);
    Task<Doctor?> GetDoctorByEmailAsync(string email , CancellationToken cancellationToken = default);
    
    Task<Doctor> UpdateDoctorAsync(Doctor doctor , CancellationToken cancellationToken = default);
    
    Task<Doctor> DeleteDoctorAsync(Doctor doctor , CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<Doctor> items, int totalCount)> GetDoctorsAsync(GetDoctorsQuery query , CancellationToken cancellationToken = default);

    Task<DoctorStatsDTO> GetDoctorsStatsAsync(CancellationToken cancellationToken = default);
}