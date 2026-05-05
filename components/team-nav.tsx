"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Plus } from "lucide-react";

interface TeamNavItem {
  slug: string;
  name: string;
}

interface TeamNavProps {
  teams: TeamNavItem[];
}

/** Sidebar team section — renders team links + create button with new styling. */
export function TeamNav({ teams }: TeamNavProps) {
  const pathname = usePathname();

  if (teams.length === 0) {
    return (
      <Link
        href="/dashboard/teams/new"
        className="flex items-center gap-3 rounded-full px-3 py-2 text-sm hover:bg-fg-soft transition-colors duration-200 text-muted-foreground"
      >
        <Plus className="size-4" />
        Create Team
      </Link>
    );
  }

  return (
    <div className="space-y-1">
      {teams.map((t) => {
        const isActive = pathname === `/dashboard/teams/${t.slug}`;
        return (
          <Link
            key={t.slug}
            href={`/dashboard/teams/${t.slug}`}
            className={`flex items-center gap-3 rounded-full px-3 py-2 text-sm transition-colors duration-200 ${
              isActive
                ? "bg-fg-soft text-foreground font-medium"
                : "hover:bg-fg-soft"
            }`}
          >
            <Users className="size-4" />
            <span className="truncate">{t.name}</span>
          </Link>
        );
      })}
      <Link
        href="/dashboard/teams/new"
        className="flex items-center gap-3 rounded-full px-3 py-2 text-sm hover:bg-fg-soft transition-colors duration-200 text-muted-foreground"
      >
        <Plus className="size-4" />
        Create Team
      </Link>
    </div>
  );
}

/** Mobile team nav — single link to teams list page with active state. */
export function TeamNavMobile() {
  const pathname = usePathname();
  const isActive = pathname.startsWith("/dashboard/teams");

  return (
    <Link
      href="/dashboard/teams"
      className={`flex flex-col items-center justify-center gap-1 text-xs min-h-[44px] min-w-[44px] transition-colors ${
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Users className="size-4" />
      Teams
    </Link>
  );
}
