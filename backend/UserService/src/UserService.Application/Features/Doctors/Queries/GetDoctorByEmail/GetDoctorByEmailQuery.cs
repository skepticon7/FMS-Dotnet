using MediatR;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Doctors.Queries.GetDoctorByEmail;

public record GetDoctorByEmailQuery(string Email) : IRequest<DoctorDTO?>;