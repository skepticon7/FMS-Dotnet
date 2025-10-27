using UserService.Domain.Common;
using UserService.Domain.Enums;

namespace UserService.Domain.Entities;

public class Manager : User , IAggregateRoot
{
    public string OfficeNo { get; set; } = default!;

    public Manager()
    {
        Role =  UserRole.Manager; 
    }
}