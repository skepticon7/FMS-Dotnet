using AutoMapper;
using MediatR;
using UserService.Application.Common.Exceptions;
using UserService.Application.DTOs;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.Managers.Queries.GetManagerById;

public class GetManagerByIdHandler(IMapper mapper , IManagerRepository managerRepository) : IRequestHandler<GetManagerByIdQuery , ManagerDTO>
{

    private readonly IMapper _mapper = mapper;
    private readonly IManagerRepository _managerRepository = managerRepository;
    
    public async Task<ManagerDTO> Handle(GetManagerByIdQuery request, CancellationToken cancellationToken)
    {
        var manager = await _managerRepository.GetManagerByIdAsync(request.Id);
        if (manager == null)
            throw new NotFoundException($"Manager with id : {request.Id} doesn't exist");

        return _mapper.Map<ManagerDTO>(manager);
    }
}