using MediatR;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Patients.Commands.DeleteUpdate;

public record DeletePatientCommand(long Id) : IRequest<PatientDTO>;