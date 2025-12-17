using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using UserService.Application.Common.Caching;
using UserService.Application.Common.Security;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;
using UserService.Infrastructure.Cache;
using UserService.Infrastructure.Repositories;
using UserService.Infrastructure.Security;

namespace UserService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services , IConfiguration configuration)
    {
        services.AddScoped<ITokenProvider , TokenProvider>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
        services.AddScoped<IDoctorRepository, DoctorRepository>();
        services.AddScoped<IManagerRepository, ManagerRepository>();
        services.AddScoped<IPatientRepository, PatientRepository>();
        services.AddScoped<ICacheService, CacheService>();

        services.AddMassTransit(busConfigurator =>
        {
            busConfigurator.AddConsumers(typeof(DependencyInjection).Assembly);
            busConfigurator.SetKebabCaseEndpointNameFormatter();
            busConfigurator.UsingRabbitMq((context, configurator) =>
            {
                configurator.Host(configuration["DefaultConnections:rabbitmq:Host"]!, h =>
                {
                    h.Username(configuration["DefaultConnections:rabbitmq:Username"]!);
                    h.Password(configuration["DefaultConnections:rabbitmq:Password"]!);
                });
                configurator.ConfigureEndpoints(context);
            });
        });
        
        return services;
    }
}