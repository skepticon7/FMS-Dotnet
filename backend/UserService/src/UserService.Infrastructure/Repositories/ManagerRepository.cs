using Microsoft.EntityFrameworkCore;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;
using UserService.Infrastructure.Persistence;

namespace UserService.Infrastructure.Repositories;

public class ManagerRepository(UserDbContext userDbContext) : IManagerRepository
{

    private readonly UserDbContext _context = userDbContext;
    public async Task<Manager> CreateManagerAsync(Manager manager)
    {
        _context.Managers.Add(manager);
        await _context.SaveChangesAsync();
        return manager;
    }

    public async Task<Manager?> GetManagerByIdAsync(long id)
    {
        return await _context.Managers.FindAsync(id);
    }

    public async Task<Manager?> GetManagerByEmailAsync(string email)
    {
        return await _context.Managers.FirstOrDefaultAsync(m => m.Email == email);
    }

    public async Task<Manager> UpdateManagerAsync(Manager manager)
    {
        _context.Managers.Update(manager);
        await _context.SaveChangesAsync();
        return manager;
    }

    public async Task<Manager> DeleteManagerAsync(Manager manager)
    {
        _context.Managers.Remove(manager);
        await _context.SaveChangesAsync();
        return manager;
    }
}