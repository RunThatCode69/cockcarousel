
// ================================================================
//  WORLD — grid collision (same as v2), three.js scene, level builder, sky, lights, nav line, entity sync
// ================================================================
const WALLS = '#ABCGPXVj', NOWALK = '~';   // j = a hurdle (a low wall you can jump), w = barbed wire (crawl under), t = tires
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
  const skip = Math.ceil(0.55 * 4) ;   // ignore the cell you're standing in (lookouts on towers, etc.)
  for (let i = 0; i < n; i++) { x += sx; y += sy; if (i < skip - 1 && solid(x0, y0)) continue; if (i >= n - skip && solid(x1, y1)) continue; if (solid(x, y) && wallH(cell(x | 0, y | 0)) > 0.95) return false; }
  return true;
}
// can a glob get there? (low cover blocks shots even though you can see over it)
function losShot(x0, y0, x1, y1) {
  const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy); if (d < 0.01) return true;
  const n = Math.ceil(d * 4), sx = dx / n, sy = dy / n; let x = x0, y = y0;
  const skip = 3;
  for (let i = 0; i < n; i++) { x += sx; y += sy; if (i < skip - 1 && solid(x0, y0)) continue; if (i >= n - skip && solid(x1, y1)) continue; if (solid(x, y) && wallH(cell(x | 0, y | 0)) * YS > 0.62) return false; }
  return true;
}
// the player can clear hurdles mid-jump and pass wire crouched; everything else uses plain walkable()
function walkableFor(x, y, b) {
  const c = cell(x | 0, y | 0);
  if (b && b === player) { if (c === 'j') return player.jz > 0.18; if (c === 'w') return player.crouch && player.jz < 0.05; }
  else if (c === 'w') return false;
  return walkable(x, y);
}
// route finding treats hurdles and wire as passable (you can get through them)
const walkNav = (x, y) => { const c = cell(x | 0, y | 0); if (M && M.hazards) for (const h of M.hazards) if (Math.hypot(x - h.x, y - h.y) < h.r + 0.6) return false; return c === 'j' || c === 'w' || walkable(x, y); };
function moveBody(b, dx, dy, r = 0.25) {
  const okX = walkableFor(b.x + dx + Math.sign(dx) * r, b.y - r, b) && walkableFor(b.x + dx + Math.sign(dx) * r, b.y + r, b);
  if (okX) b.x += dx;
  const okY = walkableFor(b.x - r, b.y + dy + Math.sign(dy) * r, b) && walkableFor(b.x + r, b.y + dy + Math.sign(dy) * r, b);
  if (okY) b.y += dy;
  return okX && okY;
}
// enemy flow field: BFS distance from the player's cell, so chasers walk around chairs and counters
let flowF = null;
function buildFlow(px, py) {
  const N = MW * MH; if (!flowF || flowF.length !== N) flowF = new Int16Array(N); flowF.fill(-1);
  const q = new Int32Array(N); let h = 0, tl = 0; const s0 = (py | 0) * MW + (px | 0); if (s0 < 0 || s0 >= N) return;
  flowF[s0] = 0; q[tl++] = s0;
  while (h < tl) { const c = q[h++], x = c % MW, y = (c / MW) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue; const n = ny * MW + nx; if (flowF[n] !== -1 || !walkable(nx + 0.5, ny + 0.5)) continue; flowF[n] = flowF[c] + 1; q[tl++] = n; } }
}
function flowDir(e) {
  if (!flowF) return null; const x = e.x | 0, y = e.y | 0; let best = flowF[y * MW + x], bx = 0, by = 0;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue;
    if (dx && dy && (flowF[y * MW + nx] < 0 || flowF[ny * MW + x] < 0)) continue;   // no corner cutting
    const v = flowF[ny * MW + nx]; if (v >= 0 && (best < 0 || v < best)) { best = v; bx = dx; by = dy; }
  }
  if (!bx && !by) return null;
  return Math.atan2(y + by + 0.5 - e.y, x + bx + 0.5 - e.x);
}
// route finding on the grid (for the nav line and the compass arrow)
function findPath(sx, sy, tx, ty) {
  sx |= 0; sy |= 0; tx |= 0; ty |= 0;
  if (!walkNav(tx + 0.5, ty + 0.5)) { for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1]]) if (walkNav(tx + dx + 0.5, ty + dy + 0.5)) { tx += dx; ty += dy; break; } }
  const prev = new Int32Array(MW * MH).fill(-2), q = new Int32Array(MW * MH); let qh = 0, qt = 0;
  const s0 = sy * MW + sx, goal = ty * MW + tx; if (s0 < 0 || s0 >= MW * MH) return null;
  prev[s0] = -1; q[qt++] = s0;
  while (qh < qt) {
    const c = q[qh++]; if (c === goal) break;
    const x = c % MW, y = (c / MW) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue;
      const n = ny * MW + nx; if (prev[n] !== -2 || !walkNav(nx + 0.5, ny + 0.5)) continue;
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
const GRIME = (() => {   // a big soft noise canvas: blotches + speckle, multiplied over every world texture
  const c = mkCanvas(256, 256), g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 90; i++) { const x = Math.random() * 256, y = Math.random() * 256, r = 10 + Math.random() * 50; const gr = g.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, `rgba(90,70,60,${0.08 + Math.random() * 0.12})`); gr.addColorStop(1, 'rgba(90,70,60,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  const d = g.getImageData(0, 0, 256, 256); for (let i = 0; i < d.data.length; i += 4) { const n = (Math.random() - 0.5) * 26; d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n; } g.putImageData(d, 0, 0);
  return c;
})();
const grimed = new Map();
function grimeOf(name, src) {
  if (grimed.has(name)) return grimed.get(name);
  const c = mkCanvas(src.width, src.height), g = c.getContext('2d');
  g.drawImage(src, 0, 0); g.globalCompositeOperation = 'multiply'; g.drawImage(GRIME, (name.length * 37) % 128, (name.length * 71) % 128, src.width * 1.6, src.height * 1.6, 0, 0, src.width, src.height);
  g.globalCompositeOperation = 'source-over'; grimed.set(name, c); return c;
}
function texOf(name, rep = [1, 1]) {
  const raw = TEX[name] || FT[name]; if (!raw) return null;
  const src = grimeOf(name, raw);
  const tx = new THREE.CanvasTexture(src); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(rep[0], rep[1]);
  tx.anisotropy = isTouch ? 2 : 8; tx.magFilter = THREE.LinearFilter; return tx;
}
const texMatCache = new Map();
function texMat(name, toonish = false) {
  if (texMatCache.has(name)) return texMatCache.get(name);
  const map = texOf(name);
  const m = new THREE.MeshStandardMaterial({ map, roughness: 0.92, metalness: 0.02 });
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
  const main = new THREE.Mesh(new THREE.PlaneGeometry(MW, MH), new THREE.MeshStandardMaterial({ map: texOf(M.floor, [MW / 1.5, MH / 1.5]), roughness: 0.95 }));
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
    const mat = n === 'water' ? new THREE.MeshStandardMaterial({ map: texOf(n), transparent: true, opacity: 0.85, roughness: 0.3 }) : new THREE.MeshStandardMaterial({ map: texOf(n), roughness: 0.95 });
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
let waterTex = null, outerWater = null;
// free GPU memory when a level is thrown away (retries used to leak ~130 geometries each). Shared things just re-upload if reused.
function disposeTree(root) {
  root.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    for (const m of ms) { for (const k of ['map', 'alphaMap', 'emissiveMap']) if (m[k] && m[k].isCanvasTexture) m[k].dispose(); m.dispose(); }
  });
}
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
  scene.remove(level); disposeTree(level); level = new THREE.Group(); scene.add(level); wallGroup = null; skySpinners = []; waterTex = null; outerWater = null;
  const pal = M.pal;
  scene.fog = new THREE.Fog(pal.fog, pal.fogNear || 8, (pal.fogDist || 14) * 3.2);
  scene.background = new THREE.Color(pal.fog);
  hemi.color.set(pal.hemiSky || '#ffffff'); hemi.groundColor.set(pal.hemiGround || '#886655'); hemi.intensity = pal.hemiI || 1.2;
  sun.color.set(pal.sunC || '#fff2e0'); sun.intensity = pal.sunI === undefined ? 2.2 : pal.sunI;
  if (!M.ceil) { skyMesh = buildSky(pal); level.add(skyMesh); } else skyMesh = null;
  level.add(floorMesh());
  if (M.outer) level.add(buildOuter(M.outer));
  rebuildWalls();
  navLine = makeNavLine(); level.add(navLine.mesh);
  resetTufts();
  buildCourseBits();
}
// ---------- beyond the walls: ground that keeps going, and scenery so it isn't a box floating in fog ----------
function seeded(n) { let s = n * 9301 + 49297; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
function ringPositions(count, rMin, rMax, seed) {
  const rnd = seeded(seed), cx = MW / 2, cy = MH / 2, out = [];
  let tries = 0;
  while (out.length < count && tries++ < count * 20) {
    const a = rnd() * TAU, r = rMin + rnd() * (rMax - rMin), x = cx + Math.cos(a) * r * (MW / Math.max(MW, MH) + 0.3), y = cy + Math.sin(a) * r;
    if (x > -1.5 && x < MW + 1.5 && y > -1.5 && y < MH + 1.5) continue;   // never inside the playable map
    out.push([x, y, rnd()]);
  }
  return out;
}
function instanced(geo, mat, pts, sFn) {
  const im = new THREE.InstancedMesh(geo, mat, pts.length); im.castShadow = false; im.receiveShadow = true;
  pts.forEach(([x, y, r], i) => { const s = sFn(r); _q.setFromAxisAngle(_up, r * TAU); _v.set(x, 0, y); _s.set(s, s * (0.85 + r * 0.3), s); _m4.compose(_v, _q, _s); im.setMatrixAt(i, _m4); });
  return im;
}
const windowTex = (lit) => { const c = bake(128, 256, (g) => { g.fillStyle = lit ? '#6a6070' : '#8a8490'; g.fillRect(0, 0, 128, 256); for (let y = 8; y < 250; y += 22) for (let x = 8; x < 124; x += 24) { g.fillStyle = Math.random() < (lit ? 0.35 : 0.08) ? '#ffe9a8' : Math.random() < 0.3 ? '#2a2a34' : '#4a4a5a'; g.fillRect(x, y, 14, 14); } g.fillStyle = 'rgba(0,0,0,0.15)'; for (let i = 0; i < 20; i++) g.fillRect(Math.random() * 128, Math.random() * 256, 30, 4); }); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
function buildOuter(o) {
  const g = new THREE.Group();
  // ground (or water) that runs to the horizon
  const gt = texOf(o.ground, [120, 120]);
  const gm = o.ground === 'water' ? new THREE.MeshStandardMaterial({ map: gt, color: '#6a9ac0', roughness: 0.25, metalness: 0.1 }) : new THREE.MeshStandardMaterial({ map: gt, roughness: 1 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), gm); ground.rotation.x = -Math.PI / 2; ground.position.set(MW / 2, (o.groundY || 0) - 0.02, MH / 2); ground.receiveShadow = true; g.add(ground);
  if (o.ground === 'water') { waterTex = gt; outerWater = ground; }
  if (o.ring === 'desert') {
    const rock = new THREE.DodecahedronGeometry(1, 0), rockM = MD.toon('#a88a6a');
    g.add(instanced(rock, rockM, ringPositions(70, 4, 40, 3), r => 0.4 + r * 1.4));
    const mtn = new THREE.ConeGeometry(1, 1, 6), mtnM = new THREE.MeshStandardMaterial({ color: '#c49a78', roughness: 1, flatShading: true });
    g.add(instanced(mtn, mtnM, ringPositions(18, 60, 90, 5).map(([x, y, r]) => [x, y, r]), r => 14 + r * 20));
    const palm = MD.PROP3D.palm; ringPositions(14, 4, 16, 9).forEach(([x, y, r]) => { const p = palm(); p.position.set(x, 0, y); p.scale.setScalar(1.2 + r); p.rotation.y = r * 6; g.add(p); });
    ringPositions(5, 6, 14, 12).forEach(([x, y, r]) => g.add(makeTower(x, y)));
  }
  if (o.ring === 'forest') {
    const trunk = new THREE.CylinderGeometry(0.12, 0.18, 1.6, 6); trunk.translate(0, 0.8, 0);
    const leaves = mergeGeometries([new THREE.ConeGeometry(1.1, 1.8, 7).translate(0, 2.0, 0), new THREE.ConeGeometry(0.85, 1.5, 7).translate(0, 2.8, 0), new THREE.ConeGeometry(0.55, 1.2, 7).translate(0, 3.5, 0)]);
    const pts = ringPositions(260, 1.5, 34, 7);
    g.add(instanced(trunk, MD.toon('#4a3a2a'), pts, r => 1.1 + r * 0.9));
    g.add(instanced(leaves, MD.toon('#24402a'), pts, r => 1.1 + r * 0.9));
    ringPositions(9, 30, 55, 21).forEach(([x, y, r]) => g.add(makeBlock(x, y, 8 + r * 10, 6, false)));
  }
  if (o.ring === 'city') ringPositions(34, 16, 70, 31).forEach(([x, y, r]) => g.add(makeBlock(x, y, 10 + r * 30, 5 + r * 4, true)));
  return g;
}
function makeBlock(x, y, h, w, lit) {   // a big concrete apartment block, windows and all
  const tx = windowTex(lit); tx.repeat.set(w / 4, h / 8);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.9 }));
  m.position.set(x, h / 2, y); m.castShadow = false; m.receiveShadow = true; return m;
}
function makeTower(x, y) {   // a wooden guard tower
  const g = new THREE.Group(), wood = MD.toon('#8a6a44');
  [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]].forEach(([dx, dy]) => g.add(MD.ink(new THREE.CylinderGeometry(0.08, 0.1, 4.2, 6), wood, 0.02).translateX(dx).translateZ(dy).translateY(2.1)));
  g.add(MD.ink(new THREE.BoxGeometry(2, 0.12, 2), wood, 0.02).translateY(4.2)); g.add(MD.ink(new THREE.ConeGeometry(1.6, 1, 4), MD.toon('#6b7a3a'), 0.02).translateY(5.3).rotateY(Math.PI / 4));
  g.position.set(x, 0, y); return g;
}
function buildCourseBits() {
  const posts = [], wires = [], tyres = [];
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const c = map[y][x];
    if (c === 'w') {
      [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([dx, dy]) => { const g = new THREE.CylinderGeometry(0.025, 0.025, 0.75, 6); g.translate(x + dx, 0.375, y + dy); posts.push(g); });
      for (let k = 0; k < 3; k++) { const h = 0.62 + k * 0.05, zig = k * 0.33; const a = new THREE.CylinderGeometry(0.008, 0.008, 1.0, 4); a.rotateZ(Math.PI / 2); a.translate(x + 0.5, h, y + zig); wires.push(a); const b2 = new THREE.CylinderGeometry(0.008, 0.008, 1.0, 4); b2.rotateX(Math.PI / 2); b2.translate(x + zig, h, y + 0.5); wires.push(b2); }
    }
    if (c === 't') for (const [ox, oy] of [[0.28, 0.3], [0.72, 0.7]]) { const g = new THREE.TorusGeometry(0.2, 0.08, 8, 16); g.rotateX(Math.PI / 2); g.translate(x + ox, 0.08, y + oy); tyres.push(g); }
  }
  const add = (geos, mat) => { if (!geos.length) return; const m = new THREE.Mesh(mergeGeometries(geos), mat); m.castShadow = true; m.receiveShadow = true; level.add(m); };
  add(posts, MD.toon('#6b5a3a')); add(wires, new THREE.MeshBasicMaterial({ color: '#8a8f98' })); add(tyres, MD.toon('#2f2f3a'));
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
