import type { Metadata } from "next";
import { DevelopersPage } from "@/components/developers-page";

export const metadata: Metadata = {
  title: "Developers — DropItX",
  description: "Upload, share, and manage DropItX links from the command line with the dropitx CLI.",
};

export default function Developers() {
  return <DevelopersPage />;
}
