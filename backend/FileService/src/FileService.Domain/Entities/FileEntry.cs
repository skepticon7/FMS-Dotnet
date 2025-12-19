using FileService.Domain.Common;
using FileService.Domain.Enums;

namespace FileService.Domain.Entities
{
    public class FileEntry : BaseEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid FolderId { get; set; }
        public Folder Folder { get; set; } = null!;

        public string FileName { get; set; } = null!;
        public string ContentType { get; set; } = null!;
        
        // --- NEW: Typed Medical Context ---
        public MedicalFileType FileType { get; set; } = MedicalFileType.General;
        
        public long Size { get; set; }
        public string StoragePath { get; set; } = null!; 
        public string Checksum { get; set; } = null!;    
        
        public int Version { get; set; } = 1;
        public bool IsLatest { get; set; } = true;

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        public string UploadedBy { get; set; } = null!;
        public DateTime? DeletedAt { get; set; }

        public ICollection<FileHistory> Histories { get; set; } = new List<FileHistory>();
    }
}