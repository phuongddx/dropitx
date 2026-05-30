"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Loader2, Send, ChevronDown, User } from "lucide-react";
import { toast } from "sonner";
import { getApiUrl, getAuthHeaders } from "@/lib/api-client";

interface Comment {
  id: string;
  author_name: string | null;
  content: string;
  created_at: string;
  user_id: string | null;
}

interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  per_page: number;
}

interface CommentsSectionProps {
  slug: string;
  isAuthenticated: boolean;
}

function formatCommentDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function CommentsSection({ slug, isAuthenticated }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const perPage = 10;

  const fetchComments = useCallback(
    async (pageNum: number, append = false) => {
      try {
        const authHeaders = await getAuthHeaders();
        const url = getApiUrl(`/api/comments/${slug}?page=${pageNum}&per_page=${perPage}`);
        const res = await fetch(url, { headers: authHeaders });

        if (!res.ok) {
          if (!append) setComments([]);
          return;
        }

        const data: CommentsResponse = await res.json();
        setComments((prev) => (append ? [...prev, ...data.comments] : data.comments));
        setTotal(data.total);
        setPage(data.page);
      } catch {
        if (!append) setComments([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [slug]
  );

  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const authHeaders = await getAuthHeaders();
      const body: Record<string, string> = { content: content.trim() };
      if (!isAuthenticated && name.trim()) body.author_name = name.trim();

      const res = await fetch(getApiUrl(`/api/comments/${slug}`), {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to post comment" }));
        throw new Error(err.error || "Failed to post comment");
      }

      const newComment: Comment = await res.json();
      setComments((prev) => [newComment, ...prev]);
      setTotal((prev) => prev + 1);
      setContent("");
      setName("");
      toast.success("Comment posted!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const hasMore = comments.length < total;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="size-4" />
          Comments
          {total > 0 && (
            <span className="text-xs font-normal text-muted-foreground">({total})</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {!isAuthenticated && (
            <Input
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              className="h-9"
            />
          )}
          <div className="flex gap-2">
            <Textarea
              placeholder={isAuthenticated ? "Write a comment..." : "Write a comment as guest..."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
              rows={2}
              className="resize-none text-sm"
            />
            <Button
              type="submit"
              size="icon"
              disabled={submitting || !content.trim()}
              className="shrink-0 self-end"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
        </form>

        {/* Comment list */}
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Be the first!
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-3 rounded-lg border p-3"
              >
                <div className="shrink-0 size-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {comment.author_name || "Anonymous"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatCommentDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 mt-0.5 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}

            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-1"
                onClick={() => {
                  setLoadingMore(true);
                  fetchComments(page + 1, true);
                }}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
                Load more comments
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
