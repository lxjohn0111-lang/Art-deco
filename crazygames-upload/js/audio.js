'use strict';
/* GILDED MIDNIGHT — generative noir jazz combo + rain + vinyl crackle + SFX, all WebAudio, no samples */
(function () {
  const G = window.G;
  let ctx = null, master, musicBus, sfxBus, rev, revIn, noiseBuf, timer = null;
  const inst = {};      // per-instrument gain nodes
  const amb = {};
  const vol = { music: 0.7, sfx: 0.8 };
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  const CH = {
    m7: { t: [0, 3, 7, 10], s: [0, 2, 3, 5, 7, 9, 10] },
    m6: { t: [0, 3, 7, 9], s: [0, 2, 3, 5, 7, 9, 11] },
    7: { t: [0, 4, 7, 10], s: [0, 1, 4, 5, 7, 8, 10] },
    9: { t: [0, 4, 7, 10], s: [0, 2, 4, 5, 7, 9, 10] },
    m7b5: { t: [0, 3, 6, 10], s: [0, 1, 3, 5, 6, 8, 10] },
    M7: { t: [0, 4, 7, 11], s: [0, 2, 4, 5, 7, 9, 11] }
  };
  const PROG = {
    blues: [[[0, 'm7']], [[5, 'm7']], [[0, 'm7']], [[0, 'm7']], [[5, 'm7']], [[5, 'm7']], [[0, 'm7']], [[0, 'm7']], [[8, '9']], [[7, '7']], [[0, 'm7']], [[2, 'm7b5'], [7, '7']]],
    ballad: [[[0, 'm6']], [[9, 'm7b5']], [[2, 'm7b5']], [[7, '7']], [[3, 'M7']], [[8, 'M7']], [[2, 'm7b5'], [7, '7']], [[0, 'm6']]],
    tense: [[[0, 'm7']], [[0, 'm7']], [[8, '9']], [[7, '7']]],
    chase: [[[0, 'm7']], [[10, '9']], [[8, '9']], [[7, '7']]]
  };
  const MOODS = {
    menu: { prog: 'ballad', tempo: 74, key: 36, mix: { bass: 0.85, drums: 0.5, piano: 0.6, lead: 0.7 }, lead: 'sax', dens: 0.6, rain: 0.5, two: true },
    map: { prog: 'blues', tempo: 104, key: 41, mix: { bass: 0.9, drums: 0.8, piano: 0.6, lead: 0.6 }, lead: 'trumpet', dens: 0.5, rain: 0.35 },
    scene: { prog: 'blues', tempo: 92, key: 38, mix: { bass: 0.9, drums: 0.6, piano: 0.5, lead: 0.45 }, lead: 'vibes', dens: 0.4, rain: 0.3 },
    talk: { prog: 'tense', tempo: 84, key: 33, mix: { bass: 1, drums: 0.42, piano: 0.34, lead: 0.0 }, lead: 'vibes', dens: 0, rain: 0.25 },
    accuse: { prog: 'chase', tempo: 128, key: 40, mix: { bass: 1, drums: 1, piano: 0.7, lead: 0.55 }, lead: 'trumpet', dens: 0.7, rain: 0.2 },
    result: { prog: 'ballad', tempo: 82, key: 38, mix: { bass: 0.8, drums: 0.5, piano: 0.7, lead: 0.75 }, lead: 'sax', dens: 0.7, rain: 0.3, two: true }
  };
  const st = { mood: 'menu', M: MOODS.menu, bar: 0, tick: 0, next: 0, lastBass: 40, leadDeg: 7, leadOn: false, leadLeft: 0, comp: [0], on: false };
  const rnd = Math.random, pick = a => a[Math.floor(rnd() * a.length)];

  function init() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try { ctx = new AC(); } catch (e) { return false; }
    master = ctx.createGain();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 4;
    const outTrim = ctx.createGain(); outTrim.gain.value = 0.7;   /* headroom after the compressor */
    master.connect(comp); comp.connect(outTrim); outTrim.connect(ctx.destination);
    musicBus = ctx.createGain(); sfxBus = ctx.createGain();
    musicBus.connect(master); sfxBus.connect(master);
    /* generated room reverb */
    rev = ctx.createConvolver();
    const len = Math.floor(ctx.sampleRate * 2.6), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (rnd() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    rev.buffer = ir;
    revIn = ctx.createGain(); revIn.gain.value = 0.9;
    const revOut = ctx.createGain(); revOut.gain.value = 0.5;
    revIn.connect(rev); rev.connect(revOut); revOut.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = rnd() * 2 - 1;
    ['bass', 'drums', 'piano', 'lead'].forEach(n => {
      const g = ctx.createGain(); g.gain.value = 0; g.connect(musicBus);
      const s = ctx.createGain(); s.gain.value = { bass: 0.04, drums: 0.16, piano: 0.3, lead: 0.42 }[n]; g.connect(s); s.connect(revIn);
      inst[n] = g;
    });
    /* rain bed */
    const rs = ctx.createBufferSource(); rs.buffer = noiseBuf; rs.loop = true;
    const rf = ctx.createBiquadFilter(); rf.type = 'bandpass'; rf.frequency.value = 1400; rf.Q.value = 0.25;
    const rh = ctx.createBiquadFilter(); rh.type = 'highpass'; rh.frequency.value = 500;
    amb.rain = ctx.createGain(); amb.rain.gain.value = 0;
    rs.connect(rf); rf.connect(rh); rh.connect(amb.rain); amb.rain.connect(musicBus); rs.start();
    /* vinyl crackle */
    const cb = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate), cd = cb.getChannelData(0);
    for (let i = 0; i < cd.length; i++) cd[i] = rnd() < 0.0009 ? (rnd() * 2 - 1) * (0.3 + rnd() * 0.7) : (rnd() * 2 - 1) * 0.012;
    const cs = ctx.createBufferSource(); cs.buffer = cb; cs.loop = true;
    const cf = ctx.createBiquadFilter(); cf.type = 'highpass'; cf.frequency.value = 1200;
    amb.crackle = ctx.createGain(); amb.crackle.gain.value = 0.22;
    cs.connect(cf); cf.connect(amb.crackle); amb.crackle.connect(musicBus); cs.start();
    applyVol();
    return true;
  }
  function applyVol() {
    if (!ctx) return;
    const silent = G.sdk.muted || G.sdk.adActive || document.hidden;
    master.gain.setTargetAtTime(silent ? 0 : 1, ctx.currentTime, 0.05);
    musicBus.gain.setTargetAtTime(vol.music * 0.9, ctx.currentTime, 0.05);
    sfxBus.gain.setTargetAtTime(vol.sfx, ctx.currentTime, 0.05);
  }

  /* ---------- voices ---------- */
  function env(g, t, a, peak, d, sus, dur, rel) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * sus), t + a + d);
    g.gain.setValueAtTime(Math.max(0.0001, peak * sus), t + Math.max(a + d, dur));
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(a + d, dur) + rel);
  }
  function osc(type, f, t, stop, dest, detune) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t);
    if (detune) o.detune.value = detune;
    o.connect(dest); o.start(t); o.stop(stop);
    return o;
  }
  function noise(t, dur, type, freq, q, peak, dest, decay) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q || 0.7;
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, t); g.gain.exponentialRampToValueAtTime(0.0001, t + (decay || dur));
    s.connect(f); f.connect(g); g.connect(dest);
    s.start(t, rnd() * 1.5); s.stop(t + dur + 0.05);
    return { f, g };
  }
  function bass(m, t, dur, v) {
    const g = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(260, t + 0.25); lp.Q.value = 1.2;
    env(g, t, 0.008, 0.6 * v, 0.16, 0.5, dur * 0.8, 0.12);
    const f = mtof(m);
    const o = osc('triangle', f * 0.985, t, t + dur + 0.3, lp); o.frequency.exponentialRampToValueAtTime(f, t + 0.04);
    osc('sine', f, t, t + dur + 0.3, lp);
    lp.connect(g); g.connect(inst.bass);
    noise(t, 0.03, 'bandpass', 1800, 2, 0.05 * v, inst.bass);
  }
  function pianoNote(m, t, dur, v) {
    const g = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(2600, t); lp.frequency.exponentialRampToValueAtTime(700, t + 0.6);
    env(g, t, 0.006, 0.16 * v, 0.5, 0.3, dur, 0.5);
    const f = mtof(m);
    osc('triangle', f, t, t + dur + 0.7, lp, -4); osc('sine', f, t, t + dur + 0.7, lp, 5); osc('sine', f * 2, t, t + dur + 0.7, lp).frequency.value = f * 2.002;
    lp.connect(g); g.connect(inst.piano);
  }
  function leadNote(kind, m, t, dur, v) {
    const g = ctx.createGain(), f = mtof(m);
    if (kind === 'vibes') {
      env(g, t, 0.004, 0.2 * v, 0.9, 0.12, Math.max(dur, 0.6), 0.9);
      const trem = ctx.createGain(); trem.gain.value = 0.75;
      const lfo = osc('sine', 5.2, t, t + dur + 2, trem.gain); lfo.disconnect(); const lg = ctx.createGain(); lg.gain.value = 0.25; lfo.connect(lg); lg.connect(trem.gain);
      osc('sine', f, t, t + dur + 2, trem); const h = ctx.createGain(); h.gain.value = 0.18; osc('sine', f * 4, t, t + 0.4, h); h.connect(trem);
      trem.connect(g); g.connect(inst.lead);
      return;
    }
    const filt = ctx.createBiquadFilter();
    if (kind === 'trumpet') { filt.type = 'bandpass'; filt.frequency.setValueAtTime(1500, t); filt.Q.value = 2.6; }
    else { filt.type = 'lowpass'; filt.frequency.setValueAtTime(700, t); filt.frequency.linearRampToValueAtTime(1900, t + 0.09); filt.frequency.linearRampToValueAtTime(1100, t + dur); filt.Q.value = 2.2; }
    env(g, t, 0.045, (kind === 'trumpet' ? 0.3 : 0.19) * v, 0.1, 0.8, dur, 0.09);
    const o1 = osc('sawtooth', f, t, t + dur + 0.2, filt), o2 = osc(kind === 'trumpet' ? 'sawtooth' : 'square', f, t, t + dur + 0.2, filt, 7);
    o1.frequency.setValueAtTime(f * 0.972, t); o1.frequency.exponentialRampToValueAtTime(f, t + 0.06);
    if (dur > 0.28) {
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 5.4; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.011, t + dur * 0.7);
      lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency); lfo.start(t); lfo.stop(t + dur + 0.2);
    }
    filt.connect(g); g.connect(inst.lead);
    if (kind === 'sax') noise(t, dur, 'bandpass', 2400, 1, 0.012 * v, inst.lead, dur * 1.2);
  }

  /* ---------- the band ---------- */
  function chordAt(bar, beat) {
    const p = PROG[st.M.prog], b = p[bar % p.length];
    return b.length > 1 && beat >= 2 ? b[1] : b[0];
  }
  function nearest(pc, around) { let m = around - ((around - pc) % 12 + 12) % 12; if (around - m > 6) m += 12; return m; }
  function schedule(t) {
    const M = st.M, tick = st.tick, beat = Math.floor(tick / 3), sub = tick % 3;
    const td = 60 / M.tempo / 3, ch = chordAt(st.bar, beat), C = CH[ch[1]], root = M.key + ch[0];
    /* bass */
    if (sub === 0 && (!M.two || beat % 2 === 0)) {
      let n;
      const nxt = beat === 3 ? chordAt(st.bar + 1, 0) : chordAt(st.bar, beat + 1);
      const first = beat === 0 || (PROG[M.prog][st.bar % PROG[M.prog].length].length > 1 && beat === 2);
      if (first) n = nearest(root % 12, st.lastBass);
      else if (beat === 3 || (M.two && beat === 2)) { const target = nearest((M.key + nxt[0]) % 12, st.lastBass); n = M.two ? nearest((root + 7) % 12, st.lastBass) : target + (rnd() < 0.5 ? 1 : -1); }
      else n = nearest((root + pick(C.t.concat(C.s))) % 12, st.lastBass + pick([-3, 2, 4]));
      while (n < M.key - 8) n += 12; while (n > M.key + 16) n -= 12;
      st.lastBass = n;
      bass(n, t, td * (M.two ? 5.4 : 2.7), first ? 1 : 0.82);
    } else if (sub === 2 && !M.two && rnd() < 0.1) bass(st.lastBass, t, td * 0.8, 0.4);
    /* drums */
    const D = inst.drums;
    if (!M.two) {
      if (tick === 0 || tick === 3 || tick === 5 || tick === 6 || tick === 9 || tick === 11) noise(t, 0.3, 'highpass', 7500, 0.8, (tick === 3 || tick === 9 ? 0.085 : 0.055) * (0.8 + rnd() * 0.4), D, tick === 5 || tick === 11 ? 0.09 : 0.22);
      if ((tick === 0 || tick === 6) && rnd() < 0.7) { const g = ctx.createGain(); env(g, t, 0.004, 0.32, 0.1, 0.01, 0.1, 0.05); const o = osc('sine', 70, t, t + 0.25, g); o.frequency.exponentialRampToValueAtTime(38, t + 0.14); g.connect(D); }
      if ((tick === 5 || tick === 8 || tick === 11) && rnd() < 0.16) noise(t, 0.1, 'bandpass', 2300, 1.2, 0.09, D, 0.08);
    }
    if (tick === 3 || tick === 9) noise(t, 0.06, 'highpass', 9000, 1, 0.07, D, 0.04);
    if (sub === 0) { const n = noise(t, td * 3, 'bandpass', 1900, 0.6, 0.0001, D, td * 3); n.g.gain.cancelScheduledValues(t); n.g.gain.setValueAtTime(0.0001, t); n.g.gain.linearRampToValueAtTime(beat % 2 ? 0.05 : 0.03, t + td * 1.2); n.g.gain.exponentialRampToValueAtTime(0.0001, t + td * 3); }
    /* piano comping */
    if (tick === 0) st.comp = pick(M.two ? [[0], [0, 8], [5], [0, 6]] : [[0], [0, 5], [2, 8], [5], [0, 8], [3, 11], [2], [5, 9], []]);
    if (st.comp.indexOf(tick) > -1) {
      const tones = [C.t[1], C.t[3], 14, C.t[2]].map(x => 55 + (((root + x) % 12) - 55 % 12 + 12) % 12).sort((a, b) => a - b);
      const long = M.two || tick === 0 || rnd() < 0.3;
      tones.forEach((n, i) => pianoNote(n, t + i * (M.two ? 0.035 : 0.006), long ? td * 5 : td * 1.2, 0.8 + rnd() * 0.3));
    }
    /* lead improvisation: stepwise phrases that land on chord tones */
    if (M.dens > 0) {
      if (tick === 0 && !st.leadOn && rnd() < M.dens) { st.leadOn = true; st.leadLeft = 3 + Math.floor(rnd() * 6); st.leadDeg = 7 + Math.floor(rnd() * 5); }
      const swing8 = sub === 0 || sub === 2;
      if (st.leadOn && swing8 && (tick > 0 || rnd() < 0.5) && rnd() < (M.two ? 0.5 : 0.78)) {
        const scale = C.s, last = st.leadLeft <= 1;
        st.leadDeg += pick([-1, -1, 1, 1, 1, -2, 2, last ? 0 : 3]);
        st.leadDeg = Math.max(4, Math.min(15, st.leadDeg));
        let pc = scale[st.leadDeg % 7], oct = Math.floor(st.leadDeg / 7);
        if (last) { pc = pick(C.t); }
        const base = 48 + (root % 12);
        const n = base + pc + oct * 12;
        const dur = last ? td * (4 + rnd() * 4) : td * (sub === 0 ? 1.9 : 1.05);
        leadNote(M.lead, n, t + (sub === 2 ? td * 0.08 : 0), dur, 0.75 + rnd() * 0.3);
        if (--st.leadLeft <= 0) st.leadOn = false;
      }
    }
    st.tick++;
    if (st.tick >= 12) { st.tick = 0; st.bar++; }
    st.next = t + td;
  }
  function pump() {
    if (!ctx || !st.on || ctx.state !== 'running') return;
    if (st.next < ctx.currentTime) st.next = ctx.currentTime + 0.06;
    while (st.next < ctx.currentTime + 0.22) schedule(st.next);
  }
  function setMix() {
    const M = st.M, t = ctx.currentTime;
    for (const k in inst) inst[k].gain.setTargetAtTime(M.mix[k], t, 0.6);
    amb.rain.gain.setTargetAtTime(M.rain * 0.22, t, 1.2);
  }

  /* ---------- SFX ---------- */
  function blip(f, dur, type, v, when, slideTo) {
    const t = ctx.currentTime + (when || 0), g = ctx.createGain();
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const o = osc(type || 'sine', f, t, t + dur + 0.02, g);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.connect(sfxBus);
    return g;
  }
  function vib(m, when, v) {
    const t = ctx.currentTime + when, g = ctx.createGain();
    env(g, t, 0.004, v, 0.7, 0.1, 0.7, 0.8);
    osc('sine', mtof(m), t, t + 1.8, g); const h = ctx.createGain(); h.gain.value = 0.2; osc('sine', mtof(m) * 4, t, t + 0.3, h); h.connect(g);
    g.connect(sfxBus); const s = ctx.createGain(); s.gain.value = 0.4; g.connect(s); s.connect(revIn);
  }
  function brass(notes, when, dur, v) {
    const t = ctx.currentTime + when, g = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(2600, t + 0.07); lp.frequency.linearRampToValueAtTime(900, t + dur);
    env(g, t, 0.03, v, 0.1, 0.7, dur, 0.25);
    notes.forEach(n => { osc('sawtooth', mtof(n), t, t + dur + 0.4, lp, rnd() * 10 - 5); });
    lp.connect(g); g.connect(sfxBus); const s = ctx.createGain(); s.gain.value = 0.35; g.connect(s); s.connect(revIn);
  }
  const SFX = {
    click() { blip(1500, 0.03, 'triangle', 0.12); noise(ctx.currentTime, 0.02, 'highpass', 5000, 1, 0.06, sfxBus); },
    hover() { blip(2200, 0.02, 'sine', 0.035); },
    page() { const n = noise(ctx.currentTime, 0.16, 'bandpass', 3200, 0.8, 0.16, sfxBus, 0.15); n.f.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.15); },
    found() { [72, 75, 79, 82, 86].forEach((m, i) => vib(m, i * 0.07, 0.2)); },
    lead() { [79, 84].forEach((m, i) => vib(m, i * 0.08, 0.14)); },
    good() { brass([48, 55, 63, 67, 70, 74], 0, 0.9, 0.09); [79, 82, 86, 91].forEach((m, i) => vib(m, 0.1 + i * 0.09, 0.16)); },
    bad() { brass([41, 42, 47], 0, 0.8, 0.12); blip(110, 0.7, 'sawtooth', 0.05, 0, 55); },
    stamp() { blip(100, 0.2, 'sine', 0.5, 0, 36); noise(ctx.currentTime, 0.12, 'lowpass', 900, 0.7, 0.4, sfxBus, 0.1); },
    tick() { blip(2800, 0.012, 'square', 0.03); blip(1300, 0.03, 'sine', 0.05, 0.004); },
    pin() { noise(ctx.currentTime, 0.03, 'highpass', 4000, 1, 0.2, sfxBus); blip(1400, 0.06, 'triangle', 0.12); },
    fail() { blip(120, 0.22, 'square', 0.1); blip(90, 0.25, 'square', 0.08, 0.1); },
    dial() { blip(900, 0.012, 'square', 0.04); },
    dialHot() { blip(1500, 0.03, 'triangle', 0.1); },
    open() { blip(80, 0.3, 'sine', 0.5, 0, 40); noise(ctx.currentTime, 0.2, 'lowpass', 600, 0.7, 0.3, sfxBus, 0.2); [60, 67, 72, 79].forEach((m, i) => vib(m, 0.15 + i * 0.07, 0.16)); },
    type() { noise(ctx.currentTime, 0.025, 'bandpass', 2600, 2, 0.05, sfxBus, 0.02); },
    travel() { const t = ctx.currentTime, g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.2, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5); const o = osc('sawtooth', 48, t, t + 1.6, lp); o.frequency.linearRampToValueAtTime(96, t + 0.8); o.frequency.linearRampToValueAtTime(60, t + 1.5); osc('square', 24, t, t + 1.6, lp); lp.connect(g); g.connect(sfxBus); const n = noise(t, 1.4, 'bandpass', 500, 0.5, 0.08, sfxBus, 1.4); n.f.frequency.exponentialRampToValueAtTime(2400, t + 0.7); },
    flash() { noise(ctx.currentTime, 0.1, 'highpass', 3000, 1, 0.25, sfxBus, 0.08); blip(3600, 0.5, 'sine', 0.04, 0.02, 5200); },
    cash() { blip(1568, 0.25, 'sine', 0.14); blip(2093, 0.4, 'sine', 0.14, 0.08); blip(3136, 0.3, 'sine', 0.06, 0.08); },
    rank() { [60, 64, 67, 72].forEach((m, i) => brass([m, m + 7], i * 0.13, 0.2, 0.09)); brass([60, 64, 67, 71, 74], 0.55, 1.2, 0.08); [84, 88, 91].forEach((m, i) => vib(m, 0.6 + i * 0.1, 0.16)); },
    sting() { brass([28, 40, 47, 50], 0, 1.6, 0.13); const n = noise(ctx.currentTime, 1.6, 'highpass', 6000, 0.7, 0.0001, sfxBus, 1.6); n.g.gain.cancelScheduledValues(ctx.currentTime); n.g.gain.setValueAtTime(0.0001, ctx.currentTime); n.g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1); n.g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.6); },
    thunder() { const n = noise(ctx.currentTime, 3.2, 'lowpass', 140, 0.7, 0.5, musicBus, 3); n.f.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 3); }
  };

  G.audio = {
    unlock() {
      if (!init()) return;
      if (ctx.state === 'suspended') ctx.resume();
      if (!st.on) { st.on = true; st.next = ctx.currentTime + 0.1; setMix(); timer = setInterval(pump, 40); setInterval(() => { if (st.M.rain > 0.25 && rnd() < 0.3 && ctx.state === 'running') SFX.thunder(); }, 30000); }
    },
    mood(name) {
      if (st.mood === name) return;
      st.mood = name; st.M = MOODS[name] || MOODS.menu; st.leadOn = false;
      if (ctx && st.on) { st.tick = 0; st.bar = 0; setMix(); }
    },
    sfx(name) { if (!ctx || ctx.state !== 'running' || !SFX[name]) return; try { SFX[name](); } catch (e) { /* never let audio break the game */ } },
    setVol(m, s) { vol.music = m; vol.sfx = s; applyVol(); },
    refresh: applyVol,
    get ready() { return !!ctx; }
  };
  G.sdk.onMute = applyVol;
  document.addEventListener('visibilitychange', applyVol);
})();
