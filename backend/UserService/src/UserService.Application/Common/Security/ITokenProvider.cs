using UserService.Domain.Entities;

namespace UserService.Application.Common.Security;

public interface ITokenProvider
{
    string GenerateToken(User user);
}