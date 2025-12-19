using UserService.Application.Common.Abstractions;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Patients.Queries.GetPatientsStats;

public record GetPatientsStatsQuery() : IQuery<PatientStatsDTO>, ICachedQuery; 