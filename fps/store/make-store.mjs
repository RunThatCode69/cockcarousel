// Six portrait App Store-style screenshots (1320x2868): headline, a phone frame with a real gameplay capture, and a character.
// Pattern matches ios-app/fastlane/screenshots. Run: node make-store.mjs <path-to-test-copy-with-__dbg>
import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const OUT = new URL('./', import.meta.url).pathname;
const TEST = process.argv[2] || '../../test/fps-test.html';
const SHOTS = [   // [file, headline, sub, mission, stage, x, y, angle, character, background]
  ['01_title', 'YOU ARE THE GUN', 'a first-person shooter. you\'re a dick.', 1, 0, 7.5, 6.5, -Math.PI / 2, 'hero', ['#ff9ec4', '#c96bff']],
  ['02_reload', 'PUMP TO RELOAD', 'the mag is the balls. obviously.', 1, 3, 20, 14, 0.4, 'sarge', ['#ffd23f', '#ff5d8f']],
  ['03_stealth', 'CRAWL THROUGH THE PUBES', 'ghillie suit level. sort of.', 2, 0, 26, 12, -Math.PI / 2, 'prick', ['#3b2470', '#6a3d9a']],
  ['04_ship', 'THE SHIP IS SINKING', 'the crabs do not care', 3, 1, 26.5, 12.5, Math.PI, 'crab', ['#2a3a5a', '#7ed6df']],
  ['05_clinic', 'NOBODY IS RUSHING', 'take a number. it\'s 69.', 4, 1, 7.5, 20.5, -Math.PI / 2, 'condom', ['#ffd6e7', '#ff9ec4']],
  ['06_boss', 'ONE SHOT. ONE SQUIRT.', 'the CoD4 ending, beat for beat', 5, 1, 58, 5, 0, 'boss', ['#ff5e3a', '#4a1d3a']],
];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1320, height: 2868 }, deviceScaleFactor: 1 });
const pg = await ctx.newPage();
await pg.goto('file://' + fs.realpathSync(TEST), { waitUntil: 'load' }); await pg.waitForTimeout(800);
for (const [name, head, sub, m, st, x, y, a, who, bg] of SHOTS) {
  await pg.evaluate(() => window.__dbg.landscape());
  await pg.evaluate(([m, st]) => window.__dbg.startMission(m, st), [m, st]); await pg.waitForTimeout(300);
  await pg.evaluate(([x, y, a]) => window.__dbg.warp(x, y, a), [x, y, a]);
  if (name === '02_reload') { await pg.keyboard.press('KeyR'); await pg.waitForTimeout(500); }
  if (name === '01_title') { await pg.evaluate(() => { const p = window.__dbg.player(); window.__dbg.spawnEnemy('crab', p.x + 1.2, p.y - 3, { ai: 'chase' }); window.__dbg.spawnEnemy('bee', p.x - 1.5, p.y - 4, { ai: 'chase' }); }); await pg.waitForTimeout(400); await pg.keyboard.press('Space'); await pg.waitForTimeout(80); }
  if (name === '04_ship') { await pg.evaluate(() => { const p = window.__dbg.player(); window.__dbg.spawnEnemy('crab', p.x - 2.5, p.y + 0.3, { ai: 'chase' }); window.__dbg.spawnEnemy('crab', p.x - 4, p.y - 0.5, { ai: 'chase' }); }); await pg.waitForTimeout(500); }
  if (name === '05_clinic') { await pg.evaluate(() => { const p = window.__dbg.player(); window.__dbg.spawnEnemy('condom', p.x + 0.5, p.y - 3, { ai: 'chase' }); window.__dbg.spawnEnemy('bee', p.x - 2, p.y - 4, { ai: 'chase' }); }); await pg.waitForTimeout(500); }
  if (name === '06_boss') { await pg.waitForTimeout(9000); }
  await pg.waitForTimeout(200);
  // capture the game canvas as an image, then compose the store frame around it
  const game = await pg.evaluate(() => document.getElementById('c').toDataURL('image/png'));
  const charPng = await pg.evaluate(who => window.__dbg.character(who), who);
  await pg.evaluate(([head, sub, bg, game, charPng]) => {
    let o = document.getElementById('store'); if (!o) { o = document.createElement('div'); o.id = 'store'; document.body.appendChild(o); }
    o.style.cssText = `position:fixed;inset:0;z-index:50;background:linear-gradient(${bg[0]},${bg[1]});font-family:'Lilita One',sans-serif;overflow:hidden`;
    o.innerHTML = `
      <div style="position:absolute;left:60px;right:60px;top:210px;text-align:center;font-size:118px;line-height:1.05;color:#fff;-webkit-text-stroke:3px #4a1d3a;paint-order:stroke fill;text-shadow:0 12px 0 #4a1d3a">${head}</div>
      <div style="position:absolute;left:60px;right:60px;top:520px;text-align:center;font-size:56px;color:#fff;-webkit-text-stroke:1.5px #4a1d3a;paint-order:stroke fill">${sub}</div>
      <div style="position:absolute;left:50%;top:1420px;transform:translate(-50%,-50%) rotate(-4deg);width:1230px;height:640px;border-radius:70px;background:#1a1020;box-shadow:0 40px 0 #4a1d3a, 0 80px 120px rgba(0,0,0,0.35);padding:26px;box-sizing:border-box">
        <img src="${game}" style="width:100%;height:100%;object-fit:cover;border-radius:46px;display:block">
        <div style="position:absolute;left:50%;top:26px;transform:translateX(-50%);width:34px;height:120px;border-radius:0 0 20px 20px;background:#1a1020"></div>
      </div>
      <img src="${charPng}" style="position:absolute;left:50%;transform:translateX(-50%);bottom:180px;width:820px;height:820px">
      <div style="position:absolute;left:0;right:0;bottom:80px;text-align:center;font-size:52px;color:#4a1d3a">cockcarousel.com/fps  ·  free  ·  no download</div>
      <div style="position:absolute;left:0;right:0;top:100px;text-align:center;font-size:44px;color:#4a1d3a;letter-spacing:2px">CUM OF DUTY: MODERN WHARFARE</div>`;
  }, [head, sub, bg, game, charPng]);
  await pg.waitForTimeout(400);
  await pg.screenshot({ path: OUT + name + '.png' });
  await pg.evaluate(() => { document.getElementById('store').remove(); });
  console.log(name);
}
await b.close();
