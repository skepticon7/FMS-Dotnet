using MediatR;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Patients.Commands.UpdatePatient;

public record UpdatePatientCommand(
    long Id,
    string? FirstName, 
    string? LastName ,
    string? Email , 
    string? PhoneNumber , 
    string? Password , 
    DateTime? BirthDate , 
    string? Gender,
    string? BloodType
    ) : IRequest<PatientDTO>; 