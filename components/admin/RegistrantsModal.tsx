'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface RegistrantsModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: string;
    venueId: string; // Used to filter if needed, though currently date might be enough if events don't overlap venues on same date. Use mostly for context.
}

interface Registration {
    id: string;
    user_name: string;
    table_type: string;
    is_first_time: boolean;
    language_goals: string;
    marketing_source: string;
    created_at: string;
}

export default function RegistrantsModal({ isOpen, onClose, date, venueId }: RegistrantsModalProps) {
    const [registrants, setRegistrants] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        if (isOpen && date) {
            fetchRegistrants();
        }
    }, [isOpen, date]);

    const fetchRegistrants = async () => {
        setLoading(true);
        // We filter by date. If we need to filter by venue_id, we can add that too.
        // Assuming date is unique enough or we want all registrations for that date.
        // Best to filter by venue_id as well if provided to be safe.
        let query = supabase
            .from('registrations')
            .select('*')
            .eq('event_date', date);

        if (venueId) {
            query = query.or(`venue_id.eq.${venueId},venue_id.is.null`);
        }

        const { data, error } = await query
            .order('table_type', { ascending: true })
            .order('created_at', { ascending: true });

        if (error) {
            console.error(error);
            alert("Failed to load registrants");
        } else {
            setRegistrants(data || []);
        }
        setLoading(false);
    };

    const generateGuestListText = () => {
        let text = `📅 日期 Date: ${date}\n👥 總人數 Total: ${registrants.length} 人\n`;

        // Group by table type
        const grouped: Record<string, Registration[]> = {};
        registrants.forEach(reg => {
            const table = reg.table_type || 'Unknown';
            if (!grouped[table]) grouped[table] = [];
            grouped[table].push(reg);
        });

        Object.entries(grouped).forEach(([table, regs]) => {
            text += `\n[${table}] (${regs.length} 人)\n`;
            regs.forEach((reg, index) => {
                const firstTimeMark = reg.is_first_time ? ' (New🌟)' : '';
                text += `${index + 1}. ${reg.user_name}${firstTimeMark}\n`;
            });
        });

        return text;
    };

    const handleCopyToClipboard = async () => {
        const text = generateGuestListText();
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy!', err);
            alert('Failed to copy to clipboard.');
        }
    };

    const handleShareToLine = () => {
        const text = generateGuestListText();
        const encodedText = encodeURIComponent(text);
        const lineUrl = `https://line.me/R/share?text=${encodedText}`;
        window.open(lineUrl, '_blank');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                    &times;
                </button>

                <h3 className="text-2xl font-bold mb-1 text-gray-800">Registrants List</h3>
                <p className="text-gray-500 mb-6 font-medium">
                    Date: <span className="text-primary">{date}</span>
                    <span className="mx-2">|</span>
                    Number of People: <span className="text-primary font-bold">{registrants.length}</span>
                </p>

                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading data...</div>
                ) : registrants.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        No registrations found for this event.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                                    <th className="p-3 rounded-tl-lg">Name</th>
                                    <th className="p-3">Table</th>
                                    <th className="p-3 text-center">First Time?</th>
                                    <th className="p-3">Language Info</th>
                                    <th className="p-3 rounded-tr-lg">Source</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {registrants.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3 font-bold text-gray-800">{reg.user_name}</td>
                                        <td className="p-3">
                                            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-bold">
                                                {reg.table_type}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            {reg.is_first_time ? (
                                                <span className="text-green-600 font-bold text-xs bg-green-100 px-2 py-1 rounded-full">YES</span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-gray-600 max-w-xs truncate" title={reg.language_goals}>
                                            {reg.language_goals || '-'}
                                        </td>
                                        <td className="p-3 text-gray-500 text-xs">
                                            {reg.marketing_source || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-6 flex justify-between items-center border-t border-gray-100 pt-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleCopyToClipboard}
                            disabled={registrants.length === 0}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-all ${copySuccess
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                        >
                            {copySuccess ? (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                    Copy List
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleShareToLine}
                            disabled={registrants.length === 0}
                            className="flex items-center gap-2 bg-[#00B900] hover:bg-[#009900] text-white px-5 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.122.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.572-3.843 2.572-5.992zM8.536 13.064H6.313c-.328 0-.594-.267-.594-.594V7.598c0-.327.266-.594.594-.594h.594c.328 0 .594.267.594.594v4.278h1.031c.328 0 .594.267.594.594v.594c0 .328-.266.594-.594.594zm2.846-.594c0 .327-.266.594-.594.594h-.594c-.328 0-.594-.267-.594-.594V7.598c0-.327.266-.594.594-.594h.594c.328 0 .594.267.594.594v4.872zm4.148 0c0 .327-.266.594-.594.594h-.594c-.161 0-.317-.067-.428-.184l-2.091-2.45v2.04c0 .327-.266.594-.594.594h-.594c-.328 0-.594-.267-.594-.594V7.598c0-.327.266-.594.594-.594h.594c.16 0 .316.067.428.184l2.091 2.449v-2.039c0-.327.266-.594.594-.594h.594c.328 0 .594.267.594.594v4.872zm4.493-2.909c0 .328-.266.594-.594.594h-1.625v.784h1.625c.328 0 .594.267.594.594v.594c0 .328-.266.594-.594.594H17.21c-.328 0-.594-.267-.594-.594V7.598c0-.327.266-.594.594-.594h2.188c.328 0 .594.267.594.594v.594c0 .327-.266.594-.594.594h-1.625v.783h1.625c.328 0 .594.267.594.594v.594z" />
                            </svg>
                            Share to LINE
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-bold transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
