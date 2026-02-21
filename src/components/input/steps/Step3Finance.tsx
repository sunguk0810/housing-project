"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Lock, Home, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { AmountField } from "@/components/onboarding/AmountField";
import { CustomKeypad } from "@/components/onboarding/CustomKeypad";
import { InlineConsent } from "@/components/onboarding/InlineConsent";
import { calculateBudget } from "@/lib/engines/budget";
import { formatPrice } from "@/lib/format";
import type { ConsentState } from "@/types/ui";
import type { BudgetProfileKey, LoanProgramKey } from "@/types/engine";
import type { DesiredAreaKey } from "@/types/api";

const AREA_OPTIONS: readonly { key: DesiredAreaKey; label: string; sub: string }[] = [
  { key: "small", label: "10평대", sub: "≤49㎡" },
  { key: "medium", label: "20평대", sub: "50~69㎡" },
  { key: "large", label: "30평대+", sub: "70㎡~" },
];

interface Step3Props {
  cash: number;
  income: number;
  onCashChange: (value: number) => void;
  onIncomeChange: (value: number) => void;
  consent: ConsentState;
  onConsentChange: (consent: ConsentState) => void;
  onKeypadToggle?: (open: boolean) => void;
  tradeType?: "sale" | "jeonse" | "monthly";
  budgetProfile: BudgetProfileKey;
  loanProgram: LoanProgramKey;
  desiredAreas: readonly DesiredAreaKey[];
  onDesiredAreasChange: (areas: DesiredAreaKey[]) => void;
}

type FieldKey = "cash" | "income";

const FIELD_MAX: Record<FieldKey, number> = {
  cash: 5_000_000,
  income: 1_200_000,
};

interface FieldConfig {
  key: FieldKey;
  label: string;
  exceptionLabel?: string;
}

interface QuickButton {
  label: string;
  value: number;
}

const FIELD_QUICK_BUTTONS: Record<FieldKey, readonly QuickButton[]> = {
  cash: [
    { label: "+100만", value: 100 },
    { label: "+500만", value: 500 },
    { label: "+1,000만", value: 1000 },
    { label: "+5,000만", value: 5000 },
    { label: "+1억", value: 10000 },
  ],
  income: [
    { label: "+500만", value: 500 },
    { label: "+1,000만", value: 1000 },
    { label: "+3,000만", value: 3000 },
    { label: "+5,000만", value: 5000 },
    { label: "+1억", value: 10000 },
  ],
};

const FIELDS: readonly FieldConfig[] = [
  { key: "cash", label: "보유 자산 (현금성)" },
  { key: "income", label: "연 가구 소득", exceptionLabel: "현재 소득이 없어요" },
];

export function Step3Finance({
  cash,
  income,
  onCashChange,
  onIncomeChange,
  consent,
  onConsentChange,
  onKeypadToggle,
  tradeType,
  budgetProfile,
  loanProgram,
  desiredAreas,
  onDesiredAreasChange,
}: Step3Props) {
  const [activeField, setActiveField] = useState<FieldKey | null>(null);
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [exceptions, setExceptions] = useState<Record<string, boolean>>({});

  const values = useMemo<Record<FieldKey, number>>(
    () => ({ cash, income }),
    [cash, income],
  );
  const setters = useMemo<Record<FieldKey, (v: number) => void>>(
    () => ({
      cash: onCashChange,
      income: onIncomeChange,
    }),
    [onCashChange, onIncomeChange],
  );

  const budgetResult = useMemo(() => {
    if (cash === 0 && income === 0) return null;
    const result = calculateBudget({
      cash,
      income,
      loans: 0,
      monthlyBudget: 0,
      tradeType: tradeType ?? "sale",
      budgetProfile,
      loanProgram,
    });
    return result;
  }, [cash, income, tradeType, budgetProfile, loanProgram]);

  const tradeTypeLabel = tradeType === "jeonse" ? "전세금" : "매매가";

  useEffect(() => {
    onKeypadToggle?.(keypadOpen);
  }, [keypadOpen, onKeypadToggle]);

  /* Bug fix: auto-clear exception when user taps the field */
  function handleFieldFocus(key: FieldKey) {
    if (exceptions[key]) {
      setExceptions((prev) => ({ ...prev, [key]: false }));
    }
    setActiveField(key);
    setKeypadOpen(true);
  }

  function handleDone() {
    setKeypadOpen(false);
    setActiveField(null);
  }

  const handleDigit = useCallback(
    (digit: string) => {
      if (!activeField || exceptions[activeField]) return;
      const current = values[activeField].toString();
      const next = current === "0" ? digit : current + digit;
      const num = parseInt(next, 10);
      if (!isNaN(num)) setters[activeField](Math.min(num, FIELD_MAX[activeField]));
    },
    [activeField, values, setters, exceptions],
  );

  const handleDoubleZero = useCallback(() => {
    if (!activeField || exceptions[activeField]) return;
    const current = values[activeField].toString();
    if (current === "0") return;
    const next = current + "00";
    const num = parseInt(next, 10);
    if (!isNaN(num)) setters[activeField](Math.min(num, FIELD_MAX[activeField]));
  }, [activeField, values, setters, exceptions]);

  const handleBackspace = useCallback(() => {
    if (!activeField) return;
    if (exceptions[activeField]) {
      setExceptions((prev) => ({ ...prev, [activeField]: false }));
      return;
    }
    const current = values[activeField].toString();
    const next = current.length > 1 ? current.slice(0, -1) : "0";
    setters[activeField](parseInt(next, 10));
  }, [activeField, values, setters, exceptions]);

  /* Bidirectional toggle: Switch ON -> set exception, Switch OFF -> clear exception */
  function handleExceptionToggle(key: FieldKey, checked: boolean) {
    if (checked) {
      setExceptions((prev) => ({ ...prev, [key]: true }));
      setters[key](0);
      if (activeField === key) {
        setKeypadOpen(false);
        setActiveField(null);
      }
    } else {
      setExceptions((prev) => ({ ...prev, [key]: false }));
      setActiveField(key);
      setKeypadOpen(true);
    }
  }

  function handleQuickAdd(amount: number) {
    if (!activeField || exceptions[activeField]) return;
    setters[activeField](Math.min(values[activeField] + amount, FIELD_MAX[activeField]));
  }

  return (
    <div className="space-y-[var(--space-6)]">
      {/* ── Zone A: 금융 입력 ── */}
      <div className="rounded-xl bg-[var(--color-surface-sunken)] p-[var(--space-4)] space-y-[var(--space-3)]">
        {/* Privacy inline note */}
        <p className="flex items-center gap-[var(--space-2)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
          <Lock size={12} className="shrink-0" />
          입력 정보는 저장되지 않으며, 분석 후 즉시 폐기됩니다.
        </p>

        {/* Amount fields */}
        <div className="space-y-[var(--space-2)]">
          {FIELDS.map((field) => (
            <AmountField
              key={field.key}
              label={field.label}
              value={values[field.key]}
              active={activeField === field.key}
              onFocus={() => handleFieldFocus(field.key)}
              exceptionLabel={field.exceptionLabel}
              onExceptionToggle={
                field.exceptionLabel
                  ? (checked: boolean) => handleExceptionToggle(field.key, checked)
                  : undefined
              }
              isException={exceptions[field.key]}
            />
          ))}
        </div>
      </div>

      {/* ── Zone B: 예산 Hero Card ── */}
      {budgetResult != null && budgetResult.maxPrice > 0 ? (
        <div
          key={budgetResult.maxPrice}
          className={cn(
            "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--space-4)]",
            "animate-[budgetPop_350ms_var(--ease-out-expo)]",
          )}
        >
          <p className="flex items-center gap-[var(--space-1)] text-[length:var(--text-caption)] font-medium text-[var(--color-on-surface-muted)]">
            <Home size={14} />
            예상 가능 {tradeTypeLabel}
          </p>
          <p className="mt-[var(--space-1)] text-[length:var(--text-heading)] font-bold tabular-nums text-[var(--color-on-surface)]">
            약 {formatPrice(budgetResult.maxPrice)}
          </p>
          <div className="mt-[var(--space-2)] rounded-lg bg-[var(--color-surface-sunken)] px-[var(--space-3)] py-[var(--space-2)]">
            <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
              보유자산 {formatPrice(cash)} + 예상대출 {formatPrice(budgetResult.maxLoan)}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--color-neutral-200)] bg-[var(--color-surface)] p-[var(--space-4)]">
          <p className="text-center text-[length:var(--text-body-sm)] text-[var(--color-neutral-400)]">
            금액을 입력하면 예상 예산이 표시됩니다
          </p>
        </div>
      )}

      {/* ── Zone C: 선호/동의 ── */}
      <div className="space-y-[var(--space-4)]">
        {/* Desired area selection chips */}
        <div className="space-y-[var(--space-2)]">
          <div className="flex items-baseline gap-[var(--space-2)]">
            <p className="text-[length:var(--text-body)] font-semibold text-[var(--color-on-surface)]">
              원하는 평수
            </p>
            <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
              복수 선택 가능
            </p>
          </div>
          <div className="flex gap-[var(--space-2)]">
            {AREA_OPTIONS.map((opt) => {
              const selected = desiredAreas.includes(opt.key);
              const isLastSelected = selected && desiredAreas.length === 1;
              return (
                <button
                  key={opt.key}
                  type="button"
                  aria-pressed={selected}
                  disabled={isLastSelected}
                  onClick={() => {
                    if (isLastSelected) return;
                    const next = selected
                      ? desiredAreas.filter((k) => k !== opt.key)
                      : [...desiredAreas, opt.key];
                    onDesiredAreasChange(next as DesiredAreaKey[]);
                  }}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-0.5 rounded-lg border py-[var(--space-3)] transition-colors",
                    selected
                      ? "border-[var(--color-neutral-800)] bg-[var(--color-surface)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-neutral-400)]",
                    isLastSelected && "cursor-not-allowed opacity-60",
                  )}
                >
                  <span className="flex items-center gap-1 text-[length:var(--text-body-sm)] font-semibold text-[var(--color-on-surface)]">
                    {selected && <Check size={14} className="text-[var(--color-brand-500)]" />}
                    {opt.label}
                  </span>
                  <span className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
                    {opt.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inline Consent */}
        <InlineConsent consent={consent} onChange={onConsentChange} />
      </div>

      {/* ── Keypad slide-up panel ── */}
      {keypadOpen && (
      <div
        className={cn(
          "fixed bottom-14 left-0 right-0 z-20",
          "bg-[var(--color-surface-elevated)]",
          "shadow-[0_-2px_8px_rgb(0_0_0/0.06)]",
          "animate-[slideUp_200ms_var(--ease-out-expo)]",
          "lg:bottom-0",
        )}
      >
        {/* Sticky budget bar */}
        {budgetResult != null && budgetResult.maxPrice > 0 && (
          <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-[var(--space-4)] py-[var(--space-2)]">
            <div className="mx-auto flex max-w-lg items-baseline justify-between">
              <span className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
                예상 예산
              </span>
              <span className="text-[length:var(--text-subtitle)] font-bold tabular-nums text-[var(--color-on-surface)]">
                약 {formatPrice(budgetResult.maxPrice)}
              </span>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-lg px-[var(--space-4)] pt-[var(--space-2)] pb-[var(--space-2)]">
          {/* Quick buttons + done */}
          <div className="mb-[var(--space-2)] flex items-center gap-[var(--space-2)]">
            <div className="flex flex-1 items-center gap-[var(--space-1)] overflow-x-auto scrollbar-none">
              {activeField &&
                FIELD_QUICK_BUTTONS[activeField].map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => handleQuickAdd(btn.value)}
                    className={cn(
                      "shrink-0 rounded-[var(--radius-s7-full)]",
                      "border border-[var(--color-brand-400)] bg-[var(--color-surface)]",
                      "min-h-[36px] px-[var(--space-3)] text-[length:var(--text-caption)] font-semibold",
                      "text-[var(--color-brand-500)] transition-all",
                      "active:bg-[var(--color-brand-50)] active:scale-95",
                    )}
                  >
                    {btn.label}
                  </button>
                ))}
            </div>
            <button
              type="button"
              onClick={handleDone}
              className={cn(
                "shrink-0 min-h-[36px] rounded-[var(--radius-s7-full)] px-[var(--space-4)]",
                "bg-[var(--color-brand-500)] text-[length:var(--text-caption)] font-semibold text-white",
                "transition-colors hover:bg-[var(--color-brand-600)]",
              )}
            >
              완료
            </button>
          </div>

          <CustomKeypad
            onDigit={handleDigit}
            onDoubleZero={handleDoubleZero}
            onBackspace={handleBackspace}
          />
        </div>
      </div>
      )}
    </div>
  );
}
