using AutoMapper;
using UserService.Application.DTOs;
using UserService.Application.Features.Managers.Commands.CreateManager;
using UserService.Application.Features.Managers.Commands.UpdateManager;
using UserService.Domain.Entities;

namespace UserService.Application.Mapping;

public class ManagerProfile : Profile
{
    public ManagerProfile()
    {
        CreateMap<Manager, ManagerDTO>();
        CreateMap<CreateManagerCommand , Manager>();
        CreateMap<UpdateManagerCommand , Manager>()
             .ForAllMembers(opts => opts.Condition((src , dest , srcMember) => srcMember != null));
    }
}