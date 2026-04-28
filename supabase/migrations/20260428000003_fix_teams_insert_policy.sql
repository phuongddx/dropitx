-- Fix: ensure INSERT policy on teams is correct after policy replacements.
-- Re-create all teams policies explicitly to guarantee correctness.

DROP POLICY IF EXISTS "Authenticated users can create teams" ON teams;
CREATE POLICY "Authenticated users can create teams" ON teams FOR INSERT
  TO authenticated WITH CHECK (true);
