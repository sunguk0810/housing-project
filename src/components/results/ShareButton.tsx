'use client';

import { useCallback, useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildShareUrl, type ShareableCondition } from '@/lib/share';

interface ShareButtonProps {
  condition: ShareableCondition;
  className?: string;
}

/**
 * Share button that generates a URL with encoded search conditions.
 * Uses Web Share API on mobile, clipboard fallback on desktop.
 * Financial info (cash/income) is excluded per NFR-1.
 */
export function ShareButton({ condition, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = buildShareUrl(condition);

    const shareData = {
      title: '집분석 - 분석 조건 공유',
      text: '이 조건으로 주거 분석을 해보세요',
      url,
    };

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled or clipboard failed — try fallback
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Silent fail
      }
    }
  }, [condition]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={className}
      aria-label="분석 조건 공유"
    >
      {copied ? (
        <>
          <Check size={14} className="text-[var(--color-brand-500)]" />
          <span className="text-[var(--color-brand-500)]">복사됨</span>
        </>
      ) : (
        <>
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' ? (
            <Share2 size={14} />
          ) : (
            <Copy size={14} />
          )}
          공유
        </>
      )}
    </Button>
  );
}
