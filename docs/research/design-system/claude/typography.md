# 한글 웹폰트·타이포그래피 시스템 대안 분석

**현재 Pretendard Variable + 6단계 Type Scale 조합은 유지하되, 가격 표시 전용 weight 미세 조정과 Display 32px 1단계 확장이 최적의 개선안이다.** 세 한글 웹폰트 모두 본고딕(Source Han Sans)을 공유해 한글 품질 차이가 미미하며, Pretendard의 Inter 기반 숫자 렌더링과 `tabular-nums` 지원이 가격 중심 프롭테크 서비스에 가장 적합하다. KRDS v1(2025년 1월 공식 출시)이 Pretendard GOV를 표준 서체로 채택한 점도 현재 선택의 정당성을 뒷받침한다. 다만 390px 모바일 화면에서 6단계만으로는 프로모션·히어로 영역의 시각 위계가 부족하므로, **Display 32px를 선택적 7번째 단계로 추가**하는 '6+1' 구조를 권장한다.

---

## 1. 한글 웹폰트 3종 정량 비교

세 폰트 모두 SIL OFL 1.1 라이선스이며 완성형 한글 11,172자를 완전 지원한다. 핵심 차이는 CDN 인프라와 Variable 축 범위에 있다.

| 항목 | Pretendard Variable v1.3.9 | Wanted Sans Variable v1.0.1 | Noto Sans KR Variable |
|---|---|---|---|
| **Variable woff2 단일 파일** | ~2.0–2.5 MB (추정) | ~1.5–2.0 MB (추정) | ~2–4 MB (Google API는 단일 파일 미제공) |
| **Static woff2 1weight** | ~700–814 KB (full) / ~273 KB (KS X 1001) | ~650–750 KB (추정) | ~350–500 KB (Google API 자동 최적화) |
| **Dynamic Subset** | ✅ 92개 chunk (unicode-range) | ✅ split webfonts (jsDelivr) | ✅ ~119개 chunk (Google Fonts API) |
| **Weight 축 범위** | **45–920** (연속) | ~100–900+ (ExtraBlack 포함) | 100–900 |
| **Static weight 단계** | 9단계 (100–900) | 7단계 (Regular–ExtraBlack) | 9단계 (100–900) |
| **한글 커버리지** | 완성형 11,172자 전체 | 11,172자+ (총 11,927자) | 11,172자 + 옛한글 지원 |
| **tabular-nums (tnum)** | ✅ Inter 계승 | ✅ OT feature 풍부 | ✅ 지원 |
| **₩ 원화 기호** | ✅ U+20A9 포함 | ✅ 포함 | ✅ 포함 |
| **Google Fonts CDN** | ❌ | ❌ | ✅ |
| **3rd-party CDN** | jsDelivr, cdnjs, unpkg | jsDelivr | Fontsource 등 다수 |
| **npm 패키지** | ✅ `pretendard` | ❌ 미등록 | ✅ `@fontsource-variable/noto-sans-kr` |
| **라틴 베이스** | **Inter** | 커스텀 기하학적 산세리프 | Noto Sans (Latin) |
| **한글 베이스** | 본고딕 (Source Han Sans) | 본고딕 (Source Han Sans) | 본고딕 (네이티브) |
| **제작자** | 길형진 | 원티드랩 (길형진, 강한빈) | Google + Adobe |

출처: GitHub orioncactus/pretendard README (2024), GitHub wanteddev/wanted-sans (2023.11), Google Fonts Noto Sans KR 스펙 페이지, Web Almanac 2024 Fonts Chapter (almanac.httparchive.org)

### 로딩 성능 실측 사례

**뱅크샐러드 기술 블로그**에 따르면 Pretendard Static woff2 5개 weight를 동시 로드 시 총 **~3.75 MB, weight당 ~300ms** 소요되었으나, Dynamic Subset + `<link rel="preload">`로 전환 후 체감 로딩 시간이 크게 개선되었다. velog.io의 한 최적화 사례에서는 `pyftsubset`으로 weight 범위를 400–700으로 제한한 PretendardVariable woff2를 생성해 **최대 81% 크기 감소**를 달성했다. Noto Sans KR은 Google Fonts API가 자동으로 ~119개 unicode-range chunk로 분할 전송하므로, 일반적인 한국어 페이지에서 **실제 전송량은 ~300–500 KB** 수준이다.

**프롭테크 서비스 관점에서의 판단**: Pretendard Variable의 Dynamic Subset(92 chunk)은 Noto Sans KR의 Google Fonts API(119 chunk)와 유사한 수준의 최적화를 제공한다. Wanted Sans도 split webfonts를 지원하지만 npm 미등록과 CDN 인프라가 상대적으로 제한적이다. 세 폰트 모두 한글 베이스가 동일(본고딕)하므로 **한글 렌더링 품질 차이는 사실상 무시할 수 있으며**, 차별화 요소는 라틴·숫자 디자인과 인프라 성숙도다.

---

## 2. 390px 모바일에서 Modular Scale이 실제로 작동하는 방식

### 세 가지 비율의 실제 픽셀 값 (Base 16px)

| 단계 | 1.125 Major Second | 1.2 Minor Third | 1.25 Major Third | 역할 |
|------|---------------------|------------------|--------------------| ---|
| -1 | 14px | 13px | 13px | Caption |
| 0 | **16px** | **16px** | **16px** | Body |
| +1 | 18px | 19px | 20px | Subtitle |
| +2 | 20px | 23px | 25px | H4 |
| +3 | 23px | 28px | 31px | H3 |
| +4 | 26px | 33px | 39px | H2 |
| +5 | 29px | 40px | 49px | H1 |
| +6 | 32px | 48px | 61px | Display |

390px 뷰포트에서 좌우 16px 패딩을 적용하면 콘텐츠 영역은 **358px**이다. 한글 프로포셔널 고딕 서체는 글자당 약 1em 폭을 차지하므로 **16px 본문에서 한 줄 약 22자**, **32px Display에서 약 11자**, **40px Hero에서 약 8~9자**가 들어간다. WCAG 1.4.8은 CJK 텍스트의 줄당 최대 40자를 권고하며, 리메인 디자인 시스템은 모바일 짧은 텍스트에 **20~40자**를 권장한다. 16px 본문의 22자/줄은 이 범위 안에 있어 적절하다.

**1.25 Major Third는 390px에서 과도하다.** +4단계(39px)부터 한 줄에 8~9자만 들어가 실용적 한글 문장 구성이 불가능하다. **1.2 Minor Third는 중간 수준**이지만 +4단계(33px)에서 이미 10자 미만으로 떨어진다. **1.125 Major Second가 390px 모바일 한글에 최적**이며, +6단계(32px)까지도 11자/줄로 "강남 아파트 매매가격" 같은 짧은 헤드라인이 가능하다. Kalamuna.com의 프론트엔드 가이드도 모바일에 `$font-scale-mobile: 1.125`를 명시적으로 권장한다.

### 권장 6+1 Type Scale

| 토큰 | 크기 | line-height | weight | 용도 |
|------|------|-------------|--------|------|
| Caption | 12px | 160% | Regular 400 | 라벨, 타임스탬프 |
| Small | 14px | 157% | Regular 400 | 보조 텍스트, 캡션 |
| Body | **16px** | **156%** | Regular 400 | 본문 (KRDS 최소 기준) |
| Subtitle | 18px | 156% | Medium 500 | 서브타이틀, 강조 |
| H3 | 20px | 150% | Bold 700 | 섹션 제목 |
| H2 | 24px | 142% | Bold 700 | 페이지 소제목 |
| H1 | 28px | 136% | Bold 700 | 페이지 타이틀 |
| Display* | **32px** | 125% | Bold 700 | *히어로/프로모션 전용* |

KRDS(2025.01.16 공식 출시, krds.go.kr)는 본문 최소 **16px**, 줄높이 최소 **150%**, weight는 Regular(400)+Bold(700) 2단계를 기본으로 권고한다. Pretendard GOV 기준으로는 시각적 크기가 작아 **17px을 기본 본문 크기**로 설정하는데, 일반 Pretendard를 사용한다면 16px을 유지해도 무방하다. 얇은 weight(Light, Thin)는 배경과 구분이 어려워 KRDS가 명시적으로 지양을 권고한다.

---

## 3. 가격 표시 전용 폰트 전략: 세 옵션의 실질적 트레이드오프

### 옵션별 비교 테이블

| 기준 | A: Pretendard 단독 | B: 숫자 전용 서브폰트 | C: Variable 축 활용 |
|------|--------------------|-----------------------|---------------------|
| **추가 HTTP 요청** | 0 | 1 (preload로 완화 가능) | 0 |
| **추가 파일 크기** | 0 KB | **~3–8 KB** (woff2) | 0 KB |
| **tabular-nums** | ✅ Inter 계승 | ✅ 네이티브 | ✅ |
| **숫자 시각 차별화** | 낮음 (weight 미세 조정 가능) | **높음** (별도 서체 디자인) | 중간 (wght만 가능) |
| **wdth 축 활용** | ❌ 미지원 | N/A | ❌ **Pretendard는 wdth 축 미지원** |
| **유지보수 복잡도** | 최소 | 중간 (baseline 정렬 주의) | 최소 |
| **적합 서비스** | 범용 한국어 앱 | 금융·가격 비교 중심 | 제한적 |

**Option C는 사실상 불가능하다.** Pretendard Variable은 `wght` 축만 지원하며 `wdth`(width) 축이 없다. Inter 원본도 `wght`+`slnt`만 지원한다. 따라서 가변 폰트 width 축을 활용한 숫자 최적화는 현재 Pretendard 기반에서 실현할 수 없다.

**Option B의 실현 가능성**: Inter나 JetBrains Mono의 숫자만 추출하면 woff2 기준 **~3–5 KB** 수준이다. `pyftsubset`으로 `U+0030-0039`(숫자), `U+002C`(쉼표), `U+20A9`(₩) 등 약 15 glyphs만 추출하고, CSS `unicode-range`로 선언하면 해당 문자가 페이지에 있을 때만 다운로드된다. JetBrains Mono는 모노스페이스이므로 별도 `tnum` 설정 없이 자동으로 고정폭 숫자를 제공한다. 다만 한글 본문과의 **baseline 정렬 불일치**가 발생할 수 있어 `vertical-align` 또는 `line-height` 미세 조정이 필요하다.

### 토스 Product Sans의 금융 숫자 전략

토스(Toss)는 2020년 산돌·리도타입과 협력해 자체 서체 **Toss Product Sans**를 개발했다(blog.toss.im, 2021.10.08). 핵심 전략은 다음과 같다.

- **숫자·영문을 한글보다 의도적으로 크고 두껍게** 디자인했다. 전통 타입 디자인에서 숫자는 한글보다 작게 처리되지만, 금융 서비스에서 숫자가 핵심 정보이므로 관행을 역전시켰다.
- **가변폭(proportional)과 고정폭(tabular) 숫자를 모두 포함**하여 본문 내 숫자와 가격 리스트 숫자를 구분 처리한다.
- **%, 쉼표, +, -, 괄호 등 금융 기호를 아이콘 수준으로 재설계**했다. 더 크게, 더 넓은 여백으로 가독성을 극대화했다.
- ₩, @, # 등은 최소 3회 이상 리파인을 거쳤으며, 글자 속공간(counter)을 넓혀 개방감을 높였다.

이 전략은 자체 서체를 개발할 여력이 있는 대형 핀테크에 적합하다. **프롭테크 스타트업 수준에서는 Option A(Pretendard + tabular-nums + weight 미세 조정)가 비용 대비 효과가 가장 높다.** 11번가는 가격 전용 웹폰트(11street Gothic)를 별도 운영하고, 크몽은 NotoSans에 커스텀 숫자를 결합한 전용 폰트를 제작한 사례가 있으나, 이는 모두 상당한 디자인 리소스를 전제한다.

### 한국 원화 가격 표시 패턴

프롭테크에서 가장 빈번한 가격 포맷은 **억/만원 혼합 표기**다(예: "3억 5,000만원"). 이 경우 숫자와 한글 단위("억", "만원")가 혼재하므로 **단일 폰트 패밀리(Option A)가 시각적 일관성 면에서 유리**하다. Option B로 숫자만 별도 폰트를 적용하면 "3억"에서 "3"과 "억"이 서로 다른 서체로 렌더링되어 부자연스러울 수 있다.

```css
/* 권장 구현: Option A 기반 가격 표시 */
.price {
  font-family: "Pretendard Variable", Pretendard, sans-serif;
  font-variant-numeric: tabular-nums;
  font-variation-settings: "wght" 550; /* Medium(500)보다 약간 두껍게 */
  letter-spacing: -0.01em; /* 숫자 간격 미세 조정 */
}
```

---

## 4. 2025–2026 한글 타이포그래피 동향과 시사점

### KRDS v1 공식 출범이 바꾸는 것

2025년 1월 16일, 기존 "디지털 정부서비스 UI/UX 가이드라인"이 **한국 디자인 시스템(KRDS)**으로 공식 리브랜딩되었다. 플립커뮤니케이션즈가 구축했으며, Figma 컴포넌트·디자인 토큰·NPM 패키지(`krds-uiux@1.0.4`)·CDN을 제공하는 완전한 디자인 시스템으로 전환되었다. 타이포그래피 측면에서 **Pretendard GOV**(접근성 강화 수정판)를 표준 서체로 지정하고, 고정폭 숫자 기본 활성화, I/l 구분 개선, 자동 말줄임표 리가처(`...` → `⋯`) 등을 적용했다. 이는 Pretendard가 한국 공공·민간 양쪽에서 사실상 표준(de facto standard)이 되었음을 의미한다.

### 가변 폰트의 메인스트림 진입

Web Almanac 2024에 따르면 Noto Sans CJK 계열이 가변 폰트 사용 사이트의 **약 42%**를 차지하며, Noto Sans KR 단독으로도 **~7%**를 점유한다. Pretendard Variable과 Wanted Sans도 jsDelivr CDN을 통해 가변 폰트를 제공하며, Dynamic Subset이 표준 관행으로 자리잡고 있다. **산돌(Sandoll)**은 2024년 8월 ML 기반 동적 서브셋팅 특허 기술을 적용한 **산돌구름 웹폰트** 서비스를 출시했고, 2023년 국제 PCT 특허, 2025년 일본 특허를 출원하며 기술 고도화를 진행 중이다.

### 한·영·숫자 혼합 환경의 해법

Pretendard가 Inter(라틴)+본고딕(한글)+M PLUS 1p(일본어)를 단일 패밀리로 통합한 접근은 한·영·숫자 혼합 환경의 **쏠림 현상**(vertical misalignment)을 해결한 대표 사례다. 카카오뱅크, KBank, 원티드, 플렉스, 청와대 등이 이 이유로 Pretendard를 채택했다. Wanted Sans는 동일 제작자(길형진)가 더 기하학적인 라틴 디자인과 컨텍스트 인식 한글 렌더링을 추가한 진화 버전이지만, npm 미등록과 제한적 CDN 인프라로 인해 **프로덕션 안정성 면에서 Pretendard 대비 성숙도가 낮다.**

### 프롭테크 앱들의 타이포그래피 현황

직방·다방·네이버부동산 등 주요 한국 부동산 앱은 공통적으로 **가격 정보에 가장 높은 시각적 weight**를 부여한다. 대부분 OS 시스템 폰트(Apple SD Gothic Neo / Noto Sans KR)를 사용하며, 가격 숫자에 Bold + 큰 사이즈를 적용하고 "만원", "억" 같은 한글 단위는 상대적으로 가볍게 처리한다. 맵 마커의 경우 극도로 압축된 숫자 표시가 필요해 고정폭 숫자가 필수적이다.

---

## 최종 권고: 현재안 유지 + 부분 개선

| 영역 | 판단 | 구체적 조치 |
|------|------|-------------|
| **웹폰트** | ✅ **현재안 유지** | Pretendard Variable v1.3.9 + Dynamic Subset(92 chunk) 유지. 변경 불필요. |
| **Type Scale** | ⚠️ **부분 개선** | 6단계 → **6+1단계** 확장. Display 32px를 히어로/프로모션 전용으로 추가. 비율은 **1.125 Major Second** 채택. |
| **가격 표시** | ⚠️ **부분 개선** | Option A 유지하되, 가격 전용 CSS에 `font-variation-settings: "wght" 550` + `font-variant-numeric: tabular-nums` 조합 적용. |
| **line-height** | ⚠️ **점검 필요** | 본문 150%+ 충족 여부 확인. KRDS 기준 준수. |
| **향후 모니터링** | 📋 관찰 | Wanted Sans의 npm 등록·CDN 인프라 성숙 시 재검토. Pretendard GOV의 접근성 개선사항(고정폭 숫자 기본값 등) 선별 도입 검토. |

**Pretendard를 교체할 이유가 현재로서는 없다.** 세 폰트 모두 동일한 본고딕 한글 베이스를 공유하며, Pretendard의 Inter 기반 숫자·라틴 렌더링은 가격 정보 중심 서비스에 최적이다. Weight 축 범위(45–920)가 가장 넓어 가격 표시의 미세 weight 조정에도 유리하다. Noto Sans KR은 Google Fonts CDN이라는 인프라 이점이 있지만, 이미 jsDelivr CDN + Dynamic Subset으로 유사한 수준의 성능을 확보하고 있다면 마이그레이션 비용 대비 이점이 크지 않다. Wanted Sans는 디자인 철학은 우수하나 인프라 성숙도가 부족하다. **현재 시스템을 기반으로 Type Scale 1단계 확장과 가격 weight 미세 조정이라는 최소 변경으로 최대 효과를 얻는 전략이 가장 합리적이다.**