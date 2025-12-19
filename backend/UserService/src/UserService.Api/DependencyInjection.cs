using System.Net;
using System.Security.Authentication.ExtendedProtection;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using RabbitMQ.Client;
using StackExchange.Redis;
using UserService.Api.Middleware;
using UserService.Api.Models;
using UserService.Application.Common.Exceptions;

namespace UserService.Api;

public static class DependencyInjection
{
    public static IServiceCollection AddPresentation(this IServiceCollection services , IConfiguration configuration)
    {
        services.AddEndpointsApiExplorer();
        services.AddTransient<ExceptionMiddleware>();
        services.AddControllers(); 
        services.AddOptions();

        var Issuer = configuration["Jwt:Issuer"];
        var Audience = configuration["Jwt:Audience"];
        var SecretKey = configuration["Jwt:SecretKey"];

        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidIssuer = Issuer,
                    ValidAudience = Audience,
                    ClockSkew = TimeSpan.Zero,
                    RoleClaimType = ClaimTypes.Role,
                    IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(SecretKey))
                };
                options.Events = new JwtBearerEvents
                {
                    OnChallenge = async context =>
                    {
                        context.HandleResponse();
                        context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                        context.Response.ContentType = "application/json";
                        var errorResponse = new ApiError
                        {
                            StatusCode = context.Response.StatusCode,
                            Message = "You are not authorized to access this resource."
                        };
                        await context.Response.WriteAsJsonAsync(errorResponse);
                    },
                    OnForbidden = context =>
                    {
                        throw new ForbiddenException("You do not have permission to access this resource.");
                    }
                };
            });
        
        services.AddAuthorization(options =>
        {
            options.AddPolicy("DoctorOrManager" , policy => policy.RequireRole("DOCTOR","MANAGER"));
            options.AddPolicy("DoctorOnly" , policy => policy.RequireRole("DOCTOR"));
            options.AddPolicy("ManagerOnly" , policy => policy.RequireRole("MANAGER"));
        });

        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = configuration["DefaultConnections:redis"];
        });
        
        services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect(configuration["DefaultConnections:redis"]!));
            
        return services;
    }
}