import type { InferInsertModel } from "drizzle-orm";
import { schools } from "../schema/schools";
import {
  createRng,
  randomPick,
  randomNormal,
  clamp,
  SEOUL_DISTRICTS,
  DONG_NAMES,
} from "./constants";

type SchoolInsert = InferInsertModel<typeof schools>;

interface LevelConfig {
  level: "elem" | "middle" | "high";
  count: number;
  suffix: string;
  scoreMean: number;
  scoreStd: number;
  scoreMin: number;
  scoreMax: number;
}

const LEVEL_CONFIGS: LevelConfig[] = [
  {
    level: "elem",
    count: 40,
    suffix: "초등학교",
    scoreMean: 72,
    scoreStd: 10,
    scoreMin: 45,
    scoreMax: 95,
  },
  {
    level: "middle",
    count: 25,
    suffix: "중학교",
    scoreMean: 68,
    scoreStd: 12,
    scoreMin: 40,
    scoreMax: 92,
  },
  {
    level: "high",
    count: 15,
    suffix: "고등학교",
    scoreMean: 65,
    scoreStd: 15,
    scoreMin: 40,
    scoreMax: 98,
  },
];

export function generateSchools(): SchoolInsert[] {
  const rng = createRng(45);
  const result: SchoolInsert[] = [];

  for (const config of LEVEL_CONFIGS) {
    for (let i = 0; i < config.count; i++) {
      const district = randomPick(rng, SEOUL_DISTRICTS);
      const dongList = DONG_NAMES[district.name] ?? ["중앙동"];
      const dong = randomPick(rng, dongList);

      const score = clamp(
        Math.round(
          randomNormal(rng, config.scoreMean, config.scoreStd) * 100,
        ) / 100,
        config.scoreMin,
        config.scoreMax,
      );

      result.push({
        name: `서울${dong}${config.suffix}`,
        schoolLevel: config.level,
        location: {
          longitude: district.lng + (rng() - 0.5) * 0.03,
          latitude: district.lat + (rng() - 0.5) * 0.03,
        },
        achievementScore: String(score),
        assignmentArea: null,
      });
    }
  }

  return result;
}
