/* Albion House desk: the ringing desk phone (swipe to answer, timed replies, missed calls),
   timed choices inside cutscenes, and letters with hidden ink you warm over the lamp.
   Every choice is kept in S.cons, which carries forward from day to day. All invented. */
(function () {
  "use strict";
  const A = function () { return window.AH; };
  const S = function () { return window.AH.S(); };
  const C = function () { const s = S(); s.cons = s.cons || {}; s.cons.ink = s.cons.ink || {}; return s.cons; };
  const reduce = function () { return window.FEEL && FEEL.reduce; };
  const sfx = function (n, a) { if (window.SFX && SFX[n]) SFX[n](a); };
  const buzz = function (k) { if (window.FEEL) FEEL.buzz(k); };

  // seconds on a clock: longer on Easy, shorter on Hard, none with reduced motion
  function timer(base) {
    if (reduce()) return 0;
    const m = { easy: 1.6, standard: 1, hard: 0.75 }[S().diff] || 1;
    return base * m * (window.__TIMER_SCALE__ || 1);
  }
  // a countdown that pauses while the page is hidden
  function countdown(secs, bar, out) {
    if (!secs) return { stop: function () {} };
    let left = secs * 1000, last = performance.now(), live = true;
    const id = setInterval(function () {
      const now = performance.now(), dt = now - last; last = now;
      if (!live || document.hidden || window.AH_PAUSED) return;
      left -= dt; const el = document.getElementById(bar); if (el) el.style.width = Math.max(0, left / (secs * 1000) * 100).toFixed(1) + "%";
      if (left <= 0) { live = false; clearInterval(id); out(); }
    }, 100);
    return { stop: function () { live = false; clearInterval(id); } };
  }

  // ---------- the desk phone ----------
  // o: { id, line, img, ring, who, text, opts:[{k,t,chips}], def, ringSecs, replySecs, hint, answer(k, timedOut), miss() }
  function call(o) {
    const a = A(); let state = "ring", rt = null, bz = null;
    const stopAll = function () { if (rt) rt.stop(); if (bz) clearInterval(bz); sfx("stopRing"); };
    sfx("ring"); buzz("ring"); bz = setInterval(function () { buzz("ring"); }, 3000);
    const ringSecs = timer(o.ringSecs || 14);
    a.render('<div class="phone card desk" id="phone" data-call="' + o.id + '"><div class="lh">' + o.line + '</div><div class="pm"><img src="' + a.pic(o.img) + '" alt=""></div><div class="ringing">\u260e ' + o.ring + "</div>" +
      '<div class="swipe" id="swipe"><div class="swipe-fill" id="swipefill"></div><span class="swipe-tx">Swipe to answer \u2192</span><button class="knob" id="answer" type="button" aria-label="Answer the phone">\u260e</button></div>' +
      (ringSecs ? '<div class="ringbar" aria-hidden="true"><i id="ringbar"></i></div>' : "") + "</div>" +
      '<button class="btn ghost" id="letring">Let it ring</button>', "Swipe the receiver across, or tap it, to answer." + (ringSecs ? " It won\u2019t ring forever." : ""));
    const miss = function () { if (state !== "ring") return; state = "missed"; stopAll(); C().missed = (C().missed || 0) + 1; buzz("loss"); o.miss(); };
    const answer = function () { if (state !== "ring") return; state = "talk"; stopAll(); buzz("stamp"); talk(); };
    rt = countdown(ringSecs, "ringbar", miss);
    a.$("letring").onclick = miss;
    // drag the knob along the track
    const knob = a.$("answer"), track = a.$("swipe"); let x0 = null, dx = 0, dragged = false;
    const maxX = function () { return track.clientWidth - knob.offsetWidth - 8; };
    knob.addEventListener("pointerdown", function (e) { x0 = e.clientX; dx = 0; dragged = false; try { knob.setPointerCapture(e.pointerId); } catch (er) {} });
    knob.addEventListener("pointermove", function (e) {
      if (x0 == null) return; dx = Math.max(0, Math.min(maxX(), e.clientX - x0)); if (dx > 6) dragged = true;
      knob.style.transform = "translateX(" + dx + "px)"; a.$("swipefill").style.width = (dx + knob.offsetWidth) + "px";
    });
    knob.addEventListener("pointerup", function () { if (x0 == null) return; x0 = null; if (dx > maxX() * 0.7) answer(); else { knob.style.transform = ""; a.$("swipefill").style.width = ""; } });
    knob.addEventListener("click", function () { if (!dragged) answer(); });
    function talk() {
      if (window.VOICE) VOICE.play("call_" + o.id);
      let sel = null, tt = null;
      const secs = timer(o.replySecs || 20);
      const commit = function (k, timedOut) { if (state !== "talk") return; state = "done"; if (tt) tt.stop(); C().calls = C().calls || {}; C().calls[o.id] = { k: k, late: !!timedOut }; o.answer(k, !!timedOut); };
      const draw = function () {
        a.render('<div class="phone card call desk" id="phone" data-call="' + o.id + '"><div class="lh">' + o.line + " \u00b7 " + a.hh(S().hour) + '</div><div class="pm"><img src="' + a.pic(o.img) + '" alt=""></div>' +
          '<div class="note"><div class="who">' + o.who + '</div><span class="tx">' + o.text + "</span></div>" + (secs ? '<div class="replybar" aria-hidden="true"><i id="replybar"></i></div><div class="replyhint">Answer before the line goes quiet' + "</div>" : "") + "</div>" +
          o.opts.map(function (p) { return '<button class="card appr' + (sel === p.k ? " sel" : "") + '" data-c="' + p.k + '"><div class="t">' + p.t + '</div><div class="chips">' + p.chips + "</div></button>"; }).join("") +
          '<div class="sticky-go"><button class="btn primary" id="go"' + (sel ? "" : " disabled") + ">" + (sel ? o.say || "Tell them" : "What do you say?") + "</button></div>", o.hint || "There is no right answer. Only a choice.");
        document.querySelectorAll("[data-c]").forEach(function (b) { b.onclick = function () { sel = b.getAttribute("data-c"); commit(sel, false); }; });
        a.$("go").onclick = function () { commit(sel, false); };
      };
      draw();
      tt = countdown(secs, "replybar", function () { commit(sel || o.def, true); });
    }
  }
  // the outcome card after a call
  function after(stamp, cls, title, txt, ch, head, faceK) {
    const a = A(); a.meters(ch); a.ticker(); a.save("briefing");
    a.render('<div class="card outcome ' + cls + '"><span class="stamp thud">' + stamp + "</span>" + (faceK ? '<div class="ohead">' + a.face(faceK, cls === "loss" ? "tense" : "") + "<h2>" + title + "</h2></div>" : "<h2>" + title + "</h2>") + "<p>" + txt + "</p>" +
      (ch && Object.keys(ch).length ? a.deltas(ch) : "") + (head ? a.headline(head) : "") + '</div><button class="btn primary" id="go">Back to the desk</button>', "That will echo.");
    a.$("go").onclick = a.briefing;
  }
  const late = function (t) { return t ? "You hesitate too long. " : ""; };

  // Day 1: a frightened officer abroad
  function panicCall() {
    const a = A(), s = S(), used = s.log.filter(function (l) { return l.k && s.roster.indexOf(l.k) >= 0; }).map(function (l) { return l.k; });
    const k = used.filter(function (x) { return !s.call || x !== s.call.k; }).slice(-1)[0] || used.slice(-1)[0] || s.roster[0];
    C().panic = { k: k };
    call({ id: "panic", line: "DESK LINE \u00b7 COLLECT CALL", img: a.AG(k).img, ring: a.first(k) + ", from a hotel phone", who: a.AG(k).name, say: "Tell " + a.first(k),
      text: "C? It\u2019s " + a.first(k) + ". There\u2019s a grey car outside the hotel. The same one as this morning. <b>I think I\u2019m blown.</b> Do I run?",
      opts: [{ k: "sit", t: "Sit tight. Walk out in the morning.", chips: '<span class="chip risk-low">+4 Secrecy</span><span class="chip risk-high">' + a.first(k) + " loyalty \u22121 \u00b7 stress +1</span>" },
        { k: "home", t: "Get out now. Ash books you home.", chips: '<span class="chip risk-high">\u22124 Secrecy</span><span class="chip risk-low">' + a.first(k) + " loyalty +1 \u00b7 stress \u22121</span>" }],
      def: "sit", hint: "Officers remember who picked up.",
      answer: function (c, t) {
        let ch; C().panic.choice = c;
        if (c === "home") { ch = a.apply({ secrecy: -4 }); s.loyal[k] = a.clamp5(s.loyal[k] + 1); s.stress[k] = a.clamp5(s.stress[k] - 1); }
        else { ch = a.apply({ secrecy: 4 }); s.loyal[k] = a.clamp5(s.loyal[k] - 1); s.stress[k] = a.clamp5(s.stress[k] + 1); }
        after(c === "home" ? "COME HOME" : "HOLD", c === "home" ? "win" : "mixed", a.first(k) + " on the line", late(t) + (c === "home" ? "Ash has " + a.first(k) + " on a dawn flight. Somebody abroad will notice the empty room." : a.first(k) + " goes quiet, then: \u201cRight. Fine.\u201d The line clicks. The car is still there at midnight."), ch, null, k);
      },
      miss: function () {
        C().panic.choice = "missed"; s.loyal[k] = a.clamp5(s.loyal[k] - 2); s.stress[k] = a.clamp5(s.stress[k] + 1); a.advance(0);
        after("MISSED", "loss", "Nobody answered", a.first(k) + " rang three times from a hotel lobby. Nobody picked up. <b>They won\u2019t forget it.</b> Loyalty \u22122.", {}, null, k);
      } });
  }
  // Day 2: No.10 asks about Bath
  function haleCall() {
    const a = A();
    call({ id: "hale2", line: "NO.10 SWITCHBOARD \u00b7 SECURE LINE", img: "pm-phone", ring: "The Prime Minister for you, C.", who: "Eleanor Hale \u00b7 Prime Minister", say: "Tell her",
      text: "C. The man on the bench in Bath. The Courier says he was one of ours. <b>Was he?</b> I need to know before I stand up in the House.",
      opts: [{ k: "truth", t: "Tell her the truth", chips: '<span class="chip risk-low">+8 No.10 trust</span><span class="chip risk-high">\u22126 Secrecy</span>' },
        { k: "deny", t: "\u201cNever heard of him, Prime Minister.\u201d", chips: '<span class="chip risk-low">+4 Secrecy</span><span class="chip risk-high">\u22124 No.10 trust</span>' }],
      def: "deny", hint: "No.10 trust opens and closes options.",
      answer: function (c, t) {
        C().hale2 = c; const ch = a.apply(c === "truth" ? { capital: 8, secrecy: -6 } : { capital: -4, secrecy: 4 });
        after(c === "truth" ? "TOLD" : "DENIED", c === "truth" ? "win" : "mixed", "The call from No.10", late(t) + (c === "truth" ? "A long breath. \u201cThank you for not lying to me, C.\u201d" : "\u201cI see.\u201d She doesn\u2019t sound like she does."), ch);
      },
      miss: function () { C().hale2 = "missed"; const ch = a.apply({ capital: -8 }); S().heads.push("PM \u2018unable to reach\u2019 spy chief, say aides");
        after("MISSED", "loss", "No.10 rang", "The switchboard tried four times. Hale\u2019s private secretary writes it down.", ch, "PM \u2018unable to reach\u2019 spy chief, say aides"); } });
  }
  // Day 3: Kesk on an open line
  function keskCall() {
    const a = A();
    call({ id: "kesk", line: "OPEN LINE \u00b7 INTERNATIONAL \u00b7 NUMBER WITHHELD", img: "kesk", ring: "A foreign exchange. No name.", who: "Colonel Anselm Kesk", say: "Do it",
      text: "Good evening, C. Is it raining in London? It is snowing here. I only rang to say <b>I am looking forward to tonight.</b> Are you?",
      opts: [{ k: "talk", t: "Keep him talking. Trace the line.", chips: '<span class="chip risk-low">+8% at the barrier if traced</span><span class="chip risk-high">Ash\u2019s team up all night</span>' },
        { k: "hang", t: "Put the phone down.", chips: '<span class="chip risk-low">+4 Secrecy</span>' }],
      def: "hang", hint: "Kesk learns how you play.", replySecs: 16,
      answer: function (c, t) {
        C().kesk = c; const ch = c === "hang" ? a.apply({ secrecy: 4 }) : {};
        after(c === "talk" ? "TRACED" : "CLICK", c === "talk" ? "win" : "mixed", "Colonel Kesk", late(t) + (c === "talk" ? "Four minutes on the weather and the price of coal. Ash slides a note across: <b>a guard hut, a mile behind the barrier.</b> +8% at the barrier." : "You put the phone down. It rings again, once, and stops."), ch);
      },
      miss: function () { C().kesk = "missed"; after("MISSED", "loss", "An international call", "Nobody answered. The switchboard says the caller laughed. <b>He knows we\u2019re rattled:</b> \u22126% at the barrier.", {}); } });
  }

  // ---------- hidden ink ----------
  const INK = {
    kesk: { clue: "Hidden ink: change of dog handler at 21:30", t: "Not from K. The dog handler changes at half past nine. Go after. \u2014 a friend in the Grey House" },
    linden: { clue: "Hidden ink: LINDEN\u2019s real signal", t: "Kiosk, not the bench. If the man in grey is there, walk past. L." }
  };
  function inkHTML(key) {
    const r = !!C().ink[key];
    return '<p class="ink' + (r ? " shown" : "") + '" data-ink="' + key + '" style="--h:' + (r ? 1 : 0) + '">' + INK[key].t + "</p>";
  }
  function lampHTML(key) {
    const r = !!C().ink[key];
    return '<div class="lampzone" id="lampzone"><div class="lampglow" id="lampglow"></div><div class="lampshade" aria-hidden="true"></div><p class="lamptip" id="lamptip">' +
      (r ? "\u2713 " + INK[key].clue : "Something is written in lemon juice. <b>Press and hold the letter</b>, or drag it down to the lamp.") + "</p>" +
      (r ? "" : '<button class="btn ghost" id="inkreveal">Reveal hidden ink</button>') + "</div>";
  }
  function ink(paper, key, onReveal) {
    const a = A(), el = paper.querySelector('[data-ink="' + key + '"]'); if (!el || C().ink[key]) return;
    let heat = 0, held = false, y0 = 0, dy = 0, last = 0, raf = 0;
    const set = function () { el.style.setProperty("--h", Math.min(1, heat).toFixed(3)); const g = document.getElementById("lampglow"); if (g) g.style.opacity = (0.45 + Math.min(1, heat) * 0.55).toFixed(2); };
    const reveal = function () {
      if (C().ink[key]) return; C().ink[key] = true; heat = 1; set(); el.classList.add("shown"); held = false; cancelAnimationFrame(raf);
      paper.style.translate = ""; paper.classList.remove("warming"); buzz("stamp"); sfx("tele"); a.save("briefing");
      const z = document.getElementById("lampzone"); if (z) z.outerHTML = lampHTML(key);
      if (onReveal) onReveal();
    };
    const step = function (ts) {
      const dt = last ? Math.min(100, ts - last) : 16; last = ts;
      if (held) heat += dt / (dy > 60 ? 800 : 1700); else heat = Math.max(0, heat - dt / 6000);
      set(); if (heat >= 1) return reveal();
      if (held || heat > 0) raf = requestAnimationFrame(step); else raf = 0;
    };
    paper.addEventListener("pointerdown", function (e) { if (e.target.closest("button")) return; held = true; y0 = e.clientY; dy = 0; last = 0; paper.classList.add("warming"); try { paper.setPointerCapture(e.pointerId); } catch (er) {} if (!raf) raf = requestAnimationFrame(step); });
    paper.addEventListener("pointermove", function (e) { if (!held) return; dy = Math.max(0, Math.min(160, e.clientY - y0)); if (!reduce()) paper.style.translate = "0 " + dy + "px"; });
    const up = function () { held = false; dy = 0; paper.style.translate = ""; paper.classList.remove("warming"); };
    paper.addEventListener("pointerup", up); paper.addEventListener("pointercancel", up);
    paper.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    const b = document.getElementById("inkreveal"); if (b) b.onclick = reveal;
  }
  // LINDEN's note, found in the York house
  function lindenNote() {
    const a = A(); C().lindenNote = true; a.save("briefing");
    a.render('<div class="kicker">The York house \u00b7 the airing cupboard</div><div class="kletter card lnote" id="lnote"><div class="kl-from">A postcard of York Minster, unsigned</div>' +
      '<div class="kl-body"><p>Dear Auntie, the weather here is dreadful and the tea is worse. Do not worry about me. I have my good coat.</p>' + inkHTML("linden") + '<p class="kl-sig">x</p></div></div>' +
      lampHTML("linden") + '<button class="btn primary" id="go">Back to the desk</button>', "Hidden ink shows when the paper warms.");
    ink(a.$("lnote"), "linden");
    a.$("go").onclick = a.briefing;
  }

  // ---------- timed choices inside cutscenes ----------
  const ASKS = {
    bath: { q: "Our man is down. The ambulance is two minutes out.", def: "away", secs: 9,
      opts: [{ k: "doctor", t: "Send our doctor in with it", d: "\u22126 Secrecy \u00b7 Vass may talk: +10% on the ferry tomorrow" }, { k: "away", t: "Stay out of sight", d: "+4 Secrecy" }],
      res: { doctor: "Our doctor rides in the back. Vass grips her hand.", away: "Our people melt into the rain." } },
    ferry: { q: "The ferry is turning for the harbour mouth.", def: "watch", secs: 9,
      opts: [{ k: "follow", t: "Put a boat on its tail", d: "\u22124 No.10 trust \u00b7 +10% in York on Friday" }, { k: "watch", t: "Let it go. Watch the port.", d: "+4 Secrecy" }],
      res: { follow: "A grey launch slips out behind it, lights off.", watch: "Binoculars on the quay. Patience." } },
    border: { q: "The guard is waving cars through fast. Ash on the radio: \u201cYour call.\u201d", def: "hold", secs: 7,
      opts: [{ k: "drive", t: "Wave us through. Drive on.", d: "+14% with the dog \u00b7 \u22128% at the barrier" }, { k: "hold", t: "Hold it. Let the queue settle.", d: "+6% at the barrier" }],
      res: { drive: "Second gear. Don\u2019t look at the dog.", hold: "Engine off. Breathe." } }
  };
  function askOf(id) { return ASKS[id] || null; }
  function asked(id) { return !!(C().asks && C().asks[id]); }
  function choose(id, k, timedOut) {
    const a = A(); C().asks = C().asks || {}; C().asks[id] = { k: k, late: !!timedOut };
    let ch = {};
    if (id === "bath") ch = a.apply(k === "doctor" ? { secrecy: -6 } : { secrecy: 4 });
    if (id === "ferry") ch = a.apply(k === "follow" ? { capital: -4 } : { secrecy: 4 });
    if (Object.keys(ch).length) a.meters(ch);
    a.save(S().screen || "briefing");
    return ASKS[id].res[k];
  }
  const pick = function (id) { return C().asks && C().asks[id] ? C().asks[id].k : null; };

  // ---------- what the choices are worth ----------
  function oddsMod(id) {
    const s = S(); let o = 0;
    if (s.day === 2 && id === "exit" && pick("bath") === "doctor") o += 10;
    if (s.day === 3 && id === "york" && pick("ferry") === "follow") o += 10;
    return o;
  }
  function stageHelps(key) {
    const c = C(), out = [];
    if (key === "signal" && c.ink.linden) out.push(["LINDEN\u2019s hidden note", 12]);
    if (key === "dog" && c.ink.kesk) out.push(["Hidden ink: handler change", 10]);
    if (key === "dog" && pick("border") === "drive") out.push(["You drove on", 14]);
    if (key === "barrier" && pick("border") === "drive") out.push(["Drove on: they radioed ahead", -8]);
    if (key === "barrier" && pick("border") === "hold") out.push(["You held your nerve", 6]);
    if (key === "barrier" && c.kesk === "talk") out.push(["Kesk\u2019s call traced", 8]);
    if (key === "barrier" && c.kesk === "missed") out.push(["Missed Kesk\u2019s call", -6]);
    return out;
  }
  function follows() {
    const c = C(), out = [];
    if (pick("bath") === "doctor") out.push({ g: 1, t: "Day 1 \u00b7 Our doctor rode with Vass. He talked on Thursday." });
    if (pick("ferry") === "follow") out.push({ g: 1, t: "Day 2 \u00b7 A boat followed the ferry: +10% in York." });
    if (c.panic && c.panic.choice === "missed") out.push({ g: 0, t: "Day 1 \u00b7 You missed " + A().first(c.panic.k) + "\u2019s call. They remember." });
    if (c.hale2 === "missed") out.push({ g: 0, t: "Day 2 \u00b7 You missed the Prime Minister\u2019s call." });
    return out;
  }
  // desk interruptions, checked from the brief
  function interrupt() {
    const s = S(), c = C(), n = s.log.length;
    if (s.day === 1 && s.call && !c.panic && s.log.filter(function (l) { return l.k; }).length >= 3) { panicCall(); return true; }
    if (s.day === 2 && !c.hale2 && n >= 2) { haleCall(); return true; }
    if (s.day === 3 && s.done.york && !c.lindenNote) { lindenNote(); return true; }
    if (s.day === 3 && !c.kesk && n >= 3 && s.deal && s.deal !== "pending" && s.deal !== "deal" && !s.done.exfil) { keskCall(); return true; }
    return false;
  }

  window.DESK = { timer: timer, countdown: countdown, call: call, after: after, ink: ink, inkHTML: inkHTML, lampHTML: lampHTML, askOf: askOf, asked: asked, choose: choose,
    oddsMod: oddsMod, stageHelps: stageHelps, follows: follows, interrupt: interrupt, cons: C, INK: INK };
})();
