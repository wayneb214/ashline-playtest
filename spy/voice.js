/* Albion House voice lines. Nothing is recorded yet: every line is silent until a file is set in VOICE.lines[id].src
   (e.g. "voice/ash_problem.m4a"). See VOICE_LINES.md for the full script. Subtitled lines show their text on screen. */
(function () {
  "use strict";
  const B = "Thamesmouth Wireless News";
  const L = {
    nar_open_1: { who: "Narrator", text: "You are C. As of tonight, you run His Majesty\u2019s most secret service." },
    nar_open_2: { who: "Narrator", text: "Nobody voted for you. Almost nobody knows your name." },
    nar_open_3: { who: "Narrator", text: "Your first day was meant to begin tomorrow." },
    nar_open_4: { who: "Narrator", text: "Then, at midnight\u2026 the telephone rang." },
    ash_problem: { who: "Ash", text: "Chief, we have a problem." },
    pm_keep_safe: { who: "Eleanor Hale", text: "Keep Britain safe, C. And keep it out of the papers." },
    ash_green_ours: { who: "Ash", text: "The woman in green isn\u2019t one of theirs, C. She\u2019s ours." },
    call_pm1: { who: "Eleanor Hale", text: "C. The Varenian ambassador is at the Foreign Office shouting about a British spy. I can tell the House we\u2019ve never heard of them, or stand by them and take the heat. Your call." },
    call_hale2: { who: "Eleanor Hale", text: "C, the Varenian ambassador has asked me about a man called Tom Archer. Is he one of yours?" },
    call_deal: { who: "Eleanor Hale", text: "C, Kesk\u2019s people have offered a deal. Leave her there, and the talks go ahead." },
    call_kesk: { who: "Colonel Kesk", text: "Good evening, C. We have never spoken. Let us keep it that way, after tonight." },
    kesk_letter_0: { who: "Colonel Kesk", text: "My dear C. Welcome to Friday. You have something of mine in York, I think. Or rather, you are about to go and look for it. K." },
    kesk_letter_1: { who: "Colonel Kesk", text: "My dear C. I have been watching how you work. I know your habits now, and I have made my arrangements. K." },
    kesk_letter_3: { who: "Colonel Kesk", text: "My dear C. Tonight you will try to take something that belongs to the Republic. I will be at the border myself. Bring a warm coat. Green, perhaps. K." },
    bulletin_day1: { who: B, sub: true, text: B + ", midnight. A man has collapsed on a bench in Bath. Police have sealed off the street, and Downing Street says it is monitoring events." },
    bulletin_day2_win: { who: B, sub: true, text: B + ". Three people were held at Harwich tonight in a late police operation. Officials will not say why." },
    bulletin_day2_lose: { who: B, sub: true, text: B + ". Police now fear the three people wanted over the Bath collapse have left the country." },
    bulletin_end_win: { who: B, sub: true, text: B + ". A woman described only as a British national has landed at an airfield in Oxfordshire. Whitehall says nothing at all." },
    bulletin_end_mixed: { who: B, sub: true, text: B + ". Confused reports from the Varenian border tonight. London neither confirms nor denies a British operation." },
    bulletin_end_traded: { who: B, sub: true, text: B + ". A British lorry driver held in Varenia is home tonight. In Kessgrad, trade talks open on Monday as planned." },
    bulletin_end_loss: { who: B, sub: true, text: B + ". The Varenian Republic has paraded a woman it calls a British spy. The Foreign Office is seeking urgent clarification." }
  };
  // officers on the radio (live ops) and their send-off replies: op_<officer>_<beat>
  const OFF = {"macrae": {"pos": "Linnet. In position. Nice and quiet.", "eyes": "Eyes on. That’s her, the one by the window.", "lost": "I’ve lost her. Give me a minute.", "ask": "C, it’s getting crowded. I need a decision.", "push": "Right. Going now.", "hold": "Holding. Patience, then.", "abort": "Pulling out. Coming home the long way.", "done": "It’s done, C. Clean as a whistle.", "hurt": "It’s gone wrong, C. I’m out, but only just.", "send1": "On it, C.", "send2": "Leave it with me.", "send3": "Aye. I’ll handle it."}, "pryce": {"pos": "Wren here. In position. Nobody’s looked twice.", "eyes": "Eyes on. Two men, a parked car.", "lost": "Lost them. Sorry, C. Working back.", "ask": "They’re getting twitchy, C. Your call.", "push": "Understood. Going in.", "hold": "Holding. I can wait all night.", "abort": "Pulling out. Nobody saw a thing.", "done": "Job done, C. Not a whisper.", "hurt": "Bad news, C. I’m hurt. Not badly. Getting clear.", "send1": "Right you are, C.", "send2": "I’ll be a shadow.", "send3": "Leave it to me, C."}, "hartley": {"pos": "Harrier. In position. Ready when you are.", "eyes": "Contact. Eyes on the target.", "lost": "I’ve lost him. Damn it.", "ask": "C, it’s on a knife edge. Push or pull me out?", "push": "Going now. Hard.", "hold": "Holding. Don’t like it, but holding.", "abort": "Pulling out. Back the long way.", "done": "Done. We’ve got it, C.", "hurt": "I’m hit, C. It’s not bad. Getting out.", "send1": "On it, C.", "send2": "Say no more.", "send3": "I’ll get it done."}};
  const CODE = {"macrae": "Linnet", "pryce": "Wren", "hartley": "Harrier"};
  Object.keys(OFF).forEach(function (k) { Object.keys(OFF[k]).forEach(function (n) { L["op_" + k + "_" + n] = { who: CODE[k], sub: n.indexOf("send") === 0, text: OFF[k][n] }; }); });
  Object.keys(L).forEach(function (k) { L[k].src = L[k].src || "audio/voice/" + k + ".mp3"; });
  // Preload metadata so cutscenes can stretch to a clip's real length (seconds).
  const LEN = {};
  Object.keys(L).forEach(function (k) { if (!L[k].src) return; try { const a = new Audio(); a.preload = "metadata"; a.onloadedmetadata = function () { if (isFinite(a.duration)) LEN[k] = a.duration; }; a.src = L[k].src; } catch (e) {} });
  let cur = null, subT = null;
  // One reusable element. iOS only lets audio play after a tap, so the first tap unlocks it.
  function player() { if (!cur) { cur = new Audio(); cur.preload = "auto"; cur.setAttribute("playsinline", ""); } return cur; }
  function unlock() {
    document.removeEventListener("pointerdown", unlock, true); document.removeEventListener("touchend", unlock, true);
    const a = player(); if (a.src && !a.paused) return;
    a.muted = true; a.src = L.ash_problem.src; const pr = a.play();
    const prime = a.src; const done = function () { if (a.muted && a.src === prime) a.pause(); a.muted = false; };
    if (pr && pr.then) pr.then(done, function () { a.muted = false; }); else done();
  }
  document.addEventListener("pointerdown", unlock, true); document.addEventListener("touchend", unlock, true);
  function subtitle(o) {
    let el = document.getElementById("subtitle");
    if (!el) { el = document.createElement("div"); el.id = "subtitle"; el.className = "subtitle"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite"); document.body.appendChild(el); }
    el.innerHTML = '<span class="sw">' + o.who + "</span>" + o.text; el.classList.add("on");
    clearTimeout(subT); subT = setTimeout(function () { el.classList.remove("on"); }, Math.max(4500, o.text.length * 60));
  }
  window.VOICE = {
    lines: L,
    len: function (id) { return LEN[id] || 0; },
    play: function (id) { const self = this; setTimeout(function () { self.now(id); }, 60); },
    now: function (id) {
      const o = L[id]; if (!o) return;
      if (o.sub) subtitle(o);
      const vv = window.PREFS ? PREFS.vol("voice") : 1;
      if (!o.src || (window.SFX && SFX.muted) || !vv) return;
      try { const a = player(); a.pause(); a.muted = false; a.src = o.src; a.currentTime = 0; a.volume = 0.9 * vv; const pr = a.play(); if (pr && pr.catch) pr.catch(function () {}); } catch (e) {}
    },
    hush: function () { if (cur) cur.pause(); },
    stop: function () { if (cur) { cur.pause(); cur.muted = false; } const el = document.getElementById("subtitle"); if (el) el.classList.remove("on"); }
  };
})();
