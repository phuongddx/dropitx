import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { HtmlViewer } from "@/components/html-viewer";
import { MarkdownViewerWrapper } from "@/components/markdown-viewer-wrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Share } from "@/types/share";

interface SharePageProps {
  params: Promise<{ slug: string }>;
}

function formatExpiresIn(expiresAt: string): string {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - now.getTime();

  if (diffMs <= 0) return "Expired";

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffDays > 0) return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
}

function formatUploadDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SharePage({ params }: SharePageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Lookup share by slug
  const { data: share, error: fetchError } = await supabase
    .from("shares")
    .select("*")
    .eq("slug", slug)
    .single<Share>();

  if (fetchError || !share) {
    notFound();
  }

  // Check expiration
  if (share.expires_at && new Date(share.expires_at) < new Date()) {
    notFound();
  }

  // Increment view count atomically via RPC
  const { data: newCount } = await supabase.rpc("increment_view_count", {
    share_slug: slug,
  });
  const viewCount = typeof newCount === "number" ? newCount : share.view_count + 1;

  // Fetch HTML content from storage
  const { data: fileData, error: storageError } = await supabase.storage
    .from("html-files")
    .download(share.storage_path);

  if (storageError || !fileData) {
    notFound();
  }

  const fileContent = await fileData.text();
  const isMarkdown = share.mime_type === "text/markdown";

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      {/* Metadata header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="truncate">{share.filename}</CardTitle>
            <Badge variant="secondary" className="shrink-0 text-xs">
              {isMarkdown ? "MD" : "HTML"}
            </Badge>
          </div>
          <CardDescription className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span>Uploaded {formatUploadDate(share.created_at)}</span>
            <span>{viewCount} views</span>
            {share.expires_at && (
              <span>Expires in {formatExpiresIn(share.expires_at)}</span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* File viewer */}
      <Card>
        <CardContent className={isMarkdown ? "p-4 md:p-6" : "p-2"}>
          {isMarkdown ? (
            <MarkdownViewerWrapper content={fileContent} />
          ) : (
            <HtmlViewer htmlContent={fileContent} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
