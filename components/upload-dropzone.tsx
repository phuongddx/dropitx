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

interface UploadDropzoneProps {
  onUploadSuccess: (result: UploadResult) => void;
}

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

const MAX_SIZE = 500 * 1024 * 1024; // 500MB

export function UploadDropzone({ onUploadSuccess }: UploadDropzoneProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const uploadFile = useCallback(
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

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setPreviewUrl(null);

      // Generate preview for images
      if (canPreview(file.name, file.type)) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }

      void uploadFile(file);
    },
    [uploadFile],
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
    multiple: false,
    disabled: state === "uploading",
    noClick: state === "uploading",
  });

  const resetState = () => {
    setState("idle");
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const stateIcon = () => {
    if (selectedFile && state === "idle") {
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
    switch (state) {
      case "uploading":
        return `Uploading ${selectedFile?.name ?? ""}...`;
      case "success":
        return `Uploaded: ${selectedFile?.name ?? "complete!"}`;
      case "error":
        return errorMessage;
      default:
        return dragActive
          ? "Drop your file here"
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
    <Card {...getRootProps()} className={cardClasses}>
      <CardContent className="flex flex-col items-center justify-center gap-5 py-14">
        <div className="relative">{stateIcon()}</div>

        {/* Image preview */}
        {previewUrl && state !== "uploading" && (
          <div className="relative size-20 rounded-lg overflow-hidden border">
            <img
              src={previewUrl}
              alt="Preview"
              className="size-full object-cover"
            />
          </div>
        )}

        {/* File info when selected */}
        {selectedFile && state === "idle" && (
          <div className="text-center">
            <p className="text-sm font-medium">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selectedFile.size)} &middot; {selectedFile.type || "unknown type"}
            </p>
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
            Choose file
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
  );
}
