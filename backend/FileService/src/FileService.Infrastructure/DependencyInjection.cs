using FileService.Application.Common.Interfaces;
using FileService.Infrastructure.Persistence;
using FileService.Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MassTransit;

namespace FileService.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseMySql(connectionString, 
                    ServerVersion.AutoDetect(connectionString)));

            services.AddScoped<IApplicationDbContext>(provider => 
                provider.GetRequiredService<ApplicationDbContext>());
            services.AddScoped<IFileStorageService, LocalFileStorageService>();
            services.AddScoped<IAzureFileStorageService, AzureBlobStorageService>();
            services.AddMassTransit(x =>
            {
                // If you had consumers (listeners) in this service, you would register them here:
                // x.AddConsumer<MyFileCreatedConsumer>();

                x.UsingRabbitMq((context, cfg) =>
                {
                    // Configure Host
                    cfg.Host(configuration["RabbitMQ:HostName"] ?? "localhost", "/", h =>
                    {
                        h.Username(configuration["RabbitMQ:UserName"] ?? "guest");
                        h.Password(configuration["RabbitMQ:Password"] ?? "guest");
                    });

                    // Automatically configure endpoints for any consumers registered above
                    cfg.ConfigureEndpoints(context);
                });
            });
            return services;
        }
    }
}