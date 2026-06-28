import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Product", href: "#features" },
  { label: "Explore", href: "/search" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#" },
];

export function PublicNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-6 px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md border-[1.5px] border-foreground">
            <span className="size-2 rounded-[2px] bg-foreground" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Drop<span className="text-primary">ItX</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/auth/login"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Log in
          </Link>
          <Link
            href="/auth/login"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
