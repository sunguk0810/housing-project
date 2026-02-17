"use client";

import { PRIORITY_OPTIONS } from "@/lib/constants";
import { EmojiCardSelector } from "./EmojiCardSelector";
import type { PriorityKey } from "@/types/ui";

interface PriorityCardGridProps {
  values: readonly PriorityKey[];
  onChange: (values: PriorityKey[]) => void;
  className?: string;
}

export function PriorityCardGrid({
  values,
  onChange,
  className,
}: PriorityCardGridProps) {
  return (
    <div className={className}>
      <p className="mb-[var(--space-4)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
        중요한 순서대로 눌러주세요 (최대 3개)
      </p>
      <EmojiCardSelector
        options={PRIORITY_OPTIONS}
        values={values as PriorityKey[]}
        onMultiSelect={onChange}
        maxSelect={3}
        columns="4"
        role="group"
        ariaLabel="선호 조건 선택"
      />
    </div>
  );
}
