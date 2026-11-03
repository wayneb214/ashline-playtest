/* ASHLINE — Act 1 story & job data (all fictional) */
window.ASHLINE_DATA = (function () {
  "use strict";

  const RELAYS = [
    { id: "relay1", name: "Reykjavík", ip: "10.200.1.17", side: "left", x: 439, y: 35 },
    { id: "relay2", name: "Lagos", ip: "10.200.44.9", x: 509, y: 223 },
    { id: "relay3", name: "Mumbai", ip: "10.200.88.3", x: 702, y: 182 },
    { id: "relay4", name: "Fortaleza", ip: "10.200.12.61", x: 393, y: 257 },
    { id: "relay5", name: "Busan", ip: "10.200.77.4", x: 858, y: 130 }
  ];

  const UPGRADES = [
    {
      id: "traceBuffer",
      icon: "clock",
      name: "Trace Buffer",
      desc: "+8s base window before a trace lands.",
      cost: 3500,
      max: 2
    },
    {
      id: "relaySlot",
      icon: "relay",
      name: "Relay License",
      desc: "Unlock one more bounce node on the map.",
      cost: 4000,
      max: 2
    },
    {
      id: "traceMonitor",
      icon: "radar",
      name: "Trace Monitor",
      desc: "Pulse warning when the trace crosses 50%.",
      cost: 2500,
      max: 1
    }
  ];

  // Story scenes: painted stills with slow pan/zoom and subtitles. Reused for breakaways between jobs.
  const SCENES = {
    intro: [
      { img: "img/intro-1.jpg", from: "scale(1.08) translate(0,2%)", to: "scale(1.18) translate(0,-3%)", sfx: "whoosh", kicker: "Shetland · 02:14", line: "The North Sea. Every message between two continents runs through cables like this one." },
      { img: "img/intro-2.jpg", from: "scale(1.2) translate(2%,0)", to: "scale(1.06) translate(-2%,2%)", sfx: "err", kicker: "Kelp Line · 140 m down", line: "At 2:14 this morning, one of them went dark." },
      { img: "img/intro-3.jpg", from: "scale(1.05)", to: "scale(1.2) translate(0,2%)", sfx: "heartbeat", kicker: "Same night", line: "Nobody admits to the machine that was down there." },
      { img: "img/intro-4.jpg", from: "scale(1.15) translate(-2%,0)", to: "scale(1.05) translate(2%,0)", sfx: "warn", kicker: "Breaking", line: "“A routine data outage,” says the operator. Analysts aren’t buying it." },
      { img: "img/intro-5.jpg", from: "scale(1.2) translate(0,-4%)", to: "scale(1.06) translate(0,0)", sfx: "connect", kicker: "Kite · Ashline handler", portrait: "kite", line: "I’m Kite. Ashline is a small crew. We get into places and find out what they’re hiding. You’re our new operator." },
      { img: "img/intro-5.jpg", from: "scale(1.06)", to: "scale(1.14) translate(0,3%)", sfx: "unlock", kicker: "Kite", portrait: "kite", line: "Someone’s listening to the seabed. We’re going to find out who." }
    ]
  };

  const JOBS = [
    {
      id: "glasswing",
      act: 1,
      title: "Op Glasswing",
      short: "Aether Dynamics gateway",
      reward: 4500,
      blurb: "Pull a sensor schematic from an aerospace lab on the Marseille waterfront, where half the Mediterranean's cables come ashore.",
      target: { id: "target", name: "Aether Dynamics", ip: "203.0.113.42", city: "Marseille", x: 515, y: 103 },
      password: "pixel2019",
      loot: "schematic_v3.dat",
      threat: 1,
      art: "glasswing",
      contact: { who: "lena", name: "Lena Novak", role: "Gateway Ops lead, Aether Dynamics", bio: "Loves her dog. Hates password policy. Posts too much." },
      clues: {
        "notes.txt": [],
        "inbox/from_hr_welcome.eml": ["lena"],
        "inbox/from_sam_password_hint.eml": ["pixel"],
        "social/lena_novak_feed.txt": ["2019", "2021"]
      },
      decoys: ["novak", "2024"],
      tutorial: true,
      where: "Lena's inbox and social feed",
      hints: ["Open inbox/ and social/. Lena overshares.", "Sam's email says pet name + year. Her feed says when Pixel came home.", "Tiles: pixel + 2019."],
      kiteBoot: [
        "~smirk~First job. <em>Aether Dynamics</em> in Marseille builds sensors that clip onto undersea cables.",
        "Get into their share, find Lena Novak's password, grab <code>schematic_v3.dat</code>. I'll walk you through it.",
        "Tap <em>Accept</em> when you're ready."
      ],
      kite: {
        connect: "Link's live. Guest share is open — tap folders, dig inbox and social, then crack.",
        crack_fail: "Nope. Read Lena's crumbs again.",
        crack_ok: "Ha. Pixel says hi. Download the schematic before the trace walks home.",
        found_hint: "People write their lives into passwords. Keep digging if you need the year.",
        downloaded: "Got it. Disconnect before their fictional IDS finishes the walk.",
        disconnect_early: "Empty-handed. Cute. Come back when you want the file."
      },
      fs: {
        listing: [
          { name: "inbox/", kind: "dir" },
          { name: "social/", kind: "dir" },
          { name: "notes.txt", kind: "txt" },
          { name: "schematic_v3.dat", kind: "bin" },
          { name: "access.log", kind: "txt" }
        ],
        dirs: {
          inbox: [
            { name: "from_hr_welcome.eml", kind: "txt" },
            { name: "from_sam_password_hint.eml", kind: "txt" }
          ],
          social: [{ name: "lena_novak_feed.txt", kind: "txt" }]
        },
        files: {
          "notes.txt":
            "IT sticky (scanned):\n\"Gateway passphrase = Lena's formula.\n pet name + year we got them\n Check her mail / social.\"\n— night-ops",
          "access.log": "00:01 auth fail\n00:09 gate challenge\n00:11 idle",
          "schematic_v3.dat": "[binary — fictional Aether Dynamics cable-sensor schematic]",
          "inbox/from_hr_welcome.eml":
            "From: hr@aether-dynamics.example\nTo: l.novak@aether-dynamics.example\nSubject: Welcome, Lena!\n\nGlad you're leading Gateway Ops.\nShared gate passphrase is personal to you\n(the pet formula from onboarding).",
          "inbox/from_sam_password_hint.eml":
            "From: s.okonkwo@aether-dynamics.example\nTo: l.novak@aether-dynamics.example\nSubject: re: locked out again\n\nLena — I am NOT resetting the gate every Monday.\nPet + year. You said Pixel would never let you forget.",
          "social/lena_novak_feed.txt":
            "— @lena.novak (fictional) —\n\n[2019-04-12] Brought Pixel home today.\n             Best decision of 2019.\n\n[2021-04-12] Two years with this menace.\n\n[2024-11-02] Never use your pet's name in a password. (I would never.)"
        }
      },
      newsCrew: {
        source: "Wire · Tech Desk",
        title: "Marseille lab Aether Dynamics confirms limited gateway intrusion",
        blurb: "The aerospace firm reports an unauthorised peek at R&D files. No public dump. Ashline silent."
      },
      newsLeak: {
        source: "Wire · Breaking",
        title: "Leaked files claim Marseille firm built quiet cable sensors",
        blurb: "Schematics show listening pods sized for Mediterranean landing cables. Aether Dynamics calls the documents stolen fiction."
      }
    },
    {
      id: "driftnet",
      act: 1,
      title: "Op Driftnet",
      short: "Thalassa Link NOC",
      reward: 5500,
      blurb: "Thalassa Link runs the North Sea Kelp Line from Lerwick, Shetland. Ghost ROV windows keep appearing on the schedule.",
      target: { id: "target", name: "Thalassa Link NOC", ip: "198.51.100.17", city: "Lerwick, Shetland", x: 497, y: 48 },
      password: "quietharbor14",
      loot: "rov_ghost_schedule.dat",
      threat: 2,
      art: "driftnet",
      contact: { who: "mira", name: "Mira Cho", role: "Shift lead, Thalassa Link NOC", bio: "Runs the night dock. Files tickets for everything." },
      clues: {
        "readme_gate.txt": [],
        "tickets/T-4418_mira_cho.txt": ["quietharbor"],
        "dock/berth_board.txt": ["14", "09", "glassneedle"],
        "dock/rov_manifest.txt": ["21"]
      },
      decoys: ["saltchoir", "cho"],
      where: "Mira's tickets and the dock board",
      hints: ["Check tickets/ for the vessel name, then dock/ for the berth.", "Mira's ship is the Quiet Harbor. Which berth is it on the board?", "Tiles: quietharbor + 14."],
      kiteBoot: [
        "~smirk~Glasswing paid off. That schematic wasn't for weather buoys.",
        "Next: <em>Op Driftnet</em>. <em>Thalassa Link</em> — a cable consortium — runs the <em>Kelp Line</em> and the <em>Azimuth Spine</em> from a NOC in Lerwick, Shetland.",
        "Their scheduler keeps growing \"ghost\" ROV windows, and a survey vessel has been loitering 40 km off Shetland. Nobody on the crew booked either.",
        "Target: <code>198.51.100.17</code>. Dig Mira Cho's tickets and the dock board. Gate format: vessel + berth.",
        "~worried~I used to think this was corporate greed. Lately… it smells like a flag that won't say its name.",
        "Grab <code>rov_ghost_schedule.dat</code>. Stay louder than the seabed, quieter than a navy."
      ],
      kite: {
        connect: "NOC guest board is messy on purpose. Tap into tickets/ and dock/ — vessel + berth.",
        crack_fail: "Not that. Mira's ship, Mira's berth. Read the dock log.",
        crack_ok: "You're in. Pull the ghost schedule. Those windows aren't maintenance.",
        found_hint: "Quiet Harbor… berth numbers hide in plain sight.",
        downloaded: "That's the smoking ROV. Disconnect — Thalassa's fictional SOC is twitchy.",
        disconnect_early: "No schedule, no story. Go back in."
      },
      fs: {
        listing: [
          { name: "tickets/", kind: "dir" },
          { name: "dock/", kind: "dir" },
          { name: "readme_gate.txt", kind: "txt" },
          { name: "rov_ghost_schedule.dat", kind: "bin" }
        ],
        dirs: {
          tickets: [
            { name: "T-4418_mira_cho.txt", kind: "txt" },
            { name: "T-4420_password_reset.txt", kind: "txt" }
          ],
          dock: [
            { name: "berth_board.txt", kind: "txt" },
            { name: "rov_manifest.txt", kind: "txt" }
          ]
        },
        files: {
          "readme_gate.txt":
            "Thalassa Link NOC — shared gate\nFormat: vesselName + berthNumber (lowercase, no spaces)\nExample style: redcanoe3\nAsk shift lead Mira Cho if locked out.",
          "tickets/T-4418_mira_cho.txt":
            "Ticket T-4418\nFrom: m.cho@thalassa-link.example\n\nTaking MV Quiet Harbor out for sensor calibration Friday.\nPlease keep berth hold until I close the ticket.\n— Mira",
          "tickets/T-4420_password_reset.txt":
            "Ticket T-4420\nFrom: helpdesk@thalassa-link.example\nTo: m.cho@thalassa-link.example\n\nMira — gate reset denied (policy).\nReminder: vessel name you're assigned + berth digits.\nCheck the dock board; it's literally on the wall.",
          "dock/berth_board.txt":
            "DOCK BOARD — Port Fictional\nBerth 09  MV Glass Needle\nBerth 14  MV Quiet Harbor   ← Cho\nBerth 21  MV Salt Choir",
          "dock/rov_manifest.txt":
            "ROV windows this week:\n— official: Spine splice check (berth 09)\n— official: buoy swap (berth 21)\n— ??? 03:40–05:10 unmarked — no vessel filed",
          "rov_ghost_schedule.dat": "[binary — fictional ghost ROV window export for Azimuth Spine]"
        }
      },
      newsCrew: {
        source: "Wire · Maritime",
        title: "Thalassa Link audits North Sea ROV calendar after quiet tip",
        blurb: "Lerwick operator says irregular maintenance slots off Shetland are under review. No public evidence released."
      },
      newsLeak: {
        source: "Wire · Breaking",
        title: "Leak: unmarked ROV dives logged 40 km off Shetland",
        blurb: "Drop shows ghost dive slots beside the Kelp Line as an unflagged survey ship loitered. Thalassa Link disputes authenticity."
      }
    },
    {
      id: "blackcurrent",
      act: 1,
      title: "Op Black Current",
      short: "Meridian Softworks",
      reward: 7000,
      blurb: "A polite Singapore software house is a cutout. Pull the plan before the next quiet night on the Spine in the Strait of Malacca.",
      target: { id: "target", name: "Meridian Softworks", ip: "203.0.113.88", city: "Singapore", side: "below", x: 788, y: 240 },
      password: "vale7391",
      loot: "ops_plan_spine.dat",
      threat: 3,
      art: "blackcurrent",
      contact: { who: "ren", name: "Ren Okada", role: "\"Telemetry liaison\", Meridian Softworks", bio: "Genealogy hobbyist. Thick NDAs. Thin opsec." },
      clues: {
        "gate_policy.txt": [],
        "hr/onboarding_r.okada.txt": ["elena", "vale"],
        "hr/badge_slip_okada.txt": ["7391", "228"],
        "social/ren_okada_posts.txt": ["okada"]
      },
      decoys: ["2023", "lab"],
      where: "Ren's HR files and badge slip",
      hints: ["The gate wants mother's maiden name + last four of the badge.", "HR notes name his mother Elena Vale. Vale is the maiden name.", "Tiles: vale + 7391."],
      kiteBoot: [
        "~smirk~Last stop in Deep Water. Smile for the cutout.",
        "<em>Meridian Softworks</em> invoices Thalassa for \"telemetry adapters.\" Their real customer is the <em>Virelian Directorate</em> — fictional state actor, gray-zone hobbyists.",
        "Target: <code>203.0.113.88</code>, an office in Singapore where the Spine leaves the Strait of Malacca. Gate uses staff verification: mother's maiden name + last four of badge ID.",
        "HR leak + a genealogy brag post. You'll see. Grab <code>ops_plan_spine.dat</code>.",
        "~worried~I've been dancing around this: I knew Virelia was shopping for ears on the seabed before Glasswing. Ashline wasn't ready to say it out loud.",
        "After this, you choose how loud we get. Then we talk about a factory fire that wasn't an accident. Act Two can wait one night."
      ],
      kite: {
        connect: "Cutout box. Check hr/ and social/ — maiden name + badge last four.",
        crack_fail: "Close. Vale is the name; the digits are on the badge slip.",
        crack_ok: "Directorate front unlocked. Pull the ops plan. Then we decide who hears it.",
        found_hint: "Genealogy posts are free intel. Badge slips too.",
        downloaded: "That's the week they wire the Spine. Disconnect. Choice time.",
        disconnect_early: "Plan's still in there. Finish it."
      },
      fs: {
        listing: [
          { name: "hr/", kind: "dir" },
          { name: "social/", kind: "dir" },
          { name: "gate_policy.txt", kind: "txt" },
          { name: "ops_plan_spine.dat", kind: "bin" }
        ],
        dirs: {
          hr: [
            { name: "onboarding_r.okada.txt", kind: "txt" },
            { name: "badge_slip_okada.txt", kind: "txt" }
          ],
          social: [{ name: "ren_okada_posts.txt", kind: "txt" }]
        },
        files: {
          "gate_policy.txt":
            "Meridian Softworks — staff gate\nChallenge: mother's maiden name (lowercase) + last 4 of badge ID\nNo spaces. Example style: smith2044",
          "hr/onboarding_r.okada.txt":
            "Employee: Ren Okada\nRole: \"Telemetry liaison\" (client: Thalassa Link)\nEmergency contact notes: mother Elena Vale (prefer maiden name on forms).",
          "hr/badge_slip_okada.txt":
            "BADGE SLIP — print once\nName: OKADA, REN\nBadge ID: MS-228-7391\nDoor group: LAB-B",
          "social/ren_okada_posts.txt":
            "— @ren.okada (fictional) —\n\n[2023-06-02] Digitized grandma's tree.\nMother's line is all Vales from the old port district.\nElena Vale → Elena Okada. History sticks.\n\n[2025-01-14] Client dinner with \"maritime partners.\" NDAs thicker than the soup.",
          "ops_plan_spine.dat": "[binary — fictional Virelian Directorate tap window plan for Azimuth Spine]"
        }
      },
      newsCrew: {
        source: "Wire · World",
        title: "Quiet briefing: Singapore vendor tied to Virelian gray-zone unit",
        blurb: "Files on taps planned between the Red Sea and Malacca reached cable operators under seal. Virelia calls the story fantasy."
      },
      newsLeak: {
        source: "Wire · Breaking",
        title: "Leak claims Virelian Directorate planned Azimuth Spine tap",
        blurb: "Drop maps planned taps from the Suez approaches to the Strait of Malacca and names Meridian Softworks as a cutout. Virelia denies it."
      },
      actEnd: true,
      actTease: "Act 2 preview: a factory fire in the fictional port of Greyhook — arson dressed as an accident. Ashline already has a name on a fuel ledger."
    }
  ];

  // Fictional undersea cables (map flavour). "spine" = Azimuth Spine.
  const CABLES = [ { "id": "spine", "name": "Azimuth Spine", "d": "M515.0,103.6 L525.0,120.6 L538.9,125.5 L561.1,133.6 L580.6,140.1 L589.7,142.1 L590.6,147.0 L595.8,156.4 L606.9,179.3 L620.6,203.4 L633.3,205.3 L661.1,198.8 L688.9,185.8 L702.2,182.5 L704.2,205.3 L722.2,225.5 L755.6,225.5 L766.7,226.5 L777.8,234.7 L788.3,240.2" }, { "id": "c2", "name": "Kelp Line", "d": "M438.9,35.5 L466.7,40.7 L480.6,42.4 L496.9,48.2 L508.3,55.4 L519.4,61.9 L523.1,63.6" }, { "id": "c3", "name": "Boreal Loop", "d": "M323.3,99.1 L375.0,91.3 L430.6,81.5 L472.2,81.5 L484.4,81.2" }, { "id": "c4", "name": "Coral Run", "d": "M393.1,256.5 L416.7,228.1 L438.9,179.3 L461.1,136.9 L474.2,118.3" }, { "id": "c5", "name": "Harmattan Line", "d": "M474.2,118.3 L461.1,146.7 L444.4,195.6 L472.2,228.1 L509.4,223.6" }, { "id": "c6", "name": "Pearl Thread", "d": "M788.3,240.2 L805.6,211.9 L830.6,172.7 L847.2,146.7 L858.3,130.0" } ];
  const LAND = ["M63.9,13.0 L108.3,19.6 L180.6,22.8 L236.1,9.8 L263.9,29.3 L283.3,42.4 L322.2,48.9 L344.4,75.0 L352.8,91.3 L330.6,97.8 L316.7,104.3 L305.6,110.8 L288.9,130.4 L275.0,143.4 L277.8,163.0 L266.7,146.7 L250.0,149.9 L236.1,149.9 L230.6,159.7 L230.6,176.0 L233.3,182.5 L238.9,185.8 L258.3,176.0 L255.6,192.3 L269.4,195.6 L280.6,215.1 L286.1,218.4 L275.0,215.1 L258.3,202.1 L236.1,192.3 L208.3,179.3 L180.6,146.7 L166.7,133.6 L155.6,114.1 L152.8,88.0 L133.3,65.2 L94.4,48.9 L75.0,52.1 L50.0,65.2 L41.7,48.9 L33.3,32.6 Z", "M300.0,-9.8 L416.7,-19.6 L450.0,0.0 L438.9,16.3 L394.4,32.6 L377.8,48.9 L361.1,42.4 L352.8,22.8 L338.9,3.3 Z", "M436.1,27.7 L458.3,28.4 L462.5,34.2 L450.0,37.8 L437.5,35.9 Z", "M300.0,205.3 L322.2,208.6 L330.6,211.9 L341.7,224.9 L358.3,231.4 L361.1,244.4 L377.8,251.0 L400.0,260.7 L402.8,270.5 L394.4,286.8 L383.3,319.4 L366.7,325.9 L355.6,352.0 L341.7,358.5 L327.8,371.6 L322.2,381.3 L316.7,397.6 L308.3,413.9 L313.9,423.7 L300.0,420.4 L291.7,394.4 L297.2,365.0 L302.8,342.2 L305.6,303.1 L288.9,290.1 L275.0,260.7 L277.8,247.7 L283.3,237.9 L286.1,218.4 L291.7,208.6 Z", "M483.3,127.1 L475.0,123.9 L475.0,104.3 L497.2,101.0 L494.4,91.3 L486.9,86.4 L500.0,83.1 L505.6,78.2 L513.9,71.7 L523.6,68.4 L523.6,58.7 L529.2,61.9 L529.2,68.4 L536.1,66.8 L550.0,68.4 L558.3,65.2 L559.7,57.0 L563.9,50.5 L580.6,48.9 L561.1,47.3 L558.3,39.1 L568.1,31.0 L558.3,32.6 L548.6,42.4 L550.0,52.1 L544.4,61.9 L534.7,61.9 L530.6,52.1 L516.7,55.4 L513.9,42.4 L536.1,29.3 L555.6,16.3 L572.2,13.0 L586.1,16.3 L613.9,19.6 L611.1,29.3 L622.2,22.8 L652.8,22.8 L666.7,16.3 L694.4,6.5 L722.2,6.5 L777.8,-3.3 L813.9,6.5 L861.1,9.8 L944.4,16.3 L1000.0,22.8 L1000.0,29.3 L997.2,42.4 L972.2,48.9 L952.8,52.1 L950.0,58.7 L936.1,78.2 L933.3,58.7 L922.2,52.1 L897.2,52.1 L891.7,68.4 L888.9,81.5 L875.0,104.3 L858.3,114.1 L858.3,120.6 L858.3,130.4 L850.0,130.4 L851.4,122.2 L847.2,117.3 L838.9,114.1 L827.8,120.6 L838.9,123.9 L830.6,130.4 L838.9,143.4 L833.3,156.4 L825.0,169.5 L808.3,174.4 L800.0,176.0 L794.4,185.8 L802.8,195.6 L802.8,208.6 L791.7,215.1 L788.9,210.2 L777.8,202.1 L775.0,211.9 L777.8,221.6 L786.1,231.4 L788.9,239.9 L783.3,237.9 L777.8,224.9 L772.2,218.4 L772.2,192.3 L761.1,192.3 L755.6,172.7 L747.2,172.7 L738.9,179.3 L727.8,192.3 L722.2,202.1 L713.9,218.4 L711.1,211.9 L705.6,195.6 L702.8,182.5 L694.4,172.7 L686.1,166.2 L672.2,163.0 L658.3,163.0 L655.6,156.4 L638.9,146.7 L633.3,149.9 L641.7,163.0 L650.0,166.2 L655.6,159.7 L666.1,171.1 L652.8,189.0 L625.0,202.1 L618.1,189.0 L608.3,172.7 L596.1,153.2 L590.3,146.7 L588.9,143.4 L595.8,141.8 L600.0,127.1 L583.3,125.5 L575.0,123.9 L573.6,114.1 L563.9,112.4 L566.7,120.6 L561.1,123.9 L558.3,119.0 L554.2,114.1 L552.8,107.6 L537.5,97.8 L534.7,101.0 L544.4,110.8 L551.4,114.1 L544.4,120.6 L541.7,114.1 L534.7,109.2 L525.0,101.0 L519.4,102.7 L515.0,104.3 L508.9,103.3 L505.6,109.2 L500.0,114.1 L500.0,118.3 L494.4,123.9 Z", "M588.9,143.4 L569.4,141.8 L555.6,138.5 L547.2,143.4 L530.6,136.9 L527.8,123.9 L508.3,123.9 L483.6,127.8 L480.6,133.6 L472.2,146.7 L463.9,153.2 L452.8,176.0 L451.4,195.6 L458.3,211.9 L466.7,221.6 L479.2,229.8 L494.4,228.1 L502.8,224.9 L509.4,223.6 L519.4,229.8 L525.0,231.4 L526.4,241.2 L533.3,260.7 L537.5,283.6 L532.8,299.9 L540.3,319.4 L545.8,339.0 L551.4,355.3 L555.6,356.9 L572.2,355.3 L580.6,348.7 L590.3,335.7 L591.7,325.9 L598.6,316.1 L612.5,293.3 L612.5,278.7 L609.7,257.5 L626.4,237.9 L641.7,207.0 L622.2,205.3 L611.1,195.6 L602.8,179.3 L598.6,166.2 L593.1,153.2 L590.3,146.7 Z", "M636.1,283.6 L638.9,296.6 L630.6,325.9 L622.2,325.9 L622.2,299.9 Z", "M491.7,53.5 L495.0,56.4 L495.8,65.2 L500.8,71.7 L503.9,76.9 L500.0,78.9 L484.7,81.2 L490.3,76.6 L486.1,75.0 L491.7,70.7 L490.6,66.5 L486.1,65.2 L483.3,60.3 L486.1,53.8 Z", "M479.7,64.2 L483.3,68.4 L482.2,75.0 L472.8,76.6 L472.2,67.8 Z", "M894.4,96.1 L902.8,104.3 L894.4,114.1 L890.3,128.7 L877.8,133.6 L861.1,136.9 L863.9,132.0 L879.2,127.1 L886.1,120.6 L888.9,110.8 Z", "M764.7,226.5 L773.6,234.7 L788.9,247.7 L793.9,263.3 L783.3,257.5 L773.6,241.2 Z", "M825.0,221.6 L830.6,241.2 L822.2,257.5 L808.3,254.2 L802.8,239.6 L813.9,231.4 Z", "M794.4,264.0 L812.5,266.9 L818.1,270.5 L808.3,272.8 L794.4,268.9 Z", "M863.9,247.7 L883.3,251.0 L908.3,264.0 L916.7,277.0 L897.2,270.5 L891.7,273.8 L875.0,257.5 Z", "M722.2,212.5 L727.2,221.6 L723.1,224.9 L721.7,218.4 Z", "M863.9,280.3 L879.2,283.6 L877.8,293.3 L893.1,283.6 L904.2,299.9 L925.0,325.9 L923.6,350.4 L916.7,366.7 L905.6,371.6 L891.7,368.3 L883.3,358.5 L869.4,348.7 L826.4,358.5 L819.4,353.6 L815.3,329.2 L816.7,314.5 L836.1,308.0 L850.0,290.1 L859.7,291.7 Z", "M980.6,356.9 L988.9,378.1 L969.4,396.0 L966.7,387.9 L979.2,376.4 Z"];
  const HOME = { name: "Your Rig", city: "Toronto", ip: "192.0.2.10", x: 280, y: 102 };
  const SPINE_LABEL = [672, 199];

  return { CABLES: CABLES, LAND: LAND, HOME: HOME, SPINE_LABEL: SPINE_LABEL, RELAYS: RELAYS, UPGRADES: UPGRADES, JOBS: JOBS, SCENES: SCENES, ACT_TITLE: "Deep Water", ACT_NUM: 1 };
})();
