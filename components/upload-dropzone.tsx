"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, CheckCircle2, XCircle, X } from "lucide-react";
import { trackEvent, AnalyticsEvent } from "@/lib/analytics";
import { authFetch } from "@/lib/api-client";
import { getFileIcon, formatFileSize, canPreview } from "@/lib/file-utils";
import { cn } from "@/lib/utils";

export interface UploadResult {
  slug: string;
  url: string;
  filename: string;
  deleteToken: string;
}

export interface MultiUploadResult {
  group_slug: string;
  group_url: string;
  files: Array<{ slug: string; url: string; filename: string }>;
}

interface QueuedFile {
  file: File;
  id: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

interface UploadDropzoneProps {
  onUploadSuccess: (result: UploadResult) => void;
  onMultiUploadSuccess?: (result: MultiUploadResult) => void;
  multiple?: boolean;
}

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

const MAX_SIZE = 500 * 1024 * 1024; // 500MB

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function UploadDropzone({
  onUploadSuccess,
  onMultiUploadSuccess,
  multiple = false,
}: UploadDropzoneProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Multi-file state
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);

  const uploadSingleFile = useCallback(
    async (file: File) => {
      setState("uploading");
      setErrorMessage("");

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await authFetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          setState("error");
          setErrorMessage(data.error || "Upload failed.");
          return;
        }

        setState("success");
        trackEvent(AnalyticsEvent.DOCUMENT_UPLOADED, {
          type: file.name.split(".").pop() || "unknown",
          size_kb: Math.round(file.size / 1024),
        });
        onUploadSuccess(data as UploadResult);
      } catch {
        setState("error");
        setErrorMessage("Network error. Please try again.");
      }
    },
    [onUploadSuccess],
  );

  const uploadMultipleFiles = useCallback(
    async (files: File[]) => {
      setState("uploading");
      setErrorMessage("");
      setQueuedFiles((prev) => prev.map((f) => ({ ...f, status: "uploading" as const })));

      try {
        const formData = new FormData();
        files.forEach((f) => formData.append("files", f));

        const response = await authFetch("/api/upload/multi", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          setState("error");
          setErrorMessage(data.error || "Upload failed.");
          setQueuedFiles((prev) =>
            prev.map((f) => (f.status === "uploading" ? { ...f, status: "error" as const } : f))
          );
          return;
        }

        setState("success");
        setQueuedFiles((prev) => prev.map((f) => ({ ...f, status: "done" as const })));
        trackEvent(AnalyticsEvent.DOCUMENT_UPLOADED, {
          type: "multi",
          count: files.length,
          total_size_kb: Math.round(files.reduce((sum, f) => sum + f.size, 0) / 1024),
        });
        onMultiUploadSuccess?.(data as MultiUploadResult);
      } catch {
        setState("error");
        setErrorMessage("Network error. Please try again.");
        setQueuedFiles((prev) =>
          prev.map((f) => (f.status === "uploading" ? { ...f, status: "error" as const, error: "Upload failed" } : f))
        );
      }
    },
    [onMultiUploadSuccess],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      if (multiple && acceptedFiles.length > 1) {
        // Multi-file mode
        const queued: QueuedFile[] = acceptedFiles.map((file) => ({
          file,
          id: generateId(),
          status: "pending",
        }));
        setQueuedFiles(queued);
        setPreviewUrl(null);
        void uploadMultipleFiles(acceptedFiles);
      } else {
        // Single-file mode
        const file = acceptedFiles[0];
        setSelectedFile(file);
        setPreviewUrl(null);

        if (canPreview(file.name, file.type)) {
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
        }

        void uploadSingleFile(file);
      }
    },
    [uploadSingleFile, uploadMultipleFiles, multiple],
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: () => {
      setDragActive(false);
      setState("error");
      setErrorMessage("File too large. Maximum size is 500MB.");
    },
    maxSize: MAX_SIZE,
    multiple,
    disabled: state === "uploading",
    noClick: state === "uploading",
  });

  const resetState = () => {
    setState("idle");
    setSelectedFile(null);
    setQueuedFiles([]);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const removeQueuedFile = (id: string) => {
    setQueuedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const stateText = () => {
    if (multiple && queuedFiles.length > 0 && state === "idle") {
      return `${queuedFiles.length} file${queuedFiles.length !== 1 ? "s" : ""} selected`;
    }
    switch (state) {
      case "uploading":
        if (multiple && queuedFiles.length > 0) {
          return `Uploading ${queuedFiles.length} file${queuedFiles.length !== 1 ? "s" : ""}...`;
        }
        return `Uploading ${selectedFile?.name ?? ""}...`;
      case "success":
        if (multiple && queuedFiles.length > 0) {
          return `Uploaded ${queuedFiles.length} file${queuedFiles.length !== 1 ? "s" : ""} successfully!`;
        }
        return `Uploaded: ${selectedFile?.name ?? "complete!"}`;
      case "error":
        return errorMessage;
      default:
        return dragActive
          ? multiple
            ? "Drop your files here"
            : "Drop your file here"
          : multiple
            ? "Drag & drop files here, or click to browse"
            : "Drag & drop any file, or click to browse";
    }
  };

  const cardClasses = [
    "cursor-pointer transition-all duration-200 rounded-[34px] border-2",
    state === "idle" && !dragActive
      ? "border-dashed border-border bg-card hover:border-primary/50 hover:bg-primary/[0.04] clay-raised"
      : "",
    dragActive
      ? "border-solid border-primary bg-primary/[0.04]"
      : "",
    state === "error"
      ? "border-destructive/50 bg-destructive/[0.03]"
      : "",
    state === "success"
      ? "border-success/50 bg-success/5"
      : "",
    state === "uploading"
      ? "border-primary/30 animate-border-pulse cursor-wait"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className={cardClasses}>
        <div className="flex items-center gap-5 p-6 max-[640px]:flex-col max-[640px]:items-start">
          {/* Icon tile */}
          <div className="grid size-13 shrink-0 place-items-center rounded-[22px] bg-primary/16 text-primary clay-raised">
            {state === "uploading" ? (
              <Loader2 className="size-6 animate-spin" />
            ) : state === "success" ? (
              <CheckCircle2 className="size-6 text-success" />
            ) : state === "error" ? (
              <XCircle className="size-6 text-destructive" />
            ) : (
              <Upload className={cn("size-6 transition-transform", dragActive && "scale-110")} />
            )}
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            {selectedFile && state === "idle" && !multiple ? (
              <>
                <p className="font-display text-[17px] font-bold tracking-[-0.01em]">{selectedFile.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)} · {selectedFile.type || "unknown type"}
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-[17px] font-bold tracking-[-0.01em]">
                  {state === "error" ? "Upload failed" : "Drop a file to share instantly"}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {stateText()}
                </p>
                <p className="mt-2.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
                  50 MB max · .md · .markdown · .html
                </p>
              </>
            )}
          </div>

          {/* Action button */}
          {state === "idle" && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); open(); }}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-background px-4 text-sm font-semibold clay-raised transition-transform hover:-translate-y-px max-[640px]:w-full max-[640px]:justify-center"
            >
              {multiple ? "Choose files" : "Choose file"}
            </button>
          )}
          {(state === "success" || state === "error") && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); resetState(); }}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-background px-4 text-sm font-semibold clay-raised transition-transform hover:-translate-y-px max-[640px]:w-full max-[640px]:justify-center"
            >
              {state === "success" ? "Upload another" : "Try again"}
            </button>
          )}
        </div>

        {/* Image preview (single mode) */}
        {previewUrl && state !== "uploading" && !multiple && (
          <div className="px-6 pb-4">
            <div className="relative size-20 overflow-hidden rounded-[14px] border border-border">
              <img src={previewUrl} alt="Preview" className="size-full object-cover" />
            </div>
          </div>
        )}

        {/* Multi-file list when idle */}
        {multiple && queuedFiles.length > 0 && state === "idle" && (
          <div className="space-y-1.5 px-6 pb-4">
            {queuedFiles.map((qf) => {
              const Icon = getFileIcon(qf.file.name, qf.file.type);
              return (
                <div key={qf.id} className="flex items-center gap-2.5 rounded-[14px] border border-border bg-background px-3 py-2 clay-raised">
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-sm">{qf.file.name}</span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {formatFileSize(qf.file.size)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeQueuedFile(qf.id); }}
                    className="shrink-0 rounded-sm p-0.5 transition-colors hover:bg-muted"
                  >
                    <X className="size-3.5 text-muted-foreground" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <input {...getInputProps()} />
      </div>
    </div>
  );
}
