namespace UserService.Application.DTOs;

public class PatientStatsDTO
{
    public string MostCommonBloodType { get; set; } = default!;
    public int PatientsThisMonth { get; set; } = default!;
    
    public int TotalPatients { get; set; } = default!;
    public int AverageAge { get; set; } = default!;
    public int GenderRatioMale { get; set; } = default!;
    public int GenderRatioFemale { get; set; } = default!;
    public int MostCommonBTPourcentage { get; set; } = default!;
}