using MediatR;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Managers.Commands.DeleteManager;

public record DeleteManagerCommand(long Id) : IRequest<ManagerDTO>;