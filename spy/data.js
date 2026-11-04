/* Albion House content. Everything here is invented: the Varenian Republic and its Grey House,
   the firms and the people. Real places only. Loaded before spy.js and day2.js. */
window.AH_DATA = (function () {
  "use strict";
  // ---------- content ----------
  // Albion House: an invented British overseas intelligence service. The rival is the invented
  // Varenian Republic and its service, the Grey House. Real cities, invented states, firms and people.
  const METERS = [
    { id: "capital", name: "No.10 trust", txt: "Hale\u2019s faith in you. Opens the bold, signed-off plans." },
    { id: "service", name: "Service", txt: "Your officers: safe, loyal and unseen. Every point adds to the odds in the field." }
  ];
  const AGENTS = {
    macrae: { strength: "Runs people. Best with defectors and leaks.", name: "Fiona Macrae", short: "Fiona", code: "Linnet", role: "Case officer \u00b7 \u2018Linnet\u2019 \u00b7 runs people", img: "macrae", tense: "macrae-tense", happy: "macrae", look: "a red scarf", note: "Speaks fluent Varenian", clue: "Every blown operation was discussed with someone who could read the Varenian traffic without a translator.", slip: "She quoted a Grey House codeword we never told her.", skill: 4, loyalty: 4, stress: 1, cover: 3, good: ["defector", "leak"] },
    pryce: { strength: "Watches unseen. Best at spotting moles and saboteurs.", name: "Gareth Pryce", short: "Gareth", code: "Wren", role: "Watcher \u00b7 \u2018Wren\u2019 \u00b7 patient, unseen", img: "pryce", tense: "pryce-tense", happy: "pryce", look: "a green knitted hat", note: "Ran the Rotterdam watch rota", clue: "Every blown operation crossed the Rotterdam watch rota before it went wrong.", slip: "His report was timed an hour before she says she arrived.", skill: 3, loyalty: 5, stress: 2, cover: 4, good: ["mole", "sabotage"] },
    hartley: { strength: "Leads in the field. Best when it gets physical.", name: "Tom Hartley", short: "Tom", code: "Harrier", role: "Field lead \u00b7 \u2018Harrier\u2019 \u00b7 brilliant, worn thin", img: "hartley", tense: "hartley-tense", happy: "hartley", look: "a navy raincoat", note: "Spring leave: Vienna, alone", clue: "Every blown operation went wrong after someone took a quiet spring holiday in Vienna.", slip: "He knew the clerk\u2019s cover name before we\u2019d briefed him.", skill: 5, loyalty: 2, stress: 3, cover: 2, good: ["sabotage", "defector"] }
  };
  const SITS1 = {
    defector: {
      kind: "officer", art: "v-defector", title: "A clerk wants to come over", where: "Vienna", x: 66, y: 63, due: 16,
      brief: "A cipher clerk from the Grey House, the Varenian service, offers their codebook for a new life in England. She is being followed.",
      approaches: [
        { t: "Slowly, by the book", d: "Meet in a crowded caf\u00e9. Bring her out over two days.", mod: 10, risk: "low", stress: 1, win: { secrecy: 6, safety: 4, capital: 4 }, mixed: { secrecy: -2, capital: 2 }, loss: { safety: -8, capital: -6 } },
        { t: "Bring her out tonight", d: "A car at the back door. Fast, loud, decisive.", mod: -8, risk: "high", stress: 2, win: { capital: 14, secrecy: 2 }, mixed: { secrecy: -8, capital: 6 }, loss: { safety: -16, trust: -6, secrecy: -10 } },
        { t: "Let the Embassy take her", d: "Open asylum. Clean, public, and the Varenians will howl.", mod: 18, risk: "med", stress: 0, win: { trust: 8, capital: -6, secrecy: -10 }, mixed: { capital: -10, secrecy: -10 }, loss: { capital: -14, trust: -4 } }
      ],
      head: { win: "Varenian official \u2018missing\u2019 from Vienna post", mixed: "Diplomatic chill after mystery Vienna visa", loss: "Woman detained at Vienna station; Foreign Office silent" }
    },
    mole: {
      kind: "accuse", title: "Someone inside is talking", where: "Albion House, London", x: 30, y: 52, home: true, due: 18,
      brief: "Three operations blown in a month. Somebody on our own floor is passing names to the Grey House, and it\u2019s one of your three officers. The Prime Minister doesn\u2019t know yet.",
      approaches: [
        { t: "The canary trap", d: "Give each suspect a slightly different false detail and see which one comes back.", mod: 8, risk: "low", stress: 1, win: { secrecy: 12, safety: 6 }, mixed: { secrecy: 4 }, loss: { secrecy: -8, safety: -4 } },
        { t: "Bring them both in", d: "Today. Separate rooms. Push hard.", mod: -6, risk: "high", stress: 2, win: { secrecy: 14, capital: 6 }, mixed: { trust: -4, secrecy: 2 }, loss: { trust: -8, capital: -10, secrecy: -6 } },
        { t: "Freeze them out", d: "Keep both away from anything that matters. Wait.", mod: 30, risk: "med", stress: 0, win: { secrecy: 2 }, mixed: { secrecy: -6 }, loss: { secrecy: -12, safety: -6 } }
      ],
      head: { win: "Senior civil servant retires early \u2018for family reasons\u2019", mixed: "Whitehall unease as staff face interviews", loss: "Another British operation reportedly compromised" }
    },
    leak: {
      kind: "officer", title: "A file has reached the press", where: "Fleet Street, London", x: 31, y: 50, home: true, due: 13, left: true,
      brief: "The Morning Courier has a copy of an internal Albion House report. It names a source abroad. The first edition goes to press at three.",
      approaches: [
        { t: "Lunch with the editor", d: "Explain who dies if the name runs. Ask, don\u2019t threaten.", mod: 12, risk: "low", stress: 1, win: { safety: 10, trust: 6 }, mixed: { safety: 4, secrecy: -4 }, loss: { safety: -8, secrecy: -8 } },
        { t: "Recover the copy", d: "Find the file before it\u2019s set in type.", mod: -10, risk: "high", stress: 2, win: { secrecy: 12, safety: 8 }, mixed: { trust: -8, secrecy: 4 }, loss: { trust: -16, capital: -10 } },
        { t: "Have No.10 get ahead of it", d: "A statement from Downing Street before the presses roll.", mod: 20, risk: "med", stress: 0, win: { trust: 12, secrecy: -10 }, mixed: { trust: 4, secrecy: -10, safety: -4 }, loss: { trust: -6, secrecy: -14 } }
      ],
      head: { win: "Courier runs spy story without naming sources", mixed: "Leaked spy report dominates the first edition", loss: "Courier names Albion House informant; uproar in the Commons" }
    },
    sabotage: {
      kind: "judge", art: "v-cable", title: "A threat to a sea cable", where: "Bergen or Rotterdam?", x: 49, y: 33, due: 22, flash: true,
      brief: "Someone means to cut the North Sea link run by Halvard Marine, an invented firm, tonight. Two reports disagree on where. Decide what to believe first.",
      approaches: [
        { t: "Watch it quietly", d: "Watchers on site, local police on a phone call.", mod: 10, risk: "low", stress: 1, win: { safety: 6, secrecy: 6, trust: 4 }, mixed: { trust: -4 }, loss: { trust: -10, safety: -6 } },
        { t: "Let them come", d: "Wait until they\u2019re inside, then close the net.", mod: -8, risk: "high", stress: 2, win: { capital: 14, trust: 10 }, mixed: { safety: -8, capital: 4 }, loss: { safety: -14, trust: -12 } },
        { t: "Close the site", d: "Shut it down and announce a security alert.", mod: 22, risk: "med", stress: 0, win: { trust: 6, secrecy: -8, capital: -4 }, mixed: { trust: -2, capital: -8 }, loss: { trust: -8, capital: -10 } }
      ],
      head: { win: "Arrests at North Sea cable station; outage averted", mixed: "Cable station closed overnight in \u2018security drill\u2019", loss: "Blackout as harbour data hub hit; questions for London" }
    }
  };
  const PLACES = { Bergen: [49, 33], Rotterdam: [42, 54] };
  const REPORTS = [
    { id: "Bergen", alt: false, src: "Agent report \u00b7 via Gareth", grade: "Usually reliable", q: "\u201cThey go for the Bergen landing station. Tonight, after the shift change. I saw the van myself.\u201d" },
    { id: "Rotterdam", alt: true, src: "Intercept \u00b7 single source", grade: "Unconfirmed", q: "\u201cLet the English watch the north. The real work is at the Rotterdam hub.\u201d" }
  ];
  const TRUTH = "Rotterdam";
  const EMBLEM = '<svg class="emblem" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="br" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0d68a"/><stop offset=".55" stop-color="#c9a24a"/><stop offset="1" stop-color="#7a5d22"/></linearGradient></defs>' +
    '<circle cx="50" cy="50" r="47" fill="#1f3a2f" stroke="url(#br)" stroke-width="4"/><circle cx="50" cy="50" r="40" fill="none" stroke="url(#br)" stroke-width="1"/>' +
    '<path d="M50 16 l4 9 h10 l-8 6 3 9 -9 -6 -9 6 3 -9 -8 -6 h10z" fill="url(#br)"/>' +
    '<clipPath id="sh"><path d="M28 44 h44 v14 c0 12 -10 20 -22 24 c-12 -4 -22 -12 -22 -24z"/></clipPath><g clip-path="url(#sh)" opacity=".85"><rect x="20" y="40" width="60" height="46" fill="#22305a"/>' +
    '<path d="M20 40 L80 86 M80 40 L20 86" stroke="#efe6d2" stroke-width="8"/><path d="M20 40 L80 86 M80 40 L20 86" stroke="#9c2a2a" stroke-width="3"/>' +
    '<path d="M50 40 V86 M20 63 H80" stroke="#efe6d2" stroke-width="11"/><path d="M50 40 V86 M20 63 H80" stroke="#9c2a2a" stroke-width="6"/></g>' +
    '<path d="M28 44 h44 v14 c0 12 -10 20 -22 24 c-12 -4 -22 -12 -22 -24z" fill="none" stroke="url(#br)" stroke-width="2"/></svg>';

  // ---------- officers you can recruit when one is lost ----------
  const RECRUITS = {
    ada: { name: "Ada Finch", role: "Analyst turned field officer", img: "ada", tense: null, happy: "ada", skill: 3, loyalty: 3, stress: 1, cover: 3, good: ["courier", "leak", "safehouse"], quirk: "careful", quirkTxt: "Meticulous: +10% on careful plans", note: "Two years on the Varenian desk", recruit: true },
    hollis: { name: "Major Tom Hollis", role: "Old soldier \u00b7 steady hands", img: "hollis", tense: null, happy: "hollis", skill: 4, loyalty: 3, stress: 0, cover: 2, good: ["sabotage", "exit", "safehouse"], quirk: "steady", quirkTxt: "Unflappable: bold plans add no stress", note: "Retired, bored, reliable", recruit: true },
    sam: { name: "Sam Bhatt", role: "Driver \u00b7 knows every road", img: "sam", tense: null, happy: "sam", skill: 3, loyalty: 3, stress: 1, cover: 4, good: ["defector", "exit"], quirk: "quick", quirkTxt: "Back roads: every plan takes 1 hour less", note: "Ex-police, ex-everything", recruit: true }
  };

  // ---------- the kit locker: one of each per day ----------
  const KIT = {
    bug: { name: "Listening bug", icon: "\u25c9", txt: "+12% odds", odds: 12 },
    passport: { name: "Forged passport", icon: "\u2709", txt: "+8% odds, no stress from the plan", odds: 8, calm: true },
    car: { name: "Car swap", icon: "\u25a3", txt: "Plan takes 1 hour less", hours: -1 },
    key: { name: "Safe-house key", icon: "\u26bf", txt: "A failure only half as bad", soft: true }
  };

  const DIFFICULTY = {
    easy: { name: "Easy", txt: "Kinder odds (+10%), deadlines an hour later, two bugs in the locker.", odds: 10, due: 1, kit: { bug: 2, passport: 1, car: 1, key: 1 } },
    standard: { name: "Standard", txt: "The day as written.", odds: 0, due: 0, kit: { bug: 1, passport: 1, car: 1, key: 1 } },
    hard: { name: "Hard", txt: "Harsher odds (\u221210%), deadlines an hour earlier, less time to decide in the field, no safe-house key.", odds: -10, due: -1, kit: { bug: 1, passport: 1, car: 1, key: 0 } }
  };

  // first-run tips (shown once each, can be switched off)
  const TIPS = {
    briefing: "Each folder is a case. Its deadline is on the right. Tap one to start.",
    agent: "Pick who goes. Green \u2713 means the right person. High stress or low loyalty means more mistakes.",
    approach: "Careful plans take longer but are safer. You can add one item from the kit locker to help.",
    judge: "Two reports disagree. Pick the one you believe. Being wrong caps your odds.",
    accuse: "One of your officers is the mole. Compare the clue with their file notes and today\u2019s slips.",
    board: "Tap a clue, then tap the suspect it belongs to. Right links unlock the arrest options.",
    interro: "Watch how he reacts. Friendly, Hard or Bluff \u2014 one of them works on him."
  };

  // ---------- Day 2: Pale Hour ----------
  // The Varenian team that poisoned Vass in Bath is trying to leave Britain before the ports close.
  // Positions are fractions of the map image (the UK view zooms in).
  const UKPLACES = { London: [0.343, 0.536], Bath: [0.293, 0.543], Bristol: [0.283, 0.536], Harwich: [0.362, 0.516], Manchester: [0.293, 0.457], Airport: [0.331, 0.541] };
  const SITS2 = {
    courier: { kind: "interro", title: "The courier at the airport", where: "West London airport", place: "Airport", due: 12, below: true, brief: "Border officers stopped a man with a Varenian diplomatic bag that wasn\u2019t sealed. He won\u2019t say who sent him. Two hours in an interview room.",
      head: { win: "Man held at London airport \u2018helping police\u2019", mixed: "Airport passenger questioned and released", loss: "Varenian protest over airport \u2018harassment\u2019" } },
    safehouse: { kind: "officer", title: "A rented flat in Bristol", where: "Bristol", place: "Bristol", due: 15, left: true, brief: "Police traced a hire car seen in Bath to a flat above a launderette in Bristol. Someone may still be there. Whatever they left behind goes on the board.",
      approaches: [
        { t: "Watch, then search", d: "Sit on it for an hour, then go in quietly with a warrant.", mod: 10, risk: "low", stress: 1, win: { secrecy: 6, safety: 4 }, mixed: { secrecy: -2 }, loss: { safety: -8, secrecy: -6 } },
        { t: "Go in now", d: "Armed police at the door, before they can burn anything.", mod: -6, risk: "high", stress: 2, win: { trust: 8, capital: 6 }, mixed: { trust: -4, safety: -4 }, loss: { safety: -12, trust: -8 } },
        { t: "Let the police lead", d: "Our people stay in the van. It\u2019s their raid.", mod: 18, risk: "med", stress: 0, win: { trust: 6, secrecy: -6 }, mixed: { secrecy: -8 }, loss: { trust: -6, secrecy: -8 } }
      ],
      head: { win: "Bristol flat searched; \u2018significant items\u2019 recovered", mixed: "Police raid on Bristol flat finds it empty", loss: "Fire at Bristol flat as suspects flee" } },
    mole2: { kind: "mole2", title: "Unfinished business inside", where: "Albion House, London", place: "London", home: true, due: 18, brief: "", head: { win: "", mixed: "", loss: "" } },
    exit: { kind: "officer", art: "v-airport", title: "Stop them leaving", where: "Harwich or Manchester?", place: "Harwich", due: 22, flash: true, brief: "The team will try to leave tonight. The evidence board decides how much you know. Right links unlock the best plans.",
      approaches: [
        { t: "Quiet intercept at Harwich", d: "Plain clothes on the night ferry. Take them at the gangway.", mod: 14, risk: "low", stress: 1, needs: "ferry", win: { trust: 12, capital: 10, safety: 4 }, mixed: { trust: 4, capital: 2 }, loss: { trust: -10, capital: -8 } },
        { t: "Take the driver first", d: "Lift the driver at the services. The others will have no car.", mod: 4, risk: "high", stress: 2, needs: "car", win: { capital: 14, secrecy: 8 }, mixed: { safety: -6, capital: 4 }, loss: { safety: -12, trust: -8 } },
        { t: "Close every port and airport", d: "A national alert. Loud, expensive, and they\u2019ll see it coming.", mod: -4, risk: "med", stress: 0, win: { trust: 6, capital: -6 }, mixed: { trust: -4, capital: -10 }, loss: { trust: -12, capital: -12 } }
      ],
      head: { win: "Three held at Harwich in late-night swoop", mixed: "One detained at Harwich; others \u2018believed abroad\u2019", loss: "Bath suspects \u2018have left the country\u2019, police fear" } }
  };
  // suspects and clues for the evidence board; each clue belongs to exactly one suspect
  const SUSPECTS = {
    tall: { name: "The tall man", note: "Team leader. Paid cash in Bath.", photo: "\u2654" },
    green: { name: "The woman in green", note: "Seen on the bench before Vass.", photo: "\u2655" },
    driver: { name: "The driver", note: "Never left the car.", photo: "\u2656" }
  };
  const CLUES = {
    cctv: { name: "Bath CCTV still", txt: "A woman in a green coat sits down on the bench, then leaves quickly.", owner: "green", from: "start" },
    hire: { name: "Hire-car receipt", txt: "A grey saloon, hired in Bristol, returned with 400 extra miles. Signed by someone who never got out.", owner: "driver", from: "start", unlock: "car" },
    ticket: { name: "Ferry booking", txt: "Three berths, tonight\u2019s Harwich ferry, booked by a man who gave his height as 6\u20194\u201d.", owner: "tall", from: "courier", unlock: "ferry" },
    gloves: { name: "Gloves in a bin", txt: "Women\u2019s gloves, sealed in a bag, in the flat\u2019s kitchen bin.", owner: "green", from: "safehouse" },
    map: { name: "Road atlas", txt: "Motorway services circled in pencil. Driver\u2019s notes in the margin.", owner: "driver", from: "safehouse" },
    phone: { name: "Burner phone number", txt: "One number, called from Albion House\u2019s street. It belongs to the team leader.", owner: "tall", from: "mole" }
  };
  // hidden temperaments for interrogations: which approach works, and the tell he shows
  const TEMPERS = {
    proud: { works: "friendly", tell: "He straightens his tie and looks at you as an equal." },
    scared: { works: "hard", tell: "His eyes keep going to the door." },
    clever: { works: "bluff", tell: "He smiles faintly at the thin file in your hand." }
  };

  // three traits per officer, shown as badges. risk: plan risk they suit (low/med/high); cases: case ids they suit; v: odds
  const TRAITS = {
    macrae: [{ n: "Charmer", risk: "med", v: 8, tx: "People open up to her" }, { n: "Cool head", calm: true, tx: "Strain hurts her odds less" }, { n: "Impatient", risk: "low", v: -6, tx: "Hates the slow way" }],
    pryce: [{ n: "Invisible", risk: "low", v: 8, tx: "Nobody notices him" }, { n: "Patient", cases: ["mole", "sabotage", "tail", "safehouse"], v: 6, tx: "Waits for the slip" }, { n: "Can\u2019t lie", risk: "high", v: -8, tx: "Bad under pressure" }],
    hartley: [{ n: "Muscle", risk: "high", v: 8, tx: "Good when it gets rough" }, { n: "Driver", cases: ["defector", "exit", "york", "exfil", "courier"], v: 6, tx: "Knows every back road" }, { n: "Reckless", risk: "low", v: -6, tx: "Bored by careful work" }],
    ada: [{ n: "Meticulous", risk: "low", v: 10, tx: "Better on careful plans" }, { n: "Analyst", risk: "med", v: 4, tx: "Reads the file twice" }, { n: "Green", risk: "high", v: -6, tx: "New to the field" }],
    hollis: [{ n: "Unflappable", tx: "Bold plans add no strain" }, { n: "Muscle", risk: "high", v: 6, tx: "Old soldier" }, { n: "Slow", risk: "med", v: -4, tx: "Takes his time" }],
    sam: [{ n: "Back roads", tx: "Every plan takes 1h less" }, { n: "Driver", cases: ["defector", "exit", "york", "exfil", "courier"], v: 8, tx: "Knows every road" }, { n: "Talker", risk: "low", v: -4, tx: "Can\u2019t sit still" }]
  };
  return { TRAITS: TRAITS, METERS: METERS, AGENTS: AGENTS, SITS1: SITS1, PLACES: PLACES, REPORTS: REPORTS, TRUTH: TRUTH, EMBLEM: EMBLEM,
    RECRUITS: RECRUITS, KIT: KIT, DIFFICULTY: DIFFICULTY, TIPS: TIPS, UKPLACES: UKPLACES, SITS2: SITS2, SUSPECTS: SUSPECTS, CLUES: CLUES, TEMPERS: TEMPERS };
})();
