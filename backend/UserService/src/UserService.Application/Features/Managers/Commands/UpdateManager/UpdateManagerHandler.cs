using AutoMapper;
using FluentValidation;
using MediatR;
using UserService.Application.Common.Exceptions;
using UserService.Application.Common.Security;
using UserService.Application.DTOs;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.Managers.Commands.UpdateManager;

public class UpdateManagerHandler(IMapper _mapper , IPasswordHasher _hasher, IManagerRepository _managerRepository , IValidator<UpdateManagerCommand> _validator) : IRequestHandler<UpdateManagerCommand , ManagerDTO>
{
    
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
        
        
        _mapper.Map(request, manager);
        
        if(request.Password != null)
            manager.Password = _hasher.Hash(request.Password);

        var updatedManager = await _managerRepository.UpdateManagerAsync(manager);

        return _mapper.Map<ManagerDTO>(updatedManager);

    }
}