/* review.js: asking for ratings, the Apple way (App Store guideline 5.6.1). No rewards, nothing gated.
   - "Rate this game" in the ☰ menu opens the store's write-a-review page. Shown only in the native app once
     APP_STORE_ID is set (or with ?rate=1 for tests).
   - requestReview() asks for the system star prompt once ever, at the first happy moment (first SUCCESS stamp).
     iOS supplies its own "Not now" and decides whether it actually appears.
   On the web both are no-ops, so playtesters never see anything broken. */
(function () {
  "use strict";
  const APP_STORE_ID = "";   // set when the App Store listing exists
  const FLAG = "albion-review-asked", FORCE = /[?&]rate=1/.test(location.search);
  const native = function () { return !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform()); };
  const canRate = function () { return FORCE || (native() && APP_STORE_ID !== ""); };
  function openReviewPage() { if (!APP_STORE_ID) return false; window.open("https://apps.apple.com/app/id" + APP_STORE_ID + "?action=write-review", "_blank"); return true; }
  // the system prompt; never throws, never waits, never asks twice
  function requestReview() {
    try { if (localStorage.getItem(FLAG)) return false; } catch (e) { return false; }
    if (!native()) return false;
    try { localStorage.setItem(FLAG, "1"); } catch (e) {}
    try { const P = Capacitor.Plugins && Capacitor.Plugins.InAppReview; if (P && P.requestReview) P.requestReview().catch(function () {}); } catch (e) {}
    return true;
  }
  // called after a stamp lands: only a win, only outside cutscenes
  function happyMoment(res) { if (res !== "win" || document.body.classList.contains("in-cine")) return; setTimeout(function () { if (!document.body.classList.contains("in-cine") && !window.AH_PAUSED) requestReview(); }, 1800); }
  window.REVIEW = { canRate: canRate, openReviewPage: openReviewPage, requestReview: requestReview, happyMoment: happyMoment };
})();
