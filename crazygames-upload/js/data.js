'use strict';
/* GILDED MIDNIGHT — static content: names, motives, weapons, dialogue, progression tables */
(function () {
  const G = window.G, D = G.D = {};

  D.maleNames = ['Dexter', 'Roland', 'Ambrose', 'Lionel', 'Cornelius', 'Jasper', 'Montgomery', 'Silas', 'Rex', 'Winston', 'Emmett', 'Barnaby', 'Clarence', 'Hugo', 'Leopold', 'Maxwell', 'Gideon', 'Thaddeus', 'Felix', 'Raymond', 'Victor', 'Sterling', 'Desmond', 'Augustus', 'Calvin', 'Harlan', 'Booker', 'Enzo', 'Kenji', 'Mateo'];
  D.femaleNames = ['Vivian', 'Lorraine', 'Delphine', 'Estelle', 'Beatrix', 'Josephine', 'Marguerite', 'Celeste', 'Ruby', 'Odette', 'Harriet', 'Genevieve', 'Rosalind', 'Winifred', 'Lucille', 'Mabel', 'Cordelia', 'Florence', 'Evangeline', 'Simone', 'Camille', 'Dorothea', 'Ingrid', 'Paloma', 'Mei', 'Zelda', 'Bernadette', 'Coraline', 'Thea', 'Nadia'];
  D.lastNames = ['Marlowe', 'Vance', 'Sinclair', 'Delacroix', 'Ashworth', 'Blackwood', 'Carrington', 'Devereaux', 'Fairbanks', 'Galloway', 'Hawthorne', 'Kensington', 'Lockhart', 'Montrose', 'Pemberton', 'Ravenscroft', 'Sterling', 'Thorne', 'Underwood', 'Whitlock', 'Castellano', 'Okafor', 'Nakamura', 'Rosenthal', 'Beaumont', 'Calloway', 'Duvall', 'Ellington', 'Fontaine', 'Grimaldi', 'Holloway', 'Langford', 'Moreau', 'Prescott', 'Quill', 'Winters', 'Bishop', 'Crane', 'Harlow', 'Navarro'];

  D.occupations = ['Nightclub Singer', 'Bandleader', 'Financier', 'Socialite', 'Gossip Columnist', 'Architect', 'Film Producer', 'Stage Star', 'Liquor Importer', 'Attorney', 'Society Physician', 'Art Dealer', 'Jeweler', 'Jazz Pianist', 'City Alderman', 'Prizefighter', 'Novelist', 'Chauffeur', 'Club Owner', 'Couturier', 'Aviator', 'Professor', 'Private Banker', 'Press Photographer', 'Radio Host', 'Shipping Magnate'];
  D.victimOcc = ['steel tycoon', 'Broadway impresario', 'newspaper baron', 'celebrated bandleader', 'silent-film idol', 'society jeweler', 'railroad heir', 'nightclub magnate', 'famed architect', 'radio crooner', 'art collector', 'retired judge', 'department-store king', 'champagne importer'];
  D.relations = ['business partner', 'former spouse', 'protégé', 'bitter rival', 'half-sibling', 'private secretary', 'oldest friend', 'creditor', 'secret lover', 'bandmate', 'neighbour across the hall', 'personal attorney', 'physician', 'ward', 'fiancé(e)', 'silent investor'];

  D.personalities = ['suave', 'nervous', 'hostile', 'melancholy', 'theatrical', 'cold'];
  D.persLabel = { suave: 'Smooth as silk', nervous: 'Jumpy', hostile: 'Short-fused', melancholy: 'World-weary', theatrical: 'Loves an audience', cold: 'Ice in the veins' };

  /* Dialogue colour by personality */
  D.lines = {
    greet: {
      suave: ['Detective. I wondered when you\'d come calling. Drink?', 'Ask your questions. I have nothing but time — and charm.'],
      nervous: ['Oh! Detective — I, I already told the officer everything.', 'Is this going to take long? My hands won\'t stop shaking.'],
      hostile: ['Make it quick, flatfoot.', 'I don\'t talk to cops without a reason. Give me one.'],
      melancholy: ['Another night, another body. Sit down, detective.', 'Go ahead and ask. It won\'t bring anyone back.'],
      theatrical: ['The detective arrives! At last, a scene worth playing.', 'Darling, do stand in the light. There. Now — interrogate me.'],
      cold: ['Detective. State your business.', 'You have my attention. Briefly.']
    },
    pre: {
      suave: ['Naturally. ', 'Easy. ', 'Let me think... '], nervous: ['I — um — ', 'Right, yes, ', 'W-well, '],
      hostile: ['Fine. ', 'You deaf? ', 'Write this down: '], melancholy: ['If it matters... ', 'As I recall, ', 'Sure. '],
      theatrical: ['Picture it: ', 'Ah! ', 'Oh, it was a NIGHT. '], cold: ['Simple. ', 'For the record: ', '']
    },
    irrelevant: {
      suave: ['I\'m afraid that means nothing to me, detective.', 'Charming. But it isn\'t mine.'],
      nervous: ['I — I don\'t know what that is! Why are you showing me that?', 'That\'s nothing to do with me, I swear.'],
      hostile: ['Get that out of my face.', 'You\'re fishing. And you\'re wasting my night.'],
      melancholy: ['Doesn\'t ring a bell. Few things do, anymore.', 'Not mine. I wish I could help.'],
      theatrical: ['A prop without a play, darling. Next!', 'How dull. I\'ve no idea.'],
      cold: ['Irrelevant.', 'That has nothing to do with me. Move on.']
    },
    clam: {
      suave: 'I think we\'re done here, detective. Next time, bring a warrant — or better manners.',
      nervous: 'I can\'t — I won\'t say another word. Please, just go.',
      hostile: 'That\'s it. Not one more word without my lawyer.',
      melancholy: 'I\'m tired, detective. No more.',
      theatrical: 'Curtain! This performance is over.',
      cold: 'This conversation has ended.'
    },
    motiveAdmit: {
      suave: 'Well. You\'ve done your homework. Yes — it\'s true. But a motive isn\'t a murder, detective.',
      nervous: 'All right! Yes! It\'s true, all of it — but I didn\'t kill anybody, I swear on my mother!',
      hostile: 'So what? Half this town wanted that snake dead. Doesn\'t mean I did it.',
      melancholy: 'So you found it. Yes. I hated the truth of it. But I didn\'t do this.',
      theatrical: 'Exposed! Oh, how deliciously tawdry. Yes, yes, it\'s true — but murder? So unoriginal.',
      cold: 'Correct. It is also not a crime. Unlike what you\'re implying.'
    },
    breakLie: {
      suave: 'Ah. You do have sharp ears. Very well — I stepped out. For air. Alone. That\'s all you\'ll get.',
      nervous: 'I — no — okay! I wasn\'t there! I was... walking. Just walking! Alone!',
      hostile: 'So I wasn\'t there. So what? I was walking it off. Alone. Prove otherwise.',
      melancholy: 'You\'re right. I lied. I was out in the rain, alone. I don\'t expect you to believe me.',
      theatrical: 'A small embellishment! I was... wandering the night. Solo. An artist needs solitude.',
      cold: 'A minor inaccuracy. I was alone, elsewhere. I decline to elaborate.'
    },
    secretAdmit: {
      suave: 'You have me. Discretion, detective — I beg you.',
      nervous: 'Please don\'t tell anyone! I only lied because I was ashamed!',
      hostile: 'Fine. You caught me. Happy? It\'s got nothing to do with the stiff.',
      melancholy: 'Yes. That\'s where I was. Not proud of it.',
      theatrical: 'My secret shame, dragged into the footlights! Yes, it\'s true.',
      cold: 'Accurate. And entirely unrelated to your case.'
    },
    traitYes: ['Plenty of people fit that, detective. It proves nothing.', 'That could be anyone\'s. Even mine. So what?', 'You\'ll need more than that.'],
    traitNo: ['Look at me, detective. That obviously isn\'t mine.', 'Not mine. See for yourself.', 'Wrong tree. Keep barking.'],
    weapon: ['I\'ve never seen that before in my life.', 'Ugly thing. Not mine.', 'If that\'s the weapon, I hope you find who held it.']
  };

  D.elsewhere = ['at home with a book and a bottle', 'walking by the river in the rain', 'driving the coast road to clear my head', 'alone at the late picture show', 'asleep in my apartment', 'in my study, working'];
  D.secrets = [
    { what: 'losing a small fortune at the tables', admit: 'I was gambling again. I promised I\'d quit.' },
    { what: 'meeting someone who isn\'t their spouse', admit: 'I was meeting... a friend. A married friend.' },
    { what: 'selling a string of pearls that didn\'t look like theirs', admit: 'I was pawning jewels. They weren\'t exactly mine to pawn.' },
    { what: 'drinking alone until the bottle was empty', admit: 'I was drinking. I\'ve been "on the wagon" for a year. Supposedly.' },
    { what: 'slipping an envelope to a man in a grey hat', admit: 'I was paying off a debt to people you don\'t say no to.' },
    { what: 'auditioning in secret for a rival show', admit: 'I was auditioning for the competition. If it gets out, I\'m finished here.' }
  ];

  /* motives: gossip is spoken by another suspect about S; doc is the physical proof */
  D.motives = {
    inherit: { label: 'Inheritance', gossip: '{S} was about to be cut out of the will. A fortune, gone with one signature.', doc: 'Amended Will', icon: 'doc', text: 'A will revised only last week. One name has been struck through in angry red ink: {S}. The signing was set for tomorrow morning.', confess: 'That money was MINE. I earned it with twenty years of smiling at that monster.' },
    blackmail: { label: 'Blackmail', gossip: '{V} had photographs of {S}. The kind that end careers. {S} had been paying for months.', doc: 'Blackmail Photographs', icon: 'photo', text: 'An envelope of photographs and a typed demand: "$5,000 by Friday, {S}, or these go to every paper in town." Signed by {V}.', confess: 'There was never going to be a last payment. There was only ever going to be one way to stop it.' },
    jealousy: { label: 'Jealousy', gossip: '{S} found out {V} had taken a new lover. I heard the shouting from the street.', doc: 'Perfumed Love Letters', icon: 'doc', text: 'Letters from {V} to a new lover — with a furious note scrawled across them in {S}\'s hand: "You\'ll regret this."', confess: 'I gave everything. And I was replaced like a burnt-out bulb.' },
    debt: { label: 'Gambling Debt', gossip: '{S} owed {V} more money than this city prints. The marker came due tonight.', doc: 'IOU Marker', icon: 'doc', text: 'A casino marker: {S} owes {V} the sum of $40,000. Stamped "DUE AT MIDNIGHT — NO EXTENSIONS."', confess: 'Forty thousand. Midnight. Dead men don\'t collect.' },
    betrayal: { label: 'Business Betrayal', gossip: '{V} was selling the company out from under {S}. Years of work, sold for a song.', doc: 'Secret Sale Contract', icon: 'doc', text: 'A contract selling the whole enterprise to a rival, signed by {V} alone. {S}\'s partnership share: nothing.', confess: 'We built it together. Then my own partner sold my life out from under me.' },
    revenge: { label: 'Old Revenge', gossip: 'There\'s old blood between {S} and {V}. Something about a fire, years ago. {S} never forgot.', doc: 'Yellowed Clipping', icon: 'news', text: 'A newspaper clipping, ten years old: "{V} CLEARED IN WAREHOUSE BLAZE." In the margin, {S} has written: "My family. Never forgiven."', confess: 'Ten years I waited. Ten years I watched that smile at parties.' },
    theft: { label: 'Stolen Work', gossip: 'Everything {V} was famous for? {S} made it. {V} just signed it.', doc: 'Original Manuscript', icon: 'doc', text: 'The original draft of {V}\'s celebrated masterpiece — in {S}\'s handwriting, dated a year before {V} "created" it.', confess: 'Every ovation, every headline — they were mine. All I ever got was the silence.' },
    silence: { label: 'Silencing a Witness', gossip: '{V} knew something about {S}. Something for the District Attorney. {V} was going to talk.', doc: 'Unsent Letter to the D.A.', icon: 'doc', text: 'A letter, never mailed: "To the District Attorney — I can no longer stay silent about what {S} did." Signed {V}.', confess: 'One letter. One stamp. That was all that stood between me and the chair.' },
    insurance: { label: 'Insurance Payout', gossip: '{S} took out a policy on {V} last month. A big one. Draw your own picture.', doc: 'Life Insurance Policy', icon: 'doc', text: 'A life insurance policy on {V}, thirty days old. Value: $100,000. Sole beneficiary: {S}.', confess: 'A hundred thousand dollars for one bad night. Tell me you wouldn\'t think about it.' },
    rival: { label: 'Bitter Rivalry', gossip: '{V} took the one thing {S} had been promised. Humiliated {S} in front of the whole room.', doc: 'Crumpled Telegram', icon: 'doc', text: 'A crumpled telegram to {S}: "REGRET TO INFORM — POSITION AWARDED TO {V} STOP". The paper has been torn nearly in half.', confess: 'It was promised to me. I was laughed at. Nobody laughs now.' },
    spurned: { label: 'Spurned Love', gossip: '{S} proposed to {V}. {V} laughed. In public. I was there.', doc: 'Returned Ring', icon: 'ring', text: 'An engagement ring in a velvet box, with {V}\'s note: "{S} — don\'t be absurd. Keep it." ', confess: 'I offered my whole heart, and it was handed back like a coat-check ticket.' },
    embezzle: { label: 'Embezzlement', gossip: '{S} has been cooking the books for years. {V} finally ordered an audit.', doc: 'Doctored Ledger', icon: 'doc', text: 'Two ledgers — one real, one false. $80,000 is missing, every false entry in {S}\'s hand. {V} had circled them all.', confess: 'The audit was Monday. I couldn\'t let there be a Monday.' }
  };

  D.wound = {
    blunt: 'a single crushing blow to the skull — blunt trauma',
    blade: 'a deep, narrow stab wound beneath the ribs',
    gun: 'a single small-calibre gunshot at close range',
    strangle: 'ligature marks around the throat — strangulation',
    poison: 'cyanosis and the scent of bitter almonds — poison'
  };
  D.woundShort = { blunt: 'Blunt trauma', blade: 'Stab wound', gun: 'Gunshot', strangle: 'Strangulation', poison: 'Poison' };
  D.weapons = {
    statuette: { n: 'Bronze Statuette', c: 'blunt', icon: 'blunt', hot: 'Wiped in a hurry — but blood and hair still cling to the base.', cold: 'Heavy, but furred with dust. Nobody has lifted it in months.' },
    candlestick: { n: 'Brass Candlestick', c: 'blunt', icon: 'blunt', hot: 'One edge is dented and sticky with drying blood.', cold: 'Old wax, old dust. Untouched.' },
    niblick: { n: 'Golf Club', c: 'blunt', icon: 'blunt', hot: 'The head is bent. Something dark has dried in the grooves.', cold: 'Spotless and still in its leather cover.' },
    bottle: { n: 'Champagne Magnum', c: 'blunt', icon: 'blunt', hot: 'Cracked at the base, with blood under the foil.', cold: 'Still corked and chilled. Harmless.' },
    opener: { n: 'Silver Letter Opener', c: 'blade', icon: 'blade', hot: 'Rinsed — but blood has pooled where the blade meets the hilt.', cold: 'Blunt, tarnished, and cobwebbed.' },
    razor: { n: 'Straight Razor', c: 'blade', icon: 'blade', hot: 'Folded shut over a blade still wet and red.', cold: 'Dry, with a rust-bloomed edge. Unused for weeks.' },
    icepick: { n: 'Ice Pick', c: 'blade', icon: 'blade', hot: 'The steel is stained to the handle.', cold: 'Clean, with flecks of bar ice. Just a tool.' },
    dagger: { n: 'Jewelled Dagger', c: 'blade', icon: 'blade', hot: 'A collector\'s piece — recently, clumsily cleaned. Blood in the engraving.', cold: 'Sealed in its sheath with unbroken wax.' },
    revolver: { n: '.38 Revolver', c: 'gun', icon: 'gun', hot: 'One chamber fired. The barrel still smells of cordite.', cold: 'Fully loaded. Cold. Hasn\'t been fired in years.' },
    derringer: { n: 'Pearl Derringer', c: 'gun', icon: 'gun', hot: 'One spent shell. Powder burns on the pearl grip.', cold: 'Unloaded. A showpiece.' },
    stocking: { n: 'Silk Scarf', c: 'strangle', icon: 'cord', hot: 'Twisted into a rope, and stretched thin in the middle.', cold: 'Neatly folded. Smells of the laundry.' },
    wire: { n: 'Piano Wire', c: 'strangle', icon: 'cord', hot: 'Looped at both ends for a grip — with skin caught in the coil.', cold: 'Still coiled in its paper packet.' },
    cord: { n: 'Curtain Cord', c: 'strangle', icon: 'cord', hot: 'Cut from its curtain. The tassel is torn where a hand gripped it.', cold: 'Still tied to its curtain. Never removed.' },
    cyanide: { n: 'Cyanide Vial', c: 'poison', icon: 'vial', hot: 'Nearly empty. A bitter-almond reek when uncorked.', cold: 'Sealed with a chemist\'s wax stamp. Full.' },
    arsenic: { n: 'Tin of Rat Poison', c: 'poison', icon: 'vial', hot: 'The lid is pried open; a spoonful is missing. A sticky cocktail glass sits beside it.', cold: 'Rusted shut. Not opened this decade.' }
  };

  /* Killer trait clues */
  D.traitVals = {
    hair: ['black', 'brown', 'blonde', 'red', 'silver'],
    hand: ['right', 'right', 'left'],
    height: ['tall', 'average', 'short'],
    smoke: ['Gold Comet cigarettes', 'Havana cigars', 'a briar pipe', 'nothing', 'nothing'],
    scent: ['jasmine', 'sandalwood', 'bay rum', 'lavender', 'none', 'none'],
    fabric: ['crimson', 'emerald', 'sapphire', 'plum', 'ivory', 'charcoal'],
    print: ['whorl', 'loop', 'arch']
  };
  D.traitLabel = { hair: 'Hair', hand: 'Hand', height: 'Build', smoke: 'Smokes', scent: 'Scent', fabric: 'Wears', print: 'Print', initial: 'Initials' };
  D.traitClue = {
    hair: { n: 'Strand of Hair', icon: 'hair', t: v => `A single ${v} hair, torn out at the root, clenched in the victim's fist. It belongs to the killer.`, short: v => `${G.cap(v)} hair` },
    hand: { n: 'Angle of the Wound', icon: 'hand', t: v => `The coroner is certain: the fatal blow was struck by a ${v}-handed assailant.`, short: v => `${G.cap(v)}-handed` },
    height: { n: 'Fresh Footprint', icon: 'foot', t: v => `A fresh shoe-print in the spilled drink beside the body — ${v === 'tall' ? 'large, with a long stride: a tall person' : v === 'short' ? 'small and close-set: a short person' : 'medium, even stride: someone of average build'}.`, short: v => `${G.cap(v)} build` },
    smoke: { n: 'Still-Warm Ash', icon: 'smoke', t: v => `${v === 'a briar pipe' ? 'A knocked-out plug of pipe tobacco' : v === 'Havana cigars' ? 'A crushed Havana cigar stub' : 'A Gold Comet cigarette, lipstick-free'}, still warm when the body was found. The killer smokes ${v}.`, short: v => `Smokes ${v.replace('a ', '')}` },
    scent: { n: 'Lingering Scent', icon: 'scent', t: v => `A handkerchief dropped in the struggle, heavy with ${v}. The victim wore no scent at all.`, short: v => `${G.cap(v)} scent` },
    fabric: { n: 'Torn Thread', icon: 'thread', t: v => `Threads of ${v} cloth snagged on a splintered edge at shoulder height, torn loose as the killer fled.`, short: v => `${G.cap(v)} clothing` },
    print: { n: 'Fingerprint', icon: 'print', t: v => `A clean latent print lifted from the murder weapon. Pattern: ${v.toUpperCase()}.`, short: v => `${G.cap(v)} print` },
    initial: { n: 'Monogrammed Cufflink', icon: 'ring', t: v => `A gold cufflink torn off in the struggle, engraved with a single letter: "${v}". One of the killer's initials.`, short: v => `Initial "${v}"` }
  };
  D.sightLine = {
    hair: v => `I only caught a glimpse under the lamp — ${v} hair, that I'd swear to.`,
    height: v => `Couldn't see a face. But ${v === 'tall' ? 'whoever it was had to duck under the awning. Tall.' : v === 'short' ? 'they barely came up to the door handle. Short.' : 'neither tall nor short. Ordinary build.'}`,
    smoke: v => `They stopped to light up — ${v}. I know the smell.`,
    scent: v => `They brushed right past me. Reeked of ${v}.`,
    fabric: v => `All I saw was the clothes — ${v}, bright as day under the lamp.`
  };

  D.flavor = ['Dust, and the ghost of old perfume. Nothing useful.', 'You search it twice. Nothing.', 'A matchbook from a club that closed years ago. Irrelevant.', 'Only shadows and lint.', 'Nothing here but your own reflection.', 'A dead end. The city keeps its secrets.', 'Empty — unless you count the spider.', 'Somebody\'s forgotten glove. Months old.', 'You find a nickel. The night isn\'t a total loss.', 'Nothing. Even the dust looks bored.'];

  D.caseAdj = ['Crimson', 'Silent', 'Gilded', 'Velvet', 'Broken', 'Last', 'Scarlet', 'Sapphire', 'Hollow', 'Smoking', 'Vanishing', 'Midnight', 'Ivory', 'Whispering', 'Lonesome', 'Gossamer'];
  D.caseNoun = ['Saxophone', 'Orchid', 'Alibi', 'Elevator', 'Encore', 'Champagne', 'Curtain Call', 'Telegram', 'Cigarette', 'Nocturne', 'Fedora', 'Chandelier', 'Waltz', 'Pearl', 'Spotlight', 'Masquerade'];
  D.kingpins = ['The Jade Baron', 'Madame Onyx', 'The Brass Cardinal', 'The Velvet Duke', 'The Silver Widow', 'The Gilt Spider', 'Mister Midnight', 'The Porcelain Queen'];

  /* Difficulty tiers */
  D.tiers = [
    { id: 0, name: 'Rookie Beat', sub: '5 suspects · helpful witnesses · the notebook flags mismatches', nSus: 5, nLoc: 5, budget: 360, staff: 1, typeA: 0.85, kMin: 3, kMax: 4, lead: 1, assist: true, mult: 1, rank: 0, secret: 0.5 },
    { id: 1, name: 'Hardboiled', sub: '6 suspects · secrets and lies · no hand-holding', nSus: 6, nLoc: 5, budget: 345, staff: 0.85, typeA: 0.6, kMin: 3, kMax: 4, lead: 0.8, assist: false, mult: 1.6, rank: 2, secret: 1 },
    { id: 2, name: 'Noir', sub: '7 suspects · six locations · unreliable witnesses', nSus: 7, nLoc: 6, budget: 335, staff: 0.7, typeA: 0.5, kMin: 3, kMax: 3, lead: 0.6, assist: false, mult: 2.4, rank: 4, secret: 1 },
    { id: 3, name: 'Legend', sub: '8 suspects · the clock is merciless', nSus: 8, nLoc: 6, budget: 310, staff: 0.6, typeA: 0.4, kMin: 3, kMax: 3, lead: 0.45, assist: false, mult: 3.4, rank: 7, secret: 1 }
  ];
  D.bossTier = { id: 4, name: 'Kingpin', sub: '', nSus: 8, nLoc: 7, budget: 350, staff: 0.6, typeA: 0.4, kMin: 3, kMax: 4, lead: 0.5, assist: false, mult: 4.5, rank: 0, secret: 1 };

  D.ranks = [
    ['Gumshoe', 0], ['Private Eye', 1200], ['Shamus', 3200], ['Sleuth', 6500], ['Inspector', 11500], ['Chief Inspector', 19000],
    ['Ace Detective', 30000], ['Master Sleuth', 46000], ['Commissioner\'s Pride', 70000], ['Scourge of the Syndicate', 105000],
    ['Legend of Gilt City', 160000], ['The Midnight Oracle', 250000]
  ];
  G.rankOf = function (xp) {
    let i = 0;
    while (i + 1 < D.ranks.length && xp >= D.ranks[i + 1][1]) i++;
    const cur = D.ranks[i][1], next = i + 1 < D.ranks.length ? D.ranks[i + 1][1] : null;
    return { i, name: D.ranks[i][0], cur, next, pct: next ? (xp - cur) / (next - cur) : 1 };
  };

  D.upgrades = [
    { id: 'roadster', n: 'Midnight Roadster', icon: 'car', max: 3, base: 350, d: l => `Travel takes ${20 - 4 * l} minutes`, tip: 'Twelve cylinders of purring impatience. Cuts travel time.' },
    { id: 'kit', n: 'Forensics Kit', icon: 'print', max: 3, base: 300, d: l => l >= 3 ? 'Searches take 4 min · evidence spots glow' : `Searches take ${10 - 2 * l} minutes`, tip: 'Powders, tweezers, lenses. Faster searches — and at level 3, hidden evidence gleams.' },
    { id: 'informants', n: 'Informant Network', icon: 'talk', max: 3, base: 450, d: l => `${1 + l} tip${l ? 's' : ''} per case`, tip: 'Newsboys, bellhops and bartenders on the payroll. More tips each case.' },
    { id: 'tongue', n: 'Silver Tongue', icon: 'ring', max: 2, base: 600, d: l => `Suspects tolerate ${3 + l} bad guesses`, tip: 'Suspects stay talking longer when you present the wrong evidence.' },
    { id: 'watch', n: 'Lucky Pocket Watch', icon: 'clock', max: 3, base: 500, d: l => `+${15 * l} minutes every case`, tip: 'It runs slow. Somehow, so does the night.' },
    { id: 'press', n: 'Press Agent', icon: 'news', max: 4, base: 400, d: l => `+${15 * l}% cash from cases`, tip: 'Your name above the fold. Fame pays.' },
    { id: 'hands', n: 'Steady Hands', icon: 'hand', max: 2, base: 550, d: l => ['Standard locks and safes', 'Locks and safes are easier', 'Locks and safes are much easier'][l], tip: 'Lockpicks and a stethoscope, and the nerve to use them.' }
  ];
  G.upLevel = id => (G.save.d.upgrades[id] || 0);
  G.upCost = function (u) { const l = G.upLevel(u.id); return Math.round(u.base * Math.pow(l + 1, 1.7) / 10) * 10; };

  D.achievements = [
    { id: 'first', n: 'First Collar', d: 'Solve your first case', r: 100 },
    { id: 'solve5', n: 'On the Beat', d: 'Solve 5 cases', r: 200 },
    { id: 'solve25', n: 'Veteran', d: 'Solve 25 cases', r: 600 },
    { id: 'solve100', n: 'A Hundred Midnights', d: 'Solve 100 cases', r: 2500 },
    { id: 's1', n: 'Flawless', d: 'Earn an S rank', r: 150 },
    { id: 's10', n: 'Gilded Record', d: 'Earn 10 S ranks', r: 800 },
    { id: 'streak3', n: 'Hot Streak', d: 'Solve 3 cases in a row', r: 150 },
    { id: 'streak7', n: 'Untouchable', d: 'Solve 7 cases in a row', r: 500 },
    { id: 'streak15', n: 'The Inevitable', d: 'Solve 15 cases in a row', r: 1500 },
    { id: 'speed', n: 'Home Before Dawn', d: 'Solve a case with half the night to spare', r: 250 },
    { id: 'smooth', n: 'Smooth Operator', d: 'Solve a case without a single wrong press', r: 150 },
    { id: 'thorough', n: 'No Stone Unturned', d: 'Find every piece of evidence in a case', r: 300 },
    { id: 'lies10', n: 'Human Polygraph', d: 'Break 10 false alibis', r: 400 },
    { id: 'secrets10', n: 'Keeper of Secrets', d: 'Expose 10 secrets', r: 400 },
    { id: 'minis25', n: 'Nimble Fingers', d: 'Complete 25 locks, safes and puzzles', r: 400 },
    { id: 'rank4', n: 'Inspector', d: 'Reach the rank of Inspector', r: 500 },
    { id: 'rank9', n: 'Scourge', d: 'Reach Scourge of the Syndicate', r: 2000 },
    { id: 'daily1', n: 'Morning Edition', d: 'Solve a Daily Case', r: 150 },
    { id: 'daily7', n: 'Seven Editions', d: 'Reach a 7-day Daily streak', r: 1000 },
    { id: 'boss1', n: 'Kingpin Down', d: 'Bring down a Syndicate Kingpin', r: 1000 },
    { id: 'boss3', n: 'Syndicate in Ruins', d: 'Bring down 3 Kingpins', r: 3000 },
    { id: 'legend', n: 'Legendary', d: 'Solve a Legend-tier case', r: 800 },
    { id: 'rich', n: 'Gilded', d: 'Earn $25,000 in total', r: 500 },
    { id: 'maxed', n: 'Fully Equipped', d: 'Max out any office upgrade', r: 400 }
  ];

  D.help = [
    ['The Night Is Short', 'A body. A list of suspects. One long night to name the killer. <b>Everything costs time</b> — travelling, searching, questioning. When the clock runs out, the Commissioner wants a name.'],
    ['Search the Scene', 'Gold diamonds mark places you can search. <b>Evidence found at the crime scene belongs to the killer</b> — a hair, a footprint, a scent. Compare it against your suspects in the notebook.'],
    ['Question Everyone', 'Ask where they were, who they saw, and who had a motive. Then ask the <b>staff</b> — bartenders and doormen have no reason to lie. Present evidence to crack a false story.'],
    ['The Golden Rules', '<b>1.</b> The killer acted alone and lies about where they were.<br><b>2.</b> Innocent people may lie — but only to hide a private shame.<br><b>3.</b> If anyone else places a suspect away from the scene, that alibi is <b>solid</b>.'],
    ['Make the Accusation', 'Name the <b>killer</b>, the <b>weapon</b> and the <b>motive</b>. The faster and more complete your case, the higher your rank — and the bigger your fee. Solve cases to climb the ranks and close in on the Syndicate.']
  ];
})();
