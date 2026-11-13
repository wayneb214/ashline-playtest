/* review.js: asking for ratings, the Apple way (App Store guideline 5.6.1). No rewards, nothing gated.
   - "Rate this game" in the ☰ menu opens the store's write-a-review page. Shown only in the native app once
     APP_STORE_ID is set (or with ?rate=1 for tests).
   - requestReview() asks for the system star prompt once ever, at the first happy moment (first SUCCESS stamp).
     iOS supplies its own "Not now" and decides whether it actually appears.
   On the web both are no-ops, so playtesters never see anything broken. */
(function () {
  "use strict";
  const APP_STORE_ID = "6832206818";
  const FLAG = "albion-review-asked", FORCE = /[?&]rate=1/.test(location.search);
  const native = function () { return !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform()); };
  const canRate = function () { return FORCE || (native() && APP_STORE_ID !== ""); };
  // Opens outside the web view. On iPhone, itms-apps goes to the App Store review sheet.
  // window.open("_system") is handed to the system by Capacitor; a location change would stay in the app.
  function openReviewPage() {
    if (!APP_STORE_ID) return false;
    const q = "/app/id" + APP_STORE_ID + "?action=write-review";
    if (native()) { window.open("itms-apps://apps.apple.com" + q, "_system"); return true; }
    window.open("https://apps.apple.com" + q, "_blank", "noopener"); return true;
  }
  function rateHTML(id) { return '<button type="button" class="btn ghost ratebtn" id="' + id + '">\u2605 Rate this game</button>'; }
  function bindRate(id) { const b = document.getElementById(id); if (b) b.onclick = function () { openReviewPage(); }; }
  // the system prompt; never throws, never waits, never asks twice
  function requestReview() {
    try { if (localStorage.getItem(FLAG)) return false; } catch (e) { return false; }
    if (!native()) return false;
    try { localStorage.setItem(FLAG, "1"); } catch (e) {}
    try { const P = window.NATIVE ? NATIVE.plug("InAppReview") : Capacitor.Plugins && Capacitor.Plugins.InAppReview; if (P && P.requestReview) P.requestReview().catch(function () {}); } catch (e) {}
    return true;
  }
  // called after a stamp lands: only a win, only outside cutscenes
  function happyMoment(res) { if (res !== "win" || document.body.classList.contains("in-cine")) return; setTimeout(function () { if (!document.body.classList.contains("in-cine") && !window.AH_PAUSED) requestReview(); }, 1800); }
  window.REVIEW = { rateHTML: rateHTML, bindRate: bindRate, canRate: canRate, openReviewPage: openReviewPage, requestReview: requestReview, happyMoment: happyMoment };
})();
