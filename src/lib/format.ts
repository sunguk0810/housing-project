/**
 * Formatting utilities for Korean locale display.
 * Source of Truth: M3 spec Section 5
 */

/**
 * Format amount in 만원 to Korean-style display.
 * e.g., 50000 -> "5억", 15000 -> "1억 5,000만"
 */
export function formatAmount(manwon: number): string {
  if (manwon <= 0) return "0만원";

  const eok = Math.floor(manwon / 10000);
  const remainder = manwon % 10000;

  if (eok > 0 && remainder > 0) {
    return `${eok}억 ${remainder.toLocaleString("ko-KR")}만원`;
  }
  if (eok > 0) {
    return `${eok}억원`;
  }
  return `${manwon.toLocaleString("ko-KR")}만원`;
}

/**
 * Format date string for display.
 * "2026-01" -> "2026년 1월"
 */
export function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === "N/A") return "정보 없음";
  const parts = dateStr.split("-");
  if (parts.length >= 2) {
    return `${parts[0]}년 ${Number(parts[1])}월`;
  }
  return dateStr;
}

/**
 * Format price in 만원 without unit suffix.
 * e.g., 32000 -> "3억 2,000만", 50000 -> "5억"
 */
export function formatPrice(manwon: number): string {
  if (manwon <= 0) return "0";
  const eok = Math.floor(manwon / 10000);
  const remainder = manwon % 10000;
  if (eok > 0 && remainder > 0) return `${eok}억 ${remainder.toLocaleString("ko-KR")}만`;
  if (eok > 0) return `${eok}억`;
  return `${manwon.toLocaleString("ko-KR")}만`;
}

export function formatTradeTypeLabel(tradeType: "sale" | "jeonse" | "monthly"): string {
  if (tradeType === "jeonse") return "전세";
  if (tradeType === "monthly") return "월세";
  return "매매";
}

/**
 * Format commute time in minutes.
 */
export function formatCommuteTime(minutes: number): string {
  if (minutes < 60) return `${minutes}분`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}시간`;
  return `${hours}시간 ${mins}분`;
}

/**
 * Shorten Korean address for compact display.
 * "서울특별시 마포구 합정동 65" → "서울 마포구 합정동"
 * "서울특별시 양천구 신정동 225" → "서울 양천구 신정동"
 */
export function formatShortAddress(address: string): string {
  const CITY_SHORT: Record<string, string> = {
    서울특별시: "서울",
    부산광역시: "부산",
    대구광역시: "대구",
    인천광역시: "인천",
    광주광역시: "광주",
    대전광역시: "대전",
    울산광역시: "울산",
    세종특별자치시: "세종",
    경기도: "경기",
  };
  const parts = address.split(" ");
  if (parts.length >= 3) {
    const city = CITY_SHORT[parts[0]] ?? parts[0];
    // Return: city + gu + dong (drop building number)
    return `${city} ${parts[1]} ${parts[2]}`;
  }
  return address;
}
