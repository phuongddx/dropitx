"use client";

import { cn } from "@/lib/utils";
import { getFileIcon, formatFileSize } from "@/lib/file-utils";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface FileTab {
  slug: string;
  filename: string;
  mime_type: string;
  file_size: number | null;
  active?: boolean;
}

interface FileTabsProps {
  files: FileTab[];
  activeSlug: string;
  onSelect: (slug: string) => void;
  onClose?: (slug: string) => void;
  className?: string;
}

export function FileTabs({ files, activeSlug, onSelect, onClose, className }: FileTabsProps) {
  if (files.length <= 1) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1 overflow-x-auto border-b border-border/60 bg-muted/30 px-2 py-1 scrollbar-thin",
        className
      )}
    >
      {files.map((file) => {
        const isActive = file.slug === activeSlug;
        const Icon = getFileIcon(file.filename, file.mime_type);

        return (
          <button
            key={file.slug}
            onClick={() => onSelect(file.slug)}
            className={cn(
              "group flex items-center gap-1.5 rounded-t-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
              isActive
                ? "bg-background text-foreground border border-border/60 border-b-background -mb-px"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            <span className="truncate max-w-[120px]">{file.filename}</span>
            {file.file_size != null && (
              <Badge variant="ghost" className="text-[10px] px-1 py-0 h-4 font-normal">
                {formatFileSize(file.file_size)}
              </Badge>
            )}
            {onClose && files.length > 1 && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(file.slug);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    onClose(file.slug);
                  }
                }}
                className={cn(
                  "ml-1 rounded-sm p-0.5 hover:bg-destructive/10 hover:text-destructive transition-colors",
                  isActive ? "opacity-60 hover:opacity-100" : "opacity-0 group-hover:opacity-60 hover:!opacity-100"
                )}
              >
                <X className="size-3" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
