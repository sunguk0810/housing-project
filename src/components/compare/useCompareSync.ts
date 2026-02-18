"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCompare } from "@/contexts/CompareContext";
import type { ComparePageData } from "./useSessionPageData";

/**
 * Bidirectional sync between URL ?ids= and CompareContext.
 *
 * - Mount: parse ?ids= from window.location.search → addItem into context
 *   (uses window.location to avoid useSearchParams Suspense requirement)
 * - Items change: update URL via router.replace (no-op if unchanged)
 */
export function useCompareSync(pageData: ComparePageData): void {
  const router = useRouter();
  const { items, addItem } = useCompare();
  const didInitRef = useRef(false);
  const prevIdsRef = useRef("");

  // Mount: URL → context (once, after session data is available)
  useEffect(() => {
    if (didInitRef.current || !pageData.hasResults) return;
    didInitRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const idsParam = params.get("ids");
    if (!idsParam) return;

    idsParam
      .split(",")
      .map(Number)
      .filter((n) => n > 0 && !isNaN(n))
      .forEach((id) => {
        const found = pageData.items.find((r) => r.aptId === id);
        if (found) {
          addItem({ aptId: found.aptId, aptName: found.aptName, finalScore: found.finalScore });
        }
      });
  }, [pageData, addItem]);

  // Context → URL (skip if unchanged to prevent extra history entries)
  useEffect(() => {
    const idsStr = items.map((i) => String(i.aptId)).join(",");
    if (idsStr === prevIdsRef.current) return;
    prevIdsRef.current = idsStr;
    router.replace(idsStr ? `/compare?ids=${idsStr}` : "/compare", { scroll: false });
  }, [items, router]);
}
