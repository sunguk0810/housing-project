import { z } from "zod";

/**
 * Zod validation schema for POST /api/recommend.
 * Source of Truth: M2 spec Section 6.1, Step 2
 *
 * Units: cash/income/loans in 만원 (integer), monthlyBudget in 만원/월 (integer)
 */

export const tradeTypeSchema = z.enum(["sale", "jeonse", "monthly"], {
  errorMap: () => ({
    message: "tradeType은 sale, jeonse, monthly만 허용됩니다.",
  }),
});

export const weightProfileSchema = z.enum(
  ["balanced", "budget_focused", "commute_focused"],
  {
    errorMap: () => ({
      message:
        "weightProfile은 balanced, budget_focused, commute_focused만 허용됩니다.",
    }),
  },
);

export const recommendRequestSchema = z.object({
  cash: z
    .number({ required_error: "cash는 필수입니다." })
    .int({ message: "cash는 정수여야 합니다." })
    .min(0, { message: "cash는 0 이상이어야 합니다." })
    .max(5_000_000, { message: "cash는 50억 이하여야 합니다." }),

  income: z
    .number({ required_error: "income은 필수입니다." })
    .int({ message: "income은 정수여야 합니다." })
    .min(0, { message: "income은 0 이상이어야 합니다." })
    .max(1_000_000, { message: "income은 10억 이하여야 합니다." }),

  loans: z
    .number({ required_error: "loans는 필수입니다." })
    .int({ message: "loans는 정수여야 합니다." })
    .min(0, { message: "loans는 0 이상이어야 합니다." })
    .max(5_000_000, { message: "loans는 50억 이하여야 합니다." }),

  monthlyBudget: z
    .number({ required_error: "monthlyBudget은 필수입니다." })
    .int({ message: "monthlyBudget은 정수여야 합니다." })
    .min(0, { message: "monthlyBudget은 0 이상이어야 합니다." })
    .max(10_000, { message: "monthlyBudget은 1000만원 이하여야 합니다." }),

  job1: z
    .string({ required_error: "job1은 필수입니다." })
    .min(1, { message: "job1은 비어있을 수 없습니다." })
    .max(200, { message: "job1은 200자 이하여야 합니다." }),

  job2: z
    .string()
    .max(200, { message: "job2는 200자 이하여야 합니다." })
    .optional()
    .default(""),

  tradeType: tradeTypeSchema,

  weightProfile: weightProfileSchema,
});

export type ValidatedRecommendRequest = z.infer<
  typeof recommendRequestSchema
>;
