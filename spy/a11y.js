/* VoiceOver names for things that are drawn rather than written: stamps, meters, the live map,
   and tappable cards that aren't real buttons. Runs after each screen change. */
(function () {
  "use strict";
  const txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  function label(root) {
    root.querySelectorAll(".stamp:not([aria-label])").forEach(function (e) { const t = txt(e); if (t) { e.setAttribute("role", "img"); e.setAttribute("aria-label", "Stamped: " + t); } });
    root.querySelectorAll(".meter[aria-label]:not([role])").forEach(function (e) { e.setAttribute("role", "img"); });
    root.querySelectorAll(".opmap").forEach(function (e) {
      if (e.getAttribute("role") === "img") return; e.removeAttribute("aria-hidden"); e.setAttribute("role", "img");
      const live = e.querySelector(".oplive"); e.setAttribute("aria-label", "Live map. " + (live ? txt(live).replace(/^LIVE\s*·\s*/i, "") + " is moving towards the target." : "Your officer is moving towards the target."));
    });
    root.querySelectorAll("[data-c], [data-s], [data-q], [data-sit], [data-crunch], .knob").forEach(function (e) {
      if (/^(BUTTON|INPUT|A)$/.test(e.tagName) || e.getAttribute("role")) return;
      e.setAttribute("role", "button"); if (!e.hasAttribute("tabindex")) e.setAttribute("tabindex", "0");
    });
    root.querySelectorAll("button, [role=button]").forEach(function (e) {
      if (e.getAttribute("aria-label") || /[A-Za-z0-9]{2}/.test(txt(e))) return;
      const img = e.querySelector("img[alt]:not([alt=''])"), n = e.getAttribute("title") || (img && img.alt) || e.getAttribute("data-name");
      if (n) e.setAttribute("aria-label", n);
    });
  }
  let t = 0; const run = function () { if (t) return; t = setTimeout(function () { t = 0; label(document.body); }, 60); };
  new MutationObserver(run).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("keydown", function (e) { const el = e.target; if ((e.key === "Enter" || e.key === " ") && el && el.getAttribute && el.getAttribute("role") === "button" && el.tagName !== "BUTTON") { e.preventDefault(); el.click(); } });
  window.A11Y = { label: label };
})();
