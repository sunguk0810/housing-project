import { describe, it, expect } from "vitest";
import { recommendRequestSchema } from "@/lib/validators/recommend";
import { apartmentIdSchema } from "@/lib/validators/apartment";

/**
 * Zod validators unit tests (V-1 ~ V-9).
 * Source of Truth: M2 spec Section 8.1.5
 */

const validInput = {
  cash: 30000,
  income: 96000, // annual (8000만/년)
  loans: 5000,
  monthlyBudget: 200,
  job1: "서울 강남구",
  job2: "서울 영등포구",
  tradeType: "jeonse" as const,
  weightProfile: "balanced" as const,
};

describe("recommendRequestSchema", () => {
  // V-1: Valid request passes
  it("V-1: parses valid request successfully", () => {
    const result = recommendRequestSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cash).toBe(30000);
      expect(result.data.job1).toBe("서울 강남구");
    }
  });

  // V-2: Negative cash rejected
  it("V-2: rejects negative cash", () => {
    const result = recommendRequestSchema.safeParse({
      ...validInput,
      cash: -1000,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const cashError = result.error.errors.find((e) =>
        e.path.includes("cash"),
      );
      expect(cashError).toBeDefined();
      expect(cashError?.message).toContain("0 이상");
    }
  });

  // V-3: Invalid tradeType rejected ("rent" and "monthly" are both invalid)
  it("V-3: rejects invalid tradeType", () => {
    const result = recommendRequestSchema.safeParse({
      ...validInput,
      tradeType: "rent",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const tradeError = result.error.errors.find((e) =>
        e.path.includes("tradeType"),
      );
      expect(tradeError).toBeDefined();
      expect(tradeError?.message).toContain("sale, jeonse, monthly");
    }
  });

  it("V-3b: accepts monthly tradeType (server normalizes to jeonse)", () => {
    const result = recommendRequestSchema.safeParse({
      ...validInput,
      tradeType: "monthly",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tradeType).toBe("monthly");
    }
  });

  // V-4: Invalid weightProfile rejected
  it("V-4: rejects invalid weightProfile", () => {
    const result = recommendRequestSchema.safeParse({
      ...validInput,
      weightProfile: "yolo",
    });
    expect(result.success).toBe(false);
  });

  // V-5: job1 > 200 chars rejected
  it("V-5: rejects job1 exceeding 200 characters", () => {
    const result = recommendRequestSchema.safeParse({
      ...validInput,
      job1: "a".repeat(201),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const jobError = result.error.errors.find((e) =>
        e.path.includes("job1"),
      );
      expect(jobError).toBeDefined();
      expect(jobError?.message).toContain("200자");
    }
  });

  // V-6: Missing required fields rejected (loans/monthlyBudget are now optional)
  it("V-6: rejects when required fields are missing", () => {
    const result = recommendRequestSchema.safeParse({ cash: 30000 });
    expect(result.success).toBe(false);
    if (!result.success) {
      // Should have errors for income, job1, tradeType, weightProfile
      expect(result.error.errors.length).toBeGreaterThanOrEqual(3);
    }
  });

  // V-7: loans is optional, defaults to 0
  it("V-7: loans is optional and defaults to 0", () => {
    const { loans: _, ...inputWithoutLoans } = validInput;
    void _;
    const result = recommendRequestSchema.safeParse(inputWithoutLoans);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.loans).toBe(0);
    }
  });

  // V-8: monthlyBudget is optional, defaults to 0
  it("V-8: monthlyBudget is optional and defaults to 0", () => {
    const { monthlyBudget: __, ...inputWithoutBudget } = validInput;
    void __;
    const result = recommendRequestSchema.safeParse(inputWithoutBudget);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.monthlyBudget).toBe(0);
    }
  });

  // V-10: desiredAreas=['medium'] passes
  it("V-10: desiredAreas=['medium'] passes", () => {
    const result = recommendRequestSchema.safeParse({
      ...validInput,
      desiredAreas: ["medium"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.desiredAreas).toEqual(["medium"]);
    }
  });

  // V-11: desiredAreas omitted defaults to all three
  it("V-11: desiredAreas omitted defaults to all three", () => {
    const result = recommendRequestSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.desiredAreas).toEqual(["small", "medium", "large"]);
    }
  });

  // V-12: desiredAreas=[] rejected (min 1)
  it("V-12: desiredAreas=[] rejected (min 1)", () => {
    const result = recommendRequestSchema.safeParse({
      ...validInput,
      desiredAreas: [],
    });
    expect(result.success).toBe(false);
  });

  // V-13: desiredAreas=['invalid'] rejected (enum)
  it("V-13: desiredAreas=['invalid'] rejected (enum)", () => {
    const result = recommendRequestSchema.safeParse({
      ...validInput,
      desiredAreas: ["invalid"],
    });
    expect(result.success).toBe(false);
  });

  // V-9: income max is 1,200,000
  it("V-9: income max is 1,200,000 (120억)", () => {
    const result = recommendRequestSchema.safeParse({
      ...validInput,
      income: 1_200_001,
    });
    expect(result.success).toBe(false);

    const resultAtMax = recommendRequestSchema.safeParse({
      ...validInput,
      income: 1_200_000,
    });
    expect(resultAtMax.success).toBe(true);
  });
});

describe("apartmentIdSchema", () => {
  it("parses valid integer ID", () => {
    const result = apartmentIdSchema.safeParse("42");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(42);
    }
  });

  it("rejects non-numeric string", () => {
    const result = apartmentIdSchema.safeParse("abc");
    expect(result.success).toBe(false);
  });

  it("rejects negative number", () => {
    const result = apartmentIdSchema.safeParse("-1");
    expect(result.success).toBe(false);
  });

  it("rejects zero", () => {
    const result = apartmentIdSchema.safeParse("0");
    expect(result.success).toBe(false);
  });
});
