using Microsoft.Extensions.DependencyInjection;
namespace UserService.Api;

public static class DependencyInjection
{
    public static IServiceCollection AddPresentation(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddOptions();
        return services;
    }
}