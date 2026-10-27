/* ASHLINE ui.js — shared app namespace, screens, transitions, modal/toast, title, settings, hub */
window.AL = (function () {
  "use strict";
  const Save = window.ASHLINE_SAVE;
  const Audio = window.ASHLINE_AUDIO;
  const ART = window.ASHLINE_ART;
  const DATA = window.ASHLINE_DATA;

  const $ = function (id) { return document.getElementById(id); };
  const AL = {
    DATA: DATA, Save: Save, Audio: Audio, ART: ART, $: $,
    save: Save.load(),
    currentJob: null,
    screen: "title",
    tutorSkipped: false
  };

  AL.el = {
    title: $("screen-title"), hub: $("screen-hub"), mission: $("screen-mission"), titleBg: $("title-bg"),
    btnContinue: $("btn-continue"), btnNew: $("btn-new"), btnSettingsTitle: $("btn-settings-title"),
    hubCredits: $("hub-credits"), btnSettingsHub: $("btn-settings-hub"),
    greetPortrait: $("greet-portrait"), greetText: $("greet-text"), actCount: $("act-count"), actFill: $("act-fill"),
    tickerText: $("ticker-text"), contractList: $("contract-list"), upgradeList: $("upgrade-list"), newsList: $("news-list"),
    overlay: $("overlay"), modalKicker: $("modal-kicker"), modalTitle: $("modal-title"),
    modalBody: $("modal-body"), modalActions: $("modal-actions"), toast: $("toast"), vignette: $("vignette")
  };
  const el = AL.el;

  // ---- helpers ----
  AL.esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
  AL.fmt = function (n) { return Math.round(n).toLocaleString("en-GB"); };
  AL.persist = function () { AL.save = Save.save(AL.save); };
  AL.sfx = function (name) { if (Audio.sfx[name]) Audio.sfx[name](); };
  const mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  AL.reduceMotion = function () { return !!AL.save.settings.reduceMotion || !!(mq && mq.matches); };
  AL.applySettings = function () {
    document.body.classList.toggle("reduce-motion", AL.reduceMotion());
    Audio.configure(AL.save.settings);
    titleFx.sync();
  };
  if (mq && mq.addEventListener) mq.addEventListener("change", function () { AL.applySettings(); });
  AL.jobById = function (id) { return DATA.JOBS.filter(function (j) { return j.id === id; })[0] || null; };

  // ---- screens ----
  AL.showScreen = function (name) {
    AL.screen = name;
    [["title", el.title], ["hub", el.hub], ["mission", el.mission]].forEach(function (p) {
      const on = p[0] === name;
      p[1].classList.toggle("hidden", !on);
      if (on) { p[1].classList.remove("enter"); void p[1].offsetWidth; p[1].classList.add("enter"); }
    });
    titleFx.sync();
  };

  // ---- modal / toast ----
  AL.showModal = function (kind, kicker, title, bodyHtml, actions) {
    el.overlay.className = "overlay " + kind;
    el.modalKicker.textContent = kicker;
    el.modalTitle.textContent = title;
    el.modalBody.innerHTML = bodyHtml;
    el.modalActions.innerHTML = "";
    (actions || []).forEach(function (a) {
      const b = document.createElement("button");
      b.type = "button";
      if (a.detail) { b.className = "btn choice"; b.innerHTML = "<strong>" + AL.esc(a.label) + "</strong><span>" + AL.esc(a.detail) + "</span>"; }
      else { b.className = "btn " + (a.primary ? "primary" : "glass"); b.textContent = a.label; }
      if (a.id) b.id = a.id;
      b.addEventListener("click", function () { AL.sfx("tap"); el.overlay.classList.add("hidden"); a.fn(); });
      el.modalActions.appendChild(b);
    });
  };
  let toastTimer = 0;
  AL.toast = function (msg) {
    el.toast.textContent = msg;
    el.toast.classList.remove("hidden");
    el.toast.style.animation = "none"; void el.toast.offsetWidth; el.toast.style.animation = "";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.toast.classList.add("hidden"); }, 1600);
  };

  // ---- title backdrop: canvas data-stream, paused off-screen / reduced motion ----
  const titleFx = (function () {
    const c = el.titleBg;
    const ctx = c.getContext && c.getContext("2d");
    let raf = 0, cols = [], parts = [], w = 0, h = 0, last = 0;
    const GLYPHS = "01ABCDEF<>/#*+=:";
    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = c.clientWidth || window.innerWidth; h = c.clientHeight || window.innerHeight;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = []; for (let i = 0; i < Math.ceil(w / 28); i++) cols.push({ x: i * 28 + 8, y: Math.random() * h, v: 30 + Math.random() * 70, a: Math.random() < 0.45 });
      parts = []; for (let j = 0; j < 36; j++) parts.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.6 + 0.4, v: 6 + Math.random() * 14 });
    }
    function frame(t) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
      ctx.clearRect(0, 0, w, h);
      ctx.font = "13px ui-monospace, Menlo, monospace";
      cols.forEach(function (col, i) {
        if (!col.a) return;
        col.y += col.v * dt; if (col.y > h + 160) { col.y = -40; col.a = Math.random() < 0.6; }
        for (let k = 0; k < 8; k++) {
          ctx.fillStyle = k === 0 ? "rgba(200,240,255,.55)" : "rgba(79,209,255," + (0.28 - k * 0.032).toFixed(3) + ")";
          ctx.fillText(GLYPHS[(i * 7 + k * 3 + ((t / 220) | 0)) % GLYPHS.length], col.x, col.y - k * 17);
        }
      });
      ctx.fillStyle = "rgba(167,139,250,.5)";
      parts.forEach(function (q) {
        q.y -= q.v * dt; if (q.y < -4) { q.y = h + 4; q.x = Math.random() * w; }
        ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.283); ctx.fill();
      });
    }
    function sync() {
      if (!ctx) return;
      const want = AL.screen === "title" && !AL.reduceMotion() && document.visibilityState !== "hidden";
      if (want && !raf) { resize(); last = 0; raf = requestAnimationFrame(frame); }
      if (!want && raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    window.addEventListener("resize", function () { if (raf) resize(); });
    document.addEventListener("visibilitychange", sync);
    return { sync: sync };
  })();

  // ---- title ----
  AL.hasProgress = function () { const s = AL.save; return s.seenTitle || s.credits > 0 || s.completedJobs.length > 0; };
  AL.renderTitle = function () {
    const prog = AL.hasProgress();
    el.btnContinue.classList.toggle("hidden", !prog);
    el.btnContinue.innerHTML = ART.icon("play", 20) + "<span>Continue</span>";
    el.btnNew.innerHTML = ART.icon("plus", 20) + "<span>New Game</span>";
    el.btnNew.className = "btn xl " + (prog ? "glass" : "primary");
    el.btnSettingsTitle.innerHTML = ART.icon("gear", 20) + "<span>Settings</span>";
  };
  AL.continueGame = function () {
    Audio.unlock(); AL.sfx("whoosh");
    AL.save.seenTitle = true; AL.persist();
    AL.openHub();
  };
  function wipeKeepSettings() {
    const keep = AL.save.settings;
    AL.save = Save.reset(); AL.save.settings = keep; AL.persist();
    AL.tutorSkipped = false;
  }
  AL.newGame = function () {
    Audio.unlock(); AL.sfx("tap");
    const fresh = function () { wipeKeepSettings(); AL.save.seenTitle = true; AL.persist(); AL.sfx("whoosh"); AL.openHub(); };
    if (!AL.hasProgress()) { fresh(); return; }
    AL.showModal("lose", "NEW GAME", "Start over?", "<p>This wipes credits, upgrades, completed ops and headlines. Your settings are kept.</p>",
      [{ label: "Wipe and start fresh", primary: true, fn: fresh }, { label: "Cancel", fn: function () {} }]);
  };

  // ---- settings ----
  AL.openSettings = function () {
    Audio.unlock(); AL.sfx("tap");
    const s = AL.save.settings;
    function sw(key, label, icon) {
      return '<div class="set-row">' + ART.icon(icon, 20) + '<label id="lbl-' + key + '">' + label + "</label>" +
        '<button type="button" class="switch" role="switch" data-set="' + key + '" aria-labelledby="lbl-' + key + '" aria-checked="' + !!s[key] + '"></button></div>';
    }
    const speeds = ["slow", "normal", "fast"].map(function (v) {
      return '<button type="button" data-v="' + v + '" aria-pressed="' + (s.textSpeed === v) + '">' + v[0].toUpperCase() + v.slice(1) + "</button>";
    }).join("");
    AL.showModal("settings", "SETTINGS", "Tune your rig",
      sw("sound", "Sound effects", "sound") + sw("music", "Ambient music", "music") +
      '<div class="set-row">' + ART.icon("wave", 20) + '<label for="set-vol">Music volume</label><input id="set-vol" type="range" min="0" max="100" value="' + Math.round(s.musicVol * 100) + '"></div>' +
      '<div class="set-row">' + ART.icon("text", 20) + '<label>Text speed</label><div class="seg" id="set-speed">' + speeds + "</div></div>" +
      sw("reduceMotion", "Reduce motion", "motion") +
      '<div class="set-row">' + ART.icon("trash", 20) + '<label>Reset progress</label><button type="button" class="btn danger sm" id="set-reset">Reset</button></div>',
      [{ label: "Done", primary: true, id: "set-done", fn: function () { if (AL.screen === "hub") AL.renderHub(); } }]);
    el.modalBody.querySelectorAll(".switch").forEach(function (b) {
      b.addEventListener("click", function () {
        const k = b.getAttribute("data-set");
        AL.save.settings[k] = !AL.save.settings[k];
        b.setAttribute("aria-checked", String(AL.save.settings[k]));
        AL.persist(); AL.applySettings(); AL.sfx("tap");
      });
    });
    $("set-vol").addEventListener("input", function (e) { AL.save.settings.musicVol = Number(e.target.value) / 100; AL.persist(); Audio.configure(AL.save.settings); });
    $("set-speed").querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        AL.save.settings.textSpeed = b.getAttribute("data-v"); AL.persist(); AL.sfx("tap");
        $("set-speed").querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      });
    });
    $("set-reset").addEventListener("click", function () {
      AL.showModal("lose", "RESET", "Wipe all progress?", "<p>Credits, upgrades, completed ops and headlines will be cleared. Settings stay.</p>", [
        { label: "Wipe save", primary: true, fn: function () { wipeKeepSettings(); AL.showScreen("title"); AL.renderTitle(); } },
        { label: "Cancel", fn: AL.openSettings }
      ]);
    });
  };

  // ---- hub ----
  AL.openHub = function () {
    if (AL.leaveMission) AL.leaveMission();
    AL.showScreen("hub");
    AL.renderHub();
  };
  function greeting() {
    const n = AL.save.completedJobs.length;
    if (n === 0) return { e: "smirk", t: "New face. Good. I've got a soft target to see how you move. Tap <em>Op Glasswing</em>." };
    if (n === 1) return { e: "neutral", t: "That schematic was a cable-tap sensor. Someone's shopping. Next stop: <em>Thalassa Link</em>." };
    if (n === 2) return { e: "worried", t: "Ghost dives off Shetland. This isn't a company. The last job of Deep Water is waiting." };
    return { e: "smirk", t: "Deep Water's done. " + (AL.save.act1Choice === "leak" ? "The whole wire is talking." : "Our allies are briefed.") + " Greyhook is next. Replay any op to chase three stars." };
  }
  AL.renderHub = function () {
    const s = AL.save;
    el.hubCredits.textContent = AL.fmt(s.credits);
    el.btnSettingsHub.innerHTML = ART.icon("gear", 20);
    const g = greeting();
    el.greetPortrait.innerHTML = ART.portrait("kite", g.e, 72);
    el.greetText.innerHTML = g.t;
    el.actCount.textContent = s.completedJobs.length + "/" + DATA.JOBS.length;
    el.actFill.style.transform = "scaleX(" + s.completedJobs.length / DATA.JOBS.length + ")";
    const heads = s.news.length ? s.news.slice().reverse().map(function (n) { return n.title; })
      : ["Thalassa Link reports \u201croutine\u201d Red Sea maintenance on the Azimuth Spine", "Survey ship loiters 40 km off Shetland; Virelian Directorate denies involvement", "Port of Greyhook expands night shifts amid fuel shortage"];
    el.tickerText.textContent = heads.join("   \u2022   ");
    renderContracts(); renderUpgrades(); renderNews();
  };
  function renderContracts() {
    el.contractList.innerHTML = "";
    DATA.JOBS.forEach(function (job, idx) {
      const s = AL.save;
      const done = s.completedJobs.indexOf(job.id) >= 0;
      const unlocked = idx === 0 || s.completedJobs.indexOf(DATA.JOBS[idx - 1].id) >= 0;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "contract" + (unlocked ? "" : " locked");
      b.setAttribute("data-job", job.id);
      let pips = ""; for (let i = 1; i <= 3; i++) pips += '<i class="' + (i <= job.threat ? "on" : "") + '"></i>';
      const status = done ? '<span class="c-status done">' + "\u2605".repeat(s.stars[job.id] || 1) + " DONE</span>"
        : unlocked ? '<span class="c-status new">NEW</span>' : '<span class="c-status locked">LOCKED</span>';
      b.innerHTML = '<span class="c-art">' + ART.contractArt(job.art) + "</span>" +
        '<span class="c-body"><span class="c-top"><span class="c-title">' + AL.esc(job.title) + "</span>" + status + "</span>" +
        '<span class="c-short">' + AL.esc(job.short) + " \u2014 " + AL.esc(job.blurb) + "</span>" +
        '<span class="c-meta"><span class="threat">THREAT ' + pips + '</span><span class="c-pay">' +
        (unlocked ? "+" + AL.fmt(job.reward) + " c" : "Finish previous op") + "</span></span></span>";
      if (unlocked) b.addEventListener("click", function () { Audio.unlock(); AL.sfx("whoosh"); AL.startMission(job.id); });
      else b.disabled = true;
      el.contractList.appendChild(b);
    });
  }
  AL.buyUpgrade = function (id) {
    const u = DATA.UPGRADES.filter(function (x) { return x.id === id; })[0];
    if (!u) return false;
    const lvl = AL.save.upgrades[id] | 0;
    if (lvl >= u.max || AL.save.credits < u.cost) return false;
    AL.save.credits -= u.cost; AL.save.upgrades[id] = lvl + 1; AL.persist();
    return true;
  };
  function renderUpgrades() {
    el.upgradeList.innerHTML = "";
    DATA.UPGRADES.forEach(function (u) {
      const lvl = AL.save.upgrades[u.id] | 0, maxed = lvl >= u.max, can = !maxed && AL.save.credits >= u.cost;
      const row = document.createElement("div");
      row.className = "upgrade glass-card";
      let pips = ""; for (let i = 0; i < u.max; i++) pips += '<i class="' + (i < lvl ? "on" : "") + '"></i>';
      row.innerHTML = '<div class="u-icon">' + ART.icon(u.icon, 24) + '</div><div class="u-info"><div class="u-name">' + AL.esc(u.name) +
        '</div><div class="u-desc">' + AL.esc(u.desc) + '</div><div class="pips">' + pips + "</div></div>";
      const b = document.createElement("button");
      b.type = "button"; b.className = "btn sm " + (can ? "primary" : "glass");
      b.setAttribute("data-upgrade", u.id);
      b.textContent = maxed ? "Maxed" : AL.fmt(u.cost) + " c";
      b.disabled = !can;
      b.addEventListener("click", function () { if (AL.buyUpgrade(u.id)) { AL.sfx("unlock"); AL.renderHub(); } });
      row.appendChild(b);
      el.upgradeList.appendChild(row);
    });
  }
  function renderNews() {
    const s = AL.save;
    if (!s.news.length) { el.newsList.innerHTML = '<p class="empty glass-card">The world hasn\u2019t noticed you yet. Finish an op and the headlines will follow.</p>'; return; }
    el.newsList.innerHTML = s.news.slice().reverse().map(function (n) {
      return '<div class="news-item glass-card"><div class="news-src">' + AL.esc(n.source) + '</div><div class="news-title">' + AL.esc(n.title) +
        '</div><p class="news-blurb">' + AL.esc(n.blurb) + "</p></div>";
    }).join("");
  }

  return AL;
})();
