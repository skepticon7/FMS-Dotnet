using Microsoft.Extensions.DependencyInjection;
using UserService.Api.Middleware;

namespace UserService.Api;

public static class DependencyInjection
{
    public static IServiceCollection AddPresentation(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddTransient<ExceptionMiddleware>();
        services.AddControllers(); 
        services.AddOptions();
        return services;
    }
}