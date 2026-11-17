# Gilded Midnight — A Deco Noir Mystery

An endless, procedurally generated murder-mystery for the web, built for **CrazyGames** (HTML5, SDK v3 integrated).
One city. One night. One killer.

Everything — the skyline, ten hand-composed locations, every suspect portrait, the jazz combo, the rain — is generated in
code at runtime. There are no image or audio files; the whole game is ~250 KB plus three open-licensed fonts.

## How it plays

- **A body, a cast of 5–8 suspects, and a clock.** Travelling, searching and questioning all cost time. At dawn the
  Commissioner wants a name.
- **Search scenes** for evidence the killer left behind (hair, footprints, scent, torn threads, prints, monograms),
  the murder weapon among decoys, and documents that reveal motives.
- **Interrogate suspects** — alibi, who they saw, their relationship, who else had a motive — then **present evidence**
  to break a false alibi or expose a private secret. Ask the staff: they have no reason to lie.
- **Mini-games**: pick locks, crack safes by "listening" to the tumblers, reassemble torn letters, dust for fingerprints.
- **The notebook** tracks everything on a case board: suspects vs. what you know about the killer, alibi status,
  motives, leads and your own verdicts.
- **Accuse**: name killer, weapon and motive. Score → grade (S–F) → fee, XP and Syndicate threads.

Every case is generated from a seed and **validated to be logically solvable**: exactly one suspect fits all the
killer evidence and has no verifiable alibi.

### Long-term loop

- 12 detective ranks, 4 difficulty tiers (Rookie Beat → Legend) unlocked by rank
- Office upgrades (faster car, forensics kit, informants, extra time, …)
- Win streak fee multiplier, 24 achievements, statistics, case archive
- **Daily Case** (same seed for everyone that day, double fee, day streak)
- **The Syndicate**: A/S ranks earn threads; 12 threads unlock a Kingpin finale case, then a new chapter begins
- Auto-save of the case in progress (continue after closing the tab)

## CrazyGames SDK integration

`js/core.js` wraps the SDK (`window.CrazyGames.SDK`, v3) so the game runs identically on CrazyGames, on localhost and
fully offline:

| SDK feature | Where it is used |
| --- | --- |
| `SDK.init()` | boot |
| `game.loadingStart / loadingStop` | around asset generation at boot |
| `game.gameplayStart / gameplayStop` | entering / leaving an investigation, around ads |
| `game.happytime()` | S rank, promotion, Kingpin defeated |
| `ad.requestAd('midgame')` | between cases ("Next Case") |
| `ad.requestAd('rewarded')` | extra informant tip · +45 minutes at dawn · double the fee |
| `data.getItem / setItem` | all save data — see below |
| `game.settings.muteAudio` + change listener | global mute; audio is also muted while an ad plays |

### Saving

On CrazyGames, progress (rank, cash, upgrades, achievements, stats, archive, settings and the case in progress) is
stored **only** through the SDK data module, under one key, `gilded_midnight_save_v1`:

- The storage backend is picked once after `SDK.init()`. When the data module is available the game never writes
  its own `localStorage` key, so a save can't be split between two stores.
- Changes are written 300 ms after they happen, and **immediately** for case results, purchases, rewarded-ad
  rewards and settings, before every ad, and when the tab is hidden or closed (`visibilitychange`, `pagehide`).
- A failed write keeps the save marked dirty and retries on the next change; it does not fall back to `localStorage`.
- A save left in `localStorage` from an earlier standalone build is imported into the data module once.
- Without the SDK (offline, or a host where the SDK is disabled) the game falls back to `localStorage`.
- Settings tells the player where progress is kept.

## Running locally

Any static server works:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Submitting to CrazyGames

The upload is a **single self-contained `index.html`**: the stylesheet, all scripts and the fonts are inlined, so the
upload works however the files are selected or dragged into the portal. Only the CrazyGames SDK is loaded from its
own URL, as CrazyGames requires.

- `crazygames-upload/index.html` — upload this file
- `gilded-midnight-crazygames.zip` — the same file zipped, if the portal asks for a zip

After changing the source, rebuild both with:

```bash
./build-crazygames.sh
```

The script inlines everything, checks that no local file is still referenced and that the SDK v3 script tag is
present, then writes the zip.

Recommended portal settings: landscape orientation, 16:9, mouse + touch + keyboard (`N` notebook, `M` map,
`Esc` close, `Space`/arrows in mini-games).

## Project layout

```
index.html        entry point
css/style.css     art-deco interface
js/core.js        utilities, seeded RNG, CrazyGames SDK bridge, save data
js/data.js        names, motives, weapons, dialogue, ranks, upgrades, achievements
js/gen.js         case generator + deduction helpers
js/art.js         drawing primitives, skyline, portraits, icons
js/scenes.js      the ten locations
js/audio.js       generative jazz combo, ambience and sound effects (WebAudio)
js/mini.js        lock, safe, torn-letter and fingerprint mini-games
js/game.js        boot, render loop, menus, office, records
js/case.js        investigation flow, notebook, accusation, results
fonts/            Limelight, Poiret One, Josefin Sans (SIL Open Font License, see OFL-*.txt)
```
