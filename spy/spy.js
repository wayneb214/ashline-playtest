/* Albion House — the core game and Day 1. Prototype. Everything is fictional: the state, the agencies,
   the companies and the people are invented; only the map is real. No real tradecraft.
   Files: data.js (all content) · feel.js (haptics, stamps, tear-away) · audio.js (sound)
          spy.js (this: state, shared screens, Day 1) · day2.js (Day 2: evidence board, interrogation). */
(function () {
  "use strict";
  const D = window.AH_DATA, FEEL = window.FEEL;
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  const pic = function (n) { return "img/" + n + ".jpg"; };
  const seedM = /[?&]seed=(\d+)/.exec(location.search);
  let seed = seedM ? +seedM[1] : (Date.now() % 1e9);
  const rnd = function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const LH = '<div class="lh">HIS MAJESTY\u2019S GOVERNMENT \u00b7 TOP SECRET \u00b7 UK EYES ONLY</div>';

  // ---------- state, save and time ----------
  const SAVE = "albion-save-v1", DAY2 = "albion-day2-start", TIPS_DONE = "albion-tips-done";
  const FAST = /[?&]fast=1/.test(location.search);
  const HRS = { low: 4, med: 3, high: 2 };
  const EXPIRE = 3; // hours after the deadline before a case is lost for good
  const PENALTY = { defector: { capital: -8, secrecy: -4 }, mole: { secrecy: -12 }, leak: { trust: -10, safety: -8 }, sabotage: { trust: -14, safety: -6 },
    courier: { secrecy: -6 }, safehouse: { safety: -8 }, mole2: { secrecy: -8 }, exit: { trust: -14, capital: -10 } };
  const store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }, del: function (k) { try { localStorage.removeItem(k); } catch (e) {} } };
  let S;

  function fresh(diff, tips) {
    const keys = Object.keys(D.AGENTS);
    S = { day: 1, diff: diff || "standard", tips: tips !== false, tipSeen: {}, hour: 8,
      meters: { trust: 55, capital: 55, safety: 60, secrecy: 55 }, order: ["defector", "mole", "leak"], done: {}, used: {}, stress: {}, loyal: {},
      roster: keys.slice(), lost: {}, pendingRecruit: 0, kit: Object.assign({}, D.DIFFICULTY[diff || "standard"].kit),
      heads: ["Rain over London as the Commons returns"], log: [], belief: null, flashShown: false, defector: false,
      mole: keys[Math.floor(rnd() * keys.length)], accused: null, call: null, porter: false, ended: false, screen: "briefing", chimed: false };
    if (window.__SPY_MOLE__) S.mole = window.__SPY_MOLE__;
    keys.forEach(function (k) { S.stress[k] = D.AGENTS[k].stress; S.loyal[k] = D.AGENTS[k].loyalty; });
  }
  function save(screen) { S.screen = screen; store.set(SAVE, JSON.stringify({ v: 1, seed: seed, S: S })); }
  function loadJSON(key) { try { const d = JSON.parse(store.get(key) || "null"); return d && d.v === 1 && d.S ? d : null; } catch (e) { return null; } }
  function restore(d) { seed = d.seed; S = d.S; S.chimed = true; }
  const hh = function (h) { return (h < 10 ? "0" : "") + h + ":00"; };
  const CASES = function () { return S.day === 2 ? D.SITS2 : D.SITS1; };
  const diff = function () { return D.DIFFICULTY[S.diff] || D.DIFFICULTY.standard; };
  const dueOf = function (id) { return CASES()[id].due + diff().due; };
  const AG = function (k) { return D.AGENTS[k] || D.RECRUITS[k]; };
  const first = function (k) { const n = AG(k).name.split(" "); return n[0] === "Major" ? n[2] : n[0]; };
  function advance(h) { S.hour = Math.min(24, S.hour + h); if (window.SFX) SFX.tick(Math.min(6, h * 2)); }
  function late(id) { return Math.max(0, S.hour - dueOf(id)); }
  const clamp5 = function (v) { return Math.max(0, Math.min(5, v)); };

  // ---------- chrome ----------
  function meters(changes) {
    $("meters").innerHTML = D.METERS.map(function (m) {
      const v = S.meters[m.id], d = changes && changes[m.id];
      return '<div class="meter' + (v < 35 ? " low" : "") + '"><div class="row"><span>' + m.name + "</span><span>" + (d ? '<span class="delta ' + (d > 0 ? "up" : "down") + '">' + (d > 0 ? "+" : "") + d + "</span> " : "") + v + '</span></div><div class="bar"><div class="fill" style="width:' + v + '%"></div></div></div>';
    }).join("");
    $("clock").textContent = hh(S.hour);
    const open = remaining().map(function (id) { return dueOf(id) - S.hour; });
    const soon = open.length ? Math.min.apply(null, open) : 99, box = $("clock").parentNode;
    box.classList.toggle("warn", soon <= 2 && soon >= 0); box.classList.toggle("late", soon < 0 || S.hour >= 21);
    box.querySelector("small").textContent = soon < 0 ? "Overdue" : soon <= 2 ? soon + "h left" : S.hour >= 21 ? "Late" : "Day " + S.day;
  }
  function ticker() { $("tk-run").innerHTML = S.heads.slice().reverse().map(function (h) { return "<b>\u25c6</b>" + esc(h); }).join(""); }
  function chrome(on) { ["hud", "ticker", "hintbar"].forEach(function (id) { $(id).classList.toggle("hidden", !on); }); document.body.classList.toggle("on-title", !on); }
  function render(html, h) {
    $("view").innerHTML = html; window.scrollTo(0, 0); $("hint").textContent = h || "";
    typeAll(); FEEL.thud($("view"));
    document.querySelectorAll("[data-tipx]").forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); S.tipSeen[b.getAttribute("data-tipx")] = true; b.parentNode.remove(); save(S.screen); }; });
  }
  function kite(text, worried) {
    return '<div class="kite card"><img class="portrait" src="' + pic(worried ? "kite-worried" : "kite") + '" alt="Kite"><div class="note"><div class="who">Kite \u00b7 Chief of Staff</div><span class="tx">' + text + "</span></div></div>";
  }
  // a first-run tip card; gone once dismissed, and switched off after Day 1
  function tip(key) { return S.tips && !S.tipSeen[key] ? '<div class="tip" data-tip="' + key + '"><b>Tip</b><span>' + D.TIPS[key] + '</span><button class="tipx" data-tipx="' + key + '">Got it</button></div>' : ""; }
  function pips(n, cls, label) { let s = ""; for (let i = 1; i <= 5; i++) s += '<i class="' + (i <= n ? "on" : "") + '"></i>'; return '<div class="tr ' + cls + '">' + label + '<div class="pips">' + s + "</div></div>"; }
  const mname = function (m) { return D.METERS.filter(function (x) { return x.id === m; })[0].name; };
  function deltas(ch) { return '<div class="deltas">' + Object.keys(ch).map(function (m) { return '<span class="' + (ch[m] >= 0 ? "up" : "down") + '">' + (ch[m] >= 0 ? "+" : "") + ch[m] + " " + mname(m) + "</span>"; }).join("") + "</div>"; }
  function headline(h) { return '<div class="headline"><small>The London Evening Bugle \u00b7 late edition</small><div>' + esc(h) + "</div></div>"; }
  // portrait follows the officer's state: strained when stress is high
  function face(k, mood) {
    const a = AG(k), st = S.stress[k];
    if (mood === "happy") return '<img class="portrait" src="' + pic(a.happy) + '" alt="">';
    if (st >= 4 || mood === "tense") return a.tense ? '<img class="portrait strained" src="' + pic(a.tense) + '" alt="">' : '<img class="portrait strained tint" src="' + pic(a.img) + '" alt="">';
    return '<img class="portrait" src="' + pic(a.img) + '" alt="">';
  }

  // typewriter effect for Kite's notes and telegrams; tap to finish. Off with reduced motion.
  let typing = [];
  function typeAll() {
    typing.forEach(clearInterval); typing = [];
    if (FAST || window.__SPY_FAST__ || FEEL.reduce) return;
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

  // ---------- map: a paper map with pins; routes draw out from London, failures get a red cross ----------
  // Day 1 positions are % of the map box. Day 2 zooms into Britain and converts image positions.
  const UKVIEW = { k: 3.2, px: 0.209, py: 0.5 };
  const uk = function (p) { return [(p[0] * UKVIEW.k - (UKVIEW.k - 1) * UKVIEW.px) * 100, (p[1] * UKVIEW.k - (UKVIEW.k - 0.78) * UKVIEW.py) / 0.78 * 100]; };
  function pinXY(id) {
    const s = CASES()[id];
    if (S.day === 2) return uk(D.UKPLACES[s.place]);
    return id === "sabotage" && D.PLACES[S.belief] ? D.PLACES[S.belief] : [s.x, s.y];
  }
  function map() {
    const home = S.day === 2 ? uk(D.UKPLACES.London) : [30, 52];
    const pin = function (xy, cls, label) { return '<div class="pin ' + cls + '" style="left:' + xy[0].toFixed(1) + "%;top:" + xy[1].toFixed(1) + '%"><span class="head"></span><span class="needle"></span><span class="x">\u2715</span><span class="lab">' + esc(label) + "</span></div>"; };
    const homeLost = S.order.some(function (id) { return CASES()[id].home && S.done[id] === "loss"; });
    let pins = pin(home, "home" + (homeLost ? " loss" : ""), "London"), routes = "", n = 0;
    S.order.forEach(function (id) {
      const s = CASES()[id]; if (s.home) return;
      const xy = pinXY(id), r = S.done[id];
      const label = id === "sabotage" ? (S.belief && S.belief !== "split" ? S.belief : "Bergen?") : S.day === 2 ? s.place === "Airport" ? "\u2708 Airport" : s.place : s.where;
      pins += pin(xy, (r ? "done " + r : "open") + (s.flash && !r ? " flash" : "") + (s.left ? " left" : "") + (s.below ? " below" : ""), label);
      const mx = (home[0] + xy[0]) / 2, my = Math.min(home[1], xy[1]) - 12;
      routes += '<path class="route ' + (r || "open") + '" style="animation-delay:' + (n++ * 0.25) + 's" pathLength="100" d="M' + home[0].toFixed(1) + " " + home[1].toFixed(1) + " Q" + mx.toFixed(1) + " " + my.toFixed(1) + " " + xy[0].toFixed(1) + " " + xy[1].toFixed(1) + '"/>';
    });
    const style = S.day === 2 ? ' style="background-size:' + UKVIEW.k * 100 + "% auto;background-position:" + UKVIEW.px * 100 + "% " + UKVIEW.py * 100 + '%"' : "";
    return '<div class="map' + (S.day === 2 ? " uk" : "") + '"' + style + ' role="img" aria-label="Paper map with today\u2019s cases pinned"><svg class="routes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + routes + "</svg>" + pins + "</div>";
  }

  // ---------- title, day select, difficulty, intro ----------
  function title() {
    chrome(false);
    const saved = loadJSON(SAVE), day2 = loadJSON(DAY2);
    render('<div class="title"><div>' + D.EMBLEM + '<h1>Albion House</h1><div class="sub">British Secret Intelligence</div><div class="flagband" aria-hidden="true"></div></div>' +
      '<div><p class="tag">London. Rain on the river, Big Ben striking eight. Four problems before midnight.</p>' +
      (saved ? '<button class="btn primary" id="continue">Continue \u00b7 Day ' + (saved.S.day || 1) + " \u00b7 " + hh(saved.S.hour) + (saved.S.ended ? " \u00b7 day over" : "") + "</button>" : "") +
      '<button class="btn ' + (saved ? "ghost" : "primary") + '" id="go">' + (saved ? "Start a new game" : "Take the chair") + "</button>" +
      (day2 ? '<button class="btn ghost" id="days">Choose a day</button>' : "") +
      '<div class="fine">A work of fiction. Albion House and every state, firm and person in it are invented.</div></div></div>');
    $("go").onclick = difficulty;
    if (saved) $("continue").onclick = function () { restore(saved); resume(); };
    if (day2) $("days").onclick = daySelect;
  }
  function resume() { chrome(true); meters(); ticker(); S.screen === "summary" ? summary() : briefing(); }
  function daySelect() {
    const day2 = loadJSON(DAY2);
    render('<div class="card dossier">' + LH + '<div class="kicker" style="margin-top:8px">Case files</div><h2>Choose a day</h2>' +
      '<button class="card dossier sit" id="d1"><span class="num">1</span><span><div class="t">The Long Day</div><div class="s">A defector, a mole, a leak, a cable. Ends in Bath.</div></span><span class="dl">NEW</span></button>' +
      '<button class="card dossier sit" id="d2"' + (day2 ? "" : " disabled") + '><span class="num">2</span><span><div class="t">Pale Hour</div><div class="s">' + (day2 ? "Hunt the Bath team before they leave Britain." : "Finish Day 1 first.") + '</div></span><span class="dl">' + (day2 ? "OPEN" : "LOCKED") + "</span></button>" +
      '<button class="btn ghost" id="back">Back</button></div>');
    $("d1").onclick = difficulty;
    if (day2) $("d2").onclick = function () { restore(day2); save("briefing"); chrome(true); meters(); ticker(); window.AH2.briefingIntro(); };
    $("back").onclick = title;
  }
  function difficulty() {
    let pick = "standard", tips = !store.get(TIPS_DONE);
    const draw = function () {
      render('<div class="card dossier">' + LH + '<div class="kicker" style="margin-top:8px">Before you take the chair</div><h2>How hard a day?</h2>' +
        Object.keys(D.DIFFICULTY).map(function (k) { const d = D.DIFFICULTY[k]; return '<button class="card appr' + (pick === k ? " sel" : "") + '" data-d="' + k + '"><div class="t">' + d.name + '</div><p style="margin:0">' + d.txt + "</p></button>"; }).join("") +
        '<label class="tipsopt"><input type="checkbox" id="tips"' + (tips ? " checked" : "") + "> Show tips on the first day</label></div>" +
        '<div class="sticky-go"><button class="btn primary" id="go">Begin \u00b7 ' + D.DIFFICULTY[pick].name + '</button></div><button class="btn ghost" id="back">Back</button>', "You can change this next time you start a new game.");
      document.querySelectorAll("[data-d]").forEach(function (b) { b.onclick = function () { pick = b.getAttribute("data-d"); draw(); }; });
      $("tips").onchange = function () { tips = $("tips").checked; };
      $("go").onclick = function () { store.del(SAVE); store.del(DAY2); fresh(pick, tips); intro(); };
      $("back").onclick = title;
    };
    draw();
  }
  function intro() {
    chrome(false);
    render('<figure class="no10" id="no10"><img src="' + pic("no10") + '" alt="The Prime Minister hands C a file in a study at Number 10, a Union Flag by the window"><figcaption>10 Downing Street \u00b7 the study, 07:10</figcaption></figure>' +
      '<div class="card dossier">' + LH + '<span class="stamp corner">SECRET</span><div class="kicker">Personal file \u00b7 For C only</div><h2 style="margin-top:10px">You are \u2018C\u2019.</h2>' +
      '<p>You are the Chief of <strong>Albion House</strong>, Britain\u2019s foreign intelligence service: the people who run Britain\u2019s spies abroad. (It\u2019s invented, but you\u2019ll know the type.) Your office looks across the Thames at Westminster. You answer to the Prime Minister, <strong>Eleanor Hale</strong>, at Number 10, and to nobody else.</p>' +
      '<p>She has just handed you the morning file in her study. \u201cKeep Britain safe, C. And keep it out of the papers.\u201d</p>' +
      '<p>Your Chief of Staff, <strong>Kite</strong>, runs the building. You have <strong>three officers</strong>, and <strong>one of them is working for the other side</strong>. Watch for small slips.</p>' +
      '<p>The day runs from 08:00 to midnight. Careful plans take longer, bold ones are quick. Every case has a deadline, and it gets harder the longer you leave it. Each choice moves four gauges: public trust, No.10\u2019s favour, officer safety and secrecy.</p>' +
      '<button class="btn primary" id="go">Read the morning brief</button></div>');
    $("go").onclick = function () { chrome(true); meters(); ticker(); briefing(); };
  }

  // ---------- the brief: the hub of each day ----------
  function remaining() { return S.order.filter(function (id) { return !S.done[id]; }); }
  function freeAgents() { return S.roster.filter(function (k) { return !S.used[k]; }); }
  const needsOfficer = function (id) { return CASES()[id].kind === "officer" || CASES()[id].kind === "judge"; };

  // cases left too long are lost
  function expire() {
    const gone = [];
    remaining().forEach(function (id) {
      if (late(id) >= EXPIRE) { S.done[id] = "loss"; apply(PENALTY[id]); S.heads.push(CASES()[id].head.loss); S.log.push({ id: id, k: null, res: "loss", appr: "Expired at " + hh(dueOf(id) + EXPIRE) }); gone.push(id); }
    });
    return gone;
  }
  // the day is over when nothing is left that you can still act on
  function stuck() { return remaining().every(function (id) { return needsOfficer(id) && !freeAgents().length; }); }

  function briefing() {
    if (S.hour >= 24) return summary();
    const gone = expire();
    if (!remaining().length) return summary();
    if (S.day === 1 && S.log.filter(function (l) { return l.k; }).length >= 2 && !S.call) return phone();
    if (S.pendingRecruit > 0) return recruit();
    if (stuck()) return summary();
    meters(); ticker(); save("briefing");
    if (!S.chimed) { S.chimed = true; if (window.SFX) SFX.chime(S.hour); }
    const line = S.day === 2 ? window.AH2.line(gone) : day1Line(gone);
    let list = "", n = 0, warnTxt = "";
    S.order.forEach(function (id) {
      const s = CASES()[id], done = S.done[id], lt = late(id), due = dueOf(id), left = due - S.hour; n++;
      if (!done && left >= 0 && left <= 2 && !warnTxt) warnTxt = s.title + " is due by " + hh(due) + ": " + left + " hour" + (left === 1 ? "" : "s") + " left.";
      if (!done && lt > 0 && !warnTxt) warnTxt = s.title + " is overdue. Odds are dropping; it\u2019s lost at " + hh(due + EXPIRE) + ".";
      const off = !done && needsOfficer(id) && !freeAgents().length;
      const sub = s.kind === "accuse" || s.kind === "interro" || s.kind === "mole2" ? " \u00b7 no officer needed" : "";
      list += '<button class="card dossier sit' + (done ? " done" : "") + (s.flash && !done ? " flash" : "") + '" data-sit="' + id + '"' + (done || off ? " disabled" : "") + '><span class="num">' + ["I", "II", "III", "IV"][n - 1] + '</span><span><div class="t">' + esc(S.day === 2 ? window.AH2.titleOf(id) : s.title) + '</div><div class="s">' + esc(s.where) + (done ? "" : sub) + '</div></span><span class="dl' + (lt > 0 && !done ? " over" : left <= 2 && !done ? " soon" : "") + '">' +
        (done ? (done === "win" ? "CLOSED" : done === "mixed" ? "PARTIAL" : "FAILED") : lt > 0 ? "LATE " + lt + "h" : "by " + hh(due)) + "</span></button>";
    });
    render('<div class="lh paper">HIS MAJESTY\u2019S GOVERNMENT \u00b7 TOP SECRET \u00b7 UK EYES ONLY</div><div class="kicker">' + (S.day === 2 ? "Day 2 \u00b7 Pale Hour" : "Morning brief for C") + " \u00b7 Albion House</div>" + kite(line.text, line.worried) + tip("briefing") + map() + list +
      (S.day === 2 ? window.AH2.boardButton() : "") + '<div class="kitline">Kit locker: ' + kitStock() + "</div>" +
      '<button class="btn ghost" id="endday">Call it a day</button>', warnTxt || "Tap a file to deal with it.");
    document.querySelectorAll("[data-sit]").forEach(function (b) { b.onclick = function () { openCase(b.getAttribute("data-sit")); }; });
    if (S.day === 2) window.AH2.bindBoardButton();
    $("endday").onclick = function () { S.hour = 24; summary(); };
  }
  function openCase(id) {
    const kind = CASES()[id].kind;
    if (kind === "accuse") return accuse();
    if (kind === "judge" && !S.belief) return judgement();
    if (kind === "interro" || kind === "mole2") return window.AH2.open(id);
    pickAgent(id);
  }
  function day1Line(gone) {
    const flash = S.order.indexOf("sabotage") >= 0 && !S.done.sabotage, fresh2 = flash && !S.flashShown;
    let text;
    if (!S.log.length) text = "Morning, C. Tea\u2019s on the desk. Four hours for a careful plan, two for a bold one. The leak is due first, by " + hh(dueOf("leak")) + ".";
    else if (fresh2) text = "<b>Flash from the night desk.</b> Someone means to cut a North Sea cable tonight. Two reports, two places. I\u2019ve put it top of the pile.";
    else if (gone.length) text = "We ran out of time on <b>" + gone.map(function (id) { return CASES()[id].title.toLowerCase(); }).join(" and ") + "</b>. It\u2019s gone, C. The papers have it.";
    else if (!S.porter && S.log.length) { S.porter = true; text = "Small thing. The night porter says one of ours came back to the building at three this morning without signing in. All he saw was <b>" + D.AGENTS[S.mole].look + "</b>."; }
    else text = benchLine();
    if (fresh2) { S.flashShown = true; if (window.SFX) SFX.tele(); FEEL.buzz("ring"); }
    return { text: text, worried: fresh2 || gone.length };
  }
  function benchLine() { const n = freeAgents().length; return "It\u2019s " + hh(S.hour) + ". " + n + " officer" + (n !== 1 ? "s" : "") + " on the bench. Whatever we don\u2019t touch will sort itself out, badly."; }
  function kitStock() { return Object.keys(D.KIT).map(function (k) { return '<span class="kitn' + (S.kit[k] ? "" : " out") + '">' + D.KIT[k].icon + " " + D.KIT[k].name + " \u00d7" + (S.kit[k] || 0) + "</span>"; }).join(""); }

  // ---------- recruitment: when an officer is lost, hire a replacement ----------
  function recruit() {
    const pool = Object.keys(D.RECRUITS).filter(function (k) { return S.roster.indexOf(k) < 0 && !S.lost[k]; }).slice(0, 3);
    if (!pool.length) { S.pendingRecruit = 0; return briefing(); }
    let pick = null;
    const lostNames = Object.keys(S.lost).map(function (k) { return first(k) + " (" + S.lost[k] + ")"; }).join(", ");
    const draw = function () {
      render('<div class="card dossier">' + LH + '<span class="stamp corner">PERSONNEL</span><div class="kicker" style="margin-top:8px">Personnel \u00b7 the reserve list</div><h2 style="padding-right:110px">We\u2019re a pair of hands short</h2><p>Lost so far: <b>' + esc(lostNames) + "</b>. Kite has three files from the reserve list. Hiring takes an hour.</p></div>" +
        '<div class="agents">' + pool.map(function (k) {
          const a = D.RECRUITS[k];
          return '<button class="card agent recruit' + (pick === k ? " sel" : "") + '" data-r="' + k + '"><img class="portrait" src="' + pic(a.img) + '" alt=""><div style="flex:1;min-width:0"><div class="nm">' + a.name + '</div><div class="role">' + a.role + '</div><div class="traits">' + pips(a.skill, "", "Skill") + pips(a.loyalty, "loyal", "Loyalty") + pips(a.stress, "stress", "Stress") + pips(a.cover, "", "Cover") + '</div><div class="quirk">\u2605 ' + a.quirkTxt + '</div><div class="fnote">File note: ' + a.note + "</div></div></button>";
        }).join("") + "</div>" +
        '<div class="sticky-go"><button class="btn primary" id="go"' + (pick ? "" : " disabled") + ">" + (pick ? "Hire " + first(pick) : "Choose a recruit") + '</button></div><button class="btn ghost" id="skip">Manage without</button>', "Each recruit has a quirk. Choose the one that fits what\u2019s left.");
      document.querySelectorAll("[data-r]").forEach(function (b) { b.onclick = function () { pick = b.getAttribute("data-r"); draw(); }; });
      $("go").onclick = function () {
        const a = D.RECRUITS[pick]; S.roster.push(pick); S.stress[pick] = a.stress; S.loyal[pick] = a.loyalty;
        S.pendingRecruit--; advance(1); S.heads.push("Whitehall job advert draws \u2018unusual\u2019 applicants"); FEEL.buzz("stamp"); briefing();
      };
      $("skip").onclick = function () { S.pendingRecruit = 0; briefing(); };
    };
    draw();
  }
  function loseOfficer(k, why) { S.roster = S.roster.filter(function (x) { return x !== k; }); S.lost[k] = why; S.pendingRecruit++; }

  // ---------- Day 1: the cable judgement ----------
  function judgement() {
    let sel = null;
    const draw = function () {
      render('<div class="kicker">Your judgement \u00b7 the cable threat</div><h2>Two reports. One truth.</h2>' +
        kite("They can\u2019t both be right. Mira\u2019s man has been good to us before. But he was paid twice this month, and not only by us. The intercept is thin, but it\u2019s their own voice.", true) + tip("judge") +
        '<div class="reports">' + D.REPORTS.map(function (r, i) {
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

  // ---------- odds and time ----------
  function oddsFor(id, k, a, kitId) {
    const ag = AG(k);
    let o = 30 + ag.skill * 6 + (ag.good.indexOf(id) >= 0 ? 12 : 0) + a.mod - S.stress[k] * 4 + ag.cover * 2 + (S.loyal[k] - 3) * 3 + diff().odds;
    if (ag.quirk === "careful" && a.risk === "low") o += 10;
    if (kitId) o += D.KIT[kitId].odds || 0;
    if (k === S.mole && S.accused !== S.mole) o -= 10; // quietly working against you
    const lt = late(id); if (lt > 0) o -= 10 + lt * 5;
    if (id === "sabotage") { if (S.belief === "split") o -= 12; else if (S.belief !== D.TRUTH) o = Math.min(o, 12); }
    return Math.max(5, Math.min(92, Math.round(o)));
  }
  function hoursFor(k, a, kitId) { return Math.max(1, HRS[a.risk] - (AG(k).quirk === "quick" ? 1 : 0) + (kitId ? D.KIT[kitId].hours || 0 : 0)); }

  function agentCard(k, extra, sel, disabled, attr) {
    const a = AG(k), st = S.stress[k];
    return '<button class="card agent' + (sel ? " sel" : "") + (disabled ? " used" : "") + '" ' + attr + '="' + k + '">' + face(k) + '<div style="flex:1;min-width:0"><div class="nm">' + a.name + (S.used[k] ? " \u00b7 in the field" : "") + (st >= 4 ? ' <span class="strain">Strained</span>' : "") + '</div><div class="role">' + a.role + '</div><div class="traits">' +
      pips(a.skill, "", "Skill") + pips(S.loyal[k], "loyal" + (S.loyal[k] <= 2 ? " high" : ""), "Loyalty") + pips(st, "stress" + (st >= 4 ? " high" : ""), "Stress") + pips(a.cover, "", "Cover") + "</div>" + (a.quirkTxt ? '<div class="quirk">\u2605 ' + a.quirkTxt + "</div>" : "") + '<div class="fnote">File note: ' + a.note + "</div>" + (extra || "") + "</div></button>";
  }

  function pickAgent(id, chosen) {
    const s = CASES()[id];
    let pick = chosen || null;
    const draw = function () {
      const cards = S.roster.map(function (k) {
        const fit = AG(k).good.indexOf(id) >= 0;
        return agentCard(k, '<div class="fit' + (fit ? "" : " bad") + '">' + (fit ? "\u2713 Right person for this" : "Not their line of work") + "</div>", pick === k, S.used[k], "data-a");
      }).join("");
      const lt = late(id);
      render('<div class="step"><i class="on"></i><i></i></div><div class="card dossier">' + LH + '<span class="stamp corner">CONFIDENTIAL</span><div class="kicker">' + esc(s.where) + " \u00b7 by " + hh(dueOf(id)) + (lt ? " \u00b7 " + lt + "h LATE" : "") + '</div><h2 style="margin-top:8px;padding-right:110px">' + esc(s.title) + "</h2><p>" + esc(s.brief) + (id === "sabotage" ? " <strong>You\u2019re defending: " + (S.belief === "split" ? "both sites" : S.belief) + ".</strong>" : "") + (lt ? ' <strong class="warn-t">It\u2019s late: odds are down ' + (10 + lt * 5) + "%.</strong>" : "") + "</p></div>" + tip("agent") + '<div class="kicker" style="margin:4px 0 8px">Who do you send?</div><div class="agents">' + cards + '</div><div class="sticky-go"><button class="btn primary" id="go"' + (pick ? "" : " disabled") + ">" + (pick ? "Send " + first(pick) : "Choose an officer") + '</button></div><button class="btn ghost" id="back">Back to the brief</button>',
        "Step 1 of 2 \u00b7 Who goes? Stress and low loyalty mean mistakes.");
      document.querySelectorAll("[data-a]").forEach(function (b) { if (!S.used[b.getAttribute("data-a")]) b.onclick = function () { pick = b.getAttribute("data-a"); draw(); }; });
      $("go").onclick = function () { approach(id, pick); };
      $("back").onclick = briefing;
    };
    draw();
  }

  function approach(id, k) {
    const s = CASES()[id];
    let sel = null, kit = null;
    const fmt = function (o) { return Object.keys(o).map(function (m) { return (o[m] > 0 ? "+" : "") + o[m] + " " + mname(m); }).join(", "); };
    const draw = function () {
      const opts = s.approaches.map(function (a, i) {
        const locked = a.needs && !(S.unlocked || {})[a.needs];
        const h = hoursFor(k, a, kit), ends = Math.min(24, S.hour + h);
        return '<button class="card appr' + (sel === i ? " sel" : "") + (locked ? " locked" : "") + '" data-i="' + i + '"' + (locked ? " disabled" : "") + '><div class="t">' + (locked ? "\ud83d\udd12 " : "") + esc(a.t) + '</div><p style="margin:0">' + esc(a.d) + "</p>" +
          (locked ? '<div class="chips"><span class="chip risk-high">Locked \u00b7 link the ' + (a.needs === "ferry" ? "ferry booking" : "hire-car receipt") + " on the evidence board</span></div>" :
            '<div class="chips"><span class="chip odds">' + oddsFor(id, k, a, kit) + '% chance</span><span class="chip risk-' + a.risk + '">' + { low: "Low risk", med: "Some risk", high: "High risk" }[a.risk] + '</span><span class="chip time' + (ends > dueOf(id) ? " over" : "") + '">\u23f1 ' + h + "h \u00b7 done " + hh(ends) + '</span><span class="chip">If it works: ' + esc(fmt(a.win)) + "</span></div>") + "</button>";
      }).join("");
      const kits = Object.keys(D.KIT).map(function (key) {
        const n = S.kit[key] || 0, on = kit === key;
        return '<button class="kit' + (on ? " on" : "") + '" data-kit="' + key + '"' + (n ? "" : " disabled") + '><span class="ki">' + D.KIT[key].icon + '</span><span class="kn">' + D.KIT[key].name + '</span><span class="kt">' + D.KIT[key].txt + '</span><span class="ks">' + (on ? "Packed" : "\u00d7" + n) + "</span></button>";
      }).join("");
      render('<div class="step"><i class="on"></i><i class="on"></i></div><div class="kicker">' + esc(s.title) + '</div><div class="kite card" style="align-items:center">' + face(k) + '<div class="note"><div class="who">' + AG(k).name + '</div><span class="tx">' + (S.stress[k] >= 4 ? "I can do it, C. Just\u2026 not the loud way, if you can help it." : "Standing by, C. How do you want it played?") + "</span></div></div>" + tip("approach") +
        '<div class="kicker" style="margin:4px 0 6px">Kit locker \u00b7 take one item (optional)</div><div class="kits">' + kits + "</div>" + opts +
        '<div class="sticky-go"><button class="btn primary" id="go"' + (sel == null ? " disabled" : "") + ">" + (sel == null ? "Choose an approach" : "Go \u2014 " + esc(s.approaches[sel].t)) + '</button></div><button class="btn ghost" id="back">Send someone else</button>',
        "Step 2 of 2 \u00b7 Careful plans take longer. Bold ones are quick, and can backfire.");
      document.querySelectorAll("[data-i]").forEach(function (b) { b.onclick = function () { sel = +b.getAttribute("data-i"); draw(); }; });
      document.querySelectorAll("[data-kit]").forEach(function (b) { b.onclick = function () { const key = b.getAttribute("data-kit"); kit = kit === key ? null : key; draw(); }; });
      $("go").onclick = function () { resolve(id, k, s.approaches[sel], kit); };
      $("back").onclick = function () { pickAgent(id, k); };
    };
    draw();
  }

  function apply(delta) {
    const ch = {};
    Object.keys(delta).forEach(function (m) { const before = S.meters[m]; S.meters[m] = Math.max(0, Math.min(100, before + delta[m])); ch[m] = S.meters[m] - before; });
    return ch;
  }
  // the painted vignette for an outcome: case-specific art on success, otherwise by result
  function vignette(id, res) { const art = CASES()[id].art; return '<img class="vignette" src="' + pic(art && res !== "loss" ? art : "v-" + res) + '" alt="">'; }

  function resolve(id, k, a, kitId) {
    const s = CASES()[id], kitD = kitId ? D.KIT[kitId] : {}, odds = oddsFor(id, k, a, kitId), hrs = hoursFor(k, a, kitId), r = rnd() * 100;
    let res = r < odds * 0.7 ? "win" : r < odds ? "mixed" : "loss";
    if (window.__SPY_FORCE__) res = window.__SPY_FORCE__;
    if (kitId) S.kit[kitId]--;
    const st0 = S.stress[k], lo0 = S.loyal[k];
    const planStress = kitD.calm || (AG(k).quirk === "steady" && a.risk === "high") ? 0 : a.stress;
    S.stress[k] = clamp5(S.stress[k] + planStress + (res === "loss" && !kitD.soft ? 1 : res === "win" ? -1 : 0));
    S.loyal[k] = clamp5(S.loyal[k] + (res === "loss" ? -1 : res === "win" && a.risk === "low" ? 1 : 0));
    let delta = a[res];
    if (res === "loss" && kitD.soft) { delta = {}; Object.keys(a.loss).forEach(function (m) { delta[m] = Math.round(a.loss[m] / 2); }); }
    const ch = apply(delta);
    S.done[id] = res; S.used[k] = true; advance(hrs);
    let head = s.head[res], note = "";
    if (id === "sabotage") {
      if (S.belief === D.TRUTH) note = "You read it right: Bergen was bait.";
      else if (S.belief === "split") note = "Hedging thinned the Bergen team, but Rotterdam was covered.";
      else { note = "Bergen was bait. While we watched the north, Rotterdam went dark."; head = "Blackout at Rotterdam data hub; Bergen \u2018a decoy\u2019, say insiders"; }
    }
    if (S.day === 2) note = (note + " " + window.AH2.afterCase(id, res)).trim();
    // the mole's slip: a small wrong detail in their debrief
    const slip = k === S.mole && S.accused !== S.mole && D.AGENTS[k] ? D.AGENTS[k].slip : "";
    S.heads.push(head); S.log.push({ id: id, k: k, res: res, appr: a.t + (kitId ? " + " + kitD.name.toLowerCase() : ""), slip: !!slip });
    const nm = first(k);
    let line = { win: nm + " pulled it off. Clean. Nobody will ever know.", mixed: nm + " got it done, but not cleanly. There will be questions.", loss: "It went wrong. " + nm + " is out \u2014 just \u2014 and badly shaken." }[res];
    if (res === "loss" && S.stress[k] >= 5) { loseOfficer(k, "sent home"); line += " The doctor has signed " + nm + " off. They won\u2019t be back this week."; }
    if (id === "defector" && res !== "loss") S.defector = true;
    if (S.day === 1 && S.order.indexOf("sabotage") < 0) S.order.push("sabotage");
    meters(ch); ticker(); save("briefing"); FEEL.buzz(res === "loss" ? "loss" : "win");
    const od = function (lab, a0, a1) { return a1 === a0 ? "" : '<span class="' + ((lab === "Stress") === (a1 > a0) ? "down" : "up") + '">' + lab + " " + a0 + "\u2192" + a1 + "</span>"; };
    render('<div class="card outcome ' + res + '"><span class="stamp thud">' + { win: "CLOSED", mixed: "PARTIAL", loss: "FAILED" }[res] + "</span>" + vignette(id, res) + '<div class="ohead">' + face(k, res === "win" ? "happy" : res === "loss" ? "tense" : "") + "<h2>" + esc(s.title) + "</h2></div><p>" + esc(line) + (note ? " <strong>" + note + "</strong>" : "") + "</p>" +
      (slip ? '<p class="slip">From the debrief: <em>' + esc(slip) + "</em></p>" : "") + deltas(ch) +
      '<div class="deltas officer">' + od("Stress", st0, S.stress[k]) + od("Loyalty", lo0, S.loyal[k]) + "</div>" + headline(head) + "</div>" +
      '<p class="oddsline">' + odds + "% odds \u00b7 took " + hrs + "h \u00b7 now " + hh(S.hour) + '</p><button class="btn primary" id="go">Back to the desk</button>',
      "The gauges moved. The papers noticed. " + nm + " will remember this.");
    $("go").onclick = briefing;
  }

  // a non-officer case finishing (used by the mole accusation and Day 2 interrogations)
  function finishCase(id, res, k, appr, head, ch, stampWord, body, imgHtml, hintTxt) {
    S.done[id] = res; S.heads.push(head); S.log.push({ id: id, k: k, res: res, appr: appr });
    meters(ch); ticker(); save("briefing"); FEEL.buzz(res === "loss" ? "loss" : "win");
    render('<div class="card outcome ' + res + '" id="case-result"><span class="stamp thud">' + stampWord + "</span>" + (imgHtml || "") + "<h2>" + esc(CASES()[id].title) + "</h2><p>" + body + "</p>" + deltas(ch) + headline(head) + '</div><button class="btn primary" id="go">Back to the desk</button>', hintTxt || "");
    $("go").onclick = briefing;
  }

  // ---------- the mole: accuse one of your own ----------
  function accuse(second) {
    let sel = null;
    const id = second ? "mole2" : "mole", s = CASES()[id];
    const draw = function () {
      const cards = S.roster.map(function (k) { return agentCard(k, "", sel === k, false, "data-m"); }).join("");
      render('<div class="card dossier">' + LH + '<span class="stamp corner">EYES ONLY</span><div class="kicker">Albion House \u00b7 by ' + hh(dueOf(id)) + '</div><h2 style="margin-top:8px;padding-right:110px">' + (second ? "The mole, second chance" : "Someone inside is talking") + "</h2><p>" + esc(second ? "Somebody rang the Bath team\u2019s phone from the street outside this building last night. The mole is still here. One more try before they run." : s.brief) + "</p>" +
        '<p class="clue"><b>What we know:</b> ' + esc(D.AGENTS[S.mole].clue) + (second ? " The porter, again: <b>" + esc(D.AGENTS[S.mole].look) + "</b>." : "") + "</p></div>" +
        kite("Look at their file notes. Think about the porter, and anything odd in the debriefs. If you name the wrong one, we lose a good officer and the real one goes quiet.", true) + tip("accuse") +
        '<div class="kicker" style="margin:4px 0 8px">Who do you accuse? (takes 2 hours)</div><div class="agents">' + cards +
        '<button class="card appr' + (sel === "none" ? " sel" : "") + '" data-m="none"><div class="t">Not yet. Keep watching.</div><p style="margin:0">No accusation today. Safer for now, and the leak goes on.</p></button></div>' +
        '<div class="sticky-go"><button class="btn primary" id="go"' + (sel ? "" : " disabled") + ">" + (!sel ? "Choose someone" : sel === "none" ? "Keep watching" : "Accuse " + first(sel)) + '</button></div><button class="btn ghost" id="back">Back to the brief</button>',
        late(id) ? "Overdue. The longer we wait, the more they give away." : "Three clues: the file note, the porter, a slip in a debrief.");
      document.querySelectorAll("[data-m]").forEach(function (b) { b.onclick = function () { sel = b.getAttribute("data-m"); draw(); }; });
      $("go").onclick = function () { accuseResolve(sel, id); };
      $("back").onclick = briefing;
    };
    draw();
  }
  function accuseResolve(who, id) {
    advance(2);
    let res, ch, head, line;
    const k = who === "none" ? null : who;
    if (who === "none") { res = "mixed"; ch = apply({ secrecy: -6 }); head = "Whitehall denies \u2018mole hunt\u2019 rumours"; line = "You hold your nerve and say nothing. Whoever it is will keep talking tonight."; }
    else if (who === S.mole) {
      res = "win"; ch = apply({ secrecy: 14, capital: 8, safety: 6 }); loseOfficer(who, "detained");
      head = "Albion House officer quietly detained; Whitehall silent"; line = first(who) + " didn\u2019t argue. Just asked for a cigarette and a lawyer. The leaks stop tonight. <b>Kite will find you a replacement.</b>";
      if (id === "mole2") line += " " + window.AH2.afterCase("mole2", "win");
    } else {
      res = "loss"; ch = apply({ trust: -6, secrecy: -10, safety: -6 }); S.loyal[who] = clamp5(S.loyal[who] - 2); S.stress[who] = clamp5(S.stress[who] + 2);
      head = "Officer suspended, then cleared, in Albion House mole hunt"; line = first(who) + " was clean. They\u2019re back at their desk, furious, and the real mole now knows we\u2019re looking.";
    }
    S.accused = who;
    finishCase(id, res, k, who === "none" ? "Kept watching" : "Accused " + first(who), head, ch, { win: "CAUGHT", mixed: "OPEN", loss: "WRONG" }[res], line,
      k ? '<div class="ohead">' + face(k, res === "loss" ? "tense" : "") + "</div>" : "",
      res === "win" ? "One fewer officer, but the leaks have stopped." : res === "loss" ? "A loyal officer is hurt, and the mole is still free." : "The mole is still free.");
  }

  // ---------- No.10 rings (Day 1) ----------
  function phone() {
    const last = S.log.filter(function (l) { return l.k && l.id !== "mole"; }).slice(-1)[0], k = last.k, where = CASES()[last.id].where.split(/,| or /)[0];
    S.call = { k: k, choice: null }; save("briefing");
    if (window.SFX) SFX.ring(); FEEL.buzz("ring");
    render('<div class="phone card" id="phone"><div class="lh">NO.10 SWITCHBOARD \u00b7 SECURE LINE</div><div class="pm"><img src="' + pic("pm-phone") + '" alt="Prime Minister Eleanor Hale on the telephone"></div><div class="ringing">\u260e The Prime Minister for you, C.</div><button class="btn primary" id="answer">Answer</button></div>', "The red phone on your desk is ringing.");
    $("answer").onclick = function () {
      if (window.SFX) SFX.stopRing();
      let sel = null;
      const draw = function () {
        render('<div class="phone card call" id="phone"><div class="lh">NO.10 SWITCHBOARD \u00b7 SECURE LINE \u00b7 ' + hh(S.hour) + '</div><div class="pm"><img src="' + pic("pm-phone") + '" alt="Prime Minister Eleanor Hale"></div>' +
          '<div class="note"><div class="who">Eleanor Hale \u00b7 Prime Minister</div><span class="tx">C. The Varenian ambassador is at the Foreign Office shouting about a British spy in ' + esc(where) + ". The Courier has a photograph of <b>" + AG(k).name + "</b>. I can tell the House we\u2019ve never heard of them, or stand by them and take the heat. Your call.</span></div></div>" +
          '<button class="card appr' + (sel === "deny" ? " sel" : "") + '" data-c="deny"><div class="t">Deny them. Protect the government.</div><div class="chips"><span class="chip">+10 No.10\u2019s favour</span><span class="chip risk-high">\u221210 Officer safety</span><span class="chip risk-high">' + first(k) + " loyalty \u22122</span></div></button>" +
          '<button class="card appr' + (sel === "stand" ? " sel" : "") + '" data-c="stand"><div class="t">Stand by them. Protect the officer.</div><div class="chips"><span class="chip risk-high">\u221212 No.10\u2019s favour</span><span class="chip risk-low">+8 Officer safety</span><span class="chip risk-low">' + first(k) + " loyalty +1</span></div></button>" +
          '<div class="sticky-go"><button class="btn primary" id="go"' + (sel ? "" : " disabled") + ">" + (sel ? "Tell her" : "What do you tell her?") + "</button></div>", "There is no right answer. Only a choice.");
        document.querySelectorAll("[data-c]").forEach(function (b) { b.onclick = function () { sel = b.getAttribute("data-c"); draw(); }; });
        $("go").onclick = function () {
          let ch, head;
          if (sel === "deny") { ch = apply({ capital: 10, trust: 4, safety: -10 }); S.loyal[k] = clamp5(S.loyal[k] - 2); S.stress[k] = clamp5(S.stress[k] + 1); head = "No.10: \u2018no knowledge\u2019 of Briton in " + where + " photograph"; }
          else { ch = apply({ capital: -12, safety: 8 }); S.loyal[k] = clamp5(S.loyal[k] + 1); head = "PM refuses to discuss \u2018our people abroad\u2019; Varenians fume"; }
          S.call.choice = sel; S.heads.push(head); advance(1); meters(ch); ticker(); save("briefing");
          render('<div class="card outcome ' + (sel === "deny" ? "mixed" : "win") + '"><span class="stamp thud">' + (sel === "deny" ? "DENIED" : "STOOD BY") + '</span><div class="ohead">' + face(k, sel === "deny" ? "tense" : "") + "<h2>The call from No.10</h2></div><p>" + (sel === "deny" ? "Hale thanks you, briskly. " + first(k) + " hears the statement on the radio in a hotel room in " + esc(where) + "." : "Hale is silent for a long moment. \u201cOn your head, C.\u201d " + first(k) + " is on the next flight home.") + "</p>" +
            deltas(ch) + headline(head) + '</div><button class="btn primary" id="go">Back to the desk</button>', "That will echo.");
          $("go").onclick = briefing;
        };
      };
      draw();
    };
  }

  // ---------- end of day ----------
  function gradeOf() { const v = S.meters, avg = (v.trust + v.capital + v.safety + v.secrecy) / 4; return avg >= 68 ? "A" : avg >= 60 ? "B" : avg >= 50 ? "C" : avg >= 40 ? "D" : "E"; }
  const moleCaught = function () { return S.accused === S.mole; };
  function moleText() { return moleCaught() ? "Mole caught: " + D.AGENTS[S.mole].name : S.accused && S.accused !== "none" ? "Wrong officer accused \u2014 mole still free" : "Mole still at large"; }
  function moleLine() {
    if (moleCaught()) return "In the cells at Albion House, " + first(S.mole) + " has started talking: <b>Vass\u2019s new name was sold to the Grey House a fortnight ago.</b>";
    if (S.accused && S.accused !== "none") return "<b>Whoever gave the Grey House Vass\u2019s new name is still inside Albion House.</b> And " + first(S.accused) + " knows you suspected them.";
    return "<b>Someone inside gave the Grey House his new name.</b> We still don\u2019t know who.";
  }
  function day1Flash() {
    const extra = S.defector
      ? "The Vienna clerk, in her safe house, has seen the news. Her first words: <b>\u201cVass was only the first name on the list.\u201d</b>"
      : "A message on Kite\u2019s private line, unsigned: <b>\u201cYou left our clerk behind. Now you\u2019ll know how it feels.\u201d</b>";
    return '<div class="flash-card" id="flash"><div class="bar"><span class="stamp">FLASH \u00b7 MOST IMMEDIATE</span><span class="time">23:47 \u00b7 BATH</span></div><div class="tele">' +
      "<span class=\"hdr\">TO: C &nbsp;\u00b7&nbsp; FROM: KITE, ALBION HOUSE<br>HMG \u00b7 TOP SECRET \u00b7 UK EYES ONLY</span>C \u2014 Avon Police report a man collapsed on a bench near the Circus. He is <b>Pieter Vass</b>, a former Grey House officer we resettled here under a new name in 2019. Alive, unconscious. The government laboratory has identified a Varenian compound code-named <b>PALE HOUR</b>. No.10 wants you at Downing Street by seven.<br><br>" + moleLine() + "<br><br>" + extra + "<br><br>\u2014 Kite</div></div>";
  }
  function summary() {
    if (!S.ended) {
      remaining().forEach(function (id) { S.done[id] = "loss"; apply(PENALTY[id]); S.heads.push(CASES()[id].head.loss); S.log.push({ id: id, k: null, res: "loss", appr: "Left on the desk" }); });
      S.hour = 24; S.ended = true;
      S.heads.push(S.day === 1 ? "Police seal off Bath street; man taken ill" : S.done.exit === "win" ? "Harwich ferry delayed by police operation" : "Ferry leaves Harwich on time despite \u2018security alert\u2019");
      if (window.SFX) { SFX.chime(12); setTimeout(function () { SFX.tele(); }, 1500); }
      if (S.day === 1) { store.set(TIPS_DONE, "1"); store.set(DAY2, JSON.stringify({ v: 1, seed: seed, S: day2State() })); }
    }
    meters(); ticker(); save("summary");
    const grade = gradeOf();
    const verdict = { A: "The Prime Minister is pleased, which worries Kite.", B: "Solid work, C. A few cracks; nothing that shows.", C: "You held the line, just. No.10 would like a word.", D: "A rough day. Your officers noticed.", E: "A bad day. Fleet Street smells blood." }[grade];
    render('<div class="card dossier" style="text-align:center"><span class="stamp corner">TOP SECRET</span>' + LH + '<div class="kicker">Day ' + S.day + " \u00b7 From C to the Prime Minister \u00b7 10 Downing Street</div><div class=\"grade\">" + grade + '</div><p style="font-size:17px;color:var(--paper-ink)"><strong>' + verdict + "</strong></p>" +
      '<ul class="log" style="text-align:left">' + S.log.map(function (l) {
        const s = CASES()[l.id];
        return "<li>" + (l.k ? '<img class="portrait" src="' + pic(AG(l.k).img) + '" alt="">' : '<span class="portrait dash">\u2014</span>') +
          "<span><b>" + esc(s.title) + '</b><br><span class="how">' + esc(l.appr) + (l.k && s.kind !== "accuse" ? " \u00b7 " + first(l.k) : "") + '</span></span><span class="r ' + l.res + '">' + { win: "CLOSED", mixed: "PARTIAL", loss: "FAILED" }[l.res] + "</span></li>";
      }).join("") + (S.call && S.day === 1 ? '<li><span class="portrait dash">\u260e</span><span><b>The call from No.10</b><br><span class="how">' + (S.call.choice === "deny" ? "Denied " : "Stood by ") + first(S.call.k) + "</span></span><span></span></li>" : "") + "</ul></div>" +
      (S.day === 1 ? day1Flash() : window.AH2.flash()) +
      (S.day === 1 ? '<button class="btn primary" id="day2">Begin Day 2 \u00b7 Pale Hour</button>' : "") +
      '<button class="btn ' + (S.day === 1 ? "ghost" : "primary") + '" id="paperbtn">Read tomorrow\u2019s front page</button><button class="btn ghost" id="again">New game</button><a class="btn ghost" href="../index.html">Back to Ashline</a>',
      S.day === 1 ? "To be continued. Day 2 starts at eight." : "To be continued. Day 3 is being written.");
    $("again").onclick = function () { store.del(SAVE); difficulty(); };
    $("paperbtn").onclick = function () { FEEL.tearThen($("flash"), paper); };
    if ($("day2")) $("day2").onclick = function () { FEEL.tearThen($("flash"), function () { restore(loadJSON(DAY2)); save("briefing"); window.AH2.briefingIntro(); }); };
    S.finished = grade;
  }
  // Day 2 begins from the end of Day 1: same officers, meters and mole result; a fresh clock and kit
  function day2State() {
    const n = JSON.parse(JSON.stringify(S));
    n.days = { 1: { grade: gradeOf(), mole: moleText(), defector: S.defector } };
    n.day = 2; n.hour = 8; n.used = {}; n.log = []; n.done = {}; n.ended = false; n.chimed = false; n.screen = "briefing"; n.tips = false;
    n.order = ["courier", "safehouse", "mole2", "exit"]; n.kit = Object.assign({}, diff().kit); n.belief = null; n.call = null;
    n.clues = { cctv: true, hire: true }; n.links = {}; n.unlocked = {}; n.interro = {}; n.seenIntro = false;
    n.heads = S.heads.slice(-2).concat(["Bath: police hunt three after bench collapse"]);
    n.roster.forEach(function (k) { n.stress[k] = clamp5(n.stress[k] - 1); }); // a night's sleep
    return n;
  }

  // ---------- the shareable front page ----------
  function paperData() {
    const calls = S.log.map(function (l) { const s = CASES()[l.id]; return { t: s.title, how: l.appr + (l.k && s.kind !== "accuse" ? " (" + first(l.k) + ")" : ""), r: { win: "Closed", mixed: "Partial", loss: "Failed" }[l.res] }; });
    if (S.call && S.day === 1) calls.push({ t: "The call from No.10", how: (S.call.choice === "deny" ? "Denied " : "Stood by ") + first(S.call.k), r: S.call.choice === "deny" ? "Denied" : "Stood by" });
    const d = { grade: gradeOf(), calls: calls, mole: moleText(), caught: moleCaught(), day: S.day, side: S.heads.filter(function (h) { return h.indexOf("Bath") < 0; }).slice(-3) };
    if (S.day === 2) { const p = window.AH2.paperLead(); d.lead = p.lead; d.sub = p.sub; }
    else { d.lead = "MAN FIGHTS FOR LIFE AFTER BATH BENCH COLLAPSE"; d.sub = "Former foreign official found near the Circus \u00b7 Police cordon overnight \u00b7 Downing Street \u2018monitoring\u2019"; }
    return d;
  }
  function paper() {
    const d = paperData();
    chrome(true);
    render('<div class="frontpage" id="paper"><div class="mast">The London Evening Bugle</div><div class="dateline"><span>LATE FINAL</span><span>' + (d.day === 2 ? "Thursday" : "Wednesday") + "</span><span>Price 2p \u00b7 fiction</span></div>" +
      '<h1 class="lead">' + esc(d.lead) + '</h1><p class="subd">' + esc(d.sub) + "</p>" +
      '<div class="molebanner ' + (d.caught ? "caught" : "free") + '">' + esc(d.mole) + "</div>" +
      '<div class="cols"><div><h3>Spy chief\u2019s long day</h3><ul>' + d.calls.map(function (c) { return "<li><b>" + esc(c.t) + "</b> \u2014 " + esc(c.how) + " <i>" + esc(c.r) + "</i></li>"; }).join("") + '</ul></div><div class="gradebox"><small>Whitehall verdict</small><span>' + d.grade + "</span><small>Albion House</small></div></div>" +
      '<div class="also"><b>Also inside:</b> ' + d.side.map(esc).join(" \u00b7 ") + "</div></div>" +
      '<button class="btn primary" id="save">Save image</button><p class="saved" id="savedmsg"></p>' + (d.day === 1 && loadJSON(DAY2) ? '<button class="btn ghost" id="day2">Begin Day 2 \u00b7 Pale Hour</button>' : "") + '<button class="btn ghost" id="again">New game</button><a class="btn ghost" href="../index.html">Back to Ashline</a>', "Share your front page.");
    $("save").onclick = savePaper;
    $("again").onclick = function () { store.del(SAVE); difficulty(); };
    if ($("day2")) $("day2").onclick = function () { restore(loadJSON(DAY2)); save("briefing"); window.AH2.briefingIntro(); };
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
    x.font = "24px " + mono; x.textAlign = "left"; x.fillText("LATE FINAL", 64, 198); x.textAlign = "center"; x.fillText(d.day === 2 ? "THURSDAY" : "WEDNESDAY", W / 2, 198); x.textAlign = "right"; x.fillText("A WORK OF FICTION", W - 64, 198);
    x.textAlign = "left"; x.font = "bold 76px " + serif; let y = wrap(x, d.lead, 64, 310, W - 128, 84);
    x.font = "italic 32px " + serif; x.fillStyle = "#3b352b"; y = wrap(x, d.sub, 64, y + 10, W - 128, 42);
    // the mole banner: a solid strip so it reads at a glance
    x.fillStyle = d.caught ? "#1f3a2a" : "#7a1f1f"; x.fillRect(60, y + 4, W - 120, 64);
    x.fillStyle = "#efe6d2"; x.font = "bold 34px " + mono; x.textAlign = "center"; x.fillText(d.mole.toUpperCase().slice(0, 52), W / 2, y + 48); x.textAlign = "left";
    y += 130; x.fillStyle = "#1c1a16";
    x.font = "bold 40px " + serif; x.fillText("Spy chief\u2019s long day", 64, y); y += 54;
    d.calls.forEach(function (cl) { x.font = "bold 28px " + serif; x.fillText("\u25aa " + cl.t, 64, y); x.font = "26px " + mono; x.fillStyle = "#7a1f1f"; x.fillText(cl.r.toUpperCase(), 560, y); x.fillStyle = "#3b352b"; x.font = "italic 26px " + serif; y = wrap(x, cl.how, 92, y + 34, 560, 32) + 14; x.fillStyle = "#1c1a16"; });
    x.fillStyle = "#7a1f1f"; x.beginPath(); x.arc(880, 900, 120, 0, Math.PI * 2); x.fill();
    x.strokeStyle = "#c9a24a"; x.lineWidth = 6; x.beginPath(); x.arc(880, 900, 106, 0, Math.PI * 2); x.stroke();
    x.fillStyle = "#efe6d2"; x.textAlign = "center"; x.font = "bold 140px " + serif; x.fillText(d.grade, 880, 950);
    x.fillStyle = "#1c1a16"; x.font = "24px " + mono; x.fillText("WHITEHALL VERDICT", 880, 1055);
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

  // ---------- mute and a light tap on every button ----------
  function muteBtn() { const b = $("mute"); if (!b || !window.SFX) return; b.textContent = SFX.muted ? "\uD83D\uDD07" : "\uD83D\uDD0A"; b.setAttribute("aria-pressed", SFX.muted ? "true" : "false"); }
  if ($("mute")) $("mute").onclick = function () { if (window.SFX) { SFX.unlock(); SFX.setMuted(!SFX.muted); } muteBtn(); };
  muteBtn();
  document.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("button:not([disabled])")) FEEL.buzz("tap"); });

  // shared with day2.js
  window.AH = { D: D, $: $, esc: esc, pic: pic, rnd: function () { return rnd(); }, S: function () { return S; }, hh: hh, LH: LH, dueOf: dueOf, late: late, AG: AG, first: first,
    render: render, kite: kite, tip: tip, face: face, meters: meters, ticker: ticker, save: save, advance: advance, apply: apply, deltas: deltas, headline: headline,
    briefing: briefing, accuse: accuse, finishCase: finishCase, benchLine: benchLine, moleCaught: moleCaught, moleText: moleText, freeAgents: freeAgents, chrome: chrome };

  fresh(); title();
  window.__SPY__ = { state: function () { return S; }, fresh: function () { fresh(); title(); }, paperDataURL: function () { return drawPaper().toDataURL("image/png"); } };
})();
