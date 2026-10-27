/* ASHLINE chat.js — Kite chat queue, typewriter with tap-to-skip, expressions */
(function (AL) {
  "use strict";
  const ART = AL.ART;
  const CHAR_MS = { slow: 28, normal: 14, fast: 5 };
  const log = AL.$("chat-log");
  const face = AL.$("kite-portrait");

  let token = 0;            // bump to cancel everything queued
  let queue = Promise.resolve();
  let fastForward = false;  // set by tapping chat during a briefing
  let typer = null;         // { finish() } for the line being typed

  function setFace(e) { face.innerHTML = ART.portrait("kite", e || "neutral", 40); }
  function parse(line) {
    const m = /^~(\w+)~/.exec(line);
    return m ? { e: m[1], html: line.slice(m[0].length) } : { e: null, html: line };
  }
  function scroll() { log.scrollTop = log.scrollHeight; }

  function append(who, html, expr) {
    const row = document.createElement("div");
    row.className = "msg " + who;
    row.innerHTML = (who === "kite" ? ART.portrait("kite", expr || "neutral", 30) : '<div class="you-av"></div>') + '<div class="bubble"></div>';
    const bubble = row.lastChild;
    bubble.innerHTML = html;
    log.appendChild(row);
    scroll();
    return bubble;
  }
  function showTyping() {
    hideTyping();
    const row = document.createElement("div");
    row.className = "msg kite"; row.id = "typing-row";
    row.innerHTML = ART.portrait("kite", "neutral", 30) + '<div class="bubble typing"><span></span><span></span><span></span></div>';
    log.appendChild(row); scroll();
  }
  function hideTyping() { const t = AL.$("typing-row"); if (t) t.remove(); }

  // Reveal text nodes character by character, leaving markup intact.
  function typewrite(node, done) {
    if (AL.reduceMotion() || fastForward) { done(); return; }
    const per = CHAR_MS[AL.save.settings.textSpeed] || 14;
    const texts = [];
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
    let t; while ((t = walker.nextNode())) { texts.push({ n: t, full: t.nodeValue }); t.nodeValue = ""; }
    let ti = 0, ci = 0, finished = false, timer = 0;
    const step = Math.max(1, Math.round(16 / per));
    function finish() {
      if (finished) return;
      finished = true; clearTimeout(timer);
      texts.forEach(function (x) { x.n.nodeValue = x.full; });
      typer = null; scroll(); done();
    }
    typer = { finish: finish };
    (function tick() {
      if (finished) return;
      for (let k = 0; k < step && ti < texts.length; k++) {
        const x = texts[ti]; ci++; x.n.nodeValue = x.full.slice(0, ci);
        if (ci >= x.full.length) { ti++; ci = 0; }
      }
      if (ti >= texts.length) { finish(); return; }
      timer = setTimeout(tick, per * step);
    })();
  }

  function enqueue(line, tok, briefing) {
    queue = queue.then(function () {
      if (tok !== token) return;
      const p = parse(line);
      return new Promise(function (resolve) {
        showTyping();
        const wait = fastForward || AL.reduceMotion() ? 60 : briefing ? 380 : 260;
        setTimeout(function () {
          hideTyping();
          if (tok !== token) { resolve(); return; }
          if (p.e) setFace(p.e);
          typewrite(append("kite", p.html, p.e), function () { setTimeout(resolve, fastForward ? 40 : 220); });
        }, wait);
      });
    });
  }

  AL.chat = {
    reset: function () {
      token++; queue = Promise.resolve(); fastForward = false;
      if (typer) typer.finish();
      typer = null; hideTyping(); log.innerHTML = ""; setFace("neutral");
    },
    cancel: function () { token++; queue = Promise.resolve(); hideTyping(); if (typer) typer.finish(); },
    // Serialized briefing; onDone runs once every line has been shown.
    briefing: function (lines, onDone) {
      const tok = token;
      lines.forEach(function (l) { enqueue(l, tok, true); });
      queue = queue.then(function () { if (tok === token) { fastForward = false; onDone(); } });
    },
    say: function (line, expr) { enqueue(expr ? "~" + expr + "~" + line : line, token, false); },
    you: function (html) { append("you", html); },
    tap: function (inBriefing) { if (inBriefing) fastForward = true; if (typer) typer.finish(); },
    setFace: setFace
  };
})(window.AL);
