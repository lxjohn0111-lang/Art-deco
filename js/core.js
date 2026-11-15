'use strict';
/* GILDED MIDNIGHT — core: utilities, seeded RNG, CrazyGames SDK bridge, save data */
(function () {
  const G = window.G = { VERSION: '1.0.0', W: 1280, H: 720 };

  G.$ = (s, el) => (el || document).querySelector(s);
  G.$$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  G.el = function (tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  G.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  G.lerp = (a, b, t) => a + (b - a) * t;
  G.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  G.cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  G.wait = ms => new Promise(r => setTimeout(r, ms));

  G.hashStr = function (str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };

  /* mulberry32 seeded RNG with helpers */
  G.rng = function (seed) {
    let a = seed >>> 0;
    const r = function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.f = (lo, hi) => lo + r() * (hi - lo);
    r.int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
    r.pick = arr => arr[Math.floor(r() * arr.length)];
    r.chance = p => r() < p;
    r.shuffle = function (arr) {
      const o = arr.slice();
      for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = o[i]; o[i] = o[j]; o[j] = t; }
      return o;
    };
    return r;
  };

  /* minutes after midnight-start → clock label. Cases begin at 11:40 PM. */
  G.clock = function (mins) {
    let m = (23 * 60 + 40 + Math.round(mins)) % (24 * 60);
    let h = Math.floor(m / 60), mm = m % 60;
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (h === 0) h = 12;
    return h + ':' + (mm < 10 ? '0' : '') + mm + ' ' + ap;
  };
  G.dur = function (mins) {
    mins = Math.max(0, Math.round(mins));
    const h = Math.floor(mins / 60), m = mins % 60;
    return (h ? h + 'h ' : '') + m + 'm';
  };
  G.money = n => '$' + Math.round(n).toLocaleString('en-US');
  G.today = function () {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  };

  /* ------------------------------------------------------------------ */
  /* CrazyGames SDK v3 bridge. Every call is guarded so the game runs    */
  /* identically on CrazyGames, on localhost, and fully offline.         */
  /* ------------------------------------------------------------------ */
  const sdk = G.sdk = {
    api: null, ready: false, env: 'none', playing: false, adActive: false, muted: false,
    onMute: null,

    async init() {
      try {
        if (window.CrazyGames && window.CrazyGames.SDK) {
          await window.CrazyGames.SDK.init();
          this.api = window.CrazyGames.SDK;
          this.env = this.api.environment || 'crazygames';
          this.ready = this.env !== 'disabled';
          try {
            const st = this.api.game.settings;
            if (st && st.muteAudio) this.setMuted(true);
            if (this.api.game.addSettingsChangeListener) {
              this.api.game.addSettingsChangeListener(s => this.setMuted(!!(s && s.muteAudio)));
            }
          } catch (e) { /* settings are optional */ }
        }
      } catch (e) {
        console.warn('[SDK] init failed, running standalone', e);
        this.ready = false;
      }
      return this.ready;
    },
    setMuted(m) { this.muted = m; if (this.onMute) this.onMute(); },
    _call(fn) { if (!this.ready) return; try { fn(this.api); } catch (e) { console.warn('[SDK]', e); } },
    loadingStart() { this._call(a => a.game.loadingStart()); },
    loadingStop() { this._call(a => a.game.loadingStop()); },
    gameplayStart() { if (this.playing) return; this.playing = true; this._call(a => a.game.gameplayStart()); },
    gameplayStop() { if (!this.playing) return; this.playing = false; this._call(a => a.game.gameplayStop()); },
    happytime() { this._call(a => a.game.happytime()); },

    /* type: 'midgame' | 'rewarded'. Resolves true when the ad completed
       (reward may be granted). Standalone builds grant rewarded instantly. */
    ad(type) {
      return new Promise(resolve => {
        if (!this.ready) { resolve(type === 'rewarded'); return; }
        const wasPlaying = this.playing;
        let done = false;
        const finish = ok => {
          if (done) return; done = true;
          this.adActive = false;
          if (this.onMute) this.onMute();
          if (wasPlaying) this.gameplayStart();
          resolve(ok);
        };
        try {
          if (wasPlaying) this.gameplayStop();
          this.api.ad.requestAd(type, {
            adStarted: () => { this.adActive = true; if (this.onMute) this.onMute(); },
            adFinished: () => finish(true),
            adError: () => finish(false)
          });
          setTimeout(() => { if (!this.adActive) finish(false); }, 12000);
        } catch (e) { finish(false); }
      });
    },

    getItem(k) {
      try { if (this.ready && this.api.data) return this.api.data.getItem(k); } catch (e) { /* fall through */ }
      try { return window.localStorage.getItem(k); } catch (e) { return null; }
    },
    setItem(k, v) {
      try { if (this.ready && this.api.data) { this.api.data.setItem(k, v); return; } } catch (e) { /* fall through */ }
      try { window.localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ }
    }
  };

  /* ------------------------------------------------------------------ */
  /* Save data                                                           */
  /* ------------------------------------------------------------------ */
  const KEY = 'gilded_midnight_save_v1';
  const defaults = () => ({
    v: 1, xp: 0, cash: 0, earned: 0, upgrades: {}, ach: {},
    stats: { cases: 0, solved: 0, sRanks: 0, streak: 0, bestStreak: 0, bestScore: 0, totalScore: 0, clues: 0, minis: 0, lies: 0, secrets: 0, wrong: 0, byTier: [0, 0, 0, 0], bosses: 0 },
    archive: [], threads: 0, chapter: 1,
    daily: { last: '', streak: 0, best: 0, lastSolved: '' },
    settings: { music: 0.7, sfx: 0.8, speed: 1 },
    seen: {}, current: null, caseNo: 0
  });
  G.save = {
    d: defaults(), _t: null,
    load() {
      try {
        const raw = sdk.getItem(KEY);
        if (raw) {
          const o = JSON.parse(raw), d = defaults();
          this.d = Object.assign(d, o);
          this.d.stats = Object.assign(defaults().stats, o.stats || {});
          this.d.settings = Object.assign(defaults().settings, o.settings || {});
          this.d.daily = Object.assign(defaults().daily, o.daily || {});
        }
      } catch (e) { console.warn('save load failed', e); this.d = defaults(); }
    },
    commit() {
      clearTimeout(this._t);
      this._t = setTimeout(() => { try { sdk.setItem(KEY, JSON.stringify(this.d)); } catch (e) { /* ignore */ } }, 150);
    },
    reset() { this.d = defaults(); this.commit(); }
  };
})();
