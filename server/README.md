# DOH Vision 서버 (집 PC / GPU)

영상 업로드 → NLF 3D 복원 → `doh.vision.v1` 계약(회전·척추각·자세·팔·무릎·템포) → 이쁜 웹 표시.
콜랩 없이 **집 PC에서 서버 하나 켜고 브라우저로 분석**.

## 빠른 시작 (윈도우)
1. **`start.bat` 더블클릭** (최초 자동 설치)
2. 브라우저 **http://localhost:8000** → 영상 올리고 각도 선택 → 분석

자세한 설치·문제해결: **[집PC_설치.md](집PC_설치.md)**

## 구성
| 파일 | 역할 |
|---|---|
| `app.py` | FastAPI: NLF 로드 + `POST /analyze`(영상→JSON) + 웹UI 서빙 |
| `index.html` | 업로드/결과 웹UI (서버가 `/`로 서빙) |
| `start.bat` | 원클릭 설치·실행 (venv + torch-cuda + uvicorn) |
| `requirements.txt` | 서버 패키지 (torch는 CUDA 버전 별도) |

## API
- `GET /health` → GPU/모델 상태
- `POST /analyze` (multipart: `file`, `view`=FO|DTL, `hand`=right|left) → `doh.vision.v1` JSON
  - 계약 정의: 상위 `../schema/doh.vision.v1.schema.json`, `../DOH_Vision_JSON_Contract_v1.0.md`

## 엔진 재사용
`app.py` 는 `../pose3d_poc/wham_golf_rotation.py:build_v1()` 를 호출 — 콜랩과 **완전히 같은**
회전·척추각·지표 로직. 서버는 영상→관절(NLF) 부분만 담당하고 분석은 계약 코드를 그대로 씀.
