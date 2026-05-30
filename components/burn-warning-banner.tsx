"use client";

import { AlertTriangle, Flame } from "lucide-react";

interface BurnWarningBannerProps {
  className?: string;
}

export function BurnWarningBanner({ className = "" }: BurnWarningBannerProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border border-orange-500/40 bg-orange-500/10 p-4 ${className}`}
    >
      <Flame className="size-5 shrink-0 text-orange-500 mt-0.5" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
          Burn After Reading
        </p>
        <p className="text-xs text-orange-600/80 dark:text-orange-400/70">
          This message will be permanently deleted after you view it. Save any
          important content before it&apos;s gone — it cannot be recovered.
        </p>
      </div>
      <AlertTriangle className="size-4 shrink-0 text-orange-500 mt-0.5" />
    </div>
  );
}
