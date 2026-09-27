
// ================================================================
//  THE DICK-47, in 3D: stock, receiver, rail, red-dot, veiny barrel, a head for a muzzle, balls for a magazine.
//  Held in camo sleeves and gloves. Hip, ADS, sprint, reload, rack, throw, melee.
// ================================================================
const RELOAD_T = 80;
const ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k);
const GUN = (() => {
  // The whole gun is the dick: a thick veiny shaft is the barrel, the head is the muzzle, the balls are the magazine.
  // Only the grip, trigger and a skinny stock are "gun". Forward is -z.
  const gun = new THREE.Group();
  const dark = MD.toon('#2a2626'), skinM = MD.toon(SKIN), headM = MD.toon(HEAD), veinM = MD.toon('#d9829a');
  const add = (m, x, y, z) => { m.position.set(x, y, z); gun.add(m); return m; };
  // shaft: thick, slightly tapered, gently curving up
  const shaftPts = [new THREE.Vector2(0, -0.02), new THREE.Vector2(0.05, -0.012)]; for (let i = 0; i <= 14; i++) { const k = i / 14; shaftPts.push(new THREE.Vector2(0.066 - k * 0.008 + Math.sin(k * Math.PI) * 0.006, k * 0.46)); }
  const shaftGeo = new THREE.LatheGeometry(shaftPts, 24); shaftGeo.rotateX(-Math.PI / 2);
  const shaft = add(MD.ink(shaftGeo, skinM, 0.004), 0, 0, 0);
  // veins: raised, wiggly, a couple of branches
  [[0.06, 0.02, 0], [-0.056, 0.024, 1], [0.02, 0.062, 2], [-0.03, -0.055, 3], [0.045, -0.04, 4]].forEach(([vx, vy, i]) => {
    const pts = []; for (let k = 0; k <= 10; k++) { const q = k / 10; const r = 0.068 - q * 0.008; const ang = Math.atan2(vy, vx) + Math.sin(q * 7 + i) * 0.25; pts.push(new THREE.Vector3(Math.cos(ang) * r, Math.sin(ang) * r, -0.03 - q * (0.3 + (i % 2) * 0.08))); }
    gun.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.0085, 6), veinM));
  });
  // the head: big mushroom tip with a proper ridge, a slit and a shine
  const head = new THREE.Group(); head.position.set(0, 0, -0.5); gun.add(head);
  const hd = MD.ink(new THREE.SphereGeometry(1, 24, 16), headM, 0.004); hd.scale.set(0.08, 0.072, 0.09); hd.position.z = -0.03; head.add(hd);
  const ridge = MD.ink(new THREE.TorusGeometry(0.074, 0.016, 10, 28), MD.toon(HEAD2), 0.003); ridge.position.z = 0.03; head.add(ridge);
  const slit = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.03, 0.01), new THREE.MeshBasicMaterial({ color: '#8a2a4a' })); slit.position.set(0, 0.0, -0.119); head.add(slit);
  const shine = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff' })); shine.scale.set(1.4, 0.7, 1); shine.position.set(0.03, 0.045, -0.05); head.add(shine);
  const post = MD.ink(new THREE.ConeGeometry(0.008, 0.03, 8), MD.toon('#ffd23f'), 0.002); post.position.set(0, 0.083, -0.02); head.add(post);   // front sight post
  // a fold of skin where head meets shaft
  const fold = MD.ink(new THREE.TorusGeometry(0.066, 0.012, 8, 24), MD.toon(SKIN2), 0.002); fold.position.z = -0.45; gun.add(fold);
  // balls = the magazine, hanging below the base
  const mag = new THREE.Group(); mag.position.set(0, -0.075, 0.02); gun.add(mag);
  [-1, 1].forEach(s => { const b = MD.ink(new THREE.SphereGeometry(1, 20, 14), skinM, 0.004); b.scale.set(0.068, 0.076, 0.07); b.position.set(s * 0.052, -0.02, 0); mag.add(b); });
  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.1, 0.1), MD.toon(SKIN2)); seam.position.set(0, -0.02, 0.01); mag.add(seam);
  // pubes at the base (a little curly ring)
  const pubeM = MD.toon('#3a2a1a'); const bush = new THREE.Group(); gun.add(bush);
  for (let i = 0; i < 10; i++) { const a = -0.3 + i / 9 * (Math.PI + 0.6); const pts = []; for (let k = 0; k <= 5; k++) { const q = k / 5; pts.push(new THREE.Vector3(Math.cos(a) * (0.066 + q * 0.014) + Math.sin(q * 9 + i) * 0.004, Math.sin(a) * (0.066 + q * 0.014) + Math.cos(q * 8 + i) * 0.004, 0.005 - q * 0.008)); } bush.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, 0.0022, 3), pubeM)); }
  // rear sight: a little pink heart ring on top of the base
  const ring = MD.ink(new THREE.TorusGeometry(0.016, 0.004, 6, 16), MD.toon(PINK), 0.002); ring.position.set(0, 0.083, -0.03); gun.add(ring);
  add(MD.ink(new THREE.BoxGeometry(0.006, 0.018, 0.01), dark, 0.001), 0, 0.064, -0.03);
  // the only actual gun bits: pistol grip, trigger guard, a skinny padded stock
  const grip = MD.ink(new THREE.BoxGeometry(0.03, 0.075, 0.036), dark, 0.002); grip.rotation.x = 0.35; add(grip, 0, -0.085, 0.075);
  const guard = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.004, 6, 12, Math.PI), dark); guard.rotation.set(0, Math.PI / 2, Math.PI); add(guard, 0, -0.06, 0.05);
  // strap
  const strapPts = []; for (let k = 0; k <= 10; k++) { const q = k / 10; strapPts.push(new THREE.Vector3(-0.06, -0.03 - Math.sin(q * Math.PI) * 0.1, 0.06 - q * 0.4)); }
  gun.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(strapPts), 20, 0.007, 4), MD.toon('#4c5828')));
  // muzzle flash: a white glob splat
  const flashTex = (() => { const c = bake(128, 128, () => { E(64, 64, 34, 30); fs(CUM, CUM2, 5); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; E(64 + Math.cos(a) * 46, 64 + Math.sin(a) * 42, 10, 9); fs(CUM, CUM2, 3); } E(54, 54, 10, 6); fs('#fff', null); }); return new THREE.CanvasTexture(c); })();
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, transparent: true, depthWrite: false })); flash.position.set(0, 0, -0.66); flash.scale.setScalar(0.2); gun.add(flash);
  MD.bakeModel(gun, [head, mag, shaft, bush]);
  return { gun, head, mag, shaft, flash, bush };
})();
// arms: camo sleeves, fingerless gloves
const camoTex = (() => { const c = bake(128, 128, () => { A2.ctx.fillStyle = '#b8a47a'; A2.ctx.fillRect(0, 0, 128, 128); for (let i = 0; i < 26; i++) { E((i * 37) % 128, (i * 71) % 128, 10 + (i % 4) * 4, 7 + (i % 3) * 3, i); fs(i % 5 === 0 ? '#d98aa0' : i % 2 ? '#8a7650' : '#6b5a3a', null); } }); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; return tx; })();
function makeArm() {
  const g = new THREE.Group();
  const sleeve = MD.ink(new THREE.CylinderGeometry(0.045, 0.06, 0.5, 12), new THREE.MeshToonMaterial({ map: camoTex, gradientMap: MD.toon('#fff').gradientMap }), 0.004);
  sleeve.rotation.x = Math.PI / 2; sleeve.position.z = 0.27; g.add(sleeve);
  const cuff = MD.ink(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 12), MD.toon('#6b5a3a'), 0.003); cuff.rotation.x = Math.PI / 2; cuff.position.z = 0.03; g.add(cuff);
  const glove = MD.ink(new THREE.BoxGeometry(0.075, 0.06, 0.07), MD.toon('#2f2a2a'), 0.004); g.add(glove);
  for (let i = 0; i < 4; i++) { const f = MD.ink(new THREE.CapsuleGeometry(0.009, 0.025, 3, 6), MD.toon(SKIN), 0.002); f.rotation.x = Math.PI / 2; f.position.set(-0.026 + i * 0.017, 0.012, -0.045); g.add(f); }
  return g;
}
const armR = MD.bakeModel(makeArm()), armL = MD.bakeModel(makeArm());
const heldNut = MD.makeNut(); heldNut.scale.setScalar(0.4); heldNut.visible = false; armL.add(heldNut); heldNut.position.set(0, 0.05, -0.04);
const rig = new THREE.Group(); rig.add(GUN.gun); vmScene.add(rig); vmScene.add(armR); vmScene.add(armL);
const _gp = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _tmpQ = new THREE.Quaternion();
let gunLag = 0, gunLagX = 0, lastLookP = 0, lastA = 0;
// point an arm (whose sleeve runs along +z from the hand) from a shoulder position to a hand position
function placeArm(arm, hand, shoulder) { arm.position.copy(hand); arm.lookAt(shoulder); }   // the sleeve runs along +z, so aim +z at the shoulder
function updateWeapon() {
  const p = player; if (!p) return;
  const ads = ease(p.ads), spr = ease(p.sprint), mv = p.moving * (1 - 0.85 * p.ads);
  const dA = wrapA(p.a - lastA); lastA = p.a; gunLagX = lerp(gunLagX, clamp(-dA * 1.4, -0.06, 0.06), 0.2);
  gunLag = lerp(gunLag, clamp((p.lookP - lastLookP) * 0.0025, -0.05, 0.05), 0.2); lastLookP = p.lookP;
  const bob = Math.sin(p.walkT * 0.11) * mv, bob2 = Math.abs(Math.cos(p.walkT * 0.11)) * mv;
  const rec = p.recoil;
  const r = p.reloading ? 1 - p.reloadT / RELOAD_T : 0;
  const tilt = r > 0 ? Math.sin(Math.min(1, r / 0.8) * Math.PI) : 0;
  const drop = r <= 0 ? 0 : r < 0.3 ? ease(r / 0.3) : r < 0.62 ? 1 - ease((r - 0.3) / 0.32) : 0;
  const rack = r > 0.66 ? Math.sin(ease((r - 0.66) / 0.34) * Math.PI) : 0;
  const butt = p.buttT > 0 ? Math.sin(p.buttT / 22 * Math.PI) : 0;
  const thr = p.throwT > 0 ? 1 - p.throwT / 28 : 0;
  const lower = Math.max(spr, thr > 0 ? Math.sin(thr * Math.PI) * 0.8 : 0);
  // hip → ADS blend. ADS puts the red dot's centre on the camera axis.
  const hip = [0.24, -0.215, -0.56], adsP = [0, -0.083, -0.3];   // ADS: the heart ring and the front post line up on the crosshair
  const g = GUN.gun;
  const pistol = M && M.state === 'showdown'; g.scale.set(pistol ? 0.8 : 1, pistol ? 0.8 : 1, pistol ? 0.45 : 1);   // Prick's slid-over sidearm: a stubby DICK-9mm
  g.position.set(lerp(hip[0], adsP[0], ads), lerp(hip[1], adsP[1], ads), lerp(hip[2], adsP[2], ads));
  g.position.x += bob * 0.012 * (1 + spr) + gunLagX * (1 - ads) + lower * 0.08;
  g.position.y += -bob2 * 0.01 * (1 + spr) + gunLag * (1 - 0.6 * ads) - lower * 0.12 - tilt * 0.04 + (p.crouch ? -0.006 : 0) + Math.sin(t * 0.03) * 0.003 * (1 - ads);
  g.position.z += rec * (0.05 - 0.03 * ads) - butt * 0.18 + tilt * 0.03;
  g.rotation.set(rec * 0.12 * (1 - 0.6 * ads) - lower * 0.5 + tilt * 0.25 - butt * 0.2 + lerp(0.05, 0, ads), lerp(0.3, 0, ads) + lower * 0.7 - tilt * 0.3, lerp(0.05, 0, ads) - tilt * 0.55 + lower * 0.3);
  // reload: the balls drop out and a fresh pair comes up; then rack the tip
  GUN.mag.position.y = -0.075 - drop * 0.35; GUN.mag.visible = !(r > 0.2 && r < 0.4);
  GUN.head.position.z = -0.5 + rack * 0.06;
  GUN.shaft.scale.z = 1 - rack * 0.12;
  // muzzle flash
  GUN.flash.visible = rec > 0.55; GUN.flash.scale.setScalar(0.12 + (rec - 0.55) * 0.4); GUN.flash.material.rotation = t;
  vmFlash.intensity = rec > 0.5 ? 6 * rec : 0;
  // hands: right on the grip; left on the foregrip, or on the balls during a reload, or on the head when racking, or throwing a nut
  g.updateMatrixWorld();
  const toW = (x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(g.matrixWorld);
  const rh = toW(0, -0.11, 0.08);
  placeArm(armR, rh, _b.set(0.42, -0.55, 0.05));
  let lh;
  if (r > 0 && r < 0.62) lh = toW(0, -0.11 - drop * 0.35, 0.02);
  else if (rack > 0) lh = toW(0.03, 0.0, -0.46 + rack * 0.06);
  else lh = toW(-0.01, -0.085, -0.27);   // the left hand wraps the shaft. obviously.
  if (thr > 0) { const k = Math.sin(thr * Math.PI); lh.lerp(new THREE.Vector3(-0.2, -0.02 + 0.08 * Math.sin(thr * Math.PI * 1.5), -0.3), k); }
  placeArm(armL, lh, _b.set(-0.3, -0.6, 0.05));
  heldNut.visible = thr > 0 && thr < 0.55;
  GUN.bush.visible = ads < 0.5;
  vmCam.fov = lerp(58, 50, ads); vmCam.updateProjectionMatrix();
}
