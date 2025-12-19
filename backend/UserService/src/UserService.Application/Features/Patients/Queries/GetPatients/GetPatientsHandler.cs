using AutoMapper;
using UserService.Application.Common.Abstractions;
using UserService.Application.Common.Caching;
using UserService.Application.Common.Pagination;
using UserService.Application.DTOs;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.Patients.Queries.GetPatients;

public class GetPatientsHandler(
    IPatientRepository _patientRepository,
    IMapper _mapper
    ) : IQueryHandler<GetPatientsQuery , PagedResult<PatientDTO>>
{
    public async Task<PagedResult<PatientDTO>> Handle(GetPatientsQuery request, CancellationToken cancellationToken)
    {
        var (patients, totalCount) = await _patientRepository.GetPatientsAsync(request, cancellationToken);
        return new PagedResult<PatientDTO>()
        {
            Items = _mapper.Map<List<PatientDTO>>(patients),
            TotalCount = totalCount,
            Page = request.Page
        };
    }
}