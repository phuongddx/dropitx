"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  BarChart3,
  Heart,
  Users,
  User,
  Search,
  Bell,
  Plus,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface Team {
  slug: string;
  name: string;
}

interface DashboardShellProps {
  user: { displayName: string; email: string; initials: string };
  teams: Team[];
  children: React.ReactNode;
}

const WORKSPACE_NAV = [
  { href: "/dashboard", label: "Shares", icon: FileText, exact: true },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/favorites", label: "Favorites", icon: Heart },
  { href: "/dashboard/teams", label: "Teams", icon: Users },
];

const ACCOUNT_NAV = [
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function DashboardShell({ user, teams, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const SidebarContent = (
    <>
      <div className="flex items-center gap-2.5 px-5 py-[18px]">
        <span className="flex size-6 items-center justify-center rounded-md border-[1.5px] border-foreground text-xs font-bold">
          D
        </span>
        <span className="text-[15px] font-bold tracking-tight">
          Drop<span className="text-primary">ItX</span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
        <p className="px-2.5 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          Workspace
        </p>
        {WORKSPACE_NAV.map((n) => {
          const active = isActive(n.href, n.exact);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md border-l-2 px-2.5 py-2 text-[13.5px] font-medium transition-colors",
                active
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <n.icon className="size-4" />
              {n.label}
            </Link>
          );
        })}

        {teams.length > 0 && (
          <>
            <p className="px-2.5 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              Teams
            </p>
            {teams.map((t) => {
              const active = pathname === `/dashboard/teams/${t.slug}`;
              return (
                <Link
                  key={t.slug}
                  href={`/dashboard/teams/${t.slug}`}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md border-l-2 px-2.5 py-2 text-[13.5px] font-medium transition-colors",
                    active
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Users className="size-4" />
                  <span className="truncate">{t.name}</span>
                </Link>
              );
            })}
          </>
        )}

        <p className="px-2.5 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          Account
        </p>
        {ACCOUNT_NAV.map((n) => {
          const active = isActive(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md border-l-2 px-2.5 py-2 text-[13.5px] font-medium transition-colors",
                active
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <n.icon className="size-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2.5 border-t border-border px-3 py-3">
        <span className="flex size-8 items-center justify-center rounded-full border border-border bg-muted text-[11px] font-semibold text-muted-foreground">
          {user.initials}
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold leading-tight">{user.displayName}</p>
          <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
        </div>
      </div>
    </>
  );

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-sidebar md:flex">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[260px] flex-col border-r border-border bg-sidebar">
            {SidebarContent}
          </aside>
        </div>
      )}

      <main className="flex min-w-0 flex-col">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3.5 border-b border-border bg-background px-6">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="grid size-8 place-items-center rounded-md border border-border md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </button>

          <div className="relative max-w-[440px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/70" />
            <input
              type="search"
              placeholder="Search shares, files, teams…"
              className="h-[34px] w-full rounded-md border border-border bg-muted/50 pl-9 pr-3 text-[13px] outline-none placeholder:text-muted-foreground/70 focus:border-primary/50 focus:bg-background"
            />
          </div>

          <div className="flex-1" />

          <Link
            href="/dashboard#upload"
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
          >
            <Plus className="size-3.5" />
            Upload
          </Link>
          <button
            type="button"
            className="relative grid size-8 place-items-center rounded-md border border-border"
            aria-label="Notifications"
          >
            <Bell className="size-3.5" />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full border-[1.5px] border-background bg-primary" />
          </button>
          <span className="grid size-8 cursor-pointer place-items-center rounded-full border border-border bg-muted text-[11px] font-semibold text-muted-foreground">
            {user.initials}
          </span>
        </header>

        <div className="w-full max-w-[1280px] flex-1 px-6 py-6 pb-14 max-[880px]:px-4">
          {children}
        </div>
      </main>
    </div>
  );
}
