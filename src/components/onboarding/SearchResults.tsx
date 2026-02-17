'use client';

import { Fragment, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { KakaoLocalPlace } from '@/hooks/useKakaoLocalSearch';

interface SearchResultsProps {
  results: readonly KakaoLocalPlace[];
  isLoading: boolean;
  query: string;
  onSelect: (place: KakaoLocalPlace) => void;
  className?: string;
}

export function SearchResults({
  results,
  isLoading,
  query,
  onSelect,
  className,
}: SearchResultsProps) {
  const trimmed = query.trim();
  const normalizedQuery = trimmed.toLowerCase();
  const suggestions =
    trimmed.length >= 2
      ? Array.from(
          new Set(
            results
              .map((place) => place.placeName)
              .filter((name) => name.toLowerCase().includes(normalizedQuery)),
          ),
        ).slice(0, 5)
      : [];

  function highlightText(text: string): ReactNode {
    if (!normalizedQuery) return text;
    const lower = text.toLowerCase();
    const start = lower.indexOf(normalizedQuery);
    if (start < 0) return text;
    const end = start + normalizedQuery.length;
    return (
      <>
        {text.slice(0, start)}
        <strong>{text.slice(start, end)}</strong>
        {text.slice(end)}
      </>
    );
  }

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-[var(--space-8)]', className)}>
        <span className="text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
          검색 중...
        </span>
      </div>
    );
  }

  if (trimmed.length >= 2 && results.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-[var(--space-8)]', className)}>
        <span className="text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
          검색 결과가 없어요
        </span>
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <div className={className}>
      {suggestions.length > 0 && (
        <div className="border-b border-[var(--color-border)] px-[var(--space-4)] py-[var(--space-2)]">
          <p className="mb-[var(--space-2)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
            자동 제안
          </p>
          <div className="flex flex-wrap gap-[var(--space-2)]">
            {suggestions.map((suggestion) => (
              <span
                key={suggestion}
                className="rounded-full bg-[var(--color-surface-sunken)] px-[var(--space-2)] py-1 text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]"
              >
                {highlightText(suggestion)}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="px-[var(--space-4)] py-[var(--space-2)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
        장소 결과
      </p>
      <ul className="divide-y divide-[var(--color-border)]">
        {results.map((place) => (
          <li key={place.id}>
            <button
              type="button"
              onClick={() => onSelect(place)}
              className="flex w-full flex-col gap-[var(--space-1)] px-[var(--space-4)] py-[var(--space-3)] text-left transition-colors hover:bg-[var(--color-surface-sunken)]"
            >
              <span className="text-[length:var(--text-body-sm)] font-semibold text-[var(--color-on-surface)]">
                {highlightText(place.placeName)}
              </span>
              <span className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
                {place.roadAddressName || place.addressName}
                {place.categoryGroupName && (
                  <Fragment>
                    <span className="mx-[var(--space-1)]">·</span>
                    <span className="text-[var(--color-neutral-400)]">
                      {place.categoryGroupName}
                    </span>
                  </Fragment>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
