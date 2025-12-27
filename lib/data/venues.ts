
import { supabase } from '../supabase';
import { Venue } from '../venues';

export async function getVenues(): Promise<Venue[]> {
    const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) throw error;

    // Map snake_case from DB to camelCase for app
    return (data || []).map((v: any) => ({
        id: v.id,
        name: v.name,
        address: v.address,
        googleMapsLink: v.google_maps_link,
        dayOfWeek: v.day_of_week,
        time: v.time,
        fee: v.fee,
        feeNote: v.fee_note,
        description: v.description,
        tables: v.tables || [],
        importantInfo: v.important_info || [],
        mapType: v.map_type,
    }));
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
            tables: venue.tables,
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
