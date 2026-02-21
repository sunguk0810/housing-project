/**
 * Test coordinate-based matching for unmatched 강남구 apartments.
 * Simulates Pass 2 of the enrichment flow.
 */
import { db } from "@/db/connection";
import { sql } from "drizzle-orm";
import { geocodeAddress } from "@/etl/adapters/kakao-geocoding";

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function str(val: unknown): string | null {
  if (val === null || val === undefined || val === "") return null;
  return String(val).trim() || null;
}

function parseKaptResponseItem(json: unknown): Record<string, unknown> {
  const body = json as Record<string, unknown>;
  const bodyObj =
    ((body.response as Record<string, unknown>)?.body as Record<string, unknown>) ??
    (body.body as Record<string, unknown>) ??
    body;
  return (bodyObj.item as Record<string, unknown>) ?? bodyObj;
}

async function main() {
  const serviceKey = process.env.MOLIT_API_KEY;
  if (!serviceKey) { console.error("MOLIT_API_KEY not set"); process.exit(1); }
  const encodedKey = encodeURIComponent(serviceKey);

  // 1. Get unmatched MOLIT apartments with coordinates
  const unmatchedApts = (await db.execute(sql`
    SELECT a.id, a.apt_name, a.address,
           ST_X(a.location::geometry) as lng, ST_Y(a.location::geometry) as lat
    FROM apartments a
    LEFT JOIN apartment_details ad ON ad.apt_id = a.id
    WHERE a.region_code = '11680' AND ad.apt_id IS NULL
  `)) as unknown as Array<{
    id: number; apt_name: string; address: string; lng: number; lat: number;
  }>;

  console.log(`Unmatched MOLIT apartments: ${unmatchedApts.length}`);

  // 2. Get already matched kaptCodes
  const existingKapt = (await db.execute(sql`
    SELECT kapt_code FROM apartment_details
    WHERE apt_id IN (SELECT id FROM apartments WHERE region_code = '11680')
  `)) as unknown as Array<{ kapt_code: string }>;
  const matchedKaptCodes = new Set(existingKapt.map((r) => r.kapt_code));

  // 3. Fetch K-apt list
  type KaptEntry = { kaptCode: string; kaptName: string };
  const kaptList: KaptEntry[] = [];
  let page = 1;
  while (true) {
    const url = `https://apis.data.go.kr/1613000/AptListService3/getSigunguAptList3?serviceKey=${encodedKey}&sigunguCode=11680&pageNo=${page}&numOfRows=1000`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    const json = (await res.json()) as {
      response?: { body?: { items?: Array<{ kaptCode?: string; kaptName?: string }>; totalCount?: number } };
    };
    const items = json.response?.body?.items ?? [];
    for (const item of items) {
      if (item.kaptCode && item.kaptName) {
        kaptList.push({ kaptCode: item.kaptCode, kaptName: item.kaptName });
      }
    }
    if (items.length < 1000 || kaptList.length >= (json.response?.body?.totalCount ?? 0)) break;
    page++;
  }

  // Filter out already matched
  const unmatchedKapt = kaptList.filter((k) => !matchedKaptCodes.has(k.kaptCode));
  console.log(`Unmatched K-apt entries to geocode: ${unmatchedKapt.length}`);

  // 4. Fetch basic info → doroJuso → geocode for unmatched K-apt
  const kaptCoords: Array<{ kaptCode: string; kaptName: string; lat: number; lng: number }> = [];
  let progress = 0;

  for (const k of unmatchedKapt) {
    progress++;
    if (progress % 20 === 0) {
      console.log(`  geocoding ${progress}/${unmatchedKapt.length}...`);
    }

    try {
      // Rate limit: simple delay
      await new Promise((r) => setTimeout(r, 200));
      const basicUrl = `https://apis.data.go.kr/1613000/AptBasisInfoServiceV4/getAphusBassInfoV4?ServiceKey=${encodedKey}&kaptCode=${k.kaptCode}`;
      const basicRes = await fetch(basicUrl, { signal: AbortSignal.timeout(10_000) });
      if (!basicRes.ok) continue;
      const b = parseKaptResponseItem(await basicRes.json());
      const doroJuso = str(b.doroJuso);
      if (!doroJuso) continue;

      const geo = await geocodeAddress(doroJuso, true);
      if (!geo) continue;

      kaptCoords.push({
        kaptCode: k.kaptCode,
        kaptName: k.kaptName,
        lat: geo.coordinate.lat,
        lng: geo.coordinate.lng,
      });
    } catch {
      // skip
    }
  }

  console.log(`\nGeocoded K-apt entries: ${kaptCoords.length}`);

  // 5. Match by proximity
  const usedKapt = new Set<string>();
  let coordMatched = 0;
  const results: Array<{ aptName: string; kaptName: string; dist: number }> = [];
  const stillUnmatched: string[] = [];

  function normalizeAptName(name: string): string {
    return name.normalize("NFC").replace(/아파트$/g, "").replace(/\s+/g, "")
      .replace(/[()（）\-·]/g, "").toLowerCase();
  }

  for (const apt of unmatchedApts) {
    let bestDist = Infinity;
    let bestKapt: (typeof kaptCoords)[0] | null = null;

    for (const kc of kaptCoords) {
      if (usedKapt.has(kc.kaptCode)) continue;
      const dist = haversineMeters(Number(apt.lat), Number(apt.lng), kc.lat, kc.lng);
      if (dist < bestDist) {
        bestDist = dist;
        bestKapt = kc;
      }
    }

    if (!bestKapt || bestDist > 100) {
      stillUnmatched.push(`${apt.apt_name} (${apt.address}) → nearest: ${Math.round(bestDist)}m`);
      continue;
    }

    // < 30m: accept unconditionally
    // 30-100m: require at least 1 bigram overlap
    if (bestDist >= 30) {
      const aptBigrams: string[] = normalizeAptName(apt.apt_name).match(/.{2}/g) ?? [];
      const kaptBigrams: string[] = normalizeAptName(bestKapt.kaptName).match(/.{2}/g) ?? [];
      const overlap = aptBigrams.filter((t: string) => kaptBigrams.includes(t)).length;
      if (overlap === 0) {
        stillUnmatched.push(`${apt.apt_name} → "${bestKapt.kaptName}" (${Math.round(bestDist)}m, NO name overlap → REJECTED)`);
        continue;
      }
    }

    usedKapt.add(bestKapt.kaptCode);
    coordMatched++;
    results.push({
      aptName: apt.apt_name,
      kaptName: bestKapt.kaptName,
      dist: Math.round(bestDist),
    });
  }

  console.log(`\n=== Coordinate Matching Results ===`);
  console.log(`Matched: ${coordMatched}`);
  console.log(`Still unmatched: ${stillUnmatched.length}`);

  console.log(`\nMatches:`);
  for (const r of results) {
    console.log(`  "${r.aptName}" → "${r.kaptName}" (${r.dist}m)`);
  }

  console.log(`\nUnmatched:`);
  for (const u of stillUnmatched) {
    console.log(`  - ${u}`);
  }

  process.exit(0);
}

main();
