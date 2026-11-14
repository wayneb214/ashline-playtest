/* Albion House cinematics: painted scenes cut into depth layers, slow camera moves, pointer parallax,
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
  // moving paintings: each plays once, then holds its last frame; the layered stills stay underneath as the fallback
  const MOVE = { thames: 1, cab: 1, phone: 1, bath: 1, border: 1, brief: 1, cable: 1, ferry: 1, green: 1, no10: 1, tail: 1, "end-win": 1, "end-mixed": 1, "end-loss": 1, "end-traded": 1, "d4-letter": 1, "d5-bridge": 1, "d6-london": 1, "end2-good": 1, "end2-bad": 1 }; // york: video retired (car morphed), the painted still with parallax is used
  const WIDE = { york: 1, border: 1, no10: 1, cable: 1, "end-win": 1, "end-mixed": 1, "end-loss": 1, "end-traded": 1, "d6-london": 1, "end2-good": 1, "end2-bad": 1 };
  const S = function () { return window.AH ? window.AH.S() : {}; };

  // ---------- the scenes ----------
  // shot: { img, dur, cam: [scale0, x0, y0, scale1, x1, y1] (x, y in % of the frame), pan: [from%, to%] for wide art,
  //         caps: [[t, who, text]], sfx: [[t, name, arg]], inset: portrait, card: text, ui: screenshot, title: true }
  const SCENES = {
    open: { name: "The opening", shots: function () { return [
      { img: "thames", dur: 7.4, cam: [1.14, 0, 3, 1.0, 0, -2], caps: [[0.6, "Narrator", "You are C. As of tonight, you run His Majesty\u2019s most secret service."]], sfx: [[0, "rainUp", true], [0.3, "bigben", 4], [0.6, "voice", "nar_open_1"]] },
      { img: "cab", dur: 9.7, cam: [1.0, -2, 0, 1.12, 2, -3], caps: [[0.5, "Narrator", "Nobody voted for you. Almost nobody knows your name."], [6.5, "Narrator", "Your first day was meant to begin tomorrow."]], sfx: [[0.1, "engine", 4], [0.5, "voice", "nar_open_2"], [6.5, "voice", "nar_open_3"]] },
      { img: "phone", dur: 4.4, cam: [1.0, 0, 0, 1.06, 2, -2], caps: [[0.6, "Narrator", "Then, at midnight\u2026 the telephone rang."]], sfx: [[0.6, "voice", "nar_open_4"], [3.6, "ring"]] },
      { img: "phone", dur: 4.6, cam: [1.06, 2, -2, 1.1, 3, -3], inset: "ash", caps: [[0.4, "Margaret \u2018Ash\u2019 Ashby \u00b7 Chief of Staff", "Chief, we have a problem."]], sfx: [[0.4, "voice", "ash_problem"], [0, "stopRing"], [0.3, "stinger"]] }]; } },
    day1: { name: "Day 1 \u00b7 The Long Day", shots: function () { return [
      { img: "downing", dur: 5, cam: [1.04, 0, 0, 1.12, 0, -2], caps: [[0.5, "", "Wednesday. 08:00. Downing Street."]], sfx: [[0.5, "voice", "cine_day1_1"], [0.2, "chime", 2]] }]; } },
    day2: { name: "Day 2 \u00b7 Pale Hour", shots: function () { return [
      { img: "brief", dur: 7, cam: [1.16, 0, 4, 1.02, 0, -2], caps: [[0.5, "", "Thursday. Vass is alive."], [3.4, "", "Three suspects. One night to stop them leaving."]], sfx: [[0.2, "rainUp", true], [0.4, "tele"], [0.5, "voice", "cine_day2_1"], [3.4, "voice", "cine_day2_2"]] }]; } },
    day3: { name: "Day 3 \u00b7 The Green Coat", shots: function () { return [
      { img: "york", dur: 4.4, pan: [10, 60], cam: [1.05, 0, 0, 1.12, 0, -2], caps: [[0.5, "", "Friday. York."]], sfx: [[0.2, "engine", 3], [0.5, "voice", "cine_day3_1"]] },
      { img: "green", dur: 4, cam: [1.12, 0, 3, 1.02, 0, 0], caps: [[0.3, "Ash", "The woman in green isn\u2019t one of theirs, C. She\u2019s ours."]], sfx: [[0.3, "voice", "ash_green_ours"], [0.2, "stinger"]] }]; } },
    bath: { name: "Bath, 23:47", shots: function () { return [
      { img: "bath", dur: 9, ask: { id: "bath", at: 8.9 }, cam: [1.02, 0, -4, 1.2, 0, 5], caps: [[0.5, "", "23:47. Bath."], [3.2, "", "A man collapses on a bench near the Circus."]], sfx: [[0.1, "rainUp", true], [5.9, "stinger"], [0.5, "voice", "cine_bath_1"], [3.2, "voice", "cine_bath_2"]] }]; } },
    ferry: { name: "Harwich, 23:10", shots: function () { const r = S().done && S().done.exit; return [
      { img: "ferry", dur: 8.5, ask: { id: "ferry", at: 8.4 }, cam: [1.18, 0, 2, 1.0, 0, -3], caps: [[0.5, "", "Harwich. 23:10. The night ferry."], [3.8, "", r === "win" ? "Plain clothes at the gangway. Now." : r === "mixed" ? "One taken at the services. Two still aboard." : "The ferry clears the harbour wall."]], sfx: [[0.3, "horn"], [3.2, "engine", 4], [0.5, "voice", "cine_ferry_1"], [3.8, "voice", "cine_ferry_" + (r === "win" || r === "mixed" ? r : "loss")]] }]; } },
    border: { name: "The border", shots: function () { return [
      { img: "border", dur: 9, ask: { id: "border", at: 8.9 }, pan: [70, 25], cam: [1.04, 0, 0, 1.14, 0, -2], caps: [[0.5, "", "The Varenian border. A queue of cars in the dark."], [4.0, "", "She is in the boot, under a picnic blanket."], [6.8, "", "A guard. A dog."]], sfx: [[0.1, "engine", 6], [3.4, "heart", 5], [0.5, "voice", "cine_border_1"], [4.0, "voice", "cine_border_2"], [6.8, "voice", "cine_border_3"]] }]; } },
    end3: { name: "The Green Coat ends", shots: function () { const s = S(), e = s.deal === "deal" ? "traded" : (s.done && s.done.exfil) || "loss"; return [
      { img: "end-" + e, dur: 8, pan: [40, 60], cam: [1.02, 0, 0, 1.16, 0, -4], caps: [[0.5, "", { win: "Pine forest. Our side of the line.", mixed: "She\u2019s out. One of ours isn\u2019t.", loss: "The barrier. A grey car. Gone.", traded: "A deal is a deal." }[e]], [4, "", { win: "She asks for a cup of tea.", mixed: "Kesk will want a trade.", loss: "Kesk wins this round.", traded: "Nobody mentions a woman in green." }[e]]], sfx: [[0.2, e === "win" ? "chime" : "stinger", 2], [0.5, "voice", "cine_end3_" + e + "_1"], [4, "voice", "cine_end3_" + e + "_2"]] }]; } },
    day4: { name: "Act 2 \u00b7 Day 4 \u00b7 The Letter", shots: function () { return [
      { img: "d4-letter", dur: 7, cam: [1.14, 0, 3, 1.02, 0, -2], caps: [[0.5, "", "Tuesday. Albion House."], [2.6, "Ash", "Chief. A letter came for you this morning. Hand delivered. To this address."]], sfx: [[0.2, "rainUp", true], [0.5, "voice", "cine_day4_1"], [2.6, "voice", "ash_d4_open"], [6.2, "stinger"]] }]; } },
    day5: { name: "Day 5 \u00b7 The Bridge", shots: function () { return [
      { img: "phone", dur: 6.5, cam: [1.0, 0, 0, 1.1, 3, -3], inset: "ash", caps: [[0.5, "", "Wednesday. 06:40."], [2.6, "Ash", "They\u2019ve taken one of ours, Chief. At the airport in Kessgrad, this morning."]], sfx: [[0.2, "ring"], [0.5, "voice", "cine_day5_1"], [1.8, "stopRing"], [2.6, "voice", "ash_d5_open"]] }]; } },
    bridge: { name: "The bridge at dawn", shots: function () { return [
      { img: "d5-bridge", dur: 8, cam: [1.02, 0, -2, 1.16, 0, 3], caps: [[0.5, "", "05:40. The Vell bridge. Fog on the water."], [4.2, "", "Two cars. One each end. Nobody wants to go first."]], sfx: [[0.1, "rainUp", true], [4, "heart", 3], [0.5, "voice", "cine_bridge_1"], [4.2, "voice", "cine_bridge_2"]] }]; } },
    day6: { name: "Day 6 \u00b7 Kesk in London", shots: function () { return [
      { img: "d6-london", dur: 7.5, pan: [20, 65], cam: [1.04, 0, 0, 1.14, 0, -2], caps: [[0.5, "", "Thursday. London. Rain."], [2.9, "Ash", "He\u2019s here, Chief. Kesk is in London. He landed an hour ago, under another name."]], sfx: [[0.2, "rainUp", true], [0.3, "bigben", 3], [0.5, "voice", "cine_day6_1"], [2.9, "voice", "ash_d6_open"]] }]; } },
    end6: { name: "Act 2 ends", shots: function () { const e = window.AH4 ? AH4.ending() : "quiet", ok = e === "knight" || e === "quiet"; return [
      { img: ok ? "end2-good" : "end2-bad", dur: 8, pan: [40, 60], cam: [1.02, 0, 0, 1.14, 0, -3], caps: [[0.5, "", window.AH4 ? AH4.END[e].name : ""]], sfx: [[0.2, ok ? "chime" : "stinger", 1], [0.5, "voice", "cine_end6_" + e]] }]; } },
    trailer: { name: "Trailer", shots: function () { return [
      { img: "thames", dur: 2.6, cam: [1.16, 0, 3, 1.04, 0, -1], sfx: [[0, "rainUp", true], [0.2, "bigben", 2]] },
      { card: "Run Britain\u2019s secret war", dur: 2 },
      { img: "cab", dur: 2, cam: [1.0, -2, 0, 1.1, 2, -3], sfx: [[0, "engine", 2]] },
      { ui: "brief", dur: 2.3 },
      { img: "phone", dur: 2.2, cam: [1.12, 6, -6, 1.28, 9, -11], inset: "ash", caps: [[0.2, "Ash", "Chief, we have a problem."]], sfx: [[0, "ring"], [1.6, "stopRing"]] },
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
  const ORDER = ["open", "day1", "bath", "day2", "ferry", "day3", "border", "end3", "day4", "day5", "bridge", "day6", "end6"];

  // ---------- engine ----------
  let run = null, gated = null;
  const clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  const ease = function (p) { return p * p * (3 - 2 * p); };
  const lerp = function (a, b, p) { return a + (b - a) * p; };
  const clockNow = function () { return window.__CINE_CLOCK__ != null ? window.__CINE_CLOCK__ * 1000 : performance.now(); };
  function shotHTML(sh) {
    if (sh.card) return '<div class="shot cardshot"><div class="tagline">' + sh.card + "</div></div>";
    if (sh.title) return '<div class="shot titleshot"><div class="tt">' + ((window.AH_DATA && AH_DATA.EMBLEM) || "") + '<h1>Albion House</h1><div class="sub">Spymaster</div><div class="flagband" aria-hidden="true"></div><div class="soon">A work of fiction</div></div></div>';
    if (sh.ui) return '<div class="shot uishot"><div class="ly" style="background-image:url(img/cine/thames-0.jpg)"></div><div class="device"><img src="img/cine/tr-' + sh.ui + '.jpg" alt=""></div></div>';
    let h = '<div class="shot' + (WIDE[sh.img] ? " wide" : "") + '">';
    for (let i = 0; i < 3; i++) h += '<div class="ly l' + i + '" style="background-image:url(img/cine/' + sh.img + "-" + i + (i ? ".webp" : ".jpg") + ')"></div>';
    if (MOVE[sh.img] && !reduce()) h += '<video class="mv" muted playsinline preload="' + (sh.hold ? "metadata" : "auto") + '" poster="img/cine/' + sh.img + '-0.jpg"><source src="img/cine/video/' + sh.img + '.mp4" type="video/mp4"><source src="img/cine/video/' + sh.img + '.webm" type="video/webm"></video>';
    if (sh.inset) h += '<img class="inset" src="img/' + sh.inset + '.jpg" alt="">';
    return h + "</div>";
  }
  // If a recorded voice clip runs past its shot, hold the shot until the clip ends. Re-run at start, when clip lengths are known.
  function timeShots(shots) {
    let t = 0;
    shots.forEach(function (s) {
      if (s.base == null) s.base = s.dur; s.dur = s.base;
      (s.sfx || []).forEach(function (f) { if (f[1] === "voice" && window.VOICE && VOICE.len) { const L = VOICE.len(f[2]); if (L) s.dur = Math.max(s.dur, f[0] + L + 0.4); } });
      s.t0 = t; t += s.dur; s.fired = {}; });
    return t;
  }
  function build(id, opts) {
    const shots = SCENES[id].shots();
    shots.forEach(function (s, i) { s.hold = i > 0 && !!s.img && shots[i - 1].img === s.img; });
    const t = timeShots(shots);
    const el = document.createElement("div"); el.className = "cine" + (reduce() ? " still" : "") + (opts.trailer ? " trailer" : ""); el.id = "cine";
    el.setAttribute("role", "dialog"); el.setAttribute("aria-label", SCENES[id].name);
    el.innerHTML = '<div class="cine-stage">' + shots.map(shotHTML).join("") + '</div><div class="lb top"></div><div class="lb bot"></div><div class="cine-cap" aria-live="polite"><small></small><span></span></div>' +
      (opts.trailer ? "" : '<div class="cine-skip">Tap to skip</div>');
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
      const v = n.querySelector("video.mv");
      if (v && !v.dataset.wired) {
        v.dataset.wired = "1";
        const ok = function () { n.classList.add("moving"); };
        const bad = function () { n.classList.remove("moving"); v.remove(); };
        v.addEventListener("error", bad, true); v.querySelectorAll("source").forEach(function (so) { so.addEventListener("error", function () { if (so === v.querySelector("source:last-of-type")) bad(); }); });
        if (s.hold) { const toEnd = function () { v.currentTime = Math.max(0, v.duration - 0.05); }; v.addEventListener("seeked", ok); if (v.readyState >= 1) toEnd(); else v.addEventListener("loadedmetadata", toEnd); }
        else { v.addEventListener("playing", ok); const pr = v.play(); if (pr && pr.catch) pr.catch(function () { if (!v.currentTime) bad(); }); }
      }
      if (v && v.isConnected) {
        if (window.__CINE_CLOCK__ != null && !s.hold && v.readyState >= 1) { v.pause(); const want = Math.min(local, v.duration - 0.05); if (Math.abs(v.currentTime - want) > 0.08) v.currentTime = want; n.classList.add("moving"); }
        else if (!s.hold && v.paused && !v.ended && !r.paused && i === cur) { const pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
        else if (r.paused && !v.paused) v.pause();
        if (s.pan) v.style.objectPosition = lerp(s.pan[0], s.pan[1], p).toFixed(2) + "% 50%";
      }
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
    // Panel 5 (Wayne): the choice waits for the scene to play out, its narration included; the picture holds meanwhile
    const holdAsk = s.ask && !s.answered;
    if (holdAsk && local >= s.ask.at && !r.paused) { if (!s.waitFrom) s.waitFrom = e; if (s.jumped || !(window.VOICE && VOICE.busy()) || e - s.waitFrom > 8) askNow(r, s); } // a tap or a seen scene jumps straight in
    if (s.answered && s.resCap) cap = [0, "", s.resCap];
    const key = cap ? cur + ":" + cap[2] : "";
    if (key !== r.cap) {
      r.cap = key; const box = r.el.querySelector(".cine-cap");
      box.classList.remove("show"); box.querySelector("small").textContent = cap ? cap[1] : ""; box.querySelector("span").textContent = cap ? cap[2] : "";
      if (cap) { void box.offsetWidth; box.classList.add("show"); }
    }
    r.el.classList.toggle("bars", e > 0.05 && !s.card && !s.title);
    if (!holdAsk && (e >= r.total || (r.endAt && r.elapsed >= r.endAt))) finish(false);
  }
  // a timed choice: the scene holds while you decide
  function askNow(r, s) {
    const q = window.DESK && DESK.askOf(s.ask.id); if (!q) { s.answered = true; return; }
    r.paused = true; sfx("heart", 2);
    const secs = r.opts.replay ? 0 : DESK.askSecs ? DESK.askSecs(q) : DESK.timer(q.secs);
    const hide = !!(DESK.hideDef && DESK.hideDef()), rl = function (t) { return window.AH && AH.relabel ? AH.relabel(t) : t; };
    const box = document.createElement("div"); box.className = "cine-ask"; box.setAttribute("role", "group"); box.setAttribute("aria-label", q.q);
    // context first, spoken: any narration the jump held back, then the report (q.pre), then the question. The options
    // stay hidden until the last line has finished, or you tap Skip.
    const vo = q.voice && window.VOICE && VOICE.lines[q.voice];
    const pre = typeof q.pre === "function" ? q.pre() : q.pre || [], ctxIds = (s.ctx || []).concat(pre).filter(function (id) { return window.VOICE && VOICE.lines[id]; });
    const preIds = ctxIds.filter(function (id) { return pre.indexOf(id) >= 0; }), narIds = ctxIds.filter(function (id) { return pre.indexOf(id) < 0; });
    const ctxHTML = narIds.length || s.recap ? '<div class="askctx">' + (s.recap ? '<p class="recap">' + s.recap + "</p>" : "") + narIds.map(function (id) { const L = VOICE.lines[id]; return '<p data-line="' + id + '">' + (L.who && L.who !== "Narrator" ? "<b>" + L.who + ":</b> " : "") + L.text + "</p>"; }).join("") + "</div>" : "";
    const flashHTML = preIds.length ? '<div class="askflash" role="group" aria-label="Flash, most immediate"><div class="fbar"><span class="fstamp">FLASH \u00b7 MOST IMMEDIATE</span><span class="ftime">' + (q.preTag || "") + "</span></div>" + preIds.map(function (id) { return '<p data-line="' + id + '">' + VOICE.lines[id].text + "</p>"; }).join("") + "</div>" : "";
    box.innerHTML = ctxHTML + flashHTML + '<div class="q">' + (vo ? '<span class="asker"><img src="img/ash.jpg" alt=""><b>' + vo.who + "</b></span>" : "") + q.q + "</div>" +
      '<div class="askopts">' + q.opts.map(function (o) { return '<button type="button" data-ask="' + o.k + '"' + (o.k === q.def && !hide ? ' data-def="1"' : "") + "><b>" + o.t + "</b><small>" + rl(o.d) + "</small></button>"; }).join("") +
      (secs ? '<div class="cd" aria-hidden="true"><i id="askbar"></i></div><div class="cdt">' + (hide ? "If you say nothing, Ash decides. (Hard: you won\u2019t know which.)" : "If you say nothing: " + q.opts.filter(function (o) { return o.k === q.def; })[0].t.toLowerCase()) + "</div>" : "") + "</div>";
    if (vo || ctxIds.length) box.insertAdjacentHTML("beforeend", '<button type="button" class="askskip" id="askskip">Skip to the choice</button>');
    r.el.appendChild(box); r.el.classList.add("asking");
    let tm = null, live = false;
    const pickIt = function (k, late) {
      if (s.answered || !live) return; s.answered = true; if (tm) tm.stop();
      s.resCap = r.opts.replay ? q.opts.filter(function (o) { return o.k === k; })[0].t : (late ? "Too late to choose. " : "") + DESK.choose(s.ask.id, k, late);
      box.remove(); r.el.classList.remove("asking"); r.paused = false; r.last = 0; if (window.VOICE) VOICE.hush();
      if (window.FEEL) FEEL.buzz("stamp");
      if (r.opts.askOnly) r.endAt = r.elapsed + 1800;
      window.__CINE_ASKED__ = { id: s.ask.id, k: k, late: !!late };
    };
    box.querySelectorAll("[data-ask]").forEach(function (b) { b.addEventListener("click", function (ev) { ev.stopPropagation(); pickIt(b.getAttribute("data-ask"), false); }); });
    const ready = function () {
      if (live || run !== r) return; live = true; box.classList.remove("preq"); box.classList.add("ready"); const skb = box.querySelector("#askskip"); if (skb) skb.remove(); window.__CINE_ASK_READY__ = { id: s.ask.id, at: Date.now() };
      const f = box.querySelector("[data-ask]"); if (f) f.focus({ preventScroll: true });
      tm = DESK.countdown(secs, "askbar", function () { pickIt(q.def, true); });
    };
    const ids = narIds.concat(preIds, vo ? [q.voice] : []); let i = 0, waited = 0;
    if (vo && ids.length > 1) box.classList.add("preq"); // Ash and the options wait until the scene's lines and the Flash are said
    const said = function (id) { box.querySelectorAll("[data-line]").forEach(function (pEl) { pEl.classList.toggle("now", pEl.getAttribute("data-line") === id); }); };
    const next = function () {
      if (live || run !== r) return; if (i >= ids.length) { said(null); return ready(); }
      const id = ids[i++]; said(id); if (id === q.voice) box.classList.remove("preq"); window.__CINE_SAID__ = (window.__CINE_SAID__ || []).concat([id]);
      VOICE.now(id, { nosub: true, cut: true }); VOICE.after(id, function () { setTimeout(next, 200); });
    };
    // a scene line still being said when the choice arrives finishes first (it is never cut off by the question)
    const own = (s.sfx || []).filter(function (f) { return f[1] === "voice"; }).map(function (f) { return f[2]; });
    const begin = function () { if (live || run !== r) return; const c = window.VOICE && VOICE.speaking() ? VOICE.current().replace(/\.mp3.*/, "") : ""; if (c && own.indexOf(c) >= 0 && waited < 8000) { waited += 150; return void setTimeout(begin, 150); } next(); }; // only this scene's own line; anything else is cut
    const sk = box.querySelector("#askskip"); if (sk) sk.addEventListener("click", function (ev) { ev.stopPropagation(); if (window.VOICE) VOICE.hush(); i = ids.length; said(null); ready(); });
    if (ids.length) { box.classList.add("speaking"); begin(); } else ready();
    if (pre.length) { const st = window.AH && AH.S(); if (st) st.flashSaid = st.day; }
    r.ask = { stop: function () { if (tm) tm.stop(); } };
  }
  // the first unanswered choice still ahead, if any
  function pendingAsk(r) { return r.shots.filter(function (s) { return s.ask && !s.answered; })[0]; }
  function loop(ts) {
    const r = run; if (!r) return;
    r.raf = requestAnimationFrame(loop);
    if (window.__CINE_CLOCK__ != null) return; // driven by the trailer recorder
    if (document.hidden) { r.last = 0; return; }
    if (r.last && ts - r.last < 33) return; // 30 fps cap
    const dt = r.last ? Math.min(100, ts - r.last) : 0; r.last = ts; if (!r.paused) r.elapsed += dt; frame(r);
  }
  // Batch P: jumping ahead to a choice (a tap, or a scene already seen) never fires the narration it passed over all at
  // once (those lines used to queue behind the question and play over, or after, your choice). They are held back and
  // said first, inside the choice, before the options appear.
  function holdBack(r, pa, upTo) {
    pa.ctx = pa.ctx || [];
    // Batch Q: a scene you have already watched gets a one-line written recap instead of its narration said again
    if (r.wasSeen) { const cp = (pa.caps || []).filter(function (c) { return c[0] <= upTo; }).map(function (c) { return c[2]; }); if (cp.length) pa.recap = cp.join(" "); }
    (pa.sfx || []).forEach(function (f, j) { if (f[1] === "voice" && f[0] <= upTo && !pa.fired[j]) { pa.fired[j] = true; if (!r.wasSeen) pa.ctx.push(f[2]); } });
  }
  function skip(r) {
    if (r.paused) return;
    const pa = pendingAsk(r);
    if (pa && !r.opts.replay) { pa.jumped = true; holdBack(r, pa, pa.ask.at); r.elapsed = (pa.t0 + pa.ask.at) * 1000; r.last = 0; frame(r); return; }
    finish(true);
  }
  function finish(skipped) {
    const r = run; if (!r) return; run = null;
    cancelAnimationFrame(r.raf); if (r.ask) r.ask.stop(); sfx("stopRing"); sfx("rainUp", false); if (skipped && window.VOICE) VOICE.hush();
    document.removeEventListener("keydown", r.key); document.removeEventListener("visibilitychange", r.vis);
    document.body.classList.remove("in-cine"); if (window.SFX && SFX.cineDuck) SFX.cineDuck(false);
    if (r.opts.trailer) { window.__TRAILER_DONE__ = true; return; }
    r.el.remove(); window.__CINE_LAST__ = { id: r.id, skipped: skipped };
    if (r.done) r.done();
  }
  function start(r) {
    r.total = timeShots(r.shots);
    run = r; r.nodes = Array.prototype.slice.call(r.el.querySelectorAll(".shot"));
    r.t0 = clockNow(); r.elapsed = 0;
    if (r.opts.askOnly) { const pa = pendingAsk(r); if (pa) { pa.jumped = true; holdBack(r, pa, pa.ask.at); r.elapsed = (pa.t0 + pa.ask.at - 0.6) * 1000; } }
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
      if (e.target.closest(".cine-gate")) { down = null; return; }
      const moved = down ? Math.hypot(e.clientX - down[0], e.clientY - down[1]) : 0; down = null;
      if (e.target.closest(".cine-ask")) { down = null; return; }
      if (moved < 12 && run === r) skip(r);
    });
    r.key = function (e) { if (["Escape", "Enter", " "].indexOf(e.key) >= 0 && run === r && !r.paused) { e.preventDefault(); skip(r); } };
    r.vis = function () { if (!document.hidden && run === r) r.last = 0; };
    document.addEventListener("keydown", r.key); document.addEventListener("visibilitychange", r.vis);
  }
  function markSeen(id) { seen[id] = 1; store.set(SEEN, JSON.stringify(seen)); }
  function play(id, done, opts) {
    opts = opts || {};
    if (run) finish(true);
    const wasSeen = !!seen[id]; markSeen(id);
    if (window.VOICE && !opts.trailer) VOICE.hush(); document.querySelectorAll("#toasts .toast").forEach(function (t) { t.remove(); });
    const r = build(id, opts); r.done = done; r.wasSeen = wasSeen;
    document.body.appendChild(r.el); document.body.classList.add("in-cine"); if (window.SFX && SFX.cineDuck) SFX.cineDuck(true);
    if (window.LOOK) LOOK.rain(!reduce());
    wire(r);
    if (opts.gate) { // first launch: one tap to begin, which also unlocks sound
      const g = document.createElement("div"); g.className = "cine-gate";
      g.innerHTML = '<div class="gt"><h1>Albion House</h1><div class="sub">Spymaster</div><p class="soon">A work of fiction</p><button class="btn primary" id="cine-begin">Tap to begin</button><button class="btn ghost" id="cine-nope">Skip the opening</button></div>';
      r.el.appendChild(g); gated = r;
      g.querySelector("#cine-begin").onclick = function (e) { e.stopPropagation(); if (window.SFX) SFX.unlock(); g.remove(); gated = null; start(r); };
      g.querySelector("#cine-nope").onclick = function (e) { e.stopPropagation(); gated = null; run = r; finish(true); };
      return;
    }
    if (window.SFX) SFX.unlock();
    start(r);
  }
  function enabled() { return store.get(OFF) !== "1"; }
  function auto() { return enabled() && (!FAST || FORCE); }
  function hasAsk(id) { return SCENES[id].shots().some(function (s) { return s.ask; }); }
  function maybe(id, done, opts) {
    const need = hasAsk(id) && window.DESK && !DESK.asked(id);
    if (!auto() || seen[id]) { if (!need) return false; play(id, done, Object.assign({}, opts, { askOnly: true })); return true; }
    play(id, done, opts); return true;
  }

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
      A.render('<div class="card dossier">' + A.LH + '<div class="kicker" style="margin-top:8px">Settings</div><h2>Cutscenes</h2>' +
        '<label class="tipsopt"><input type="checkbox" id="cineon"' + (enabled() ? " checked" : "") + "> Play cutscenes as the story reaches them</label>" +
        '<div class="cinelist">' + ORDER.map(function (k) { return '<button class="card appr" data-cine="' + k + '"' + (seen[k] ? "" : " disabled") + '><div class="t">' + (seen[k] ? "\u25b6 " : "\ud83d\udd12 ") + SCENES[k].name + '</div><p style="margin:0">' + (seen[k] ? "Watch again" : "Not seen yet") + "</p></button>"; }).join("") + "</div>" +
        '<button class="btn ghost" id="back">Back</button></div>', "Cutscenes you have seen can be replayed here.");
      A.$("cineon").onchange = function () { store.set(OFF, A.$("cineon").checked ? "0" : "1"); };
      document.querySelectorAll("[data-cine]").forEach(function (b) { b.onclick = function () { play(b.getAttribute("data-cine"), draw, { replay: true }); }; });
      A.$("back").onclick = back;
    };
    draw();
  }

  window.CINE = { play: play, maybe: maybe, enabled: enabled, auto: auto, trailer: trailer, tick: tick, settings: settings, seen: function () { return Object.assign({}, seen); },
    total: function (id) { return SCENES[id].shots().reduce(function (t, s) { return t + s.dur; }, 0); }, skip: function () { finish(true); }, running: function () { return run ? run.id : gated ? gated.id : null; }, ORDER: ORDER };
})();
