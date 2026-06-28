import { PublicNav } from "@/components/public-nav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNav />
      <div className="flex-1">{children}</div>
    </div>
  );
}

