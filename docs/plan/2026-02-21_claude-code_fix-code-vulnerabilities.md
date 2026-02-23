---
plan-id: "2026-02-21_claude-code_fix-code-vulnerabilities"
status: "done"
phase: "PHASE0-4"
template-version: "1.1"
work-type: "ops"
---

# 소스코드 취약점 분석 및 보완

## 목표

프로젝트 전체 소스코드의 보안 취약점을 체계적으로 분석하고, 식별된 취약점에 대한 보완 코드를 작성한다.

## 범위

- **분석 대상**: `src/` 전체 (API routes, middleware, DB, sanitize, components, ETL, lib)
- **인프라 대상**: `nginx/`, `Dockerfile`, `compose.*.yml`, `infra/`, `next.config.ts`
- **SoT 참조**: PHASE0 NFR-1 (개인정보 비저장), NFR-4 (데이터 거버넌스)
- **SoT 수정 없음**: 본 plan은 코드 수정만 수행하며 PHASE 문서의 SoT는 변경하지 않음

## 분석 결과 요약

### 전체 보안 상태 평가

프로젝트는 전반적으로 보안 기반이 잘 구축되어 있음:
- Zod 입력 검증, PII 마스킹 로거, HTML 이스케이프, Rate Limiter, CloudFront Origin Secret 등

그러나 아래 취약점들이 식별되었으며, 심각도 순으로 정리함.

---

## 식별된 취약점 목록

### [V-01] 보안 헤더 미설정 (심각도: HIGH)

**파일**: `next.config.ts`
**설명**: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy` 등 표준 보안 헤더가 응답에 포함되지 않음.
**위험**: 클릭재킹, MIME 스니핑, 크로스 사이트 데이터 유출 등.

**보완 방안**:
```typescript
// next.config.ts headers()에 보안 헤더 추가
{
  source: '/(.*)',
  headers: [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    { key: 'X-DNS-Prefetch-Control', value: 'on' },
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  ],
},
```

---

### [V-02] Health 엔드포인트 정보 노출 (심각도: MEDIUM)

**파일**: `src/app/api/health/route.ts:25-30, 68-73`
**설명**: Health check가 DB/Redis 에러 메시지를 외부에 노출함. 공격자가 내부 인프라 정보를 파악 가능.
또한 `npm_package_version`을 그대로 노출하여 특정 버전 취약점 공격에 활용 가능.

**보완 방안**:
- 에러 메시지를 `"unavailable"`로 일반화
- 버전 정보를 프로덕션에서 제거하거나 해시로 대체

---

### [V-03] IP 스푸핑을 통한 Rate Limiter 우회 (심각도: MEDIUM)

**파일**: `src/middleware.ts:32-38`, `src/lib/rate-limit.ts:45-51`
**설명**: `x-forwarded-for` 헤더를 신뢰하여 IP를 추출하므로, 프록시/CDN 앞단 없이 직접 접근 시 공격자가 헤더를 위조하여 Rate Limit를 우회 가능. CloudFront 뒤에 있다면 위험이 완화되지만, nginx가 `$proxy_add_x_forwarded_for`로 append하므로 첫 번째 값이 아닌 마지막 값을 사용해야 함.

**보완 방안**:
- nginx에서 `X-Real-IP`를 `$remote_addr`로 설정하고 이를 우선 사용
- 또는 `x-forwarded-for` 사용 시 **마지막** 값(가장 신뢰 가능한 값)을 사용하도록 변경
- CloudFront 환경에서는 `CloudFront-Viewer-Address` 헤더 사용 검토

---

### [V-04] 인메모리 Rate Limiter의 한계 (심각도: MEDIUM)

**파일**: `src/middleware.ts`, `src/lib/rate-limit.ts`
**설명**: Rate Limiter가 인메모리 `Map`에 기반하므로:
1. 서버리스/다중 인스턴스 환경에서 인스턴스 간 상태 공유 불가
2. 서버 재시작(cold start) 시 리셋됨
3. middleware와 route-level에 중복 Rate Limiter 존재 (코드 중복)

**보완 방안**:
- Redis 기반 Rate Limiter로 전환 (`getRedis()` 활용)
- middleware의 Rate Limiter와 route-level의 Rate Limiter를 통합
- Redis 미사용 시 현재 방식을 fallback으로 유지

---

### [V-05] `useKakaoMap` innerHTML XSS 위험 (심각도: MEDIUM)

**파일**: `src/hooks/useKakaoMap.ts:59, 96`
**설명**: `el.innerHTML = marker.content` 및 `el.innerHTML = content`에서 마커/오버레이 content를 그대로 innerHTML에 주입. `MiniPreview.tsx`에서는 `escapeHtml`을 적용하지만, `MapMarker.tsx`에서는 `rank`와 `score`가 숫자이므로 현재는 안전. 그러나 `useKakaoMap`의 인터페이스 자체가 안전하지 않아 향후 문자열 데이터가 추가될 경우 XSS 위험.

**보완 방안**:
- `useKakaoMap`에 sanitization 레이어 추가 (DOMPurify 또는 자체 sanitizer)
- 또는 content를 HTML 문자열 대신 DOM element 생성 방식으로 변경

---

### [V-06] Redis 캐시 키 인젝션 가능성 (심각도: LOW)

**파일**: `src/etl/adapters/kakao-geocoding.ts:67, 139`
**설명**: geocodeAddress에서 Redis 캐시 키를 `geocode:${normalized}`로 생성할 때 `sanitizeCacheKey`를 사용하지 않음. 악의적 주소 입력으로 Redis 명령어 인젝션은 ioredis에서 방지되지만, 키 충돌이나 예상치 못한 키 패턴 생성 가능.

**보완 방안**:
- `sanitizeCacheKey`를 적용하여 캐시 키 정규화

---

### [V-07] Dockerfile non-root 사용자 미설정 (심각도: LOW)

**파일**: `Dockerfile`
**설명**: 컨테이너가 root 사용자로 실행됨. 컨테이너 탈출 공격 시 호스트에 대한 권한이 확대될 수 있음.

**보완 방안**:
```dockerfile
# Stage 3에 추가
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
```

---

### [V-08] PostgreSQL/Redis 인증 미흡 (심각도: LOW)

**파일**: `compose.yml`, `compose.prod.yml`
**설명**:
- 개발 환경(`compose.yml`)에서 PostgreSQL이 `0.0.0.0:5432`에 바인딩되어 외부 접근 가능
- Redis에 비밀번호 설정 없음 (`requirepass` 미설정)
- 프로덕션에서는 `127.0.0.1`로 바인딩하여 완화되었지만 Redis 비밀번호는 여전히 없음

**보완 방안**:
- 개발 환경 PostgreSQL도 `127.0.0.1`에 바인딩
- Redis에 `requirepass` 설정 추가 (prod)

---

### [V-09] 에러 응답에서 내부 정보 노출 (심각도: LOW)

**파일**: `src/app/api/recommend/route.ts:494-519`
**설명**: catch 블록에서 `err.message`, `err.stack`, `err.code`, `err.cause`를 `console.error`로 기록하는 것은 적절하나, 개발 환경에서 로그가 클라이언트로 전달될 수 있음. 현재 클라이언트 응답은 일반화되어 있어 직접 노출은 없음. 다만, `stack` 트레이스가 로그에 기록되므로 로그 접근 권한 관리가 중요.

**보완 방안**:
- 프로덕션에서 `stack` 기록 여부를 환경변수로 제어
- 구조화된 로깅에서 `maskPii` 적용 확인

---

### [V-10] CORS 정책 미설정 (심각도: LOW)

**파일**: `next.config.ts`, API routes
**설명**: 별도 CORS 정책이 설정되지 않음. Next.js 기본값에 의존. API가 동일 도메인에서만 호출된다면 문제없으나, 명시적 CORS 설정이 보안 모범 사례.

**보완 방안**:
- API routes에 `Access-Control-Allow-Origin` 헤더를 명시적으로 설정
- 또는 next.config.ts headers에서 API routes에 대해 CORS 헤더 추가

---

## 작업 단계

| 단계 | 작업 | 대상 파일 | 심각도 |
|------|------|-----------|--------|
| 1 | 보안 헤더 추가 | `next.config.ts` | HIGH |
| 2 | Health 엔드포인트 정보 노출 제한 | `src/app/api/health/route.ts` | MEDIUM |
| 3 | Rate Limiter IP 추출 로직 개선 | `src/middleware.ts`, `src/lib/rate-limit.ts` | MEDIUM |
| 4 | innerHTML sanitization 보강 | `src/hooks/useKakaoMap.ts` | MEDIUM |
| 5 | Redis 캐시 키 sanitization 적용 | `src/etl/adapters/kakao-geocoding.ts` | LOW |
| 6 | Dockerfile non-root 사용자 설정 | `Dockerfile` | LOW |
| 7 | 개발 DB 외부 접근 차단 | `compose.yml` | LOW |
| 8 | 에러 로깅 stack trace 제어 | `src/app/api/recommend/route.ts` | LOW |

> 단계 4(인메모리 → Redis Rate Limiter 전환)는 구조 변경이 크므로 별도 Plan으로 분리 권장.
> 단계 10(CORS)는 현재 동일 도메인 운영이므로 즉시 작업보다 모니터링 후 판단.

## 검증 기준

- [x] `next.config.ts`에 보안 헤더 6종 포함 (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-DNS-Prefetch-Control, HSTS)
- [x] Health 엔드포인트에서 에러 메시지를 `"unavailable"`로 일반화, 프로덕션 버전 정보 제거
- [x] Rate Limiter IP 추출: `x-real-ip` 우선, XFF는 마지막 값 사용
- [x] `useKakaoMap`에서 innerHTML 사용 시 `stripDangerousHtml` 적용
- [x] geocode 캐시 키에 `sanitizeCacheKey` 적용
- [x] Dockerfile에 non-root `USER appuser` 지시어 포함
- [x] `compose.yml` PostgreSQL/Redis 포트가 `127.0.0.1`에 바인딩
- [x] 프로덕션 에러 로깅에서 stack trace 제외
- [x] `pnpm run build` 성공
- [x] 기존 테스트 통과 (22 files, 202 tests passed)
- [x] `pnpm run lint` 통과

## 결과/결정

**상태**: `done`

### 완료된 작업 (8건)

| ID | 취약점 | 심각도 | 수정 파일 |
|----|--------|--------|-----------|
| V-01 | 보안 헤더 추가 | HIGH | `next.config.ts` |
| V-02 | Health 정보 노출 제한 | MEDIUM | `api/health/route.ts`, `types/api.ts` |
| V-03 | Rate Limiter IP 스푸핑 방지 | MEDIUM | `middleware.ts`, `lib/rate-limit.ts` |
| V-05 | innerHTML XSS 방어 | MEDIUM | `hooks/useKakaoMap.ts`, `lib/sanitize.ts` |
| V-06 | 캐시 키 sanitization | LOW | `etl/adapters/kakao-geocoding.ts` |
| V-07 | Docker non-root 실행 | LOW | `Dockerfile` |
| V-08 | 개발 DB 외부 차단 | LOW | `compose.yml` |
| V-09 | 에러 로깅 stack 제어 | LOW | `api/recommend/route.ts` |

### 미착수 항목 (별도 Plan 권장)

| ID | 취약점 | 사유 |
|----|--------|------|
| V-04 | 인메모리→Redis Rate Limiter 전환 | 구조 변경 규모가 크므로 별도 Plan 분리 |
| V-10 | 명시적 CORS 정책 | 동일 도메인 운영이므로 모니터링 후 판단 |
