using FileService.Application;
using FileService.Application.Common.Interfaces;
using FileService.Infrastructure;
using FileService.Infrastructure.Storage;
using Steeltoe.Discovery.Consul;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using FileService.Api.Middleware;
var builder = WebApplication.CreateBuilder(args);

// 1. Add Services from other layers
// This loads MediatR, AutoMapper, EF Core, FileStorage, etc.
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddConsulDiscoveryClient();

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = "localhost:6379"; // docker service name
    options.InstanceName = "FileService:";
});


// ADD THIS to enable wwwroot
builder.Services.AddDirectoryBrowser();
builder.Services.AddHttpContextAccessor();

// 2. Add API services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseStaticFiles();
app.UseRouting();



// 3. Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


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


app.UseAuthorization();

app.MapControllers();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}