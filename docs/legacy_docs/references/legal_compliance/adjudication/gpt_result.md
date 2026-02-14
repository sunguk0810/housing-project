# Legal Compliance Adjudication (GPT/Gemini/Claude)

작성일: 2026-02-13  
입력 문서:
- `docs/planning/references/legal_compliance/gpt_result.md`
- `docs/planning/references/legal_compliance/gemini_result.md`
- `docs/planning/references/legal_compliance/claude_result.md`

## 1) Executive Summary (5줄 이내)
세 문서는 공통적으로 본 서비스의 최상위 리스크를 `공인중개사법상 중개행위 오인`으로 본다. [source: gpt|gemini|claude]  
또한 개인정보/동의/파기/보안 통제가 MVP 단계에서 필수라는 데 합의한다. [source: gpt|gemini|claude]  
위치정보는 GPS/개인위치 수집 시 신고·동의·보호조치가 필요하다는 점이 공통이다. [source: gpt|gemini|claude]  
경쟁사 매물 크롤링은 금지 또는 고위험으로 정리되며, 공공데이터/제휴/외부링크 중심이 권고된다. [source: gpt|gemini|claude]  
최종 판정은 `Conditional Pass`이며, Step3 게이트는 `pending`이다. [source: gpt|gemini|claude]

## 2) Consensus Summary (bullet 5개)
- `정보 제공`과 `중개`의 경계 관리가 핵심이며, 협상/계약 관여는 금지해야 한다. [source: gpt|gemini|claude]
- 처리방침, 동의 분리(필수/선택), 파기·보안 통제가 필요하다. [source: gpt|gemini|claude]
- 위치정보 기능은 단계적으로 도입하고, 개인위치 수집 시 법적 절차를 적용해야 한다. [source: gpt|gemini|claude]
- 타 플랫폼 크롤링은 위험하며, 공공데이터·합법 제휴·외부 링크 구조가 안전하다. [source: gpt|gemini|claude]
- 출시 전 법률 검토(특히 공인중개사법/표현·수익모델)는 필수 게이트다. [source: gpt|claude|gemini]

## 3) Disagreement Log (표)
| 항목 | GPT | Gemini | Claude | 채택값 | 근거 |
| --- | --- | --- | --- | --- | --- |
| 성과수수료/CPA 허용 범위 | 거래성사 기반은 중개 오인 리스크, CPL 중심 완화 권고 [source: gpt] | 거래알선/성공보수는 중개행위 해석 가능성 높게 경고 [source: gemini] | 중개사 CPA를 고위험/비권장으로 명시 [source: claude] | `MVP에서 거래성사 기반 CPA 금지` | 가장 보수값(금지) 채택 |
| 외부링크와 데이터 사용 경계 | 공공데이터+외부연결 중심 권고 [source: gpt] | 아웃링크라도 경쟁사 성과 무임승차 구조면 위험 강조 [source: gemini] | 크롤링 배제 시 외부링크는 상대 안전 [source: claude] | `크롤링/재호스팅 금지 + 공공/제휴 데이터만` | 3문서 공통 안전영역 |
| 위치정보 신고 적용 범위 | GPS/개인위치 수집 시 의무, 1단계 회피 설계 제시 [source: gpt] | 위치기반서비스 신고·동의·보호조치 강조 [source: gemini] | 텍스트 입력도 보수적으로 신고 검토 권고 [source: claude] | `GPS 도입 시 필수, MVP는 비GPS + 신고 준비 병행` | 보수값+실행가능성 절충 |
| 개인정보 비저장 해석 | 세션 후 파기 원칙 + 로그 잔존 리스크 상세 [source: gpt] | 동의/수집/보호 체계 강조(로그 구체성은 상대 약함) [source: gemini] | 로그/APM/모니터링도 저장으로 간주해 통제 권고 [source: claude] | `DB+로그+APM 전체 비저장/마스킹 통제` | GPT/Claude 상세 근거 채택 |
| 금융정보 기능 범위 | 정보제공/가이드 수준 권고, 중개성 기능 주의 [source: gpt] | 특정 대출상품 추천+수수료는 금융중개 리스크 경고 [source: gemini] | 정보제공형 어필리에이트는 가능, 모집/비교중개는 후순위 [source: claude] | `MVP는 정보제공만` | 공통 최소공배수 |

## 4) Adjudicated Baseline (표)
> 주의: 입력 문서에는 CTR/완료율 같은 수치 KPI가 없으므로, 아래는 법률 리스크 등급 KPI로 통합한 값이다. [가정]

| KPI | 보수 | 기준 | 낙관 | 비고 |
| --- | --- | --- | --- | --- |
| 중개행위 오인 리스크 | Critical [가정] | High [가정] | Medium [가정] | 거래성사형 보수/직접연결 여부에 크게 좌우 [source: gpt|gemini|claude] |
| 개인정보 잔존 리스크(DB+로그+APM) | High [가정] | Medium [가정] | Low [가정] | 비저장 아키텍처+로그 마스킹 적용 시 하향 [source: gpt|claude] |
| 위치정보 컴플라이언스 준비도 | Low [가정] | Medium [가정] | High [가정] | GPS 비도입+신고준비 병행 시 개선 [source: gpt|gemini|claude] |

## 5) Decision
- Verdict: `Conditional Pass`
- fatal_found: `false`
- Step3 Gate: `pending`

판정 근거:
1. 최상위 리스크(중개 오인)는 크지만, 기능/문구/정산구조 통제로 회피 가능한 영역으로 정리된다. [source: gpt|gemini|claude]
2. 개인정보·위치정보는 기술 통제(비저장, 동의 분리, 보호조치)로 관리 가능하나, 구현 누락 시 제재 리스크가 크다. [source: gpt|gemini|claude]
3. 크롤링 금지, 외부링크/공공데이터 중심, 출시 전 법률 검토를 게이트로 두면 MVP 진행 가능하다. [source: gpt|gemini|claude]

## 6) Legal & Compliance Implication
| 이슈 | 근거(source) | 리스크 수준 | 권장 대응 |
| --- | --- | --- | --- |
| 중개행위 오인(무등록 중개) | [source: gpt|gemini|claude] | High | 협상/계약/중개행위 배제, 거래성사형 CPA 금지, 약관/문구 통제 |
| 개인정보 처리·보관·파기 | [source: gpt|gemini|claude] | High | 필수/선택 동의 분리, 처리방침/파기정책, 접근통제·암호화 |
| 로그/APM 개인정보 잔존 | [source: gpt|claude] | High | request body 미기록, APM 마스킹, 로그 보관정책·삭제 자동화 |
| 위치정보 신고/동의/보호조치 | [source: gpt|gemini|claude] | Medium~High | MVP는 비GPS, GPS 도입 전 신고/약관/동의/보호조치 완료 |
| 광고성 정보 전송(마케팅) | [source: gpt|claude] | Medium | 사전동의, 철회 즉시 반영, 채널/야간 동의 분리 |
| 크롤링/DB 무임승차 | [source: gemini|claude|gpt] | High | 크롤링 금지, 공공데이터·제휴 데이터만 사용 |
| 유료화 시 통신판매업/환불정책 | [source: gemini|claude] | Medium | 유료 전환 전 신고·고지·환불정책 확정 |

## 7) Must-Do Top5
1. **P0**: 거래성사형 CPA/직접중개로 해석될 수 있는 CTA·정산 구조를 MVP에서 제거한다. [source: gpt|gemini|claude]
2. **P0**: 동의 체계를 필수/선택으로 분리하고, 처리방침/약관/면책 문구를 버전관리한다. [source: gpt|gemini|claude]
3. **P0**: 비저장 아키텍처를 DB뿐 아니라 로그/APM/모니터링까지 확장 적용한다. [source: gpt|claude]
4. **P1**: GPS 도입 전 위치정보 신고·이용약관·동의·보호조치 체크리스트를 완성한다. [source: gpt|gemini|claude]
5. **P1**: 공공데이터·제휴 데이터만 허용하고, 크롤링 금지 정책을 코드/운영 정책으로 고정한다. [source: gemini|claude|gpt]

## 8) JSON Summary (코드블록)
```json
{
  "verdict": "Conditional Pass",
  "fatal_found": false,
  "step3_gate": "pending",
  "kpi": {
    "concierge_ctr": {
      "conservative": "N/A (legal docs do not provide CTR)",
      "baseline": "N/A (legal docs do not provide CTR)",
      "optimistic": "N/A (legal docs do not provide CTR)"
    },
    "landing_ctr": {
      "conservative": "N/A (legal docs do not provide CTR)",
      "baseline": "N/A (legal docs do not provide CTR)",
      "optimistic": "N/A (legal docs do not provide CTR)"
    },
    "min_input_completion": {
      "conservative": "N/A (legal docs do not provide this metric)",
      "baseline": "N/A (legal docs do not provide this metric)",
      "optimistic": "N/A (legal docs do not provide this metric)"
    }
  },
  "top_risks": [
    "Brokerage misclassification risk under licensed brokerage rules",
    "Personal data persistence risk across DB/log/APM",
    "Location data compliance risk when GPS-based features are introduced"
  ],
  "must_do": [
    "P0: Remove transaction-based CPA and brokerage-like CTA",
    "P0: Separate mandatory/optional consent and publish policy docs",
    "P0: Enforce no-storage controls across DB/log/APM",
    "P1: Complete location-service reporting and consent controls before GPS",
    "P1: Enforce no-crawling data policy and source governance"
  ]
}
```
