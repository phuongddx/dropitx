"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileUp, Loader2, CheckCircle2, XCircle, X } from "lucide-react";
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

  const stateIcon = () => {
    if (selectedFile && state === "idle" && !multiple) {
      const Icon = getFileIcon(selectedFile.name, selectedFile.type);
      return <Icon className="size-10 text-primary" />;
    }
    const base = "size-10 transition-all duration-200";
    switch (state) {
      case "uploading":
        return <Loader2 className={`${base} animate-spin text-primary`} />;
      case "success":
        return (
          <div className="animate-scale-in">
            <CheckCircle2 className={`${base} text-green-500`} />
          </div>
        );
      case "error":
        return <XCircle className={`${base} text-destructive`} />;
      default:
        return dragActive ? (
          <FileUp className={`${base} text-primary scale-110`} />
        ) : (
          <Upload className={`${base} text-muted-foreground`} />
        );
    }
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
    "cursor-pointer transition-colors duration-200",
    state === "idle" && !dragActive
      ? "border-dashed border-2 border-border hover:border-primary/50"
      : "",
    dragActive
      ? "border-solid border-2 border-primary bg-primary/[0.03]"
      : "",
    state === "error"
      ? "border-2 border-destructive/50 bg-destructive/[0.03]"
      : "",
    state === "success"
      ? "border-2 border-green-500/50 bg-green-500/[0.03]"
      : "",
    state === "uploading"
      ? "border-2 border-primary/30 animate-border-pulse cursor-wait"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-3">
      <Card {...getRootProps()} className={cardClasses}>
        <CardContent className="flex flex-col items-center justify-center gap-5 py-14">
          <div className="relative">{stateIcon()}</div>

          {/* Image preview (single mode) */}
          {previewUrl && state !== "uploading" && !multiple && (
            <div className="relative size-20 rounded-lg overflow-hidden border">
              <img
                src={previewUrl}
                alt="Preview"
                className="size-full object-cover"
              />
            </div>
          )}

          {/* File info when selected (single mode) */}
          {selectedFile && state === "idle" && !multiple && (
            <div className="text-center">
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)} &middot; {selectedFile.type || "unknown type"}
              </p>
            </div>
          )}

          {/* Multi-file list when idle */}
          {multiple && queuedFiles.length > 0 && state === "idle" && (
            <div className="w-full max-w-sm space-y-1.5">
              {queuedFiles.map((qf) => {
                const Icon = getFileIcon(qf.file.name, qf.file.type);
                return (
                  <div
                    key={qf.id}
                    className="flex items-center gap-2.5 rounded-lg border px-3 py-2"
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 text-sm truncate">{qf.file.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatFileSize(qf.file.size)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQueuedFile(qf.id);
                      }}
                      className="shrink-0 rounded-sm p-0.5 hover:bg-muted transition-colors"
                    >
                      <X className="size-3.5 text-muted-foreground" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <p
            className={`text-center text-sm transition-colors duration-200 ${
              state === "error"
                ? "text-destructive"
                : state === "uploading"
                  ? "text-primary/70"
                  : state === "success"
                    ? "text-green-600"
                    : "text-muted-foreground"
            }`}
          >
            {stateText()}
          </p>

          {state === "idle" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
            >
              {multiple ? "Choose files" : "Choose file"}
            </Button>
          )}
          {(state === "success" || state === "error") && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                resetState();
              }}
            >
              {state === "success" ? "Upload another" : "Try again"}
            </Button>
          )}
        </CardContent>
        <input {...getInputProps()} />
      </Card>
    </div>
  );
}
