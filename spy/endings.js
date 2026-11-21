/* endings.js: the ending gallery and a short painted, voiced epilogue for each of the eleven endings.
   The epilogue: one painting (slow push-in), two narrator lines, then what became of each officer. */
(function () {
  "use strict";
  // literal paths, so the iOS packager (scripts/package-web.mjs) picks every painting up
  const ART = { win: "img/end-win.jpg", mixed: "img/end-mixed.jpg", loss: "img/end-loss.jpg", traded: "img/end-traded.jpg", wi_good: "img/end-wi_good.jpg", wi_bad: "img/end-wi_bad.jpg",
    a2_knight: "img/end-a2_knight.jpg", a2_quiet: "img/end-a2_quiet.jpg", a2_scandal: "img/end-a2_scandal.jpg", a2_resign: "img/end-a2_resign.jpg", sacked: "img/end-sacked.jpg" };
  const ACT = { win: "Act 1", mixed: "Act 1", loss: "Act 1", traded: "Act 1", wi_good: "Bonus day", wi_bad: "Bonus day", a2_knight: "Act 2", a2_quiet: "Act 2", a2_scandal: "Act 2", a2_resign: "Act 2", sacked: "Any day" };
  // panel 6 item 16: each hint says exactly what reaches the ending (the rules in act2.js ending(), spy.js sacking, replay.js)
  const HINT = { win: "Day 3: get Vass across the border clean (the run fully works).", mixed: "Day 3: get Vass out, but only partly cleanly.", loss: "Day 3: lose the border run (or leave it on the desk).", traded: "Day 3: take Kesk\u2019s offer when the Prime Minister rings.",
    wi_good: "Bonus day (title screen, after Day 3): make at least two of the three careful calls.", wi_bad: "Bonus day: make two or more rash calls.",
    a2_knight: "Day 6: 6+ story points, No.10 trust 45+ and Downing Street not lost.", a2_quiet: "Day 6: 4+ story points, No.10 trust 30+ and Downing Street not lost.",
    a2_scandal: "Day 6: fall short of a quiet exit while keeping No.10 trust 15+ (30+ if Downing Street is lost).", a2_resign: "Day 6: No.10 trust under 15, or Downing Street lost with trust under 30.",
    sacked: "Days 1 to 5: end two nights running with No.10 trust under 10 (three on Easy)." };
  const NAMES = function () { return (window.REPLAY && REPLAY.NAMES) || {}; };
  const KEY = "albion-endings";
  const foundAll = function () { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } };
  const A = function () { return window.AH; };

  // what became of each officer, from this game's record
  function fate(k) {
    const S = A().S(), st = (S.status || {})[k], lo = (S.loyal || {})[k] || 3, vet = (S.vet || {})[k] || 0;
    if (k === S.mole) return S.accused === k ? "Unmasked. Answers questions in a quiet house in Surrey." : "Never named. Still files two sets of reports.";
    if (st === "burned") return "Burned. Never works abroad again; teaches the new intake instead.";
    if (st === "wounded") return "Recovering. Back at a desk by the spring.";
    if (vet >= 3 && lo >= 4) return "Promoted. Runs a station of their own by summer.";
    if (lo >= 5) return "Loyal to the end. Asks to stay on with you.";
    if (lo <= 1) return "Hands in a resignation within the month.";
    if (vet >= 2) return "Back in the field on Monday, a little wiser.";
    return "Back at work on Monday, as if nothing happened.";
  }
  function fates() {
    const S = A().S(); if (!S || !S.roster) return "";
    return '<ul class="epi-fates">' + S.roster.map(function (k) {
      return "<li>" + A().face(k) + "<span><b>" + A().esc(A().AG(k).name) + "</b><small>" + fate(k) + (A().echoFate && A().echoFate(k) ? " " + A().esc(A().echoFate(k)) : "") + "</small></span></li>"; }).join("") + "</ul>";
  }

  // play one ending. withFates: this game's officers; done: called on close
  function play(e, withFates, done) {
    const old = document.getElementById("epi"); if (old) old.remove();
    const d = document.createElement("div"); d.id = "epi"; d.className = "epi"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-label", "Epilogue: " + NAMES()[e]);
    d.innerHTML = '<div class="epi-art"><img src="' + ART[e] + '" alt=""></div><div class="epi-body"><div class="kicker">Epilogue \u00b7 ' + ACT[e] + "</div><h2>" + A().esc(NAMES()[e] || "") + '</h2><p class="epi-line" id="epil"></p><div id="epif"></div>' +
      '<div class="epi-go"><button class="btn ghost" id="epi-skip">Skip</button><button class="btn primary" id="epi-close" hidden>Close</button></div></div>';
    document.body.appendChild(d); document.body.classList.add("in-epi");
    requestAnimationFrame(function () { d.classList.add("in"); });
    if (window.SFX && SFX.music) SFX.music("jazz");
    const L = window.VOICE ? VOICE.lines : {}, ids = [1, 2].map(function (n) { return "epi_" + e + "_" + n; });
    let i = 0, over = false;
    const finish = function () {
      if (over) return; over = true; const el = d.querySelector("#epil"); el.textContent = ids.map(function (id) { return (L[id] || {}).text || ""; }).join(" "); el.classList.add("on");
      if (withFates) { const f = d.querySelector("#epif"); f.innerHTML = fates(); f.classList.add("in"); }
      d.querySelector("#epi-skip").hidden = true; const c = d.querySelector("#epi-close"); c.hidden = false; c.focus();
    };
    const next = function () {
      if (over) return; if (i >= ids.length) return void setTimeout(finish, 500);
      const id = ids[i++], el = d.querySelector("#epil"); el.classList.remove("on"); void el.offsetWidth;
      el.textContent = (L[id] || {}).text || ""; el.classList.add("on");
      if (window.VOICE && L[id]) { VOICE.now(id, { nosub: true }); VOICE.after(id, function () { setTimeout(next, 600); }); } else setTimeout(next, 3500);
    };
    setTimeout(next, (A().FAST || window.__SPY_FAST__) ? 0 : 900);
    d.querySelector("#epi-skip").onclick = function () { if (window.VOICE) VOICE.stop(); finish(); };
    d.querySelector("#epi-close").onclick = function () { if (window.VOICE) VOICE.stop(); over = true; d.classList.remove("in"); document.body.classList.remove("in-epi"); setTimeout(function () { d.remove(); if (done) done(); }, 300); };
  }

  // the gallery: found endings show their painting, the rest a shadow and a hint
  function gallery(back) {
    const f = foundAll(), N = NAMES(), keys = Object.keys(ART), n = keys.filter(function (e) { return f[e]; }).length;
    A().render('<div data-screen="gallery"><div class="card dossier">' + A().LH + '<div class="kicker" style="margin-top:8px">Kept on this device</div><h2>Your record</h2>' + (A().pastGamesHTML ? A().pastGamesHTML() : "") + '<h3 class="pasth">Epilogues found \u00b7 ' + n + " of " + keys.length + '</h3><div class="egrid">' +
      keys.map(function (e) {
        return f[e] ? '<button class="etile got" data-e="' + e + '"><img src="' + ART[e] + '" alt=""><b>' + A().esc(N[e]) + "</b><small>" + ACT[e] + " \u00b7 \u25b6 epilogue</small></button>"
          : '<div class="etile"><span class="eshade" aria-hidden="true"><img class="esil" src="' + ART[e] + '" alt=""></span><b>Not found yet</b><small>' + ACT[e] + " \u00b7 " + HINT[e] + "</small></div>"; }).join("") +
      '</div></div><button class="btn primary" id="gback">Back</button></div>', "Your games and the epilogues you find are kept on this device.");
    document.querySelectorAll("[data-e]").forEach(function (b) { b.onclick = function () { play(b.getAttribute("data-e"), false, function () { gallery(back); }); }; });
    A().$("gback").onclick = back || A().title;
  }
  // the newest ending this game reached (Day 3 or Day 6 summary)
  function current() {
    const S = A().S(); if (!S) return null;
    if (S.sacked) return "sacked";
    if (S.day === 3 && (S.ended || S.screen === "summary")) return S.deal === "deal" ? "traded" : (S.done && S.done.exfil) || "loss";
    if (S.day === 6 && (S.ended || S.screen === "summary") && window.AH4 && AH4.ending) return "a2_" + AH4.ending();
    return null;
  }
  // ---- round 5 (Wayne): the replay screen after the last epilogue (Day 6, or the sacking) ----
  // How close you came, from the same rules as act2.js ending(): resign < front page < quiet exit < knighted.
  const LADDER = ["a2_resign", "a2_scandal", "a2_quiet", "a2_knight"];
  const plural = function (n, w) { return n + " " + w + (n === 1 ? "" : "s"); };
  const andList = function (L) { return L.length > 1 ? L.slice(0, -1).join(", ") + " and " + L[L.length - 1] : L[0] || ""; };
  // what the next ending up needs that this game didn't have: { pts, trust, sd } (sd: Downing Street must not be lost)
  function nextGap(e, inp, under10) {
    const p = inp ? inp.p : 0, t = inp ? inp.t : 0, sd = inp ? inp.showdown : null;
    if (e === "sacked") return { next: null, trust: Math.max(0, (under10 || 10) - t) };
    if (e === "a2_resign") return { next: "a2_scandal", trust: sd === "loss" ? Math.max(0, 30 - t) : Math.max(0, 15 - t), pts: 0, sd: false };
    if (e === "a2_scandal") return { next: "a2_quiet", pts: Math.max(0, 4 - p), trust: Math.max(0, 30 - t), sd: sd === "loss" };
    if (e === "a2_quiet") return { next: "a2_knight", pts: Math.max(0, 6 - p), trust: Math.max(0, 45 - t), sd: sd === "loss" };
    return { next: null };
  }
  function closeLine(e) {
    const N = NAMES(), q = function (k) { return "\u201c" + A().esc(N[k] || "") + "\u201d"; }, S = A().S();
    if (e === "a2_knight") return "You got " + q(e) + ", the top ending. Nothing was missing.";
    if (e === "sacked") {
      const low = (A().SACK_LOW || 10), t = A().score(S.meters.capital);
      return "You got " + q(e) + " on Day " + S.day + ". Staying in the job needed No.10 trust " + low + " or more at midnight; you ended the day on " + t + ", " + plural(Math.max(1, low - t), "point") + " short.";
    }
    const g = nextGap(e, window.AH4 && AH4.endingInputs ? AH4.endingInputs() : null), bits = [];
    if (g.pts) bits.push(plural(g.pts, "story point"));
    if (g.trust) bits.push(g.trust + " No.10 trust");
    const sdTx = g.sd ? (bits.length ? ", with Downing Street not lost" : "Downing Street not being lost") : "";
    return "You got " + q(e) + ". " + q(g.next) + " was " + (bits.length || g.sd ? andList(bits) + sdTx + " away." : "within reach.");
  }
  function pull(e, back) {
    const f = foundAll(), N = NAMES(), keys = Object.keys(ART), unfound = keys.filter(function (k) { return !f[k] && k !== e; });
    const SEEN = "albion-replay-seen", first = !localStorage.getItem(SEEN); try { localStorage.setItem(SEEN, "1"); } catch (x) {}
    const tip = unfound.length ? unfound[Math.floor((A().rnd ? A().rnd() : Math.random()) * unfound.length)] : null;
    const hard = first && window.REPLAY && REPLAY.unlocked();
    A().render('<div data-screen="replay-pull"><div class="card dossier rpull">' + A().LH + '<div class="kicker" style="margin-top:8px">The end of this game</div><h2 id="rp-h" tabindex="-1">How close you came</h2>' +
      '<p class="rp-close" id="rp-close">' + closeLine(e) + "</p>" +
      (hard ? '<p class="rp-unlock" role="status">\u2726 Hard mode unlocked: pick it when you start a new game.</p>' : "") +
      '<h3 class="pasth" id="rp-gh">All endings \u00b7 ' + keys.filter(function (k) { return f[k]; }).length + " of " + keys.length + " found</h3>" +
      '<ul class="rp-grid" aria-labelledby="rp-gh">' + keys.map(function (k) {
        return f[k] ? '<li class="rp-card got' + (k === e ? " now" : "") + '"><img src="' + ART[k] + '" alt=""><b>' + A().esc(N[k] || "") + "</b><small>" + (k === e ? "This game" : "Found") + " \u00b7 " + ACT[k] + "</small></li>"
          : '<li class="rp-card"><b>' + A().esc(N[k] || "") + "</b><small>" + ACT[k] + " \u00b7 " + HINT[k] + "</small></li>"; }).join("") + "</ul>" +
      (tip ? '<p class="rp-tip"><b>Try next time:</b> ' + A().esc(N[tip] || "") + ". " + HINT[tip] + "</p>" : "") +
      '</div><div class="sticky-go"><button class="btn primary" id="rp-new">New game</button><button class="btn ghost" id="rp-back">Back to the front page</button></div></div>', "Every ending you find is kept on this device.");
    const h = document.getElementById("rp-h"); if (h) h.focus();
    A().$("rp-new").onclick = function () { if (window.AH && AH.store) AH.store.del("albion-save-v1"); A().title(); };
    A().$("rp-back").onclick = back || A().title;
  }
  window.ENDINGS = { play: play, gallery: gallery, current: current, ART: ART, HINT: HINT, fate: fate, pull: pull, closeLine: closeLine, nextGap: nextGap, LADDER: LADDER };
})();
