
// ================================================================
//  GAMEPLAY — player, weapon, enemies, streaks, pickups, screens
// ================================================================
const MAG = 12, DMG = 35, GLOB_SPEED = 0.3;
let state = 'title', player = null, ents = [], globs = [], eproj = [], puddles = [], stats = null, stateT = 0;
let unlockedM = 1, bestM = {}, diff = 'easy', deathQuote = ['', ''], deathTitle = 'YOU DIED', pauseFrom = null, missionIdx = 1;
try { unlockedM = clamp(+localStorage.getItem('mw_unlocked') || 1, 1, 7);
  // v5: The Bog slots in as mission 4, so anyone who'd already unlocked No Rushin' keeps everything after it
  if (!localStorage.getItem('mw_v5')) { if (unlockedM >= 4) unlockedM = Math.min(7, unlockedM + 1); const b = JSON.parse(localStorage.getItem('mw_best') || '{}') || {}; const nb = {}; for (const k in b) nb[+k >= 4 ? +k + 1 : k] = b[k]; localStorage.setItem('mw_best', JSON.stringify(nb)); localStorage.setItem('mw_unlocked', unlockedM); localStorage.setItem('mw_v5', '1'); }
  // v5.2: Scorched Girth slots in as mission 6, before GAME OVA
  if (!localStorage.getItem('mw_v6')) { if (unlockedM >= 6) unlockedM = Math.min(7, unlockedM + 1); const b = JSON.parse(localStorage.getItem('mw_best') || '{}') || {}; const nb = {}; for (const k in b) nb[+k >= 6 ? +k + 1 : k] = b[k]; localStorage.setItem('mw_best', JSON.stringify(nb)); localStorage.setItem('mw_unlocked', unlockedM); localStorage.setItem('mw_v6', '1'); } } catch (e) {}
try { bestM = JSON.parse(localStorage.getItem('mw_best') || '{}') || {}; } catch (e) {}
try { diff = localStorage.getItem('mw_diff') === 'regular' ? 'regular' : 'easy'; } catch (e) {}
const save = () => { try { localStorage.setItem('mw_unlocked', unlockedM); localStorage.setItem('mw_best', JSON.stringify(bestM)); localStorage.setItem('mw_diff', diff); } catch (e) {} };
const dmgMul = () => diff === 'regular' ? 1.35 : 1;

const ENEMY = {
  crab:   { spr: 'crab',   h: 1.0,  w: 1.25,  hp: 50,  speed: 0.036, r: 0.5,  atk: 'melee', dmg: 12, range: 1.0, cd: 55,  sight: 9 },
  bee:    { spr: 'bee',    h: 0.8,  w: 1.0, hp: 35,  speed: 0.05,  r: 0.42, atk: 'ranged', proj: 'stinger', dmg: 8, range: 6, cd: 85, sight: 10, fly: 0.55, erratic: true, keep: 2.5 },
  trap:   { spr: 'trap',   h: 0.7,  w: 1.15,  hp: 60,  speed: 0,     r: 0.5,  atk: 'lunge', dmg: 18, range: 2.4, cd: 120, sight: 3.5 },
  condom: { spr: 'condom', h: 1.35, w: 1.05, hp: 70,  speed: 0.03,  r: 0.48, atk: 'ranged', proj: 'condomshot', dmg: 0, range: 7.5, cd: 140, sight: 9, keep: 3.2 },
  chili:  { spr: 'chili',  h: 1.15, w: 0.9, hp: 55,  speed: 0.026, r: 0.42, atk: 'throw', proj: 'bottle', dmg: 0, range: 6.5, cd: 150, sight: 9, keep: 3.5 },
  ice:    { spr: 'ice',    h: 1.4,  w: 1.6,  hp: 220, speed: 0.02,  r: 0.6,  atk: 'melee', dmg: 15, range: 1.3, cd: 75,  sight: 9, aura: 3.2, boss: true },
  boss:   { spr: 'boss',   h: 2.2,  w: 1.7,  hp: 160, speed: 0.022, r: 0.65, atk: 'melee', dmg: 20, range: 1.5, cd: 80,  sight: 30, boss: true },
  target: { spr: 'target', h: 1.15, w: 0.95,  hp: 1,   speed: 0,     r: 0.5,  atk: null, sight: 0 },
};
const STREAKS = [
  { n: 3, name: 'Ultrasound', line: 'ULTRASOUND ONLINE', sub: 'enemies revealed on the minimap. it\'s a boy.' },
  { n: 5, name: 'Care Package', line: 'CARE PACKAGE INBOUND', sub: 'a crate of eggplants. eat up, champ.' },
  { n: 7, name: 'Precision Hairstrike', line: 'PRECISION HAIRSTRIKE', sub: 'danger close. one enormous pube.' },
];
const DEATHS = [
  ['You came too soon.', 'Captain Prick'], ['Never go in dry.', 'Captain Prick'], ['He died as he lived: veiny and confused.', 'Sarge'],
  ['A hard man is good to find. You were neither.', 'Sarge'], ['The enemy did not, in fact, want more.', 'Captain Prick'],
  ['Shrinkage is a natural response to fear.', 'Field Manual 6.9'], ['Tip: the tip goes first.', 'Field Manual 6.9'], ['Somewhere, a woman is very disappointed.', 'Narrator'],
];
const RANKS = [[85, 'GENERAL ERECTION', 'she wants more'], [70, 'MAJOR WOOD', 'wow, you\'re about to cum'], [55, 'COLONEL ANGUS', 'mmm, that\'s the spot'], [40, 'SERGEANT SAUSAGE', 'nice girth'], [25, 'CORPORAL PUNISHMENT', 'is it in yet?'], [0, 'PRIVATE PARTS', 'we\'ll work on it']];

function newPlayer(x, y, a) {
  return { x, y, a, hp: 100, lastHit: -999, ammo: MAG, reloading: false, reloadT: 0, fireCd: 0, recoil: 0, walkT: 0, moving: 0, bobY: 0,
    wrapT: 0, shrink: 0, ultraT: 0, streak: 0, buttT: 0, aimLock: false, speedMul: 1, invul: false, canFire: true, canMove: true,
    lookP: 0, ads: 0, sprint: 0, crouch: false, nades: 3, throwT: 0, kick: 0, stepN: 0, jz: 0, jv: 0, wrap: 0, lastWrap: 0, hintT: 0, size: 1, hardT: 0, dropT: -9999, weapon: 'rifle', rockets: 4, gl: 3, rocketCd: 0, swapT: 0 };
}
function spawnEnemy(type, x, y, o = {}) {
  const d = ENEMY[type];
  const e = Object.assign({ kind: 'enemy', type, spr: d.spr, x, y, z: d.fly || 0, h: d.h, w: d.w, hp: d.hp * (o.hpMul || 1), maxhp: d.hp, r: d.r, dead: false, hurtT: 0, attackT: 0, cd: rand(20, 60), ai: 'idle', seed: Math.floor(rand(0, 40)), wob: rand(0, TAU), stuck: 0, lunge: 0, far: d.boss ? 40 : 18 }, o);
  ents.push(e); return e;
}
function spawnWave(list) {   // [[type, x, y], ...]; Regular difficulty tops the wave up by ~40%
  const out = list.map(([ty, x, y, o]) => spawnEnemy(ty, x, y, o));
  if (diff === 'regular') for (let i = 0; i < Math.round(list.length * 0.4); i++) { const [ty, x, y] = pickOne(list); out.push(spawnEnemy(ty, x + rand(-0.8, 0.8), y + rand(-0.8, 0.8))); }
  return out;
}
function spawnPickup(type, x, y) { const e = { kind: 'pickup', type, spr: type, x, y, z: 0, h: type === 'crate' ? 0.8 : 0.6, w: type === 'crate' ? 0.8 : 0.5, seed: 0 }; ents.push(e); return e; }
function spawnDeco(spr, x, y, h, w, o = {}) { const e = Object.assign({ kind: 'deco', spr, x, y, z: 0, h, w, seed: Math.floor(rand(0, 40)) }, o); ents.push(e); return e; }
function spawnNpc(spr, x, y, h, w, o = {}) { const e = Object.assign({ kind: 'npc', spr, x, y, z: 0, h, w, seed: Math.floor(rand(0, 40)), dead: false, hurtT: 0, attackT: 0, far: 40 }, o); ents.push(e); return e; }
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const angleTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
const alive = e => (e.kind === 'enemy' || e.shootable) && !e.dead;
const aliveEnemies = () => ents.filter(e => e.kind === 'enemy' && !e.dead && e.type !== 'target');

// ---------- shooting ----------
function bestTarget(cone = 0.27 - 0.08 * (player ? player.ads : 0) + 0.08) {
  const p = player; let best = null, bd = 1e9;
  for (const e of ents) {
    if (!alive(e)) continue;
    const d = dist(p, e); if (d > (M.scope && p.ads > 0.6 ? 48 : 20)) continue;
    const da = Math.abs(wrapA(angleTo(p, e) - p.a));
    { const cy = (e.z || 0) * YS + (H3[e.type] !== undefined ? H3[e.type] : 0.6), elev = Math.atan2(cy - camH * YS, Math.max(0.3, d)); if (Math.abs(elev - pitch * PX2RAD) > 0.45 + 0.6 / Math.max(0.5, d)) continue; }   // you do have to look roughly at it
    if (da < cone + 0.25 / Math.max(1, d) && ((e.z || 0) < -1 || losShot(p.x, p.y, e.x, e.y)) && d < bd) { best = e; bd = d; }
  }
  return best;
}
function fire() {
  const p = player;
  if (M.state === 'gunship') { gunshipFire(); return; }
  if (p.weapon === 'rocket' && M.state !== 'showdown') { fireRocket(); return; }
  if ((p.swapT || 0) > 0) return;
  if (!p.canFire || p.fireCd > 0 || p.reloading) return;
  // headbutt if something is right in your face
  const near = bestTarget(0.7);
  if (near && dist(p, near) < 1.35 && M.state !== 'showdown') { headbutt(near); return; }
  if (p.ammo <= 0) { reload(); return; }
  p.ammo--; shrinkShot(); p.fireCd = 9; p.recoil = 1; p.drip = 0; p.kick -= 7 * (1 - 0.5 * p.ads); stats.shots++; ejectShell(); flashT = 3;
  const tgt = bestTarget();
  let a = p.a;
  if (tgt) { a = angleTo(p, tgt); }
  // the glob leaves the muzzle (a bit below eye level) and arcs toward the target's body, or along your aim if there's no target
  const y0 = camH * YS - 0.12, dd = tgt ? Math.max(0.5, dist(p, tgt)) : 12;
  const y1 = tgt ? (tgt.z || 0) * YS + (H3[tgt.type] !== undefined ? H3[tgt.type] : 0.6) : y0 + Math.tan(pitch * PX2RAD) * dd;
  const gsp = M.scope && p.ads > 0.6 ? 0.75 : GLOB_SPEED;   // scoped: a fast, long glob (the DICK-50 CAL)
  globs.push({ x: p.x + Math.cos(p.a) * 0.3, y: p.y + Math.sin(p.a) * 0.3, vx: Math.cos(a) * gsp, vy: Math.sin(a) * gsp, life: gsp > GLOB_SPEED ? 80 : 90, spr: 'glob', z: 0.35, y3: y0, vy3: (y1 - y0) / (dd / gsp), h: 0.35, w: 0.35, seed: 0, near: 0.7, tgt });
  sfx('shoot');
  if (p.ammo === 0 && M.state !== 'showdown') setTimeout(() => { if (state === 'game' && player === p && p.ammo === 0) reload(); }, 250);
}
// every shot costs you a little length. lotion puts it back.
const SIZE_MIN = 0.3, SIZE_STEP = 0.012;
const sizeMul = () => player ? 0.5 + 0.5 * player.size : 1;
function shrinkShot() {
  const p = player; if (M.state === 'showdown' || p.hardT > 0) return;
  const was = p.size; p.size = Math.max(SIZE_MIN, p.size - SIZE_STEP);
  if (was > 0.75 && p.size <= 0.75 && !M.flags.sizeTip) { M.flags.sizeTip = true; say(M.leadWho || 'PRICK', "It's getting smaller, son. Every shot costs you. Find lotion.", 240); }
  if (was > 0.45 && p.size <= 0.45) { announce('SHRINKAGE', pickOne(['find lotion. now.', 'it\'s cold out here, okay?', 'is it in yet?', 'damage way down']), 40); sfx('deflate'); }
}
function growBy(k, why) {
  const p = player; const was = p.size; p.size = Math.min(1, p.size + k);
  return Math.round((p.size - was) * 9 * 10) / 10;
}
// kills sometimes drop lotion; when you're tiny and there's none around, command drops a crate of it
function maybeDrop(e) {
  const p = player; const need = p.size < 0.6;
  if (Math.random() > (need ? 0.4 : 0.2)) return;
  const type = Math.random() < 0.15 ? 'pill' : 'lotion';
  if (M.state === 'rails') { applyPickup({ type }); return; }   // in the truck: it lands right in your lap
  const d = spawnPickup(type, e.x, e.y); if (!walkable(e.x, e.y)) { d.x = p.x; d.y = p.y; }
}
function lotionDrop() {
  const p = player; if (M.state !== 'play' || p.size > 0.45 || t - p.dropT < 900) return;
  if (ents.some(e => e.kind === 'pickup' && !e.got && (e.type === 'lotion' || e.type === 'pill') && dist(e, p) < 12)) return;
  p.dropT = t;
  const x = p.x + Math.cos(p.a) * 1.8, y = p.y + Math.sin(p.a) * 1.8; const ok = walkable(x, y);
  const c = spawnPickup('lotion', ok ? x : p.x, ok ? y : p.y); c.z = 3; c.fall = true; sfx('drop');
  say(M.leadWho || 'SARGE', 'LOTION DROP INBOUND. Somebody lube this man up!', 200);
}
function applyPickup(e) {
  const p = player;
  if (e.type === 'lotion') { const g = growBy(0.5); announce('LOTIONED UP', `+${g}"  ` + pickOne(['back to full mast', 'pump pump pump', 'smooth.', 'he\'s growing, sarge', 'extra grip']), 36); sfx('loot'); sfx('squish'); stats.lotion = (stats.lotion || 0) + 1; }
  if (e.type === 'pill') { growBy(1); p.hardT = 900; announce('RAGING', 'no shrinkage for 15 seconds', 40); sfx('streak'); }
}
function reload() { const p = player; if (M.state === 'gunship') { gunshipSwap(); return; } if (p.weapon === 'rocket') return; if (p.reloading || !p.canFire) return; if (p.ammo === MAG) { M.flags.reloaded = true; sfx('pump'); p.recoil = 0.3; announce('PUMP', 'already full. still counts.', 26); return; } p.reloading = true; p.reloadT = RELOAD_T; p.rsfx = 0; M.flags.reloaded = true; sfx('magout'); }
function headbutt(e) {
  const p = player; p.buttT = 22; p.fireCd = 26; p.recoil = 0.6; stats.shots++; stats.hits++;
  sfx('butt'); shake = 8;
  damageEnt(e, 60 * (p.shrink > 0 ? 0.5 : 1) * sizeMul(), true);
  if (e.kind === 'enemy' && !e.dead) { const a = angleTo(p, e); moveBody(e, Math.cos(a) * 0.6, Math.sin(a) * 0.6, e.r); }
}
let BOOMING = false;   // true while an explosion is dealing damage (armour only really cares about those)
function damageEnt(e, dmg, butt, by) {
  if (e.dead) return;
  if (e.armor && !BOOMING) { dmg *= 0.05; if (!by && t - (M.flags.armorTip || -999) > 400) { M.flags.armorTip = t; announce('ARMOURED', 'globs bounce off. use the DILDO-7 (press 2)', 28); } }
  e.hp -= dmg; e.hurtT = 8;
  if (!by) { sfx('hit'); sfx('hitmark'); hitT = 10; hitKill = false; }
  burst3d(e.x, e.y, (e.z || 0) + e.h * 0.5, 4, 'drop');
  if (e.onHit) e.onHit(e);
  if (e.hp <= 0) killEnt(e, butt, by);
}
function killEnt(e, butt, by) {
  e.dead = true; e.deadT = t; e.attackT = 0;
  if (by && e.kind === 'enemy') {   // a squadmate got him: no XP, no streak, just the kill feed
    sfx('kill'); killFeed(`${by}  ⟶  ${NAMES[e.type] || e.type}`); burst3d(e.x, e.y, (e.z || 0) + e.h * 0.5, 10, 'drop');
    if (e.type !== 'boss' && e.type !== 'target') maybeDrop(e); if (e.onDeath) e.onDeath(e); return;
  }
  if (e.type === 'target') { sfx('snap'); stats.targets = (stats.targets || 0) + 1; if (e.onDeath) e.onDeath(e); return; }
  if (e.kind === 'enemy') {
    stats.kills++; sfx('kill'); sfx('xp'); hitT = 12; hitKill = true; xpPop(e.type === 'boss' ? 500 : e.type === 'ice' ? 250 : 69); killFeed(`YOU  ⟶  ${NAMES[e.type] || e.type}`); burst3d(e.x, e.y, (e.z || 0) + e.h * 0.5, 10, 'drop');
    const p = player; p.streak++;
    const s = STREAKS.find(s => s.n === p.streak);
    if (s) { sfx('streak'); announce(s.line, s.sub, 44); streakReward(s.n); if (s.n === 7) p.streak = 0; }
    if (Math.random() < 0.3) chatter(pickOne(M.killWho || ['PRICK', 'PRICK', 'SARGE']), pickOne(KILL_LINES), 150);
    if (e.type === 'ice') announce('SHRINKAGE OVER', 'welcome back, big guy', 40);
    if (e.type !== 'boss' && e.type !== 'target' && M.state !== 'gunship') maybeDrop(e);
    if (e.type === 'boss' && e.onDeath) e.onDeath(e);
  }
  if (e.onDeath && e.kind !== 'enemy') e.onDeath(e);
}
const KILL_LINES = ['nice shot, son.', 'that one felt good, huh?', 'wow. you\'re a natural.', 'she said don\'t stop.', 'veiny AND accurate.', 'keep stroking, champ.', 'so hard right now.', 'mmm. that\'s the spot.', 'moan for me, soldier.', 'harder, daddy.'];
function streakReward(n) {
  const p = player;
  if (n === 3) { p.ultraT = 1200; sfx('ultra'); }
  if (n === 5) { const x = p.x + Math.cos(p.a) * 1.6, y = p.y + Math.sin(p.a) * 1.6; const ok = walkable(x, y); const c = spawnPickup('crate', ok ? x : p.x, ok ? y : p.y); c.z = 3; c.fall = true; sfx('drop'); }
  if (n === 7) { const x = p.x + Math.cos(p.a) * 3, y = p.y + Math.sin(p.a) * 3; const b = spawnDeco('bigpube', walkable(x, y) ? x : p.x, walkable(x, y) ? y : p.y, 2.6, 2.6, { z: 5, hair: true, far: 40 }); sfx('slowmo'); }
}

// ---------- being hurt ----------
function hurtPlayer(dmg, why, src) {
  const p = player; if (p.invul || p.hp <= 0) return;
  p.hp -= dmg * dmgMul(); p.lastHit = t; hurtFx(2); shake = Math.max(shake, 6); sfx('hurt');
  if (src) dmgDir.push({ a: angleTo(p, src), life: 40 });
  if (p.hp <= 0) { p.hp = 0; die(why); }
}
// ---------- getting wrapped: condom hits roll one further down you. All the way on = you lose. ----------
function wrapHit(k, src) {
  const p = player; if (p.invul || state !== 'game') return;
  p.wrap = Math.min(1, (p.wrap || 0) + k * (diff === 'regular' ? 1.2 : 1)); p.lastWrap = t; p.wrapT = Math.max(p.wrapT, 50);
  sfx('wrap'); shake = Math.max(shake, 5); if (src) dmgDir.push({ a: angleTo(p, src), life: 40 });
  if (p.wrap >= 1) { die('wrapped'); return; }
  announce(`WRAPPED ${Math.round(p.wrap * 100)}%`, p.wrap > 0.7 ? 'one more and you\'re done' : 'dodge it. then glob him.', 34);
  if (!M.flags.wrapTip) { M.flags.wrapTip = true; say(M.leadWho || 'PRICK', "That's a condom, son. Get fully wrapped and you're out of the fight. Keep moving.", 260); }
}
function die(why) {
  hushVoices(); state = 'dead'; stateT = 0; deathQuote = pickOne(DEATHS); sfx('die'); player.streak = 0; hurtFx(6); shake = 14;
  if (why === 'friendly') deathQuote = ['Five blue-on-blues. The team would like a word. From the ground. In pieces.', 'Captain Prick'];
  if (why === 'team') deathQuote = ['You were one mile up. They were one metre from a condom.', 'TV Operator'];
  if (why === 'spotted') deathQuote = ['They saw your pubes. Everybody saw your pubes.', 'Captain MacMillilitre'];
  if (why === 'hazard') deathQuote = ['Too much chlamydia. We said go around.', 'Captain MacMillilitre'];
  if (why === 'sunk') deathQuote = ['You went down with the ship. Very traditional. Very wet.', 'Captain Prick'];
  if (why === 'trap') deathQuote = ['SNAP. The cheese was never real.', 'Sarge'];
  if (why === 'sauce') deathQuote = ['Death by hot sauce. You went out spicy.', 'Sarge'];
  if (why === 'ice') deathQuote = ['It\'s cold, okay?! IT\'S COLD.', 'you, to no one'];
  if (why === 'c4') deathQuote = ['You were standing on the Cum-4 when it went off. Classic.', 'Lt. Vas-Deferens'];
  if (why === 'timer') deathQuote = ['The ship sank. You sank. Everything sank.', 'Captain Prick'];
  deathTitle = why === 'wrapped' ? 'WRAPPED' : 'YOU DIED';
  if (why === 'wrapped') deathQuote = pickOne([['Protected. Neutralized. Very safe.', 'Condom Trooper'], ['Ribbed for their pleasure.', 'the box'], ['You got wrapped before you got in.', 'Captain Prick'], ['No glove, no love. Lots of glove, no you.', 'Sarge']]);
}

// ---------- per-frame gameplay ----------
function updatePlayer() {
  const p = player;
  const mv = M.state === 'play' || M.state === 'crawl' || M.state === 'gunship';
  let fx = 0, fy = 0, turn = 0;
  if (mv && p.canMove) {
    if (keys.KeyW || keys.ArrowUp) fx += 1; if (keys.KeyS || keys.ArrowDown) fx -= 1;
    if (keys.KeyA) fy -= 1; if (keys.KeyD) fy += 1;
    if (joy.active) { fx += -joy.dy / 60; fy += joy.dx / 60; }
  }
  if (keys.ArrowLeft) turn -= 0.045; if (keys.ArrowRight) turn += 0.045;
  if (keys.KeyQ) turn -= 0.045; if (keys.KeyE) turn += 0.045;
  turn += look.da; look.da = 0;
  if (keys.PageUp || keys.KeyT) look.dp += 5; if (keys.PageDown || keys.KeyB) look.dp -= 5;
  if (M.state === 'cut') { turn = 0; look.dp = 0; }
  // vertical look (y-shearing, like Duke3D): the whole world slides, the gun follows
  if (M.state === 'play' || M.state === 'rails' || M.state === 'showdown') {
    p.lookP = clamp(p.lookP + look.dp, M.lookDown || -190, 170); look.dp = 0;
    p.kick = lerp(p.kick, 0, 0.12);
    pitch = p.lookP + p.kick;
  } else look.dp = 0;
  // aim down sights / sprint / crouch
  const wantAds = (adsHeld || adsToggle) && p.canFire && !p.reloading && M.state !== 'crawl';
  p.ads = lerp(p.ads, wantAds ? 1 : 0, 0.2);
  const wantSprint = (keys.ShiftLeft || keys.ShiftRight || (joy.active && -joy.dy > 54)) && !wantAds && !fireHeld && M.state === 'play' && !p.crouch && !M.noRun;
  p.sprint = lerp(p.sprint, wantSprint && p.moving > 0.3 ? 1 : 0, 0.15);
  if (M.state === 'play') camH = lerp(camH, p.crouch ? 0.33 : 0.5, 0.15);
  if (M.state !== 'cut') fovK = lerp(fovK, 0.66 - (M.scope ? 0.48 : 0.24) * p.ads + 0.05 * p.sprint, 0.25);
  p.throwT -= ts;
  p.a += turn * (M.state === 'crawl' ? 0.5 : 1);
  if (M.state === 'rails') { p.a = Math.PI + clamp(wrapA(p.a - Math.PI), -0.75, 0.75); }
  p.a = wrapA(p.a);
  const len = Math.hypot(fx, fy); if (len > 1) { fx /= len; fy /= len; }
  let sp = 0.062 * p.speedMul * (p.wrapT > 0 ? 0.35 : 1) * (M.state === 'crawl' ? 0.22 : 1) * (1 + 0.6 * p.sprint) * (1 - 0.4 * p.ads) * (p.crouch ? 0.55 : 1) * ts;
  const c = cell(p.x | 0, p.y | 0);
  if (c === ',') sp *= 0.8;
  if (c === 't' && p.jz < 0.05) sp *= 0.55;   // tyre run: slow, unless you hop through
  // jumping
  if (p.jz > 0 || p.jv > 0) { p.jz += p.jv * ts; p.jv -= 0.0055 * ts; if (p.jz <= 0) { p.jz = 0; if (p.jv < -0.03) { sfx('step'); p.kick += 6; } p.jv = 0; } }
  // walked into a hurdle or the wire? tell them what to do
  if ((fx || fy) && t - p.hintT > 150) {
    const ax = p.x + Math.cos(p.a) * 0.55, ay = p.y + Math.sin(p.a) * 0.55, ahead = cell(ax | 0, ay | 0);
    if (ahead === 'j' && p.jz < 0.1) { p.hintT = t; announce(isTouch ? 'TAP JUMP!' : 'SPACE TO JUMP!', 'up and over, big guy', 34); }
    if (ahead === 'w' && !p.crouch) { p.hintT = t; announce(isTouch ? 'TAP CROUCH!' : 'C TO CROUCH!', 'get low. lower. like a worm.', 34); }
  }
  const dx = (Math.cos(p.a) * fx - Math.sin(p.a) * fy) * sp, dy = (Math.sin(p.a) * fx + Math.cos(p.a) * fy) * sp;
  if (M.state === 'gunship') { p.x += dx * 2.6; p.y += dy * 2.6; }
  else if (len > 0.05) { moveBody(p, dx, dy, 0.25); p.walkT += ts; p.moving = lerp(p.moving, 1, 0.2); } else p.moving = lerp(p.moving, 0, 0.2);
  if (M.state === 'rails') { p.x += M.railSpeed * ts; p.moving = lerp(p.moving, 0.4, 0.1); p.walkT += ts * 0.6; }
  // conveyors
  if (c === '^') moveBody(p, 0, -0.035 * ts, 0.25); if (c === 'v') moveBody(p, 0, 0.035 * ts, 0.25);
  if (c === '<') moveBody(p, -0.035 * ts, 0, 0.25); if (c === '>') moveBody(p, 0.035 * ts, 0, 0.25);
  p.bobY = Math.sin(p.walkT * 0.22) * (4 + 4 * p.sprint) * p.moving * (1 - 0.8 * p.ads);
  if (p.moving > 0.5 && M.state === 'play') { const n = Math.floor(p.walkT / (14 - 4 * p.sprint)); if (n !== p.stepN) { p.stepN = n; sfx('step'); } }
  p.fireCd -= ts; p.recoil = Math.max(0, p.recoil - 0.06 * ts); p.buttT -= ts; p.wrapT -= ts; p.shrink -= 1; p.ultraT -= ts;
  if (p.reloading) { p.reloadT -= ts; const r = 1 - p.reloadT / RELOAD_T; if (r > 0.3 && p.rsfx < 1) { p.rsfx = 1; sfx('thud'); } if (r > 0.62 && p.rsfx < 2) { p.rsfx = 2; sfx('magin'); } if (r > 0.7 && p.rsfx < 3) { p.rsfx = 3; sfx('pump'); } if (p.reloadT <= 0) { p.reloading = false; p.ammo = MAG; sfx('click'); } }
  p.drip = Math.min(1, (p.drip || 0) + 0.004 * ts);
  if (t - p.lastHit > 180 && p.hp < 100 && p.hp > 0) p.hp = Math.min(100, p.hp + 0.45 * ts);
  if (p.wrap > 0 && t - (p.lastWrap || 0) > 90) p.wrap = Math.max(0, p.wrap - 0.006 * ts);   // it slides back off if you stop getting hit
  p.hardT -= ts; lotionDrop();
  if (fireHeld && M.state !== 'crawl') { p.sprint = 0; fire(); }
  p.aimLock = !!bestTarget();
  // pickups
  for (const e of ents) {
    if (e.kind !== 'pickup' || e.got) continue;
    if (e.fall) { e.z = Math.max(0, e.z - 0.05 * ts); if (e.z === 0) { e.fall = false; shake = 6; sfx('splat'); } continue; }
    if (dist(p, e) < 0.75) {
      e.got = true;
      if (e.type === 'lotion' || e.type === 'pill') applyPickup(e);
      if (e.type === 'eggplant') { growBy(0.15); p.hp = Math.min(100, p.hp + 35); announce('+35 HP', pickOne(['ooh... it\'s growing', 'delicious', 'that\'s a big boy now', 'getting harder already?']), 34); sfx('loot'); stats.eggs = (stats.eggs || 0) + 1; }
      if (e.type === 'crate') { growBy(1); p.rockets = Math.max(p.rockets, 4); p.gl = Math.max(p.gl, 3); p.hp = 100; p.nades = Math.max(p.nades, 3); announce('FULL HEAL', 'a whole crate of eggplants (and some nuts)', 40); sfx('loot'); }
      if (e.type === 'ticket') { announce('TICKET #69', 'now serving: 4', 40); sfx('loot'); M.flags.ticket = true; }
      if (e.type === 'pistol') { sfx('click'); M.flags.pistol = true; }
      if (e.onGet) e.onGet(e);
    }
  }
  ents = ents.filter(e => !e.got);
  // hot sauce underfoot
  for (const q of puddles) if (dist(p, q) < 0.9) { if (t % 6 === 0) { hurtPlayer(1.4, 'sauce'); } if (t % 30 === 0) sfx('sizzle'); }
}
function updateGlobs() {
  for (const g of globs) {
    const nx = g.x + g.vx * ts, ny = g.y + g.vy * ts;
    const down = g.tgt && (g.tgt.z || 0) < -1;   // a shot at the street below: it goes over the parapet and doesn't splat on the roof
    if (solid(nx, ny) && g.y3 < wallH(cell(nx | 0, ny | 0)) * YS && !(down && cell(nx | 0, ny | 0) === 'X')) { g.life = 0; sfx('splat'); wallSplat(g); continue; }
    if (g.y3 < 0 && !((down || cell(g.x | 0, g.y | 0) === '_') && g.y3 > -30)) { g.life = 0; sfx('splat'); spawnDeco('splat', g.x, g.y, 0.35, 0.35, { z: 0, fade: 500 }); continue; }
    g.x = nx; g.y = ny; g.life -= ts; g.y3 += g.vy3 * ts; g.z = g.y3 / YS;
    for (const e of ents) {
      if (!alive(e)) continue;
      if (dist(g, e) < e.r + 0.15) { g.life = 0; stats.hits++; damageEnt(e, DMG * (player.shrink > 0 ? 0.5 : 1) * sizeMul()); break; }
    }
  }
  globs = globs.filter(g => g.life > 0);
  for (const q of eproj) {
    q.x += q.vx * ts; q.y += q.vy * ts; q.life -= ts;
    if (q.arc) { q.z += q.vz * ts; q.vz -= 0.004 * ts; if (q.z <= 0) { q.life = 0; puddles.push({ x: q.x, y: q.y, life: 700, spr: 'puddle', z: 0, h: 0.28, w: 1.4, seed: 0 }); burst3d(q.x, q.y, 0.2, 8, 'saucedrop'); sfx('sizzle'); continue; } }
    if (solid(q.x, q.y)) { q.life = 0; continue; }
    if (q.atAlly && dist(q, q.atAlly) < 0.45) { q.life = 0; burst3d(q.x, q.y, 0.6, 3, q.spr === 'condomshot' ? 'drop' : 'spark', 0.04); q.atAlly.hurtT = 6; continue; }
    if (!q.arc && dist(q, player) < 0.45) { q.life = 0; if (q.spr === 'condomshot') wrapHit(0.25, q); else hurtPlayer(q.dmg, 'bee', q); }
  }
  eproj = eproj.filter(q => q.life > 0);
  for (const q of puddles) q.life -= ts;
  puddles = puddles.filter(q => q.life > 0);
}
function updateEnemies() {
  const p = player;
  const onGrass = cell(p.x | 0, p.y | 0) === ',';
  if (t % 12 === 0 || !flowF) buildFlow(p.x, p.y);
  for (const e of ents) {
    if (e.tick) e.tick(e);
    if (e.kind === 'deco' && e.hair) {   // the hairstrike coming down
      e.z -= 0.09 * ts;
      if (e.z <= 0) { e.z = 0; e.hair = false; shake = 20; flash = 0.8; sfx('boom'); burst3d(e.x, e.y, 0.3, 24, 'puff', 0.09); for (const o of ents) if (o.kind === 'enemy' && !o.dead && dist(o, e) < 9 && los(e.x, e.y, o.x, o.y)) { killEnt(o); } e.fade = 200; }
      continue;
    }
    if (e.fade !== undefined) { e.fade -= ts; if (e.fade < 60) e.alpha = clamp(e.fade / 60, 0, 1); if (e.fade <= 0) e.gone = true; continue; }
    if (e.kind !== 'enemy' || e.dead) continue;
    const d0 = ENEMY[e.type], d = e.rangeMul ? Object.assign({}, d0, { range: d0.range * e.rangeMul }) : d0;
    e.hurtT -= ts; e.attackT -= ts; e.cd -= ts; if (M.squad && e.faceA !== undefined && e.attackT <= 0) e.faceA = undefined;
    if (e.frozen) continue;
    const dd = dist(e, p);
    let sight = d.sight * (onGrass ? 0.32 : 1) * (p.crouch ? 0.7 : 1) * (e.sightMul || 1);
    const sees = dd < sight && los(e.x, e.y, p.x, p.y);
    if (e.ai === 'idle' || e.ai === 'patrol') {
      if (sees) { e.ai = 'chase'; if (e.type === 'bee') sfx('bee'); if (M.stealth && !e.spotted) { e.spotted = true; announce('SPOTTED', 'so much for the ghillie suit', 40); } }
      else if (e.ai === 'patrol' && e.path) {   // walk the beat
        const w = e.path[e.wp || 0]; const a = Math.atan2(w[1] - e.y, w[0] - e.x);
        moveBody(e, Math.cos(a) * d.speed * 0.7 * ts, Math.sin(a) * d.speed * 0.7 * ts, e.r);
        if (Math.hypot(w[0] - e.x, w[1] - e.y) < 0.3) e.wp = ((e.wp || 0) + 1) % e.path.length;
      }
      continue;
    }
    // chase / attack
    if (d.atk === 'lunge') {
      if (e.lunge > 0) { e.lunge -= ts; moveBody(e, Math.cos(e.la) * 0.14 * ts, Math.sin(e.la) * 0.14 * ts, e.r); if (dd < 0.7 && e.cd < 100) { hurtPlayer(d.dmg, 'trap', e); e.cd = d.cd; e.lunge = 0; } }
      else if (dd < d.range && e.cd <= 0 && los(e.x, e.y, p.x, p.y)) { e.lunge = 18; e.la = angleTo(e, p); e.attackT = 30; e.cd = d.cd; sfx('snap'); }
      continue;
    }
    const a = angleTo(e, p);
    let mvx = 0, mvy = 0;
    const keep = d.keep || 0;
    const clearShot = dd < d.range && losShot(e.x, e.y, p.x, p.y);
    if (dd > Math.max(d.range * 0.8, keep) || !clearShot) { const fa = dd > 1.6 ? flowDir(e) : null; const m = fa === null ? a : fa; mvx = Math.cos(m); mvy = Math.sin(m); }
    else if (keep && dd < keep - 0.5) { mvx = -Math.cos(a); mvy = -Math.sin(a); }
    if (d.erratic) { e.wob += 0.12 * ts; mvx += Math.cos(a + Math.PI / 2) * Math.sin(e.wob) * 1.2; mvy += Math.sin(a + Math.PI / 2) * Math.sin(e.wob) * 1.2; }
    if (e.stuck > 0) { e.stuck -= ts; const s = e.stuckDir; mvx = Math.cos(s); mvy = Math.sin(s); }
    if (mvx || mvy) {
      const l = Math.hypot(mvx, mvy); mvx /= l; mvy /= l;
      const sp = d.speed * (e.speedMul || 1) * ts;
      const ox = e.x, oy = e.y;
      moveBody(e, mvx * sp, mvy * sp, e.r);
      if (Math.hypot(e.x - ox, e.y - oy) < sp * 0.3 && e.stuck <= 0) { e.stuck = 30; e.stuckDir = a + (Math.random() < 0.5 ? 1.4 : -1.4); }
    }
    // keep enemies from stacking
    for (const o of ents) { if (o === e || o.kind !== 'enemy' || o.dead) continue; const od = dist(e, o); if (od < 0.7 && od > 0.001) { const ax = (e.x - o.x) / od * 0.01, ay = (e.y - o.y) / od * 0.01; moveBody(e, ax, ay, e.r); } }
    if (d.aura && dd < d.aura) p.shrink = 3;
    // attack
    if (e.cd <= 0 && d.atk === 'ranged' && M.squad && Math.random() < 0.25) {   // v5: with a squad around, they shoot at them too
      let tg = null, td = d.range * 1.3; for (const s of M.squad) { const sd = dist(e, s); if (sd < td && losShot(e.x, e.y, s.x, s.y)) { td = sd; tg = s; } }
      if (tg && td < dd) { const ta = angleTo(e, tg), v = d.proj === 'condomshot' ? 0.065 : 0.11; e.cd = d.cd; e.attackT = 22; e.faceA = Math.atan2(tg.x - e.x, tg.y - e.y); eproj.push({ x: e.x, y: e.y, vx: Math.cos(ta) * v, vy: Math.sin(ta) * v, life: Math.min(160, td / v + 4), dmg: d.dmg, spr: d.proj, z: 0.5, h: 0.25, w: 0.35, seed: 0, atAlly: tg }); if (dd < 8) sfx(d.proj === 'condomshot' ? 'fwip' : 'sting'); continue; }
    }
    if (e.cd <= 0 && dd < d.range && (d.atk === 'ranged' ? clearShot : los(e.x, e.y, p.x, p.y))) { e.faceA = undefined;
      e.cd = d.cd * (diff === 'regular' ? 0.85 : 1); e.attackT = 22;
      if (d.atk === 'melee') { e.pending = 10; }
      if (d.atk === 'wrap') { e.pending = 10; }
      if (d.atk === 'ranged') { const v = d.proj === 'condomshot' ? 0.065 : 0.11; eproj.push({ x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 160, dmg: d.dmg, spr: d.proj, z: 0.5, h: 0.25, w: 0.35, seed: 0 }); sfx(d.proj === 'condomshot' ? 'fwip' : 'sting'); }
      if (d.atk === 'throw') { const tt = Math.max(20, dd / 0.09); eproj.push({ x: e.x, y: e.y, vx: (p.x - e.x) / tt, vy: (p.y - e.y) / tt, life: 400, dmg: 0, spr: 'bottle', z: 0.6, vz: 0.002 * tt, arc: true, h: 0.4, w: 0.35, seed: 0 }); }
    }
    if (e.pending !== undefined) { e.pending -= ts; if (e.pending <= 0) { delete e.pending; if (dd < d.range + 0.3) { hurtPlayer(d.dmg, e.type, e); if (d.atk === 'wrap') { p.wrapT = 120; sfx('wrap'); announce('WRAPPED', 'that\'s not how consent works', 36); } } } }
  }
  ents = ents.filter(e => !e.gone);
  for (const e of ents) if (e.kind === 'enemy' && e.dead && t - e.deadT > 900 && e.type !== 'target' && !e.keepBody) e.gone = true;
  ents = ents.filter(e => !e.gone);
}
// ---------- the nut-nade: CoD's frag, but it's one ball ----------
let nades = [];
function jump() {
  if (M && M.dig !== undefined && state === 'game') { M.dig++; shake = Math.max(shake, 3); sfx('step'); return; }   // v5.2: mash to dig yourself out
  const p = player; if (!p || state !== 'game' || M.state !== 'play' || !p.canMove || p.jz > 0 || p.jv > 0) return;
  if (p.crouch) { p.crouch = false; return; }   // like CoD: jump stands you up first
  p.jv = 0.07; p.jz = 0.001; sfx('bounce');
}
function throwNade() {
  const p = player; if (!p || p.nades <= 0 || !p.canFire || p.throwT > 0 || !(M.state === 'play' || M.state === 'rails')) return;
  p.nades--; p.throwT = 28; sfx('pin'); chatter('YOU', pickOne(['NUT OUT!', 'NUT OUT!', 'Frag— I mean, NUT OUT!', 'Throwing a ball!']), 90);
  const up = clamp(p.lookP / 170, -0.6, 1);
  setTimeout(() => { if (!player || state !== 'game') return; nades.push({ x: p.x + Math.cos(p.a) * 0.4, y: p.y + Math.sin(p.a) * 0.4, z: 0.6, vx: Math.cos(p.a) * 0.12, vy: Math.sin(p.a) * 0.12, vz: 0.062 + up * 0.035, fuse: 100, spr: 'nut', h: 0.28, w: 0.28, seed: 0 }); }, 180);
}
function updateNades() {
  for (const n of nades) {
    const nx = n.x + n.vx * ts, ny = n.y + n.vy * ts;
    const hits = (x, y) => solid(x, y) && wallH(cell(x | 0, y | 0)) > n.z;   // low walls: a lobbed nut sails over
    if (hits(nx, n.y)) { n.vx *= -0.5; sfx('bounce'); } else n.x = nx;
    if (hits(n.x, ny)) { n.vy *= -0.5; sfx('bounce'); } else n.y = ny;
    n.z += n.vz * ts; n.vz -= 0.004 * ts;
    if (n.impact && (n.z < 0.08 || hits(nx, ny) || ents.some(e => e.kind === 'enemy' && !e.dead && dist(n, e) < e.r + 0.2))) n.fuse = 0;
    if (n.z < 0.05) { n.z = 0.05; if (n.vz < -0.01) sfx('bounce'); n.vz = Math.abs(n.vz) * 0.35; n.vx *= 0.7; n.vy *= 0.7; }
    n.fuse -= ts;
    if (n.fuse <= 0) {
      n.dead = true; sfx('nade'); shake = Math.max(shake, isTouch ? 6 : 12); flash = Math.max(flash, 0.12);
      burst3d(n.x, n.y, 0.3, 26, 'puff', 0.1); burst3d(n.x, n.y, 0.3, 14, 'drop', 0.12); burst3d(n.x, n.y, 0.2, 10, 'spark', 0.14);
      for (const e of ents) { if (!alive(e)) continue; const d = dist(n, e); if (d < 3.4 && los(n.x, n.y, e.x, e.y)) damageEnt(e, 140 * (1 - d / 3.6)); }
      spawnDeco('splat', n.x, n.y, 0.6, 1.2, { z: 0, fade: 500, far: 14 });
      spawnDeco('blast', n.x, n.y, 2.6, 2.6, { z: -0.3, fade: 22, far: 30 });
    }
  }
  nades = nades.filter(n => !n.dead);
}
// ---------- XP popups ("+69") ----------
let xps = [], flashT = 0, shells = [];
function ejectShell() { }   // (the old ejected-shell particle spawned right in front of the camera and flashed half the screen)
function updateShells() {}
function xpPop(v) { xps.push({ v, life: 70 }); }
// ---------- 3D particles, wall splats, props ----------
let parts3 = [];
function burst3d(x, y, z, n, spr, sp = 0.05) { for (let i = 0; i < n; i++) { const a = rand(0, TAU), v = rand(0.2, 1) * sp; parts3.push({ x, y, z, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vz: rand(0.02, 0.07), life: rand(20, 45), spr, h: spr === 'puff' ? 0.5 : 0.18, w: spr === 'puff' ? 0.5 : 0.18, seed: 0 }); } }
function updateParts3() {
  for (const q of parts3) { q.x += q.vx * ts; q.y += q.vy * ts; q.z += q.vz * ts; q.vz -= 0.004 * ts; if (q.z < 0) { q.z = 0; q.vz = 0; q.vx *= 0.5; q.vy *= 0.5; } q.life -= ts; q.alpha = Math.min(1, q.life / 12); }
  parts3 = parts3.filter(q => q.life > 0);
  for (const d of dmgDir) d.life--; dmgDir = dmgDir.filter(d => d.life > 0);
  for (const f of feed) f.life--; feed = feed.filter(f => f.life > 0);
  if (hitT > 0) hitT--;
}
function wallSplat(g) {   // a glob stuck to the wall: a billboard just in front of the surface
  const bx = g.x - g.vx * 0.9, by = g.y - g.vy * 0.9;
  spawnDeco('splat', bx, by, 0.5, 0.5, { z: Math.max(0, g.z - 0.2), fade: 700, far: 12 });
  burst3d(bx, by, g.z, 3, 'drop', 0.03);
  if (ents.filter(e => e.spr === 'splat').length > 40) { const old = ents.find(e => e.spr === 'splat'); if (old) old.gone = true; }
}
function spawnProp(type, x, y, o = {}) {
  const spr = o.spr || type;
  const isSolid = MD.PROP_SOLID[type] || type === 'sign';
  const e = spawnDeco(spr, x, y, o.h || 1, o.w || 1, Object.assign({ far: 22, faceA: o.faceA }, o, { spr }));
  if (isSolid && !o.passable) {
    const ci = (y | 0) * MW + (x | 0), before = reachCount();
    blocked[ci] = 1;
    if (reachCount() < before - 1) { blocked[ci] = 0; e.gone = true; ents = ents.filter(q => !q.gone); return null; }   // never wall off a route
  }
  return e;
}
// how many floor cells can be reached from the mission start (used to keep props from sealing corridors)
function reachCount() {
  const seen = new Uint8Array(MW * MH), q = [[M.start[0] | 0, M.start[1] | 0]]; seen[q[0][1] * MW + q[0][0]] = 1; let n = 0;
  while (q.length) { const [x, y] = q.pop(); n++; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue; const i = ny * MW + nx; if (!seen[i] && walkable(nx + 0.5, ny + 0.5)) { seen[i] = 1; q.push([nx, ny]); } } }
  return n;
}
// scatter props into rooms: floor cells beside a wall with open space around, away from the important spots
function scatterProps(types, n, avoid = [], seed = 1) {
  let placed = 0, tries = 0, s = seed;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  while (placed < n && tries++ < 600) {
    const x = 1 + (rnd() * (MW - 2)) | 0, y = 1 + (rnd() * (MH - 2)) | 0;
    if (map[y][x] !== '.' || blocked[y * MW + x]) continue;
    let walls = 0, open = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const c = cell(x + dx, y + dy); if (WALLS.includes(c)) walls++; else if (c === '.' && !blocked[(y + dy) * MW + x + dx]) open++; }
    if (walls < 1 || walls > 3 || open < 4) continue;
    if (avoid.some(a => Math.hypot(a[0] - x - 0.5, a[1] - y - 0.5) < (a[2] || 2.5))) continue;
    spawnProp(types[(rnd() * types.length) | 0], x + 0.5, y + 0.5); placed++;
  }
}

// ---------- mission flow ----------
function startMission(i, stageIdx = 0) {
  missionIdx = i;
  M = MISSIONS[i - 1]();
  c3.style.filter = ''; gsShells = []; hushVoices();
  M.idx = i; M.state = 'play'; M.stage = -1; M.flags = {}; M.timer = null; M.checkpoint = 0;
  loadMap(M.map);
  ents = []; globs = []; eproj = []; rockets = []; aglobs = []; puddles = []; jam = []; radio = null; radioQ = []; announceQ = []; objText = ''; hintT = 0; flash = 0; shake = 0; whiteOut = 0;
  camH = 0.5; pitch = 0; roll = 0; ts = 1; joy.active = false; fireHeld = false; look.da = 0; look.dp = 0; parts3 = []; shells = []; feed = []; dmgDir = []; hitT = 0; nades = []; xps = []; adsHeld = false; adsToggle = false; fovK = 0.66;
  player = newPlayer(M.start[0], M.start[1], M.start[2]); player.drip = 0;
  stats = { kills: 0, shots: 0, hits: 0, frames: 0, targets: 0, eggs: 0 };
  // static things written into the map
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const ch = map[y][x];
    if (ch === 'e') { spawnPickup('eggplant', x + 0.5, y + 0.5); map[y][x] = '.'; }
    if (ch === ',') { const n = MW * MH > 2000 ? 1 : 1 + ((x * 7 + y * 13) % 2); for (let k = 0; k < n; k++) spawnDeco('pube', x + 0.2 + ((x * 31 + k * 17 + y * 3) % 60) / 100, y + 0.2 + ((y * 29 + k * 23 + x * 5) % 60) / 100, 0.75, 0.75, { seed: (x + y + k) % 3, far: 10 }); }
    if (ch === 'h') { spawnDeco('chair', x + 0.5, y + 0.5, 0.7, 0.7); map[y][x] = '.'; }
    if (ch === 'q') { spawnDeco('plant', x + 0.5, y + 0.5, 0.9, 0.7); map[y][x] = '.'; }
  }
  buildMini();
  disposeTree(dyn); dyn.clear(); for (const k in pools) { pools[k].free.length = 0; pools[k].used.length = 0; }
  buildLevel();
  if (M.props) for (const [ty, x, y, o] of M.props) spawnProp(ty, x, y, o || {});
  if (M.scatter) for (const [types, n, avoid, seed] of M.scatter) scatterProps(types, n, avoid, seed);
  M.silentInit = stageIdx > 0; if (M.init) M.init();
  state = 'game'; stateT = 0;
  goStage(stageIdx); M.silentInit = false;   // on a checkpoint retry, skip the chatter you've already heard
}
function goStage(i) {
  M.stage = i; M.stageT = 0; M.stallDone = false; if (M.goal && M.goal.auto) M.goal = null;
  const s = M.stages[i];
  if (!s) { missionClear(); return; }
  if (s.checkpoint !== false) M.checkpoint = i;
  if (s.at) { player.x = s.at[0]; player.y = s.at[1]; if (s.at[2] !== undefined) player.a = s.at[2]; }
  if (s.pre) s.pre();
  if (s.obj !== undefined) setObjective(s.obj);
  if (s.start) s.start();
}
function retry() { startMission(missionIdx, M.checkpoint); }
function missionClear() {
  state = 'clear'; stateT = 0; sfx('win'); joy.active = false; fireHeld = false;
  const time = stats.frames / 60, acc = stats.shots ? stats.hits / stats.shots : 1;
  const pts = acc * 60 + clamp((M.par - time) / M.par, 0, 1) * 40;
  const rk = RANKS.find(r => pts >= r[0]);
  stats.rank = rk[1]; stats.rankLine = rk[2]; stats.time = time; stats.acc = acc;
  const b = bestM[M.idx];
  if (!b || pts > b.pts) bestM[M.idx] = { pts, rank: rk[1], kills: stats.kills, acc, time };
  if (M.idx < MISSIONS.length) unlockedM = Math.max(unlockedM, M.idx + 1);
  save();
}
function updateGame() {
  stats.frames++; hintT++; objT++;
  if (M.clockOn) M.clock += ts;
  M.stageT = (M.stageT || 0) + 1; stallTick();
  if (M.timer !== null && M.timer !== undefined) { M.timer -= ts; if (M.timer <= 0) { M.timer = 0; if (M.onTimeout) M.onTimeout(); } }
  updatePlayer();
  if (state !== 'game') return;
  updateGlobs();
  if (M.state === 'gunship') gunshipTick();
  if (M.state === 'qte') qteTick();
  hazardTick(); if (M.always) M.always(); squadTick();
  updateEnemies();
  updateParts3(); updateShells(); updateNades(); updateRockets(); for (const x of xps) x.life--; xps = xps.filter(x => x.life > 0); if (flashT > 0) flashT--;
  if (state !== 'game') return;
  const s = M.stages[M.stage];
  if (s) { if (s.tick) s.tick(); if (s.done && s.done()) { if (s.end) s.end(); goStage(M.stage + 1); } }
  if (M.triggers) for (const tr of M.triggers) { if (tr.fired) continue; if (dist(player, tr) < (tr.r || 1)) { tr.fired = true; tr.fn(); } }
  for (const a of announceQ) a.life -= 1; announceQ = announceQ.filter(a => a.life > 0);
  for (const j of jam) j.life--; jam = jam.filter(j => j.life > 0);
  radioTick();
  if (flash > 0) flash -= 0.04;
  shake *= 0.88;
}

// ---------- input ----------
const keys = {}; const joy = { active: false, id: null, x0: 0, y0: 0, dx: 0, dy: 0 }; const look = { id: null, lx: 0, ly: 0, sx: 0, sy: 0, t0: 0, moved: false, da: 0, dp: 0 };
let adsHeld = false, adsToggle = false;
let fireHeld = false, buttons = [], locked = false;
function toCanvas(e) {
  const r = cv.getBoundingClientRect();
  if (portrait) return [(e.clientY - r.top) / r.height * W, (1 - (e.clientX - r.left) / r.width) * H];
  return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H];
}
addEventListener('keydown', e => {
  audio();
  if (e.code === 'KeyM') { setMuted(!AUD.muted); if (AUD.muted) hushVoices(); }
  if (e.code === 'KeyO') toggleVoices();
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  keys[e.code] = true;
  if (e.repeat) return;
  if (state === 'game') {
    if (e.code === 'Space') jump();
    if (e.code === 'KeyR') reload();
    if (e.code === 'KeyG') throwNade();
    if (e.code === 'Digit1') setWeapon('rifle'); if (e.code === 'Digit2') setWeapon('rocket'); if (e.code === 'KeyQ' && !keys.ShiftLeft) {}
    if (e.code === 'KeyN') toggleNVG();
    if (e.code === 'KeyX') { if (M.state === 'qte') qteHit(); else fireGL(); }
    if (e.code === 'KeyC' || e.code === 'ControlLeft') { player.crouch = !player.crouch; sfx('ads'); }
    if (e.code === 'KeyZ') { adsToggle = !adsToggle; sfx('ads'); }
    if (e.code === 'KeyF' && M.flags.pressF && !M.flags.paid && t - M.flags.pressF < 300) { M.flags.paid = true; sfx('slowmo'); say('YOU', 'F.', 120); return; }
    if (e.code === 'KeyV' || e.code === 'KeyF') { const n = bestTarget(0.7); if (n && dist(player, n) < 1.35) headbutt(n); else { player.buttT = 22; player.recoil = 0.5; sfx('butt'); } }
    if (e.code === 'Escape' || e.code === 'KeyP') { pause(); }
    if (e.code === 'Enter' && M.stages[M.stage] && M.stages[M.stage].skip) M.stages[M.stage].skip();
  } else if (state === 'pause') { if (e.code === 'Escape' || e.code === 'KeyP' || e.code === 'Space') unpause(); }
  else if (e.code === 'Space' || e.code === 'Enter') advance();
  else if (state === 'title' && e.code === 'KeyN') newGame();
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('wheel', e => { if (state === 'game' && player && Math.abs(e.deltaY) > 20) setWeapon(player.weapon === 'rifle' ? 'rocket' : 'rifle'); }, { passive: true });
cv.addEventListener('pointerdown', e => {
  e.preventDefault(); audio();
  const [x, y] = toCanvas(e);
  if (state !== 'game') {
    if (e.pointerType === 'mouse' && locked) { try { document.exitPointerLock(); } catch (er) {} if (!buttons.length) advance(); return; }
    for (const b of buttons) if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) { sfx('select'); b.fn(); return; }
    if (!buttons.length) advance();
    return;
  }
  // in game
  if (e.pointerType === 'mouse') {
    if (!locked && !isTouch) { try { cv.requestPointerLock(); } catch (er) {} }
    if (e.button === 2) { adsHeld = true; sfx('ads'); return; }
    fireHeld = true; fire(); return;
  }
  if (x > W / 2 - 40 && x < W / 2 + 40 && y > 34 && y < 74) { pause(); return; }
  if (M.flags.pressF && !M.flags.paid && t - M.flags.pressF < 300) { M.flags.paid = true; sfx('slowmo'); say('YOU', 'F.', 120); return; }
  if (M.state === 'qte') { qteHit(); return; }
  for (const b of TOUCH_BTNS) if ((!b.show || b.show()) && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) { b.fn(); return; }
  if (x < W / 2) { if (!joy.active) { joy.active = true; joy.id = e.pointerId; joy.x0 = x; joy.y0 = y; joy.dx = 0; joy.dy = 0; } }
  else if (look.id === null) { look.id = e.pointerId; look.lx = look.sx = x; look.ly = look.sy = y; look.t0 = performance.now(); look.moved = false; }
});
addEventListener('pointermove', e => {
  if (state !== 'game') return;
  if (e.pointerType === 'mouse') { if (locked) { const k = 1 - 0.45 * (player ? player.ads : 0); look.da += e.movementX * 0.0022 * k; look.dp -= e.movementY * 0.9 * k; } return; }
  const [x, y] = toCanvas(e);
  if (joy.active && e.pointerId === joy.id) { let dx = x - joy.x0, dy = y - joy.y0; const l = Math.hypot(dx, dy); if (l > 60) { dx *= 60 / l; dy *= 60 / l; } joy.dx = dx; joy.dy = dy; }
  else if (e.pointerId === look.id) { const k = 1 - 0.45 * (player ? player.ads : 0); look.da += (x - look.lx) * 0.0055 * k; look.dp -= (y - look.ly) * 1.4 * k; look.lx = x; look.ly = y; if (Math.hypot(x - look.sx, y - look.sy) > 14) look.moved = true; }
});
const release = e => {
  if (joy.active && e.pointerId === joy.id) { joy.active = false; joy.dx = joy.dy = 0; }
  if (e.pointerId === look.id) {
    look.id = null; fireHeld = false;
    if (!look.moved && performance.now() - look.t0 < 350 && state === 'game') fire();
  }
  if (e.pointerType === 'mouse') { if (e.button === 2) adsHeld = false; else fireHeld = false; }
};
cv.addEventListener('contextmenu', e => e.preventDefault());
// on-screen buttons for phones (bottom right, above the look area)
const TOUCH_BTNS = [
  { x: W - 150, y: H - 254, w: 130, h: 50, label: 'JUMP', fn: () => jump() },
  { x: W - 150, y: H - 130, w: 130, h: 50, label: 'RELOAD', fn: () => reload() },
  { x: W - 150, y: H - 192, w: 130, h: 50, label: 'AIM', fn: () => { adsToggle = !adsToggle; sfx('ads'); }, on: () => adsToggle },
  { x: W - 290, y: H - 130, w: 126, h: 50, label: 'NUT', fn: () => throwNade(), count: () => player.nades },
  { x: W - 290, y: H - 192, w: 126, h: 50, label: 'CROUCH', fn: () => { player.crouch = !player.crouch; sfx('ads'); }, on: () => player.crouch },
  { x: W - 290, y: H - 254, w: 126, h: 50, label: 'SWAP', fn: () => setWeapon(player.weapon === 'rifle' ? 'rocket' : 'rifle') },
  { x: W - 430, y: H - 130, w: 126, h: 50, label: 'GL', fn: () => fireGL(), count: () => player.gl },
  { x: W - 430, y: H - 192, w: 126, h: 50, label: 'NVG', fn: () => toggleNVG(), on: () => M.nvg, show: () => M.nvgOK },
];
addEventListener('pointerup', release); addEventListener('pointercancel', release);
document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === cv; });
// long-press on the look side = hold to fire
setInterval(() => { if (look.id !== null && !look.moved && performance.now() - look.t0 > 350 && state === 'game') fireHeld = true; }, 60);

function pause() { hushVoices(); if (state !== 'game') return; pauseFrom = state; state = 'pause'; joy.active = false; fireHeld = false; }
function unpause() { state = 'game'; look.da = 0; }
function newGame() { startBrief(1); }
function startBrief(i) { missionIdx = i; state = 'brief'; stateT = 0; briefLines = MISSIONS[i - 1]().brief; briefN = 0; }
let briefLines = [], briefN = 0;
function advance() {   // tap / space on a non-game screen
  if (state === 'title') { if (unlockedM > 1) startBrief(unlockedM); else newGame(); }
  else if (state === 'brief') { const total = briefLines.join('').length; if (briefN < total) briefN = total; else startMission(missionIdx); }
  else if (state === 'dead') { if (stateT > 60) retry(); }
  else if (state === 'clear') { if (stateT > 60) { if (missionIdx === MISSIONS.length) { state = 'credits'; stateT = 0; creditsBar = -1; } else startBrief(missionIdx + 1); } }
  else if (state === 'credits') { if (stateT > 1800) { state = 'title'; stateT = 0; } }
  else if (state === 'select') { state = 'title'; }
}
