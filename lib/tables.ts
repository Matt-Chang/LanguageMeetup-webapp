
import { supabase } from './supabase';

export interface TableWrapper {
    id: string;
    title: string;
    description: string;
    icon: string;
    level_label: string;
    level_color_bg: string;
    level_color_text: string;
    sort_order: number;
    venues: string[]; // venue_ids
}

export async function getTablesWithVenues(): Promise<TableWrapper[]> {
    // Fetch tables
    const { data: tables, error: tablesError } = await supabase
        .from('tables')
        .select('*')
        .order('sort_order', { ascending: true });

    if (tablesError) throw tablesError;
    if (!tables) return [];

    // Fetch venue links
    const { data: links, error: linksError } = await supabase
        .from('venue_tables')
        .select('*');

    if (linksError) throw linksError;

    // Merge
    return tables.map(table => {
        const tableLinks = links?.filter(l => l.table_id === table.id) || [];
        return {
            ...table,
            venues: tableLinks.map(l => l.venue_id)
        };
    });
}

export async function createTable(table: TableWrapper) {
    // 1. Insert Table
    const { error: tableError } = await supabase
        .from('tables')
        .insert({
            id: table.id,
            title: table.title,
            description: table.description,
            icon: table.icon,
            level_label: table.level_label,
            level_color_bg: table.level_color_bg,
            level_color_text: table.level_color_text,
            sort_order: table.sort_order
        });

    if (tableError) throw tableError;

    // 2. Insert Venue Links
    if (table.venues.length > 0) {
        const linkRows = table.venues.map(vId => ({
            venue_id: vId,
            table_id: table.id
        }));

        const { error: linkError } = await supabase
            .from('venue_tables')
            .insert(linkRows);

        if (linkError) throw linkError;
    }
}

export async function updateTable(originalId: string, table: TableWrapper) {
    // 1. Update Table Data
    const { error: tableError } = await supabase
        .from('tables')
        .update({
            // If ID changed, we need more complex logic, but usually ID (slug) shouldn't change easily.
            // For now assume ID is constant or handle rename carefully. 
            // If ID changes, we need to create new and delete old or simple ID update if cascade works.
            // Let's assume ID can be updated.
            id: table.id,
            title: table.title,
            description: table.description,
            icon: table.icon,
            level_label: table.level_label,
            level_color_bg: table.level_color_bg,
            level_color_text: table.level_color_text,
            sort_order: table.sort_order
        })
        .eq('id', originalId);

    if (tableError) throw tableError;

    // 2. Update Links (Delete all and Re-insert is simplest for logic)
    // First, delete existing
    const { error: deleteError } = await supabase
        .from('venue_tables')
        .delete()
        .eq('table_id', table.id); // Use new ID if it changed

    if (deleteError) throw deleteError;

    // Re-insert
    if (table.venues.length > 0) {
        const linkRows = table.venues.map(vId => ({
            venue_id: vId,
            table_id: table.id
        }));

        const { error: linkError } = await supabase
            .from('venue_tables')
            .insert(linkRows);

        if (linkError) throw linkError;
    }
}

export async function deleteTable(id: string) {
    // 1. Delete links first (Manual Cascade)
    const { error: linksError } = await supabase
        .from('venue_tables')
        .delete()
        .eq('table_id', id);

    if (linksError) throw linksError;

    // 2. Delete the table
    const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
