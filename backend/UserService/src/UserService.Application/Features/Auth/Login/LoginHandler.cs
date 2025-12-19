using MediatR;
using UserService.Application.Common.Exceptions;
using UserService.Application.Common.Security;
using UserService.Application.DTOs;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.Auth;

public class LoginHandler(ITokenProvider _tokenProvider , IUserRepository _userRepository , IPasswordHasher _hasher) : IRequestHandler<LoginCommand , LoginResponseDTO>
{
    public async Task<LoginResponseDTO> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetUserByEmailAsync(request.Email);
        
        if (user == null || !_hasher.Verify(user.Password, request.Password))
            throw new InvalidCredentialsException("Invalid email or password");

        var token = _tokenProvider.GenerateToken(user);
        
        return new LoginResponseDTO
        {
            Token = token
        };
    }
}