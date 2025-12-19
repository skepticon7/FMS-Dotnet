using MediatR;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Users.Queries;

public record GetUserByEmailQuery(string Email) : IRequest<UserDTO>;
