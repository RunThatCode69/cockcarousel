
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
// ---------- post: bloom (desktop) + a CoD-style grade (desaturate, contrast, teal shadows / warm highlights, vignette, grain) ----------
const composer = new EffectComposer(renderer);
const worldPass = new RenderPass(scene, camera); composer.addPass(worldPass);
// bloom only the world (so your own muzzle flash doesn't smear the screen), then draw the gun on top
const bloomPass = new UnrealBloomPass(new THREE.Vector2(480, 270), 0.35, 0.4, 0.9); bloomPass.enabled = !isTouch; composer.addPass(bloomPass);
const vmPass = new RenderPass(vmScene, vmCam); vmPass.clear = false; vmPass.clearDepth = true; composer.addPass(vmPass);
const gradePass = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, sat: { value: 0.85 }, con: { value: 1.12 }, shadow: { value: new THREE.Vector3(0.92, 1.0, 1.06) }, high: { value: new THREE.Vector3(1.06, 1.0, 0.92) }, vig: { value: 0.35 }, grain: { value: 0.03 }, time: { value: 0 }, gam: { value: 1 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float sat, con, vig, grain, time, gam; uniform vec3 shadow, high; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + time) * 43758.5453); }
    void main(){ vec4 t = texture2D(tDiffuse, vUv); vec3 c = pow(max(t.rgb, vec3(0.0)), vec3(gam));
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c = mix(vec3(l), c, sat);
      c = max(vec3(0.0), (c - 0.18) * con + 0.18);
      c *= mix(shadow, high, smoothstep(0.02, 0.7, l));
      vec2 d = vUv - 0.5; c *= 1.0 - vig * dot(d, d) * 2.2;
      c += (hash(vUv * 731.0) - 0.5) * grain;
      gl_FragColor = vec4(c, t.a); }`,
});
composer.addPass(gradePass);
composer.addPass(new OutputPass());
// 3D rain: thin streaks in a box that follows the camera (replaces the old 2D overlay)
let rain = null;
function makeRain() {
  const N = isTouch ? 450 : 900, pos = new Float32Array(N * 6), g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mesh = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#a8b8c8', transparent: true, opacity: 0.32, depthWrite: false }));
  mesh.frustumCulled = false; const d = []; for (let i = 0; i < N; i++) d.push([rand(-9, 9), rand(0, 7), rand(-9, 9), rand(0.18, 0.26)]);
  return { mesh, d, N, pos };
}
function rainTick(cx, cy, cz, on) {
  if (!rain) return; rain.mesh.visible = on; if (!on) return;
  const { d, pos } = rain; let k = 0;
  for (const q of d) {
    q[1] -= q[3]; q[0] += 0.03; if (q[1] < -1) { q[1] += 8; q[0] = rand(-9, 9); q[2] = rand(-9, 9); }
    const x = cx + q[0], y = q[1], z = cz + q[2];
    pos[k++] = x; pos[k++] = y; pos[k++] = z; pos[k++] = x - 0.05; pos[k++] = y + 0.5; pos[k++] = z;
  }
  rain.mesh.geometry.attributes.position.needsUpdate = true;
}
let gradeBase = null;
const _gs = new THREE.Vector3(), _gh = new THREE.Vector3();
function gradeTick() {   // per-area overrides (e.g. the red emergency-lit corridor on the ship), blended smoothly
  if (!gradeBase || !M || !player) return;
  const ag = M.nvg ? NVG_GRADE : M.areaGrade ? M.areaGrade(player.x, player.y) : null, tg = ag ? Object.assign({}, gradeBase, ag) : gradeBase, u = gradePass.uniforms;
  if (M.nvgOK) renderer.toneMappingExposure = lerp(renderer.toneMappingExposure, (M.pal.exposure || 1.05) * (M.nvg ? 1.6 : 1), 0.08);
  u.shadow.value.lerp(_gs.set(...tg.shadow), 0.06); u.high.value.lerp(_gh.set(...tg.high), 0.06); u.sat.value = lerp(u.sat.value, tg.sat, 0.06); u.vig.value = lerp(u.vig.value, tg.vig, 0.06); u.gam.value = lerp(u.gam.value, tg.gam || 1, 0.08);
  // storms: lightning
  if (M.pal.lightning) { M.ltT = (M.ltT || 400) - 1; if (M.ltT <= 0) { M.ltT = 500 + Math.random() * 700; M.ltF = 14; setTimeout(() => sfx('boom'), 500 + Math.random() * 900); } if (M.ltF > 0) { M.ltF--; hemi.intensity = (M.pal.hemiI || 1.2) * (M.ltF % 5 < 3 ? 3.5 : 1.2); } else hemi.intensity = M.pal.hemiI || 1.2; }
}
function applyGrade(g) {
  g = Object.assign({ sat: 0.85, con: 1.12, shadow: [0.92, 1.0, 1.06], high: [1.06, 1.0, 0.92], vig: 0.35, grain: 0.02, bloom: 0.35 }, g || {});
  const u = gradePass.uniforms; u.sat.value = g.sat; u.con.value = g.con; u.shadow.value.set(...g.shadow); u.high.value.set(...g.high); u.vig.value = g.vig; u.grain.value = isTouch ? 0 : g.grain;
  bloomPass.strength = g.bloom; gradeBase = g;
}
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
      const g = c.createRadialGradient(128, 128, 4, 128, 128, 128);
      if (pal.sun) { g.addColorStop(0, 'rgba(255,255,245,1)'); g.addColorStop(0.12, 'rgba(255,248,225,1)'); g.addColorStop(0.2, 'rgba(255,230,190,0.55)'); g.addColorStop(1, 'rgba(255,220,180,0)'); }
      else { g.addColorStop(0, 'rgba(235,240,255,1)'); g.addColorStop(0.1, 'rgba(225,232,250,1)'); g.addColorStop(0.16, 'rgba(200,215,240,0.35)'); g.addColorStop(1, 'rgba(180,200,230,0)'); }
      c.fillStyle = g; c.fillRect(0, 0, 256, 256);
    });
    s.material.blending = THREE.AdditiveBlending;
    s.scale.set(34, 34, 1); s.position.set(-90, 80, -120); g.add(s); sun.position.set(-40, 60, -50);
  } else sun.position.set(-20, 60, -30);
  if (pal.clouds) for (let i = 0; i < 9; i++) {
    const s = spriteOf(512, 256, (c) => { const col = pal.cloudC || 'rgba(235,238,240,0.9)'; const base = col.replace(/[\d.]+\)$/, ''); for (let k = 0; k < 18; k++) { const x = 70 + ((k * 97 + i * 31) % 370), y = 110 + ((k * 53 + i * 17) % 70) - (k % 3) * 18, r = 50 + ((k * 29) % 45); const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, base + '0.35)'); gr.addColorStop(0.6, base + '0.18)'); gr.addColorStop(1, base + '0)'); c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } });
    const a = i / 9 * TAU; s.scale.set(90, 45, 1); s.position.set(Math.cos(a) * 150, 50 + (i % 3) * 14, Math.sin(a) * 150); s.userData.drift = a; g.add(s);
  }
  if (pal.stars) { const pts = []; for (let i = 0; i < 400; i++) { const a = Math.random() * TAU, e = Math.random() * 1.2 + 0.1; pts.push(Math.cos(a) * Math.cos(e) * 180, Math.sin(e) * 180, Math.sin(a) * Math.cos(e) * 180); } const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); g.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: '#fff', size: 1.2, fog: false }))); }
  if (pal.silhouette) {
    const c = bake(1024, 128, (c) => { c.fillStyle = pal.silC || pal.fog; c.beginPath(); c.moveTo(0, 128); for (let x = 0; x <= 1024; x += 8) { let y = 90; if (pal.silhouette === 'dunes') y = 100 - Math.abs(Math.sin(x * 0.012)) * 60 - Math.sin(x * 0.04) * 10; else if (pal.silhouette === 'bush') y = 96 - Math.abs(Math.sin(x * 0.05)) * 40 - ((x / 30 | 0) % 3) * 10; else if (pal.silhouette === 'city') y = 110 - ((x / 40 | 0) * 37 % 90); else if (pal.silhouette === 'mountains') y = 118 - Math.abs(Math.sin(x * 0.006)) * 80 - Math.abs(Math.sin(x * 0.019 + 1)) * 30; c.lineTo(x, y); } c.lineTo(1024, 128); c.closePath(); c.fill(); });
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = THREE.RepeatWrapping; tx.repeat.x = 3;
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(120, 120, 36, 48, 1, true), new THREE.MeshBasicMaterial({ map: tx, transparent: true, side: THREE.BackSide, fog: false, depthWrite: false }));
    ring.position.y = 10; g.add(ring);
  }
  // distant smoke columns (every CoD level has a few)
  if (pal.plumes) { const tx = (() => { const c = bake(128, 512, (c) => { for (let i = 0; i < 26; i++) { const y = 512 - i * 19, r = 22 + i * 1.8; const gr = c.createRadialGradient(64 + Math.sin(i * 0.7) * 10, y, 4, 64 + Math.sin(i * 0.7) * 10, y, r); gr.addColorStop(0, `rgba(30,28,26,${0.55 - i * 0.012})`); gr.addColorStop(1, 'rgba(30,28,26,0)'); c.fillStyle = gr; c.fillRect(0, 0, 128, 512); } }); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
    for (let i = 0; i < pal.plumes; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, fog: false, depthWrite: false, transparent: true })); const a = 0.6 + i * 1.35; sp.scale.set(26, 104, 1); sp.position.set(Math.cos(a) * 140, 40, Math.sin(a) * 140); g.add(sp); } }
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
  applyGrade(pal.cod); renderer.toneMappingExposure = pal.exposure || 1.05;
  if (!M.ceil) { skyMesh = buildSky(pal); level.add(skyMesh); } else skyMesh = null;
  level.add(floorMesh());
  if (M.roofs) for (const [x0, y0, x1, y1, tn, hh, lightC] of M.roofs) {   // ceilings over interior areas, with strip lights
    const w = x1 - x0, d = y1 - y0, tx = texOf(tn, [w / 1.5, d / 1.5]);
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: tx, emissiveMap: tx, emissive: '#8a8a8a', emissiveIntensity: 0.45, roughness: 0.9, side: THREE.DoubleSide })); roof.rotation.x = Math.PI / 2; roof.position.set(x0 + w / 2, hh * YS - 0.01, y0 + d / 2); roof.castShadow = true; level.add(roof);
    const lm = new THREE.MeshBasicMaterial({ color: lightC || '#f4f8ff' });
    for (let x = x0 + 2; x < x1; x += 4) for (let y = y0 + 1.5; y < y1; y += 3.5) { if (!walkable(x, y)) continue; const l = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.14), lm); l.position.set(x, hh * YS - 0.04, y); level.add(l); }
  }
  if (M.outer) level.add(buildOuter(M.outer));
  rebuildWalls();
  navLine = makeNavLine(); level.add(navLine.mesh);
  rain = pal.weather === 'rain' ? makeRain() : null; if (rain) level.add(rain.mesh);
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
  if (o.ring === 'base' || o.ring === 'mountains') {
    const trunk = new THREE.CylinderGeometry(0.12, 0.18, 1.6, 6); trunk.translate(0, 0.8, 0);
    const leaves = mergeGeometries([new THREE.ConeGeometry(1.1, 1.8, 7).translate(0, 2.0, 0), new THREE.ConeGeometry(0.85, 1.5, 7).translate(0, 2.8, 0), new THREE.ConeGeometry(0.55, 1.2, 7).translate(0, 3.5, 0)]);
    const pts = ringPositions(o.ring === 'base' ? 120 : 220, o.ring === 'base' ? 14 : 3, 40, 11);
    g.add(instanced(trunk, MD.toon('#3a3024'), pts, r => 1.2 + r));
    g.add(instanced(leaves, MD.toon(o.ring === 'base' ? '#2c4430' : '#1f3a28'), pts, r => 1.2 + r));
    const hill = new THREE.ConeGeometry(1, 1, 9), hillM = new THREE.MeshStandardMaterial({ color: o.ring === 'base' ? '#56684c' : '#6a7470', roughness: 1, flatShading: true });
    g.add(instanced(hill, hillM, ringPositions(16, 55, 95, 13), r => o.ring === 'base' ? 12 + r * 12 : 26 + r * 34));
  }
  if (o.ring === 'base') {   // blue corrugated hangars and a couple of fuel trucks around the camp
    const cor = texOf('corrugated', [4, 2]); const hm = new THREE.MeshStandardMaterial({ map: cor, roughness: 0.8, metalness: 0.2 });
    ringPositions(8, 3, 16, 17).forEach(([x, y, r]) => { const h = new THREE.Mesh(new THREE.BoxGeometry(8 + r * 6, 5 + r * 2, 6), hm); h.position.set(x, 2.5 + r, y); h.rotation.y = r * 3; h.castShadow = true; g.add(h); const roof = new THREE.Mesh(new THREE.CylinderGeometry(3.05, 3.05, 8 + r * 6, 12, 1, false, 0, Math.PI), hm); roof.rotation.set(0, r * 3, Math.PI / 2); roof.position.set(x, 5 + r * 3, y); g.add(roof); });
    ringPositions(10, 2, 20, 23).forEach(([x, y, r]) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 9, 6), MD.toon('#4a3a2a')); p.position.set(x, 4.5, y); g.add(p); });   // telegraph poles
  }
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
  navLine.mesh.count = 0; return;   // v4.4: no floor arrows — the route is drawn on the minimap instead
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
