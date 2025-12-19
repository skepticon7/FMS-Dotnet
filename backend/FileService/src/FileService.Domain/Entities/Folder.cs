namespace FileService.Domain.Entities
{
    public class Folder
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = null!;
        
        public string? Type { get; set; } // Kept as string for flexibility, or we can make an Enum later
        
        public string? DoctorId { get; set; }    
        public string? PatientId { get; set; }   

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DeletedAt { get; set; }

        public ICollection<FileEntry> Files { get; set; } = new List<FileEntry>();
    }
}