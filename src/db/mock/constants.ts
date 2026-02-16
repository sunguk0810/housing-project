// Deterministic pseudo-random number generator (mulberry32)
// Fixed seed for reproducible mock data generation
export function createRng(seed: number): () => number {
  return function (): number {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// PRNG helper functions
export function randomInt(
  rng: () => number,
  min: number,
  max: number,
): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function randomFloat(
  rng: () => number,
  min: number,
  max: number,
  decimals = 2,
): number {
  const val = rng() * (max - min) + min;
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

export function randomPick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// Box-Muller transform for normal distribution
export function randomNormal(
  rng: () => number,
  mean: number,
  std: number,
): number {
  const u1 = rng();
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1 || 0.0001)) * Math.cos(2 * Math.PI * u2);
  return mean + std * z;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Seoul 25 districts
export const SEOUL_DISTRICTS = [
  { code: "11110", name: "종로구", lat: 37.5735, lng: 126.979 },
  { code: "11140", name: "중구", lat: 37.5641, lng: 126.9979 },
  { code: "11170", name: "용산구", lat: 37.5326, lng: 126.9909 },
  { code: "11200", name: "성동구", lat: 37.5634, lng: 127.0369 },
  { code: "11215", name: "광진구", lat: 37.5385, lng: 127.0823 },
  { code: "11230", name: "동대문구", lat: 37.5744, lng: 127.0397 },
  { code: "11260", name: "중랑구", lat: 37.6063, lng: 127.0928 },
  { code: "11290", name: "성북구", lat: 37.5894, lng: 127.0167 },
  { code: "11305", name: "강북구", lat: 37.6397, lng: 127.0254 },
  { code: "11320", name: "도봉구", lat: 37.6688, lng: 127.0471 },
  { code: "11350", name: "노원구", lat: 37.6542, lng: 127.0568 },
  { code: "11380", name: "은평구", lat: 37.6027, lng: 126.9291 },
  { code: "11410", name: "서대문구", lat: 37.5791, lng: 126.9368 },
  { code: "11440", name: "마포구", lat: 37.5663, lng: 126.9014 },
  { code: "11470", name: "양천구", lat: 37.517, lng: 126.8665 },
  { code: "11500", name: "강서구", lat: 37.551, lng: 126.8496 },
  { code: "11530", name: "구로구", lat: 37.4954, lng: 126.8875 },
  { code: "11545", name: "금천구", lat: 37.4519, lng: 126.8968 },
  { code: "11560", name: "영등포구", lat: 37.5264, lng: 126.8963 },
  { code: "11590", name: "동작구", lat: 37.5124, lng: 126.9395 },
  { code: "11620", name: "관악구", lat: 37.4784, lng: 126.9516 },
  { code: "11650", name: "서초구", lat: 37.4837, lng: 127.0324 },
  { code: "11680", name: "강남구", lat: 37.5172, lng: 127.0473 },
  { code: "11710", name: "송파구", lat: 37.5146, lng: 127.105 },
  { code: "11740", name: "강동구", lat: 37.5301, lng: 127.1238 },
] as const;

export const APARTMENT_NAMES: Array<{
  name: string;
  district: string;
  region: "seoul" | "gyeonggi";
}> = [
  // Seoul 30
  { name: "래미안 첼리투스", district: "서초구", region: "seoul" },
  { name: "반포 자이", district: "서초구", region: "seoul" },
  { name: "아크로리버파크", district: "서초구", region: "seoul" },
  { name: "래미안 대치팰리스", district: "강남구", region: "seoul" },
  { name: "개포 주공 1단지", district: "강남구", region: "seoul" },
  { name: "도곡 렉슬", district: "강남구", region: "seoul" },
  { name: "잠실 엘스", district: "송파구", region: "seoul" },
  { name: "리센츠", district: "송파구", region: "seoul" },
  { name: "헬리오시티", district: "송파구", region: "seoul" },
  { name: "올림픽파크포레온", district: "강동구", region: "seoul" },
  { name: "래미안 목동아파트", district: "양천구", region: "seoul" },
  { name: "목동 신시가지 7단지", district: "양천구", region: "seoul" },
  { name: "마포 래미안 푸르지오", district: "마포구", region: "seoul" },
  { name: "용산 파크타워", district: "용산구", region: "seoul" },
  { name: "래미안 신반포리오센트", district: "서초구", region: "seoul" },
  { name: "은마아파트", district: "강남구", region: "seoul" },
  { name: "압구정 현대아파트", district: "강남구", region: "seoul" },
  { name: "DMC 래미안 e편한세상", district: "은평구", region: "seoul" },
  { name: "래미안 위브 (노원)", district: "노원구", region: "seoul" },
  { name: "e편한세상 금호", district: "성동구", region: "seoul" },
  { name: "왕십리 센트라스", district: "성동구", region: "seoul" },
  { name: "신도림 디큐브시티", district: "구로구", region: "seoul" },
  { name: "래미안 에스티움", district: "동작구", region: "seoul" },
  { name: "관악 드림타운", district: "관악구", region: "seoul" },
  { name: "동대문 래미안 크레시티", district: "동대문구", region: "seoul" },
  { name: "이문 아이파크 자이", district: "동대문구", region: "seoul" },
  { name: "마곡 엠밸리", district: "강서구", region: "seoul" },
  { name: "중랑 포레스트", district: "중랑구", region: "seoul" },
  { name: "마포 프레스티지 자이", district: "마포구", region: "seoul" },
  { name: "독산 롯데캐슬", district: "금천구", region: "seoul" },
  // Gyeonggi 20
  { name: "동탄 래미안", district: "화성시", region: "gyeonggi" },
  { name: "판교 알파리움", district: "성남시", region: "gyeonggi" },
  { name: "위례 래미안", district: "성남시", region: "gyeonggi" },
  { name: "광교 자이", district: "수원시", region: "gyeonggi" },
  { name: "수원 아이파크시티", district: "수원시", region: "gyeonggi" },
  { name: "일산 호수공원 자이", district: "고양시", region: "gyeonggi" },
  { name: "킨텍스 꿈에그린", district: "고양시", region: "gyeonggi" },
  { name: "미사 강변도시", district: "하남시", region: "gyeonggi" },
  { name: "하남 감일 블루밍", district: "하남시", region: "gyeonggi" },
  { name: "과천 주공 10단지", district: "과천시", region: "gyeonggi" },
  { name: "안양 래미안", district: "안양시", region: "gyeonggi" },
  { name: "의왕 포일 자이", district: "의왕시", region: "gyeonggi" },
  { name: "분당 파크뷰", district: "성남시", region: "gyeonggi" },
  { name: "김포 풍무 자이", district: "김포시", region: "gyeonggi" },
  { name: "인덕원 자이 SK뷰", district: "안양시", region: "gyeonggi" },
  { name: "별내 래미안", district: "남양주시", region: "gyeonggi" },
  { name: "구리 갈매 역세권", district: "구리시", region: "gyeonggi" },
  { name: "부천 중동 자이", district: "부천시", region: "gyeonggi" },
  { name: "평촌 래미안 에스티움", district: "안양시", region: "gyeonggi" },
  { name: "의정부 민락 자이", district: "의정부시", region: "gyeonggi" },
];

export const COORD_BOUNDS = {
  lat: { min: 37.4, max: 37.7 },
  lng: { min: 126.8, max: 127.2 },
} as const;

export const BUSINESS_DISTRICTS = {
  GBD: { lat: 37.4979, lng: 127.0276, label: "강남 업무지구" },
  YBD: { lat: 37.5219, lng: 126.9245, label: "여의도 업무지구" },
  CBD: { lat: 37.57, lng: 126.977, label: "종로 업무지구" },
  PANGYO: { lat: 37.3948, lng: 127.1112, label: "판교 테크노밸리" },
} as const;

export const PRICE_RANGES = {
  sale: {
    min: 20_000,
    max: 150_000,
    mean: 50_000,
    std: 25_000,
  },
  jeonse: {
    ratioMin: 0.5,
    ratioMax: 0.65,
  },
} as const;

export const AREA_OPTIONS = {
  minChoices: [59, 74, 84] as const,
  maxChoices: [84, 101, 114, 134] as const,
} as const;

export const CHILDCARE_NAME_PATTERNS = [
  "{dong}어린이집",
  "{dong}사랑어린이집",
  "{dong}하늘어린이집",
  "{dong}꿈나무어린이집",
  "{dong}키즈빌어린이집",
  "{dong}해맑은어린이집",
  "{dong}푸른솔어린이집",
  "{dong}햇살어린이집",
] as const;

// Dong names per district for generating realistic addresses
export const DONG_NAMES: Record<string, string[]> = {
  종로구: ["청운동", "사직동", "삼청동", "부암동", "평창동"],
  중구: ["명동", "을지로동", "회현동", "소공동", "충무로"],
  용산구: ["이태원동", "한남동", "이촌동", "청파동", "원효로"],
  성동구: ["성수동", "금호동", "옥수동", "행당동", "왕십리"],
  광진구: ["화양동", "자양동", "구의동", "광장동", "중곡동"],
  동대문구: ["이문동", "회기동", "전농동", "장안동", "답십리"],
  중랑구: ["면목동", "상봉동", "중화동", "묵동", "망우동"],
  성북구: ["돈암동", "안암동", "보문동", "정릉동", "길음동"],
  강북구: ["미아동", "번동", "수유동", "우이동", "삼양동"],
  도봉구: ["쌍문동", "방학동", "창동", "도봉동", "삼양동"],
  노원구: ["상계동", "중계동", "하계동", "공릉동", "월계동"],
  은평구: ["응암동", "역촌동", "불광동", "갈현동", "구산동"],
  서대문구: ["연희동", "홍은동", "북아현동", "남가좌동", "충정로"],
  마포구: ["합정동", "상수동", "서교동", "연남동", "공덕동"],
  양천구: ["목동", "신정동", "신월동", "목1동", "목2동"],
  강서구: ["마곡동", "가양동", "등촌동", "화곡동", "방화동"],
  구로구: ["구로동", "신도림동", "고척동", "오류동", "개봉동"],
  금천구: ["가산동", "독산동", "시흥동", "금천동", "서울디지털"],
  영등포구: ["여의도동", "당산동", "문래동", "양평동", "신길동"],
  동작구: ["사당동", "노량진동", "상도동", "흑석동", "대방동"],
  관악구: ["신림동", "봉천동", "낙성대동", "청룡동", "남현동"],
  서초구: ["서초동", "반포동", "잠원동", "방배동", "양재동"],
  강남구: ["역삼동", "삼성동", "대치동", "도곡동", "압구정동"],
  송파구: ["잠실동", "문정동", "가락동", "석촌동", "풍납동"],
  강동구: ["천호동", "길동", "둔촌동", "암사동", "명일동"],
};
