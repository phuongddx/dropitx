"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Upload, Lock, Copy, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { Share } from "@/types/share";

export type ShareWithPasswordFlag = Omit<Share, "password_hash"> & {
  has_password: boolean;
};

interface TeamOption {
  slug: string;
  name: string;
}

interface TeamShareItem {
  created_at: string;
  shared_by: string;
  shares: {
    id: string;
    slug: string;
    filename: string;
    title: string | null;
    mime_type: string;
    view_count: number;
    file_size: number | null;
    created_at: string;
  } | null;
}

interface DashboardShareListProps {
  personalShares: ShareWithPasswordFlag[];
  teams: TeamOption[];
  teamShareMap: Record<string, TeamShareItem[]>;
}

function fileType(mime: string): "pdf" | "doc" | "img" | "code" | "zip" | "file" {
  if (mime.includes("pdf")) return "pdf";
  if (mime.includes("word") || mime.includes("doc")) return "doc";
  if (mime.startsWith("image/")) return "img";
  if (mime.includes("markdown") || mime.includes("text") || mime.includes("html")) return "code";
  if (mime.includes("zip") || mime.includes("compressed")) return "zip";
  return "file";
}

const FILE_ICON_CLASS: Record<string, string> = {
  pdf: "bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-900",
  doc: "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900",
  img: "bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-900",
  code: "bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-900",
  zip: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/40 dark:border-yellow-900",
  file: "bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-700",
};

const FILE_TYPE_LABEL: Record<string, string> = {
  pdf: "PDF",
  doc: "DOC",
  img: "IMG",
  code: "MD",
  zip: "ZIP",
  file: "FILE",
};

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DashboardShareList({
  personalShares,
  teams,
  teamShareMap,
}: DashboardShareListProps) {
  const [filter, setFilter] = useState<string>("personal");
  const [selectedId, setSelectedId] = useState<string | null>(
    personalShares[0]?.id ?? null
  );

  const tabs = [
    { id: "personal", label: "Personal", count: personalShares.length },
    ...teams.map((t) => ({
      id: t.slug,
      label: t.name,
      count: (teamShareMap[t.slug] ?? []).filter((r) => r.shares !== null).length,
    })),
  ];

  type Row = {
    id: string;
    slug: string;
    filename: string;
    title: string | null;
    mime_type: string;
    view_count: number;
    file_size: number | null;
    created_at: string;
    has_password: boolean;
    shared_by?: string;
  };

  const rows: Row[] =
    filter === "personal"
      ? personalShares.map((s) => ({
          id: s.id,
          slug: s.slug,
          filename: s.filename,
          title: s.title,
          mime_type: s.mime_type,
          view_count: s.view_count,
          file_size: s.file_size,
          created_at: s.created_at,
          has_password: s.has_password,
        }))
      : (teamShareMap[filter] ?? [])
          .filter((r) => r.shares !== null)
          .map((r) => ({
            id: r.shares!.id,
            slug: r.shares!.slug,
            filename: r.shares!.filename,
            title: r.shares!.title,
            mime_type: r.shares!.mime_type,
            view_count: r.shares!.view_count,
            file_size: r.shares!.file_size,
            created_at: r.shares!.created_at,
            has_password: false,
            shared_by: r.shared_by,
          }));

  const selected = rows.find((r) => r.id === selectedId) ?? rows[0] ?? null;

  return (
    <div className="space-y-5">
      {teams.length > 0 && (
        <div className="flex items-center gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
                filter === t.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {t.label}
              <span className="ml-1.5 opacity-60">{t.count}</span>
            </button>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[380px_1fr] lg:items-start">
          {/* Master list */}
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            {rows.map((r) => {
              const ft = fileType(r.mime_type);
              const isSel = selected?.id === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedId(r.id)}
                  className={cn(
                    "relative grid w-full grid-cols-[30px_1fr_auto] items-center gap-3 border-b border-border px-3.5 py-3 text-left transition-colors last:border-b-0",
                    isSel ? "bg-accent" : "hover:bg-muted/60"
                  )}
                >
                  {isSel && (
                    <span className="absolute bottom-0 left-0 top-0 w-0.5 bg-primary" />
                  )}
                  <span
                    className={cn(
                      "relative h-8 w-6 rounded border",
                      FILE_ICON_CLASS[ft]
                    )}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold">
                      {r.title || r.filename}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="rounded border border-border bg-background px-1.5 py-px font-semibold">
                        {FILE_TYPE_LABEL[ft]}
                      </span>
                      {r.has_password ? (
                        <span className="flex items-center gap-1">
                          <Lock className="size-2.5" /> Pwd
                        </span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400">Public</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px] text-muted-foreground">
                    {r.view_count.toLocaleString()}
                    <br />
                    views
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail pane */}
          {selected && (
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="flex items-start gap-4 border-b border-border p-5">
                <div
                  className={cn(
                    "grid h-[76px] w-16 shrink-0 place-items-center rounded-md border text-[10px] uppercase text-muted-foreground/70",
                    FILE_ICON_CLASS[fileType(selected.mime_type)]
                  )}
                >
                  [ thumb ]
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
                    <span className="rounded border border-border bg-background px-2 py-0.5 font-semibold">
                      {FILE_TYPE_LABEL[fileType(selected.mime_type)]}
                    </span>
                    {selected.has_password ? (
                      <span className="flex items-center gap-1">
                        <Lock className="size-3" /> Password protected
                      </span>
                    ) : (
                      <span className="text-green-600 dark:text-green-400">Public</span>
                    )}
                  </div>
                  <h3 className="mt-1 text-[17px] font-bold tracking-tight">
                    {selected.title || selected.filename}
                  </h3>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {selected.filename} · {formatSize(selected.file_size)} · created{" "}
                    {formatDate(selected.created_at)}
                  </p>
                  <div className="mt-3.5 flex items-center gap-2">
                    <code className="flex-1 truncate rounded-md border border-border bg-muted/60 px-3 py-2 font-mono text-xs text-muted-foreground">
                      dropitx.io/s/{selected.slug}
                    </code>
                    <button
                      type="button"
                      className={cn(buttonVariants({ size: "sm" }))}
                    >
                      <Copy className="size-3.5" /> Copy
                    </button>
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      <QrCode className="size-3.5" /> QR
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-b border-border p-5 md:grid-cols-4">
                <DetailStat label="Views" value={selected.view_count.toLocaleString()} />
                <DetailStat label="File size" value={formatSize(selected.file_size)} />
                <DetailStat
                  label="Type"
                  value={FILE_TYPE_LABEL[fileType(selected.mime_type)]}
                />
                <DetailStat label="Created" value={formatDate(selected.created_at)} />
              </div>

              <div className="flex flex-wrap gap-2 border-b border-border p-5">
                <Link
                  href={`/s/${selected.slug}`}
                  className={cn(buttonVariants({ size: "sm" }))}
                >
                  Open share
                </Link>
                <Link
                  href={`/dashboard/analytics/${selected.slug}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  View analytics
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-base font-bold">{value}</p>
    </div>
  );
}

function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-lg border border-border">
        <FileText className="size-5 text-muted-foreground" />
      </span>
      <p className="font-semibold">No shares yet</p>
      <p className="mb-4 text-sm text-muted-foreground">
        {message || "Upload a file to get started."}
      </p>
      <Link href="/editor" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
        <Upload className="size-3.5" />
        Create share
      </Link>
    </div>
  );
}

