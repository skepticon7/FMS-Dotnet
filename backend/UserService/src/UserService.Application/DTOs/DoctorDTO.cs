
namespace UserService.Application.DTOs;

public class DoctorDTO : UserDTO
{
    public string Specialty { get; set; } = default!;
    public string LicenseNo { get; set; } = default!;
}