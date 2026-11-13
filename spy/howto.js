/* How it works: a short, skippable briefing shown once on every new game (after the opening film),
   and any time from Help or Settings as "How to play". Seven cards, one picture and a line or two each. */
(function () {
  "use strict";
  const SEEN = "albion-howto";
  const CARDS = [
    { img: "desk-hub", alt: "Your desk at Albion House: the green phone, a stack of files and a cup of tea", t: "You are C", p: "You run Albion House, Britain\u2019s most secret service. Six days, one desk, and a Prime Minister who rings a lot." },
    { img: "howto-desk", alt: "Case files spread on the desk, each with a risk chip and a due time", t: "The desk", p: "Each morning, case files land on your desk. Tap one to lift it and read it. The chip says how risky it is, and the time says when it\u2019s due." },
    { img: "howto-send", alt: "The odds dial above three officer cards: Linnet, Wren and Harrier", t: "Send an officer", p: "Drag an officer onto the case. Each has a strength and a few quirks. The dial shows your odds before you commit." },
    { img: "howto-op", alt: "The live radio log above the Abort, Hold and Push buttons", t: "The plan and the live op", p: "Pick how they play it, then listen in on the radio. Halfway through they may ask you: <b>Push</b>, <b>Hold</b> or <b>Abort</b>." },
    { img: "howto-phone", alt: "The green No.10 telephone with a swipe to answer bar", t: "The phone", p: "When No.10 rings, swipe to answer. Let it ring out and the Prime Minister trusts you a little less." },
    { img: "howto-meters", alt: "The top bar with No.10 trust and Service out of 100, above the evening front page", t: "Keeping score", p: "<b>No.10 trust</b> is how far the Prime Minister backs you. Failed cases and missed calls cost it. Some bold plans need her sign-off, and if it\u2019s low when the week ends, you may have to resign.<br><b>Service</b> is your officers\u2019 record and morale. High, it lifts your odds on every case; low, it drags them down. Rested officers raise it overnight.<br>Both count towards each day\u2019s grade." },
    { img: "howto-rest", alt: "Linnet looking tired at her desk late at night", t: "Look after your people", p: "Officers get tired, and sometimes hurt. Rest them for a case or two, or they\u2019ll slip up when it matters most." }
  ];
  const fast = function () { return (window.AH && AH.FAST) || window.__SPY_FAST__; };
  function seen() { try { return !!localStorage.getItem(SEEN); } catch (e) { return true; } }
  // every new game (Wayne, 13 Nov: once-ever meant an old save or an earlier visit hid them for good); Skip is on every card.
  // seen() is kept for anything that wants to know. Tests opt in with ?howto=1 (and ?nocoach=1 always skips it)
  function due() { if (/[?&]nocoach=1/.test(location.search)) return false; return !fast() || /[?&]howto=1/.test(location.search); }
  function show(done, first) {
    try { localStorage.setItem(SEEN, "1"); } catch (e) {}
    const old = document.getElementById("howto"); if (old) old.remove();
    const bg = document.createElement("div"); bg.id = "howto"; bg.className = "howto-bg";
    bg.setAttribute("role", "dialog"); bg.setAttribute("aria-modal", "true"); bg.setAttribute("aria-labelledby", "ht-title");
    document.body.appendChild(bg); document.body.classList.add("in-howto");
    let i = 0, x0 = null; const wasPaused = !!window.AH_PAUSED; window.AH_PAUSED = true; // nothing ticks behind the cards
    const close = function () { window.AH_PAUSED = wasPaused; document.removeEventListener("keydown", key); bg.remove(); document.body.classList.remove("in-howto"); if (done) done(); };
    const draw = function () {
      const c = CARDS[i], last = i === CARDS.length - 1;
      bg.innerHTML = '<div class="card dossier howto" data-screen="howto"><div class="kicker">How it works \u00b7 ' + (i + 1) + " of " + CARDS.length + '</div>' +
        '<figure class="ht-pic"><img src="img/' + c.img + '.jpg" alt="' + c.alt + '"></figure>' +
        '<h2 id="ht-title" tabindex="-1">' + c.t + "</h2><p>" + c.p + "</p>" +
        '<div class="ht-dots" aria-hidden="true">' + CARDS.map(function (_, j) { return "<i" + (j === i ? ' class="on"' : "") + "></i>"; }).join("") + "</div>" +
        '<div class="ht-row">' + (i > 0 ? '<button type="button" class="btn ghost" id="ht-back">Back</button>' : '<button type="button" class="btn ghost" id="ht-skip">Skip</button>') +
        '<button type="button" class="btn primary" id="ht-next">' + (last ? (first ? "Take the chair" : "Done") : "Next") + "</button></div>" +
        (i > 0 && !last ? '<button type="button" class="linkbtn" id="ht-skip">Skip the briefing</button>' : "") + "</div>";
      const $ = function (id) { return document.getElementById(id); };
      $("ht-next").onclick = function () { if (window.SFX && SFX.tick) SFX.tick(1); if (last) close(); else { i++; draw(); } };
      if ($("ht-back")) $("ht-back").onclick = function () { i--; draw(); };
      if ($("ht-skip")) $("ht-skip").onclick = close;
      const h = $("ht-title"); if (h && h.focus) h.focus({ preventScroll: true });
    };
    const key = function (e) { if (e.key === "ArrowRight") { e.preventDefault(); if (i < CARDS.length - 1) { i++; draw(); } } else if (e.key === "ArrowLeft" && i > 0) { e.preventDefault(); i--; draw(); } else if (e.key === "Escape") close(); };
    document.addEventListener("keydown", key);
    // swipe left for the next card, right for the one before
    bg.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
    bg.addEventListener("pointerup", function (e) { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) < 50) return; if (dx < 0 && i < CARDS.length - 1) { i++; draw(); } else if (dx > 0 && i > 0) { i--; draw(); } });
    draw();
  }
  window.HOWTO = { show: show, due: due, CARDS: CARDS };
})();
