---
title: DOH Vision Golf Swing 3D
emoji: 🏌️
colorFrom: blue
colorTo: green
sdk: gradio
app_file: app.py
pinned: false
short_description: 골프 스윙 영상 → 3D 회전·자세·P1~P10 (doh.vision.v1)
---

# DOH Vision — 골프 스윙 3D 분석 백엔드

단일 영상에서 NLF(3D 인체복원)로 골프 스윙의 **회전(흉곽/골반/X-Factor)·척추각·팔·무릎·스웨이·템포·P1~P10**를
뽑아 `doh.vision.v1` JSON 계약으로 반환한다.

- **프론트엔드:** `analyzer2.html`이 이 Space의 `/analyze` API를 호출해 결과를 표시.
  (analyzer2의 `☁️ GPU 백엔드 URL` 칸에 이 Space 주소 `https://<user>-<space>.hf.space` 를 넣으면 원클릭.)
- **계약이 척추:** 콜랩/집PC 서버와 동일한 `doh.vision.v1` → 프론트는 URL만 바꾸면 그대로 재사용.
- **하드웨어:** ZeroGPU(무료 GPU) 권장. CPU로도 동작(느림).

엔진 로직은 GitHub(`tinyalex3628-dotcom/doh-golf-survey`)에서 가져와 콜랩과 단일 소스로 공유한다.
