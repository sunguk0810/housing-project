"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DISCLAIMER_TEXTS } from "@/lib/constants";
import { trackEvent } from "@/lib/tracking";

interface ExternalLinkCTAProps {
  href: string;
  label: string;
  aptId: number;
  className?: string;
}

export function ExternalLinkCTA({ href, label, aptId, className }: ExternalLinkCTAProps) {
  const [open, setOpen] = useState(false);

  function handleProceed() {
    trackEvent({ name: "outlink_click", aptId, url: href });
    window.open(href, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-[var(--space-2)] rounded-[var(--radius-s7-md)]",
          "border border-[var(--color-border)] bg-[var(--color-surface)]",
          "px-[var(--space-4)] py-[var(--space-3)]",
          "text-[length:var(--text-body-sm)] font-medium text-[var(--color-on-surface)]",
          "hover:bg-[var(--color-surface-sunken)] transition-colors",
          className,
        )}
      >
        {label}
        <ExternalLink size={14} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>외부 사이트 이동</DialogTitle>
            <DialogDescription data-disclaimer="external-link">
              {DISCLAIMER_TEXTS.externalLink}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button onClick={handleProceed}>이동하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
