// Records vertical (1080x1920) gameplay clips with a hook line on top and the site URL below — TikTok / Reels / Shorts ready.
import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
import { execSync } from 'child_process'; import fs from 'fs';
const OUT = process.argv[2] || './clips'; fs.mkdirSync(OUT, { recursive: true });
const HOOKS = [
  ['pov_dumbest', 'POV: you found the dumbest game on the App Store', 3],
  ['therapist', 'my therapist asked what I do to relax', 5],
  ['shrinkage', 'level 6 is literally called SHRINKAGE SLOPES', 6],
  ['rate_it', 'rate this game out of 10, be honest', 9],
];
const b = await chromium.launch();
for (const [name, hook, lv] of HOOKS) {
  const ctx = await b.newContext({ viewport: { width: 1080, height: 1920 }, hasTouch: true, recordVideo: { dir: OUT + '/_raw', size: { width: 1080, height: 1920 } } });
  const pg = await ctx.newPage();
  await pg.goto('file://' + process.cwd() + '/clips.html'   /* the game with a tiny debug hook; see README */, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(700);
  await pg.evaluate(h => { document.body.style.background = 'linear-gradient(#ff9ec4,#ffd6e7 60%,#fff0d6)';
    const top = document.createElement('div'); top.style.cssText = "position:fixed;left:40px;right:40px;top:300px;text-align:center;font:72px/1.15 'Lilita One',sans-serif;color:#fff;-webkit-text-stroke:2px #4a1d3a;paint-order:stroke fill;text-shadow:0 8px 0 #4a1d3a;z-index:9"; top.textContent = h; document.body.appendChild(top);
    const bot = document.createElement('div'); bot.style.cssText = "position:fixed;left:0;right:0;bottom:330px;text-align:center;font:54px 'Lilita One',sans-serif;color:#4a1d3a;z-index:9"; bot.textContent = 'cockcarousel.com  ·  free on the App Store'; document.body.appendChild(bot); }, hook);
  await pg.keyboard.press('Space'); await pg.waitForTimeout(200);
  await pg.evaluate(n => { window.__dbg.set({ level: n - 1, loot: 0, state: 'win' }); window.__dbg.nextLevel(); }, lv);
  const g = () => pg.evaluate(() => window.__dbg.get());
  let down = false; const end = Date.now() + 16000; let died = false;
  while (Date.now() < end) {
    const s = await g();
    if (s.state === 'over') { if (!died) { died = true; await pg.waitForTimeout(3800); } break; }
    if (s.state !== 'playing') break;
    const reach = 210 + 60 + s.speed * 9;
    const bee = s.ahead.find(o => o.t === 'bee' && o.x < 210 + 120 + s.speed * 6 && o.x + o.w > 170);
    const gnd = s.ahead.find(o => o.t !== 'bee' && o.x < reach && o.x + o.w > 180);
    if (bee && !down) { await pg.keyboard.down('ArrowDown'); down = true; }
    if (!bee && down) { await pg.keyboard.up('ArrowDown'); down = false; }
    if (gnd && s.ground && !down && Math.random() < 0.93) await pg.keyboard.press('Space');   // 7% "human" misses so runs end naturally
    await pg.waitForTimeout(25);
  }
  await pg.waitForTimeout(400);
  const v = await pg.video().path(); await ctx.close();
  execSync(`ffmpeg -y -loglevel error -i "${v}" -vf "scale=1080:1920:flags=lanczos" -r 30 -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -movflags +faststart "${OUT}/${name}.mp4"`);
  console.log(name, died ? '(ends on game over)' : '(clean run)');
}
await b.close(); fs.rmSync(OUT + '/_raw', { recursive: true, force: true });
