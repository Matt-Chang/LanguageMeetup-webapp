'use client';

import { Doughnut } from 'react-chartjs-2';
import './ChartConfig';

interface Props {
    data: any[];
}

export default function LanguageChart({ data }: Props) {
    const counts: Record<string, number> = {};

    data.forEach((r) => {
        // Assuming language_goals might be comma separated or single string
        // Simple logic: just count exact string for now, or split if needed
        // The previous app logic was simple, so we keep simple.
        if (!r.language_goals) return;

        // Clean up
        const goals = r.language_goals.split(',').map((g: string) => g.trim()).filter((g: string) => g);

        goals.forEach((g: string) => {
            counts[g] = (counts[g] || 0) + 1;
        });
    });

    const chartData = {
        labels: Object.keys(counts),
        datasets: [
            {
                data: Object.values(counts),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' as const },
            title: { display: true, text: 'Language Interests' },
        },
    };

    return <div className="h-64"><Doughnut data={chartData} options={options} /></div>;
}
