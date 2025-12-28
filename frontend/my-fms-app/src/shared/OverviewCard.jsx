import React from "react";
import {Card} from '@/components/ui/card';

const OverviewCard = ({Icon , title , subtitle ,description , color}) => {

    const colorMap = {
        red: {
            bg: "bg-red-100",
            text: "text-red-600",
        },
        blue: {
            bg: "bg-blue-100",
            text: "text-blue-600",
        },
        purple: {
            bg: "bg-purple-100",
            text: "text-purple-600",
        },
        emerald: {
            bg: "bg-emerald-100",
            text: "text-emerald-600",
        },
    };

    const styles = colorMap[color]
    return (
        <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground mb-1">{title}</p>
                    <div className="text-2xl font-bold">{subtitle}</div>
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                </div>

                <div
                    className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${styles.bg}`}
                >
                    <Icon className={`size-5 ${styles.text}`} />
                </div>
            </div>
        </Card>
    )
}

export default OverviewCard;