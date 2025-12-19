namespace FileService.Application.DTOs;

public class FolderDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Type { get; set; }

    public string? DoctorId { get; set; }

    public string? PatientId { get; set; }

    public DateTime CreatedAt { get; set; }
}