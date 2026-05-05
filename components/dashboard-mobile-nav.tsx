"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { TeamNavMobile } from "@/components/team-nav";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardMobileNavProps {
  items: NavItem[];
}

/** Mobile bottom nav with active state and new design tokens. */
export function DashboardMobileNav({ items }: DashboardMobileNavProps) {
  const pathname = usePathname();

  return (
    <div className="hidden max-[920px]:flex fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-accent-line bg-card" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="flex justify-around py-2 w-full">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 text-xs min-h-[44px] min-w-[44px] transition-colors ${
                isActive
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-full ${isActive ? "bg-fg-soft" : ""}`}>
                <Icon className="size-4" />
              </div>
              {label}
            </Link>
          );
        })}
        <TeamNavMobile />
      </div>
    </div>
  );
}
