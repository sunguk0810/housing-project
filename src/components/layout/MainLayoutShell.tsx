"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner";
import { CompareProvider } from "@/contexts/CompareContext";

export function MainLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showBanner = pathname === "/search";

  return (
    <CompareProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        {showBanner && <DisclaimerBanner />}
        <main className="flex-1 pb-14 lg:pb-0">{children}</main>
        <Footer />
        <BottomNav />
      </div>
    </CompareProvider>
  );
}
