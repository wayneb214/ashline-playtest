/* Albion House feel: haptics, stamp thuds and the telegram tear-away.
   Haptics use navigator.vibrate where it exists. A native wrapper (e.g. Capacitor) can take over
   by setting window.AH_HAPTICS = function (kind) { ... } or by exposing Capacitor.Plugins.Haptics.
   Everything respects prefers-reduced-motion. */
(function () {
  "use strict";
  const mq = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : null;
  // player preferences, shared by sound, haptics, motion and tips. Stored on this device only.
  const PKEY = "albion-prefs";
  const PDEF = { mode: "all", music: 0.8, amb: 0.8, voice: 1, fx: 0.8, haptics: true, reduce: null, tips: true };
  let P = Object.assign({}, PDEF);
  try { Object.assign(P, JSON.parse(localStorage.getItem(PKEY) || "{}")); } catch (e) {}
  window.PREFS = {
    get: function (k) { return P[k]; },
    set: function (k, v) { P[k] = v; try { localStorage.setItem(PKEY, JSON.stringify(P)); } catch (e) {} document.dispatchEvent(new CustomEvent("prefs")); },
    // effective volume for a channel after the sound mode
    vol: function (ch) { const m = P.mode; if (m === "off") return 0; if (m === "music" && ch !== "music") return 0; if (m === "effects" && ch === "music") return 0; return P[ch]; },
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
