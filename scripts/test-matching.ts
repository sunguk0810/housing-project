/**
 * Dry-run: compare old vs new matching logic for 강남구
 * Fetches K-apt list and tests against unmatched apartments.
 */
import { db } from "@/db/connection";
import { sql } from "drizzle-orm";

function normalizeAptName(name: string): string {
  return name
    .normalize("NFC")
    .replace(/아파트$/g, "")
    .replace(/\s+/g, "")
    .replace(/[()（）\-·]/g, "")
    .toLowerCase();
}

function extractOrdinal(name: string): string | null {
  const m = name.match(/(\d+)\s*(차|단지)/);
  return m ? `${m[1]}${m[2]}` : null;
}

type KaptEntry = { kaptCode: string; kaptName: string; dong: string };

function matchKapt(
  aptName: string,
  aptDong: string,
  kaptList: KaptEntry[],
): KaptEntry | undefined {
  const normApt = normalizeAptName(aptName);
  if (!normApt) return undefined;

  const sameDong: KaptEntry[] = aptDong
    ? kaptList.filter((k) => k.dong === aptDong)
    : [];
  const pools: KaptEntry[][] = sameDong.length > 0 ? [sameDong, kaptList] : [kaptList];
  const aptOrd = extractOrdinal(aptName);

  for (const pool of pools) {
    const exact = pool.find((k) => normalizeAptName(k.kaptName) === normApt);
    if (exact) return exact;

    const incl = pool.find((k) => {
      const normKapt = normalizeAptName(k.kaptName);
      const matches = normKapt.includes(normApt) || normApt.includes(normKapt);
      if (!matches) return false;
      const kOrd = extractOrdinal(k.kaptName);
      if (aptOrd && kOrd && aptOrd !== kOrd) return false;
      return true;
    });
    if (incl) return incl;

    if (pool === sameDong) {
      const aptTokens: string[] = normApt.match(/.{2}/g) ?? [];
      if (aptTokens.length < 2) continue;
      let bestScore = 0;
      let bestMatch: KaptEntry | undefined;

      for (const k of pool) {
        const kOrd = extractOrdinal(k.kaptName);
        if (aptOrd && kOrd && aptOrd !== kOrd) continue;
        const kTokens: string[] = normalizeAptName(k.kaptName).match(/.{2}/g) ?? [];
        if (kTokens.length < 2) continue;
        const overlap = aptTokens.filter((t) => kTokens.includes(t)).length;
        const shorter = Math.min(aptTokens.length, kTokens.length);
        const score = shorter > 0 ? overlap / shorter : 0;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = k;
        }
      }
      if (bestScore >= 0.7 && bestMatch) return bestMatch;
    }
  }
  return undefined;
}

async function main() {
  const serviceKey = process.env.MOLIT_API_KEY;
  if (!serviceKey) {
    console.error("MOLIT_API_KEY not set");
    process.exit(1);
  }

  // Fetch K-apt list for 강남구
  const encodedKey = encodeURIComponent(serviceKey);
  const kaptList: KaptEntry[] = [];
  let page = 1;

  while (true) {
    const url = `https://apis.data.go.kr/1613000/AptListService3/getSigunguAptList3?serviceKey=${encodedKey}&sigunguCode=11680&pageNo=${page}&numOfRows=1000`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    const json = (await res.json()) as {
      response?: { body?: { items?: Array<{ kaptCode?: string; kaptName?: string; as3?: string }>; totalCount?: number } };
    };
    const items = json.response?.body?.items ?? [];
    for (const item of items) {
      if (item.kaptCode && item.kaptName) {
        kaptList.push({
          kaptCode: item.kaptCode,
          kaptName: item.kaptName.normalize("NFC"),
          dong: (item.as3 ?? "").normalize("NFC"),
        });
      }
    }
    const total = json.response?.body?.totalCount ?? 0;
    if (items.length < 1000 || kaptList.length >= total) break;
    page++;
  }

  console.log(`K-apt list: ${kaptList.length} entries`);

  // Get unmatched apartments (no apartment_details row)
  const unmatched = await db.execute(sql`
    SELECT a.id, a.apt_code, a.apt_name, a.address
    FROM apartments a
    LEFT JOIN apartment_details ad ON ad.apt_id = a.id
    WHERE a.region_code = '11680' AND ad.apt_id IS NULL
    ORDER BY a.apt_name
  `);

  const rows = unmatched as unknown as Array<{
    id: number;
    apt_code: string;
    apt_name: string;
    address: string;
  }>;

  console.log(`\nUnmatched apartments: ${rows.length}`);
  console.log("---");

  let newMatches = 0;
  const stillUnmatched: string[] = [];

  for (const row of rows) {
    const aptName = (row.apt_name ?? "").normalize("NFC");
    // DB address: "강남구 역삼동 722" → dong is 2nd token (1st is gu name)
    const addrParts = (row.address ?? "").split(/\s+/);
    const dong = addrParts.find((p: string) => p.endsWith("동")) || "";
    const match = matchKapt(aptName, dong, kaptList);

    if (match) {
      newMatches++;
      console.log(`  MATCH: "${aptName}" (${dong}) → "${match.kaptName}" (${match.dong}) [${match.kaptCode}]`);
    } else {
      stillUnmatched.push(`${aptName} (${dong})`);
    }
  }

  console.log(`\n=== Results ===`);
  console.log(`New matches: ${newMatches}`);
  console.log(`Still unmatched: ${stillUnmatched.length}`);

  if (stillUnmatched.length > 0) {
    console.log(`\nUnmatched list:`);
    for (const u of stillUnmatched) {
      console.log(`  - ${u}`);
    }
  }

  process.exit(0);
}

main();
