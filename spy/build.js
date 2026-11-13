/* build.js: written by publish-playtest.sh for the web playtest only. Shows which build this is in Settings. */
(function () {
  window.AH_BUILD = { stamp: "Playtest 700ce7b · 13 Nov", commit: "700ce7b5a4bcf0a3278af6b681b8f93fdfc5e2be" };
  function add() {
    var back = document.getElementById("st-back");
    if (!back || document.getElementById("ah-build")) return;
    var p = document.createElement("p"); p.id = "ah-build"; p.className = "fine";
    p.style.cssText = "text-align:center;opacity:.75;margin-top:10px;font-size:max(14px,.8rem)";
    p.textContent = window.AH_BUILD.stamp; back.parentNode.insertBefore(p, back.nextSibling);
  }
  new MutationObserver(add).observe(document.documentElement, { childList: true, subtree: true });
})();
