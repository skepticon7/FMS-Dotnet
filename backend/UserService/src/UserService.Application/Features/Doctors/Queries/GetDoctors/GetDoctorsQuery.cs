using UserService.Application.Common.Abstractions;
using UserService.Application.Common.Pagination;
using UserService.Application.DTOs;

namespace UserService.Application.Features.Doctors.Queries.GetDoctors;

public sealed class GetDoctorsQuery : IQuery<PagedResult<DoctorDTO>>, ICachedQuery
{
    public int Page { get; init;  }
    
    public string? Name { get; init;  }
    public List<string> Genders { get; init;  }
    public List<string> Specialities { get; init;  }
};