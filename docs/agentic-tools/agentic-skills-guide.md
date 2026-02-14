# Agentic 개발을 위한 스킬 추천 가이드

> AI 에이전트 기반 개발 도구 및 스킬 큐레이션
> 작성일: 2026-02-14

---

## Agentic 개발이란?

AI 에이전트가 단순 코드 생성을 넘어, **자율적으로 계획-실행-검증**하는 개발 패러다임.
1인 개발자에게 특히 유용한 이유: AI가 팀원 역할을 대신하여 기획, 리뷰, 테스트, 배포까지 지원.

---

## 추천 Agentic 스킬 (카테고리별)

### A. Agent 아키텍처 & SDK

| 스킬                          | 설치 수 | 설명                                                      | 설치 명령어                                                                           |
| ----------------------------- | ------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **claude-agent-sdk**          | 379     | Claude Agent SDK 활용 가이드. 커스텀 에이전트 빌딩의 기초 | `npx skills add jezweb/claude-skills@claude-agent-sdk -g -y`                          |
| **agentic-development**       | 82      | Agentic 개발 패턴 및 베스트 프랙티스                      | `npx skills add alinaqi/claude-bootstrap@agentic-development -g -y`                   |
| **agent-native-architecture** | 77      | 에이전트 네이티브 설계 원칙. Compound Engineering 접근법  | `npx skills add everyinc/compound-engineering-plugin@agent-native-architecture -g -y` |

### B. 워크플로우 오케스트레이션

| 스킬                                | 설치 수 | 설명                                                | 설치 명령어                                                             |
| ----------------------------------- | ------- | --------------------------------------------------- | ----------------------------------------------------------------------- |
| **workflow-orchestration-patterns** | 1,700   | 에이전트 워크플로우 오케스트레이션 패턴 (높은 인기) | `npx skills add wshobson/agents@workflow-orchestration-patterns -g -y`  |
| **multi-agent-architect**           | 39      | 멀티 에이전트 시스템 설계                           | `npx skills add daffy0208/ai-dev-standards@multi-agent-architect -g -y` |

### C. MCP (Model Context Protocol) 서버

| 스킬                    | 설치 수 | 설명                            | 설치 명령어                                                        |
| ----------------------- | ------- | ------------------------------- | ------------------------------------------------------------------ |
| **mcp-cli**             | 186     | MCP 서버 CLI 활용 (GitHub 공식) | `npx skills add github/awesome-copilot@mcp-cli -g -y`              |
| **mcp-server-building** | 19      | 커스텀 MCP 서버 구축 가이드     | `npx skills add yonatangross/orchestkit@mcp-server-building -g -y` |

### D. 프롬프트 엔지니어링 & LLM 통합

| 스킬                       | 설치 수 | 설명                                     | 설치 명령어                                                                |
| -------------------------- | ------- | ---------------------------------------- | -------------------------------------------------------------------------- |
| **prompt-engineer**        | 200     | 효과적인 프롬프트 작성 기법              | `npx skills add davila7/claude-code-templates@prompt-engineer -g -y`       |
| **senior-prompt-engineer** | 135     | 고급 프롬프트 엔지니어링 전략            | `npx skills add alirezarezvani/claude-skills@senior-prompt-engineer -g -y` |
| **vercel-ai-sdk**          | 65      | Vercel AI SDK 활용 (스트리밍, 도구 호출) | `npx skills add fluid-tools/claude-skills@vercel-ai-sdk -g -y`             |

### E. RAG & 데이터 파이프라인

| 스킬                         | 설치 수 | 설명                                   | 설치 명령어                                                                     |
| ---------------------------- | ------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| **rag-implementation**       | 2,000   | RAG 시스템 구현 패턴 (매우 인기)       | `npx skills add wshobson/agents@rag-implementation -g -y`                       |
| **google-gemini-embeddings** | 304     | 임베딩 생성 및 벡터 처리               | `npx skills add jezweb/claude-skills@google-gemini-embeddings -g -y`            |
| **langchain-orchestration**  | 30      | LangChain 기반 에이전트 오케스트레이션 | `npx skills add manutej/luxor-claude-marketplace@langchain-orchestration -g -y` |

### F. 에이전트 프레임워크

| 스킬             | 설치 수 | 설명                                 | 설치 명령어                                                |
| ---------------- | ------- | ------------------------------------ | ---------------------------------------------------------- |
| **agno**         | 58      | Agno 프레임워크 (경량 에이전트 빌더) | `npx skills add delorenj/skills@agno -g -y`                |
| **swarm-expert** | 14      | Swarm 패턴 에이전트 설계             | `npx skills add desplega-ai/ai-toolbox@swarm-expert -g -y` |

---

## 1인 개발자를 위한 Agentic 필수 스킬 TOP 5

단계별로 도입하기 좋은 우선순위 추천:

### Phase 1: 기초 (바로 시작)

1. **claude-agent-sdk** - Claude 에이전트 개발의 출발점
2. **agentic-development** - Agentic 개발 패턴 이해

### Phase 2: 실전 (프로젝트 적용)

3. **workflow-orchestration-patterns** - 복잡한 워크플로우 자동화
4. **rag-implementation** - 지식 기반 에이전트 구축

### Phase 3: 고도화 (스케일업)

5. **vercel-ai-sdk** - 프로덕션 레벨 AI 기능 통합

### 한번에 설치하기

```bash
# Phase 1: 기초
npx skills add jezweb/claude-skills@claude-agent-sdk -g -y && \
npx skills add alinaqi/claude-bootstrap@agentic-development -g -y

# Phase 2: 실전
npx skills add wshobson/agents@workflow-orchestration-patterns -g -y && \
npx skills add wshobson/agents@rag-implementation -g -y

# Phase 3: 고도화
npx skills add fluid-tools/claude-skills@vercel-ai-sdk -g -y
```

---

## 전체 스킬 맵 (설치된 + 추천)

```
개발 사이클            설치됨(Core)                  추천(Agentic)
─────────────────────────────────────────────────────────────────
기획 Planning     ── product-management
설계 Design       ── ui-design-system          ── agent-native-architecture
                                                ── claude-agent-sdk
개발 Development  ── code-review               ── agentic-development
                                                ── workflow-orchestration
                                                ── rag-implementation
                                                ── vercel-ai-sdk
                                                ── prompt-engineer
테스트 Testing    ── webapp-testing
보안 Security     ── security-review
배포 Deploy                                    ── mcp-server-building
```

---

## 참고 링크

- Skills 마켓플레이스: https://skills.sh/
- Claude Agent SDK 문서: https://docs.anthropic.com/en/docs/agents
- MCP (Model Context Protocol): https://modelcontextprotocol.io/
- Vercel AI SDK: https://sdk.vercel.ai/
