using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using FileService.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace FileService.Infrastructure.Storage
{
    public class AzureBlobStorageService : IAzureFileStorageService
    {
        private readonly BlobContainerClient _container;

        public AzureBlobStorageService(IConfiguration config)
        {
            var connectionString = config["AzureStorage:ConnectionString"];
            var containerName = config["AzureStorage:Container"];

            _container = new BlobContainerClient(connectionString, containerName);
            _container.CreateIfNotExists(PublicAccessType.None);
        }

        public async Task<string> SaveFileAsync(IFormFile file, string folderName)
        {
            // Create a unique cloud filename inside a folder-like structure
            var fileName = $"{folderName}/{Guid.NewGuid()}_{file.FileName}";
            
            var blob = _container.GetBlobClient(fileName);

            using var stream = file.OpenReadStream();
            await blob.UploadAsync(stream, overwrite: true);

            return fileName;  // cloud path (you store this in DB)
        }

        public async Task DeleteFileAsync(string filePath)
        {
            var blob = _container.GetBlobClient(filePath);
            await blob.DeleteIfExistsAsync();
        }

        public async Task<Stream> GetFileStreamAsync(string filePath)
        {
            var blob = _container.GetBlobClient(filePath);

            var response = await blob.DownloadStreamingAsync();
            return response.Value.Content;
        }
    }
}