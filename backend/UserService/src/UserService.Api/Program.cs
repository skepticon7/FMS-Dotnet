using Microsoft.EntityFrameworkCore;
using Steeltoe.Discovery.Consul;
using Steeltoe.Discovery.Consul.Configuration;
using UserService.Api;
using UserService.Application;
using UserService.Infrastructure;
using UserService.Infrastructure.Persistence;
using Winton.Extensions.Configuration.Consul;
using Winton.Extensions.Configuration.Consul.Parsers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddInfrastructure();
builder.Services.AddPresentation();
builder.Services.AddApplication();

builder.Configuration.AddConsul("config/userservice", options =>
{
    options.ConsulConfigurationOptions = c => c.Address = new Uri("http://localhost:8500");
    options.Optional = false;
    options.ReloadOnChange = true;
});



var connectionString = builder.Configuration["DefaultConnection"];
Console.WriteLine($"Using {connectionString}");

builder.Services.AddDbContext<UserDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddConsulDiscoveryClient();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
    {
        var forecast = Enumerable.Range(1, 5).Select(index =>
                new WeatherForecast
                (
                    DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                    Random.Shared.Next(-20, 55),
                    summaries[Random.Shared.Next(summaries.Length)]
                ))
            .ToArray();
        return forecast;
    })
    .WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}