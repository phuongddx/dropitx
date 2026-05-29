import { Github } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 px-6 max-[720px]:px-4 py-10 max-w-[1200px] mx-auto w-full">
      <div className="flex items-center justify-between max-[920px]:flex-col max-[920px]:gap-4">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center size-7 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
            D
          </span>
          <span className="font-display text-sm font-semibold text-foreground">
            DropItX
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            © {new Date().getFullYear()}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/phuongddx/dropitx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="size-4" />
          </a>
          <span className="text-xs text-muted-foreground">
            Built with Next.js
          </span>
        </div>
      </div>
    </footer>
  );
}
