/* Albion House: Spymaster — the core game and Day 1. Everything is fictional: the state, the agencies,
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
  // one tested text size for everyone; clear the old Normal/Large setting from earlier builds
  try { localStorage.removeItem("albion-textsize"); } catch (e) {}
  const DAY1 = "albion-day1-start", SAVE = "albion-save-v1", DAY2 = "albion-day2-start", DAY3 = "albion-day3-start", DAYK = { 1: DAY1, 2: DAY2, 3: DAY3, 4: "albion-day4-start", 5: "albion-day5-start", 6: "albion-day6-start" }, TIPS_DONE = "albion-tips-done";
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
  // Legacy save tokens only. Earlier casts used these ids and names inside albion-save-v1.
  // They are rewritten before the save is parsed, so they never reach the screen.
  // Storage keys stay albion-*; do not rename them.
  const OLD_IDS = { lena: "macrae", mira: "pryce", ren: "hartley", kite: "ash", nadia: "macrae", priya: "pryce", toby: "hartley" };
  function migrate(t) { return t ? t.replace(/"(lena|mira|ren|kite|nadia|priya|toby)"/g, function (m, k) { return '"' + OLD_IDS[k] + '"'; }).replace(/\b(Lena Novak|Mira Sol|Ren Okafor|Nadia Kowalczyk|Priya Lockwood|Tobias Adeyemi|Lena|Mira|Ren|Kite|Nadia|Priya|Toby)\b/g, function (m) { return OLD_NAMES[m]; }) : t; }
  const OLD_NAMES = { "Lena Novak": "Fiona Macrae", "Mira Sol": "Gareth Pryce", "Ren Okafor": "Tom Hartley", "Nadia Kowalczyk": "Fiona Macrae", "Priya Lockwood": "Gareth Pryce", "Tobias Adeyemi": "Tom Hartley", Lena: "Fiona", Mira: "Gareth", Ren: "Tom", Kite: "Ash", Nadia: "Fiona", Priya: "Gareth", Toby: "Tom" };
  function readJ(key) { try { return JSON.parse(store.get(key) || "null"); } catch (e) { return null; } }
  function loadJSON(key) { try { const d = JSON.parse(migrate(store.get(key)) || "null"); return d && d.v === 1 && d.S ? d : null; } catch (e) { return null; } }
  function restore(d) { seed = d.seed; S = d.S; S.chimed = true; twoMeters(S); }
  // old saves had four gauges: secrecy and safety fold into Service, public trust becomes the hidden mood
  function twoMeters(st) { const m = st.meters; if (m && m.service == null) { m.service = Math.round(((m.safety || 55) + (m.secrecy || 55)) / 2); m.mood = m.trust == null ? 55 : m.trust; delete m.safety; delete m.secrecy; delete m.trust; } }
  const hh = function (h) { h = h % 24; return (h < 10 ? "0" : "") + h + ":00"; };
  const CASES = function () { return S.day >= 4 ? window.AH4.cases(S.day) : S.day === 3 ? D.SITS3 : S.day === 2 ? D.SITS2 : D.SITS1; };
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
  // batch G: what the meters do at the ends. Service under 30: officers refuse high-risk plans until rested.
  // Service 80+: the first plan you send each day gets +5% ("the team's flying"). No.10 trust under 20 at the end
  // of Days 1-5: Hale rings at midnight, and next morning No.10 takes one side file off the desk (a lost case).
  const SVC_LOW = 30, SVC_HIGH = 80, NO10_LOW = 20;
  function svcLow() { return svc() < SVC_LOW; }
  function flyOn() { return svc() >= SVC_HIGH && S.flyDay !== S.day; }
  const REFUSE = "Not the loud way, C. We\u2019re running on empty. Rest us first.";
  // files No.10 may take, in order of preference: side cases only, never a day's story case
  const NO10_TAKE = { 2: ["safehouse", "courier"], 3: ["tail", "york"], 4: ["manchester", "watch"], 5: ["press", "recon"], 6: ["find"] };
  function no10Due() { return S.day <= 5 && score(S.meters.capital) < NO10_LOW; }
  function no10Flag(n) { if (no10Due()) n.no10 = { take: true, day: n.day }; else delete n.no10; return n; }
  function no10Take() {
    const t = S.no10; if (!t || !t.take || t.day !== S.day || t.took) return;
    const id = (NO10_TAKE[S.day] || []).filter(function (x) { return S.order.indexOf(x) >= 0 && !S.done[x]; })[0];
    if (!id) { t.took = "none"; return; }
    const c = CASES()[id]; t.took = id; S.done[id] = "loss";
    const head = c.head && c.head.loss; S.log.push({ id: id, k: null, res: "loss", appr: "Taken by No.10", head: head || "" }); if (head) S.heads.push(head);
  }
  function no10Took() { const t = S.no10; return t && t.day === S.day && t.took && t.took !== "none" ? t.took : null; }
  function no10Note() {
    const id = no10Took(); if (!id) return "";
    return '<div class="no10take" id="no10take"><span class="stamp">NO.10 IS HANDLING IT</span><p>At seven, a man from No.10 took <b>' + esc(S.day === 2 ? window.AH2.titleOf(id) : CASES()[id].title) + "</b> off your desk. It counts as a lost case. Win back her trust.</p></div>";
  }
  // midnight, at the end of a day with No.10 trust under 20: Hale's final warning, then the next day
  function no10Night(go) { if (!no10Due() || S.no10Called === S.day) return go(); S.no10Called = S.day; save("summary"); window.DESK.no10Warn(go); }
  function moodHead() { const m = S.meters.mood == null ? 55 : S.meters.mood; return m >= 65 ? "Poll: public warms to the government on security" : m >= 45 ? "Poll: voters shrug at Whitehall spy rows" : m >= 30 ? "Poll: public faith in the secret services slips" : "Poll: voters lose faith in Whitehall\u2019s spies"; }
  function ticker() { $("tk-run").innerHTML = S.heads.slice().reverse().concat([moodHead()]).map(function (h) { return "<b>\u25c6</b>" + esc(h); }).join(""); }
  function chrome(on) { ["hud", "ticker", "hintbar"].forEach(function (id) { $(id).classList.toggle("hidden", !on); }); document.body.classList.toggle("on-title", !on); }
  // Batch N: every result card shows how the top bar moved since you left the desk (the same numbers the bar shows)
  function markBar() { S.bar0 = { t: score(S.meters.capital), v: svc(), m: Math.round(S.meters.service) }; }
  // Batch O: the top-bar Service counts officer stress and loyalty as well as the Service meter, so when the two moved
  // differently the line says so (otherwise "+2 Service" beside "Service 62\u219262" looks like a mistake)
  const SVC_NOTE = " The top-bar Service includes officer stress and loyalty.";
  const LOW_ALERT = function (t) { return "No.10 trust has just dropped under 20 (now " + t + "). " + (S.day === 6 ? "Under 15 at the end of today means resigning." : "Under 15 at the end of Day 6 means resigning, and under 20 at midnight No.10 takes a file.") + " Each case you close wins back +3."; };
  function barText() {
    const b = S && S.bar0; if (!b) return "";
    const t1 = score(S.meters.capital), v1 = svc(), mood = b.m != null && (v1 - b.v) !== (Math.round(S.meters.service) - b.m);
    if (t1 === b.t && v1 === b.v) return "Top bar unchanged: No.10 trust " + t1 + " \u00b7 Service " + v1 + "." + (mood ? SVC_NOTE : "");
    return "Top bar since you left the desk: No.10 trust " + b.t + "\u2192" + t1 + " (" + sgn(t1 - b.t) + ") \u00b7 Service " + b.v + "\u2192" + v1 + " (" + sgn(v1 - b.v) + ")." + (mood ? SVC_NOTE : "");
  }
  // Batch O: VoiceOver / TalkBack hear the top-bar line when a result card opens (a polite live region, read after the stamp)
  function announce(tx) {
    let r = $("sr-live"); if (!r) { r = document.createElement("div"); r.id = "sr-live"; r.className = "sr-only"; r.setAttribute("role", "status"); r.setAttribute("aria-live", "polite"); document.body.appendChild(r); }
    r.textContent = ""; setTimeout(function () { r.textContent = tx; }, 250);
  }
  function barMark(vw) {
    const oc = vw.querySelector('.card.outcome:not([data-screen="no10warn"])'); if (!oc || oc.querySelector(".barline")) return;
    const tx = barText(); if (!tx) return;
    const pEl = document.createElement("p"); pEl.className = "barline"; pEl.textContent = tx;
    // Batch P: the Service note links to the Help entry that explains it
    if (tx.indexOf(SVC_NOTE.trim()) >= 0) { const hb = document.createElement("button"); hb.type = "button"; hb.className = "linkbtn svchelp"; hb.textContent = "How Service works"; hb.onclick = function (e) { e.stopPropagation(); MENU.help(null, "service"); }; pEl.appendChild(document.createTextNode(" ")); pEl.appendChild(hb); }
    const after = oc.querySelector(".opcall") || oc.querySelector(".no10back") || oc.querySelector(".deltas");
    if (after) after.insertAdjacentElement("afterend", pEl); else { const hd = oc.querySelector(".headline"); if (hd) oc.insertBefore(pEl, hd); else oc.appendChild(pEl); }
    // Batch P: the moment No.10 trust drops under 20 in Act 2, the result card says so (once a day), as an alert
    let alertTx = ""; const t1 = score(S.meters.capital);
    if (S.day >= 4 && S.bar0 && S.bar0.t >= NO10_LOW && t1 < NO10_LOW && S.lowAlerted !== S.day) { S.lowAlerted = S.day; alertTx = LOW_ALERT(t1); const al = document.createElement("p"); al.className = "lowalert"; al.setAttribute("role", "alert"); al.textContent = alertTx; pEl.insertAdjacentElement("beforebegin", al); }
    // Batch P: screen readers hear the stamp first (CLOSED, PARTIAL, FAILED...), then the top bar
    const st = oc.querySelector(".stamp"), stTx = st ? st.textContent.trim() : "";
    announce((stTx ? stTx.charAt(0) + stTx.slice(1).toLowerCase() + ". " : "") + tx + (alertTx ? " " + alertTx : ""));
  }
  function render(html, h, keep) {
    LOOK.rain(false); if (!keep) LOOK.fade();
    const vw = $("view"), y = vw.scrollTop;
    vw.innerHTML = relabel(html);
    barMark(vw);
    if (!keep && !FEEL.reduce) { vw.classList.remove("xf"); void vw.offsetWidth; vw.classList.add("xf"); }
    const mm = /data-music="(\w+)"/.exec(html);
    if (window.SFX && SFX.day) SFX.day(S && S.day ? S.day : 1);
    LOOK.day(S && S.day ? S.day : 1);
    if (window.SFX) SFX.music(mm ? mm[1] : /data-screen="(officer-pick|approach)"|tailgame|class="card report|data-car=|data-pod|data-m=/.test(html) ? "tense" : "jazz");
    vw.scrollTop = keep ? y : 0; window.scrollTo(0, 0); $("hint").textContent = h || ""; // a new screen no longer cuts off whoever is speaking; the line finishes
    typeAll(); reveal(); LOOK.seals($("view"));
    document.querySelectorAll("[data-file]").forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); officerFile(b.getAttribute("data-file")); }; });
    document.querySelectorAll("[data-case-file]").forEach(function (b) { b.onclick = function () { caseFile(b.getAttribute("data-case-file")); }; });
    const od = $("dossier"); if (od) od.remove();
    if ($("replay-ok")) $("replay-ok").onclick = function (e) { e.stopPropagation(); S.replayOf = null; const c = this.closest(".replaynote"); if (c) c.remove(); save(S.screen); };
    document.querySelectorAll("[data-tipx]").forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); S.tipSeen[b.getAttribute("data-tipx")] = true; b.parentNode.remove(); save(S.screen); }; });
  }
  // the stamp reveal: half a second of silence, then the stamp lands with a thud and a heavy buzz
  function reveal() {
    const v = $("view"), st = v.querySelector(".stamp.thud"), card = v.querySelector(".card.outcome");
    if (!st) return;
    if (!card || FAST || window.__SPY_FAST__) { FEEL.thud(v); if (window.SFX && SFX.stamp) SFX.stamp(); return; }
    card.classList.add("hold"); if (window.SFX && SFX.duck) SFX.duck(0.9);
    // half a beat of silence, then the big stamp slams down over the screen; the card's own stamp is there when it lifts
    setTimeout(function () { FEEL.slam(st.textContent, function () { card.classList.remove("hold"); card.classList.add("landing"); FEEL.thud(v); }); }, 400);
    // the star prompt now waits for the end of Act 1 (fun.js askReview)
  }
  // chips written in the old four-gauge words read as the two meters
  function svcShown(v) { let d = Math.round(v); if (d < 0) d = Math.round(d * 0.65); return d || (v > 0 ? 1 : -1); }
  function relabel(h) {
    // Batch N: old Secrecy/Officer safety numbers are shown as the Service change apply() really makes (x0.7, and setbacks x0.65)
    return String(h).replace(/([+\u2212-])(\d+) (Officer safety|Secrecy)/g, function (m, sg, n) { return sg + Math.abs(svcShown((sg === "+" ? 1 : -1) * n * 0.7)) + " Service"; })
      .replace(/([+\u2212-])\d+ Public trust/g, function (m, sg) { return sg === "+" ? "Public mood up" : "Public mood down"; });
  }
  function ash(text, worried) {
    return '<div class="ash-note card"><img class="portrait" src="' + pic(worried ? "ash-worried" : "ash") + '" alt="Margaret Ashby, Chief of Staff"><div class="note"><div class="who">Ash \u00b7 Chief of Staff</div><span class="tx">' + text + "</span></div></div>";
  }
  // a first-run tip card; gone once dismissed, and switched off after Day 1
  // Batch L: a tip card shows once per game. It stays while you are on the screen where it first appeared
  // (same day and hour), then never again in this game, whether or not you pressed Got it.
  function tipFresh(key) { const at = S.day + ":" + S.hour; S.tipSeen = S.tipSeen || {}; if (S.tipSeen[key] === true) return false; if (!S.tipSeen[key]) S.tipSeen[key] = at; return S.tipSeen[key] === at; }
  function tip(key) { return S.day > 1 && S.tips && PREFS.get("tips") && !S.replayFirst && tipFresh(key) ? '<div class="tip" data-tip="' + key + '"><b>Tip</b><span>' + D.TIPS[key] + '</span><button class="tipx" data-tipx="' + key + '">Got it</button></div>' : ""; }
  function pips(n, cls, label) { let s = ""; for (let i = 1; i <= 5; i++) s += '<i class="' + (i <= n ? "on" : "") + '"></i>'; return '<div class="tr ' + cls + '">' + label + '<div class="pips">' + s + "</div></div>"; }
  const mname = function (m) { return D.METERS.filter(function (x) { return x.id === m; })[0].name; };
  function deltas(ch) { return '<div class="deltas">' + Object.keys(ch).map(function (m) { return '<span class="' + (ch[m] >= 0 ? "up" : "down") + '">' + (ch[m] >= 0 ? "+" : "") + ch[m] + " " + mname(m) + "</span>"; }).join("") + "</div>"; }
  function headline(h) { return '<div class="headline"><small>The London Evening Bugle \u00b7 late edition</small><div>' + esc(h) + "</div></div>"; }
  // portrait follows the officer's state: strained when stress is high
  // how an officer looks today: fresh, tired, injured, or proud after a win. The painted face follows it.
  const CONDW = { fresh: "Fresh", tired: "Tired", injured: "Injured", proud: "Proud" };
  function condOf(k) {
    const st = (S.status || {})[k];
    if (st === "wounded" || st === "burned") return "injured";
    if (st === "tired" || S.stress[k] >= 4) return "tired";
    const mine = (S.log || []).filter(function (l) { return l.k === k; }), last = mine[mine.length - 1];
    return last && last.res === "win" ? "proud" : "fresh";
  }
  function faceSrc(k, c) { const a = AG(k), f = a.faces || {}; return pic(f[c] || ((c === "tired" || c === "injured") && a.tense) || (c === "proud" && a.happy) || a.img); }
  function face(k, mood) {
    const a = AG(k);
    if (mood === "happy") return '<img class="portrait c-proud" src="' + faceSrc(k, "proud") + '" alt="">';
    if (mood === "tense") return a.tense ? '<img class="portrait strained" src="' + pic(a.tense) + '" alt="">' : '<img class="portrait strained tint" src="' + pic(a.img) + '" alt="">';
    const c = condOf(k);
    return '<img class="portrait c-' + c + (c !== "fresh" && c !== "proud" && !(a.faces && a.faces[c]) && !a.tense ? " strained tint" : "") + '" src="' + faceSrc(k, c) + '" alt="">';
  }
  function condChip(k, cls) { const c = condOf(k); return '<span class="ocond c-' + c + (cls ? " " + cls : "") + '">' + CONDW[c] + "</span>"; }


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
    if (window.VOICE && VOICE.hush) VOICE.hush(); // a line from the game doesn't carry on over the title screen
    chrome(false);
    const saved = loadJSON(SAVE), day2 = loadJSON(DAY2);
    render(LOOK.living() + '<div class="title"><div>' + D.EMBLEM + '<h1>Albion House</h1><div class="sub">British Secret Service</div><div class="flagband" aria-hidden="true"></div></div>' +
      '<div><p class="tag">London. Rain on the river, Big Ben striking eight. Six days, one spymaster, and a lot of problems before midnight.</p>' +
      (saved ? '<button class="btn primary" id="continue">Continue \u00b7 Day ' + (saved.S.day || 1) + " \u00b7 " + hh(saved.S.hour) + (saved.S.ended ? " \u00b7 day over" : "") + "</button>" : "") +
      '<button class="btn ' + (saved ? "ghost" : "primary") + '" id="go">' + (saved ? "New game" : "Take the chair") + "</button>" +
      (window.FUN ? '<button class="btn primary" id="tach">\u2605 Achievements' + (FUN.count ? " \u00b7 " + FUN.count() + " of " + FUN.total : "") + "</button>" : "") +
      (window.REVIEW && REVIEW.played() ? '<button type="button" class="btn primary" id="trate">\u2b50 Rate this game</button>' : "") +
      '<div class="cinerow"><button class="btn ghost" id="opening">\u25b6 Watch the opening</button><button class="btn ghost" id="cinema">Settings</button></div>' + (window.REPLAY ? REPLAY.titleHTML() : "") + '<button class="linkbtn" id="helpbtn">Help &amp; FAQ</button>' +
      '<div class="fine">A work of fiction. Albion House and every state, firm and person in it are invented.</div></div></div>');
    LOOK.place(); LOOK.rain(true); LOOK.night(8); if (window.REPLAY) REPLAY.bindTitle();
    $("go").onclick = saved ? function () { MENU.confirm("Start a new game?", "Your saved game (Day " + (saved.S.day || 1) + ") will be replaced.", "Start again", coldOpen); } : coldOpen;
    $("helpbtn").onclick = function () { MENU.help(); };
    if (saved) $("continue").onclick = function () { restore(saved); resume(); };
    $("opening").onclick = function () { CINE.play("open", title); };
    $("cinema").onclick = function () { MENU.settings(); };
    // sound lives in Settings (sliders); Replay a day lives there too
    if ($("tach")) $("tach").onclick = function () { FUN.open(); };
    if (window.REVIEW && REVIEW.bindRate) REVIEW.bindRate("trate");
  }
  // Restart day: back to 08:00 of the day you are on, from the snapshot taken when it began
  function restartDay() {
    const d = S.day, snap = loadJSON(DAYK[d] || DAY1);
    if (!snap) { fresh(S.diff); } else restore(snap);
    S.seenIntro = true; save("briefing"); chrome(true); meters(); ticker(); briefing();
  }
  function resume() { chrome(true); meters(); ticker(); S.screen === "summary" ? summary() : briefing(); }
  // Batch M: after Replay a day, one card says what stands from the days before and what starts again, read from the
  // restored state itself (so it is always true). It stays until the first case of the replayed day is closed, or Got it.
  function markReplay() { S.replayOf = S.day; S.replayFirst = true; staleAfter(S.day); }
  function replayShowing() { return !!(S.replayOf && S.replayOf === S.day && !Object.keys(S.done || {}).length); }
  // Batch N: after replaying Day d, the saved starts of later days still hold the old run's choices. They are marked
  // old (still playable, labelled), until the replay reaches them and writes a fresh start.
  function staleAfter(d) { for (let n = d + 1; n <= 6; n++) { const k = DAYK[n], snap = loadJSON(k); if (snap && !snap.stale) { snap.stale = d; store.set(k, JSON.stringify(snap)); } } }
  const DAYWORDS = {
    1: function (r) { return r.caught ? "the mole caught" : "the mole still free"; },
    2: function (r) { return { win: "the Bath team stopped at Harwich", mixed: "the Bath team only partly stopped", loss: "the Bath team got away" }[r.exit] || ""; },
    3: function (r) { return { win: "the woman in green home safe", mixed: "the woman in green expelled, alive", loss: "the woman in green on state TV", traded: "the woman in green traded" }[r.end] || ""; },
    4: function (r) { return r.leak === "win" ? "the leak found and closed" : "the leak still open"; },
    5: function (r) { return { win: "the bridge swap done", mixed: "an untidy swap on the bridge", loss: "the bridge swap lost" }[r.swap] || ""; }
  };
  function replayFacts() {
    const st = [], days = S.days || {};
    for (let n = 1; n < S.day; n++) { const r = days[n]; if (!r) continue; const w = DAYWORDS[n] ? DAYWORDS[n](r) : ""; st.push("Day " + n + (r.grade ? " (grade " + r.grade + ")" : "") + (w ? ": " + w : "")); }
    const lost = Object.keys(S.lost || {}).map(function (k) { return first(k) + " is gone (" + S.lost[k] + ")"; });
    const hurt = S.roster.filter(function (k) { return S.status && (S.status[k] === "wounded" || S.status[k] === "burned"); }).map(function (k) { return first(k) + " is " + statusName(k).toLowerCase(); });
    return { stands: st, people: lost.concat(hurt), trust: score(S.meters.capital), service: svc(), cases: S.order.length, next: S.day < 6 ? S.day + 1 : 0 };
  }
  function replayCard() {
    if (!S.replayOf || S.replayOf !== S.day || Object.keys(S.done || {}).length) return "";
    const f = replayFacts();
    return '<div class="card replaynote" data-screen-note="replay"><div class="kicker">Replaying Day ' + S.day + '</div>' +
      "<p><b>What stands:</b> " + (f.stands.length ? "your earlier days count as you played them. " + esc(f.stands.join("; ")) + "." : "nothing before today.") +
      (f.people.length ? " " + esc(f.people.join("; ")) + "." : "") + " You start on No.10 trust " + f.trust + " and Service " + f.service + ", as you did first time.</p>" +
      "<p><b>What starts again:</b> today\u2019s " + f.cases + " cases, from 08:00, with a fresh kit." + (f.next ? " When you finish, Day " + f.next + " picks up from the new result." : "") + "</p>" +
      '<button class="btn ghost" id="replay-ok">Got it</button></div>';
  }
  function daySelect() {
    const day2 = loadJSON(DAY2), day3 = loadJSON(DAY3);
    // Replay a day (Settings, from the title): only the days you have unlocked
    const tile = function (d, t, sub, tag) { const sn = d > 1 ? loadJSON(DAYK[d]) : null, old = sn && sn.stale; return '<button class="card dossier sit' + (old ? " stale" : "") + '" id="d' + d + '"><span class="num">' + d + '</span><span><div class="t">' + t + '</div><div class="s">' + sub + (old ? '<br><b class="oldnote">Saved before you replayed Day ' + old + ": it still has your earlier choices.</b>" : "") + '</div></span><span class="dl">' + (old ? "OLD" : tag) + "</span></button>"; };
    render('<div class="card dossier" data-screen="replayday">' + LH + '<div class="kicker" style="margin-top:8px">Case files</div><h2>Replay a day</h2>' +
      tile(1, "The Long Day", "A defector, a mole, a leak, a cable. Ends in Bath. Starts a new game: your saved days are cleared.", "NEW") +
      (day2 ? tile(2, "Pale Hour", "Hunt the Bath team before they leave Britain.", "OPEN") : "") +
      (day3 ? tile(3, "The Green Coat", "Bring the woman in green home before midnight.", "OPEN") : "") +
      [4, 5, 6].map(function (d) { return loadJSON(DAYK[d]) ? tile(d, window.AH4.NAMEOF[d], { 4: "Act 2. Kesk writes to Albion House itself.", 5: "One of ours is held. A bridge at dawn.", 6: "Kesk in London. Everyone, everywhere." }[d], "OPEN") : ""; }).join("") +
      (function () { const old = [4, 5, 6].filter(function (d) { const sn = loadJSON(DAYK[d]); return sn && sn.stale; }); return old.length ? '<button class="btn ghost" id="clearold">Clear old saves (Day' + (old.length > 1 ? "s " : " ") + old.join(", ") + ")</button>" : ""; })() +
      backups().map(function (bk, i) { return '<button class="btn ghost restorebk" id="restorebk' + i + '" data-bk="' + i + '" aria-label="Bring back your backup from Day ' + bk.day + ", saved " + esc(bk.when) + '">Restore Day ' + bk.day + " \u00b7 " + esc(bk.when) + "</button>"; }).join("") +
      '<button class="btn ghost" id="back">Back</button></div>');
    [4, 5, 6].forEach(function (d) { if (loadJSON(DAYK[d])) $("d" + d).onclick = function () { playDay(d); }; });
    // Batch N: Day 1 starts a new game, so ask first when there are saved days to lose
    $("d1").onclick = function () { const have = [2, 3, 4, 5, 6].filter(function (d) { return loadJSON(DAYK[d]); }); if (!have.length && !loadJSON(SAVE)) return coldOpen();
      // Batch O: offer to keep a copy first; one backup slot, restored from this screen
      MENU.confirm("Start a new game from Day 1?", (have.length ? "Your saved game and the saved starts of Day" + (have.length > 1 ? "s " : " ") + have.join(", ") + " will be cleared." : "Your saved game will be cleared.") + " Back it up first and you can bring it back from Replay a day.", "Start again", coldOpen, null, { t: "Back up, then start again", go: function () { backup(); coldOpen(); } }); };
    if ($("clearold")) $("clearold").onclick = function () { [4, 5, 6].forEach(function (d) { const sn = loadJSON(DAYK[d]); if (sn && sn.stale) store.del(DAYK[d]); }); daySelect(); };
    document.querySelectorAll("[data-bk]").forEach(function (b) { b.onclick = function () { const i = +b.getAttribute("data-bk"), bk = backups()[i]; if (!bk) return; MENU.confirm("Bring back your backup?", "Day " + bk.day + ", backed up " + bk.when + ". It replaces the game you have now, and you carry on where it was saved.", "Bring it back", function () { restoreBackup(i); }, daySelect); }; });
    if (day3) $("d3").onclick = function () { playDay(3); };
    if (day2) $("d2").onclick = function () { playDay(2); };
    $("back").onclick = title;
  }
  // Batch P: replay one day straight from its saved start (Replay a day, and the achievements screen). Day 1 is a new
  // game, so it goes through Replay a day and its confirm.
  function playDay(d) {
    if (d === 1) { daySelect(); const b = $("d1"); if (b) b.click(); return; }
    const snap = loadJSON(DAYK[d]); if (!snap) return daySelect();
    restore(snap); markReplay(); save("briefing"); chrome(true); meters(); ticker();
    (d === 2 ? window.AH2 : d === 3 ? window.AH3 : window.AH4).briefingIntro();
  }
  // Batch O: one backup slot: the saved game and every saved day start, kept when you restart from Day 1
  const BACKUP = "albion-backup-v1";
  function backup() {
    const sv = loadJSON(SAVE), keys = {}; [DAY1, DAY2, DAY3, DAYK[4], DAYK[5], DAYK[6], SAVE].forEach(function (k) { if (k && store.get(k)) keys[k] = store.get(k); });
    const d = new Date(), when = d.getDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()] + ", " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    // Batch P: two slots, newest first
    store.set(BACKUP, JSON.stringify([{ day: sv && sv.S ? sv.S.day || 1 : 1, when: when, keys: keys }].concat(backups()).slice(0, 2)));
  }
  function backups() { const b = readJ(BACKUP); return Array.isArray(b) ? b : b && b.keys ? [b] : []; }
  // Batch P: bringing a backup back drops you straight into that game where it was saved (no extra Continue)
  function restoreBackup(i) {
    const list = backups(), bk = list[i]; if (!bk) return;
    [SAVE, DAY2, DAY3, DAYK[4], DAYK[5], DAYK[6]].forEach(function (k) { store.del(k); }); Object.keys(bk.keys).forEach(function (k) { store.set(k, bk.keys[k]); });
    list.splice(i, 1); if (list.length) store.set(BACKUP, JSON.stringify(list)); else store.del(BACKUP);
    const sv = loadJSON(SAVE); if (sv) { restore(sv); resume(); } else daySelect();
  }
  // ---------- the cold open: Standard, straight in; the Prime Minister rings within the minute ----------
  function coldOpen() {
    store.del(SAVE); [2, 3, 4, 5, 6].forEach(function (d) { store.del(DAYK[d]); });
    PREFS.set("tips", true); fresh("standard", true); store.set(DAY1, JSON.stringify({ v: 1, seed: seed, S: S }));
    // the opening film first (if cutscenes are on), then the How it works cards once, then Downing Street and the phone
    const day1 = function () { if (!CINE.maybe("day1", pm0)) pm0(); };
    const howto = function () { if (window.HOWTO && HOWTO.due()) HOWTO.show(day1, true); else day1(); };
    if (CINE.auto()) CINE.play("open", howto); else howto();
  }
  function pm0() {
    chrome(true); meters(); ticker();
    const done = function () { save("briefing"); intro(); };
    const settle = function (k) {
      S.pm0 = k; const ch = apply(k === "yes" ? { capital: 4 } : { capital: -3 });
      if (window.VOICE) VOICE.play("react_pm0_" + k);
      window.DESK.after(k === "yes" ? "PROMISED" : "FREE HAND", k === "yes" ? "win" : "mixed", "The No.10 line",
        k === "yes" ? "\u201cGood. Don\u2019t make me ring twice.\u201d She has hung up before you put the receiver down. The leak is now a promise." : "\u201cYou\u2019ll have it. Until lunch.\u201d No.10 is cooler for it, but your people have room to work the leak.", ch, null, null);
      $("go").textContent = "Open your file"; $("go").onclick = done;
    };
    window.DESK.call({ id: "pm0", voice: "call_pm0", line: "NO.10 \u00b7 SECURE LINE", img: "pm-calm", ring: "The Prime Minister, C. Your first morning.", who: "Eleanor Hale \u00b7 Prime Minister", say: "Tell her",
      text: "C, it\u2019s Eleanor Hale. Welcome to the chair. <b>We have a leak.</b> One of your secret reports has reached the Morning Courier. It goes to print at three in the morning. I will not read it over breakfast.",
      opts: [{ k: "yes", t: "\u201cI\u2019ll stop the leak before it prints, Prime Minister.\u201d", chips: '<span class="chip risk-low">+4 No.10 trust</span><span class="chip">She will hold you to it</span>' },
        { k: "free", t: "\u201cI\u2019ll deal with the leak, but my way. I need a free hand.\u201d", chips: '<span class="chip risk-high">\u22123 No.10 trust</span><span class="chip risk-low">+6% odds on the leak</span>' }],
      def: "yes", answer: function (k) { settle(k); },
      miss: function () { S.pm0 = "missed"; const ch = apply({ capital: -5 }); window.DESK.after("MISSED", "loss", "The No.10 line", "Your first call as C, and nobody answered. Hale\u2019s private secretary rings Ash instead. It will be remembered.", ch, null, null); $("go").textContent = "Open your file"; $("go").onclick = done; } });
  }
  // after Day 1: settle how hard the rest of the week is (Standard unless you change it)
  function diffAfterDay1(next) {
    let pick = S.diff || "standard";
    const draw = function () {
      render('<div class="card dossier" data-screen="diff1">' + LH + '<div class="kicker" style="margin-top:8px">Day 1 is done \u00b7 the rest of the week</div><h2>How hard from here?</h2><p>You played Day 1 on <b>' + esc(D.DIFFICULTY[S.diff || "standard"].name) + "</b>. Keep it, or change it for Days 2 to 6.</p>" +
        Object.keys(D.DIFFICULTY).map(function (k) { const d = D.DIFFICULTY[k], lock = k === "hard" && window.REPLAY && !REPLAY.unlocked(); return '<button class="card appr' + (pick === k ? " sel" : "") + '" data-d="' + k + '"' + (lock ? " disabled" : "") + '><div class="t">' + d.name + (k === "standard" ? " \u00b7 recommended" : "") + (lock ? " \ud83d\udd12 finish Day 3 to unlock" : "") + '</div><p style="margin:0">' + d.txt + "</p></button>"; }).join("") +
        '</div><div class="sticky-go"><button class="btn primary" id="go">Carry on \u00b7 ' + D.DIFFICULTY[pick].name + "</button></div>", "You can change it again from a new game.");
      document.querySelectorAll("[data-d]").forEach(function (b) { b.onclick = function () { pick = b.getAttribute("data-d"); draw(); }; });
      $("go").onclick = function () { S.diffAsked = true; if (pick !== S.diff) { S.diff = pick; S.kit = Object.assign({}, D.DIFFICULTY[pick].kit); } save("briefing"); next(); };
    };
    draw();
  }
  function difficulty() {
    let pick = "standard", tips = true;
    const draw = function () {
      render('<div class="card dossier">' + LH + '<div class="kicker" style="margin-top:8px">Before you take the chair</div><h2>How hard a day?</h2>' +
        Object.keys(D.DIFFICULTY).map(function (k) { const d = D.DIFFICULTY[k], lock = k === "hard" && window.REPLAY && !REPLAY.unlocked(); return '<button class="card appr' + (pick === k ? " sel" : "") + '" data-d="' + k + '"' + (lock ? " disabled" : "") + '><div class="t">' + d.name + (lock ? " \ud83d\udd12 finish Day 3 to unlock" : "") + '</div><p style="margin:0">' + d.txt + "</p></button>"; }).join("") +
        '<label class="tipsopt"><input type="checkbox" id="tips"' + (tips ? " checked" : "") + "> Show tips (you can switch them off in Settings)</label>" + "</div>" +
        '<div class="sticky-go"><button class="btn primary" id="go">Begin \u00b7 ' + D.DIFFICULTY[pick].name + '</button></div><button class="btn ghost" id="back">Back</button>', "You can change this next time you start a new game.");
      document.querySelectorAll("[data-d]").forEach(function (b) { b.onclick = function () { pick = b.getAttribute("data-d"); draw(); }; });
      $("tips").onchange = function () { tips = $("tips").checked; };
      $("go").onclick = function () { store.del(SAVE); [2, 3, 4, 5, 6].forEach(function (d) { store.del(DAYK[d]); }); PREFS.set("tips", tips); fresh(pick, tips); store.set(DAY1, JSON.stringify({ v: 1, seed: seed, S: S })); const go = function () { if (!CINE.maybe("day1", intro)) intro(); }; if (window.HOWTO && HOWTO.due()) HOWTO.show(go, true); else go(); };
      $("back").onclick = title;
    };
    draw();
  }
  function intro() {
    chrome(false);
    render('<figure class="no10" id="no10"><img src="' + pic("desk-hub") + '" alt="Your desk at Albion House: the green phone, a stack of files and a cup of tea"><figcaption>Albion House \u00b7 your desk. After her call, No.10 sent this over by secure box.</figcaption></figure>' +
      '<div class="card dossier">' + LH + '<span class="stamp corner">SECRET</span><div class="kicker">Personal file \u00b7 For C only</div><h2 style="margin-top:10px">You are \u2018C\u2019.</h2>' +
      '<p>You run <strong>Albion House</strong>, Britain\u2019s foreign intelligence service. You answer to the Prime Minister, <strong>Eleanor Hale</strong>.</p>' +
      '<p>\u201cKeep Britain safe, C. And keep it out of the papers.\u201d</p>' +
      '<p>Three officers. Cases until midnight. <strong>One of your officers is working for the other side.</strong></p>' +
      '<button class="linkbtn" id="more">Read the full file</button>' +
      '<button class="btn primary" id="go">Read the morning brief</button></div>');
    $("go").onclick = function () { chrome(true); meters(); ticker(); briefing(); };
    $("more").onclick = function () { dossier({ tab: "PERSONAL FILE", stamp: "SECRET", kicker: "For C only", title: "You are \u2018C\u2019", img: pic("desk-hub"), alt: "Your desk at Albion House", body: INTRO_FULL }); };
  }
  const INTRO_FULL = '<p>You are the Chief of <strong>Albion House</strong>, Britain\u2019s foreign intelligence service: the people who run Britain\u2019s spies abroad. Your office looks across the Thames at Westminster. You answer to the Prime Minister, <strong>Eleanor Hale</strong>, at Number 10, and to nobody else.</p>' +      '<p>She has just handed you the morning file in her study. \u201cKeep Britain safe, C. And keep it out of the papers.\u201d</p>' +      '<p>Your Chief of Staff, <strong>Margaret \u201cAsh\u201d Ashby</strong>, runs the building. You have <strong>three officers</strong>, and <strong>one of them is working for the other side</strong>. Watch for small slips.</p>' +      '<p>The day runs from 08:00 to midnight. Careful plans take longer, bold ones are quick. Every case has a deadline, and it gets harder the longer you leave it. Watch two gauges: <b>No.10 trust</b>, which opens the bold plans, and <b>Service</b>, your officers\u2019 safety, loyalty and cover, which makes every plan likelier. The public\u2019s mood shows in the papers.</p>';

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
    markBar(); // Batch N: the top bar as you leave the desk; every result card measures from here
    no10Take();
    const gone = expire();
    if (!remaining().length) return summary();
    if (S.day === 1 && S.log.filter(function (l) { return l.k; }).length >= 2 && !S.call) return phone();
    if (S.pendingRecruit > 0) return recruit();
    if (window.DESK.interrupt()) return;
    if (window.CRUNCH && CRUNCH.interrupt()) return;
    if (S.day >= 2 && window.AH3.interrupt()) return;
    if (S.day >= 4 && window.AH4.interrupt()) return;
    if (stuck()) return summary();
    meters(); ticker(); save("briefing");
    if (!S.chimed) { S.chimed = true; if (window.SFX) SFX.chime(S.hour); }
    const line = S.day >= 4 ? window.AH4.line(gone) : S.day === 3 ? window.AH3.line(gone) : S.day === 2 ? window.AH2.line(gone) : day1Line(gone);
    let warnTxt = "";
    const cards = S.order.map(function (id, i) {
      const s = CASES()[id], done = S.done[id], lt = late(id), due = dueOf(id), left = due - S.hour;
      if (!done && left >= 0 && left <= 2 && !warnTxt) warnTxt = s.title + " is due by " + hh(due) + ": " + left + " hour" + (left === 1 ? "" : "s") + " left.";
      if (!done && lt > 0 && !warnTxt) warnTxt = s.title + " is overdue. Odds are dropping; it\u2019s lost at " + hh(due + EXPIRE) + ".";
      const lockT = S.day === 1 && !done && S.order.slice(0, i).some(function (x) { return !S.done[x]; });
      const lock4 = S.day >= 4 && !done && window.AH4.locked(id);
      const noOff = !done && needsOfficer(id) && !freeAgents().length;
      const sub = s.kind === "mini" ? "Hands-on \u00b7 no officer" : s.kind === "accuse" || s.kind === "interro" || s.kind === "mole2" || s.kind === "tail" || s.kind === "cable" || s.kind === "leak" || s.kind === "swap" || s.kind === "showdown" ? "No officer needed" : s.kind === "exfil" ? "Needs a driver" : s.kind === "chase" ? "Everyone" : "";
      const why = lockT ? "After lesson " + i : lock4 ? window.AH4.lockWhy(id) : noOff ? "No officer free" : "";
      const ap = s.approaches || [], risk = ap.length ? Math.round(ap.reduce(function (m, a) { return m + (DESK_RANK[a.risk] || 0); }, 0) / ap.length) : 0; // typical risk across the plans
      return { id: id, s: s, i: i, done: done, title: S.day === 2 ? window.AH2.titleOf(id) : s.title, img: HEADS[id] ? "img/h-" + HEADS[id] + ".jpg" : "img/" + (s.art || "map") + ".jpg",
        risk: risk, late: lt > 0 && !done, soon: !done && lt <= 0 && left <= 2, due: due, left: left, lockT: lockT, lock4: lock4, off: !!(done || noOff || lockT || lock4), why: why, sub: sub };
    });
    FILES = {}; cards.forEach(function (c) { FILES[c.id] = c; });
    render('<div data-screen="brief"></div><div class="lh paper">HIS MAJESTY\u2019S GOVERNMENT \u00b7 TOP SECRET \u00b7 UK EYES ONLY</div><div class="kicker">' + (S.day >= 4 ? "Day " + S.day + " \u00b7 " + window.AH4.NAMEOF[S.day] : S.day === 3 ? "Day 3 \u00b7 The Green Coat" : S.day === 2 ? "Day 2 \u00b7 Pale Hour" : "Morning brief for C") + (S.day >= 4 && /Albion House/.test(window.AH4.NAMEOF[S.day]) ? "" : " \u00b7 Albion House") + "</div>" + replayCard() + lowTrustCard() + tip("briefing") + (S.day === 3 ? window.AH3.followStrip() : S.day >= 4 ? window.AH4.followStrip() : "") + no10Note() + deskHtml(cards) +
      (S.day === 2 ? window.AH2.boardButton() : "") + '<button class="linkbtn" id="endday">Call it a day</button>', warnTxt || "Tap a file to pick it up.");
    if (no10Took() && !S.no10.said && window.VOICE) { S.no10.said = true; save("briefing"); VOICE.play("ash_no10_took"); }
    briefVoice(line.text, line.worried);
    document.querySelectorAll("[data-sit]").forEach(function (b) { b.onclick = function () { deskFile(b.getAttribute("data-sit"), b); }; });
    const dk = document.querySelector(".desk-b"); if (dk) { if (window.FEEL && FEEL.reduce) dk.classList.add("go", "still"); else requestAnimationFrame(function () { dk.classList.add("go"); }); }
    if (S.day === 2) window.AH2.bindBoardButton();
    LOOK.rain(S.day === 1); // rain on the window is Day 1's weather; the other days have their own light (LOOK.day)
    MENU.coach("desk", "Today\u2019s files are spread on your desk. Tap one to pick it up and read it, then <b>Start this case</b>. No.10 trust and the Service sit in the bar at the top.");
    if (window.FUN) FUN.promo();
    MENU.coach("menu", "Tap \u2630 any time to pause, change settings or return to the title. The game saves itself.");
    $("endday").onclick = function () { S.hour = 24; summary(); };
    if (S.replayFirst) { S.replayFirst = false; save("briefing"); } // Batch O: tips come back from the second screen of a replay
  }
  // Batch O: in Act 2, with No.10 trust under 20, a card on the desk says what it risks and how to win trust back
  function lowTrustCard() {
    const t = score(S.meters.capital); if (S.day < 4 || t >= NO10_LOW) return "";
    return '<div class="card lowtrust" role="note" data-screen-note="lowtrust"><div class="kicker">No.10 trust ' + t + "/100</div><p><b>The Prime Minister is losing patience.</b> " +
      (S.day === 6 ? "If trust ends Day 6 under 15, you resign. Under 30, a lost Downing Street means resigning too, and the quiet exit needs 30." : "Under 15 at the end of Day 6 means resigning. Under 20 at midnight, No.10 takes a file off your desk.") +
      " Each case you close wins back +3 trust (+1 for a partial).</p></div>";
  }
  // painted header for each case file
  const HEADS = { defector: "clerk", mole: "mole", leak: "fleet", sabotage: "rig", courier: "courier", safehouse: "flat", mole2: "mole", exit: "harwich", bath: "bath", york: "york", watch: "fleet", manchester: "manchester", leak: "letter", recon: "bridge", press: "fleet", swap: "bridge", find: "london", chase: "london", showdown: "fleet", tail: "fleet", cable: "cabletap", exfil: "signal", proof: "signal", faces: "fleet", lie: "york" };
  // ---------- the desk: case files spread out under the lamp ----------
  const DESK_RANK = { low: 1, med: 2, high: 3 }, RISKW = ["No field risk", "Low risk", "Some risk", "High risk"];
  let FILES = {}; // today's files by id, for the lifted view
  function dueWords(c) { return c.done && c.id === no10Took() ? "No.10 is handling it" : c.done ? { win: "Closed", mixed: "Partial", loss: "Failed" }[c.done] : c.late ? "Overdue \u00b7 was " + hh(c.due) : "Due " + hh(c.due) + (c.left <= 5 ? " \u00b7 " + c.left + "h left" : ""); }
  function deskHtml(cards) {
    return '<div class="desk-b"><div class="desk-spread">' + cards.map(function (c) {
      const rot = [-2.2, 1.6, 1.2, -1.8, -1.1, 2.0, 0.8][c.i % 7], pri = c.done ? "done" : c.left <= 2 ? "red" : c.left <= 5 ? "amber" : "green";
      return '<button class="desk-file pri-' + pri + (c.off ? " off" : "") + (c.lockT || c.lock4 ? " locked" : "") + (c.done ? " done" : "") + (c.s.flash && !c.done ? " flash" : "") + '" data-sit="' + c.id + '" data-rot="' + rot + '" style="--rot:' + rot + 'deg;--i:' + c.i + '" aria-label="' + esc(c.title) + ". " + dueWords(c) + '">' +
        '<span class="desk-photo"><img src="' + c.img + '" alt=""><span class="desk-clip" aria-hidden="true"></span></span>' +
        '<span class="desk-t">' + esc(c.title) + '</span><span class="desk-chips">' + (c.done ? "" : '<span class="dk-chip r' + c.risk + '">' + RISKW[c.risk] + "</span>") +
        '<span class="dk-chip' + (c.done ? " filed" : c.late ? " late" : c.soon ? " soon" : "") + '">' + (c.done ? "Filed" : dueWords(c)) + "</span></span>" +
        (c.why ? '<span class="desk-why">' + esc(c.why) + "</span>" : "") +
        (c.done ? '<span class="desk-stamp">' + dueWords(c) + "</span>" : "") + "</button>";
    }).join("") + "</div></div>";
  }
  // the full file lifts off the desk towards you
  function deskFile(id, from) {
    const c = FILES[id]; if (!c) return;
    const reduce = window.FEEL && FEEL.reduce, old = $("dk-file"); if (old) old.remove();
    const d = document.createElement("div"); d.id = "dk-file"; d.className = "dk-file"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-label", c.title);
    d.innerHTML = '<div class="dk-sheet"><div class="dk-hmg">HIS MAJESTY\u2019S GOVERNMENT \u00b7 SECRET \u00b7 UK EYES ONLY</div>' +
      '<span class="dk-clip" aria-hidden="true"></span><img class="dk-photo" src="' + c.img + '" alt="Painting of ' + esc(c.s.where || "the scene") + '">' +
      '<div class="dk-kick">Case file \u00b7 ' + esc(c.s.where || "") + '</div><h2>' + esc(c.title) + '</h2>' +
      '<div class="dk-chips"><span class="dk-chip r' + c.risk + '">' + RISKW[c.risk] + '</span><span class="dk-chip' + (c.late ? " late" : c.soon ? " soon" : "") + '">' + (c.done ? dueWords(c) : c.late ? "Overdue \u00b7 was due " + hh(c.due) : "Due " + hh(c.due) + " \u00b7 " + c.left + (c.left === 1 ? " hour left" : " hours left")) + "</span></div>" +
      (c.s.brief ? "<p>" + esc(c.s.brief) + "</p>" : "") + (c.why || c.sub ? '<p class="dk-note">' + esc(c.why || c.sub) + "</p>" : "") +
      '<div class="dk-sig">Initialled for C \u00b7 Albion House, London</div>' +
      '<div class="dk-go">' + (c.off ? '<button class="btn ghost" disabled>' + (c.done ? "Already dealt with" : c.lockT ? "Not yet: finish the earlier file" : c.lock4 ? "Not yet" : "No officer free") + "</button>" : '<button class="btn primary" id="dk-start">Start this case</button>') +
      '<button class="btn ghost" id="dk-back">Put it back</button></div></div>';
    document.body.appendChild(d);
    const sh = d.querySelector(".dk-sheet");
    if (from && !reduce) { const r = from.getBoundingClientRect(), t = sh.getBoundingClientRect(); sh.style.transformOrigin = "top left"; sh.style.transform = "translate(" + (r.left - t.left) + "px," + (r.top - t.top) + "px) scale(" + (r.width / t.width).toFixed(3) + ") rotate(" + (from.dataset.rot || 0) + "deg)"; }
    requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add("in"); sh.style.transform = ""; }); });
    if (window.SFX && SFX.paper) SFX.paper();
    if (window.FEEL) FEEL.buzz("tap");
    const close = function () { d.classList.remove("in"); setTimeout(function () { d.remove(); }, reduce ? 0 : 220); };
    d.querySelector("#dk-back").onclick = close;
    const st = d.querySelector("#dk-start"); if (st) st.onclick = function () { d.remove(); if (window.FEEL) FEEL.buzz("press"); openCase(id); };
  }
  function chead(id) { return HEADS[id] ? '<button type="button" class="chead big" data-case-file="' + id + '" aria-label="Open the case file"><img src="img/h-' + HEADS[id] + '.jpg" alt=""><span class="zoomhint">Open the file</span></button>' : ""; }

  // ---------- files and dossiers: their own full-screen paper folder, picture large, tap to zoom ----------
  function dossier(o) {
    const old = $("dossier"); if (old) old.remove();
    const d = document.createElement("div"); d.id = "dossier"; d.className = "dossier-screen"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-label", o.title);
    d.innerHTML = '<div class="folder" data-screen="dossier"><div class="ftab">' + esc(o.tab || "FILE") + '</div><div class="fpaper">' + LH + '<span class="stamp corner">' + esc(o.stamp || "SECRET") + '</span><div class="kicker dk">' + esc(o.kicker || "") + '</div><h2>' + esc(o.title) + '</h2>' +
      (o.img ? '<button type="button" class="fpic" id="fpic" aria-label="Zoom the picture"><img src="' + o.img + '" alt="' + esc(o.alt || o.title) + '"><span class="zoomhint">Tap to zoom</span></button>' : "") + '<div class="fbody">' + o.body + '</div></div></div><div class="fclose">' + (o.act ? '<button class="btn primary" id="fsend">' + esc(o.act.label) + '</button><button class="btn ghost" id="fclose">Close the file</button>' : '<button class="btn primary" id="fclose">Close the file</button>') + "</div>";
    document.body.appendChild(d); requestAnimationFrame(function () { d.classList.add("in"); });
    const pic0 = $("fpic"); if (pic0) pic0.onclick = function () { d.classList.toggle("zoomed"); };
    $("fclose").onclick = function () { d.remove(); };
    if (o.act) $("fsend").onclick = function () { d.remove(); o.act.fn(); };
    if (window.VOICE && o.voice) VOICE.play(o.voice);
  }
  // a case that mentions the Grey House says what it is (batch J: players met the name with no explanation)
  function ghNote(t) { return /Grey House/.test(t || "") ? '<p class="ghnote"><b>The Grey House:</b> Varenia\u2019s secret service, our opposite number. Its officers watch, follow and recruit, as we do.</p>' : ""; }
  function caseFile(id) {
    const s = CASES()[id];
    dossier({ tab: "CASE FILE", stamp: "CONFIDENTIAL", kicker: s.where + " \u00b7 due by " + hh(dueOf(id)), title: s.title, img: "img/h-" + HEADS[id] + ".jpg", alt: "Painting of " + s.where, body: "<p>" + esc(s.brief || "") + "</p>" + ghNote(s.brief), voice: "ash_case_d" + S.day + "_" + id });
  }
  function officerFile(k, send) {
    const a = AG(k), st = S.stress[k], v = vetOf(k);
    dossier({ act: send ? { label: "Send " + first(k), fn: send } : null, tab: "PERSONNEL", stamp: "STAFF IN CONFIDENCE", kicker: a.role, title: a.name, img: faceSrc(k, condOf(k)), alt: "Portrait of " + a.name + ", " + CONDW[condOf(k)].toLowerCase(),
      body: '<p class="fstr">\u2605 ' + esc(strengthOf(k)) + " " + condChip(k, "inline") + "</p>" + badges(k) + '<p class="tlist">' + traitsOf(k).map(function (t) { return "<b>" + esc(t.n) + ":</b> " + esc(t.tx); }).join("<br>") + "</p>" + '<div class="traits">' + pips(a.skill, "", "Skill") + pips(S.loyal[k], "loyal" + (S.loyal[k] <= 2 ? " high" : ""), "Loyalty") + pips(st, "stress" + (st >= 4 ? " high" : ""), "Stress") + pips(a.cover, "", "Cover") + "</div>" +
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
  // Day 1 lessons are Ash talking you through it: the same line on screen and in your ear, once each
  function lesson(id, step) {
    const L = S.day === 1 && PREFS.get("tips") && LESSONS[id]; if (!L || !L[step]) return "";
    const vid = "tut_" + id + "_" + step, V = window.VOICE && VOICE.lines[vid];
    S.tutHeard = S.tutHeard || {};
    if (V && !S.tutHeard[vid]) {
      S.tutHeard[vid] = 1; let tries = 0;
      const say = function () { if (!document.querySelector('.lesson[data-v="' + vid + '"]')) return; if ((VOICE.busy() || window.AH_PAUSED) && tries++ < 30) return void setTimeout(say, 500); VOICE.now(vid, { nosub: true }); };
      setTimeout(say, FAST ? 0 : 700);
    }
    return '<div class="lesson ash-tip" data-v="' + vid + '"><img class="portrait" src="' + pic("ash") + '" alt=""><span class="lt"><b>Ash \u00b7 tip ' + L.n + " of 4</b>" + (V ? esc(V.text) : L[step]) + "</span></div>";
  }

  const CUES = { tail: "cue_tail", cable: "cue_cable", exfil: "cue_exfil", chase: "cue_chase", swap: "cue_swap", showdown: "cue_showdown", interro: "cue_interro", leak: "cue_leak", accuse: "cue_accuse", mole2: "cue_accuse" };
  function openCase(id) {
    const kind = CASES()[id].kind;
    // Ash introduces every case once, then the special screens add their own cue
    S.cued = S.cued || {}; if (!S.cued[S.day + id] && window.VOICE && VOICE.seq) { S.cued[S.day + id] = 1; VOICE.seq(["ash_case_d" + S.day + "_" + id].concat(CUES[kind] ? [CUES[kind]] : [])); }
    if (kind === "mini") return MINI.open(id);
    if (id === "york" && S.day === 3 && !(S.minis && S.minis.lie) && window.MINI) return MINI.open("lie"); // York, part one
    if (kind === "accuse") return accuse();
    if (kind === "judge" && !S.belief) return judgement();
    if (kind === "interro" || kind === "mole2") return window.AH2.open(id);
    if (kind === "tail" || kind === "cable" || kind === "exfil") return window.AH3.open(id);
    if (kind === "leak" || kind === "swap" || kind === "chase" || kind === "showdown") return window.AH4.open(id);
    pickAgent(id);
  }
  // Ash says her morning note aloud (a short spoken version of the text on her card), once per note
  const BRIEF = [[/^Morning, C\. Tea/, "ash_brief_d1"], [/Flash from the night desk.*top of the pile/, "ash_brief_flash_top"], [/Flash from the night desk/, "ash_brief_flash"], [/^We ran out of time/, "ash_brief_gone"], [/night porter/, "ash_brief_porter"],
    [/on the bench\. Whatever/, "ash_brief_bench"], [/^Morning, C\. Vass is alive/, "ash_brief_d2"], [/no string on them/, "ash_brief_board"], [/^Morning, C\. York first/, "ash_brief_d3"],
    [/^Archer lands tonight/, "ash_brief_d3_deal"], [/signal spot at seven/, "ash_brief_d3_late"], [/^Morning, Chief\. Somebody is watching/, "ash_brief_d4"], [/^Every case we win clears/, "ash_brief_d4_more"],
    [/^Walk the bridge, keep the Bugle/, "ash_brief_d5"], [/^Find where he sleeps/, "ash_brief_d6"], [/^Now we chase/, "ash_brief_d6_chase"], [/heading for Number 10/, "ash_brief_d6_no10"]];
  // Ash's line on the desk shows once, in the caption panel: spoken the first time, captioned only after that
  // (or when it has no recording). There is no second copy at the top of the page any more.
  function briefVoice(text, worried) {
    const t = String(text).replace(/<[^>]+>/g, ""), hit = BRIEF.filter(function (b) { return b[0].test(t); })[0];
    if (!window.VOICE) return;
    S.briefSaid = S.briefSaid || {}; const key = S.day + ":" + t;
    if (hit && !S.briefSaid[key]) { S.briefSaid[key] = 1; return void VOICE.play(hit[1]); }
    if (VOICE.caption) setTimeout(function () { VOICE.caption("Ash", text); }, 60);
  }
  function day1Line(gone) {
    const flash = S.order.indexOf("sabotage") >= 0 && !S.done.sabotage, fresh2 = flash && !S.flashShown;
    let text;
    if (!S.log.length) text = "Morning, C. Tea\u2019s on the desk. We\u2019ll take today one file at a time. Start with the leak: it\u2019s due by " + hh(dueOf("leak")) + ".";
    else if (fresh2) text = "<b>Flash from the night desk.</b> Someone means to cut a North Sea cable tonight. Two reports, two places. " + (cableAhead() ? "It\u2019s on the pile, under today\u2019s other files. We\u2019ll reach it tonight." : "I\u2019ve put it top of the pile.");
    else if (gone.length) text = "We ran out of time on <b>" + gone.map(function (id) { return CASES()[id].title.toLowerCase(); }).join(" and ") + "</b>. It\u2019s gone, C. The papers have it.";
    else if (!S.porter && S.log.length) { S.porter = true; text = "Small thing. The night porter says one of ours came back to the building at three this morning without signing in. All he saw was <b>" + D.AGENTS[S.mole].look + "</b>."; }
    else text = benchLine();
    if (fresh2) { S.flashShown = true; if (window.SFX) SFX.tele(); FEEL.buzz("ring"); }
    return { text: text, worried: fresh2 || gone.length };
  }
  // how many unfinished files sit above the cable case on Day 1's pile (0 = it's top and open)
  function cableAhead() { const i = S.order.indexOf("sabotage"); return i < 0 ? 0 : S.order.slice(0, i).filter(function (x) { return !S.done[x]; }).length; }
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
        (window.VOICE ? (VOICE.once("ash_judge_sab"), "") : "") + ash("They can\u2019t both be right. Gareth\u2019s man has been good to us before. But he was paid twice this month, and not only by us. The intercept is thin, but it\u2019s their own voice.", true) + lesson("sabotage", "judge") +
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
    add(S.stress[k] >= 4 ? "Strained" : "Stress", -S.stress[k] * (calm ? 2 : 4));
    add(S.loyal[k] > 3 ? "Loyal" : "Wavering", (S.loyal[k] - 3) * 3);
    add("Experience", Math.min(12, vetOf(k) * 4));
    add("Status: " + statusName(k), statusMod(k));
    if (kitId) add(D.KIT[kitId].name, D.KIT[kitId].odds || 0);
    const lt = late(id); if (lt > 0) add("Late", -(10 + lt * 5));
    if (S.day === 3) add("Day 3 file", window.AH3.oddsMod(id, k, a));
    if (S.day >= 4) add("Kesk and the week so far", window.AH4.oddsMod(id, k, a));
    add("Earlier choices", window.DESK.oddsMod(id));
    add("Service", (svc() - 50) / 4);
    if (flyOn()) add("The team\u2019s flying", 5);
    if (window.OPS) OPS.parts(id, k, a, add);
    let o = base + P.reduce(function (t, p) { return t + p[1]; }, 0);
    if (id === "sabotage") { if (S.belief === "split") { add("Split teams", -12); o -= 12; } else if (S.belief !== D.TRUTH) { const cap = Math.min(o, 12); add("Wrong site", cap - o); o = cap; } }
    return { odds: Math.max(5, Math.min(92, Math.round(o))), base: Math.round(base), parts: P };
  }
  function traitsOf(k) { return window.FUN ? FUN.traits(k) : D.TRAITS[k] || []; }
  function oddsFor(id, k, a, kitId) { return oddsParts(id, k, a, kitId).odds; }
  // the live-op call: what each answer costs and pays. One source for the buttons and for resolve().
  const OPT = { push: { mod: 12, winX: 1.5, failService: -5, burn: 1 / 3 }, hold: { mod: -6, trust: -2 }, abort: { trust: -6 } };
  // Batch P: on Hard the situation on the ground shifts the odds at the radio call by a hidden -8..+8, so the words
  // (good odds, poor odds...) can't be worked out from the dial. Fixed per case, officer and point in the day, so the
  // words on the call and the roll in resolve() agree. It is named on the result card afterwards.
  function driftOf(id, k) {
    if (!S || S.diff !== "hard") return 0;
    const str = id + "|" + k + "|" + S.day + "|" + (S.log || []).length + "|" + (S.roster || []).join(""); let h = 7;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100003;
    return (h % 17) - 8;
  }
  function opTerms(id, k, a, kitId) {
    const base = oddsFor(id, k, a, kitId), dr = driftOf(id, k), cl = function (x) { return Math.max(5, Math.min(95, x)); };
    return { base: base, drift: dr, push: Object.assign({ odds: cl(base + dr + OPT.push.mod) }, OPT.push), hold: Object.assign({ odds: cl(base + dr + OPT.hold.mod) }, OPT.hold), abort: Object.assign({}, OPT.abort) };
  }
  function statusName(k) { const st = (S.status || {})[k]; return st ? { tired: "Tired", wounded: "Wounded", burned: "Burned" }[st] || "" : ""; }
  function statusMod(k) { const st = (S.status || {})[k]; return st === "tired" ? -8 : st === "wounded" ? -15 : 0; }
  // the officer's own pick: the approach they rate best. Choosing another overrules them.
  function recIdx(id, k) { let best = -1, bo = -1; CASES()[id].approaches.forEach(function (a, i) { if (lockOf(a)) return; const o = oddsFor(id, k, a, null); if (o > bo) { bo = o; best = i; } }); return best; }
  // why a Day 2 plan is locked, in plain words, and whether pinning a clue on the board would open it
  const NEEDS = { ferry: { clue: "ticket", owner: "tall", who: "the tall man", plan: "Quiet intercept at Harwich" }, car: { clue: "hire", owner: "driver", who: "the driver", plan: "Take the driver first" } };
  function canUnlock(a) { const n = NEEDS[a.needs]; return !!(n && (S.clues || {})[n.clue] && !(S.unlocked || {})[a.needs]); }
  function lockHint(a) {
    const n = NEEDS[a.needs]; if (!n) return "Locked";
    const name = D.CLUES[n.clue].name;
    if ((S.clues || {})[n.clue]) return "\ud83d\udd12 Locked \u00b7 pin the <b>" + name + "</b> to " + n.who + " on the evidence board.";
    if (n.clue === "ticket" && S.done && S.done.courier) return "\ud83d\udd12 Locked \u00b7 the courier never gave up the ferry booking.";
    if (n.clue === "ticket") return "\ud83d\udd12 Locked \u00b7 interview the courier at the airport to get the ferry booking.";
    return "\ud83d\udd12 Locked \u00b7 the <b>" + name + "</b> isn\u2019t on the evidence board yet.";
  }
  function lockOf(a) { if (a.needs && !(S.unlocked || {})[a.needs]) return "needs"; if (a.pm && S.meters.capital < a.pm) return "pm"; if (a.risk === "high" && svcLow()) return "svc"; return ""; }
  const morale = function (k) { const l = S.loyal[k]; return l >= 5 ? "Loyal" : l >= 3 ? "Steady" : l >= 2 ? "Wavering" : "Bitter"; };
  function hoursFor(k, a, kitId) { return Math.max(1, HRS[a.risk] - (AG(k).quirk === "quick" ? 1 : 0) + (kitId ? D.KIT[kitId].hours || 0 : 0) + (window.OPS && OPS.hours ? OPS.hours() : 0)); }

  // one officer: face, name, one clear strength. The stat bars live in their file (tap File).
  function strengthOf(k) { const a = AG(k); return a.strength || a.quirkTxt || a.role; }
  function vetOf(k) { return (S.vet && S.vet[k]) || 0; }
  function agentCard(k, extra, sel, disabled, attr) {
    const a = AG(k), st = S.stress[k], v = vetOf(k);
    return '<div class="ocard"><button class="card agent slim' + " dossier-o c-" + condOf(k) + (sel ? " sel" : "") + (disabled ? " used" : "") + '" ' + attr + '="' + k + '" aria-label="' + esc(a.name + (a.code ? ", " + a.code : "") + ", " + CONDW[condOf(k)] + (S.used[k] ? ", in the field" : "") + ". " + strengthOf(k) + (sel ? ". Selected" : "")) + '">' + face(k) + '<div style="flex:1;min-width:0"><div class="nm">' + esc(a.name) + (S.used[k] ? " \u00b7 in the field" : "") + " " + condChip(k, "inline") + '</div><div class="str">\u2605 ' + esc(strengthOf(k)) + "</div>" + (v ? '<div class="vet">' + v + " operation" + (v > 1 ? "s" : "") + " closed \u00b7 +" + Math.min(12, v * 4) + "%</div>" : "") + (extra || "") + '</div></button><button type="button" class="filebtn" data-file="' + k + '" aria-label="Open ' + esc(a.name) + '\u2019s file">File</button></div>';
  }
  // trait badges: three per officer, at a glance
  function badges(k) { return '<div class="badges">' + traitsOf(k).map(function (t) { return '<span class="badge' + (t.v < 0 ? " neg" : "") + (t.grown ? " grown" : "") + '" title="' + esc(t.tx) + '">' + esc(t.n) + "</span>"; }).join("") + "</div>"; }
  // the odds dial: a brass gauge, the needle at the odds, the reasons underneath
  function dial(r, label) {
    const v = r ? r.odds : 0, ang = -90 + v * 1.8;
    const reasons = r ? r.parts.slice().sort(function (x, y) { return Math.abs(y[1]) - Math.abs(x[1]); }).slice(0, 4).map(function (p) { return '<span class="' + (p[1] > 0 ? "up" : "down") + '">' + (p[1] > 0 ? "+" : "\u2212") + Math.abs(p[1]) + " " + esc(p[0]) + "</span>"; }).join("") : '<span class="mute">' + (label || "Drag an officer onto the case") + "</span>";
    return '<div class="dial" id="dial" aria-live="polite"><svg viewBox="0 0 120 70" aria-hidden="true"><path d="M10 62 A50 50 0 0 1 110 62" class="arc"/><path d="M10 62 A50 50 0 0 1 35 18.7" class="arc bad"/><path d="M85 18.7 A50 50 0 0 1 110 62" class="arc good"/><g class="needle" style="transform:rotate(' + ang + 'deg)"><line x1="60" y1="62" x2="60" y2="18"/></g><circle cx="60" cy="62" r="5" class="hub"/></svg>' +
      '<div class="dv"><b id="dialv">' + (r ? v + "%" : "\u2014") + '</b><small>odds of success</small></div><div class="reasons" id="dialr">' + reasons + "</div></div>";
  }
  // the needle swings from where it was (with a little overshoot), the number counts, the reasons fade in
  function setDial(r, label) {
    const d = $("dial"); if (!d) return;
    const og = d.querySelector(".needle"), from = og ? og.style.transform : "", v0 = parseInt(($("dialv") || {}).textContent, 10);
    d.outerHTML = dial(r, label);
    const n = document.querySelector("#dial .needle"); if (!n) return;
    const to = n.style.transform, v1 = r ? r.odds : NaN;
    if (from && from !== to && !FEEL.reduce) { n.style.transition = "none"; n.style.transform = from; void n.getBoundingClientRect(); n.style.transition = ""; requestAnimationFrame(function () { n.style.transform = to; }); }
    const rs = $("dialr"); if (rs && !FEEL.reduce) rs.classList.add("fresh");
    if (!isNaN(v1) && v1 !== v0) {
      FEEL.buzz("dial");
      const b = $("dialv"), start = isNaN(v0) ? 0 : v0, t0 = performance.now();
      if (b && !FEEL.reduce) { const step = function (t) { const f = Math.min(1, (t - t0) / 550), e = 1 - Math.pow(1 - f, 3); if (!b.isConnected) return; b.textContent = Math.round(start + (v1 - start) * e) + "%"; if (f < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }
    }
  }
  function bestFor(id, k) { const i = recIdx(id, k); return i < 0 ? null : oddsParts(id, k, CASES()[id].approaches[i], null); }
  function officerTile(k, id) {
    const a = AG(k), fit = id && a.good.indexOf(id) >= 0, c = condOf(k);
    return '<div class="otile c-' + c + (fit ? " fit" : "") + '" data-a="' + k + '" role="button" tabindex="0" aria-label="Open ' + esc(a.name) + '\u2019s file. ' + CONDW[c] + '">' +
      '<span class="o-tab">' + esc((a.code || first(k)).toUpperCase()) + '</span><span class="o-photo">' + face(k) + '<span class="o-clip" aria-hidden="true"></span>' + condChip(k, "stamped") + "</span>" +
      '<div class="onm">' + esc(first(k)) + "</div>" + badges(k) +
      (fit ? '<div class="fit">\u2713 Right person</div>' : "") + '<button type="button" class="sendbtn" data-send="' + k + '" aria-label="Send ' + esc(a.name) + '">Send</button></div>';
  }

  // drag an officer's file onto the case (or just tap it). While a file is held over the case, the dial swings.
  function dragSend(id, onSend) {
    const zone = $("dropzone");
    document.querySelectorAll(".otile[data-a]").forEach(function (t) {
      const k = t.getAttribute("data-a");
      let st = null, ghost = null, over = false;
      const isOver = function (e) { const r = zone.getBoundingClientRect(); return e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom + 20; };
      const sb = t.querySelector(".sendbtn"); if (sb) sb.onclick = function (e) { e.stopPropagation(); FEEL.buzz("drop"); if (window.SFX && SFX.paper) SFX.paper(); onSend(k); };
      t.addEventListener("pointerdown", function (e) { if (e.target.closest(".sendbtn")) return; e.preventDefault(); st = [e.clientX, e.clientY]; setDial(bestFor(id, k)); try { t.setPointerCapture(e.pointerId); } catch (er) {} });
      t.addEventListener("pointermove", function (e) {
        if (!st) return; const dx = e.clientX - st[0], dy = e.clientY - st[1];
        if (!ghost && Math.hypot(dx, dy) > 10) { ghost = t.cloneNode(true); ghost.classList.add("ghost"); ghost.removeAttribute("data-a"); document.body.appendChild(ghost); t.classList.add("lifted"); if (window.SFX && SFX.paper) SFX.paper(); }
        if (ghost) { const r = t.getBoundingClientRect(); ghost.style.left = (r.left + dx) + "px"; ghost.style.top = (r.top + dy) + "px"; ghost.style.width = r.width + "px"; const o = isOver(e); if (o !== over) { over = o; zone.classList.toggle("hot", o); if (o) FEEL.buzz("tap"); } }
      });
      const end = function (e, cancel) {
        if (!st) return; const dragged = !!ghost, hit = dragged && !cancel && isOver(e); st = null; t._dragged = dragged;
        if (ghost) { ghost.remove(); ghost = null; } t.classList.remove("lifted"); zone.classList.remove("hot");
        if (cancel) return;
        if (!dragged) return; // a plain tap opens the file on click (below), so the tap can't land on the open file
        if (hit) { FEEL.buzz("drop"); if (window.SFX && SFX.paper) SFX.paper(); onSend(k); }
      };
      t.addEventListener("click", function (e) { if (e.target.closest(".sendbtn") || t._dragged) { t._dragged = false; return; } officerFile(k, function () { onSend(k); }); });
      t.addEventListener("dragstart", function (e) { e.preventDefault(); });
      t.addEventListener("pointerup", function (e) { end(e, false); });
      t.addEventListener("pointercancel", function (e) { end(e, true); });
      t.addEventListener("keydown", function (e) { if (e.target === t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); officerFile(k, function () { onSend(k); }); } });
    });
  }
  // the operation: the case on top, the officers' files in a tray below
  function pickAgent(id) {
    const s = CASES()[id];
    const free = S.roster.filter(function (k) { return !S.used[k]; }).sort(function (x, y) { return (AG(y).good.indexOf(id) >= 0) - (AG(x).good.indexOf(id) >= 0); }).slice(0, 3);
    const lt = late(id);
    render('<div data-screen="officer-pick"><div class="casefile manila" id="dropzone"><span class="cftab">CASE ' + esc(String(id).toUpperCase().slice(0, 6)) + '</span><span class="cfstamp">SECRET</span>' + chead(id) + '<div class="casehead"><div class="kicker">' + esc(s.where) + " \u00b7 by " + hh(dueOf(id)) + (lt ? " \u00b7 " + lt + "h LATE" : "") + '</div><h2>' + esc(s.title) + '</h2><p class="brief">' + esc(s.brief) + (id === "sabotage" ? " <strong>You\u2019re defending: " + (S.belief === "split" ? "both sites" : S.belief) + ".</strong>" : "") + '</p><p class="redline">Source: <span class="redact">\u2588\u2588\u2588\u2588\u2588\u2588</span> \u00b7 Ref <span class="redact">\u2588\u2588\u2588\u2588</span> \u00b7 Seen by C only</p><div class="dropme">Drop a file here</div></div></div>' + lesson(id, "agent") +
      dial(null) + '<h3 class="question">Who do you send?</h3><div class="otray">' + free.map(function (k) { return officerTile(k, id); }).join("") + '</div><button class="linkbtn" id="back">Back to the desk</button></div>',
      "Tap a file to read it. Tap Send, or drag the file onto the case, to send them.");
    dragSend(id, function (k) { approach(id, k); });
    $("back").onclick = briefing;
    MENU.coach("traits", "Each officer has <b>three traits</b>. Tap a file to read it. Tap <b>Send</b>, or drag the file onto the case, to send them.");
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
          (lk === "pm" ? '<div class="chips"><span class="chip risk-high">Needs No.10 trust ' + a.pm + " (now " + S.meters.capital + "/100)</span></div>" :
            lk === "svc" ? '<div class="chips"><span class="chip risk-high svclock">Won\u2019t go \u00b7 Service ' + svc() + "/100, needs " + SVC_LOW + '</span></div><div class="refuse">' + esc(first(k)) + ": \u201c" + REFUSE + "\u201d</div>" : locked ? '<div class="lockwhy">' + lockHint(a) + "</div>" :
            '<div class="chips"><span class="chip odds">' + oddsFor(id, k, a, kit) + '%</span><span class="chip time' + (ends > dueOf(id) ? " over" : "") + '">\u23f1 ' + h + "h</span>" + (a.pm ? '<span class="chip pmchip">No.10 signed off</span>' : "") + (flyOn() ? '<span class="chip fly">The team\u2019s flying +5%</span>' : "") + (i === rec ? '<span class="chip rec">\u2605 ' + first(k) + "\u2019s pick</span>" : sel === i ? '<span class="chip risk-high">Overrules ' + first(k) + "</span>" : "") + (S.day === 3 ? window.AH3.chips(id, k, a) : "") + "</div>") + "</button>";
      }).join("");
      const kits = Object.keys(D.KIT).map(function (key) {
        const n = S.kit[key] || 0, on = kit === key;
        return '<button class="kit' + (on ? " on" : "") + '" data-kit="' + key + '"' + (n ? "" : " disabled") + '><span class="ki">' + D.KIT[key].icon + '</span><span class="kn">' + D.KIT[key].name + '</span><span class="kt">' + D.KIT[key].txt + '</span><span class="ks">' + (on ? "Packed" : "\u00d7" + n) + "</span></button>";
      }).join("");
      const kitRow = S.day === 1 ? "" : '<button type="button" class="kittoggle" id="kitt" aria-expanded="' + kitOpen + '">\ud83e\uddf3 Kit: ' + (kit ? D.KIT[kit].name : "none packed") + ' <span>' + (kitOpen ? "Hide" : "Pack one") + "</span></button>" + (kitOpen ? '<div class="kits">' + kits + "</div>" : "");
      const a0 = s.approaches[sel];
      render('<div data-screen="approach"><div class="ash-note card slimnote">' + face(k) + '<div class="note"><div class="who">' + esc(AG(k).name) + " " + condChip(k, "inline") + '</div><span class="tx">' + (S.stress[k] >= 4 ? "I can do it, C. Just not the loud way. I\u2019m running on empty." : rec >= 0 ? "If it were me, I\u2019d go with \u2018" + esc(s.approaches[rec].t) + "\u2019." : "How do you want it played?") + "</span></div></div>" + lesson(id, "approach") +
        '<h3 class="question">How do they play it?</h3>' + opts + (S.day === 2 && window.AH2 && AH2.boardThen && s.approaches.some(function (a) { return lockOf(a) === "needs" && canUnlock(a); }) ? '<button type="button" class="btn ghost" id="toboard">\ud83d\udccc Open the evidence board</button>' : "") + kitRow + (window.OPS ? OPS.controls(id, k, a0) : "") + dial(oddsParts(id, k, a0, kit)) +
        '<div class="sticky-go"><button class="btn primary sendbtn" id="go">Send ' + esc(first(k)) + " \u00b7 " + esc(a0.t) + '</button></div><button class="linkbtn" id="back">Send someone else</button></div>',
        "Pick a plan. The dial shows the odds, and why.", drawn);
      if (!drawn && window.VOICE && s.approaches.some(function (x) { return lockOf(x) === "svc"; })) setTimeout(function () { VOICE.caption(AG(k).code || first(k), REFUSE); }, 300);
      drawn = true;
      document.querySelectorAll("[data-i]").forEach(function (b) { b.onclick = function () { sel = +b.getAttribute("data-i"); draw(); }; });
      if ($("toboard")) $("toboard").onclick = function () { AH2.boardThen(function () { approach(id, k); }); };
      document.querySelectorAll("[data-kit]").forEach(function (b) { b.onclick = function () { const key = b.getAttribute("data-kit"); kit = kit === key ? null : key; draw(); }; });
      if ($("kitt")) $("kitt").onclick = function () { kitOpen = !kitOpen; draw(); };
      if (window.OPS) OPS.bind(draw);
      $("go").onclick = function () { const g = $("go"); if (g.disabled) return; g.disabled = true; if (window.VOICE) VOICE.play("op_" + k + "_send" + (1 + Math.floor(rnd() * 3))); FEEL.slam("APPROVED", null, function () { (window.OPS ? OPS.run : resolve)(id, k, s.approaches[sel], kit); }); };
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

  // Batch M: Hold and Abort result cards say what the call itself cost and how the top bar moved, from the values applied
  // Batch O: on Hard the live-op call shows the odds in words, not a percentage (the same way Hard hides Ash's default)
  function oddsBand(p) { return p >= 75 ? "good odds" : p >= 55 ? "better than even" : p >= 45 ? "about even" : p >= 25 ? "poor odds" : "a long shot"; }
  function oddsTxt(p) { return S && S.diff === "hard" ? oddsBand(p) : p + "%"; }
  const sgn = function (n) { return n > 0 ? "+" + n : n < 0 ? "\u2212" + Math.abs(n) : "\u00b10"; };
  function opCallLine(op, nm, res, t0, v0) {
    if (!op.hold && !op.abort && !op.push) return "";
    const L = S.lastOp || {}, paid = L.paid || {};
    let what;
    // Batch O: Hold and Abort say the odds before and after the call
    const before = L.base != null ? oddsTxt(L.base) : null;
    if (op.abort) what = "<b>Your call: Abort.</b> " + (before ? "The odds were " + before + "; pulling out meant no roll at all. " : "") + "Pulling out cost No.10 trust " + sgn(paid.capital || 0) + ". " + esc(nm) + " walked home, and the case counts as lost.";
    else if (op.hold) what = "<b>Your call: Hold.</b> " + (before ? "The odds went from " + before + " to " + oddsTxt(L.odds) + " (" + sgn(op.mod || 0) + "%). " : "") + "Holding cost No.10 trust " + sgn(paid.capital || 0) + (res === "loss" ? ". " + esc(nm) + " was kept out of harm\u2019s way." : ". The trail cooled, but " + esc(nm) + " stayed safe.");
    else if (res === "loss") what = "<b>Your call: Push.</b> It added " + sgn(op.mod || 0) + "% to the odds (" + oddsTxt(L.odds) + "), and it failed. Pushing cost an extra Service " + sgn(paid.service || 0) + (L.burned ? ", and " + esc(nm) + "\u2019s cover is blown." : ", and " + esc(nm) + " came back wounded.");
    else what = "<b>Your call: Push.</b> It added " + sgn(op.mod || 0) + "% to the odds (" + oddsTxt(L.odds) + "). " + (res === "win" ? "It paid off: the plan\u2019s gains \u00d71.5." : "Only partly: no extra payoff.") + (L.tired ? " " + esc(nm) + " comes back tired." : "");
    return '<p class="opcall">' + what + "</p>";
  }
  function resolve(id, k, a, kitId, op) {
    if (S.done[id]) return; // a case closes once: a second tap while the result is showing changes nothing
    op = op || {};
    const t0 = score(S.meters.capital), v0 = svc(); // Batch M: the top bar before this case, for the Hold/Abort result line
    S.lastWhy = { id: id, k: k, fit: AG(k).good.indexOf(id) >= 0, rec: recIdx(id, k) === CASES()[id].approaches.indexOf(a), parts: oddsParts(id, k, a, kitId).parts.concat(op.mod ? [[op.push ? "Pushed on" : op.hold ? "Held: the trail cooled" : "Your call on the radio", op.mod]] : []).concat((op.push || op.hold) && driftOf(id, k) ? [["What was happening on the ground (Hard)", driftOf(id, k)]] : []) };
    const s = CASES()[id], kitD = op.abort ? { soft: true } : kitId ? D.KIT[kitId] : {}, raw = oddsFor(id, k, a, kitId), drift = op.push || op.hold ? driftOf(id, k) : 0, odds = Math.max(5, Math.min(95, raw + drift + (op.mod || 0))), hrs = hoursFor(k, a, kitId), r = rnd() * 100;
    if (flyOn()) S.flyDay = S.day; // the +5% is spent on the first plan sent today
    let res = r < odds * 0.7 ? "win" : r < odds ? "mixed" : "loss";
    if (op.abort) res = "loss";
    const wrongSite = id === "sabotage" && S.belief && S.belief !== D.TRUTH && S.belief !== "split";
    if (wrongSite) res = "loss"; // the wrong site: the real target goes dark whatever happens where we were
    if (window.__SPY_FORCE__) res = window.__SPY_FORCE__;
    if (kitId) S.kit[kitId]--;
    const st0 = S.stress[k], lo0 = S.loyal[k], over = recIdx(id, k) !== s.approaches.indexOf(a), worked = st0 >= 4;
    S.styles = S.styles || { low: 0, med: 0, high: 0 }; S.styles[a.risk]++;
    const planStress = kitD.calm || (AG(k).quirk === "steady" && a.risk === "high") ? 0 : a.stress;
    // Batch M: an abort is a clean exit, as the button says: the officer's stress and loyalty (and so the Service) don't move
    if (!op.abort) S.stress[k] = clamp5(S.stress[k] + planStress + (res === "loss" && !kitD.soft && !op.hold && !wrongSite ? 1 : res === "win" ? -1 : 0));
    if (!op.abort) S.loyal[k] = clamp5(S.loyal[k] + (res === "loss" ? -1 : res === "win" && a.risk === "low" ? 1 : 0) - (over ? 1 : 0) - (worked ? 1 : 0));
    let delta = a[res];
    if (op.push && res === "win") { delta = {}; Object.keys(a.win).forEach(function (m) { delta[m] = a.win[m] > 0 ? a.win[m] * OPT.push.winX : a.win[m]; }); } // pushed and won: the big payoff
    if (res === "loss" && kitD.soft) { delta = {}; Object.keys(a.loss).forEach(function (m) { delta[m] = Math.round(a.loss[m] / 2); }); }
    // Good tradecraft keeps the Service healthy: the right officer on the plan they recommend steadies it, a mismatch drains it.
    const fitK = AG(k).good.indexOf(id) >= 0, recK = !over;
    const craft = res === "loss" ? (fitK ? 0 : -6) : (fitK ? 1 : -4) + (recK ? 2 : 0);
    delta = Object.assign({}, delta); delta.service = (delta.service || 0) + craft;
    if (op.abort) delta = {}; // a clean exit: the Service holds steady, the case is simply lost
    const ch = apply(delta);
    // the price of the radio call, exactly as the button said
    const extra = op.abort ? { capital: OPT.abort.trust } : op.hold ? { capital: OPT.hold.trust } : op.push && res === "loss" ? { service: OPT.push.failService } : {};
    const paid = {};
    Object.keys(extra).forEach(function (m) { const b = S.meters[m] == null ? 55 : S.meters[m]; S.meters[m] = Math.max(0, Math.min(100, b + extra[m])); const d = S.meters[m] - b; paid[m] = d; if (d) ch[m] = (ch[m] || 0) + d; });
    const back = no10Back(res, ch);
    S.lastOp = op.push || op.hold || op.abort ? { choice: op.push ? "push" : op.hold ? "hold" : "abort", odds: odds, base: Math.max(5, Math.min(95, raw)), drift: drift, res: res, extra: extra, paid: paid, back: back } : null;
    S.done[id] = res; S.used[k] = true; S.sent = S.sent || {}; S.sent[k] = (S.sent[k] || 0) + 1; advance(hrs);
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
    if (S.day >= 4) note = (note + " " + window.AH4.afterCase(id, res)).trim();
    // the mole's slip: a small wrong detail in their debrief
    const slip = k === S.mole && S.accused !== S.mole && D.AGENTS[k] ? D.AGENTS[k].slip : "";
    S.heads.push(head); S.log.push({ id: id, k: k, res: res, appr: a.t + (kitId && D.KIT[kitId] ? " + " + D.KIT[kitId].name.toLowerCase() : ""), slip: !!slip, head: head, fit: fitK, rec: recK }); S.craft = (S.craft || []).concat([(fitK ? 0.7 : 0) + (recK ? 0.3 : 0)]);
    const nm = first(k);
    let line = { win: nm + " pulled it off. Clean. Nobody will ever know.", mixed: nm + " got it done, but not cleanly. There will be questions.", loss: "It went wrong. " + nm + " is out \u2014 just \u2014 and badly shaken." }[res];
    if (op.abort) line = "You pulled " + nm + " out before it closed in. The case is lost, but " + nm + " walked home.";
    if (wrongSite && !op.abort) line = nm + " watched " + S.belief.charAt(0).toUpperCase() + S.belief.slice(1) + " all night. Nothing came. The work was somewhere else.";
    // how the officer comes back: tired after a hard push, wounded after a loss, burned if a pushed loss went badly
    S.status = S.status || {}; const st1 = S.status[k];
    const burnRoll = window.__SPY_BURN__ != null ? window.__SPY_BURN__ : rnd();
    if (S.lastOp) { S.lastOp.burned = res === "loss" && op.push && burnRoll < OPT.push.burn; }
    if (res === "loss" && op.push && burnRoll < OPT.push.burn) { S.status[k] = "burned"; loseOfficer(k, "cover burned"); line += " Worse: " + nm + "\u2019s face is known now. Their cover is burned for good."; }
    else if (wrongSite) { /* nobody came to the site we guarded: nothing to be hurt by */ }
    else if (res === "loss" && op.hold) line += " Holding kept " + nm + " out of it. They came home in one piece.";
    else if (res === "loss" && !op.abort) S.status[k] = "wounded";
    else if (op.push) S.status[k] = S.status[k] === "wounded" ? "wounded" : "tired";
    else if (res === "win" && S.status[k] === "tired") delete S.status[k];
    if (S.status[k] && S.status[k] !== st1 && S.status[k] !== "burned") line += " " + nm + " comes back " + statusName(k).toLowerCase() + ".";
    if (res === "loss" && !op.hold && !op.abort && S.stress[k] >= 5 && S.status[k] !== "burned") { loseOfficer(k, "sent home"); line += " The doctor has signed " + nm + " off. They won\u2019t be back this week."; }
    if (id === "defector" && res !== "loss") S.defector = true;
    if (S.day === 1 && S.order.indexOf("sabotage") < 0) S.order.push("sabotage");
    meters(ch); ticker(); save("briefing"); FEEL.buzz(res === "loss" ? "loss" : "win");
    if (S.lastOp && op.push && res !== "loss") S.lastOp.tired = S.status[k] === "tired" && st1 !== "tired";
    const callLine = opCallLine(op, nm, res, t0, v0);
    const od = function (lab, a0, a1) { return a1 === a0 ? "" : '<span class="' + ((lab === "Stress") === (a1 > a0) ? "down" : "up") + '">' + lab + " " + a0 + "\u2192" + a1 + "</span>"; };
    // the evidence still first, then the write-up, read aloud by Ash after the officer's own line
    evidThen(id, res, head, function () {
      render('<div class="card outcome ' + res + '"><span class="stamp thud">' + { win: "CLOSED", mixed: "PARTIAL", loss: "FAILED" }[res] + "</span>" + vignette(id, res) + '<div class="ohead">' + face(k, res === "win" ? "happy" : res === "loss" ? "tense" : "") + "<h2>" + esc(s.title) + "</h2></div><p>" + esc(line) + (note ? " <strong>" + note + "</strong>" : "") + "</p>" +
        (slip ? '<p class="slip">From the debrief: <em>' + esc(slip) + "</em></p>" : "") + because(id, k, a.t, ch, res) + deltas(ch) + backLine(back) + callLine +
        '<div class="deltas officer">' + od("Stress", st0, S.stress[k]) + od("Loyalty", lo0, S.loyal[k]) + (over ? '<span class="down">Overruled</span>' : "") + (op.push ? '<span class="down">Pushed</span>' : "") + (op.abort ? '<span class="up">Pulled out</span>' : "") + (worked ? '<span class="down">Overworked</span>' : "") + "</div>" + headline(head) + "</div>" +
        '<p class="oddsline">' + (S.diff === "hard" && (op.push || op.hold) ? oddsBand(odds).replace(/^./, function (c) { return c.toUpperCase(); }) : odds + "% odds") + " \u00b7 took " + hrs + "h \u00b7 now " + hh(S.hour) + '</p><button class="btn primary" id="go">Back to the desk</button>',
        "The gauges moved. The papers noticed. " + nm + " will remember this.");
      if (window.SFX && SFX.sting) SFX.sting(res);
      if (window.VOICE && !op.abort) VOICE.play("op_" + k + "_" + (res === "win" ? "done" : res === "mixed" ? "part" : "hurt"));
      caseReadout(id, res);
      S.lastWhy = null; $("go").onclick = briefing;
      if (window.FUN) FUN.event("case", { id: id, k: k, res: res });
    });
    if (S.status && S.status[k] && S.status[k] !== "burned") MENU.coach("status", "Officers can come back <b>Tired</b> (\u22128%) or <b>Wounded</b> (\u221215%). It shows on their file and fades after a night\u2019s rest.");
  }

  // a non-officer case finishing (used by the mole accusation and Day 2 interrogations)
  // "Because you...": the one or two choices that moved this result, in plain words
  function becauseOne(p, k) {
    const lab = p[0], v = p[1], n = k ? first(k) : "", amt = " (" + (v > 0 ? "+" : "\u2212") + Math.abs(v) + "%)";
    if (lab === "Right for the job") return "you sent " + n + ", the right officer for this job" + amt;
    if (lab === "Late") return "the file sat on the desk past its deadline" + amt;
    if (lab === "Strained") return "you kept " + n + " working without rest" + amt;
    if (lab === "Stress") return n + " was carrying some stress" + amt;
    if (lab === "Loyal" || lab === "Wavering") {
      if (S.call && S.call.k === k) return (S.call.choice === "deny" ? "you denied " + n + " to No.10, and " + n + " remembers" : "you stood by " + n + " when No.10 rang") + amt;
      return (v > 0 ? n + " trusts you after this week" : n + " has doubts about you after earlier calls") + amt;
    }
    if (lab === "Experience") return n + " has done this before this week" + amt;
    if (lab.indexOf("Status") === 0) return "you sent " + n + " out " + statusName(k).toLowerCase() + amt;
    if (lab === "Earlier choices") return (S.day === 1 && S.pm0 === "free" ? "you asked the Prime Minister for a free hand" : S.day === 2 ? "of what you chose in Bath last night" : S.day === 3 ? "of what you chose at Harwich" : "of how you handled the desk earlier") + amt;
    if (lab === "Day 3 file") return "of what you chose earlier today" + amt;
    if (lab === "Kesk and the week so far") return "of how the week has gone against Kesk" + amt;
    if (lab === "Service") return (v > 0 ? "your Service is in good heart" : "your Service is stretched thin") + amt;
    if (lab === "Split teams") return "you split the teams between both sites" + amt;
    if (lab === "Wrong site") return "you believed the wrong report" + amt;
    if (lab === "Pushed on" || lab === "Your call on the radio") return "of your call on the radio" + amt;
    if (lab === "Held: the trail cooled") return "you held, and the trail cooled" + amt;
    if (Object.keys(D.KIT).some(function (x) { return D.KIT[x].name === lab; })) return "you packed the " + lab.toLowerCase() + amt;
    if (k && traitsOf(k).some(function (t) { return t.n === lab; })) return n + "\u2019s trait \u2018" + lab + "\u2019 counted" + amt;
    return "of " + lab.toLowerCase() + amt;
  }
  function because(id, k, appr, ch, res) {
    const w = S.lastWhy, out = [];
    if (w && w.id === id && w.k === k) w.parts.filter(function (p) { return Math.abs(p[1]) >= 4; }).sort(function (x, y) { return Math.abs(y[1]) - Math.abs(x[1]); }).slice(0, 2).forEach(function (p) { out.push(becauseOne(p, k)); });
    else if (appr) {
      const big = Object.keys(ch || {}).sort(function (x, y) { return Math.abs(ch[y]) - Math.abs(ch[x]); })[0];
      out.push("you went with \u201c" + esc(String(appr)) + "\u201d" + (big ? ", " + mname(big) + " moved " + (ch[big] > 0 ? "+" : "\u2212") + Math.abs(ch[big]) : ""));
    }
    if (!out.length) return "";
    S.because = (S.because || []).concat(out.slice(0, 1).map(function (t) { return { id: id, t: t, res: res }; })).slice(-8);
    return '<div class="because" aria-label="Why it went this way">' + out.map(function (t) { return "<p><b>Because</b> " + t + ".</p>"; }).join("") + "</div>";
  }
  // Batch L/M: in Act 2 the Prime Minister hears about every case you close (live ops and story cases alike)
  const NO10_BACK = { win: 3, mixed: 1 };
  function no10Back(res, ch) {
    if (S.day < 4 || !NO10_BACK[res]) return 0;
    const b = Math.min(NO10_BACK[res], 100 - S.meters.capital); if (b <= 0) return 0;
    S.meters.capital += b; ch.capital = (ch.capital || 0) + b; S.no10Back = (S.no10Back || 0) + b; return b;
  }
  const backLine = function (b) { return b ? '<p class="no10back">\u260e No.10 heard about it: <b>+' + b + " trust</b>. Closed cases win the Prime Minister back.</p>" : ""; };
  function finishCase(id, res, k, appr, head, ch, stampWord, body, imgHtml, hintTxt) {
    if (S.done[id]) return; // already closed today (a double tap during the evidence still)
    // Batch L: in Act 2 the Prime Minister hears about every case you close, so good work wins No.10 trust back
    const planCh = ch; ch = Object.assign({}, ch || {}); const back = no10Back(res, ch);
    S.done[id] = res; S.heads.push(head); S.log.push({ id: id, k: k, res: res, appr: appr, head: head, fit: S.lastWhy && S.lastWhy.id === id && S.lastWhy.k === k ? S.lastWhy.fit : null, rec: S.lastWhy && S.lastWhy.id === id && S.lastWhy.k === k ? S.lastWhy.rec : null });
    if (S.lastWhy && S.lastWhy.id === id && S.lastWhy.k === k) S.craft = (S.craft || []).concat([(S.lastWhy.fit ? 0.7 : 0) + (S.lastWhy.rec ? 0.3 : 0)]);
    meters(ch); ticker(); save("briefing"); FEEL.buzz(res === "loss" ? "loss" : "win");
    if (window.SFX && SFX.sting) SFX.sting(res);
    evidThen(id, res, head, function () {
    caseReadout(id, res);
    render('<div class="card outcome ' + res + '" id="case-result"><span class="stamp thud">' + stampWord + "</span>" + (imgHtml || "") + "<h2>" + esc(CASES()[id].title) + "</h2><p>" + body + "</p>" + because(id, k, appr, planCh, res) + deltas(ch) + backLine(back) + headline(head) + '</div><button class="btn primary" id="go">Back to the desk</button>', hintTxt || "");
    $("go").onclick = briefing;
    }, stampWord);
    S.lastWhy = null;
  }
  function evidThen(id, res, head, fn, word) { if (window.EVID && EVID.has(id)) EVID.show(id, res, head, fn, word); else fn(); }
  // Ash reads the short write-up: a line per case and result (case name and verdict only if a clip is missing)
  const CASE_VO = { defector: 1, mole: 1, leak: 1, sabotage: 1, courier: 1, safehouse: 1, exit: 1 };
  function caseReadout(id, res) {
    if (!window.VOICE) return;
    if (S.day <= 2 && CASE_VO[id]) return VOICE.play("case_" + id + "_" + res);
    const kk = id === "leak" && S.day === 4 ? "leak4" : id;
    if (VOICE.lines["case_" + kk + "_" + res]) return VOICE.play("case_" + kk + "_" + res);
    const t = "title_" + kk;
    if (VOICE.lines[t]) VOICE.seq([t, "verdict_" + res]); else VOICE.play("res_" + res + "_" + (1 + S.log.length % 3));
  }

  // ---------- the mole: accuse one of your own ----------
  function accuse(second) {
    let sel = null;
    const id = second ? "mole2" : "mole", s = CASES()[id];
    const draw = function () {
      const cards = S.roster.map(function (k) { return agentCard(k, "", sel === k, false, "data-m"); }).join("");
      render('<div class="card dossier">' + chead(second ? "mole2" : "mole") + LH + '<span class="stamp corner">EYES ONLY</span><div class="kicker">Albion House \u00b7 by ' + hh(dueOf(id)) + '</div><h2 style="margin-top:8px;padding-right:110px">' + (second ? "The mole, second chance" : "Someone inside is talking") + "</h2><p>" + esc(second ? "Somebody rang the Bath team\u2019s phone from the street outside this building last night. The mole is still here. One more try before they run." : s.brief) + "</p>" + (second ? "" : ghNote(s.brief)) +
        '<p class="clue"><b>What we know:</b> ' + esc(D.AGENTS[S.mole].clue) + (second ? " The porter, again: <b>" + esc(D.AGENTS[S.mole].look) + "</b>." : "") + "</p></div>" +
        (window.VOICE ? (VOICE.once("ash_accuse"), "") : "") + ash("Look at their file notes. Think about the porter, and anything odd in the debriefs. If you name the wrong one, we lose a good officer and the real one goes quiet.", true) + lesson("mole", "accuse") +
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
    if (S.done[id]) return; // one accusation per case
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
    S.call = { k: k, choice: null, at: S.hour, where: CASES()[last.id].where || "" }; save("briefing");
    const settle = function (sel, t) {
      let ch, head;
      if (sel === "deny") { ch = apply({ capital: 10, trust: 4, safety: -10 }); S.loyal[k] = clamp5(S.loyal[k] - 2); S.stress[k] = clamp5(S.stress[k] + 1); head = "No.10: \u2018no knowledge\u2019 of Briton in " + where + " photograph"; }
      else { ch = apply({ capital: -12, safety: 8 }); S.loyal[k] = clamp5(S.loyal[k] + 1); head = "PM refuses to discuss \u2018our people abroad\u2019; Varenians fume"; }
      S.call.choice = sel; S.heads.push(head); advance(1);
      if (!t && window.VOICE) VOICE.play("react_pm1_" + sel); // Batch Q: Hale answers out loud
      window.DESK.after(sel === "deny" ? "DENIED" : "STOOD BY", sel === "deny" ? "mixed" : "win", "The call from No.10", (t ? "You hesitate. Hale decides for you. " : "") + (sel === "deny" ? "\u201cThank you, C. The statement goes out within the hour.\u201d " + first(k) + " hears the statement on the radio in a hotel room in " + esc(where) + "." : "Hale is silent for a long moment. \u201cOn your head, C.\u201d " + first(k) + " is on the next flight home."), ch, head, k);
    };
    window.DESK.call({ id: "pm1", line: "NO.10 SWITCHBOARD \u00b7 SECURE LINE", img: "pm-stern", ring: "The Prime Minister for you, C.", who: "Eleanor Hale \u00b7 Prime Minister", say: "Tell her",
      text: "C. The Varenian ambassador is at the Foreign Office, shouting about a British spy. The Courier has a photograph of <b>one of yours</b>. I can tell the House we\u2019ve never heard of them, or stand by them and take the heat. Your call.", note: "The photograph is of " + AG(k).name + ", taken in " + esc(where) + ".",
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
  // The day's grade weighs what you achieved and how you played, not only the gauges:
  // No.10 trust 35%, Service 20%, cases closed 25%, tradecraft 20% (the right officer, on the plan they rated best).
  // Standard: picking at random lands around C; Easy adds a cushion.
  function gradeParts() {
    const v = S.meters, L = S.log || [], n = L.length;
    const rec = n ? L.reduce(function (t, l) { return t + (l.res === "win" ? 1 : l.res === "mixed" ? 0.5 : 0); }, 0) / n * 100 : 60;
    // tradecraft is pooled over the whole week: the right officer counts 70%, keeping to the plan they rate best 30%
    // (it's the default, so it's worth less). It starts from a sceptical 30%, worth one case, so a lucky pick can't buy an A.
    const W = S.craft || [];
    const craft = (W.reduce(function (t, x) { return t + x; }, 0) + 0.3) / (W.length + 1) * 100;
    return { trust: score(v.capital), service: svc(), record: Math.round(rec), craft: Math.round(craft), mood: ((v.mood == null ? 55 : v.mood) - 55) / 10, bonus: S.diff === "easy" ? 8 : 0 };
  }
  function gradeScore() { const g = gradeParts(); return g.trust * 0.35 + g.service * 0.2 + g.record * 0.25 + g.craft * 0.2 + g.mood + g.bonus; }
  // Above C needs tradecraft, not luck: on Standard and Hard an A needs 75%+ tradecraft and a B 60%+.
  function gradeOf() {
    const avg = gradeScore(); let g = avg >= 68 ? "A" : avg >= 60 ? "B" : avg >= 50 ? "C" : avg >= 40 ? "D" : "E";
    if (S.diff !== "easy") { const c = gradeParts().craft; if (g === "A" && c < 75) g = "B"; if (g === "B" && c < 60) g = "C"; }
    return g;
  }
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
      "<span class=\"hdr\">TO: C &nbsp;\u00b7&nbsp; FROM: ASHBY, ALBION HOUSE<br>HMG \u00b7 TOP SECRET \u00b7 UK EYES ONLY</span>C \u2014 Police in Bath report a man collapsed on a bench near the Circus. He is <b>Pieter Vass</b>, a former Grey House officer we resettled here under a new name in 2019. Alive, unconscious. The government laboratory has identified a Varenian compound code-named <b>PALE HOUR</b>. No.10 wants you at Downing Street by seven.<br><br>" + moleLine() + "<br><br>" + extra + "<br><br>\u2014 Ash</div></div>";
  }
  function summary() {
    const cineId = { 1: "bath", 2: "ferry", 3: "end3", 6: "end6" }[S.day];
    if (!S.ended && cineId && CINE.maybe(cineId, summary)) return;
    if (!S.ended) {
      remaining().forEach(function (id) { S.done[id] = "loss"; apply(PENALTY[id] || CASES()[id].pen); S.heads.push(CASES()[id].head.loss); S.log.push({ id: id, k: null, res: "loss", appr: "Left on the desk", head: CASES()[id].head.loss }); });
      S.hour = 24; S.ended = true;
      const lastH = S.day >= 4 ? window.AH4.lastHead() : S.day === 3 ? window.AH3.lastHead() : S.day === 1 ? "Police seal off Bath street; man taken ill" : S.done.exit === "win" ? "Harwich ferry delayed by police operation" : "Ferry leaves Harwich on time despite \u2018security alert\u2019";
      if (lastH && S.heads.indexOf(lastH) < 0) S.heads.push(lastH); // the night's headline, unless a case already printed it
      if (window.SFX) { SFX.chime(12); setTimeout(function () { SFX.tele(); }, 1500); }
      if (S.day === 1) { store.set(TIPS_DONE, "1"); store.set(DAY2, JSON.stringify({ v: 1, seed: seed, S: day2State() })); }
      if (S.day === 2) store.set(DAY3, JSON.stringify({ v: 1, seed: seed, S: day3State() }));
      if (S.day >= 3 && S.day < 6) store.set(DAYK[S.day + 1], JSON.stringify({ v: 1, seed: seed, S: actState(S.day + 1) }));
    }
    meters(); ticker(); save("summary");
    const grade = gradeOf();
    S.finished = grade;
    if (S.day === 6 && window.AH4 && AH4.ending) recordEnding(AH4.ending());
    if (window.FUN) FUN.event("day");
    // the order at the end of every day: the full front page with the news bulletin first, then this report
    if (S.paperDay !== S.day) return paper({ first: true });
    const verdict = S.day === 6 && window.AH4 && AH4.ending ? END6_LETTER[AH4.ending()] : { A: "The Prime Minister is pleased, which worries Ash.", B: "Solid work, C. A few cracks; nothing that shows.", C: "You held the line, just. No.10 would like a word.", D: "A rough day. Your officers noticed.", E: "A bad day. Fleet Street smells blood." }[grade];
    render('<div data-screen="summary" data-music="' + (/[DE]/.test(grade) ? "tense" : "jazz") + '"></div><div class="card dossier" style="text-align:center"><span class="stamp corner">TOP SECRET</span>' + LH + '<div class="kicker">Day ' + S.day + " \u00b7 From C to the Prime Minister \u00b7 10 Downing Street</div><div class=\"grade\">" + grade + '</div><p style="font-size:17px;color:var(--paper-ink)"><strong>' + verdict + "</strong></p>" +
      (S.day === 5 && window.AH4 && AH4.interceptClue ? AH4.interceptClue() : "") + (S.day === 6 && window.AH4 && AH4.knightGap ? '<p class="knightgap">' + AH4.knightGap() + "</p>" : "") +
      (function () { const g = gradeParts(); return '<p class="gradeparts">Graded on: No.10 trust and Service (top bar) \u00b7 cases closed <b>' + g.record + "%</b> \u00b7 tradecraft <b>" + g.craft + "%</b>" + (g.bonus ? " \u00b7 Easy +" + g.bonus : "") + (S.diff !== "easy" && g.craft < 75 ? '<br><small>An A needs 75% tradecraft over the week, a B 60%: the right officer, on the plan they rate best.</small>' : "") + "</p>"; })() + (window.FUN ? FUN.medalHTML(S) : "") +
      '<ul class="log" style="text-align:left">' + S.log.map(function (l) {
        const s = CASES()[l.id];
        return "<li>" + (l.k ? '<img class="portrait" src="' + pic(AG(l.k).img) + '" alt="">' : '<span class="portrait dash">\u2014</span>') +
          "<span><b>" + esc(s.title) + '</b><br><span class="how">' + esc(l.appr) + (l.k && s.kind !== "accuse" ? " \u00b7 " + first(l.k) : "") + '</span></span><span class="r ' + l.res + '">' + { win: "CLOSED", mixed: "PARTIAL", loss: "FAILED" }[l.res] + "</span></li>";
      }).join("") + (S.call && S.day === 1 ? '<li><span class="portrait dash">\u260e</span><span><b>The call from No.10</b><br><span class="how">' + (S.call.choice === "deny" ? "Denied " : "Stood by ") + first(S.call.k) + "</span></span><span></span></li>" : "") + "</ul></div>" +
      nightPaper() + (window.ENDINGS && ENDINGS.current() ? '<button class="btn primary epibtn" id="epibtn">\u25b6 Epilogue \u00b7 ' + esc((window.REPLAY ? REPLAY.NAMES : {})[ENDINGS.current()] || "") + "</button>" : "") +
      (S.day === 1 ? day1Flash() : S.day >= 4 ? window.AH4.flash() : S.day === 3 ? window.AH3.flash() : window.AH2.flash()) +
      (S.day === 1 ? '<button class="btn primary" id="day2">Begin Day 2 \u00b7 Pale Hour</button>' : S.day === 2 ? '<button class="btn primary" id="day3">Begin Day 3 \u00b7 The Green Coat</button>' : S.day < 6 ? '<button class="btn primary" id="daynext">' + (S.day === 3 ? "Begin Act 2 \u00b7 Day 4 \u00b7 " : "Begin Day " + (S.day + 1) + " \u00b7 ") + window.AH4.NAMEOF[S.day + 1] + "</button>" : "") +
      '<button class="btn ' + (S.day < 6 ? "ghost" : "primary") + '" id="paperbtn">Read tomorrow\u2019s front page</button><button class="btn ghost" id="again">New game</button>',
      S.day === 1 ? "To be continued. Day 2 starts at eight." : S.day === 2 ? "To be continued. Day 3 starts at eight." : S.day < 6 ? "To be continued. Day " + (S.day + 1) + " starts at eight." : "The end of Act 2. The spymaster has gone home, one way or another.");
    $("again").onclick = function () { store.del(SAVE); difficulty(); };
    $("paperbtn").onclick = function () { FEEL.tearThen($("flash"), function () { paper({ back: summary }); }); };
    if ($("epibtn")) $("epibtn").onclick = function () { if (window.VOICE) VOICE.stop(); ENDINGS.play(ENDINGS.current(), true); };
    if ($("day2")) $("day2").onclick = function () { no10Night(function () { FEEL.tearThen($("flash"), function () { restore(loadJSON(DAY2)); save("briefing"); if (S.diffAsked) window.AH2.briefingIntro(); else diffAfterDay1(function () { store.set(DAY2, JSON.stringify({ v: 1, seed: seed, S: S })); window.AH2.briefingIntro(); }); }); }); };
    if ($("day3")) $("day3").onclick = function () { no10Night(function () { FEEL.tearThen($("flash"), function () { restore(loadJSON(DAY3)); save("briefing"); window.AH3.briefingIntro(); }); }); };
    if ($("daynext")) $("daynext").onclick = function () { no10Night(function () { const nx = DAYK[S.day + 1]; FEEL.tearThen($("flash"), function () { restore(loadJSON(nx)); save("briefing"); window.AH4.briefingIntro(); }); }); };
    // the bulletin played over the front page; the report gets Ash's verdict on the day (subtitled)
    // Ash reads the report aloud, short version, while the full text shows: the grade, then her FLASH telegram
    setTimeout(function () { if (window.VOICE && $("flash") && S.readOut !== S.day) { S.readOut = S.day; VOICE.seq(S.flashSaid === S.day ? [reportLine(grade)] : [reportLine(grade), bulletinLine()]); } }, 900);
  }
  // Batch O: each finished game's ending, newest first (kept to 10; the title shows the last 3). Once per game.
  const ENDS = "albion-game-endings"; // not "albion-endings": the epilogue collection (endings.js, replay.js) owns that key
  function recordEnding(e) {
    if (S.endSaved) return; S.endSaved = true;
    const raw = readJ(ENDS), list = Array.isArray(raw) ? raw : [], d = new Date();
    list.unshift({ e: e, d: S.diff, at: d.getDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()] });
    store.set(ENDS, JSON.stringify(list.slice(0, 10))); save("summary");
  }
  // Batch P: one place for endings. The Endings button on the title carries the last three games; the Endings screen
  // lists every saved game (up to 10) above the collection of epilogues.
  const SHORT_END = { knight: "Knighted", quiet: "Quiet exit", scandal: "Front page", resign: "Resigned" }, DIFFW = { easy: "Easy", standard: "Standard", hard: "Hard" };
  function pastGames() { const raw = readJ(ENDS); return Array.isArray(raw) ? raw : []; }
  function endingsHTML() {
    const list = pastGames().slice(0, 3); if (!list.length) return "";
    return '<small class="lastends">Last games: ' + list.map(function (x) { return '<b class="endpill e-' + x.e + '">' + esc(SHORT_END[x.e] || x.e) + "</b>"; }).join(" \u00b7 ") + "</small>";
  }
  function pastGamesHTML() {
    const list = pastGames();
    return '<h3 class="pasth">Your past games</h3>' + (list.length ? '<ol class="pastgames">' + list.map(function (x) { const en = window.AH4 && AH4.END[x.e]; return '<li class="e-' + x.e + '"><b>' + esc(en ? en.name : x.e) + "</b><span>" + esc((DIFFW[x.d] || "Standard") + " \u00b7 " + (x.at || "")) + "</span></li>"; }).join("") + "</ol>" : '<p class="fine">Finish Day 6 and your ending is kept here.</p>');
  }
  // Batch L: on Day 6 the letter and Ash's read-out follow the ending, never the day grade, so a resignation is never "held the line"
  const END6_LETTER = { knight: "The Prime Minister is delighted, and there is talk of the Palace. Don\u2019t let it go to your head.", quiet: "The street is quiet, and Kesk has flown home. The Prime Minister says that will do. From her, that\u2019s praise.", scandal: "It\u2019s all over the papers. The Prime Minister is furious, but you still have the chair.", resign: "The Prime Minister has asked for your resignation letter by Friday. Ash says it\u2019s been an honour." };
  function reportLine(g) { if (S.day === 6 && window.AH4 && AH4.ending) return "rep6_" + AH4.ending(); return "rep_" + (/[A-E]/.test(g) ? g : "C"); }
  function bulletinLine() {
    if (S.day === 1) return S.defector ? "flash_d1_def" : "flash_d1_nodef";
    if (S.day === 2) return "flash_d2_" + (S.done.exit || "loss");
    if (S.day === 3) return "flash_d3_" + window.AH3.ending();
    if (S.day === 4) return "flash_d4";
    if (S.day === 5) return S.done.swap === "loss" || !S.done.swap ? "flash_d5_loss" : "flash_d5_win";
    return "flash_d6_" + window.AH4.ending();
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
    return no10Flag(n);
  }

  // Day 3 begins from the end of Day 2, carrying the flags forward
  function day3State() {
    const n = JSON.parse(JSON.stringify(S));
    n.days = n.days || {}; n.days[2] = { grade: gradeOf(), exit: S.done.exit || "loss", mole: moleText() };
    n.day = 3; n.hour = 8; n.used = {}; n.status = rest(n.status); n.log = []; n.done = {}; n.ended = false; n.chimed = false; n.screen = "briefing"; n.tips = false; n.finished = null;
    n.order = ["york", "tail", "cable", "exfil"]; n.kit = Object.assign({}, diff().kit); n.seenIntro = false; n.letters = {}; n.riskSeen = {}; n.deal = null;
    n.heads = S.heads.slice(-2).concat(["Mystery of the woman in green deepens"]);
    n.roster.forEach(function (k) { n.stress[k] = clamp5(n.stress[k] - 1); });
    { const tired = n.roster.filter(function (k) { return n.stress[k] >= 4; }).length; n.meters.service = Math.max(0, Math.min(100, n.meters.service + (tired ? -3 * tired : 6))); } // rested officers steady the Service overnight
    window.AH3.prep(n);
    return no10Flag(n);
  }

  // Days 4-6 begin from the end of the day before, carrying every flag forward
  function actState(d) {
    const n = JSON.parse(JSON.stringify(S));
    n.days = n.days || {}; n.days[S.day] = Object.assign({ grade: gradeOf() }, window.AH4.record(S));
    n.day = d; n.hour = 8; n.used = {}; n.status = rest(n.status); n.log = []; n.done = {}; n.ended = false; n.chimed = false; n.screen = "briefing"; n.tips = false; n.finished = null;
    n.order = window.AH4.ORDER[d].slice(); n.kit = Object.assign({}, diff().kit); n.seenIntro = false; n.letters = {}; n.riskSeen = {}; n.bridgeSeen = false;
    n.heads = S.heads.slice(-2).concat([{ 4: "Varenian trade delegation arrives in Manchester", 5: "Briton \u2018detained\u2019 at Kessgrad airport", 6: "Tractor firm boss in London for talks" }[d]]);
    n.roster.forEach(function (k) { n.stress[k] = clamp5(n.stress[k] - (d === 4 ? 3 : 1)); });
    { const tired = n.roster.filter(function (k) { return n.stress[k] >= 4; }).length; n.meters.service = Math.max(0, Math.min(100, n.meters.service + (tired ? -3 * tired : 6))); }
    window.AH4.prep(n);
    return no10Flag(n);
  }

  // ---------- the shareable front page ----------
  function paperData() {
    const calls = S.log.map(function (l) { const s = CASES()[l.id]; return { t: s.title, how: l.appr + (l.k && s.kind !== "accuse" ? " (" + first(l.k) + ")" : ""), r: { win: "Closed", mixed: "Partial", loss: "Failed" }[l.res] }; });
    if (S.call && S.day === 1) calls.push({ t: "The call from No.10", how: (S.call.choice === "deny" ? "Denied " : "Stood by ") + first(S.call.k), r: S.call.choice === "deny" ? "Denied" : "Stood by" });
    const d = { grade: gradeOf(), calls: calls, mole: moleText(), caught: moleCaught(), day: S.day, side: S.heads.filter(function (h) { return h.indexOf("Bath") < 0; }).slice(-3) };
    if (S.day >= 2) { const p = S.day >= 4 ? window.AH4.paperLead() : S.day === 3 ? window.AH3.paperLead() : window.AH2.paperLead(); d.lead = p.lead; d.sub = p.sub; }
    if (S.day >= 4) { const b = window.AH4.banner(); d.mole = b.t; d.caught = b.ok; }
    if (S.day === 1) { d.lead = "MAN FIGHTS FOR LIFE AFTER BATH BENCH COLLAPSE"; d.sub = "Former foreign official found near the Circus \u00b7 Police cordon overnight \u00b7 Downing Street \u2018monitoring\u2019"; }
    return d;
  }
  // tonight's front page, on the summary itself: every story is one of your choices
  function choiceText(l) {
    if (l.appr === "Left on the desk") return "you left it on the desk";
    if (l.appr === "Taken by No.10") return "No.10 took it off your desk";
    const s = CASES()[l.id] || {};
    if (l.k && s.kind !== "accuse") return "you sent " + first(l.k) + " \u00b7 " + String(l.appr).toLowerCase();
    return "you chose \u201c" + l.appr + "\u201d";
  }
  function nightPaper() {
    const d = paperData(), items = S.log.filter(function (l) { return l.head; });
    const pick = items.filter(function (l) { return l.res !== "mixed"; }).concat(items.filter(function (l) { return l.res === "mixed"; })).slice(0, 3);
    if (S.call && S.day === 1) pick.push({ head: S.call.choice === "deny" ? "No.10 \u2018reassured\u2019 after spy chief names officer" : "Spy chief defies Downing Street over leak", call: 1, res: S.call.choice === "deny" ? "loss" : "win" });
    return '<div class="nightpaper" id="nightpaper" aria-label="Tomorrow\u2019s front page"><div class="np-mast">The London Evening Bugle</div><div class="np-date"><span>LATE FINAL</span><span>' + (d.day >= 4 ? window.AH4.DAYWORD[d.day] : d.day === 3 ? "Friday" : d.day === 2 ? "Thursday" : "Wednesday") + '</span><span>fiction</span></div>' +
      '<h3 class="np-lead">' + esc(d.lead) + '</h3><ul class="np-items">' + pick.map(function (l) {
        return '<li class="' + l.res + '"><b>' + esc(l.head) + "</b><i>Because " + esc(l.call ? (S.call.choice === "deny" ? "you denied " : "you stood by ") + first(S.call.k) : choiceText(l)) + ".</i></li>"; }).join("") + "</ul></div>";
  }
  // the radio bulletin read over the front page: one per day, one per ending
  function bulletinId() { if (S.day >= 4) return window.AH4.bulletinId(); if (S.day === 1) return "bulletin_day1"; if (S.day === 2) return S.done.exit === "win" ? "bulletin_day2_win" : "bulletin_day2_lose"; if (S.deal === "deal") return "bulletin_end_traded"; return "bulletin_end_" + ({ win: "win", mixed: "mixed" }[S.done.exfil] || "loss"); }
  function paper(opts) {
    opts = opts || {};
    const d = paperData();
    chrome(true); save("summary");
    setTimeout(function () { if (window.VOICE) VOICE.play(bulletinId()); }, 700);
    render('<div class="frontpage" id="paper"><div class="mast">The London Evening Bugle</div><div class="dateline"><span>LATE FINAL</span><span>' + (d.day >= 4 ? window.AH4.DAYWORD[d.day] : d.day === 3 ? "Friday" : d.day === 2 ? "Thursday" : "Wednesday") + "</span><span>Price 2p \u00b7 fiction</span></div>" +
      '<h1 class="lead">' + esc(d.lead) + '</h1><p class="subd">' + esc(d.sub) + "</p>" +
      '<div class="molebanner ' + (d.caught ? "caught" : "free") + '">' + esc(d.mole) + "</div>" +
      '<div class="cols"><div><h3>Spy chief\u2019s long day</h3><ul>' + d.calls.map(function (c) { return "<li><b>" + esc(c.t) + "</b> \u2014 " + esc(c.how) + " <i>" + esc(c.r) + "</i></li>"; }).join("") + '</ul></div><div class="gradebox"><small>Verdict</small><span>' + d.grade + "</span><small>Whitehall</small></div></div>" +
      '<div class="also"><b>Also inside:</b> ' + d.side.map(esc).join(" \u00b7 ") + "</div></div>" +
      '<button class="btn ghost paper-save" id="save">Save image</button><p class="saved" id="savedmsg" aria-live="polite"></p>' +
      '<div class="sticky-go">' + (opts.first ? '<button class="btn primary paper-back" id="toreport">Read the internal report \u2192</button>' : '<button class="btn primary paper-back" id="paperback">\u2190 Back</button>') + "</div>",
      opts.first ? "Tap the page or the button for the internal report." : "Save it to Photos, or go back.");
    $("save").onclick = savePaper;
    const leave = function (go) { if (window.VOICE && VOICE.hush) VOICE.hush(); go(); };
    if (opts.first) {
      const toReport = function () { if (S.paperDay === S.day) return; S.paperDay = S.day; save("summary"); leave(summary); };
      $("toreport").onclick = toReport;
      $("paper").addEventListener("click", toReport);
    } else $("paperback").onclick = function () { leave(opts.back || summary); };
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
    x.font = "24px " + mono; x.textAlign = "left"; x.fillText("LATE FINAL", 64, 198); x.textAlign = "center"; x.fillText(d.day >= 4 ? window.AH4.DAYWORD[d.day].toUpperCase() : d.day === 3 ? "FRIDAY" : d.day === 2 ? "THURSDAY" : "WEDNESDAY", W / 2, 198); x.textAlign = "right"; x.fillText("A WORK OF FICTION", W - 64, 198);
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
    if (window.NATIVE && NATIVE.canShareImage && NATIVE.canShareImage()) {
      msg.textContent = "In the share sheet, tap \u2018Save Image\u2019 to put it in Photos.";
      NATIVE.shareImage(c, "albion-house-front-page-day" + S.day + ".png", "The London Evening Bugle").then(function (r) {
        msg.textContent = r === "shared" ? "Done." : r === "cancelled" ? "Not saved." : "Couldn\u2019t open the share sheet. Try again.";
      });
      return;
    }
    c.toBlob(function (b) {
      const name = "albion-house-front-page.png";
      let file = null; try { file = new File([b], name, { type: "image/png" }); } catch (e) {}
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        if (window.__SAVE_LOG) __SAVE_LOG.push("webshare:" + name);
        navigator.share({ files: [file], title: "The London Evening Bugle", text: "My day as C at Albion House" }).then(function () { msg.textContent = "Shared."; }).catch(function () { msg.textContent = "Not shared."; });
      } else {
        if (window.__SAVE_LOG) __SAVE_LOG.push("download:" + name);
        const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); msg.textContent = "Saved as " + name + ".";
      }
    }, "image/png");
  }

  // ---------- mute and a light tap on every button ----------
  function muteBtn() { const b = $("mute"); if (!b || !window.SFX) return; b.textContent = SFX.muted ? "\uD83D\uDD07" : "\uD83D\uDD0A"; b.setAttribute("aria-pressed", SFX.muted ? "true" : "false"); }
  if ($("mute")) $("mute").onclick = function () { if (window.SFX) { SFX.unlock(); SFX.setMuted(!SFX.muted); } muteBtn(); };
  muteBtn();
  // haptics for every control live in native.js (one feel per action)

  // shared with day2.js
  window.AH = { caseReadout: caseReadout, HEADS: HEADS, D: D, $: $, esc: esc, pic: pic, rnd: function () { return rnd(); }, S: function () { return S; }, hh: hh, LH: LH, dueOf: dueOf, late: late, AG: AG, first: first,
    render: render, ash: ash, tip: tip, face: face, condOf: condOf, meters: meters, ticker: ticker, save: save, advance: advance, apply: apply, deltas: deltas, headline: headline,
    phone: phone, briefing: briefing, accuse: accuse, agentCard: agentCard, morale: morale, loseOfficer: loseOfficer, summary: summary, diff: diff, clamp5: clamp5, CASES: CASES, store: store, pips: pips, finishCase: finishCase, benchLine: benchLine, moleCaught: moleCaught, moleText: moleText, freeAgents: freeAgents, chrome: chrome, dossier: dossier, officerFile: officerFile, caseFile: caseFile, lesson: lesson, svc: svc, score: score, scores: scores, relabel: relabel, svcShown: svcShown, oddsTxt: oddsTxt, oddsBand: oddsBand, driftOf: driftOf, markBar: markBar, barText: barText, readJ: readJ, endingsHTML: endingsHTML, pastGames: pastGames, playDay: playDay, pastGamesHTML: pastGamesHTML, title: title, daySelect: daySelect, canReplayDay: function () { return !!loadJSON(DAY2); }, muteBtn: muteBtn, resumeScreen: resume, restartDay: restartDay, resolve: resolve, openCase: openCase, caseImg: function (id) { return "img/h-" + (HEADS[id] || "york") + ".jpg"; }, oddsFor: oddsFor, opTerms: opTerms, fold: fold, oddsParts: oddsParts, statusName: statusName, gradeOf: gradeOf, gradeScore: gradeScore, gradeParts: gradeParts, fresh: function (p, t) { fresh(p, t); }, FAST: FAST, svcLow: svcLow, flyOn: flyOn, no10Took: no10Took, NO10_TAKE: NO10_TAKE };

  fresh();
  if (/[?&]trailer=1/.test(location.search)) CINE.trailer();
  else title(); // the opening film now plays when you take the chair, not at launch
  window.__SPY__ = { state: function () { return S; }, fresh: function () { fresh(); title(); }, paperDataURL: function () { return drawPaper().toDataURL("image/png"); } };
})();
