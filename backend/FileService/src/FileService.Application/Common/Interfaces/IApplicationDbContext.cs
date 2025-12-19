using FileService.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FileService.Application.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<Folder> Folders { get; }
        DbSet<FileEntry> FileEntries { get; }
        DbSet<FileHistory> FileHistories { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}