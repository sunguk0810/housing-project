'use client';

import { useCallback } from 'react';
import {
  Wallet,
  Train,
  Baby,
  Shield,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import type { CustomWeights } from '@/types/engine';

const DIMENSION_CONFIG = [
  { key: 'budget' as const, label: '예산 적합도', icon: Wallet },
  { key: 'commute' as const, label: '통근 시간', icon: Train },
  { key: 'childcare' as const, label: '보육 시설', icon: Baby },
  { key: 'safety' as const, label: '안전 환경', icon: Shield },
  { key: 'school' as const, label: '학군 수준', icon: GraduationCap },
  { key: 'complexScale' as const, label: '단지 규모', icon: Building2 },
] as const;

interface CustomWeightSliderProps {
  weights: CustomWeights;
  onChange: (weights: CustomWeights) => void;
}

/**
 * 6-dimension weight slider with auto-balancing.
 * When a slider is moved, remaining dimensions proportionally adjust
 * so that the total always sums to 100.
 */
export function CustomWeightSlider({
  weights,
  onChange,
}: CustomWeightSliderProps) {
  const handleSliderChange = useCallback(
    (changedKey: keyof CustomWeights, newValue: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(newValue)));
      const oldValue = weights[changedKey];
      const delta = clamped - oldValue;

      if (delta === 0) return;

      const otherKeys = DIMENSION_CONFIG
        .map((d) => d.key)
        .filter((k) => k !== changedKey);

      const otherSum = otherKeys.reduce((sum, k) => sum + weights[k], 0);

      const next = { ...weights, [changedKey]: clamped };

      if (otherSum === 0) {
        const remaining = 100 - clamped;
        const each = Math.floor(remaining / otherKeys.length);
        let leftover = remaining - each * otherKeys.length;
        for (const k of otherKeys) {
          next[k] = each + (leftover > 0 ? 1 : 0);
          if (leftover > 0) leftover--;
        }
      } else {
        const newOtherSum = 100 - clamped;
        let distributed = 0;

        for (let i = 0; i < otherKeys.length; i++) {
          const k = otherKeys[i];
          if (i === otherKeys.length - 1) {
            next[k] = Math.max(0, newOtherSum - distributed);
          } else {
            const proportion = weights[k] / otherSum;
            const adjusted = Math.max(0, Math.floor(newOtherSum * proportion));
            next[k] = adjusted;
            distributed += adjusted;
          }
        }
      }

      onChange(next);
    },
    [weights, onChange],
  );

  const total = DIMENSION_CONFIG.reduce((sum, d) => sum + weights[d.key], 0);

  return (
    <div className="space-y-[var(--space-5)]" role="group" aria-label="가중치 직접 설정">
      <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
        슬라이더를 조절하면 나머지가 자동으로 균형을 맞춥니다
      </p>

      {/* Slider rows */}
      <div className="space-y-[var(--space-6)]">
        {DIMENSION_CONFIG.map((dim) => {
          const Icon = dim.icon;
          const value = weights[dim.key];
          return (
            <div key={dim.key} className="space-y-[var(--space-2)]">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={`weight-${dim.key}`}
                  className="inline-flex items-center gap-[var(--space-2)] text-[length:var(--text-body)] font-medium"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]">
                    <Icon size={16} strokeWidth={1.6} />
                  </span>
                  {dim.label}
                </label>
                <span
                  className="min-w-[3.5ch] text-right tabular-nums text-[length:var(--text-body)] font-bold text-[var(--color-on-surface)]"
                  aria-live="polite"
                >
                  {value}%
                </span>
              </div>
              <Slider
                id={`weight-${dim.key}`}
                min={0}
                max={100}
                step={1}
                value={[value]}
                onValueChange={([v]) => handleSliderChange(dim.key, v)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={value}
                aria-valuetext={`${dim.label} ${value}%`}
              />
            </div>
          );
        })}
      </div>

      {/* Total indicator */}
      <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-[var(--space-4)]">
        <span className="text-[length:var(--text-body)] font-medium text-[var(--color-on-surface-muted)]">
          합계
        </span>
        <span
          className={`tabular-nums text-[length:var(--text-subtitle)] font-bold ${
            total === 100
              ? 'text-[var(--color-brand-500)]'
              : 'text-red-500'
          }`}
        >
          {total}%
        </span>
      </div>
    </div>
  );
}
