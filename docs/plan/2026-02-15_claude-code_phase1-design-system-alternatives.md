---
plan-id: "2026-02-15_claude-code_phase1-design-system-alternatives"
status: "done"
phase: "PHASE1"
template-version: "1.1"
work-type: "feature"
---

# Plan Execute: 디자인 시스템 대안 리서치 실행

## 목표

현재 확정된 디자인 시스템의 **컬러·타이포·토큰 전략** 3개 축에 대해 체계적 대안을 리서치하고, 기존 25개 컴포넌트 외에 **구현에 필요한 신규 컴포넌트 갭**을 도출하여, 구현 착수 전 최종 의사결정의 정량적 근거를 확보한다.

**SoT 참조**: FR/NFR/법무 체크리스트 → `docs/PHASE0_ground.md` | DB 스키마·스코어링 로직·Design Tokens 요약 → `docs/PHASE1_design.md` S2/S4/S7

**참고 문서** (SoT 아님, 상세 명세): `docs/design-system/DESIGN_SYSTEM.md` | `docs/design-system/design-tokens.css`

**선행 plan**: `2026-02-14_codex_phase1-design-system-alternatives` (프롬프트 세트 준비)

## 범위

### 리서치 대상 4개 축

| 축 | 대상 | SoT 수정 | 비고 |
|----|------|----------|------|
| 축 1: 컬러 팔레트 | 브랜드 컬러, 시맨틱 컬러, Score 등급 색상 | 없음 (참조만) | 컴플라이언스 가드레일 유지 |
| 축 2: 타이포그래피 | 폰트 선택, 타입 스케일, 가격 표시 | 없음 (참조만) | KRDS 접근성 기준 준수 |
| 축 3: 디자인 토큰/다크모드 | 토큰 관리 도구, 시맨틱 레이어, 다크모드 | 없음 (참조만) | Tailwind v4 기반 유지 |
| 축 4: 컴포넌트 갭 분석 | 기존 25개 외 신규 필요 컴포넌트 도출 | 없음 (참조만) | 사용자 플로우 기준 |

### 제약 사항

- **SoT 보호**: 리서치 결과는 `docs/plan/` 하위에만 기록. SoT 문서 직접 수정 금지
- **Legacy 보호**: `docs/legacy_docs/` 읽기 전용 참조만
- **컴플라이언스**: Safety 색상 빨강 금지, 금지 용어, 면책 5접점 등 기존 가드레일 유지
- **기술 스택**: Tailwind v4 + Next.js App Router 기반 유지
- **지도 API**: Kakao Maps JS SDK 고정 (PHASE1 S1 SoT)

## 작업 단계

### 1차: 핵심 의사결정 리서치

| Step | 작업 | 상태 |
|------|------|------|
| Step 1 | 축 1 — 컬러 팔레트 대안 리서치 -> `2026-02-15_claude-code_phase1-color-palette-alternatives.md` | **done** |
| Step 2 | 축 2 — 타이포그래피 대안 리서치 -> `2026-02-15_claude-code_phase1-typography-research.md` | **done** |
| Step 3 | 축 3 — 디자인 토큰 및 다크모드 리서치 -> `2026-02-15_claude-code_phase2-design-token-darkmode-research.md` | **done** |
| Step 4 | 축 4 — 컴포넌트 갭 분석 및 라이브러리 리서치 -> `2026-02-15_claude-code_phase2-component-library-research.md` | **done** |
| Step 5 | 종합 스코어카드 산출 및 보고서 작성 -> `2026-02-15_claude-code_phase1-design-system-scorecard.md` | **done** |

## 검증 기준

| # | 기준 | 방법 |
|---|------|------|
| 1 | 축별 스코어카드 산출 완료 (3축 x 현재+대안) | 점수표 존재 확인 |
| 2 | WCAG AA 대비율 매트릭스 포함 | 정량 수치 검증 |
| 3 | 색맹 시뮬레이션 결과 포함 (3종) | 시뮬레이션 결과 기록 확인 |
| 4 | 폰트 성능 데이터 포함 | 벤치마크 수치 검증 |
| 5 | 25개 기존 컴포넌트 영향도 매핑 완료 | 전수 검토 테이블 확인 |
| 6 | 컴포넌트 갭 분석 Must/Should/Could 분류 | 플로우별 테이블 확인 |
| 7 | 모든 데이터에 출처 링크 + 기준일 표기 | NFR-4 대응 확인 |
| 8 | SoT 직접 수정 없음 | `docs/plan/` 하위에만 기록 확인 |
| 9 | 컴플라이언스 가드레일 유지 | Safety 빨강 금지 등 반영 확인 |

## 결과/결정

- **상태**: `done`
- **핵심 결과**:
  1. **유지 5건**: Primary #0891B2, Accent #F97316, Neutral Stone, Pretendard Variable, 가격 표시 전략
  2. **부분 개선 4건**: Score 등급 휘도 교정(Good/Average/Below), 타입 스케일 7단계 확장(Display 32px), 토큰 @theme + 2.5-tier 확장
  3. **변경 1건**: 다크모드 next-themes 도입 (17점 상회)
  4. **Must 17개 컴포넌트 구현 순서 확정** (5단계 Phase)
  5. **신규 패키지 4개**: recharts, react-kakao-maps-sdk, supercluster, next-themes
- **후속 액션**:
  - P0 액션 3건(Score 휘도 교정, next-themes 도입, Score/Safety 다크 변형)은 SoT 수정 필요 -> 사용자 승인 후 별도 구현 plan
  - 종합 스코어카드: `2026-02-15_claude-code_phase1-design-system-scorecard.md`

## Verification 이력

### Run 1 (2026-02-15)

```json
{
  "phase": "PHASE1",
  "verdict": "go",
  "run": 1,
  "score": {
    "completeness": 1.0,
    "consistency": 1.0,
    "compliance": 1.0
  },
  "blockers": [],
  "next_actions": [
    "P0 액션 3건 사용자 승인 후 구현 plan 생성",
    "PHASE2 M2 컴포넌트 구현 착수"
  ],
  "timestamp": "2026-02-15"
}
```
