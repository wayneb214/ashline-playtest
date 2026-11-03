/* Albion House — one agency day. Prototype. Everything is fictional: the state, the agencies,
   the companies and the people are invented; only the map is real. No real tradecraft. */
(function () {
  "use strict";
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  const IMG = "img/";
  const pic = function (n) { return IMG + n + ".jpg"; };
  const seedM = /[?&]seed=(\d+)/.exec(location.search);
  let seed = seedM ? +seedM[1] : (Date.now() % 1e9);
  const rnd = function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  // ---------- content ----------
  // Albion House: an invented British overseas intelligence service. The rival is the invented
  // Varenian Republic and its service, the Grey House. Real cities, invented states, firms and people.
  const METERS = [
    { id: "trust", name: "Public trust" }, { id: "capital", name: "No.10\u2019s favour" },
    { id: "safety", name: "Officer safety" }, { id: "secrecy", name: "Secrecy" }
  ];
  const AGENTS = {
    lena: { name: "Lena Novak", role: "Case officer \u00b7 runs people", img: "lena", alt: "lena-tense", skill: 4, loyalty: 4, stress: 1, cover: 3, good: ["defector", "leak"] },
    mira: { name: "Mira Sol", role: "Watcher \u00b7 patient, unseen", img: "mira", alt: "mira-relief", skill: 3, loyalty: 5, stress: 2, cover: 4, good: ["mole", "sabotage"] },
    ren: { name: "Ren Okafor", role: "Field lead \u00b7 brilliant, worn thin", img: "ren", alt: "ren-strain", skill: 5, loyalty: 2, stress: 3, cover: 2, good: ["sabotage", "defector"] }
  };
  const SITS = {
    defector: {
      title: "A clerk wants to come over", where: "Vienna", x: 66, y: 63, due: 18,
      brief: "A cipher clerk from the Grey House, the Varenian service, offers their codebook for a new life in England. She is being followed.",
      approaches: [
        { t: "Slowly, by the book", d: "Meet in a crowded caf\u00e9. Bring her out over two days.", mod: 10, risk: "low", stress: 1, win: { secrecy: 6, safety: 4, capital: 4 }, mixed: { secrecy: -2, capital: 2 }, loss: { safety: -8, capital: -6 } },
        { t: "Bring her out tonight", d: "A car at the back door. Fast, loud, decisive.", mod: -8, risk: "high", stress: 2, win: { capital: 14, secrecy: 2 }, mixed: { secrecy: -8, capital: 6 }, loss: { safety: -16, trust: -6, secrecy: -10 } },
        { t: "Let the Embassy take her", d: "Open asylum. Clean, public, and the Varenians will howl.", mod: 18, risk: "med", stress: 0, win: { trust: 8, capital: -6, secrecy: -10 }, mixed: { capital: -10, secrecy: -10 }, loss: { capital: -14, trust: -4 } }
      ],
      head: { win: "Varenian official \u2018missing\u2019 from Vienna post", mixed: "Diplomatic chill after mystery Vienna visa", loss: "Woman detained at Vienna station; Foreign Office silent" }
    },
    mole: {
      title: "Someone inside is talking", where: "Albion House, London", x: 30, y: 52, home: true, due: 20,
      brief: "Three operations blown in a month. Kite has two names on the fourth floor and no proof. The Prime Minister doesn\u2019t know yet.",
      approaches: [
        { t: "The canary trap", d: "Give each suspect a slightly different false detail and see which one comes back.", mod: 8, risk: "low", stress: 1, win: { secrecy: 12, safety: 6 }, mixed: { secrecy: 4 }, loss: { secrecy: -8, safety: -4 } },
        { t: "Bring them both in", d: "Today. Separate rooms. Push hard.", mod: -6, risk: "high", stress: 2, win: { secrecy: 14, capital: 6 }, mixed: { trust: -4, secrecy: 2 }, loss: { trust: -8, capital: -10, secrecy: -6 } },
        { t: "Freeze them out", d: "Keep both away from anything that matters. Wait.", mod: 30, risk: "med", stress: 0, win: { secrecy: 2 }, mixed: { secrecy: -6 }, loss: { secrecy: -12, safety: -6 } }
      ],
      head: { win: "Senior civil servant retires early \u2018for family reasons\u2019", mixed: "Whitehall unease as staff face interviews", loss: "Another British operation reportedly compromised" }
    },
    leak: {
      title: "A file has reached the press", where: "Fleet Street, London", x: 31, y: 50, home: true, due: 15, left: true,
      brief: "The Morning Courier has a copy of an internal Albion House report. It names a source abroad. The first edition goes to press at three.",
      approaches: [
        { t: "Lunch with the editor", d: "Explain who dies if the name runs. Ask, don\u2019t threaten.", mod: 12, risk: "low", stress: 1, win: { safety: 10, trust: 6 }, mixed: { safety: 4, secrecy: -4 }, loss: { safety: -8, secrecy: -8 } },
        { t: "Recover the copy", d: "Find the file before it\u2019s set in type.", mod: -10, risk: "high", stress: 2, win: { secrecy: 12, safety: 8 }, mixed: { trust: -8, secrecy: 4 }, loss: { trust: -16, capital: -10 } },
        { t: "Have No.10 get ahead of it", d: "A statement from Downing Street before the presses roll.", mod: 20, risk: "med", stress: 0, win: { trust: 12, secrecy: -10 }, mixed: { trust: 4, secrecy: -10, safety: -4 }, loss: { trust: -6, secrecy: -14 } }
      ],
      head: { win: "Courier runs spy story without naming sources", mixed: "Leaked spy report dominates the first edition", loss: "Courier names Albion House informant; uproar in the Commons" }
    },
    sabotage: {
      title: "A threat to a sea cable", where: "Bergen or Rotterdam?", x: 49, y: 33, due: 21, flash: true,
      brief: "Someone means to cut the North Sea link run by Halvard Marine, an invented firm, tonight. Two reports disagree on where. Decide what to believe first.",
      approaches: [
        { t: "Watch it quietly", d: "Watchers on site, local police on a phone call.", mod: 10, risk: "low", stress: 1, win: { safety: 6, secrecy: 6, trust: 4 }, mixed: { trust: -4 }, loss: { trust: -10, safety: -6 } },
        { t: "Let them come", d: "Wait until they\u2019re inside, then close the net.", mod: -8, risk: "high", stress: 2, win: { capital: 14, trust: 10 }, mixed: { safety: -8, capital: 4 }, loss: { safety: -14, trust: -12 } },
        { t: "Close the site", d: "Shut it down and announce a security alert.", mod: 22, risk: "med", stress: 0, win: { trust: 6, secrecy: -8, capital: -4 }, mixed: { trust: -2, capital: -8 }, loss: { trust: -8, capital: -10 } }
      ],
      head: { win: "Arrests at North Sea cable station; outage averted", mixed: "Cable station closed overnight in \u2018security drill\u2019", loss: "Blackout as harbour data hub hit; questions for London" }
    }
  };
  const PLACES = { Bergen: [49, 33], Rotterdam: [42, 54] };
  const REPORTS = [
    { id: "Bergen", alt: false, src: "Agent report \u00b7 via Mira", grade: "Usually reliable", q: "\u201cThey go for the Bergen landing station. Tonight, after the shift change. I saw the van myself.\u201d" },
    { id: "Rotterdam", alt: true, src: "Intercept \u00b7 single source", grade: "Unconfirmed", q: "\u201cLet the English watch the north. The real work is at the Rotterdam hub.\u201d" }
  ];
  const TRUTH = "Rotterdam";
  const EMBLEM = '<svg class="emblem" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="br" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0d68a"/><stop offset=".55" stop-color="#c9a24a"/><stop offset="1" stop-color="#7a5d22"/></linearGradient></defs>' +
    '<circle cx="50" cy="50" r="47" fill="#1f3a2f" stroke="url(#br)" stroke-width="4"/><circle cx="50" cy="50" r="40" fill="none" stroke="url(#br)" stroke-width="1"/>' +
    '<path d="M50 16 l4 9 h10 l-8 6 3 9 -9 -6 -9 6 3 -9 -8 -6 h10z" fill="url(#br)"/>' +
    '<path d="M28 44 h44 v14 c0 12 -10 20 -22 24 c-12 -4 -22 -12 -22 -24z" fill="#7a1f1f" stroke="url(#br)" stroke-width="2"/>' +
    '<path d="M33 60 q4 -4 8 0 t8 0 t8 0 t8 0 M33 67 q4 -4 8 0 t8 0 t8 0 t8 0" fill="none" stroke="#efe6d2" stroke-width="2"/>' +
    '<path d="M40 52 h20" stroke="url(#br)" stroke-width="3"/></svg>';
  // ---------- state ----------
  let S;
  function fresh() {
    S = { hour: 8, meters: { trust: 55, capital: 55, safety: 60, secrecy: 55 }, order: ["defector", "mole", "leak"], done: {}, used: {}, stress: {}, heads: ["Rain over London as the Commons returns"], log: [], belief: null, flashShown: false, defector: false };
    Object.keys(AGENTS).forEach(function (k) { S.stress[k] = AGENTS[k].stress; });
  }

  // ---------- chrome ----------
  function meters(changes) {
    $("meters").innerHTML = METERS.map(function (m) {
      const v = S.meters[m.id], d = changes && changes[m.id];
      return '<div class="meter' + (v < 35 ? " low" : "") + '"><div class="row"><span>' + m.name + "</span><span>" + (d ? '<span class="delta ' + (d > 0 ? "up" : "down") + '">' + (d > 0 ? "+" : "") + d + "</span> " : "") + v + '</span></div><div class="bar"><div class="fill" style="width:' + v + '%"></div></div></div>';
    }).join("");
    $("clock").textContent = (S.hour < 10 ? "0" : "") + S.hour + ":00";
  }
  function ticker() { $("tk-run").innerHTML = S.heads.slice().reverse().map(function (h) { return "<b>\u25c6</b>" + esc(h); }).join(""); }
  function hint(t) { $("hint").textContent = t; }
  function chrome(on) { ["hud", "ticker", "hintbar"].forEach(function (id) { $(id).classList.toggle("hidden", !on); }); document.body.classList.toggle("on-title", !on); }
  function render(html, h) { $("view").innerHTML = html; window.scrollTo(0, 0); hint(h || ""); }
  function kite(text, worried) {
    return '<div class="kite card"><img class="portrait" src="' + pic(worried ? "kite-worried" : "kite") + '" alt="Kite"><div class="note"><div class="who">Kite \u00b7 Chief of Staff</div>' + text + "</div></div>";
  }
  function pips(n, cls, label) { let s = ""; for (let i = 1; i <= 5; i++) s += '<i class="' + (i <= n ? "on" : "") + '"></i>'; return '<div class="tr ' + cls + '">' + label + '<div class="pips">' + s + "</div></div>"; }
  const mname = function (m) { return METERS.filter(function (x) { return x.id === m; })[0].name; };

  // ---------- map: an old paper map on the desk, with map pins ----------
  function map() {
    let pins = '<div class="pin home" style="left:30%;top:52%"><span class="head"></span><span class="needle"></span><span class="lab">London</span></div>';
    S.order.forEach(function (id) {
      const s = SITS[id]; if (s.home) return;
      const xy = id === "sabotage" && PLACES[S.belief] ? PLACES[S.belief] : [s.x, s.y];
      const label = id === "sabotage" ? (S.belief && S.belief !== "split" ? S.belief : "Bergen?") : s.where;
      pins += '<div class="pin' + (S.done[id] ? " done" : "") + (s.flash && !S.done[id] ? " flash" : "") + (s.left ? " left" : "") + '" style="left:' + xy[0] + "%;top:" + xy[1] + '%"><span class="head"></span><span class="needle"></span><span class="lab">' + esc(label) + "</span></div>";
    });
    return '<div class="map" role="img" aria-label="Map of Europe on the desk with today\u2019s cases pinned">' + pins + "</div>";
  }

  // ---------- screens ----------
  function title() {
    chrome(false);
    render('<div class="title"><div>' + EMBLEM + '<h1>Albion House</h1><div class="sub">The Overseas Intelligence Bureau</div></div>' +
      '<div><p class="tag">London. Rain on the river. Four problems before midnight.</p><button class="btn primary" id="go">Take the chair</button><div class="fine">A work of fiction. All states, services, firms and people are invented.</div></div></div>');
    $("go").onclick = intro;
  }
  function intro() {
    chrome(false);
    render('<div class="card" style="margin-top:calc(var(--safe-t) + 18px)"><span class="stamp corner">SECRET</span><div class="kicker">Personal file \u00b7 For the Chief only</div><h2 style="margin-top:10px">You are \u2018C\u2019.</h2>' +
      '<p>You head <strong>Albion House</strong>, Britain\u2019s overseas intelligence service (invented), in a grey stone building on the Thames. You answer to the Prime Minister, <strong>Eleanor Hale</strong>, and to nobody else.</p>' +
      '<p>Your Chief of Staff, <strong>Kite</strong>, runs the building. Your officers in the field are brave, tired, and not all of them are entirely yours.</p>' +
      '<p>Today four problems reach your desk. You have <strong>three officers</strong> and <strong>one day</strong>. You can\u2019t fix everything. Each choice moves four gauges: public trust, No.10\u2019s favour, officer safety and secrecy.</p>' +
      '<button class="btn primary" id="go">Read the morning brief</button></div>');
    $("go").onclick = function () { chrome(true); meters(); ticker(); briefing(); };
  }

  function remaining() { return S.order.filter(function (id) { return !S.done[id]; }); }
  function freeAgents() { return Object.keys(AGENTS).filter(function (k) { return !S.used[k]; }); }

  function briefing() {
    if (!freeAgents().length || !remaining().length) return summary();
    const first = !S.log.length, flash = S.order.indexOf("sabotage") >= 0 && !S.done.sabotage, fresh = flash && !S.flashShown;
    const line = first ? "Morning, C. Three files on the desk, three officers on the bench. Start with the one that frightens you most. Mind the deadlines."
      : fresh ? "<b>Flash from the night desk.</b> Someone means to cut a North Sea cable tonight. Two reports, two places. I\u2019ve put it top of the pile."
      : "Next. " + freeAgents().length + " officer" + (freeAgents().length > 1 ? "s" : "") + " left. Whatever we don\u2019t touch today will sort itself out, badly.";
    if (flash) S.flashShown = true;
    let list = "", n = 0;
    S.order.forEach(function (id) {
      const s = SITS[id], done = S.done[id], late = !done && S.hour >= s.due; n++;
      list += '<button class="card sit' + (done ? " done" : "") + (s.flash && !done ? " flash" : "") + '" data-sit="' + id + '"' + (done ? " disabled" : "") + '><span class="num">' + ["I", "II", "III", "IV"][n - 1] + '</span><span><div class="t">' + esc(s.title) + '</div><div class="s">' + esc(s.where) + '</div></span><span class="dl">' +
        (done ? (done === "win" ? "CLOSED" : done === "mixed" ? "PARTIAL" : "FAILED") : late ? "OVERDUE" : "by " + s.due + ":00") + "</span></button>";
    });
    render('<div class="kicker">Morning brief \u00b7 Albion House</div>' + kite(line, fresh) + map() + list, "Tap a file to deal with it.");
    document.querySelectorAll("[data-sit]").forEach(function (b) { b.onclick = function () { const id = b.getAttribute("data-sit"); id === "sabotage" && !S.belief ? judgement() : pickAgent(id); }; });
  }

  function judgement() {
    let sel = null;
    const draw = function () {
      render('<div class="kicker">Your judgement \u00b7 the cable threat</div><h2>Two reports. One truth.</h2>' +
        kite("They can\u2019t both be right. Mira\u2019s man has been good to us before. But he was paid twice this month, and not only by us. The intercept is thin, but it\u2019s their own voice.", true) +
        '<div class="reports">' + REPORTS.map(function (r, i) {
          return (i ? '<div class="vs">\u2014 OR \u2014</div>' : "") + '<button class="card report' + (r.alt ? " alt" : "") + (sel === r.id ? " sel" : "") + '" data-r="' + r.id + '"><div class="src"><span>' + r.src + '</span><span class="rel">' + r.grade + '</span></div><div class="q">' + r.q + '</div><div class="chips"><span class="chip">Defend ' + r.id + "</span></div></button>";
        }).join("") +
        '<div class="vs">\u2014 OR \u2014</div><button class="card report' + (sel === "split" ? " sel" : "") + '" data-r="split"><div class="src"><span>Hedge your bets</span><span class="rel">Thinner everywhere</span></div><div class="q">Split your people between both sites.</div><div class="chips"><span class="chip risk-med">Odds \u221212%</span><span class="chip risk-low">Can\u2019t be wholly wrong</span></div></button></div>' +
        '<div class="sticky-go"><button class="btn primary" id="go"' + (sel ? "" : " disabled") + ">" + (sel ? (sel === "split" ? "Cover both sites" : "Believe it \u2014 defend " + sel) : "Decide what to believe") + "</button></div>",
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
        return '<button class="card agent' + (pick === k ? " sel" : "") + (used ? " used" : "") + '" data-a="' + k + '"><img class="portrait" src="' + pic(st >= 4 ? a.alt : a.img) + '" alt=""><div style="flex:1;min-width:0"><div class="nm">' + a.name + (used ? " \u00b7 in the field" : "") + '</div><div class="role">' + a.role + '</div><div class="traits">' +
          pips(a.skill, "", "Skill") + pips(a.loyalty, "", "Loyalty") + pips(st, "stress" + (st >= 4 ? " high" : ""), "Stress") + pips(a.cover, "", "Cover") + '</div><div class="fit' + (fit ? "" : " bad") + '">' + (fit ? "\u2713 Right person for this" : "Not their line of work") + (id === "mole" && a.loyalty <= 2 ? " \u00b7 loyalty in doubt" : "") + "</div></div></button>";
      }).join("");
      render('<div class="step"><i class="on"></i><i></i></div><div class="card"><span class="stamp corner">CONFIDENTIAL</span><div class="kicker">' + esc(s.where) + " \u00b7 by " + s.due + ":00" + (S.hour >= s.due ? " \u00b7 OVERDUE" : "") + '</div><h2 style="margin-top:8px;padding-right:110px">' + esc(s.title) + "</h2><p>" + esc(s.brief) + (id === "sabotage" ? " <strong>You\u2019re defending: " + (S.belief === "split" ? "both sites" : S.belief) + ".</strong>" : "") + '</p></div><div class="kicker" style="margin:4px 0 8px">Who do you send?</div><div class="agents">' + cards + '</div><div class="sticky-go"><button class="btn primary" id="go"' + (pick ? "" : " disabled") + ">" + (pick ? "Send " + AGENTS[pick].name.split(" ")[0] : "Choose an officer") + '</button></div><button class="btn ghost" id="back">Back to the brief</button>',
        "Step 1 of 2 \u00b7 Who goes? High stress means mistakes.");
      document.querySelectorAll("[data-a]").forEach(function (b) { b.onclick = function () { pick = b.getAttribute("data-a"); draw(); }; });
      $("go").onclick = function () { approach(id, pick); };
      $("back").onclick = briefing;
    };
    draw();
  }

  function approach(id, k) {
    const s = SITS[id];
    let sel = null;
    const fmt = function (o) { return Object.keys(o).map(function (m) { return (o[m] > 0 ? "+" : "") + o[m] + " " + mname(m); }).join(", "); };
    const draw = function () {
      const opts = s.approaches.map(function (a, i) {
        return '<button class="card appr' + (sel === i ? " sel" : "") + '" data-i="' + i + '"><div class="t">' + esc(a.t) + '</div><p style="margin:0">' + esc(a.d) + '</p><div class="chips"><span class="chip odds">' + oddsFor(id, k, a) + '% chance</span><span class="chip risk-' + a.risk + '">' + { low: "Low risk", med: "Some risk", high: "High risk" }[a.risk] + '</span><span class="chip">If it works: ' + esc(fmt(a.win)) + "</span></div></button>";
      }).join("");
      render('<div class="step"><i class="on"></i><i class="on"></i></div><div class="kicker">' + esc(s.title) + '</div><div class="kite card" style="align-items:center"><img class="portrait" src="' + pic(AGENTS[k].img) + '" alt=""><div class="note"><div class="who">' + AGENTS[k].name + '</div>Standing by, C. How do you want it played?</div></div>' + opts +
        '<div class="sticky-go"><button class="btn primary" id="go"' + (sel == null ? " disabled" : "") + ">" + (sel == null ? "Choose an approach" : "Go \u2014 " + esc(s.approaches[sel].t)) + '</button></div><button class="btn ghost" id="back">Send someone else</button>',
        "Step 2 of 2 \u00b7 How? Safe plans pay less. Bold ones can backfire.");
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
    if (res === "loss") S.stress[k] = Math.min(5, S.stress[k] + 1);
    S.stress[k] = Math.min(5, S.stress[k] + a.stress);
    const ch = apply(a[res]);
    S.done[id] = res; S.used[k] = true; S.hour += 3;
    let head = s.head[res], note = "";
    if (id === "sabotage") {
      if (S.belief === TRUTH) note = "You read it right: Bergen was bait.";
      else if (S.belief === "split") note = "Hedging thinned the Bergen team, but Rotterdam was covered.";
      else { note = "Bergen was bait. While we watched the north, Rotterdam went dark."; head = "Blackout at Rotterdam data hub; Bergen \u2018a decoy\u2019, say insiders"; }
    }
    S.heads.push(head); S.log.push({ id: id, k: k, res: res, appr: a.t });
    const ag = AGENTS[k], first = ag.name.split(" ")[0];
    const line = { win: first + " pulled it off. Clean. Nobody will ever know.", mixed: first + " got it done, but not cleanly. There will be questions.", loss: "It went wrong. " + first + " is out \u2014 just \u2014 and badly shaken." }[res];
    if (id === "defector" && res !== "loss") S.defector = true;
    if (S.order.indexOf("sabotage") < 0) S.order.push("sabotage");
    meters(ch); ticker();
    render('<div class="card outcome ' + res + '"><span class="stamp">' + { win: "CLOSED", mixed: "PARTIAL", loss: "FAILED" }[res] + '</span><img class="portrait" src="' + pic(res === "loss" ? ag.alt : (k === "mira" && res === "win" ? ag.alt : ag.img)) + '" alt=""><h2>' + esc(s.title) + "</h2><p>" + esc(line) + (note ? " <strong>" + esc(note) + "</strong>" : "") + '</p><div class="deltas">' +
      Object.keys(ch).map(function (m) { return '<span class="' + (ch[m] >= 0 ? "up" : "down") + '">' + (ch[m] >= 0 ? "+" : "") + ch[m] + " " + mname(m) + "</span>"; }).join("") +
      '</div><div class="headline"><small>The Evening Standard-Bearer \u00b7 late edition</small><div>' + esc(head) + "</div></div></div>" +
      '<p style="font-family:var(--type);font-size:11.5px;text-align:center;margin:-2px 0 12px">' + odds + "% odds \u00b7 " + first + "\u2019s stress now " + S.stress[k] + "/5 \u00b7 clock " + S.hour + ':00</p><button class="btn primary" id="go">Back to the desk</button>',
      "The gauges moved. The papers noticed.");
    $("go").onclick = briefing;
  }

  function summary() {
    remaining().forEach(function (id) {
      const s = SITS[id]; S.done[id] = "loss";
      apply({ defector: { capital: -8, secrecy: -4 }, mole: { secrecy: -12 }, leak: { trust: -10, safety: -8 }, sabotage: { trust: -14, safety: -6 } }[id]);
      S.heads.push(s.head.loss); S.log.push({ id: id, k: null, res: "loss", appr: "Left on the desk" });
    });
    S.hour = Math.max(S.hour, 20);
    S.heads.push("Police seal off Bath street; man taken ill");
    meters(); ticker();
    const v = S.meters, avg = (v.trust + v.capital + v.safety + v.secrecy) / 4;
    const grade = avg >= 68 ? "A" : avg >= 60 ? "B" : avg >= 50 ? "C" : avg >= 40 ? "D" : "E";
    const verdict = { A: "The Prime Minister is pleased, which worries Kite.", B: "Solid work, C. A few cracks; nothing that shows.", C: "You held the line, just. No.10 would like a word.", D: "A rough day. Your officers noticed.", E: "A bad day. Fleet Street smells blood." }[grade];
    const extra = S.defector
      ? "The Vienna clerk, in her safe house, has seen the news. Her first words: <b>\u201cVass was only the first name on the list.\u201d</b>"
      : "A message on Kite\u2019s private line, unsigned: <b>\u201cYou left our clerk behind. Now you\u2019ll know how it feels.\u201d</b>";
    render('<div class="card" style="text-align:center"><span class="stamp corner">TOP SECRET</span><div class="kicker">Cabinet Office \u00b7 report to the Prime Minister</div><div class="grade">' + grade + '</div><p style="font-size:17px;color:var(--paper-ink)"><strong>' + verdict + "</strong></p>" +
      '<ul class="log" style="text-align:left">' + S.log.map(function (l) {
        const s = SITS[l.id];
        return "<li>" + (l.k ? '<img class="portrait" src="' + pic(AGENTS[l.k].img) + '" alt="">' : '<span class="portrait" style="display:grid;place-items:center;background:#ddd2b6;font-family:var(--type);color:var(--oxblood)">\u2014</span>') +
          "<span><b>" + esc(s.title) + '</b><br><span style="font-family:var(--type);color:var(--paper-mute);font-size:11px">' + esc(l.appr) + (l.k ? " \u00b7 " + AGENTS[l.k].name.split(" ")[0] : "") + '</span></span><span class="r ' + l.res + '">' + { win: "CLOSED", mixed: "PARTIAL", loss: "FAILED" }[l.res] + "</span></li>";
      }).join("") + "</ul></div>" +
      '<div class="flash-card" id="flash"><div class="bar"><span class="stamp">FLASH \u00b7 MOST IMMEDIATE</span><span class="time">23:47 \u00b7 BATH</span></div><div class="tele">' +
      "C \u2014 Avon Police report a man collapsed on a bench near the Circus. He is <b>Pieter Vass</b>, a former Grey House officer we resettled here under a new name in 2019. Alive, unconscious. The government laboratory has identified a Varenian compound code-named <b>PALE HOUR</b>. No.10 wants you at Downing Street by seven.<br><br>" + extra + "<br><br>\u2014 Kite</div></div>" +
      '<button class="btn primary" id="again">Play the day again</button><a class="btn ghost" href="../index.html">Back to Ashline</a>',
      "To be continued. Try other officers and plans.");
    $("again").onclick = function () { fresh(); title(); };
    S.finished = grade;
  }

  fresh(); title();
  window.__SPY__ = { state: function () { return S; }, fresh: function () { fresh(); title(); } };
})();
