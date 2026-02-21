import type { InferInsertModel } from 'drizzle-orm';
import { commuteDestinations, commuteGrid, commuteTimes } from '../schema/commute';
import { createRng, randomNormal, clamp, BUSINESS_DISTRICTS } from './constants';

type CommuteGridInsert = InferInsertModel<typeof commuteGrid>;
type CommuteDestinationInsert = InferInsertModel<typeof commuteDestinations>;
type CommuteTimeInsert = InferInsertModel<typeof commuteTimes>;

// Haversine distance in km
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

export function generateCommuteSeedData(): {
  destinations: CommuteDestinationInsert[];
  gridPoints: CommuteGridInsert[];
  times: CommuteTimeInsert[];
} {
  const rng = createRng(47);

  const destinations: CommuteDestinationInsert[] = Object.entries(BUSINESS_DISTRICTS).map(
    ([destinationKey, d]) => ({
      destinationKey,
      name: d.name,
      location: { longitude: d.lng, latitude: d.lat },
      active: true,
    }),
  );

  const gridPoints: CommuteGridInsert[] = [];
  const times: CommuteTimeInsert[] = [];

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
      const gridId = `GRID-${String(r).padStart(2, '0')}-${String(c).padStart(2, '0')}`;

      gridPoints.push({
        gridId,
        location: { longitude: lng, latitude: lat },
      });

      for (const [destinationKey, d] of Object.entries(BUSINESS_DISTRICTS)) {
        times.push({
          gridId,
          destinationKey,
          timeMinutes: commuteTime(rng, lat, lng, d.lat, d.lng),
        });
      }
    }
  }

  return { destinations, gridPoints, times };
}
