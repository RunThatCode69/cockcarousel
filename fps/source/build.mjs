// Assembles parts → src/game.js, bundles three + game with esbuild, inlines into one HTML file.
import fs from 'fs'; import { execSync } from 'child_process';
const root = new URL('.', import.meta.url).pathname;
const order = ['a_head', 'b_world', 'c_views', 'd_weapon', 'e_hud', 'f_game', 'g_screens', 'h_missions', 'i_main'];
let src = order.map(n => fs.readFileSync(root + 'parts/' + n + '.js', 'utf8')).join('\n');
const dbg = process.argv.includes('--dbg') && fs.existsSync(root + 'parts/dbg.js') ? fs.readFileSync(root + 'parts/dbg.js', 'utf8') : '';
src = src.replace('//__DBG__', dbg);
fs.writeFileSync(root + 'src/game.js', src);
execSync(`npx esbuild ${root}src/game.js --bundle --format=iife --minify --target=es2020 --legal-comments=none --outfile=${root}build/game.min.js`, { cwd: root, stdio: 'inherit' });
const js = fs.readFileSync(root + 'build/game.min.js', 'utf8');
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<title>Cum of Duty: Modern Wharfare</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lilita+One&display=swap" rel="stylesheet">
<style>
  html, body { margin: 0; height: 100%; background: #2a1030; overflow: hidden;
    touch-action: none; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; }
  #wrap { position: fixed; left: 50%; top: 50%; transform: translate(-50%,-50%); }
  #wrap canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  #c { cursor: crosshair; }
</style>
</head>
<body>
<!-- Cum of Duty: Modern Wharfare v3. 3D by three.js (MIT, bundled below). Everything else: drawn in code. -->
<div id="wrap"><canvas id="c3"></canvas><canvas id="c"></canvas></div>
<script>
${js.replace(/<\/script/g, '<\\/script')}
</script>
</body>
</html>
`;
const out = process.argv.includes('--dbg') ? root + 'build/fps-test.html' : root + 'build/index.html';
fs.writeFileSync(out, html);
console.log('wrote', out, (html.length / 1024).toFixed(0) + ' KB');
