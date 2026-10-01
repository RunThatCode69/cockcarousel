
// ================================================================
//  MISSIONS — five of them, parodying CoD4 beat for beat
// ================================================================
function grid(w, h) { return Array.from({ length: h }, () => '#'.repeat(w)); }
function carve(g, x0, y0, x1, y1, ch = '.') { for (let y = y0; y <= y1; y++) g[y] = g[y].slice(0, x0) + ch.repeat(x1 - x0 + 1) + g[y].slice(x1 + 1); }
function put(g, x, y, ch) { g[y] = g[y].slice(0, x) + ch + g[y].slice(x + 1); }
const noEnemies = () => aliveEnemies().length === 0;
const near = (x, y, r = 1.5) => dist(player, { x, y }) < r;
const openGate = (x, y) => { if (cell(x, y) === 'G') { setCell(x, y, '.'); announce('GATE OPEN', '', 34); sfx('select'); } };
const iconDick = o => drawDick(0, 0, 1.1, Object.assign({ still: true, look: 0 }, o));

const MISSION_META = [
  { name: 'Bootie Camp', place: 'S.A.S. HQ, Crotchenhill, U.K.', date: 'DAY 1 · 06:09', icon: () => iconDick({ hat: 'drill', stache: 1.3, angry: true, yell: true }) },
  { name: 'All Girthed Up', place: 'Pubyat, 15 years ago', date: 'DAY -5475 · 04:20', icon: () => { ctx.save(); ctx.translate(0, 8); pubeArt(0, 0, { f: 1 }); ctx.restore(); } },
  { name: 'Crew Expandable', place: 'Cargo ship "MV Blue Balls", Bering Sea', date: 'DAY 3 · 01:00', icon: () => { ctx.save(); ctx.translate(0, 10); ctx.scale(0.7, 0.7); crabArt(0, 0, { f: 0 }); ctx.restore(); } },
  { name: 'The Bog', place: 'The Bog. Somewhere very moist.', date: 'DAY 5 · 23:40', icon: () => { ctx.save(); ctx.translate(0, -6); ctx.scale(1.2, 1.2); ctx.fillStyle = '#8c8460'; ctx.strokeStyle = INK; ctx.lineWidth = 3; rr(-40, -14, 80, 22, 5); ctx.fill(); ctx.stroke(); rr(-20, -30, 38, 18, 5); ctx.fill(); ctx.stroke(); rr(14, -26, 34, 9, 4); fs(SKIN, INK, 2.5); E(50, -21.5, 7, 6); fs(HEAD, INK, 2.5); rr(-44, 6, 88, 12, 6); fs('#26262a', INK, 2.5); ctx.restore(); } },
  { name: "No Rushin'", place: 'Terminal 69, Pubyat International', date: 'DAY 4 · 10:30', icon: () => { ctx.save(); ctx.translate(0, 10); ctx.scale(0.65, 0.65); condomArt(0, 0, { f: 0 }); ctx.restore(); } },
  { name: 'Scorched Girth', place: 'Boinlin, Germany', date: 'DAY 9 · 15:20', icon: () => { ctx.save(); ctx.translate(0, -8); ctx.fillStyle = '#6a6070'; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.save(); ctx.rotate(0.35); rr(-14, -40, 28, 70, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffe9a8'; for (let i = 0; i < 6; i++) ctx.fillRect(-8 + (i % 2) * 10, -32 + ((i / 2) | 0) * 18, 6, 8); ctx.restore(); ctx.fillStyle = 'rgba(200,190,170,0.8)'; for (let i = 0; i < 7; i++) { E(-30 + i * 10, 34 + (i % 2) * 4, 9, 7); ctx.fill(); } ctx.restore(); } },
  { name: 'GAME OVA', place: 'Bridge over the Tubes', date: 'DAY 6 · 11:11', icon: () => iconDick({ coat: true, onearm: true, angry: true, frown: true, scar: true, skin: '#e9b39d', skin2: '#d8927c' }) },
];
const PAL = {   // v4.3: CoD-ish palettes — overcast UK, grey pre-dawn Pubyat, storm at sea, fluorescent clinic, smoky sunset bridge
  camp: { ceil: ['#7d8fa0', '#c9d0d4'], fog: '#aeb7bc', fogDist: 18, sun: true, clouds: true, cloudC: 'rgba(205,210,216,0.95)', silhouette: 'mountains', silC: '#6d7c70', plumes: 1 },
  bush: { ceil: ['#3e474e', '#9aa2a2'], fog: '#7c8584', fogDist: 16, silhouette: 'bush', silC: '#39443e', clouds: true, cloudC: 'rgba(62,68,74,0.95)', tuftC: '#7a6a40', plumes: 1 },
  ship: { moon: true, clouds: true, cloudC: 'rgba(40,48,58,0.9)', silhouette: 'sea', silC: '#101820', weather: 'rain', ceil: ['#070b10', '#1c2632'], fog: '#131b24', fogDist: 10, dark: 0.08, lightning: true },
  clinic: { ceil: ['#e8ece8', '#ffffff'], fog: '#c8ccc8', fogDist: 28 },
  bridge: { ceil: ['#5d8cc0', '#d8e2ea'], fog: '#b4c0c8', fogDist: 20, sun: true, clouds: true, cloudC: 'rgba(240,242,245,0.95)', silhouette: 'mountains', silC: '#6d7a7c', plumes: 5 },
  bog: { moon: true, clouds: true, cloudC: 'rgba(52,44,36,0.9)', silhouette: 'mountains', silC: '#1a1610', ceil: ['#0a0a0e', '#4a3420'], fog: '#2c2418', fogDist: 14, weather: 'embers', plumes: 6 },
  finale: { ceil: ['#3a3a3c', '#8a8680'], fog: '#4a4846', fogDist: 12, dark: 0.1, silhouette: 'mountains', silC: '#2a2a2a', weather: 'embers', plumes: 6 },
};
Object.assign(PAL.camp, { hemiSky: '#dfe6ee', hemiGround: '#6a6a58', hemiI: 1.45, sunC: '#fff1dc', sunI: 1.9, fogNear: 16, carousel: [60, -40, 1.6], cod: { sat: 0.8, con: 1.1, shadow: [0.94, 1.0, 1.05], high: [1.03, 1.0, 0.95], vig: 0.35, bloom: 0.25 } });
Object.assign(PAL.bush, { exposure: 1.55, hemiSky: '#c4ccd0', hemiGround: '#5a5a48', hemiI: 2.0, sunC: '#e6e8e8', sunI: 1.6, fogNear: 10, carousel: [26, -40, 2.2], cod: { sat: 0.7, con: 1.15, shadow: [0.9, 1.02, 1.05], high: [1.0, 1.02, 0.95], vig: 0.45, grain: 0.025, bloom: 0.3 } });
Object.assign(PAL.ship, { exposure: 1.5, hemiSky: '#9ab0c8', hemiGround: '#3a424c', hemiI: 2.1, sunC: '#c8d8f0', sunI: 1.3, fogNear: 7, cod: { sat: 0.7, con: 1.2, shadow: [0.88, 0.98, 1.1], high: [1.0, 1.0, 1.02], vig: 0.5, grain: 0.025, bloom: 0.45 } });
Object.assign(PAL.clinic, { hemiSky: '#ffffff', hemiGround: '#b8bcb8', hemiI: 1.5, sunC: '#f6fff4', sunI: 1.3, fogNear: 16, cod: { sat: 0.8, con: 1.1, shadow: [0.96, 1.02, 1.0], high: [1.0, 1.02, 0.97], vig: 0.4, bloom: 0.35 } });
Object.assign(PAL.bridge, { hemiSky: '#dbe6f0', hemiGround: '#4a4a42', hemiI: 1.35, sunC: '#fff4e4', sunI: 2.3, fogNear: 16, carousel: [40, -60, 2.4], cod: { sat: 0.8, con: 1.12, shadow: [0.94, 0.99, 1.05], high: [1.04, 1.0, 0.95], vig: 0.35, bloom: 0.35 } });
Object.assign(PAL.bog, { exposure: 2.2, hemiSky: '#a8b0c4', hemiGround: '#5a4830', hemiI: 2.6, sunC: '#c0cce8', sunI: 1.3, fogNear: 6, cod: { sat: 0.5, con: 1.22, shadow: [0.86, 0.95, 1.12], high: [1.12, 1.0, 0.84], vig: 0.6, grain: 0.045, bloom: 0.6 } });
Object.assign(PAL.finale, { hemiSky: '#c8b8a8', hemiGround: '#2a2622', hemiI: 1.0, sunC: '#ffb070', sunI: 1.6, fogNear: 6, cod: { sat: 0.45, con: 1.25, shadow: [0.95, 0.97, 1.02], high: [1.08, 1.0, 0.92], vig: 0.65, grain: 0.06, bloom: 0.5 } });

// ---------- 1. BOOTIE CAMP ----------
const M1 = () => {
  const rows = [
    '################################',
    '#..............#...ttt.........#',
    '#..............#...ttt.........#',
    '#..............#.AAAAAAAAAAAAAA#',
    '#..............#...wwwwwwwww...#',
    '#..............#...wwwwwwwww...#',
    '#..............#AAAAAAAAAAAAAA.#',
    '#..............#......A..j.j...#',
    '#..............#......A..j.j...#',
    '########G#######AAAAAAAGAAAAAAA#',
    '#..............#...............#',
    '#..............#...............#',
    '#.....e........#...............#',
    '#..............#...............#',
    '#..............G...............#',
    '#........e.....#...............#',
    '#..............#...............#',
    '#..............#...............#',
    '#..............#...............#',
    '#..............#...............#',
    '################################',
  ];
  // v4: south of the rubber room — the grenade pit, and THE PIT (Prick's killhouse, plywood, pop-ups, one Nan)
  for (let i = 0; i < 17; i++) rows.push('#'.repeat(32));
  put(rows, 24, 20, 'G');
  carve(rows, 16, 21, 30, 36); carve(rows, 18, 24, 30, 24, 'A'); put(rows, 16, 24, 'G'); put(rows, 17, 24, 'G');
  carve(rows, 1, 21, 14, 36, 'C'); carve(rows, 9, 32, 14, 36); carve(rows, 11, 31, 12, 31); carve(rows, 8, 25, 14, 30); carve(rows, 7, 27, 7, 28); carve(rows, 1, 25, 6, 32); carve(rows, 2, 24, 3, 24); carve(rows, 1, 21, 14, 23);
  put(rows, 15, 34, 'G');
  const shortcut = () => { if (cell(30, 3) === 'A') { map[3][30] = '.'; map[9][30] = '.'; buildMini(); rebuildWalls(); } };
  const PIT_T = [[19.5, 28.8], [23.5, 29], [27.5, 28.8]];
  let pitTg = [], khTg = [], khStage = 0;
  const khSpawn = (list, civs = []) => { for (const [x, y] of list) { const e = spawnEnemy('target', x, y, { reveal: true }); khTg.push(e); } for (const [x, y] of civs) { const c = spawnEnemy('target', x, y, { civ: true, onDeath: () => { M.clock += 180; announce('THAT WAS NAN', '+3 seconds. and a phone call to her family.', 36); say('PRICK', 'That was a civilian. That was somebody\'s Nan.', 160); } }); } sfx('snap'); };
  const targetsAt = pts => pts.map(([x, y]) => spawnEnemy('target', x, y, { reveal: true }));   // red arrows over every target: shoot these
  let tg = [], courseTg = [];
  // the obstacle course: lane 1 hurdles (east), lane 2 barbed-wire crawl (west), lane 3 tyre run + sprint (east) to the flag
  const COURSE = [[29.5, 7.5], [16.6, 4.6], [22.5, 1.4], [26.5, 2.6], [29.6, 1.4]];
  const courseReset = () => { for (const e of courseTg) e.gone = true; ents = ents.filter(e => !e.gone); courseTg = targetsAt(COURSE); player.x = 23.5; player.y = 8.4; player.a = 0; player.crouch = false; M.timer = 60 * 120; M.flags.courseDone = false; M.goal = { x: 29.5, y: 1.5 }; };
  return {
    map: rows, heights: { '#': 2.0, A: 0.75, G: 1.5, j: 0.3, C: 1.6 }, tex: { '#': 'hesco', A: 'sand', G: 'gate', P: 'poster', j: 'wood', C: 'plywood' }, variants: { '#': ['recruit', 7], A: ['crate', 5] }, floor: 'gravel', outer: { ground: 'grass', ring: 'base' }, pal: PAL.camp, start: [7.5, 7.5, -Math.PI / 2], par: 150, music: 'title', amb: 'wind',
    card: ['Day 1 – 06:09:42', "Sgt. 'Soap' MacTugish", '22nd S.A.S. (Sausage Air Service)', 'Crotchenhill, U.K.'],
    props: [['sign', 4.5, 6.5, { spr: 'sign_camp' }], ['sandbags', 2, 3.5], ['sandbags', 13, 3.5], ['sandbags', 5, 3.5], ['sandbags', 10, 3.5], ['flag', 1.5, 1.5], ['tent', 3.5, 17.5], ['tent', 11.5, 17.5], ['palm', 1.5, 10.5], ['palm', 13.5, 18.5],
      ['barrel', 1.5, 13.5], ['barrel', 2.4, 13.6], ['cratestack', 13.5, 11], ['ammobox', 7.5, 12.5, { passable: true }], ['tires', 17, 18.5], ['cactus', 29.5, 18.5], ['cactus', 17, 10.5], ['sandbags', 24, 10.5], ['sandbags', 28, 14.5],
      ['sign', 21.3, 10.4, { spr: 'sign_ship' }], ['sign', 20.5, 29.5, { spr: 'sign_pit' }], ['ammobox', 17.5, 27.5, { passable: true }], ['ammobox', 29.5, 27.5, { passable: true }], ['sandbags', 18, 35.5], ['sandbags', 28, 35.5], ['barrel', 29.5, 21.4], ['flag', 13.6, 21.4, { passable: true }], ['tires', 29.5, 33.5], ['flag', 30.6, 1.2, { passable: true }], ['cone', 24.5, 7.2, { passable: true }], ['cone', 30.5, 5.5, { passable: true }], ['cone', 16.4, 3.4, { passable: true }], ['ammobox', 23.5, 12.5, { passable: true }]],
    scatter: [[['barrel', 'sandbags', 'tires', 'ammobox'], 8, [[7.5, 7.5, 3], [7.5, 1.8, 3], [8.5, 10, 2], [23.5, 8.3, 3], [23, 4.5, 9]], 3]],
    brief: ['> CROTCHENHILL, U.K. — S.A.S. HEADQUARTERS. 06:09.', "Welcome to the S.A.S., new guy. That's the Sausage Air Service. You're the F.N.G.: Freshly Nutted Guy.", 'Captain Prick will be watching. He does not blink. Nobody knows why.',
      'The enemy: the Condom Troopers. They shoot condoms. Get fully wrapped and you are out of the fight.', 'Sarge will teach you to shoot, pump, and eat your vegetables.',
      'Then you run THE COURSE: jump the hurdles, crawl the wire, high-knee the tyres. Wet or go home.', '> OBJECTIVE: graduate without crying.'],
    init() {
      bakeSign('sign_camp', 'BOOTIE CAMP', 'no crying', '#fff6e0', INK); bakeSign('sign_pit', 'THE PIT', "← Prick's killhouse", '#fff6e0', PINK); bakeSign('sign_ship', 'THE COURSE', 'jump · crawl · run →', YEL, INK);
      spawnNpc('sarge', 13, 6.5, 1.15, 0.9, { tick: e => { e.attackT = (t % 90 < 45) ? 5 : 0; } });
    },
    triggers: [
      { x: 8.5, y: 10.5, r: 1.5, fn: () => say('SARGE', 'Room two. Pump it. Press R, or tap RELOAD if you\'re on the little phone.', 260) },
      { x: 20, y: 14, r: 2.5, fn: () => { say('SARGE', "Practice rubbers. They shoot condoms. Three hits and you're wrapped. Dodge, then glob 'em.", 300); } },
      { x: 24.2, y: 8, r: 1.0, fn: () => { say('SARGE', isTouch ? 'GO GO GO! Hurdles! Tap JUMP!' : 'GO GO GO! Hurdles! SPACE to jump!', 220); } },
      { x: 30, y: 5.5, r: 1.0, fn: () => { say('SARGE', isTouch ? 'Wire! Tap CROUCH and crawl, maggot!' : 'Wire! C to crouch and crawl, maggot! Lower! LOWER!', 240); } },
      { x: 16.5, y: 2.5, r: 1.0, fn: () => { say('SARGE', "Tyres! High knees! Shoot the pop-ups! She's timing you!", 220); } },
      { x: 29.6, y: 1.6, r: 1.0, fn: () => { M.flags.courseDone = true; } },
    ],
    stages: [
      { obj: isTouch ? 'Shoot the 5 butt targets at the far wall (tap the right side of the screen)' : 'Shoot the 5 butt targets at the far wall (click to shoot)', count: () => `Targets left: ${tg.filter(e => !e.dead).length}`, hint: 'Turn to face the wall with the butt targets on posts and shoot each one.', start() { tg = targetsAt([[3.5, 1.8], [5.5, 1.8], [7.5, 1.8], [9.5, 1.8], [11.5, 1.8]]); say('SARGE', "Right, new guy. Pick up the DICK-47. That's your rifle. Yes. It is. Don't make it weird.", 280); say('SARGE', isTouch ? 'Tap the right side to fire from the hip. The butts. Shoot the butts.' : 'Click to fire from the hip. The butts. Shoot the butts.', 300); },
      done: () => tg.every(e => e.dead), end() { say('SARGE', "Hip fire's not accurate. Like you. Now do it properly.", 220); } },
      { obj: isTouch ? 'Tap AIM to look down the sights, then shoot the 3 new targets' : 'Hold RIGHT-CLICK to look down the sights, then shoot the 3 new targets', checkpoint: false, count: () => `Aimed: ${M.flags.aded ? 'YES' : 'not yet'} · Targets left: ${tg.filter(e => !e.dead).length}`, hint: isTouch ? 'Tap the AIM button first, THEN shoot. If you shoot them without aiming, they pop back up.' : 'Hold RIGHT-CLICK (or press Z) first, THEN shoot. If you shoot them without aiming, they pop back up.', start() { M.flags.aded = false; tg = targetsAt([[4.5, 1.8], [7.5, 1.8], [10.5, 1.8]]); say('SARGE', isTouch ? 'Tap AIM. Look down the shaft. Line the heart up with the tip.' : 'Right-click. Aim down the sights. Line the heart up with the tip. Yes, the tip.', 300); },
      tick() { if (player.ads > 0.8) M.flags.aded = true; if (!M.flags.aded && tg.every(e => e.dead) && t % 60 === 0) { tg = targetsAt([[4.5, 1.8], [7.5, 1.8], [10.5, 1.8]]); say('SARGE', isTouch ? 'PROPERLY. Tap AIM first. Then shoot.' : 'PROPERLY. Hold right-click to aim first. Then shoot.', 200); } }, done: () => M.flags.aded && tg.every(e => e.dead), end() { say('SARGE', "Beautiful. You look down that shaft like you were born to. Gate's open.", 240); openGate(8, 9); } },
      { obj: isTouch ? 'Walk through the open gate and reload (RELOAD button)' : 'Walk through the open gate and reload (press R)', checkpoint: false, start() { M.goal = { x: 8.5, y: 10.8 }; }, count: () => `Reloaded: ${M.flags.reloaded ? 'YES' : 'not yet'}`, hint: isTouch ? 'Go through the yellow gate in the south wall, then tap RELOAD.' : 'Go through the yellow gate in the south wall, then press R.', done: () => M.flags.reloaded && player.y > 9.5, end() { say('SARGE', 'That\'s the sound. Wet. Now eat both eggplants — they heal you.', 260); } },
      { obj: 'Walk over the 2 purple eggplants to eat them', checkpoint: false, count: () => `Eaten: ${Math.min(2, stats.eggs)}/2`, tick() { const eg = ents.filter(e => e.kind === 'pickup' && e.type === 'eggplant' && !e.got && e.y > 9); if (eg.length) { eg.sort((a, b) => dist(a, player) - dist(b, player)); M.goal = { x: eg[0].x, y: eg[0].y }; } }, done: () => stats.eggs >= 2, end() { openGate(15, 14); M.goal = null; say('SARGE', "Look at you. Big boy now. Next room's got rubbers in it.", 200); } },
      { obj: 'Go through the east gate and kill the 3 practice Condom Troopers. Dodge their condoms.', clearAll: true, count: () => `Condom Troopers left: ${aliveEnemies().length}`, hint: 'Keep moving sideways so the condoms miss. If the WRAPPED bar fills, you lose.', at: [18, 14.5, 0], pre() { openGate(8, 9); openGate(15, 14); }, start() { spawnWave([['condom', 25, 12], ['condom', 22, 17], ['condom', 28, 17.5]]); for (const e of ents) if (e.type === 'condom') { e.hpMul = 1; e.hp = 45; } }, done: () => noEnemies() && player.x > 15,
        end() { openGate(23, 9); say('SARGE', 'THE COURSE. North gate. Hurdles, wire, tyres, flag. Shoot everything that pops up.', 260); } },
      { obj: 'THE COURSE: follow the yellow minimap route to the flag. Jump the hurdles, crawl under the wire.', count: () => `Pop-ups hit: ${courseTg.filter(e => e.dead).length}/5 (optional)`, hint: isTouch ? 'Hurdles: tap JUMP. Barbed wire: tap CROUCH and walk under. Tyres are slow — hop them.' : 'Hurdles: SPACE. Barbed wire: press C to crouch, then walk under. Tyres are slow — hop them.', hintAfter: 900, pre() { openGate(8, 9); openGate(15, 14); openGate(23, 9); }, start() { courseReset(); M.timerLabel = 'COURSE'; M.onTimeout = () => { say('SARGE', 'TOO SLOW. Again. She is not impressed.', 200); courseReset(); }; },
        tick() { if (player.x > 30 && player.y < 6.8 && player.y > 5.2 && !player.crouch && t % 90 === 0) announce(isTouch ? 'TAP CROUCH' : 'PRESS C', 'the wire is right there', 30); },
        done: () => M.flags.courseDone,
        end() {
          const el = (60 * 120 - M.timer) / 60, hit = courseTg.filter(e => e.dead).length; M.timer = null;
          const grade = el < 28 ? 'THROBBING' : el < 40 ? 'HARD' : el < 60 ? 'SEMI' : 'SOFT';
          announce(`RECOMMENDED DIFFICULTY: ${grade}`, `your time ${el.toFixed(1)}s · Captain Prick's time: 16.9s · ${hit}/5 pop-ups`, 34);
          say('SARGE', `${el.toFixed(1)} seconds. Prick did it in sixteen point nine. With a hangover. Nobody's ever beaten it.`, 300);
          say('SARGE', 'South gate. Grenade pit. Then Captain Prick wants a word. In THE PIT.', 260);
          openGate(24, 20); M.goal = { x: 23.5, y: 22.5 }; shortcut();
        } },
      { obj: 'Follow the minimap route through the south gate to the grenade pit', hintAfter: 1200, pre() { shortcut(); openGate(8, 9); openGate(15, 14); openGate(23, 9); openGate(24, 20); M.goal = { x: 23.5, y: 22.5 }; }, at: [29.6, 2.4, Math.PI / 2], done: () => near(23.5, 22.5, 1.6), end() { M.goal = null; } },
      { obj: isTouch ? 'Throw nut-nades (NUT button) OVER the low wall at the 3 targets' : 'Throw nut-nades (press G) OVER the low wall at the 3 targets', count: () => `Targets left: ${pitTg.filter(e => !e.dead).length} · Nuts: ${player.nades}`, hint: 'Face the targets, look up a little, then throw. You can\'t shoot them through the wall. You get more nuts automatically.', hintAfter: 900, at: [23.5, 22.5, Math.PI / 2], pre() { openGate(24, 20); },
        start() { pitTg = targetsAt(PIT_T); player.nades = 3; say('SARGE', "Nut-nades. Pull the pin — it's a pube, don't ask — and LOB it over the wall.", 280); say('SARGE', isTouch ? 'Look UP a bit to throw further. Tap NUT.' : 'Look up a bit to throw further. Press G. You can\'t shoot through the wall, genius.', 260); },
        tick() { if (player.nades <= 0 && !nades.length && t % 60 === 0) { player.nades = 3; say('SARGE', 'More nuts. We have SO many nuts.', 140); } if (M.stageT > 60 * 75 && !M.flags.pitSkip) { M.flags.pitSkip = true; for (const e of pitTg) if (!e.dead) killEnt(e); say('SARGE', 'Close enough. I\'ll put that down as a pass. Barely.', 200); } },
        done: () => pitTg.every(e => e.dead), end() { say('SARGE', "Good arm. She'd be proud. Now get in THE PIT. Prick's waiting.", 220); openGate(16, 24); openGate(17, 24); openGate(15, 34); M.goal = { x: 16.5, y: 34.5 }; } },
      { obj: 'THE PIT: go in the west gate, shoot every pop-up target, reach the flag. Don\'t shoot Nan.', count: () => M.flags.khStage ? `Targets left: ${khTg.filter(e => !e.dead).length} · Nut the 3rd room before you enter` : 'Timer starts when you go in', hint: isTouch ? 'Rooms go: first room → north → west (tap NUT through the door first) → north → east to the flag.' : 'Rooms go: first room → north → west (press G through the door first) → north → east to the flag.', hintAfter: 1200, at: [23.5, 30, Math.PI], pre() { openGate(24, 20); openGate(16, 24); openGate(17, 24); openGate(15, 34); }, checkpoint: true,
        start() { khTg = []; khStage = 0; M.goal = { x: 15.5, y: 34.5 }; player.nades = Math.max(player.nades, 2); M.clock = null; M.clockOn = false;
          say('PRICK', "So you're the new bloke. Captain Prick. It's pronounced the way you think.", 260);
          say('PRICK', 'Killhouse. Pop-ups, plywood, one Nan. Clock starts when you go in. Nut-nade the third room BEFORE you enter.', 320);
          say('PRICK', 'Record is nineteen point two. Mine. I had a hangover and one boot on.', 240); },
        tick() {
          const p = player;
          if (khStage === 0 && p.x < 14.9) { khStage = 1; M.clock = 0; M.clockOn = true; M.clockLabel = 'KILLHOUSE'; M.goal = { x: 13.5, y: 22 }; khSpawn([[10, 35.5], [13.4, 32.4], [9.4, 32.5]], [[12, 35.8]]); say('PRICK', 'GO GO GO!', 90); }
          if (khStage === 1 && p.y < 31.5) { khStage = 2; khSpawn([[8.6, 25.6], [13.5, 25.6], [9, 29.6]], [[13.5, 29.4]]); }
          if (khStage === 2 && p.x < 9.5 && p.y < 30.5 && !M.flags.khHint) { M.flags.khHint = true; say('PRICK', isTouch ? 'Nut in the room! Tap NUT!' : 'Nut in the room! Press G!', 140); }
          if (khStage === 2) { for (const n of nades) if (n.x < 6.9 && n.y > 24.5 && n.y < 32.9 && n.fuse < 3) { khStage = 3; M.flags.flashed = true; } if (p.x < 6.5) { M.flags.r3t = (M.flags.r3t || 0) + 1; if (M.flags.r3t > 240) { khStage = 3; M.clock += 180; announce('NO NUT?', '+3 seconds. you walked in dry.', 34); } } }
          if (khStage === 3) { khStage = 4; khSpawn([[1.6, 25.6], [5.4, 31.4], [1.6, 31.2], [5.4, 25.6]]); if (M.flags.flashed) announce('ROOM NUTTED', 'they\'re stunned. clear it!', 30); }
          if (khStage === 4 && p.y < 24.2) { khStage = 5; khSpawn([[7.5, 21.5], [11, 23.4], [5, 21.4]]); say('PRICK', 'Last corridor! Sprint to the flag!', 120); }
          M.flags.khStage = khStage;
        },
        done: () => khStage >= 5 && khTg.every(e => e.dead) && near(13.5, 22, 1.3),
        end() {
          M.clockOn = false; const el = M.clock / 60; M.clock = null;
          const grade = el < 19.2 ? 'NEW RECORD' : el < 30 ? 'THROBBING' : el < 45 ? 'HARD' : 'SEMI';
          announce(el < 19.2 ? 'NEW RECORD' : `KILLHOUSE ${el.toFixed(1)}s`, `Prick's record: 19.2s · rating: ${grade}`, 40);
          say('PRICK', el < 19.2 ? 'Nineteen point... under. Under?! Nobody tell the lads.' : `${el.toFixed(1)}. Not bad for a Freshly Nutted Guy. Not good either.`, 260);
          say('PRICK', 'Soap. Pack your lube. We ride at midnight.', 260);
          M.flags.gradT = t;
        } },
      { obj: 'Graduation', checkpoint: false, done: () => t - M.flags.gradT > 200 },
    ],
  };
};

// ---------- 2. ALL GIRTHED UP (v4: the long one) ----------
// field → farmhouse → graveyard (chopper flyby) → the CONVOY (don't move) → chlamydia fields → apartments → the overlook
// → one shot → HUNG-24 → down to the carousel → hold until the bird → extraction
const M2 = () => {
  const g = grid(64, 40);
  carve(g, 1, 19, 62, 22);                                                     // the road (+ verge)
  carve(g, 1, 25, 16, 38); carve(g, 2, 26, 9, 33, ','); carve(g, 10, 34, 15, 37, ','); carve(g, 11, 26, 15, 30, ',');   // A: the field
  carve(g, 17, 29, 17, 31, ',');
  carve(g, 18, 25, 30, 38); carve(g, 18, 35, 30, 37, ','); carve(g, 18, 25, 20, 33, ',');          // B: the farm
  carve(g, 21, 28, 27, 33, 'C'); carve(g, 22, 29, 26, 32); put(g, 24, 33, '.');                    //    the farmhouse
  carve(g, 31, 26, 31, 28, ',');
  carve(g, 32, 25, 46, 38); carve(g, 32, 32, 46, 38, ','); carve(g, 32, 25, 35, 31, ',');          // C: church + graveyard
  carve(g, 40, 26, 45, 30, 'C'); carve(g, 41, 27, 44, 29); put(g, 42, 30, '.');                    //    the church
  put(g, 38, 27, 'X');                                                                              //    the bell tower (a lookout stands on it)
  carve(g, 28, 23, 46, 23, ','); put(g, 45, 24, ',');                                              // the ditch by the road (convoy hide)
  carve(g, 26, 2, 41, 18); carve(g, 26, 2, 31, 18, ','); carve(g, 34, 13, 41, 18, ',');             // D: the chlamydia fields
  carve(g, 43, 2, 61, 17, 'C'); carve(g, 43, 9, 61, 10);                                             // E: the apartments
  carve(g, 44, 2, 48, 7); carve(g, 50, 2, 55, 7); carve(g, 57, 2, 61, 7); carve(g, 44, 12, 48, 17); carve(g, 50, 12, 55, 17); carve(g, 57, 12, 61, 17);
  for (const x of [46, 52, 59]) { put(g, x, 8, '.'); put(g, x, 11, '.'); }
  carve(g, 42, 9, 42, 10);
  carve(g, 57, 18, 61, 18, 'V');                                                                    //    the overlook railing
  put(g, 52, 18, 'G');                                                                              //    fire exit (opens after the shot)
  carve(g, 48, 23, 62, 38); carve(g, 48, 23, 62, 24);                                               // F: the plaza (the carousel)
  carve(g, 47, 25, 47, 38, '#');
  let boss = null, mac = null, pair = [], convoy = [], hung = null, heli = null;
  const HAZ = [{ x: 33, y: 9, r: 3.2 }, { x: 38.5, y: 5, r: 2.6 }, { x: 29, y: 13.5, r: 2.2 }, { x: 36.5, y: 15.5, r: 1.8 }];
  // Mac follows you around at a respectful distance, unless he's been told to stay
  const macFollow = () => {
    if (!mac || mac.stay) return;
    const d = dist(mac, player);
    if (d > 1.6) { const a = flowDir(mac); const ang = a === null ? angleTo(mac, player) : a; moveBody(mac, Math.cos(ang) * 0.055 * ts, Math.sin(ang) * 0.055 * ts, 0.3); mac.walk = (mac.walk || 0) + ts; }
    if (d > 9) { mac.x = player.x - Math.cos(player.a) * 1.2; mac.y = player.y - Math.sin(player.a) * 1.2; if (!walkable(mac.x, mac.y)) { mac.x = player.x; mac.y = player.y; } }
    mac.faceA = Math.atan2(player.x - mac.x, player.y - mac.y);
  };
  const alarm = (why) => { if (M.flags.alarm) return; M.flags.alarm = true; for (const e of ents) if (e.kind === 'enemy' && !e.dead && !e.convoy && dist(e, player) < 14) { e.ai = 'chase'; e.sightMul = 3; } announce('SPOTTED', why || 'so much for the ghillie suit', 40); say('MACMILLI', 'Bollocks. They\'ve seen us. Weapons free.', 180); };
  return {
    map: g, heights: { '#': 1.9, A: 0.85, C: 1.7, X: 1.0, V: 0.38 }, tex: { '#': 'hedge', A: 'fence', C: 'panelblock', X: 'concrete', V: 'fence', G: 'door' }, variants: { '#': ['rock', 6] },
    floor: 'dirt', floorOf: (x, y) => (y >= 19 && y <= 22) || (x >= 48 && y >= 23) ? 'asphalt' : (x >= 43 && y <= 17) ? 'lino' : null,
    outer: { ground: 'dirt', ring: 'forest' }, pal: PAL.bush, start: [3.5, 36.5, -Math.PI / 2], par: 420, stealth: true, music: 'night', amb: 'wind',
    hazards: HAZ, hazardName: 'CHLAMYDIA ZONE', scope: true,
    card: ['15 years earlier', 'Lt. Jack Prick', 'S.A.S. — still had hair then', 'Pubyat, Ukrainian SSR'],
    props: [['sign', 4.5, 37.3, { spr: 'sign_bush' }], ['car', 28.5, 36.5], ['barrel', 19.5, 26.5], ['tent', 29, 26.5], ['rock', 14.5, 33.5], ['rock', 5.5, 25.8],
      ['tombstone', 33.5, 34], ['tombstone', 35.5, 34], ['tombstone', 37.5, 34], ['tombstone', 39.5, 34], ['tombstone', 41.5, 34], ['tombstone', 34.5, 36.5], ['tombstone', 36.5, 36.5], ['tombstone', 38.5, 36.5], ['tombstone', 40.5, 36.5], ['tombstone', 43.5, 36.5],
      ['sign', 34, 24.6, { spr: 'sign_church' }],
      ['sign', 27, 17.4, { spr: 'sign_haz' }], ['sign', 40.5, 17.4, { spr: 'sign_haz' }], ['sign', 25.8, 8, { spr: 'sign_haz' }], ['smoke', 33, 9, { passable: true, z: 0.1 }], ['smoke', 38.5, 5, { passable: true, z: 0.1 }], ['smoke', 29, 13.5, { passable: true, z: 0.1 }], ['smoke', 36.5, 15.5, { passable: true, z: 0.1 }],
      ['cratestack', 44.5, 2.5], ['desk', 50.5, 2.6], ['barrel', 60.5, 2.5], ['desk', 45, 16.4], ['cratestack', 54.5, 16.5], ['magrack', 57.8, 12.4],
      ['carousel', 55.5, 31.5], ['ferris', 67, 33, { passable: true, far: 140, faceA: Math.PI / 2 }], ['lampost', 49, 26], ['lampost', 61.5, 26], ['lampost', 49, 37.5], ['lampost', 61.5, 37.5], ['barrier', 51, 28], ['barrier', 60, 34.5], ['car', 50, 36.5], ['wreck', 60.5, 28], ['cone', 52.5, 24.5, { passable: true }],
      ['lampost', 10, 22.6], ['lampost', 30, 22.6], ['lampost', 50, 18.4], ['wreck', 18, 20.2]],
    brief: ['> PUBYAT. 15 YEARS AGO. 04:20.', 'You are young Lieutenant Prick. Your C.O. is Captain MacMillilitre. He is very old and very calm.', 'Ghillie suits on. We crawl through tall grass that is, and I cannot stress this enough, pubes.',
      'Condom Troopers everywhere. And the crabs. Stay in the grass, stay low, and they can\'t see you.',
      'A convoy runs the Pubyat road at dawn. When it comes: you do not move. You do not breathe. You do not scratch.', 'Then through the apartments to the overlook, and one shot at Imran Jackoff — the biggest dick in the region.',
      '> OBJECTIVE: one shot, one squirt. Then hold the carousel till the bird comes.'],
    init() {
      bakeSign('sign_bush', 'THE BUSH', 'keep out. seriously.', '#fff6e0', INK); bakeSign('sign_church', 'ST. PETER\'S', 'est. 1432 · no running', '#fff6e0', INK); bakeSign('sign_haz', '☣ CHLAMYDIA', 'do not enter the zone', YEL, INK);
      for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (map[y][x] === ',' && (x * 7 + y * 5) % 4 === 0) spawnProp('bush', x + 0.5, y + 0.5, { passable: true, far: 12 });
      for (let yy = 30; yy <= 33; yy++) for (let xx = 54; xx <= 57; xx++) blocked[yy * MW + xx] = 1;   // the carousel is big
      mac = spawnNpc('mac', 4.5, 37, 1.15, 0.9, { far: 60, friendly: true });
      M.always = () => { macFollow(); };
      // A: the pair by the tree line, looking the other way
      pair = [spawnEnemy('condom', 12.5, 27.2, { sightMul: 0.6 }), spawnEnemy('condom', 14.6, 28.4, { sightMul: 0.6 })];
      // B: three in the farmhouse (leave them), one on patrol
      spawnEnemy('condom', 23, 30, { sightMul: 0.5 }); spawnEnemy('condom', 25.5, 31.5, { sightMul: 0.5 }); spawnEnemy('crab', 24, 29.6, { sightMul: 0.5 });
      spawnEnemy('condom', 19, 36.5, { ai: 'patrol', path: [[19, 36.5], [29.5, 36.5], [29.5, 34.5], [19, 34.5]] });
      // C: lookout on the bell tower, crabs in the graveyard
      spawnEnemy('condom', 38.5, 27.5, { z: 1.0, speedMul: 0, sightMul: 0.9 });
      spawnEnemy('crab', 36, 30, { ai: 'patrol', path: [[33, 30], [39, 30], [39, 32], [33, 32]] });
      spawnEnemy('crab', 44.5, 33, { ai: 'patrol', path: [[44.5, 32], [44.5, 37.5]] });
      // D: patrols in the fields; E: squatters in the apartments (and a crab eating something. leave it.)
      spawnEnemy('condom', 30, 4, { ai: 'patrol', path: [[27, 3], [40, 3]] }); spawnEnemy('condom', 40, 12, { ai: 'patrol', path: [[40, 10], [40, 17]] });
      spawnEnemy('crab', 45.5, 5, { sightMul: 0.35 }); spawnEnemy('condom', 53, 4, { sightMul: 0.6 }); spawnEnemy('condom', 59.5, 4.5, { sightMul: 0.6 }); spawnEnemy('condom', 46, 14.5, { sightMul: 0.6 });
      say('MACMILLI', "Quiet now. Stay low. Move slow. Follow me.", 240);
      say('MACMILLI', "See the carousel over there? Pride of Pubyat. Remember it. We'll need it later.", 280);
    },
    triggers: [
      { x: 24, y: 36, r: 3, fn: () => say('MACMILLI', 'Farmhouse. Three inside. Leave them. Not worth the paperwork.', 240) },
      { x: 42.5, y: 9.5, r: 1.6, fn: () => say('MACMILLI', 'The apartments. Pubyat Heights. Rent is very reasonable now.', 220) },
      { x: 45.5, y: 7, r: 2.2, fn: () => { say('MACMILLI', 'Crab. He\'s eating. Leave him be.', 180); say('MACMILLI', '...Don\'t ask what.', 140); } },
      { x: 53, y: 9.5, r: 1.5, fn: () => say('MACMILLI', 'The overlook is the far flat on the right. The one with the balcony.', 220) },
    ],
    stages: [
      { obj: isTouch ? 'Follow the minimap route. Tap CROUCH and stay in the tall brown grass so patrols can\'t see you.' : 'Follow the minimap route. Press C to crouch and stay in the tall brown grass so patrols can\'t see you.', start() { M.goal = { x: 7.5, y: 31.5 }; }, done: () => player.y < 33.5 && player.x > 6.5, end() { say('MACMILLI', 'Two rubbers. Tree line. Both looking the other way. Lovely.', 220); } },
      { obj: 'Shoot the LEFT Condom Trooper by the trees (east). Mac shoots the other one at the same time.', count: () => `Left: ${pair.filter(e => !e.dead).length}`, clearAll: true, clearList: () => pair, at: [7.5, 31.5, -0.35], pre() { mac.x = 6.5; mac.y = 32; M.goal = null; for (const e of pair) e.reveal = true; },
        start() { M.flags.syncT = 0; say('MACMILLI', 'I\'ll take the one on the right. You take the left. On three. ...Or whenever. I\'m old.', 280); for (const e of pair) e.onDeath = () => { M.flags.syncT = t; }; },
        tick() { if (M.flags.syncT && t - M.flags.syncT > 8) { for (const e of pair) if (!e.dead) { killEnt(e); sfx('shoot'); } } },
        done: () => pair.every(e => e.dead), end() { say('MACMILLI', 'Beautiful.', 120); M.goal = { x: 31.5, y: 27 }; } },
      { obj: 'Sneak east past the farmhouse to the gap in the hedge. Don\'t go in the house.', at: [13, 29.5, 0], pre() { for (const e of pair) if (!e.dead) killEnt(e); }, start() { M.goal = { x: 31.5, y: 27 }; }, done: () => player.x > 31.2, end() { M.goal = null; } },
      { obj: 'Cross the graveyard to the gap in the north-east corner', hint: 'When the chopper comes, crouch in the brown grass and wait until Mac says it\'s gone.', at: [32.5, 27, 0], start() { M.goal = { x: 45.5, y: 24.2 }; M.flags.flyT = t + 150; },
        tick() {
          const f = t - M.flags.flyT;
          if (f === 0) { setObjective(isTouch ? 'CHOPPER! Tap CROUCH, get in the brown grass and wait for it to pass' : 'CHOPPER! Press C, get in the brown grass and wait for it to pass'); M.flags.fly = spawnDeco('heli', 18, 44, 1, 1, { z: 3.4, far: 90 }); say('MACMILLI', 'CHOPPER. GET DOWN. In the grass. Don\'t. Move.', 200); announce(isTouch ? 'TAP CROUCH' : 'PRESS C', 'get down in the grass', 36); }
          const h = M.flags.fly; if (!h) return;
          if (f > 0) { h.x += 0.06; h.y -= 0.045; h.faceA = Math.atan2(0.06, -0.045); if (t % 9 === 0) sfx('chop'); if (h.x > 70) { h.gone = true; M.flags.fly = null; say('MACMILLI', '...Gone. Good. Keep moving.', 160); setObjective('Chopper\'s gone. Get to the gap in the north-east corner of the graveyard.'); } }
          if (f > 0 && dist(h, player) < 9 && (!player.crouch || cell(player.x | 0, player.y | 0) !== ',') && !M.flags.alarm) { alarm('the chopper saw your pubes'); spawnWave([['bee', player.x + 6, player.y - 3], ['bee', player.x - 6, player.y + 2], ['crab', 44, 26]]); for (const e of ents) if (e.kind === 'enemy' && !e.dead) { e.ai = 'chase'; e.sightMul = 3; } }
        },
        done: () => near(45.5, 24.2, 1.3) && !M.flags.fly, end() { M.goal = null; M.flags.alarm = false; } },
      { obj: 'THE CONVOY. You\'re in the ditch. Stay still until Mac says GO (you can look around).', count: () => `Convoy passed: ${Math.round(100 * clamp((Math.min(...convoy.map(c => c.x)) + 47) / 113, 0, 1))}%`, at: [44.5, 23.5, Math.PI], pre() { mac.x = 46.2; mac.y = 23.5; },
        start() {
          mac.stay = true; mac.x = 46.2; mac.y = 23.5; player.crouch = true; player.canMove = false; M.flags.convoyT = t; player.invul = true; for (const e of ents) if (e.kind === 'enemy' && !e.dead && !e.convoy) { e.frozen = true; e.convoyHold = true; } eproj = [];
          say('MACMILLI', 'Convoy. Down. DOWN. In the ditch.', 160); say('MACMILLI', 'If you so much as scratch, we\'re both dead.', 220);
          convoy = [];
          for (let i = 0; i < 6; i++) { convoy.push(spawnProp('truck', -2 - i * 7.5, 21, { passable: true, faceA: 0, far: 60 })); }
          for (let i = 0; i < 9; i++) convoy.push(spawnEnemy('condom', -5 - i * 5, 19.7 + (i % 2) * 2.6, { convoy: true, frozen: true, far: 40 }));
        },
        tick() {
          const p = player; let danger = false; p.crouch = true; p.canMove = false;
          for (const c of convoy) { if (c.dead) continue; c.x += 0.045 * ts; if (c.kind === 'enemy') { c.walk = (c.walk || 0) + ts; c.moveT = t; } const d = dist(c, p); if (d < 8) danger = true;
            if (d < 8 && (!p.crouch || p.y < 22.9) && !M.flags.seen) { M.flags.seen = true; } if (d < 3.2 && p.moving > 0.3) M.flags.seen = true; }
          if (danger && t % 120 === 0) chatter('MACMILLI', pickOne(['Don\'t. Move.', 'Steady...', 'Easy... easy...', 'Nobody breathe.', 'If he looks this way, think grass thoughts.']), 100);
          if (danger && t % 12 === 0) sfx('step');
          if (t % 20 === 0) sfx('chop');
          if (M.flags.seen && state === 'game') { M.flags.seen = false; die('spotted'); }
        },
        done: () => convoy.every(c => c.x > 66), end() { for (const c of convoy) c.gone = true; mac.stay = false; player.canMove = true; player.invul = false; for (const e of ents) if (e.convoyHold) { e.frozen = false; e.convoyHold = false; } announce('GO', 'across the road', 40); say('MACMILLI', '...Okay. Go. Across the road. Mind the chlamydia.', 220); } },
      { obj: 'Cross the road north. Go AROUND the green chlamydia clouds (they hurt). Follow the minimap route to the apartments.', at: [44.5, 23.2, -Math.PI / 2], pre() { mac.stay = false; player.canMove = true; }, start() { M.goal = { x: 42.5, y: 9.5 }; },
        tick() { if (!M.flags.hzTip && player.y < 18.5) { M.flags.hzTip = true; say('MACMILLI', 'Too much chlamydia in that field. We go around. The long way. Always the long way.', 260); } },
        done: () => near(43, 9.5, 1.3), end() { M.goal = null; } },
      { obj: 'Go through the apartments to the balcony room at the far east end', hint: 'Follow the minimap route: along the corridor, then the last door on the right.', at: [43, 9.5, 0], start() { M.goal = { x: 59, y: 15.5 }; }, done: () => near(59, 15.5, 1.4), end() { M.goal = null; } },
      { obj: isTouch ? 'Look down into the plaza. Tap AIM and shoot Jackoff (red arrow, fur coat) when he arrives.' : 'Look down into the plaza. Right-click to aim and shoot Jackoff (red arrow, fur coat) when he arrives.', hint: 'Face south, over the balcony rail. He walks in from the right and stops near the carousel.', hintAfter: 1200, at: [59, 16.5, Math.PI / 2 + 0.2], pre() { M.goal = null; },
        start() {
          mac.stay = true; mac.x = 57.5; mac.y = 16.5;
          boss = spawnNpc('boss2', 64, 33, 1.8, 1.4, { r: 0.8, hp: 1, far: 70,
            tick: e => { if (e.flee) { e.x += 0.07; if (e.x > 70) e.gone = true; return; } if (e.x > 56.8) e.x -= 0.02; else { e.arrived = true; e.shootable = true; e.reveal = true; } },
            onDeath: e => { e.dead = false; e.hp = 9999; e.shootable = false; e.spr = 'boss'; e.attackT = 999; e.flee = true; M.flags.bossHit = true; sfx('boss'); shake = 10; } });
          spawnEnemy('condom', 63, 31.5, { frozen: true, far: 60, guard: true }); spawnEnemy('condom', 63, 35, { frozen: true, far: 60, guard: true });
          say('MACMILLI', 'There. The plaza. He\'s arriving. Fur coat. Both arms. For now.', 240);
          say('MACMILLI', isTouch ? 'Aim down the sights. Account for the wind. And the Coriolis effect. And his feelings.' : 'Right-click, aim. Account for the wind. And the Coriolis effect. And his feelings.', 300);
        },
        tick() { for (const e of ents) if (e.guard && e.kind === 'enemy' && !e.dead && e.x > 58) e.x -= 0.02; },
        done: () => M.flags.bossHit,
        end() { announce('ONE SHOT, ONE SQUIRT', 'you blew his arm clean off', 44); say('MACMILLI', "Target down... no. He's lost an arm. Bloody hell, Leftenant.", 240); say('JACKOFF', 'MY ARM! MY BEAUTIFUL WANKING ARM!', 200); } },
      { obj: 'Attack chopper! Follow the minimap route out the fire exit and down to the carousel in the plaza.', at: [59, 16.5, Math.PI], pre() { if (boss) { boss.flee = true; boss.spr = 'boss'; } },
        start() {
          mac.stay = false; openGate(52, 18); M.goal = { x: 52.5, y: 28.5 };
          for (const e of ents) if (e.guard && !e.dead) { e.frozen = false; e.ai = 'chase'; e.sightMul = 4; }
          for (const e of spawnWave([['condom', 58, 21], ['crab', 45, 20.5], ['condom', 61, 26]])) { e.ai = 'chase'; e.sightMul = 4; }
          hung = spawnDeco('heli', 30, 5, 1, 1, { z: 3.6, far: 90, hungT: 0 });
          say('MACMILLI', 'HUNG-24! Attack chopper! Fire exit, down the stairs, GO!', 220); announce('HUNG-24 INBOUND', 'attack chopper. do not look it in the eye.', 40);
        },
        tick() { hungTick(); if (!M.flags.rawQte && player.y > 20.5 && M.state === 'play') { M.flags.rawQte = true; const a = player.a; const e = spawnEnemy('condom', player.x + Math.cos(a) * 1.1, player.y + Math.sin(a) * 1.1, { hp: 70 }); startQTE(e); } },
        done: () => near(52.5, 28.5, 2.2), end() { M.goal = null; } },
      { obj: 'Stay near the carousel and kill everything that comes until the timer runs out', count: () => `Enemies nearby: ${ents.filter(e => e.kind === 'enemy' && !e.dead && !e.convoy && dist(e, player) < 16).length}`, hint: 'They come up the road from the west and in from the east edge. Grab lotion when you shrink.', at: [52.5, 28.5, Math.PI / 2], pre() { openGate(52, 18); },
        start() {
          mac.stay = true; mac.x = 53.5; mac.y = 29.2; mac.crouchy = true;
          M.timer = 60 * 100; M.timerLabel = 'EVAC'; M.onTimeout = () => { M.flags.evac = true; }; M.flags.waveT = t - 400; M.flags.wave = 0;
          say('MACMILLI', 'My leg\'s gone. Crab got it. Put me down by the carousel. I\'ll cover the road.', 260);
          say('PILOT', 'Big Bird to Pubyat, one hundred seconds out. Hold what you\'ve got.', 220);
          player.nades = 3;
        },
        tick() {
          if (hung) hungTick();
          const f = t - M.flags.waveT;
          if (t % 200 === 0 && mac) { let best = null, bd = 10; for (const e of ents) if (e.kind === 'enemy' && !e.dead && !e.convoy) { const d = dist(e, mac); if (d < bd && los(mac.x, mac.y, e.x, e.y)) { bd = d; best = e; } } if (best) { killEnt(best); sfx('shoot'); if (Math.random() < 0.5) chatter('MACMILLI', pickOne(['Got him.', 'Tango down. Still got it.', 'One less rubber.', 'Beautiful.']), 90); } }
          if (f > 960 && !M.flags.evac) { M.flags.waveT = t; const w = M.flags.wave++;
            const lists = [[['condom', 44, 20.5], ['crab', 46, 21.5]], [['crab', 62, 36], ['condom', 61.5, 37.5], ['bee', 62, 30]], [['condom', 44, 20], ['crab', 44, 21], ['bee', 50, 38]], [['crab', 62, 25], ['crab', 61, 37], ['condom', 44, 21]], [['condom', 44, 20], ['bee', 44, 22], ['crab', 62, 37], ['condom', 62, 24]]];
            for (const e of spawnWave(lists[Math.min(w, lists.length - 1)])) { e.ai = 'chase'; e.sightMul = 5; }
            chatter('MACMILLI', pickOne(['More coming up the road!', 'Crabs, east side!', 'They\'re in the bumper cars!', 'Contact! Behind the candy floss!', 'Keep them off me, Leftenant. I\'m very old.']), 150); }
          if (M.timer && M.timer < 60 * 50 && hung && !M.flags.hungGone) { M.flags.hungGone = true; hung.leaving = true; say('MACMILLI', 'The HUNG is pulling off! Must need a refuel. Or a cuddle.', 200); }
        },
        done: () => M.flags.evac, end() { M.timer = null; say('PILOT', 'Big Bird on station! Pop smoke!', 180); M.goal = { x: 51.5, y: 35.5 }; } },
      { obj: 'Big Bird is down! Run up the back ramp of the Chinook!', at: [52.5, 28.5, Math.PI / 2],
        start() {
          M.goal = null; mac.stay = false; sfx('chop');
          heli = M.flags.heli = spawnDeco('chinook', 14, 36.6, 1, 1, { z: 5.5, far: 140, heliT: 0, faceA: Math.PI, beam: true });
          say('PILOT', 'Big Bird, final approach. Ramp coming down. Get your arses in.', 220);
        },
        tick() {
          const hl = heli; hl.heliT++; const k = Math.min(1, hl.heliT / 420);
          hl.x = lerp(14, 52, ease(k)); hl.y = 36.6; hl.z = lerp(5.5, 0, ease(Math.min(1, k * 1.08))) + (k >= 1 ? 0 : Math.sin(t * 0.06) * 0.03);
          hl.tilt = k < 0.75 ? -0.12 : lerp(-0.12, 0.14, (k - 0.75) / 0.25) * (k >= 1 ? 0 : 1);   // nose down on the way in, flare at the end
          if (t % 7 === 0) sfx('chop');
          if (k > 0.6 && t % 3 === 0) burst3d(hl.x + rand(-4, 4), hl.y + rand(-4, 4), 0.05, 1, 'puff', 0.12);   // downwash
          if (k >= 1 && !hl.landed) { hl.landed = true; hl.rampK = 1; hl.beam = false; shake = 6; M.goal = { x: 57.6, y: 36.6 }; say('PILOT', 'Ramp\'s down! GO GO GO!', 150); announce('RAMP DOWN', 'run up the back of the chopper', 36); }
          if (hl.landed) { mac.stay = true; mac.x = lerp(mac.x, 53.2, 0.02); mac.y = lerp(mac.y, 35.9, 0.02); }
          if (hung) hungTick();
        },
        done: () => heli.landed && near(57.6, 36.6, 1.7), end() { say('PILOT', 'Everybody in? Lifting!', 140); } },
      { obj: 'Extraction', checkpoint: false,
        start() {
          M.state = 'cut'; player.canMove = false; player.canFire = false; M.goal = null; M.flags.boardT = t; M.always = null;
          for (const e of ents) if (e.kind === 'enemy') e.frozen = true;
          M.flags.gunner = spawnNpc('soup', 0, 0, 1.3, 1, { far: 60 });
          mac.stay = true;
        },
        tick() {
          const hl = heli, f = t - M.flags.boardT;
          // walk up the ramp to the front of the cabin, sit, and look back out of the open ramp as it lifts
          const inX = hl.x - 1.6, floor = 0.64 / YS;
          if (f < 90) { const q = ease(f / 90); player.x = lerp(57.6, inX, q); player.y = lerp(player.y, hl.y, 0.1); camH = 0.5 + floor * Math.min(1, q * 2); player.a = lerpA(player.a, Math.PI, 0.2); pitch = lerp(pitch, 0, 0.1); }
          else { player.a = lerpA(player.a, 0, 0.06); pitch = lerp(pitch, -20, 0.03); }
          if (f === 110) hl.rampK = 0.6;
          const up = Math.max(0, f - 130);
          hl.z = up * up * 0.00008 + up * 0.003; hl.x = 52 - up * 0.012; hl.tilt = Math.min(0.1, up * 0.0012);
          if (f >= 90) { player.x = hl.x - 1.6; player.y = hl.y; camH = 0.42 + floor + hl.z; }
          mac.x = hl.x + 0.3; mac.y = hl.y - 0.75; mac.z = hl.z + floor; mac.faceA = 0;
          const gn = M.flags.gunner; gn.x = hl.x + 3.1; gn.y = hl.y + 0.45; gn.z = hl.z + floor; gn.faceA = Math.PI / 2;
          if (t % 7 === 0) sfx('chop');
          if (f === 80) say('MACMILLI', 'Everybody on? GO! GO!', 140);
          if (f === 200) say('MACMILLI', "Mark my words, Leftenant: fifteen years from now he's going to be very upset about that arm.", 320);
          if (f > 420) whiteOut = Math.min(1, (f - 420) / 60);
        },
        done: () => t - M.flags.boardT > 490, end() { whiteOut = 0; camH = 0.5; pitch = 0; } },
    ],
  };
  // the HUNG-24: circles over the road and the plaza, strafes you with stingers
  function hungTick() {
    const h = hung; if (!h || h.gone) return; h.hungT++;
    if (h.leaving) { h.x += 0.12; h.z += 0.01; if (h.x > 90) { h.gone = true; hung = null; } if (t % 9 === 0) sfx('chop'); return; }
    const cx = 52, cy = 24, a = h.hungT * 0.006;
    h.x = lerp(h.x, cx + Math.cos(a) * 12, 0.02); h.y = lerp(h.y, cy + Math.sin(a) * 9, 0.02); h.faceA = -a;
    if (t % 9 === 0) sfx('chop');
    if (h.hungT % 220 === 0 && dist(h, player) < 18 && M.state === 'play') {
      for (let i = -1; i <= 1; i++) { const ang = angleTo(h, player) + i * 0.12; eproj.push({ x: h.x, y: h.y, vx: Math.cos(ang) * 0.13, vy: Math.sin(ang) * 0.13, life: 160, dmg: 5, spr: 'stinger', z: 0.5, h: 0.25, w: 0.35, seed: 0 }); }
      sfx('sting'); chatter('PILOT', pickOne(['HUNG\'s strafing!', 'Incoming from the chopper!', 'Get under something!']), 90);
    }
  }
};

// ---------- 3. CREW EXPANDABLE (v4) ----------
// ride in → fast-rope to the helipad → sweep the deck (minigun support) → the bridge (they're asleep) → crew quarters
// → the hold (container lanes, eggplant detector) → package → jets hit the ship → run back up through a flooding, tilting ship → JUMP
const M3 = () => {
  const g = grid(56, 30);
  carve(g, 1, 1, 54, 8);                                                           // the main deck
  for (const x0 of [14, 24, 34]) carve(g, x0, 3, x0 + 3, 5, 'A');                  //   cargo hatches (cover)
  carve(g, 2, 2, 9, 6, 'C'); carve(g, 3, 3, 8, 5); put(g, 9, 4, '.');             //   the bridge
  carve(g, 1, 10, 54, 18, 'C'); carve(g, 2, 13, 53, 14);                            // crew quarters: corridor + bunk rooms
  const ROOMS = [[2, 7], [9, 14], [16, 21], [23, 28], [30, 35], [37, 42], [44, 49]];
  for (const [xa, xb] of ROOMS) { const xm = (xa + xb) >> 1; carve(g, xa, 10, xb, 11); put(g, xm, 12, '.'); carve(g, xa, 16, xb, 17); put(g, xm, 15, '.'); }
  put(g, 4, 9, '.');                                                                //   stairs: deck → quarters (by the bridge)
  carve(g, 51, 9, 51, 12);                                                           //   stairs: quarters → deck (by the helipad)
  carve(g, 52, 15, 53, 19);                                                          //   stairs: quarters → hold
  carve(g, 2, 19, 53, 28);                                                           // the hold
  for (const [x0, y0] of [[6, 20], [6, 24], [14, 22], [14, 26], [22, 20], [22, 24], [30, 22], [30, 26], [38, 20], [38, 24], [46, 22], [46, 26]]) carve(g, x0, y0, x0 + 4, y0 + 1, 'B');
  const PKG = [3.5, 23.5];
  let heli = null, flood = null, pkg = null;
  const wake = (list) => { for (const e of spawnWave(list)) { e.ai = 'chase'; e.sightMul = 3; } };
  return {
    map: g, heights: { '#': 1.7, A: 0.7, B: 1.35, C: 1.7, G: 1.5, V: 0.5 }, tex: { '#': 'steel', A: 'rust', B: 'container', C: 'steel', G: 'gate', V: 'rust' }, variants: { '#': ['porthole', 5], C: ['porthole', 7], B: ['containerrust', 3] },
    floor: 'deck', floorOf: (x, y) => y >= 10 && y <= 18 ? 'lino' : null, roofs: [[1, 9.5, 55, 18.5, 'steel', 1.7, '#ff5a50'], [1, 18.5, 55, 29, 'steel', 1.7]], indoor: (x, y) => y > 9, areaGrade: (x, y) => y >= 9.5 && y <= 18.5 ? { shadow: [1.35, 0.62, 0.62], high: [1.2, 0.8, 0.78], sat: 0.9 } : null, outer: { ground: 'water', groundY: -1.6, ring: 'sea' }, pal: PAL.ship, start: [50, 4.5, Math.PI], par: 380, music: 'tense', amb: 'sea',
    card: ['Day 3 – 01:00:12', "Sgt. 'Soap' MacTugish", '22nd Sausage Air Service', 'MV Blue Balls — Bering Sea'],
    props: [['lifering', 1.3, 7.5, { passable: true }], ['barrel', 12, 7.4], ['barrel', 12.8, 7.4], ['cratestack', 20.5, 1.6], ['cratestack', 30.5, 7.4], ['barrel', 40, 1.6], ['lifering', 44, 1.2, { passable: true }], ['valve', 21, 7.6, { passable: true }], ['lantern', 11, 4.5, { z: 0.8, passable: true }], ['lantern', 31, 4.5, { z: 0.8, passable: true }], ['lantern', 44, 4.5, { z: 0.8, passable: true }], ['cone', 47, 2, { passable: true }], ['cone', 47, 7, { passable: true }],
      ['desk', 5.5, 3.3], ['lantern', 6, 4, { z: 0.65, passable: true }],
      ['lantern', 8, 13.5, { z: 0.65, passable: true }], ['lantern', 22, 13.5, { z: 0.65, passable: true }], ['lantern', 36, 13.5, { z: 0.65, passable: true }], ['lantern', 50, 13.5, { z: 0.65, passable: true }], ['barrel', 3, 10.5], ['desk', 11, 10.4], ['desk', 25, 16.6], ['magrack', 33, 10.4], ['cooler', 40, 16.6], ['desk', 46, 10.4], ['valve', 53, 16, { passable: true }],
      ['cratestack', 12, 20], ['barrel', 20, 27.5], ['cratestack', 28, 19.6], ['barrel', 36, 21.2], ['cratestack', 44, 27.4], ['barrel', 51, 24], ['lantern', 12, 24, { z: 0.8, passable: true }], ['lantern', 28, 24, { z: 0.8, passable: true }], ['lantern', 44, 24, { z: 0.8, passable: true }], ['sign', 50.5, 19.8, { spr: 'sign_hold' }]],
    brief: ['> BERING SEA. 01:00. RAINING SIDEWAYS.', 'Cargo ship MV Blue Balls. Crew: rubbers and crabs. Cargo: one package, extremely ours.',
      'Fast-rope onto the helipad. Sweep the deck to the bridge. Down through crew quarters, into the hold.', 'The eggplant detector will tell you when you\'re close. Grab the package.',
      'Then the ship will sink, because it always does, and you will run back up through all of it. Uphill. Wet.',
      '> OBJECTIVE: get the package. Don\'t go down with the ship. Or do. Your funeral.'],
    init() {
      bakeSign('sign_hold', 'HOLD ↓', 'mind the crabs', YEL, INK);
      for (let x = 0; x < MW; x++) { map[0][x] = 'V'; } for (let y = 0; y <= 8; y++) { map[y][0] = 'V'; map[y][MW - 1] = 'V'; }
      buildMini(); rebuildWalls();
      heli = spawnDeco('heli', 64, 4.5, 1.4, 1.6, { z: 2.4, far: 90 });
      // the deck
      spawnEnemy('condom', 38, 2.2); spawnEnemy('condom', 33, 7.2); spawnEnemy('crab', 29, 6.5); spawnEnemy('condom', 22, 2.2); spawnEnemy('condom', 19, 7.2); spawnEnemy('crab', 13, 2.5);
      // the bridge: asleep
      for (const [x, y] of [[4, 3.4], [6.8, 4.8], [7.6, 3.3]]) spawnEnemy('condom', x, y, { frozen: true, sleeping: true, sightMul: 0 });
      pkg = spawnPickup('crate', PKG[0], PKG[1]); pkg.onGet = () => { M.flags.package = true; };
    },
    triggers: [
      { x: 10, y: 4.5, r: 1.6, fn: () => { say('GAS', 'Bridge. They\'re all asleep.', 150); say('PRICK', 'Well. Wake them up. Politely. With your dick.', 200); } },
      { x: 4, y: 11, r: 1.5, fn: () => { say('PRICK', 'Crew quarters. Check your corners. Check your corners.', 200); } },
      { x: 52.5, y: 18.5, r: 1.3, fn: () => say('PRICK', 'The hold. Package should be at the far end. Smells like eggplant.', 220) },
    ],
    stages: [
      { obj: '', checkpoint: false,
        start() { M.state = 'cut'; player.canMove = false; player.canFire = false; M.flags.rideT = t; player.x = 58; player.y = 4.5; player.a = Math.PI; camH = 0.5 + 2.4;
          say('PRICK', 'Bravo Six, going wet.', 140); say('PILOT', 'Rules of engagement, sir? The crew?', 150); say('PRICK', 'Expendable. Rubbers and crabs. Mostly rubbers.', 180); },
        tick() { const f = t - M.flags.rideT; if (t % 8 === 0) sfx('chop');
          heli.x = lerp(64, 51.5, ease(Math.min(1, f / 240))); player.x = heli.x - 0.9; player.y = 4.5; heli.faceA = Math.PI / 2;
          if (f > 250) { camH = lerp(camH, 0.5, 0.05); } else camH = 0.5 + heli.z * 0.9;
          if (f === 250) { announce('FAST-ROPE', 'go go go', 34); sfx('slide'); } },
        done: () => t - M.flags.rideT > 330, end() { camH = 0.5; player.canMove = true; player.canFire = true; M.state = 'play'; player.x = 49.5; player.y = 4.5; } },
      { obj: 'Fight west along the deck to the bridge cabin at the front of the ship', hint: 'Follow the minimap route. The chopper\'s minigun picks off enemies near you.', at: [49.5, 4.5, Math.PI], pre() { heli.x = 51.5; heli.z = 2.4; M.state = 'play'; player.canMove = true; player.canFire = true; camH = 0.5; },
        start() { M.goal = { x: 10.2, y: 4.5 }; M.flags.gunT = t; say('PILOT', 'I\'ve got the minigun on the deck. Call it.', 180); },
        tick() {
          heli.x = lerp(heli.x, Math.max(12, player.x + 6), 0.004); heli.y = 4.5 + Math.sin(t * 0.01) * 2; heli.z = 2.6; heli.faceA = Math.PI / 2; if (t % 8 === 0) sfx('chop');
          if (t - M.flags.gunT > 330) { M.flags.gunT = t; let best = null, bd = 16; for (const e of ents) if (e.kind === 'enemy' && !e.dead && !e.sleeping && e.y < 9) { const d = dist(e, heli); if (d < bd) { bd = d; best = e; } }
            if (best) { for (let i = 0; i < 6; i++) setTimeout(() => sfx('shoot'), i * 50); burst3d(best.x, best.y, 0.4, 12, 'spark', 0.1); killEnt(best); chatter('PILOT', pickOne(['Minigun! Minigun!', 'Got one on the hatch.', 'Brrrrrt.', 'Tango down. Very down.']), 110); } }
          if (player.x < 32 && !M.flags.w2) { M.flags.w2 = true; wake([['condom', 4.5, 8.4], ['crab', 11, 7]]); say('SOUP', 'More out of the stairwell!', 140); }
        },
        done: () => near(10.2, 4.5, 1.3), end() { M.goal = null; } },
      { obj: 'Go inside the bridge cabin and shoot the 3 sleeping crew', clearAll: true, clearList: () => ents.filter(e => e.sleeping), count: () => `Sleepers left: ${ents.filter(e => e.sleeping && !e.dead).length}`, at: [10.5, 4.5, Math.PI], start() { M.goal = { x: 6.5, y: 4 }; for (const e of ents) if (e.sleeping) { e.frozen = true; e.reveal = true; } },
        tick() { if (t % 90 === 0) for (const e of ents) if (e.sleeping && !e.dead) burst3d(e.x, e.y, 1.4, 1, 'puff', 0.01); },
        done: () => ents.filter(e => e.sleeping).every(e => e.dead), end() { say('PRICK', 'Bridge secure.', 120); say('GAS', 'He was holding a teddy.', 140); say('PRICK', 'Expendable teddy.', 140); M.goal = { x: 4.5, y: 10.5 }; } },
      { obj: 'Take the stairs down (right next to the bridge) and fight east through crew quarters to the far stairs', hint: 'Follow the minimap route along the corridor. Enemies come out of the doors on both sides.', at: [6, 5.5, Math.PI / 2],
        start() { M.goal = { x: 52.5, y: 16 };
          wake([['condom', 11.5, 10.6], ['crab', 18.5, 16.6], ['condom', 25.5, 10.6]]); for (const e of ents) if (e.kind === 'enemy' && !e.dead && e.y > 9) e.ai = 'idle'; },
        tick() {
          const x = player.x;
          if (x > 14 && !M.flags.q1) { M.flags.q1 = true; wake([['condom', 32.5, 10.8], ['condom', 33, 16.8], ['crab', 26, 13.5]]); say('SOUP', 'They\'re waking up! Doors on both sides!', 160); }
          if (x > 28 && !M.flags.q2) { M.flags.q2 = true; wake([['condom', 39.5, 10.8], ['crab', 40, 16.5], ['condom', 46.5, 16.8], ['bee', 50, 13.5]]); }
          if (x > 40 && !M.flags.q3) { M.flags.q3 = true; say('PRICK', 'Stairs to the hold, far end. Keep moving.', 160); }
        },
        done: () => near(52.5, 16, 1.6), end() { M.goal = null; } },
      { obj: 'Go down into the hold and find the package at the far WEST end. The detector ticks faster as you get close.', at: [52.5, 17, Math.PI / 2],
        start() { M.goal = { x: PKG[0], y: PKG[1] };
          wake([['condom', 44, 20.5], ['condom', 44, 27.5], ['crab', 36, 23.5], ['condom', 28, 19.6], ['crab', 20, 21]]);
          say('PRICK', 'Eggplant detector\'s on. The faster it ticks, the closer you are. Like dating.', 240); },
        tick() {
          const d = Math.hypot(player.x - PKG[0], player.y - PKG[1]); const k = 1 - clamp(d / 50, 0, 1); M.meter = { label: 'EGGPLANT DETECTOR', k, color: '#b8f0a0' };
          const every = Math.max(4, Math.round(6 + d * 1.4)); if (t % every === 0) sfx('tick');
          if (player.x < 36 && !M.flags.h1) { M.flags.h1 = true; wake([['condom', 12, 19.6], ['condom', 11, 27.6], ['crab', 20, 25]]); say('SOUP', 'Up on the containers! Left side!', 140); }
          if (player.x < 22 && !M.flags.h2) { M.flags.h2 = true; wake([['condom', 4, 20], ['condom', 4, 27.5], ['bee', 8, 23]]); }
        },
        done: () => M.flags.package, end() { M.meter = null; announce('PACKAGE SECURED', 'it\'s eggplants. it\'s always eggplants.', 40); say('PRICK', 'Got the manifest. Let\'s go.', 140); } },
      { obj: 'THE SHIP IS SINKING! Follow the minimap route back up to the helicopter at the back of the ship', hint: 'Out of the hold (east stairs), along the corridor, up the stairs at the east end, onto the deck.', at: [4.5, 23.5, 0], pre() { for (const e of ents) if (e.kind === 'pickup' && e.type === 'crate') e.got = true; M.flags.package = true; },
        start() {
          M.goal = { x: 50.5, y: 4.5 }; M.timer = 60 * 110; M.timerLabel = 'SINKING'; M.onTimeout = () => die('sunk');
          shake = 20; flash = 0.6; sfx('boom'); say('PILOT', 'Fast movers inbound! Get out of there!', 160); say('PRICK', 'That\'s a bomb. Ship\'s going down. Move it, move it, MOVE IT!', 240);
          flood = new THREE.Mesh(new THREE.PlaneGeometry(MW, MH), new THREE.MeshStandardMaterial({ color: '#3a6a8a', transparent: true, opacity: 0.55, roughness: 0.1 })); flood.rotation.x = -Math.PI / 2; flood.position.set(MW / 2, -0.05, MH / 2); level.add(flood);
          wake([['condom', 26, 23], ['crab', 40, 19.5], ['condom', 30, 13.5], ['crab', 44, 13.5], ['condom', 30, 3], ['condom', 44, 6]]);
          M.flags.lurchT = t;
        },
        tick() {
          const k = 1 - M.timer / (60 * 110);
          roll = lerp(roll, -0.2 * k - 0.03, 0.02);
          if (flood) flood.position.y = -0.05 + k * 0.5 * (player.y > 9 ? 1 : 0.2);
          if (outerWater) outerWater.position.y = -1.62 + k * 1.2;
          player.speedMul = player.y > 9 ? 0.85 : 1;
          if (t % 50 === 0) { const x = player.x + rand(-4, 4), y = player.y + rand(-3, 3); if (walkable(x, y)) burst3d(x, y, 1.2, 10, 'drop', 0.08); }
          if (t - M.flags.lurchT > 600) { M.flags.lurchT = t; shake = 26; flash = 0.3; ts = 0.4; sfx('boom'); sfx('slowmo'); announce('THE SHIP LURCHES', '', 30); setTimeout(() => { ts = 1; }, 900); }
          if (player.y < 9 && !M.flags.topSaid) { M.flags.topSaid = true; say('PILOT', 'I see you! Ramp\'s down! JUMP!', 160); }
          heli.x = lerp(heli.x, 55.8, 0.02); heli.y = 4.5; heli.z = 1.2; heli.faceA = Math.PI / 2; if (t % 8 === 0) sfx('chop');
        },
        done: () => near(50.5, 4.5, 1.8), end() { M.timer = null; player.speedMul = 1; say('PRICK', 'JUMP FOR IT!', 140); } },
      { obj: 'JUMP', checkpoint: false, start() { M.state = 'cut'; player.canMove = false; player.canFire = false; player.a = 0; player.x = 52.5; player.y = 4.5; M.flags.jumpT = t; ts = 1; sfx('chop'); },
        tick() { const f = t - M.flags.jumpT; if (f % 8 === 0) sfx('chop'); if (f > 30 && f < 70) { player.x += 0.04; camH = Math.min(0.95, camH + 0.012); } if (f === 70) { ts = 0.3; sfx('slowmo'); } if (f > 70) { player.x += 0.012; camH -= 0.004; pitch = lerp(pitch, -60, 0.05); } if (f === 110) { ts = 1; shake = 18; announce('GRABBED', 'by the balls. as is tradition.', 44); } if (f > 120) flash = Math.min(1.2, flash + 0.05); },
        done: () => t - M.flags.jumpT > 170, end() { roll = 0; } },
    ],
  };
};

// ---------- 4. THE BOG (v5: the long one with the squad) ----------
// night street push with the squad → the dark apartments (night vision) → the Z-PUBE on the overpass (Cum-4)
// → T-69s on the bridge (JAVELUBE) → the back alleys → down into the bog to WAR PECKER → JAVELUBE vs the Big Meaty Pickups → hold while the tank unsticks → escort it out
const MB = () => {
  const g = grid(80, 40);
  // A: the street
  carve(g, 1, 15, 24, 20);
  for (const [a, b] of [[4, 8], [13, 17], [20, 23]]) carve(g, a, 12, b, 14);          // shopfronts, north side
  for (const [a, b] of [[6, 10], [15, 19]]) carve(g, a, 21, b, 23);                    // shopfronts, south side
  for (const [x, y] of [[11, 16], [12, 16], [18, 19], [19, 19], [5, 19], [22, 16]]) put(g, x, y, 'A');
  // B: Lubeview Apartments (it's dark in there)
  carve(g, 25, 8, 44, 26, 'C'); carve(g, 25, 16, 43, 18);
  for (const [a, b] of [[26, 30], [32, 37], [39, 43]]) { carve(g, a, 9, b, 14); carve(g, a, 20, b, 25); const m = (a + b) >> 1; put(g, m, 15, '.'); put(g, m, 19, '.'); }
  put(g, 31, 11, '.'); put(g, 38, 11, '.'); put(g, 31, 23, '.'); put(g, 38, 23, '.');
  put(g, 44, 11, '.');                                                                  //   out onto the overpass
  // C: the overpass and the Z-PUBE
  carve(g, 45, 3, 58, 13);
  for (const [x, y] of [[48, 6], [48, 7], [51, 10], [52, 10], [56, 9], [50, 4]]) put(g, x, y, 'A');
  // C2: the bridge east (enemy armour comes across it) and D0: the back alleys down to the bog
  carve(g, 59, 4, 78, 9);
  for (const [x, y] of [[62, 4], [66, 9], [70, 4], [74, 9]]) put(g, x, y, 'A');
  carve(g, 57, 11, 73, 12);                                                              //   alley: along the back of the overpass
  carve(g, 72, 11, 73, 17); carve(g, 72, 16, 78, 17); carve(g, 76, 17, 77, 18);           //   down, east, and out into the bog
  carve(g, 62, 14, 68, 17); put(g, 65, 13, '.'); carve(g, 69, 16, 71, 16);                //   a little yard (a loop)
  carve(g, 74, 13, 77, 14); put(g, 74, 13, '.');                                         //   dead-end yard with somebody in it
  for (const [x, y] of [[66, 12], [70, 11], [73, 14], [64, 16]]) put(g, x, y, 'V');     //   chain-link
  // D: the bog
  carve(g, 44, 19, 78, 38);
  carve(g, 47, 22, 49, 23); carve(g, 68, 20, 70, 21); carve(g, 71, 31, 73, 33); carve(g, 50, 33, 52, 34);    // ruins
  for (const [x, y] of [[55, 25], [56, 25], [66, 24], [67, 24], [60, 33], [61, 33], [74, 27], [53, 30]]) put(g, x, y, 'A');
  const LUBE = [{ x: 52, y: 29, r: 2.6 }, { x: 68, y: 35, r: 2.1 }, { x: 57.5, y: 21.5, r: 1.7 }, { x: 72.5, y: 25.5, r: 1.6 }, { x: 46.5, y: 36, r: 2 }];
  const inLube = (x, y) => LUBE.some(l => Math.hypot(x - l.x, y - l.y) < l.r);
  const TANK0 = [62, 28], TANK_END = 74;
  const SQ_START = [[5.4, 15.8], [5, 19.2], [1.8, 15.6], [1.8, 19.2]];
  const SQ_TANK = [[60, 25.2], [65.5, 25.8], [58.8, 31.2], [65.2, 31]];
  let tank = null, zpu = null, bmps = [], zone = [], flares = [], crate = null;
  const inApt = (x, y) => x > 24.6 && x < 44.6 && y > 7.6 && y < 26.4;
  // spawn some enemies that already know you're here, and remember them for this part of the level
  const wave = (list, o = {}) => { const out = spawnWave(list); for (const e of out) { e.ai = 'chase'; e.sightMul = 3; Object.assign(e, o); } zone.push(...out); return out; };
  const idle = (list) => { const out = spawnWave(list); for (const e of out) { e.sightMul = 1.4; } zone.push(...out); return out; };
  const zoneLeft = () => zone.filter(e => !e.dead);
  const tankBlock = (on) => { if (!tank) return; for (let y = (tank.y - 1) | 0; y <= ((tank.y + 0.9) | 0); y++) for (let x = (tank.x - 1.8) | 0; x <= ((tank.x + 1.8) | 0); x++) blocked[y * MW + x] = on ? 1 : 0; };
  const placeTank = (x) => { tankBlock(false); tank.x = x; tankBlock(true); };
  const killZpu = () => { if (!zpu || zpu.dead) return; zpu.dead = true; zpu.firing = false; zpu.turretA = 0.4; spawnProp('fire', 54.5, 5.2, { passable: true, z: 0.3 }); spawnProp('smoke', 54.5, 5.3, { passable: true, z: 0.9 }); };
  const spawnBmp = (x0, y0, x1, y1, delay = 0, o = {}) => {
    const T69 = o.tank, hp = T69 ? 400 : 460;
    const b = spawnDeco(T69 ? 'etank' : 'bmp', x0, y0, 1.4, 3, { scale: T69 ? 1.35 : 1.1, shootable: true, armor: true, hp, maxhp: hp, r: T69 ? 1.8 : 1.35, far: 80, reveal: true, faceA: -Math.atan2(y1 - y0, x1 - x0), turretA: Math.atan2(y1 - y0, x1 - x0), to: [x1, y1], delay, fireT: T69 ? 200 : 120, isTank: T69,
      onDeath: e => { e.shootable = false; e.reveal = false; explodeAt(e.x, e.y, 3, 150); spawnProp('fire', e.x, e.y, { passable: true, z: 0.5 }); spawnProp('smoke', e.x, e.y, { passable: true, z: 1.2 }); stats.kills++; xpPop(T69 ? 400 : 250);
        if (T69) { announce('T-69 DESTROYED', pickOne(['it went limp.', 'that one won\'t be getting up again.', 'rubber and all.']), 34); if (bmps.every(q => q.dead)) return; say('VAS', pickOne(['Tank down! Good kill, Jerkson!', 'T-69 is toast!', 'Direct hit! He\'s done!']), 150); return; }
        announce('BIG MEATY PICKUP DESTROYED', pickOne(['tenderised.', 'well done. not medium.', 'that one\'s pulled pork now.']), 34); if (bmps.every(q => q.dead)) return; say('VAS', pickOne(['Scratch one Pickup!', 'Pickup down! Good hit, Jerkson!', 'That\'s a direct hit!']), 150); } });
    bmps.push(b); return b;
  };
  const bmpTick = () => {
    for (const b of bmps) {
      if (b.dead || b.gone) continue;
      if (b.delay > 0) { b.delay -= ts; continue; }
      const [tx, ty] = b.to, d = Math.hypot(tx - b.x, ty - b.y);
      if (d > 0.1) { const a = Math.atan2(ty - b.y, tx - b.x), sp = Math.min(d, 0.022 * ts); b.x += Math.cos(a) * sp; b.y += Math.sin(a) * sp; if (t % 11 === 0 && dist(b, player) < 20) sfx('step'); }
      const aim = angleTo(b, player); b.turretA = lerpA(b.turretA, aim, 0.04);
      b.fireT -= ts;
      if (b.fireT <= 0 && dist(b, player) < 20 && los(b.x, b.y, player.x, player.y) && M.state === 'play') {
        if (b.isTank) {   // the main gun: one big slow shell. Get behind something.
          b.fireT = diff === 'regular' ? 170 : 230; b.recoil = 1;
          eproj.push({ x: b.x + Math.cos(aim) * 2, y: b.y + Math.sin(aim) * 2, vx: Math.cos(aim) * 0.17, vy: Math.sin(aim) * 0.17, life: 200, dmg: 22, spr: 'stinger', z: 0.9, h: 0.25, w: 0.35, seed: 0 });
          sfx('thud'); sfx('boom'); shake = Math.max(shake, 5); burst3d(b.x + Math.cos(aim) * 2.2, b.y + Math.sin(aim) * 2.2, 1.1, 14, 'puff', 0.1);
          if (t - (M.flags.tankWarn || -999) > 600) { M.flags.tankWarn = t; say(pickOne(['JIGGLES', 'DOOLEY']), 'Tank\'s firing! Get behind the barriers!', 140); }
          continue;
        }
        b.fireT = diff === 'regular' ? 120 : 170;
        for (let i = -1; i <= 1; i++) { const a = aim + i * 0.08; eproj.push({ x: b.x + Math.cos(a) * 1.2, y: b.y + Math.sin(a) * 1.2, vx: Math.cos(a) * 0.15, vy: Math.sin(a) * 0.15, life: 150, dmg: 4, spr: 'stinger', z: 0.8, h: 0.25, w: 0.35, seed: 0 }); }
        sfx('ashot'); burst3d(b.x + Math.cos(aim) * 1.3, b.y + Math.sin(aim) * 1.3, 1.1, 5, 'spark', 0.08);
      }
    }
  };
  // parachute flares drifting down over the fight: the only light out here
  const flareTick = () => {
    if (t % 520 === 0 && flares.length < 2 && !inApt(player.x, player.y)) {
      const a = rand(0, TAU), x = player.x + Math.cos(a) * rand(4, 9), y = player.y + Math.sin(a) * rand(4, 9);
      const l = new THREE.PointLight('#ffb070', 0, 26, 1.2); l.position.set(x, 9, y); level.add(l);
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff0c0', fog: false })); s.position.copy(l.position); level.add(s);
      flares.push({ l, s, f: 0 });
    }
    for (const fl of flares) { fl.f += ts; const k = fl.f / 600; fl.l.position.y = 9 - k * 7; fl.l.position.x += Math.sin(fl.f * 0.02) * 0.01; fl.s.position.copy(fl.l.position); fl.l.intensity = (k < 0.1 ? k * 10 : k > 0.85 ? (1 - k) / 0.15 : 1) * (16 + Math.sin(fl.f * 0.7) * 3); if (k >= 1) { level.remove(fl.l); level.remove(fl.s); fl.dead = true; } }
    flares = flares.filter(f => !f.dead);
  };
  return {
    map: g, heights: { '#': 2.4, A: 0.8, C: 2.2, G: 2.0, V: 1.25 }, tex: { '#': 'concrete', A: 'sand', C: 'panelblock', G: 'door', V: 'fence' }, variants: { '#': ['panelblock', 5], A: ['crate', 6] },
    floor: 'rubble', floorOf: (x, y) => inLube(x, y) ? 'lube' : inApt(x, y) ? 'lino' : (y >= 15 && y <= 20 && x < 25) || (x >= 45 && y <= 9) ? 'asphalt' : (x >= 57 && y <= 18) ? 'gravel' : x >= 44 ? 'dirt' : null,
    roofs: [[25, 8, 45, 27, 'concrete', 2.2, '#3a3a30']], indoor: (x, y) => inApt(x, y),
    areaGrade: (x, y) => inApt(x, y) ? { shadow: [0.28, 0.3, 0.38], high: [0.5, 0.52, 0.62], sat: 0.4, vig: 0.8 } : null,
    outer: { ground: 'dirt', ring: 'city' }, pal: PAL.bog, start: [3, 17.5, 0], par: 600, music: 'tense', amb: 'wind', scope: false, killWho: ['VAS', 'JIGGLES'], leadWho: 'VAS', noStreaks: true, shrinkMul: 0.35, propCover: true,
    card: ['Day 5 – 23:40:00', 'Sgt. Paul Jerkson', '1st Force Wreckon — U.S.M.C.', 'The Bog. It\'s wet. Don\'t ask.'],
    props: [['wreck', 7, 17.6], ['wreck', 15.5, 18.7], ['car', 21, 16], ['fire', 7, 17.3, { passable: true }], ['smoke', 7, 17.2, { passable: true, z: 0.8 }], ['barrel', 2.4, 15.4], ['barrel', 9.5, 20.4], ['lampost', 3, 20.4], ['lampost', 12, 15.3], ['lampost', 20, 20.4], ['cratestack', 23.4, 19.4], ['sandbags', 16, 15.4], ['tires', 4.5, 12.6],
      ['desk', 27.5, 9.6], ['desk', 35, 24.6], ['cratestack', 42.5, 9.6], ['barrel', 26.6, 24.6], ['barrel', 27.4, 24.6], ['barrel', 33, 9.6], ['magrack', 40, 24.6], ['cooler', 36.5, 9.6], ['chair', 29, 12], ['chair', 41, 21.5], ['sign', 24.2, 18.4, { spr: 'sign_apt' }],
      ['barrier', 46.5, 12], ['barrier', 57.5, 12.4], ['car', 46.5, 4.5], ['wreck', 53, 12.2], ['lampost', 45.4, 8], ['lampost', 58.4, 3.6], ['cone', 57, 13.5, { passable: true }],
      ['palm', 45.5, 20], ['palm', 76.5, 20], ['palm', 76.5, 37], ['palm', 45.5, 30], ['palm', 63, 37.3], ['wreck', 54, 36.5], ['wreck', 75, 32], ['barrel', 58.6, 29.6], ['barrel', 66, 29.6], ['fire', 48, 21.3, { passable: true }], ['fire', 69, 22.2, { passable: true }], ['smoke', 69, 22, { passable: true, z: 0.8 }], ['sign', 60, 19.5, { spr: 'sign_bog' }], ['sandbags', 57.6, 23.8], ['sandbags', 67.5, 32.4], ['tires', 76.6, 29.5]],
    brief: ['> THE BOG. 23:40. EXTREMELY MOIST.', 'Two nights ago the M1 "WAR PECKER" drove into the Bog and got stuck. Stuck like a tank in lube. Because that\'s what it is.',
      'You are Sgt. Paul Jerkson, U.S.M.C. Lt. Vas-Deferens has the squad. Stay with him. He has a cigar. That means he\'s in charge.',
      'Push up the street. Clear Lubeview Apartments (no power: use your night vision). Blow the Z-PUBE anti-air gun so the jets can come play.',
      'Then get down into the bog, protect the Pecker, and escort it out.', '> OBJECTIVE: pull out the Pecker. Don\'t get stuck yourself.'],
    init() {
      bakeSign('sign_apt', 'LUBEVIEW APTS', 'no vacancy · no power', '#fff6e0', INK); bakeSign('sign_bog', '⚠ THE BOG', 'lube hazard · keep moving', YEL, INK);
      spawnSquad([['vas', 'VAS', ...SQ_START[0], 3.6, -1.7], ['jiggles', 'JIGGLES', ...SQ_START[1], 3.0, 1.8], ['dooley', 'DOOLEY', ...SQ_START[2], -1.4, -1.5], ['ramirez', 'RAMIREZ', ...SQ_START[3], -1.6, 1.5]]);
      tank = spawnDeco('tank', TANK0[0], TANK0[1], 1.6, 4, { faceA: 0, hullA: 0, turretA: Math.PI * 0.8, restA: Math.PI * 0.8, far: 90, guns: false, range: 22, rof: 300 }); tankBlock(true);
      zpu = spawnProp('zpu', 54.5, 5.5, { far: 70, scale: 1.5 }); zpu.turretA = -0.6; zpu.firing = true;
      crate = null;
      M.always = () => {
        flareTick(); bmpTick();
        if (tank && tank.guns) tankTick(tank);
        // lube: it's slippery AND slow. somehow.
        const wet = inLube(player.x, player.y); player.speedMul = (M.baseSpeed || 1) * (wet ? 0.55 : 1);
        if (wet && t % 18 === 0) { sfx('splat'); burst3d(player.x, player.y, 0.05, 2, 'drop', 0.05); }
        if (wet && !M.flags.lubeTip) { M.flags.lubeTip = true; say('JIGGLES', 'Ugh. It\'s in my boots. It\'s in my BOOTS, Jerkson.', 180); }
        if (zpu && zpu.firing) { zpu.turretA = -0.6 + Math.sin(t * 0.01) * 0.5; if (t % 5 === 0) burst3d(zpu.x + Math.cos(zpu.turretA) * 1.2, zpu.y + Math.sin(zpu.turretA) * 1.2, 2.2 + (t % 20) * 0.3, 1, 'spark', 0.02); if (t % 7 === 0 && dist(zpu, player) < 24) sfx('shoot'); }
        // ambient war: distant booms and tracer fizz
        if (t % 400 === 150) { sfx('boom'); shake = Math.max(shake, 2); }
      };
      say('VAS', 'Listen up, Marines. WAR PECKER is stuck in the Bog. Two nights now. Bogged. Lubed. Stuck.', 300);
      say('JIGGLES', 'Sir, why is there so much lube in a swamp?', 170);
      say('VAS', 'Nobody knows, Jiggles. We don\'t ask. We push up this street, clear the apartments, kill the triple-A, and pull the Pecker out.', 340);
      say('JIGGLES', 'Pull the Pecker out. Hoo-rah.', 150);
    },
    triggers: [
      { x: 25, y: 17, r: 1.8, fn: () => { say('VAS', 'Lubeview Apartments. No power. Goggles on. Check your corners, check your holes.', 260); } },
      { x: 28.5, y: 16.5, r: 1.4, fn: () => { idle([['condom', 28, 11], ['crab', 27.5, 13]]); } },
      { x: 34.5, y: 17.5, r: 1.6, fn: () => { wave([['condom', 34.5, 22.5], ['condom', 36.5, 24.5], ['crab', 33, 21]]); chatter('JIGGLES', 'Door on the right! Door on the right!', 130); } },
      { x: 38, y: 17, r: 1.6, fn: () => { idle([['condom', 35, 10.5], ['chili', 33, 12.5]]); } },
      { x: 41.5, y: 17, r: 1.6, fn: () => { wave([['crab', 41, 22], ['crab', 42.5, 24.5], ['bee', 40, 23]]); say('DOOLEY', 'Crabs! Big ones! In the bathroom!', 150); say('RAMIREZ', 'Why is it always the bathroom?!', 150); } },
    ],
    stages: [
      // 0 — the briefing behind the burning car
      { obj: '', checkpoint: false,
        start() { M.state = 'cut'; player.canMove = false; player.canFire = false; M.flags.introT = t; player.a = -0.9; pitch = 0; for (const s of M.squad) s.lookA = Math.atan2(player.x - s.x, player.y - s.y); },
        tick() { const f = t - M.flags.introT, vas = M.squad[0]; player.a = lerpA(player.a, f < 520 ? angleTo(player, vas) : 0, 0.04); if (f === 60) sfx('boom');
          for (const s of M.squad) s.lookA = Math.atan2(player.x - s.x, player.y - s.y); },
        done: () => t - M.flags.introT > 560,
        end() { M.state = 'play'; player.canMove = true; player.canFire = true; for (const s of M.squad) s.lookA = undefined; } },
      // 1 — the street
      { obj: 'Push up the street with your squad. Stay with Lt. Vas.', count: () => `Hostiles on the street: ${zoneLeft().length}`, hint: 'Use the wrecked cars for cover. Your squad shoots too — let them draw fire.', at: [3, 17.5, 0],
        clearAll: true, clearList: () => zoneLeft(),
        pre() { M.state = 'play'; player.canMove = true; player.canFire = true; squadWarp(SQ_START); },
        start() {
          zone = []; M.goal = { x: 23, y: 17.5 };
          idle([['condom', 6, 13], ['condom', 7.5, 12.5], ['crab', 8, 22], ['chili', 15.5, 13]]);
          say('VAS', 'Move up! Stay off the middle of the road!', 180);
        },
        tick() {
          const x = player.x;
          if (x > 8 && !M.flags.s1a) { M.flags.s1a = true; wave([['condom', 15, 12.5], ['condom', 17, 13.5], ['chili', 16.5, 22], ['crab', 19, 22.5]]); chatter('RAMIREZ', 'Windows! Second shop, both sides!', 140); }
          if (x > 14 && !M.flags.s1b) { M.flags.s1b = true; wave([['condom', 21.5, 13], ['condom', 23, 13.5], ['bee', 22, 17], ['crab', 21, 18.5]]); say('VAS', 'They\'re dug in at the end of the street! Push, push!', 180); }
          if (x > 18 && !M.flags.s1c) { M.flags.s1c = true; wave([['condom', 23.5, 16], ['chili', 23, 18.5]]); }
          // the end of the street: once it's quiet, a second lot comes out of the apartments
          if (M.flags.s1c && !M.flags.s1d && zoneLeft().length === 0) { M.flags.s1d = true; M.flags.s1dT = t; wave([['condom', 27, 16.5], ['condom', 27.5, 18], ['crab', 26, 17], ['bee', 22, 13.5], ['chili', 17, 22.5]], { sightMul: 4 }); say('JIGGLES', 'Door! They\'re coming out of the apartments!', 160); say('VAS', 'Hold here! Let them come to us!', 150); }
          if (M.flags.s1d && !M.flags.s1e && t - M.flags.s1dT > 420) { M.flags.s1e = true; wave([['condom', 26.5, 16.5], ['crab', 26.5, 18], ['condom', 21.5, 13]], { sightMul: 4 }); chatter('DOOLEY', 'More of them! Same door!', 130); }
        },
        done: () => M.flags.s1e && zoneLeft().length === 0 && player.x > 17,
        end() { M.goal = null; say('VAS', 'Street\'s clear! Stack up on the apartments. Jerkson, you\'re on point.', 220); } },
      // 2 — Lubeview Apartments, in the dark
      { obj: isTouch ? 'Clear Lubeview Apartments with the squad. It\'s pitch black: tap NVG for night vision.' : 'Clear Lubeview Apartments with the squad. It\'s pitch black: press N for night vision.', at: [21, 17.5, 0],
        count: () => `Hostiles inside: ${zoneLeft().length} · Night vision: ${M.nvg ? 'ON' : 'off'}`, hint: 'Down the corridor, check every room on both sides. The exit is the far room on the north-east side.', hintAfter: 1500, clearAll: true, clearList: () => zoneLeft(),
        pre() { squadWarp([[19, 16.5], [19, 18.5], [17, 16.5], [17, 18.5]]); },
        start() {
          zone = []; M.nvgOK = true; M.goal = { x: 42, y: 11.5 };
          idle([['condom', 42, 12.5], ['condom', 40, 10], ['crab', 29, 22.5], ['condom', 28.5, 23.5], ['condom', 36, 13.5], ['crab', 30, 9.5]]);
          announce(isTouch ? 'TAP NVG' : 'PRESS N', 'night vision', 36);
        },
        tick() {
          if (!M.flags.nvgNag && inApt(player.x, player.y) && !M.nvg && M.stageT > 200) { M.flags.nvgNag = true; say('VAS', isTouch ? 'Can\'t see your own dick in here. Goggles, Jerkson! Tap NVG!' : 'Can\'t see your own dick in here. Goggles, Jerkson! Press N!', 220); }
          if (player.x > 39 && player.y < 15 && !M.flags.s2x) { M.flags.s2x = true; wave([['condom', 42.5, 13.5], ['chili', 41, 9.5]]); chatter('VAS', 'Last room! Clear it!', 120); }
          if (player.x > 36 && !M.flags.s2back) { M.flags.s2back = true; wave([['condom', 25.5, 17], ['condom', 25.5, 16.2], ['crab', 25.5, 18]], { sightMul: 5 }); say('RAMIREZ', 'Contact rear! They came in behind us!', 150); say('VAS', 'Dooley, Ramirez, turn around! Jerkson, keep pushing!', 190); }
          if (M.stageT === 60 * 60) say('JIGGLES', 'This place smells like a gym sock full of Vaseline.', 200);
        },
        done: () => zoneLeft().length === 0 && M.flags.s2x && player.x > 38.5,
        end() { M.goal = null; say('VAS', 'Building clear. Overpass is right outside that door. The Z-PUBE is on it.', 220); say('JIGGLES', 'The what?', 90); say('VAS', 'Anti-aircraft gun. Quad barrel. Very hairy. Jets can\'t come in till it\'s dead.', 240); } },
      // 3 — the Z-PUBE
      { obj: 'Get onto the overpass and plant Cum-4 on the Z-PUBE anti-air gun (stand next to it)', at: [42, 11.5, 0],
        count: () => M.flags.plant ? `Planting: ${Math.round(M.flags.plant * 100)}%` : `Hostiles on the overpass: ${zoneLeft().length}`, hint: 'The Z-PUBE is the hairy quad gun shooting at the sky. Walk right up to it and stand still until the charge is planted.',
        pre() { M.nvgOK = true; squadWarp([[40, 10.5], [40, 12.5], [38, 10.5], [38, 12.5]]); },
        start() {
          zone = []; M.goal = { x: 53.5, y: 6.5 }; M.flags.plant = 0;
          wave([['condom', 51, 4.5], ['condom', 53, 8], ['chili', 57, 7], ['crab', 49, 9.5], ['condom', 56.5, 11]]);
          say('VAS', 'On the overpass! Jiggles, Dooley, cover fire! Jerkson, get that charge on the gun!', 220);
        },
        tick() {
          if (M.stageT % 480 === 240 && zoneLeft().length < 4) wave([[pickOne(['condom', 'crab', 'chili']), 50 + rand(0, 7), 3.5], ['condom', 57, rand(4, 11)]]);
          const nearGun = dist(player, zpu) < 1.9;
          if (nearGun) { M.flags.plant = Math.min(1, M.flags.plant + 1 / 150 * ts); M.meter = { label: 'PLANTING CUM-4', k: M.flags.plant, color: '#fff2c4' }; if (t % 10 === 0) sfx('tick'); }
          else if (M.flags.plant > 0 && M.flags.plant < 1) { M.meter = { label: 'PLANTING CUM-4 (get back to the gun)', k: M.flags.plant, color: '#fff2c4' }; }
          if (M.flags.plant >= 1 && !M.flags.planted) { M.flags.planted = true; M.flags.plantT = t; M.meter = null; announce('CHARGE PLANTED', 'get clear. it\'s gonna blow.', 38); say('YOU', 'Charge set! Get back!', 120); M.goal = { x: 47, y: 10.5 }; }
          if (M.flags.planted) { const k = t - M.flags.plantT; if (k < 300 && k % 60 === 0) sfx('tick');
            if (k === 300) { const close = dist(player, zpu) < 3.5; explodeAt(zpu.x, zpu.y, 4, 400); killZpu(); shake = 30; flash = 1; sfx('boom'); if (close && !player.invul) hurtPlayer(60, 'c4', zpu); M.flags.zpuDead = true; } }
        },
        done: () => M.flags.zpuDead && t - M.flags.plantT > 330,
        end() { M.meter = null; M.goal = null; announce('Z-PUBE DESTROYED', 'the sky is open for business', 40); say('VAS', 'Triple-A is down! Tell the jets they can come play.', 200); say('PILOT', 'Hog Two-Six, cleared hot. Bringing the rain.', 200); M.flags.jetT = t; } },
      // 4 — the bridge: T-69s coming across, and the JAVELUBE
      { obj: 'Enemy armour on the bridge! Grab the JAVELUBE from the crate on the overpass and knock out the T-69 tanks', at: [49, 9, 0],
        count: () => `T-69 tanks: ${bmps.filter(b => !b.dead).length} left · DILDO-7 rockets: ${player.rockets}`, hint: isTouch ? 'Crate is at the south edge of the overpass. Tap SWAP for the DILDO-7, aim at the tanks (red arrows). Duck behind the sandbags when they fire.' : 'Crate is at the south edge of the overpass. Press 2 for the DILDO-7, aim at the tanks (red arrows). Duck behind the sandbags when they fire.', hintAfter: 900,
        pre() { killZpu(); M.nvgOK = true; squadWarp([[55, 5], [56.5, 8.5], [53, 10.5], [51, 6]]); if (!M.flags.jetT) M.flags.jetT = t - 400; },
        start() {
          zone = []; bmps = []; M.nvg = false; M.squadAt = [[57.4, 5.2], [57.6, 8.6], [55.5, 11.5], [53.2, 6.5]];
          for (const e of ents) if (e.kind === 'enemy' && !e.dead && e.y < 14) killEnt(e, false, 'HOG 2-6');
          crate = spawnPickup('crate', 51.5, 12.3); crate.onGet = () => { M.flags.gotJav = true; player.rockets = Math.max(player.rockets, 10); setWeapon('rocket'); announce('JAVELUBE', 'DILDO-7 · 10 rockets · aim at the armour', 36); };
          M.goal = { x: 51.5, y: 12.3 };
          say('DOOLEY', 'Armour! T-69s, coming across the bridge!', 170);
          say('VAS', 'Jerkson! JAVELUBE, in the crate! Get it on those tanks!', 190);
          spawnBmp(86, 6.5, 74.5, 6.5, 60, { tank: true }); spawnBmp(90, 5.2, 70, 5.2, 700, { tank: true }); spawnBmp(92, 8.2, 76.5, 8.2, 1300, { tank: true });
        },
        tick() {
          const f = t - M.flags.jetT;
          if (f > 0 && f < 200 && f % 40 === 0) { explodeAt(rand(65, 78), rand(4.5, 8.5), 2.6, 300, 'HOG 2-6'); if (f === 40) { sfx('streak'); announce('AIR STRIKE', 'the jets are here. they missed the tanks.', 30); } }
          if (M.flags.gotJav) M.goal = null;
          if (M.stageT === 400 || M.stageT === 1100) wave([['condom', 78, 5.5], ['condom', 78, 8.5], ['chili', 77, 7]], { sightMul: 4 });
          if (player.rockets <= 0 && (!crate || crate.got) && !M.flags.refillT) M.flags.refillT = t;
          if (M.flags.refillT && t - M.flags.refillT > 90) { M.flags.refillT = 0; crate = spawnPickup('crate', 51.5, 12.3); crate.onGet = () => { player.rockets = 10; setWeapon('rocket'); announce('MORE JAVELUBE', '10 rockets', 26); }; M.goal = { x: 51.5, y: 12.3 }; say('VAS', 'More rockets in the crate! South side!', 160); }
        },
        done: () => bmps.length === 3 && bmps.every(b => b.dead),
        end() { say('VAS', 'Bridge is clear! Nice shooting, Marine.', 170); say('VAS', 'We go down the back way. Alleys, behind the overpass. Stay tight.', 220); } },
      // 5 — the back alleys
      { obj: 'Follow the squad down through the back alleys to the bog', at: [55, 9, 0],
        count: () => `Hostiles in the alleys: ${zoneLeft().length}`, hint: 'The alleys start at the south-east corner of the overpass. Watch the yards on the side, and the chain-link.', hintAfter: 1200,
        pre() { killZpu(); M.nvgOK = true; squadWarp([[56, 11.5], [57, 12], [55, 10.5], [54, 11.5]]); for (const b of bmps) b.gone = true; },
        start() {
          zone = []; M.squadAt = null; M.goal = { x: 76.5, y: 18.5 };
          idle([['condom', 67, 11.5], ['crab', 63, 15], ['condom', 67.5, 16.8], ['condom', 72.5, 15], ['chili', 76, 13.5], ['crab', 77, 16.5]]);
        },
        tick() {
          if (player.x > 61 && !M.flags.al1) { M.flags.al1 = true; say('JIGGLES', 'Yard on the right! Watch the windows!', 140); wave([['condom', 66, 14.2], ['crab', 68, 15]]); }
          if (player.x > 71 && !M.flags.al2) { M.flags.al2 = true; wave([['condom', 77, 17], ['crab', 75, 16.5], ['bee', 77, 13.5]], { sightMul: 4 }); say('RAMIREZ', 'Coming up from the bog!', 130); }
          if (player.y > 15 && player.x > 71 && !M.flags.al3) { M.flags.al3 = true; say('VAS', 'Tight corners. Nut the next one before you go round it.', 190); }
        },
        done: () => near(76.5, 18.5, 1.8) && zoneLeft().filter(e => e.y < 19).length === 0,
        end() { M.goal = null; } },
      // 6 — out of the alleys and across the bog to WAR PECKER
      { obj: 'Into the bog. Get to WAR PECKER.', at: [76.5, 18.5, Math.PI / 2],
        count: () => `Distance to WAR PECKER: ${Math.max(0, Math.round((dist(player, tank) - 3) * 3))} m`, hint: 'The tank is in the middle of the bog, south-west of you. Go around the shiny lube puddles, they slow you right down.',
        pre() { killZpu(); M.nvgOK = true; squadWarp([[75.5, 17], [77, 17], [73, 16.5], [72.5, 17]]); for (const b of bmps) b.gone = true; },
        start() {
          zone = []; M.goal = { x: 64.5, y: 25.8 }; M.nvg = false;
          idle([['condom', 70, 22.5], ['crab', 65, 23], ['condom', 57, 22], ['chili', 71, 30], ['condom', 50, 26]]);
          say('PECKER', 'Friendlies coming out of the alleys! About time! This is WAR PECKER. We are stuck. We are SO stuck.', 260);
        },
        tick() {
          if (player.y > 22 && !M.flags.s4b) { M.flags.s4b = true; wave([['condom', 48, 35], ['crab', 52, 31.5], ['chili', 70, 33.5], ['condom', 75, 29]]); say('DOOLEY', 'They\'re in the swamp! Left and right!', 150); }
        },
        done: () => dist(player, tank) < 4.4 && zoneLeft().filter(e => dist(e, tank) < 12).length < 3,
        end() { M.goal = null; say('VAS', 'Pecker, Vas. What do you need?', 150); say('PECKER', 'Main gun\'s gummed up. Big Meaty Pickups inbound from the east. Your JAVELUBE guy, is he any good?', 280); say('VAS', 'He\'s alright. Jerkson, more rockets in the crate by the tank.', 180); } },
      // 7 — JAVELUBE vs the Big Meaty Pickups
      { obj: 'Restock the JAVELUBE at the crate by the tank, then destroy the 3 Big Meaty Pickups (armour)', at: [59, 26, 0],
        count: () => `Big Meaty Pickups: ${bmps.filter(b => !b.dead).length} left · DILDO-7 rockets: ${player.rockets}`, hint: isTouch ? 'Tap SWAP for the DILDO-7 and aim at the armoured trucks (red arrows). Globs bounce off them. Refill at the crate.' : 'Press 2 for the DILDO-7 and aim at the armoured trucks (red arrows). Globs bounce off them. Refill at the crate by the tank.', hintAfter: 900,
        pre() { killZpu(); M.nvgOK = true; squadWarp(SQ_TANK); M.squadAt = SQ_TANK; },
        start() {
          zone = []; bmps = []; M.squadAt = SQ_TANK;
          crate = spawnPickup('crate', 58.6, 26.2); crate.onGet = () => { M.flags.gotJav2 = true; player.rockets = Math.max(player.rockets, 8); setWeapon('rocket'); announce('JAVELUBE', 'DILDO-7 · 8 rockets · aim at the armour', 36); say('VAS', 'Got it? Good. Light \'em up.', 140); };
          M.goal = { x: 58.6, y: 26.2 };
        },
        tick() {
          if ((M.flags.gotJav2 || M.stageT > 420) && !M.flags.bmpIn) { M.flags.bmpIn = true; M.goal = null;
            spawnBmp(82, 25, 71.5, 25); spawnBmp(66, 42, 66, 35.5, 500); spawnBmp(83, 35, 75.5, 35.2, 1000);
            say('PECKER', 'Big Meaty Pickup, east side! Coming down the road!', 180);
            wave([['condom', 76, 22], ['condom', 77, 29], ['chili', 75, 24]]); }
          if (M.flags.bmpIn) {
            if (M.stageT % 720 === 360 && zoneLeft().length < 5) wave([[pickOne(['condom', 'chili']), 77, rand(21, 37)], [pickOne(['crab', 'condom']), rand(57, 66), 35.5]]);
            const nb = bmps.filter(b => !b.dead && b.delay <= 0); if (nb.length && t % 90 === 0) { const b2 = nb[0]; if (!b2.called) { b2.called = true; say(pickOne(['JIGGLES', 'RAMIREZ', 'DOOLEY']), b2.y > 33 ? (b2.x < 70 ? 'Pickup! South side, by the palm!' : 'Another Pickup, south-east!') : 'Pickup on the road, east!', 150); } }
            // out of rockets: the crate refills
            if (player.rockets <= 0 && (!crate || crate.got) && !M.flags.refillT) { M.flags.refillT = t; }
            if (M.flags.refillT && t - M.flags.refillT > 90) { M.flags.refillT = 0; crate = spawnPickup('crate', 58.6, 26.2); crate.onGet = () => { player.rockets = 8; player.hp = 100; setWeapon('rocket'); announce('MORE JAVELUBE', '8 rockets · patched up', 26); }; say('VAS', 'Out of rockets? More in the crate by the tank!', 170); }
          }
        },
        done: () => M.flags.bmpIn && bmps.length === 3 && bmps.every(b => b.dead),
        end() { say('PECKER', 'That\'s all three! Beautiful! Main gun\'s unjammed. We\'re gonna try and rock her loose.', 240); say('VAS', 'Everybody around the tank! Nobody touches the Pecker!', 200); } },
      // 8 — hold while WAR PECKER unsticks
      { obj: 'Defend WAR PECKER while it rocks itself loose. Stay close to the tank.', at: [61, 25.4, -Math.PI / 2],
        count: () => `Unsticking: ${Math.round(100 * (1 - M.timer / (60 * 100)))}% · Hostiles: ${aliveEnemies().filter(e => dist(e, tank) < 22).length}`, hint: 'They come from the north ruins, the east road and the south. WAR PECKER shoots the big groups. Grab lotion when you shrink.',
        pre() { killZpu(); M.nvgOK = true; squadWarp(SQ_TANK); M.squadAt = SQ_TANK; for (const b of bmps) b.gone = true; },
        start() {
          zone = []; M.squadAt = SQ_TANK; tank.guns = true; tank.rof = 280;
          M.timer = 60 * 100; M.timerLabel = 'UNSTICK'; M.onTimeout = () => { M.flags.free = true; }; M.flags.fw = t - 300; M.flags.wv = 0; player.nades = Math.max(player.nades, 3); player.rockets = Math.max(player.rockets, 3);
          say('PECKER', 'Driver, rock it! Forward... back... forward... back...', 200);
        },
        tick() {
          const f = t - M.flags.fw;
          tank.rock = Math.sin(t * 0.08) * 0.06; if (t % 30 === 0 && dist(player, tank) < 14) { sfx('thud'); burst3d(tank.x + rand(-1.5, 1.5), tank.y + rand(-1, 1), 0.1, 4, 'drop', 0.06); }
          if (f > 600 && !M.flags.free) { M.flags.fw = t; const w = M.flags.wv++;
            const L = [
              [['condom', 50, 20], ['condom', 58, 20.5], ['crab', 54, 20.5], ['chili', 47, 25]],
              [['condom', 77, 23], ['condom', 77, 30], ['crab', 76, 26], ['bee', 74, 22]],
              [['crab', 60, 37.5], ['crab', 66, 37.5], ['condom', 50, 37], ['chili', 71, 37.5]],
              [['condom', 50, 20], ['condom', 77, 30], ['chili', 66, 20.5], ['bee', 55, 37], ['crab', 45.5, 27]],
              [['condom', 77, 22], ['condom', 77, 36], ['crab', 60, 37.5], ['crab', 50, 20.5], ['chili', 74, 20.5], ['bee', 62, 20.5]],
            ];
            wave(L[Math.min(w, L.length - 1)], { sightMul: 5 });
            const calls = [['VAS', 'Contact north! By the ruins!'], ['JIGGLES', 'East road! More of \'em!'], ['DOOLEY', 'South side! Crabs in the lube!'], ['RAMIREZ', 'They\'re coming from everywhere!'], ['VAS', 'Last push! Hold the line, Marines!']];
            const c = calls[Math.min(w, calls.length - 1)]; say(c[0], c[1], 150);
          }
          if (M.timer < 60 * 55 && !M.flags.half) { M.flags.half = true; say('PECKER', 'She\'s moving! I felt it move! Keep them off us!', 180); say('JIGGLES', 'That\'s what she said.', 110); say('VAS', 'Jiggles.', 80); }
          if (dist(player, tank) > 16 && t - (M.flags.farNag || -999) > 600) { M.flags.farNag = t; say('VAS', 'Jerkson! Get back to the tank!', 140); }
        },
        done: () => M.flags.free,
        end() { M.timer = null; tank.rock = 0; shake = 14; sfx('boom'); burst3d(tank.x, tank.y, 0.3, 30, 'drop', 0.12); announce('THE PECKER IS OUT', 'with a very loud noise', 44); say('PECKER', 'WE\'RE FREE! WAR PECKER IS OUT OF THE BOG!', 200); say('VAS', 'Escort it east! Stay on the tank!', 170); } },
      // 9 — escort it out
      { obj: 'Escort WAR PECKER east out of the bog. It only moves while you\'re close.', at: [60, 25.6, 0],
        count: () => `WAR PECKER: ${Math.round(100 * clamp((tank.x - TANK0[0]) / (TANK_END - TANK0[0]), 0, 1))}% out · ${dist(player, tank) < 8 ? 'moving' : 'WAITING FOR YOU'}`, hint: 'Walk alongside the tank. If you wander off it stops and waits.',
        pre() { killZpu(); M.nvgOK = true; tank.guns = true; for (const b of bmps) b.gone = true; },
        start() { zone = []; M.squadAt = null; M.goal = { x: 76, y: 26 }; M.flags.amb = 0; tank.restA = 0; },
        tick() {
          const close = dist(player, tank) < 8; M.goal = { x: Math.min(76, tank.x + 1.5), y: tank.y - 2.4 };
          if (close && tank.x < TANK_END) { placeTank(Math.min(TANK_END, tank.x + 0.007 * ts)); if (t % 14 === 0) sfx('step'); }
          M.squadAt = [[tank.x - 1.8, tank.y - 2.2], [tank.x + 0.6, tank.y - 2.3], [tank.x - 1.8, tank.y + 2.3], [tank.x + 0.6, tank.y + 2.4]].map(([x, y]) => walkNav(x, y) ? [x, y] : null);
          if (tank.x > 65 && !M.flags.amb1) { M.flags.amb1 = true; wave([['condom', 77, 22], ['condom', 77, 33], ['chili', 76.5, 27], ['crab', 70, 37.5]], { sightMul: 5 }); say('RAMIREZ', 'Ambush! Up the road!', 140); }
          if (tank.x > 70 && !M.flags.amb2) { M.flags.amb2 = true; wave([['condom', 77, 21], ['crab', 77, 30], ['bee', 76, 36], ['condom', 77, 37]], { sightMul: 5 }); say('VAS', 'Last of them! Keep that tank moving!', 150); }
        },
        done: () => tank.x >= TANK_END - 0.01 && aliveEnemies().filter(e => dist(e, tank) < 14).length === 0,
        end() { M.goal = null; } },
      // 10 — out
      { obj: '', checkpoint: false,
        start() { M.state = 'cut'; player.canMove = false; player.canFire = false; M.flags.outT = t; tank.guns = false; M.squadAt = [[72, 24.6], [73.5, 30.8], [70.5, 25], [70.8, 31.2]]; M.squadCut = true; for (const e of ents) if (e.kind === 'enemy') e.gone = true; },
        tick() {
          const f = t - M.flags.outT; player.a = lerpA(player.a, angleTo(player, M.squad[0]), 0.04); pitch = lerp(pitch, 0, 0.05);
          if (f === 30) say('VAS', 'Good work, Marines. The Pecker is out.', 180);
          if (f === 30) say('PECKER', 'Thanks for the extraction, boys. It was getting real sticky in there.', 220);
          if (f === 30) say('JIGGLES', 'Hoo-rah.', 90);
          if (f === 30) say('VAS', 'Jerkson. Never tell anyone we pulled the Pecker out of the Bog.', 240);
          if (f > 860) M.blackOut = Math.min(1, (f - 860) / 60);
          if (f > 900) M.fadeText = ['THE BOG', 'pecker: successfully pulled out'];
          if (f > 700 && tank.x < 79) { tankBlock(false); tank.x += 0.02; }
        },
        done: () => t - M.flags.outT > 1080,
        end() { M.blackOut = 0; M.fadeText = null; M.squadCut = false; } },
    ],
  };
};

// ---------- 4. NO RUSHIN' ----------
const M4 = () => {
  // v4.6: the No Russian parody. Elevator with Jackoff's crew, "remember... no rushin'", a slow walk through the terminal, then the Pleasure Dome.
  const g = grid(56, 15);
  carve(g, 1, 6, 3, 8); put(g, 4, 7, 'G');                                    // the elevator
  carve(g, 5, 2, 40, 12);                                                      // Terminal 69
  for (const x of [10, 18, 26, 34]) { put(g, x, 4, '#'); put(g, x, 10, '#'); } // pillars
  for (const x0 of [13, 21, 29]) { carve(g, x0, 2, x0 + 3, 2, 'A'); carve(g, x0, 12, x0 + 3, 12, 'A'); }   // check-in desks
  for (const x of [8, 9, 15, 16, 23, 24, 31, 32]) { put(g, x, 5, 'h'); put(g, x, 9, 'h'); }            // bench seats
  put(g, 41, 7, 'G');                                                          // the Pleasure Dome doors
  carve(g, 42, 3, 54, 11);                                                     // inside
  let crew = [], boss = null, ladies = [], lights = [];
  const CREW_OFF = [[0, 0], [-1.2, -0.9], [-1.2, 0.9], [-2.4, 0]];
  return {
    map: g, heights: { '#': 2.2, A: 0.8, G: 2.0 }, tex: { '#': 'concrete', A: 'velvet', G: 'door' }, variants: { '#': ['clinicposter', 5] }, floor: 'lino', ceil: 'ceiltile',
    floorOf: (x) => x >= 42 ? 'carpet' : null, pal: PAL.clinic, start: [2.8, 7.6, 0], par: 240, music: 'muzak', amb: 'room', noRun: true, mute: ['PRICK', 'SARGE', 'MACMILLI'], chatWho: 'JACKOFF',
    card: ['Day 4 – 10:30:00', "Sgt. 'Soap' MacTugish", 'undercover. very undercover.', 'Terminal 69, Pubyat International'],
    props: [['plant', 6, 2.6], ['plant', 6, 11.4], ['plant', 39.4, 2.6], ['plant', 39.4, 11.4], ['posterstand', 12, 7.8], ['posterstand', 28, 6.2], ['magrack', 37, 3], ['cooler', 37, 11], ['sign', 38.6, 7, { spr: 'sign_dome' }],
      ['barrier', 20, 7.6], ['cone', 25, 6, { passable: true }], ['cone', 25, 8, { passable: true }], ['desk', 44, 3.6], ['cooler', 53.4, 3.6], ['plant', 53.4, 10.4], ['plant', 43, 10.4]],
    brief: ['> TERMINAL 69. PUBYAT INTERNATIONAL. 10:30.', "You've been undercover in Imran Jackoff's crew for six months. You've seen things. Some of them were rubber.",
      "Today Jackoff is taking the crew somewhere very special. Nobody will say where. Everybody is smiling.", 'Condom Trooper airport security will try to stop you. Stay with the crew. Do not run.',
      "> OBJECTIVE: remember... no rushin'."],
    init() {
      bakeSign('sign_dome', 'THE PLEASURE DOME', 'arrivals · this way →', '#2a1030', PINK);
      boss = spawnNpc('boss2', 1.4, 6.5, 1.8, 1.4, { r: 0.8, far: 80, mscale: 1.55 });
      crew = [boss, spawnNpc('thug', 1.3, 8.2, 1.3, 1, { far: 80 }), spawnNpc('thug', 2.3, 8.5, 1.3, 1, { far: 80 })];
      const dresses = ['#ff5d8f', '#7a3fb5', '#2ab7a9', '#ffd23f', '#e84a3a', '#3a6ad8', '#ff9ec4', '#1e1e24'];
      for (let i = 0; i < 12; i++) ladies.push(spawnNpc('lady', 44.5 + (i % 4) * 2.6 + rand(-0.4, 0.4), 4.6 + ((i / 4) | 0) * 2.4 + rand(-0.3, 0.3), 1.3, 0.8, { far: 60, dress: dresses[i % dresses.length], hair: ['#3a2418', '#e8c070', '#1a1a1a', '#b8452a'][i % 4], seed: i * 7, faceA: -Math.PI / 2 + rand(-0.6, 0.6) }));
      for (const [x, y, c] of [[46, 5, '#ff4d9a'], [51, 9, '#4d9aff'], [48.5, 7, '#ffd23f']]) { const l = new THREE.PointLight(c, 0, 9, 1.4); l.position.set(x, 2.6, y); level.add(l); lights.push(l); }
    },
    always() {
      // the crew strolls: they keep a few metres ahead of you, never faster than a walk
      if (!boss || M.state !== 'play') return;
      const lead = Math.min(39.6, Math.max(boss.x, player.x + 2.6));
      const tx = M.flags.crewHold ? boss.x : lead;
      boss.x = lerp(boss.x, Math.min(tx, boss.x + 0.022 * ts), 1); boss.y = lerp(boss.y, 7, 0.02); boss.walk = (boss.walk || 0) + ts; boss.faceA = Math.PI / 2;
      crew.forEach((c, i) => { if (!i) return; const [ox, oy] = CREW_OFF[i]; c.x = lerp(c.x, boss.x + ox, 0.05); c.y = lerp(c.y, boss.y + oy, 0.05); c.walk = (c.walk || 0) + ts; c.faceA = Math.PI / 2; });
    },
    triggers: [
      { x: 12, y: 7, r: 3, fn: () => { for (const e of spawnWave([['condom', 17, 2.8], ['condom', 17, 11.2], ['crab', 20, 3.5]])) { e.ai = 'chase'; e.sightMul = 4; } say('JACKOFF', 'Airport security. Deal with it. Slowly.', 180); } },
      { x: 22, y: 7, r: 3, fn: () => { for (const e of spawnWave([['condom', 28, 3], ['condom', 28, 11], ['condom', 31, 7], ['bee', 27, 7]])) { e.ai = 'chase'; e.sightMul = 4; } } },
      { x: 31, y: 7, r: 3, fn: () => { for (const e of spawnWave([['condom', 37, 3.5], ['condom', 37, 10.5], ['crab', 38, 7], ['condom', 35, 3]])) { e.ai = 'chase'; e.sightMul = 4; } say('JACKOFF', 'Nearly there, gentlemen. Nobody. Rush.', 180); } },
    ],
    stages: [
      { obj: '', checkpoint: false,
        start() { M.state = 'cut'; player.canMove = false; player.canFire = false; M.flags.elT = t; player.a = 0; pitch = 0;
          say('JACKOFF', 'Gentlemen. Today is a very special day.', 200); },
        tick() {
          const f = t - M.flags.elT;
          // look round the lift at the crew, then Jackoff turns to you: close-up on his big veiny face
          const toBoss = angleTo(player, boss), toThug = angleTo(player, crew[2]);
          const close = f > 170 && f < 460;
          player.a = lerpA(player.a, f < 120 ? toThug : close ? toBoss : 0, close ? 0.07 : 0.03);
          pitch = lerp(pitch, close ? 22 : 0, 0.05); fovK = lerp(fovK, close ? 0.4 : 0.66, 0.05);
          boss.faceA = Math.atan2(player.x - boss.x, player.y - boss.y);
          if (f % 90 === 0 && f < 380) sfx('tick');
          if (f === 220) say('JACKOFF', "Remember...", 120);
          if (f === 340) { say('JACKOFF', "...no rushin'.", 160); }
          if (f === 470) { sfx('select'); announce('DING', 'floor 69', 40); openGate(4, 7); }
        },
        done: () => t - M.flags.elT > 520, end() { M.state = 'play'; player.canMove = true; player.canFire = true; } },
      { obj: "Walk with the crew to the Pleasure Dome. No rushin' (you can't run). Deal with security.", at: [2.5, 7, 0], pre() { openGate(4, 7); M.state = 'play'; player.canMove = true; player.canFire = true; },
        count: () => `Security left: ${aliveEnemies().length}`, hint: 'Keep walking east behind Jackoff. Shoot the Condom Troopers that come from the desks.',
        start() { M.goal = { x: 40, y: 7 }; player.speedMul = 0.62; },
        tick() {
          if ((keys.ShiftLeft || keys.ShiftRight) && t - (M.flags.rushT || -999) > 240) { M.flags.rushT = t; announce("NO RUSHIN'", 'walk. like a gentleman.', 30); }
          M.flags.crewHold = aliveEnemies().some(e => dist(e, boss) < 7);
        },
        done: () => near(40, 7, 1.8) && noEnemies(), end() { player.speedMul = 1; M.goal = null; } },
      { obj: '', checkpoint: false,
        start() {
          M.state = 'cut'; player.canMove = false; player.canFire = false; M.flags.domeT = t; player.x = 39.6; player.y = 7.4; player.a = 0; pitch = 0;
          boss.x = 40.6; boss.y = 6.2; crew[1].x = 39.2; crew[1].y = 6; crew[2].x = 40.4; crew[2].y = 8.6;
          say('JACKOFF', 'Gentlemen...', 120);
        },
        tick() {
          const f = t - M.flags.domeT;
          if (f === 60) { openGate(41, 7); sfx('select'); }
          if (f > 60 && f < 260) { player.x = lerp(player.x, 43.2, 0.02); boss.x = lerp(boss.x, 45, 0.02); crew[1].x = lerp(crew[1].x, 43.6, 0.02); crew[2].x = lerp(crew[2].x, 44.2, 0.02); }
          if (f === 110) say('JACKOFF', '...welcome to the Pleasure Dome.', 200);
          if (f > 60) { if (t % 16 === 0) sfx('thud'); if (t % 32 === 8) sfx('tick'); lights.forEach((l, i) => { l.intensity = 6; l.color.setHSL(((t * 0.01) + i * 0.33) % 1, 1, 0.55); }); }
          for (const l of ladies) { l.walk = (l.walk || 0) + ts * 1.6; l.dance = true; }
          if (f === 300) say('YOU', '...', 90);
          if (f === 330) say('JACKOFF', "Now you can rush.", 160);
          if (f >= 380 && f < 450) M.pinup = f - 380; else M.pinup = null;   // a pin-up smash-cut, then black
          if (f === 380) { sfx('streak'); flash = 0.6; }
          if (f > 450) M.blackOut = 1;
          if (f > 470) M.fadeText = ['WHAT HAPPENS IN THE CUM ROOM', 'STAYS IN THE CUM ROOM'];
        },
        done: () => t - M.flags.domeT > 660, end() { M.blackOut = 0; M.fadeText = null; M.pinup = null; } },
    ],
  };
};

// ---------- 6. SCORCHED GIRTH (v5.2) ----------
// cold open under a building → 20 MINUTES EARLIER → Black Hawks over Boinlin → rooftop → two office floors → the roof yard
// → DICK-50 overwatch on the street below → paint T-69s for the Wart-Hogs → the tower across falls over → ropes down
// → the boulevard with WAR PECKER → the kill zone → "head for the building!" → it falls on you → the basement → out
const _dayFog = new THREE.Color();
const MS = () => {
  const box = (g, x0, y0, x1, y1, ch) => carve(g, x0, y0, x1, y1, ch);
  const STREET_Z = -6;   // the street below the rooftops, in wall units (x YS = metres): low enough to read, high enough to see over the edge
  // ---- ROOF: helipad, the office tower (two floors joined by a stairwell), the roof yard, and the drop to the street ----
  const R = Array.from({ length: 30 }, () => '_'.repeat(100));
  box(R, 1, 9, 14, 21, 'X'); box(R, 2, 10, 13, 20, '.');                                   // helipad roof
  box(R, 14, 6, 47, 24, 'C'); box(R, 15, 7, 29, 23, '.'); box(R, 32, 7, 46, 23, '.');       // floor 40 (A) and floor 39 (B)
  box(R, 30, 18, 31, 23, '.');                                                               //   the stairwell between them
  put(R, 14, 15, '.'); put(R, 14, 16, '.');                                                  //   in from the helipad
  for (const x of [17, 21, 25]) for (const y of [9, 13, 17]) box(R, x, y, x + 2, y, 'P');    //   cubicles, floor 40
  for (const x of [34, 38, 42]) for (const y of [10, 15, 20]) box(R, x, y, x + 1, y, 'P');   //   cubicles, floor 39
  box(R, 29, 9, 29, 12, 'C'); box(R, 32, 13, 33, 13, 'C');
  box(R, 48, 3, 64, 27, 'X'); box(R, 49, 4, 63, 26, '.');                                    // roof yard
  for (const y of [10, 11]) { put(R, 47, y, '.'); put(R, 48, y, '.'); }                       //   out to the roof yard
  box(R, 52, 6, 52, 9, 'V'); box(R, 52, 13, 52, 17, 'V'); box(R, 56, 20, 60, 20, 'V'); box(R, 56, 5, 58, 5, 'V');
  for (const [x, y] of [[61, 8], [61, 9], [62, 15], [62, 16], [60, 22], [61, 22], [55, 12], [57, 25]]) put(R, x, y, 'A');
  // ---- STREET: the boulevard. WAR PECKER, the bank, the kill zone, and the hotel ----
  const S = grid(92, 26);
  box(S, 1, 8, 88, 17);
  for (const [a, b, y0, y1] of [[10, 15, 5, 7], [30, 36, 18, 20], [46, 52, 5, 7], [62, 66, 18, 20], [70, 74, 5, 7]]) box(S, a, y0, b, y1);
  box(S, 78, 3, 83, 7);                                                                      //   the hotel lobby
  for (const [x, y] of [[20, 10], [21, 10], [27, 15], [28, 15], [39, 11], [40, 11], [55, 14], [56, 14], [63, 10], [69, 15], [70, 15], [76, 11]]) put(S, x, y, 'A');
  // ---- RUBBLE: under the hotel. Dark, crooked, full of crabs ----
  const U = grid(46, 22);
  box(U, 2, 9, 7, 13);                                    // where you wake up
  box(U, 8, 11, 13, 12); box(U, 12, 6, 13, 12); box(U, 13, 5, 22, 9);    // squeeze out into the collapsed shop
  box(U, 18, 10, 19, 15); box(U, 14, 14, 23, 16);         // down through the back
  box(U, 24, 12, 25, 18, '.');                            // TREPPE
  box(U, 26, 17, 41, 18);                                 // the hallway
  box(U, 34, 9, 41, 14); put(U, 37, 15, 'G'); put(U, 37, 16, 'G');   // the room behind the door (breach)
  box(U, 36, 2, 43, 7); put(U, 39, 8, '.');               // out: daylight
  for (const [x, y] of [[4, 10], [6, 12], [15, 7], [20, 6], [16, 15], [21, 14], [29, 18], [33, 17], [36, 11], [40, 13]]) put(U, x, y, 'B');
  const PAL_ROOF = Object.assign({}, PAL.bridge, { fog: '#8a8a88', fogDist: 26, fogNear: 14, ceil: ['#4a4c52', '#a8a49a'], sun: false, clouds: true, cloudC: 'rgba(80,80,84,0.95)', plumes: 8, weather: 'embers', exposure: 1.45,
    hemiSky: '#d0d0d4', hemiGround: '#5a5650', hemiI: 1.6, sunC: '#f0e8dc', sunI: 1.4, cod: { sat: 0.55, con: 1.2, shadow: [0.92, 0.96, 1.04], high: [1.06, 1.0, 0.94], vig: 0.45, grain: 0.04, bloom: 0.35 } });
  const PAL_STREET = Object.assign({}, PAL_ROOF, { fogDist: 16, fogNear: 8, fog: '#7a7672' });
  const PAL_DARK = Object.assign({}, PAL.finale, { fog: '#141210', fogDist: 9, fogNear: 3, exposure: 1.7, hemiI: 1.0, sunI: 0.3, weather: null, cod: { sat: 0.45, con: 1.25, shadow: [0.9, 0.92, 1.0], high: [1.1, 1.02, 0.9], vig: 0.75, grain: 0.06, bloom: 0.5 } });
  const MAPS = {
    roof: { map: R, heights: { '#': 2.6, C: 2.2, A: 0.7, P: 0.62, X: 0.32, V: 1.4 }, tex: { '#': 'concrete', C: 'panelblock', A: 'sand', P: 'steel', X: 'concrete', V: 'fence' }, variants: { C: ['concrete', 6] }, floor: 'gravel',
      floorOf: (x, y) => x >= 30 && x <= 31 && y >= 18 ? 'steps' : x >= 15 && x <= 46 && y >= 7 && y <= 23 ? 'carpet' : null, roofs: [[14, 6, 48, 25, 'concrete', 2.2, '#e8eef0']], indoor: (x, y) => x >= 14.5 && x <= 47.5 && y >= 6.5 && y <= 24.5,
      areaGrade: null, outer: { ground: 'asphalt', ring: 'city', groundY: STREET_Z * YS, near: 30, count: 30 }, pal: PAL_ROOF,
      props: [['ammobox', 3, 11, { passable: true }], ['barrel', 3, 19.5], ['barrel', 12.5, 10.5], ['cone', 7.5, 15, { passable: true }], ['desk', 16.5, 7.6], ['desk', 28, 22.4], ['cooler', 15.6, 22.4], ['plant', 28.4, 7.6], ['magrack', 22, 22.5], ['chair', 18, 11], ['chair', 26, 15], ['chair', 22, 19],
        ['desk', 33, 7.6], ['plant', 45.4, 22.4], ['cooler', 45.4, 7.6], ['chair', 35, 12], ['chair', 43, 17], ['sandbags', 59, 13], ['sandbags', 58, 18], ['cratestack', 49, 25], ['barrel', 50, 4.6], ['tent', 54, 23], ['flag', 62.5, 4.5, { passable: true }]] },
    street: { map: S, heights: { '#': 3.4, A: 0.8 }, tex: { '#': 'panelblock', A: 'sand' }, variants: { '#': ['concrete', 4] }, floor: 'asphalt', floorOf: (x, y) => (y === 8 || y === 17 || y < 8 || y > 17) ? 'rubble' : null,
      roofs: null, indoor: null, areaGrade: null, outer: { ground: 'rubble', ring: 'city', near: 5, count: 44 }, pal: PAL_STREET,
      props: [['wreck', 8, 10], ['wreck', 17, 15.6], ['car', 33, 9.4], ['wreck', 44, 15.8], ['car', 58, 9.6], ['wreck', 67, 12.5], ['barrier', 24, 12.5], ['barrier', 50, 12], ['lampost', 6, 8.4], ['lampost', 26, 16.6], ['lampost', 46, 8.4], ['lampost', 66, 16.6], ['fire', 44, 15.4, { passable: true }], ['smoke', 44, 15.3, { passable: true, z: 0.9 }], ['fire', 67, 12.2, { passable: true }], ['smoke', 67, 12, { passable: true, z: 0.9 }],
        ['sign', 49, 8.2, { spr: 'sign_bank' }], ['sign', 80.5, 7.8, { spr: 'sign_hotel' }], ['flag', 12.5, 5.4, { passable: true }], ['flag', 72.5, 5.4, { passable: true }], ['tires', 36, 19.5], ['cratestack', 64, 19.4], ['barrel', 11, 6.5]] },
    rubble: { map: U, heights: { '#': 1.6, B: 1.0, G: 1.5 }, tex: { '#': 'rock', B: 'rust', G: 'door' }, variants: { '#': ['concrete', 3] }, floor: 'rubble', floorOf: (x, y) => x >= 24 && x <= 25 && y >= 12 && y <= 18 ? 'steps' : x >= 26 && y >= 9 && y <= 18 ? 'lino' : null,
      roofs: [[0, 0, 36, 22, 'concrete', 1.6, '#3a3a36'], [36, 8.5, 46, 22, 'concrete', 1.6, '#3a3a36']], indoor: (x, y) => !(x >= 36 && y <= 8),
      areaGrade: (x, y) => x >= 36 && y <= 8 ? { shadow: [1.05, 1.02, 0.98], high: [1.2, 1.15, 1.05], sat: 0.6, vig: 0.4 } : null, outer: { ground: 'rubble', ring: 'city', near: 4, count: 20 }, pal: PAL_DARK,
      props: [['fire', 7, 9.4, { passable: true }], ['smoke', 7, 9.4, { passable: true, z: 0.6 }], ['cratestack', 21.5, 5.6], ['desk', 15, 8.4], ['barrel', 23, 15.4], ['magrack', 40.4, 9.6], ['desk', 35, 13.4], ['sign', 26, 18.6, { spr: 'sign_treppe' }], ['fire', 42, 3, { passable: true }], ['wreck', 38, 3.2]] },
  };
  let squad = null, heli = null, birds = [], tanks = [], tower = null, hotel = null, pecker = null, zone = [], granola = [], paint = null;
  const zoneLeft = () => zone.filter(e => !e.dead);
  const wave = (list, o = {}) => { const out = spawnWave(list); for (const e of out) { e.ai = 'chase'; e.sightMul = 3; Object.assign(e, o); } zone.push(...out); return out; };
  const idle = (list, o = {}) => { const out = spawnWave(list); for (const e of out) { e.sightMul = 1.4; Object.assign(e, o); } zone.push(...out); return out; };
  const team = (pts) => spawnSquad([['vas', 'SACKMAN', ...pts[0], 2.4, -2.0], ['gas', 'CHUCK', ...pts[1], -1.6, 1.8], ['gropes', 'GRINDER', ...pts[2], -2.2, -1.2]]);
  const mapInit = {
    roof() {
      // the street below: Granola team, the wreckage, and the tower that's about to have a very bad day
      for (const [ty, x, y] of [['wreck', 70, 14], ['car', 76, 18.5], ['wreck', 84, 13], ['car', 92, 16], ['fire', 84, 13.2], ['smoke', 84, 13.1], ['wreck', 96, 19]]) spawnProp(ty, x, y, { passable: true, z: STREET_Z, far: 120 });
      tower = makeTowerBlock(95, 24, 8, 8, 44, STREET_Z * YS);
      for (const [x, y, h, w] of [[78, 1, 30, 7], [97, 6, 36, 5], [68, 1, 22, 5], [88, 28, 26, 8]]) makeTowerBlock(x, y, w, w, h, STREET_Z * YS);
    },
    street() {
      bakeSign('sign_bank', 'DEUTSCHE BONK', 'we never close. we also never open.', '#e8eef4', '#2a3a8a'); bakeSign('sign_hotel', 'HOTEL GUTENTAG', '★★★★ · now with 100% more eggplant', '#fff6e0', INK);
      hotel = makeTowerBlock(80.5, -4, 10, 8, 40, 0);
    },
    rubble() { bakeSign('sign_treppe', 'TREPPE ↑', 'stairs. or "stop". one of those.', '#2a6a3a', '#ffffff'); },
  };
  const go = (name, start) => {
    if (M.curMap !== name) { swapMap(Object.assign({ start }, MAPS[name])); M.curMap = name; mapInit[name](); }
    else if (start) { player.x = start[0]; player.y = start[1]; if (start[2] !== undefined) player.a = start[2]; }
    flashlight(name === 'rubble'); M.scope = false;
  };
  return {
    map: U, heights: MAPS.rubble.heights, tex: MAPS.rubble.tex, variants: MAPS.rubble.variants, floor: 'rubble', floorOf: MAPS.rubble.floorOf, roofs: MAPS.rubble.roofs, indoor: MAPS.rubble.indoor, areaGrade: MAPS.rubble.areaGrade,
    outer: MAPS.rubble.outer, pal: PAL_DARK, start: [4, 11, 0], par: 720, lookDown: -290, scopeZoom: 0.5, noStreaks: true, shrinkMul: 0.25, propCover: true, music: 'tense', amb: 'wind', killWho: ['SACKMAN', 'GRINDER'], leadWho: 'SACKMAN',
    card: ['Day 9 – 15:20:04', "Sgt. Derek 'Frosting' Westbrook", 'Delta Forcefully', 'Boinlin, Germany'],
    props: MAPS.rubble.props,
    brief: ['> BOINLIN, GERMANY. 15:20. THE CITY IS ON FIRE. AGAIN.', 'The Prime Minister\'s prize eggplant, Sir Aubergine, is being held in the Hotel Gutentag.', 'Delta Forcefully goes in: Sackman (call sign Meatal 0-1), Chuck, Grinder, and you. You are Frosting. Nobody chose that.',
      'Black Hawks to a rooftop. Through the offices. Overwatch on the street with the DICK-50 cal while Granola team pushes up. Paint the tanks for the Wart-Hogs.', 'Then down to the street, across the boulevard, into the hotel.', '> OBJECTIVE: get the eggplant. Don\'t get buried. (You get buried.)'],
    init() { M.curMap = 'rubble'; mapInit.rubble(); M.always = () => { flashlightTick();
      if (M.ledge && M.state === 'play') { camH = lerp(camH, 1.25, 0.1); player.x = Math.max(player.x, 63.4); player.x = Math.min(player.x, 63.75); }
      if (M.curMap === 'rubble') { const out = player.x > 35 && player.y < 8.6 ? 1 : 0; hemi.intensity = lerp(hemi.intensity, out ? 2.4 : M.pal.hemiI, 0.04); if (scene.fog) { scene.fog.color.lerp(_dayFog.set(out ? '#b8b4ac' : M.pal.fog), 0.04); scene.background = scene.fog.color; scene.fog.far = lerp(scene.fog.far, out ? 60 : M.pal.fogDist * 3.2, 0.04); } renderer.toneMappingExposure = lerp(renderer.toneMappingExposure, out ? 2.6 : M.pal.exposure, 0.04); sun.intensity = lerp(sun.intensity, out ? 2.0 : M.pal.sunI, 0.04); if (out && M.flash) flashlight(false); } if (tanks.length) for (const tk of tanks) if (!tk.dead && tk.to) { const d = tk.to[0] - tk.x; if (Math.abs(d) > 0.05) tk.x += Math.sign(d) * 0.012 * ts; } if (pecker && pecker.guns) tankTick(pecker); }; },
    stages: [
      // 0 — cold open: under the hotel
      { obj: '', checkpoint: false,
        start() { M.state = 'cut'; player.canMove = false; player.canFire = false; M.flags.coT = t; M.blackOut = 1; camH = 0.16; pitch = 40; player.a = -0.4; M.dig = 0; flashlight(false);
          squad = team([[5.2, 10.4], [6.4, 12.2], [3, 12.6]]); squad.forEach(s => { s.hold = true; }); },
        tick() {
          const f = t - M.flags.coT, sk = squad[0];
          M.blackOut = f < 90 ? 1 : Math.max(0, 1 - (f - 90) / 120) * (0.85 + 0.15 * Math.random());
          if (f === 1) { const l = new THREE.PointLight('#ffb070', 6, 9, 1.2); l.position.set(6, 1.4, 10); level.add(l); M.flags.coLight = l; } if (M.flags.coLight) M.flags.coLight.intensity = 5 + Math.sin(t * 0.4) * 1.2 + Math.random();
          if (f % 40 === 0 && f < 300) sfx('tick');
          if (f === 140) say('SACKMAN', 'Frosting! FROSTING! Can you hear me?', 200);
          if (f === 300) { say('SACKMAN', isTouch ? 'Grab my hand! Dig, man! DIG! (mash JUMP)' : 'Grab my hand! Dig, man! DIG! (mash SPACE)', 240); announce(isTouch ? 'MASH JUMP' : 'MASH SPACE', 'dig yourself out', 60); }
          if (f > 300) { M.meter = { label: 'DIGGING OUT', k: Math.min(1, M.dig / 14), color: '#d8d0c0' }; sk.faceA = Math.atan2(player.x - sk.x, player.y - sk.y); sk.attackT = 5; }
          player.a = lerpA(player.a, angleTo(player, sk), 0.03); pitch = lerp(pitch, f > 300 ? 25 : 40, 0.02);
          if (M.dig >= 14 && !M.flags.out) { M.flags.out = t; M.meter = null; sfx('slide'); shake = 10; say('GRINDER', 'He\'s alive! Barely. Ish.', 150); }
          if (M.flags.out) { const k = Math.min(1, (t - M.flags.out) / 90); camH = lerp(0.16, 0.5, k); pitch = lerp(25, 0, k); }
          if (M.flags.out && t - M.flags.out === 150) say('SACKMAN', 'Meatal 0-1 to Overlord. We are under a building. ...Again.', 220);
          if (M.flags.out && t - M.flags.out > 330) M.blackOut = Math.min(1, (t - M.flags.out - 330) / 40);
          if (M.flags.out && t - M.flags.out > 380) M.fadeText = ['20 MINUTES EARLIER', ''];
        },
        done: () => M.flags.out && t - M.flags.out > 520,
        end() { M.dig = undefined; M.fadeText = null; M.meter = null; camH = 0.5; pitch = 0; } },
      // 1 — the Black Hawks
      { obj: '', checkpoint: false,
        start() {
          go('roof', [-6, 15, 0]); M.state = 'cut'; player.canMove = false; player.canFire = false; M.flags.hT = t; M.blackOut = 1;
          heli = spawnDeco('heli', -6, 15.8, 1.4, 1.6, { z: 5.5, far: 160, faceA: 0 });
          birds = [spawnDeco('heli', -12, 9, 1.4, 1.6, { z: 7, far: 160 }), spawnDeco('heli', -18, 22, 1.4, 1.6, { z: 8.5, far: 160 }), spawnDeco('heli', 40, -12, 1.4, 1.6, { z: 12, far: 200 })];
          squad = team([[-6, 15], [-6, 15], [-6, 15]]); squad.forEach(s => { s.hold = true; });
          say('OVERLORD', 'Meatal 0-1, Overlord. The eggplant is in the Hotel Gutentag. Bring it home.', 240);
        },
        tick() {
          const f = t - M.flags.hT, k = Math.min(1, f / 900); M.blackOut = Math.max(0, 1 - f / 60);
          heli.x = lerp(-26, 7.5, ease(k)); heli.y = 15.8 + Math.sin(f * 0.01) * 0.6 * (1 - k); heli.z = lerp(9, 1.6, ease(Math.min(1, k * 1.05))); heli.faceA = Math.PI / 2;
          player.x = heli.x - 0.2; player.y = heli.y + 2.5; camH = 0.35 + heli.z; player.a = lerpA(player.a, f < 500 ? 0.35 + Math.sin(f * 0.006) * 0.5 : 0, 0.03); pitch = lerp(pitch, f < 500 ? -12 : -4, 0.02);
          squad.forEach((s, i) => { s.x = heli.x + (i ? 0 : -1.0); s.y = heli.y + (i ? 0 : 1.7); s.z = heli.z - (i ? 0 : 0.4); s.faceA = i ? Math.PI / 2 : 0; });
          birds.forEach((b, i) => { b.x += 0.05 + i * 0.01; b.faceA = Math.PI / 2; b.y += Math.sin(f * 0.01 + i) * 0.01; if (b.x > 120) b.x = -40; });
          if (t % 8 === 0) sfx('chop');
          if (f === 260) say('SACKMAN', 'Copy. Meatal team, two minutes. Lock and load.', 180);
          if (f === 440) say('CHUCK', 'I lock. I load. I\'m a professional.', 150);
          if (f === 600) say('GRINDER', 'Is it true the whole city smells like bratwurst?', 180);
          if (f === 760) say('PILOT', 'Thirty seconds! Rooftop LZ!', 140);
          if (f === 880) { say('SACKMAN', 'Feet dry, dicks wet. GO!', 140); sfx('slide'); }
        },
        done: () => t - M.flags.hT > 960,
        end() { camH = 0.5; pitch = 0; squad.forEach(s => { s.hold = false; s.z = 0; }); squadWarp([[9, 13], [9, 18], [6, 15]]); player.x = 7; player.y = 15.5; M.state = 'play'; player.canMove = true; player.canFire = true; } },
      // 2 — floor 40
      { obj: 'Into the office tower. Clear floor 40 with Meatal team.', at: [7, 15.5, 0], count: () => `Hostiles on the floor: ${zoneLeft().length}`, clearAll: true, clearList: () => zoneLeft(), hint: 'In through the door on the east side of the helipad. Use the cubicles as cover.',
        pre() { go('roof', [7, 15.5, 0]); if (!M.squad) squad = team([[9, 13], [9, 18], [6, 15]]); M.state = 'play'; player.canMove = true; player.canFire = true; if (heli && !heli.gone) heli.leave = true; else heli = spawnDeco('heli', 7.5, 15.8, 1.4, 1.6, { z: 1.6, far: 160, faceA: Math.PI / 2, leave: true }); },
        start() {
          zone = []; M.goal = { x: 16, y: 15.5 };
          idle([['condom', 19, 11], ['crab', 23, 15], ['crab', 26, 19], ['condom', 27, 8.5], ['chili', 22, 21.5], ['bee', 28, 14]]);
          say('SACKMAN', 'Stack up on the door. We take the floor, then the stairs.', 200);
        },
        tick() { if (heli && heli.leave) { heli.z += 0.03; heli.x -= 0.06; heli.faceA = -Math.PI / 2; if (t % 9 === 0) sfx('chop'); if (heli.z > 14) heli.gone = true; }
          if (player.x > 15 && !M.flags.f40) { M.flags.f40 = true; M.goal = null; say('GRINDER', 'Cubicles. My personal hell.', 140); }
          if (M.stageT === 60 * 40) say('CHUCK', 'Somebody\'s lunch is still in the microwave. ...It\'s a bratwurst.', 220);
          if (M.flags.f40 && !M.flags.f40b && zoneLeft().length <= 2) { M.flags.f40b = true; wave([['condom', 30.5, 22], ['crab', 31, 20], ['crab', 30.5, 19], ['bee', 28, 21]], { sightMul: 4 }); say('SACKMAN', 'More coming up the stairwell!', 150); } },
        done: () => M.flags.f40b && zoneLeft().length === 0,
        end() { say('SACKMAN', 'Floor\'s clear. Stairwell, south-east corner. Down to thirty-nine.', 220); M.goal = { x: 30.5, y: 21 }; } },
      // 3 — floor 39
      { obj: 'Down the stairwell to floor 39 and fight through to the roof exit', at: [27, 20.5, 0], count: () => `Hostiles: ${zoneLeft().length}`, hint: 'The stairwell is the striped steps in the south-east of floor 40. The roof exit is on the east wall of floor 39, near the north end.', hintAfter: 1200,
        pre() { go('roof', [27, 20.5, 0]); if (!M.squad) squad = team([[25, 19.5], [25, 21.5], [23, 20.5]]); },
        start() { zone = []; M.goal = { x: 30.5, y: 21 }; idle([['condom', 35, 17], ['condom', 40, 12], ['crab', 44, 21], ['condom', 43, 9], ['chili', 37, 8.5], ['bee', 40, 18], ['condom', 45, 13]]); },
        tick() {
          if (player.x > 29.6 && !M.flags.st) { M.flags.st = true; announce('FLOOR 39', 'the stairs smelled weird', 30); M.goal = { x: 46.5, y: 10.5 }; }
          if (player.x > 34 && !M.flags.f39a) { M.flags.f39a = true; wave([['condom', 44, 21], ['chili', 45, 18], ['crab', 41, 22]], { sightMul: 4 }); chatter('GRINDER', 'Behind the copier!', 120); }
          if (player.x > 38 && !M.flags.f39) { M.flags.f39 = true; wave([['condom', 46, 10.5], ['condom', 46, 11.5], ['crab', 45, 8]], { sightMul: 4 }); say('CHUCK', 'Coming in from the roof door!', 140); }
        },
        done: () => M.flags.f39 && zoneLeft().length === 0 && player.x > 40,
        end() { say('SACKMAN', 'Roof door. Go!', 120); } },
      // 4 — the roof yard
      { obj: 'Out onto the roof. Clear it, then grab the DICK-50 cal from the case by the east edge.', at: [45, 10.5, 0], count: () => M.flags.gotCal ? 'Got the DICK-50' : `Hostiles: ${zoneLeft().length}`, hint: 'Out the roof door, past the chain-link. The rifle case is on the sandbags on the east edge, by the flag.',
        pre() { go('roof', [45, 10.5, 0]); if (!M.squad) squad = team([[44, 9.5], [44, 11.5], [42, 10.5]]); },
        start() {
          zone = []; M.goal = { x: 60.5, y: 12 };
          wave([['condom', 55, 7], ['condom', 58, 15], ['crab', 54, 22], ['chili', 61, 19], ['condom', 50, 24]]);
          say('SACKMAN', 'Contacts on the roof!', 140);
          M.flags.calCase = spawnPickup('crate', 60.5, 12); M.flags.calCase.onGet = () => { M.flags.gotCal = true; };
        },
        tick() { if (M.stageT % 600 === 300 && zoneLeft().filter(e => e.x < 64).length < 2) wave([[pickOne(['condom', 'crab']), 49, rand(5, 25)], ['condom', 63, rand(5, 25)]]); },
        done: () => M.flags.gotCal && zoneLeft().filter(e => e.x < 64).length === 0,
        end() { M.goal = null; announce('DICK-50 CAL', isTouch ? 'tap AIM to scope in · it reaches the street' : 'right-click to scope in · it reaches the street', 40); say('SACKMAN', 'You\'re on overwatch, Frosting. Granola team is pushing up the street below. Keep them alive.', 260); } },
      // 5 — overwatch
      { obj: isTouch ? 'OVERWATCH: tap AIM to scope, and shoot the Condom Troopers ambushing Granola team in the street below' : 'OVERWATCH: right-click to scope, and shoot the Condom Troopers ambushing Granola team in the street below', at: [61.5, 12, 0],
        count: () => `Hostiles below: ${zoneLeft().length} · Granola team: ${granola.filter(g => !g.down).length}/4`, hint: 'Stand at the east parapet and look DOWN over the edge. Scope in; the red arrows are on the street.', hintAfter: 900, clearAll: true, clearList: () => zoneLeft(),
        pre() { go('roof', [61.5, 12, 0]); if (!M.squad) squad = team([[60, 9], [61, 16], [58, 12]]); M.flags.gotCal = true; },
        start() {
          zone = []; M.scope = true; M.squadAt = [[61, 8.6], [62, 16.6], [59, 12]];
          M.ledge = true;
          for (const e of ents) if (e.kind === 'enemy' && !e.dead && e.x > 64 && e.z >= 0) killEnt(e, false, 'CHUCK');
          granola = [0, 1, 2, 3].map(i => spawnNpc('soup', 66 + i * 0.8, 13.5 + (i % 2) * 1.6, 1.3, 1.0, { z: STREET_Z, far: 140, friendly: true, vscale: 1.6 }));
          const below = [[72, 10.5], [74, 15.5], [77, 9], [71, 18.5], [79, 14], [82, 11], [76, 20], [83, 17]];
          for (const [x, y] of below) { const e = spawnEnemy('condom', x, y, { z: STREET_Z, frozen: true, far: 140, reveal: true, vscale: 1.7, r: 0.8, faceA: -Math.PI / 2 }); zone.push(e); }
          say('OVERLORD', 'Granola team is pinned on the boulevard. Thin them out, Meatal.', 200);
          say('GRANOLA', 'Granola here! We could really use some love from above!', 200);
        },
        tick() {
          for (const g of granola) { if (g.down) continue; g.x = Math.min(g.x + 0.004, 69); g.walk = (g.walk || 0) + ts; g.attackT = t % 60 < 8 ? 5 : 0; g.faceA = Math.PI / 2; }
          // the ambush hurts them slowly until you sort it out
          if (t % 400 === 0 && zoneLeft().length > 4) { const g = granola.find(q => !q.down); if (g && granola.filter(q => !q.down).length > 2) { g.down = true; g.dead = true; g.deadT = t; say('GRANOLA', 'Man down! We need that overwatch!', 150); } }
          if (t % 37 === 0) { const e = pickOne(zoneLeft()); if (e) { e.attackT = 10; sfx('ashotfar'); } }
          if (M.stageT === 600 && player.ads < 0.5) say('SACKMAN', isTouch ? 'Scope in, Frosting! Tap AIM!' : 'Scope in, Frosting! Right-click!', 160);
        },
        done: () => zoneLeft().length === 0,
        end() { say('GRANOLA', 'Street\'s clear! Thanks, Meatal! We owe you a beer. A small one.', 220); } },
      // 6 — paint the tanks
      { obj: 'Three T-69s rolling up the boulevard. Scope in and hold your aim on each one to paint it for the Wart-Hogs.', at: [61.5, 12, 0],
        count: () => `T-69s: ${tanks.filter(k => !k.dead).length} left${paint ? ` · painting ${Math.round(paint.k * 100)}%` : ''}`, hint: 'Scope in, look down at a tank on the street and keep the crosshair on it until it says PAINTED.', hintAfter: 900,
        pre() { go('roof', [61.5, 12, 0]); if (!M.squad) squad = team([[60, 9], [61, 16], [58, 12]]); M.scope = true; M.squadAt = [[61, 8.6], [62, 16.6], [59, 12]]; },
        start() {
          zone = []; M.scope = true; paint = null;
          M.ledge = true;
          tanks = [[100, 11.5, 82], [104, 15.5, 76], [108, 18.5, 87]].map(([x, y, to]) => spawnDeco('etank', x, y, 1.4, 3, { z: STREET_Z, far: 160, faceA: Math.PI, turretA: Math.PI, reveal: true, scale: 1.4, r: 2.2, to: [to, y], shootable: false,
            onDeath: e => { e.reveal = false; spawnProp('fire', e.x, e.y, { passable: true, z: STREET_Z + 0.4, far: 160 }); spawnProp('smoke', e.x, e.y, { passable: true, z: STREET_Z + 1.4, far: 160 }); announce('T-69 DESTROYED', pickOne(['brrrrrrrrt.', 'the Wart-Hog sends its regards.', 'that\'s a lot of bullet for one tank.']), 34); } }));
          say('OVERLORD', 'Three T-69s on the boulevard. Wart-Hogs are on station. Paint the targets.', 220);
          say('HOG', 'Wart-Hog Two, ready to make it rain. Show me where.', 200);
        },
        tick() {
          const p = player; let on = null;
          if (p.ads > 0.6) for (const tk of tanks) { if (tk.dead || tk.painted) continue; const da = Math.abs(wrapA(angleTo(p, tk) - p.a)), d = dist(p, tk);
            const elev = Math.atan2(STREET_Z * YS + 0.8 - camH * YS, d); if (da < 0.07 + 0.6 / d && Math.abs(elev - pitch * PX2RAD) < 0.12) on = tk; }
          if (on) { if (!paint || paint.tk !== on) paint = { tk: on, k: 0 }; paint.k = Math.min(1, paint.k + 1 / 100 * ts); M.meter = { label: 'PAINTING TARGET', k: paint.k, color: '#ff5050' }; if (t % 8 === 0) sfx('tick');
            if (paint.k >= 1) { const tk = paint.tk; tk.painted = true; paint = null; M.meter = null; announce('TARGET PAINTED', 'wart-hog inbound', 30); say('HOG', pickOne(['Target confirmed. Brrrrrrt.', 'Rolling in hot.', 'Painted target, I see it. Here comes the rain.']), 150); tk.strikeAt = t + 90; } }
          else { if (paint) paint.k = Math.max(0, paint.k - 0.02); if (paint && paint.k <= 0) paint = null; M.meter = paint ? { label: 'PAINTING TARGET', k: paint.k, color: '#ff5050' } : null; }
          for (const tk of tanks) if (tk.strikeAt && !tk.dead) { const f = t - tk.strikeAt; if (f === 0) sfx('streak'); if (f >= 0 && f % 4 === 0) { burst3d(tk.x + rand(-2.5, 2.5) + (f / 4 - 5) * 0.4, tk.y + rand(-1, 1), STREET_Z + 0.3, 6, 'spark', 0.12); sfx('ashot'); }
            if (f === 32) { sfx('boom'); shake = Math.max(shake, 14); burst3d(tk.x, tk.y, STREET_Z + 0.5, 40, 'puff', 0.18); killEnt(tk); } }
          for (const tk of tanks) if (!tk.dead) { tk.turretA = lerpA(tk.turretA, angleTo(tk, player), 0.01); if (t % 300 === (tanks.indexOf(tk) * 90)) { burst3d(tk.x - 2, tk.y, STREET_Z + 1.2, 10, 'puff', 0.08); sfx('thud'); } }
        },
        done: () => tanks.length === 3 && tanks.every(k => k.dead),
        end() { M.meter = null; M.ledge = false; M.flags.fallT = t; say('HOG', 'Three for three. Wart-Hog Two, going home.', 170); } },
      // 7 — the tower across the street falls over
      { obj: '', checkpoint: false,
        pre() { go('roof', [61.5, 12, 0]); if (!M.squad) squad = team([[60, 9], [61, 16], [58, 12]]); },
        start() { M.state = 'cut'; player.canMove = false; player.canFire = false; M.flags.fallT = t; M.scope = false; player.ads = 0; player.x = 62.6; player.y = 18.5; },
        tick() {
          const f = t - M.flags.fallT;
          player.a = lerpA(player.a, angleTo(player, { x: 95, y: 24 }), 0.04); pitch = lerp(pitch, 14, 0.03);
          if (f === 30) say('CHUCK', 'Uh. That building\'s leaning.', 140);
          if (f === 150) say('SACKMAN', 'Buildings don\'t lean.', 120);
          if (f > 170 && tower) { const k = Math.min(1, (f - 170) / 280); tower.rotation.x = -ease(k) * 0.95; tower.rotation.z = ease(k) * 0.2; if (f % 10 === 0) { shake = Math.max(shake, 6 + k * 14); sfx('boom'); burst3d(95 + rand(-6, 6), 24 + rand(-8, 4), STREET_Z + rand(0, 6), 10, 'puff', 0.2); } }
          if (f === 340) { say('GRINDER', 'That one did.', 120); flash = 0.4; }
          if (f === 420) say('SACKMAN', 'Ropes! We\'re going down to the street! Go, go!', 180);
          if (f > 480) { camH -= 0.05; M.blackOut = Math.min(1, (f - 480) / 50); }
        },
        done: () => t - M.flags.fallT > 560,
        end() { camH = 0.5; pitch = 0; } },
      // 8 — the boulevard
      { obj: 'Push up the boulevard with WAR PECKER. Head for the Hotel Gutentag at the far end.', at: [4, 12.5, 0], count: () => `Distance to the hotel: ${Math.max(0, Math.round((80 - player.x) * 1.5))} m`, hint: 'Stay behind the tank and the wrecks. The hotel is at the east end of the street, north side.', hintAfter: 1500,
        pre() { go('street', [4, 12.5, 0]); squad = team([[6, 10.5], [6, 14.5], [3, 14]]); M.state = 'play'; player.canMove = true; player.canFire = true; M.blackOut = 0;
          pecker = spawnDeco('tank', 9, 12.5, 1.6, 4, { faceA: 0, hullA: 0, turretA: 0, restA: 0, far: 120, guns: true, range: 20, rof: 340 }); },
        start() {
          zone = []; M.goal = { x: 76, y: 12.5 }; M.flags.wv = 0;
          idle([['condom', 13, 6], ['condom', 33, 19], ['chili', 22, 9], ['crab', 30, 15], ['condom', 40, 9]]);
          say('SACKMAN', 'WAR PECKER, Meatal 0-1. Nice to see you out of the bog.', 200); say('PECKER', 'We don\'t. Talk. About the bog.', 160);
        },
        tick() {
          // the tank rolls when you're near it and nothing's in its face
          if (pecker && pecker.x < 60 && dist(player, pecker) < 10 && !zoneLeft().some(e => dist(e, pecker) < 6)) { pecker.x += 0.01 * ts; if (t % 14 === 0) sfx('step'); }
          const x = player.x;
          if (x > 18 && !M.flags.b1) { M.flags.b1 = true; wave([['condom', 34, 9], ['condom', 35, 16], ['crab', 31, 19], ['chili', 37, 12]]); say('GRINDER', 'Contacts, up by the cars!', 140); }
          if (x > 34 && !M.flags.b2) { M.flags.b2 = true; wave([['condom', 49, 6], ['condom', 51, 6.5], ['bee', 48, 10], ['crab', 52, 16], ['chili', 55, 9]]); say('GRINDER', 'Deutsche Bonk. I\'ve got an account there.', 170); say('CHUCK', 'Not anymore.', 100); }
          if (x > 26 && !M.flags.b1b && M.flags.b1 && zoneLeft().length <= 2) { M.flags.b1b = true; wave([['condom', 34, 10.5], ['condom', 33, 19.5], ['crab', 40, 15], ['chili', 42, 9]], { sightMul: 4 }); say('SACKMAN', 'Second floor windows! Light \'em up!', 150); }
          if (x > 48 && !M.flags.b3) { M.flags.b3 = true; wave([['condom', 63, 19], ['condom', 65, 9], ['crab', 60, 16], ['condom', 66, 15]]); }
          if (M.flags.b3 && !M.flags.b4 && zoneLeft().length <= 1) { M.flags.b4 = true; wave([['condom', 72, 6], ['condom', 66, 19.5], ['bee', 70, 12], ['chili', 73, 6.5], ['crab', 70, 16]], { sightMul: 5 }); say('PECKER', 'More armour-less idiots up ahead. Engaging.', 160); }
        },
        done: () => player.x > 58 && M.flags.b4 && zoneLeft().filter(e => e.x < 76).length === 0,
        end() { M.goal = null; } },
      // 9 — the kill zone
      { obj: 'AMBUSH! Get out of the kill zone! Run for the hotel lobby!', at: [60, 12.5, 0], count: () => `RUN · ${Math.max(0, Math.round(dist(player, { x: 80.5, y: 5.5 })))} m to the lobby`,
        pre() { go('street', [60, 12.5, 0]); if (!M.squad) squad = team([[58, 10.5], [58, 14.5], [56, 12.5]]); if (!pecker) pecker = spawnDeco('tank', 55, 12.5, 1.6, 4, { faceA: 0, hullA: 0, turretA: 0, restA: 0, far: 120, guns: true, range: 20, rof: 340 }); },
        start() {
          zone = []; M.goal = { x: 80.5, y: 5.5 }; M.squadAt = [[79.5, 5], [81.5, 5], [80.5, 6.5]]; M.squadSpeed = 1.4;
          for (const e of wave([['condom', 71, 6], ['condom', 73, 6.5], ['condom', 63, 18.5], ['condom', 65, 19.5], ['chili', 75, 16], ['bee', 70, 10], ['condom', 86, 12], ['condom', 87, 15]], { sightMul: 6 })) e.rangeMul = 1.4;
          M.flags.kzT = t; shake = 16; sfx('boom'); flash = 0.4;
          say('SACKMAN', 'AMBUSH! Get out of the kill zone! Move, move! Head for the building!', 220);
          say('GRINDER', 'WHICH building?!', 100); say('SACKMAN', 'THE HOTEL! GO!', 120);
          if (pecker) pecker.restA = -0.6;
        },
        tick() {
          if (t % 50 === 0) { const x = player.x + rand(-6, 8), y = rand(9, 16); burst3d(x, y, 0.2, 12, 'puff', 0.12); sfx('ashot'); if (Math.random() < 0.35) { sfx('boom'); shake = Math.max(shake, 8); } }
        },
        done: () => near(80.5, 5.5, 1.8),
        end() { M.squadSpeed = 1; } },
      // 10 — the hotel comes down
      { obj: '', checkpoint: false,
        pre() { go('street', [80.5, 5.5, 0]); if (!M.squad) squad = team([[79.5, 5], [81.5, 5], [80.5, 6.5]]); },
        start() { M.state = 'cut'; player.canMove = false; player.canFire = false; M.flags.hcT = t; for (const e of ents) if (e.kind === 'enemy') e.frozen = true; },
        tick() {
          const f = t - M.flags.hcT;
          if (f === 20) say('CHUCK', 'Uh, Sackman? The building is doing the thing.', 160);
          if (f === 120) say('SACKMAN', 'What thi—', 60);
          player.a = lerpA(player.a, -Math.PI / 2, 0.06); pitch = lerp(pitch, f > 100 ? 70 : 20, 0.04);
          if (hotel && f > 110) { const k = Math.min(1, (f - 110) / 120); hotel.rotation.x = ease(k) * 0.9; if (f % 6 === 0) { shake = Math.max(shake, 10 + k * 24); sfx(f % 12 ? 'thud' : 'boom'); burst3d(player.x + rand(-3, 3), player.y + rand(-3, 1), rand(0.5, 3), 8, 'puff', 0.2); } }
          if (f > 210) M.blackOut = Math.min(1, (f - 210) / 25);
        },
        done: () => t - M.flags.hcT > 300 },
      // 11 — the basement
      { obj: 'You\'re alive. Follow Sackman out through the collapsed basement. Flashlight\'s on.', at: [4, 11, 0], count: () => `Hostiles: ${zoneLeft().length}`, hint: 'East out of the rubble, through the wrecked shop, down the back, up the TREPPE stairs, along the hallway.', hintAfter: 1500,
        pre() { go('rubble', [4, 11, 0]); squad = team([[5.2, 10.4], [6.4, 12.2], [3, 12.6]]); M.state = 'play'; player.canMove = true; player.canFire = true; M.blackOut = 0; M.fadeText = null; camH = 0.5; pitch = 0; },
        start() {
          zone = []; M.goal = { x: 26, y: 17.5 }; M.blackOut = 1; M.flags.bT = t;
          idle([['crab', 17, 7], ['crab', 21, 8], ['crab', 15, 15], ['condom', 22, 15.5], ['crab', 19, 13]]);
          say('SACKMAN', 'Meatal team, sound off.', 140); say('CHUCK', 'Chuck. Mostly.', 100); say('GRINDER', 'Grinder. Concussed. Happy.', 140); say('SACKMAN', 'Flashlights on. We go through the basement.', 180);
        },
        tick() { M.blackOut = Math.max(0, 1 - (t - M.flags.bT) / 90);
          if (player.x > 12 && !M.flags.amb) { M.flags.amb = true; wave([['crab', 22, 5.5], ['crab', 13, 9], ['crab', 20, 9]], { sightMul: 5 }); say('GRINDER', 'Crabs! They\'re in the walls!', 150); flash = 0.2; }
          if (player.x > 23 && !M.flags.tr) { M.flags.tr = true; say('GRINDER', 'Treppe. That\'s German for stairs. Or stop. One of those.', 200); M.goal = { x: 36.5, y: 17.5 }; } },
        done: () => M.flags.tr && near(36.5, 17.5, 1.8) && zoneLeft().filter(e => dist(e, player) < 9).length === 0,
        end() { M.goal = null; } },
      // 12 — breach
      { obj: 'Breach the door. Slow and wet.', at: [36.5, 17.6, -Math.PI / 2], count: () => `Hostiles: ${zoneLeft().length}`,
        pre() { go('rubble', [36.5, 17.6, -Math.PI / 2]); if (!M.squad) squad = team([[35, 17.6], [38, 17.6], [33, 17.6]]); },
        start() {
          zone = []; M.squadAt = [[35.2, 17.6], [38, 17.6], [33.5, 17.6]];
          idle([['condom', 35, 11], ['condom', 39, 12], ['condom', 37, 10]]);
          say('SACKMAN', 'Door. Frosting, kick it in on my mark. ...Mark.', 180);
          M.flags.brT = t;
        },
        tick() {
          const f = t - M.flags.brT;
          if (f === 150) { openGate(37, 15); openGate(37, 16); sfx('butt'); shake = 12; ts = 0.35; sfx('slowmo'); announce('BREACH', 'slow-mo. make it count.', 30); for (const e of zoneLeft()) { e.ai = 'chase'; e.cd = 60; } }
          if (f > 150 && (zoneLeft().length === 0 || f > 150 + 420)) ts = 1;
        },
        done: () => M.flags.brT && t - M.flags.brT > 160 && zoneLeft().length === 0,
        end() { ts = 1; say('SACKMAN', 'Room clear. Daylight, north side. Move.', 160); M.goal = { x: 39.5, y: 4.5 }; M.squadAt = null; } },
      // 13 — out
      { obj: 'Out into the daylight', at: [37.5, 12, -Math.PI / 2],
        pre() { go('rubble', [37.5, 12, -Math.PI / 2]); if (!M.squad) squad = team([[36, 12], [39, 12], [37, 13.5]]); },
        start() { M.goal = { x: 39.5, y: 4.5 }; },
        done: () => near(39.5, 4.5, 1.8),
        end() { M.goal = null; flashlight(false); } },
      { obj: '', checkpoint: false,
        start() { M.state = 'cut'; player.canMove = false; player.canFire = false; M.flags.endT = t; player.x = 39.5; player.y = 7.6; M.squadAt = [[38.2, 3.6], [40.4, 3.2], [42.2, 4.2]]; M.squadCut = true; },
        tick() { const f = t - M.flags.endT; player.a = lerpA(player.a, -Math.PI / 2, 0.04); pitch = lerp(pitch, 6, 0.03);
          if (f === 30) say('SACKMAN', 'Overlord, Meatal 0-1. We\'re out. We\'re going after the eggplant.', 220);
          if (f === 30) say('OVERLORD', 'Copy, Meatal. ...Again?', 140);
          if (f === 30) say('SACKMAN', 'Again.', 100);
          if (f > 560) M.blackOut = Math.min(1, (f - 560) / 50);
          if (f > 600) M.fadeText = ['SCORCHED GIRTH', 'the eggplant is still out there'];
        },
        done: () => t - M.flags.endT > 800,
        end() { M.blackOut = 0; M.fadeText = null; M.squadCut = false; } },
    ],
  };
};

// ---------- 5. GAME OVA ----------
const M5 = () => {
  const g = grid(184, 11);
  carve(g, 1, 3, 178, 7);          // the bridge deck (v4: much, much longer)
  carve(g, 158, 1, 180, 9);        // where it all ends
  for (let x = 6; x < 156; x += 10) { put(g, x, 2, 'A'); put(g, x, 8, 'A'); }
  let hung = null, onFoot = [];
  const railProps = []; for (let k = 0; k < 3; k++) { const o = k * 50; railProps.push(['car', 12 + o, 3.5], ['car', 22 + o, 6.5], ['cone', 26 + o, 3.5, { passable: true }], ['barrier', 31 + o, 6.5], ['car', 38 + o, 3.5], ['lampost', 8 + o, 7.5], ['lampost', 18 + o, 3.5], ['lampost', 28 + o, 7.5], ['lampost', 38 + o, 7.5], ['lampost', 48 + o, 3.5], ['barrier', 44 + o, 3.5], ['wreck', 50 + o, 6.5], ['cone', 54 + o, 3.5, { passable: true }]); }
  let allies = [], boss = null, prick = null, pistol = null, f0 = 0;
  const F = () => t - f0;
  return {
    map: g, heights: { '#': 0.7, A: 3.2, B: 1.6 }, tex: { '#': 'concrete', A: 'tower', B: 'rust' }, floor: 'asphalt', outer: { ground: 'water', groundY: -7, ring: 'mountains' }, floorOf: (x) => x >= 157 ? 'rubble' : null, pal: PAL.bridge, start: [3, 5, Math.PI], par: 200, railSpeed: 0.03, music: 'chase', amb: 'wind',
    card: ['Day 6 – 11:11:11', "Sgt. 'Soap' MacTugish", '22nd Sausage Air Service', 'Bridge over the Tubes'],
    props: [...railProps,
      ['wreck', 160, 2], ['wreck', 166, 8], ['fire', 160.5, 2.5, { passable: true }], ['smoke', 160.5, 2.3, { passable: true, z: 0.8 }], ['car', 170, 1.5], ['fire', 170, 2.4, { passable: true }], ['smoke', 170, 2.2, { passable: true, z: 0.8 }], ['barrel', 175, 8.5], ['wreck', 176, 3], ['barrier', 163, 8.5], ['cone', 165, 1.5, { passable: true }]],
    brief: ['> BRIDGE OVER THE TUBES. 11:11. THE END.', 'Jackoff has the launch codes. He is going to launch something. Nobody asked what.',
      'You are in the back of the truck with Soup, Gas and Gropes. Everything behind you wants to pinch you.', 'Hold them off until the bridge. Then it goes how it always goes. You know how it goes.',
      '> OBJECTIVE: survive the bridge. Don\'t. Look. Back. (Do look back. That\'s where they are.)'],
    init() { say('PRICK', 'Back of the truck, son. They\'re coming up behind us. Fire at will. Will\'s the crab.', 260); },
    stages: [
      { obj: 'You\'re in the back of the truck. Shoot everything chasing you.', count: () => `Distance to the end of the bridge: ${Math.max(0, Math.round((156 - player.x) * 5))} m`, start() { M.state = 'rails'; player.a = Math.PI; M.flags.spawnT = 0; },
        tick() {
          if (t - M.flags.spawnT > (diff === 'regular' ? 70 : 95) && player.x < 150 && !(hung && !hung.dead && !hung.fled)) { M.flags.spawnT = t; const r = Math.random(), ty = r < 0.4 ? 'condom' : r < 0.65 ? 'bee' : 'crab'; spawnEnemy(ty, player.x - 9, rand(3.5, 6.5), { ai: 'chase', speedMul: ty === 'crab' ? 2.2 : 1.6, sightMul: 5 }); }
          for (const e of ents) if (e.kind === 'enemy' && e.x < player.x - 14) e.gone = true;
          if (player.x > 60 && !M.flags.hungIn) { M.flags.hungIn = true; hung = spawnNpc('heli', player.x - 14, 5, 1.4, 1.6, { z: 2.4, far: 90, hp: 520, r: 1.4, shootable: true, hungT: 0, onDeath: e => { e.dead = false; e.shootable = false; e.falling = true; stats.kills++; xpPop(500); sfx('boom'); shake = 24; flash = 0.8; announce('HUNG DOWN', 'you shot down a helicopter. with your dick.', 46); say('PRICK', 'HE SHOT DOWN THE BLOODY CHOPPER.', 180); } });
            announce('HUNG-24', 'shoot it down', 44); say('SOUP', 'CHOPPER! HUNG-24, right on our arse!', 180); say('PRICK', 'Glob the rotor! Everything you\'ve got!', 180); }
          if (hung && !hung.gone) { hung.hungT++;
            if (hung.falling) { hung.z -= 0.03; hung.x -= 0.02; burst3d(hung.x, hung.y, hung.z + 0.5, 2, 'puff', 0.05); if (hung.z < -3) { hung.gone = true; } }
            else if (hung.fled) { hung.z += 0.04; hung.x += 0.1; if (hung.z > 12) hung.gone = true; }
            else { hung.x = lerp(hung.x, player.x - 8, 0.02); hung.y = 5 + Math.sin(hung.hungT * 0.02) * 2.5; hung.z = 2.2 + Math.sin(hung.hungT * 0.05) * 0.3; hung.faceA = Math.PI / 2; if (t % 9 === 0) sfx('chop');
              if (hung.hungT % 100 === 0) { for (let i = -1; i <= 1; i++) { const ang = angleTo(hung, player) + i * 0.1; eproj.push({ x: hung.x, y: hung.y, vx: Math.cos(ang) * 0.16, vy: Math.sin(ang) * 0.16, life: 120, dmg: 5, spr: 'stinger', z: 0.5, h: 0.25, w: 0.35, seed: 0 }); } sfx('sting'); }
              if (player.x > 135) { hung.fled = true; say('GAS', 'It\'s pulling off!', 140); } } }
          if (player.x > 100 && !M.flags.late) { M.flags.late = true; say('GROPES', 'Trucks! Two trucks behind us!', 160); for (let i = 0; i < 2; i++) { const tr = spawnProp('truck', player.x - 12 - i * 4, 4 + i * 2, { passable: true, faceA: 0, far: 60 }); tr.chase = true; onFoot.push(tr); } }
          for (const tr of onFoot) if (tr.chase) { tr.x = Math.min(tr.x + 0.029 * ts, player.x - 6); if (t % 140 === 0) { const e = spawnEnemy(pickOne(['condom', 'crab']), tr.x + 1, tr.y, { ai: 'chase', speedMul: 1.8, sightMul: 5 }); } }
          if (player.x > 25 && !M.flags.mid) { M.flags.mid = true; say('SOUP', 'Bridge! We\'re almost across!', 180); say('PRICK', 'Don\'t say that. Never say that.', 180); }
        },
        done: () => player.x >= 156, end() { M.timer = null; for (const tr of onFoot) tr.gone = true; if (hung) hung.gone = true; } },
      { obj: '', checkpoint: false, start() { M.state = 'cut'; f0 = t; player.canMove = false; player.canFire = false; shake = 34; flash = 1.2; sfx('boom'); say('PRICK', 'HOLD ON!', 90); },
        tick() { const f = F(); roll = Math.sin(f * 0.3) * 0.2 * Math.max(0, 1 - f / 90); if (f === 40) { whiteOut = 1; } if (f > 40) whiteOut = Math.max(0, 1 - (f - 40) / 50); },
        done: () => F() > 110, end() { roll = 0; whiteOut = 0; M.state = 'play'; player.canMove = true; player.canFire = true; player.x = 158.5; player.y = 5; player.a = 0; } },
      { obj: 'Truck crashed! Get next to Prick behind the wreck and survive until the timer runs out', hint: 'Enemies come from the far end of the bridge (east). Use nut-nades on groups.', at: [158.5, 5, 0],
        start() { M.state = 'play'; player.canMove = true; player.canFire = true; camH = 0.5; player.invul = false; prick = spawnNpc('prick', 166, 8, 1.15, 0.9, { far: 60 }); M.goal = { x: 165.5, y: 7.5 };
          M.timer = 60 * 60; M.timerLabel = 'HOLD'; M.onTimeout = () => { M.flags.held = true; }; M.flags.fw = t - 200; player.nades = 3;
          say('PRICK', 'Over here, son! Behind the wreck! They\'re coming down the bridge!', 220); },
        tick() { if (t - M.flags.fw > 400) { M.flags.fw = t; for (const e of spawnWave([[pickOne(['condom', 'crab']), 178, rand(2, 8)], [pickOne(['condom', 'crab', 'bee']), 179, rand(2, 8)], ['condom', 177, rand(2, 8)]])) { e.ai = 'chase'; e.sightMul = 5; } chatter('PRICK', pickOne(['More coming!', 'Keep your head down!', 'Nearly there, son. Nearly.', 'Here comes the tanker...']), 140); } },
        done: () => M.flags.held, end() { M.timer = null; M.goal = null; if (prick) prick.gone = true; say('PRICK', 'TANKER! GET DOW—', 120); } },
      { obj: '', at: [158, 5, 0], checkpoint: false,
        start() {
          M.state = 'crawl'; f0 = t; player.canFire = false; player.invul = true; player.a = 0; camH = 0.5; ts = 1;
          for (const e of ents) if (e.kind === 'enemy') e.gone = true; ents = ents.filter(e => !e.gone);
          M.pal = PAL.finale; M.tex = { '#': 'rust', A: 'tower', B: 'rust' }; buildLevel(); spawnProp('fire', 158, 1.8, { passable: true }); spawnProp('smoke', 158, 1.6, { passable: true, z: 0.8 }); spawnProp('fire', 164.5, 8.5, { passable: true });
          allies = [spawnNpc('gas', 159.6, 3.7, 1.3, 1.0), spawnNpc('gropes', 160.8, 6.6, 1.3, 1.0), spawnNpc('soup', 159.2, 7.3, 1.3, 1.0)];
          boss = spawnNpc('boss', 174, 5, 3.0, 2.3, { r: 1.0, hp: 1, far: 60 });
          prick = spawnNpc('prick', 157.5, 8.2, 1.15, 0.9, { far: 60 });
          shake = 30; flash = 1.4; sfx('boom');
        },
        tick() {
          const f = F();
          if (f < 40) { shake = Math.max(shake, 14); }
          camH = lerp(camH, 0.16, 0.03); ts = lerp(ts, 0.42, 0.03); pitch = lerp(pitch, 24, 0.02);
          if (f === 30) { say('PRICK', 'The bridge... Soup! Gas! Gropes! Sound off!', 220); sfx('slowmo'); }
          if (f === 60) setObjective('Crawl. That\'s all you can do.');
          if (f > 60 && f % 14 === 0 && f < 500) sfx('chop');
          if (f === 150) { allies[0].dead = true; say('SOUP', 'Gas is down!', 160); sfx('shoot'); }
          if (f === 300) { allies[1].dead = true; say('SOUP', 'Gropes! No... no.', 160); sfx('shoot'); }
          if (f === 420) { allies[2].dead = true; say('PRICK', '...Soup.', 200); sfx('shoot'); M.flags.pressF = t; }
          if (f > 90 && boss.x > 161.6) { boss.x -= 0.022; boss.y = lerp(boss.y, 5, 0.01); if (f % 40 === 0) sfx('boss'); }
          if (f === 480) { say('JACKOFF', 'Hello, little fella. I\'d shake your hand, but... you know.', 260); boss.attackT = 999; }
          if (f === 640) { say('JACKOFF', 'You took my arm. I\'m going to take everything.', 220); }
          if (f === 760) { say('PRICK', 'Son... catch.', 160); sfx('slide'); prick.attackT = 999; pistol = spawnPickup('pistol', 157.6, 7.8); pistol.tick = e => { const a = angleTo(e, player); e.x += Math.cos(a) * 0.05; e.y += Math.sin(a) * 0.05; }; pistol.h = 0.35; pistol.w = 0.5; }
        },
        done: () => M.flags.pistol },
      { obj: 'SHOOT HIM.', checkpoint: false,
        start() { M.state = 'showdown'; f0 = t; player.a = angleTo(player, boss); player.canFire = true; player.ammo = 1; player.reloading = false; boss.shootable = true; boss.attackT = 0; boss.onDeath = e => { M.flags.bossDead = true; M.flags.deadT = t; sfx('boss'); shake = 20; ts = 0.2; say('JACKOFF', '...oh.', 120); }; announce(isTouch ? 'TAP TO SHOOT' : 'CLICK TO SHOOT', 'one glob. make it count.', 48); ts = 0.3; sfx('slowmo'); },
        tick() { ts = lerp(ts, M.flags.bossDead ? 0.2 : 0.35, 0.05); if (M.flags.bossDead) { const k = t - M.flags.deadT; if (k > 60) whiteOut = Math.min(1, (k - 60) / 90); } },
        done: () => M.flags.bossDead && t - M.flags.deadT > 170 },
      { obj: '', checkpoint: false,
        start() { M.state = 'cut'; f0 = t; ts = 1; player.canFire = false; player.canMove = false; for (const e of ents) if (e.kind === 'npc' && e !== prick) e.gone = true; ents = ents.filter(e => !e.gone); camH = 0.5; pitch = -30; player.x = 162; player.y = 5; player.a = -Math.PI / 2 + 0.3; whiteOut = 1; spawnDeco('heli', 164, 2.5, 1.4, 1.6, { z: 1.2, far: 40 }); M.pal = PAL.bridge; buildLevel(); },
        tick() { const f = F(); whiteOut = Math.max(0, 1 - f / 60); if (f % 10 === 0 && f < 400) sfx('chop'); if (f === 70) say('PRICK', 'We got you, son. We got you.', 200); if (f === 200) say('PRICK', 'It\'s over. She said... she said you did great.', 240); if (f > 330) whiteOut = Math.min(1, (f - 330) / 60); },
        done: () => F() > 400 },
    ],
  };
};
const MISSIONS = [M1, M2, M3, MB, M4, MS, M5];

