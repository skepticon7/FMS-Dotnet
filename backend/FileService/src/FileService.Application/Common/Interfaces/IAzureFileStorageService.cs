using Microsoft.AspNetCore.Http;
using System.IO;
using System.Threading.Tasks;

namespace FileService.Application.Common.Interfaces
{
    /// <summary>
    /// Dedicated interface for Azure Blob Storage operations
    /// </summary>
    public interface IAzureFileStorageService
    {
        /// <summary>
        /// Uploads a file to Azure Blob Storage
        /// </summary>
        /// <param name="file">The file to upload</param>
        /// <param name="folderName">The folder name or path in the container</param>
        /// <returns>The blob path in Azure</returns>
        Task<string> SaveFileAsync(IFormFile file, string folderName);

        /// <summary>
        /// Deletes a file from Azure Blob Storage
        /// </summary>
        /// <param name="filePath">The blob path to delete</param>
        Task DeleteFileAsync(string filePath);

        /// <summary>
        /// Retrieves a file as a stream from Azure Blob Storage
        /// </summary>
        /// <param name="filePath">The blob path</param>
        /// <returns>Stream of the file</returns>
        Task<Stream> GetFileStreamAsync(string filePath);
    }
}