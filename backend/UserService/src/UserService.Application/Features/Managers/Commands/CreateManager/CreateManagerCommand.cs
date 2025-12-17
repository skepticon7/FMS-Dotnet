using MediatR;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Managers.Commands.CreateManager;

public record CreateManagerCommand(
    string FirstName, 
    string LastName ,
    string Email , 
    string PhoneNumber , 
    string Password , 
    DateTime BirthDate , 
    string OfficeNo,
    string Gender
    ) : IRequest<ManagerDTO>;