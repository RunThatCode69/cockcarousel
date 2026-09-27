// Records four vertical (1080x1920) Modern Wharfare gameplay clips with a hook line on top — TikTok / Reels / Shorts ready.
// Same pattern as make-clips.mjs: plays a debug copy of fps/index.html (window.__dbg injected at the //__DBG__ marker) with a bot.
//   node make-clips-fps.mjs ./clips-fps      (needs playwright + ffmpeg)
import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
import { execSync } from 'child_process'; import fs from 'fs';
const OUT = process.argv[2] || './clips-fps'; fs.mkdirSync(OUT, { recursive: true });
const TEST = process.argv[3] || '../fps/clips-fps.html';   // the game + __dbg hook (never shipped)
const HOOKS = [   // [file, hook text, mission, stage, seconds, mode]
  ['pov_gun', 'POV: you are the gun', 1, 3, 14, 'fight'],
  ['ghillie', 'the stealth level is just crawling through pubes', 2, 0, 14, 'sneak'],
  ['sinking', 'the ship is sinking and the crabs do not care', 3, 1, 14, 'fight'],
  ['ending', 'they remade the CoD4 ending. with a dick.', 5, 1, 16, 'finale'],
];
const b = await chromium.launch();
for (const [name, hook, mission, stage, secs, mode] of HOOKS) {
  const ctx = await b.newContext({ viewport: { width: 1080, height: 1920 }, hasTouch: true, recordVideo: { dir: OUT + '/_raw', size: { width: 1080, height: 1920 } } });
  const pg = await ctx.newPage();
  await pg.goto('file://' + fs.realpathSync(TEST), { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(800);
  await pg.evaluate(h => {
    document.body.style.background = 'linear-gradient(#ff9ec4,#c96bff 60%,#4a1d3a)';
    const top = document.createElement('div'); top.style.cssText = "position:fixed;left:40px;right:40px;top:260px;text-align:center;font:72px/1.15 'Lilita One',sans-serif;color:#fff;-webkit-text-stroke:2px #4a1d3a;paint-order:stroke fill;text-shadow:0 8px 0 #4a1d3a;z-index:9"; top.textContent = h; document.body.appendChild(top);
    const bot = document.createElement('div'); bot.style.cssText = "position:fixed;left:0;right:0;bottom:300px;text-align:center;font:54px 'Lilita One',sans-serif;color:#fff;-webkit-text-stroke:1.5px #4a1d3a;paint-order:stroke fill;z-index:9"; bot.textContent = 'cockcarousel.com/fps  ·  free, no download'; document.body.appendChild(bot);
  }, hook);
  await pg.evaluate(() => window.__dbg.landscape());   // game stays landscape, letterboxed in the vertical frame (same as the Slide Rush clips)
  await pg.evaluate(([m, s]) => window.__dbg.startMission(m, s), [mission, stage]);
  await pg.waitForTimeout(600);
  const g = () => pg.evaluate(() => window.__dbg.get());
  const end = Date.now() + secs * 1000; let turn = 0;
  while (Date.now() < end) {
    const s = await g(); if (s.state !== 'game') break;
    if (mode === 'finale') { await pg.waitForTimeout(100); if (s.stage === 2) { await pg.waitForTimeout(800); await pg.keyboard.press('Space'); } continue; }
    const en = s.ents.filter(e => (e.kind === 'enemy' || e.shootable) && !e.dead && e.type !== 'target');
    let tgt = null, td = 1e9; for (const e of en) { const d = Math.hypot(e.x - s.x, e.y - s.y); if (d < td) { tgt = e; td = d; } }
    if (mode === 'fight' && en.length < 3) await pg.evaluate(() => { const p = window.__dbg.player(); for (let i = 0; i < 2; i++) { const a = p.a + (Math.random() - 0.5) * 1.2, d = 3 + Math.random() * 3, x = p.x + Math.cos(a) * d, y = p.y + Math.sin(a) * d; if (window.__dbg.walkable(x, y)) window.__dbg.spawnEnemy(Math.random() < 0.5 ? 'crab' : 'bee', x, y, { ai: 'chase' }); } });
    if (tgt && td < 8) { const want = Math.atan2(tgt.y - s.y, tgt.x - s.x); await pg.evaluate(a => { const p = window.__dbg.player(); let d = a - p.a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; p.a += d * 0.25; }, want); if (Math.abs(td) < 7 && Math.random() < 0.7) await pg.keyboard.press('Space'); }
    else { turn += 0.02; await pg.evaluate(t => { window.__dbg.player().a += Math.sin(t) * 0.02; }, turn); await pg.keyboard.down('KeyW'); await pg.waitForTimeout(80); await pg.keyboard.up('KeyW'); }
    await pg.waitForTimeout(40);
  }
  await pg.waitForTimeout(400);
  const v = await pg.video().path(); await ctx.close();
  execSync(`ffmpeg -y -loglevel error -i "${v}" -vf "scale=1080:1920:flags=lanczos" -r 30 -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -movflags +faststart "${OUT}/${name}.mp4"`);
  console.log(name, 'done');
}
await b.close(); fs.rmSync(OUT + '/_raw', { recursive: true, force: true });
