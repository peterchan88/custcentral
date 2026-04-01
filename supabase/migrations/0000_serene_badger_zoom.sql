-- Drop insecure public policies
DROP POLICY IF EXISTS "Allow public select" ON feedback;
DROP POLICY IF EXISTS "Allow public insert" ON feedback;
DROP POLICY IF EXISTS "Allow public update" ON feedback;

-- Create secure policies restricted to authenticated users
CREATE POLICY "Allow authenticated select" ON feedback
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert" ON feedback
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON feedback
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete" ON feedback
FOR DELETE TO authenticated USING (true);