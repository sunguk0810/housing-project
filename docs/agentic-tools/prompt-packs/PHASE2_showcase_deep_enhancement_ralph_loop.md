# Ralph Loop 프롬프트: 디자인 시스템 쇼케이스 심층 고도화 (step4/5/6 JSX 반영)

> **용도**: `/ralph-loop` 실행 시 입력할 프롬프트
> **목적**: 3개 JSX 레퍼런스(step4 온보딩, step5 결과화면, step6 컴플라이언스)의 심층 패턴을 기존 쇼케이스 comp-*.html + page-*.html에 반영하고, patterns.html 신규 생성
> **완료 조건**: DONE — 모든 검증 기준 통과 시
> **예상 반복**: 12~20회

---

## 프롬프트 (아래 전체를 Ralph Loop에 입력)

```
디자인 시스템 쇼케이스를 JSX 레퍼런스 수준으로 심층 고도화해줘. 컴포넌트 페이지 + 페이지 쇼케이스 + 패턴 문서 전부 다 해줘.

═══════════════════════════════════════════════════════
SoT (정본) — 반드시 먼저 읽을 것
═══════════════════════════════════════════════════════

1. docs/design-system/DESIGN_SYSTEM.md                — 컴포넌트 25종 + 토큰 + 페이지 패턴 SoT
2. docs/design-system/design-tokens.css                — 실제 CSS 토큰 (69 컬러 + semantic)
3. docs/design-system/showcase/showcase.css            — 쇼케이스 공통 CSS
4. docs/design-system/showcase/showcase.js             — 사이드바 + 다크모드 + 풀스크린 JS

═══════════════════════════════════════════════════════
JSX 레퍼런스 (읽기 전용, 절대 수정 금지)
═══════════════════════════════════════════════════════

5. docs/legacy_docs/references/design_research/step4_onboarding_guide.jsx  (1,999줄)
6. docs/legacy_docs/references/design_research/step5_result_guide.jsx      (1,696줄)
7. docs/legacy_docs/references/design_research/step6_compliance_ux_guide.jsx (1,109줄)

이 3개 JSX 파일에서 추출할 핵심 패턴:
- step4: ExitIntentOverlay, AnalysisLoadingScreen, WhyTooltip, formatKoreanAmount, ConsentScreen, "외벌이" 스킵
- step5: ScoreBar 요인 아코디언, AnimatedNumber, PropertyCard hover/compare 상태, 점수 시각화 비교 프레임워크
- step6: 금지문구 15건 전체 매핑, ExternalCTA 3패턴(A/B/C), SafetySection Good/Bad 비교, 동의 플로우 4단계, 면책 5-Point 배치 전략

═══════════════════════════════════════════════════════
작업 범위 — 4단계 순차 진행 (총 12파일, ~1,430줄)
═══════════════════════════════════════════════════════

## 0단계: 인프라 (showcase.css + showcase.js)

### showcase.css에 추가할 클래스:
- `.factor-accordion` — ScoreBar ⓘ 클릭 시 열리는 요인 분해 패널
- `.factor-item` — 요인별 +/- 델타 행 (양수: brand-500, 음수: accent)
- `.good-bad-grid` — 좌(올바른 표현) vs 우(금지 표현) 2열 비교
- `.good-bad-do`, `.good-bad-dont` — Good/Bad 각 열 스타일
- `.exit-overlay` — ExitIntentOverlay 바텀시트 스타일
- `.analysis-loading` — Conic-gradient 원형 프로그레스
- `.why-tooltip` — "왜 이 정보가 필요한가요?" 전용 툴팁 (기존 tooltip과 구분)
- `.pattern-tabs` — patterns.html 탭 UI
- `.disclaimer-tone-badge` — 면책 톤 레벨 배지 (소프트/중립/컨텍스트/명시적/법률)
- `.safety-bar-track`, `.safety-bar-fill` — SafetySection 수평 진행률 바
- `.compare-active` — PropertyCard "비교중" 상태
- `.korean-amount` — 한글 금액 표시 텍스트

스타일 원칙:
- 기존 showcase.css 토큰과 패턴을 따른다
- 다크모드 호환 필수 (.dark 셀렉터 추가)
- Safety 색상: 충분=#1976D2, 보통=#FFC107, 부족=#757575 (빨강 절대 금지)

### showcase.js에 추가할 함수:
- `toggleFactorAccordion(id)` — 아코디언 토글
- `NAV_SECTIONS`에 'Patterns' 섹션 추가: { label: 'Patterns', href: 'patterns.html' }
- `ITEM_LABELS`에 'Patterns': '패턴 가이드' 추가

## 1단계: 컴포넌트 고도화 (Phase A + B)

### A1. comp-trust.html (현재 495줄 → 약 +200줄)

SafetySection 데모 안에:
1. 진행률 바 추가: 각 지표(CCTV/가로등/경찰서/비상벨)마다 수평 바 + 실제값/서울시평균 비교
   - CCTV: 78% (충분, #1976D2), 가로등: 55% (보통, #FFC107), 경찰서: 35% (부족, #757575), 비상벨: 82% (충분, #1976D2)
2. Good/Bad 비교 패널: `.good-bad-grid` 사용
   - 좌(Do): "안전 편의시설 현황", "CCTV·가로등 보강 여지", "서울시 평균 대비 상위"
   - 우(Don't): "위험 지역", "범죄율 높음", "치안 열악", "D등급"

금지 문구 매핑 섹션:
3. 6건 → 15건 확장. 4개 카테고리로 분리:
   - **핵심 (4건)**: 추천→분석 결과 안내, 알선→정보 연결, 중개→정보 분석, 매물 추천→조건 맞춤 단지 탐색
   - **CTA (4건)**: 매물 문의→외부 매물 보러가기 ↗, 바로 연결→외부 페이지로 이동, 상담 신청→(사용 금지), 중개사 연결→(사용 금지)
   - **금융 (4건)**: 대출 가능 보장→예상 대출 범위(참고용), 투자 수익 보장→과거 실거래가 변동 추이, 최적 투자→(사용 금지), 거래 성사 보장→(사용 금지)
   - **치안 (3건)**: 가장 안전한 지역→안전 인프라 상위(수도권 기준), 범죄율 높음→안전 편의시설 현황, 위험 지역/치안 열악→CCTV·가로등 보강 여지
   - 각 행에 **법적 사유** 열 추가 (예: "공인중개사법 제2조", "금융소비자보호법")

ExternalLinkCTA 섹션:
4. Pattern A (인라인): 현재 것 유지 + "Pattern A: 인라인" 라벨
5. Pattern B (복수 플랫폼): 네이버 부동산 / 직방 / 다방 3개 버튼 나란히
6. Pattern C (금지 예시): 취소선으로 "매물 문의하기", "상담 신청", "중개사 연결" 표시

운영 규칙 섹션 추가:
7. 새 demo-card: "운영 규칙" — PR/디자인 리뷰 시 금지 용어 자동 검사 + 분기 1회 UI 텍스트 감사

### A2. comp-score.html (현재 521줄 → 약 +120줄)

ScoreBar 데모 안에:
1. ⓘ 아코디언 데모: "예산 적합도 92" 옆에 ⓘ 버튼 → 클릭 시 `.factor-accordion` 열림
   - 요인: PIR(가격/소득) +15, DTI(부채비율) -8, 보유현금 +12, 매매가 트렌드 +5
   - 각 요인은 양수(brand-500)/음수(accent) 색상으로 구분

새 demo-card: "점수 시각화 비교 평가"
2. 4가지 방식을 평가 테이블로 비교:
   | 방식 | 장점 | 단점 | 판정 |
   | Bar | 공간 효율, 비교 용이 | 단일 수치만 | 권장 |
   | Radar | 형태 패턴 직관적 | 3개 이하 축 왜곡 | 비교 전용 |
   | Gauge+Bar | 종합+세부 동시 | 정보 밀도 높음 | 최적 조합 |
   | Badge | 간결 | 깊이 부족 | 보조 |

CircularGauge 사양 보강:
3. AnimatedNumber 노트: "카운트업 0→N, 800ms, easeOutExpo. requestAnimationFrame 기반."

### A3. comp-input.html (현재 406줄 → 약 +80줄)

AmountInput 데모 안에:
1. 한글 변환 표시: 입력 필드 바로 아래에 "7,500만원 = 7천 5백만원" 스타일 `.korean-amount`
2. WhyTooltip: 라벨 "합산 연봉" 옆에 "? 왜 필요한가요?" → 클릭 시 ".why-tooltip" 표시: "소득 대비 적정 주거비 비율(PIR)을 계산하기 위해 필요합니다. 입력 후 즉시 삭제됩니다."
3. 초기화 버튼: 빠른 입력 버튼 행 끝에 "↺ 초기화" outline 버튼

AddressSearch 데모 안에:
4. 선택 확정 상태: 자동완성 대신 선택된 주소를 칩으로 표시 "삼성역 ✕" (brand-50 bg, brand-200 border)
5. 외벌이 스킵: 직장 2 아래에 체크박스 "☐ 외벌이예요 (배우자 직장 없음)" → 체크 시 직장 2 필드 비활성

### A4. comp-cards.html (현재 438줄 → 약 +60줄)

PropertyCard 섹션에:
1. hover 상태 시각적 데모: "Default" vs "Hover" 나란히 표시. Hover: translateY(-2px) + shadow-md + border-color brand-200
2. compare-active 상태: accent(#F97316) border + "✓ 비교중" primary 버튼 변형. 사양 테이블에 추가.

### B1. comp-feedback.html (현재 347줄 → 약 +180줄)

Skeleton 아래에 3개 새 demo-card 추가:

ExitIntentOverlay:
- 시각 데모: 반투명 오버레이 + 바텀시트 스타일 카드 + "잠깐! 지금 나가면 입력한 정보가 사라져요" + "기본 분석 결과 보기" CTA + "나가기" 텍스트 링크
- 사양: step >= 2 조건부 표시, 배경 rgba(0,0,0,0.5), 바텀시트 radius-xl, CTA primary
- Do: 매몰비용 프레이밍("이미 N단계 완료"), step 1에서는 미표시
- Don't: 강제적 인터스티셜 금지, 닫기 버튼 숨기기 금지
- 접근성: role="alertdialog", aria-modal="true", 포커스 트랩
- 사용 페이지: page-onboarding.html

AnalysisLoadingScreen:
- 시각 데모: Conic-gradient 원형 프로그레스 (75% 상태) + 중앙 "75%" 텍스트 + 아래에 4단계 메시지 (💰→🚇→🛡️→✨) 중 3개 체크 표시
- 사양: conic-gradient(brand-500 0% N%, neutral-200 N% 100%), 프로그레스 원 80px, 메시지 4단계 순차 fade-in (800ms 간격)
- Do: 각 단계에 구체적 설명("DSR 한도 계산 중"), 완료 시 "결과 보기" CTA 자동 표시
- Don't: 스피너만 단독 사용 금지, 진행률 없이 "분석 중" 텍스트만 표시 금지
- 접근성: aria-live="assertive", 진행률 aria-valuenow
- 사용 페이지: page-onboarding.html (Step 5)

WhyTooltip:
- 시각 데모: "합산 연봉" 라벨 + "? 왜 필요한가요?" 링크 → 클릭 시 다크 툴팁 표시
- 기존 Tooltip과 차이: 트리거가 ⓘ 아이콘이 아닌 텍스트 링크, 신뢰 구축 목적
- 사양: 트리거 font-size 12px brand-500 underline, 툴팁 neutral-900 bg
- Do: 민감한 금융 입력 필드마다 배치, 1줄 이내 답변
- Don't: 불필요한 필드(주거형태 등)에 사용 금지
- 사용 페이지: page-onboarding.html (Step 3, 4)

## 2단계: 페이지 쇼케이스 고도화 (Phase D)

### D1. page-onboarding.html (현재 345줄 → 약 +150줄)

탭 추가:
1. "Step 0" 탭을 맨 앞에 추가. showObStep(0) 핸들러.

Step 0 동의 화면:
2. obStep0 div 추가: 타이틀 "시작하기 전에", 부제 "분석에 필요한 동의를 받아요"
3. ConsentForm 인라인: [필수] 개인정보 + [필수] 위치정보 + [선택] 정밀 분석
4. CTA "동의하고 시작하기" — 필수 미체크 시 btn-disabled
5. TrustBadge Full: "입력 정보는 분석 후 즉시 삭제됩니다"

Step 2 외벌이 스킵:
6. 직장 2 아래에 체크박스: "☐ 외벌이예요 (배우자 직장 없음)"

Step 3 WhyTooltip + 한글 금액:
7. "부부 합산 연봉" 옆에 "? 왜 필요한가요?" 링크 + 다크 툴팁
8. 입력값 "7,000" 아래에 <div class="korean-amount">7천만원</div>

Step 5 분석 로딩 고도화:
9. 기존 선형 프로그레스 → Conic-gradient 원형 프로그레스로 교체
10. 퍼센티지 카운트업 숫자 표시
11. 100% 도달 시 "결과 보기 →" CTA 버튼 표시

JS 업데이트:
12. showObStep에 step=0 처리 추가
13. updateProgress에 step=0 처리 (프로그레스 바 0/4 상태)

### D2. page-results.html (현재 138줄 → 약 +100줄)

3번째 카드:
1. 더샵 센트럴: score 70 (B 등급), gauge #B0BEC5, 경기도 하남시 · 850세대 · 74㎡, 전세 3억 5,000만

카드별 통근 시간:
2. 카드 1 하단: 🚇 직장1 42분 · 직장2 58분
3. 카드 2 하단: 🚇 직장1 35분 · 직장2 52분
4. 카드 3 하단: 🚇 직장1 55분 · 직장2 48분

비교 버튼:
5. 각 카드 하단에 <button class="btn btn-outline">비교 추가</button>
6. 카드 1은 "✓ 비교중" 상태 (btn-primary, compare-active border)

면책 문구:
7. 카드 리스트 아래: "공공데이터 기반 참고용 분석이며 실거래를 보장하지 않습니다" (11px, muted)

더보기:
8. 마지막 카드 아래: "↓ 더 많은 단지 보기" (center, brand-500, cursor:pointer)

### D3. page-detail.html (현재 172줄 → 약 +120줄)

ScoreBar ⓘ 아코디언:
1. 각 카테고리 바의 라벨 옆에 ⓘ 트리거
2. 예산 적합도 클릭 시: factor-accordion 열림 → PIR +15 / DTI -8 / 보유현금 +12 / 트렌드 +5

보육 환경 그리드:
3. 통근 섹션 아래에 새 섹션 "보육 환경"
4. 3항목 그리드: 어린이집 반경1km 12개소 / 유치원 반경1km 5개소 / 소아과 반경1km 3개소
5. 출처 태그: 🏫 사회보장정보원 보육시설 · 📅 2025.12

SafetySection 진행률 바:
6. 텍스트만 → 각 지표에 수평 바 추가
   - CCTV: 78% bar (#1976D2) + "서울시 평균 대비 상위"
   - 가로등: 55% bar (#FFC107) + "보통 수준"
   - 경찰서: 35% bar (#757575) + "다소 먼 편"
   - 비상벨: 82% bar (#1976D2) + "수도권 상위 20%"

외부 링크 면책 모달:
7. externalModal div 추가 (comp-trust.html과 동일 패턴)
8. CTA 버튼에 onclick="openModal('externalModal')" 연결

하단 면책 문구:
9. Bottom Nav 위에: "본 서비스는 공공데이터 기반 정보 분석 플랫폼이며 부동산 중개 서비스가 아닙니다" (11px, center, muted)

## 3단계: 패턴 문서 (Phase C)

### patterns.html (신규 파일, 약 300줄)

표준 쇼케이스 구조 (showcase-layout, header, sidebar, content, fullscreen button, showcase.js 로드).

섹션 1: 동의 플로우 4단계 워크스루
- demo-card 1개, 내부에 4단계 타임라인:
  1. Landing (Value-First): "3개 입력만으로 맞춤 분석" — 가치를 먼저 전달
  2. Input (Inline Consent): "입력 시작 전 동의 수집" — 별도 페이지 아닌 인라인
  3. Flow (Progressive Disclosure): "선택 동의로 정밀도 향상" — 단계적 권한 확장
  4. Post-result (Progressive Commitment): "결과 확인 후 추가 동의" — 가치 체험 후 커밋

섹션 2: 면책 5-Point 배치 전략
- demo-card 1개, 5개 톤 레벨을 disclaimer-tone-badge로 표시:
  1. 소프트 (랜딩 푸터): "본 서비스는 공공데이터 기반 정보 분석 플랫폼입니다"
  2. 중립 (입력 시작): "입력 정보는 분석 목적으로만 사용되며 거래 연결에 사용되지 않습니다"
  3. 컨텍스트 (결과 상단): [📊 공공데이터 기반 분석 결과] [기준일] [참고용 정보]
  4. 명시적 (외부 링크 모달): "본 서비스는 정보 분석 플랫폼이며 부동산 중개 서비스가 아닙니다"
  5. 법률 (이용약관): 제2조 서비스 성격 정의 (공인중개사법 제2조 인용)

섹션 3: 온보딩 설계 근거
- demo-card 1개:
  - "원 퀘스천 퍼 스크린" 원칙 설명
  - 스텝 순서 전략: Step 1(가벼운 선택) → Step 2(주소 = 모멘텀) → Step 3-4(금융 = 매몰비용)
  - 소요 시간 목표: ~2분 30초

### 인프라 마무리

showcase.js:
- NAV_SECTIONS에 Components 다음에 { title: 'Patterns', items: [{ label: 'Patterns', href: 'patterns.html' }] } 추가
- ITEM_LABELS에 'Patterns': '패턴 가이드' 추가

index.html:
- Patterns 링크 카드 추가 (📋 아이콘)
- 컴포넌트 수 "25종" → "28종" (ExitIntentOverlay + AnalysisLoading + WhyTooltip 추가)

═══════════════════════════════════════════════════════
컴플라이언스 규칙 (위반 시 즉시 수정)
═══════════════════════════════════════════════════════

1. 금지 문구: "추천", "알선", "중개", "매물 추천", "대출 가능 보장", "거래 성사 보장", "투자 수익 보장", "가장 안전한 지역 확정", "최적 투자 확정" → 절대 생성 금지
2. Safety 색상: 빨간색(#FF0000, #E53E3E, #DC2626 등 빨강 계열) 절대 사용 금지. 부족=#757575(진회색)만 허용
3. 외부 링크: 면책 모달 필수 (openModal 패턴)
4. 데이터 출처: 모든 데이터 표시에 출처 + 기준일 태그 필수
5. "추천" 단독 사용 금지 → "분석 결과" 또는 "안내"로 대체

═══════════════════════════════════════════════════════
품질 기준 (DONE 판정 조건)
═══════════════════════════════════════════════════════

아래 모든 항목이 TRUE여야 DONE:

Phase A (컴포넌트):
□ comp-trust.html: SafetySection에 진행률 바 4개 + Good/Bad 비교 패널 존재
□ comp-trust.html: 금지 문구 매핑 15건 (4카테고리 + 법적 사유 열) 존재
□ comp-trust.html: ExternalLinkCTA Pattern A/B/C 3종 존재
□ comp-score.html: ScoreBar 아코디언 데모 (ⓘ 클릭 → 요인 분해) 존재
□ comp-score.html: 점수 시각화 비교 평가 테이블 존재
□ comp-input.html: AmountInput 한글 금액 + WhyTooltip + 초기화 버튼 존재
□ comp-input.html: AddressSearch 선택 칩 + 외벌이 스킵 존재
□ comp-cards.html: PropertyCard hover + compare-active 상태 데모 존재

Phase B (새 컴포넌트):
□ comp-feedback.html: ExitIntentOverlay demo-card (프리뷰+사양+Do/Don't+접근성+사용페이지) 존재
□ comp-feedback.html: AnalysisLoadingScreen demo-card 존재
□ comp-feedback.html: WhyTooltip demo-card 존재

Phase C (패턴):
□ patterns.html 신규 파일 존재
□ patterns.html: 동의 플로우 4단계 워크스루 존재
□ patterns.html: 면책 5-Point 배치 전략 존재
□ patterns.html: 온보딩 설계 근거 존재
□ showcase.js: NAV_SECTIONS에 Patterns 섹션 존재
□ index.html: Patterns 링크 카드 존재

Phase D (페이지):
□ page-onboarding.html: Step 0 동의 화면 (ConsentForm + TrustBadge) 존재
□ page-onboarding.html: Step 3 WhyTooltip + 한글 금액 표시 존재
□ page-onboarding.html: Step 2 외벌이 스킵 체크박스 존재
□ page-onboarding.html: Step 5 원형 프로그레스 + 완료 CTA 존재
□ page-results.html: PropertyCard 3개 이상 존재
□ page-results.html: 각 카드에 통근 시간 + 비교 추가 버튼 존재
□ page-results.html: 하단 면책 문구 존재
□ page-detail.html: ScoreBar ⓘ 아코디언 (클릭 시 요인 분해) 존재
□ page-detail.html: 보육 환경 그리드 섹션 존재
□ page-detail.html: SafetySection 진행률 바 존재
□ page-detail.html: 외부 링크 면책 모달 존재

인프라:
□ showcase.css: factor-accordion, good-bad-grid, exit-overlay, analysis-loading, why-tooltip, safety-bar 클래스 존재
□ 다크모드 토글 시 모든 신규 섹션 정상 표시 (var(--color-*) 사용)
□ 하드코딩 색상 최소화 (Safety 3-Color는 예외 허용)
□ 모든 파일에 fullscreen 버튼 존재
□ 모든 새 demo-card에 6개 필수 섹션 구조 준수 (신뢰/컴플라이언스 관련만)

═══════════════════════════════════════════════════════
실행 순서
═══════════════════════════════════════════════════════

1. SoT 파일 + JSX 레퍼런스 파일 읽기
2. showcase.css + showcase.js 인프라 업데이트
3. comp-trust → comp-score → comp-input → comp-cards → comp-feedback (Phase A+B)
4. page-detail → page-results → page-onboarding (Phase D)
5. patterns.html 신규 생성 (Phase C1)
6. index.html 업데이트 (Phase C2)
7. 전체 검증 (품질 기준 체크리스트 전수 확인)

각 루프 반복마다: 이전 반복에서 수정한 파일을 읽고 미완성/품질 미달 부분을 찾아 개선한다.
완료 조건이 모두 충족되면 DONE을 출력한다.
```

---

## 사용법

```bash
# Claude Code에서 Ralph Loop 실행
/ralph-loop

# 프롬프트 입력 시 위 ``` 블록 안의 내용을 그대로 붙여넣기
# --max-iterations 20 권장
# --completion-promise DONE
```

## 예상 소요

- 0단계 인프라: 반복 1~2회
- Phase A+B (5개 comp 파일): 반복 4~6회
- Phase D (3개 page 파일): 반복 3~5회
- Phase C (patterns.html + index): 반복 2~3회
- 검증 + 수정: 반복 2~4회
- **총 예상: 12~20 반복**

## 이전 프롬프트 팩과의 관계

| 프롬프트 팩 | 범위 | 상태 |
|-------------|------|------|
| `PHASE2_showcase_documentation_ralph_loop.md` | comp-*.html 문서화 (7개 섹션 추가) | 완료 |
| **이 팩** (`PHASE2_showcase_deep_enhancement_ralph_loop.md`) | JSX 레퍼런스 심층 반영 + page-*.html + patterns.html | **신규** |

## 주의사항

1. **SoT 보호**: DESIGN_SYSTEM.md, design-tokens.css, legacy_docs/ 는 **읽기 전용**. 수정 금지.
2. **기존 데모 유지**: 현재 비주얼 데모 HTML은 삭제하지 않고 확장/보강한다.
3. **인코딩**: HTML 엔티티(&#x...) 사용 금지. 모든 텍스트는 raw UTF-8.
4. **컴플라이언스**: 금지 문구 목록의 표현을 UI 텍스트로 생성하지 않음 (취소선 표시용은 예외).
5. **Safety 색상**: 빨간색 계열 절대 사용 금지. 부족 상태는 반드시 #757575(진회색).
