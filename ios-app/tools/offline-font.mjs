// Re-inlines the bundled font after `npm run pull-game` copies a fresh ../game/index.html in.
import fs from 'fs';
const p = 'www/index.html'; let s = fs.readFileSync(p, 'utf8');
const b64 = fs.readFileSync('assets/LilitaOne.woff2').toString('base64');
s = s.replace(/<link rel="preconnect"[^>]*>\s*/g, '').replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>\s*<style>/, `<style>\n  @font-face { font-family: 'Lilita One'; font-style: normal; font-weight: 400; font-display: block; src: url(data:font/woff2;base64,${b64}) format('woff2'); }`);
s = s.replace('user-scalable=no">', 'user-scalable=no, viewport-fit=cover">');
if (s.includes('fonts.googleapis')) throw new Error('font link not replaced');
fs.writeFileSync(p, s); console.log('font inlined');
