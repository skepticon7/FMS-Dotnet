using AutoMapper;
using UserService.Application.Common.Abstractions;
using UserService.Application.Common.Exceptions;
using UserService.Application.Common.Pagination;
using UserService.Application.DTOs;
using UserService.Application.Features.Patients.Queries.GetPatients;
using UserService.Application.Interfaces;
using UserService.Application.Interfaces.Messaging;

namespace UserService.Application.Features.Patients.Queries.GetPatientsByDoctorId;

public class GetPatientsByDoctorIdHandler(
    IPatientRepository _patientRepository,
    IDoctorRepository _doctorRepository,
    IFileServiceClient _fileServiceClient,
    IMapper _mapper
    ) : IQueryHandler<GetPatientsByDoctorIdQuery , PagedResult<PatientDTO>>
{
    public async Task<PagedResult<PatientDTO>> Handle(GetPatientsByDoctorIdQuery request, CancellationToken cancellationToken)
    {
        var doctor = await _doctorRepository.GetDoctorByIdAsync(request.Id, cancellationToken);
        
        if(doctor == null)
            throw new NotFoundException($"Doctor with id {request.Id} not found");

        var patientIds = await _fileServiceClient.GetPatientIdsByDoctorAsync(doctor.Id);

        if (!patientIds.Any())
            return new PagedResult<PatientDTO>
            {
                Items = new List<PatientDTO>(),
                TotalCount = 0
            };
        
        var (patients , totalCount) = await _patientRepository.GetPatientsAsync(
            new GetPatientsQuery
            {
                Page = request.Page,
                Name = request.Name,
                BloodTypes = request.BloodTypes,
                Genders = request.Genders
            }
            , cancellationToken);

        return new PagedResult<PatientDTO>
        {
            Items = _mapper.Map<List<PatientDTO>>(patients),
            TotalCount = totalCount
        };


    }
}