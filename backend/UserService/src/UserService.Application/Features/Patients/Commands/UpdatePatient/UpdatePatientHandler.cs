using System.Xml.XPath;
using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.VisualBasic;
using Newtonsoft.Json;
using UserService.Application.Common.Caching;
using UserService.Application.Common.Exceptions;
using UserService.Application.DTOs;
using UserService.Application.Features.Patients.Queries.GetPatientById;
using UserService.Application.Features.Patients.Queries.GetPatients;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.Patients.Commands.UpdatePatient;

public class UpdatePatientHandler(
        IMapper _mapper,
        IPatientRepository _patientRepository,
        IValidator<UpdatePatientCommand> _validator,
        IDistributedCache _cache,
        ICacheService _cacheService
) : IRequestHandler<UpdatePatientCommand , PatientDTO>
{


    
    public async Task<PatientDTO> Handle(UpdatePatientCommand request, CancellationToken cancellationToken)
    {
        var validationResult = await _validator.ValidateAsync(
            request,
            opt => opt.IncludeRuleSets("Update")
        );

        if (!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);

        var patient = await _patientRepository.GetPatientByIdAsync(request.Id);
        
        if(patient == null)
            throw new NotFoundException($"Patient with id : {request.Id} not found");

        _mapper.Map(request, patient);

        var updatedPatient = await _patientRepository.UpdatePatientAsync(patient);

        var cacheKey = $"{nameof(GetPatientByIdQuery)}:{JsonConvert.SerializeObject(new { updatedPatient.Id })}";
        await _cache.RemoveAsync(cacheKey, cancellationToken);
        
        await _cacheService.RemoveCacheByPrefix(nameof(GetPatientsQuery), cancellationToken);

        return _mapper.Map<PatientDTO>(updatedPatient);

    }
}