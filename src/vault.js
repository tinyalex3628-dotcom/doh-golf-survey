"use strict";
/* ── 스윙 보관함 ─────────────────────────────────────────────────────
   진짜 영상 파일을 다룬다.

   localStorage 는 5MB 라 영상이 아예 안 들어가고, 메모리에만 두면 새로고침
   한 번에 다 날아간다. 그래서 IndexedDB 다. 앱을 껐다 켜도 남아 있다.

   지금은 이 기기 안에서만 돈다 — 베타 안내에 「올린 영상은 이 기기 밖으로
   안 나갑니다」라고 적어뒀고, 실제로 그렇다.
   서버(Supabase)가 붙으면 add() 끝에 업로드 한 줄을 더하고 sent 를 켜면 된다.
   화면 쪽은 하나도 안 고쳐도 되게 여기서 다 막아뒀다. */

const VAULT = (() => {
  const NAME = 'nextswing', STORE = 'swings', VER = 1;
  const MAX = 60 * 1024 * 1024;      // 60MB — 폰으로 찍은 10초 스윙이 보통 20~40MB
  let dbp = null;

  function db() {
    if (dbp) return dbp;
    dbp = new Promise((ok, no) => {
      const r = indexedDB.open(NAME, VER);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE, { keyPath: 'id' });
      };
      r.onsuccess = () => ok(r.result);
      r.onerror = () => no(r.error);
    });
    return dbp;
  }

  const run = (mode, fn) => db().then(d => new Promise((ok, no) => {
    const t = d.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.onerror = () => no(t.error);
    t.oncomplete = () => ok(req ? req.result : undefined);
  }));

  /* 목록에는 영상 덩어리를 싣지 않는다 — 12개만 돼도 수백 MB 를 메모리에 올리게 된다 */
  const meta = r => ({ id: r.id, name: r.name, size: r.size, view: r.view, club: r.club,
                       at: r.at, poster: r.poster, sent: r.sent,
                       remoteId: r.remoteId, path: r.path, err: r.err });

  /* 첫 프레임 한 장을 뽑아 갤러리 썸네일로 쓴다.
     못 뽑아도 업로드는 계속 간다 — 코덱에 따라 브라우저가 못 여는 영상이 있다. */
  function poster(file) {
    return new Promise(ok => {
      const url = URL.createObjectURL(file);
      const v = document.createElement('video');
      let done = false;
      const finish = out => { if (done) return; done = true; URL.revokeObjectURL(url); ok(out); };
      v.preload = 'metadata'; v.muted = true; v.playsInline = true; v.src = url;
      v.onloadeddata = () => { try { v.currentTime = Math.min(0.3, (v.duration || 1) / 3); }
                               catch (e) { finish(null); } };
      v.onseeked = () => {
        try {
          const c = document.createElement('canvas');
          const w = 240, h = Math.round(w * (v.videoHeight || 16) / (v.videoWidth || 9));
          c.width = w; c.height = h;
          c.getContext('2d').drawImage(v, 0, 0, w, h);
          finish(c.toDataURL('image/jpeg', 0.7));
        } catch (e) { finish(null); }
      };
      v.onerror = () => finish(null);
      setTimeout(() => finish(null), 4000);     // 안 열리는 영상에 붙잡혀 있지 않는다
    });
  }

  return {
    MAX,
    /* 목록 (영상 덩어리 없이) — 최신 것이 앞이다 */
    list: () => run('readonly', s => s.getAll())
      .then(all => (all || []).map(meta).sort((a, b) => b.at - a.at)),

    /* 먼저 넣고, 그림은 나중에.
       썸네일 뽑기는 영상을 열어 한 프레임 그리는 일이라 큰 영상에선 몇 초씩 걸린다.
       그걸 앞에 두면 「올리기」를 누르고 몇 초를 멍하니 기다리게 된다.
       저장은 즉시 끝내고 화면을 띄운 다음, 그림은 뒤에서 채워 넣는다. */
    add(file, view, club) {
      if (file.size > MAX) return Promise.reject(new Error('too-big'));
      const rec = {
        id: 'sw-' + Date.now() + '-' + Math.round(performance.now() * 1000),
        name: file.name || '스윙.mp4',
        size: file.size, type: file.type || 'video/mp4',
        view: view, club: club || null, at: Date.now(), poster: null, sent: false, blob: file,
        remoteId: null, path: null, err: null,
      };
      return run('readwrite', s => s.put(rec)).then(() => {
        poster(file).then(pos => {
          if (!pos) return;
          run('readwrite', s => s.get(rec.id)).then(r => {
            if (!r) return;
            r.poster = pos;
            run('readwrite', s => s.put(r))
              .then(() => window.__vaultSync())
              .then(() => { if (window.__posterDone) window.__posterDone(); });
          });
        });
        return meta(rec);
      });
    },

    /* 원본 파일 자체 — 서버로 다시 보낼 때 쓴다 */
    file: id => run('readonly', s => s.get(id)).then(r => (r && r.blob) || null),

    /* 재생용 주소. 다 쓰면 free 로 돌려준다 — 안 그러면 메모리에 계속 쌓인다 */
    url: id => run('readonly', s => s.get(id))
      .then(r => (r && r.blob) ? URL.createObjectURL(r.blob) : null),
    free: u => { if (u) URL.revokeObjectURL(u); },

    /* 서버로 보낸 뒤 표시를 남긴다 — 무엇이 아직 안 갔는지 알아야 다시 보낸다 */
    mark: (id, patch) => run('readwrite', s => s.get(id)).then(r => {
      if (!r) return null;
      Object.assign(r, patch);
      return run('readwrite', s => s.put(r)).then(() => meta(r));
    }),

    del: id => run('readwrite', s => s.delete(id)),
    clear: () => run('readwrite', s => s.clear()),
  };
})();

/* 화면이 동기로 도는 런타임이라, 목록은 여기 거울에 담아두고 그린다.
   보관함이 바뀔 때마다 다시 채운다. */
window.__SWINGS = [];
window.__vaultSync = () => VAULT.list().then(l => { window.__SWINGS = l; return l; });
