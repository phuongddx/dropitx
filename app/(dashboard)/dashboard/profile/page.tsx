import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { PageHeader } from "@/components/page-header";

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  github: "GitHub",
};

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const providers = (user.app_metadata?.provider ?? "")
    .split(",")
    .filter(Boolean)
    .map((p: string) => PROVIDER_LABELS[p] ?? p);

  return (
    <div className="max-w-[680px]">
      <PageHeader
        eyebrow="/dashboard/profile"
        title="Profile"
        subtitle="Manage your account information"
      />
      <div className="rounded-[var(--radius-card)] border border-border bg-card p-6">
        <ProfileForm
          userId={user.id}
          displayName={profile?.display_name ?? ""}
          avatarUrl={profile?.avatar_url ?? ""}
          email={user.email ?? ""}
          providers={providers}
        />
      </div>
    </div>
  );
}
