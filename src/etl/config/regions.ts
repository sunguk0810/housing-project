/**
 * Region configuration for ETL pipelines.
 * Defines Seoul 25 gu + select Gyeonggi cities with admin codes, coordinates, etc.
 */

export interface RegionConfig {
  /** 5-digit sigungu code (MOLIT LAWD_CD) */
  code: string;
  /** Display name e.g. "강남구" */
  name: string;
  /** Sido code: "11" (Seoul) | "41" (Gyeonggi) */
  sidoCode: string;
  /** NEIS education office code: "B10" (Seoul) | "J10" (Gyeonggi) */
  atptCode: string;
  /** Childcare sido code */
  stcode: string;
  /** Center latitude */
  lat: number;
  /** Center longitude */
  lng: number;
}

/** Seoul 25 gu */
export const SEOUL_REGIONS: RegionConfig[] = [
  {
    code: '11110',
    name: '종로구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.5735,
    lng: 126.979,
  },
  {
    code: '11140',
    name: '중구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.5641,
    lng: 126.998,
  },
  {
    code: '11170',
    name: '용산구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.5326,
    lng: 126.99,
  },
  {
    code: '11200',
    name: '성동구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.5634,
    lng: 127.037,
  },
  {
    code: '11215',
    name: '광진구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.5385,
    lng: 127.082,
  },
  {
    code: '11230',
    name: '동대문구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.5744,
    lng: 127.04,
  },
  {
    code: '11260',
    name: '중랑구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.6066,
    lng: 127.093,
  },
  {
    code: '11290',
    name: '성북구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.5894,
    lng: 127.017,
  },
  {
    code: '11305',
    name: '강북구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.6397,
    lng: 127.011,
  },
  {
    code: '11320',
    name: '도봉구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.6688,
    lng: 127.047,
  },
  {
    code: '11350',
    name: '노원구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.6542,
    lng: 127.056,
  },
  {
    code: '11380',
    name: '은평구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.6027,
    lng: 126.929,
  },
  {
    code: '11410',
    name: '서대문구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.5791,
    lng: 126.937,
  },
  {
    code: '11440',
    name: '마포구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.5663,
    lng: 126.901,
  },
  {
    code: '11470',
    name: '양천구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.517,
    lng: 126.867,
  },
  {
    code: '11500',
    name: '강서구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.5509,
    lng: 126.85,
  },
  {
    code: '11530',
    name: '구로구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.4954,
    lng: 126.888,
  },
  {
    code: '11545',
    name: '금천구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.4569,
    lng: 126.896,
  },
  {
    code: '11560',
    name: '영등포구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.5264,
    lng: 126.896,
  },
  {
    code: '11590',
    name: '동작구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.5124,
    lng: 126.94,
  },
  {
    code: '11620',
    name: '관악구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.4784,
    lng: 126.952,
  },
  {
    code: '11650',
    name: '서초구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.4837,
    lng: 127.032,
  },
  {
    code: '11680',
    name: '강남구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.5172,
    lng: 127.048,
  },
  {
    code: '11710',
    name: '송파구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.5145,
    lng: 127.106,
  },
  {
    code: '11740',
    name: '강동구',
    sidoCode: '11',
    atptCode: 'B10',
    stcode: '11',
    lat: 37.5301,
    lng: 127.124,
  },
];

/** Select Gyeonggi cities */
export const GYEONGGI_REGIONS: RegionConfig[] = [
  {
    code: '41111',
    name: '수원시 장안구',
    sidoCode: '41',
    atptCode: 'J10',
    stcode: '41',
    lat: 37.3036,
    lng: 127.01,
  },
  {
    code: '41113',
    name: '수원시 권선구',
    sidoCode: '41',
    atptCode: 'J10',
    stcode: '41',
    lat: 37.2577,
    lng: 126.972,
  },
  {
    code: '41115',
    name: '수원시 팔달구',
    sidoCode: '41',
    atptCode: 'J10',
    stcode: '41',
    lat: 37.2851,
    lng: 127.02,
  },
  {
    code: '41117',
    name: '수원시 영통구',
    sidoCode: '41',
    atptCode: 'J10',
    stcode: '41',
    lat: 37.2596,
    lng: 127.047,
  },
  {
    code: '41131',
    name: '성남시 수정구',
    sidoCode: '41',
    atptCode: 'J10',
    stcode: '41',
    lat: 37.4502,
    lng: 127.146,
  },
  {
    code: '41133',
    name: '성남시 중원구',
    sidoCode: '41',
    atptCode: 'J10',
    stcode: '41',
    lat: 37.4317,
    lng: 127.137,
  },
  {
    code: '41135',
    name: '성남시 분당구',
    sidoCode: '41',
    atptCode: 'J10',
    stcode: '41',
    lat: 37.3826,
    lng: 127.119,
  },
  {
    code: '41450',
    name: '하남시',
    sidoCode: '41',
    atptCode: 'J10',
    stcode: '41',
    lat: 37.5393,
    lng: 127.215,
  },
  {
    code: '41281',
    name: '고양시 덕양구',
    sidoCode: '41',
    atptCode: 'J10',
    stcode: '41',
    lat: 37.638,
    lng: 126.833,
  },
  {
    code: '41285',
    name: '고양시 일산동구',
    sidoCode: '41',
    atptCode: 'J10',
    stcode: '41',
    lat: 37.659,
    lng: 126.778,
  },
  {
    code: '41287',
    name: '고양시 일산서구',
    sidoCode: '41',
    atptCode: 'J10',
    stcode: '41',
    lat: 37.675,
    lng: 126.75,
  },
];

/** All target regions */
export const TARGET_REGIONS: RegionConfig[] = [...SEOUL_REGIONS, ...GYEONGGI_REGIONS];

/** Generate YYYYMM strings for the last N months from today */
export function getDealMonths(count: number = 6): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    months.push(`${yyyy}${mm}`);
  }
  return months;
}

/** Recent 6 months for MOLIT deal queries */
export const DEAL_MONTHS = getDealMonths(6);

/** Business district destinations for commute grid */
export const BUSINESS_DISTRICTS = {
  GBD: { name: '강남업무지구', lat: 37.4979, lng: 127.0276 },
  YBD: { name: '여의도업무지구', lat: 37.5219, lng: 126.9245 },
  CBD: { name: '광화문업무지구', lat: 37.57, lng: 126.977 },
  PANGYO: { name: '판교테크노밸리', lat: 37.3948, lng: 127.1112 },
  MAGOK: { name: '마곡업무지구', lat: 37.5602, lng: 126.8336 },
  JAMSIL: { name: '잠실업무권', lat: 37.5133, lng: 127.1002 },
  GASAN: { name: '가산업무권', lat: 37.4814, lng: 126.8826 },
  GURO: { name: '구로업무권', lat: 37.4854, lng: 126.9016 },
} as const;

/** Seoul district name to region code mapping */
export const DISTRICT_CODE_MAP: Record<string, string> = Object.fromEntries(
  SEOUL_REGIONS.map((r) => [r.name, r.code]),
);
