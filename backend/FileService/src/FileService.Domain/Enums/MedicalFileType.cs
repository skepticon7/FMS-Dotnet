namespace FileService.Domain.Enums
{
    public enum MedicalFileType
    {
        General = 0,        // Default for non-specific files
        Prescription = 1,
        LabReport = 2,          // Blood tests, urine tests, etc.
        MRI,                // Magnetic Resonance Imaging
        XRay,               // Radiography
        CTScan,             // Computed Tomography
        Ultrasound,
        DischargeSummary,   // Hospital discharge papers
        InsuranceDocument
    }
}