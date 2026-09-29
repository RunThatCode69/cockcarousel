
// ================================================================
//  v4 SET-PIECE MACHINERY: the Sonogram-130 gunship, hazard zones, the carousel, killhouse civvies
// ================================================================

// ---------- hazard zones (chlamydia clouds, fire): hurt while inside, geiger-style ticking as you get close ----------
function hazardTick() {
  if (!M.hazards || M.state !== 'play') return;
  const p = player; let nearest = 99;
  for (const z of M.hazards) {
    const d = dist(p, z) - z.r; nearest = Math.min(nearest, d);
    if (d < 0 && !p.invul) { p.hp -= 0.2 * ts; p.lastHit = t; if (t % 20 === 0) { hurtFx(1); sfx('hurt'); } if (p.hp <= 0) { die(z.why || 'hazard'); return; } }
  }
  if (nearest < 3.5) { const every = Math.max(4, Math.round(4 + nearest * 9)); if (t % every === 0) sfx('tick'); }
  if (nearest < 1.5 && t - (M.flags.hzWarn || -999) > 400) { M.flags.hzWarn = t; announce(M.hazardName || 'HAZARD', 'turn back', 30); }
}

// ---------- the Sonogram-130: you fly a gunship over the car park and cover the team ----------
// aim point = player.x/y (WASD / stick slides it), mouse turns the orbit. Click fires the selected gun.
const GS_GUNS = [
  { name: '25mm SPERM', cd: 7, r: 1.2, dmg: 55, delay: 16, snd: 'shoot' },
  { name: '105mm NUTS', cd: 150, r: 3.2, dmg: 320, delay: 34, snd: 'nade' },
];
let gsShells = [];
function gunshipStart(o) {
  M.state = 'gunship'; M.gs = Object.assign({ gun: 0, cd: 0, teamHp: 100, ff: 0, lines: 0 }, o);
  player.canFire = true; player.canMove = true; player.ammo = MAG; player.reloading = false; player.crouch = false;
  gsShells = []; c3.style.filter = 'grayscale(1) contrast(1.45) brightness(1.08)';
  if (scene.fog) { M.gs.fogWas = [scene.fog.near, scene.fog.far]; scene.fog.near = 60; scene.fog.far = 140; }
}
function gunshipEnd() {
  M.state = 'play'; c3.style.filter = ''; gsShells = [];
  if (scene.fog && M.gs && M.gs.fogWas) { scene.fog.near = M.gs.fogWas[0]; scene.fog.far = M.gs.fogWas[1]; }
}
function gunshipSwap() { const g = M.gs; g.gun = 1 - g.gun; sfx('ads'); announce(GS_GUNS[g.gun].name, g.gun ? 'big one. slow reload.' : 'rapid fire', 24); }
function gunshipFire() {
  const g = M.gs, gun = GS_GUNS[g.gun]; if (g.cd > 0) return;
  g.cd = gun.cd; flashT = 3; stats.shots++; sfx(gun.snd); shake = Math.max(shake, g.gun ? 8 : 2);
  const sp = g.gun ? 0.15 : 0.45;
  gsShells.push({ x: player.x + rand(-sp, sp), y: player.y + rand(-sp, sp), t: gun.delay, gun });
}
function gunshipTick() {
  const g = M.gs, p = player; if (!g) return;
  g.cd -= ts; if (g.ffCool > 0) g.ffCool -= ts; else g.ffCool = 0;
  if (fireHeld && g.gun === 0) gunshipFire();
  for (const s of gsShells) {
    s.t -= ts; if (s.t > 0) continue; s.done = true;
    burst3d(s.x, s.y, 0.2, s.gun.r > 2 ? 30 : 8, 'puff', s.gun.r > 2 ? 0.14 : 0.06);
    spawnDeco('blast', s.x, s.y, s.gun.r * 1.4, s.gun.r * 1.4, { z: -0.3, fade: 22, far: 60 });
    if (s.gun.r > 2) { sfx('boom'); shake = 16; }
    let kills = 0;
    for (const e of ents) {
      if (e.kind === 'enemy' && !e.dead) { const d = dist(s, e); if (d < s.gun.r) { const was = e.dead; damageEnt(e, s.gun.dmg * (1 - 0.5 * d / s.gun.r)); if (!was && e.dead) kills++; } }
      if (e.kind === 'npc' && e.friendly && !g.ffCool && dist(s, e) < (s.gun.r > 2 ? s.gun.r * 0.7 : 0.6)) { g.ff++; g.ffCool = 90; chatter('PRICK', pickOne(['CHECK FIRE! CHECK FIRE!', 'THAT WAS US! THAT WAS US!', 'Friendly! We are FRIENDLY!']), 160); shake = 20; if (g.ff >= 5) { die('friendly'); return; } }
    }
    if (kills) { stats.hits++; if (t - g.lines > 90) { g.lines = t; chatter('TV OP', kills > 2 ? pickOne(['Ka-BOOM.', 'Oh, that\'s a big splash.', 'Hot damn. Look at \'em scatter.']) : pickOne(['Good kill. Good kill.', 'Target down. Nice and wet.', 'Splash one.', 'Smoke \'em.']), 110); } }
  }
  gsShells = gsShells.filter(s => !s.done);
  // the enemies go for the team, not for you (you're a mile up)
  const team = ents.filter(e => e.kind === 'npc' && e.friendly && !e.dead);
  for (const e of ents) {
    if (e.kind !== 'enemy' || e.dead) continue; e.frozen = true;
    let tgt = null, td = 1e9; for (const m of team) { const d = dist(e, m); if (d < td) { td = d; tgt = m; } }
    if (!tgt) continue;
    const d = ENEMY[e.type], a = angleTo(e, tgt);
    if (td > 0.9) { moveBody(e, Math.cos(a) * d.speed * 1.3 * ts, Math.sin(a) * d.speed * 1.3 * ts, e.r); e.walk = (e.walk || 0) + ts; }
    else { e.attackT = 10; g.teamHp -= 0.022 * ts; if (t % 45 === 0) chatter(pickOne(['SOUP', 'GAS']), pickOne(['They\'re on us!', 'Contact, close!', 'Get it OFF me!']), 90); }
  }
  if (g.teamHp <= 0) { g.teamHp = 0; die('team'); }
  // aim point can go anywhere in the map; the camera orbits it
  p.x = clamp(p.x, 1, MW - 1); p.y = clamp(p.y, 1, MH - 1);
}
// camera: high and slanted, looking down at the aim point
function gunshipCamera() {
  const p = player, D = 13, Hh = 24;
  camera.position.set(p.x - Math.cos(p.a) * D, Hh, p.y - Math.sin(p.a) * D);
  camera.lookAt(p.x, 0, p.y);
  camera.fov = 38; camera.updateProjectionMatrix();
}
function drawGunshipHUD() {
  const g = M.gs, gun = GS_GUNS[g.gun], ctx = hctx;
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let y = (t * 2) % 6; y < H; y += 6) ctx.fillRect(0, y, W, 1);   // scanlines
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
  const cx = W / 2, cy = H / 2, s = g.gun ? 44 : 26;
  ctx.strokeRect(cx - s, cy - s, s * 2, s * 2);
  ctx.beginPath(); ctx.moveTo(cx - s - 30, cy); ctx.lineTo(cx - s, cy); ctx.moveTo(cx + s, cy); ctx.lineTo(cx + s + 30, cy); ctx.moveTo(cx, cy - s - 30); ctx.lineTo(cx, cy - s); ctx.moveTo(cx, cy + s); ctx.lineTo(cx, cy + s + 30); ctx.stroke();
  // corner brackets
  for (const [x, y, dx, dy] of [[40, 40, 1, 1], [W - 40, 40, -1, 1], [40, H - 40, 1, -1], [W - 40, H - 40, -1, -1]]) { ctx.beginPath(); ctx.moveTo(x, y + dy * 40); ctx.lineTo(x, y); ctx.lineTo(x + dx * 40, y); ctx.stroke(); }
  txt('SONOGRAM-130 · THERMAL', W / 2, H - 28, 18, '#fff', 'center', null);
  txt(`${gun.name}`, W - 60, 70, 22, '#fff', 'right', null);
  txt(g.cd > 0 && g.gun ? `RELOADING ${Math.ceil(g.cd / 60)}` : 'READY', W - 60, 96, 16, g.cd > 0 && g.gun ? '#bbb' : '#fff', 'right', null);
  txt(isTouch ? 'RELOAD = switch gun' : 'R = switch gun · WASD = slew · mouse = orbit', W - 60, 120, 13, '#ddd', 'right', null);
  txt('TEAM', 60, H - 86, 16, '#fff', 'left', null);
  rr(60, H - 76, 200, 16, 8); fs('rgba(0,0,0,0.5)', '#fff', 2); rr(62, H - 74, 196 * g.teamHp / 100, 12, 6); fs(g.teamHp < 35 ? '#fff' : '#ddd', null);
  txt(`FRIENDLY FIRE ${g.ff}/5`, 60, H - 40, 14, g.ff ? '#fff' : '#aaa', 'left', null);
  // IR strobes on the team: blinking squares so you don't glob your own guys
  if (t % 30 < 15) for (const e of ents) if (e.kind === 'npc' && e.friendly && !e.dead) {
    const v = _cv.set(e.x, 1.2, e.y).project(camera); if (v.z > 1) continue;
    const sx = (v.x * 0.5 + 0.5) * W, sy = (-v.y * 0.5 + 0.5) * H; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(sx - 7, sy - 7, 14, 14);
  }
}

// ---------- anti-stuck: if a kill-everything stage drags on, show where the last ones are and clean up any you can't reach ----------
function stallTick() {
  const st = M.stages && M.stages[M.stage]; if (!st || !st.clearAll || M.state !== 'play') return;
  if (M.stageT % 30) return;
  const left = (st.clearList ? st.clearList() : aliveEnemies()).filter(e => !e.dead);
  if (!left.length) return;
  if (M.stageT > 60 * 25 && left.length <= 4) {
    for (const e of left) e.reveal = true;
    if (!M.goal || M.goal.auto) { let best = null, bd = 1e9; for (const e of left) { const d = dist(e, player); if (d < bd) { bd = d; best = e; } } M.goal = { x: best.x, y: best.y, auto: true }; }
    if (!M.stallDone) { M.stallDone = true; say('PRICK', left.length === 1 ? 'One left. He\'s red on your minimap.' : `${left.length} left. They're red on your minimap.`, 200); }
  }
  // anything nobody can walk to (stuck in a wall, fell off the map) just gets removed after a bit
  if (M.stageT > 60 * 40) for (const e of left) { const c = flowF ? flowF[(e.y | 0) * MW + (e.x | 0)] : 0; if ((c === -1 && !e.z) || (M.stageT > 60 * 90 && left.length <= 4)) { killEnt(e); if (!M.flags.stallKill) { M.flags.stallKill = true; say('PRICK', 'Got the last one from over here. Move on, son.', 180); } } }
}

// ---------- extra hardware: the DILDO-7 rocket launcher (press 2 / SWAP) and the CUM-203 underbarrel launcher (press X / GL) ----------
let rockets = [];
function setWeapon(w) {
  const p = player; if (!p || p.weapon === w || M.state !== 'play' && M.state !== 'rails') return;
  p.weapon = w; p.swapT = 24; p.reloading = false; sfx('magout');
  announce(w === 'rocket' ? 'DILDO-7' : 'DICK-47', w === 'rocket' ? `rocket launcher · ${p.rockets} left` : 'back to the rifle', 24);
}
function explodeAt(x, y, r, dmg) {
  sfx('boom'); shake = Math.max(shake, isTouch ? 8 : 16); flash = Math.max(flash, 0.1);
  burst3d(x, y, 0.4, 30, 'puff', 0.13); burst3d(x, y, 0.3, 16, 'drop', 0.14); burst3d(x, y, 0.3, 12, 'spark', 0.16);
  for (const e of ents) { if (!alive(e)) continue; const d = dist({ x, y }, e); if (d < r && los(x, y, e.x, e.y)) damageEnt(e, dmg * (1 - 0.6 * d / r)); }
  spawnDeco('splat', x, y, 0.8, 1.6, { z: 0, fade: 600, far: 16 }); spawnDeco('blast', x, y, r, r, { z: -0.3, fade: 24, far: 40 });
}
function fireRocket() {
  const p = player; if (p.swapT > 0 || p.rocketCd > 0 || !p.canFire) return;
  if (p.rockets <= 0) { if (!M.flags.noRkt || t - M.flags.noRkt > 120) { M.flags.noRkt = t; announce('OUT OF DILDOS', 'care packages have more', 26); sfx('click'); } return; }
  p.rockets--; p.rocketCd = 75; p.recoil = 1; p.kick -= 16; stats.shots++; sfx('fwip'); sfx('thud'); shake = Math.max(shake, 5);
  const tgt = bestTarget(0.12); const a = tgt ? angleTo(p, tgt) : p.a;
  const y0 = camH * YS - 0.1, dd = tgt ? Math.max(0.5, dist(p, tgt)) : 14, y1 = tgt ? (tgt.z || 0) * YS + 0.6 : y0 + Math.tan(pitch * PX2RAD) * dd;
  rockets.push({ x: p.x + Math.cos(a) * 0.5, y: p.y + Math.sin(a) * 0.5, vx: Math.cos(a) * 0.26, vy: Math.sin(a) * 0.26, y3: y0, vy3: (y1 - y0) / (dd / 0.26), life: 160, a });
  if (p.rockets === 0) setTimeout(() => { if (player === p && p.weapon === 'rocket') setWeapon('rifle'); }, 600);
}
function fireGL() {
  const p = player; if (!p || !p.canFire || p.weapon !== 'rifle' || p.throwT > 0 || !(M.state === 'play' || M.state === 'rails')) return;
  if (p.gl <= 0) { announce('CUM-203 EMPTY', 'care packages refill it', 24); sfx('click'); return; }
  p.gl--; p.throwT = 30; p.recoil = 0.8; p.kick -= 10; sfx('pump'); sfx('fwip');
  const up = clamp(p.lookP / 170, -0.6, 1);
  nades.push({ x: p.x + Math.cos(p.a) * 0.5, y: p.y + Math.sin(p.a) * 0.5, z: 0.6, vx: Math.cos(p.a) * 0.2, vy: Math.sin(p.a) * 0.2, vz: 0.03 + up * 0.05, fuse: 400, impact: true, spr: 'glob', h: 0.3, w: 0.3, seed: 0 });
}
function updateRockets() {
  const p = player; if (p) { p.rocketCd -= ts; p.swapT -= ts; }
  for (const r of rockets) {
    r.x += r.vx * ts; r.y += r.vy * ts; r.y3 += r.vy3 * ts; r.life -= ts;
    if (t % 2 === 0) burst3d(r.x - r.vx * 2, r.y - r.vy * 2, r.y3 / YS, 1, 'puff', 0.01);
    let boom = r.life <= 0 || r.y3 < 0.05 || (solid(r.x, r.y) && r.y3 < wallH(cell(r.x | 0, r.y | 0)) * YS);
    for (const e of ents) if (alive(e) && dist(r, e) < (e.r || 0.5) + 0.25) boom = true;
    if (boom) { r.dead = true; explodeAt(r.x - r.vx, r.y - r.vy, 3.0, 230); }
  }
  rockets = rockets.filter(r => !r.dead);
}

// ---------- voices: the radio lines are read out by the browser's built-in speech synth, one voice per character ----------
const VOICE = { on: (() => { try { return localStorage.getItem('mw_voices') !== '0'; } catch (e) { return true; } })(), primed: false };
const VP = { PRICK: { p: 0.72, r: 0.95, gb: 1 }, MACMILLI: { p: 0.62, r: 0.86, gb: 1 }, SARGE: { p: 0.5, r: 1.1, gb: 1 }, JACKOFF: { p: 0.35, r: 0.8 }, PILOT: { p: 1.05, r: 1.15 }, SOUP: { p: 1.2, r: 1.1, gb: 1 }, GAS: { p: 0.95, r: 1.05, gb: 1 }, GROPES: { p: 0.85, r: 1.0, gb: 1 }, 'TV OP': { p: 0.9, r: 1.05 }, YOU: { p: 1.3, r: 1.1 } };
// v4.7: real recorded-style lines (Kokoro TTS, generated offline into fps/voices/<hash>.mp3). Unknown lines just stay silent.
let curVoice = null;
const VBASE = location.protocol === 'file:' ? 'voices/' : '/fps/voices/';   // /fps is served without a trailing slash, so relative paths would miss
const lineId = (who, text) => { let h = 5381; const s = who + '|' + text; for (let i = 0; i < s.length; i++) h = (Math.imul(h, 33) ^ s.charCodeAt(i)) >>> 0; return h.toString(16).padStart(8, '0'); };
function speakLine(who, text) {
  if (!VOICE.on || AUD.muted) return;
  try {
    if (curVoice) { curVoice.pause(); curVoice = null; }
    const a = new Audio(VBASE + lineId(who, text) + '.mp3'); a.volume = 0.95; curVoice = a;
    const pr = a.play(); if (pr && pr.catch) pr.catch(() => {});
  } catch (e) {}
}
function hushVoices() { try { if (curVoice) { curVoice.pause(); curVoice = null; } } catch (e) {} }
function toggleVoices() { VOICE.on = !VOICE.on; try { localStorage.setItem('mw_voices', VOICE.on ? '1' : '0'); } catch (e) {} if (!VOICE.on) hushVoices(); announce(VOICE.on ? 'VOICES ON' : 'VOICES OFF', 'press O to toggle', 26); }

// ---------- the condom attack (CoD's dog attack, but it's trying to put a rubber on you): mash X / tap to fight it off ----------
function startQTE(e) {
  M.qte = { e, k: 0.3, t: 0, prev: M.state }; M.state = 'qte';
  player.canMove = false; player.canFire = false; player.invul = true; player.ads = 0; fireHeld = false;
  e.frozen = true; e.attackT = 999; e.qte = true; sfx('wrap'); shake = 12;
  say('YOU', 'GET IT OFF ME!', 100);
}
function qteHit() { const q = M.qte; if (!q) return; q.k = Math.min(1.05, q.k + 0.075); shake = Math.max(shake, 4); if (t % 2 === 0) sfx('hit'); }
function qteTick() {
  const q = M.qte, p = player, e = q.e; q.t++;
  q.k -= 0.0045 * (1 + q.t / 400);
  const a = p.a; e.x = p.x + Math.cos(a) * (0.75 - 0.25 * (1 - q.k)); e.y = p.y + Math.sin(a) * (0.75 - 0.25 * (1 - q.k)); e.faceA = Math.atan2(p.x - e.x, p.y - e.y);
  pitch = lerp(pitch, -30, 0.1); if (t % 25 === 0) sfx('wrap');
  if (q.k >= 1) {   // won: blow it away, then... the line
    M.qte = null; M.state = q.prev; p.canMove = true; p.canFire = true; e.frozen = false;
    killEnt(e); burst3d(e.x, e.y, 0.6, 40, 'drop', 0.2); burst3d(e.x, e.y, 0.8, 20, 'drop', 0.12);
    spawnDeco('splat', e.x, e.y, 0.9, 1.8, { z: 0, fade: 900, far: 20 }); flash = 0.9; shake = 16; sfx('splat'); sfx('kill');
    radio = null; radioQ = []; say('YOU', 'I only fuck raw.', 170); announce('RAW DOGGED', 'condom neutralised. thoroughly.', 46);
    setTimeout(() => { if (player === p) p.invul = false; }, 1200);
  } else if (q.k <= 0 || q.t > 600) { M.qte = null; M.state = q.prev; p.invul = false; e.frozen = false; e.qte = false; die('wrapped'); }
}
function drawQTE() {
  const q = M.qte; if (!q) return; const ctx = hctx, wrap = clamp(1 - q.k, 0, 1);
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.8); g.addColorStop(0, 'rgba(200,230,255,0)'); g.addColorStop(1, `rgba(190,225,255,${0.35 + 0.45 * wrap})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  txt('A CONDOM IS TRYING TO WRAP YOUR DICK', W / 2, H / 2 + 20, 30, '#fff', 'center', INK);
  const pulse = 1 + Math.sin(t * 0.5) * 0.08; ctx.save(); ctx.translate(W / 2, H / 2 + 80); ctx.scale(pulse, pulse);
  txt(isTouch ? 'TAP TAP TAP!' : 'MASH  X !', 0, 0, 58, YEL, 'center', INK); ctx.restore();
  const bw = 420, bx = W / 2 - bw / 2, by = H / 2 + 130;
  rr(bx, by, bw, 26, 13); fs('rgba(0,0,0,0.55)', '#fff', 3); rr(bx + 4, by + 4, (bw - 8) * clamp(q.k, 0, 1), 18, 9); fs(q.k > 0.6 ? '#7fd67f' : q.k > 0.3 ? YEL : '#ff4d6d', null);
  txt('WRAPPED', bx - 12, by + 13, 16, '#bfe6ff', 'right', null); txt('RAW', bx + bw + 12, by + 13, 16, '#7fd67f', 'left', null);
}
