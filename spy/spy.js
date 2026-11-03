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
    lena: { name: "Lena Novak", role: "Case officer \u00b7 runs people", img: "lena", tense: "lena-tense", happy: "lena", look: "a red scarf", note: "Speaks fluent Varenian", clue: "Every blown operation was discussed with someone who could read the Varenian traffic without a translator.", slip: "She quoted a Grey House codeword we never told her.", skill: 4, loyalty: 4, stress: 1, cover: 3, good: ["defector", "leak"] },
    mira: { name: "Mira Sol", role: "Watcher \u00b7 patient, unseen", img: "mira", tense: null, happy: "mira-relief", look: "a green knitted hat", note: "Ran the Rotterdam watch rota", clue: "Every blown operation crossed the Rotterdam watch rota before it went wrong.", slip: "Her report was timed an hour before she says she arrived.", skill: 3, loyalty: 5, stress: 2, cover: 4, good: ["mole", "sabotage"] },
    ren: { name: "Ren Okafor", role: "Field lead \u00b7 brilliant, worn thin", img: "ren", tense: "ren-strain", happy: "ren", look: "a navy raincoat", note: "Spring leave: Vienna, alone", clue: "Every blown operation went wrong after someone took a quiet spring holiday in Vienna.", slip: "He knew the clerk\u2019s cover name before we\u2019d briefed him.", skill: 5, loyalty: 2, stress: 3, cover: 2, good: ["sabotage", "defector"] }
  };
  const SITS = {
    defector: {
      title: "A clerk wants to come over", where: "Vienna", x: 66, y: 63, due: 16,
      brief: "A cipher clerk from the Grey House, the Varenian service, offers their codebook for a new life in England. She is being followed.",
      approaches: [
        { t: "Slowly, by the book", d: "Meet in a crowded caf\u00e9. Bring her out over two days.", mod: 10, risk: "low", stress: 1, win: { secrecy: 6, safety: 4, capital: 4 }, mixed: { secrecy: -2, capital: 2 }, loss: { safety: -8, capital: -6 } },
        { t: "Bring her out tonight", d: "A car at the back door. Fast, loud, decisive.", mod: -8, risk: "high", stress: 2, win: { capital: 14, secrecy: 2 }, mixed: { secrecy: -8, capital: 6 }, loss: { safety: -16, trust: -6, secrecy: -10 } },
        { t: "Let the Embassy take her", d: "Open asylum. Clean, public, and the Varenians will howl.", mod: 18, risk: "med", stress: 0, win: { trust: 8, capital: -6, secrecy: -10 }, mixed: { capital: -10, secrecy: -10 }, loss: { capital: -14, trust: -4 } }
      ],
      head: { win: "Varenian official \u2018missing\u2019 from Vienna post", mixed: "Diplomatic chill after mystery Vienna visa", loss: "Woman detained at Vienna station; Foreign Office silent" }
    },
    mole: {
      title: "Someone inside is talking", where: "Albion House, London", x: 30, y: 52, home: true, due: 18,
      brief: "Three operations blown in a month. Somebody on our own floor is passing names to the Grey House, and it\u2019s one of your three officers. The Prime Minister doesn\u2019t know yet.",
      approaches: [
        { t: "The canary trap", d: "Give each suspect a slightly different false detail and see which one comes back.", mod: 8, risk: "low", stress: 1, win: { secrecy: 12, safety: 6 }, mixed: { secrecy: 4 }, loss: { secrecy: -8, safety: -4 } },
        { t: "Bring them both in", d: "Today. Separate rooms. Push hard.", mod: -6, risk: "high", stress: 2, win: { secrecy: 14, capital: 6 }, mixed: { trust: -4, secrecy: 2 }, loss: { trust: -8, capital: -10, secrecy: -6 } },
        { t: "Freeze them out", d: "Keep both away from anything that matters. Wait.", mod: 30, risk: "med", stress: 0, win: { secrecy: 2 }, mixed: { secrecy: -6 }, loss: { secrecy: -12, safety: -6 } }
      ],
      head: { win: "Senior civil servant retires early \u2018for family reasons\u2019", mixed: "Whitehall unease as staff face interviews", loss: "Another British operation reportedly compromised" }
    },
    leak: {
      title: "A file has reached the press", where: "Fleet Street, London", x: 31, y: 50, home: true, due: 13, left: true,
      brief: "The Morning Courier has a copy of an internal Albion House report. It names a source abroad. The first edition goes to press at three.",
      approaches: [
        { t: "Lunch with the editor", d: "Explain who dies if the name runs. Ask, don\u2019t threaten.", mod: 12, risk: "low", stress: 1, win: { safety: 10, trust: 6 }, mixed: { safety: 4, secrecy: -4 }, loss: { safety: -8, secrecy: -8 } },
        { t: "Recover the copy", d: "Find the file before it\u2019s set in type.", mod: -10, risk: "high", stress: 2, win: { secrecy: 12, safety: 8 }, mixed: { trust: -8, secrecy: 4 }, loss: { trust: -16, capital: -10 } },
        { t: "Have No.10 get ahead of it", d: "A statement from Downing Street before the presses roll.", mod: 20, risk: "med", stress: 0, win: { trust: 12, secrecy: -10 }, mixed: { trust: 4, secrecy: -10, safety: -4 }, loss: { trust: -6, secrecy: -14 } }
      ],
      head: { win: "Courier runs spy story without naming sources", mixed: "Leaked spy report dominates the first edition", loss: "Courier names Albion House informant; uproar in the Commons" }
    },
    sabotage: {
      title: "A threat to a sea cable", where: "Bergen or Rotterdam?", x: 49, y: 33, due: 22, flash: true,
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
    '<clipPath id="sh"><path d="M28 44 h44 v14 c0 12 -10 20 -22 24 c-12 -4 -22 -12 -22 -24z"/></clipPath><g clip-path="url(#sh)" opacity=".85"><rect x="20" y="40" width="60" height="46" fill="#22305a"/>' +
    '<path d="M20 40 L80 86 M80 40 L20 86" stroke="#efe6d2" stroke-width="8"/><path d="M20 40 L80 86 M80 40 L20 86" stroke="#9c2a2a" stroke-width="3"/>' +
    '<path d="M50 40 V86 M20 63 H80" stroke="#efe6d2" stroke-width="11"/><path d="M50 40 V86 M20 63 H80" stroke="#9c2a2a" stroke-width="6"/></g>' +
    '<path d="M28 44 h44 v14 c0 12 -10 20 -22 24 c-12 -4 -22 -12 -22 -24z" fill="none" stroke="url(#br)" stroke-width="2"/></svg>';
  // ---------- state, save and time ----------
  const SAVE = "albion-save-v1";
  const FAST = /[?&]fast=1/.test(location.search);
  const HRS = { low: 4, med: 3, high: 2 };
  const KEYS = Object.keys(AGENTS);
  let S;
  function fresh() {
    S = { hour: 8, meters: { trust: 55, capital: 55, safety: 60, secrecy: 55 }, order: ["defector", "mole", "leak"], done: {}, used: {}, stress: {}, loyal: {}, heads: ["Rain over London as the Commons returns"], log: [], belief: null, flashShown: false, defector: false,
      mole: KEYS[Math.floor(rnd() * KEYS.length)], accused: null, call: null, porter: false, ended: false, screen: "briefing", chimed: false };
    if (window.__SPY_MOLE__) S.mole = window.__SPY_MOLE__;
    KEYS.forEach(function (k) { S.stress[k] = AGENTS[k].stress; S.loyal[k] = AGENTS[k].loyalty; });
  }
  function save(screen) { S.screen = screen; try { localStorage.setItem(SAVE, JSON.stringify({ v: 1, seed: seed, S: S })); } catch (e) {} }
  function loadSave() { try { const d = JSON.parse(localStorage.getItem(SAVE) || "null"); return d && d.v === 1 && d.S ? d : null; } catch (e) { return null; } }
  function clearSave() { try { localStorage.removeItem(SAVE); } catch (e) {} }
  const hh = function (h) { return (h < 10 ? "0" : "") + h + ":00"; };
  function advance(h) { S.hour = Math.min(24, S.hour + h); if (window.SFX) SFX.tick(Math.min(6, h * 2)); }
  function late(id) { return Math.max(0, S.hour - SITS[id].due); }
  const EXPIRE = 3; // hours after the deadline before a case is lost for good

  // ---------- chrome ----------
  function meters(changes) {
    $("meters").innerHTML = METERS.map(function (m) {
      const v = S.meters[m.id], d = changes && changes[m.id];
      return '<div class="meter' + (v < 35 ? " low" : "") + '"><div class="row"><span>' + m.name + "</span><span>" + (d ? '<span class="delta ' + (d > 0 ? "up" : "down") + '">' + (d > 0 ? "+" : "") + d + "</span> " : "") + v + '</span></div><div class="bar"><div class="fill" style="width:' + v + '%"></div></div></div>';
    }).join("");
    $("clock").textContent = hh(S.hour);
    const open = remaining().map(function (id) { return SITS[id].due - S.hour; });
    const soon = open.length ? Math.min.apply(null, open) : 99, box = $("clock").parentNode;
    box.classList.toggle("warn", soon <= 2 && soon >= 0); box.classList.toggle("late", soon < 0 || S.hour >= 21);
    box.querySelector("small").textContent = soon < 0 ? "Overdue" : soon <= 2 ? soon + "h left" : S.hour >= 21 ? "Late" : "Day 1";
  }
  function ticker() { $("tk-run").innerHTML = S.heads.slice().reverse().map(function (h) { return "<b>\u25c6</b>" + esc(h); }).join(""); }
  function hint(t) { $("hint").textContent = t; }
  function chrome(on) { ["hud", "ticker", "hintbar"].forEach(function (id) { $(id).classList.toggle("hidden", !on); }); document.body.classList.toggle("on-title", !on); }
  function render(html, h) { $("view").innerHTML = html; window.scrollTo(0, 0); hint(h || ""); typeAll(); }
  function kite(text, worried) {
    return '<div class="kite card"><img class="portrait" src="' + pic(worried ? "kite-worried" : "kite") + '" alt="Kite"><div class="note"><div class="who">Kite \u00b7 Chief of Staff</div><span class="tx">' + text + "</span></div></div>";
  }
  function pips(n, cls, label) { let s = ""; for (let i = 1; i <= 5; i++) s += '<i class="' + (i <= n ? "on" : "") + '"></i>'; return '<div class="tr ' + cls + '">' + label + '<div class="pips">' + s + "</div></div>"; }
  const mname = function (m) { return METERS.filter(function (x) { return x.id === m; })[0].name; };
  const first = function (k) { return AGENTS[k].name.split(" ")[0]; };
  // portrait follows the officer's state: strained when stress is high
  function face(k, mood) {
    const a = AGENTS[k], st = S.stress[k];
    if (mood === "happy") return '<img class="portrait" src="' + pic(a.happy) + '" alt="">';
    if (st >= 4 || mood === "tense") return a.tense ? '<img class="portrait strained" src="' + pic(a.tense) + '" alt="">' : '<img class="portrait strained tint" src="' + pic(a.img) + '" alt="">';
    return '<img class="portrait" src="' + pic(a.img) + '" alt="">';
  }

  // typewriter effect for Kite's notes and telegrams; tap to finish, clicks as it types
  let typing = [];
  function typeAll() {
    typing.forEach(clearInterval); typing = [];
    if (FAST || window.__SPY_FAST__) return;
    document.querySelectorAll("#view .tx, #view .tele").forEach(function (el) {
      const nodes = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) nodes.push({ n: w.currentNode, t: w.currentNode.nodeValue });
      nodes.forEach(function (o) { o.n.nodeValue = ""; });
      let i = 0, j = 0, c = 0;
      const done = function () { nodes.forEach(function (o) { o.n.nodeValue = o.t; }); clearInterval(id); };
      const id = setInterval(function () {
        for (let s = 0; s < 2; s++) {
          if (i >= nodes.length) return done();
          const o = nodes[i]; j++; o.n.nodeValue = o.t.slice(0, j); if (j >= o.t.length) { i++; j = 0; }
        }
        if (++c % 2 === 0 && window.SFX) SFX.type();
      }, 22);
      typing.push(id);
      el.addEventListener("click", done, { once: true });
    });
  }

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
    const saved = loadSave();
    render('<div class="title"><div>' + EMBLEM + '<h1>Albion House</h1><div class="sub">British Secret Intelligence</div><div class="flagband" aria-hidden="true"></div></div>' +
      '<div><p class="tag">London. Rain on the river, Big Ben striking eight. Four problems before midnight.</p>' +
      (saved ? '<button class="btn primary" id="continue">Continue \u00b7 ' + hh(saved.S.hour) + (saved.S.ended ? " \u00b7 day over" : "") + '</button><button class="btn ghost" id="go">Start a new day</button>' : '<button class="btn primary" id="go">Take the chair</button>') +
      '<div class="fine">A work of fiction. Albion House and every state, firm and person in it are invented.</div></div></div>');
    $("go").onclick = function () { clearSave(); fresh(); intro(); };
    if (saved) $("continue").onclick = function () { seed = saved.seed; S = saved.S; S.chimed = true; chrome(true); meters(); ticker(); S.screen === "summary" ? summary() : briefing(); };
  }
  function intro() {
    chrome(false);
    render('<figure class="no10" id="no10"><img src="' + pic("no10") + '" alt="The Prime Minister hands C a file in a study at Number 10, a Union Flag by the window"><figcaption>10 Downing Street \u00b7 the study, 07:10</figcaption></figure>' +
      '<div class="card dossier"><div class="lh">HIS MAJESTY\u2019S GOVERNMENT \u00b7 TOP SECRET \u00b7 UK EYES ONLY</div><span class="stamp corner">SECRET</span><div class="kicker">Personal file \u00b7 For C only</div><h2 style="margin-top:10px">You are \u2018C\u2019.</h2>' +
      '<p>You are the Chief of <strong>Albion House</strong>, Britain\u2019s foreign intelligence service: the people who run Britain\u2019s spies abroad. (It\u2019s invented, but you\u2019ll know the type.) Your office looks across the Thames at Westminster. You answer to the Prime Minister, <strong>Eleanor Hale</strong>, at Number 10, and to nobody else.</p>' +
      '<p>She has just handed you the morning file in her study. \u201cKeep Britain safe, C. And keep it out of the papers.\u201d</p>' +
      '<p>Your Chief of Staff, <strong>Kite</strong>, runs the building. You have <strong>three officers</strong>, and <strong>one of them is working for the other side</strong>. Watch for small slips.</p>' +
      '<p>The day runs from 08:00 to midnight. Careful plans take longer, bold ones are quick. Every case has a deadline, and it gets harder the longer you leave it. Each choice moves four gauges: public trust, No.10\u2019s favour, officer safety and secrecy.</p>' +
      '<button class="btn primary" id="go">Read the morning brief</button></div>');
    $("go").onclick = function () { chrome(true); meters(); ticker(); briefing(); };
  }

  function remaining() { return S.order.filter(function (id) { return !S.done[id]; }); }
  function freeAgents() { return KEYS.filter(function (k) { return !S.used[k]; }); }
  const PENALTY = { defector: { capital: -8, secrecy: -4 }, mole: { secrecy: -12 }, leak: { trust: -10, safety: -8 }, sabotage: { trust: -14, safety: -6 } };

  // cases left too long are lost
  function expire() {
    const gone = [];
    remaining().forEach(function (id) {
      if (late(id) >= EXPIRE) { S.done[id] = "loss"; apply(PENALTY[id]); S.heads.push(SITS[id].head.loss); S.log.push({ id: id, k: null, res: "loss", appr: "Expired at " + hh(SITS[id].due + EXPIRE) }); gone.push(id); }
    });
    return gone;
  }

  function briefing() {
    if (S.hour >= 24) return summary();
    const gone = expire();
    if (!remaining().length) return summary();
    const officerJobs = remaining().filter(function (id) { return id !== "mole"; });
    if (!freeAgents().length && officerJobs.length && remaining().indexOf("mole") < 0) return summary();
    if (!freeAgents().length && !officerJobs.length && remaining().indexOf("mole") < 0) return summary();
    if (S.log.filter(function (l) { return l.k; }).length >= 2 && !S.call) return phone();
    meters(); ticker(); save("briefing");
    if (!S.chimed) { S.chimed = true; if (window.SFX) SFX.chime(8); }
    const firstVisit = !S.log.length, flash = S.order.indexOf("sabotage") >= 0 && !S.done.sabotage, fresh2 = flash && !S.flashShown;
    let line;
    if (firstVisit) line = "Morning, C. Tea\u2019s on the desk. Four hours for a careful plan, two for a bold one. The leak is due first, by 13:00.";
    else if (fresh2) line = "<b>Flash from the night desk.</b> Someone means to cut a North Sea cable tonight. Two reports, two places. I\u2019ve put it top of the pile.";
    else if (gone.length) line = "We ran out of time on <b>" + gone.map(function (id) { return SITS[id].title.toLowerCase(); }).join(" and ") + "</b>. It\u2019s gone, C. The papers have it.";
    else if (!S.porter && S.log.length) { S.porter = true; line = "Small thing. The night porter says one of ours came back to the building at three this morning without signing in. All he saw was <b>" + AGENTS[S.mole].look + "</b>."; }
    else line = "It\u2019s " + hh(S.hour) + ". " + freeAgents().length + " officer" + (freeAgents().length !== 1 ? "s" : "") + " on the bench. Whatever we don\u2019t touch will sort itself out, badly.";
    if (fresh2) { S.flashShown = true; if (window.SFX) SFX.tele(); }
    let list = "", n = 0, warnTxt = "";
    S.order.forEach(function (id) {
      const s = SITS[id], done = S.done[id], lt = late(id), left = s.due - S.hour; n++;
      if (!done && left >= 0 && left <= 2 && !warnTxt) warnTxt = s.title + " is due by " + hh(s.due) + ": " + left + " hour" + (left === 1 ? "" : "s") + " left.";
      if (!done && lt > 0 && !warnTxt) warnTxt = s.title + " is overdue. Odds are dropping; it\u2019s lost at " + hh(s.due + EXPIRE) + ".";
      const off = !done && id !== "mole" && !freeAgents().length;
      list += '<button class="card dossier sit' + (done ? " done" : "") + (s.flash && !done ? " flash" : "") + '" data-sit="' + id + '"' + (done || off ? " disabled" : "") + '><span class="num">' + ["I", "II", "III", "IV"][n - 1] + '</span><span><div class="t">' + esc(s.title) + '</div><div class="s">' + esc(s.where) + (id === "mole" && !done ? " \u00b7 no officer needed" : "") + '</div></span><span class="dl' + (lt > 0 && !done ? " over" : left <= 2 && !done ? " soon" : "") + '">' +
        (done ? (done === "win" ? "CLOSED" : done === "mixed" ? "PARTIAL" : "FAILED") : lt > 0 ? "LATE " + lt + "h" : "by " + hh(s.due)) + "</span></button>";
    });
    render('<div class="lh paper">HIS MAJESTY\u2019S GOVERNMENT \u00b7 TOP SECRET \u00b7 UK EYES ONLY</div><div class="kicker">Morning brief for C \u00b7 Albion House</div>' + kite(line, fresh2 || gone.length) + map() + list +
      '<button class="btn ghost" id="endday">Call it a day</button>', warnTxt || "Tap a file to deal with it.");
    document.querySelectorAll("[data-sit]").forEach(function (b) { b.onclick = function () { const id = b.getAttribute("data-sit"); id === "mole" ? accuse() : id === "sabotage" && !S.belief ? judgement() : pickAgent(id); }; });
    $("endday").onclick = function () { S.hour = 24; summary(); };
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
    let o = 30 + ag.skill * 6 + (ag.good.indexOf(id) >= 0 ? 12 : 0) + a.mod - S.stress[k] * 4 + ag.cover * 2 + (S.loyal[k] - 3) * 3;
    if (k === S.mole && S.accused !== S.mole) o -= 10; // quietly working against you
    const lt = late(id); if (lt > 0) o -= 10 + lt * 5;
    if (id === "sabotage") { if (S.belief === "split") o -= 12; else if (S.belief !== TRUTH) o = Math.min(o, 12); }
    return Math.max(5, Math.min(92, Math.round(o)));
  }

  function agentCard(k, extra, sel, disabled, attr) {
    const a = AGENTS[k], st = S.stress[k];
    return '<button class="card agent' + (sel ? " sel" : "") + (disabled ? " used" : "") + '" ' + attr + '="' + k + '">' + face(k) + '<div style="flex:1;min-width:0"><div class="nm">' + a.name + (S.accused === k && k === S.mole ? " \u00b7 detained" : S.used[k] ? " \u00b7 in the field" : "") + (st >= 4 ? ' <span class="strain">Strained</span>' : "") + '</div><div class="role">' + a.role + '</div><div class="traits">' +
      pips(a.skill, "", "Skill") + pips(S.loyal[k], "loyal" + (S.loyal[k] <= 2 ? " high" : ""), "Loyalty") + pips(st, "stress" + (st >= 4 ? " high" : ""), "Stress") + pips(a.cover, "", "Cover") + '</div><div class="fnote">File note: ' + a.note + "</div>" + (extra || "") + "</div></button>";
  }

  function pickAgent(id, chosen) {
    const s = SITS[id];
    let pick = chosen || null;
    const draw = function () {
      const cards = KEYS.map(function (k) {
        const fit = AGENTS[k].good.indexOf(id) >= 0;
        return agentCard(k, '<div class="fit' + (fit ? "" : " bad") + '">' + (fit ? "\u2713 Right person for this" : "Not their line of work") + "</div>", pick === k, S.used[k], "data-a");
      }).join("");
      const lt = late(id);
      render('<div class="step"><i class="on"></i><i></i></div><div class="card dossier"><div class="lh">HIS MAJESTY\u2019S GOVERNMENT \u00b7 TOP SECRET \u00b7 UK EYES ONLY</div><span class="stamp corner">CONFIDENTIAL</span><div class="kicker">' + esc(s.where) + " \u00b7 by " + hh(s.due) + (lt ? " \u00b7 " + lt + "h LATE" : "") + '</div><h2 style="margin-top:8px;padding-right:110px">' + esc(s.title) + "</h2><p>" + esc(s.brief) + (id === "sabotage" ? " <strong>You\u2019re defending: " + (S.belief === "split" ? "both sites" : S.belief) + ".</strong>" : "") + (lt ? ' <strong class="warn-t">It\u2019s late: odds are down ' + (10 + lt * 5) + "%.</strong>" : "") + '</p></div><div class="kicker" style="margin:4px 0 8px">Who do you send?</div><div class="agents">' + cards + '</div><div class="sticky-go"><button class="btn primary" id="go"' + (pick ? "" : " disabled") + ">" + (pick ? "Send " + first(pick) : "Choose an officer") + '</button></div><button class="btn ghost" id="back">Back to the brief</button>',
        "Step 1 of 2 \u00b7 Who goes? Stress and low loyalty mean mistakes.");
      document.querySelectorAll("[data-a]").forEach(function (b) { if (!S.used[b.getAttribute("data-a")]) b.onclick = function () { pick = b.getAttribute("data-a"); draw(); }; });
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
        const h = HRS[a.risk], ends = Math.min(24, S.hour + h);
        return '<button class="card appr' + (sel === i ? " sel" : "") + '" data-i="' + i + '"><div class="t">' + esc(a.t) + '</div><p style="margin:0">' + esc(a.d) + '</p><div class="chips"><span class="chip odds">' + oddsFor(id, k, a) + '% chance</span><span class="chip risk-' + a.risk + '">' + { low: "Low risk", med: "Some risk", high: "High risk" }[a.risk] + '</span><span class="chip time' + (ends > s.due ? " over" : "") + '">\u23f1 ' + h + "h \u00b7 done " + hh(ends) + '</span><span class="chip">If it works: ' + esc(fmt(a.win)) + "</span></div></button>";
      }).join("");
      render('<div class="step"><i class="on"></i><i class="on"></i></div><div class="kicker">' + esc(s.title) + '</div><div class="kite card" style="align-items:center">' + face(k) + '<div class="note"><div class="who">' + AGENTS[k].name + '</div><span class="tx">' + (S.stress[k] >= 4 ? "I can do it, C. Just\u2026 not the loud way, if you can help it." : "Standing by, C. How do you want it played?") + '</span></div></div>' + opts +
        '<div class="sticky-go"><button class="btn primary" id="go"' + (sel == null ? " disabled" : "") + ">" + (sel == null ? "Choose an approach" : "Go \u2014 " + esc(s.approaches[sel].t)) + '</button></div><button class="btn ghost" id="back">Send someone else</button>',
        "Step 2 of 2 \u00b7 Careful plans take longer. Bold ones are quick, and can backfire.");
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
  const clamp5 = function (v) { return Math.max(0, Math.min(5, v)); };

  function resolve(id, k, a) {
    const s = SITS[id], odds = oddsFor(id, k, a), r = rnd() * 100;
    let res = r < odds * 0.7 ? "win" : r < odds ? "mixed" : "loss";
    if (window.__SPY_FORCE__) res = window.__SPY_FORCE__;
    const st0 = S.stress[k], lo0 = S.loyal[k];
    S.stress[k] = clamp5(S.stress[k] + a.stress + (res === "loss" ? 1 : res === "win" ? -1 : 0));
    S.loyal[k] = clamp5(S.loyal[k] + (res === "loss" ? -1 : res === "win" && a.risk === "low" ? 1 : 0));
    const ch = apply(a[res]);
    S.done[id] = res; S.used[k] = true; advance(HRS[a.risk]);
    let head = s.head[res], note = "";
    if (id === "sabotage") {
      if (S.belief === TRUTH) note = "You read it right: Bergen was bait.";
      else if (S.belief === "split") note = "Hedging thinned the Bergen team, but Rotterdam was covered.";
      else { note = "Bergen was bait. While we watched the north, Rotterdam went dark."; head = "Blackout at Rotterdam data hub; Bergen \u2018a decoy\u2019, say insiders"; }
    }
    // the mole's slip: a small wrong detail in their debrief
    const slip = k === S.mole && S.accused !== S.mole ? AGENTS[k].slip : "";
    S.heads.push(head); S.log.push({ id: id, k: k, res: res, appr: a.t, slip: !!slip });
    const nm = first(k);
    const line = { win: nm + " pulled it off. Clean. Nobody will ever know.", mixed: nm + " got it done, but not cleanly. There will be questions.", loss: "It went wrong. " + nm + " is out \u2014 just \u2014 and badly shaken." }[res];
    if (id === "defector" && res !== "loss") S.defector = true;
    if (S.order.indexOf("sabotage") < 0) S.order.push("sabotage");
    meters(ch); ticker(); save("briefing");
    const delta = function (lab, a0, a1) { return a1 === a0 ? "" : '<span class="' + ((lab === "Stress") === (a1 > a0) ? "down" : "up") + '">' + lab + " " + a0 + "\u2192" + a1 + "</span>"; };
    render('<div class="card outcome ' + res + '"><span class="stamp">' + { win: "CLOSED", mixed: "PARTIAL", loss: "FAILED" }[res] + "</span>" + face(k, res === "win" ? "happy" : res === "loss" ? "tense" : "") + "<h2>" + esc(s.title) + "</h2><p>" + esc(line) + (note ? " <strong>" + esc(note) + "</strong>" : "") + "</p>" +
      (slip ? '<p class="slip">From the debrief: <em>' + esc(slip) + "</em></p>" : "") +
      '<div class="deltas">' + Object.keys(ch).map(function (m) { return '<span class="' + (ch[m] >= 0 ? "up" : "down") + '">' + (ch[m] >= 0 ? "+" : "") + ch[m] + " " + mname(m) + "</span>"; }).join("") + "</div>" +
      '<div class="deltas officer">' + delta("Stress", st0, S.stress[k]) + delta("Loyalty", lo0, S.loyal[k]) + "</div>" +
      '<div class="headline"><small>The London Evening Bugle \u00b7 late edition</small><div>' + esc(head) + "</div></div></div>" +
      '<p style="font-family:var(--type);font-size:11.5px;text-align:center;margin:-2px 0 12px">' + odds + "% odds \u00b7 took " + HRS[a.risk] + "h \u00b7 now " + hh(S.hour) + '</p><button class="btn primary" id="go">Back to the desk</button>',
      "The gauges moved. The papers noticed. " + nm + " will remember this.");
    $("go").onclick = briefing;
  }

  // ---------- the mole: accuse one of your own ----------
  function accuse() {
    let sel = null;
    const draw = function () {
      const cards = KEYS.map(function (k) { return agentCard(k, "", sel === k, false, "data-m"); }).join("");
      const lt = late("mole");
      render('<div class="card dossier"><div class="lh">HIS MAJESTY\u2019S GOVERNMENT \u00b7 TOP SECRET \u00b7 UK EYES ONLY</div><span class="stamp corner">EYES ONLY</span><div class="kicker">Albion House \u00b7 by ' + hh(SITS.mole.due) + '</div><h2 style="margin-top:8px;padding-right:110px">Someone inside is talking</h2><p>' + esc(SITS.mole.brief) + "</p>" +
        '<p class="clue"><b>What we know:</b> ' + esc(AGENTS[S.mole].clue) + "</p></div>" +
        kite("Look at their file notes. Think about the porter, and anything odd in today\u2019s debriefs. If you name the wrong one, we lose a good officer and the real one goes quiet.", true) +
        '<div class="kicker" style="margin:4px 0 8px">Who do you accuse? (takes 2 hours)</div><div class="agents">' + cards +
        '<button class="card appr' + (sel === "none" ? " sel" : "") + '" data-m="none"><div class="t">Not yet. Keep watching.</div><p style="margin:0">No accusation today. Safer for now, and the leak goes on.</p></button></div>' +
        '<div class="sticky-go"><button class="btn primary" id="go"' + (sel ? "" : " disabled") + ">" + (!sel ? "Choose someone" : sel === "none" ? "Keep watching" : "Accuse " + first(sel)) + '</button></div><button class="btn ghost" id="back">Back to the brief</button>',
        lt ? "Overdue. The longer we wait, the more they give away." : "Three clues: the file note, the porter, a slip in a debrief.");
      document.querySelectorAll("[data-m]").forEach(function (b) { b.onclick = function () { sel = b.getAttribute("data-m"); draw(); }; });
      $("go").onclick = function () { accuseResolve(sel); };
      $("back").onclick = briefing;
    };
    draw();
  }
  function accuseResolve(who) {
    advance(2);
    let res, ch, head, line, k = who === "none" ? null : who;
    if (who === "none") { res = "mixed"; ch = apply({ secrecy: -6 }); head = SITS.mole.head.mixed; line = "You hold your nerve and say nothing. Whoever it is will keep talking tonight."; }
    else if (who === S.mole) {
      res = "win"; ch = apply({ secrecy: 14, capital: 8, safety: 6 }); S.used[who] = true;
      head = "Albion House officer quietly detained; Whitehall silent"; line = first(who) + " didn\u2019t argue. Just asked for a cigarette and a lawyer. The leaks stop tonight.";
    } else {
      res = "loss"; ch = apply({ trust: -6, secrecy: -10, safety: -6 }); S.loyal[who] = clamp5(S.loyal[who] - 2); S.stress[who] = clamp5(S.stress[who] + 2);
      head = "Officer suspended, then cleared, in Albion House mole hunt"; line = first(who) + " was clean. They\u2019re back at their desk, furious, and the real mole now knows we\u2019re looking.";
    }
    S.accused = who; S.done.mole = res; S.heads.push(head);
    S.log.push({ id: "mole", k: k, res: res, appr: who === "none" ? "Kept watching" : "Accused " + first(who) });
    meters(ch); ticker(); save("briefing");
    render('<div class="card outcome ' + res + '" id="mole-result"><span class="stamp">' + { win: "CAUGHT", mixed: "OPEN", loss: "WRONG" }[res] + "</span>" + (k ? face(k, res === "loss" ? "tense" : "") : "") + "<h2>Someone inside is talking</h2><p>" + esc(line) + "</p>" +
      '<div class="deltas">' + Object.keys(ch).map(function (m) { return '<span class="' + (ch[m] >= 0 ? "up" : "down") + '">' + (ch[m] >= 0 ? "+" : "") + ch[m] + " " + mname(m) + "</span>"; }).join("") + "</div>" +
      '<div class="headline"><small>The London Evening Bugle \u00b7 late edition</small><div>' + esc(head) + '</div></div></div><button class="btn primary" id="go">Back to the desk</button>',
      res === "win" ? "One fewer officer, but the leaks have stopped." : res === "loss" ? "A loyal officer is hurt, and the mole is still free." : "The mole is still free.");
    $("go").onclick = briefing;
  }

  // ---------- No.10 rings ----------
  function phone() {
    const k = S.log.filter(function (l) { return l.k && l.id !== "mole"; }).slice(-1)[0].k, where = SITS[S.log.filter(function (l) { return l.k === k && l.id !== "mole"; }).slice(-1)[0].id].where.split(" ")[0];
    S.call = { k: k, choice: null }; save("briefing");
    if (window.SFX) SFX.ring();
    render('<div class="phone card" id="phone"><div class="lh">NO.10 SWITCHBOARD \u00b7 SECURE LINE</div><div class="pm"><img src="' + pic("pm-phone") + '" alt="Prime Minister Eleanor Hale on the telephone"></div><div class="ringing">\u260e The Prime Minister for you, C.</div><button class="btn primary" id="answer">Answer</button></div>', "The red phone on your desk is ringing.");
    $("answer").onclick = function () {
      if (window.SFX) SFX.stopRing();
      let sel = null;
      const draw = function () {
        render('<div class="phone card" id="phone"><div class="lh">NO.10 SWITCHBOARD \u00b7 SECURE LINE \u00b7 ' + hh(S.hour) + '</div><div class="pm"><img src="' + pic("pm-phone") + '" alt="Prime Minister Eleanor Hale"></div>' +
          '<div class="note"><div class="who">Eleanor Hale \u00b7 Prime Minister</div><span class="tx">C. The Varenian ambassador is in the Foreign Office shouting about a British spy in ' + esc(where) + '. The Courier has a photograph of <b>' + AGENTS[k].name + '</b>. I can stand up at the despatch box and say we have never heard of this person. Or you tell me to stand by them, and I take the heat. Your call, and quickly.</span></div></div>' +
          '<button class="card appr' + (sel === "deny" ? " sel" : "") + '" data-c="deny"><div class="t">Deny them. Protect the government.</div><p style="margin:0">No.10 says it knows nothing. ' + first(k) + ' is on their own.</p><div class="chips"><span class="chip">+10 No.10\u2019s favour</span><span class="chip risk-high">\u221210 Officer safety</span><span class="chip risk-high">' + first(k) + ' loyalty \u22122</span></div></button>' +
          '<button class="card appr' + (sel === "stand" ? " sel" : "") + '" data-c="stand"><div class="t">Stand by them. Protect the officer.</div><p style="margin:0">No.10 refuses to comment and quietly brings ' + first(k) + ' home.</p><div class="chips"><span class="chip risk-high">\u221212 No.10\u2019s favour</span><span class="chip risk-low">+8 Officer safety</span><span class="chip risk-low">' + first(k) + ' loyalty +1</span></div></button>' +
          '<div class="sticky-go"><button class="btn primary" id="go"' + (sel ? "" : " disabled") + ">" + (sel ? "Tell her" : "What do you tell her?") + "</button></div>", "There is no right answer. Only a choice.");
        document.querySelectorAll("[data-c]").forEach(function (b) { b.onclick = function () { sel = b.getAttribute("data-c"); draw(); }; });
        $("go").onclick = function () {
          let ch, head;
          if (sel === "deny") { ch = apply({ capital: 10, trust: 4, safety: -10 }); S.loyal[k] = clamp5(S.loyal[k] - 2); S.stress[k] = clamp5(S.stress[k] + 1); head = "No.10: \u2018no knowledge\u2019 of Briton in " + where + " photograph"; }
          else { ch = apply({ capital: -12, safety: 8 }); S.loyal[k] = clamp5(S.loyal[k] + 1); head = "PM refuses to discuss \u2018our people abroad\u2019; Varenians fume"; }
          S.call.choice = sel; S.heads.push(head); advance(1); meters(ch); ticker(); save("briefing");
          render('<div class="card outcome ' + (sel === "deny" ? "mixed" : "win") + '"><span class="stamp">' + (sel === "deny" ? "DENIED" : "STOOD BY") + "</span>" + face(k, sel === "deny" ? "tense" : "") + "<h2>The call from No.10</h2><p>" + (sel === "deny" ? "Hale thanks you, briskly. " + first(k) + " hears the statement on the radio in a hotel room in " + esc(where) + "." : "Hale is silent for a long moment. \u201cOn your head, C.\u201d " + first(k) + " is on the next flight home.") + '</p><div class="deltas">' +
            Object.keys(ch).map(function (m) { return '<span class="' + (ch[m] >= 0 ? "up" : "down") + '">' + (ch[m] >= 0 ? "+" : "") + ch[m] + " " + mname(m) + "</span>"; }).join("") + '</div><div class="headline"><small>The London Evening Bugle \u00b7 late edition</small><div>' + esc(head) + '</div></div></div><button class="btn primary" id="go">Back to the desk</button>', "That will echo.");
          $("go").onclick = briefing;
        };
      };
      draw();
    };
  }

  // ---------- end of day ----------
  function gradeOf() { const v = S.meters, avg = (v.trust + v.capital + v.safety + v.secrecy) / 4; return avg >= 68 ? "A" : avg >= 60 ? "B" : avg >= 50 ? "C" : avg >= 40 ? "D" : "E"; }
  function moleLine() {
    if (S.accused === S.mole) return "In the cells at Albion House, " + first(S.mole) + " has started talking: <b>Vass\u2019s new name was sold to the Grey House a fortnight ago.</b>";
    if (S.accused && S.accused !== "none") return "<b>Whoever gave the Grey House Vass\u2019s new name is still inside Albion House.</b> And " + first(S.accused) + " knows you suspected them.";
    return "<b>Someone inside gave the Grey House his new name.</b> We still don\u2019t know who.";
  }
  function summary() {
    if (!S.ended) {
      remaining().forEach(function (id) { S.done[id] = "loss"; apply(PENALTY[id]); S.heads.push(SITS[id].head.loss); S.log.push({ id: id, k: null, res: "loss", appr: "Left on the desk" }); });
      S.hour = 24; S.heads.push("Police seal off Bath street; man taken ill"); S.ended = true;
      if (window.SFX) { SFX.chime(12); setTimeout(function () { SFX.tele(); }, 1500); }
    }
    meters(); ticker(); save("summary");
    const grade = gradeOf();
    const verdict = { A: "The Prime Minister is pleased, which worries Kite.", B: "Solid work, C. A few cracks; nothing that shows.", C: "You held the line, just. No.10 would like a word.", D: "A rough day. Your officers noticed.", E: "A bad day. Fleet Street smells blood." }[grade];
    const extra = S.defector
      ? "The Vienna clerk, in her safe house, has seen the news. Her first words: <b>\u201cVass was only the first name on the list.\u201d</b>"
      : "A message on Kite\u2019s private line, unsigned: <b>\u201cYou left our clerk behind. Now you\u2019ll know how it feels.\u201d</b>";
    render('<div class="card dossier" style="text-align:center"><span class="stamp corner">TOP SECRET</span><div class="lh">HIS MAJESTY\u2019S GOVERNMENT \u00b7 TOP SECRET \u00b7 UK EYES ONLY</div><div class="kicker">From C to the Prime Minister \u00b7 10 Downing Street</div><div class="grade">' + grade + '</div><p style="font-size:17px;color:var(--paper-ink)"><strong>' + verdict + "</strong></p>" +
      '<ul class="log" style="text-align:left">' + S.log.map(function (l) {
        const s = SITS[l.id];
        return "<li>" + (l.k ? '<img class="portrait" src="' + pic(AGENTS[l.k].img) + '" alt="">' : '<span class="portrait" style="display:grid;place-items:center;background:#ddd2b6;font-family:var(--type);color:var(--oxblood)">\u2014</span>') +
          "<span><b>" + esc(s.title) + '</b><br><span style="font-family:var(--type);color:var(--paper-mute);font-size:11px">' + esc(l.appr) + (l.k && l.id !== "mole" ? " \u00b7 " + first(l.k) : "") + '</span></span><span class="r ' + l.res + '">' + { win: "CLOSED", mixed: "PARTIAL", loss: "FAILED" }[l.res] + "</span></li>";
      }).join("") + (S.call ? '<li><span class="portrait" style="display:grid;place-items:center;background:#ddd2b6">\u260e</span><span><b>The call from No.10</b><br><span style="font-family:var(--type);color:var(--paper-mute);font-size:11px">' + (S.call.choice === "deny" ? "Denied " : "Stood by ") + first(S.call.k) + "</span></span><span></span></li>" : "") + "</ul></div>" +
      '<div class="flash-card" id="flash"><div class="bar"><span class="stamp">FLASH \u00b7 MOST IMMEDIATE</span><span class="time">23:47 \u00b7 BATH</span></div><div class="tele">' +
      "<span class=\"hdr\">TO: C &nbsp;\u00b7&nbsp; FROM: KITE, ALBION HOUSE<br>HMG \u00b7 TOP SECRET \u00b7 UK EYES ONLY</span>C \u2014 Avon Police report a man collapsed on a bench near the Circus. He is <b>Pieter Vass</b>, a former Grey House officer we resettled here under a new name in 2019. Alive, unconscious. The government laboratory has identified a Varenian compound code-named <b>PALE HOUR</b>. No.10 wants you at Downing Street by seven.<br><br>" + moleLine() + "<br><br>" + extra + "<br><br>\u2014 Kite</div></div>" +
      '<button class="btn primary" id="paperbtn">Read tomorrow\u2019s front page</button><button class="btn ghost" id="again">Play the day again</button><a class="btn ghost" href="../index.html">Back to Ashline</a>',
      "To be continued. Try other officers and plans.");
    $("again").onclick = function () { clearSave(); fresh(); title(); };
    $("paperbtn").onclick = paper;
    S.finished = grade;
  }

  // ---------- the shareable front page ----------
  function paperData() {
    const calls = S.log.map(function (l) { return { t: SITS[l.id].title, how: l.appr + (l.k && l.id !== "mole" ? " (" + first(l.k) + ")" : ""), r: { win: "Closed", mixed: "Partial", loss: "Failed" }[l.res] }; });
    if (S.call) calls.push({ t: "The call from No.10", how: (S.call.choice === "deny" ? "Denied " : "Stood by ") + first(S.call.k), r: S.call.choice === "deny" ? "Denied" : "Stood by" });
    const mole = S.accused === S.mole ? "Mole caught: " + AGENTS[S.mole].name : S.accused && S.accused !== "none" ? "Wrong officer accused; mole still free" : "Mole still at large";
    return { grade: gradeOf(), calls: calls, mole: mole, lead: "MAN FIGHTS FOR LIFE AFTER BATH BENCH COLLAPSE", sub: "Former foreign official found near the Circus \u00b7 Police cordon overnight \u00b7 Downing Street \u2018monitoring\u2019", side: S.heads.filter(function (h) { return h.indexOf("Bath") < 0; }).slice(-3) };
  }
  function paper() {
    const d = paperData();
    chrome(true);
    render('<div class="frontpage" id="paper"><div class="mast">The London Evening Bugle</div><div class="dateline"><span>LATE FINAL</span><span>Wednesday</span><span>Price 2p \u00b7 fiction</span></div>' +
      '<h1 class="lead">' + esc(d.lead) + '</h1><p class="subd">' + esc(d.sub) + "</p>" +
      '<div class="cols"><div><h3>Spy chief\u2019s long day</h3><ul>' + d.calls.map(function (c) { return "<li><b>" + esc(c.t) + "</b> \u2014 " + esc(c.how) + " <i>" + esc(c.r) + "</i></li>"; }).join("") + "</ul><p><b>" + esc(d.mole) + '</b></p></div><div class="gradebox"><small>Whitehall verdict</small><span>' + d.grade + "</span><small>Albion House</small></div></div>" +
      '<div class="also"><b>Also inside:</b> ' + d.side.map(esc).join(" \u00b7 ") + "</div></div>" +
      '<button class="btn primary" id="save">Save image</button><p class="saved" id="savedmsg"></p><button class="btn ghost" id="again">Play the day again</button><a class="btn ghost" href="../index.html">Back to Ashline</a>', "Share your front page.");
    $("save").onclick = function () { savePaper(); };
    $("again").onclick = function () { clearSave(); fresh(); title(); };
  }
  function wrap(ctx, text, x, y, maxW, lh) {
    const words = text.split(" "); let line = "";
    words.forEach(function (w) { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = w; } else line = t; });
    if (line) { ctx.fillText(line, x, y); y += lh; }
    return y;
  }
  function drawPaper() {
    const d = paperData(), W = 1080, H = 1440, c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d"), serif = 'Georgia, "Times New Roman", serif', mono = '"Courier New", Courier, monospace';
    x.fillStyle = "#efe6d2"; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 3000; i++) { x.fillStyle = "rgba(90,70,40," + Math.random() * 0.05 + ")"; x.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
    x.fillStyle = "#1c1a16"; x.textAlign = "center"; let ms = 92; do { x.font = "bold " + ms + "px " + serif; ms -= 2; } while (x.measureText("The London Evening Bugle").width > W - 120); x.fillText("The London Evening Bugle", W / 2, 130);
    x.fillRect(60, 160, W - 120, 4); x.fillRect(60, 214, W - 120, 2);
    x.font = "24px " + mono; x.textAlign = "left"; x.fillText("LATE FINAL", 64, 198); x.textAlign = "center"; x.fillText("WEDNESDAY", W / 2, 198); x.textAlign = "right"; x.fillText("A WORK OF FICTION", W - 64, 198);
    x.textAlign = "left"; x.font = "bold 76px " + serif; let y = wrap(x, d.lead, 64, 310, W - 128, 84);
    x.font = "italic 32px " + serif; x.fillStyle = "#3b352b"; y = wrap(x, d.sub, 64, y + 10, W - 128, 42);
    x.fillStyle = "#1c1a16"; x.fillRect(60, y + 6, W - 120, 2); y += 70;
    x.font = "bold 40px " + serif; x.fillText("Spy chief\u2019s long day", 64, y); y += 54;
    x.font = "28px " + serif;
    d.calls.forEach(function (cl) { x.font = "bold 28px " + serif; x.fillText("\u25aa " + cl.t, 64, y); x.font = "26px " + mono; x.fillStyle = "#7a1f1f"; x.fillText(cl.r.toUpperCase(), 560, y); x.fillStyle = "#3b352b"; x.font = "italic 26px " + serif; y = wrap(x, cl.how, 92, y + 34, 560, 32) + 14; x.fillStyle = "#1c1a16"; });
    x.font = "bold 30px " + serif; y = wrap(x, d.mole, 64, y + 10, 620, 38);
    // grade seal
    x.fillStyle = "#7a1f1f"; x.beginPath(); x.arc(880, 850, 120, 0, Math.PI * 2); x.fill();
    x.strokeStyle = "#c9a24a"; x.lineWidth = 6; x.beginPath(); x.arc(880, 850, 106, 0, Math.PI * 2); x.stroke();
    x.fillStyle = "#efe6d2"; x.textAlign = "center"; x.font = "bold 140px " + serif; x.fillText(d.grade, 880, 900);
    x.fillStyle = "#1c1a16"; x.font = "24px " + mono; x.fillText("WHITEHALL VERDICT", 880, 1005);
    x.textAlign = "left"; x.fillRect(60, H - 220, W - 120, 2); x.font = "bold 26px " + serif; x.fillText("Also inside:", 64, H - 176);
    x.font = "26px " + serif; wrap(x, d.side.join("  \u00b7  "), 64, H - 140, W - 128, 34);
    x.font = "20px " + mono; x.fillStyle = "#6b6252"; x.textAlign = "center"; x.fillText("ALBION HOUSE \u00b7 an invented British spy story \u00b7 all states, firms and people fictional", W / 2, H - 30);
    return c;
  }
  function savePaper() {
    const c = drawPaper(), msg = $("savedmsg");
    c.toBlob(function (b) {
      const name = "albion-house-front-page.png";
      let file = null; try { file = new File([b], name, { type: "image/png" }); } catch (e) {}
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: "The London Evening Bugle", text: "My day as C at Albion House" }).then(function () { msg.textContent = "Shared."; }).catch(function () { msg.textContent = "Not shared."; });
      } else {
        const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); msg.textContent = "Saved as " + name + ".";
      }
    }, "image/png");
  }

  // ---------- mute ----------
  function muteBtn() { const b = $("mute"); if (!b || !window.SFX) return; b.textContent = SFX.muted ? "\uD83D\uDD07" : "\uD83D\uDD0A"; b.setAttribute("aria-pressed", SFX.muted ? "true" : "false"); }
  if ($("mute")) $("mute").onclick = function () { if (window.SFX) { SFX.unlock(); SFX.setMuted(!SFX.muted); } muteBtn(); };
  muteBtn();

  fresh(); title();
  window.__SPY__ = { state: function () { return S; }, fresh: function () { fresh(); title(); }, paperDataURL: function () { return drawPaper().toDataURL("image/png"); } };
})();
