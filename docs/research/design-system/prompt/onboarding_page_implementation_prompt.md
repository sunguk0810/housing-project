# /onboarding 페이지 구현 플랜 요청 프롬프트 (Claude Code용)

> **사용 방법**: 아래 프롬프트를 Claude Code에 전달할 때,
> 참조 파일들을 프로젝트 내에 배치한 후 사용하세요.

---

## 사전 준비: 파일 배치

```
docs/design-system/
├── DESIGN_SYSTEM.md              ← 디자인 시스템 전체 명세 (SoT)
├── design-tokens.css             ← CSS 토큰 정의
├── design_brief.md               ← 통합 디자인 브리프 (§5-1 온보딩 설계)

docs/research/design-system/
├── ref_3-1_onboarding_wizard_analysis.md   ← 온보딩 입력 + 로딩 분석
├── ref_3-2_address_search_analysis.md      ← 주소 검색 자동완성 분석
├── ref_3-3_card_selection_analysis.md      ← 카드형 선택지 분석
└── images/
    ├── toss_mobile_loan-input.jpeg
    ├── toss_mobile_loan-input2.jpeg
    ├── toss_mobile_transfer-amount.jpeg
    ├── toss_mobile_consent.jpeg
    ├── toss_card_selection.jpeg
    ├── kakaotalk_survey_selection.jpeg
    └── videos/
        ├── toss_mobile_loading_and_result.mp4
        ├── kakao_mobile_loading_and_result.mp4
        ├── toss_address_search.mp4
        └── kakao_address_search.mp4
```

---

## 프롬프트

```
# /onboarding 페이지 구현 플랜 작성

## 컨텍스트

지금부터 집콕신혼 서비스의 `/onboarding` (5스텝 위저드) 페이지 구현 플랜을 작성해줘.
이 페이지는 사용자가 서비스에 처음 진입할 때 부부 정보, 통근지, 소득/자산,
선호 조건을 입력하고, 분석을 시작하는 핵심 플로우야.
마지막에 로딩 애니메이션을 거쳐 `/results`로 라우팅돼.

## 5스텝 구조 (design_brief §5-1 참고)

- Step 1: 부부 기본 정보 (주거형태, 결혼 예정일)
- Step 2: 통근지 입력 (직장 주소 2개)
- Step 3: 소득·자산·대출 입력 (금액 입력 + 동의 수집)
- Step 4: 선호 조건 (우선순위 슬라이더, 생활권 선택)
- Step 5: 분석 시작 확인 + 로딩 애니메이션

## 반드시 읽어야 할 파일 (순서대로)

1. `docs/design-system/DESIGN_SYSTEM.md` — 디자인 시스템 전체 명세 (SoT)
2. `docs/design-system/design-tokens.css` — CSS 토큰 정의
3. `docs/design-system/design_brief.md` — §5-1 온보딩 설계
4. `docs/research/design-system/ref_3-1_onboarding_wizard_analysis.md` — 온보딩 레퍼런스 분석
5. `docs/research/design-system/ref_3-2_address_search_analysis.md` — 주소 검색 자동완성 분석
6. `docs/research/design-system/ref_3-3_card_selection_analysis.md` — 카드형 선택지 분석
7. `docs/research/design-system/images/` — 토스/카카오 레퍼런스 이미지 및 영상

## 플랜 작성 규칙

### 구조

플랜은 다음 구조로 작성해:

1. **전체 플로우 다이어그램**: Step 1→2→3→4→5→로딩→/results 전체 흐름
2. **컴포넌트 트리**: /onboarding 페이지를 구성하는 전체 컴포넌트 계층도
3. **구현 순서**: 의존성 기반으로 어떤 컴포넌트를 먼저 만들어야 하는지
4. **스텝별 상세**:
   - 각 스텝의 질문 텍스트 (타이틀 + 부제)
   - 입력 컴포넌트 종류 (텍스트, 금액, 카드 선택, 슬라이더 등)
   - 예외 분기 버튼 ("결혼 안했어요", "재택근무예요" 등)
   - CTA 버튼 텍스트와 활성/비활성 조건
   - 유효성 검증 규칙
5. **금액 입력 컴포넌트 상세**:
   - 커스텀 키패드 레이아웃 ("00" 키 포함)
   - 빠른 금액 버튼 (+1,000만/+5,000만/+1억)
   - 실시간 단위 변환 ("35000" → "3억 5,000만")
   - 필드 라벨 활성 상태 (brand-500 밑줄)
6. **동의 수집 컴포넌트 상세**:
   - 전체 동의 + 개별 토글 구조
   - "필수"/"선택" 라벨 구분
   - 셰브론 접기/펼치기
   - 결과 프리뷰 (흐린 처리 예시 카드)
   - "분석에 꼭 필요한 정보만 수집해요" 안심 문구
7. **로딩 애니메이션 상세**:
   - 4단계 순차 전환 (🏘️입력분석→🚇통근계산→📊예산시뮬→🗺️단지탐색)
   - 각 단계 duration, 이징, 전환 효과
   - 완료 후 /results 라우팅 타이밍
8. **주소 검색 컴포넌트 상세** (ref_3-2 참고):
   - 전체 화면 검색 전환 (필드 탭 → 검색 오버레이)
   - 밑줄 입력 + brand-500 라벨 + "직장 주소를 검색해주세요" 플레이스홀더
   - 자동완성 결과 리스트 (건물명 Bold + 도로명주소 회색)
   - 빈 상태 "검색 결과가 없어요"
   - 선택 즉시 폼 반영 (상세주소 단계 없음)
   - 검색 API: Kakao Local API (키워드 검색)
9. **카드형 선택지 컴포넌트 상세** (ref_3-3 참고):
   - 이모지(48px) + 라벨(14px) 카드, neutral-100 배경, radius-xl
   - 미선택 / 선택 상태 (brand-50 배경 + brand-500 보더 + ✓ 배지)
   - 단일 선택 (주거형태 3개 수평) vs 복수 선택 (우선순위 4개 2×2 그리드)
   - 복수 선택 시 순서 넘버링 (①②③ 배지)
10. **프로그레스 인디케이터**: 스텝 간 진행 표시 UI
9. **상태 관리**: 5스텝 입력 데이터의 저장/복원 전략
10. **검증 체크리스트**: 구현 후 확인할 항목

### 디자인 원칙 (위반 금지)

- **색상/간격/타이포**: 반드시 `design-tokens.css`의 CSS Custom Property 사용
- **Tailwind 클래스**: `DESIGN_SYSTEM.md` §6.3의 패턴 준수
- **컴플라이언스**: `DESIGN_SYSTEM.md` §5의 금지 용어/표현 절대 사용 금지
  - "추천" → "분석 결과 안내"
  - "매물 추천" → "조건 맞춤 단지 탐색"
- **접근성**: 키패드 버튼 최소 터치 영역 44×44px
- **톤앤매너**: 타이틀은 "~알려주세요"/"~입력해주세요" (~세요체, 토스 레퍼런스)
- **Trust UI**: 소득/자산 입력 스텝에 Trust Badge(🔒) 필수 배치

### 레퍼런스 적용 규칙

`ref_3-1_onboarding_wizard_analysis.md`의 "Agent 전달용 요약" 섹션을 확인하고:
- **"가져올 것"** 항목 → 구현에 반영
  - 특히: 원 퀘스천 원 인풋, 금액 만원 변환, 동의 안심 프레이밍, 카카오 순차 체크리스트 로딩
- **"무시할 것"** 항목 → 절대 따라가지 않기
  - 특히: 챗봇 대화형, 60초 로딩, 시스템 키패드
- **"신규 인사이트"** 항목 → 플랜에 포함 여부 판단하여 근거와 함께 명시
  - 특히: 프로그레스 인디케이터 스타일, 예외 분기 버튼, 동의 화면 결과 프리뷰

`ref_3-2_address_search_analysis.md`에서:
- **"가져올 것"**: 전체 화면 검색 전환, 밑줄 입력+brand-500 라벨, 2계층 결과(자동제안+장소), 선택 즉시 반영
- **"무시할 것"**: 상세주소 입력(건물 단위), 지도 핀 표시, 카테고리 칩/5탭

`ref_3-3_card_selection_analysis.md`에서:
- **"가져올 것"**: 이모지(48px)+라벨 카드, neutral-100 배경+radius-xl, 중앙 정렬+넓은 여백
- **선택 상태**: 미선택=neutral-100 / 선택=brand-50 배경+brand-500 보더 2px+✓ 배지
- **복수 선택**: 4개일 때 2×2 그리드, 순서 중요 시 ①②③ 넘버 배지

### 기술 제약

- Next.js 16.x App Router (RSC + Client Component 구분 명시)
- React 19 + TypeScript strict
- Tailwind CSS v4 (`@theme` 토큰 사용)
- shadcn/ui 컴포넌트 활용 가능
- 주소 검색: Kakao 주소 API (Daum Postcode)
- 상태 관리: URL searchParams 또는 zustand (스텝 간 데이터 유지)
- 키패드: 커스텀 React 컴포넌트 (네이티브 키보드 미사용)
- 로딩 애니메이션: CSS transition + framer-motion (선택)
- 면책 문구: DESIGN_SYSTEM.md §5 컴플라이언스 5접점 중 "온보딩 시작" 접점 포함

## 기대 산출물

1. `/onboarding` 페이지의 **전체 플로우 + 컴포넌트 트리 + 파일 구조**
2. 각 스텝의 **화면 상세** (질문 텍스트, 입력 타입, 예외 분기, CTA 조건)
3. **금액 입력 컴포넌트** 구현 상세 (키패드 레이아웃, 단위 변환 로직)
4. **동의 수집 컴포넌트** 구현 상세 (전체/개별, 접기/펼치기, 프리뷰)
5. **주소 검색 컴포넌트** 구현 상세 (전체 화면 전환, 자동완성, 선택 즉시 반영)
6. **카드형 선택지 컴포넌트** 구현 상세 (이모지+라벨, 선택 상태, 단일/복수)
7. **로딩 애니메이션** 구현 상세 (4단계, 타이밍, 전환 효과)
8. **상태 관리 전략** (스텝 간 데이터 유지, 뒤로가기 복원)
9. **구현 순서** (단계별, 의존성 표시)
10. **검증 체크리스트** (디자인 토큰 준수, 컴플라이언스, 접근성, Trust UI)

플랜만 작성하고, 코드 구현은 하지 마. 플랜 승인 후 단계별로 구현할 거야.
```