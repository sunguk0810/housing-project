---
plan-id: "2026-02-20_claude-code_portfolio-deploy"
status: "partial"
phase: "PHASE0-4"
template-version: "1.1"
work-type: "infra"
---

# 포트폴리오 배포 — Lightsail + Docker Compose + Terraform

## 목표

housing-project를 포트폴리오 공개 목적으로 AWS Lightsail 단일 인스턴스에 Docker Compose로 배포한다. 인프라는 Terraform IaC로 관리한다.

## 범위

- Phase A: 코드 품질 수정 + SoT 갱신 (PHASE1, PHASE4 문서 수정)
- Phase B: Docker 배포 준비 (Dockerfile, compose.prod.yml, nginx)
- Phase C: metadataBase + 헬스체크 보강
- Phase D: Terraform IaC 코드 작성 (infra/)
- Phase E: 배포 가이드 + 이관 스크립트 (사용자 실행)
- Phase F: .gitignore 갱신 + 최종 검증

SoT 수정 대상: `docs/PHASE1_design.md` S1 Deploy 항목, `docs/PHASE4_ship_learn.md` Release/Rollback 항목

## 작업 단계

### Phase A: 코드 품질 (Claude Code 실행)
- [x] A-1: 환경변수 불일치 수정 (KAKAO key 통일)
- [x] A-2: Middleware rate limit 정리
- [x] A-4: 컴플라이언스 스캔 → 위반 0건 확인
- [x] A-5: SoT 문서 갱신
- [x] A-6: partial plan 정리 (commute-schema-sync 등)
- [x] A-7: 1회용 스크립트 정리

### Phase B: Docker 배포 (Claude Code 실행)
- [x] B-1: next.config.ts — standalone 출력 추가
- [x] B-2: Dockerfile 작성 (multi-stage)
- [x] B-3: .dockerignore 작성
- [x] B-4: compose.prod.yml 작성
- [x] B-5: nginx/default.conf.template 작성
- [x] B-6: .env.production.example 작성

### Phase C: metadataBase + 헬스체크 (Claude Code 실행)
- [x] C-1: metadataBase 설정
- [x] C-2: 헬스체크 → Redis 실패 시에도 200 반환

### Phase D: Terraform IaC (Claude Code 작성, 사용자 apply)
- [x] D-1~D-6: infra/ 디렉토리 전체 작성

### Phase E: 배포 가이드 (사용자 실행)
- [x] E-1~E-5: 배포 가이드 문서 작성 (`docs/DEPLOY_GUIDE.md`)
- [ ] 사용자 실행: terraform apply + 서버 배포 + Smoke Test

### Phase F: 마무리
- [ ] F-1: README 업데이트 (배포 후)
- [x] F-2: .gitignore 갱신 (Terraform/production 항목 추가)
- [x] F-3: `pnpm run build` 성공 확인

## 검증 기준

- [x] 환경변수명 코드/env 일치 (`NEXT_PUBLIC_KAKAO_JS_KEY` 통일)
- [x] `pnpm run build` 성공 (standalone 모드)
- [ ] Docker 이미지 빌드 성공 (로컬 테스트 필요)
- [ ] `terraform validate` 성공 (사용자 실행)
- [x] 컴플라이언스 스캔 통과 (위반 0건)
- [x] SoT 문서 정합성 (PHASE1 S1 Deploy, PHASE4 Release/Rollback 갱신)

## 결과/결정

**상태**: `partial`

코드 레벨 작업(Phase A~D + F) 완료. 남은 항목:
- Docker 이미지 로컬 빌드 테스트 (B-7)
- Terraform apply (사용자 실행)
- 서버 배포 + Smoke Test (사용자 실행)
- README 최종 업데이트 (배포 후)

## Verification

### Run 1 (2026-02-20)

```json
{
  "phase": "PHASE0-4",
  "verdict": "pending",
  "run": 1,
  "score": {
    "completeness": 0.85,
    "consistency": 1.0,
    "compliance": 1.0
  },
  "blockers": [],
  "next_actions": [
    "로컬 Docker 빌드 테스트 (compose.prod.yml)",
    "terraform init && terraform apply (사용자 실행)",
    "서버 배포 + pg_restore + Smoke Test",
    "README 업데이트"
  ],
  "timestamp": "2026-02-20"
}
```
