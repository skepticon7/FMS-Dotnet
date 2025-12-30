using UserService.Application.Common.Abstractions;
using UserService.Application.Common.Pagination;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Patients.Queries.GetPatientsStatsByDoctorId;

public record GetPatientsStatsByDoctorIdQuery(long DoctorId) : IQuery<PatientStatsDTO> , ICachedQuery;