using FileService.Domain.Enums;

namespace FileService.Domain.Entities
{
    public class FileHistory
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid FileEntryId { get; set; }
        public FileEntry FileEntry { get; set; } = null!;

        // --- NEW: Typed Action ---
        public FileAction Action { get; set; } 
        
        public string? Notes { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string PerformedBy { get; set; } = null!;
    }
}