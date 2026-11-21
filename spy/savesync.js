/* savesync.js (QA round 1, S8): on the iPhone, every albion-* key in localStorage (the saved game, endings, settings,
   the Hard unlock) is also kept in native storage through @capacitor/preferences (UserDefaults), because iOS can clear
   a web view's localStorage. On launch, if localStorage has lost them, they are copied back and the page reloads once.
   Existing saves are copied across on the first launch of this build. In a browser there is no Capacitor and nothing
   here runs: the web playtest keeps using localStorage alone, as before. Loaded before every other script. */
(function () {
  "use strict";
  const C = window.Capacitor;
  if (!(C && C.isNativePlatform && C.isNativePlatform())) return;
  let P = null;
  try { P = (C.Plugins && C.Plugins.Preferences) || (C.isPluginAvailable && !C.isPluginAvailable("Preferences") ? null : C.registerPlugin && C.registerPlugin("Preferences")); } catch (e) { P = null; }
  if (!P || !P.set || !P.keys) return;
  const own = function (k) { return typeof k === "string" && k.indexOf("albion-") === 0; };
  const quiet = function (p) { if (p && p.catch) p.catch(function () {}); };
  const lsKeys = function () { const out = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (own(k)) out.push(k); } } catch (e) {} return out; };
  const had = lsKeys(); // what localStorage held before any game script ran
  const ST = Storage.prototype, setItem = ST.setItem, removeItem = ST.removeItem, clear = ST.clear;
  let ready = false; // mirror writes start once the launch check below has finished
  ST.setItem = function (k, v) { setItem.call(this, k, v); if (ready && this === window.localStorage && own(k)) quiet(P.set({ key: k, value: String(v) })); };
  ST.removeItem = function (k) { removeItem.call(this, k); if (ready && this === window.localStorage && own(k)) quiet(P.remove({ key: k })); };
  ST.clear = function () { const ks = this === window.localStorage ? lsKeys() : []; clear.call(this); if (ready) ks.forEach(function (k) { quiet(P.remove({ key: k })); }); };
  const copyUp = function () { lsKeys().forEach(function (k) { try { quiet(P.set({ key: k, value: localStorage.getItem(k) })); } catch (e) {} }); };
  Promise.resolve(P.keys()).then(function (r) {
    const saved = ((r && r.keys) || []).filter(own);
    let once = null; try { once = sessionStorage.getItem("albion-restored"); } catch (e) {}
    if (!had.length && saved.length && !once) {
      // localStorage was cleared by iOS: put the native copy back and start again from it
      return Promise.all(saved.map(function (k) { return Promise.resolve(P.get({ key: k })).then(function (g) { if (g && g.value != null) setItem.call(localStorage, k, g.value); }); }))
        .then(function () { try { sessionStorage.setItem("albion-restored", "1"); } catch (e) {} location.reload(); });
    }
    // QA round 3: the restore worked (localStorage is back), so drop the once-only flag: a later wipe in the same web
    // view session is restored too. If a restore ever failed, localStorage stays empty and the flag still stops a loop.
    if (once && had.length) { try { sessionStorage.removeItem("albion-restored"); } catch (e) {} }
    copyUp(); ready = true; // first launch of this build (or a normal launch): the native copy matches localStorage
  }).catch(function () { ready = true; });
  window.SAVESYNC = { ready: function () { return ready; } };
})();
