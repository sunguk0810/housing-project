'use client';

import { useRef } from 'react';
import { trackEvent } from '@/lib/tracking';
import { TRADE_OPTIONS_V2 } from '@/lib/constants';
import { TRADE_ICONS } from '@/components/onboarding/card-icons';
import { EmojiCardSelector } from '@/components/onboarding/EmojiCardSelector';
import type { TradeType } from '@/types/api';

interface Step1Props {
  tradeType?: TradeType;
  onTradeTypeChange: (value: TradeType) => void;
}

const OPTIONS_WITH_ICONS = TRADE_OPTIONS_V2.map((opt) => ({
  ...opt,
  icon: TRADE_ICONS[opt.value],
}));

export function Step1BasicInfo({
  tradeType,
  onTradeTypeChange,
}: Step1Props) {
  const tracked = useRef(false);

  function handleTradeTypeSelect(value: TradeType) {
    if (!tracked.current) {
      tracked.current = true;
      trackEvent({ name: 'min_input_start' });
    }
    onTradeTypeChange(value);
  }

  return (
    <div>
      <h3 className="mb-[var(--space-4)] text-[length:var(--text-title)] font-semibold">
        어떤 형태의 집을 찾고 계세요
      </h3>
      <EmojiCardSelector
        options={OPTIONS_WITH_ICONS}
        value={tradeType}
        onSelect={handleTradeTypeSelect}
        columns="3"
        ariaLabel="주거 형태 선택"
      />
    </div>
  );
}
