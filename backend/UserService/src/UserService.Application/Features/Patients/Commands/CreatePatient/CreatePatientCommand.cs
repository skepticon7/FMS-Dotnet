using MediatR;
using UserService.Application.Common.Abstractions;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Patients.Commands.CreatePatient;

public record CreatePatientCommand (
    string FirstName, 
    string LastName ,
    string Email , 
    string PhoneNumber , 
    DateTime BirthDate , 
    string Gender,
    string BloodType
    ) : IRequest<PatientDTO>;