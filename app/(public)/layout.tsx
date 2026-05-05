import { HeaderBar } from "@/components/header-bar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderBar />
      {children}
    </>
  );
}
