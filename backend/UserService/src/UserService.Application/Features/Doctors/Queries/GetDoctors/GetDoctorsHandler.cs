using AutoMapper;
using UserService.Application.Common.Abstractions;
using UserService.Application.Common.Pagination;
using UserService.Application.DTOs;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.Doctors.Queries.GetDoctors;

public class GetDoctorsHandler(
    IDoctorRepository _doctorRepository,
    IMapper mapper
    ) : IQueryHandler<GetDoctorsQuery , PagedResult<DoctorDTO>>
{
    public async Task<PagedResult<DoctorDTO>> Handle(GetDoctorsQuery request, CancellationToken cancellationToken)
    {
        var (doctors, totalCount) = await _doctorRepository.GetDoctorsAsync(request, cancellationToken);
        return new PagedResult<DoctorDTO>
        {
            Items = mapper.Map<IReadOnlyList<DoctorDTO>>(doctors),
            TotalCount = totalCount,
            Page = request.Page
        };
    }
}