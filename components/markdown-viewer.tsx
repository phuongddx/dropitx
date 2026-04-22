"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { getHighlighter } from "@/lib/shiki-highlighter";
import "@/app/markdown-viewer.css";

interface MarkdownViewerProps {
  content: string;
}

type ViewMode = "preview" | "raw";

function useTheme(): "dark" | "light" {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  useEffect(() => {
    const update = () => {
      setTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light"
      );
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  return theme;
}

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function CodeBlock({ inline, className, children }: CodeBlockProps) {
  const theme = useTheme();
  const [html, setHtml] = useState<string | null>(null);
  const lang = /language-(\w+)/.exec(className ?? "")?.[1] ?? "text";
  const code = String(children ?? "").replace(/\n$/, "");

  useEffect(() => {
    if (inline) return;
    let cancelled = false;
    getHighlighter().then((hl) => {
      if (cancelled) return;
      try {
        const result = hl.codeToHtml(code, {
          lang,
          theme: theme === "dark" ? "github-dark" : "github-light",
        });
        setHtml(result);
      } catch {
        // fallback: unknown language
        const result = hl.codeToHtml(code, {
          lang: "text",
          theme: theme === "dark" ? "github-dark" : "github-light",
        });
        setHtml(result);
      }
    });
    return () => { cancelled = true; };
  }, [code, lang, theme, inline]);

  if (inline) {
    return <code className={className}>{children}</code>;
  }

  if (html) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        className="not-prose"
      />
    );
  }

  return (
    <pre className="shiki">
      <code>{code}</code>
    </pre>
  );
}

const mdComponents: Components = {
  code: CodeBlock as Components["code"],
};

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  const [mode, setMode] = useState<ViewMode>("preview");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end">
        <div className="inline-flex rounded-md border bg-muted p-1 text-muted-foreground text-xs gap-1">
          <button
            onClick={() => setMode("preview")}
            className={`rounded px-3 py-1 font-medium transition-colors ${
              mode === "preview"
                ? "bg-background text-foreground shadow-sm"
                : "hover:text-foreground"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setMode("raw")}
            className={`rounded px-3 py-1 font-medium transition-colors ${
              mode === "raw"
                ? "bg-background text-foreground shadow-sm"
                : "hover:text-foreground"
            }`}
          >
            Raw
          </button>
        </div>
      </div>

      {mode === "preview" ? (
        <div className="markdown-body px-2 py-1">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {content}
          </ReactMarkdown>
        </div>
      ) : (
        <pre className="markdown-raw">{content}</pre>
      )}
    </div>
  );
}
