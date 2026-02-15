---
plan-id: showcase-fullscreen-pages
status: done
phase: phase2
template-version: "1.1"
work-type: implementation
---

# 디자인 시스템 쇼케이스 고도화 — 풀스크린 프리뷰 + 전체 페이지 구현

## 목표

현재 6개 페이지만 구현된 쇼케이스를 DESIGN_SYSTEM.md §4.1 사이트맵 기준 전체 16개 페이지로 확장하고, 풀스크린 프리뷰 모드를 추가하여 실제 앱 수준의 시각 검증 환경을 완성한다.

- 풀스크린 토글 기능으로 phone-frame 프리뷰 극대화
- 온보딩 5스텝 전체 구현
- 상태 변형(로딩/에러/빈 상태) 페이지 추가
- 누락 라우트(board, mypage, guide, auth, privacy, location-terms, map-detail) 전부 구현

## 범위

### 수정 대상
| 파일 | 변경 내용 |
|------|-----------|
| `showcase.css` | `.fullscreen-mode` CSS + `.fullscreen-toggle` 버튼 스타일 |
| `showcase.js` | `toggleFullscreen()` + NAV_SECTIONS 10개 항목 추가 |
| `page-landing.html` | 풀스크린 토글 버튼 추가 |
| `page-onboarding.html` | 5스텝 전체 구현으로 교체 |
| `page-results.html` | 풀스크린 토글 버튼 추가 |
| `page-detail.html` | 풀스크린 토글 버튼 추가 |
| `page-comparison.html` | 풀스크린 토글 버튼 추가 |
| `page-legal.html` | 풀스크린 토글 버튼 추가 |

### 생성 대상
| 파일 | 설명 |
|------|------|
| `page-board.html` | 커플 공유 보드 |
| `page-mypage.html` | 마이페이지 |
| `page-guide.html` | 주거 가이드 |
| `page-auth.html` | 로그인 |
| `page-privacy.html` | 개인정보처리방침 |
| `page-location-terms.html` | 위치정보 이용약관 |
| `page-loading.html` | 로딩 상태 |
| `page-error.html` | 에러 상태 |
| `page-empty.html` | 빈 상태 |
| `page-map-detail.html` | 지도 상세뷰 |

SoT 참조: PHASE1_design.md §4.3 사이트맵, DESIGN_SYSTEM.md §4.1

## 작업 단계

1. Plan 문서 생성 + README 갱신
2. showcase.css — 풀스크린 모드 CSS 추가
3. showcase.js — toggleFullscreen() + NAV 업데이트
4. 기존 6개 page-*.html — 풀스크린 토글 버튼 삽입
5. page-onboarding.html — 5스텝 전체 구현
6. page-board.html — 커플 공유 보드
7. page-mypage.html — 마이페이지
8. page-auth.html — 로그인
9. page-guide.html — 주거 가이드
10. page-privacy.html + page-location-terms.html
11. page-map-detail.html — 지도 상세뷰
12. page-loading.html — 로딩 상태
13. page-error.html — 에러 상태
14. page-empty.html — 빈 상태
15. 검증 + Plan 완료

## 검증 기준

- [x] 풀스크린 토글: 16개 page-*.html 모두 fullscreen-toggle 버튼 존재 확인
- [x] 다크모드: `.dark.fullscreen-mode` CSS 정의, 풀스크린/일반 모드 양립
- [x] 사이드바: 16개 페이지 NAV_SECTIONS 등록 (Pages 13 + States 3)
- [x] 온보딩: Step 1~5 탭 전환 JS 구현 + 분석 시퀀스 애니메이션
- [x] 바텀시트: page-map-detail Peek/Half/Expanded 3단 전환 구현
- [x] 컴플라이언스: Landing 푸터, Results 메타, Legal 본문에 면책 문구 존재
- [x] 빈 상태: page-empty 4가지 시나리오 (검색 0건/찜 비어/비교 없음/알림 없음)
- [x] 스켈레톤: page-loading skeleton 클래스 + shimmer 애니메이션 사용

## 결과/결정

- 상태: `done`
- 생성 파일: 10개 신규 page-*.html
- 수정 파일: showcase.css, showcase.js, 기존 6개 page-*.html, plan README
- Plan 문서: 본 문서 + README 인덱스 갱신
