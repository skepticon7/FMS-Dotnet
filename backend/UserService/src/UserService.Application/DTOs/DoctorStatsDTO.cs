namespace UserService.Application.DTOs;

public class DoctorStatsDTO
{
    public string MostCommonSpeciality { get; set; } = default!;
    public int DoctorsThisMonth { get; set; } = default!;
    
    public int AverageAge { get; set; } = default!;
    public int GenderRatioMale { get; set; } = default!;
    public int GenderRatioFemale { get; set; } = default!;
    public int MostCommonSpecPourcentage { get; set; } = default!;
}