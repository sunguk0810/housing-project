"use client";

import { AmountInput } from "@/components/input/AmountInput";
import { TrustBadge } from "@/components/trust/TrustBadge";
import { cn } from "@/lib/utils";
import type { WeightProfile } from "@/types/api";

interface Step4Props {
  loans: number;
  monthlyBudget: number;
  weightProfile: WeightProfile;
  onLoansChange: (value: number) => void;
  onMonthlyBudgetChange: (value: number) => void;
  onWeightProfileChange: (value: WeightProfile) => void;
  loansError?: string;
  monthlyBudgetError?: string;
}

const WEIGHT_OPTIONS: Array<{ value: WeightProfile; label: string; description: string }> = [
  { value: "balanced", label: "균형", description: "모든 지표를 균형 있게 반영" },
  { value: "budget_focused", label: "예산 중심", description: "예산 적합성에 높은 비중" },
  { value: "commute_focused", label: "통근 중심", description: "통근 시간에 높은 비중" },
];

export function Step4Loans({
  loans,
  monthlyBudget,
  weightProfile,
  onLoansChange,
  onMonthlyBudgetChange,
  onWeightProfileChange,
  loansError,
  monthlyBudgetError,
}: Step4Props) {
  return (
    <div className="space-y-[var(--space-6)]">
      <AmountInput
        label="기존 대출 상환액 (월)"
        value={loans}
        onChange={onLoansChange}
        error={loansError}
      />

      <AmountInput
        label="월 주거비 예산 상한"
        value={monthlyBudget}
        onChange={onMonthlyBudgetChange}
        error={monthlyBudgetError}
      />

      <div>
        <h3 className="mb-[var(--space-3)] text-[length:var(--text-body-sm)] font-medium">
          분석 가중치
        </h3>
        <div className="grid grid-cols-3 gap-[var(--space-2)]">
          {WEIGHT_OPTIONS.map(({ value, label, description }) => (
            <button
              key={value}
              type="button"
              onClick={() => onWeightProfileChange(value)}
              className={cn(
                "rounded-[var(--radius-s7-md)] border p-[var(--space-3)] text-left transition-all",
                weightProfile === value
                  ? "border-[var(--color-primary)] bg-[var(--color-brand-50)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-neutral-400)]",
              )}
            >
              <p className={cn(
                "text-[length:var(--text-body-sm)] font-medium",
                weightProfile === value ? "text-[var(--color-primary)]" : "text-[var(--color-on-surface)]",
              )}>
                {label}
              </p>
              <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
                {description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <TrustBadge variant="mini" />
    </div>
  );
}
