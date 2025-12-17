using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;
using UserService.Application.Common.Abstractions;
using UserService.Application.Common.Caching;
using UserService.Application.Common.Exceptions;
using UserService.Application.Common.Security;
using UserService.Application.DTOs;
using UserService.Application.Features.Patients.Queries.GetPatientById;
using UserService.Application.Features.Patients.Queries.GetPatients;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;

namespace UserService.Application.Features.Patients.Commands.CreatePatient;

public class CreatePatientHandler(
    IMapper _mapper , 
    IPatientRepository _patientRepository,
    IValidator<CreatePatientCommand> _validator,
    ICacheService _cacheService
    ) : IRequestHandler<CreatePatientCommand, PatientDTO>
{

    
    public async Task<PatientDTO> Handle(CreatePatientCommand request, CancellationToken cancellationToken)
    {
        var validationResult = await _validator.ValidateAsync(
            request,
            opt => opt.IncludeRuleSets("Create"), 
            cancellation: cancellationToken
            );

        if (!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);

        var patientCheck = await _patientRepository.GetPatientByEmailAsync(request.Email);
        
        if (patientCheck != null)
            throw new AlreadyExistsException($"Patient already exists");

        var patient = _mapper.Map<Patient>(request);
        
        var createdPatient = await _patientRepository.CreatePatientAsync(patient);
        
        await _cacheService.RemoveCacheByPrefix(nameof(GetPatientsQuery), cancellationToken);

        return _mapper.Map<PatientDTO>(createdPatient);
    }
}