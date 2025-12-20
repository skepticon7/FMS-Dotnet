using UserService.Application.Common.Abstractions;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Doctors.Queries.GetDoctorsStats;

public record GetDoctorsStatsQuery() : IQuery<DoctorStatsDTO> , ICachedQuery;