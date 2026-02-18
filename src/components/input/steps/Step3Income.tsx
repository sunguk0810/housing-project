'use client';

/**
 * @deprecated Use Step3Finance instead.
 * Kept only for backward compatibility with legacy previews.
 */

import { AmountInput } from '@/components/input/AmountInput';
import { TrustBadge } from '@/components/trust/TrustBadge';

interface Step3Props {
  cash: number;
  income: number;
  onCashChange: (value: number) => void;
  onIncomeChange: (value: number) => void;
  cashError?: string;
  incomeError?: string;
}

export function Step3Income({
  cash,
  income,
  onCashChange,
  onIncomeChange,
  cashError,
  incomeError,
}: Step3Props) {
  return (
    <div className="space-y-[var(--space-6)]">
      <TrustBadge variant="full" />

      <AmountInput
        label="보유 자산 (현금성)"
        value={cash}
        onChange={onCashChange}
        error={cashError}
        tooltip="PIR(가격소득비) 계산에 사용됩니다."
      />

      <AmountInput
        label="월 가구 소득"
        value={income}
        onChange={onIncomeChange}
        error={incomeError}
        tooltip="DSR(총부채상환비율) 계산에 사용됩니다."
      />

      <TrustBadge variant="mini" />
    </div>
  );
}
