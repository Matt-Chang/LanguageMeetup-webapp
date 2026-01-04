'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { getUpcomingEvents, EventStatus } from '../../lib/schedule';
import RegistrantsModal from './RegistrantsModal';

export default function AdminSchedule() {
    const [events, setEvents] = useState<EventStatus[]>([]);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Modal State
    const [viewEvent, setViewEvent] = useState<{ date: string, venueId: string } | null>(null);

    const loadSchedule = async () => {
        setLoading(true);
        // Get next 12 events to manage
        const data = await getUpcomingEvents(undefined, 6); // 6 per venue = 12 total
        setEvents(data);
        setLoading(false);
    };

    useEffect(() => {
        loadSchedule();
    }, []);

    const toggleStatus = async (event: EventStatus) => {
        const confirmMsg = event.isCancelled
            ? `Restore event on ${event.date}?`
            : `Cancel event on ${event.date}?`;

        if (!confirm(confirmMsg)) return;

        // If cancelling, maybe ask for a note?
        let note = event.note;
        if (!event.isCancelled) {
            const userNote = prompt("Reason for cancellation (optional):", "Holiday");
            if (userNote !== null) note = userNote;
        }

        setProcessingId(`${event.venueId}-${event.date}`);

        try {
            const { error } = await supabase
                .from('event_exceptions')
                .upsert({
                    date: event.date,
                    venue_id: event.venueId,
                    is_cancelled: !event.isCancelled,
                    note: note
                });

            if (error) throw error;
            await loadSchedule();
        } catch (err: any) {
            alert('Error updating schedule: ' + err.message);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">🗓️ Event Schedule Management</h2>
                <button
                    onClick={loadSchedule}
                    className="text-primary hover:text-primary-dark text-sm font-bold"
                >
                    ↻ Refresh
                </button>
            </div>

            {loading && events.length === 0 ? (
                <div className="text-center py-8 text-gray-400">Loading schedule...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <th className="p-3">Date</th>
                                <th className="p-3">Venue</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Note</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {events.map((ev) => (
                                <tr key={`${ev.venueId}-${ev.date}`} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-3 font-bold text-gray-700">
                                        {ev.date}
                                        <span className="text-xs font-normal text-gray-400 ml-2">({ev.dayName})</span>
                                    </td>
                                    <td className="p-3">
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold
                                            ${ev.venueId === 'mercy' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {ev.venueName}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {ev.isCancelled ? (
                                            <span className="inline-flex items-center gap-1 text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded">
                                                🚫 CANCELLED
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">
                                                ✅ ACTIVE
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 text-sm text-gray-500 italic max-w-xs truncate">
                                        {ev.note || '-'}
                                    </td>
                                    <td className="p-3 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => setViewEvent({ date: ev.date, venueId: ev.venueId })}
                                            className="text-xs font-bold px-3 py-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                        >
                                            👥 View Guests
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(ev)}
                                            disabled={processingId === `${ev.venueId}-${ev.date}`}
                                            className={`text-xs font-bold px-3 py-1.5 rounded transition-all
                                                ${ev.isCancelled
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'}
                                                ${processingId === `${ev.venueId}-${ev.date}` ? 'opacity-50 cursor-wait' : ''}
                                            `}
                                        >
                                            {ev.isCancelled ? 'RESTORE' : 'CANCEL'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            <RegistrantsModal
                isOpen={!!viewEvent}
                onClose={() => setViewEvent(null)}
                date={viewEvent?.date || ''}
                venueId={viewEvent?.venueId || ''}
            />
        </div>
    );
}
