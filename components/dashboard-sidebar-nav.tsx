"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, BarChart3, Heart, User, type LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  FileText,
  BarChart3,
  Heart,
  User,
};

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface DashboardSidebarNavProps {
  items: NavItem[];
}

export function DashboardSidebarNav({ items }: DashboardSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map(({ href, label, icon }) => {
        const Icon = iconMap[icon];
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
            {Icon && <Icon className="size-4" />}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
