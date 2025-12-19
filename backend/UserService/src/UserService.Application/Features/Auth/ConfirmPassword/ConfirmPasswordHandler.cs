using MediatR;
using UserService.Application.Common.Exceptions;
using UserService.Application.Common.Security;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;

namespace UserService.Application.Features.Auth.ConfirmPassword;

public class ConfirmPasswordHandler(IPasswordHasher _hasher , IUserRepository _userRepository) : IRequestHandler<ConfirmPasswordCommand , bool>
{
    public async Task<bool> Handle(ConfirmPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetUserByIdAsync(request.Id);
        if(user == null)
            throw new NotFoundException($"user with id : {request.Id} not found");

        return _hasher.Verify(user.Password, request.Password);
    }
}