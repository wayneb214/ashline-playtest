/* Albion House — Day 3: The Green Coat. Everything is invented: the Varenian Republic, the Grey House,
   Colonel Kesk, Linden and every place on the far side of the border. Loosely inspired by famous Cold War
   escapes and cable taps, with no real tradecraft.
   Adds: lasting flags from Days 1–2, officer morale events, No.10 trust gates, the enemy spymaster's letters,
   the lose-the-tail street game and the four-stage exfiltration. */
(function () {
  "use strict";
  const A = window.AH, D = A.D, S = A.S, esc = A.esc, pic = A.pic, $ = A.$, FEEL = window.FEEL;
  const FORCE = function () { return window.__SPY_FORCE__; };

  // ---------- content ----------
  D.UKPLACES.York = [0.31, 0.445]; D.UKPLACES.NorthSea = [0.385, 0.47]; D.UKPLACES.Varenia = [0.437, 0.5];
  D.SITS3 = {
    bath: { kind: "officer", title: "What the bench was for", where: "Bath", place: "Bath", due: 11, left: true,
      brief: "The bench in Bath was never a crime scene. It was a dead drop. The woman in green sat there on Wednesday to warn Vass, not to hurt him, and he collapsed before he could read what she taped under the slats. The bench is in an Avon Police store. Kesk has a man in Bath who wants it first.",
      approaches: [
        { t: "Ask Avon Police for a quiet look", d: "A friendly sergeant, a cup of tea, ten minutes alone with the bench.", mod: 10, risk: "low", stress: 0, win: { trust: 6, secrecy: 6 }, mixed: { secrecy: -2 }, loss: { secrecy: -8 } },
        { t: "A warrant from the Home Office", d: "Paperwork that opens the store. Slower, and people will read it.", mod: 6, risk: "med", stress: 1, win: { capital: 6, secrecy: 4 }, mixed: { capital: -4 }, loss: { capital: -8, trust: -4 } },
        { t: "Lift it tonight before Kesk\u2019s man does", d: "A van, overalls and a story about council repairs.", mod: 0, risk: "high", stress: 2, win: { secrecy: 10 }, mixed: { safety: -4 }, loss: { safety: -10, trust: -6 } }],
      head: { win: "Bath bench removed for \u2018repairs\u2019", mixed: "Police confirm \u2018item\u2019 found under Bath bench", loss: "Break-in at Avon Police store" } },
    york: { kind: "officer", art: "v-york", title: "The York address", where: "York", place: "York", due: 14,
      brief: "The address from the ferry cabin is a terraced house in York: her fallback. If she isn\u2019t there, her way out is. Years ago we wrote her an escape plan, code-named SPARE KEY. It should be in the airing cupboard.",
      approaches: [
        { t: "Watch the house first", d: "Two hours across the road with a flask before anyone knocks.", mod: 8, risk: "low", stress: 0, win: { secrecy: 8, safety: 4 }, mixed: { secrecy: -2 }, loss: { safety: -8 } },
        { t: "Knock as the gas board", d: "Clipboard, lanyard, \u2018we\u2019ve had reports of a smell\u2019.", mod: 6, risk: "med", stress: 1, win: { secrecy: 6, trust: 2 }, mixed: { trust: -2 }, loss: { trust: -6, secrecy: -6 } },
        { t: "Go in hard", d: "Through the back door before anyone can burn anything.", mod: 0, risk: "high", stress: 2, win: { capital: 8 }, mixed: { trust: -6 }, loss: { trust: -10, safety: -8 } }],
      head: { win: "Quiet street in York has a \u2018gas scare\u2019", mixed: "York residents report \u2018men in a van\u2019", loss: "Police called to York break-in" } },
    tail: { kind: "tail", title: "Shake the watchers", where: "Westminster, London", place: "London", home: true, due: 16,
      head: { win: "Westminster: nothing to report", mixed: "Man \u2018seen running\u2019 near Parliament", loss: "Foreign \u2018tourists\u2019 photograph Albion House staff" } },
    cable: { kind: "cable", art: "v-cabletap", title: "The listening pod", where: "North Sea", place: "NorthSea", label: "North Sea", due: 19,
      brief: "The Grey House talks to its border posts over the Kestrel Line, a seabed cable nobody admits exists. A listening pod on it tonight would let us hear Kesk hunting for her.",
      head: { win: "Survey ship \u2018finds nothing\u2019 off the coast", mixed: "Fishing boat reports \u2018naval activity\u2019", loss: "Varenia complains of \u2018interference\u2019 with its cable" } },
    exfil: { kind: "exfil", title: "The Green Coat", where: "Kessgrad, Varenian Republic", place: "Varenia", label: "To Varenia \u203a", due: 22, flash: true, left: true,
      head: { win: "Quiet night at the Varenian border", mixed: "British driver held at Varenian border", loss: "Varenia: \u2018state traitor\u2019 caught at border" } }
  };
  const KESK = "Colonel Anselm Kesk", STYLE = { low: "quiet", med: "official", high: "bold" };

  // ---------- flags that carry forward ----------
  function flags() {
    const s = S(), d1 = (s.days || {})[1] || {}, d2 = (s.days || {})[2] || {};
    return { clerk: !!d1.defector, call: d1.call && d1.call.choice ? d1.call : null, caught: A.moleCaught(), exit: d2.exit || null };
  }
  function prep(n) { // applied when Day 3 is created
    const c = n.days && n.days[1] && n.days[1].call;
    if (c && c.choice === "deny" && n.loyal[c.k] != null) n.loyal[c.k] = Math.max(0, n.loyal[c.k] - 1);
  }
  function follows() {
    const f = flags(), out = [];
    out.push(f.clerk ? { g: 1, t: "Day 1 \u00b7 You saved the Vienna clerk. She knows the woman in green\u2019s handwriting: +15% in Bath." } : { g: 0, t: "Day 1 \u00b7 The Vienna clerk was left behind. Nobody can read the note\u2019s hand: \u221210% in Bath." });
    if (f.call) out.push(f.call.choice === "deny" ? { g: 0, t: "Day 1 \u00b7 You denied " + A.first(f.call.k) + " to the House. They haven\u2019t forgotten: loyalty \u22121, and they won\u2019t drive tonight." } : { g: 1, t: "Day 1 \u00b7 You stood by " + A.first(f.call.k) + ". They\u2019d drive through a wall for you: +10% if they drive tonight." });
    out.push(f.caught ? { g: 1, t: "Day 1 \u00b7 The mole is in a cell, and talking: +10% at the border tonight." } : { g: 0, t: "Day 1 \u00b7 The mole is still inside. Kesk knows our faces: the watchers start a step closer, and \u221210% at the border." });
    if (f.exit === "win") out.push({ g: 1, t: "Day 2 \u00b7 We hold the tall man. Kesk wants him back: a swap at the border is possible, if No.10 signs off (trust 50)." });
    else if (f.exit === "mixed") out.push({ g: 1, t: "Day 2 \u00b7 We hold the driver. He\u2019s told us the border routine: +5% at the checkpoint." });
    else if (f.exit) out.push({ g: 0, t: "Day 2 \u00b7 The Bath team got home. They know our faces: the watchers start a step closer." });
    return out;
  }
  function followList() { return '<ul class="follows">' + follows().map(function (x) { return '<li class="' + (x.g ? "good" : "bad") + '">' + esc(x.t) + "</li>"; }).join("") + "</ul>"; }
  function followStrip() {
    const f = follows();
    return '<details class="followstrip"><summary>What follows you \u00b7 ' + f.filter(function (x) { return x.g; }).length + " good, " + f.filter(function (x) { return !x.g; }).length + " bad</summary>" + followList() + "</details>";
  }

  // ---------- the enemy spymaster ----------
  function fav() {
    const st = S().styles || {}; let best = null, n = 0;
    ["low", "med", "high"].forEach(function (r) { if ((st[r] || 0) > n) { n = st[r]; best = r; } });
    return best;
  }
  const keskHit = function () { return S().leaked ? 18 : 12; };
  function keskMod(risk) { return fav() && risk === fav() ? -keskHit() : 0; }
  function oddsMod(id, k, a) {
    let o = keskMod(a.risk);
    if (id === "bath") o += flags().clerk ? 15 : -10;
    return o;
  }
  function chips(id, k, a) {
    let h = keskMod(a.risk) ? '<span class="chip kesk">Kesk expects this \u00b7 \u2212' + keskHit() + "%</span>" : "";
    if (id === "bath") h += flags().clerk ? '<span class="chip risk-low">Vienna clerk +15%</span>' : '<span class="chip risk-high">No clerk \u221210%</span>';
    return h;
  }
  function letterText(n) {
    const f = flags(), s = S(), st = fav();
    const habit = { low: "You are a patient man, C. You like the quiet way: a cup of tea, a photograph, a long wait.", med: "You do love your paperwork, C. Warrants, letters, polite men in suits at the front door.", high: "You are a gambler, C. Fast cars, kicked doors, no time for tea." }[st] || "I can\u2019t make you out yet, C. I will.";
    const counter = { low: "So I have told my people to watch the quiet doors.", med: "So I have friends who read your paperwork before you sign it.", high: "So I have put men on every fast road out of town." }[st] || "";
    let open;
    if (n === 0) {
      open = "Welcome to Friday. You have something of mine in York, I think. Or rather, you are about to go and look for it.";
      if (!f.caught) open += " Your friend upstairs sends his regards.";
      if (f.exit === "win") open += " You have my tall friend. I would like him back.";
      else if (f.exit === "loss") open += " My three travellers are home, and thank you for the ferry.";
    } else if (n === 1) {
      const last = s.log[s.log.length - 1];
      open = last && last.res === "win" ? "A tidy morning. Enjoy it. They are rare." : "Such a pity about this morning. Bath is so pretty in the rain.";
    } else open = "Tonight you will try to take something that belongs to the Republic. I will be at the border myself. Bring a warm coat. Green, perhaps.";
    return { body: open + " " + habit + " " + counter, st: st };
  }
  function letter(n, then) {
    const s = S(); s.letters = s.letters || {}; s.letters[n] = true; A.save("briefing");
    const L = letterText(n);
    if (window.SFX) SFX.tele();
    A.render('<div class="kletter card" id="kletter"><div class="kl-top"><img class="portrait" src="' + pic("kesk") + '" alt="Colonel Kesk"><div><div class="kl-from">From the desk of</div><div class="kl-name">' + KESK + '</div><div class="kl-role">Director \u00b7 the Grey House</div></div></div>' +
      '<div class="kl-body"><p>My dear C,</p><p>' + esc(L.body) + '</p><p class="kl-sig">K.</p></div>' +
      (L.st ? '<div class="chips"><span class="chip kesk">Kesk now counters ' + STYLE[L.st] + " plans \u00b7 \u2212" + keskHit() + "% on them today</span></div>" : "") +
      '<p class="kl-note">Hand-delivered to the front desk. No fingerprints. The paper smells of pine.</p></div><button class="btn primary" id="go">Into the burn bag</button>', "Your most-used style is the one Kesk will be ready for.");
    $("go").onclick = function () { FEEL.tearThen($("kletter"), then || A.briefing); };
  }

  // ---------- morale: a risk event when an officer\u2019s loyalty hits the floor ----------
  function riskEvent(k) {
    const s = S(); s.riskSeen = s.riskSeen || {}; s.riskSeen[s.day + k] = true; A.save("briefing");
    let sel = null;
    const draw = function () {
      A.render('<div class="card dossier">' + A.LH + '<span class="stamp corner">MORALE</span><div class="kicker" style="margin-top:8px">Personnel \u00b7 a word from Kite</div><h2 style="padding-right:110px">' + esc(A.first(k)) + " is close to walking</h2></div>" +
        A.kite(esc(A.first(k)) + " hasn\u2019t said a word all morning, C. Twice they\u2019ve taken calls in the stairwell. Loyalty is at rock bottom. A bitter officer is how leaks start.", true) +
        '<div class="agents">' + A.agentCard(k, "", false, false, "data-x") + "</div>" +
        '<button class="card appr' + (sel === "talk" ? " sel" : "") + '" data-o="talk"><div class="t">A quiet word in your office</div><p style="margin:0">Listen. Apologise if you need to.</p><div class="chips"><span class="chip time">\u23f1 1h</span><span class="chip risk-low">Loyalty +2 \u00b7 Stress \u22121</span></div></button>' +
        '<button class="card appr' + (sel === "off" ? " sel" : "") + '" data-o="off"><div class="t">Send them home for the day</div><p style="margin:0">Rest, and out of harm\u2019s way. One fewer pair of hands.</p><div class="chips"><span class="chip risk-med">Off duty today</span><span class="chip risk-low">Loyalty +1</span></div></button>' +
        '<button class="card appr' + (sel === "ignore" ? " sel" : "") + '" data-o="ignore"><div class="t">Ignore it. There\u2019s no time.</div><p style="margin:0">Free, for now. If they talk, Kesk hears.</p><div class="chips"><span class="chip risk-high">Chance of a leak</span></div></button>' +
        '<div class="sticky-go"><button class="btn primary" id="go"' + (sel ? "" : " disabled") + ">" + (sel ? "Decide" : "How do you handle it?") + "</button></div>", "Overruling and overworking officers wears loyalty down.");
      document.querySelectorAll("[data-o]").forEach(function (b) { b.onclick = function () { sel = b.getAttribute("data-o"); draw(); }; });
      $("go").onclick = function () {
        let ch = {}, txt, res = "win", stamp = "SETTLED";
        if (sel === "talk") { A.advance(1); s.loyal[k] = A.clamp5(s.loyal[k] + 2); s.stress[k] = A.clamp5(s.stress[k] - 1); txt = "Forty minutes, the door shut. " + A.first(k) + " leaves red-eyed, but back with you."; }
        else if (sel === "off") { s.used[k] = true; s.loyal[k] = A.clamp5(s.loyal[k] + 1); txt = A.first(k) + " takes their coat and goes. Nobody says anything. Everybody notices."; stamp = "STOOD DOWN"; res = "mixed"; }
        else if (A.rnd() < 0.45) { s.leaked = true; ch = A.apply({ secrecy: -12 }); s.heads.push("\u2018Unhappy\u2019 spy agency staff talk to the Courier"); txt = "By four o\u2019clock the Courier has a story about unhappy staff at Albion House. Somewhere, Kesk is reading it too: <b>his counter-moves get sharper.</b>"; stamp = "LEAKED"; res = "loss"; }
        else { txt = "Nothing happens. This time."; stamp = "IGNORED"; res = "mixed"; }
        A.meters(ch); A.ticker(); A.save("briefing");
        A.render('<div class="card outcome ' + res + '"><span class="stamp thud">' + stamp + '</span><div class="ohead">' + A.face(k, res === "loss" ? "tense" : "") + "<h2>" + esc(A.first(k)) + "</h2></div><p>" + txt + "</p>" + (Object.keys(ch).length ? A.deltas(ch) : "") + '</div><button class="btn primary" id="go">Back to the desk</button>', "Morale: " + A.morale(k) + ".");
        $("go").onclick = A.briefing;
      };
    };
    draw();
  }

  // ---------- the moral call from No.10 ----------
  function dealCall() {
    const s = S(); s.deal = "pending"; A.save("briefing");
    if (window.SFX) SFX.ring(); FEEL.buzz("ring");
    A.render('<div class="phone card" id="phone"><div class="lh">NO.10 SWITCHBOARD \u00b7 SECURE LINE</div><div class="pm"><img src="' + pic("pm-phone") + '" alt="Prime Minister Eleanor Hale on the telephone"></div><div class="ringing">\u260e The Prime Minister again, C.</div><button class="btn primary" id="answer">Answer</button></div>', "The red phone is ringing.");
    $("answer").onclick = function () {
      if (window.SFX) SFX.stopRing();
      let sel = null;
      const draw = function () {
        A.render('<div class="phone card call" id="phone"><div class="lh">NO.10 SWITCHBOARD \u00b7 ' + A.hh(s.hour) + '</div><div class="pm"><img src="' + pic("pm-phone") + '" alt="Prime Minister Eleanor Hale"></div>' +
          '<div class="note"><div class="who">Eleanor Hale \u00b7 Prime Minister</div><span class="tx">C. An offer, through the back door. Colonel Kesk will release <b>Tom Archer</b>, the lorry driver they\u2019ve held for six weeks, if we \u201cforget a woman in a green coat\u201d. I don\u2019t know who she is, and I don\u2019t want to. Do we have a deal?</span></div></div>' +
          '<button class="card appr' + (sel === "deal" ? " sel" : "") + '" data-c="deal"><div class="t">Take the deal. Leave her there.</div><div class="chips"><span class="chip">+14 No.10 trust</span><span class="chip risk-high">The Green Coat is called off</span><span class="chip risk-high">Every officer loyalty \u22121</span></div></button>' +
          '<button class="card appr' + (sel === "refuse" ? " sel" : "") + '" data-c="refuse"><div class="t">Refuse. We bring our people home.</div><div class="chips"><span class="chip risk-high">\u221212 No.10 trust</span><span class="chip risk-low">Every officer loyalty +1</span></div></button>' +
          '<button class="card appr' + (sel === "lie" ? " sel" : "") + '" data-c="lie"><div class="t">Say yes. Go and get her anyway.</div><div class="chips"><span class="chip">+6 No.10 trust now</span><span class="chip risk-high">If she gets out, Hale finds out</span></div></button>' +
          '<div class="sticky-go"><button class="btn primary" id="go"' + (sel ? "" : " disabled") + ">" + (sel ? "Tell her" : "What do you tell her?") + "</button></div>", "No.10 trust opens and closes options tonight.");
        document.querySelectorAll("[data-c]").forEach(function (b) { b.onclick = function () { sel = b.getAttribute("data-c"); draw(); }; });
        $("go").onclick = function () {
          let ch, head, txt;
          s.deal = sel; A.advance(1);
          if (sel === "deal") {
            ch = A.apply({ capital: 14, trust: 4 }); s.roster.forEach(function (k) { s.loyal[k] = A.clamp5(s.loyal[k] - 1); });
            s.done.exfil = "loss"; s.log.push({ id: "exfil", k: null, res: "loss", appr: "Traded for Tom Archer" });
            head = "Briton freed by Varenia \u2018on humanitarian grounds\u2019"; txt = "Hale is warm for the first time all week. Kite closes the Green Coat file without a word, and doesn\u2019t look at you.";
          } else if (sel === "refuse") {
            ch = A.apply({ capital: -12 }); s.roster.forEach(function (k) { s.loyal[k] = A.clamp5(s.loyal[k] + 1); });
            head = "No.10 \u2018disappointed\u2019 as Varenia talks stall"; txt = "\u201cOn your head, C. Again.\u201d The line goes dead. Downstairs, word gets round, and somebody starts making tea for everyone.";
          } else { ch = A.apply({ capital: 6 }); head = "Hopes rise for Briton held in Varenia"; txt = "\u201cGood. Sensible.\u201d Hale rings off. Kite raises one eyebrow and says nothing."; }
          s.heads.push(head); A.meters(ch); A.ticker(); A.save("briefing");
          A.render('<div class="card outcome ' + (sel === "deal" ? "loss" : sel === "refuse" ? "win" : "mixed") + '"><span class="stamp thud">' + { deal: "TRADED", refuse: "REFUSED", lie: "AGREED?" }[sel] + '</span><h2>The offer from Kesk</h2><p>' + txt + "</p>" + A.deltas(ch) + A.headline(head) + '</div><button class="btn primary" id="go">Back to the desk</button>', "That will echo.");
          $("go").onclick = A.briefing;
        };
      };
      draw();
    };
  }

  // interruptions before the brief, in order
  function interrupt() {
    const s = S();
    s.riskSeen = s.riskSeen || {};
    const bitter = s.roster.filter(function (k) { return s.loyal[k] <= 1 && !s.used[k] && !s.riskSeen[s.day + k]; })[0];
    if (bitter) { riskEvent(bitter); return true; }
    if (s.day !== 3) return false;
    const n = s.log.length;
    if (n >= 2 && !s.deal && !s.done.exfil) { dealCall(); return true; }
    s.letters = s.letters || {};
    if (n >= 1 && !s.letters[1]) { letter(1); return true; }
    if (n >= 3 && !s.letters[3]) { letter(3); return true; }
    return false;
  }

  // ---------- intro and the brief ----------
  function briefingIntro() {
    const s = S(); A.chrome(true); A.meters(); A.ticker();
    if (s.seenIntro) return A.briefing();
    A.render('<figure class="no10 d2fig"><img src="' + pic("h-york") + '" alt="A narrow timbered street in York at dawn, a grey car parked"><figcaption>York \u00b7 Friday 06:40</figcaption></figure>' +
      '<div class="card dossier">' + A.LH + '<span class="stamp corner">GREEN COAT</span><div class="kicker">Day 3 \u00b7 For C only</div><h2 style="margin-top:10px;padding-right:110px">The Green Coat</h2>' +
      "<p>Kite closes the door. \u201cThe woman in green isn\u2019t one of theirs, C. <strong>She\u2019s ours.</strong> Code name <strong>LINDEN</strong>. Eleven years inside the Grey House.\u201d</p>" +
      "<p>On Wednesday she sat on that bench in Bath to warn Vass, not to hurt him. Last night she missed her check-in. If she\u2019s blown, we have until midnight to bring her out of the <strong>Varenian Republic</strong>.</p>" +
      "<p>New today: officers have <strong>morale</strong>, and remember being overruled. <strong>No.10 trust</strong> opens and closes options. And the man across the border, <strong>Colonel Kesk</strong>, learns how you play.</p>" +
      '<div class="kicker" style="margin-top:6px">What follows you from Days 1 and 2</div>' + followList() +
      '<button class="btn primary" id="go">Open the envelope on your desk</button></div>');
    $("go").onclick = function () { s.seenIntro = true; A.save("briefing"); letter(0, A.briefing); };
  }
  function line(gone) {
    const s = S(), n = s.log.length;
    if (gone.length) return { text: "We ran out of time on <b>" + gone.map(function (id) { return D.SITS3[id].title.toLowerCase(); }).join(" and ") + "</b>. It\u2019s gone, C.", worried: true };
    if (!n) return { text: "Morning, C. Start in Bath: whatever she taped under that bench, Kesk\u2019s man wants it too. York by two. And somebody has to walk her plan across London without a tail.", worried: false };
    if (s.deal === "deal") return { text: "Archer lands tonight. The Green Coat file is closed. " + A.benchLine(), worried: true };
    if (!s.done.exfil && s.hour >= 18) return { text: "She walks past the signal spot at seven, Kessgrad time. The car must be at the border by ten. <b>Everything else can wait.</b>", worried: true };
    return { text: A.benchLine(), worried: false };
  }
  function afterCase(id, res) {
    if (id === "bath") return res === "loss" ? "Kesk\u2019s man got to the store first." : "Under the slats, a cigarette paper in her hand: <b>\u2018Vass is not the target. I am. Come for me.\u2019</b>";
    if (id === "york") return res === "loss" ? "Kesk\u2019s people were there first. We\u2019ll run SPARE KEY from memory (\u221215% on the signal)." : "In the airing cupboard, SPARE KEY, untouched. <b>The signal is a man with a green shopping bag.</b>";
    return "";
  }

  // ---------- open a Day 3 special case ----------
  function open(id) { if (id === "tail") return tailIntro(); if (id === "cable") return cable(); if (id === "exfil") return exfil(); }
  const dodds = function () { return A.diff().odds; };
  const clampP = function (o) { return Math.max(8, Math.min(94, Math.round(o))); };
  function roll(p) { const r = A.rnd() * 100; const f = FORCE(); return f ? f : r < p * 0.7 ? "win" : r < p ? "mixed" : "loss"; }
  function head(id) { return '<div class="chead"><img src="img/h-' + { tail: "fleet", cable: "cabletap", exfil: "signal" }[id] + '.jpg" alt=""></div>'; }

  // ---------- lose the tail: six corners of painted London ----------
  const LANES = ["Left", "Straight on", "Right"], ARROW = ["\u25c0", "\u25b2", "\u25b6"];
  function startHeat() { const f = flags(); return (f.caught ? 0 : 1) + (f.exit === "loss" ? 1 : 0); }
  function tailIntro() {
    const s = S(), skip = s.diff === "easy" || FEEL.reduce, h0 = startHeat();
    A.render('<div class="card dossier">' + head("tail") + A.LH + '<span class="stamp corner">ON FOOT</span><div class="kicker">Westminster \u00b7 by ' + A.hh(A.dueOf("tail")) + '</div><h2 style="margin-top:8px;padding-right:110px">Shake the watchers</h2>' +
      "<p>Kesk\u2019s watchers are on the street outside. SPARE KEY has to reach the Varenia desk at a flat in Pimlico, and every officer\u2019s face is known. <strong>It has to be you, C.</strong></p>" +
      '<p class="clue"><b>How to play:</b> six corners. At each one, pick the street with <b>no watcher</b> and <b>no dead end</b>. Tap a lane or swipe \u25c0 \u25b2 \u25b6. Be quick: hesitate and they close in. Get spotted too often and they follow you all the way.</p>' +
      (h0 ? '<p class="warn-t">The watchers start ' + h0 + " step" + (h0 > 1 ? "s" : "") + " closer: " + (flags().caught ? "" : "the mole gave them our faces. ") + (flags().exit === "loss" ? "The Bath team know you by sight." : "") + "</p>" : "") +
      "</div>" + '<div class="sticky-go"><button class="btn primary" id="go">Start walking</button></div>' + (skip ? '<button class="btn ghost" id="skip">Take the long way round (+1h, no game)</button>' : "") + '<button class="btn ghost" id="back">Back to the brief</button>',
      skip ? "You can skip the street game on Easy or with reduced motion." : "Two hours on foot.");
    $("go").onclick = tailGame;
    if ($("skip")) $("skip").onclick = function () { A.advance(1); tailEnd(0, true); };
    $("back").onclick = A.briefing;
  }
  function tailGame() {
    const s = S(), N = 6, limit = FEEL.reduce ? 0 : ({ easy: 4200, standard: 3000, hard: 2200 }[s.diff] || 3000);
    let i = 0, heat = startHeat(), timer = null, cur = null, busy = false;
    const corner = function () {
      const w = Math.floor(A.rnd() * 3); let b = Math.floor(A.rnd() * 2); if (b >= w) b++;
      cur = { w: w, b: b, safe: 3 - w - b }; window.__TAIL__ = cur; busy = false;
      const cue = ["A man in a flat cap reading the same page of his paper", "A woman on a bench who hasn\u2019t turned her page in a minute", "A taxi with its light off and the engine running"][Math.floor(A.rnd() * 3)];
      const dead = ["Scaffolding, no way through", "Locked gates", "Roadworks, fenced off"][Math.floor(A.rnd() * 3)];
      let lanes = "";
      for (let L = 0; L < 3; L++) lanes += '<button class="lane" data-l="' + L + '"><span class="arr">' + ARROW[L] + '</span><span class="ln">' + LANES[L] + '</span><span class="what ' + (L === w ? "watch" : L === b ? "dead" : "clear") + '">' + (L === w ? "\ud83d\udc41 " + cue : L === b ? "\u26d4 " + dead : "Rain, and nobody") + "</span></button>";
      let pips = ""; for (let p = 0; p < 5; p++) pips += '<i class="' + (p < heat ? "on" : "") + '"></i>';
      A.render('<div class="tailgame" id="tailgame"><div class="tg-top"><span>Corner ' + (i + 1) + " of " + N + '</span><span class="heat">Heat <span class="hp">' + pips + "</span></span></div>" +
        (limit ? '<div class="tg-timer"><i id="tgbar"></i></div>' : '<div class="tg-timer still"><i></i></div>') +
        '<div class="tg-lanes">' + lanes + '</div><div class="tg-msg" id="tgmsg">' + (i ? "" : "Swipe or tap the clear street.") + "</div></div>", limit ? "Pick the clear street before the bar runs out." : "No timer with reduced motion. Take your time.");
      document.querySelectorAll("[data-l]").forEach(function (b2) { b2.onclick = function () { pick(+b2.getAttribute("data-l")); }; });
      const g = $("tailgame"); let sx = 0, sy = 0;
      g.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
      g.addEventListener("touchend", function (e) { const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) pick(dx < 0 ? 0 : 2); else if (dy < -40) pick(1); });
      if (limit) { const bar = $("tgbar"); requestAnimationFrame(function () { bar.style.transitionDuration = limit + "ms"; bar.classList.add("run"); }); timer = setTimeout(function () { pick(-1); }, limit); }
    };
    const key = function (e) { if (!$("tailgame")) return document.removeEventListener("keydown", key); const m = { ArrowLeft: 0, ArrowUp: 1, ArrowRight: 2 }[e.key]; if (m != null) pick(m); };
    document.addEventListener("keydown", key);
    const pick = function (L) {
      if (busy || !$("tailgame")) return; busy = true; clearTimeout(timer);
      let msg, cls;
      if (L === cur.safe) { msg = "Clear. Nobody turns."; cls = "ok"; FEEL.buzz("tap"); }
      else if (L === cur.w) { heat += 2; msg = "He saw you. A cough, a newspaper folded."; cls = "bad"; FEEL.buzz("loss"); }
      else if (L === cur.b) { heat += 1; msg = "Dead end. You double back, past them."; cls = "bad"; FEEL.buzz("loss"); }
      else { heat += 1; msg = "You hesitated. They\u2019re closer."; cls = "bad"; FEEL.buzz("loss"); }
      const m = $("tgmsg"); m.textContent = msg; m.className = "tg-msg " + cls;
      document.querySelectorAll("[data-l]").forEach(function (b2) { if (+b2.getAttribute("data-l") === cur.safe) b2.classList.add("safe"); });
      setTimeout(function () { i++; if (i >= N || heat >= 6) { document.removeEventListener("keydown", key); A.advance(2); tailEnd(heat); } else corner(); }, FEEL.reduce || window.__SPY_FAST__ ? 150 : 650);
    };
    corner();
  }
  function tailEnd(heat, skipped) {
    window.__TAIL__ = null;
    const res = heat <= 1 ? "win" : heat <= 3 ? "mixed" : "loss";
    const ch = A.apply({ win: { secrecy: 8, safety: 4 }, mixed: { secrecy: -4 }, loss: { secrecy: -12, safety: -6 } }[res]);
    const body = skipped ? "You take the long way: two buses, a cathedral and a department store\u2019s back stairs. SPARE KEY reaches Pimlico clean. <b>Clean streets help tonight: +10% at the border.</b>"
      : { win: "Heat " + heat + ". Nobody follows you into Pimlico. <b>Clean streets help tonight: +10% at the border.</b>", mixed: "Heat " + heat + ". You lose most of them, but not all. Kesk will know something moved today.", loss: "Heat " + heat + ". They follow you to the door. <b>Kesk knows SPARE KEY is running: \u221215% at the border.</b>" }[res];
    A.finishCase("tail", res, null, skipped ? "The long way round" : "On foot, heat " + heat, D.SITS3.tail.head[res], ch, { win: "CLEAN", mixed: "SEEN", loss: "FOLLOWED" }[res], body, '<div class="kbwrap"><img class="vignette" src="' + pic("tail-street") + '" alt="" style="object-position:center 40%"></div>', "The street game feeds the exfiltration.");
  }

  // ---------- the listening pod ----------
  const POD = [
    { t: "Navy divers from a trawler", d: "A fishing boat with a decompression chamber where the fish should be. Slow and careful.", risk: "low", hrs: 3, mod: 4, win: { secrecy: 10 }, mixed: { secrecy: -2 }, loss: { safety: -10, secrecy: -6 } },
    { t: "Send the submarine", d: "In and out in one night. If it goes wrong, it goes very wrong.", risk: "high", hrs: 2, mod: 18, pm: 50, win: { secrecy: 8, capital: 6 }, mixed: { capital: -6 }, loss: { capital: -14, trust: -8 } },
    { t: "A wind-farm survey ship", d: "A cover story with a hull: a survey licence, a crane, a very bored crew.", risk: "med", hrs: 3, mod: 0, win: { secrecy: 6, trust: 4 }, mixed: { trust: -4 }, loss: { trust: -8, secrecy: -8 } }];
  function podOdds(a) { const s = S(); return clampP(56 + a.mod + dodds() + keskMod(a.risk) + (a.risk === "med" && s.meters.capital >= 60 ? 10 : 0) - (A.late("cable") ? 10 + A.late("cable") * 5 : 0)); }
  function cable() {
    const s = S(), c = D.SITS3.cable; let sel = null;
    const draw = function () {
      A.render('<div class="card dossier">' + head("cable") + A.LH + '<span class="stamp corner">SUBSEA</span><div class="kicker">' + c.where + " \u00b7 by " + A.hh(A.dueOf("cable")) + '</div><h2 style="margin-top:8px;padding-right:110px">' + c.title + "</h2><p>" + esc(c.brief) + "</p></div>" +
        POD.map(function (a, i) {
          const locked = a.pm && s.meters.capital < a.pm;
          return '<button class="card appr' + (sel === i ? " sel" : "") + (locked ? " locked" : "") + '" data-i="' + i + '"' + (locked ? " disabled" : "") + '><div class="t">' + (locked ? "\ud83d\udd12 " : "") + esc(a.t) + '</div><p style="margin:0">' + esc(a.d) + '</p><div class="chips">' +
            (locked ? '<span class="chip risk-high">No.10 won\u2019t sign off \u00b7 needs No.10 trust ' + a.pm + " (now " + s.meters.capital + ")</span>" :
              '<span class="chip odds">' + podOdds(a) + '% chance</span><span class="chip risk-' + a.risk + '">' + { low: "Low risk", med: "Some risk", high: "High risk" }[a.risk] + '</span><span class="chip time">\u23f1 ' + a.hrs + "h</span>" + (a.pm ? '<span class="chip pmchip">No.10 signed off</span>' : "") + (a.risk === "med" && s.meters.capital >= 60 ? '<span class="chip risk-low">No.10 lends the licence +10%</span>' : "") + (keskMod(a.risk) ? '<span class="chip kesk">Kesk expects this \u00b7 \u2212' + keskHit() + "%</span>" : "")) + "</div></button>";
        }).join("") +
        '<div class="sticky-go"><button class="btn primary" id="go"' + (sel == null ? " disabled" : "") + ">" + (sel == null ? "Choose how" : "Go \u2014 " + esc(POD[sel].t)) + '</button></div><button class="btn ghost" id="back">Back to the brief</button>', "A pod on the line lets us hear Kesk hunting tonight: up to +10% at the border.");
      document.querySelectorAll("[data-i]").forEach(function (b) { b.onclick = function () { sel = +b.getAttribute("data-i"); draw(); }; });
      $("go").onclick = function () {
        const a = POD[sel], p = podOdds(a), res = roll(p);
        s.styles = s.styles || { low: 0, med: 0, high: 0 }; s.styles[a.risk]++;
        A.advance(a.hrs); const ch = A.apply(a[res]);
        const body = { win: "The pod is on the line by dusk. <b>From ten tonight we\u2019ll hear the Grey House calling its border posts: +10% at the border.</b>", mixed: "The pod is on, but the signal is thin. We\u2019ll hear some of it: +5% at the border.", loss: "A Varenian trawler sat over the spot all afternoon. The pod never went on. We go tonight deaf." }[res];
        A.finishCase("cable", res, null, a.t, c.head[res], ch, { win: "TAPPED", mixed: "FAINT", loss: "ABORTED" }[res], body, '<div class="kbwrap"><img class="vignette" src="' + pic(res === "loss" ? "v-loss" : "v-cabletap") + '" alt=""></div>', "The pod feeds the exfiltration.");
      };
      $("back").onclick = A.briefing;
    };
    draw();
  }

  // ---------- the exfiltration: signal, car, checkpoint, barrier ----------
  function common() {
    const s = S(), f = flags(), list = [];
    list.push(f.caught ? ["Mole caught", 10] : ["Mole still free", -10]);
    if (s.done.tail) list.push({ win: ["Clean streets", 10], mixed: ["Partly seen", 0], loss: ["Followed in London", -15] }[s.done.tail]);
    if (s.done.cable) list.push({ win: ["Listening pod", 10], mixed: ["Faint pod", 5], loss: ["No pod", 0] }[s.done.cable]);
    if (s.done.bath && s.done.bath !== "loss") list.push(["Her note from Bath", 5]);
    if (A.late("exfil")) list.push(["Late", -(10 + A.late("exfil") * 5)]);
    return list.filter(function (x) { return x[1]; });
  }
  const sum = function (l) { return l.reduce(function (t, x) { return t + x[1]; }, 0); };
  function exfil() {
    const s = S(), f = flags(), X = { stage: 0, alarms: 0, picks: [], driver: null, car: null, notes: [] };
    const STAGES = [
      { key: "signal", img: "v-signal", title: "The signal", tx: "At seven, Kessgrad time, she walks down Marshal\u2019s Boulevard. If she sees a man with a <b>green shopping bag</b> eating a chocolate bar, she knows we\u2019re coming. One look, no more.",
        opts: [{ t: "On the dot, as SPARE KEY says", d: "Seven sharp. The watchers know the routine too.", risk: "low", mod: 0 },
          { t: "In the market crowd, ten minutes early", d: "Harder to spot him; harder for her too.", risk: "med", mod: 4 },
          { t: "Two passes, an hour apart", d: "Doubles her chance to see. Doubles theirs.", risk: "high", mod: 8 }], extra: function () { return s.done.york === "loss" || !s.done.york ? [["No SPARE KEY from York", -15]] : [["SPARE KEY in hand", 5]]; } },
      { key: "car", img: "v-border", title: "The car", tx: "Who drives, and in what? She\u2019ll be in the boot, under a picnic blanket, for three hours.", car: true },
      { key: "dog", img: "v-border", title: "The checkpoint", tx: "A guard walks an Alsatian along the queue. It slows at every boot. <b>She\u2019s holding her breath under the blanket.</b>",
        opts: [{ t: "Crisps for the dog", d: "Cheese and onion, scattered by the back wheel. Dogs are dogs.", risk: "low", mod: 6 },
          { t: "Chat to the guard, engine idling", d: "Warm exhaust, a British accent, a complaint about the weather.", risk: "med", mod: 2 },
          { t: "Turn the radio up", d: "Loud pop music, a bored tourist. Bold.", risk: "high", mod: 0 },
          { t: "Offer the tall man in a swap", d: "Kesk gets his man back, tonight, on this road. The guards are told to wave one car through.", risk: "med", mod: 32, swap: true }],
        extra: function () { return f.exit === "mixed" ? [["Driver\u2019s border routine", 5]] : []; } },
      { key: "barrier", img: "v-border", title: "The barrier", tx: "One more barrier. The night shift changes at ten. Go now in the queue, or wait in a lay-by for the new shift?",
        opts: [{ t: "Go now, with the queue", d: "Tired guards at the end of a shift. No waiting.", risk: "high", mod: 0 },
          { t: "Wait for the shift change", d: "Fresh guards, but a calm queue. One more hour in the boot.", risk: "low", mod: 12, hrs: 1 }] }
    ];
    const swapOK = function () { return f.exit === "win" && s.meters.capital >= 50; };
    const driverMod = function (k) { if (!k) return 0; const a = A.AG(k); return a.skill * 4 - s.stress[k] * 4 + (s.loyal[k] - 3) * 3 + (f.call && f.call.choice === "stand" && f.call.k === k ? 10 : 0); };
    const odds = function (o, st) { return clampP(44 + dodds() + o.mod + sum(common()) + sum(st.extra ? st.extra() : []) + keskMod(o.risk) + driverMod(X.driver) + (X.car === "dip" ? 8 : 0)); };
    const banned = function (k) { return f.call && f.call.choice === "deny" && f.call.k === k; };
    const draw = function (sel, sel2) {
      const st = STAGES[X.stage];
      const helps = common().concat(st.extra ? st.extra() : []);
      let body = "";
      if (st.car) {
        const free = s.roster.filter(function (k) { return !s.used[k]; });
        body = '<div class="kicker" style="margin:6px 0">Who drives?</div><div class="agents">' + free.map(function (k) {
          return A.agentCard(k, banned(k) ? '<div class="fit bad">Won\u2019t drive for you after Wednesday</div>' : '<div class="fit">' + (driverMod(k) >= 0 ? "+" : "") + driverMod(k) + "% at every stage" + (f.call && f.call.choice === "stand" && f.call.k === k ? " \u00b7 owes you" : "") + "</div>", sel === k, banned(k), "data-d");
        }).join("") + (free.length ? "" : '<button class="card appr' + (sel === "kite" ? " sel" : "") + '" data-d="kite"><div class="t">Kite drives</div><p style="margin:0">Nobody else is free. Kite hasn\u2019t driven abroad since 1998.</p></button>') + "</div>" +
          '<div class="kicker" style="margin:6px 0">What car?</div>' +
          '<button class="card appr' + (sel2 === "hire" ? " sel" : "") + '" data-car="hire"><div class="t">A hired estate car, false plates</div><p style="margin:0">Roomy boot. Nobody\u2019s problem if it\u2019s searched.</p></button>' +
          '<button class="card appr' + (sel2 === "dip" ? " sel" : "") + (s.meters.capital < 45 ? " locked" : "") + '" data-car="dip"' + (s.meters.capital < 45 ? " disabled" : "") + '><div class="t">' + (s.meters.capital < 45 ? "\ud83d\udd12 " : "") + 'A diplomatic car</div><p style="margin:0">Guards hate searching them. Needs No.10\u2019s blessing.</p><div class="chips">' + (s.meters.capital < 45 ? '<span class="chip risk-high">No.10 won\u2019t sign off \u00b7 needs No.10 trust 45 (now ' + s.meters.capital + ")</span>" : '<span class="chip pmchip">No.10 signed off</span><span class="chip risk-low">+8% at every stage</span>') + "</div></button>";
      } else {
        body = st.opts.map(function (o, i) {
          if (o.swap && f.exit !== "win") return "";
          const locked = o.swap && !swapOK();
          return '<button class="card appr' + (sel === i ? " sel" : "") + (locked ? " locked" : "") + '" data-i="' + i + '"' + (locked ? " disabled" : "") + '><div class="t">' + (locked ? "\ud83d\udd12 " : "") + esc(o.t) + '</div><p style="margin:0">' + esc(o.d) + '</p><div class="chips">' +
            (locked ? '<span class="chip risk-high">No.10 won\u2019t sign off \u00b7 needs No.10 trust 50 (now ' + s.meters.capital + ")</span>" : '<span class="chip odds">' + odds(o, st) + '% chance</span><span class="chip risk-' + o.risk + '">' + { low: "Low risk", med: "Some risk", high: "High risk" }[o.risk] + "</span>" + (o.hrs ? '<span class="chip time">\u23f1 +1h</span>' : "") + (keskMod(o.risk) ? '<span class="chip kesk">Kesk expects this \u00b7 \u2212' + keskHit() + "%</span>" : "")) + "</div></button>";
        }).join("");
      }
      const ready = st.car ? sel && sel2 : sel != null;
      A.render('<div class="step x4">' + STAGES.map(function (z, j) { return '<i class="' + (j <= X.stage ? "on" : "") + (X.picks[j] === "fail" ? " bad" : "") + '"></i>'; }).join("") + '</div><div class="card dossier exfil">' + '<div class="chead"><img src="' + pic(st.img) + '" alt=""></div>' + A.LH + '<span class="stamp corner">' + (X.alarms ? X.alarms + " ALARM" + (X.alarms > 1 ? "S" : "") : "QUIET") + '</span><div class="kicker">The Green Coat \u00b7 stage ' + (X.stage + 1) + " of 4 \u00b7 " + A.hh(s.hour) + '</div><h2 style="margin-top:8px;padding-right:110px">' + st.title + "</h2><p>" + st.tx + "</p>" +
        (helps.length ? '<div class="chips helps">' + helps.map(function (h) { return '<span class="chip ' + (h[1] > 0 ? "risk-low" : "risk-high") + '">' + esc(h[0]) + " " + (h[1] > 0 ? "+" : "\u2212") + Math.abs(h[1]) + "%</span>"; }).join("") + "</div>" : "") + "</div>" + body +
        '<div class="sticky-go"><button class="btn primary" id="go"' + (ready ? "" : " disabled") + ">" + (ready ? (st.car ? "Drive" : "Go") : "Decide") + "</button></div>" + (X.stage === 0 ? '<button class="btn ghost" id="back">Not yet</button>' : ""), "Two alarms and she doesn\u2019t make it.");
      document.querySelectorAll("[data-i]").forEach(function (b) { b.onclick = function () { draw(+b.getAttribute("data-i")); }; });
      document.querySelectorAll("[data-d]").forEach(function (b) { const k = b.getAttribute("data-d"); if (!banned(k)) b.onclick = function () { draw(k, sel2); }; });
      document.querySelectorAll("[data-car]").forEach(function (b) { b.onclick = function () { draw(sel, b.getAttribute("data-car")); }; });
      if ($("back")) $("back").onclick = A.briefing;
      $("go").onclick = function () {
        if (st.car) { X.driver = sel === "kite" ? null : sel; X.car = sel2; if (X.driver) s.used[X.driver] = true; X.picks[X.stage] = "ok"; X.notes.push((X.driver ? A.first(X.driver) : "Kite") + " drives the " + (sel2 === "dip" ? "diplomatic car" : "hired estate") + "."); X.stage++; return draw(null, null); }
        const o = st.opts[sel], p = odds(o, st);
        s.styles = s.styles || { low: 0, med: 0, high: 0 }; s.styles[o.risk]++;
        if (o.swap) A.apply({ capital: -6 });
        const fz = FORCE(); let ok;
        if (fz === "win") ok = true; else if (fz === "loss") ok = false; else if (fz === "mixed") ok = st.key !== "dog"; else ok = A.rnd() * 100 < p;
        A.advance(1 + (o.hrs || 0));
        X.picks[X.stage] = ok ? "ok" : "fail"; if (!ok) X.alarms++;
        const txt = {
          signal: ok ? "Seven o\u2019clock. A woman in a green coat glances at a man with a green bag, and buys a newspaper she doesn\u2019t read. <b>She\u2019s seen it.</b>" : "She looks right at him. So does a man in a grey raincoat across the road. <b>An alarm: Kesk\u2019s people are moving.</b>",
          dog: ok ? "The dog sniffs the boot, loses interest, and wanders off. The guard waves you on." : "The dog sits down by the boot and won\u2019t move. A second guard comes over. <b>An alarm.</b> You talk your way through, just.",
          barrier: ok ? "The barrier lifts. Pine forest, a lay-by, and the border behind you." : "A phone rings in the guard hut as you reach the barrier. <b>An alarm.</b>"
        }[st.key];
        const nextStage = function () { X.stage++; if (X.stage >= STAGES.length) return finish(); draw(null, null); };
        A.meters(); A.render('<div class="card outcome ' + (ok ? "win" : "loss") + '"><span class="stamp thud">' + (ok ? "CLEAR" : "ALARM") + '</span><div class="kbwrap"><img class="vignette" src="' + pic(st.img) + '" alt=""></div><h2>' + st.title + "</h2><p>" + txt + '</p><p class="oddsline">' + p + "% odds \u00b7 " + X.alarms + " alarm" + (X.alarms === 1 ? "" : "s") + " \u00b7 " + A.hh(s.hour) + '</p></div><button class="btn primary" id="go">' + (X.stage + 1 >= STAGES.length ? "See what happened" : "Next") + "</button>", "Every stage counts.");
        $("go").onclick = nextStage;
      };
    };
    const finish = function () {
      const res = X.alarms === 0 ? "win" : X.alarms === 1 ? "mixed" : "loss";
      let delta = { win: { trust: 10, capital: 12, secrecy: 10, safety: 6 }, mixed: { capital: 4, safety: -6 }, loss: { trust: -12, capital: -12, safety: -10 } }[res];
      let extra = "";
      if (s.deal === "lie" && res !== "loss") { delta = Object.assign({}, delta); delta.capital = (delta.capital || 0) - 20; extra = " <b>At midnight Hale rings again. She knows. \u201cYou lied to me, C.\u201d</b> Archer stays in a Varenian cell."; s.heads.push("PM \u2018misled\u2019 over Varenia talks, say sources"); }
      if (X.driver) { s.stress[X.driver] = A.clamp5(s.stress[X.driver] + (res === "loss" ? 2 : 1)); s.loyal[X.driver] = A.clamp5(s.loyal[X.driver] + (res === "win" ? 1 : res === "loss" ? -1 : 0)); }
      const ch = A.apply(delta);
      const dn = X.driver ? A.first(X.driver) : "Kite";
      const body = { win: "Three hours in a boot. At a lay-by in the pine forest on our side, " + dn + " opens it. <b>She climbs out in a green coat two sizes too big and asks for a cup of tea.</b>",
        mixed: "She\u2019s out. " + dn + " isn\u2019t: held at the barrier for questioning, to be expelled in the morning. <b>She is in a British car on the far side, shaking, and alive.</b>",
        loss: "The guards open the boot at the barrier. She is taken back towards Kessgrad in a grey car, quietly, without a scene. " + dn + " is sent home at dawn." }[res] + extra;
      A.finishCase("exfil", res, X.driver, X.notes[0] + " " + X.alarms + " alarm" + (X.alarms === 1 ? "" : "s"), D.SITS3.exfil.head[res], ch, { win: "HOME", mixed: "OUT", loss: "TAKEN" }[res], body, '<div class="kbwrap"><img class="vignette" src="' + pic("flash-green") + '" alt="" style="object-position:center 35%"></div>', res === "loss" ? "Kesk wins this round." : "The Green Coat is home.");
    };
    draw(null, null);
  }

  // ---------- the end of Day 3 ----------
  function ending() { const s = S(); return s.deal === "deal" ? "traded" : s.done.exfil || "loss"; }
  function lastHead() { return { win: "Mystery woman \u2018safe in Britain\u2019, sources say", mixed: "Varenia expels British \u2018tourist\u2019", loss: "Varenia parades \u2018captured spy\u2019 on state TV", traded: "Freed lorry driver home for the weekend" }[ending()]; }
  function flash() {
    const e = ending();
    const body = {
      win: "LINDEN is home. In a safe house in the Cotswolds she drinks four cups of tea and asks for you by name. Then she says the thing nobody wants to hear: <b>\u201cYour mole was not the only one. Kesk has a friend at Number 10.\u201d</b>",
      mixed: "LINDEN is out, but we left one of ours at the barrier. Kesk will trade, and he\u2019ll want a lot. At 23:58 she tells you: <b>\u201cKesk has a friend at Number 10.\u201d</b>",
      loss: "LINDEN is back in Kessgrad. A last letter arrives at the front desk, three words in a familiar hand: <b>\u201cBetter luck, C.\u201d</b> Pinned to it, a scrap of green wool.",
      traded: "Tom Archer lands at a London airfield to cameras and flowers. Nobody mentions a woman in green. A letter arrives at midnight: <b>\u201cA pleasure doing business. K.\u201d</b>"
    }[e];
    return '<div class="flash-card green" id="flash"><div class="bar"><span class="stamp">FLASH \u00b7 MOST IMMEDIATE</span><span class="time">23:58 \u00b7 ' + (e === "win" || e === "mixed" ? "THE BORDER" : "LONDON") + '</span></div><div class="tele"><span class="hdr">TO: C &nbsp;\u00b7&nbsp; FROM: KITE, ALBION HOUSE<br>HMG \u00b7 TOP SECRET \u00b7 UK EYES ONLY</span>C \u2014 ' + body + "<br><br>\u2014 Kite</div></div>";
  }
  function paperLead() {
    return {
      win: { lead: "QUIET NIGHT ON THE BORDER, AND A WOMAN IN GREEN", sub: "Varenia \u2018not aware\u2019 of any defection \u00b7 Grey House chief \u2018furious\u2019 \u00b7 No.10 silent" },
      mixed: { lead: "BRITON HELD AT VARENIAN BORDER", sub: "Embassy \u2018seeking consular access\u2019 \u00b7 Rumours of a defector \u00b7 Questions for Whitehall" },
      loss: { lead: "VARENIA PARADES \u2018BRITISH SPY RING\u2019 ON TV", sub: "Woman in green coat named as \u2018traitor\u2019 \u00b7 Albion House silent \u00b7 No.10 \u2018monitoring\u2019" },
      traded: { lead: "ARCHER COMES HOME", sub: "Lorry driver freed after six weeks \u00b7 PM praises \u2018quiet diplomacy\u2019 \u00b7 Varenia \u2018satisfied\u2019" }
    }[ending()];
  }

  window.AH3 = { briefingIntro: briefingIntro, line: line, open: open, afterCase: afterCase, oddsMod: oddsMod, chips: chips, interrupt: interrupt, followStrip: followStrip, prep: prep, flash: flash, paperLead: paperLead, lastHead: lastHead, fav: fav };
})();
