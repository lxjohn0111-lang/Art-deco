'use strict';
/* GILDED MIDNIGHT — the ten locations of Gilt City, painted procedurally on canvas */
(function () {
  const G = window.G, A = G.A;
  const { rect, poly, circ, ell, line, glow, cone, lg, rg, sunburst, zig, fan, chevrons, frame, mix, rgba } = A;
  const TAU = Math.PI * 2, W = 1280, H = 720;
  const GOLD = '#d9b25f', GOLD2 = '#f4dd9a', GOLDD = '#8a6a2a';
  const goldG = (c, x, y, w, h) => lg(c, x, y, x + w, y + h, [[0, '#f4dd9a'], [0.45, '#b98d3a'], [1, '#ecc873']]);

  /* ---------- silhouettes & props ---------- */
  function man(c, x, y, s, col, rim) {
    c.save(); c.translate(x, y); c.scale(s, s);
    poly(c, [-15, -80, 15, -80, 17, -20, -17, -20], col);
    c.fillRect(-12, -22, 10, 22); c.fillRect(2, -22, 10, 22);
    ell(c, 0, -80, 16, 6, col); circ(c, 0, -92, 7.5, col);
    ell(c, 0, -97, 13.5, 3, col); poly(c, [-7.5, -98, -6.5, -108, 6.5, -108, 7.5, -98], col);
    if (rim) {
      c.strokeStyle = rim; c.lineWidth = 1.3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(15, -82); c.lineTo(17, -20); c.stroke();
      c.beginPath(); c.ellipse(0, -97, 13.5, 3, 0, -1.2, 0.7); c.stroke();
      c.beginPath(); c.arc(0, -92, 7.5, -0.6, 1.2); c.stroke();
    }
    c.restore();
  }
  function woman(c, x, y, s, col, rim) {
    c.save(); c.translate(x, y); c.scale(s, s);
    poly(c, [-10, -78, 10, -78, 6, -52, 15, 0, -15, 0, -6, -52], col);
    ell(c, 0, -78, 11, 4, col); c.fillStyle = col; c.fillRect(-2.5, -86, 5, 8);
    circ(c, 0, -91, 7, col); ell(c, 0, -93, 9, 6.5, col);
    if (rim) {
      c.strokeStyle = rim; c.lineWidth = 1.3;
      c.beginPath(); c.moveTo(10, -78); c.lineTo(6, -52); c.lineTo(15, 0); c.stroke();
      c.beginPath(); c.arc(0, -91, 8, -0.8, 1.1); c.stroke();
    }
    c.restore();
  }
  function bust(c, x, y, s, col, rim, hat) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = col;
    c.beginPath(); c.moveTo(-40, 60); c.lineTo(-38, 12); c.quadraticCurveTo(-34, -6, -10, -10); c.lineTo(10, -10); c.quadraticCurveTo(34, -6, 38, 12); c.lineTo(40, 60); c.closePath(); c.fill();
    circ(c, 0, -26, 15, col);
    if (hat === 1) { ell(c, 0, -34, 27, 5, col); poly(c, [-14, -35, -12, -52, 12, -52, 14, -35], col); }
    if (hat === 2) { ell(c, 0, -30, 18, 14, col); }
    if (rim) {
      c.strokeStyle = rim; c.lineWidth = 2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(10, -10); c.quadraticCurveTo(34, -6, 38, 12); c.lineTo(39, 40); c.stroke();
      c.beginPath(); c.arc(0, -26, hat === 2 ? 17 : 15, -1, 0.9); c.stroke();
    }
    c.restore();
  }
  function saxman(c, x, y, s, col, rim) {
    man(c, x, y, s, col, rim);
    c.save(); c.translate(x, y); c.scale(s, s);
    c.strokeStyle = '#e8c468'; c.lineWidth = 3.4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(5, -86); c.lineTo(11, -60); c.quadraticCurveTo(14, -40, 24, -42); c.quadraticCurveTo(30, -44, 28, -54); c.stroke();
    ell(c, 28, -56, 6, 3.5, '#f4dd9a');
    c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.moveTo(-13, -76); c.lineTo(2, -60); c.lineTo(12, -56); c.stroke();
    c.beginPath(); c.moveTo(13, -76); c.lineTo(18, -64); c.lineTo(13, -50); c.stroke();
    c.restore();
  }
  function tableLamp(c, x, y, s, col) {
    col = col || '#ffb45a';
    rect(c, x - 2 * s, y - 20 * s, 4 * s, 20 * s, GOLDD); ell(c, x, y, 9 * s, 2.5 * s, GOLD);
    poly(c, [x - 8 * s, y - 34 * s, x + 8 * s, y - 34 * s, x + 14 * s, y - 18 * s, x - 14 * s, y - 18 * s], col);
    glow(c, x, y - 24 * s, 70 * s, col, 0.5);
  }
  function pendant(c, x, y, s, col) {
    col = col || '#ffc56a';
    line(c, x, 0, x, y, GOLDD, 2);
    for (let i = 0; i < 4; i++) {
      const w = (26 - i * 5) * s, yy = y + i * 15 * s;
      rect(c, x - w, yy, w * 2, 12 * s, lg(c, x - w, 0, x + w, 0, [[0, '#a66a1c'], [0.5, col], [1, '#a66a1c']]));
      rect(c, x - w, yy + 12 * s, w * 2, 2 * s, GOLD);
    }
    glow(c, x, y + 30 * s, 150 * s, col, 0.42);
  }
  function chandelier(c, x, y, s) {
    line(c, x, 0, x, y, GOLD, 3);
    for (let i = 0; i < 4; i++) {
      const w = (120 - i * 26) * s, yy = y + i * 22 * s;
      rect(c, x - w, yy, w * 2, 5 * s, goldG(c, x - w, yy, w * 2, 5));
      for (let k = -w + 6; k <= w - 6; k += 12 * s) rect(c, x + k - 2, yy + 5 * s, 4, 16 * s, 'rgba(255,236,170,.9)');
    }
    glow(c, x, y + 40 * s, 300 * s, '#ffd98a', 0.4);
  }
  function palm(c, x, y, s, col) {
    c.save(); c.translate(x, y); c.scale(s, s);
    poly(c, [-16, 0, 16, 0, 11, -30, -11, -30], col); rect(c, -18, -34, 36, 6, col);
    c.fillStyle = col;
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (i - 4) * 0.36, len = 104 - Math.abs(i - 4) * 7;
      const tx = Math.cos(a) * len, ty = -32 + Math.sin(a) * len * 0.72 + Math.abs(i - 4) * 9;
      const mx = Math.cos(a) * len * 0.5, my = -32 + Math.sin(a) * len * 0.95 - 6;
      const nx = -Math.sin(a) * 10, ny = Math.cos(a) * 10;
      c.beginPath(); c.moveTo(0, -32); c.quadraticCurveTo(mx - nx, my - ny, tx, ty); c.quadraticCurveTo(mx + nx, my + ny, 0, -32); c.fill();
    }
    c.restore();
  }
  function flatBurst(c, cx, cy, r0, r1, n, col, sy) { c.save(); c.translate(cx, cy); c.scale(1, sy); sunburst(c, 0, 0, r0, r1, n, 0, TAU, col); c.restore(); }
  function bottles(c, x, y, w, h, r, rows) {
    const rh = h / rows;
    for (let j = 0; j < rows; j++) {
      rect(c, x, y + j * rh, w, rh - 5, lg(c, 0, y + j * rh, 0, y + (j + 1) * rh, [[0, '#ffb44a'], [1, '#7a3a10']]));
      for (let bx = x + 6; bx < x + w - 8;) {
        const bw = r.f(6, 11), bh = r.f(rh * 0.45, rh * 0.8), col = r.pick(['#3a1408', '#5a2a0c', '#143a2a', '#2a0a14', '#1a1030']);
        rect(c, bx, y + (j + 1) * rh - 5 - bh, bw, bh, col); rect(c, bx + bw * 0.3, y + (j + 1) * rh - 5 - bh - 7, bw * 0.4, 8, col);
        rect(c, bx + 1, y + (j + 1) * rh - 5 - bh + 2, 1.5, bh - 4, 'rgba(255,220,150,.5)');
        bx += bw + r.f(2, 6);
      }
      rect(c, x, y + (j + 1) * rh - 5, w, 5, goldG(c, x, 0, w, 5));
    }
  }
  /* perspective checker floor between y0 (horizon side) and y1 */
  function checker(c, y0, y1, vx, vy, n, colA, colB) {
    const rows = 9;
    for (let j = 0; j < rows; j++) {
      const ta = Math.pow(j / rows, 1.7), tb = Math.pow((j + 1) / rows, 1.7);
      const ya = y0 + (y1 - y0) * ta, yb = y0 + (y1 - y0) * tb;
      for (let i = -n; i < n; i++) {
        const xa = k => vx + (i + k) * 190 * ((ya - vy) / (y1 - vy)), xb = k => vx + (i + k) * 190 * ((yb - vy) / (y1 - vy));
        poly(c, [xa(0), ya, xa(1), ya, xb(1), yb, xb(0), yb], (i + j) % 2 === 0 ? colA : colB);
      }
    }
  }
  function column(c, x, y0, y1, w, colL, colD) {
    rect(c, x - w / 2, y0, w, y1 - y0, lg(c, x - w / 2, 0, x + w / 2, 0, [[0, colL], [0.6, colD], [1, mix('#000000', colD.startsWith('#') ? colD : '#000000', 0.5)]]));
    for (let k = 1; k < 6; k++) rect(c, x - w / 2 + k * w / 6, y0, 1.5, y1 - y0, 'rgba(0,0,0,.28)');
    zig(c, x, y0 + 30, w + 34, 30, 3, GOLD); rect(c, x - w / 2 - 12, y1 - 16, w + 24, 16, GOLDD);
  }
  function crate(c, x, y, w, h, col) {
    rect(c, x, y, w, h, col); c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 3; c.strokeRect(x + 2, y + 2, w - 4, h - 4);
    line(c, x + 3, y + 3, x + w - 3, y + h - 3, 'rgba(0,0,0,.4)', 3); line(c, x + w - 3, y + 3, x + 3, y + h - 3, 'rgba(0,0,0,.4)', 3);
    rect(c, x, y, w, 2, 'rgba(140,150,255,.35)');
  }
  function neon(c, txt, x, y, size, col, vertical) {
    c.save(); c.font = `${size}px Limelight, serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.shadowColor = col; c.shadowBlur = 22; c.fillStyle = col;
    if (vertical) txt.split('').forEach((ch, i) => { c.fillText(ch, x, y + i * size * 1.02); c.fillText(ch, x, y + i * size * 1.02); });
    else { c.fillText(txt, x, y); c.fillText(txt, x, y); }
    c.shadowBlur = 0; c.fillStyle = '#fff'; c.globalAlpha = 0.75;
    if (vertical) txt.split('').forEach((ch, i) => c.fillText(ch, x, y + i * size * 1.02)); else c.fillText(txt, x, y);
    c.restore();
  }
  function miniSky(c, r, x, y, w, h, tower) {
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    rect(c, x, y, w, h, lg(c, 0, y, 0, y + h, [[0, '#04041a'], [0.55, '#221764'], [1, '#7a3596']]));
    for (let i = 0; i < 70; i++) { c.globalAlpha = r.f(0.2, 0.9); rect(c, x + r.f(0, w), y + r.f(0, h * 0.6), 1.3, 1.3, '#dfe2ff'); }
    c.globalAlpha = 1;
    for (let bx = x - 10; bx < x + w;) { const bw = r.f(22, 46); A.building(c, r, bx, y + h, bw, r.f(h * 0.2, h * 0.62), { wall: '#1a145a', pier: '#241c74', lit: 0.4, ws: 2, gap: 3, wins: ['#ffd95a', '#b9a6ff'] }); bx += bw * 0.9; }
    if (tower) A.heroTower(c, r, x + w * tower, y + h + 30, h / 720);
    for (let bx = x - 10; bx < x + w;) { const bw = r.f(40, 80); A.building(c, r, bx, y + h, bw, r.f(h * 0.12, h * 0.36), { wall: '#0a0726', pier: '#120d3c', lit: 0.5, ws: 3, gap: 4, rim: 'rgba(110,110,255,.5)' }); bx += bw * 1.2; }
    c.restore();
  }
  function bricks(c, x, y, w, h, col) {
    c.strokeStyle = col; c.lineWidth = 1;
    for (let j = 0; j * 14 < h; j++) {
      line(c, x, y + j * 14, x + w, y + j * 14, col, 1);
      for (let i = (j % 2) * 18; i < w; i += 36) line(c, x + i, y + j * 14, x + i, y + j * 14 + 14, col, 1);
    }
  }

  /* ================= THE LOCATIONS ================= */
  const L = G.LOCS = {};

  L.club = {
    name: 'the Blue Orchid Club', short: 'The Blue Orchid', staff: 'Bartender', tag: 'Jazz club · smoke and brass', mood: 'warm',
    body: [640, 566], spots: [
      { n: 'Grand Piano', x: 250, y: 420 }, { n: 'Stage Curtain', x: 560, y: 240 }, { n: 'Bar Shelves', x: 1040, y: 250 }, { n: 'Bar Counter', x: 880, y: 468 },
      { n: 'Corner Booth', x: 170, y: 630 }, { n: 'Deco Mural', x: 742, y: 300 }, { n: 'Candle Table', x: 1050, y: 640 }],
    draw(c, r) {
      rect(c, 0, 0, W, H, lg(c, 0, 0, 0, H, [[0, '#12060c'], [0.6, '#33121a'], [1, '#170709']]));
      /* stage + curtain */
      for (let x = 96; x < 664; x += 20) rect(c, x, 50, 21, 430, lg(c, x, 0, x + 20, 0, [[0, '#5a0d18'], [0.5, '#c23a2e'], [1, '#6d111c']]));
      rect(c, 96, 50, 568, 430, lg(c, 0, 50, 0, 480, [[0, 'rgba(10,0,6,.75)'], [0.5, 'rgba(10,0,6,0)'], [1, 'rgba(10,0,6,.55)']]));
      for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(132 + i * 71, 50, 38, 0, Math.PI); c.fillStyle = i % 2 ? '#8e1b2e' : '#a8262c'; c.fill(); rect(c, 130 + i * 71, 86, 4, 14, GOLD); }
      rect(c, 70, 30, 620, 24, goldG(c, 70, 30, 620, 24)); zig(c, 380, 30, 300, 26, 3, GOLD);
      rect(c, 66, 30, 30, 470, lg(c, 66, 0, 96, 0, [[0, '#f4dd9a'], [1, '#7a5a20']])); rect(c, 664, 30, 30, 470, lg(c, 664, 0, 694, 0, [[0, '#f4dd9a'], [1, '#7a5a20']]));
      cone(c, 330, -40, Math.PI / 2 - 0.12, 0.3, 620, '#ffd08a', 0.5);
      poly(c, [40, 478, 720, 478, 760, 528, 0, 528], lg(c, 0, 478, 0, 528, [[0, '#6a3a1a'], [1, '#2a1208']]));
      rect(c, 0, 528, 800, 14, '#1a0a06'); rect(c, 0, 526, 780, 3, GOLD);
      /* piano & players */
      const ink = '#0a0408';
      c.fillStyle = ink; c.beginPath(); c.moveTo(150, 420); c.lineTo(350, 420); c.quadraticCurveTo(372, 420, 370, 440); c.lineTo(366, 452); c.lineTo(150, 452); c.closePath(); c.fill();
      poly(c, [176, 420, 346, 420, 360, 340, 300, 356], ink); line(c, 300, 418, 330, 352, ink, 3);
      rect(c, 160, 452, 8, 30, ink); rect(c, 350, 452, 8, 30, ink); rect(c, 250, 452, 6, 30, ink);
      rect(c, 150, 426, 60, 5, '#efe6cf'); rect(c, 112, 462, 34, 6, ink); rect(c, 126, 466, 5, 16, ink);
      c.save(); c.translate(128, 462); c.scale(1.5, 1.5); poly(c, [-10, -40, 10, -40, 12, 0, -12, 0], ink); circ(c, 2, -48, 7, ink); c.restore();
      line(c, 150, 430, 180, 428, ink, 5);
      c.strokeStyle = 'rgba(255,200,130,.7)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(346, 420); c.lineTo(360, 340); c.stroke();
      saxman(c, 470, 482, 1.75, ink, 'rgba(255,205,140,.9)');
      line(c, 560, 482, 560, 380, ink, 3); circ(c, 560, 376, 7, ink, GOLD, 1.5); ell(c, 560, 482, 14, 3, ink);
      /* mural panel */
      rect(c, 706, 120, 76, 360, '#0c2a30'); c.strokeStyle = GOLD; c.lineWidth = 3; c.strokeRect(706, 120, 76, 360);
      c.save(); c.beginPath(); c.rect(708, 122, 72, 356); c.clip(); sunburst(c, 744, 300, 8, 190, 18, Math.PI, TAU, 'rgba(217,178,95,.55)'); c.restore(); circ(c, 744, 300, 16, GOLD2);
      chevrons(c, 716, 320, 56, 140, 7, '#7fe0d0', 2);
      /* bar */
      rect(c, 820, 110, 440, 320, '#1c0a08'); zig(c, 1040, 112, 460, 44, 4, GOLDD); zig(c, 1040, 108, 440, 40, 4, GOLD);
      bottles(c, 842, 150, 396, 240, r, 3);
      glow(c, 1040, 270, 300, '#ffab4a', 0.3);
      rect(c, 820, 110, 22, 320, goldG(c, 820, 0, 22, 320)); rect(c, 1238, 110, 22, 320, goldG(c, 1238, 0, 22, 320));
      man(c, 1010, 520, 1.5, ink, 'rgba(255,190,110,.85)'); man(c, 940, 536, 1.45, ink, 'rgba(255,190,110,.7)'); woman(c, 1150, 540, 1.5, ink, 'rgba(255,190,110,.7)');
      poly(c, [790, 440, 1280, 440, 1280, 540, 800, 540], lg(c, 0, 440, 0, 540, [[0, '#5a2a14'], [0.15, '#2a1008'], [1, '#150604']]));
      rect(c, 790, 436, 490, 7, goldG(c, 790, 0, 490, 7));
      for (let x = 820; x < 1280; x += 46) { rect(c, x, 452, 30, 80, 'rgba(217,178,95,.12)'); chevrons(c, x + 3, 460, 24, 60, 4, 'rgba(217,178,95,.4)', 1.5); }
      for (let x = 850; x < 1280; x += 110) { rect(c, x - 3, 540, 6, 46, GOLDD); ell(c, x, 540, 20, 5, '#7a1420'); ell(c, x, 588, 14, 3, GOLDD); }
      pendant(c, 760, 60, 1); pendant(c, 900, 40, 0.9); pendant(c, 1150, 50, 1);
      /* floor */
      rect(c, 0, 540, W, 180, lg(c, 0, 540, 0, 720, [[0, '#200b0e'], [1, '#090305']]));
      for (let i = 0; i < 14; i++) rect(c, r.f(0, W), 546, r.f(8, 40), 170, 'rgba(255,170,90,.035)');
      /* tables & crowd */
      [[170, 650, 1.5], [1050, 660, 1.5], [600, 640, 1.15], [400, 690, 1.3], [830, 690, 1.25]].forEach(([x, y, s], i) => {
        ell(c, x, y, 78 * s, 18 * s, '#7a1420'); ell(c, x, y - 3, 78 * s, 18 * s, '#a52433'); ell(c, x, y - 3, 70 * s, 14 * s, 'rgba(255,200,150,.12)');
        tableLamp(c, x, y - 6, s * 0.9, i % 2 ? '#ff9a3c' : '#ffb45a');
        poly(c, [x + 30 * s, y - 20 * s, x + 46 * s, y - 20 * s, x + 38 * s, y - 10 * s], 'rgba(255,240,220,.7)'); line(c, x + 38 * s, y - 10 * s, x + 38 * s, y - 2 * s, 'rgba(255,240,220,.7)', 1.5);
      });
      bust(c, 80, 700, 2.6, '#050205', 'rgba(255,170,90,.8)', 1); bust(c, 300, 720, 2.2, '#050205', 'rgba(255,170,90,.7)', 2);
      bust(c, 960, 720, 2.3, '#050205', 'rgba(255,170,90,.7)', 2); bust(c, 1190, 716, 2.6, '#050205', 'rgba(255,170,90,.8)', 0);
      bust(c, 520, 690, 1.5, '#050205', 'rgba(255,170,90,.6)', 0); bust(c, 690, 692, 1.5, '#050205', 'rgba(255,170,90,.6)', 2);
      c.save(); c.translate(-30, 300); c.rotate(0.5); palm(c, 0, 0, 2.2, '#060306'); c.restore();
    },
    fx(c, t) {
      cone(c, 330, -40, Math.PI / 2 - 0.12 + Math.sin(t * 0.4) * 0.015, 0.3, 620, '#ffd08a', 0.1 + 0.03 * Math.sin(t * 3.1));
      A.smoke(c, 250, 600, t, 'rgba(255,220,190,.35)', 3); A.smoke(c, 1090, 610, t + 2, 'rgba(255,220,190,.3)', 2);
      A.motes(c, t, '#ffc98a', 0.4);
    }
  };

  L.penthouse = {
    name: 'the Zenith Penthouse', short: 'Zenith Penthouse', staff: 'Butler', tag: 'Sixty floors above the law', mood: 'cool',
    body: [640, 626], spots: [
      { n: 'Fireplace', x: 190, y: 420 }, { n: 'Sunburst Mirror', x: 190, y: 190 }, { n: 'Velvet Chaise', x: 450, y: 570 }, { n: 'Bar Cart', x: 1100, y: 470 },
      { n: 'Wall Safe', x: 1080, y: 226, kind: 'safe' }, { n: 'Writing Desk', x: 900, y: 600 }, { n: 'Window Ledge', x: 640, y: 440 }],
    draw(c, r) {
      rect(c, 0, 0, W, H, lg(c, 0, 0, 0, H, [[0, '#0d0a2c'], [0.65, '#241452'], [1, '#0c0824']]));
      for (let x = 20; x < W; x += 84) { rect(c, x, 0, 2, 500, 'rgba(217,178,95,.14)'); fan(c, x + 42, 500, 40, 'rgba(217,178,95,.07)', 'rgba(0,0,0,0)', 4); }
      /* arched window */
      c.save(); c.beginPath(); c.moveTo(380, 470); c.lineTo(380, 250); c.arc(640, 250, 260, Math.PI, TAU); c.lineTo(900, 470); c.closePath(); c.clip();
      miniSky(c, r, 380, -10, 520, 480, 0.6); c.restore();
      c.strokeStyle = goldG(c, 380, 0, 520, 470); c.lineWidth = 9; c.beginPath(); c.moveTo(380, 470); c.lineTo(380, 250); c.arc(640, 250, 260, Math.PI, TAU); c.lineTo(900, 470); c.stroke();
      c.lineWidth = 3; for (let i = 1; i < 8; i++) { const a = Math.PI + i * Math.PI / 8; line(c, 640, 250, 640 + Math.cos(a) * 260, 250 + Math.sin(a) * 260, GOLD, 3); }
      c.beginPath(); c.arc(640, 250, 90, Math.PI, TAU); c.stroke(); line(c, 380, 250, 900, 250, GOLD, 4);
      [466, 553, 640, 727, 814].forEach(x => line(c, x, 250, x, 470, GOLD, 3)); line(c, 380, 360, 900, 360, GOLD, 2);
      rect(c, 360, 466, 560, 16, goldG(c, 360, 0, 560, 16));
      glow(c, 640, 300, 420, '#6a4cff', 0.22);
      /* drapes */
      [[300, 1], [980, -1]].forEach(([x, d]) => { for (let i = 0; i < 5; i++) rect(c, x - 40 + i * 16 * d + (d < 0 ? 0 : 0), 20, 17, 470, lg(c, 0, 0, 16, 0, [[0, '#3a1466'], [1, '#5a2590']])); poly(c, [x - 46, 300, x + 46, 300, x + 30, 330, x - 30, 330], GOLD); });
      /* fireplace + mirror */
      rect(c, 70, 300, 250, 210, lg(c, 70, 0, 320, 0, [[0, '#3a3250'], [1, '#17122e']])); zig(c, 195, 300, 280, 36, 3, '#4a4268');
      rect(c, 120, 360, 150, 150, '#06040c');
      glow(c, 195, 480, 150, '#ff7a2a', 0.75); glow(c, 195, 500, 60, '#ffd08a', 0.8);
      for (let i = 0; i < 6; i++) poly(c, [140 + i * 20, 510, 150 + i * 20, 460 - r.f(0, 40), 162 + i * 20, 510], i % 2 ? '#ff9a3c' : '#ffd95a');
      rect(c, 120, 500, 150, 10, '#1a1420'); chevrons(c, 84, 380, 28, 110, 6, GOLD, 1.5); chevrons(c, 278, 380, 28, 110, 6, GOLD, 1.5);
      sunburst(c, 190, 190, 34, 92, 32, 0, TAU, GOLD); circ(c, 190, 190, 38, rg(c, 180, 180, 4, 40, [[0, '#cfd6ff'], [1, '#4a4a8a']]), GOLD2, 3);
      /* painting (safe) + bar cart */
      frame(c, 1010, 150, 140, 150, 8); c.save(); c.beginPath(); c.rect(1010, 150, 140, 150); c.clip(); sunburst(c, 1080, 300, 10, 200, 14, Math.PI, TAU, '#c2356f'); c.restore(); circ(c, 1080, 282, 26, '#f4dd9a'); rect(c, 1010, 282, 140, 18, '#1a1450');
      rect(c, 1040, 430, 120, 6, GOLD); rect(c, 1040, 490, 120, 6, GOLD); [1044, 1152].forEach(x => rect(c, x, 400, 4, 120, GOLD)); circ(c, 1052, 524, 10, null, GOLD, 3); circ(c, 1150, 524, 10, null, GOLD, 3);
      [[1060, '#b0542a'], [1086, '#c9a14a'], [1112, '#7a1420'], [1136, '#e8e0c8']].forEach(([x, col]) => { rect(c, x - 8, 400, 16, 30, rgba('#ffffff', 0.18)); rect(c, x - 7, 410, 14, 20, col); rect(c, x - 3, 390, 6, 12, 'rgba(255,255,255,.4)'); });
      chandelier(c, 640, 20, 0.8);
      /* floor + rug */
      rect(c, 0, 482, W, 238, lg(c, 0, 482, 0, 720, [[0, '#1c1340'], [1, '#07051a']]));
      rect(c, 0, 482, W, 5, '#3a2a70');
      ell(c, 640, 620, 430, 86, '#3a1040'); ell(c, 640, 620, 400, 76, '#5a1a52'); ell(c, 640, 620, 300, 54, null, GOLD, 3);
      flatBurst(c, 640, 620, 30, 380, 24, 'rgba(217,178,95,.22)', 0.19);
      c.save(); c.globalAlpha = 0.07; for (let i = 0; i < 5; i++) poly(c, [424 + i * 88, 486, 494 + i * 88, 486, 420 + i * 130 - 100, 720, 300 + i * 130 - 100, 720], '#8f8cff'); c.restore();
      /* chaise */
      c.fillStyle = lg(c, 300, 0, 620, 0, [[0, '#b02a3a'], [1, '#5a0e1c']]);
      c.beginPath(); c.moveTo(290, 600); c.lineTo(290, 520); c.quadraticCurveTo(300, 470, 350, 500); c.quadraticCurveTo(420, 540, 620, 545); c.lineTo(626, 600); c.closePath(); c.fill();
      rect(c, 280, 590, 356, 26, '#7a1420'); rect(c, 280, 588, 356, 4, GOLD); [296, 612].forEach(x => poly(c, [x - 6, 616, x + 6, 616, x + 3, 640, x - 3, 640], GOLD));
      for (let x = 330; x < 600; x += 44) circ(c, x, 566, 3, GOLDD);
      /* desk */
      poly(c, [760, 580, 1060, 580, 1090, 610, 730, 610], '#4a2a1a'); rect(c, 740, 610, 340, 14, '#2a160c'); rect(c, 740, 608, 340, 3, GOLD);
      rect(c, 756, 624, 60, 90, '#2a160c'); rect(c, 1004, 624, 60, 90, '#2a160c'); chevrons(c, 764, 634, 44, 70, 5, GOLDD, 1.5); chevrons(c, 1012, 634, 44, 70, 5, GOLDD, 1.5);
      tableLamp(c, 1010, 584, 1.3, '#7fe0d0'); rect(c, 850, 566, 50, 14, '#111'); rect(c, 862, 556, 26, 10, '#111'); poly(c, [790, 590, 840, 586, 846, 600, 796, 604], '#efe6cf');
      palm(c, 60, 700, 2.4, '#070418');
    },
    fx(c, t) {
      glow(c, 195, 470, 190 + Math.sin(t * 9) * 14 + Math.sin(t * 23) * 6, '#ff7a2a', 0.16 + 0.05 * Math.sin(t * 13));
      A.motes(c, t, '#cfc0ff', 0.3);
    }
  };

  L.alley = {
    name: 'Cutler\'s Alley', short: 'Cutler\'s Alley', staff: 'Night Watchman', tag: 'Where the neon doesn\'t reach', outdoor: true, mood: 'cold',
    body: [540, 622], spots: [
      { n: 'Trash Cans', x: 240, y: 590 }, { n: 'Fire Escape', x: 300, y: 300 }, { n: 'Stage Door', x: 1010, y: 430, kind: 'lock' }, { n: 'Stacked Crates', x: 1150, y: 620 },
      { n: 'Storm Drain', x: 664, y: 690 }, { n: 'Lamp Post', x: 836, y: 520 }, { n: 'Torn Posters', x: 450, y: 440 }],
    draw(c, r) {
      rect(c, 0, 0, W, H, '#05040f');
      miniSky(c, r, 480, 0, 320, 560, 0.5);
      rect(c, 480, 300, 320, 260, lg(c, 0, 300, 0, 560, [[0, 'rgba(90,50,160,0)'], [1, 'rgba(120,60,170,.75)']]));
      /* left wall */
      poly(c, [0, 0, 520, 0, 520, 560, 0, 720], lg(c, 0, 0, 520, 0, [[0, '#0a0920'], [1, '#15123a']]));
      c.save(); c.beginPath(); c.moveTo(0, 0); c.lineTo(520, 0); c.lineTo(520, 560); c.lineTo(0, 720); c.closePath(); c.clip(); bricks(c, 0, 0, 520, 720, 'rgba(90,90,190,.12)'); c.restore();
      [[60, 90], [200, 100], [340, 110], [60, 250], [340, 262]].forEach(([x, y], i) => { rect(c, x, y, 78, 110, i === 1 || i === 4 ? '#ffd95a' : '#07061a'); if (i === 1 || i === 4) { glow(c, x + 39, y + 55, 120, '#ffd95a', 0.3); rect(c, x, y + 50, 78, 4, '#3a2a10'); rect(c, x + 37, y, 4, 110, '#3a2a10'); } c.strokeStyle = '#26205a'; c.lineWidth = 4; c.strokeRect(x, y, 78, 110); });
      /* fire escape */
      c.strokeStyle = '#02020a'; c.lineWidth = 5;
      [[150, 220], [150, 380]].forEach(([x, y]) => { rect(c, x, y, 300, 8, '#02020a'); for (let k = 0; k <= 300; k += 20) line(c, x + k, y - 40, x + k, y, '#02020a', 2); line(c, x, y - 40, x + 300, y - 40, '#02020a', 4); line(c, x + 300, y, x + 200, y + 160, '#02020a', 5); line(c, x + 270, y, x + 170, y + 160, '#02020a', 2); });
      line(c, 350, 540, 350, 640, '#02020a', 4); line(c, 380, 540, 380, 640, '#02020a', 4); for (let y = 550; y < 640; y += 18) line(c, 350, y, 380, y, '#02020a', 3);
      c.strokeStyle = 'rgba(110,110,255,.5)'; c.lineWidth = 1.5; line(c, 150, 180, 450, 180, 'rgba(110,110,255,.5)', 1.5); line(c, 150, 340, 450, 340, 'rgba(110,110,255,.5)', 1.5);
      /* posters */
      [[400, 390, '#c2356f', -0.05], [462, 410, '#e8c468', 0.04], [416, 470, '#7fe0d0', 0.02]].forEach(([x, y, col, a]) => { c.save(); c.translate(x, y); c.rotate(a); rect(c, 0, 0, 58, 76, col); rect(c, 6, 8, 46, 26, 'rgba(0,0,0,.5)'); rect(c, 6, 44, 46, 5, 'rgba(0,0,0,.5)'); rect(c, 6, 54, 30, 5, 'rgba(0,0,0,.5)'); poly(c, [58, 0, 58, 22, 40, 0], '#15123a'); c.restore(); });
      /* right wall */
      poly(c, [1280, 0, 760, 0, 760, 560, 1280, 720], lg(c, 760, 0, 1280, 0, [[0, '#2a0f1e'], [1, '#12060e']]));
      c.save(); c.beginPath(); c.moveTo(1280, 0); c.lineTo(760, 0); c.lineTo(760, 560); c.lineTo(1280, 720); c.closePath(); c.clip(); bricks(c, 760, 0, 520, 720, 'rgba(255,110,150,.08)'); c.restore();
      rect(c, 940, 300, 140, 270, '#1a0a12'); rect(c, 950, 310, 120, 260, lg(c, 0, 310, 0, 570, [[0, '#4a1a26'], [1, '#1c0810']])); c.strokeStyle = GOLDD; c.lineWidth = 3; c.strokeRect(950, 310, 120, 260); rect(c, 966, 330, 88, 60, '#0a0408'); circ(c, 1056, 450, 5, GOLD);
      zig(c, 1010, 300, 170, 24, 3, '#3a1622');
      neon(c, 'JAZZ', 1180, 150, 62, '#ff3c8a', true);
      rect(c, 1146, 100, 6, 320, '#02020a'); rect(c, 1146, 100, 60, 5, '#02020a');
      glow(c, 1180, 250, 260, '#ff3c8a', 0.28);
      circ(c, 1010, 276, 12, '#ffd08a'); cone(c, 1010, 278, Math.PI / 2, 0.5, 330, '#ffb86a', 0.3); rect(c, 996, 258, 28, 8, '#02020a');
      /* ground */
      poly(c, [0, 720, 520, 560, 760, 560, 1280, 720], lg(c, 0, 560, 0, 720, [[0, '#191536'], [1, '#07061a']]));
      for (let j = 0; j < 9; j++) { const y = 566 + j * j * 2.2; line(c, 640 - (y - 500) * 4, y, 640 + (y - 500) * 4, y, 'rgba(130,130,255,.1)', 1); }
      [[620, 610, 150, 14, '#ff3c8a'], [900, 660, 180, 18, '#ffb86a'], [380, 680, 150, 14, '#6a6cff'], [760, 590, 70, 7, '#ff3c8a']].forEach(([x, y, rx, ry, col]) => { ell(c, x, y, rx, ry, rgba(col, 0.22)); ell(c, x - rx * 0.2, y, rx * 0.5, ry * 0.5, rgba(col, 0.3)); });
      rect(c, 620, 668, 84, 22, '#02020a'); for (let k = 0; k < 7; k++) rect(c, 626 + k * 11, 671, 5, 16, '#15123a');
      /* lamp post */
      rect(c, 832, 200, 8, 380, '#02020a'); zig(c, 836, 580, 40, 24, 3, '#02020a'); poly(c, [816, 200, 856, 200, 848, 176, 824, 176], '#02020a'); circ(c, 836, 206, 13, '#fff0c0');
      glow(c, 836, 210, 200, '#ffe0a0', 0.5); cone(c, 836, 210, Math.PI / 2, 0.42, 470, '#ffe0a0', 0.28);
      saxman(c, 900, 600, 2.1, '#030208', 'rgba(255,224,160,.9)');
      /* trash + crates + cat */
      [[190, 560], [280, 590]].forEach(([x, y]) => { rect(c, x, y, 76, 96, lg(c, x, 0, x + 76, 0, [[0, '#1a1840'], [1, '#07061a']])); for (let k = 1; k < 6; k++) rect(c, x + k * 12.6, y, 2, 96, 'rgba(0,0,0,.4)'); ell(c, x + 38, y, 42, 8, '#23205a'); rect(c, x + 30, y - 12, 16, 6, '#23205a'); });
      c.fillStyle = '#02020a'; ell(c, 226, 542, 22, 11, '#02020a'); circ(c, 248, 530, 9, '#02020a'); poly(c, [242, 524, 244, 514, 249, 522], '#02020a'); poly(c, [250, 522, 255, 514, 256, 525], '#02020a');
      c.strokeStyle = '#02020a'; c.lineWidth = 4; c.beginPath(); c.moveTo(206, 544); c.quadraticCurveTo(186, 540, 190, 520); c.stroke(); circ(c, 251, 529, 1.5, '#ffe36a');
      crate(c, 1070, 590, 120, 100, '#2a1620'); crate(c, 1170, 630, 110, 90, '#231019'); crate(c, 1096, 520, 90, 72, '#32202a');
      rect(c, 0, 0, W, H, rg(c, 640, 420, 200, 800, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,6,.6)']]));
    },
    fx(c, t) {
      A.rain(c, t, 0.34);
      const fl = Math.sin(t * 31) > 0.93 ? 0 : 1;
      glow(c, 1180, 250, 240, '#ff3c8a', 0.1 * fl + 0.03 * Math.sin(t * 2));
      glow(c, 836, 210, 180, '#ffe0a0', 0.07 + 0.04 * Math.sin(t * 5.3));
    }
  };

  L.hotel = {
    name: 'the Hotel Meridian', short: 'Hotel Meridian', staff: 'Concierge', tag: 'Every guest has a secret', mood: 'warm',
    body: [640, 630], spots: [
      { n: 'Reception Desk', x: 330, y: 452 }, { n: 'Key Rack', x: 310, y: 290 }, { n: 'Elevator', x: 640, y: 340 }, { n: 'Telephone Booth', x: 1014, y: 350 },
      { n: 'Luggage Cart', x: 1130, y: 590, kind: 'lock' }, { n: 'Potted Palm', x: 850, y: 470 }, { n: 'Lounge Chair', x: 150, y: 630 }],
    draw(c, r) {
      rect(c, 0, 0, W, H, lg(c, 0, 0, 0, 500, [[0, '#1c1108'], [0.6, '#4a2e14'], [1, '#2a180a']]));
      for (let x = 0; x < W; x += 64) { rect(c, x, 80, 2, 420, 'rgba(244,221,154,.10)'); }
      rect(c, 0, 70, W, 12, goldG(c, 0, 70, W, 12)); for (let x = 16; x < W; x += 40) poly(c, [x, 82, x + 20, 100, x + 40, 82], 'rgba(217,178,95,.5)');
      /* elevators */
      rect(c, 520, 170, 240, 320, '#2a1a0c'); zig(c, 640, 172, 280, 40, 4, GOLD);
      [530, 644].forEach((x, i) => {
        rect(c, x, 200, 106, 290, lg(c, x, 0, x + 106, 0, [[0, '#c9a14a'], [0.5, '#f4dd9a'], [1, '#8a6a2a']]));
        sunburst(c, x + (i ? 0 : 106), 490, 20, 300, 20, i ? -Math.PI / 2 : Math.PI, i ? 0 : Math.PI * 1.5, 'rgba(90,50,10,.35)');
        c.strokeStyle = '#6a4a14'; c.lineWidth = 2; c.strokeRect(x + 6, 206, 94, 278);
      });
      rect(c, 636, 200, 8, 290, '#1a0e04');
      c.beginPath(); c.arc(640, 168, 44, Math.PI, TAU); c.fillStyle = '#12090a'; c.fill(); c.strokeStyle = GOLD; c.lineWidth = 3; c.stroke();
      for (let i = 0; i <= 6; i++) { const a = Math.PI + i * Math.PI / 6; line(c, 640 + Math.cos(a) * 34, 168 + Math.sin(a) * 34, 640 + Math.cos(a) * 42, 168 + Math.sin(a) * 42, GOLD2, 2); }
      line(c, 640, 168, 640 + Math.cos(-1.1) * 32, 168 + Math.sin(-1.1) * 32, '#ff5a4a', 3);
      /* key rack + desk */
      rect(c, 190, 210, 240, 150, '#1a0e06'); c.strokeStyle = GOLD; c.lineWidth = 3; c.strokeRect(190, 210, 240, 150);
      for (let j = 0; j < 4; j++) for (let i = 0; i < 8; i++) { rect(c, 198 + i * 29, 218 + j * 35, 25, 30, '#2e1c0e'); if (r.chance(0.6)) { circ(c, 210 + i * 29, 228 + j * 35, 3, GOLD2); rect(c, 209 + i * 29, 230 + j * 35, 2, 12, GOLD2); } }
      man(c, 330, 500, 1.5, '#0a0504', 'rgba(255,200,120,.8)');
      poly(c, [150, 400, 500, 400, 520, 424, 130, 424], '#6a3a1a'); rect(c, 130, 424, 390, 80, lg(c, 0, 424, 0, 504, [[0, '#4a240e'], [1, '#1c0c04']])); rect(c, 130, 420, 390, 6, goldG(c, 130, 0, 390, 6));
      for (let x = 150; x < 510; x += 60) { rect(c, x, 436, 44, 60, 'rgba(217,178,95,.1)'); sunburst(c, x + 22, 496, 4, 50, 10, Math.PI, TAU, 'rgba(217,178,95,.4)'); }
      tableLamp(c, 200, 402, 1.2); ell(c, 420, 398, 12, 4, GOLD); circ(c, 420, 392, 7, GOLD2);
      /* phone booth */
      rect(c, 960, 210, 108, 290, lg(c, 960, 0, 1068, 0, [[0, '#5a3016'], [1, '#2a1408']])); zig(c, 1014, 210, 124, 22, 3, '#6a3a1a');
      rect(c, 974, 240, 80, 150, 'rgba(255,220,140,.5)'); glow(c, 1014, 310, 110, '#ffd08a', 0.4); line(c, 1014, 240, 1014, 390, '#3a1c0a', 3); line(c, 974, 315, 1054, 315, '#3a1c0a', 3);
      rect(c, 996, 280, 30, 44, '#0a0504'); c.font = '13px Limelight, serif'; c.fillStyle = GOLD2; c.textAlign = 'center'; c.fillText('TELEPHONE', 1014, 232);
      column(c, 120, 80, 500, 46, '#a88a5a', '#5a4020'); column(c, 470, 80, 500, 46, '#a88a5a', '#5a4020'); column(c, 810, 80, 500, 46, '#a88a5a', '#5a4020'); column(c, 1160, 80, 500, 46, '#a88a5a', '#5a4020');
      chandelier(c, 640, 0, 1.1);
      /* floor */
      rect(c, 0, 500, W, 220, '#120a05'); checker(c, 500, 720, 640, 380, 7, '#d8c49a', '#1c1009');
      rect(c, 0, 500, W, 220, lg(c, 0, 500, 0, 720, [[0, 'rgba(20,10,4,.72)'], [1, 'rgba(20,10,4,.15)']]));
      ell(c, 640, 630, 230, 60, '#2a180a', GOLD, 3); flatBurst(c, 640, 630, 16, 222, 24, 'rgba(217,178,95,.5)', 0.26); circ(c, 640, 630, 18, GOLD2);
      palm(c, 850, 520, 1.5, '#122a1c'); rect(c, 828, 486, 44, 36, GOLDD);
      /* lounge chair */
      c.fillStyle = lg(c, 60, 0, 250, 0, [[0, '#1c6a5a'], [1, '#0a2a26']]); c.beginPath(); c.moveTo(60, 700); c.lineTo(60, 590); c.quadraticCurveTo(64, 550, 110, 552); c.lineTo(200, 552); c.quadraticCurveTo(246, 550, 250, 590); c.lineTo(250, 700); c.closePath(); c.fill();
      rect(c, 50, 640, 40, 70, '#145046'); rect(c, 220, 640, 40, 70, '#0c3630'); rect(c, 90, 650, 130, 30, '#1f7a68'); for (let x = 96; x < 220; x += 24) line(c, x, 560, x, 650, 'rgba(0,0,0,.25)', 2);
      /* luggage cart */
      c.strokeStyle = GOLD; c.lineWidth = 6; c.beginPath(); c.moveTo(1050, 690); c.lineTo(1050, 520); c.quadraticCurveTo(1130, 460, 1210, 520); c.lineTo(1210, 690); c.stroke();
      rect(c, 1040, 660, 180, 12, goldG(c, 1040, 0, 180, 12)); circ(c, 1062, 690, 12, '#1a0e06', GOLD, 3); circ(c, 1198, 690, 12, '#1a0e06', GOLD, 3);
      [[1062, 600, 136, 60, '#7a1420'], [1076, 556, 108, 44, '#5a3a1a'], [1092, 524, 76, 32, '#1f3f6a']].forEach(([x, y, w, h, col]) => { rect(c, x, y, w, h, col); rect(c, x, y + h * 0.3, w, 3, 'rgba(0,0,0,.35)'); rect(c, x + w / 2 - 10, y - 5, 20, 6, GOLDD); rect(c, x + 8, y + 4, 8, h - 8, GOLDD); rect(c, x + w - 16, y + 4, 8, h - 8, GOLDD); });
    },
    fx(c, t) { A.motes(c, t, '#ffe0a0', 0.4); glow(c, 640, 80, 330, '#ffd98a', 0.04 + 0.015 * Math.sin(t * 2)); }
  };

  L.docks = {
    name: 'Pier Nine', short: 'Pier Nine', staff: 'Dock Foreman', tag: 'Fog, rope and bad business', outdoor: true, mood: 'cold',
    body: [600, 648], spots: [
      { n: 'Warehouse Door', x: 190, y: 420, kind: 'lock' }, { n: 'Cargo Crates', x: 470, y: 560 }, { n: 'Oil Barrels', x: 760, y: 600 }, { n: 'Mooring Bollard', x: 930, y: 566 },
      { n: 'Rowboat', x: 1120, y: 500 }, { n: 'Hanging Nets', x: 420, y: 360 }, { n: 'Harbour Crane', x: 590, y: 250 }],
    draw(c, r) {
      rect(c, 0, 0, W, H, lg(c, 0, 0, 0, 470, [[0, '#02030c'], [0.6, '#0c1440'], [1, '#3a2a7a']]));
      for (let i = 0; i < 160; i++) { c.globalAlpha = r.f(0.2, 0.8); rect(c, r.f(0, W), r.f(0, 300), 1.3, 1.3, '#dfe2ff'); } c.globalAlpha = 1;
      glow(c, 1000, 150, 260, '#8f9cff', 0.35); circ(c, 1000, 150, 38, '#fff6dc');
      c.save(); try { c.filter = 'blur(8px)'; } catch (e) { /* */ } for (let i = 0; i < 12; i++) ell(c, r.f(0, W), r.f(60, 300), r.f(140, 320), r.f(8, 20), 'rgba(90,90,200,.2)'); c.restore();
      for (let x = 380; x < W;) { const w = r.f(20, 50); A.building(c, r, x, 440, w, r.f(40, 150), { wall: '#141a56', pier: '#1c2470', lit: 0.4, ws: 2, gap: 3 }); x += w; }
      /* water */
      rect(c, 0, 440, W, 280, lg(c, 0, 440, 0, 720, [[0, '#2a2a7a'], [0.3, '#0c1238'], [1, '#03040f']]));
      for (let i = 0; i < 44; i++) { const y = 446 + i * 3.2, w = 6 + i * 3; rect(c, 1000 - w / 2 + r.f(-8, 8), y, w, 1.6, `rgba(255,246,220,${0.5 - i * 0.01})`); }
      for (let i = 0; i < 90; i++) rect(c, r.f(340, W), r.f(446, 560), r.f(10, 50), 1, 'rgba(160,170,255,.2)');
      /* ship */
      const ink = '#03030c';
      poly(c, [700, 430, 1280, 400, 1280, 520, 760, 520], ink); rect(c, 880, 330, 260, 80, ink); rect(c, 930, 290, 150, 44, ink);
      [960, 1040].forEach(x => { rect(c, x, 220, 36, 74, ink); rect(c, x, 232, 36, 10, '#a52433'); });
      line(c, 800, 420, 800, 250, ink, 4); line(c, 800, 250, 930, 300, ink, 2); line(c, 1200, 400, 1200, 270, ink, 4);
      for (let x = 896; x < 1130; x += 26) circ(c, x, 372, 5, '#ffd95a'); for (let x = 944; x < 1070; x += 26) circ(c, x, 312, 4, '#ffd95a');
      for (let x = 760; x < 1280; x += 34) circ(c, x, 470 - (x - 760) * 0.02, 4, 'rgba(255,217,90,.7)');
      c.strokeStyle = 'rgba(110,120,255,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(700, 430); c.lineTo(1280, 400); c.stroke();
      /* crane */
      c.strokeStyle = ink; c.lineWidth = 6; line(c, 560, 520, 590, 150, ink, 7); line(c, 640, 520, 600, 150, ink, 7);
      for (let i = 0; i < 9; i++) { const y = 500 - i * 38; line(c, 562 + i * 3.2, y, 638 - i * 4.2, y - 38, ink, 3); line(c, 638 - i * 4.2, y, 562 + i * 3.2, y - 38, ink, 3); }
      line(c, 595, 150, 860, 90, ink, 8); line(c, 595, 150, 480, 170, ink, 8); line(c, 595, 110, 860, 90, ink, 3); line(c, 595, 110, 595, 150, ink, 5); line(c, 595, 110, 480, 170, ink, 3);
      line(c, 830, 96, 830, 250, ink, 2); c.beginPath(); c.arc(830, 262, 12, -0.4, Math.PI * 1.2); c.strokeStyle = ink; c.lineWidth = 4; c.stroke(); circ(c, 595, 106, 4, '#ff4a4a'); glow(c, 595, 106, 30, '#ff4a4a', 0.8);
      /* warehouse */
      rect(c, 0, 200, 370, 330, lg(c, 0, 0, 370, 0, [[0, '#0c0e2c'], [1, '#171a48']])); poly(c, [-10, 200, 185, 130, 380, 200], '#0a0c26');
      for (let x = 10; x < 370; x += 22) rect(c, x, 200, 2, 330, 'rgba(0,0,0,.35)');
      rect(c, 70, 300, 240, 230, '#090a20'); for (let x = 80; x < 310; x += 20) rect(c, x, 300, 3, 230, '#14173e'); rect(c, 60, 292, 260, 10, '#23286a'); rect(c, 180, 408, 20, 26, GOLDD); circ(c, 190, 424, 4, '#111');
      c.font = '40px Limelight, serif'; c.textAlign = 'center'; c.fillStyle = 'rgba(244,221,154,.8)'; c.fillText('PIER 9', 190, 268);
      circ(c, 190, 180, 9, '#ffe0a0'); cone(c, 190, 184, Math.PI / 2, 0.55, 380, '#ffd98a', 0.26);
      /* nets */
      c.strokeStyle = 'rgba(160,170,255,.45)'; c.lineWidth = 1.2; line(c, 372, 300, 372, 500, ink, 6); line(c, 470, 310, 470, 500, ink, 6);
      for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(372, 310 + i * 14); c.quadraticCurveTo(420, 340 + i * 15, 470, 316 + i * 14); c.stroke(); line(c, 372 + i * 12.2, 310 + Math.sin(i / 8 * Math.PI) * 26, 372 + i * 12.2, 424 + Math.sin(i / 8 * Math.PI) * 28, 'rgba(160,170,255,.35)', 1); }
      /* pier */
      poly(c, [0, 530, 1010, 530, 1090, 720, 0, 720], lg(c, 0, 530, 0, 720, [[0, '#2a2140'], [1, '#0a0716']]));
      for (let j = 0; j < 8; j++) { const y = 536 + j * j * 3; line(c, 0, y, 1012 + (y - 530) * 0.42, y, 'rgba(0,0,0,.4)', 2); }
      for (let x = 60; x < 1000; x += 120) line(c, x, 530, x - 30, 720, 'rgba(0,0,0,.25)', 2);
      [1010, 1050, 1088].forEach((x, i) => rect(c, x - 8, 530 + i * 80, 16, 200, '#07050f'));
      /* lamp + fog */
      rect(c, 676, 300, 7, 240, ink); poly(c, [660, 300, 700, 300, 690, 280, 670, 280], ink); circ(c, 680, 306, 10, '#fff0c0'); glow(c, 680, 310, 190, '#ffe0a0', 0.45); cone(c, 680, 310, Math.PI / 2, 0.5, 330, '#ffe0a0', 0.22);
      /* crates, barrels, bollard, boat */
      crate(c, 380, 540, 110, 90, '#3a2a30'); crate(c, 470, 570, 120, 100, '#2e2028'); crate(c, 410, 470, 90, 72, '#44323a');
      [[720, 560], [780, 580], [752, 500]].forEach(([x, y]) => { rect(c, x - 28, y, 56, 80, lg(c, x - 28, 0, x + 28, 0, [[0, '#4a5a8a'], [0.4, '#232a50'], [1, '#0a0c20']])); ell(c, x, y, 28, 7, '#3a4674'); rect(c, x - 28, y + 22, 56, 4, '#0a0c20'); rect(c, x - 28, y + 54, 56, 4, '#0a0c20'); });
      rect(c, 916, 548, 28, 40, '#0a0812'); ell(c, 930, 548, 22, 8, '#15121f'); c.strokeStyle = '#8a7a50'; c.lineWidth = 5; c.beginPath(); c.moveTo(940, 560); c.quadraticCurveTo(1040, 600, 1100, 520); c.stroke(); ell(c, 930, 566, 20, 5, null, '#8a7a50', 4);
      c.fillStyle = '#1a1026'; c.beginPath(); c.moveTo(1040, 500); c.quadraticCurveTo(1120, 540, 1230, 496); c.lineTo(1216, 524); c.quadraticCurveTo(1120, 550, 1056, 522); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(130,140,255,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(1040, 500); c.quadraticCurveTo(1120, 540, 1230, 496); c.stroke(); line(c, 1100, 512, 1170, 470, '#3a2a3a', 4);
      man(c, 250, 600, 1.9, '#030208', 'rgba(255,224,160,.75)');
      rect(c, 0, 380, W, 200, lg(c, 0, 380, 0, 580, [[0, 'rgba(120,120,220,0)'], [0.5, 'rgba(120,120,220,.16)'], [1, 'rgba(120,120,220,0)']]));
    },
    fx(c, t) {
      A.rain(c, t, 0.2);
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 4; i++) { const x = ((t * 14 + i * 400) % 1700) - 200; c.fillStyle = rg(c, x, 470 + i * 26, 0, 240, [[0, 'rgba(120,130,230,.10)'], [1, 'rgba(120,130,230,0)']]); c.fillRect(x - 240, 380, 480, 240); }
      for (let i = 0; i < 12; i++) { const y = 450 + i * 6; c.fillStyle = `rgba(255,246,220,${0.25 + 0.2 * Math.sin(t * 3 + i * 1.7)})`; c.fillRect(1000 - 10 - i * 2 + Math.sin(t * 2 + i) * 5, y, 18 + i * 3, 1.4); }
      c.restore();
      glow(c, 595, 106, 40, '#ff4a4a', 0.5 * (Math.sin(t * 3) > 0 ? 1 : 0.1));
    }
  };

  L.theatre = {
    name: 'the Majestic Theatre', short: 'The Majestic', staff: 'Stage Manager', tag: 'Backstage, after the last bow', mood: 'warm',
    body: [640, 636], spots: [
      { n: 'Vanity Mirror', x: 460, y: 250 }, { n: 'Dressing Table', x: 460, y: 462 }, { n: 'Costume Rack', x: 900, y: 340 }, { n: 'Folding Screen', x: 196, y: 420 },
      { n: 'Steamer Trunk', x: 1130, y: 610, kind: 'lock' }, { n: 'Flower Bouquet', x: 700, y: 440 }, { n: 'Prop Shelf', x: 1170, y: 250 }],
    draw(c, r) {
      rect(c, 0, 0, W, H, lg(c, 0, 0, 0, 520, [[0, '#061a1c'], [0.7, '#0f3a3a'], [1, '#082224']]));
      for (let y = 40; y < 520; y += 56) for (let x = (y / 56 % 2) * 40; x < W; x += 80) fan(c, x, y, 34, 'rgba(127,224,208,.06)', 'rgba(0,0,0,0)', 3);
      rect(c, 0, 506, W, 14, '#3a2414'); rect(c, 0, 504, W, 3, GOLD);
      /* vanity mirror */
      rect(c, 290, 100, 340, 300, goldG(c, 290, 100, 340, 300)); zig(c, 460, 100, 240, 30, 3, GOLD);
      rect(c, 318, 128, 284, 244, lg(c, 318, 128, 602, 372, [[0, '#9ad0cf'], [0.5, '#2a5a60'], [1, '#12303a']]));
      poly(c, [318, 300, 430, 128, 480, 128, 318, 372], 'rgba(255,255,255,.14)'); poly(c, [500, 128, 530, 128, 380, 372, 350, 372], 'rgba(255,255,255,.08)');
      woman(c, 480, 430, 2.2, 'rgba(6,20,24,.55)');
      for (let i = 0; i < 9; i++) { [[304 + i * 39, 114], [304 + i * 39, 386]].forEach(([x, y]) => { circ(c, x, y, 8, '#fff6d0'); glow(c, x, y, 34, '#ffe6a0', 0.7); }); }
      for (let i = 1; i < 7; i++) { [[304, 114 + i * 39], [616, 114 + i * 39]].forEach(([x, y]) => { circ(c, x, y, 8, '#fff6d0'); glow(c, x, y, 34, '#ffe6a0', 0.7); }); }
      glow(c, 460, 250, 380, '#ffe0a0', 0.22);
      /* dressing table */
      poly(c, [270, 430, 650, 430, 670, 456, 250, 456], '#7a4a2a'); rect(c, 250, 456, 420, 16, '#4a2a14'); rect(c, 250, 454, 420, 3, GOLD);
      rect(c, 270, 472, 70, 60, '#3a2010'); rect(c, 580, 472, 70, 60, '#3a2010'); circ(c, 305, 500, 4, GOLD); circ(c, 615, 500, 4, GOLD);
      [[320, '#c2356f', 26], [352, '#7fe0d0', 34], [382, '#e8c468', 22], [560, '#a52433', 30], [596, '#6d3192', 24]].forEach(([x, col, h]) => { rect(c, x - 8, 430 - h, 16, h, col); rect(c, x - 3, 430 - h - 8, 6, 9, GOLD); rect(c, x - 6, 430 - h + 3, 2, h - 6, 'rgba(255,255,255,.4)'); });
      ell(c, 470, 438, 30, 8, '#efe6cf'); circ(c, 470, 430, 12, '#f7c9d6');
      ell(c, 460, 560, 44, 12, '#7a1420'); rect(c, 452, 560, 16, 70, GOLDD); ell(c, 460, 632, 34, 8, GOLDD);
      /* screen */
      [[60, 190, 0.06], [128, 200, 0], [196, 190, -0.06]].forEach(([x, y, sk], i) => {
        poly(c, [x, y, x + 66, y + (i === 1 ? 0 : sk * 100), x + 66, 560, x, 560 + (i === 1 ? 0 : -sk * 100)], i === 1 ? '#7a1f2e' : '#5a1522');
        c.strokeStyle = GOLD; c.lineWidth = 2; c.strokeRect(x + 6, y + 14, 54, 330); sunburst(c, x + 33, y + 344, 6, 200, 12, Math.PI * 1.2, Math.PI * 1.8, 'rgba(217,178,95,.4)'); circ(c, x + 33, y + 90, 14, 'rgba(244,221,154,.8)');
      });
      c.strokeStyle = '#efe6cf'; c.lineWidth = 6; c.beginPath(); c.moveTo(150, 200); c.quadraticCurveTo(190, 250, 170, 330); c.stroke();
      /* costume rack */
      rect(c, 760, 190, 300, 6, goldG(c, 760, 0, 300, 6)); rect(c, 764, 190, 6, 340, GOLDD); rect(c, 1050, 190, 6, 340, GOLDD); rect(c, 740, 528, 60, 6, GOLDD); rect(c, 1024, 528, 60, 6, GOLDD);
      [['#c2356f', 790], ['#e8c468', 840], ['#2447c4', 892], ['#12805c', 944], ['#efe6cf', 996]].forEach(([col, x], i) => {
        line(c, x, 196, x, 210, GOLD2, 2); poly(c, [x - 14, 212, x + 14, 212, x + 24 + i % 2 * 6, 480 - i % 3 * 30, x - 24, 480 - i % 3 * 30], lg(c, x - 24, 0, x + 24, 0, [[0, col], [1, mix(col, '#000000', 0.6)]]));
        for (let k = 0; k < 5; k++) circ(c, x - 12 + k * 6, 240 + k * 40, 1.6, 'rgba(255,255,255,.6)');
      });
      c.strokeStyle = '#f7c9d6'; c.lineWidth = 9; c.lineCap = 'round'; c.setLineDash([2, 9]); c.beginPath(); c.moveTo(1040, 200); c.quadraticCurveTo(1090, 300, 1050, 420); c.stroke(); c.setLineDash([]);
      /* flowers */
      rect(c, 690, 470, 20, 50, GOLDD); poly(c, [676, 470, 724, 470, 716, 440, 684, 440], '#1f3f6a');
      for (let i = 0; i < 14; i++) circ(c, 700 + r.f(-30, 30), 420 + r.f(-26, 16), r.f(7, 12), r.pick(['#c2356f', '#ff6f8f', '#f7c9d6', '#a52433']));
      for (let i = 0; i < 6; i++) ell(c, 700 + r.f(-34, 34), 436 + r.f(-10, 10), 9, 4, '#12805c');
      /* prop shelf + posters + sandbags */
      rect(c, 1100, 270, 160, 8, '#3a2414'); rect(c, 1100, 180, 160, 8, '#3a2414');
      circ(c, 1130, 252, 18, '#efe6cf'); rect(c, 1120, 262, 20, 8, '#efe6cf'); poly(c, [1170, 270, 1210, 270, 1200, 214, 1180, 214], GOLD); rect(c, 1226, 226, 22, 44, '#7a1420'); ell(c, 1150, 174, 30, 8, '#1a1030'); rect(c, 1136, 150, 28, 24, '#1a1030'); rect(c, 1200, 150, 40, 30, '#2447c4');
      frame(c, 690, 150, 60, 80, 5); rect(c, 690, 150, 60, 80, '#a52433'); circ(c, 720, 180, 16, GOLD2); rect(c, 700, 206, 40, 6, GOLD2);
      [[1090, 0, 80], [1220, 0, 120]].forEach(([x, y0, y1]) => { line(c, x, y0, x, y1, '#8a7a50', 4); poly(c, [x - 18, y1, x + 18, y1, x + 22, y1 + 46, x - 22, y1 + 46], '#4a3a2a'); rect(c, x - 8, y1 - 6, 16, 8, '#8a7a50'); });
      pendant(c, 860, 30, 1, '#ffe0a0');
      /* floor + trunk */
      rect(c, 0, 520, W, 200, lg(c, 0, 520, 0, 720, [[0, '#2a1a10'], [1, '#0a0604']]));
      for (let x = -200; x < W + 200; x += 90) line(c, 640 + (x - 640) * 0.6, 520, 640 + (x - 640) * 1.5, 720, 'rgba(0,0,0,.4)', 2);
      ell(c, 460, 640, 260, 40, 'rgba(255,224,160,.07)');
      rect(c, 1030, 560, 210, 120, lg(c, 1030, 0, 1240, 0, [[0, '#4a2a3a'], [1, '#1c0c16']])); rect(c, 1030, 596, 210, 5, '#0a0408');
      [1040, 1130, 1220].forEach(x => rect(c, x, 560, 10, 120, GOLDD)); rect(c, 1124, 588, 22, 22, GOLD); circ(c, 1135, 602, 3, '#111');
      [[1060, 620, '#e8c468', 'PARIS'], [1160, 630, '#7fe0d0', 'RIO']].forEach(([x, y, col, t]) => { rect(c, x, y, 54, 30, col); c.font = '12px Limelight, serif'; c.fillStyle = '#1a1030'; c.textAlign = 'center'; c.fillText(t, x + 27, y + 20); });
    },
    fx(c, t) {
      for (let i = 0; i < 9; i++) glow(c, 304 + i * 39, 114, 30, '#ffe6a0', 0.12 + 0.1 * Math.sin(t * 2.3 + i * 1.3));
      A.motes(c, t, '#ffe6b0', 0.4);
    }
  };

  L.rooftop = {
    name: 'the Zenith Roof Garden', short: 'Zenith Rooftop', staff: 'Lift Operator', tag: 'The whole city at your feet', outdoor: true, mood: 'cool',
    body: [700, 644], spots: [
      { n: 'Water Tower', x: 236, y: 420 }, { n: 'Brass Telescope', x: 786, y: 470 }, { n: 'Stone Eagle', x: 1096, y: 380 }, { n: 'Skylight', x: 470, y: 600 },
      { n: 'Neon Sign', x: 560, y: 300 }, { n: 'Garden Bench', x: 960, y: 610 }, { n: 'Topiary Planter', x: 150, y: 640 }],
    draw(c, r) {
      rect(c, 0, 0, W, H, lg(c, 0, 0, 0, 520, [[0, '#02020b'], [0.45, '#0a0930'], [0.8, '#2b1a6e'], [1, '#7a3596']]));
      for (let i = 0; i < 220; i++) { c.globalAlpha = r.f(0.2, 0.9); rect(c, r.f(0, W), r.f(0, 330), 1.4, 1.4, '#dfe2ff'); } c.globalAlpha = 1;
      glow(c, 930, 110, 230, '#8f8cff', 0.35); circ(c, 930, 110, 40, '#fff6dc');
      c.save(); try { c.filter = 'blur(9px)'; } catch (e) { /* */ } for (let i = 0; i < 16; i++) ell(c, r.f(0, W), r.f(40, 330), r.f(140, 360), r.f(8, 22), 'rgba(100,70,210,.2)'); c.restore();
      for (let x = -10; x < W;) { const w = r.f(26, 60); A.building(c, r, x, 480, w, r.f(60, 250), { wall: '#1c1560', pier: '#241c74', lit: 0.36, ws: 2, gap: 3, wins: ['#8f86ff', '#ffd98a'] }); x += w * 0.9; }
      rect(c, 0, 280, W, 220, lg(c, 0, 280, 0, 500, [[0, 'rgba(90,50,160,0)'], [1, 'rgba(130,60,170,.6)']]));
      for (let x = -20; x < W;) { const w = r.f(50, 110); if (x < 330 || x > 700) A.building(c, r, x, 500, w, r.f(80, 260), { wall: '#0d0a30', pier: '#17124a', lit: 0.5, ws: 3, gap: 4, rim: 'rgba(110,100,255,.4)' }); x += w * 1.1; }
      /* neon sign, seen from behind */
      for (let x = 400; x <= 720; x += 80) { line(c, x, 480, x, 250, '#03030c', 5); line(c, x, 480, x + 80, 250, '#03030c', 2); }
      line(c, 390, 250, 740, 250, '#03030c', 6); line(c, 390, 350, 740, 350, '#03030c', 4);
      c.save(); c.translate(1130, 0); c.scale(-1, 1); neon(c, 'ZENITH', 565, 302, 74, '#ff3c8a'); c.restore();
      glow(c, 565, 300, 330, '#ff3c8a', 0.25);
      /* water tower */
      const ink = '#04031a';
      [170, 300].forEach(x => line(c, x, 500, x + (x < 236 ? 16 : -16), 330, ink, 7)); line(c, 176, 470, 294, 400, ink, 3); line(c, 294, 470, 176, 400, ink, 3);
      rect(c, 160, 220, 152, 120, lg(c, 160, 0, 312, 0, [[0, '#0c0a2e'], [0.75, '#1a1650'], [1, '#3a3aa0']])); for (let x = 172; x < 312; x += 14) rect(c, x, 220, 2, 120, 'rgba(0,0,0,.4)'); rect(c, 156, 250, 160, 5, ink); rect(c, 156, 310, 160, 5, ink);
      poly(c, [150, 222, 236, 160, 322, 222], '#0a0826'); line(c, 236, 160, 322, 222, 'rgba(120,110,255,.7)', 2); line(c, 312, 222, 312, 340, 'rgba(120,110,255,.6)', 2);
      /* parapet */
      rect(c, 0, 470, W, 60, lg(c, 0, 470, 0, 530, [[0, '#23205a'], [1, '#0c0a2a']])); rect(c, 0, 466, W, 6, '#3a3a9a');
      for (let x = 10; x < W; x += 60) { rect(c, x, 480, 40, 40, 'rgba(0,0,0,.25)'); sunburst(c, x + 20, 520, 3, 34, 8, Math.PI, TAU, 'rgba(120,110,255,.3)'); }
      /* eagle */
      rect(c, 1050, 420, 92, 50, '#151240'); zig(c, 1096, 420, 110, 30, 3, '#1c1856');
      c.fillStyle = ink; poly(c, [1076, 390, 1116, 390, 1110, 300, 1096, 286, 1082, 300], ink);
      for (let i = 0; i < 5; i++) { poly(c, [1082, 310 + i * 14, 1010 + i * 8, 250 + i * 26, 1022 + i * 8, 284 + i * 24, 1080, 330 + i * 14], ink); poly(c, [1110, 310 + i * 14, 1182 - i * 8, 250 + i * 26, 1170 - i * 8, 284 + i * 24, 1112, 330 + i * 14], ink); }
      circ(c, 1096, 282, 13, ink); poly(c, [1104, 278, 1124, 284, 1104, 290], ink);
      c.strokeStyle = 'rgba(255,90,150,.75)'; c.lineWidth = 2; c.beginPath(); c.moveTo(1010, 250); c.lineTo(1082, 310); c.stroke(); c.beginPath(); c.arc(1096, 282, 13, Math.PI, TAU * 0.9); c.stroke();
      c.strokeStyle = 'rgba(120,110,255,.8)'; c.beginPath(); c.moveTo(1182, 250); c.lineTo(1112, 310); c.stroke();
      /* deck */
      rect(c, 0, 530, W, 190, lg(c, 0, 530, 0, 720, [[0, '#17143e'], [1, '#06051a']]));
      for (let j = 0; j < 7; j++) line(c, 0, 536 + j * j * 4, W, 536 + j * j * 4, 'rgba(120,110,255,.08)', 1);
      for (let x = -400; x < W + 400; x += 130) line(c, 640 + (x - 640) * 0.7, 530, 640 + (x - 640) * 1.4, 720, 'rgba(120,110,255,.07)', 1);
      /* skylight */
      poly(c, [360, 640, 580, 640, 540, 560, 400, 560], lg(c, 0, 560, 0, 640, [[0, '#ffe6a0'], [1, '#ffb45a']]));
      c.strokeStyle = '#3a2a10'; c.lineWidth = 4; c.strokeRect(0, 0, 0, 0); poly(c, [360, 640, 580, 640, 540, 560, 400, 560], null, '#2a1c08', 5);
      [0.25, 0.5, 0.75].forEach(t => line(c, 360 + 220 * t, 640, 400 + 140 * t, 560, '#2a1c08', 3)); line(c, 380, 600, 560, 600, '#2a1c08', 3);
      glow(c, 470, 590, 260, '#ffc56a', 0.4); cone(c, 470, 600, -Math.PI / 2, 0.35, 420, '#ffc56a', 0.16);
      /* telescope */
      line(c, 786, 520, 750, 640, GOLDD, 5); line(c, 786, 520, 822, 640, GOLDD, 5); line(c, 786, 520, 790, 650, GOLDD, 5);
      c.save(); c.translate(786, 512); c.rotate(-0.45); rect(c, -70, -12, 130, 24, goldG(c, -70, -12, 130, 24)); rect(c, 56, -16, 22, 32, GOLD2); rect(c, -90, -7, 24, 14, GOLDD); rect(c, -20, -14, 6, 28, '#6a4a14'); c.restore();
      /* bench + planters */
      rect(c, 860, 600, 210, 12, '#0c0a2a'); rect(c, 860, 560, 210, 8, '#0c0a2a'); rect(c, 860, 578, 210, 8, '#0c0a2a'); [870, 1054].forEach(x => { rect(c, x, 556, 8, 86, '#0c0a2a'); }); rect(c, 860, 558, 210, 2, 'rgba(120,110,255,.6)');
      [[110, 690, 1.3], [1210, 700, 1.2]].forEach(([x, y, s]) => { rect(c, x - 40 * s, y - 50 * s, 80 * s, 50 * s, '#1c1856'); zig(c, x, y - 50 * s, 96 * s, 14 * s, 2, '#26226a'); poly(c, [x - 34 * s, y - 62 * s, x + 34 * s, y - 62 * s, x, y - 200 * s], '#061a14'); line(c, x, y - 200 * s, x + 34 * s, y - 62 * s, 'rgba(120,110,255,.6)', 2); });
      woman(c, 596, 560, 1.7, ink, 'rgba(255,90,150,.8)'); man(c, 646, 562, 1.75, ink, 'rgba(255,90,150,.8)');
    },
    fx(c, t) {
      [[200, 0.2, 0], [1000, 0.27, 2]].forEach(([x, sp, ph]) => cone(c, x, 470, -Math.PI / 2 + Math.sin(t * sp + ph) * 0.5, 0.04, 700, '#9a8cff', 0.22));
      A.rain(c, t, 0.16);
      const fl = Math.sin(t * 17) > 0.96 ? 0.2 : 1;
      glow(c, 565, 300, 300, '#ff3c8a', 0.09 * fl);
    }
  };

  L.station = {
    name: 'Grand Union Station', short: 'Grand Union Station', staff: 'Ticket Clerk', tag: 'The 12:05 waits for no one', mood: 'cool',
    body: [400, 650], spots: [
      { n: 'Luggage Lockers', x: 190, y: 400, kind: 'lock' }, { n: 'Departures Board', x: 210, y: 216 }, { n: 'Ticket Window', x: 1090, y: 372 }, { n: 'Waiting Bench', x: 560, y: 560 },
      { n: 'Newsstand', x: 1140, y: 590 }, { n: 'Great Clock', x: 640, y: 196 }, { n: 'Baggage Trolley', x: 820, y: 622 }],
    draw(c, r) {
      rect(c, 0, 0, W, H, lg(c, 0, 0, 0, 520, [[0, '#0e0c22'], [0.6, '#2a2440'], [1, '#17122a']]));
      /* arched windows with night light */
      [360, 640, 920].forEach(x => {
        c.save(); c.beginPath(); c.moveTo(x - 100, 470); c.lineTo(x - 100, 170); c.arc(x, 170, 100, Math.PI, TAU); c.lineTo(x + 100, 470); c.closePath(); c.clip();
        rect(c, x - 100, 60, 200, 420, lg(c, 0, 60, 0, 470, [[0, '#3a3a9a'], [1, '#8a6ad0']]));
        for (let k = 1; k < 5; k++) line(c, x - 100 + k * 40, 60, x - 100 + k * 40, 470, '#17122a', 4); for (let y = 110; y < 470; y += 50) line(c, x - 100, y, x + 100, y, '#17122a', 4);
        c.restore();
        c.strokeStyle = '#4a4268'; c.lineWidth = 10; c.beginPath(); c.moveTo(x - 100, 470); c.lineTo(x - 100, 170); c.arc(x, 170, 100, Math.PI, TAU); c.lineTo(x + 100, 470); c.stroke();
        cone(c, x, 120, Math.PI / 2 + 0.35, 0.2, 640, '#a9a4ff', 0.22);
      });
      /* train through central arch */
      rect(c, 560, 330, 160, 140, '#05040f'); rect(c, 580, 350, 120, 120, '#0a0818'); circ(c, 640, 400, 18, '#fff0c0'); glow(c, 640, 400, 130, '#ffe0a0', 0.6); rect(c, 596, 440, 88, 30, '#15122a'); poly(c, [590, 470, 690, 470, 700, 486, 580, 486], '#a52433');
      rect(c, 0, 470, W, 14, '#3a3458'); rect(c, 0, 468, W, 3, GOLD);
      /* clock */
      line(c, 640, 0, 640, 110, GOLD, 5); zig(c, 640, 126, 120, 20, 2, GOLD);
      circ(c, 640, 196, 74, goldG(c, 566, 122, 148, 148)); circ(c, 640, 196, 62, '#f7f0dc'); circ(c, 640, 196, 62, null, '#1a1030', 2);
      for (let i = 0; i < 12; i++) { const a = i * TAU / 12; line(c, 640 + Math.cos(a) * 50, 196 + Math.sin(a) * 50, 640 + Math.cos(a) * 58, 196 + Math.sin(a) * 58, '#1a1030', i % 3 ? 2 : 4); }
      line(c, 640, 196, 640, 148, '#1a1030', 4); line(c, 640, 196, 646, 160, '#1a1030', 6); circ(c, 640, 196, 5, '#a52433'); glow(c, 640, 196, 170, '#ffe6b0', 0.3);
      /* departures board */
      rect(c, 70, 140, 270, 150, '#05040c'); c.strokeStyle = GOLD; c.lineWidth = 4; c.strokeRect(70, 140, 270, 150); zig(c, 205, 140, 200, 20, 2, GOLD);
      c.font = '15px Limelight, serif'; c.fillStyle = GOLD2; c.textAlign = 'left'; c.fillText('DEPARTURES', 84, 162);
      ['12:05  CHICAGO     TRK 9', '12:40  HAVANA BOAT TRK 2', ' 1:15  EMPIRE LTD  TRK 5', ' 2:00  NIGHT OWL   TRK 7'].forEach((t, i) => { c.font = '13px monospace'; c.fillStyle = i === 0 ? '#ff9a3c' : '#e8c468'; c.fillText(t, 84, 188 + i * 24); });
      /* lockers */
      rect(c, 60, 318, 250, 152, '#23263e'); for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) { rect(c, 66 + i * 40.6, 324 + j * 48, 36, 43, lg(c, 0, 324 + j * 48, 0, 367 + j * 48, [[0, '#4a5072'], [1, '#262a44']])); circ(c, 94 + i * 40.6, 346 + j * 48, 3, GOLD); rect(c, 72 + i * 40.6, 330 + j * 48, 14, 3, 'rgba(0,0,0,.4)'); }
      /* ticket windows */
      rect(c, 960, 270, 270, 210, '#2a2030'); zig(c, 1095, 270, 290, 26, 3, GOLD);
      [980, 1110].forEach(x => { rect(c, x, 300, 100, 130, '#ffd98a'); glow(c, x + 50, 365, 120, '#ffd08a', 0.4); for (let k = 0; k <= 100; k += 12) line(c, x + k, 300, x + k, 400, '#6a4a14', 3); rect(c, x, 400, 100, 6, GOLD); rect(c, x + 30, 406, 40, 24, '#1a1020'); c.strokeStyle = GOLD; c.lineWidth = 3; c.strokeRect(x, 300, 100, 130); });
      c.font = '18px Limelight, serif'; c.fillStyle = GOLD2; c.textAlign = 'center'; c.fillText('TICKETS', 1095, 462);
      /* floor */
      rect(c, 0, 484, W, 236, '#0c0a18'); checker(c, 484, 720, 640, 380, 7, '#4a4468', '#1a1630');
      rect(c, 0, 484, W, 236, lg(c, 0, 484, 0, 720, [[0, 'rgba(10,8,24,.75)'], [1, 'rgba(10,8,24,.2)']]));
      [360, 640, 920].forEach(x => { c.save(); c.globalAlpha = 0.14; poly(c, [x + 60, 500, x + 240, 500, x + 380, 720, x + 120, 720], '#a9a4ff'); c.restore(); });
      /* benches + travellers */
      [[440, 560, 1], [700, 600, 1.2]].forEach(([x, y, s]) => { rect(c, x, y, 240 * s, 12 * s, '#3a2414'); rect(c, x, y - 50 * s, 240 * s, 40 * s, lg(c, 0, y - 50 * s, 0, y, [[0, '#5a3a20'], [1, '#2a180c']])); for (let k = 0; k < 6; k++) rect(c, x + 6 + k * 40 * s, y - 46 * s, 2, 32 * s, 'rgba(0,0,0,.35)'); [x + 8, x + 224 * s].forEach(lx => rect(c, lx, y, 8, 40 * s, '#1c1008')); zig(c, x + 120 * s, y - 50 * s, 60 * s, 12 * s, 2, GOLDD); });
      bust(c, 510, 544, 1.1, '#07060f', 'rgba(170,164,255,.8)', 1); bust(c, 620, 546, 1.05, '#07060f', 'rgba(170,164,255,.7)', 2); bust(c, 880, 580, 1.3, '#07060f', 'rgba(170,164,255,.8)', 0);
      /* trolley */
      rect(c, 760, 650, 150, 10, GOLDD); circ(c, 780, 672, 11, '#111', GOLD, 3); circ(c, 890, 672, 11, '#111', GOLD, 3); line(c, 910, 656, 930, 580, GOLDD, 5);
      [[770, 606, 90, 44, '#5a3a1a'], [800, 572, 80, 34, '#1f3f6a'], [866, 618, 40, 32, '#7a1420']].forEach(([x, y, w, h, col]) => { rect(c, x, y, w, h, col); rect(c, x + 6, y, 6, h, GOLDD); rect(c, x + w - 12, y, 6, h, GOLDD); });
      /* newsstand */
      rect(c, 1040, 520, 220, 170, '#12303a'); for (let i = 0; i < 6; i++) poly(c, [1030 + i * 40, 500, 1070 + i * 40, 500, 1066 + i * 40, 530, 1026 + i * 40, 530], i % 2 ? '#efe6cf' : '#a52433');
      for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) rect(c, 1050 + i * 34, 546 + j * 44, 28, 36, r.pick(['#c2356f', '#e8c468', '#7fe0d0', '#efe6cf', '#2447c4', '#ff9a3c']));
      for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) rect(c, 1054 + i * 34, 552 + j * 44, 20, 8, 'rgba(0,0,0,.45)');
      rect(c, 1040, 676, 220, 14, '#0a1c22'); glow(c, 1150, 560, 170, '#ffe0a0', 0.2);
      man(c, 1000, 640, 1.9, '#07060f', 'rgba(170,164,255,.8)');
    },
    fx(c, t) {
      A.motes(c, t, '#cfc8ff', 0.5);
      A.smoke(c, 610, 400, t * 0.6, 'rgba(220,220,255,.25)', 3); A.smoke(c, 670, 410, t * 0.6 + 3, 'rgba(220,220,255,.2)', 2);
      const a = t * TAU / 60; line(c, 640, 196, 640 + Math.sin(a) * 52, 196 - Math.cos(a) * 52, '#a52433', 1.5);
    }
  };

  L.office = {
    name: 'the Vane & Sterling Office', short: 'Vane & Sterling', staff: 'Night Secretary', tag: 'Frosted glass and filed secrets', mood: 'cool',
    body: [250, 656], spots: [
      { n: 'Desk Drawer', x: 560, y: 610, kind: 'lock' }, { n: 'Typewriter', x: 700, y: 516 }, { n: 'Filing Cabinet', x: 430, y: 380 }, { n: 'Floor Safe', x: 1150, y: 590, kind: 'safe' },
      { n: 'Coat Rack', x: 660, y: 300 }, { n: 'Wastebasket', x: 300, y: 600 }, { n: 'Window Blinds', x: 970, y: 260 }],
    draw(c, r) {
      rect(c, 0, 0, W, H, lg(c, 0, 0, 0, 520, [[0, '#0c0d1c'], [0.7, '#1f2238'], [1, '#12131f']]));
      rect(c, 0, 420, W, 100, 'rgba(60,40,20,.5)'); rect(c, 0, 418, W, 4, '#3a2a1a');
      /* window + neon outside */
      rect(c, 760, 90, 430, 350, '#1a1450'); glow(c, 1100, 200, 300, '#ff3c8a', 0.6); glow(c, 860, 340, 240, '#6a6cff', 0.5);
      c.save(); c.beginPath(); c.rect(760, 90, 430, 350); c.clip(); for (let x = 760; x < 1190;) { const w = r.f(40, 80); A.building(c, r, x, 440, w, r.f(100, 300), { wall: '#0a0828', pier: '#141048', lit: 0.5, ws: 3, gap: 4 }); x += w * 1.1; } c.restore();
      for (let y = 96; y < 440; y += 17) { rect(c, 760, y, 430, 9, '#0a0b16'); rect(c, 760, y, 430, 1.5, 'rgba(160,150,255,.5)'); }
      line(c, 790, 90, 790, 440, 'rgba(0,0,0,.6)', 1.5); line(c, 1160, 90, 1160, 440, 'rgba(0,0,0,.6)', 1.5);
      c.strokeStyle = '#2a2c44'; c.lineWidth = 10; c.strokeRect(760, 90, 430, 350); line(c, 975, 90, 975, 440, '#2a2c44', 8);
      /* door */
      rect(c, 110, 130, 190, 392, '#2a1c14'); rect(c, 126, 150, 158, 200, lg(c, 126, 150, 284, 350, [[0, '#8a94b0'], [1, '#4a5270']]));
      c.save(); c.translate(410, 0); c.scale(-1, 1); c.font = '20px Limelight, serif'; c.textAlign = 'center'; c.fillStyle = 'rgba(10,10,24,.75)'; c.fillText('VANE &', 205, 226); c.fillText('STERLING', 205, 254); c.font = '12px Limelight, serif'; c.fillText('INVESTIGATIONS', 205, 282); c.restore();
      man(c, 220, 400, 2.2, 'rgba(10,10,30,.35)'); circ(c, 276, 370, 7, GOLD);
      /* filing cabinets */
      [340, 432].forEach(x => { rect(c, x, 250, 88, 272, lg(c, x, 0, x + 88, 0, [[0, '#4a5a4a'], [1, '#1c261f']])); for (let j = 0; j < 4; j++) { c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 2; c.strokeRect(x + 5, 256 + j * 66, 78, 60); rect(c, x + 30, 276 + j * 66, 28, 6, GOLDD); rect(c, x + 32, 262 + j * 66, 24, 10, '#d8d0b8'); } });
      poly(c, [442, 386, 520, 386, 530, 400, 442, 400], '#2a362c'); rect(c, 450, 372, 60, 16, '#d8d0b8');
      /* coat rack */
      line(c, 660, 180, 660, 520, '#1a0e08', 7); zig(c, 660, 524, 70, 14, 2, '#1a0e08'); [-1, 1].forEach(d => { c.strokeStyle = '#1a0e08'; c.lineWidth = 5; c.beginPath(); c.moveTo(660, 200); c.quadraticCurveTo(660 + d * 30, 200, 660 + d * 34, 180); c.stroke(); });
      ell(c, 694, 176, 30, 6, '#0a0a14'); poly(c, [678, 176, 680, 152, 708, 152, 710, 176], '#0a0a14');
      poly(c, [626, 196, 660, 208, 650, 420, 606, 410], '#4a3a26'); poly(c, [660, 208, 650, 420, 676, 414, 672, 210], '#33261a'); line(c, 626, 196, 606, 410, 'rgba(160,150,255,.5)', 1.5);
      /* fan */
      line(c, 560, 0, 560, 44, '#1a1a2a', 6); circ(c, 560, 50, 14, '#2a2a3e');
      /* floor with blind stripes */
      rect(c, 0, 520, W, 200, lg(c, 0, 520, 0, 720, [[0, '#231a14'], [1, '#080605']]));
      c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 11; i++) poly(c, [330 + i * 62, 530, 362 + i * 62, 530, 150 + i * 80, 720, 106 + i * 80, 720], i % 3 === 0 ? 'rgba(255,60,138,.10)' : 'rgba(140,130,255,.11)'); c.restore();
      /* safe */
      rect(c, 1080, 520, 140, 150, lg(c, 1080, 0, 1220, 0, [[0, '#4a4e5a'], [1, '#17181f']])); c.strokeStyle = '#0a0a10'; c.lineWidth = 4; c.strokeRect(1090, 530, 120, 130);
      circ(c, 1150, 590, 26, '#2a2c36', GOLD, 3); for (let i = 0; i < 12; i++) { const a = i * TAU / 12; line(c, 1150 + Math.cos(a) * 18, 590 + Math.sin(a) * 18, 1150 + Math.cos(a) * 24, 590 + Math.sin(a) * 24, GOLD2, 1.5); } circ(c, 1150, 590, 8, GOLD); rect(c, 1190, 580, 8, 30, GOLDD);
      /* desk */
      poly(c, [400, 540, 980, 540, 1030, 580, 350, 580], lg(c, 0, 540, 0, 580, [[0, '#6a4426'], [1, '#3a2212']]));
      rect(c, 350, 580, 680, 140, lg(c, 0, 580, 0, 720, [[0, '#3a2212'], [1, '#150b05']])); rect(c, 350, 578, 680, 4, GOLDD);
      [380, 800].forEach(x => { rect(c, x, 596, 200, 50, '#2a180c'); c.strokeStyle = GOLDD; c.lineWidth = 2; c.strokeRect(x + 4, 600, 192, 42); rect(c, x + 84, 616, 32, 7, GOLD); }); rect(c, 380, 656, 200, 50, '#2a180c'); rect(c, 464, 676, 32, 7, GOLD);
      /* typewriter, lamp, phone, ashtray */
      rect(c, 650, 510, 100, 34, '#0c0c14'); rect(c, 660, 494, 80, 18, '#16161f'); rect(c, 668, 466, 64, 30, '#efe6cf'); for (let i = 0; i < 4; i++) rect(c, 674, 472 + i * 6, 40 + (i % 2) * 12, 2, '#555'); for (let i = 0; i < 9; i++) circ(c, 660 + i * 10, 538, 3, '#d8d0b8');
      rect(c, 868, 520, 60, 8, GOLDD); line(c, 898, 520, 898, 484, GOLDD, 5); c.fillStyle = '#12805c'; c.beginPath(); c.ellipse(898, 482, 46, 16, 0, Math.PI, TAU); c.fill(); rect(c, 852, 480, 92, 5, '#0a4a36'); glow(c, 898, 500, 150, '#bfffcf', 0.4); ell(c, 898, 550, 110, 22, 'rgba(190,255,210,.14)');
      rect(c, 470, 520, 64, 22, '#0a0a12'); c.strokeStyle = '#0a0a12'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(470, 512); c.quadraticCurveTo(502, 496, 534, 512); c.stroke(); circ(c, 502, 530, 8, '#2a2a3a');
      ell(c, 590, 548, 22, 7, '#3a3a4a'); rect(c, 590, 540, 22, 3, '#efe6cf'); circ(c, 612, 541, 2, '#ff7a2a');
      poly(c, [770, 548, 846, 544, 852, 566, 776, 570], '#efe6cf'); poly(c, [786, 552, 840, 549, 842, 556, 788, 559], '#b0a890');
      /* wastebasket */
      poly(c, [270, 590, 334, 590, 324, 660, 280, 660], '#2a2c36'); for (let k = 0; k < 6; k++) line(c, 276 + k * 11, 592, 284 + k * 8, 658, 'rgba(0,0,0,.4)', 2); circ(c, 296, 586, 10, '#d8d0b8'); circ(c, 314, 590, 8, '#efe6cf');
    },
    fx(c, t) {
      c.save(); c.translate(560, 50); c.rotate(t * 2.2); for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.fillStyle = 'rgba(10,10,20,.8)'; c.beginPath(); c.ellipse(74, 0, 70, 12, 0, 0, TAU); c.fill(); } c.restore();
      const sweep = (t * 0.12) % 1;
      c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,240,200,${0.07 * Math.sin(sweep * Math.PI)})`; c.fillRect(760 + sweep * 430 - 60, 90, 120, 350); c.restore();
      A.smoke(c, 612, 540, t, 'rgba(220,220,255,.4)', 2);
      glow(c, 1100, 200, 280, '#ff3c8a', (Math.sin(t * 1.4) > 0 ? 0.08 : 0.02));
    }
  };

  L.casino = {
    name: 'the Gilded Lily Casino', short: 'The Gilded Lily', staff: 'Croupier', tag: 'The house always wins. Usually.', mood: 'warm',
    body: [420, 650], spots: [
      { n: 'Roulette Table', x: 560, y: 478 }, { n: 'Card Table', x: 980, y: 610 }, { n: 'Cashier\'s Cage', x: 1050, y: 330, kind: 'safe' }, { n: 'Slot Machines', x: 190, y: 380 },
      { n: 'Lily Emblem', x: 640, y: 200 }, { n: 'Velvet Rope', x: 300, y: 640 }, { n: 'Champagne Tower', x: 800, y: 380 }],
    draw(c, r) {
      rect(c, 0, 0, W, H, lg(c, 0, 0, 0, 520, [[0, '#04140f'], [0.65, '#0f3a2a'], [1, '#07201a']]));
      for (let x = 30; x < W; x += 120) { rect(c, x, 60, 60, 440, 'rgba(217,178,95,.05)'); chevrons(c, x + 10, 80, 40, 400, 16, 'rgba(217,178,95,.12)', 1.5); }
      rect(c, 0, 50, W, 12, goldG(c, 0, 50, W, 12)); rect(c, 0, 496, W, 10, goldG(c, 0, 496, W, 10));
      /* lily emblem */
      circ(c, 640, 200, 96, '#06100c', GOLD, 5); sunburst(c, 640, 200, 20, 90, 24, 0, TAU, 'rgba(217,178,95,.4)');
      [[0, 1.15], [-0.6, 0.9], [0.6, 0.9]].forEach(([a, s]) => { c.save(); c.translate(640, 236); c.rotate(a); c.fillStyle = goldG(c, -20, -80, 40, 80); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-26 * s, -40 * s, 0, -84 * s); c.quadraticCurveTo(26 * s, -40 * s, 0, 0); c.fill(); c.restore(); });
      rect(c, 620, 232, 40, 8, GOLD2); glow(c, 640, 200, 190, '#ffe0a0', 0.25);
      /* slots */
      [70, 160, 250].forEach((x, i) => { rect(c, x, 290, 78, 200, lg(c, x, 0, x + 78, 0, [[0, '#c9a14a'], [0.5, '#f4dd9a'], [1, '#7a5a20']])); zig(c, x + 39, 290, 78, 26, 3, GOLD); rect(c, x + 8, 320, 62, 46, '#efe6cf'); for (let k = 0; k < 3; k++) { rect(c, x + 10 + k * 20, 322, 18, 42, '#fff'); circ(c, x + 19 + k * 20, 343, 6, ['#a52433', '#12805c', '#e8c468'][(i + k) % 3]); } rect(c, x + 8, 376, 62, 50, '#7a1420'); circ(c, x + 39, 401, 14, GOLD2); rect(c, x + 16, 440, 46, 14, '#111'); line(c, x + 80, 380, x + 92, 320, GOLDD, 5); circ(c, x + 92, 316, 8, '#a52433'); glow(c, x + 39, 340, 70, '#ffe6a0', 0.35); });
      /* cashier's cage */
      rect(c, 920, 210, 260, 250, '#0a1c16'); zig(c, 1050, 210, 280, 30, 3, GOLD); rect(c, 936, 236, 228, 190, '#ffd98a'); glow(c, 1050, 330, 210, '#ffd08a', 0.35);
c.save(); c.beginPath(); c.rect(936, 236, 228, 190); c.clip(); man(c, 1050, 480, 1.9, '#07120e'); c.restore(); for (let x = 936; x <= 1164; x += 19) line(c, x, 236, x, 426, '#6a4a14', 4); line(c, 936, 300, 1164, 300, '#6a4a14', 3); rect(c, 936, 420, 228, 10, goldG(c, 936, 0, 228, 10));
      c.font = '20px Limelight, serif'; c.textAlign = 'center'; c.fillStyle = GOLD2; c.fillText('CASHIER', 1050, 456);
      /* champagne tower */
      rect(c, 760, 430, 80, 70, '#3a1420'); rect(c, 754, 426, 92, 6, GOLD);
      for (let j = 0; j < 5; j++) for (let i = 0; i <= j; i++) { const x = 800 - j * 9 + i * 18, y = 330 + j * 20; poly(c, [x - 8, y, x + 8, y, x, y + 10], 'rgba(255,236,170,.85)'); line(c, x, y + 10, x, y + 18, 'rgba(255,236,170,.8)', 1.5); } glow(c, 800, 380, 90, '#ffe6a0', 0.35);
      chandelier(c, 560, 0, 1.25);
      /* floor: deco carpet */
      rect(c, 0, 506, W, 214, lg(c, 0, 506, 0, 720, [[0, '#3a0c1a'], [1, '#12040a']]));
      for (let j = 0; j < 6; j++) for (let i = -2; i < 14; i++) { const y = 520 + j * j * 6.5, s = 0.5 + j * 0.2, x = 640 + (i * 110 - 600 + (j % 2) * 55) * s; fan(c, x, y + 26 * s, 36 * s, 'rgba(217,178,95,.10)', 'rgba(0,0,0,0)', 3); }
      /* roulette */
      man(c, 560, 500, 1.8, '#06100c', 'rgba(255,224,160,.8)'); woman(c, 700, 496, 1.7, '#06100c', 'rgba(255,224,160,.8)');
      ell(c, 560, 496, 300, 64, '#2a1208'); ell(c, 560, 486, 300, 64, '#5a2a14'); ell(c, 560, 482, 280, 56, lg(c, 280, 0, 840, 0, [[0, '#0f6a48'], [1, '#07402c']]));
      ell(c, 400, 478, 92, 34, '#2a1208', GOLD, 3);
      for (let i = 0; i < 24; i++) { const a0 = i * TAU / 24, a1 = (i + 1) * TAU / 24; c.beginPath(); c.moveTo(400, 478); c.ellipse(400, 478, 80, 28, 0, a0, a1); c.closePath(); c.fillStyle = i % 2 ? '#a52433' : '#111'; c.fill(); }
      ell(c, 400, 478, 44, 15, '#6a4a14'); ell(c, 400, 476, 14, 5, GOLD2); line(c, 400, 476, 400, 452, GOLD, 3); circ(c, 400, 450, 4, GOLD2);
      for (let i = 0; i < 9; i++) for (let j = 0; j < 3; j++) { c.strokeStyle = 'rgba(244,221,154,.6)'; c.lineWidth = 1; c.strokeRect(520 + i * 30 + j * 5, 456 + j * 14, 30, 14); }
      [[610, 500, '#a52433'], [640, 506, '#e8c468'], [700, 496, '#1f3f6a'], [760, 478, '#efe6cf']].forEach(([x, y, col]) => { for (let k = 0; k < 4; k++) ell(c, x, y - k * 3, 9, 3.5, col, 'rgba(0,0,0,.5)', 0.8); });
      man(c, 236, 590, 2.1, '#06100c', 'rgba(255,224,160,.7)');
      /* card table */
      c.fillStyle = '#2a1208'; c.beginPath(); c.ellipse(980, 650, 250, 90, 0, Math.PI, TAU); c.lineTo(1230, 720); c.lineTo(730, 720); c.closePath(); c.fill();
      c.fillStyle = lg(c, 740, 0, 1220, 0, [[0, '#12805c'], [1, '#07402c']]); c.beginPath(); c.ellipse(980, 660, 230, 80, 0, Math.PI, TAU); c.lineTo(1210, 720); c.lineTo(750, 720); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(244,221,154,.5)'; c.lineWidth = 2; c.beginPath(); c.ellipse(980, 664, 180, 56, 0, Math.PI, TAU); c.stroke();
      [[900, 640, -0.3], [930, 632, -0.1], [960, 630, 0.1], [1060, 650, 0.3], [1086, 660, 0.5]].forEach(([x, y, a], i) => { c.save(); c.translate(x, y); c.rotate(a); rect(c, -13, -19, 26, 38, '#fbf6e6'); c.fillStyle = i % 2 ? '#a52433' : '#111'; c.font = '16px Limelight, serif'; c.textAlign = 'center'; c.fillText(['A', 'K', 'Q', '7', 'J'][i], 0, 6); c.restore(); });
      [[1010, 690, '#a52433'], [1036, 694, '#e8c468'], [860, 690, '#111']].forEach(([x, y, col]) => { for (let k = 0; k < 6; k++) ell(c, x, y - k * 4, 13, 5, col, 'rgba(255,255,255,.35)', 1); });
      /* velvet rope */
      [140, 320].forEach(x => { rect(c, x - 4, 560, 8, 130, goldG(c, x - 4, 0, 8, 130)); circ(c, x, 556, 10, GOLD2); ell(c, x, 692, 22, 6, GOLD); });
      c.strokeStyle = '#a52433'; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(140, 574); c.quadraticCurveTo(230, 650, 320, 574); c.stroke();
      c.strokeStyle = 'rgba(255,150,170,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(140, 571); c.quadraticCurveTo(230, 646, 320, 571); c.stroke();
      bust(c, 1200, 716, 2.5, '#040a08', 'rgba(255,224,160,.75)', 1);
    },
    fx(c, t) {
      [70, 160, 250].forEach((x, i) => glow(c, x + 39, 300, 50, ['#ff3c8a', '#ffe36a', '#7fe0d0'][Math.floor(t * 3 + i) % 3], 0.3));
      A.motes(c, t, '#ffe6a0', 0.45);
      glow(c, 560, 90, 380, '#ffd98a', 0.03 + 0.012 * Math.sin(t * 2.4));
    }
  };

  /* draped body + evidence marker, drawn live at the crime scene */
  A.bodyMark = function (c, x, y, t) {
    c.save(); c.translate(x, y);
    ell(c, 6, 14, 120, 20, 'rgba(0,0,0,.45)');
    c.fillStyle = lg(c, -100, -20, 100, 20, [[0, '#f1ecdf'], [0.5, '#b9b4c8'], [1, '#7a7696']]);
    c.beginPath(); c.moveTo(-112, 12); c.quadraticCurveTo(-104, -22, -70, -24); c.quadraticCurveTo(-30, -34, 10, -22); c.quadraticCurveTo(60, -30, 96, -8); c.quadraticCurveTo(116, 4, 108, 18); c.quadraticCurveTo(0, 28, -112, 12); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(40,30,80,.35)'; c.lineWidth = 2;
    [[-60, -22, -50, 16], [-10, -24, -4, 20], [40, -22, 44, 18]].forEach(p => { c.beginPath(); c.moveTo(p[0], p[1]); c.quadraticCurveTo(p[0] + 12, 0, p[2], p[3]); c.stroke(); });
    c.fillStyle = 'rgba(150,20,40,.75)'; c.beginPath(); c.ellipse(-80, 18, 34, 8, 0.1, 0, TAU); c.fill();
    c.restore();
  };

  /* shared cache of painted scenes */
  const cache = {};
  A.scene = function (id, q) {
    const key = id + '@' + q;
    if (!cache[key]) {
      const cv = A.canvas(W, H, q);
      L[id].draw(cv.x, G.rng(G.hashStr(id) + 11));
      cache[key] = cv.c;
    }
    return cache[key];
  };
  A.clearScenes = function () { for (const k in cache) delete cache[k]; };
  Object.keys(L).forEach(id => { L[id].id = id; });
})();
