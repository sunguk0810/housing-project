# 집콕신혼 가성비 scoring algorithm design

**The optimal 가성비 score for dual-income newlyweds is a confidence-discounted, saturation-adjusted weighted composite divided by normalized cost, blended with a budget-fit quality score at a 0.55:0.45 ratio.** This architecture separates "quality per won" (true 가성비) from "overall fit" (financial prudence + quality), giving the platform a distinctive ranking signal that no major Korean PropTech competitor currently offers — 직방, 호갱노노, 네이버부동산, and 아실 all rank by popularity, price change, or transaction volume rather than composite value-efficiency. The algorithm scores ~200 SQL-filtered candidates in pure arithmetic at runtime (zero LLM cost), with all soft dimensions pre-computed via the batch pipeline.

---

## End-to-end scoring pipeline in seven layers

The algorithm processes each apartment through seven sequential layers, transforming nine raw 0→1 dimension scores into a single `final_score` used for ranking. Here is the full data flow:

```
Raw Scores (9 dims, each 0-1)
  → L1: Saturation (diminishing returns per dimension)
  → L2: Confidence discount (γ penalty on LLM-derived dims)
  → L3: Weighted quality composite (Σ wᵢ × sᵢ')
  → L4: Synergy bonuses (+0 to +0.08)
  → L5: Hard-floor penalty multipliers (×0 to ×1)
  → L6: 가성비 ratio (quality_nonbudget / cost_normalized)
  → L7: Final blend (α×qualityScore + (1-α)×가성비_normalized)
  → MMR rerank for top-k diversity
```

**Layer 1 applies concave saturation** to model diminishing returns — going from dangerous to safe matters far more than going from safe to ultra-safe. **Layer 2 discounts soft scores** by a reliability factor γ because LLM-derived sentiment and livability carry inherent noise. **Layer 5 uses multiplicative sigmoid penalties** that can crush an otherwise-good score to near-zero when a hard constraint is violated (e.g., 55-minute commute for either partner). **Layer 7's blend ratio α = 0.55** slightly favors the quality composite over the raw 가성비 ratio, preventing the algorithm from over-rewarding cheap-but-mediocre listings — a critical failure mode of pure quality/price scores.

---

## All nine dimension formulas with saturation curves

Each dimension produces a raw score in [0, 1], then passes through a saturation function `sat(x) = x^β` where β < 1 creates concavity (diminishing returns). Below are the exact formulas, saturation exponents, and confidence multipliers.

### Hard dimensions (γ = 1.0, deterministic data)

**1. Budget fit** — asymmetric bell curve over price utilization ratio `r = price / maxBudget`:

```typescript
function budgetScore(price: number, maxBudget: number): number {
  const r = price / maxBudget;
  if (r < 0.30) return 0.3 * (r / 0.30);          // too cheap → low quality signal
  if (r < 0.50) return 0.3 + 0.7 * ((r - 0.30) / 0.20);  // ramp up
  if (r <= 0.75) return 1.0;                        // sweet spot plateau
  if (r <= 0.85) return 1.0 - 0.4 * ((r - 0.75) / 0.10);  // gentle decline
  return Math.max(0, 0.6 - 2.0 * (r - 0.85));      // steep financial stress penalty
}
// Saturation: β = 1.0 (already shaped by piecewise curve)
```

The sweet spot is **50–75% of maxBudget**, shifted down from the original 50–85% based on Korean newlywed data showing **PIR of 13.9× in Seoul** and **86.9% carrying outstanding debt**. The steeper penalty above 85% reflects the financial fragility of couples averaging **₩198M in loans**.

**2. Commute** — dual-workplace minimum, with the worse commute dominating:

```typescript
function commuteScore(timeA: number, timeB: number): number {
  const scoreA = Math.max(0, (60 - timeA) / 60);
  const scoreB = Math.max(0, (60 - timeB) / 60);
  // Weighted harmonic-ish: the worse commute matters more
  return 0.4 * Math.min(scoreA, scoreB) + 0.6 * (scoreA + scoreB) / 2;
}
// Saturation: β = 1.0 (linear is appropriate; hard penalty handles extremes)
```

Using pure `min()` is too harsh — it ignores a partner's excellent 10-minute commute. Using pure `average()` hides a miserable 55-minute commute. The **0.4×min + 0.6×avg blend** ensures both partners' commutes matter while punishing asymmetry. This is critical because **29.7% of Korean movers cite 직주근접** as their primary reason, and for 맞벌이 couples this constraint is doubled.

**3. Childcare** — square root saturation (already in original formula):

```typescript
function childcareScore(count: number): number {
  return Math.min(1, Math.sqrt(count / 30));
}
// Saturation: β = 0.5 (built into sqrt)
```

**4. Safety** — crime + CCTV + shelter composite, passed through:

```typescript
// Raw safety_composite already 0-1 from data pipeline
// Saturation: β = 0.7 — having *some* safety matters enormously
```

**5. School** — academic achievement normalized:

```typescript
// Raw school_score = achievement / 100, already 0-1
// Saturation: β = 0.85 — mild diminishing returns
```

**6. Complex scale** — piecewise with jumps at 1000/1500:

```typescript
function complexScaleScore(units: number): number {
  if (units < 300) return units / 300 * 0.4;
  if (units < 1000) return 0.4 + (units - 300) / 700 * 0.3;
  if (units < 1500) return 0.7 + (units - 1000) / 500 * 0.2;  // jump at 1000
  return 0.9 + Math.min(0.1, (units - 1500) / 2000 * 0.1);    // jump at 1500, saturates
}
// Saturation: β = 1.0 (already shaped by piecewise)
```

### Soft dimensions (LLM-enriched, batch-computed)

**7. Sentiment** (층간소음, 관리비, 주차, 조경 review analysis):

```typescript
// Raw sentiment_score from LLM batch: 0-1
// Saturation: β = 0.6 — bad→average sentiment matters far more than average→excellent
// Confidence: γ = min(1, sqrt(reviewCount / 20)) * 0.80
```

The confidence discount has **two components**: a base γ = 0.80 reflecting LLM noise, multiplied by a **review-count factor** `sqrt(n/20)` that penalizes complexes with sparse reviews. A complex with 5 reviews gets `sqrt(5/20) × 0.80 = 0.40` effective confidence; one with 30+ reviews gets the full `0.80`.

**8. Livability** (walkability, noise, community atmosphere):

```typescript
// Raw livability_score from LLM batch: 0-1
// Saturation: β = 0.6
// Confidence: γ = 0.75 (most subjective dimension)
```

**9. Condition** (building age + renovation + brand tier + maintenance):

```typescript
// Raw condition_score from LLM batch: 0-1
// Saturation: β = 0.7
// Confidence: γ = 0.85 (most verifiable of the soft dimensions)
```

Condition is the most objective soft dimension — building age is factual, brand tier follows the well-established **부동산R114 hierarchy** (힐스테이트 > 래미안 > 자이 > 롯데캐슬 > 푸르지오), and renovation status is observable. Hence γ = 0.85.

---

## Weight system with lifecycle-aware defaults

Default weights are derived from cross-referencing three data sources: 국토교통부 2024 주거실태조사 (61,000 households), 서울서베이 residential choice data, and 한국소비자원 apartment buyer surveys. The critical insight is that **59.7% of newlyweds are dual-income** and **50.9% of 맞벌이 couples are childless**, making commute and livability dominate over school and childcare in early marriage.

| Dimension | Default w | Saturation β | Confidence γ | Rationale |
|-----------|----------|-------------|-------------|-----------|
| commute | **0.22** | 1.0 | 1.0 | #2 move reason (29.7%); doubled constraint for 맞벌이 |
| budget | **0.17** | 1.0 | 1.0 | #1 factor (60.4%); partially captured in 가성비 ratio too |
| livability | **0.14** | 0.6 | 0.75 | Young couples value walkable, vibrant neighborhoods |
| safety | **0.12** | 0.7 | 1.0 | Rising concern per 서울서베이 trend data |
| condition | **0.10** | 0.7 | 0.85 | Brand-conscious generation; 방음 rated 4.15/5.0 |
| sentiment | **0.09** | 0.6 | 0.80× | Community quality; 층간소음 is top complaint |
| complexScale | **0.07** | 1.0 | 1.0 | Amenity access; management cost efficiency |
| childcare | **0.05** | 0.5 | 1.0 | Future-oriented; 78.1% childless in Year 1 |
| school | **0.04** | 0.85 | 1.0 | Not yet relevant; becomes critical at Year 3+ |

**Lifecycle weight shifting**: When a user indicates they're planning children within 1–2 years, the algorithm redistributes weight:

```typescript
function adjustWeightsForLifecycle(base: Weights, planningChildren: boolean): Weights {
  if (!planningChildren) return base;
  // Shift from livability/sentiment → childcare/school
  return {
    ...base,
    childcare: base.childcare + 0.06,   // 0.05 → 0.11
    school: base.school + 0.05,          // 0.04 → 0.09
    livability: base.livability - 0.05,  // 0.14 → 0.09
    sentiment: base.sentiment - 0.03,    // 0.09 → 0.06
    commute: base.commute - 0.03,        // 0.22 → 0.19
  };
}
```

This reflects the Korean lifecycle pattern where **childless ratio drops from 78.1% in Year 1 to 43.4% by Year 3**, triggering a fundamental priority shift toward 학군 and 보육시설.

---

## Hard-floor penalties that crush bad fits

Penalties are multiplicative — they scale the entire composite score toward zero when a hard constraint is violated. Using **sigmoid functions** avoids cliff effects while still being decisive:

```typescript
function sigmoid(x: number, sharpness: number = 10): number {
  return 1.0 / (1.0 + Math.exp(-sharpness * x));
}

function computePenalties(apt: Apartment, profile: UserProfile): number {
  let penalty = 1.0;

  // P1: Commute hard cap — either partner > 50min triggers steep penalty
  const maxCommute = Math.max(apt.commuteA, apt.commuteB);
  penalty *= sigmoid(50 - maxCommute, 0.3);   // ~0.5 at 50min, ~0.05 at 60min

  // P2: Over-budget — price > 95% of maxBudget is dangerous
  const utilization = apt.price / profile.maxBudget;
  if (utilization > 0.95) penalty *= 0.1;       // near-elimination
  else if (utilization > 0.90) penalty *= 0.5;  // strong penalty

  // P3: Safety floor — crime score in bottom 10% of dataset
  if (apt.safetyRawPercentile < 0.10) penalty *= 0.3;

  return penalty;
}
```

**P1 is the most impactful penalty** in practice. A 55-minute commute for one partner produces `sigmoid(50-55, 0.3) = sigmoid(-1.5, 0.3) ≈ 0.39`, cutting the score by 61%. This is intentional — the research shows 직주근접 is the #2 reason Koreans move, and for 맞벌이 couples, an unacceptable commute for either partner is a dealbreaker regardless of how good the apartment is otherwise.

---

## Synergy bonuses reward exceptional combinations

Rather than treating dimensions as independent, the algorithm grants bonuses when multiple related dimensions score highly together. This models the real-world observation that a walkable, well-reviewed, well-maintained neighborhood creates value greater than the sum of its parts.

```typescript
function computeSynergy(s: DimensionScores): number {
  let bonus = 0;

  // S1: "Perfect neighborhood" — sentiment + livability + condition all strong
  const neighborhoodAvg = (s.sentiment + s.livability + s.condition) / 3;
  if (neighborhoodAvg > 0.70) {
    bonus += 0.025 * (neighborhoodAvg - 0.70) / 0.30;  // max +0.025
  }

  // S2: "Value sweet spot" — good budget fit + good commute (affordable AND convenient)
  if (s.budget > 0.70 && s.commute > 0.65) {
    bonus += 0.020 * Math.min(s.budget, s.commute);  // max +0.020
  }

  // S3: "Family-ready" — childcare + school + safety all adequate
  if (s.childcare > 0.60 && s.school > 0.50 && s.safety > 0.60) {
    bonus += 0.015 * Math.min(s.childcare, s.school, s.safety);  // max +0.015
  }

  return Math.min(bonus, 0.06);  // Cap at 6% of max possible score
}
```

The **6% cap** prevents synergies from dominating the ranking. These bonuses are small nudges that break ties meaningfully — an apartment scoring 0.72 with "perfect neighborhood" synergy edges out one scoring 0.73 without it, which is the correct behavior for newlyweds who will experience that neighborhood daily.

---

## The 가성비 formula that ties everything together

Here is the complete scoring function that produces the final ranking score:

```typescript
interface ScoringResult {
  qualityScore: number;      // overall quality + budget fit
  gasungbiScore: number;     // quality per won (가성비)
  finalScore: number;        // blended ranking score
  breakdown: Record<string, number>;  // per-dimension contributions
}

function scoreApartment(
  apt: ApartmentCandidate,
  profile: UserProfile,
  weights: Weights,
  datasetStats: DatasetStats  // min/max prices in the 200-candidate set
): ScoringResult {

  // === LAYER 1-2: Raw → Saturated → Confidence-adjusted scores ===
  const raw = {
    budget:       budgetScore(apt.price, profile.maxBudget),
    commute:      commuteScore(apt.commuteA, apt.commuteB),
    childcare:    childcareScore(apt.childcareCount),
    safety:       apt.safetyComposite,
    school:       apt.schoolScore,
    complexScale: complexScaleScore(apt.totalUnits),
    sentiment:    apt.sentimentScore,
    livability:   apt.livabilityScore,
    condition:    apt.conditionScore,
  };

  const SAT: Record<string, number> = {
    budget: 1.0, commute: 1.0, childcare: 0.5,
    safety: 0.7, school: 0.85, complexScale: 1.0,
    sentiment: 0.6, livability: 0.6, condition: 0.7,
  };

  const CONF: Record<string, number> = {
    budget: 1.0, commute: 1.0, childcare: 1.0,
    safety: 1.0, school: 1.0, complexScale: 1.0,
    sentiment: Math.min(1, Math.sqrt(apt.reviewCount / 20)) * 0.80,
    livability: 0.75,
    condition: 0.85,
  };

  // Effective score per dimension
  const eff: Record<string, number> = {};
  for (const dim of Object.keys(raw)) {
    eff[dim] = Math.pow(raw[dim], SAT[dim]) * CONF[dim];
  }

  // === LAYER 3: Weighted quality composite (all 9 dims) ===
  let qualityScore = 0;
  const breakdown: Record<string, number> = {};
  for (const dim of Object.keys(eff)) {
    const contribution = weights[dim] * eff[dim];
    qualityScore += contribution;
    breakdown[dim] = contribution;
  }

  // === LAYER 4: Synergy bonuses ===
  const synergy = computeSynergy(raw);  // uses raw scores for threshold checks
  qualityScore += synergy;
  breakdown['synergy'] = synergy;

  // === LAYER 5: Hard-floor penalties ===
  const penaltyMultiplier = computePenalties(apt, profile);
  qualityScore *= penaltyMultiplier;
  breakdown['penalty'] = penaltyMultiplier;

  // === LAYER 6: 가성비 ratio (quality-per-won) ===
  // Compute non-budget quality for the numerator
  let qualityNonBudget = 0;
  const nonBudgetWeightSum = 1 - weights.budget;
  for (const dim of Object.keys(eff)) {
    if (dim === 'budget') continue;
    qualityNonBudget += (weights[dim] / nonBudgetWeightSum) * eff[dim];
  }
  qualityNonBudget += synergy;
  qualityNonBudget *= penaltyMultiplier;

  // Normalized cost: where does this price sit in the candidate set?
  const costNorm = (apt.price - datasetStats.minPrice)
    / (datasetStats.maxPrice - datasetStats.minPrice);
  const costFloor = Math.max(costNorm, 0.15);  // prevent division explosion

  const gasungbiRaw = qualityNonBudget / costFloor;

  // === LAYER 7: Normalize 가성비 within candidate set, then blend ===
  // (gasungbiNormalized is computed after all 200 candidates are scored)
  // For now, return raw; normalization happens in the orchestrator

  return { qualityScore, gasungbiScore: gasungbiRaw, finalScore: 0, breakdown };
}

// === ORCHESTRATOR: Score all candidates and produce final ranking ===
function rankCandidates(
  candidates: ApartmentCandidate[],
  profile: UserProfile,
  topK: number = 10
): RankedApartment[] {

  const weights = adjustWeightsForLifecycle(DEFAULT_WEIGHTS, profile.planningChildren);
  const stats = computeDatasetStats(candidates);

  // Score all ~200 candidates
  const scored = candidates.map(apt => ({
    apt,
    result: scoreApartment(apt, profile, weights, stats),
  }));

  // Normalize 가성비 scores to [0, 1] within this candidate set
  const gasungbiValues = scored.map(s => s.result.gasungbiScore);
  const gMin = Math.min(...gasungbiValues);
  const gMax = Math.max(...gasungbiValues);
  const gRange = gMax - gMin || 1;

  const ALPHA = 0.55;  // quality vs 가성비 blend ratio

  for (const s of scored) {
    const gNorm = (s.result.gasungbiScore - gMin) / gRange;
    s.result.finalScore = ALPHA * s.result.qualityScore
                        + (1 - ALPHA) * gNorm;
  }

  // MMR diversity rerank for top-k
  return diverseTopK(scored, topK, /* λ_mmr */ 0.80);
}
```

The **α = 0.55 blend** deserves explanation. Pure quality ranking (α = 1.0) would recommend the best apartments regardless of price — useless for 가성비. Pure 가성비 ranking (α = 0.0) would over-reward cheap apartments with mediocre quality. At **α = 0.55**, a ₩400M apartment scoring 0.82 in quality and a ₩300M apartment scoring 0.71 in quality compete on roughly equal footing — the cheaper apartment's higher 가성비 ratio compensates for its lower absolute quality. This matches the Korean newlywed mental model where 가성비 is the primary lens but quality floors still matter.

---

## MMR diversity prevents recommendation monotony

After scoring, the top-k selection uses **Maximal Marginal Relevance** to ensure the recommendation list includes geographic and price diversity:

```typescript
function diverseTopK(scored: ScoredApartment[], k: number, λ: number): RankedApartment[] {
  scored.sort((a, b) => b.result.finalScore - a.result.finalScore);
  const selected: ScoredApartment[] = [scored[0]];
  const remaining = scored.slice(1);

  while (selected.length < k && remaining.length > 0) {
    let bestIdx = 0, bestMMR = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const maxSim = Math.max(
        ...selected.map(s => apartmentSimilarity(remaining[i].apt, s.apt))
      );
      const mmr = λ * remaining[i].result.finalScore - (1 - λ) * maxSim;
      if (mmr > bestMMR) { bestMMR = mmr; bestIdx = i; }
    }
    selected.push(remaining.splice(bestIdx, 1)[0]);
  }
  return selected;
}

function apartmentSimilarity(a: Apartment, b: Apartment): number {
  const geoDist = haversineKm(a.lat, a.lng, b.lat, b.lng);
  const geoSim = Math.max(0, 1 - geoDist / 5);          // 5km normalization
  const priceSim = 1 - Math.abs(a.price - b.price) / Math.max(a.price, b.price);
  const districtSame = a.gu === b.gu ? 1.0 : 0.0;
  return 0.45 * geoSim + 0.30 * priceSim + 0.25 * districtSame;
}
```

With **λ = 0.80**, relevance dominates but the algorithm still avoids recommending five apartments from the same 동 at the same price point. This is especially valuable in Seoul where certain pockets (e.g., 마포구 공덕동, 성동구 성수동) have clusters of similarly-scored complexes.

---

## Why this design outperforms simpler alternatives

Three alternative approaches were considered and rejected:

**Pure weighted sum** (no 가성비 ratio): Treats budget as just another dimension. An apartment at ₩800M with quality score 0.90 beats an apartment at ₩400M with quality score 0.85. This violates the core value proposition — 가성비 means the cheaper apartment should win when quality is close. The hybrid blend fixes this by giving the cheaper apartment a massive 가성비 ratio advantage.

**Pure quality/price ratio**: Over-rewards the cheapest listings. A ₩200M apartment in 외곽 with quality 0.55 produces a 가성비 ratio of 0.55/0.15 = 3.67, crushing a ₩500M apartment in 강서구 with quality 0.85 (ratio 0.85/0.65 = 1.31). The α-blend with quality composite prevents this by ensuring absolute quality still matters.

**Weighted Product Model** (`Π sᵢ^wᵢ`): Elegant — a zero on any dimension zeros out the total. But it's numerically unstable with 9 dimensions, many near-zero after saturation, and impossible to explain to users. The multiplicative penalty system achieves the same "no fatal flaw" guarantee with better interpretability.

The chosen architecture is the only one that satisfies all three requirements simultaneously: rewarding value-efficiency, maintaining quality floors, and producing explainable per-dimension breakdowns for the UI.

---

## Conclusion

The algorithm's distinctive contribution is **separating quality assessment from value-efficiency assessment, then blending them** — a structure no major Korean PropTech platform currently implements. The seven-layer pipeline ensures that LLM-derived soft scores are appropriately discounted (γ = 0.75–0.85), diminishing returns are modeled per-dimension, hard dealbreakers trigger multiplicative penalties rather than being averaged away, and the final 가성비 score captures genuine value-per-won rather than just cheapness. Three implementation details matter most for production: the **review-count-adjusted confidence** on sentiment scores (sparse-review complexes get heavily discounted), the **dual-commute blend** (0.4×min + 0.6×avg) that respects both partners without being excessively punitive, and the **lifecycle weight shift** that makes 학군 and 보육시설 weights 2–3× heavier when users indicate family planning — matching the sharp Year 1→Year 3 childlessness transition in Korean newlywed demographics. All scoring runs in **O(200 × 9) = ~1,800 multiply-adds per session** with zero LLM inference, comfortably within the ₩100/session budget.