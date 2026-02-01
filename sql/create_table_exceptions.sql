-- Create a table to track specific table cancellations for a venue on a specific date
CREATE TABLE IF NOT EXISTS table_exceptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venue_id TEXT NOT NULL, -- 'mercy' or 't2'
    event_date DATE NOT NULL,
    table_id TEXT NOT NULL, -- e.g., 'free-talk', 'board-game'
    is_cancelled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure we don't have duplicates for the same table/date/venue combination
    UNIQUE(venue_id, event_date, table_id)
);

-- Add RLS policies if needed, but for now assuming public/anon can read, and authenticated (admin) can write.
ALTER TABLE table_exceptions ENABLE ROW LEVEL SECURITY;

-- Policy for reading (Everyone can see availability)
CREATE POLICY "Allow public read access" ON table_exceptions
    FOR SELECT TO anon, authenticated USING (true);

-- Policy for writing (Only authenticated admins)
CREATE POLICY "Allow admin write access" ON table_exceptions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
