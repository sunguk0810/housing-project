"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { CompareProvider } from "@/contexts/CompareContext";

/** Pages where the footer is hidden (wizard flows with fixed bottom CTA) */
const FOOTER_HIDDEN_PATHS = ["/search"];

export function MainLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showFooter = !FOOTER_HIDDEN_PATHS.some((p) => pathname.startsWith(p));

  return (
    <CompareProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 pb-14 lg:pb-0">{children}</main>
        {showFooter && <Footer />}
        <BottomNav />
      </div>
    </CompareProvider>
  );
}
