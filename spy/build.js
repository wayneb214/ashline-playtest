/* build.js: written by publish-playtest.sh for the web playtest only. Shows which build this is in Settings. */
(function () {
  window.AH_BUILD = { stamp: "Playtest d1f36f4 · 20 Nov", commit: "d1f36f42d76e0493a4e191adbeeb563dcf64c192" };
  function add() {
    var back = document.getElementById("st-back");
    if (!back || document.getElementById("ah-build")) return;
    var p = document.createElement("p"); p.id = "ah-build"; p.className = "fine";
    p.style.cssText = "text-align:center;opacity:.75;margin-top:10px;font-size:max(14px,.8rem)";
    p.textContent = window.AH_BUILD.stamp; back.parentNode.insertBefore(p, back.nextSibling);
  }
  new MutationObserver(add).observe(document.documentElement, { childList: true, subtree: true });
})();
