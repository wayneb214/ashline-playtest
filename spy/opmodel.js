/* opmodel.js: the live-op radio call (Abort / Hold / Push) in numbers. No DOM.
   One source for the buttons (ops.js), the result (spy.js resolve) and the balance sim (test/op-balance-sim.mjs),
   so the words on the buttons, what the game applies and what the sim scored can't drift apart. */
(function (root) {
  "use strict";
  function make(P) {
    const OPT = P.OPT, TRAP = P.TRAP;
    const cl = function (x) { return Math.max(5, Math.min(95, Math.round(x))); };
    // the chance of the plan coming off after the call (Abort has no roll: the case is lost)
    // On a trap the odds are cut hard and capped (Push at most TRAP.pushCap, Hold at most TRAP.holdCap), so a strong plan
    // can't make a trap look worth pushing: whatever the base, the screen says Abort.
    function odds(choice, base, trap) {
      if (choice === "abort") return 0;
      // panel 6 v2 (Wayne): Push is the long shot. Hold's chance is the base plus Hold's edge, kept to (5 + gap)..OPT.hold.cap (85), and
      // Push is always exactly OPT.push.gap below it (5..71), so the two never share an odds word (no band is gap wide).
      const g = OPT.push.gap, hold = g == null ? 0 : Math.max(5 + g, Math.min(OPT.hold.cap || 95, cl(cl(base) + OPT.hold.mod)));
      const pre = g == null ? cl(base + OPT[choice].mod) : choice === "hold" ? hold : hold - g; // no gap: the older models, for the report
      return trap ? Math.max(5, Math.min(TRAP[choice + "Cap"] || 95, Math.round(pre + (TRAP[choice] || 0)))) : pre;
    }
    // a failed Push blows the officer's cover this often: more often on a trap, and more often the more strained they are
    function burn(trap, stress) { return Math.min(0.9, (trap ? TRAP.burn : OPT.push.burn) + (OPT.push.burnStress || 0) * (stress || 0)); }
    // what the call itself does to the officer, on top of the plan's own stress
    //   stress: added whatever the result; lossStress: added on a loss; wound: hurt on a loss; signOff: a loss at 5 stress sends them home
    function officer(choice, res, trap) {
      if (choice === "abort") return { stress: 0, lossStress: 0, plan: false, loyal: OPT.abort.loyal || 0, wound: false, signOff: false, tired: false };
      if (choice === "hold") return { stress: OPT.hold.stress || 0, lossStress: 0, plan: OPT.hold.plan !== false, loyal: 0, wound: !!(trap && TRAP.holdWound), signOff: false, tired: false };
      return { stress: OPT.push.stress || 0, lossStress: 1, plan: true, loyal: 0, wound: true, signOff: true, tired: res !== "loss" };
    }
    // a failed Hold: the officer was kept back, so the plan's own losses land softer (not on a trap: they were waiting)
    function holdLossX(trap) { return trap ? 1 : OPT.hold.lossX == null ? 1 : OPT.hold.lossX; }
    return { holdLossX: holdLossX, OPT: OPT, TRAP: TRAP, odds: odds, burn: burn, officer: officer, rate: TRAP.rate, P: P };
  }
  // Balanced against test/op-balance-sim.mjs (op-balance, 15 Nov). The old numbers are kept as BEFORE for the report.
  const BEFORE = { OPT: { push: { mod: 12, winX: 1.5, failService: -5, burn: 1 / 3, stress: 0 }, hold: { mod: -6, trust: -2, stress: 0 }, abort: { trust: -6, loyal: 0 } }, TRAP: { rate: 0, push: 0, hold: 0, burn: 1 / 3 } };
  // The version before panel 6 v2 (Push +14% and x1.5 on a win, Hold -4%, No.10 -1), kept for the report.
  const V7 = { OPT: { push: { mod: 14, winX: 1.5, failService: -5, burn: 0.25, burnStress: 0.1, stress: 0 }, hold: { mod: -4, trust: -1, stress: 0, lossX: 0.5 }, abort: { trust: -6, loyal: 1 } },
    TRAP: { rate: 0.2, push: -30, hold: -25, pushCap: 22, holdCap: 28, burn: 2 / 3, holdWound: true } };
  // NOW (panel 6 v2, Wayne: "make Push a long shot"), balanced with test/op-balance-sim.mjs and test/op-hard-sim.mjs so each call
  // is the best one in about a third of normal situations and the sack rates stay where they were.
  // Hold is the likely, steady result: +16% on the odds, the plan's normal gains, a failed Hold lands half the losses; waiting
  // costs No.10 trust 1 and Service 6 (the team tied up watching). Push is the long shot: always 14 below Hold (net +2%), but
  // x3 the plan's gains on a win; a failed Push lands the full losses, Service -3, and blows cover 10% of the time (+5% per
  // point of the officer's stress). Abort is the sure thing: the case is lost and No.10 -6, but the officer comes home (+1 loyalty).
  // panel 6 v3 (Wayne: "enjoyment for the uncertainty"): Hold is at most 85% (so Push at most 71%): a call always has real risk.
  // A trap (1 live op in 5, never the first): Push -30% and at most 22%, cover blown 2 times in 3; Hold -25% and at most 28%, no longer safe.
  const NOW = { OPT: { push: { mod: 2, gap: 14, winX: 3, failService: -3, burn: 0.1, burnStress: 0.05, stress: 0 }, hold: { mod: 16, cap: 85, trust: -1, service: -6, stress: 0, lossX: 0.5 }, abort: { trust: -6, loyal: 1 } },
    TRAP: { rate: 0.2, push: -30, hold: -25, pushCap: 22, holdCap: 28, burn: 2 / 3, holdWound: true } };
  // panel 6 v2 as published (30f0bd0): the same without the 85% cap, kept for the report
  const V2 = { OPT: Object.assign({}, NOW.OPT, { hold: Object.assign({}, NOW.OPT.hold, { cap: 95 }) }), TRAP: NOW.TRAP };
  const M = make(NOW); M.make = make; M.BEFORE = BEFORE; M.V7 = V7; M.V2 = V2; M.NOW = NOW;
  root.OPMODEL = M;
})(typeof window !== "undefined" ? window : globalThis);
