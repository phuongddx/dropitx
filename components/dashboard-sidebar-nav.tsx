"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardSidebarNavProps {
  items: NavItem[];
}

/** Sidebar nav links with active state using new design tokens. */
export function DashboardSidebarNav({ items }: DashboardSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = href === "/dashboard"
          ? pathname === "/dashboard"
          : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-full px-3 py-2 min-h-[40px] text-sm transition-colors duration-200 ${
              isActive
                ? "bg-fg-soft text-foreground font-medium"
                : "text-muted-foreground hover:bg-fg-soft hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
