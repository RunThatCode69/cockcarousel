
// ================================================================
//  VIEWS — every game entity gets a 3D object; this keeps them in sync and animated
// ================================================================
const SIGNS = {};   // name -> [text, sub, bg, fg]
function bakeSign(name, text, sub, bg, fg) { SIGNS[name] = [text, sub, bg, fg]; }
let boardN = 4, boardTex = null;
function bakeBoard(n) { boardN = n; if (boardTex) { paintBoard(); boardTex.needsUpdate = true; } }
function paintBoard() { const c = boardTex.image; const g = c.getContext('2d'); const old = A2.ctx; setCtx(g); g.clearRect(0, 0, 256, 140); rr(6, 6, 244, 128, 12); fs('#1a1a2a', INK, 6); txt('NOW SERVING', 128, 40, 26, CYAN, 'center', null); txt(String(boardN), 128, 96, 56, '#ff4d6d', 'center', null); setCtx(old); }
const WHO_SPR = { PRICK: ['prick'], MACMILLI: ['mac'], SARGE: ['sarge'], SOUP: ['soup'], GAS: ['gas'], GROPES: ['gropes'], JACKOFF: ['boss', 'boss2'], VAS: ['vas'], JIGGLES: ['jiggles'], DOOLEY: ['dooley'], RAMIREZ: ['ramirez'], SACKMAN: ['vas'], CHUCK: ['gas'], GRINDER: ['gropes'] };
const H3 = { crab: 0.32, bee: 0.95, condom: 0.6, chili: 0.55, ice: 0.4, trap: 0.1, target: 0.72, boss: 1.1 };   // where a glob should hit, per type (metres)
const spriteCache = new Map();
function spriteFromPainter(name, painter, pose = {}, additive = false) {
  const key = name + JSON.stringify(pose);
  let tex = spriteCache.get(key);
  if (!tex) { const c = bake(256, 256, () => { A2.ctx.scale(2, 2); painter(64, 124, pose); }); tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; spriteCache.set(key, tex); }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: !additive, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending }));
  s.center.set(0.5, 0.02); return s;
}
const bigPubeGeo = (() => { const pts = []; for (let k = 0; k <= 30; k++) { const q = k / 30; pts.push(new THREE.Vector3(Math.sin(q * 11) * 0.8 * (1 - q * 0.3), q * 5, Math.cos(q * 9) * 0.6)); } return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.12, 8); })();
const tuftGeo = (() => { const t = MD.makeTuft(0); const geos = []; t.children.forEach(m => { const g = m.geometry.clone(); geos.push(g); }); return mergeGeometries(geos); })();
const tuftMat = MD.toon('#3a2a1b');   // (own material: the grass colour changes per mission)
function makeView(e) {
  let o = null;
  if (e.kind === 'enemy') {
    switch (e.type) {
      case 'crab': o = MD.makeCrab(); break;
      case 'bee': o = MD.makeBee(); break;
      case 'condom': o = MD.makeCondom(); break;
      case 'chili': o = MD.makeChili(); break;
      case 'ice': o = MD.makeIce(); o.scale.setScalar(1.4); break;
      case 'trap': o = MD.makeTrap(); o.scale.setScalar(1.3); break;
      case 'target': o = MD.makeTarget(e.civ); o.scale.setScalar(1.25); break;
      case 'boss': o = MD.makeDick({ coat: true, onearm: true, face: 'boss', skin: '#e9b39d', scale: 2.3 }); break;
    }
  } else if (e.kind === 'npc') {
    const S = { sarge: { hat: 'drill', face: 'sarge', scale: 1.2, gear: true, gearC: '#6b6a4a', pistol: true }, prick: { hat: 'boonie', face: 'prick', skin: '#cfc0cc', head: '#b992a8', cigar: true, scale: 1.2, gear: true, gun: 'rifle' },
      soup: { hat: 'helmet', helmetC: '#5b6b3c', scale: 1.15, gear: true, gun: 'rifle' }, mac: { hat: 'boonie', face: 'prick', skin: '#8a9a5a', head: '#7a8a4a', scale: 1.15, gear: true, gearC: '#5a6a3a', gun: 'sniper' }, tvop: { hat: 'helmet', helmetC: '#3a4a6a', scale: 1.1, gear: true }, thug: { hat: 'beanie', face: 'angry', scale: 1.15, gear: true, gearC: '#2a2a2e', gun: 'rifle' }, gas: { hat: 'helmet', helmetC: '#3a4a6a', bandana: true, scale: 1.15, gear: true, gearC: '#3e4a5a', gun: 'rifle' }, gropes: { hat: 'helmet', helmetC: '#6a3a3a', scale: 1.15, gear: true, gun: 'rifle' },
      vas: { hat: 'helmet', helmetC: '#8a7e5a', face: 'prick', skin: '#e0b89a', head: '#c9867c', cigar: true, scale: 1.18, gear: true, gearC: '#7a6e4e', gun: 'rifle' }, jiggles: { hat: 'helmet', helmetC: '#7e7654', bandana: true, scale: 1.2, gear: true, gearC: '#6e6446', gun: 'rifle' },
      dooley: { hat: 'helmet', helmetC: '#857a58', scale: 1.1, gear: true, gearC: '#746a4c', gun: 'rifle', skin: '#c99a7a', head: '#b87a6a' }, ramirez: { hat: 'helmet', helmetC: '#7a7050', scale: 1.14, gear: true, gearC: '#6a6046', gun: 'rifle', skin: '#b98a68', head: '#a86a5a' },
      boss: { coat: true, onearm: true, face: 'boss', skin: '#e9b39d', scale: 3.2 }, boss2: { coat: true, face: 'boss', skin: '#e9b39d', scale: 2.3 } }[e.spr];
    if (e.spr === 'lady') o = MD.makeLady({ dress: e.dress, hair: e.hair });
    else if (S) o = MD.makeDick(e.mscale ? Object.assign({}, S, { scale: e.mscale }) : S);
    else if (e.spr === 'heli') { o = MD.makeHeli(); }
  } else if (e.kind === 'pickup') {
    o = { eggplant: MD.makeEggplant, crate: MD.makeCrate, ticket: MD.makeTicket, pistol: MD.makePistol, lotion: MD.makeLotion, pill: MD.makePill }[e.type]?.();
  } else if (e.kind === 'deco') {
    if (e.spr === 'heli') { o = MD.makeHeli(); o.scale.setScalar(1.5); }
    else if (e.spr === 'chinook') { o = MD.makeChinook(); o.scale.setScalar(e.scale || 1); }
    else if (MD.PROP3D[e.spr]) { o = MD.PROP3D[e.spr](); if (e.scale) o.scale.setScalar(e.scale); }
    else if (SIGNS[e.spr]) { const s = SIGNS[e.spr]; o = MD.makeSign(s[0], s[1], s[2], s[3]); o.rotation.y = Math.atan2(M.start[0] - e.x, M.start[1] - e.y); }
    else if (e.spr === 'sign') o = MD.makeSign('SIGN', '');
    else if (e.spr === 'board') { const c = mkCanvas(256, 140); boardTex = new THREE.CanvasTexture(c); boardTex.colorSpace = THREE.SRGBColorSpace; paintBoard(); o = new THREE.Group(); o.add(new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.6, 0.05), new THREE.MeshBasicMaterial({ map: boardTex }))); o.children[0].position.y = 1.7; }
    else if (e.spr === 'bigpube') { o = new THREE.Group(); const m = new THREE.Mesh(bigPubeGeo, tuftMat); m.castShadow = true; o.add(m); }
    else if (e.spr === 'pube' || e.spr === 'bush') { addTuft(e); return null; }
    else if (e.spr === 'splat') o = spriteFromPainter('splat', A2.splatArt);
    else if (e.spr === 'blast') o = spriteFromPainter('blast', A2.blastArt, {}, true);
    else if (e.spr === 'fire') o = spriteFromPainter('fire', A2.fireArt, { f: 1 }, true);
    else if (e.spr === 'smoke') o = spriteFromPainter('smoke', A2.smokeArt, { f: 1 });
    else if (e.spr === 'puddle') o = null;
    else { const p = A2[e.spr + 'Art']; if (p) o = spriteFromPainter(e.spr, p); }
    if (o && o.isSprite) { const h = (e.h || 1) * YS; o.scale.set(h * (e.w || e.h || 1) / (e.h || 1), h, 1); }
  }
  if (!o) return null;
  if (!o.isSprite && !o.isInstancedMesh) MD.bakeModel(o);
  dyn.add(o); return o;
}
let tuftIM = null, tuftN = 0;
const TUFT_MAX = 900;
function resetTufts() { tuftMat.color.set((M && M.pal && M.pal.tuftC) || '#3a2a1b'); if (tuftIM) level.remove(tuftIM); tuftIM = new THREE.InstancedMesh(tuftGeo, tuftMat, TUFT_MAX); tuftIM.count = 0; tuftIM.castShadow = !isTouch; tuftIM.frustumCulled = false; tuftN = 0; level.add(tuftIM); }
function addTuft(e) {
  if (!tuftIM || tuftN >= TUFT_MAX) return;
  const s = e.spr === 'bush' ? 1.25 : 0.85 + ((e.seed || 0) % 3) * 0.1;
  _q.setFromAxisAngle(_up, (e.x * 7.3 + e.y * 3.1) % TAU); _v.set(e.x, 0, e.y); _s.set(s, s * (0.9 + ((e.x * 13) % 1) * 0.4), s);
  _m4.compose(_v, _q, _s); tuftIM.setMatrixAt(tuftN++, _m4); tuftIM.count = tuftN; tuftIM.instanceMatrix.needsUpdate = true;
}
function dropView(e) { if (e._v) { dyn.remove(e._v); e._v = null; } }
// small pooled things: globs, stingers, bottles, nuts, puddles, particles
const pools = {};
function pooled(kind, make) { const p = pools[kind] || (pools[kind] = { free: [], used: [] }); const o = p.free.pop() || make(); o.visible = true; if (!o.parent) dyn.add(o); p.used.push(o); return o; }
function releasePools() { for (const k in pools) { const p = pools[k]; for (const o of p.used) { o.visible = false; p.free.push(o); } p.used.length = 0; } }
const partMats = {
  drop: new THREE.SpriteMaterial({ color: '#f7f4ec' }), spark: new THREE.SpriteMaterial({ color: '#ffd23f', blending: THREE.AdditiveBlending }),
  puff: new THREE.SpriteMaterial({ color: '#c9c0b8', transparent: true, opacity: 0.6, depthWrite: false }), saucedrop: new THREE.SpriteMaterial({ color: '#e8311f' }),
};
const dotTex = (() => { const c = bake(64, 64, () => { E(32, 32, 28, 28); fs('#ffffff', null); }); return new THREE.CanvasTexture(c); })();
for (const k in partMats) { partMats[k].map = dotTex; partMats[k].transparent = true; }
const puddleGeo = new THREE.CircleGeometry(0.7, 20).rotateX(-Math.PI / 2), puddleMat = new THREE.MeshLambertMaterial({ color: '#e8311f', transparent: true, opacity: 0.85 });
const seen = new Set();
function syncViews() {
  const p = player;
  seen.clear();
  for (const e of ents) {
    if (e.gone) continue;
    if (e._v === undefined) e._v = makeView(e);
    const o = e._v; if (!o) continue;
    seen.add(o);
    o.position.set(e.x, (e.z || 0) * YS, e.y);
    const ud = o.userData, moving = e._lx !== undefined && Math.hypot(e.x - e._lx, e.y - e._ly) > 0.002; e._lx = e.x; e._ly = e.y;
    if (e.kind === 'enemy' || e.kind === 'npc') {
      const face = e.faceA !== undefined ? e.faceA : Math.atan2(p.x - e.x, p.y - e.y);
      if (!e.dead) o.rotation.y = lerpA(o.rotation.y, face, 0.2);
      const wk = t * 0.35 + (e.seed || 0);
      // hurt: a quick squash-pop
      const pop = e.hurtT > 0 ? 1 + e.hurtT * 0.025 : 1;
      if (ud.body) { ud.body.scale.set(pop, 1 / pop, pop); }
      if (e.dead) {
        const k = clamp((t - (e.deadT || t)) / 20, 0, 1);
        if (ud.kind === 'dick') { MD.setFace(o, 'dead'); ud.body.rotation.x = -k * 1.45; }
        else if (ud.kind === 'target') ud.board.rotation.x = -k * 1.5;
        else if (ud.body) { ud.body.rotation.z = k * Math.PI * 0.9; ud.body.position.y = (ud.kind === 'bee' ? 0.55 : 0.2) * (1 - k) + 0.1; }
        if (e.alpha !== undefined && e.alpha < 1) o.visible = e.alpha > 0.05;
        continue;
      }
      switch (ud.kind) {
        case 'crab': ud.legs.forEach((l, i) => { l.rotation.x = moving ? Math.sin(wk * 1.6 + i) * 0.5 : 0; }); ud.claws.forEach((c, i) => { c.rotation.x = e.attackT > 0 ? -0.9 : Math.sin(t * 0.12 + i) * 0.2; }); ud.body.position.y = 0.2 + (moving ? Math.abs(Math.sin(wk)) * 0.04 : 0); break;
        case 'bee': ud.wings.forEach((w, i) => { w.rotation.y = Math.sin(t * 1.4 + i * Math.PI) * 0.7; }); ud.body.position.y = 0.55 + Math.sin(t * 0.1 + (e.seed || 0)) * 0.05; ud.body.rotation.x = e.attackT > 0 ? 0.5 : 0; break;
        case 'condom': ud.body.rotation.z = Math.sin(wk * 0.8) * (moving ? 0.1 : 0.04); ud.arms.forEach((a, i) => { a.rotation.set(0, (i ? -1 : 1) * 0.9, 0); }); if (ud.gun) ud.gun.position.z = 0.24 - (e.attackT > 0 ? 0.06 : 0); MD.setFace(o, e.attackT > 0 ? 'yell' : 'angry'); break;
        case 'chili': ud.body.rotation.z = Math.sin(t * 0.08 + (e.seed || 0)) * 0.06; ud.bottle.rotation.x = e.attackT > 0 ? -1.8 : 0; break;
        case 'ice': ud.body.position.x = Math.sin(t * 0.9 + (e.seed || 0)) * 0.015; break;
        case 'trap': ud.bar.rotation.z = e.attackT > 0 ? -2.9 : 0; break;
        case 'lady': { const d = e.dance ? (e.walk || 0) * 0.12 + (e.seed || 0) : 0; ud.body.position.y = e.dance ? Math.abs(Math.sin(d)) * 0.06 : 0; ud.body.rotation.z = e.dance ? Math.sin(d) * 0.12 : 0; ud.body.rotation.y = e.dance ? Math.sin(d * 0.5) * 0.4 : 0; ud.arms.forEach((a, i) => { a.rotation.z = e.dance ? (i ? 1 : -1) * (2.4 + Math.sin(d * 2 + i) * 0.4) : 0; }); break; }
        case 'dick': {
          const walk = moving ? Math.sin(wk) : 0;
          ud.body.position.y = Math.abs(walk) * 0.05; ud.body.rotation.z = walk * 0.06;
          if (ud.heldGun) ud.arms.forEach((a, i) => { a.rotation.set(0, (i ? -1.15 : 1.15) + walk * 0.08, 0); });   // both hands forward on the rifle
          else ud.arms.forEach((a, i) => { a.rotation.x = e.attackT > 0 ? -1.3 : walk * (i ? 0.5 : -0.5); a.rotation.z = e.attackT > 0 ? (i ? 0.4 : -0.4) : 0; });
          const base = ud.baseFace || 'happy', talking = radio && radio.life > 12 && WHO_SPR[radio.who] && WHO_SPR[radio.who].includes(e.spr) && (voiceBusy() || (radio.max - radio.life) < radio.text.length * 2.2);
          if (talking) MD.setFace(o, ((t >> 2) + (e.seed || 0)) % 3 ? base + '_talk' : base);
          else if (e.type === 'boss' || e.spr === 'boss' || e.spr === 'boss2') MD.setFace(o, e.attackT > 0 ? 'bossyell' : 'boss');
          else MD.setFace(o, e.attackT > 0 ? (e.spr === 'sarge' ? 'sarge' : 'yell') : base);
          if (ud.shaft) ud.shaft.rotation.x = -0.1 + Math.sin(t * 0.05 + (e.seed || 0)) * 0.03;
          break;
        }
      }
    } else if (e.kind === 'pickup') {
      if (ud.spin) ud.spin.rotation.y += 0.04; o.position.y = (e.z || 0) * YS + (e.type === 'crate' ? 0 : Math.sin(t * 0.08) * 0.05);
    } else if (e.kind === 'deco') {
      if (o.isSprite && e.alpha !== undefined) o.material.opacity = e.alpha;
      if (e.spr === 'blast') { const k = 1 - clamp((e.fade || 0) / 22, 0, 1); o.scale.setScalar(2 + k * 5); o.material.opacity = 1 - k; }
      if (e.spr === 'heli' && ud.rotor) ud.rotor.rotation.y += 0.5;
      if (ud.kind === 'chinook') { o.rotation.z = e.tilt || 0; ud.rotorF.rotation.y += 0.55; ud.rotorB.rotation.y -= 0.55; ud.ramp.rotation.z = lerp(ud.ramp.rotation.z, (e.rampK || 0) * 1.84, 0.04); ud.beam.visible = !!e.beam; }
      if (ud.spin) { if (ud.spin.userData.slow) ud.spin.rotation.z += 0.0015; else ud.spin.rotation.y += 0.008; }
      if (ud.strobe) ud.strobe.visible = t % 40 < 4;
      if (e.faceA !== undefined && !o.isSprite) o.rotation.y = e.faceA;
      if (e.rock !== undefined) o.rotation.z = e.rock;
      if (ud.turret && e.turretA !== undefined) ud.turret.rotation.y = -e.turretA - (e.faceA || 0);
      if (ud.barrel) ud.barrel.position.x = 0.8 - (e.recoil || 0) * 0.35;
      if (ud.flag) ud.flag.rotation.y = Math.sin(t * 0.05) * 0.2;
    }
  }
  // remove views whose entities are gone
  for (let i = dyn.children.length - 1; i >= 0; i--) { const o = dyn.children[i]; if (o.userData.pooled) continue; if (!seen.has(o)) dyn.remove(o); }
  // pooled transient things
  releasePools();
  for (const g of globs) { if (player && dist(g, player) < 0.8) continue;   // a glob right at the muzzle filled half the screen: only show it once it's out in front
    const o = pooled('glob', () => { const m = MD.makeGlob(); m.userData.pooled = true; return m; }); o.scale.setScalar(0.09); o.position.set(g.x, g.y3 !== undefined ? g.y3 : 0.6, g.y); }
  for (const q of eproj) { const o = pooled(q.spr, () => { const m = q.spr === 'bottle' ? MD.makeBottle() : q.spr === 'condomshot' ? MD.makeCondomShot() : MD.makeStinger(); m.userData.pooled = true; return m; }); o.position.set(q.x, (q.z || 0.5) * YS, q.y); o.rotation.y = Math.atan2(q.vx, q.vy) + Math.PI; if (q.spr === 'bottle') o.rotation.x += 0.3; if (q.spr === 'condomshot') o.rotation.z += 0.25; }
  for (const g of aglobs) { if (g.delay > 0) continue; const o = pooled('glob', () => { const m = MD.makeGlob(); m.userData.pooled = true; return m; }); o.scale.setScalar(0.06); o.position.set(g.x, g.y3, g.y); }
  for (const r of rockets) { if (player && dist(r, player) < 1.2) continue; const o = pooled('rocket', () => { const m = MD.makeDildoRocket(); m.userData.pooled = true; return m; }); o.position.set(r.x, r.y3, r.y); o.rotation.set(0, -r.a, 0); }
  for (const n of nades) { if (player && dist(n, player) < 0.9) continue; if (n.impact) { const o = pooled('glob', () => { const m = MD.makeGlob(); m.userData.pooled = true; return m; }); o.position.set(n.x, n.z * YS, n.y); o.scale.setScalar(0.14); continue; }
    const o = pooled('nut', () => { const m = MD.makeNut(); m.userData.pooled = true; return m; }); o.position.set(n.x, n.z * YS, n.y); o.rotation.x += 0.3; }
  for (const q of puddles) { const o = pooled('puddle', () => { const m = new THREE.Mesh(puddleGeo, puddleMat); m.userData.pooled = true; m.receiveShadow = true; return m; }); o.position.set(q.x, 0.01, q.y); }
  for (const q of parts3) { const o = pooled('p_' + q.spr, () => { const s = new THREE.Sprite(partMats[q.spr] || partMats.drop); s.userData.pooled = true; return s; }); o.position.set(q.x, q.z * YS, q.y); const sz = q.spr === 'puff' ? 0.5 : 0.09; o.scale.set(sz, sz, 1); }
}
function lerpA(a, b, k) { return a + wrapA(b - a) * k; }
