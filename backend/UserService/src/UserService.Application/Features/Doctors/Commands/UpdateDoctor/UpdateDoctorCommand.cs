using MediatR;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Doctors.Commands.UpdateDoctor;

public record UpdateDoctorCommand(
    long Id,
    string? FirstName, 
    string? LastName ,
    string? Email , 
    string? PhoneNumber , 
    DateTime? BirthDate , 
    string? Speciality ,
    string? LicenseNo,
    string? Gender
    ) : IRequest<DoctorDTO>;