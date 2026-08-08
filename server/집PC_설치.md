# 집 PC에서 DOH 스윙분석 웹 돌리기 (윈도우 · RTX GPU)

콜랩 안 만지고, **집 PC에서 서버 한 번 켜면 → 브라우저에서 영상 올리고 결과** 보는 방식.
영상은 집 밖으로 안 나가고, 무료다. (RTX 2060 SUPER 8GB 이상 권장)

---

## 처음 한 번만 (설치)

### 1. 그래픽 드라이버 최신화
- GeForce Experience 또는 [nvidia.com/drivers](https://www.nvidia.com/drivers) 에서 최신 드라이버.

### 2. Python 설치
- [python.org/downloads](https://www.python.org/downloads/) 에서 **3.11** 받기.
- 설치 첫 화면에서 **"Add python.exe to PATH" 체크** (중요!) → Install.

### 3. 이 폴더 받기
- GitHub 저장소에서 **Code ▸ Download ZIP** (브랜치 `claude/ai-video-analysis-engine-wlr06k`)
  → 압축 풀고 **`server` 폴더**만 있으면 됨. (또는 `git clone` 후 `server`로 이동.)

### 4. 실행
- **`start.bat` 더블클릭.**
  - 최초엔 자동으로 설치(PyTorch-GPU 등, 5~15분). 검은 창에 진행상황 뜸.
  - 처음 분석 누를 때 NLF 모델(470MB) 한 번 자동 다운로드.
- 잠시 뒤 브라우저에 **http://localhost:8000** 이 열림. (안 열리면 직접 주소창에 입력/새로고침)

---

## 쓰는 법 (매번)
1. `start.bat` 더블클릭 → 브라우저 열림.
2. **영상 선택** (정면 또는 측면 스윙).
3. **촬영 각도**(정면 FO / 측면 DTL)와 **주손** 선택.
4. **분석하기** → 20~90초 뒤 결과 카드(회전·척추각·팔·무릎·템포).
   - 각도상 못 재는 지표(예: 측면의 스웨이)는 "이 각도에선 측정 불가"로 정직하게 표시.
5. 끄기: 검은 창에서 **Ctrl+C** (또는 창 닫기).

> **측면 영상 = 척추각·플레인**, **정면 영상 = 스웨이·좌우틸트**가 나옴. 회전·팔·무릎·템포는 양쪽 다.

---

## 문제 해결
| 증상 | 해결 |
|---|---|
| `python` 없다는 에러 | 2번 재설치, **Add to PATH 체크**. cmd에서 `python --version` 확인 |
| 분석 중 **CUDA out of memory** | `start.bat` 옆에서 창 닫고, 환경변수 `NLF_MAX_SIDE=540` 로 낮춰 실행 (기본 720). 아래 참고 |
| GPU 안 잡힘(느림) | `http://localhost:8000/health` 열어 `"cuda": true` 확인. false면 드라이버/torch 재설치 |
| 포트 8000 사용중 | `start.bat`의 `--port 8000` 을 `--port 8010` 등으로 바꾸고 그 주소로 접속 |
| 사람/프레임 못 잡음 | 영상에 사람이 크게·전신 나오게. 너무 짧은 클립 피하기 |

**VRAM 아끼기(해상도 낮추기):** cmd 창에서
```
set NLF_MAX_SIDE=540
venv\Scripts\python -m uvicorn app:app --host 127.0.0.1 --port 8000
```

## 확인용
- `http://localhost:8000/health` → `{"cuda": true, "gpu": "...2060 SUPER..."}` 나오면 GPU 정상.

---

## 지금은 집에서만
이 서버는 **그 PC(localhost)에서만** 열려. 밖(폰·사지방)에서 쓰려면 포트포워딩/터널이 필요한데
군내망이 막을 수 있어 → 나중에 필요하면 그때 붙이자. 지금은 "집 PC에서 분석" 목표 달성.
