using Microsoft.EntityFrameworkCore;
using UserService.Application.DTOs;
using UserService.Application.Features.Patients.Queries.GetPatients;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;
using UserService.Domain.Enums;
using UserService.Infrastructure.Persistence;

namespace UserService.Infrastructure.Repositories;

public class PatientRepository(UserDbContext _context) : IPatientRepository
{

    
    public async Task<Patient> CreatePatientAsync(Patient patient , CancellationToken cancellationToken)
    {
        _context.Patients.Add(patient);
        await _context.SaveChangesAsync(cancellationToken);
        return patient;
    }

    public async Task<Patient> UpdatePatientAsync(Patient patient , CancellationToken cancellationToken)
    {
        _context.Patients.Update(patient);
        await _context.SaveChangesAsync(cancellationToken);
        return patient;
    }

    public async Task<Patient?> GetPatientByIdAsync(long id , CancellationToken cancellationToken)
    {
        return await _context.Patients.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);
    }

    public async Task<Patient?> GetPatientByEmailAsync(string email , CancellationToken cancellationToken)
    {
        return await _context.Patients.FirstOrDefaultAsync(p => p.Email == email && !p.IsDeleted, cancellationToken: cancellationToken);
    }

    public async Task<Patient> DeletePatientAsync(Patient patient , CancellationToken cancellationToken)
    {
        patient.IsDeleted = true;
        _context.Patients.Update(patient);
        await _context.SaveChangesAsync(cancellationToken);
        return patient;
    }

    public async Task<(IReadOnlyList<Patient>, int totalCount)> GetPatientsAsync(
        List<long>? patientIds ,
        GetPatientsQuery query,
        CancellationToken cancellationToken)
    {
        
        
        IQueryable<Patient> q = _context.Patients
            .AsNoTracking().Where(p => !p.IsDeleted &&
                                       (patientIds == null || !patientIds.Any() || patientIds.Contains(p.Id)));
        
        if (query.Name != null)
        {
            q = q.Where(p =>
                p.FirstName.Contains(query.Name) ||
                p.LastName.Contains(query.Name) ||
                (p.FirstName + " " + p.LastName).Contains(query.Name)
            );
        }

        
        if (query.BloodTypes != null && query.BloodTypes.Any())
        {
            q = q.Where(p => query.BloodTypes.Contains(p.BloodType.ToString()));
        }

        if (query.Genders != null && query.Genders.Any())
        {
            q = q.Where(p => query.Genders.Contains(p.Gender.ToString()));
        }
        
        
        var totalCount = await q.CountAsync(cancellationToken);

        var items = await q
            .OrderByDescending(p => p.CreatedAt)
            .Skip((query.Page - 1) * 5)
            .Take(5)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<PatientStatsDTO> GetPatientsStats(List<long>? patientIds , CancellationToken cancellationToken)
    {
        var patients = _context.Patients.AsNoTracking()
            .Where(p => !p.IsDeleted &&
                        (patientIds == null || !patientIds.Any() || patientIds.Contains(p.Id)));
        
        var totalPatients = await patients.CountAsync(cancellationToken);

        if (totalPatients == 0)
        {
            return new PatientStatsDTO();
        }

        var commonBT = await patients
            .GroupBy(p => p.BloodType)
            .Select(g => new
            {
                BloodType = g.Key,
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .FirstAsync(cancellationToken);
        
        
        var commonBTPourcentage = (int)Math.Round(
            (double)commonBT.Count * 100 / totalPatients
        );

        var now = DateTime.UtcNow;
        var patientsThisMonth = await patients.CountAsync(
            p => p.CreatedAt.Year == now.Year && p.CreatedAt.Month == now.Month, cancellationToken: cancellationToken);
        
        var today = DateTime.UtcNow;

        var averageAge = await patients
            .Select(p => EF.Functions.DateDiffYear(p.BirthDate, now))
            .AverageAsync(cancellationToken);

        
        var maleCount = await patients.CountAsync(p => p.Gender == Gender.Male, cancellationToken);
        var femaleCount = await patients.CountAsync(p => p.Gender == Gender.Female, cancellationToken);
        
        var malePercentage = (int)Math.Round((double)maleCount * 100 / totalPatients);
        var femalePercentage = (int)Math.Round((double)femaleCount * 100 / totalPatients);

        Console.Write(commonBT.BloodType);
        
        return new PatientStatsDTO
        {
            MostCommonBloodType = commonBT.BloodType.ToString(),
            MostCommonBTPourcentage = commonBTPourcentage,
            PatientsThisMonth = patientsThisMonth,
            AverageAge = (int)Math.Round((double)averageAge!),
            GenderRatioMale = malePercentage,
            GenderRatioFemale = femalePercentage
        };

    }
}