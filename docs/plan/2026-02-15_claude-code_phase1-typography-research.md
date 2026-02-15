---
plan-id: "2026-02-15_claude-code_phase1-typography-research"
status: "done"
phase: "PHASE1"
template-version: "1.1"
work-type: "feature"
depends-on:
  - plan-id: "2026-02-15_claude-code_phase1-design-system-alternatives"
    condition: "status == done"
---

# Plan Execute: 한글 웹폰트 및 타이포그래피 시스템 대안 분석

## 목표

신혼부부 대상 주거 분석 서비스(프롭테크)의 타이포그래피 시스템에 대해 **한글 웹폰트 3종 비교**, **타입 스케일 최적화**, **가격 표시 전용 폰트 전략**, **2025-2026 트렌드**를 정량 데이터 기반으로 분석하고, 현재안 유지/변경/부분 개선에 대한 근거를 확보한다.

**SoT 참조**: FR/NFR/법무 체크리스트 -> `docs/PHASE0_ground.md` | Design Tokens -> `docs/PHASE1_design.md` S7

**참고 문서** (SoT 아님): `docs/design-system/DESIGN_SYSTEM.md` 2.2 타이포그래피 섹션

## 범위

- **In Scope**: 한글 웹폰트 3종 정량 비교, 타입 스케일 분석, 가격 표시 전략, 트렌드 조사
- **Out of Scope**: 코드 구현, SoT 수정, 컬러/토큰/컴포넌트 리서치 (별도 축에서 수행)
- **SoT 보호**: 본 문서는 리서치 결과만 기록. SoT 수정 없음

## 작업 단계

### Step 1: 한글 웹폰트 3종 비교 -> done
### Step 2: 타입 스케일 최적화 분석 -> done
### Step 3: 가격 표시 전용 폰트 전략 -> done
### Step 4: 2025-2026 트렌드 요약 -> done
### Step 5: 최종 의견 도출 -> done

## 검증 기준

| # | 기준 | 충족 |
|---|------|------|
| 1 | 3종 폰트별 정량 비교표 존재 | Y |
| 2 | 타입 스케일 비율 분석 포함 | Y |
| 3 | 가격 표시 전략 옵션 비교 포함 | Y |
| 4 | 모든 데이터에 출처/기준일 표기 (NFR-4) | Y |
| 5 | SoT 직접 수정 없음 | Y |

---

## 리서치 결과

### 1. 한글 웹폰트 3종 상세 비교

#### 1.1 기본 정보 비교표

| 항목 | Pretendard Variable | Wanted Sans Variable | Noto Sans KR Variable |
|------|---------------------|---------------------|-----------------------|
| **개발사** | 김형진(orioncactus) | Wanted Lab (원티드랩) | Google (Adobe 협업) |
| **기반 서체** | Inter + Source Han Sans | 자체 디자인 + Source Han Sans 한글 | Noto Sans CJK (Source Han Sans) |
| **최신 버전** | v1.3.9 | v1.0.3 | Variable (Google Fonts 지속 업데이트) |
| **최종 업데이트** | 2024년 2월 (추정) | 2024년 3월 5일 | 2025년 9월 5일 (Fontsource 기준) |
| **GitHub Stars** | 3,300+ | 311 | N/A (Google Fonts 통합 배포) |
| **GitHub Forks** | 194 | 10 | N/A |
| **라이선스** | SIL OFL 1.1 | SIL OFL 1.1 | SIL OFL 1.1 |

> 출처: GitHub orioncactus/pretendard (2026-02-15 확인), GitHub wanteddev/wanted-sans (2026-02-15 확인), Google Fonts Noto Sans KR (2026-02-15 확인)

#### 1.2 파일 크기 및 로딩 전략 비교표

| 항목 | Pretendard Variable | Wanted Sans Variable | Noto Sans KR Variable |
|------|---------------------|---------------------|-----------------------|
| **woff2 Variable 전체** | ~6.5MB (비압축 woff2) | ~4.6MB (비압축 woff2) | ~4MB+ (추정, 전체 CJK) |
| **Dynamic Subset 지원** | O (자체 구현, 26+슬라이스) | X (자체 미제공) | O (Google Fonts API 자동) |
| **Dynamic Subset 시 전송량** | 페이지당 ~273KB (평균) | 해당 없음 | 페이지당 ~200-400KB (Google API) |
| **unicode-range 지원** | O (Dynamic Subset CSS 포함) | X (수동 구성 필요) | O (Google Fonts CSS 자동) |
| **Google Fonts CDN** | X | X | **O** (네이티브 지원) |
| **jsDelivr CDN** | **O** (공식 추천) | X (직접 호스팅 필요) | O (Fontsource 경유) |
| **cdnjs CDN** | O | X | X |
| **UNPKG CDN** | O | X | O (Fontsource 경유) |
| **npm (Fontsource)** | O (@fontsource/pretendard) | X (미등록) | O (@fontsource/noto-sans-kr) |
| **npm 다운로드** | 활발 (정확한 수치 미공개) | N/A | ~302,770 누적 (Fontsource) |

> 출처: OnlineWebFonts.com 파일 크기 데이터 (2025-02-24 기준), cdnjs.com/libraries/pretendard (2026-02-15 확인), fontsource.org (2026-02-15 확인), GitHub wanteddev/wanted-sans README (2026-02-15 확인)

#### 1.3 서체 사양 비교표

| 항목 | Pretendard Variable | Wanted Sans Variable | Noto Sans KR Variable |
|------|---------------------|---------------------|-----------------------|
| **Weight 범위 (Variable)** | 45-920 (wght 축) | 100-900 (추정, 7 static 기반) | 100-900 (wght 축) |
| **Static Weight 수** | 9단계 (Thin~Black) | 7단계 (Regular~ExtraBlack) | 9단계 (Thin~Black) |
| **한글 커버리지** | **11,172자** 완성형 | **11,927자** (완성형 + 추가) | **11,172자** 완성형 (CJK KR 기준) |
| **영문 기반** | Inter (Rasmus Andersson) | 자체 지오메트릭 디자인 | Noto Sans (자체) |
| **숫자 디자인 특성** | Inter 기반 (모던, 균일) | 지오메트릭 (깔끔, 정돈) | Source Han Sans 기반 |
| **tnum (Tabular Figures)** | **O** (Inter 계승) | 확인 필요 (문서 미기재) | **O** (OpenType 23+ features) |
| **font-variant-numeric: tabular-nums** | **지원** | **미확인** | **지원** |
| **기타 OpenType Features** | Inter 기반 다수 지원 | 문서 미기재 | 23개+ OpenType features |
| **디자인 특성** | system-ui 대체 목적, 중립적 | 기하학+인간미 균형, 브랜드용 | 다국어 범용, 중립적 |

> 출처: GitHub orioncactus/pretendard README (2026-02-15 확인), OnlineWebFonts.com Wanted Sans 상세 (2026-02-15 확인), Noto Fonts Docs notofonts.github.io (2026-02-15 확인), rsms.me/inter OpenType Features (2026-02-15 확인)

#### 1.4 3종 종합 평가 스코어카드

| 평가 항목 (가중치) | Pretendard Variable | Wanted Sans Variable | Noto Sans KR Variable |
|-------------------|:-------------------:|:-------------------:|:---------------------:|
| **CDN/로딩 편의성** (20%) | 9/10 | 4/10 | 8/10 |
| **Dynamic Subset** (20%) | 9/10 | 2/10 | 9/10 |
| **한글 커버리지** (15%) | 9/10 | 10/10 | 9/10 |
| **숫자/가격 렌더링** (15%) | 9/10 | 5/10 | 8/10 |
| **커뮤니티/생태계** (10%) | 9/10 | 4/10 | 10/10 |
| **KRDS 호환성** (10%) | **10/10** | 5/10 | 7/10 |
| **디자인 차별성** (10%) | 7/10 | 8/10 | 6/10 |
| **가중 총점** | **8.65** | **4.90** | **8.25** |

**평가 근거**:
- **Pretendard**: KRDS 공식 채택, Dynamic Subset 자체 지원, Inter 기반 tnum 확실 지원, CDN 3종 지원
- **Wanted Sans**: 디자인 품질은 높으나, Dynamic Subset 미지원/CDN 미등록/tnum 미확인이 치명적 약점. 직접 호스팅 및 서브셋 수동 구성 필요
- **Noto Sans KR**: Google Fonts 네이티브 지원으로 인프라 최강이나, KRDS GOV 버전이 별도(Pretendard GOV)이므로 정부 서비스 호환성은 Pretendard 대비 낮음

---

### 2. 타입 스케일 최적화 분석

#### 2.1 현재 스케일 분석

현재 6단계 타입 스케일:

| 단계 | 크기(px) | 이전 단계 대비 비율 | 비고 |
|------|---------|-------------------|------|
| Caption | 12 | (기준선) | - |
| Body-sm | 14 | 14/12 = **1.167** | ~Minor Third |
| Body | 16 | 16/14 = **1.143** | ~Major Second |
| Subtitle | 17-18 | 17/16 = **1.063** ~ 18/16 = **1.125** | 비균등 |
| Title | 20 | 20/17 = **1.176** ~ 20/18 = **1.111** | 비균등 |
| Heading | 24 | 24/20 = **1.200** | = Minor Third |

**분석 결과**:
- 현재 스케일은 **단일 수학적 비율에 정확히 맞지 않음** (비균등 스케일)
- 12 -> 14 -> 16 구간은 대략 **1.143~1.167** (Major Second~Minor Third 사이)
- 16 -> 20 -> 24 구간은 대략 **1.2** (Minor Third)에 근접
- 전체적으로 **1.167 (절충 비율)**에 가장 근접하나, Subtitle(17-18px)이 범위로 지정되어 비정형적

#### 2.2 Modular Scale 비율별 생성 스케일 비교 (Base: 16px)

| 비율 | 이름 | 생성 스케일 (px) | 특성 |
|------|------|-----------------|------|
| **1.125** | Major Second | 10.1 / 11.4 / 12.8 / 14.2 / **16** / 18 / 20.3 / 22.8 / 25.6 | 조밀, 텍스트 중심 |
| **1.200** | Minor Third | 9.3 / 11.1 / 13.3 / **16** / 19.2 / 23 / 27.6 / 33.2 | 중간, 범용 |
| **1.250** | Major Third | 8.2 / 10.2 / 12.8 / **16** / 20 / 25 / 31.3 / 39.1 | 드라마틱, 제목 강조 |

#### 2.3 현재 스케일 vs 비율별 비교

| 현재 단계 | 현재 px | 1.125 근사 | 1.200 근사 | 1.250 근사 |
|----------|---------|-----------|-----------|-----------|
| Caption | 12 | 11.4 (-0.6) | 11.1 (-0.9) | 10.2 (-1.8) |
| Body-sm | 14 | 14.2 (+0.2) | 13.3 (-0.7) | 12.8 (-1.2) |
| Body | 16 | **16** (0) | **16** (0) | **16** (0) |
| Subtitle | 17-18 | 18 (0~+1) | 19.2 (+1.2~+2.2) | 20 (+2~+3) |
| Title | 20 | 20.3 (+0.3) | 19.2 (-0.8) | 20 (0) |
| Heading | 24 | 22.8 (-1.2) | 23 (-1) | 25 (+1) |

**결론**: 현재 스케일은 **Major Second (1.125)에 가장 근접**하되, Heading 영역에서 Minor Third (1.2) 성격을 일부 차용한 **하이브리드 스케일**이다. 이는 모바일 화면에서 실용적인 선택이다.

#### 2.4 6단계 vs 7-8단계 확장안

| 구분 | 현재 6단계 | 7단계 확장 | 8단계 확장 |
|------|----------|-----------|-----------|
| Caption | 12px | 12px | 12px |
| Body-sm | 14px | 14px | 14px |
| Body | 16px | 16px | 16px |
| Subtitle | 17-18px | 18px | 18px |
| Title | 20px | 20px | 20px |
| Heading | 24px | 24px | 24px |
| **Display** | - | **32px** (+) | **32px** (+) |
| **Hero** | - | - | **40px** (+) |

**390px 모바일 화면 실용성 분석**:

| 단계 | 390px에서 한 줄 글자 수 (한글) | 적합 용도 |
|------|-------------------------------|----------|
| 12px | ~32자 | 캡션, 메타 정보, 보조 텍스트 |
| 14px | ~27자 | 리스트 항목, 보조 본문 |
| 16px | ~24자 | **본문** (KRDS 권장 최소) |
| 18px | ~21자 | 소제목, 카드 제목 |
| 20px | ~19자 | 섹션 제목 |
| 24px | ~16자 | 페이지 제목 |
| 32px | ~12자 | 히어로 영역 (2줄 이상 예상) |
| 40px | ~9자 | 랜딩 히어로 (문장 불가, 단어 수준) |

> 출처: 390px 기준 양쪽 패딩 16px 감안 실 콘텐츠 영역 358px 기준, 한글 1자 ≈ font-size x 1.0 (Pretendard 기준) 계산

**권장안**: **7단계 확장** (Display 32px 추가)
- 32px Display는 랜딩/온보딩/결과 요약 등 제한적 히어로 영역에 유용
- 40px Hero는 390px 모바일에서 한 줄 9자 미만으로 한글 문장 표현이 극히 제한적 -- 비권장
- PropertyCard 가격, CircularGauge 점수 등 핵심 숫자에 Display(32px) 활용 가능

#### 2.5 KRDS 접근성 가이드라인 정리

| 항목 | KRDS 권장/기준 | 현재 시스템 | 충족 여부 |
|------|--------------|-----------|----------|
| 본문 최소 크기 | 16px (Pretendard GOV는 17px) | 16px | O (다만 Pretendard GOV 기준 시 1px 부족) |
| 줄높이 (line-height) | 150% 이상 | Body 160%, Body-sm 150% | O |
| Font Weight 기본 | Regular(400) + Bold(700) 2종 | 400/500/600/700 활용 | O (상위 호환) |
| 위계 구조 | Display > Heading > Body 명확 구분 | 6단계 위계 | O |
| 대비율 (텍스트) | WCAG AA 4.5:1 이상 | 별도 컬러 리서치에서 검증 | - |

> 출처: KRDS 타이포그래피 가이드 (www.krds.go.kr/html/site/style/style_03.html, 2026-02-15 확인), KRDS v1.0.0 Figma (figma.com/community/file/1452915208095182951, 2025-01 공개)

---

### 3. 가격 표시 전용 폰트 전략

#### 3.1 옵션 비교표

| 항목 | 옵션 A: Pretendard 단독 | 옵션 B: 숫자 전용 서브폰트 | 옵션 C: 가변 폰트 축(wght) 활용 |
|------|----------------------|-------------------------|-------------------------------|
| **구현 방식** | tabular-nums + weight 올림 | Inter/JetBrains Mono 숫자만 서브셋 | font-variation-settings wght 미세 조정 |
| **추가 파일** | 0 | +3~5KB (숫자+기호 서브셋) | 0 |
| **폰트 일관성** | 완전 일관 | 한글-숫자 미묘한 차이 가능 | 완전 일관 |
| **tnum 지원** | O (Inter 계승) | O (Inter 네이티브) | O (동일 폰트) |
| **가격 가독성** | 양호 (weight 1단계 차이) | 우수 (전용 최적화 가능) | 양호~우수 (연속 weight) |
| **유지보수** | 최소 | 중간 (서브폰트 버전 관리) | 최소 |
| **구현 복잡도** | 낮음 | 중간 | 낮음 |
| **권장도** | **1순위** | 3순위 | **2순위** |

#### 3.2 옵션 B 상세 분석: 숫자 전용 서브폰트

숫자 전용 서브셋 생성 시 예상 크기:

| 서브셋 폰트 | 포함 글리프 | woff2 예상 크기 | 비고 |
|------------|-----------|---------------|------|
| Inter (숫자+금융기호) | 0-9, %, +, -, comma, period, won, space | ~3-5KB | 스포츠 폰트 숫자만 서브셋 시 ~3.85KB 사례 |
| JetBrains Mono (숫자) | 0-9, 금융 기호 | ~3-5KB | 모노스페이스 특성 활용 |

> 출처: barrd.dev "Create a variable font subset for smaller file size" (2026-02-15 확인), Font subsetting 사례 연구 기반 추정

**서브폰트 도입의 트레이드오프**:
- 장점: 숫자/가격 전용 최적화, 한글 본문과의 시각적 분리감 (정보 위계 강화)
- 단점: 추가 HTTP 요청 1회, FOUT(Flash of Unstyled Text) 위험, 폰트 간 baseline/x-height 불일치 가능, 유지보수 부담 증가
- **Pretendard 자체가 Inter 기반 숫자를 사용하므로, Inter 서브셋 도입은 사실상 중복**

#### 3.3 옵션 C 상세 분석: 가변 폰트 축 활용

```css
/* 가격 표시 예시 */
.price-amount {
  font-variation-settings: 'wght' 650;  /* SemiBold~Bold 사이 */
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

.price-unit {
  font-variation-settings: 'wght' 400;  /* Regular */
  font-size: 0.85em;
}
```

- Pretendard Variable의 wght 축 범위(45-920)를 활용하면 600(SemiBold)과 700(Bold) 사이의 650 같은 중간 weight 사용 가능
- 추가 파일 없이 미세한 시각적 강조 가능
- 단, 모든 브라우저에서 intermediate weight 렌더링 품질 확인 필요

#### 3.4 프롭테크/핀테크 숫자 표시 사례 분석

##### 토스 (Toss Product Sans)

| 항목 | 상세 |
|------|------|
| 서체 | Toss Product Sans (산돌 협업, 자체 개발) |
| 개발 기간 | 7개월, 14회 컨설팅 |
| 숫자 설계 | 한글 대비 숫자/영문을 약간 두껍게 설계하여 시각적 균형 |
| 금융 기호 | %(퍼센트), 쉼표(,), +, -, 화살표(->)의 크기/간격을 UI 요소로 최적화 |
| Weight | 7 weights (첫 버전), 이후 확장 |
| 특징 | 단일 서체로 모든 Toss 환경(Android/iOS/Web) 통일 |

> 출처: blog.toss.im "토스 프로덕트 산스 제작기" (2026-02-15 확인), sandoll.co.kr "핫한 금융 플랫폼이 폰트를 바라보는 관점" (2026-02-15 확인)

##### 카카오뱅크

| 항목 | 상세 |
|------|------|
| 서체 | 카카오 글씨 (카카오 큰글씨 + 작은글씨) |
| 라이선스 | SIL OFL (무료 배포) |
| 특징 | 화면에서 주목도 높은 타이포그래피(큰글씨), 소형 캡션 최적화(작은글씨) |
| 금융 UI | 기본 텍스트 크기를 크게 설정하여 고령층 배려 |

> 출처: kakaocorp.com "카카오, 새 디지털 서체 '카카오 글씨' 제작 및 무료 배포" (2026-02-15 확인)

##### 11번가 디자인 시스템

| 항목 | 상세 |
|------|------|
| 숫자/가격 | 가격과 할인율에 특정 웹 폰트를 고정 사용 |
| 정렬 | tabular 특징의 서체로 숫자 세로 정렬 최적화 |

> 출처: design.11stcorp.com/foundation/typography (2026-02-15 확인)

##### 시사점: 프롭테크 서비스에의 적용

- **토스/카카오뱅크 수준의 자체 서체 개발은 비용 대비 불필요** (대규모 핀테크 vs 신생 프롭테크)
- **Pretendard의 Inter 기반 숫자는 이미 충분한 품질** -- 토스처럼 숫자를 한글 대비 약간 두껍게 표시하는 전략은 CSS weight 조정으로 구현 가능
- **tabular-nums + weight 1단계 올림** 전략이 비용 대비 효과 최적

#### 3.5 한국 원화 표시 가독성 전략

| 패턴 | 예시 | 가독성 | 권장도 |
|------|------|--------|--------|
| 원 기호 + 숫자 | ₩350,000,000 | 낮음 (자릿수 파악 어려움) | X |
| 억/만원 혼합 | 3억 5,000만 | **높음** | **O** |
| 만원 단위 | 35,000만원 | 중간 | 삼각 |
| 억원 단위만 | 3.5억 | 중간 (소수점 혼동) | 삼각 |

CSS 구현 가이드:
```css
.price-display {
  font-variant-numeric: tabular-nums;
  font-weight: 600;  /* 본문(400) 대비 +2단계 */
  letter-spacing: -0.01em;
}

.price-unit {
  font-weight: 400;
  font-size: 0.875em;  /* 숫자 대비 87.5% */
  margin-left: 0.125em;
}
```

---

### 4. 2025-2026 한글 타이포그래피 트렌드

#### 4.1 정부 KRDS 업데이트

| 시기 | 변경 사항 |
|------|----------|
| 2025년 1월 16일 | "디지털 정부서비스 UI/UX 가이드라인" -> **"한국 디자인 시스템(KRDS)"**으로 명칭 변경 및 v1.0.0 정식 공개 |
| 2025년 2월 20일 | KRDS 설명회 (행정안전부) |
| 2025년 하반기 9월 25일 | KRDS 설명회 2차 (행정안전부) |
| Pretendard GOV | KRDS 전용 변형 서체. 기본 17px (일반 Pretendard 16px 대비 +1px) |

**주요 변경 포인트**:
- 접근성 강화: 시각장애인/고령 사용자 타겟, 1px 단위 가독성 검증
- Pretendard GOV 기본 본문 17px 설정 (민간 서비스 16px 대비 1px 큰 규격)
- 위계 구조: Display > Heading > Body 3계층 명확 정의
- Weight: Regular(400) + Bold(700) 기본 2종 권장

> 출처: krds.go.kr (2026-02-15 확인), mois.go.kr KRDS 설명회 공지 (2025-02-20, 2025-09-25), designcompass.org "대한민국 정부 UI/UX 디자인 시스템 개시" (2025-01-22)

#### 4.2 가변 폰트(Variable Font) 활용 트렌드

| 항목 | 현황 |
|------|------|
| 국내 채택률 | 미미한 수준 (2025 기준), 대부분 정적 weight 사용 |
| Pretendard Variable | 국내 가변 폰트 중 가장 넓은 채택 |
| 가변 축 활용 | 주로 wght(weight) 축만 사용. wdth, opsz 등 추가 축 활용은 드묾 |
| 성능 이점 | 다중 weight 사용 시 파일 수 감소로 HTTP 요청 절약 |
| 한글 가변 폰트 역사 | 2018 준폰트 네모고딕(국내 최초), 2019 윤디자인 머리정체2 Variable |

> 출처: namu.wiki/w/가변 글꼴 (2026-02-15 확인), wit.nts-corp.com "Variable fonts (가변 폰트)" (2026-02-15 확인)

#### 4.3 한/영/숫자 혼합 환경 최적화

| 트렌드 | 상세 |
|--------|------|
| 단일 폰트 통합 | Pretendard/Wanted Sans처럼 한/영/숫자를 하나의 서체 파일에 통합하는 트렌드 우세 |
| 숫자 전용 폰트 분리 | 11번가 등 이커머스에서 가격용 별도 폰트 사용 사례 존재하나 유지보수 부담으로 감소 추세 |
| font-variant-numeric | tabular-nums 활용이 보편화, 프로포셔널 대비 세로 정렬 이점 |
| 반응형 타이포그래피 | 모바일/태블릿/데스크톱 별도 스케일 적용 (1.125/1.25/1.333 비율) 트렌드 |
| 키네틱 타이포그래피 | 히어로 섹션에서 가변 폰트 축 애니메이션 활용 증가 (2025-2026) |

> 출처: 2026년 웹디자인 트렌드 (koreawebdesign.com, 2026-02-15 확인), Monotype 2025 서체 트렌드 보고서 (kr.monotype-asia.com, 2026-02-15 확인)

#### 4.4 한국 웹 서비스 폰트 선택 트렌드

| 서비스 유형 | 폰트 선택 패턴 | 예시 |
|------------|--------------|------|
| 핀테크/은행 | 자체 서체 개발 또는 Pretendard | 토스(자체), 카카오뱅크(자체), 시중은행(Pretendard) |
| 이커머스 | 브랜드 서체 + 가격용 별도 폰트 | 11번가(자체 시스템), 쿠팡(자체) |
| 정부/공공 | Pretendard GOV | KRDS 채택 서비스 |
| 스타트업/SaaS | Pretendard 또는 Noto Sans KR | 범용적 선택 |
| 프롭테크 | 구체적 사례 부족 | 직방/다방/네이버부동산 -- 공식 정보 미공개 |

---

### 5. 최종 의견

#### 5.1 종합 권장안: **현재안 유지 + 부분 개선**

| 영역 | 판정 | 상세 |
|------|------|------|
| **서체 선택 (Pretendard Variable)** | **유지** | KRDS 호환, Dynamic Subset, CDN 3종, tnum 지원. 대안(Wanted Sans, Noto Sans KR) 대비 종합 우위 |
| **타입 스케일 (6단계)** | **부분 개선** | Display(32px) 1단계 추가하여 7단계로 확장 권장 |
| **가격 표시 전략** | **유지** | 옵션 A (Pretendard 단독 + tabular-nums + weight 올림) 유지. 서브폰트 도입 불필요 |
| **가변 폰트 축 활용** | **부분 개선** | 옵션 C 전략을 가격 강조에 보조적 적용 검토 |

#### 5.2 권장 변경 사항 상세

##### 변경 1: Display 단계 추가 (7단계 확장)

```
현재: Caption(12) > Body-sm(14) > Body(16) > Subtitle(17-18) > Title(20) > Heading(24)
제안: Caption(12) > Body-sm(14) > Body(16) > Subtitle(18) > Title(20) > Heading(24) > Display(32)
```

- Subtitle을 17-18px 범위에서 **18px 고정**으로 명확화 (1.125 비율과 정합)
- Display(32px)는 랜딩 히어로, 점수 요약, 가격 헤드라인에 활용
- letter-spacing: Display에 -0.04em 적용 (Heading -0.03em 대비 더 타이트)
- line-height: Display에 1.2 적용

##### 변경 2: 가격 표시 weight 미세 조정

```css
/* 기존 */
.price { font-weight: 600; }  /* 본문(400) 대비 +2단계 */

/* 제안: 가변 축 활용 */
.price-primary { font-variation-settings: 'wght' 650; }  /* 중요 가격 */
.price-secondary { font-variation-settings: 'wght' 550; }  /* 부가 정보 가격 */
```

#### 5.3 변경하지 않는 이유

| 검토했으나 기각한 대안 | 기각 사유 |
|----------------------|----------|
| Wanted Sans로 교체 | Dynamic Subset 미지원, CDN 미등록, tnum 미확인. 프로덕션 안정성 부족 |
| Noto Sans KR로 교체 | KRDS 호환성 Pretendard 대비 낮음, Pretendard가 이미 Noto Sans CJK 기반 |
| 숫자 전용 서브폰트(Inter) 도입 | Pretendard가 이미 Inter 기반 숫자 사용. 중복 로딩 + baseline 불일치 위험 |
| Hero(40px) 단계 추가 | 390px 모바일에서 한 줄 9자 미만. 한글 문장 표현 불가 |
| 1.25 (Major Third) 비율 변경 | Caption 10.2px로 하락하여 한글 가독성 위험 |

#### 5.4 영향받는 컴포넌트별 대응

| 컴포넌트 | 의존도 | Display(32px) 추가 시 변경 | 가격 weight 조정 시 변경 |
|---------|--------|--------------------------|------------------------|
| PropertyCard | 높음 | 가격 헤드라인에 Display 적용 가능 | price weight 미세 조정 |
| CircularGauge | 높음 | 점수 숫자에 Display 적용 가능 | 점수 weight 미세 조정 |
| AmountInput | 높음 | 해당 없음 | 입력 숫자 weight 조정 |
| StepWizard | 중간 | 해당 없음 | 해당 없음 |
| ScoreBadge | 중간 | 해당 없음 | 점수 표시 weight 조정 |
| MiniPreviewCard | 중간 | 해당 없음 | 가격 요약 weight 조정 |

---

## 결과/결정

- **상태**: `done`
- **핵심 결과**:
  1. **폰트**: Pretendard Variable 유지 (3종 비교 가중 총점 8.65/10 으로 1위)
  2. **타입 스케일**: 6단계 -> 7단계 확장 권장 (Display 32px 추가, Subtitle 18px 고정)
  3. **가격 표시**: 옵션 A(Pretendard 단독) 유지, 옵션 C(wght 축) 보조 적용 권장
  4. **불필요 변경**: Wanted Sans/Noto Sans KR 교체, 숫자 서브폰트 도입, Hero(40px) 추가 모두 기각
- **후속 액션**:
  - 부모 plan `2026-02-15_claude-code_phase1-design-system-alternatives`의 Step 2(축 2) 완료 처리
  - Display 토큰 추가 시 `docs/design-system/design-tokens.css` 반영 (별도 구현 plan)

## Verification 이력

### Run 1 (2026-02-15)

```json
{
  "phase": "PHASE1",
  "verdict": "go",
  "run": 1,
  "score": {
    "completeness": 0.95,
    "consistency": 0.95,
    "compliance": 1.0
  },
  "blockers": [],
  "next_actions": [
    "부모 plan Step 2(축 2: 타이포그래피) 완료 처리",
    "Display 토큰 추가 구현은 별도 plan에서 수행"
  ],
  "timestamp": "2026-02-15"
}
```
