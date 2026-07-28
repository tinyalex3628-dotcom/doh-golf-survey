# 앱 프로토타입에 스윙분석 넣기

회원용 스윙분석은 서버 없이 브라우저에서 완결되는 화면이라, 앱에 넣는 방법은 두 가지입니다.

## 방법 1 — 웹뷰로 열기 (권장, 가장 빠름)

앱에서 웹뷰(WebView)로 아래 주소를 열면 끝입니다. 로그인·서버 연동이 필요 없습니다.

```
https://<사이트주소>/swing                     ← 빈 상태로 시작 (갤러리에서 직접 선택)
https://<사이트주소>/swing?src=<영상URL>        ← 회원 영상이 A에 미리 로드된 상태
https://<사이트주소>/swing?src=...&src2=...    ← 비교 영상까지 미리 로드 (비교 모드로 시작)
```

- `src` 에는 앱이 이미 갖고 있는 영상 주소(서명 URL 등)를 넣습니다. URL 인코딩 필수.
- 화면은 처음부터 전체화면·다크 기준으로 만들어져 있어 앱 안에 그대로 얹어도 이질감이 없습니다.
- 웹뷰 설정: 카메라/갤러리 접근(파일 선택), 미디어 자동재생 허용이 필요합니다.
  - Android WebView: `setAllowFileAccess(true)`, `WebChromeClient.onShowFileChooser` 구현
  - iOS WKWebView: `allowsInlineMediaPlayback = true`, `mediaTypesRequiringUserActionForPlayback = []`

## 방법 2 — 컴포넌트로 직접 넣기 (프로토타입이 React일 때)

```tsx
import SwingAnalyzer from "@/components/swing/SwingAnalyzer";
import "@/components/swing/swing.css";

<SwingAnalyzer
  variant="member"                       // "member" = 모바일용, "pro" = PC 스튜디오용 엔진
  initialUrls={[영상URL, 비교영상URL]}     // 없으면 [null, null]
/>
```

필요 파일은 네 개가 전부입니다 (외부 의존성은 React뿐):

| 파일 | 역할 |
|---|---|
| `components/swing/SwingAnalyzer.tsx` | 화면 + 동작 (재생·비교·구간싱크·제스처) |
| `components/swing/swing.css` | 스타일 (차콜 다크, `sw-` 접두사라 충돌 없음) |
| `lib/swing/draw.ts` | 드로잉 엔진 (선·원·각도 렌더링) |
| `lib/swing/sync.ts` | (PC 전용 싱크 계산 — member 변형은 미사용) |

## 회원용에 들어 있는 기능 (2026.07 기준)

- 단독 / 2영상 비교 (세로·가로 모두, 영상 밀착 배치)
- 탭 = 재생/일시정지 · 슬라이딩바(드래그 중 프레임 실시간 추종) · 배속 0.1~1x · 반복 재생
- 두 손가락 핀치 확대/이동 (어떤 도구 상태에서든), 더블탭 리셋, 좌우 반전
- 드로잉: 실선 · 점선 · 원 · 펜 · 각도(3점, 도수 표시) + 되돌리기 · 리셋
- 구간·싱크 편집: 영상 문질러 프레임 탐색, 시작/끝 핸들, 두 스윙 타이밍 정렬

## 주의

- `src` 영상이 다른 도메인이면 그 서버가 CORS 와 Range 요청을 허용해야
  프레임 탐색이 부드럽습니다 (Supabase Storage 서명 URL은 둘 다 지원).
- 프로토타입에서 화면만 먼저 확인하려면 번들된 단일 HTML 데모를 쓰면 됩니다
  (빌드 없이 파일 하나로 동작 — 세션에서 만든 swing-demo 아티팩트와 동일한 방식).
