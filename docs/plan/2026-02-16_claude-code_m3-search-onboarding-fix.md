---
plan-id: m3-search-onboarding-fix
status: done
phase: m3
template-version: "1.1"
---

# /search 온보딩 프로세스 점검 및 수정

## 목표

`/search` 페이지의 온보딩 Step2 직장위치 입력이 동작하지 않는 문제 해결.
근본 원인: AddressSearch가 `<span>`으로 값 표시만 하여 직접 입력 불가, Kakao SDK 미로드 시 팝업도 안 열리며 에러 피드백 없음.

## 범위

| # | 파일 | 변경 유형 |
|---|------|----------|
| 1 | `.env` | 수정 — `NEXT_PUBLIC_KAKAO_APP_KEY` 추가 |
| 2 | `src/app/layout.tsx` | 수정 — Script strategy `lazyOnload` → `afterInteractive` |
| 3 | `src/hooks/useKakaoAddress.ts` | 수정 — onclose reject, SDK 로드 상태 반응형 |
| 4 | `src/components/input/AddressSearch.tsx` | 수정 — `<span>` → `<input>`, 에러 피드백, SDK 상태 UI |
| 5 | `src/components/input/steps/Step5Analysis.tsx` | 수정 — 재시도 로직 (hasStarted ref → retryCount state) |
| 6 | `src/hooks/useStepForm.ts` | 수정 — stepFormSchema에 max() 제약 추가 |

SoT 참조: PHASE1 설계문서 S4 (스코어링/검증 로직)

## 작업 단계

### 1. 환경변수 + Script 전략 (P0)
- `.env`에 `NEXT_PUBLIC_KAKAO_APP_KEY=` 추가 (빈 값, 주석 안내)
- `layout.tsx`에서 Script strategy를 `afterInteractive`로 변경

### 2. useKakaoAddress 훅 수정 (P1)
- `onclose` 콜백에서 `reject(new Error("cancelled"))` 호출 → Promise 정상 종료
- `useSyncExternalStore`로 SDK 로드 상태를 반응형으로 제공 (이전: 함수 참조만 반환)

### 3. AddressSearch `<span>` → `<input>` 전환 (P0 핵심)
- `<span>` → `<input type="text">` 전환 → 사용자 직접 주소 타이핑 가능
- SDK 미로드 시 "주소 검색" 버튼 클릭 → 인라인 안내 메시지 표시
- SDK 로드 시 팝업 결과로 input 값 덮어쓰기
- catch에서 "cancelled" 에러 무시, 나머지는 안내

### 4. Step5 재시도 수정 (P1)
- `hasStarted` ref 제거 → `retryCount` state로 대체
- `useEffect` deps에 `retryCount` 추가
- cleanup에서 `controller.abort()` + `clearTimeout`
- `activeIndex`, `error` 리셋

### 5. 프론트엔드 검증 강화 (P2)
- `stepFormSchema`에 `max()` 제약 추가: cash 5,000,000 / income 1,000,000 / loans 5,000,000 / monthlyBudget 10,000

## 검증 기준

- [x] `pnpm build` — 타입 에러 0
- [x] `pnpm vitest --run` — 132개 테스트 전체 통과, 회귀 없음
- [x] AddressSearch에서 직접 텍스트 입력 가능 (`<input>` 전환 완료)
- [x] SDK 미로드 시 "주소 검색" 버튼 클릭 → 안내 메시지 표시
- [x] useKakaoAddress의 onclose가 Promise를 reject하여 메모리 누수 방지
- [x] Step5 "다시 시도" 버튼이 retryCount 증가로 useEffect 재실행
- [x] stepFormSchema에 max() 제약 적용됨

## 결과/결정

**상태: `done`**

모든 수정 사항 적용 완료. 빌드 및 테스트 검증 통과.

### 후속 참고
- `NEXT_PUBLIC_KAKAO_APP_KEY`에 실제 키 설정 시 Daum Postcode 팝업이 정상 동작
- `USE_MOCK_DATA=true` 환경에서는 직접 입력한 주소 텍스트가 Mock 지오코더로 좌표 변환됨
