import { sql } from 'drizzle-orm';
import { db } from '@/db/connection';
import { safeNum } from '@/lib/utils/safe-num';
import type { DesiredAreaKey } from '@/types/api';

/**
 * Candidate apartment query for the recommend pipeline.
 * Extracts CTE-based spatial/budget filtering from route handler.
 *
 * Source of Truth: M2 spec Section 6.1 (Steps 4-5)
 */

// --- Types ---

export interface FetchCandidatesInput {
  readonly tradeType: 'sale' | 'jeonse' | 'monthly';
  readonly maxPrice: number;
  readonly desiredAreas: readonly DesiredAreaKey[];
  readonly candidateLimit?: number;
}

export interface CandidateRow {
  readonly id: number;
  readonly aptCode: string;
  readonly aptName: string;
  readonly address: string;
  readonly regionCode: string | null;
  readonly longitude: number;
  readonly latitude: number;
  readonly builtYear: number | null;
  readonly householdCount: number | null;
  readonly areaMin: number | null;
  readonly areaMax: number | null;
  readonly averagePrice: number | null;
  readonly monthlyRentAvg: number | null;
  readonly dealCount: number | null;
  readonly priceYear: number | null;
  readonly priceMonth: number | null;
}

// --- Constants ---

const AREA_RANGES: Record<DesiredAreaKey, { min: number; max: number }> = {
  small: { min: 0, max: 49 },
  medium: { min: 50, max: 69 },
  large: { min: 70, max: 9999 },
};

const DEFAULT_CANDIDATE_LIMIT = 200;
const LOOKBACK_MONTHS = 23;

// --- Area filter builder ---

function buildAreaFilterSql(desiredAreas: readonly DesiredAreaKey[]) {
  if (desiredAreas.length >= 3) return sql``;

  const conditions = desiredAreas.map((key) => {
    const range = AREA_RANGES[key];
    if (key === 'small') {
      return sql`(a.area_max > 0 AND (a.area_min < ${range.max + 1} OR a.area_min IS NULL))`;
    }
    if (key === 'large') {
      return sql`(a.area_max >= ${range.min})`;
    }
    // medium
    return sql`(a.area_min < ${range.max + 1} AND a.area_max >= ${range.min})`;
  });

  return sql`AND (${sql.join(conditions, sql` OR `)})`;
}

// --- Row validation & transformation ---

interface RawCandidateRow {
  id: unknown;
  aptCode: string;
  aptName: string;
  address: string;
  regionCode: string | null;
  longitude: unknown;
  latitude: unknown;
  builtYear: unknown;
  householdCount: unknown;
  areaMin: unknown;
  areaMax: unknown;
  averagePrice: unknown;
  monthlyRentAvg: unknown;
  dealCount: unknown;
  priceYear: number | null;
  priceMonth: number | null;
}

function validateAndMapRows(rawRows: RawCandidateRow[]): CandidateRow[] {
  return rawRows
    .filter((r) => {
      const id = Number(r.id);
      const lon = Number(r.longitude);
      const lat = Number(r.latitude);
      const validId = Number.isFinite(id) && id > 0;
      const validCoord =
        Number.isFinite(lon) &&
        Number.isFinite(lat) &&
        lat >= -90 &&
        lat <= 90 &&
        lon >= -180 &&
        lon <= 180;
      if (!validId || !validCoord) {
        console.error(
          JSON.stringify({
            event: 'recommend_invalid_row',
            rawId: r.id,
            rawLon: r.longitude,
            rawLat: r.latitude,
            reason: !validId ? 'invalid_id' : 'invalid_coord',
          }),
        );
        return false;
      }
      return true;
    })
    .map((r) => ({
      id: Number(r.id),
      aptCode: r.aptCode,
      aptName: r.aptName,
      address: r.address,
      regionCode: r.regionCode,
      longitude: Number(r.longitude),
      latitude: Number(r.latitude),
      builtYear: safeNum(r.builtYear),
      householdCount: safeNum(r.householdCount),
      areaMin: safeNum(r.areaMin),
      areaMax: safeNum(r.areaMax),
      averagePrice: safeNum(r.averagePrice),
      monthlyRentAvg: safeNum(r.monthlyRentAvg),
      dealCount: safeNum(r.dealCount),
      priceYear: r.priceYear === null ? null : Number(r.priceYear),
      priceMonth: r.priceMonth === null ? null : Number(r.priceMonth),
    }));
}

// --- Main query ---

/**
 * Fetch candidate apartments within budget using CTE-based query.
 * Filters by trade type, max price, desired area, and recent transaction data.
 */
export async function fetchCandidateApartments(
  input: FetchCandidatesInput,
): Promise<CandidateRow[]> {
  const { tradeType, maxPrice, desiredAreas } = input;
  const candidateLimit = input.candidateLimit ?? DEFAULT_CANDIDATE_LIMIT;

  const now = new Date();
  const minDate = new Date(now.getFullYear(), now.getMonth() - LOOKBACK_MONTHS, 1);
  const minYearMonth = minDate.getFullYear() * 100 + (minDate.getMonth() + 1);

  const areaFilterSql = buildAreaFilterSql(desiredAreas);

  const rawRows = (await db.execute(sql`
    WITH latest_month AS (
      SELECT apt_id,
        MAX(year * 100 + month) as ym
      FROM apartment_prices
      WHERE trade_type = ${tradeType}
        AND (year * 100 + month) >= ${minYearMonth}
      GROUP BY apt_id
    ),
    latest_agg AS (
      SELECT
        p.apt_id,
        AVG(p.price::numeric) as average_price,
        AVG(p.monthly_rent::numeric) FILTER (WHERE p.monthly_rent IS NOT NULL) as monthly_rent_avg,
        COUNT(*) as deal_count,
        MAX(p.year) as price_year,
        MAX(p.month) as price_month
      FROM apartment_prices p
      INNER JOIN latest_month lm
        ON p.apt_id = lm.apt_id
        AND (p.year * 100 + p.month) = lm.ym
      WHERE p.trade_type = ${tradeType}
      GROUP BY p.apt_id
      HAVING AVG(p.price::numeric) <= ${maxPrice}
    )
    SELECT
      a.id,
      a.apt_code AS "aptCode",
      a.apt_name AS "aptName",
      a.address AS "address",
      a.region_code AS "regionCode",
      ST_X(a.location::geometry) AS "longitude",
      ST_Y(a.location::geometry) AS "latitude",
      a.built_year AS "builtYear",
      a.household_count AS "householdCount",
      a.area_min AS "areaMin",
      a.area_max AS "areaMax",
      la.average_price AS "averagePrice",
      la.monthly_rent_avg AS "monthlyRentAvg",
      la.deal_count AS "dealCount",
      la.price_year AS "priceYear",
      la.price_month AS "priceMonth"
    FROM apartments a
    INNER JOIN latest_agg la ON a.id = la.apt_id
    WHERE 1=1 ${areaFilterSql}
    ORDER BY la.price_year DESC, la.price_month DESC, la.average_price DESC, a.id ASC
    LIMIT ${candidateLimit}
  `)) as unknown as RawCandidateRow[];

  return validateAndMapRows(rawRows);
}
