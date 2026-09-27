import { rand } from './art2d.js';
// ---------- Sound: Web Audio only, but with a proper mix bus, noise, music and ambience ----------
// iOS notes: (1) audioSession must be set BEFORE the context exists; (2) on older iOS the ringer switch mutes Web Audio
// unless an HTML <audio> element is playing, so we loop a silent WAV through one on the first touch; (3) a silent buffer unlocks the context.
let actx = null, muted = false, unlocked = false, master = null, sfxBus = null, musBus = null, ambBus = null, noiseBuf = null, silentEl = null;
try { muted = localStorage.getItem('mw_muted') === '1'; } catch (e) {}
function silentWavURL() {
  const n = 4410, b = new ArrayBuffer(44 + n * 2), v = new DataView(b), w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 44100, true); v.setUint32(28, 88200, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
  return URL.createObjectURL(new Blob([b], { type: 'audio/wav' }));
}
function audio() {
  if (!actx) {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    if (actx) {
      const comp = actx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(actx.destination);
      master = actx.createGain(); master.gain.value = muted ? 0 : 1; master.connect(comp);
      sfxBus = actx.createGain(); sfxBus.gain.value = 1.4; sfxBus.connect(master);
      musBus = actx.createGain(); musBus.gain.value = 0.55; musBus.connect(master);
      ambBus = actx.createGain(); ambBus.gain.value = 0.7; ambBus.connect(master);
      noiseBuf = actx.createBuffer(1, actx.sampleRate * 2, actx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
  }
  if (!silentEl) { try { silentEl = new Audio(silentWavURL()); silentEl.loop = true; silentEl.setAttribute('playsinline', ''); silentEl.volume = 0.01; const p = silentEl.play(); if (p && p.catch) p.catch(() => { silentEl = null; }); } catch (e) { silentEl = null; } }
  if (actx && actx.state !== 'running') { try { actx.resume(); } catch (e) {} }
  if (actx && !unlocked) {
    try { const b = actx.createBuffer(1, 1, 22050), src = actx.createBufferSource(); src.buffer = b; src.connect(actx.destination); src.start(0); unlocked = true; } catch (e) {}
  }
  return actx;
}
['touchend', 'touchstart', 'pointerdown', 'keydown', 'click'].forEach(ev => addEventListener(ev, audio, { passive: true }));
document.addEventListener('visibilitychange', () => { if (!actx) return; if (document.hidden) actx.suspend(); else actx.resume(); });
function setMuted(m) { muted = m; try { localStorage.setItem('mw_muted', m ? '1' : '0'); } catch (e) {} if (master) master.gain.setTargetAtTime(m ? 0 : 1, actx.currentTime, 0.05); }
const live = () => actx && actx.state === 'running';
// absolute-time oscillator note on a bus
function note(f1, f2, at, d, type, vol, bus, attack = 0.005) {
  const a = actx; if (!a) return;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.connect(g); g.connect(bus || sfxBus);
  o.frequency.setValueAtTime(f1, at); if (f2 !== f1) o.frequency.exponentialRampToValueAtTime(Math.max(1, f2), at + d);
  g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + attack); g.gain.exponentialRampToValueAtTime(0.0001, at + d);
  o.start(at); o.stop(at + d + 0.03);
}
function tone(f1, f2, d, type, vol, when) { const a = audio(); if (!a || !live()) return; note(f1, f2, a.currentTime + (when || 0), d, type, vol); }
// filtered white noise: the thing that makes guns and explosions sound like guns and explosions
function hiss(d, vol, when = 0, ftype = 'lowpass', f1 = 2000, f2 = 300, q = 0.8, bus) {
  const a = audio(); if (!a || !live()) return;
  const at = a.currentTime + when, s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = noiseBuf; s.playbackRate.value = rand(0.8, 1.2); f.type = ftype; f.Q.value = q;
  f.frequency.setValueAtTime(f1, at); f.frequency.exponentialRampToValueAtTime(Math.max(20, f2), at + d);
  g.gain.setValueAtTime(vol, at); g.gain.exponentialRampToValueAtTime(0.0001, at + d);
  s.connect(f); f.connect(g); g.connect(bus || sfxBus); s.start(at, rand(0, 1.5)); s.stop(at + d + 0.05);
}
function noise(d, vol, when, f = 800) { hiss(d, vol, when || 0, 'bandpass', f * 1.5, f * 0.4, 1.2); }
function sfx(n) {
  switch (n) {
    case 'shoot': hiss(0.16, 0.5, 0, 'lowpass', 5000, 400); tone(160, 45, 0.18, 'sine', 0.5); tone(700, 200, 0.07, 'square', 0.05); hiss(0.08, 0.15, 0.03, 'highpass', 3000, 6000, 0.5); break;   // crack + thump + a wet tail
    case 'pump': tone(150, 520, 0.16, 'sine', 0.2); tone(520, 120, 0.3, 'sine', 0.18, 0.17); hiss(0.05, 0.2, 0.3, 'highpass', 3000, 5000); break;
    case 'click': hiss(0.03, 0.3, 0, 'highpass', 4000, 6000, 2); tone(2400, 1800, 0.03, 'square', 0.05); break;
    case 'magout': hiss(0.05, 0.3, 0, 'bandpass', 2500, 1200, 3); tone(300, 90, 0.12, 'square', 0.06); tone(90, 40, 0.2, 'sine', 0.2, 0.05); break;
    case 'thud': tone(110, 40, 0.18, 'sine', 0.35); hiss(0.08, 0.15, 0, 'lowpass', 600, 200); break;
    case 'magin': tone(200, 700, 0.12, 'sine', 0.2); hiss(0.04, 0.35, 0.12, 'bandpass', 3000, 2000, 4); tone(1500, 900, 0.04, 'square', 0.06, 0.12); break;
    case 'butt': tone(120, 40, 0.2, 'sine', 0.5); hiss(0.12, 0.3, 0, 'lowpass', 1200, 200); tone(400, 90, 0.1, 'square', 0.06); break;
    case 'hit': hiss(0.06, 0.25, 0, 'bandpass', 1800, 900, 2); tone(300, 120, 0.1, 'triangle', 0.12); break;
    case 'hitmark': tone(2600, 2600, 0.035, 'square', 0.05); break;
    case 'splat': hiss(0.12, 0.25, 0, 'lowpass', 1400, 200); tone(rand(220, 340), 60, 0.14, 'sine', 0.15); break;
    case 'kill': tone(500, 1000, 0.12, 'square', 0.06); tone(1000, 250, 0.25, 'sine', 0.1, 0.1); break;
    case 'hurt': tone(240, 70, 0.3, 'sawtooth', 0.1); hiss(0.2, 0.2, 0, 'lowpass', 900, 150); break;
    case 'loot': tone(880, 1400, 0.1, 'triangle', 0.14); tone(1400, 1800, 0.1, 'triangle', 0.12, 0.1); break;
    case 'streak': [523, 659, 784, 1047].forEach((f, i) => tone(f, f * 1.01, 0.18, 'square', 0.07, i * 0.08)); break;
    case 'bee': tone(rand(300, 360), rand(280, 340), 0.25, 'sawtooth', 0.04); break;
    case 'sting': tone(1500, 700, 0.08, 'square', 0.06); hiss(0.05, 0.15, 0, 'highpass', 4000, 6000); break;
    case 'snap': hiss(0.05, 0.4, 0, 'highpass', 3000, 5000, 1); tone(300, 60, 0.3, 'sawtooth', 0.08, 0.05); break;
    case 'fwip': tone(900, 300, 0.14, 'sine', 0.12); hiss(0.1, 0.15, 0, 'bandpass', 2500, 800, 2); break;
    case 'wrap': tone(200, 900, 0.35, 'sine', 0.14); tone(900, 200, 0.35, 'sine', 0.1, 0.35); break;
    case 'sizzle': hiss(0.5, 0.25, 0, 'highpass', 3000, 5000, 0.7); break;
    case 'shiver': for (let i = 0; i < 6; i++) tone(700 + i * 40, 650, 0.05, 'square', 0.04, i * 0.06); break;
    case 'boom': hiss(1.4, 0.9, 0, 'lowpass', 3000, 60, 0.7); tone(90, 25, 1.2, 'sine', 0.8); tone(60, 30, 0.8, 'sawtooth', 0.12); break;
    case 'nade': hiss(0.9, 0.8, 0, 'lowpass', 4000, 80, 0.7); tone(110, 30, 0.8, 'sine', 0.7); break;
    case 'pin': tone(2200, 1800, 0.04, 'square', 0.06); hiss(0.04, 0.2, 0.05, 'highpass', 5000, 7000); break;
    case 'bounce': tone(420, 300, 0.05, 'sine', 0.15); break;
    case 'chop': hiss(0.09, 0.35, 0, 'lowpass', 500, 120, 1); tone(70, 55, 0.1, 'sine', 0.2); break;
    case 'step': hiss(0.06, 0.12, 0, 'lowpass', 900, 200, 1); break;
    case 'tick': tone(1800, 1400, 0.02, 'square', 0.03); hiss(0.1, 0.05, 0.02, 'bandpass', 2000, 2500, 2); break;
    case 'drop': tone(900, 200, 0.5, 'sine', 0.1); hiss(0.4, 0.4, 0.5, 'lowpass', 1200, 80); break;
    case 'ultra': for (let i = 0; i < 4; i++) tone(1200, 1800, 0.1, 'sine', 0.07, i * 0.15); break;
    case 'win': [523, 659, 784, 1047].forEach((f, i) => tone(f, f * 1.02, 0.28, 'triangle', 0.14, i * 0.13)); tone(200, 60, 0.6, 'sine', 0.2, 0.55); break;
    case 'die': tone(400, 50, 1.4, 'sawtooth', 0.12); tone(200, 30, 1.4, 'sine', 0.15); break;
    case 'slide': hiss(0.6, 0.3, 0, 'bandpass', 800, 300, 1); break;
    case 'boss': tone(70, 40, 0.6, 'sawtooth', 0.15); tone(140, 80, 0.6, 'square', 0.06); hiss(0.4, 0.2, 0, 'lowpass', 400, 80); break;
    case 'type': tone(2000, 1500, 0.015, 'square', 0.03); break;
    case 'select': tone(700, 1100, 0.08, 'square', 0.08); break;
    case 'slowmo': tone(800, 80, 1.5, 'sine', 0.15); hiss(1.5, 0.2, 0, 'lowpass', 2000, 100); break;
    case 'ads': hiss(0.08, 0.15, 0, 'bandpass', 1500, 900, 2); break;
    case 'xp': tone(1320, 1320, 0.05, 'triangle', 0.06); tone(1760, 1760, 0.08, 'triangle', 0.06, 0.05); break;
  }
}

// ---------- music: a tiny look-ahead sequencer. Each song is a function(step, time). ----------
let music = null;
function playMusic(name) { if (music && music.name === name) return; music = name ? { name, step: 0, next: 0 } : null; }
const MN = n => 440 * Math.pow(2, (n - 69) / 12);   // midi → Hz
const kick = at => { note(130, 40, at, 0.22, 'sine', 0.55, musBus); };
const snare = (at, v = 0.3) => { const a = actx, s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = 1200; g.gain.setValueAtTime(v, at); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.14); s.connect(f); f.connect(g); g.connect(musBus); s.start(at, Math.random()); s.stop(at + 0.16); };
const hat = (at, v = 0.08) => { const a = actx, s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = 7000; g.gain.setValueAtTime(v, at); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.04); s.connect(f); f.connect(g); g.connect(musBus); s.start(at, Math.random()); s.stop(at + 0.06); };
const pad = (notes, at, d, v = 0.05) => { for (const m of notes) { note(MN(m), MN(m), at, d, 'sawtooth', v, musBus, d * 0.3); note(MN(m) * 1.004, MN(m) * 1.004, at, d, 'triangle', v, musBus, d * 0.3); } };
const SONGS = {
  // menu / briefing: a big dumb heroic march in D minor. Drums, strings, brass stabs.
  title: { dt: 0.2, fn(s, at) {
    const bar = (s >> 4) % 4, st = s % 16, ch = [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]][bar];
    if (st % 8 === 0) kick(at); if (st === 4 || st === 12) snare(at); if (bar === 3 && st >= 12) snare(at, 0.18);
    if (st === 0) { pad(ch.map(n => n + 12), at, 3.1, 0.035); note(MN(ch[0] - 12), MN(ch[0] - 12), at, 3.1, 'sawtooth', 0.09, musBus, 0.05); }
    if (st === 0 || st === 3 || st === 6) { note(MN(ch[2] + 12), MN(ch[2] + 12), at, 0.28, 'square', 0.05, musBus, 0.01); note(MN(ch[0] + 12), MN(ch[0] + 12), at, 0.28, 'triangle', 0.08, musBus, 0.01); }
    hat(at, st % 2 ? 0.03 : 0.06);
  } },
  // combat bed: low pulse + drone, tense but quiet so the gun is the star
  tense: { dt: 0.16, fn(s, at) {
    const st = s % 16, root = [38, 38, 41, 36][(s >> 4) % 4];
    if (st % 2 === 0) note(MN(root), MN(root), at, 0.14, 'sawtooth', 0.05, musBus, 0.005);
    if (st === 0) { kick(at); pad([root + 12, root + 15, root + 19], at, 2.5, 0.018); }
    if (st === 8) kick(at); if (st % 4 === 2) hat(at, 0.04);
  } },
  // the stealth level: night drone + crickets
  night: { dt: 0.25, fn(s, at) {
    const st = s % 16;
    if (st === 0) pad([38, 45, 50], at, 4.2, 0.02);
    if (Math.random() < 0.35) { const f = rand(4200, 5200); for (let i = 0; i < 3; i++) note(f, f, at + i * 0.045, 0.03, 'sine', 0.02, musBus); }
  } },
  // the clinic: elevator muzak. bossa-ish, soft, relentlessly calm
  muzak: { dt: 0.18, fn(s, at) {
    const bar = (s >> 4) % 4, st = s % 16, ch = [[60, 64, 67, 71], [57, 60, 64, 67], [62, 65, 69, 72], [55, 59, 62, 65]][bar];
    if (st === 0 || st === 6 || st === 10) for (const m of ch) note(MN(m), MN(m), at, 0.5, 'sine', 0.035, musBus, 0.01);
    if (st === 0 || st === 7) note(MN(ch[0] - 24), MN(ch[0] - 24), at, 0.4, 'sine', 0.14, musBus);
    if (st === 10) note(MN(ch[2] - 24), MN(ch[2] - 24), at, 0.3, 'sine', 0.1, musBus);
    if (st % 2 === 0) hat(at, 0.025); if (st === 4 || st === 12) note(MN(ch[3] + 12), MN(ch[3] + 12), at, 0.6, 'triangle', 0.03, musBus, 0.02);
  } },
  // the bridge: faster, drums forward
  chase: { dt: 0.13, fn(s, at) {
    const st = s % 16, root = [38, 36, 34, 36][(s >> 4) % 4];
    if (st % 4 === 0) kick(at); if (st === 4 || st === 12) snare(at, 0.25); hat(at, st % 2 ? 0.03 : 0.06);
    if (st % 2 === 0) note(MN(root), MN(root), at, 0.12, 'sawtooth', 0.07, musBus);
    if (st === 0) pad([root + 24, root + 27, root + 31], at, 2, 0.02);
  } },
};
// continuous ambience per level: looping noise through a filter with a slow wobble
let amb = null;
function setAmbience(kind) {
  if (!actx) return;
  if (amb) { try { amb.g.gain.setTargetAtTime(0.0001, actx.currentTime, 0.3); const old = amb; setTimeout(() => { try { old.s.stop(); old.l && old.l.stop(); } catch (e) {} }, 1500); } catch (e) {} amb = null; }
  if (!kind) return;
  const cfg = { wind: ['bandpass', 500, 0.6, 0.12], sea: ['lowpass', 380, 0.7, 0.22], room: ['lowpass', 220, 0.5, 0.06], fire: ['highpass', 2500, 0.5, 0.05] }[kind];
  const a = actx, s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), l = a.createOscillator(), lg = a.createGain();
  s.buffer = noiseBuf; s.loop = true; f.type = cfg[0]; f.frequency.value = cfg[1]; f.Q.value = cfg[2];
  l.frequency.value = 0.13; lg.gain.value = cfg[1] * 0.5; l.connect(lg); lg.connect(f.frequency);
  g.gain.setValueAtTime(0.0001, a.currentTime); g.gain.setTargetAtTime(cfg[3], a.currentTime, 0.8);
  s.connect(f); f.connect(g); g.connect(ambBus); s.start(); l.start();
  amb = { s, g, l, kind };
}
function audioTick() {
  if (!live() || !music) return;
  const S = SONGS[music.name]; if (!S) return;
  if (!music.next || music.next < actx.currentTime - 0.5) music.next = actx.currentTime + 0.05;
  while (music.next < actx.currentTime + 0.25) { S.fn(music.step, music.next); music.next += S.dt; music.step++; }
}
// sad piano for the credits: a slow minor arpeggio, scheduled a bar at a time
const PIANO = [[0, 220], [0.5, 261.6], [1, 329.6], [1.5, 261.6], [2, 196], [2.5, 246.9], [3, 293.7], [3.5, 246.9],
               [4, 174.6], [4.5, 220], [5, 261.6], [5.5, 220], [6, 164.8], [6.5, 207.7], [7, 246.9], [7.5, 329.6]];
function pianoBar() { if (!live()) return; const t0 = actx.currentTime; for (const [at, f] of PIANO) { note(f, f * 0.995, t0 + at * 0.55, 1.4, 'triangle', 0.12, musBus); note(f * 2, f * 1.99, t0 + at * 0.55, 0.6, 'sine', 0.04, musBus); } }

export { audio, audioTick, hiss, noise, note, pianoBar, playMusic, setAmbience, setMuted, sfx, silentWavURL, tone };
export const A = { get ctx() { return actx; }, get muted() { return muted; } };
