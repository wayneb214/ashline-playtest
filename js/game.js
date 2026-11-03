/* ASHLINE game.js — boot, global wiring and the automated-test hook */
(function (AL) {
  "use strict";
  const $ = AL.$, el = AL.el, Audio = AL.Audio;

  // Title + hub buttons
  el.btnContinue.addEventListener("click", AL.continueGame);
  el.btnNew.addEventListener("click", AL.newGame);
  el.btnSettingsTitle.addEventListener("click", AL.openSettings);
  el.btnSettingsHub.addEventListener("click", AL.openSettings);

  // Mission tabs + tutorial skip
  document.querySelectorAll(".tab").forEach(function (t) {
    t.addEventListener("click", function () { AL.sfx("tap"); AL.setTab(t.getAttribute("data-tab")); });
  });
  $("tutor-skip").addEventListener("click", function () {
    AL.tutorSkipped = true; AL.save.tutorialDone = true; AL.persist(); AL.updateTutor();
  });

  // Audio must start from a user gesture (iOS)
  function unlockAudio() { Audio.unlock(); Audio.configure(AL.save.settings); }
  document.addEventListener("pointerdown", unlockAudio, { passive: true });
  document.addEventListener("touchstart", unlockAudio, { passive: true });

  // Stop iOS rubber-banding outside the scroll areas
  const SCROLLERS = ".scene, .chat-log, .term-out, .hub-scroll, .modal, .sheet, .cmd-chips, .hop-ladder";
  document.addEventListener("touchmove", function (e) {
    if (!e.target.closest || !e.target.closest(SCROLLERS)) e.preventDefault();
  }, { passive: false });

  // Boot
  AL.applySettings();
  AL.renderTitle();
  AL.showScreen("title");

  // Test hook (used by the Playwright suite; harmless in play)
  window.__ASHLINE__ = {
    getSave: function () { return JSON.parse(JSON.stringify(AL.save)); },
    getSettings: function () { return JSON.parse(JSON.stringify(AL.save.settings)); },
    getMission: function () {
      const m = AL.mission;
      return {
        job: AL.currentJob && AL.currentJob.id, accepted: m.accepted, briefingDone: m.briefingDone, route: m.route.slice(),
        connected: m.connected, cracked: m.cracked, downloaded: m.downloaded, gameOver: m.gameOver, won: m.won,
        tiles: m.tiles.slice(), wrongGuesses: m.wrongGuesses, traceP: AL.traceProgress(),
        password: AL.currentJob && AL.currentJob.password
      };
    },
    startApp: AL.continueGame,
    openHub: AL.openHub,
    startMission: AL.startMission,
    skipBriefing: AL.skipBriefing,
    accept: AL.acceptOp,
    clickRelay: function (id) { AL.map.toggle(id); },
    run: AL.run,
    choose: AL.resolveChoice,
    setTab: AL.setTab,
    openCrack: AL.crack.open,
    submitCrack: AL.crack.submit,
    forceTraceEnd: function () { const t = AL.mission.trace; if (t.active) { t.started = performance.now() - t.duration - 1; AL.tickTrace(); } },
    setTraceProgress: function (p) { const t = AL.mission.trace; if (t.active) { t.started = performance.now() - t.duration * p; AL.tickTrace(); } },
    resetSave: function () { AL.save = AL.Save.reset(); AL.persist(); AL.applySettings(); },
    buyUpgrade: AL.buyUpgrade,
    addCredits: function (n) { AL.save.credits += n; AL.persist(); if (AL.screen === "hub") AL.renderHub(); },
    dismissOverlay: function () { el.overlay.classList.add("hidden"); },
    hint: AL.hint,
    scenes: AL.scenes,
    audio: { unlocked: Audio.isUnlocked, musicPlaying: Audio.isMusicPlaying }
  };
})(window.AL);
