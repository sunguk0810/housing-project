import { z } from 'zod';
import { WEIGHT_PROFILE_KEYS } from '@/types/engine';

/**
 * Zod validation schema for POST /api/recommend.
 * Source of Truth: M2 spec Section 6.1, Step 2
 *
 * Units: cash/income/loans in 만원 (integer), monthlyBudget in 만원/월 (integer)
 */

// Strip zero-width and invisible Unicode characters that could bypass length/content checks
const ZERO_WIDTH_RE = /[\u200B-\u200F\u2028-\u202F\uFEFF\u00AD]/g;
const sanitizedString = (maxLen: number, fieldName?: string) =>
  z.string().transform((s) => s.replace(ZERO_WIDTH_RE, '').trim()).pipe(
    z.string().max(maxLen, { message: fieldName ? `${fieldName}은 ${maxLen}자 이하여야 합니다.` : `${maxLen}자 이하여야 합니다.` }),
  );

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

const customWeightsSchema = z.object({
  budget: z.number().int().min(0).max(100),
  commute: z.number().int().min(0).max(100),
  childcare: z.number().int().min(0).max(100),
  safety: z.number().int().min(0).max(100),
  school: z.number().int().min(0).max(100),
  complexScale: z.number().int().min(0).max(100),
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

    job1: sanitizedString(200, 'job1'),

    job2: sanitizedString(200, 'job2').optional().default(''),

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

    customWeights: customWeightsSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.job1Remote && value.job1.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['job1'],
        message: 'job1은 비어있을 수 없습니다.',
      });
    }
    if (value.weightProfile === 'custom') {
      if (!value.customWeights) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['customWeights'],
          message: 'custom 프로필 선택 시 customWeights는 필수입니다.',
        });
      } else {
        const sum =
          value.customWeights.budget +
          value.customWeights.commute +
          value.customWeights.childcare +
          value.customWeights.safety +
          value.customWeights.school +
          value.customWeights.complexScale;
        if (sum !== 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['customWeights'],
            message: `customWeights 합계는 100이어야 합니다. (현재: ${sum})`,
          });
        }
      }
    }
  });

export type ValidatedRecommendRequest = z.infer<typeof recommendRequestSchema>;
