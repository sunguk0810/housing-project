# Codex Task Template

## 작업

- 작업명: `<task-name>`
- 목적: `<why>`

## 참조 문서

- 정본: `docs/PHASE1_design.md > <section>`
- 관련 규칙: `docs/PHASE0_ground.md > S2 Metrics`, `docs/PHASE0_ground.md > S4 Legal Gate`

## 구현 범위

- 수정 파일:
- 비수정 파일:

## 체크리스트 (필수)

- [ ] 개인정보(연봉/주소)가 로그/DB에 저장되지 않는가
- [ ] 중개 오인 문구("추천" 대신 "분석 결과")를 사용하지 않는가
- [ ] 공공데이터 출처 표기가 포함되었는가
- [ ] TypeScript strict 모드 통과하는가

## 실행 명령

```bash
# 프로젝트 표준 명령으로 교체
npm run build
npm run lint
npm test
```

## 결과 보고 형식

### 변경점

- 파일별 핵심 변경 1줄 요약

### 검증 결과

- build: pass|fail
- lint: pass|fail
- test: pass|fail

### 리스크/후속

- 남은 리스크:
- 후속 작업:

## 커밋 정책

- Codex는 코드 생성/수정까지만 수행
- 커밋은 항상 개발자가 수동 실행
