/* fun.js: day medals, achievements (localStorage, Game Center ready), and the toast.
   Achievement ids map 1:1 to Game Center ids: GC_PREFIX + id. Report hook: FUN.onUnlock(id). */
(function () {
  "use strict";
  const KEY = "albion-ach", GC_PREFIX = "albionhouse.ach.";
  const ACH = [
    ["first_win", "First stamp", "Close a case with a clean SUCCESS."],
    ["clean_day", "Clean sheet", "Finish a day without a single failed case."],
    ["gold_day", "Gold standard", "Earn a Gold rating for a day."],
    ["all_gold", "Triple gold", "Gold on all three days of one game."],
    ["codebreaker", "Codebreaker", "Crack Kesk\u2019s postcard first time."],
    ["eagle_eye", "Eagle eye", "Spot the watcher in both photos."],
    ["lie_detector", "Lie detector", "Catch both lies in the York stories."],
    ["every_code", "Cracked every code", "Win all three hands-on puzzles in one game."],
    ["mole", "Mole catcher", "Name the mole correctly."],
    ["no_hurt", "Nobody hurt", "Finish the game with no officer wounded, burned or lost."],
    ["trust", "Never lost No.10", "Finish the game without No.10 trust ever dropping below 40/100."],
    ["home", "Home before midnight", "Bring the woman in the green coat home clean."],
    ["leak", "Who showed him the door", "Find the Day 4 leak."],
    ["bridge", "Across the bridge", "Bring your held officer home clean on Day 5."],
    ["knight", "Knighted in silence", "Earn the best ending of Act 2."],
    ["six", "The whole week", "Finish all six days of one game."]
  ];
  let got = {}; try { got = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
  const A = function () { return window.AH; };
  // One pop-up at a time: toasts queue, wait while a cutscene, sheet or coach mark is up, and dock over the ticker
  // (the one band with nothing to tap), so they never cover the report or a control.
  const TQ = []; let tBusy = false;
  const blocked = function () { return document.body.classList.contains("in-cine") || !!document.querySelector(".cine, .cine-gate, .sheet-bg, .coach, .epi"); };
  function toast(html, cls) { if (TQ.some(function (q) { return q[0] === html; })) return; TQ.push([html, cls]); pump(); }
  function pump() {
    if (tBusy || !TQ.length) return;
    if (blocked()) { setTimeout(pump, 600); return; }
    tBusy = true; const q = TQ.shift();
    const t = document.createElement("div"); t.className = "toast " + (q[1] || ""); t.setAttribute("role", "status"); t.innerHTML = q[0];
    const host = document.getElementById("toasts") || (function () { const h = document.createElement("div"); h.id = "toasts"; document.body.appendChild(h); return h; })();
    // dock inside the top bar, right of the menu button: only the meters sit there, and nothing there is tappable
    const hud = document.getElementById("hud"), mb = document.getElementById("menu"), m = mb && !hud.classList.contains("hidden") ? mb.getBoundingClientRect() : null;
    if (m && m.width) { const hr = hud.getBoundingClientRect(); host.style.top = Math.max(2, m.top - 4) + "px"; host.style.left = Math.round(m.right + 8) + "px"; host.style.right = "8px"; host.style.maxWidth = "none"; host.style.margin = "0"; host.classList.add("docked"); host.style.setProperty("--band", Math.round(hr.bottom - m.top + 2) + "px"); }
    else { const tk = document.querySelector(".ticker"), r = tk && tk.getBoundingClientRect(); host.style.top = (r && r.height ? Math.max(0, r.top) : 8) + "px"; host.style.left = host.style.right = host.style.maxWidth = host.style.margin = ""; host.classList.remove("docked"); }
    host.appendChild(t); requestAnimationFrame(function () { t.classList.add("on"); });
    setTimeout(function () { t.classList.remove("on"); setTimeout(function () { t.remove(); tBusy = false; setTimeout(pump, 250); }, 350); }, q[1] === "ach" ? 3200 : 2800);
  }
  function askReview() {
    if (window.REVIEW && REVIEW.requestReview && !document.body.classList.contains("in-cine")) REVIEW.requestReview(); // once ever, native only
  }
  function unlock(id) {
    if (got[id]) return; const a = ACH.filter(function (x) { return x[0] === id; })[0]; if (!a) return;
    got[id] = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(got)); } catch (e) {}
    toast('<span class="tk">\u2605 Achievement</span><b>' + a[1] + "</b><small>" + a[2] + "</small>", "ach");
    if (window.SFX && SFX.stamp) setTimeout(SFX.stamp, 150);
    FUN.onUnlock(GC_PREFIX + id);
  }
  // per-game record, carried through saves in S.fun
  function rec(S) { S.fun = S.fun || { minTrust: S.meters.capital, gold: {}, days: {} }; return S.fun; }
  function track(S) { const f = rec(S); f.minTrust = Math.min(f.minTrust == null ? 100 : f.minTrust, S.meters.capital); if (Object.keys(S.lost || {}).length || Object.keys(S.status || {}).some(function (k) { return S.status[k] === "wounded" || S.status[k] === "burned"; })) f.hurt = true; }
  // Gold / Silver / Bronze with the reason in words
  function medal(S) {
    const sc = Math.round((A().score(S.meters.capital) + A().svc()) / 2), log = S.log.filter(function (l) { return A().CASES()[l.id]; });
    const failed = log.filter(function (l) { return l.res === "loss"; }).length, won = log.filter(function (l) { return l.res === "win"; }).length;
    const avg = "Average score " + sc + "/100, " + won + " closed clean.";
    if (sc >= 62 && failed === 0) return { m: "gold", t: "Gold", why: "No case lost and strong gauges. " + avg };
    if (sc >= 48 && failed <= 1) return { m: "silver", t: "Silver", why: (failed ? "One case got away. " : "Nothing lost, but the gauges sag. ") + avg + " Gold: no failures and 62+." };
    return { m: "bronze", t: "Bronze", why: (failed > 1 ? failed + " cases failed. " : "The gauges are low. ") + avg + " Silver: one failure at most and 48+." };
  }
  function medalHTML(S) { const m = medal(S); return '<div class="medal ' + m.m + '"><span class="disc">' + m.t + '</span><p>' + m.why + "</p></div>"; }
  function event(type, d) {
    const S = A().S(); if (!S) return; const f = rec(S); track(S);
    if (type === "case" && d.res === "win") unlock("first_win");
    if (type === "mini" && d.res === "win") { unlock({ proof: "codebreaker", faces: "eagle_eye", lie: "lie_detector" }[d.id]); f.mwin = f.mwin || {}; f.mwin[d.id] = 1; if (f.mwin.proof && f.mwin.faces && f.mwin.lie) unlock("every_code"); }
    if (type === "day" && !f.days[S.day]) {
      f.days[S.day] = 1; const m = medal(S); f.gold[S.day] = m.m === "gold";
      if (!S.log.some(function (l) { return l.res === "loss"; })) unlock("clean_day");
      if (m.m === "gold") unlock("gold_day");
      if (A().moleCaught()) unlock("mole");
      if (S.day === 3) {
        if (window.REPLAY) REPLAY.found(S.deal === "deal" ? "traded" : S.done.exfil || "loss");
        if (f.gold[1] && f.gold[2] && f.gold[3]) unlock("all_gold");
        if (!f.hurt) unlock("no_hurt");
        if (f.minTrust >= 40) unlock("trust");
        if (S.done.exfil === "win") unlock("home");
        // ask for a rating once, after the Act 1 ending, and only after a good night (native plugin only; nothing on the web)
        if (S.deal !== "deal" && (S.done.exfil === "win" || S.done.exfil === "mixed")) setTimeout(askReview, 4000);
      }
      if (S.day === 6 && window.AH4) { const e = AH4.ending(); if (window.REPLAY) REPLAY.found("a2_" + e); if (window.NATIVE && A().gradeScore) NATIVE.gcScore(Math.round(A().gradeScore() * 100)); if (e === "knight") unlock("knight"); if (S.days && S.days[1] && S.days[5]) unlock("six"); }
    }
  }
  function screen(back) {
    const n = ACH.filter(function (a) { return got[a[0]]; }).length;
    MENU.sheet('<div class="kicker">Achievements \u00b7 ' + n + " of " + ACH.length + '</div><h2>Your record</h2><ul class="achs">' + ACH.map(function (a) {
      return '<li class="' + (got[a[0]] ? "got" : "") + '"><span class="ai" aria-hidden="true">' + (got[a[0]] ? "\u2605" : "\u2606") + "</span><span><b>" + a[1] + "</b><small>" + a[2] + "</small></span></li>"; }).join("") +
      '</ul><p class="fine">Saved on this device.</p><button class="btn primary" id="ach-back">Back</button>', "settings");
    if (back) { window.AH_PAUSED = true; document.body.classList.add("paused"); }
    document.getElementById("ach-back").onclick = function () { MENU.close(); if (back) back(); };
  }

  // ---------- officers who grow: XP from successes, a new trait at each threshold ----------
  const XPAT = [2, 5, 8];
  const GT = { nerves: { n: "Steady nerves", risk: "high", v: 6, tx: "Bold plans +6%" }, fleet: { n: "Old friends in Fleet Street", risk: "med", v: 6, tx: "Some-risk plans +6%" },
    eye: { n: "Sharp eye", risk: "low", v: 6, tx: "Careful plans +6%" }, ground: { n: "Knows the ground", all: true, v: 4, tx: "Every job +4%" } };
  const PATH = { macrae: ["fleet", "nerves", "ground"], pryce: ["eye", "ground", "nerves"], hartley: ["nerves", "fleet", "ground"], ada: ["eye", "fleet", "ground"], sam: ["ground", "nerves", "eye"], hollis: ["nerves", "ground", "eye"] };
  function traits(k) { const S = A().S(), base = A().D.TRAITS[k] || []; return base.concat(((S && S.grown && S.grown[k]) || []).map(function (g) { return Object.assign({ grown: true }, GT[g]); })); }
  function xp(k, res) {
    const S = A().S(), add = res === "win" ? 2 : res === "mixed" ? 1 : 0; if (!add) return;
    S.xp = S.xp || {}; S.grown = S.grown || {}; const before = S.xp[k] || 0; S.xp[k] = before + add;
    const lvl = XPAT.filter(function (t) { return S.xp[k] >= t; }).length, have = (S.grown[k] || []).length;
    if (lvl > have) { const g = (PATH[k] || PATH.sam)[have]; S.grown[k] = (S.grown[k] || []).concat([g]); S.promo = (S.promo || []).concat([[k, g]]); }
  }
  function xpLine(k) { const S = A().S(), x = (S.xp || {})[k] || 0, nx = XPAT.filter(function (t) { return t > x; })[0]; return "<p><b>Experience:</b> " + x + " XP" + (nx ? " \u00b7 next trait at " + nx + " XP" : " \u00b7 fully seasoned") + '</p><div class="xpbar"><i style="width:' + Math.min(100, x / 8 * 100) + '%"></i></div>'; }
  function promo() {
    const S = A().S(); if (!S.promo || !S.promo.length || document.getElementById("sheet")) return;
    const p = S.promo.shift(), k = p[0], t = GT[p[1]], ag = A().AG(k); A().save(S.screen || "briefing");
    MENU.sheet('<div class="promo"><div class="kicker">Promotion \u00b7 Albion House</div><img class="portrait" src="img/' + ag.img + '.jpg" alt=""><h2>' + A().esc(ag.name) + '</h2><p>Earned a new trait in the field:</p><span class="badge grown big">' + t.n + "</span><p class=\"fine\">" + t.tx + ". It shows on the odds dial when it counts.</p>" + '<button class="btn primary" id="promo-ok">Well done</button></div>', "promo-sheet");
    if (window.SFX && SFX.stamp) SFX.stamp(); FEEL.buzz("win");
    document.getElementById("promo-ok").onclick = function () { MENU.close(); promo(); };
    MENU.coach("promo", "Officers earn <b>XP</b> from successes. At 2, 5 and 8 XP they gain a new trait that lifts their odds.");
  }
  const FUN = window.FUN = { traits: traits, xp: xp, xpLine: xpLine, promo: promo, ACH: ACH, event: event, track: track, medal: medal, medalHTML: medalHTML, screen: screen, toast: toast, unlock: unlock, got: function () { return got; },
    onUnlock: function (gcId) { const P = window.Capacitor && Capacitor.Plugins; if (P && P.GameCenter && P.GameCenter.reportAchievement) P.GameCenter.reportAchievement({ id: gcId, percent: 100 }).catch(function () {}); } };
})();
