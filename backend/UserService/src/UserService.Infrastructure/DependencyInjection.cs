using Contracts.Users;
using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using UserService.Application.Common.Caching;
using UserService.Application.Common.Security;
using UserService.Application.Interfaces;
using UserService.Application.Interfaces.Messaging;
using UserService.Infrastructure.Cache;
using UserService.Infrastructure.Messaging.Clients;
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
        services.AddScoped<IFileServiceClient, FileServiceClient>();
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
                
                configurator.UseMessageRetry(r =>
                {
                    r.Exponential(
                        retryLimit: 3,
                        minInterval: TimeSpan.FromSeconds(1),
                        maxInterval: TimeSpan.FromSeconds(10),
                        intervalDelta: TimeSpan.FromSeconds(2)
                    );
                });
                
                configurator.UseCircuitBreaker(cb =>
                {
                    cb.TrackingPeriod = TimeSpan.FromMinutes(1);
                    cb.TripThreshold = 15;
                    cb.ActiveThreshold = 10;
                    cb.ResetInterval = TimeSpan.FromMinutes(2);
                });
                
            });
            
            busConfigurator.AddRequestClient<GetPatientIdsByDoctorIdRequest>();
            busConfigurator.SetDefaultRequestTimeout(TimeSpan.FromSeconds(10));
        });
        
        return services;
    }
}