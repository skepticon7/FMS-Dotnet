using MediatR;
using UserService.Application.Common.Exceptions;
using UserService.Application.DTOs;
using UserService.Application.Features.Doctors.Queries.GetDoctorById;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.Users.Queries.GetUserById;

public class GetDoctorByIdHandler : IRequestHandler<GetDoctorByIdQuery , DoctorDTO?>
{
    
    public readonly IDoctorRepository _DoctorRepository;

    public GetDoctorByIdHandler(IDoctorRepository doctorRepository) => _DoctorRepository = doctorRepository;
    
    public async Task<DoctorDTO?> Handle(GetDoctorByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _DoctorRepository.GetDoctorByIdAsync(request.Id);
        if (user == null) 
            throw new NotFoundException($"Doctor width id : {request.Id} not found.");

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