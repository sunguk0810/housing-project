import { NextResponse } from 'next/server';
import type { ApiErrorCode, ApiErrorResponse, ValidationDetail } from '@/types/api';

/**
 * Common API error response builders.
 * Centralizes error response format for all API routes.
 *
 * Source of Truth: M2 spec Section 7.2 (error response format)
 */

export function errorResponse(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: ValidationDetail[],
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status },
  );
}

export function invalidJsonError(): NextResponse<ApiErrorResponse> {
  return errorResponse(
    'INVALID_JSON',
    '요청 본문이 올바른 JSON이 아닙니다.',
    400,
  );
}

export function validationError(
  details: ValidationDetail[],
): NextResponse<ApiErrorResponse> {
  return errorResponse(
    'VALIDATION_ERROR',
    '입력값 검증에 실패했습니다.',
    400,
    details,
  );
}

export function addressNotFoundError(
  field: string,
): NextResponse<ApiErrorResponse> {
  return errorResponse(
    'ADDRESS_NOT_FOUND',
    `${field} 주소를 찾을 수 없습니다. 주소를 더 상세히 입력해주세요. (예: 서울 강남구 역삼동)`,
    400,
  );
}

export function rateLimitedError(): NextResponse<ApiErrorResponse> {
  return errorResponse(
    'RATE_LIMITED',
    '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    429,
  );
}

export function internalError(): NextResponse<ApiErrorResponse> {
  return errorResponse(
    'INTERNAL_ERROR',
    '서버 내부 오류가 발생했습니다.',
    500,
  );
}

/**
 * Log structured error for pipeline failures.
 */
export function logPipelineError(
  event: string,
  tradeType: string,
  err: unknown,
): void {
  const message =
    err instanceof Error ? err.message : 'Internal server error';
  const stack = err instanceof Error ? err.stack : undefined;
  const rawErrorCode =
    err && typeof err === 'object' && 'code' in err
      ? (err as { code?: unknown }).code
      : undefined;
  const dbErrorCode =
    typeof rawErrorCode === 'string' || typeof rawErrorCode === 'number'
      ? String(rawErrorCode)
      : undefined;
  const rawErrorCause =
    err && typeof err === 'object' && 'cause' in err
      ? (err as { cause?: unknown }).cause
      : undefined;
  const dbErrorCause =
    rawErrorCause &&
    typeof rawErrorCause === 'object' &&
    'message' in rawErrorCause
      ? String((rawErrorCause as { message?: unknown }).message)
      : undefined;

  console.error(
    JSON.stringify({
      event,
      tradeType,
      error: message,
      code: dbErrorCode,
      cause: dbErrorCause,
      ...(process.env.NODE_ENV === 'development' && stack ? { stack } : {}),
      timestamp: new Date().toISOString(),
    }),
  );
}
