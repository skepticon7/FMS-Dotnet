using AutoMapper;
using FluentValidation;
using MediatR;
using UserService.Application.Common.Exceptions;
using UserService.Application.Common.Security;
using UserService.Application.DTOs;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;

namespace UserService.Application.Features.Managers.Commands.CreateManager;

public class CreateManagerHandler(
    IManagerRepository managerRepository,
    IMapper mapper,
    IValidator<CreateManagerCommand> validator,
    IPasswordHasher hasher
    ) : IRequestHandler<CreateManagerCommand , ManagerDTO>
{

    
    private readonly IManagerRepository _managerRepository = managerRepository;
    private readonly IPasswordHasher _hasher = hasher;
    private readonly IMapper _mapper = mapper;
    private readonly IValidator<CreateManagerCommand> _validator = validator;
    
    
    public async Task<ManagerDTO> Handle(CreateManagerCommand request, CancellationToken cancellationToken)
    {
        var validationResult = await _validator.ValidateAsync(
            request,
            opt => opt.IncludeRuleSets("Create")
        );

        if (!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);

        var managerCheck = await _managerRepository.GetManagerByEmailAsync(request.Email);

        if (managerCheck != null)
            throw new AlreadyExistsException($"Manager already exists");

        var newManager = _mapper.Map<Manager>(request);

        newManager.Password = _hasher.Hash(request.Password);
        
        var createdManager = await _managerRepository.CreateManagerAsync(newManager);

        return _mapper.Map<ManagerDTO>(createdManager);
    }
}