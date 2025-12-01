using UserService.Domain.Common;
using UserService.Domain.Enums;

namespace UserService.Domain.Entities;

public class User : BaseEntity
{
    public long Id { get; protected set; }
    public string FirstName { get; set; } = default!;
    public string LastName { get; set; } = default!;
    public string Email { get; set; } = default!;
    
    public DateTime BirthDate { get; set; }

    public Gender Gender { get; set; }
    public string PhoneNumber { get; set; } = default!;
    public string Password { get; set; } = default!;
    public DateTime CreatedAt { get; protected set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; protected set; } = DateTime.UtcNow;
    
}