using AutoMapper;
using MediatR;
using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;
using UserService.Application.Common.Caching;
using UserService.Application.Common.Exceptions;
using UserService.Application.DTOs;
using UserService.Application.Features.Doctors.Queries.GetDoctorById;
using UserService.Application.Features.Doctors.Queries.GetDoctors;
using UserService.Application.Features.Doctors.Queries.GetDoctorsStats;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.Doctors.Commands.DeleteDoctor;

public class DeleteDoctorHandler(IDoctorRepository _doctorRepository , 
    IMapper _mapper,
    IDistributedCache _cache,
    ICacheService _cacheService
    ) : IRequestHandler<DeleteDoctorCommand, DoctorDTO>
{
    

    public async Task<DoctorDTO> Handle(DeleteDoctorCommand request, CancellationToken cancellationToken)
    {
        var doctor = await _doctorRepository.GetDoctorByIdAsync(request.Id, cancellationToken);
        if (doctor == null)
            throw new NotFoundException($"Doctor with id : {request.Id} doesn't exist");

        var deletedDoctor = await _doctorRepository.DeleteDoctorAsync(doctor, cancellationToken);

        var cacheKey = $"{nameof(GetDoctorByIdQuery)}:{JsonConvert.SerializeObject(new { deletedDoctor.Id })}";
        await _cache.RemoveAsync(cacheKey , cancellationToken);
        
        await _cacheService.RemoveCacheByPrefix(nameof(GetDoctorsQuery), cancellationToken);

        await _cacheService.RemoveCacheByPrefix(nameof(GetDoctorsStatsQuery), cancellationToken);

        return _mapper.Map<DoctorDTO>(deletedDoctor);
    }
}