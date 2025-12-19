export const constructSitesPie = (sites) => {
    const GREEN_COLORS = [
        "#1B5E20",  // Very dark green
        "#2E7D32", // Dark green
        "#4CAF50", // Classic green
        "#81C784", // Medium green
        "#C8E6C9", // Light green
        "#E8F5E9" // Very light green
    ];

    if (!sites || sites.length === 0) return []; // Handle empty input

    const sorted = [...sites].sort((a, b) => b.interventions - a.interventions);

    const finalPie = sorted.slice(0, 4).map((site, index) => ({
        siteName: site.site.name,
        count: site.interventions,
        color: GREEN_COLORS[index]
    }));

    if (sorted.length > 4) {
        const othersCount = sorted.slice(4).reduce((sum, item) => sum + item.interventions, 0);
        finalPie.push({
            siteName: "Others",
            count: othersCount,
            color: GREEN_COLORS[4]
        });
    }

    return finalPie;
};