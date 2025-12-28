namespace Contracts.Folders
{
    // ✅ Events are named in the past tense
    public record FolderCreated(
        Guid FolderId,
        string Name,
        string Type,
        string PatientId,
        string DoctorId,
        DateTime CreatedAt
    );
}