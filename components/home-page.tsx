import Link from "next/link";
import { LandingFooter } from "@/components/landing-footer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Lock, BarChart3, Users, ArrowRight } from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Upload",
    body: "Drag any file — PDF, DOCX, MD, images, code. We generate a hosted preview instantly.",
  },
  {
    num: "02",
    title: "Share",
    body: "Grab a link. Add a password. Set an expiry. Decide who can comment or download.",
  },
  {
    num: "03",
    title: "Track",
    body: "See who opened it, how long they stayed, and where they dropped off — in real time.",
  },
];

const FEATURES = [
  {
    icon: Lock,
    title: "Password protection",
    body: "Per-link passwords, one-time view codes, and domain lock. Revoke access any time.",
  },
  {
    icon: BarChart3,
    title: "View analytics",
    body: "Unique viewers, dwell time, scroll depth, and drop-off — exported to CSV in one click.",
  },
  {
    icon: Users,
    title: "Team collaboration",
    body: "Shared workspaces, role-based permissions, and comments that thread by paragraph.",
  },
];

export function HomePage() {
  return (
    <div className="flex flex-col bg-background">
      {/* Hero */}
      <section className="px-6 py-18">
        <div className="mx-auto max-w-[820px] text-center">
          <p className="eyebrow animate-hero" style={{ animationDelay: "0ms" }}>Document sharing, reimagined</p>
          <h1 className="heading-fluid-md mt-4 animate-hero" style={{ animationDelay: "80ms" }}>
            Upload a file. Share a link.
            <br />
            <span className="text-muted-foreground">Watch who opens it.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[560px] text-lg text-muted-foreground animate-hero" style={{ animationDelay: "160ms" }}>
            Password-protected links, real-time view tracking, and a clean preview —
            for briefs, decks, contracts, and anything you used to email.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 animate-hero" style={{ animationDelay: "240ms" }}>
            <Link href="/auth/login" className={cn(buttonVariants({ size: "lg" }), "gap-2 cta-glow")}>
              Upload your first drop <ArrowRight className="size-4" />
            </Link>
            <Link href="/s/example" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              See a live share
            </Link>
          </div>
          <p className="meta mt-4 animate-hero" style={{ animationDelay: "320ms" }}>No credit card · Free up to 100 drops/mo</p>
        </div>

      </section>

      {/* How it works */}
      <section className="border-y border-border bg-card py-12">
        <div className="mx-auto max-w-[1120px] px-6">
          <div className="mb-10 text-center">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 text-[32px] font-bold tracking-tight">
              Three steps. Under thirty seconds.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.num} className="rounded-lg border border-border bg-background p-6 card-lift">
                <span className="flex size-7 items-center justify-center rounded-full border border-border font-mono text-xs font-semibold text-muted-foreground">
                  {s.num}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-18 px-6" id="features">
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Built in</p>
              <h2 className="mt-3 text-[32px] font-bold tracking-tight">
                Everything you used four tools for.
              </h2>
            </div>
            <Link href="#" className={buttonVariants({ variant: "ghost" })}>
              All features →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-lg border border-border bg-card p-6 card-lift">
                <span className="flex size-9 items-center justify-center rounded-lg border-[1.5px] border-foreground">
                  <f.icon className="size-4" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="border-y border-border bg-muted/40 py-12">
        <div className="mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-12 px-6 md:grid-cols-2">
          <div>
            <p className="eyebrow">Why teams switch</p>
            <h2 className="mt-4 text-[30px] font-bold leading-tight tracking-tight">
              &ldquo;We replaced Drive links, DocuSign drafts, and a Loom habit with one tab.&rdquo;
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              — Maya Okafor, Head of Design Ops at Northwind
            </p>
            <div className="mt-6 flex">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="size-8 -ml-2 rounded-full border-2 border-background bg-muted first:ml-0"
                  style={{ marginLeft: i === 0 ? 0 : -8 }}
                />
              ))}
            </div>
            <p className="meta mt-3">Joined by 8,400+ teams this quarter</p>
          </div>
          <div className="h-[280px] rounded-md border border-dashed border-border bg-background" />
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-18 text-center">
        <div className="mx-auto max-w-[640px]">
          <h2 className="text-[34px] font-bold tracking-tight">
            Your next file deserves more than a Drive link.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Upload in seconds. Know the moment it&apos;s opened.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/auth/login" className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
              Upload your first drop <ArrowRight className="size-4" />
            </Link>
            <Link href="/auth/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Log in
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
