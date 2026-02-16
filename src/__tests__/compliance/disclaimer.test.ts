/**
 * Compliance test: Verify all 5 disclaimer touch-points exist in source.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const srcRoot = resolve(__dirname, "../../");

describe("Disclaimer 5 touch-points", () => {
  it("touch-point 1: Footer disclaimer", () => {
    const content = readFileSync(
      resolve(srcRoot, "components/layout/Footer.tsx"),
      "utf-8",
    );
    expect(content).toContain('data-disclaimer="footer"');
    expect(content).toContain("DISCLAIMER_TEXTS.footer");
  });

  it("touch-point 2: DisclaimerBanner", () => {
    const content = readFileSync(
      resolve(srcRoot, "components/layout/DisclaimerBanner.tsx"),
      "utf-8",
    );
    expect(content).toContain('data-disclaimer="banner"');
    expect(content).toContain("DISCLAIMER_TEXTS.banner");
  });

  it("touch-point 3: DataSourceTag on results page", () => {
    const content = readFileSync(
      resolve(srcRoot, "app/(main)/results/page.tsx"),
      "utf-8",
    );
    expect(content).toContain('data-disclaimer="data-source-results"');
    expect(content).toContain("DataSourceTag");
  });

  it("touch-point 4: ExternalLinkCTA disclaimer modal", () => {
    const content = readFileSync(
      resolve(srcRoot, "components/trust/ExternalLinkCTA.tsx"),
      "utf-8",
    );
    expect(content).toContain('data-disclaimer="external-link"');
    expect(content).toContain("DISCLAIMER_TEXTS.externalLink");
  });

  it("touch-point 5: Terms page service definition", () => {
    const content = readFileSync(
      resolve(srcRoot, "app/(main)/terms/page.tsx"),
      "utf-8",
    );
    expect(content).toContain('data-disclaimer="terms-service"');
    expect(content).toContain("DISCLAIMER_TEXTS.termsService");
  });
});
