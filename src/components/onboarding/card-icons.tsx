'use client';

import {
  Home,
  Building2,
  KeyRound,
  Train,
  Baby,
  ShieldCheck,
  Coins,
  Scale,
  SmilePlus,
  Smile,
  Ban,
  Sparkles,
  Key,
  ClipboardList,
  Landmark,
  FileText,
  TrendingUp,
} from 'lucide-react';
import type { ReactNode } from 'react';

/** Shared icon wrapper — neutral bg + muted icon; darker on selected card */
function IconCircle({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)] transition-colors duration-200 group-data-[selected]:bg-[var(--color-neutral-200)] group-data-[selected]:text-[var(--color-neutral-800)] dark:bg-[var(--color-surface-elevated)] dark:text-[var(--color-neutral-400)]">
      {children}
    </div>
  );
}

// Trade type icons
export const TRADE_ICONS = {
  sale: (
    <IconCircle>
      <Home size={22} strokeWidth={1.6} />
    </IconCircle>
  ),
  jeonse: (
    <IconCircle>
      <Building2 size={22} strokeWidth={1.6} />
    </IconCircle>
  ),
  monthly: (
    <IconCircle>
      <KeyRound size={22} strokeWidth={1.6} />
    </IconCircle>
  ),
} as const;

// Priority icons
export const PRIORITY_ICONS = {
  commute: (
    <IconCircle>
      <Train size={22} strokeWidth={1.6} />
    </IconCircle>
  ),
  childcare: (
    <IconCircle>
      <Baby size={22} strokeWidth={1.6} />
    </IconCircle>
  ),
  safety: (
    <IconCircle>
      <ShieldCheck size={22} strokeWidth={1.6} />
    </IconCircle>
  ),
  budget: (
    <IconCircle>
      <Coins size={22} strokeWidth={1.6} />
    </IconCircle>
  ),
} as const;

// Weight profile icons
export const WEIGHT_PROFILE_ICONS = {
  balanced: (
    <IconCircle>
      <Scale size={22} strokeWidth={1.6} />
    </IconCircle>
  ),
  budget_focused: (
    <IconCircle>
      <Coins size={22} strokeWidth={1.6} />
    </IconCircle>
  ),
  commute_focused: (
    <IconCircle>
      <Train size={22} strokeWidth={1.6} />
    </IconCircle>
  ),
  complex_focused: (
    <IconCircle>
      <Building2 size={22} strokeWidth={1.6} />
    </IconCircle>
  ),
  value_maximized: (
    <IconCircle>
      <TrendingUp size={22} strokeWidth={1.6} />
    </IconCircle>
  ),
} as const;

// Budget profile icons
export const BUDGET_PROFILE_ICONS = {
  firstTime: (
    <IconCircle>
      <Sparkles size={22} strokeWidth={1.6} />
    </IconCircle>
  ),
  noProperty: (
    <IconCircle>
      <Key size={22} strokeWidth={1.6} />
    </IconCircle>
  ),
  homeowner: (
    <IconCircle>
      <ClipboardList size={22} strokeWidth={1.6} />
    </IconCircle>
  ),
} as const;

// Loan program icons
export const LOAN_PROGRAM_ICONS = {
  bankMortgage: (
    <IconCircle>
      <Landmark size={22} strokeWidth={1.6} />
    </IconCircle>
  ),
  bogeumjari: (
    <IconCircle>
      <FileText size={22} strokeWidth={1.6} />
    </IconCircle>
  ),
} as const;

// Child plan icons
export const CHILD_PLAN_ICONS = {
  yes: (
    <IconCircle>
      <SmilePlus size={22} strokeWidth={1.6} />
    </IconCircle>
  ),
  maybe: (
    <IconCircle>
      <Smile size={22} strokeWidth={1.6} />
    </IconCircle>
  ),
  no: (
    <IconCircle>
      <Ban size={22} strokeWidth={1.6} />
    </IconCircle>
  ),
} as const;
