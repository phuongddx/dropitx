"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadDropzone, type UploadResult } from "@/components/upload-dropzone";
import { ShareLink } from "@/components/share-link";
import { HeroCanvas } from "@/components/hero-canvas";
import { ArrowRight, Sparkles } from "lucide-react";

/** Mini-proof items shown below CTA buttons */
const PROOF_ITEMS = [
  { label: "50 MB", description: "per file" },
  { label: "Markdown + HTML", description: "supported" },
  { label: "Auto-expire", description: "after 30 days" },
];

export function HeroSection() {
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  return (
    <section className="relative overflow-hidden px-6 max-[720px]:px-4 pb-24 pt-16 max-w-[1200px] mx-auto">
      {/* Dot-grid background — slightly stronger for orange tint */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] dark:opacity-[0.09]"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative grid grid-cols-2 max-[920px]:grid-cols-1 gap-16 items-center">
        {/* Left: copy column */}
        <div className="flex flex-col gap-7">
          <div className="inline-flex items-center gap-2 w-fit rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
            <Sparkles className="size-3.5 text-primary" />
            <span className="font-mono text-xs font-medium text-primary">Fast file sharing</span>
          </div>

          <h1 className="heading-fluid-lg font-display font-bold tracking-tight">
            Drop files.
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--primary), oklch(0.85 0.14 60))",
              }}
            >
              Share instantly.
            </span>
          </h1>

          <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
            Drop an HTML or Markdown file, get a shareable link in seconds.
            No sign-up walls. No bloated dashboards. Just drop and go.
          </p>

          <div className="flex items-center gap-3">
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
              Get started <ArrowRight className="size-4" />
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              View on GitHub
            </Button>
          </div>

          {/* Mini-proof grid */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/60 max-w-md">
            {PROOF_ITEMS.map((item) => (
              <div key={item.label} className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">{item.label}</span>
                <span className="meta">{item.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: hero canvas with real upload */}
        <div className="relative flex flex-col gap-4">
          {/* Geometric decoration */}
          <div className="pointer-events-none absolute -top-8 -right-8 size-48 rounded-full bg-primary/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 size-32 rounded-full bg-primary/3 blur-2xl" />

          <div className="relative">
            <HeroCanvas onUploadSuccess={setUploadResult} />
          </div>

          {/* Share link result */}
          {uploadResult && (
            <div className="w-full animate-slide-up">
              <ShareLink result={uploadResult} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
