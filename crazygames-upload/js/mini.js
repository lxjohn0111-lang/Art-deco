'use strict';
/* GILDED MIDNIGHT — mini-games: lockpicking, safe-cracking, torn letters, dusting for prints */
(function () {
  const G = window.G, A = G.A, TAU = Math.PI * 2;
  const CW = 640, CH = 380;

  /* shared modal shell; resolves with true/false */
  function shell(title, hint, setup) {
    return new Promise(resolve => {
      const modal = G.$('#modal');
      const wrap = G.el('div', 'overlay mini-overlay');
      wrap.innerHTML = `<div class="panel mini-panel"><div class="deco-head"><span>${title}</span></div><p class="mini-hint">${hint}</p>
        <canvas width="${CW * 2}" height="${CH * 2}" class="mini-canvas"></canvas>
        <div class="mini-bar"><div class="mini-status"></div><div class="mini-btns"></div></div></div>`;
      modal.appendChild(wrap);
      const cv = G.$('canvas', wrap), c = cv.getContext('2d');
      c.scale(2, 2);
      const status = G.$('.mini-status', wrap), btns = G.$('.mini-btns', wrap);
      let alive = true, raf = 0;
      const api = {
        c, cv, status,
        pos(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * CW / r.width, y: (e.clientY - r.top) * CH / r.height }; },
        btn(label, fn, cls) { const b = G.el('button', 'btn ' + (cls || ''), label); b.onclick = () => { G.audio.sfx('click'); fn(); }; btns.appendChild(b); return b; },
        end(ok, delay) {
          if (!alive) return; alive = false;
          setTimeout(() => { cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey); wrap.remove(); resolve(ok); }, delay || 0);
        },
        key: null, frame: null
      };
      const onKey = e => { if (alive && api.key) api.key(e); };
      window.addEventListener('keydown', onKey);
      setup(api);
      const t0 = performance.now();
      const loop = now => { if (!alive && !api.linger) return; if (api.frame) api.frame((now - t0) / 1000); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    });
  }
  function plate(c) {
    c.fillStyle = A.lg(c, 0, 0, 0, CH, [[0, '#17123c'], [1, '#080618']]); c.fillRect(0, 0, CW, CH);
    A.sunburst(c, CW / 2, CH + 40, 60, 620, 30, Math.PI, TAU, 'rgba(217,178,95,.06)');
  }
  const gold = (c, x, y, w, h) => A.lg(c, x, y, x + w, y + h, [[0, '#f4dd9a'], [0.5, '#a67c2e'], [1, '#ecc873']]);

  /* ---------------- lock picking ---------------- */
  function lock(o) {
    const hands = G.upLevel('hands'), n = 4, zone = 0.085 + hands * 0.03;
    return shell('Pick the Lock', 'Each pin bounces. <b>Click</b> (or press <b>Space</b>) when the pin crosses the gold shear line.', api => {
      const c = api.c;
      let cur = 0, strikes = 0, flash = 0, flashCol = '#fff', over = false;
      const speed = [1.7, 2.2, 2.7, 3.3].map(s => s * (1 - hands * 0.1)), phase = [0, 1, 2, 3].map(() => Math.random() * TAU);
      let T = 0;
      const posOf = i => 0.5 + 0.5 * Math.sin(T * speed[i] + phase[i]);
      const attempt = () => {
        if (over) return;
        const p = posOf(cur);
        if (Math.abs(p - 0.5) < zone) {
          cur++; flash = 1; flashCol = '#f4dd9a'; G.audio.sfx('pin');
          if (cur >= n) { over = true; G.audio.sfx('open'); api.end(true, 700); }
        } else {
          strikes++; flash = 1; flashCol = '#ff4a5a'; G.audio.sfx('fail');
          if (strikes >= 3) { over = true; api.end(false, 700); }
        }
      };
      api.cv.onpointerdown = attempt;
      api.key = e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); attempt(); } };
      api.btn('Give Up', () => api.end(false));
      api.frame = t => {
        T = t; flash = Math.max(0, flash - 0.04);
        plate(c);
        /* lock body */
        c.fillStyle = gold(c, 90, 60, 460, 260); c.fillRect(90, 60, 460, 260);
        c.fillStyle = '#120d2c'; c.fillRect(104, 74, 432, 232);
        A.zig(c, 320, 74, 300, 30, 3, 'rgba(217,178,95,.25)');
        c.fillStyle = '#05040f'; c.fillRect(130, 250, 380, 34);          // keyway
        A.line(c, 130, 190, 510, 190, '#f4dd9a', 3);                      // shear line
        c.fillStyle = `rgba(244,221,154,${0.10 + zone})`; c.fillRect(130, 190 - zone * 140, 380, zone * 280);
        for (let i = 0; i < n; i++) {
          const x = 180 + i * 93;
          c.fillStyle = '#05040f'; c.fillRect(x - 17, 100, 34, 150);
          const set = i < cur, p = set ? 0.5 : i === cur ? posOf(i) : 0.92;
          const y = 120 + p * 140;
          c.fillStyle = set ? gold(c, x - 13, y - 30, 26, 60) : i === cur ? '#cfd6ff' : '#3a3a5e';
          c.fillRect(x - 13, y - 30, 26, 60);
          c.fillStyle = set ? '#fff6d0' : i === cur ? '#fff' : '#55557a'; c.fillRect(x - 13, y - 2, 26, 4);
          if (set) A.glow(c, x, 190, 40, '#f4dd9a', 0.5);
          if (i === cur && !over) { c.strokeStyle = '#f4dd9a'; c.lineWidth = 2; c.strokeRect(x - 20, 97, 40, 156); }
        }
        /* the pick */
        const px = 180 + Math.min(cur, n - 1) * 93;
        c.strokeStyle = '#b9bcc9'; c.lineWidth = 4; c.lineCap = 'round';
        c.beginPath(); c.moveTo(40, 300); c.lineTo(px - 20, 268); c.lineTo(px, 256); c.stroke();
        if (flash > 0) { c.fillStyle = A.rgba(flashCol, flash * 0.3); c.fillRect(0, 0, CW, CH); }
        api.status.innerHTML = `Pins set: <b>${cur}/${n}</b> &nbsp;·&nbsp; Slips left: <b>${3 - strikes}</b>`;
      };
    });
  }

  /* ---------------- safe cracking ---------------- */
  function safe(o) {
    const hands = G.upLevel('hands'), range = 5 + hands * 2, tol = hands >= 2 ? 1 : 0;
    return shell('Crack the Safe', 'Turn the dial — <b>drag it</b>, or use <b>← →</b>. Listen: the lamp glows as you near the number. Press <b>SET</b> on the sweet spot. Three numbers.', api => {
      const c = api.c, N = 40;
      let val = Math.floor(Math.random() * N), stage = 0, strikes = 0, over = false, lastHot = -1, drag = null, flash = 0, flashCol = '#fff', acc = 0;
      const targets = [];
      let prev = val;
      for (let i = 0; i < 3; i++) { let t; do { t = Math.floor(Math.random() * N); } while (Math.min((t - prev + N) % N, (prev - t + N) % N) < 9); targets.push(t); prev = t; }
      const dist = () => { const d = Math.abs(val - targets[stage]) % N; return Math.min(d, N - d); };
      const turn = d => {
        if (over || !d) return;
        val = ((val + d) % N + N) % N;
        const ds = dist();
        if (ds === 0 && lastHot !== stage * 100 + val) { G.audio.sfx('dialHot'); lastHot = stage * 100 + val; } else G.audio.sfx('dial');
      };
      const set = () => {
        if (over) return;
        if (dist() <= tol) {
          stage++; flash = 1; flashCol = '#f4dd9a'; G.audio.sfx('pin'); lastHot = -1;
          if (stage >= 3) { over = true; stage = 2.999; G.audio.sfx('open'); api.end(true, 800); }
        } else { strikes++; flash = 1; flashCol = '#ff4a5a'; G.audio.sfx('fail'); if (strikes >= 3) { over = true; api.end(false, 700); } }
      };
      const CX = 250, CY = 196;
      api.cv.onpointerdown = e => { const p = api.pos(e); if (Math.hypot(p.x - CX, p.y - CY) < 150) { drag = Math.atan2(p.y - CY, p.x - CX); api.cv.setPointerCapture(e.pointerId); } };
      api.cv.onpointermove = e => {
        if (drag == null) return;
        const p = api.pos(e), a = Math.atan2(p.y - CY, p.x - CX);
        let d = a - drag; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU;
        acc += d / TAU * N; drag = a;
        while (acc >= 1) { turn(1); acc -= 1; } while (acc <= -1) { turn(-1); acc += 1; }
      };
      api.cv.onpointerup = api.cv.onpointercancel = () => { drag = null; };
      api.key = e => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') { e.preventDefault(); turn(-1); }
        else if (e.code === 'ArrowRight' || e.code === 'KeyD') { e.preventDefault(); turn(1); }
        else if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); set(); }
      };
      api.btn('◀', () => turn(-1), 'sm'); api.btn('▶', () => turn(1), 'sm'); api.btn('SET', set, 'primary'); api.btn('Give Up', () => api.end(false));
      api.frame = t => {
        flash = Math.max(0, flash - 0.04);
        plate(c);
        c.fillStyle = A.lg(c, 60, 20, 440, 370, [[0, '#4a4e5e'], [1, '#17181f']]); c.fillRect(50, 16, 400, 348);
        c.strokeStyle = '#0a0a10'; c.lineWidth = 5; c.strokeRect(64, 30, 372, 320);
        A.circ(c, CX, CY, 140, gold(c, CX - 140, CY - 140, 280, 280)); A.circ(c, CX, CY, 128, '#101018');
        c.save(); c.translate(CX, CY); c.rotate(-val / N * TAU);
        for (let i = 0; i < N; i++) {
          const a = i / N * TAU - Math.PI / 2, big = i % 5 === 0;
          A.line(c, Math.cos(a) * (big ? 100 : 108), Math.sin(a) * (big ? 100 : 108), Math.cos(a) * 122, Math.sin(a) * 122, big ? '#f4dd9a' : '#8a8aa8', big ? 3 : 1.5);
          if (big) { c.save(); c.translate(Math.cos(a) * 84, Math.sin(a) * 84); c.rotate(a + Math.PI / 2); c.fillStyle = '#f4dd9a'; c.font = '17px Limelight, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(i), 0, 0); c.restore(); }
        }
        A.circ(c, 0, 0, 58, gold(c, -58, -58, 116, 116)); A.sunburst(c, 0, 0, 10, 56, 24, 0, TAU, 'rgba(60,40,10,.35)'); A.circ(c, 0, 0, 16, '#3a2a10');
        c.restore();
        A.poly(c, [CX - 10, CY - 150, CX + 10, CY - 150, CX, CY - 128], '#ff5a4a');
        /* stethoscope lamp */
        const heat = over ? 1 : Math.max(0, 1 - dist() / range), exact = dist() <= tol;
        c.fillStyle = '#0a0a14'; c.fillRect(480, 40, 120, 300); c.strokeStyle = '#d9b25f'; c.lineWidth = 2; c.strokeRect(480, 40, 120, 300);
        c.fillStyle = '#f4dd9a'; c.font = '15px Limelight, serif'; c.textAlign = 'center'; c.fillText('TUMBLERS', 540, 64);
        const lampCol = exact ? '#7fffb0' : '#ffb45a';
        A.circ(c, 540, 120, 30, A.mix('#1a1a24', exact ? '#7fffb0' : '#ffb45a', heat), '#d9b25f', 2);
        if (heat > 0) A.glow(c, 540, 120, 40 + heat * 60 + Math.sin(t * 20) * 4 * heat, lampCol, 0.3 + heat * 0.6);
        for (let i = 0; i < 10; i++) { c.fillStyle = i < Math.round(heat * 10) ? lampCol : '#22222e'; c.fillRect(506, 300 - i * 13, 68, 9); }
        for (let i = 0; i < 3; i++) { A.circ(c, 512 + i * 28, 190 - 8, 9, i < Math.floor(stage) || (over && strikes < 3) ? '#7fffb0' : '#22222e', '#d9b25f', 1.5); }
        if (flash > 0) { c.fillStyle = A.rgba(flashCol, flash * 0.3); c.fillRect(0, 0, CW, CH); }
        api.status.innerHTML = `Number <b>${Math.min(3, Math.floor(stage) + 1)}/3</b> &nbsp;·&nbsp; Dial: <b>${val}</b> &nbsp;·&nbsp; Mistakes left: <b>${3 - strikes}</b>`;
      };
    });
  }

  /* ---------------- torn letter ---------------- */
  function letter(o) {
    const cols = 3, rows = 3, PW = 540, PH = 330, ox = (CW - PW) / 2, oy = (CH - PH) / 2;
    return shell('Reassemble the Scraps', 'Somebody tore this up. <b>Click two scraps</b> to swap them until it reads true.', api => {
      const c = api.c, src = A.canvas(PW, PH, 2), s = src.x;
      s.fillStyle = A.lg(s, 0, 0, PW, PH, [[0, '#f4ecd6'], [1, '#d9caa4']]); s.fillRect(0, 0, PW, PH);
      for (let i = 0; i < 500; i++) { s.fillStyle = `rgba(120,90,40,${Math.random() * 0.08})`; s.fillRect(Math.random() * PW, Math.random() * PH, 2, 2); }
      /* border, watermark and rules make every scrap unique */
      s.strokeStyle = 'rgba(138,106,42,.8)'; s.lineWidth = 3; s.strokeRect(12, 12, PW - 24, PH - 24); s.lineWidth = 1; s.strokeRect(19, 19, PW - 38, PH - 38);
      [[12, 12, 0], [PW - 12, 12, 1], [PW - 12, PH - 12, 2], [12, PH - 12, 3]].forEach(q => { s.save(); s.translate(q[0], q[1]); s.rotate(q[2] * Math.PI / 2); A.sunburst(s, 0, 0, 6, 44 + q[2] * 9, 6 + q[2] * 2, 0, Math.PI / 2, 'rgba(138,106,42,.55)'); s.restore(); });
      A.sunburst(s, PW / 2, PH / 2 + 30, 26, 150, 26, 0, TAU, 'rgba(138,106,42,.10)'); A.circ(s, PW / 2, PH / 2 + 30, 24, null, 'rgba(138,106,42,.35)', 2);
      for (let yy = 108; yy < PH - 40; yy += 27) { s.strokeStyle = 'rgba(60,80,140,.16)'; s.lineWidth = 1; s.beginPath(); s.moveTo(34, yy); s.lineTo(PW - 34, yy); s.stroke(); }
      s.strokeStyle = 'rgba(40,30,20,.75)'; s.lineWidth = 2; s.beginPath(); s.moveTo(50, PH - 52); s.bezierCurveTo(80, PH - 90, 96, PH - 20, 124, PH - 58); s.bezierCurveTo(140, PH - 80, 150, PH - 40, 190, PH - 56); s.stroke();
      s.fillStyle = '#2a1c14'; s.font = '26px Limelight, serif'; s.textAlign = 'center'; s.fillText(o.title.toUpperCase(), PW / 2, 46);
      s.strokeStyle = '#8a6a2a'; s.lineWidth = 2; s.beginPath(); s.moveTo(60, 60); s.lineTo(PW - 60, 60); s.stroke();
      s.font = 'bold 18px "Courier New", monospace'; s.textAlign = 'left';
      const words = o.text.split(' '); let ln = '', y = 100;
      words.forEach(w => { if (s.measureText(ln + w).width > PW - 90) { s.fillText(ln, 44, y); ln = ''; y += 27; } ln += w + ' '; });
      s.fillText(ln, 44, y);
      s.save(); s.translate(PW - 100, PH - 70); s.rotate(-0.25); s.strokeStyle = 'rgba(165,29,45,.75)'; s.lineWidth = 4; s.strokeRect(-60, -22, 120, 44); s.fillStyle = 'rgba(165,29,45,.75)'; s.font = '20px Limelight, serif'; s.textAlign = 'center'; s.fillText('PRIVATE', 0, 8); s.restore();
      const n = cols * rows, pw = PW / cols, ph = PH / rows;
      let perm = []; for (let i = 0; i < n; i++) perm.push(i);
      do { for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; } } while (perm.filter((p, i) => p === i).length > 2);
      const rot = perm.map(() => (Math.random() - 0.5) * 0.06);
      let sel = -1, done = false, moves = 0;
      api.cv.onpointerdown = e => {
        if (done) return;
        const p = api.pos(e), cx = Math.floor((p.x - ox) / pw), cy = Math.floor((p.y - oy) / ph);
        if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) return;
        const i = cy * cols + cx;
        if (sel < 0) { sel = i; G.audio.sfx('page'); }
        else {
          if (sel !== i) { [perm[sel], perm[i]] = [perm[i], perm[sel]]; moves++; G.audio.sfx('page'); }
          sel = -1;
          if (perm.every((p2, k) => p2 === k)) { done = true; G.audio.sfx('found'); api.end(true, 900); }
        }
      };
      api.btn('Give Up', () => api.end(false));
      api.frame = () => {
        plate(c);
        for (let i = 0; i < n; i++) {
          const sx = (perm[i] % cols) * pw, sy = Math.floor(perm[i] / cols) * ph, dx = ox + (i % cols) * pw, dy = oy + Math.floor(i / cols) * ph, ok = perm[i] === i;
          c.save(); c.translate(dx + pw / 2, dy + ph / 2); if (!done) c.rotate(ok ? 0 : rot[i]);
          const g = done ? 0 : 3;
          c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 8;
          c.drawImage(src.c, sx * 2, sy * 2, pw * 2, ph * 2, -pw / 2 + g, -ph / 2 + g, pw - g * 2, ph - g * 2);
          c.shadowBlur = 0;
          if (i === sel) { c.strokeStyle = '#f4dd9a'; c.lineWidth = 4; c.strokeRect(-pw / 2 + g, -ph / 2 + g, pw - g * 2, ph - g * 2); }
          c.restore();
        }
        api.status.innerHTML = `Swaps: <b>${moves}</b>`;
      };
    });
  }

  /* ---------------- dusting for prints ---------------- */
  function drawPrint(c, cx, cy, kind) {
    c.strokeStyle = '#fff3cf'; c.lineWidth = 3.2; c.lineCap = 'round';
    c.save(); c.beginPath(); c.ellipse(cx, cy, 92, 124, 0, 0, TAU); c.clip();
    c.setLineDash([26, 5, 40, 4, 14, 6]);
    if (kind === 'whorl') {
      for (let i = 1; i <= 15; i++) { c.lineDashOffset = i * 13; c.beginPath(); c.ellipse(cx + Math.sin(i) * 2, cy + 6, i * 6.6, i * 8.6, 0.12, 0, TAU); c.stroke(); }
    } else if (kind === 'loop') {
      for (let i = 1; i <= 16; i++) { c.lineDashOffset = i * 17; const r = i * 6.4; c.beginPath(); c.moveTo(cx - r - 70, cy + 150); c.lineTo(cx - r, cy + 10); c.arc(cx, cy + 10 - i * 1.5, r, Math.PI, TAU); c.lineTo(cx + r - 96, cy + 170); c.stroke(); }
    } else {
      for (let i = 0; i < 20; i++) { c.lineDashOffset = i * 11; const y = cy - 130 + i * 14, h = Math.max(4, 74 - i * 3.6); c.beginPath(); c.moveTo(cx - 110, y + h * 0.6 + 26); c.quadraticCurveTo(cx, y - h, cx + 110, y + h * 0.6 + 26); c.stroke(); }
    }
    c.setLineDash([]); c.restore();
  }
  function dust(o) {
    return shell('Dust for Prints', 'A print hides on the grip. <b>Drag the brush</b> across it to raise the pattern.', api => {
      const c = api.c, cx = 250, cy = 190;
      const print = A.canvas(CW, CH, 1); drawPrint(print.x, cx, cy, o.kind);
      const mask = A.canvas(CW, CH, 1), comp = A.canvas(CW, CH, 1);
      const GX = 12, GY = 16, cells = new Uint8Array(GX * GY); let hit = 0, done = false, down = false, last = null;
      const total = (() => { let n = 0; for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) { const x = (i + 0.5) / GX * 2 - 1, y = (j + 0.5) / GY * 2 - 1; if (x * x + y * y <= 1) n++; } return n; })();
      const brush = p => {
        mask.x.fillStyle = A.rg(mask.x, p.x, p.y, 4, 34, [[0, 'rgba(255,255,255,.55)'], [1, 'rgba(255,255,255,0)']]);
        mask.x.fillRect(p.x - 34, p.y - 34, 68, 68);
        for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) {
          const x = cx - 92 + (i + 0.5) / GX * 184, y = cy - 124 + (j + 0.5) / GY * 248, nx = (i + 0.5) / GX * 2 - 1, ny = (j + 0.5) / GY * 2 - 1;
          if (nx * nx + ny * ny <= 1 && !cells[j * GX + i] && Math.hypot(x - p.x, y - p.y) < 26) { cells[j * GX + i] = 1; hit++; }
        }
        if (!done && hit / total >= 0.82) { done = true; G.audio.sfx('found'); api.end(true, 1500); }
      };
      api.cv.onpointerdown = e => { down = true; last = api.pos(e); brush(last); api.cv.setPointerCapture(e.pointerId); };
      api.cv.onpointermove = e => { last = api.pos(e); if (down) { brush(last); if (Math.random() < 0.2) G.audio.sfx('type'); } };
      api.cv.onpointerup = api.cv.onpointercancel = () => { down = false; };
      api.btn('Skip', () => api.end(false));
      api.frame = t => {
        plate(c);
        c.fillStyle = A.lg(c, 130, 40, 370, 340, [[0, '#3a3440'], [1, '#131018']]); c.fillRect(120, 30, 260, 320);
        c.strokeStyle = '#d9b25f'; c.lineWidth = 2; c.strokeRect(120, 30, 260, 320);
        comp.x.clearRect(0, 0, CW, CH); comp.x.globalCompositeOperation = 'source-over'; comp.x.drawImage(print.c, 0, 0);
        comp.x.globalCompositeOperation = 'destination-in'; comp.x.drawImage(mask.c, 0, 0);
        c.globalAlpha = 0.25; c.drawImage(mask.c, 0, 0); c.globalAlpha = 1; c.drawImage(comp.c, 0, 0);
        /* reference card */
        c.fillStyle = '#0a0a14'; c.fillRect(420, 30, 190, 320); c.strokeStyle = '#d9b25f'; c.strokeRect(420, 30, 190, 320);
        c.fillStyle = '#f4dd9a'; c.font = '15px Limelight, serif'; c.textAlign = 'center'; c.fillText('PATTERN', 515, 56);
        ['whorl', 'loop', 'arch'].forEach((k, i) => {
          const y = 76 + i * 90, on = done && k === o.kind;
          c.fillStyle = on ? 'rgba(127,255,176,.18)' : 'rgba(255,255,255,.04)'; c.fillRect(434, y, 162, 78);
          c.save(); c.translate(470, y + 39); c.scale(0.26, 0.26); drawPrint(c, 0, 0, k); c.restore();
          c.fillStyle = on ? '#7fffb0' : '#b9bcc9'; c.font = '17px Limelight, serif'; c.textAlign = 'left'; c.fillText(k.toUpperCase(), 512, y + 45);
        });
        if (last && !done) { A.circ(c, last.x, last.y, 24, 'rgba(244,221,154,.10)', '#f4dd9a', 1.5); }
        api.status.innerHTML = done ? `Pattern identified: <b>${o.kind.toUpperCase()}</b>` : `Raised: <b>${Math.min(100, Math.round(hit / total / 0.82 * 100))}%</b>`;
      };
    });
  }

  G.mini = { lock, safe, letter, dust };
})();
