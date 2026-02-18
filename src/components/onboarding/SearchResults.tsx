'use client';

import { Fragment, type ReactNode } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KakaoLocalPlace } from '@/hooks/useKakaoLocalSearch';

interface SearchResultsProps {
  results: readonly KakaoLocalPlace[];
  isLoading: boolean;
  query: string;
  onSelect: (place: KakaoLocalPlace) => void;
  /** Called when a suggestion pill is tapped */
  onSuggestionClick?: (text: string) => void;
  className?: string;
}

export function SearchResults({
  results,
  isLoading,
  query,
  onSelect,
  onSuggestionClick,
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
        <strong className="text-[var(--color-brand-500)]">{text.slice(start, end)}</strong>
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
      {/* Suggestion pills */}
      {suggestions.length > 0 && (
        <div className="border-b border-[var(--color-border)] px-[var(--space-4)] py-[var(--space-3)]">
          <p className="mb-[var(--space-2)] text-[length:var(--text-caption)] font-medium text-[var(--color-on-surface-muted)]">
            자동 제안
          </p>
          <div className="flex flex-wrap gap-[var(--space-2)]">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestionClick?.(suggestion)}
                className="rounded-[var(--radius-s7-full)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-3)] py-[var(--space-1)] text-[length:var(--text-caption)] text-[var(--color-on-surface)] transition-colors hover:border-[var(--color-brand-400)] hover:bg-[var(--color-brand-50)]"
              >
                {highlightText(suggestion)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result list */}
      <p className="px-[var(--space-4)] py-[var(--space-2)] text-[length:var(--text-caption)] font-medium text-[var(--color-on-surface-muted)]">
        장소 결과
      </p>
      <ul>
        {results.map((place) => (
          <li key={place.id}>
            <button
              type="button"
              onClick={() => onSelect(place)}
              className="flex w-full items-start gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-3)] text-left transition-colors hover:bg-[var(--color-neutral-50)] active:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-surface-elevated)]"
            >
              {/* MapPin icon */}
              <div className="mt-[2px] flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)] dark:bg-[var(--color-surface-elevated)]">
                <MapPin size={14} strokeWidth={1.6} />
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <span className="block text-[length:var(--text-body-sm)] font-semibold text-[var(--color-on-surface)]">
                  {highlightText(place.placeName)}
                </span>
                <span className="block text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
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
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
