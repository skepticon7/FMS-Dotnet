namespace UserService.Application.DTOs;

public class PatientDTO : UserDTO
{
    public string BloodType { get; set; } = default!;
}