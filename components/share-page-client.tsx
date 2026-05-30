"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileTabs } from "@/components/file-tabs";
import { FileListSidebar } from "@/components/file-list-sidebar";
import { CommentsSection } from "@/components/comments-section";
import { HtmlViewer } from "@/components/html-viewer";
import { MarkdownViewerWrapper } from "@/components/markdown-viewer-wrapper";
import { Loader2 } from "lucide-react";
import type { GroupShare } from "@/types/share";

interface SharePageClientProps {
  groupFiles: GroupShare[];
  initialSlug: string;
  isAuthenticated: boolean;
  shareId: string;
}

export function SharePageClient({
  groupFiles,
  initialSlug,
  isAuthenticated,
  shareId,
}: SharePageClientProps) {
  const [activeSlug, setActiveSlug] = useState(initialSlug);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());

  const activeFile = groupFiles.find((f) => f.slug === activeSlug);
  const isMarkdown = activeFile?.mime_type === "text/markdown";

  const handleSelect = useCallback(
    async (slug: string) => {
      setActiveSlug(slug);

      // Already have content cached
      if (fileContents[slug]) return;

      // Fetch file content
      setLoadingFiles((prev) => new Set(prev).add(slug));
      try {
        const res = await fetch(`/api/shares/${slug}/content`);
        if (res.ok) {
          const data = await res.json();
          setFileContents((prev) => ({ ...prev, [slug]: data.content || "" }));
        }
      } catch {
        // Failed to load content
      } finally {
        setLoadingFiles((prev) => {
          const next = new Set(prev);
          next.delete(slug);
          return next;
        });
      }
    },
    [fileContents]
  );

  const activeContent = fileContents[activeSlug];
  const isLoadingContent = loadingFiles.has(activeSlug);

  // Build file tabs data
  const tabs = groupFiles.map((f) => ({
    slug: f.slug,
    filename: f.filename,
    mime_type: f.mime_type,
    file_size: f.file_size,
    active: f.slug === activeSlug,
  }));

  const sidebarFiles = groupFiles.map((f) => ({
    slug: f.slug,
    filename: f.filename,
    mime_type: f.mime_type,
    file_size: f.file_size,
    download_count: f.download_count,
    max_downloads: f.max_downloads,
  }));

  return (
    <>
      {/* File tabs for navigation */}
      <FileTabs
        files={tabs}
        activeSlug={activeSlug}
        onSelect={handleSelect}
      />

      {/* Content area with sidebar */}
      <div className="flex gap-0 rounded-lg overflow-hidden border border-border/60">
        {/* File list sidebar (hidden on mobile) */}
        <FileListSidebar
          files={sidebarFiles}
          activeSlug={activeSlug}
          onSelect={handleSelect}
          className="hidden md:block"
        />

        {/* File content */}
        <div className="flex-1 min-w-0">
          {isLoadingContent ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : activeSlug === initialSlug ? (
            // Show server-rendered content for initial file
            <div className={isMarkdown ? "p-4 md:p-6" : "p-2"}>
              {/* Content was already fetched client-side if needed */}
              {activeContent !== undefined ? (
                isMarkdown ? (
                  <MarkdownViewerWrapper content={activeContent} />
                ) : (
                  <HtmlViewer htmlContent={activeContent} />
                )
              ) : (
                <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
                  Select a file to view
                </div>
              )}
            </div>
          ) : (
            <div className={isMarkdown ? "p-4 md:p-6" : "p-2"}>
              {activeContent !== undefined ? (
                isMarkdown ? (
                  <MarkdownViewerWrapper content={activeContent} />
                ) : (
                  <HtmlViewer htmlContent={activeContent} />
                )
              ) : (
                <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
                  Select a file to view
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comments section */}
      <CommentsSection
        shareId={shareId}
        slug={activeSlug}
        isAuthenticated={isAuthenticated}
      />
    </>
  );
}
