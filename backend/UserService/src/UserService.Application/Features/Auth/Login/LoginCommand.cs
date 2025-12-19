using MediatR;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Auth;

public record LoginCommand(string Email, string Password) : IRequest<LoginResponseDTO>;
