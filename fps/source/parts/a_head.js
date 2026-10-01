// ================================================================
//  CUM OF DUTY: MODERN WHARFARE — v3. Real 3D (three.js, bundled; nothing loads from a CDN).
//  Game logic, missions, HUD and sound carry over from v2; the renderer, models and gun are new.
// ================================================================
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as A2 from './art2d.js';
import { W, H, FONT, INK, SKIN, SKIN2, HEAD, HEAD2, PINK, YEL, PURP, CYAN, CUM, CUM2, TAU, rand, clamp, lerp, wrapA, pickOne,
  E, fs, poly, rr, heart, txt, txtWrap, mkCanvas, bake, setCtx, TEX, FT, bakeTextures, drawDick, crabArt, condomArt, bossArt, pubeArt } from './art2d.js';
import { audio, audioTick, hiss, noise, note, pianoBar, playMusic, setAmbience, setMuted, sfx, tone, playCue, cueVolume, preloadCues, A as AUD } from './audio.js';
import * as MD from './models.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const wrap = document.getElementById('wrap');
const c3 = document.getElementById('c3'), cv = document.getElementById('c');
const hctx = cv.getContext('2d');
let ctx = hctx; setCtx(hctx);
let scale = 1, dpr = 1, portrait = false;
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
let resize = () => {};
let t = 0;
const actxLive = () => AUD.ctx && AUD.ctx.state === 'running';
let muted = AUD.muted;
