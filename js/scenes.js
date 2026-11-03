/* ASHLINE scenes.js — painted story scenes (intro now, breakaways between jobs later).
   Each scene: a still with a slow pan/zoom, a kicker, one subtitle line and a sound cue.
   Tap = next scene, Skip = end. Reduced motion = no pan/zoom. */
(function (AL) {
  "use strict";
  const $ = AL.$;
  const root = $("scene"), layers = [$("scene-a"), $("scene-b")];
  const kicker = $("scene-kicker"), line = $("scene-line"), face = $("scene-face"), dots = $("scene-dots");
  let list = [], idx = -1, front = 0, timer = 0, done = null;

  function dur(sc) { return Math.max(5200, sc.line.length * 62); }
  function show(i) {
    clearTimeout(timer);
    idx = i;
    if (idx >= list.length) { end(); return; }
    const sc = list[idx], still = AL.reduceMotion();
    front = 1 - front;
    const L = layers[front], O = layers[1 - front];
    L.style.transition = "none";
    L.style.backgroundImage = "url(" + sc.img + ")";
    L.style.transform = sc.from || "scale(1.08)";
    void L.offsetWidth;
    L.style.transition = still ? "opacity .3s" : "opacity 1s ease, transform " + (dur(sc) + 1200) + "ms linear";
    L.style.opacity = "1";
    if (!still) L.style.transform = sc.to || "scale(1.16)";
    O.style.opacity = "0";
    kicker.textContent = sc.kicker || "";
    line.textContent = sc.line;
    face.innerHTML = sc.portrait ? AL.ART.portrait(sc.portrait, "neutral", 56) : "";
    face.classList.toggle("hidden", !sc.portrait);
    [kicker, line, face].forEach(function (n) { n.classList.remove("in"); void n.offsetWidth; n.classList.add("in"); });
    dots.innerHTML = list.map(function (_, k) { return '<i class="' + (k === idx ? "on" : k < idx ? "seen" : "") + '"></i>'; }).join("");
    if (sc.sfx) AL.sfx(sc.sfx);
    timer = setTimeout(function () { show(idx + 1); }, dur(sc));
  }
  function end() {
    clearTimeout(timer);
    if (root.classList.contains("hidden")) return;
    root.classList.add("hidden");
    layers.forEach(function (l) { l.style.opacity = "0"; });
    const cb = done; done = null; list = [];
    if (cb) cb();
  }
  function play(name, onDone) {
    list = (AL.DATA.SCENES[name] || []).slice();
    done = onDone || null;
    if (!list.length) { end(); return; }
    root.classList.remove("hidden");
    idx = -1; show(0);
  }
  root.addEventListener("click", function (e) {
    if (e.target.closest("#scene-skip")) { AL.sfx("tap"); end(); return; }
    AL.sfx("tap"); show(idx + 1);
  });

  AL.scenes = { play: play, skip: end, next: function () { show(idx + 1); }, isPlaying: function () { return !root.classList.contains("hidden"); } };
})(window.AL);
