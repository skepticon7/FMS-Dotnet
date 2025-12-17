using MediatR;

namespace UserService.Application.DTOs;

public class ManagerDTO : UserDTO, IRequest
{
    public string OfficeNo { get; set; } = default!;
}