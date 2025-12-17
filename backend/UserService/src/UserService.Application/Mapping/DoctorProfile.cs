using AutoMapper;
using UserService.Application.DTOs;
using UserService.Application.Features.Doctors.Commands.UpdateDoctor;
using UserService.Application.Features.Users.Commands;
using UserService.Domain.Entities;

namespace UserService.Application.Mapping;

public class DoctorProfile : Profile
{
    public DoctorProfile()
    {
        CreateMap<CreateDoctorCommand, Doctor>();
        CreateMap<Doctor, DoctorDTO>();
        CreateMap<UpdateDoctorCommand, Doctor>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
    }
}