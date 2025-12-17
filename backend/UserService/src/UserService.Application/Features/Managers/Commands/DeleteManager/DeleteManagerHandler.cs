using AutoMapper;
using MediatR;
using UserService.Application.Common.Exceptions;
using UserService.Application.DTOs;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;

namespace UserService.Application.Features.Managers.Commands.DeleteManager;

public class DeleteManagerHandler(IMapper mapper , IManagerRepository managerRepository) : IRequestHandler<DeleteManagerCommand , ManagerDTO>
{

    private readonly IMapper _mapper = mapper;
    private readonly IManagerRepository _managerRepository = managerRepository;
    
    public async Task<ManagerDTO> Handle(DeleteManagerCommand request, CancellationToken cancellationToken)
    {
        var manager = await _managerRepository.GetManagerByIdAsync(request.Id);
        if (manager == null)
            throw new NotFoundException($"Manager with id : {request.Id} not found");

        var deleteManager = await _managerRepository.DeleteManagerAsync(manager);

        return _mapper.Map<ManagerDTO>(deleteManager);
    }
}