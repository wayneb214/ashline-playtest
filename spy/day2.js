/* Albion House — Day 2: Pale Hour. The Varenian team behind the Bath poisoning is trying to leave
   Britain tonight. New here: the evidence board (link clues to suspects) and interrogations
   (pick Friendly, Hard or Bluff; a hidden temperament decides what works). Uses window.AH from spy.js. */
(function () {
  "use strict";
  const A = window.AH, D = A.D, $ = A.$, esc = A.esc;
  const S = function () { return A.S(); };
  const TONES = { friendly: { t: "Friendly", d: "Tea, patience, a kind word." }, hard: { t: "Hard", d: "Lean in. Raise your voice." }, bluff: { t: "Bluff", d: "Pretend you already know." } };

  // ---------- the Day 2 opening ----------
  function briefingIntro() {
    const s = S(); A.chrome(true); A.meters(); A.ticker();
    if (s.seenIntro) return A.briefing();
    A.render('<figure class="no10 d2fig"><img src="' + A.pic("briefing-room") + '" alt="The briefing room at Albion House, rain on the windows"><figcaption>Albion House \u00b7 the briefing room, Thursday 07:30</figcaption></figure>' +
      '<div class="card dossier">' + A.LH + '<span class="stamp corner">PALE HOUR</span><div class="kicker">Day 2 \u00b7 For C only</div><h2 style="margin-top:10px;padding-right:110px">Pale Hour</h2>' +
      "<p>Pieter Vass is alive, just, in a Bath hospital under a police guard. The Prime Minister wants the people who did it, and she wants them <strong>before they leave Britain</strong>.</p>" +
      "<p>Avon Police think it was <strong>three people</strong>: a tall man, a woman in a green coat, and a driver. The ports and airports are open until midnight.</p>" +
      "<p>New today: the <strong>evidence board</strong> in Kite\u2019s office. Pin each clue to the right suspect. The right links open the best plans for tonight.</p>" +
      '<p class="clue"><b>From yesterday:</b> grade ' + esc(s.days[1].grade) + " \u00b7 " + esc(s.days[1].mole) + " \u00b7 " + s.roster.length + " officer" + (s.roster.length === 1 ? "" : "s") + " fit for duty.</p>" +
      '<button class="btn primary" id="go">To the desk</button></div>');
    $("go").onclick = function () { s.seenIntro = true; A.briefing(); };
  }
  function titleOf(id) { return id === "mole2" ? (A.moleCaught() ? "Question the mole" : "The mole, second chance") : D.SITS2[id].title; }
  function unlinked() { const s = S(); return Object.keys(s.clues).filter(function (c) { return !s.links[c]; }).length; }
  function line(gone) {
    const s = S();
    if (!s.log.length && !s.lineSeen) { s.lineSeen = true; return { text: "Morning, C. Vass is alive. Three of them did it, and they\u2019ll try to leave tonight. Start at the airport: border officers are sitting on a courier. Everything we find goes on the board.", worried: true }; }
    if (gone.length) return { text: "We ran out of time on <b>" + gone.map(function (id) { return titleOf(id).toLowerCase(); }).join(" and ") + "</b>. It\u2019s gone, C.", worried: true };
    if (unlinked()) return { text: "There " + (unlinked() === 1 ? "is one clue" : "are " + unlinked() + " clues") + " on the board with no string on them yet. Ten minutes with the board could save us an evening.", worried: false };
    return { text: A.benchLine(), worried: false };
  }
  function boardButton() { const s = S(), n = Object.keys(s.clues).length; return '<button class="btn boardbtn" id="board">\ud83d\udccc Evidence board \u00b7 ' + (n - unlinked()) + " of " + n + " clues linked</button>"; }
  function bindBoardButton() { $("board").onclick = function () { board(); }; }
  function open(id) { if (id === "mole2" && !A.moleCaught()) return A.accuse(true); interro(id); }

  // clues found by a case go up on the board
  function reveal(ids) { const s = S(); const fresh = ids.filter(function (c) { return !s.clues[c]; }); fresh.forEach(function (c) { s.clues[c] = true; }); return fresh; }
  function clueNote(ids) { return ids.length ? "New on the evidence board: " + ids.map(function (c) { return "<b>" + D.CLUES[c].name + "</b>"; }).join(", ") + "." : ""; }
  function afterCase(id, res) {
    if (id === "safehouse") return clueNote(reveal(res === "win" ? ["gloves", "map"] : res === "mixed" ? ["map"] : []));
    if (id === "mole2" && res === "win") return clueNote(reveal(["phone"]));
    return "";
  }

  // ---------- the evidence board ----------
  function board(msg) {
    const s = S(); let sel = board.sel || null;
    const suspects = Object.keys(D.SUSPECTS).map(function (k) {
      const p = D.SUSPECTS[k], n = Object.keys(s.links).filter(function (c) { return s.links[c] === k; }).length;
      return '<button class="suspect" data-s="' + k + '"><span class="pinhead"></span><span class="photo s-' + k + '"></span><b>' + p.name + "</b><small>" + p.note + "</small>" + (n ? '<span class="cnt">' + n + "</span>" : "") + "</button>";
    }).join("");
    const clues = Object.keys(D.CLUES).filter(function (c) { return s.clues[c]; }).map(function (c, i) {
      const cl = D.CLUES[c], linked = s.links[c];
      return '<button class="clue-card' + (sel === c ? " sel" : "") + (linked ? " linked" : "") + '" data-c="' + c + '" style="--tilt:' + [-2, 1.5, -1, 2, -1.5, 1][i % 6] + 'deg"' + (linked ? " disabled" : "") + '><span class="pinhead"></span><b>' + cl.name + "</b><span>" + cl.txt + "</span>" + (linked ? '<em>\u2192 ' + D.SUSPECTS[linked].name + "</em>" : "") + "</button>";
    }).join("");
    const unlocked = Object.keys(s.unlocked || {});
    A.render('<div class="kicker">Kite\u2019s office \u00b7 the evidence board</div>' + A.kite(msg || (sel ? "And who does <b>" + D.CLUES[sel].name.toLowerCase() + "</b> belong to? Tap a face." : "Tap a clue card, then the suspect it belongs to. I\u2019ll run the string."), false) + A.tip("board") +
      '<div class="cork" id="cork"><svg class="strings" id="strings" aria-hidden="true"></svg><div class="suspects">' + suspects + '</div><div class="clues">' + clues + "</div></div>" +
      '<div class="unlocks">' + (unlocked.length ? "Unlocked for tonight: " + unlocked.map(function (u) { return "<b>" + (u === "ferry" ? "Quiet intercept at Harwich" : "Take the driver first") + "</b>"; }).join(" \u00b7 ") : "Nothing unlocked yet. Link the right clues to open tonight\u2019s best plans.") + "</div>" +
      '<button class="btn primary" id="back">Back to the desk</button>', "Right links cost nothing. A wrong one wastes an hour.");
    document.querySelectorAll("[data-c]").forEach(function (b) { b.onclick = function () { board.sel = b.getAttribute("data-c"); board(); }; });
    document.querySelectorAll("[data-s]").forEach(function (b) { b.onclick = function () { if (board.sel) link(board.sel, b.getAttribute("data-s")); }; });
    $("back").onclick = function () { board.sel = null; A.briefing(); };
    strings();
  }
  function link(c, who) {
    const s = S(), cl = D.CLUES[c]; board.sel = null;
    if (cl.owner !== who) {
      A.advance(1); A.meters(); A.save("briefing"); window.FEEL.buzz("loss");
      return board("No. That doesn\u2019t fit <b>" + D.SUSPECTS[who].name.toLowerCase() + "</b>, C. We\u2019ve lost an hour chasing it. (" + A.hh(s.hour) + ")");
    }
    s.links[c] = who; window.FEEL.buzz("stamp");
    let msg = "Pinned. Red string from <b>" + cl.name.toLowerCase() + "</b> to <b>" + D.SUSPECTS[who].name.toLowerCase() + "</b>.";
    if (cl.unlock) { s.unlocked[cl.unlock] = true; msg += cl.unlock === "ferry" ? " <b>That\u2019s the ferry. Harwich intercept unlocked.</b>" : " <b>We know the car. Taking the driver first is unlocked.</b>"; }
    A.save("briefing"); board(msg);
  }
  // red string from each linked clue up to its suspect
  function strings() {
    const cork = $("cork"), svg = $("strings"); if (!cork || !svg) return;
    const box = cork.getBoundingClientRect(), s = S();
    svg.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
    svg.innerHTML = Object.keys(s.links).map(function (c) {
      const a = cork.querySelector('[data-c="' + c + '"] .pinhead'), b = cork.querySelector('[data-s="' + s.links[c] + '"] .pinhead');
      if (!a || !b) return "";
      const p = a.getBoundingClientRect(), q = b.getBoundingClientRect();
      const x1 = p.left + p.width / 2 - box.left, y1 = p.top + p.height / 2 - box.top, x2 = q.left + q.width / 2 - box.left, y2 = q.top + q.height / 2 - box.top;
      return '<path pathLength="100" d="M' + x1 + " " + y1 + " Q" + (x1 + x2) / 2 + " " + ((y1 + y2) / 2 + 18) + " " + x2 + " " + y2 + '"/>';
    }).join("");
  }

  // ---------- interrogation ----------
  // Each subject has a hidden temperament (proud, scared or clever). The matching tone gets answers;
  // the wrong tone hardens them. The tell in each round hints which it is.
  const SUBJECTS = {
    courier: { who: "The courier", img: "courier", rounds: ["He sits with the unsealed bag on the table between you.", "You ask who packed the bag.", "You ask where the others are going.", "His embassy will ring in ten minutes."],
      gives: ["\u201cA tall man paid me in Bath. Cash. Very tall. Didn\u2019t give a name.\u201d", "\u201cThey have a ferry tonight. Three berths. Harwich.\u201d He writes the booking reference on your file."], clue: "ticket", art: "v-airport",
      head: { win: "Man held at London airport \u2018helping police\u2019", mixed: "Airport passenger questioned and released", loss: "Varenian protest over airport \u2018harassment\u2019" } },
    mole2: { who: null, img: null, rounds: ["They sit very straight in the windowless room on the fourth floor.", "You ask who they rang last night.", "You ask what they gave the Grey House.", "Their lawyer is on the stairs."],
      gives: ["\u201cI never met them. I only ever rang a number.\u201d", "They write the number down. Kite has it traced in minutes: the team leader\u2019s phone."], clue: "phone", art: null,
      head: { win: "Albion House insider \u2018co-operating\u2019, say sources", mixed: "Lawyer arrives at Albion House for detained officer", loss: "Detained officer \u2018says nothing\u2019 as hunt goes on" } }
  };
  const RETORT = { friendly: "Your kindness gets a thin smile. \u201cTea won\u2019t help you.\u201d", hard: "Shouting gets nothing but folded arms. \u201cI want my embassy.\u201d", bluff: "\u201cYour file is empty. I can see it from here.\u201d" };

  function interro(id) {
    const s = S(), sub = SUBJECTS[id];
    if (!s.interro[id]) s.interro[id] = { temper: Object.keys(D.TEMPERS)[Math.floor(A.rnd() * 3)], round: 0, got: 0, resist: 0, lines: [] };
    if (window.__SPY_TEMPER__) s.interro[id].temper = window.__SPY_TEMPER__;
    const st = s.interro[id], T = D.TEMPERS[st.temper];
    const who = sub.who || A.D.AGENTS[s.mole].name, img = sub.img || A.D.AGENTS[s.mole].tense || A.D.AGENTS[s.mole].img;
    const dots = [0, 1, 2, 3].map(function (i) { return '<i class="' + (i < st.round ? "on" : "") + '"></i>'; }).join("");
    A.render('<div class="interro card"><div class="lh">INTERVIEW ROOM \u00b7 ' + (id === "courier" ? "WEST LONDON AIRPORT" : "ALBION HOUSE, FOURTH FLOOR") + " \u00b7 " + A.hh(s.hour) + '</div><figure><img src="' + A.pic(img) + '" alt="' + esc(who) + ' across the table"><figcaption>' + esc(who) + "</figcaption></figure>" +
      '<div class="rounds">Round ' + Math.min(4, st.round + 1) + ' of 4 <span class="step">' + dots + "</span></div>" +
      '<ul class="transcript">' + st.lines.map(function (l) { return '<li class="' + l.c + '">' + l.t + "</li>"; }).join("") +
      '<li class="cue">' + esc(sub.rounds[st.round] || "") + ' <span class="tell">' + esc(T.tell) + "</span></li></ul></div>" + A.tip("interro") +
      '<div class="tones">' + Object.keys(TONES).map(function (k) { return '<button class="card appr tone" data-q="' + k + '"><div class="t">' + TONES[k].t + '</div><p style="margin:0">' + TONES[k].d + "</p></button>"; }).join("") + "</div>" +
      '<button class="btn ghost" id="back">Come back later</button>', "Read the tell. One tone works on this one.");
    document.querySelectorAll("[data-q]").forEach(function (b) { b.onclick = function () { ask(id, b.getAttribute("data-q")); }; });
    $("back").onclick = A.briefing;
  }
  function ask(id, tone) {
    const s = S(), st = s.interro[id], sub = SUBJECTS[id];
    st.lines.push({ c: "you", t: "You: <i>" + TONES[tone].t + "</i>" });
    if (D.TEMPERS[st.temper].works === tone) { st.lines.push({ c: "gave", t: sub.gives[st.got] }); st.got++; window.FEEL.buzz("win"); }
    else { st.lines.push({ c: "no", t: RETORT[tone] }); st.resist++; window.FEEL.buzz("tap"); }
    st.round++; A.save("briefing");
    if (st.got >= 2 || st.round >= 4 || st.resist >= 3) return endInterro(id);
    interro(id);
  }
  function endInterro(id) {
    const s = S(), st = s.interro[id], sub = SUBJECTS[id];
    A.advance(2);
    const res = st.got >= 2 ? "win" : st.got === 1 ? "mixed" : "loss";
    const found = st.got >= 1 ? reveal([sub.clue]) : [];
    const ch = A.apply(res === "win" ? { secrecy: 6, trust: 4 } : res === "mixed" ? { secrecy: -2 } : { secrecy: -6, capital: -4 });
    const kind = { proud: "proud", scared: "frightened", clever: "clever" }[st.temper];
    const body = (res === "loss" ? (id === "courier" ? "Nothing. He walks out with his embassy\u2019s driver." : "Nothing. The lawyer arrives and the door closes.") : res === "mixed" ? "Something, not everything." : "Everything we needed.") +
      " The subject was <b>" + kind + "</b>: " + { proud: "Friendly worked", scared: "Hard worked", clever: "a Bluff worked" }[st.temper] + ". " + clueNote(found);
    const img = sub.art && res !== "loss" ? sub.art : "v-" + res;
    A.finishCase(id, res, null, "Interview \u00b7 " + st.got + " of 2 answers", sub.head[res], ch, { win: "TALKED", mixed: "PARTIAL", loss: "SILENT" }[res], body,
      '<div class="kbwrap"><img class="vignette" src="' + A.pic(img) + '" alt=""></div>', found.length ? "New clue on the evidence board." : "No new clues.");
  }

  // ---------- the Day 2 cliffhanger ----------
  const exitRes = function () { return S().done.exit || "loss"; };
  function flash() {
    const caught = A.moleCaught();
    const body = {
      win: "Two held at the gangway: <b>the tall man and the driver</b>. The woman in green was not on the ferry. In her cabin, a sealed case marked <b>PALE HOUR</b>, empty, and a note with an address in <b>York</b> and tomorrow\u2019s date.",
      mixed: "We have <b>the driver</b>, held at the services. The ferry cleared Harwich at 23:10 with the other two aboard. In the car: a road atlas with <b>York</b> circled, and a case marked <b>PALE HOUR</b>, empty.",
      loss: "The night ferry cleared the harbour wall at 23:10. On the quay, a hat in a puddle and nobody under it. <b>They\u2019re gone.</b> At nine tomorrow the Varenian ambassador wants to see you, personally, at Downing Street."
    }[exitRes()];
    const mole = caught ? "Upstairs, the mole has asked to see you. Alone. <b>\u201cThere is a fourth name,\u201d</b> they say." : "<b>And somebody inside Albion House rang that ferry office at ten past eleven.</b>";
    return '<div class="flash-card ferry" id="flash"><div class="bar"><span class="stamp">FLASH \u00b7 MOST IMMEDIATE</span><span class="time">23:52 \u00b7 HARWICH</span></div><div class="tele"><span class="hdr">TO: C &nbsp;\u00b7&nbsp; FROM: KITE, ALBION HOUSE<br>HMG \u00b7 TOP SECRET \u00b7 UK EYES ONLY</span>C \u2014 ' + body + "<br><br>" + mole + "<br><br>\u2014 Kite</div></div>";
  }
  function paperLead() {
    return {
      win: { lead: "TWO HELD AT HARWICH IN BATH POISON HUNT", sub: "Late-night swoop at ferry port \u00b7 Third suspect \u2018still in Britain\u2019 \u00b7 No.10 praises \u2018quiet professionals\u2019" },
      mixed: { lead: "ONE HELD AS BATH SUSPECTS FLEE ON FERRY", sub: "Driver detained on the A12 \u00b7 Two \u2018believed abroad\u2019 \u00b7 Questions for Whitehall" },
      loss: { lead: "BATH SUSPECTS SLIP OUT OF BRITAIN", sub: "Night ferry left Harwich on time \u00b7 Questions for Whitehall \u00b7 Varenian embassy \u2018has nothing to add\u2019" }
    }[exitRes()];
  }

  window.AH2 = { briefingIntro: briefingIntro, line: line, titleOf: titleOf, boardButton: boardButton, bindBoardButton: bindBoardButton, open: open, afterCase: afterCase, flash: flash, paperLead: paperLead };
})();
