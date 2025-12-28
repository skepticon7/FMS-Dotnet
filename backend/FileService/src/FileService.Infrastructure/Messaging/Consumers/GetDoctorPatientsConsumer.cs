using MassTransit;
using Microsoft.EntityFrameworkCore;
using FileService.Application.Common.Interfaces;
using Contracts.Users;

namespace FileService.Application.Features.Patients.Consumers
{
    public class GetDoctorPatientsConsumer : IConsumer<GetPatientIdsByDoctorIdRequest>
    {
        private readonly IApplicationDbContext _context;

        public GetDoctorPatientsConsumer(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task Consume(ConsumeContext<GetPatientIdsByDoctorIdRequest> context)
        {
            string doctorIdStr = context.Message.DoctorId.ToString();

         
            var patientIdStrings = await _context.Folders
                .AsNoTracking()
                .Where(f => f.DoctorId.Trim() == doctorIdStr 
                            && f.PatientId != null 
                            && f.DeletedAt == null)
                .Select(f => f.PatientId!)
                .Distinct()
                .ToListAsync(context.CancellationToken);

            // Conversion Logic (String -> Long)
            var patientIdsLong = new List<long>();
            foreach (var idStr in patientIdStrings)
            {
                if (long.TryParse(idStr.Trim(), out var idLong))
                {
                    patientIdsLong.Add(idLong);
                }
            }

            // Respond
            await context.RespondAsync(new GetPatientIdsByDoctorResponse()
            {
                PatientIds = patientIdsLong
            });
        }
    }
}