'use strict';
/* GILDED MIDNIGHT — the investigation: briefing, city map, scenes, interrogation, notebook, accusation, results */
(function () {
  const G = window.G, D = G.D, $ = G.$, $$ = G.$$, esc = G.esc, S = G.S;
  const sfx = n => G.audio.sfx(n), ui = () => $('#ui'), pick = a => a[Math.floor(Math.random() * a.length)];
  let C = null, P = null;

  const has = id => P.facts.includes(id);
  const cost = {
    travel: () => 20 - 4 * G.upLevel('roadster'),
    search: () => { const l = G.upLevel('kit'); return l >= 3 ? 4 : 10 - 2 * l; },
    talk: 6, present: 8, staff: 8, fail: 8
  };
  const left = () => Math.max(0, P.budget - P.time);
  const LOC = id => G.LOCS[id];
  const knowsMotive = sid => has('m_' + sid) || P.facts.some(id => C.facts[id].about === sid);
  const persist = () => { G.save.d.current = { v: G.VERSION, seed: C.seed, tier: C.tier, kind: C.kind, p: P }; G.save.commit(); };
  const hint = (key, html) => { const s = G.save.d.seen; if (s[key]) return; s[key] = 1; G.save.commit(); setTimeout(() => G.toast(G.icon('bulb', 18) + ' ' + html, 'hint', 7000), 700); };
  const bumpMini = () => { G.save.d.stats.minis++; P.minis++; };

  /* ---------------- starting & resuming ---------------- */
  G.beginCase = function (tier, kind, seed) {
    const go = () => {
      const d = G.save.d;
      if (d.current) d.stats.streak = 0;
      C = S.c = G.genCase(seed, tier, kind);
      P = S.p = {
        time: 0, budget: C.budget + 15 * G.upLevel('watch'), at: C.crime, facts: [], searched: {}, opened: {}, met: {}, asked: {}, patience: {}, staffAsked: {},
        marks: {}, wrong: 0, tips: 1 + G.upLevel('informants'), tipsUsed: 0, leads: [], bonus: false, minis: 0, started: false, no: ++d.caseNo
      };
      d.stats.cases++;
      if (kind === 'daily') d.daily.last = G.today();
      S.pics = {};
      persist();
      G.doors('', '', briefing);
    };
    if (!G.save.d.seen.help) G.showHelp(go); else go();
  };
  G.resumeCase = function () {
    const cur = G.save.d.current;
    if (!cur || cur.v !== G.VERSION) { G.save.d.current = null; G.save.commit(); G.showMenu(); return; }
    try { C = S.c = G.genCase(cur.seed, cur.tier, cur.kind); P = S.p = cur.p; } catch (e) { G.save.d.current = null; G.save.commit(); G.showMenu(); return; }
    S.pics = {};
    G.doors('', '', () => { if (!P.started) briefing(); else { G.setPlaying(true); showLoc(P.at); } });
  };

  function briefing() {
    S.screen = 'brief'; S.loc = null; $('#hud').innerHTML = '';
    G.audio.mood('talk');
    const v = C.victim, pr = G.pro(v.g), boss = C.kind === 'boss';
    const txt = boss
      ? `Detective. Our informant inside the Syndicate is dead — ${v.name}, found at ${LOC(C.crime).name}. ${D.woundShort[C.wound]}. One of these ${C.sus.length} people is ${C.kingpin}. Name the right one and the whole rotten empire comes down. Name the wrong one, and we never get this close again. You have until ${G.clock(P.budget)}.`
      : `Detective. We've got a body at ${LOC(C.crime).name}. ${v.name}, ${v.occ}. Somebody made sure ${pr.he} won't see morning. ${C.sus.length} people had reason to want ${pr.him} dead, and I've told every one of them not to leave town. The Commissioner wants a name by ${G.clock(P.budget)}. Don't make me look bad.`;
    ui().innerHTML = `<div class="brief panel">
      <div class="brief-left"><div class="caseno">${boss ? 'SYNDICATE FILE' : C.kind === 'daily' ? 'DAILY CASE' : 'CASE Nº ' + P.no}</div><h2>${esc(C.title)}</h2><div class="brief-tier">${boss ? 'Kingpin · Chapter ' + G.save.d.chapter : C.T.name}</div>
        <div class="victim"><img src="${G.pic(v, true)}" alt=""><div><em>THE VICTIM</em><b>${esc(v.name)}</b><span>${G.cap(v.occ)}</span></div></div></div>
      <div class="brief-right"><div class="phone">${G.icon('talk', 18)} THE CHIEF — ON THE LINE</div><p class="brief-text"></p>
        <div class="lineup">${C.sus.map(s => `<div class="lu"><img src="${G.pic(s)}" alt=""><b>${esc(s.first)}</b><span>${esc(s.occ)}</span></div>`).join('')}</div>
        <div class="row"><button class="btn primary big" data-go>Take the Case</button><button class="btn" data-back>Not now</button></div></div></div>`;
    G.type($('.brief-text', ui()), txt);
    $('[data-go]', ui()).onclick = () => {
      sfx('stamp'); P.started = true; persist(); G.setPlaying(true);
      G.doors(LOC(C.crime).short, 'The crime scene · ' + G.clock(P.time), () => showLoc(C.crime));
    };
    $('[data-back]', ui()).onclick = () => { sfx('click'); G.showMenu(); };
    G.bind(ui());
  }

  /* ---------------- HUD & time ---------------- */
  function hud() {
    const l = left(), pct = Math.round(l / P.budget * 100);
    $('#hud').innerHTML = `<div class="hud ${l <= 60 ? 'low' : ''}">
      <div class="hud-case"><b>${esc(C.title)}</b><span>${S.screen === 'map' ? 'Gilt City' : LOC(S.loc).short}${S.loc === C.crime && S.screen !== 'map' ? ' · crime scene' : ''}</span></div>
      <div class="hud-clock">${G.icon('clock', 30)}<div><b>${G.clock(P.time)}</b><div class="bar time"><i style="width:${pct}%"></i></div><span>${l > 0 ? G.dur(l) + ' until dawn' : 'DAWN — time is up'}</span></div></div>
      <div class="hud-btns">
        <button class="hbtn" data-h="note">${G.icon('book', 18)} Notebook<kbd>N</kbd></button>
        ${S.screen === 'map' ? '' : `<button class="hbtn" data-h="map">${G.icon('map', 18)} City Map<kbd>M</kbd></button>`}
        <button class="hbtn" data-h="tip">${G.icon('bulb', 18)} Tip ×${P.tips}</button>
        <button class="hbtn accuse" data-h="accuse">${G.icon('gavel', 18)} Accuse</button>
        <button class="hbtn icon" data-h="menu" title="Pause">${G.icon('gear', 18)}</button>
      </div></div>`;
    const act = { note: () => notebook(), map: () => goMap(), tip: useTip, accuse: accuse, menu: pauseMenu };
    $$('[data-h]', $('#hud')).forEach(b => { b.onclick = () => { sfx('click'); act[b.dataset.h](); }; });
  }
  function spend(m) {
    if (!m) return;
    P.time += m; persist(); hud(); sfx('tick');
    const pop = G.el('div', 'time-pop', '+' + m + ' min');
    $('#hud').appendChild(pop); setTimeout(() => pop.remove(), 1300);
  }
  let dawnOpen = false;
  function checkTime() {
    if (left() > 0 || dawnOpen || S.screen === 'result') return;
    dawnOpen = true; sfx('sting');
    const o = G.overlay('dim', `<div class="panel dialog dawn"><div class="deco-head"><span>Dawn</span></div>
      <p>Grey light creeps over the rooftops. The Commissioner's car is idling outside, and he wants a name. <b>Right now.</b></p>
      <div class="row"><button class="btn primary" data-acc>${G.icon('gavel', 18)} Make the Accusation</button>${P.bonus ? '' : `<button class="btn" data-ad>${G.icon('play', 16)} Stall him: +45 min <small>watch an ad</small></button>`}</div></div>`);
    $('[data-acc]', o.node).onclick = () => { sfx('click'); o.close(); dawnOpen = false; accuse(true); };
    const ad = $('[data-ad]', o.node);
    if (ad) ad.onclick = async () => {
      const ok = await G.sdk.ad('rewarded');
      if (ok) { P.bonus = true; P.budget += 45; persist(); o.close(); dawnOpen = false; hud(); G.toast('The Chief buys you <b>45 more minutes</b>. Make them count.', 'gold'); }
      else G.toast('No ad available right now.');
    };
  }

  /* ---------------- facts & leads ---------------- */
  function addLead(l) { if (!P.leads.some(x => x.loc === l.loc && x.spot === l.spot)) P.leads.push(l); }
  function leadText(l) {
    const L = LOC(l.loc);
    if (l.spot === 'body') return `Examine the body at ${L.short}`;
    if (l.spot === 'staff') return `Question the ${L.staff.toLowerCase()} at ${L.short}`;
    if (l.spot === 'dust') return 'Dust the murder weapon for prints (Notebook → Evidence)';
    return `Search the ${L.spots[l.spot].n.toLowerCase()} at ${L.short}`;
  }
  function leadDone(l) {
    if (l.spot === 'staff') return !!P.staffAsked[l.loc];
    if (l.spot === 'dust') return has('k_print');
    return !!(P.searched[l.loc] && P.searched[l.loc][l.spot]);
  }
  function addFact(id) {
    if (has(id)) return false;
    const before = C.sus.map(s => G.alibi(C, has, s).st);
    P.facts.push(id); G.save.d.stats.clues++;
    const f = C.facts[id];
    if (f.lead) { addLead({ loc: f.lead.loc, spot: f.lead.spot }); setTimeout(() => { sfx('lead'); G.toast(G.icon('map', 18) + ' <b>New lead:</b> ' + leadText(f.lead), 'gold'); }, 500); }
    C.sus.forEach((s, i) => {
      const now = G.alibi(C, has, s).st;
      if (now !== before[i] && now === 'ok') setTimeout(() => G.toast(`${G.icon('check', 18)} <b>${esc(s.first)}'s alibi is solid.</b>`, 'ok'), 900);
      if (now !== before[i] && now === 'bad') setTimeout(() => { sfx('sting'); G.toast(`${G.icon('eye', 18)} <b>Contradiction!</b> ${esc(s.first)}'s story doesn't hold.`, 'bad', 5000); }, 900);
    });
    persist();
    return true;
  }
  function clueCard(f) {
    return new Promise(res => {
      sfx('flash'); sfx(f.k || f.real ? 'found' : 'page');
      const tag = f.k ? 'Points to the killer' : f.real ? 'The murder weapon' : f.weapon ? 'Ruled out' : f.cat === 'doc' ? 'Motive — ' + esc(C.sus[f.sid].name) : 'Evidence';
      const o = G.overlay('dim', `<div class="panel cluecard ${f.k || f.real ? 'hot' : ''}"><div class="cc-ic">${G.icon(f.icon, 56)}</div><div class="cc-tag">${tag}</div><h3>${esc(f.name)}</h3><p>${esc(f.text)}</p><button class="btn primary" data-ok>File it in the notebook</button></div>`);
      $('[data-ok]', o.node).onclick = () => { sfx('page'); o.close(); res(); };
    });
  }
  async function dustFlow() {
    const ok = await G.mini.dust({ kind: C.sus[C.killer].traits.print });
    if (ok) { bumpMini(); addFact('k_print'); await clueCard(C.facts.k_print); }
    else G.toast('You can dust the weapon later from the notebook.');
  }
  async function foundFact(fid) {
    const f = C.facts[fid];
    if (f.torn) {
      const ok = await G.mini.letter({ title: f.name, text: f.text });
      if (ok) bumpMini(); else { spend(cost.fail); G.toast('You tape the scraps together the slow way. <b>+8 minutes.</b>'); }
    }
    addFact(fid);
    await clueCard(f);
    if (f.real && C.KT.includes('print') && !has('k_print')) await dustFlow();
  }

  /* ---------------- city map ---------------- */
  const SLOTS = {
    5: [[120, 120], [520, 92], [920, 120], [300, 400], [740, 400]],
    6: [[120, 110], [520, 92], [920, 110], [120, 400], [520, 420], [920, 400]],
    7: [[120, 84], [520, 84], [920, 84], [520, 252], [120, 420], [520, 420], [920, 420]]
  };
  function evCount(loc) {
    let tot = 0, got = 0;
    C.spots[loc].forEach((f, i) => { if (f) { tot++; if (P.searched[loc] && P.searched[loc][i]) got++; } });
    if (loc === C.crime) { tot++; if (P.searched[loc] && P.searched[loc].body) got++; }
    return { tot, got };
  }
  function evLabel(loc) {
    const e = evCount(loc), n = Object.keys(P.searched[loc] || {}).length;
    return C.tier <= 1 && C.kind !== 'boss' ? `Evidence ${e.got}/${e.tot}` : `Searched ${n}/${LOC(loc).spots.length + (loc === C.crime ? 1 : 0)}`;
  }
  function goMap() { G.doors('', '', showMap); }
  function showMap() {
    S.screen = 'map'; S.loc = null; G.audio.mood('map'); hud();
    const slots = SLOTS[C.locs.length] || SLOTS[7], tc = cost.travel();
    ui().innerHTML = `<div class="map-title">GILT CITY<span>Where to, detective?</span></div>` + C.locs.map((id, i) => {
      const L = LOC(id), here = id === P.at, ppl = C.sus.filter(s => s.at === id);
      return `<button class="mapnode ${here ? 'here' : ''} ${id === C.crime ? 'crime' : ''}" style="left:${slots[i][0]}px;top:${slots[i][1]}px" data-l="${id}">
        ${id === C.crime ? '<i class="ribbon">CRIME SCENE</i>' : ''}
        <b>${L.short}</b><span class="mn-tag">${L.tag}</span>
        <div class="mn-people">${ppl.map(s => `<img class="${P.met[s.id] ? '' : 'unmet'}" src="${G.pic(s)}" title="${esc(s.name)}" alt="">`).join('')}<i class="mn-staff ${P.staffAsked[id] ? 'asked' : ''}" title="${L.staff}">${G.icon('talk', 16)}</i></div>
        <div class="mn-foot"><span>${evLabel(id)}</span><em>${here ? 'YOU ARE HERE' : tc + ' min'}</em></div></button>`;
    }).join('');
    $$('.mapnode', ui()).forEach(b => { b.onclick = () => travel(b.dataset.l); });
    G.bind(ui());
    hint('map', 'Portraits show who is waiting where. Every trip costs time — plan your route.');
  }
  async function travel(loc) {
    if (loc === P.at) { sfx('click'); await G.doors('', '', () => showLoc(loc)); return; }
    const m = cost.travel();
    sfx('travel');
    await G.doors(LOC(loc).short, G.clock(P.time + m), () => { P.at = loc; P.time += m; persist(); showLoc(loc); });
    checkTime();
  }

  /* ---------------- location ---------------- */
  function showLoc(loc) {
    S.screen = 'loc'; S.loc = loc; P.at = loc; G.audio.mood('scene'); hud();
    const L = LOC(loc), here = C.sus.filter(s => s.at === loc), glint = G.upLevel('kit') >= 3, se = P.searched[loc] || {};
    let h = `<div class="loc-plate"><b>${L.short}</b><span>${L.tag}</span><em>${evLabel(loc)}</em></div>`;
    L.spots.forEach((s, i) => {
      const hot = glint && C.spots[loc][i] && !se[i];
      h += `<button class="spot ${se[i] ? 'done' : ''} ${hot ? 'glint' : ''}" style="left:${s.x}px;top:${s.y}px" data-s="${i}"><i>${s.kind && !P.opened[loc + i] ? G.icon('lock', 13) : ''}</i><span>${s.n}${se[i] ? ' ✓' : ''}</span></button>`;
    });
    if (loc === C.crime) h += `<button class="spot body ${se.body ? 'done' : ''}" style="left:${L.body[0]}px;top:${L.body[1] - 34}px" data-s="body"><i></i><span>The Body${se.body ? ' ✓' : ''}</span></button>`;
    h += `<div class="people">${here.map(s => `<button class="person ${P.met[s.id] ? 'met' : ''}" data-p="${s.id}"><img src="${G.pic(s)}" alt=""><b>${esc(s.name)}</b><span>${esc(s.occ)}</span></button>`).join('')}
      <button class="person staff ${P.staffAsked[loc] ? 'met' : ''}" data-staff><img src="${G.staffPic(loc)}" alt=""><b>The ${L.staff}</b><span>Witness</span></button></div>`;
    ui().innerHTML = h;
    $$('.spot', ui()).forEach(b => { b.onclick = () => search(b.dataset.s === 'body' ? 'body' : +b.dataset.s); });
    $$('[data-p]', ui()).forEach(b => { b.onclick = () => { sfx('click'); talk(+b.dataset.p); }; });
    $('[data-staff]', ui()).onclick = () => { sfx('click'); staffTalk(loc); };
    G.bind(ui());
    hint('loc', 'Gold diamonds are places to search. People wait on the left — question them too.');
  }
  let busy = false;
  async function search(i) {
    if (busy) return;
    const loc = S.loc, L = LOC(loc);
    P.searched[loc] = P.searched[loc] || {};
    if (P.searched[loc][i]) { G.toast('You\'ve already been over that.'); return; }
    busy = true;
    try {
      sfx('click');
      const sp = i === 'body' ? null : L.spots[i];
      if (sp && sp.kind && !P.opened[loc + i]) {
        const ok = await G.mini[sp.kind]({});
        if (!ok) { spend(cost.fail); G.toast(`The ${sp.n.toLowerCase()} holds. <b>+${cost.fail} minutes</b> wasted.`, 'bad'); checkTime(); return; }
        P.opened[loc + i] = 1; bumpMini();
      }
      spend(cost.search());
      P.searched[loc][i] = 1; persist();
      const fid = i === 'body' ? 'coroner' : C.spots[loc][i];
      if (fid) await foundFact(fid);
      else G.toast(pick(D.flavor));
      if (S.screen === 'loc' && S.loc === loc) showLoc(loc);
      checkTime();
    } finally { busy = false; }
  }

  /* ---------------- interrogation ---------------- */
  function traitText(s, t) {
    const v = s.traits[t];
    if (t === 'initial') return s.first[0] + '. ' + s.last[0] + '.';
    if (t === 'hand') return G.cap(v) + '-handed';
    if (t === 'smoke') return v === 'nothing' ? 'Non-smoker' : G.cap(v.replace('a briar ', '').replace('Gold Comet ', '').replace('Havana ', ''));
    if (t === 'scent') return v === 'none' ? 'No scent' : G.cap(v);
    return G.cap(v);
  }
  const TRAITS = ['hair', 'fabric', 'height', 'hand', 'smoke', 'scent', 'print'];
  function traitChips(s) {
    return TRAITS.map(t => `<span class="chip"><em>${D.traitLabel[t]}</em>${traitText(s, t)}</span>`).join('');
  }
  function talk(sid) {
    const s = C.sus[sid], first = !P.met[sid];
    P.met[sid] = 1; P.asked[sid] = P.asked[sid] || {};
    if (P.patience[sid] == null) P.patience[sid] = 3 + G.upLevel('tongue');
    persist(); G.audio.mood('talk');
    const o = G.overlay('talk-ov', `<div class="talk"><div class="talk-pic"><img src="${G.pic(s)}" alt=""><div class="talk-name"><b>${esc(s.name)}</b><span>${esc(s.occ)} · ${D.persLabel[s.pers]}</span></div><div class="chips">${traitChips(s)}</div></div>
      <div class="talk-main panel"><div class="talk-pat"></div><div class="talk-text"></div><div class="talk-opts"></div></div></div>`, () => { G.audio.mood('scene'); if (S.screen === 'loc') showLoc(S.loc); checkTime(); });
    const text = $('.talk-text', o.node), optsEl = $('.talk-opts', o.node);
    const say = t => G.type(text, t);
    const topics = [['alibi', `Where were you around ${C.mt}?`, 'claim_'], ['seen', 'Who did you see there?', 'seen_'], ['rel', `Tell me about you and ${C.victim.first}.`, null], ['gossip', `Who wanted ${C.victim.first} dead?`, 'gossip_']];
    const opts = () => {
      const pat = P.patience[sid];
      $('.talk-pat', o.node).innerHTML = `Patience ${Array.from({ length: 3 + G.upLevel('tongue') }, (_, i) => `<i class="${i < pat ? 'on' : ''}"></i>`).join('')}`;
      optsEl.innerHTML = topics.map(t => `<button class="opt ${P.asked[sid][t[0]] ? 'asked' : ''}" data-t="${t[0]}">${t[1]}<em>${P.asked[sid][t[0]] ? '✓' : cost.talk + ' min'}</em></button>`).join('') +
        `<button class="opt present" data-pres ${pat <= 0 || !P.facts.length ? 'disabled' : ''}>${G.icon('eye', 16)} Present evidence…<em>${pat <= 0 ? 'refuses' : cost.present + ' min'}</em></button><button class="opt leave" data-leave>Leave</button>`;
      $$('[data-t]', optsEl).forEach(b => {
        b.onclick = () => {
          const t = topics.find(x => x[0] === b.dataset.t), fresh = !P.asked[sid][t[0]];
          sfx('click');
          if (fresh) { P.asked[sid][t[0]] = 1; spend(cost.talk); }
          say(t[2] ? C.facts[t[2] + sid].text : s.relLine);
          if (fresh && t[2]) { addFact(t[2] + sid); G.toast(G.icon('book', 16) + ' Statement recorded.', '', 1800); }
          opts();
        };
      });
      $('[data-pres]', optsEl).onclick = () => { sfx('click'); pickEvidence(sid, present); };
      $('[data-leave]', optsEl).onclick = () => { sfx('click'); o.close(); };
      G.bind(optsEl);
    };
    const present = fid => {
      const f = C.facts[fid], r = G.reaction(C, s, f), st = G.save.d.stats;
      spend(cost.present);
      if (r === 'motive') { say(D.lines.motiveAdmit[s.pers]); sfx('lead'); G.toast(`Motive confirmed — <b>${D.motives[s.motive].label}</b>.`, 'gold'); }
      else if (r === 'break') {
        if (has('break_' + sid)) say('I\'ve said all I\'m going to say about that.');
        else { say(D.lines.breakLie[s.pers]); sfx('good'); st.lies++; addFact('break_' + sid); G.toast(`${G.icon('eye', 18)} <b>Alibi broken.</b> ${esc(s.first)} has no cover for the time of the murder.`, 'bad', 5000); }
      } else if (r === 'secret') {
        if (has('secret_' + sid)) say('You already know my shame. Must we?');
        else { say(D.lines.secretAdmit[s.pers] + ' ' + s.secret.admit); sfx('good'); st.secrets++; addFact('secret_' + sid); G.toast(`<b>Secret exposed.</b> ${esc(s.first)} lied — but not about murder.`, 'gold', 5000); }
      } else if (r === 'traitYes') say(pick(D.lines.traitYes));
      else if (r === 'traitNo') say(pick(D.lines.traitNo));
      else if (r === 'weapon') say(pick(D.lines.weapon));
      else {
        P.patience[sid]--; P.wrong++; sfx('bad');
        say(P.patience[sid] <= 0 ? D.lines.clam[s.pers] : pick(D.lines.irrelevant[s.pers]));
      }
      persist(); opts();
    };
    say(first ? pick(D.lines.greet[s.pers]) : 'Back again, detective?');
    if (first) G.toast(`${G.icon('eye', 16)} You size ${G.pro(s.g).him} up — details noted in the notebook.`, '', 2600);
    opts();
    hint('talk', 'Caught a lie? <b>Present evidence</b> that contradicts it. Wrong guesses wear out their patience.');
  }
  function pickEvidence(sid, cb) {
    const list = P.facts.map(id => C.facts[id]).filter(f => !(f.sid === sid && f.cat === 'talk'));
    const o = G.overlay('dim', `<div class="panel wide"><div class="deco-head"><span>Present What?</span></div><div class="scroll picker">${list.map(f => `<button class="ev" data-f="${f.id}">${G.icon(f.icon, 24)}<div><b>${esc(f.name)}</b><span>${esc(f.text)}</span></div></button>`).join('') || '<p class="empty">You have nothing to show yet.</p>'}</div><div class="row"><button class="btn" data-close>Never mind</button></div></div>`);
    $$('[data-f]', o.node).forEach(b => { b.onclick = () => { sfx('page'); o.close(); cb(b.dataset.f); }; });
  }
  function staffTalk(loc) {
    const L = LOC(loc), fid = 'staff_' + loc;
    G.audio.mood('talk');
    const o = G.overlay('talk-ov', `<div class="talk"><div class="talk-pic"><img src="${G.staffPic(loc)}" alt=""><div class="talk-name"><b>The ${L.staff}</b><span>${L.short} · no reason to lie</span></div></div>
      <div class="talk-main panel"><div class="talk-text"></div><div class="talk-opts"></div></div></div>`, () => { G.audio.mood('scene'); if (S.screen === 'loc') showLoc(S.loc); checkTime(); });
    const text = $('.talk-text', o.node), optsEl = $('.talk-opts', o.node);
    const opts = () => {
      optsEl.innerHTML = `<button class="opt ${P.staffAsked[loc] ? 'asked' : ''}" data-q>What did you see around ${C.mt}?<em>${P.staffAsked[loc] ? '✓' : cost.staff + ' min'}</em></button><button class="opt leave" data-leave>Leave</button>`;
      $('[data-q]', optsEl).onclick = () => {
        sfx('click');
        const fresh = !P.staffAsked[loc];
        if (fresh) { P.staffAsked[loc] = 1; spend(cost.staff); }
        G.type(text, C.facts[fid].text);
        if (fresh) { addFact(fid); if (C.facts[fid].k) { sfx('found'); G.toast(`${G.icon('eye', 18)} <b>A glimpse of the killer</b> — added to the case board.`, 'gold', 4500); } }
        opts();
      };
      $('[data-leave]', optsEl).onclick = () => { sfx('click'); o.close(); };
    };
    G.type(text, pick(['Evening, detective. Terrible business.', 'I\'ll help if I can, detective. I see most of what goes on here.', 'Ask away. I\'ve nothing to hide — can\'t say the same for the clientele.']));
    opts();
  }

  /* ---------------- notebook ---------------- */
  let nbTab = 'board', nbSel = 0;
  function notebook(tab) {
    if (tab) nbTab = tab;
    sfx('page');
    const o = G.overlay('dim', '', () => { if (S.screen === 'loc') showLoc(S.loc); else if (S.screen === 'map') showMap(); });
    const kcols = () => { const seen = {}, out = []; P.facts.forEach(id => { const k = C.facts[id].k; if (k && !seen[k.t]) { seen[k.t] = 1; out.push(k); } }); return out; };
    const draw = () => {
      let body = '';
      if (nbTab === 'board') {
        const ks = kcols(), cor = has('coroner'), wf = P.facts.map(id => C.facts[id]).find(f => f.real);
        body = `<div class="summary"><span><em>Victim</em>${esc(C.victim.name)}</span><span><em>Time of death</em>${cor ? 'around ' + C.mt : '?'}</span><span><em>Cause</em>${cor ? D.woundShort[C.wound] : '?'}</span><span><em>Weapon</em>${wf ? esc(wf.name) : '?'}</span></div>
          <table class="board"><thead><tr><th>Suspect</th><th>Alibi</th>${ks.map(k => `<th class="kc">${G.icon(D.traitClue[k.t].icon, 18)}<span>${D.traitClue[k.t].short(k.v)}</span></th>`).join('')}<th>Motive</th><th>Your verdict</th></tr></thead><tbody>
          ${C.sus.map(s => {
          const al = G.alibi(C, has, s), met = P.met[s.id], mk = P.marks[s.id] || '';
          return `<tr class="${mk}"><td class="who" data-d="${s.id}"><img src="${G.pic(s)}" alt=""><div><b>${esc(s.name)}</b><span>${esc(s.occ)} · ${LOC(s.at).short}</span></div></td>
              <td class="al ${al.st}"><b>${al.label}</b><span>${al.text}</span></td>
              ${ks.map(k => { const known = met || k.t === 'initial'; const m = known ? G.traitMatch(s, k) : null; return `<td class="kc ${known && C.T.assist ? (m ? 'hit' : 'miss') : ''}">${known ? traitText(s, k.t) : '?'}</td>`; }).join('')}
              <td>${knowsMotive(s.id) ? D.motives[s.motive].label : '?'}</td>
              <td><button class="mark ${mk}" data-m="${s.id}">${mk === 'clear' ? 'Cleared' : mk === 'sus' ? 'Suspect' : '—'}</button></td></tr>`;
        }).join('')}</tbody></table>
          <p class="note">${ks.length ? 'Columns are facts about <b>the killer</b>. ' + (C.T.assist ? 'Gold matches, red doesn\'t.' : 'Compare each suspect yourself.') : 'Search the crime scene to learn about the killer.'} Click a verdict to mark a suspect; click a name for the dossier.</p>`;
      } else if (nbTab === 'dossier') {
        const s = C.sus[nbSel], al = G.alibi(C, has, s), met = P.met[s.id];
        const said = P.facts.map(id => C.facts[id]).filter(f => f.cat === 'talk' && (f.sid === s.id || f.about === s.id || (f.present || []).includes(s.id) || (f.saw || []).includes(s.id) || (f.denies || []).includes(s.id)));
        body = `<div class="dos-chips">${C.sus.map(x => `<button class="dchip ${x.id === nbSel ? 'on' : ''} ${P.marks[x.id] || ''}" data-d="${x.id}"><img src="${G.pic(x)}" alt="">${esc(x.first)}</button>`).join('')}</div>
          <div class="dossier"><img class="dos-pic" src="${G.pic(s)}" alt=""><div class="dos-body"><h3>${esc(s.name)}</h3><div class="dos-sub">${esc(s.occ)} · waiting at ${LOC(s.at).short}${P.asked[s.id] && P.asked[s.id].rel ? ` · ${esc(C.victim.first)}'s ${esc(s.rel)}` : ''}</div>
            <div class="chips">${met ? traitChips(s) : '<span class="chip"><em>Details</em>Not yet met</span>'}</div>
            <div class="dos-row"><span class="al ${al.st}"><b>Alibi: ${al.label}</b> ${al.text}</span></div>
            <div class="dos-row"><b>Motive:</b> ${knowsMotive(s.id) ? D.motives[s.motive].label : 'Unknown'}</div>
            <div class="dos-said">${said.map(f => `<div><em>${esc(f.name)}</em>${esc(f.text)}</div>`).join('') || '<div><em>Nothing on record yet.</em></div>'}</div></div></div>`;
      } else if (nbTab === 'ev') {
        const list = P.facts.map(id => C.facts[id]).filter(f => f.cat !== 'talk');
        body = list.length ? `<div class="evlist">${list.map(f => `<div class="ev ${f.k || f.real ? 'hot' : ''}">${G.icon(f.icon, 26)}<div><b>${esc(f.name)}</b><em>${f.k ? 'Points to the killer' : f.real ? 'Murder weapon' : f.weapon ? 'Ruled out' : f.cat === 'doc' ? 'Motive — ' + esc(C.sus[f.sid].name) : ''}${f.loc ? ' · found at ' + LOC(f.loc).short : ''}</em><span>${esc(f.text)}</span>
          ${f.real && C.KT.includes('print') && !has('k_print') ? '<button class="btn sm" data-dust>Dust for prints</button>' : ''}</div></div>`).join('')}</div>` : '<p class="empty">No physical evidence yet. Start with the body.</p>';
      } else if (nbTab === 'talk') {
        const list = P.facts.map(id => C.facts[id]).filter(f => f.cat === 'talk');
        body = list.length ? `<div class="evlist">${list.map(f => `<div class="ev">${G.icon('talk', 24)}<div><b>${esc(f.name)}</b><span>“${esc(f.text)}”</span></div></div>`).join('')}</div>` : '<p class="empty">Nobody has said a word yet.</p>';
      } else {
        body = `<div class="leads">${P.leads.length ? P.leads.map(l => `<div class="lead ${leadDone(l) ? 'done' : ''}">${G.icon(leadDone(l) ? 'check' : 'map', 20)}<span>${leadText(l)}</span></div>`).join('') : '<p class="empty">No leads yet. Ask suspects who had a motive — and ask the staff what they saw.</p>'}</div>
          <div class="rules"><h4>The Golden Rules</h4><p><b>1.</b> The killer acted alone, and lies about where they were.</p><p><b>2.</b> Innocent people may lie — but only to hide a private shame.</p><p><b>3.</b> If anyone else places a suspect away from the scene, that alibi is <b>solid</b>.</p><p><b>4.</b> Evidence at the crime scene belongs to the killer.</p></div>`;
      }
      o.node.innerHTML = `<div class="panel notebook"><div class="deco-head"><span>Detective's Notebook</span></div>
        <div class="tabs">${[['board', 'Case Board'], ['dossier', 'Dossiers'], ['ev', 'Evidence'], ['talk', 'Statements'], ['leads', 'Leads & Rules']].map(t => `<button class="tab ${nbTab === t[0] ? 'on' : ''}" data-tab="${t[0]}">${t[1]}</button>`).join('')}<button class="tab close" data-close>${G.icon('x', 16)} Close</button></div>
        <div class="scroll">${body}</div></div>`;
      $('[data-close]', o.node).onclick = () => { sfx('page'); o.close(); };
      $$('[data-tab]', o.node).forEach(b => { b.onclick = () => { sfx('page'); nbTab = b.dataset.tab; draw(); }; });
      $$('[data-m]', o.node).forEach(b => { b.onclick = e => { e.stopPropagation(); sfx('click'); const id = +b.dataset.m, cur = P.marks[id] || ''; P.marks[id] = cur === '' ? 'clear' : cur === 'clear' ? 'sus' : ''; persist(); draw(); }; });
      $$('[data-d]', o.node).forEach(b => { b.onclick = () => { sfx('page'); nbSel = +b.dataset.d; nbTab = 'dossier'; draw(); }; });
      const du = $('[data-dust]', o.node); if (du) du.onclick = async () => { spend(5); await dustFlow(); draw(); };
    };
    if (nbSel >= C.sus.length) nbSel = 0;
    draw();
    hint('note', 'The Case Board lines up every suspect against what you know about the killer.');
  }

  /* ---------------- tips ---------------- */
  function nextTip() {
    const cands = [];
    if (!has('coroner')) cands.push({ loc: C.crime, spot: 'body' });
    C.KT.forEach(t => { const f = C.facts['k_' + t]; if (f && f.loc && !has(f.id)) cands.push({ loc: f.loc, spot: f.spot }); });
    if (C.facts.k_initial && !has('k_initial')) cands.push({ loc: C.crime, spot: C.facts.k_initial.spot });
    if (C.sightT && !P.staffAsked[C.crime]) cands.push({ loc: C.crime, spot: 'staff' });
    const w = C.facts['w_' + C.weapon];
    if (!has(w.id)) cands.push({ loc: w.loc, spot: w.spot });
    else if (C.KT.includes('print') && !has('k_print')) cands.push({ loc: C.crime, spot: 'dust' });
    const m = C.facts['m_' + C.killer];
    if (m && !has(m.id)) cands.push({ loc: m.loc, spot: m.spot });
    C.locs.forEach(l => { const f = C.facts['staff_' + l]; if (l !== C.crime && !P.staffAsked[l] && (f.present.length || f.denies.length)) cands.push({ loc: l, spot: 'staff' }); });
    return cands.find(l => !leadDone(l) && !P.leads.some(x => x.loc === l.loc && x.spot === l.spot)) || null;
  }
  async function useTip() {
    const t = nextTip();
    if (!t) { G.toast('Your informant shrugs. <i>"You\'ve got everything I know, detective."</i>'); return; }
    if (P.tips <= 0) {
      if (!await G.confirm('Out of Tips', 'Your informants are tapped out. Call in a favour for one more lead?', G.icon('play', 16) + ' Watch an ad', 'Never mind')) return;
      if (!await G.sdk.ad('rewarded')) { G.toast('No ad available right now.'); return; }
    } else P.tips--;
    P.tipsUsed++;
    addLead(t); persist(); hud(); sfx('lead');
    G.toast(`${G.icon('bulb', 18)} <b>A whisper from the street:</b> ${leadText(t)}.`, 'gold', 6500);
  }

  function pauseMenu() {
    const o = G.overlay('dim', `<div class="panel dialog"><div class="deco-head"><span>Paused</span></div><p>The city holds its breath. Your case is saved automatically.</p>
      <div class="col"><button class="btn primary" data-close>Back to the Case</button><button class="btn" data-help>How to Play</button><button class="btn" data-set>Settings</button><button class="btn" data-quit>Save &amp; Quit to Menu</button></div></div>`);
    $('[data-help]', o.node).onclick = () => { sfx('click'); G.showHelp(); };
    $('[data-set]', o.node).onclick = () => { sfx('click'); G.showSettings(); };
    $('[data-quit]', o.node).onclick = () => { sfx('click'); o.close(); persist(); G.doors('', '', G.showMenu); };
  }

  /* ---------------- accusation ---------------- */
  function accuse(forced) {
    const sel = { sid: null, weapon: null, motive: null };
    const weapons = P.facts.map(id => C.facts[id]).filter(f => f.weapon);
    const motives = C.sus.filter(s => knowsMotive(s.id));
    const o = G.overlay('dim', '');
    const draw = () => {
      o.node.innerHTML = `<div class="panel accuse"><div class="deco-head"><span>The Accusation</span></div>
        <p class="acc-lead">Name the killer. A wrong name lets the real one walk — and ends the case.</p>
        <div class="acc-grid">${C.sus.map(s => `<button class="acc-sus ${sel.sid === s.id ? 'on' : ''} ${P.marks[s.id] || ''}" data-s="${s.id}"><img src="${G.pic(s)}" alt=""><b>${esc(s.name)}</b></button>`).join('')}</div>
        <div class="acc-cols"><div><h4>${G.icon('blade', 18)} The weapon</h4>${weapons.map(f => `<button class="acc-opt ${sel.weapon === f.weapon ? 'on' : ''}" data-w="${f.weapon}">${esc(f.name)}</button>`).join('') || '<p class="empty sm">You haven\'t found a weapon.</p>'}</div>
          <div><h4>${G.icon('doc', 18)} The motive</h4>${motives.map(s => `<button class="acc-opt ${sel.motive === s.motive ? 'on' : ''}" data-mo="${s.motive}">${D.motives[s.motive].label}<em>${esc(s.first)}</em></button>`).join('') || '<p class="empty sm">You haven\'t uncovered a motive.</p>'}</div></div>
        <div class="row"><button class="btn primary big" data-go ${sel.sid == null ? 'disabled' : ''}>${G.icon('gavel', 18)} ${sel.sid == null ? 'Choose a suspect' : 'Accuse ' + esc(C.sus[sel.sid].first)}</button>${forced ? '' : '<button class="btn" data-close>Not yet</button>'}</div></div>`;
      $$('[data-s]', o.node).forEach(b => { b.onclick = () => { sfx('click'); sel.sid = +b.dataset.s; draw(); }; });
      $$('[data-w]', o.node).forEach(b => { b.onclick = () => { sfx('click'); sel.weapon = sel.weapon === b.dataset.w ? null : b.dataset.w; draw(); }; });
      $$('[data-mo]', o.node).forEach(b => { b.onclick = () => { sfx('click'); sel.motive = sel.motive === b.dataset.mo ? null : b.dataset.mo; draw(); }; });
      const cl = $('[data-close]', o.node); if (cl) cl.onclick = () => { sfx('click'); o.close(); };
      $('[data-go]', o.node).onclick = async () => {
        if (sel.sid == null) return;
        const s = C.sus[sel.sid];
        if (!await G.confirm('Are You Certain?', `You are about to accuse <b>${esc(s.name)}</b> of murder${sel.weapon ? '' : ' — without naming a weapon'}${sel.motive ? '' : (sel.weapon ? ' — without' : ' or') + ' a motive'}. There is no taking it back.`, 'Accuse', 'Wait')) return;
        o.close(); resolve(sel);
      };
      G.bind(o.node);
    };
    draw();
  }

  const linger = (node, ms) => new Promise(res => {
    let done = false; const fin = () => { if (done) return; done = true; node.removeEventListener('click', fin); res(); };
    setTimeout(() => node.addEventListener('click', fin), 250); setTimeout(fin, ms);
  });
  const typed = (node, text) => new Promise(res => G.type(node, text, res));

  async function resolve(sel) {
    G.setPlaying(false);
    const K = C.sus[C.killer], acc = C.sus[sel.sid], ok = sel.sid === C.killer, boss = C.kind === 'boss';
    G.audio.mood('accuse'); sfx('sting');
    $$('#modal > .overlay').forEach(x => x.remove());
    const cine = G.overlay('cine', `<div class="cine-box"><img class="cine-pic" alt=""><div class="cine-text"></div><div class="cine-stamp"></div></div>`);
    const text = $('.cine-text', cine.node), pic = $('.cine-pic', cine.node);
    await typed(text, `You gather them all at ${LOC(C.crime).name}. Rain hammers the glass. Nobody will meet your eye.`); await linger(cine.node, 2600);
    pic.src = G.pic(acc); pic.classList.add('in'); sfx('flash');
    await typed(text, `“${C.victim.name} was murdered by someone in this room. And that someone… is ${acc.name}.”`); await linger(cine.node, 2800);
    if (ok) {
      sfx('good');
      await typed(text, `${K.first}'s composure cracks. “${D.motives[K.motive].confess}”${boss ? ` The mask is off — ${K.name} is ${C.kingpin}.` : ''}`);
    } else {
      sfx('bad'); pic.classList.add('wrong');
      await typed(text, `${acc.first} only laughs — and ${G.pro(acc.g).his} lawyer has ${G.pro(acc.g).him} out by noon. By the time the truth surfaces, ${K.name} has boarded the 12:05 and vanished into the rain.`);
    }
    const stamp = $('.cine-stamp', cine.node);
    stamp.textContent = ok ? 'CASE CLOSED' : 'UNSOLVED'; stamp.classList.add('in', ok ? 'ok' : 'no'); sfx('stamp');
    await linger(cine.node, 3200);
    const R = settle(sel, ok);
    await G.doors('', '', () => { cine.close(); results(R, sel, ok); });
  }

  function settle(sel, ok) {
    const d = G.save.d, s = d.stats, T = C.T, K = C.sus[C.killer], boss = C.kind === 'boss', daily = C.kind === 'daily';
    const wOk = ok && sel.weapon === C.weapon, mOk = ok && sel.motive === K.motive, tl = left();
    const found = C.placed.filter(has).length, total = C.placed.length, lines = [];
    let raw = 0;
    if (ok) {
      raw = 1000; lines.push(['Killer named', 1000]);
      lines.push(['Murder weapon' + (wOk ? '' : ' — missed'), wOk ? 300 : 0]); if (wOk) raw += 300;
      lines.push(['Motive' + (mOk ? '' : ' — missed'), mOk ? 300 : 0]); if (mOk) raw += 300;
      const tb = Math.round(tl * 2.5); raw += tb; lines.push([`Time to spare — ${G.dur(tl)}`, tb]);
      const ev = Math.round(200 * found / total); raw += ev; lines.push([`Evidence ${found}/${total}`, ev]);
      const pen = P.wrong * 30 + P.tipsUsed * 40; if (pen) { raw -= pen; lines.push(['Bad guesses & tips', -pen]); }
    } else { raw = Math.round(100 * found / total); lines.push(['Wrong accusation', 0], [`Evidence ${found}/${total}`, raw]); }
    raw = Math.max(0, raw);
    const grade = !ok ? 'F' : raw >= 1900 ? 'S' : raw >= 1550 ? 'A' : raw >= 1250 ? 'B' : 'C';
    const score = Math.round(raw * T.mult), prevRank = G.rankOf(d.xp).i;
    let cash = 0, threads = 0, streakMult = 1;
    if (ok) {
      s.solved++; s.streak++; s.bestStreak = Math.max(s.bestStreak, s.streak);
      if (!boss && !daily) s.byTier[C.tier]++;
      streakMult = 1 + Math.min(s.streak - 1, 10) * 0.05;
      cash = Math.round(score * 0.35 * (1 + 0.15 * G.upLevel('press')) * streakMult * (daily ? 2 : 1)) + (boss ? 1500 * d.chapter : 0);
      if (!boss) { threads = { S: 3, A: 2, B: 1, C: 0 }[grade]; d.threads = Math.min(G.THREADS, d.threads + threads); }
      if (grade === 'S') s.sRanks++;
    } else { s.streak = 0; s.wrong++; }
    const xp = ok ? score : Math.round(score * 0.5) + 50;
    if (boss) { if (ok) { s.bosses++; d.chapter++; d.threads = 0; } else d.threads = Math.max(0, d.threads - 4); }
    if (daily && ok) {
      const y = new Date(Date.now() - 864e5), ys = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate();
      d.daily.streak = d.daily.lastSolved === ys ? d.daily.streak + 1 : 1;
      d.daily.lastSolved = G.today(); d.daily.best = Math.max(d.daily.best, d.daily.streak);
    }
    d.xp += xp; d.cash += cash; d.earned += cash; s.totalScore += score; s.bestScore = Math.max(s.bestScore, score);
    d.archive.push({ t: C.title, g: grade, s: score, tier: boss ? 'Kingpin' : daily ? 'Daily' : T.name, ok, d: G.today() });
    if (d.archive.length > 40) d.archive.shift();
    d.current = null;
    if (ok && tl >= P.budget / 2) G.award('speed');
    if (ok && P.wrong === 0) G.award('smooth');
    if (ok && found === total) G.award('thorough');
    if (ok && C.tier === 3 && !boss && !daily) G.award('legend');
    if (ok && daily) G.award('daily1');
    G.checkAch(); G.save.commit();
    const rank = G.rankOf(d.xp);
    return { lines, raw, grade, score, cash, xp, threads, streakMult, mult: T.mult, rankUp: rank.i > prevRank ? rank.name : null, wOk, mOk };
  }

  function results(R, sel, ok) {
    S.screen = 'result'; S.loc = null; $('#hud').innerHTML = '';
    G.audio.mood('result');
    const d = G.save.d, K = C.sus[C.killer], rank = G.rankOf(d.xp), boss = C.kind === 'boss';
    ui().innerHTML = `<div class="result panel">
      <div class="res-left"><div class="caseno">${ok ? 'CASE CLOSED' : 'UNSOLVED'}</div><h2>${esc(C.title)}</h2>
        <div class="grade g${R.grade}">${R.grade}</div>
        <div class="res-lines">${R.lines.map(l => `<div><span>${l[0]}</span><b class="${l[1] < 0 ? 'neg' : ''}">${l[1] > 0 ? '+' : ''}${l[1]}</b></div>`).join('')}
          <div class="mult"><span>${boss ? 'Kingpin' : C.kind === 'daily' ? 'Daily · ' + C.T.name : C.T.name} difficulty</span><b>×${R.mult}</b></div>
          <div class="total"><span>Score</span><b>${R.score.toLocaleString()}</b></div></div>
        <div class="rewards"><div class="rw cashrw">${G.icon('cash', 22)}<b>${G.money(R.cash)}</b><span>fee${R.streakMult > 1 ? ' · streak ×' + R.streakMult.toFixed(2) : ''}</span></div><div class="rw">${G.icon('star', 22)}<b>+${R.xp.toLocaleString()} XP</b><span>${esc(rank.name)}</span></div>${R.threads ? `<div class="rw">${G.icon('thread', 22)}<b>+${R.threads}</b><span>Syndicate thread${R.threads > 1 ? 's' : ''}</span></div>` : ''}</div>
        <div class="bar xp"><i style="width:${Math.round(rank.pct * 100)}%"></i></div></div>
      <div class="res-right"><h4>How the case breaks</h4>
        <div class="sol-k"><img src="${G.pic(K)}" alt=""><div><em>THE KILLER</em><b>${esc(K.name)}</b><span>${D.motives[K.motive].label} · ${D.weapons[C.weapon].n}</span></div></div>
        <div class="scroll sol">${C.KT.map(t => `<div class="sol-row hit">${G.icon(D.traitClue[t].icon, 16)}<span>The killer: <b>${D.traitClue[t].short(K.traits[t]).toLowerCase()}</b></span></div>`).join('')}
          ${C.solution.map(x => `<div class="sol-row">${G.icon('check', 16)}<span><b>${esc(C.sus[x.sid].first)}</b> ${esc(x.text)}.</span></div>`).join('')}
          <div class="sol-row hit">${G.icon('eye', 16)}<span>Only <b>${esc(K.first)}</b> fits every fact — with no one to vouch for ${G.pro(K.g).him}.</span></div></div>
        <div class="row res-btns">${ok && R.cash > 0 ? `<button class="btn" data-dbl>${G.icon('play', 16)} Double the fee <small>watch an ad</small></button>` : ''}<button class="btn primary big" data-next>${ok ? 'Next Case' : 'Try Another Case'}</button><button class="btn" data-office>Office</button><button class="btn" data-menu>Menu</button></div></div></div>`;
    sfx(ok ? 'cash' : 'bad');
    if (R.rankUp) setTimeout(() => { sfx('rank'); G.sdk.happytime(); G.toast(`${G.icon('star', 20)} <b>Promoted — ${esc(R.rankUp)}</b>`, 'gold', 6000); }, 1400);
    else if (R.grade === 'S' || (boss && ok)) G.sdk.happytime();
    if (boss && ok) setTimeout(() => G.toast(`${G.icon('trophy', 20)} <b>${esc(C.kingpin)} is finished.</b> But the Syndicate always grows a new head… Chapter ${d.chapter} begins.`, 'gold', 8000), 2400);
    const tier = C.tier, kind = C.kind;
    const dbl = $('[data-dbl]', ui());
    if (dbl) dbl.onclick = async () => {
      dbl.disabled = true;
      if (await G.sdk.ad('rewarded')) { d.cash += R.cash; d.earned += R.cash; G.save.commit(); G.checkAch(); sfx('cash'); dbl.innerHTML = G.icon('check', 16) + ' Fee doubled'; $('.cashrw b', ui()).textContent = G.money(R.cash * 2); }
      else { dbl.disabled = false; G.toast('No ad available right now.'); }
    };
    $('[data-next]', ui()).onclick = async () => {
      sfx('click');
      await G.sdk.ad('midgame');
      if (kind === 'normal') G.beginCase(tier, 'normal', (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
      else G.doors('', '', G.showMenu);
    };
    $('[data-office]', ui()).onclick = () => { sfx('click'); G.showOffice(); };
    $('[data-menu]', ui()).onclick = () => { sfx('click'); G.doors('', '', G.showMenu); };
    G.bind(ui());
  }

  G.caseKey = function (e) {
    if (!C || !P || !P.started || (S.screen !== 'loc' && S.screen !== 'map')) return;
    if (e.code === 'KeyN') notebook();
    else if (e.code === 'KeyM' && S.screen === 'loc') goMap();
  };
})();
