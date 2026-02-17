'use client';

/**
 * @deprecated Use Step1BasicInfo instead.
 * Kept only for backward compatibility with legacy previews.
 */

import { Home, FileText, Baby, HelpCircle, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/tracking';
import { useRef } from 'react';
import type { TradeType } from '@/types/api';
import type { ChildPlan } from '@/types/ui';

interface Step1Props {
  tradeType: TradeType;
  childPlan: ChildPlan;
  onTradeTypeChange: (value: TradeType) => void;
  onChildPlanChange: (value: ChildPlan) => void;
}

const TRADE_OPTIONS: Array<{ value: TradeType; label: string; icon: React.ElementType }> = [
  { value: 'sale', label: '매매', icon: Home },
  { value: 'jeonse', label: '전세', icon: FileText },
];

const CHILD_OPTIONS: Array<{ value: ChildPlan; label: string; icon: React.ElementType }> = [
  { value: 'yes', label: '계획있음', icon: Baby },
  { value: 'maybe', label: '고민중', icon: HelpCircle },
  { value: 'no', label: '없음', icon: Ban },
];

export function Step1TradeChild({
  tradeType,
  childPlan,
  onTradeTypeChange,
  onChildPlanChange,
}: Step1Props) {
  const tracked = useRef(false);

  function handleFirstInteraction() {
    if (!tracked.current) {
      tracked.current = true;
      trackEvent({ name: 'min_input_start' });
    }
  }

  return (
    <div className="space-y-[var(--space-8)]">
      <div>
        <h3 className="mb-[var(--space-4)] text-[length:var(--text-subtitle)] font-semibold">
          주거 형태
        </h3>
        <div className="grid grid-cols-2 gap-[var(--space-3)]">
          {TRADE_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                handleFirstInteraction();
                onTradeTypeChange(value);
              }}
              className={cn(
                'flex flex-col items-center gap-[var(--space-2)] rounded-[var(--radius-s7-lg)] border p-[var(--space-4)] transition-all',
                tradeType === value
                  ? 'border-[var(--color-primary)] bg-[var(--color-brand-50)] shadow-[var(--shadow-s7-sm)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-neutral-400)]',
              )}
            >
              <Icon
                size={24}
                className={
                  tradeType === value
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-on-surface-muted)]'
                }
              />
              <span
                className={cn(
                  'text-[length:var(--text-body-sm)] font-medium',
                  tradeType === value
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-on-surface)]',
                )}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-[var(--space-4)] text-[length:var(--text-subtitle)] font-semibold">
          자녀 계획
        </h3>
        <div className="grid grid-cols-3 gap-[var(--space-3)]">
          {CHILD_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                handleFirstInteraction();
                onChildPlanChange(value);
              }}
              className={cn(
                'flex flex-col items-center gap-[var(--space-2)] rounded-[var(--radius-s7-lg)] border p-[var(--space-4)] transition-all',
                childPlan === value
                  ? 'border-[var(--color-primary)] bg-[var(--color-brand-50)] shadow-[var(--shadow-s7-sm)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-neutral-400)]',
              )}
            >
              <Icon
                size={24}
                className={
                  childPlan === value
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-on-surface-muted)]'
                }
              />
              <span
                className={cn(
                  'text-[length:var(--text-body-sm)] font-medium',
                  childPlan === value
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-on-surface)]',
                )}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
