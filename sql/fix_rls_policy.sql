-- Fix RLS Policy for table_exceptions
-- The app uses custom auth (cookies), so client-side requests are technically 'anon' (anonymous).
-- We need to allow 'anon' users to write to this table, OR rely on the application logic for security.

-- Option 1: Update Policy to allow anon to ALL (Simplest for this architecture)
DROP POLICY IF EXISTS "Allow admin write access" ON table_exceptions;

CREATE POLICY "Allow public write access" ON table_exceptions
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- OR Option 2: Disable RLS completely (Since we are using custom auth)
-- ALTER TABLE table_exceptions DISABLE ROW LEVEL SECURITY;
