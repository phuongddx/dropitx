import { cn } from "@/lib/utils"

interface PageHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ eyebrow, title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h1 className="text-2xl font-heading font-bold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="mt-1.5 text-sm text-muted-foreground max-w-lg leading-relaxed">{subtitle}</p>
      )}
      {children && <div className="mt-4 flex items-center gap-3">{children}</div>}
    </div>
  )
}
