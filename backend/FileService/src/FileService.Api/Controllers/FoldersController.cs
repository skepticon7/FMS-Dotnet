using FileService.Application.Features.Folders.Commands.CreateFolder;
using FileService.Application.Features.Folders.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FileService.Api.Controllers
{
    [ApiController]
    [Route("api/folder")]
    public class FoldersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public FoldersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create(CreateFolderCommand command)
        {
            var folderId = await _mediator.Send(command);
            return Ok(new { Id = folderId });
        }
        [HttpGet("get/{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var folder = await _mediator.Send(new GetFolderByIdQuery(id));
            return Ok(folder);
        }
    }
}