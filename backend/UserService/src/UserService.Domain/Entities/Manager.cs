using UserService.Domain.Common;
using UserService.Domain.Enums;

namespace UserService.Domain.Entities;

public class Manager : User
{
    public string OfficeNo { get; set; } = default!;
}