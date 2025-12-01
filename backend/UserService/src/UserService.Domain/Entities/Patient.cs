using UserService.Domain.Common;
using UserService.Domain.Enums;

namespace UserService.Domain.Entities;

public class Patient : User
{
    public string BloodType { get; set; } = default!;
}