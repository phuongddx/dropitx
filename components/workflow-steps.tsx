import { Upload, Link2, Share2 } from "lucide-react";

const STEPS = [
  {
    number: 1,
    icon: Upload,
    title: "Drop your file",
    description:
      "Drag and drop an HTML or Markdown file onto the upload zone. Click to browse if you prefer.",
  },
  {
    number: 2,
    icon: Link2,
    title: "Get a short link",
    description:
      "A unique shareable link is generated instantly. Copy it with one click.",
  },
  {
    number: 3,
    icon: Share2,
    title: "Share anywhere",
    description:
      "Send the link to teammates, clients, or embed it in docs. No sign-up required for viewers.",
  },
];

export function WorkflowSteps() {
  return (
    <section className="relative px-6 max-[720px]:px-4 py-24 max-w-[1200px] mx-auto">
      {/* Section header */}
      <div className="flex flex-col items-center text-center gap-3 mb-14">
        <p className="eyebrow">How it works</p>
        <h2 className="heading-fluid-md font-display font-bold tracking-tight">
          Three steps. That&apos;s it.
        </h2>
      </div>

      <div className="relative grid grid-cols-3 max-[1100px]:grid-cols-2 max-[920px]:grid-cols-1 gap-8">
        {/* Connecting line (desktop only) */}
        <div className="pointer-events-none absolute top-14 left-[16.6%] right-[16.6%] hidden max-[920px]:hidden h-px bg-gradient-to-r from-transparent via-border to-transparent" style={{ display: 'grid' }} />

        {STEPS.map(({ number, icon: Icon, title, description }) => (
          <div
            key={number}
            className="relative flex flex-col items-center text-center gap-4 p-8 rounded-[var(--radius-card)] border border-border bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-md"
          >
            {/* Numbered circle with icon */}
            <div className="relative">
              <span className="flex items-center justify-center size-14 rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </span>
              <span className="absolute -top-2 -right-2 flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs font-bold font-mono shadow-sm">
                {number}
              </span>
            </div>

            <h3 className="text-base font-display font-semibold text-foreground">
              {title}
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
