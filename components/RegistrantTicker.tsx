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

    // 1. Calculate Date (Next Available Event)
    useEffect(() => {
        const getNextEventDate = async () => {
            // We can use our robust schedule logic to find the true next event
            // This avoids custom day math duplications
            const { getUpcomingEvents } = await import('../lib/schedule');
            const events = await getUpcomingEvents(undefined, 4); // Get next 4 events
            const nextActive = events.find(e => !e.isCancelled);

            if (nextActive) {
                setNextEventDate(nextActive.date);
            }
        };
        getNextEventDate();
    }, []);

    // 2. Fetch & Subscribe (unchanged logic, just dependency)
    useEffect(() => {
        if (!nextEventDate) return;
        // ... (rest of fetch logic same)
        // ...
        // ...
        if (data) setRegistrants(data);
    };
    fetchRegistrants();
    // ... (subscription logic same)
    // ...
}, [nextEventDate]);

// ...

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
