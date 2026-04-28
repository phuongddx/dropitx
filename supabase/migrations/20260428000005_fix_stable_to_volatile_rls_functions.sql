-- Fix: change STABLE to VOLATILE on RLS helper functions.
-- STABLE functions in RLS USING clauses can have result caching issues
-- within a single statement context, causing policies to return stale results.
-- VOLATILE forces re-evaluation per row, which is correct for auth.uid().

CREATE OR REPLACE FUNCTION current_user_has_team_role(p_team_id UUID, p_roles TEXT[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = p_team_id
      AND user_id = (SELECT auth.uid())
      AND role = ANY(p_roles)
  );
$$ LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION current_user_is_team_member(p_team_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = p_team_id
      AND user_id = (SELECT auth.uid())
  );
$$ LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public;
