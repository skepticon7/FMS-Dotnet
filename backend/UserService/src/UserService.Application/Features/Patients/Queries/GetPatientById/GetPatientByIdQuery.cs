using MediatR;
using UserService.Application.Common.Abstractions;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Patients.Queries.GetPatientById;

public record GetPatientByIdQuery(long Id) : IQuery<PatientDTO> , ICachedQuery;