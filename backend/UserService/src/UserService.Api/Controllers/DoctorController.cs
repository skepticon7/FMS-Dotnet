using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.Application.Features.Doctors.Commands.DeleteDoctor;
using UserService.Application.Features.Doctors.Commands.UpdateDoctor;
using UserService.Application.Features.Doctors.Queries.GetDoctorById;
using UserService.Application.Features.Doctors.Queries.GetDoctors;
using UserService.Application.Features.Doctors.Queries.GetDoctorsStats;
using UserService.Application.Features.Users.Commands;

namespace UserService.Api.Controllers;

[ApiController]
[Route("api/doctor")]
public class DoctorController : ControllerBase
{
    private readonly IMediator _mediator;

    public DoctorController(IMediator mediator) => _mediator = mediator;

    [Authorize(Policy = "ManagerOnly")]
    [HttpPost("createDoctor")]
    public async Task<IActionResult> CreateDoctor([FromBody] CreateDoctorCommand command)
    {
        var newDoctorDTO = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetDoctorById), new { id = newDoctorDTO.Id }, newDoctorDTO);
    }

    [Authorize(Policy = "DoctorOrManager")]
    [HttpGet("getDoctorById/{id}")]
    public async Task<IActionResult> GetDoctorById(long id)
    {
        var doctorDTO = await _mediator.Send(new GetDoctorByIdQuery(id));
        return Ok(doctorDTO);
    }

    [Authorize(Policy = "ManagerOnly")]
    [HttpGet("getDoctors")]
    public async Task<IActionResult> GetDoctors(
        [FromQuery] int page = 1,
        [FromQuery] List<string> specialities = null,
        [FromQuery] List<string> genders = null,
        [FromQuery] string name = null
    )
    {
        return Ok(await _mediator.Send(
            new GetDoctorsQuery
            {
                Page = page,
                Specialities = specialities, 
                Name= name,
                Genders = genders
            }));
    }


    [Authorize(Policy = "ManagerOnly")]
    [HttpGet("getDoctorStats")]
    public async Task<IActionResult> GetDoctorStats()
    {
        return Ok(await _mediator.Send(new GetDoctorsStatsQuery()));
    }
    
    
    [Authorize(Policy = "ManagerOnly")]
    [HttpPatch("updateDoctorById/{id}")]
    public async Task<IActionResult> UpdateDoctorById(long id, [FromBody] UpdateDoctorCommand command)
    {
        var updatedCommand = command with { Id = id };
        var doctorDTO = await _mediator.Send(updatedCommand);
        return Ok(doctorDTO);
    }

    [Authorize(Policy = "ManagerOnly")]
    [HttpDelete("deleteDoctorById/{id}")]
    public async Task<IActionResult> DeleteDoctorById(long id)
    {
        var deleteDoctor = await _mediator.Send(new DeleteDoctorCommand(id));
        return Ok(deleteDoctor);
    }
    
}