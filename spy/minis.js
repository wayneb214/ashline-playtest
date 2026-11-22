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
    const A = window.AH, S = A.S(); if (S.done[id] || (S.minis || {})[id]) return; // panel 6 B1: one result
    S.minis = S.minis || {}; S.minis[id] = res;
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
      '<div class="chips"><span class="chip ' + (res === "loss" ? "risk-high" : "risk-low") + '">' + { win: "Helps at the York house", mixed: "Helps a little at the York house", loss: "Hurts at the York house" }[res] + "</span></div></div>" +
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

  // ---------- Day 4: faces at the window ----------
  // Round 7 (Wayne: "hats, bags, umbrellas are all misaligned and it looks amateur"): every person is one finished painting,
  // hat on the head and bag or umbrella in the hand, painted in front of the same caf\u00e9 door by the same fixed camera.
  // Nothing is layered on at run time. The traits each portrait was painted with are written here, and a test checks them.
  const COATS = ["crimson", "navy", "grey", "mustard"], HATS = ["none", "trilby", "cap"], BAGS = ["none", "case", "brolly"];
  // face: what tells a person apart when two people dress alike. twin: the cast member wearing exactly the same outfit
  // (painted from that portrait with only the person changed); twins only ever meet in Hard round 2.
  const CAST = [
    { id: "p01", c: 0, h: "cap", b: "none", face: "black man, thirties, clean-shaven", twin: "p23" },
    { id: "p02", c: 0, h: "none", b: "case", face: "woman, black bob" },
    { id: "p03", c: 0, h: "trilby", b: "brolly", face: "older man, white moustache" },
    { id: "p04", c: 0, h: "trilby", b: "case", face: "man, greying beard" },
    { id: "p05", c: 1, h: "cap", b: "case", face: "older man, short grey beard", twin: "p19" },
    { id: "p06", c: 1, h: "cap", b: "brolly", face: "young man, red hair" },
    { id: "p07", c: 1, h: "cap", b: "none", face: "older man, clean-shaven" },
    { id: "p08", c: 1, h: "none", b: "brolly", face: "woman, grey hair in a bun", twin: "p22" },
    { id: "p09", c: 1, h: "none", b: "case", face: "black man, short beard" },
    { id: "p10", c: 1, h: "none", b: "none", face: "young woman, blonde ponytail" },
    { id: "p11", c: 2, h: "cap", b: "none", face: "man, stubble" },
    { id: "p12", c: 2, h: "none", b: "none", face: "man, glasses, grey hair" },
    { id: "p13", c: 2, h: "trilby", b: "brolly", face: "East Asian man, clean-shaven", twin: "p20" },
    { id: "p14", c: 2, h: "trilby", b: "none", face: "older man, white beard" },
    { id: "p15", c: 3, h: "cap", b: "none", face: "man, dark beard" },
    { id: "p16", c: 3, h: "none", b: "case", face: "woman, auburn hair", twin: "p21" },
    { id: "p17", c: 3, h: "trilby", b: "brolly", face: "black man, grey goatee" },
    { id: "p18", c: 3, h: "trilby", b: "case", face: "young man, thin moustache", twin: "p24" },
    { id: "p19", c: 1, h: "cap", b: "case", face: "young man, clean-shaven", twin: "p05" },
    { id: "p20", c: 2, h: "trilby", b: "brolly", face: "big man, bushy ginger beard", twin: "p13" },
    { id: "p21", c: 3, h: "none", b: "case", face: "bald older man, glasses", twin: "p16" },
    { id: "p22", c: 1, h: "none", b: "brolly", face: "young black woman, short curly hair", twin: "p08" },
    { id: "p23", c: 0, h: "cap", b: "none", face: "older man, full white beard", twin: "p01" },
    { id: "p24", c: 3, h: "trilby", b: "case", face: "heavy-set man, full grey beard", twin: "p18" }
  ];
  const BYID = {}; CAST.forEach(function (f) { BYID[f.id] = f; });
  const MAIN = CAST.filter(function (f) { return +f.id.slice(1) <= 18; }); // one person per outfit
  function traitsOf(f) { return { coat: COATS[f.c], hat: { none: "no hat", trilby: "trilby", cap: "flat cap" }[f.h], bag: { none: "no bag", "case": "briefcase", brolly: "umbrella" }[f.b] }; }
  function fig(f, i, tap, faces) {
    const T = traitsOf(f), desc = T.coat + " coat, " + T.hat + (f.b === "none" ? "" : ", " + T.bag) + (faces ? "; " + f.face : "");
    const art = '<img class="cast-img" src="img/faces/cast/' + f.id + '.webp" alt="" draggable="false">';
    return tap ? '<button class="fig cast" data-fig="' + i + '" data-cast="' + f.id + '" aria-label="Person ' + (i + 1) + ": " + desc + '">' + art + "</button>"
      : '<span class="fig cast" data-cast="' + f.id + '" role="img" aria-label="Person ' + (i + 1) + ": " + desc + '">' + art + "</span>";
  }
  // Rules (round 6, kept): exactly one person is in both photos (the same cast id), nobody else in photo 1 is dressed like
  // anyone in photo 2, and no two people in a photo are dressed alike, except the planned outfit twin in Hard round 2.
  // Round 7 ramp (Wayne: harder): how close the photo-2 decoys come to the person you're looking for, as outfit traits
  // they differ in (0 = same clothes, different face).
  const RAMP = { easy: [[2, 3], [2, 3]], standard: [[1, 2], [1, 2, "near"]], hard: [[1, 2, "near"], [0, 1, "twin"]] };
  const TRAITS = ["c", "h", "b"];
  function diffs(a, b) { return TRAITS.filter(function (k) { return a[k] !== b[k]; }).length; }
  function spotRound(rnd, diff, round) {
    const r = function (n) { return Math.floor(rnd() * n); };
    const shuffle = function (L) { for (let k = L.length - 1; k > 0; k--) { const j = r(k + 1), x = L[k]; L[k] = L[j]; L[j] = x; } return L; };
    const shape = (RAMP[diff] || RAMP.standard)[round ? 1 : 0], lo = shape[0], hi = shape[1], kind = shape[2] || "";
    let t, B;
    if (kind === "twin") {
      const pairs = shuffle(MAIN.filter(function (f) { return f.twin; })), base = pairs[0];
      t = r(2) ? base : BYID[base.twin];
      const other = shuffle(MAIN.filter(function (f) { return diffs(f, t) === 1; }))[0];
      B = [t, BYID[t.twin], other];
    } else {
      const pool = shuffle(MAIN.slice()); t = pool[0];
      const near = pool.filter(function (f) { return diffs(f, t) === lo; }), wide = pool.filter(function (f) { const d = diffs(f, t); return f !== t && d >= lo && d <= hi; });
      const first = kind === "near" ? near[0] : wide[0];
      B = [t, first].concat(wide.filter(function (f) { return f !== first; }).slice(0, 1));
    }
    const dressedLike = function (f, L) { return L.some(function (g) { return diffs(f, g) === 0; }); };
    const others = shuffle(MAIN.slice()).filter(function (f) { return B.indexOf(f) < 0 && !dressedLike(f, B); });
    const A1 = [t]; for (let k = 0; k < others.length && A1.length < 3; k++) if (!dressedLike(others[k], A1)) A1.push(others[k]);
    const pack = function (L) { return shuffle(L.slice()).map(function (f) { return { id: f.id, c: f.c, h: f.h, b: f.b, face: f.face, traits: traitsOf(f) }; }); };
    const a = pack(A1), b = pack(B);
    return { a: a, b: b, ans: b.findIndex(function (f) { return f.id === t.id; }), target: traitsOf(t), id: t.id, face: t.face, twin: kind === "twin", kind: kind || "plain" };
  }
  // round 6: tap Zoom (or pinch) on a photo to see it full screen; Close (or Esc, or a tap on the dark) returns. The puzzle
  // has no timer, so nothing needs pausing; choosing still happens in the normal view.
  function zoomOpen(n) {
    const src = document.querySelector('.photo[data-ph="' + n + '"]'); if (!src || document.getElementById("phzoom")) return;
    const z = document.createElement("div"); z.id = "phzoom"; z.className = "phzoom mini"; z.setAttribute("role", "dialog"); z.setAttribute("aria-modal", "true"); z.setAttribute("aria-label", "Photo " + n + ", full screen");
    const c = src.cloneNode(true); c.classList.remove("tap"); c.classList.add("zoomed");
    c.querySelectorAll("button").forEach(function (b) { if (b.classList.contains("ph-zoom")) b.remove(); else { const sp = document.createElement("span"); sp.className = b.className; sp.setAttribute("style", b.getAttribute("style") || ""); sp.innerHTML = b.innerHTML; b.replaceWith(sp); } });
    z.innerHTML = (src.classList.contains("strip") ? '<p class="phz-hint">Swipe sideways to see all three people.</p>' : "") + '<button class="btn primary phz-close" id="phzclose">Close \u2715</button>'; z.insertBefore(c, z.firstChild);
    document.body.appendChild(z); window.__ZOOM__ = n;
    const close = function () { z.remove(); window.__ZOOM__ = 0; document.removeEventListener("keydown", esc); const b = document.querySelector('[data-zoom="' + n + '"]'); if (b) b.focus({ preventScroll: true }); };
    const esc = function (e) { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", esc);
    document.getElementById("phzclose").onclick = close; z.onclick = function (e) { if (e.target === z) close(); };
    document.getElementById("phzclose").focus({ preventScroll: true });
  }
  function wireZoom() {
    document.querySelectorAll("[data-zoom]").forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); zoomOpen(b.getAttribute("data-zoom")); }; });
    document.querySelectorAll(".photo[data-ph]").forEach(function (ph) {
      ph.addEventListener("touchstart", function (e) { if (e.touches.length >= 2) { e.preventDefault(); zoomOpen(ph.getAttribute("data-ph")); } }, { passive: false });
      ph.addEventListener("gesturestart", function (e) { e.preventDefault(); zoomOpen(ph.getAttribute("data-ph")); });
    });
  }
  function spot() {
    const A = window.AH; let round = 0, hits = 0;
    const draw = function () {
      const R = spotRound(A.rnd, A.S().diff, round); window.__FACES__ = R;
      shell("faces", "Hands-on \u00b7 round " + (round + 1) + " of 2",
        '<p class="mini-p">The caf\u00e9 watch photographs everyone at the front door. <b>Exactly one person is in both photos.</b> Tap them in photo 2: same coat, same hat (or none), same bag (or none).' + (R.twin ? ' <b>Look at the face too:</b> two people in photo 2 are dressed alike, and only one of them is the same person.' : '') + '</p>' +
        '<div class="photo strip" data-ph="1" role="group" aria-label="Photo 1, the caf\u00e9 door, last Friday 18:15"><div class="ph-head"><small>1 \u00b7 Last Fri 18:15</small><button class="ph-zoom" data-zoom="1" aria-label="Zoom photo 1">\u2922 Zoom</button></div>' + R.a.map(function (f, i) { return fig(f, i, false, R.twin); }).join("") + "</div>" +
        '<div class="photo strip tap" data-ph="2" role="group" aria-label="Photo 2, the caf\u00e9 door, Monday 08:40"><div class="ph-head"><small>2 \u00b7 Mon 08:40</small><button class="ph-zoom" data-zoom="2" aria-label="Zoom photo 2">\u2922 Zoom</button></div>' + R.b.map(function (f, i) { return fig(f, i, true, R.twin); }).join("") + "</div>" + '<div id="figout" aria-live="polite"></div>', "Who is in both photos? Tap them in photo 2.");
      wireZoom();
      document.querySelectorAll("[data-fig]").forEach(function (b) {
        b.onclick = function () {
          const ok = +b.getAttribute("data-fig") === R.ans; if (ok) hits++;
          b.classList.add(ok ? "hit" : "miss"); document.querySelector('[data-fig="' + R.ans + '"]').classList.add("hit");
          FEEL.buzz(ok ? "win" : "loss"); if (window.SFX && SFX.stamp) SFX.stamp();
          document.querySelectorAll("[data-fig]").forEach(function (x) { x.disabled = true; });
          // round 6: a plain-words result and a button, instead of moving on after 1.1 seconds
          const T = R.target, last = round + 1 >= 2, out = document.getElementById("figout");
          out.innerHTML = '<p class="mini-p ' + (ok ? "ok" : "warn") + '"><b>' + (ok ? "Right." : "Not them.") + "</b> The person in both photos: " + T.coat + " coat, " + T.hat + ", " + T.bag + (R.twin ? ", " + R.face : "") + ".</p>" +
            '<button class="btn primary" id="fignext">' + (last ? "See how it went" : "Next pair of photos") + "</button>";
          A.$("fignext").onclick = function () {
            if (++round < 2) return draw();
            const res = hits === 2 ? "win" : hits ? "mixed" : "loss";
            done("faces", res, "Spotted " + hits + " of 2", { win: "Same person, both days: a regular who drinks with someone on the staff every Friday. <b>One more name cleared for the leak file.</b>", mixed: "One right, one wrong. Enough to clear one name, not enough to follow him.", loss: "Wrong faces. The watcher walks off along the Embankment." }[res]);
          };
          try { out.scrollIntoView({ block: "end", behavior: FEEL.reduce ? "auto" : "smooth" }); } catch (e) { out.scrollIntoView(false); }
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
      f: "Watcher Pike: \u201cShe left alone at four, put her umbrella up against the rain, and caught the six o\u2019clock bus south.\u201d",
      why: "Pike has her alone, in the rain, on a bus. The receipt says two teas, the rain stopped at noon, and she took the train." },
    { clues: ["Car hire: a <b>grey estate</b>, back at 21:00", "Parking ticket: <b>Micklegate</b>, 19:10", "Her phone was <b>off all evening</b>"],
      t: "Watcher Dunn: \u201cGrey estate parked on Micklegate around seven. She had it back at the hire desk by nine.\u201d",
      f: "Watcher Pike: \u201cA blue hatchback by the Minster. She was on her phone the whole time I watched.\u201d",
      why: "Pike has a blue hatchback and her on the phone. The hire car was a grey estate and her phone was off all evening." }
  ];
  function lie() {
    const A = window.AH; let round = 0, hits = 0;
    const draw = function () {
      const L = LIES[round], flip = A.rnd() < 0.5, opts = flip ? [["f", L.f], ["t", L.t]] : [["t", L.t], ["f", L.f]];
      shell("lie", "Part one \u00b7 round " + (round + 1) + " of 2",
        '<p class="mini-p">Before anyone knocks: two local watchers, two stories. <b>One wasn\u2019t there.</b> Tap the story the clues rule out.</p>' +
        '<ul class="clues">' + L.clues.map(function (c) { return "<li>" + c + "</li>"; }).join("") + "</ul>" +
        opts.map(function (o) { return '<button class="card appr story" data-lie="' + o[0] + '"><p style="margin:0">' + o[1] + '</p></button>'; }).join("") + '<div id="lieout" aria-live="polite"></div>', "Tap the story that is the lie.");
      document.querySelectorAll("[data-lie]").forEach(function (b) {
        b.onclick = function () {
          const ok = b.getAttribute("data-lie") === "f"; if (ok) hits++;
          b.classList.add(ok ? "hit" : "miss"); FEEL.buzz(ok ? "win" : "loss"); if (window.SFX && SFX.stamp) SFX.stamp();
          document.querySelectorAll("[data-lie]").forEach(function (x) { x.disabled = true; });
          const last = round + 1 >= 2, out = document.getElementById("lieout");
          out.innerHTML = '<p class="mini-p ' + (ok ? "ok" : "warn") + '"><b>' + (ok ? "Right." : "Not that one.") + "</b> " + L.why + "</p>" + '<button class="btn primary" id="lienext">' + (last ? "See how it went" : "Next pair of stories") + "</button>";
          A.$("lienext").onclick = function () {
            if (++round < 2) return draw();
            const res = hits === 2 ? "win" : hits ? "mixed" : "loss";
            done("lie", res, "Caught " + hits + " of 2 lies", { win: "Pike folds in ten minutes: he spent the evening in a pub and made it up. <b>Dunn\u2019s trail is the real one.</b>", mixed: "You doubt Pike, but not enough. Half the trail is good.", loss: "You believe the wrong man. York sends us the wrong way for an afternoon." }[res]);
          };
          try { out.scrollIntoView({ block: "end", behavior: FEEL.reduce ? "auto" : "smooth" }); } catch (e) { out.scrollIntoView(false); }
        };
      });
    };
    draw();
    MENU.coach("mini-lie", "Hands-on case: read the clues, then tap the story that <b>contradicts</b> them.");
  }

  document.addEventListener("DOMContentLoaded", function () { addCases(window.AH_DATA); });
  window.MINI = { spotRound: spotRound, CAST: CAST, traitsOf: traitsOf, zoomOpen: zoomOpen, inject: inject, open: function (id) { ({ proof: cipher, faces: spot, lie: lie })[id](); }, HEAD: HEAD };
})();
