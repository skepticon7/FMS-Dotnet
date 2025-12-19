using MediatR;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Users.Queries;

public class GetUserByEmailHandler : IRequestHandler<GetUserByEmailQuery , UserDTO>
{
    public Task<UserDTO> Handle(GetUserByEmailQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}