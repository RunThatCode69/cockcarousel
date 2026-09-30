// Procedural 3D models. Everything is primitives + toon shading + an ink outline (inverted hull), so it still reads as Cock Carousel.
import * as THREE from 'three';
import { mergeGeometries as _merge } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { INK, SKIN, SKIN2, HEAD, HEAD2, PINK, YEL, PURP, CUM, bake, E, fs, rr, heart, txt, poly, ctx } from './art2d.js';

// 3-step toon ramp
const ramp = (() => { const d = new Uint8Array([90, 170, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const matCache = new Map();
export function toon(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (!o.unique && matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshToonMaterial(Object.assign({ color, gradientMap: ramp }, o.opts || {}));
  if (o.transparent) { m.transparent = true; m.opacity = o.transparent; m.depthWrite = false; }
  if (o.emissive) { m.emissive = new THREE.Color(o.emissive); m.emissiveIntensity = o.ei || 0.6; }
  if (!o.unique) matCache.set(key, m);
  return m;
}
const inkMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
// a mesh plus its ink outline
export function ink(geo, mat, thick = 0.035, outline = true) {
  const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true;
  if (outline) {
    const o = new THREE.Mesh(geo, inkMat);
    geo.computeBoundingSphere(); const r = geo.boundingSphere.radius || 1;
    o.scale.setScalar(1 + thick / r); o.castShadow = false; o.userData.outline = true; m.add(o);
  }
  return m;
}
const G = {
  sph: new THREE.SphereGeometry(1, 32, 22), sphLo: new THREE.SphereGeometry(1, 10, 8),
  cap: (r, l) => new THREE.CapsuleGeometry(r, l, 10, 24), cyl: (r1, r2, h, s = 12) => new THREE.CylinderGeometry(r1, r2, h, s),
  box: (x, y, z) => new THREE.BoxGeometry(x, y, z),
};
function shade(hex, k) { const c = new THREE.Color(hex); const h = {}; c.getHSL(h); c.setHSL(h.h, Math.min(1, h.s * 1.1), Math.max(0, Math.min(1, h.l + k))); return '#' + c.getHexString(); }
function at(obj, x, y, z, sx, sy, sz) { obj.position.set(x, y, z); if (sx !== undefined) obj.scale.set(sx, sy === undefined ? sx : sy, sz === undefined ? sx : sz); return obj; }
function sphere(r, color, x, y, z, sx = 1, sy = 1, sz = 1, outline = true, mat) { const m = ink(G.sph, mat || toon(color), 0.03 / r, outline); m.position.set(x, y, z); m.scale.set(r * sx, r * sy, r * sz); return m; }
function cylBetween(a, b, r, color, outline = true, mat) {
  const d = new THREE.Vector3().subVectors(b, a), L = d.length();
  const m = ink(G.cyl(r, r, L, 10), mat || toon(color), 0.03, outline);
  m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m;
}
// a face texture painted with the 2D helpers: eyes, blush, mouth. Mapped onto a small curved plane on the front of the shaft.
const faceCache = new Map();
export function faceTex(kind) {
  if (faceCache.has(kind)) return faceCache.get(kind);
  const c = bake(256, 256, () => { ctx.scale(2, 2);   // drawn at 2x so faces stay crisp up close
    const eyes = (angry, dead, look = 0) => {
      [[-24, 48], [24, 48]].forEach(([ex, ey], i) => {
        if (dead) { ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(64 + ex - 10, ey - 10); ctx.lineTo(64 + ex + 10, ey + 10); ctx.moveTo(64 + ex + 10, ey - 10); ctx.lineTo(64 + ex - 10, ey + 10); ctx.stroke(); return; }
        E(64 + ex, ey, 16, 18); fs('#fff', INK, 5); E(64 + ex + look, ey + 2, 8, 9); fs(INK, null); E(64 + ex + look + 3, ey - 3, 3, 3); fs('#fff', null);
        if (angry) { ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(64 + ex - 18, ey - 26 + (i ? 6 : 0)); ctx.lineTo(64 + ex + 18, ey - 20 - (i ? 6 : 0)); ctx.stroke(); }
      });
      E(28, 80, 11, 7); fs('#ff9bb5', null); E(100, 80, 11, 7); fs('#ff9bb5', null);
    };
    const smile = () => { ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(44, 86); ctx.quadraticCurveTo(64, 108, 84, 86); ctx.stroke(); };
    const yell = () => { E(64, 96, 16, 18); fs('#7a2a4a', INK, 5); E(64, 104, 10, 6); fs('#ff9bb5', null); };
    const frown = () => { ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(46, 102); ctx.quadraticCurveTo(64, 84, 82, 102); ctx.stroke(); };
    const stache = (col = INK, k = 1) => { ctx.strokeStyle = col; ctx.lineWidth = 12 * k; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(64, 74); ctx.quadraticCurveTo(64 - 26 * k, 60, 64 - 44 * k, 84); ctx.moveTo(64, 74); ctx.quadraticCurveTo(64 + 26 * k, 60, 64 + 44 * k, 84); ctx.stroke(); };
    const talk = kind.endsWith('_talk'), base = talk ? kind.slice(0, -5) : kind;
    if (talk) {   // mouth open mid-word, for lip flaps while they're on the radio
      switch (base) {
        case 'prick': eyes(false); yell(); stache('#e6e0ea', 1.35); break;
        case 'sarge': eyes(true); frown(); stache(INK, 1); break;
        case 'boss': case 'bossyell': eyes(true); yell(); ctx.strokeStyle = '#c96a80'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(84, 26); ctx.lineTo(100, 70); ctx.stroke(); break;
        default: eyes(base === 'angry'); yell();
      }
      return;
    }
    switch (kind) {
      case 'happy': eyes(); smile(); break;
      case 'lady': [[-24, 48], [24, 48]].forEach(([ex, ey]) => { E(64 + ex, ey, 13, 15); fs('#fff', INK, 4); E(64 + ex, ey + 2, 7, 8); fs(INK, null); ctx.strokeStyle = INK; ctx.lineWidth = 4; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(64 + ex + k * 8, ey - 14); ctx.lineTo(64 + ex + k * 11, ey - 22); ctx.stroke(); } }); E(28, 78, 10, 6); fs('#ff9bb5', null); E(100, 78, 10, 6); fs('#ff9bb5', null); ctx.strokeStyle = '#d42a5a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(48, 90); ctx.quadraticCurveTo(64, 104, 80, 90); ctx.stroke(); break;
      case 'yell': eyes(true); yell(); break;
      case 'angry': eyes(true); frown(); break;
      case 'dead': eyes(false, true); yell(); break;
      case 'sarge': eyes(true); yell(); stache(INK, 1); break;
      case 'prick': eyes(false); frown(); stache('#e6e0ea', 1.35); break;
      case 'boss': eyes(true); frown(); ctx.strokeStyle = '#c96a80'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(84, 26); ctx.lineTo(100, 70); ctx.stroke(); break;
      case 'bossyell': eyes(true); yell(); break;
    }
  });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; faceCache.set(kind, t); return t;
}
function facePlate(kind, r = 0.15, y = 0.52) {
  const g = new THREE.CylinderGeometry(r * 1.01, r * 1.01, r * 2.2, 16, 1, true, -Math.PI * 0.42, Math.PI * 0.84);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: faceTex(kind), transparent: true, depthWrite: false }));
  m.position.y = y; m.renderOrder = 2; m.userData.face = true;   // theta 0 is +z, so the face looks forward with no rotation
  return m;
}

// ---------- the dick. o: { skin, head, hat, stache, face, coat, onearm, scale, helmetC, cigar, bandana, pistol } ----------
export function makeDick(o = {}) {
  const skin = o.skin || SKIN, head = o.head || HEAD;
  const root = new THREE.Group(), body = new THREE.Group();
  root.add(body);
  // balls
  body.add(sphere(0.155, skin, -0.12, 0.15, 0.02)); body.add(sphere(0.155, skin, 0.12, 0.15, 0.02));
  // shaft (leans back a touch)
  const shaft = new THREE.Group(); shaft.position.y = 0.2; shaft.rotation.x = -0.1; body.add(shaft);
  const s = ink(G.cap(0.15, 0.5), toon(skin), 0.03); s.position.y = 0.36; shaft.add(s);
  const hd = sphere(0.175, head, 0, 0.72, 0, 1, 0.82, 1); shaft.add(hd);
  const ridge = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.022, 8, 20), toon(HEAD2)); ridge.rotation.x = Math.PI / 2; ridge.position.y = 0.63; shaft.add(ridge);
  const shine = sphere(0.045, '#ffffff', 0.05, 0.8, 0.12, 1.3, 0.7, 0.5, false, new THREE.MeshBasicMaterial({ color: '#fff' })); shaft.add(shine);
  const face = facePlate(o.face || 'happy'); face.position.y = o.coat ? 0.47 : 0.36; shaft.add(face);   // fur collar sits high: lift the face above it
  if (o.veins !== false) {   // raised veins wrapping round the shaft (skipped on the front, where the face is)
    const vm = toon(o.veinC || '#b8546e');
    [[2.2, 0], [3.3, 1], [4.1, 2], [1.4, 3], ...(o.face === 'boss' ? [[1.2, 4], [-1.2, 5]] : [])].forEach(([ang, i]) => {   // the boss gets veins right up his face
      const pts = []; for (let k = 0; k <= 10; k++) { const q = k / 10, a = ang + Math.sin(q * 6 + i) * 0.35; pts.push(new THREE.Vector3(Math.sin(a) * 0.152, 0.14 + q * 0.42, Math.cos(a) * 0.152)); }
      shaft.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, o.face === 'boss' ? 0.024 : 0.016, 6), vm));
      const b = []; for (let k = 0; k <= 5; k++) { const q = k / 5, a = ang + 0.5 + q * 0.5; b.push(new THREE.Vector3(Math.sin(a) * 0.151, 0.3 + i * 0.05 + q * 0.12, Math.cos(a) * 0.151)); }
      shaft.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(b), 10, 0.011, 5), vm));
    });
  }
  // arms
  const arms = [];
  [[-1, 'L'], [1, 'R']].forEach(([sx, n]) => {
    if (o.onearm && sx < 0) { const nub = sphere(0.06, '#ffffff', -0.17, 0.46, 0); body.add(nub); return; }
    const arm = new THREE.Group(); arm.position.set(sx * 0.14, 0.46, 0); body.add(arm);
    arm.add(cylBetween(new THREE.Vector3(0, 0, 0), new THREE.Vector3(sx * 0.17, -0.02, 0.02), 0.035, SKIN2));
    const hand = sphere(0.055, skin, sx * 0.19, -0.02, 0.02); arm.add(hand); arm.userData.hand = hand;
    arms.push(arm);
  });
  // costume
  if (o.hat === 'helmet') { const h = sphere(0.2, o.helmetC || '#5b6b3c', 0, 0.78, 0, 1, 0.6, 1); shaft.add(h); }
  if (o.hat === 'boonie') { shaft.add(at(ink(G.cyl(0.3, 0.3, 0.03, 18), toon('#5d6b45')), 0, 0.8, 0)); shaft.add(at(ink(G.cyl(0.15, 0.17, 0.14, 14), toon('#5d6b45')), 0, 0.88, 0)); }
  if (o.hat === 'drill') { shaft.add(at(ink(G.cyl(0.27, 0.27, 0.025, 18), toon('#6b7a3a')), 0, 0.8, 0)); shaft.add(at(ink(G.cyl(0.13, 0.17, 0.16, 14), toon('#6b7a3a')), 0, 0.9, 0)); }
  if (o.hat === 'beanie') shaft.add(sphere(0.18, '#3a3a4a', 0, 0.8, 0, 1, 0.6, 1));
  if (o.bandana) { const b = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.03, 8, 20), toon('#c92a2a')); b.rotation.x = Math.PI / 2; b.position.y = 0.66; shaft.add(b); }
  if (o.cigar) { const c = cylBetween(new THREE.Vector3(0.05, 0.3, 0.13), new THREE.Vector3(0.16, 0.28, 0.24), 0.018, '#6b4a2a'); shaft.add(c); shaft.add(sphere(0.02, '#ff7a3a', 0.165, 0.28, 0.245, 1, 1, 1, false, new THREE.MeshBasicMaterial({ color: '#ff7a3a' }))); }
  if (o.coat) {   // villain coat: long black leather, white fox-fur collar, gold buttons (the old brown fur looked like... something else)
    const lea = toon('#1c1b20'), fur = toon('#f2ede4'), gold = toon('#e8b830');
    const coat = ink(new THREE.CylinderGeometry(0.2, 0.3, 0.46, 20, 1, true), lea, 0.02); coat.position.y = 0.22; body.add(coat);
    const lap = ink(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 20), lea, 0.015); lap.position.y = 0.44; body.add(lap);
    const collar = ink(new THREE.TorusGeometry(0.19, 0.06, 10, 22), fur, 0.015); collar.rotation.x = Math.PI / 2; collar.position.y = 0.44; body.add(collar);
    for (let i = 0; i < 3; i++) body.add(sphere(0.022, null, 0, 0.14 + i * 0.12, 0.22 + i * -0.02, 1, 1, 0.5, false, gold));
  }
  if (o.pistol) { const p = ink(G.box(0.05, 0.06, 0.16), toon('#3a3a4a')); p.position.set(0.19, 0.44, 0.08); body.add(p); root.userData.pistol = p; }
  if (o.gear) {   // plate carrier, mag pouches, a radio with an antenna, a belt
    const vc = toon(o.gearC || '#4f5a3a'), dk = toon('#2e3226');
    const vest = ink(new THREE.CylinderGeometry(0.17, 0.18, 0.18, 14), vc, 0.012); vest.position.y = 0.07; shaft.add(vest);
    for (let i = -1; i <= 1; i++) { const pch = ink(G.box(0.07, 0.09, 0.05), dk, 0.006); pch.position.set(i * 0.075, 0.06, 0.17); shaft.add(pch); }
    const rad = ink(G.box(0.05, 0.08, 0.04), dk, 0.005); rad.position.set(-0.15, 0.1, -0.06); shaft.add(rad);
    shaft.add(cylBetween(new THREE.Vector3(-0.16, 0.14, -0.07), new THREE.Vector3(-0.22, 0.5, -0.1), 0.006, '#1a1a1a', false));
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 6, 20), dk); belt.rotation.x = Math.PI / 2; belt.position.y = 0.26; body.add(belt);
    if (o.hat === 'helmet') { const nvg = ink(G.box(0.08, 0.05, 0.06), dk, 0.005); nvg.position.set(0, 0.9, 0.12); shaft.add(nvg); }
  }
  let heldGun = null;
  if (o.gun) {   // everybody's rifle is a dick too. obviously.
    heldGun = new THREE.Group(); heldGun.position.set(0.04, 0.32, 0.27); body.add(heldGun);
    const sk = toon(o.skin || SKIN);
    const sh = ink(G.cyl(0.035, 0.035, o.gun === 'sniper' ? 0.62 : 0.4, 10), sk, 0.008); sh.rotation.x = Math.PI / 2; sh.position.z = o.gun === 'sniper' ? 0.16 : 0.08; heldGun.add(sh);
    const tip = ink(new THREE.SphereGeometry(0.048, 10, 8), toon(HEAD), 0.008); tip.position.z = o.gun === 'sniper' ? 0.48 : 0.3; heldGun.add(tip);
    const grip = ink(G.box(0.03, 0.08, 0.04), toon('#2a2626'), 0.004); grip.position.set(0, -0.05, -0.04); grip.rotation.x = 0.3; heldGun.add(grip);
    [-1, 1].forEach(sd => heldGun.add(at(ink(new THREE.SphereGeometry(0.04, 8, 6), sk, 0.006), sd * 0.03, -0.045, 0.0)));
    if (o.gun === 'sniper') { const sc2 = ink(G.cyl(0.02, 0.02, 0.16, 8), toon('#1e1e1e'), 0.003); sc2.rotation.x = Math.PI / 2; sc2.position.set(0, 0.05, 0.08); heldGun.add(sc2); }
  }
  const sc = o.scale || 1; root.scale.setScalar(sc);
  root.userData = Object.assign(root.userData, { body, shaft, arms, face, kind: 'dick', faceKind: o.face || 'happy', baseFace: o.face || 'happy', heldGun });
  return root;
}
export function setFace(model, kind) { const f = model.userData.face; if (!f || model.userData.faceKind === kind) return; f.material.map = faceTex(kind); f.material.needsUpdate = true; model.userData.faceKind = kind; }

// ---------- enemies ----------
function eyeStalk(parent, x, y, z) {
  parent.add(cylBetween(new THREE.Vector3(x, y, z), new THREE.Vector3(x, y + 0.14, z), 0.018, '#d6362e'));
  parent.add(sphere(0.05, '#ffffff', x, y + 0.17, z)); parent.add(sphere(0.025, INK, x, y + 0.17, z + 0.035, 1, 1, 1, false));
}
export function makeCrab() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body); body.position.y = 0.2;
  body.add(sphere(0.3, '#f04e3e', 0, 0, 0, 1.15, 0.55, 0.9)); body.add(sphere(0.2, '#ff7b6b', 0, -0.03, 0.12, 1, 0.4, 0.6, false));
  eyeStalk(body, -0.08, 0.12, 0.16); eyeStalk(body, 0.08, 0.12, 0.16);
  const legs = [];
  for (let s = -1; s <= 1; s += 2) for (let i = 0; i < 3; i++) { const g = new THREE.Group(); g.position.set(s * 0.28, 0, -0.1 + i * 0.12); g.add(cylBetween(new THREE.Vector3(0, 0, 0), new THREE.Vector3(s * 0.2, -0.2, 0.02), 0.025, '#d6362e')); body.add(g); legs.push(g); }
  const claws = [];
  for (let s = -1; s <= 1; s += 2) { const g = new THREE.Group(); g.position.set(s * 0.32, 0.08, 0.2); g.add(sphere(0.1, '#f04e3e', 0, 0, 0.05, 1, 0.8, 1.2)); const pin = ink(new THREE.ConeGeometry(0.05, 0.16, 8), toon('#f04e3e')); pin.rotation.x = Math.PI / 2; pin.position.set(s * 0.03, 0.03, 0.18); g.add(pin); body.add(g); claws.push(g); }
  root.userData = { body, legs: [], claws, kind: 'crab' }; return root;
}
const stripeTex = (() => { const c = bake(64, 64, () => { ctx.fillStyle = YEL; ctx.fillRect(0, 0, 64, 64); ctx.fillStyle = INK; ctx.fillRect(18, 0, 12, 64); ctx.fillRect(42, 0, 12, 64); }); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
export function makeBee() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body); body.position.y = 0.55;
  const b = ink(G.sph, new THREE.MeshToonMaterial({ map: stripeTex, gradientMap: ramp }), 0.03); b.scale.set(0.3, 0.2, 0.2); b.rotation.y = Math.PI / 2; body.add(b);
  body.add(sphere(0.14, YEL, 0, 0.02, 0.3)); body.add(sphere(0.045, '#fff', -0.06, 0.06, 0.41)); body.add(sphere(0.045, '#fff', 0.06, 0.06, 0.41));
  body.add(sphere(0.022, INK, -0.06, 0.06, 0.45, 1, 1, 1, false)); body.add(sphere(0.022, INK, 0.06, 0.06, 0.45, 1, 1, 1, false));
  const sting = ink(new THREE.ConeGeometry(0.05, 0.16, 8), toon(INK)); sting.rotation.x = -Math.PI / 2; sting.position.z = -0.36; body.add(sting);
  const wingMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7, side: THREE.DoubleSide });
  const wings = [-1, 1].map(s => { const w = new THREE.Mesh(new THREE.CircleGeometry(0.2, 16), wingMat); w.scale.set(1, 0.5, 1); w.position.set(s * 0.16, 0.2, 0); w.rotation.x = -Math.PI / 2; body.add(w); return w; });
  root.userData = { body, wings, kind: 'bee' }; return root;
}
export function makeCondom() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const latex = toon('#c8e6ff', { transparent: 0.72 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 10, 24), toon('#dcefff')); ring.rotation.x = Math.PI / 2; ring.position.y = 0.06; body.add(ring);
  const s = ink(G.cap(0.18, 0.6), latex, 0.03); s.position.y = 0.46; body.add(s);
  body.add(sphere(0.07, null, 0, 0.94, 0, 1, 1.2, 1, true, latex));
  body.add(sphere(0.2, '#5b6b3c', 0, 0.8, 0, 1, 0.55, 1));
  const face = facePlate('angry', 0.19, 0.48); body.add(face);
  const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * 0.18, 0.5, 0); a.add(cylBetween(new THREE.Vector3(0, 0, 0), new THREE.Vector3(s * 0.2, -0.05, 0.1), 0.04, '#a9cbe6')); body.add(a); return a; });
  // the RUBBER-47: a stubby launcher with a drum of rolled condoms and one loaded at the muzzle
  const gun = new THREE.Group(); gun.position.set(0, 0.46, 0.24); body.add(gun);
  const olive = toon('#4a5638'), blk = toon('#2a2a2e');
  const barrel = ink(G.cyl(0.05, 0.05, 0.36, 12), olive, 0.01); barrel.rotation.x = Math.PI / 2; barrel.position.z = 0.1; gun.add(barrel);
  const drum = ink(G.cyl(0.085, 0.085, 0.09, 14), blk, 0.01); drum.rotation.z = Math.PI / 2; drum.position.set(0, -0.06, -0.02); gun.add(drum);
  for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.012, 6, 12), toon('#dcefff')); r.position.set(0.05, -0.06 + (i - 1) * 0.045, -0.02); r.rotation.y = Math.PI / 2; gun.add(r); }
  const grip = ink(G.box(0.035, 0.09, 0.04), blk, 0.006); grip.position.set(0, -0.08, -0.1); grip.rotation.x = 0.35; gun.add(grip);
  const load = makeCondomShot(); load.rotation.y = Math.PI; load.position.z = 0.3; gun.add(load);
  arms.forEach(a => a.rotation.set(0, (a.position.x > 0 ? -1 : 1) * 0.9, 0));
  root.userData = { body, arms, face, kind: 'condom', faceKind: 'angry', gun }; return root;
}
export function makeChili() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const pts = []; for (let i = 0; i <= 12; i++) { const k = i / 12; pts.push(new THREE.Vector2(0.02 + Math.sin(k * Math.PI) * 0.16 * (0.5 + k * 0.6), k * 0.9)); }
  const b = ink(new THREE.LatheGeometry(pts, 16), toon('#e8311f'), 0.02); body.add(b);
  body.add(at(ink(G.cyl(0.09, 0.1, 0.1, 10), toon('#3f8f32')), 0, 0.93, 0));
  body.add(cylBetween(new THREE.Vector3(0, 0.96, 0), new THREE.Vector3(0.08, 1.12, 0.02), 0.025, '#3f8f32'));
  const face = facePlate('angry', 0.17, 0.55); body.add(face);
  const bottle = new THREE.Group(); bottle.position.set(0.22, 0.5, 0.05); bottle.add(at(ink(G.cyl(0.05, 0.05, 0.2, 10), toon('#ff7a3a')), 0, 0, 0)); bottle.add(at(ink(G.cyl(0.025, 0.03, 0.08, 8), toon('#c92a2a')), 0, 0.13, 0)); body.add(bottle);
  root.userData = { body, bottle, face, kind: 'chili', faceKind: 'angry' }; return root;
}
export function makeIce() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const m = ink(G.box(0.8, 0.6, 0.8), toon('#bfe6ff', { transparent: 0.78 }), 0.04); m.position.y = 0.3; body.add(m);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: faceTex('angry'), transparent: true })); face.position.set(0, 0.3, 0.41); body.add(face);
  root.userData = { body, face, kind: 'ice' }; return root;
}
export function makeTrap() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  body.add(at(ink(G.box(0.6, 0.06, 0.3), toon('#c98b4b')), 0, 0.03, 0));
  const bar = new THREE.Group(); bar.position.set(0.26, 0.07, 0); body.add(bar);
  const loop = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.012, 6, 16, Math.PI), toon('#7c8794')); loop.rotation.set(0, Math.PI / 2, Math.PI / 2); loop.position.x = -0.13; bar.add(loop);
  const cheese = ink(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 3), toon(YEL)); cheese.position.set(-0.05, 0.09, 0); body.add(cheese);
  root.userData = { body, bar, kind: 'trap' }; return root;
}
export function makeTarget(civ) {
  const root = new THREE.Group();
  root.add(cylBetween(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.5, 0), 0.03, '#8a6a44'));
  const c = civ ? bake(128, 128, () => { rr(6, 6, 116, 116, 10); fs('#dff5ff', INK, 5); E(64, 58, 32, 34); fs(SKIN, INK, 4); E(64, 30, 36, 16); fs('#d8d8e8', INK, 3); E(50, 58, 10, 10); fs('#fff', INK, 3); E(78, 58, 10, 10); fs('#fff', INK, 3); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(64, 76, 10, 0.2, Math.PI - 0.2); ctx.stroke(); txt('NAN', 64, 108, 20, PINK, 'center', null); }) : bake(128, 128, () => { rr(6, 6, 116, 116, 10); fs('#fff6e0', INK, 5); E(42, 64, 26, 30); fs('#ffb3c9', INK, 4); E(86, 64, 26, 30); fs('#ffb3c9', INK, 4); E(64, 64, 14, 14); fs('#fff', PINK, 5); E(64, 64, 6, 6); fs(PINK, null); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.03), [toon('#fff6e0'), toon('#fff6e0'), toon('#fff6e0'), toon('#fff6e0'), new THREE.MeshToonMaterial({ map: t, gradientMap: ramp }), new THREE.MeshToonMaterial({ map: t, gradientMap: ramp })]);
  board.position.y = 0.72; board.castShadow = true; root.add(board);
  root.userData = { board, kind: 'target' }; return root;
}
// ---------- pickups / small things ----------
export function makeEggplant() {
  const root = new THREE.Group(), g = new THREE.Group(); root.add(g); g.position.y = 0.35; g.rotation.z = 0.5;
  const pts = []; for (let i = 0; i <= 12; i++) { const k = i / 12; pts.push(new THREE.Vector2(Math.sin(k * Math.PI) * (0.08 + 0.06 * (1 - k)), k * 0.36 - 0.18)); }
  g.add(ink(new THREE.LatheGeometry(pts, 16), toon(PURP), 0.02));
  g.add(at(ink(new THREE.ConeGeometry(0.08, 0.07, 6), toon('#57b947')), 0, 0.19, 0));
  root.userData = { spin: g, kind: 'eggplant' }; return root;
}
// lotion: a pump bottle. pumps you back up.
export function makeLotion() {
  const root = new THREE.Group(), g = new THREE.Group(); root.add(g); g.position.y = 0.2;
  const c = bake(128, 128, () => { ctx.fillStyle = '#f4f7ff'; ctx.fillRect(0, 0, 128, 128); rr(10, 30, 108, 64, 10); fs('#7ec8ff', INK, 4); txt('LOTION', 64, 52, 24, '#fff', 'center', INK); txt('extra grip', 64, 78, 14, INK, 'center', null); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const body = ink(new THREE.CylinderGeometry(0.085, 0.095, 0.26, 18), new THREE.MeshToonMaterial({ map: t, gradientMap: ramp }), 0.012); g.add(body);
  g.add(at(ink(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 10), toon('#ffffff'), 0.008), 0, 0.16, 0));
  g.add(at(ink(new THREE.BoxGeometry(0.07, 0.025, 0.035), toon('#ffffff'), 0.008), 0.025, 0.2, 0));
  g.add(at(ink(new THREE.CylinderGeometry(0.008, 0.008, 0.05, 6), toon('#ffffff'), 0.004), 0.06, 0.19, 0).rotateZ(1.2));
  root.userData = { spin: g, kind: 'lotion' }; return root;
}
// the little blue pill: full size and it won't shrink for a while
export function makePill() {
  const root = new THREE.Group(), g = new THREE.Group(); root.add(g); g.position.y = 0.3; g.rotation.z = 0.6;
  const cap = ink(new THREE.CapsuleGeometry(0.07, 0.12, 6, 14), toon('#3f7cff'), 0.012); g.add(cap);
  const shine = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff' })); shine.position.set(0.04, 0.06, 0.05); g.add(shine);
  root.userData = { spin: g, kind: 'pill' }; return root;
}
export function makeCrate() {
  const root = new THREE.Group();
  const c = bake(128, 128, () => { ctx.fillStyle = '#c98b4b'; ctx.fillRect(0, 0, 128, 128); ctx.strokeStyle = '#7a4d20'; ctx.lineWidth = 8; ctx.strokeRect(4, 4, 120, 120); ctx.beginPath(); ctx.moveTo(4, 4); ctx.lineTo(124, 124); ctx.moveTo(124, 4); ctx.lineTo(4, 124); ctx.stroke(); rr(26, 50, 76, 28, 4); fs('#fff6e0', '#7a4d20', 3); txt('EGGPLANTS', 64, 64, 13, '#7a4d20', 'center', null); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const b = ink(G.box(0.6, 0.45, 0.6), new THREE.MeshToonMaterial({ map: t, gradientMap: ramp }), 0.03); b.position.y = 0.225; root.add(b);
  root.userData = { kind: 'crate' }; return root;
}
export function makeNut() { const r = new THREE.Group(); r.add(sphere(0.09, SKIN, 0, 0, 0)); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.008, 6, 12), toon('#8a8a9a')); ring.position.set(0.05, 0.09, 0); r.add(ring); return r; }
export function makeCondomShot() {   // a flying condom: the rolled ring and a floppy translucent tip
  const g = new THREE.Group(); const latex = toon('#c8e6ff', { transparent: 0.8 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.022, 8, 18), toon('#dcefff')); g.add(ring);
  const tip = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.1, 4, 10), latex); tip.rotation.x = Math.PI / 2; tip.position.z = -0.09; g.add(tip);
  const res = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), latex); res.position.z = -0.2; g.add(res);
  return g;
}
export function makeGlob() { const m = new THREE.Mesh(G.sphLo, toon(CUM, { emissive: '#ffffff', ei: 0.35 })); m.scale.setScalar(0.09); return m; }
export function makeStinger() { const m = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14, 6), toon(INK)); m.rotation.x = Math.PI / 2; const g = new THREE.Group(); g.add(m); return g; }
export function makeBottle() { const g = new THREE.Group(); g.add(at(ink(G.cyl(0.05, 0.05, 0.2, 10), toon('#ff7a3a')), 0, 0, 0)); g.add(at(ink(G.cyl(0.025, 0.03, 0.08, 8), toon('#c92a2a')), 0, 0.13, 0)); return g; }
export function makeTicket() {
  const c = bake(128, 80, () => { rr(4, 4, 120, 72, 8); fs('#fff6e0', INK, 5); txt('69', 64, 42, 44, PINK, 'center', null); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.25), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide, transparent: true }));
  const g = new THREE.Group(); m.position.y = 0.5; g.add(m); g.userData = { spin: m }; return g;
}
export function makePistol() { const g = new THREE.Group(); g.add(at(ink(G.box(0.26, 0.07, 0.07), toon('#3a3a4a')), 0, 0.05, 0)); g.add(at(ink(G.box(0.07, 0.12, 0.06), toon('#3a3a4a')), 0.08, 0, 0)); return g; }
export function makeHeli() {
  const g = new THREE.Group(); const olive = toon('#5b6b3c');
  g.add(at(ink(G.sph, olive, 0.02), 0, 0, 0, 1.4, 0.7, 0.7)); g.add(at(ink(G.cyl(0.12, 0.05, 1.6, 8), olive), -1.4, 0.15, 0)); g.children[1].rotation.z = Math.PI / 2;
  g.add(at(new THREE.Mesh(G.sph, toon('#bfe9f8', { transparent: 0.7 })), 0.8, 0.1, 0, 0.5, 0.4, 0.5));
  const rotor = new THREE.Group(); rotor.position.y = 0.75; g.add(rotor); [0, Math.PI / 2].forEach(a => { const b = new THREE.Mesh(G.box(3.2, 0.03, 0.14), toon('#2a2a2a')); b.rotation.y = a; rotor.add(b); });
  [-0.4, 0.4].forEach(z => g.add(at(new THREE.Mesh(G.box(1.8, 0.05, 0.06), toon('#3f4a2e')), 0, -0.75, z)));
  // nav lights (red port, green starboard, white strobe on the tail) and a searchlight cone, so you can find it at night
  const lamp = (c, x, y, z) => { const l = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: c, fog: false })); l.position.set(x, y, z); g.add(l); return l; };
  lamp('#ff3040', 0.2, 0, 0.72); lamp('#30ff60', 0.2, 0, -0.72); const strobe = lamp('#ffffff', -2.2, 0.3, 0);
  const beam = new THREE.Mesh(new THREE.ConeGeometry(1.4, 5, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#fff6c8', transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  beam.position.set(1.3, -2.6, 0); g.add(beam);
  g.userData = { rotor, strobe }; return g;
}
// ---------- CH-47-style tandem-rotor transport ("the Big Bird"). Nose is +x, wheels sit on y = 0. ~9 units long. ----------
export function makeChinook() {
  const root = new THREE.Group();
  const skin = (() => {   // olive drab with panel lines, rivets, stencils, exhaust soot
    const c = bake(512, 256, () => {
      ctx.fillStyle = '#6a7447'; ctx.fillRect(0, 0, 512, 256);
      for (let i = 0; i < 900; i++) { ctx.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,230' : '0,0,0'},${Math.random() * 0.05})`; ctx.fillRect(Math.random() * 512, Math.random() * 256, 2 + Math.random() * 10, 1 + Math.random() * 4); }
      ctx.strokeStyle = 'rgba(20,24,12,0.55)'; ctx.lineWidth = 1.5;
      for (let x = 20; x < 512; x += 46) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke(); }
      for (const y of [40, 120, 200]) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke(); }
      ctx.fillStyle = 'rgba(20,24,12,0.5)'; for (let x = 20; x < 512; x += 46) for (let y = 6; y < 256; y += 9) ctx.fillRect(x - 3, y, 1.5, 1.5);
      txt('S.A.S. AIR SAUSAGE', 250, 160, 22, 'rgba(15,15,10,0.8)', 'center', null);
      txt('NO STEP', 90, 60, 11, 'rgba(15,15,10,0.7)', 'center', null); txt('BIG BIRD 69', 420, 225, 14, 'rgba(15,15,10,0.7)', 'center', null);
      const g2 = ctx.createLinearGradient(0, 0, 0, 60); g2.addColorStop(0, 'rgba(10,10,8,0.6)'); g2.addColorStop(1, 'rgba(10,10,8,0)'); ctx.fillStyle = g2; ctx.fillRect(0, 0, 150, 60);
    });
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    return new THREE.MeshStandardMaterial({ map: tx, roughness: 0.7, metalness: 0.15, emissive: '#2a3018', emissiveIntensity: 0.6 });
  })();
  const dark = new THREE.MeshStandardMaterial({ color: '#2b2e24', roughness: 0.8, metalness: 0.2 });
  const metal = new THREE.MeshStandardMaterial({ color: '#8a8d86', roughness: 0.4, metalness: 0.7 });
  const glass = new THREE.MeshStandardMaterial({ color: '#9fc4d8', roughness: 0.05, metalness: 0.4, transparent: true, opacity: 0.75 });
  const black = new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.9 });
  const add = (m, x, y, z) => { m.position.set(x, y, z); m.castShadow = true; root.add(m); return m; };
  const L = 4.3, CY = 1.72;   // half-length of the cabin, cabin centre height
  // fuselage: a long rounded box (extruded rounded-rect section)
  const W = 1.2, Hh = 1.02, r = 0.34, sec = new THREE.Shape();
  sec.moveTo(-W + r, -Hh); sec.lineTo(W - r, -Hh); sec.quadraticCurveTo(W, -Hh, W, -Hh + r); sec.lineTo(W, Hh - r); sec.quadraticCurveTo(W, Hh, W - r, Hh); sec.lineTo(-W + r, Hh); sec.quadraticCurveTo(-W, Hh, -W, Hh - r); sec.lineTo(-W, -Hh + r); sec.quadraticCurveTo(-W, -Hh, -W + r, -Hh);
  const bodyGeo = new THREE.ExtrudeGeometry(sec, { depth: L * 2, bevelEnabled: true, bevelSize: 0.07, bevelThickness: 0.07, bevelSegments: 2, curveSegments: 6 });
  bodyGeo.translate(0, 0, -L); bodyGeo.rotateY(Math.PI / 2);
  add(new THREE.Mesh(bodyGeo, skin), 0, CY, 0);
  // nose: rounded, with a stepped cockpit and a big framed windscreen
  const nose = add(new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), skin), L + 0.05, CY - 0.15, 0); nose.rotation.z = -Math.PI / 2; nose.scale.set(0.95, 1.05, 1.22);
  const ws = add(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 2.1), glass), L + 0.45, CY + 0.6, 0); ws.rotation.z = -0.6;
  [-0.62, 0, 0.62].forEach(z => { const f = add(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.75, 0.05), dark), L + 0.5, CY + 0.6, z); f.rotation.z = -0.6; });
  [-1, 1].forEach(sd => add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.04), glass), L - 0.55, CY + 0.55, sd * 1.24));
  // cabin portholes, crew door
  for (let i = 0; i < 7; i++) [-1, 1].forEach(sd => { const w = add(new THREE.Mesh(new THREE.CircleGeometry(0.16, 14), glass), L - 1.8 - i * 0.95, CY + 0.35, sd * 1.285); w.rotation.y = sd > 0 ? 0 : Math.PI; });
  add(new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.3, 0.04), black), L - 1.05, CY - 0.2, 1.29);
  // forward pylon (low, over the cockpit) and the tall aft pylon — the Chinook silhouette
  add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.0), skin), L - 0.9, CY + 1.25, 0);
  add(new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.3, 1.2), skin), -L + 0.9, CY + 1.65, 0);
  const fin = add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 0.8), skin), -L + 0.35, CY + 2.35, 0); fin.rotation.z = 0.4;
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, L * 1.4, 10), skin), 0, CY + 1.32, 0).rotation.z = Math.PI / 2;   // drive-shaft tunnel
  // engines on the aft pylon: intakes forward, sooty exhausts aft
  [-1, 1].forEach(sd => {
    const eng = add(new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.28, 2.1, 16), skin), -L + 1.0, CY + 1.4, sd * 0.98); eng.rotation.z = Math.PI / 2;
    add(new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.05, 8, 18), metal), -L + 2.05, CY + 1.4, sd * 0.98).rotation.y = Math.PI / 2;
    add(new THREE.Mesh(new THREE.CircleGeometry(0.28, 16), black), -L + 2.07, CY + 1.4, sd * 0.98).rotation.y = Math.PI / 2;
    const ex = add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.45, 12), dark), -L - 0.15, CY + 1.4, sd * 0.98); ex.rotation.z = Math.PI / 2;
  });
  // fuel sponsons down both sides
  [-1, 1].forEach(sd => { const sp = add(new THREE.Mesh(new THREE.CapsuleGeometry(0.4, L * 1.2, 6, 14), skin), 0.2, 0.92, sd * 1.3); sp.rotation.z = Math.PI / 2; sp.scale.set(1, 1, 0.7); });
  // landing gear
  const wheel = new THREE.CylinderGeometry(0.33, 0.33, 0.22, 16);
  for (const [x, z] of [[L - 1.4, 0.95], [L - 1.4, -0.95], [-L + 1.6, 1.15], [-L + 1.6, -1.15]]) { const w = add(new THREE.Mesh(wheel, black), x, 0.33, z); w.rotation.x = Math.PI / 2; add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), metal), x, 0.62, z); }
  // the cabin: floor, walls, ceiling, front bulkhead, ribs — open at the back so you can see out of the ramp
  const cab = new THREE.MeshStandardMaterial({ color: '#5a5c4c', roughness: 0.95, emissive: '#1e1f16', side: THREE.DoubleSide });
  const cabFloor = new THREE.MeshStandardMaterial({ color: '#46473d', roughness: 1, emissive: '#15150f' });
  add(new THREE.Mesh(new THREE.BoxGeometry(L * 2 - 0.3, 0.06, 2.2), cabFloor), -0.1, 0.72, 0);
  add(new THREE.Mesh(new THREE.BoxGeometry(L * 2 - 0.3, 0.06, 2.2), cab), -0.1, CY + 0.97, 0);
  [-1, 1].forEach(sd => add(new THREE.Mesh(new THREE.BoxGeometry(L * 2 - 0.3, 1.95, 0.05), cab), -0.1, CY, sd * 1.13));
  add(new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.95, 2.2), cab), L - 0.3, CY, 0);
  for (let i = 0; i < 8; i++) { const x = L - 0.8 - i * 0.95; [-1, 1].forEach(sd => add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.95, 0.08), dark), x, CY, sd * 1.08)); add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 2.2), dark), x, CY + 0.92, 0); }   // ribs
  const webbing = new THREE.MeshStandardMaterial({ color: '#9a3030', roughness: 1, emissive: '#2a0808' });
  [-1, 1].forEach(sd => { add(new THREE.Mesh(new THREE.BoxGeometry(L * 1.5, 0.1, 0.42), webbing), -0.4, 1.2, sd * 0.86); add(new THREE.Mesh(new THREE.BoxGeometry(L * 1.5, 0.55, 0.05), webbing), -0.4, 1.55, sd * 1.08); });
  const cabinLight = new THREE.Mesh(new THREE.BoxGeometry(L * 1.4, 0.05, 0.1), new THREE.MeshBasicMaterial({ color: '#ff6a5a' })); cabinLight.position.set(-0.3, CY + 0.92, 0); root.add(cabinLight);
  // rear ramp, hinged at the cabin floor. rotation.z: 0 = closed (up), ~1.84 = lowered to the ground
  const ramp = new THREE.Group(); ramp.position.set(-L - 0.02, 0.72, 0); root.add(ramp);
  const rp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.0, 2.2), skin); rp.position.set(0, 1.0, 0); rp.castShadow = true; ramp.add(rp);
  const tread = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.9, 1.9), dark); tread.position.set(0.07, 1.0, 0); ramp.add(tread);
  // two three-blade rotors, counter-rotating, with motion-blur discs
  const blade = new THREE.BoxGeometry(4.4, 0.05, 0.34), bladeM = new THREE.MeshStandardMaterial({ color: '#1e1e1e', roughness: 0.7 });
  const mkRotor = (x, y) => { const g = new THREE.Group(); g.position.set(x, y, 0); root.add(g);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.45, 12), metal), x, y - 0.22, 0);
    for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(blade, bladeM); b.position.x = 2.2; b.rotation.x = 0.08; const arm = new THREE.Group(); arm.rotation.y = i * Math.PI * 2 / 3; arm.add(b); g.add(arm); }
    const disc = new THREE.Mesh(new THREE.CircleGeometry(4.5, 40), new THREE.MeshBasicMaterial({ color: '#111', transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide })); disc.rotation.x = -Math.PI / 2; g.add(disc);
    return g; };
  const rotorF = mkRotor(L - 0.9, CY + 1.7), rotorB = mkRotor(-L + 0.9, CY + 2.6);
  const lamp = (c, x, y, z) => { const l = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: c, fog: false })); l.position.set(x, y, z); root.add(l); return l; };
  lamp('#ff3040', 1.5, 0.92, 1.72); lamp('#30ff60', 1.5, 0.92, -1.72); const strobe = lamp('#ffffff', -L + 0.2, CY + 2.95, 0);
  const beam = new THREE.Mesh(new THREE.ConeGeometry(1.8, 6, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#fff6c8', transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide, fog: false })); beam.position.set(L + 0.6, -2.2, 0); beam.rotation.z = 0.35; root.add(beam);
  root.userData = { rotorF, rotorB, ramp, strobe, beam, kind: 'chinook', rotor: rotorF };
  return root;
}
// the DILDO-7's round: a pink, ridged, suction-cup-based rocket (points along +x)
export function makeDildoRocket() {
  const g = new THREE.Group(), pink = toon('#ff6fae'), pink2 = toon('#e0508e');
  const pts = []; for (let i = 0; i <= 10; i++) { const k = i / 10; pts.push(new THREE.Vector2(0.07 + Math.sin(k * 18) * 0.006, k * 0.5)); }
  const body = ink(new THREE.LatheGeometry(pts, 14), pink, 0.012); body.rotation.z = -Math.PI / 2; g.add(body);
  const head = ink(new THREE.SphereGeometry(0.1, 14, 10), pink2, 0.012); head.scale.set(1.2, 0.9, 0.9); head.position.x = 0.52; g.add(head);
  const cup = ink(new THREE.CylinderGeometry(0.13, 0.1, 0.05, 14), pink2, 0.01); cup.rotation.z = Math.PI / 2; cup.position.x = -0.02; g.add(cup);
  const fl = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 10), new THREE.MeshBasicMaterial({ color: '#ffd28a', transparent: true, opacity: 0.8 })); fl.rotation.z = Math.PI / 2; fl.position.x = -0.22; g.add(fl);
  return g;
}
// a cartoon party girl for the Pleasure Dome (adults, dressed for a night out)
export function makeLady(o = {}) {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const skin = toon(o.skin || '#f0c4a0'), dress = toon(o.dress || '#ff5d8f'), hairM = toon(o.hair || '#3a2418');
  [-1, 1].forEach(sd => { body.add(at(ink(G.cyl(0.035, 0.03, 0.42, 8), skin, 0.01), sd * 0.06, 0.21, 0)); body.add(at(ink(G.box(0.06, 0.04, 0.1), toon('#1a1a1a'), 0.008), sd * 0.06, 0.02, 0.02)); });
  const skirt = ink(new THREE.ConeGeometry(0.2, 0.34, 14), dress, 0.012); skirt.position.y = 0.52; body.add(skirt);
  const torso = ink(G.cyl(0.1, 0.12, 0.26, 12), dress, 0.012); torso.position.y = 0.78; body.add(torso);
  const head = ink(new THREE.SphereGeometry(0.13, 16, 12), skin, 0.012); head.position.y = 1.03; body.add(head);
  const hairTop = ink(new THREE.SphereGeometry(0.14, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hairM, 0.01); hairTop.position.y = 1.05; hairTop.rotation.x = -0.35; body.add(hairTop);
  const hairBack = ink(G.cyl(0.13, 0.08, 0.3, 12), hairM, 0.01); hairBack.position.set(0, 0.92, -0.06); body.add(hairBack);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ map: faceTex('lady'), transparent: true, depthWrite: false })); face.position.set(0, 1.02, 0.131); face.userData.face = true; body.add(face);
  const arms = [];
  [-1, 1].forEach(sd => { const a = new THREE.Group(); a.position.set(sd * 0.12, 0.86, 0); body.add(a); a.add(cylBetween(new THREE.Vector3(0, 0, 0), new THREE.Vector3(sd * 0.05, -0.3, 0), 0.028, o.skin || '#f0c4a0')); arms.push(a); });
  root.userData = { body, arms, kind: 'lady' };
  return root;
}
export function makeTuft(seed = 0) {   // a tuft of "tall grass". Curly, brown. You know what it is.
  const g = new THREE.Group(); const mat = toon('#3a2a1a');
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + seed, r = 0.12 + (i % 3) * 0.06, h = 0.55 + ((i * 7 + seed * 13) % 5) * 0.08;
    const pts = []; for (let k = 0; k <= 6; k++) { const q = k / 6; pts.push(new THREE.Vector3(Math.cos(a) * r * q + Math.sin(q * 9 + i) * 0.05, q * h, Math.sin(a) * r * q + Math.cos(q * 8 + i) * 0.05)); }
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 6, 0.016, 3), mat); tube.castShadow = true; g.add(tube);
  }
  return g;
}

// ---------- props ----------
function canvasMat(w, h, fn) { const c = bake(w, h, fn); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return new THREE.MeshToonMaterial({ map: t, gradientMap: ramp }); }
const barrelMat = canvasMat(128, 64, () => { ctx.fillStyle = '#8a5a3a'; ctx.fillRect(0, 0, 128, 64); ctx.fillStyle = '#5b3a24'; ctx.fillRect(0, 14, 128, 5); ctx.fillRect(0, 46, 128, 5); rr(40, 22, 48, 20, 3); fs('#fff6e0', INK, 2); txt('LUBE', 64, 32, 13, INK, 'center', null); });
export const PROP3D = {
  barrel: () => { const g = new THREE.Group(); g.add(at(ink(G.cyl(0.24, 0.24, 0.62, 16), barrelMat), 0, 0.31, 0)); return g; },
  sandbags: () => { const g = new THREE.Group(); const m = toon('#c9ab6e'); [[-0.3, 0.1, 0], [0, 0.1, 0], [0.3, 0.1, 0], [-0.15, 0.27, 0], [0.15, 0.27, 0], [0, 0.44, 0]].forEach(([x, y, z]) => { const s = ink(G.cap(0.1, 0.18), m, 0.02); s.rotation.z = Math.PI / 2; s.position.set(x, y, z); g.add(s); }); return g; },
  cratestack: () => { const g = new THREE.Group(); const a = makeCrate(); g.add(a); const b = makeCrate(); b.position.set(0.05, 0.45, 0.02); b.rotation.y = 0.3; b.scale.setScalar(0.8); g.add(b); return g; },
  ammobox: () => { const g = new THREE.Group(); g.add(at(ink(G.box(0.4, 0.22, 0.24), toon('#4e6a3a')), 0, 0.11, 0)); return g; },
  tent: () => { const g = new THREE.Group(); const c = ink(new THREE.ConeGeometry(0.9, 1.0, 4), toon('#6b7a3a'), 0.03); c.position.y = 0.5; c.rotation.y = Math.PI / 4; g.add(c); return g; },
  palm: () => { const g = new THREE.Group(); const tm = toon('#8a6a44'); for (let i = 0; i < 6; i++) g.add(at(ink(G.cyl(0.07, 0.09, 0.3, 8), tm, 0.02), Math.sin(i * 0.3) * 0.08, 0.15 + i * 0.28, 0)); const lm = toon('#4fb356'); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const l = ink(G.sph, lm, 0.02); l.scale.set(0.5, 0.05, 0.14); l.position.set(Math.cos(a) * 0.4, 1.72, Math.sin(a) * 0.4); l.rotation.y = -a; l.rotation.z = -0.35; g.add(l); } return g; },
  tires: () => { const g = new THREE.Group(); for (let i = 0; i < 3; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.08, 8, 18), toon('#2f2f3a')); t.rotation.x = Math.PI / 2; t.position.y = 0.08 + i * 0.16; t.castShadow = true; g.add(t); } return g; },
  cone: () => { const g = new THREE.Group(); g.add(at(ink(new THREE.ConeGeometry(0.12, 0.4, 12), toon('#ff7a3a')), 0, 0.2, 0)); return g; },
  barrier: () => { const g = new THREE.Group(); g.add(at(ink(G.box(0.9, 0.5, 0.25), toon('#8a8f98')), 0, 0.25, 0)); g.add(at(new THREE.Mesh(G.box(0.3, 0.08, 0.26), toon(YEL)), -0.2, 0.4, 0)); return g; },
  cactus: () => { const g = new THREE.Group(); const m = toon('#4fb356'); const tr = ink(G.cap(0.12, 0.7), m); tr.position.y = 0.47; g.add(tr); const a = ink(G.cap(0.07, 0.25), m); a.position.set(0.2, 0.55, 0); g.add(a); g.add(sphere(0.06, PINK, 0, 0.95, 0)); return g; },
  flag: () => { const g = new THREE.Group(); g.add(cylBetween(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 2.2, 0), 0.03, '#8a8a9a')); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5, 8, 1), toon(PINK, { opts: { side: THREE.DoubleSide } })); f.position.set(0.42, 1.95, 0); g.add(f); g.userData.flag = f; return g; },
  rock: () => { const g = new THREE.Group(); const r = ink(new THREE.DodecahedronGeometry(0.35, 0), toon('#6f6a7a'), 0.03); r.position.y = 0.2; r.scale.set(1, 0.7, 0.9); g.add(r); return g; },
  car: () => { const g = new THREE.Group(); const m = toon('#c9c0b8'); g.add(at(ink(G.box(1.6, 0.4, 0.8), m), 0, 0.35, 0)); g.add(at(ink(G.box(0.8, 0.32, 0.72), m), -0.1, 0.7, 0)); g.add(at(new THREE.Mesh(G.box(0.82, 0.24, 0.74), toon('#5a6a7a')), -0.1, 0.72, 0)); [[-0.5, -0.4], [0.5, -0.4], [-0.5, 0.4], [0.5, 0.4]].forEach(([x, z]) => { const w = ink(G.cyl(0.16, 0.16, 0.1, 12), toon('#2f2f3a')); w.rotation.x = Math.PI / 2; w.position.set(x, 0.16, z); g.add(w); }); return g; },
  wreck: () => { const g = PROP3D.car(); g.rotation.z = 0.25; g.children.forEach(c => { if (c.material && c.material.color) c.material = toon('#4a4a52'); }); return g; },
  lampost: () => { const g = new THREE.Group(); g.add(cylBetween(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 2.4, 0), 0.04, '#3a3a4a')); g.add(cylBetween(new THREE.Vector3(0, 2.4, 0), new THREE.Vector3(0.4, 2.45, 0), 0.03, '#3a3a4a')); g.add(at(new THREE.Mesh(G.box(0.22, 0.08, 0.14), new THREE.MeshBasicMaterial({ color: '#fff2a8' })), 0.42, 2.4, 0)); return g; },
  cooler: () => { const g = new THREE.Group(); g.add(at(ink(G.box(0.34, 0.8, 0.34), toon('#e6eef2')), 0, 0.4, 0)); g.add(at(ink(G.cyl(0.14, 0.14, 0.34, 12), toon('#7ed6df', { transparent: 0.7 })), 0, 0.98, 0)); return g; },
  magrack: () => { const g = new THREE.Group(); g.add(at(ink(G.box(0.5, 0.7, 0.2), toon('#8a6a44')), 0, 0.35, 0)); ['#ff9ec4', '#7ed6df', '#ffd23f'].forEach((c, i) => g.add(at(new THREE.Mesh(G.box(0.4, 0.14, 0.05), toon(c)), 0, 0.15 + i * 0.2, 0.11))); return g; },
  valve: () => { const g = new THREE.Group(); g.add(cylBetween(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.8, 0), 0.06, '#6f8a9c')); const w = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 8, 16), toon('#c92a2a')); w.position.y = 0.85; w.rotation.x = Math.PI / 2; g.add(w); return g; },
  lifering: () => { const g = new THREE.Group(); const r = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.08, 10, 20), toon('#ff5d3a')); r.position.y = 0.9; g.add(r); return g; },
  desk: () => { const g = new THREE.Group(); g.add(at(ink(G.box(1.4, 0.8, 0.5), toon(PURP)), 0, 0.4, 0)); return g; },
  posterstand: () => { const g = new THREE.Group(); g.add(cylBetween(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.9, 0), 0.03, '#3a3a4a')); const m = canvasMat(128, 110, () => { rr(4, 4, 120, 102, 6); fs('#fff6e0', INK, 4); txt('HAVE YOU TRIED', 64, 30, 14, INK, 'center', null); txt('NOT RUSHING?', 64, 58, 18, PINK, 'center', null); txt('- the clinic', 64, 86, 11, INK, 'center', null); }); g.add(at(new THREE.Mesh(G.box(0.6, 0.5, 0.03), m), 0, 1.05, 0)); return g; },
  lantern: () => { const g = new THREE.Group(); g.add(at(new THREE.Mesh(G.sph, new THREE.MeshBasicMaterial({ color: '#fff2a8' })), 0, 1.1, 0, 0.09, 0.11, 0.09)); g.add(at(ink(G.cyl(0.08, 0.12, 0.06, 8), toon('#3a3a4a')), 0, 1.22, 0)); return g; },
  chair: () => { const g = new THREE.Group(); const m = toon('#7ed6df'); g.add(at(ink(G.box(0.45, 0.08, 0.45), m), 0, 0.42, 0)); g.add(at(ink(G.box(0.45, 0.5, 0.06), m), 0, 0.7, -0.2)); [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(([x, z]) => g.add(at(new THREE.Mesh(G.box(0.04, 0.4, 0.04), toon(INK)), x, 0.2, z))); return g; },
  truck: () => { const g = new THREE.Group(); const m = toon('#5b6b3c'); g.add(at(ink(G.box(2.6, 0.5, 1.1), toon('#3a3a42')), 0, 0.35, 0)); g.add(at(ink(G.box(0.8, 0.8, 1.05), m), 0.95, 0.95, 0)); g.add(at(new THREE.Mesh(G.box(0.1, 0.36, 0.9), toon('#9fd4ff')), 1.36, 1.1, 0));
    const tarp = canvasMat(256, 128, () => { ctx.fillStyle = '#6b7a4a'; ctx.fillRect(0, 0, 256, 128); rr(40, 34, 176, 60, 10); fs('#fff6e0', INK, 4); txt('RUBBER CO.', 128, 64, 30, INK, 'center', null); });
    const b = ink(G.box(1.8, 1.0, 1.1), tarp); b.position.set(-0.35, 1.0, 0); g.add(b);
    for (const [x, z] of [[-0.8, 0.55], [0.3, 0.55], [0.95, 0.55], [-0.8, -0.55], [0.3, -0.55], [0.95, -0.55]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 12), toon('#1e1e24')); w.rotation.x = Math.PI / 2; w.position.set(x, 0.22, z); g.add(w); }
    return g; },
  van: () => { const g = new THREE.Group(); const m = canvasMat(256, 128, () => { ctx.fillStyle = '#f4f7ff'; ctx.fillRect(0, 0, 256, 128); txt('FREE CANDY', 128, 50, 26, PINK, 'center', null); txt('(it\'s the team van)', 128, 88, 18, INK, 'center', null); });
    g.add(at(ink(G.box(2.2, 1.1, 1.1), m), 0, 0.8, 0)); for (const [x, z] of [[-0.7, 0.55], [0.7, 0.55], [-0.7, -0.55], [0.7, -0.55]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 12), toon('#1e1e24')); w.rotation.x = Math.PI / 2; w.position.set(x, 0.2, z); g.add(w); } return g; },
  tombstone: () => { const g = new THREE.Group(); const m = canvasMat(64, 96, () => { ctx.fillStyle = '#8a8698'; ctx.fillRect(0, 0, 64, 96); txt('RIP', 32, 34, 18, INK, 'center', null); txt('lil guy', 32, 58, 11, INK, 'center', null); });
    const s = ink(G.box(0.5, 0.7, 0.14), m, 0.02); s.position.y = 0.35; g.add(s); const top = ink(new THREE.CylinderGeometry(0.25, 0.25, 0.14, 12, 1, false, 0, Math.PI), toon('#8a8698'), 0.02); top.rotation.set(Math.PI / 2, 0, Math.PI / 2); top.position.y = 0.7; g.add(top); return g; },
  ferris: () => { const g = new THREE.Group(), spin = new THREE.Group(); g.add(spin); const R = 7, rust = new THREE.MeshStandardMaterial({ color: '#b8962a', roughness: 0.8, metalness: 0.3 }), dk = new THREE.MeshStandardMaterial({ color: '#5a4a2a', roughness: 0.9 });
    spin.position.y = R + 1.2;
    [-0.5, 0.5].forEach(z => { const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.12, 6, 40), rust); rim.position.z = z; spin.add(rim); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, R, 5), rust); sp.position.set(Math.cos(a) * R / 2, Math.sin(a) * R / 2, z); sp.rotation.z = a - Math.PI / 2; spin.add(sp); } });
    spin.add(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.4, 12), dk).rotateX(Math.PI / 2));
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const gd = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.9), new THREE.MeshStandardMaterial({ color: i % 2 ? '#c9b040' : '#8a5a3a', roughness: 0.9 })); gd.position.set(Math.cos(a) * R, Math.sin(a) * R - 0.5, 0); spin.add(gd); }
    [-1, 1].forEach(sd => [-1, 1].forEach(z => { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, R + 2.2, 6), rust); leg.position.set(sd * 1.9, (R + 1.2) / 2, z * 0.9); leg.rotation.z = -sd * 0.26; g.add(leg); }));
    g.userData.spin = spin; spin.userData.slow = true; return g; },
  carousel: () => { const g = new THREE.Group(), spin = new THREE.Group(); g.add(spin);
    g.add(at(ink(G.cyl(2.3, 2.4, 0.3, 24), toon('#c98b4b')), 0, 0.15, 0));
    g.add(cylBetween(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 3.1, 0), 0.18, '#ffd23f'));
    const roof = ink(new THREE.ConeGeometry(2.7, 1.1, 24), toon(PINK), 0.04); roof.position.y = 3.5; spin.add(roof);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; spin.add(cylBetween(new THREE.Vector3(Math.cos(a) * 1.8, 0.3, Math.sin(a) * 1.8), new THREE.Vector3(Math.cos(a) * 1.8, 3.0, Math.sin(a) * 1.8), 0.035, '#ffd23f'));
      const d = makeDick({ scale: 0.55 }); d.position.set(Math.cos(a) * 1.8, 1.0 + (i % 2) * 0.3, Math.sin(a) * 1.8); d.rotation.y = -a; spin.add(d); }
    g.userData.spin = spin; return g; },
  // v5 — WAR PECKER: an Abrams-ish tank whose main gun is exactly what you think. Nose +x. userData.turret spins, userData.barrel recoils.
  tank: () => { const g = new THREE.Group(), sand = toon('#8c8460'), dk = toon('#5e5a44'), trk = toon('#26262a');
    const side = canvasMat(256, 64, () => { ctx.fillStyle = '#8c8460'; ctx.fillRect(0, 0, 256, 64); txt('WAR PECKER', 128, 34, 30, '#1e1e24', 'center', null); });
    g.add(at(ink(G.box(3.5, 0.55, 1.9), sand, 0.03), 0, 0.72, 0));
    const hs = ink(G.box(3.1, 0.3, 1.92), side, 0.02); hs.position.set(-0.1, 0.66, 0); g.add(hs);
    g.add(at(ink(G.box(0.7, 0.35, 1.8), dk, 0.03), 1.65, 0.62, 0)); g.children[g.children.length - 1].rotation.z = -0.5;
    for (const z of [-0.98, 0.98]) { g.add(at(ink(G.box(3.7, 0.5, 0.42), trk, 0.03), 0, 0.3, z)); for (let i = 0; i < 7; i++) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.44, 12), toon('#3a3a40')); w.rotation.x = Math.PI / 2; w.position.set(-1.5 + i * 0.5, 0.26, z); g.add(w); } }
    const turret = new THREE.Group(); turret.position.set(-0.2, 1.0, 0); g.add(turret);
    turret.add(at(ink(G.box(1.8, 0.5, 1.4), sand, 0.03), -0.1, 0.25, 0)); turret.add(at(ink(G.box(0.5, 0.25, 0.5), dk, 0.03), -0.4, 0.6, 0.3));
    turret.add(at(ink(G.cyl(0.04, 0.04, 0.8, 6), toon('#2a2a2e')), -0.4, 0.95, -0.35));   // antenna
    const barrel = new THREE.Group(); barrel.position.set(0.8, 0.3, 0); turret.add(barrel);
    barrel.add(sphere(0.2, SKIN2, 0.02, -0.02, -0.17)); barrel.add(sphere(0.2, SKIN2, 0.02, -0.02, 0.17));   // the, uh, mantlet
    const sh = ink(G.cap(0.13, 1.7), toon(SKIN), 0.02); sh.rotation.z = -Math.PI / 2; sh.position.set(1.05, 0.02, 0); barrel.add(sh);
    const tip = sphere(0.17, HEAD, 2.0, 0.02, 0, 1.2, 0.95, 0.95); barrel.add(tip);
    for (const [y, z] of [[0.13, 0.03], [-0.02, 0.12], [0.06, -0.12]]) { const v = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.2, 6), toon('#c86a86')); v.rotation.z = Math.PI / 2; v.position.set(0.95, y, z); barrel.add(v); }
    turret.add(at(new THREE.Mesh(G.sph, new THREE.MeshBasicMaterial({ color: '#fff6c8' })), 0.7, 0.35, 0.55, 0.08, 0.08, 0.08));   // searchlight
    g.userData.turret = turret; g.userData.barrel = barrel; return g; },
  // v5 — the Z-PUBE: quad anti-air gun on a little trailer, with a lot of hair on it
  zpu: () => { const g = new THREE.Group(), olive = toon('#5a5e46'); g.add(at(ink(G.box(1.4, 0.18, 1.0), olive), 0, 0.42, 0));
    for (const z of [-0.5, 0.5]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.14, 14), toon('#26262a')); w.rotation.x = Math.PI / 2; w.position.set(0, 0.3, z); g.add(w); }
    const turret = new THREE.Group(); turret.position.set(0, 0.55, 0); g.add(turret);
    const plate = canvasMat(128, 64, () => { ctx.fillStyle = '#5a5e46'; ctx.fillRect(0, 0, 128, 64); txt('Z-PUBE', 64, 34, 24, '#fff6e0', 'center', null); });
    turret.add(at(ink(G.box(0.08, 0.6, 1.0), plate), 0.25, 0.35, 0));
    for (const [y, z] of [[0.3, -0.18], [0.3, 0.18], [0.55, -0.18], [0.55, 0.18]]) { const b = ink(G.cyl(0.04, 0.05, 1.6, 8), toon('#26262a'), 0.02); b.rotation.z = -Math.PI / 2 + 0.5; b.position.set(0.8, y + 0.35, z); turret.add(b); }
    for (let i = 0; i < 9; i++) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.012, 4, 10, Math.PI * 1.5), toon('#2a1a10')); h.position.set(-0.1 + (i % 3) * 0.1, 0.72 + ((i / 3) | 0) * 0.04, -0.3 + (i % 5) * 0.15); h.rotation.set(i, i * 2, 0); turret.add(h); }
    g.userData.turret = turret; return g; },
  // v5 — "BMP": Big Meaty Pickup. Eight wheels, a turret, armour globs bounce off
  bmp: () => { const g = new THREE.Group(), m = toon('#6a6f52'), dk = toon('#44463a');
    const side = canvasMat(256, 64, () => { ctx.fillStyle = '#6a6f52'; ctx.fillRect(0, 0, 256, 64); txt('BIG MEATY PICKUP', 128, 34, 22, '#fff6e0', 'center', null); });
    g.add(at(ink(G.box(3.0, 0.6, 1.5), m, 0.03), 0, 0.75, 0)); const s2 = ink(G.box(2.4, 0.3, 1.52), side, 0.02); s2.position.set(-0.2, 0.72, 0); g.add(s2);
    g.add(at(ink(G.box(0.8, 0.4, 1.4), dk, 0.03), 1.4, 0.8, 0)); g.children[g.children.length - 1].rotation.z = -0.45;
    for (const z of [-0.75, 0.75]) for (let i = 0; i < 4; i++) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 12), toon('#1e1e24')); w.rotation.x = Math.PI / 2; w.position.set(-1.1 + i * 0.72, 0.3, z); g.add(w); }
    const turret = new THREE.Group(); turret.position.set(0.1, 1.05, 0); g.add(turret); turret.add(at(ink(G.cyl(0.4, 0.5, 0.3, 14), m, 0.03), 0, 0.15, 0));
    const b = ink(G.cyl(0.05, 0.05, 1.2, 8), toon('#26262a'), 0.02); b.rotation.z = -Math.PI / 2; b.position.set(0.7, 0.2, 0); turret.add(b);
    g.userData.turret = turret; return g; },
  plant: () => { const g = new THREE.Group(); g.add(at(ink(G.cyl(0.16, 0.12, 0.3, 10), toon('#c98b4b')), 0, 0.15, 0)); for (let i = 0; i < 6; i++) { const l = ink(G.sph, toon('#3f8f32'), 0.02); l.scale.set(0.06, 0.3, 0.06); const a = i / 6 * Math.PI * 2; l.position.set(Math.cos(a) * 0.1, 0.5, Math.sin(a) * 0.1); l.rotation.set(Math.sin(a) * 0.5, 0, Math.cos(a) * 0.5); g.add(l); } return g; },
};
export const PROP_SOLID = { zpu: 1, truck: 1, van: 1, tombstone: 1, carousel: 1, barrel: 1, sandbags: 1, cratestack: 1, tent: 1, palm: 1, tires: 1, barrier: 1, cactus: 1, flag: 1, rock: 1, car: 1, wreck: 1, lampost: 1, cooler: 1, magrack: 1, desk: 1, posterstand: 1 };
// a flat sign with text, on two posts
export function makeSign(text, sub, bg = '#fff6e0', fg = INK) {
  const m = canvasMat(256, 110, () => { rr(6, 6, 244, 98, 10); fs(bg, INK, 6); txt(text, 128, sub ? 42 : 55, text.length > 12 ? 30 : 38, fg, 'center', null); if (sub) txt(sub, 128, 80, 20, fg, 'center', null); });
  const g = new THREE.Group(); g.add(cylBetween(new THREE.Vector3(-0.45, 0, 0), new THREE.Vector3(-0.45, 1.0, 0), 0.03, '#8a6a44')); g.add(cylBetween(new THREE.Vector3(0.45, 0, 0), new THREE.Vector3(0.45, 1.0, 0), 0.03, '#8a6a44'));
  g.add(at(new THREE.Mesh(G.box(1.1, 0.48, 0.04), m), 0, 1.05, 0)); return g;
}

// ---------- draw-call diet: merge every static mesh under each animated node into one mesh per material ----------
const _inv = new THREE.Matrix4(), _mm = new THREE.Matrix4();
export function bakeModel(root, extraKeep = []) {
  const ud = root.userData;
  const keep = new Set([root, ...extraKeep]);
  const addK = o => { if (!o) return; if (Array.isArray(o)) o.forEach(addK); else if (o.isObject3D) keep.add(o); };
  ['body', 'shaft', 'arms', 'claws', 'wings', 'bottle', 'bar', 'spin', 'board', 'rotor', 'flag', 'rotorF', 'rotorB', 'ramp', 'beam', 'strobe', 'gun', 'turret', 'barrel'].forEach(k => addK(ud[k]));
  root.updateMatrixWorld(true);
  const owner = o => { let p = o.parent; while (p && !keep.has(p)) p = p.parent; return p || root; };
  const buckets = new Map();   // owner -> Map(material -> [{mesh}])
  root.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh || o.userData.face || (ud.face === o) || Array.isArray(o.material)) return;
    if (keep.has(o)) return;
    const own = owner(o);
    if (!buckets.has(own)) buckets.set(own, new Map());
    const m = buckets.get(own); if (!m.has(o.material)) m.set(o.material, []); m.get(o.material).push(o);
  });
  for (const [own, byMat] of buckets) {
    _inv.copy(own.matrixWorld).invert();
    for (const [mat, meshes] of byMat) {
      if (meshes.length < 2) continue;
      const geos = meshes.map(ms => { const g = ms.geometry.index ? ms.geometry.toNonIndexed() : ms.geometry.clone(); _mm.multiplyMatrices(_inv, ms.matrixWorld); g.applyMatrix4(_mm); ['uv1', 'uv2', 'tangent'].forEach(a => g.deleteAttribute(a)); if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2)); return g; });
      let merged; try { merged = _merge(geos, false); } catch (e) { merged = null; }
      if (!merged) continue;
      const out = new THREE.Mesh(merged, mat); const isInk = mat === inkMat; out.castShadow = !isInk; out.receiveShadow = !isInk; out.userData.outline = isInk;
      own.add(out);
      meshes.forEach(ms => { ms.parent.remove(ms); });
    }
  }
  return root;
}
export { inkMat };
