"use client";

import { Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function ExpiredState() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
          <Clock className="size-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Link Expired
          </h1>
          <p className="text-sm text-muted-foreground">
            This shared link has expired and is no longer available. The content
            has been removed.
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to DropItX
        </Link>
      </div>
    </div>
  );
}
