---
plan-id: "2026-02-23_claude-code_code-review-security"
status: "done"
phase: "PHASE0-4"
template-version: "1.1"
work-type: "ops"
---

# Plan Execute: 소스코드 보안 및 리팩토링 리뷰

## 목표

- 전체 소스코드에 대한 보안 취약점 식별 및 수정, 코드 품질 개선 리팩토링을 수행한다.
- OWASP Top 10 기준의 보안 위험 요소를 제거하고, 프로덕션 배포 전 코드 안정성을 확보한다.

## 범위

- **In Scope:**
  - API 라우트 보안 (입력 검증, 에러 처리, SSRF 방지)
  - 미들웨어 및 Rate Limiting 보안 강화
  - 클라이언트 XSS 방지 (sanitize, innerHTML, 외부 스크립트)
  - 인프라/설정 보안 (Nginx, Docker, Terraform, Next.js 헤더)
  - ETL 어댑터 코드 품질 및 타입 안전성
  - 스코어링 엔진 에러 처리 및 성능
  - 로깅/모니터링 개선

- **Out of Scope:**
  - 기능 추가 또는 UI/UX 변경
  - DB 스키마 변경 (PHASE1 SoT 영역)
  - 테스트 코드 신규 작성 (기존 테스트 수정만 해당 시 포함)
  - Terraform apply (인프라 변경은 코드 수준에서만)

- **참조 SoT:** `docs/PHASE0_ground.md` (NFR-1 개인정보 비저장, NFR-4 데이터 거버넌스), `docs/PHASE1_design.md`

## 작업 단계

### Phase A: CRITICAL 보안 수정 (즉시)

| # | 작업 | 파일 | 심각도 |
|---|------|------|--------|
| A-1 | Rate Limiter IP 스푸핑 방지: `getClientIp()`에 IP 형식 검증 추가 | `src/lib/rate-limit.ts` | CRITICAL |
| A-2 | Redis 에러 핸들러에서 자격증명 로깅 방지 | `src/lib/redis.ts` | CRITICAL |
| A-3 | 스택 트레이스 노출 조건 수정: `!== 'production'` → `=== 'development'` | `src/lib/handlers/api-error.ts` | CRITICAL |
| A-4 | Health 엔드포인트 버전 노출 조건 동일하게 수정 | `src/app/api/health/route.ts` | CRITICAL |
| A-5 | Nginx CF-Secret 검증 로직 fail-secure로 수정 | `nginx/default.conf.template` | CRITICAL |

### Phase B: HIGH 보안 수정

| # | 작업 | 파일 | 심각도 |
|---|------|------|--------|
| B-1 | Kakao API 응답에 Zod 스키마 검증 추가 | `src/app/api/kakao-local/route.ts` | HIGH |
| B-2 | recommend API의 job 주소 입력에 zero-width 문자 스트립 및 최소 길이 검증 추가 | `src/lib/validators/recommend.ts` | HIGH |
| B-3 | Rate Limit 초과 시 보안 이벤트 로깅 추가 | `src/middleware.ts`, `src/app/api/kakao-local/route.ts` | HIGH |
| B-4 | `stripDangerousHtml` 함수 보강 (SVG, 데이터 URI 등 추가 벡터 차단) | `src/lib/sanitize.ts` | HIGH |
| B-5 | `useKakaoMap` innerHTML 사용부에 `escapeHtml` 적용 강화 | `src/hooks/useKakaoMap.ts` | HIGH |
| B-6 | Next.js 보안 헤더 추가: CSP, X-XSS-Protection, X-Permitted-Cross-Domain-Policies | `next.config.ts` | HIGH |
| B-7 | 외부 스크립트 로딩에 `https://` 명시적 프로토콜 적용 | `src/app/layout.tsx` | HIGH |
| B-8 | GTM ID 형식 런타임 검증 추가 | `src/app/layout.tsx` | HIGH |

### Phase C: MEDIUM 리팩토링 및 보안 개선

| # | 작업 | 파일 | 심각도 |
|---|------|------|--------|
| C-1 | `useSessionStorage` 에 타입 검증 가드 추가 (`as T` 제거) | `src/hooks/useSessionStorage.ts` | MEDIUM |
| C-2 | `useKakaoAddress` SDK 로딩 폴링을 최대 시도 횟수 제한으로 변경 | `src/hooks/useKakaoAddress.ts` | MEDIUM |
| C-3 | CompareContext 하이드레이션/싱크 레이스 컨디션 수정 | `src/contexts/CompareContext.tsx` | MEDIUM |
| C-4 | Nginx `server_tokens off` 추가 | `nginx/default.conf.template` | MEDIUM |
| C-5 | ETL 어댑터 API 키 URL 노출 시 마스킹 로깅 일관성 확보 | `src/etl/adapters/molit.ts`, `odsay-grid.ts` | MEDIUM |
| C-6 | MOLIT 어댑터 XML 파싱 타입 가드 추가 (unsafe cast 제거) | `src/etl/adapters/molit.ts` | MEDIUM |
| C-7 | ETL runner 반복 Rate Limiter 체크 로직 유틸 함수로 추출 | `src/etl/runner.ts` | MEDIUM |

### Phase D: LOW 개선 사항

| # | 작업 | 파일 | 심각도 |
|---|------|------|--------|
| D-1 | DB 연결 문자열 URL 형식 기본 검증 추가 | `src/db/connection.ts` | LOW |
| D-2 | AmountInput 숫자 상한 검증 (JavaScript 정밀도 한계 방지) | `src/components/input/AmountInput.tsx` | LOW |
| D-3 | Consent 상태 저장 구조화 (단순 `'true'` 문자열 → 객체) | `src/components/input/StepWizard.tsx` | LOW |

## 검증 기준

1. **보안 검증**: 모든 CRITICAL/HIGH 항목의 코드 수정 완료 및 기존 테스트 패스
2. **빌드 검증**: `pnpm build` 성공
3. **린트 검증**: `pnpm lint` 에러 없음
4. **기존 테스트 통과**: `pnpm test` 기존 테스트 전체 패스
5. **회귀 없음**: API 라우트 동작, 미들웨어 Rate Limiting, 페이지 렌더링 정상
6. **SoT 무변경**: PHASE0/PHASE1 SoT 문서 미수정 확인

## 결과/결정

- **상태:** `done`
- **핵심 결과:**
  - CRITICAL 5건, HIGH 8건, MEDIUM 4건, LOW 3건 총 20건 보안/리팩토링 수정 완료
  - lint 통과, 22파일 202개 테스트 전체 통과, TypeScript 컴파일 성공
  - 변경 파일 19개, 코드 변경량 +166/-71 (Phase A/B), +건 (Phase C/D)
- **미해결 이슈:**
  - C-5 (ETL API 키 URL 마스킹), C-6 (MOLIT XML 타입 가드) — ETL 어댑터 대규모 리팩토링 필요하여 별도 Plan으로 분리 권장
- **다음 액션:**
  - Nginx fail-secure 전환에 따라 로컬 개발 환경에서 `CF_SECRET_BYPASS=true` 환경변수 설정 필요
  - CSP 헤더 추가 후 프로덕션 배포 시 브라우저 콘솔에서 CSP 위반 모니터링 필요

## Verification 이력

<!-- Run을 누적 추가한다. 덮어쓰기 금지. 최신 Run이 유효 verdict. -->

### Run 1 (2026-02-23)

```json
{
  "phase": "PHASE0-4",
  "verdict": "go",
  "run": 1,
  "score": {
    "completeness": 0.9,
    "consistency": 1.0,
    "compliance": 1.0
  },
  "blockers": [],
  "next_actions": ["CSP 헤더 프로덕션 모니터링", "ETL 어댑터 리팩토링 별도 Plan"],
  "timestamp": "2026-02-23"
}
```

## 체크리스트

- [x] 파일명 규칙 충족
- [x] 필수 섹션 5개 존재
- [x] SoT 참조 경로 포함
- [x] 자동 커밋 없음 (수동 커밋 정책 준수)
- [x] YAML frontmatter 포함 (plan-id, status, phase)
- [ ] depends-on 참조 plan의 condition 평가 충족 확인 (해당 없음)
