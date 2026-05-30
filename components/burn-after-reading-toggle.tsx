"use client";

import { Flame } from "lucide-react";

interface BurnAfterReadingToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function BurnAfterReadingToggle({
  enabled,
  onChange,
  disabled = false,
  compact = false,
}: BurnAfterReadingToggleProps) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
          enabled
            ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        title={enabled ? "Disable burn after reading" : "Enable burn after reading"}
      >
        <Flame className="size-3.5" />
        {enabled ? "Burn ON" : "Burn"}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Flame className={`size-4 ${enabled ? "text-orange-500" : "text-muted-foreground"}`} />
        <div>
          <span className="text-sm font-medium">Burn After Reading</span>
          <p className="text-xs text-muted-foreground">
            Message is deleted after first view
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
          enabled ? "bg-orange-500" : "bg-input"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
            enabled ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
