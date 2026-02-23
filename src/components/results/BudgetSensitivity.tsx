'use client';

import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BudgetSensitivityResponse, BudgetLevelResult } from '@/types/api';
import type { StepFormData } from '@/hooks/useStepForm';

interface BudgetSensitivityProps {
  formData: StepFormData | null;
  className?: string;
}

function formatPrice(price: number): string {
  if (price >= 10000) {
    const eok = Math.floor(price / 10000);
    const remainder = price % 10000;
    return remainder > 0 ? `${eok}억 ${remainder.toLocaleString()}만` : `${eok}억`;
  }
  return `${price.toLocaleString()}만`;
}

function formatOffset(offset: number): string {
  if (offset === 0) return '현재';
  const sign = offset > 0 ? '+' : '';
  return `${sign}${formatPrice(Math.abs(offset))}`;
}

function LevelRow({
  level,
  isBase,
}: {
  level: BudgetLevelResult;
  isBase: boolean;
}) {
  const hasResults = level.top.length > 0;
  const top1 = level.top[0];

  return (
    <div
      className={`flex items-center gap-[var(--space-3)] rounded-[var(--radius-s7-md)] border px-[var(--space-4)] py-[var(--space-3)] ${
        isBase
          ? 'border-[var(--color-brand-300)] bg-[var(--color-brand-50)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface)]'
      }`}
    >
      {/* Offset label */}
      <div className="w-24 shrink-0">
        <span
          className={`text-[length:var(--text-body)] font-semibold tabular-nums ${
            isBase ? 'text-[var(--color-brand-500)]' : 'text-[var(--color-on-surface)]'
          }`}
        >
          {formatOffset(level.offset)}
        </span>
        <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
          {formatPrice(level.adjustedCash)}
        </p>
      </div>

      {/* Top 1 result */}
      <div className="min-w-0 flex-1">
        {hasResults ? (
          <>
            <p className="truncate text-[length:var(--text-body)] font-medium">
              {top1.aptName}
            </p>
            <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
              {top1.finalScore}점 · {formatPrice(top1.averagePrice)}
            </p>
          </>
        ) : (
          <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
            조건에 맞는 단지 없음
          </p>
        )}
      </div>

      {/* Entered/exited indicators */}
      {!isBase && hasResults && (
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          {level.entered.length > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[length:var(--text-caption)] text-green-600">
              <TrendingUp size={12} />
              +{level.entered.length}
            </span>
          )}
          {level.exited.length > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[length:var(--text-caption)] text-red-500">
              <TrendingDown size={12} />
              -{level.exited.length}
            </span>
          )}
          {level.entered.length === 0 && level.exited.length === 0 && (
            <span className="inline-flex items-center gap-0.5 text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
              <Minus size={12} />
              동일
            </span>
          )}
        </div>
      )}

      {isBase && (
        <span className="shrink-0 rounded-[var(--radius-s7-full)] bg-[var(--color-brand-500)] px-2 py-0.5 text-[11px] font-semibold text-white">
          현재
        </span>
      )}
    </div>
  );
}

export function BudgetSensitivity({
  formData,
  className,
}: BudgetSensitivityProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BudgetSensitivityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = useCallback(async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }

    setExpanded(true);

    // Fetch data if not loaded yet
    if (!data && formData) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/budget-sensitivity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            job2: formData.job2Remote ? '' : formData.job2,
          }),
        });
        if (!res.ok) {
          throw new Error('분석에 실패했습니다.');
        }
        const result: BudgetSensitivityResponse = await res.json();
        setData(result);
      } catch {
        setError('예산 민감도 분석에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    }
  }, [expanded, data, formData]);

  return (
    <div className={className}>
      {/* Toggle button */}
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center gap-[var(--space-2)] rounded-[var(--radius-s7-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-4)] py-[var(--space-3)] text-left transition-colors hover:border-[var(--color-brand-200)]"
        aria-expanded={expanded}
        aria-controls="budget-sensitivity-panel"
      >
        <TrendingUp size={16} className="text-[var(--color-brand-500)]" />
        <span className="flex-1 text-[length:var(--text-body)] font-medium">
          예산 민감도 분석
        </span>
        <span className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
          예산 변경 시 결과가 어떻게 바뀌는지 확인
        </span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div
          id="budget-sensitivity-panel"
          className="mt-[var(--space-3)] space-y-[var(--space-2)]"
          style={{ animation: 'fadeSlideUp 200ms var(--ease-out-expo) both' }}
        >
          {loading && (
            <div className="flex items-center justify-center gap-[var(--space-2)] py-[var(--space-6)] text-[var(--color-on-surface-muted)]">
              <Loader2 size={16} className="animate-spin" />
              분석 중...
            </div>
          )}

          {error && (
            <div className="rounded-[var(--radius-s7-md)] border border-red-200 bg-red-50 p-[var(--space-3)] text-center text-[length:var(--text-caption)] text-red-600">
              {error}
              <Button variant="ghost" size="sm" onClick={handleToggle} className="mt-2">
                다시 시도
              </Button>
            </div>
          )}

          {data && !loading && (
            <>
              <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
                현재 자산 기준 ±2,500만원, ±5,000만원 변동 시 Top 1 변화
              </p>
              {data.levels.map((level) => (
                <LevelRow
                  key={level.offset}
                  level={level}
                  isBase={level.offset === 0}
                />
              ))}
              <p className="pt-[var(--space-2)] text-center text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
                공공데이터 기반 참고용 분석이며 실거래를 보장하지 않습니다
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
