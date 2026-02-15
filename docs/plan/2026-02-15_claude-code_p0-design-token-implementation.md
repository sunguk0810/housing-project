---
plan-id: 2026-02-15_claude-code_p0-design-token-implementation
status: done
phase: PHASE2
template-version: "1.1"
depends-on:
  - plan-id: 2026-02-15_claude-code_phase1-design-system-scorecard
    condition: "status == done AND verdict == go"
---

# P0 디자인 토큰 개선 + 다크모드 기반 구축

## 목표

Claude/GPT 독립 리서치 교차 검증 결과를 바탕으로 P0 긴급 액션 3건(Safety 색상 교체, Score 휘도 교정, 4변형 시맨틱 토큰)과 P1 보완 3건(Display 토큰, 다크모드 기반, `@custom-variant` 개선)을 구현한다.

## 범위

- **선행 plan**: `2026-02-15_claude-code_phase1-design-system-scorecard` (done, verdict: go)
- **SoT 참조**: FR/NFR/법무 → `docs/PHASE0_ground.md` | Design Tokens S7 → `docs/PHASE1_design.md`

### 수정 대상

| 구분 | 파일 |
|------|------|
| 런타임 CSS | `src/styles/tokens.css`, `src/app/globals.css` |
| 레이아웃 | `src/app/layout.tsx` |
| 의존성 | `package.json` (next-themes 추가) |
| SoT 문서 | `docs/design-system/design-tokens.css`, `docs/design-system/DESIGN_SYSTEM.md` |
| Showcase | `docs/design-system/showcase/` 내 8개 HTML 파일 |

### 주요 변경

1. **Safety 색상 교체 (P0)**: 녹-주황 → Blue-Amber-Gray (적록색맹 안전)
2. **Score 휘도 교정 (P0)**: Good-Average 인접 대비 1.02:1 → 1.64:1
3. **Score/Safety 4변형 토큰 (P0)**: solid/subtle/border/fg 32개 추가
4. **다크모드 토큰 확장**: Score/Safety/Core 다크 변형 35개 추가
5. **Display 32px 타입 토큰 (P1)**: 7단계 Type Scale 확장
6. **next-themes ThemeProvider**: 다크모드 런타임 기반 구축
7. **`--color-s7-*` 접두사 제거**: SoT 문서와 네이밍 통일
8. **Showcase HTML 하드코딩 HEX 교체**: 이전 색상 잔여 0건 달성

## 작업 단계

| # | 작업 | 상태 |
|---|------|------|
| 0 | Plan Execute 문서 선생성 + README 인덱스 등록 | ✅ |
| 1 | `pnpm add next-themes` (v0.4.6) | ✅ |
| 2 | Safety 컬러 교체 (tokens.css) | ✅ |
| 3 | Score 등급 휘도 교정 (tokens.css) | ✅ |
| 4 | Score/Safety 4변형 시맨틱 토큰 확장 (32개) | ✅ |
| 5 | 다크모드 토큰 추가 (.dark 블록, 35개) | ✅ |
| 6 | Display 32px + Subtitle 18px 타입 토큰 | ✅ |
| 7 | globals.css `@custom-variant` 개선 (`:where()`) | ✅ |
| 8 | layout.tsx ThemeProvider 래핑 + `lang="ko"` | ✅ |
| 9 | SoT 문서 동기화 + `--color-s7-*` 접두사 제거 | ✅ |
| 10 | DESIGN_SYSTEM.md 테이블 4건 업데이트 | ✅ |
| 11 | tokens.html 스워치 + 타이포 업데이트 | ✅ |
| 12 | comp-score.html Score HEX + rgba 교체 | ✅ |
| 13 | comp-trust.html Safety HEX + 라벨 교체 | ✅ |
| 14 | comp-cards.html Score HEX 교체 | ✅ |
| 15 | comp-nav.html Score HEX 교체 | ✅ |
| 16 | comp-map.html Score HEX 교체 | ✅ |
| 17 | page-detail.html Score + Safety HEX 교체 | ✅ |
| 18 | page-results.html Score HEX 교체 | ✅ |
| 19 | 잔여 검증 + 빌드 + Plan 완료 | ✅ |

## 검증 기준

1. ✅ `pnpm build` 성공 — 타입 에러/CSS 파싱 에러 없음
2. ✅ Showcase HTML 이전 HEX 잔여 0건 — `grep` 결과 0건 달성
   - 참고: `tokens.css`/`design-tokens.css` 내 border 변형(`#42A5F5`, `#90A4AE`, `#FF9800`, `#9E9E9E`)과 다크모드 변형(`#42A5F5`, `#FF8A65`)은 의도된 재사용
3. ✅ `rg -- '--color-s7-' src/styles/tokens.css` → 0건 (접두사 완전 제거)
4. ✅ Safety 색상에 빨강 미사용 — Blue(`#1976D2`), Amber(`#FFC107`), Gray(`#757575`)
5. ✅ DESIGN_SYSTEM.md HEX 값과 tokens.css 일치
6. ✅ ThemeProvider 정상 래핑 (`attribute="class"`, `defaultTheme="system"`)

## 결과/결정

- **상태**: `done`
- **변경 토큰 수**: ~22 → ~81 (+59개)
  - Score 5등급 × 4변형 = 20개 (라이트)
  - Safety 3등급 × 4변형 = 12개 (라이트)
  - Core Semantic +3개 (`surface-sunken`, `primary-hover`, `on-primary`)
  - Typography +1단계 (Display 32px, 4토큰)
  - 다크모드 Score 20 + Safety 12 + Core 3 = 35개
- **후속 액션**: 없음. 다음 단계는 PHASE2 M2 컴포넌트 구현으로 진행 가능.
