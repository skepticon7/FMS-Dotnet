using Microsoft.EntityFrameworkCore;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;
using UserService.Infrastructure.Persistence;

namespace UserService.Infrastructure.Repositories;

public class DoctorRepository : IDoctorService
{
    
    public readonly UserDbContext _context;
    
    public DoctorRepository(UserDbContext context) => _context = context;
    
    public async Task<Doctor> CreateDoctorAsync(Doctor doctor)
    {
        _context.Users.Add(doctor);
        await _context.AddRangeAsync();
        return doctor;
    }

    public async Task<Doctor?> GetDoctorByIdAsync(long id)
    {
        return await _context.Doctors.FindAsync(id);
    }

    public async Task<Doctor?> GetDoctorByEmailAsync(string email)
    {
        return await _context.Doctors.FirstOrDefaultAsync(u => u.Email == email);
    }
}