/* evidence.js: the payoff after a case resolves. A grainy security-camera still or a long-lens photo of how it
   went, with the result stamped over it; key cases also get a short news flash from Thamesmouth Wireless.
   Tap to carry on; it moves on by itself in under six seconds. Every case from Day 1 to Day 6. */
(function () {
  "use strict";
  // literal paths so the web packager keeps them
  const SHOT = {
    defector: { img: "img/out-defector.jpg", kind: "cctv", cam: "CAM 14 \u00b7 WESTERN STATION, PLATFORM 3", t: "23:41" },
    mole: { img: "img/out-mole.jpg", kind: "lens", cam: "LONG LENS \u00b7 600MM \u00b7 3RD FLOOR WINDOW", t: "19:12" },
    leak: { img: "img/out-leak.jpg", kind: "lens", cam: "LONG LENS \u00b7 PRESS HALL, FLEET ROW", t: "14:52" },
    sabotage: { img: "img/out-sabotage.jpg", kind: "cctv", cam: "CAM 02 \u00b7 CABLE STATION PERIMETER", t: "02:17" },
    courier: { img: "img/out-courier.jpg", kind: "cctv", cam: "CAM 31 \u00b7 TERMINAL 2 SERVICE CORRIDOR", t: "10:06" },
    safehouse: { img: "img/out-safehouse.jpg", kind: "lens", cam: "SEARCH TEAM \u00b7 FLAT 2, BRISTOL", t: "16:40" },
    exit: { img: "img/out-exit.jpg", kind: "cctv", cam: "CAM 07 \u00b7 HARWICH GANGWAY B", t: "23:06" },
    york: { img: "img/out-york.jpg", kind: "cctv", cam: "CAM 3 \u00b7 TERRACE, YORK", t: "21:48" },
    tail: { img: "img/out-tail.jpg", kind: "lens", cam: "LONG LENS \u00b7 WESTMINSTER SQUARE", t: "17:25" },
    cable: { img: "img/out-cable.jpg", kind: "cctv", cam: "DECK CAM \u00b7 SURVEY SHIP, NORTH SEA", t: "03:12" },
    exfil: { img: "img/out-exfil.jpg", kind: "cctv", cam: "BORDER CAM \u00b7 KESSGRAD ROAD POST", t: "04:37" },
    watch: { img: "img/out-watch.jpg", kind: "lens", cam: "LONG LENS \u00b7 LAMBETH ROOFTOPS", t: "11:20" },
    manchester: { img: "img/out-manchester.jpg", kind: "cctv", cam: "CAM 9 \u00b7 HOTEL LOBBY, MANCHESTER", t: "15:03" },
    leak4: { img: "img/out-leak4.jpg", kind: "cctv", cam: "CAM 1 \u00b7 ALBION HOUSE, SIDE DOOR", t: "08:14" },
    recon: { img: "img/out-recon.jpg", kind: "lens", cam: "LONG LENS \u00b7 THE VELL BRIDGE", t: "13:40" },
    press: { img: "img/out-press.jpg", kind: "lens", cam: "LONG LENS \u00b7 FLEET ROW PRESS HALL", t: "22:55" },
    swap: { img: "img/out-swap.jpg", kind: "lens", cam: "LONG LENS \u00b7 THE VELL BRIDGE, DAWN", t: "06:02" },
    find: { img: "img/out-find.jpg", kind: "lens", cam: "LONG LENS \u00b7 HOTEL ENTRANCE, LONDON", t: "20:31" },
    chase: { img: "img/out-chase.jpg", kind: "cctv", cam: "CAM 22 \u00b7 RIVER BUS PIER", t: "17:46" },
    showdown: { img: "img/out-showdown.jpg", kind: "cctv", cam: "CAM 4 \u00b7 WHITEHALL GATE", t: "19:58" }
  };
  const NEWS = { defector: 1, sabotage: 1, exfil: 1, manchester: 1, swap: 1, showdown: 1 };
  const WORD0 = { win: "CLOSED", mixed: "PARTIAL", loss: "FAILED" };
  const NOTE = {
    cctv: { win: "SUBJECT SECURED", mixed: "PARTIAL VISUAL", loss: "SIGNAL LOST" },
    lens: { win: "POSITIVE ID", mixed: "IMAGE UNCLEAR", loss: "TARGET GONE" }
  };
  const DAYW = { 1: "WED", 2: "THU", 3: "FRI", 4: "SAT", 5: "SUN", 6: "MON" };
  // the Day 4 leak is a different case from Day 1's, with its own still
  const key = function (id) { const s = window.AH && AH.S ? AH.S() : null; return id === "leak" && s && s.day === 4 ? "leak4" : id; };
  function has(id) { const s = window.AH && AH.S ? AH.S() : null; return !!(SHOT[key(id)] && s); }
  function show(id0, res, head, done, word) {
    const id = key(id0), sh = SHOT[id], s = AH.S(), WORD = {}; WORD[res] = word || WORD0[res];
    const fast = (window.AH && AH.FAST) || window.__SPY_FAST__;
    if (!sh || (fast && !/[?&]evid=1/.test(location.search))) return done();
    const news = NEWS[id] && window.VOICE && VOICE.lines["news_" + id + "_" + res];
    const el = document.createElement("div");
    el.className = "evid " + sh.kind + " " + res; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", (sh.kind === "cctv" ? "Security camera still" : "Surveillance photograph") + ": " + WORD[res] + ". " + head);
    el.innerHTML = '<div class="ev-frame"><img src="' + sh.img + '" alt=""><i class="ev-scan" aria-hidden="true"></i>' +
      '<span class="ev-cam">' + (sh.kind === "cctv" ? '<b class="rec">\u25cf REC</b> ' : "") + sh.cam + "</span>" +
      '<span class="ev-time">' + (DAYW[s.day] || "") + " " + sh.t + ":" + String(10 + (id.length * 7) % 49).padStart(2, "0") + "</span>" +
      '<span class="ev-note">' + NOTE[sh.kind][res] + "</span>" +
      '<span class="ev-stamp ' + res + '">' + WORD[res] + "</span>" +
      "</div>" + (news ? '<div class="ev-ticker"><b>THAMESMOUTH WIRELESS \u00b7 NEWSFLASH</b><span><em>' + head + "</em></span></div>" : "") +
      '<p class="ev-tap">Tap to carry on</p>';
    document.body.appendChild(el); document.body.classList.add("in-evid");
    requestAnimationFrame(function () { el.classList.add("on"); });
    if (window.SFX && SFX.click) SFX.click();
    setTimeout(function () { if (window.FEEL) FEEL.buzz("stamp"); if (window.SFX && SFX.stamp) SFX.stamp(); }, 700);
    if (news) VOICE.play("news_" + id + "_" + res);
    let gone = false;
    const close = function () { if (gone) return; gone = true; el.classList.remove("on"); setTimeout(function () { el.remove(); document.body.classList.remove("in-evid"); done(); }, 220); };
    el.addEventListener("click", close);
    el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " " || e.key === "Escape") close(); });
    el.tabIndex = -1; el.focus({ preventScroll: true });
    setTimeout(close, 5600);
  }
  window.EVID = { has: has, show: show, SHOT: SHOT, key: key };
})();
