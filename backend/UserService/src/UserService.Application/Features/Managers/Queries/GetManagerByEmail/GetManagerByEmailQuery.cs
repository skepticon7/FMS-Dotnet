using MediatR;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Managers.Queries.GetManagerByEmail;

public record GetManagerByEmailQuery(string Email) : IRequest<ManagerDTO>;