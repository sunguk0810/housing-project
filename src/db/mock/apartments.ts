import type { InferInsertModel } from "drizzle-orm";
import { apartments } from "../schema/apartments";
import {
  createRng,
  randomInt,
  randomPick,
  APARTMENT_NAMES,
  SEOUL_DISTRICTS,
  AREA_OPTIONS,
  DONG_NAMES,
} from "./constants";

type ApartmentInsert = InferInsertModel<typeof apartments>;

// Gyeonggi approximate coordinates
const GYEONGGI_COORDS: Record<string, { lat: number; lng: number }> = {
  화성시: { lat: 37.2, lng: 127.0 },
  성남시: { lat: 37.42, lng: 127.13 },
  수원시: { lat: 37.26, lng: 127.0 },
  고양시: { lat: 37.66, lng: 126.83 },
  하남시: { lat: 37.54, lng: 127.21 },
  과천시: { lat: 37.43, lng: 126.99 },
  안양시: { lat: 37.39, lng: 126.95 },
  의왕시: { lat: 37.34, lng: 126.97 },
  김포시: { lat: 37.62, lng: 126.72 },
  남양주시: { lat: 37.64, lng: 127.21 },
  구리시: { lat: 37.6, lng: 127.14 },
  부천시: { lat: 37.5, lng: 126.76 },
  의정부시: { lat: 37.74, lng: 127.05 },
};

export function generateApartments(): ApartmentInsert[] {
  const rng = createRng(42);
  const result: ApartmentInsert[] = [];

  for (let i = 0; i < APARTMENT_NAMES.length; i++) {
    const apt = APARTMENT_NAMES[i];
    const seoulDistrict = SEOUL_DISTRICTS.find((d) => d.name === apt.district);

    let lat: number;
    let lng: number;
    let districtCode: string;

    if (apt.region === "seoul" && seoulDistrict) {
      lat = seoulDistrict.lat + (rng() - 0.5) * 0.02;
      lng = seoulDistrict.lng + (rng() - 0.5) * 0.02;
      districtCode = seoulDistrict.code;
    } else {
      const gCoord = GYEONGGI_COORDS[apt.district] ?? {
        lat: 37.4,
        lng: 127.0,
      };
      lat = gCoord.lat + (rng() - 0.5) * 0.03;
      lng = gCoord.lng + (rng() - 0.5) * 0.03;
      districtCode = "41000";
    }

    const dongList =
      DONG_NAMES[apt.district] ?? DONG_NAMES["강남구"] ?? ["역삼동"];
    const dong = randomPick(rng, dongList);
    const areaMin = randomPick(rng, AREA_OPTIONS.minChoices);
    const validMaxChoices = AREA_OPTIONS.maxChoices.filter((m) => m > areaMin);
    const areaMax =
      validMaxChoices.length > 0
        ? randomPick(rng, validMaxChoices)
        : areaMin + 25;

    result.push({
      aptCode: `APT-${districtCode}-${String(i + 1).padStart(3, "0")}`,
      aptName: apt.name,
      address: `서울특별시 ${apt.district} ${dong} ${randomInt(rng, 1, 500)}`,
      location: { longitude: lng, latitude: lat },
      builtYear: randomInt(rng, 1995, 2023),
      householdCount: randomInt(rng, 300, 5000),
      areaMin: areaMin,
      areaMax: areaMax,
    });
  }

  return result;
}
