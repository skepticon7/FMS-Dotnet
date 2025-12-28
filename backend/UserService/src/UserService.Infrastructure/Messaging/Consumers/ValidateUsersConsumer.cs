using Contracts.Users;
using MassTransit;
using MediatR;
using UserService.Application.Features.Doctors.Queries.GetDoctorById;
using UserService.Application.Features.Patients.Queries.GetPatientById;
using UserService.Application.Common.Exceptions;

namespace UserService.Infrastructure.Messaging.Consumers;

public class ValidateUsersConsumer : IConsumer<ValidateUsersRequest>
{
    private readonly IMediator _mediator;

    public ValidateUsersConsumer(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task Consume(ConsumeContext<ValidateUsersRequest> context)
    {
        var request = context.Message;

        bool doctorExists = true;
        bool patientExists = true;

        try
        {
            var doctorResult = await _mediator.Send(new GetDoctorByIdQuery(request.DoctorId));
            doctorExists = doctorResult != null;
        }
        catch (NotFoundException)
        {
            doctorExists = false;
        }

        try
        {
            var patientResult = await _mediator.Send(new GetPatientByIdQuery(request.PatientId));
            patientExists = patientResult != null;
        }
        catch (NotFoundException)
        {
            patientExists = false;
        }

        await context.RespondAsync(new ValidateUsersResponse(doctorExists, patientExists));
    }
}