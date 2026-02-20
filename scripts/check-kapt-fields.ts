/**
 * Check what fields the K-apt list API actually returns
 * so we can find better matching strategies beyond name-only.
 */

async function main() {
  const serviceKey = process.env.MOLIT_API_KEY;
  if (!serviceKey) {
    console.error("MOLIT_API_KEY not set");
    process.exit(1);
  }

  const encodedKey = encodeURIComponent(serviceKey);
  // Fetch K-apt list for 강남구 (11680), just page 1 with 5 rows
  const url = `https://apis.data.go.kr/1613000/AptListService3/getSigunguAptList3?serviceKey=${encodedKey}&sigunguCode=11680&pageNo=1&numOfRows=5`;

  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  const json = await res.json();

  // Print full response to see all available fields
  console.log("=== K-apt List API full response ===");
  console.log(JSON.stringify(json, null, 2));

  process.exit(0);
}

main();
