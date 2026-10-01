# Tiny orchestral sequencer: write notes in beats, render through FluidSynth + a General MIDI soundfont, loop seamlessly.
import numpy as np, fluidsynth, subprocess, os, random
SF = os.environ.get('SF2', os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../tools/_build/gu.sf2'))   # GeneralUser GS: github.com/mrbumpy409/GeneralUser-GS
SR = 44100
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
def P(s):   # 'D3', 'Bb2', 'F#4' -> midi
    if isinstance(s, int): return s
    n = NOTE[s[0]]; i = 1
    while i < len(s) and s[i] in '#b': n += 1 if s[i] == '#' else -1; i += 1
    return n + 12 * (int(s[i:]) + 1)
# GM programs we use (bank, program)
PATCH = dict(strings=(0, 48), slowstr=(0, 49), tremolo=(0, 44), pizz=(0, 45), violin=(0, 40), viola=(0, 41), cello=(0, 42), bass=(0, 43), synstr=(0, 50), orchpad=(8, 48),
             horns=(0, 60), brass=(0, 61), brass2=(8, 61), trombone=(0, 57), tuba=(0, 58), trumpet=(0, 56), choir=(0, 52), oohs=(0, 53), timp=(0, 47), taiko=(0, 116),
             bdrum=(8, 116), revcym=(0, 119), piano=(0, 0), epiano=(0, 4), celeste=(0, 8), glock=(0, 9), vibes=(0, 11), harp=(0, 46), flute=(0, 73), piccolo=(0, 72),
             clarinet=(0, 71), bassoon=(0, 70), oboe=(0, 68), nylon=(0, 24), ubass=(0, 32), fbass=(0, 33), synbass=(0, 38), synbass2=(0, 39), acid=(8, 38), pad=(0, 89),
             atmos=(0, 99), soundtrack=(0, 97), sweep=(0, 95), halo=(0, 94), polysynth=(0, 90), sawlead=(0, 81), bells=(0, 14), woodblk=(0, 115), organ=(0, 16),
             kit_orch=(128, 48), kit_std=(128, 0), kit_brush=(128, 40), kit_909=(128, 25), kit_power=(128, 16))
class Song:
    def __init__(self, bpm, beats, name):
        self.bpm, self.beats, self.name, self.tracks = bpm, beats, name, []
    def track(self, patch, vol=100, rev=40, pan=64, chorus=0):
        t = dict(patch=PATCH[patch], vol=vol, rev=rev, pan=pan, chorus=chorus, ev=[], cc=[], drum=PATCH[patch][0] == 128)
        self.tracks.append(t); return t
def n(t, beat, dur, pitch, vel=90):
    if isinstance(pitch, (list, tuple)):
        for p in pitch: n(t, beat, dur, p, vel)
        return
    t['ev'].append((beat, dur, P(pitch), int(max(1, min(127, vel)))))
def cc(t, beat, num, val): t['cc'].append((beat, num, int(max(0, min(127, val)))))
def ramp(t, b0, b1, v0, v1, num=11, steps=16):
    for i in range(steps + 1): cc(t, b0 + (b1 - b0) * i / steps, num, v0 + (v1 - v0) * i / steps)
def render(song, gain=0.35, tail_beats=0):
    fs = fluidsynth.Synth(samplerate=SR, gain=gain)
    sf = fs.sfload(SF)
    try: fs.set_reverb(0.82, 0.25, 0.9, 0.75)
    except Exception: pass
    try: fs.set_chorus(3, 1.2, 0.3, 6.0, 0)
    except Exception: pass
    spb = 60.0 / song.bpm; L = song.beats * spb
    evs = []
    chan = 0
    for t in song.tracks:
        c = 9 if t['drum'] else chan
        if not t['drum']: chan += 1; chan += 1 if chan == 9 else 0
        t['c'] = c
        fs.program_select(c, sf, t['patch'][0], t['patch'][1])
        fs.cc(c, 7, t['vol']); fs.cc(c, 91, t['rev']); fs.cc(c, 10, t['pan']); fs.cc(c, 93, t['chorus']); fs.cc(c, 11, 127)
        for rep in range(2):
            off = rep * song.beats
            for (b, d, p, v) in t['ev']:
                evs.append(((b + off) * spb, 1, c, p, v)); evs.append(((b + off + d) * spb - 0.002, 0, c, p, 0))
            for (b, num, val) in t['cc']: evs.append(((b + off) * spb, 2, c, num, val))
    evs.sort(key=lambda e: (e[0], e[1]))
    total = int(2 * L * SR); out = []; pos = 0
    for (tm, kind, c, a, b) in evs:
        f = min(total, int(tm * SR))
        if f > pos: out.append(np.array(fs.get_samples(f - pos), dtype=np.int16)); pos = f
        if kind == 1: fs.noteon(c, a, b)
        elif kind == 0: fs.noteoff(c, a)
        else: fs.cc(c, a, b)
    if total > pos: out.append(np.array(fs.get_samples(total - pos), dtype=np.int16))
    fs.delete()
    x = np.concatenate(out).astype(np.float32).reshape(-1, 2) / 32768.0
    seg = x[int(L * SR): int(2 * L * SR)]   # the second pass: it already carries the reverb tail of the first, so it loops cleanly
    return seg
def save(song, x, outdir, kbps=96):
    os.makedirs(outdir, exist_ok=True)
    pk = np.max(np.abs(x)) or 1; x = x / pk * 0.89
    wav = f'/tmp/claude-0/{song.name}.wav'
    import wave
    with wave.open(wav, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
    mp3 = os.path.join(outdir, song.name + '.mp3')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af', 'loudnorm=I=-17:TP=-1.5:LRA=11', '-ar', '44100', '-b:a', f'{kbps}k', mp3], check=True)
    import json
    mf = os.path.join(outdir, 'manifest.json'); m = json.load(open(mf)) if os.path.exists(mf) else {}
    m[song.name] = round(song.beats * 60.0 / song.bpm, 4); json.dump(m, open(mf, 'w'), indent=0, sort_keys=True)
    return mp3, len(x) / SR
# ---------- helpers for writing parts ----------
def chord(root, kind='m'):
    r = P(root); iv = {'m': [0, 3, 7], 'M': [0, 4, 7], 'sus': [0, 5, 7], '5': [0, 7], 'm7': [0, 3, 7, 10], 'dim': [0, 3, 6], 'add9': [0, 4, 7, 14], 'madd9': [0, 3, 7, 14]}[kind]
    return [r + i for i in iv]
def hum(v, amt=8): return v + random.randint(-amt, amt)
