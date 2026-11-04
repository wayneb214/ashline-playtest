/* ops.js: the live operation. After C sends an officer, the radio runs for 15-25 seconds,
   with one timed call to make halfway through: Push, Hold or Abort. Pauses with the ☰ menu. */
(function () {
  "use strict";
  const LINES = {
    start: ["{n} is in position. {w}.", "Comms check. {n} reads you, C.", "{n}: Going in now."],
    mid: ["Movement on the street. Two men, one with a dog.", "{n}: Lights on, first floor. Someone\u2019s still in.", "Car idling across the road. Engine running.", "{n}: Clock\u2019s against us. Still on it."],
    ask: ["{n}: They\u2019ve doubled up. I can push through, or sit tight. Your call, C.", "{n}: Something\u2019s off. Push now, or wait it out?", "{n}: I\u2019ve been spotted, maybe. Push, hold, or pull me out?"],
    push: "{n}: Understood. Going now. Hard.", hold: "{n}: Holding. Nice and slow.", abort: "{n}: Pulling out. Back the long way.",
    end: ["{n}: Nearly there\u2026", "Static. Then breathing. Then: \u2018Done.\u2019", "{n}: Coming home."]
  };
  const CHOICE = { push: { mod: 12, t: "Push", d: "+12% odds. Risk they come back hurt, or burned." }, hold: { mod: 0, t: "Hold", d: "Stay the course. No change." }, abort: { mod: 0, t: "Abort", d: "Lose the case. Bring them home safe." } };
  let timer = null;
  function pick(arr, A) { return arr[Math.floor(A.rnd() * arr.length)]; }
  function fill(s, A, k, id) { return s.replace(/\{n\}/g, A.first(k)).replace(/\{w\}/g, A.CASES()[id].where); }
  function run(id, k, a, kit) {
    const A = window.AH, $ = A.$, esc = A.esc, fast = A.FAST || window.__SPY_FAST__;
    const total = fast ? 1500 : ({ low: 15000, med: 20000, high: 25000 }[a.risk] || 20000), askAt = 0.45, askFor = fast ? 6000 : 6000;
    let t = 0, asked = false, chosen = null, left = askFor, logged = 0;
    const beats = [pick(LINES.start, A), pick(LINES.mid, A), null, pick(LINES.mid.filter(function (x) { return x; }), A), pick(LINES.end, A)];
    A.render('<div data-screen="op" data-music="tense"><div class="card opcard"><div class="kicker">Live \u00b7 ' + esc(A.CASES()[id].where) + '</div><h2>' + esc(A.CASES()[id].title) + '</h2>' +
      '<div class="opmeta">' + A.face(k) + '<div><b>' + esc(A.AG(k).name) + '</b><br><span>' + esc(a.t) + ' \u00b7 ' + A.oddsFor(id, k, a, kit) + '% odds</span></div></div>' +
      '<div class="radio" id="radio" aria-live="polite"></div><div class="opbarw"><div id="opbar" style="width:0%"></div></div><div id="opask"></div></div></div>', "Live operation. Listen to the radio.");
    const say = function (txt, who) { const r = $("radio"); if (!r) return; const p = document.createElement("p"); p.className = who || ""; p.textContent = txt; r.appendChild(p); r.scrollTop = r.scrollHeight; if (window.SFX && SFX.crackle) SFX.crackle(0.5); };
    const finish = function () { clearInterval(timer); timer = null; A.resolve(id, k, a, kit, chosen === "push" ? { push: true, mod: CHOICE.push.mod } : chosen === "abort" ? { abort: true } : {}); };
    const choose = function (c) {
      if (chosen) return; chosen = c; FEEL.buzz(c === "abort" ? "heavy" : "tap");
      $("opask").innerHTML = '<p class="opchose">' + esc(CHOICE[c].t) + '</p>'; say(fill(LINES[c], A, k, id), "me");
      if (c === "abort") t = Math.max(t, total * 0.9);
    };
    const ask = function () {
      asked = true; say(fill(pick(LINES.ask, A), A, k, id), "ask"); FEEL.buzz("rumble"); if (window.SFX && SFX.rumble) SFX.rumble();
      $("opask").innerHTML = '<div class="opchoice"><div class="optimer"><div id="optime"></div></div>' + ["abort", "hold", "push"].map(function (c) { return '<button class="btn opbtn op-' + c + '" data-op="' + c + '"><b>' + CHOICE[c].t + "</b><small>" + CHOICE[c].d + "</small></button>"; }).join("") + "</div>";
      document.querySelectorAll("[data-op]").forEach(function (b) { b.onclick = function () { choose(b.getAttribute("data-op")); }; });
      MENU.coach("op", "Halfway through, your officer may ask for a call. <b>Push</b> raises the odds but risks them. <b>Abort</b> loses the case but saves them. Do nothing and they <b>hold</b>.");
    };
    if (timer) clearInterval(timer);
    say(fill(beats[0], A, k, id)); logged = 1;
    timer = setInterval(function () {
      if (!$("opbar")) { clearInterval(timer); timer = null; return; }
      if (window.AH_PAUSED || document.getElementById("coach")) return;
      if (asked && !chosen) { left -= 100; const e = $("optime"); if (e) e.style.width = Math.max(0, left / askFor * 100) + "%"; if (left <= 0) choose("hold"); return; }
      t += 100; $("opbar").style.width = Math.min(100, t / total * 100) + "%";
      const f = t / total;
      if (!asked && f >= askAt) { ask(); return; }
      const want = f < askAt ? (f > askAt * 0.6 ? 2 : 1) : (f > 0.8 ? 5 : 4);
      while (logged < want) { const b = beats[logged]; if (b) say(fill(b, A, k, id)); logged++; }
      if (t >= total) finish();
    }, 100);
  }
  window.OPS = { run: run, parts: function () {}, controls: function () { return ""; }, bind: function () {} };
})();
