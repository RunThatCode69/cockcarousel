// ---------- HUD ----------
let jam = [], announceQ = [], radio = null, radioQ = [], objText = '', objT = 0, hintT = 0, flash = 0, shake = 0, whiteOut = 0, hitT = 0, hitKill = false, feed = [], dmgDir = [];
function say(who, text, life = 240) { radioQ.push({ who, text, life }); }
function radioTick() { if (radio && --radio.life <= 0) radio = null; if (!radio && radioQ.length) { radio = radioQ.shift(); radio.max = radio.life; if (M && M.state === 'play') sfx('tick'); } }
function announce(text, sub = '', big = 46) { announceQ.push({ text, sub, big, life: 150, max: 150 }); }
function setObjective(s) { if (s && s !== objText && state === 'game') sfx('select'); objText = s; objT = 0; }
function hurtFx(n) { for (let i = 0; i < n; i++) { const edge = Math.random() < 0.5; jam.push({ x: edge ? (Math.random() < 0.5 ? rand(-20, 120) : rand(W - 120, W + 20)) : rand(0, W), y: edge ? rand(0, H) : (Math.random() < 0.5 ? rand(-20, 100) : rand(H - 100, H + 20)), r: rand(40, 110), life: 240, max: 240, s: Math.random() * 6 }); } }
function killFeed(what) { feed.unshift({ text: what, life: 300 }); feed = feed.slice(0, 4); }
const NAMES = { crab: 'CRAB', bee: 'BEE', trap: 'MOUSETRAP', condom: 'CONDOM TROOPER', chili: 'CHILI', ice: 'ICE CUBE', boss: 'IMRAN JACKOFF', target: 'TARGET' };
function drawHUD() {
  const p = player, low = 1 - clamp(p.hp / 60, 0, 1);
  for (const j of jam) {
    const k = Math.min(1, (j.max - j.life) / 8), a = Math.min(1, j.life / 60) * 0.7;
    ctx.globalAlpha = a; E(j.x, j.y, j.r * k, j.r * 0.8 * k); fs('#8e2a7a', '#5a1a4a', 2);
    E(j.x - j.r * 0.3 * k, j.y - j.r * 0.25 * k, j.r * 0.35 * k, j.r * 0.22 * k); fs('#c94aa8', null);
    E(j.x + j.r * 0.4 * k, j.y + j.r * 0.3 * k, j.r * 0.3 * k, j.r * 0.35 * k); fs('#8e2a7a', null);
    rr(j.x - 6, j.y, 12, j.r * 0.6 * k + (j.max - j.life) * 0.3, 6); fs('#8e2a7a', null);
    ctx.globalAlpha = 1;
  }
  if (low > 0) {
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.75);
    g.addColorStop(0, 'rgba(255,40,90,0)'); g.addColorStop(1, `rgba(255,40,90,${(0.35 + Math.sin(t * 0.15) * 0.1) * low})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (low > 0.6) txt("she's going soft...", W / 2, H - 150, 22, '#fff', 'center', '#3a0010');
  }
  if ((p.wrap || 0) > 0.02) {
    // latex creeping over the screen, a sheen, and a meter
    const k = p.wrap; const g = ctx.createRadialGradient(W / 2, H / 2, H * (0.6 - 0.35 * k), W / 2, H / 2, H * 0.95); g.addColorStop(0, 'rgba(200,230,255,0)'); g.addColorStop(1, `rgba(190,225,255,${0.25 + 0.5 * k})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 0.25 * k; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(W * 0.3, H * 0.25, 200 * k, 30 * k, -0.4, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    const bx = W / 2 - 120, by = H - 150; rr(bx, by, 240, 22, 11); fs('rgba(26,58,90,0.7)', '#bfe6ff', 2.5); rr(bx + 3, by + 3, 234 * k, 16, 8); fs(k > 0.6 ? '#ff9ec4' : '#bfe6ff', null);
    txt(`WRAPPED ${Math.round(k * 100)}%`, W / 2, by - 14, 18, '#bfe6ff', 'center', '#1a3a5a');
  }
  if (p.shrink > 0) { ctx.fillStyle = 'rgba(160,220,255,0.1)'; ctx.fillRect(0, 0, W, H); txt('SHRINKAGE — damage halved', W / 2, 250, 26, '#bfe9f8', 'center', '#1a4a7a'); }
  if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${Math.min(1, flash)})`; ctx.fillRect(0, 0, W, H); }
  if (M.scope && p.ads > 0.75 && M.state === 'play') {   // sniper scope: black mask, a round view, a fine crosshair with mil dots
    const r = H * 0.46, cx = W / 2, cy = H / 2; ctx.save(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(cx, cy, r, 0, TAU, true); ctx.fill();
    const g = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.85)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx - r * 0.3, cy); ctx.moveTo(cx + r * 0.3, cy); ctx.lineTo(cx + r, cy); ctx.moveTo(cx, cy + r * 0.3); ctx.lineTo(cx, cy + r); ctx.stroke();
    ctx.fillStyle = '#111'; for (let i = 1; i < 5; i++) { E(cx + i * r * 0.06, cy, 2, 2); ctx.fill(); E(cx - i * r * 0.06, cy, 2, 2); ctx.fill(); E(cx, cy + i * r * 0.06, 2, 2); ctx.fill(); }
    txt('hold breath: you can\'t. you\'re a dick.', cx, cy + r + 18, 14, '#aaa', 'center', null); ctx.restore();
  }
  if (M.state === 'gunship') { drawGunshipHUD(); drawObjRadio(); drawAnnounce(); return; }
  if (M.state !== 'play' && M.state !== 'rails' && M.state !== 'crawl' && M.state !== 'showdown') return;
  const cy = H / 2;
  // damage direction indicators
  for (const d of dmgDir) { const rel = wrapA(d.a - p.a) - Math.PI / 2; ctx.save(); ctx.translate(W / 2, cy); ctx.rotate(rel); ctx.globalAlpha = d.life / 40; ctx.strokeStyle = '#ff4d6d'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, 70, -0.5, 0.5); ctx.stroke(); ctx.restore(); ctx.globalAlpha = 1; }
  // marked stragglers: red arrows over their heads
  for (const e of ents) if (e.reveal && !e.dead) { const v = _cv.set(e.x, (e.z || 0) * YS + 1.6, e.y).project(camera); if (v.z > 1) continue; const sx = clamp((v.x * 0.5 + 0.5) * W, 20, W - 20), sy = clamp((-v.y * 0.5 + 0.5) * H, 40, H - 40); ctx.fillStyle = '#ff4d6d'; ctx.strokeStyle = INK; ctx.lineWidth = 3; poly([sx - 10, sy - 16, sx + 10, sy - 16, sx, sy]); ctx.fill(); ctx.stroke(); }
  // crosshair + hit marker
  // world-space objective marker (a heart with the distance in metres, CoD-style), projected from 3D
if (M.goal && !M.goal.hidden && M.state !== 'crawl') {
  const v = new THREE.Vector3(M.goal.x, 1.4, M.goal.y).project(camera);
  const dm = Math.round(Math.hypot(M.goal.x - p.x, M.goal.y - p.y) * 2);
  let sx = (v.x * 0.5 + 0.5) * W, sy = (-v.y * 0.5 + 0.5) * H;
  const behind = v.z > 1;
  if (behind) { sx = sx < W / 2 ? W - 40 : 40; sy = H / 2; }
  sx = clamp(sx, 40, W - 40); sy = clamp(sy, 90, H - 120);
  ctx.globalAlpha = 0.95; heart(sx, sy, 13); fs(YEL, INK, 2.5); txt(`${dm}m`, sx, sy + 27, 16, '#fff', 'center', INK); ctx.globalAlpha = 1;
  if (behind || sx <= 40 || sx >= W - 40) { txt(sx < W / 2 ? '◀' : '▶', sx + (sx < W / 2 ? 24 : -24), sy, 22, YEL, 'center', INK); }
}
if (M.state !== 'crawl' && p.ads < 0.5 && p.sprint < 0.5) {
    const spread = 12 + p.recoil * 10 + p.moving * 8;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3;
    ctx.beginPath(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { ctx.moveTo(W / 2 + dx * spread, cy + dy * spread); ctx.lineTo(W / 2 + dx * (spread + 12), cy + dy * (spread + 12)); }); ctx.stroke();
    ctx.strokeStyle = PINK; ctx.lineWidth = 1.5; ctx.stroke();
    E(W / 2, cy, 2.5, 2.5); fs('#fff', null);
    if (p.aimLock) { ctx.strokeStyle = YEL; ctx.lineWidth = 2; E(W / 2, cy, spread + 18, spread + 18); ctx.stroke(); }
    if (hitT > 0) { ctx.strokeStyle = hitKill ? '#ff4d6d' : '#fff'; ctx.lineWidth = 4; const s = 10 + (10 - hitT); ctx.beginPath(); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => { ctx.moveTo(W / 2 + dx * 8, cy + dy * 8); ctx.lineTo(W / 2 + dx * s, cy + dy * s); }); ctx.stroke(); }
  }
  // compass strip
  if (M.state !== 'crawl') {
    const cx = W / 2 + 110, cw = 220, cy0 = 22;
    ctx.fillStyle = 'rgba(14,16,18,0.55)'; rr(cx - cw / 2, cy0 - 12, cw, 24, 8); ctx.fill();
    ctx.save(); rr(cx - cw / 2, cy0 - 12, cw, 24, 8); ctx.clip();
    const marks = [['N', -Math.PI / 2], ['E', 0], ['S', Math.PI / 2], ['W', Math.PI]];
    for (const [l, ba] of marks) { const rel = wrapA(ba - p.a); if (Math.abs(rel) < 1.2) txt(l, cx + rel / 1.2 * cw / 2, cy0, 16, '#fff', 'center', null); }
    for (let i = 0; i < 16; i++) { const rel = wrapA(i * TAU / 16 - p.a); if (Math.abs(rel) < 1.2) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(cx + rel / 1.2 * cw / 2 - 1, cy0 + 6, 2, 4); } }
    if (M.goal && !M.goal.hidden) { const tgtP = navPath && navPath.length > 2 ? { x: navPath[Math.min(2, navPath.length - 1)][0], y: navPath[Math.min(2, navPath.length - 1)][1] } : M.goal; const rel = wrapA(angleTo(p, tgtP) - p.a); heart(cx + clamp(rel / 1.2, -1, 1) * cw / 2, cy0 - 2, 8); fs(YEL, INK, 1.5); }
    ctx.restore();
    ctx.fillStyle = '#fff'; poly([cx, cy0 + 14, cx - 5, cy0 + 20, cx + 5, cy0 + 20]); ctx.fill();
  }
  drawObjRadio();
  // minimap + kill feed
  if (mini && M.state !== 'crawl') {
    const mw = 118, mh = 118, mx = W - mw - 16, my = 14;
    ctx.save();
    ctx.fillStyle = 'rgba(14,16,18,0.6)'; rr(mx - 4, my - 4, mw + 8, mh + 8, 8); ctx.fill();
    rr(mx, my, mw, mh, 4); ctx.clip();
    const sc = 4 * 1.6;
    ctx.translate(mx + mw / 2 - p.x * sc, my + mh / 2 - p.y * sc);
    ctx.drawImage(mini, 0, 0, mini.width * 1.6, mini.height * 1.6);
    for (const e of ents) {
      if (e.kind === 'pickup') { ctx.fillStyle = PURP; E(e.x * sc, e.y * sc, 2.5, 2.5); ctx.fill(); }
      else if (e.kind === 'enemy' && !e.dead && (p.ultraT > 0 || e.type === 'boss' || e.reveal)) { ctx.fillStyle = '#ff4d6d'; E(e.x * sc, e.y * sc, 3, 3); ctx.fill(); }
      else if (e.kind === 'npc') { ctx.fillStyle = CYAN; E(e.x * sc, e.y * sc, 2.5, 2.5); ctx.fill(); }
    }
    if (M.goal && !M.goal.hidden) { ctx.fillStyle = YEL; heart(M.goal.x * sc, M.goal.y * sc, 4); ctx.fill(); }
    ctx.translate(p.x * sc, p.y * sc); ctx.rotate(p.a);
    poly([7, 0, -5, -5, -5, 5]); fs(PINK, INK, 1.5);
    ctx.restore();
    if (p.ultraT > 0) txt('ULTRASOUND', mx + mw / 2, my + mh + 14, 14, CYAN, 'center', null);
    feed.forEach((f, i) => { ctx.globalAlpha = Math.min(1, f.life / 40); txt(f.text, W - 16, my + mh + 36 + i * 20, 14, '#fff', 'right', null); ctx.globalAlpha = 1; });
  }
  // weapon + ammo
  // XP popups next to the crosshair
  xps.forEach((x, i) => { ctx.globalAlpha = Math.min(1, x.life / 20); txt(`+${x.v}`, W / 2 + 70, H / 2 - 20 - (70 - x.life) * 0.8 - i * 4, 26, YEL, 'left'); ctx.globalAlpha = 1; });
  if (M.state !== 'crawl') {
    const ax = W - 24, ay = H - 40;
    txt('DICK-47', ax, ay - 44, 16, PINK, 'right', null);
    { // LENGTH: shots shrink it, lotion pumps it back up
      const k = p.size || 1, bw = 150, bx = isTouch ? W - 172 : ax - bw, by = isTouch ? 182 : ay - 84, low = k < 0.5;
      txt('LENGTH', bx, by - 10, 13, '#fff', 'left', null);
      txt(`${(k * 9).toFixed(1)}"`, ax, by - 10, 18, p.hardT > 0 ? CYAN : low ? '#ff4d6d' : YEL, 'right', null);
      rr(bx, by, bw, 12, 6); fs('rgba(0,0,0,0.45)', '#fff', 1.5);
      if (k > 0.02) { rr(bx + 2, by + 2, (bw - 4) * k, 8, 4); fs(p.hardT > 0 ? CYAN : low && t % 30 < 15 ? '#ff4d6d' : SKIN, null); }
      if (p.hardT > 0) txt(`RAGING ${Math.ceil(p.hardT / 60)}s`, bx, by + 26, 13, CYAN, 'left', null);
      if (low && M.state === 'play') { ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 0.2); txt('SHRIVELED — FIND LOTION', W / 2, H - 186, 22, '#ff9bb8', 'center', INK); ctx.globalAlpha = 1; }
    }
    for (let i = 0; i < 3; i++) { E(ax - 150 - i * 20, ay - 44, 7, 8); fs(i < p.nades ? SKIN : 'rgba(255,255,255,0.15)', i < p.nades ? INK : null, 1.5); }
    if (!isTouch) txt('G', ax - 210, ay - 44, 13, '#fff', 'center', null);
    txt(p.reloading ? 'RELOADING' : `${p.ammo}`, ax - (p.reloading ? 0 : 36), ay - 12, p.reloading ? 22 : 44, p.ammo === 0 && !p.reloading ? '#ff4d6d' : '#fff', 'right');
    if (!p.reloading) txt('/ ∞', ax, ay - 8, 22, '#ffd6e7', 'right', null);
    if (!p.reloading) for (let i = 0; i < MAG; i++) { E(ax - 6 - i * 16, ay + 22, 6, 5.5); fs(i < p.ammo ? CUM : 'rgba(255,255,255,0.2)', i < p.ammo ? CUM2 : null, 1.5); }
    if (isTouch) for (const b of TOUCH_BTNS) { if (M.state === 'rails' && (b.label === 'CROUCH' || b.label === 'AIM')) continue; const on = b.on && b.on(); rr(b.x, b.y, b.w, b.h, 14); fs(on ? 'rgba(255,93,143,0.85)' : 'rgba(14,16,18,0.75)', YEL, 3); txt(b.label + (b.count ? ` ×${b.count()}` : ''), b.x + b.w / 2, b.y + b.h / 2, 20, '#fff', 'center', null); }
    if (M.state === 'play') {
      // stance: a tiny dick silhouette, standing / crouched / sprinting
      ctx.save(); ctx.translate(40, H - 72); ctx.scale(1, p.crouch ? 0.6 : 1); ctx.rotate(p.sprint * 0.4); ctx.globalAlpha = 0.85; drawDick(0, 0, 0.55, { still: true, face: false }); ctx.restore(); ctx.globalAlpha = 1;
      txt(`STREAK ${p.streak}`, 70, H - 36, 26, p.streak >= 3 ? YEL : '#fff', 'left');
      const next = STREAKS.find(s => s.n > p.streak);
      if (next) txt(`${next.n - p.streak} more → ${next.name}`, 70, H - 12, 15, '#fff', 'left', null);
    }
  }
  if (M.timer !== undefined && M.timer !== null) {
    const s = Math.max(0, Math.ceil(M.timer / 60));
    txt(`${M.timerLabel || ''} ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`, W / 2, 60, 30, s < 15 && t % 30 < 15 ? '#ff4d6d' : '#fff');
  }
  if (M.meter) { const m = M.meter, bw = 220, bx = W / 2 - bw / 2, by = 92; txt(m.label, W / 2, by - 8, 15, m.color || YEL, 'center', null); rr(bx, by, bw, 12, 6); fs('rgba(0,0,0,0.5)', '#fff', 1.5); rr(bx + 2, by + 2, (bw - 4) * clamp(m.k, 0, 1), 8, 4); fs(m.color || YEL, null); }
  if (M.clock !== undefined && M.clock !== null) txt(`${M.clockLabel || ''} ${(M.clock / 60).toFixed(1)}s`, W / 2, 60, 30, '#fff');
  // CoD4-style intro card, bottom left, typed out on arrival
  if (M.card && hintT < 420) {
    ctx.globalAlpha = Math.min(1, (420 - hintT) / 40);
    let n = Math.floor(hintT * 0.9);
    M.card.forEach((line, i) => { const shown = line.slice(0, Math.max(0, n)); n -= line.length + 6; txt(shown, 30, H - 190 + i * 26, i === 0 ? 20 : 18, i === 0 ? '#fff' : '#d6f5d0', 'left', 'rgba(0,0,0,0.8)'); });
    ctx.globalAlpha = 1;
  }
  drawAnnounce();
  if (isTouch && hintT < 600 && M.state === 'play') {
    ctx.globalAlpha = Math.min(1, (600 - hintT) / 40);
    txt('drag here to move', W * 0.25, H - 80, 22, '#fff');
    txt('drag to look · tap to shoot', W * 0.62, H - 220, 22, '#fff');
    ctx.globalAlpha = 1;
  }
  if (!isTouch && hintT < 600 && M.state === 'play') {
    ctx.globalAlpha = Math.min(1, (600 - hintT) / 40);
    txt('WASD move · mouse look · CLICK shoot · RIGHT-CLICK aim · R reload · G nut-nade', W / 2, 345, 19, '#fff');
    txt('SPACE jump · SHIFT sprint · C crouch · V headbutt', W / 2, 368, 17, '#fff');
    ctx.globalAlpha = 1;
  }
  if (joy.active) {
    ctx.globalAlpha = 0.5; E(joy.x0, joy.y0, 60, 60); fs('rgba(255,255,255,0.25)', '#fff', 3);
    E(joy.x0 + joy.dx, joy.y0 + joy.dy, 28, 28); fs(PINK, INK, 3); ctx.globalAlpha = 1;
  }
  if (isTouch) { rr(W / 2 - 24, 40, 48, 26, 8); fs('rgba(14,16,18,0.6)', null); txt('II', W / 2, 53, 16, '#fff', 'center', null); }
  if (!isTouch) txt(muted ? 'M: sound off' : 'M: sound on', W - 16, 152, 13, '#fff', 'right', null);
}

function drawObjRadio() {
  const ctx = hctx;
  // objective: wrapped, with a live counter and (after a while) a hint, so you always know what to do next
  let objBottom = 14;
  if (objText) {
    const shown = objText.slice(0, Math.floor(objT / 1.2));
    const size = 18, lines = wrapLines(objText, size, 392);
    const st = M && M.stages && M.stages[M.stage];
    const cnt = st && st.count ? st.count() : '';
    const hint = st && (M.stageT || 0) > (st.hintAfter || 1500) ? (st.hint || (st.clearAll ? 'Kill them all. When only a few are left, red arrows mark where they are.' : M.goal && !M.goal.hidden ? 'Follow the yellow arrows on the ground and the heart marker.' : '')) : '';
    const hLines = hint ? wrapLines('HINT: ' + hint, 15, 392) : [];
    const h = 30 + lines.length * 22 + (cnt ? 22 : 0) + hLines.length * 18 + 6;
    ctx.fillStyle = 'rgba(14,16,18,0.78)'; rr(16, 14, 420, h, 10); ctx.fill(); if (objT < 200) { ctx.strokeStyle = t % 20 < 10 ? YEL : '#fff'; ctx.lineWidth = 3; ctx.stroke(); }
    txt(objT < 200 ? 'NEW OBJECTIVE' : 'OBJECTIVE', 30, 30, 15, objT < 200 ? YEL : CYAN, 'left', null);
    let y = 52, left = shown.length;
    for (const l of lines) { txt(l.slice(0, Math.max(0, left)), 30, y, size, '#fff', 'left', null); left -= l.length + 1; y += 22; }
    if (cnt) { txt(cnt, 30, y, 16, YEL, 'left', null); y += 22; }
    if (hLines.length) { ctx.globalAlpha = 0.75 + 0.25 * Math.sin(t * 0.1); for (const l of hLines) { txt(l, 30, y - 2, 15, '#ffd6e7', 'left', null); y += 18; } ctx.globalAlpha = 1; }
    objBottom = 14 + h;
  }
  if (radio) {
    const k = Math.min(1, (radio.max - radio.life) / 6);
    ctx.save(); ctx.globalAlpha = Math.min(1, radio.life / 20) * k;
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; const y = objBottom + 8;
    rr(16, y, 420, 30 + 22 * Math.ceil(radio.text.length / 40), 10); ctx.fill();
    txt(radio.who + ':', 30, y + 19, 16, radio.who === 'PRICK' ? CYAN : radio.who === 'MACMILLI' ? '#b8f0a0' : radio.who === 'SARGE' ? '#ffb347' : radio.who === 'JACKOFF' ? '#ff4d6d' : YEL, 'left', null);
    const shown = radio.text.slice(0, Math.floor((radio.max - radio.life) * 1.6));
    txtWrap(shown, 30, y + 43, 18, 392, '#fff', 'left', null, 1.2);
    ctx.restore();
  }
}
function drawAnnounce() {
  const ctx = hctx;
  if (announceQ.length) {
    const a = announceQ[0];
    const k = Math.min(1, (a.max - a.life) / 8), al = Math.min(1, a.life / 25);
    ctx.save(); ctx.globalAlpha = al; ctx.translate(W / 2, 170); ctx.scale(k, k); ctx.rotate(Math.sin(t * 0.1) * 0.02);
    txt(a.text, 0, 0, a.big, YEL); if (a.sub) txt(a.sub, 0, a.big * 0.9, 22, '#fff');
    ctx.restore();
  }
}

function wrapLines(s, size, maxW) {
  hctx.font = `${size}px ${FONT}`; const out = []; let line = '';
  for (const w of s.split(' ')) { const tst = line ? line + ' ' + w : w; if (hctx.measureText(tst).width > maxW && line) { out.push(line); line = w; } else line = tst; }
  if (line) out.push(line); return out;
}
