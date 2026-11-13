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
  // core officers have recorded radio lines (voice.js op_<k>_<beat>); the radio log shows exactly what is said
  function voiced(k, beat) { const L = window.VOICE && VOICE.lines["op_" + k + "_" + beat]; return L ? L : null; }
  // one style for every radio line: "Callsign: words"
  function said(L) { const t = L.text; return t.indexOf(L.who) === 0 ? L.who + ": " + t.slice(L.who.length).replace(/^[.,:;\u2014-]?\s*/, "") : L.who + ": " + t; }
  function speak(k, beat, delay) { const L = voiced(k, beat); if (!L) return false; setTimeout(function () { if (document.getElementById("radio") || beat === "done") VOICE.now("op_" + k + "_" + beat); }, delay || 0); return true; }
  function pick(arr, A) { return arr[Math.floor(A.rnd() * arr.length)]; }
  function fill(s, A, k, id) { return s.replace(/\{n\}/g, A.first(k)).replace(/\{w\}/g, A.CASES()[id].where); }
  function run(id, k, a, kit) {
    const A = window.AH, $ = A.$, esc = A.esc, fast = A.FAST || window.__SPY_FAST__;
    const total = fast ? 1500 : ({ low: 15000, med: 20000, high: 25000 }[a.risk] || 20000), askAt = 0.45, askFor = A.S().diff === "hard" ? 4000 : 6000;
    let t = 0, asked = false, ready = false, chosen = null, left = askFor, logged = 0;
    const lost = A.rnd() < 0.35;
    const beats = [pick(LINES.start, A), pick(LINES.mid, A), null, pick(LINES.mid.filter(function (x) { return x; }), A), pick(LINES.end, A)], vb = [ "pos", "eyes", null, lost ? "lost" : null, null];
    const line = function (i) { const L = voiced(k, vb[i]); if (L) { speak(k, vb[i], i === 0 ? 1400 : 0); return said(L); } return fill(beats[i], A, k, id); };
    A.render('<div data-screen="op" data-music="tense" style="--opbg:url(' + (A.caseImg ? A.caseImg(id) : '') + ')"><div class="card opcard"><div class="kicker">Live \u00b7 ' + esc(A.CASES()[id].where) + '</div><h2>' + esc(A.CASES()[id].title) + '</h2>' +
      '<div class="opmeta">' + A.face(k) + '<div><b>' + esc(A.AG(k).name) + '</b><br><span>' + esc(a.t) + ' \u00b7 ' + A.oddsFor(id, k, a, kit) + '% odds</span></div></div>' +
      '<div class="radio" id="radio" aria-live="polite"></div><div class="opbarw"><div id="opbar" style="width:0%"></div></div><div id="opask"></div></div></div>', "Live operation. Listen to the radio.");
    const say = function (txt, who) { const r = $("radio"); if (!r) return; const p = document.createElement("p"); p.className = who || ""; p.textContent = txt; r.appendChild(p); r.scrollTop = r.scrollHeight; if (window.SFX && SFX.crackle) SFX.crackle(0.5); };
    const finish = function () { clearInterval(timer); timer = null; A.resolve(id, k, a, kit, chosen === "push" ? { push: true, mod: CHOICE.push.mod } : chosen === "abort" ? { abort: true } : {}); cur.id = null; };
    const choose = function (c) {
      if (chosen) return; chosen = c; FEEL.buzz(c === "abort" ? "heavy" : "tap");
      $("opask").innerHTML = '<p class="opchose">' + esc(CHOICE[c].t) + '</p>'; const Lc = voiced(k, c); say(Lc ? said(Lc) : fill(LINES[c], A, k, id), "me"); if (Lc) speak(k, c);
      if (c === "abort") t = Math.max(t, total * 0.9);
    };
    const ask = function () {
      asked = true; const La = voiced(k, "ask"); say(La ? said(La) : fill(pick(LINES.ask, A), A, k, id), "ask"); if (La) speak(k, "ask"); FEEL.buzz("rumble"); if (window.SFX && SFX.rumble) SFX.rumble();
      $("opask").innerHTML = '<p class="oplisten">Listening\u2026</p>';
      // Push / Hold / Abort only appear once the officer has finished the question
      const show = function () { if (!$("opask") || chosen) return; ready = true; buttons(); heart(); };
      if (La && window.VOICE && VOICE.after) setTimeout(function () { VOICE.after("op_" + k + "_ask", show); }, 80); else setTimeout(show, fast ? 0 : 1800);
    };
    // the decision window: a heartbeat you can hear, see and feel, until you choose
    let hb = null;
    const heart = function () {
      const card = document.querySelector(".opcard"); if (card) card.classList.add("heartbeat");
      const beat = function () { if (chosen || !$("opask") || window.AH_PAUSED) return; if (window.SFX && SFX.heart) SFX.heart(1); FEEL.buzz("heart"); };
      beat(); hb = setInterval(function () { if (chosen || !$("opask")) { clearInterval(hb); const c = document.querySelector(".opcard"); if (c) c.classList.remove("heartbeat"); return; } beat(); }, 900);
    };
    const buttons = function () {
      $("opask").innerHTML = '<div class="opchoice"><div class="optimer"><div id="optime"></div></div>' + ["abort", "hold", "push"].map(function (c) { return '<button class="btn opbtn op-' + c + '" data-op="' + c + '"><b>' + CHOICE[c].t + "</b><small>" + CHOICE[c].d + "</small></button>"; }).join("") + "</div>";
      document.querySelectorAll("[data-op]").forEach(function (b) { b.onclick = function () { choose(b.getAttribute("data-op")); }; });
      MENU.coach("op", "Halfway through, your officer may ask for a call. <b>Push</b> raises the odds but risks them. <b>Abort</b> loses the case but saves them. Do nothing and they <b>hold</b>.");
    };
    if (timer) clearInterval(timer);
    say(line(0)); logged = 1;
    timer = setInterval(function () {
      if (!$("opbar")) { clearInterval(timer); timer = null; return; }
      if (window.AH_PAUSED || document.getElementById("coach")) return;
      if (asked && !chosen && !ready) return;
      if (asked && !chosen) { left -= 100; const e = $("optime"); if (e) e.style.width = Math.max(0, left / askFor * 100) + "%"; if (left <= 0) choose("hold"); return; }
      t += 100; $("opbar").style.width = Math.min(100, t / total * 100) + "%";
      const f = t / total;
      if (!asked && f >= askAt) { ask(); return; }
      const want = f < askAt ? (f > askAt * 0.6 ? 2 : 1) : (f > 0.8 ? 5 : 4);
      while (logged < want) { if (beats[logged]) say(line(logged)); logged++; }
      if (t >= total) finish();
    }, 100);
  }
  // ---- how it's done: a verb that fits the plan, and a pace from Careful to Fast ----
  const VERBS = {
    surveil: { t: "Surveil", d: "Watch and wait", risk: "low" },
    approach: { t: "Approach", d: "Talk your way in", risk: "med" },
    burgle: { t: "Burgle", d: "Get in, get out", risk: "high" },
    turn: { t: "Turn", d: "Win someone over", cases: ["defector", "mole", "courier", "leak"] }
  };
  const PACE = [{ t: "Careful", odds: 6, hours: 1 }, { t: "Steady", odds: 0, hours: 0 }, { t: "Fast", odds: -8, hours: -1 }];
  let cur = { id: null, k: null, verb: null, touched: false, pace: 1 };
  const fits = function (v, id, a) { const V = VERBS[v]; return V.cases ? V.cases.indexOf(id) >= 0 : V.risk === a.risk; };
  const best = function (id, a) { return fits("turn", id, a) && a.risk !== "high" ? "turn" : Object.keys(VERBS).filter(function (v) { return fits(v, id, a); })[0] || "approach"; };
  function reset(id, k) { cur = { id: id, k: k, verb: null, touched: false, pace: 1 }; }
  function parts(id, k, a, add) {
    if (cur.id !== id || cur.k !== k) return;
    const v = cur.touched && cur.verb ? cur.verb : best(id, a); if (!cur.touched) cur.verb = v;
    add(VERBS[v].t + (fits(v, id, a) ? " fits" : " doesn\u2019t fit"), fits(v, id, a) ? 5 : -5);
    add(PACE[cur.pace].t, PACE[cur.pace].odds);
  }
  function hours() { return cur.id ? PACE[cur.pace].hours : 0; }
  function controls(id, k, a) {
    if (a && !cur.touched) cur.verb = best(id, a);
    return '<h3 class="question">How exactly?</h3><div class="verbs">' + Object.keys(VERBS).map(function (v) { return '<button class="verb' + (cur.verb === v ? " sel" : "") + '" data-verb="' + v + '"><b>' + VERBS[v].t + "</b><small>" + VERBS[v].d + "</small></button>"; }).join("") + "</div>" +
      '<label class="pace"><span>Careful</span><input type="range" id="pace" min="0" max="2" step="1" value="' + cur.pace + '" aria-label="Pace: careful to fast"><span>Fast</span></label><p class="pacenote">' + PACE[cur.pace].t + ": " + (PACE[cur.pace].odds ? (PACE[cur.pace].odds > 0 ? "+" : "") + PACE[cur.pace].odds + "% odds, " : "") + (PACE[cur.pace].hours ? (PACE[cur.pace].hours > 0 ? "+1h" : "\u22121h") : "no change") + "</p>";
  }
  function bind(draw) {
    document.querySelectorAll("[data-verb]").forEach(function (b) { b.onclick = function () { cur.verb = b.getAttribute("data-verb"); cur.touched = true; if (window.SFX && SFX.type) SFX.type(); draw(); }; });
    const r = document.getElementById("pace"); if (r) r.onchange = function () { cur.pace = +r.value; if (window.SFX && SFX.tick) SFX.tick(); draw(); };
    MENU.coach("verbs", "Pick <b>how</b> it\u2019s done. A verb that fits the plan adds 5%. Slide toward <b>Careful</b> for better odds but more hours, or <b>Fast</b> to save time.");
  }
  window.OPS = { run: run, parts: parts, controls: controls, bind: bind, reset: reset, hours: hours };
})();
