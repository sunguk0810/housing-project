import { z } from 'zod';
import { WEIGHT_PROFILE_KEYS } from '@/types/engine';

/**
 * Zod validation schema for POST /api/recommend.
 * Source of Truth: M2 spec Section 6.1, Step 2
 *
 * Units: cash/income/loans in 만원 (integer), monthlyBudget in 만원/월 (integer)
 */

export const tradeTypeSchema = z.enum(['sale', 'jeonse', 'monthly'], {
  errorMap: () => ({
    message: 'tradeType은 sale, jeonse, monthly만 허용됩니다.',
  }),
});

export const weightProfileSchema = z.enum(WEIGHT_PROFILE_KEYS, {
  errorMap: () => ({
    message: `weightProfile은 ${WEIGHT_PROFILE_KEYS.join(', ')}만 허용됩니다.`,
  }),
});

export const budgetProfileSchema = z.enum(['firstTime', 'noProperty', 'homeowner'], {
  errorMap: () => ({
    message: 'budgetProfile은 firstTime, noProperty, homeowner만 허용됩니다.',
  }),
});

export const loanProgramSchema = z.enum(['bankMortgage', 'bogeumjari'], {
  errorMap: () => ({
    message: 'loanProgram은 bankMortgage, bogeumjari만 허용됩니다.',
  }),
});

export const recommendRequestSchema = z
  .object({
    cash: z
      .number({ required_error: 'cash는 필수입니다.' })
      .int({ message: 'cash는 정수여야 합니다.' })
      .min(0, { message: 'cash는 0 이상이어야 합니다.' })
      .max(5_000_000, { message: 'cash는 50억 이하여야 합니다.' }),

    income: z
      .number({ required_error: 'income은 필수입니다.' })
      .int({ message: 'income은 정수여야 합니다.' })
      .min(0, { message: 'income은 0 이상이어야 합니다.' })
      .max(1_200_000, { message: 'income은 120억 이하여야 합니다.' }),

    loans: z
      .number()
      .int()
      .min(0)
      .max(5_000_000)
      .optional()
      .default(0),

    monthlyBudget: z
      .number()
      .int()
      .min(0)
      .max(10_000)
      .optional()
      .default(0),

    job1: z
      .string({ required_error: 'job1은 필수입니다.' })
      .max(200, { message: 'job1은 200자 이하여야 합니다.' }),

    job2: z.string().max(200, { message: 'job2는 200자 이하여야 합니다.' }).optional().default(''),

    job1Remote: z.boolean().optional().default(false),

    job2Remote: z.boolean().optional().default(false),

    tradeType: tradeTypeSchema,

    weightProfile: weightProfileSchema,

    budgetProfile: budgetProfileSchema.default('noProperty'),

    loanProgram: loanProgramSchema.default('bankMortgage'),

    desiredAreas: z
      .array(z.enum(['small', 'medium', 'large']))
      .min(1, { message: 'desiredAreas는 최소 1개 이상 선택해야 합니다.' })
      .max(3, { message: 'desiredAreas는 최대 3개까지 선택 가능합니다.' })
      .optional()
      .default(['small', 'medium', 'large']),
  })
  .superRefine((value, ctx) => {
    if (!value.job1Remote && value.job1.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['job1'],
        message: 'job1은 비어있을 수 없습니다.',
      });
    }
  });

export type ValidatedRecommendRequest = z.infer<typeof recommendRequestSchema>;
