/* ASHLINE crack.js — clue tiles collected from files, and the passphrase-assembly sheet */
(function (AL) {
  "use strict";
  const ART = AL.ART;
  const $ = AL.$;
  const el = {
    sheet: $("crack"), lock: $("crack-lock"), close: $("crack-close"), hint: $("crack-hint"),
    slot: $("crack-slot"), back: $("crack-back"), clear: $("crack-clear"), tiles: $("crack-tiles"),
    form: $("crack-form"), input: $("crack-input"), submit: $("crack-submit"), penalty: $("crack-penalty")
  };
  const MAX_FRAGS = 4;
  const HINTS = {
    glasswing: "IT note: pet name + the year they got the pet.",
    driftnet: "Gate format: vessel name + berth number. Lowercase, no spaces.",
    blackcurrent: "Staff check: mother\u2019s maiden name + last 4 of badge ID."
  };
  const PLACEHOLDER = '<span class="ph">Tap tiles to build the passphrase</span>';

  function isOpen() { return !el.sheet.classList.contains("hidden"); }

  // Called after a file is read: add its fragments; first clue also reveals the decoys.
  function addClues(fileKey) {
    const m = AL.mission, job = AL.currentJob;
    const frags = (job.clues && job.clues[fileKey]) || [];
    const added = frags.filter(function (f) { return m.tiles.indexOf(f) < 0; });
    added.forEach(function (f) { m.tiles.push(f); });
    if (added.length && m.tiles.length === added.length) {
      (job.decoys || []).forEach(function (d) { if (m.tiles.indexOf(d) < 0) m.tiles.push(d); });
    }
    if (!added.length) return;
    AL.sfx("clue");
    AL.term.print("\u25c6 clue tile" + (added.length > 1 ? "s" : "") + " added: " + added.join(", "), "clue");
    AL.toast("+" + added.length + " clue tile" + (added.length > 1 ? "s" : ""));
    if (isOpen()) renderTiles();
  }

  function renderSlot() {
    const s = AL.mission.crackSlot;
    el.slot.classList.remove("bad", "good");
    el.slot.innerHTML = s.length ? s.map(function (f) { return '<span class="frag">' + AL.esc(f) + "</span>"; }).join("") : PLACEHOLDER;
  }
  function renderTiles() {
    const tiles = AL.mission.tiles;
    el.tiles.innerHTML = tiles.length ? "" : '<span class="tiles-empty">No clues yet. Read files in the share \u2014 fragments land here.</span>';
    tiles.forEach(function (f) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "tile"; b.setAttribute("data-frag", f); b.textContent = f;
      b.addEventListener("click", function () { tap(f); });
      el.tiles.appendChild(b);
    });
  }
  function tap(f) {
    const s = AL.mission.crackSlot;
    if (s.length >= MAX_FRAGS) return;
    s.push(f); AL.sfx("tile"); renderSlot();
  }

  function open() {
    const m = AL.mission;
    if (!m.connected) { AL.term.print("Not connected.", "err"); return; }
    if (m.cracked) { AL.term.print("Already in.", "dim"); return; }
    m.crackSlot = [];
    el.input.value = "";
    el.lock.className = "crack-lock";
    el.lock.innerHTML = ART.icon("lock", 24);
    el.close.innerHTML = ART.icon("x", 20);
    el.back.innerHTML = ART.icon("backspace", 18) + "<span>Undo</span>";
    el.hint.textContent = HINTS[AL.currentJob.id] || "Assemble the passphrase from what you\u2019ve read.";
    el.penalty.textContent = "Wrong guess: \u2212" + AL.WRONG_PENALTY_MS / 1000 + "s trace";
    renderSlot(); renderTiles();
    el.sheet.classList.remove("hidden");
    AL.sfx("whoosh");
  }
  function close(silent) {
    el.sheet.classList.add("hidden");
    el.input.blur();
    if (!silent) AL.sfx("tap");
  }
  function submit() {
    const m = AL.mission;
    const typed = el.input.value.trim();
    const word = typed || m.crackSlot.join("");
    if (!word) { AL.toast("Build a passphrase first"); return; }
    if (AL.attemptAuth(word)) {
      if (typed) el.slot.innerHTML = '<span class="frag">' + AL.esc(typed) + "</span>";
      el.slot.classList.add("good");
      el.lock.className = "crack-lock open";
      el.lock.innerHTML = ART.icon("unlock", 24);
      el.hint.textContent = "Gate breached. Root shell is yours.";
      setTimeout(function () { close(true); }, AL.reduceMotion() ? 200 : 900);
    } else if (!m.gameOver) {
      el.slot.classList.remove("bad"); void el.slot.offsetWidth; el.slot.classList.add("bad");
      m.crackSlot = []; el.input.value = "";
      setTimeout(renderSlot, 420);
    }
  }

  el.close.addEventListener("click", function () { close(false); });
  el.sheet.addEventListener("click", function (e) { if (e.target === el.sheet) close(false); });
  el.back.addEventListener("click", function () { AL.mission.crackSlot.pop(); AL.sfx("tap"); renderSlot(); });
  el.clear.addEventListener("click", function () { AL.mission.crackSlot = []; el.input.value = ""; AL.sfx("tap"); renderSlot(); });
  el.submit.addEventListener("click", submit);
  el.form.addEventListener("submit", function (e) { e.preventDefault(); submit(); });
  el.input.addEventListener("keydown", function (e) { if (e.key && e.key.length === 1) AL.sfx("key"); });

  AL.crack = { open: open, close: close, submit: submit, tap: tap, addClues: addClues, isOpen: isOpen };
})(window.AL);
