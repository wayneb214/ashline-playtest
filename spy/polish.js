/* polish.js: captions never cover a control. The caption looks for the free band closest to the
   bottom of the screen (where the eye expects it), scanning upwards, and moves again whenever the
   page scrolls, resizes or redraws while it is showing. Toasts count as obstacles too. */
(function () {
  "use strict";
  const SEL = "button:not([disabled]), [role=button], input, select, a[href], .dial, .otile, [data-op], .knob, .swipe";
  function obstacles() {
    const vh = innerHeight, out = [], hud = document.getElementById("hud");
    // page content scrolled up under the sticky top bar can't be tapped there, so only its visible part counts
    const hb = hud && !hud.classList.contains("hidden") ? hud.getBoundingClientRect().bottom : 0;
    document.querySelectorAll(SEL).forEach(function (e) {
      if (e.closest("#subtitle")) return;
      let r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || r.bottom <= 0 || r.top >= vh) return;
      const cs = getComputedStyle(e); if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) return;
      if (hb && !e.closest("#hud") && r.top < hb) { if (r.bottom <= hb) return; r = { left: r.left, right: r.right, top: hb, bottom: r.bottom, width: r.width, height: r.bottom - hb }; }
      out.push(r);
    });
    document.querySelectorAll("#toasts .toast.on").forEach(function (t) { out.push(t.getBoundingClientRect()); });
    return out;
  }
  const hit = function (top, h, L, R, obs) { let a = 0; obs.forEach(function (r) { const y = Math.max(0, Math.min(top + h, r.bottom) - Math.max(top, r.top)), x = Math.max(0, Math.min(R, r.right) - Math.max(L, r.left)); a += x * y; }); return a; };
  let cur = null, raf = 0;
  function scan(el, obs) {
    const vh = innerHeight, h = el.offsetHeight, w = el.getBoundingClientRect();
    const safeB = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sab")) || 0;
    let best = null;
    for (let y = vh - safeB - 74 - h; y >= 8; y -= 12) {
      const a = hit(y, h, w.left, w.right, obs);
      if (!best || a < best.a) best = { y: y, a: a };
      if (a === 0) return best;
    }
    // nothing free above the hint line: the hint itself can be covered for a moment
    for (let y = vh - safeB - 74 - h + 12; y <= vh - safeB - 6 - h; y += 12) {
      const a = hit(y, h, w.left, w.right, obs);
      if (!best || a < best.a) best = { y: y, a: a };
      if (a === 0) break;
    }
    return best;
  }
  function place(el) {
    el = el || document.getElementById("subtitle"); if (!el || !el.classList.contains("on")) return;
    cur = el; el.classList.remove("slim", "inhud"); el.style.left = el.style.right = "";
    const obs = obstacles();
    let best = scan(el, obs);
    // no free band at full size: try a slimmer two-line caption, then the top bar beside the menu button
    if (best && best.a > 0) { el.classList.add("slim"); const b2 = scan(el, obs); if (b2 && b2.a < best.a) best = b2; }
    const mb = document.getElementById("menu"), hud = document.getElementById("hud");
    if (best && best.a > 0 && mb && hud && !hud.classList.contains("hidden")) {
      const m = mb.getBoundingClientRect();
      if (m.width) { el.classList.add("inhud"); el.style.left = Math.round(m.right + 8) + "px"; el.style.right = "8px";
        const w = el.getBoundingClientRect(), hb = hud.getBoundingClientRect().bottom, y = Math.max(m.top - 8, Math.min(m.top - 4, hb - el.offsetHeight - 1)), a = hit(y, el.offsetHeight, w.left, w.right, obs);
        if (a < best.a) best = { y: y, a: a }; else { el.classList.remove("inhud"); el.style.left = el.style.right = ""; } }
    }
    if (!best) return;
    el.style.top = Math.round(best.y) + "px"; el.style.bottom = "auto";
    el.dataset.overlap = Math.round(best.a);
  }
  const again = function () { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; if (cur && cur.classList.contains("on")) place(cur); }); };
  addEventListener("scroll", again, { passive: true, capture: true });
  addEventListener("resize", again);
  new MutationObserver(again).observe(document.documentElement, { childList: true, subtree: true });
  // things also slide in and grow without a DOM change (animations, a dial filling, a card selected), so check again while it shows
  addEventListener("animationend", again, true); addEventListener("transitionend", function (e) { if (e.target && e.target.id !== "subtitle") again(); }, true);
  setInterval(function () { if (cur && cur.classList.contains("on") && !document.hidden) again(); }, 350);
  window.POLISH = { placeCaption: place, obstacles: obstacles };
})();
