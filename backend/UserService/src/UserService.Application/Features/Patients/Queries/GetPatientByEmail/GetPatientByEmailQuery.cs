using MediatR;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Patients.Queries.GetPatientByEmail;

public record GetPatientByEmailQuery(string Email) : IRequest<PatientDTO>;