namespace Contracts.Users;

public record ValidateUsersRequest(long DoctorId , long PatientId , long ManagerId);