import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { hasValidAccessCookie } from "@/lib/share-access-cookie";
import { sha256, generateTrackingToken } from "@/lib/analytics-track";
import { PasswordGate } from "@/components/password-gate";
import { HtmlViewer } from "@/components/html-viewer";
import { MarkdownViewerWrapper } from "@/components/markdown-viewer-wrapper";
import { EmbedSnippet } from "@/components/embed-snippet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookmarkToggle } from "@/components/bookmark-toggle";
import { ShareViewedTracker } from "@/components/share-viewed-tracker";
import { ShareAnalyticsTracker } from "@/components/share-analytics-tracker";
import { QrCodeButton } from "@/components/qr-code-button";
import { CommentsSection } from "@/components/comments-section";
import { BulkDownloadButton } from "@/components/bulk-download-button";
import {
  FileCode,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  File,
  Eye,
  Clock,
  Calendar,
  Download,
  Users,
} from "lucide-react";
import type { Share } from "@/types/share";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://dropitx.com";

interface SharePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { slug } = await params;
  const adminClient = createAdminClient();

  const { data: share } = await adminClient
    .from("shares")
    .select("id, slug, filename, title, view_count, created_at, is_private, password_hash")
    .eq("slug", slug)
    .single<Share>();

  if (!share) return { title: "Not Found" };

  if (share.is_private || !!share.password_hash) {
    return {
      title: "Protected DropItX Document",
      description: "This content requires authentication to view",
      openGraph: {
        title: "Protected DropItX Document",
        description: "This content requires authentication to view",
        siteName: "DropItX",
        images: [{ url: `${SITE_URL}/og-card-default.png`, width: 1200, height: 630 }],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: "Protected DropItX Document",
        description: "This content requires authentication to view",
        images: [`${SITE_URL}/og-card-default.png`],
      },
    };
  }

  const title = share.title ?? share.filename;
  const description = `Shared via DropItX — ${share.view_count} views`;
  const ogImageUrl = `${SITE_URL}/api/og-image/${share.slug}`;
  const shareUrl = `${SITE_URL}/s/${share.slug}`;

  return {
    title: `${title} — DropItX`,
    description,
    openGraph: {
      title,
      description,
      url: shareUrl,
      siteName: "DropItX",
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileTypeIcon(mimeType: string, filename: string) {
  const mime = mimeType?.toLowerCase() ?? "";
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";

  if (mime.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
    return { icon: FileImage, label: "Image", color: "bg-pink-500/10 text-pink-600 border-pink-500/20" };
  if (mime.startsWith("video/") || ["mp4", "webm", "mov"].includes(ext))
    return { icon: FileVideo, label: "Video", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" };
  if (mime.startsWith("audio/") || ["mp3", "wav", "flac"].includes(ext))
    return { icon: FileAudio, label: "Audio", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext))
    return { icon: FileArchive, label: "Archive", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" };
  if (ext === "pdf" || mime === "application/pdf")
    return { icon: FileText, label: "PDF", color: "bg-red-500/10 text-red-600 border-red-500/20" };
  if (mime === "text/markdown" || ["md", "markdown"].includes(ext))
    return { icon: FileText, label: "Markdown", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
  if (mime === "text/html" || ["html", "htm"].includes(ext))
    return { icon: FileCode, label: "HTML", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" };

  return { icon: File, label: ext.toUpperCase() || "File", color: "bg-muted text-muted-foreground" };
}

function isRenderableContent(mimeType: string): boolean {
  return mimeType === "text/html" || mimeType === "text/markdown";
}

function isImageType(mimeType: string, filename: string): boolean {
  const mime = mimeType?.toLowerCase() ?? "";
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return mime.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
}

function isPdfType(mimeType: string, filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return ext === "pdf" || mimeType === "application/pdf";
}

export default async function SharePage({ params }: SharePageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();

  const adminClient = createAdminClient();
  const { data: share, error: fetchError } = await adminClient
    .from("shares")
    .select("id,slug,filename,storage_path,content_text,file_size,mime_type,delete_token,user_id,title,custom_slug,source,is_private,password_hash,created_at,updated_at,expires_at,view_count,max_downloads,download_count,group_id")
    .eq("slug", slug)
    .single<Share>();

  if (fetchError || !share) notFound();

  if (share.expires_at && new Date(share.expires_at) < new Date()) notFound();

  // --- ACCESS GATE ---
  const authClient = createClient(cookieStore);
  const { data: { user } } = await authClient.auth.getUser();
  const isOwner = !!user && user.id === share.user_id;

  if (!isOwner) {
    if (share.is_private) notFound();

    if (!(await hasValidAccessCookie(slug))) {
      if (share.password_hash) {
        return <PasswordGate slug={slug} title={share.title ?? share.filename} />;
      }

      if (!user) {
        redirect(`/auth/login?next=/s/${slug}`);
      }
    }
  }
  // --- END ACCESS GATE ---

  // Record view + increment count
  const reqHeaders = await headers();
  const ip =
    reqHeaders.get("cf-connecting-ip") ??
    reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "";
  const country =
    reqHeaders.get("cf-ipcountry") ??
    reqHeaders.get("x-vercel-ip-country") ??
    null;
  const ua = reqHeaders.get("user-agent") ?? "";
  const visitorHash = await sha256(`${ip}:${ua}`);

  let trackingToken = "";
  let viewCount = share.view_count + 1;

  try {
    const { data: viewResult } = await adminClient.rpc("record_and_increment_share_view", {
      p_share_slug: slug,
      p_visitor_hash: visitorHash,
      p_referrer: null,
      p_referrer_source: "direct",
      p_country_code: country,
    });
    const row = (viewResult as Array<{ tracking_token: string; is_unique: boolean }>)?.[0];
    if (row?.tracking_token) {
      trackingToken = await generateTrackingToken(share.id, row.tracking_token);
    }
    viewCount = share.view_count + 1;
  } catch {
    const { data: newCount } = await adminClient.rpc("increment_view_count", {
      share_slug: slug,
    });
    viewCount = typeof newCount === "number" ? newCount : share.view_count + 1;
  }

  // Download limit check
  const downloadsRemaining = share.max_downloads != null
    ? share.max_downloads - share.download_count
    : null;
  const isDownloadExceeded = share.max_downloads != null && downloadsRemaining !== null && downloadsRemaining <= 0;

  // Fetch file content for renderable types
  let fileContent: string | null = null;
  const renderable = isRenderableContent(share.mime_type);

  if (renderable) {
    const { data: fileData, error: storageError } = await adminClient.storage
      .from("html-files")
      .download(share.storage_path);

    if (!storageError && fileData) {
      fileContent = await fileData.text();
    }
  }

  // Fetch group files if this share is part of a group
  let groupFiles: Array<{
    slug: string;
    filename: string;
    mime_type: string;
    file_size: number | null;
    download_count: number;
    max_downloads: number | null;
  }> = [];

  if (share.group_id) {
    const { data: groupData } = await adminClient
      .from("shares")
      .select("slug, filename, mime_type, file_size, download_count, max_downloads")
      .eq("group_id", share.group_id)
      .order("created_at", { ascending: true });

    groupFiles = groupData ?? [];
  }

  const isMarkdown = share.mime_type === "text/markdown";
  const fileTypeInfo = getFileTypeIcon(share.mime_type, share.filename);
  const TypeIcon = fileTypeInfo.icon;
  const isImage = isImageType(share.mime_type, share.filename);
  const isPdf = isPdfType(share.mime_type, share.filename);

  // Get signed URL for non-renderable file download
  let signedDownloadUrl: string | null = null;
  if (!renderable && !isDownloadExceeded) {
    const { data: signedData } = await adminClient.storage
      .from("html-files")
      .createSignedUrl(share.storage_path, 3600); // 1 hour
    signedDownloadUrl = signedData?.signedUrl ?? null;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 max-w-[1200px] mx-auto w-full animate-fade-in">
      <ShareViewedTracker />
      <ShareAnalyticsTracker shareId={share.id} trackingToken={trackingToken} />

      {/* Main card with file info */}
      <Card>
        <CardHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`shrink-0 p-2 rounded-lg border ${fileTypeInfo.color}`}>
                <TypeIcon className="size-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="truncate text-lg">{share.title || share.filename}</CardTitle>
                {share.title && share.title !== share.filename && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {share.filename}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className={fileTypeInfo.color}>
                {fileTypeInfo.label}
              </Badge>
              <BookmarkToggle shareId={share.id} slug={share.slug} />
              <QrCodeButton slug={share.slug} />
            </div>
          </div>

          <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {formatUploadDate(share.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-3" />
              {viewCount} views
            </span>
            {share.file_size && (
              <span>{formatFileSize(share.file_size)}</span>
            )}
            {share.expires_at && (
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                Expires in {formatExpiresIn(share.expires_at)}
              </span>
            )}
            {share.max_downloads != null && (
              <span className="flex items-center gap-1">
                <Download className="size-3" />
                {downloadsRemaining !== null && downloadsRemaining > 0
                  ? `${downloadsRemaining} download${downloadsRemaining !== 1 ? "s" : ""} remaining`
                  : "Download limit reached"}
              </span>
            )}
            {share.group_id && groupFiles.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="size-3" />
                {groupFiles.length} file{groupFiles.length !== 1 ? "s" : ""} in group
              </span>
            )}
          </CardDescription>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-2">
            {signedDownloadUrl && !isDownloadExceeded && (
              <a href={signedDownloadUrl} download={share.filename}>
                <Button size="sm" className="gap-1.5">
                  <Download className="size-3.5" />
                  Download
                  {downloadsRemaining !== null && (
                    <span className="text-xs opacity-70">
                      ({downloadsRemaining} left)
                    </span>
                  )}
                </Button>
              </a>
            )}
            {share.group_id && groupFiles.length > 1 && (
              <BulkDownloadButton
                groupSlug={share.group_id}
                fileCount={groupFiles.length}
                size="sm"
                variant="outline"
              />
            )}
            {isDownloadExceeded && (
              <Button size="sm" disabled className="gap-1.5">
                <Download className="size-3.5" />
                Download limit reached
              </Button>
            )}
          </div>

          {/* Embed snippet — only for non-restricted public shares */}
          {!share.is_private && !share.password_hash && (
            <div className="mt-3">
              <EmbedSnippet slug={share.slug} />
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Group file list */}
      {share.group_id && groupFiles.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4" />
              Group Files ({groupFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {groupFiles.map((file) => {
                const info = getFileTypeIcon(file.mime_type, file.filename);
                const Icon = info.icon;
                const remaining = file.max_downloads != null
                  ? file.max_downloads - file.download_count
                  : null;
                const exceeded = remaining !== null && remaining <= 0;

                return (
                  <div
                    key={file.slug}
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className={`shrink-0 p-1.5 rounded border ${info.color}`}>
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={`/s/${file.slug}`}
                        className="text-sm font-medium hover:underline truncate block"
                      >
                        {file.filename}
                      </a>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        {file.file_size && <span>{formatFileSize(file.file_size)}</span>}
                        {remaining !== null && (
                          <span>{exceeded ? "Limit reached" : `${remaining} downloads left`}</span>
                        )}
                      </div>
                    </div>
                    {!exceeded && (
                      <a href={`/s/${file.slug}`}>
                        <Button variant="ghost" size="icon-sm">
                          <Download className="size-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content viewer */}
      {renderable && fileContent ? (
        <Card>
          <CardContent className={isMarkdown ? "p-4 md:p-6" : "p-2"}>
            {isMarkdown ? (
              <MarkdownViewerWrapper content={fileContent} />
            ) : (
              <HtmlViewer htmlContent={fileContent} />
            )}
          </CardContent>
        </Card>
      ) : isImage && signedDownloadUrl ? (
        <Card>
          <CardContent className="p-4 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={signedDownloadUrl}
              alt={share.filename}
              className="max-w-full max-h-[70vh] rounded-lg object-contain"
            />
          </CardContent>
        </Card>
      ) : isPdf && signedDownloadUrl ? (
        <Card>
          <CardContent className="p-2">
            <iframe
              src={signedDownloadUrl}
              className="w-full h-[70vh] rounded-lg border-0"
              title={share.filename}
            />
          </CardContent>
        </Card>
      ) : !renderable ? (
        <Card>
          <CardContent className="p-8 flex flex-col items-center gap-4">
            <div className={`p-4 rounded-xl border ${fileTypeInfo.color}`}>
              <TypeIcon className="size-10" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">{share.filename}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {share.file_size ? formatFileSize(share.file_size) : "Unknown size"} &middot; {fileTypeInfo.label}
              </p>
            </div>
            {!isDownloadExceeded && signedDownloadUrl && (
              <a href={signedDownloadUrl} download={share.filename}>
                <Button size="lg" className="gap-2">
                  <Download className="size-5" />
                  Download File
                  {downloadsRemaining !== null && (
                    <span className="text-xs opacity-70">
                      ({downloadsRemaining} remaining)
                    </span>
                  )}
                </Button>
              </a>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Comments section */}
      <CommentsSection slug={slug} isAuthenticated={!!user} />
    </div>
  );
}
