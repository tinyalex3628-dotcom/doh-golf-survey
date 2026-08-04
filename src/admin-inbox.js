"use strict";
/* ── 도착함 ──────────────────────────────────────────────────────────
   여기만 진짜다. 나머지 화면은 아직 더미로 그린 설계도고, 이 화면은
   회원이 방금 올린 영상을 서버에서 그대로 읽어 온다.

   프로의 작업대다 — 스윙 영상은 거의 다 세로라, 영상을 왼쪽에 세로로
   세우고 답장 기둥을 오른쪽에 길게 붙인다.
   영상 위에 선을 긋고, 그 장면을 캡처하면 답장에 사진으로 붙는다. */

const IN = {
  busy: false, ready: false, err: null,
  list: [], who: {}, sel: null, draft: {}, photos: {}, lines: {}, urlCache: {},
  blobCache: {}, at: {}, zoom: {}, mode: 'draw',
  uid: null, pro: false,
};

function inLoad(force) {
  if (IN.busy) return;
  if (IN.ready && !force) return;
  IN.busy = true; IN.err = null;
  NS.ready().then(u => {
    if (!u) throw new Error('서버에 연결하지 못했어요');
    IN.uid = u.id;
    IN.pro = NS.isPro();
    return Promise.all([NS.all(), NS.people()]);
  }).then(([list, who]) => {
    IN.list = list; IN.who = who;
    IN.busy = false; IN.ready = true;
    if (!IN.sel && list.length) IN.sel = list[0].id;
    render();
  }).catch(e => {
    IN.err = (e && e.message) || '알 수 없는 오류';
    IN.busy = false; IN.ready = true;
    render();
  });
}

const inPick = () => IN.list.find(x => x.id === IN.sel) || IN.list[0] || null;
const inName = o => IN.who[o] || ('회원 ' + String(o || '').slice(0, 4));
const inWhen = t => {
  const d = new Date(t), n = new Date();
  const gap = Math.floor((n - d) / 36e5);
  if (gap < 1) return '방금';
  if (gap < 24) return gap + '시간 전';
  return (d.getMonth() + 1) + '월 ' + d.getDate() + '일';
};

/* 프로로 표시되기 전에는 남의 영상이 안 보인다 — 접근 규칙이 그렇게 막는다. */
function inSetup() {
  return `<div style="flex:1;display:flex;align-items:center;justify-content:center;
      background:var(--ns-bg);padding:30px">
    <div style="max-width:560px;display:flex;flex-direction:column;gap:13px">
      <span style="font-size:19px;font-weight:700;letter-spacing:-.03em;color:var(--ns-ink)">
        한 번만 해두면 됩니다</span>
      <span style="font-size:13px;color:var(--ns-ink3);line-height:1.8">
        지금은 「프로」로 표시돼 있지 않아서 회원들이 올린 영상이 안 보입니다.
        아래 한 줄을 Supabase 의 SQL Editor 에 붙여넣고 실행한 뒤,
        이 화면을 새로고침하세요.</span>
      <code style="display:block;padding:14px 15px;border-radius:11px;background:var(--ns-ink);
        color:#DCE7DE;font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.7;
        word-break:break-all;user-select:all">update public.profiles set is_pro = true
where id = '${esc(IN.uid || '')}';</code>
      <span style="font-size:11.5px;color:var(--ns-ink3);line-height:1.7">
        아이디로 가입한 계정이면 이 자격이 계정에 붙습니다 —
        다른 기기에서도 같은 아이디로 로그인하면 그대로 프로입니다.</span>
      <span data-in-reload style="align-self:flex-start;margin-top:4px;padding:10px 15px;
        border-radius:10px;background:var(--ns-green);color:#fff;font-size:12.5px;font-weight:700;
        cursor:pointer">다 했어요 · 다시 불러오기</span>
    </div></div>`;
}

function inRow(s, on) {
  const c = (s.comments || []).length;
  return `<div data-in-row="${esc(s.id)}" style="display:flex;flex-direction:column;gap:4px;
      padding:11px 13px;border-bottom:1px solid var(--ns-line);cursor:pointer;
      background:${on ? 'var(--ns-soft)' : 'transparent'};
      box-shadow:${on ? 'inset 3px 0 0 var(--ns-green)' : 'none'}">
    <span style="display:flex;align-items:baseline;gap:7px">
      <span style="flex:1;min-width:0;font-size:12.5px;font-weight:700;color:var(--ns-ink);
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(inName(s.owner))}</span>
      <span style="flex:none;font-size:10.5px;color:var(--ns-ink3);font-family:var(--font-num)">
        ${esc(inWhen(s.created_at))}</span></span>
    <span style="display:flex;align-items:center;gap:6px">
      <span style="font-size:10.5px;font-weight:600;color:var(--ns-ink2);background:var(--ns-sand);
        border-radius:6px;padding:2px 7px">${esc(s.view)}</span>
      ${c ? `<span style="font-size:10.5px;font-weight:700;color:var(--ns-green)">한마디 ${c}</span>`
        : s.want_comment
          ? `<span style="font-size:10.5px;font-weight:700;color:var(--ns-bronze)">답 기다림</span>`
          : `<span style="font-size:10.5px;font-weight:600;color:var(--ns-ink3)">새 스윙</span>`}
    </span></div>`;
}

/* ── 상세 = 작업대 ──────────────────────────────────────────────────
   왼쪽: 세로 영상 + 슬라이더 + 선 긋기 + 캡처.  오른쪽: 답장 기둥. */
function inDetail() {
  const s = inPick();
  if (!s) return `<div style="flex:1;display:flex;align-items:center;justify-content:center;
    color:var(--ns-ink3);font-size:13px">왼쪽에서 스윙을 고르세요</div>`;
  const mo = S.view === 'mo';
  const past = (s.comments || []).slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const shots = IN.photos[s.id] || [];

  const video = `
  <div style="flex:none;${mo ? 'width:100%' : 'width:clamp(300px,32vw,420px)'};
      display:flex;flex-direction:column;gap:9px;padding:16px;
      ${mo ? '' : 'border-right:1px solid var(--ns-line);overflow-y:auto'}">
    <div data-v-box style="position:relative;border-radius:13px;overflow:hidden;background:#000;
        aspect-ratio:9/16;max-height:${mo ? '57vh' : 'calc(100vh - 278px)'};touch-action:none">
      <div data-v-zoom style="position:absolute;inset:0;transform-origin:0 0;
          will-change:transform">
        <video data-vid playsinline style="position:absolute;inset:0;width:100%;height:100%;
          object-fit:contain"></video>
        <canvas data-v-ink style="position:absolute;inset:0;width:100%;height:100%;
          cursor:crosshair"></canvas>
      </div>
      <span data-v-wait style="position:absolute;inset:0;display:flex;align-items:center;
        justify-content:center;color:rgba(255,255,255,.6);font-size:12.5px">여는 중…</span>
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <span data-v-play class="vbtn" title="재생/멈춤">▶</span>
      <input data-v-bar type="range" min="0" max="1000" value="0" step="1"
        style="flex:1;accent-color:var(--ns-green);min-width:0">
      <span data-v-time style="flex:none;font-size:10.5px;color:var(--ns-ink3);
        font-family:var(--font-num);min-width:66px;text-align:right">0:00 / 0:00</span>
    </div>
    <div style="display:flex;align-items:center;gap:7px">
      <span data-v-b1 class="vbtn" title="한 컷 뒤로">−1컷</span>
      <span data-v-f1 class="vbtn" title="한 컷 앞으로">+1컷</span>
      <span style="flex:1"></span>
      <span data-v-clear class="vbtn">선 지우기</span>
      <span data-v-shot class="vbtn vbtn-on">📷 캡처</span>
    </div>
    <div style="display:flex;align-items:center;gap:7px">
      <span data-v-md-draw class="vbtn${IN.mode === 'draw' ? ' vbtn-on' : ''}"
        title="끌면 선이 그어져요">✏️ 선</span>
      <span data-v-md-pan class="vbtn${IN.mode === 'pan' ? ' vbtn-on' : ''}"
        title="끌면 화면이 움직여요">✋ 이동</span>
      <span style="flex:1"></span>
      <span data-v-zout class="vbtn" title="축소">−</span>
      <span data-v-pct class="vbtn" title="원래 크기로" style="min-width:54px;text-align:center;
        font-family:var(--font-num)">100%</span>
      <span data-v-zin class="vbtn" title="확대">+</span>
    </div>
    <span style="font-size:10.5px;color:var(--ns-ink3);line-height:1.6">
      끌면 곧은 선이 그어져요. 확대한 다음 <b>✋ 이동</b>으로 잡고 옮기면 됩니다.
      캡처는 <b>지금 보이는 그대로</b> 오른쪽 답장에 붙습니다.</span>
  </div>`;

  const reply = `
  <div style="flex:1;min-width:0;display:flex;flex-direction:column;overflow-y:auto">
    <div style="flex:none;padding:15px 20px 12px;border-bottom:1px solid var(--ns-line);
      display:flex;align-items:baseline;gap:9px">
      <span style="font-size:15px;font-weight:700;color:var(--ns-ink)">${esc(inName(s.owner))}</span>
      <span style="font-size:11.5px;color:var(--ns-ink3)">${esc(s.view)} ·
        ${esc(inWhen(s.created_at))} · ${Math.round((s.size || 0) / 1024 / 1024 * 10) / 10}MB</span>
    </div>
    ${s.note ? `<div style="flex:none;margin:14px 20px 0;padding:12px 14px;border-radius:11px;
      background:var(--ns-sand);font-size:12.5px;line-height:1.7;color:var(--ns-ink2);
      white-space:pre-wrap">${esc(s.note)}</div>` : ''}
    <div style="flex:none;padding:14px 20px 20px;display:flex;flex-direction:column;gap:9px">
      <span style="font-size:12px;font-weight:700;color:var(--ns-ink2)">프로 한마디</span>
      <textarea data-in-txt rows="6" placeholder="이 스윙에 대해 한마디 남겨주세요"
        style="width:100%;padding:13px 14px;border:1px solid var(--ns-line);border-radius:11px;
        background:var(--ns-card);font-family:inherit;font-size:13px;line-height:1.75;
        color:var(--ns-ink);resize:vertical">${esc(IN.draft[s.id] || '')}</textarea>
      ${shots.length ? `<div style="display:flex;flex-direction:column;gap:8px;
          padding:11px 12px;border:1.5px solid var(--ns-green);border-radius:12px;
          background:var(--ns-soft)">
        <span style="font-size:11.5px;font-weight:700;color:var(--ns-green)">
          📷 캡처 사진 ${shots.length}장 — 답장과 같이 갑니다</span>
        <div style="display:flex;gap:10px;flex-wrap:wrap">${shots.map((u, i) =>
          `<span style="position:relative;display:block;width:88px">
            <img src="${u}" style="width:88px;border-radius:9px;display:block;
              border:1px solid var(--ns-line)">
            <span data-in-shot-x="${i}" title="이 사진 빼기" style="position:absolute;right:-7px;
              top:-7px;width:22px;height:22px;border-radius:50%;background:var(--ns-danger);
              color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;
              font-weight:700;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.3)">×</span>
          </span>`).join('')}</div></div>` : ''}
      <div style="display:flex;align-items:center;gap:9px">
        <span style="flex:1;font-size:10.5px;color:var(--ns-ink3)">
          ${shots.length ? '' : '왼쪽 영상에서 📷 캡처를 누르면 여기에 사진이 붙어요'}</span>
        <span data-in-send style="flex:none;padding:11px 18px;border-radius:10px;
          background:var(--ns-green);color:#fff;font-size:12.5px;font-weight:700;cursor:pointer">
          보내기</span>
      </div>
      ${past.map(cm => `<div style="padding:12px 14px;border-radius:11px;
        border:1px solid var(--ns-line);background:var(--ns-card);display:flex;
        flex-direction:column;gap:6px">
        <span style="font-size:10.5px;color:var(--ns-ink3);font-family:var(--font-num)">
          ${esc(inWhen(cm.created_at))}${cm.read_at ? ' · 읽음' : ' · 아직 안 읽음'}</span>
        <span style="font-size:12.5px;line-height:1.75;color:var(--ns-ink2);white-space:pre-wrap"
          >${esc(cm.body)}</span>
        ${(cm.photos || []).map(u => `<img src="${u}" style="width:120px;border-radius:9px;
          border:1px solid var(--ns-line);display:block">`).join('')}
      </div>`).join('')}
    </div></div>`;

  return `<div style="flex:1;min-width:0;display:flex;
    ${mo ? 'flex-direction:column;overflow-y:auto' : ''}">${video}${reply}</div>`;
}

function pageInbox() {
  if (IN.busy && !IN.ready) return `<div style="flex:1;display:flex;align-items:center;
    justify-content:center;color:var(--ns-ink3);font-size:13px;background:var(--ns-bg)">
    불러오는 중…</div>`;
  if (IN.err) return `<div style="flex:1;display:flex;align-items:center;justify-content:center;
      background:var(--ns-bg);padding:30px"><div style="max-width:420px;text-align:center;
      display:flex;flex-direction:column;gap:11px">
      <span style="font-size:17px;font-weight:700;color:var(--ns-ink)">서버에 못 붙었어요</span>
      <span style="font-size:12.5px;color:var(--ns-ink3);line-height:1.8">${esc(IN.err)}</span>
      <span data-in-reload style="align-self:center;margin-top:4px;padding:10px 15px;border-radius:10px;
        background:var(--ns-green);color:#fff;font-size:12.5px;font-weight:700;cursor:pointer">
        다시 시도</span></div></div>`;
  if (!IN.pro) return inSetup();

  const list = IN.list;
  const mo = S.view === 'mo';
  const wait = list.filter(s => !(s.comments || []).length && s.want_comment).length;
  return `<div style="flex:1;display:flex;min-width:0;background:var(--ns-bg);
      ${mo ? 'flex-direction:column;overflow-y:auto' : ''}">
    <div style="flex:none;${mo ? 'width:100%;max-height:34vh' : 'width:clamp(200px,15vw,260px)'};
      display:flex;flex-direction:column;
      ${mo ? 'border-bottom' : 'border-right'}:1px solid var(--ns-line);background:var(--ns-card)">
      <div style="flex:none;height:47px;display:flex;align-items:center;gap:7px;padding:0 13px;
        border-bottom:1px solid var(--ns-line)">
        <span style="font-size:13px;font-weight:700;color:var(--ns-ink)">도착함</span>
        <span style="font-size:11px;font-weight:700;color:#fff;background:var(--ns-bronze);
          border-radius:8px;padding:1px 7px;font-family:var(--font-num)">${wait}</span>
        <span style="flex:1"></span>
        <span data-in-reload style="font-size:11px;font-weight:700;color:var(--ns-green);
          cursor:pointer">새로고침</span>
      </div>
      <div style="flex:1;overflow-y:auto">${
        list.length ? list.map(s => inRow(s, s.id === IN.sel)).join('')
        : `<div style="padding:26px 16px;text-align:center;font-size:12.5px;line-height:1.8;
             color:var(--ns-ink3)">아직 올라온 스윙이 없어요<br>회원이 올리면 여기에 쌓입니다</div>`}</div>
    </div>
    ${inDetail()}</div>`;
}

/* ── 작업대 배선 — 렌더마다 다시 붙는다 ───────────────────────────── */
function inMount() {
  const s = inPick();
  /* [data-v] 는 상단 PC/모바일 전환 버튼이 이미 쓰고 있다 — 그걸 잡으면
     버튼에 src 를 꽂는 촌극이 벌어진다. 실제로 벌어졌다. */
  const v = document.querySelector('[data-vid]');
  if (!s || !v) return;

  /* 영상 열기 — 서명 주소는 1시간짜리라 한 번 받아 두고 다시 쓴다.
     그리고 그 주소를 <video src> 에 그대로 꽂지 않고 「내려받아서」 연다.
     서명 주소는 서버가 다른 출처라, 그대로 꽂으면 캔버스가 오염된 것으로
     취급되어 캡처(toDataURL)가 통째로 막힌다 — 눌러도 아무 일이 안 일어난다.
     한 번 받아 두면 컷 단위로 앞뒤 넘기는 것도 즉시 된다. */
  const waitEl = document.querySelector('[data-v-wait]');
  const say = t => { if (waitEl && waitEl.isConnected) waitEl.textContent = t; };
  v.addEventListener('loadeddata', () => {
    if (waitEl && waitEl.isConnected) waitEl.remove();
  }, { once: true });

  const fetchBlob = url => new Promise((ok, no) => {
    const x = new XMLHttpRequest();
    x.open('GET', url);
    x.responseType = 'blob';
    x.onprogress = e => {
      if (e.lengthComputable) say('여는 중… ' + Math.round(e.loaded / e.total * 100) + '%');
    };
    x.onload = () => (x.status >= 200 && x.status < 300)
      ? ok(URL.createObjectURL(x.response)) : no(new Error(String(x.status)));
    x.onerror = () => no(new Error('net'));
    x.send();
  });

  const setSrc = u => {
    if (!u) return say('영상을 열지 못했어요');
    if (IN.blobCache[s.id]) { v.src = IN.blobCache[s.id]; return; }
    fetchBlob(u).then(b => { IN.blobCache[s.id] = b; v.src = b; })
      .catch(() => { v.src = u; });   // 못 받으면 보이게라도 — 이때는 캡처가 막힌다
  };
  if (IN.urlCache[s.id]) setSrc(IN.urlCache[s.id]);
  else NS.link(s.path).then(u => { IN.urlCache[s.id] = u; setSrc(u); });

  /* 캡처할 때마다 화면을 다시 그리는데, 그때 영상이 맨 앞으로 돌아가면
     같은 자리에서 두 장을 못 찍는다. 보던 지점을 기억했다가 되돌린다. */
  const keepAt = () => { if (v.currentTime) IN.at[s.id] = v.currentTime; };
  v.addEventListener('timeupdate', keepAt);
  v.addEventListener('seeked', keepAt);
  v.addEventListener('loadedmetadata', () => {
    const t = IN.at[s.id];
    if (t && Math.abs(v.currentTime - t) > 0.05) { try { v.currentTime = t; } catch (e) {} }
  });

  // 재생 조종 — 슬라이더가 곧 시간이다
  const bar = document.querySelector('[data-v-bar]');
  const tEl = document.querySelector('[data-v-time]');
  const play = document.querySelector('[data-v-play]');
  const mmss = x => Math.floor(x / 60) + ':' + String(Math.floor(x % 60)).padStart(2, '0');
  const paint = () => {
    if (!v.duration) return;
    bar.value = Math.round(v.currentTime / v.duration * 1000);
    tEl.textContent = mmss(v.currentTime) + ' / ' + mmss(v.duration);
  };
  v.addEventListener('timeupdate', paint);
  v.addEventListener('loadedmetadata', paint);
  v.addEventListener('play', () => { play.textContent = '⏸'; });
  v.addEventListener('pause', () => { play.textContent = '▶'; });
  play.addEventListener('click', () => { v.paused ? v.play() : v.pause(); });
  bar.addEventListener('input', () => {
    if (v.duration) v.currentTime = bar.value / 1000 * v.duration;
  });
  const FRAME = 1 / 30;
  document.querySelector('[data-v-b1]').addEventListener('click', () => {
    v.pause(); v.currentTime = Math.max(0, v.currentTime - FRAME);
  });
  document.querySelector('[data-v-f1]').addEventListener('click', () => {
    v.pause(); v.currentTime = Math.min(v.duration || 0, v.currentTime + FRAME);
  });

  /* 선 긋기 — 곧은 선만. 손으로 그린 곡선은 스윙 지도에 안 쓴다.
     누른 자리가 시작점, 끌다 놓은 자리가 끝점이다 (고무줄처럼 미리 보인다).
     선은 스윙별로 기억한다 — 캡처하면 화면을 다시 그리는데, 그때 선이
     날아가면 두 장째 캡처를 못 한다. */
  const ink = document.querySelector('[data-v-ink]');
  const boxEl = document.querySelector('[data-v-box]');
  const zoomEl = document.querySelector('[data-v-zoom]');
  const pctEl = document.querySelector('[data-v-pct]');
  const ctx = ink.getContext('2d');

  /* 확대해도 선이 뭉개지지 않게 캔버스는 두 배로 잡고, 그 위에 그릴 때는
     상자 크기(IW·IH)를 그대로 쓴다. 좌표 계산이 한 겹으로 유지된다. */
  const R = 2;
  let IW = 0, IH = 0;
  const fit = () => {
    const r = boxEl.getBoundingClientRect();
    const w = Math.round(r.width), h = Math.round(r.height);
    if (w === IW && h === IH) return;
    IW = w; IH = h;
    ink.width = w * R; ink.height = h * R;    // 크기를 바꾸면 캔버스가 초기화된다
    ctx.setTransform(R, 0, 0, R, 0, 0);
  };
  fit();

  /* 확대 · 이동 — 스윙은 손목과 어깨가 관건이라 작은 화면에서 그냥은 안 보인다.
     확대해도 선과 캡처가 같이 따라가야 쓸모가 있다. */
  const Z = IN.zoom[s.id] = IN.zoom[s.id] || { z: 1, tx: 0, ty: 0 };
  const MAXZ = 6;

  const lines = IN.lines[s.id] = IN.lines[s.id] || [];   // 0~1 정규화 좌표
  const drawL = L => {
    ctx.beginPath();
    ctx.moveTo(L.x1 * IW, L.y1 * IH);
    ctx.lineTo(L.x2 * IW, L.y2 * IH);
    ctx.stroke();
  };
  const redraw = preview => {
    ctx.clearRect(0, 0, IW, IH);
    ctx.strokeStyle = '#E4573D';
    ctx.lineWidth = 3 / Z.z;      // 확대해도 눈에는 같은 굵기로
    ctx.lineCap = 'round';
    lines.forEach(drawL);
    if (preview) drawL(preview);
  };

  const applyZ = () => {
    Z.z = Math.max(1, Math.min(MAXZ, Z.z));
    // 확대한 그림이 상자 밖으로 빠져나가지 않게 잡아 둔다
    Z.tx = Math.max(IW - IW * Z.z, Math.min(0, Z.tx));
    Z.ty = Math.max(IH - IH * Z.z, Math.min(0, Z.ty));
    zoomEl.style.transform = 'translate(' + Z.tx + 'px,' + Z.ty + 'px) scale(' + Z.z + ')';
    if (pctEl) pctEl.textContent = Math.round(Z.z * 100) + '%';
    redraw();
  };
  // 가리키는 자리를 붙잡고 확대한다 — 보던 곳이 화면 밖으로 달아나지 않게
  const zoomAt = (nz, px, py) => {
    nz = Math.max(1, Math.min(MAXZ, nz));
    Z.tx = px - (px - Z.tx) * (nz / Z.z);
    Z.ty = py - (py - Z.ty) * (nz / Z.z);
    Z.z = nz;
    applyZ();
  };
  const mid = f => { fit(); zoomAt(Z.z * f, IW / 2, IH / 2); };
  applyZ();

  const setMode = m => {
    IN.mode = m;
    document.querySelectorAll('[data-v-md-draw]').forEach(b =>
      b.classList.toggle('vbtn-on', m === 'draw'));
    document.querySelectorAll('[data-v-md-pan]').forEach(b =>
      b.classList.toggle('vbtn-on', m === 'pan'));
    ink.style.cursor = m === 'pan' ? 'grab' : 'crosshair';
  };
  setMode(IN.mode);
  document.querySelector('[data-v-md-draw]').addEventListener('click', () => setMode('draw'));
  document.querySelector('[data-v-md-pan]').addEventListener('click', () => setMode('pan'));
  document.querySelector('[data-v-zin]').addEventListener('click', () => mid(1.35));
  document.querySelector('[data-v-zout]').addEventListener('click', () => mid(1 / 1.35));
  document.querySelector('[data-v-pct]').addEventListener('click', () => {
    Z.z = 1; Z.tx = 0; Z.ty = 0; applyZ();
  });
  boxEl.addEventListener('wheel', e => {
    e.preventDefault(); fit();
    const r = boxEl.getBoundingClientRect();
    zoomAt(Z.z * (e.deltaY < 0 ? 1.18 : 1 / 1.18), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });

  /* 끌기 하나에 두 가지 뜻이 있으면 안 된다 — 어느 쪽인지 버튼으로 정해 둔다.
     ✋ 이동일 때는 손가락 아래 그림이 그대로 따라온다. */
  let start = null, grab = null;
  const norm = e => {
    const r = ink.getBoundingClientRect();   // 확대·이동이 이미 반영된 자리다
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  };
  ink.addEventListener('pointerdown', e => {
    e.preventDefault(); fit();
    ink.setPointerCapture(e.pointerId);
    if (IN.mode === 'pan') {
      grab = { x: e.clientX, y: e.clientY, tx: Z.tx, ty: Z.ty };
      ink.style.cursor = 'grabbing';
      return;
    }
    const [x, y] = norm(e); start = { x, y };
  });
  ink.addEventListener('pointermove', e => {
    if (grab) {
      Z.tx = grab.tx + (e.clientX - grab.x);
      Z.ty = grab.ty + (e.clientY - grab.y);
      applyZ();
      return;
    }
    if (!start) return;
    const [x, y] = norm(e);
    redraw({ x1: start.x, y1: start.y, x2: x, y2: y });
  });
  const endDrag = e => {
    if (grab) { grab = null; ink.style.cursor = 'grab'; return; }
    if (!start) return;
    const [x, y] = norm(e);
    // 제자리 탭은 선이 아니다 — 실수로 점이 찍히는 걸 막는다
    if (Math.hypot((x - start.x) * IW * Z.z, (y - start.y) * IH * Z.z) > 6) {
      lines.push({ x1: start.x, y1: start.y, x2: x, y2: y });
    }
    start = null; redraw();
  };
  ink.addEventListener('pointerup', endDrag);
  ink.addEventListener('pointercancel', endDrag);
  document.querySelector('[data-v-clear]').addEventListener('click', () => {
    lines.length = 0; redraw();
  });

  // 캡처 — 지금 화면(영상 프레임 + 그은 선)을 사진 한 장으로
  document.querySelector('[data-v-shot]').addEventListener('click', () => {
    if (!v.videoWidth) return toast('영상이 아직 안 열렸어요');
    fit();
    const arr = IN.photos[s.id] = IN.photos[s.id] || [];
    if (arr.length >= 3) return toast('사진은 3장까지 붙일 수 있어요');
    /* 「지금 보이는 그대로」를 뽑는다. 확대해서 손목만 보고 있었다면
       사진도 손목만 나와야 한다 — 그러라고 확대한 것이다. */
    const vw = v.videoWidth, vh = v.videoHeight;
    // object-fit:contain 이 영상을 상자 안에 놓은 자리
    const f = Math.min(IW / vw, IH / vh);
    const dw = vw * f, dh = vh * f;
    const ox = (IW - dw) / 2, oy = (IH - dh) / 2;
    // 확대·이동을 되돌린, 지금 눈에 들어오는 네모 (상자 좌표)
    const sx0 = -Z.tx / Z.z, sy0 = -Z.ty / Z.z;
    // 검은 여백은 빼고 영상이 실제로 있는 부분만 남긴다
    const ix = Math.max(sx0, ox), iy = Math.max(sy0, oy);
    const jx = Math.min(sx0 + IW / Z.z, ox + dw), jy = Math.min(sy0 + IH / Z.z, oy + dh);
    if (jx - ix < 4 || jy - iy < 4) return toast('영상이 화면 밖에 있어요');
    // 원본 영상 픽셀로 옮긴다 — 잘라낸 만큼 원본 해상도 그대로 뽑힌다
    const cx = (ix - ox) / f, cy = (iy - oy) / f;
    const cw = (jx - ix) / f, ch = (jy - iy) / f;
    // 너무 작게 잘리면 선이 뭉갠다 — 그럴 때만 조금 키워서 뽑는다
    const k = cw < 640 ? Math.min(3, 640 / cw) : 1;
    const outW = Math.round(cw * k), outH = Math.round(ch * k);
    const c = document.createElement('canvas'); c.width = outW; c.height = outH;
    const g = c.getContext('2d');
    g.drawImage(v, cx, cy, cw, ch, 0, 0, outW, outH);
    g.drawImage(ink, ix * R, iy * R, (jx - ix) * R, (jy - iy) * R, 0, 0, outW, outH);
    let shot;
    try {
      shot = c.toDataURL('image/jpeg', 0.85);
    } catch (err) {
      // 내려받기가 막혀 서명 주소로 직접 열린 경우다. 지금이라도 받아서 다시 연다.
      toast('영상을 다시 받는 중이에요 · 잠시 후 캡처해주세요');
      const u = IN.urlCache[s.id];
      if (u) fetchBlob(u).then(b => { IN.blobCache[s.id] = b; v.src = b; }).catch(() => {});
      return;
    }
    arr.push(shot);
    toast('캡처했어요 · 답장에 붙습니다');
    render();
  });
}

function inWire() {
  on('[data-in-row]', 'click', e => { IN.sel = e.currentTarget.dataset.inRow; render(); });
  on('[data-in-reload]', 'click', () => { IN.ready = false; inLoad(true); });
  on('[data-in-txt]', 'input', e => { const s = inPick(); if (s) IN.draft[s.id] = e.target.value; });
  on('[data-in-shot-x]', 'click', e => {
    const s = inPick(); if (!s) return;
    (IN.photos[s.id] || []).splice(+e.currentTarget.dataset.inShotX, 1);
    render();
  });
  on('[data-in-send]', 'click', () => {
    const s = inPick();
    if (!s) return;
    const body = (IN.draft[s.id] || '').trim();
    const shots = IN.photos[s.id] || [];
    if (!body && !shots.length) return toast('한마디나 사진을 넣어주세요');
    NS.comment(s.id, body || '(사진)', shots).then(() => {
      IN.draft[s.id] = ''; IN.photos[s.id] = [];
      toast(inName(s.owner) + '님에게 보냈어요');
      IN.ready = false; inLoad(true);
    }).catch(e => toast('보내지 못했어요 · ' + ((e && e.message) || '')));
  });
  if (S.nav === 'inbox') inMount();
}
