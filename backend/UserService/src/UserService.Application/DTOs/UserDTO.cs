namespace UserService.Application.DTOs;

public class UserDTO
{
    public long Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    
    public DateTime BirthDate { get; set; }

    public string Gender { get; set; }
    public string PhoneNumber { get; set; }
    public DateTime createdAt { get; set; }
    public DateTime updatedAt { get; set; }
}