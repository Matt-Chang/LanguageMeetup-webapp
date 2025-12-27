
import { supabase } from './supabase';
import { getVenues } from './data/venues';

export interface EventStatus {
    date: string; // YYYY-MM-DD
    venueId: string;
    venueName: string;
    dayName: string;
    isCancelled: boolean;
    note?: string;
    isNext: boolean; // True if it's the very next upcoming event for this venue
}

/**
 * Generates a list of upcoming events for a specific venue or all venues.
 * Checks against the event_exceptions table in Supabase.
 * @param venueId Optional. If provided, checks only that venue.
 * @param count Number of events to generate per venue.
 */
export async function getUpcomingEvents(venueId?: string, count: number = 4): Promise<EventStatus[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let allEvents: EventStatus[] = [];

    // 1. Determine which venues to process from DB
    const allVenues = await getVenues();
    const venuesToProcess = venueId
        ? allVenues.filter(v => v.id === venueId)
        : allVenues;

    // 2. Generate recurring dates for each venue
    for (const venue of venuesToProcess) {
        if (!venue) continue;

        let generated = 0;
        let date = new Date(today);

        while (generated < count) {
            // Check if date matches venue's dayOfWeek
            if (date.getDay() === venue.dayOfWeek) {
                // Fix: Use local date string to avoid timezone shifts
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                const dateString = `${y}-${m}-${d}`;

                allEvents.push({
                    date: dateString,
                    venueId: venue.id,
                    venueName: venue.name,
                    dayName: venue.dayOfWeek === 4 ? 'Thursday' : (venue.dayOfWeek === 5 ? 'Friday' : `Day ${venue.dayOfWeek}`),
                    isCancelled: false, // Default active
                    isNext: false
                });
                generated++;
            }
            // Move to next day
            date.setDate(date.getDate() + 1);
        }
    }

    // 3. Fetch exceptions from Supabase
    // We only care about exceptions for the dates we generated
    const datesToCheck = allEvents.map(e => e.date);

    if (datesToCheck.length > 0) {
        const { data: exceptions } = await supabase
            .from('event_exceptions')
            .select('*')
            .in('date', datesToCheck);

        if (exceptions) {
            // 4. Merge exceptions
            allEvents = allEvents.map(event => {
                const exception = exceptions.find(ex => ex.date === event.date && ex.venue_id === event.venueId);
                if (exception) {
                    return {
                        ...event,
                        isCancelled: exception.is_cancelled,
                        note: exception.note
                    };
                }
                return event;
            });
        }
    }

    // 5. Sort globally by date
    allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return allEvents;
}

/**
 * Generates events for a specific month.
 * @param year e.g. 2024
 * @param month 0-indexed (0=Jan, 11=Dec)
 */
export async function getEventsForMonth(year: number, month: number): Promise<EventStatus[]> {
    let allEvents: EventStatus[] = [];
    const venues = await getVenues();

    // 1. Generate dates for this month
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
        const dayOfWeek = date.getDay();

        for (const venue of venues) {
            if (venue.dayOfWeek === dayOfWeek) {
                // Fix: toISOString() uses UTC, which shifts dates back for positive timezones (e.g. UTC+8)
                // We must construct YYYY-MM-DD based on the local loop date
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                const dateString = `${y}-${m}-${d}`;

                allEvents.push({
                    date: dateString,
                    venueId: venue.id,
                    venueName: venue.name,
                    dayName: venue.dayOfWeek === 4 ? 'Thursday' : (venue.dayOfWeek === 5 ? 'Friday' : `Day ${venue.dayOfWeek}`),
                    isCancelled: false,
                    isNext: false
                });
            }
        }
        date.setDate(date.getDate() + 1);
    }

    // 2. Fetch exceptions
    const datesToCheck = allEvents.map(e => e.date);
    if (datesToCheck.length > 0) {
        const { data: exceptions } = await supabase
            .from('event_exceptions')
            .select('*')
            .in('date', datesToCheck);

        if (exceptions) {
            allEvents = allEvents.map(event => {
                const exception = exceptions.find(ex => ex.date === event.date && ex.venue_id === event.venueId);
                if (exception) {
                    return {
                        ...event,
                        isCancelled: exception.is_cancelled,
                        note: exception.note
                    };
                }
                return event;
            });
        }
    }

    return allEvents;
}

/**
 * Helper to get strictly the next available (non-cancelled) date for a venue.
 */
export async function getNextAvailableDate(venueId: string): Promise<string | null> {
    const events = await getUpcomingEvents(venueId, 5); // Check next 5 occurrences
    const next = events.find(e => !e.isCancelled);
    return next ? next.date : null;
}
