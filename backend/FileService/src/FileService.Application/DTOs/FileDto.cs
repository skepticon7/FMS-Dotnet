using FileService.Domain.Enums;

namespace FileService.Application.DTOs
{
    public class FileDto
    {
        public Guid Id { get; set; }
        public Guid FolderId { get; set; }
        public string FileName { get; set; } = null!;
        public string ContentType { get; set; } = null!;
        public long Size { get; set; }
        public string StoragePath { get; set; } = null!;
        public int Version { get; set; }
        public bool IsLatest { get; set; }
        public DateTime UploadedAt { get; set; }
        public string UploadedBy { get; set; } = null!;
        public MedicalFileType FileType { get; set; }
    }
    
    
   
}