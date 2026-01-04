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
import AdminVenues from './AdminVenues';
import RegistrantsModal from './RegistrantsModal';

export default function Dashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'overview' | 'venues' | 'tables'>('overview');

    // Overview State
    const [date, setDate] = useState('');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isGuestListOpen, setIsGuestListOpen] = useState(false);

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
            <nav className="bg-white shadow sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <h1 className="text-xl font-bold text-gray-800">HLM Admin</h1>
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('venues')}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'venues' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Venues
                            </button>
                            <button
                                onClick={() => setActiveTab('tables')}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'tables' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Tables
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md transition-colors text-sm font-bold"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8">

                {activeTab === 'overview' && (
                    <div className="animate-fadeIn">
                        {/* Admin Schedule (Registrants List) */}
                        <AdminSchedule />

                        <div className="my-8 border-b border-gray-200"></div>

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
                            <div className="ml-auto flex items-center gap-4">
                                <button
                                    onClick={() => setIsGuestListOpen(true)}
                                    disabled={data.length === 0}
                                    className={`px-4 py-2 rounded-md font-bold transition-colors h-10 border ${data.length === 0 ? 'bg-gray-50 text-gray-400 border-gray-200' : 'bg-white text-primary border-primary hover:bg-blue-50'}`}
                                >
                                    👥 View Guest List
                                </button>
                                <div className="text-gray-600 text-sm font-medium">
                                    Records Found: <span className="text-primary font-bold text-lg">{data.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Modal for Date Viewer */}
                        <RegistrantsModal
                            isOpen={isGuestListOpen}
                            onClose={() => setIsGuestListOpen(false)}
                            date={date}
                            venueId="" // Show all venues
                        />

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-1">
                                <RegistrationsChart data={data} />
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <NewVsReturningChart data={data} />
                            </div>
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
                )}

                {activeTab === 'venues' && (
                    <div className="animate-fadeIn">
                        <AdminVenues />
                    </div>
                )}

                {activeTab === 'tables' && (
                    <div className="animate-fadeIn">
                        <AdminTables />
                    </div>
                )}

            </div>
        </div>
    );
}
