/* Persist progress — v3 settings; migrates v1/v2 */
window.ASHLINE_SAVE = (function () {
  "use strict";
  const KEY = "ashline_deep_water_v2"; // keep same key so v2 loads
  const BACKUP_KEY = "ashline_deep_water_v2_bak";
  const VERSION = 3;

  function defaultSettings() {
    return {
      sound: true,
      music: true,
      musicVol: 0.35,
      sfxVol: 0.7,
      textSpeed: "normal", // slow | normal | fast
      reduceMotion: false
    };
  }

  function defaults() {
    return {
      v: VERSION,
      credits: 0,
      upgrades: { traceBuffer: 0, relaySlot: 0, traceMonitor: 0 },
      completedJobs: [],
      jobChoices: {},
      news: [],
      act1Choice: null,
      act1Done: false,
      seenTitle: false,
      tutorialDone: false,
      stars: {},
      settings: defaultSettings()
    };
  }

  function isValid(data) {
    if (!data || typeof data !== "object") return false;
    if (typeof data.credits !== "number" || data.credits < 0 || !isFinite(data.credits)) return false;
    if (!data.upgrades || typeof data.upgrades !== "object") return false;
    if (typeof data.upgrades.traceBuffer !== "number") return false;
    if (typeof data.upgrades.relaySlot !== "number") return false;
    if (typeof data.upgrades.traceMonitor !== "number") return false;
    if (!Array.isArray(data.completedJobs)) return false;
    if (!Array.isArray(data.news)) return false;
    if (typeof data.jobChoices !== "object" || data.jobChoices === null) return false;
    return true;
  }

  function migrate(raw) {
    const d = defaults();
    if (!raw || typeof raw !== "object") return d;
    d.credits = Math.max(0, Number(raw.credits) || 0);
    if (raw.upgrades && typeof raw.upgrades === "object") {
      d.upgrades.traceBuffer = Math.min(2, Math.max(0, raw.upgrades.traceBuffer | 0));
      d.upgrades.relaySlot = Math.min(2, Math.max(0, raw.upgrades.relaySlot | 0));
      d.upgrades.traceMonitor = Math.min(1, Math.max(0, raw.upgrades.traceMonitor | 0));
    }
    if (Array.isArray(raw.completedJobs)) d.completedJobs = raw.completedJobs.filter(function (x) { return typeof x === "string"; });
    if (raw.jobChoices && typeof raw.jobChoices === "object") d.jobChoices = raw.jobChoices;
    if (Array.isArray(raw.news)) d.news = raw.news.slice(0, 20);
    d.act1Choice = raw.act1Choice === "crew" || raw.act1Choice === "leak" ? raw.act1Choice : null;
    d.act1Done = !!raw.act1Done;
    d.seenTitle = !!raw.seenTitle;
    d.tutorialDone = !!raw.tutorialDone || d.completedJobs.indexOf("glasswing") >= 0;
    if (raw.stars && typeof raw.stars === "object") {
      Object.keys(raw.stars).forEach(function (k) { var n = raw.stars[k] | 0; if (n >= 1 && n <= 3) d.stars[k] = n; });
    }
    if (raw.settings && typeof raw.settings === "object") {
      var s = raw.settings;
      d.settings.sound = s.sound !== false;
      d.settings.music = s.music !== false;
      d.settings.musicVol = Math.min(1, Math.max(0, Number(s.musicVol) || 0.35));
      d.settings.sfxVol = Math.min(1, Math.max(0, Number(s.sfxVol) || 0.7));
      d.settings.textSpeed = ["slow", "normal", "fast"].indexOf(s.textSpeed) >= 0 ? s.textSpeed : "normal";
      d.settings.reduceMotion = !!s.reduceMotion;
    }
    d.v = VERSION;
    return d;
  }

  function readKey(k) {
    try {
      var raw = localStorage.getItem(k);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function load() {
    var data = readKey(KEY);
    if (isValid(data)) {
      var m = migrate(data);
      if (data.v !== VERSION) save(m);
      return m;
    }
    if (data) { var fixed = migrate(data); save(fixed); return fixed; }
    var bak = readKey(BACKUP_KEY);
    if (bak) { var recovered = migrate(bak); save(recovered); return recovered; }
    var legacy = readKey("ashline_deep_water_v1");
    if (legacy) { var m2 = migrate(legacy); save(m2); return m2; }
    return defaults();
  }

  function save(data) {
    try {
      var prev = localStorage.getItem(KEY);
      if (prev) localStorage.setItem(BACKUP_KEY, prev);
    } catch (e) {}
    var payload = migrate(data);
    try { localStorage.setItem(KEY, JSON.stringify(payload)); } catch (e) {}
    return payload;
  }

  function reset() {
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem(BACKUP_KEY);
      localStorage.removeItem("ashline_deep_water_v1");
    } catch (e) {}
    return defaults();
  }

  return { load: load, save: save, reset: reset, defaults: defaults, defaultSettings: defaultSettings, KEY: KEY, VERSION: VERSION };
})();
