'use client';

import { FamilyPlanSelector } from '@/components/onboarding/FamilyPlanSelector';
import { LivingAreaChipSelector } from '@/components/onboarding/LivingAreaChipSelector';
import { PrioritySliderGroup } from '@/components/onboarding/PrioritySliderGroup';
import type { ChildPlan, LivingAreaKey, PriorityWeights } from '@/types/ui';

interface Step4Props {
  priorityWeights: PriorityWeights;
  livingAreas: readonly LivingAreaKey[];
  childPlan?: ChildPlan;
  onPriorityWeightsChange: (value: PriorityWeights) => void;
  onLivingAreasChange: (values: LivingAreaKey[]) => void;
  onChildPlanChange: (value: ChildPlan) => void;
}

export function Step4Priorities({
  priorityWeights,
  livingAreas,
  childPlan,
  onPriorityWeightsChange,
  onLivingAreasChange,
  onChildPlanChange,
}: Step4Props) {
  return (
    <div className="space-y-[var(--space-8)]">
      <h3 className="text-[length:var(--text-title)] font-semibold">
        가장 중요한 조건을 알려주세요
      </h3>
      <PrioritySliderGroup value={priorityWeights} onChange={onPriorityWeightsChange} />
      <LivingAreaChipSelector values={livingAreas} onChange={onLivingAreasChange} />
      <FamilyPlanSelector value={childPlan} onChange={onChildPlanChange} />
    </div>
  );
}
