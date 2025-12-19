using UserService.Domain.Common;
using UserService.Domain.Enums;

namespace UserService.Domain.Entities;

public class Patient : User
{
    public BloodType? BloodType { get; set; } = default!;
}