using AutoMapper;
using UserService.Application.Common.Abstractions;
using UserService.Application.DTOs;
using UserService.Application.Interfaces;
using UserService.Application.Interfaces.Messaging;

namespace UserService.Application.Features.Patients.Queries.GetPatientsStatsByDoctorId;

public class GetPatientsStatsByDoctorIdHandler(
    IPatientRepository _patientRepository,
    IFileServiceClient _fileServiceClient
    ) : IQueryHandler<GetPatientsStatsByDoctorIdQuery, PatientStatsDTO>
{
    public async Task<PatientStatsDTO> Handle(GetPatientsStatsByDoctorIdQuery request, CancellationToken cancellationToken)
    {
        var patientsIds = await _fileServiceClient.GetPatientIdsByDoctorAsync(request.DoctorId);

        Console.WriteLine("here in handler , patientIds : " + patientsIds.Count);
        
        return await _patientRepository.GetPatientsStatsForDoctor(patientsIds, cancellationToken);
    }
}