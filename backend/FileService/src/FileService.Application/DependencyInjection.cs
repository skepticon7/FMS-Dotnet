using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using MediatR; 

namespace FileService.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
           
            services.AddMediatR(Assembly.GetExecutingAssembly());

            services.AddAutoMapper(Assembly.GetExecutingAssembly());

            return services;
        }
    }
}