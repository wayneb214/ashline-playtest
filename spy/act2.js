/* Albion House — Act 2: The Spymaster (Days 4–6). Everything is invented: the Varenian Republic, the Grey House,
   Colonel Kesk, the trade delegation and every person in it. Real places are only scenery.
   Day 4 "Quiet Tuesday": Kesk writes to Albion House itself; somebody showed him the address.
   Day 5 "The Swap": one of ours is held in Kessgrad; a bridge at dawn.
   Day 6 "Albion House": Kesk in London; a chase across the city; a showdown at Number 10; four endings. */
(function () {
  "use strict";
  const A = window.AH, D = A.D, S = A.S, esc = A.esc, pic = A.pic, $ = A.$, FEEL = window.FEEL;
  const FORCE = function () { return window.__SPY_FORCE__; };
  const VO = function (id, ms) { if (window.VOICE) setTimeout(function () { VOICE.play(id); }, ms || 0); };
  const clampP = function (o) { return Math.max(8, Math.min(94, Math.round(o))); };
  const roll = function (p) { const f = FORCE(); if (f) return f; const r = A.rnd() * 100; return r < p * 0.7 ? "win" : r < p ? "mixed" : "loss"; };
  const RISK = { low: "Low risk", med: "Some risk", high: "High risk" };
  D.UKPLACES.Manchester = [0.285, 0.47];
  ["manchester", "press"].forEach(function (id) { D.AGENTS.macrae.good.push(id); });
  ["watch", "recon"].forEach(function (id) { D.AGENTS.pryce.good.push(id); });
  ["find", "recon"].forEach(function (id) { D.AGENTS.hartley.good.push(id); });
  const ap = function (t, d, mod, risk, stress, win, mixed, loss) { return { t: t, d: d, mod: mod, risk: risk, stress: stress, win: win, mixed: mixed, loss: loss }; };

  // ---------- the cases ----------
  D.SITS4 = {
    watch: { kind: "officer", art: "v-york", title: "Who is watching us?", where: "Lambeth, London", place: "London", home: true, due: 12, pen: { secrecy: -8 },
      brief: "If Kesk knows this address, someone is watching the door. Find them, and what they saw.",
      approaches: [ap("A week of patience in a café window", "Tea, a newspaper, and every face that passes twice.", 10, "low", 0, { secrecy: 8, safety: 4 }, { secrecy: -2 }, { secrecy: -8 }),
        ap("Photograph everyone who stops", "A long lens from the roof. Quick, and a little obvious.", 4, "med", 1, { secrecy: 6 }, { secrecy: -4 }, { secrecy: -10, trust: -4 }),
        ap("Walk up and ask him the time", "Rattle him and see where he runs.", 0, "high", 2, { secrecy: 4, capital: 4 }, { trust: -4 }, { safety: -8, secrecy: -8 })],
      head: { win: "Quiet week on the Albert Embankment", mixed: "Photographer seen on Lambeth rooftop", loss: "Scuffle outside government building in Lambeth" } },
    manchester: { kind: "officer", art: "v-manchester", title: "The trade delegation", where: "Manchester", place: "Manchester", due: 15, pen: { capital: -8 },
      brief: "A Varenian trade delegation is in Manchester to sign a deal the Chancellor wants. One interpreter is Grey House. Find who he meets, and don't spoil the deal.",
      approaches: [ap("A seat at the hotel bar", "One of ours, a good book and the next table.", 8, "low", 0, { secrecy: 6, capital: 4 }, { secrecy: -2 }, { capital: -6 }),
        ap("Join the delegation as a translator", "Paperwork through the Board of Trade. Close, and on the record.", 6, "med", 1, { capital: 8, secrecy: 2 }, { capital: -4 }, { capital: -12, trust: -4 }),
        ap("Search his room during the dinner", "Twenty minutes and a borrowed key card.", 0, "high", 2, { secrecy: 8, capital: 2 }, { capital: -6 }, { capital: -14, trust: -6 })],
      head: { win: "Manchester trade talks \u2018cordial\u2019", mixed: "Varenian delegation complains about hotel \u2018noise\u2019", loss: "Varenian delegation walks out of Manchester talks" } },
    leak: { kind: "leak", title: "Who showed him the door?", where: "Albion House", place: "London", home: true, due: 20, pen: { secrecy: -10 },
      head: { win: "Albion House: \u2018no changes to security\u2019", mixed: "Whitehall reviews building passes", loss: "Spy agency address \u2018common knowledge\u2019, says MP" } }
  };
  D.SITS5 = {
    recon: { kind: "officer", art: "v-bridge", title: "Walk the bridge", where: "The Vell bridge, Varenian border", place: "Varenia", due: 13, pen: { safety: -8 },
      brief: "Kesk has picked an old iron bridge over the River Vell, on the Varenian border. Walk it before tomorrow\u2019s dawn and count the cars.",
      approaches: [ap("Birdwatchers on the far bank", "Binoculars, flasks and a very dull afternoon.", 10, "low", 0, { safety: 6, secrecy: 4 }, { safety: -2 }, { safety: -8 }),
        ap("A charity cycle ride across it", "A dozen British cyclists in matching shirts. One of them is counting.", 4, "med", 1, { safety: 4, trust: 4 }, { trust: -2 }, { safety: -6, trust: -6 }),
        ap("Under the bridge in a canoe", "Look at the girders, the mines, the boats. Wet and bold.", 0, "high", 2, { safety: 10 }, { safety: -4 }, { safety: -12 })],
      head: { win: "Tourists enjoy quiet day on the Vell", mixed: "Varenian border guards stop British cyclists", loss: "\u2018Canoeist\u2019 held near Varenian border" } },
    press: { kind: "officer", title: "Keep it off the front page", where: "Fleet Street, London", place: "London", home: true, due: 16, pen: { capital: -10 },
      brief: "The Evening Bugle knows a British officer is held in Kessgrad. If it runs the name tonight, the swap is off. Talk the editor down, or out-run him.",
      approaches: [ap("Lunch with the editor", "Old friends, a long lunch, and a promise of the full story in thirty years.", 8, "low", 0, { capital: 6, trust: 4 }, { capital: -2 }, { capital: -8 }),
        ap("A formal request from the Cabinet Office", "Polite, official, and copied to his lawyers.", 6, "med", 1, { capital: 8 }, { trust: -4 }, { capital: -10, trust: -6 }),
        ap("Feed him a bigger story", "A juicy rumour about a minister\u2019s dog. True, mostly.", 0, "high", 2, { capital: 4, secrecy: 6 }, { trust: -6 }, { trust: -10, capital: -8 })],
      head: { win: "Bugle: \u2018no comment\u2019 on Varenia rumours", mixed: "\u2018Briton held in Kessgrad\u2019, claims rival paper", loss: "BRITISH SPY HELD IN KESSGRAD, Bugle reveals" } },
    swap: { kind: "swap", title: "The bridge at dawn", where: "The Vell bridge, Varenian border", place: "Varenia", label: "To the bridge \u203a", due: 23, flash: true, pen: { safety: -12 },
      head: { win: "Quiet dawn on the Vell bridge", mixed: "Varenia releases one Briton \u2018as a gesture\u2019", loss: "Varenia: British \u2018spy\u2019 to stand trial" } }
  };
  D.SITS6 = {
    find: { kind: "officer", art: "v-london", title: "Find Kesk", where: "Somewhere in London", place: "London", home: true, due: 12, pen: { secrecy: -8 },
      brief: "Kesk landed an hour ago on a passport that says he sells tractors. He has a hotel, a driver and a day of meetings. Find where he sleeps.",
      approaches: [ap("Check every taxi rank and hotel desk", "Slow, patient legwork with a photograph.", 10, "low", 0, { secrecy: 8 }, { secrecy: -2 }, { secrecy: -8 }),
        ap("Ask the airport police for the CCTV", "Quick, but it goes through a lot of hands.", 6, "med", 1, { secrecy: 4, capital: 4 }, { capital: -4 }, { capital: -8, secrecy: -6 }),
        ap("Follow his driver from the airport", "Fast, close, and he may notice.", 0, "high", 2, { secrecy: 10 }, { safety: -4 }, { safety: -10, secrecy: -8 })],
      head: { win: "Tractor salesman enjoys London stay", mixed: "Foreign visitor \u2018followed\u2019 from airport, says driver", loss: "Varenian businessman complains of \u2018harassment\u2019" } },
    chase: { kind: "chase", title: "Across London", where: "London", place: "London", home: true, due: 18, pen: { secrecy: -12 },
      head: { win: "Varenian visitor \u2018missed his flight\u2019", mixed: "Rush-hour chaos on the river bus", loss: "Foreign diplomat \u2018slipped police net\u2019, say sources" } },
    showdown: { kind: "showdown", title: "Downing Street", where: "10 Downing Street", place: "London", home: true, label: "To No.10 \u203a", due: 23, flash: true, pen: { capital: -16 },
      head: { win: "Varenian diplomat leaves London \u2018at short notice\u2019", mixed: "No.10 \u2018aware\u2019 of Varenian visitor", loss: "Ministers \u2018not told\u2019 of spy in Westminster" } }
  };
  const ORDER = { 4: ["watch", "manchester", "leak"], 5: ["recon", "press", "swap"], 6: ["find", "chase", "showdown"] };
  const NAMEOF = { 4: "Quiet Tuesday", 5: "The Swap", 6: "Albion House" };
  const DAYWORD = { 4: "Tuesday", 5: "Wednesday", 6: "Thursday" };
  function cases(d) { return d === 6 ? D.SITS6 : d === 5 ? D.SITS5 : D.SITS4; }

  // ---------- flags from Act 1 ----------
  const days = function () { return S().days || {}; };
  function flags() {
    const d = days(), d1 = d[1] || {}, d2 = d[2] || {}, d3 = d[3] || {};
    return { clerk: !!d1.defector, caught: !!d1.caught || A.moleCaught(), tall: d2.exit === "win", end3: d3.end || "loss" };
  }
  const k3 = function () { return window.AH3; };
  const fav = function () { return k3().fav(); };
  const keskHit = function () { return S().leaked ? 18 : 12; };
  function keskMod(risk) { return fav() && risk === fav() ? -keskHit() : 0; }
  function oddsMod(id, k, a) {
    const s = S(); let o = keskMod(a.risk);
    if (s.day === 4 && id === "manchester" && s.cons && s.cons.hale4 === "careful" && a.risk === "high") o -= 10;
    if (s.day === 5 && s.leakCaught && id === "press") o += 6;
    if (s.day === 6 && id === "find" && s.done5 === "win") o += 8;
    return o;
  }
  // the officer held on Day 5: whoever you have sent out most
  function mostSent(s) {
    const sent = s.sent || {}, xp = s.xp || {};
    return s.roster.slice().sort(function (x, y) { return ((sent[y] || 0) * 10 + (xp[y] || 0)) - ((sent[x] || 0) * 10 + (xp[x] || 0)); })[0];
  }
  function prep(n) {
    if (n.day === 4) { n.leakWho = pickLeak(n); n.clues4 = {}; }
    if (n.day === 5) { n.held = mostSent(n); if (n.held) n.used[n.held] = true; }
    if (n.day === 6) { const sw = n.days[5] && n.days[5].swap; n.heldAway = !!(n.held && sw === "loss" && n.roster.indexOf(n.held) >= 0); if (n.heldAway) n.used[n.held] = true; }
  }
  function record(s) {
    if (s.day === 3) return { end: k3() ? (s.deal === "deal" ? "traded" : s.done.exfil || "loss") : "loss" };
    if (s.day === 4) return { leak: s.done.leak || "loss" };
    if (s.day === 5) return { swap: s.done.swap || "loss", how: s.swapHow || null };
    if (s.day === 6) return { end: ending() };
    return {};
  }

  // ---------- Kesk's letters (with hidden ink on Day 4) ----------
  D.INK4 = { clue: "Hidden ink: the address was copied at night", t: "It was not a spy who showed me your door, C. It was a clock. Ask who signs in after midnight. \u2014 a friend" };
  window.DESK.INK.kesk4 = D.INK4;
  function keskLetter(id, body, ink, then) {
    VO(id); if (window.SFX) SFX.tele();
    A.render('<div class="kletter card" id="kletter"><div class="kl-top"><img class="portrait" src="' + pic("kesk") + '" alt="Colonel Kesk"><div><div class="kl-from">From the desk of</div><div class="kl-name">Colonel Anselm Kesk</div><div class="kl-role">Director \u00b7 the Grey House</div></div></div>' +
      '<div class="kl-body"><p>My dear C,</p><p>' + body + "</p>" + (ink ? window.DESK.inkHTML(ink) : "") + '<p class="kl-sig">K.</p></div>' +
      '<p class="kl-note">Hand-delivered. ' + (ink ? "The paper smells faintly of lemons." : "No fingerprints.") + "</p></div>" + (ink ? window.DESK.lampHTML(ink) : "") + '<button class="btn primary" id="go">Into the burn bag</button>', ink ? "Some ink only shows when the paper is warm." : "Kesk is enjoying himself.");
    if (ink) window.DESK.ink($("kletter"), ink, function () { const s = S(); s.clues4 = s.clues4 || {}; s.clues4.ink = true; A.save("briefing"); });
    $("go").onclick = function () { FEEL.tearThen($("kletter"), then || A.briefing); };
  }

  // ---------- the leak (Day 4) ----------
  const PORTER = "porter";
  function suspects(s) { return s.roster.slice(0, 3).concat([PORTER]); }
  function pickLeak(n) { const L = n.roster.slice(0, 3).concat([PORTER]); return L[Math.floor(A.rnd() * L.length)]; }
  const nm = function (k) { return k === PORTER ? "Dennis Barlow, the night porter" : A.first(k); };
  // three clues; each clears one innocent person. Lost cases give no clue.
  function clueList() {
    const s = S(), inno = suspects(s).filter(function (k) { return k !== s.leakWho; }), c = s.clues4 || {}, out = [];
    const why = ["was in Manchester the night the address was copied", "was on leave and has the boarding passes to prove it", "never signs in after midnight, the logbook says so"];
    if (s.done.watch && s.done.watch !== "loss") out.push("From the watcher in the caf\u00e9: <b>" + esc(nm(inno[0])) + "</b> " + why[0] + ".");
    if (s.done.manchester && s.done.manchester !== "loss") out.push("From the Manchester hotel: <b>" + esc(nm(inno[1])) + "</b> " + why[1] + ".");
    if (c.ink) out.push("From the hidden ink: <b>" + esc(nm(inno[2])) + "</b> " + why[2] + ".");
    else if (c.faces) out.push("From the caf\u00e9 photos: <b>" + esc(nm(inno[2])) + "</b> " + why[2] + ".");
    return out;
  }
  function cleared() {
    const s = S(), inno = suspects(s).filter(function (k) { return k !== s.leakWho; }), c = s.clues4 || {}, out = {};
    if (s.done.watch && s.done.watch !== "loss") out[inno[0]] = 1;
    if (s.done.manchester && s.done.manchester !== "loss") out[inno[1]] = 1;
    if (c.ink || c.faces) out[inno[2]] = 1;
    return out;
  }
  function leakCase() {
    const s = S(), c = cases(4).leak; let sel = null;
    const draw = function () {
      const cl = clueList(), clr = cleared();
      const cards = suspects(s).map(function (k) {
        if (clr[k]) return '<button class="card appr locked" disabled><div class="t">\u2713 ' + esc(nm(k)) + '</div><p style="margin:0">Cleared. The evidence puts them elsewhere.</p></button>';
        if (k === PORTER) return '<button class="card appr' + (sel === k ? " sel" : "") + '" data-m="' + k + '"><div class="t">Dennis Barlow \u00b7 night porter</div><p style="margin:0">Twenty years on the front desk. Signs everyone in after midnight.</p></button>';
        return A.agentCard(k, "", sel === k, false, "data-m");
      }).join("");
      A.render('<div class="card dossier"><div class="chead"><img src="img/h-letter.jpg" alt=""></div>' + A.LH + '<span class="stamp corner">EYES ONLY</span><div class="kicker">Albion House \u00b7 by ' + A.hh(A.dueOf("leak")) + '</div><h2 style="margin-top:8px;padding-right:110px">' + c.title + "</h2>" +
        "<p>Kesk\u2019s letter came to <b>this building</b>. Our address is on no list. Somebody here saw it written down and passed it on, carelessly or not. It isn\u2019t treason yet. It will be, if we don\u2019t stop it.</p>" +
        '<p class="clue"><b>What we know (' + cl.length + " of 3):</b><br>" + (cl.length ? cl.join("<br>") : "Nothing yet. The caf\u00e9 watch, the Manchester job, and the hidden ink or the caf\u00e9 photos can each clear somebody.") + "</p></div>" +
        (window.VOICE ? (VOICE.once(cl.length >= 3 ? "ash_leak4_three" : "ash_leak4_wait"), "") : "") + A.ash(cl.length >= 3 ? "Three people cleared, Chief. That leaves one." : "We can guess now, or wait for more. A wrong name costs us a good officer\u2019s trust.", cl.length < 3) +
        '<div class="kicker" style="margin:4px 0 8px">Who saw the address first? (takes 1 hour)</div><div class="agents">' + cards + "</div>" +
        '<div class="sticky-go"><button class="btn primary" id="go"' + (sel ? "" : " disabled") + ">" + (sel ? "Name " + esc(nm(sel).split(",")[0]) : "Choose someone") + '</button></div><button class="btn ghost" id="back">Back to the brief</button>', "Each clue clears one person.");
      document.querySelectorAll("[data-m]").forEach(function (b) { b.onclick = function () { sel = b.getAttribute("data-m"); draw(); }; });
      $("go").onclick = function () { decide(sel); };
      $("back").onclick = A.briefing;
    };
    const decide = function (who) {
      A.advance(1);
      let res, ch, body;
      if (who === s.leakWho) {
        res = "win"; s.leakCaught = true; s.leaked = false; ch = A.apply({ secrecy: 12, service: 4 });
        body = who === PORTER ? "Dennis goes white, then tells you everything. A nice man from a \u2018visitors\u2019 society\u2019 bought him a pint every Friday and asked about the building. <b>He never knew. The leak is closed, and Kesk\u2019s counters lose their edge.</b>"
          : A.first(who) + " goes very quiet, then admits it: the address, scribbled on a café napkin in Manchester, left on the table. <b>Careless, not treacherous. The leak is closed, and Kesk\u2019s counters lose their edge.</b>";
        if (who !== PORTER) s.loyal[who] = A.clamp5(s.loyal[who] - 1);
      } else {
        res = "loss"; ch = A.apply({ secrecy: -8, trust: -4 });
        if (who !== PORTER) { s.loyal[who] = A.clamp5(s.loyal[who] - 2); s.stress[who] = A.clamp5(s.stress[who] + 1); }
        body = esc(nm(who)) + " was nowhere near it, and everybody on the floor knows you thought they were. <b>Whoever really did it is still talking.</b>";
        s.leaked = true;
      }
      if (window.FUN && res === "win") FUN.unlock("leak");
      A.finishCase("leak", res, who === PORTER ? null : who, "Named " + nm(who).split(",")[0], c.head[res], ch, res === "win" ? "FOUND" : "WRONG", body,
        who !== PORTER ? '<div class="ohead">' + A.face(who, res === "loss" ? "tense" : "") + "</div>" : '<div class="kbwrap"><img class="vignette" src="img/h-letter.jpg" alt=""></div>', res === "win" ? "The building is quiet again." : "The leak goes on.");
    };
    draw();
  }

  // ---------- the swap (Day 5) ----------
  function chips() {
    const f = flags(), s = S(), list = [];
    if (f.tall && !s.chipUsed) list.push({ k: "tall", t: "The tall man from Harwich", d: "Kesk\u2019s officer, in a cell in Essex since Thursday. Kesk wants him back badly.", v: 30 });
    if (f.clerk) list.push({ k: "clerk", t: "What the Vienna clerk knows", d: "Names inside the Grey House. Kesk would rather they stayed unspoken.", v: 15 });
    if (f.end3 === "win" || f.end3 === "mixed") list.push({ k: "linden", t: "LINDEN\u2019s eleven years of notes", d: "We could hand back a few pages. She would hate it.", v: 15 });
    if (f.caught) list.push({ k: "mole", t: "Our mole, in a cell", d: "He was Kesk\u2019s man. Kesk owes him a rescue.", v: 10 });
    return list;
  }
  function swapHelps() {
    const s = S(), out = [];
    if (s.done.recon) out.push({ win: ["You walked the bridge", 12], mixed: ["Half a picture of the bridge", 4], loss: ["Never saw the bridge", -10] }[s.done.recon]);
    if (s.done.press) out.push({ win: ["Nothing in the papers", 8], mixed: ["A rumour in a rival paper", 0], loss: ["It\u2019s on the front page", -15] }[s.done.press]);
    if (A.late("swap")) out.push(["Late", -(10 + A.late("swap") * 5)]);
    if (s.crunch && s.crunch[5] && s.crunch[5].sensible) out.push(["The duty team kept the family safe", 6]);
    const pf = (s.minis || {}).proof; if (pf) out.push({ win: ["Kesk\u2019s postcard decoded", 8], mixed: ["Half the postcard decoded", 3], loss: ["The postcard went unread", 0] }[pf]);
    return out.filter(function (x) { return x[1]; });
  }
  const sum = function (l) { return l.reduce(function (t, x) { return t + x[1]; }, 0); };
  // the finales wait for their hour: the bridge is at dawn (the night passes), Downing Street is in the evening
  const LOCK = { 5: { id: "swap", before: ["recon", "press"], why: "at dawn, after the day\u2019s work" }, 6: { id: "showdown", before: ["find", "chase"], why: "this evening, once he\u2019s found" } };
  function locked(id) {
    const s = S(), L = LOCK[s.day]; if (!L || L.id !== id || s.done[id]) return false;
    const open = L.before.filter(function (x) { return !s.done[x]; });
    if (!open.length || s.hour >= 20) return false;
    return !open.every(function (x) { return x !== "chase" && !A.freeAgents().length; });
  }
  function lockWhy(id) { return LOCK[S().day].why; }
  function dawnClock() { const c = document.getElementById("clock"); if (c) { c.textContent = "05:40"; const b = c.parentNode, sm = b.querySelector("small"); b.classList.remove("warn", "late"); if (sm) sm.textContent = "Dawn"; } }
  function swap() {
    const s = S(), who = s.held;
    if (!s.bridgeSeen) { s.bridgeSeen = true; A.save("briefing"); if (CINE.maybe("bridge", swap)) return; }
    let sel = null, chip = null;
    const ch = chips(), helps = swapHelps(), base = A.diff().odds + sum(helps) + (A.svc() - 50) / 4;
    const OPTS = [
      { k: "trade", t: "Trade", d: "Give Kesk something real. Ours walks across, his walks back. Clean, and it costs us.", risk: "low", need: "chip", odds: function () { return clampP(58 + base + (chip ? chip.v : 0)); } },
      { k: "bluff", t: "Bluff", d: "Bring an empty car and a confident face. Tell him we have more than we do.", risk: "med", odds: function () { return clampP(34 + base + Math.min(30, ch.length * 10) + keskMod("med")); } },
      { k: "rescue", t: "Rescue", d: "While everyone watches the bridge, a team takes ours from the car. Fast, and loud if it goes wrong.", risk: "high", pm: 45, odds: function () { return clampP(40 + base + keskMod("high")); } }];
    const draw = function () {
      A.render('<div class="card dossier exfil"><div class="chead"><img src="img/h-bridge.jpg" alt="An iron bridge over a river at dawn, two cars facing each other"></div>' + A.LH + '<span class="stamp corner">DAWN</span><div class="kicker">The Vell bridge \u00b7 05:40 \u00b7 Thursday, first light</div><h2 style="margin-top:8px;padding-right:110px">The bridge at dawn</h2>' +
        "<p>Mist on the River Vell. Two cars, one at each end. In the back of Kesk\u2019s, <b>" + (who ? esc(A.AG(who).name) : "our officer") + "</b>. Kesk stands by the bonnet with a flask of coffee, as if this were a picnic.</p>" +
        (helps.length ? '<div class="chips helps">' + helps.map(function (h) { return '<span class="chip ' + (h[1] > 0 ? "risk-low" : "risk-high") + '">' + esc(h[0]) + " " + (h[1] > 0 ? "+" : "\u2212") + Math.abs(h[1]) + "%</span>"; }).join("") + "</div>" : "") + "</div>" +
        '<div class="kicker" style="margin:6px 0">What we can bargain with</div>' + (ch.length ? ch.map(function (c) { return '<button class="card appr chipcard' + (chip === c ? " sel" : "") + '" data-chip="' + c.k + '"><div class="t">' + esc(c.t) + '</div><p style="margin:0">' + esc(c.d) + '</p><div class="chips"><span class="chip risk-low">+' + c.v + "% if traded</span></div></button>"; }).join("") : '<p class="warn-t">Nothing. Days 1 to 3 left us with empty hands: no tall man, no clerk, no LINDEN.</p>') +
        '<div class="kicker" style="margin:6px 0">How do you play it?</div>' + OPTS.map(function (o, i) {
          const locked = (o.need === "chip" && !chip) || (o.pm && s.meters.capital < o.pm);
          return '<button class="card appr' + (sel === i ? " sel" : "") + (locked ? " locked" : "") + '" data-i="' + i + '"' + (locked ? " disabled" : "") + '><div class="t">' + (locked ? "\ud83d\udd12 " : "") + o.t + '</div><p style="margin:0">' + o.d + '</p><div class="chips">' +
            (locked ? '<span class="chip risk-high">' + (o.need === "chip" ? (ch.length ? "Pick something to trade first" : "Nothing to trade") : "No.10 won\u2019t sign off \u00b7 needs No.10 trust " + o.pm + " (now " + s.meters.capital + "/100)") + "</span>"
              : '<span class="chip odds">' + o.odds() + '% chance</span><span class="chip risk-' + o.risk + '">' + RISK[o.risk] + "</span>" + (keskMod(o.risk) ? '<span class="chip kesk">Kesk expects this</span>' : "")) + "</div></button>";
        }).join("") +
        '<div class="sticky-go"><button class="btn primary" id="go"' + (sel == null ? " disabled" : "") + ">" + (sel == null ? "Decide" : "Walk onto the bridge") + '</button></div><button class="btn ghost" id="back">Not yet</button>', "Trading costs a chip. Bluffing works better the more you hold.");
      document.querySelectorAll("[data-chip]").forEach(function (b) { b.onclick = function () { chip = ch.filter(function (c) { return c.k === b.getAttribute("data-chip"); })[0]; draw(); }; });
      document.querySelectorAll("[data-i]").forEach(function (b) { b.onclick = function () { sel = +b.getAttribute("data-i"); draw(); }; });
      $("back").onclick = A.briefing;
      $("go").onclick = function () { finish(OPTS[sel]); };
      dawnClock();
    };
    const finish = function (o) {
      if (s.done.swap) return;
      const p = o.odds(), res = roll(p);
      s.styles = s.styles || { low: 0, med: 0, high: 0 }; s.styles[o.risk]++;
      s.swapHow = o.k; A.advance(24);
      let delta = { win: { safety: 12, service: 8, capital: 6 }, mixed: { safety: 4, capital: -4 }, loss: { safety: -14, capital: -10, service: -6 } }[res];
      if (o.k === "trade") { s.chipUsed = chip.k; delta = Object.assign({}, delta); delta.secrecy = (delta.secrecy || 0) - 6; }
      if (o.k === "rescue" && res === "loss") { delta = Object.assign({}, delta); delta.capital -= 6; }
      const c = A.apply(delta), n = who ? A.first(who) : "our officer";
      if (who && res !== "loss") { delete s.used[who]; s.loyal[who] = A.clamp5(s.loyal[who] + 1); s.stress[who] = A.clamp5(s.stress[who] + 1); VO("op_" + who + "_freed", 900); }
      if (window.FUN && res === "win") FUN.unlock("bridge");
      const body = {
        trade: { win: n + " walks across the bridge in a borrowed coat. Halfway, " + n + " passes " + esc(chip ? chip.t.toLowerCase() : "") + " going the other way. Neither looks back. <b>Home.</b>", mixed: n + " is home, but Kesk took more than we offered: a second name, quietly, on the way out.", loss: "Kesk takes the trade, then keeps " + n + " anyway. \u201cA misunderstanding,\u201d he calls across the water." },
        bluff: { win: "You talk for four minutes. Kesk laughs, once, and waves " + n + " across. <b>\u201cYou are a terrible liar, C. I enjoyed it.\u201d</b>", mixed: n + " is released, \u2018as a gesture\u2019. Kesk knows you had nothing. He will remember.", loss: "Kesk listens politely, then gets back in his car. The car with " + n + " in it turns round." },
        rescue: { win: "Smoke on the far bank, a door open, two of ours running. " + n + " is in our car before Kesk has put his coffee down. <b>Nobody is hurt.</b>", mixed: n + " is out, but a border guard filmed it on his phone. Kessgrad will make a noise.", loss: "The far bank was waiting for us. Our team pulls back without " + n + ". Nobody is hurt, and nobody is home." }
      }[o.k][res];
      A.finishCase("swap", res, null, { trade: "Traded " + (chip ? chip.t.toLowerCase() : ""), bluff: "Bluffed with " + ch.length + " card" + (ch.length === 1 ? "" : "s"), rescue: "A rescue on the bridge" }[o.k], cases(5).swap.head[res], c, { win: "HOME", mixed: "OUT", loss: "HELD" }[res], body,
        '<div class="kbwrap"><img class="vignette" src="' + pic(res === "loss" ? "v-loss" : "v-bridge") + '" alt=""></div>', res === "loss" ? n + " stays in Kessgrad." : n + " is coming home.");
    };
    draw();
  }

  // ---------- the chase (Day 6): four legs, four people, one call too many ----------
  const LEGS = [
    { key: "tube", t: "The Tube at Westminster", d: "Kesk goes underground. Rush hour, six platforms, two lines.", best: "pryce", img: "tail-street" },
    { key: "market", t: "Borough Market", d: "He cuts through the market crowd. A watcher could lose him behind a cheese stall.", best: "macrae", img: "tail-street" },
    { key: "river", t: "The river bus", d: "He boards at Bankside. Someone has to be on that boat, or on the next pier first.", best: "hartley", img: "v-london" },
    { key: "street", t: "The last streets to Whitehall", d: "Three corners from Downing Street. It has to be you, C: Kesk knows every face but yours.", c: true, img: "tail-street" }];
  function chase() {
    const s = S(), X = { leg: 0, score: 0, used: {}, notes: [], call: false };
    const people = function () { return s.roster.filter(function (k) { return !(s.heldAway && k === s.held); }).slice(0, 3); };
    const legOdds = function (leg, k) {
      if (!k) return 0; if (k === "ash") return clampP(40 + A.diff().odds);
      const a = A.AG(k); return clampP(44 + a.skill * 5 + A.diff().odds - s.stress[k] * 4 + (s.loyal[k] - 3) * 3 + (leg.best === k ? 15 : 0) + (s.done.find === "win" ? 8 : s.done.find === "loss" ? -8 : 0) + (A.svc() - 50) / 5);
    };
    const step = function () {
      if (X.leg === 2 && !X.call) return twoCalls();
      if (X.leg >= LEGS.length) return finish();
      const leg = LEGS[X.leg];
      if (leg.c) return lanes(leg);
      const free = people().filter(function (k) { return !X.used[k]; });
      let sel = null;
      const draw = function () {
        A.render('<div class="step x4">' + LEGS.map(function (z, j) { return '<i class="' + (j <= X.leg ? "on" : "") + '"></i>'; }).join("") + '</div><div class="card dossier exfil"><div class="chead"><img src="img/h-london.jpg" alt=""></div>' + A.LH + '<span class="stamp corner">LEG ' + (X.leg + 1) + '</span><div class="kicker">Across London \u00b7 ' + A.hh(s.hour) + '</div><h2 style="margin-top:8px;padding-right:110px">' + leg.t + "</h2><p>" + leg.d + "</p></div>" +
          '<div class="kicker" data-avoid style="margin:6px 0">Who takes this leg? Each person runs once.</div><div class="agents">' + free.map(function (k) {
            return A.agentCard(k, '<div class="fit' + (leg.best === k ? "" : " meh") + '">' + legOdds(leg, k) + "% to keep him in sight" + (leg.best === k ? " \u00b7 \u2713 their kind of ground" : "") + "</div>", sel === k, false, "data-p");
          }).join("") + (free.length ? "" : '<button class="card appr' + (sel === "ash" ? " sel" : "") + '" data-p="ash"><div class="t">Ash goes herself</div><p style="margin:0">' + legOdds(leg, "ash") + "% \u00b7 Ash hasn\u2019t run for a bus since 1987.</p></button>") + "</div>" +
          '<div class="sticky-go"><button class="btn primary" id="go"' + (sel ? "" : " disabled") + ">" + (sel ? "Go" : "Choose who") + "</button></div>", "Put each person on the ground that suits them.");
        document.querySelectorAll("[data-p]").forEach(function (b) { b.onclick = function () { sel = b.getAttribute("data-p"); draw(); }; });
        $("go").onclick = function () {
          const p = legOdds(leg, sel), f = FORCE(); const ok = f ? f !== "loss" : A.rnd() * 100 < p;
          X.used[sel] = true; if (sel !== "ash") s.stress[sel] = A.clamp5(s.stress[sel] + 1);
          if (ok) X.score += 2; A.advance(1);
          const n = sel === "ash" ? "Ash" : A.AG(sel).code || A.first(sel);
          X.notes.push(n + (ok ? " kept him" : " lost him") + " at " + leg.t.replace(/^The /, "the "));
          if (window.VOICE && sel !== "ash") VOICE.play("op_" + sel + "_" + (ok ? "eyes" : "lost"));
          A.render('<div class="card outcome ' + (ok ? "win" : "loss") + '"><span class="stamp thud">' + (ok ? "IN SIGHT" : "LOST HIM") + '</span><div class="kbwrap"><img class="vignette" src="' + pic(leg.img) + '" alt=""></div><h2>' + leg.t + "</h2><p>" + (ok ? n + " stays twenty yards behind the grey coat and never once looks at it." : n + " loses the grey coat in the crowd. Ash finds him again on a camera, two minutes later. <b>Two minutes we didn\u2019t have.</b>") + '</p><p class="oddsline">' + p + "% odds \u00b7 " + A.hh(s.hour) + '</p></div><button class="btn primary" id="go">Next leg</button>', "Every leg counts.");
          $("go").onclick = function () { X.leg++; step(); };
        };
      };
      draw();
    };
    // two calls at once, mid-chase
    const twoCalls = function () {
      X.call = true;
      A.render('<div data-screen="twocalls" data-music="tense"><div class="card dossier"><div class="kicker">' + A.hh(s.hour) + " \u00b7 mid-chase \u00b7 two calls at once</div><h2>Both lines, both urgent</h2>" +
        (window.VOICE ? (VOICE.once("ash_a2_lines"), "") : "") + A.ash("Chief, the Foreign Secretary is on one line and the river police are on the other. I can put you through to <b>one</b>.", true) +
        '<div class="crunch"><button class="card dossier crunchf" data-c="fs"><span class="urg">URGENT</span><div class="t">The Foreign Secretary</div><div class="s">She wants to know why there are men running across Southwark. Answer and No.10 stays calm.</div></button><div class="or">or</div>' +
        '<button class="card dossier crunchf" data-c="river"><span class="urg">URGENT</span><div class="t">The river police</div><div class="s">They can hold the river bus at the next pier for three minutes. Nobody else will ask them.</div></button></div></div></div>', "The one you don\u2019t take goes worse.");
      if (window.SFX) SFX.tele(); FEEL.buzz("ring");
      document.querySelectorAll("[data-c]").forEach(function (b) { b.onclick = function () {
        const k = b.getAttribute("data-c"); X.callPick = k;
        const c = k === "fs" ? A.apply({ capital: 6 }) : A.apply({ capital: -6 }); if (k === "river") X.score += 1;
        A.meters(c); A.save("briefing"); step();
      }; });
    };
    // the last leg: C on foot, three corners
    const lanes = function (leg) {
      let i = 0, heat = 0, busy = false, timer = null; const hist = [];
      const limit = FEEL.reduce ? 0 : ({ easy: 4200, standard: 3000, hard: 2200 }[s.diff] || 3000);
      const corner = function () {
        const w = Math.floor(A.rnd() * 3); let b = Math.floor(A.rnd() * 2); if (b >= w) b++;
        const cur = { w: w, b: b, safe: 3 - w - b }; window.__TAIL__ = cur; busy = false;
        let html = ""; for (let L = 0; L < 3; L++) html += '<button class="lane" data-l="' + L + '"><span class="arr">' + ["\u25c0", "\u25b2", "\u25b6"][L] + '</span><span class="ln">' + ["Left", "Straight on", "Right"][L] + '</span><span class="what ' + (L === w ? "watch" : L === b ? "dead" : "clear") + '">' + (L === w ? "\ud83d\udc41 Kesk\u2019s driver, engine running" : L === b ? "\u26d4 A police cordon" : "Rain, and the grey coat ahead") + "</span></button>";
        A.render('<div class="tailgame" id="tailgame"><div class="tg-top"><span>' + leg.t + '</span></div>' + (window.AH3 && AH3.tgTrack ? AH3.tgTrack(3, i, hist, heat, 6) : "") + (limit ? '<div class="tg-timer"><i id="tgbar"></i></div>' : '<div class="tg-timer still"><i></i></div>') + '<div class="tg-lanes">' + html + '</div><div class="tg-msg" id="tgmsg">Stay on him. Pick the clear street.</div></div>', "Pick the clear street before the bar runs out.");
        document.querySelectorAll("[data-l]").forEach(function (b2) { b2.onclick = function () { pick(+b2.getAttribute("data-l"), cur); }; });
        if (limit) { const bar = $("tgbar"); requestAnimationFrame(function () { bar.style.transitionDuration = limit + "ms"; bar.classList.add("run"); }); timer = setTimeout(function () { pick(-1, cur); }, limit); }
      };
      const pick = function (L, cur) {
        if (busy || !$("tailgame")) return; busy = true; clearTimeout(timer);
        const ok = L === cur.safe; if (!ok) heat += L === cur.w ? 2 : 1; hist.push(ok ? "ok" : L === cur.w ? "watch" : L === cur.b ? "dead" : "slow");
        const m = $("tgmsg"); m.textContent = ok ? "Clear. The grey coat turns into Whitehall." : "Wrong turn. You double back."; m.className = "tg-msg " + (ok ? "ok" : "bad"); FEEL.buzz(ok ? "tap" : "loss");
        setTimeout(function () { i++; if (i >= 3) { window.__TAIL__ = null; A.advance(1); X.score += heat <= 1 ? 2 : heat <= 3 ? 1 : 0; X.notes.push("C on foot, heat " + heat); X.leg++; step(); } else corner(); }, FEEL.reduce || window.__SPY_FAST__ ? 150 : 650);
      };
      corner();
    };
    const finish = function () {
      const res = X.score >= 7 ? "win" : X.score >= 4 ? "mixed" : "loss";
      const c = A.apply({ win: { secrecy: 10, service: 6 }, mixed: { secrecy: -2 }, loss: { secrecy: -12, capital: -6 } }[res]);
      s.chase = { score: X.score, call: X.callPick };
      const body = { win: "Kesk walks into Whitehall believing he is alone. <b>He is not.</b> Every door he might use tonight has one of ours beside it.", mixed: "We have him, mostly. He knows somebody was behind him on the river.", loss: "He shook us at the river. Somewhere in Westminster, Kesk is drinking tea, and we don\u2019t know where." }[res];
      A.finishCase("chase", res, null, X.notes.join("; "), cases(6).chase.head[res], c, { win: "IN SIGHT", mixed: "CLOSE", loss: "LOST" }[res], body, '<div class="kbwrap"><img class="vignette" src="' + pic("v-london") + '" alt=""></div>', "Score " + X.score + " of 9.");
    };
    if (!people().length) X.leg = 0;
    step();
  }

  // ---------- the showdown (Day 6) ----------
  function showdown() {
    const s = S(); let sel = null;
    if (s.hour < 18) { A.advance(18 - s.hour); A.save("briefing"); A.meters(); }
    const OPTS = [
      { k: "quiet", t: "Have him put on the morning plane", d: "Quietly declared unwelcome. No arrest, no cameras. He goes home, and he knows we won.", risk: "low", mod: 10 },
      { k: "turn", t: "Offer him a deal: work for us", d: "The boldest thing you will ever say to a man. If he says yes, the Grey House is ours.", risk: "high", mod: -10 },
      { k: "public", t: "Arrest him on the steps of No.10", d: "Cameras, handcuffs, a show for the House. Hale gets her headline.", risk: "med", mod: 0, pm: 40 }];
    const odds = function (o) { return clampP(46 + o.mod + A.diff().odds + ({ win: 14, mixed: 4, loss: -12 }[s.done.chase] || 0) + (s.done.find === "win" ? 6 : 0) + (A.score(s.meters.capital) - 50) / 3 + keskMod(o.risk)); };
    const draw = function () {
      A.render('<figure class="no10 d2fig"><img src="' + pic("no10") + '" alt="The study at Number 10"><figcaption>10 Downing Street \u00b7 ' + A.hh(s.hour) + '</figcaption></figure><div class="card dossier">' + A.LH + '<span class="stamp corner">NO.10</span><div class="kicker">Day 6 \u00b7 the last file</div><h2 style="margin-top:8px;padding-right:110px">Downing Street</h2>' +
        "<p>Kesk is in the waiting room at Number 10, with a trade minister\u2019s appointment and a tractor brochure. Hale is in the study next door. She turns to you. <b>\u201cWell, C? He\u2019s in my house.\u201d</b></p></div>" +
        OPTS.map(function (o, i) { const locked = o.pm && s.meters.capital < o.pm; return '<button class="card appr' + (sel === i ? " sel" : "") + (locked ? " locked" : "") + '" data-i="' + i + '"' + (locked ? " disabled" : "") + '><div class="t">' + (locked ? "\ud83d\udd12 " : "") + o.t + '</div><p style="margin:0">' + o.d + '</p><div class="chips">' + (locked ? '<span class="chip risk-high">Hale won\u2019t risk it \u00b7 needs No.10 trust ' + o.pm + "</span>" : '<span class="chip odds">' + odds(o) + '% chance</span><span class="chip risk-' + o.risk + '">' + RISK[o.risk] + "</span>" + (keskMod(o.risk) ? '<span class="chip kesk">Kesk expects this</span>' : "")) + "</div></button>"; }).join("") +
        '<div class="sticky-go"><button class="btn primary" id="go"' + (sel == null ? " disabled" : "") + '>' + (sel == null ? "Decide" : "Open the door") + "</button></div>", "Everything from the last six days counts here.");
      document.querySelectorAll("[data-i]").forEach(function (b) { b.onclick = function () { sel = +b.getAttribute("data-i"); draw(); }; });
      $("go").onclick = function () {
        const o = OPTS[sel], p = odds(o), res = roll(p); s.showHow = o.k; A.advance(1);
        s.styles = s.styles || { low: 0, med: 0, high: 0 }; s.styles[o.risk]++;
        const c = A.apply({ win: { capital: 12, secrecy: 8 }, mixed: { capital: -2 }, loss: { capital: -14, secrecy: -10 } }[res]);
        VO("kesk_d6_final", 600);
        const body = {
          quiet: { win: "Kesk reads the letter, folds it, and smiles. <b>\u201cWell played, C. Or nearly.\u201d</b> He is on the seven o\u2019clock plane, with his brochure.", mixed: "He goes, but slowly, and he gives an interview at the airport. Nothing in it is true. All of it is printed.", loss: "He refuses the letter. His embassy calls it an outrage, and by midnight the Foreign Secretary agrees with them." },
          turn: { win: "A long silence. Then Kesk asks for a cup of tea, and a pen. <b>The Grey House has a new friend in London.</b>", mixed: "He says no, but he says it slowly. He leaves with your card in his pocket.", loss: "He laughs for a full minute, then tells his embassy everything you offered. It reads very badly in the morning." },
          public: { win: "Handcuffs on the steps, cameras everywhere. Hale gets her headline, and Kesk gets a cell in Belmarsh, for now.", mixed: "The arrest happens, untidily. A photographer gets your face. Not a clear one.", loss: "Kesk has diplomatic papers nobody checked. He walks free in an hour, on every front page, and so do you." } }[o.k][res];
        A.finishCase("showdown", res, null, { quiet: "Put on the morning plane", turn: "Offered him a deal", public: "Arrested on the steps" }[o.k], cases(6).showdown.head[res], c, { win: "DONE", mixed: "UNTIDY", loss: "BLOWN" }[res], body, '<div class="ohead"><img class="portrait" src="' + pic("kesk") + '" alt=""></div>', "Kesk\u2019s last move.");
      };
    };
    draw();
  }

  // ---------- interruptions: letters and No.10 calls ----------
  function haleCall(day) {
    const s = S(); s.cons = s.cons || {};
    const T = {
      4: { text: "C, there\u2019s a Varenian trade delegation in Manchester, and the Chancellor wants that deal. Whatever you\u2019re doing near them, be careful.", opts: [{ k: "careful", t: "Promise to tread softly", chips: '<span class="chip">+6 No.10 trust</span><span class="chip risk-high">Bold plans in Manchester \u221210%</span>' }, { k: "firm", t: "Tell her the Grey House is in that hotel", chips: '<span class="chip risk-high">\u22124 No.10 trust</span><span class="chip risk-low">+4 Secrecy</span>' }] },
      5: { text: "C. I want our officer home, and I want it quiet. No headlines, no heroics. Can you do that?", opts: [{ k: "yes", t: "Yes, Prime Minister. Quiet.", chips: '<span class="chip">+6 No.10 trust</span>' }, { k: "honest", t: "Tell her it may not be quiet", chips: '<span class="chip risk-high">\u22124 No.10 trust</span><span class="chip risk-low">Loyalty +1 for every officer</span>' }] },
      6: { text: "C. Kesk is in London, and the Foreign Secretary knows. Bring me something by tonight, or bring me your resignation.", opts: [{ k: "tonight", t: "You\u2019ll have him by midnight", chips: '<span class="chip">+4 No.10 trust</span><span class="chip risk-high">Miss and it costs double</span>' }, { k: "letter", t: "Offer your resignation now, in a drawer", chips: '<span class="chip risk-low">+6 Service</span><span class="chip risk-high">\u22124 No.10 trust</span>' }] }
    }[day];
    const settle = function (k, timed, missed) {
      s.cons["hale" + day] = missed ? "missed" : k; A.advance(1);
      const eff = { careful: { capital: 6 }, firm: { capital: -4, secrecy: 4 }, yes: { capital: 6 }, honest: { capital: -4 }, tonight: { capital: 4 }, letter: { service: 6, capital: -4 } }[k] || {};
      const ch = missed ? A.apply({ capital: -8 }) : A.apply(eff);
      if (k === "honest") s.roster.forEach(function (x) { s.loyal[x] = A.clamp5(s.loyal[x] + 1); });
      const txt = missed ? "Nobody answered. Hale\u2019s private secretary writes it down." : { careful: "\u201cGood.\u201d The line clicks.", firm: "A long pause. \u201cThen be quick about it.\u201d", yes: "\u201cI\u2019ll hold you to that, C.\u201d", honest: "\u201cAt least you\u2019re honest.\u201d Downstairs, somebody hears you said it.", tonight: "\u201cMidnight, then.\u201d", letter: "She doesn\u2019t open the drawer. \u201cLet\u2019s hope I never need to.\u201d" }[k];
      if (!missed && window.VOICE) VOICE.play("react_pm_" + k);
      window.DESK.after(missed ? "MISSED" : "NOTED", missed ? "loss" : "mixed", "The call from No.10", (timed ? "You hesitate. " : "") + txt, ch, null);
    };
    window.DESK.call({ id: "pm_d" + day, line: "NO.10 SWITCHBOARD \u00b7 SECURE LINE", img: (A.S().meters.capital >= 60 ? "pm-calm" : A.S().meters.capital < 40 ? "pm-stern" : "pm-worried"), ring: "The Prime Minister, C.", who: "Eleanor Hale \u00b7 Prime Minister", say: "Tell her",
      text: T.text, opts: T.opts, def: T.opts[0].k, replySecs: 25, hint: "No.10 trust opens and closes options.", answer: function (k, t) { settle(k, t, false); }, miss: function () { settle(null, false, true); } });
  }
  function interrupt() {
    const s = S(); if (s.day < 4) return false;
    s.cons = s.cons || {}; s.letters = s.letters || {};
    const n = s.log.length;
    if (n >= 1 && !s.cons["hale" + s.day]) { haleCall(s.day); return true; }
    if (s.day === 5 && n >= 1 && !s.letters.k5) { s.letters.k5 = true; A.save("briefing"); keskLetter("kesk_d5_call", "Good morning, C. I have your friend. You have mine, or you will by tomorrow. Let us meet on the bridge at dawn, like civilised men. Bring something worth carrying.", null); return true; }
    return false;
  }

  // ---------- intros ----------
  function briefingIntro() {
    const s = S(); A.chrome(true); A.meters(); A.ticker();
    if (s.seenIntro) return A.briefing();
    if (CINE.maybe("day" + s.day, briefingIntro)) return;
    const d = s.day, held = s.held ? A.AG(s.held).name : null;
    const T = {
      4: { img: "h-letter", cap: "Albion House \u00b7 Tuesday 07:50", stamp: "QUIET", body: "<p>A week later, Ash puts a cream envelope on your desk. <b>\u201cHand-delivered, Chief. To this address.\u201d</b></p><p>Few people know where Albion House is. One of them has been careless. Find who, keep the Manchester talks alive, and see who is watching the door.</p><p>New: <b>each case you win rules out one suspect</b>.</p>", go: "Open the envelope" },
      5: { img: "h-bridge", cap: "Kessgrad \u00b7 Wednesday 06:10", stamp: "HELD", body: "<p><b>\u201cThey\u2019ve taken one of ours, Chief.\u201d</b> " + (held ? esc(held) + ", the officer you sent out most, was" : "One of ours was") + " picked up at the airport in Kessgrad at dawn. You won\u2019t have them today.</p><p>By dawn Kesk will name his price. Everything you did in Days 1 to 3 is now something to bargain with.</p>", go: "Read the brief" },
      6: { img: "h-london", cap: "London \u00b7 Thursday 08:00", stamp: "HERE", body: "<p><b>\u201cHe\u2019s here, Chief. Kesk is in London.\u201d</b> He landed under another name, with an appointment in Downing Street tonight.</p><p>Today you use everyone: a chase across the city, then one decision at Number 10." +  (s.heldAway ? " <b>" + esc(A.first(s.held)) + " is still in Kessgrad.</b>" : "") + "</p>", go: "Open his letter" }
    }[d];
    A.render('<figure class="no10 d2fig"><img src="img/' + T.img + '.jpg" alt=""><figcaption>' + T.cap + '</figcaption></figure><div class="card dossier">' + A.LH + '<span class="stamp corner">' + T.stamp + '</span><div class="kicker">Day ' + d + " \u00b7 For C only</div><h2 style=\"margin-top:10px;padding-right:110px\">" + NAMEOF[d] + "</h2>" + T.body + followList() + '<button class="btn primary" id="go">' + T.go + "</button></div>");
    $("go").onclick = function () {
      s.seenIntro = true; A.save("briefing");
      if (d === 4) return keskLetter("kesk_d4_letter", "Such a handsome building. I have always wanted to see where you work. Now I have. Someone of yours was kind enough to show me the door.", "kesk4", A.briefing);
      if (d === 6) return keskLetter("kesk_d6_letter", "I am in your city. Rain, buses, very good tea. Come and find me before Friday, or I shall find you.", null, A.briefing);
      A.briefing();
    };
  }
  function follows() {
    const f = flags(), s = S(), out = [];
    out.push({ win: { g: 1, t: "Day 3 \u00b7 LINDEN is home. Her notes are worth something." }, mixed: { g: 1, t: "Day 3 \u00b7 LINDEN is out, at a cost." }, loss: { g: 0, t: "Day 3 \u00b7 LINDEN was taken. Kesk is pleased with himself." }, traded: { g: 0, t: "Day 3 \u00b7 You traded LINDEN for a lorry driver. Kesk thinks you can be bought." } }[f.end3]);
    if (s.day >= 5) out.push(s.leakCaught ? { g: 1, t: "Day 4 \u00b7 The leak is closed: Kesk\u2019s counters are blunter." } : { g: 0, t: "Day 4 \u00b7 The leak is still open: Kesk counters harder." });
    if (s.day === 6) { out.push(s.heldAway ? { g: 0, t: "Day 5 \u00b7 " + (s.held ? A.first(s.held) : "Our officer") + " is still in Kessgrad." } : { g: 1, t: "Day 5 \u00b7 Our officer came home across the bridge." }); }
    if (s.day === 5) out.push(chips().length ? { g: 1, t: "Bargaining chips from Days 1 to 3: " + chips().length } : { g: 0, t: "No bargaining chips left from Days 1 to 3." });
    return out;
  }
  function followList() { return '<ul class="follows">' + follows().map(function (x) { return '<li class="' + (x.g ? "good" : "bad") + '">' + esc(x.t) + "</li>"; }).join("") + "</ul>"; }
  function followStrip() { const f = follows(); return '<details class="followstrip"><summary>What follows you \u00b7 ' + f.filter(function (x) { return x.g; }).length + " good, " + f.filter(function (x) { return !x.g; }).length + " bad</summary>" + followList() + "</details>"; }
  function line(gone) {
    const s = S(), n = s.log.length, C = cases(s.day);
    if (gone.length) return { text: "We ran out of time on <b>" + gone.map(function (id) { return C[id] ? C[id].title.toLowerCase() : "that file"; }).join(" and ") + "</b>. It\u2019s gone, Chief.", worried: true };
    if (s.day === 4) return n ? { text: "Every case we win clears somebody. The leak file is open whenever you\u2019re ready, Chief: " + clueList().length + " of 3 cleared so far.", worried: false } : { text: "Morning, Chief. Somebody is watching the front door, and the Manchester delegation is in its hotel. <b>Win those and we can work out who showed Kesk our door.</b>", worried: false };
    if (s.day === 5) return s.done.swap ? { text: A.benchLine(), worried: false } : { text: "Walk the bridge, keep the Bugle quiet, then dawn. " + (chips().length ? "We hold " + chips().length + " card" + (chips().length > 1 ? "s" : "") + " from last week." : "<b>We hold nothing to trade.</b>"), worried: !chips().length };
    return n ? { text: s.done.chase ? "He\u2019s heading for Number 10. So are we." : "Now we chase. Put everyone on the ground that suits them.", worried: true } : { text: "Find where he sleeps first, Chief. Then we follow him all the way to Downing Street.", worried: false };
  }
  function afterCase(id, res) {
    const s = S();
    if (s.day === 4 && (id === "watch" || id === "manchester")) return res === "loss" ? "No clue from this one." : "<b>One more name cleared for the leak file.</b>";
    if (id === "recon") return res === "loss" ? "We go to the bridge blind." : "Three cars on the far bank, not one. <b>Good to know.</b>";
    if (id === "press") return res === "loss" ? "The name is in tomorrow\u2019s Bugle. Kesk will raise his price." : "The Bugle holds the story.";
    if (id === "find") return res === "loss" ? "We\u2019ll have to pick him up cold." : "A hotel in Bloomsbury, room 412. <b>+8% on the chase.</b>";
    return "";
  }
  function open(id) { const k = cases(S().day)[id].kind; if (k === "leak") return leakCase(); if (k === "swap") return swap(); if (k === "chase") return chase(); if (k === "showdown") return showdown(); }

  // ---------- day ends ----------
  function ending() {
    const s = S(), d = days(), sw = (d[5] || {}).swap || "loss", e3 = (d[3] || {}).end || "loss";
    let p = { win: 2, mixed: 1, loss: 0, traded: 0 }[e3] + { win: 2, mixed: 1, loss: 0 }[sw] + ({ win: 2, mixed: 1, loss: 0 }[s.done.chase] || 0) + ({ win: 3, mixed: 1, loss: 0 }[s.done.showdown] || 0) + (s.leakCaught || (d[4] || {}).leak === "win" ? 1 : 0);
    const t = A.score(s.meters.capital);
    if (s.done.showdown === "loss" && t < 35) return "resign";
    if (p >= 8 && t >= 50) return "knight";
    if (p >= 5) return "quiet";
    if (s.done.showdown === "loss" || t < 30) return "resign";
    return "scandal";
  }
  const END = {
    knight: { name: "Knighted in silence", cine: "end2-good", lead: "NEW YEAR HONOURS: \u2018FOR SERVICES\u2019", sub: "A senior official honoured \u00b7 No reason given \u00b7 Varenian visitor \u2018went home early\u2019", flash: "A small box arrives by hand, no covering letter, no return address. Inside, a ribbon. Ash pins it to the noticeboard upside down, where only the building can see it. <b>Nobody outside will ever know why.</b>" },
    quiet: { name: "A quiet Tuesday", cine: "end2-good", lead: "VARENIAN DIPLOMAT LEAVES LONDON", sub: "Embassy calls it \u2018routine\u2019 \u00b7 Trade talks to continue \u00b7 No.10 \u2018relaxed\u2019", flash: "Kesk\u2019s plane leaves at seven. Next Tuesday is very quiet. You find you don\u2019t mind at all. <b>A postcard comes from Kessgrad: \u201cNext time. K.\u201d</b>" },
    scandal: { name: "On the front page", cine: "end2-bad", lead: "SPY CHIEF IN WESTMINSTER FIASCO", sub: "Varenian officer \u2018walked into No.10\u2019 \u00b7 Questions in the House \u00b7 Ministers \u2018not told\u2019", flash: "The photograph is everywhere: Kesk smiling on the steps of Number 10, and the back of your head. Hale doesn\u2019t ring. <b>That is worse than if she had.</b>" },
    resign: { name: "Resignation by Friday", cine: "end2-bad", lead: "HEAD OF \u2018LITTLE-KNOWN DEPARTMENT\u2019 QUITS", sub: "Resignation \u2018with immediate effect\u2019 \u00b7 No.10 thanks them \u00b7 Varenia \u2018satisfied\u2019", flash: "The letter is already in Hale\u2019s drawer. She takes it out at nine on Friday morning. Ash packs the box herself, and puts the green-shaded lamp in last. <b>\u201cIt was a good week, Chief. Mostly.\u201d</b>" }
  };
  function lastHead() { const s = S(); if (s.day === 6) return END[ending()].lead; if (s.day === 5) return cases(5).swap.head[s.done.swap || "loss"]; return s.leakCaught ? "Albion House tightens night-time sign-in" : "Spy agency address \u2018an open secret\u2019"; }
  function flash() {
    const s = S(), d = s.day; let body, where = "LONDON";
    if (d === 4) body = (s.leakCaught ? "The leak is closed. " : "<b>The leak is still open.</b> ") + "The Manchester delegation flies home tomorrow" + (s.done.manchester === "win" ? " with the deal signed." : s.done.manchester === "mixed" ? " with the deal half-signed." : " without signing.") + " At 23:40 the duty officer rings from Kessgrad airport. <b>One of ours has just been stopped at passport control.</b>";
    else if (d === 5) { where = "THE VELL BRIDGE"; body = s.done.swap === "loss" ? "<b>" + (s.held ? A.first(s.held) : "Our officer") + " is still in Kessgrad.</b> Kesk\u2019s car turned round on the bridge. At midnight his office books a flight to London, under the name of a tractor salesman." : (s.held ? A.first(s.held) : "Our officer") + " is home, asleep on Ash\u2019s sofa. At midnight Kesk\u2019s office books a flight to London, under the name of a tractor salesman. <b>He is coming himself.</b>"; }
    else { const e = END[ending()]; body = e.flash; }
    return '<div class="flash-card green" id="flash"><div class="bar"><span class="stamp">FLASH \u00b7 MOST IMMEDIATE</span><span class="time">23:58 \u00b7 ' + where + '</span></div><div class="tele"><span class="hdr">TO: C &nbsp;\u00b7&nbsp; FROM: ASHBY, ALBION HOUSE<br>HMG \u00b7 TOP SECRET \u00b7 UK EYES ONLY</span>C \u2014 ' + body + (d === 6 ? '<br><br><b>Ending: ' + END[ending()].name + "</b>" : "") + "<br><br>\u2014 Ash</div></div>";
  }
  function paperLead() {
    const s = S();
    if (s.day === 4) return s.leakCaught ? { lead: "QUIET TUESDAY IN WHITEHALL", sub: "Manchester trade talks \u2018cordial\u2019 \u00b7 No news is good news \u00b7 Weather: rain" } : { lead: "\u2018EVERYONE KNOWS WHERE THE SPIES ARE\u2019", sub: "MP mocks security at secret building \u00b7 Manchester talks \u2018cordial\u2019 \u00b7 No.10 silent" };
    if (s.day === 5) return { win: { lead: "BRITON FREED AT DAWN", sub: "Released on Varenian border \u00b7 FO: \u2018humanitarian gesture\u2019 \u00b7 No questions taken" }, mixed: { lead: "BRITON FREED, BUT AT WHAT PRICE?", sub: "Release on Varenian border \u00b7 Rumours of a deal \u00b7 Kessgrad \u2018satisfied\u2019" }, loss: { lead: "BRITON TO STAND TRIAL IN KESSGRAD", sub: "Varenia names \u2018spy\u2019 \u00b7 Downing Street no comment \u00b7 Family \u2018devastated\u2019" } }[s.done.swap || "loss"];
    const e = END[ending()]; return { lead: e.lead, sub: e.sub };
  }
  function bulletinId() { const s = S(); if (s.day === 4) return "bulletin_day4"; if (s.day === 5) return s.done.swap === "loss" || !s.done.swap ? "bulletin_day5_lose" : "bulletin_day5_win"; return "bulletin_a2_" + ending(); }
  function banner() { const s = S(); if (s.day === 4) return { t: s.leakCaught ? "Leak found and closed" : "Leak still open", ok: !!s.leakCaught }; if (s.day === 5) return { t: s.done.swap === "loss" ? "Officer still held in Kessgrad" : "Officer home from Kessgrad", ok: s.done.swap !== "loss" }; const e = ending(); return { t: "Ending: " + END[e].name, ok: e === "knight" || e === "quiet" }; }

  window.AH4 = { ending: ending, cases: cases, ORDER: ORDER, NAMEOF: NAMEOF, DAYWORD: DAYWORD, prep: prep, record: record, interrupt: interrupt, briefingIntro: briefingIntro, followStrip: followStrip, line: line, afterCase: afterCase, open: open, oddsMod: oddsMod,
    locked: locked, lockWhy: lockWhy, lastHead: lastHead, flash: flash, paperLead: paperLead, bulletinId: bulletinId, banner: banner, ending: ending, END: END, mostSent: mostSent, chips: chips };
})();
