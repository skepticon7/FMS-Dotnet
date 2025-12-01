using MediatR;
using UserService.Application.DTOs;
using UserService.Application.Features.Doctors.Queries.GetDoctorByEmail;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;

namespace UserService.Application.Features.Doctors.Queries.GetDoctorByEmail;

public class GetDoctorByEmailHandler : IRequestHandler<GetDoctorByEmailQuery , DoctorDTO?>
{

    public readonly IDoctorService _doctorService;

    public GetDoctorByEmailHandler(IDoctorService doctorService) => _doctorService = doctorService;
    
    public async Task<DoctorDTO?> Handle(GetDoctorByEmailQuery request, CancellationToken cancellationToken)
    {
        var user = await _doctorService.GetDoctorByEmailAsync(request.Email);
        if (user == null) return null;
        return new DoctorDTO
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            LicenseNo = user.LicenseNo,
            Specialty = user.Speciality.ToString(),
            createdAt = user.CreatedAt,
            updatedAt = user.UpdatedAt
        };
    }
}