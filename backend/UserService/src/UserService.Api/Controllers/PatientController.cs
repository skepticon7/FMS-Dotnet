using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.Application.Features.Patients.Commands.CreatePatient;
using UserService.Application.Features.Patients.Commands.DeleteUpdate;
using UserService.Application.Features.Patients.Commands.UpdatePatient;
using UserService.Application.Features.Patients.Queries.GetPatientById;
using UserService.Application.Features.Patients.Queries.GetPatients;
using UserService.Application.Features.Patients.Queries.GetPatientsStats;

namespace UserService.Api.Controllers;

[ApiController]
[Route("api/patient")]
public class PatientController(IMediator _mediator) : ControllerBase
{

    [Authorize(Policy = "ManagerOnly")]
    [HttpPost("createPatient")]
    public async Task<IActionResult> CreatePatient([FromBody] CreatePatientCommand command)
    {
        var createdPatient = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetPatientById) , new { id = createdPatient.Id }, createdPatient);
    }

    [Authorize(Policy = "DoctorOrManager")]
    [HttpGet("getPatientById/{id}")]
    public async Task<IActionResult> GetPatientById(long Id)
    {
        var patient = await _mediator.Send(new GetPatientByIdQuery(Id));
        return Ok(patient);
    }

    [Authorize(Policy = "ManagerOnly")]
    [HttpGet("getPatients")]
    public async Task<IActionResult> GetPatients(
        [FromQuery] int page = 1,
        [FromQuery] string name = null,
        [FromQuery] List<string> bloodTypes = null,
        [FromQuery] List<string> genders = null
    )
    {
        return Ok(await _mediator.Send(
            new GetPatientsQuery
            {
                Page = page,
                BloodTypes = bloodTypes,
                Genders = genders,
                Name = name
            }));
    }
    
    [HttpGet("getPatientsStats")]
    [Authorize(Policy = "ManagerOnly")]
    public async Task<IActionResult> GetPatientsStats()
    {
        var stats = await _mediator.Send(new GetPatientsStatsQuery());
        return Ok(stats);
    }

    [Authorize(Policy = "ManagerOnly")]
    [HttpPatch("updatePatientById/{id}")]
    public async Task<IActionResult> UpdatePatientById(long id, [FromBody] UpdatePatientCommand command)
    {
        var updatedCommand = command with { Id = id };
        var updatedPatient = await _mediator.Send(updatedCommand);
        return Ok(updatedPatient);
    }

    [Authorize(Policy = "ManagerOnly")]
    [HttpDelete("deletePatientById/{id}")]
    public async Task<IActionResult> DeletePatientById(long id)
    {
        var deletedPatient = await _mediator.Send(new DeletePatientCommand(id));
        return Ok(deletedPatient);
    }
    
}