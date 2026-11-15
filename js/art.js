'use strict';
/* GILDED MIDNIGHT — procedural art: deco primitives, skyline, portraits, icons */
(function () {
  const G = window.G, A = G.A = {};
  const TAU = Math.PI * 2;

  A.canvas = function (w, h, q) {
    q = q || 1;
    const c = document.createElement('canvas');
    c.width = Math.round(w * q); c.height = Math.round(h * q);
    const x = c.getContext('2d');
    x.scale(q, q);
    return { c, x };
  };
  const hex = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  A.mix = function (a, b, t) {
    const p = hex(a), q = hex(b);
    return 'rgb(' + p.map((v, i) => Math.round(v + (q[i] - v) * t)).join(',') + ')';
  };
  A.rgba = function (h, a) { const p = hex(h); return `rgba(${p[0]},${p[1]},${p[2]},${a})`; };
  A.lg = function (c, x0, y0, x1, y1, stops) {
    const g = c.createLinearGradient(x0, y0, x1, y1);
    stops.forEach(s => g.addColorStop(s[0], s[1]));
    return g;
  };
  A.rg = function (c, x, y, r0, r1, stops) {
    const g = c.createRadialGradient(x, y, r0, x, y, r1);
    stops.forEach(s => g.addColorStop(s[0], s[1]));
    return g;
  };
  A.poly = function (c, pts, fill, stroke, lw) {
    c.beginPath();
    c.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.stroke(); }
  };
  A.rect = function (c, x, y, w, h, fill) { c.fillStyle = fill; c.fillRect(x, y, w, h); };
  A.circ = function (c, x, y, r, fill, stroke, lw) {
    c.beginPath(); c.arc(x, y, r, 0, TAU);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.stroke(); }
  };
  A.ell = function (c, x, y, rx, ry, fill, stroke, lw) {
    c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.stroke(); }
  };
  A.line = function (c, x0, y0, x1, y1, col, lw) {
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.strokeStyle = col; c.lineWidth = lw || 1; c.stroke();
  };
  /* additive soft glow */
  A.glow = function (c, x, y, r, col, a) {
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.fillStyle = A.rg(c, x, y, 0, r, [[0, A.rgba(col, a == null ? 0.6 : a)], [1, A.rgba(col, 0)]]);
    c.fillRect(x - r, y - r, r * 2, r * 2);
    c.restore();
  };
  /* cone of light from (x,y) pointing at angle ang */
  A.cone = function (c, x, y, ang, spread, len, col, a) {
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.translate(x, y); c.rotate(ang);
    const g = c.createLinearGradient(0, 0, len, 0);
    g.addColorStop(0, A.rgba(col, a)); g.addColorStop(1, A.rgba(col, 0));
    c.fillStyle = g;
    c.beginPath(); c.moveTo(0, -3); c.lineTo(len, -Math.tan(spread) * len); c.lineTo(len, Math.tan(spread) * len); c.lineTo(0, 3); c.closePath(); c.fill();
    c.restore();
  };
  /* deco sunburst: alternating wedges */
  A.sunburst = function (c, cx, cy, r0, r1, n, a0, a1, col) {
    c.fillStyle = col;
    const step = (a1 - a0) / n;
    for (let i = 0; i < n; i += 2) {
      const s = a0 + i * step, e = s + step;
      c.beginPath();
      c.moveTo(cx + Math.cos(s) * r0, cy + Math.sin(s) * r0);
      c.lineTo(cx + Math.cos(s) * r1, cy + Math.sin(s) * r1);
      c.lineTo(cx + Math.cos(e) * r1, cy + Math.sin(e) * r1);
      c.lineTo(cx + Math.cos(e) * r0, cy + Math.sin(e) * r0);
      c.closePath(); c.fill();
    }
  };
  /* stepped ziggurat silhouette, centred on cx, sitting on baseY */
  A.zig = function (c, cx, baseY, w, h, steps, fill) {
    c.fillStyle = fill;
    for (let i = 0; i < steps; i++) {
      const tw = w * (1 - i / steps), th = h / steps;
      c.fillRect(cx - tw / 2, baseY - th * (i + 1), tw, th + 0.5);
    }
  };
  /* scalloped deco fan */
  A.fan = function (c, cx, cy, r, col, col2, n) {
    n = n || 5;
    for (let i = n; i >= 1; i--) {
      c.beginPath(); c.arc(cx, cy, r * i / n, Math.PI, TAU); c.closePath();
      c.fillStyle = i % 2 ? col : col2; c.fill();
    }
  };
  A.chevrons = function (c, x, y, w, h, n, col, lw) {
    c.strokeStyle = col; c.lineWidth = lw || 2;
    for (let i = 0; i < n; i++) {
      const yy = y + i * (h / n);
      c.beginPath(); c.moveTo(x, yy); c.lineTo(x + w / 2, yy + h / n * 0.8); c.lineTo(x + w, yy); c.stroke();
    }
  };
  /* gold picture frame */
  A.frame = function (c, x, y, w, h, t) {
    t = t || 6;
    c.fillStyle = A.lg(c, x, y, x + w, y + h, [[0, '#f0d58a'], [0.5, '#a67c2e'], [1, '#e9c873']]);
    c.fillRect(x - t, y - t, w + 2 * t, h + 2 * t);
    c.fillStyle = '#1a1030'; c.fillRect(x, y, w, h);
  };

  /* ---------------- skyline ---------------- */
  A.building = function (c, r, x, base, w, h, o) {
    o = o || {};
    const wall = o.wall || '#0f0b33', pier = o.pier || '#1a1552', wins = o.wins || ['#ffd95a', '#ffc23a', '#ffe9a0'];
    const lit = o.lit == null ? 0.5 : o.lit, ws = o.ws || 4, gap = o.gap || 4;
    let tiers = o.tiers || r.int(1, 3), cx = x + w / 2, y = base, tw = w, rem = h;
    for (let i = 0; i < tiers; i++) {
      const th = i === tiers - 1 ? rem : rem * r.f(0.45, 0.68), x0 = cx - tw / 2;
      c.fillStyle = wall; c.fillRect(x0, y - th, tw, th + 1);
      const cols = Math.max(2, Math.floor((tw - 4) / (ws + gap))), step = (tw - 4) / cols;
      c.fillStyle = pier;
      for (let k = 0; k <= cols; k++) c.fillRect(x0 + 2 + k * step - 0.8, y - th, 1.6, th);
      const rowH = ws + gap + 1, rows = Math.floor((th - 6) / rowH);
      const colF = []; for (let k = 0; k < cols; k++) colF.push(r.f(0.3, 1.4));
      for (let j = 0; j < rows; j++) {
        const rowF = r.chance(0.12) ? 0.05 : r.f(0.6, 1.3);
        for (let k = 0; k < cols; k++) {
          if (r() < lit * colF[k] * rowF) {
            c.globalAlpha = r.f(0.5, 1); c.fillStyle = r.pick(wins);
            c.fillRect(x0 + 2 + k * step + (step - ws) / 2, y - th + 5 + j * rowH, ws, ws + 1);
          }
        }
      }
      c.globalAlpha = 1;
      if (o.rim) { c.fillStyle = o.rim; c.fillRect(x0, y - th, 1.5, th); c.fillRect(x0, y - th, tw, 1.5); }
      c.fillStyle = pier; c.fillRect(x0 - 1.5, y - th - 2, tw + 3, 3);
      y -= th; rem -= th; tw *= r.f(0.55, 0.78);
      if (rem < 10) break;
    }
    const crown = o.crown == null ? r.int(0, 4) : o.crown;
    c.fillStyle = wall;
    if (crown === 1) { A.poly(c, [cx - 2, y, cx, y - h * 0.22 - 14, cx + 2, y], wall); }
    else if (crown === 2) { A.zig(c, cx, y, tw * 0.8, Math.min(34, tw * 0.6), 4, wall); A.poly(c, [cx - 1.5, y - 20, cx, y - 20 - h * 0.14 - 10, cx + 1.5, y - 20], wall); }
    else if (crown === 3) {
      for (let k = 3; k >= 1; k--) { c.beginPath(); c.arc(cx, y, tw * 0.42 * k / 3, Math.PI, TAU); c.fillStyle = k % 2 ? wall : pier; c.fill(); }
      A.poly(c, [cx - 1.5, y - tw * 0.4, cx, y - tw * 0.4 - 30, cx + 1.5, y - tw * 0.4], wall);
    } else if (crown === 4 && tw > 26) {
      c.fillRect(cx - tw * 0.25, y - 12, tw * 0.2, 12); A.poly(c, [cx - tw * 0.27, y - 12, cx - tw * 0.15, y - 20, cx - tw * 0.03, y - 12], wall);
      c.fillRect(cx + tw * 0.2, y - 22, 1.5, 22);
    }
    return { cx, top: y, tw };
  };

  A.heroTower = function (c, r, cx, base, s) {
    const ws = [230, 178, 132, 96, 66, 42, 24], hs = [140, 120, 105, 90, 70, 50, 34];
    let y = base;
    for (let i = 0; i < ws.length; i++) {
      const w = ws[i] * s, h = hs[i] * s, x0 = cx - w / 2, t = i / (ws.length - 1);
      const hot = Math.max(0, (t - 0.35) / 0.65);
      c.fillStyle = A.lg(c, 0, y, 0, y - h, [[0, A.mix('#120c3a', '#7a1f6a', hot)], [1, A.mix('#17104a', '#e23c6e', hot)]]);
      c.fillRect(x0, y - h, w, h + 1);
      const step = 9 * s + 1, cols = Math.floor((w - 6) / step);
      c.fillStyle = A.mix('#231a66', '#ff8fa8', hot);
      for (let k = 0; k <= cols; k++) c.fillRect(x0 + 3 + k * ((w - 6) / cols) - 1, y - h, 2, h);
      const rows = Math.floor((h - 6) / (8 * s + 2));
      for (let j = 0; j < rows; j++) for (let k = 0; k < cols; k++) {
        if (r() < 0.62 - hot * 0.25) {
          c.globalAlpha = r.f(0.55, 1); c.fillStyle = r.pick(['#ffd95a', '#ffe9a0', '#ffc23a']);
          c.fillRect(x0 + 3 + k * ((w - 6) / cols) + 2.4, y - h + 5 + j * (8 * s + 2), 3.4 * s + 1, 4.6 * s + 1);
        }
      }
      c.globalAlpha = 1;
      c.fillStyle = A.mix('#2c2180', '#ffc0cf', hot); c.fillRect(x0 - 2, y - h - 2, w + 4, 3);
      /* corner pylons */
      c.fillStyle = A.mix('#0c0828', '#8a2460', hot);
      c.fillRect(x0 - 3, y - h - 8 * s, 7, 8 * s + 6); c.fillRect(x0 + w - 4, y - h - 8 * s, 7, 8 * s + 6);
      y -= h;
    }
    /* crown fins + spire */
    for (let k = -3; k <= 3; k++) A.poly(c, [cx + k * 3.4 * s - 1.2, y, cx + k * 3.4 * s, y - (52 - Math.abs(k) * 11) * s, cx + k * 3.4 * s + 1.2, y], k % 2 ? '#ff6f8f' : '#ffd0da');
    A.poly(c, [cx - 1.6, y - 40 * s, cx, y - 150 * s, cx + 1.6, y - 40 * s], '#ffc9d6');
    A.glow(c, cx, y - 20 * s, 190 * s, '#ff3c78', 0.34);
    A.glow(c, cx, y + 120 * s, 260 * s, '#c02a8a', 0.16);
    return { x: cx, y: y - 150 * s };
  };

  /* Builds the two cached skyline layers. o: {seed, hero:{x,s}, horizon, moon} */
  A.makeSkyline = function (o, q) {
    const W = G.W, H = G.H, r = G.rng(o.seed || 7);
    const back = A.canvas(W, H, q), front = A.canvas(W, H, q);
    let c = back.x;
    c.fillStyle = A.lg(c, 0, 0, 0, H, [[0, '#02020b'], [0.38, '#0a0930'], [0.7, '#2b1a6e'], [0.9, '#6a2f97'], [1, '#8a3a8f']]);
    c.fillRect(0, 0, W, H);
    for (let i = 0; i < 260; i++) { c.globalAlpha = r.f(0.15, 0.9); c.fillStyle = r.chance(0.15) ? '#ffe9b0' : '#cfd6ff'; const sz = r.chance(0.08) ? 2 : 1; c.fillRect(r.f(0, W), r.f(0, H * 0.55), sz, sz); }
    c.globalAlpha = 1;
    const mx = o.moonX == null ? W * 0.8 : o.moonX, my = o.moonY || 120;
    A.glow(c, mx, my, 240, '#8f8cff', 0.35);
    A.circ(c, mx, my, 44, A.rg(c, mx - 12, my - 12, 4, 50, [[0, '#fff8e0'], [1, '#e9d9a8']]));
    c.fillStyle = 'rgba(190,170,120,.35)'; A.circ(c, mx + 12, my + 8, 9, 'rgba(180,160,110,.35)'); A.circ(c, mx - 14, my - 10, 6, 'rgba(180,160,110,.3)');
    /* cloud bands */
    c.save();
    try { c.filter = 'blur(9px)'; } catch (e) { /* no filter support */ }
    for (let i = 0; i < 26; i++) {
      const y = r.f(40, H * 0.6);
      A.ell(c, r.f(-100, W + 100), y, r.f(120, 380), r.f(8, 26), `rgba(${r.int(70, 130)},${r.int(50, 90)},${r.int(170, 230)},${r.f(0.1, 0.26)})`);
    }
    c.restore();
    /* far layer */
    const hz = o.horizon || H * 0.86;
    for (let x = -20; x < W + 20;) {
      const w = r.f(26, 64), h = r.f(90, 300);
      A.building(c, r, x, hz, w, h, { wall: '#1c1560', pier: '#241c74', wins: ['#8f86ff', '#b9a6ff', '#ffd98a'], lit: 0.34, ws: 2, gap: 3 });
      x += w * r.f(0.7, 1.05);
    }
    c.fillStyle = A.lg(c, 0, hz - 320, 0, hz, [[0, 'rgba(60,40,150,0)'], [1, 'rgba(120,60,170,.55)']]);
    c.fillRect(0, hz - 320, W, 330);

    /* front: mid + hero + near */
    c = front.x;
    for (let x = -30; x < W + 30;) {
      const w = r.f(46, 110), h = r.f(170, 430);
      A.building(c, r, x, H + 4, w, h, { wall: '#110c3c', pier: '#1b1560', lit: 0.5, ws: 3, gap: 4, rim: 'rgba(110,100,255,.35)' });
      x += w * r.f(0.75, 1.1);
    }
    c.fillStyle = A.lg(c, 0, H - 300, 0, H, [[0, 'rgba(40,20,110,0)'], [1, 'rgba(90,40,150,.45)']]);
    c.fillRect(0, H - 300, W, 300);
    let spire = null;
    if (o.hero) spire = A.heroTower(c, r, o.hero.x, H + 10, o.hero.s);
    for (let x = -40; x < W + 40;) {
      const w = r.f(70, 170), h = r.f(90, 300);
      if (!o.hero || Math.abs(x + w / 2 - o.hero.x) > 150 * o.hero.s) {
        A.building(c, r, x, H + 4, w, h, { wall: '#07051c', pier: '#0f0b36', lit: 0.42, ws: 5, gap: 6, rim: 'rgba(90,110,255,.6)', wins: ['#ffd95a', '#ffcf40', '#fff0a8'] });
      }
      x += w * r.f(0.9, 1.5);
    }
    c.fillStyle = A.lg(c, 0, H - 150, 0, H, [[0, 'rgba(30,14,80,0)'], [1, 'rgba(70,30,130,.6)']]);
    c.fillRect(0, H - 150, W, 150);
    return { back: back.c, front: front.c, spire, lights: [W * 0.12, W * 0.33, W * 0.62, W * 0.9].map((x, i) => ({ x, ph: i * 1.7, sp: 0.16 + i * 0.045 })) };
  };

  /* animated: searchlights between the layers */
  A.searchlights = function (c, t, sk, hz) {
    sk.lights.forEach(l => {
      const ang = -Math.PI / 2 + Math.sin(t * l.sp + l.ph) * 0.62;
      A.cone(c, l.x, hz, ang, 0.045, 820, '#9a8cff', 0.36);
    });
  };
  const rainSeed = []; for (let i = 0; i < 170; i++) rainSeed.push([Math.random(), Math.random(), 0.6 + Math.random() * 0.8]);
  A.rain = function (c, t, a) {
    const W = G.W, H = G.H;
    c.save(); c.strokeStyle = `rgba(170,180,255,${a == null ? 0.3 : a})`; c.lineWidth = 1; c.beginPath();
    for (let i = 0; i < rainSeed.length; i++) {
      const s = rainSeed[i], y = ((s[1] + t * 0.9 * s[2]) % 1) * (H + 80) - 40, x = ((s[0] + t * 0.07 * s[2]) % 1) * (W + 100) - 50;
      c.moveTo(x, y); c.lineTo(x - 5 * s[2], y + 26 * s[2]);
    }
    c.stroke(); c.restore();
  };
  const moteSeed = []; for (let i = 0; i < 40; i++) moteSeed.push([Math.random(), Math.random(), Math.random()]);
  A.motes = function (c, t, col, a) {
    c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = col;
    for (let i = 0; i < moteSeed.length; i++) {
      const s = moteSeed[i];
      const x = (s[0] + Math.sin(t * 0.13 + s[2] * 9) * 0.03) * G.W, y = ((s[1] - t * 0.012 * (0.4 + s[2])) % 1 + 1) % 1 * G.H;
      c.globalAlpha = (a || 0.35) * (0.4 + 0.6 * Math.sin(t * 0.9 + s[2] * 20) ** 2);
      c.fillRect(x, y, 2, 2);
    }
    c.restore();
  };
  /* drifting smoke wisp */
  A.smoke = function (c, x, y, t, col, n) {
    c.save(); c.strokeStyle = col; c.lineWidth = 2; c.lineCap = 'round';
    for (let k = 0; k < (n || 2); k++) {
      c.beginPath(); c.moveTo(x, y);
      for (let i = 1; i <= 16; i++) {
        const yy = y - i * 9, xx = x + Math.sin(i * 0.5 + t * 1.2 + k * 2) * (i * 1.6) + k * 4;
        c.globalAlpha = 0.5 * (1 - i / 16); c.lineTo(xx, yy);
      }
      c.stroke();
    }
    c.restore();
  };

  /* the detective, seen from behind */
  A.detective = function (c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s);
    const ink = '#03020a';
    c.fillStyle = ink;
    c.beginPath(); c.moveTo(-176, 0); c.lineTo(-170, -150); c.quadraticCurveTo(-164, -218, -96, -242); c.lineTo(-40, -264); c.lineTo(40, -264); c.lineTo(96, -242); c.quadraticCurveTo(164, -218, 170, -150); c.lineTo(176, 0); c.closePath(); c.fill();
    A.poly(c, [-52, -262, -44, -312, -12, -290, 12, -290, 44, -312, 52, -262], ink);
    A.ell(c, 0, -322, 41, 47, ink);
    A.ell(c, 0, -348, 86, 15, ink);
    c.beginPath(); c.moveTo(-46, -350); c.quadraticCurveTo(-50, -404, -30, -414); c.quadraticCurveTo(0, -402, 30, -414); c.quadraticCurveTo(50, -404, 46, -350); c.closePath(); c.fill();
    c.strokeStyle = '#2a2350'; c.lineWidth = 7; c.beginPath(); c.moveTo(-46, -362); c.quadraticCurveTo(0, -352, 46, -362); c.stroke();
    /* cool rim light, city-side */
    c.lineCap = 'round';
    c.strokeStyle = 'rgba(120,110,255,.85)'; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(44, -262); c.lineTo(96, -242); c.quadraticCurveTo(164, -218, 170, -150); c.lineTo(175, -20); c.stroke();
    c.beginPath(); c.ellipse(0, -348, 86, 15, 0, -0.9, 0.6); c.stroke();
    c.beginPath(); c.moveTo(30, -414); c.quadraticCurveTo(50, -404, 46, -362); c.stroke();
    c.strokeStyle = 'rgba(255,90,140,.5)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-96, -242); c.quadraticCurveTo(-164, -218, -170, -150); c.stroke();
    c.beginPath(); c.moveTo(44, -310); c.lineTo(50, -266); c.stroke();
    c.restore();
  };

  /* ---------------- portraits ---------------- */
  const HAIR = { black: ['#15121f', '#4a4c90'], brown: ['#4a2c1a', '#9a6a3c'], blonde: ['#d8b25a', '#fbe9a6'], red: ['#a3341c', '#ee7a44'], silver: ['#b9bcc9', '#f4f6ff'] };
  const CLOTH = { crimson: '#a01d33', emerald: '#12805c', sapphire: '#2447c4', plum: '#6d3192', ivory: '#e2d8bd', charcoal: '#454556' };
  const SKIN = ['#f3cdaa', '#e3b088', '#c98e62', '#9d6644', '#714630'];
  A.CLOTH = CLOTH; A.HAIRC = HAIR;

  A.portrait = function (p, dead) {
    const W = 240, H = 300, cv = A.canvas(W, H, 2), c = cv.x, r = G.rng(p.lookSeed);
    const f = p.g === 'f', hair = HAIR[p.traits.hair] || HAIR.black, cloth = CLOTH[p.traits.fabric] || CLOTH.charcoal;
    const skin = r.pick(SKIN), shade = A.mix(skin, '#1b0f4a', 0.58), cx = 120;
    const hw = f ? r.f(42, 46) : r.f(45, 51), jaw = f ? r.f(0.74, 0.84) : r.f(0.84, 0.96), chin = f ? r.f(12, 17) : r.f(17, 25), chinY = r.f(183, 190);
    const style = r.int(0, 3), hat = !f && r.chance(0.22), band = f && r.chance(0.25);
    /* backdrop */
    c.fillStyle = A.lg(c, 0, 0, 0, H, [[0, '#191247'], [1, '#07051a']]); c.fillRect(0, 0, W, H);
    A.sunburst(c, cx, 150, 30, 330, 28, 0, TAU, A.rgba(cloth.length === 7 ? cloth : '#444466', 0.2));
    A.glow(c, 60, 60, 200, '#ffb45a', 0.16);
    /* long hair behind */
    if (f && (style === 0 || style === 3)) {
      c.fillStyle = hair[0]; c.beginPath();
      const low = style === 3 ? 232 : 172;
      c.moveTo(cx - hw - 12, 110); c.quadraticCurveTo(cx - hw - 14, 44, cx, 42); c.quadraticCurveTo(cx + hw + 14, 44, cx + hw + 12, 110);
      c.lineTo(cx + hw + (style === 3 ? 20 : 8), low); c.quadraticCurveTo(cx, low + 14, cx - hw - (style === 3 ? 20 : 8), low); c.closePath(); c.fill();
    }
    /* shoulders */
    const lit = A.mix(cloth, '#ffffff', 0.12), dark = A.mix(cloth, '#0a0626', 0.62);
    c.fillStyle = A.lg(c, 20, 0, 220, 0, [[0, lit], [0.48, cloth], [0.52, dark], [1, A.mix(cloth, '#05031a', 0.8)]]);
    c.beginPath(); c.moveTo(0, 300); c.lineTo(14, 246); c.quadraticCurveTo(24, 220, 84, 206); c.lineTo(156, 206); c.quadraticCurveTo(216, 220, 226, 246); c.lineTo(240, 300); c.closePath(); c.fill();
    /* neck */
    c.fillStyle = shade; c.fillRect(cx - 17, 168, 34, 48);
    c.fillStyle = skin; c.fillRect(cx - 17, 168, 15, 48);
    if (f) {
      A.poly(c, [cx - 34, 206, cx + 34, 206, cx + 8, 258, cx - 8, 258], shade);
      A.poly(c, [cx - 34, 206, cx - 2, 206, cx - 2, 256, cx - 8, 258], skin);
      if (r.chance(0.6)) for (let i = 0; i <= 12; i++) { const a = Math.PI * (0.12 + 0.76 * i / 12); A.circ(c, cx + Math.cos(a) * 30, 204 + Math.sin(a) * 30, 3.2, '#f7f0dc', 'rgba(0,0,0,.25)', 0.6); }
      if (r.chance(0.35)) for (let i = 0; i < 16; i++) { const t = i / 15; A.circ(c, 26 + t * 188, 232 - Math.sin(t * Math.PI) * 26 + r.f(-4, 4), r.f(13, 18), i < 8 ? A.mix(cloth, '#fff', 0.3) : A.mix(cloth, '#05031a', 0.5)); }
    } else {
      A.poly(c, [cx - 24, 206, cx + 24, 206, cx, 268], '#efe6cf');
      A.poly(c, [cx, 206, cx + 24, 206, cx, 268], '#a79fb8');
      const tie = r.pick(['#0d0a1e', '#8e1b2e', '#c9a14a', '#1e2f7a']);
      if (r.chance(0.5)) { A.poly(c, [cx - 15, 208, cx, 216, cx - 15, 226], tie); A.poly(c, [cx + 15, 208, cx, 216, cx + 15, 226], tie); A.circ(c, cx, 217, 4, tie); }
      else { A.poly(c, [cx - 6, 210, cx + 6, 210, cx + 4, 222, cx + 8, 262, cx, 272, cx - 8, 262, cx - 4, 222], tie); }
      A.poly(c, [cx - 24, 206, cx - 40, 214, cx - 6, 284, cx, 268], A.mix(cloth, '#fff', 0.2));
      A.poly(c, [cx + 24, 206, cx + 40, 214, cx + 6, 284, cx, 268], A.mix(cloth, '#05031a', 0.45));
    }
    /* ears */
    A.ell(c, cx - hw - 1, 126, 6, 11, skin); A.ell(c, cx + hw + 1, 126, 6, 11, shade);
    /* face */
    const face = new Path2D();
    face.moveTo(cx - hw, 100); face.quadraticCurveTo(cx - hw, 54, cx, 54); face.quadraticCurveTo(cx + hw, 54, cx + hw, 100);
    face.lineTo(cx + hw * jaw, 152); face.lineTo(cx + chin, chinY); face.lineTo(cx - chin, chinY); face.lineTo(cx - hw * jaw, 152); face.closePath();
    c.fillStyle = skin; c.fill(face);
    c.save(); c.clip(face);
    c.fillStyle = shade; A.poly(c, [cx + 9, 40, cx + 80, 40, cx + 80, 200, cx - 4, 200, cx + 12, 160, cx + 4, 150, cx + 14, 118], shade);
    c.fillStyle = A.rgba('#1b0f4a', 0.25); A.poly(c, [cx - hw, 132, cx - 20, 150, cx - hw * jaw, 160], A.rgba('#1b0f4a', 0.22));
    c.restore();
    c.strokeStyle = 'rgba(125,135,255,.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx + hw, 96); c.lineTo(cx + hw * jaw, 152); c.lineTo(cx + chin, chinY); c.stroke();
    /* features */
    const ey = 116, ex = hw * 0.46, tilt = { hostile: 5, cold: 3, nervous: -4, melancholy: -5, suave: 1, theatrical: -1 }[p.pers] || 0;
    [-1, 1].forEach(sd => {
      const x = cx + sd * ex;
      c.fillStyle = sd < 0 ? '#f6efdc' : '#b9b2cf'; c.beginPath(); c.moveTo(x - 11, ey); c.quadraticCurveTo(x, ey - 7, x + 11, ey); c.quadraticCurveTo(x, ey + 5, x - 11, ey); c.fill();
      A.circ(c, x + 1, ey - 0.5, 3.6, dead ? '#777' : r.pick(['#2a1a10', '#1f3a5a', '#2d4a2a', '#3a2a1a']));
      c.strokeStyle = '#0b0718'; c.lineWidth = f ? 3 : 2.4; c.beginPath(); c.moveTo(x - 12, ey + (f ? -1 : 0)); c.quadraticCurveTo(x, ey - 8, x + 12, ey - (f ? 2 : 0)); c.stroke();
      c.strokeStyle = A.mix(hair[0], '#0b0718', 0.35); c.lineWidth = f ? 2.6 : 4.6; c.beginPath(); c.moveTo(x - sd * 13, ey - 13 - tilt * 0.4 + (sd * 0)); c.lineTo(x + sd * 12, ey - 15 + tilt); c.stroke();
    });
    c.strokeStyle = A.rgba('#1b0f4a', 0.75); c.lineWidth = 2.2; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(cx + 3, 120); c.lineTo(cx + (f ? 6 : 9), 146); c.lineTo(cx - 3, 149); c.stroke();
    const my = 163;
    if (f) {
      c.fillStyle = r.pick(['#b3122e', '#8e1b2e', '#c2356f']);
      c.beginPath(); c.moveTo(cx - 13, my); c.quadraticCurveTo(cx - 5, my - 6, cx, my - 3); c.quadraticCurveTo(cx + 5, my - 6, cx + 13, my); c.quadraticCurveTo(cx, my + 9, cx - 13, my); c.fill();
      A.line(c, cx - 12, my, cx + 12, my, 'rgba(40,0,10,.6)', 1);
    } else {
      c.strokeStyle = A.mix(skin, '#3a0a18', 0.7); c.lineWidth = 2.6; c.beginPath(); c.moveTo(cx - 12, my + (p.pers === 'suave' ? 1 : 0)); c.quadraticCurveTo(cx, my + (p.pers === 'hostile' ? -3 : 2), cx + 12, my - (p.pers === 'suave' ? 3 : 0)); c.stroke();
      const fh = r();
      if (fh < 0.34) { c.fillStyle = A.mix(hair[0], '#0b0718', 0.25); c.beginPath(); c.moveTo(cx - 14, my - 5); c.quadraticCurveTo(cx, my - 13, cx + 14, my - 5); c.quadraticCurveTo(cx, my - 8, cx - 14, my - 5); c.fill(); }
      else if (fh < 0.46) { c.fillStyle = A.rgba('#0b0718', 0.28); A.poly(c, [cx - hw * jaw, 150, cx + hw * jaw, 150, cx + chin, chinY, cx - chin, chinY], A.mix(hair[0], skin, 0.45)); c.strokeStyle = A.mix(skin, '#3a0a18', 0.7); c.beginPath(); c.moveTo(cx - 11, my); c.lineTo(cx + 11, my); c.stroke(); }
    }
    if (dead) { c.fillStyle = 'rgba(30,40,90,.35)'; c.fill(face); }
    /* hair on top */
    c.fillStyle = hair[0];
    const top = new Path2D();
    if (f) {
      if (style === 0) { top.moveTo(cx - hw - 3, 108); top.quadraticCurveTo(cx - hw - 6, 44, cx, 44); top.quadraticCurveTo(cx + hw + 6, 44, cx + hw + 3, 108); top.lineTo(cx + hw - 4, 92); top.quadraticCurveTo(cx, 78, cx - hw + 4, 92); top.closePath(); }
      else if (style === 1) { top.moveTo(cx - hw - 4, 150); top.quadraticCurveTo(cx - hw - 14, 120, cx - hw - 4, 100); top.quadraticCurveTo(cx - hw - 4, 44, cx, 44); top.quadraticCurveTo(cx + hw + 4, 44, cx + hw + 4, 100); top.quadraticCurveTo(cx + hw + 14, 120, cx + hw + 4, 150); top.quadraticCurveTo(cx + hw - 6, 120, cx + hw - 2, 96); top.quadraticCurveTo(cx + 10, 62, cx - 14, 74); top.quadraticCurveTo(cx - hw + 2, 84, cx - hw + 2, 100); top.quadraticCurveTo(cx - hw + 8, 124, cx - hw - 4, 150); top.closePath(); }
      else if (style === 2) { top.moveTo(cx - hw - 2, 104); top.quadraticCurveTo(cx - hw - 4, 46, cx, 46); top.quadraticCurveTo(cx + hw + 4, 46, cx + hw + 2, 104); top.quadraticCurveTo(cx + hw - 6, 74, cx, 70); top.quadraticCurveTo(cx - hw + 6, 74, cx - hw - 2, 104); top.closePath(); A.circ(c, cx + 6, 36, 20, hair[0]); }
      else { top.moveTo(cx - hw - 6, 120); top.quadraticCurveTo(cx - hw - 8, 44, cx, 44); top.quadraticCurveTo(cx + hw + 8, 44, cx + hw + 6, 120); top.quadraticCurveTo(cx + hw - 2, 84, cx + 12, 70); top.quadraticCurveTo(cx - 20, 64, cx - hw + 2, 100); top.closePath(); }
    } else {
      if (style === 0) { top.moveTo(cx - hw - 2, 100); top.quadraticCurveTo(cx - hw - 4, 46, cx, 46); top.quadraticCurveTo(cx + hw + 4, 46, cx + hw + 2, 100); top.lineTo(cx + hw - 5, 84); top.quadraticCurveTo(cx + 12, 66, cx, 74); top.quadraticCurveTo(cx - 12, 66, cx - hw + 5, 84); top.closePath(); }
      else if (style === 1) { top.moveTo(cx - hw - 2, 102); top.quadraticCurveTo(cx - hw - 6, 40, cx + 6, 42); top.quadraticCurveTo(cx + hw + 8, 44, cx + hw + 2, 102); top.lineTo(cx + hw - 4, 82); top.quadraticCurveTo(cx + 6, 60, cx - 20, 80); top.lineTo(cx - hw + 4, 88); top.closePath(); }
      else if (style === 2) { top.moveTo(cx - hw - 2, 112); top.quadraticCurveTo(cx - hw - 5, 76, cx - hw + 8, 68); top.lineTo(cx - hw + 5, 100); top.closePath(); top.moveTo(cx + hw + 2, 112); top.quadraticCurveTo(cx + hw + 5, 76, cx + hw - 8, 68); top.lineTo(cx + hw - 5, 100); top.closePath(); }
      else { top.moveTo(cx - hw - 2, 100); top.quadraticCurveTo(cx - hw - 4, 50, cx, 48); top.quadraticCurveTo(cx + hw + 4, 50, cx + hw + 2, 100); top.quadraticCurveTo(cx + hw - 4, 76, cx, 76); top.quadraticCurveTo(cx - hw + 4, 76, cx - hw - 2, 100); top.closePath(); for (let i = 0; i < 9; i++) A.circ(c, cx - hw + 4 + i * (hw * 2 - 8) / 8, 56 + Math.abs(i - 4) * 3.4, 10, hair[0]); }
    }
    c.fill(top);
    c.strokeStyle = hair[1]; c.lineWidth = 2.4; c.globalAlpha = 0.8;
    c.beginPath(); c.moveTo(cx - hw + 6, 76); c.quadraticCurveTo(cx - 16, 50, cx + 8, 52); c.stroke();
    c.beginPath(); c.moveTo(cx - hw + 12, 84); c.quadraticCurveTo(cx - 12, 60, cx + 2, 60); c.stroke();
    c.globalAlpha = 1;
    if (hat) {
      const hc = r.pick(['#1a1630', '#3a2a22', '#3d3d4c']);
      c.fillStyle = hc; c.beginPath(); c.moveTo(cx - hw - 4, 70); c.quadraticCurveTo(cx - hw - 4, 14, cx - 18, 14); c.quadraticCurveTo(cx, 24, cx + 18, 14); c.quadraticCurveTo(cx + hw + 4, 14, cx + hw + 4, 70); c.closePath(); c.fill();
      c.fillStyle = A.mix(hc, '#000000', 0.5); c.fillRect(cx - hw - 4, 56, hw * 2 + 8, 14);
      c.save(); c.translate(cx, 72); c.rotate(-0.07); A.ell(c, 0, 0, hw + 36, 10, hc); c.strokeStyle = 'rgba(125,135,255,.7)'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(0, 0, hw + 36, 10, 0, -1, 0.5); c.stroke(); c.restore();
    }
    if (band) { c.fillStyle = '#d9b25f'; c.fillRect(cx - hw - 2, 78, hw * 2 + 4, 6); A.poly(c, [cx - hw + 10, 70, cx - hw + 17, 81, cx - hw + 10, 92, cx - hw + 3, 81], '#7fe0d0', '#f0d58a', 1.2); }
    if (f && r.chance(0.6)) { [-1, 1].forEach(sd => { A.line(c, cx + sd * (hw + 2), 136, cx + sd * (hw + 2), 150, '#d9b25f', 1.4); A.poly(c, [cx + sd * (hw + 2), 150, cx + sd * (hw + 2) + 4, 157, cx + sd * (hw + 2), 164, cx + sd * (hw + 2) - 4, 157], sd < 0 ? '#f7f0dc' : '#9a94b0'); }); }
    const gl = r();
    if (gl < 0.16) { c.strokeStyle = '#d9b25f'; c.lineWidth = 2; A.circ(c, cx - ex, ey, 15, 'rgba(160,200,255,.12)', '#d9b25f', 2); A.circ(c, cx + ex, ey, 15, 'rgba(160,200,255,.08)', '#d9b25f', 2); A.line(c, cx - ex + 15, ey, cx + ex - 15, ey, '#d9b25f', 2); }
    else if (gl < 0.22 && !f) { A.circ(c, cx + ex, ey, 15, 'rgba(160,200,255,.14)', '#d9b25f', 2.2); c.strokeStyle = '#d9b25f'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx + ex + 14, ey + 6); c.quadraticCurveTo(cx + ex + 30, ey + 60, cx + ex + 10, ey + 100); c.stroke(); }
    if (r.chance(0.16)) A.circ(c, cx - 22, 154, 1.8, '#1a0a10');
    /* what they smoke, in plain sight */
    const sm = p.traits.smoke;
    if (!dead && sm && sm !== 'nothing') {
      const bx = cx + 10, by = my + 1;
      if (sm.indexOf('cigar') > -1 && sm.indexOf('cigarette') < 0) { c.save(); c.translate(bx, by); c.rotate(0.22); A.rect(c, 0, -4.5, 46, 9, '#5a3418'); A.rect(c, 10, -4.5, 5, 9, '#d9b25f'); A.rect(c, 44, -4.5, 5, 9, '#ff7a2a'); c.restore(); A.glow(c, bx + 46, by + 10, 18, '#ff7a2a', 0.8); }
      else if (sm.indexOf('pipe') > -1) { c.strokeStyle = '#3a2010'; c.lineWidth = 5; c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(bx + 22, by + 4, bx + 34, by + 22); c.stroke(); c.fillStyle = '#4a2a14'; c.beginPath(); c.moveTo(bx + 24, by + 14); c.lineTo(bx + 46, by + 14); c.lineTo(bx + 43, by + 36); c.lineTo(bx + 28, by + 36); c.closePath(); c.fill(); A.glow(c, bx + 35, by + 14, 14, '#ff7a2a', 0.6); }
      else { c.save(); c.translate(bx, by); c.rotate(0.16); A.rect(c, 0, -2, 38, 4, '#f7f0dc'); A.rect(c, 0, -2, 9, 4, '#d9b25f'); A.rect(c, 36, -2, 4, 4, '#ff7a2a'); c.restore(); A.glow(c, bx + 38, by + 6, 14, '#ff7a2a', 0.8); }
      A.smoke(c, bx + 42, by + 2, p.lookSeed % 7, 'rgba(200,200,255,.5)', 2);
    }
    /* vignette */
    c.fillStyle = A.rg(c, cx, 140, 90, 230, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(3,2,14,.7)']]); c.fillRect(0, 0, W, H);
    return cv.c;
  };

  /* anonymous staff witness */
  A.staffPortrait = function (seed) {
    const W = 240, H = 300, cv = A.canvas(W, H, 2), c = cv.x, r = G.rng(seed), cx = 120;
    c.fillStyle = A.lg(c, 0, 0, 0, H, [[0, '#1c1a40'], [1, '#07051a']]); c.fillRect(0, 0, W, H);
    A.sunburst(c, cx, 150, 30, 330, 28, 0, TAU, 'rgba(217,178,95,.10)');
    A.glow(c, 190, 70, 190, '#6a7cff', 0.2);
    c.fillStyle = '#05041a';
    c.beginPath(); c.moveTo(0, 300); c.lineTo(14, 246); c.quadraticCurveTo(24, 220, 84, 206); c.lineTo(156, 206); c.quadraticCurveTo(216, 220, 226, 246); c.lineTo(240, 300); c.closePath(); c.fill();
    c.fillRect(cx - 17, 168, 34, 48);
    c.beginPath(); c.moveTo(cx - 46, 100); c.quadraticCurveTo(cx - 46, 54, cx, 54); c.quadraticCurveTo(cx + 46, 54, cx + 46, 100); c.lineTo(cx + 40, 152); c.lineTo(cx + 20, 186); c.lineTo(cx - 20, 186); c.lineTo(cx - 40, 152); c.closePath(); c.fill();
    if (r.chance(0.5)) { c.fillRect(cx - 50, 60, 100, 20); A.ell(c, cx, 62, 46, 14, '#05041a'); A.rect(c, cx - 60, 78, 78, 6, '#05041a'); }
    c.strokeStyle = 'rgba(125,135,255,.85)'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(cx + 46, 96); c.lineTo(cx + 40, 152); c.lineTo(cx + 20, 186); c.stroke();
    c.beginPath(); c.moveTo(156, 206); c.quadraticCurveTo(216, 220, 226, 246); c.stroke();
    A.poly(c, [cx - 6, 212, cx + 6, 212, cx + 3, 226, cx - 3, 226], '#d9b25f');
    c.fillStyle = A.rg(c, cx, 140, 90, 230, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(3,2,14,.7)']]); c.fillRect(0, 0, W, H);
    return cv.c;
  };

  /* ---------------- line icons ---------------- */
  const IC = {
    doc: 'M6 3h9l4 4v14H6z M15 3v4h4 M9 12h7 M9 16h7',
    photo: 'M3 6h18v13H3z M3 16l5-5 4 4 3-2 6 4 M8 9.5a1 1 0 1 0 .01 0',
    news: 'M4 5h13v14H4z M17 8h3v11h-3 M7 9h7 M7 12h7 M7 15h4',
    ring: 'M12 9a6 6 0 1 0 .01 0 M9.5 9.5L12 4l2.5 5.5',
    hair: 'M5 20c3-6 2-10 6-13s7-1 8-4',
    hand: 'M8 21v-6l-2.5-4 1.6-1 2.4 3V5a1.2 1.2 0 0 1 2.4 0v5 M11.9 4.6a1.2 1.2 0 0 1 2.4 0V10 M14.3 5.8a1.2 1.2 0 0 1 2.4 0V13c0 4-1.5 8-1.5 8',
    foot: 'M9 3c3 0 4 3 4 6s-1 5-1 7 1 5-2 5-3-3-3-5 0-4-1-7 0-6 3-6z M16.5 5a1 1 0 1 0 .01 0 M18 8.5a1 1 0 1 0 .01 0',
    smoke: 'M3 16h13v3H3z M18.5 16v3 M21 16v3 M16 12c0-2 3-2 3-4s-2-2-2-4',
    scent: 'M9 9h6v3l2 2v7H7v-7l2-2z M10 9V6h4v3 M10 6V4h4 M15 4h3',
    thread: 'M4 6c4-3 6 3 10 0s4 3 6 0 M4 12c4-3 6 3 10 0s4 3 6 0 M4 18c4-3 6 3 10 0s4 3 6 0',
    print: 'M5 15v-4a7 7 0 0 1 14 0v6 M8.5 18v-7a3.5 3.5 0 0 1 7 0v9 M12 11v9',
    body: 'M12 3a2.5 2.5 0 1 0 .01 0 M5 10l7-1 7 1 M12 9v7 M12 16l-4 5 M12 16l4 5',
    blunt: 'M5 21h9 M9.5 21v-5 M6.5 16h6l1-4-2-3 1-3-2-2H9L7.5 7l1 2-2 3z',
    blade: 'M4 20l4-4 M6 14l4 4 M8 16L19 3h2v2L10 18',
    gun: 'M3 8h14v3h-6l-1 3H7l-1 6H3l1-9z M17 8h4v2h-4',
    cord: 'M4 6c8 0 8 6 0 6s8 6 16 0 M20 12c-8 0-8-6 0-6',
    vial: 'M9 3h6 M10 3v6L6 19a1.5 1.5 0 0 0 1.4 2h9.2a1.5 1.5 0 0 0 1.4-2L14 9V3 M8 15h8',
    talk: 'M4 5h16v11H10l-4 4v-4H4z M8 9h8 M8 12h5',
    car: 'M3 15l2-5h10l4 5h2v3H3z M7 18.5a1.5 1.5 0 1 0 .01 0 M17 18.5a1.5 1.5 0 1 0 .01 0',
    clock: 'M12 4a8 8 0 1 0 .01 0 M12 8v4l3 2',
    book: 'M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z M12 6v14',
    map: 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z M9 4v14 M15 6v14',
    lock: 'M7 11V8a5 5 0 0 1 10 0v3 M5 11h14v10H5z M12 15v3',
    star: 'M12 3l2.7 5.8 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3.1 1.2-6.2L3 9.6l6.3-.8z',
    gavel: 'M13 4l6 6 M10 7l6 6 M11.5 5.5l-6 6 6 6 6-6 M8 15l-5 5 M14 21h7',
    gear: 'M12 8.5a3.5 3.5 0 1 0 .01 0 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M19 5l-2 2 M7 17l-2 2',
    bulb: 'M9 17h6 M10 21h4 M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z',
    eye: 'M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z M12 9.5a2.5 2.5 0 1 0 .01 0',
    trophy: 'M8 4h8v5a4 4 0 0 1-8 0z M8 5H5c0 3 1 4 3 4 M16 5h3c0 3-1 4-3 4 M12 13v4 M8 20h8 M9 17h6',
    cash: 'M3 7h18v10H3z M12 9.5a2.5 2.5 0 1 0 .01 0 M6 10v4 M18 10v4',
    x: 'M6 6l12 12 M18 6L6 18', check: 'M4 12l5 5L20 6',
    play: 'M7 4l12 8-12 8z', sun: 'M12 8a4 4 0 1 0 .01 0 M12 2v3 M12 19v3 M2 12h3 M19 12h3'
  };
  G.icon = function (n, sz) {
    return `<svg class="ic" viewBox="0 0 24 24" width="${sz || 22}" height="${sz || 22}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${IC[n] || IC.doc}"/></svg>`;
  };
})();
