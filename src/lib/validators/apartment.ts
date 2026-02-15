import { z } from "zod";

/**
 * Zod validation for GET /api/apartments/[id] parameters.
 * Source of Truth: M2 spec Section 6.2
 */

export const apartmentIdSchema = z.coerce
  .number({
    required_error: "id는 필수입니다.",
    invalid_type_error: "id는 숫자여야 합니다.",
  })
  .int({ message: "id는 정수여야 합니다." })
  .positive({ message: "id는 양수여야 합니다." });

export type ValidatedApartmentId = z.infer<typeof apartmentIdSchema>;
