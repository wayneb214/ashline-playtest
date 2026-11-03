/* Quiet Hours — one agency day. Prototype. Everything is fictional: the state, the agencies,
   the companies and the people are invented; only the map is real. No real tradecraft. */
(function () {
  "use strict";
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  const IMG = "../img/";
  const seedM = /[?&]seed=(\d+)/.exec(location.search);
  let seed = seedM ? +seedM[1] : (Date.now() % 1e9);
  const rnd = function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  // ---------- content ----------
  const METERS = [
    { id: "trust", name: "Public trust" }, { id: "capital", name: "Political capital" },
    { id: "safety", name: "Agent safety" }, { id: "secrecy", name: "Secrecy" }
  ];
  const AGENTS = {
    lena: { name: "Lena Novak", role: "Case officer · people person", img: "lena.jpg", skill: 4, loyalty: 4, stress: 1, cover: 3, good: ["defector", "leak"] },
    mira: { name: "Mira Sol", role: "Watcher · steady hands", img: "mira.jpg", skill: 3, loyalty: 5, stress: 2, cover: 4, good: ["mole", "sabotage"] },
    ren: { name: "Ren Okafor", role: "Field lead · brilliant, worn thin", img: "ren.jpg", skill: 5, loyalty: 2, stress: 3, cover: 2, good: ["sabotage", "defector"] }
  };
  const SITS = {
    defector: {
      icon: "\u{1F6AA}", title: "A defector wants out", where: "Vienna", lat: 48.21, lon: 16.37, due: 18,
      brief: "A cipher clerk from the Grey Directorate (a rival service) says she\u2019ll trade their codebook for a new life. She\u2019s being watched.",
      approaches: [
        { t: "Slow and quiet", d: "Meet in a crowded caf\u00e9, move her over two days.", mod: 10, risk: "low", stress: 1, win: { secrecy: 6, safety: 4, capital: 4 }, mixed: { secrecy: -2, capital: 2 }, loss: { safety: -8, capital: -6 } },
        { t: "Extract her tonight", d: "Car at the back door. Fast, loud, decisive.", mod: -8, risk: "high", stress: 2, win: { capital: 14, secrecy: 2 }, mixed: { secrecy: -8, capital: 6 }, loss: { safety: -16, trust: -6, secrecy: -10 } },
        { t: "Make it official", d: "Ask the embassy to grant asylum in the open.", mod: 18, risk: "med", stress: 0, win: { trust: 8, capital: -6, secrecy: -10 }, mixed: { capital: -10, secrecy: -10 }, loss: { capital: -14, trust: -4 } }
      ],
      head: { win: "Rival service quietly loses a senior clerk", mixed: "Diplomatic chill after mystery Vienna visa", loss: "Woman detained at Vienna station; officials silent" }
    },
    mole: {
      icon: "\u{1F441}", title: "A mole in the ministry", where: "Home office", due: 20,
      brief: "Three operations blown in a month. Someone inside is talking. Kite has two suspects and no proof.",
      approaches: [
        { t: "Barium test", d: "Feed each suspect a different fake detail. See which one leaks.", mod: 8, risk: "low", stress: 1, win: { secrecy: 12, safety: 6 }, mixed: { secrecy: 4 }, loss: { secrecy: -8, safety: -4 } },
        { t: "Confront them", d: "Bring both in today and push hard.", mod: -6, risk: "high", stress: 2, win: { secrecy: 14, capital: 6 }, mixed: { trust: -4, secrecy: 2 }, loss: { trust: -8, capital: -10, secrecy: -6 } },
        { t: "Leave it for now", d: "Watch, wait, keep them away from anything big.", mod: 30, risk: "med", stress: 0, win: { secrecy: 2 }, mixed: { secrecy: -6 }, loss: { secrecy: -12, safety: -6 } }
      ],
      head: { win: "Ministry official resigns \u2018for family reasons\u2019", mixed: "Unease at the ministry as staff face interviews", loss: "Another agency operation reportedly compromised" }
    },
    leak: {
      icon: "\u{1F4F0}", title: "A report has leaked", where: "Copenhagen", lat: 55.68, lon: 12.57, due: 15,
      brief: "A journalist at The Northern Ledger has a copy of your agency\u2019s budget report. It names a source. The story runs this afternoon.",
      approaches: [
        { t: "Talk to the editor", d: "Explain the danger and ask them to hold the name.", mod: 12, risk: "low", stress: 1, win: { safety: 10, trust: 6 }, mixed: { safety: 4, secrecy: -4 }, loss: { safety: -8, secrecy: -8 } },
        { t: "Get the file back", d: "Quietly recover the copy before it\u2019s printed.", mod: -10, risk: "high", stress: 2, win: { secrecy: 12, safety: 8 }, mixed: { trust: -8, secrecy: 4 }, loss: { trust: -16, capital: -10 } },
        { t: "Go public first", d: "Announce the report yourself and shape the story.", mod: 20, risk: "med", stress: 0, win: { trust: 12, secrecy: -10 }, mixed: { trust: 4, secrecy: -10, safety: -4 }, loss: { trust: -6, secrecy: -14 } }
      ],
      head: { win: "Ledger story runs without naming sources", mixed: "Budget leak story dominates the morning", loss: "Leaked spy report names informant; uproar in parliament" }
    },
    sabotage: {
      icon: "\u26A1", title: "Sabotage threat", where: "Bergen or Rotterdam?", lat: 60.39, lon: 5.32, due: 21, flash: true,
      brief: "Someone plans to hit Halvard Marine\u2019s cable station tonight. Two reports disagree on where. You need to decide what to believe first.",
      approaches: [
        { t: "Guard it quietly", d: "Watchers on site, police on call.", mod: 10, risk: "low", stress: 1, win: { safety: 6, secrecy: 6, trust: 4 }, mixed: { trust: -4 }, loss: { trust: -10, safety: -6 } },
        { t: "Catch them in the act", d: "Let them come, then close the net.", mod: -8, risk: "high", stress: 2, win: { capital: 14, trust: 10 }, mixed: { safety: -8, capital: 4 }, loss: { safety: -14, trust: -12 } },
        { t: "Raise a public alert", d: "Shut the site and announce a threat.", mod: 22, risk: "med", stress: 0, win: { trust: 6, secrecy: -8, capital: -4 }, mixed: { trust: -2, capital: -8 }, loss: { trust: -8, capital: -10 } }
      ],
      head: { win: "Arrests at cable station; outage averted", mixed: "Cable station closed overnight in \u2018security drill\u2019", loss: "Blackout as harbour data hub hit; questions for the agency" }
    }
  };
  const PLACES = { Bergen: [60.39, 5.32], Rotterdam: [51.92, 4.48] };
  const REPORTS = [
    { id: "Bergen", src: "Human source \u00b7 via Mira", grade: "Usually reliable", q: "\u201cThey\u2019re hitting the Bergen landing station. Tonight, after the shift change. I saw the van.\u201d" },
    { id: "Rotterdam", src: "Intercepted chatter", grade: "Unconfirmed", q: "\u201cLet them watch the north. The real work is at the Rotterdam hub.\u201d" }
  ];
  const TRUTH = "Rotterdam";

  // ---------- state ----------
  let S;
  function fresh() {
    S = { hour: 8, meters: { trust: 55, capital: 55, safety: 60, secrecy: 55 }, order: ["defector", "mole", "leak"], done: {}, used: {}, stress: {}, heads: ["Quiet morning in the capital as markets open"], log: [], belief: null, flashShown: false };
    Object.keys(AGENTS).forEach(function (k) { S.stress[k] = AGENTS[k].stress; });
  }

  // ---------- chrome ----------
  function meters(changes) {
    $("meters").innerHTML = METERS.map(function (m) {
      const v = S.meters[m.id], c = v >= 60 ? "var(--green)" : v >= 40 ? "var(--cyan)" : v >= 25 ? "var(--amber)" : "var(--red)";
      const d = changes && changes[m.id];
      return '<div class="meter"><div class="row"><span>' + m.name + "</span><span>" + (d ? '<span class="delta ' + (d > 0 ? "up" : "down") + '">' + (d > 0 ? "+" : "") + d + "</span> " : "") + v + '</span></div><div class="bar"><div class="fill" style="width:' + v + "%;background:" + c + '"></div></div></div>';
    }).join("");
    $("clock").textContent = (S.hour < 10 ? "0" : "") + S.hour + ":00";
  }
  function ticker() { $("tk-run").innerHTML = S.heads.slice().reverse().map(function (h) { return "<b>\u25cf</b>" + esc(h); }).join(""); }
  function hint(t) { $("hint").textContent = t; }
  function chrome(on) { ["hud", "ticker", "hintbar"].forEach(function (id) { $(id).classList.toggle("hidden", !on); }); }
  function render(html, h) { const v = $("view"); v.innerHTML = html; window.scrollTo(0, 0); hint(h || ""); }
  function kite(text, mood) {
    return '<div class="kite card"><img class="portrait" src="' + IMG + "kite-" + (mood || "glass") + '.jpg" alt="Kite"><div class="bubble"><div class="who">Kite \u00b7 Chief adviser</div>' + text + "</div></div>";
  }
  function pips(n, cls, label) { let s = ""; for (let i = 1; i <= 5; i++) s += '<i class="' + (i <= n ? "on" : "") + '"></i>'; return '<div class="tr ' + cls + '">' + label + '<div class="pips">' + s + "</div></div>"; }

  // ---------- map ----------
  function P(lat, lon) { return [(lon + 180) / 360 * 1000, (75 - lat) * 440 / 135]; }
  function map(focus) {
    const land = (window.ASHLINE_DATA && window.ASHLINE_DATA.LAND) || [];
    let g = "";
    for (let x = 490; x <= 590; x += 7) g += '<line class="grid" x1="' + x + '" y1="20" x2="' + x + '" y2="110"/>';
    for (let y = 25; y <= 110; y += 7) g += '<line class="grid" x1="480" y1="' + y + '" x2="600" y2="' + y + '"/>';
    let pins = "";
    S.order.forEach(function (id) {
      const s = SITS[id]; if (s.lat == null) return;
      const ll = id === "sabotage" && S.belief && PLACES[S.belief] ? PLACES[S.belief] : [s.lat, s.lon];
      const p = P(ll[0], ll[1]), cls = "pin" + (S.done[id] ? " done" : "") + (s.flash && !S.done[id] ? " flash" : "");
      const right = id !== "sabotage";
      pins += '<g class="' + cls + '" transform="translate(' + p[0].toFixed(1) + "," + p[1].toFixed(1) + ')"><circle class="ring" r="3"/><circle class="core" r="1.4"/><text x="' + (right ? 2.6 : -2.6) + '" y="1.2" text-anchor="' + (right ? "start" : "end") + '">' + esc(id === "sabotage" ? (S.belief || "Bergen?") : s.where) + "</text></g>";
    });
    return '<div class="map"><svg viewBox="488 34 92 58" role="img" aria-label="Map of northern Europe with today\u2019s situations">' + g + land.map(function (d) { return '<path class="land" d="' + d + '"/>'; }).join("") + pins + "</svg></div>";
  }

  // ---------- screens ----------
  function intro() {
    chrome(false);
    render(
      '<div class="intro-hero"><img src="' + IMG + 'intro-5.jpg" alt=""><div class="cap"><div class="kicker">Quiet Hours \u00b7 Prototype</div><h1>You run the agency.</h1></div></div>' +
      '<div class="card"><p>You lead the <strong>Republic of Aldmark</strong>, a small northern state (invented). Your spies work for you, but they\u2019re people: brave, tired, sometimes disloyal.</p>' +
      '<p>Today four problems land on your desk. You have <strong>three agents</strong> and <strong>one day</strong>. You can\u2019t fix everything.</p>' +
      '<div class="goal"><div><b>Choose who goes</b>Each agent has skills, nerves and secrets.</div><div><b>Choose how</b>Quiet, bold or political. Every choice has a cost.</div><div><b>Judge the intel</b>Reports disagree. Decide what\u2019s true.</div><div><b>Keep your balance</b>Trust, capital, safety, secrecy.</div></div>' +
      '<button class="btn primary" id="go">Start the day</button></div>' +
      '<p style="text-align:center;font-size:11px;color:var(--text-3)">A work of fiction. All states, agencies, companies and people are invented.</p>');
    $("go").onclick = function () { chrome(true); meters(); ticker(); briefing(); };
  }

  function remaining() { return S.order.filter(function (id) { return !S.done[id]; }); }
  function freeAgents() { return Object.keys(AGENTS).filter(function (k) { return !S.used[k]; }); }

  function briefing() {
    if (!freeAgents().length || !remaining().length) return summary();
    const first = !S.log.length, flash = SITS.sabotage && S.order.indexOf("sabotage") >= 0 && !S.done.sabotage;
    const line = first ? "Morning. Three problems on the map, three agents on the bench. Pick the one that worries you most. Watch the deadlines."
      : flash && !S.flashShown ? "<b>Flash traffic.</b> A sabotage threat just came in for tonight. That one\u2019s mine to worry about \u2014 and now yours."
      : "Next. " + freeAgents().length + " agent" + (freeAgents().length > 1 ? "s" : "") + " left. Whatever you don\u2019t handle today handles itself, badly.";
    if (flash) S.flashShown = true;
    let list = "";
    S.order.forEach(function (id) {
      const s = SITS[id], done = S.done[id], late = !done && S.hour >= s.due;
      list += '<button class="card sit' + (done ? " done" : "") + (s.flash && !done ? " flash" : "") + '" data-sit="' + id + '"' + (done ? " disabled" : "") + '><span class="ic">' + s.icon + '</span><span><div class="t">' + esc(s.title) + '</div><div class="s">' + esc(s.where) + '</div></span><span class="dl">' +
        (done ? (done === "win" ? "\u2713 handled" : done === "mixed" ? "~ partial" : "\u2717 failed") : late ? "LATE" : "by " + s.due + ":00") + "</span></button>";
    });
    render('<div class="kicker">Morning briefing</div>' + kite(line, flash && S.log.length === 1 ? "worried" : "smirk") + map() + list,
      "Tap a situation to deal with it.");
    document.querySelectorAll("[data-sit]").forEach(function (b) { b.onclick = function () { const id = b.getAttribute("data-sit"); id === "sabotage" && !S.belief ? judgement() : pickAgent(id); }; });
  }

  function judgement() {
    let sel = null;
    const draw = function () {
      render('<div class="kicker">Intel judgement \u00b7 Sabotage threat</div><h2>Two reports. One truth.</h2>' +
        kite("They can\u2019t both be right. Mira\u2019s source has been good before \u2014 but he was paid twice this month, and not only by us. The intercept is thin, but it\u2019s their own voice.", "worried") +
        '<div class="reports">' + REPORTS.map(function (r, i) {
          return (i ? '<div class="vs">VS</div>' : "") + '<button class="card report' + (sel === r.id ? " sel" : "") + '" data-r="' + r.id + '"><div class="src"><span>' + r.src + '</span><span class="grade">' + r.grade + '</span></div><div class="q">' + r.q + '</div><div class="chips"><span class="chip">Defend ' + r.id + "</span></div></button>";
        }).join("") +
        '<div class="vs">OR</div><button class="card report' + (sel === "split" ? " sel" : "") + '" data-r="split"><div class="src"><span>Hedge</span><span class="grade">Weaker everywhere</span></div><div class="q" style="font-style:normal">Split your people between both sites.</div><div class="chips"><span class="chip risk-med">Odds \u221212%</span><span class="chip risk-low">Can\u2019t be completely wrong</span></div></button></div>' +
        '<div class="sticky-go"><button class="btn primary" id="go"' + (sel ? "" : " disabled") + ">" + (sel ? (sel === "split" ? "Cover both sites" : "Believe it \u2014 defend " + sel) : "Choose what to believe") + "</button></div>",
        "Pick the report you trust. Then send someone.");
      document.querySelectorAll("[data-r]").forEach(function (b) { b.onclick = function () { sel = b.getAttribute("data-r"); draw(); }; });
      $("go").onclick = function () { S.belief = sel; pickAgent("sabotage"); };
    };
    draw();
  }

  function oddsFor(id, k, a) {
    const ag = AGENTS[k], s = SITS[id];
    let o = 30 + ag.skill * 6 + (ag.good.indexOf(id) >= 0 ? 12 : 0) + a.mod - S.stress[k] * 4 + ag.cover * 2;
    if (id === "mole" && ag.loyalty <= 2) o -= 12;
    if (S.hour >= s.due) o -= 15;
    if (id === "sabotage") { if (S.belief === "split") o -= 12; else if (S.belief !== TRUTH) o = Math.min(o, 12); }
    return Math.max(8, Math.min(92, Math.round(o)));
  }

  function pickAgent(id, chosen) {
    const s = SITS[id];
    let pick = chosen || null;
    const draw = function () {
      const cards = Object.keys(AGENTS).map(function (k) {
        const a = AGENTS[k], used = S.used[k], st = S.stress[k], fit = a.good.indexOf(id) >= 0;
        return '<button class="card agent' + (pick === k ? " sel" : "") + (used ? " used" : "") + '" data-a="' + k + '"><img class="portrait" src="' + IMG + a.img + '" alt=""><div style="flex:1;min-width:0"><div class="nm">' + a.name + (used ? " \u00b7 out" : "") + '</div><div class="role">' + a.role + '</div><div class="traits">' +
          pips(a.skill, "", "Skill") + pips(a.loyalty, "", "Loyalty") + pips(st, "stress" + (st >= 4 ? " high" : ""), "Stress") + pips(a.cover, "", "Cover") + '</div><div class="fit' + (fit ? "" : " bad") + '">' + (fit ? "\u2713 Good fit for this job" : "Not their speciality") + (id === "mole" && a.loyalty <= 2 ? " \u00b7 loyalty in doubt" : "") + "</div></div></button>";
      }).join("");
      render('<div class="step"><i class="on"></i><i></i></div><div class="kicker">' + esc(s.where) + " \u00b7 due " + s.due + ":00" + (S.hour >= s.due ? " \u00b7 LATE" : "") + "</div><h2>" + esc(s.title) + "</h2><p>" + esc(s.brief) + (id === "sabotage" ? " <strong>You\u2019re defending: " + (S.belief === "split" ? "both sites" : S.belief) + ".</strong>" : "") + '</p><div class="agents">' + cards + '</div><div class="sticky-go"><button class="btn primary" id="go"' + (pick ? "" : " disabled") + ">" + (pick ? "Send " + AGENTS[pick].name.split(" ")[0] : "Choose an agent") + '</button></div><button class="btn" id="back" style="margin-top:8px;min-height:44px;font-size:14px">Back to briefing</button>',
        "Step 1 of 2 \u00b7 Who goes? High stress makes mistakes more likely.");
      document.querySelectorAll("[data-a]").forEach(function (b) { b.onclick = function () { pick = b.getAttribute("data-a"); draw(); }; });
      $("go").onclick = function () { approach(id, pick); };
      $("back").onclick = briefing;
    };
    draw();
  }

  function approach(id, k) {
    const s = SITS[id];
    let sel = null;
    const fmt = function (o) { return Object.keys(o).map(function (m) { const n = METERS.filter(function (x) { return x.id === m; })[0].name; return (o[m] > 0 ? "+" : "") + o[m] + " " + n; }).join(", "); };
    const draw = function () {
      const opts = s.approaches.map(function (a, i) {
        const odds = oddsFor(id, k, a);
        return '<button class="card appr' + (sel === i ? " sel" : "") + '" data-i="' + i + '"><div class="t">' + esc(a.t) + "</div><p style=\"margin:0\">" + esc(a.d) + '</p><div class="chips"><span class="chip odds">' + odds + '% success</span><span class="chip risk-' + a.risk + '">' + { low: "Low risk", med: "Medium risk", high: "High risk" }[a.risk] + '</span><span class="chip">Win: ' + esc(fmt(a.win)) + "</span></div></button>";
      }).join("");
      render('<div class="step"><i class="on"></i><i class="on"></i></div><div class="kicker">' + esc(s.title) + '</div><div class="kite card" style="align-items:center"><img class="portrait" src="' + IMG + AGENTS[k].img + '" alt=""><div><div class="nm" style="font-weight:800">' + AGENTS[k].name + '</div><div style="font-size:12px;color:var(--text-2)">Waiting on your call. How should I play it?</div></div></div>' + opts +
        '<div class="sticky-go"><button class="btn primary" id="go"' + (sel == null ? " disabled" : "") + ">" + (sel == null ? "Choose an approach" : "Go \u2014 " + esc(s.approaches[sel].t)) + '</button></div><button class="btn" id="back" style="margin-top:8px;min-height:44px;font-size:14px">Pick a different agent</button>',
        "Step 2 of 2 \u00b7 How? Safer plans pay less. Bold plans can backfire.");
      document.querySelectorAll("[data-i]").forEach(function (b) { b.onclick = function () { sel = +b.getAttribute("data-i"); draw(); }; });
      $("go").onclick = function () { resolve(id, k, s.approaches[sel]); };
      $("back").onclick = function () { pickAgent(id, k); };
    };
    draw();
  }

  function apply(delta) {
    const ch = {};
    Object.keys(delta).forEach(function (m) { const before = S.meters[m]; S.meters[m] = Math.max(0, Math.min(100, before + delta[m])); ch[m] = S.meters[m] - before; });
    return ch;
  }

  function resolve(id, k, a) {
    const s = SITS[id], odds = oddsFor(id, k, a), r = rnd() * 100;
    let res = r < odds * 0.7 ? "win" : r < odds ? "mixed" : "loss";
    if (window.__SPY_FORCE__) res = window.__SPY_FORCE__;
    const delta = Object.assign({}, a[res]);
    if (res === "loss") { S.stress[k] = Math.min(5, S.stress[k] + 1); }
    S.stress[k] = Math.min(5, S.stress[k] + a.stress);
    const ch = apply(delta);
    S.done[id] = res; S.used[k] = true; S.hour += 3;
    let head = s.head[res], note = "";
    if (id === "sabotage") {
      if (S.belief === TRUTH) note = "You read it right: Bergen was bait.";
      else if (S.belief === "split") note = "Hedging cost you people at Bergen, but Rotterdam was covered.";
      else { note = "Bergen was bait. While your team watched the north, Rotterdam went dark."; head = "Blackout at Rotterdam data hub; Bergen \u2018was a decoy\u2019, say insiders"; }
    }
    S.heads.push(head); S.log.push({ id: id, k: k, res: res, appr: a.t });
    const agent = AGENTS[k], first = agent.name.split(" ")[0];
    const line = {
      win: first + " pulled it off. Clean.",
      mixed: first + " got it done, but not cleanly. People will ask questions.",
      loss: "It went wrong. " + first + " is out safely \u2014 just \u2014 and shaken."
    }[res];
    if (id === "defector" && res !== "loss") S.defector = true;
    if (id === "sabotage" || S.order.indexOf("sabotage") < 0) { /* keep */ }
    if (S.order.indexOf("sabotage") < 0) S.order.push("sabotage");
    meters(ch); ticker();
    render('<div class="card outcome ' + res + '"><span class="badge">' + { win: "SUCCESS", mixed: "PARTIAL", loss: "FAILED" }[res] + '</span><img class="portrait" src="' + IMG + agent.img + '" alt=""><h2>' + esc(s.title) + "</h2><p>" + esc(line) + (note ? " <strong>" + esc(note) + "</strong>" : "") + '</p><div class="deltas">' +
      Object.keys(ch).map(function (m) { const n = METERS.filter(function (x) { return x.id === m; })[0].name; return '<span class="' + (ch[m] >= 0 ? "up" : "down") + '">' + (ch[m] >= 0 ? "+" : "") + ch[m] + " " + n + "</span>"; }).join("") +
      '</div><div class="headline"><small>Evening edition</small><div>' + esc(head) + "</div></div></div>" +
      '<div style="font-size:12px;color:var(--text-3);text-align:center;margin:-2px 0 12px">' + odds + "% odds \u00b7 " + first + "\u2019s stress is now " + S.stress[k] + "/5 \u00b7 clock " + S.hour + ':00</div><button class="btn primary" id="go">Continue</button>',
      "Meters at the top moved. The news ticker reacts to what you did.");
    $("go").onclick = briefing;
  }

  function summary() {
    // whatever was left handles itself
    remaining().forEach(function (id) {
      const s = SITS[id]; S.done[id] = "loss";
      const pen = { defector: { capital: -8, secrecy: -4 }, mole: { secrecy: -12 }, leak: { trust: -10, safety: -8 }, sabotage: { trust: -14, safety: -6 } }[id];
      apply(pen); S.heads.push(s.head.loss); S.log.push({ id: id, k: null, res: "loss", appr: "Left unhandled" });
    });
    S.hour = Math.max(S.hour, 20);
    meters(); ticker();
    const v = S.meters, avg = (v.trust + v.capital + v.safety + v.secrecy) / 4;
    const grade = avg >= 68 ? "A" : avg >= 60 ? "B" : avg >= 50 ? "C" : avg >= 40 ? "D" : "E";
    const verdict = { A: "A good day. The kind nobody ever hears about.", B: "Solid work. A few cracks, nothing fatal.", C: "You held the line, just. Parliament will want a word.", D: "A rough day. Your agents noticed.", E: "A bad day. The papers smell blood." }[grade];
    const hook = S.defector
      ? "Midnight, the safe house. The clerk finally speaks: \u201cYour codebook is the least of it. One of your three agents has been ours for a year.\u201d"
      : "Midnight. A message on Kite\u2019s private line, from the Grey Directorate: \u201cYou left our clerk behind. We won\u2019t leave yours.\u201d";
    render('<div class="kicker" style="text-align:center">End of day \u00b7 Report to the cabinet</div><div class="grade">' + grade + '</div><p style="text-align:center"><strong>' + verdict + "</strong></p>" +
      '<div class="card"><ul class="log">' + S.log.map(function (l) {
        const s = SITS[l.id];
        return "<li>" + (l.k ? '<img class="portrait" style="width:34px;height:34px;border-radius:10px" src="' + IMG + AGENTS[l.k].img + '" alt="">' : '<span class="portrait" style="width:34px;height:34px;border-radius:10px;display:grid;place-items:center">' + s.icon + "</span>") +
          "<span><b>" + esc(s.title) + '</b><br><span style="color:var(--text-3);font-size:12px">' + esc(l.appr) + (l.k ? " \u00b7 " + AGENTS[l.k].name.split(" ")[0] : "") + '</span></span><span class="r ' + l.res + '">' + { win: "SUCCESS", mixed: "PARTIAL", loss: "FAILED" }[l.res] + "</span></li>";
      }).join("") + "</ul></div>" +
      '<div class="card hook"><div class="kicker">Tomorrow</div>' + kite(esc(hook), "worried").replace('class="kite card"', 'class="kite" style="margin-top:8px"') + "</div>" +
      '<button class="btn primary" id="again">Play the day again</button><a class="btn" style="margin-top:8px;text-decoration:none;min-height:44px;font-size:14px" href="../index.html">Back to Ashline</a>',
      "That\u2019s the prototype. Try different agents and plans.");
    $("again").onclick = function () { fresh(); meters(); ticker(); briefing(); };
    S.finished = grade;
  }

  fresh(); intro();
  window.__SPY__ = { state: function () { return S; }, fresh: function () { fresh(); intro(); } };
})();
