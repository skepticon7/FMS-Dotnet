using UserService.Application.Common.Abstractions;
using UserService.Application.Common.Pagination;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Patients.Queries.GetPatients;

public sealed class GetPatientsQuery : IQuery<PagedResult<PatientDTO>>, ICachedQuery
{
    public int Page { get; init; }
    
    public string? Name { get; init; }
    public List<string> BloodTypes { get; init; }
    public List<string> Genders { get; init; }
}