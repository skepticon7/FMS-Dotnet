using System.Diagnostics;
using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;
using StackExchange.Redis;
using UserService.Application.Common.Abstractions;
using UserService.Application.Common.Caching;
using UserService.Application.Common.Exceptions;
using UserService.Application.Common.Security;
using UserService.Application.DTOs;
using UserService.Application.Features.Doctors.Queries.GetDoctorById;
using UserService.Application.Features.Doctors.Queries.GetDoctors;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;
using UserService.Domain.Enums;


namespace UserService.Application.Features.Users.Commands;

public class CreateDoctorHandler(
    IDoctorRepository doctorRepository,
    IValidator<CreateDoctorCommand> validator,
    IMapper mapper,
    IPasswordHasher hasher,
    ICacheService _cacheService
    )
    : IRequestHandler<CreateDoctorCommand, DoctorDTO>
{

    public async Task<DoctorDTO> Handle(CreateDoctorCommand request, CancellationToken cancellationToken)
    {

        var validationResult = await validator.ValidateAsync(
            request, 
            opt => opt.IncludeRuleSets("Create")
            );
        
        if(!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);
        
        
        var doctorCheck = await doctorRepository.GetDoctorByEmailAsync(request.Email);
        if(doctorCheck != null)
            throw new AlreadyExistsException("Doctor already exists.");

        var doctor = mapper.Map<Doctor>(request);
        
        doctor.Password = hasher.Hash(request.Password);

        var createdDoctor = await doctorRepository.CreateDoctorAsync(doctor);

        await _cacheService.RemoveCacheByPrefix(nameof(GetDoctorsQuery), cancellationToken);

        return mapper.Map<DoctorDTO>(createdDoctor);
    }
}