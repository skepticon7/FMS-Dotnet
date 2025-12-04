using System.Diagnostics;
using MediatR;
using UserService.Application.Common.Exceptions;
using UserService.Application.Common.Security;
using UserService.Application.DTOs;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;
using UserService.Domain.Enums;


namespace UserService.Application.Features.Users.Commands;

public class CreateDoctorHandler : IRequestHandler<CreateDoctorCommand , DoctorDTO>
{

    private readonly IDoctorRepository _doctorRepository;
    private readonly  IPasswordHasher _hasher;

    public CreateDoctorHandler(IDoctorRepository doctorRepository , IPasswordHasher hasher)
    {
        _doctorRepository = doctorRepository;
        _hasher = hasher;
    }

    public async Task<DoctorDTO> Handle(CreateDoctorCommand request, CancellationToken cancellationToken)
    {

        var doctorCheck = await _doctorRepository.GetDoctorByEmailAsync(request.Email);
        if(doctorCheck != null)
            throw new AlreadyExistsException("Doctor with this email already exists.");
        
        var doctor = new Doctor
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            Gender = Enum.Parse<Gender>(request.Gender, ignoreCase: true),
            BirthDate = request.BirthDate,
            Speciality = Enum.Parse<Speciality>(request.Speciality, ignoreCase: true),
            LicenseNo = request.LicenseNo,
            Password = _hasher.Hash(request.Password)
        };

        var createdDoctor = await _doctorRepository.CreateDoctorAsync(doctor);

        return new DoctorDTO
        {
            Id = createdDoctor.Id,
            FirstName = createdDoctor.FirstName,
            LastName = createdDoctor.LastName,
            Email = createdDoctor.Email,
            PhoneNumber = createdDoctor.PhoneNumber,
            Gender = createdDoctor.Gender.ToString(),
            BirthDate = createdDoctor.BirthDate,
            Specialty = createdDoctor.Speciality.ToString(),
            LicenseNo = createdDoctor.LicenseNo,
            createdAt = createdDoctor.CreatedAt,
            updatedAt = createdDoctor.UpdatedAt
        };
    }
}