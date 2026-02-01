-- Create a table for user comments/testimonials
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_name TEXT NOT NULL,
    message TEXT NOT NULL,
    attended_date DATE NOT NULL,
    table_type TEXT NOT NULL,
    comment_type TEXT NOT NULL, -- 'Thank You Note', 'Improvement', 'Other'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for displaying testimonials)
CREATE POLICY "Allow public read access" ON comments
    FOR SELECT TO anon, authenticated USING (true);

-- Allow public write access (for submitting comments)
-- Since we use custom auth/anon users, we allow anon writes
CREATE POLICY "Allow public write access" ON comments
    FOR INSERT TO anon, authenticated WITH CHECK (true);
