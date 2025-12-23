'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import RegistrationsChart from './RegistrationsChart';
import NewVsReturningChart from './NewVsReturningChart';
import LanguageChart from './LanguageChart';
import TrendChart from './TrendChart';
import AdminSchedule from './AdminSchedule';
import AdminTables from './AdminTables';

export default function Dashboard() {
    const router = useRouter();
    const [date, setDate] = useState('');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Trend State
    const [trendStart, setTrendStart] = useState('');
    const [trendEnd, setTrendEnd] = useState('');
    const [trendData, setTrendData] = useState<any[]>([]);

    // 1. Init Dates
    useEffect(() => {
        const today = new Date();
        // Calculate Next Thursday
        const nextThurs = new Date(today);
        nextThurs.setHours(0, 0, 0, 0);
        const diff = (4 + 7 - nextThurs.getDay()) % 7;
        if (diff !== 0) nextThurs.setDate(nextThurs.getDate() + diff);
        const dateStr = nextThurs.toISOString().split('T')[0];
        setDate(dateStr);

        // Default Trend Range: Last 3 months to Next 1 month
        const start = new Date(today);
        start.setMonth(start.getMonth() - 3);
        const end = new Date(today);
        end.setMonth(end.getMonth() + 1);
        setTrendStart(start.toISOString().split('T')[0]);
        setTrendEnd(end.toISOString().split('T')[0]);
    }, []);

    // 2. Fetch Single Date Data
    useEffect(() => {
        if (!date) return;
        fetchData(date);
    }, [date]);

    const fetchData = async (targetDate: string) => {
        setLoading(true);
        const { data: res, error } = await supabase
            .from('registrations')
            .select('*')
            .eq('event_date', targetDate);

        if (res) setData(res);
        setLoading(false);
    };

    // 3. Fetch Trend Data
    const loadTrend = async () => {
        if (!trendStart || !trendEnd) return;

        // Fetch all registrations in range
        const { data: res, error } = await supabase
            .from('registrations')
            .select('event_date')
            .gte('event_date', trendStart)
            .lte('event_date', trendEnd)
            .order('event_date', { ascending: true });

        if (res) {
            // Group by event_date
            const counts: Record<string, number> = {};
            res.forEach(r => {
                counts[r.event_date] = (counts[r.event_date] || 0) + 1;
            });

            // Convert to array
            const trendArr = Object.entries(counts).map(([d, c]) => ({ date: d, count: c }));
            // Sort
            trendArr.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setTrendData(trendArr);
        }
    };

    useEffect(() => {
        if (trendStart && trendEnd) loadTrend();
    }, [trendStart, trendEnd]);


    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.refresh(); // Triggers server re-check (page.tsx)
    };

    return (
        <div className="min-h-screen bg-gray-100 font-body">
            {/* Navbar */}
            <nav className="bg-white shadow">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">HLM Admin Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors text-sm font-bold"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8">

                {/* Schedule Management */}
                {/* Schedule Management */}
                <AdminTables />
                <AdminSchedule />

                {/* Date Controls */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8 flex flex-wrap gap-4 items-center">
                    <div className="flex flex-col">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1">View Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary outline-none"
                        />
                    </div>
                    <button
                        onClick={() => fetchData(date)}
                        className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors h-10 mt-auto"
                    >
                        {loading ? 'Loading...' : 'Refresh Data'}
                    </button>
                    <div className="ml-auto text-gray-600 text-sm font-medium">
                        Records Found: <span className="text-primary font-bold text-lg">{data.length}</span>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Registrations Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-1">
                        <RegistrationsChart data={data} />
                    </div>

                    {/* New vs Returning */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <NewVsReturningChart data={data} />
                    </div>

                    {/* Language Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <LanguageChart data={data} />
                    </div>
                </div>

                {/* Trend Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex flex-wrap gap-4 items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800 mr-auto">Registration Trend</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">From:</span>
                            <input
                                type="date"
                                value={trendStart}
                                onChange={(e) => setTrendStart(e.target.value)}
                                className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-gray-50"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">To:</span>
                            <input
                                type="date"
                                value={trendEnd}
                                onChange={(e) => setTrendEnd(e.target.value)}
                                className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-gray-50"
                            />
                        </div>
                        <button
                            onClick={loadTrend}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1 rounded-md text-sm transition-colors"
                        >
                            Update
                        </button>
                    </div>
                    <TrendChart data={trendData} />
                </div>

            </div>
        </div>
    );
}
