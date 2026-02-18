'use client';

import { useRef, useEffect } from 'react';
import { X, Search } from 'lucide-react';
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
      {/* Search bar header */}
      <div className="bg-[var(--color-surface)] px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-3)] shadow-[var(--shadow-s7-sm)]">
        <div className="flex items-center gap-[var(--space-2)]">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--color-on-surface-muted)] hover:bg-[var(--color-neutral-100)]"
          >
            <X size={20} />
          </button>

          {/* Search input bar */}
          <div className="flex flex-1 items-center gap-[var(--space-2)] rounded-[var(--radius-s7-full)] bg-[var(--color-neutral-100)] px-[var(--space-4)] py-[var(--space-2)] dark:bg-[var(--color-surface-elevated)]">
            <Search size={16} className="shrink-0 text-[var(--color-neutral-400)]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => search(e.target.value)}
              placeholder={placeholder}
              className={cn(
                'flex-1 bg-transparent text-[length:var(--text-body-sm)] text-[var(--color-on-surface)]',
                'placeholder:text-[var(--color-neutral-400)]',
                'outline-none',
              )}
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={clear}
                aria-label="검색어 지우기"
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-neutral-300)] text-white dark:bg-[var(--color-neutral-600)]"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        <SearchResults
          results={results}
          isLoading={isLoading}
          query={query}
          onSelect={handleSelect}
          onSuggestionClick={search}
        />
      </div>
    </div>
  );
}
