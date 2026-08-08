@echo off
chcp 65001 >nul
cd /d "%~dp0"
title DOH Vision 서버

if not exist venv (
  echo ============================================
  echo  DOH Vision - 최초 설치 (5~15분, 인터넷 필요)
  echo ============================================
  python -m venv venv
  call venv\Scripts\activate.bat
  python -m pip install --upgrade pip
  echo [1/2] PyTorch (CUDA/GPU) 설치...
  pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
  echo [2/2] 서버 패키지 설치...
  pip install -r requirements.txt
) else (
  call venv\Scripts\activate.bat
)

echo.
echo ============================================
echo  서버 시작 중... (torch 로딩에 10~20초)
echo  뜨면 브라우저에서:  http://localhost:8000
echo  (안 열리면 몇 초 뒤 새로고침)
echo  끄기: 이 창에서 Ctrl+C
echo ============================================
start "" http://localhost:8000
python -m uvicorn app:app --host 127.0.0.1 --port 8000
pause
