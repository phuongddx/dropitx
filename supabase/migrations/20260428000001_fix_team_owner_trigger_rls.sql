-- Fix: infinite recursion in RLS policies on team_members.
-- Root cause: RLS policies on team_members query team_members in WITH CHECK/USING,
-- which re-triggers the same policies → infinite recursion.
-- Fix: SECURITY DEFINER helper functions bypass RLS for membership checks,
-- breaking the recursion cycle. Also fixes add_team_owner trigger.

-- =============================================================================
-- 1. Helper functions (SECURITY DEFINER bypasses RLS on team_members)
-- =============================================================================

-- Check if current user has a specific role in a team (bypasses RLS)
CREATE OR REPLACE FUNCTION current_user_has_team_role(p_team_id UUID, p_roles TEXT[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = p_team_id
      AND user_id = (SELECT auth.uid())
      AND role = ANY(p_roles)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Check if current user is any member of a team (bypasses RLS)
CREATE OR REPLACE FUNCTION current_user_is_team_member(p_team_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = p_team_id
      AND user_id = (SELECT auth.uid())
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- =============================================================================
-- 2. Replace all team_members self-referencing policies
-- =============================================================================

DROP POLICY IF EXISTS "Team members can read members" ON team_members;
CREATE POLICY "Team members can read members" ON team_members FOR SELECT
  TO authenticated USING (current_user_is_team_member(team_id));

DROP POLICY IF EXISTS "Owners and editors can add members" ON team_members;
CREATE POLICY "Owners and editors can add members" ON team_members FOR INSERT
  TO authenticated WITH CHECK (current_user_has_team_role(team_id, ARRAY['owner', 'editor']));

DROP POLICY IF EXISTS "Owners can update member roles" ON team_members;
CREATE POLICY "Owners can update member roles" ON team_members FOR UPDATE
  TO authenticated USING (current_user_has_team_role(team_id, ARRAY['owner']))
  WITH CHECK (current_user_has_team_role(team_id, ARRAY['owner']));

DROP POLICY IF EXISTS "Members can leave, owners can remove" ON team_members;
CREATE POLICY "Members can leave, owners can remove" ON team_members FOR DELETE
  TO authenticated USING (
    user_id = (SELECT auth.uid())
    OR current_user_has_team_role(team_id, ARRAY['owner'])
  );

-- =============================================================================
-- 3. Replace teams policies that reference team_members (same recursion risk)
-- =============================================================================

DROP POLICY IF EXISTS "Team members can read" ON teams;
CREATE POLICY "Team members can read" ON teams FOR SELECT
  TO authenticated USING (current_user_is_team_member(id));

DROP POLICY IF EXISTS "Team owners can update" ON teams;
CREATE POLICY "Team owners can update" ON teams FOR UPDATE
  TO authenticated USING (current_user_has_team_role(id, ARRAY['owner']))
  WITH CHECK (current_user_has_team_role(id, ARRAY['owner']));

DROP POLICY IF EXISTS "Team owners can delete" ON teams;
CREATE POLICY "Team owners can delete" ON teams FOR DELETE
  TO authenticated USING (current_user_has_team_role(id, ARRAY['owner']));

-- =============================================================================
-- 4. Replace team_invites and team_shares policies
-- =============================================================================

DROP POLICY IF EXISTS "Team members can read invites" ON team_invites;
CREATE POLICY "Team members can read invites" ON team_invites FOR SELECT
  TO authenticated USING (current_user_is_team_member(team_id));

DROP POLICY IF EXISTS "Owners and editors can create invites" ON team_invites;
CREATE POLICY "Owners and editors can create invites" ON team_invites FOR INSERT
  TO authenticated WITH CHECK (current_user_has_team_role(team_id, ARRAY['owner', 'editor']));

DROP POLICY IF EXISTS "Owners and editors can update invites" ON team_invites;
CREATE POLICY "Owners and editors can update invites" ON team_invites FOR UPDATE
  TO authenticated USING (current_user_has_team_role(team_id, ARRAY['owner', 'editor']));

DROP POLICY IF EXISTS "Owners and editors can delete invites" ON team_invites;
CREATE POLICY "Owners and editors can delete invites" ON team_invites FOR DELETE
  TO authenticated USING (current_user_has_team_role(team_id, ARRAY['owner', 'editor']));

DROP POLICY IF EXISTS "Team members can read team shares" ON team_shares;
CREATE POLICY "Team members can read team shares" ON team_shares FOR SELECT
  TO authenticated USING (current_user_is_team_member(team_id));

DROP POLICY IF EXISTS "Editors can add shares to team" ON team_shares;
CREATE POLICY "Editors can add shares to team" ON team_shares FOR INSERT
  TO authenticated WITH CHECK (current_user_has_team_role(team_id, ARRAY['owner', 'editor']));

DROP POLICY IF EXISTS "Editors can remove shares from team" ON team_shares;
CREATE POLICY "Editors can remove shares from team" ON team_shares FOR DELETE
  TO authenticated USING (current_user_has_team_role(team_id, ARRAY['owner', 'editor']));

-- =============================================================================
-- 5. Replace api_keys team policy
-- =============================================================================

DROP POLICY IF EXISTS "Team editors can manage team keys" ON api_keys;
CREATE POLICY "Team editors can manage team keys" ON api_keys FOR ALL
  TO authenticated USING (
    current_user_has_team_role(team_id, ARRAY['owner', 'editor'])
  ) WITH CHECK (
    current_user_has_team_role(team_id, ARRAY['owner', 'editor'])
  );

-- =============================================================================
-- 6. Fix add_team_owner trigger (SECURITY DEFINER + direct role switch)
-- =============================================================================

CREATE OR REPLACE FUNCTION add_team_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- SECURITY DEFINER runs as postgres (superuser), bypasses RLS
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner')
  ON CONFLICT (team_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
