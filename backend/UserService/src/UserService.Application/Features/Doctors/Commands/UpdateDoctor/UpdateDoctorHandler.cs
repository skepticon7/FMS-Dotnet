using AutoMapper;
using FluentValidation;
using MediatR;
using UserService.Application.Common.Exceptions;
using UserService.Application.Common.Security;
using UserService.Application.DTOs;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.Doctors.Commands.UpdateDoctor;

public class UpdateDoctorHandler(
    IDoctorRepository doctorRepository,
    IValidator<UpdateDoctorCommand> validator,
    IMapper mapper,
    IPasswordHasher hasher)
    : IRequestHandler<UpdateDoctorCommand, DoctorDTO?>
{
    private readonly IPasswordHasher _hasher = hasher;

    public async Task<DoctorDTO?> Handle(UpdateDoctorCommand request, CancellationToken cancellationToken)
    {
        var doctor = await doctorRepository.GetDoctorByIdAsync(request.Id);
        if (doctor == null)
            throw new NotFoundException($"Doctor with id {request.Id} doesn't exist");
        
        var validationResult = await validator.ValidateAsync(
            request,
            opt => opt.IncludeRuleSets("Update")
            );

        if (!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);    
        
        mapper.Map(request, doctor);

        if(request.Password != null)
            doctor.Password = _hasher.Hash(request.Password);
        
        var updatedDoctor = await doctorRepository.UpdateDoctorAsync(doctor);
        
        return mapper.Map<DoctorDTO>(updatedDoctor);
        
    }
}