'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useKakaoLocalSearch, type KakaoLocalPlace } from '@/hooks/useKakaoLocalSearch';
import { SearchResults } from './SearchResults';

interface FullScreenSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (place: KakaoLocalPlace) => void;
  placeholder?: string;
}

export function FullScreenSearch({
  open,
  onClose,
  onSelect,
  placeholder = '직장 주소를 검색해주세요',
}: FullScreenSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, results, isLoading, search, clear } = useKakaoLocalSearch();

  useEffect(() => {
    if (open) {
      // Small delay to wait for transition
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
    clear();
  }, [open, clear]);

  function handleSelect(place: KakaoLocalPlace) {
    onSelect(place);
    clear();
    onClose();
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col bg-[var(--color-surface)]',
        'transition-transform duration-300 ease-out',
        open ? 'translate-y-0' : 'pointer-events-none translate-y-full',
      )}
      aria-modal={open}
      role="dialog"
      aria-label="주소 검색"
    >
      {/* Header */}
      <div className="border-b border-[var(--color-border)] px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-2)]">
        <div className="mb-[var(--space-1)] text-[length:var(--text-caption)] font-medium text-[var(--color-primary)]">
          직장 주소
        </div>
        <div className="flex items-center gap-[var(--space-3)] border-b-2 border-[var(--color-primary)] pb-[var(--space-2)]">
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-[var(--color-on-surface-muted)]"
          >
            ✕
          </button>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder={placeholder}
            className={cn(
              'flex-1 bg-transparent text-[length:var(--text-body)] text-[var(--color-on-surface)]',
              'placeholder:text-[var(--color-neutral-400)]',
              'outline-none',
            )}
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={clear}
              aria-label="검색어 지우기"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]"
            >
              지우기
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        <SearchResults
          results={results}
          isLoading={isLoading}
          query={query}
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
}
