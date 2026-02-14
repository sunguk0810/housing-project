# 설치된 스킬 목록 (Installed Skills)

> 1인 개발자를 위한 전체 개발 사이클 커버 스킬셋
> 설치일: 2026-02-14

## 설치 완료된 핵심 스킬 (5개)

### 1. product-management
- **출처**: `vasilyu1983/ai-agents-public@product-management`
- **용도**: 제품 기획 및 관리
- **활용 시점**: 프로젝트 초기 기획, PRD 작성, 사용자 스토리 정의
- **설치 경로**: `~/.agents/skills/product-management`

### 2. ui-design-system
- **출처**: `davila7/claude-code-templates@ui-design-system`
- **용도**: UI 디자인 시스템 구축 가이드
- **활용 시점**: 컴포넌트 설계, 디자인 토큰 정의, 일관된 UI 구현
- **설치 경로**: `~/.agents/skills/ui-design-system`

### 3. code-review
- **출처**: `skillcreatorai/ai-agent-skills@code-review`
- **용도**: 셀프 코드 리뷰 체크리스트
- **활용 시점**: PR 생성 전, 코드 품질 점검, 리팩토링 판단
- **설치 경로**: `~/.agents/skills/code-review`

### 4. webapp-testing
- **출처**: `anthropics/skills@webapp-testing` (Anthropic 공식)
- **용도**: 웹 애플리케이션 테스트 전략
- **활용 시점**: 단위/통합/E2E 테스트 작성, 테스트 커버리지 개선
- **설치 경로**: `~/.agents/skills/webapp-testing`
- **설치 수**: 9,700+ (가장 인기 있는 스킬)

### 5. security-review
- **출처**: `affaan-m/everything-claude-code@security-review`
- **용도**: 보안 취약점 점검
- **활용 시점**: 배포 전 보안 감사, OWASP Top 10 점검, 의존성 취약점 확인
- **설치 경로**: `~/.agents/skills/security-review`

## 스킬 관리 명령어

```bash
# 설치된 스킬 업데이트 확인
npx skills check

# 모든 스킬 업데이트
npx skills update

# 새 스킬 검색
npx skills find [검색어]

# 스킬 추가 설치
npx skills add <owner/repo@skill> -g -y
```
