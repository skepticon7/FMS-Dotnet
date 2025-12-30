using FileService.Application;
using FileService.Infrastructure;
using Steeltoe.Discovery.Consul;
using FileService.Api.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;


var builder = WebApplication.CreateBuilder(args);


var configSecret = builder.Configuration["JwtSettings:Secret"];
var jwtSecret = !string.IsNullOrEmpty(configSecret) && configSecret.Length >= 16
    ? configSecret
    : "super_secret_key_must_be_long_enough_for_fallback_12345";

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
        
            // Matches the "iss" in your token example
            ValidIssuer = "user-service", 
        
            // Matches the "aud" in your token example
            ValidAudience = "user-service-clients", 
        
            // The same secret key used by the User Service to sign the token
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        
            // Optional: ClockSkew handles server time differences (default is 5 mins)
            ClockSkew = TimeSpan.Zero ,
            RoleClaimType = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        };
        var jsonOptions = new System.Text.Json.JsonSerializerOptions
        {
            WriteIndented = true 
        };
        options.Events = new JwtBearerEvents
        {
            
            OnChallenge = context =>
            {
                // 1. Stop the default behavior (which is just an empty 401)
                context.HandleResponse();

                // 2. Set the custom response
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";

                var response = new
                {
                    status = 401,
                    error = "Unauthorized",
                    message = "You are not logged in or your token is invalid.",
                    detail = context.ErrorDescription // specific info like "The token expired"
                };

                // 3. Write JSON to the response
                return context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response , jsonOptions));
            },

            // Optional: Customize 403 Forbidden (access denied)
            OnForbidden = context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";

                var response = new
                {
                    status = 403,
                    error = "Forbidden",
                    message = "You do not have permission to access this resource."
                };

                return context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response , jsonOptions));
            }
        };
    });
builder.Services.AddAuthorization(options =>
{
    // 👇 Update this to include both casings
    options.AddPolicy("DoctorOrManager", policy => 
        policy.RequireRole("DOCTOR", "Doctor", "MANAGER", "Manager"));

    options.AddPolicy("DoctorOnly", policy => 
        policy.RequireRole("DOCTOR", "Doctor"));

    options.AddPolicy("ManagerOnly", policy => 
        policy.RequireRole("MANAGER", "Manager"));
});

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
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your valid token.\r\n\r\nExample: \"Bearer eyJhbGci...\""
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

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

app.UseAuthentication(); // 👈 Must be BEFORE UseAuthorization
app.UseAuthorization();

app.MapControllers();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}