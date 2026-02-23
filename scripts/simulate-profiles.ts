/**
 * Profile-based scoring simulation script.
 *
 * Generates 12 mock apartment candidates with diverse characteristics,
 * then compares scoring results across all 5 weight profiles.
 *
 * Usage: npx tsx scripts/simulate-profiles.ts
 *
 * Source of Truth: PHASE1 S4 (scoring formulas & weight profiles)
 */

import { normalizeScore, calculateFinalScore, WEIGHT_PROFILES } from "../src/lib/engines/scoring";
import { diversityRerank, classifyPriceTier } from "../src/lib/engines/diversity";
import type { ScoringInput, WeightProfileKey, DimensionScores } from "../src/types/engine";
import { WEIGHT_PROFILE_KEYS } from "../src/types/engine";

// ============================================================
// 1. Mock candidate data — 12 apartments with diverse traits
// ============================================================

interface MockApartment {
  name: string;
  /** Characteristic tag for quick identification */
  tag: string;
  scoringInput: ScoringInput;
}

const MAX_PRICE = 60_000; // 6 billion won budget (common for dual-income newlyweds)

const MOCK_APARTMENTS: readonly MockApartment[] = [
  {
    name: "래미안 강남포레스트",
    tag: "premium-balanced",
    scoringInput: {
      apartmentPrice: 52000, maxPrice: MAX_PRICE,
      commuteTime1: 20, commuteTime2: 25,
      childcareCount800m: 12, crimeLevel: 2, cctvDensity: 4.5, shelterCount: 8,
      achievementScore: 88, householdCount: 1200,
    },
  },
  {
    name: "힐스테이트 판교역",
    tag: "commute-excellent",
    scoringInput: {
      apartmentPrice: 48000, maxPrice: MAX_PRICE,
      commuteTime1: 10, commuteTime2: 15,
      childcareCount800m: 8, crimeLevel: 3, cctvDensity: 3.5, shelterCount: 6,
      achievementScore: 75, householdCount: 800,
    },
  },
  {
    name: "e편한세상 시흥",
    tag: "budget-friendly",
    scoringInput: {
      apartmentPrice: 25000, maxPrice: MAX_PRICE,
      commuteTime1: 50, commuteTime2: 55,
      childcareCount800m: 6, crimeLevel: 5, cctvDensity: 2.0, shelterCount: 4,
      achievementScore: 55, householdCount: 600,
    },
  },
  {
    name: "자이 위례신도시",
    tag: "childcare-rich",
    scoringInput: {
      apartmentPrice: 42000, maxPrice: MAX_PRICE,
      commuteTime1: 35, commuteTime2: 40,
      childcareCount800m: 28, crimeLevel: 3, cctvDensity: 3.0, shelterCount: 7,
      achievementScore: 72, householdCount: 1500,
    },
  },
  {
    name: "푸르지오 동탄2",
    tag: "mega-complex",
    scoringInput: {
      apartmentPrice: 38000, maxPrice: MAX_PRICE,
      commuteTime1: 45, commuteTime2: 50,
      childcareCount800m: 20, crimeLevel: 4, cctvDensity: 3.0, shelterCount: 6,
      achievementScore: 68, householdCount: 3500,
    },
  },
  {
    name: "삼성 래미안 목동",
    tag: "school-top",
    scoringInput: {
      apartmentPrice: 50000, maxPrice: MAX_PRICE,
      commuteTime1: 30, commuteTime2: 35,
      childcareCount800m: 10, crimeLevel: 3, cctvDensity: 3.8, shelterCount: 5,
      achievementScore: 95, householdCount: 900,
    },
  },
  {
    name: "롯데캐슬 마포",
    tag: "safety-top",
    scoringInput: {
      apartmentPrice: 45000, maxPrice: MAX_PRICE,
      commuteTime1: 25, commuteTime2: 30,
      childcareCount800m: 9, crimeLevel: 1, cctvDensity: 5.0, shelterCount: 10,
      achievementScore: 70, householdCount: 700,
    },
  },
  {
    name: "호반써밋 인천",
    tag: "value-pick",
    scoringInput: {
      apartmentPrice: 20000, maxPrice: MAX_PRICE,
      commuteTime1: 55, commuteTime2: 60,
      childcareCount800m: 15, crimeLevel: 6, cctvDensity: 2.5, shelterCount: 3,
      achievementScore: 50, householdCount: 400,
    },
  },
  {
    name: "아크로 리버파크",
    tag: "premium-high",
    scoringInput: {
      apartmentPrice: 58000, maxPrice: MAX_PRICE,
      commuteTime1: 15, commuteTime2: 20,
      childcareCount800m: 5, crimeLevel: 2, cctvDensity: 4.0, shelterCount: 7,
      achievementScore: 90, householdCount: 500,
    },
  },
  {
    name: "더샵 광명역",
    tag: "commute-good-value",
    scoringInput: {
      apartmentPrice: 35000, maxPrice: MAX_PRICE,
      commuteTime1: 20, commuteTime2: 30,
      childcareCount800m: 11, crimeLevel: 4, cctvDensity: 3.2, shelterCount: 5,
      achievementScore: 62, householdCount: 2000,
    },
  },
  {
    name: "한양수자인 김포",
    tag: "small-complex-cheap",
    scoringInput: {
      apartmentPrice: 18000, maxPrice: MAX_PRICE,
      commuteTime1: 50, commuteTime2: 45,
      childcareCount800m: 4, crimeLevel: 7, cctvDensity: 1.5, shelterCount: 2,
      achievementScore: 45, householdCount: 120,
    },
  },
  {
    name: "브라이튼 여의도",
    tag: "commute-premium",
    scoringInput: {
      apartmentPrice: 55000, maxPrice: MAX_PRICE,
      commuteTime1: 10, commuteTime2: 20,
      childcareCount800m: 7, crimeLevel: 2, cctvDensity: 4.2, shelterCount: 9,
      achievementScore: 82, householdCount: 350,
    },
  },
] as const;

// ============================================================
// 2. Profile labels (Korean)
// ============================================================

const PROFILE_LABELS: Record<WeightProfileKey, string> = {
  balanced: "균형형",
  budget_focused: "예산 중심",
  commute_focused: "통근 중심",
  complex_focused: "대단지 중심",
  value_maximized: "가치 극대화",
};

const DIM_LABELS: Record<keyof DimensionScores, string> = {
  budget: "예산",
  commute: "통근",
  childcare: "보육",
  safety: "안전",
  school: "학군",
  complexScale: "규모",
};

// ============================================================
// 3. Simulation runner
// ============================================================

function runSimulation(): void {
  console.log("=".repeat(80));
  console.log("  부동산 프로필별 스코어링 시뮬레이션");
  console.log("  PHASE1 S4 기반 | 가상 후보 단지 12개 × 프로필 5개");
  console.log("=".repeat(80));
  console.log();

  // --- 3a. Normalization results for all candidates ---
  console.log("▶ 1단계: 정규화 점수 (0~1)");
  console.log("-".repeat(80));

  const header = [
    "단지명".padEnd(20),
    ...Object.values(DIM_LABELS).map((l) => l.padStart(6)),
  ].join(" | ");
  console.log(header);
  console.log("-".repeat(80));

  for (const apt of MOCK_APARTMENTS) {
    const dims = normalizeScore(apt.scoringInput);
    const row = [
      apt.name.padEnd(20),
      dims.budget.toFixed(3).padStart(6),
      dims.commute.toFixed(3).padStart(6),
      dims.childcare.toFixed(3).padStart(6),
      dims.safety.toFixed(3).padStart(6),
      dims.school.toFixed(3).padStart(6),
      dims.complexScale.toFixed(3).padStart(6),
    ].join(" | ");
    console.log(row);
  }
  console.log();

  // --- 3b. Final scores per profile ---
  console.log("▶ 2단계: 프로필별 최종 점수 (0~100)");
  console.log("-".repeat(100));

  const profileHeader = [
    "단지명".padEnd(20),
    ...WEIGHT_PROFILE_KEYS.map((k) => PROFILE_LABELS[k].padStart(10)),
  ].join(" | ");
  console.log(profileHeader);
  console.log("-".repeat(100));

  // Compute all scores
  const allResults: Array<{
    apt: MockApartment;
    scores: Record<WeightProfileKey, number>;
    results: Record<WeightProfileKey, ReturnType<typeof calculateFinalScore>>;
  }> = [];

  for (const apt of MOCK_APARTMENTS) {
    const scores: Record<string, number> = {};
    const results: Record<string, ReturnType<typeof calculateFinalScore>> = {};

    for (const profile of WEIGHT_PROFILE_KEYS) {
      const result = calculateFinalScore(apt.scoringInput, profile);
      scores[profile] = result.finalScore;
      results[profile] = result;
    }

    allResults.push({
      apt,
      scores: scores as Record<WeightProfileKey, number>,
      results: results as Record<WeightProfileKey, ReturnType<typeof calculateFinalScore>>,
    });

    const row = [
      apt.name.padEnd(20),
      ...WEIGHT_PROFILE_KEYS.map((k) => scores[k].toFixed(1).padStart(10)),
    ].join(" | ");
    console.log(row);
  }
  console.log();

  // --- 3c. Rankings per profile ---
  console.log("▶ 3단계: 프로필별 Top 5 순위");
  console.log("=".repeat(100));

  for (const profile of WEIGHT_PROFILE_KEYS) {
    const sorted = [...allResults].sort(
      (a, b) => b.scores[profile] - a.scores[profile],
    );

    console.log();
    console.log(`  📊 ${PROFILE_LABELS[profile]} (${profile})`);
    console.log(`  가중치: ${formatWeights(WEIGHT_PROFILES[profile])}`);
    console.log("-".repeat(80));

    for (let i = 0; i < Math.min(5, sorted.length); i++) {
      const entry = sorted[i];
      const result = entry.results[profile];
      console.log(
        `  ${(i + 1).toString().padStart(2)}위 | ${entry.apt.name.padEnd(20)} | ` +
        `${entry.scores[profile].toFixed(1).padStart(5)}점 | ` +
        `[${entry.apt.tag}]`,
      );
      console.log(
        `       사유: ${result.reason}`,
      );
      if (result.whyNot) {
        console.log(`       약점: ${result.whyNot}`);
      }
    }
    console.log();
  }

  // --- 3d. Diversity rerank for value_maximized ---
  console.log("▶ 4단계: 가치 극대화 — 다양성 재정렬 (diversity rerank) 비교");
  console.log("=".repeat(100));

  const valueSorted = [...allResults].sort(
    (a, b) => b.scores.value_maximized - a.scores.value_maximized,
  );

  console.log();
  console.log("  [재정렬 전 — 순수 점수 순]");
  console.log("-".repeat(80));
  for (let i = 0; i < Math.min(10, valueSorted.length); i++) {
    const e = valueSorted[i];
    const tier = classifyPriceTier(e.apt.scoringInput.apartmentPrice, MAX_PRICE);
    console.log(
      `  ${(i + 1).toString().padStart(2)}위 | ${e.apt.name.padEnd(20)} | ` +
      `${e.scores.value_maximized.toFixed(1).padStart(5)}점 | ` +
      `가격: ${(e.apt.scoringInput.apartmentPrice / 10000).toFixed(1)}억 | ` +
      `티어: ${tier}`,
    );
  }

  const diversityCandidates = allResults.map((r) => ({
    score: r.scores.value_maximized,
    price: r.apt.scoringInput.apartmentPrice,
    item: r,
  }));

  const reranked = diversityRerank(diversityCandidates, MAX_PRICE, 10);

  console.log();
  console.log("  [재정렬 후 — 다양성 적용]");
  console.log(`  목표 분포: premium 30% / mid 40% / value 30%`);
  console.log("-".repeat(80));

  const tierCounts: Record<string, number> = { premium: 0, mid: 0, value: 0 };
  for (let i = 0; i < reranked.length; i++) {
    const c = reranked[i];
    const tier = classifyPriceTier(c.price, MAX_PRICE);
    tierCounts[tier]++;
    console.log(
      `  ${(i + 1).toString().padStart(2)}위 | ${c.item.apt.name.padEnd(20)} | ` +
      `${c.score.toFixed(1).padStart(5)}점 | ` +
      `가격: ${(c.price / 10000).toFixed(1)}억 | ` +
      `티어: ${tier}`,
    );
  }

  console.log();
  console.log("  티어 분포 결과:");
  for (const [tier, count] of Object.entries(tierCounts)) {
    console.log(`    ${tier}: ${count}개 (${((count / reranked.length) * 100).toFixed(0)}%)`);
  }

  // --- 3e. Cross-profile rank shift analysis ---
  console.log();
  console.log("▶ 5단계: 프로필 간 순위 변동 분석");
  console.log("=".repeat(100));
  console.log();
  console.log("  각 단지가 프로필에 따라 순위가 어떻게 바뀌는지 보여줍니다.");
  console.log("-".repeat(100));

  const rankHeader = [
    "단지명".padEnd(20),
    ...WEIGHT_PROFILE_KEYS.map((k) => PROFILE_LABELS[k].padStart(10)),
    "변동폭".padStart(8),
  ].join(" | ");
  console.log(rankHeader);
  console.log("-".repeat(100));

  for (const apt of allResults) {
    const ranks: number[] = [];
    for (const profile of WEIGHT_PROFILE_KEYS) {
      const sorted = [...allResults].sort(
        (a, b) => b.scores[profile] - a.scores[profile],
      );
      const rank = sorted.findIndex((e) => e.apt.name === apt.apt.name) + 1;
      ranks.push(rank);
    }

    const minRank = Math.min(...ranks);
    const maxRank = Math.max(...ranks);
    const shift = maxRank - minRank;

    const row = [
      apt.apt.name.padEnd(20),
      ...ranks.map((r) => `${r}위`.padStart(10)),
      `±${shift}`.padStart(8),
    ].join(" | ");
    console.log(row);
  }

  console.log();
  console.log("=".repeat(80));
  console.log("  시뮬레이션 완료");
  console.log("  * 출처: PHASE1 S4 스코어링 엔진 (가상 데이터 기반 분석 결과)");
  console.log("  * 본 결과는 참고용 정보 제공이며 거래/승인을 보장하지 않습니다.");
  console.log("=".repeat(80));
}

// ============================================================
// Helpers
// ============================================================

function formatWeights(w: Record<keyof DimensionScores, number>): string {
  return Object.entries(w)
    .map(([k, v]) => `${DIM_LABELS[k as keyof DimensionScores]}=${(v * 100).toFixed(0)}%`)
    .join(", ");
}

// ============================================================
// Entry point
// ============================================================

runSimulation();
