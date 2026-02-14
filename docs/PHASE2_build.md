# PHASE 2: BUILD

> 이 문서는 빌드 마일스톤, 개발 루프, SoT 준수 체크리스트를 정의합니다.
> 스코어링 로직은 PHASE1 S4 참조. KPI/이벤트는 PHASE0 S2 참조. DB 스키마는 PHASE1 S2 참조.

## 1. 에이전트 페어 운영 모델

| 역할                     | 에이전트        | 담당                                                 |
| ------------------------ | --------------- | ---------------------------------------------------- |
| Planning / Creative      | **Claude Code** | 설계 판단, 코드 리뷰, 보안 감사, 문서 통합           |
| Domain-Specific / Detail | **Codex**       | ETL 스크립트, 스코어링 엔진, API 구현, 컴포넌트 구현 |

### 개발 루프

```
1. Claude Code: 작업 목표/설계 판단 → Codex 태스크 프롬프트 작성
2. Codex: 코드 생성 (체크리스트 포함 프롬프트 기반)
3. Claude Code: diff 리뷰 (code-review 스킬 자동 참조)
4. 개발자: 판단 후 수동 커밋
```

> 커밋은 항상 개발자가 직접 실행한다.

### Codex 태스크 프롬프트 템플릿

```
## 작업: [작업명]
## 참조 문서: docs/PHASE1_design.md > [섹션]
## 체크리스트:
- [ ] 개인정보(연봉/주소)가 로그/DB에 저장되지 않는가
- [ ] 중개 오인 문구("추천" 대신 "분석 결과") 사용하지 않는가
- [ ] 공공데이터 출처 표기가 포함되었는가
- [ ] TypeScript strict 모드 통과하는가
## 코드 작성 후 빌드+린트 실행할 것
```

## 2. 마일스톤

| 마일스톤           | 기간     | 작업                                                         | 에이전트    |
| ------------------ | -------- | ------------------------------------------------------------ | ----------- |
| **M1 Foundation**  | Week 1   | Next.js 초기화, DB+PostGIS, 디자인 토큰, 스키마 마이그레이션 | Claude Code |
| **M2 Data+Engine** | Week 2-3 | ETL, 스코어링 엔진, 통근 모듈, API Routes, Redis 캐시        | Codex       |
| **M3 Frontend**    | Week 4-5 | 3단 퍼널, 결과 페이지, 신뢰 UI, 컴플라이언스 페이지          | Codex       |
| **M4 Polish**      | Week 6   | 반응형, 성능, 이벤트 트래킹 구현, README                     | Claude Code |

### M1 Foundation (Week 1)

- [ ] `npx create-next-app@latest` + TypeScript strict 모드
- [ ] Tailwind CSS + shadcn/ui 설정
- [ ] 디자인 토큰 적용 (→ PHASE1 S7 참조)
- [ ] PostgreSQL + PostGIS 초기화
- [ ] `db/schema.sql` 생성 (→ PHASE1 S2에서 파생)
- [ ] 스키마 마이그레이션 스크립트
- [ ] `.env.example` + 환경변수 구조
- [ ] ESLint + Prettier 설정
- [ ] Husky + pre-commit hook 설정 (SoT 검사 포함)

### M2 Data+Engine (Week 2-3)

- [ ] ETL 수집 스크립트 (Python): 실거래가, 어린이집, 학교, CCTV
- [ ] 지오코딩 전처리 (Kakao Geocoding API)
- [ ] PostGIS 적재 스크립트
- [ ] 예산 계산 모듈 (LTV/DTI)
- [ ] 스코어링 엔진 구현 (→ PHASE1 S4 참조)
- [ ] 통근시간 모듈 (사전 계산 그리드 + ODsay API + Redis 캐시)
- [ ] `POST /api/recommend` 엔드포인트
- [ ] `GET /api/apartments/:id` 엔드포인트
- [ ] 입력값 검증 + PII 비저장 확인

### M3 Frontend (Week 4-5)

- [ ] 랜딩 페이지 (서비스 소개 + 면책 고지)
- [ ] StepForm 3단계 입력 (최소/정밀 분리)
- [ ] ConsentForm (필수/선택 동의 분리)
- [ ] 결과 페이지 (KakaoMap + ResultCardList)
- [ ] ScoreBreakdown 컴포넌트
- [ ] SourceBadge (출처/기준일 표시)
- [ ] OutlinkButton (외부 이동 고지)
- [ ] 컨시어지 리포트 페이지
- [ ] 이용약관/개인정보처리방침 페이지
- [ ] DisclaimerBanner + footer 링크

### M4 Polish (Week 6)

- [ ] 반응형 UI 검증 (mobile/tablet/desktop)
- [ ] 성능 최적화 (Redis 캐시, 이미지 최적화)
- [ ] 이벤트 트래킹 구현 (→ PHASE0 S2 이벤트 10개 참조)
- [ ] 접근성 검증 (키보드 탐색, 색약 팔레트)
- [ ] README 작성
- [ ] 코드 리뷰 (Claude Code code-review 스킬)

## 3. SoT 준수 체크리스트

> 매 기능 완료 시 아래 체크리스트를 확인합니다.

```
- [ ] 스코어링 로직 수정 시: PHASE1 S4가 유일한 수정 지점인가?
- [ ] 새 이벤트 추가 시: PHASE0 S2 Metrics에 정의가 있는가?
- [ ] DB 스키마 변경 시: PHASE1 S2를 먼저 수정했는가?
- [ ] 법무 UI 수정 시: PHASE0 S4 Legal Gate와 일치하는가?
- [ ] 다른 Phase 문서에 같은 내용을 복사하지 않았는가?
```

### CI 자동 검사 (pre-commit hook)

```bash
# 경로: scripts/check-sot.sh
# 실행: bash scripts/check-sot.sh (exit 1 시 커밋 차단)
# 훅 연결: .husky/pre-commit 에 등록 (npx husky 사용)
#
# PHASE0 전용 키워드 (PHASE1~4에 정의 금지):
#   concierge_contact_click, concierge_unique_view, inquiry_click,
#   min_input_complete, min_input_start, result_view,
#   landing_unique_view, outlink_click, consent_shown, consent_accepted
#
# PHASE1 전용 키워드 (PHASE0/2~4에 정의 금지):
#   CREATE TABLE, scoring_weight, normalize_score,
#   commute_grid, safety_stats, childcare_centers
#
# 위반 시 파일명+라인 출력 후 exit 1
```

## 4. 환경 변수

```
# .env.example
DATABASE_URL=postgresql://user:pass@localhost:5432/housing
REDIS_URL=redis://localhost:6379

# 공공 API
MOLIT_API_KEY=          # 국토교통부 실거래가
MOHW_API_KEY=           # 사회보장정보원 어린이집
MOE_API_KEY=            # 교육부 학교알리미
MOIS_API_KEY=           # 행정안전부 재난안전

# 지도/통근
KAKAO_REST_API_KEY=     # 카카오 지도/지오코딩
KAKAO_JS_KEY=           # 카카오 맵 JS SDK
ODSAY_API_KEY=          # ODsay 대중교통

# 분석
NEXT_PUBLIC_GA_ID=      # Google Analytics (선택)
```
