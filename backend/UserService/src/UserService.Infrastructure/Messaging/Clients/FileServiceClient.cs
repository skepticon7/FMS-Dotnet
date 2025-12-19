using Contracts.Users;
using MassTransit;
using UserService.Application.Interfaces.Messaging;

namespace UserService.Infrastructure.Messaging.Clients;

public class FileServiceClient(IRequestClient<GetPatientIdsByDoctorIdRequest> _client) : IFileServiceClient
{
    
    public async Task<List<long>> GetPatientIdsByDoctorAsync(long doctorId)
    {
        var response = await _client.GetResponse<GetPatientIdsByDoctorResponse>(
            new GetPatientIdsByDoctorIdRequest(doctorId)
        );
        return response.Message.Ids;
    }
}