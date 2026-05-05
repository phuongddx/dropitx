import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  icon: LucideIcon
  value: string | number
  label: string
  className?: string
}

export function StatCard({ icon: Icon, value, label, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-[var(--radius-card)] border border-border bg-card px-5 py-4",
        className
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-primary">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="font-mono text-2xl font-bold tabular-nums tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground truncate">{label}</p>
      </div>
    </div>
  )
}
