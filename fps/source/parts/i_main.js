
// ================================================================
//  MAIN LOOP — fixed 60fps update, render 3D world + gun, then the 2D HUD on top
// ================================================================
function resizeAll() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  portrait = innerHeight > innerWidth * 1.1;
  scale = portrait ? Math.min(innerHeight / W, innerWidth / H) : Math.min(innerWidth / W, innerHeight / H);
  const w = W * scale, h = H * scale;
  wrap.style.width = w + 'px'; wrap.style.height = h + 'px';
  wrap.style.transform = portrait ? 'translate(-50%,-50%) rotate(90deg)' : 'translate(-50%,-50%)';
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  const rs = Math.min(dpr, isTouch ? 1.25 : 1.75);
  renderer.setPixelRatio(rs); renderer.setSize(w, h, false); composer.setPixelRatio(rs); composer.setSize(w, h); bloomPass.resolution.set(w / 2, h / 2);
}
resize = resizeAll;
renderer.info.autoReset = false;
// iPhone Safari: the toolbar sliding in and out fires a stream of resizes, and dragging can rubber-band the page.
// Only re-layout once things settle, and never let a touch scroll or zoom the page.
let rsT = null, lastWH = [innerWidth, innerHeight];
const onResize = () => { clearTimeout(rsT); rsT = setTimeout(() => { if (Math.abs(innerWidth - lastWH[0]) < 2 && Math.abs(innerHeight - lastWH[1]) < 2) return; lastWH = [innerWidth, innerHeight]; resize(); }, 180); };
addEventListener('resize', onResize); addEventListener('orientationchange', () => { lastWH = [0, 0]; onResize(); });
document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault());
resize();
let ambWant = null;
function syncAudio() {
  let m = null, a = null;
  if (state === 'title' || state === 'select' || state === 'brief' || state === 'clear') m = 'title';
  else if ((state === 'game' || state === 'pause') && M) { if (M.state === 'play' || M.state === 'rails') m = M.music; a = M.state === 'crawl' || M.state === 'showdown' ? 'fire' : M.amb; }
  else if (state === 'dead' && M) a = M.amb;
  playMusic(m);
  if (a !== ambWant && AUD.ctx) { ambWant = a; setAmbience(a); }
  audioTick();
}
function update() {
  t++; A2.setT(t); syncAudio();
  if (state === 'game') updateGame();
  else { stateT++; if (state === 'dead' || state === 'clear') { for (const j of jam) j.life--; jam = jam.filter(j => j.life > 0); shake *= 0.9; radioTick(); for (const a of announceQ) a.life--; announceQ = announceQ.filter(a => a.life > 0); } }
}
// the truck bed you ride in during the bridge chase: a tailgate bolted to the camera
const truck = (() => {
  const g = new THREE.Group(); const olive = MD.toon('#5b6b3c');
  const bed = MD.ink(new THREE.BoxGeometry(2.2, 0.5, 1.4), olive, 0.02); bed.position.set(0, -0.95, -0.2); g.add(bed);
  const gate = MD.ink(new THREE.BoxGeometry(2.2, 0.45, 0.08), olive, 0.02); gate.position.set(0, -0.62, -0.9); g.add(gate);
  const c = bake(256, 64, () => { rr(4, 4, 248, 56, 8); fs('#fff6e0', INK, 4); txt('BABY ON BOARD', 128, 32, 26, INK, 'center', null); });
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.18), new THREE.MeshBasicMaterial({ map: tx })); plate.position.set(0, -0.6, -0.945); plate.rotation.y = Math.PI; g.add(plate);
  g.visible = false; camera.add(g); scene.add(camera); return g;
})();
const _cv = new THREE.Vector3();
function renderWorld() {
  const p = player;
  // camera from the v2 camera model: x/y on the grid, camH as eye height, pitch px → radians, roll, fov
  const bob = p ? p.bobY * (isTouch ? 0.0015 : 0.004) : 0;
  camera.position.set(p.x, (camH + (p.jz || 0)) * YS + bob, p.y);
  camera.rotation.set(clamp(pitch * PX2RAD, -1.35, 1.35), -p.a - Math.PI / 2, roll);
  if (shake > 0.3) { const k = isTouch ? 0.0015 : 0.004; camera.position.x += rand(-1, 1) * shake * k; camera.position.y += rand(-1, 1) * shake * k; }
  camera.fov = 72 * (fovK / 0.66); camera.updateProjectionMatrix();
  if (M.state === 'gunship') gunshipCamera();
  // shadows follow you
  sun.target.position.set(p.x, 0, p.y); sun.position.set(p.x - 18, 34, p.y - 12);
  muzzleLight.position.set(p.x + Math.cos(p.a) * 0.6, camH * YS, p.y + Math.sin(p.a) * 0.6); muzzleLight.intensity = flashT > 0 ? 1.5 * flashT : 0;
  // objective beacon
  const g = M.goal && !M.goal.hidden && M.state === 'play' ? M.goal : null;
  beacon.visible = false && !!g; if (g) { beacon.position.set(g.x, 0, g.y); beacon.userData.ring.scale.setScalar(1 + 0.2 * Math.sin(t * 0.1)); }
  if (skyMesh) skyMesh.position.set(p.x, 0, p.y);
  rainTick(p.x, 0, p.y, !(M.indoor && M.indoor(p.x, p.y)));
  for (const s of skySpinners) s.rotation.y += 0.004;
  if (waterTex) waterTex.offset.x = (t * 0.002) % 1;
  truck.visible = M.state === 'rails';
  updateNav(); syncViews(); updateWeapon();
  sun.shadow.autoUpdate = false; if (!isTouch || t % 2 === 0) sun.shadow.needsUpdate = true;   // phones: shadows every other frame
  renderer.info.reset();
  vmPass.enabled = M.state !== 'crawl' && M.state !== 'cut' && M.state !== 'gunship' && state !== 'dead' && !(M.scope && player.ads > 0.75);
  gradePass.uniforms.time.value = (t % 100) * 0.37; gradeTick();
  composer.render();
}
function draw() {
  ctx = hctx; setCtx(hctx);
  hctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  hctx.clearRect(0, 0, W, H);
  if (M && player && (state === 'game' || state === 'dead' || state === 'clear' || state === 'pause')) {
    c3.style.visibility = 'visible';
    renderWorld();
    // weather + grade on the 2D layer
    const pal = M.pal;
    if (false) { hctx.strokeStyle = 'rgba(220,235,255,0.45)'; hctx.lineWidth = 2; for (let i = 0; i < 80; i++) { const x = (i * 97 + t * 3 + player.a * 300) % (W + 100) - 50, y = (i * 53 + t * 18) % (H + 40) - 20; hctx.beginPath(); hctx.moveTo(x, y); hctx.lineTo(x - 3, y - 18); hctx.stroke(); } }
    if (pal.weather === 'embers') for (let i = 0; i < 40; i++) { const x = (i * 131 + Math.sin(t * 0.02 + i) * 30 + player.a * 200) % (W + 40) - 20, y = (H + 20 - (i * 71 + t * 1.3) % (H + 40)); hctx.globalAlpha = 0.8; E(x, y, 2 + (i % 3), 2 + (i % 3)); fs((i + t / 10 | 0) % 2 ? YEL : '#ff7a3a', null); hctx.globalAlpha = 1; }
    if (pal.weather === 'dust') { hctx.globalAlpha = 0.45; for (let i = 0; i < 30; i++) { const x = (i * 131 + t * 0.7 + player.a * 200) % (W + 40) - 20, y = (i * 71 + Math.sin(t * 0.03 + i) * 20) % H; E(x, y, 2, 1.4); fs('#fff2c4', null); } hctx.globalAlpha = 1; }
    if (player.ads > 0.3) { const k = player.ads; const vg = hctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.85); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(20,0,20,${0.5 * k})`); hctx.fillStyle = vg; hctx.fillRect(0, 0, W, H); }
    const vg = hctx.createRadialGradient(W / 2, H / 2, H * 0.5, W / 2, H / 2, H * 1.0); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(20,0,20,0.35)'); hctx.fillStyle = vg; hctx.fillRect(0, 0, W, H);
    if (state === 'game') { drawNVG(); drawHUD(); }
    if (whiteOut > 0) { hctx.fillStyle = `rgba(255,255,255,${Math.min(1, whiteOut)})`; hctx.fillRect(0, 0, W, H); }
    if (M.pinup != null) drawPinup(M.pinup);
    if (M.blackOut > 0) { hctx.fillStyle = `rgba(0,0,0,${Math.min(1, M.blackOut)})`; hctx.fillRect(0, 0, W, H); }
    if (M.fadeText) { txt(M.fadeText[0], W / 2, H / 2 - 16, 34, '#fff', 'center', null); txt(M.fadeText[1], W / 2, H / 2 + 26, 34, PINK, 'center', null); }
    if (M.flags && M.flags.pressF && t - M.flags.pressF < 300 && state === 'game') { const k = M.flags.paid ? 'RESPECTS PAID' : (isTouch ? 'TAP TO PAY RESPECTS' : 'PRESS F TO PAY RESPECTS'); hctx.globalAlpha = Math.min(1, (300 - (t - M.flags.pressF)) / 40); rr(W / 2 - 170, H / 2 + 60, 340, 50, 12); fs('rgba(0,0,0,0.6)', '#fff', 2); txt(k, W / 2, H / 2 + 85, 24, '#fff', 'center', null); hctx.globalAlpha = 1; }
    if (M.state === 'showdown' && state === 'game' && !M.flags.bossDead) txt(isTouch ? 'TAP TO SHOOT' : 'CLICK TO SHOOT', W / 2, H - 60, 30 + Math.sin(t * 0.2) * 3, YEL);
    if (state === 'dead') drawDead();
    if (state === 'clear') drawClear();
    if (state === 'pause') drawPause();
  } else {
    c3.style.visibility = 'hidden';
    if (state === 'title') drawTitle();
    else if (state === 'select') drawSelect();
    else if (state === 'brief') drawBrief();
    else if (state === 'credits') drawCredits();
  }
  if (portrait && state !== 'game') txt('(turn your phone sideways for the full experience)', W / 2, H - 4, 11, '#fff', 'center', null);
}
let last = performance.now(), acc = 0;
function loop(now) {
  acc += Math.min(100, now - last); last = now;
  while (acc >= 1000 / 60) { update(); acc -= 1000 / 60; }
  draw();
  requestAnimationFrame(loop);
}
function boot() { bakeTextures(); requestAnimationFrame(loop); }
if (document.fonts && document.fonts.load) document.fonts.load(`20px ${FONT}`).then(boot, boot); else boot();
//__DBG__
