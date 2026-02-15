# Ralph Loop 프롬프트: 디자인 시스템 쇼케이스 문서화 고도화

> **용도**: `/ralph-loop` 실행 시 입력할 프롬프트
> **목적**: 기존 비주얼 데모 수준의 쇼케이스를 **실제 디자인 시스템 문서 수준**으로 고도화
> **완료 조건**: DONE — 모든 검증 기준 통과 시

---

## 프롬프트 (아래 전체를 Ralph Loop에 입력)

```
디자인 시스템 쇼케이스를 실제 디자인 시스템 레퍼런스 문서 수준으로 고도화해줘.

═══════════════════════════════════════════════════════
SoT (정본) 참조 파일 — 반드시 먼저 읽을 것
═══════════════════════════════════════════════════════

1. docs/design-system/DESIGN_SYSTEM.md          — 컴포넌트 25종 + 토큰 + 페이지 패턴 SoT
2. docs/design-system/design-tokens.css          — 실제 CSS 토큰 구현체 (69 컬러 + semantic)
3. docs/design-system/showcase/showcase.css      — 쇼케이스 공통 CSS (여기에 새 클래스 추가)
4. docs/design-system/showcase/showcase.js       — 사이드바 + 다크모드 + 풀스크린 JS
5. docs/plan/2026-02-15_claude-code_phase1-design-system-scorecard.md — 4축 리서치 결정 스코어카드

═══════════════════════════════════════════════════════
작업 범위 — 3단계 순차 진행
═══════════════════════════════════════════════════════

## Phase A: 컴포넌트 문서 고도화 (comp-*.html 8개)

각 comp-*.html 파일의 모든 컴포넌트 섹션에 아래 구조를 추가:

### A-1. 컴포넌트별 필수 섹션 (이미 있는 비주얼 데모는 유지)

1. **설명** (Description)
   - DESIGN_SYSTEM.md 해당 §의 정의 그대로 인용
   - 한줄 요약 + 상세 설명

2. **사양 테이블** (Specs)
   - 크기(Size) / 색상(Color) / 간격(Spacing) / 애니메이션(Animation) 등
   - 디자인 토큰 변수명과 값을 테이블로 표시
   - 예: | 속성 | 토큰 | 값 | 비고 |

3. **변형 쇼케이스** (Variants) — 이미 있으면 보강
   - 크기 변형 (Mini/Card/Hero 등)
   - 상태 변형 (Default/Hover/Active/Disabled/Selected)
   - 등급 변형 (Score 5-grade 컬러 적용)
   - 다크모드 변형 — 토글 시 자동 적용되므로 "다크모드에서 확인하세요" 안내 추가

4. **사용 가이드라인** (Usage Guidelines)
   - ✅ Do (올바른 사용법 2-3개)
   - ❌ Don't (잘못된 사용법 2-3개)
   - 시각적 예시 포함 (올바른 예시 vs 잘못된 예시)

5. **접근성** (Accessibility)
   - WCAG AA 대비율 준수 여부
   - 키보드 접근성 노트
   - 스크린리더 aria 속성 가이드

6. **사용 페이지** (Used In)
   - 이 컴포넌트가 실제로 사용되는 page-*.html 링크 목록
   - 예: "Results 페이지, Detail 페이지에서 사용"

7. **컴플라이언스 노트** (해당 시에만)
   - Trust/Compliance 컴포넌트: 면책 문구 규칙, 금지 표현 매핑
   - Safety 관련: "빨간색 사용 금지" 등 DESIGN_SYSTEM.md §5 규칙

### A-2. 대상 파일별 컴포넌트 목록

| 파일 | 컴포넌트 | DESIGN_SYSTEM.md § |
|------|----------|-------------------|
| comp-score.html | CircularGauge, ScoreBar, ScoreBadge, RadarChart | §3.1 |
| comp-cards.html | PropertyCard, ComparisonCard, MiniPreviewCard, CardSelector | §3.2 |
| comp-nav.html | BottomNav, BottomSheet, CompareBar | §3.3 |
| comp-input.html | AmountInput, AddressSearch, StepWizard | §3.4 |
| comp-map.html | MapMarker, Clustering, Legend | §3.5 |
| comp-trust.html | TrustBadge, DataSourceTag, ExternalLinkCTA, ConsentForm, SafetySection | §3.6 |
| comp-feedback.html | Toast, Tooltip, Skeleton | §3.7 |
| comp-auxiliary.html | Button, Badge, Divider, SourceTag 등 보조 패턴 | 보조 |

### A-3. HTML 구조 패턴

각 컴포넌트 섹션은 이 패턴을 따른다:

```html
<!-- ComponentName -->
<div class="demo-card">
  <div class="demo-card-title">ComponentName <span class="tag">§X.Y</span></div>
  <p class="comp-desc">컴포넌트 한줄 설명</p>

  <!-- 기존 비주얼 데모 유지 -->
  <div class="demo-row">...</div>

  <!-- NEW: 사양 테이블 -->
  <div class="comp-specs">
    <div class="component-label">사양</div>
    <table class="spec-table">
      <thead><tr><th>속성</th><th>토큰</th><th>값</th><th>비고</th></tr></thead>
      <tbody>...</tbody>
    </table>
  </div>

  <!-- NEW: 사용 가이드라인 -->
  <div class="comp-guidelines">
    <div class="component-label">사용 가이드라인</div>
    <div class="guideline-grid">
      <div class="guideline-do">
        <div class="guideline-label do">✅ Do</div>
        <ul>...</ul>
      </div>
      <div class="guideline-dont">
        <div class="guideline-label dont">❌ Don't</div>
        <ul>...</ul>
      </div>
    </div>
  </div>

  <!-- NEW: 접근성 -->
  <div class="comp-a11y">
    <div class="component-label">접근성</div>
    <ul class="a11y-list">...</ul>
  </div>

  <!-- NEW: 사용 페이지 -->
  <div class="comp-used-in">
    <div class="component-label">사용 페이지</div>
    <div class="used-in-links">
      <a href="page-results.html" class="used-in-tag">Results</a>
      ...
    </div>
  </div>
</div>
```

## Phase B: 토큰 레퍼런스 고도화 (tokens.html)

현재 컬러 스와치 + 타이포 + 간격만 있음. 아래 추가:

1. **시멘틱 토큰 매핑 테이블**
   - Light / Dark 값 나란히 비교
   - 예: | 토큰명 | Light 값 | Dark 값 | 용도 |

2. **Score 5-Grade 팔레트**
   - 등급별 (A+/A/B/C/D) 사용 컨텍스트 설명
   - WCAG 대비율 표시
   - 색맹 시뮬레이션 안내 (스코어카드 리서치 결과 반영)

3. **Safety 3-Color 팔레트**
   - "빨간색 사용 금지" 규칙 강조
   - 충분(파랑)/보통(앰버)/부족(회색) + 사용 예시

4. **애니메이션 토큰 테이블**
   - 10개 인터랙션 (DESIGN_SYSTEM.md §2.5)
   - | 인터랙션 | 시간 | 이징 | CSS 예시 |

5. **그림자 시스템**
   - 5단계 그림자 비주얼 + 사용 컨텍스트
   - 예: sm(카드 기본) / md(카드 호버) / lg(모달) 등

6. **브레이크포인트**
   - xs/sm/md/lg/xl + 각 지점에서의 레이아웃 변화 설명

## Phase C: 인덱스 페이지 고도화 (index.html)

1. **디자인 원칙 7가지** (DESIGN_SYSTEM.md §1 인용)
   - 카드 형태로 원칙명 + 한줄 설명

2. **페이지 카운트 업데이트**
   - "6종" → "16종" (13개 페이지 + 3개 상태)

3. **빠른 시작 가이드**
   - 디자인 토큰 사용법 (CSS import + var() 사용)
   - 컴포넌트 조합 예시

4. **컴플라이언스 요약**
   - 면책 5-Point 체크리스트 시각화
   - 금지 표현 ↔ 허용 표현 매핑 테이블

5. **리서치 결정 요약**
   - 스코어카드에서 확정된 결정 사항 (Primary 유지, Accent 유지, Score 보정 등)
   - 각 결정에 대한 점수와 근거 한줄 요약

═══════════════════════════════════════════════════════
CSS 클래스 추가 (showcase.css에 새로 정의)
═══════════════════════════════════════════════════════

문서화 섹션을 위한 CSS 클래스를 showcase.css에 추가:

- .comp-desc: 컴포넌트 설명 텍스트
- .comp-specs, .spec-table: 사양 테이블
- .comp-guidelines, .guideline-grid, .guideline-do, .guideline-dont, .guideline-label: Do/Don't 가이드
- .comp-a11y, .a11y-list: 접근성 노트
- .comp-used-in, .used-in-links, .used-in-tag: 사용 페이지 링크
- .principle-card: 디자인 원칙 카드
- .compliance-table: 컴플라이언스 매핑 테이블
- .token-comparison: Light/Dark 비교 테이블
- .quick-start-code: 코드 스니펫 블록

스타일 원칙:
- 기존 showcase.css 토큰과 패턴을 따른다
- 다크모드 호환 필수 (var(--color-*) 사용)
- 모바일 반응형 고려

═══════════════════════════════════════════════════════
품질 기준 (DONE 판정 조건)
═══════════════════════════════════════════════════════

아래 모든 항목이 TRUE여야 DONE:

□ Phase A: 8개 comp-*.html 모든 컴포넌트에 7개 섹션(설명/사양/변형/가이드/접근성/사용페이지/컴플라이언스) 존재
□ Phase A: 사양 테이블의 토큰명이 design-tokens.css의 실제 변수명과 일치
□ Phase A: Do/Don't 가이드가 각 컴포넌트당 최소 Do 2개 + Don't 2개
□ Phase A: 사용 페이지 링크가 실제 존재하는 page-*.html 파일을 가리킴
□ Phase A: 컴플라이언스 노트가 Trust/Safety 컴포넌트에 존재 (DESIGN_SYSTEM.md §5 기반)
□ Phase B: tokens.html에 시멘틱 토큰 Light/Dark 비교 테이블 존재
□ Phase B: Score 5-Grade + Safety 3-Color 사용 컨텍스트 설명 존재
□ Phase B: 애니메이션 10개 토큰 테이블 존재
□ Phase C: index.html에 디자인 원칙 7가지 카드 존재
□ Phase C: 페이지 카운트가 "16종"으로 업데이트
□ Phase C: 컴플라이언스 5-Point 체크리스트 시각화 존재
□ Phase C: 리서치 결정 요약 (Primary/Accent/Score/Typography 각 결정 + 점수) 존재
□ 전체: showcase.css에 문서화 CSS 클래스 추가됨
□ 전체: 다크모드 토글 시 모든 신규 섹션 정상 표시
□ 전체: HTML 엔티티 없이 raw UTF-8 사용
□ 전체: 풀스크린 버튼 모든 파일에 존재

작업 순서:
1. SoT 파일 5개 읽기
2. showcase.css에 문서화 CSS 추가
3. comp-*.html 8개 순차 고도화 (comp-score → comp-cards → comp-nav → comp-input → comp-map → comp-trust → comp-feedback → comp-auxiliary)
4. tokens.html 고도화
5. index.html 고도화
6. 전체 검증 (품질 기준 체크리스트 전수 확인)

각 루프 반복마다: 이전 반복에서 수정한 파일을 읽고 미완성/품질 미달 부분을 찾아 개선한다.
완료 조건이 모두 충족되면 DONE을 출력한다.
```

---

## 사용법

```bash
# Claude Code에서 Ralph Loop 실행
/ralph-loop

# 프롬프트 입력 시 위 ``` 블록 안의 내용을 그대로 붙여넣기
# --max-iterations 15~20 권장
# --completion-promise DONE
```

## 예상 소요

- Phase A (8개 comp 파일): 반복 5~8회
- Phase B (tokens.html): 반복 1~2회
- Phase C (index.html): 반복 1~2회
- 검증 + 수정: 반복 2~3회
- **총 예상: 10~15 반복**

## 주의사항

1. **SoT 보호**: DESIGN_SYSTEM.md, design-tokens.css는 **읽기 전용**. 수정하지 않는다.
2. **기존 데모 유지**: 현재 비주얼 데모 HTML은 삭제하지 않고 아래에 문서 섹션을 추가한다.
3. **인코딩**: HTML 엔티티(&#x...) 사용 금지. 모든 텍스트는 raw UTF-8.
4. **page-*.html 수정 금지**: 페이지 쇼케이스는 이전 작업에서 완성됨. 이번 스코프 밖.
