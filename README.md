# DOH Golf — 스윙 코칭 앱

아마추어 골퍼가 스윙을 촬영·분석하고, 프로의 스윙과 비교하며, 프로에게 문의하고
관리 플랜(구독)으로 전환하는 모바일 골프 코칭 앱.

이 저장소는 [Expo](https://expo.dev) (React Native) 로 구현된 앱입니다.
`design-reference/` 의 디자인 핸드오프(HTML 프로토타입)를 네이티브 앱으로 재현했습니다.

## 실행 방법

```bash
npm install          # 의존성 설치
npx expo start       # 개발 서버 시작
```

- 휴대폰에서 **Expo Go** 앱으로 QR 코드를 스캔하면 실기기에서 바로 확인할 수 있습니다.
- 시뮬레이터: `npx expo start` 실행 후 터미널에서 `i`(iOS) / `a`(Android).
- 타입체크: `npx tsc --noEmit`

## 프로젝트 구조

```
App.tsx                     앱 진입점 — 네비게이터 + 전역 하단 탭바 + 프로바이더
src/
  theme/tokens.ts           디자인 토큰 (색·간격·타이포·그림자) — 단일 출처
  navigation/
    pages.ts                전체 화면(route) 정의 + 탭 매핑
    useNav.ts               타입 지정 네비게이션 헬퍼
  state/comparison.tsx      프로 비교 플로우 공유 상태 (pro/cam 선택)
  components/               공용 UI (Screen, TopBar, TabBar, ui, BottomSheet,
                            Toast, SwingStage, PositionControls, UploadSlots …)
  screens/                  22개 화면
  data/                     더미 데이터 (plans 등)
design-reference/           디자인 헌법(Architecture)·Node 라이브러리·플로우 프로토타입
```

## 화면 구성 (22개)

| 탭 | 화면 |
|---|---|
| 홈 | `home` · `homework`(4개 상태) |
| 스윙분석 | `hub1` · `aiSurvey`(멀티 페이즈 마법사) · `upload` · `gallery` · `single` · `multi` |
| 스윙분석(프로 비교) | `hub2` · `proSelect` · `camera` · `proSolo` · `proCompare` · `feedback` |
| 골프사전 | `dict`(실시간 검색) |
| 프로필 | `profile` · `subscription` · `subBenefits` · `subOffline` · `subPro` · `subFeedback` · `membership` |

## 앱 셸

폰 화면은 3층 구조입니다.
1. **상단바** — 홈은 `DOH` 워드마크, 그 외엔 뒤로가기 + 제목.
2. **스크롤 본문** — 화면별 콘텐츠. 전진 시 슬라이드 인 애니메이션.
3. **하단 탭바** — 홈/스윙분석/골프사전/프로필. 현재 화면의 탭이 활성화.

전역 오버레이: 바텀시트(팝업), 토스트(1.7초 자동 소멸).

## 아직 더미/플레이스홀더인 부분

디자인 명세대로, 실제 데이터 연동이 필요한 부분은 "준비 중" 플레이스홀더입니다.
- 스윙 영상 촬영·재생 (현재는 실루엣 가이드 + 그라디언트 플레이스홀더)
- AI 스윙 분석 결과 (현재는 예시 점수·피드백)
- 프로 영상, 골프 사전 데이터, 오프라인 레슨 지도, 구독 결제

향후 `expo-camera`, `expo-av`, 백엔드 API 연동으로 채우면 됩니다.
