using FileService.Domain.Enums;
public class UpdateFileRequest
{
    public string FileName { get; set; } = null!;
    public Guid FolderId { get; set; }
    public MedicalFileType FileType { get; set; }
    public string Checksum { get; set; } = null!;
    public string? Notes { get; set; }
    public string? PerformedBy { get; set; } = null!;
}