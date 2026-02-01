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
        const { data, error } = await supabase
            .from('registrations')
            .select('*')
            .eq('event_date', date)
            // Filter by venueId OR null (for legacy records)
            .or(`venue_id.eq.${venueId},venue_id.is.null`)
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
                    {/* <span className="mx-2">|</span> Venue ID: {venueId} */}
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

                <div className="mt-6 flex justify-end">
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
