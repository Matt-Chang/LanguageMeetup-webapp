
import { supabase } from '../supabase';
import { Venue } from '../venues';

export async function getVenues(): Promise<Venue[]> {
    const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) throw error;

    // Fetch all venue_tables links
    const { data: links, error: linksError } = await supabase
        .from('venue_tables')
        .select('*');

    if (linksError) throw linksError;

    // Fetch all tables details
    const { data: allTables, error: tablesError } = await supabase
        .from('tables')
        .select('*');

    if (tablesError) throw tablesError;

    // Enable easier lookup
    const tablesMap = new Map(allTables?.map(t => [t.id, t]));

    // Map snake_case from DB to camelCase for app
    return (data || []).map((v: any) => {
        // Find tables for this venue
        const venueLinks = links?.filter(l => l.venue_id === v.id) || [];
        const venueTables = venueLinks
            .map(l => tablesMap.get(l.table_id))
            .filter(t => t !== undefined) // filter out if table not found
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)); // Sort by order

        return {
            id: v.id,
            name: v.name,
            address: v.address,
            googleMapsLink: v.google_maps_link,
            dayOfWeek: v.day_of_week,
            time: v.time,
            fee: v.fee,
            feeNote: v.fee_note,
            description: v.description,
            tables: venueTables, // Now returning TableWrapper[]
            importantInfo: v.important_info || [],
            mapType: v.map_type,
        };
    });
}

export async function createVenue(venue: Venue) {
    const { error } = await supabase
        .from('venues')
        .insert({
            id: venue.id,
            name: venue.name,
            address: venue.address,
            google_maps_link: venue.googleMapsLink,
            day_of_week: venue.dayOfWeek,
            time: venue.time,
            fee: venue.fee,
            fee_note: venue.feeNote,
            description: venue.description,
            // tables: venue.tables, // Deprecated: relying on venue_tables relation
            important_info: venue.importantInfo,
            map_type: venue.mapType,
        });

    if (error) throw error;
}

export async function updateVenue(venue: Venue) {
    const { error } = await supabase
        .from('venues')
        .update({
            name: venue.name,
            address: venue.address,
            google_maps_link: venue.googleMapsLink,
            day_of_week: venue.dayOfWeek,
            time: venue.time,
            fee: venue.fee,
            fee_note: venue.feeNote,
            description: venue.description,
            tables: venue.tables,
            important_info: venue.importantInfo,
            map_type: venue.mapType,
        })
        .eq('id', venue.id);

    if (error) throw error;
}

export async function deleteVenue(id: string) {
    const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
