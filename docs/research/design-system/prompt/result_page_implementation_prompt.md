# /results 페이지 구현 플랜 요청 프롬프트 (Claude Code용)

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
├── ref_1-1_desktop_split_view_analysis.md   ← 스플릿 뷰 분석 (데스크톱)
├── ref_1-2_mobile_bottomsheet_analysis.md   ← 바텀시트 분석 (모바일)
├── ref_4-1_property_card_analysis.md         ← 매물 카드 분석
├── ref_2-1_circular_gauge_analysis.md        ← 게이지/등급 분석
└── images/                                   ← 레퍼런스 스크린샷
    ├── zillow_desktop_result.png
    ├── redfin_desktop_result.png
    ├── realtor_desktop_result.png
    ├── homes_desktop_result.png
    ├── zillow_desktop_property-card.png
    ├── googlemaps_mobile_bottomsheet-peek.png
    ├── googlemaps_mobile_bottomsheet-half.png
    ├── zigbang_mobile_map.png
    ├── (... 카드/게이지 이미지들)
```

---

## 프롬프트

```
# /results 페이지 구현 플랜 작성

## 컨텍스트

지금부터 집콕신혼 서비스의 `/results` (분석 결과) 페이지 구현 플랜을 작성해줘.
이 페이지는 서비스의 **핵심 화면**으로, 지도 + 리스트 스플릿 뷰에서
사용자가 분석 결과를 탐색하는 화면이야.

## 반드시 읽어야 할 파일 (순서대로)

1. `docs/design-system/DESIGN_SYSTEM.md` — 디자인 시스템 전체 명세 (SoT)
2. `docs/design-system/design-tokens.css` — CSS 토큰 정의
3. `docs/design-system/design_brief.md` — §5-2 결과 화면 설계
4. `docs/research/design-system/ref_1-1_desktop_split_view_analysis.md` — 데스크톱 스플릿 뷰 레퍼런스 분석
5. `docs/research/design-system/ref_1-2_mobile_bottomsheet_analysis.md` — 모바일 바텀시트 레퍼런스 분석
6. `docs/research/design-system/ref_4-1_property_card_analysis.md` — 카드 레퍼런스 분석
7. `docs/research/design-system/ref_2-1_circular_gauge_analysis.md` — 게이지/등급 레퍼런스 분석
8. `docs/research/design-system/images/` — 레퍼런스 스크린샷 (이미지 확인)

## 플랜 작성 규칙

### 구조

플랜은 다음 구조로 작성해:

1. **컴포넌트 트리**: /results 페이지를 구성하는 전체 컴포넌트 계층도
2. **구현 순서**: 의존성 기반으로 어떤 컴포넌트를 먼저 만들어야 하는지
3. **컴포넌트별 상세**: 각 컴포넌트의 props, 상태, 스타일, 애니메이션
4. **반응형 전환**: 1024px 기준 모바일↔데스크톱 레이아웃 차이
   - 데스크톱(1024px+): 스플릿 뷰 → ref_1-1 분석 참고
   - 모바일(1024px 미만): 지도 + 3단 바텀시트 → ref_1-2 분석 참고
5. **데이터 흐름**: API → 컴포넌트 간 데이터 전달 구조
6. **검증 체크리스트**: 구현 후 확인할 항목

### 디자인 원칙 (위반 금지)

- **색상/간격/타이포**: 반드시 `design-tokens.css`의 CSS Custom Property 사용
- **Tailwind 클래스**: `DESIGN_SYSTEM.md` §6.3의 패턴 준수
- **컴플라이언스**: `DESIGN_SYSTEM.md` §5의 금지 용어/표현 절대 사용 금지
  - "추천" → "분석 결과 안내"
  - "매물 추천" → "조건 맞춤 단지 탐색"
  - 안전 섹션에서 빨강 사용 금지
- **접근성**: 점수 시각화에 색상만 사용 금지 → 텍스트 라벨(A+/A/B/C/D) 병행 필수

### 레퍼런스 적용 규칙

각 분석 문서의 "Agent 전달용 요약" 섹션을 확인하고:
- **"가져올 것"** 항목 → 구현에 반영
- **"무시할 것"** 항목 → 절대 따라가지 않기
- **"신규 인사이트"** 항목 → 플랜에 포함 여부 판단하여 근거와 함께 명시

### 기술 제약

- Next.js 16.x App Router (RSC + Client Component 구분 명시)
- React 19 + TypeScript strict
- Tailwind CSS v4 (`@theme` 토큰 사용)
- shadcn/ui 컴포넌트 활용 가능
- 지도: Kakao Maps JS SDK (PHASE1 SoT, 다른 API 사용 금지)
- 차트: Recharts (레이더 차트 전용)
- 점수 게이지: 순수 SVG (라이브러리 미사용)
- 바텀시트: Vaul (shadcn Drawer) 또는 CSS scroll snap

## 기대 산출물

1. `/results` 페이지의 **컴포넌트 트리 + 파일 구조**
2. 각 컴포넌트의 **구현 상세** (props 인터페이스, Tailwind 클래스, 애니메이션)
3. **구현 순서** (단계별, 의존성 표시)
4. 모바일(바텀시트) ↔ 데스크톱(스플릿뷰) **반응형 전환 명세**
5. **검증 체크리스트** (디자인 토큰 준수, 컴플라이언스, 접근성)

플랜만 작성하고, 코드 구현은 하지 마. 플랜 승인 후 단계별로 구현할 거야.
```

---

## 선택: 일부 분석이 아직 완료되지 않았을 때

아직 일부 레퍼런스 분석이 끝나지 않았다면, 위 프롬프트에서
해당 파일 참조를 제거하고 다음 문장을 추가:

```
참고: 아래 레퍼런스 분석은 아직 진행 중이야.
- [미완료 분석명]
해당 컴포넌트 상세는 [TODO]로 표시해줘. 분석 완료 후 업데이트할 거야.
나머지 완료된 분석 기반으로 전체 컴포넌트 트리와 구현 순서는 지금 작성해.
```