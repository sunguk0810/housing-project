# Design tokens and dark mode for a lean PropTech team

**For a 1–3 person team on Next.js App Router + Tailwind v4, the highest-impact move is not adopting a new tool — it's restructuring what you already have.** Enhance your current manual CSS setup with better file organization and a `2-tier+` semantic token architecture, combine `next-themes` with Tailwind v4's `@custom-variant dark` for dark mode, and defer heavier tooling like Style Dictionary until token count or team size genuinely demands it. The W3C DTCG spec reached its first stable release (2025.10) in October 2025, making this a strategic moment: any token format investments made now should align with DTCG to avoid future migration pain.

This report covers four axes — token management tooling, semantic architecture, dark mode strategy, and 2025–2026 industry trends — each with a concrete recommendation for your PropTech context: a scoring system with 5 grade levels (blue-orange diverging palette), 3-level safety indicators, and Kakao Maps integration.

---

## Axis 1: Token management tools ranked for small teams

Your current manual CSS approach — 50+ custom properties in `design-tokens.css` with `@theme` references — is not broken. At this scale, the overhead of adopting a build pipeline outweighs the benefit. But this changes as tokens grow or Figma enters the workflow.

| Criteria | Manual CSS (Current) | Style Dictionary | Tokens Studio | TW v4 @theme Enhanced |
|---|---|---|---|---|
| **Cost** | $0 | $0 | Free–€49/user/mo | $0 |
| **GitHub stars** | N/A | ~4,500 | ~1,543 (plugin) | ~87,000 (Tailwind) |
| **Last updated** | N/A | Jan 2025 (v5.2.0) | Feb 2026 | Ongoing (v4.1) |
| **Learning curve** | 0 hrs | 8–16 hrs | 12–20 hrs (full pipeline) | 2–4 hrs |
| **Figma sync** | ❌ None | Via plugin | ✅ Native | ❌ None |
| **CI/CD integration** | N/A | ✅ Excellent | ✅ Good (via SD) | ✅ Inherent |
| **TW v4 @theme compat** | ✅ Excellent | ✅ Good (custom format) | ⚠️ Indirect | ✅ Perfect |
| **Token validation** | ❌ | ✅ Type checking | ✅ Plugin + SD | ❌ Lint only |
| **DTCG spec support** | ❌ | ✅ v1 compliant | ✅ v1 compliant | ❌ |
| **Runtime impact** | Zero | Zero (build-time) | Zero (build-time) | Zero |
| **Multi-platform output** | CSS only | ✅ iOS, Android, JS | ✅ Via SD | CSS only |

**Style Dictionary** (https://github.com/style-dictionary/style-dictionary, ~4,500 stars, Apache-2.0) is the canonical open-source token transformation engine. Version 5.2.0 shipped January 2025 with DTCG-native support. It's now maintained by the Tokens Studio team, ensuring deep integration between the two. For Tailwind v4, Style Dictionary outputs CSS custom properties that you import alongside your `@theme` block — but you'll need a **~20-line custom format** to emit a native `@theme` block directly, since no built-in format exists for this yet.

**Tokens Studio** (https://github.com/tokens-studio/figma-plugin, ~1,543 stars, MIT, 264K+ Figma installs) is the leading Figma token plugin. Its free Starter plan covers basic token types and single-file Git sync. But the value proposition is fundamentally tied to Figma — **without active Figma usage, it adds complexity without its core benefit**. The full pipeline (plugin → GitHub → SD transforms → CSS → `@theme`) takes 12–20 hours to set up and understand.

**Tailwind v4 `@theme` enhancement** delivers the best ROI right now. Since you're already using `@theme`, the path forward is restructuring `design-tokens.css` into layered files (`primitives.css`, `semantic.css`) and leveraging `@theme` namespace conventions (`--color-*`, `--spacing-*`, `--radius-*`). Investment: **2–4 hours, zero new dependencies**.

> **Recommendation: Partial improvement — enhance current setup now, adopt Style Dictionary later.** Restructure your token files immediately. Add Style Dictionary when token count exceeds ~100 or when you need DTCG compliance. Adopt Tokens Studio only if Figma becomes central to your design workflow.

---

## Axis 2: A 2-tier architecture with dedicated score and safety tokens

Five major design systems reveal two dominant patterns: 2-tier systems (Shopify Polaris, Radix Themes, Chakra UI) and 3-tier systems (GitHub Primer, MUI). The dividing line is team size and component count — **3-tier adds meaningful value only beyond ~30 components or when multi-brand theming is required**.

| System | Tiers | Stars | Naming pattern | Data viz tokens |
|---|---|---|---|---|
| Shopify Polaris | 2 | ~4,600 | `--p-color-{element}-{variant}` | critical, success, caution, warning |
| GitHub Primer | 3 | ~12,000 | `--{property}-{role}-{modifier}` | danger, severe, attention, success, done |
| Radix Themes | 2 | ~16,000 | `--{color}-{step}` (12-step scales) | Via component color prop |
| MUI | 3 | ~95,000 | `--mui-palette-{role}-{variant}` | error, warning, info, success |
| Chakra UI | 2 | ~40,000 | `{category}.{modifier}` | bg.error, bg.warning, bg.success |

Your current 6 semantic tokens (surface, surface-elevated, on-surface, on-surface-muted, border, primary) form a solid foundation. The gap is **dedicated tokens for your scoring system and safety indicators**. Here's the recommended expanded architecture targeting **~41 semantic color tokens** — well within comfortable 2-tier range:

**Score tokens (5 grades × 4 variants = 20 tokens):** Use numbered grades rather than descriptive names. Numbers are language-agnostic, map directly to data values, and interpolate naturally. Each grade needs four variants — solid (primary color), subtle (tinted background), border, and foreground (text/icon on neutral background).

```css
:root {
  /* Score Grade 1 (Excellent/Blue) → Grade 5 (Poor/Orange) */
  --color-score-grade-1: #1d4ed8;
  --color-score-grade-1-subtle: #dbeafe;
  --color-score-grade-1-border: #3b82f6;
  --color-score-grade-1-fg: #1e40af;
  /* ... grades 2-4 ... */
  --color-score-grade-5: #c2410c;
  --color-score-grade-5-subtle: #fff7ed;
  --color-score-grade-5-border: #ea580c;
  --color-score-grade-5-fg: #9a3412;
}
```

**Safety tokens (3 levels × 4 variants = 12 tokens):** Use descriptive names (safe/caution/danger) following the universal pattern across Polaris, Primer, MUI, and Chakra. Note that **caution/yellow requires dark foreground text** due to its high luminance.

```css
:root {
  --color-safety-safe: #16a34a;
  --color-safety-safe-subtle: #f0fdf4;
  --color-safety-caution: #ca8a04;
  --color-safety-caution-subtle: #fefce8;
  --color-safety-danger: #dc2626;
  --color-safety-danger-subtle: #fef2f2;
  /* ... border and fg variants for each ... */
}
```

**Core surface tokens (9 tokens):** Expand your existing 6 to include `surface-sunken`, `primary-hover`, and `on-primary` for complete coverage.

> **Recommendation: Maintain 2-tier, expand token set.** Stay with Global + Semantic tiers. Add the score and safety token groups using the 4-variant pattern (solid, subtle, border, fg). Target ~41 semantic color tokens. Adopt dot-path naming in CSS (`--color-score-grade-1-subtle`) for consistency. Upgrade to 3-tier only if you exceed 30 components or need white-labeling.

---

## Axis 3: next-themes plus @custom-variant solves dark mode completely

The dark mode challenge has three dimensions: the switching mechanism, FOUC prevention in Next.js App Router, and domain-specific color adaptation for scores and maps.

| Feature | `.dark` class (current) | `prefers-color-scheme` first | next-themes | TW v4 `@custom-variant` |
|---|---|---|---|---|
| Setup complexity | Medium | Medium-High | **Low** | Low (CSS) + Medium (JS) |
| System preference detection | Manual | **Native CSS** | **Built-in** | With hybrid variant |
| FOUC prevention | Custom script | **Best (CSS-first)** | **Auto (script injection)** | Custom script needed |
| localStorage persistence | Manual | Manual | **Automatic** | Manual |
| Bundle size | 0 KB | 0 KB | **~2.5 KB** gzipped | 0 KB |
| Tab sync | Manual | N/A | **Automatic** | Manual |
| Multi-theme support | Manual | Limited | **Built-in** | Manual |

**next-themes** (https://github.com/pacocoursey/next-themes, ~6,200 stars, MIT, v0.4.6) handles the hardest parts: FOUC prevention via injected blocking `<script>`, automatic localStorage persistence, system preference detection with `resolvedTheme` API, and cross-tab synchronization — all for **~2.5 KB gzipped with zero dependencies**. It's fully compatible with Next.js App Router (since v0.3.0) and sees **8.3 million weekly npm downloads**. Combined with Tailwind v4's `@custom-variant dark`, this is the complete solution:

```css
/* globals.css */
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
@import "./design-tokens.css";
```

```tsx
// app/layout.tsx
<html lang="ko" suppressHydrationWarning>
  <body>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem
                   disableTransitionOnChange>
      {children}
    </ThemeProvider>
  </body>
</html>
```

### Score grade colors demand a dual-palette strategy

A blue-to-orange diverging palette optimized for white backgrounds will fail WCAG **3:1 minimum contrast** requirements on dark surfaces. The fix: shift from **600–700 weight tones in light mode to 300–400 weights in dark mode**, preserving hue identity while increasing luminance. Research from "Chameleon: Automated Color Palette Adaptation for Dark Mode Data Visualizations" (arXiv:2512.00516) found that dark mode achieves only ~67% WCAG compliance without deliberate adaptation.

```css
.dark {
  --color-score-grade-1: #60a5fa; /* Blue 400 — 6.7:1 on #1e293b */
  --color-score-grade-3: #94a3b8; /* Slate 400 — 5.3:1 on #1e293b */
  --color-score-grade-5: #fdba74; /* Orange 300 — 8.5:1 on #1e293b */
}
```

Blue-orange is inherently **colorblind-safe** (unlike red-green), but always supplement color with numeric labels or icons — never rely on color alone.

### Kakao Maps has no dark mode support

Kakao Maps Open API **explicitly does not support dark mode** — confirmed in official SDK v2 documentation and multiple DevTalk threads. No dark tile set exists. The recommended workaround combines two strategies: use **Kakao Maps `CustomOverlay` API** to render HTML-based markers styled with your CSS variables (these automatically respond to dark mode token changes), and apply a **gentle brightness/saturation reduction filter** (`filter: brightness(0.7) saturate(0.8)`) to the base map container. Avoid full CSS `invert()` filters — they're fragile, break map colors, and incur GPU rendering overhead during panning.

```tsx
// Custom overlay markers respond to CSS variable changes automatically
const overlay = new kakao.maps.CustomOverlay({
  content: `<div style="background: var(--color-score-grade-${grade})">
    <span>${score}</span></div>`,
});
```

> **Recommendation: Adopt next-themes + @custom-variant dark.** This replaces your manual toggle with a battle-tested library for ~2.5 KB. Use dual token sets (light/dark values) for score and safety colors. For Kakao Maps, use CustomOverlay for markers and brightness reduction for the base map.

---

## Axis 4: The DTCG spec changes everything — eventually

### W3C DTCG reached stable 1.0

The W3C Design Tokens Community Group spec (https://github.com/design-tokens/community-group, ~1,900 stars) published its **first stable version (2025.10) on October 28, 2025**. This is a community specification (not a formal W3C Standard), but it carries weight: contributors include Adobe, Amazon, Google, Microsoft, Meta, Figma, Salesforce, Shopify, and dozens more. The spec defines a JSON interchange format using `$value`/`$type`/`$description` properties with `{token.name}` alias syntax. Style Dictionary v4+ is the reference implementation with first-class DTCG support.

**Practical implication:** If you adopt Style Dictionary in the future, author tokens in DTCG format (`.tokens.json`). This ensures interoperability with every major tool in the ecosystem.

### CSS @property is production-ready

With **94.57% global browser support** (Chrome 85+, Firefox 128+, Safari 16.4+), `@property` is safe for production use. It provides typed custom properties, guaranteed fallback values, and — critically — **animatable CSS variables**. Tailwind v4 already uses `@property` internally. For your scoring system, registered properties enable smooth color transitions between grade levels:

```css
@property --color-score-active {
  syntax: '<color>';
  inherits: true;
  initial-value: #6b7280;
}
```

### Figma's Variable API remains enterprise-locked

Figma's REST API for Variables requires an Enterprise plan — a significant barrier for small teams. The **Plugin API** works on all paid plans and is the practical access path. The more interesting development is **Figma's MCP Server** (GA as of late 2025), which brings design context (variables, components, styles) directly into AI coding tools like Cursor, VS Code, and Claude Code. This works on all plans and could be more impactful than traditional API workflows for small teams.

### The 2026 small-team stack is surprisingly simple

The emerging "golden path" for small teams is: **DTCG `.tokens.json` → Style Dictionary v4 → Tailwind v4 `@theme` CSS variables**. But the key insight is that you don't need to adopt the full pipeline today. Tailwind v4's `@theme` already treats CSS custom properties as first-class tokens. Start there. Add layers only when complexity demands it.

- **Tokens Studio** (https://tokens.studio) now integrates with Figma, Penpot, Framer, and VS Code, with an open-source Graph Engine for visual token logic
- **Penpot** (https://penpot.app) offers fully open-source design with native DTCG-compatible tokens — a viable Figma alternative for cost-conscious teams
- **AI-assisted token workflows** are emerging through Figma MCP, Supernova's AI naming, and IDE copilots that reference your actual token definitions

---

## Conclusion

Four clear decisions emerge from this research. **First**, enhance your current manual CSS setup with better file organization (split `design-tokens.css` into primitives and semantic layers) rather than adding tooling overhead — this costs 2–4 hours and zero dependencies. **Second**, expand your 6 semantic tokens to ~41 by adding dedicated score (5 grades × 4 variants) and safety (3 levels × 4 variants) token groups, staying firmly in 2-tier architecture. **Third**, adopt next-themes (~2.5 KB) paired with Tailwind v4's `@custom-variant dark` to eliminate manual dark mode plumbing and prevent FOUC on App Router. **Fourth**, align future token format decisions with DTCG 2025.10 — when you eventually need Style Dictionary, your tokens will be ecosystem-ready.

The counter-intuitive finding: **the most sophisticated tooling is not the most effective for a small team**. Tokens Studio + Style Dictionary + DTCG is an elegant pipeline, but it introduces three new tools, a JSON authoring workflow, and a build step for a team that currently has 50 tokens. The inflection point where this investment pays off is roughly **100+ tokens, 2+ themes, or active Figma-to-code handoff**. Until then, well-structured CSS custom properties inside Tailwind v4's `@theme` are genuinely sufficient — and they're already DTCG-compatible in spirit, since CSS variables are the final output format regardless of what generates them.