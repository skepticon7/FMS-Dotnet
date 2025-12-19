using Microsoft.EntityFrameworkCore;
using UserService.Domain.Entities;

namespace UserService.Infrastructure.Persistence;

public class UserDbContext : DbContext
{
    public UserDbContext(DbContextOptions<UserDbContext> options) : base(options) {}

    public DbSet<User> Users => Set<User>();
    
    public DbSet<Doctor> Doctors => Set<Doctor>();
    
    public DbSet<Patient> Patients => Set<Patient>();
    
    public DbSet<Manager> Managers => Set<Manager>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<User>(entity =>
        {

            entity.HasDiscriminator<string>("TYPE")
                .HasValue<Doctor>("DOCTOR")
                .HasValue<Patient>("PATIENT")
                .HasValue<Manager>("MANAGER");
         
            entity.ToTable("Users");

         
            entity.HasKey(u => u.Id);

            
            entity.Property(u => u.FirstName)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(u => u.LastName)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(100);


            entity.Property(u => u.PhoneNumber)
                .HasMaxLength(20);

            entity.Property(u => u.Gender)
                .HasConversion<string>();

            entity.Property(u => u.BirthDate)
                .HasColumnType("date");

            entity.Property(u => u.Password)
                .IsRequired(false)
                .HasMaxLength(255);

            entity.Property(u => u.CreatedAt).ValueGeneratedOnAdd();
            entity.Property(u => u.UpdatedAt).ValueGeneratedOnAddOrUpdate();

        });

        modelBuilder.Entity<Doctor>(entity =>
        {
            entity.Property(d => d.Speciality).HasConversion<string>().IsRequired();
            entity.Property(d => d.LicenseNo).HasMaxLength(15).IsRequired();
        });

        modelBuilder.Entity<Patient>(entity =>
        {
            entity.Property(p => p.BloodType).HasConversion<string>().IsRequired();
        });

        modelBuilder.Entity<Manager>(entity =>
        {
            entity.Property(m => m.OfficeNo).HasMaxLength(15).IsRequired();
        });


    }
}