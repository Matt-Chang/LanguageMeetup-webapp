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

export default function RegistrantTicker({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
    const [registrants, setRegistrants] = useState<Registrant[]>([]);
    const [targetDates, setTargetDates] = useState<string[]>([]);
    const [offset, setOffset] = useState(0);

    // 1. Calculate Target Dates (Next Available for EACH venue)
    useEffect(() => {
        const getDates = async () => {
            const { getUpcomingEvents } = await import('../lib/schedule');
            const events = await getUpcomingEvents(undefined, 8); // Check next 8 events to cover gaps

            // Find first active event for each venue
            const uniqueVenueDates = new Map<string, string>();
            for (const ev of events) {
                if (!ev.isCancelled && !uniqueVenueDates.has(ev.venueId)) {
                    uniqueVenueDates.set(ev.venueId, ev.date);
                }
            }
            const dates = Array.from(uniqueVenueDates.values());
            setTargetDates(dates);
        };
        getDates();
    }, []);

    // 2. Fetch & Subscribe
    useEffect(() => {
        if (targetDates.length === 0) return;

        const fetchRegistrants = async () => {
            const { data } = await supabase
                .from('registrations')
                .select('id, user_name, table_type, event_date')
                .in('event_date', targetDates)
                .order('created_at', { ascending: false })
                .limit(20);

            if (data) setRegistrants(data);
        };

        fetchRegistrants();

        // Subscribe to ALL insertions, filter client-side for simplicity
        const channel = supabase
            .channel('registrations_ticker')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'registrations'
                },
                (payload) => {
                    const newReg = payload.new as Registrant;
                    // Only add if it matches one of our target dates
                    if (targetDates.includes(newReg.event_date)) {
                        setRegistrants((prev) => [newReg, ...prev]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [targetDates]);

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
                Start the movement! <span className="text-primary font-bold">Register now</span> for upcoming events.
            </div>
        );
    }

    // Visual Window
    const currentItem = registrants[offset];

    // Format date for display (e.g. "for next Friday" or just date)
    // Safe parse YYYY-MM-DD to local date
    // Safe parse YYYY-MM-DD to local date
    const [y, m, d] = currentItem.event_date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    if (isNaN(dateObj.getTime())) return null; // Skip invalid dates

    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

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
                {' '}on {dayName} ({dateStr}).
            </div>
        </div>
    );
}
