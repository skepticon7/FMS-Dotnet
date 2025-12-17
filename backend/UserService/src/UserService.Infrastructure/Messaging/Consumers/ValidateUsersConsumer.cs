using Contracts.Users;
using MassTransit;
using MediatR;
using UserService.Application.Features.Doctors.Queries.GetDoctorById;
using UserService.Application.Features.Patients.Queries.GetPatientById;

namespace UserService.Infrastructure.Messaging.Consumers;

public class ValidateUsersConsumer(IMediator _mediator) : IConsumer<ValidateUsersRequest>
{
    public async Task Consume(ConsumeContext<ValidateUsersRequest> context)
    {
        var request = context.Message;

        var doctorResult = await _mediator.Send(new GetDoctorByIdQuery(request.DoctorId));
        var patientResult = await _mediator.Send(new GetPatientByIdQuery(request.PatientId));
        var managerResult = await _mediator.Send(new GetDoctorByIdQuery(request.ManagerId));

        var doctorExists = doctorResult != null;
        var patientExists = patientResult != null;
        var managerExists = managerResult != null;

        await context.RespondAsync(new ValidateUsersResponse(
            doctorExists, 
            patientExists, 
            managerExists
        ));
    }
}