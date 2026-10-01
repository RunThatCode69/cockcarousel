# Generates fps/voices/<id>.mp3 for every radio line, with Kokoro (Apache-2.0, runs locally) + an ffmpeg radio filter.
# usage: python3 gen.py <kokoro dir> <out dir>
import json, sys, os, subprocess, soundfile as sf
from kokoro_onnx import Kokoro
kdir, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
k = Kokoro(os.path.join(kdir, 'kokoro-v1.0.int8.onnx'), os.path.join(kdir, 'voices-v1.0.bin'))
# voice, speed, language, radio (True = comms filter)
CAST = {
  'PRICK':    ('bm_george', 0.92, 'en-gb', True),
  'MACMILLI': ('bm_lewis', 0.88, 'en-gb', True),
  'SARGE':    ('bm_daniel', 1.12, 'en-gb', False),
  'JACKOFF':  ('am_onyx', 0.82, 'en-us', False),
  'PILOT':    ('am_michael', 1.12, 'en-us', True),
  'SOUP':     ('bm_fable', 1.08, 'en-gb', True),
  'GAS':      ('am_liam', 1.05, 'en-us', True),
  'GROPES':   ('am_eric', 1.0, 'en-us', True),
  'TV OP':    ('am_echo', 1.0, 'en-us', True),
  'YOU':      ('am_adam', 1.05, 'en-us', False),
  'VAS':      ('am_fenrir', 0.98, 'en-us', True),
  'JIGGLES':  ('am_puck', 1.08, 'en-us', True),
  'DOOLEY':   ('am_liam', 1.1, 'en-us', True),
  'RAMIREZ':  ('am_eric', 1.08, 'en-us', True),
  'PECKER':   ('am_santa', 1.0, 'en-us', True),
  'SACKMAN':  ('am_onyx', 0.95, 'en-us', True),
  'CHUCK':    ('am_echo', 1.0, 'en-us', True),
  'GRINDER':  ('am_puck', 1.1, 'en-us', True),
  'OVERLORD': ('am_michael', 1.0, 'en-us', True),
  'GRANOLA':  ('am_liam', 1.08, 'en-us', True),
  'HOG':      ('am_eric', 1.1, 'en-us', True),
}
lines = json.load(open(os.path.join(os.path.dirname(__file__), 'lines.json')))
for i, l in enumerate(lines):
    dst = os.path.join(out, l['id'] + '.mp3')
    if os.path.exists(dst): continue
    v, sp, lang, radio = CAST.get(l['who'], ('am_adam', 1.0, 'en-us', True))
    text = l['text'].replace('...', ', ').replace('—', ', ')
    if not any(c.isalpha() for c in text): text = 'Hmm.'
    samples, sr = k.create(text, voice=v, speed=sp, lang=lang)
    tmp = os.path.join(os.environ.get('VOICE_TMP', '/tmp'), os.path.basename(dst) + '.wav'); sf.write(tmp, samples, sr)
    af = 'highpass=f=280,lowpass=f=3600,acompressor=threshold=-18dB:ratio=4,volume=1.6' if radio else 'highpass=f=80,acompressor=threshold=-20dB:ratio=3'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-af', af, '-ac', '1', '-ar', '24000', '-b:a', '40k', dst], check=True)
    os.remove(tmp); print(i, l['who'], l['text'][:40], flush=True)
print('ALL DONE')
