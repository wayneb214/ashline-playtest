/* Albion House sound: everything synthesised with Web Audio, nothing downloaded.
   Nothing plays until the first tap (iOS rule). Mute is remembered in localStorage. */
(function () {
  "use strict";
  const KEY = "albion-muted";
  let ctx = null, master = null, rain = null, ringing = null;
  let muted = false;
  try { muted = localStorage.getItem(KEY) === "1"; } catch (e) {}

  function noiseBuffer(sec) {
    const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function unlock() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = muted ? 0 : 0.8; master.connect(ctx.destination);
    // soft rain bed: looped noise through a band-pass, gently swelling
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(3); src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1400; bp.Q.value = 0.4;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 4200;
    const g = ctx.createGain(); g.gain.value = 0.05;
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 0.015; lfo.connect(lg).connect(g.gain); lfo.start();
    src.connect(bp).connect(lp).connect(g).connect(master); src.start(); rain = g;
    if (want) setMusic(want);
  }
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
  const mtof = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };
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
    mbus = ctx.createGain(); mbus.gain.setValueAtTime(0.0001, t); mbus.gain.linearRampToValueAtTime(m === "jazz" ? 0.55 : 0.6, t + 2.5); mbus.connect(master);
    nextT = t + 0.1; step = 0; schedule(); mtimer = setInterval(schedule, 200);
  }
  const api = {
    unlock: unlock,
    music: setMusic,
    get musicMode() { return mode || want; },
    voice: function (id) { if (window.VOICE) VOICE.play(id); },
    get muted() { return muted; },
    setMuted: function (m) { muted = !!m; try { localStorage.setItem(KEY, muted ? "1" : "0"); } catch (e) {} if (master) master.gain.setTargetAtTime(muted ? 0 : 0.8, ctx.currentTime, 0.05); if (muted && window.VOICE && VOICE.hush) VOICE.hush(); },
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
    rainUp: function (on) { if (rain && ctx) rain.gain.setTargetAtTime(on ? 0.14 : 0.05, ctx.currentTime, 0.8); },
    engine: function (sec) {
      if (!ctx) return; const t = ctx.currentTime, d = sec || 3, o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(), am = ctx.createOscillator(), ag = ctx.createGain();
      o.type = "sawtooth"; o.frequency.setValueAtTime(48, t); o.frequency.linearRampToValueAtTime(62, t + d * 0.4); o.frequency.linearRampToValueAtTime(38, t + d);
      am.frequency.value = 11; ag.gain.value = 0.02; am.connect(ag).connect(g.gain); f.type = "lowpass"; f.frequency.value = 320;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.07, t + 0.6); g.gain.setValueAtTime(0.07, t + d - 0.8); g.gain.linearRampToValueAtTime(0.0001, t + d);
      o.connect(f).connect(g).connect(master); o.start(t); am.start(t); o.stop(t + d + 0.1); am.stop(t + d + 0.1);
    },
    horn: function () { if (!ctx) return; const t = ctx.currentTime; [73, 110].forEach(function (fq) { const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = "sawtooth"; o.frequency.value = fq; f.type = "lowpass"; f.frequency.value = 500; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.06, t + 0.3); g.gain.setValueAtTime(0.06, t + 1.8); g.gain.linearRampToValueAtTime(0.0001, t + 2.6); o.connect(f).connect(g).connect(master); o.start(t); o.stop(t + 2.7); }); },
    stinger: function () { if (!ctx) return; const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = "triangle"; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(40, t + 1.4); env(g, t, 0.01, 0.22, 1.6); o.connect(g).connect(master); o.start(t); o.stop(t + 1.8); },
    heart: function (beats) { if (!ctx) return; const t0 = ctx.currentTime; for (let i = 0; i < (beats || 4); i++) [0, 0.22].forEach(function (d, j) { const t = t0 + i * 0.9 + d, o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 52; env(g, t, 0.01, j ? 0.12 : 0.2, 0.18); o.connect(g).connect(master); o.start(t); o.stop(t + 0.3); }); }
  };
  window.SFX = api;
  window.addEventListener("pointerdown", unlock, { capture: true });
  window.addEventListener("keydown", unlock, { capture: true });
})();
