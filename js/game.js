'use strict';
/* GILDED MIDNIGHT — shell: boot, stage scaling, render loop, shared UI helpers, menus & meta screens */
(function () {
  const G = window.G, D = G.D, A = G.A, $ = G.$, $$ = G.$$, el = G.el, esc = G.esc;
  const S = G.S = { screen: 'boot', c: null, p: null, loc: null, q: 0, t: 0, pics: {}, sky: null, mapSky: null };
  let cv, ctx, stage;
  const sfx = G.sfx = n => G.audio.sfx(n);
  const ui = () => $('#ui');

  /* ---------- stage scaling ---------- */
  function fit() {
    const sw = window.innerWidth, sh = window.innerHeight, sc = Math.min(sw / G.W, sh / G.H);
    stage.style.transform = `scale(${sc})`;
    stage.style.left = Math.round((sw - G.W * sc) / 2) + 'px';
    stage.style.top = Math.round((sh - G.H * sc) / 2) + 'px';
    const raw = sc * (window.devicePixelRatio || 1), q = raw > 1.6 ? 2 : raw > 1.15 ? 1.5 : 1;
    if (q !== S.q) {
      S.q = q;
      cv.width = G.W * q; cv.height = G.H * q;
      A.clearScenes();
      S.sky = A.makeSkyline({ seed: 21, hero: { x: 720, s: 1 }, moonX: 1010, moonY: 96 }, q);
      S.mapSky = A.makeSkyline({ seed: 77, hero: { x: 640, s: 0.66 }, moonX: 150, moonY: 90 }, q);
    }
  }

  /* ---------- render loop ---------- */
  function frame(now) {
    const t = S.t = now / 1000, c = ctx;
    c.setTransform(S.q, 0, 0, S.q, 0, 0);
    if (S.screen === 'loc' && S.loc) {
      const L = G.LOCS[S.loc];
      c.drawImage(A.scene(S.loc, S.q), 0, 0, G.W, G.H);
      if (S.c && S.loc === S.c.crime) A.bodyMark(c, L.body[0], L.body[1], t);
      L.fx(c, t);
    } else {
      const sk = S.screen === 'map' ? S.mapSky : S.sky;
      c.drawImage(sk.back, 0, 0, G.W, G.H);
      A.searchlights(c, t, sk, G.H * 0.86);
      c.drawImage(sk.front, 0, 0, G.W, G.H);
      if (sk.spire) A.glow(c, sk.spire.x, sk.spire.y, 26 + 10 * Math.sin(t * 3), '#ff4a6a', Math.sin(t * 3) > 0 ? 0.9 : 0.25);
      /* elevated train sliding through the fog */
      const tx = ((t * 46) % 1900) - 320;
      c.fillStyle = 'rgba(6,4,22,.9)'; c.fillRect(tx, 664, 300, 15);
      c.fillStyle = '#ffd95a'; for (let i = 0; i < 16; i++) c.fillRect(tx + 8 + i * 18, 668, 10, 5);
      c.fillStyle = 'rgba(6,4,22,.8)'; c.fillRect(0, 679, G.W, 3);
      A.rain(c, t, 0.26);
      if (S.screen !== 'map') A.detective(c, 1090, 772, 1.18);
      else { c.fillStyle = 'rgba(4,3,18,.42)'; c.fillRect(0, 0, G.W, G.H); }
    }
    requestAnimationFrame(frame);
  }

  /* ---------- shared UI helpers ---------- */
  const toastQ = []; let toastN = 0;
  function pumpToasts() {
    while (toastN < 3 && toastQ.length) {
      const q = toastQ.shift(), t = el('div', 'toast ' + (q[1] || ''), q[0]), ms = q[2] || 3200;
      toastN++;
      $('#toast').appendChild(t);
      setTimeout(() => t.classList.add('out'), ms);
      setTimeout(() => { t.remove(); toastN--; pumpToasts(); }, ms + 450);
    }
  }
  G.toast = function (html, kind, ms) { toastQ.push([html, kind, ms]); pumpToasts(); };
  /* elevator-door wipe */
  let doorsBusy = false;
  G.doors = async function (label, sub, fn) {
    const d = $('#doors');
    if (doorsBusy) { if (fn) await fn(); return; }
    doorsBusy = true;
    $('#doors-label').innerHTML = label ? `<div class="dl-main">${label}</div>${sub ? `<div class="dl-sub">${sub}</div>` : ''}` : '';
    d.classList.add('shut');
    await G.wait(label ? 520 : 460);
    if (fn) await fn();
    await G.wait(label ? 620 : 120);
    d.classList.remove('shut');
    doorsBusy = false;
  };
  /* typewriter text; click anywhere on target to finish */
  G.type = function (node, text, done) {
    const speed = 16 / (G.save.d.settings.speed || 1);
    let i = 0, stop = false;
    node.textContent = '';
    node.classList.add('typing');
    const finish = () => { if (stop) return; stop = true; node.textContent = text; node.classList.remove('typing'); node.removeEventListener('click', finish); if (done) done(); };
    node.addEventListener('click', finish);
    const step = () => {
      if (stop) return;
      if (!node.isConnected) { stop = true; return; }
      i += 2; node.textContent = text.slice(0, i);
      if (i % 6 === 0) sfx('type');
      if (i >= text.length) finish(); else setTimeout(step, speed);
    };
    step();
    return finish;
  };
  /* modal overlay; returns {node, close} */
  G.overlay = function (cls, html, onClose) {
    const o = el('div', 'overlay ' + (cls || ''), html);
    $('#modal').appendChild(o);
    const api = { node: o, close() { if (!o.isConnected) return; o.remove(); if (onClose) onClose(); } };
    o._api = api;
    $$('[data-close]', o).forEach(b => { b.onclick = () => { sfx('click'); api.close(); }; });
    return api;
  };
  G.closeTop = function () {
    const all = $$('#modal > .overlay');
    const top = all[all.length - 1];
    if (top && top._api && top.querySelector('[data-close]')) { sfx('page'); top._api.close(); return true; }
    return false;
  };
  G.confirm = function (title, body, yes, no) {
    return new Promise(res => {
      const o = G.overlay('dim', `<div class="panel dialog"><div class="deco-head"><span>${title}</span></div><p>${body}</p><div class="row"><button class="btn primary" data-y>${yes || 'Yes'}</button><button class="btn" data-n>${no || 'Cancel'}</button></div></div>`);
      $('[data-y]', o.node).onclick = () => { sfx('click'); o.close(); res(true); };
      $('[data-n]', o.node).onclick = () => { sfx('click'); o.close(); res(false); };
    });
  };
  G.setPlaying = function (on) { if (on) G.sdk.gameplayStart(); else G.sdk.gameplayStop(); };
  G.pic = function (p, dead) {
    const k = (dead ? 'd' : 's') + p.lookSeed;
    if (!S.pics[k]) S.pics[k] = A.portrait(p, dead).toDataURL('image/jpeg', 0.88);
    return S.pics[k];
  };
  G.staffPic = function (loc) {
    const k = 'staff' + loc;
    if (!S.pics[k]) S.pics[k] = A.staffPortrait(G.hashStr(loc)).toDataURL('image/jpeg', 0.88);
    return S.pics[k];
  };
  function bind(root) {
    $$('button', root).forEach(b => { b.addEventListener('pointerenter', () => sfx('hover')); });
  }
  G.bind = bind;

  /* ---------- progression helpers ---------- */
  G.award = function (id) {
    const d = G.save.d;
    if (d.ach[id]) return;
    const a = D.achievements.find(x => x.id === id);
    if (!a) return;
    d.ach[id] = 1; d.cash += a.r; d.earned += a.r;
    setTimeout(() => { sfx('cash'); G.toast(`${G.icon('trophy', 20)} <b>Achievement — ${a.n}</b><br>${a.d} · +${G.money(a.r)}`, 'gold', 5200); }, 900);
    G.save.commit();
  };
  G.checkAch = function () {
    const d = G.save.d, s = d.stats, r = G.rankOf(d.xp).i;
    if (s.solved >= 1) G.award('first'); if (s.solved >= 5) G.award('solve5'); if (s.solved >= 25) G.award('solve25'); if (s.solved >= 100) G.award('solve100');
    if (s.sRanks >= 1) G.award('s1'); if (s.sRanks >= 10) G.award('s10');
    if (s.bestStreak >= 3) G.award('streak3'); if (s.bestStreak >= 7) G.award('streak7'); if (s.bestStreak >= 15) G.award('streak15');
    if (s.lies >= 10) G.award('lies10'); if (s.secrets >= 10) G.award('secrets10'); if (s.minis >= 25) G.award('minis25');
    if (r >= 4) G.award('rank4'); if (r >= 9) G.award('rank9');
    if (d.daily.streak >= 7) G.award('daily7');
    if (s.bosses >= 1) G.award('boss1'); if (s.bosses >= 3) G.award('boss3');
    if (d.earned >= 25000) G.award('rich');
    if (D.upgrades.some(u => G.upLevel(u.id) >= u.max)) G.award('maxed');
  };
  const THREADS = 12;
  G.THREADS = THREADS;

  /* ---------- title / main menu ---------- */
  function badge() {
    const d = G.save.d, r = G.rankOf(d.xp);
    return `<div class="badge"><div class="badge-rank">${esc(r.name)}</div>
      <div class="bar"><i style="width:${Math.round(r.pct * 100)}%"></i></div>
      <div class="badge-row"><span>${r.next ? (d.xp - r.cur).toLocaleString() + ' / ' + (r.next - r.cur).toLocaleString() + ' XP' : 'MAX RANK'}</span><span class="cash">${G.money(d.cash)}</span></div></div>`;
  }
  G.showMenu = function () {
    S.screen = 'menu'; S.loc = null;
    G.setPlaying(false); G.audio.mood('menu');
    $('#hud').innerHTML = '';
    const d = G.save.d, canBoss = d.threads >= THREADS, dailyDone = d.daily.last === G.today();
    const kp = D.kingpins[(d.chapter - 1) % D.kingpins.length];
    ui().innerHTML = `
      <div class="title-wrap">
        <div class="logo"><div class="logo-top">A DECO NOIR MYSTERY</div><h1>GILDED<br>MIDNIGHT</h1><div class="logo-rule"><i></i><b></b><i></i></div><div class="logo-sub">One city. One night. One killer.</div></div>
        <div class="menu">
          ${d.current ? `<button class="btn primary big" data-a="continue">${G.icon('play', 18)} Continue Case</button>` : ''}
          <button class="btn ${d.current ? '' : 'primary'} big" data-a="new">${G.icon('book', 18)} New Case</button>
          <button class="btn big" data-a="daily" ${dailyDone ? 'disabled' : ''}>${G.icon('news', 18)} Daily Case ${dailyDone ? '<small>solved — back tomorrow</small>' : `<small>×2 fee · streak ${d.daily.streak}</small>`}</button>
          <button class="btn big ${canBoss ? 'boss' : ''}" data-a="boss" ${canBoss ? '' : 'disabled'}>${G.icon('star', 18)} ${canBoss ? 'Confront ' + esc(kp) : 'The Syndicate'} <small>${canBoss ? 'Chapter ' + d.chapter + ' finale' : `${d.threads}/${THREADS} threads`}</small></button>
          <div class="menu-row">
            <button class="btn" data-a="office">${G.icon('cash', 16)} Office</button>
            <button class="btn" data-a="records">${G.icon('trophy', 16)} Records</button>
            <button class="btn" data-a="help">${G.icon('bulb', 16)} How to Play</button>
            <button class="btn" data-a="settings">${G.icon('gear', 16)} Settings</button>
          </div>
        </div>
      </div>
      <div class="top-right">${badge()}<div class="chapter">Chapter ${d.chapter} · Syndicate threads<div class="pips">${Array.from({ length: THREADS }, (_, i) => `<i class="${i < d.threads ? 'on' : ''}"></i>`).join('')}</div></div></div>`;
    const act = {
      continue: () => G.resumeCase(),
      new: () => showTiers(),
      daily: () => G.beginCase(Math.min(1, maxTier()), 'daily', G.hashStr('daily' + G.today())),
      boss: () => G.beginCase(3, 'boss', (Date.now() ^ (d.chapter * 7919)) >>> 0),
      office: showOffice, records: showRecords, help: () => G.showHelp(), settings: showSettings
    };
    $$('[data-a]', ui()).forEach(b => { b.onclick = () => { sfx('click'); act[b.dataset.a](); }; });
    bind(ui());
  };
  const maxTier = () => { const r = G.rankOf(G.save.d.xp).i; let m = 0; D.tiers.forEach(t => { if (r >= t.rank) m = t.id; }); return m; };

  function showTiers() {
    const r = G.rankOf(G.save.d.xp).i, d = G.save.d;
    const o = G.overlay('dim', `<div class="panel wide"><div class="deco-head"><span>Choose Your Beat</span></div>
      ${d.current ? '<p class="warn">Starting a new case abandons the one in progress.</p>' : ''}
      <div class="tiers">${D.tiers.map(t => {
      const locked = r < t.rank;
      return `<button class="tier ${locked ? 'locked' : ''}" data-t="${t.id}" ${locked ? 'disabled' : ''}>
          <div class="tier-n">${t.name}</div><div class="tier-stars">${'◆'.repeat(t.id + 1)}${'◇'.repeat(3 - t.id)}</div>
          <div class="tier-sub">${t.sub}</div>
          <div class="tier-meta">${locked ? G.icon('lock', 16) + ' Reach ' + D.ranks[t.rank][0] : 'Fee ×' + t.mult + ' · ' + G.dur(t.budget + 15 * G.upLevel('watch')) + ' night'}</div>
          <div class="tier-count">${locked ? '' : d.stats.byTier[t.id] + ' solved'}</div></button>`;
    }).join('')}</div><div class="row"><button class="btn" data-close>Back</button></div></div>`);
    $$('.tier', o.node).forEach(b => { b.onclick = () => { sfx('click'); o.close(); G.beginCase(+b.dataset.t, 'normal', (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0); }; });
    bind(o.node);
  }

  /* ---------- office (upgrades) ---------- */
  function showOffice() {
    const o = G.overlay('dim', '');
    const draw = () => {
      const d = G.save.d;
      o.node.innerHTML = `<div class="panel wide"><div class="deco-head"><span>The Office</span></div>
        <div class="office-top"><span>Invest your fees. Every edge counts when the clock is running.</span><span class="cash big">${G.money(d.cash)}</span></div>
        <div class="ups">${D.upgrades.map(u => {
        const l = G.upLevel(u.id), maxed = l >= u.max, cost = G.upCost(u);
        return `<div class="up ${maxed ? 'maxed' : ''}"><div class="up-ic">${G.icon(u.icon, 30)}</div><div class="up-body"><div class="up-n">${u.n}<span class="pips sm">${Array.from({ length: u.max }, (_, i) => `<i class="${i < l ? 'on' : ''}"></i>`).join('')}</span></div>
            <div class="up-tip">${u.tip}</div><div class="up-d">${u.d(l)}${maxed ? '' : ` <em>→ ${u.d(l + 1)}</em>`}</div></div>
            <button class="btn ${!maxed && d.cash >= cost ? 'primary' : ''}" data-u="${u.id}" ${maxed || d.cash < cost ? 'disabled' : ''}>${maxed ? 'MAX' : G.money(cost)}</button></div>`;
      }).join('')}</div><div class="row"><button class="btn" data-close>Back</button></div></div>`;
      $('[data-close]', o.node).onclick = () => { sfx('click'); o.close(); if (S.screen === 'menu') G.showMenu(); };
      $$('[data-u]', o.node).forEach(b => {
        b.onclick = () => {
          const u = D.upgrades.find(x => x.id === b.dataset.u), cost = G.upCost(u);
          if (d.cash < cost) return;
          d.cash -= cost; d.upgrades[u.id] = G.upLevel(u.id) + 1;
          sfx('cash'); G.checkAch(); G.save.write(); draw();
        };
      });
      bind(o.node);
    };
    draw();
  }
  G.showOffice = showOffice;

  /* ---------- records ---------- */
  function showRecords() {
    const d = G.save.d, s = d.stats;
    let tab = 'ach';
    const o = G.overlay('dim', '');
    const draw = () => {
      let body = '';
      if (tab === 'ach') body = `<div class="achs">${D.achievements.map(a => `<div class="ach ${d.ach[a.id] ? 'on' : ''}">${G.icon(d.ach[a.id] ? 'trophy' : 'lock', 22)}<div><b>${a.n}</b><span>${a.d}</span></div><em>${G.money(a.r)}</em></div>`).join('')}</div>`;
      else if (tab === 'stats') {
        const rows = [['Cases taken', s.cases], ['Cases solved', s.solved], ['Solve rate', s.cases ? Math.round(s.solved / s.cases * 100) + '%' : '—'], ['S ranks', s.sRanks], ['Current streak', s.streak], ['Best streak', s.bestStreak], ['Best score', s.bestScore.toLocaleString()], ['Total score', s.totalScore.toLocaleString()], ['Evidence collected', s.clues], ['Alibis broken', s.lies], ['Secrets exposed', s.secrets], ['Locks, safes & puzzles', s.minis], ['Kingpins brought down', s.bosses], ['Daily streak (best)', d.daily.best], ['Lifetime earnings', G.money(d.earned)], ['Chapter', d.chapter]];
        body = `<div class="stats">${rows.map(r => `<div><span>${r[0]}</span><b>${r[1]}</b></div>`).join('')}</div>`;
      } else body = d.archive.length ? `<div class="archive">${d.archive.slice().reverse().map(a => `<div class="arc ${a.ok ? 'ok' : 'no'}"><b class="g g${a.g}">${a.g}</b><div><b>${esc(a.t)}</b><span>${a.tier} · ${a.ok ? 'Solved' : 'Unsolved'} · ${a.d}</span></div><em>${a.s.toLocaleString()}</em></div>`).join('')}</div>` : '<p class="empty">No closed cases yet. The night is young.</p>';
      o.node.innerHTML = `<div class="panel wide"><div class="deco-head"><span>Records</span></div>
        <div class="tabs">${[['ach', 'Achievements ' + Object.keys(d.ach).length + '/' + D.achievements.length], ['stats', 'Statistics'], ['arc', 'Case Files']].map(t => `<button class="tab ${tab === t[0] ? 'on' : ''}" data-tab="${t[0]}">${t[1]}</button>`).join('')}</div>
        <div class="scroll">${body}</div><div class="row"><button class="btn" data-close>Back</button></div></div>`;
      $('[data-close]', o.node).onclick = () => { sfx('click'); o.close(); };
      $$('[data-tab]', o.node).forEach(b => { b.onclick = () => { sfx('page'); tab = b.dataset.tab; draw(); }; });
    };
    draw();
  }

  /* ---------- settings ---------- */
  function showSettings() {
    const st = G.save.d.settings;
    const o = G.overlay('dim', `<div class="panel dialog"><div class="deco-head"><span>Settings</span></div>
      <label class="slider"><span>Music</span><input type="range" min="0" max="100" value="${Math.round(st.music * 100)}" data-k="music"></label>
      <label class="slider"><span>Sound effects</span><input type="range" min="0" max="100" value="${Math.round(st.sfx * 100)}" data-k="sfx"></label>
      <label class="slider"><span>Text speed</span><input type="range" min="50" max="400" value="${Math.round(st.speed * 100)}" data-k="speed"></label>
      <p class="save-where">${G.save.where()}</p>
      <div class="row"><button class="btn" data-close>Done</button><button class="btn danger" data-reset>Erase Save</button></div></div>`);
    $$('input', o.node).forEach(i => {
      i.oninput = () => { st[i.dataset.k] = i.value / 100; G.audio.setVol(st.music, st.sfx); G.save.commit(); };
      i.onchange = () => { sfx('found'); G.save.write(); };
    });
    $('[data-reset]', o.node).onclick = async () => {
      if (await G.confirm('Erase Everything?', 'Your rank, cash, upgrades and case files will be gone for good.', 'Erase', 'Keep')) { G.save.reset(); o.close(); G.showMenu(); }
    };
  }
  G.showSettings = showSettings;

  G.showHelp = function (then) {
    let i = 0;
    const o = G.overlay('dim', '');
    const draw = () => {
      const h = D.help[i];
      o.node.innerHTML = `<div class="panel dialog help"><div class="deco-head"><span>${h[0]}</span></div><p>${h[1]}</p>
        <div class="dots">${D.help.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
        <div class="row">${i > 0 ? '<button class="btn" data-p>Back</button>' : ''}<button class="btn primary" data-n>${i < D.help.length - 1 ? 'Next' : 'Got it'}</button></div></div>`;
      const p = $('[data-p]', o.node); if (p) p.onclick = () => { sfx('page'); i--; draw(); };
      $('[data-n]', o.node).onclick = () => { sfx('page'); if (i < D.help.length - 1) { i++; draw(); } else { o.close(); G.save.d.seen.help = 1; G.save.commit(); if (then) then(); } };
    };
    draw();
  };

  /* ---------- boot ---------- */
  async function boot() {
    stage = $('#stage'); cv = $('#bg'); ctx = cv.getContext('2d');
    const bar = $('#load-bar i'), step = p => { bar.style.width = p + '%'; };
    await G.sdk.init();
    G.sdk.loadingStart();
    step(20);
    G.save.load();
    const st = G.save.d.settings; G.audio.setVol(st.music, st.sfx);
    try { await Promise.all(['400 20px Limelight', '400 20px "Poiret One"', '400 20px "Josefin Sans"', '600 20px "Josefin Sans"'].map(f => document.fonts.load(f))); } catch (e) { /* fall back to system fonts */ }
    step(55); await G.wait(30);
    fit();
    step(90); await G.wait(30);
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    requestAnimationFrame(frame);
    S.screen = 'menu';
    step(100);
    G.sdk.loadingStop();
    const ld = $('#loading');
    ld.classList.add('ready');
    const start = () => {
      ld.removeEventListener('pointerdown', start); window.removeEventListener('keydown', start);
      G.audio.unlock(); sfx('good');
      ld.classList.add('gone'); setTimeout(() => ld.remove(), 900);
      G.showMenu();
    };
    ld.addEventListener('pointerdown', start); window.addEventListener('keydown', start);
    /* keep audio context alive on any later gesture (mobile browsers) */
    window.addEventListener('pointerdown', () => G.audio.unlock());
    window.addEventListener('keydown', e => {
      if (e.code === 'Escape') { if (G.closeTop()) e.preventDefault(); return; }
      if ($('#modal').children.length) return;
      if (G.caseKey) G.caseKey(e);
    });
    /* arrow keys / space must never scroll the host page */
    window.addEventListener('keydown', e => { if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code) && e.target.tagName !== 'INPUT') e.preventDefault(); });
    window.addEventListener('wheel', e => { if (!e.target.closest || !e.target.closest('.scroll')) e.preventDefault(); }, { passive: false });
    document.addEventListener('contextmenu', e => e.preventDefault());
  }
  window.addEventListener('load', boot);
})();
