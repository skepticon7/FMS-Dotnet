using FileService.Application.Common.Interfaces;
using FileService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace FileService.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
            : base(options) 
        { 
        }

        public DbSet<Folder> Folders => Set<Folder>();
        public DbSet<FileEntry> FileEntries => Set<FileEntry>();
        public DbSet<FileHistory> FileHistories => Set<FileHistory>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            
            builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            // --- 1. Folder Configuration ---
            builder.Entity<Folder>()
                .HasMany(f => f.Files)
                .WithOne(e => e.Folder)
                .HasForeignKey(e => e.FolderId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Folder>().HasQueryFilter(f => f.DeletedAt == null);

            // --- 2. FileEntry Configuration ---
            builder.Entity<FileEntry>()
                .HasMany(e => e.Histories)
                .WithOne(h => h.FileEntry)
                .HasForeignKey(h => h.FileEntryId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Store Enum as String (e.g., "MRI" instead of 3)
            builder.Entity<FileEntry>()
                .Property(e => e.FileType)
                .HasConversion<string>();
            builder.Entity<FileEntry>().HasQueryFilter(e => e.DeletedAt == null);

            // --- 3. FileHistory Configuration ---
            // Store Enum as String (e.g., "Created" instead of 0)
            builder.Entity<FileHistory>()
                .Property(e => e.Action)
                .HasConversion<string>();
        }
    }
}