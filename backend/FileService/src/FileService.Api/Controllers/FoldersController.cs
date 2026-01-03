using FileService.Application.Features.Folders.Commands.CreateFolder;
using FileService.Application.Features.Folders.Commands.DeleteFolder;
using FileService.Application.Features.Folders.Commands.UpdateFolder;
using FileService.Application.Features.Folders.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization; // 👈 Needed for [Authorize]
using System.Security.Claims;
using Contracts.Folders;
namespace FileService.Api.Controllers

{
    [ApiController]
    [Authorize]
    [Route("api/folder")]
    public class FoldersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public FoldersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("create")]
        [Authorize(Policy = "ManagerOnly")]
        public async Task<IActionResult> Create(CreateFolderCommand command)
        {
            var folderId = await _mediator.Send(command);
            return Ok(new { Id = folderId });
        }
        [Authorize(Policy = "ManagerOrDoctor")]
        [HttpGet("get/{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var folder = await _mediator.Send(new GetFolderByIdQuery(id));
            return Ok(folder);
        }
        
        [HttpDelete("delete/{id}")]
        [Authorize(Policy = "ManagerOnly")]
        public async Task<IActionResult> Delete(
            Guid id,
            [FromQuery] string? notes)
        {
          
            var performedBy = User.FindFirst("fullName")?.Value;

            if (string.IsNullOrEmpty(performedBy))
            {
                performedBy = User.FindFirst(ClaimTypes.Name)?.Value;
        
                if (string.IsNullOrEmpty(performedBy))
                    performedBy = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;

                if (string.IsNullOrEmpty(performedBy))
                    performedBy = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "Unknown User";
            }

            await _mediator.Send(
                new DeleteFolderCommand(
                    FolderId: id,
                    PerformedBy: performedBy, 
                    Notes: notes
                ));

            return NoContent();
        }
        [HttpGet("get/doctor/{doctorId}")]
        [Authorize(Policy = "ManagerOrDoctor")]
        public async Task<IActionResult> GetByDoctorId(string doctorId)
        {
            // We pass the string ID directly to the query we just created
            var folders = await _mediator.Send(new GetFoldersByDoctorIdQuery(doctorId));
            
            // Returns 200 OK with the list (even if empty, which is correct for lists)
            return Ok(folders);
        }
        [HttpGet("get/patient/{patientId}")]
        [Authorize(Policy = "ManagerOrDoctor")]
        public async Task<IActionResult> GetByPatientId(string patientId)
        {
            var folders = await _mediator.Send(new GetFoldersByPatientIdQuery(patientId));
            return Ok(folders);
        }
        [HttpGet("all")]
        [Authorize(Policy = "ManagerOnly")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetAllFoldersQuery());
            return Ok(result);
        }
        [HttpPut("update/{id}")]
        [Authorize(Policy = "ManagerOnly")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFolderRequest request)
        {
            var command = new UpdateFolderCommand(
                Id: id,
                Name: request.Name,
                Type: request.Type,
                PatientId: request.PatientId, // 👈 Pass it through
                DoctorId: request.DoctorId    // 👈 Pass it through
            );

            await _mediator.Send(command);

            return NoContent();
        }
    }
}