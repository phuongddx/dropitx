"use client";

import { useState } from "react";
import { UploadDropzone, type UploadResult } from "@/components/upload-dropzone";
import { ShareLink } from "@/components/share-link";

export function DashboardUpload() {
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  return (
    <section id="upload" className="space-y-4 scroll-mt-20">
      <div>
        <h2 className="text-[18px] font-bold tracking-tight">Upload a file</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Drag &amp; drop a file to generate a shareable link.
        </p>
      </div>

      <UploadDropzone onUploadSuccess={setUploadResult} />

      {uploadResult && (
        <ShareLink result={uploadResult} />
      )}
    </section>
  );
}
