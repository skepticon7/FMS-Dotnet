using MediatR;
using UserService.Application.DTOs;
using UserService.Application.Features.Doctors.Queries.GetDoctorById;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.Users.Queries.GetUserById;

public class GetDoctorByIdHandler : IRequestHandler<GetDoctorByIdQuery , DoctorDTO?>
{
    
    public readonly IDoctorService _doctorService;

    public GetDoctorByIdHandler(IDoctorService doctorService) => _doctorService = doctorService;
    
    public async Task<DoctorDTO?> Handle(GetDoctorByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _doctorService.GetDoctorByIdAsync(request.Id);
        if (user == null) return null;

        return new DoctorDTO
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Specialty = user.Speciality.ToString(),
            LicenseNo = user.LicenseNo,
            createdAt = user.CreatedAt,
            updatedAt = user.UpdatedAt
        };
    }
}