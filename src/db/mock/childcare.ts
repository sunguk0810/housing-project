import type { InferInsertModel } from "drizzle-orm";
import { childcareCenters } from "../schema/childcare";
import {
  createRng,
  randomInt,
  randomPick,
  randomNormal,
  clamp,
  SEOUL_DISTRICTS,
  CHILDCARE_NAME_PATTERNS,
  DONG_NAMES,
} from "./constants";

type ChildcareInsert = InferInsertModel<typeof childcareCenters>;

const GRADES = ["A", "B", "C", "D"] as const;
const GRADE_WEIGHTS = [0.2, 0.4, 0.3, 0.1]; // cumulative: 0.2, 0.6, 0.9, 1.0

function pickGrade(rng: () => number): string {
  const r = rng();
  let cumulative = 0;
  for (let i = 0; i < GRADES.length; i++) {
    cumulative += GRADE_WEIGHTS[i];
    if (r < cumulative) return GRADES[i];
  }
  return GRADES[GRADES.length - 1];
}

export function generateChildcare(): ChildcareInsert[] {
  const rng = createRng(44);
  const result: ChildcareInsert[] = [];

  // 200 centers distributed across 25 districts (8 per district)
  for (let d = 0; d < SEOUL_DISTRICTS.length; d++) {
    const district = SEOUL_DISTRICTS[d];
    const dongList = DONG_NAMES[district.name] ?? ["중앙동"];
    const centersPerDistrict = 8;

    for (let c = 0; c < centersPerDistrict; c++) {
      const dong = randomPick(rng, dongList);
      const pattern = randomPick(rng, CHILDCARE_NAME_PATTERNS);
      const name = pattern.replace("{dong}", dong);

      const capacity = Math.round(
        clamp(randomNormal(rng, 60, 25), 20, 150),
      );
      const enrollment = Math.round(capacity * (0.5 + rng() * 0.45));

      result.push({
        name,
        address: `서울특별시 ${district.name} ${dong} ${randomInt(rng, 1, 300)}`,
        location: {
          longitude: district.lng + (rng() - 0.5) * 0.03,
          latitude: district.lat + (rng() - 0.5) * 0.03,
        },
        capacity,
        currentEnrollment: enrollment,
        evaluationGrade: pickGrade(rng),
      });
    }
  }

  return result;
}
