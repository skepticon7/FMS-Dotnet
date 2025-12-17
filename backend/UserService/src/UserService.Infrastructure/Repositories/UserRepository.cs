using Microsoft.EntityFrameworkCore;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;
using UserService.Infrastructure.Persistence;

namespace UserService.Infrastructure.Repositories;

public class UserRepository(UserDbContext context) : IUserRepository
{
    public async Task<User?> GetUserByEmailAsync(string Email)
    {
        return await context.Users.FirstOrDefaultAsync(u => u.Email == Email);
    }
}