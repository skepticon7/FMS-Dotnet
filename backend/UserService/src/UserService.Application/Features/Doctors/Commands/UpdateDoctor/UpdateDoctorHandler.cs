using AutoMapper;
using FluentValidation;
using MediatR;
using UserService.Application.Common.Exceptions;
using UserService.Application.DTOs;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.Doctors.Commands.UpdateDoctor;

public class UpdateDoctorHandler : IRequestHandler<UpdateDoctorCommand , DoctorDTO?>
{

    private readonly IDoctorRepository _doctorRepository;
    private readonly IValidator<UpdateDoctorCommand> _validator;
    private readonly IMapper _mapper;

    public UpdateDoctorHandler(IDoctorRepository doctorRepository, IValidator<UpdateDoctorCommand> validator , IMapper mapper
        )
    {
        _doctorRepository = doctorRepository;
        _validator = validator;
        _mapper = mapper;
    }
    
    public async Task<DoctorDTO?> Handle(UpdateDoctorCommand request, CancellationToken cancellationToken)
    {
        var doctor = await _doctorRepository.GetDoctorByIdAsync(request.Id);
        if (doctor == null)
            throw new NotFoundException($"Doctor with id {request.Id} doesn't exist");
        
        var validationResult = await _validator.ValidateAsync(
            request,
            opt => opt.IncludeRuleSets("Update")
            );

        if (!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);    
        
        _mapper.Map(request, doctor);

        var updatedDoctor = await _doctorRepository.UpdateDoctorAsync(doctor);
        
        return _mapper.Map<DoctorDTO>(updatedDoctor);
        
        
     
    }
}