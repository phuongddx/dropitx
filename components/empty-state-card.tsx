import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateCardProps {
  icon: LucideIcon
  title: string
  description?: string
  className?: string
}

export function EmptyStateCard({ icon: Icon, title, description, className }: EmptyStateCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border bg-card px-6 py-16 text-center",
        className
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-primary mb-4">
        <Icon className="size-7" />
      </div>
      <p className="text-base font-medium">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-xs">{description}</p>
      )}
    </div>
  )
}
