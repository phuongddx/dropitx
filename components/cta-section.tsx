import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

export function CTASection() {
  return (
    <section className="px-6 max-[720px]:px-4 py-24 max-w-[1200px] mx-auto">
      <div className="relative overflow-hidden rounded-[var(--radius-section)] border border-border bg-gradient-to-br from-card via-card to-primary/5 px-8 py-16 shadow-lg">
        {/* Geometric decorations */}
        <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 size-32 rounded-full bg-primary/3 blur-2xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative flex flex-col items-center text-center gap-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
            <Zap className="size-3.5 text-primary" />
            <span className="font-mono text-xs font-medium text-primary">No account needed</span>
          </div>

          <h2 className="heading-fluid-md font-display font-bold tracking-tight">
            Ready to drop?
          </h2>

          <p className="text-muted-foreground text-base max-w-md leading-relaxed">
            Start sharing files in seconds. Drop your first file and see how fast it is.
          </p>

          <div className="flex items-center gap-3 max-[920px]:flex-col max-[920px]:w-full">
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
              Get started <ArrowRight className="size-4" />
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              View on GitHub
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
