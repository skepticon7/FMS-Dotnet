using Microsoft.Extensions.DependencyInjection;
using UserService.Application.Common.Security;
using UserService.Application.Interfaces;
using UserService.Infrastructure.Repositories;
using UserService.Infrastructure.Security;

namespace UserService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
        services.AddScoped<IDoctorService, DoctorRepository>();
        return services;
    }
}