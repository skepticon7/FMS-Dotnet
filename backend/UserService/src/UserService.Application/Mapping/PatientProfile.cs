using AutoMapper;
using UserService.Application.DTOs;
using UserService.Application.Features.Patients.Commands.CreatePatient;
using UserService.Application.Features.Patients.Commands.UpdatePatient;
using UserService.Domain.Entities;

namespace UserService.Application.Mapping;

public class PatientProfile : Profile
{
    public PatientProfile()
    {
        CreateMap<Patient , PatientDTO>();
        CreateMap<CreatePatientCommand, Patient>();
        CreateMap<UpdatePatientCommand, Patient>()
            .ForAllMembers(opts => opts.Condition((src , dest , srcMember) => srcMember != null));
    }
}