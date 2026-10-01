# The other missions' scores.
import sys, os, random; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../music')
ONLY = sys.argv[2].split(',') if len(sys.argv) > 2 else None
random.seed(11)
def L(r, o): return P(r + str(o))
MIN = ('m',)
def qual(c): return 'm' if c.endswith('m') else 'M'
def root(c): return c[:-1] if c.endswith('m') else c

def menu():   # brooding military main theme
    s = Song(96, 64, 'menu')
    st = s.track('slowstr', 95, 70); vc = s.track('cello', 95, 60); cb = s.track('bass', 100, 50); hn = s.track('horns', 105, 65); tb = s.track('trombone', 90, 60)
    kit = s.track('kit_orch', 95, 50); timp = s.track('timp', 105, 55); ch = s.track('choir', 80, 80); bd = s.track('bdrum', 115, 50)
    prog = ['Dm', 'Dm', 'Bbm', 'C', 'Dm', 'Gm', 'A', 'A'] * 2
    prog = ['Dm', 'Dm', 'Bb', 'C', 'Dm', 'Gm', 'A', 'A'] * 2
    for bar in range(16):
        c = prog[bar]; b0 = bar * 4; ch3 = chord(root(c) + '3', qual(c))
        n(st, b0, 4, [p + 12 for p in ch3], 80 + (15 if bar >= 8 else 0)); n(vc, b0, 4, L(root(c), 2), 90); n(cb, b0, 4, L(root(c), 1), 95)
        # snare cadence: the drum line
        for e, v in [(0, 90), (0.75, 60), (1, 75), (1.5, 60), (1.75, 55), (2, 90), (2.5, 65), (3, 80), (3.25, 55), (3.5, 70), (3.75, 60)]: n(kit, b0 + e, 0.1, 38, hum(v, 6))
        if bar % 2 == 0: n(bd, b0, 2, 'C2', 110); n(timp, b0, 1, L(root(c), 2), 110)
        if bar >= 8: n(ch, b0, 4, ch3, 85); n(tb, b0, 3.5, [L(root(c), 2), L(root(c), 2) + 7], 95)
        if bar % 8 == 7: [n(timp, b0 + k * 0.125, 0.12, 'A1', 50 + k * 2) for k in range(32)]
    mel = [('D4', 3), ('F4', 1), ('A4', 4), ('G4', 2), ('F4', 1), ('E4', 1), ('F4', 4), ('D4', 3), ('E4', 1), ('F4', 2), ('G4', 2), ('A4', 6), ('A4', 2)]
    for start in (0, 32):
        b = start
        for p, d in mel: n(hn, b, d * 0.95, p, 100 if start else 85); n(hn, b, d * 0.95, P(p) - 12, 80); b += d
    return s

def camp():   # bouncy, slightly ridiculous training march
    s = Song(116, 64, 'camp')
    tu = s.track('tuba', 105, 30); pz = s.track('pizz', 90, 40); fl = s.track('piccolo', 85, 45); cl = s.track('clarinet', 80, 45); gl = s.track('glock', 70, 50); kit = s.track('kit_orch', 95, 40); bn = s.track('bassoon', 85, 40); hn = s.track('horns', 80, 50)
    prog = ['F', 'F', 'C', 'F', 'Bb', 'F', 'C', 'C'] * 2
    for bar in range(16):
        c = prog[bar]; b0 = bar * 4; r = L(c, 2); ch4 = chord(c + '4', 'M')
        n(tu, b0, 0.8, r, 105); n(tu, b0 + 2, 0.8, r + 7 - 12, 95)
        for q in (1, 3): n(pz, b0 + q, 0.4, ch4, 75); n(hn, b0 + q, 0.4, [p - 12 for p in ch4], 55)
        for e, v in [(0, 85), (0.5, 50), (1, 70), (1.5, 50), (1.75, 45), (2, 80), (2.5, 50), (3, 70), (3.5, 55), (3.75, 50)]: n(kit, b0 + e, 0.1, 38, hum(v, 5))
        if bar % 4 == 0: n(kit, b0, 2, 57, 70)
        n(bn, b0 + 3.5, 0.4, r + 12 + 4, 60)
    mel = [('C5', 1), ('A4', 0.5), ('C5', 0.5), ('F5', 1), ('C5', 1), ('D5', 1), ('C5', 0.5), ('A4', 0.5), ('G4', 2), ('E4', 1), ('G4', 0.5), ('Bb4', 0.5), ('E5', 1), ('C5', 1), ('F5', 2), ('C5', 2),
           ('D5', 1), ('C5', 1), ('Bb4', 1), ('A4', 1), ('C5', 2), ('A4', 2), ('G4', 1), ('A4', 0.5), ('Bb4', 0.5), ('C5', 1), ('E4', 1), ('F4', 4)]
    for start in (0, 32):
        b = start
        for p, d in mel: n(fl, b, d * 0.85, p, 85); n(cl if start else gl, b, d * 0.85, P(p) - (12 if start else 0), 70 if start else 60); b += d
    return s

def camp_pit():
    s = Song(140, 64, 'camp_pit')
    st = s.track('strings', 100, 30); tk = s.track('taiko', 115, 30); br = s.track('brass', 105, 40); kit = s.track('kit_orch', 100, 35); sb = s.track('synbass2', 90, 20); tick = s.track('woodblk', 60, 20)
    prog = ['Dm', 'Dm', 'F', 'C'] * 4
    for bar in range(16):
        c = prog[bar]; b0 = bar * 4; r = L(root(c), 3)
        for i in range(8): n(st, b0 + i * 0.5, 0.35, r + [0, 0, 7, 0, 0, 3, 7, 5][i] - (0 if qual(c) == 'm' else 0), hum(95 if i % 2 == 0 else 75)); n(sb, b0 + i * 0.5, 0.3, r - 24, 90)
        for bt, v in [(0, 120), (1, 90), (1.5, 100), (2, 115), (3, 95), (3.5, 100)]: n(tk, b0 + bt, 0.4, 'D3', hum(v))
        for e in range(4): n(tick, b0 + e, 0.1, 'C6', 50)
        if bar % 2 == 0: n(br, b0, 0.5, chord(root(c) + '3', qual(c)), 110)
        for e in range(8): n(kit, b0 + e * 0.5, 0.1, 38, 60 if e % 2 else 80)
    return s

def ghillie():   # the stealth level: almost nothing, and that's the point
    s = Song(66, 96, 'ghillie')
    vc = s.track('cello', 85, 70); cb = s.track('bass', 85, 70); hv = s.track('violin', 55, 95); ce = s.track('celeste', 65, 95); at = s.track('atmos', 75, 95); timp = s.track('timp', 70, 80); hp = s.track('harp', 60, 90)
    roots = ['A', 'A', 'F', 'F', 'D', 'D', 'E', 'E'] * 3
    pent = ['A4', 'C5', 'D5', 'E5', 'G5', 'A5']
    for bar in range(24):
        r = roots[bar]; b0 = bar * 4
        if bar % 2 == 0: n(vc, b0, 8, L(r, 2), 70); n(cb, b0, 8, L(r, 1), 70); n(at, b0, 8, chord(r + '3', 'm' if r in ('A', 'D', 'E') else 'M'), 60)
        if bar % 4 == 1: n(hv, b0, 7, 'E6', 40)
        if random.random() < 0.6: n(ce, b0 + random.choice([0.5, 1, 1.5, 2.5]), 2, random.choice(pent), 50)
        if bar % 8 == 0: n(timp, b0, 3, 'A1', 55)
        if bar % 4 == 3: n(hp, b0 + 2, 2, L(r, 3), 45); n(hp, b0 + 2.5, 2, L(r, 3) + 7, 40)
    return s

def ghillie_tense():   # chopper overhead / the convoy: a heartbeat and held breath
    s = Song(80, 64, 'ghillie_tense')
    vc = s.track('cello', 90, 50); tr = s.track('tremolo', 85, 70); bd = s.track('bdrum', 110, 40); cb = s.track('bass', 90, 50); at = s.track('soundtrack', 70, 80)
    for bar in range(16):
        b0 = bar * 4; r = ['A', 'A', 'Bb', 'A'][bar % 4]
        for e in range(8): n(vc, b0 + e * 0.5, 0.3, L(r, 2), hum(70 if e % 2 == 0 else 50))
        n(bd, b0, 0.5, 'C2', 100); n(bd, b0 + 0.4, 0.5, 'C2', 75); n(bd, b0 + 2, 0.5, 'C2', 95); n(bd, b0 + 2.4, 0.5, 'C2', 70)   # heartbeat
        if bar % 2 == 0: n(tr, b0, 8, ['E5', 'F5'] if bar % 4 == 0 else ['E5', 'Bb5'], 60); ramp(tr, b0, b0 + 8, 40, 110); n(cb, b0, 8, L(r, 1), 80); n(at, b0, 8, ['A3', 'E4'], 60)
    return s

def ghillie_hold():
    s = Song(128, 64, 'ghillie_hold')
    st = s.track('strings', 105, 35); vc = s.track('cello', 95, 35); cb = s.track('bass', 105, 30); tk = s.track('taiko', 120, 30); br = s.track('brass', 105, 45); hn = s.track('horns', 100, 60); ch = s.track('oohs', 80, 70); kit = s.track('kit_orch', 100, 40)
    prog = ['Am', 'Am', 'F', 'G', 'Am', 'Am', 'Dm', 'E'] * 2
    for bar in range(16):
        c = prog[bar]; b0 = bar * 4; r = L(root(c), 3)
        for i in range(16): n(st, b0 + i * 0.25, 0.2, r + [0, 0, 12, 0, 0, 7, 0, 3][i % 8], hum(100 if i % 4 == 0 else 78, 4)); 
        for i in range(8): n(vc, b0 + i * 0.5, 0.4, r - 12, hum(90 if i % 2 == 0 else 70))
        n(cb, b0, 4, r - 24, 110)
        for bt, v in [(0, 125), (1.5, 100), (2, 115), (2.75, 90), (3, 110)]: n(tk, b0 + bt, 0.4, 'C3', hum(v))
        if bar % 2 == 0: n(br, b0, 0.7, chord(root(c) + '3', qual(c)), 115); n(ch, b0, 8, chord(root(c) + '4', qual(c)), 80)
        if bar % 4 == 0: n(kit, b0, 2, 49, 100)
    mel = [('A4', 2), ('C5', 1), ('B4', 1), ('A4', 4), ('F4', 2), ('G4', 2), ('E4', 4)]
    for start in (32, 48):
        b = start
        for p, d in mel: n(hn, b, d * 0.95, p, 110); n(hn, b, d * 0.95, P(p) - 12, 90); b += d
    return s

def ship():
    s = Song(108, 64, 'ship')
    vc = s.track('cello', 100, 45); st = s.track('strings', 85, 50); tr = s.track('tremolo', 75, 70); cb = s.track('bass', 100, 40); tk = s.track('taiko', 105, 40); pad = s.track('synstr', 70, 70); timp = s.track('timp', 95, 50)
    prog = ['Em', 'Em', 'C', 'C', 'Am', 'Am', 'B', 'B'] * 2
    for bar in range(16):
        c = prog[bar]; b0 = bar * 4; r = L(root(c), 2)
        pat = [0, 0, 0, 3, 0, 0, 5, 3] if qual(c) == 'm' else [0, 0, 0, 4, 0, 0, 5, 4]
        for i in range(8): n(vc, b0 + i * 0.5, 0.4, r + pat[i], hum(95 if i % 2 == 0 else 72)); n(st, b0 + i * 0.5, 0.4, r + 12 + pat[i], hum(70 if i % 2 == 0 else 55))
        n(cb, b0, 4, r - 12, 100)
        for bt in (0.5, 1.5, 2.5, 3.5): n(tk, b0 + bt, 0.3, 'G3', hum(85))
        if bar % 2 == 0: n(tr, b0, 8, chord(root(c) + '5', qual(c))[:2], 55); n(pad, b0, 8, chord(root(c) + '3', qual(c)), 60)
        if bar % 4 == 0: n(timp, b0, 1, r, 105)
    return s

def ship_sink():
    s = Song(144, 64, 'ship_sink')
    st = s.track('strings', 110, 30); vc = s.track('cello', 100, 30); cb = s.track('bass', 110, 25); tk = s.track('taiko', 122, 25); br = s.track('brass', 110, 40); tb = s.track('trombone', 105, 40); kit = s.track('kit_orch', 105, 35); timp = s.track('timp', 110, 35); ch = s.track('choir', 85, 70)
    roots = ['E', 'E', 'F', 'E', 'E', 'E', 'D', 'C'] * 2
    for bar in range(16):
        r = L(roots[bar], 3); b0 = bar * 4
        for i in range(16): n(st, b0 + i * 0.25, 0.2, r + [0, 12, 0, 1, 0, 7, 0, 3, 0, 12, 0, 1, 0, 7, 3, 1][i], hum(105 if i % 4 == 0 else 82, 4)); n(vc, b0 + i * 0.25, 0.2, r - 12, hum(85 if i % 2 == 0 else 65))
        n(cb, b0, 4, r - 24, 120)
        for e in range(8): n(tk, b0 + e * 0.5, 0.3, 'C3', hum(118 if e % 2 == 0 else 92))
        if bar % 2 == 0: n(tb, b0, 1.5, [r - 12, r - 11], 115); n(br, b0 + 2, 0.4, [r, r + 1, r + 7], 115)   # brass falls
        if bar % 4 == 0: n(kit, b0, 2, 49, 110); n(ch, b0, 15.5, [r + 12, r + 13, r + 19], 95)
        if bar % 4 == 3: [n(timp, b0 + k * 0.125, 0.12, r - 12, 50 + k * 2) for k in range(32)]
    return s

def bog():   # night, marines: a snare cadence, a synth pulse, low brass
    s = Song(92, 64, 'bog')
    kit = s.track('kit_orch', 85, 45); sb = s.track('synbass2', 90, 30); tb = s.track('trombone', 85, 60); tu = s.track('tuba', 85, 50); tr = s.track('tremolo', 70, 70); pad = s.track('soundtrack', 70, 80); bd = s.track('bdrum', 110, 50)
    roots = ['C', 'C', 'Ab', 'Ab', 'F', 'F', 'G', 'G'] * 2
    for bar in range(16):
        r = roots[bar]; b0 = bar * 4
        for e in range(8): n(sb, b0 + e * 0.5, 0.3, L(r, 2), hum(90 if e % 2 == 0 else 70))
        for e, v in [(0, 70), (0.5, 40), (0.75, 45), (1, 60), (1.5, 40), (2, 70), (2.25, 40), (2.5, 50), (3, 60), (3.5, 45), (3.75, 50)]: n(kit, b0 + e, 0.1, 38, hum(v, 6))
        if bar % 2 == 0: n(tb, b0, 7.5, [L(r, 2), L(r, 2) + 7], 75); ramp(tb, b0, b0 + 7, 60, 115); n(tu, b0, 8, L(r, 1), 80); n(pad, b0, 8, chord(r + '3', 'm' if r in ('C', 'F') else 'M'), 60)
        if bar % 4 == 0: n(bd, b0, 2, 'C2', 105)
        if bar % 4 == 2: n(tr, b0, 8, ['G5', 'Ab5'], 50)
    return s

def bog_fight():
    s = Song(120, 64, 'bog_fight')
    st = s.track('strings', 100, 30); sb = s.track('synbass2', 95, 20); tk = s.track('taiko', 118, 30); br = s.track('brass', 105, 45); kit = s.track('kit_orch', 95, 35); pad = s.track('synstr', 70, 50); cb = s.track('bass', 100, 30)
    prog = ['Cm', 'Cm', 'Ab', 'Bb', 'Cm', 'Cm', 'Fm', 'G'] * 2
    for bar in range(16):
        c = prog[bar]; b0 = bar * 4; r = L(root(c), 3)
        pat = [0, 0, 3, 0, 0, 7, 0, 5] if qual(c) == 'm' else [0, 0, 4, 0, 0, 7, 0, 5]
        for i in range(8): n(st, b0 + i * 0.5, 0.4, r + pat[i], hum(95 if i % 2 == 0 else 74)); n(sb, b0 + i * 0.5, 0.35, r - 24, hum(95 if i % 4 == 0 else 78))
        n(cb, b0, 4, r - 24, 100)
        for bt, v in [(0, 122), (0.75, 85), (1.5, 100), (2, 118), (2.5, 85), (3, 105), (3.5, 95)]: n(tk, b0 + bt, 0.4, 'D3' if bt in (0, 2) else 'A3', hum(v))
        if bar % 4 == 0: n(br, b0, 0.6, chord(root(c) + '3', qual(c)), 115); n(kit, b0, 2, 57, 80)
        if bar % 2 == 0: n(pad, b0, 8, chord(root(c) + '4', qual(c)), 60)
        if bar % 4 == 3: [n(kit, b0 + 2 + k * 0.125, 0.1, 38, 45 + k * 4) for k in range(16)]
    return s

def bog_hold():
    s = Song(132, 64, 'bog_hold')
    st = s.track('strings', 110, 30); vc = s.track('cello', 100, 30); cb = s.track('bass', 110, 25); tk = s.track('taiko', 125, 25); bd = s.track('bdrum', 120, 30); br = s.track('brass', 110, 45); hn = s.track('horns', 105, 60); ch = s.track('choir', 85, 70); kit = s.track('kit_orch', 105, 35); timp = s.track('timp', 110, 40)
    prog = ['Cm', 'Cm', 'Ab', 'Ab', 'Eb', 'Eb', 'G', 'G'] * 2
    for bar in range(16):
        c = prog[bar]; b0 = bar * 4; r = L(root(c), 3)
        for i in range(16): n(st, b0 + i * 0.25, 0.2, r + [0, 0, 12, 0, 0, 10, 0, 7, 0, 0, 12, 0, 0, 10, 7, 5][i] if qual(c) == 'm' else r + [0, 0, 12, 0, 0, 11, 0, 7, 0, 0, 12, 0, 0, 11, 7, 4][i], hum(105 if i % 4 == 0 else 82, 4))
        for i in range(8): n(vc, b0 + i * 0.5, 0.4, r - 12, hum(95 if i % 2 == 0 else 72))
        n(cb, b0, 4, r - 24, 120)
        for bt, v in [(0, 127), (1, 95), (1.5, 105), (2, 120), (2.75, 95), (3, 115), (3.5, 105)]: n(tk, b0 + bt, 0.4, 'C3', hum(v))
        if bar % 2 == 0: n(bd, b0, 2, 'C2', 122); n(br, b0, 0.8, chord(root(c) + '3', qual(c)), 118); n(ch, b0, 8, chord(root(c) + '4', qual(c)), 90)
        if bar % 4 == 0: n(kit, b0, 2, 49, 110); n(timp, b0, 1, r - 12, 120)
    mel = [('C5', 2), ('Eb5', 1), ('D5', 1), ('C5', 3), ('G4', 1), ('Ab4', 2), ('C5', 2), ('Bb4', 4), ('G4', 2), ('Bb4', 2), ('C5', 2), ('D5', 2), ('Eb5', 3), ('D5', 1), ('C5', 2), ('B4', 2), ('D5', 4)]
    b = 32
    for p, d in mel: n(hn, b, d * 0.95, p, 112); n(hn, b, d * 0.95, P(p) - 12, 95); b += d
    return s

def muzak():   # Terminal 69: an airport bossa nova. aggressively relaxing.
    s = Song(118, 64, 'muzak')
    gt = s.track('nylon', 90, 40); ub = s.track('ubass', 100, 30); ep = s.track('epiano', 80, 50, chorus=60); fl = s.track('flute', 85, 60); kit = s.track('kit_brush', 80, 40); vib = s.track('vibes', 70, 60)
    prog = [('C4', [0, 4, 7, 11]), ('A3', [0, 3, 7, 10]), ('D4', [0, 3, 7, 10]), ('G3', [0, 4, 7, 10]), ('E4', [0, 3, 7, 10]), ('A3', [0, 4, 7, 10]), ('D4', [0, 3, 7, 10]), ('G3', [0, 4, 7, 10])] * 2
    for bar in range(16):
        r, iv = prog[bar]; b0 = bar * 4; rr = P(r); ch = [rr + i for i in iv]
        for bt in (0, 1.5, 2.5, 3.5): n(gt, b0 + bt, 0.45, ch, hum(70, 5))
        n(ub, b0, 1.4, rr - 24, 95); n(ub, b0 + 1.5, 0.4, rr - 24 + 7, 80); n(ub, b0 + 2, 1.4, rr - 24 + 7, 85); n(ub, b0 + 3.5, 0.4, rr - 24, 75)
        n(ep, b0, 3.8, [p + 12 for p in ch[1:]], 55)
        for e in range(8): n(kit, b0 + e * 0.5, 0.1, 42, 45 if e % 2 else 60)
        for bt in (0, 1.5, 3): n(kit, b0 + bt, 0.1, 37, 55)   # rim click
    mel = [('E5', 1.5), ('D5', 0.5), ('C5', 2), ('A4', 4), ('C5', 1), ('D5', 1), ('F5', 2), ('E5', 4), ('G5', 1.5), ('F5', 0.5), ('E5', 2), ('D5', 2), ('C5', 2), ('B4', 4), ('rest', 2)]
    for start, inst in ((0, fl), (32, vib)):
        b = start
        for p, d in mel:
            if p != 'rest': n(inst, b, d * 0.9, p, 80)
            b += d
    return s

def dome():   # the Pleasure Dome: four on the floor
    s = Song(124, 64, 'dome')
    kit = s.track('kit_909', 110, 25); sb = s.track('acid', 95, 20); st = s.track('polysynth', 80, 50, chorus=60); pad = s.track('sweep', 65, 70)
    prog = ['A', 'A', 'F', 'G'] * 4
    for bar in range(16):
        r = prog[bar]; b0 = bar * 4; rr = L(r, 2)
        for q in range(4): n(kit, b0 + q, 0.2, 36, 120); n(kit, b0 + q + 0.5, 0.1, 42, 70)
        for q in (1, 3): n(kit, b0 + q, 0.2, 39, 95)
        for e in range(16): n(sb, b0 + e * 0.25, 0.2, rr + [0, 12, 0, 0, 12, 0, 10, 12][e % 8], hum(90 if e % 4 == 0 else 70))
        for bt in (0.5, 1.75, 3): n(st, b0 + bt, 0.3, chord(r + '4', 'm' if r == 'A' else 'M'), 85)
        if bar % 4 == 0: n(pad, b0, 16, chord(r + '3', 'm'), 55); n(kit, b0, 1, 49, 90)
    return s

def chase():
    s = Song(152, 64, 'chase')
    st = s.track('strings', 110, 30); vc = s.track('cello', 100, 30); cb = s.track('bass', 110, 25); tk = s.track('taiko', 122, 25); br = s.track('brass', 110, 40); hn = s.track('horns', 110, 55); kit = s.track('kit_orch', 105, 35); ch = s.track('choir', 85, 65); timp = s.track('timp', 110, 35)
    prog = ['Dm', 'Dm', 'Bb', 'C', 'Dm', 'Dm', 'Gm', 'A'] * 2
    for bar in range(16):
        c = prog[bar]; b0 = bar * 4; r = L(root(c), 3)
        for i in range(16): n(st, b0 + i * 0.25, 0.2, r + ([0, 0, 7, 0, 0, 12, 0, 7, 0, 0, 7, 0, 10, 0, 7, 5][i] if qual(c) == 'm' else [0, 0, 7, 0, 0, 12, 0, 7, 0, 0, 7, 0, 11, 0, 7, 4][i]), hum(105 if i % 4 == 0 else 84, 4))
        for i in range(8): n(vc, b0 + i * 0.5, 0.4, r - 12, hum(95 if i % 2 == 0 else 74))
        n(cb, b0, 4, r - 24, 118)
        for e in range(8): n(tk, b0 + e * 0.5, 0.3, 'C3' if e % 2 == 0 else 'G3', hum(118 if e % 2 == 0 else 95))
        if bar % 2 == 0: n(br, b0, 0.6, chord(root(c) + '3', qual(c)), 118); n(ch, b0, 8, chord(root(c) + '4', qual(c)), 85)
        if bar % 4 == 0: n(kit, b0, 2, 49, 110); n(timp, b0, 1, r - 12, 120)
    mel = [('D5', 1), ('E5', 1), ('F5', 2), ('A5', 2), ('G5', 1), ('F5', 1), ('E5', 2), ('C5', 2), ('D5', 4), ('F5', 1), ('G5', 1), ('A5', 2), ('Bb5', 2), ('A5', 2), ('G5', 2), ('A5', 4), ('C#5', 4)]
    b = 32
    for p, d in mel: n(hn, b, d * 0.95, P(p) - 12, 115); n(hn, b, d * 0.95, P(p) - 24, 95); b += d
    return s

def finale():   # the bridge, after: slow strings and a piano that knows
    s = Song(64, 64, 'finale')
    st = s.track('slowstr', 100, 75); vc = s.track('cello', 90, 70); pn = s.track('piano', 90, 80); ch = s.track('oohs', 70, 85); cb = s.track('bass', 85, 70)
    prog = [('D', 'm'), ('Bb', 'M'), ('G', 'm'), ('A', 'M'), ('D', 'm'), ('F', 'M'), ('G', 'm'), ('A', 'M')] * 2
    for bar in range(16):
        r, k = prog[bar]; b0 = bar * 4; c = chord(r + '4', k)
        n(st, b0, 4, c, 70 + (12 if bar >= 8 else 0)); n(vc, b0, 4, L(r, 2), 80); n(cb, b0, 4, L(r, 1), 70)
        for i, p in enumerate([c[0] - 12, c[2] - 12, c[1], c[2]]): n(pn, b0 + i, 1.5, p, 55)
        if bar >= 8: n(ch, b0, 4, [p - 12 for p in c], 60)
    mel = [('A5', 3), ('G5', 1), ('F5', 4), ('D5', 3), ('E5', 1), ('C#5', 4), ('D5', 2), ('F5', 2), ('A5', 4), ('Bb5', 2), ('A5', 2), ('E5', 4)]
    b = 0
    for p, d in mel * 2: n(pn, b, d * 0.9, p, 70); b += d
    return s

for fn in [menu, camp, camp_pit, ghillie, ghillie_tense, ghillie_hold, ship, ship_sink, bog, bog_fight, bog_hold, muzak, dome, chase, finale]:
    if ONLY and fn.__name__ not in ONLY: continue
    sg = fn(); x = render(sg); mp, secs = save(sg, x, OUT); print(sg.name, round(secs, 1), 's', os.path.getsize(mp) // 1024, 'KB')
