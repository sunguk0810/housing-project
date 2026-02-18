# / 랜딩 페이지 구현 플랜 요청 프롬프트 (Claude Code용)

> **사용 방법**: 아래 프롬프트를 Claude Code에 전달할 때,
> 참조 파일들을 프로젝트 내에 배치한 후 사용하세요.

---

## 사전 준비: 파일 배치

```
docs/design-system/
├── DESIGN_SYSTEM.md              ← 디자인 시스템 전체 명세 (SoT)
├── design-tokens.css             ← CSS 토큰 정의
├── design_brief.md               ← 통합 디자인 브리프

docs/research/design-system/
├── ref_7-1_landing_page_analysis.md   ← 랜딩 페이지 분석 + 섹션별 플랜
└── images/
    ├── toss_landing_hero.png
    ├── zigbang_landing.png
    ├── banksalad_landing.png
    └── hogangnono_landing.png
```

---

## 프롬프트

```
# / 랜딩 페이지 구현 플랜 작성

## 컨텍스트

지금부터 집콕신혼 서비스의 `/` (랜딩) 페이지를 구현해줘.
이 페이지는 신규 사용자가 서비스에 처음 방문했을 때 보는 화면으로,
서비스 가치를 전달하고 `/onboarding`으로 유도하는 것이 목표야.

## 7개 섹션 구조

랜딩은 다음 7개 섹션으로 구성해:

1. **Hero** — 헤드라인 + 부제 + CTA + 결과 미리보기 비주얼
2. **문제 공감** — "신혼집 찾기, 막막하셨죠?" + 3개 고민 카드
3. **3스텝 설명** — ① 정보 입력 → ② AI 분석 → ③ 결과 탐색
4. **4가지 분석 카테고리** — 💰예산 + 🚇통근 + 👶보육 + 🛡안전 (2×2 그리드)
5. **결과 미리보기** — 실제 분석 결과 스크린샷 (흐린 처리 + "예시" 라벨)
6. **신뢰 요소** — 데이터 출처 + 사용자 수 + Trust 배지 + 면책
7. **최종 CTA** — "우리 부부에게 맞는 동네, 지금 찾아보세요" + CTA 반복

## 반드시 읽어야 할 파일 (순서대로)

1. `docs/design-system/DESIGN_SYSTEM.md` — 디자인 시스템 전체 명세 (SoT)
2. `docs/design-system/design-tokens.css` — CSS 토큰 정의
3. `docs/design-system/design_brief.md` — 서비스 개요 및 톤앤매너
4. `docs/research/design-system/ref_7-1_landing_page_analysis.md` — 랜딩 페이지 분석 (섹션별 상세 스펙 포함)
5. `docs/research/design-system/images/` — 레퍼런스 스크린샷

## 핵심 카피 (확정)

| 위치 | 카피 |
|------|------|
| Hero 헤드라인 | "신혼부부 맞춤 동네, 데이터로 찾아드려요" |
| Hero 부제 | "예산·통근·보육·안전, 4가지 관점으로 분석해요" |
| Hero CTA | "무료 분석 시작하기 →" |
| Hero 서브 텍스트 | "3분이면 충분해요 · 회원가입 없이 시작" |
| 문제 공감 헤드라인 | "신혼집 찾기, 막막하셨죠?" |
| 3스텝 헤드라인 | "3분이면 분석 완료" |
| 4카테고리 헤드라인 | "4가지 관점으로 꼼꼼하게" |
| 미리보기 헤드라인 | "이런 결과를 받아볼 수 있어요" |
| 신뢰 헤드라인 | "신뢰할 수 있는 데이터" |
| 최종 CTA 헤드라인 | "우리 부부에게 맞는 동네, 지금 찾아보세요" |

## 디자인 원칙 (위반 금지)

- **색상/간격/타이포**: 반드시 `design-tokens.css`의 CSS Custom Property 사용
- **Tailwind 클래스**: `DESIGN_SYSTEM.md` §6.3의 패턴 준수
- **컴플라이언스**: `DESIGN_SYSTEM.md` §5의 금지 용어/표현 절대 사용 금지
  - "추천" → "분석 결과 안내" 또는 "조건 맞춤 탐색"
  - 투자 권유 뉘앙스 금지
- **면책 문구**: 신뢰 섹션에 반드시 포함 — "본 서비스는 정보 제공 목적이며, 투자 판단의 근거로 사용할 수 없습니다."
- **접근성**: CTA 버튼 최소 44px 터치 영역, 충분한 색상 대비

## 레퍼런스 적용 규칙

`ref_7-1_landing_page_analysis.md`의 "Agent 전달용 요약" 섹션을 확인하고:
- **"가져올 것"**: 토스 Hero 구조, 직방 카테고리 카드, 뱅크샐러드 문제→해결 프레이밍
- **"무시할 것"**: 호갱노노 "랜딩 없이 서비스", 프로모 슬라이더, 풀 블리드 사진 배경
- 분석 문서의 **섹션별 상세 스펙**을 그대로 따라 구현

## 기술 제약

- Next.js 16.x App Router (이 페이지는 **전체 RSC** — 인터랙션 거의 없음)
- Tailwind CSS v4 (`@theme` 토큰 사용)
- 애니메이션: CSS scroll-driven animation 또는 Intersection Observer
  - 각 섹션 스크롤 진입 시 fade-in + translateY(20px) 효과
  - 사용자 수 카운트업 애니메이션 (duration-countup: 800ms)
- 이미지: 결과 미리보기는 placeholder div로 구현 (실제 스크린샷은 나중에 교체)
- CTA 클릭 → `/onboarding` 라우팅

## 반응형 전환

- **데스크톱(1024px+)**: Hero 좌우 분할 (텍스트|비주얼), 3스텝 수평, max-w-6xl 중앙
- **모바일(< 1024px)**: 모든 섹션 세로 스택, CTA full-width, Hero 비주얼은 텍스트 아래

## 기대 산출물

바로 구현해줘. 플랜 없이 코드로. 파일 구조:

```
src/app/page.tsx                    ← 랜딩 페이지 (RSC)
src/components/landing/
├── HeroSection.tsx
├── ProblemSection.tsx
├── StepsSection.tsx
├── CategoriesSection.tsx
├── PreviewSection.tsx
├── TrustSection.tsx
├── FinalCTASection.tsx
├── LandingNav.tsx
└── LandingFooter.tsx
```

각 섹션을 별도 컴포넌트로 분리하고, page.tsx에서 조립해.
```