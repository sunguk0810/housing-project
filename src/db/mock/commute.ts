import type { InferInsertModel } from "drizzle-orm";
import { commuteGrid } from "../schema/commute";
import {
  createRng,
  randomNormal,
  clamp,
  BUSINESS_DISTRICTS,
} from "./constants";

type CommuteInsert = InferInsertModel<typeof commuteGrid>;

// Haversine distance in km
function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function commuteTime(
  rng: () => number,
  gridLat: number,
  gridLng: number,
  destLat: number,
  destLng: number,
): number {
  const dist = haversine(gridLat, gridLng, destLat, destLng);
  const baseTime = 15;
  const distanceFactor = 3.0;
  const noise = randomNormal(rng, 0, 5);
  return Math.round(clamp(baseTime + distanceFactor * dist + noise, 20, 90));
}

export function generateCommute(): CommuteInsert[] {
  const rng = createRng(47);
  const result: CommuteInsert[] = [];

  // 10x10 grid over Seoul area
  const latMin = 37.42;
  const latMax = 37.68;
  const lngMin = 126.82;
  const lngMax = 127.18;
  const rows = 10;
  const cols = 10;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lat = latMin + ((latMax - latMin) / (rows - 1)) * r;
      const lng = lngMin + ((lngMax - lngMin) / (cols - 1)) * c;

      result.push({
        gridId: `GRID-${String(r).padStart(2, "0")}-${String(c).padStart(2, "0")}`,
        location: { longitude: lng, latitude: lat },
        toGbdTime: commuteTime(
          rng,
          lat,
          lng,
          BUSINESS_DISTRICTS.GBD.lat,
          BUSINESS_DISTRICTS.GBD.lng,
        ),
        toYbdTime: commuteTime(
          rng,
          lat,
          lng,
          BUSINESS_DISTRICTS.YBD.lat,
          BUSINESS_DISTRICTS.YBD.lng,
        ),
        toCbdTime: commuteTime(
          rng,
          lat,
          lng,
          BUSINESS_DISTRICTS.CBD.lat,
          BUSINESS_DISTRICTS.CBD.lng,
        ),
        toPangyoTime: commuteTime(
          rng,
          lat,
          lng,
          BUSINESS_DISTRICTS.PANGYO.lat,
          BUSINESS_DISTRICTS.PANGYO.lng,
        ),
      });
    }
  }

  return result;
}
