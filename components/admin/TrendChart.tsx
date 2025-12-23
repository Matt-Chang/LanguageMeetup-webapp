'use client';

import { Line } from 'react-chartjs-2';
import './ChartConfig';

interface Props {
    data: { date: string; count: number }[];
}

export default function TrendChart({ data }: Props) {
    const chartData = {
        labels: data.map(d => d.date),
        datasets: [
            {
                label: 'Total Registrants',
                data: data.map(d => d.count),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Registration Trend' },
        },
        scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
    };

    return <div className="h-64"><Line data={chartData} options={options} /></div>;
}
