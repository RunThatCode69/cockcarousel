// 2D art shared with v1/v2: drawDick, every enemy/prop painter, and the wall/floor texture bakers.
// v3 uses them to paint textures, decals, faces and the HUD.
export const W = 960, H = 540;
export const FONT = "'Lilita One', 'Arial Rounded MT Bold', 'Trebuchet MS', sans-serif";
export const INK = '#4a1d3a';
export const SKIN = '#f9c3ad', SKIN2 = '#f3a48c', HEAD = '#f47fa2', HEAD2 = '#e85f8b';
export const PINK = '#ff5d8f', YEL = '#ffd23f', PURP = '#7a3fb5', CYAN = '#7ed6df', CUM = '#f7f4ec', CUM2 = '#e6e0d2';
export const TAU = Math.PI * 2;
export const rand = (a, b) => a + Math.random() * (b - a);
export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
export const lerp = (a, b, k) => a + (b - a) * k;
export const wrapA = a => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };
export const pickOne = a => a[Math.floor(Math.random() * a.length)];
export let ctx = null;
export function setCtx(c) { ctx = c; }
export let t = 0;
export function setT(v) { t = v; }
export function E(x, y, rx, ry, r = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), r, 0, TAU); }
export function fs(fill, stroke = INK, lw = 2.5) { ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }
export function poly(pts) { ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.closePath(); }
export function rr(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
export function heart(x, y, s) {
  ctx.beginPath(); ctx.moveTo(x, y + s);
  ctx.bezierCurveTo(x - s * 1.4, y - s * 0.2, x - s * 0.6, y - s * 1.2, x, y - s * 0.4);
  ctx.bezierCurveTo(x + s * 0.6, y - s * 1.2, x + s * 1.4, y - s * 0.2, x, y + s);
  ctx.closePath();
}
export function txt(s, x, y, size, fill = '#fff', align = 'center', stroke = INK) {
  ctx.font = `${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  if (stroke) { ctx.lineWidth = size * 0.2; ctx.strokeStyle = stroke; ctx.strokeText(s, x, y); }
  ctx.fillStyle = fill; ctx.fillText(s, x, y);
}
export function txtWrap(s, x, y, size, maxW, fill = '#fff', align = 'left', stroke = null, lh = 1.25) {
  ctx.font = `${size}px ${FONT}`;
  const words = s.split(' '); let line = '', n = 0;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { txt(line, x, y + n * size * lh, size, fill, align, stroke); line = w; n++; }
    else line = test;
  }
  if (line) { txt(line, x, y + n * size * lh, size, fill, align, stroke); n++; }
  return n;
}
export function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
export function bake(w, h, fn) { const c = mkCanvas(w, h); const old = ctx; ctx = c.getContext('2d'); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; fn(ctx, w, h); ctx = old; return c; }
  function drawDick(x, y, s, o = {}) {
  const sq = o.squash || 0;
  const sy = (1 - sq * 0.3), sx = (1 + sq * 0.2);
  const skin = o.skin || SKIN, skin2 = o.skin2 || SKIN2, head = o.head || HEAD, head2 = o.head2 || HEAD2;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * sx * (o.mirror ? -1 : 1), s * sy);
  if (o.rot) { ctx.translate(0, -32); ctx.rotate(o.rot); ctx.translate(0, 32); }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const wob = o.still ? 0 : Math.sin(t * 0.25 + (o.seed || 0)) * 0.03;

  // fur coat (behind everything): a big fluffy brown blob
  if (o.coat) {
    ctx.fillStyle = '#6b4a2a';
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; E(Math.cos(a) * 34, -34 + Math.sin(a) * 30, 9, 9); fs('#6b4a2a', INK, 2); }
    E(0, -34, 34, 30); fs('#7a5632', null);
  }
  // stubby arms (behind the body)
  const wave = o.flap ? Math.sin(t * 0.6) * 8 - 18 : (o.armsUp ? -26 : 6);
  ctx.strokeStyle = skin2; ctx.lineWidth = 6;
  ctx.beginPath();
  if (!o.onearm) { ctx.moveTo(-8, -40); ctx.lineTo(-24, -40 + wave); }
  ctx.moveTo(12, -40); ctx.lineTo(28, -40 + wave); ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.lineCap = 'butt';
  const hands = o.onearm ? [[28, -40 + wave]] : [[-24, -40 + wave], [28, -40 + wave]];
  hands.forEach(([hx, hy]) => { E(hx, hy, 4.5, 4.5); fs(skin, INK, 1.8); });
  if (o.onearm) {   // the stump: a bandaged nub. he lost it in a very bad way.
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-8, -40); ctx.lineTo(-14, -39); ctx.stroke();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-8, -44); ctx.lineTo(-14, -35); ctx.moveTo(-11, -44); ctx.lineTo(-17, -36); ctx.stroke();
  }
  ctx.lineCap = 'round';
  if (o.pistol) {   // a little pistol in the right hand
    ctx.save(); ctx.translate(28, -40 + wave); ctx.rotate(-0.3);
    rr(-3, -4, 18, 7, 2); fs('#3a3a4a', INK, 1.5); rr(6, 2, 6, 9, 2); fs('#3a3a4a', INK, 1.5);
    ctx.restore();
  }

  // shaft (leans back a touch)
  const dfl = o.deflate || 0;
  ctx.save(); ctx.translate(2, -14); ctx.rotate(-0.12 + wob - dfl * 1.35 + (o.lean || 0)); ctx.scale(1 - dfl * 0.3, 1 - dfl * 0.5);
  rr(-13, -56, 26, 60, 11); fs(skin);
  if (o.wrinkly) { ctx.strokeStyle = skin2; ctx.lineWidth = 1.5; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-8, -50 + i * 12); ctx.quadraticCurveTo(0, -46 + i * 12, 8, -50 + i * 12); ctx.stroke(); } }
  if (o.coat) { E(0, -4, 22, 9); fs('#8a6a44', INK, 2); for (let i = -2; i <= 2; i++) { E(i * 9, -6, 5, 5); fs('#8a6a44', INK, 1.5); } }
  // head
  E(0, -55, 15.5, 13); fs(head);
  ctx.beginPath(); ctx.moveTo(-15, -52); ctx.quadraticCurveTo(0, -42, 15, -52); ctx.strokeStyle = head2; ctx.lineWidth = 2.5; ctx.stroke();
  E(5, -60, 3.2, 2); fs('#fff', null);
  if (o.bandana) { ctx.strokeStyle = '#c92a2a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-15, -48); ctx.quadraticCurveTo(0, -44, 15, -48); ctx.stroke(); }
  // hats
  if (o.hat === 'drill') { E(0, -64, 24, 5); fs('#6b7a3a'); E(0, -70, 12, 9); fs('#6b7a3a'); ctx.strokeStyle = '#4c5828'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, -74); ctx.lineTo(6, -74); ctx.stroke(); }
  if (o.hat === 'boonie') { E(0, -62, 25, 6); fs('#5d6b45'); rr(-13, -78, 26, 17, 7); fs('#5d6b45'); ctx.strokeStyle = '#3f4a2e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-13, -68); ctx.lineTo(13, -68); ctx.stroke(); }
  if (o.hat === 'helmet') { E(0, -63, 19, 12); fs(o.helmetC || '#5b6b3c'); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-17, -56); ctx.quadraticCurveTo(0, -46, 17, -56); ctx.stroke(); }
  if (o.hat === 'beanie') { E(0, -64, 17, 11); fs('#3a3a4a'); E(0, -75, 5, 5); fs('#3a3a4a'); }
  // face
  if (o.face !== false) {
    if (o.dead) {
      ctx.strokeStyle = INK; ctx.lineWidth = 2.2;
      [[-6, -34], [6, -34]].forEach(([ex, ey]) => { ctx.beginPath(); ctx.moveTo(ex - 3, ey - 3); ctx.lineTo(ex + 3, ey + 3); ctx.moveTo(ex + 3, ey - 3); ctx.lineTo(ex - 3, ey + 3); ctx.stroke(); });
      E(0, -22, 4, 5); fs(INK, null);
    } else {
      const blink = !o.still && (t + (o.seed || 0) * 7) % 190 < 6;
      [[-5.5, -34], [6.5, -34]].forEach(([ex, ey], i) => {
        if (blink) { ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ex - 4, ey); ctx.lineTo(ex + 4, ey); ctx.stroke(); }
        else {
          E(ex, ey, 4.6, 5); fs('#fff', INK, 1.6);
          const lx = o.look === undefined ? 1.6 : o.look;
          E(ex + lx, ey + 0.5, 2.3, 2.6); fs(INK, null); E(ex + lx + 0.8, ey - 1, 0.9, 0.9); fs('#fff', null);
          if (o.angry) { ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(ex - 5, ey - 8 + (i ? 2 : 0)); ctx.lineTo(ex + 5, ey - 6 - (i ? 2 : 0)); ctx.stroke(); }
        }
      });
      if (o.scar) { ctx.strokeStyle = '#c96a80'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(4, -42); ctx.lineTo(9, -28); ctx.moveTo(4, -38); ctx.lineTo(8, -37); ctx.moveTo(6, -32); ctx.lineTo(10, -33); ctx.stroke(); }
      E(-10, -26, 3.2, 2); fs('#ff9bb5', null); E(11, -26, 3.2, 2); fs('#ff9bb5', null);
      ctx.strokeStyle = INK; ctx.lineWidth = 2.2;
      if (o.yell) { E(0.5, -21, 5, 6); fs('#7a2a4a', INK, 2); E(0.5, -18.5, 3, 2); fs('#ff9bb5', null); }
      else if (o.flap || o.open) { E(0.5, -22, 4, 4.5); fs('#7a2a4a', INK, 2); }
      else if (o.frown) { ctx.beginPath(); ctx.moveTo(-6, -20); ctx.quadraticCurveTo(0.5, -26, 7, -20); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(-6, -24); ctx.quadraticCurveTo(0.5, -17, 7, -24); ctx.stroke(); }
      if (o.stache) {
        const k = o.stache; ctx.strokeStyle = o.stacheC || INK; ctx.lineWidth = 3.5 * Math.min(k, 1.6); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0, -28); ctx.quadraticCurveTo(-7 * k, -34, -12 * k, -26); ctx.moveTo(0, -28); ctx.quadraticCurveTo(7 * k, -34, 12 * k, -26); ctx.stroke();
        ctx.lineCap = 'round';
      }
      if (o.cigar) { ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(6, -22); ctx.lineTo(18, -19); ctx.stroke(); E(19, -19, 2, 2); fs('#ff7a3a', null); }
    }
  }
  ctx.restore();

  // balls (the seat)
  E(-9, -11, 14, 12); fs(skin);
  E(11, -11, 14, 12); fs(skin);
  ctx.strokeStyle = skin2; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-12, -8); ctx.quadraticCurveTo(-9, -12, -5, -8); ctx.moveTo(8, -8); ctx.quadraticCurveTo(11, -12, 15, -8); ctx.stroke();
  ctx.restore();
}

// ---- enemy painters. Each draws at (cx, by) = feet-center, facing the camera. `p` is the pose. ----
function crabArt(cx, by, p) {
  const k = 2.2, cy = by - 26 * k * 0.6, run = p.dead ? 0 : t * 0.5;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k);
  if (p.dead) { ctx.scale(1, -0.6); ctx.translate(0, -8); }
  ctx.strokeStyle = '#d6362e'; ctx.lineWidth = 4;
  for (let i = 0; i < 3; i++) {
    const sw = Math.sin(run + i * 1.5 + (p.f || 0) * 2) * 5;
    ctx.beginPath(); ctx.moveTo(-18, i * 2); ctx.lineTo(-32 + sw, 15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(18, i * 2); ctx.lineTo(32 - sw, 15); ctx.stroke();
  }
  E(0, 0, 26, 15); fs('#f04e3e');
  E(0, 4, 18, 7); fs('#ff7b6b', null);
  const pinch = p.attack ? 0.8 : Math.abs(Math.sin(t * 0.15)) * 0.5;
  [[-1, -30], [1, 30]].forEach(([d, px]) => {
    ctx.save(); ctx.translate(px, -14 - (p.attack ? 8 : 0)); ctx.rotate(d * (0.3 - pinch) * (p.attack ? -1 : 1));
    E(0, 0, 9, 7); fs('#f04e3e'); poly([d * 6, -5, d * 16, -2, d * 6, 1]); fs('#f04e3e');
    ctx.restore();
  });
  ctx.strokeStyle = INK; ctx.lineWidth = 2;
  [[-8], [8]].forEach(([ex]) => {
    ctx.beginPath(); ctx.moveTo(ex, -10); ctx.lineTo(ex, -24); ctx.stroke();
    if (p.dead) { ctx.beginPath(); ctx.moveTo(ex - 3, -29); ctx.lineTo(ex + 3, -23); ctx.moveTo(ex + 3, -29); ctx.lineTo(ex - 3, -23); ctx.stroke(); }
    else { E(ex, -26, 4.5, 4.5); fs('#fff', INK, 1.5); E(ex - 1.5 + (p.attack ? 1.5 : 0), -26, 2, 2); fs(INK, null); }
  });
  if (p.attack) { E(0, -1, 5, 4); fs('#7a2a4a', INK, 2); }
  else { ctx.beginPath(); ctx.moveTo(-6, -2); ctx.quadraticCurveTo(0, 1, 6, -2); ctx.stroke(); }
  ctx.restore();
}
function beeArt(cx, by, p) {
  const k = 2.4, f = Math.sin(t * 0.7 + (p.f || 0) * 3);
  ctx.save(); ctx.translate(cx, by - 30 * k * 0.6); ctx.scale(k, k);
  if (p.dead) { ctx.rotate(Math.PI); ctx.translate(0, -12); }
  E(5, -12 - f * 3, 10, 5, 0.3); fs('rgba(255,255,255,0.85)', INK, 1.5);
  E(-7, -12 + f * 3, 10, 5, -0.3); fs('rgba(255,255,255,0.85)', INK, 1.5);
  E(0, 0, 20, 12); fs(YEL);
  ctx.save(); E(0, 0, 20, 12); ctx.clip(); ctx.fillStyle = INK;
  ctx.fillRect(-9, -13, 7, 26); ctx.fillRect(4, -13, 7, 26); ctx.restore();
  E(0, 0, 20, 12); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
  poly([18, -3, 30 + (p.attack ? 6 : 0), 0, 18, 3]); fs(INK, null);
  E(-20, -3, 9, 8); fs(YEL);
  if (p.dead) { ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-26, -7); ctx.lineTo(-20, -1); ctx.moveTo(-20, -7); ctx.lineTo(-26, -1); ctx.stroke(); }
  else { E(-23, -4, 3.2, 3.5); fs('#fff', INK, 1.4); E(-24, -4, 1.5, 1.6); fs(INK, null); }
  ctx.strokeStyle = INK; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(-24, -10); ctx.lineTo(-30, -17); ctx.moveTo(-19, -10); ctx.lineTo(-19, -18); ctx.stroke();
  if (p.attack) { E(-24, 1, 3, 3); fs('#7a2a4a', INK, 1.5); } else { ctx.beginPath(); ctx.moveTo(-26, 0); ctx.quadraticCurveTo(-23, 3, -20, 0); ctx.stroke(); }
  ctx.restore();
}
function trapArt(cx, by, p) {
  const k = 2.4, x = cx - 24 * k;
  ctx.save(); ctx.translate(x, by); ctx.scale(k, k);
  rr(0, -12, 48, 12, 3); fs('#c98b4b');
  ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(4, -6); ctx.lineTo(44, -6); ctx.stroke();
  ctx.strokeStyle = '#7c8794'; ctx.lineWidth = 3;
  ctx.beginPath(); for (let i = 0; i < 5; i++) ctx.arc(8 + i * 4, -16, 3, Math.PI, 0); ctx.stroke();
  ctx.strokeStyle = p.dead ? '#a0a8b0' : '#5c6670'; ctx.lineWidth = 5;
  if (p.dead) { ctx.beginPath(); ctx.moveTo(42, -12); ctx.lineTo(60, -20); ctx.moveTo(30, -12); ctx.lineTo(20, -30); ctx.stroke(); }
  else if (p.attack) { ctx.beginPath(); ctx.moveTo(42, -12); ctx.lineTo(42, -20); ctx.lineTo(6, -20); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(42, -12); ctx.lineTo(42, -36); ctx.lineTo(14, -40 + Math.sin(t * 0.2) * 2); ctx.stroke(); }
  if (!p.dead) { poly([24, -12, 38, -12, 36, -24]); fs(YEL, INK, 1.5); ctx.fillStyle = '#f0a91d'; [[30, -16], [34, -20]].forEach(([qx, qy]) => { E(qx, qy, 1.5, 1.5); ctx.fill(); }); }
  // a little face on the cheese, because everything has a face
  E(29, -18, 2, 2); fs('#fff', INK, 1); E(29.5, -18, 1, 1); fs(INK, null);
  ctx.restore();
}
function condomArt(cx, by, p) {
  const k = 2.3;
  ctx.save(); ctx.translate(cx, by); ctx.scale(k, k);
  if (p.dead) { ctx.translate(0, -6); ctx.scale(1.3, 0.35); }
  const wob = p.dead ? 0 : Math.sin(t * 0.3 + (p.f || 0) * 3) * 0.06;
  ctx.rotate(wob);
  // rolled ring at the base
  E(0, -6, 20, 7); fs('rgba(220,240,255,0.9)', '#8fb7d6', 2.5);
  // the sheath
  ctx.beginPath(); ctx.moveTo(-15, -6); ctx.lineTo(-15, -50); ctx.quadraticCurveTo(-15, -66, 0, -66); ctx.quadraticCurveTo(15, -66, 15, -50); ctx.lineTo(15, -6); ctx.closePath();
  fs('rgba(200,230,255,0.75)', '#8fb7d6', 2.5);
  ctx.beginPath(); ctx.moveTo(-9, -12); ctx.lineTo(-9, -48); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3; ctx.stroke();
  // reservoir tip
  E(0, -70, 5, 6); fs('rgba(200,230,255,0.85)', '#8fb7d6', 2);
  // helmet
  E(0, -60, 18, 10); fs('#5b6b3c'); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-16, -55); ctx.quadraticCurveTo(0, -48, 16, -55); ctx.stroke();
  // arms + rifle-ish thing (a rolled-up condom wrapper as a gun)
  const a = p.attack ? -30 : -22;
  ctx.strokeStyle = '#a9cbe6'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-14, -30); ctx.lineTo(-28, a); ctx.moveTo(14, -30); ctx.lineTo(28, a); ctx.stroke();
  if (p.attack) { ctx.strokeStyle = '#a9cbe6'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-28, a); ctx.lineTo(-40, a - 10); ctx.moveTo(28, a); ctx.lineTo(40, a - 10); ctx.stroke(); }
  // face
  if (p.dead) { ctx.strokeStyle = INK; ctx.lineWidth = 2; [[-6, -40], [6, -40]].forEach(([ex, ey]) => { ctx.beginPath(); ctx.moveTo(ex - 3, ey - 3); ctx.lineTo(ex + 3, ey + 3); ctx.moveTo(ex + 3, ey - 3); ctx.lineTo(ex - 3, ey + 3); ctx.stroke(); }); }
  else {
    [[-6, -40], [6, -40]].forEach(([ex, ey], i) => { E(ex, ey, 4, 4.5); fs('#fff', INK, 1.5); E(ex + 1, ey + 0.5, 2, 2.2); fs(INK, null); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ex - 5, ey - 8 + (i ? 2 : 0)); ctx.lineTo(ex + 5, ey - 6 - (i ? 2 : 0)); ctx.stroke(); });
    ctx.strokeStyle = INK; ctx.lineWidth = 2;
    if (p.attack) { E(0, -28, 4, 4); fs('#7a2a4a', INK, 1.5); } else { ctx.beginPath(); ctx.moveTo(-5, -28); ctx.quadraticCurveTo(0, -25, 5, -28); ctx.stroke(); }
  }
  ctx.restore();
}
function chiliArt(cx, by, p) {
  const k = 2.4, sway = p.dead ? 0 : Math.sin(t * 0.1 + (p.f || 0)) * 0.04;
  ctx.save(); ctx.translate(cx, by); ctx.scale(k, k); ctx.rotate(sway + (p.attack ? -0.25 : 0));
  if (p.dead) { ctx.scale(1.4, 0.3); }
  ctx.beginPath(); ctx.moveTo(-9, -50); ctx.quadraticCurveTo(-16, -25, -4, -2); ctx.quadraticCurveTo(2, 2, 6, -4); ctx.quadraticCurveTo(14, -25, 9, -50); ctx.closePath(); fs('#e8311f');
  ctx.beginPath(); ctx.moveTo(-5, -44); ctx.quadraticCurveTo(-9, -25, -3, -10); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 3; ctx.stroke();
  rr(-7, -60, 14, 12, 4); fs('#3f8f32');
  ctx.strokeStyle = '#3f8f32'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -58); ctx.quadraticCurveTo(4, -68, 10, -70); ctx.stroke();
  // little arms holding a hot-sauce bottle
  ctx.strokeStyle = '#b8261a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-9, -30); ctx.lineTo(-18, -34 - (p.attack ? 14 : 0)); ctx.moveTo(9, -30); ctx.lineTo(18, -34 - (p.attack ? 14 : 0)); ctx.stroke();
  ctx.save(); ctx.translate(18, -38 - (p.attack ? 14 : 0)); ctx.rotate(p.attack ? -0.8 : -0.2); rr(-3, -10, 6, 14, 2); fs('#ff7a3a', INK, 1.2); rr(-2, -14, 4, 5, 1); fs('#c92a2a', INK, 1); ctx.restore();
  if (p.dead) { ctx.strokeStyle = INK; ctx.lineWidth = 1.5; [[-4, -32], [4, -32]].forEach(([ex, ey]) => { ctx.beginPath(); ctx.moveTo(ex - 2, ey - 2); ctx.lineTo(ex + 2, ey + 2); ctx.moveTo(ex + 2, ey - 2); ctx.lineTo(ex - 2, ey + 2); ctx.stroke(); }); }
  else {
    E(-4, -32, 2.6, 2.8); fs('#fff', INK, 1.2); E(4, -32, 2.6, 2.8); fs('#fff', INK, 1.2);
    E(-3.5, -32, 1.2, 1.3); fs(INK, null); E(4.5, -32, 1.2, 1.3); fs(INK, null);
    ctx.strokeStyle = INK; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(-7, -38); ctx.lineTo(-2, -36); ctx.moveTo(7, -38); ctx.lineTo(2, -36); ctx.stroke();
    if (p.attack) { E(0, -24, 3, 3.5); fs('#7a2a4a', INK, 1.5); } else { ctx.beginPath(); ctx.moveTo(-4, -24); ctx.quadraticCurveTo(0, -27, 4, -24); ctx.stroke(); }
  }
  ctx.restore();
}
function iceArt(cx, by, p) {
  const k = 2.6, sh = p.dead ? 0 : Math.sin(t * 0.9 + (p.f || 0)) * 1.5;
  ctx.save(); ctx.translate(cx + sh, by); ctx.scale(k, k);
  if (p.dead) { E(0, -3, 30, 6); fs('rgba(190,230,255,0.85)', '#6fb0e0', 2); E(-10, -4, 4, 2); fs('#fff', null); ctx.restore(); return; }
  rr(-25, -34, 50, 34, 7); fs('rgba(190,230,255,0.85)', '#6fb0e0', 2.5);
  poly([-19, -28, -7, -28, -15, -16]); fs('rgba(255,255,255,0.8)', null);
  // frosty breath when attacking
  if (p.attack) { ctx.globalAlpha = 0.7; E(0, -40, 14, 6); fs('#fff', null); E(-14, -44, 8, 5); fs('#fff', null); E(14, -44, 8, 5); fs('#fff', null); ctx.globalAlpha = 1; }
  ctx.strokeStyle = '#3f7fb5'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-10, -20); ctx.lineTo(-4, -20); ctx.moveTo(4, -20); ctx.lineTo(10, -20); ctx.stroke();
  if (p.attack) { E(-7, -20, 3, 3); fs('#fff', '#3f7fb5', 1.5); E(7, -20, 3, 3); fs('#fff', '#3f7fb5', 1.5); E(-7, -20, 1.5, 1.5); fs(INK, null); E(7, -20, 1.5, 1.5); fs(INK, null); }
  ctx.beginPath(); ctx.moveTo(-8, -10); for (let i = 1; i < 5; i++) ctx.lineTo(-8 + i * 4, -10 + (i % 2 ? -2 : 2)); ctx.stroke();
  ctx.restore();
}
function bossArt(cx, by, p) {   // Imran Jackoff: huge, one-armed, fur coat, bald and furious
  ctx.save(); ctx.translate(cx, by);
  if (p.dead) { ctx.translate(0, -20); ctx.rotate(-1.35); ctx.translate(0, 20); }
  drawDick(0, 0, 3.6, { coat: true, onearm: true, angry: !p.dead, dead: p.dead, frown: true, scar: true, skin: '#e9b39d', skin2: '#d8927c', still: true, seed: 3, look: p.attack ? 0 : 1.6, open: p.attack });
  ctx.restore();
}
function targetArt(cx, by, p) {   // a paper range target: a butt with rings on it
  const k = 2.4;
  ctx.save(); ctx.translate(cx, by); ctx.scale(k, k);
  if (p.dead) { ctx.scale(1, 0.15); }
  ctx.fillStyle = '#8a6a44'; ctx.fillRect(-2, -20, 4, 20);
  rr(-24, -70, 48, 52, 6); fs('#fff6e0', INK, 2);
  E(-9, -44, 11, 13); fs('#ffb3c9', INK, 1.5); E(9, -44, 11, 13); fs('#ffb3c9', INK, 1.5);
  E(0, -44, 6, 6); fs('#fff', PINK, 2); E(0, -44, 2.5, 2.5); fs(PINK, null);
  ctx.restore();
}
function sergeantArt(cx, by, p) { ctx.save(); ctx.translate(cx, by); drawDick(0, 0, 2.3, { hat: 'drill', stache: 1.3, angry: true, yell: p.attack, still: true, look: 0 }); ctx.restore(); }
function prickArt(cx, by, p) { ctx.save(); ctx.translate(cx, by); drawDick(0, 0, 2.3, { hat: 'boonie', stache: 2.6, stacheC: '#d8d0d8', skin: '#cfc0cc', skin2: '#b0a0ae', head: '#b992a8', head2: '#a07890', wrinkly: true, cigar: true, still: true, look: 0, pistol: p.pistol }); ctx.restore(); }
function allyArt(cx, by, p) { ctx.save(); ctx.translate(cx, by); if (p.dead) { ctx.translate(0, -14); ctx.rotate(1.4); ctx.translate(0, 14); } drawDick(0, 0, 2.3, { hat: 'helmet', helmetC: p.c || '#5b6b3c', bandana: p.bandana, dead: p.dead, still: true, look: 0, open: p.attack, seed: p.f }); ctx.restore(); }
function eggplantArt(cx, by) {
  ctx.save(); ctx.translate(cx, by - 40); ctx.rotate(0.45); ctx.scale(2.6, 2.6);
  E(0, 2, 7, 11.5); fs(PURP, INK, 2); E(-2.5, 2, 2.2, 6); fs('#a76ad9', null);
  poly([-6, -8, 0, -14, 6, -8, 3, -6, 0, -8, -3, -6]); fs('#57b947', INK, 1.5);
  ctx.strokeStyle = '#3f8f32'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(3, -18); ctx.stroke();
  ctx.restore();
}
function crateArt(cx, by) {   // care package: a crate of eggplants with a little parachute stub
  ctx.save(); ctx.translate(cx, by); ctx.scale(2.2, 2.2);
  rr(-24, -40, 48, 40, 4); fs('#c98b4b', INK, 2.5);
  ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-24, -20); ctx.lineTo(24, -20); ctx.moveTo(0, -40); ctx.lineTo(0, 0); ctx.stroke();
  for (let i = -1; i <= 1; i++) { ctx.save(); ctx.translate(i * 13, -46); ctx.rotate(0.4); E(0, 0, 4, 7); fs(PURP, INK, 1.5); ctx.restore(); }
  txt('EGGPLANTS', 0, -10, 8, YEL, 'center', INK);
  ctx.restore();
}
function pubeArt(cx, by, p) {   // a tuft of "tall grass"
  const k = 2.2; ctx.save(); ctx.translate(cx, by); ctx.scale(k, k);
  ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = -3; i <= 3; i++) {
    const s = (p.f || 0) * 13 + i * 7;
    ctx.beginPath(); ctx.moveTo(i * 6, 0);
    ctx.bezierCurveTo(i * 6 + Math.sin(s) * 12, -20, i * 6 - Math.sin(s * 1.3) * 12, -34, i * 5 + Math.cos(s) * 10, -52 - (i % 2) * 8);
    ctx.stroke();
  }
  ctx.restore();
}
function bigPubeArt(cx, by) {   // the Precision Hairstrike ordnance
  ctx.save(); ctx.translate(cx, by); ctx.scale(3, 3);
  ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-20, 0); ctx.bezierCurveTo(-40, -30, 30, -40, 10, -60); ctx.bezierCurveTo(-10, -80, 30, -90, 20, -70); ctx.stroke();
  ctx.restore();
}
function puddleArt(cx, by) {   // hot sauce on the floor: flat, wide, angry
  ctx.save(); ctx.translate(cx, by - 8);
  E(0, 0, 60, 14); fs('#e8311f', '#b8261a', 2); E(-20, -3, 20, 7); fs('#ff5d3a', null); E(28, 3, 12, 4); fs('#ff5d3a', null);
  for (let i = 0; i < 4; i++) { const x = -40 + i * 26; ctx.globalAlpha = 0.5; E(x, -12 - (t + i * 7) % 18 * 0.5, 4, 6); fs('#fff', null); ctx.globalAlpha = 1; }
  ctx.restore();
}
function globArt(cx, by) { E(cx, by - 30, 22, 20); fs(CUM, CUM2, 3); E(cx - 8, by - 38, 6, 4); fs('#fff', null); }
function stingerArt(cx, by) { ctx.save(); ctx.translate(cx, by - 30); poly([-18, -6, 18, 0, -18, 6]); fs(INK, null); ctx.restore(); }
function bottleArt(cx, by) { ctx.save(); ctx.translate(cx, by - 30); ctx.rotate(t * 0.3); rr(-8, -20, 16, 34, 5); fs('#ff7a3a', INK, 2); rr(-5, -28, 10, 10, 2); fs('#c92a2a', INK, 1.5); ctx.restore(); }
function pistolArt(cx, by) { ctx.save(); ctx.translate(cx, by - 12); ctx.scale(2, 2); rr(-14, -6, 30, 9, 3); fs('#3a3a4a', INK, 2); rr(2, 2, 8, 12, 2); fs('#3a3a4a', INK, 2); E(-10, -1, 2, 2); fs('#8a8a9a', null); ctx.restore(); }
function ticketArt(cx, by) { ctx.save(); ctx.translate(cx, by - 40); ctx.rotate(Math.sin(t * 0.1) * 0.2); rr(-22, -14, 44, 28, 4); fs('#fff6e0', INK, 2); txt('69', 0, 0, 20, PINK, 'center', null); ctx.restore(); }
function plantArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2, 2); rr(-12, -16, 24, 16, 3); fs('#c98b4b', INK, 2); ctx.strokeStyle = '#3f8f32'; ctx.lineWidth = 4; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(0, -16); ctx.quadraticCurveTo(i * 10, -34, i * 14, -46); ctx.stroke(); } ctx.restore(); }
function chairArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.2, 2.2); rr(-16, -22, 32, 10, 3); fs('#7ed6df', INK, 2); rr(-16, -46, 32, 26, 4); fs('#7ed6df', INK, 2); ctx.fillStyle = INK; ctx.fillRect(-13, -12, 3, 12); ctx.fillRect(10, -12, 3, 12); ctx.restore(); }
function heliArt(cx, by) { ctx.save(); ctx.translate(cx, by - 40); ctx.scale(2.6, 2.6); E(0, 0, 30, 14); fs('#5b6b3c', INK, 2.5); rr(-8, -18, 4, 10, 1); fs('#3f4a2e', INK, 1.5); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-50 + (t % 2) * 20, -18); ctx.lineTo(50 - (t % 2) * 20, -18); ctx.stroke(); rr(-30, 12, 60, 3, 1); fs('#3f4a2e', INK, 1.5); E(8, -2, 8, 6); fs('#bfe9f8', INK, 1.5); ctx.restore(); }
// ---- props: the set dressing. Each painter draws at (cx, by) = feet-center. ----
function barrelArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.2, 2.2);
  rr(-18, -50, 36, 50, 5); fs('#8a5a3a', INK, 2.5); E(0, -50, 18, 6); fs('#a8714a', INK, 2);
  ctx.fillStyle = '#5b3a24'; ctx.fillRect(-18, -38, 36, 4); ctx.fillRect(-18, -16, 36, 4);
  rr(-12, -32, 24, 13, 2); fs('#fff6e0', INK, 1.5); txt('LUBE', 0, -25, 8, INK, 'center', null);
  E(-8, -44, 3, 5); fs('rgba(255,255,255,0.35)', null); ctx.restore(); }
function sandbagsArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.2, 2.2);
  [[-22, -8], [0, -8], [22, -8], [-11, -22], [11, -22], [0, -36]].forEach(([x, y]) => { E(x, y, 14, 8); fs('#c9ab6e', '#7a6238', 2); ctx.strokeStyle = '#a88a5a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x + 8, y); ctx.stroke(); });
  ctx.restore(); }
function crateStackArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.2, 2.2);
  const box = (x, y, w, h, label) => { rr(x, y, w, h, 3); fs('#c98b4b', INK, 2.5); ctx.strokeStyle = '#7a4d20'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y + h); ctx.moveTo(x + w, y); ctx.lineTo(x, y + h); ctx.stroke(); if (label) { rr(x + w / 2 - 12, y + h / 2 - 5, 24, 10, 2); fs('#fff6e0', INK, 1); txt(label, x + w / 2, y + h / 2, 7, INK, 'center', null); } };
  box(-26, -28, 52, 28, 'FRAGILE'); box(-18, -54, 36, 26, 'THIS END UP'); ctx.restore(); }
function ammoBoxArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.2, 2.2);
  rr(-18, -22, 36, 22, 3); fs('#4e6a3a', INK, 2.5); rr(-18, -26, 36, 6, 2); fs('#5f7f47', INK, 2); ctx.fillStyle = '#c9ab6e'; ctx.fillRect(-4, -28, 8, 4);
  txt('GLOBS', 0, -10, 8, YEL, 'center', INK); ctx.restore(); }
function lanternArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2, 2);
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(0, -56); ctx.stroke();
  poly([-16, -40, 16, -40, 10, -56, -10, -56]); fs('#3a3a4a', INK, 2);
  ctx.globalAlpha = 0.35; E(0, -20, 40, 30); fs('#fff2a8', null); ctx.globalAlpha = 1;
  E(0, -34, 9, 11); fs('#fff2a8', '#e0c060', 2); ctx.restore(); }
function signArt(cx, by, p) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.2, 2.2);
  ctx.fillStyle = '#8a6a44'; ctx.fillRect(-3, -40, 6, 40); rr(-34, -62, 68, 26, 4); fs(p.c || '#fff6e0', INK, 2.5);
  txt(p.text || 'BOOTIE CAMP', 0, -52, p.size || 9, p.tc || INK, 'center', null); if (p.sub) txt(p.sub, 0, -42, 6, p.tc || INK, 'center', null); ctx.restore(); }
function palmArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.4, 2.4);
  ctx.strokeStyle = '#8a6a44'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(6, -30, 2, -60); ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(6, -30, 2, -60); ctx.stroke(); ctx.strokeStyle = '#8a6a44'; ctx.lineWidth = 8; ctx.stroke();
  for (let i = 0; i < 6; i++) { const a = -Math.PI + i * Math.PI / 5; ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(2, -60); ctx.quadraticCurveTo(2 + Math.cos(a) * 24, -60 + Math.sin(a) * 18 - 8, 2 + Math.cos(a) * 34, -60 + Math.sin(a) * 26 + 10); ctx.stroke(); ctx.strokeStyle = '#4fb356'; ctx.lineWidth = 6; ctx.stroke(); }
  E(2, -58, 5, 4); fs('#8a6a44', INK, 1.5); ctx.restore(); }
function tiresArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.2, 2.2);
  for (let i = 0; i < 3; i++) { E(0, -9 - i * 14, 24, 8); fs('#2f2f3a', INK, 2); E(0, -9 - i * 14, 10, 3.5); fs('#4a4a5a', INK, 1.5); } ctx.restore(); }
function valveArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.2, 2.2);
  ctx.strokeStyle = '#6f8a9c'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -46); ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-5, -46); ctx.moveTo(5, 0); ctx.lineTo(5, -46); ctx.stroke();
  E(0, -46, 16, 16); fs('#c92a2a', INK, 2.5); E(0, -46, 5, 5); fs('#8a1a1a', INK, 1.5); ctx.strokeStyle = INK; ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 5, -46 + Math.sin(a) * 5); ctx.lineTo(Math.cos(a) * 15, -46 + Math.sin(a) * 15); ctx.stroke(); } ctx.restore(); }
function lifeRingArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.2, 2.2);
  E(0, -34, 22, 22); fs('#fff', INK, 2.5); ctx.fillStyle = '#ff5d3a'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, -34, 22, i * Math.PI / 2 + 0.3, i * Math.PI / 2 + 1.0); ctx.arc(0, -34, 11, i * Math.PI / 2 + 1.0, i * Math.PI / 2 + 0.3, true); ctx.fill(); }
  E(0, -34, 11, 11); fs('rgba(0,0,0,0)', INK, 2); txt('MV BLUE BALLS', 0, -8, 5, '#fff', 'center', INK); ctx.restore(); }
function coolerArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.2, 2.2);
  rr(-12, -34, 24, 34, 3); fs('#e6eef2', INK, 2.5); ctx.fillStyle = '#7ed6df'; ctx.fillRect(-6, -28, 5, 8); ctx.fillRect(1, -28, 5, 8);
  rr(-11, -56, 22, 24, 6); fs('rgba(126,214,223,0.7)', INK, 2); E(0, -44, 6, 3); fs('#fff', null); ctx.restore(); }
function magRackArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.2, 2.2);
  rr(-20, -46, 40, 46, 3); fs('#8a6a44', INK, 2.5); ['HARD TIMES', 'GIRTH', 'VEINY'].forEach((m, i) => { rr(-16, -42 + i * 14, 32, 11, 1); fs(['#ff9ec4', '#7ed6df', '#ffd23f'][i], INK, 1.2); txt(m, 0, -36 + i * 14, 5, INK, 'center', null); }); ctx.restore(); }
function boardArt(cx, by, p) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.2, 2.2);
  ctx.fillStyle = '#3a3a4a'; ctx.fillRect(-3, -40, 6, 40); rr(-34, -70, 68, 30, 4); fs('#1a1a2a', INK, 2.5);
  txt('NOW SERVING', 0, -62, 7, '#7ed6df', 'center', null); txt(String(p.n || 4), 0, -49, 14, '#ff4d6d', 'center', null); ctx.restore(); }
function carArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.4, 2.4);
  rr(-40, -26, 80, 22, 6); fs('#c9c0b8', INK, 2.5); rr(-22, -42, 44, 20, 6); fs('#c9c0b8', INK, 2.5); ctx.fillStyle = '#5a6a7a'; ctx.fillRect(-16, -40, 14, 12); ctx.fillRect(2, -40, 14, 12);
  E(-24, -4, 8, 8); fs('#2f2f3a', INK, 2); E(24, -4, 8, 8); fs('#2f2f3a', INK, 2);
  ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-30, -20); ctx.lineTo(-10, -12); ctx.lineTo(-24, -8); ctx.stroke(); ctx.restore(); }
function fireArt(cx, by, p) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.2, 2.2); const f = p.f || 0;
  [['#ff5d3a', 1], ['#ff9a3a', 0.72], ['#ffd23f', 0.45]].forEach(([c, k]) => { ctx.beginPath(); ctx.moveTo(-26 * k, 0); ctx.quadraticCurveTo(-28 * k, -30 * k, -8 * k, -34 * k - f * 6); ctx.quadraticCurveTo(0, -60 * k - f * 8, 6 * k, -36 * k + f * 4); ctx.quadraticCurveTo(26 * k, -30 * k, 26 * k, 0); ctx.closePath(); fs(c, k === 1 ? INK : null, 2); });
  ctx.globalAlpha = 0.5; E(-10 + f * 8, -70 - f * 10, 12, 9); fs('#4a4a5a', null); E(14 - f * 6, -84 - f * 6, 16, 11); fs('#4a4a5a', null); ctx.globalAlpha = 1; ctx.restore(); }
function lampostArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.2, 2.2);
  ctx.strokeStyle = '#3a3a4a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -80); ctx.quadraticCurveTo(0, -92, 14, -92); ctx.stroke(); E(0, -2, 10, 4); fs('#3a3a4a', INK, 1.5);
  rr(10, -96, 16, 8, 3); fs('#fff2a8', INK, 2); ctx.globalAlpha = 0.25; E(18, -80, 22, 18); fs('#fff2a8', null); ctx.globalAlpha = 1; ctx.restore(); }
function coneArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.2, 2.2); rr(-16, -6, 32, 6, 2); fs('#ff7a3a', INK, 2); poly([-10, -6, 10, -6, 4, -40, -4, -40]); fs('#ff7a3a', INK, 2); ctx.fillStyle = '#fff'; ctx.fillRect(-7, -22, 14, 5); ctx.restore(); }
function barrierArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.2, 2.2); poly([-34, 0, 34, 0, 26, -20, 20, -34, -20, -34, -26, -20]); fs('#8a8f98', INK, 2.5); ctx.fillStyle = YEL; ctx.fillRect(-20, -32, 12, 6); ctx.fillRect(4, -32, 12, 6); ctx.fillStyle = INK; ctx.fillRect(-8, -32, 12, 6); ctx.restore(); }
function cactusArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.2, 2.2);
  const arm = (ax, ah, dir) => { ctx.beginPath(); ctx.moveTo(dir * 8, -ah + 4); ctx.lineTo(ax, -ah + 4); ctx.lineTo(ax, -ah - 14); ctx.strokeStyle = INK; ctx.lineWidth = 15; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.strokeStyle = '#4fb356'; ctx.lineWidth = 10; ctx.stroke(); };
  arm(-20, 30, -1); arm(20, 38, 1); rr(-11, -56, 22, 56, 11); fs('#4fb356'); ctx.strokeStyle = '#2f7d34'; ctx.lineWidth = 1.5;
  for (let yy = -46; yy < -4; yy += 8) { ctx.beginPath(); ctx.moveTo(-6, yy); ctx.lineTo(-3, yy + 3); ctx.moveTo(6, yy + 2); ctx.lineTo(3, yy + 5); ctx.stroke(); }
  E(0, -58, 6, 5); fs(PINK, INK, 1.5); E(0, -58, 2, 2); fs(YEL, null); ctx.restore(); }
function flagArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.2, 2.2); ctx.strokeStyle = '#8a8a9a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -80); ctx.stroke(); poly([2, -80, 40, -72, 2, -56]); fs(PINK, INK, 2); heart(16, -70, 5); fs('#fff', INK, 1); ctx.restore(); }
function tentArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.6, 2.6); poly([-40, 0, 40, 0, 0, -44]); fs('#6b7a3a', INK, 2.5); poly([-10, 0, 10, 0, 0, -22]); fs('#3a3a2a', INK, 2); ctx.strokeStyle = '#4c5828'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -44); ctx.lineTo(0, -22); ctx.stroke(); ctx.restore(); }
function bushArt(cx, by, p) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.6, 2.6); const f = p.f || 0;
  ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = -5; i <= 5; i++) { const s = f * 7 + i * 5; ctx.beginPath(); ctx.moveTo(i * 5, 0); ctx.bezierCurveTo(i * 5 + Math.sin(s) * 14, -18, i * 5 - Math.sin(s * 1.3) * 16, -36, i * 4 + Math.cos(s) * 12, -50 - (i % 3) * 8); ctx.stroke(); }
  ctx.restore(); }
function rockArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.4, 2.4); poly([-30, 0, 30, 0, 26, -18, 10, -34, -12, -30, -28, -14]); fs('#6f6a7a', INK, 2.5); poly([-10, -28, 6, -32, 14, -20, -4, -18]); fs('#8f8a9a', null); ctx.restore(); }
function wreckArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.4, 2.4); poly([-40, 0, 36, 0, 30, -12, 12, -10, 6, -30, -14, -22, -22, -8]); fs('#8a8f98', INK, 2.5); ctx.strokeStyle = '#5a5f68'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-10, -20); ctx.lineTo(-2, -44); ctx.moveTo(6, -28); ctx.lineTo(20, -40); ctx.stroke(); ctx.fillStyle = YEL; ctx.fillRect(-30, -6, 10, 4); ctx.restore(); }
function smokeArt(cx, by, p) { ctx.save(); ctx.translate(cx, by); const f = p.f || 0; ctx.globalAlpha = 0.5; [[0, -40, 30], [-24 + f * 6, -70, 26], [22 - f * 5, -84, 30], [-6 + f * 4, -110, 34]].forEach(([x, y, r]) => { E(x, y, r, r * 0.8); fs('#5a5a6a', null); }); ctx.restore(); }
function deskArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.2, 2.2); rr(-36, -40, 72, 40, 4); fs('#7a3fb5', INK, 2.5); ctx.fillStyle = '#a97be8'; ctx.fillRect(-36, -40, 72, 6); rr(-10, -52, 20, 12, 2); fs('#fff6e0', INK, 1.5); txt('RECEPTION', 0, -46, 5, INK, 'center', null); rr(20, -50, 10, 10, 2); fs('#3a3a4a', INK, 1.5); ctx.restore(); }
function posterStandArt(cx, by) { ctx.save(); ctx.translate(cx, by); ctx.scale(2.2, 2.2); ctx.fillStyle = '#3a3a4a'; ctx.fillRect(-2, -30, 4, 30); rr(-22, -64, 44, 36, 3); fs('#fff6e0', INK, 2); txt('HAVE YOU TRIED', 0, -56, 5, INK, 'center', null); txt('NOT RUSHING?', 0, -47, 6, PINK, 'center', null); txt('- the clinic', 0, -36, 4, INK, 'center', null); ctx.restore(); }
function splatArt(cx, by) { ctx.save(); ctx.translate(cx, by - 40); E(0, 0, 26, 22); fs(CUM, CUM2, 2.5); [[-18, 10, 8], [20, -6, 9], [4, 22, 7], [-10, -18, 6]].forEach(([x, y, r]) => { E(x, y, r, r * 0.9); fs(CUM, CUM2, 1.5); }); rr(-4, 16, 8, 26, 4); fs(CUM, CUM2, 1.5); E(-8, -8, 6, 4); fs('#fff', null); ctx.restore(); }
function dropArt(cx, by) { E(cx, by - 16, 10, 12); fs(CUM, CUM2, 2); }
function sparkArt(cx, by) { E(cx, by - 16, 7, 7); fs(YEL, '#f0a91d', 1.5); }
function puffArt(cx, by) { ctx.globalAlpha = 0.6; E(cx, by - 16, 14, 11); fs('#c9c0b8', null); ctx.globalAlpha = 1; }
function sauceDropArt(cx, by) { E(cx, by - 16, 8, 10); fs('#e8311f', '#b8261a', 1.5); }
function nutArt(cx, by) { E(cx, by - 18, 15, 14); fs(SKIN, INK, 2.5); ctx.strokeStyle = SKIN2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx - 6, by - 14); ctx.quadraticCurveTo(cx, by - 20, cx + 6, by - 14); ctx.stroke(); ctx.strokeStyle = '#8a8a9a'; ctx.lineWidth = 2.5; E(cx + 9, by - 34, 5, 5); ctx.stroke(); }
function blastArt(cx, by) { const c = by - 64; const g = ctx.createRadialGradient(cx, c, 4, cx, c, 62); g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, '#fff2a8'); g.addColorStop(0.6, '#ff9a3a'); g.addColorStop(1, 'rgba(255,93,143,0)'); ctx.fillStyle = g; ctx.beginPath(); for (let i = 0; i < 18; i++) { const a = i / 18 * TAU, r = i % 2 ? 36 : 62; ctx.lineTo(cx + Math.cos(a) * r, c + Math.sin(a) * r); } ctx.closePath(); ctx.fill(); }
function shadowArt(cx, by) { const g = ctx.createRadialGradient(cx, by - 8, 2, cx, by - 8, 60); g.addColorStop(0, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; E(cx, by - 8, 60, 12); ctx.fill(); }
// ---- wall textures (64x64, drawn) + floor / ceiling textures (64x64, as pixel arrays for the floor caster) ----
const TEX = {}, FT = {};
const T = 64;
function mkTex(name, fn) {
  TEX[name] = bake(T * 2, T * 2, (c) => {
    c.scale(2, 2); fn(c);
    // baked lighting: darker at the foot and the top of every wall, a little grime, so walls sit on the floor instead of floating
    const g = c.createLinearGradient(0, 0, 0, T); g.addColorStop(0, 'rgba(0,0,0,0.22)'); g.addColorStop(0.18, 'rgba(0,0,0,0)'); g.addColorStop(0.75, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(20,0,20,0.38)');
    c.fillStyle = g; c.fillRect(0, 0, T, T);
    c.fillStyle = 'rgba(40,20,20,0.12)'; for (let i = 0; i < 6; i++) { E(((i * 41 + name.length * 13) % T), T - 4 - (i % 3) * 5, 8 + (i % 4) * 3, 3); c.fill(); }
  });
}
// film grain (drawn over the frame at low alpha, shifted every frame)
const GRAIN = (() => { const c = mkCanvas(128, 128), g = c.getContext('2d'), d = g.createImageData(128, 128); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); return c; })();
function mkFloor(name, fn) { FT[name] = bake(T * 2, T * 2, (c) => { c.scale(2, 2); fn(c); }); }
function speckle(c, col, n, a = 0.35, r = 1.5) { c.fillStyle = col; c.globalAlpha = a; for (let i = 0; i < n; i++) { E(((i * 37) % T) + ((i * 11) % 7), ((i * 53) % T) + ((i * 5) % 5), r, r * 0.7); c.fill(); } c.globalAlpha = 1; }
function brickTex(c1, c2, mortar) { return (c) => { c.fillStyle = mortar; c.fillRect(0, 0, T, T); for (let r = 0; r < 4; r++) for (let i = -1; i < 3; i++) { const off = r % 2 ? 16 : 0; rr(i * 32 + off + 1.5, r * 16 + 1.5, 29, 13, 2); fs(((r + i) % 3) ? c1 : c2, null); } speckle(c, '#fff', 14, 0.25); }; }
function bakeTextures() {
  // walls
  mkTex('brick', brickTex('#8a4a3a', '#9a5646', '#5a4a44'));
  mkTex('sand', (c) => { c.fillStyle = '#a88a5a'; c.fillRect(0, 0, T, T); for (let r = 0; r < 4; r++) for (let i = -1; i < 3; i++) { const off = r % 2 ? 16 : 0; E(i * 32 + off + 16, r * 16 + 8, 15, 6.5); fs(((r * 3 + i) % 2) ? '#d9c08a' : '#cdb27c', '#7a6238', 1.5); c.strokeStyle = '#b89a66'; c.lineWidth = 1; c.beginPath(); c.moveTo(i * 32 + off + 8, r * 16 + 8); c.lineTo(i * 32 + off + 24, r * 16 + 8); c.stroke(); } });
  mkTex('hesco', (c) => { c.fillStyle = '#c9ab6e'; c.fillRect(0, 0, T, T); speckle(c, '#a88a5a', 30, 0.5, 2); c.strokeStyle = '#6a6a6a'; c.lineWidth = 1.5; for (let i = 0; i <= T; i += 8) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, T); c.moveTo(0, i); c.lineTo(T, i); c.stroke(); } c.fillStyle = '#4a4a4a'; c.fillRect(0, 0, T, 3); c.fillRect(0, 61, T, 3); });
  mkTex('tent', (c) => { c.fillStyle = '#6b7a3a'; c.fillRect(0, 0, T, T); c.strokeStyle = '#5a6830'; c.lineWidth = 2; for (let i = -1; i < 5; i++) { c.beginPath(); c.moveTo(i * 16, 0); c.lineTo(i * 16 + 10, T); c.stroke(); } c.fillStyle = '#4c5828'; c.fillRect(0, 0, T, 4); speckle(c, '#7d8c48', 10, 0.5, 3); });
  mkTex('barracks', (c) => { c.fillStyle = '#b8a888'; c.fillRect(0, 0, T, T); c.fillStyle = '#9a8a6a'; c.fillRect(0, 0, T, 4); c.fillRect(0, 60, T, 4); const g = c.createLinearGradient(0, 14, 0, 42); g.addColorStop(0, '#7fd0f0'); g.addColorStop(1, '#bfe9f8'); rr(12, 14, 40, 28, 2); fs(g, INK, 2.5); c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(32, 14); c.lineTo(32, 42); c.moveTo(12, 28); c.lineTo(52, 28); c.stroke(); c.fillStyle = '#fff'; E(22, 22, 6, 3); c.fill(); c.fillStyle = '#8a4a2a'; c.fillRect(10, 42, 44, 3); });
  mkTex('crate', (c) => { c.fillStyle = '#c98b4b'; c.fillRect(0, 0, T, T); c.strokeStyle = '#7a4d20'; c.lineWidth = 3; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(0, i * 16 + 8); c.lineTo(T, i * 16 + 8); c.stroke(); } c.lineWidth = 4; c.strokeRect(2, 2, T - 4, T - 4); c.beginPath(); c.moveTo(2, 2); c.lineTo(T - 2, T - 2); c.moveTo(T - 2, 2); c.lineTo(2, T - 2); c.stroke(); rr(18, 26, 28, 12, 2); fs('#fff6e0', '#7a4d20', 1.5); txt('EGGPLANTS', 32, 32, 6, '#7a4d20', 'center', null); });
  mkTex('poster', (c) => { brickTex('#8a4a3a', '#9a5646', '#5a4a44')(c); rr(6, 4, 52, 56, 2); fs('#fff6e0', INK, 2); txt('WANTED', 32, 12, 9, '#c92a2a', 'center', null); ctx.save(); ctx.translate(32, 50); drawDick(0, 0, 0.42, { coat: true, onearm: true, angry: true, frown: true, still: true, look: 0 }); ctx.restore(); txt('JACKOFF', 32, 55, 7, INK, 'center', null); });
  mkTex('recruit', (c) => { c.fillStyle = '#a88a5a'; c.fillRect(0, 0, T, T); rr(5, 3, 54, 58, 2); fs('#fff6e0', INK, 2); txt('SHE', 32, 12, 10, '#c92a2a', 'center', null); txt('WANTS', 32, 22, 10, '#c92a2a', 'center', null); txt('YOU', 32, 32, 10, '#c92a2a', 'center', null); ctx.save(); ctx.translate(32, 58); drawDick(0, 0, 0.3, { hat: 'drill', stache: 1.3, angry: true, still: true, look: 0 }); ctx.restore(); });
  mkTex('hedge', (c) => { c.fillStyle = '#24401f'; c.fillRect(0, 0, T, T); c.fillStyle = '#2f5d2a'; for (let i = 0; i < 16; i++) { E((i * 23) % T, (i * 41) % T, 9, 7); c.fill(); } c.strokeStyle = '#1a2e16'; c.lineWidth = 2.5; c.lineCap = 'round'; for (let i = 0; i < 14; i++) { const x = (i * 29) % T, y = (i * 47) % T; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 8, y - 10, x - 8, y - 16, x + 3, y - 24); c.stroke(); } speckle(c, '#4fb356', 12, 0.5, 3); });
  mkTex('rock', (c) => { c.fillStyle = '#5a5566'; c.fillRect(0, 0, T, T); [[4, 4, 24, 20], [30, 2, 30, 26], [2, 28, 34, 30], [40, 32, 22, 28]].forEach(([x, y, w, h], i) => { rr(x, y, w, h, 6); fs(i % 2 ? '#6f6a7a' : '#7a7488', '#3a3644', 2); }); speckle(c, '#fff', 8, 0.15); });
  mkTex('fence', (c) => { c.fillStyle = '#2a3028'; c.fillRect(0, 0, T, T); c.fillStyle = '#8a6a44'; for (let i = 0; i < 4; i++) c.fillRect(2 + i * 16, 0, 10, T); c.fillRect(0, 12, T, 6); c.fillRect(0, 44, T, 6); c.strokeStyle = '#3a2a1a'; c.lineWidth = 2; for (let i = 0; i < 6; i++) { const x = (i * 27) % T; c.beginPath(); c.moveTo(x, 64); c.bezierCurveTo(x + 6, 52, x - 6, 46, x + 2, 36); c.stroke(); } });
  mkTex('steel', (c) => { c.fillStyle = '#b4b8ba'; c.fillRect(0, 0, T, T); c.fillStyle = '#8a8e92'; c.fillRect(0, 30, T, 4); c.fillRect(31, 0, 3, T); c.fillStyle = '#d0d4d6'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { E(8 + i * 16, 8 + j * 16, 2.5, 2.5); c.fill(); } c.fillStyle = 'rgba(138,90,58,0.5)'; c.fillRect(10, 34, 6, 30); c.fillRect(44, 4, 4, 22); c.fillStyle = '#b0c3cf'; c.fillRect(0, 0, T, 2); });
  mkTex('porthole', (c) => { TEX.steel && c.drawImage(TEX.steel, 0, 0); E(32, 28, 18, 18); fs('#1a2a4a', '#3a4a5a', 5); E(32, 28, 13, 13); fs('#0d1a33', null); E(26, 22, 4, 4); fs('#fff3c4', null); c.fillStyle = 'rgba(255,255,255,0.25)'; E(28, 24, 6, 3); c.fill(); });
  mkTex('container', (c) => { c.fillStyle = '#7a8088'; c.fillRect(0, 0, T, T); c.fillStyle = '#666c74'; for (let i = 0; i < 8; i++) c.fillRect(i * 8 + 4, 0, 4, T); c.fillStyle = '#fff'; c.globalAlpha = 0.9; rr(10, 22, 44, 20, 2); c.fill(); c.globalAlpha = 1; txt('BLUE BALLS', 32, 29, 7, '#1a2a4a', 'center', null); txt('SHIPPING', 32, 37, 6, '#1a2a4a', 'center', null); });
  mkTex('rust', (c) => { c.fillStyle = '#8a5a3a'; c.fillRect(0, 0, T, T); c.fillStyle = '#a8714a'; for (let i = 0; i < 9; i++) { E((i * 31) % T, (i * 47) % T, 4 + i % 8, 3 + i % 5); c.fill(); } c.fillStyle = '#5b3a24'; c.fillRect(0, 0, T, 3); c.fillRect(0, 61, T, 3); c.fillStyle = YEL; c.fillRect(0, 50, 16, 6); c.fillRect(32, 50, 16, 6); c.fillStyle = '#333'; c.fillRect(16, 50, 16, 6); c.fillRect(48, 50, 16, 6); });
  mkTex('tile', (c) => { c.fillStyle = '#b8dde6'; c.fillRect(0, 0, T, T); c.strokeStyle = '#4f6a74'; c.lineWidth = 4; for (let i = 0; i <= 2; i++) { c.beginPath(); c.moveTo(0, i * 32); c.lineTo(T, i * 32); c.moveTo(i * 32, 0); c.lineTo(i * 32, T); c.stroke(); } c.fillStyle = PINK; c.fillRect(0, 26, T, 10); c.fillStyle = '#7ed6df'; c.fillRect(0, 36, T, 4); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(4, 4, 10, 6); });
  mkTex('clinicposter', (c) => { c.fillStyle = '#b8dde6'; c.fillRect(0, 0, T, T); c.strokeStyle = '#4f6a74'; c.lineWidth = 4; c.strokeRect(0, 0, T, T); rr(6, 4, 52, 56, 2); fs('#fff6e0', INK, 2); txt('WASH', 32, 14, 9, '#7a3fb5', 'center', null); txt('YOUR', 32, 25, 9, '#7a3fb5', 'center', null); txt('HANDS', 32, 36, 9, '#7a3fb5', 'center', null); txt('(and everything else)', 32, 50, 5, INK, 'center', null); });
  mkTex('door', (c) => { c.fillStyle = '#b8dde6'; c.fillRect(0, 0, T, T); rr(8, 6, 48, 58, 3); fs('#7a3fb5', INK, 2.5); rr(16, 12, 32, 16, 2); fs('#fff6e0', INK, 1.5); txt('RM 69', 32, 20, 8, INK, 'center', null); E(46, 40, 3, 3); fs(YEL, INK, 1); rr(18, 34, 28, 22, 2); fs('rgba(255,255,255,0.35)', null); });
  mkTex('velvet', (c) => { c.fillStyle = '#5a4a3a'; c.fillRect(0, 0, T, T); c.fillStyle = '#6a5846'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { E(8 + i * 16 + (j % 2) * 8, 8 + j * 16, 6, 6); c.fill(); } c.fillStyle = YEL; c.fillRect(0, 0, T, 3); c.fillRect(0, 61, T, 3); });
  mkTex('concrete', (c) => { const g = c.createLinearGradient(0, 0, 0, T); g.addColorStop(0, '#9a9a94'); g.addColorStop(0.55, '#8a8a84'); g.addColorStop(0.56, '#76767a'); g.addColorStop(1, '#5e5e62'); c.fillStyle = g; c.fillRect(0, 0, T, T); c.fillStyle = '#fff'; E(18, 12, 10, 5); c.fill(); E(44, 22, 8, 4); c.fill(); c.strokeStyle = '#5a5f68'; c.lineWidth = 2; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(i * 16, 8); c.lineTo(i * 16, 36); c.stroke(); } c.beginPath(); c.moveTo(0, 8); c.lineTo(T, 8); c.moveTo(0, 22); c.lineTo(T, 22); c.stroke(); c.fillStyle = '#5a5f68'; c.fillRect(0, 35, T, 3); c.fillStyle = YEL; c.fillRect(0, 42, 20, 5); c.fillStyle = '#333'; c.fillRect(20, 42, 20, 5); c.fillStyle = YEL; c.fillRect(40, 42, 24, 5); });
  mkTex('tower', (c) => { c.fillStyle = '#5a6a64'; c.fillRect(0, 0, T, T); c.strokeStyle = '#3a4640'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(T, T); c.moveTo(T, 0); c.lineTo(0, T); c.moveTo(0, 32); c.lineTo(T, 32); c.stroke(); c.fillStyle = '#8a1a1a'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { E(8 + i * 16, 8 + j * 16, 2, 2); c.fill(); } });
  mkTex('wood', (c) => { c.fillStyle = '#b07a48'; c.fillRect(0, 0, T, T); c.strokeStyle = '#7a4d20'; c.lineWidth = 2; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(0, i * 16 + 8); c.lineTo(T, i * 16 + 8); c.stroke(); } c.fillStyle = '#7a4d20'; for (let i = 0; i < 6; i++) { E((i * 29) % T, (i * 43) % T, 2, 3); c.fill(); } });
  mkTex('gate', (c) => { c.fillStyle = '#333'; c.fillRect(0, 0, T, T); c.fillStyle = YEL; for (let i = -1; i < 5; i++) { poly([i * 16, 0, i * 16 + 8, 0, i * 16 + 8 + 16, T, i * 16 + 16, T]); c.fill(); } heart(32, 32, 12); fs(PINK, INK, 3); });
  mkTex('cloud', (c) => { const g = c.createLinearGradient(0, 0, 0, T); g.addColorStop(0, '#7fd0f0'); g.addColorStop(1, '#bfe9f8'); c.fillStyle = g; c.fillRect(0, 0, T, T); c.fillStyle = '#fff'; E(20, 20, 14, 8); c.fill(); E(46, 40, 12, 7); c.fill(); E(10, 50, 9, 5); c.fill(); });
  mkTex('containerrust', (c) => { c.fillStyle = '#8a5a3a'; c.fillRect(0, 0, T, T); c.fillStyle = '#74492e'; for (let i = 0; i < 8; i++) c.fillRect(i * 8 + 4, 0, 4, T); speckle(c, '#5a3a24', 20, 0.5, 3); c.fillStyle = '#fff'; c.globalAlpha = 0.8; rr(12, 24, 40, 14, 2); c.fill(); c.globalAlpha = 1; txt('RUBBER CO.', 32, 31, 7, '#3a2a1a', 'center', null); });
  mkTex('corrugated', (c) => { c.fillStyle = '#4f6478'; c.fillRect(0, 0, T, T); for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#5d7488' : '#43566a'; c.fillRect(i * 4, 0, 2, T); } c.fillStyle = 'rgba(30,30,30,0.25)'; c.fillRect(0, T - 10, T, 10); speckle(c, '#8a6a4a', 10, 0.4, 2); });
  mkTex('plywood', (c) => { c.fillStyle = '#c8a878'; c.fillRect(0, 0, T, T); c.strokeStyle = 'rgba(120,90,50,0.35)'; c.lineWidth = 1; for (let i = 0; i < 10; i++) { c.beginPath(); c.moveTo(0, i * 7 + 2); c.bezierCurveTo(20, i * 7 + 5, 40, i * 7 - 1, T, i * 7 + 3); c.stroke(); } c.fillStyle = '#9a7a4a'; c.fillRect(31, 0, 2, T); c.strokeStyle = '#c42a2a'; c.lineWidth = 4; c.beginPath(); c.moveTo(12, 40); c.lineTo(44, 40); c.moveTo(34, 30); c.lineTo(46, 40); c.lineTo(34, 50); c.stroke(); });
  mkTex('panelblock', (c) => { c.fillStyle = '#8e8e88'; c.fillRect(0, 0, T, T); c.strokeStyle = '#6e6e68'; c.lineWidth = 2; c.strokeRect(1, 1, 62, 62); c.fillStyle = '#2a2e30'; c.fillRect(14, 12, 36, 26); c.strokeStyle = '#b8b8b0'; c.lineWidth = 2; c.strokeRect(14, 12, 36, 26); c.beginPath(); c.moveTo(32, 12); c.lineTo(32, 38); c.stroke(); c.fillStyle = 'rgba(60,50,40,0.3)'; c.fillRect(16, 38, 4, 24); speckle(c, '#6a6a60', 18, 0.4, 3); });
  // floors
  mkFloor('sandfloor', (c) => { c.fillStyle = '#c9a86a'; c.fillRect(0, 0, T, T); speckle(c, '#a88a5a', 40, 0.6, 2); speckle(c, '#e0c48a', 20, 0.6, 1.5); c.strokeStyle = 'rgba(120,90,50,0.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 40); c.quadraticCurveTo(32, 30, 64, 40); c.stroke(); });
  mkFloor('gravel', (c) => { c.fillStyle = '#7a756a'; c.fillRect(0, 0, T, T); speckle(c, '#5a564e', 60, 0.7, 2); speckle(c, '#9a958a', 40, 0.6, 1.5); speckle(c, '#4a4a3e', 12, 0.4, 5); });
  mkFloor('dirt', (c) => { c.fillStyle = '#3a4a2a'; c.fillRect(0, 0, T, T); speckle(c, '#2a3620', 40, 0.7, 3); speckle(c, '#5a6a3a', 24, 0.5, 2); });
  mkFloor('grass', (c) => { c.fillStyle = '#2f3f22'; c.fillRect(0, 0, T, T); c.strokeStyle = '#1f1710'; c.lineWidth = 2; for (let i = 0; i < 26; i++) { const x = (i * 29) % T, y = (i * 43) % T; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 5, y - 6, x + 2, y - 12); c.stroke(); } speckle(c, '#4fb356', 8, 0.4, 2); });
  mkFloor('water', (c) => { c.fillStyle = '#2f6a9a'; c.fillRect(0, 0, T, T); c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 2; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, 6 + i * 11); for (let x = 0; x <= T; x += 8) c.lineTo(x, 6 + i * 11 + Math.sin(x * 0.4 + i) * 2); c.stroke(); } });
  mkFloor('deck', (c) => { c.fillStyle = '#4a5a6a'; c.fillRect(0, 0, T, T); c.strokeStyle = '#2a3440'; c.lineWidth = 2; c.strokeRect(1, 1, 62, 62); c.strokeRect(1, 1, 31, 31); c.strokeRect(32, 32, 31, 31); c.fillStyle = '#5f7080'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { E(8 + i * 16, 8 + j * 16, 3, 3); c.fill(); } speckle(c, '#8a5a3a', 12, 0.5, 3); });
  mkFloor('lino', (c) => { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { c.fillStyle = (i + j) % 2 ? '#c4c6c2' : '#dcdcd6'; c.fillRect(i * 32, j * 32, 32, 32); } c.strokeStyle = '#a8aaa6'; c.lineWidth = 1.5; c.strokeRect(0, 0, 32, 32); c.strokeRect(32, 32, 32, 32); speckle(c, '#fff', 6, 0.7, 2); });
  mkFloor('carpet', (c) => { c.fillStyle = '#4a5566'; c.fillRect(0, 0, T, T); c.fillStyle = '#56627a'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { E(8 + i * 16 + (j % 2) * 8, 8 + j * 16, 5, 5); c.fill(); } speckle(c, '#4a2d7a', 20, 0.5, 2); });
  mkFloor('steps', (c) => { c.fillStyle = '#6a7a8a'; c.fillRect(0, 0, T, T); c.fillStyle = '#3a4a5a'; for (let i = 0; i < 4; i++) c.fillRect(0, i * 16, T, 5); c.fillStyle = YEL; for (let i = 0; i < 4; i++) c.fillRect(0, i * 16 + 5, T, 2); });
  mkFloor('walkway', (c) => { c.fillStyle = '#4a4a5a'; c.fillRect(0, 0, T, T); c.strokeStyle = '#2a2a3a'; c.lineWidth = 2; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(i * 8, 0); c.lineTo(i * 8, T); c.stroke(); } poly([20, 20, 44, 32, 20, 44]); fs(YEL, null); });
  mkFloor('asphalt', (c) => { c.fillStyle = '#4a4f58'; c.fillRect(0, 0, T, T); speckle(c, '#2a2f38', 40, 0.6, 2); speckle(c, '#6a6f78', 20, 0.5, 1.5); c.fillStyle = YEL; c.fillRect(0, 28, 36, 8); });
  mkFloor('rubble', (c) => { c.fillStyle = '#5a5f68'; c.fillRect(0, 0, T, T); speckle(c, '#3a3f48', 30, 0.7, 4); speckle(c, '#8a8f98', 20, 0.6, 3); c.fillStyle = '#c92a2a'; c.fillRect(40, 10, 10, 6); });
  // ceilings (indoor levels)
  mkFloor('ceilsteel', (c) => { c.fillStyle = '#2a3a4a'; c.fillRect(0, 0, T, T); c.fillStyle = '#3a4a5a'; c.fillRect(0, 26, T, 12); c.fillRect(26, 0, 12, T); c.strokeStyle = '#1a2430'; c.lineWidth = 2; c.strokeRect(0, 26, T, 12); c.strokeRect(26, 0, 12, T); rr(22, 28, 20, 8, 2); fs('#fff2a8', '#c0a860', 1.5); });
  mkFloor('ceiltile', (c) => { c.fillStyle = '#e6e6ea'; c.fillRect(0, 0, T, T); c.strokeStyle = '#b8b8c4'; c.lineWidth = 2; c.strokeRect(0, 0, 32, 32); c.strokeRect(32, 32, 32, 32); c.strokeRect(32, 0, 32, 32); c.strokeRect(0, 32, 32, 32); rr(8, 40, 48, 16, 2); fs('#fff', '#c8c8d4', 2); rr(12, 44, 40, 8, 1); fs('#fff8d8', null); });
  mkFloor('ceilcamp', (c) => { c.fillStyle = '#6b7a3a'; c.fillRect(0, 0, T, T); c.strokeStyle = '#4c5828'; c.lineWidth = 2; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(i * 16, 0); c.lineTo(i * 16 + 12, T); c.stroke(); } });
}

export { allyArt, ammoBoxArt, bakeTextures, barrelArt, barrierArt, beeArt, bigPubeArt, blastArt, boardArt, bossArt, bottleArt, brickTex, bushArt, cactusArt, carArt, chairArt, chiliArt, condomArt, coneArt, coolerArt, crabArt, crateArt, crateStackArt, deskArt, drawDick, dropArt, eggplantArt, fireArt, flagArt, globArt, heliArt, iceArt, lampostArt, lanternArt, lifeRingArt, magRackArt, mkFloor, mkTex, nutArt, palmArt, pistolArt, plantArt, posterStandArt, prickArt, pubeArt, puddleArt, puffArt, rockArt, sandbagsArt, sauceDropArt, sergeantArt, shadowArt, signArt, smokeArt, sparkArt, speckle, splatArt, stingerArt, targetArt, tentArt, ticketArt, tiresArt, trapArt, valveArt, wreckArt, TEX, FT, GRAIN, T };
