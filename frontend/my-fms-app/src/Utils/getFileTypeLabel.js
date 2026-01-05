export const getFileTypeLabel = (typeValue) => {
    const types = {
        0: "General",
        1: "Prescription",
        2: "Lab Report",
        3: "MRI Scan",
        4: "X-Ray",
        5: "CT Scan",
        6: "Ultrasound",
        7: "Discharge Summary",
        8: "Insurance Document"
    };
    // Return the label, or the original value if not found (fallback)
    return types[typeValue] || "Unknown";
};
