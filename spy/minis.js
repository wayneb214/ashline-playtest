/* minis.js: three short hands-on puzzles (20–40 s). All invented; the code is a toy shift cipher.
   Day 3 · lie: two watchers' stories; tap the one that can't be true. It is the first half of the York case, not a case of its own.
   Day 4 · faces ("Faces at the window"): tap the face that is in both photos. A win clears a suspect on the leak board.
   Day 5 · proof ("Proof of life"): turn the dial until Kesk's postcard reads. A win helps at the bridge. */
(function () {
  "use strict";
  const REW = { win: { capital: 4, service: 5 }, mixed: { capital: 1, service: 2 }, loss: { capital: -3, service: -3 } };
  const CASES = {
    4: { faces: { kind: "mini", title: "Faces at the window", where: "Lambeth, London", place: "London", home: true, due: 17, pen: { secrecy: -5 },
      head: { win: "Lambeth caf\u00e9 regular \u2018helping police\u2019", mixed: "Photographer seen outside government building", loss: "Albion House visitor \u2018never identified\u2019" } } },
    5: { proof: { kind: "mini", title: "Proof of life", where: "A postcard from Kessgrad", place: "Varenia", home: true, due: 19, pen: { safety: -5 },
      head: { win: "Varenia: detained Briton \u2018in good health\u2019", mixed: "Family of held Briton receive postcard", loss: "No word from Briton held in Kessgrad" } } }
  };
  // where each puzzle sits in the day's order (index)
  const AT = { 4: ["faces", 2], 5: ["proof", 2] };
  const HEAD = { proof: "signal", faces: "fleet", lie: "york" };
  const STAMP = { win: "CRACKED", mixed: "PARTLY", loss: "MISSED" };
  function addCases(D) { if (D.SITS4) Object.assign(D.SITS4, CASES[4]); if (D.SITS5) Object.assign(D.SITS5, CASES[5]); }
  // put today's mini case on the desk (also upgrades saves from before it existed)
  function inject(S) {
    addCases(window.AH.D);
    const a = AT[S.day]; if (!a || S.order.indexOf(a[0]) >= 0) return;
    S.order.splice(Math.min(a[1], S.order.length), 0, a[0]);
  }
  function done(id, res, appr, body) {
    const A = window.AH, S = A.S(); S.minis = S.minis || {}; S.minis[id] = res;
    if (id === "lie") return yorkNext(res, body);
    const ch = A.apply(REW[res]); A.advance(1);
    if (id === "faces" && res !== "loss") { S.clues4 = S.clues4 || {}; S.clues4.faces = true; }
    A.finishCase(id, res, null, appr, A.CASES()[id].head[res], ch, STAMP[res], body, "", "Back to the desk when you\u2019re ready.");
    if (window.FUN) FUN.event("mini", { id: id, res: res });
  }
  // York, part one: the two watchers. The result changes the odds for part two, the officer at the house.
  function yorkNext(res, body) {
    const A = window.AH; if (window.FUN) FUN.event("mini", { id: "lie", res: res });
    if (window.SFX && SFX.stamp) SFX.stamp(); if (window.VOICE) VOICE.play("mini_lie_" + res);
    A.render('<div data-screen="york-half"><div class="card outcome ' + res + '"><span class="stamp thud">' + STAMP[res] + '</span><div class="kicker">The York address \u00b7 part one of two</div><h2>Two stories from York</h2><p>' + body + '</p>' +
      '<div class="chips"><span class="chip ' + (res === "loss" ? "risk-high" : "risk-low") + '">' + { win: "+8% at the York house", mixed: "+3% at the York house", loss: "\u22126% at the York house" }[res] + "</span></div></div>" +
      '<button class="btn primary" id="go">Part two: who goes to the house?</button></div>', "Now pick who goes to the York house.");
    A.$("go").onclick = function () { A.openCase("york"); };
  }
  function shell(id, kicker, html, hint) {
    const A = window.AH, t = id === "lie" ? "The York address" : A.CASES()[id].title;
    A.render('<div data-screen="mini-' + id + '" data-music="tense"><div class="card dossier mini"><div class="kicker">' + kicker + "</div><h2>" + A.esc(t) + "</h2>" + html + '</div><button class="linkbtn" id="back">Back to the desk</button></div>', hint);
    A.$("back").onclick = A.briefing;
  }

  // ---------- Day 1: the dial cipher ----------
  const MSG = "OLD MILL BY THE VELL BRIDGE VALE";
  const enc = function (t, k) { return t.replace(/[A-Z]/g, function (c) { return String.fromCharCode(65 + (c.charCodeAt(0) - 65 + k + 26) % 26); }); };
  function cipher() {
    const A = window.AH, S = A.S(); S.mini = S.mini || {};
    const key = S.mini.key || (S.mini.key = 3 + Math.floor(A.rnd() * 7)), code = enc(MSG, key);
    let turn = 0, wrong = 0;
    const draw = function () {
      const plain = enc(code, -turn);
      shell("proof", "Hands-on \u00b7 about 30 seconds",
        '<p class="mini-p">Kesk sent a postcard \u201cfrom our friend\u201d. A line is in Grey House code: every letter shifted by the same number. <b>It always ends <span class="mono">VALE</span>.</b></p>' +
        '<div class="cipher"><div class="ct mono" aria-label="Coded text">' + code + '</div><div class="pt mono" aria-live="polite">' + plain + "</div>" +
        '<div class="strip mono" aria-hidden="true">' + "VALE".split("").map(function (c) { return "<span>" + enc(c, key) + "\u2192" + c + "</span>"; }).slice(0, wrong).join("") + "</div>" +
        '<div class="dialrow"><button class="btn ghost" id="cm" aria-label="Turn back one">\u25c0</button><span class="shift mono">Shift ' + turn + '</span><button class="btn ghost" id="cp" aria-label="Turn on one">\u25b6</button></div></div>' +
        (wrong ? '<p class="mini-p warn">Not yet. A hint is above: the code letters for VALE.</p>' : "") +
        '<button class="btn primary" id="lock">That\u2019s it \u00b7 send it to Ash</button>', "Turn the dial. Lock it when the words make sense.");
      A.$("cm").onclick = function () { turn = (turn + 25) % 26; if (window.SFX && SFX.tick) SFX.tick(1); draw(); };
      A.$("cp").onclick = function () { turn = (turn + 1) % 26; if (window.SFX && SFX.tick) SFX.tick(1); draw(); };
      A.$("lock").onclick = function () {
        if (turn === key) return done("proof", wrong ? "mixed" : "win", "Cracked the shift" + (wrong ? " on the second go" : ""), "It reads: <b>\u201cOld mill by the Vell bridge.\u201d</b> That\u2019s where they\u2019re holding ours. <b>Better odds at dawn.</b>");
        wrong++; FEEL.buzz("loss");
        if (wrong >= 2) return done("proof", "loss", "Couldn\u2019t crack it", "The codebreakers crack it by morning: <b>\u201cOld mill by the Vell bridge.\u201d</b> Too late to help.");
        draw();
      };
    };
    draw();
    MENU.coach("mini-proof", "Turn the dial with \u25c0 \u25b6 until the bottom line reads as English, then lock it. One wrong guess is forgiven.");
  }

  // ---------- Day 2: spot the tail ----------
  const COATS = ["#7a1f1f", "#2e4a6b", "#5b5b52", "#a07c3c"], HATS = ["none", "trilby", "cap"], BAGS = ["none", "case", "brolly"];
  function fig(f, i, tap) {
    const hat = f.h === "trilby" ? '<path d="M7 9h18M11 9c0-5 10-5 10 0" stroke="#111" stroke-width="3" fill="#222"/>' : f.h === "cap" ? '<path d="M10 9c0-5 12-5 12 0h4" stroke="#333" stroke-width="3" fill="#444"/>' : "";
    const bag = f.b === "case" ? '<rect x="22" y="32" width="10" height="9" rx="1" fill="#3a2814" stroke="#e8d9b8" stroke-width=".8"/>' : f.b === "brolly" ? '<path d="M28 18v34a2 2 0 0 1-4 0" stroke="#e8d9b8" stroke-width="2.4" fill="none"/>' : "";
    const svg = '<svg viewBox="0 0 32 64" aria-hidden="true"><circle cx="16" cy="12" r="5" fill="#d9c3a5"/>' + hat + '<path d="M9 19h14l3 28H6z" fill="' + COATS[f.c] + '"/><path d="M11 47v14M21 47v14" stroke="#1b1b1b" stroke-width="3"/>' + bag + "</svg>";
    // painted figures: one oil-painted body per coat colour, with a painted hat and bag layered on
    const COATN = ["crimson", "navy", "grey", "mustard"], HATN = { trilby: "trilby", cap: "flat cap" }, BAGN = { "case": "briefcase", brolly: "umbrella" };
    const art = '<span class="pf"><img class="pf-body" src="img/faces/coat' + f.c + '.webp" alt="">' + (f.h !== "none" ? '<img class="pf-hat pf-' + f.h + '" src="img/faces/' + f.h + '.webp" alt="">' : "") + (f.b !== "none" ? '<img class="pf-bag pf-' + f.b + '" src="img/faces/' + f.b + '.webp" alt="">' : "") + "</span>";
    const desc = COATN[f.c] + " coat" + (HATN[f.h] ? ", " + HATN[f.h] : ", no hat") + (BAGN[f.b] ? ", " + BAGN[f.b] : "");
    const st = 'style="left:' + f.x + '%"';
    if (window.__FACES_SVG__ !== true) return tap ? '<button class="fig" data-fig="' + i + '" ' + st + ' aria-label="Person ' + (i + 1) + ": " + desc + '">' + art + "</button>" : '<span class="fig" ' + st + ' role="img" aria-label="' + desc + '">' + art + "</span>";
    return tap ? '<button class="fig" data-fig="' + i + '" ' + st + ' aria-label="Person ' + (i + 1) + '">' + svg + "</button>" : '<span class="fig" ' + st + ">" + svg + "</span>";
  }
  function spotRound(rnd) {
    const r = function (n) { return Math.floor(rnd() * n); }, t = { c: r(4), h: HATS[r(3)], b: BAGS[r(3)] };
    const same = function (a, b) { return a.c === b.c && a.h === b.h && a.b === b.b; };
    const near = function () { const f = Object.assign({}, t), k = r(3); if (k === 0) f.c = (t.c + 1 + r(3)) % 4; else if (k === 1) f.h = HATS[(HATS.indexOf(t.h) + 1 + r(2)) % 3]; else f.b = BAGS[(BAGS.indexOf(t.b) + 1 + r(2)) % 3]; return f; };
    const xs = [8, 30, 54, 76], A1 = [], B = [];
    for (let i = 0; i < 4; i++) { let f; do { f = { c: r(4), h: HATS[r(3)], b: BAGS[r(3)] }; } while (same(f, t)); A1.push(f); B.push(near()); }
    const ia = r(4), ib = r(4); A1[ia] = Object.assign({}, t); B[ib] = Object.assign({}, t);
    A1.forEach(function (f, i) { f.x = xs[i]; }); B.forEach(function (f, i) { f.x = xs[(i + 2) % 4]; });
    return { a: A1, b: B, ans: ib };
  }
  function spot() {
    const A = window.AH; let round = 0, hits = 0;
    const draw = function () {
      const R = spotRound(A.rnd);
      shell("faces", "Hands-on \u00b7 round " + (round + 1) + " of 2",
        '<p class="mini-p">The caf\u00e9 watch photographed the front door twice. <b>Someone is in both.</b> Tap them in photo 2: same coat, hat and bag.</p>' +
        '<div class="photo"><img src="img/h-fleet.jpg" alt="Lambeth, Monday 08:40"><small>1 \u00b7 Monday, 08:40</small>' + R.a.map(function (f, i) { return fig(f, i, false); }).join("") + "</div>" +
        '<div class="photo tap"><img src="img/h-london.jpg" alt="Lambeth, Thursday 18:15"><small>2 \u00b7 Thursday, 18:15 \u00b7 tap one</small>' + R.b.map(function (f, i) { return fig(f, i, true); }).join("") + "</div>", "Who is in both photos? Tap them in photo 2.");
      document.querySelectorAll("[data-fig]").forEach(function (b) {
        b.onclick = function () {
          const ok = +b.getAttribute("data-fig") === R.ans; if (ok) hits++;
          b.classList.add(ok ? "hit" : "miss"); document.querySelector('[data-fig="' + R.ans + '"]').classList.add("hit");
          FEEL.buzz(ok ? "win" : "loss"); if (window.SFX && SFX.stamp) SFX.stamp();
          document.querySelectorAll("[data-fig]").forEach(function (x) { x.disabled = true; });
          setTimeout(function () {
            if (++round < 2) return draw();
            const res = hits === 2 ? "win" : hits ? "mixed" : "loss";
            done("faces", res, "Spotted " + hits + " of 2", { win: "Same man, both days. He buys a pint for someone on the staff every Friday. <b>One more name cleared for the leak file.</b>", mixed: "One right, one wrong. Enough to clear one name, not enough to follow him.", loss: "Wrong faces. The watcher walks off along the Embankment." }[res]);
          }, FEEL.reduce ? 500 : 1100);
        };
      });
    };
    draw();
    MENU.coach("mini-faces", "Compare the two photos. One person is in both. Tap them in the <b>second</b> photo.");
  }

  // ---------- Day 3: which story is the lie? ----------
  const LIES = [
    { clues: ["Caf\u00e9 receipt: <b>two</b> teas, 16:40", "Met Office: the rain <b>stopped at noon</b>", "Ticket stub: the <b>18:05 train</b> to London"],
      t: "Watcher Dunn: \u201cShe came out of the caf\u00e9 at twenty to five with a friend and walked to the station. Dry evening.\u201d",
      f: "Watcher Pike: \u201cShe left alone at four, put her umbrella up against the rain, and caught the six o\u2019clock bus south.\u201d" },
    { clues: ["Car hire: a <b>grey estate</b>, back at 21:00", "Parking ticket: <b>Micklegate</b>, 19:10", "Her phone was <b>off all evening</b>"],
      t: "Watcher Dunn: \u201cGrey estate parked on Micklegate around seven. She had it back at the hire desk by nine.\u201d",
      f: "Watcher Pike: \u201cA blue hatchback by the Minster. She was on her phone the whole time I watched.\u201d" }
  ];
  function lie() {
    const A = window.AH; let round = 0, hits = 0;
    const draw = function () {
      const L = LIES[round], flip = A.rnd() < 0.5, opts = flip ? [["f", L.f], ["t", L.t]] : [["t", L.t], ["f", L.f]];
      shell("lie", "Part one \u00b7 round " + (round + 1) + " of 2",
        '<p class="mini-p">Before anyone knocks: two local watchers, two stories. <b>One wasn\u2019t there.</b> Tap the story the clues rule out.</p>' +
        '<ul class="clues">' + L.clues.map(function (c) { return "<li>" + c + "</li>"; }).join("") + "</ul>" +
        opts.map(function (o) { return '<button class="card appr story" data-lie="' + o[0] + '"><p style="margin:0">' + o[1] + '</p></button>'; }).join(""), "Tap the story that is the lie.");
      document.querySelectorAll("[data-lie]").forEach(function (b) {
        b.onclick = function () {
          const ok = b.getAttribute("data-lie") === "f"; if (ok) hits++;
          b.classList.add(ok ? "hit" : "miss"); FEEL.buzz(ok ? "win" : "loss"); if (window.SFX && SFX.stamp) SFX.stamp();
          document.querySelectorAll("[data-lie]").forEach(function (x) { x.disabled = true; });
          setTimeout(function () {
            if (++round < 2) return draw();
            const res = hits === 2 ? "win" : hits ? "mixed" : "loss";
            done("lie", res, "Caught " + hits + " of 2 lies", { win: "Pike folds in ten minutes: he spent the evening in a pub and made it up. <b>Dunn\u2019s trail is the real one.</b>", mixed: "You doubt Pike, but not enough. Half the trail is good.", loss: "You believe the wrong man. York sends us the wrong way for an afternoon." }[res]);
          }, FEEL.reduce ? 500 : 1100);
        };
      });
    };
    draw();
    MENU.coach("mini-lie", "Hands-on case: read the clues, then tap the story that <b>contradicts</b> them.");
  }

  document.addEventListener("DOMContentLoaded", function () { addCases(window.AH_DATA); });
  window.MINI = { inject: inject, open: function (id) { ({ proof: cipher, faces: spot, lie: lie })[id](); }, HEAD: HEAD };
})();
