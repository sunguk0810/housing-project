'use client';

import { CHILD_PLAN_OPTIONS } from '@/lib/constants';
import { CHILD_PLAN_ICONS } from './card-icons';
import { EmojiCardSelector } from './EmojiCardSelector';
import type { ChildPlan } from '@/types/ui';

interface FamilyPlanSelectorProps {
  value?: ChildPlan;
  onChange: (value: ChildPlan) => void;
}

const OPTIONS_WITH_ICONS = CHILD_PLAN_OPTIONS.map((opt) => ({
  ...opt,
  icon: CHILD_PLAN_ICONS[opt.value],
}));

export function FamilyPlanSelector({ value, onChange }: FamilyPlanSelectorProps) {
  return (
    <div className="space-y-[var(--space-3)]">
      <p className="text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
        자녀 계획을 선택해주세요
      </p>
      <EmojiCardSelector
        options={OPTIONS_WITH_ICONS}
        value={value}
        onSelect={onChange}
        columns="3"
        ariaLabel="자녀 계획 선택"
      />
    </div>
  );
}
