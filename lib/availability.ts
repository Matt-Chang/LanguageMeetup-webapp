import { supabase } from './supabase';

export interface TableException {
    venue_id: string;
    event_date: string;
    table_id: string;
    is_cancelled: boolean;
}

/**
 * Fetch all table exceptions for a specific venue and date.
 */
export async function getTableExceptions(venueId: string, date: string): Promise<TableException[]> {
    const { data, error } = await supabase
        .from('table_exceptions')
        .select('*')
        .eq('venue_id', venueId)
        .eq('event_date', date);

    if (error) {
        console.error('Error fetching table exceptions:', error);
        return [];
    }

    return data || [];
}

/**
 * Set the cancellation status of a table.
 * If isCancelled is false, we can either set is_cancelled=false or delete the row.
 * Deleting the row is cleaner for "default available".
 */
export async function setTableException(
    venueId: string,
    tableId: string,
    date: string,
    isCancelled: boolean
) {
    if (!isCancelled) {
        // If making it available (default), remove the exception row
        const { error } = await supabase
            .from('table_exceptions')
            .delete()
            .eq('venue_id', venueId)
            .eq('table_id', tableId)
            .eq('event_date', date);

        if (error) throw error;
    } else {
        // If cancelling, upsert the exception row
        const { error } = await supabase
            .from('table_exceptions')
            .upsert({
                venue_id: venueId,
                table_id: tableId,
                event_date: date,
                is_cancelled: true
            }, { onConflict: 'venue_id, event_date, table_id' });

        if (error) throw error;
    }
}
