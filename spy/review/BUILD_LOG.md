# Act 2 build log
- [x] Backup to /tmp/spy-backup-pre-act2 (Wed Nov  4 19:58:18 GMT 2026)
- [x] A1 officer radio voices (36 Chatterbox lines, ASR-checked), A2 send-offs, A3 end cutscenes end-win/mixed/loss/traded (QA pass, contact sheets /workspace/act2v/cs-*.jpg), A4 bulletin_end_traded. Autoplay fun-play PASS no errors.

## Checkpoint: Part A published (7a87822)
## Checkpoint B0: Part B assets
- Installed img/cine/{d4-letter,d5-bridge,d6-london,end2-good,end2-bad}-0.jpg + blank layers; videos .mp4/.webm 960x540 muted. Contact sheets /workspace/act2v/cs-*.jpg: all 5 PASS (still figures, parked cars/bus, no morphing).
- h-manchester.jpg / v-manchester.jpg cropped to remove a striped flag resembling a real national flag.
- Voice genB (20 lines) running; ASR check + voice.js L entries pending.
- NEXT: act2.js Day 4 → test → publish; then Day 5, Day 6, replay/fun/title, autoplay 6 days, balance.

## Checkpoint B1–B3: Act 2 (Days 4–6) wired, tested, published
- act2.js loaded after day3.js; spy.js routes Days 4–6 through AH4 (cases, interrupts, odds, afterCase, summary, actState carry-over, paper, bulletin, datelines, day select 4–6).
- cine.js: day4, day5, bridge, day6, end6 scenes (+MOVE/WIDE/ORDER). crunch.js: Day 5 pair (family/minister). fun.js: leak, bridge, knight, six achievements; Day 6 records a2_<ending> in replay. replay.js: four Act 2 endings (10 total). Title: "Albion House — Six Days as C".
- Fixes found in autoplay: two-calls screen reused data-screen="crunch" (renamed twocalls); swap crashed on non-trade options (null chip); swap could double-finish (guard); held officer was re-marked used by finishCase (now null k); Hale call voice played twice (id now pm_d<N>, explicit VO removed); leak suspects now show cleared people as locked; "the Palace" removed from knight flash; bridge kicker says dawn in Kessgrad.
- Tests: play6.mjs autoplays Days 1–6, 12 full runs (default/SMART/CARELESS/PICKLAST, seeds 3,5,7,11,23,31), final 3 runs NO ERRORS. Endings seen in autoplay: quiet, resign, scandal; knight verified by state injection (endtest.mjs).
- NEXT: none required; optional: human playtest of Day 4–6 pacing, knight via real play.
