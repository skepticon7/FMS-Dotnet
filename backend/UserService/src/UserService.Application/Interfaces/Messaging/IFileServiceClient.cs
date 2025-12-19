namespace UserService.Application.Interfaces.Messaging;

public interface IFileServiceClient
{
    Task<List<long>> GetPatientIdsByDoctorAsync(long doctorId);
}