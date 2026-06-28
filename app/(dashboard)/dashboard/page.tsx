import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { DashboardShareList } from "@/components/dashboard-share-list";
import type { Share } from "@/types/share";

export type ShareWithPasswordFlag = Omit<Share, "password_hash"> & { has_password: boolean };

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: shares } = await supabase
    .from("shares")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const shareList: ShareWithPasswordFlag[] = (shares ?? []).map((s: Share) => {
    const { password_hash, ...rest } = s;
    return { ...rest, has_password: !!password_hash };
  });
  const totalShares = shareList.length;
  const totalViews = shareList.reduce((sum, s) => sum + s.view_count, 0);
  const totalSize = shareList.reduce((sum, s) => sum + (s.file_size ?? 0), 0);

  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id, teams(slug, name)")
    .eq("user_id", user.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const teams = ((memberships ?? []) as any[]).map((m) => {
    const t = Array.isArray(m.teams) ? m.teams[0] : m.teams;
    return { id: m.team_id as string, slug: t?.slug ?? "", name: t?.name ?? "" };
  });

  const teamShareQueries = teams.map(async (team) => {
    const { data: teamShares } = await supabase
      .from("team_shares")
      .select("created_at, shared_by, shares(id, slug, filename, title, mime_type, view_count, file_size, created_at)")
      .eq("team_id", team.id)
      .order("created_at", { ascending: false });
    return { slug: team.slug, shares: teamShares ?? [] };
  });
  const teamShareResults = await Promise.all(teamShareQueries);

  const teamShareMap: Record<string, unknown[]> = {};
  for (const { slug, shares } of teamShareResults) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    teamShareMap[slug] = shares as any[];
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Shares</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Pick a share on the left to inspect its link, access, and viewers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Total Shares" value={totalShares.toLocaleString()} />
        <StatTile label="Total Views" value={totalViews.toLocaleString()} />
        <StatTile label="Storage Used" value={formatFileSize(totalSize)} />
      </div>

      <DashboardShareList
        personalShares={shareList}
        teams={teams.map((t) => ({ slug: t.slug, name: t.name }))}
        teamShareMap={teamShareMap as Record<string, { created_at: string; shared_by: string; shares: { id: string; slug: string; filename: string; title: string | null; mime_type: string; view_count: number; file_size: number | null; created_at: string } | null }[]>}
      />
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3.5 rounded-lg border border-border bg-card px-4 py-3.5">
      <div className="size-9 shrink-0 rounded-md border border-border" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-mono text-xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
}

