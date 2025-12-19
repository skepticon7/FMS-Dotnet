using AutoMapper;
using MediatR;
using UserService.Application.Common.Exceptions;
using UserService.Application.DTOs;
using UserService.Application.Features.Doctors.Queries.GetDoctorByEmail;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;

namespace UserService.Application.Features.Doctors.Queries.GetDoctorByEmail;

public class GetDoctorByEmailHandler(IMapper mapper , IDoctorRepository doctorRepository) : IRequestHandler<GetDoctorByEmailQuery , DoctorDTO?>
{

    private readonly IDoctorRepository _DoctorRepository = doctorRepository;
    private readonly IMapper _mapper = mapper;
    
    public async Task<DoctorDTO?> Handle(GetDoctorByEmailQuery request, CancellationToken cancellationToken)
    {
        var doctor = await _DoctorRepository.GetDoctorByEmailAsync(request.Email);
        if (doctor == null)
            throw new NotFoundException($"Doctor with email : {request.Email} not found");
        return _mapper.Map<DoctorDTO>(doctor);
    }
}