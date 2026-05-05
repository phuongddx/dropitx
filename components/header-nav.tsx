"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/nav-links";
import { useAuthUser } from "@/lib/use-auth-user";

export function HeaderNav() {
  const pathname = usePathname();
  const user = useAuthUser();

  return (
    <nav
      className="hidden max-[920px]:hidden md:flex items-center rounded-full bg-surface border border-border gap-2 px-2 py-1 overflow-x-auto"
      aria-label="Main navigation"
    >
      {NAV_LINKS.map(({ href, label, icon: Icon, iconOnly, authOnly }) => {
        if (authOnly && !user) return null;
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 min-h-[36px] text-sm font-medium transition-colors duration-200 whitespace-nowrap
              ${
                isActive
                  ? "bg-fg-soft text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Icon className="size-4" />
            {!iconOnly && label}
          </Link>
        );
      })}
    </nav>
  );
}
