---
plan-id: "2026-02-23_claude-code_enhance-proptech-features"
status: "done"
phase: "PHASE2"
template-version: "1.1"
work-type: "feature"
---

# PropTech 사용성 강화 5개 기능 구현

## 목표

MVP 출시 후 사용성을 강화하기 위해 5개 핵심 기능을 구현한다:

1. **커스텀 가중치 슬라이더** — 6차원 가중치를 사용자가 직접 조절
2. **예산 민감도 분석** — 예산 변동에 따른 Top10 변화 시뮬레이션
3. **통근 경로 시각화** — 카카오맵 위에 통근 경로 오버레이
4. **결과 공유 기능** — URL 기반 검색 조건 공유 (PII 미포함)
5. **PWA 지원** — 오프라인 캐시, 홈화면 추가, 앱 수준 접근성

## 범위

- SoT 참조: PHASE0 S4 (법무 체크리스트), PHASE1 S4 (스코어링 로직), PHASE2 M4 (폴리시)
- 수정 대상: `src/` 하위 컴포넌트/엔진/API/타입, `public/` (PWA 에셋)
- SoT 수정 없음 — PHASE0/PHASE1 문서는 참조만

## 작업 단계

### F1. 커스텀 가중치 슬라이더

#### 설계 결정

- **API 확장**: `RecommendRequest`에 `customWeights?: { budget, commute, childcare, safety, school, complexScale }` 추가
  - 프리셋 사용 시: 기존 `weightProfile` 키로 동작 (하위 호환)
  - 커스텀 사용 시: `weightProfile = 'custom'`, `customWeights` 전달
- **합계 제약**: 6개 슬라이더 합계 = 100, Zod 검증
- **자동 균형**: 한 슬라이더를 올리면 나머지가 비례적으로 줄어드는 방식

#### 구현 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/types/engine.ts` | `WeightProfileKey`에 `'custom'` 추가 |
| `src/types/api.ts` | `RecommendRequest`에 `customWeights` 필드 추가 |
| `src/lib/engines/scoring.ts` | `calculateFinalScore`에서 custom weights 분기 처리 |
| `src/lib/validators/recommend.ts` | Zod 스키마에 customWeights 검증 추가 |
| `src/components/input/CustomWeightSlider.tsx` | 새 컴포넌트: 6축 슬라이더 + 합계 100 자동 균형 |
| `src/components/input/steps/Step4Priorities.tsx` | 프리셋/커스텀 토글 UI 추가 |
| `src/hooks/useStepForm.ts` | schema v7 마이그레이션, customWeights 필드 추가 |
| `src/app/api/recommend/route.ts` | customWeights 전달 로직 |

### F2. 예산 민감도 분석

#### 설계 결정

- **서버 사이드 일괄 계산**: 새 API 엔드포인트 `/api/budget-sensitivity` 추가
  - 이유: 동일 후보군을 1회 조회 후 5개 예산 수준으로 재스코어링 → 효율적
  - 기존 `/api/recommend`의 rate limit (10/분) 회피
- **예산 구간**: 현재 기준 ±2,500만원, ±5,000만원 (총 5단계)
- **응답**: 각 구간별 Top10 + 진입/이탈 단지 표시

#### 구현 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/app/api/budget-sensitivity/route.ts` | 새 API: 5단계 예산별 Top10 계산 |
| `src/types/api.ts` | `BudgetSensitivityRequest/Response` 타입 추가 |
| `src/components/results/BudgetSensitivity.tsx` | 새 컴포넌트: 예산 민감도 카드/테이블 |
| `src/app/(main)/results/page.tsx` | 결과 페이지에 민감도 분석 섹션 추가 |

### F3. 통근 경로 시각화

#### 설계 결정

- **단지 상세 페이지에 구현**: `/complex/[id]` 페이지의 CommmutePanel에 지도 연동
- **데이터**: 기존 `CommuteRouteDetail.segments` 활용 + 카카오 좌표 기반 polyline
- **한계**: ODsay 경로 좌표가 DB에 없으므로, 출발지(단지)→도착지(직장) 직선/경유 polyline으로 표현
  - 향후 ODsay graphPos 저장 시 실제 경로 표시 가능

#### 구현 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/components/complex/panels/CommutePanel.tsx` | 지도 토글 버튼 + CommuteRouteMap 연동 |
| `src/components/map/CommuteRouteMap.tsx` | 새 컴포넌트: 직선 polyline + 교통수단 색상 마커 |
| `src/lib/kakao.ts` | Polyline, LatLngBounds 등 타입 선언 추가 |
| `src/lib/detail-session.ts` | aptLat/aptLng, job1Lat/job1Lng 등 좌표 필드 추가 |
| `src/components/complex/ComplexDetailClient.tsx` | CommutePanel에 좌표 props 전달 |
| `src/types/api.ts` | JobCoordinate 인터페이스, RecommendMeta 좌표 필드 추가 |
| `src/app/api/recommend/route.ts` | 응답 meta에 geocoded 직장 좌표 포함 |

### F4. 결과 공유 기능

#### 설계 결정

- **비민감 정보만 URL 인코딩**: tradeType, job1, job2, job1Remote, job2Remote, weightProfile, budgetProfile, loanProgram, desiredAreas, customWeights
- **금융 정보 제외**: cash, income은 URL에 포함하지 않음 (NFR-1 준수)
- **수신자 흐름**: 공유 URL 접속 → 조건 프리필 + "재무 정보 입력" 미니폼 → 분석 실행
- **인코딩 방식**: URL searchParams (base64 인코딩으로 가독성 감소, 길이 축소)

#### 구현 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/lib/share.ts` | 새 유틸: 검색 조건 인코딩/디코딩 (base64) |
| `src/components/results/ShareButton.tsx` | 새 컴포넌트: 공유 버튼 + 복사 피드백 |
| `src/app/(main)/results/page.tsx` | ShareButton 배치 |
| `src/app/(main)/search/page.tsx` | URL 파라미터 감지 → 조건 프리필 로직 |
| `src/components/input/SharedConditionBanner.tsx` | 새 컴포넌트: "공유된 조건으로 분석합니다" 배너 |

### F5. PWA 지원

#### 설계 결정

- **라이브러리**: `@ducanh2912/next-pwa` (Next.js 16 호환 검증 필요, 미호환 시 수동 구현)
- **캐시 전략**: Static assets → cache-first, API → network-first
- **오프라인 페이지**: 마지막 분석 결과를 캐시하여 오프라인에서도 조회 가능
- **매니페스트**: 앱명 "집분석", 테마 컬러 #0891B2 (Warm Teal Blue)

#### 구현 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/app/manifest.ts` | Next.js App Router 동적 매니페스트 |
| `public/sw.js` | 서비스 워커 (cache-first/network-first 전략) |
| `src/app/offline/page.tsx` | 오프라인 폴백 페이지 |
| `src/app/layout.tsx` | manifest 링크 + theme-color + appleWebApp 메타 |
| `next.config.ts` | SW 캐시 헤더 추가 |
| `src/components/pwa/ServiceWorkerRegistration.tsx` | 새 컴포넌트: SW 등록 |
| `src/components/pwa/InstallPrompt.tsx` | 새 컴포넌트: 앱 설치 배너 (7일 dismiss) |

## 검증 기준

1. **F1**: 커스텀 슬라이더 합계 100 제약 동작, 프리셋↔커스텀 전환 시 상태 유지
2. **F2**: 5단계 예산 결과 정상 반환, 진입/이탈 단지 표시 정확
3. **F3**: 카카오맵에 통근 경로 polyline 정상 렌더링
4. **F4**: 공유 URL로 접속 시 조건 프리필 + 금융정보 미포함 확인
5. **F5**: Lighthouse PWA 점수 ≥ 80, 오프라인 페이지 정상 표시
6. **공통**: TypeScript strict 통과, `any` 미사용, 기존 테스트 미파손

## 결과/결정

- 상태: `done`
- 5개 기능 모두 구현 완료 (F1→F4→F2→F3→F5 순서)
- TypeScript strict 컴파일 통과, `any` 미사용
- 후속 액션:
  - PWA 아이콘 PNG 파일 제작 필요 (현재 SVG 아이콘 사용 중, 디자인팀 작업 대기)
  - Lighthouse PWA 점수 검증 (배포 환경에서 실행)
  - ODsay graphPos 저장 시 F3 실제 경로 표시로 업그레이드 가능
