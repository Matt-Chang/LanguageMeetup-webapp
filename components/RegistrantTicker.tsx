'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TABLE_DISPLAY_NAMES } from '../lib/venues';

interface Registrant {
    id: string;
    user_name: string;
    table_type: string;
}

export default function RegistrantTicker({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
    const [registrants, setRegistrants] = useState<Registrant[]>([]);
    const [nextEventDate, setNextEventDate] = useState('');
    const [offset, setOffset] = useState(0);

    // 1. Calculate Date (Next Thursday or Saturday)
    useEffect(() => {
        const getNextEventDate = () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Find next Thursday (4) and next Saturday (6)
            // Helper to get date for day index
            const getDateForDay = (dayIndex: number) => {
                const date = new Date(today);
                let daysHasPassed = date.getDay() - dayIndex;
                if (daysHasPassed > 0) {
                    // Event day passed this week, move to next week
                    date.setDate(date.getDate() + (7 - daysHasPassed));
                } else if (daysHasPassed < 0) {
                    // Event day is coming up this week
                    date.setDate(date.getDate() + (-daysHasPassed));
                }
                // If 0, it is today. We effectively include today.
                return date;
            };

            const nextThu = getDateForDay(4);
            const nextSat = getDateForDay(6);

            // Compare timestamps
            // If they are equal (shouldn't happen) or one is sooner
            if (nextThu.getTime() < nextSat.getTime()) {
                return nextThu.toISOString().split('T')[0];
            } else {
                return nextSat.toISOString().split('T')[0];
            }
        };
        setNextEventDate(getNextEventDate());
    }, []);

    // 2. Fetch & Subscribe
    useEffect(() => {
        if (!nextEventDate) return;

        const fetchRegistrants = async () => {
            const { data } = await supabase
                .from('registrations')
                .select('id, user_name, table_type')
                .eq('event_date', nextEventDate)
                .order('created_at', { ascending: false })
                .limit(20); // Get more to scroll

            if (data) setRegistrants(data);
        };

        fetchRegistrants();

        const channel = supabase
            .channel('registrations_ticker')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'registrations',
                    filter: `event_date=eq.${nextEventDate}`,
                },
                (payload) => {
                    const newReg = payload.new as Registrant;
                    setRegistrants((prev) => [newReg, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [nextEventDate]);

    // 3. Animation Logic
    useEffect(() => {
        // Only animate if we have more items than we show (3)
        if (registrants.length <= 1) return;

        const interval = setInterval(() => {
            setOffset((prev) => (prev + 1) % registrants.length);
        }, 3000); // Change every 3 seconds

        return () => clearInterval(interval);
    }, [registrants.length]);

    if (registrants.length === 0) {
        return (
            <div className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-500'} text-sm font-medium animate-pulse text-center`}>
                Start the movement! <span className="text-primary font-bold">Register now</span> for {nextEventDate}.
            </div>
        );
    }

    // Visual Window
    const currentItem = registrants[offset];

    return (
        <div className={`h-12 overflow-hidden relative flex items-center justify-center ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
            <div
                key={`${currentItem.id}-${offset}`}
                className="animate-fadeIn text-sm font-medium text-center"
            >
                <span className="text-primary font-bold">{currentItem.user_name}</span> has just registered for{' '}
                <span className="text-primary font-bold">
                    {TABLE_DISPLAY_NAMES[currentItem.table_type] || currentItem.table_type}
                </span>
                {' '}the next meetup.
            </div>
        </div>
    );
}
