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

// 50 apartments x 6 months = 300 records (3 sale + 3 jeonse per apartment)
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

    // 3 sale months + 3 jeonse months = 6 records per apartment
    for (let m = 0; m < 6; m++) {
      const period = months[m];
      const tradeType = m < 3 ? "sale" : "jeonse";

      let avgPrice: number;
      if (tradeType === "sale") {
        // Sale price with small monthly variation
        avgPrice = Math.round(baseSalePrice * (1 + (rng() - 0.5) * 0.05));
      } else {
        // Jeonse = sale price * ratio (50~65%)
        const ratio = randomFloat(
          rng,
          PRICE_RANGES.jeonse.ratioMin,
          PRICE_RANGES.jeonse.ratioMax,
        );
        avgPrice = Math.round(baseSalePrice * ratio);
      }

      // Poisson-like deal count (lambda=8)
      let dealCount = 0;
      const L = Math.exp(-8);
      let p = 1;
      do {
        dealCount++;
        p *= rng();
      } while (p > L);
      dealCount = Math.max(1, dealCount - 1);

      result.push({
        aptId,
        tradeType,
        year: period.year,
        month: period.month,
        averagePrice: String(avgPrice),
        dealCount,
      });
    }
  }

  return result;
}
