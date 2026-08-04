# Handoff: NEXT SWING — 골프 스윙 분석 앱 (32개 화면)

## Overview
NEXT SWING은 골프 연습 기록 + 프로/AI 스윙 분석 앱입니다. 이 패키지는 앱 전체 플로우 32개 화면의 하이파이 디자인 목업을 담고 있습니다: 홈/연습 기록(01–08), 프로 분석 요청 플로우(09–11), AI 분석 플로우(12–15), 스윙 업로드/갤러리/비교(16–23), 사전·플랜·결제(24–30), 피드백 뷰어(31–32).

## About the Design Files
이 번들의 파일들은 **HTML로 제작된 디자인 레퍼런스**입니다 — 의도된 룩앤필과 동작을 보여주는 프로토타입이지, 그대로 배포할 프로덕션 코드가 아닙니다. 할 일은 이 HTML 디자인들을 **대상 코드베이스의 기존 환경**(React, Vue, SwiftUI, 네이티브 등)에서 그 환경의 패턴과 라이브러리로 재구현하는 것입니다. 아직 환경이 없다면 프로젝트에 가장 적합한 프레임워크를 골라 구현하세요.

### 파일 구조 읽는 법
- 각 `NN-*.dc.html` 파일 = 화면 1개. `<x-dc>` 안의 마크업이 화면 본체이며 **모든 스타일이 인라인**으로 붙어 있어 그대로 측정값을 읽으면 됩니다.
- 화면 본체는 공통 프레임: 라벨 헤더 + `360×740px` 폰 프레임(`border-radius:34px`, 배경 `#FFFDF9`, 테두리 `#DDD6C8`). 폰 프레임 내부만 구현 대상입니다.
- `{{ ... }}` 홀과 `<script data-dc-script>`의 `class Component` 로직은 인터랙션 상태(탭 선택, 토글 등)를 나타냅니다.
- `00-index.dc.html`은 32개 화면을 한 판에 펼치는 보드 — 참고용 목차입니다.
- `support.js`는 목업 런타임 전용입니다. 구현에 포팅하지 마세요.

## Fidelity
**High-fidelity.** 색상, 타이포, 간격, 라운드, 그림자, 카피가 모두 최종안입니다. 픽셀 단위로 재현하되, 대상 코드베이스의 컴포넌트 시스템으로 구성하세요.

## Screens
| 파일 | 화면 |
|---|---|
| 01-2A-home | 홈 (메인 5탭) — 프로 진단 배너, 주간 통계, 연습 기록, 다음 피드백 |
| 02-2B-practice-calendar | 연습 캘린더 |
| 03-2C-practice-log-today | 오늘 연습 기록 |
| 04-2G-swing-record | 스윙 기록 |
| 05-2H-side-menu | 사이드 메뉴 |
| 06-2E-my-settings | 마이/설정 |
| 07-2F-swing-record-lesson | 스윙 기록 — 레슨 |
| 08-2F-1-lesson-detail | 레슨 상세 |
| 09-01-request-analysis | 프로 분석 요청 (영상 업로드 중심, CTA는 영상 등록 후 활성화) |
| 10-02-request-done | 요청 완료 |
| 11-03-analysis-hub | 분석 허브 |
| 12-04-ai-guide | AI 분석 가이드 |
| 13-05-ai-survey-1of8 | AI 설문 (1/8) |
| 14-06-ai-survey-upload | AI 설문 — 영상 등록 (정면/측면 선택, 스윙타입·클럽 종류 칩) |
| 15-07-ai-result | AI 분석 결과 |
| 16-08-swing-upload | 스윙 업로드 |
| 17-09-swing-gallery | 스윙 갤러리 |
| 18-10-single-analysis | 단일 스윙 분석 |
| 19-11-multi-compare | 다중 비교 |
| 20-12-pro-compare-hub | 프로 비교 허브 |
| 21-13-onboarding-popup | 온보딩 팝업 |
| 22-14-pro-single-analysis | 프로 스윙 단일 분석 |
| 23-15-pro-vs-mine | 프로 vs 내 스윙 |
| 24-16-golf-dictionary | 골프 용어 사전 |
| 25-17-plan-notice | 플랜 안내 |
| 26-18-plan-benefits | 플랜 혜택 |
| 27-19-offline-lesson | 오프라인 레슨 |
| 28-22-pay-notice | 결제 안내 |
| 29-23-web-checkout | 웹 결제 |
| 30-24-pay-done | 결제 완료 |
| 31-6C-feedback-tabs | 피드백 탭 뷰 |
| 32-6D-feedback-video | 피드백 영상 뷰 |

## Design Tokens
색상:
- 배경(앱): `#F3EFE8` / 카드 서피스: `#FFFDF9` / 보드 배경: `#EDEAE3`
- 프라이머리 (딥 그린): `#21402F` — CTA, 선택 상태, 강조
- 프라이머리 틴트: `#E6EDE7`, `rgba(31,61,43,.10)`
- 텍스트: 본문 `#1D2420`, 보조 `#6E6858`, 캡션/라벨 `#8A8375`, 비활성 `#BDB6A6`, `#A39C8C`
- 보더/디바이더: `#E4DED2`, `#DDD6C8`, `#F2ECE2`, 점선 `#CFC8B8`, 비활성 필 `#EFE9DE`, `#DED7C7`

타이포 (`board-fonts.css` 참조):
- 본문: Pretendard (sans) · 세리프 포인트: Hahmlet · 숫자: `var(--font-num)` (tabular-nums)
- 스케일: 캡션 10–11px, 본문 12–13px, 소제목 12.5px/600, 타이틀 15–22px, 통계 숫자 20px/700
- letter-spacing은 대체로 음수(-.01em ~ -.045em), 오버라인 라벨은 +.24em

간격/형태:
- 카드 radius 12–14px, 버튼/필 radius 7–11px, 폰 프레임 radius 34px
- 카드 패딩 12–16px, 카드 간 간격 10–16px, 섹션 간 큰 간격 32px(요청 화면 기준)
- 그림자: 카드 `0 1px 2px rgba(38,40,42,.04), 0 6px 16px -10px rgba(38,40,42,.16)`, 강조 배너 `0 10px 28px -14px rgba(31,61,43,.42)`

## Interactions & Behavior
- 하단 5탭 내비게이션 (홈/캘린더/기록/분석/마이)
- 09-01 분석 요청: 영상 미등록 시 CTA 비활성 + "영상을 등록하면 분석을 요청할 수 있습니다" 헬퍼 텍스트; 등록 시 활성화
- 14-06 AI 영상 등록: 정면/측면 탭 전환 (선택 시 solid 보더 + 흰 배경, 미선택 dashed 보더), 스윙타입/클럽 칩 단일 선택
- 칩/토글 선택 상태: 배경 `#21402F` + 흰 텍스트
- 각 파일의 `class Component` 로직(state, 핸들러)에 화면별 상태 전이가 코드로 명세되어 있음

## Assets
- 아이콘: 전부 인라인 SVG (24 viewBox, stroke 1.6–3, round cap/join) — 구현 시 Lucide 계열로 대체 가능
- 이미지: `image-slot.js` 플레이스홀더 사용 — 실제 사진/영상 썸네일로 교체 필요
- 폰트: `board-fonts.css`에 정의 (Pretendard, Hahmlet)

## Files
- `NN-*.dc.html` × 32 — 화면별 디자인 레퍼런스 (인라인 스타일, 측정값 소스)
- `00-index.dc.html` — 전체 보드 (목차)
- `board-fonts.css` — 폰트 및 `--font-*` 토큰
- `image-slot.js`, `support.js` — 목업 전용 런타임, 포팅 금지
