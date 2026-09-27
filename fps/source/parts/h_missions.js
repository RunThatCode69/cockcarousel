
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
  { name: "No Rushin'", place: 'Fertility clinic, waiting room B', date: 'DAY 4 · 10:30 (appt. 9:00)', icon: () => { ctx.save(); ctx.translate(0, 10); ctx.scale(0.65, 0.65); condomArt(0, 0, { f: 0 }); ctx.restore(); } },
  { name: 'GAME OVA', place: 'Bridge over the Tubes', date: 'DAY 6 · 11:11', icon: () => iconDick({ coat: true, onearm: true, angry: true, frown: true, scar: true, skin: '#e9b39d', skin2: '#d8927c' }) },
];
const PAL = {
  camp: { grade: 'rgba(255,170,90,0.25)', ceil: ['#ff9ec4', '#ffd6e7'], fog: '#f2c9b0', fogDist: 15, sun: true, clouds: true, silhouette: 'dunes', silC: '#e0b48a', weather: 'dust' },
  bush: { grade: 'rgba(80,120,255,0.3)', ceil: ['#241452', '#8a5dba'], fog: '#3a2a5a', fogDist: 14, moon: true, stars: true, silhouette: 'bush', silC: '#1a1226', clouds: true, cloudC: 'rgba(90,60,120,0.6)' },
  ship: { grade: 'rgba(60,160,200,0.3)', moon: true, clouds: true, cloudC: 'rgba(60,70,100,0.8)', silhouette: 'sea', silC: '#1a2436', weather: 'rain', ceil: ['#0a1020', '#2a3a5a'], fog: '#0d1a2a', fogDist: 10, dark: 0.08 },
  clinic: { ceil: ['#ffd6e7', '#fff6fa'], fog: '#e8b4d0', fogDist: 28 },
  bridge: { grade: 'rgba(255,140,60,0.3)', ceil: ['#ff5e3a', '#ffd6a8'], fog: '#ffb37a', fogDist: 18, sun: true, clouds: true, cloudC: 'rgba(255,240,220,0.8)', silhouette: 'city', silC: '#c97a5a' },
  finale: { grade: 'rgba(255,80,40,0.35)', ceil: ['#2a1a3a', '#ff5e3a'], fog: '#3a2a3a', fogDist: 14, dark: 0.1, silhouette: 'city', silC: '#2a1a2a', weather: 'embers' },
};
Object.assign(PAL.camp, { hemiSky: '#fff0f5', hemiGround: '#c9a86a', hemiI: 1.3, sunC: '#fff2d8', sunI: 2.4, fogNear: 14, carousel: [60, -40, 1.6] });
Object.assign(PAL.bush, { hemiSky: '#9a8ad0', hemiGround: '#3a4a2a', hemiI: 1.7, sunC: '#c8d4ff', sunI: 1.6, fogNear: 9, carousel: [26, -40, 2.2] });
Object.assign(PAL.ship, { hemiSky: '#b0c4e0', hemiGround: '#3a4a5a', hemiI: 1.7, sunC: '#dfe8ff', sunI: 1.6, fogNear: 8 });
Object.assign(PAL.clinic, { hemiSky: '#ffffff', hemiGround: '#c9a8b8', hemiI: 1.5, sunC: '#fff6f0', sunI: 1.4, fogNear: 16 });
Object.assign(PAL.bridge, { hemiSky: '#ffd6a8', hemiGround: '#6a5a58', hemiI: 1.2, sunC: '#ffb37a', sunI: 2.4, fogNear: 16, carousel: [40, -60, 2.4] });
Object.assign(PAL.finale, { hemiSky: '#ff9a6a', hemiGround: '#2a1a2a', hemiI: 0.9, sunC: '#ff7a3a', sunI: 1.8, fogNear: 6 });

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
  const targetsAt = pts => pts.map(([x, y]) => spawnEnemy('target', x, y));
  let tg = [], courseTg = [];
  // the obstacle course: lane 1 hurdles (east), lane 2 barbed-wire crawl (west), lane 3 tyre run + sprint (east) to the flag
  const COURSE = [[29.5, 7.5], [16.6, 4.6], [22.5, 1.4], [26.5, 2.6], [29.6, 1.4]];
  const courseReset = () => { for (const e of courseTg) e.gone = true; ents = ents.filter(e => !e.gone); courseTg = targetsAt(COURSE); player.x = 23.5; player.y = 8.4; player.a = 0; player.crouch = false; M.timer = 60 * 120; M.flags.courseDone = false; M.goal = { x: 29.5, y: 1.5 }; };
  return {
    map: rows, heights: { '#': 2.0, A: 0.75, G: 1.5, j: 0.3 }, tex: { '#': 'sand', A: 'crate', G: 'gate', P: 'poster', j: 'wood' }, variants: { '#': ['recruit', 7], A: ['hesco', 6] }, floor: 'sandfloor', outer: { ground: 'sandfloor', ring: 'desert' }, pal: PAL.camp, start: [7.5, 7.5, -Math.PI / 2], par: 150, music: 'title', amb: 'wind',
    card: ['Day 1 – 06:09:42', "Sgt. 'Soap' MacTugish", '22nd S.A.S. (Sausage Air Service)', 'Crotchenhill, U.K.'],
    props: [['sign', 4.5, 6.5, { spr: 'sign_camp' }], ['sandbags', 2, 3.5], ['sandbags', 13, 3.5], ['sandbags', 5, 3.5], ['sandbags', 10, 3.5], ['flag', 1.5, 1.5], ['tent', 3.5, 17.5], ['tent', 11.5, 17.5], ['palm', 1.5, 10.5], ['palm', 13.5, 18.5],
      ['barrel', 1.5, 13.5], ['barrel', 2.4, 13.6], ['cratestack', 13.5, 11], ['ammobox', 7.5, 12.5, { passable: true }], ['tires', 17, 18.5], ['cactus', 29.5, 18.5], ['cactus', 17, 10.5], ['sandbags', 24, 10.5], ['sandbags', 28, 14.5],
      ['sign', 21.3, 10.4, { spr: 'sign_ship' }], ['flag', 30.6, 1.2, { passable: true }], ['cone', 24.5, 7.2, { passable: true }], ['cone', 30.5, 5.5, { passable: true }], ['cone', 16.4, 3.4, { passable: true }], ['ammobox', 23.5, 12.5, { passable: true }]],
    scatter: [[['barrel', 'sandbags', 'tires', 'ammobox'], 8, [[7.5, 7.5, 3], [7.5, 1.8, 3], [8.5, 10, 2], [23.5, 8.3, 3], [23, 4.5, 9]], 3]],
    brief: ['> CROTCHENHILL, U.K. — S.A.S. HEADQUARTERS. 06:09.', "Welcome to the S.A.S., new guy. That's the Sausage Air Service. You're the F.N.G.: Freshly Nutted Guy.", 'Captain Prick will be watching. He does not blink. Nobody knows why.',
      'The enemy: the Condom Troopers. They shoot condoms. Get fully wrapped and you are out of the fight.', 'Sarge will teach you to shoot, pump, and eat your vegetables.',
      'Then you run THE COURSE: jump the hurdles, crawl the wire, high-knee the tyres. Wet or go home.', '> OBJECTIVE: graduate without crying.'],
    init() {
      bakeSign('sign_camp', 'BOOTIE CAMP', 'no crying', '#fff6e0', INK); bakeSign('sign_ship', 'THE COURSE', 'jump · crawl · run →', YEL, INK);
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
      { obj: 'Fire from the hip at the 5 targets', start() { tg = targetsAt([[3.5, 1.8], [5.5, 1.8], [7.5, 1.8], [9.5, 1.8], [11.5, 1.8]]); say('SARGE', "Right, new guy. Pick up the DICK-47. That's your rifle. Yes. It is. Don't make it weird.", 280); say('SARGE', isTouch ? 'Tap the right side to fire from the hip. The butts. Shoot the butts.' : 'Click to fire from the hip. The butts. Shoot the butts.', 300); },
      done: () => tg.every(e => e.dead), end() { say('SARGE', "Hip fire's not accurate. Like you. Now do it properly.", 220); } },
      { obj: isTouch ? 'Tap AIM to aim down the sights, then hit the targets' : 'Hold RIGHT-CLICK to aim down the sights, then hit the targets', checkpoint: false, start() { M.flags.aded = false; tg = targetsAt([[4.5, 1.8], [7.5, 1.8], [10.5, 1.8]]); say('SARGE', isTouch ? 'Tap AIM. Look down the shaft. Line the heart up with the tip.' : 'Right-click. Aim down the sights. Line the heart up with the tip. Yes, the tip.', 300); },
      tick() { if (player.ads > 0.8) M.flags.aded = true; }, done: () => M.flags.aded && tg.every(e => e.dead), end() { say('SARGE', "Beautiful. You look down that shaft like you were born to. Gate's open.", 240); openGate(8, 9); } },
      { obj: 'Go through the gate and PUMP (reload)', checkpoint: false, done: () => M.flags.reloaded && player.y > 9.5, end() { say('SARGE', 'That\'s the sound. Wet. Now eat both eggplants — they heal you.', 260); } },
      { obj: 'Eat the 2 eggplants', checkpoint: false, done: () => stats.eggs >= 2, end() { openGate(15, 14); say('SARGE', "Look at you. Big boy now. Next room's got rubbers in it.", 200); } },
      { obj: "Take out the practice rubbers (don't get wrapped)", at: [18, 14.5, 0], pre() { openGate(8, 9); openGate(15, 14); }, start() { spawnWave([['condom', 25, 12], ['condom', 22, 17], ['condom', 28, 17.5]]); for (const e of ents) if (e.type === 'condom') { e.hpMul = 1; e.hp = 45; } }, done: () => noEnemies() && player.x > 15,
        end() { openGate(23, 9); say('SARGE', 'THE COURSE. North gate. Hurdles, wire, tyres, flag. Shoot everything that pops up.', 260); } },
      { obj: 'THE COURSE: jump, crawl, run. Shoot the pop-ups. Reach the flag.', pre() { openGate(8, 9); openGate(15, 14); openGate(23, 9); }, start() { courseReset(); M.timerLabel = 'COURSE'; M.onTimeout = () => { say('SARGE', 'TOO SLOW. Again. She is not impressed.', 200); courseReset(); }; },
        tick() { if (player.x > 30 && player.y < 6.8 && player.y > 5.2 && !player.crouch && t % 90 === 0) announce(isTouch ? 'TAP CROUCH' : 'PRESS C', 'the wire is right there', 30); },
        done: () => M.flags.courseDone,
        end() {
          const el = (60 * 120 - M.timer) / 60, hit = courseTg.filter(e => e.dead).length; M.timer = null;
          const grade = el < 28 ? 'THROBBING' : el < 40 ? 'HARD' : el < 60 ? 'SEMI' : 'SOFT';
          announce(`RECOMMENDED DIFFICULTY: ${grade}`, `your time ${el.toFixed(1)}s · Captain Prick's time: 16.9s · ${hit}/5 pop-ups`, 34);
          say('SARGE', `${el.toFixed(1)} seconds. Prick did it in sixteen point nine. With a hangover. Nobody's ever beaten it.`, 300);
          say('PRICK', 'Soap. Pack your lube. We ride at midnight.', 260);
          M.flags.gradT = t;
        } },
      { obj: 'Graduation', checkpoint: false, done: () => t - M.flags.gradT > 150 },
    ],
  };
};

// ---------- 2. ALL GIRTHED UP ----------
const M2 = () => {
  const rows = [
    '####################################',
    '#.............#....#~~~~~~~~~~~~~~~#',
    '#.............#....#~~~~~~~~~~~~~~~#',
    '#..,,,,,,.....#....#~~~~~~~~~~~~~~~#',
    '#..,,,,,,,....#....#~~~~~~~~~~~~~~~#',
    '#..,,,,,,,,...#....#~~~~~~~~~~~~~~~#',
    '#.....,,,,....#....#~~~~~~~~~~~~~~~#',
    '#.............#....#...............#',
    '#......AAA....#....#......,,,......#',
    '#......A#A....#.....e....,,,,,.....#',
    '#......AAA....#....#....,,,,,,,....#',
    '#..,,,,,......#....#.....,,,,,.....#',
    '#.,,,,,,,,....#....#......,,,......#',
    '#.,,,,,,,,,...#....#...............#',
    '#..,,,,,,.....#....#...............#',
    '#.............#....########.########',
    '#.............#....#...............#',
    '#......,,,....######...............#',
    '#.....,,,,,.......e................#',
    '#......,,,.........................#',
    '#..................................#',
    '####################################',
  ];
  let boss = null;
  return {
    map: rows, heights: { '#': 1.9, A: 0.85 }, tex: { '#': 'hedge', A: 'fence', P: 'poster' }, variants: { '#': ['rock', 6] }, floor: 'dirt', outer: { ground: 'dirt', ring: 'forest' }, pal: PAL.bush, start: [3, 19, 0], par: 200, stealth: true, music: 'night', amb: 'wind',
    card: ['15 years earlier', 'Lt. Jack Prick', 'S.A.S. — still had hair then', 'Pubyat, Ukrainian SSR'], goal: { x: 27.5, y: 7.8 },
    props: [['sign', 4.5, 18.2, { spr: 'sign_bush' }], ['fire', 30.5, 19.5, { passable: true }], ['tent', 33, 17.5], ['lantern', 27.5, 15.2, { z: 0.6, passable: true }], ['lantern', 19.5, 9.2, { z: 0.6, passable: true }], ['rock', 21.5, 7.5], ['rock', 33.5, 7.5], ['rock', 1.5, 8.5],
      ['barrel', 24.5, 16.5], ['cratestack', 33.5, 20.5], ['sign', 26.5, 8.6, { spr: 'sign_look' }], ['rock', 17.5, 1.5]],
    scatter: [[['rock', 'barrel', 'tires'], 6, [[3, 19, 3], [27.5, 7.8, 3]], 7]],
    brief: ['> PUBYAT. 15 YEARS AGO. 04:20.', 'You are young Lieutenant Prick. Your C.O. is Captain MacMillilitre. He is very old and very calm.', 'Ghillie suits on. We are crawling through tall grass that is, and I cannot stress this enough, pubes.',
      'Patrols everywhere: Condom Troopers. Slow, rubbery, very safe. Stay in the grass and they can\'t see you.',
      'At the overlook you get one shot at Imran Jackoff — the biggest dick in the region. Fur coat. Both arms. For now.',
      '> OBJECTIVE: one shot, one squirt. Then run.'],
    init() {
      bakeSign('sign_bush', 'THE BUSH', 'keep out. seriously.', '#fff6e0', INK); bakeSign('sign_look', 'OVERLOOK', 'one shot', YEL, INK);
      for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (map[y][x] === ',' && (x * 7 + y * 5) % 4 === 0) spawnProp('bush', x + 0.5, y + 0.5, { passable: true, far: 12 });
      spawnEnemy('condom', 24, 18, { ai: 'patrol', path: [[24, 18], [32, 18], [32, 20], [24, 20]] });
      spawnEnemy('condom', 22, 8, { ai: 'patrol', path: [[22, 7.5], [33, 7.5], [33, 13.5], [22, 13.5]] });
      spawnEnemy('condom', 31, 11, { ai: 'patrol', path: [[31, 9], [31, 13], [22, 13], [22, 9]] });
      spawnEnemy('condom', 3, 2, { ai: 'patrol', path: [[3, 2], [12, 2], [12, 7], [3, 7]] });
      spawnEnemy('condom', 16, 2, { ai: 'patrol', path: [[16.5, 2], [16.5, 15]] });
      spawnEnemy('trap', 26.5, 10.5); spawnEnemy('trap', 6.5, 12.5); spawnEnemy('trap', 8, 18.5);
      boss = spawnNpc('boss2', 27.5, 2.5, 1.8, 1.4, { r: 0.8, hp: 1, wp: 0, path: [[22, 2.5], [33, 2.5]],
        tick: e => { if (e.flee) { e.x += 0.06; if (e.x > 40) e.gone = true; return; } const w = e.path[e.wp]; const a = Math.atan2(w[1] - e.y, w[0] - e.x); e.x += Math.cos(a) * 0.012; e.y += Math.sin(a) * 0.012; if (Math.hypot(w[0] - e.x, w[1] - e.y) < 0.2) e.wp = (e.wp + 1) % e.path.length; },
        onDeath: e => { e.dead = false; e.hp = 9999; e.shootable = false; e.spr = 'boss'; e.attackT = 999; e.flee = true; M.flags.bossHit = true; sfx('boss'); shake = 10; } });
      say('MACMILLI', "Quiet now. Stay low. Move slow. The rubbers can't see you in the pubes.", 300);
      say('MACMILLI', "See the carousel? Pride of Pubyat. Nobody's ridden it in years. Tragic.", 280);
    },
    triggers: [
      { x: 27, y: 17, r: 2.5, fn: () => { say('MACMILLI', 'Enemy patrol. Get down. Let them pass...', 220); say('MACMILLI', '...Good. Beautiful. For a big fella, you are very quiet.', 260); } },
      { x: 27, y: 11, r: 2, fn: () => say('MACMILLI', 'Keep crawling. Try not to think about whose pubes these are.', 260) },
    ],
    stages: [
      { obj: 'Sneak through the grass to the overlook', done: () => near(27.5, 7.8, 1.6), end() { M.goal.hidden = true; say('MACMILLI', 'There he is. Imran Jackoff. The fur coat. Both arms, for now.', 240); } },
      { obj: 'One shot, one squirt: hit Jackoff', at: [27.5, 7.8, -Math.PI / 2], pre() { M.goal.hidden = true; }, start() { boss.shootable = true; boss.far = 60; say('MACMILLI', 'Account for the wind. And the Coriolis effect. And his feelings. ...Take the shot.', 300); }, done: () => M.flags.bossHit,
        end() { announce('ONE SHOT, ONE SQUIRT', 'you blew his arm clean off', 44); say('MACMILLI', "Target down... no. He's lost an arm. Bloody hell, Leftenant.", 240); say('JACKOFF', 'MY ARM! MY BEAUTIFUL WANKING ARM!', 200); } },
      { obj: 'Everyone is awake. Get back to the LZ.', at: [27.5, 7.8, Math.PI / 2], pre() { M.goal.hidden = true; boss.flee = true; boss.spr = 'boss'; }, start() { M.goal = { x: 3, y: 19 }; spawnWave([['condom', 30, 9], ['bee', 24, 12], ['condom', 29, 17], ['condom', 21, 19], ['bee', 14, 19]]); for (const e of ents) if (e.kind === 'enemy' && e.ai !== 'chase') { e.ai = 'chase'; e.sightMul = 4; } say('MACMILLI', "They know we're here. Rubbers AND bees. Forget stealth. RUN. Back to the LZ.", 240); },
        tick() {
          // the bird comes in low over the treeline, flares and hovers at the LZ
          if (!M.flags.heli && player.x < 16) { M.flags.heli = spawnDeco('heli', -6, 15, 1, 1, { z: 3.2, far: 80, heliT: 0 }); announce('CHOPPER INBOUND', 'get to the LZ', 40); say('PILOT', 'Big Bird, inbound. Pop smoke, pop smoke.', 200); say('MACMILLI', 'Chopper! Get to the LZ, Leftenant!', 200); sfx('chop'); }
          const hl = M.flags.heli; if (!hl) return;
          hl.heliT++; const k = Math.min(1, hl.heliT / 330);
          hl.x = lerp(-6, 3.5, ease(k)); hl.y = lerp(15, 18.6, ease(k)); hl.z = lerp(3.2, 0.62, ease(Math.min(1, k * 1.15))) + (k >= 1 ? Math.sin(t * 0.1) * 0.02 : 0); hl.faceA = 0;
          if (t % 9 === 0) sfx('chop');
          if (k >= 1) { hl.landed = true; if (t % 6 === 0) burst3d(hl.x + rand(-1.2, 1.2), hl.y + rand(-1.2, 1.2), 0.05, 1, 'puff', 0.06); M.goal = { x: 3.5, y: 18.2 }; }
        },
        done: () => M.flags.heli && M.flags.heli.landed && near(3.5, 18.6, 1.9), end() { say('PILOT', 'Get in, get in!', 140); } },
      { obj: 'Extraction', checkpoint: false,
        start() {
          // board: you're pulled up to the open door; the bird lifts off over the pubes
          M.state = 'cut'; player.canMove = false; player.canFire = false; M.goal = null; M.flags.boardT = t;
          for (const e of ents) if (e.kind === 'enemy') e.frozen = true;
          M.flags.gunner = spawnNpc('soup', 0, 0, 1.3, 1, { far: 60 });
        },
        tick() {
          const hl = M.flags.heli, f = t - M.flags.boardT;
          const up = Math.max(0, f - 60);
          hl.z = 0.62 + up * up * 0.00012 + up * 0.004; hl.x = 3.5 + up * 0.012; hl.y = 18.6 - up * 0.02;
          player.x = lerp(player.x, hl.x + 0.2, 0.15); player.y = lerp(player.y, hl.y - 1.3, 0.15);   // sitting in the open side door, legs out, facing the bush
          camH = lerp(camH, 0.35 + hl.z, 0.2); player.a = lerpA(player.a, -Math.PI / 2 + 0.35, 0.04); pitch = lerp(pitch, f > 80 ? -110 : 0, 0.03);
          const g = M.flags.gunner; g.x = hl.x + 1.1; g.y = hl.y - 1.0; g.z = hl.z - 0.2; g.faceA = Math.PI + 0.4;
          if (t % 8 === 0) sfx('chop');
          if (f === 70) say('MACMILLI', 'Everybody on? GO! GO!', 140);
          if (f === 170) say('MACMILLI', "Mark my words, Leftenant: fifteen years from now he's going to be very upset about that arm.", 320);
          if (f > 360) whiteOut = Math.min(1, (f - 360) / 60);
        },
        done: () => t - M.flags.boardT > 430, end() { whiteOut = 0; camH = 0.5; pitch = 0; } },
    ],
  };
};

// ---------- 3. CREW EXPANDABLE ----------
const M3 = () => {
  const g = grid(30, 24);
  carve(g, 1, 1, 6, 6); put(g, 7, 3, '.');                 // helipad + door
  carve(g, 8, 1, 9, 22);                                   // spine
  carve(g, 11, 1, 16, 6); put(g, 10, 3, '.');              // room B (crabs)
  carve(g, 11, 9, 16, 14); put(g, 10, 11, '.');            // room C (eggplant + crabs)
  carve(g, 8, 20, 27, 21);                                 // lower corridor
  carve(g, 26, 3, 27, 21);                                 // riser
  carve(g, 19, 1, 24, 6); put(g, 25, 4, '.');              // engine room
  carve(g, 19, 9, 24, 18); put(g, 25, 12, '.');            // the hold
  put(g, 20, 11, 'B'); put(g, 22, 14, 'B'); put(g, 21, 16, 'B'); put(g, 13, 4, 'B'); put(g, 14, 11, 'B');
  put(g, 13, 12, 'e'); put(g, 22, 3, 'e'); put(g, 9, 15, 'e');
  for (let y = 1; y <= 22; y += 4) put(g, 7, y, 'A');   // rusty panels on the spine's port side
  return {
    map: g, heights: { '#': 1.7, A: 1.7, B: 1.3, G: 1.5 }, tex: { '#': 'steel', A: 'rust', B: 'container', G: 'gate' }, variants: { '#': ['porthole', 5] }, floor: 'deck', outer: { ground: 'water', groundY: -1.6, ring: 'sea' }, pal: PAL.ship, start: [3.5, 3.5, 0], par: 170, music: 'tense', amb: 'sea',
    card: ['Day 3 – 01:00:12', "Sgt. 'Soap' MacTugish", '22nd Sausage Air Service', 'MV Blue Balls — Bering Sea'], goal: { x: 21.5, y: 17 },
    props: [['lifering', 1.3, 5.5, { passable: true }], ['barrel', 5.5, 1.5], ['valve', 8.3, 7.5, { passable: true }], ['valve', 9.7, 14.5, { passable: true }], ['lantern', 8.5, 4, { z: 0.65, passable: true }], ['lantern', 9.5, 12, { z: 0.65, passable: true }], ['lantern', 17.5, 20.5, { z: 0.65, passable: true }], ['lantern', 26.5, 8, { z: 0.65, passable: true }],
      ['cratestack', 11.5, 1.5], ['cratestack', 16.5, 6.5], ['barrel', 11.5, 14.5], ['tires', 16.5, 9.5], ['ammobox', 12.5, 20.5, { passable: true }], ['barrel', 19.5, 1.5], ['valve', 24.5, 1.5, { passable: true }], ['cratestack', 19.5, 9.5], ['barrel', 24.5, 18.5], ['lifering', 27.7, 15.5, { passable: true }], ['sign', 10.8, 20.5, { spr: 'sign_hold' }]],
    scatter: [[['barrel', 'cratestack', 'tires', 'ammobox'], 6, [[3.5, 3.5, 3], [21.5, 17, 2]], 11]],
    brief: ['> BERING SEA. 01:00. RAINING SIDEWAYS.', 'Cargo ship MV Blue Balls. Crew: entirely crabs. Cargo: one package, extremely ours.',
      'Rope in from the bird, sweep the corridors, grab the package from the hold.', 'Then the ship will sink, because it always does, and you will run.',
      '> OBJECTIVE: get the package. Don\'t go down with the ship. Or do. Your funeral.'],
    init() {
      bakeSign('sign_hold', 'HOLD →', 'mind the crabs', YEL, INK);
      spawnDeco('heli', 3.5, 1.5, 1.4, 1.6, { z: 1.4, far: 30 });
      spawnWave([['condom', 12, 2], ['crab', 15, 5], ['condom', 9, 12], ['condom', 12, 13], ['crab', 15, 21], ['condom', 22, 21], ['condom', 27, 8], ['crab', 21, 3], ['condom', 20, 10], ['crab', 23, 17]]);
      spawnPickup('crate', 21.5, 17).onGet = () => { M.flags.package = true; };
      say('PRICK', 'Bravo Six, going wet. Weapons free.', 200); say('PILOT', 'Crew?', 120); say('PRICK', "Expendable. Rubbers and crabs. Mostly rubbers.", 180);
    },
    triggers: [
      { x: 8.5, y: 12, r: 1.5, fn: () => { say('PRICK', 'Check your corners. Check your corners.', 180); say('PRICK', "Hallway clear. Crabs don't do corners.", 200); } },
      { x: 26.5, y: 12.5, r: 1.5, fn: () => say('PRICK', 'The hold. Package should be in there. Smells like eggplant.', 220) },
    ],
    stages: [
      { obj: 'Find the package in the hold', done: () => M.flags.package, end() { announce('PACKAGE SECURED', 'it\'s eggplants. it\'s always eggplants.', 40); } },
      { obj: 'THE SHIP IS SINKING. Get back to the helipad!', at: [22.5, 17, Math.PI], pre() { for (const e of ents) if (e.kind === 'pickup' && e.type === 'crate') e.got = true; }, start() { M.goal = { x: 3.5, y: 3.5 }; M.timer = 60 * 75; M.timerLabel = 'SINKING'; M.onTimeout = () => die('timer'); shake = 16; flash = 0.5; sfx('boom'); say('PRICK', 'That\'s a bomb. Ship\'s going down. Move it, move it, MOVE IT!', 240);
          spawnWave([['condom', 26.5, 16], ['crab', 24, 20.5], ['condom', 12, 20.5], ['crab', 9, 18], ['condom', 9, 8], ['condom', 8.5, 4]]); for (const e of ents) if (e.kind === 'enemy') { e.ai = 'chase'; e.sightMul = 3; } },
        tick() { roll = lerp(roll, -0.16 * (1 - M.timer / (60 * 75)), 0.02); },
        done: () => near(3.5, 3.5, 2.2), end() { M.timer = null; say('PRICK', 'Bird\'s overhead! JUMP FOR IT!', 200); } },
      { obj: 'JUMP', checkpoint: false, start() { M.state = 'cut'; player.canMove = false; player.canFire = false; player.a = -Math.PI / 2; player.x = 3.5; player.y = 4.2; M.flags.jumpT = t; sfx('chop'); },
        tick() { const f = t - M.flags.jumpT; if (f % 8 === 0) sfx('chop'); if (f > 40) { player.y -= 0.03; camH = Math.min(0.95, camH + 0.012); pitch = lerp(pitch, -120, 0.04); } if (f === 100) { shake = 18; announce('GRABBED', 'by the balls. as is tradition.', 44); } if (f > 110) flash = Math.min(1.2, flash + 0.06); },
        done: () => t - M.flags.jumpT > 150 },
    ],
  };
};

// ---------- 4. NO RUSHIN' ----------
const M4 = () => {
  const g = grid(34, 24);
  carve(g, 1, 12, 14, 22);                                                   // waiting room
  [3, 5, 7, 9, 11].forEach(x => { put(g, x, 14, 'h'); put(g, x, 17, 'h'); });
  put(g, 1, 12, 'q'); put(g, 14, 12, 'q'); put(g, 1, 22, 'q');
  carve(g, 16, 16, 22, 22); put(g, 15, 19, '.');                             // reception
  carve(g, 16, 17, 20, 17, 'A');                                             // the counter (velvet)
  carve(g, 24, 2, 25, 22); put(g, 23, 19, '.');                              // escalator shaft
  carve(g, 24, 5, 25, 20, '^');
  carve(g, 4, 1, 32, 3); put(g, 3, 2, 'G');                                  // upstairs hallway, Room 69 gate
  carve(g, 8, 2, 20, 2, '>');                                                // the walkway, going the wrong way
  carve(g, 1, 1, 2, 3);                                                      // Room 69
  put(g, 30, 1, 'e'); put(g, 12, 21, 'e'); put(g, 2, 13, 'e');
  put(g, 0, 17, 'P'); put(g, 33, 2, 'P');
  let wave = 0, serving = 4;
  const SPAWNS = [[2, 13], [13, 13], [7, 21.5], [13, 21.5]];
  const waves = [[['condom', 0], ['condom', 1], ['bee', 2]], [['condom', 0], ['condom', 3], ['bee', 1], ['bee', 2]], [['condom', 1], ['condom', 2], ['condom', 3], ['bee', 0], ['bee', 3]]];
  const nextWave = () => { const w = waves[wave]; if (!w) return; spawnWave(w.map(([ty, s]) => [ty, SPAWNS[s][0], SPAWNS[s][1]])); for (const e of ents) if (e.kind === 'enemy') { e.ai = 'chase'; e.sightMul = 3; } wave++; serving++; bakeBoard(serving); announce(`NOW SERVING: ${serving}`, 'your number is 69. nobody is rushing.', 40); };
  return {
    map: g, heights: { '#': 1.8, A: 0.7, G: 1.5, P: 1.8 }, tex: { '#': 'tile', A: 'velvet', G: 'door', P: 'poster' }, variants: { '#': ['clinicposter', 6] }, floor: 'lino', ceil: 'ceiltile', floorOf: (x, y) => (x <= 14 && y >= 12) ? 'carpet' : null, pal: PAL.clinic, start: [7.5, 20.5, -Math.PI / 2], par: 190, music: 'muzak', amb: 'room',
    card: ['Day 4 – 10:30:00 (appt. 9:00)', "Sgt. 'Soap' MacTugish", 'undercover, sort of', 'Fertility Clinic — Waiting Room B'], goal: { x: 19.5, y: 19.5 },
    props: [['cooler', 13.5, 21.5], ['magrack', 1.5, 20.5], ['posterstand', 1.5, 16.5], ['cooler', 21.5, 21.5], ['board', 21.5, 18.2, { passable: true }], ['magrack', 16.5, 21.5], ['cone', 24.5, 21.5, { passable: true }], ['sign', 28.5, 1.4, { spr: 'sign_69' }], ['posterstand', 31.5, 2.5], ['cooler', 6.5, 1.5], ['magrack', 12.5, 1.5]],
    brief: ['> FERTILITY CLINIC, WAITING ROOM B. 10:30. APPOINTMENT WAS AT 9.', 'Deep cover. You are here to make a deposit. Nobody is rushing. Nobody has ever rushed here.',
      'Take a number at reception. Wait your turn. Condom Troopers guard the waiting room; they will try to wrap you.', 'When they call 69, ride the escalator up to Room 69. The walkway may be going the wrong way. That is on purpose.',
      '> OBJECTIVE: make the deposit. Remember: no Rushin\'.'],
    init() {
      bakeSign('sign_69', 'ROOM 69', '← this way', '#fff6e0', PINK); bakeBoard(4);
      spawnPickup('ticket', 19.5, 19.5);
      spawnNpc('prick', 21.5, 16.5, 1.15, 0.9, { far: 30 });
      say('PRICK', 'Remember... no rushin\'.', 200); say('PRICK', "I'm at reception, son. Undercover. The mustache is a disguise.", 240);
    },
    triggers: [
      { x: 24.5, y: 18, r: 1.6, fn: () => say('PRICK', 'Escalator\'s going up. Let it carry you. No rushin\'.', 220) },
      { x: 20, y: 2, r: 1.5, fn: () => { say('PRICK', 'That walkway is going the wrong way.', 160); say('PRICK', '...Walk anyway.', 140); announce('WRONG WAY', 'nobody is rushing', 40); } },
      { x: 5, y: 2, r: 1.5, fn: () => say('PRICK', 'Room 69. Go on in. Take your time. That\'s a joke. Please hurry.', 220) },
    ],
    stages: [
      { obj: 'Take a number at reception', done: () => M.flags.ticket, end() { M.goal = null; say('PRICK', 'Sixty-nine. Nice. Now sit tight — they\'re calling four.', 220); } },
      { obj: 'Wait your turn (nobody is rushing)', at: [7.5, 20.5, -Math.PI / 2], pre() { for (const e of ents) if (e.kind === 'pickup' && e.type === 'ticket') e.got = true; M.goal = null; }, start() { M.flags.waveT = t; nextWave(); },
        tick() { if (noEnemies() && wave < waves.length && t - M.flags.waveT > 90) { M.flags.waveT = t; nextWave(); } },
        done: () => wave >= waves.length && noEnemies(), end() { serving = 69; bakeBoard(69); announce('NOW SERVING: 69', 'that\'s you. finally.', 46); openGate(3, 2); say('PRICK', 'Sixty-nine! That\'s you. Escalator\'s past reception. Room 69 is upstairs at the far end.', 300); M.goal = { x: 1.5, y: 2 }; } },
      { obj: 'Ride the escalator up to Room 69', at: [20, 19.5, 0], pre() { for (const e of ents) if (e.kind === 'pickup' && e.type === 'ticket') e.got = true; openGate(3, 2); M.goal = { x: 1.5, y: 2 }; }, start() { spawnWave([['bee', 12, 2], ['bee', 28, 2], ['condom', 6, 2]]); for (const e of ents) if (e.kind === 'enemy') { e.ai = 'chase'; e.sightMul = 3; } },
        done: () => near(1.5, 2, 1.3), end() { announce('DEPOSIT MADE', 'the doctor will see you now', 44); say('PRICK', 'Sample delivered. You beautiful, patient man.', 240); M.flags.outT = t; } },
      { obj: 'Deposit', checkpoint: false, done: () => t - M.flags.outT > 130 },
    ],
  };
};

// ---------- 5. GAME OVA ----------
const M5 = () => {
  const g = grid(82, 11);
  carve(g, 1, 3, 78, 7);          // the bridge deck
  carve(g, 58, 1, 80, 9);         // where it all ends
  for (let x = 6; x < 56; x += 10) { put(g, x, 2, 'A'); put(g, x, 8, 'A'); }
  let allies = [], boss = null, prick = null, pistol = null, f0 = 0;
  const F = () => t - f0;
  return {
    map: g, heights: { '#': 0.7, A: 3.2, B: 1.6 }, tex: { '#': 'concrete', A: 'tower', B: 'rust' }, floor: 'asphalt', outer: { ground: 'water', groundY: -7, ring: 'city' }, floorOf: (x) => x >= 57 ? 'rubble' : null, pal: PAL.bridge, start: [3, 5, Math.PI], par: 200, railSpeed: 0.028, music: 'chase', amb: 'wind',
    card: ['Day 6 – 11:11:11', "Sgt. 'Soap' MacTugish", '22nd Sausage Air Service', 'Bridge over the Tubes'],
    props: [['car', 12, 3.5], ['car', 22, 6.5], ['cone', 26, 3.5, { passable: true }], ['barrier', 31, 6.5], ['car', 38, 3.5], ['lampost', 8, 7.5], ['lampost', 18, 3.5], ['lampost', 28, 7.5], ['lampost', 38, 7.5], ['lampost', 48, 3.5], ['barrier', 44, 3.5], ['car', 50, 6.5], ['cone', 54, 3.5, { passable: true }],
      ['wreck', 60, 2], ['wreck', 66, 8], ['fire', 60.5, 2.5, { passable: true }], ['smoke', 60.5, 2.3, { passable: true, z: 0.8 }], ['car', 70, 1.5], ['fire', 70, 2.4, { passable: true }], ['smoke', 70, 2.2, { passable: true, z: 0.8 }], ['barrel', 75, 8.5], ['wreck', 76, 3], ['barrier', 63, 8.5], ['cone', 65, 1.5, { passable: true }]],
    brief: ['> BRIDGE OVER THE TUBES. 11:11. THE END.', 'Jackoff has the launch codes. He is going to launch something. Nobody asked what.',
      'You are in the back of the truck with Soup, Gas and Gropes. Everything behind you wants to pinch you.', 'Hold them off until the bridge. Then it goes how it always goes. You know how it goes.',
      '> OBJECTIVE: survive the bridge. Don\'t. Look. Back. (Do look back. That\'s where they are.)'],
    init() { say('PRICK', 'Back of the truck, son. They\'re coming up behind us. Fire at will. Will\'s the crab.', 260); },
    stages: [
      { obj: 'Hold them off until the bridge', start() { M.state = 'rails'; player.a = Math.PI; M.flags.spawnT = 0; },
        tick() {
          if (t - M.flags.spawnT > (diff === 'regular' ? 70 : 95) && player.x < 50) { M.flags.spawnT = t; const r = Math.random(), ty = r < 0.5 ? 'condom' : r < 0.8 ? 'bee' : 'crab'; spawnEnemy(ty, player.x - 9, rand(3.5, 6.5), { ai: 'chase', speedMul: ty === 'crab' ? 2.2 : 1.6, sightMul: 5 }); }
          for (const e of ents) if (e.kind === 'enemy' && e.x < player.x - 14) e.gone = true;
          if (player.x > 25 && !M.flags.mid) { M.flags.mid = true; say('SOUP', 'Bridge! We\'re almost across!', 180); say('PRICK', 'Don\'t say that. Never say that.', 180); }
        },
        done: () => player.x >= 56, end() { M.timer = null; } },
      { obj: '', at: [58, 5, 0],
        start() {
          M.state = 'crawl'; f0 = t; player.canFire = false; player.invul = true; player.a = 0; camH = 0.5; ts = 1;
          for (const e of ents) if (e.kind === 'enemy') e.gone = true; ents = ents.filter(e => !e.gone);
          M.pal = PAL.finale; M.tex = { '#': 'rust', A: 'tower', B: 'rust' }; buildLevel(); spawnProp('fire', 58, 1.8, { passable: true }); spawnProp('smoke', 58, 1.6, { passable: true, z: 0.8 }); spawnProp('fire', 64.5, 8.5, { passable: true });
          allies = [spawnNpc('gas', 59.6, 3.7, 1.3, 1.0), spawnNpc('gropes', 60.8, 6.6, 1.3, 1.0), spawnNpc('soup', 59.2, 7.3, 1.3, 1.0)];
          boss = spawnNpc('boss', 74, 5, 3.0, 2.3, { r: 1.0, hp: 1, far: 60 });
          prick = spawnNpc('prick', 57, 8.2, 1.15, 0.9, { far: 60 });
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
          if (f > 90 && boss.x > 61.6) { boss.x -= 0.022; boss.y = lerp(boss.y, 5, 0.01); if (f % 40 === 0) sfx('boss'); }
          if (f === 480) { say('JACKOFF', 'Hello, little fella. I\'d shake your hand, but... you know.', 260); boss.attackT = 999; }
          if (f === 640) { say('JACKOFF', 'You took my arm. I\'m going to take everything.', 220); }
          if (f === 760) { say('PRICK', 'Son... catch.', 160); sfx('slide'); prick.attackT = 999; pistol = spawnPickup('pistol', 57.4, 7.8); pistol.tick = e => { const a = angleTo(e, player); e.x += Math.cos(a) * 0.05; e.y += Math.sin(a) * 0.05; }; pistol.h = 0.35; pistol.w = 0.5; }
        },
        done: () => M.flags.pistol },
      { obj: 'SHOOT HIM.', checkpoint: false,
        start() { M.state = 'showdown'; f0 = t; player.a = angleTo(player, boss); player.canFire = true; player.ammo = 1; player.reloading = false; boss.shootable = true; boss.attackT = 0; boss.onDeath = e => { M.flags.bossDead = true; M.flags.deadT = t; sfx('boss'); shake = 20; ts = 0.2; say('JACKOFF', '...oh.', 120); }; announce(isTouch ? 'TAP TO SHOOT' : 'CLICK TO SHOOT', 'one glob. make it count.', 48); ts = 0.3; sfx('slowmo'); },
        tick() { ts = lerp(ts, M.flags.bossDead ? 0.2 : 0.35, 0.05); if (M.flags.bossDead) { const k = t - M.flags.deadT; if (k > 60) whiteOut = Math.min(1, (k - 60) / 90); } },
        done: () => M.flags.bossDead && t - M.flags.deadT > 170 },
      { obj: '', checkpoint: false,
        start() { M.state = 'cut'; f0 = t; ts = 1; player.canFire = false; player.canMove = false; for (const e of ents) if (e.kind === 'npc' && e !== prick) e.gone = true; ents = ents.filter(e => !e.gone); camH = 0.5; pitch = -30; player.x = 62; player.y = 5; player.a = -Math.PI / 2 + 0.3; whiteOut = 1; spawnDeco('heli', 64, 2.5, 1.4, 1.6, { z: 1.2, far: 40 }); M.pal = PAL.bridge; buildLevel(); },
        tick() { const f = F(); whiteOut = Math.max(0, 1 - f / 60); if (f % 10 === 0 && f < 400) sfx('chop'); if (f === 70) say('PRICK', 'We got you, son. We got you.', 200); if (f === 200) say('PRICK', 'It\'s over. She said... she said you did great.', 240); if (f > 330) whiteOut = Math.min(1, (f - 330) / 60); },
        done: () => F() > 400 },
    ],
  };
};
const MISSIONS = [M1, M2, M3, M4, M5];

