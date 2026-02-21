'use client';

import { useRef } from 'react';
import { trackEvent } from '@/lib/tracking';
import { TRADE_OPTIONS_V2, BUDGET_PROFILE_OPTIONS, LOAN_PROGRAM_OPTIONS } from '@/lib/constants';
import { TRADE_ICONS, BUDGET_PROFILE_ICONS, LOAN_PROGRAM_ICONS } from '@/components/onboarding/card-icons';
import { EmojiCardSelector } from '@/components/onboarding/EmojiCardSelector';
import type { TradeType, BudgetProfile, LoanProgram } from '@/types/api';

interface Step1Props {
  tradeType?: TradeType;
  budgetProfile: BudgetProfile;
  loanProgram: LoanProgram;
  onTradeTypeChange: (value: TradeType) => void;
  onBudgetProfileChange: (value: BudgetProfile) => void;
  onLoanProgramChange: (value: LoanProgram) => void;
}

const TRADE_WITH_ICONS = TRADE_OPTIONS_V2.map((opt) => ({
  ...opt,
  icon: TRADE_ICONS[opt.value],
}));

const PROFILE_WITH_ICONS = BUDGET_PROFILE_OPTIONS.map((opt) => ({
  ...opt,
  icon: BUDGET_PROFILE_ICONS[opt.value],
}));

const LOAN_WITH_ICONS = LOAN_PROGRAM_OPTIONS.map((opt) => ({
  ...opt,
  icon: LOAN_PROGRAM_ICONS[opt.value],
}));

export function Step1BasicInfo({
  tradeType,
  budgetProfile,
  loanProgram,
  onTradeTypeChange,
  onBudgetProfileChange,
  onLoanProgramChange,
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
    <div className="flex flex-col gap-[var(--space-6)]">
      {/* Trade type */}
      <div>
        <h3 className="mb-[var(--space-4)] text-[length:var(--text-title)] font-semibold">
          어떤 형태의 집을 찾고 계세요
        </h3>
        <EmojiCardSelector
          options={TRADE_WITH_ICONS}
          value={tradeType}
          onSelect={handleTradeTypeSelect}
          columns="2"
          ariaLabel="주거 형태 선택"
        />
      </div>

      {/* Budget profile */}
      <div>
        <h3 className="mb-[var(--space-2)] text-[length:var(--text-body)] font-semibold">
          주택보유 상태
        </h3>
        <p className="mb-[var(--space-3)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
          본인의 주택보유 상태를 선택해주세요 (자기신고 기반 참고용 시뮬레이션)
        </p>
        <EmojiCardSelector
          options={PROFILE_WITH_ICONS}
          value={budgetProfile}
          onSelect={onBudgetProfileChange}
          columns="3"
          ariaLabel="주택보유 상태 선택"
        />
      </div>

      {/* Loan program — only visible for sale */}
      {tradeType === 'sale' && (
        <div>
          <h3 className="mb-[var(--space-2)] text-[length:var(--text-body)] font-semibold">
            대출상품
          </h3>
          <p className="mb-[var(--space-3)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
            보금자리론은 부부합산 연소득 7천만원 이하 등 자격요건이 있습니다
          </p>
          <EmojiCardSelector
            options={LOAN_WITH_ICONS}
            value={loanProgram}
            onSelect={onLoanProgramChange}
            columns="2"
            ariaLabel="대출상품 선택"
          />
        </div>
      )}

      {/* Policy disclaimer */}
      <p className="text-[length:var(--text-xs)] text-[var(--color-on-surface-muted)]">
        2025.10.15 주택시장 안정화 대책 기준 (규제지역 가정).
        참고용 시뮬레이션이며 실제 대출 조건을 보장하지 않습니다.
      </p>
    </div>
  );
}
