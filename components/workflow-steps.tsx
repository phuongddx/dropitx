const STEPS = [
  {
    number: 1,
    title: "Drop your file",
    description:
      "Drag and drop an HTML or Markdown file onto the upload zone. Click to browse if you prefer.",
  },
  {
    number: 2,
    title: "Get a short link",
    description:
      "A unique shareable link is generated instantly. Copy it with one click.",
  },
  {
    number: 3,
    title: "Share anywhere",
    description:
      "Send the link to teammates, clients, or embed it in docs. No sign-up required for viewers.",
  },
];

export function WorkflowSteps() {
  return (
    <section className="px-6 max-[720px]:px-4 py-20 max-w-[1200px] mx-auto">
      <div className="grid grid-cols-3 max-[1100px]:grid-cols-2 max-[920px]:grid-cols-1 gap-8">
        {STEPS.map(({ number, title, description }) => (
          <div
            key={number}
            className="flex flex-col gap-4 p-6 rounded-[var(--radius-card)] border border-border bg-card"
          >
            {/* Numbered circle */}
            <span className="flex items-center justify-center size-10 rounded-full bg-accent-soft text-sm font-bold text-primary font-mono">
              {number}
            </span>

            <h3 className="text-base font-semibold text-foreground">
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
