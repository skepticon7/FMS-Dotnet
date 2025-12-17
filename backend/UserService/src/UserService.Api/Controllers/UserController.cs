using MediatR;
using Microsoft.AspNetCore.Mvc;
using UserService.Application.DTOs;
using UserService.Application.Features.Auth;

namespace UserService.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class UserController(IMediator mediator) : ControllerBase
{

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var response = await mediator.Send(command);
        return Ok(response);
    }
    
}