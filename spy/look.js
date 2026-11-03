/* look.js: the film look. Grain, rain on glass, night lighting, fades, living title, wax seals.
   Every loop is capped at ~30fps, stops when the page is hidden, and stays off with reduced motion. */
(function () {
  const reduce = function () { return window.FEEL && FEEL.reduce; };
  const $ = function (id) { return document.getElementById(id); };

  // film grain: one small noise tile made once, stepped about by CSS
  function grain() {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const x = c.getContext("2d"), d = x.createImageData(128, 128);
    for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 40; }
    x.putImageData(d, 0, 0);
    $("grain").style.backgroundImage = "url(" + c.toDataURL() + ")";
  }

  // rain on glass: slow drops that slide and leave a trail; a few catch the lamplight
  let raf = 0, on = false, drops = [], last = 0, cv, cx, W, H, dpr;
  function size() { dpr = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function drop(any) { return { x: Math.random() * W, y: any ? Math.random() * H : -10, r: 1.2 + Math.random() * 2.6, v: 8 + Math.random() * 30, glint: Math.random() < 0.18, wob: Math.random() * 6 }; }
  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (t - last < 33) return; const dt = Math.min(0.1, (t - last) / 1000); last = t;
    cx.clearRect(0, 0, W, H);
    drops.forEach(function (d, i) {
      d.y += d.v * dt * (d.r / 2); d.x += Math.sin((d.y + d.wob * 40) / 40) * 0.12;
      if (d.y > H + 10) drops[i] = drop(false);
      const g = cx.createLinearGradient(d.x, d.y - d.r * 9, d.x, d.y);
      g.addColorStop(0, "rgba(200,210,205,0)"); g.addColorStop(1, d.glint ? "rgba(255,214,140,.22)" : "rgba(210,220,215,.13)");
      cx.fillStyle = g; cx.fillRect(d.x - d.r * 0.35, d.y - d.r * 9, d.r * 0.7, d.r * 9);
      cx.beginPath(); cx.arc(d.x, d.y, d.r, 0, 6.283);
      cx.fillStyle = d.glint ? "rgba(255,206,120,.42)" : "rgba(220,228,224,.26)"; cx.fill();
      cx.beginPath(); cx.arc(d.x - d.r * 0.3, d.y - d.r * 0.35, d.r * 0.35, 0, 6.283);
      cx.fillStyle = d.glint ? "rgba(255,240,200,.85)" : "rgba(255,255,255,.5)"; cx.fill();
    });
  }
  function rain(want) {
    want = !!want && !reduce();
    if (want === on) return; on = want; cv = $("rain"); cx = cx || cv.getContext("2d");
    cv.classList.toggle("on", on);
    if (on) { size(); if (!drops.length) for (let i = 0; i < 46; i++) drops.push(drop(true)); if (!document.hidden) raf = requestAnimationFrame(frame); }
    else { cancelAnimationFrame(raf); raf = 0; cx.clearRect(0, 0, W || 0, H || 0); }
  }
  document.addEventListener("visibilitychange", function () {
    if (!on) return;
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) raf = requestAnimationFrame(frame);
  });
  addEventListener("resize", function () { if (on) size(); place(); });

  // dusk to night: 08:00 grey morning, 16:00 dusk, 24:00 deep night
  function night(hour) { const n = Math.max(0, Math.min(1, (hour - 8) / 16)); document.documentElement.style.setProperty("--night", n.toFixed(3)); document.body.classList.toggle("is-night", n >= 0.75); }

  // fade through black between screens
  function fade() {
    if (reduce()) return; const f = $("fade"); f.classList.remove("go"); void f.offsetWidth; f.classList.add("go");
  }

  // living title: line up the overlays with the painting under background-size: cover
  function place() {
    const l = document.querySelector(".living"); if (!l) return;
    const s = Math.max(innerWidth / 720, innerHeight / 1280);
    l.style.width = 720 * s + "px"; l.style.height = 1280 * s + "px";
    l.style.left = (innerWidth - 720 * s) / 2 + "px"; l.style.top = (innerHeight - 1280 * s) / 2 + "px";
  }
  function living() {
    return '<div class="living" aria-hidden="true"><div class="bb"><i class="hh"></i><i class="mh"></i></div><div class="bus"><i></i></div><div class="fog f1"></div><div class="fog f2"></div></div>';
  }

  // red wax seal on secret files (an invented monogram; no crest or crown)
  const SECRETS = /SECRET|EYES ONLY|PALE HOUR/;
  function seals(root) {
    (root || document).querySelectorAll(".card.dossier > .stamp.corner").forEach(function (st) {
      const card = st.parentNode;
      if (!SECRETS.test(st.textContent) || card.querySelector(".seal")) return;
      const s = document.createElement("span"); s.className = "seal"; s.setAttribute("aria-hidden", "true"); s.innerHTML = "<b>AH</b>";
      card.appendChild(s); card.classList.add("sealed");
    });
  }

  window.LOOK = { rain: rain, night: night, fade: fade, place: place, living: living, seals: seals };
  function boot() { grain(); if (/[?&]still=1/.test(location.search)) document.body.classList.add("still"); }
  if (document.readyState !== "loading") boot(); else document.addEventListener("DOMContentLoaded", boot);
})();
