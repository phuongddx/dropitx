import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Heart } from "lucide-react";
import { DashboardShareCard } from "@/components/dashboard-share-card";
import { PageHeader } from "@/components/page-header";
import { EmptyStateCard } from "@/components/empty-state-card";
import type { Share } from "@/types/share";
import type { ShareWithPasswordFlag } from "@/app/(dashboard)/dashboard/page";

interface FavoriteRow {
  share_id: string;
  created_at: string;
  shares: Share | null;
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
  const shares: ShareWithPasswordFlag[] = favList
    .map((f) => f.shares)
    .filter((s): s is Share => !!s)
    .map(({ password_hash, ...rest }) => ({ ...rest, has_password: !!password_hash }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="/dashboard/favorites"
        title="Favorites"
        subtitle="Shares you've hearted for quick access"
      />

      {shares.length === 0 ? (
        <EmptyStateCard
          icon={Heart}
          title="No favorites yet"
          description="Heart a share to save it here for quick access."
        />
      ) : (
        <div className="space-y-3">
          {shares.map((share) => (
            <DashboardShareCard key={share.id} share={share} />
          ))}
        </div>
      )}
    </div>
  );
}
