using AutoMapper;
using MediatR;
using UserService.Application.Common.Exceptions;
using UserService.Application.DTOs;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.Managers.Queries.GetManagerByEmail;

public class GetManagerByEmailHandler(IMapper mapper , IManagerRepository managerRepository) : IRequestHandler<GetManagerByEmailQuery, ManagerDTO>
{

    private readonly IManagerRepository _managerRepository = managerRepository;
    private readonly IMapper _mapper = mapper;
    
    public async Task<ManagerDTO> Handle(GetManagerByEmailQuery request, CancellationToken cancellationToken)
    {
        var manager = await _managerRepository.GetManagerByEmailAsync(request.Email);
        if(manager == null)
            throw new NotFoundException($"Manager with email : {request.Email} not found");
        return _mapper.Map<ManagerDTO>(manager);
    }
}
