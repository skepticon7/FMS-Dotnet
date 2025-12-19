using Microsoft.EntityFrameworkCore;
using UserService.Application.Features.Doctors.Queries.GetDoctors;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;
using UserService.Infrastructure.Persistence;

namespace UserService.Infrastructure.Repositories;

public class DoctorRepository : IDoctorRepository
{
    
    public readonly UserDbContext _context;
    
    public DoctorRepository(UserDbContext context) => _context = context;
    
    public async Task<Doctor> CreateDoctorAsync(Doctor doctor , CancellationToken cancellationToken = default)
    {
        _context.Doctors.Add(doctor);
        await _context.SaveChangesAsync(cancellationToken);
        return doctor;
    }

    public async Task<Doctor?> GetDoctorByIdAsync(long id , CancellationToken cancellationToken = default)
    {
        return await _context.Doctors.FindAsync(id , cancellationToken);
    }

    public async Task<Doctor?> GetDoctorByEmailAsync(string email , CancellationToken cancellationToken = default)
    {
        return await _context.Doctors.FirstOrDefaultAsync(u => u.Email == email , cancellationToken );
    }

    public async Task<Doctor> UpdateDoctorAsync(Doctor doctor , CancellationToken cancellationToken = default)
    {
        _context.Doctors.Update(doctor);
        await _context.SaveChangesAsync();
        return doctor;
    }

    public async Task<Doctor> DeleteDoctorAsync(Doctor doctor , CancellationToken cancellationToke = default)
    {
        _context.Doctors.Remove(doctor);
        await _context.SaveChangesAsync();
        return doctor;
    }

    public async Task<(IReadOnlyList<Doctor> items, int totalCount)> GetDoctorsAsync(GetDoctorsQuery query , CancellationToken cancellationToken = default)
    {
        IQueryable<Doctor> q = _context.Doctors.AsNoTracking();
        if (query.Speciality != null)
            q = q.Where(d => d.Speciality.ToString() == query.Speciality);
        if (query.Gender != null)
            q = q.Where(d => d.Gender.ToString() == query.Gender);
        if (query.AgeSort != null)
        {
            q = query.AgeSort == "asc" 
                ? q.OrderBy(d => d.BirthDate) 
                : q.OrderByDescending(d => d.BirthDate);
        }
        var totalCount = await q.CountAsync(cancellationToken);
        var items = await q.Skip((query.Page - 1) * 5)
            .Take(5)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}