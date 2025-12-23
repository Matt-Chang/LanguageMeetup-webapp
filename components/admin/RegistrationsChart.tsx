'use client';

import { Bar } from 'react-chartjs-2';
import './ChartConfig'; // Ensure registration

interface Props {
    data: any[];
}

export default function RegistrationsChart({ data }: Props) {
    // Aggregate
    const counts: Record<string, number> = {};
    data.forEach((r) => {
        const t = r.table_type || 'Unknown';
        // Normalize or Map names if needed
        const name = TABLE_NAMES[t] || t;
        counts[name] = (counts[name] || 0) + 1;
    });

    const chartData = {
        labels: Object.keys(counts),
        datasets: [
            {
                label: 'Registrants',
                data: Object.values(counts),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Registrations per Table' },
        },
        scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
    };

    return <div className="h-64"><Bar data={chartData} options={options} /></div>;
}

const TABLE_NAMES: Record<string, string> = {
    'free-talk': 'Free Talk',
    'it': 'AI / IT',
    'japanese': 'Japanese',
    'board-game': 'Board Games'
};
