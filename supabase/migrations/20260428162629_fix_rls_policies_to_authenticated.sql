-- Fix: Change all team-related RLS policies from TO anon to TO authenticated.
-- Root cause: publishable key + logged-in user → PostgREST uses "authenticated" role.
-- Policies set TO anon never matched → all queries returned 0 rows → redirect.
-- This reverts the incorrect change from migration 20260428000004.

-- TEAMS
DROP POLICY IF EXISTS "Team members can read" ON teams;
DROP POLICY IF EXISTS "Authenticated users can create teams" ON teams;
DROP POLICY IF EXISTS "Team owners can update" ON teams;
DROP POLICY IF EXISTS "Team owners can delete" ON teams;

CREATE POLICY "Team members can read" ON teams FOR SELECT
  TO authenticated USING (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_is_team_member(id)
  );

CREATE POLICY "Authenticated users can create teams" ON teams FOR INSERT
  TO authenticated WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Team owners can update" ON teams FOR UPDATE
  TO authenticated USING (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_has_team_role(id, ARRAY['owner'])
  ) WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_has_team_role(id, ARRAY['owner'])
  );

CREATE POLICY "Team owners can delete" ON teams FOR DELETE
  TO authenticated USING (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_has_team_role(id, ARRAY['owner'])
  );

-- TEAM_MEMBERS
DROP POLICY IF EXISTS "Team members can read members" ON team_members;
DROP POLICY IF EXISTS "Owners and editors can add members" ON team_members;
DROP POLICY IF EXISTS "Owners can update member roles" ON team_members;
DROP POLICY IF EXISTS "Members can leave, owners can remove" ON team_members;

CREATE POLICY "Team members can read members" ON team_members FOR SELECT
  TO authenticated USING (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_is_team_member(team_id)
  );

CREATE POLICY "Owners and editors can add members" ON team_members FOR INSERT
  TO authenticated WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_has_team_role(team_id, ARRAY['owner', 'editor'])
  );

CREATE POLICY "Owners can update member roles" ON team_members FOR UPDATE
  TO authenticated USING (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_has_team_role(team_id, ARRAY['owner'])
  ) WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_has_team_role(team_id, ARRAY['owner'])
  );

CREATE POLICY "Members can leave, owners can remove" ON team_members FOR DELETE
  TO authenticated USING (
    (SELECT auth.uid()) IS NOT NULL
    AND (user_id = (SELECT auth.uid())
         OR current_user_has_team_role(team_id, ARRAY['owner']))
  );

-- TEAM_INVITES
DROP POLICY IF EXISTS "Team members can read invites" ON team_invites;
DROP POLICY IF EXISTS "Owners and editors can create invites" ON team_invites;
DROP POLICY IF EXISTS "Owners and editors can update invites" ON team_invites;
DROP POLICY IF EXISTS "Owners and editors can delete invites" ON team_invites;

CREATE POLICY "Team members can read invites" ON team_invites FOR SELECT
  TO authenticated USING (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_is_team_member(team_id)
  );

CREATE POLICY "Owners and editors can create invites" ON team_invites FOR INSERT
  TO authenticated WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_has_team_role(team_id, ARRAY['owner', 'editor'])
  );

CREATE POLICY "Owners and editors can update invites" ON team_invites FOR UPDATE
  TO authenticated USING (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_has_team_role(team_id, ARRAY['owner', 'editor'])
  );

CREATE POLICY "Owners and editors can delete invites" ON team_invites FOR DELETE
  TO authenticated USING (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_has_team_role(team_id, ARRAY['owner', 'editor'])
  );

-- TEAM_SHARES
DROP POLICY IF EXISTS "Team members can read team shares" ON team_shares;
DROP POLICY IF EXISTS "Editors can add shares to team" ON team_shares;
DROP POLICY IF EXISTS "Editors can remove shares from team" ON team_shares;

CREATE POLICY "Team members can read team shares" ON team_shares FOR SELECT
  TO authenticated USING (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_is_team_member(team_id)
  );

CREATE POLICY "Editors can add shares to team" ON team_shares FOR INSERT
  TO authenticated WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_has_team_role(team_id, ARRAY['owner', 'editor'])
  );

CREATE POLICY "Editors can remove shares from team" ON team_shares FOR DELETE
  TO authenticated USING (
    (SELECT auth.uid()) IS NOT NULL
    AND current_user_has_team_role(team_id, ARRAY['owner', 'editor'])
  );

-- API_KEYS (team-scoped policy)
DROP POLICY IF EXISTS "Team editors can manage team keys" ON api_keys;

CREATE POLICY "Team editors can manage team keys" ON api_keys FOR ALL
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = api_keys.team_id AND user_id = (SELECT auth.uid()) AND role IN ('owner', 'editor')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = api_keys.team_id AND user_id = (SELECT auth.uid()) AND role IN ('owner', 'editor')
    )
  );
