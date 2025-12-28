using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace UserService.Infrastructure.Persistence
{
    public class UserDbContextFactory : IDesignTimeDbContextFactory<UserDbContext>
    {
        public UserDbContext CreateDbContext(string[] args)
        {
            var connectionString = "Server=localhost;Database=user_serviceDB;User=root;Password=;";

            var optionsBuilder = new DbContextOptionsBuilder<UserDbContext>();
            optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));

            return new UserDbContext(optionsBuilder.Options);
        }
    }
}