'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TABLE_DISPLAY_NAMES } from '../lib/venues';

interface Registrant {
    id: string;
    user_name: string;
    table_type: string;
    event_date: string;
}

export default function RegistrantTicker({ theme = 'light', venueId }: { theme?: 'light' | 'dark', venueId?: string }) {
    const [registrants, setRegistrants] = useState<Registrant[]>([]);
    const [targetDates, setTargetDates] = useState<string[]>([]);
    const [offset, setOffset] = useState(0);
    const [nextDisplayDate, setNextDisplayDate] = useState('');

    // 1. Calculate Target Dates
    useEffect(() => {
        const getDates = async () => {
            const { getUpcomingEvents } = await import('../lib/schedule');
            // If venueId is specific, we only care about that venue's next active date
            // If global, we check all
            const events = await getUpcomingEvents(venueId, 8);

            const uniqueVenueDates = new Map<string, string>();
            for (const ev of events) {
                if (!ev.isCancelled && !uniqueVenueDates.has(ev.venueId)) {
                    uniqueVenueDates.set(ev.venueId, ev.date);
                }
            }
            const dates = Array.from(uniqueVenueDates.values());
            setTargetDates(dates);

            // Set display date for "No Registrants" state
            if (dates.length > 0) {
                // Sort dates to find the absolute soonest one among targets
                dates.sort();
                setNextDisplayDate(dates[0]);
            }
        };
        getDates();
    }, [venueId]);

    // 2. Fetch & Subscribe
    useEffect(() => {
        if (targetDates.length === 0) {
            setRegistrants([]);
            return;
        }

        const fetchRegistrants = async () => {
            const { data } = await supabase
                .from('registrations')
                .select('id, user_name, table_type, event_date')
                .in('event_date', targetDates)
                .order('created_at', { ascending: false })
                .limit(20);

            if (data) {
                // If venueId is set, further filter registrants by venue type?
                // Actually targetDates are already filtered by venue events, so the date check implies venue check
                // BUT if two venues share a date (unlikely given Thu/Fri split), we might need to filter table_type.
                // For now, date separation is sufficient.
                setRegistrants(data);
            }
        };

        fetchRegistrants();

        const channel = supabase
            .channel(`registrations_ticker_${venueId || 'all'}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'registrations'
                },
                (payload) => {
                    const newReg = payload.new as Registrant;
                    if (targetDates.includes(newReg.event_date)) {
                        setRegistrants((prev) => [newReg, ...prev]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [targetDates, venueId]);

    // 3. Animation Logic
    useEffect(() => {
        if (registrants.length <= 1) return;
        const interval = setInterval(() => {
            setOffset((prev) => (prev + 1) % registrants.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [registrants.length]);

    if (registrants.length === 0) {
        return (
            <div className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-500'} text-sm font-medium animate-pulse text-center`}>
                Start the movement! <span className="text-primary font-bold">Register now</span> for {nextDisplayDate || 'upcoming events'}.
            </div>
        );
    }

    // Visual Window
    const currentItem = registrants[offset];

    // Format date for display
    const [y, m, d] = currentItem.event_date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);

    let dateStr = '';
    if (!isNaN(dateObj.getTime())) {
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        const shortDate = dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
        dateStr = `on ${dayName} (${shortDate})`;
    }

    return (
        <div className={`h-12 overflow-hidden relative flex items-center justify-center ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
            <div
                key={`${currentItem.id}-${offset}`}
                className="animate-fadeIn text-sm font-medium text-center px-4"
            >
                <span className="text-primary font-bold">{currentItem.user_name}</span> has just registered for{' '}
                <span className="text-primary font-bold">
                    {TABLE_DISPLAY_NAMES[currentItem.table_type] || currentItem.table_type}
                </span>
                {' '}{dateStr}.
            </div>
        </div>
    );
}
