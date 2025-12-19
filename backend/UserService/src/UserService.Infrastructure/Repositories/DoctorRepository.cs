using Microsoft.EntityFrameworkCore;
using UserService.Application.DTOs;
using UserService.Application.Features.Doctors.Queries.GetDoctors;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;
using UserService.Domain.Enums;
using UserService.Infrastructure.Persistence;

namespace UserService.Infrastructure.Repositories;

public class DoctorRepository(UserDbContext _context) : IDoctorRepository
{
    
    public async Task<Doctor> CreateDoctorAsync(Doctor doctor , CancellationToken cancellationToken = default)
    {
        _context.Doctors.Add(doctor);
        await _context.SaveChangesAsync(cancellationToken);
        return doctor;
    }

    public async Task<Doctor?> GetDoctorByIdAsync(long id , CancellationToken cancellationToken = default)
    {
        return await _context.Doctors.FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted  , cancellationToken);
    }

    public async Task<Doctor?> GetDoctorByEmailAsync(string email , CancellationToken cancellationToken = default)
    {
        return await _context.Doctors.FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted , cancellationToken );
    }

    public async Task<Doctor> UpdateDoctorAsync(Doctor doctor , CancellationToken cancellationToken = default)
    {
        _context.Doctors.Update(doctor);
        await _context.SaveChangesAsync(cancellationToken);
        return doctor;
    }

    public async Task<Doctor> DeleteDoctorAsync(Doctor doctor , CancellationToken cancellationToke = default)
    {
        doctor.IsDeleted = true;
        _context.Doctors.Update(doctor);
        await _context.SaveChangesAsync(cancellationToke);
        return doctor;
    }

    public async Task<(IReadOnlyList<Doctor> items, int totalCount)> GetDoctorsAsync(GetDoctorsQuery query , CancellationToken cancellationToken = default)
    {
        IQueryable<Doctor> q = _context.Doctors.AsNoTracking().Where(d => !d.IsDeleted);

        if (query.Name != null)
        {
            q = q.Where(p =>
                p.FirstName.Contains(query.Name) ||
                p.LastName.Contains(query.Name) ||
                (p.FirstName + " " + p.LastName).Contains(query.Name)
            );
        }

        if (query.Specialities != null && query.Specialities.Any())
        {
            q = q.Where(d => query.Specialities.Contains(d.Speciality.ToString()));
        }

        if (query.Genders != null && query.Genders.Any())
            q = q.Where(d => query.Genders.Contains(d.Gender.ToString()));
        
        var totalCount = await q.CountAsync(cancellationToken);
        var items = await q.Skip((query.Page - 1) * 5)
            .Take(5)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<DoctorStatsDTO> GetDoctorsStatsAsync(CancellationToken cancellationToken = default)
    {
        var doctors = _context.Doctors.AsNoTracking().Where(d => !d.IsDeleted);

        var totalDoctors = await doctors.CountAsync(cancellationToken);

        if (totalDoctors == 0)
            return new DoctorStatsDTO();

        var commonSpeciality = await doctors
            .GroupBy(d => d.Speciality)
            .Select(g => new { Speciality = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .FirstAsync(cancellationToken);

        var commonSpecPourcentage = (int)Math.Round((double)commonSpeciality.Count * 100 / totalDoctors);
        
        var now = DateTime.UtcNow;
        var doctorsThisMonth = await doctors.CountAsync(
            p => p.CreatedAt.Year == now.Year && p.CreatedAt.Month == now.Month, cancellationToken: cancellationToken);
        
        var today = DateTime.UtcNow;

        var averageAge = await doctors
            .Select(d => EF.Functions.DateDiffYear(d.BirthDate, now))
            .AverageAsync(cancellationToken);

        
        var maleCount = await doctors.CountAsync(p => p.Gender == Gender.Male, cancellationToken);
        var femaleCount = await doctors.CountAsync(p => p.Gender == Gender.Female, cancellationToken);
        
        var malePercentage = (int)Math.Round((double)maleCount * 100 / totalDoctors);
        var femalePercentage = (int)Math.Round((double)femaleCount * 100 / totalDoctors);
        
        return new DoctorStatsDTO
        {
            MostCommonSpeciality = commonSpeciality.Speciality.ToString(),
            MostCommonSpecPourcentage = commonSpecPourcentage,
            DoctorsThisMonth = doctorsThisMonth,
            AverageAge = (int)Math.Round((double)averageAge!),
            GenderRatioMale = malePercentage,
            GenderRatioFemale = femalePercentage
        };

    }
}