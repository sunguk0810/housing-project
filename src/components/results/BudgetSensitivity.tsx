'use client';

import { useState, useCallback, useRef } from 'react';
import { TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import type { BudgetSensitivityResponse, BudgetLevelResult } from '@/types/api';
import type { StepFormData } from '@/hooks/useStepForm';

interface BudgetSensitivityDrawerProps {
  formData: StepFormData | null;
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
  const sign = offset > 0 ? '+' : '-';
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
      className={cn(
        'relative flex items-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-3)]',
        isBase && 'bg-[var(--color-highlight-row)]'
      )}
    >
      {/* Accent bar for base row */}
      {isBase && (
        <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-[var(--color-brand-400)]" />
      )}

      {/* Offset label */}
      <div className="w-24 shrink-0">
        <span
          className={cn(
            'text-[length:var(--text-body)] tabular-nums',
            isBase
              ? 'font-semibold text-[var(--color-brand-600)]'
              : 'font-medium text-[var(--color-on-surface)]'
          )}
        >
          {formatOffset(level.offset)}
        </span>
        {!isBase && (
          <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
            {formatPrice(level.adjustedCash)}
          </p>
        )}
      </div>

      {/* Top 1 result */}
      <div className="min-w-0 flex-1">
        {hasResults ? (
          <>
            <p className={cn(
              'truncate text-[length:var(--text-body)]',
              isBase ? 'font-semibold' : 'font-medium'
            )}>
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

      {/* Entered/exited indicators or base badge */}
      {isBase && (
        <Badge variant="outline" className="shrink-0 text-[var(--color-brand-600)] border-[var(--color-brand-200)] bg-[var(--color-surface)]">
          기준
        </Badge>
      )}
      {!isBase && hasResults && (
        <div className="flex shrink-0 items-center gap-1">
          {level.entered.length > 0 && (
            <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[11px] px-1.5 py-0">
              +{level.entered.length}
            </Badge>
          )}
          {level.exited.length > 0 && (
            <Badge className="bg-rose-50 text-rose-500 border border-rose-200 text-[11px] px-1.5 py-0">
              -{level.exited.length}
            </Badge>
          )}
          {level.entered.length === 0 && level.exited.length === 0 && (
            <span className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
              변동없음
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function BudgetSensitivityDrawer({
  formData,
}: BudgetSensitivityDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BudgetSensitivityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (!formData) return;
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
  }, [formData]);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (isOpen && !fetchedRef.current) {
      fetchedRef.current = true;
      void fetchData();
    }
  }, [fetchData]);

  const handleRetry = useCallback(async () => {
    fetchedRef.current = false;
    setData(null);
    await fetchData();
  }, [fetchData]);

  return (
    <Drawer onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-[var(--radius-s7-full)] border-[1.5px] border-[var(--color-border)] bg-transparent px-[var(--space-3)] py-1 text-[length:var(--text-caption)] font-medium text-[var(--color-on-surface)] transition-colors hover:border-[var(--color-brand-400)]"
        >
          <TrendingUp className="size-3 shrink-0" />
          <span className="lg:hidden">민감도</span>
          <span className="hidden lg:inline">예산 민감도</span>
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="inline-flex items-center gap-[var(--space-2)]">
            <TrendingUp size={16} className="text-[var(--color-brand-500)]" />
            예산 민감도 분석
          </DrawerTitle>
          <DrawerDescription>
            현재 자산 기준 ±2,500만원, ±5,000만원 변동 시 Top 1 변화
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-[var(--space-4)] pb-[var(--space-4)]">
          {loading && (
            <div className="flex items-center justify-center gap-[var(--space-2)] py-[var(--space-6)] text-[var(--color-on-surface-muted)]">
              <Loader2 size={16} className="animate-spin" />
              분석 중...
            </div>
          )}

          {error && (
            <div className="rounded-[var(--radius-s7-md)] border border-red-200 bg-red-50 p-[var(--space-3)] text-center text-[length:var(--text-caption)] text-red-600">
              {error}
              <Button variant="ghost" size="sm" onClick={handleRetry} className="mt-2">
                다시 시도
              </Button>
            </div>
          )}

          {data && !loading && (
            <div className="overflow-hidden rounded-[var(--radius-s7-md)] border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
              {data.levels.map((level) => (
                <LevelRow
                  key={level.offset}
                  level={level}
                  isBase={level.offset === 0}
                />
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
