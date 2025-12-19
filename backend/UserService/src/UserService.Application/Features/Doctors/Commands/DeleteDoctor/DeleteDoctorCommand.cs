using MediatR;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Doctors.Commands.DeleteDoctor;

public record DeleteDoctorCommand(long Id) : IRequest<DoctorDTO>;
