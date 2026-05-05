"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { HeaderNav } from "@/components/header-nav";
import { HeaderMobileDrawer } from "@/components/header-mobile-drawer";
import { AuthUserMenu } from "@/components/auth-user-menu";
import { InviteNotificationBell } from "@/components/invite-notification-bell";

export function HeaderBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between h-14 px-6 max-[720px]:px-4 max-w-[1200px] mx-auto">
          {/* Left: hamburger (mobile) + logo */}
          <div className="flex items-center gap-3">
            <button
              className="hidden max-[920px]:flex items-center justify-center size-10 hover:bg-muted rounded-md text-foreground"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              {/* Logo-mark: ">" in a bordered rounded box */}
              <span className="flex items-center justify-center size-7 rounded-lg border border-border font-mono text-sm font-bold text-primary bg-background">
                &gt;
              </span>
              <span className="font-mono text-lg font-bold tracking-tight text-primary">
                dropitx
              </span>
            </Link>
          </div>
          {/* Center: desktop nav */}
          <HeaderNav />
          {/* Right: bell + auth */}
          <div className="flex items-center gap-2">
            <InviteNotificationBell />
            <AuthUserMenu />
          </div>
        </div>
      </header>
      {/* Mobile drawer */}
      <HeaderMobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
