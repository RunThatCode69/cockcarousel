# Scorched Girth: the score. Brian-Tyler-ish: low-string ostinatos, taiko, horns, choir, a lot of D minor.
import sys, os, random; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../music')
random.seed(7)
ROOTS = {'Dm': 'D', 'Bb': 'Bb', 'Gm': 'G', 'A': 'A', 'F': 'F', 'C': 'C', 'Eb': 'Eb'}
def low(r, o=2): return P(r + str(o))

def heli():
    s = Song(120, 64, 'sg_heli')
    ost = s.track('strings', 105, 35); vc = s.track('cello', 95, 35); cb = s.track('bass', 110, 30)
    hn = s.track('horns', 110, 55); br = s.track('brass', 100, 45); ch = s.track('oohs', 80, 70); tk = s.track('taiko', 120, 30); timp = s.track('timp', 110, 40)
    bd = s.track('bdrum', 120, 30); kit = s.track('kit_orch', 100, 40); pad = s.track('soundtrack', 70, 60)
    prog = ['Dm', 'Dm', 'Bb', 'Bb', 'Gm', 'Gm', 'A', 'A'] * 2
    figs = [[0, 0, 12, 0, 0, 10, 0, 7, 0, 0, 12, 0, 0, 10, 7, 5]]
    for bar in range(16):
        c = prog[bar]; r = low(ROOTS[c], 3); b0 = bar * 4; big = bar >= 8
        f = figs[0]
        for i in range(16):
            iv = f[i] if c != 'A' else [0, 0, 12, 0, 0, 13, 0, 7, 0, 0, 12, 0, 0, 13, 7, 4][i]
            v = (100 if i % 4 == 0 else 78) + (12 if big else 0)
            n(ost, b0 + i * 0.25, 0.22, r + iv, hum(v, 5)); n(vc, b0 + i * 0.25, 0.22, r - 12 + (iv if iv < 12 else 0), hum(v - 15, 5))
        n(cb, b0, 4, r - 24, 110); n(cb, b0, 4, r - 12, 80)
        # taiko groove (bigger in B)
        for bt, v in [(0, 125), (1.5, 95), (2, 110), (3.5, 100), (3.75, 90)] + ([(1, 90), (2.75, 85), (3, 115)] if big else []): n(tk, b0 + bt, 0.5, 'C3' if bt % 2 == 0 else 'G3', hum(v))
        if bar % 2 == 0: n(bd, b0, 2, 'C2', 120)
        if bar % 4 == 3: [n(kit, b0 + 2 + k * 0.125, 0.1, 38, 50 + k * 5) for k in range(16)]   # snare roll into the next phrase
        if bar % 4 == 0: n(kit, b0, 3, 49, 110 if big else 80); n(timp, b0, 1, r - 12, 120)
        if bar == 7: [n(timp, b0 + k * 0.125, 0.12, low('A', 2), 40 + k * 3) for k in range(32)]
        pc = chord(ROOTS[c] + '4', 'M' if c in ('Bb', 'A', 'F', 'C') else 'm')
        if bar % 2 == 0: n(pad, b0, 8, pc, 70)
        if big and bar % 2 == 0: n(ch, b0, 8, [p - 12 for p in pc], 85); n(br, b0, 1.5, [p - 12 for p in pc], 110); n(br, b0 + 2.5, 1, [p - 12 for p in pc], 95)
    # the horn theme (B section): long heroic notes over the ostinato
    mel = [('D4', 2), ('F4', 1), ('E4', 1), ('D4', 3), ('A3', 1), ('Bb3', 2), ('D4', 2), ('F4', 3), ('E4', 1), ('D4', 2), ('C4', 2), ('D4', 4),
           ('A4', 2), ('G4', 1), ('F4', 1), ('E4', 4), ('C#4', 4)]
    b = 32
    for p, d in mel: n(hn, b, d * 0.95, p, 112); n(hn, b, d * 0.95, P(p) - 12, 95); b += d
    # A section: horns hold low swells
    for bar in range(0, 8, 2): n(hn, bar * 4, 7.5, low(ROOTS[prog[bar]], 3), 80); ramp(hn, bar * 4, bar * 4 + 7, 60, 120)
    return s

def combat():
    s = Song(132, 64, 'sg_combat')
    ost = s.track('strings', 95, 30); sb = s.track('synbass2', 95, 20); tk = s.track('taiko', 115, 30); br = s.track('brass', 100, 45); pad = s.track('synstr', 70, 50); kit = s.track('kit_orch', 90, 40); bd = s.track('bdrum', 110, 30)
    prog = ['Dm', 'Dm', 'Dm', 'Bb', 'Gm', 'Gm', 'A', 'A'] * 2
    for bar in range(16):
        c = prog[bar]; r = low(ROOTS[c], 3); b0 = bar * 4
        pat = [0, 0, 0, 3, 0, 0, 0, 5] if c != 'A' else [0, 0, 0, 4, 0, 0, 0, 1]
        for i in range(8): n(ost, b0 + i * 0.5, 0.4, r + pat[i], hum(92 if i % 2 == 0 else 72)); n(sb, b0 + i * 0.5, 0.35, r - 24, hum(100 if i % 4 == 0 else 80))
        for bt, v in [(0, 120), (0.75, 85), (1.5, 100), (2, 115), (3, 105), (3.5, 90)]: n(tk, b0 + bt, 0.4, 'D3' if bt in (0, 2) else 'A3', hum(v))
        if bar % 4 == 0: n(bd, b0, 2, 'C2', 115); n(br, b0, 0.6, chord(ROOTS[c] + '3', 'm' if c in ('Dm', 'Gm') else 'M'), 115); n(kit, b0, 2, 57, 70)
        if bar % 4 == 2: n(br, b0 + 3, 0.5, chord(ROOTS[c] + '3', 'm' if c in ('Dm', 'Gm') else 'M'), 100)
        if bar % 2 == 0: n(pad, b0, 8, chord(ROOTS[c] + '4', 'm' if c in ('Dm', 'Gm') else 'M'), 60)
        if bar == 15: [n(kit, b0 + 2 + k * 0.125, 0.1, 38, 45 + k * 4) for k in range(16)]
    return s

def overwatch():
    s = Song(84, 64, 'sg_overwatch')
    vc = s.track('cello', 95, 45); hi = s.track('slowstr', 70, 70); pad = s.track('soundtrack', 70, 70); tick = s.track('woodblk', 50, 30); timp = s.track('timp', 90, 50); cb = s.track('bass', 95, 40); harp = s.track('harp', 70, 70)
    roots = ['D', 'D', 'Bb', 'Bb', 'G', 'G', 'A', 'A'] * 2
    for bar in range(16):
        r = low(roots[bar], 2); b0 = bar * 4
        for q in range(4): n(vc, b0 + q, 0.6, r if q % 2 == 0 else r + 12, hum(85 if q == 0 else 65))
        for e in range(8): n(tick, b0 + e * 0.5, 0.1, 'G5' if e % 2 == 0 else 'C5', 40 if e % 2 == 0 else 25)
        if bar % 2 == 0: n(hi, b0, 8, ['D5', 'A5'] if bar < 8 else ['D5', 'Eb5', 'A5'], 60); n(cb, b0, 8, r - 12, 80); n(pad, b0, 8, chord(roots[bar] + '3', 'm' if roots[bar] in ('D', 'G') else 'M'), 60)
        if bar % 4 == 0: n(timp, b0, 2, r, 90)
        if bar % 2 == 1: n(harp, b0 + 2, 1, r + 24, 60); n(harp, b0 + 2.5, 1, r + 31, 55); n(harp, b0 + 3, 1, r + 36, 50)
    return s

def killzone():
    s = Song(150, 64, 'sg_killzone')
    ost = s.track('strings', 110, 30); vc = s.track('cello', 100, 30); cb = s.track('bass', 110, 25); tk = s.track('taiko', 125, 25); bd = s.track('bdrum', 120, 25)
    br = s.track('brass', 110, 45); tb = s.track('trombone', 105, 40); ch = s.track('choir', 85, 70); kit = s.track('kit_orch', 105, 35); timp = s.track('timp', 110, 35)
    roots = ['D', 'D', 'Eb', 'D', 'D', 'D', 'C', 'Bb'] * 2
    for bar in range(16):
        r = low(roots[bar], 3); b0 = bar * 4
        for i in range(16):
            iv = [0, 12, 0, 1, 0, 12, 0, 3, 0, 12, 0, 1, 0, 7, 6, 5][i]
            n(ost, b0 + i * 0.25, 0.2, r + iv, hum(105 if i % 4 == 0 else 85, 4)); n(vc, b0 + i * 0.25, 0.2, r - 12, hum(90 if i % 2 == 0 else 70, 4))
        n(cb, b0, 4, r - 24, 120)
        for e in range(8): n(tk, b0 + e * 0.5, 0.3, 'C3' if e % 2 == 0 else 'F3', hum(120 if e % 2 == 0 else 95))
        n(bd, b0, 1, 'C2', 125); n(bd, b0 + 2, 1, 'C2', 115)
        if bar % 2 == 0: n(tb, b0, 3.5, [r - 12, r - 11], 110); n(br, b0 + 3.5, 0.5, [r, r + 3, r + 7], 115)
        if bar % 4 == 0: n(kit, b0, 2, 49, 115); n(ch, b0, 15.5, [r + 12, r + 15, r + 19], 100); n(timp, b0, 1, r - 12, 125)
        if bar % 4 == 3: [n(kit, b0 + k * 0.125, 0.1, 38, 50 + k * 2) for k in range(32)]
    return s

def opener():
    s = Song(60, 64, 'sg_open')
    cb = s.track('bass', 110, 50); trm = s.track('tremolo', 100, 60); hiv = s.track('violin', 70, 90); pad = s.track('soundtrack', 90, 80); atm = s.track('atmos', 80, 90)
    tb = s.track('trombone', 105, 60); tu = s.track('tuba', 105, 50); bd = s.track('bdrum', 127, 70); tk = s.track('taiko', 127, 60); rc = s.track('revcym', 110, 60); timp = s.track('timp', 120, 60)
    for bar in range(16):
        b0 = bar * 4
        n(cb, b0, 4, 'D1', 110); n(cb, b0, 4, 'D2', 80)
        if bar % 2 == 0: n(trm, b0, 8, ['D2', 'Eb2', 'A2'], 90); ramp(trm, b0, b0 + 8, 50, 115)
        if bar % 4 == 0: n(hiv, b0, 16, 'A6', 45); n(pad, b0, 16, ['D3', 'A3', 'Eb4'], 80); n(atm, b0, 16, ['D4', 'G4'], 60)
        if bar % 4 == 2: n(rc, b0, 2, 'C4', 110)
        if bar % 4 == 3 or bar % 4 == 0:
            if bar % 4 == 0: n(bd, b0, 4, 'C2', 127); n(tk, b0, 2, 'C2', 127); n(timp, b0, 2, 'D2', 127)
        if bar in (5, 6, 13, 14): n(tk, b0 + 2.5, 1, 'C2', 110); n(tk, b0 + 3, 1, 'G2', 100)
        if bar >= 12: n(tb, b0, 4, ['D2', 'Ab2'], 70 + (bar - 12) * 12); n(tu, b0, 4, 'D1', 80 + (bar - 12) * 10)
    return s

def dark():
    s = Song(56, 64, 'sg_dark')
    vc = s.track('cello', 95, 70); cb = s.track('bass', 95, 70); ch = s.track('oohs', 70, 90); pn = s.track('piano', 80, 90); hiv = s.track('slowstr', 60, 90); pad = s.track('halo', 60, 90)
    roots = ['D', 'D', 'C', 'C', 'Bb', 'Bb', 'A', 'A'] * 2
    for bar in range(16):
        r = roots[bar]; b0 = bar * 4
        if bar % 2 == 0: n(vc, b0, 8, low(r, 2), 85); n(cb, b0, 8, low(r, 1), 80); n(ch, b0, 8, chord(r + '3', 'm' if r in ('D', 'A') else 'M'), 60); n(pad, b0, 8, [low(r, 4)], 50)
        if bar % 2 == 1: n(pn, b0 + 1, 3, low(r, 3) + 7, 55); n(pn, b0 + 2.5, 2, low(r, 4) + 3 if r in ('D', 'A') else low(r, 4) + 4, 45)
        if bar % 8 == 4: n(hiv, b0, 16, ['D5', 'A5'], 50)
    return s

def ending():
    s = Song(72, 64, 'sg_end')
    st = s.track('slowstr', 100, 70); vc = s.track('cello', 90, 60); hn = s.track('horns', 95, 70); hp = s.track('harp', 80, 70); timp = s.track('timp', 80, 60); ch = s.track('oohs', 70, 80)
    prog = [('D', 'm'), ('Bb', 'M'), ('F', 'M'), ('C', 'M'), ('D', 'm'), ('Bb', 'M'), ('G', 'm'), ('A', 'M')] * 2
    for bar in range(16):
        r, k = prog[bar]; b0 = bar * 4; c = chord(r + '4', k)
        n(st, b0, 4, c, 75 + (10 if bar >= 8 else 0)); n(vc, b0, 4, low(r, 2), 85)
        for i, p in enumerate([c[0] - 12, c[1] - 12, c[2] - 12, c[0], c[1], c[2]]): n(hp, b0 + i * 0.5, 2, p, 60)
        if bar >= 8: n(ch, b0, 4, [p - 12 for p in c], 60)
    mel = [('A4', 4), ('F4', 2), ('G4', 2), ('A4', 3), ('C5', 1), ('Bb4', 4), ('A4', 4), ('F4', 2), ('E4', 2), ('D4', 4), ('C#4', 4)]
    b = 32
    for p, d in mel: n(hn, b, d * 0.95, p, 90); b += d
    n(timp, 60, 4, 'A1', 70); ramp(timp, 60, 64, 40, 110, 11)
    return s

for fn in [opener, heli, combat, overwatch, killzone, dark, ending]:
    sg = fn(); x = render(sg); mp, secs = save(sg, x, OUT); print(sg.name, round(secs, 1), 's', os.path.getsize(mp) // 1024, 'KB')
