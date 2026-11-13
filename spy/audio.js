/* Albion House sound: everything synthesised with Web Audio, nothing downloaded.
   Nothing plays until the first tap (iOS rule). Mute is remembered in localStorage. */
(function () {
  "use strict";
  try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
  const KEY = "albion-muted";
  let ctx = null, master = null, out = null, amb = null, mus = null, rain = null, ringing = null, duckM = null, duckA = null, an = null;
  let tr = 0, bedDay = -1, bed = null, rainBase = 0.05, duckV = false, duckC = false;
  let muted = false;
  try { muted = localStorage.getItem(KEY) === "1"; } catch (e) {}

  function noiseBuffer(sec) {
    const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function unlock() {
    if (ctx) { if (ctx.state !== "running") { try { ctx.resume(); } catch (e) {} } return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC(); out = ctx.createGain(); out.gain.value = muted ? 0 : 0.8; out.connect(ctx.destination); an = ctx.createAnalyser(); an.fftSize = 2048; out.connect(an);
    // three buses so each slider in Settings has its own volume: effects (master), ambience, music
    master = ctx.createGain(); amb = ctx.createGain(); mus = ctx.createGain(); duckM = ctx.createGain(); duckA = ctx.createGain();
    master.connect(out); mus.connect(duckM).connect(out); amb.connect(duckA).connect(out); levels();
    // soft rain bed: looped noise through a band-pass, gently swelling
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(3); src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1400; bp.Q.value = 0.4;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 4200;
    const g = ctx.createGain(); g.gain.value = 0.05;
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 0.015; lfo.connect(lg).connect(g.gain); lfo.start();
    src.connect(bp).connect(lp).connect(g).connect(amb); src.start(); rain = g;
    if (want) setMusic(want);
    if (bedDay >= 0) { const d = bedDay; bedDay = -1; ambience(d); }
  }
  function levels() { if (!ctx || !window.PREFS) return; const t = ctx.currentTime; master.gain.setTargetAtTime(PREFS.vol("fx"), t, 0.05); amb.gain.setTargetAtTime(PREFS.vol("amb"), t, 0.05); mus.gain.setTargetAtTime(PREFS.vol("music"), t, 0.05); }
  document.addEventListener("prefs", levels);
  // coming back from another app: iOS suspends the context, so wake it on return and on the next tap
  document.addEventListener("visibilitychange", function () { if (!document.hidden && ctx && ctx.state !== "running") { try { ctx.resume(); } catch (e) {} } });
  window.addEventListener("pageshow", function () { if (ctx && ctx.state !== "running") { try { ctx.resume(); } catch (e) {} } });
  function env(node, t, a, peak, dec) { node.gain.setValueAtTime(0.0001, t); node.gain.exponentialRampToValueAtTime(peak, t + a); node.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
  function bell(freq, t, dur, vol) {
    // a struck bell: a few inharmonic partials decaying at different rates
    [[1, 1], [2.0, 0.5], [2.76, 0.35], [5.4, 0.15], [0.5, 0.45]].forEach(function (p) {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = freq * p[0];
      env(g, t, 0.01, vol * p[1], dur * (p[0] > 2 ? 0.45 : 1)); o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.1);
    });
  }

  // ---------- music: original, synthesised on the fly. A slow smoky jazz loop for the desk, tense strings for operations ----------
  let mode = null, want = null, mbus = null, mtimer = null, nextT = 0, step = 0;
  const mtof = function (m) { return 440 * Math.pow(2, (m + tr - 69) / 12); };
  // ii-V-I-VI in C, voiced like a tired piano at 2am: [bass root, chord tones]
  const JAZZ = [[38, [53, 57, 60, 64]], [43, [53, 57, 59, 64]], [36, [52, 55, 59, 62]], [45, [55, 58, 61, 64]]];
  const WALK = [[38, 41, 45, 44], [43, 47, 50, 49], [36, 40, 43, 46], [45, 44, 43, 42]];
  const TEMPO = { jazz: 62, tense: 96 };
  function mnote(freq, t, dur, vol, type, cut) {
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = type || "sine"; o.frequency.value = freq;
    f.type = "lowpass"; f.frequency.value = cut || 1800; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f).connect(g).connect(mbus); o.start(t); o.stop(t + dur + 0.05);
  }
  function brush(t, vol) { const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noiseBuffer(0.3); f.type = "bandpass"; f.frequency.value = 5200; f.Q.value = 0.7; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26); s.connect(f).connect(g).connect(mbus); s.start(t); }
  function schedule() {
    if (!ctx || !mode) return;
    const beat = 60 / TEMPO[mode];
    while (nextT < ctx.currentTime + 0.6) {
      const bar = Math.floor(step / 4) % 4, b = step % 4, t = nextT;
      if (mode === "jazz") {
        // swung walking bass, a soft electric-piano chord on 1 and the "and" of 2, brushes on 2 and 4
        mnote(mtof(WALK[bar][b] - 12 + 12), t, beat * 0.95, 0.11, "triangle", 600);
        if (b === 0 || (b === 1 && step % 8 === 1)) JAZZ[bar][1].forEach(function (m, i) { mnote(mtof(m), t + (b === 1 ? beat * 0.66 : 0) + i * 0.012, beat * (b === 0 ? 2.6 : 1.2), 0.028, "sine", 2400); mnote(mtof(m + 12), t + i * 0.012, beat * 0.8, 0.006, "triangle", 3000); });
        if (b === 1 || b === 3) brush(t, 0.025); brush(t + beat * 0.66, 0.012);
        if (bar === 3 && b === 2 && Math.random() < 0.5) mnote(mtof(76 - Math.floor(Math.random() * 3) * 2), t, beat * 1.6, 0.02, "sine", 2000); // a lazy high note
      } else {
        // tense: a low string drone that shifts every two bars, a heartbeat pulse, and a nervous tremolo now and then
        if (b === 0 && bar % 2 === 0) [38, 45, bar === 2 ? 51 : 50].forEach(function (m) { [0, 4].forEach(function (dt) { const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = "sawtooth"; o.frequency.value = mtof(m); o.detune.value = dt - 2; f.type = "lowpass"; f.frequency.value = 520; const d = beat * 8; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.018, t + 1.2); g.gain.setValueAtTime(0.018, t + d - 1); g.gain.linearRampToValueAtTime(0.0001, t + d + 0.2); o.connect(f).connect(g).connect(mbus); o.start(t); o.stop(t + d + 0.3); }); });
        mnote(55, t, 0.25, b === 0 ? 0.12 : 0.06, "sine", 200);
        if (bar === 3 && b >= 2) for (let i = 0; i < 4; i++) mnote(mtof(74), t + i * beat / 4, beat / 5, 0.012, "sawtooth", 1800);
      }
      nextT += beat * (mode === "jazz" && b % 2 === 0 ? 1.08 : mode === "jazz" ? 0.92 : 1); step++;
    }
  }
  function setMusic(m) {
    want = m; if (!ctx || m === mode) return;
    const t = ctx.currentTime;
    if (mbus) { const old = mbus; old.gain.setTargetAtTime(0.0001, t, 0.4); setTimeout(function () { try { old.disconnect(); } catch (e) {} }, 2500); mbus = null; }
    mode = m; if (mtimer) { clearInterval(mtimer); mtimer = null; }
    if (!m) return;
    mbus = ctx.createGain(); mbus.gain.setValueAtTime(0.0001, t); mbus.gain.linearRampToValueAtTime(m === "jazz" ? 0.55 : 0.6, t + 2.5); mbus.connect(mus);
    nextT = t + 0.1; step = 0; schedule(); mtimer = setInterval(schedule, 200);
  }
  // ---------- ducking: music and ambience dip under voice lines and cutscenes ----------
  function applyDuck() {
    if (!ctx) return; const t = ctx.currentTime;
    duckM.gain.setTargetAtTime(duckC ? (duckV ? 0.12 : 0.25) : duckV ? 0.35 : 1, t, 0.12);
    duckA.gain.setTargetAtTime(duckV ? 0.6 : 1, t, 0.15);
  }
  // ---------- one ambience bed per day, all synthesised (no recordings), crossfaded when the day changes ----------
  const KEYS = { 1: 0, 2: -2, 3: 3, 4: -4, 5: 1, 6: -1 };
  function setDay(d) {
    d = d || 1; const k = KEYS[d] || 0;
    if (k !== tr) { tr = k; if (mode === "jazz" && ctx) { mode = null; setMusic("jazz"); } } // a new key each day, crossfaded
    ambience(d);
  }
  function noiseSrc(sec) { const s = ctx.createBufferSource(); s.buffer = noiseBuffer(sec || 4); s.loop = true; return s; }
  function band(src, type, f, q, vol, dest) { const fl = ctx.createBiquadFilter(), g = ctx.createGain(); fl.type = type; fl.frequency.value = f; fl.Q.value = q || 0.7; g.gain.value = vol; src.connect(fl).connect(g).connect(dest); return g; }
  function wobble(param, rate, depth) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = rate; g.gain.value = depth; o.connect(g).connect(param); o.start(); return o; }
  function blip(dest, f, t, dur, vol, type) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type || "sine"; o.frequency.value = f; env(g, t, 0.005, vol, dur); o.connect(g).connect(dest); o.start(t); o.stop(t + dur + 0.05); return o; }
  function burst(dest, f, q, t, a, hold, vol) { const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noiseBuffer(a + hold + 0.2); fl.type = "bandpass"; fl.frequency.value = f; fl.Q.value = q; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + a); g.gain.linearRampToValueAtTime(0.0001, t + a + hold); s.connect(fl).connect(g).connect(dest); s.start(t); }
  const BEDS = {
    1: { name: "rain on the window", rain: 0.05, build: function (o) { o.every(0.35, function (t) { if (Math.random() < 0.5) blip(o.g, 2500 + Math.random() * 2500, t, 0.03, 0.012 + Math.random() * 0.01); }); } },
    2: { name: "busy station", rain: 0, build: function (o) {
      const s = noiseSrc(); band(s, "lowpass", 180, 0.7, 0.10, o.g); const m = noiseSrc(); const mg = band(m, "bandpass", 520, 1.2, 0.05, o.g); o.add(wobble(mg.gain, 0.3, 0.02)); s.start(); m.start(); o.add(s); o.add(m);
      o.every(22, function (t) { [659.3, 523.3, 784].forEach(function (f, i) { blip(o.g, f, t + i * 0.5, 1.2, 0.02); }); });
      o.every(3, function (t) { if (Math.random() < 0.4) burst(o.g, 3000, 4, t, 0.01, 0.06, 0.02); }); } },
    3: { name: "quiet country night", rain: 0, build: function (o) {
      const w = noiseSrc(); const wg = band(w, "lowpass", 380, 0.7, 0.05, o.g); o.add(wobble(wg.gain, 0.05, 0.03)); w.start(); o.add(w);
      o.every(0.9, function (t) { if (Math.random() < 0.7) for (let i = 0; i < 3; i++) blip(o.g, 4600, t + i * 0.06, 0.035, 0.008); });
      o.every(17, function (t) { if (Math.random() < 0.6) { blip(o.g, 410, t, 0.35, 0.02, "triangle"); blip(o.g, 390, t + 0.55, 0.5, 0.018, "triangle"); } }); } },
    4: { name: "café murmur", rain: 0, build: function (o) {
      const m = noiseSrc(); const mg = band(m, "bandpass", 700, 0.9, 0.07, o.g); o.add(wobble(mg.gain, 0.45, 0.03)); const m2 = noiseSrc(); band(m2, "bandpass", 1300, 2, 0.02, o.g); m.start(); m2.start(); o.add(m); o.add(m2);
      o.every(2.5, function (t) { if (Math.random() < 0.35) { const f = 2400 + Math.random() * 1200; blip(o.g, f, t, 0.25, 0.012); blip(o.g, f * 1.51, t, 0.18, 0.006); } }); } },
    5: { name: "cold dawn river", rain: 0, build: function (o) {
      const w = noiseSrc(); const wg = band(w, "lowpass", 700, 0.8, 0.06, o.g); o.add(wobble(wg.gain, 1.7, 0.025)); const wi = noiseSrc(); const wig = band(wi, "bandpass", 300, 0.5, 0.04, o.g); o.add(wobble(wig.gain, 0.08, 0.03)); w.start(); wi.start(); o.add(w); o.add(wi);
      o.every(14, function (t) { if (Math.random() < 0.5) { const g0 = ctx.createOscillator(), gg = ctx.createGain(); g0.frequency.setValueAtTime(1300, t); g0.frequency.exponentialRampToValueAtTime(850, t + 0.4); env(gg, t, 0.02, 0.012, 0.4); g0.connect(gg).connect(o.g); g0.start(t); g0.stop(t + 0.5); } }); } },
    6: { name: "Westminster traffic", rain: 0.03, build: function (o) {
      const r = noiseSrc(); band(r, "lowpass", 140, 0.7, 0.11, o.g); r.start(); o.add(r);
      o.every(5, function (t) { if (Math.random() < 0.7) burst(o.g, 400 + Math.random() * 300, 0.8, t, 1.8, 2.2, 0.05); });
      o.every(31, function (t) { if (Math.random() < 0.5) { blip(o.g, 349, t, 0.5, 0.012, "sawtooth"); blip(o.g, 440, t, 0.5, 0.008, "sawtooth"); } }); } }
  };
  function ambience(d) {
    d = BEDS[d] ? d : 1; if (d === bedDay && bed) return; bedDay = d;
    if (!ctx) return; const t = ctx.currentTime, B = BEDS[d];
    if (bed) { const old = bed; old.g.gain.setTargetAtTime(0.0001, t, 1.0); setTimeout(function () { old.stop(); }, 5000); }
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(1, t + 3); g.connect(amb);
    const nodes = [], timers = [];
    const o = { name: B.name, g: g, add: function (n) { nodes.push(n); }, every: function (sec, fn) { timers.push(setInterval(function () { if (ctx && ctx.state === "running") fn(ctx.currentTime + 0.05); }, sec * 1000)); },
      stop: function () { timers.forEach(clearInterval); nodes.forEach(function (n) { try { n.stop(); } catch (e) {} }); try { g.disconnect(); } catch (e) {} } };
    B.build(o); bed = o; rainBase = B.rain; if (rain) rain.gain.setTargetAtTime(rainBase, t, 1.5);
  }
  const api = {
    unlock: unlock,
    music: setMusic,
    get musicMode() { return mode || want; },
    voice: function (id) { if (window.VOICE) VOICE.play(id); },
    get muted() { return muted; },
    setMuted: function (m) { muted = !!m; try { localStorage.setItem(KEY, muted ? "1" : "0"); } catch (e) {} if (out) out.gain.setTargetAtTime(muted ? 0 : 0.8, ctx.currentTime, 0.05); if (muted && window.VOICE && VOICE.hush) VOICE.hush(); },
    // Westminster-style quarter phrase, then a few deep strikes for the hour
    chime: function (strikes) {
      if (!ctx) return; const t0 = ctx.currentTime + 0.05, n = [329.6, 415.3, 370, 246.9];
      [0, 2, 1, 3].forEach(function (i, j) { bell(n[i], t0 + j * 0.62, 1.6, 0.09); });
      for (let s = 0; s < (strikes || 3); s++) bell(103.8, t0 + 3 + s * 1.5, 3.2, 0.16);
    },
    tick: function (count) {
      if (!ctx) return; const t0 = ctx.currentTime;
      for (let i = 0; i < (count || 4); i++) {
        const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "square"; o.frequency.value = i % 2 ? 1900 : 2300;
        env(g, t0 + i * 0.5, 0.002, 0.05, 0.03); o.connect(g).connect(master); o.start(t0 + i * 0.5); o.stop(t0 + i * 0.5 + 0.06);
      }
    },
    type: function () {
      if (!ctx) return; const t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noiseBuffer(0.04); f.type = "highpass"; f.frequency.value = 2500 + Math.random() * 1500; env(g, t, 0.001, 0.12, 0.03);
      s.connect(f).connect(g).connect(master); s.start(t);
    },
    tele: function () {
      if (!ctx) return; const t0 = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sawtooth"; o.frequency.value = 180;
        const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 900;
        g.gain.setValueAtTime(0.0001, t0 + i * 0.45); g.gain.linearRampToValueAtTime(0.06, t0 + i * 0.45 + 0.01); g.gain.setValueAtTime(0.06, t0 + i * 0.45 + 0.28); g.gain.linearRampToValueAtTime(0.0001, t0 + i * 0.45 + 0.3);
        o.connect(f).connect(g).connect(master); o.start(t0 + i * 0.45); o.stop(t0 + i * 0.45 + 0.32);
      }
    },
    // old British double ring: brr-brr, pause, repeated until stopped
    ring: function () {
      if (!ctx || ringing) return;
      const burst = function () {
        const t0 = ctx.currentTime;
        [0, 0.6].forEach(function (d) {
          [400, 450].forEach(function (fq) {
            const o = ctx.createOscillator(), g = ctx.createGain(), am = ctx.createOscillator(), ag = ctx.createGain();
            o.frequency.value = fq; am.frequency.value = 20; ag.gain.value = 0.03; am.connect(ag).connect(g.gain); g.gain.value = 0.03;
            o.connect(g).connect(master); o.start(t0 + d); am.start(t0 + d); o.stop(t0 + d + 0.4); am.stop(t0 + d + 0.4);
          });
        });
      };
      burst(); ringing = setInterval(burst, 3000);
    },
    stopRing: function () { if (ringing) { clearInterval(ringing); ringing = null; } },
    // cinematic cues
    bigben: function (strikes) { if (!ctx) return; const t0 = ctx.currentTime + 0.05; for (let s = 0; s < (strikes || 4); s++) bell(103.8, t0 + s * 1.6, 3.4, 0.2); },
    rainUp: function (on) { if (rain && ctx) rain.gain.setTargetAtTime(on ? 0.14 : rainBase, ctx.currentTime, 0.8); },
    day: function (d) { setDay(d); },
    voiceDuck: function (on) { duckV = !!on; applyDuck(); },
    cineDuck: function (on) { duckC = !!on; applyDuck(); },
    state: function () { return { ctx: ctx ? ctx.state : "none", day: bedDay, bed: bed ? bed.name : null, music: mode, key: tr, duckMusic: duckM ? +duckM.gain.value.toFixed(2) : null, duckAmb: duckA ? +duckA.gain.value.toFixed(2) : null, voiceDuck: duckV, cineDuck: duckC, rms: an ? (function () { const b = new Float32Array(an.fftSize); an.getFloatTimeDomainData(b); let q = 0; for (let i = 0; i < b.length; i++) q += b[i] * b[i]; return +Math.sqrt(q / b.length).toFixed(4); })() : 0 }; },
    engine: function (sec) {
      if (!ctx) return; const t = ctx.currentTime, d = sec || 3, o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(), am = ctx.createOscillator(), ag = ctx.createGain();
      o.type = "sawtooth"; o.frequency.setValueAtTime(48, t); o.frequency.linearRampToValueAtTime(62, t + d * 0.4); o.frequency.linearRampToValueAtTime(38, t + d);
      am.frequency.value = 11; ag.gain.value = 0.02; am.connect(ag).connect(g.gain); f.type = "lowpass"; f.frequency.value = 320;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.07, t + 0.6); g.gain.setValueAtTime(0.07, t + d - 0.8); g.gain.linearRampToValueAtTime(0.0001, t + d);
      o.connect(f).connect(g).connect(master); o.start(t); am.start(t); o.stop(t + d + 0.1); am.stop(t + d + 0.1);
    },
    horn: function () { if (!ctx) return; const t = ctx.currentTime; [73, 110].forEach(function (fq) { const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = "sawtooth"; o.frequency.value = fq; f.type = "lowpass"; f.frequency.value = 500; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.06, t + 0.3); g.gain.setValueAtTime(0.06, t + 1.8); g.gain.linearRampToValueAtTime(0.0001, t + 2.6); o.connect(f).connect(g).connect(master); o.start(t); o.stop(t + 2.7); }); },
    stinger: function () { if (!ctx) return; const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = "triangle"; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(40, t + 1.4); env(g, t, 0.01, 0.22, 1.6); o.connect(g).connect(master); o.start(t); o.stop(t + 1.8); },
    // a rubber stamp hitting a desk: a low thump and a short paper slap
    stamp: function () { if (!ctx) return; const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12); env(g, t, 0.003, 0.5, 0.18); o.connect(g).connect(master); o.start(t); o.stop(t + 0.3);
      const n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g2 = ctx.createGain(); n.buffer = noiseBuffer(0.12); f.type = "bandpass"; f.frequency.value = 1800; env(g2, t, 0.002, 0.25, 0.08); n.connect(f).connect(g2).connect(master); n.start(t); },
    // a sheet of paper sliding: filtered noise swept upward
    paper: function () { if (!ctx) return; const t = ctx.currentTime, n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); n.buffer = noiseBuffer(0.35); f.type = "bandpass"; f.Q.value = 0.8; f.frequency.setValueAtTime(900, t); f.frequency.linearRampToValueAtTime(3200, t + 0.3); env(g, t, 0.05, 0.09, 0.25); n.connect(f).connect(g).connect(master); n.start(t); },
    // radio crackle: bursts of band-limited noise
    crackle: function (sec) { if (!ctx) return; const t = ctx.currentTime, d = sec || 0.6, n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); n.buffer = noiseBuffer(d); f.type = "bandpass"; f.frequency.value = 2200; f.Q.value = 2; g.gain.setValueAtTime(0.0001, t);
      for (let i = 0; i < d * 20; i++) g.gain.setValueAtTime(Math.random() < 0.5 ? 0.0001 : 0.03 + Math.random() * 0.05, t + i / 20); g.gain.setValueAtTime(0.0001, t + d); n.connect(f).connect(g).connect(master); n.start(t); n.stop(t + d + 0.05); },
    // the red phone rumbling on the desk
    rumble: function () { if (!ctx) return; const t = ctx.currentTime, o = ctx.createOscillator(), am = ctx.createOscillator(), ag = ctx.createGain(), g = ctx.createGain(); o.frequency.value = 38; am.frequency.value = 9; ag.gain.value = 0.12; am.connect(ag).connect(g.gain); g.gain.value = 0.12; o.connect(g).connect(master); o.start(t); am.start(t); g.gain.setTargetAtTime(0.0001, t + 0.9, 0.1); o.stop(t + 1.3); am.stop(t + 1.3); },
    // a beat of silence before a reveal: dip music and rain
    duck: function (sec) { if (!ctx) return; const t = ctx.currentTime; [mus, amb].forEach(function (b) { b.gain.cancelScheduledValues(t); b.gain.setTargetAtTime(0.0001, t, 0.04); }); setTimeout(levels, (sec || 0.8) * 1000); },
    // a short sting on every outcome card: win rises, partial hangs unresolved, loss falls
    sting: function (res) {
      if (!ctx) return; const t0 = ctx.currentTime + 0.05;
      const seq = { win: [[523.3, 0], [659.3, 0.11], [784, 0.22]], mixed: [[440, 0], [466.2, 0.16]], loss: [[220, 0], [174.6, 0.2], [146.8, 0.4]] }[res] || [];
      seq.forEach(function (n) { bell(n[0], t0 + n[1], res === "loss" ? 1.4 : 1.0, res === "win" ? 0.07 : 0.08); });
    },
    // quiet line hiss under a phone call
    roomTone: function (on) {
      if (!ctx) return; const t = ctx.currentTime;
      if (on && !api._rt) { const n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); n.buffer = noiseBuffer(2); n.loop = true; f.type = "bandpass"; f.frequency.value = 900; f.Q.value = 0.7; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.012, t + 0.4); n.connect(f).connect(g).connect(master); n.start(t); api._rt = { n: n, g: g }; }
      else if (!on && api._rt) { const r = api._rt; api._rt = null; r.g.gain.setTargetAtTime(0.0001, t, 0.15); setTimeout(function () { try { r.n.stop(); } catch (e) {} }, 900); }
    },
    hold: function (on) { if (!ctx) return; try { if (on) ctx.suspend(); else ctx.resume(); } catch (e) {} },
    heart: function (beats) { if (!ctx) return; const t0 = ctx.currentTime; for (let i = 0; i < (beats || 4); i++) [0, 0.22].forEach(function (d, j) { const t = t0 + i * 0.9 + d, o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 52; env(g, t, 0.01, j ? 0.12 : 0.2, 0.18); o.connect(g).connect(master); o.start(t); o.stop(t + 0.3); }); }
  };
  window.SFX = api;
  window.addEventListener("pointerdown", unlock, { capture: true });
  window.addEventListener("keydown", unlock, { capture: true });
})();
