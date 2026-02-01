'use client';

import { useState, useEffect } from 'react';
import { getVenues } from '../../lib/data/venues';
import { Venue } from '../../lib/venues';
import { getTableExceptions, setTableException, TableException } from '../../lib/availability';

interface TableAvailabilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: string;
    venueId: string;
}

export default function TableAvailabilityModal({ isOpen, onClose, date, venueId }: TableAvailabilityModalProps) {
    const [venue, setVenue] = useState<Venue | null>(null);
    const [exceptions, setExceptions] = useState<TableException[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null); // tableId being toggled

    useEffect(() => {
        if (isOpen && venueId && date) {
            loadData();
        }
    }, [isOpen, venueId, date]);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Get Venue to know available tables
            const venues = await getVenues();
            const v = venues.find(v => v.id === venueId);
            setVenue(v || null);

            // 2. Get existing exceptions
            const exs = await getTableExceptions(venueId, date);
            setExceptions(exs);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleTable = async (tableId: string, currentIsCancelled: boolean) => {
        setProcessing(tableId);
        try {
            await setTableException(venueId, tableId, date, !currentIsCancelled);
            // Refresh exceptions locally for immediate UI update
            const exs = await getTableExceptions(venueId, date);
            setExceptions(exs);
        } catch (err) {
            alert('Failed to update table availability');
            console.error(err);
        } finally {
            setProcessing(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fadeIn relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    ✕
                </button>

                <h3 className="text-xl font-bold text-gray-800 mb-2">Manage Table Availability</h3>
                <p className="text-sm text-gray-500 mb-6">
                    {date} @ {venue?.name || venueId}
                </p>

                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : !venue ? (
                    <div className="text-red-500">Venue not found.</div>
                ) : (
                    <div className="space-y-3">
                        {venue.tables.length === 0 ? (
                            <p className="text-gray-400 italic">No tables assigned to this venue.</p>
                        ) : (
                            venue.tables.map(table => {
                                const isCancelled = exceptions.find(e => e.table_id === table.id)?.is_cancelled || false;
                                return (
                                    <div
                                        key={table.id}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${isCancelled ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{table.icon}</span>
                                            <div>
                                                <h4 className={`font-bold text-sm ${isCancelled ? 'text-red-800' : 'text-green-900'}`}>{table.title}</h4>
                                                <p className="text-xs text-gray-500">
                                                    {isCancelled ? 'Currently Cancelled' : 'Available'}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => toggleTable(table.id, isCancelled)}
                                            disabled={processing === table.id}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm
                                                ${isCancelled
                                                    ? 'bg-white text-green-600 border border-green-200 hover:bg-green-50'
                                                    : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'}
                                                ${processing === table.id ? 'opacity-50 cursor-wait' : ''}
                                            `}
                                        >
                                            {isCancelled ? 'Make Available' : 'Cancel'}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                <div className="mt-6 text-center">
                    <button
                        onClick={onClose}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
