/**
 * Session data loader for /complex/[id] detail page.
 * Merges formData (job info) and results (scores, commute times) from sessionStorage.
 * Each field is independently nullable for graceful degradation.
 */

import { SESSION_KEYS } from "@/lib/constants";

export interface DetailSessionData {
  readonly dimensions: {
    readonly budget: number;
    readonly commute: number;
    readonly childcare: number;
    readonly safety: number;
    readonly school: number;
    readonly complexScale: number;
  } | null;
  readonly finalScore: number;
  readonly commuteTime1: number | null;
  readonly commuteTime2: number | null;
  readonly job1: string | null;
  readonly job2: string | null;
  readonly job1Remote: boolean;
  readonly job2Remote: boolean;
  /** Apartment coordinates (from recommendation item) */
  readonly aptLat: number | null;
  readonly aptLng: number | null;
  /** Job 1 geocoded coordinates (from response meta) */
  readonly job1Lat: number | null;
  readonly job1Lng: number | null;
  /** Job 2 geocoded coordinates (from response meta) */
  readonly job2Lat: number | null;
  readonly job2Lng: number | null;
}

const EMPTY_SESSION: DetailSessionData = {
  dimensions: null,
  finalScore: 0,
  commuteTime1: null,
  commuteTime2: null,
  job1: null,
  job2: null,
  job1Remote: false,
  job2Remote: false,
  aptLat: null,
  aptLng: null,
  job1Lat: null,
  job1Lng: null,
  job2Lat: null,
  job2Lng: null,
};

interface DimensionsShape {
  budget: number;
  commute: number;
  childcare: number;
  safety: number;
  school: number;
  complexScale: number;
}

function isValidDimensions(v: unknown): v is DimensionsShape {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj.budget === "number" &&
    typeof obj.commute === "number" &&
    typeof obj.childcare === "number" &&
    typeof obj.safety === "number" &&
    typeof obj.school === "number" &&
    typeof obj.complexScale === "number"
  );
}

interface RecommendationMatch {
  dimensions: DimensionsShape;
  finalScore: number;
  commuteTime1: number;
  commuteTime2: number | null;
  aptLat: number | null;
  aptLng: number | null;
}

interface JobCoordinates {
  job1Lat: number | null;
  job1Lng: number | null;
  job2Lat: number | null;
  job2Lng: number | null;
}

function extractFromResults(aptId: number): RecommendationMatch | null {
  try {
    const stored = sessionStorage.getItem(SESSION_KEYS.results);
    if (!stored) return null;

    const raw: unknown = JSON.parse(stored);
    if (!raw || typeof raw !== "object") return null;
    if (!("recommendations" in raw)) return null;

    const recs = (raw as Record<string, unknown>).recommendations;
    if (!Array.isArray(recs)) return null;

    const match = recs.find(
      (r: unknown) =>
        r && typeof r === "object" && "aptId" in r && (r as Record<string, unknown>).aptId === aptId
    ) as Record<string, unknown> | undefined;

    if (!match) return null;

    const dims = match.dimensions;
    if (!isValidDimensions(dims)) return null;

    return {
      dimensions: dims,
      finalScore: typeof match.finalScore === "number" ? match.finalScore : 0,
      commuteTime1: typeof match.commuteTime1 === "number" ? match.commuteTime1 : 0,
      commuteTime2: typeof match.commuteTime2 === "number" ? match.commuteTime2 : null,
      aptLat: typeof match.lat === "number" ? match.lat : null,
      aptLng: typeof match.lng === "number" ? match.lng : null,
    };
  } catch {
    return null;
  }
}

function extractJobCoordinates(): JobCoordinates {
  const fallback: JobCoordinates = { job1Lat: null, job1Lng: null, job2Lat: null, job2Lng: null };
  try {
    const stored = sessionStorage.getItem(SESSION_KEYS.results);
    if (!stored) return fallback;

    const raw: unknown = JSON.parse(stored);
    if (!raw || typeof raw !== "object") return fallback;
    if (!("meta" in raw)) return fallback;

    const meta = (raw as Record<string, unknown>).meta;
    if (!meta || typeof meta !== "object") return fallback;

    const m = meta as Record<string, unknown>;
    const j1 = m.job1Coord as Record<string, unknown> | undefined;
    const j2 = m.job2Coord as Record<string, unknown> | undefined;

    return {
      job1Lat: j1 && typeof j1.lat === "number" ? j1.lat : null,
      job1Lng: j1 && typeof j1.lng === "number" ? j1.lng : null,
      job2Lat: j2 && typeof j2.lat === "number" ? j2.lat : null,
      job2Lng: j2 && typeof j2.lng === "number" ? j2.lng : null,
    };
  } catch {
    return fallback;
  }
}

interface FormDataMatch {
  job1: string | null;
  job2: string | null;
  job1Remote: boolean;
  job2Remote: boolean;
}

function extractFromFormData(): FormDataMatch {
  const fallback: FormDataMatch = { job1: null, job2: null, job1Remote: false, job2Remote: false };
  try {
    const stored = sessionStorage.getItem(SESSION_KEYS.formData);
    if (!stored) return fallback;

    const raw: unknown = JSON.parse(stored);
    if (!raw || typeof raw !== "object") return fallback;

    // v2 schema: { schemaVersion: 2, data: { ... } }
    let data: unknown = raw;
    if ("schemaVersion" in raw && "data" in raw) {
      data = (raw as Record<string, unknown>).data;
    }
    if (!data || typeof data !== "object") return fallback;

    const obj = data as Record<string, unknown>;
    return {
      job1: typeof obj.job1 === "string" && obj.job1.length > 0 ? obj.job1 : null,
      job2: typeof obj.job2 === "string" && obj.job2.length > 0 ? obj.job2 : null,
      job1Remote: typeof obj.job1Remote === "boolean" ? obj.job1Remote : false,
      job2Remote: typeof obj.job2Remote === "boolean" ? obj.job2Remote : false,
    };
  } catch {
    return fallback;
  }
}

/**
 * Read and merge session data for a specific apartment.
 * Returns partial data when some sources are unavailable.
 */
export function readDetailSession(aptId: number): DetailSessionData {
  if (typeof window === "undefined") return EMPTY_SESSION;

  const results = extractFromResults(aptId);
  const formData = extractFromFormData();
  const jobCoords = extractJobCoordinates();

  return {
    dimensions: results?.dimensions ?? null,
    finalScore: results?.finalScore ?? 0,
    commuteTime1: results?.commuteTime1 ?? null,
    commuteTime2: results?.commuteTime2 ?? null,
    job1: formData.job1,
    job2: formData.job2,
    job1Remote: formData.job1Remote,
    job2Remote: formData.job2Remote,
    aptLat: results?.aptLat ?? null,
    aptLng: results?.aptLng ?? null,
    job1Lat: jobCoords.job1Lat,
    job1Lng: jobCoords.job1Lng,
    job2Lat: jobCoords.job2Lat,
    job2Lng: jobCoords.job2Lng,
  };
}
