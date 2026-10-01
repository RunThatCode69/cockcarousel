
// ================================================================
//  SCREENS — title, mission select, briefing, dead, clear, credits
// ================================================================
function btn(x, y, w, h, label, fn, sub, c = 'rgba(74,29,58,0.85)') {
  buttons.push({ x, y, w, h, fn });
  rr(x, y, w, h, 14); fs(c, YEL, 3);
  txt(label, x + w / 2, y + h / 2 - (sub ? 8 : 0), 22, '#fff', 'center', null);
  if (sub) txt(sub, x + w / 2, y + h / 2 + 14, 13, YEL, 'center', null);
}
function skyBg(c1, c2, c3) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c1); g.addColorStop(0.55, c2); g.addColorStop(1, c3);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function drawTitle() {
  buttons = [];
  skyBg('#ff9ec4', '#c96bff', '#4a1d3a');
  // dusk clouds + a sun setting behind the hills
  E(760, 150, 60, 60); fs(YEL, '#f0a91d', 3);
  ctx.fillStyle = '#7a3fb5'; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 330 + Math.sin(x * 0.006) * 22 + Math.sin(x * 0.014 + 1) * 9); ctx.lineTo(W, H); ctx.fill();
  ctx.fillStyle = '#4a1d3a'; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 420 + Math.sin(x * 0.009 + 2) * 18); ctx.lineTo(W, H); ctx.fill();
  // the squad
  drawDick(150, 470, 1.9, { hat: 'helmet', flap: false, seed: 1, look: 1.6 });
  drawDick(830, 470, 1.9, { hat: 'boonie', stache: 2.6, stacheC: '#d8d0d8', skin: '#cfc0cc', skin2: '#b0a0ae', head: '#b992a8', head2: '#a07890', wrinkly: true, cigar: true, seed: 5, mirror: true, look: 1.6 });
  drawDick(265, 505, 1.1, { hat: 'drill', stache: 1.3, angry: true, yell: t % 120 < 60, seed: 8 });
  ctx.save(); ctx.translate(W / 2, 92 + Math.sin(t * 0.05) * 4); ctx.rotate(Math.sin(t * 0.03) * 0.02);
  txt('CUM OF DUTY', 0, 0, 84, YEL);
  ctx.restore();
  txt('MODERN WHARFARE', W / 2, 160, 44, '#fff'); txt('v3 · NOW IN 3D', W / 2 + 250, 130, 20, '#fff', 'center', PINK);
  txt('a Cock Carousel joint  ·  5 missions  ·  one dick', W / 2, 200, 20, '#ffd6e7', 'center', null);
  const bw = 250, bh = 54, y0 = 250;
  if (unlockedM > 1) {
    btn(W / 2 - bw - 10, y0, bw, bh, 'NEW GAME', newGame, isTouch ? '' : 'N');
    btn(W / 2 + 10, y0, bw, bh, 'CONTINUE', () => startBrief(unlockedM), `mission ${unlockedM}${isTouch ? '' : ' · SPACE'}`);
  } else btn(W / 2 - bw / 2, y0, bw, bh, 'NEW GAME', newGame, isTouch ? 'tap' : 'SPACE');
  btn(W / 2 - bw - 10, y0 + 66, bw, bh, 'MISSION SELECT', () => { state = 'select'; }, `${unlockedM} of ${MISSIONS.length} unlocked`);
  btn(W / 2 + 10, y0 + 66, bw, bh, `DIFFICULTY: ${diff.toUpperCase()}`, () => { diff = diff === 'easy' ? 'regular' : 'easy'; save(); }, diff === 'easy' ? 'recommended. seriously.' : 'a few more enemies. still easy.');
  txt(isTouch ? 'left thumb: move · right thumb: look & tap to shoot' : 'WASD + mouse · click shoot · SPACE jump · R reload · G nut', W / 2, H - 38, 18, '#fff', 'center', null);
  txt('sequel to Cum of Duty: Wrong Hole', W / 2, H - 16, 14, '#ffd6e7', 'center', null);
  btn(W - 150, 16, 134, 44, AUD.muted ? 'SOUND OFF' : 'SOUND ON', () => { setMuted(!AUD.muted); });
  if (!actxLive()) txt('tap anywhere for sound', W - 83, 76, 13, '#fff', 'center', null);
}
function drawSelect() {
  buttons = [];
  skyBg('#4a1d3a', '#7a3fb5', '#c96bff');
  txt('MISSION SELECT', W / 2, 50, 44, YEL);
  const NM = MISSION_META.length, cw = NM > 6 ? 128 : NM > 5 ? 146 : 172, ch = 250, gap = NM > 6 ? 6 : NM > 5 ? 8 : 12, x0 = (W - (cw * NM + gap * (NM - 1))) / 2, y0 = 100;
  for (let i = 0; i < NM; i++) {
    const m = MISSION_META[i], x = x0 + i * (cw + gap), open = i + 1 <= unlockedM, b = bestM[i + 1];
    rr(x, y0, cw, ch, 14); fs(open ? 'rgba(255,246,224,0.95)' : 'rgba(74,29,58,0.7)', open ? YEL : INK, 3);
    txt(`MISSION ${i + 1}`, x + cw / 2, y0 + 24, 16, open ? PINK : '#a08aa0', 'center', null);
    txtWrap(m.name, x + cw / 2, y0 + 52, 20, cw - 16, open ? INK : '#c0b0c0', 'center', null, 1.1);
    txtWrap(m.place, x + cw / 2, y0 + 100, 11, cw - 14, open ? '#7a3fb5' : '#a08aa0', 'center', null, 1.1);
    if (open) {
      ctx.save(); ctx.translate(x + cw / 2, y0 + (NM > 5 ? 184 : 190)); if (NM > 5) ctx.scale(NM > 6 ? 0.72 : 0.8, NM > 6 ? 0.72 : 0.8); m.icon(); ctx.restore();
      txt(b ? b.rank : 'not yet attempted', x + cw / 2, y0 + 215, b ? 13 : 12, b ? PINK : '#8a7a8a', 'center', null);
      if (b) txt(`${b.kills} kills · ${Math.round(b.acc * 100)}% · ${Math.round(b.time)}s`, x + cw / 2, y0 + 234, 11, INK, 'center', null);
      buttons.push({ x, y: y0, w: cw, h: ch, fn: () => startBrief(i + 1) });
    } else {   // padlock
      ctx.save(); ctx.translate(x + cw / 2, y0 + 170);
      rr(-22, -10, 44, 36, 6); fs('#c9a2ff', INK, 2.5); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, -12, 14, Math.PI, 0); ctx.stroke(); E(0, 8, 4, 4); fs(INK, null);
      ctx.restore();
      txt('LOCKED', x + cw / 2, y0 + 215, 13, '#c0b0c0', 'center', null);
    }
  }
  btn(W / 2 - 100, H - 70, 200, 46, 'BACK', () => { state = 'title'; });
}
// the "satellite feed" in every briefing is, unmistakably, a scrotum
function drawSatMap(x, y, w, h) {
  ctx.save(); rr(x, y, w, h, 10); ctx.clip();
  ctx.fillStyle = '#0d2a14'; ctx.fillRect(x, y, w, h);
  const cx = x + w / 2, cy = y + h * 0.5;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(w / 320, h / 260);
  E(-46, 10, 62, 76); fs('#2f7a3a', '#1a4a22', 3);
  E(48, 14, 62, 78); fs('#2f7a3a', '#1a4a22', 3);
  ctx.strokeStyle = '#1f5a2a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -60); ctx.quadraticCurveTo(-4, 10, 2, 90); ctx.stroke();
  for (let i = 0; i < 26; i++) { const ax = -100 + (i * 37) % 200, ay = -50 + (i * 53) % 120; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(ax + 6, ay + 4, ax + 12, ay + 1); ctx.stroke(); }
  for (let i = 0; i < 18; i++) { const ax = -95 + (i * 47) % 190, ay = -45 + (i * 31) % 110; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.bezierCurveTo(ax + 3, ay - 8, ax - 6, ay - 12, ax + 1, ay - 16); ctx.stroke(); }
  ctx.restore();
  // grid + scanline + reticle
  ctx.strokeStyle = 'rgba(120,255,140,0.18)'; ctx.lineWidth = 1;
  for (let gx = x; gx < x + w; gx += 24) { ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + h); ctx.stroke(); }
  for (let gy = y; gy < y + h; gy += 24) { ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); ctx.stroke(); }
  const sl = y + (t * 1.5) % h; ctx.fillStyle = 'rgba(120,255,140,0.18)'; ctx.fillRect(x, sl, w, 3);
  const rx = cx + Math.sin(t * 0.02) * 60, ry = cy + Math.cos(t * 0.017) * 40;
  ctx.strokeStyle = '#7dff8a'; ctx.lineWidth = 2; E(rx, ry, 26, 26); ctx.stroke(); ctx.beginPath(); ctx.moveTo(rx - 36, ry); ctx.lineTo(rx + 36, ry); ctx.moveTo(rx, ry - 36); ctx.lineTo(rx, ry + 36); ctx.stroke();
  txt('SAT-LINK · CLASSIFIED', x + 10, y + 14, 12, '#7dff8a', 'left', null);
  txt(`${(36.9 + Math.sin(t * 0.01)).toFixed(4)}N  ${(69.4 + Math.cos(t * 0.013)).toFixed(4)}E`, x + w - 10, y + 14, 12, '#7dff8a', 'right', null);
  txt('TGT: THE SACK', x + 10, y + h - 14, 12, '#7dff8a', 'left', null);
  ctx.restore();
  ctx.strokeStyle = '#7dff8a'; ctx.lineWidth = 2; rr(x, y, w, h, 10); ctx.stroke();
}
function drawBrief() {
  buttons = [];
  ctx.fillStyle = '#0b0f1a'; ctx.fillRect(0, 0, W, H);
  const m = MISSION_META[missionIdx - 1];
  drawSatMap(520, 60, 400, 300);
  // stamp
  ctx.save(); ctx.translate(560, 400); ctx.rotate(-0.06);
  rr(0, 0, 340, 84, 6); ctx.strokeStyle = '#ff4d6d'; ctx.lineWidth = 4; ctx.stroke();
  txt(`MISSION ${missionIdx}: ${m.name.toUpperCase()}`, 170, 24, 20, '#ff4d6d', 'center', null);
  txt(m.place.toUpperCase(), 170, 50, 15, '#ff4d6d', 'center', null);
  txt(m.date, 170, 70, 12, '#ff4d6d', 'center', null);
  ctx.restore();
  // typewriter
  let remaining = briefN, y = 70;
  ctx.font = `20px ${FONT}`;
  for (const line of briefLines) {
    if (remaining <= 0) break;
    const shown = line.slice(0, remaining); remaining -= line.length;
    const n = txtWrap(shown, 40, y, 20, 450, line.startsWith('>') ? YEL : '#d6f5d0', 'left', null, 1.2);
    y += n * 26 + 8;
  }
  const total = briefLines.join('').length;
  if (briefN < total) { if (t % 2 === 0) { briefN++; if (briefN % 3 === 0) sfx('type'); } }
  else if (Math.floor(t / 30) % 2 === 0) txt(isTouch ? 'TAP TO DEPLOY' : 'SPACE TO DEPLOY', 270, H - 50, 30, YEL);
  txt(isTouch ? 'tap to skip' : 'space to skip', 40, H - 20, 13, '#6a7a6a', 'left', null);
}
function drawDead() {
  ctx.fillStyle = `rgba(60,0,30,${clamp(stateT / 40, 0, 0.75)})`; ctx.fillRect(0, 0, W, H);
  if (stateT > 20) txt(deathTitle, W / 2, 150, 74, deathTitle === 'WRAPPED' ? '#bfe6ff' : '#ff4d6d', 'center', deathTitle === 'WRAPPED' ? '#1a3a5a' : '#3a0010');
  if (stateT > 50) { txt(deathQuote[0], W / 2, 240, 26, '#fff', 'center', null); txt('— ' + deathQuote[1], W / 2, 278, 22, YEL, 'center', null); }
  if (stateT > 70 && Math.floor(t / 30) % 2 === 0) txt(isTouch ? 'Tap to retry from checkpoint' : 'SPACE to retry from checkpoint', W / 2, 400, 30, '#fff');
}
function drawClear() {
  buttons = [];
  ctx.fillStyle = `rgba(0,0,0,${clamp(stateT / 40, 0, 0.6)})`; ctx.fillRect(0, 0, W, H);
  const k = Math.min(1, stateT / 14);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(k, k); ctx.translate(-W / 2, -H / 2);
  rr(W / 2 - 300, 60, 600, 400, 26); fs('#fff6e0', INK, 4);
  txt('MISSION COMPLETE', W / 2, 108, 48, PINK);
  txt(MISSION_META[missionIdx - 1].name, W / 2, 150, 22, INK, 'center', null);
  const rows = [['KILLS', stats.kills], ['ACCURACY', `${Math.round(stats.acc * 100)}%`], ['TIME', `${Math.floor(stats.time / 60)}:${String(Math.floor(stats.time % 60)).padStart(2, '0')}`]];
  rows.forEach(([l, v], i) => { txt(l, W / 2 - 60, 200 + i * 38, 22, '#7a3fb5', 'right', null); txt(String(v), W / 2 - 30, 200 + i * 38, 26, INK, 'left', null); });
  if (stateT > 40) { txt('RANK', W / 2, 330, 18, '#7a3fb5', 'center', null); txt(stats.rank, W / 2, 362, 40, YEL); txt(`"${stats.rankLine}"`, W / 2, 400, 20, INK, 'center', null); }
  ctx.restore();
  if (stateT > 60 && Math.floor(t / 30) % 2 === 0) txt(isTouch ? (missionIdx === MISSIONS.length ? 'Tap for the credits' : `Tap for mission ${missionIdx + 1}`) : (missionIdx === MISSIONS.length ? 'SPACE for the credits' : `SPACE for mission ${missionIdx + 1}`), W / 2, 500, 28, '#fff');
}
const CREDITS = ['CUM OF DUTY', 'MODERN WHARFARE', '', 'a Cock Carousel production', '', 'STARRING', 'You (a dick)', 'Captain Prick', 'Sarge', 'Soup · Gas · Gropes', 'Imran Jackoff (as himself)', '',
  'ENEMIES', 'the crabs', 'the bees', 'that one mousetrap', 'the Condom Troopers (they were just doing their job)', 'the chilis', 'an ice cube', '',
  'STUNTS', 'all stunts were performed by the actual dick', 'no eggplants were harmed', '', 'MUSIC', 'four oscillators and a dream', '',
  'SPECIAL THANKS', 'her', 'she wanted more', '', 'FILMED ON LOCATION', 'in a sack', '', 'cockcarousel.com', ''];
let creditsBar = -1;
function drawCredits() {
  buttons = [];
  ctx.fillStyle = '#05070f'; ctx.fillRect(0, 0, W, H);
  const bar = Math.floor(stateT / 528);
  if (bar !== creditsBar && stateT < 1700) { creditsBar = bar; pianoBar(); }
  const y0 = H + 40 - stateT * 0.55;
  CREDITS.forEach((l, i) => { const y = y0 + i * 36; if (y > -40 && y < H + 40) txt(l, W / 2, y, i < 2 ? 40 : (l === l.toUpperCase() && l.length > 2 ? 18 : 24), i < 2 ? YEL : (l === l.toUpperCase() ? PINK : '#fff'), 'center', i < 2 ? INK : null); });
  // mid-credits scene
  if (stateT > 1500) {
    const k = clamp((stateT - 1500) / 40, 0, 1);
    ctx.fillStyle = `rgba(5,7,15,${k})`; ctx.fillRect(0, 0, W, H);
    if (k >= 1) {
      skyBg('#1a1040', '#3b2470', '#6a3d9a');
      ctx.fillStyle = '#4a1d3a'; ctx.fillRect(0, 420, W, 120);
      // a fur coat on a hook. one sleeve. something is moving inside it.
      ctx.save(); ctx.translate(W / 2, 260 + Math.sin(stateT * 0.05) * 2);
      ctx.strokeStyle = '#8a8a9a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, -140); ctx.lineTo(0, -100); ctx.stroke();
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; E(Math.cos(a) * 70, Math.sin(a) * 90 - 10, 16, 16); fs('#6b4a2a', INK, 2); }
      E(0, -10, 70, 90); fs('#7a5632', null);
      E(60, -50, 12, 12); fs(SKIN, INK, 2);
      if (stateT > 1620) { E(-16, -30, 6, 7); fs('#fff', INK, 1.5); E(14, -30, 6, 7); fs('#fff', INK, 1.5); E(-14, -30, 3, 3.5); fs('#ff4d6d', null); E(16, -30, 3, 3.5); fs('#ff4d6d', null); }
      ctx.restore();
      if (stateT > 1560) txt("...he'll be back.", W / 2, 80, 30, '#fff');
      if (stateT > 1700) { txt('CUM OF DUTY: MODERN WHARFARE 2', W / 2, 460, 34, YEL); txt('coming... eventually', W / 2, 500, 22, '#fff', 'center', null); }
      if (stateT > 1800 && Math.floor(t / 30) % 2 === 0) txt(isTouch ? 'tap to return to base' : 'SPACE to return to base', W / 2, 30, 20, '#fff', 'center', null);
    }
  }
}
function drawPause() {
  buttons = [];
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H);
  txt('PAUSED', W / 2, 150, 60, YEL);
  txt('(she\'s waiting)', W / 2, 200, 22, '#fff', 'center', null);
  btn(W / 2 - 130, 250, 260, 54, 'RESUME', unpause);
  btn(W / 2 - 130, 320, 260, 54, AUD.muted ? 'SOUND: OFF' : 'SOUND: ON', () => { setMuted(!AUD.muted); });
  btn(W / 2 - 130, 390, 260, 54, 'QUIT TO TITLE', () => { state = 'title'; if (document.exitPointerLock) document.exitPointerLock(); });
}
