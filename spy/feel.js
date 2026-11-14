/* Albion House feel: haptics, stamp thuds and the telegram tear-away.
   Haptics use navigator.vibrate where it exists. A native wrapper (e.g. Capacitor) can take over
   by setting window.AH_HAPTICS = function (kind) { ... } or by exposing Capacitor.Plugins.Haptics.
   Everything respects prefers-reduced-motion. */
(function () {
  "use strict";
  const mq = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : null;
  // player preferences, shared by sound, haptics, motion and tips. Stored on this device only.
  const PKEY = "albion-prefs";
  const PDEF = { mode: "all", music: 0.8, voice: 1, fx: 0.8, haptics: true, reduce: null, tips: true, text: "lg", timers: true };
  let P = Object.assign({}, PDEF);
  try { Object.assign(P, JSON.parse(localStorage.getItem(PKEY) || "{}")); } catch (e) {}
  // sound modes are now All (music, voices, effects) or No music; voices always play unless sound is Off.
  // Old saves: "all" and "music" (which used to silence voices) land on All; "effects" meant no music. No more ambience.
  if (P.mode !== "all" && P.mode !== "nomusic") P.mode = P.mode === "effects" ? "nomusic" : "all";
  delete P.amb;
  // Larger is now the default text size; only someone who picked a size on purpose keeps theirs
  if (!P.textSet) P.text = "lg";
  // volumes are 0..1. Old or odd saves ("50", 50, null) are mended, and a save from before batch D gets its voice
  // volume put back to full once, so voices always sit clearly over the music.
  const lvl = function (v, d) { if (v == null || v === "") return d; v = Number(v); if (!isFinite(v) || v < 0) return d; return Math.min(1, v > 1 ? v / 100 : v); };
  ["music", "voice", "fx"].forEach(function (k) { P[k] = lvl(P[k], PDEF[k]); });
  if (!(P.voice > 0) || !P.audio2) { P.voice = 1; P.audio2 = 1; }
  // text size: Standard is the large default and the minimum; Larger scales every rem-sized word up
  const textSize = function () { try { document.documentElement.classList.toggle("text-lg", P.text === "lg"); } catch (e) {} };
  textSize(); document.addEventListener("prefs", textSize);
  window.PREFS = {
    get: function (k) { return P[k]; },
    set: function (k, v) { P[k] = v; try { localStorage.setItem(PKEY, JSON.stringify(P)); } catch (e) {} document.dispatchEvent(new CustomEvent("prefs")); },
    // effective volume for a channel after the sound mode
    vol: function (ch) { if (ch === "music" && P.mode === "nomusic") return 0; return P[ch] == null ? 1 : lvl(P[ch], PDEF[ch] == null ? 1 : PDEF[ch]); },
    canBuzz: function () { return !!(typeof window.AH_HAPTICS === "function" || (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.Haptics) || navigator.vibrate); }
  };
  const PATTERNS = { tap: 8, stamp: 30, win: [20, 40, 20], loss: [70, 40, 70], ring: [180, 120, 180], tear: 15, drop: 18, heavy: [40, 30, 60], rumble: [60, 40, 60, 40, 60] };
  const FEEL = {
    get deviceReduce() { return !!(mq && mq.matches); },
    get reduce() { const r = P.reduce; return (r == null ? !!(mq && mq.matches) : r) || /[?&]still=1/.test(location.search); },
    buzz: function (kind) {
      if (!P.haptics) return;
      try {
        if (typeof window.AH_HAPTICS === "function") return window.AH_HAPTICS(kind);
        const H = window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.Haptics;
        if (H) return kind === "tap" ? H.selectionChanged && H.selectionChanged() : H.impact({ style: kind === "loss" || kind === "stamp" ? "HEAVY" : "MEDIUM" });
        if (navigator.vibrate) navigator.vibrate(PATTERNS[kind] || 10);
      } catch (e) { /* haptics are optional */ }
    },
    // the stamp lands with a thud: animate any .stamp.thud inside the view
    thud: function (root) {
      const st = (root || document).querySelector(".stamp.thud");
      if (!st) return;
      FEEL.buzz("stamp");
      if (FEEL.reduce) { st.classList.add("landed"); return; }
      st.addEventListener("animationend", function () { st.classList.add("landed"); }, { once: true });
    },
    // the big stamp: slams down over the screen with a thud, a short shake and a heavy haptic, then lifts away.
    // onImpact runs as it lands; done runs once it has gone. Reduced motion: no scale or shake, sound and haptic stay.
    slam: function (word, onImpact, done) {
      const fast = window.__SPY_FAST__ || /[?&]fast=1/.test(location.search), hit = function () { if (window.SFX && SFX.thud) SFX.thud(); FEEL.buzz("slam"); if (onImpact) onImpact(); };
      if (fast) { hit(); if (done) done(); return; }
      const old = document.getElementById("slam"); if (old) old.remove();
      const el = document.createElement("div"); el.id = "slam"; el.className = "slam" + (FEEL.reduce ? " still" : ""); el.setAttribute("aria-hidden", "true");
      el.innerHTML = '<span class="slam-word">' + String(word).replace(/[<>&]/g, "") + "</span>"; document.body.appendChild(el);
      let gone = false; const finish = function () { if (gone) return; gone = true; el.remove(); if (done) done(); };
      setTimeout(function () { hit(); if (!FEEL.reduce) { const app = document.getElementById("app"); if (app) { app.classList.remove("shake"); void app.offsetWidth; app.classList.add("shake"); setTimeout(function () { app.classList.remove("shake"); }, 400); } } }, FEEL.reduce ? 0 : 230);
      setTimeout(function () { el.classList.add("lift"); }, FEEL.reduce ? 700 : 900);
      setTimeout(finish, FEEL.reduce ? 950 : 1200);
      el.addEventListener("click", finish);
    },
    // tear a telegram/flash card away, then carry on
    tearThen: function (el, fn) {
      if (!el || FEEL.reduce) return fn();
      FEEL.buzz("tear"); el.classList.add("tear");
      let done = false; const go = function () { if (!done) { done = true; fn(); } };
      el.addEventListener("animationend", go, { once: true }); setTimeout(go, 700);
    }
  };
  window.FEEL = FEEL;
})();
