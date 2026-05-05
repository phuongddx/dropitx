export function LandingFooter() {
  return (
    <footer className="border-t border-border px-6 max-[720px]:px-4 py-6 max-w-[1200px] mx-auto w-full">
      <div className="flex items-center justify-between max-[920px]:flex-col max-[920px]:gap-2">
        <span className="font-mono text-sm font-semibold text-muted-foreground">
          DropItX
        </span>
        <span className="meta">
          Built with Next.js
        </span>
      </div>
    </footer>
  );
}
