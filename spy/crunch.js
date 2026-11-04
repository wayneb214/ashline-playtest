/* crunch.js: twice in the game, two urgent calls land at once and only one duty team is free.
   You choose; the file you leave goes worse (never graphic). One file is clearly about a person's safety. */
(function () {
  "use strict";
  const PAIRS = {
    2: { at: 12, files: [
      { id: "dover", img: "harwich", t: "A source at Dover is about to be exposed", s: "Someone has her name. She needs moving within the hour.", good: true,
        left: { capital: -4, service: -10 }, head: "Dover: woman \u2018helping police\u2019 after port alert" },
      { id: "taxi", img: "fleet", t: "A minister\u2019s case left in a taxi", s: "Embarrassing papers, mostly diary dates. A reporter is sniffing.",
        left: { capital: -6 }, head: "Minister\u2019s lost papers turn up at newspaper" } ] },
    3: { at: 14, files: [
      { id: "press", img: "fleet", t: "A journalist is asking about Bath", s: "She has half a story and a deadline at six.",
        left: { capital: -6 }, head: "Paper hints at \u2018secret Bath operation\u2019" },
      { id: "ferry", img: "harwich", t: "Our courier stopped at the night ferry", s: "His papers won\u2019t hold if they check twice. Get him clear.", good: true,
        left: { capital: -4, service: -10 }, head: "Ferry passenger held for questioning at Harwich" } ] }
  };
  const REW = { win: { capital: 4, service: 4 }, mixed: { service: 1 }, loss: { service: -4 } };
  function due(S) { const p = PAIRS[S.day]; return p && !(S.crunch || {})[S.day] && S.hour >= p.at && S.hour < 22 && p; }
  function card(f, i) {
    return '<button class="card dossier crunchf" data-crunch="' + i + '"' + (f.good ? ' data-good="1"' : "") + '><span class="sithead" style="background-image:url(img/h-' + f.img + '.jpg)"></span><span class="urg">URGENT</span><div class="t">' + f.t + '</div><div class="s">' + f.s + "</div>" + (f.good ? '<span class="risk">A person at risk</span>' : '<span class="risk paper">Reputation at risk</span>') + "</button>";
  }
  function interrupt() {
    const A = window.AH, S = A.S(), p = due(S); if (!p) return false;
        A.render('<div data-screen="crunch" data-music="tense"><div class="card dossier"><div class="kicker">' + A.hh(S.hour) + " \u00b7 two calls at once</div><h2>One duty team left</h2>" +
      A.ash("Two lines lit at once, C. Every officer is committed. I can send the duty team to <b>one</b> of these. The other will go worse.", true) +
      '<div class="crunch">' + p.files.map(card).join('<div class="or">or</div>') + "</div></div></div>", "Pick one. The file you leave will slip.");
    if (window.SFX) SFX.tele(); if (window.FEEL) FEEL.buzz("ring");
    document.querySelectorAll("[data-crunch]").forEach(function (b) { b.onclick = function () { choose(p, +b.getAttribute("data-crunch")); }; });
    return true;
  }
  function choose(p, i) {
    const A = window.AH, S = A.S(), f = p.files[i], o = p.files[1 - i];
    const odds = 55 + Math.round((A.svc() - 50) / 2) + (f.good ? 10 : 0), r = A.rnd() * 100;
    const res = r < odds * 0.7 ? "win" : r < odds ? "mixed" : "loss";
    const ch = A.apply(REW[res]), ch2 = A.apply(o.left); A.advance(1);
    S.crunch = S.crunch || {}; S.crunch[S.day] = { pick: f.id, res: res, sensible: !!f.good }; S.heads.push(o.head);
    if (window.FUN) FUN.event("crunch", { res: res, sensible: !!f.good });
    const word = { win: "Handled", mixed: "Partly handled", loss: "Went wrong" }[res];
    A.render('<div data-screen="crunch-result"><div class="card dossier"><div class="kicker">Two calls \u00b7 what happened</div>' +
      '<div class="crunchres"><div><b>' + word + ":</b> " + f.t + A.deltas(ch) + '</div><div class="left"><b>Left alone:</b> ' + o.t + "<br><i>\u201c" + o.head + "\u201d</i>" + A.deltas(ch2) + "</div></div>" +
      A.ash(f.good ? "Right call. People before paper." : "The papers will keep. I hope the other one does.", !f.good) +
      '<button class="btn primary" id="go">Back to the desk</button></div></div>');
    A.meters(); A.save("briefing");
    A.$("go").onclick = A.briefing;
  }
  window.CRUNCH = { interrupt: interrupt };
})();
