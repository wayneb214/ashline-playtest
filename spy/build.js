/* build.js: written by publish-playtest.sh for the web playtest only. Shows which build this is in Settings. */
(function () {
  window.AH_BUILD = { stamp: "Playtest 50ad8d4 · 13 Nov", commit: "50ad8d4313247253a6010f7a23f1e2fc537cffb8" };
  function add() {
    var back = document.getElementById("st-back");
    if (!back || document.getElementById("ah-build")) return;
    var p = document.createElement("p"); p.id = "ah-build"; p.className = "fine";
    p.style.cssText = "text-align:center;opacity:.75;margin-top:10px;font-size:max(14px,.8rem)";
    p.textContent = window.AH_BUILD.stamp; back.parentNode.insertBefore(p, back.nextSibling);
  }
  new MutationObserver(add).observe(document.documentElement, { childList: true, subtree: true });
})();
