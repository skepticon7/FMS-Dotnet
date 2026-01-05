using FileService.Application.Features.Files.Commands.UploadFile;
using FileService.Application.Features.Files.Queries.GetFileById;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using FileService.Application.Features.Files.Commands.DeleteFile;
using FileService.Application.Features.Files.Commands.UpdateFile;
using FileService.Application.Features.Files.Queries.GetAllFiles;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using FileService.Application.Features.Files.Queries.GetFileById.GatDashboardFiles;
using FileService.Application.Features.Files.Queries.GetFilesByFolderId;

namespace FileService.Api.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/file")]
    public class FilesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public FilesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // --- UPDATED HELPER METHOD ---
        private string GetPerformedBy()
        {
            var fullName = User.FindFirst("fullName")?.Value;

            return fullName 
                   ?? User.FindFirst(ClaimTypes.Email)?.Value 
                   ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                   ?? "System";
        }
        // -----------------------------

        [HttpPost("upload")]
        public async Task<IActionResult> Upload([FromForm] UploadFileCommand command)
        {
           
            var secureCommand = command with { UploadedBy = GetPerformedBy() };

            var fileId = await _mediator.Send(secureCommand);
            return Ok(new { Id = fileId });
        }

        

        [HttpGet("get/{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var file = await _mediator.Send(new GetFileByIdQuery(id));
            return Ok(file);
        }

        [HttpDelete("delete/{id:guid}")]
        public async Task<IActionResult> Delete(
            Guid id,
            [FromQuery] string? notes)
        {
            var command = new DeleteFileCommand(
                FileId: id,
                PerformedBy: GetPerformedBy(), // Will be "John Doe"
                Notes: notes
            );

            await _mediator.Send(command);

            return NoContent();
        }

        [HttpPut("update/{id:guid}")]
        public async Task<IActionResult> Update(
            Guid id,
            [FromBody] UpdateFileRequest request)
        {
            var command = new UpdateFileCommand(
                FileId: id,
                FileName: request.FileName,
                FileType: request.FileType,
                PerformedBy: GetPerformedBy(), // Will be "John Doe"
                Checksum: request.Checksum,
                Notes: request.Notes
            );

            await _mediator.Send(command);

            return NoContent(); 
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var files = await _mediator.Send(new GetAllFilesQuery());
            return Ok(files);
        }
        [HttpGet("get/folder/{folderId}")]
        [Authorize(Policy = "ManagerOrDoctor")] 
        public async Task<IActionResult> GetByFolderId(Guid folderId)
        {
            var files = await _mediator.Send(new GetFilesByFolderIdQuery(folderId));
            
            // Returns 200 OK with the list (even if empty)
            return Ok(files);
        }


        [HttpGet("getDashboardFiles")]
        [Authorize("ManagerOrDoctor")]
        public async Task<IActionResult> GetDashboardFiles([FromQuery] long? id)
        {
            Console.WriteLine("here : " + id);
            return Ok(await _mediator.Send(new GetDashboardFiles.GetDashboardFilesQuery(id)));
        }
        
    }
}