/* polish.js: the caption panel. The page scrolls inside #view, and a showing caption gets its own strip of the
   screen: a spacer above or below #view grows to the caption's height, so the view ends where the caption starts
   and the panel never sits over a button. Pop-ups that float above the page count as obstacles when picking a slot. */
(function () {
  "use strict";
  const SEL = "button:not([disabled]), [role=button], input, select, a[href], .dial, .otile, [data-op], .knob, .swipe, [data-avoid]";
  const $ = function (id) { return document.getElementById(id); };
  const clip = function (r, c) { const t = Math.max(r.top, c.top), b = Math.min(r.bottom, c.bottom), l = Math.max(r.left, c.left), rr = Math.min(r.right, c.right); return b - t < 2 || rr - l < 2 ? null : { left: l, right: rr, top: t, bottom: b, width: rr - l, height: b - t }; };
  // every control a person can see: controls in #view are cut to the view's own box (scrolled-away parts are hidden)
  function obstacles(floatingOnly) {
    const vh = innerHeight, out = [], view = $("view");
    document.querySelectorAll(SEL).forEach(function (e) {
      if (e.closest("#subtitle")) return;
      const inView = view && view.contains(e); if (floatingOnly && inView) return;
      let r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || r.bottom <= 0 || r.top >= vh) return;
      const cs = getComputedStyle(e); if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) return;
      // cut to every scrolling box it sits in (the page view, a pop-up's own scroll area): parts scrolled away are hidden
      for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a); if (o.overflowY !== "visible" || o.overflowX !== "visible") { r = clip(r, a.getBoundingClientRect()); if (!r) return; } if (o.position === "fixed") break; }
      out.push(r);
    });
    document.querySelectorAll("#toasts .toast.on").forEach(function (t) { out.push(t.getBoundingClientRect()); });
    return out;
  }
  const hit = function (top, h, L, R, obs) { let a = 0; obs.forEach(function (r) { const y = Math.max(0, Math.min(top + h, r.bottom) - Math.max(top, r.top)), x = Math.max(0, Math.min(R, r.right) - Math.max(L, r.left)); a += x * y; }); return a; };
  // the two strips: one under the top bar, one at the bottom; only one is open at a time
  function spacers() {
    let t = $("capdock-t"), b = $("capdock-b"); const v = $("view");
    if (!v) return null;
    if (!t) { t = document.createElement("div"); t.id = "capdock-t"; t.className = "capdock"; t.setAttribute("aria-hidden", "true"); v.parentNode.insertBefore(t, v); }
    if (!b) { b = document.createElement("div"); b.id = "capdock-b"; b.className = "capdock"; b.setAttribute("aria-hidden", "true"); v.parentNode.insertBefore(b, v.nextSibling); }
    return { t: t, b: b, v: v };
  }
  function dock() {
    const el = $("subtitle"), s = spacers(); if (!s) return;
    const on = !!(el && el.classList.contains("on") && getComputedStyle(el).display !== "none");
    const root = document.documentElement.style;
    if (!on) { s.t.style.height = "0px"; s.b.style.height = "0px"; root.setProperty("--capt", "0px"); root.setProperty("--capb", "0px"); document.body.classList.remove("cap-dock"); return; }
    const top = el.dataset.slot === "top", r = el.getBoundingClientRect(), ty = new DOMMatrixReadOnly(getComputedStyle(el).transform).m42 || 0;
    const ct = r.top - ty, cb = r.bottom - ty;
    if (top) { s.b.style.height = "0px"; const vt = s.v.getBoundingClientRect().top - (parseFloat(s.t.style.height) || 0); s.t.style.height = Math.max(0, Math.ceil(cb - vt + 8)) + "px"; }
    else { s.t.style.height = "0px"; s.b.style.height = Math.max(0, Math.ceil(innerHeight - ct + 8)) + "px"; }
    root.setProperty("--capt", s.t.style.height); root.setProperty("--capb", s.b.style.height);
    document.body.classList.add("cap-dock");
  }
  // slot: bottom unless a floating pop-up control sits there; page controls never matter because the strip pushes them clear
  function place(el) {
    el = el || $("subtitle"); if (!el) return;
    if (!(el.dataset.slot && el.classList.contains("on") && el.dataset.keep === "1")) {
      const obs = obstacles(true), cost = {};
      ["bottom", "top"].forEach(function (slot) { el.classList.toggle("top", slot === "top"); const r = el.getBoundingClientRect(); cost[slot] = hit(r.top, r.height, r.left, r.right, obs); });
      const slot = cost.bottom <= cost.top ? "bottom" : "top";
      el.classList.toggle("top", slot === "top"); el.dataset.slot = slot; el.dataset.overlap = Math.round(cost[slot]);
    }
    requestAnimationFrame(dock);
  }
  // keep the strip in step with the caption: shown, hidden, or a new line of a different height
  const watchCap = function () {
    const mo = new MutationObserver(function () { requestAnimationFrame(dock); });
    let seen = null;
    new MutationObserver(function () { const el = $("subtitle"); if (el && el !== seen) { seen = el; mo.observe(el, { attributes: true, attributeFilter: ["class"], childList: true, subtree: true }); dock(); } }).observe(document.body, { childList: true });
    addEventListener("resize", function () { requestAnimationFrame(dock); });
  };
  let viewT = 0;
  const watchView = function () { const v = $("view"); if (!v) return void setTimeout(watchView, 200); spacers(); new MutationObserver(function () { clearTimeout(viewT); viewT = setTimeout(function () { const el = $("subtitle"); if (el && el.classList.contains("on")) { el.dataset.keep = "0"; place(el); el.dataset.keep = "1"; } }, 120); }).observe(v, { childList: true }); };
  watchView(); watchCap();
  window.POLISH = { placeCaption: place, obstacles: obstacles, dock: dock };
})();
