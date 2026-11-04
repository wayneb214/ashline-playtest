/* replay.js: endings found, Hard mode unlock, and a short bonus "What if…" day (three scenes, existing art).
   Main endings are Day 3's: win, mixed, loss, traded. The bonus day adds two more. */
(function () {
  "use strict";
  const KEY = "albion-endings", NAMES = { win: "Home safe", mixed: "Expelled, alive", loss: "On state TV", traded: "The trade", wi_good: "What if: the quiet night", wi_bad: "What if: the long night" };
  const ALL = Object.keys(NAMES);
  const get = function () { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  function found(e) { const f = get(); if (f[e]) return; f[e] = 1; try { localStorage.setItem(KEY, JSON.stringify(f)); } catch (x) {} if (window.FUN) FUN.toast && FUN.toast("Ending found: " + NAMES[e]); }
  const unlocked = function () { return ALL.slice(0, 4).some(function (e) { return get()[e]; }); };
  function titleHTML() {
    const n = ALL.filter(function (e) { return get()[e]; }).length;
    return '<div class="endings">Endings found: ' + n + " of " + ALL.length + "</div>" + (unlocked() ? '<button class="btn ghost" id="whatif">\u2726 Bonus day: What if\u2026</button>' : "");
  }
  function bindTitle() { const b = document.getElementById("whatif"); if (b) b.onclick = function () { scene(0, 0); }; }

  // the bonus day: Vass never left Vienna. Three calls; each choice is careful (+1) or rash (0).
  const SCENES = [
    { img: "v-defector", k: "Vienna \u00b7 08:00", t: "What if Vass never left Vienna?", p: "The clerk is still at her desk in the Grey House, and she has just rung the embassy line twice.",
      c: [["Tell her to sit tight and wait for a safe day", 1], ["Send a car for her now, in daylight", 0]] },
    { img: "v-border", k: "The border \u00b7 14:00", t: "A guard asks too many questions", p: "Our courier\u2019s papers are good, but the guard keeps turning the photo to the light.",
      c: [["Let him queue again at a different booth", 1], ["Have him argue his way through", 0]] },
    { img: "v-signal", k: "London \u00b7 23:00", t: "One message left to send", p: "A last line to Vienna. Short and plain, or with names, so she knows we mean it.",
      c: [["Short and plain: \u2018The weather holds\u2019", 1], ["With names, to reassure her", 0]] }
  ];
  function scene(i, score) {
    const A = window.AH;
    if (i >= SCENES.length) return end(score);
    const s = SCENES[i];
    A.chrome(false);
    A.render('<div data-screen="whatif"><div class="card dossier"><div class="kicker">Bonus day \u00b7 ' + s.k + " \u00b7 " + (i + 1) + " of 3</div>" +
      '<img class="vignette" src="' + A.pic(s.img) + '" alt=""><h2>' + s.t + "</h2><p>" + s.p + "</p>" +
      s.c.map(function (c, j) { return '<button class="card appr" data-wi="' + j + '"><div class="t">' + c[0] + "</div></button>"; }).join("") + "</div></div>", "Nothing here touches your saved game.");
    document.querySelectorAll("[data-wi]").forEach(function (b) { b.onclick = function () { scene(i + 1, score + s.c[+b.getAttribute("data-wi")][1]); }; });
  }
  function end(score) {
    const A = window.AH, good = score >= 2, e = good ? "wi_good" : "wi_bad"; found(e);
    A.render('<div data-screen="whatif-end"><div class="card dossier"><div class="kicker">Bonus day \u00b7 ending</div><img class="vignette" src="' + A.pic(good ? "v-win" : "v-mixed") + '" alt="">' +
      "<h2>" + NAMES[e] + "</h2><p>" + (good ? "Patience wins. Vass walks out of Vienna a week later, on a quiet Tuesday, with nobody watching." : "Too loud, too soon. Vass is moved to a desk job far from any codebook. Nobody is hurt, but the door is closed.") + "</p>" +
      '<button class="btn primary" id="go">Back to the title</button></div></div>');
    A.$("go").onclick = A.title;
  }
  window.REPLAY = { found: found, unlocked: unlocked, titleHTML: titleHTML, bindTitle: bindTitle, NAMES: NAMES };
})();
