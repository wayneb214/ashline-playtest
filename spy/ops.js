/* ops.js: the live operation. After C sends an officer, the radio runs for 15-25 seconds,
   with one timed call to make halfway through: Push, Hold or Abort. Pauses with the ☰ menu. */
(function () {
  "use strict";
  const LINES = {
    // travel: said on the way in, while the marker is still crossing the map; pos: on arrival at the target
    travel: ["{n}: On the move. A few minutes out.", "Comms check. {n} reads you, C. On my way.", "{n}: Heading in now."],
    pos: ["{n} is in position. {w}."],
    // mid: things seen at the target. Rotated so a day never hears the same one twice
    mid: ["Movement on the street. A man walking a dog, second time past.", "{n}: Lights on, first floor. Someone\u2019s still in.", "Car idling across the road. Engine running.", "{n}: Clock\u2019s against us. Still on it.",
      "{n}: Curtain moved upstairs. Nobody came out.", "{n}: Taxi dropped someone at the corner. Not our one.", "{n}: Quiet. Too quiet for this street.", "{n}: Delivery van, no markings. Nobody\u2019s unloading."],
    ask: ["{n}: They\u2019ve doubled up. I can push through, or sit tight. Your call, C.", "{n}: Something\u2019s off. Push now, or wait it out?", "{n}: I\u2019ve been spotted, maybe. Push, hold, or pull me out?"],
    push: "{n}: Understood. Going now. Hard.", hold: "{n}: Holding. Nice and slow.", abort: "{n}: Pulling out. Back the long way.",
    end: ["{n}: Almost done\u2026", "Static. Then breathing. Then: \u2018Done.\u2019", "{n}: Wrapping up."],
    // op-balance: the tell on a trap op, said just before the officer asks for the call. Plain and fair: something has
    // been set up for them. Radio text only (no recorded audio for these yet).
    trap: ["{n}: Two cars I don\u2019t recognise. Same plates as yesterday.",
      "{n}: The street\u2019s been cleared. No buses, no dog walkers, nobody. Someone\u2019s emptied it.",
      "{n}: Same man in the grey coat. Third time tonight, and now he isn\u2019t even hiding.",
      "{n}: The back door\u2019s propped open. They never leave it open. Never.",
      "{n}: Van with blacked-out windows, parked right across my way out. They know my route.",
      "{n}: Wrong reply to the recognition phrase. That isn\u2019t our contact.",
      "{n}: Every light on the floor just went off at once. They\u2019re waiting for someone.",
      "{n}: There\u2019s a man on the roof opposite with a long lens. Pointed at my door, not theirs."]
  };
  const CHOICE = { push: { t: "Push" }, hold: { t: "Hold" }, abort: { t: "Abort" } };
  // the trade-off under each answer, from the same numbers resolve() applies (opmodel.js via A.opTerms).
  // op-balance v5/v7 (Wayne): three labelled lines on every button, in one aligned layout. Hold and Push: Best case / Worst case /
  // Odds. Abort has only one result, so: Outcome / Cost / Odds. Short, neutral, true to the effects; plain words, no percentages.
  // The odds are a band in words (A.oddsBand) with a short reason true to the state. The working is on the result card afterwards.
  // ALL the button wording lives in WORDS: change it here and nowhere else. {placeholders} are filled from the real state:
  //   {nm} officer's code name, {loss} the on-screen meters if the call fails (A.opLoss: the plan's own losses as the game applies
  //   them, halved on a non-trap Hold, plus the call's price),
  //   {trust} No.10 trust change, {loyal} WORDS.loyal, {band} the odds band (WORDS.band), {why} WORDS.why.
  const WORDS = {
    labels: { best: "Best case", worst: "Worst case", outcome: "Outcome", cost: "Cost", odds: "Odds" },
    // panel 6 items 2 and 7: the Best case is the real meters on a win ({gain}, A.opGain), and a failed Hold shows its real
    // (half) losses. Panel 6 v3: no "(halved)" label, players work it out; v5: no "{nm} safe" either (a trap Hold still says "{nm} hurt")
    push: [["best", "{gain}"], ["worst", "{loss}, cover may be blown"], ["odds", "{band} \u00b7 {why}"]],
    hold: [["best", "{gain}"], ["worst", "{loss}"], ["odds", "{band} \u00b7 {why}"]],
    holdTrap: [["best", "{gain}"], ["worst", "{nm} hurt, full losses: {loss}"], ["odds", "{band} \u00b7 {why}"]],
    abort: [["outcome", "{nm} home safe, case lost"], ["cost", "{trust}, {loyal}"], ["odds", "certain"]],
    loyal: { gain: "loyalty {n}", top: "loyalty already at the top" },
    // the meters by their on-screen names (D.METERS), in the order the top bar shows them; nothing lost: WORDS.lossNone
    meters: [["capital", "No.10 trust"], ["service", "Service"]], lossNone: "no meter change",
    // panel 6 items 1, 6, 7 and 9: one "What the words mean" panel under the buttons, the same on every call (it never hints
    // at a trap). Plain words, no percentages.
    meansBtn: "What do these words mean?",
    means: [["Odds", "{oddsList}"],
      ["Partly works", "the job gets done, but not cleanly: the plan\u2019s smaller result, and no extra payoff for pushing."],
      ["Best case", "what the top bar gains if it works. A Push has worse odds than a Hold, but makes the plan\u2019s gains three times as big."],
      ["Service", "the second meter on the top bar: your officers\u2019 strength and morale. Under 30, they refuse high-risk plans until rested."],
      ["Cover may be blown", "if a Push fails, the other side may get a look at the officer. If they do, the officer is out of the field for good."],
      ["Full losses", "on a trap they were waiting, so holding back doesn\u2019t help: the whole loss lands and the officer is hurt. Hold also costs No.10 trust \u22121 and Service \u22126 whatever happens (the team is tied up waiting); a failed Push costs Service \u22123 on top of its losses. That is why a Hold can cost more than a Push."]],
    // the reason after the dot: plain and true to the state ({nm} officer code name, {sv} "she\u2019s"/"he\u2019s", {p} "her"/"his")
    why: { push: "ahead of {p} tail", pushTired: "{sv} exhausted", pushTrap: "they know {p} route", hold: "waiting for a safe gap", holdTrap: "they\u2019re watching the exits" },
    // officer pronouns for the reasons. Panel 6 B2: Ada she/her, Hollis he/his; anyone else (Sam) by name, with "the" for the
    // possessive, so "they" in a reason only ever means the other side ("they know the route", never "they know their route")
    pron: { macrae: { sv: "she\u2019s", p: "her" }, pryce: { sv: "he\u2019s", p: "his" }, hartley: { sv: "he\u2019s", p: "his" }, ada: { sv: "she\u2019s", p: "her" }, hollis: { sv: "he\u2019s", p: "his" }, other: { sv: "{nm}\u2019s", p: "the" } },
    // panel 6 v4 (Wayne): no chance word on "cover may be blown" (it hinted at a choice); the real chance is on the result card
    band: function (t) { return t.replace(/ odds$/, ""); } // "long odds" -> "long"
  };
  const wfill = function (t, v) { return t.replace(/\{(\w+)\}/g, function (x, k) { return v[k] != null ? v[k] : x; }); };
  function terms(A, id, k, a, kit, trap) {
    const T = A.opTerms(id, k, a, kit, trap), nm = A.AG(k).code || A.first(k), m = function (n) { return n < 0 ? "\u2212" + (-n) : "+" + n; };
    const S = A.S(), tired = (S.stress || {})[k] >= 3, W = WORDS;
    const lossTxt = function (o) { const t = W.meters.filter(function (x) { return o[x[0]]; }).map(function (x) { return (x[1] + " " + m(o[x[0]])).replace(/ /g, "\u00a0"); }); return t.length ? t.join(", ") : W.lossNone; };
    const loss = { push: A.opLoss(id, k, a, kit, "push", trap), hold: A.opLoss(id, k, a, kit, "hold", trap) };
    const gain = { push: A.opGain(id, k, a, kit, "push", trap), hold: A.opGain(id, k, a, kit, "hold", trap) };
    const pr = W.pron[k] || W.pron.other, base = { nm: nm, sv: wfill(pr.sv, { nm: nm }), p: pr.p };
    const V = {
      push: Object.assign({}, base, { gain: lossTxt(gain.push), loss: lossTxt(loss.push), band: W.band(A.oddsBand(T.push.odds)), why: wfill(trap ? W.why.pushTrap : tired ? W.why.pushTired : W.why.push, base) }),
      hold: Object.assign({}, base, { gain: lossTxt(gain.hold), loss: lossTxt(loss.hold), trust: m(T.hold.trust), band: W.band(A.oddsBand(T.hold.odds)), why: wfill(trap ? W.why.holdTrap : W.why.hold, base) }),
      abort: Object.assign({}, base, { trust: lossTxt({ capital: T.abort.trust }), loyal: T.abort.loyalGain ? wfill(W.loyal.gain, { n: m(T.abort.loyalGain) }) : W.loyal.top }) };
    const tpl = { push: W.push, hold: T.hold.safe ? W.hold : W.holdTrap, abort: W.abort }, L = {};
    Object.keys(tpl).forEach(function (c) {
      const o = { rows: tpl[c].map(function (r) { return [r[0], W.labels[r[0]], wfill(r[1], V[c])]; }) };
      o.rows.forEach(function (r) { o[r[0]] = r[2]; });
      o.lines = o.rows.map(function (r) { return r[1] + ": " + r[2]; }); L[c] = o;
    });
    const CLS = { best: "og", outcome: "og", worst: "or", cost: "or", odds: "oc" };
    const html = function (o) { return o.rows.map(function (r) { return '<span class="' + CLS[r[0]] + '"><b class="ol">' + r[1] + ":</b> " + r[2] + "</span>"; }).join(""); };
    return { T: T, L: L, V: V, loss: loss, gain: gain, d: { push: html(L.push), hold: html(L.hold), abort: html(L.abort) } };
  }
  // the "What do these words mean?" panel: a 44px toggle under the buttons; opening it never chooses anything
  function meansHTML() { return '<button type="button" class="btn ghost opmeansbtn" id="opmeansbtn" aria-expanded="false" aria-controls="opmeans">' + WORDS.meansBtn + '</button><dl class="opmeans" id="opmeans" hidden>' + WORDS.means.map(function (x) { return "<dt>" + x[0] + "</dt><dd>" + x[1].replace("{oddsList}", MENU.oddsHTML("The chance it works at least partly, best to worst:")) + "</dd>"; }).join("") + "</dl>"; }
  function bindMeans() { const b = document.getElementById("opmeansbtn"), d = document.getElementById("opmeans"); if (!b || !d) return; b.onclick = function () { const open = d.hidden; d.hidden = !open; b.setAttribute("aria-expanded", String(open)); if (open && d.scrollIntoView) d.scrollIntoView({ block: "nearest" }); }; }
  let timer = null;
  // core officers have recorded radio lines (voice.js op_<k>_<beat>); the radio log shows exactly what is said
  // who the officer is watching, so "her", "him" or "them" matches the case (keyed by day, as case ids repeat)
  const PRON = { d1_defector: "her", d1_leak: "them", d1_sabotage: "them", d2_safehouse: "them", d2_exit: "them", d3_york: "her", d4_watch: "him", d4_manchester: "him", d5_recon: "them", d5_press: "him", d6_find: "him" };
  let pron = null;
  // lines heard today (radio lines rotate: nothing repeats within a day while there is something fresh to say)
  function heard() { const S = window.AH && AH.S ? AH.S() : {}; if (!S.opHeard || S.opHeard.day !== S.day) S.opHeard = { day: S.day, ids: [] }; return S.opHeard.ids; }
  function fresh(list, A) { const h = heard(), f = list.filter(function (x) { return h.indexOf(x) < 0; }), x = (f.length ? f : list)[Math.floor(A.rnd() * (f.length ? f : list).length)]; h.push(x); return x; }
  let eyesId = null; // this op's "eyes on" line, picked once from the officer's set
  function vid(k, beat) {
    if (!window.VOICE || !beat) return null; const V = VOICE.lines, b = "op_" + k + "_" + beat;
    if (beat === "eyes" && eyesId && V[eyesId]) return eyesId;
    if (pron && (beat === "eyes" || beat === "lost") && V[b + "_" + pron]) return b + "_" + pron;
    if (beat === "pos" && V[b + "_code"]) return b + "_code"; // panel 6 item 10: a recruit says their code name
    return V[b] ? b : null;
  }
  // an officer with alternative "eyes on" lines (op_<k>_eyes_alt1..) gets a different one each time today
  function eyesFor(k, A) {
    if (!window.VOICE) return null; const V = VOICE.lines, b = "op_" + k + "_eyes", set = [];
    const base = pron && V[b + "_" + pron] ? b + "_" + pron : V[b] ? b : null; if (base) set.push(base);
    for (let i = 1; V[b + "_alt" + i]; i++) set.push(b + "_alt" + i);
    return set.length > 1 ? fresh(set, A) : base;
  }
  function voiced(k, beat) { const id = vid(k, beat); return id ? VOICE.lines[id] : null; }
  // one style for every radio line: "Callsign: words"
  function said(L) { const t = L.text; return t.indexOf(L.who) === 0 ? L.who + ": " + t.slice(L.who.length).replace(/^[.,:;\u2014-]?\s*/, "") : L.who + ": " + t; }
  function speak(k, beat, delay) { const L = voiced(k, beat); if (!L) return false; const id = vid(k, beat); setTimeout(function () { if (document.getElementById("radio") || beat === "done") VOICE.now(id); }, delay || 0); return true; }
  function pick(arr, A) { return arr[Math.floor(A.rnd() * arr.length)]; }
  function fill(s, A, k, id) { return s.replace(/\{n\}/g, A.AG(k).code || A.first(k)).replace(/\{w\}/g, A.CASES()[id].where); }
  // the night map: the officer's marker walks a route across a painted London while the radio runs
  const ROUTES = ["M36 254 C 86 206, 120 214, 160 172 S 248 124, 296 112 S 344 66, 366 42", "M30 62 C 88 92, 110 150, 170 160 S 258 198, 300 228 S 348 250, 370 262", "M52 272 C 72 204, 140 190, 188 150 S 222 72, 280 62 S 340 90, 362 132"];
  // a painted map for where each mission happens; the London streets for the rest
  const MAPS = {
    coast: { img: "img/map-coast.jpg", r: "M60 12 C 90 60, 100 100, 130 130 S 180 150, 230 156" },
    airport: { img: "img/map-airport.jpg", r: "M24 250 C 60 240, 90 230, 120 215 S 160 190, 180 168" },
    oldtown: { img: "img/map-oldtown.jpg", r: "M20 120 C 60 130, 100 150, 140 165 S 190 180, 210 182" },
    country: { img: "img/map-country.jpg", r: "M360 280 C 330 230, 300 200, 250 190 S 160 175, 110 160" },
    border: { img: "img/map-border.jpg", r: "M150 296 C 160 250, 180 210, 195 170 S 220 110, 232 82" },
    city: { img: "img/map-city.jpg", r: "M30 270 C 80 240, 120 220, 160 200 S 210 165, 232 150" }
  };
  const MAPOF = { d1_defector: "oldtown", d1_sabotage: "coast", d2_safehouse: "city", d2_exit: "coast", d3_york: "country", d4_manchester: "city", d5_recon: "border" };
  // "Stop them leaving" is Harwich or Manchester: the plan you pick decides which map you see
  function mapFor(id, a) { const S = window.AH && AH.S ? AH.S() : null; if (id === "exit" && a && /Manchester|airport/i.test(a.t || "")) return MAPS.airport; return MAPS[MAPOF["d" + (S ? S.day : 1) + "_" + id]] || null; }
  function routeOf(id) { let h = 0; String(id).split("").forEach(function (c) { h = (h * 31 + c.charCodeAt(0)) | 0; }); return ROUTES[Math.abs(h) % ROUTES.length]; }
  function mapHTML(A, id, k, a) {
    const M = mapFor(id, a), d = M ? M.r : routeOf(id), end = d.match(/(-?[\d.]+) (-?[\d.]+)$/);
    return '<div class="opmap" aria-hidden="true"><img src="' + (M ? M.img : "img/op-map.jpg") + '" alt=""><svg viewBox="0 0 400 300" preserveAspectRatio="none"><path class="oproute" d="' + d + '"/><path class="oproute done" id="oproute" d="' + d + '"/></svg>' +
      '<span class="optarget" style="left:' + (end[1] / 4) + "%;top:" + (end[2] / 3) + '%"></span><span class="opmark" id="opmark"><i></i>' + A.face(k) + '</span><span class="opscan"></span><span class="oplive"><b></b>LIVE \u00b7 ' + A.esc((A.AG(k).code || A.first(k)).toUpperCase()) + "</span></div>";
  }
  // The marker and the radio tell the same story: the officer crosses the map before ARR (only travel lines then),
  // says "in position" on arrival, and stays at the target (circling within NEAR map units) for everything seen there.
  // Only "lost" drifts them off a little, and only Abort takes them back along the route.
  const ARR = 0.18, NEAR = 7;
  function placeAt(f, st) {
    const ease = function (x) { x = Math.max(0, Math.min(1, x)); return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
    let r = ease(f / ARR), off = 0;
    if (f >= ARR) off = NEAR * Math.min(1, (f - ARR) / 0.05);
    if (st && st.lostAt != null && f >= st.lostAt) off = NEAR + 26 * Math.max(0, 1 - Math.abs(f - st.lostAt - 0.08) / 0.08);
    if (st && st.abortAt != null && f >= st.abortAt) { r = 1 - 0.5 * Math.min(1, (f - st.abortAt) / Math.max(0.05, 1 - st.abortAt)); off = 0; }
    return { r: r, off: off, a: f * Math.PI * 6 };
  }
  function moveMark(f, st) {
    const p = document.getElementById("oproute"), m = document.getElementById("opmark"); if (!p || !m || !p.getTotalLength) return;
    const w = placeAt(f, st), L = p.getTotalLength(), pt = p.getPointAtLength(L * w.r);
    const x = pt.x + w.off * Math.cos(w.a), y = pt.y + w.off * Math.sin(w.a);
    m.style.left = (x / 4).toFixed(2) + "%"; m.style.top = (y / 3).toFixed(2) + "%"; // percentages, so it stays put when the map shrinks
    p.style.strokeDasharray = L; p.style.strokeDashoffset = L * (1 - w.r);
  }
  function run(id, k, a, kit) {
    const A = window.AH, $ = A.$, esc = A.esc, fast = A.FAST || window.__SPY_FAST__;
    const total = fast ? 1500 : ({ low: 15000, med: 20000, high: 25000 }[a.risk] || 20000), askAt = 0.45;
    // No reply clock: the radio waits for your call, and nothing is ever chosen for you (Wayne, batch J)
    let t = 0, asked = false, ready = false, chosen = null, logged = 0, skipped = false;
    const lost = A.rnd() < 0.35, ckey = "d" + A.S().day + "_" + id, st = { lostAt: null, abortAt: null };
    // op-balance: is this one a trap? Decided once, before anything is said; the tell comes just before the question
    const trap = A.trapFor ? A.trapFor(id, k) : false; A.S().opsRun = (A.S().opsRun || 0) + 1;
    let tellTxt = null; // what the officer saw, repeated over the buttons so it can't scroll away
    pron = PRON[ckey] || null; eyesId = eyesFor(k, A);
    // Ash's two lines for this mission: one after the officer has eyes on, one just before the question
    const caseId = function (n) { const c = "op_case_" + ckey + "_" + n; return window.VOICE && VOICE.lines[c] ? c : null; };
    let pending = false;
    const ashSays = function (n, then) {
      const c = caseId(n); if (!c || (skipped && n === 1)) return void (then && then());
      const go = function () { if (!$("radio")) return; say(said(VOICE.lines[c]), "desk"); if (fast) { if (then) then(); return; } VOICE.now(c); pending = true; VOICE.after(c, function () { pending = false; if (then) then(); }); };
      go();
    };
    // The Grey House is explained the first time a mission involves it (also noted on the case file)
    const S0 = A.S(), gh = !S0.ghTold && /Grey House/.test((A.CASES()[id].brief || "") + " " + ((window.VOICE && VOICE.lines["ash_case_" + ckey]) || {}).text);
    if (gh) S0.ghTold = true;
    // beats: 0 on the way, 1 in position (at the target), 2 eyes on, 3 the question, 4 seen there (or lost), 5 the end
    const beats = [fresh(LINES.travel, A), LINES.pos[0], fresh(LINES.mid, A), null, fresh(LINES.mid, A), fresh(LINES.end, A)], vb = [null, "pos", "eyes", null, lost ? "lost" : null, null];
    const AT = [0, ARR, 0.3, askAt, 0.62, 0.82], KIND = ["travel", "pos", "eyes", "ask", lost ? "lost" : "mid", "end"]; // when each beat is due (fraction of the op)
    const line = function (i) { const L = voiced(k, vb[i]); if (L) { speak(k, vb[i]); if (vb[i] === "lost") st.lostAt = t / total; return said(L); } if (vb[i] === "lost") st.lostAt = t / total; return fill(beats[i], A, k, id); };
    A.render('<div data-screen="op" data-music="tense">' + mapHTML(A, id, k, a) + '<div class="card opcard"><div class="kicker">Live \u00b7 ' + esc(A.CASES()[id].where) + '</div><h2>' + esc(A.CASES()[id].title) + '</h2>' +
      '<div class="opmeta">' + A.face(k) + '<div><b>' + esc(A.AG(k).name) + '</b><br><span>' + esc(a.t) + ' \u00b7 ' + A.oddsBand(A.oddsFor(id, k, a, kit)) + '</span></div></div>' +
      '<div class="radio" id="radio"></div><div class="sr-only" id="radiosr" aria-live="polite"></div><div class="opbarw"><div id="opbar" style="width:0%"></div></div><div id="opask"></div>' +
      '<button type="button" class="btn ghost opskip" id="opskip">Skip to decision \u23ed</button></div></div>', "Live operation. Listen to the radio, or skip to the decision.");
    // radio captions come through like a teletype: a crackle, then the words tap out
    const say = function (txt, who, kind) {
      const r = $("radio"); if (!r) return; const p = document.createElement("p"); p.className = who || ""; p.dataset.kind = kind || who || ""; r.appendChild(p);
      const m = $("opmark"), tg = document.querySelector(".optarget"); if (m && tg) p.dataset.d = Math.hypot(parseFloat(m.style.left) - parseFloat(tg.style.left), (parseFloat(m.style.top) - parseFloat(tg.style.top)) * 0.75).toFixed(1); // map-width %, for tests
      if (window.__opLog) window.__opLog.push({ kind: p.dataset.kind, d: +p.dataset.d, text: txt }); // tests read what was said where
      const sr = $("radiosr"); if (sr) sr.textContent = txt;
      if (window.SFX && SFX.crackle) SFX.crackle(0.5);
      if (fast || FEEL.reduce) { p.textContent = txt; r.scrollTop = r.scrollHeight; return; }
      let i = 0; p.classList.add("typing");
      const iv = setInterval(function () { i += 2; p.textContent = txt.slice(0, i); r.scrollTop = r.scrollHeight; if (i >= txt.length || !p.isConnected) { clearInterval(iv); p.textContent = txt; p.classList.remove("typing"); } }, 24);
    };
    const finish = function () { clearInterval(timer); timer = null; const T = A.opTerms(id, k, a, kit, trap); A.resolve(id, k, a, kit, chosen === "push" ? { push: true, mod: T.push.mod, trap: trap } : chosen === "abort" ? { abort: true, trap: trap } : { hold: true, mod: T.hold.mod, trap: trap }); cur.id = null; };
    const choose = function (c) {
      if (chosen) return; chosen = c; FEEL.buzz(c === "abort" ? "heavy" : "tap");
      $("opask").innerHTML = '<p class="opchose">' + esc(CHOICE[c].t) + '</p>'; const Lc = voiced(k, c); say(Lc ? said(Lc) : fill(LINES[c], A, k, id), "me", c); if (Lc) speak(k, c);
      if (c === "abort") { t = Math.max(t, total * 0.9); st.abortAt = t / total; logged = 99; } // they walk back along the route; nothing more is seen at the target
    };
    const noSkip = function () { const b = $("opskip"); if (b) b.remove(); };
    const ask = function () {
      asked = true; noSkip(); FEEL.buzz("rumble"); if (window.SFX && SFX.rumble) SFX.rumble();
      $("opask").innerHTML = '<p class="oplisten">Listening\u2026</p>';
      ashSays(2, officerAsks);
    };
    const officerAsks = function () {
      if (!$("opask") || chosen) return;
      if (trap && !tellTxt) { tellTxt = fill(fresh(LINES.trap, A), A, k, id); say("\u26a0 " + tellTxt, "warn", "tell"); } // the tell, before the question and the buttons
      const La = voiced(k, "ask"); say(La ? said(La) : fill(pick(LINES.ask, A), A, k, id), "ask", "ask"); if (La) speak(k, "ask");
      // Push / Hold / Abort only appear once the officer has finished the question
      const scr = document.querySelector('[data-screen="op"]'); if (scr) scr.classList.add("asking");
      // panel 6 B4: and once the words have finished typing out on the radio (voice or not), so the buttons never land mid-sentence
      const typed = function (fn) { const done = function () { return !document.querySelector("#radio p.typing"); }; if (done()) return fn(); const iv = setInterval(function () { if (done() || !$("opask")) { clearInterval(iv); fn(); } }, 60); };
      const show = function () { typed(show2); };
      const show2 = function () { if (!$("opask") || chosen) return; ready = true; buttons(); heart(); const rd = $("radio"); if (rd) rd.scrollTop = rd.scrollHeight; const q = $("opask"); if (q && q.scrollIntoView) q.scrollIntoView({ block: "end", behavior: FEEL.reduce ? "auto" : "smooth" }); };
      if (La && window.VOICE && VOICE.after) setTimeout(function () { VOICE.after(vid(k, "ask"), show); }, 80); else setTimeout(show, fast ? 0 : 1800);
    };
    // Skip to decision: straight to the officer's question. Same op, same odds, same outcome rules.
    const skip = function () {
      if (asked || chosen) return; skipped = true; pending = false;
      if (window.VOICE && VOICE.hush) VOICE.hush();
      t = Math.ceil(total * askAt / 100) * 100; logged = 3; moveMark(t / total, st); $("opbar").style.width = (t / total * 100) + "%";
      asked = true; noSkip(); say("Skipped ahead. " + (A.AG(k).code || A.first(k)) + " is at the target.", "desk"); FEEL.buzz("rumble");
      $("opask").innerHTML = '<p class="oplisten">Listening\u2026</p>'; officerAsks();
    };
    $("opskip").onclick = skip;
    // the decision window: a heartbeat you can hear, see and feel, until you choose
    let hb = null;
    const heart = function () {
      const card = document.querySelector(".opcard"); if (card) card.classList.add("heartbeat");
      const beat = function () { if (chosen || !$("opask") || window.AH_PAUSED) return; if (window.SFX && SFX.heart) SFX.heart(1); FEEL.buzz("heart"); };
      beat(); hb = setInterval(function () { if (chosen || !$("opask")) { clearInterval(hb); const c = document.querySelector(".opcard"); if (c) c.classList.remove("heartbeat"); return; } beat(); }, 900);
    };
    const buttons = function () {
      const TD = terms(A, id, k, a, kit, trap).d;
      $("opask").innerHTML = (tellTxt ? '<p class="optell" role="note">\u26a0 <b>On the radio just now:</b> \u201c' + esc(tellTxt.replace(/^[^:]+:\s*/, "")) + "\u201d</p>" : "") + '<div class="opchoice">' + ["abort", "hold", "push"].map(function (c) { return '<button class="btn opbtn op-' + c + '" data-op="' + c + '"><b>' + CHOICE[c].t + '</b><small class="optrade">' + TD[c] + "</small></button>"; }).join("") + '<p class="opwait">The line stays open until you choose.</p>' + meansHTML() + "</div>";
      document.querySelectorAll("[data-op]").forEach(function (b) { b.onclick = function () { choose(b.getAttribute("data-op")); }; });
      bindMeans();
      MENU.coach("op", "Halfway through, your officer asks for a call. <b>Push</b> is the long shot: worse odds than Hold, but three times the gains if it works; a fail costs in full and can blow their cover (likelier when they\u2019re stressed). <b>Hold</b> has the better odds and keeps them safe (unless it\u2019s a trap); waiting costs some Service, and if it fails you lose half of what the plan risks. <b>Abort</b> brings them home safe and more loyal, but the case is lost and No.10 notices. Listen for signs of a trap. They wait for your answer.");
    };
    if (timer) clearInterval(timer);
    moveMark(0, st);
    if (gh) { const G = window.VOICE && VOICE.lines.op_ash_greyhouse; say(G ? said(G) : "Ash: For the file, Chief. The Grey House is Varenia\u2019s secret service. Our opposite number.", "desk"); if (G && !fast) VOICE.now("op_ash_greyhouse"); }
    say(line(0), "", KIND[0]); logged = 1;
    timer = setInterval(function () {
      if (!$("opbar")) { clearInterval(timer); timer = null; return; }
      if (window.AH_PAUSED || document.getElementById("coach")) return;
      if (asked && !chosen) return; // waiting for C: no clock, no default
      if (pending && !fast && (t + 100) / total >= askAt) return;
      t += 100; $("opbar").style.width = Math.min(100, t / total * 100) + "%"; moveMark(t / total, st);
      const f = t / total;
      if (!asked && f >= askAt) { ask(); return; }
      while (logged < AT.length && f >= AT[logged] && (logged !== 3 || asked)) {
        if (beats[logged] || vb[logged]) say(line(logged), "", KIND[logged]);
        if (logged === 2 && caseId(1)) { const ev = vid(k, vb[2]); pending = true; if (fast) ashSays(1); else if (ev) VOICE.after(ev, function () { ashSays(1); }); else setTimeout(function () { ashSays(1); }, 1200); }
        logged++;
      }
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
  window.OPS = { terms: terms, WORDS: WORDS, wfill: wfill, MAPS: MAPS, run: run, placeAt: placeAt, ARR: ARR, NEAR: NEAR, LINES: LINES, parts: parts, controls: controls, bind: bind, reset: reset, hours: hours };
})();
