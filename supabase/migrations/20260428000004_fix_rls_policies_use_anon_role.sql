-- Fix: all RLS policies used "TO authenticated" but the 'authenticated' role
-- does not exist in this Supabase project (new publishable-key architecture uses
-- 'anon' role only). This caused error 42501 (INSUFFICIENT_PRIVILEGE) because
-- policies targeting a non-existent role are never evaluated, resulting in default-deny.
-- Fix: change all policies to "TO anon" and rely on auth.uid() IS NOT NULL checks
-- within USING/WITH CHECK for actual authentication.

-- Helper functions (already exist, re-create to be safe)
CREATE OR REPLACE FUNCTION current_user_has_team_role(p_team_id UUID, p_roles TEXT[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = p_team_id
      AND user_id = (SELECT auth.uid())
      AND role = ANY(p_roles)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION current_user_is_team_member(p_team_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = p_team_id
      AND user_id = (SELECT auth.uid())
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Teams policies
DROP POLICY IF EXISTS "Authenticated users can create teams" ON teams;
CREATE POLICY "Authenticated users can create teams" ON teams FOR INSERT
  TO anon WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Team members can read" ON teams;
CREATE POLICY "Team members can read" ON teams FOR SELECT
  TO anon USING ((SELECT auth.uid()) IS NOT NULL AND current_user_is_team_member(id));

DROP POLICY IF EXISTS "Team owners can update" ON teams;
CREATE POLICY "Team owners can update" ON teams FOR UPDATE
  TO anon
  USING ((SELECT auth.uid()) IS NOT NULL AND current_user_has_team_role(id, ARRAY['owner']))
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND current_user_has_team_role(id, ARRAY['owner']));

DROP POLICY IF EXISTS "Team owners can delete" ON teams;
CREATE POLICY "Team owners can delete" ON teams FOR DELETE
  TO anon USING ((SELECT auth.uid()) IS NOT NULL AND current_user_has_team_role(id, ARRAY['owner']));

-- Team members policies
DROP POLICY IF EXISTS "Team members can read members" ON team_members;
CREATE POLICY "Team members can read members" ON team_members FOR SELECT
  TO anon USING ((SELECT auth.uid()) IS NOT NULL AND current_user_is_team_member(team_id));

DROP POLICY IF EXISTS "Owners and editors can add members" ON team_members;
CREATE POLICY "Owners and editors can add members" ON team_members FOR INSERT
  TO anon WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_has_team_role(team_id, ARRAY['owner', 'editor'])
  );

DROP POLICY IF EXISTS "Owners can update member roles" ON team_members;
CREATE POLICY "Owners can update member roles" ON team_members FOR UPDATE
  TO anon
  USING ((SELECT auth.uid()) IS NOT NULL AND current_user_has_team_role(team_id, ARRAY['owner']))
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND current_user_has_team_role(team_id, ARRAY['owner']));

DROP POLICY IF EXISTS "Members can leave, owners can remove" ON team_members;
CREATE POLICY "Members can leave, owners can remove" ON team_members FOR DELETE
  TO anon USING (
    (SELECT auth.uid()) IS NOT NULL
    AND (
      user_id = (SELECT auth.uid())
      OR current_user_has_team_role(team_id, ARRAY['owner'])
    )
  );

-- Team invites policies
DROP POLICY IF EXISTS "Team members can read invites" ON team_invites;
CREATE POLICY "Team members can read invites" ON team_invites FOR SELECT
  TO anon USING ((SELECT auth.uid()) IS NOT NULL AND current_user_is_team_member(team_id));

DROP POLICY IF EXISTS "Owners and editors can create invites" ON team_invites;
CREATE POLICY "Owners and editors can create invites" ON team_invites FOR INSERT
  TO anon WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_has_team_role(team_id, ARRAY['owner', 'editor'])
  );

DROP POLICY IF EXISTS "Owners and editors can update invites" ON team_invites;
CREATE POLICY "Owners and editors can update invites" ON team_invites FOR UPDATE
  TO anon USING (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_has_team_role(team_id, ARRAY['owner', 'editor'])
  );

DROP POLICY IF EXISTS "Owners and editors can delete invites" ON team_invites;
CREATE POLICY "Owners and editors can delete invites" ON team_invites FOR DELETE
  TO anon USING (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_has_team_role(team_id, ARRAY['owner', 'editor'])
  );

-- Team shares policies
DROP POLICY IF EXISTS "Team members can read team shares" ON team_shares;
CREATE POLICY "Team members can read team shares" ON team_shares FOR SELECT
  TO anon USING ((SELECT auth.uid()) IS NOT NULL AND current_user_is_team_member(team_id));

DROP POLICY IF EXISTS "Editors can add shares to team" ON team_shares;
CREATE POLICY "Editors can add shares to team" ON team_shares FOR INSERT
  TO anon WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_has_team_role(team_id, ARRAY['owner', 'editor'])
  );

DROP POLICY IF EXISTS "Editors can remove shares from team" ON team_shares;
CREATE POLICY "Editors can remove shares from team" ON team_shares FOR DELETE
  TO anon USING (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_has_team_role(team_id, ARRAY['owner', 'editor'])
  );

-- API keys team policy
DROP POLICY IF EXISTS "Team editors can manage team keys" ON api_keys;
CREATE POLICY "Team editors can manage team keys" ON api_keys FOR ALL
  TO anon
  USING (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_has_team_role(team_id, ARRAY['owner', 'editor'])
  )
  WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_has_team_role(team_id, ARRAY['owner', 'editor'])
  );
