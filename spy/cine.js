/* Albion House cinematics: painted scenes cut into depth layers, slow camera moves, tilt or pointer parallax,
   letterbox bars, subtitles and synthesised sound. One small engine drives the opening, the cutscenes and
   the trailer (?trailer=1). Loops are capped at 30 fps and pause when the page is hidden.
   Reduced motion shows still frames with captions. Everything is fictional. */
(function () {
  "use strict";
  const Q = location.search, FAST = /[?&]fast=1/.test(Q), FORCE = /[?&]cine=1/.test(Q);
  const SEEN = "albion-cine-seen", OFF = "albion-cine-off";
  const store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  let seen = {}; try { seen = JSON.parse(store.get(SEEN) || "{}") || {}; } catch (e) { seen = {}; }
  const reduce = function () { return window.FEEL && FEEL.reduce; };
  const sfx = function (n, a) { if (window.SFX && SFX[n]) SFX[n](a); };
  const WIDE = { york: 1, border: 1, no10: 1, cable: 1 };
  const S = function () { return window.AH ? window.AH.S() : {}; };

  // ---------- the scenes ----------
  // shot: { img, dur, cam: [scale0, x0, y0, scale1, x1, y1] (x, y in % of the frame), pan: [from%, to%] for wide art,
  //         caps: [[t, who, text]], sfx: [[t, name, arg]], inset: portrait, card: text, ui: screenshot, title: true }
  const SCENES = {
    open: { name: "The opening", shots: function () { return [
      { img: "thames", dur: 5.5, cam: [1.14, 0, 3, 1.0, 0, -2], caps: [[0.6, "", "London. Midnight."], [3.2, "", "Rain on the river."]], sfx: [[0, "rainUp", true], [0.3, "bigben", 4]] },
      { img: "cab", dur: 4.6, cam: [1.0, -2, 0, 1.12, 2, -3], caps: [[0.5, "", "The South Bank. Albion House."], [2.6, "", "Somebody has come back to work."]], sfx: [[0.1, "engine", 4]] },
      { img: "phone", dur: 5, cam: [1.0, 0, 0, 1.22, 8, -9], caps: [[0.8, "", "One light on. One phone ringing."]], sfx: [[0.4, "ring"]] },
      { img: "phone", dur: 4.6, cam: [1.22, 8, -9, 1.3, 9, -11], inset: "kite", caps: [[0.4, "Kite \u00b7 Chief of Staff", "Chief, we have a problem."]], sfx: [[0, "stopRing"], [0.3, "stinger"]] }]; } },
    day1: { name: "Day 1 \u00b7 The Long Day", shots: function () { return [
      { img: "no10", dur: 7, pan: [15, 70], cam: [1.04, 0, 0, 1.12, 0, -2], caps: [[0.5, "", "Wednesday. 07:10. Downing Street."], [3.6, "Eleanor Hale \u00b7 Prime Minister", "Keep Britain safe, C. And keep it out of the papers."]], sfx: [[0.2, "chime", 2]] }]; } },
    day2: { name: "Day 2 \u00b7 Pale Hour", shots: function () { return [
      { img: "brief", dur: 7, cam: [1.16, 0, 4, 1.02, 0, -2], caps: [[0.5, "", "Thursday. Vass is alive."], [3.4, "", "Three suspects. One night to stop them leaving."]], sfx: [[0.2, "rainUp", true], [0.4, "tele"]] }]; } },
    day3: { name: "Day 3 \u00b7 The Green Coat", shots: function () { return [
      { img: "york", dur: 4.4, pan: [10, 60], cam: [1.05, 0, 0, 1.12, 0, -2], caps: [[0.5, "", "Friday. York."]], sfx: [[0.2, "engine", 3]] },
      { img: "green", dur: 4, cam: [1.12, 0, 3, 1.02, 0, 0], caps: [[0.3, "Kite", "The woman in green isn\u2019t one of theirs, C. She\u2019s ours."]], sfx: [[0.2, "stinger"]] }]; } },
    bath: { name: "Bath, 23:47", shots: function () { return [
      { img: "bath", dur: 8, cam: [1.02, 0, -4, 1.2, 0, 5], caps: [[0.5, "", "23:47. Bath."], [3.2, "", "A man collapses on a bench near the Circus."], [5.8, "", "He is one of ours."]], sfx: [[0.1, "rainUp", true], [5.6, "stinger"]] }]; } },
    ferry: { name: "Harwich, 23:10", shots: function () { const r = S().done && S().done.exit; return [
      { img: "ferry", dur: 7.5, cam: [1.18, 0, 2, 1.0, 0, -3], caps: [[0.5, "", "Harwich. 23:10. The night ferry."], [3.4, "", r === "win" ? "Plain clothes at the gangway. Now." : r === "mixed" ? "One taken at the services. Two still aboard." : "The ferry clears the harbour wall."]], sfx: [[0.3, "horn"], [3.2, "engine", 4]] }]; } },
    border: { name: "The border", shots: function () { return [
      { img: "border", dur: 8, pan: [70, 25], cam: [1.04, 0, 0, 1.14, 0, -2], caps: [[0.5, "", "The Varenian border. A queue of cars in the dark."], [3.6, "", "She is in the boot, under a picnic blanket."], [6.2, "", "A guard. A dog."]], sfx: [[0.1, "engine", 6], [3.4, "heart", 5]] }]; } },
    end3: { name: "The Green Coat ends", shots: function () { const s = S(), e = s.deal === "deal" ? "traded" : (s.done && s.done.exfil) || "loss"; return [
      { img: e === "win" || e === "mixed" ? "green" : "border", dur: 8, pan: [40, 60], cam: [1.02, 0, 0, 1.16, 0, -4], caps: [[0.5, "", { win: "Pine forest. Our side of the line.", mixed: "She\u2019s out. One of ours isn\u2019t.", loss: "The barrier. A grey car. Gone.", traded: "A deal is a deal." }[e]], [4, "", { win: "She asks for a cup of tea.", mixed: "Kesk will want a trade.", loss: "Kesk wins this round.", traded: "Nobody mentions a woman in green." }[e]]], sfx: [[0.2, e === "win" ? "chime" : "stinger", 2]] }]; } },
    trailer: { name: "Trailer", shots: function () { return [
      { img: "thames", dur: 2.6, cam: [1.16, 0, 3, 1.04, 0, -1], sfx: [[0, "rainUp", true], [0.2, "bigben", 2]] },
      { card: "Run Britain\u2019s secret war", dur: 2 },
      { img: "cab", dur: 2, cam: [1.0, -2, 0, 1.1, 2, -3], sfx: [[0, "engine", 2]] },
      { ui: "brief", dur: 2.3 },
      { img: "phone", dur: 2.2, cam: [1.12, 6, -6, 1.28, 9, -11], inset: "kite", caps: [[0.2, "Kite", "Chief, we have a problem."]], sfx: [[0, "ring"], [1.6, "stopRing"]] },
      { card: "Every choice has a cost", dur: 2 },
      { ui: "phone", dur: 1.8 },
      { img: "bath", dur: 2.4, cam: [1.04, 0, -3, 1.18, 0, 4], sfx: [[0.3, "stinger"]] },
      { card: "Trust no one", dur: 2 },
      { ui: "letter", dur: 2 },
      { ui: "tail", dur: 1.8 },
      { img: "border", dur: 2.4, pan: [70, 35], cam: [1.04, 0, 0, 1.14, 0, -2], sfx: [[0, "heart", 3]] },
      { img: "green", dur: 2.4, cam: [1.14, 0, 3, 1.02, 0, 0] },
      { title: true, dur: 3, sfx: [[0.2, "chime", 1]] }]; } }
  };
  const ORDER = ["open", "day1", "bath", "day2", "ferry", "day3", "border", "end3"];

  // ---------- engine ----------
  let run = null, gated = null;
  const clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  const ease = function (p) { return p * p * (3 - 2 * p); };
  const lerp = function (a, b, p) { return a + (b - a) * p; };
  const clockNow = function () { return window.__CINE_CLOCK__ != null ? window.__CINE_CLOCK__ * 1000 : performance.now(); };
  function shotHTML(sh) {
    if (sh.card) return '<div class="shot cardshot"><div class="tagline">' + sh.card + "</div></div>";
    if (sh.title) return '<div class="shot titleshot"><div class="tt">' + ((window.AH_DATA && AH_DATA.EMBLEM) || "") + '<h1>Albion House</h1><div class="sub">A British spy story</div><div class="flagband" aria-hidden="true"></div><div class="soon">A work of fiction</div></div></div>';
    if (sh.ui) return '<div class="shot uishot"><div class="ly" style="background-image:url(img/cine/thames-0.jpg)"></div><div class="device"><img src="img/cine/tr-' + sh.ui + '.jpg" alt=""></div></div>';
    let h = '<div class="shot' + (WIDE[sh.img] ? " wide" : "") + '">';
    for (let i = 0; i < 3; i++) h += '<div class="ly l' + i + '" style="background-image:url(img/cine/' + sh.img + "-" + i + (i ? ".webp" : ".jpg") + ')"></div>';
    if (sh.inset) h += '<img class="inset" src="img/' + sh.inset + '.jpg" alt="">';
    return h + "</div>";
  }
  function build(id, opts) {
    const shots = SCENES[id].shots(); let t = 0;
    shots.forEach(function (s) { s.t0 = t; t += s.dur; s.fired = {}; });
    const el = document.createElement("div"); el.className = "cine" + (reduce() ? " still" : "") + (opts.trailer ? " trailer" : ""); el.id = "cine";
    el.setAttribute("role", "dialog"); el.setAttribute("aria-label", SCENES[id].name);
    el.innerHTML = '<div class="cine-stage">' + shots.map(shotHTML).join("") + '</div><div class="lb top"></div><div class="lb bot"></div><div class="cine-cap" aria-live="polite"><small></small><span></span></div>' +
      (opts.trailer ? "" : '<div class="cine-skip">Tap to skip</div>' + (window.DeviceOrientationEvent && !reduce() ? '<button class="cine-tilt" type="button" aria-label="Tilt to look around">\u25ce Tilt</button>' : ""));
    return { id: id, shots: shots, total: t, el: el, nodes: null, cap: "", elapsed: 0, last: 0, tilt: [0, 0], aim: [0, 0], opts: opts };
  }
  function frame(r) {
    const e = r.elapsed / 1000, W = r.el.clientWidth || 390, still = reduce();
    let cur = 0; r.shots.forEach(function (s, i) { if (e >= s.t0) cur = i; });
    r.tilt[0] += (r.aim[0] - r.tilt[0]) * 0.12; r.tilt[1] += (r.aim[1] - r.tilt[1]) * 0.12;
    r.shots.forEach(function (s, i) {
      const n = r.nodes[i], local = e - s.t0, on = i === cur || (i === cur - 1 && e - r.shots[cur].t0 < 0.7);
      if (!on) { if (n.style.opacity !== "0") n.style.opacity = "0"; return; }
      const fadeIn = i === 0 ? clamp(local / 0.8, 0, 1) : clamp(local / 0.7, 0, 1);
      n.style.opacity = still ? (i === cur ? "1" : "0") : String(i === cur ? fadeIn : 1);
      n.style.zIndex = i === cur ? "2" : "1";
      const p = still ? 0.5 : ease(clamp(local / s.dur, 0, 1));
      if (s.cam) {
        const c = s.cam, sc = lerp(c[0], c[3], p), x = lerp(c[1], c[4], p), y = lerp(c[2], c[5], p);
        n.querySelectorAll(".ly").forEach(function (ly, j) {
          const d = [0.4, 0.75, 1.1][j];
          const tx = (x * d / 100) * W + (still ? 0 : r.tilt[0] * d * 14), ty = (y * d / 100) * W + (still ? 0 : r.tilt[1] * d * 10);
          ly.style.transform = "translate3d(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px,0) scale(" + (sc * (1 + j * 0.03 * p)).toFixed(4) + ")";
          if (s.pan) ly.style.backgroundPosition = (lerp(s.pan[0], s.pan[1], p) + (j - 1) * 1.5 * p).toFixed(2) + "% 50%";
        });
        const ins = n.querySelector(".inset"); if (ins) ins.style.opacity = String(clamp(local / 0.6, 0, 1));
      }
      if (s.ui) { const im = n.querySelector(".device img"); if (im) im.style.transform = "translateY(" + (-p * 12).toFixed(2) + "%)"; const dv = n.querySelector(".device"); if (dv) dv.style.transform = "perspective(900px) rotateY(" + lerp(-9, 5, p).toFixed(2) + "deg) rotateX(4deg) scale(" + lerp(0.94, 1.0, p).toFixed(3) + ")"; }
      if (s.card || s.title) { const k = n.firstChild; k.style.transform = still ? "" : "scale(" + lerp(1.06, 1.0, p).toFixed(4) + ")"; k.style.letterSpacing = s.card && !still ? lerp(0.02, 0.09, p).toFixed(3) + "em" : ""; }
      if (i === cur) (s.sfx || []).forEach(function (f, j) { if (local >= f[0] && !s.fired[j]) { s.fired[j] = true; sfx(f[1], f[2]); } });
    });
    const s = r.shots[cur], local = e - s.t0; let cap = null;
    (s.caps || []).forEach(function (c) { if (local >= c[0]) cap = c; });
    const key = cap ? cur + ":" + cap[2] : "";
    if (key !== r.cap) {
      r.cap = key; const box = r.el.querySelector(".cine-cap");
      box.classList.remove("show"); box.querySelector("small").textContent = cap ? cap[1] : ""; box.querySelector("span").textContent = cap ? cap[2] : "";
      if (cap) { void box.offsetWidth; box.classList.add("show"); }
    }
    r.el.classList.toggle("bars", e > 0.05 && !s.card && !s.title);
    if (e >= r.total) finish(false);
  }
  function loop(ts) {
    const r = run; if (!r) return;
    r.raf = requestAnimationFrame(loop);
    if (window.__CINE_CLOCK__ != null) return; // driven by the trailer recorder
    if (document.hidden) { r.last = 0; return; }
    if (r.last && ts - r.last < 33) return; // 30 fps cap
    const dt = r.last ? Math.min(100, ts - r.last) : 0; r.last = ts; r.elapsed += dt; frame(r);
  }
  function finish(skipped) {
    const r = run; if (!r) return; run = null;
    cancelAnimationFrame(r.raf); sfx("stopRing"); sfx("rainUp", false);
    window.removeEventListener("deviceorientation", r.ori); document.removeEventListener("keydown", r.key); document.removeEventListener("visibilitychange", r.vis);
    document.body.classList.remove("in-cine");
    if (r.opts.trailer) { window.__TRAILER_DONE__ = true; return; }
    r.el.remove(); window.__CINE_LAST__ = { id: r.id, skipped: skipped };
    if (r.done) r.done();
  }
  function start(r) {
    run = r; r.nodes = Array.prototype.slice.call(r.el.querySelectorAll(".shot"));
    r.t0 = clockNow(); r.elapsed = 0;
    if (window.__CINE_CLOCK__ != null) r.elapsed = 0;
    frame(r); r.raf = requestAnimationFrame(loop);
  }
  function wire(r) {
    const el = r.el; let down = null;
    el.addEventListener("pointerdown", function (e) { down = [e.clientX, e.clientY]; });
    el.addEventListener("pointermove", function (e) {
      const W = el.clientWidth || 390, H = el.clientHeight || 844;
      if (e.pointerType === "mouse" || down) r.aim = [clamp((e.clientX / W - 0.5) * 2, -1, 1), clamp((e.clientY / H - 0.5) * 2, -1, 1)];
    });
    el.addEventListener("pointerup", function (e) {
      if (e.target.closest(".cine-tilt") || e.target.closest(".cine-gate")) { down = null; return; }
      const moved = down ? Math.hypot(e.clientX - down[0], e.clientY - down[1]) : 0; down = null;
      if (moved < 12 && run === r) finish(true);
    });
    r.ori = function (e) { if (e.gamma == null) return; r.aim = [clamp(e.gamma / 25, -1, 1), clamp((e.beta - 45) / 25, -1, 1)]; };
    r.key = function (e) { if (["Escape", "Enter", " "].indexOf(e.key) >= 0 && run === r) { e.preventDefault(); finish(true); } };
    r.vis = function () { if (!document.hidden && run === r) r.last = 0; };
    document.addEventListener("keydown", r.key); document.addEventListener("visibilitychange", r.vis);
    const tb = el.querySelector(".cine-tilt");
    if (tb) tb.addEventListener("click", function (e) { e.stopPropagation(); askTilt(r); tb.classList.add("on"); });
  }
  // iOS asks permission for motion only from a tap
  function askTilt(r) {
    const D = window.DeviceOrientationEvent;
    if (D && typeof D.requestPermission === "function") D.requestPermission().then(function (s) { if (s === "granted") window.addEventListener("deviceorientation", r.ori); }).catch(function () {});
    else window.addEventListener("deviceorientation", r.ori);
  }
  function markSeen(id) { seen[id] = 1; store.set(SEEN, JSON.stringify(seen)); }
  function play(id, done, opts) {
    opts = opts || {};
    if (run) finish(true);
    markSeen(id);
    const r = build(id, opts); r.done = done;
    document.body.appendChild(r.el); document.body.classList.add("in-cine");
    if (window.LOOK) LOOK.rain(!reduce());
    wire(r);
    if (opts.gate) { // first launch: one tap to begin, which also unlocks sound (and tilt on iOS)
      const g = document.createElement("div"); g.className = "cine-gate";
      g.innerHTML = '<div class="gt"><div class="kick">An invented British spy story</div><h1>Albion House</h1><button class="btn primary" id="cine-begin">Tap to begin</button><button class="btn ghost" id="cine-nope">Skip the opening</button></div>';
      r.el.appendChild(g); gated = r;
      g.querySelector("#cine-begin").onclick = function (e) { e.stopPropagation(); if (window.SFX) SFX.unlock(); if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") askTilt(r); g.remove(); gated = null; start(r); };
      g.querySelector("#cine-nope").onclick = function (e) { e.stopPropagation(); gated = null; run = r; finish(true); };
      return;
    }
    if (window.SFX) SFX.unlock();
    start(r);
  }
  function enabled() { return store.get(OFF) !== "1"; }
  function auto() { return enabled() && (!FAST || FORCE); }
  function maybe(id, done, opts) { if (!auto() || seen[id]) return false; play(id, done, opts); return true; }

  // the trailer: plays once, frame-steppable by a recorder through window.__CINE_CLOCK__
  function trailer() {
    document.body.classList.add("on-title");
    const r = build("trailer", { trailer: true }); document.body.appendChild(r.el); document.body.classList.add("in-cine");
    if (window.LOOK) LOOK.rain(true);
    r.el.addEventListener("pointerdown", function () { if (window.SFX) SFX.unlock(); });
    start(r);
  }
  function tick() { if (!run) return; run.elapsed = clockNow() - run.t0; frame(run); }

  // settings: switch cutscenes off, and replay any you have seen
  function settings(back) {
    const A = window.AH;
    const draw = function () {
      A.render('<div class="card dossier">' + A.LH + '<div class="kicker" style="margin-top:8px">Cinema</div><h2>Cutscenes</h2>' +
        '<label class="tipsopt"><input type="checkbox" id="cineon"' + (enabled() ? " checked" : "") + "> Play cutscenes as the story reaches them</label>" +
        '<div class="cinelist">' + ORDER.map(function (k) { return '<button class="card appr" data-cine="' + k + '"' + (seen[k] ? "" : " disabled") + '><div class="t">' + (seen[k] ? "\u25b6 " : "\ud83d\udd12 ") + SCENES[k].name + '</div><p style="margin:0">' + (seen[k] ? "Watch again" : "Not seen yet") + "</p></button>"; }).join("") + "</div>" +
        '<button class="btn ghost" id="back">Back</button></div>', "Cutscenes you have seen can be replayed here.");
      A.$("cineon").onchange = function () { store.set(OFF, A.$("cineon").checked ? "0" : "1"); };
      document.querySelectorAll("[data-cine]").forEach(function (b) { b.onclick = function () { play(b.getAttribute("data-cine"), draw); }; });
      A.$("back").onclick = back;
    };
    draw();
  }

  window.CINE = { play: play, maybe: maybe, enabled: enabled, auto: auto, trailer: trailer, tick: tick, settings: settings, seen: function () { return Object.assign({}, seen); },
    total: function (id) { return SCENES[id].shots().reduce(function (t, s) { return t + s.dur; }, 0); }, skip: function () { finish(true); }, running: function () { return run ? run.id : gated ? gated.id : null; }, ORDER: ORDER };
})();
