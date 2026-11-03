/* ASHLINE mission.js — mission state, trace timer, terminal + commands, tutorial, completion flow.
   All systems are fictional; every "hack" is a scripted effect. */
(function (AL) {
  "use strict";
  const ART = AL.ART, $ = AL.$;
  const BASE_TRACE_MS = 16000, PER_HOP_MS = 9000, BUFFER_MS = 8000, TRACE_TICK = 50;
  AL.WRONG_PENALTY_MS = 4000;

  const el = {
    abort: $("btn-abort"), op: $("stat-op"), conn: $("stat-conn"),
    traceText: $("trace-text"), traceFill: $("trace-fill"), traceWrap: $("trace-wrap"),
    tutor: $("tutor"), tutorText: $("tutor-text"), body: $("mission-body"), dossier: $("dossier"),
    chatLog: $("chat-log"), accept: $("btn-accept"),
    routeText: $("route-text"), routeEta: $("route-eta"), clear: $("btn-clear-route"), connect: $("btn-map-connect"), mapHint: $("map-hint"),
    out: $("term-out"), form: $("term-form"), input: $("term-input"), prompt: $("prompt"), chips: $("cmd-chips"), tilesCount: $("tiles-count")
  };

  function fresh() {
    return {
      accepted: false, briefingDone: false, route: [], connected: false, cracked: false, cwd: "", downloaded: false,
      history: [], histIdx: -1, draft: "", gameOver: false, won: false, hinted: false,
      tiles: [], readFiles: {}, crackSlot: [], wrongGuesses: 0,
      connectedAt: 0, finalTraceP: 0, lastBeat: 0, warned50: false, shook75: false, shook90: false,
      trace: { active: false, started: 0, duration: 0, timer: null }
    };
  }
  AL.mission = fresh();
  const M = function () { return AL.mission; };
  const job = function () { return AL.currentJob; };

  // ---------- lifecycle ----------
  AL.startMission = function (jobId) {
    const j = AL.jobById(jobId);
    if (!j) return;
    stopTrace();
    AL.currentJob = j;
    AL.mission = fresh();
    resetTraceUI(); AL.crack.close(true); AL.chat.reset();
    el.out.innerHTML = "";
    el.accept.disabled = true; el.accept.textContent = "Kite is briefing\u2026";
    el.op.textContent = j.title;
    el.abort.innerHTML = ART.icon("back", 22);
    const c = j.contact;
    el.dossier.innerHTML = ART.portrait(c.who, "neutral", 48) + '<div><div class="eyebrow">Key contact</div><div class="d-name">' + AL.esc(c.name) +
      '</div><div class="d-role">' + AL.esc(c.role) + '</div><div class="d-bio">' + AL.esc(c.bio) + "</div></div>";
    document.querySelectorAll(".tab-ic").forEach(function (s) { s.innerHTML = ART.icon(s.getAttribute("data-ic"), 18); });
    AL.showScreen("mission");
    AL.setTab("chat");
    AL.map.draw();
    AL.updateChrome();
    print("ASHLINE // " + j.title, "info");
    print("Simulated systems only. Talk to Kite, then accept.", "dim");
    AL.chat.briefing(j.kiteBoot.slice(), function () {
      M().briefingDone = true;
      el.accept.disabled = false; el.accept.textContent = "Accept " + j.title;
      updateTutor();
    });
  };
  AL.skipBriefing = function () {
    AL.chat.cancel();
    M().briefingDone = true;
    el.accept.disabled = false; el.accept.textContent = "Accept " + job().title;
    updateTutor();
  };
  AL.leaveMission = function () { stopTrace(); resetTraceUI(); AL.crack.close(true); AL.chat.cancel(); };

  AL.acceptOp = function () {
    const m = M();
    if (!job() || !m.briefingDone || m.accepted) return;
    m.accepted = true;
    el.accept.disabled = true; el.accept.textContent = "Op accepted";
    AL.sfx("ok");
    AL.chat.you("Accepting " + AL.esc(job().title) + ". I\u2019m on it.");
    print(job().title + " accepted. Target " + job().target.ip + " \u2014 plot hops, then connect.", "ok");
    AL.chat.say("Good. More hops = more time before the trace lands. Chain a few relays, then hit <em>Connect</em>.");
    AL.updateChrome();
    AL.setTab("map");
  };

  // ---------- tabs + tutorial ----------
  let tab = "chat";
  AL.setTab = function (name) {
    tab = name;
    document.querySelectorAll(".tab").forEach(function (t) {
      const on = t.getAttribute("data-tab") === name;
      t.classList.toggle("active", on); t.setAttribute("aria-selected", String(on));
    });
    document.querySelectorAll(".mission-body .panel").forEach(function (p) { p.classList.toggle("active", p.getAttribute("data-panel") === name); });
    updateTutor();
  };
  function tutorialOn() { return !!(job() && job().tutorial && !AL.save.tutorialDone && !AL.tutorSkipped); }
  // Recomputed only on state changes, never on a timer.
  function updateTutor() {
    document.querySelectorAll(".pulse").forEach(function (n) { n.classList.remove("pulse"); });
    const m = M();
    if (!tutorialOn() || m.gameOver) { el.tutor.classList.add("hidden"); return; }
    let text, target = null, want;
    const chip = function (sel) { return el.chips.querySelector(sel); };
    if (!m.accepted) { want = "chat"; text = m.briefingDone ? "Tap Accept to take the contract." : "Kite is briefing you. Tap the chat to speed it up."; target = m.briefingDone ? el.accept : null; }
    else if (!m.connected && !m.route.length) { want = "map"; text = "Tap a relay to add a hop. More hops = more time."; target = AL.$("world").querySelector(".node.relay:not(.locked)"); }
    else if (!m.connected) { want = "map"; text = "Nice route. Tap Connect to bounce in."; target = el.connect; }
    else if (!m.cracked && m.tiles.length < 2) { want = "term"; text = "Open files. Every clue you read becomes a crack tile."; target = el.out.querySelector(".fs-link:not(.read):not(.dir):not(.bin)") || el.out.querySelector(".fs-link.dir") || chip('[data-cmd="ls"]'); }
    else if (!m.cracked) { want = "term"; text = "Tap Crack and build the passphrase from your tiles."; target = chip('[data-cmd="crack"]'); }
    else if (!m.downloaded) { want = "term"; text = "Gate\u2019s open. Download the contract file."; target = chip('[data-cmd^="download"]'); }
    else { want = "term"; text = "Got it. Disconnect before the trace reaches you."; target = chip('[data-cmd="disconnect"]'); }
    el.tutorText.textContent = text;
    el.tutor.classList.remove("hidden");
    if (want !== tab && window.innerWidth < 900) target = document.querySelector('.tab[data-tab="' + want + '"]');
    if (target) target.classList.add("pulse");
  }
  AL.updateTutor = updateTutor;

  // ---------- trace ----------
  function traceDuration() { return BASE_TRACE_MS + M().route.length * PER_HOP_MS + (AL.save.upgrades.traceBuffer | 0) * BUFFER_MS; }
  AL.traceProgress = function () {
    const t = M().trace;
    return t.active ? Math.min(1, (performance.now() - t.started) / t.duration) : M().finalTraceP;
  };
  function startTrace() {
    stopTrace();
    const m = M();
    Object.assign(m.trace, { active: true, started: performance.now(), duration: traceDuration() });
    el.traceWrap.classList.add("hot");
    m.trace.timer = setInterval(tick, TRACE_TICK);
    tick();
  }
  // Updates text, transforms and opacity only; never rebuilds interactive buttons.
  function tick() {
    const m = M(), t = m.trace;
    if (!t.active) return;
    const now = performance.now(), elapsed = now - t.started, p = Math.min(1, elapsed / t.duration);
    el.traceFill.style.transform = "scaleX(" + p.toFixed(4) + ")";
    el.traceText.textContent = Math.round(p * 100) + "% \u00b7 " + Math.max(0, (t.duration - elapsed) / 1000).toFixed(1) + "s";
    AL.map.traceVisual(p);
    AL.el.vignette.style.opacity = String(Math.max(0, (p - 0.45) / 0.55) * 0.95);
    const crit = p >= 0.8;
    el.traceWrap.classList.toggle("crit", crit);
    AL.el.vignette.classList.toggle("crit", crit && !AL.reduceMotion());
    if (p >= 0.6 && now - m.lastBeat > (p >= 0.85 ? 450 : p >= 0.75 ? 700 : 1000)) { m.lastBeat = now; AL.sfx("heartbeat"); }
    if (p >= 0.75 && !m.shook75) { m.shook75 = true; shake(); AL.sfx("warn"); }
    if (p >= 0.9 && !m.shook90) { m.shook90 = true; shake(); }
    if (AL.save.upgrades.traceMonitor && !m.warned50 && p >= 0.5) { m.warned50 = true; AL.sfx("warn"); print("Trace monitor: 50%. Move.", "warn"); AL.toast("Trace at 50%"); }
    if (p >= 1) { stopTrace(); onTraced(); }
  }
  AL.tickTrace = tick;
  function shake() {
    if (AL.reduceMotion()) return;
    el.body.classList.remove("shake"); void el.body.offsetWidth; el.body.classList.add("shake");
  }
  function stopTrace() {
    const m = M(), t = m.trace;
    if (t.timer) { clearInterval(t.timer); t.timer = null; }
    if (t.active) m.finalTraceP = Math.min(1, (performance.now() - t.started) / t.duration);
    t.active = false;
  }
  AL.stopTrace = stopTrace;
  function resetTraceUI() {
    el.traceFill.style.transform = "scaleX(0)";
    el.traceText.textContent = "Idle";
    el.traceWrap.classList.remove("hot", "crit");
    AL.el.vignette.style.opacity = "0"; AL.el.vignette.classList.remove("crit");
  }
  function penalise(ms) {
    if (!M().trace.active) return;
    M().trace.started -= ms;
    AL.toast("Wrong guess \u00b7 \u2212" + ms / 1000 + "s");
    shake(); tick();
  }
  function onTraced() {
    const m = M();
    m.gameOver = true; m.connected = false; m.cracked = false; m.finalTraceP = 1;
    AL.crack.close(true);
    AL.sfx("alarm");
    AL.el.vignette.style.opacity = "1";
    print("TRACE COMPLETE \u2014 link seized. Op failed.", "err");
    AL.map.markTraced();
    AL.updateChrome();
    AL.chat.say("They walked the chain home. Breathe. Add hops or move faster.", "worried");
    AL.showModal("lose", "TRACE LOCKED", "They found you",
      '<p>The bounce collapsed and Ashline burned the link.</p><div class="rows"><div><span>Hops used</span><span>' + m.route.length +
      "</span></div><div><span>File secured</span><span>" + (m.downloaded ? "Yes" : "No") + "</span></div><div><span>Payout</span><span>0 c</span></div></div>" +
      '<p class="tip">Tip: each relay adds ~' + PER_HOP_MS / 1000 + "s. Wrong guesses cost " + AL.WRONG_PENALTY_MS / 1000 + "s.</p>",
      [{ label: "Retry op", primary: true, fn: function () { AL.startMission(job().id); } }, { label: "Back to hub", fn: AL.openHub }]);
  }

  // ---------- terminal output + chrome ----------
  function line(text, cls, html) {
    const d = document.createElement("div");
    d.className = "line" + (cls ? " " + cls : "");
    if (html) d.innerHTML = text; else d.textContent = text;
    el.out.appendChild(d);
    el.out.scrollTop = el.out.scrollHeight;
    return d;
  }
  function print(t, c) { return line(t, c, false); }
  AL.term = { print: print };

  AL.updateChrome = function () {
    const m = M(), j = job(), nodes = AL.map.nodes();
    el.conn.textContent = m.connected ? "LINKED" : "OFFLINE";
    el.conn.className = "pill " + (m.connected ? "on" : "off");
    el.prompt.textContent = m.connected ? (m.cracked ? "root@gate:~#" : "guest@gate:~$") : "you@ashline:~$";
    const parts = ["<b>Rig</b>"];
    m.route.forEach(function (id) { parts.push('<span class="ar">\u203a</span><b>' + AL.esc(nodes[id] ? nodes[id].name : id) + "</b>"); });
    parts.push('<span class="ar">\u203a</span><b>' + AL.esc(j ? j.target.name : "Target") + "</b>");
    el.routeText.innerHTML = parts.join("");
    el.routeEta.textContent = (m.route.length ? m.route.length + " hop" + (m.route.length > 1 ? "s" : "") : "Direct") + " \u00b7 ~" + Math.round(traceDuration() / 1000) + "s window";
    el.connect.disabled = !m.accepted || m.connected || m.gameOver;
    el.connect.textContent = m.connected ? "Linked" : "Connect";
    el.clear.disabled = m.connected || !m.route.length;
    el.mapHint.textContent = m.connected ? "Route locked while linked" : "Tap relays to chain hops \u00b7 " + AL.map.relayLimit() + " licensed";
    el.tilesCount.textContent = m.connected ? m.tiles.length + " clue tile" + (m.tiles.length === 1 ? "" : "s") : "";
    renderChips();
    updateTutor();
  };
  // Chips rebuild only on state change (connect, crack, cwd, download).
  function renderChips() {
    const m = M(), chips = [];
    if (!m.connected) {
      if (m.accepted && !m.gameOver) chips.push({ label: "connect", cmd: "connect " + job().target.ip, hot: true });
      chips.push({ label: "help", cmd: "help" }, { label: "scan", cmd: "scan" }, { label: "route", cmd: "route" });
    } else {
      chips.push({ label: "ls", cmd: "ls" });
      if (m.cwd) chips.push({ label: "cd ..", cmd: "cd .." });
      if (!m.cracked) chips.push({ label: "crack", cmd: "crack", icon: "key", hot: m.tiles.length >= 2 });
      if (m.cracked && !m.downloaded) chips.push({ label: "download", cmd: "download " + job().loot, icon: "data", hot: true });
      chips.push({ label: "disconnect", cmd: "disconnect", hot: m.downloaded });
    }
    el.chips.innerHTML = "";
    chips.forEach(function (c) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "chip" + (c.hot ? " hot" : "");
      b.setAttribute("data-cmd", c.cmd);
      b.innerHTML = (c.icon ? ART.icon(c.icon, 16) : "") + "<span>" + AL.esc(c.label) + "</span>";
      b.addEventListener("click", function () { AL.Audio.unlock(); AL.sfx("tap"); AL.run(c.cmd); });
      el.chips.appendChild(b);
    });
  }

  // ---------- simulated file share ----------
  function fs() { return job().fs; }
  function listing() { return M().cwd ? fs().dirs[M().cwd] || [] : fs().listing; }
  function resolve(name) {
    if (!name) return null;
    const cwd = M().cwd;
    if (cwd && fs().files[cwd + "/" + name]) return cwd + "/" + name;
    return fs().files[name] ? name : null;
  }
  function printListing() {
    const grid = document.createElement("div");
    grid.className = "fs-grid";
    listing().forEach(function (f) {
      const isDir = f.kind === "dir", name = f.name.replace(/\/$/, "");
      const key = M().cwd ? M().cwd + "/" + name : name;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "fs-link" + (isDir ? " dir" : f.kind === "bin" ? " bin" : "") + (M().readFiles[key] ? " read" : "");
      b.setAttribute("data-file", key);
      b.innerHTML = ART.icon(isDir ? "folder" : f.kind === "bin" ? "data" : "file", 18) + "<span>" + AL.esc(f.name) + "</span>";
      b.addEventListener("click", function () {
        AL.sfx("tap");
        AL.run(isDir ? "cd " + name : f.kind === "bin" ? "download " + name : "cat " + name);
      });
      grid.appendChild(b);
    });
    el.out.appendChild(grid);
    el.out.scrollTop = el.out.scrollHeight;
  }

  // ---------- commands ----------
  const need = function () { if (!M().connected) { print("Not connected.", "err"); return false; } return true; };
  const COMMANDS = {
    help: function () {
      print("Commands (or tap chips / files):", "info");
      ["scan", "route", "connect <ip>", "ls", "cd <dir>", "cat <file>", "crack   (opens the tile board)", "crack <pass>", "download <file>", "disconnect"].forEach(function (s) { print("  " + s, "dim"); });
    },
    clear: function () { el.out.innerHTML = ""; },
    accept: function () { AL.acceptOp(); },
    scan: function () {
      print("Passive map (simulated):", "info");
      const n = AL.map.nodes();
      Object.keys(n).forEach(function (id) { if (!n[id].locked) print("  " + n[id].ip.padEnd(16) + "  " + n[id].name, "dim"); });
    },
    route: function () {
      print("Bounce: " + AL.map.points().map(function (n) { return n.name; }).join(" \u2192 "), "info");
      print("Trace window ~" + Math.round(traceDuration() / 1000) + "s", "dim");
    },
    connect: function (args) {
      const m = M();
      if (m.gameOver) { print("Op over.", "err"); return; }
      if (!m.accepted) { print("Accept the op with Kite first.", "warn"); return; }
      if (m.connected) { print("Already linked.", "warn"); return; }
      const ip = (args[0] || "").trim();
      if (!ip) { print("Usage: connect <ip>", "warn"); return; }
      if (ip !== job().target.ip) { print("No route to " + ip, "err"); AL.sfx("err"); return; }
      print("Bouncing\u2026  " + AL.map.points().map(function (n) { return n.ip; }).join(" \u2192 "), "dim");
      Object.assign(m, { connected: true, cracked: false, cwd: "", connectedAt: performance.now() });
      AL.sfx("connect");
      AL.map.redraw(true);
      print("Connected to " + job().target.name + " [" + ip + "]", "ok");
      print("Guest share: read open, download locked. Tap a file:", "warn");
      printListing();
      startTrace();
      AL.chat.say(job().kite.connect);
      AL.updateChrome();
      if (window.innerWidth < 900) setTimeout(function () { if (M().connected) AL.setTab("term"); }, AL.reduceMotion() ? 0 : 650);
    },
    disconnect: function () {
      const m = M();
      if (!m.connected) { print("Not connected.", "dim"); return; }
      stopTrace();
      m.connected = false; m.cracked = false;
      resetTraceUI(); AL.map.redraw(false); AL.updateChrome();
      AL.sfx("whoosh");
      print("Link closed.", "ok");
      if (m.downloaded && !m.gameOver) complete();
      else if (!m.downloaded) { print("No loot yet.", "warn"); AL.chat.say(job().kite.disconnect_early); }
    },
    ls: function () { if (!need()) return; print("/" + M().cwd + (M().cracked ? "" : "  (guest)"), "dim"); printListing(); },
    pwd: function () { if (need()) print("/" + M().cwd); },
    cd: function (args) {
      if (!need()) return;
      const dest = (args[0] || "").replace(/\/+$/, "");
      if (!dest || dest === "/" || dest === "..") M().cwd = "";
      else if (fs().dirs[dest]) M().cwd = dest;
      else { print("cd: no such dir", "err"); return; }
      print("/" + M().cwd, "dim");
      printListing();
      AL.updateChrome();
    },
    cat: function (args) {
      if (!need()) return;
      const key = resolve((args[0] || "").trim());
      if (!key) { print(args[0] ? "cat: not found" : "Usage: cat <file>", "err"); return; }
      if (key.endsWith(".dat")) { print("binary \u2014 use download", "warn"); return; }
      line(AL.esc(fs().files[key]), "file", true);
      M().readFiles[key] = true;
      el.out.querySelectorAll(".fs-link").forEach(function (b) { if (b.getAttribute("data-file") === key) b.classList.add("read"); });
      AL.crack.addClues(key);
      if (!M().hinted) { M().hinted = true; AL.chat.say(job().kite.found_hint); }
      AL.updateChrome();
    },
    crack: function (args) { const w = args.join(" ").trim(); if (w) AL.attemptAuth(w); else AL.crack.open(); },
    login: function (args) { COMMANDS.crack(args); },
    download: function (args) {
      const m = M();
      if (!need()) return;
      if (!m.cracked) { print("Download locked \u2014 crack the gate first.", "err"); AL.sfx("err"); return; }
      const file = (args[0] || "").trim();
      if (!file) { print("Usage: download <file>", "warn"); return; }
      if (file.split("/").pop() !== job().loot) { print(resolve(file) ? "Not the contract file." : "download: not found", "dim"); return; }
      if (m.downloaded) { print("Already on your rig.", "dim"); return; }
      m.downloaded = true;
      print("Pulling " + job().loot + " \u2026", "dim");
      const bar = print("\u2591".repeat(12) + " 0%", "ok");
      const steps = AL.reduceMotion() ? 1 : 12;
      let k = 0;
      (function fill() {
        k++;
        const n = Math.round(k / steps * 12);
        bar.textContent = "\u2588".repeat(n) + "\u2591".repeat(12 - n) + " " + Math.round(k / steps * 100) + "%";
        if (k < steps) setTimeout(fill, 45); else print("Saved \u2192 loot/" + job().loot, "ok");
      })();
      AL.sfx("ok");
      AL.chat.say(job().kite.downloaded, "smirk");
      AL.updateChrome();
    },
    whoami: function () { print(M().connected ? (M().cracked ? "root" : "guest") : "ashline freelancer"); }
  };

  AL.attemptAuth = function (word) {
    const m = M();
    if (!need()) return false;
    if (m.cracked) { print("Already in.", "dim"); return true; }
    print("Submitting passphrase\u2026", "dim");
    if (String(word).toLowerCase().replace(/\s+/g, "") === job().password) {
      m.cracked = true;
      AL.sfx("unlock"); AL.flash("good");
      print("GATE OPEN \u2014 root shell granted.", "ok");
      AL.chat.say(job().kite.crack_ok, "smirk");
      AL.updateChrome();
      return true;
    }
    m.wrongGuesses++;
    AL.sfx("err"); AL.flash("bad");
    print("Incorrect. Trace accelerated.", "err");
    AL.chat.say(job().kite.crack_fail, "worried");
    penalise(AL.WRONG_PENALTY_MS);
    return false;
  };

  AL.run = function (raw) {
    const ln = String(raw || "").trim();
    if (!ln) return;
    line('<span class="p">' + AL.esc(el.prompt.textContent) + "</span> " + AL.esc(ln), "cmd", true);
    M().history.push(ln); M().histIdx = M().history.length;
    const parts = ln.split(/\s+/), fn = COMMANDS[parts[0].toLowerCase()];
    if (!fn) { print("Unknown: " + parts[0] + " \u2014 try help", "err"); AL.sfx("err"); return; }
    fn(parts.slice(1));
  };

  // ---------- complete -> choice -> news ----------
  function stars(p, wrong) { return Math.max(1, (p < 0.5 ? 3 : p < 0.8 ? 2 : 1) - (wrong >= 3 ? 1 : 0)); }
  function complete() {
    const m = M(), j = job(), s = AL.save;
    m.gameOver = true; m.won = true;
    const p = m.finalTraceP, secs = (performance.now() - m.connectedAt) / 1000, st = stars(p, m.wrongGuesses);
    const before = s.credits;
    s.credits += j.reward;
    s.stars[j.id] = Math.max(s.stars[j.id] | 0, st);
    if (j.tutorial) s.tutorialDone = true;
    AL.persist();
    AL.updateChrome();
    AL.sfx("win"); AL.flash("win");
    let starHtml = "";
    for (let i = 1; i <= 3; i++) starHtml += '<span class="' + (i <= st ? "on" : "") + '">' + ART.icon("star", 40) + "</span>";
    AL.showModal("win", "MISSION COMPLETE", j.title,
      '<div class="stars" aria-label="' + st + ' of 3 stars">' + starHtml + "</div>" +
      '<div class="roll" id="roll">+0 c</div>' +
      '<div class="rows"><div><span>Time linked</span><span>' + secs.toFixed(1) + "s</span></div>" +
      "<div><span>Hops</span><span>" + m.route.length + "</span></div>" +
      "<div><span>Trace reached</span><span>" + Math.round(p * 100) + "%</span></div>" +
      "<div><span>Wrong guesses</span><span>" + m.wrongGuesses + "</span></div>" +
      '<div class="total"><span>Balance</span><span id="roll-bal">' + AL.fmt(before) + " c</span></div></div>",
      [{ label: "Decide the file\u2019s fate", primary: true, id: "btn-fate", fn: choice }]);
    rollUp(before, j.reward);
    AL.chat.say("Clean extract. Now the hard part.", "smirk");
  }
  function rollUp(before, amount) {
    const roll = $("roll"), bal = $("roll-bal"), dur = AL.reduceMotion() ? 0 : 1200, t0 = performance.now();
    let lastTick = 0;
    (function step(now) {
      const k = dur ? Math.min(1, (now - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 3);
      roll.textContent = "+" + AL.fmt(amount * e) + " c";
      bal.textContent = AL.fmt(before + amount * e) + " c";
      if (k < 1) { if (now - lastTick > 70) { lastTick = now; AL.sfx("tick"); } requestAnimationFrame(step); }
    })(t0);
  }
  function choice() {
    AL.showModal("choice", "YOUR CALL", "What happens to the file?",
      "<p>Ashline can brief allies quietly and let Kite steer the reveal \u2014 or you put it on the public wire tonight. " + AL.esc(job().contact.name) + " will feel either one.</p>",
      [{ label: "Hand to Ashline", detail: "Quiet channel. Kite steers the reveal.", fn: function () { AL.resolveChoice("crew"); } },
       { label: "Leak publicly", detail: "Maximum heat. No taking it back.", fn: function () { AL.resolveChoice("leak"); } }]);
  }
  AL.resolveChoice = function (pick) {
    const j = job(), s = AL.save;
    s.jobChoices[j.id] = pick;
    if (s.completedJobs.indexOf(j.id) < 0) s.completedJobs.push(j.id);
    const news = pick === "crew" ? j.newsCrew : j.newsLeak;
    s.news.push({ source: news.source, title: news.title, blurb: news.blurb, job: j.id });
    if (j.actEnd) { s.act1Done = true; s.act1Choice = pick; }
    AL.persist();
    AL.sfx("whoosh");
    AL.showModal("news", "THE WORLD REACTS", "Aftermath",
      '<div class="headline"><div class="src">' + AL.esc(news.source) + "</div><h3>" + AL.esc(news.title) + "</h3><p>" + AL.esc(news.blurb) + "</p></div>" +
      "<p>You chose: <strong>" + (pick === "crew" ? "Hand to Ashline" : "Public leak") + "</strong></p>" +
      (j.actEnd ? '<div class="tease"><strong>Act I complete.</strong> ' + AL.esc(j.actTease) + "</div>" : "") +
      '<div class="rows"><div class="total"><span>Balance</span><span>' + AL.fmt(s.credits) + " c</span></div></div>",
      [{ label: "Back to hub", primary: true, id: "btn-to-hub", fn: AL.openHub }]);
  };

  // ---------- input ----------
  el.form.addEventListener("submit", function (e) { e.preventDefault(); const v = el.input.value; el.input.value = ""; AL.run(v); });
  el.input.addEventListener("keydown", function (e) {
    const m = M();
    if (e.key && e.key.length === 1 && !e.ctrlKey && !e.metaKey) AL.sfx("key");
    if (e.key === "ArrowUp" && m.history.length) {
      e.preventDefault();
      if (m.histIdx === m.history.length) m.draft = el.input.value;
      m.histIdx = Math.max(0, m.histIdx - 1); el.input.value = m.history[m.histIdx];
    } else if (e.key === "ArrowDown" && m.history.length) {
      e.preventDefault();
      if (m.histIdx < m.history.length) m.histIdx++;
      el.input.value = m.histIdx === m.history.length ? m.draft : m.history[m.histIdx];
    }
  });
  el.chatLog.addEventListener("click", function () { AL.chat.tap(!M().briefingDone); });
  el.accept.addEventListener("click", AL.acceptOp);
  el.clear.addEventListener("click", function () { AL.sfx("tap"); AL.map.clear(); });
  el.connect.addEventListener("click", function () { AL.Audio.unlock(); if (job()) AL.run("connect " + job().target.ip); });
  el.abort.addEventListener("click", function () {
    AL.sfx("tap");
    if (M().connected && !M().gameOver) {
      AL.showModal("lose", "ABORT", "Pull the plug?", "<p>You\u2019ll drop the link and lose this run. No payout.</p>",
        [{ label: "Abort to hub", primary: true, fn: AL.openHub }, { label: "Keep going", fn: function () {} }]);
    } else AL.openHub();
  });
})(window.AL);
