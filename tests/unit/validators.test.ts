import { describe, it, expect } from "vitest";
import { recommendRequestSchema } from "@/lib/validators/recommend";
import { apartmentIdSchema } from "@/lib/validators/apartment";

/**
 * Zod validators unit tests (V-1 ~ V-6).
 * Source of Truth: M2 spec Section 8.1.5
 */

const validInput = {
  cash: 30000,
  income: 8000,
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

  // V-6: Missing required fields rejected
  it("V-6: rejects when required fields are missing", () => {
    const result = recommendRequestSchema.safeParse({ cash: 30000 });
    expect(result.success).toBe(false);
    if (!result.success) {
      // Should have errors for income, loans, monthlyBudget, job1, tradeType, weightProfile
      expect(result.error.errors.length).toBeGreaterThanOrEqual(5);
    }
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
