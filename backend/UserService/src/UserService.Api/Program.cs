using Steeltoe.Discovery.Consul;
using UserService.Domain.Common;
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();


builder.Services.AddConsulDiscoveryClient();

var app = builder.Build();




// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();



app.Run();
