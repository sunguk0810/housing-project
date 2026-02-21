/**
 * Shared address parsing and name normalization utilities for ETL adapters.
 */

/**
 * Parse jibun address into structured components.
 * Input: "서울특별시 강남구 역삼동 720-25" → { dong: "역삼동", bun: "0720", ji: "0025", platGbCd: "0" }
 * Input: "... 산12-3" → platGbCd: "1"
 */
export function parseJibunFromAddress(address: string): {
  dong: string;
  bun: string;
  ji: string;
  platGbCd: "0" | "1";
} | null {
  const parts = address.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const jibunRaw = parts[parts.length - 1] ?? "";
  const dong = parts[parts.length - 2] ?? "";
  if (!dong || !jibunRaw) return null;

  let platGbCd: "0" | "1" = "0";
  let jibun = jibunRaw;
  if (jibun.startsWith("산")) {
    platGbCd = "1";
    jibun = jibun.slice(1);
  }

  const [bunPart, jiPart] = jibun.split("-");
  if (!bunPart || !/^\d+$/.test(bunPart)) return null;
  const bun = bunPart.padStart(4, "0").slice(0, 4);
  const ji = (jiPart && /^\d+$/.test(jiPart) ? jiPart : "0")
    .padStart(4, "0")
    .slice(0, 4);

  return { dong, bun, ji, platGbCd };
}

/**
 * Normalize a building name for fuzzy matching.
 *
 * Steps:
 *   1. Strip leading non-alphanumeric/non-hangul chars: `]논현아파트` → `논현아파트`
 *   2. Strip trailing dong suffix: `은마아파트 제17동` → `은마아파트`
 *   3. NFC normalize + remove spaces/parentheses + lowercase
 */
export function normalizeName(name: string): string {
  let s = name.normalize("NFC");

  // 1. Strip leading special characters (keep hangul, latin, digits)
  s = s.replace(/^[^가-힣a-zA-Z0-9]*/, "");

  // 2. Strip trailing dong suffix: "제17동", "101동", " 제 17 동" etc.
  s = s.replace(/\s*(제?\s*\d+\s*동?\s*)$/, "");

  // 3. Remove spaces, parentheses, lowercase
  s = s.replace(/[\s()（）]/g, "").toLowerCase();

  return s;
}
