using UserService.Application.Common.Abstractions;
using UserService.Application.Common.Pagination;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Doctors.Queries.GetDoctors;

public sealed class GetDoctorsQuery : IQuery<PagedResult<DoctorDTO>>, ICachedQuery
{
    public int Page { get; init;  }
    public string? Gender { get; init;  }
    public string? Speciality { get; init;  }
    public string? AgeSort { get; init;  }
};