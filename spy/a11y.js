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
  // panel 6 B1/27: while a modal is up (a result still, a file, a sheet, an epilogue), everything behind it is inert, so a keyboard
  // or switch user can't reach (and press again) the button that is still on the page underneath. Runs straight from the
  // MutationObserver (a microtask), so there is no gap between the modal appearing and the page going inert.
  function modal() {
    const ms = Array.prototype.filter.call(document.querySelectorAll('[aria-modal="true"]'), function (m) { return m.isConnected && !m.inert; });
    const want = [], top = ms[ms.length - 1];
    for (let n = top; n && n !== document.body && n.parentElement; n = n.parentElement)
      Array.prototype.forEach.call(n.parentElement.children, function (x) { if (x !== n && !x.contains(top) && !/^(SCRIPT|STYLE|LINK)$/.test(x.tagName)) want.push(x); });
    document.querySelectorAll("[data-inerted]").forEach(function (e) { if (want.indexOf(e) < 0) { e.inert = false; e.removeAttribute("data-inerted"); } });
    want.forEach(function (e) { if (!e.inert) { e.inert = true; e.setAttribute("data-inerted", "1"); } });
    // QA round 3: when the last modal (a cutscene, a sheet) closes, focus goes back to where it was, or to the new screen's
    // heading, rather than being left on <body>, where VoiceOver starts again from the top of the page
    if (top && !wasUp) { wasUp = true; back = document.activeElement && document.activeElement !== document.body && !top.contains(document.activeElement) ? document.activeElement : null; }
    else if (!top && wasUp) { wasUp = false; const b = back; back = null; setTimeout(function () { refocus(b); }, 0); }
  }
  let wasUp = false, back = null;
  function refocus(b) {
    const a = document.activeElement; if (a && a !== document.body && a.isConnected) return; // something already took focus
    if (document.querySelector('[aria-modal="true"]')) return;
    let el = b && b.isConnected && !b.closest("[inert]") ? b : null;
    if (!el) { el = document.querySelector("#app h1, #app h2, #app [role=heading]"); if (el && !el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1"); }
    if (!el) el = document.querySelector("#app button:not([disabled]), #app [role=button], #app a[href]");
    if (el && el.focus) try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
  }
  let t = 0; const run = function () { modal(); if (t) return; t = setTimeout(function () { t = 0; label(document.body); }, 60); };
  new MutationObserver(run).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("keydown", function (e) { const el = e.target; if ((e.key === "Enter" || e.key === " ") && el && el.getAttribute && el.getAttribute("role") === "button" && el.tagName !== "BUTTON") { e.preventDefault(); el.click(); } });
  window.A11Y = { label: label, modal: modal };
})();
