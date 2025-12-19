using Microsoft.AspNetCore.Http;

namespace FileService.Application.Common.Interfaces
{
    public interface IFileStorageService
    {
        // Uploads the file and returns the path/key where it is saved
        Task<string> SaveFileAsync(IFormFile file, string folderName);
        
        // Deletes the physical file (used for hard deletes or rollbacks)
        Task DeleteFileAsync(string filePath);
        
        // Gets the file stream (for downloading)
        Task<Stream> GetFileStreamAsync(string filePath);
    }
}