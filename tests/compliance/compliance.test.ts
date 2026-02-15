import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Compliance tests — PHASE0 S4 legal checklist verification.
 * Source of Truth: M2 spec Section 8.3
 */

const SRC_DIR = path.resolve(__dirname, "../../src");

/** Recursively collect all .ts/.tsx files in a directory */
function collectTsFiles(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") {
      files.push(...collectTsFiles(fullPath));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

describe("PII 비저장 (NFR-1)", () => {
  it("DB 스키마에 PII 컬럼이 존재하지 않아야 한다", () => {
    const schemaDir = path.join(SRC_DIR, "db", "schema");
    const schemaFiles = collectTsFiles(schemaDir);
    const piiColumns = [
      "income",
      "salary",
      "cash",
      "personal_id",
      "phone",
      "email",
      "resident_number",
      "ssn",
    ];

    for (const file of schemaFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip comments and imports
        if (line.trim().startsWith("//") || line.trim().startsWith("import")) {
          continue;
        }
        for (const pii of piiColumns) {
          // Check for column definitions (e.g., income: varchar(...))
          const columnPattern = new RegExp(
            `\\b${pii}\\b.*(?:varchar|text|integer|real|numeric)`,
            "i",
          );
          expect(
            columnPattern.test(line),
            `PII column '${pii}' found in ${path.relative(SRC_DIR, file)}:${i + 1}`,
          ).toBe(false);
        }
      }
    }
  });
});

describe("금지 문구 검증 (PHASE0 S4)", () => {
  const FORBIDDEN_PHRASES = [
    "대출 가능 보장",
    "거래 성사 보장",
    "투자 수익 보장",
    "가장 안전한 지역 확정",
    "최적 투자 확정",
    "알선",
    "매물 추천",
  ];

  it("소스 코드에서 금지 문구가 없어야 한다 (주석 제외)", () => {
    const allFiles = collectTsFiles(SRC_DIR);
    const violations: string[] = [];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip pure comment lines
        if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
          continue;
        }

        for (const phrase of FORBIDDEN_PHRASES) {
          if (line.includes(phrase)) {
            violations.push(
              `${path.relative(SRC_DIR, file)}:${i + 1} — "${phrase}"`,
            );
          }
        }
      }
    }

    expect(
      violations,
      `Forbidden phrases found:\n${violations.join("\n")}`,
    ).toHaveLength(0);
  });

  it('"추천" 단독 사용이 문자열 리터럴에 없어야 한다', () => {
    const allFiles = collectTsFiles(SRC_DIR);
    const violations: string[] = [];

    // Match "추천" inside string literals (quotes) without proper context
    const stringLiteralRegex = /["'`]([^"'`]*추천[^"'`]*)["'`]/g;
    const allowedContext = [
      "분석 결과",
      "안내",
      "근거",
      "출처",
      "기준일",
      "recommendations",
      "Recommend",
      "recommend",
    ];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
          continue;
        }

        let match: RegExpExecArray | null;
        stringLiteralRegex.lastIndex = 0;
        while ((match = stringLiteralRegex.exec(line)) !== null) {
          const matchedStr = match[1];
          const hasAllowedContext = allowedContext.some((ctx) =>
            matchedStr.includes(ctx),
          );
          if (!hasAllowedContext) {
            violations.push(
              `${path.relative(SRC_DIR, file)}:${i + 1} — "${matchedStr}"`,
            );
          }
        }
      }
    }

    expect(
      violations,
      `Solo "추천" in string literals:\n${violations.join("\n")}`,
    ).toHaveLength(0);
  });
});

describe("데이터 출처 표기 (NFR-4)", () => {
  it("RecommendationItem 타입에 sources 필드가 정의되어 있어야 한다", () => {
    const apiTypesPath = path.join(SRC_DIR, "types", "api.ts");
    const content = fs.readFileSync(apiTypesPath, "utf-8");

    expect(content).toContain("sources");
    expect(content).toContain("priceDate");
    expect(content).toContain("safetyDate");
  });

  it("ApartmentDetailResponse에 sources 필드가 정의되어 있어야 한다", () => {
    const apiTypesPath = path.join(SRC_DIR, "types", "api.ts");
    const content = fs.readFileSync(apiTypesPath, "utf-8");

    // Should have sources in ApartmentDetailResponse
    expect(content).toContain("ApartmentDetailResponse");
    expect(content).toContain("priceDate");
  });
});

describe("크롤링 코드 부재 (NFR-4)", () => {
  it("소스 코드에 크롤링/스크래핑 패턴이 없어야 한다", () => {
    const allFiles = collectTsFiles(SRC_DIR);
    const crawlPatterns = [
      /puppeteer/i,
      /playwright/i,
      /cheerio/i,
      /jsdom.*querySelector/i,
      /scrape/i,
      /crawl(?!ing)/i, // "crawling" in comments OK
    ];

    const violations: string[] = [];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, "utf-8");
      for (const pattern of crawlPatterns) {
        if (pattern.test(content)) {
          violations.push(
            `${path.relative(SRC_DIR, file)} — matches ${pattern.source}`,
          );
        }
      }
    }

    expect(violations).toHaveLength(0);
  });
});
