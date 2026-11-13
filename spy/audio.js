/* Albion House sound: everything synthesised with Web Audio, nothing downloaded.
   Nothing plays until the first tap (iOS rule). Mute is remembered in localStorage. */
(function () {
  "use strict";
  try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
  const KEY = "albion-muted";
  const qp = function (p) { if (p && p.catch) p.catch(function () {}); }; // resume/suspend can reject on iOS: never an unhandled rejection
  let ctx = null, master = null, out = null, mus = null, ringing = null, duckM = null, an = null;
  let tr = 0, bedDay = -1, duckV = false, duckC = false;
  let muted = false;
  try { muted = localStorage.getItem(KEY) === "1"; } catch (e) {}

  function noiseBuffer(sec) {
    const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function unlock() {
    if (ctx) { if (ctx.state !== "running") { try { qp(ctx.resume()); } catch (e) {} } return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC(); out = ctx.createGain(); out.gain.value = muted ? 0 : 0.8; out.connect(ctx.destination); an = ctx.createAnalyser(); an.fftSize = 2048; out.connect(an);
    // two buses so each slider in Settings has its own volume: effects (master) and music. No ambience beds (Wayne: music, voices and effects only)
    master = ctx.createGain(); mus = ctx.createGain(); duckM = ctx.createGain();
    master.connect(out); mus.connect(duckM).connect(out); levels();
    if (want) setMusic(want);
  }
  function levels() { if (!ctx || !window.PREFS) return; const t = ctx.currentTime; master.gain.setTargetAtTime(PREFS.vol("fx"), t, 0.05); mus.gain.setTargetAtTime(PREFS.vol("music"), t, 0.05); }
  document.addEventListener("prefs", levels);
  // coming back from another app: iOS suspends the context, so wake it on return and on the next tap
  document.addEventListener("visibilitychange", function () { if (!document.hidden && ctx && ctx.state !== "running") { try { qp(ctx.resume()); } catch (e) {} } });
  window.addEventListener("pageshow", function () { if (ctx && ctx.state !== "running") { try { qp(ctx.resume()); } catch (e) {} } });
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
  // ---------- ducking: music dips under voice lines and cutscenes ----------
  function applyDuck() {
    if (!ctx) return; const t = ctx.currentTime;
    duckM.gain.setTargetAtTime(duckC ? (duckV ? 0.1 : 0.25) : duckV ? 0.2 : 1, t, 0.12);
  }
  // ---------- each day plays the jazz in a new key (the old per-day ambience beds are gone) ----------
  const KEYS = { 1: 0, 2: -2, 3: 3, 4: -4, 5: 1, 6: -1 };
  function setDay(d) {
    d = d || 1; bedDay = d; const k = KEYS[d] || 0;
    if (k !== tr) { tr = k; if (mode === "jazz" && ctx) { mode = null; setMusic("jazz"); } } // a new key each day, crossfaded
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
    // the old British double ring (400 + 450 Hz, ring-ring, pause), loud enough to hear over the music; follows the effects volume
    ring: function () {
      unlock(); if (!ctx || ringing) return;
      if (ctx.state !== "running") { try { qp(ctx.resume()); } catch (e) {} }
      api.ringCount = (api.ringCount || 0) + 1;
      const burst = function () {
        if (!ctx) return; const t0 = ctx.currentTime + 0.03;
        [0, 0.6].forEach(function (d) {
          const g = ctx.createGain(), am = ctx.createOscillator(), ag = ctx.createGain(), env = ctx.createGain();
          g.gain.value = 0.5; am.frequency.value = 25; ag.gain.value = 0.5; am.connect(ag).connect(g.gain); // the bell clapper's rattle
          env.gain.setValueAtTime(0.0001, t0 + d); env.gain.exponentialRampToValueAtTime(0.32, t0 + d + 0.02); env.gain.setValueAtTime(0.32, t0 + d + 0.38); env.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.42);
          g.connect(env).connect(master);
          [400, 450].forEach(function (fq) { const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = fq; o.connect(g); o.start(t0 + d); o.stop(t0 + d + 0.44); });
          am.start(t0 + d); am.stop(t0 + d + 0.44);
        });
      };
      burst(); ringing = setInterval(burst, 3000);
    },
    stopRing: function () { if (ringing) { clearInterval(ringing); ringing = null; } },
    // cinematic cues
    bigben: function (strikes) { if (!ctx) return; const t0 = ctx.currentTime + 0.05; for (let s = 0; s < (strikes || 4); s++) bell(103.8, t0 + s * 1.6, 3.4, 0.2); },
    rainUp: function () {}, // no rain sound any more; the cutscenes still call it
    day: function (d) { setDay(d); },
    voiceDuck: function (on) { duckV = !!on; applyDuck(); },
    cineDuck: function (on) { duckC = !!on; applyDuck(); },
    state: function () { return { ctx: ctx ? ctx.state : "none", ringing: !!ringing, rings: api.ringCount || 0, day: bedDay, music: mode, key: tr, duckMusic: duckM ? +duckM.gain.value.toFixed(2) : null, musicGain: out ? +(out.gain.value * mus.gain.value * duckM.gain.value).toFixed(3) : 0, voiceDuck: duckV, cineDuck: duckC, rms: an ? (function () { const b = new Float32Array(an.fftSize); an.getFloatTimeDomainData(b); let q = 0; for (let i = 0; i < b.length; i++) q += b[i] * b[i]; return +Math.sqrt(q / b.length).toFixed(4); })() : 0 }; },
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
    // the big rubber stamp hitting a desk: a low wooden boom under the usual stamp knock
    thud: function () { if (!ctx) return; const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(32, t + 0.22); env(g, t, 0.002, 0.9, 0.32); o.connect(g).connect(master); o.start(t); o.stop(t + 0.45);
      const n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g2 = ctx.createGain(); n.buffer = noiseBuffer(0.2); f.type = "lowpass"; f.frequency.value = 600; env(g2, t, 0.001, 0.6, 0.14); n.connect(f).connect(g2).connect(master); n.start(t); SFX.stamp(); },
    // a sheet of paper sliding: filtered noise swept upward
    paper: function () { if (!ctx) return; const t = ctx.currentTime, n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); n.buffer = noiseBuffer(0.35); f.type = "bandpass"; f.Q.value = 0.8; f.frequency.setValueAtTime(900, t); f.frequency.linearRampToValueAtTime(3200, t + 0.3); env(g, t, 0.05, 0.09, 0.25); n.connect(f).connect(g).connect(master); n.start(t); },
    // radio crackle: bursts of band-limited noise
    crackle: function (sec) { if (!ctx) return; const t = ctx.currentTime, d = sec || 0.6, n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); n.buffer = noiseBuffer(d); f.type = "bandpass"; f.frequency.value = 2200; f.Q.value = 2; g.gain.setValueAtTime(0.0001, t);
      for (let i = 0; i < d * 20; i++) g.gain.setValueAtTime(Math.random() < 0.5 ? 0.0001 : 0.03 + Math.random() * 0.05, t + i / 20); g.gain.setValueAtTime(0.0001, t + d); n.connect(f).connect(g).connect(master); n.start(t); n.stop(t + d + 0.05); },
    // the red phone rumbling on the desk
    rumble: function () { if (!ctx) return; const t = ctx.currentTime, o = ctx.createOscillator(), am = ctx.createOscillator(), ag = ctx.createGain(), g = ctx.createGain(); o.frequency.value = 38; am.frequency.value = 9; ag.gain.value = 0.12; am.connect(ag).connect(g.gain); g.gain.value = 0.12; o.connect(g).connect(master); o.start(t); am.start(t); g.gain.setTargetAtTime(0.0001, t + 0.9, 0.1); o.stop(t + 1.3); am.stop(t + 1.3); },
    // a beat of silence before a reveal: dip the music
    duck: function (sec) { if (!ctx) return; const t = ctx.currentTime; [mus].forEach(function (b) { b.gain.cancelScheduledValues(t); b.gain.setTargetAtTime(0.0001, t, 0.04); }); setTimeout(levels, (sec || 0.8) * 1000); },
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
    hold: function (on) { if (!ctx) return; try { if (on) qp(ctx.suspend()); else qp(ctx.resume()); } catch (e) {} },
    heart: function (beats) { if (!ctx) return; const t0 = ctx.currentTime; for (let i = 0; i < (beats || 4); i++) [0, 0.22].forEach(function (d, j) { const t = t0 + i * 0.9 + d, o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 52; env(g, t, 0.01, j ? 0.12 : 0.2, 0.18); o.connect(g).connect(master); o.start(t); o.stop(t + 0.3); }); }
  };
  window.SFX = api;
  window.addEventListener("pointerdown", unlock, { capture: true });
  window.addEventListener("keydown", unlock, { capture: true });
  // on iPhone pointerdown is not a tap as far as audio goes: touchend and click are
  window.addEventListener("touchend", unlock, { capture: true });
  window.addEventListener("click", unlock, { capture: true });
})();
