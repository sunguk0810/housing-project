import type { InferInsertModel } from "drizzle-orm";
import { apartmentPrices } from "../schema/prices";
import {
  createRng,
  randomNormal,
  randomFloat,
  clamp,
  PRICE_RANGES,
} from "./constants";

type PriceInsert = InferInsertModel<typeof apartmentPrices>;

// 50 apartments x ~30 individual trades = ~1500 records
export function generatePrices(apartmentCount: number): PriceInsert[] {
  const rng = createRng(43);
  const result: PriceInsert[] = [];
  const months = [
    { year: 2025, month: 7 },
    { year: 2025, month: 8 },
    { year: 2025, month: 9 },
    { year: 2025, month: 10 },
    { year: 2025, month: 11 },
    { year: 2025, month: 12 },
  ];

  for (let aptId = 1; aptId <= apartmentCount; aptId++) {
    // Base sale price for this apartment
    const baseSalePrice = Math.round(
      clamp(
        randomNormal(rng, PRICE_RANGES.sale.mean, PRICE_RANGES.sale.std),
        PRICE_RANGES.sale.min,
        PRICE_RANGES.sale.max,
      ),
    );

    // Generate individual trades: 3 sale months + 3 jeonse months, multiple trades per month
    for (let m = 0; m < 6; m++) {
      const period = months[m];
      const tradeType = m < 3 ? "sale" : "jeonse";

      // 2~5 individual trades per month
      const tradeCount = Math.max(2, Math.round(rng() * 3 + 2));

      for (let t = 0; t < tradeCount; t++) {
        let dealPrice: number;
        if (tradeType === "sale") {
          dealPrice = Math.round(baseSalePrice * (1 + (rng() - 0.5) * 0.1));
        } else {
          const ratio = randomFloat(
            rng,
            PRICE_RANGES.jeonse.ratioMin,
            PRICE_RANGES.jeonse.ratioMax,
          );
          dealPrice = Math.round(baseSalePrice * ratio * (1 + (rng() - 0.5) * 0.08));
        }

        // Individual trade area and floor
        const area = Math.round((59 + rng() * 75) * 100) / 100; // 59~134㎡
        const floorNum = Math.max(1, Math.round(rng() * 30 + 1)); // 1~31

        result.push({
          aptId,
          tradeType,
          year: period.year,
          month: period.month,
          price: String(dealPrice),
          monthlyRent: null,
          exclusiveArea: String(area),
          floor: floorNum,
        });
      }
    }
  }

  return result;
}
