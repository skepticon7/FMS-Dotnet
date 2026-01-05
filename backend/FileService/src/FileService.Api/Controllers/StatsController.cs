using FileService.Application.Features.FilesFoldersStats.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FileService.Api.Controllers;

[Route("api/stats")]
public class StatsController(IMediator _mediator) : ControllerBase
{
    [Authorize(Policy = "ManagerOrDoctor")]
    [HttpGet("getManagerOrDoctorFilesAndFoldersStats")]
    public async Task<IActionResult> GetManagerFilesAndFoldersStats([FromQuery] long? id)
    {
        return Ok(await _mediator.Send(new GetFilesAndFoldersStats.GetFilesAndFoldersStatsByDoctorIdOrManagerQuery(id)));
    }
}