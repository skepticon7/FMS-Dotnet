namespace UserService.Application.DTOs;

public class UserDTO
{
    public Guid Id { get; set; }
    public string firstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public DateTime createdAt { get; set; }
    public DateTime updatedAt { get; set; }
}