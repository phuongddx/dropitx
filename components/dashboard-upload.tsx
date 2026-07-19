"use client";

import { useState } from "react";
import { UploadDropzone, type UploadResult } from "@/components/upload-dropzone";
import { ShareLink } from "@/components/share-link";

export function DashboardUpload() {
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  return (
    <section id="upload" className="scroll-mt-20">
      <UploadDropzone onUploadSuccess={setUploadResult} />

      {uploadResult && <ShareLink result={uploadResult} />}
    </section>
  );
}
