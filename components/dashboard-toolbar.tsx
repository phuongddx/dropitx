"use client";

import { SearchBar } from "@/components/search-bar";
import { AuthUserMenu } from "@/components/auth-user-menu";
import { InviteNotificationBell } from "@/components/invite-notification-bell";

/**
 * Dashboard content toolbar — replaces HeaderBar role inside dashboard.
 * Left: compact SearchBar. Right: invite bell + auth user menu.
 */
export function DashboardToolbar() {
  return (
    <div className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md px-6 max-[720px]:px-4 py-3">
      <div className="flex items-center justify-between gap-4 max-w-[1200px] mx-auto w-full">
        <div className="flex-1 max-w-md">
          <SearchBar compact />
        </div>
        <div className="flex items-center gap-2">
          <InviteNotificationBell />
          <AuthUserMenu />
        </div>
      </div>
    </div>
  );
}
