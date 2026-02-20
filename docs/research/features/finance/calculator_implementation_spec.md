# 집콕신혼 금융 계산기 — Claude Code 구현 명세

> **문서 목적**: Claude Code가 이 파일 하나만 읽고 금융 계산기를 구현할 수 있도록 정리
> **작성일**: 2026-02-18
> **구현 순서**: ① 온보딩 Step 3-4 통합 → ② 독립 페이지 `/calculator`
> **기술 스택**: Next.js 16 App Router · Tailwind CSS v4 · Recharts · TypeScript
> **핵심 원칙**: 모든 계산은 클라이언트 사이드. 입력값은 서버로 전송하지 않는다.

---

## 목차

1. [아키텍처 개요](#1-아키텍처-개요)
2. [계산 공식/로직 (TypeScript)](#2-계산-공식로직)
3. [기준표 데이터 모델 (JSON 스키마)](#3-기준표-데이터-모델)
4. [컴포넌트 구조 + 라우팅](#4-컴포넌트-구조--라우팅)
5. [면책/고지 문구 (위치별)](#5-면책고지-문구)
6. [Open Questions](#6-open-questions)

---

## 1. 아키텍처 개요

```
┌─────────────────────────────────────────────────┐
│                   브라우저 (클라이언트)              │
│                                                   │
│  ┌─────────────┐     ┌──────────────────────┐    │
│  │  사용자 입력  │────▶│  계산 엔진 (순수 함수)  │    │
│  │  (React 상태) │     │  calc/loan.ts        │    │
│  └─────────────┘     │  calc/dsr.ts         │    │
│                       │  calc/ltv.ts         │    │
│                       │  calc/dti.ts         │    │
│                       │  calc/prepayment.ts  │    │
│                       └──────────┬───────────┘    │
│                                  │                 │
│                       ┌──────────▼───────────┐    │
│                       │  기준표 (정적 JSON)     │    │
│                       │  data/regulation.json │    │
│                       │  data/stress-dsr.json │    │
│                       └──────────────────────┘    │
│                                                   │
│  ※ 입력값은 React 상태(메모리)에만 존재              │
│  ※ 서버 전송 없음 · localStorage 없음              │
│  ※ 페이지 이탈 시 자동 소멸                         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│                   서버 (Next.js)                  │
│                                                   │
│  역할: 기준표 JSON을 빌드타임에 번들링만 함           │
│  금지: 사용자 입력값 수신 · 로깅 · APM 기록          │
└─────────────────────────────────────────────────┘
```

### 핵심 제약

| 항목 | 규칙 |
|------|------|
| 계산 위치 | 클라이언트 전용 (서버 API 호출 없음) |
| 입력값 저장 | 금지 (localStorage/sessionStorage/cookie 사용 금지) |
| 금리 소스 | 사용자 직접 입력만 허용 (특정 은행/상품 금리 자동 참조 금지) |
| 용어 | "대출 가능" "승인 보장" 등 단정형 표현 금지 |
| 기준표 갱신 | 스트레스 금리: 6·12월, 규제지역: 정책 변경 시 수동 업데이트 |

---

## 2. 계산 공식/로직

> 모든 함수는 순수 함수(pure function)로 작성한다. 외부 상태 참조 없음.

### 2-1. 대출 상환 계산기

```typescript
// file: lib/calc/loan.ts

/** 상환 방식 */
type RepaymentMethod = 'equal_payment' | 'equal_principal' | 'bullet';

interface LoanInput {
  principal: number;       // 대출 원금 (원)
  annualRate: number;      // 연 금리 (%, 예: 3.5)
  termMonths: number;      // 대출 기간 (개월)
  method: RepaymentMethod; // 상환 방식
}

interface MonthlyPayment {
  month: number;           // 회차 (1부터)
  payment: number;         // 해당 월 납입액
  principal: number;       // 원금 상환분
  interest: number;        // 이자분
  balance: number;         // 잔여 원금
}

interface LoanResult {
  monthlyPayments: MonthlyPayment[]; // 월별 상환 스케줄
  totalPayment: number;              // 총 납입액
  totalInterest: number;             // 총 이자
  firstMonthPayment: number;         // 첫 달 납입액 (요약용)
}

/**
 * 원리금균등 상환 — 월 납입액 공식 (Annuity Formula)
 *
 * M = P × r × (1+r)^n / ((1+r)^n - 1)
 *
 * P: 원금, r: 월이자율, n: 총 회차
 */
function calcEqualPayment(input: LoanInput): LoanResult {
  const { principal, annualRate, termMonths } = input;
  const r = annualRate / 100 / 12; // 월 이자율

  if (r === 0) {
    // 금리 0% 예외 처리
    const monthly = Math.round(principal / termMonths);
    // ... 단순 균등 분할
  }

  const compoundFactor = Math.pow(1 + r, termMonths); // (1+r)^n
  const monthlyPayment = Math.round(
    principal * r * compoundFactor / (compoundFactor - 1)
  );

  const schedule: MonthlyPayment[] = [];
  let balance = principal;

  for (let m = 1; m <= termMonths; m++) {
    const interest = Math.round(balance * r);
    const principalPart = monthlyPayment - interest;
    balance = balance - principalPart;

    // 마지막 회차 잔액 보정
    if (m === termMonths) {
      balance = 0;
    }

    schedule.push({
      month: m,
      payment: monthlyPayment,
      principal: principalPart,
      interest,
      balance: Math.max(balance, 0),
    });
  }

  const totalPayment = schedule.reduce((s, p) => s + p.payment, 0);
  const totalInterest = totalPayment - principal;

  return {
    monthlyPayments: schedule,
    totalPayment,
    totalInterest,
    firstMonthPayment: monthlyPayment,
  };
}

/**
 * 원금균등 상환
 *
 * 매월 원금 = P / n (고정)
 * 매월 이자 = 잔여원금 × r
 * → 시간이 갈수록 월 납입액 감소
 */
function calcEqualPrincipal(input: LoanInput): LoanResult {
  const { principal, annualRate, termMonths } = input;
  const r = annualRate / 100 / 12;
  const monthlyPrincipal = Math.round(principal / termMonths);

  const schedule: MonthlyPayment[] = [];
  let balance = principal;

  for (let m = 1; m <= termMonths; m++) {
    const interest = Math.round(balance * r);
    const payment = monthlyPrincipal + interest;
    balance = balance - monthlyPrincipal;

    if (m === termMonths) balance = 0;

    schedule.push({
      month: m,
      payment,
      principal: monthlyPrincipal,
      interest,
      balance: Math.max(balance, 0),
    });
  }

  const totalPayment = schedule.reduce((s, p) => s + p.payment, 0);

  return {
    monthlyPayments: schedule,
    totalPayment,
    totalInterest: totalPayment - principal,
    firstMonthPayment: schedule[0].payment,
  };
}

/**
 * 만기일시 상환
 *
 * 기간 중: 이자만 납부 (P × r)
 * 만기: 원금 일시 상환
 */
function calcBullet(input: LoanInput): LoanResult {
  const { principal, annualRate, termMonths } = input;
  const r = annualRate / 100 / 12;
  const monthlyInterest = Math.round(principal * r);

  const schedule: MonthlyPayment[] = [];

  for (let m = 1; m <= termMonths; m++) {
    const isLast = m === termMonths;
    schedule.push({
      month: m,
      payment: isLast ? monthlyInterest + principal : monthlyInterest,
      principal: isLast ? principal : 0,
      interest: monthlyInterest,
      balance: isLast ? 0 : principal,
    });
  }

  const totalInterest = monthlyInterest * termMonths;

  return {
    monthlyPayments: schedule,
    totalPayment: principal + totalInterest,
    totalInterest,
    firstMonthPayment: monthlyInterest,
  };
}

/** 통합 진입점 */
export function calculateLoan(input: LoanInput): LoanResult {
  switch (input.method) {
    case 'equal_payment':   return calcEqualPayment(input);
    case 'equal_principal':  return calcEqualPrincipal(input);
    case 'bullet':           return calcBullet(input);
  }
}
```

### 2-2. DSR 계산기 (스트레스 DSR 포함)

```typescript
// file: lib/calc/dsr.ts

import { getStressDsrConfig } from '@/data/stress-dsr';

type StressLoanType = 'variable' | 'mixed' | 'periodic';

interface DsrInput {
  annualIncome: number;              // 연소득 (원)
  // 신규 주택담보대출
  newLoanPrincipal: number;          // 신규 주담대 원금
  newLoanTermMonths: number;         // 신규 주담대 기간 (월)
  newLoanAnnualRate: number;         // 신규 주담대 금리 (%)
  newLoanMethod: RepaymentMethod;    // 상환 방식
  newLoanType: StressLoanType;       // 변동형/혼합형/주기형
  isMetroArea: boolean;              // 수도권 여부 (스트레스 DSR 지역 구분)
  // 기존 대출
  existingAnnualPrincipal: number;   // 기존 대출 연간 원금 상환액
  existingAnnualInterest: number;    // 기존 대출 연간 이자 상환액
}

interface DsrResult {
  // 기본 DSR (스트레스 미적용)
  baseDsr: number;                     // % (소수점 1자리)
  baseAnnualRepayment: number;         // 신규 연간 원리금
  // 스트레스 DSR
  stressDsr: number;                   // %
  stressAnnualRepayment: number;       // 스트레스 적용 신규 연간 원리금
  stressRate: number;                  // 적용된 스트레스 금리 (%)
  appliedStressAddOn: number;          // 실제 가산된 금리 (%)
  // 여력
  remainingCapacity: number;           // 추가 가능 연간 원리금 (DSR 40% 기준)
  remainingCapacityStress: number;     // 스트레스 적용 시 추가 가능
  // 규제
  regulationLimit: number;             // 규제 한도 (은행 40%)
  isOverLimit: boolean;                // 한도 초과 여부
}

/**
 * 스트레스 금리 가산분 계산
 *
 * 최종 적용 가산금리 = 스트레스 금리 × 기본 적용비율 × 대출유형별 적용비율
 *
 * - 스트레스 금리: 금융위 발표 (6·12월), 현재 1.50%
 * - 기본 적용비율: 3단계 100% (지방 주담대 2단계 50%)
 * - 대출유형별 적용비율: 변동형 100%, 혼합형(5년 미만 고정) 60%, 주기형(5년 이상 고정) 40%
 */
function calcStressAddOn(
  loanType: StressLoanType,
  isMetroArea: boolean,
): number {
  const config = getStressDsrConfig(); // JSON에서 로드

  const stressRate = config.stressRate;           // 예: 1.50
  const baseRatio = isMetroArea
    ? config.baseRatioMetro                       // 예: 1.0 (100%)
    : config.baseRatioNonMetro;                   // 예: 0.5 (50%, 2단계 유지)

  const typeRatioMap: Record<StressLoanType, number> = {
    variable: config.typeRatioVariable,   // 1.0
    mixed: config.typeRatioMixed,         // 0.6
    periodic: config.typeRatioPeriodic,   // 0.4
  };

  return stressRate * baseRatio * typeRatioMap[loanType];
}

/**
 * 연간 원리금 상환액 산출 (DSR 분자용)
 *
 * 원리금균등: 월납입액 × 12
 * 원금균등: 연간 원금(P/n×12) + 연간 이자(근사: 잔액 평균 × 금리)
 * 만기일시: P × r (연이자만, 원금 미포함이 DSR 산정 기준)
 *   ※ 만기일시의 DSR 원금 반영은 금융위 세부규정에 따라 다를 수 있음 [가정: 이자만]
 */
function calcAnnualRepayment(
  principal: number,
  annualRate: number,
  termMonths: number,
  method: RepaymentMethod,
): number {
  const loanResult = calculateLoan({
    principal,
    annualRate,
    termMonths,
    method,
  });

  // 첫 12개월 합산 (가장 보수적)
  const first12 = loanResult.monthlyPayments.slice(0, 12);
  return first12.reduce((sum, p) => sum + p.payment, 0);
}

export function calculateDsr(input: DsrInput): DsrResult {
  const {
    annualIncome,
    newLoanPrincipal, newLoanTermMonths, newLoanAnnualRate, newLoanMethod,
    newLoanType, isMetroArea,
    existingAnnualPrincipal, existingAnnualInterest,
  } = input;

  // 1. 기본 DSR
  const baseAnnualRepayment = calcAnnualRepayment(
    newLoanPrincipal, newLoanAnnualRate, newLoanTermMonths, newLoanMethod,
  );
  const existingTotal = existingAnnualPrincipal + existingAnnualInterest;
  const baseDsr = ((baseAnnualRepayment + existingTotal) / annualIncome) * 100;

  // 2. 스트레스 DSR
  const stressAddOn = calcStressAddOn(newLoanType, isMetroArea);
  const stressRate = newLoanAnnualRate + stressAddOn;
  const stressAnnualRepayment = calcAnnualRepayment(
    newLoanPrincipal, stressRate, newLoanTermMonths, newLoanMethod,
  );
  const stressDsr = ((stressAnnualRepayment + existingTotal) / annualIncome) * 100;

  // 3. 여력 (은행권 40% 기준)
  const regulationLimit = 40;
  const maxAnnualRepayment = annualIncome * (regulationLimit / 100);
  const remainingCapacity = maxAnnualRepayment - existingTotal - baseAnnualRepayment;
  const remainingCapacityStress = maxAnnualRepayment - existingTotal - stressAnnualRepayment;

  return {
    baseDsr: Math.round(baseDsr * 10) / 10,
    baseAnnualRepayment,
    stressDsr: Math.round(stressDsr * 10) / 10,
    stressAnnualRepayment,
    stressRate,
    appliedStressAddOn: stressAddOn,
    remainingCapacity: Math.max(remainingCapacity, 0),
    remainingCapacityStress: Math.max(remainingCapacityStress, 0),
    regulationLimit,
    isOverLimit: stressDsr > regulationLimit,
  };
}
```

### 2-3. LTV 계산기

```typescript
// file: lib/calc/ltv.ts

import { getLtvTable } from '@/data/regulation';

type BorrowerType =
  | 'first_time'       // 생애최초
  | 'low_income'       // 서민실수요
  | 'no_house'         // 무주택
  | 'one_house'        // 1주택
  | 'multi_house';     // 2주택 이상

type LoanPurpose = 'purchase' | 'living_fund'; // 신규주택구입 | 생활안정자금

interface LtvInput {
  propertyValue: number;       // 주택 시세 (원)
  borrowerType: BorrowerType;
  loanPurpose: LoanPurpose;
  regionCode: string;          // 시군구 코드 (행정표준코드)
}

interface LtvResult {
  ltvRatio: number;               // 적용 LTV (%)
  maxLoanAmount: number;          // 예상 대출 범위 상한 (원)
  regulationArea: string;         // 규제지역 분류명
  conditions: string[];           // 적용 조건/예외 텍스트
  effectiveDate: string;          // 기준일
  source: string;                 // 출처
}

export function calculateLtv(input: LtvInput): LtvResult {
  const { propertyValue, borrowerType, loanPurpose, regionCode } = input;

  const table = getLtvTable();
  const areaType = table.getAreaType(regionCode); // 'speculative' | 'overheated' | 'non_regulated'

  // 기준표에서 LTV 비율 조회
  const ltvEntry = table.lookup(areaType, borrowerType, loanPurpose);

  const maxLoan = Math.floor(propertyValue * (ltvEntry.ratio / 100));

  return {
    ltvRatio: ltvEntry.ratio,
    maxLoanAmount: maxLoan,
    regulationArea: areaType,
    conditions: ltvEntry.conditions, // 예: ["서민실수요: 부부합산 연소득 9천만원 이하", ...]
    effectiveDate: table.effectiveDate,
    source: table.source,
  };
}
```

### 2-4. DTI 계산기

```typescript
// file: lib/calc/dti.ts

import { getDtiTable } from '@/data/regulation';

interface DtiInput {
  annualIncome: number;
  // 신규 주담대
  newLoanAnnualRepayment: number;    // 신규 주담대 연간 원리금 (대출 계산기에서 산출)
  // 기존 대출
  existingAnnualInterest: number;    // 기타 대출 연간 이자 상환액
  // 지역
  regionCode: string;
}

interface DtiResult {
  dtiRatio: number;          // 산출 DTI (%)
  regulationLimit: number;   // 규제 DTI 한도 (%)
  isOverLimit: boolean;
  regulationArea: string;
  effectiveDate: string;
  source: string;
}

/**
 * DTI = (주담대 연간 원리금 + 기타 대출 연간 이자) / 연소득 × 100
 */
export function calculateDti(input: DtiInput): DtiResult {
  const {
    annualIncome,
    newLoanAnnualRepayment,
    existingAnnualInterest,
    regionCode,
  } = input;

  const table = getDtiTable();
  const areaType = table.getAreaType(regionCode);
  const limit = table.getLimit(areaType); // 투기과열 40%, 조정대상 50% 등

  const dtiRatio = ((newLoanAnnualRepayment + existingAnnualInterest) / annualIncome) * 100;

  return {
    dtiRatio: Math.round(dtiRatio * 10) / 10,
    regulationLimit: limit,
    isOverLimit: dtiRatio > limit,
    regulationArea: areaType,
    effectiveDate: table.effectiveDate,
    source: table.source,
  };
}
```

### 2-5. 중도상환수수료 계산기

```typescript
// file: lib/calc/prepayment.ts

interface PrepaymentInput {
  prepaymentAmount: number;     // 중도상환 금액 (원)
  feeRate: number;              // 중도상환수수료율 (%, 사용자 직접 입력)
  loanStartDate: string;       // 대출 실행일 (YYYY-MM-DD)
  prepaymentDate: string;      // 중도상환 예정일 (YYYY-MM-DD)
  feeExemptionYears: number;   // 수수료 면제 기간 (년, 사용자 직접 입력)
}

interface PrepaymentResult {
  fee: number;                   // 중도상환수수료 (원)
  isExempt: boolean;             // 면제 해당 여부
  daysUntilExemption: number;    // 면제까지 남은 일수 (0이면 이미 면제)
  effectiveFeeRate: number;      // 실제 적용 수수료율 (일할 계산 시)
}

/**
 * 일반적 중도상환수수료 = 중도상환금액 × 수수료율 × (잔여기간/총기간)
 *
 * ※ 금융사마다 계산 방식이 상이하므로 "참고용"으로만 제공
 * ※ 수수료율은 사용자가 계약서 기준으로 직접 입력
 */
export function calculatePrepaymentFee(input: PrepaymentInput): PrepaymentResult {
  const {
    prepaymentAmount, feeRate,
    loanStartDate, prepaymentDate, feeExemptionYears,
  } = input;

  const start = new Date(loanStartDate);
  const prepay = new Date(prepaymentDate);
  const exemptionDate = new Date(start);
  exemptionDate.setFullYear(exemptionDate.getFullYear() + feeExemptionYears);

  const isExempt = prepay >= exemptionDate;

  if (isExempt) {
    return {
      fee: 0,
      isExempt: true,
      daysUntilExemption: 0,
      effectiveFeeRate: 0,
    };
  }

  // 잔여 면제기간 비례 계산
  const totalDays = (exemptionDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  const remainingDays = (exemptionDate.getTime() - prepay.getTime()) / (1000 * 60 * 60 * 24);
  const ratio = remainingDays / totalDays;

  const effectiveRate = (feeRate / 100) * ratio;
  const fee = Math.round(prepaymentAmount * effectiveRate);

  return {
    fee,
    isExempt: false,
    daysUntilExemption: Math.ceil(remainingDays),
    effectiveFeeRate: Math.round(effectiveRate * 10000) / 100, // %
  };
}
```

---

## 3. 기준표 데이터 모델

> 기준표는 정적 JSON으로 관리하며, 빌드타임에 번들링한다.
> 정책 변경 시 JSON 수정 → 재배포로 갱신한다.

### 3-1. 스트레스 DSR 기준표

```jsonc
// file: data/stress-dsr.json
{
  "$schema": "StressDsrConfig",
  "version": "2026-01-01",
  "effectiveDate": "2026-01-01",
  "expiryDate": "2026-06-30",
  "source": "금융위원회 2025.12.10 보도자료",
  "sourceUrl": "https://www.fsc.go.kr/...",

  "stressRate": 1.50,

  "baseRatio": {
    "metro": 1.0,
    "nonMetro": 0.5,
    "description": {
      "metro": "수도권 + 규제지역: 3단계 100%",
      "nonMetro": "지방 주담대(규제지역 외): 2단계 50% 유지 (2026.1.1~6.30)"
    }
  },

  "typeRatio": {
    "variable": { "ratio": 1.0, "label": "변동형", "description": "변동금리 대출" },
    "mixed":    { "ratio": 0.6, "label": "혼합형", "description": "5년 미만 고정 후 변동" },
    "periodic": { "ratio": 0.4, "label": "주기형", "description": "5년 이상 고정금리 주기 변동" }
  },

  "dsrLimit": {
    "bank": 40,
    "nonBank": 50,
    "description": "은행권 40%, 2금융권 50%"
  },

  "updateSchedule": "6월·12월 금융위 발표 후 6개월 적용",

  "_CHANGELOG": [
    { "date": "2025-07-01", "change": "3단계 시행 (全업권 확대)" },
    { "date": "2026-01-01", "change": "지방 주담대 2단계 유지 연장 (2026.6.30까지)" }
  ]
}
```

### 3-2. LTV/DTI 규제 기준표

```jsonc
// file: data/regulation.json
{
  "$schema": "RegulationTable",
  "version": "2026-02-18",
  "effectiveDate": "2025-09-01",
  "source": "금융위원회 10.15 대책 FAQ / 대출수요 관리 FAQ",

  "regulationAreas": {
    "speculative": {
      "label": "투기과열지구",
      "regions": []
    },
    "adjustment": {
      "label": "조정대상지역",
      "regions": []
    },
    "non_regulated": {
      "label": "비규제지역",
      "description": "위 외 전 지역"
    }
  },

  "ltv": {
    "speculative": {
      "no_house":    { "ratio": 40, "conditions": ["무주택세대주"] },
      "first_time":  { "ratio": 70, "conditions": ["생애최초 구매자", "소득/가격 요건 충족 시 우대"] },
      "low_income":  { "ratio": 60, "conditions": ["서민실수요: 부부합산 연소득 9천만원 이하", "주택가격 9억원 이하 (조정대상 8억원 이하)"] },
      "one_house":   { "ratio": 0,  "conditions": ["원칙적 불가 (처분조건부 등 예외)"] },
      "multi_house": { "ratio": 0,  "conditions": ["불가"] }
    },
    "adjustment": {
      "no_house":    { "ratio": 50, "conditions": ["무주택세대주 (아파트 기준)"] },
      "first_time":  { "ratio": 70, "conditions": ["생애최초 구매자"] },
      "low_income":  { "ratio": 60, "conditions": ["서민실수요 요건 충족"] },
      "one_house":   { "ratio": 50, "conditions": ["처분/상환 조건 적용 가능"] },
      "multi_house": { "ratio": 0,  "conditions": ["원칙적 불가"] }
    },
    "non_regulated": {
      "no_house":    { "ratio": 70, "conditions": [] },
      "first_time":  { "ratio": 70, "conditions": [] },
      "low_income":  { "ratio": 70, "conditions": [] },
      "one_house":   { "ratio": 70, "conditions": [] },
      "multi_house": { "ratio": 60, "conditions": ["일부 금융기관 자체 제한 가능"] }
    },
    "purchaseOnly": true,
    "livingFundDiscount": 10
  },

  "dti": {
    "speculative": { "limit": 40, "conditions": ["투기과열지구 아파트"] },
    "adjustment":  { "limit": 50, "conditions": ["조정대상지역 아파트"] },
    "non_regulated": { "limit": 60, "conditions": ["비규제지역 (은행 자체 기준)"] }
  },

  "_NOTE": "규제지역 regions 배열은 정책 변경 시 수동 업데이트. 현재 지정 지역이 없으면 빈 배열."
}
```

### 3-3. 행정구역 코드 (별도 파일)

```jsonc
// file: data/regions.json
// 행정안전부 행정표준코드 기반, 시/도 → 시/군/구 2단계
{
  "version": "2026-01",
  "source": "행정안전부 행정표준코드 전체코드",
  "regions": [
    {
      "sido": "11",
      "sidoName": "서울특별시",
      "isMetro": true,
      "sigungu": [
        { "code": "11110", "name": "종로구" },
        { "code": "11140", "name": "중구" }
        // ...
      ]
    },
    {
      "sido": "41",
      "sidoName": "경기도",
      "isMetro": true,
      "sigungu": [
        { "code": "41110", "name": "수원시 장안구" }
        // ...
      ]
    }
    // ...
  ]
}
```

### 3-4. TypeScript 타입 정의 (기준표 접근)

```typescript
// file: lib/data/types.ts

export interface StressDsrConfig {
  version: string;
  effectiveDate: string;
  expiryDate: string;
  source: string;
  stressRate: number;
  baseRatio: {
    metro: number;
    nonMetro: number;
  };
  typeRatio: Record<string, { ratio: number; label: string }>;
  dsrLimit: { bank: number; nonBank: number };
}

export interface RegulationEntry {
  ratio: number;
  conditions: string[];
}

export interface RegulationTable {
  version: string;
  effectiveDate: string;
  source: string;
  ltv: Record<string, Record<string, RegulationEntry>>;
  dti: Record<string, { limit: number; conditions: string[] }>;
  getAreaType: (regionCode: string) => string;
}

// 기준표 로더 (빌드타임 import)
export function getStressDsrConfig(): StressDsrConfig {
  return require('@/data/stress-dsr.json');
}

export function getLtvTable(): RegulationTable {
  const raw = require('@/data/regulation.json');
  return {
    ...raw,
    getAreaType(regionCode: string) {
      for (const [type, area] of Object.entries(raw.regulationAreas)) {
        if ((area as any).regions?.includes(regionCode)) return type;
      }
      return 'non_regulated';
    },
  };
}
```

---

## 4. 컴포넌트 구조 + 라우팅

### 4-1. 파일 트리

```
src/
├── app/
│   ├── search/                        # 온보딩 (기존)
│   │   └── page.tsx                   # 5스텝 위저드
│   └── calculator/                    # 독립 계산기 (Phase 2)
│       └── page.tsx
│
├── components/
│   ├── calculator/                    # 계산기 공용 컴포넌트
│   │   ├── LoanCalculator.tsx         # 대출 상환 계산기 (풀버전)
│   │   ├── DsrCalculator.tsx          # DSR 계산기 (풀버전)
│   │   ├── LtvCalculator.tsx          # LTV 계산기 (풀버전)
│   │   ├── DtiCalculator.tsx          # DTI 계산기 (풀버전)
│   │   ├── PrepaymentCalculator.tsx   # 중도상환수수료 계산기
│   │   ├── CalcResultCard.tsx         # 결과 카드 (면책 고지 내장)
│   │   ├── CalcDisclaimer.tsx         # 면책/출처/기준일 고지 컴포넌트
│   │   ├── TermTooltip.tsx            # 용어 설명 툴팁
│   │   ├── RegionPicker.tsx           # 시/도·시/군/구 선택기
│   │   ├── RepaymentMethodSelector.tsx # 상환방식 선택 (3탭)
│   │   ├── StressTypeSelector.tsx     # 스트레스 유형 선택 (3탭)
│   │   ├── QuickAmountButtons.tsx     # 빠른 금액 입력 (+1000만 등)
│   │   └── BorrowerTypeSelector.tsx   # 차주 유형 선택 (5분류)
│   │
│   └── onboarding/                    # 온보딩 전용 컴포넌트
│       ├── Step3Income.tsx            # Step 3: 소득·자산 (기존)
│       ├── Step3DsrGuide.tsx          # Step 3 하단: DSR 가이드 카드 (NEW)
│       ├── Step4Debt.tsx              # Step 4: 부채·예산 (기존)
│       └── Step4DsrSummary.tsx        # Step 4 하단: 현재 DSR + 여력 (NEW)
│
├── lib/
│   └── calc/                          # 순수 계산 함수 (위 §2의 파일들)
│       ├── loan.ts
│       ├── dsr.ts
│       ├── ltv.ts
│       ├── dti.ts
│       └── prepayment.ts
│
├── data/                              # 정적 기준표 JSON
│   ├── stress-dsr.json
│   ├── regulation.json
│   └── regions.json
│
└── constants/
    └── disclaimers.ts                 # 면책 문구 상수 (위 §5)
```

### 4-2. 라우팅

| URL | 페이지 | 렌더링 | 인증 | 구현 순서 |
|-----|--------|--------|------|----------|
| `/search` | 온보딩 5스텝 위저드 (Step3-4에 계산기 통합) | CSR | ❌ | Phase 1 |
| `/calculator` | 독립 금융 계산기 (탭 구조) | SSG + CSR | ❌ | Phase 2 |

### 4-3. Phase 1 — 온보딩 통합 상세

> 핵심: 기존 5스텝 완료 시간(~2분 30초)을 크게 늘리지 않아야 한다.
> 계산기는 "접히는 카드"로 기본 접힘, 사용자가 원할 때만 펼침.

#### Step3Income.tsx → Step3DsrGuide.tsx 연동

```
┌──────────────────────────────────────────┐
│  Step 3. 소득과 자산                       │
│                                           │
│  합산 연봉    [+1천만][+5천만][+1억] [직접입력] │
│  보유 현금    [+1천만][+5천만][+1억] [직접입력] │
│                                           │
│  ┌─ 💡 DSR 가이드 (접기/펼치기) ──────────┐ │
│  │                                        │ │
│  │  DSR 40% 기준 연간 상환 여력:            │ │
│  │  약 ₩24,000,000                        │ │
│  │  (= 연봉 6,000만 × 40%)                │ │
│  │                                        │ │
│  │  💬 DSR이란? [더 알아보기]               │ │
│  │                                        │ │
│  │  ⚠️ 참고용 시뮬레이션 · 승인 보장 아님    │ │
│  │  📅 기준일: 2026-02-18 | 출처: 금융위    │ │
│  └────────────────────────────────────────┘ │
│                                           │
│  🔒 입력 정보는 분석 후 즉시 삭제됩니다       │
│                            [다음 →]        │
└──────────────────────────────────────────┘
```

**계산 트리거**: `annualIncome` 값이 변경될 때마다 즉시 계산 (debounce 300ms).
**기본값**: DSR 40% (은행권 기준), 변경 불가 (온보딩에서는 단순화).
**UX**: Accordion/Collapsible — 기본 접힘 상태. 펼치면 DSR 설명 + 여력 표시.

#### Step4Debt.tsx → Step4DsrSummary.tsx 연동

```
┌──────────────────────────────────────────┐
│  Step 4. 부채와 예산                       │
│                                           │
│  기존 대출 연간 원리금                       │
│  [+100만][+500만][+1000만] [직접입력]       │
│                                           │
│  월 주거비 상한                             │
│  [+50만][+100만][+200만] [직접입력]         │
│                                           │
│  ┌─ 📊 현재 DSR 상태 (접기/펼치기) ────────┐ │
│  │                                        │ │
│  │  현재 DSR      ██████░░░░  23.5%       │ │
│  │  한도 (40%)    ──────────────────       │ │
│  │                                        │ │
│  │  추가 상환 여력:                         │ │
│  │  연 약 ₩9,900,000 (월 약 ₩825,000)     │ │
│  │                                        │ │
│  │  금리 3.5% · 30년 · 원리금균등 가정 시    │ │
│  │  추정 추가 대출 범위: 약 1.8억~2.2억원    │ │
│  │  (금리 ±0.5%p 반영)                     │ │
│  │                                        │ │
│  │  ⚠️ 참고용 · 실제는 금융기관 심사에 따라   │ │
│  │     달라질 수 있어요                      │ │
│  └────────────────────────────────────────┘ │
│                                           │
│  🔒 이 금액은 분석 후 즉시 삭제됩니다         │
│                            [분석 시작 →]    │
└──────────────────────────────────────────┘
```

**계산 트리거**: `existingDebt` 또는 `monthlyBudget` 변경 시.
**입력 연동**: Step3의 `annualIncome`을 React 상태로 전달받음.
**민감도 표시**: 금리 ±0.5%p 범위로 상·하한을 함께 표시 → 단정 방지.

### 4-4. Phase 2 — 독립 페이지 `/calculator`

```
┌──────────────────────────────────────────┐
│  금융 계산기                    [용어 설명 ON/OFF] │
│                                           │
│  [대출 상환] [DSR] [LTV] [DTI] [중도상환수수료]    │
│  ─────────────────────────────────────────── │
│                                           │
│  (선택된 탭의 풀 계산기 렌더링)                │
│                                           │
│  ┌─ 결과 영역 ────────────────────────────┐ │
│  │  (CalcResultCard + CalcDisclaimer)      │ │
│  └────────────────────────────────────────┘ │
│                                           │
│  ┌─ CTA ──────────────────────────────────┐ │
│  │  이 조건으로 분석 결과 보기 →              │ │
│  │  (입력값을 /search로 프리필 전달)          │ │
│  └────────────────────────────────────────┘ │
│                                           │
│  📅 기준일: 2026-02-18                      │
│  📑 출처: 금융위원회 · 한국은행                │
│  ⚠️ 본 계산기는 참고용 정보 제공 도구이며...     │
└──────────────────────────────────────────┘
```

**탭 구조**:

| 탭 | 우선순위 | 컴포넌트 |
|----|---------|---------|
| 대출 상환 | P0 | `<LoanCalculator />` |
| DSR | P0 | `<DsrCalculator />` |
| LTV | P1 | `<LtvCalculator />` |
| DTI | P1 | `<DtiCalculator />` |
| 중도상환수수료 | P1 | `<PrepaymentCalculator />` |

**CTA 연결**: 계산기에서 입력한 값(연봉, 대출금액 등)을 URL query param으로 `/search`에 전달하여 온보딩 프리필 가능. 단, URL에 민감 정보를 노출하므로 `state` 전달 방식(Next.js `router.push`의 state) 사용.

**용어 설명 토글**: 우상단 스위치. ON 시 각 입력 필드 옆에 인라인 설명 표시 (네이버 금융 계산기 참조).

---

## 5. 면책/고지 문구

> 모든 문구는 `constants/disclaimers.ts`에서 중앙 관리한다.

```typescript
// file: constants/disclaimers.ts

export const DISCLAIMERS = {

  // ───── 공통 ─────

  /** 모든 계산 결과에 고정 */
  RESULT_REFERENCE: '참고용 시뮬레이션 결과이며, 실제 대출 승인이나 한도를 보장하지 않습니다.',

  /** 금리 관련 */
  RATE_USER_INPUT: '금리는 사용자가 직접 입력한 값 기준입니다. 실제 금리는 금융기관·상품·신용도에 따라 달라집니다.',

  /** 기준일 템플릿 */
  EFFECTIVE_DATE: (date: string, source: string) =>
    `기준일: ${date} | 출처: ${source}`,

  /** 서비스 정체성 */
  SERVICE_IDENTITY: '집콕신혼은 부동산 중개·알선·금융자문 서비스가 아닌 정보 분석 도구입니다.',

  /** 비저장 */
  NO_STORAGE: '입력하신 정보는 분석 후 즉시 삭제되며, 서버에 저장되지 않습니다.',

  /** 비저장 축약 */
  NO_STORAGE_SHORT: '이 금액은 분석 후 즉시 삭제됩니다.',

  // ───── 위치별 ─────

  /** 온보딩 Step 3 상단 인라인 배너 */
  ONBOARDING_STEP3_BANNER:
    '🔒 입력 정보는 분석 후 즉시 삭제되며, 서버에 저장되지 않습니다.',

  /** 온보딩 DSR 가이드 카드 내 */
  ONBOARDING_DSR_GUIDE:
    '참고용 시뮬레이션입니다. 실제 대출 한도는 금융기관 심사·정책 변경에 따라 달라질 수 있어요.',

  /** 독립 계산기 각 탭 상단 */
  CALCULATOR_TAB_HEADER: (termName: string, termDescription: string) =>
    `${termName}: ${termDescription}`,

  /** 독립 계산기 결과 하단 */
  CALCULATOR_RESULT_FOOTER:
    '이 결과는 입력값 기준 참고 계산이며, 실제와 차이가 있을 수 있습니다. 정확한 금액은 해당 금융기관에 문의하세요.',

  /** 외부 매물 CTA 근처 */
  OUTLINK_IDENTITY:
    '집콕신혼은 중개·알선·금융자문이 아닌 정보 제공 도구입니다. 매물·대출 상담은 해당 사이트/금융기관에서 진행됩니다.',

  // ───── 계산기별 ─────

  /** 대출 상환 */
  LOAN_DISCLAIMER:
    '월/일 단위 계산 방식 차이, 윤년 등으로 실제 금액과 차이가 발생할 수 있습니다.',

  /** DSR */
  DSR_DISCLAIMER:
    '스트레스 DSR은 DSR 산정 시 가산금리를 반영하는 제도이며, 실제 대출 금리에는 영향을 주지 않습니다.',

  /** LTV */
  LTV_DISCLAIMER:
    '예상 대출 범위(참고용)입니다. 규제지역·예외조건·금융기관 정책에 따라 실제와 다를 수 있습니다.',

  /** DTI */
  DTI_DISCLAIMER:
    'DTI만으로 대출 한도가 확정되지 않으며, DSR 등 다른 규제가 동시에 적용됩니다.',

  /** 중도상환수수료 */
  PREPAYMENT_DISCLAIMER:
    '수수료율과 면제조건은 대출 계약서 기준입니다. 금융사·상품별로 계산 방식이 다를 수 있습니다.',

} as const;

// ───── 금지 표현 (코드리뷰/린트용) ─────

export const FORBIDDEN_EXPRESSIONS = [
  '대출 가능',        // → "예상 대출 범위(참고용)"
  '승인 보장',        // → 사용 금지
  '승인 가능',        // → 사용 금지
  '무조건',           // → 사용 금지
  '확정',             // → "참고용 시뮬레이션 결과"
  '최저금리',         // → 사용 금지 (비교/추천 뉘앙스)
  '추천',             // → "분석 결과 안내"
  '유리한 은행',       // → 사용 금지
  '예산 적정',        // → "참고 범위 이내"
  '예산 안전',        // → 사용 금지
] as const;

// ───── 용어 사전 (용어 설명 토글용) ─────

export const TERM_GLOSSARY: Record<string, { term: string; description: string }> = {
  dsr: {
    term: 'DSR(총부채원리금상환비율)',
    description: '차주의 상환능력 대비 원리금상환부담을 나타내는 지표로, 보유한 모든 대출의 연간 원리금상환액을 연간소득으로 나누어 산출됩니다.',
  },
  stressDsr: {
    term: '스트레스 DSR',
    description: 'DSR 산정 시 가산금리(스트레스 금리)를 반영해 대출한도를 산출하는 제도입니다. 실제 대출금리에는 영향을 주지 않습니다.',
  },
  ltv: {
    term: 'LTV(담보인정비율)',
    description: '자산의 담보가치에 대한 대출 비율을 의미하며, 주택가격에 대한 대출 비율로 많이 알려져 있습니다.',
  },
  dti: {
    term: 'DTI(총부채상환비율)',
    description: '주택담보대출 차주의 원리금상환능력을 감안하여 주택담보대출 한도를 설정하기 위해 도입된 규제 비율입니다.',
  },
  equalPayment: {
    term: '원리금균등상환',
    description: '매월 동일한 금액(원금+이자)을 상환하는 방식입니다. 초기에 이자 비중이 높고 후반에 원금 비중이 높아집니다.',
  },
  equalPrincipal: {
    term: '원금균등상환',
    description: '매월 동일한 원금을 상환하고 이자는 잔액에 대해 계산됩니다. 시간이 갈수록 월 납입액이 줄어듭니다.',
  },
  bullet: {
    term: '만기일시상환',
    description: '대출 기간 중에는 이자만 납부하고 만기에 원금을 일시 상환하는 방식입니다.',
  },
};
```

### 면책 위치 매핑 (구현 체크리스트)

| # | 위치 | 사용 상수 | 노출 형태 |
|---|------|---------|---------|
| ① | 온보딩 Step 3 금융 입력 상단 | `ONBOARDING_STEP3_BANNER` | 인라인 배너 (primaryLight 배경) |
| ② | 온보딩 Step 3 DSR 가이드 카드 내 | `ONBOARDING_DSR_GUIDE` + `EFFECTIVE_DATE()` | 카드 하단 소형 텍스트 |
| ③ | 온보딩 Step 4 DSR 요약 카드 내 | `RESULT_REFERENCE` + `RATE_USER_INPUT` | 카드 하단 소형 텍스트 |
| ④ | 온보딩 각 금융 입력 하단 | `NO_STORAGE_SHORT` | 1줄 캡션 |
| ⑤ | `/calculator` 각 탭 상단 | `CALCULATOR_TAB_HEADER()` (용어 정의) | 설명 박스 |
| ⑥ | `/calculator` 결과 카드 하단 | `CALCULATOR_RESULT_FOOTER` + `EFFECTIVE_DATE()` + 계산기별 면책 | 고정 영역 |
| ⑦ | `/calculator` 페이지 푸터 | `SERVICE_IDENTITY` + `NO_STORAGE` | 소형 텍스트 |
| ⑧ | 결과 페이지 단지 카드 (예산 적합도) | `RESULT_REFERENCE` + `EFFECTIVE_DATE()` | ⓘ 툴팁 |
| ⑨ | 외부 매물 CTA 근처 | `OUTLINK_IDENTITY` | CTA 하단 캡션 |

---

## 6. Open Questions

> 구현 착수 전 Product/Legal/Dev가 결정해야 할 항목.

| # | 질문 | 영향 범위 | Owner |
|---|------|---------|-------|
| 1 | 온보딩 DSR 기본값을 은행권 40% 고정할지, 사용자가 업권(은행/비은행) 선택 가능하게 할지? | `Step3DsrGuide`, `Step4DsrSummary` | Product |
| 2 | Step4에서 "추정 추가 대출 범위"를 금액으로 표시할지, 월 상환 여력만 표시할지? (금액 표시 = "한도 조회" 오인 리스크 상승) | `Step4DsrSummary` | Product + Legal |
| 3 | 세션 복원(뒤로가기/새로고침) 시 입력값을 React 상태(메모리)만으로 유지할지, sessionStorage를 허용할지? | 전체 계산기 UX | Legal + Dev |
| 4 | 규제지역 변동 시 기준표 반영 SLA를 어느 수준으로 둘지? (예: 24시간 내 배포) | `regulation.json` 운영 | Dev + Product |
| 5 | `/calculator`에서 입력값을 `/search`로 전달할 때 URL param vs router state vs 어떤 방식? | 라우팅 | Dev |
| 6 | LTV 계산기에서 "생활안정자금" 목적도 지원할지, MVP는 "주택구입"만 지원할지? | `LtvCalculator` | Product |
| 7 | 중도상환수수료 계산기를 P1에 포함할지, 완전 제외할지? (리서치 리포트에서 "P1 또는 제외" 판정) | `/calculator` 탭 구조 | Product |
| 8 | Top10 단지 결과에서 DSR/LTV 체크를 단지별로 자동 적용할지, 사용자가 수동 확인하는 구조로 할지? | 결과 페이지 | Product + Legal |