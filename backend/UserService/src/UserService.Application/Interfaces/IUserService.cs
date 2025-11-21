using UserService.Domain.Entities;

namespace UserService.Application.Interfaces;

public interface IUserService
{
    Task<User> CreateUserAsync(User user);
    Task<User?> GetUserByIdAsync(Guid id);
    Task<User?> GetUserByEmailAsync(string email);
}