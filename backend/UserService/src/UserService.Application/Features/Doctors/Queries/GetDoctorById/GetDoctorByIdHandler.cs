using AutoMapper;
using MediatR;
using UserService.Application.Common.Abstractions;
using UserService.Application.Common.Exceptions;
using UserService.Application.DTOs;
using UserService.Application.Features.Doctors.Queries.GetDoctorById;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.Users.Queries.GetUserById;

public class GetDoctorByIdHandler(IDoctorRepository doctorRepository, IMapper mapper)
    : IQueryHandler<GetDoctorByIdQuery, DoctorDTO?>
{
    
    public readonly IDoctorRepository _DoctorRepository = doctorRepository;
    public readonly IMapper _mapper = mapper;

    public async Task<DoctorDTO?> Handle(GetDoctorByIdQuery request, CancellationToken cancellationToken)
    {
        var doctor = await _DoctorRepository.GetDoctorByIdAsync(request.Id);
        if (doctor == null) 
            throw new NotFoundException($"Doctor width id : {request.Id} not found.");
        return _mapper.Map<DoctorDTO>(doctor);
    }
}