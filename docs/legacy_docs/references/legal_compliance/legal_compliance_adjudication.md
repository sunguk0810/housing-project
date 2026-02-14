# Legal Compliance Adjudication (GPT/Gemini/Claude)

작성일: 2026-02-13  
입력 문서:
- `docs/planning/references/legal_compliance/adjudication/gpt_result.md`
- `docs/planning/references/legal_compliance/adjudication/gemini_result.md`
- `docs/planning/references/legal_compliance/adjudication/claude_result.md`

## 1) Executive Summary (5줄 이내)
세 문서 모두 최상위 리스크를 `공인중개사법상 무등록 중개행위 오인`으로 본다. [source: gpt|gemini|claude]  
또한 개인정보 동의/파기/보호조치, 위치정보 신고·동의, 크롤링 금지를 MVP 단계 필수 통제로 제시한다. [source: gpt|gemini|claude]  
충돌은 주로 `CPA 허용 범위`, `위치정보 신고 시점`, `로그/APM 개인정보 통제 상세도`에서 발생한다. [source: gpt|gemini|claude]  
보수적으로는 거래성사형 CPA를 배제하고, 비GPS MVP + 신고 준비 병행, 비저장 아키텍처를 로그/APM까지 확장해야 한다. [source: gpt|gemini|claude]  
최종 판정은 `Conditional Pass`, Step3 Gate는 `pending`이다. [source: gpt|gemini|claude]

## 2) Consensus Summary (bullet 5개)
- 서비스 포지셔닝은 `정보 제공/분석`으로 고정하고 협상·계약·중개 행위를 배제해야 한다. [source: gpt|gemini|claude]
- 개인정보 수집 시 동의 분리(필수/선택), 처리방침, 파기, 보안 통제가 필수다. [source: gpt|gemini|claude]
- 위치기반 기능은 개인위치 수집 시 신고·동의·보호조치가 필요하다. [source: gpt|gemini|claude]
- 경쟁 플랫폼 크롤링은 고위험이며 공공데이터/제휴/외부링크 중심이 안전하다. [source: gpt|gemini|claude]
- 출시 전 법률 검토(공인중개사법 중심)를 게이트로 둬야 한다. [source: gpt|gemini|claude]

## 3) Disagreement Log (표)
| 항목 | GPT | Gemini | Claude | 채택값 | 근거 |
| --- | --- | --- | --- | --- | --- |
| 성과수수료/CPA 허용 범위 | 거래성사형은 위험, CPL 중심 완화 제안 [source: gpt] | 성공보수/알선은 중개행위 해석 위험 강조 [source: gemini] | 중개사 CPA를 고위험으로 명시 [source: claude] | `MVP에서 거래성사형 CPA 금지` | 보수값(금지) 채택 |
| 위치정보 신고 시점 | GPS 도입 전 단계적 준비 [source: gpt] | 위치기반서비스 신고·동의·보호조치 강조 [source: gemini] | 텍스트 입력 단계도 보수적 신고 권고 [source: claude] | `비GPS MVP + 신고 준비 병행(조기 착수)` | 실행가능성과 보수성 절충 |
| 개인정보 비저장 범위 | 세션 후 파기 강조 [source: gpt] | 동의/처리 체계 중심, 로그 상세는 약함 [source: gemini] | 로그/APM/모니터링까지 통제 필요 상세 제시 [source: claude] | `DB+로그+APM 전체 통제` | GPT+Claude 상세 근거 채택 |
| 표시·광고 세부기준(2025) 반영 | 상대적으로 약함 [source: gpt] | 관리비 비목, 주차, 층수 등 상세 반영 [source: gemini] | 중간 수준 [source: claude] | `Gemini 기준으로 전면 반영` | 규정 반영 상세도가 가장 높음 |
| 금융정보 기능 범위 | 정보제공 수준 권고 [source: gpt] | 특정상품 추천/수수료는 금융중개 리스크 경고 [source: gemini] | 정보제공형은 가능, 모집/비교중개는 후순위 [source: claude] | `MVP는 금융 정보제공만` | 공통 최소공배수 |
| 전자상거래/운영 규제 범위 | 부가통신사업 신고 가능성 언급 [source: gpt] | 통신판매업/환불/다크패턴까지 포괄 [source: gemini] | 통신판매업 + 에스크로 + 청약철회 [source: claude] | `유료화 전 통신판매업/환불정책 + 다크패턴 대응` | 누락 방지 위해 넓게 채택 |

## 4) Adjudicated Baseline (표)
> 입력 문서는 전환 CTR 수치 대신 법적 리스크 중심 문서이므로, KPI는 컴플라이언스 준비도 기준으로 통합했다. [가정]

| KPI | 보수 | 기준 | 낙관 | 비고 |
| --- | --- | --- | --- | --- |
| 중개행위 오인 리스크 | Critical [가정] | High [가정] | Medium [가정] | CTA/정산구조에 가장 민감 [source: gpt|gemini|claude] |
| 개인정보 잔존 리스크 (DB+로그+APM) | High [가정] | Medium [가정] | Low [가정] | 비저장+마스킹+로그정책 적용 시 하향 [source: gpt|claude] |
| 위치정보 컴플라이언스 준비도 | Low [가정] | Medium [가정] | High [가정] | 신고·약관·동의·보호조치 완료 여부 [source: gpt|gemini|claude] |
| 표시·광고 규정 반영도(2025) | Low [가정] | Medium [가정] | High [가정] | 관리비 비목/주차/층수 표기 반영 [source: gemini|claude] |
| 데이터 출처 컴플라이언스 | Low [가정] | Medium [가정] | High [가정] | 크롤링 금지 + 공공/제휴 데이터만 [source: gpt|gemini|claude] |

## 5) Decision
- Verdict: `Conditional Pass`
- fatal_found: `false`
- Step3 Gate: `pending`

판정 근거 3개:
1. 최상위 리스크는 높지만, 제품 기능/문구/정산구조 통제로 회피 가능한 범위다. [source: gpt|gemini|claude]
2. 개인정보·위치정보·광고 규제는 구현 통제(동의 분리, 비저장, 신고/약관, 로그 통제)로 관리 가능하다. [source: gpt|gemini|claude]
3. 다만 법률 자문, 신고 절차, 표시·광고 스키마 반영이 완료되기 전에는 Step3 확정 진입이 어렵다. [source: gpt|gemini|claude]

## 6) Legal & Compliance Implication
| 이슈 | 근거(source) | 리스크 수준 | 권장 대응 |
| --- | --- | --- | --- |
| 무등록 중개행위 오인 | [source: gpt|gemini|claude] | High | 협상/계약/알선 기능 배제, 거래성사형 CPA 금지, 약관/UI 문구 통제 |
| 성과수수료(CPA) 해석 리스크 | [source: gpt|gemini|claude] | High | MVP는 구독/CPL 중심, CPA는 법률 검토 후 재평가 |
| 개인정보 처리·동의·파기 | [source: gpt|gemini|claude] | High | 필수/선택 분리 동의, 처리방침 공개, 파기·권리행사 절차 구현 |
| 로그/APM 개인정보 잔존 | [source: claude|gpt] | High | request body 미기록, APM 마스킹, 보관·삭제 자동화 정책 |
| 위치기반서비스 신고·약관 | [source: gpt|gemini|claude] | Medium~High | 비GPS MVP 유지, GPS 도입 전 신고/약관/동의/보호조치 완료 |
| 광고성 정보 전송 | [source: gpt|claude] | Medium | 사전동의, 채널 분리, 야간 별도동의, 즉시 수신거부 반영 |
| 크롤링/무임승차 | [source: gemini|claude|gpt] | High | 크롤링 금지, 공공데이터/API 약관 준수, 제휴 데이터만 허용 |
| 2025 표시·광고 개정 대응 | [source: gemini|claude] | Medium | 관리비 비목, 주차대수, 층수 예외 표기 로직/DB 반영 |
| 유료화 시 통신판매업/환불 | [source: gemini|claude] | Medium | 유료 전환 전 신고, 결제·환불 정책, 다크패턴 방지 설계 |

## 7) Must-Do Top5
1. **P0**: 공인중개사법 기준으로 `중개 오인 기능/문구/정산` 제거(특히 거래성사형 CPA 금지). [source: gpt|gemini|claude]
2. **P0**: 동의체계(필수/선택) + 처리방침 + 이용약관 + 제3자 제공 고지를 버전 관리한다. [source: gpt|gemini|claude]
3. **P0**: 비저장 아키텍처를 DB뿐 아니라 로그/APM/모니터링까지 확장 적용한다. [source: gpt|claude]
4. **P1**: 위치기반서비스 신고/약관/동의/보호조치 체크리스트를 완성하고 GPS 기능은 그 이후 활성화한다. [source: gpt|gemini|claude]
5. **P1**: 공공/제휴 데이터만 사용하도록 소스 거버넌스를 고정하고 2025 표시·광고 개정을 시스템에 반영한다. [source: gemini|claude]

## 8) JSON Summary (코드블록)
```json
{
  "verdict": "Conditional Pass",
  "fatal_found": false,
  "step3_gate": "pending",
  "kpi": {
    "concierge_ctr": {
      "conservative": "N/A (legal compliance docs do not include CTR)",
      "baseline": "N/A (legal compliance docs do not include CTR)",
      "optimistic": "N/A (legal compliance docs do not include CTR)"
    },
    "landing_ctr": {
      "conservative": "N/A (legal compliance docs do not include CTR)",
      "baseline": "N/A (legal compliance docs do not include CTR)",
      "optimistic": "N/A (legal compliance docs do not include CTR)"
    },
    "min_input_completion": {
      "conservative": "N/A (legal compliance docs do not include this metric)",
      "baseline": "N/A (legal compliance docs do not include this metric)",
      "optimistic": "N/A (legal compliance docs do not include this metric)"
    }
  },
  "top_risks": [
    "Brokerage misclassification risk under licensed brokerage regulation",
    "Personal data persistence risk across DB/log/APM pipelines",
    "Location-service compliance risk when GPS features are activated"
  ],
  "must_do": [
    "P0: Remove brokerage-like CTA and transaction-based CPA",
    "P0: Separate required/optional consent and publish policy docs",
    "P0: Enforce no-storage controls across DB/log/APM",
    "P1: Complete location-service reporting and consent controls before GPS",
    "P1: Lock data-source governance (no crawling) and apply 2025 ad-display rules"
  ]
}
```
