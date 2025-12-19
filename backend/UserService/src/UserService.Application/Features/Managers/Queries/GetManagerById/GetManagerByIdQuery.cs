using MediatR;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Managers.Queries.GetManagerById;

public record GetManagerByIdQuery(long Id) : IRequest<ManagerDTO>;
