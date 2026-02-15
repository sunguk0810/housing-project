# entity["organization","Next.js","react framework"] App Router와 entity["organization","Tailwind CSS","css framework"] 기반 프롭테크 서비스의 디자인 토큰 관리와 다크모드 전략 비교 리서치

## 현재 상황과 평가 기준

요청하신 프로젝트는 **CSS Custom Properties(런타임 토큰) + Tailwind v4의 CSS-first `@theme`(빌드 컨텍스트 토큰)**를 병행하고, 다크모드는 `.dark` 클래스로 CSS 변수를 오버라이드하는 구조입니다. 이 접근은 의존성을 최소화하고(특히 1–3인 팀에서 중요), 런타임 토글/애니메이션/서드파티 위젯 대응을 CSS 변수로 흡수할 수 있다는 점에서 “작게 시작하기”에 적합합니다. Tailwind v4는 `@theme`로 정의한 값이 유틸리티 생성에 반영되고, 동시에 테마 값이 CSS 변수로도 제공되어 런타임에서 참조가 가능합니다. citeturn6view4turn6view6

다만 현재 설명과 업로드된 리서치(Phase2) 맥락을 종합하면, **(a) 런타임 토큰(:root/.dark)과 (b) Tailwind 빌드 토큰(@theme) 사이의 “단일 소스 오브 트루스(SSOT)”가 약해지는 순간** 유지보수 비용이 급격히 늘어납니다. 특히 토큰이 50개+로 증가한 상태에서 “주석 처리된 `@theme` 블록”은 실무에서 **동기화 실패(토큰 드리프트)**의 대표 패턴입니다. fileciteturn0file5

이번 리서치의 평가지표는 요청하신 기준을 그대로 사용하되, **소규모 팀 관점**에서 아래 두 가지를 추가로 강하게 봤습니다.

- **변경 비용의 비선형성**: “처음 도입은 쉽지만, 나중에 고치기 어려운 구조(예: 3-tier를 너무 이르게 도입)”를 피할 것. citeturn31view0  
- **SSR/하이드레이션 안정성**: App Router에서 테마 토글이 흔히 만드는 경고/FOUC(깜빡임) 문제를 구조적으로 줄일 것. citeturn26view0turn13view3

---

## 토큰 관리 도구와 워크플로 비교

### 핵심 비교 테이블

> 업데이트/Star 수는 **2026-02-15 기준**, “최종 업데이트”는 **(1) GitHub Release가 있으면 최신 릴리스 날짜, (2) 없으면 최근 커밋 날짜**로 표기했습니다.

| 옵션 | GitHub 링크 | Stars | 최종 업데이트 | 러닝커브 | Figma-코드 싱크 | CI/CD 통합 | 소규모 팀 적합성 | 코멘트 |
|---|---|---:|---|---|---|---|---|---|
| 현재안: 수동 CSS 변수 + `@theme` 최소 사용 | (해당 없음) | - | - | 낮음 | 없음 | 낮음 | 높음 | “가장 덜 위험”하지만, 토큰 수가 늘수록 **규칙/가드레일이 없으면 드리프트**가 누적됨. |
| 대안 A: entity["organization","Style Dictionary","design token build tool"] | `github.com/style-dictionary/style-dictionary` citeturn5view1 | 4.5k citeturn5view1 | v5.3.0 (2026-02-09) citeturn22view4 | 중~높음 | 자체로는 약함(별도 파이프라인 필요) | 높음(빌드 스텝으로 통합 쉬움) citeturn17search2 | 중간 | DTCG 컬러 구조 지원 등 표준 적응은 빠름. citeturn22view4 다만 v5.0.0에서 Node 22 최소 요구 등 **환경 제약/브레이킹 체인지**가 있었음. citeturn23view0 |
| 대안 B: entity["organization","Tokens Studio","figma token tool"] (Figma 플러그인 중심) | `github.com/tokens-studio/figma-plugin` citeturn5view2 | 1.5k citeturn5view2 | v2.11.0 (2026-02-04) citeturn0search5 | 중간 | 매우 높음(Figma 워크플로 내장) | 중~높음(Git Sync/내보내기 연계) | **조건부 높음** | 멀티파일/자동화/프로 기능이 유료 플랜과 강하게 결합. (Starter Plus: €39/인/월, Essential: €169/월, Organization: €499/월, 연간 결제 기준) citeturn21view1turn20view3 “Figma가 진짜 SSOT”일 때 효과가 큼. |
| 대안 C: Tailwind v4 `@theme`만 고도화(도구 추가 없음) | `github.com/tailwindlabs/tailwindcss` citeturn7view0 | 93.5k citeturn7view0 | v4.1.18 (2025-12-11) citeturn6view1 | 중간 | 없음(수동) | 중간(빌드 내장) | 높음 | `@theme`는 유틸리티 생성+CSS 변수 제공이라는 장점이 있으나, **테마 전환(다크/라이트)을 런타임 CSS 변수로 설계해야** 실제 운영이 편해짐. citeturn6view4turn13view4 |

### “Figma-코드 싱크”의 현실적인 갈림길

Figma 연계를 “진짜 자동화”로 가져가려면 보통 아래 둘 중 하나입니다.

- **Tokens Studio 중심**: Themes 기능은 토큰 세트를 조합해 “라이트/다크/브랜드/접근성 모드” 같은 구성을 만들고, 플러그인이 테마 설정 파일을 만들어 개발과 공유한다는 점을 명시합니다. citeturn19view3 다만 이 기능 자체가 Pro 라이선스/유료 플랜과 연결되는 구조입니다. citeturn17search22turn19view4  
- **Figma Variables REST API 중심**: Variables API는 “변수 조회/생성/수정/삭제” 엔드포인트를 제공하고, CI 시스템과의 통합 및 “SSOT를 Figma로/에서 동기화”를 지원한다고 명시합니다. citeturn31view4 하지만 **Enterprise 조직의 Full seat 요구**가 걸림돌이 될 수 있습니다(1–3인 팀에서는 비용 구조상 현실성이 낮아지는 경우가 많음). citeturn31view4

즉, 소규모 팀에서 “Figma-코드 자동 싱크”는 **기술 난이도보다 ‘플랜/라이선스 제약’이 먼저** 판단 기준이 되는 경우가 많습니다. citeturn31view4turn21view1

### 참고 리포지토리

| 목적 | GitHub 링크 | Stars | 최종 업데이트 | 비고 |
|---|---|---:|---|---|
| Variables API 기반 양방향 싱크 예제 | `github.com/figma/variables-github-action-example` citeturn32view0 | 183 citeturn32view0 | 2024-07-23(최근 커밋) citeturn33view0 | 양방향 워크플로(토큰→Figma, Figma→토큰) 예시를 제공. citeturn4view6 |
| DTCG 스펙/사이트/논의 허브 | `github.com/design-tokens/community-group` citeturn5view3 | 1.9k citeturn5view3 | 2025-10-28(첫 안정판 발표) citeturn31view0 | 표준화/이슈/드래프트의 중심 저장소. citeturn5view3 |

---

## 시맨틱 토큰 아키텍처와 네이밍 컨벤션

### 레퍼런스 시스템들이 공통으로 말하는 것

여러 디자인 시스템이 서로 다른 구현을 쓰더라도, 토큰을 “의미 계층”으로 나누는 방향은 강하게 수렴합니다.

- entity["organization","Material Design 3","google design system"]는 **Reference / System / Component**의 3계층 토큰을 명시합니다. citeturn24search0turn25search3  
- entity["organization","Primer","github design system"]는 Base(Primitive) 토큰과 이를 참조하는 Functional 토큰을 강조하며, Functional 토큰이 “색상 모드를 존중하고(라이트/다크), 제품 전반에서 가장 널리 쓰이는 패턴”임을 설명합니다. citeturn24search6  
- entity["organization","Chakra UI","react component library"]는 Semantic tokens를 “특정 맥락에서 사용되도록 설계된 토큰”으로 정의하고, 환경(예: 다크모드)별로 값이 달라질 수 있음을 전제로 합니다. citeturn24search1turn24search5  

image_group{"layout":"carousel","aspect_ratio":"16:9","query":["Material Design 3 design tokens reference system component diagram","Primer design tokens naming convention diagram","Chakra UI semantic tokens documentation screenshot","Tailwind CSS v4 @theme theme variables documentation screenshot"],"num_per_query":1}

### 2-tier vs 3-tier vs “2.5-tier” 비교

요청하신 현재 구조는 사실상 **2-tier(Global/Primitive + Semantic)** 입니다. 여기에 “Component tier”를 공식적으로 올릴지 여부가 핵심인데, 1–3인 팀에서는 다음과 같은 트레이드오프가 발생합니다.

| 구조 | 정의 | 장점 | 단점 | 소규모 팀 적합성 | 권고 |
|---|---|---|---|---|---|
| 2-tier (Global + Semantic) | Primitive(팔레트/스케일) → Semantic(의미) | 단순, 학습 비용 낮음 | 컴포넌트별 미세 조정이 쌓이면 Semantic이 비대해질 수 있음 | 높음 | **기본 권장**. 다만 “의미 토큰의 범위”를 엄격히 정의해야 함. |
| 3-tier (Global - Alias - Component) | Primitive → Alias(의미/역할) → Component(컴포넌트 전용) | 대규모/멀티브랜드/멀티플랫폼에서 강력. M3가 표준적으로 채택. citeturn24search0 | 토큰 수/관리 비용 폭증 위험. 작은 팀에서는 “Component 토큰이 컴포넌트 API와 경쟁”하기 쉬움 | 중~낮음 | “컴포넌트 토큰을 만들기 시작하면 끝이 없다”는 상황을 경계. |
| 2.5-tier (Global + Semantic + 제한적 Component) | 2-tier를 유지하되, 정말 필요한 컴포넌트만 예외로 Component 토큰 부여 | 2-tier의 단순함 유지 + 고통 지점만 해결 | 규칙이 없으면 3-tier로 자연 증식 | 높음 | **실무 추천**: “컴포넌트 토큰 승인 기준”을 문서화하고, 기본은 2-tier로 유지. |

### Score/Safety 전용 시맨틱 토큰이 “필요한” 이유

요청하신 **Score 5등급(블루-오렌지 다이버징) + Safety 3단계**는 단순 색상 팔레트가 아니라, “의미(상태)를 전달하는 정보”입니다. 이런 정보성 컬러는 보통 다음 이유로 Primitive로 두면 실패합니다.

- **다크모드에서의 대비/인지 문제**: 동일한 Hex라도 배경이 바뀌면 가독성이 급락할 수 있습니다. WCAG는 일반 텍스트 최소 대비를 4.5:1, 큰 텍스트는 3:1로 요구합니다. citeturn27search3turn27search0 UI 컴포넌트 경계/그래픽은 3:1 요구가 대표 기준입니다. citeturn27search1turn27search6  
- **“이 컬러는 어떤 맥락에서 쓰는가”가 코드에서 드러나지 않음**: Primer가 Functional 토큰을 강조하는 이유가 여기에 있습니다(텍스트/배경/테두리/그림자 등 UI 패턴을 의미로 고정). citeturn24search6turn9search6  
- **등급 UI는 보통 ‘텍스트색’, ‘배지 배경색’, ‘선/아이콘색’이 모두 필요**: 하나의 `--color-score-excellent`로는 실제 UI에서 충돌이 납니다.

따라서 “Score/Safety는 전용 시맨틱 토큰이 필요”하다는 결론이 합리적이며, 방식은 **Chakra의 semantic token처럼 ‘조건부(다크/라이트) 값’을 갖는 모델**이 소규모 팀에도 이해/운영이 쉽습니다. citeturn24search5turn25search14

### 네이밍 컨벤션 비교와 권장안

참고 시스템들은 대체로 “경로형(계층) + 역할형(semantic)”으로 수렴합니다.

- Primer는 토큰 네이밍이 “무엇(속성) / 변형(variant) / 스케일(scale)”로 읽히도록 설계되었다고 설명합니다. citeturn24search2  
- Tokens Studio도 토큰 이름이 엔지니어에게 노출되고, Figma에서 토큰-요소 연결의 핵심 키라는 점을 강조합니다. citeturn24search20turn19view3  

**권장 네이밍(현재 CSS 변수 기반을 유지한다는 전제)**은 다음 원칙이 소규모 팀에 가장 잘 맞습니다.

- Primitive: `--color-neutral-50`, `--color-brand-500` 같이 스케일 기반(지금 방식 유지)  
- Semantic(기능): `--color-bg-surface`, `--color-fg-default`, `--color-border-default` 같이 “UI 패턴” 중심(Primer의 Functional 컬러 토큰 철학과 동일) citeturn24search6  
- Score/Safety: “표현 방식별”로 최소 3종을 분리  
  - `--color-score-excellent-fg` (텍스트/아이콘)  
  - `--color-score-excellent-bg` (배지/칩 배경)  
  - `--color-on-score-excellent` (배지 위 텍스트)  
  이 3종만으로도 실전 충돌이 크게 줄어듭니다(3-tier까지 가지 않고 해결).

---

## 다크모드 구현 전략과 운영 이슈

### 전략 비교 테이블

| 전략 | 동작 방식 | 장점 | 단점/리스크 | Tailwind v4 적합성 | App Router 적합성 |
|---|---|---|---|---|---|
| 현재: `.dark` + CSS 변수 오버라이드 | 클래스 토글로 변수 스코프 변경 | 구현 단순, 런타임 전환 자연스러움 | 테마 저장/동기화(탭 간)와 SSR 초기 상태 처리(FOUC) 고민 필요 | 매우 높음(커스텀 variant로 연결 가능) citeturn13view0 | 높음(단, 초기 테마 결정 로직 필요) |
| 대안 A: `prefers-color-scheme` 우선 + 수동 오버라이드 | 기본은 시스템 설정, 필요 시 사용자 설정이 덮어씀 | “기본값” 설계가 깔끔, 접근성/OS 일관성 | 사용자 선택 저장/우선순위 규칙이 복잡해질 수 있음 | Tailwind 기본이 이 모델 citeturn13view0turn16search12 | 중~높음 |
| 대안 B: entity["organization","next-themes","react theme switcher"] + CSS 변수 | 시스템 감지 + 저장 + 탭 동기화 + 초기 스크립트 주입 | App Router에서 가장 흔한 문제(깜빡임/불일치)를 “검증된 방식”으로 해결 | 라이브러리 의존성 추가, Theme UI 렌더링 시 하이드레이션 주의 필요 citeturn26view3turn26view4 | Tailwind와도 호환(HTML에 `.dark` 부여 가능) citeturn26view1 | 매우 높음(공식 예시로 `suppressHydrationWarning` 가이드) citeturn26view0 |
| 대안 C: Tailwind v4 `@custom-variant dark` 적극 활용 | 다크 variant의 트리거 셀렉터를 CSS로 정의 | 트리거(클래스/데이터속성)를 한 줄로 바꿔 전체 반영 가능 | “토큰은 CSS 변수”인 경우, 빌드 토큰과 런타임 토큰을 분리 설계해야 함 citeturn13view0turn13view4 | 매우 높음 citeturn13view0 | 높음 |

**실무적으로는 “대안 B + 대안 C의 일부” 조합이 가장 안정적**입니다. 즉, next-themes로 테마 상태를 관리하고(`attribute="class"`로 `.dark`를 html에 부여 가능) Tailwind는 `@custom-variant dark (&:where(.dark, .dark *));`로 dark variant를 한 번 정의해두는 방식입니다. citeturn13view0turn26view1turn26view4

### 점수 등급 컬러의 다크모드 가시성 문제

요청하신 블루–오렌지 다이버징 예시는 entity["organization","MUI","react ui library"]의 팔레트 토큰 예시(Primary의 `main/light/dark`)와 동일한 값 세트가 포함되어 있어, 실제 현업에서 흔히 겪는 대비 문제를 그대로 재현합니다. citeturn25search1

아래는 예시 컬러(Excellent `#1565C0`, Good `#42A5F5`, Average `#90A4AE`, Below `#FF8A65`, Poor `#D84315`)를 **다크 배경 `#0F172A`**에 올렸을 때의 대비(Contrast Ratio) 참고치입니다. (WCAG 대비 기준은 4.5:1(일반 텍스트), 3:1(큰 텍스트/비텍스트 요소)에서 출발합니다.) citeturn27search3turn27search1  

| 등급 | 색상 | 다크 배경 대비(≈) | 해석(주요 리스크) |
|---|---|---:|---|
| Excellent | `#1565C0` | ~3.11:1 | 아이콘/배지 테두리(3:1)는 간신히 가능하지만, **본문 텍스트 컬러로는 부족** 가능성이 큼 citeturn27search3 |
| Good | `#42A5F5` | ~6.74:1 | 텍스트로도 비교적 안전 |
| Average | `#90A4AE` | ~6.89:1 | 텍스트로도 비교적 안전 |
| Below | `#FF8A65` | ~7.72:1 | 텍스트로도 비교적 안전 |
| Poor | `#D84315` | ~4.02:1 | **일반 텍스트(4.5:1) 기준은 미달** 가능 |

이 문제를 토큰으로 해결하려면, “등급 컬러 1개”가 아니라 **용도별 semantic 토큰 분리 + 다크모드 전용 매핑**이 가장 비용 대비 효과가 좋습니다.

- `--color-score-*-fg`는 다크에서 더 밝은 톤으로 매핑  
- `--color-score-*-bg`는 배지 배경용으로 유지하되  
- `--color-on-score-*`를 별도로 두어 텍스트 대비를 강제

이 패턴은 Chakra의 semantic tokens가 “환경에 따라 값이 달라지고, 항상 CSS variable로 반환된다”는 철학과도 일치합니다. citeturn25search14turn24search5

### entity["organization","Kakao Maps","map api korea"] 다크모드와 마커 호환성

가장 중요한 사실은, **카카오맵 오픈API 자체가 다크모드를 지원하지 않는다고 공식 FAQ에서 명시**한다는 점입니다. citeturn29view0 즉 “사이트 전체 다크모드”와 “지도 타일 자체의 다크모드”는 분리해서 생각해야 합니다.

운영 관점에서 선택지는 아래처럼 정리됩니다.

- **지도는 라이트(기본) 유지 + 주변 UI만 다크**: 가장 안전합니다. 지도 위 마커/POI는 라이트 타일 기준으로 디자인하고, 마커 컨테이너(배지/툴팁 등)만 토큰으로 다크 대응하면 됩니다.
- **CSS filter로 타일을 흑백/딤 처리**: 카카오 측 답변은 “금지 사항은 아니지만 부작용 관리 필요”이며, CI/BI를 가리거나 변형하면 제재 대상이 될 수 있다고 주의합니다. citeturn29view1 즉, “전체 invert/강한 필터”는 법/운영 리스크가 생길 수 있습니다.
- **Tileset 오버레이로 딤/스타일 레이어 추가**: 공식 예시로 타일셋을 오버레이로 추가해 딤 효과를 내는 방법이 안내됩니다. citeturn29view1 다만 이는 “진짜 다크 타일”이 아니라 오버레이에 가깝고, 완전한 테마 전환을 기대하면 안 됩니다.

마커/클러스터(특히 다량 POI)의 경우, 지도 타일이 라이트로 고정된다면 **마커는 라이트 배경 대비를 기준으로** 설계하고, “UI 다크 배경 위에 떠 있는 지도 컨테이너”와의 경계(쉐도우/보더)는 `--color-border`·`--color-surface-elevated` 같은 토큰으로 해결하는 편이 안전합니다(지도 자체를 억지로 다크 처리하는 것보다 운영 리스크가 낮음). citeturn29view1turn27search1

---

## 디자인 토큰 트렌드

### entity["organization","W3C","web standards body"] entity["organization","Design Tokens Community Group","w3c cg"] 표준화 현황

2025년 10월 28일, DTCG는 **Design Tokens Specification 2025.10의 “첫 안정판”**을 발표했고, 이 스펙이 “프로덕션 레디, 벤더 중립 포맷”이며 “테마/멀티브랜드, 현대 색공간(Display P3, OKLCH 등), 풍부한 참조 관계, 크로스플랫폼 생성”을 핵심 가치로 제시합니다. citeturn31view0turn31view2

또한 2026년 1월 기준 드래프트인 Resolver 모듈은, 라이트/다크/고대비 같은 테마뿐 아니라 크기/접근성 컨텍스트까지 합쳐질 때 발생하는 **조합 폭발(combinatorial explosion)**을 줄이기 위한 메커니즘(중복 제거/컨텍스트 직교성)을 논합니다. citeturn31view3  
이 흐름은 곧 “토큰을 모드별로 파일 복제하지 말고, 상속/확장($extends)·컨텍스트 모델로 관리하라”는 업계 방향성과 직결됩니다. citeturn31view0turn31view3

### entity["company","Figma","design tool company"] Variables API 활용 패턴

Figma는 Variables REST API를 통해 “변수 CRUD + CI 통합 + SSOT를 Figma로/에서 동기화”를 명시합니다. citeturn31view4 이는 2025–2026 트렌드인 **“디자인 도구와 코드 저장소를 파이프라인으로 연결”**의 정석적인 구현 경로입니다. 다만 Enterprise seat 요구는 소규모 팀의 큰 제약입니다. citeturn31view4

### CSS Custom Properties vs `@property` vs `light-dark()` 트렌드

- **CSS Custom Properties**는 이미 업계 표준 런타임 토큰 레이어입니다(Tailwind v4도 `@theme` 값을 CSS 변수로 제공). citeturn6view6turn6view4  
- **`@property`(CSS Properties and Values API)**는 커스텀 프로퍼티에 타입/상속/초깃값을 부여해 파싱과 애니메이션 안정성을 높입니다. 스펙과 MDN이 모두 “스타일시트에서 등록 가능(@property)”을 설명합니다. citeturn16search6turn16search3  
  - 현실적으로는 “토큰을 `@property`로 등록한다”기보다는, **애니메이션이 필요한 일부 토큰(예: 숫자/각도/색상 보간)**에 제한적으로 쓰는 패턴이 많습니다(소규모 팀에서도 선택적으로 도입 가능).
- **`light-dark()`**는 `color-scheme: light dark`가 설정되어야 동작하며, 다크/라이트 값을 한 줄에 병기할 수 있습니다. citeturn16search1turn16search16 다만 2026년 1월 기준 글로벌 사용률이 약 84.93%로 “거의 충분하지만, 일부 레거시 브라우저 이슈가 남은” 단계입니다. citeturn16search9  
  - 결론적으로, “핵심 토큰 전략을 `light-dark()`에 걸기”보다, 지금처럼 **테마 셀렉터 기반(CSS 변수 오버라이드)**을 유지하고 `light-dark()`는 점진적으로 실험하는 편이 안전합니다.

---

## 최종 권고안

### 결론 요약

소규모 팀(1–3명)이라는 조건을 가장 강하게 반영하면, **“현재안 유지 + 부분 개선”**이 최적입니다. 다만 “부분 개선”의 우선순위가 중요합니다.

- **토큰 관리 도구 도입(Style Dictionary / Tokens Studio)**은 “멀티플랫폼(앱/웹 동시)·멀티브랜드·디자인 조직 성숙도·Figma를 SSOT로 삼을 의지”가 커질 때 ROI가 급상승합니다. DTCG 안정판이 나온 지금(2025.10)도구 생태계는 성숙 중이지만, 소규모 팀에는 **도구 운영 비용(학습·파이프라인·권한/플랜)**이 더 크게 느껴질 가능성이 큽니다. citeturn31view0turn21view1turn31view4  
- 가장 큰 레버리지는 **(1) 토큰 계층(2.5-tier) 정리 + (2) Score/Safety 전용 semantic 토큰 추가 + (3) 테마 토글의 SSR 안정성 확보(next-themes)** 입니다. citeturn26view0turn13view0turn27search3

### 권장 조합

| 항목 | 권장 | 이유 |
|---|---|---|
| 토큰 소스 | “런타임 CSS 변수(:root/.dark)”을 SSOT로 두고, Tailwind `@theme`는 **필요 토큰만 inline 매핑** | Tailwind 문서도 `@theme`는 유틸리티에 연결되는 토큰, `:root`는 그 외 변수를 위한 위치로 구분합니다. citeturn6view4turn13view4 |
| 시맨틱 구조 | 2.5-tier(기본 2-tier + 제한적 component 토큰) | 3-tier는 소규모 팀에 과잉일 가능성이 큼. M3의 3계층을 “참고”하되 그대로 복제하지 않음. citeturn24search0turn31view0 |
| Score/Safety | 전용 semantic 토큰(최소 fg/bg/on 3종) + 다크 전용 매핑 | WCAG 대비 기준을 만족시키려면 용도 분리가 사실상 필수. citeturn27search3turn27search1 |
| 다크모드 상태 관리 | next-themes + `attribute="class"` + Tailwind `@custom-variant dark` | App Router에서의 경고/FOUC를 줄이고, `.dark` 기반 CSS 변수를 그대로 유지 가능. citeturn26view0turn26view1turn13view0 |
| Kakao Maps | 지도는 라이트 유지(권장) + UI/오버레이만 토큰 다크 대응 | 오픈API 자체 다크모드 미지원이 공식 명시. citeturn29view0 필터/오버레이는 부작용·CI/BI 리스크를 수반. citeturn29view1 |

### “도구를 언제 도입할지” 판단 체크리스트

아래 조건 중 2개 이상이 성립하면, 그 시점에 Tokens Studio 또는 Style Dictionary 도입을 재검토할 가치가 큽니다.

- 멀티브랜드/화이트라벨이 확정되어, 모드/브랜드 조합이 늘어남(조합 폭발 문제가 현실화) citeturn31view3turn31view0  
- “디자인=SSOT”를 강하게 두고 싶고, 유료 플랜/권한(특히 Figma Variables API의 Enterprise 제약)을 감당할 수 있음 citeturn31view4turn21view1  
- 웹 외(iOS/Android 등)로 토큰 산출물이 필요해짐(Style Dictionary 강점) citeturn5view1turn17search2  

### 리포지토리 스냅샷

요청하신 “참고 시스템/라이브러리”의 GitHub 정보입니다.

| 대상 | GitHub 링크 | Stars | 최종 업데이트 | 비고 |
|---|---|---:|---|---|
| entity["organization","Shopify Polaris","shopify design system"] (토큰) | `github.com/Shopify/polaris-tokens` citeturn2search7 | 241 citeturn2search7 | 2022-04-13(archived) citeturn2search7 | 레퍼런스로는 유효하나, 저장소 자체는 아카이브 상태. |
| Polaris (React) | `github.com/Shopify/polaris-react` citeturn2search8 | 6.1k citeturn2search8 | 2026-01-06(archived) citeturn2search8 | 생태계 변화(패키지/전략 이동) 시사. |
| Primer primitives | `github.com/primer/primitives` citeturn5view4 | 376 citeturn5view4 | 2026-02-13(최근 커밋) citeturn34view0 | Functional 토큰/네이밍 문서가 매우 실전적. citeturn24search6turn24search2 |
| Radix Themes | `github.com/radix-ui/themes` citeturn4view9 | 8.1k citeturn4view9 | 2026-02-11(최근 커밋) citeturn34view1 | 최신 버전 3.3.0(2026-01-31, npm) citeturn9search5 |
| MUI Material UI | `github.com/mui/material-ui` citeturn34view2 | 97.8k citeturn34view2 | v7.3.8 (2026-02-12) citeturn30search0 | CSS theme variables/토큰 문서가 풍부. citeturn25search0turn25search1 |
| Chakra UI | `github.com/chakra-ui/chakra-ui` citeturn5view5 | 40.2k citeturn5view5 | `@chakra-ui/react@3.32.0` (2026-02-03) citeturn30search2 | semantic tokens로 모드별 값 전환을 전제. citeturn24search5turn24search1 |
| shadcn/ui(참고) | `github.com/shadcn-ui/ui` citeturn6view3 | 107k citeturn6view3 | shadcn@3.8.4 (2026-02-06) citeturn8view2 | 토큰/다크모드 패턴 레퍼런스로 자주 사용됨. |
| Tailwind CSS | `github.com/tailwindlabs/tailwindcss` citeturn7view0 | 93.5k citeturn7view0 | v4.1.18 (2025-12-11) citeturn6view1 | `@theme`와 `@custom-variant`가 핵심 축. citeturn6view4turn13view0 |
| next-themes | `github.com/pacocoursey/next-themes` citeturn11view0 | 6.2k citeturn11view0 | v0.4.6 (2025-03-11) citeturn11view2 | 스크립트 주입으로 “깜빡임 방지”를 명시. citeturn26view4turn26view0 |

요약하면, **지금은 “도구를 추가해 토큰을 ‘관리’하기”보다, “토큰 구조를 정교하게 ‘설계’해서 관리 비용을 낮추는 단계”**가 우선입니다. 그리고 그 설계의 정답은, Tailwind v4가 제공하는 `@theme`/`@custom-variant`와 CSS 변수 레이어를 활용해 **2.5-tier semantic 구조 + next-themes 기반의 안전한 테마 토글 + Score/Safety 전용 semantic 토큰**을 구축하는 것입니다. citeturn13view0turn26view0turn31view0