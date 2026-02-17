'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/tracking';
import { TRADE_OPTIONS_V2, MARRIAGE_PLAN_OPTIONS } from '@/lib/constants';
import { EmojiCardSelector } from '@/components/onboarding/EmojiCardSelector';
import type { TradeType } from '@/types/api';
import type { MarriagePlannedAt } from '@/types/ui';

interface Step1Props {
  tradeType?: TradeType;
  marriagePlannedAt?: MarriagePlannedAt;
  onTradeTypeChange: (value: TradeType) => void;
  onMarriagePlannedAtChange: (value: MarriagePlannedAt) => void;
  onAutoAdvance: () => void;
}

export function Step1BasicInfo({
  tradeType,
  marriagePlannedAt,
  onTradeTypeChange,
  onMarriagePlannedAtChange,
  onAutoAdvance,
}: Step1Props) {
  const tracked = useRef(false);
  const [showQ2, setShowQ2] = useState(() => !!tradeType);

  function handleFirstInteraction() {
    if (!tracked.current) {
      tracked.current = true;
      trackEvent({ name: 'min_input_start' });
    }
  }

  function handleTradeTypeSelect(value: TradeType) {
    handleFirstInteraction();
    onTradeTypeChange(value);
    // Show Q2 after brief delay
    setTimeout(() => setShowQ2(true), 300);
  }

  function handleMarriageSelect(value: MarriagePlannedAt) {
    handleFirstInteraction();
    onMarriagePlannedAtChange(value);
    // Auto-advance to next step
    setTimeout(() => onAutoAdvance(), 300);
  }

  return (
    <div className="space-y-[var(--space-8)]">
      {/* Q1: Trade type */}
      <div>
        <h3 className="mb-[var(--space-4)] text-[length:var(--text-title)] font-semibold">
          어떤 형태의 집을 찾고 계세요
        </h3>
        <EmojiCardSelector
          options={TRADE_OPTIONS_V2}
          value={tradeType}
          onSelect={handleTradeTypeSelect}
          columns="3"
          ariaLabel="주거 형태 선택"
        />
      </div>

      {/* Q2: Marriage plan — shown after trade type selection */}
      <div
        className={cn(
          'transition-all duration-300',
          showQ2
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none h-0 translate-y-4 overflow-hidden opacity-0',
        )}
      >
        <h3 className="mb-[var(--space-4)] text-[length:var(--text-title)] font-semibold">
          결혼 예정 시점을 알려주세요
        </h3>
        <EmojiCardSelector
          options={MARRIAGE_PLAN_OPTIONS}
          value={marriagePlannedAt}
          onSelect={handleMarriageSelect}
          columns="3"
          ariaLabel="결혼 예정 시점 선택"
        />
      </div>
    </div>
  );
}
