using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using MediatR; 

namespace FileService.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            // --- FIX FOR MEDIATR V11 ---
            // The v11 package takes the assembly directly, without "cfg => ..."
            services.AddMediatR(Assembly.GetExecutingAssembly());

            services.AddAutoMapper(Assembly.GetExecutingAssembly());

            return services;
        }
    }
}