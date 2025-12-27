import { useState, useEffect } from 'react';
import { getVenues } from '../lib/data/venues';
import { Venue } from '../lib/venues';

export function useVenues() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getVenues();
                setVenues(data);
            } catch (err) {
                console.error("Failed to load venues", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const getVenueName = (id: string) => {
        const v = venues.find(v => v.id === id);
        return v ? v.name : id;
    };

    return { venues, loading, error, getVenueName };
}
