using UserService.Domain.Entities;

namespace UserService.Application.Interfaces;

public interface IDoctorRepository
{
    Task<Doctor> CreateDoctorAsync(Doctor doctor);
    Task<Doctor?> GetDoctorByIdAsync(long id);
    Task<Doctor?> GetDoctorByEmailAsync(string email);
}