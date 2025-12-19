using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.Application.Features.Managers.Commands.CreateManager;
using UserService.Application.Features.Managers.Commands.DeleteManager;
using UserService.Application.Features.Managers.Commands.UpdateManager;
using UserService.Application.Features.Managers.Queries.GetManagerById;

namespace UserService.Api.Controllers;

[ApiController]
[Route("api/manager")]
public class ManagerController(IMediator mediator) : ControllerBase
{
    private readonly IMediator _mediator = mediator;
    
    [Authorize(Policy = "ManagerOnly")]
    [HttpPost("createManager")]
    public async Task<IActionResult> CreateManager([FromBody] CreateManagerCommand command)
    {
        var managerDTO = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetManagerById), new { id = managerDTO.Id }, managerDTO);
    }
    
    [Authorize(Policy = "ManagerOnly")]
    [HttpGet("getManagerById/{id}")]
    public async Task<IActionResult> GetManagerById(long id)
    {
        var managerDTO = await _mediator.Send(new GetManagerByIdQuery(id));
        return Ok(managerDTO);
    }

    [Authorize(Policy = "ManagerOnly")]
    [HttpPatch("updateManagerById/{id}")]
    public async Task<IActionResult> UpdateManagerById(long id, [FromBody] UpdateManagerCommand command)
    {
        var updatedCommand = command with { Id = id };
        var managerDTO = await _mediator.Send(updatedCommand);
        return Ok(managerDTO);
    }

    [Authorize(Policy = "ManagerOnly")]
    [HttpDelete("deleteManagerById/{id}")]
    public async Task<IActionResult> DeleteManagerById(long id)
    {
        var deletedManager = await _mediator.Send(new DeleteManagerCommand(id));
        return Ok(deletedManager);
    }
    
}