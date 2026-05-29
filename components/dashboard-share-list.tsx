"use client";

import { useState } from "react";
import { DashboardShareCard } from "@/components/dashboard-share-card";
import { TeamShareCard } from "@/components/team-share-card";
import { FileText, Upload } from "lucide-react";
import Link from "next/link";
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

export function DashboardShareList({
  personalShares,
  teams,
  teamShareMap,
}: DashboardShareListProps) {
  const [filter, setFilter] = useState<string>("personal");

  return (
    <div className="space-y-6">
      {/* Filter pills */}
      {teams.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilter("personal")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              filter === "personal"
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            Personal
          </button>
          {teams.map((t) => (
            <button
              key={t.slug}
              onClick={() => setFilter(t.slug)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === t.slug
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Share list */}
      {filter === "personal" ? (
        personalShares.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {personalShares.map((share) => (
              <DashboardShareCard key={share.id} share={share} />
            ))}
          </div>
        )
      ) : (
        <>
          {(() => {
            const teamShares = teamShareMap[filter] ?? [];
            const valid = teamShares.filter((r) => r.shares !== null);
            if (valid.length === 0) {
              return (
                <EmptyState message="No shares in this team yet." />
              );
            }
            return (
              <div className="space-y-3">
                {valid.map((row) => (
                  <TeamShareCard
                    key={row.shares!.id}
                    share={row.shares! as never}
                    teamName={teams.find((t) => t.slug === filter)?.name ?? ""}
                  />
                ))}
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}

function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <FileText className="size-7 text-primary" />
      </div>
      <p className="text-foreground font-medium mb-1">No shares yet</p>
      <p className="text-sm text-muted-foreground mb-4">
        {message || "Upload a file to get started."}
      </p>
      <Link
        href="/editor"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm shadow-primary/20 hover:opacity-90 transition-opacity"
      >
        <Upload className="size-3.5" />
        Create share
      </Link>
    </div>
  );
}
