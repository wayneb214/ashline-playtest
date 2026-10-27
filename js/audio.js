/* WebAudio: SFX + generated ambient music. Unlock on first gesture; resume on focus. */
window.ASHLINE_AUDIO = (function () {
  "use strict";
  let ctx = null, master = null, sfxBus = null, musicBus = null;
  let unlocked = false;
  let soundOn = true, musicOn = true, musicVol = 0.35, sfxVol = 0.7;
  let music = null; // { nodes, timer }

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination);
      sfxBus = ctx.createGain(); sfxBus.connect(master);
      musicBus = ctx.createGain(); musicBus.connect(master);
      applyVolumes();
    }
    return ctx;
  }
  function applyVolumes() {
    if (!ctx) return;
    sfxBus.gain.value = soundOn ? sfxVol : 0;
    musicBus.gain.setTargetAtTime(soundOn && musicOn ? musicVol * 0.5 : 0, ctx.currentTime, 0.3);
  }
  function resume() {
    const c = ensure();
    if (c && c.state === "suspended") c.resume().catch(function () {});
  }
  function unlock() {
    if (!unlocked) { unlocked = true; resume(); syncMusic(); }
    else resume();
  }

  function tone(freq, dur, type, gain, slideTo, delay) {
    if (!unlocked || !soundOn) return;
    const c = ensure(); if (!c) return;
    try {
      const t0 = c.currentTime + (delay || 0);
      const o = c.createOscillator(), g = c.createGain();
      o.type = type || "sine";
      o.frequency.setValueAtTime(freq, t0);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain || 0.06, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(sfxBus);
      o.start(t0); o.stop(t0 + dur + 0.03);
    } catch (e) {}
  }
  function noise(dur, gain, hp) {
    if (!unlocked || !soundOn) return;
    const c = ensure(); if (!c) return;
    try {
      const len = Math.floor(c.sampleRate * dur);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = c.createBufferSource(); src.buffer = buf;
      const f = c.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp || 2000;
      const g = c.createGain(); g.gain.value = gain || 0.05;
      src.connect(f); f.connect(g); g.connect(sfxBus);
      src.start();
    } catch (e) {}
  }

  const sfx = {
    key: function () { tone(1200 + Math.random() * 300, 0.02, "square", 0.015); },
    tap: function () { tone(880, 0.04, "triangle", 0.05); noise(0.03, 0.02, 4000); },
    click: function () { tone(880, 0.04, "triangle", 0.05); },
    connect: function () {
      tone(180, 0.25, "sawtooth", 0.04, 720);
      tone(720, 0.18, "triangle", 0.04, 1080, 0.18);
      noise(0.2, 0.03, 1500);
    },
    ok: function () { tone(587, 0.08, "triangle", 0.05); tone(880, 0.12, "triangle", 0.05, null, 0.07); },
    err: function () { tone(160, 0.22, "sawtooth", 0.05, 80); noise(0.12, 0.03, 600); },
    tile: function () { tone(660 + Math.random() * 120, 0.06, "sine", 0.06); },
    clue: function () { tone(988, 0.08, "sine", 0.05); tone(1318, 0.12, "sine", 0.04, null, 0.06); },
    unlock: function () {
      [392, 523, 659, 784, 1046].forEach(function (f, i) { tone(f, 0.18, "triangle", 0.05, null, i * 0.06); });
      noise(0.3, 0.025, 3000);
    },
    alarm: function () {
      for (let i = 0; i < 6; i++) { tone(520, 0.09, "square", 0.045, null, i * 0.16); tone(390, 0.09, "square", 0.03, null, i * 0.16 + 0.08); }
    },
    warn: function () { tone(520, 0.08, "square", 0.04); tone(520, 0.08, "square", 0.04, null, 0.12); },
    heartbeat: function () { tone(70, 0.12, "sine", 0.12); tone(60, 0.14, "sine", 0.09, null, 0.16); },
    win: function () { [523, 659, 784, 1046, 1318].forEach(function (f, i) { tone(f, 0.2, "triangle", 0.05, null, i * 0.09); }); },
    tick: function () { tone(1600, 0.015, "square", 0.02); },
    whoosh: function () { noise(0.25, 0.03, 900); }
  };

  // ---- Ambient music: soft pad + sparse plucks ----
  const SCALE = [146.83, 174.61, 196.0, 220.0, 261.63, 293.66, 349.23]; // D minor-ish pentatonic-ish
  function startMusic() {
    const c = ensure(); if (!c || music) return;
    const nodes = [];
    const filter = c.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 700; filter.Q.value = 0.6;
    const padGain = c.createGain(); padGain.gain.value = 0.0001;
    filter.connect(padGain); padGain.connect(musicBus);
    padGain.gain.setTargetAtTime(0.18, c.currentTime, 2);
    [73.42, 110.0, 146.83, 220.0].forEach(function (f, i) {
      const o = c.createOscillator(); o.type = i % 2 ? "triangle" : "sine";
      o.frequency.value = f; o.detune.value = (i - 1.5) * 6;
      const g = c.createGain(); g.gain.value = 0.22 / (i + 1);
      o.connect(g); g.connect(filter); o.start(); nodes.push(o);
    });
    const lfo = c.createOscillator(); lfo.frequency.value = 0.07;
    const lfoGain = c.createGain(); lfoGain.gain.value = 300;
    lfo.connect(lfoGain); lfoGain.connect(filter.frequency); lfo.start(); nodes.push(lfo);

    function pluck() {
      if (!music) return;
      const t = c.currentTime;
      const f = SCALE[Math.floor(Math.random() * SCALE.length)] * (Math.random() < 0.3 ? 2 : 1);
      const o = c.createOscillator(), g = c.createGain();
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
      o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + 2.5);
      music.timer = setTimeout(pluck, 1400 + Math.random() * 2200);
    }
    music = { nodes: nodes, pad: padGain, timer: null };
    music.timer = setTimeout(pluck, 1200);
  }
  function stopMusic() {
    if (!music) return;
    clearTimeout(music.timer);
    const c = ctx;
    music.pad.gain.setTargetAtTime(0.0001, c.currentTime, 0.4);
    const nodes = music.nodes;
    setTimeout(function () { nodes.forEach(function (n) { try { n.stop(); } catch (e) {} }); }, 1500);
    music = null;
  }
  function syncMusic() {
    if (unlocked && soundOn && musicOn) startMusic(); else stopMusic();
    applyVolumes();
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") resume();
  });
  window.addEventListener("focus", resume);
  window.addEventListener("pageshow", resume);

  function configure(s) {
    soundOn = s.sound !== false;
    musicOn = s.music !== false;
    musicVol = typeof s.musicVol === "number" ? s.musicVol : 0.35;
    sfxVol = typeof s.sfxVol === "number" ? s.sfxVol : 0.7;
    syncMusic();
  }

  return {
    unlock: unlock, resume: resume, sfx: sfx, configure: configure,
    isUnlocked: function () { return unlocked; },
    isMusicPlaying: function () { return !!music; }
  };
})();
