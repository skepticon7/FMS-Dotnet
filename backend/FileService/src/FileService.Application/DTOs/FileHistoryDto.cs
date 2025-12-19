using FileService.Domain.Enums;

namespace FileService.Application.DTOs
{
    public class FileHistoryDto
    {
        public Guid Id { get; set; }
        public FileAction Action { get; set; }
        public string? Notes { get; set; }
        public DateTime Timestamp { get; set; }
        public string PerformedBy { get; set; } = null!;
    }
}