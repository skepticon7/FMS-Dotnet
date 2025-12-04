using MediatR;
using Microsoft.AspNetCore.Mvc;
using UserService.Application.Features.Doctors.Queries.GetDoctorById;
using UserService.Application.Features.Users.Commands;

namespace UserService.Api.Controllers;

[ApiController]
[Route("api/doctor")]
public class DoctorController : ControllerBase
{
    private readonly IMediator _mediator;

    public DoctorController(IMediator mediator) => _mediator = mediator;

    [HttpPost("createDoctor")]
    public async Task<IActionResult> CreateDoctor([FromBody] CreateDoctorCommand command)
    {
        Console.Write("hello postman fron create doctorController");
        var newDoctorDTO = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetDoctorById), new { id = newDoctorDTO.Id }, newDoctorDTO);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDoctorById(long id)
    {
        var doctorDTO = await _mediator.Send(new GetDoctorByIdQuery(id));
        return Ok(doctorDTO);
    }
    
}