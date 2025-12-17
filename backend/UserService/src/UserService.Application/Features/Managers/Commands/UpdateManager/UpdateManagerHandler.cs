using AutoMapper;
using FluentValidation;
using MediatR;
using UserService.Application.Common.Exceptions;
using UserService.Application.DTOs;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.Managers.Commands.UpdateManager;

public class UpdateManagerHandler(IMapper mapper , IManagerRepository managerRepository , IValidator<UpdateManagerCommand> validator) : IRequestHandler<UpdateManagerCommand , ManagerDTO>
{

    private readonly IMapper _mapper = mapper;
    private readonly IManagerRepository _managerRepository = managerRepository;
    private readonly IValidator<UpdateManagerCommand> _validator = validator;
    
    
    public async Task<ManagerDTO> Handle(UpdateManagerCommand request, CancellationToken cancellationToken)
    {
        var validationResult = await _validator.ValidateAsync(
            request,
            opt => opt.IncludeRuleSets("Update")
        );

        if (!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);

        var manager = await _managerRepository.GetManagerByIdAsync(request.Id);
        
        if (manager == null)
            throw new NotFoundException($"Manager with id : {request.Id} not found");
        
        Console.Write(request);

        _mapper.Map(request, manager);

        var updatedManager = await _managerRepository.UpdateManagerAsync(manager);

        return _mapper.Map<ManagerDTO>(updatedManager);

    }
}