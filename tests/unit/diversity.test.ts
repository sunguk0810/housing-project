import { describe, it, expect } from "vitest";
import {
  classifyPriceTier,
  computeTierTargets,
  diversityRerank,
  DEFAULT_LAMBDA,
  DEFAULT_TOP_K,
  type DiversityCandidate,
} from "@/lib/engines/diversity";

/**
 * Diversity re-ranking unit tests (D-1 ~ D-14).
 * Source of Truth: PHASE1 S4 — diversity reranking specification
 */

// Helper: create candidate with score and price
function c<T = string>(score: number, price: number, item?: T): DiversityCandidate<T> {
  return { score, price, item: (item ?? `s${score}-p${price}`) as T };
}

describe("classifyPriceTier", () => {
  // D-1: premium boundary (exactly 85%)
  it("D-1: ratio=0.85 → premium", () => {
    expect(classifyPriceTier(8500, 10000)).toBe("premium");
  });

  // D-2: premium above boundary
  it("D-2: ratio=0.95 → premium", () => {
    expect(classifyPriceTier(9500, 10000)).toBe("premium");
  });

  // D-3: mid boundary (exactly 70%)
  it("D-3: ratio=0.70 → mid", () => {
    expect(classifyPriceTier(7000, 10000)).toBe("mid");
  });

  // D-4: mid range
  it("D-4: ratio=0.80 → mid", () => {
    expect(classifyPriceTier(8000, 10000)).toBe("mid");
  });

  // D-5: value range
  it("D-5: ratio=0.50 → value", () => {
    expect(classifyPriceTier(5000, 10000)).toBe("value");
  });

  // D-6: maxPrice=0 → all value
  it("D-6: maxPrice=0 → value", () => {
    expect(classifyPriceTier(5000, 0)).toBe("value");
    expect(classifyPriceTier(0, 0)).toBe("value");
  });
});

describe("diversityRerank", () => {
  // D-7: candidates <= topK → return all sorted by score desc
  it("D-7: returns all candidates sorted by score when <= topK", () => {
    const candidates = [c(70, 8000), c(90, 9000), c(80, 7500)];
    const result = diversityRerank(candidates, 10000, 10);
    expect(result).toHaveLength(3);
    expect(result[0].score).toBe(90);
    expect(result[1].score).toBe(80);
    expect(result[2].score).toBe(70);
  });

  // D-8: first pick is always highest score
  it("D-8: first selected candidate has the highest score", () => {
    const candidates = Array.from({ length: 15 }, (_, i) => c(95 - i, 9500 - i * 100));
    const result = diversityRerank(candidates, 10000, 10);
    expect(result[0].score).toBe(95);
  });

  // D-9: diversity ensures mid/value representation with 3-tier candidates
  // Overlapping scores across tiers (realistic: cheaper apts can have good commute/school)
  it("D-9: 3-tier set includes mid and value candidates", () => {
    // premium (85-100%): 15 candidates, scores 90→76
    const premium = Array.from({ length: 15 }, (_, i) =>
      c(90 - i, 8500 + (15 - i) * 100),
    );
    // mid (70-85%): 5 candidates, scores 88→84 (overlapping with premium)
    const mid = Array.from({ length: 5 }, (_, i) =>
      c(88 - i, 7000 + (5 - i) * 200),
    );
    // value (<70%): 5 candidates, scores 86→82 (overlapping with premium/mid)
    const value = Array.from({ length: 5 }, (_, i) =>
      c(86 - i, 5000 + (5 - i) * 200),
    );

    const all = [...premium, ...mid, ...value];
    const result = diversityRerank(all, 10000, 10);

    expect(result).toHaveLength(10);

    // Count tiers in result
    const tiers = result.map((r) => classifyPriceTier(r.price, 10000));
    const midCount = tiers.filter((t) => t === "mid").length;
    const valueCount = tiers.filter((t) => t === "value").length;

    expect(midCount).toBeGreaterThanOrEqual(1);
    expect(valueCount).toBeGreaterThanOrEqual(1);
  });

  // D-10: result length equals topK
  it("D-10: result length = topK", () => {
    const candidates = Array.from({ length: 25 }, (_, i) => c(95 - i, 9500 - i * 200));
    const result = diversityRerank(candidates, 10000, 10);
    expect(result).toHaveLength(10);
  });

  // D-11: computeTierTargets
  it("D-11: computeTierTargets sums to topK", () => {
    const t10 = computeTierTargets(10);
    expect(t10.premium + t10.mid + t10.value).toBe(10);
    expect(t10).toEqual({ premium: 3, mid: 4, value: 3 });

    const t15 = computeTierTargets(15);
    expect(t15.premium + t15.mid + t15.value).toBe(15);

    const t5 = computeTierTargets(5);
    expect(t5.premium + t5.mid + t5.value).toBe(5);
  });

  // D-12: all same score — normalizeScores returns 0.5, no error
  it("D-12: all same score → no error, diversity via tier deficit", () => {
    const candidates = Array.from({ length: 15 }, (_, i) =>
      c(80, 3000 + i * 500), // same score, different prices
    );
    const result = diversityRerank(candidates, 10000, 10);
    expect(result).toHaveLength(10);
    // Should not throw
  });

  // D-13: deterministic tiebreak — combined tie resolved by original score
  it("D-13: deterministic tiebreak — higher original score wins", () => {
    // Two candidates with same normalized score but different origIdx
    // By sorting original candidates with higher score first, origIdx < means higher original score
    const candidates = [
      c(90, 9000), // origIdx 0
      c(89, 9000), // origIdx 1 — same tier, slightly lower score
      ...Array.from({ length: 12 }, (_, i) => c(70 - i, 5000 + i * 100)),
    ];
    const result1 = diversityRerank(candidates, 10000, 10);
    const result2 = diversityRerank(candidates, 10000, 10);
    // Results should be identical across runs (deterministic)
    expect(result1.map((r) => r.score)).toEqual(result2.map((r) => r.score));
    expect(result1.map((r) => r.price)).toEqual(result2.map((r) => r.price));
  });

  // D-14: only premium candidates — no error, returns premium-only
  it("D-14: only premium candidates → returns premium 10 without error", () => {
    const candidates = Array.from({ length: 25 }, (_, i) =>
      c(95 - i, 8500 + (25 - i) * 50), // all premium (>= 85%)
    );
    const result = diversityRerank(candidates, 10000, 10);
    expect(result).toHaveLength(10);
    // All should be premium tier
    const tiers = result.map((r) => classifyPriceTier(r.price, 10000));
    expect(tiers.every((t) => t === "premium")).toBe(true);
  });
});

describe("diversity constants", () => {
  it("DEFAULT_LAMBDA = 0.30", () => {
    expect(DEFAULT_LAMBDA).toBe(0.30);
  });

  it("DEFAULT_TOP_K = 10", () => {
    expect(DEFAULT_TOP_K).toBe(10);
  });
});
