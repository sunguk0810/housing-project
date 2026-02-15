/**
 * API request/response types.
 * Source of Truth: M2 spec Section 7.1
 *
 * "추천" -> "분석 결과" / "안내" (PHASE0 S4 compliance)
 */

// ============================================================
// Common Types
// ============================================================

export type TradeType = "sale" | "jeonse";
export type WeightProfile = "balanced" | "budget_focused" | "commute_focused";

export interface Coordinate {
  readonly lat: number;
  readonly lng: number;
}

// ============================================================
// POST /api/recommend
// ============================================================

export interface RecommendRequest {
  readonly cash: number;
  readonly income: number;
  readonly loans: number;
  readonly monthlyBudget: number;
  readonly job1: string;
  readonly job2?: string;
  readonly tradeType: TradeType;
  readonly weightProfile: WeightProfile;
}

export interface SourceInfo {
  readonly priceDate: string;
  readonly safetyDate: string;
}

export interface RecommendationItem {
  readonly rank: number;
  readonly aptId: number;
  readonly aptName: string;
  readonly address: string;
  readonly monthlyCost: number;
  readonly commuteTime1: number;
  readonly commuteTime2: number | null;
  readonly childcareCount: number;
  readonly schoolScore: number;
  readonly safetyScore: number;
  readonly finalScore: number;
  readonly reason: string;
  readonly whyNot: string | null;
  readonly sources: SourceInfo;
}

export interface RecommendMeta {
  readonly totalCandidates: number;
  readonly computedAt: string;
}

export interface RecommendResponse {
  readonly recommendations: ReadonlyArray<RecommendationItem>;
  readonly meta: RecommendMeta;
}

// ============================================================
// GET /api/apartments/[id]
// ============================================================

export interface PriceHistoryItem {
  readonly tradeType: TradeType;
  readonly year: number;
  readonly month: number;
  readonly averagePrice: number;
  readonly dealCount: number;
}

export interface NearbyChildcareItem {
  readonly id: number;
  readonly name: string;
  readonly evaluationGrade: string | null;
  readonly distanceMeters: number;
}

export interface NearbySchoolItem {
  readonly id: number;
  readonly name: string;
  readonly schoolLevel: string | null;
  readonly achievementScore: number | null;
  readonly distanceMeters: number;
}

export interface SafetyDetail {
  readonly regionCode: string;
  readonly regionName: string | null;
  readonly calculatedScore: number | null;
  readonly crimeRate: number | null;
  readonly cctvDensity: number | null;
  readonly shelterCount: number | null;
  readonly dataDate: string | null;
}

export interface CommuteInfo {
  readonly toGbd: number | null;
  readonly toYbd: number | null;
  readonly toCbd: number | null;
  readonly toPangyo: number | null;
}

export interface ApartmentDetailResponse {
  readonly apartment: {
    readonly id: number;
    readonly aptCode: string;
    readonly aptName: string;
    readonly address: string;
    readonly builtYear: number | null;
    readonly householdCount: number | null;
    readonly areaMin: number | null;
    readonly areaMax: number | null;
    readonly prices: ReadonlyArray<PriceHistoryItem>;
  };
  readonly nearby: {
    readonly childcare: {
      readonly count: number;
      readonly items: ReadonlyArray<NearbyChildcareItem>;
    };
    readonly schools: ReadonlyArray<NearbySchoolItem>;
    readonly safety: SafetyDetail | null;
  };
  readonly commute: CommuteInfo;
  readonly sources: {
    readonly priceDate: string;
    readonly safetyDate: string | null;
  };
}

// ============================================================
// GET /api/health
// ============================================================

export interface HealthCheckItem {
  readonly name: string;
  readonly status: "ok" | "error";
  readonly latencyMs?: number;
  readonly message?: string;
}

export interface HealthResponse {
  readonly status: "healthy" | "degraded";
  readonly timestamp: string;
  readonly version: string;
  readonly checks: ReadonlyArray<HealthCheckItem>;
}

// ============================================================
// Error Response
// ============================================================

export interface ValidationDetail {
  readonly field: string;
  readonly message: string;
}

export interface ApiErrorResponse {
  readonly error: {
    readonly code: ApiErrorCode;
    readonly message: string;
    readonly details?: ReadonlyArray<ValidationDetail>;
  };
}

export type ApiErrorCode =
  | "INVALID_JSON"
  | "VALIDATION_ERROR"
  | "ADDRESS_NOT_FOUND"
  | "INVALID_PARAMETER"
  | "APARTMENT_NOT_FOUND"
  | "INTERNAL_ERROR";
