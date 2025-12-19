using MediatR;

namespace UserService.Application.Features.Auth.ConfirmPassword;

public record ConfirmPasswordCommand(string Password , long Id) : IRequest<bool>;