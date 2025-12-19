using AutoMapper;
using MediatR;
using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;
using UserService.Application.Common.Exceptions;
using UserService.Application.DTOs;
using UserService.Application.Features.Patients.Queries.GetPatientById;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.Patients.Commands.DeleteUpdate;

public class DeletePatientHandler(
    IMapper _mapper,
    IPatientRepository _patientRepository,
    IDistributedCache _cache
    ) : IRequestHandler<DeletePatientCommand , PatientDTO>
{
    
    
    public async Task<PatientDTO> Handle(DeletePatientCommand request, CancellationToken cancellationToken)
    {
        var patient = await _patientRepository.GetPatientByIdAsync(request.Id);
        if (patient == null)
            throw new NotFoundException($"Patient with id : {request.Id} not found");

        var deletedPatient = await _patientRepository.DeletePatientAsync(patient);

        var cacheKey = $"{nameof(GetPatientByIdQuery)}:{JsonConvert.SerializeObject(new { deletedPatient.Id })}";
        await _cache.RemoveAsync(cacheKey, cancellationToken);

        return _mapper.Map<PatientDTO>(deletedPatient);

    }
}