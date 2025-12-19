using AutoMapper;
using MediatR;
using UserService.Application.Common.Exceptions;
using UserService.Application.DTOs;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;

namespace UserService.Application.Features.Patients.Queries.GetPatientByEmail;

public class GetPatientByEmailHandler(
        IMapper mapper,
        IPatientRepository patientRepository
    ) : IRequestHandler<GetPatientByEmailQuery , PatientDTO>
{

    private readonly IPatientRepository _patientRepository = patientRepository;
    private readonly IMapper _mapper = mapper;
    
    public async Task<PatientDTO> Handle(GetPatientByEmailQuery request, CancellationToken cancellationToken)
    {
        var patient = await _patientRepository.GetPatientByEmailAsync(request.Email);
        if (patient == null)
            throw new NotFoundException($"Patient with email : {request.Email} not found");
        return _mapper.Map<PatientDTO>(patient);
    }
}