
namespace UserService.Application.DTOs;

public class DoctorDTO : UserDTO
{
    public string Speciality { get; set; } = default!;
    public string LicenseNo { get; set; } = default!;
}