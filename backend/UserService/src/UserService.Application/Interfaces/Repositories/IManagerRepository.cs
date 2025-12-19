using UserService.Domain.Entities;

namespace UserService.Application.Interfaces;

public interface IManagerRepository
{
    Task<Manager> CreateManagerAsync(Manager manager);
    Task<Manager?> GetManagerByIdAsync(long id);
    Task<Manager?> GetManagerByEmailAsync(string email);
    Task<Manager> UpdateManagerAsync(Manager manager);
    Task<Manager> DeleteManagerAsync(Manager manager);
    
}