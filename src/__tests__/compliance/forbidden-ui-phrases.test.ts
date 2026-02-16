/**
 * Compliance test: Scan all .tsx and .ts files for forbidden UI phrases.
 * Source of Truth: PHASE0 S4, CLAUDE.md
 *
 * Phrases defined here using Unicode escapes to avoid compliance scan
 * false-positives on the definition itself.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const srcRoot = resolve(__dirname, "../../");

// Each entry uses Unicode escapes to prevent the compliance scanner
// from matching this test file itself.
const FORBIDDEN_PHRASES = [
  "\uB300\uCD9C \uAC00\uB2A5 \uBCF4\uC7A5",
  "\uAC70\uB798 \uC131\uC0AC \uBCF4\uC7A5",
  "\uD22C\uC790 \uC218\uC775 \uBCF4\uC7A5",
  "\uAC00\uC7A5 \uC548\uC804\uD55C \uC9C0\uC5ED \uD655\uC815",
  "\uCD5C\uC801 \uD22C\uC790 \uD655\uC815",
  "\uD22C\uC790\uD558\uC138\uC694",
  "\uB9E4\uC218\uD558\uC138\uC694",
  "\uC548\uC804\uC744 \uBCF4\uC7A5",
  "\uC218\uC775\uC744 \uBCF4\uC7A5",
  "\uCD5C\uACE0\uC758 \uD22C\uC790",
];

// "\uCD94\uCC9C" = "추천" — must not appear standalone in UI text
// Allowed patterns: "분석 결과", "안내" (CLAUDE.md rule)
const STANDALONE_RECOMMEND_REGEX = /(?<![가-힣])\uCD94\uCC9C(?![가-힣])/;

// Exceptions: test files, constants defining the rule, comments
const RECOMMEND_WHITELIST_PATTERNS = [
  /FORBIDDEN_PHRASES/,
  /STANDALONE_RECOMMEND_REGEX/,
  /eslint-disable/,
  /\/\//,
  /\*\s/,
];

function getAllSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === "__tests__" || entry === "node_modules") continue;
      files.push(...getAllSourceFiles(fullPath));
    } else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) {
      files.push(fullPath);
    }
  }
  return files;
}

describe("Forbidden UI phrases scan", () => {
  const sourceFiles = getAllSourceFiles(srcRoot);

  it("finds source files to scan", () => {
    expect(sourceFiles.length).toBeGreaterThan(0);
  });

  for (const phrase of FORBIDDEN_PHRASES) {
    it(`does not contain forbidden phrase: "${phrase}"`, () => {
      const violations: string[] = [];

      for (const file of sourceFiles) {
        const content = readFileSync(file, "utf-8");
        if (content.includes(phrase)) {
          const relativePath = file.replace(srcRoot, "src/");
          violations.push(relativePath);
        }
      }

      expect(violations).toEqual([]);
    });
  }

  it('does not use standalone "\uCD94\uCC9C" in UI-facing code', () => {
    const violations: Array<{ file: string; line: number; text: string }> = [];

    for (const file of sourceFiles) {
      const content = readFileSync(file, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!STANDALONE_RECOMMEND_REGEX.test(line)) continue;

        // Skip whitelisted patterns (comments, test definitions)
        const isWhitelisted = RECOMMEND_WHITELIST_PATTERNS.some((p) =>
          p.test(line),
        );
        if (isWhitelisted) continue;

        const relativePath = file.replace(srcRoot, "src/");
        violations.push({ file: relativePath, line: i + 1, text: line.trim() });
      }
    }

    expect(violations).toEqual([]);
  });
});
