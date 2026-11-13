/* native.js: the iPhone layer. Everything here is optional: without the Capacitor plugins (or in a
   browser) each call falls back quietly, so the web build behaves exactly as before.
   - Haptics per action (Capacitor @capacitor/haptics; else navigator.vibrate).
   - Pause when the app goes to the background or a phone call comes in (visibilitychange, pagehide,
     @capacitor/app appStateChange, and an "ah:pause" window event the native shell can fire).
   - Game Center achievements and a best-grade leaderboard (capacitor-game-connect-8, registered as
     CapacitorGameConnect; the older GameCenter name is also tried).
   Plugin list and native config: review/panel2/ios-plugins.md. */
(function () {
  "use strict";
  // a native plugin by name: Capacitor.Plugins when the bridge listed it, else registerPlugin (app-local plugins)
  const cache = {};
  function plug(name) {
    const C = window.Capacitor; if (!C) return null;
    if (C.Plugins && C.Plugins[name]) return C.Plugins[name];
    if (C.isPluginAvailable && !C.isPluginAvailable(name)) return null;
    if (C.registerPlugin) { try { return cache[name] || (cache[name] = C.registerPlugin(name)); } catch (e) {} }
    return null;
  }
  const CAP = function () { return window.Capacitor ? { Haptics: plug("Haptics"), App: plug("App") } : null; };
  const native = function () { return !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform()); };
  const quiet = function (p) { if (p && p.catch) p.catch(function () {}); };
  const LOG = window.__HAPTIC_LOG = [];

  // ---------- haptics: one feel per action ----------
  // impact: LIGHT/MEDIUM/HEAVY; note: SUCCESS/WARNING/ERROR (iOS notification feedback); sel: selection tick
  const MAP = {
    tap: [["impact", "LIGHT"]], select: [["sel"]], press: [["impact", "MEDIUM"]],
    stamp: [["impact", "HEAVY"]], drop: [["impact", "MEDIUM"]], tear: [["impact", "LIGHT"], ["impact", "LIGHT", 70]],
    win: [["note", "SUCCESS"]], loss: [["note", "ERROR"]], warn: [["note", "WARNING"]],
    ring: [["impact", "MEDIUM"], ["impact", "MEDIUM", 120], ["impact", "MEDIUM", 240]],
    heavy: [["impact", "HEAVY"], ["impact", "MEDIUM", 90]], rumble: [["impact", "HEAVY"], ["impact", "HEAVY", 110], ["impact", "HEAVY", 220]],
    heart: [["impact", "MEDIUM"], ["impact", "LIGHT", 220]], tick: [["sel"]], dial: [["impact", "LIGHT"]]
  };
  const RANK = { sel: 0, LIGHT: 1, MEDIUM: 2, SUCCESS: 3, WARNING: 3, HEAVY: 3, ERROR: 4 };
  const VIB = { tap: 8, select: 5, press: 12, stamp: 30, drop: 18, tear: 15, win: [20, 40, 20], loss: [70, 40, 70], warn: [30, 40, 30], ring: [180, 120, 180], heavy: [40, 30, 60], rumble: [60, 40, 60, 40, 60], heart: [25, 180, 15], tick: 5, dial: 6 };
  let last = { t: 0, r: -1 };
  function strength(kind) { return Math.max.apply(null, (MAP[kind] || [["impact", "LIGHT"]]).map(function (s) { return RANK[s[1] || "sel"] || 0; })); }
  window.AH_HAPTICS = function (kind) {
    const now = Date.now(), r = strength(kind);
    if (now - last.t < 90 && r <= last.r) return; // a tap that already caused a stamp feels like one event
    last = { t: now, r: r }; LOG.push(kind); if (LOG.length > 400) LOG.shift();
    const H = CAP() && CAP().Haptics;
    if (!H) { try { if (navigator.vibrate) navigator.vibrate(VIB[kind] || 10); } catch (e) {} return; }
    (MAP[kind] || MAP.tap).forEach(function (s) {
      setTimeout(function () {
        try {
          if (s[0] === "sel") { if (H.selectionStart) quiet(H.selectionStart()); if (H.selectionChanged) quiet(H.selectionChanged()); if (H.selectionEnd) quiet(H.selectionEnd()); }
          else if (s[0] === "note") quiet(H.notification({ type: s[1] }));
          else quiet(H.impact({ style: s[1] }));
        } catch (e) {}
      }, s[2] || 0);
    });
  };
  // every control answers a touch: primary buttons press, choices tick. Ghost and link buttons stay silent.
  document.addEventListener("pointerdown", function (e) {
    const b = e.target.closest && e.target.closest("button, [role=button]"); if (!b || b.disabled || !window.FEEL) return;
    if (b.classList.contains("primary") || b.classList.contains("danger") || b.id === "answer") FEEL.buzz("press");
    else if (b.matches(".card, .otile, .appr, [data-d], [data-m], [data-pick]")) FEEL.buzz("select");
    else if (!b.classList.contains("ghost") && !b.classList.contains("linkbtn")) FEEL.buzz("tap");
  }, { passive: true, capture: true });

  // ---------- pause: background, lock screen, incoming call ----------
  let held = false;
  function hold(why) {
    if (held) return; held = true; window.AH_PAUSED = true; document.body.classList.add("bg-held");
    if (window.VOICE && VOICE.hold) VOICE.hold();
    if (window.SFX && SFX.hold) SFX.hold(true);
    (window.__PAUSE_LOG = window.__PAUSE_LOG || []).push("hold:" + why);
  }
  function wake(why) {
    if (!held) return; held = false; document.body.classList.remove("bg-held");
    if (window.SFX && SFX.hold) SFX.hold(false);
    (window.__PAUSE_LOG = window.__PAUSE_LOG || []).push("wake:" + why);
    const inGame = window.AH && AH.S && AH.S() && AH.S().day && !document.querySelector(".title") && !document.body.classList.contains("in-cine") && !document.getElementById("sheet");
    // in the middle of a day: come back to the pause menu, so a timer never runs on before you are looking
    if (inGame && window.MENU && MENU.open) { MENU.open(); return; }
    if (!document.getElementById("sheet")) window.AH_PAUSED = false;
    if (window.VOICE && VOICE.unhold) VOICE.unhold();
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden) hold("hidden"); else wake("visible"); });
  window.addEventListener("pagehide", function () { hold("pagehide"); });
  window.addEventListener("pageshow", function (e) { if (e.persisted) wake("pageshow"); });
  window.addEventListener("ah:pause", function () { hold("native"); });   // native shell: willResignActive / audio interruption
  window.addEventListener("ah:resume", function () { wake("native"); });
  try { const App = CAP() && CAP().App; if (App && App.addListener) App.addListener("appStateChange", function (s) { if (s && s.isActive) wake("app"); else hold("app"); }); } catch (e) {}

  // ---------- Game Center ----------
  // our own plugin (review/panel2/ios-plugins.patch) is "GameCenter"; a third-party one would be "CapacitorGameConnect"
  const GC = function () { return plug("GameCenter") || plug("CapacitorGameConnect"); };
  let signed = false;
  function gcSignIn() { const G = GC(); if (!G || signed || !G.signIn) return; signed = true; try { quiet(G.signIn()); } catch (e) {} }
  function gcAchieve(id) {
    const G = GC(); if (!G) return false;
    try {
      gcSignIn();
      if (G.unlockAchievement) quiet(G.unlockAchievement({ achievementID: id }));
      else if (G.reportAchievement) quiet(G.reportAchievement({ id: id, percent: 100 }));
      return true;
    } catch (e) { return false; }
  }
  const BOARD = "albionhouse.lb.best_week";
  function gcScore(points) { const G = GC(); if (!G || !G.submitScore) return false; try { gcSignIn(); quiet(G.submitScore({ leaderboardID: BOARD, totalScoreAmount: Math.round(points) })); return true; } catch (e) { return false; } }
  function gcShow() { const G = GC(); if (G && G.showAchievements) { try { quiet(G.showAchievements()); return true; } catch (e) {} } return false; }
  if (window.FUN) FUN.onUnlock = gcAchieve;
  // sign in on the first deliberate tap, never at launch (Apple: don't interrupt the opening)
  document.addEventListener("pointerup", function once() { document.removeEventListener("pointerup", once, true); if (native()) setTimeout(gcSignIn, 1500); }, true);

  window.NATIVE = { plug: plug, native: native, hold: hold, wake: wake, gcAchieve: gcAchieve, gcScore: gcScore, gcShow: gcShow, BOARD: BOARD, MAP: MAP };
})();
