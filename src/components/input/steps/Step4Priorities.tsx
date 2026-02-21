'use client';

import { EmojiCardSelector } from '@/components/onboarding/EmojiCardSelector';
import { WEIGHT_PROFILE_ICONS } from '@/components/onboarding/card-icons';
import type { WeightProfile } from '@/types/api';

const WEIGHT_PROFILE_OPTIONS = [
  {
    value: 'balanced' as const,
    label: '균형잡기',
    emoji: '',
    icon: WEIGHT_PROFILE_ICONS.balanced,
    description: '모든 조건을 골고루 살펴요',
  },
  {
    value: 'budget_focused' as const,
    label: '가성비 우선',
    emoji: '',
    icon: WEIGHT_PROFILE_ICONS.budget_focused,
    description: '월 고정비를 가장 먼저 따져요',
  },
  {
    value: 'commute_focused' as const,
    label: '통근 우선',
    emoji: '',
    icon: WEIGHT_PROFILE_ICONS.commute_focused,
    description: '출퇴근 시간을 가장 먼저 따져요',
  },
  {
    value: 'complex_focused' as const,
    label: '대단지 우선',
    emoji: '',
    icon: WEIGHT_PROFILE_ICONS.complex_focused,
    description: '세대수가 많은 단지를 우선해요',
  },
  {
    value: 'value_maximized' as const,
    label: '가치 극대화',
    emoji: '',
    icon: WEIGHT_PROFILE_ICONS.value_maximized,
    description: '예산 안에서 최고 품질을 찾아요',
  },
] as const;

interface Step4Props {
  weightProfile: WeightProfile;
  onWeightProfileChange: (value: WeightProfile) => void;
}

export function Step4Priorities({
  weightProfile,
  onWeightProfileChange,
}: Step4Props) {
  return (
    <div className="space-y-[var(--space-8)]">
      <h3 className="text-[length:var(--text-title)] font-semibold">
        가장 중요한 조건을 알려주세요
      </h3>
      <EmojiCardSelector
        options={WEIGHT_PROFILE_OPTIONS}
        value={weightProfile}
        onSelect={onWeightProfileChange}
        columns="4"
        ariaLabel="분석 프로필 선택"
        className="[&>button]:min-h-[120px]"
      />
    </div>
  );
}
