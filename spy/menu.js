/* Albion House menu: the ☰ pause menu, Settings, Help & FAQ, credits, confirm sheets and autosave.
   No Save button and no Exit button: the game saves itself, and "Title screen" is the way out. */
(function () {
  "use strict";
  const A = function () { return window.AH; };
  const $ = function (id) { return document.getElementById(id); };
  const inPlay = function () { return window.AH && !document.body.classList.contains("on-title") && !document.body.classList.contains("in-cine"); };

  // ---------- autosave: every tap in play, and whenever the app is hidden or closed ----------
  function autosave() { if (inPlay()) { const s = A().S(); if (s && s.screen) A().save(s.screen); } }
  document.addEventListener("click", function () { setTimeout(autosave, 0); }, true);
  document.addEventListener("visibilitychange", function () { if (document.hidden) autosave(); });
  window.addEventListener("pagehide", autosave);

  // ---------- a small modal sheet ----------
  // swaps the sheet only: going Pause > Settings must not un-pause the game or restart a held voice line
  function sheet(html, cls) {
    const old = $("sheet"); if (old) old.remove();
    const d = document.createElement("div"); d.id = "sheet"; d.className = "sheet-bg" + (cls ? " " + cls : ""); d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true");
    d.innerHTML = '<div class="sheet">' + html + "</div>"; document.body.appendChild(d);
    requestAnimationFrame(function () { d.classList.add("in"); });
    return d;
  }
  function close() { const d = $("sheet"); if (d) d.remove(); window.AH_PAUSED = false; document.body.classList.remove("paused"); if (window.VOICE && VOICE.unhold) VOICE.unhold(); }
  // extra (Batch O): an optional second way through, e.g. { t: "Back up, then start again", go: fn }
  function confirm(title, txt, yes, onYes, back, extra) {
    sheet('<h2>' + title + "</h2><p>" + txt + "</p>" + (extra ? '<button class="btn primary" id="cf-alt">' + extra.t + "</button>" : "") + '<button class="btn danger" id="cf-yes">' + yes + '</button><button class="btn ghost" id="cf-no">Cancel</button>');
    if (extra) $("cf-alt").onclick = function () { close(); extra.go(); };
    $("cf-yes").onclick = function () { close(); onYes(); };
    $("cf-no").onclick = function () { close(); if (back) back(); };
  }

  // ---------- the pause menu ----------
  function open() {
    window.AH_PAUSED = true; document.body.classList.add("paused");
    if (window.VOICE) VOICE.hold(); // paused mid-line: it carries on from the same word when you resume
    const m = window.SFX && SFX.muted;
    sheet('<div class="kicker">Paused \u00b7 Day ' + A().S().day + " \u00b7 " + A().hh(A().S().hour) + "</div><h2>Albion House</h2>" +
      '<button class="btn primary" id="mn-resume">Resume</button>' +
      '<button class="btn ghost" id="mn-sound">' + (m ? "\ud83d\udd07 Sound is off \u00b7 turn on" : "\ud83d\udd0a Sound is on \u00b7 turn off") + "</button>" +
      '<button class="btn ghost" id="mn-settings">Settings</button><button class="btn ghost" id="mn-help">Help &amp; FAQ</button>' + (window.FUN ? '<button class="btn ghost" id="mn-ach">\u2605 Achievements</button>' : "") + (window.REVIEW && REVIEW.canRate() && REVIEW.played() ? '<button class="btn ghost" id="mn-rate">\u2b50 Rate this game</button>' : "") +
      '<button class="btn ghost" id="mn-title">Title screen</button><button class="btn danger" id="mn-restart">Restart day</button>' +
      '<p class="fine">Your game saves itself after every move.</p>', "menu");
    window.AH_PAUSED = true; document.body.classList.add("paused");
    $("mn-resume").onclick = close;
    $("mn-sound").onclick = function () { if (window.SFX) { SFX.unlock(); SFX.setMuted(!SFX.muted); } A().muteBtn(); open(); };
    $("mn-settings").onclick = function () { settings(open); };
    $("mn-help").onclick = function () { help(open); };
    if ($("mn-ach")) $("mn-ach").onclick = function () { FUN.open(open); };
    if ($("mn-rate")) $("mn-rate").onclick = function () { REVIEW.openReviewPage(); };
    $("mn-title").onclick = function () { autosave(); close(); A().title(); };
    $("mn-restart").onclick = function () { confirm("Restart Day " + A().S().day + "?", "You go back to 08:00 this morning. Everything you did today is lost.", "Restart the day", A().restartDay, open); };
  }

  // ---------- settings ----------
  function slider(id, label) { const v = PREFS.get(id); return '<label class="sl"><span>' + label + '</span><input type="range" min="0" max="100" step="5" value="' + Math.round(v * 100) + '" data-vol="' + id + '" aria-label="' + label + ' volume"></label>'; }
  function seg(name, opts, cur) { return '<div class="seg" role="group">' + opts.map(function (o) { return '<button type="button" data-' + name + '="' + o[0] + '" aria-pressed="' + (String(cur) === String(o[0])) + '"' + (String(cur) === String(o[0]) ? ' class="on"' : "") + ">" + o[1] + "</button>"; }).join("") + "</div>"; }
  function settings(back) {
    const draw = function () {
      const rd = PREFS.get("reduce"), rdNow = rd == null ? "auto" : rd ? "on" : "off";
      sheet('<div class="kicker">Settings</div><h2>Sound</h2>' +
        seg("mode", [["all", "Music, voices &amp; effects"], ["nomusic", "No music"], ["off", "Off"]], window.SFX && SFX.muted ? "off" : PREFS.get("mode")) +
        slider("music", "Music") + slider("voice", "Voices") + slider("fx", "Effects &amp; taps") +
        (PREFS.canBuzz() ? "<h2>Haptics</h2>" + seg("hap", [["1", "On"], ["0", "Off"]], PREFS.get("haptics") ? "1" : "0") : "") +
        "<h2>Text size</h2>" + seg("ts", [["std", "Standard"], ["lg", "Larger"]], PREFS.get("text") === "lg" ? "lg" : "std") +
        '<p class="fine">Larger is the default. Standard is a little smaller, and never under 14px.</p>' +
        "<h2>Motion</h2>" + seg("rd", [["auto", "Device (" + (FEEL.deviceReduce ? "reduced" : "full") + ")"], ["off", "Full motion"], ["on", "Reduced"]], rdNow) +
        '<p class="fine">Reduced motion shows still paintings instead of moving cutscenes.</p>' +
        "<h2>Answer clocks</h2>" + seg("tmr", [["1", "On"], ["0", "Off"]], PREFS.get("timers") === false ? "0" : "1") +
        '<p class="fine">Off: phone calls and Ash\u2019s questions wait for you, with no countdown and no answer picked for you.</p>' +
        
        (window.REVIEW && REVIEW.rateHTML && REVIEW.played() && REVIEW.canRate() ? "<h2>Enjoying it?</h2>" + REVIEW.rateHTML("mn-rate") : "") + "<h2>Tips</h2>" + seg("tips", [["1", "Show tips"], ["0", "Hide tips"]], PREFS.get("tips") ? "1" : "0") + '<p class="fine">Tips switch back on with every new game, in case someone else is playing.</p>' +
        (document.body.classList.contains("on-title") && A().canReplayDay && A().canReplayDay() ? '<h2>Replay a day</h2><button class="btn ghost" id="st-days">Replay a day</button>' : "") +
        (window.CINE ? '<h2>Cutscenes</h2><button class="btn ghost" id="st-cine">Cutscenes and replays</button>' : "") +
        (window.HOWTO ? '<h2>How to play</h2><button class="btn ghost" id="st-howto">How to play</button>' : "") +
        '<h2>About</h2><button class="btn ghost" id="st-credits">Credits</button><p class="fine privacy">No accounts, no tracking. Saves stay on this device.</p>' +
        '<button class="btn primary" id="st-back">Done</button>', "settings");
      if (back === open) { window.AH_PAUSED = true; document.body.classList.add("paused"); }
      document.querySelectorAll("[data-vol]").forEach(function (r) { r.oninput = function () { PREFS.set(r.getAttribute("data-vol"), r.value / 100); }; r.onchange = function () { if (window.SFX) SFX.tick(1); }; });
      document.querySelectorAll("[data-mode]").forEach(function (b) { b.onclick = function () { const m = b.getAttribute("data-mode"); if (window.SFX) { SFX.unlock(); SFX.setMuted(m === "off"); } if (m !== "off") PREFS.set("mode", m); A().muteBtn(); draw(); }; });
      document.querySelectorAll("[data-hap]").forEach(function (b) { b.onclick = function () { PREFS.set("haptics", b.getAttribute("data-hap") === "1"); FEEL.buzz("stamp"); draw(); }; });
      document.querySelectorAll("[data-tmr]").forEach(function (b) { b.onclick = function () { PREFS.set("timers", b.getAttribute("data-tmr") === "1"); draw(); }; });
      document.querySelectorAll("[data-ts]").forEach(function (b) { b.onclick = function () { PREFS.set("textSet", true); PREFS.set("text", b.getAttribute("data-ts")); draw(); }; });
      document.querySelectorAll("[data-rd]").forEach(function (b) { b.onclick = function () { const v = b.getAttribute("data-rd"); PREFS.set("reduce", v === "auto" ? null : v === "on"); draw(); }; });
      if (window.REVIEW && REVIEW.bindRate) REVIEW.bindRate("mn-rate");
      document.querySelectorAll("[data-tips]").forEach(function (b) { b.onclick = function () { PREFS.set("tips", b.getAttribute("data-tips") === "1"); draw(); }; });
      if ($("st-cine")) $("st-cine").onclick = function () { const wasPlay = inPlay(), s = A().S(); close(); CINE.settings(function () { if (wasPlay) A().resumeScreen(); else A().title(); }); };
      $("st-credits").onclick = function () { credits(draw); };
      if ($("st-howto")) $("st-howto").onclick = function () { close(); HOWTO.show(function () { settings(back); }, false); };
      if ($("st-days")) $("st-days").onclick = function () { close(); A().daySelect(); };
      $("st-back").onclick = function () { close(); if (back) back(); };
    };
    draw();
  }
  function credits(back) {
    sheet('<div class="kicker">Credits</div><h2>Albion House</h2><p class="kicker">Spymaster</p><p>A work of fiction. Albion House, and every state, firm, service and person in it, is invented. Real places are used only as places.</p>' +
      "<p><b>Design, story and code:</b> Wayne Byrne.</p><p><b>Music and sound:</b> original, synthesised live in your device.</p>" +
      "<p><b>Voices:</b> made with Kokoro-82M (Apache 2.0) and Chatterbox (MIT). No real person\u2019s voice was cloned.</p>" +
      "<p><b>Paintings and cutscenes:</b> original artwork made for this game.</p>" +
      "<p><b>Fonts:</b> Cormorant Garamond (\u00a9 the Cormorant Project Authors), Courier Prime (\u00a9 the Courier Prime Project Authors) and IM Fell English SC (\u00a9 Igino Marini), used under the SIL Open Font License 1.1.</p>" +
      '<p class="fine privacy">No accounts, no tracking. Saves stay on this device.</p><button class="btn primary" id="cr-back">Back</button>', "settings");
    $("cr-back").onclick = function () { back(); };
  }
  const FAQ = [
    ["What am I doing?", "You are C, the new chief of Albion House. Each day brings a pile of cases. Open one, pick an officer, pick a plan, and live with the result."],
    ["What do the two gauges mean?", "<b>No.10 trust</b> is how far the Prime Minister backs you. It opens bold plans. <b>Service</b> is your officers\u2019 health, loyalty and cover. It lifts the odds of every plan."],
    ["How does Service work?", "The Service meter is the department\u2019s health. The top-bar Service adds how your officers feel: each officer above Steady loyalty lifts it, each one below drags it down, and stress over 3 costs it too. So a case can move the top bar even when its <b>Service</b> chip says something else. Rest tired officers, and send them on plans they rate, to keep it up.", "service"],
    ["Why did the clock jump?", "Every operation takes hours. Careful plans take longer. Each case has a deadline, and a case left too long is lost."],
    ["How do I save?", "You don\u2019t need to. The game saves after every move and when you leave the app. Continue from the title screen."],
    ["Can I quit?", "Open \u2630 and choose Title screen. Your place is kept."],
    ["Is any of this real?", "No. Every service, state, firm and person is invented."]
  ];
  // panel 6 item 25: a glossary of the words the game uses (opened from Help & FAQ)
  // panel 6 v7 (Wayne 15:31): the Hold/Push/trap buttons show risk as 5 dots (spy.js riskLevel; filled = chance of failure).
  // One list for the glossary and the live-op panel, lowest risk first, no percentages. Panel 6 v9 (Wayne): the odds words are
  // gone everywhere, so these dots are the game's only risk scale (live op, Hold/Push buttons, Hard's plan cards and results).
  const RISK = [["\u25cf\u25cb\u25cb\u25cb\u25cb", "low", "usually works (fails 1 time in 5 or less)"], ["\u25cf\u25cf\u25cb\u25cb\u25cb", "some", "works more often than not (fails up to 2 times in 5)"], ["\u25cf\u25cf\u25cf\u25cb\u25cb", "real", "could go either way (fails 2 to 3 times in 5)"], ["\u25cf\u25cf\u25cf\u25cf\u25cb", "high", "fails more often than it works (up to 4 times in 5)"], ["\u25cf\u25cf\u25cf\u25cf\u25cf", "very high", "usually fails (more than 4 times in 5)"]]; // round 4: even bands of 1 in 5
  const RISK_NOTE = "A Hold or Push always has some risk. Push\u2019s chance is never better than Hold\u2019s, so it never shows fewer dots.";
  function riskHTML(lead) { return lead + '<ul class="risklist">' + RISK.map(function (r) { return '<li><span class="riskdots" role="img" aria-label="risk ' + (RISK.indexOf(r) + 1) + ' of 5">' + r[0] + "</span> <b>" + r[1] + "</b>: " + r[2] + "</li>"; }).join("") + "</ul>" + RISK_NOTE; }
  const GLOSS = [
    ["C", "You: the chief of Albion House, the invented secret service in this story."],
    ["No.10 trust", "How far the Prime Minister, Eleanor Hale, backs you (top bar, 0 to 100). Under 10 at midnight is a final warning; two nights running under 10 (three on Easy) and you are sacked."],
    ["Service", "The department\u2019s health, plus how your officers feel (top bar). It lifts the odds of every plan."],
    ["Officer", "One of your field agents. New recruits go by code names (Kestrel, Heron, Swift) on the radio."],
    ["Stress and loyalty", "Each officer\u2019s strain and faith in you. High stress makes a blown cover more likely on a Push, and at full stress a failure can get them signed off; very low loyalty can end in a resignation."],
    ["Push", "On the radio: the long shot. Worse odds than Hold, but two and a half times the plan\u2019s gains if it works (and never less than No.10 trust +5, Service +3); a failure costs in full, the officer comes back wounded, and their cover can be blown."],
    ["Hold", "On the radio: wait and watch. Better odds than Push and the plan\u2019s normal gains; waiting costs some Service and a little No.10 trust, a failure costs half, and the officer stays safe (not on a trap)."],
    ["Abort", "On the radio: pull the officer out. The case is lost and No.10 trust drops, but the officer comes home safe and their loyalty goes up by one (unless it is already at the top)."],
    ["Risk dots", "{riskList}"],
    ["Partly works", "Done, but not cleanly: a smaller gain, and people ask questions."],
    ["Trap and tell", "Sometimes the other side is waiting. The officer reports a warning sign (the tell, marked \u26a0) before you choose. On a trap, Hold costs in full."],
    ["Cover blown", "The officer\u2019s face is known. They are burned: out of the field for good."],
    ["Halved and full losses", "What a failure costs. Hold halves the losses, unless it was a trap."],
    ["Tired, wounded, burned", "How an officer comes back. Tired after a hard push, wounded after a loss, burned when their cover is blown."],
    ["Kit", "Bugs, passports, cars and the safe-house key in your locker. Each one helps one plan, once."],
    ["Tradecraft", "Sending the right officer on the plan they rate best. It counts towards your grade."],
    ["Grade and medal", "Each day ends with a grade, A to E. On Days 1 to 5 the medal follows the grade; on Day 6 the medal is your ending for the whole week."],
    ["Story points", "Earned in the big cases of the week: Day 3, the bridge, the chase, Downing Street and closing the leak. With No.10 trust they decide your ending."],
    ["Epilogue", "A short painted scene for each ending you find. Your record on the title screen keeps them."],
    ["Bonus day", "A short side story, \u2018What if\u2026\u2019. It opens once you have finished Day 3, and it doesn\u2019t touch your saved game."]
  ];
  function glossary(back) {
    sheet('<div class="kicker">Help &amp; FAQ</div><h2>Glossary</h2><dl class="gloss">' + GLOSS.map(function (g) { return "<dt>" + g[0] + "</dt><dd>" + g[1].replace("{riskList}", riskHTML("Wherever the game shows a risk instead of a percentage (the live op, the Hold and Push buttons, and some cards on Hard), filled dots show the chance it fails, lowest risk first:")) + "</dd>"; }).join("") + '</dl><button class="btn primary" id="gl-back">Back</button>', "settings");
    $("gl-back").onclick = function () { close(); help(back); };
  }
  // Batch P: help(back, key) opens with that question already open (the Service note on result cards links here)
  function help(back, key) {
    sheet('<div class="kicker">Help &amp; FAQ</div><h2>How to play</h2>' + (window.HOWTO ? '<button type="button" class="btn ghost" id="hp-howto">How to play \u00b7 the briefing</button>' : "") + '<button type="button" class="btn ghost" id="hp-gloss">Glossary \u00b7 words the game uses</button>' + FAQ.map(function (q) { return "<details" + (q[2] ? ' data-faq="' + q[2] + '"' : "") + (key && q[2] === key ? " open" : "") + "><summary>" + q[0] + "</summary><p>" + q[1] + "</p></details>"; }).join("") + '<button class="btn primary" id="hp-back">Back</button>', "settings");
    if (key) { const d = document.querySelector('[data-faq="' + key + '"]'); if (d && d.scrollIntoView) d.scrollIntoView({ block: "center" }); }
    if (back === open) { window.AH_PAUSED = true; document.body.classList.add("paused"); }
    $("hp-back").onclick = function () { close(); if (back) back(); };
    if ($("hp-howto")) $("hp-howto").onclick = function () { close(); HOWTO.show(function () { help(back); }, false); };
    $("hp-gloss").onclick = function () { glossary(back); };
  }

  // ---------- one-time coach marks: a short tip the first time a mechanic appears ----------
  // Batch L: coach marks are remembered per game, not per device, so the next person to start a New Game on
  // this phone gets them too. Inside one game a card never shows twice.
  let seenLoose = {};
  const seenMap = function () { const st = window.AH && AH.S && AH.S(); if (!st) return seenLoose; st.coachSeen = st.coachSeen || {}; return st.coachSeen; };
  const coachQ = [];
  let coachOn = "";
  function coach(key, html) {
    const seenC = seenMap();
    if (seenC[key] || !PREFS.get("tips") || /[?&]nocoach=1/.test(location.search)) return;
    // one tip per screen: anything else waits until the next time its trigger fires on a new screen
    const scr = document.querySelector("#view [data-screen]"), here = (scr ? scr.getAttribute("data-screen") : "") + "|" + (window.AH && AH.S && AH.S() ? AH.S().day + ":" + AH.S().hour : "");
    if ($("coach") || coachOn === here) return;
    coachOn = here;
    seenC[key] = 1;
    const old = $("coach"); if (old) old.remove();
    const c = document.createElement("div"); c.id = "coach"; c.className = "coach"; c.setAttribute("role", "status");
    c.innerHTML = "<b>New</b><span>" + html + '</span><span class="cbtns"><button type="button" aria-label="Dismiss tip">Got it</button><button type="button" class="coachoff" aria-label="No more tips">No more tips</button></span>';
    document.body.appendChild(c); requestAnimationFrame(function () { c.classList.add("on"); });
    let gone = false; const go = function () { if (gone) return; gone = true; c.classList.remove("on"); setTimeout(function () { c.remove(); }, 300); };
    c.querySelector("button").onclick = function (e) { e.stopPropagation(); go(); };
    c.querySelector(".coachoff").onclick = function (e) { e.stopPropagation(); PREFS.set("tips", false); go(); if (window.FUN && FUN.toast) FUN.toast("Tips off. Switch them back on in Settings."); };
    setTimeout(go, 9000);
  }

  window.MENU = { coach: coach, open: open, close: close, settings: settings, help: help, glossary: glossary, GLOSS: GLOSS, RISK: RISK, RISK_NOTE: RISK_NOTE, riskHTML: riskHTML, confirm: confirm, sheet: sheet };
  document.addEventListener("DOMContentLoaded", function () { const b = $("menu"); if (b) b.onclick = function (e) { e.stopPropagation(); open(); }; });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && $("sheet")) close(); });
})();
