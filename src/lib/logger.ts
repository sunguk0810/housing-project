/**
 * PII-masking structured logger.
 * No PII is ever stored in logs (NFR-1).
 *
 * Source of Truth: M2 spec Section 6.5
 */

const PII_PATTERNS: Array<{ regex: RegExp; replacement: string }> = [
  // Phone numbers: 010-1234-5678 → 010-****-****
  { regex: /01[0-9]-\d{3,4}-\d{4}/g, replacement: "010-****-****" },
  // Email: user@domain.com → u***@domain.com
  {
    regex: /([a-zA-Z0-9])[a-zA-Z0-9.+_-]*@([a-zA-Z0-9.-]+)/g,
    replacement: "$1***@$2",
  },
  // Resident number: 123456-1234567 → ******-*******
  { regex: /\d{6}-\d{7}/g, replacement: "******-*******" },
];

export function maskPii(text: string): string {
  let masked = text;
  for (const pattern of PII_PATTERNS) {
    masked = masked.replace(pattern.regex, pattern.replacement);
  }
  return masked;
}

export function logRequest(
  method: string,
  path: string,
  body: unknown,
): void {
  const safeBody = maskPii(JSON.stringify(body ?? {}));
  console.log(
    JSON.stringify({
      event: "api_request",
      method,
      path,
      body: safeBody,
      timestamp: new Date().toISOString(),
    }),
  );
}

export function logError(error: unknown, context?: string): void {
  const message =
    error instanceof Error ? error.message : String(error);
  console.error(
    JSON.stringify({
      event: "error",
      message: maskPii(message),
      context: context ?? "unknown",
      timestamp: new Date().toISOString(),
    }),
  );
}
