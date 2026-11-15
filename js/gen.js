'use strict';
/* GILDED MIDNIGHT — procedural case generator.
   Every generated case is validated: exactly one suspect is consistent with
   the killer-trait evidence and has no verifiable alibi. */
(function () {
  const G = window.G, D = G.D;

  const pro = g => g === 'f' ? { he: 'she', him: 'her', his: 'her', He: 'She' } : { he: 'he', him: 'him', his: 'his', He: 'He' };
  G.pro = pro;
  const listNames = a => a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
  const relFlavor = {
    suave: 'We had our disagreements, like any two people with money and opinions.',
    nervous: 'We — we got along fine! Mostly. Sometimes. Oh, this looks bad, doesn\'t it?',
    hostile: 'And no, I won\'t pretend I\'m weeping.',
    melancholy: 'I knew the best and the worst of that soul. Mostly the worst.',
    theatrical: 'A relationship of grand passions and grander quarrels!',
    cold: 'It was an arrangement. It suited us both. Until it didn\'t.'
  };

  G.genCase = function (seed, tierId, kind) {
    const T = kind === 'boss' ? D.bossTier : D.tiers[tierId];
    for (let a = 0; a < 80; a++) {
      const c = build((seed + a * 104729) >>> 0, T, kind);
      if (c) { c.seed = seed; c.tier = tierId; c.kind = kind || 'normal'; c.T = T; return c; }
    }
    throw new Error('case generation failed');
  };

  function build(seed, T, kind) {
    const r = G.rng(seed);
    const locIds = r.shuffle(Object.keys(G.LOCS)).slice(0, T.nLoc);
    const crime = locIds[0];
    const locs = r.shuffle(locIds);
    const others = locs.filter(l => l !== crime);
    const LN = l => G.LOCS[l].name;

    /* ---- cast ---- */
    const usedF = new Set(), usedL = new Set();
    const person = function () {
      const g = r.chance(0.5) ? 'f' : 'm';
      let f, l;
      do { f = r.pick(g === 'f' ? D.femaleNames : D.maleNames); } while (usedF.has(f));
      do { l = r.pick(D.lastNames); } while (usedL.has(l));
      usedF.add(f); usedL.add(l);
      return { g, first: f, last: l, name: f + ' ' + l, lookSeed: r.int(1, 1e9) };
    };
    const victim = person();
    victim.occ = r.pick(D.victimOcc);
    victim.traits = { hair: r.pick(D.traitVals.hair), fabric: r.pick(D.traitVals.fabric), smoke: 'nothing' };
    const occs = r.shuffle(D.occupations), rels = r.shuffle(D.relations), mots = r.shuffle(Object.keys(D.motives));
    const sus = [];
    for (let i = 0; i < T.nSus; i++) {
      const p = person();
      p.id = i; p.occ = occs[i]; p.rel = rels[i]; p.pers = r.pick(D.personalities); p.motive = mots[i];
      p.traits = {}; p.pair = null; p.trueLoc = null; p.secret = null;
      for (const k in D.traitVals) p.traits[k] = r.pick(D.traitVals[k]);
      sus.push(p);
    }
    const K = sus[r.int(0, T.nSus - 1)];
    const mt = r.pick(['9:40 PM', '10:05 PM', '10:20 PM', '10:45 PM', '11:00 PM']);
    const nm = id => sus[id].name;

    /* ---- where everyone really was ---- */
    const inn = r.shuffle(sus.filter(s => s !== K));
    const staffKnows = {};
    locs.forEach(l => { staffKnows[l] = l !== crime && r.chance(T.staff); });
    let idx = 0;
    const nPairs = (inn.length >= 6 && r.chance(0.6)) ? 2 : 1;
    for (let p = 0; p < nPairs; p++) {
      const a = inn[idx++], b = inn[idx++], L = r.pick(others);
      a.trueLoc = b.trueLoc = L; a.pair = b.id; b.pair = a.id;
    }
    let secretDone = false;
    for (; idx < inn.length; idx++) {
      const s = inn[idx];
      if (r.chance(0.6)) {
        s.trueLoc = r.pick(others);
        if (!secretDone && r.chance(T.secret * 0.75)) { s.secret = r.pick(D.secrets); secretDone = true; }
      } else s.away = r.pick(D.elsewhere);
    }
    K.trueLoc = crime;
    const mates = s => inn.filter(o => o !== s && o.trueLoc && o.trueLoc === s.trueLoc);
    const verified = s => s !== K && !!s.trueLoc && (s.pair != null || staffKnows[s.trueLoc] || mates(s).some(o => !o.secret));

    /* ---- the killer's story ---- */
    const candX = inn.filter(s => s.trueLoc && !s.secret);
    if (candX.length && r.chance(T.typeA)) { const X = r.pick(candX); K.claimLoc = X.trueLoc; K.claimWith = X.id; }
    else K.away = r.pick(D.elsewhere);

    /* ---- killer-trait evidence ---- */
    let cand = ['hair', 'hand', 'height', 'smoke', 'scent', 'fabric', 'print'].filter(t =>
      !(t === 'smoke' && K.traits.smoke === 'nothing') && !(t === 'scent' && K.traits.scent === 'none'));
    cand = r.shuffle(cand);
    const KT = cand.slice(0, r.int(T.kMin, T.kMax));
    const differs = s => KT.some(t => s.traits[t] !== K.traits[t]);
    const otherVal = (t, v) => r.pick(D.traitVals[t].filter(x => x !== v));
    inn.filter(s => !verified(s)).forEach(s => { if (!differs(s)) { const t = r.pick(KT); s.traits[t] = otherVal(t, K.traits[t]); } });
    KT.forEach(t => {
      if (!inn.some(s => s.traits[t] === K.traits[t])) {
        const s = r.pick(inn);
        s.traits[t] = K.traits[t];
        if (!verified(s) && !differs(s)) { const t2 = r.pick(KT.filter(x => x !== t)); s.traits[t2] = otherVal(t2, K.traits[t2]); }
      }
    });
    let initial = null;
    const L0 = K.last[0];
    if (inn.some(s => s.first[0] === L0 || s.last[0] === L0) && r.chance(0.45)) initial = L0;
    const matchInit = s => !initial || s.first[0] === initial || s.last[0] === initial;
    const consistent = sus.filter(s => !verified(s) && KT.every(t => s.traits[t] === K.traits[t]) && matchInit(s));
    if (consistent.length !== 1 || consistent[0] !== K) return null;

    /* ---- weapons ---- */
    const wIds = Object.keys(D.weapons);
    const W = r.pick(wIds), cls = D.weapons[W].c;
    const weapons = [W, r.pick(wIds.filter(w => w !== W && D.weapons[w].c === cls))];
    const seenC = new Set([cls]);
    for (const w of r.shuffle(wIds)) {
      if (weapons.length >= 4) break;
      if (!seenC.has(D.weapons[w].c)) { weapons.push(w); seenC.add(D.weapons[w].c); }
    }

    /* ---- facts and where they hide ---- */
    const facts = {}, spots = {};
    locs.forEach(l => { spots[l] = G.LOCS[l].spots.map(() => null); });
    const add = f => { facts[f.id] = f; return f; };
    const place = function (loc, fid, wantKind) {
      const sp = G.LOCS[loc].spots, free = [];
      sp.forEach((s, i) => { if (spots[loc][i] == null) free.push(i); });
      if (!free.length) return false;
      let pool = free.filter(i => wantKind ? !!sp[i].kind : !sp[i].kind);
      if (!pool.length) pool = free;
      const i = r.pick(pool);
      spots[loc][i] = fid; facts[fid].loc = loc; facts[fid].spot = i;
      return true;
    };
    const placeAny = function (fid, pref, wantKind) {
      for (const l of pref.concat(r.shuffle(locs))) if (place(l, fid, wantKind)) return true;
      return false;
    };
    const fill = (t, s) => t.replace(/\{S\}/g, s.first).replace(/\{V\}/g, victim.first);
    const spotName = f => G.LOCS[f.loc].spots[f.spot].n;

    /* crime-scene witness may have glimpsed the killer */
    let sightT = null;
    const sightable = KT.filter(t => D.sightLine[t]);
    if (sightable.length && r.chance(0.5)) sightT = r.pick(sightable);

    const hasHand = KT.includes('hand');
    add({
      id: 'coroner', cat: 'phys', icon: 'body', name: 'Coroner\'s Report', loc: crime, spot: 'body', wound: cls,
      text: `${victim.name}, ${victim.occ}. Time of death: around ${mt}. Cause: ${D.wound[cls]}.` + (hasHand ? ' ' + D.traitClue.hand.t(K.traits.hand) : ''),
      k: hasHand ? { t: 'hand', v: K.traits.hand } : null
    });
    KT.forEach(t => {
      if (t === 'hand' || t === sightT) return;
      const tc = D.traitClue[t];
      add({ id: 'k_' + t, cat: 'phys', icon: tc.icon, name: tc.n, text: tc.t(K.traits[t]), k: { t, v: K.traits[t] } });
      if (t !== 'print') place(crime, 'k_' + t, false);
    });
    if (initial) {
      const tc = D.traitClue.initial;
      add({ id: 'k_initial', cat: 'phys', icon: tc.icon, name: tc.n, text: tc.t(initial), k: { t: 'initial', v: initial } });
      place(crime, 'k_initial', false);
    }
    weapons.forEach((w, i) => {
      const wd = D.weapons[w], real = i === 0;
      add({ id: 'w_' + w, cat: 'phys', icon: wd.icon, name: wd.n, weapon: w, real, text: (real ? wd.hot : wd.cold) + (real ? ' This is the murder weapon.' : ' Not the murder weapon.') });
      placeAny('w_' + w, real && r.chance(0.4) ? [crime] : [r.pick(others)], r.chance(0.3));
    });
    sus.forEach(s => {
      if (s !== K && !r.chance(0.75)) return;
      const M = D.motives[s.motive];
      add({ id: 'm_' + s.id, cat: 'doc', icon: M.icon, name: M.doc, sid: s.id, motive: s.motive, text: fill(M.text, s), torn: false });
      placeAny('m_' + s.id, [r.pick(locs)], r.chance(0.5));
      const f = facts['m_' + s.id];
      f.torn = !G.LOCS[f.loc].spots[f.spot].kind && r.chance(0.35);
    });

    /* ---- staff testimony ---- */
    locs.forEach(l => {
      const LOC = G.LOCS[l], here = inn.filter(s => s.trueLoc === l);
      const f = { id: 'staff_' + l, cat: 'talk', icon: 'talk', name: `${LOC.staff} — ${LOC.short}`, staff: l, present: [], denies: [], k: null };
      if (l === crime) {
        if (sightT) {
          f.k = { t: sightT, v: K.traits[sightT] };
          f.text = `I found the body. But just before — around ${mt} — somebody slipped out the side way. ${D.sightLine[sightT](K.traits[sightT])} That was your killer, detective.`;
        } else f.text = `I found ${victim.first} a little before midnight and called it in. Whoever did it was long gone. I wish I had more for you.`;
      } else if (staffKnows[l]) {
        f.present = here.map(s => s.id);
        if (here.length) {
          f.text = `Around ${mt}? ${listNames(here.map(s => s.name))} ${here.length > 1 ? 'were' : 'was'} here — I'd swear to it in court.`;
          here.filter(s => s.secret).forEach(s => { f.text += ` ${s.first} was ${s.secret.what}, and tipped me to keep quiet.`; });
        } else f.text = `Around ${mt}? A quiet night. Nobody on your list was here.`;
        if (K.claimLoc === l) { f.denies = [K.id]; f.text += ` ${K.name}? No. Not here — not at that hour.`; }
      } else f.text = `Around ${mt}? Honestly, detective, I was run off my feet in the back. I couldn't swear to who was here and who wasn't.`;
      const hot = ['w_' + W, 'm_' + K.id].map(id => facts[id]).filter(x => x && x.loc === l);
      if (hot.length && r.chance(T.lead)) {
        const h = r.pick(hot);
        f.text += ` One more thing — somebody was fussing around the ${spotName(h).toLowerCase()} tonight.`;
        f.lead = { loc: l, spot: h.spot };
      }
      add(f);
    });

    /* ---- where the suspects wait tonight ---- */
    r.shuffle(sus).forEach((s, i) => { s.at = locs[i % locs.length]; });

    /* ---- statements ---- */
    sus.forEach(s => {
      const pre = r.pick(D.lines.pre[s.pers]);
      let t, claim = { loc: null, with: [] };
      if (s === K) {
        if (K.claimLoc) { t = `${pre}I was at ${LN(K.claimLoc)}. ${nm(K.claimWith)} was there too — go ahead and ask.`; claim = { loc: K.claimLoc, with: [K.claimWith] }; }
        else t = `${pre}I was ${K.away}. Alone. I'm afraid nobody can vouch for me.`;
      } else if (s.secret) { s.away = r.pick(D.elsewhere); t = `${pre}I was ${s.away}. Alone.`; }
      else if (s.pair != null) { t = `${pre}I was at ${LN(s.trueLoc)} with ${nm(s.pair)}. All evening.`; claim = { loc: s.trueLoc, with: [s.pair] }; }
      else if (s.trueLoc) { t = `${pre}I was at ${LN(s.trueLoc)}. On my own — though the ${G.LOCS[s.trueLoc].staff.toLowerCase()} may remember me.`; claim = { loc: s.trueLoc, with: [] }; }
      else t = `${pre}I was ${s.away}. Alone. No, nobody can vouch for that.`;
      add({ id: 'claim_' + s.id, cat: 'talk', icon: 'talk', name: `${s.name} — alibi`, sid: s.id, text: t, claim });

      let st, saw = [], denies = [];
      if (s === K) {
        if (K.claimLoc) { st = `Like I said — ${nm(K.claimWith)} was at ${LN(K.claimLoc)}. Ask.`; saw = [K.claimWith]; }
        else st = 'Nobody. I told you, I was alone.';
      } else if (s.secret) st = 'No one. I was alone, like I said.';
      else if (s.trueLoc) {
        const m = mates(s);
        saw = m.map(o => o.id);
        if (m.length) {
          st = `${listNames(m.map(o => o.name))} ${m.length > 1 ? 'were' : 'was'} at ${LN(s.trueLoc)} — I saw ${m.length > 1 ? 'them' : pro(m[0].g).him} with my own eyes.`;
          m.filter(o => o.secret).forEach(o => { st += ` ${o.first} seemed anxious not to be noticed.`; });
        } else st = 'Nobody from your list. Only strangers.';
        if (K.claimLoc === s.trueLoc) { denies = [K.id]; st += ` ${K.name}? No. ${K.first} wasn't there. I'd have noticed.`; }
      } else st = 'Not a soul. I was alone, remember?';
      add({ id: 'seen_' + s.id, cat: 'talk', icon: 'talk', name: `${s.name} — who ${pro(s.g).he} saw`, sid: s.id, text: st, saw, denies });

      s.relLine = `I was ${victim.first}'s ${s.rel}. ${relFlavor[s.pers]}`;
    });
    const cyc = r.shuffle(sus);
    cyc.forEach((s, i) => {
      const o = cyc[(i + 1) % cyc.length], M = D.motives[o.motive], doc = facts['m_' + o.id];
      let t = fill(M.gossip, o), lead = null;
      if (doc && r.chance(T.lead)) { t += ` If you want proof, try the ${spotName(doc).toLowerCase()} at ${LN(doc.loc)}.`; lead = { loc: doc.loc, spot: doc.spot }; }
      add({ id: 'gossip_' + s.id, cat: 'talk', icon: 'talk', name: `${s.name} — on ${o.name}`, sid: s.id, about: o.id, motive: o.motive, text: t, lead });
    });
    if (K.claimLoc) add({ id: 'break_' + K.id, cat: 'talk', icon: 'talk', name: `${K.name} — story changed`, sid: K.id, text: `${K.first} admits ${pro(K.g).he} was NOT at ${LN(K.claimLoc)}. Now claims to have been walking alone. No alibi at all.` });
    sus.forEach(s => {
      if (s.secret) add({ id: 'secret_' + s.id, cat: 'talk', icon: 'talk', name: `${s.name} — the truth`, sid: s.id, text: `${s.first} admits the lie: ${pro(s.g).he} was really at ${LN(s.trueLoc)}, ${s.secret.what}. Shameful — but not murder.` });
    });

    /* ---- solution notes ---- */
    const solution = inn.map(s => {
      let why;
      if (verified(s)) why = s.pair != null ? `was with ${nm(s.pair)} at ${LN(s.trueLoc)}` : `was seen at ${LN(s.trueLoc)} at the time of the murder`;
      else {
        const t = KT.find(x => s.traits[x] !== K.traits[x]);
        why = t ? `does not match the evidence — ${D.traitClue[t].short(K.traits[t]).toLowerCase()}` : `has no initial "${initial}"`;
      }
      return { sid: s.id, text: why };
    }).sort((a, b) => a.sid - b.sid);

    const placed = ['coroner'];
    locs.forEach(l => spots[l].forEach(f => { if (f) placed.push(f); }));
    if (KT.includes('print')) placed.push('k_print');

    const kingpin = D.kingpins[(G.save.d.chapter - 1) % D.kingpins.length];
    const title = kind === 'boss' ? `The Fall of ${kingpin}` : r.chance(0.3) ? `Murder at ${G.LOCS[crime].short}` : `The ${r.pick(D.caseAdj)} ${r.pick(D.caseNoun)}`;

    return {
      genSeed: seed, title, victim, mt, locs, crime, sus, killer: K.id, weapon: W, weapons, wound: cls, KT, initial,
      facts, spots, staffKnows, budget: T.budget, solution, placed, kingpin, sightT
    };
  }

  /* ---- runtime deduction helpers (pure functions of case + found facts) ---- */
  G.traitMatch = function (s, k) {
    if (k.t === 'initial') return s.first[0] === k.v || s.last[0] === k.v;
    return s.traits[k.t] === k.v;
  };
  /* What a suspect does when shown a fact */
  G.reaction = function (c, s, f) {
    if (f.id === 'm_' + s.id || f.about === s.id) return 'motive';
    if (s.id === c.killer && f.denies && f.denies.includes(s.id)) return 'break';
    if (s.secret && ((f.present && f.present.includes(s.id)) || (f.saw && f.saw.includes(s.id)))) return 'secret';
    if (f.k) return G.traitMatch(s, f.k) ? 'traitYes' : 'traitNo';
    if (f.weapon) return 'weapon';
    return 'none';
  };
  /* Alibi bookkeeping shown in the notebook */
  G.alibi = function (c, has, s) {
    let placedBy = null;
    for (const id in c.facts) {
      if (!has(id)) continue;
      const f = c.facts[id];
      if (f.sid === s.id) continue;
      if ((f.present && f.present.includes(s.id)) || (f.saw && f.saw.includes(s.id)) || (f.claim && f.claim.with.includes(s.id))) {
        placedBy = f.staff ? `the ${G.LOCS[f.staff].staff.toLowerCase()}` : c.sus[f.sid].first; break;
      }
    }
    const claim = has('claim_' + s.id) ? c.facts['claim_' + s.id] : null;
    if (placedBy) return { st: 'ok', label: 'SOLID', text: `Placed away from the scene by ${placedBy}.` };
    if (has('break_' + s.id)) return { st: 'bad', label: 'BROKEN', text: 'Caught lying. No alibi.' };
    for (const id in c.facts) {
      const f = c.facts[id];
      if (has(id) && f.denies && f.denies.includes(s.id) && claim) {
        return { st: 'bad', label: 'DISPUTED', text: `Contradicted by ${f.staff ? 'the ' + G.LOCS[f.staff].staff.toLowerCase() : c.sus[f.sid].first}.` };
      }
    }
    if (claim) return { st: 'unk', label: 'UNPROVEN', text: claim.claim.loc ? `Says: at ${G.LOCS[claim.claim.loc].short}${claim.claim.with.length ? ' with ' + c.sus[claim.claim.with[0]].first : ''}.` : 'Says: alone, elsewhere.' };
    return { st: 'none', label: '—', text: 'Not yet questioned.' };
  };
})();
