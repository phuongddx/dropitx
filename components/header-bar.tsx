"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { HeaderNav } from "@/components/header-nav";
import { HeaderMobileDrawer } from "@/components/header-mobile-drawer";
import { AuthUserMenu } from "@/components/auth-user-menu";

export function HeaderBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between h-12 px-4 max-w-7xl mx-auto">
          {/* Left: hamburger (mobile) + logo */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1 hover:bg-muted rounded-md"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
            </button>
            <Link
              href="/"
              className="font-mono text-lg font-bold tracking-tight"
            >
              [x]{" "}
              <span className="text-violet-600 dark:text-violet-400">
                dropitx
              </span>
            </Link>
          </div>
          {/* Center: desktop nav */}
          <HeaderNav />
          {/* Right: auth */}
          <AuthUserMenu />
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
