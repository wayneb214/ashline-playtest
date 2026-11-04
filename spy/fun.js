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
    ["codebreaker", "Codebreaker", "Crack the Heath postcard first time."],
    ["eagle_eye", "Eagle eye", "Spot the tail in both photos."],
    ["lie_detector", "Lie detector", "Catch both lies in the York stories."],
    ["every_code", "Cracked every code", "Win all three hands-on cases in one game."],
    ["mole", "Mole catcher", "Name the mole correctly."],
    ["no_hurt", "Nobody hurt", "Finish the game with no officer wounded, burned or lost."],
    ["trust", "Never lost No.10", "Finish the game without No.10 trust ever dropping below 40/100."],
    ["home", "Home before midnight", "Bring the woman in the green coat home clean."]
  ];
  let got = {}; try { got = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
  const A = function () { return window.AH; };
  function toast(html, cls) {
    const t = document.createElement("div"); t.className = "toast " + (cls || ""); t.setAttribute("role", "status"); t.innerHTML = html;
    const host = document.getElementById("toasts") || (function () { const h = document.createElement("div"); h.id = "toasts"; document.body.appendChild(h); return h; })();
    host.appendChild(t); requestAnimationFrame(function () { t.classList.add("on"); });
    setTimeout(function () { t.classList.remove("on"); setTimeout(function () { t.remove(); }, 400); }, 3600);
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
    if (type === "mini" && d.res === "win") unlock({ cipher: "codebreaker", spot: "eagle_eye", lie: "lie_detector" }[d.id]);
    if (type === "day" && !f.days[S.day]) {
      f.days[S.day] = 1; const m = medal(S); f.gold[S.day] = m.m === "gold";
      if (!S.log.some(function (l) { return l.res === "loss"; })) unlock("clean_day");
      if (m.m === "gold") unlock("gold_day");
      if (A().moleCaught()) unlock("mole");
      if (S.day === 3) {
        if (f.gold[1] && f.gold[2] && f.gold[3]) unlock("all_gold");
        const mn = S.minis || {}; if (mn.cipher === "win" && mn.spot === "win" && mn.lie === "win") unlock("every_code");
        if (!f.hurt) unlock("no_hurt");
        if (f.minTrust >= 40) unlock("trust");
        if (S.done.exfil === "win") unlock("home");
      }
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
  const FUN = window.FUN = { ACH: ACH, event: event, track: track, medal: medal, medalHTML: medalHTML, screen: screen, toast: toast, unlock: unlock, got: function () { return got; },
    onUnlock: function (gcId) { const P = window.Capacitor && Capacitor.Plugins; if (P && P.GameCenter && P.GameCenter.reportAchievement) P.GameCenter.reportAchievement({ id: gcId, percent: 100 }).catch(function () {}); } };
})();
