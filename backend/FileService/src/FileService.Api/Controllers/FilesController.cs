using FileService.Application.Features.Files.Commands.UploadFile;
using FileService.Application.Features.Files.Queries.GetFileById;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using FileService.Application.Features.Files.Commands.DeleteFile;
using FileService.Application.Features.Files.Commands.UpdateFile;

namespace FileService.Api.Controllers
{
    [ApiController]
    [Route("api/file")]
    public class FilesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public FilesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload([FromForm] UploadFileCommand command)
        {
            
            var fileId = await _mediator.Send(command);
            return Ok(new { Id = fileId });
        }

        [HttpGet("test")]
        public async Task<IActionResult> GetTest()
        {
            return Ok("hello world");
        }
        [HttpGet ("get/{id}")]
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
                PerformedBy: User.Identity?.Name ?? "system",
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
                PerformedBy: request.PerformedBy,
                Checksum: request.Checksum,
                Notes: request.Notes
            );

            await _mediator.Send(command);

            return NoContent(); // 204
        }
        
    }
}