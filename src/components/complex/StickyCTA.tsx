"use client";

import { useCallback } from "react";
import { useCompare, type CompareItem } from "@/contexts/CompareContext";
import { trackEvent } from "@/lib/tracking";
import { CTA_LINKS } from "@/lib/constants";

interface StickyCTAProps {
  item: CompareItem;
}

export function StickyCTA({ item }: StickyCTAProps) {
  const { addItem, removeItem, isComparing, canAdd } = useCompare();
  const comparing = isComparing(item.aptId);

  const handleCompareToggle = () => {
    if (comparing) {
      removeItem(item.aptId);
    } else {
      addItem(item);
    }
  };

  const handleShare = useCallback(async () => {
    const shareData = {
      title: item.aptName,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // Visual feedback handled by browser
      }
    } catch {
      // User cancelled share or clipboard failed — no action needed
    }
  }, [item.aptName]);

  const handleConciergeClick = useCallback(() => {
    trackEvent({ name: "concierge_contact_click", aptId: item.aptId });
    window.open(CTA_LINKS.concierge, "_blank", "noopener,noreferrer");
  }, [item.aptId]);

  return (
    <div className="sticky bottom-14 z-5 flex gap-[var(--space-3)] border-t border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-4)] py-[var(--space-3)]">
      <button
        type="button"
        onClick={handleCompareToggle}
        disabled={!comparing && !canAdd}
        className="flex-1 rounded-[var(--radius-s7-md)] border border-[var(--color-brand-500)] px-[var(--space-4)] py-[var(--space-3)] text-[length:var(--text-body-sm)] font-semibold text-[var(--color-brand-500)] transition-colors hover:bg-[var(--color-brand-50)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {comparing ? "비교중 \u2705" : "비교에 추가"}
      </button>
      <button
        type="button"
        onClick={handleConciergeClick}
        aria-label="전문가 안내 요청"
        className="flex-1 rounded-[var(--radius-s7-md)] border border-[var(--color-brand-500)] px-[var(--space-4)] py-[var(--space-3)] text-[length:var(--text-body-sm)] font-semibold text-[var(--color-brand-500)] transition-colors hover:bg-[var(--color-brand-50)]"
      >
        전문가 안내
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="flex-1 rounded-[var(--radius-s7-md)] bg-[var(--color-brand-500)] px-[var(--space-4)] py-[var(--space-3)] text-[length:var(--text-body-sm)] font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)]"
      >
        공유
      </button>
    </div>
  );
}
