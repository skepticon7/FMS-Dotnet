using Microsoft.EntityFrameworkCore;
using Steeltoe.Discovery.Consul;
using Steeltoe.Discovery.Consul.Configuration;
using UserService.Api;
using UserService.Api.Middleware;
using UserService.Application;
using UserService.Infrastructure;
using UserService.Infrastructure.Persistence;
using Winton.Extensions.Configuration.Consul;
using Winton.Extensions.Configuration.Consul.Parsers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();



builder.Configuration.AddConsul("config/connections", options =>
{
    options.ConsulConfigurationOptions = c => c.Address = new Uri("http://localhost:8500");
    options.Optional = false;
    options.ReloadOnChange = true;
});

builder.Configuration.AddConsul("config/jwt", options =>
{
    options.ConsulConfigurationOptions = c => c.Address = new Uri("http://localhost:8500");
    options.Optional = false;
    options.ReloadOnChange = true;
});

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddPresentation(builder.Configuration);
builder.Services.AddApplication();


var connectionString = builder.Configuration["DefaultConnections:user-service-db"];

builder.Services.AddDbContext<UserDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddConsulDiscoveryClient();

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.Run();

// app.UseHttpsRedirection();
