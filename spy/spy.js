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
  // text size: Normal or Large, remembered; applied before the first screen draws
  const TEXTSIZE = "albion-textsize";
  function applyTextSize() { document.documentElement.classList.toggle("text-large", store.get(TEXTSIZE) === "large"); }
  function textSizeHTML() { const l = store.get(TEXTSIZE) === "large"; return '<div class="textsize" role="group" aria-label="Text size"><button type="button" data-ts="normal" aria-pressed="' + !l + '"' + (l ? "" : ' class="on"') + '>Normal text</button><button type="button" data-ts="large" aria-pressed="' + l + '"' + (l ? ' class="on"' : "") + ">Large text</button></div>"; }
  function bindTextSize(redraw) { document.querySelectorAll("[data-ts]").forEach(function (b) { b.onclick = function () { store.set(TEXTSIZE, b.getAttribute("data-ts")); applyTextSize(); redraw(); }; }); }
  const DAY1 = "albion-day1-start", SAVE = "albion-save-v1", DAY2 = "albion-day2-start", DAY3 = "albion-day3-start", TIPS_DONE = "albion-tips-done";
  const FAST = /[?&]fast=1/.test(location.search);
  const HRS = { low: 4, med: 3, high: 2 };
  const EXPIRE = 3; // hours after the deadline before a case is lost for good
  const PENALTY = { defector: { capital: -8, secrecy: -4 }, mole: { secrecy: -12 }, leak: { trust: -10, safety: -8 }, sabotage: { trust: -14, safety: -6 },
    courier: { secrecy: -6 }, safehouse: { safety: -8 }, mole2: { secrecy: -8 }, exit: { trust: -14, capital: -10 },
    bath: { secrecy: -6 }, york: { safety: -6 }, tail: { secrecy: -8 }, cable: { capital: -6 }, exfil: { trust: -12, capital: -10 } };
  const store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }, del: function (k) { try { localStorage.removeItem(k); } catch (e) {} } };
  let S;

  function fresh(diff, tips) {
    const keys = Object.keys(D.AGENTS);
    S = { day: 1, diff: diff || "standard", tips: tips !== false, tipSeen: {}, hour: 8,
      meters: { capital: 55, service: 58, mood: 55 }, order: ["leak", "defector", "mole"], done: {}, used: {}, stress: {}, loyal: {},
      roster: keys.slice(), lost: {}, pendingRecruit: 0, kit: Object.assign({}, D.DIFFICULTY[diff || "standard"].kit),
      heads: ["Rain over London as the Commons returns"], log: [], belief: null, flashShown: false, defector: false,
      mole: keys[Math.floor(rnd() * keys.length)], accused: null, call: null, porter: false, ended: false, screen: "briefing", chimed: false };
    if (window.__SPY_MOLE__) S.mole = window.__SPY_MOLE__;
    keys.forEach(function (k) { S.stress[k] = D.AGENTS[k].stress; S.loyal[k] = D.AGENTS[k].loyalty; });
  }
  function save(screen) { S.screen = screen; store.set(SAVE, JSON.stringify({ v: 1, seed: seed, S: S })); }
  // saves from before the cast change used the old officer ids; map them on load
  const OLD_IDS = { lena: "macrae", mira: "pryce", ren: "hartley", kite: "ash", nadia: "macrae", priya: "pryce", toby: "hartley" };
  function migrate(t) { return t ? t.replace(/"(lena|mira|ren|kite|nadia|priya|toby)"/g, function (m, k) { return '"' + OLD_IDS[k] + '"'; }).replace(/\b(Lena Novak|Mira Sol|Ren Okafor|Nadia Kowalczyk|Priya Lockwood|Tobias Adeyemi|Lena|Mira|Ren|Kite|Nadia|Priya|Toby)\b/g, function (m) { return OLD_NAMES[m]; }) : t; }
  const OLD_NAMES = { "Lena Novak": "Fiona Macrae", "Mira Sol": "Gareth Pryce", "Ren Okafor": "Tom Hartley", "Nadia Kowalczyk": "Fiona Macrae", "Priya Lockwood": "Gareth Pryce", "Tobias Adeyemi": "Tom Hartley", Lena: "Fiona", Mira: "Gareth", Ren: "Tom", Kite: "Ash", Nadia: "Fiona", Priya: "Gareth", Toby: "Tom" };
  function loadJSON(key) { try { const d = JSON.parse(migrate(store.get(key)) || "null"); return d && d.v === 1 && d.S ? d : null; } catch (e) { return null; } }
  function restore(d) { seed = d.seed; S = d.S; S.chimed = true; twoMeters(S); }
  // old saves had four gauges: secrecy and safety fold into Service, public trust becomes the hidden mood
  function twoMeters(st) { const m = st.meters; if (m && m.service == null) { m.service = Math.round(((m.safety || 55) + (m.secrecy || 55)) / 2); m.mood = m.trust == null ? 55 : m.trust; delete m.safety; delete m.secrecy; delete m.trust; } }
  const hh = function (h) { return (h < 10 ? "0" : "") + h + ":00"; };
  const CASES = function () { return S.day === 3 ? D.SITS3 : S.day === 2 ? D.SITS2 : D.SITS1; };
  const diff = function () { return D.DIFFICULTY[S.diff] || D.DIFFICULTY.standard; };
  const dueOf = function (id) { return CASES()[id].due + diff().due; };
  const AG = function (k) { return D.AGENTS[k] || D.RECRUITS[k]; };
  const first = function (k) { if (AG(k).short) return AG(k).short; const n = AG(k).name.split(" "); return n[0] === "Major" ? n[2] : n[0]; };
  function advance(h) { S.hour = Math.min(24, S.hour + h); if (window.SFX) SFX.tick(Math.min(6, h * 2)); }
  function late(id) { return Math.max(0, S.hour - dueOf(id)); }
  const clamp5 = function (v) { return Math.max(0, Math.min(5, v)); };

  // ---------- chrome ----------
  const score = function (v) { return Math.max(0, Math.min(100, Math.round(v == null ? 55 : v))); };
  function scores() { return "No.10 trust " + score(S.meters.capital) + "/100 \u00b7 Service " + svc() + "/100"; }
  function meters(changes) {
    ["capital", "service", "mood"].forEach(function (m) { if (S.meters[m] != null) S.meters[m] = score(S.meters[m]); });
    $("meters").innerHTML = D.METERS.map(function (m) {
      const v = m.id === "service" ? svc() : S.meters[m.id], d = changes && changes[m.id];
      return '<div class="meter' + (v < 35 ? " low" : "") + (m.id === "capital" ? " pm" : "") + '" aria-label="' + m.name + " " + v + ' out of 100"><div class="row"><span>' + (m.id === "capital" ? '<i class="lamp" style="opacity:' + (0.3 + v / 140).toFixed(2) + '" aria-hidden="true"></i>' : '<svg class="mgauge" viewBox="0 0 24 14" aria-hidden="true"><path d="M2 13a10 10 0 0 1 20 0" /><line x1="12" y1="13" x2="12" y2="4" transform="rotate(' + (-90 + v * 1.8) + ' 12 13)"/></svg>') + m.name + '</span></div><div class="mval"><b>' + v + "</b><small>/100</small>" + (d ? ' <span class="delta ' + (d > 0 ? "up" : "down") + '">' + (d > 0 ? "+" : "") + d + "</span>" : "") + '</div><div class="bar"><div class="fill" style="width:' + v + '%"></div></div></div>';
    }).join("");
    if (window.FUN) FUN.track(S);
    $("clock").textContent = hh(S.hour); LOOK.night(S.hour);
    const open = remaining().map(function (id) { return dueOf(id) - S.hour; });
    const soon = open.length ? Math.min.apply(null, open) : 99, box = $("clock").parentNode;
    box.classList.toggle("warn", soon <= 2 && soon >= 0); box.classList.toggle("late", soon < 0 || S.hour >= 21);
    box.querySelector("small").textContent = soon < 0 ? "Overdue" : soon <= 2 ? soon + "h left" : S.hour >= 21 ? "Late" : "Day " + S.day;
  }
  // Service = the stored field record plus how the officers feel (loyalty and strain fold in here)
  function svc() { const r = S.roster || []; const mor = r.reduce(function (a, k) { return a + ((S.loyal[k] == null ? 3 : S.loyal[k]) - 3) * 2 - Math.max(0, (S.stress[k] || 0) - 3) * 2; }, 0); return Math.max(0, Math.min(100, Math.round(S.meters.service + mor))); }
  function moodHead() { const m = S.meters.mood == null ? 55 : S.meters.mood; return m >= 65 ? "Poll: public warms to the government on security" : m >= 45 ? "Poll: voters shrug at Whitehall spy rows" : m >= 30 ? "Poll: public faith in the secret services slips" : "Poll: voters lose faith in Whitehall\u2019s spies"; }
  function ticker() { $("tk-run").innerHTML = S.heads.slice().reverse().concat([moodHead()]).map(function (h) { return "<b>\u25c6</b>" + esc(h); }).join(""); }
  function chrome(on) { ["hud", "ticker", "hintbar"].forEach(function (id) { $(id).classList.toggle("hidden", !on); }); document.body.classList.toggle("on-title", !on); }
  function render(html, h, keep) {
    LOOK.rain(false); if (!keep) LOOK.fade();
    const vw = $("view"), y = window.scrollY;
    vw.innerHTML = relabel(html);
    if (!keep && !FEEL.reduce) { vw.classList.remove("xf"); void vw.offsetWidth; vw.classList.add("xf"); }
    const mm = /data-music="(\w+)"/.exec(html);
    if (window.SFX) SFX.music(mm ? mm[1] : /data-screen="(officer-pick|approach)"|tailgame|class="card report|data-car=|data-pod|data-m=/.test(html) ? "tense" : "jazz");
    if (window.VOICE) VOICE.stop(); window.scrollTo(0, keep ? y : 0); $("hint").textContent = h || "";
    typeAll(); reveal(); LOOK.seals($("view"));
    document.querySelectorAll("[data-file]").forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); officerFile(b.getAttribute("data-file")); }; });
    document.querySelectorAll("[data-case-file]").forEach(function (b) { b.onclick = function () { caseFile(b.getAttribute("data-case-file")); }; });
    const od = $("dossier"); if (od) od.remove();
    document.querySelectorAll("[data-tipx]").forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); S.tipSeen[b.getAttribute("data-tipx")] = true; b.parentNode.remove(); save(S.screen); }; });
  }
  // the stamp reveal: half a second of silence, then the stamp lands with a thud and a heavy buzz
  function reveal() {
    const v = $("view"), st = v.querySelector(".stamp.thud"), card = v.querySelector(".card.outcome");
    if (!st) return;
    if (!card || FAST || window.__SPY_FAST__) { FEEL.thud(v); if (window.SFX && SFX.stamp) SFX.stamp(); return; }
    card.classList.add("hold"); if (window.SFX && SFX.duck) SFX.duck(0.9);
    setTimeout(function () { card.classList.remove("hold"); card.classList.add("landing"); FEEL.thud(v); FEEL.buzz("heavy"); if (window.SFX && SFX.stamp) SFX.stamp(); }, 500);
    if (window.REVIEW && card.classList.contains("win")) REVIEW.happyMoment("win");
  }
  // chips written in the old four-gauge words read as the two meters
  function relabel(h) {
    return String(h).replace(/([+\u2212-])(\d+) (Officer safety|Secrecy)/g, function (m, sg, n) { return sg + Math.max(1, Math.round(n * 0.7)) + " Service"; })
      .replace(/([+\u2212-])\d+ Public trust/g, function (m, sg) { return sg === "+" ? "Public mood up" : "Public mood down"; });
  }
  function ash(text, worried) {
    return '<div class="ash-note card"><img class="portrait" src="' + pic(worried ? "ash-worried" : "ash") + '" alt="Margaret Ashby, Chief of Staff"><div class="note"><div class="who">Ash \u00b7 Chief of Staff</div><span class="tx">' + text + "</span></div></div>";
  }
  // a first-run tip card; gone once dismissed, and switched off after Day 1
  function tip(key) { return S.day > 1 && S.tips && PREFS.get("tips") && !S.tipSeen[key] ? '<div class="tip" data-tip="' + key + '"><b>Tip</b><span>' + D.TIPS[key] + '</span><button class="tipx" data-tipx="' + key + '">Got it</button></div>' : ""; }
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

  // typewriter effect for Ash's notes and telegrams; tap to finish. Off with reduced motion.
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

  // ---------- title, day select, difficulty, intro ----------
  function title() {
    chrome(false);
    const saved = loadJSON(SAVE), day2 = loadJSON(DAY2);
    render(LOOK.living() + '<div class="title"><div>' + D.EMBLEM + '<h1>Albion House</h1><div class="sub">British Secret Intelligence</div><div class="flagband" aria-hidden="true"></div></div>' +
      '<div><p class="tag">London. Rain on the river, Big Ben striking eight. Four problems before midnight.</p>' +
      (saved ? '<button class="btn primary" id="continue">Continue \u00b7 Day ' + (saved.S.day || 1) + " \u00b7 " + hh(saved.S.hour) + (saved.S.ended ? " \u00b7 day over" : "") + "</button>" : "") +
      '<button class="btn ' + (saved ? "ghost" : "primary") + '" id="go">' + (saved ? "New game" : "Take the chair") + "</button>" +
      (day2 ? '<button class="btn ghost" id="days">Choose a day</button>' : "") +
      '<div class="cinerow"><button class="btn ghost" id="opening">\u25b6 Watch the opening</button><button class="btn ghost" id="cinema">Settings</button></div><button class="linkbtn" id="helpbtn">Help &amp; FAQ</button>' +
      '<div class="fine">A work of fiction. Albion House and every state, firm and person in it are invented.</div></div></div>');
    LOOK.place(); LOOK.rain(true); LOOK.night(8);
    $("go").onclick = saved ? function () { MENU.confirm("Start a new game?", "Your saved game (Day " + (saved.S.day || 1) + ") will be replaced.", "Start again", difficulty); } : difficulty;
    $("helpbtn").onclick = function () { MENU.help(); };
    if (saved) $("continue").onclick = function () { restore(saved); resume(); };
    if (day2) $("days").onclick = daySelect;
    $("opening").onclick = function () { CINE.play("open", title); };
    $("cinema").onclick = function () { MENU.settings(); };
  }
  // Restart day: back to 08:00 of the day you are on, from the snapshot taken when it began
  function restartDay() {
    const d = S.day, snap = loadJSON(d === 3 ? DAY3 : d === 2 ? DAY2 : DAY1);
    if (!snap) { fresh(S.diff); } else restore(snap);
    S.seenIntro = true; save("briefing"); chrome(true); meters(); ticker(); briefing();
  }
  function resume() { chrome(true); meters(); ticker(); S.screen === "summary" ? summary() : briefing(); }
  function daySelect() {
    const day2 = loadJSON(DAY2), day3 = loadJSON(DAY3);
    render('<div class="card dossier">' + LH + '<div class="kicker" style="margin-top:8px">Case files</div><h2>Choose a day</h2>' +
      '<button class="card dossier sit" id="d1"><span class="num">1</span><span><div class="t">The Long Day</div><div class="s">A defector, a mole, a leak, a cable. Ends in Bath.</div></span><span class="dl">NEW</span></button>' +
      '<button class="card dossier sit" id="d2"' + (day2 ? "" : " disabled") + '><span class="num">2</span><span><div class="t">Pale Hour</div><div class="s">' + (day2 ? "Hunt the Bath team before they leave Britain." : "Finish Day 1 first.") + '</div></span><span class="dl">' + (day2 ? "OPEN" : "LOCKED") + "</span></button>" +
      '<button class="card dossier sit" id="d3"' + (day3 ? "" : " disabled") + '><span class="num">3</span><span><div class="t">The Green Coat</div><div class="s">' + (day3 ? "Bring the woman in green home before midnight." : "Finish Day 2 first.") + '</div></span><span class="dl">' + (day3 ? "OPEN" : "LOCKED") + "</span></button>" +
      '<button class="btn ghost" id="back">Back</button></div>');
    $("d1").onclick = difficulty;
    if (day3) $("d3").onclick = function () { restore(day3); save("briefing"); chrome(true); meters(); ticker(); window.AH3.briefingIntro(); };
    if (day2) $("d2").onclick = function () { restore(day2); save("briefing"); chrome(true); meters(); ticker(); window.AH2.briefingIntro(); };
    $("back").onclick = title;
  }
  function difficulty() {
    let pick = "standard", tips = !store.get(TIPS_DONE);
    const draw = function () {
      render('<div class="card dossier">' + LH + '<div class="kicker" style="margin-top:8px">Before you take the chair</div><h2>How hard a day?</h2>' +
        Object.keys(D.DIFFICULTY).map(function (k) { const d = D.DIFFICULTY[k]; return '<button class="card appr' + (pick === k ? " sel" : "") + '" data-d="' + k + '"><div class="t">' + d.name + '</div><p style="margin:0">' + d.txt + "</p></button>"; }).join("") +
        '<label class="tipsopt"><input type="checkbox" id="tips"' + (tips ? " checked" : "") + "> Show tips on the first day</label>" + '<div class="kicker" style="margin-top:12px">Text size</div>' + textSizeHTML() + "</div>" +
        '<div class="sticky-go"><button class="btn primary" id="go">Begin \u00b7 ' + D.DIFFICULTY[pick].name + '</button></div><button class="btn ghost" id="back">Back</button>', "You can change this next time you start a new game.");
      document.querySelectorAll("[data-d]").forEach(function (b) { b.onclick = function () { pick = b.getAttribute("data-d"); draw(); }; });
      $("tips").onchange = function () { tips = $("tips").checked; };
      bindTextSize(draw);
      $("go").onclick = function () { store.del(SAVE); store.del(DAY2); store.del(DAY3); fresh(pick, tips); store.set(DAY1, JSON.stringify({ v: 1, seed: seed, S: S })); if (!CINE.maybe("day1", intro)) intro(); };
      $("back").onclick = title;
    };
    draw();
  }
  function intro() {
    chrome(false);
    render('<figure class="no10" id="no10"><img src="' + pic("no10") + '" alt="The Prime Minister hands C a file in a study at Number 10, a Union Flag by the window"><figcaption>10 Downing Street \u00b7 the study, 07:10</figcaption></figure>' +
      '<div class="card dossier">' + LH + '<span class="stamp corner">SECRET</span><div class="kicker">Personal file \u00b7 For C only</div><h2 style="margin-top:10px">You are \u2018C\u2019.</h2>' +
      '<p>You run <strong>Albion House</strong>, Britain\u2019s invented foreign intelligence service. You answer to the Prime Minister, <strong>Eleanor Hale</strong>.</p>' +
      '<p>\u201cKeep Britain safe, C. And keep it out of the papers.\u201d</p>' +
      '<p>Three officers. Cases until midnight. <strong>One of your officers is working for the other side.</strong></p>' +
      '<button class="linkbtn" id="more">Read the full file</button>' +
      '<button class="btn primary" id="go">Read the morning brief</button></div>');
    $("go").onclick = function () { chrome(true); meters(); ticker(); briefing(); };
    $("more").onclick = function () { dossier({ tab: "PERSONAL FILE", stamp: "SECRET", kicker: "For C only", title: "You are \u2018C\u2019", img: pic("no10"), body: INTRO_FULL }); };
  }
  const INTRO_FULL = '<p>You are the Chief of <strong>Albion House</strong>, Britain\u2019s foreign intelligence service: the people who run Britain\u2019s spies abroad. (It\u2019s invented, but you\u2019ll know the type.) Your office looks across the Thames at Westminster. You answer to the Prime Minister, <strong>Eleanor Hale</strong>, at Number 10, and to nobody else.</p>' +      '<p>She has just handed you the morning file in her study. \u201cKeep Britain safe, C. And keep it out of the papers.\u201d</p>' +      '<p>Your Chief of Staff, <strong>Margaret \u201cAsh\u201d Ashby</strong>, runs the building. You have <strong>three officers</strong>, and <strong>one of them is working for the other side</strong>. Watch for small slips.</p>' +      '<p>The day runs from 08:00 to midnight. Careful plans take longer, bold ones are quick. Every case has a deadline, and it gets harder the longer you leave it. Watch two gauges: <b>No.10 trust</b>, which opens the bold plans, and <b>Service</b>, your officers\u2019 safety, loyalty and cover, which makes every plan likelier. The public\u2019s mood shows in the papers.</p>';

  // ---------- the brief: the hub of each day ----------
  function remaining() { return S.order.filter(function (id) { return !S.done[id]; }); }
  function freeAgents() { return S.roster.filter(function (k) { return !S.used[k]; }); }
  const needsOfficer = function (id) { return CASES()[id].kind === "officer" || CASES()[id].kind === "judge"; };

  // cases left too long are lost
  function expire() {
    const gone = [];
    remaining().forEach(function (id) {
      if (late(id) >= EXPIRE) { S.done[id] = "loss"; apply(PENALTY[id] || CASES()[id].pen); S.heads.push(CASES()[id].head.loss); S.log.push({ id: id, k: null, res: "loss", appr: "Expired at " + hh(dueOf(id) + EXPIRE) }); gone.push(id); }
    });
    return gone;
  }
  // the day is over when nothing is left that you can still act on
  function stuck() { return remaining().every(function (id) { return needsOfficer(id) && !freeAgents().length; }); }

  function briefing() {
    if (window.MINI) MINI.inject(S);
    if (S.hour >= 24) return summary();
    const gone = expire();
    if (!remaining().length) return summary();
    if (S.day === 1 && S.log.filter(function (l) { return l.k; }).length >= 2 && !S.call) return phone();
    if (S.pendingRecruit > 0) return recruit();
    if (window.DESK.interrupt()) return;
    if (window.CRUNCH && CRUNCH.interrupt()) return;
    if (S.day >= 2 && window.AH3.interrupt()) return;
    if (stuck()) return summary();
    meters(); ticker(); save("briefing");
    if (!S.chimed) { S.chimed = true; if (window.SFX) SFX.chime(S.hour); }
    const line = S.day === 3 ? window.AH3.line(gone) : S.day === 2 ? window.AH2.line(gone) : day1Line(gone);
    let list = "", n = 0, warnTxt = "";
    S.order.forEach(function (id) {
      const s = CASES()[id], done = S.done[id], lt = late(id), due = dueOf(id), left = due - S.hour; n++;
      if (!done && left >= 0 && left <= 2 && !warnTxt) warnTxt = s.title + " is due by " + hh(due) + ": " + left + " hour" + (left === 1 ? "" : "s") + " left.";
      if (!done && lt > 0 && !warnTxt) warnTxt = s.title + " is overdue. Odds are dropping; it\u2019s lost at " + hh(due + EXPIRE) + ".";
      const lockT = S.day === 1 && !done && S.order.slice(0, S.order.indexOf(id)).some(function (x) { return !S.done[x]; });
      const off = (!done && needsOfficer(id) && !freeAgents().length) || lockT;
      const sub = s.kind === "mini" ? " \u00b7 hands-on \u00b7 no officer" : s.kind === "accuse" || s.kind === "interro" || s.kind === "mole2" || s.kind === "tail" || s.kind === "cable" ? " \u00b7 no officer needed" : s.kind === "exfil" ? " \u00b7 needs a driver" : "";
      list += '<button class="card dossier sit tile' + (lockT ? " locked" : "") + (done ? " done" : "") + (s.flash && !done ? " flash" : "") + '" data-sit="' + id + '"' + (done || off ? " disabled" : "") + '>' + (HEADS[id] ? '<span class="sithead" style="background-image:url(img/h-' + HEADS[id] + '.jpg)"></span>' : "") + '<span class="num">' + ["I", "II", "III", "IV", "V", "VI", "VII"][n - 1] + '</span><span><div class="t">' + esc(S.day === 2 ? window.AH2.titleOf(id) : s.title) + '</div><div class="s">' + esc(s.where) + (lockT ? " \u00b7 after lesson " + (n - 1) : done ? "" : sub) + '</div></span><span class="dl' + (lt > 0 && !done ? " over" : left <= 2 && !done ? " soon" : "") + '">' +
        (done ? (done === "win" ? "CLOSED" : done === "mixed" ? "PARTIAL" : "FAILED") : lt > 0 ? "LATE " + lt + "h" : "by " + hh(due)) + "</span></button>";
    });
    render('<div data-screen="brief"></div><div class="lh paper">HIS MAJESTY\u2019S GOVERNMENT \u00b7 TOP SECRET \u00b7 UK EYES ONLY</div>' + (window.HUB ? HUB.html() : "") + '<div class="kicker">' + (S.day === 3 ? "Day 3 \u00b7 The Green Coat" : S.day === 2 ? "Day 2 \u00b7 Pale Hour" : "Morning brief for C") + " \u00b7 Albion House</div>" + ash(line.text, line.worried) + tip("briefing") + (S.day === 3 ? window.AH3.followStrip() : "") + list +
      (S.day === 2 ? window.AH2.boardButton() : "") + '<button class="linkbtn" id="endday">Call it a day</button>', warnTxt || "Tap a file to deal with it.");
    document.querySelectorAll("[data-sit]").forEach(function (b) { b.onclick = function () { openCase(b.getAttribute("data-sit")); }; });
    if (S.day === 2) window.AH2.bindBoardButton();
    LOOK.rain(true);
    if (window.HUB) HUB.bind();
    if (window.FUN) FUN.promo();
    MENU.coach("menu", "Tap \u2630 any time to pause, change settings or return to the title. The game saves itself.");
    $("endday").onclick = function () { S.hour = 24; summary(); };
  }
  // painted header for each case file
  const HEADS = { defector: "vienna", mole: "mole", leak: "fleet", sabotage: "rig", courier: "airport", safehouse: "bristol", mole2: "mole", exit: "harwich", bath: "bath", york: "york", tail: "fleet", cable: "cabletap", exfil: "signal", cipher: "signal", spot: "bristol", lie: "york" };
  function chead(id) { return HEADS[id] ? '<button type="button" class="chead big" data-case-file="' + id + '" aria-label="Open the case file"><img src="img/h-' + HEADS[id] + '.jpg" alt=""><span class="zoomhint">Open the file</span></button>' : ""; }

  // ---------- files and dossiers: their own full-screen paper folder, picture large, tap to zoom ----------
  function dossier(o) {
    const old = $("dossier"); if (old) old.remove();
    const d = document.createElement("div"); d.id = "dossier"; d.className = "dossier-screen"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-label", o.title);
    d.innerHTML = '<div class="folder" data-screen="dossier"><div class="ftab">' + esc(o.tab || "FILE") + '</div><div class="fpaper">' + LH + '<span class="stamp corner">' + esc(o.stamp || "SECRET") + '</span><div class="kicker dk">' + esc(o.kicker || "") + '</div><h2>' + esc(o.title) + '</h2>' +
      (o.img ? '<button type="button" class="fpic" id="fpic" aria-label="Zoom the picture"><img src="' + o.img + '" alt="' + esc(o.alt || o.title) + '"><span class="zoomhint">Tap to zoom</span></button>' : "") + '<div class="fbody">' + o.body + '</div></div></div><div class="fclose"><button class="btn primary" id="fclose">Close the file</button></div>';
    document.body.appendChild(d); requestAnimationFrame(function () { d.classList.add("in"); });
    const pic0 = $("fpic"); if (pic0) pic0.onclick = function () { d.classList.toggle("zoomed"); };
    $("fclose").onclick = function () { d.remove(); };
    if (window.VOICE && o.voice) VOICE.play(o.voice);
  }
  function caseFile(id) {
    const s = CASES()[id];
    dossier({ tab: "CASE FILE", stamp: "CONFIDENTIAL", kicker: s.where + " \u00b7 due by " + hh(dueOf(id)), title: s.title, img: "img/h-" + HEADS[id] + ".jpg", alt: "Painting of " + s.where, body: "<p>" + esc(s.brief || "") + "</p>" });
  }
  function officerFile(k) {
    const a = AG(k), st = S.stress[k], v = vetOf(k);
    dossier({ tab: "PERSONNEL", stamp: "STAFF IN CONFIDENCE", kicker: a.role, title: a.name, img: pic(st >= 4 && a.tense ? a.tense : a.img), alt: "Portrait of " + a.name,
      body: '<p class="fstr">\u2605 ' + esc(strengthOf(k)) + " " + statusBadge(k) + "</p>" + badges(k) + '<p class="tlist">' + traitsOf(k).map(function (t) { return "<b>" + esc(t.n) + ":</b> " + esc(t.tx); }).join("<br>") + "</p>" + '<div class="traits">' + pips(a.skill, "", "Skill") + pips(S.loyal[k], "loyal" + (S.loyal[k] <= 2 ? " high" : ""), "Loyalty") + pips(st, "stress" + (st >= 4 ? " high" : ""), "Stress") + pips(a.cover, "", "Cover") + "</div>" +
        "<p><b>Morale:</b> " + morale(k) + (st >= 4 ? " \u00b7 <b>strained</b>, mistakes likelier" : "") + "</p><p><b>File note:</b> " + esc(a.note) + "</p>" + (a.look ? "<p><b>Usually wears:</b> " + esc(a.look) + "</p>" : "") +
        (window.FUN ? FUN.xpLine(k) : "") + "<p><b>Record:</b> " + (v ? v + " operation" + (v > 1 ? "s" : "") + " closed. Each one adds 4% to their odds (up to 12%)." : "No operations closed yet.") + "</p>" + (S.lost[k] ? "<p><b>Status:</b> " + esc(S.lost[k]) + "</p>" : "") });
  }
  // ---------- Day 1 is the tutorial: one lesson per case ----------
  const LESSONS = {
    leak: { n: 1, agent: "Each officer has <b>one strength</b>. Send the one marked \u2713 for this job. Tap <b>File</b> to see the rest.", approach: "Plans show their <b>odds</b> and how many <b>hours</b> they take. Your officer\u2019s favourite is starred." },
    defector: { n: 2, agent: "Officers come back tired. Whoever you send now can\u2019t go out again today, so think ahead.", approach: "<b>Careful</b> plans take longer but are safer. <b>Bold</b> ones are quick and can backfire. Watch the deadline." },
    mole: { n: 3, accuse: "One of your officers is the mole. Open each <b>File</b> and compare it with the clue. The porter\u2019s sighting helps too." },
    sabotage: { n: 4, judge: "Two reports disagree. Choose the one you believe. If you\u2019re wrong, the odds collapse.", agent: "Last lesson: <b>Service</b> is your officers\u2019 health and loyalty. A strong Service lifts every plan\u2019s odds." }
  };
  function lesson(id, step) {
    const L = S.day === 1 && LESSONS[id]; if (!L || !L[step]) return "";
    return '<div class="lesson"><b>Lesson ' + L.n + " of 4</b><span>" + L[step] + "</span></div>";
  }

  function openCase(id) {
    const kind = CASES()[id].kind;
    if (kind === "mini") return MINI.open(id);
    if (kind === "accuse") return accuse();
    if (kind === "judge" && !S.belief) return judgement();
    if (kind === "interro" || kind === "mole2") return window.AH2.open(id);
    if (kind === "tail" || kind === "cable" || kind === "exfil") return window.AH3.open(id);
    pickAgent(id);
  }
  function day1Line(gone) {
    const flash = S.order.indexOf("sabotage") >= 0 && !S.done.sabotage, fresh2 = flash && !S.flashShown;
    let text;
    if (!S.log.length) text = "Morning, C. Tea\u2019s on the desk. We\u2019ll take today one file at a time. Start with the leak: it\u2019s due by " + hh(dueOf("leak")) + ".";
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
      render('<div class="card dossier">' + LH + '<span class="stamp corner">PERSONNEL</span><div class="kicker" style="margin-top:8px">Personnel \u00b7 the reserve list</div><h2 style="padding-right:110px">We\u2019re a pair of hands short</h2><p>Lost so far: <b>' + esc(lostNames) + "</b>. Ash has three files from the reserve list. Hiring takes an hour.</p></div>" +
        '<div class="agents">' + pool.map(function (k) {
          const a = D.RECRUITS[k];
          return '<button class="card agent recruit' + (pick === k ? " sel" : "") + '" data-r="' + k + '"><img class="portrait" src="' + pic(a.img) + '" alt=""><div style="flex:1;min-width:0"><div class="nm">' + a.name + '</div><div class="role">' + a.role + '</div><div class="quirk">\u2605 ' + a.quirkTxt + '</div><div class="fnote">File note: ' + a.note + "</div></div></button>";
        }).join("") + "</div>" +
        '<div class="sticky-go"><button class="btn primary" id="go"' + (pick ? "" : " disabled") + ">" + (pick ? "Hire " + first(pick) : "Choose a recruit") + '</button></div><button class="btn ghost" id="skip">Manage without</button>', "Each recruit has a quirk. Choose the one that fits what\u2019s left.");
      document.querySelectorAll("[data-r]").forEach(function (b) { b.onclick = function () { pick = b.getAttribute("data-r"); $("go").onclick(); }; });
      $("go").onclick = function () {
        const a = D.RECRUITS[pick]; S.roster.push(pick); S.stress[pick] = a.stress; S.loyal[pick] = a.loyalty;
        S.pendingRecruit--; advance(1); S.heads.push("Whitehall job advert draws \u2018unusual\u2019 applicants"); FEEL.buzz("stamp"); briefing();
      };
      $("skip").onclick = function () { S.pendingRecruit = 0; briefing(); };
    };
    draw();
  }
  function rest(st) { const o = {}; Object.keys(st || {}).forEach(function (k) { if (st[k] === "wounded") o[k] = "tired"; else if (st[k] === "burned") o[k] = "burned"; }); return o; }
  function loseOfficer(k, why) { S.roster = S.roster.filter(function (x) { return x !== k; }); S.lost[k] = why; S.pendingRecruit++; }

  // ---------- Day 1: the cable judgement ----------
  function judgement() {
    let sel = null;
    const draw = function () {
      render('<div class="kicker">Your judgement \u00b7 the cable threat</div><h2>Two reports. One truth.</h2>' +
        ash("They can\u2019t both be right. Gareth\u2019s man has been good to us before. But he was paid twice this month, and not only by us. The intercept is thin, but it\u2019s their own voice.", true) + lesson("sabotage", "judge") +
        '<div class="reports">' + D.REPORTS.map(function (r, i) {
          return (i ? '<div class="vs">\u2014 OR \u2014</div>' : "") + '<button class="card report' + (r.alt ? " alt" : "") + (sel === r.id ? " sel" : "") + '" data-r="' + r.id + '"><div class="src"><span>' + r.src + '</span><span class="rel">' + r.grade + '</span></div><div class="q">' + r.q + '</div><div class="chips"><span class="chip">Defend ' + r.id + "</span></div></button>";
        }).join("") +
        '<div class="vs">\u2014 OR \u2014</div><button class="card report' + (sel === "split" ? " sel" : "") + '" data-r="split"><div class="src"><span>Hedge your bets</span><span class="rel">Thinner everywhere</span></div><div class="q">Split your people between both sites.</div><div class="chips"><span class="chip risk-med">Odds \u221212%</span><span class="chip risk-low">Can\u2019t be wholly wrong</span></div></button></div>' +
        '<div class="sticky-go"><button class="btn primary" id="go"' + (sel ? "" : " disabled") + ">" + (sel ? (sel === "split" ? "Cover both sites" : "Believe it \u2014 defend " + sel) : "Decide what to believe") + "</button></div>",
        "Pick the report you trust. Then send someone.");
      document.querySelectorAll("[data-r]").forEach(function (b) { b.onclick = function () { sel = b.getAttribute("data-r"); S.belief = sel; pickAgent("sabotage"); }; });
      $("go").onclick = function () { S.belief = sel; pickAgent("sabotage"); };
    };
    draw();
  }

  // ---------- odds and time ----------
  // the odds, with the reasons a player can see. The mole's quiet sabotage is folded into the base, unseen.
  function oddsParts(id, k, a, kitId) {
    const ag = AG(k), P = [], add = function (lab, v) { v = Math.round(v); if (v) P.push([lab, v]); };
    let base = 30 + ag.skill * 6 + a.mod + ag.cover * 2 + diff().odds + (S.day === 1 ? 6 : 0);
    if (k === S.mole && S.accused !== S.mole) base -= 10;
    if (ag.good.indexOf(id) >= 0) add("Right for the job", 12);
    traitsOf(k).forEach(function (t) { if (t.v && (t.all || (t.risk && t.risk === a.risk) || (t.cases && t.cases.indexOf(id) >= 0))) add(t.n, t.v); });
    const calm = traitsOf(k).some(function (t) { return t.calm; });
    add(S.stress[k] >= 4 ? "Strained" : "Tired", -S.stress[k] * (calm ? 2 : 4));
    add(S.loyal[k] > 3 ? "Loyal" : "Wavering", (S.loyal[k] - 3) * 3);
    add("Experience", Math.min(12, vetOf(k) * 4));
    add("Status: " + statusName(k), statusMod(k));
    if (kitId) add(D.KIT[kitId].name, D.KIT[kitId].odds || 0);
    const lt = late(id); if (lt > 0) add("Late", -(10 + lt * 5));
    if (S.day === 3) add("Day 3 file", window.AH3.oddsMod(id, k, a));
    add("Earlier choices", window.DESK.oddsMod(id));
    add("Service", (svc() - 50) / 4);
    if (window.OPS) OPS.parts(id, k, a, add);
    let o = base + P.reduce(function (t, p) { return t + p[1]; }, 0);
    if (id === "sabotage") { if (S.belief === "split") { add("Split teams", -12); o -= 12; } else if (S.belief !== D.TRUTH) { const cap = Math.min(o, 12); add("Wrong site", cap - o); o = cap; } }
    return { odds: Math.max(5, Math.min(92, Math.round(o))), base: Math.round(base), parts: P };
  }
  function traitsOf(k) { return window.FUN ? FUN.traits(k) : D.TRAITS[k] || []; }
  function oddsFor(id, k, a, kitId) { return oddsParts(id, k, a, kitId).odds; }
  function statusName(k) { const st = (S.status || {})[k]; return st ? { tired: "Tired", wounded: "Wounded", burned: "Burned" }[st] || "" : ""; }
  function statusMod(k) { const st = (S.status || {})[k]; return st === "tired" ? -8 : st === "wounded" ? -15 : 0; }
  // the officer's own pick: the approach they rate best. Choosing another overrules them.
  function recIdx(id, k) { let best = -1, bo = -1; CASES()[id].approaches.forEach(function (a, i) { if (lockOf(a)) return; const o = oddsFor(id, k, a, null); if (o > bo) { bo = o; best = i; } }); return best; }
  function lockOf(a) { if (a.needs && !(S.unlocked || {})[a.needs]) return "needs"; if (a.pm && S.meters.capital < a.pm) return "pm"; return ""; }
  const morale = function (k) { const l = S.loyal[k]; return l >= 5 ? "Loyal" : l >= 3 ? "Steady" : l >= 2 ? "Wavering" : "Bitter"; };
  function hoursFor(k, a, kitId) { return Math.max(1, HRS[a.risk] - (AG(k).quirk === "quick" ? 1 : 0) + (kitId ? D.KIT[kitId].hours || 0 : 0) + (window.OPS && OPS.hours ? OPS.hours() : 0)); }

  // one officer: face, name, one clear strength. The stat bars live in their file (tap File).
  function strengthOf(k) { const a = AG(k); return a.strength || a.quirkTxt || a.role; }
  function vetOf(k) { return (S.vet && S.vet[k]) || 0; }
  function agentCard(k, extra, sel, disabled, attr) {
    const a = AG(k), st = S.stress[k], v = vetOf(k);
    return '<div class="ocard"><button class="card agent slim' + (sel ? " sel" : "") + (disabled ? " used" : "") + '" ' + attr + '="' + k + '">' + face(k) + '<div style="flex:1;min-width:0"><div class="nm">' + esc(a.name) + (S.used[k] ? " \u00b7 in the field" : "") + (st >= 4 ? ' <span class="strain">Strained</span>' : "") + '</div><div class="str">\u2605 ' + esc(strengthOf(k)) + "</div>" + (v ? '<div class="vet">' + v + " operation" + (v > 1 ? "s" : "") + " closed \u00b7 +" + Math.min(12, v * 4) + "%</div>" : "") + (extra || "") + '</div></button><button type="button" class="filebtn" data-file="' + k + '" aria-label="Open ' + esc(a.name) + '\u2019s file">File</button></div>';
  }
  // trait badges: three per officer, at a glance
  function badges(k) { return '<div class="badges">' + traitsOf(k).map(function (t) { return '<span class="badge' + (t.v < 0 ? " neg" : "") + (t.grown ? " grown" : "") + '" title="' + esc(t.tx) + '">' + esc(t.n) + "</span>"; }).join("") + "</div>"; }
  function statusBadge(k) { const st = (S.status || {})[k]; return st ? '<span class="ostatus s-' + st + '">' + statusName(k).toUpperCase() + "</span>" : ""; }
  // the odds dial: a brass gauge, the needle at the odds, the reasons underneath
  function dial(r, label) {
    const v = r ? r.odds : 0, ang = -90 + v * 1.8;
    const reasons = r ? r.parts.slice().sort(function (x, y) { return Math.abs(y[1]) - Math.abs(x[1]); }).slice(0, 4).map(function (p) { return '<span class="' + (p[1] > 0 ? "up" : "down") + '">' + (p[1] > 0 ? "+" : "\u2212") + Math.abs(p[1]) + " " + esc(p[0]) + "</span>"; }).join("") : '<span class="mute">' + (label || "Drag an officer onto the case") + "</span>";
    return '<div class="dial" id="dial" aria-live="polite"><svg viewBox="0 0 120 70" aria-hidden="true"><path d="M10 62 A50 50 0 0 1 110 62" class="arc"/><path d="M10 62 A50 50 0 0 1 35 18.7" class="arc bad"/><path d="M85 18.7 A50 50 0 0 1 110 62" class="arc good"/><g class="needle" style="transform:rotate(' + ang + 'deg)"><line x1="60" y1="62" x2="60" y2="18"/></g><circle cx="60" cy="62" r="5" class="hub"/></svg>' +
      '<div class="dv"><b id="dialv">' + (r ? v + "%" : "\u2014") + '</b><small>odds of success</small></div><div class="reasons" id="dialr">' + reasons + "</div></div>";
  }
  function setDial(r, label) { const d = $("dial"); if (d) d.outerHTML = dial(r, label); }
  function bestFor(id, k) { const i = recIdx(id, k); return i < 0 ? null : oddsParts(id, k, CASES()[id].approaches[i], null); }
  function officerTile(k, id) {
    const a = AG(k), fit = id && a.good.indexOf(id) >= 0;
    return '<div class="otile' + (fit ? " fit" : "") + '" data-a="' + k + '" role="button" tabindex="0" aria-label="Send ' + esc(a.name) + '">' + statusBadge(k) + face(k) + '<div class="onm">' + esc(first(k)) + (a.code ? ' <small>\u2018' + esc(a.code) + "\u2019</small>" : "") + "</div>" + badges(k) +
      (fit ? '<div class="fit">\u2713 Right person</div>' : "") + '<button type="button" class="filebtn" data-file="' + k + '" aria-label="Open ' + esc(a.name) + '\u2019s file">File</button></div>';
  }
  // drag an officer's file onto the case (or just tap it). While a file is held over the case, the dial swings.
  function dragSend(id, onSend) {
    const zone = $("dropzone");
    document.querySelectorAll(".otile[data-a]").forEach(function (t) {
      const k = t.getAttribute("data-a");
      let st = null, ghost = null, over = false;
      const isOver = function (e) { const r = zone.getBoundingClientRect(); return e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom + 20; };
      t.addEventListener("pointerdown", function (e) { if (e.target.closest(".filebtn")) return; e.preventDefault(); st = [e.clientX, e.clientY]; setDial(bestFor(id, k)); try { t.setPointerCapture(e.pointerId); } catch (er) {} });
      t.addEventListener("pointermove", function (e) {
        if (!st) return; const dx = e.clientX - st[0], dy = e.clientY - st[1];
        if (!ghost && Math.hypot(dx, dy) > 10) { ghost = t.cloneNode(true); ghost.classList.add("ghost"); ghost.removeAttribute("data-a"); document.body.appendChild(ghost); t.classList.add("lifted"); if (window.SFX && SFX.paper) SFX.paper(); }
        if (ghost) { const r = t.getBoundingClientRect(); ghost.style.left = (r.left + dx) + "px"; ghost.style.top = (r.top + dy) + "px"; ghost.style.width = r.width + "px"; const o = isOver(e); if (o !== over) { over = o; zone.classList.toggle("hot", o); if (o) FEEL.buzz("tap"); } }
      });
      const end = function (e, cancel) {
        if (!st) return; const dragged = !!ghost, hit = dragged && !cancel && isOver(e); st = null;
        if (ghost) { ghost.remove(); ghost = null; } t.classList.remove("lifted"); zone.classList.remove("hot");
        if (cancel) return;
        if (!dragged || hit) { FEEL.buzz("drop"); if (window.SFX && SFX.paper) SFX.paper(); onSend(k); }
      };
      t.addEventListener("dragstart", function (e) { e.preventDefault(); });
      t.addEventListener("pointerup", function (e) { end(e, false); });
      t.addEventListener("pointercancel", function (e) { end(e, true); });
      t.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSend(k); } });
    });
  }
  // the operation: the case on top, the officers' files in a tray below
  function pickAgent(id) {
    const s = CASES()[id];
    const free = S.roster.filter(function (k) { return !S.used[k]; }).sort(function (x, y) { return (AG(y).good.indexOf(id) >= 0) - (AG(x).good.indexOf(id) >= 0); }).slice(0, 3);
    const lt = late(id);
    render('<div data-screen="officer-pick"><div class="casefile manila" id="dropzone"><span class="cftab">CASE ' + esc(String(id).toUpperCase().slice(0, 6)) + '</span><span class="cfstamp">SECRET</span>' + chead(id) + '<div class="casehead"><div class="kicker">' + esc(s.where) + " \u00b7 by " + hh(dueOf(id)) + (lt ? " \u00b7 " + lt + "h LATE" : "") + '</div><h2>' + esc(s.title) + '</h2><p class="brief">' + esc(s.brief) + (id === "sabotage" ? " <strong>You\u2019re defending: " + (S.belief === "split" ? "both sites" : S.belief) + ".</strong>" : "") + '</p><p class="redline">Source: <span class="redact">\u2588\u2588\u2588\u2588\u2588\u2588</span> \u00b7 Ref <span class="redact">\u2588\u2588\u2588\u2588</span> \u00b7 Seen by C only</p><div class="dropme">Drop a file here</div></div></div>' + lesson(id, "agent") +
      dial(null) + '<h3 class="question">Who do you send?</h3><div class="otray">' + free.map(function (k) { return officerTile(k, id); }).join("") + '</div><button class="linkbtn" id="back">Back to the desk</button></div>',
      "Drag a file onto the case, or tap it.");
    dragSend(id, function (k) { approach(id, k); });
    $("back").onclick = briefing;
    MENU.coach("traits", "Each officer has <b>three traits</b>. Press and hold a file to see the odds, then drag it onto the case.");
  }
  function approach(id, k) {
    const s = CASES()[id];
    let sel = recIdx(id, k), kit = null, kitOpen = false, drawn = false;
    if (window.OPS && OPS.reset) OPS.reset(id, k);
    if (sel < 0) sel = s.approaches.findIndex(function (a) { return !lockOf(a); });
    const draw = function () {
      const rec = recIdx(id, k);
      const opts = s.approaches.map(function (a, i) {
        const lk = lockOf(a), locked = !!lk;
        const h = hoursFor(k, a, kit), ends = Math.min(24, S.hour + h);
        return '<button class="card appr' + (sel === i ? " sel" : "") + (locked ? " locked" : "") + '" data-i="' + i + '"' + (locked ? " disabled" : "") + '><div class="t">' + (locked ? "\ud83d\udd12 " : "") + esc(a.t) + '</div><p style="margin:0">' + esc(a.d) + "</p>" +
          (lk === "pm" ? '<div class="chips"><span class="chip risk-high">Needs No.10 trust ' + a.pm + " (now " + S.meters.capital + "/100)</span></div>" : locked ? '<div class="chips"><span class="chip risk-high">Locked \u00b7 link the ' + (a.needs === "ferry" ? "ferry booking" : "hire-car receipt") + " on the evidence board</span></div>" :
            '<div class="chips"><span class="chip odds">' + oddsFor(id, k, a, kit) + '%</span><span class="chip time' + (ends > dueOf(id) ? " over" : "") + '">\u23f1 ' + h + "h</span>" + (a.pm ? '<span class="chip pmchip">No.10 signed off</span>' : "") + (i === rec ? '<span class="chip rec">\u2605 ' + first(k) + "\u2019s pick</span>" : sel === i ? '<span class="chip risk-high">Overrules ' + first(k) + "</span>" : "") + (S.day === 3 ? window.AH3.chips(id, k, a) : "") + "</div>") + "</button>";
      }).join("");
      const kits = Object.keys(D.KIT).map(function (key) {
        const n = S.kit[key] || 0, on = kit === key;
        return '<button class="kit' + (on ? " on" : "") + '" data-kit="' + key + '"' + (n ? "" : " disabled") + '><span class="ki">' + D.KIT[key].icon + '</span><span class="kn">' + D.KIT[key].name + '</span><span class="kt">' + D.KIT[key].txt + '</span><span class="ks">' + (on ? "Packed" : "\u00d7" + n) + "</span></button>";
      }).join("");
      const kitRow = S.day === 1 ? "" : '<button type="button" class="kittoggle" id="kitt" aria-expanded="' + kitOpen + '">\ud83e\uddf3 Kit: ' + (kit ? D.KIT[kit].name : "none packed") + ' <span>' + (kitOpen ? "Hide" : "Pack one") + "</span></button>" + (kitOpen ? '<div class="kits">' + kits + "</div>" : "");
      const a0 = s.approaches[sel];
      render('<div data-screen="approach"><div class="ash-note card slimnote">' + face(k) + '<div class="note"><div class="who">' + esc(AG(k).name) + " " + statusBadge(k) + '</div><span class="tx">' + (S.stress[k] >= 4 ? "I can do it, C. Just not the loud way. I\u2019m running on empty." : rec >= 0 ? "If it were me, I\u2019d go with \u2018" + esc(s.approaches[rec].t) + "\u2019." : "How do you want it played?") + "</span></div></div>" + lesson(id, "approach") +
        '<h3 class="question">How do they play it?</h3>' + opts + kitRow + (window.OPS ? OPS.controls(id, k, a0) : "") + dial(oddsParts(id, k, a0, kit)) +
        '<div class="sticky-go"><button class="btn primary sendbtn" id="go">Send ' + esc(first(k)) + " \u00b7 " + esc(a0.t) + '</button></div><button class="linkbtn" id="back">Send someone else</button></div>',
        "Pick a plan. The dial shows the odds, and why.", drawn); drawn = true;
      document.querySelectorAll("[data-i]").forEach(function (b) { b.onclick = function () { sel = +b.getAttribute("data-i"); draw(); }; });
      document.querySelectorAll("[data-kit]").forEach(function (b) { b.onclick = function () { const key = b.getAttribute("data-kit"); kit = kit === key ? null : key; draw(); }; });
      if ($("kitt")) $("kitt").onclick = function () { kitOpen = !kitOpen; draw(); };
      if (window.OPS) OPS.bind(draw);
      $("go").onclick = function () { (window.OPS ? OPS.run : resolve)(id, k, s.approaches[sel], kit); };
      $("back").onclick = function () { pickAgent(id); };
      MENU.coach("dial", "The <b>odds dial</b> shows your chance and the biggest reasons. Change the plan and watch it move.");
    };
    draw();
  }
  function fold(delta) {
    const o = {}, add = function (k, v) { if (v) o[k] = (o[k] || 0) + v; };
    Object.keys(delta || {}).forEach(function (m) { const v = delta[m];
      if (m === "capital") add("capital", v); else if (m === "service") add("service", v);
      else if (m === "safety" || m === "secrecy") add("service", v * 0.7); else if (m === "trust") { add("mood", v); add("capital", v * 0.3); } });
    Object.keys(o).forEach(function (k) { o[k] = Math.round(o[k]); if (!o[k]) delete o[k]; });
    return o;
  }
  function apply(delta) {
    const ch = {};
    const d2 = fold(delta);
    if (d2.service < 0) d2.service = Math.round(d2.service * 0.65); // setbacks bruise the Service; a run of them breaks it
    Object.keys(d2).forEach(function (m) { const before = S.meters[m] == null ? 55 : S.meters[m]; S.meters[m] = Math.max(0, Math.min(100, before + d2[m])); if (m !== "mood" && S.meters[m] !== before) ch[m] = S.meters[m] - before; });
    return ch;
  }
  // the painted vignette for an outcome: case-specific art on success, otherwise by result
  function vignette(id, res) { const art = CASES()[id].art; return '<div class="kbwrap"><img class="vignette" src="' + pic(art && res !== "loss" ? art : "v-" + res) + '" alt=""></div>'; }

  function resolve(id, k, a, kitId, op) {
    op = op || {};
    const s = CASES()[id], kitD = op.abort ? { soft: true } : kitId ? D.KIT[kitId] : {}, odds = Math.max(5, Math.min(95, oddsFor(id, k, a, kitId) + (op.mod || 0))), hrs = hoursFor(k, a, kitId), r = rnd() * 100;
    let res = r < odds * 0.7 ? "win" : r < odds ? "mixed" : "loss";
    if (op.abort) res = "loss";
    if (window.__SPY_FORCE__) res = window.__SPY_FORCE__;
    if (kitId) S.kit[kitId]--;
    const st0 = S.stress[k], lo0 = S.loyal[k], over = recIdx(id, k) !== s.approaches.indexOf(a), worked = st0 >= 4;
    S.styles = S.styles || { low: 0, med: 0, high: 0 }; S.styles[a.risk]++;
    const planStress = kitD.calm || (AG(k).quirk === "steady" && a.risk === "high") ? 0 : a.stress;
    S.stress[k] = clamp5(S.stress[k] + planStress + (res === "loss" && !kitD.soft ? 1 : res === "win" ? -1 : 0));
    S.loyal[k] = clamp5(S.loyal[k] + (res === "loss" ? -1 : res === "win" && a.risk === "low" ? 1 : 0) - (over ? 1 : 0) - (worked ? 1 : 0));
    let delta = a[res];
    if (res === "loss" && kitD.soft) { delta = {}; Object.keys(a.loss).forEach(function (m) { delta[m] = Math.round(a.loss[m] / 2); }); }
    // Good tradecraft keeps the Service healthy: the right officer on the plan they recommend steadies it, a mismatch drains it.
    const fitK = AG(k).good.indexOf(id) >= 0, recK = !over;
    const craft = res === "loss" ? (fitK ? 0 : -6) : (fitK ? 1 : -4) + (recK ? 2 : 0);
    delta = Object.assign({}, delta); delta.service = (delta.service || 0) + craft;
    const ch = apply(delta);
    S.done[id] = res; S.used[k] = true; advance(hrs);
    if (res === "win") { S.vet = S.vet || {}; S.vet[k] = (S.vet[k] || 0) + 1; }
    if (window.FUN) FUN.xp(k, res);
    let head = s.head[res], note = "";
    if (id === "sabotage") {
      if (S.belief === D.TRUTH) note = "You read it right: Bergen was bait.";
      else if (S.belief === "split") note = "Hedging thinned the Bergen team, but Rotterdam was covered.";
      else { note = "Bergen was bait. While we watched the north, Rotterdam went dark."; head = "Blackout at Rotterdam data hub; Bergen \u2018a decoy\u2019, say insiders"; }
    }
    if (S.day === 2) note = (note + " " + window.AH2.afterCase(id, res)).trim();
    if (S.day === 3) note = (note + " " + window.AH3.afterCase(id, res)).trim();
    // the mole's slip: a small wrong detail in their debrief
    const slip = k === S.mole && S.accused !== S.mole && D.AGENTS[k] ? D.AGENTS[k].slip : "";
    S.heads.push(head); S.log.push({ id: id, k: k, res: res, appr: a.t + (kitId ? " + " + kitD.name.toLowerCase() : ""), slip: !!slip });
    const nm = first(k);
    let line = { win: nm + " pulled it off. Clean. Nobody will ever know.", mixed: nm + " got it done, but not cleanly. There will be questions.", loss: "It went wrong. " + nm + " is out \u2014 just \u2014 and badly shaken." }[res];
    if (op.abort) line = "You pulled " + nm + " out before it closed in. The case is lost, but " + nm + " walked home.";
    // how the officer comes back: tired after a hard push, wounded after a loss, burned if a pushed loss went badly
    S.status = S.status || {}; const st1 = S.status[k];
    if (res === "loss" && op.push && r > 88) { S.status[k] = "burned"; loseOfficer(k, "cover burned"); line += " Worse: " + nm + "\u2019s face is known now. Their cover is burned for good."; }
    else if (res === "loss" && !op.abort) S.status[k] = "wounded";
    else if (op.push) S.status[k] = S.status[k] === "wounded" ? "wounded" : "tired";
    else if (res === "win" && S.status[k] === "tired") delete S.status[k];
    if (S.status[k] && S.status[k] !== st1 && S.status[k] !== "burned") line += " " + nm + " comes back " + statusName(k).toLowerCase() + ".";
    if (res === "loss" && S.stress[k] >= 5 && S.status[k] !== "burned") { loseOfficer(k, "sent home"); line += " The doctor has signed " + nm + " off. They won\u2019t be back this week."; }
    if (id === "defector" && res !== "loss") S.defector = true;
    if (S.day === 1 && S.order.indexOf("sabotage") < 0) S.order.push("sabotage");
    meters(ch); ticker(); save("briefing"); FEEL.buzz(res === "loss" ? "loss" : "win");
    const od = function (lab, a0, a1) { return a1 === a0 ? "" : '<span class="' + ((lab === "Stress") === (a1 > a0) ? "down" : "up") + '">' + lab + " " + a0 + "\u2192" + a1 + "</span>"; };
    render('<div class="card outcome ' + res + '"><span class="stamp thud">' + { win: "SUCCESS", mixed: "COMPROMISED", loss: "BLOWN" }[res] + "</span>" + vignette(id, res) + '<div class="ohead">' + face(k, res === "win" ? "happy" : res === "loss" ? "tense" : "") + "<h2>" + esc(s.title) + "</h2></div><p>" + esc(line) + (note ? " <strong>" + note + "</strong>" : "") + "</p>" +
      (slip ? '<p class="slip">From the debrief: <em>' + esc(slip) + "</em></p>" : "") + deltas(ch) +
      '<div class="deltas officer">' + od("Stress", st0, S.stress[k]) + od("Loyalty", lo0, S.loyal[k]) + (over ? '<span class="down">Overruled</span>' : "") + (op.push ? '<span class="down">Pushed</span>' : "") + (op.abort ? '<span class="up">Pulled out</span>' : "") + (worked ? '<span class="down">Overworked</span>' : "") + "</div>" + headline(head) + "</div>" +
      '<p class="oddsline">' + odds + "% odds \u00b7 took " + hrs + "h \u00b7 now " + hh(S.hour) + '</p><button class="btn primary" id="go">Back to the desk</button>',
      "The gauges moved. The papers noticed. " + nm + " will remember this.");
    $("go").onclick = briefing;
    if (window.FUN) FUN.event("case", { id: id, k: k, res: res });
    if (S.status && S.status[k] && S.status[k] !== "burned") MENU.coach("status", "Officers can come back <b>Tired</b> (\u22128%) or <b>Wounded</b> (\u221215%). It shows on their file and fades after a night\u2019s rest.");
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
      render('<div class="card dossier">' + chead(second ? "mole2" : "mole") + LH + '<span class="stamp corner">EYES ONLY</span><div class="kicker">Albion House \u00b7 by ' + hh(dueOf(id)) + '</div><h2 style="margin-top:8px;padding-right:110px">' + (second ? "The mole, second chance" : "Someone inside is talking") + "</h2><p>" + esc(second ? "Somebody rang the Bath team\u2019s phone from the street outside this building last night. The mole is still here. One more try before they run." : s.brief) + "</p>" +
        '<p class="clue"><b>What we know:</b> ' + esc(D.AGENTS[S.mole].clue) + (second ? " The porter, again: <b>" + esc(D.AGENTS[S.mole].look) + "</b>." : "") + "</p></div>" +
        ash("Look at their file notes. Think about the porter, and anything odd in the debriefs. If you name the wrong one, we lose a good officer and the real one goes quiet.", true) + lesson("mole", "accuse") +
        '<div class="kicker" style="margin:4px 0 8px">Who do you accuse? (takes 2 hours)</div><div class="agents">' + cards +
        '<button class="card appr' + (sel === "none" ? " sel" : "") + '" data-m="none"><div class="t">Not yet. Keep watching.</div><p style="margin:0">No accusation today. Safer for now, and the leak goes on.</p></button></div>' +
        '<div class="sticky-go"><button class="btn primary" id="go"' + (sel ? "" : " disabled") + ">" + (!sel ? "Choose someone" : sel === "none" ? "Keep watching" : "Accuse " + first(sel)) + '</button></div><button class="btn ghost" id="back">Back to the brief</button>',
        late(id) ? "Overdue. The longer we wait, the more they give away." : "Three clues: the file note, the porter, a slip in a debrief.");
      document.querySelectorAll("[data-m]").forEach(function (b) { b.onclick = function () { sel = b.getAttribute("data-m"); if (sel === "none") return accuseResolve(sel, id); MENU.confirm("Accuse " + first(sel) + "?", "It takes two hours. If you’re wrong, a loyal officer is hurt and the real mole goes quiet.", "Accuse " + first(sel), function () { accuseResolve(sel, id); }); }; });
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
      head = "Albion House officer quietly detained; Whitehall silent"; line = first(who) + " didn\u2019t argue. Just asked for a cigarette and a lawyer. The leaks stop tonight. <b>Ash will find you a replacement.</b>";
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
    const settle = function (sel, t) {
      let ch, head;
      if (sel === "deny") { ch = apply({ capital: 10, trust: 4, safety: -10 }); S.loyal[k] = clamp5(S.loyal[k] - 2); S.stress[k] = clamp5(S.stress[k] + 1); head = "No.10: \u2018no knowledge\u2019 of Briton in " + where + " photograph"; }
      else { ch = apply({ capital: -12, safety: 8 }); S.loyal[k] = clamp5(S.loyal[k] + 1); head = "PM refuses to discuss \u2018our people abroad\u2019; Varenians fume"; }
      S.call.choice = sel; S.heads.push(head); advance(1);
      window.DESK.after(sel === "deny" ? "DENIED" : "STOOD BY", sel === "deny" ? "mixed" : "win", "The call from No.10", (t ? "You hesitate. Hale decides for you. " : "") + (sel === "deny" ? "Hale thanks you, briskly. " + first(k) + " hears the statement on the radio in a hotel room in " + esc(where) + "." : "Hale is silent for a long moment. \u201cOn your head, C.\u201d " + first(k) + " is on the next flight home."), ch, head, k);
    };
    window.DESK.call({ id: "pm1", line: "NO.10 SWITCHBOARD \u00b7 SECURE LINE", img: "pm-phone", ring: "The Prime Minister for you, C.", who: "Eleanor Hale \u00b7 Prime Minister", say: "Tell her",
      text: "C. The Varenian ambassador is at the Foreign Office shouting about a British spy in " + esc(where) + ". The Courier has a photograph of <b>" + AG(k).name + "</b>. I can tell the House we\u2019ve never heard of them, or stand by them and take the heat. Your call.",
      opts: [{ k: "deny", t: "Deny them. Protect the government.", chips: '<span class="chip">+10 No.10 trust</span><span class="chip risk-high">\u221210 Officer safety</span><span class="chip risk-high">' + first(k) + " loyalty \u22122</span>" },
        { k: "stand", t: "Stand by them. Protect the officer.", chips: '<span class="chip risk-high">\u221212 No.10 trust</span><span class="chip risk-low">+8 Officer safety</span><span class="chip risk-low">' + first(k) + " loyalty +1</span>" }],
      def: "deny", answer: settle,
      miss: function () {
        S.call.choice = "deny"; S.call.missed = true; const ch = apply({ capital: -6, safety: -10 }); S.loyal[k] = clamp5(S.loyal[k] - 2);
        const head = "No.10 denies Briton in " + where + "; spy chief \u2018unavailable\u2019"; S.heads.push(head);
        window.DESK.after("MISSED", "loss", "No.10 rang", "Nobody picked up. Hale\u2019s office issues a denial anyway, and notes you didn\u2019t answer. " + first(k) + " hears it on the radio.", ch, head, k);
      } });
  }

  // ---------- end of day ----------
  function gradeOf() { const v = S.meters, avg = (score(v.capital) + svc()) / 2 + ((v.mood == null ? 55 : v.mood) - 55) / 10; return avg >= 68 ? "A" : avg >= 60 ? "B" : avg >= 50 ? "C" : avg >= 40 ? "D" : "E"; }
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
      : "A message on Ash\u2019s private line, unsigned: <b>\u201cYou left our clerk behind. Now you\u2019ll know how it feels.\u201d</b>";
    return '<div class="flash-card" id="flash"><div class="bar"><span class="stamp">FLASH \u00b7 MOST IMMEDIATE</span><span class="time">23:47 \u00b7 BATH</span></div><div class="tele">' +
      "<span class=\"hdr\">TO: C &nbsp;\u00b7&nbsp; FROM: ASHBY, ALBION HOUSE<br>HMG \u00b7 TOP SECRET \u00b7 UK EYES ONLY</span>C \u2014 Avon Police report a man collapsed on a bench near the Circus. He is <b>Pieter Vass</b>, a former Grey House officer we resettled here under a new name in 2019. Alive, unconscious. The government laboratory has identified a Varenian compound code-named <b>PALE HOUR</b>. No.10 wants you at Downing Street by seven.<br><br>" + moleLine() + "<br><br>" + extra + "<br><br>\u2014 Ash</div></div>";
  }
  function summary() {
    if (!S.ended && CINE.maybe({ 1: "bath", 2: "ferry", 3: "end3" }[S.day], summary)) return;
    if (!S.ended) {
      remaining().forEach(function (id) { S.done[id] = "loss"; apply(PENALTY[id] || CASES()[id].pen); S.heads.push(CASES()[id].head.loss); S.log.push({ id: id, k: null, res: "loss", appr: "Left on the desk" }); });
      S.hour = 24; S.ended = true;
      S.heads.push(S.day === 3 ? window.AH3.lastHead() : S.day === 1 ? "Police seal off Bath street; man taken ill" : S.done.exit === "win" ? "Harwich ferry delayed by police operation" : "Ferry leaves Harwich on time despite \u2018security alert\u2019");
      if (window.SFX) { SFX.chime(12); setTimeout(function () { SFX.tele(); }, 1500); }
      if (S.day === 1) { store.set(TIPS_DONE, "1"); store.set(DAY2, JSON.stringify({ v: 1, seed: seed, S: day2State() })); }
      if (S.day === 2) store.set(DAY3, JSON.stringify({ v: 1, seed: seed, S: day3State() }));
    }
    meters(); ticker(); save("summary");
    const grade = gradeOf();
    const verdict = { A: "The Prime Minister is pleased, which worries Ash.", B: "Solid work, C. A few cracks; nothing that shows.", C: "You held the line, just. No.10 would like a word.", D: "A rough day. Your officers noticed.", E: "A bad day. Fleet Street smells blood." }[grade];
    render('<div data-screen="summary" data-music="' + (/[DE]/.test(grade) ? "tense" : "jazz") + '"></div><div class="card dossier" style="text-align:center"><span class="stamp corner">TOP SECRET</span>' + LH + '<div class="kicker">Day ' + S.day + " \u00b7 From C to the Prime Minister \u00b7 10 Downing Street</div><div class=\"grade\">" + grade + '</div><p style="font-size:17px;color:var(--paper-ink)"><strong>' + verdict + "</strong></p>" +
      '<p class="scoreline" id="scoreline">' + scores() + "</p>" + (window.FUN ? FUN.medalHTML(S) : "") +
      '<ul class="log" style="text-align:left">' + S.log.map(function (l) {
        const s = CASES()[l.id];
        return "<li>" + (l.k ? '<img class="portrait" src="' + pic(AG(l.k).img) + '" alt="">' : '<span class="portrait dash">\u2014</span>') +
          "<span><b>" + esc(s.title) + '</b><br><span class="how">' + esc(l.appr) + (l.k && s.kind !== "accuse" ? " \u00b7 " + first(l.k) : "") + '</span></span><span class="r ' + l.res + '">' + { win: "CLOSED", mixed: "PARTIAL", loss: "FAILED" }[l.res] + "</span></li>";
      }).join("") + (S.call && S.day === 1 ? '<li><span class="portrait dash">\u260e</span><span><b>The call from No.10</b><br><span class="how">' + (S.call.choice === "deny" ? "Denied " : "Stood by ") + first(S.call.k) + "</span></span><span></span></li>" : "") + "</ul></div>" +
      (S.day === 1 ? day1Flash() : S.day === 3 ? window.AH3.flash() : window.AH2.flash()) +
      (S.day === 1 ? '<button class="btn primary" id="day2">Begin Day 2 \u00b7 Pale Hour</button>' : S.day === 2 ? '<button class="btn primary" id="day3">Begin Day 3 \u00b7 The Green Coat</button>' : "") +
      '<button class="btn ' + (S.day < 3 ? "ghost" : "primary") + '" id="paperbtn">Read tomorrow\u2019s front page</button><button class="btn ghost" id="again">New game</button>',
      S.day === 1 ? "To be continued. Day 2 starts at eight." : S.day === 2 ? "To be continued. Day 3 starts at eight." : "The end of the Green Coat. Day 4 is being written.");
    $("again").onclick = function () { store.del(SAVE); difficulty(); };
    $("paperbtn").onclick = function () { FEEL.tearThen($("flash"), paper); };
    if ($("day2")) $("day2").onclick = function () { FEEL.tearThen($("flash"), function () { restore(loadJSON(DAY2)); save("briefing"); window.AH2.briefingIntro(); }); };
    if ($("day3")) $("day3").onclick = function () { FEEL.tearThen($("flash"), function () { restore(loadJSON(DAY3)); save("briefing"); window.AH3.briefingIntro(); }); };
    S.finished = grade;
    if (window.FUN) FUN.event("day");
  }
  // Day 2 begins from the end of Day 1: same officers, meters and mole result; a fresh clock and kit
  function day2State() {
    const n = JSON.parse(JSON.stringify(S));
    n.days = { 1: { grade: gradeOf(), mole: moleText(), defector: S.defector, call: S.call, caught: moleCaught() } };
    n.day = 2; n.hour = 8; n.used = {}; n.status = rest(n.status); n.log = []; n.done = {}; n.ended = false; n.chimed = false; n.screen = "briefing"; n.tips = false;
    n.order = ["courier", "safehouse", "mole2", "exit"]; n.kit = Object.assign({}, diff().kit); n.belief = null; n.call = null;
    n.clues = { cctv: true, hire: true }; n.links = {}; n.unlocked = {}; n.interro = {}; n.seenIntro = false;
    n.heads = S.heads.slice(-2).concat(["Bath: police hunt three after bench collapse"]);
    n.roster.forEach(function (k) { n.stress[k] = clamp5(n.stress[k] - 1); }); // a night's sleep
    { const tired = n.roster.filter(function (k) { return n.stress[k] >= 4; }).length; n.meters.service = Math.max(0, Math.min(100, n.meters.service + (tired ? -3 * tired : 6))); } // rested officers steady the Service overnight
    return n;
  }

  // Day 3 begins from the end of Day 2, carrying the flags forward
  function day3State() {
    const n = JSON.parse(JSON.stringify(S));
    n.days = n.days || {}; n.days[2] = { grade: gradeOf(), exit: S.done.exit || "loss", mole: moleText() };
    n.day = 3; n.hour = 8; n.used = {}; n.status = rest(n.status); n.log = []; n.done = {}; n.ended = false; n.chimed = false; n.screen = "briefing"; n.tips = false; n.finished = null;
    n.order = ["bath", "york", "tail", "cable", "exfil"]; n.kit = Object.assign({}, diff().kit); n.seenIntro = false; n.letters = {}; n.riskSeen = {}; n.deal = null;
    n.heads = S.heads.slice(-2).concat(["Mystery of the woman in green deepens"]);
    n.roster.forEach(function (k) { n.stress[k] = clamp5(n.stress[k] - 1); });
    { const tired = n.roster.filter(function (k) { return n.stress[k] >= 4; }).length; n.meters.service = Math.max(0, Math.min(100, n.meters.service + (tired ? -3 * tired : 6))); } // rested officers steady the Service overnight
    window.AH3.prep(n);
    return n;
  }

  // ---------- the shareable front page ----------
  function paperData() {
    const calls = S.log.map(function (l) { const s = CASES()[l.id]; return { t: s.title, how: l.appr + (l.k && s.kind !== "accuse" ? " (" + first(l.k) + ")" : ""), r: { win: "Closed", mixed: "Partial", loss: "Failed" }[l.res] }; });
    if (S.call && S.day === 1) calls.push({ t: "The call from No.10", how: (S.call.choice === "deny" ? "Denied " : "Stood by ") + first(S.call.k), r: S.call.choice === "deny" ? "Denied" : "Stood by" });
    const d = { grade: gradeOf(), calls: calls, mole: moleText(), caught: moleCaught(), day: S.day, side: S.heads.filter(function (h) { return h.indexOf("Bath") < 0; }).slice(-3) };
    if (S.day >= 2) { const p = S.day === 3 ? window.AH3.paperLead() : window.AH2.paperLead(); d.lead = p.lead; d.sub = p.sub; }
    else { d.lead = "MAN FIGHTS FOR LIFE AFTER BATH BENCH COLLAPSE"; d.sub = "Former foreign official found near the Circus \u00b7 Police cordon overnight \u00b7 Downing Street \u2018monitoring\u2019"; }
    return d;
  }
  // the radio bulletin read over the front page: one per day, one per ending
  function bulletinId() { if (S.day === 1) return "bulletin_day1"; if (S.day === 2) return S.done.exit === "win" ? "bulletin_day2_win" : "bulletin_day2_lose"; return "bulletin_end_" + ({ win: "win", mixed: "mixed" }[S.done.exfil] || "loss"); }
  function paper() {
    const d = paperData();
    chrome(true);
    setTimeout(function () { if (window.VOICE) VOICE.play(bulletinId()); }, 700);
    render('<div class="frontpage" id="paper"><div class="mast">The London Evening Bugle</div><div class="dateline"><span>LATE FINAL</span><span>' + (d.day === 3 ? "Friday" : d.day === 2 ? "Thursday" : "Wednesday") + "</span><span>Price 2p \u00b7 fiction</span></div>" +
      '<h1 class="lead">' + esc(d.lead) + '</h1><p class="subd">' + esc(d.sub) + "</p>" +
      '<div class="molebanner ' + (d.caught ? "caught" : "free") + '">' + esc(d.mole) + "</div>" +
      '<div class="cols"><div><h3>Spy chief\u2019s long day</h3><ul>' + d.calls.map(function (c) { return "<li><b>" + esc(c.t) + "</b> \u2014 " + esc(c.how) + " <i>" + esc(c.r) + "</i></li>"; }).join("") + '</ul></div><div class="gradebox"><small>Whitehall verdict</small><span>' + d.grade + "</span><small>Albion House</small></div></div>" +
      '<div class="also"><b>Also inside:</b> ' + d.side.map(esc).join(" \u00b7 ") + "</div></div>" +
      '<button class="btn primary" id="save">Save image</button><p class="saved" id="savedmsg"></p>' + (d.day === 1 && loadJSON(DAY2) ? '<button class="btn ghost" id="day2">Begin Day 2 \u00b7 Pale Hour</button>' : "") + '<button class="btn ghost" id="again">New game</button>', "Share your front page.");
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
    x.font = "24px " + mono; x.textAlign = "left"; x.fillText("LATE FINAL", 64, 198); x.textAlign = "center"; x.fillText(d.day === 3 ? "FRIDAY" : d.day === 2 ? "THURSDAY" : "WEDNESDAY", W / 2, 198); x.textAlign = "right"; x.fillText("A WORK OF FICTION", W - 64, 198);
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
    render: render, ash: ash, textSizeHTML: textSizeHTML, bindTextSize: bindTextSize, tip: tip, face: face, meters: meters, ticker: ticker, save: save, advance: advance, apply: apply, deltas: deltas, headline: headline,
    briefing: briefing, accuse: accuse, agentCard: agentCard, morale: morale, loseOfficer: loseOfficer, summary: summary, diff: diff, clamp5: clamp5, CASES: CASES, store: store, pips: pips, finishCase: finishCase, benchLine: benchLine, moleCaught: moleCaught, moleText: moleText, freeAgents: freeAgents, chrome: chrome, dossier: dossier, officerFile: officerFile, lesson: lesson, svc: svc, score: score, scores: scores, relabel: relabel, title: title, muteBtn: muteBtn, resumeScreen: resume, restartDay: restartDay, resolve: resolve, oddsFor: oddsFor, statusName: statusName, FAST: FAST };

  applyTextSize();
  fresh();
  if (/[?&]trailer=1/.test(location.search)) CINE.trailer();
  else if (!CINE.maybe("open", title, { gate: true })) title();
  window.__SPY__ = { state: function () { return S; }, fresh: function () { fresh(); title(); }, paperDataURL: function () { return drawPaper().toDataURL("image/png"); } };
})();
