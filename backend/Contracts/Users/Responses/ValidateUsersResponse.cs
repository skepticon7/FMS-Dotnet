namespace Contracts.Users;

public record ValidateUsersResponse(bool DoctorExists , bool PatientExists , bool ManagerExists);