"use client";

import { Flame, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function BurnedState() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-orange-500/10">
          <Flame className="size-8 text-orange-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Message Burned
          </h1>
          <p className="text-sm text-muted-foreground">
            This message was set to &quot;burn after reading&quot; and has been
            permanently deleted. It cannot be recovered.
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
