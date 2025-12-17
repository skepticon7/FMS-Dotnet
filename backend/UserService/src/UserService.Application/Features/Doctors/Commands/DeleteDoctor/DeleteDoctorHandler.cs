using AutoMapper;
using MediatR;
using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;
using UserService.Application.Common.Exceptions;
using UserService.Application.DTOs;
using UserService.Application.Features.Doctors.Queries.GetDoctorById;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.Doctors.Commands.DeleteDoctor;

public class DeleteDoctorHandler(IDoctorRepository _doctorRepository , 
    IMapper _mapper,
    IDistributedCache _cache
    ) : IRequestHandler<DeleteDoctorCommand, DoctorDTO>
{
    

    public async Task<DoctorDTO> Handle(DeleteDoctorCommand request, CancellationToken cancellationToken)
    {
        var doctor = await _doctorRepository.GetDoctorByIdAsync(request.Id);
        if (doctor == null)
            throw new NotFoundException($"Doctor with id : {request.Id} doesn't exist");

        var deletedDoctor = await _doctorRepository.DeleteDoctorAsync(doctor);

        var cacheKey = $"{nameof(GetDoctorByIdQuery)}:{JsonConvert.SerializeObject(new { deletedDoctor.Id })}";
        await _cache.RemoveAsync(cacheKey , cancellationToken);

        return _mapper.Map<DoctorDTO>(deletedDoctor);
    }
}