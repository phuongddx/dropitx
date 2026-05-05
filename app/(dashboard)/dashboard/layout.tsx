import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { TeamNav } from "@/components/team-nav";
import { DashboardSidebarNav } from "@/components/dashboard-sidebar-nav";
import { DashboardMobileNav } from "@/components/dashboard-mobile-nav";
import { DashboardToolbar } from "@/components/dashboard-toolbar";

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

  const navItems = [
    { href: "/dashboard", label: "History", icon: "FileText" },
    { href: "/dashboard/analytics", label: "Analytics", icon: "BarChart3" },
    { href: "/dashboard/favorites", label: "Favorites", icon: "Heart" },
    { href: "/dashboard/profile", label: "Profile", icon: "User" },
  ];

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
    <div className="flex min-h-screen">
      {/* Sidebar — new design with brand header */}
      <aside className="flex max-[920px]:hidden w-[232px] flex-col border-r border-accent-line bg-surface rounded-tr-[28px]">
        {/* Brand section */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center size-8 rounded-lg border border-accent-line font-mono text-sm font-bold text-primary">
              &gt;
            </div>
            <div>
              <p className="font-mono text-sm font-bold text-foreground leading-tight">
                dropitx
              </p>
              <p className="meta">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <div className="flex-1 px-3 space-y-1">
          <DashboardSidebarNav items={navItems} />

          {/* Teams section */}
          <div className="pt-3 mt-3 border-t border-accent-line">
            <p className="eyebrow px-3 mb-1">
              Teams
            </p>
            <TeamNav teams={teams} />
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <DashboardMobileNav items={navItems} />

      {/* Main content area */}
      <main className="flex-1 overflow-auto">
        <DashboardToolbar />
        <div className="p-6 max-[920px]:p-4 pb-6 max-[920px]:pb-24 max-w-[1200px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
