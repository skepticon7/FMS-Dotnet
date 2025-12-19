using MediatR;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Managers.Commands.UpdateManager;

public record UpdateManagerCommand(
        long Id,
        string? FirstName, 
        string? LastName ,
        string? Email , 
        string? PhoneNumber ,
        string? Password,
        DateTime? BirthDate , 
        string? OfficeNo,
        string? Gender
    ) : IRequest<ManagerDTO>;