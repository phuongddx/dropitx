import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Heart, Star, Copy } from "lucide-react";
import type { Share } from "@/types/share";
import type { ShareWithPasswordFlag } from "@/app/(dashboard)/dashboard/page";

interface FavoriteRow {
  share_id: string;
  created_at: string;
  shares: Share | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function FavoritesPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: favorites } = await supabase
    .from("favorites")
    .select("share_id, created_at, shares(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const favList = (favorites ?? []) as unknown as FavoriteRow[];
  const shares: (ShareWithPasswordFlag & { favorited_at: string })[] = favList
    .map((f) => f.shares)
    .filter((s): s is Share => !!s)
    .map(({ password_hash, ...rest }, i) => ({
      ...rest,
      has_password: !!password_hash,
      favorited_at: favList[i].created_at,
    }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight">Favorites</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Shares you&apos;ve bookmarked for quick access.
        </p>
      </div>

      {shares.length === 0 ? (
        <div className="grid place-items-center rounded-lg border border-dashed border-border bg-card py-16 text-center">
          <span className="mb-3 flex size-12 items-center justify-center rounded-lg border border-border">
            <Heart className="size-5 text-muted-foreground" />
          </span>
          <p className="font-semibold">No favorites yet</p>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">
            Bookmark shares to pin them here for quick access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shares.map((share) => (
            <div
              key={share.id}
              className="flex flex-col rounded-lg border border-border bg-card p-4"
            >
              <div className="mb-3 h-24 rounded-md border border-dashed border-border bg-muted/30" />
              <div className="flex items-center gap-2">
                <p className="flex-1 truncate text-sm font-semibold">
                  {share.title || share.filename}
                </p>
                <Star className="size-3.5 fill-primary text-primary" />
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="rounded border border-border bg-background px-1.5 py-px font-semibold">
                  {share.mime_type.split("/")[1]?.toUpperCase() || "FILE"}
                </span>
                <span>{share.view_count.toLocaleString()} views</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3">
                <Link
                  href={`/s/${share.slug}`}
                  className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-semibold hover:bg-muted"
                >
                  Open
                </Link>
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-semibold hover:bg-muted"
                >
                  <Copy className="size-3" /> Copy
                </button>
                <span className="ml-auto text-[11px] text-muted-foreground">
                  Added {formatDate(share.favorited_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

