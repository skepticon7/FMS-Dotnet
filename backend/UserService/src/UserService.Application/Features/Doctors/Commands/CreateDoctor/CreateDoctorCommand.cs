using System.Windows.Input;
using MediatR;
using UserService.Application.Common.Abstractions;
using UserService.Application.DTOs;
using UserService.Domain.Entities;

namespace UserService.Application.Features.Users.Commands;

public record CreateDoctorCommand(
    string FirstName, 
    string LastName ,
    string Email , 
    string PhoneNumber , 
    string Password , 
    DateTime BirthDate , 
    string Speciality ,
    string LicenseNo,
    string Gender
    ) : IRequest<DoctorDTO>;