/**
 * Application constants for M3 frontend.
 * Source of Truth: M3 spec Section 3
 */

import type { StepDefinition } from "@/types/ui";

// Disclaimer touch-points (5 total per PHASE0 compliance)
export const DISCLAIMER_TEXTS = {
  footer:
    "본 서비스는 참고용 분석 정보를 제공하며, 부동산 거래를 중개하지 않습니다. 모든 투자 결정은 이용자 본인의 판단과 책임 하에 이루어져야 합니다.",
  banner:
    "본 서비스는 공공 데이터 기반 참고 정보이며, 실제 거래 조건과 다를 수 있습니다.",
  dataSource: "출처: 공공데이터포털, KOSIS 등 공공 데이터 기반 분석 결과",
  externalLink:
    "외부 사이트로 이동합니다. 해당 사이트의 내용은 본 서비스와 무관하며, 별도의 이용약관이 적용됩니다.",
  termsService:
    "본 서비스는 부동산 거래를 중개하는 서비스가 아니며, 공공 데이터에 기반한 참고 정보만을 제공합니다.",
} as const;

export const STEP_DEFINITIONS: ReadonlyArray<StepDefinition> = [
  { step: 1, title: "주거 유형", description: "주거형태와 자녀계획을 선택해주세요" },
  { step: 2, title: "직장 위치", description: "직장 주소를 입력해주세요" },
  { step: 3, title: "소득 정보", description: "소득과 자산 정보를 입력해주세요" },
  { step: 4, title: "지출·가중치", description: "대출과 분석 가중치를 설정해주세요" },
  { step: 5, title: "분석 중", description: "최적 단지를 분석하고 있습니다" },
];

export const SESSION_KEYS = {
  formData: "hc_form_data",
  results: "hc_results",
  consent: "hc_consent",
  disclaimerSeen: "hc_disclaimer_seen",
  visitedApts: "hc_visited_apts",
  compareItems: "hc_compare_items",
} as const;

export const POLICY_VERSION = "2026-02-16-v1";

// FORBIDDEN_PHRASES: Defined in test files only (src/__tests__/compliance/)
// to avoid compliance scan false-positives on the definition itself.

export const QUICK_AMOUNT_BUTTONS = {
  small: { label: "+1,000만", value: 1000 },
  medium: { label: "+5,000만", value: 5000 },
  large: { label: "+1억", value: 10000 },
} as const;

export const SORT_OPTIONS = [
  { value: "score" as const, label: "종합 점수순", shortLabel: "종합순" },
  { value: "budget" as const, label: "예산 적합도순", shortLabel: "예산순" },
  { value: "commute" as const, label: "통근 시간순", shortLabel: "통근순" },
] as const;

export const ANALYSIS_STEPS = [
  { label: "단지 데이터 수집", iconName: "Building" as const },
  { label: "통근 시간 계산", iconName: "Train" as const },
  { label: "종합 점수 산출", iconName: "BarChart3" as const },
  { label: "결과 지도 생성", iconName: "Map" as const },
] as const;
