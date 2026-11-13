/* endings.js: the ending gallery and a short painted, voiced epilogue for each of the ten endings.
   The epilogue: one painting (slow push-in), two narrator lines, then what became of each officer. */
(function () {
  "use strict";
  // literal paths, so the iOS packager (scripts/package-web.mjs) picks every painting up
  const ART = { win: "img/end-win.jpg", mixed: "img/end-mixed.jpg", loss: "img/end-loss.jpg", traded: "img/end-traded.jpg", wi_good: "img/end-wi_good.jpg", wi_bad: "img/end-wi_bad.jpg",
    a2_knight: "img/end-a2_knight.jpg", a2_quiet: "img/end-a2_quiet.jpg", a2_scandal: "img/end-a2_scandal.jpg", a2_resign: "img/end-a2_resign.jpg" };
  const ACT = { win: "Act 1", mixed: "Act 1", loss: "Act 1", traded: "Act 1", wi_good: "Bonus day", wi_bad: "Bonus day", a2_knight: "Act 2", a2_quiet: "Act 2", a2_scandal: "Act 2", a2_resign: "Act 2" };
  const HINT = { win: "Bring Vass home clean on Day 3.", mixed: "Get Vass out on Day 3, at a price.", loss: "Lose the exfiltration on Day 3.", traded: "Take the deal on Day 3.",
    wi_good: "Play the bonus day with patience.", wi_bad: "Play the bonus day loud and fast.", a2_knight: "Finish Act 2 with the best record.", a2_quiet: "Finish Act 2 steady, nothing spectacular.",
    a2_scandal: "Let Act 2 reach the papers.", a2_resign: "Finish Act 2 with No.10's trust gone." };
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
      return "<li>" + A().face(k) + "<span><b>" + A().esc(A().AG(k).name) + "</b><small>" + fate(k) + "</small></span></li>"; }).join("") + "</ul>";
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
          : '<div class="etile"><span class="eshade" aria-hidden="true">?</span><b>Not found yet</b><small>' + ACT[e] + " \u00b7 " + HINT[e] + "</small></div>"; }).join("") +
      '</div></div><button class="btn primary" id="gback">Back</button></div>', "Your games and the epilogues you find are kept on this device.");
    document.querySelectorAll("[data-e]").forEach(function (b) { b.onclick = function () { play(b.getAttribute("data-e"), false, function () { gallery(back); }); }; });
    A().$("gback").onclick = back || A().title;
  }
  // the newest ending this game reached (Day 3 or Day 6 summary)
  function current() {
    const S = A().S(); if (!S) return null;
    if (S.day === 3 && (S.ended || S.screen === "summary")) return S.deal === "deal" ? "traded" : (S.done && S.done.exfil) || "loss";
    if (S.day === 6 && (S.ended || S.screen === "summary") && window.AH4 && AH4.ending) return "a2_" + AH4.ending();
    return null;
  }
  window.ENDINGS = { play: play, gallery: gallery, current: current, ART: ART, fate: fate };
})();
