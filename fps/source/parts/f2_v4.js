
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
      if (e.kind === 'npc' && e.friendly && !g.ffCool && dist(s, e) < (s.gun.r > 2 ? s.gun.r * 0.7 : 0.6)) { g.ff++; g.ffCool = 90; say('PRICK', pickOne(['CHECK FIRE! CHECK FIRE!', 'THAT WAS US! THAT WAS US!', 'Friendly! We are FRIENDLY!']), 160); shake = 20; if (g.ff >= 5) { die('friendly'); return; } }
    }
    if (kills) { stats.hits++; if (t - g.lines > 90) { g.lines = t; say('TV OP', kills > 2 ? pickOne(['Ka-BOOM.', 'Oh, that\'s a big splash.', 'Hot damn. Look at \'em scatter.']) : pickOne(['Good kill. Good kill.', 'Target down. Nice and wet.', 'Splash one.', 'Smoke \'em.']), 110); } }
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
    else { e.attackT = 10; g.teamHp -= 0.022 * ts; if (t % 45 === 0) say(pickOne(['SOUP', 'GAS']), pickOne(['They\'re on us!', 'Contact, close!', 'Get it OFF me!']), 90); }
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
    if (!M.stallDone) { M.stallDone = true; say('PRICK', left.length === 1 ? 'One left. I\'ve marked him. Follow the arrows.' : `${left.length} left. I've marked them red. Follow the arrows.`, 200); }
  }
  // anything nobody can walk to (stuck in a wall, fell off the map) just gets removed after a bit
  if (M.stageT > 60 * 40) for (const e of left) { const c = flowF ? flowF[(e.y | 0) * MW + (e.x | 0)] : 0; if ((c === -1 && !e.z) || (M.stageT > 60 * 90 && left.length <= 4)) { killEnt(e); if (!M.flags.stallKill) { M.flags.stallKill = true; say('PRICK', 'Got the last one from over here. Move on, son.', 180); } } }
}
