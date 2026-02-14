# Step3 Readiness Prompt Set — Claude 최적화 버전

## 무엇이 바뀌었나

| 개선 항목 | 기존 | 최적화 |
|---|---|---|
| **구조** | 마크다운 헤딩 + `[ ]` 혼용 | `<role>` `<context>` `<rules>` `<tasks>` `<output_format>` XML 태그 분리 |
| **역할 부여** | 한 줄 역할명만 | 역할 + 전문 영역 + 판단 기준까지 명시 → 응답 품질 상승 |
| **분화 축** | "3안 작성" (기준 없음) | 안마다 소구 방향을 지정 → 표면적 중복 방지 |
| **사고 유도** | 없음 | "먼저 참고 문서 섹션을 식별한 뒤 진행", "낙관 편향 자문" 등 삽입 |
| **근거 규칙** | `[source: 파일명]` 만 언급 | 예시 포함 → Claude가 형식을 정확히 따름 |
| **출력 형식** | 테이블 스켈레톤만 | 셀 단위 기대값 가이드 + 분량 힌트 추가 |

## 실행 순서

1. `prompt_1_teaser.md`
2. `prompt_3_commute_label.md`
3. `prompt_4_trust_copy_ab.md`
4. `prompt_5_gate_validation.md`
5. `prompt_6_adjudication.md`

## 사용법

1. Claude 대화창에 해당 프롬프트의 코드블록(``` 안의 내용)을 복사해서 입력
2. 관련 문서를 파일로 첨부
3. 산출물은 `docs/planning/references/step3_readiness/results/`에 저장
4. 통합은 `results/step3_readiness_adjudication_template.md`로 작성 후 최종본을 `results/step3_readiness_adjudication.md`에 저장

## 팁

- **프롬프트 체이닝**: 앞 프롬프트의 산출물을 다음 프롬프트에 함께 첨부하면 일관성이 올라갑니다.
- **분할 실행**: 출력이 너무 길면 `<tasks>`에서 1-3번 / 4-5번으로 나눠 실행하세요.
- **커스텀**: 분화 축(A/B/C안 기준)은 팀 상황에 맞게 바꿔도 됩니다.
