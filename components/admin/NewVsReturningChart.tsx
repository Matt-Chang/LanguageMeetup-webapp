'use client';

import { Pie } from 'react-chartjs-2';
import './ChartConfig';

interface Props {
    data: any[];
}

export default function NewVsReturningChart({ data }: Props) {
    let newCount = 0;
    let returningCount = 0;

    data.forEach((r) => {
        if (r.is_first_time) newCount++;
        else returningCount++;
    });

    const chartData = {
        labels: ['New', 'Returning'],
        datasets: [
            {
                data: [newCount, returningCount],
                backgroundColor: ['#2ecc71', '#3498db'],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' as const },
            title: { display: true, text: 'New vs Returning' },
        },
    };

    return <div className="h-64"><Pie data={chartData} options={options} /></div>;
}
