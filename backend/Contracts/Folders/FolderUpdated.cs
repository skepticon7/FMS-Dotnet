namespace Contracts.Folders;

public record FolderUpdated(
    Guid FolderId,
    string Name,
    string? Type,
    string? PatientId,
    string? DoctorId,
    DateTime UpdatedAt
    );