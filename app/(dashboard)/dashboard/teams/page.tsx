import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Plus, Clock } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyStateCard } from "@/components/empty-state-card";
import type { TeamRole } from "@/types/team";

interface TeamWithRole {
  id: string;
  name: string;
  slug: string;
  created_by: string;
  plan: string;
  created_at: string;
  role: TeamRole;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function TeamsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: memberships, error: membersError } = await supabase
    .from("team_members")
    .select("role, teams(id, name, slug, created_by, plan, created_at)")
    .eq("user_id", user.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const teams: TeamWithRole[] = ((memberships ?? []) as any[]).map((m) => {
    const t = Array.isArray(m.teams) ? m.teams[0] : m.teams;
    return {
      id: t?.id ?? "",
      name: t?.name ?? "",
      slug: t?.slug ?? "",
      created_by: t?.created_by ?? "",
      plan: t?.plan ?? "free",
      created_at: t?.created_at ?? "",
      role: m.role as TeamRole,
    };
  });

  return (
    <div className="space-y-6 max-w-[1200px]">
      <PageHeader
        eyebrow="/dashboard/teams"
        title="Teams"
        subtitle="Collaborate with others on shared drops"
      >
        <Link href="/dashboard/teams/new">
          <Button variant="pill" size="sm">
            <Plus className="size-4" />
            Create Team
          </Button>
        </Link>
      </PageHeader>

      {teams.length === 0 ? (
        <EmptyStateCard
          icon={Users}
          title="No teams yet"
          description="Create a team to collaborate with others on shared drops."
        />
      ) : (
        <div className="grid grid-cols-2 max-[920px]:grid-cols-1 gap-4">
          {teams.map((team) => (
            <Link key={team.id} href={`/dashboard/teams/${team.slug}`}>
              <Card className="rounded-[var(--radius-card)] shadow-[var(--shadow)] transition-colors duration-200 cursor-pointer">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="size-5 text-primary shrink-0" />
                    <p className="font-medium truncate flex-1">{team.name}</p>
                    <Badge variant={team.role} className="shrink-0 text-xs">
                      {team.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      Created {formatDate(team.created_at)}
                    </span>
                    <Badge variant="ghost" className="text-xs">
                      {team.plan}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
