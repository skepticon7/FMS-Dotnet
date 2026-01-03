namespace Contracts.Folders;

public record UpdateFolderRequest(
    string Name,
    string? Type,
    string? PatientId, 
    string? DoctorId   
);