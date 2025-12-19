using MediatR;
using UserService.Application.Common.Abstractions;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Doctors.Queries.GetDoctorById;

public record GetDoctorByIdQuery(long Id) : IQuery<DoctorDTO> , ICachedQuery;