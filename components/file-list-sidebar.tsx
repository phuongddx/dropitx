"use client";

import { cn } from "@/lib/utils";
import { getFileIcon, formatFileSize, getFileTypeLabel } from "@/lib/file-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

export interface FileEntry {
  slug: string;
  filename: string;
  mime_type: string;
  file_size: number | null;
  download_count?: number;
  max_downloads?: number | null;
}

interface FileListSidebarProps {
  files: FileEntry[];
  activeSlug: string;
  onSelect: (slug: string) => void;
  className?: string;
}

export function FileListSidebar({ files, activeSlug, onSelect, className }: FileListSidebarProps) {
  if (files.length <= 1) return null;

  return (
    <div
      className={cn(
        "w-64 shrink-0 border-r border-border/60 bg-muted/20 overflow-y-auto",
        className
      )}
    >
      <div className="p-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Files ({files.length})
        </h3>
        <div className="space-y-1">
          {files.map((file) => {
            const isActive = file.slug === activeSlug;
            const Icon = getFileIcon(file.filename, file.mime_type);

            return (
              <button
                key={file.slug}
                onClick={() => onSelect(file.slug)}
                className={cn(
                  "w-full flex items-start gap-2.5 rounded-lg p-2.5 text-left transition-colors",
                  isActive
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted/50 border border-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0 mt-0.5",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm truncate",
                      isActive ? "font-medium text-foreground" : "text-foreground/80"
                    )}
                  >
                    {file.filename}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="ghost" className="text-[10px] px-1 py-0 h-3.5">
                      {getFileTypeLabel(file.filename, file.mime_type)}
                    </Badge>
                    {file.file_size != null && (
                      <span className="text-[10px] text-muted-foreground">
                        {formatFileSize(file.file_size)}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
