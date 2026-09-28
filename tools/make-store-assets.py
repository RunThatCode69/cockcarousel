#!/usr/bin/env python3
"""Render App Store icons + screenshots for the two store builds, from the games' own art.

Rule enforced here: no anatomy in any image. The slide game's protagonist and the carousel
riders are switched off for every frame; the swimmer in the sperm game is kept, since an
abstract cell is not anatomy.
"""
import os, re, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '_build')
FRAMES = os.path.join(SC, 'frames')
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
FONT = '/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf'
os.makedirs(FRAMES, exist_ok=True)
CHROME_H = 143   # headless window chrome, measured: --window-size height minus innerHeight

# ----------------------------------------------------------------- harness

HOOK = """
  window.__T = {
    run: (n) => { for (let i = 0; i < n; i++) { update(); draw(); } },
    start: (m) => { if (typeof startMission === 'function') startMission(m); else start(m); },
    intro: (sc) => { state = 'intro'; scene = sc; sf = 0; },
    fit: (w, h) => { scale = 1; dpr = 1; try { portrait = false; } catch (e) {}
      cv.width = w; cv.height = h; cv.style.width = w + 'px'; cv.style.height = h + 'px'; cv.style.transform = ''; },
    setScroll: (v) => { scroll = v; },
    auto: (n) => { for (let i = 0; i < n; i++) { try { player.y = center(scroll + 220); } catch (e) {} update(); draw(); } },
    setLoot: (v) => { loot = v; },
    kill: (why) => die(why),
    ctx: () => ctx, cv: () => cv,
    iconSperm: () => {
      cv.width = 1024; cv.height = 1024; cv.style.width = '1024px'; cv.style.height = '1024px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const g = ctx.createLinearGradient(0, 0, 0, 1024);
      g.addColorStop(0, '#24407a'); g.addColorStop(1, '#0b1530');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 1024, 1024);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (let i = 0; i < 70; i++) { const x = (i * 197) % 1024, y = (i * 313) % 1024, r = 2 + (i % 3); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
      ctx.save(); ctx.translate(650, 500); ctx.rotate(-0.10); drawSperm(0, 0, 7.6, { helmet: true, ph: 1.15 }); ctx.restore();
    },
    iconGame: () => {
      window.__NORIDERS = true;
      cv.width = 1024; cv.height = 1024; cv.style.width = '1024px'; cv.style.height = '1024px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const g = ctx.createLinearGradient(0, 0, 0, 1024);
      g.addColorStop(0, '#ff9ec4'); g.addColorStop(0.55, '#ffd6e7'); g.addColorStop(1, '#fff0d6');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 1024, 1024);
      ctx.save(); ctx.translate(512, 300); ctx.rotate(0.06);
      ctx.fillStyle = '#ffe27a';
      for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.moveTo(-14, -170); ctx.lineTo(14, -170); ctx.lineTo(0, -250); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      ctx.save(); ctx.translate(512, 830); ctx.scale(2.6, 2.6); drawCarousel(0, 0); ctx.restore();
    },
  };
"""

PIN = """<style>
  html, body { margin:0 !important; padding:0 !important; width:%dpx !important; height:%dpx !important; overflow:hidden !important; }
  #wrap { position:absolute !important; left:0 !important; top:0 !important; width:%dpx !important; height:%dpx !important; display:block !important; }
  canvas { position:absolute !important; left:0 !important; top:0 !important; }
</style>
"""

DRIVER = """
<script>
window.addEventListener('load', () => {
  const T = window.__T;
  try { (function(){ %s })(); window.__FROZEN = true; document.title = 'SHOT OK'; } catch (e) { document.title = 'ERR ' + e.message; }
});
</script>
"""


def build_page(game_src, driver_js, hide_player, shot_w=960, shot_h=540):
    """Inline the game with the manual-loop flag, the hook and a scene driver."""
    s = open(os.path.join(REPO, game_src)).read()
    s = re.sub(r'<link[^>]*>\n', '', s)          # no network: falls back to Arial Rounded Bold
    s = s.replace('    draw();\n    requestAnimationFrame(loop);',
                  '    draw();\n    if (!window.__MANUAL) requestAnimationFrame(loop);')
    assert 'if (!window.__MANUAL) requestAnimationFrame(loop);' in s, 'loop guard failed: ' + game_src

    # never let a shot die mid-frame
    s = s.replace('  function die(', '  function die(_ignored_marker_', 1) if False else s
    s = re.sub(r'(\n  function die\((\w*)\) \{)', r'\1\n    if (window.__IMMORTAL) return;', s, count=1)
    assert 'if (window.__IMMORTAL) return;' in s, 'immortal guard failed: ' + game_src

    if hide_player:
        # the protagonist
        old = 'drawDick(PX, p.y + bob, gsz, { squash: p.squash, duck: p.duck && p.onGround, dk: 0.52 / gsz, flap: air, rot });'
        assert s.count(old) == 1, 'player draw not found'
        s = s.replace(old, 'if (!window.__HIDE) ' + old)
        # the carousel in the background
        old2 = 'if (cx > -200 && cx < W + 200) drawCarousel(cx, 352);'
        assert s.count(old2) == 1, 'carousel draw not found'
        s = s.replace(old2, 'if (!window.__HIDE && cx > -200 && cx < W + 200) drawCarousel(cx, 352);')
        # and its riders, so the icon can use the ride itself
        old3 = 'drawDick(r.x, gy - 22 + r.bob, 0.48 * (0.85 + 0.15 * r.z), { mirror: r.dir < 0, seed: r.i * 40 });'
        assert s.count(old3) == 1, 'carousel rider not found'
        s = s.replace(old3, 'if (!window.__NORIDERS) ' + old3)

    for fn in ('draw', 'resize'):
        old = '  function %s() {' % fn
        assert s.count(old) == 1, 'no ' + fn
        s = s.replace(old, old + '\n    if (window.__FROZEN) return;')
    s = s.replace('})();\n</script>', HOOK + '})();\n</script>', 1)
    assert 'window.__T = {' in s, 'hook failed'
    flags = '<script>window.__MANUAL=true;%s</script>\n' % ('window.__HIDE=true;' if hide_player else '')
    s = s.replace('<script>\n(() => {', flags + '<script>\n(() => {', 1)
    s = s.replace('</body>', (DRIVER % driver_js) + '</body>', 1)
    s = s.replace('</head>', PIN % (shot_w, shot_h, shot_w, shot_h) + '</head>', 1)
    return s


def shoot(html, out_png, w, h):
    """Chrome writes the PNG then lingers, so time it out and judge it by the file."""
    path = os.path.join(SC, 'shot_tmp.html')
    open(path, 'w').write(html)
    shoot.n = getattr(shoot, 'n', 0) + 1
    if os.path.exists(out_png):
        os.remove(out_png)
    import time
    proc = subprocess.Popen([CHROME, '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
                             '--no-default-browser-check', '--disable-background-networking',
                             '--disable-component-update', '--disable-extensions',
                             '--force-device-scale-factor=1', '--hide-scrollbars',
                             '--window-size=%d,%d' % (w, h + CHROME_H + 40),
                             '--user-data-dir=%s/cp-s%d' % (SC, shoot.n),
                             '--screenshot=' + out_png, 'file://' + path],
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    # Chrome writes the PNG then lingers; wait for the file to stop growing, then kill it
    deadline, last, stable = time.time() + 40, -1, 0
    while time.time() < deadline:
        time.sleep(0.4)
        sz = os.path.getsize(out_png) if os.path.exists(out_png) else -1
        stable = stable + 1 if (sz > 0 and sz == last) else 0
        last = sz
        if stable >= 3 or proc.poll() is not None:
            break
    proc.kill()
    proc.wait()
    assert os.path.exists(out_png), 'no screenshot written: ' + out_png
    im = Image.open(out_png).convert('RGB')
    assert im.size[0] >= w and im.size[1] >= h, '%s came out %s, want at least %dx%d' % (out_png, im.size, w, h)
    im.crop((0, 0, w, h)).save(out_png)
    return out_png


# ----------------------------------------------------------------- scenes

SAFE = "window.__IMMORTAL = true; T.fit(960, 540);"

SPERM_SHOTS = [
    ('01_title', SAFE + "T.run(40);",
     'YOU HAD\nONE JOB.', 'and you went the wrong way'),
    ('02_briefing', SAFE + "T.intro(1); T.run(300);",
     'THE BRIEFING\nIS AT 02:47.', 'two hundred million deploy, one comes home a father'),
    ('03_mission1', SAFE + "T.start(1); T.setScroll(3200); T.auto(120);",
     'WRONG TUNNEL.\nKEEP SWIMMING.', 'mission one: find the exit, touch nothing'),
    ('04_mission2', SAFE + "T.start(2); T.setScroll(4200); T.auto(120);",
     'EVERY RIVAL\nWANTS IT MORE.', 'dodge the immune system, collect the hearts'),
    ('05_egg', SAFE + "T.start(2); T.setScroll(11750); T.auto(60);",
     'THE FINISH LINE\nHAS A FACE.', 'reach Ovulation Station before anybody else'),
    ('06_died', SAFE + "T.start(1); T.auto(60); window.__IMMORTAL = false; T.kill('wall'); T.run(80);",
     'DYING IS PART\nOF THE JOB.', 'a new eulogy every single time'),
]

GAME_SHOTS = [
    ('01_title', SAFE + "T.run(40);",
     'TEN LEVELS.\nONE LONG SLIDE.', 'grab the eggplants, dodge everything else'),
    ('02_bees', SAFE + "T.start(3); T.setLoot(46); T.run(260);",
     'DUCK.\nSERIOUSLY, DUCK.', 'level 3: Bee Meadow'),
    ('03_night', SAFE + "T.start(5); T.setLoot(70); T.run(260);",
     'IT GETS DARK.\nIT GETS FASTER.', 'level 5: Night Shift'),
    ('04_snow', SAFE + "T.start(6); T.setLoot(80); T.run(260);",
     "IT'S COLD.\nOKAY?!", 'level 6: Shrinkage Slopes'),
    ('05_hotsauce', SAFE + "T.start(7); T.setLoot(96); T.run(260);",
     'BURNS\nA LITTLE.', 'level 7: Hot Sauce Hollow'),
    ('06_disco', SAFE + "T.start(9); T.setLoot(130); T.run(260);",
     'THE LAST ONES\nARE RIDICULOUS.', 'level 9: Disco Inferno'),
]

THEMES = {
    'sperm': {'bg': ((22, 40, 86), (6, 12, 32)), 'head': (255, 210, 63), 'head_out': (11, 21, 48),
              'sub': (255, 255, 255), 'sub_out': (11, 21, 48), 'frame': (11, 21, 48),
              'pill_bg': (26, 48, 96), 'pill_fg': (255, 210, 63), 'dots': ((255, 210, 63), (255, 255, 255)),
              'wordmark': 'SEED TEAM SIX', 'strip': ['TWO MISSIONS', 'ONE THUMB', 'NO ADS']},
    'game': {'bg': ((255, 122, 158), (255, 226, 178)), 'head': (255, 255, 255), 'head_out': (74, 29, 58),
             'sub': (74, 29, 58), 'sub_out': (255, 255, 255), 'frame': (74, 29, 58),
             'pill_bg': (224, 36, 94), 'pill_fg': (255, 255, 255), 'dots': ((255, 255, 255), (74, 29, 58)),
             'wordmark': 'SLIDE RUSH', 'strip': ['TEN LEVELS', 'ONE THUMB', 'NO ADS']},
}


# ----------------------------------------------------------------- compose

def fit(draw, text, font_path, max_w, start):
    size = start
    while size > 24:
        f = ImageFont.truetype(font_path, size)
        if max(draw.textlength(l, font=f) for l in text.split('\n')) <= max_w:
            return f
        size -= 4
    return ImageFont.truetype(font_path, 24)


def outlined(d, xy, text, font, fill, outline, w, anchor='mm'):
    x, y = xy
    for dx in range(-w, w + 1, 2):
        for dy in range(-w, w + 1, 2):
            if dx or dy:
                d.text((x + dx, y + dy), text, font=font, fill=outline, anchor=anchor, align='center')
    d.text((x, y), text, font=font, fill=fill, anchor=anchor, align='center')


def compose(frame_png, out_png, headline, sub, theme):
    import random
    W, H = 1320, 2868
    th = THEMES[theme]
    im = Image.new('RGB', (W, H))
    d = ImageDraw.Draw(im)
    top, bot = th['bg']
    for y in range(H):
        u = y / H
        d.line([(0, y), (W, y)], fill=tuple(int(top[i] + (bot[i] - top[i]) * u) for i in range(3)))

    random.seed(abs(hash(out_png)) & 0xffff)
    for _ in range(110):
        x, y, r = random.randint(0, W), random.randint(0, H), random.randint(5, 16)
        d.ellipse([x - r, y - r, x + r, y + r], fill=th['dots'][random.randint(0, 1)])

    hf = fit(d, headline, FONT, W - 150, 152)
    lines = headline.split('\n')
    lh = hf.size * 1.1
    y0 = 350 - (len(lines) - 1) * lh / 2
    for i, line in enumerate(lines):
        outlined(d, (W // 2, y0 + i * lh), line, hf, th['head'], th['head_out'], 9)
    outlined(d, (W // 2, y0 + len(lines) * lh + 46), sub, ImageFont.truetype(FONT, 54),
             th['sub'], th['sub_out'], 4)

    g = Image.open(frame_png).convert('RGB')
    cw = 1244
    ch = int(round(cw * g.size[1] / g.size[0]))
    g = g.resize((cw, ch), Image.LANCZOS)
    pad = 18
    card = Image.new('RGBA', (cw + pad * 2, ch + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(card).rounded_rectangle([0, 0, cw + pad * 2 - 1, ch + pad * 2 - 1], 48,
                                           fill=th['frame'] + (255,))
    mask = Image.new('L', (cw, ch), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, cw - 1, ch - 1], 34, fill=255)
    card.paste(g, (pad, pad), mask)
    card = card.rotate(-2.2, resample=Image.BICUBIC, expand=True)
    cx, cy = W // 2 - card.size[0] // 2, 1560 - card.size[1] // 2
    shadow = Image.new('RGBA', card.size, (0, 0, 0, 0))
    shadow.paste((0, 0, 0, 70), (0, 0), card.split()[3])
    im.paste(shadow, (cx + 10, cy + 22), shadow)
    im.paste(card, (cx, cy), card)

    # feature strip: text segments with hand-drawn dots between them
    pf = ImageFont.truetype(FONT, 50)
    segs = th['strip']
    gap = 74
    widths = [d.textlength(x, font=pf) for x in segs]
    total = sum(widths) + gap * (len(segs) - 1)
    x = W / 2 - total / 2
    py = 2225
    d.rounded_rectangle([x - 62, py - 56, x + total + 62, py + 56], 56,
                        fill=th['pill_bg'], outline=th['head_out'], width=6)
    for i, seg in enumerate(segs):
        d.text((x, py), seg, font=pf, fill=th['pill_fg'], anchor='lm')
        x += widths[i]
        if i < len(segs) - 1:
            d.ellipse([x + gap / 2 - 7, py - 7, x + gap / 2 + 7, py + 7], fill=th['pill_fg'])
            x += gap

    outlined(d, (W // 2, 2560), th['wordmark'], ImageFont.truetype(FONT, 96), th['head'], th['head_out'], 8)
    outlined(d, (W // 2, 2678), 'cockcarousel.com', ImageFont.truetype(FONT, 46), th['sub'], th['sub_out'], 3)

    im.save(out_png)
    return out_png


# ----------------------------------------------------------------- run

def main():
    jobs = [
        ('sperm', 'sperm-store/index.html', SPERM_SHOTS, False, 'iconSperm'),
        ('game', 'game-store/index.html', GAME_SHOTS, True, 'iconGame'),
    ]
    for theme, src, shots, hide, iconfn in jobs:
        outdir = os.path.join(REPO, src.split('/')[0], 'store')
        os.makedirs(os.path.join(outdir, 'screenshots'), exist_ok=True)

        # icon
        raw = os.path.join(FRAMES, '%s_icon.png' % theme)
        shoot(build_page(src, "T.fit(960,540); T.run(6); T.%s();" % iconfn, hide, 1024, 1024), raw, 1024, 1024)
        Image.open(raw).convert('RGB').save(os.path.join(outdir, 'icon-1024.png'))
        print('icon  ', theme, '->', os.path.join(outdir, 'icon-1024.png'))

        for name, drv, headline, sub in shots:
            raw = os.path.join(FRAMES, '%s_%s.png' % (theme, name))
            shoot(build_page(src, drv, hide), raw, 960, 540)
            out = os.path.join(outdir, 'screenshots', '%s.png' % name)
            compose(raw, out, headline, sub, theme)
            print('shot  ', theme, name, '->', Image.open(out).size)


if __name__ == '__main__':
    main()
