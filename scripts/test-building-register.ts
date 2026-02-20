/**
 * Test building register API (건축물대장 기본개요)
 * and verify K-apt list bjdCode field.
 */

async function main() {
  const serviceKey = process.env.MOLIT_API_KEY;
  if (!serviceKey) { console.error("MOLIT_API_KEY not set"); process.exit(1); }
  const encodedKey = encodeURIComponent(serviceKey);

  // ─── Test 1: K-apt list bjdCode field ───
  console.log("=== Test 1: K-apt list bjdCode field ===");
  const kaptUrl = `https://apis.data.go.kr/1613000/AptListService3/getSigunguAptList3?serviceKey=${encodedKey}&sigunguCode=11680&pageNo=1&numOfRows=3`;
  const kaptRes = await fetch(kaptUrl, { signal: AbortSignal.timeout(15_000) });
  const kaptJson = await kaptRes.json();
  console.log(JSON.stringify(kaptJson, null, 2));
  // Extract bjdCode from first item
  const items = (kaptJson as Record<string, unknown>)?.response
    ? ((kaptJson as Record<string, unknown>).response as Record<string, unknown>)?.body
      ? (((kaptJson as Record<string, unknown>).response as Record<string, unknown>).body as Record<string, unknown>)?.items
      : null
    : null;
  if (Array.isArray(items) && items[0]) {
    const bjdCode = (items[0] as Record<string, unknown>).bjdCode as string;
    console.log(`\nbjdCode sample: "${bjdCode}" (length: ${bjdCode?.length})`);
    console.log(`sigunguCd: "${bjdCode?.substring(0, 5)}", bjdongCd: "${bjdCode?.substring(5, 10)}"`);
  }

  // ─── Test 2: Building Register API (건축물대장 기본개요) ───
  console.log("\n=== Test 2: Building Register API (역삼동 722) ===");
  // 역삼동 bjdCode from K-apt: 1168010100 → sigunguCd=11680, bjdongCd=10100
  // But let's derive it from K-apt list first
  // For now, use known code: 역삼동 = bjdCode 1168010100
  const sigunguCd = "11680";
  const bjdongCd = "10100"; // 역삼동
  const bun = "0722";
  const ji = "0000";

  // Try both http and https, and different parameter casing
  for (const scheme of ["https", "http"]) {
    const bldgUrl = `${scheme}://apis.data.go.kr/1613000/BldRgstService_v2/getBrExposInfo?ServiceKey=${encodedKey}&sigunguCd=${sigunguCd}&bjdongCd=${bjdongCd}&bun=${bun}&ji=${ji}&_type=json&numOfRows=10`;
    console.log(`\nTrying ${scheme}://...`);
    try {
      const bldgRes = await fetch(bldgUrl, { signal: AbortSignal.timeout(15_000) });
      console.log(`Status: ${bldgRes.status}`);
      const text = await bldgRes.text();
      console.log(`Response (first 500 chars): ${text.substring(0, 500)}`);
      if (text.startsWith("{") || text.startsWith("<")) {
        try {
          const json = JSON.parse(text);
          console.log("\nParsed JSON:");
          console.log(JSON.stringify(json, null, 2));
        } catch {
          console.log("(Not valid JSON, might be XML)");
        }
      }
      if (bldgRes.ok && text.startsWith("{")) break;
    } catch (err: unknown) {
      console.log(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // ─── Test 3: 삼성동 16-2 (힐스테이트1단지) ───
  console.log("\n=== Test 3: Building Register (삼성동 16-2) ===");
  const bjdongCd2 = "10500";
  const bldgUrl2 = `https://apis.data.go.kr/1613000/BldRgstService_v2/getBrExposInfo?ServiceKey=${encodedKey}&sigunguCd=${sigunguCd}&bjdongCd=${bjdongCd2}&bun=0016&ji=0002&_type=json&numOfRows=10`;
  try {
    const bldgRes2 = await fetch(bldgUrl2, { signal: AbortSignal.timeout(15_000) });
    const text2 = await bldgRes2.text();
    try {
      console.log(JSON.stringify(JSON.parse(text2), null, 2));
    } catch {
      console.log(`Raw (first 500): ${text2.substring(0, 500)}`);
    }
  } catch (err: unknown) {
    console.log(`Error: ${err instanceof Error ? err.message : String(err)}`);
  }

  process.exit(0);
}

main();
