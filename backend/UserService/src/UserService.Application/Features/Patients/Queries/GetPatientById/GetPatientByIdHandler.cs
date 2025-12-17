using AutoMapper;
using MediatR;
using UserService.Application.Common.Abstractions;
using UserService.Application.Common.Exceptions;
using UserService.Application.DTOs;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.Patients.Queries.GetPatientById;

public class GetPatientByIdHandler(
        IMapper _mapper,
        IPatientRepository patientRepository
    ) : IQueryHandler<GetPatientByIdQuery , PatientDTO> 
{
    
    
    public async Task<PatientDTO> Handle(GetPatientByIdQuery request, CancellationToken cancellationToken)
    {
        var patient = await patientRepository.GetPatientByIdAsync(request.Id);
        if (patient == null)
            throw new NotFoundException($"Patient with id : {request.Id} not found");
        return _mapper.Map<PatientDTO>(patient);
    }
}