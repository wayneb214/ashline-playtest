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
  function sheet(html, cls) {
    close();
    const d = document.createElement("div"); d.id = "sheet"; d.className = "sheet-bg" + (cls ? " " + cls : ""); d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true");
    d.innerHTML = '<div class="sheet">' + html + "</div>"; document.body.appendChild(d);
    requestAnimationFrame(function () { d.classList.add("in"); });
    return d;
  }
  function close() { const d = $("sheet"); if (d) d.remove(); window.AH_PAUSED = false; document.body.classList.remove("paused"); }
  function confirm(title, txt, yes, onYes, back) {
    sheet('<h2>' + title + "</h2><p>" + txt + '</p><button class="btn danger" id="cf-yes">' + yes + '</button><button class="btn ghost" id="cf-no">Cancel</button>');
    $("cf-yes").onclick = function () { close(); onYes(); };
    $("cf-no").onclick = function () { close(); if (back) back(); };
  }

  // ---------- the pause menu ----------
  function open() {
    window.AH_PAUSED = true; document.body.classList.add("paused");
    if (window.VOICE) VOICE.hush();
    const m = window.SFX && SFX.muted;
    sheet('<div class="kicker">Paused \u00b7 Day ' + A().S().day + " \u00b7 " + A().hh(A().S().hour) + "</div><h2>Albion House</h2>" +
      '<button class="btn primary" id="mn-resume">Resume</button>' +
      '<button class="btn ghost" id="mn-sound">' + (m ? "\ud83d\udd07 Sound is off \u00b7 turn on" : "\ud83d\udd0a Sound is on \u00b7 turn off") + "</button>" +
      '<button class="btn ghost" id="mn-settings">Settings</button><button class="btn ghost" id="mn-help">Help &amp; FAQ</button>' + (window.REVIEW && REVIEW.canRate() ? '<button class="btn ghost" id="mn-rate">\u2b50 Rate this game</button>' : "") +
      '<button class="btn ghost" id="mn-title">Title screen</button><button class="btn danger" id="mn-restart">Restart day</button>' +
      '<p class="fine">Your game saves itself after every move.</p>', "menu");
    window.AH_PAUSED = true; document.body.classList.add("paused");
    $("mn-resume").onclick = close;
    $("mn-sound").onclick = function () { if (window.SFX) { SFX.unlock(); SFX.setMuted(!SFX.muted); } A().muteBtn(); open(); };
    $("mn-settings").onclick = function () { settings(open); };
    $("mn-help").onclick = function () { help(open); };
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
        seg("mode", [["all", "All"], ["music", "Music only"], ["effects", "Effects only"], ["off", "Off"]], window.SFX && SFX.muted ? "off" : PREFS.get("mode")) +
        slider("music", "Music") + slider("amb", "Rain &amp; Big Ben") + slider("voice", "Voices") + slider("fx", "Effects &amp; taps") +
        (PREFS.canBuzz() ? "<h2>Haptics</h2>" + seg("hap", [["1", "On"], ["0", "Off"]], PREFS.get("haptics") ? "1" : "0") : "") +
        "<h2>Motion</h2>" + seg("rd", [["auto", "Device (" + (FEEL.deviceReduce ? "reduced" : "full") + ")"], ["off", "Full motion"], ["on", "Reduced"]], rdNow) +
        '<p class="fine">Reduced motion shows still paintings instead of moving cutscenes.</p>' +
        "<h2>Text size</h2>" + A().textSizeHTML() +
        "<h2>Tips</h2>" + seg("tips", [["1", "Show tips"], ["0", "Hide tips"]], PREFS.get("tips") ? "1" : "0") +
        (window.CINE ? '<h2>Cutscenes</h2><button class="btn ghost" id="st-cine">Cutscenes and replays</button>' : "") +
        '<h2>About</h2><button class="btn ghost" id="st-credits">Credits</button><p class="fine privacy">No accounts, no tracking. Saves stay on this device.</p>' +
        '<button class="btn primary" id="st-back">Done</button>', "settings");
      if (back === open) { window.AH_PAUSED = true; document.body.classList.add("paused"); }
      document.querySelectorAll("[data-vol]").forEach(function (r) { r.oninput = function () { PREFS.set(r.getAttribute("data-vol"), r.value / 100); }; r.onchange = function () { if (window.SFX) SFX.tick(1); }; });
      document.querySelectorAll("[data-mode]").forEach(function (b) { b.onclick = function () { const m = b.getAttribute("data-mode"); if (window.SFX) { SFX.unlock(); SFX.setMuted(m === "off"); } if (m !== "off") PREFS.set("mode", m); A().muteBtn(); draw(); }; });
      document.querySelectorAll("[data-hap]").forEach(function (b) { b.onclick = function () { PREFS.set("haptics", b.getAttribute("data-hap") === "1"); FEEL.buzz("stamp"); draw(); }; });
      document.querySelectorAll("[data-rd]").forEach(function (b) { b.onclick = function () { const v = b.getAttribute("data-rd"); PREFS.set("reduce", v === "auto" ? null : v === "on"); draw(); }; });
      document.querySelectorAll("[data-tips]").forEach(function (b) { b.onclick = function () { PREFS.set("tips", b.getAttribute("data-tips") === "1"); draw(); }; });
      A().bindTextSize(draw);
      if ($("st-cine")) $("st-cine").onclick = function () { const wasPlay = inPlay(), s = A().S(); close(); CINE.settings(function () { if (wasPlay) A().resumeScreen(); else A().title(); }); };
      $("st-credits").onclick = function () { credits(draw); };
      $("st-back").onclick = function () { close(); if (back) back(); };
    };
    draw();
  }
  function credits(back) {
    sheet('<div class="kicker">Credits</div><h2>Albion House</h2><p>A work of fiction. Albion House, and every state, firm, service and person in it, is invented. Real places are used only as places.</p>' +
      "<p><b>Design, story and code:</b> Wayne Byrne.</p><p><b>Music and sound:</b> original, synthesised live in your device.</p>" +
      "<p><b>Voices:</b> made with Kokoro-82M (Apache 2.0) and Chatterbox (MIT). No real person\u2019s voice was cloned.</p>" +
      "<p><b>Paintings and cutscenes:</b> original artwork made for this game.</p>" +
      '<p class="fine privacy">No accounts, no tracking. Saves stay on this device.</p><button class="btn primary" id="cr-back">Back</button>', "settings");
    $("cr-back").onclick = function () { back(); };
  }
  const FAQ = [
    ["What am I doing?", "You are C, the new chief of Albion House. Each day brings a pile of cases. Open one, pick an officer, pick a plan, and live with the result."],
    ["What do the two gauges mean?", "<b>No.10 trust</b> is how far the Prime Minister backs you. It opens bold plans. <b>Service</b> is your officers\u2019 health, loyalty and cover. It lifts the odds of every plan."],
    ["Why did the clock jump?", "Every operation takes hours. Careful plans take longer. Each case has a deadline, and a case left too long is lost."],
    ["How do I save?", "You don\u2019t need to. The game saves after every move and when you leave the app. Continue from the title screen."],
    ["Can I quit?", "Open \u2630 and choose Title screen. Your place is kept."],
    ["Is any of this real?", "No. Every service, state, firm and person is invented."]
  ];
  function help(back) {
    sheet('<div class="kicker">Help &amp; FAQ</div><h2>How to play</h2>' + FAQ.map(function (q) { return "<details><summary>" + q[0] + "</summary><p>" + q[1] + "</p></details>"; }).join("") + '<button class="btn primary" id="hp-back">Back</button>', "settings");
    if (back === open) { window.AH_PAUSED = true; document.body.classList.add("paused"); }
    $("hp-back").onclick = function () { close(); if (back) back(); };
  }

  // ---------- one-time coach marks: a short tip the first time a mechanic appears ----------
  const CKEY = "albion-coach";
  let seenC = {}; try { seenC = JSON.parse(localStorage.getItem(CKEY) || "{}"); } catch (e) {}
  function coach(key, html) {
    if (seenC[key] || !PREFS.get("tips") || /[?&]nocoach=1/.test(location.search)) return;
    seenC[key] = 1; try { localStorage.setItem(CKEY, JSON.stringify(seenC)); } catch (e) {}
    const old = $("coach"); if (old) old.remove();
    const c = document.createElement("div"); c.id = "coach"; c.className = "coach"; c.setAttribute("role", "status");
    c.innerHTML = "<b>New</b><span>" + html + '</span><button type="button" aria-label="Dismiss tip">Got it</button>';
    document.body.appendChild(c); requestAnimationFrame(function () { c.classList.add("on"); });
    const go = function () { c.classList.remove("on"); setTimeout(function () { c.remove(); }, 300); };
    c.querySelector("button").onclick = function (e) { e.stopPropagation(); go(); }; setTimeout(go, 9000);
  }

  window.MENU = { coach: coach, open: open, close: close, settings: settings, help: help, confirm: confirm, sheet: sheet };
  document.addEventListener("DOMContentLoaded", function () { const b = $("menu"); if (b) b.onclick = function (e) { e.stopPropagation(); open(); }; });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && $("sheet")) close(); });
})();
