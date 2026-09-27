// ---------- HUD ----------
let jam = [], announceQ = [], radio = null, radioQ = [], objText = '', objT = 0, hintT = 0, flash = 0, shake = 0, whiteOut = 0, hitT = 0, hitKill = false, feed = [], dmgDir = [];
function say(who, text, life = 240) { radioQ.push({ who, text, life }); }
function radioTick() { if (radio && --radio.life <= 0) radio = null; if (!radio && radioQ.length) { radio = radioQ.shift(); radio.max = radio.life; if (M && M.state === 'play') sfx('tick'); } }
function announce(text, sub = '', big = 46) { announceQ.push({ text, sub, big, life: 150, max: 150 }); }
function setObjective(s) { objText = s; objT = 0; }
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
  if (p.wrapT > 0) { ctx.fillStyle = 'rgba(200,230,255,0.12)'; ctx.fillRect(0, 0, W, H); txt('WRAPPED — so slow, so safe', W / 2, 120, 26, '#bfe9f8'); }
  if (p.shrink > 0) { ctx.fillStyle = 'rgba(160,220,255,0.1)'; ctx.fillRect(0, 0, W, H); txt('SHRINKAGE — damage halved', W / 2, 250, 26, '#bfe9f8', 'center', '#1a4a7a'); }
  if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${Math.min(1, flash)})`; ctx.fillRect(0, 0, W, H); }
  if (M.state !== 'play' && M.state !== 'rails' && M.state !== 'crawl' && M.state !== 'showdown') return;
  const cy = H / 2;
  // damage direction indicators
  for (const d of dmgDir) { const rel = wrapA(d.a - p.a) - Math.PI / 2; ctx.save(); ctx.translate(W / 2, cy); ctx.rotate(rel); ctx.globalAlpha = d.life / 40; ctx.strokeStyle = '#ff4d6d'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, 70, -0.5, 0.5); ctx.stroke(); ctx.restore(); ctx.globalAlpha = 1; }
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
    ctx.fillStyle = 'rgba(74,29,58,0.55)'; rr(cx - cw / 2, cy0 - 12, cw, 24, 8); ctx.fill();
    ctx.save(); rr(cx - cw / 2, cy0 - 12, cw, 24, 8); ctx.clip();
    const marks = [['N', -Math.PI / 2], ['E', 0], ['S', Math.PI / 2], ['W', Math.PI]];
    for (const [l, ba] of marks) { const rel = wrapA(ba - p.a); if (Math.abs(rel) < 1.2) txt(l, cx + rel / 1.2 * cw / 2, cy0, 16, '#fff', 'center', null); }
    for (let i = 0; i < 16; i++) { const rel = wrapA(i * TAU / 16 - p.a); if (Math.abs(rel) < 1.2) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(cx + rel / 1.2 * cw / 2 - 1, cy0 + 6, 2, 4); } }
    if (M.goal && !M.goal.hidden) { const tgtP = navPath && navPath.length > 2 ? { x: navPath[Math.min(2, navPath.length - 1)][0], y: navPath[Math.min(2, navPath.length - 1)][1] } : M.goal; const rel = wrapA(angleTo(p, tgtP) - p.a); heart(cx + clamp(rel / 1.2, -1, 1) * cw / 2, cy0 - 2, 8); fs(YEL, INK, 1.5); }
    ctx.restore();
    ctx.fillStyle = '#fff'; poly([cx, cy0 + 14, cx - 5, cy0 + 20, cx + 5, cy0 + 20]); ctx.fill();
  }
  // objective
  if (objText) {
    ctx.fillStyle = 'rgba(74,29,58,0.7)'; rr(16, 14, 420, 56, 10); ctx.fill();
    txt('OBJECTIVE', 30, 30, 15, CYAN, 'left', null);
    txt(objText.slice(0, Math.floor(objT / 1.5)), 30, 54, objText.length > 40 ? 16 : 20, '#fff', 'left', null);
  }
  if (radio) {
    const k = Math.min(1, (radio.max - radio.life) / 6);
    ctx.save(); ctx.globalAlpha = Math.min(1, radio.life / 20) * k;
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; const y = objText ? 84 : 14;
    rr(16, y, 420, 30 + 22 * Math.ceil(radio.text.length / 40), 10); ctx.fill();
    txt(radio.who + ':', 30, y + 19, 16, radio.who === 'PRICK' ? CYAN : radio.who === 'MACMILLI' ? '#b8f0a0' : radio.who === 'SARGE' ? '#ffb347' : radio.who === 'JACKOFF' ? '#ff4d6d' : YEL, 'left', null);
    const shown = radio.text.slice(0, Math.floor((radio.max - radio.life) * 1.6));
    txtWrap(shown, 30, y + 43, 18, 392, '#fff', 'left', null, 1.2);
    ctx.restore();
  }
  // minimap + kill feed
  if (mini && M.state !== 'crawl') {
    const mw = 118, mh = 118, mx = W - mw - 16, my = 14;
    ctx.save();
    ctx.fillStyle = 'rgba(74,29,58,0.6)'; rr(mx - 4, my - 4, mw + 8, mh + 8, 8); ctx.fill();
    rr(mx, my, mw, mh, 4); ctx.clip();
    const sc = 4 * 1.6;
    ctx.translate(mx + mw / 2 - p.x * sc, my + mh / 2 - p.y * sc);
    ctx.drawImage(mini, 0, 0, mini.width * 1.6, mini.height * 1.6);
    for (const e of ents) {
      if (e.kind === 'pickup') { ctx.fillStyle = PURP; E(e.x * sc, e.y * sc, 2.5, 2.5); ctx.fill(); }
      else if (e.kind === 'enemy' && !e.dead && (p.ultraT > 0 || e.type === 'boss')) { ctx.fillStyle = '#ff4d6d'; E(e.x * sc, e.y * sc, 3, 3); ctx.fill(); }
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
    for (let i = 0; i < 3; i++) { E(ax - 150 - i * 20, ay - 44, 7, 8); fs(i < p.nades ? SKIN : 'rgba(255,255,255,0.15)', i < p.nades ? INK : null, 1.5); }
    if (!isTouch) txt('G', ax - 210, ay - 44, 13, '#fff', 'center', null);
    txt(p.reloading ? 'RELOADING' : `${p.ammo}`, ax - (p.reloading ? 0 : 36), ay - 12, p.reloading ? 22 : 44, p.ammo === 0 && !p.reloading ? '#ff4d6d' : '#fff', 'right');
    if (!p.reloading) txt('/ ∞', ax, ay - 8, 22, '#ffd6e7', 'right', null);
    if (!p.reloading) for (let i = 0; i < MAG; i++) { E(ax - 6 - i * 16, ay + 22, 6, 5.5); fs(i < p.ammo ? CUM : 'rgba(255,255,255,0.2)', i < p.ammo ? CUM2 : null, 1.5); }
    if (isTouch) for (const b of TOUCH_BTNS) { if (M.state === 'rails' && (b.label === 'CROUCH' || b.label === 'AIM')) continue; const on = b.on && b.on(); rr(b.x, b.y, b.w, b.h, 14); fs(on ? 'rgba(255,93,143,0.85)' : 'rgba(74,29,58,0.75)', YEL, 3); txt(b.label + (b.count ? ` ×${b.count()}` : ''), b.x + b.w / 2, b.y + b.h / 2, 20, '#fff', 'center', null); }
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
  // CoD4-style intro card, bottom left, typed out on arrival
  if (M.card && hintT < 420) {
    ctx.globalAlpha = Math.min(1, (420 - hintT) / 40);
    let n = Math.floor(hintT * 0.9);
    M.card.forEach((line, i) => { const shown = line.slice(0, Math.max(0, n)); n -= line.length + 6; txt(shown, 30, H - 190 + i * 26, i === 0 ? 20 : 18, i === 0 ? '#fff' : '#d6f5d0', 'left', 'rgba(0,0,0,0.8)'); });
    ctx.globalAlpha = 1;
  }
  if (announceQ.length) {
    const a = announceQ[0];
    const k = Math.min(1, (a.max - a.life) / 8), al = Math.min(1, a.life / 25);
    ctx.save(); ctx.globalAlpha = al; ctx.translate(W / 2, 170); ctx.scale(k, k); ctx.rotate(Math.sin(t * 0.1) * 0.02);
    txt(a.text, 0, 0, a.big, YEL); if (a.sub) txt(a.sub, 0, a.big * 0.9, 22, '#fff');
    ctx.restore();
  }
  if (isTouch && hintT < 600 && M.state === 'play') {
    ctx.globalAlpha = Math.min(1, (600 - hintT) / 40);
    txt('drag here to move', W * 0.25, H - 80, 22, '#fff');
    txt('drag to look · tap to shoot', W * 0.62, H - 220, 22, '#fff');
    ctx.globalAlpha = 1;
  }
  if (!isTouch && hintT < 600 && M.state === 'play') {
    ctx.globalAlpha = Math.min(1, (600 - hintT) / 40);
    txt('WASD move · mouse look · click shoot · right-click aim · R reload · G nut-nade', W / 2, 205, 19, '#fff');
    txt('SHIFT sprint · C crouch · V headbutt', W / 2, 228, 17, '#fff');
    ctx.globalAlpha = 1;
  }
  if (joy.active) {
    ctx.globalAlpha = 0.5; E(joy.x0, joy.y0, 60, 60); fs('rgba(255,255,255,0.25)', '#fff', 3);
    E(joy.x0 + joy.dx, joy.y0 + joy.dy, 28, 28); fs(PINK, INK, 3); ctx.globalAlpha = 1;
  }
  if (isTouch) { rr(W / 2 - 24, 40, 48, 26, 8); fs('rgba(74,29,58,0.6)', null); txt('II', W / 2, 53, 16, '#fff', 'center', null); }
  if (!isTouch) txt(muted ? 'M: sound off' : 'M: sound on', W - 16, 152, 13, '#fff', 'right', null);
}
