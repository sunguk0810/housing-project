'use client';

import { Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SharedConditionBannerProps {
  className?: string;
}

/**
 * Banner shown when a user opens a shared search URL.
 * Informs the user that conditions have been pre-filled,
 * and that they need to enter their own financial information.
 */
export function SharedConditionBanner({ className }: SharedConditionBannerProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-[var(--space-3)] rounded-[var(--radius-s7-lg)] border border-[var(--color-brand-200)] bg-[var(--color-brand-50)] p-[var(--space-4)]',
        className,
      )}
      role="status"
    >
      <Link2
        size={18}
        className="mt-0.5 shrink-0 text-[var(--color-brand-500)]"
      />
      <div className="space-y-1">
        <p className="text-[length:var(--text-body)] font-medium text-[var(--color-on-surface)]">
          공유된 분석 조건이 적용되었습니다
        </p>
        <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
          거래 유형, 직장 위치, 분석 프로필이 미리 입력되어 있습니다.
          재무 정보만 직접 입력하면 분석을 시작할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
