import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch user displayName/email
  const displayName =
    (user.user_metadata as { display_name?: string; full_name?: string } | undefined)
      ?.display_name ??
    (user.user_metadata as { display_name?: string; full_name?: string } | undefined)
      ?.full_name ??
    user.email?.split("@")[0] ??
    "User";
  const email = user.email ?? "";
  const initials = displayName
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Fetch user's teams for sidebar nav
  const { data: memberships } = await supabase
    .from("team_members")
    .select("teams(slug, name)")
    .eq("user_id", user.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const teams = ((memberships ?? []) as any[]).map((m) => {
    const t = Array.isArray(m.teams) ? m.teams[0] : m.teams;
    return { slug: t?.slug ?? "", name: t?.name ?? "" };
  });

  return (
    <DashboardShell
      user={{ displayName, email, initials }}
      teams={teams}
    >
      {children}
    </DashboardShell>
  );
}

