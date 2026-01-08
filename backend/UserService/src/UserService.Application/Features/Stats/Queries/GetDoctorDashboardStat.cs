using MediatR;
using UserService.Application.Common.Abstractions;
using UserService.Application.DTOs;
using UserService.Application.Interfaces;
using UserService.Application.Interfaces.Messaging;

namespace UserService.Application.Features.Stats.Queries;

public class GetDoctorDashboardStat
{
    public record GetDoctorDashboardStatsByDoctorIdQuery(long DoctorId) : IRequest<DoctorDashboardStatDTO>;


    public class GetDoctorDashboardStatsByDoctorIdHandler
        (
            IFileServiceClient fileServiceClient,
            IPatientRepository patientRepository
        )
        : IRequestHandler<GetDoctorDashboardStatsByDoctorIdQuery, DoctorDashboardStatDTO>
    {
        public async Task<DoctorDashboardStatDTO> Handle(GetDoctorDashboardStatsByDoctorIdQuery request, CancellationToken cancellationToken)
        {
            var patientIds = await fileServiceClient.GetPatientIdsByDoctorAsync(request.DoctorId);

            var patientsCount = await patientRepository.GetPatientsCount(patientIds , cancellationToken);
            
            return new DoctorDashboardStatDTO
            {
                ActivePatients = patientsCount
            };
        }
    }
}