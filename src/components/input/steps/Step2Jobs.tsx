'use client';

/**
 * @deprecated Use Step2Workplace instead.
 * Kept only for backward compatibility with legacy previews.
 */

import { AddressSearch } from '@/components/input/AddressSearch';

interface Step2Props {
  job1: string;
  job2: string;
  onJob1Change: (address: string) => void;
  onJob2Change: (address: string) => void;
  job1Error?: string;
}

export function Step2Jobs({ job1, job2, onJob1Change, onJob2Change, job1Error }: Step2Props) {
  return (
    <div className="space-y-[var(--space-6)]">
      <AddressSearch
        label="직장 1 (필수)"
        value={job1}
        onChange={onJob1Change}
        error={job1Error}
        required
      />
      <AddressSearch label="직장 2 (선택)" value={job2} onChange={onJob2Change} />
      <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
        맞벌이인 경우 두 번째 직장도 입력하면 더 정확한 통근 분석이 가능합니다.
      </p>
    </div>
  );
}
