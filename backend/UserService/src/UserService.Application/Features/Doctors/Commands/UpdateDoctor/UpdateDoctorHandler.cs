using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;
using UserService.Application.Common.Caching;
using UserService.Application.Common.Exceptions;
using UserService.Application.Common.Security;
using UserService.Application.DTOs;
using UserService.Application.Features.Doctors.Queries.GetDoctorById;
using UserService.Application.Features.Doctors.Queries.GetDoctors;
using UserService.Application.Features.Doctors.Queries.GetDoctorsStats;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.Doctors.Commands.UpdateDoctor;

public class UpdateDoctorHandler(
    IDoctorRepository doctorRepository,
    IValidator<UpdateDoctorCommand> validator,
    IMapper mapper,
    IPasswordHasher hasher,
    ICacheService _cacheService,
    IDistributedCache _cache
    )
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
        
        var cacheKey = $"{nameof(GetDoctorByIdQuery)}:{JsonConvert.SerializeObject(new { updatedDoctor.Id })}";
        await _cache.RemoveAsync(cacheKey, cancellationToken);

        await _cacheService.RemoveCacheByPrefix(nameof(GetDoctorsQuery), cancellationToken);
        await _cacheService.RemoveCacheByPrefix(nameof(GetDoctorsStatsQuery), cancellationToken);
        
        return mapper.Map<DoctorDTO>(updatedDoctor);
        
    }
}