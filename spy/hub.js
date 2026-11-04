/* hub.js: the painted desk at the top of each briefing. Tap the objects:
   the red phone (No.10 trust: its lamp glows brighter the more No.10 trusts you), the brass gauge (Service),
   the case files (jump to today's cases) and the ledger (the ☰ menu). */
(function () {
  "use strict";
  function html() {
    const A = window.AH, S = A.S(), t = S.meters.capital, v = A.svc();
    const ang = -120 + v * 2.4;
    return '<div class="hub" id="hub"><img src="img/desk-hub.jpg" alt="Your desk at Albion House: a red-lamp telephone, a brass gauge, case files and a ledger">' +
      '<span class="hub-lamp" style="opacity:' + (0.25 + t / 130).toFixed(2) + '"></span>' +
      '<svg class="hub-needle" viewBox="0 0 40 40" aria-hidden="true"><line x1="20" y1="20" x2="20" y2="5" transform="rotate(' + ang + ' 20 20)"/><circle cx="20" cy="20" r="2.5"/></svg>' +
      '<button class="hs hs-phone" data-hs="phone" aria-label="Red phone: No.10 trust ' + t + '"><span>No.10 ' + t + '</span></button>' +
      '<button class="hs hs-gauge" data-hs="gauge" aria-label="Brass gauge: Service ' + v + '"><span>Service ' + v + '</span></button>' +
      '<button class="hs hs-files" data-hs="files" aria-label="Today\u2019s case files"><span>Cases</span></button>' +
      '<button class="hs hs-ledger" data-hs="ledger" aria-label="Ledger: menu"><span>Ledger</span></button></div>';
  }
  function info(h) { MENU.sheet(h + '<button class="btn primary" id="hs-back">Got it</button>'); document.getElementById("hs-back").onclick = MENU.close; }
  function bind() {
    const A = window.AH, S = A.S();
    document.querySelectorAll("[data-hs]").forEach(function (b) {
      b.onclick = function () {
        const h = b.getAttribute("data-hs"); FEEL.buzz("tap");
        if (h === "files") { if (window.SFX && SFX.paper) SFX.paper(); const c = document.querySelector("[data-sit]"); if (c) c.scrollIntoView({ behavior: FEEL.reduce ? "auto" : "smooth", block: "center" }); return; }
        if (h === "ledger") { MENU.open(); return; }
        if (h === "phone") { if (window.SFX && SFX.ring) SFX.ring(); info("<h2>The red phone</h2><p>No.10 trust is <b>" + S.meters.capital + "</b>. The lamp glows brighter the more the Prime Minister trusts you. Low trust locks plans that need No.10\u2019s sign-off.</p>"); return; }
        if (h === "gauge") { if (window.SFX && SFX.tick) SFX.tick(); info("<h2>The Service gauge</h2><p>Service is <b>" + A.svc() + "</b>: the field record plus how your officers feel. The right officer on their own plan steadies it. Tired, overruled or lost officers drain it.</p>"); }
      };
    });
    MENU.coach("hub", "This is your desk. Tap the <b>red phone</b> for No.10 trust, the <b>brass gauge</b> for the Service, or the <b>files</b> for today\u2019s cases.");
  }
  window.HUB = { html: html, bind: bind };
})();
