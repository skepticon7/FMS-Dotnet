namespace Contracts.Users;

public record GetPatientIdsByDoctorResponse
{
    public List<long> PatientIds { get; init; } = new();
}