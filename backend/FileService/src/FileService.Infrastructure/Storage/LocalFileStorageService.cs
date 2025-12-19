using FileService.Application.Common.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace FileService.Infrastructure.Storage
{
    public class LocalFileStorageService : IFileStorageService
    {
        private readonly IWebHostEnvironment _environment;

        public LocalFileStorageService(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public async Task<string> SaveFileAsync(IFormFile file, string folderName)
        {
            // 1. Create the base upload directory if it doesn't exist
            // Result: .../FileService.Api/wwwroot/uploads/
            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
            
            // 2. Create the specific subfolder (e.g. "patients")
            var specificFolder = Path.Combine(uploadsFolder, folderName);
            
            if (!Directory.Exists(specificFolder))
                Directory.CreateDirectory(specificFolder);

            // 3. Create a unique filename to prevent overwrites
            // e.g. "guid-report.pdf"
            var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(specificFolder, uniqueFileName);

            // 4. Save the file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return the relative path so we can save it in the DB
            // e.g. "uploads/patients/guid-report.pdf"
            return Path.Combine("uploads", folderName, uniqueFileName).Replace("\\", "/");
        }

        public Task DeleteFileAsync(string filePath)
        {
            var fullPath = Path.Combine(_environment.WebRootPath, filePath);
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
            return Task.CompletedTask;
        }

        public Task<Stream> GetFileStreamAsync(string filePath)
        {
            var fullPath = Path.Combine(_environment.WebRootPath, filePath);
            if (!File.Exists(fullPath))
            {
                throw new FileNotFoundException("File not found on disk.", fullPath);
            }

            return Task.FromResult<Stream>(new FileStream(fullPath, FileMode.Open, FileAccess.Read));
        }
    }
}