# v5.5 voice pass: casting, delivery and FX per line, so radio is radio, yelling is yelling, and MacMillilitre whispers.
# usage: python3 gen2.py <kokoro dir> <out dir> [--force] [--only WHO,WHO] [--max N]
# SARGE is deliberately left alone: his flat read is the joke.
import json, sys, os, re, subprocess, soundfile as sf, numpy as np, time
from kokoro_onnx import Kokoro
kdir, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
FORCE = '--force' in sys.argv
ONLY = sys.argv[sys.argv.index('--only') + 1].split(',') if '--only' in sys.argv else None
MAXN = int(sys.argv[sys.argv.index('--max') + 1]) if '--max' in sys.argv else 10 ** 9
DONE = os.path.join(os.environ.get('VOICE_STATE', os.path.expanduser('~')), 'v55_done.txt')
TMP = os.environ.get('VOICE_TMP', '/tmp')
k = Kokoro(os.path.join(kdir, 'kokoro-v1.0.int8.onnx'), os.path.join(kdir, 'voices-v1.0.bin'))
V = lambda n: k.get_voice_style(n)
def blend(a, b, w=0.5): return V(a) * (1 - w) + V(b) * w
# who: (voice, speed, lang, fx, pitch semitones, notes)
#   fx: 'radio' = squad comms (bandpassed, compressed, a bit of crackle); 'room' = next to you; 'intercom' = tank/plane box; 'cold' = close, quiet, menacing
CAST = {
  'PRICK':    (blend('bm_george', 'bm_fable', 0.3), 0.93, 'en-gb', 'room', -2.0),    # gruff, low, unhurried
  'MACMILLI': (blend('bm_george', 'bm_lewis', 0.5), 0.86, 'en-gb', 'close', -3.0),   # old, calm, whispering in your ear
  'SOUP':     ('bm_fable', 1.04, 'en-gb', 'radio', 0.0),
  'GAS':      ('am_liam', 1.04, 'en-us', 'radio', -0.5),
  'GROPES':   ('am_eric', 1.0, 'en-us', 'radio', -1.0),
  'JACKOFF':  (blend('am_onyx', 'em_alex', 0.25), 0.84, 'en-us', 'cold', -3.5),     # slow, deep, foreign-ish, no hurry at all
  'PILOT':    ('am_michael', 1.08, 'en-us', 'radio', 0.0),
  'TV OP':    ('am_echo', 1.0, 'en-us', 'radio', 0.0),
  'YOU':      ('am_michael', 1.02, 'en-us', 'room', 0.5),
  'VAS':      ('am_fenrir', 1.04, 'en-us', 'room', -1.5),                            # a Marine lieutenant who only has one volume
  'JIGGLES':  ('am_puck', 1.06, 'en-us', 'room', 0.0),
  'DOOLEY':   ('am_michael', 1.06, 'en-us', 'room', 0.0),
  'RAMIREZ':  ('am_echo', 1.06, 'en-us', 'room', 0.5),
  'PECKER':   ('am_santa', 1.0, 'en-us', 'intercom', -1.0),
  'SACKMAN':  (blend('am_michael', 'am_onyx', 0.35), 0.98, 'en-us', 'room', -2.5),  # gravel, command voice
  'CHUCK':    ('am_eric', 1.02, 'en-us', 'room', -1.0),
  'GRINDER':  ('am_puck', 1.08, 'en-us', 'room', 1.0),
  'OVERLORD': ('am_echo', 0.98, 'en-us', 'radio', -1.0),
  'GRANOLA':  ('am_liam', 1.1, 'en-us', 'radio', 0.0),
  'HOG':      ('am_puck', 1.05, 'en-us', 'intercom', 0.0),
}
SKIP = {'SARGE'}
# --- say it like a person would read it (the G2P spells out ALL-CAPS words, and our weapon names) ---
SUBS = [(r'\bDICK-47\b', 'Dick forty-seven'), (r'\bDICK-50\b', 'Dick fifty'), (r'\bCUM-203\b', 'Cum two-oh-three'), (r'\bDILDO-7\b', 'Dildo seven'), (r'\bHUNG-24\b', 'Hung twenty-four'),
        (r'\bT-69s?\b', lambda m: 'T sixty-nines' if m.group(0).endswith('s') else 'T sixty-nine'), (r'\bZ-PUBE\b', 'Zee-Pube'), (r'\bCum-4\b', 'Cum four'), (r'\bRUBBER-47\b', 'Rubber forty-seven'),
        (r'\bMV\b', 'M.V.'), (r'\bS\.A\.S\.', 'S.A.S.'), (r'\bF\.N\.G\.', 'F.N.G.'), (r'\bLZ\b', 'L.Z.'), (r'\bAA\b', 'double-A'), (r'\bNVG\b', 'goggles'), (r'\bRPG\b', 'R.P.G.'),
        (r'\bsir\b', 'sir'), (r'—', ', '), (r'\.\.\.', '… '), (r'\bOK\b', 'okay')]
KEEPCAPS = {'S.A.S.', 'F.N.G.', 'M.V.', 'L.Z.', 'R.P.G.', 'I', 'T'}
def speakable(t):
    for a, b in SUBS: t = re.sub(a, b, t)
    def low(m):
        w = m.group(0)
        return w if w in KEEPCAPS or len(w) == 1 else w.capitalize()
    t = re.sub(r"\b[A-Z][A-Z']+\b", low, t)
    t = t[:1].upper() + t[1:]
    if not any(c.isalpha() for c in t): t = 'Hmm.'
    return t.strip()
# --- how hot is this line? ---
def delivery(who, t):
    bangs = t.count('!'); caps = len(re.findall(r'\b[A-Z]{3,}\b', t)); short = len(t) < 45
    if who == 'MACMILLI' and not bangs: return 'whisper'
    if who == 'JACKOFF' and not caps: return 'cold'
    if bangs >= 2 or caps >= 2 or (bangs and short): return 'shout'
    if bangs: return 'raised'
    if t.endswith('?'): return 'ask'
    return 'normal'
SPEED = {'shout': 1.1, 'raised': 1.05, 'whisper': 0.92, 'cold': 0.95, 'ask': 1.0, 'normal': 1.0}
PITCH = {'shout': 1.2, 'raised': 0.6, 'whisper': -0.3, 'cold': -0.5, 'ask': 0.2, 'normal': 0.0}
def chain(fx, dl, pitch):
    f = []
    ratio = 2 ** (pitch / 12)
    if abs(pitch) > 0.05: f.append(f'rubberband=pitch={ratio:.4f}:formant=shifted:pitchq=quality')
    if dl == 'shout': f += ['volume=2.2', 'asoftclip=type=tanh:threshold=0.6', 'acompressor=threshold=-20dB:ratio=6:attack=3:release=60']
    elif dl == 'raised': f += ['volume=1.5', 'acompressor=threshold=-20dB:ratio=4']
    elif dl == 'whisper': f += ['highpass=f=120', 'lowpass=f=6000', 'volume=0.8', 'acompressor=threshold=-26dB:ratio=3']
    if fx == 'radio': f += ['highpass=f=300', 'lowpass=f=3400', 'acompressor=threshold=-18dB:ratio=5', 'volume=1.7', 'asoftclip=type=atan:threshold=0.8']
    elif fx == 'intercom': f += ['highpass=f=450', 'lowpass=f=2800', 'acrusher=bits=10:mode=log:aa=1', 'acompressor=threshold=-18dB:ratio=6', 'volume=1.8']
    elif fx == 'room': f += ['highpass=f=90', 'bass=g=3:f=140', 'aecho=0.8:0.35:22|37:0.18|0.12', 'acompressor=threshold=-20dB:ratio=3']
    elif fx == 'close': f += ['highpass=f=70', 'bass=g=4:f=120', 'acompressor=threshold=-24dB:ratio=3']
    elif fx == 'cold': f += ['highpass=f=60', 'bass=g=5:f=110', 'aecho=0.8:0.5:60|120:0.15|0.08', 'acompressor=threshold=-22dB:ratio=3']
    f += ['alimiter=limit=0.95']
    return ','.join(f)
lines = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lines.json')))
done = set(open(DONE).read().split()) if os.path.exists(DONE) else set()
n = 0; t0 = time.time()
for l in lines:
    who = l['who']
    if who in SKIP or who not in CAST: continue
    if ONLY and who not in ONLY: continue
    dst = os.path.join(out, l['id'] + '.mp3')
    if l['id'] in done and os.path.exists(dst): continue
    if not FORCE and os.path.exists(dst) and l['id'] in done: continue
    if n >= MAXN: break
    v, sp, lang, fx, pitch = CAST[who]
    dl = delivery(who, l['text'])
    text = speakable(l['text'])
    samples, sr = k.create(text, voice=v, speed=sp * SPEED[dl], lang=lang)
    tmp = os.path.join(TMP, l['id'] + '.wav'); sf.write(tmp, samples, sr)
    tmp2 = tmp[:-4] + '_fx.wav'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-af', chain(fx, dl, pitch + PITCH[dl]), '-ac', '1', '-ar', '24000', tmp2], check=True)
    y, sr2 = sf.read(tmp2); act = y[np.abs(y) > 0.02]   # level of the speech itself, not the gaps
    rms = 20 * np.log10(np.sqrt(np.mean(act ** 2)) + 1e-9) if len(act) else -40
    target = {'shout': -14.0, 'raised': -16.0, 'normal': -17.5, 'ask': -17.5, 'whisper': -21.0, 'cold': -18.0}[dl] + (1.0 if fx in ('radio', 'intercom') else 0)
    y = y * 10 ** ((target - rms) / 20); y = np.tanh(y * 1.1) / 1.1   # gentle ceiling instead of hard clipping
    sf.write(tmp2, y, sr2)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp2, '-ac', '1', '-ar', '24000', '-b:a', '48k', dst], check=True)
    os.remove(tmp); os.remove(tmp2)
    with open(DONE, 'a') as fh: fh.write(l['id'] + '\n')
    n += 1
    print(n, who, dl, text[:50], flush=True)
print('BATCH', n, 'in', round(time.time() - t0), 's'); print('ALL DONE' if n < MAXN else 'MORE')
