using UserService.Domain.Enums;

namespace UserService.Domain.Entities;

public class Doctor : User
{ 
    public Speciality? Speciality { get; set; } 
    public string LicenseNo { get; set; } = default!;
}