
// ================================================================
//  WORLD — grid collision (same as v2), three.js scene, level builder, sky, lights, nav line, entity sync
// ================================================================
const WALLS = '#ABCGPXV', NOWALK = '~';
const YS = 1.6;                    // one old "wall unit" of height in metres-ish: eye height = camH * YS
const PX2RAD = 0.004;              // v2 pitch was in screen pixels; this turns it into radians
let M = null, map = [], MW = 0, MH = 0, mini = null, blocked = null;
let camH = 0.5, pitch = 0, roll = 0, ts = 1, fovK = 0.66;
const cell = (x, y) => (y < 0 || y >= MH || x < 0 || x >= MW) ? '#' : map[y][x];
const solid = (x, y) => WALLS.includes(cell(x | 0, y | 0));
const walkable = (x, y) => { const xi = x | 0, yi = y | 0; const c = cell(xi, yi); return !WALLS.includes(c) && !NOWALK.includes(c) && !(blocked && blocked[yi * MW + xi]); };
function setCell(x, y, ch) { map[y][x] = ch; buildMini(); rebuildWalls(); }
function loadMap(rows) { map = rows.map(r => r.split('')); MH = map.length; MW = map[0].length; blocked = new Uint8Array(MW * MH); buildMini(); }
function buildMini() {
  const px = 4;
  mini = bake(MW * px, MH * px, (c) => {
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      const ch = map[y][x];
      if (WALLS.includes(ch)) c.fillStyle = ch === 'G' ? YEL : '#4a1d3a';
      else if (ch === '~') c.fillStyle = 'rgba(126,214,223,0.6)';
      else if (ch === ',') c.fillStyle = 'rgba(58,42,26,0.45)';
      else c.fillStyle = 'rgba(255,255,255,0.22)';
      c.fillRect(x * px, y * px, px, px);
    }
  });
}
function los(x0, y0, x1, y1) {
  const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy);
  if (d < 0.01) return true;
  const n = Math.ceil(d * 4), sx = dx / n, sy = dy / n;
  let x = x0, y = y0;
  for (let i = 0; i < n; i++) { x += sx; y += sy; if (solid(x, y) && wallH(cell(x | 0, y | 0)) > 0.95) return false; }
  return true;
}
// can a glob get there? (low cover blocks shots even though you can see over it)
function losShot(x0, y0, x1, y1) {
  const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy); if (d < 0.01) return true;
  const n = Math.ceil(d * 4), sx = dx / n, sy = dy / n; let x = x0, y = y0;
  for (let i = 0; i < n; i++) { x += sx; y += sy; if (solid(x, y)) return false; }
  return true;
}
function moveBody(b, dx, dy, r = 0.25) {
  const okX = walkable(b.x + dx + Math.sign(dx) * r, b.y - r) && walkable(b.x + dx + Math.sign(dx) * r, b.y + r);
  if (okX) b.x += dx;
  const okY = walkable(b.x - r, b.y + dy + Math.sign(dy) * r) && walkable(b.x + r, b.y + dy + Math.sign(dy) * r);
  if (okY) b.y += dy;
  return okX && okY;
}
// route finding on the grid (for the nav line and the compass arrow)
function findPath(sx, sy, tx, ty) {
  sx |= 0; sy |= 0; tx |= 0; ty |= 0;
  if (!walkable(tx + 0.5, ty + 0.5)) { for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1]]) if (walkable(tx + dx + 0.5, ty + dy + 0.5)) { tx += dx; ty += dy; break; } }
  const prev = new Int32Array(MW * MH).fill(-2), q = new Int32Array(MW * MH); let qh = 0, qt = 0;
  const s0 = sy * MW + sx, goal = ty * MW + tx; if (s0 < 0 || s0 >= MW * MH) return null;
  prev[s0] = -1; q[qt++] = s0;
  while (qh < qt) {
    const c = q[qh++]; if (c === goal) break;
    const x = c % MW, y = (c / MW) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue;
      const n = ny * MW + nx; if (prev[n] !== -2 || !walkable(nx + 0.5, ny + 0.5)) continue;
      prev[n] = c; q[qt++] = n;
    }
  }
  if (prev[goal] === -2) return null;
  const path = []; let c = goal; while (c !== -1) { path.push([c % MW + 0.5, ((c / MW) | 0) + 0.5]); c = prev[c]; }
  return path.reverse();
}

// ---------- three.js setup ----------
const renderer = new THREE.WebGLRenderer({ canvas: c3, antialias: !isTouch, powerPreference: 'high-performance' });
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.autoClear = false;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(72, W / H, 0.05, 260);
camera.rotation.order = 'YXZ';
const vmScene = new THREE.Scene();                 // the gun lives in its own scene so it never clips into walls
const vmCam = new THREE.PerspectiveCamera(58, W / H, 0.01, 10);
vmScene.add(new THREE.HemisphereLight('#fff4f0', '#6a4a5a', 1.6));
const vmSun = new THREE.DirectionalLight('#fff0e0', 1.8); vmSun.position.set(-1, 2, 1.5); vmScene.add(vmSun);
const vmFlash = new THREE.PointLight('#fff2c8', 0, 3); vmFlash.position.set(0, -0.05, -0.8); vmScene.add(vmFlash);
let level = new THREE.Group(); scene.add(level);
const dyn = new THREE.Group(); scene.add(dyn);      // entities
const hemi = new THREE.HemisphereLight('#ffffff', '#886655', 1.2); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff2e0', 2.2); sun.castShadow = true;
sun.shadow.mapSize.set(isTouch ? 1024 : 2048, isTouch ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 70 }); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
scene.add(sun); scene.add(sun.target);
const muzzleLight = new THREE.PointLight('#fff2c8', 0, 6, 1.5); scene.add(muzzleLight);
let skyMesh = null, wallGroup = null;
function texOf(name, rep = [1, 1]) {
  const src = TEX[name] || FT[name]; if (!src) return null;
  const tx = new THREE.CanvasTexture(src); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(rep[0], rep[1]);
  tx.anisotropy = isTouch ? 2 : 8; tx.magFilter = THREE.LinearFilter; return tx;
}
const texMatCache = new Map();
function texMat(name, toonish = false) {
  if (texMatCache.has(name)) return texMatCache.get(name);
  const map = texOf(name);
  const m = new THREE.MeshLambertMaterial({ map });
  texMatCache.set(name, m); return m;
}
function wallH(ch) { const h = M && M.heights && M.heights[ch]; return h !== undefined ? h : (ch === 'G' ? 1.4 : 1.8); }
function wallTexName(ch, x, y) {
  const v = M.variants && M.variants[ch];
  if (v && (x * 73 + y * 151) % v[1] === 0) return v[0];
  return M.tex[ch] || M.tex['#'];
}
// walls: one merged mesh per texture. Every box face gets UVs in metres so bricks stay brick-sized on tall walls.
function rebuildWalls() {
  if (wallGroup) { level.remove(wallGroup); wallGroup.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  wallGroup = new THREE.Group(); level.add(wallGroup);
  const byTex = new Map();
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const ch = map[y][x]; if (!WALLS.includes(ch)) continue;
    // skip walls buried inside other walls (no open neighbour): they can't be seen
    let open = false; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = cell(x + dx, y + dy); if (!WALLS.includes(n) || wallH(n) < wallH(ch)) open = true; }
    if (!open && x > 0 && y > 0 && x < MW - 1 && y < MH - 1) continue;
    const h = wallH(ch) * YS;
    const g = new THREE.BoxGeometry(1, h, 1);
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) { const face = (i / 4) | 0; if (face !== 2 && face !== 3) uv.setY(i, uv.getY(i) * h / 1.2); }
    g.translate(x + 0.5, h / 2, y + 0.5);
    const tn = wallTexName(ch, x, y); if (!byTex.has(tn)) byTex.set(tn, []); byTex.get(tn).push(g);
  }
  for (const [tn, geos] of byTex) {
    const merged = mergeGeometries(geos, false); geos.forEach(g => g.dispose());
    const mesh = new THREE.Mesh(merged, texMat(tn)); mesh.castShadow = true; mesh.receiveShadow = true; wallGroup.add(mesh);
    // ink edges on top rims, so walls read as cartoon objects
  }
}
function floorMesh() {
  const g = new THREE.Group();
  const main = new THREE.Mesh(new THREE.PlaneGeometry(MW, MH), new THREE.MeshLambertMaterial({ map: texOf(M.floor, [MW / 1.5, MH / 1.5]) }));
  main.rotation.x = -Math.PI / 2; main.position.set(MW / 2, 0, MH / 2); main.receiveShadow = true; g.add(main);
  // special floor cells: grass, water, steps, walkway, per-level overrides
  const by = new Map();
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const ch = map[y][x]; let n = null;
    if (ch === ',') n = 'grass'; else if (ch === '~') n = 'water'; else if (ch === '^' || ch === 'v') n = 'steps'; else if (ch === '<' || ch === '>') n = 'walkway';
    else if (M.floorOf && M.floorOf(x, y, ch)) n = M.floorOf(x, y, ch);
    if (!n || n === M.floor) continue;
    const p = new THREE.PlaneGeometry(1, 1); p.rotateX(-Math.PI / 2);
    if (ch === '<') p.rotateY(Math.PI / 2); if (ch === '>') p.rotateY(-Math.PI / 2); if (ch === 'v') p.rotateY(Math.PI);
    p.translate(x + 0.5, ch === '~' ? -0.06 : 0.004, y + 0.5);
    if (!by.has(n)) by.set(n, []); by.get(n).push(p);
  }
  for (const [n, geos] of by) {
    const mat = n === 'water' ? new THREE.MeshLambertMaterial({ map: texOf(n), transparent: true, opacity: 0.85 }) : new THREE.MeshLambertMaterial({ map: texOf(n) });
    const m = new THREE.Mesh(mergeGeometries(geos), mat); m.receiveShadow = true; g.add(m);
    if (n === 'water') waterTex = mat.map;
  }
  if (M.ceil) {
    const top = Math.max(...Object.keys(M.tex).map(k => wallH(k))) * YS;
    const c = new THREE.Mesh(new THREE.PlaneGeometry(MW, MH), new THREE.MeshLambertMaterial({ map: texOf(M.ceil, [MW / 1.5, MH / 1.5]), side: THREE.BackSide }));
    c.rotation.x = -Math.PI / 2; c.position.set(MW / 2, top, MH / 2); g.add(c);
  }
  return g;
}
let waterTex = null;
// sky: a gradient dome, a sun or moon, drifting clouds and a distant silhouette ring
function buildSky(pal) {
  const g = new THREE.Group();
  const top = new THREE.Color(pal.ceil[0]), bot = new THREE.Color(pal.ceil[1]);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(200, 24, 12), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: top }, bot: { value: bot } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 bot; varying vec3 vP; void main(){ float k = smoothstep(-0.05, 0.6, vP.y); gl_FragColor = vec4(mix(bot, top, k), 1.0); }',
  }));
  g.add(dome);
  const spriteOf = (w, h, fn) => { const c = bake(w, h, fn); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, fog: false, depthWrite: false })); };
  if (pal.sun || pal.moon) {
    const s = spriteOf(256, 256, (c) => {
      if (pal.sun) { c.translate(128, 128); c.fillStyle = 'rgba(255,226,122,0.7)'; for (let i = 0; i < 12; i++) { c.rotate(Math.PI / 6); poly([-12, -80, 12, -80, 0, -118]); c.fill(); } E(0, 0, 70, 70); fs(YEL, '#f0a91d', 6); c.strokeStyle = '#f0a91d'; c.lineWidth = 6; c.beginPath(); c.arc(0, 8, 30, 0.3, Math.PI - 0.3); c.stroke(); E(-18, -14, 6, 6); fs('#f0a91d', null); E(18, -14, 6, 6); fs('#f0a91d', null); }
      else { E(128, 128, 64, 64); fs('#fff3c4', '#d9c88f', 6); E(106, 108, 10, 8); fs('#e9dcb0', null); E(150, 150, 8, 6); fs('#e9dcb0', null); }
    });
    s.scale.set(34, 34, 1); s.position.set(-90, 80, -120); g.add(s); sun.position.set(-40, 60, -50);
  } else sun.position.set(-20, 60, -30);
  if (pal.clouds) for (let i = 0; i < 9; i++) {
    const s = spriteOf(256, 128, (c) => { c.fillStyle = pal.cloudC || 'rgba(255,255,255,0.95)'; [[70, 80, 44], [120, 60, 52], [170, 80, 44], [120, 90, 44]].forEach(([x, y, r]) => { E(x, y, r, r * 0.75); c.fill(); }); });
    const a = i / 9 * TAU; s.scale.set(40, 20, 1); s.position.set(Math.cos(a) * 150, 55 + (i % 3) * 12, Math.sin(a) * 150); s.userData.drift = a; g.add(s);
  }
  if (pal.stars) { const pts = []; for (let i = 0; i < 400; i++) { const a = Math.random() * TAU, e = Math.random() * 1.2 + 0.1; pts.push(Math.cos(a) * Math.cos(e) * 180, Math.sin(e) * 180, Math.sin(a) * Math.cos(e) * 180); } const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); g.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: '#fff', size: 1.2, fog: false }))); }
  if (pal.silhouette) {
    const c = bake(1024, 128, (c) => { c.fillStyle = pal.silC || pal.fog; c.beginPath(); c.moveTo(0, 128); for (let x = 0; x <= 1024; x += 8) { let y = 90; if (pal.silhouette === 'dunes') y = 100 - Math.abs(Math.sin(x * 0.012)) * 60 - Math.sin(x * 0.04) * 10; else if (pal.silhouette === 'bush') y = 96 - Math.abs(Math.sin(x * 0.05)) * 40 - ((x / 30 | 0) % 3) * 10; else if (pal.silhouette === 'city') y = 110 - ((x / 40 | 0) * 37 % 90); c.lineTo(x, y); } c.lineTo(1024, 128); c.closePath(); c.fill(); });
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = THREE.RepeatWrapping; tx.repeat.x = 3;
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(120, 120, 36, 48, 1, true), new THREE.MeshBasicMaterial({ map: tx, transparent: true, side: THREE.BackSide, fog: false, depthWrite: false }));
    ring.position.y = 10; g.add(ring);
  }
  // the carousel, spinning on the horizon (it's the brand)
  if (pal.carousel) g.add(makeCarousel(pal.carousel));
  return g;
}
function makeCarousel([x, z, s]) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s);
  g.add(MD.ink(new THREE.CylinderGeometry(6, 6.5, 0.8, 24), MD.toon('#8e5bd6'), 0.1).translateY(0.4));
  g.add(MD.ink(new THREE.CylinderGeometry(0.4, 0.4, 7, 12), MD.toon('#e8b830'), 0.05).translateY(4));
  const roof = MD.ink(new THREE.ConeGeometry(7.4, 3, 16), MD.toon(PINK), 0.1); roof.position.y = 8.6; g.add(roof);
  const spin = new THREE.Group(); g.add(spin); g.userData.spin = spin;
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; const d = MD.makeDick({ scale: 2.2 }); d.position.set(Math.cos(a) * 4.6, 1.8, Math.sin(a) * 4.6); d.rotation.y = -a; spin.add(d); spin.add(MD.ink(new THREE.CylinderGeometry(0.08, 0.08, 6, 6), MD.toon('#e8b830'), 0.02).translateX(Math.cos(a) * 4.6).translateZ(Math.sin(a) * 4.6).translateY(4)); }
  skySpinners.push(spin);
  return g;
}
let skySpinners = [];
function buildLevel() {
  scene.remove(level); level = new THREE.Group(); scene.add(level); wallGroup = null; skySpinners = []; waterTex = null;
  const pal = M.pal;
  scene.fog = new THREE.Fog(pal.fog, pal.fogNear || 8, (pal.fogDist || 14) * 3.2);
  scene.background = new THREE.Color(pal.fog);
  hemi.color.set(pal.hemiSky || '#ffffff'); hemi.groundColor.set(pal.hemiGround || '#886655'); hemi.intensity = pal.hemiI || 1.2;
  sun.color.set(pal.sunC || '#fff2e0'); sun.intensity = pal.sunI === undefined ? 2.2 : pal.sunI;
  if (!M.ceil) { skyMesh = buildSky(pal); level.add(skyMesh); } else skyMesh = null;
  level.add(floorMesh());
  rebuildWalls();
  navLine = makeNavLine(); level.add(navLine.mesh);
  resetTufts();
}
// ---------- the nav line: glowing chevrons on the floor, from you to the objective ----------
let navLine = null, navPath = null, navT = 0;
function makeNavLine() {
  const shape = new THREE.Shape(); shape.moveTo(-0.14, -0.1); shape.lineTo(0, 0.06); shape.lineTo(0.14, -0.1); shape.lineTo(0.14, -0.02); shape.lineTo(0, 0.14); shape.lineTo(-0.14, -0.02); shape.closePath();
  const geo = new THREE.ShapeGeometry(shape); geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false, fog: false });
  const mesh = new THREE.InstancedMesh(geo, mat, 80); mesh.count = 0; mesh.frustumCulled = false; mesh.renderOrder = 3;
  return { mesh };
}
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _v = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1), _up = new THREE.Vector3(0, 1, 0);
function updateNav() {
  if (!navLine) return;
  const goal = M.goal && !M.goal.hidden ? M.goal : null;
  if (!goal || M.state !== 'play') { navLine.mesh.count = 0; navPath = null; return; }
  if (t % 20 === 0 || !navPath) navPath = findPath(player.x, player.y, goal.x, goal.y);
  if (!navPath) { navLine.mesh.count = 0; return; }
  // resample the path every 0.5 units, animate a "flow" toward the goal, hide the bit right under your feet
  const pts = [[player.x, player.y], ...navPath.slice(1), [goal.x, goal.y]];
  let n = 0; const step = 0.55, off = (t * 0.02) % step; let carry = off;
  for (let i = 0; i < pts.length - 1 && n < 80; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], L = Math.hypot(x1 - x0, y1 - y0); if (L < 0.001) continue;
    const a = Math.atan2(x1 - x0, y1 - y0);
    for (let d = carry; d < L && n < 80; d += step) {
      const x = x0 + (x1 - x0) * d / L, y = y0 + (y1 - y0) * d / L;
      const k = Math.hypot(x - player.x, y - player.y); if (k < 0.8) continue;
      _q.setFromAxisAngle(_up, a); _v.set(x, 0.02, y); const sc = 1 + 0.25 * Math.sin(t * 0.15 - n * 0.6); _s.set(sc, 1, sc);
      _m4.compose(_v, _q, _s); navLine.mesh.setMatrixAt(n++, _m4);
    }
    carry = (carry - L) % step; if (carry < 0) carry += step;
  }
  navLine.mesh.count = n; navLine.mesh.instanceMatrix.needsUpdate = true;
}
// a light pillar at the objective (CoD-style "go here")
const beacon = (() => {
  const g = new THREE.Group();
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 12, 16, 1, true), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  col.position.y = 6; g.add(col);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.55, 32), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.7, depthWrite: false, fog: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; g.add(ring); g.userData.ring = ring;
  scene.add(g); return g;
})();
