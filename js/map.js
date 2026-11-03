/* ASHLINE map.js — stylised world, undersea cables, relays, route and trace visuals */
(function (AL) {
  "use strict";
  const SVGNS = "http://www.w3.org/2000/svg";
  const world = AL.$("world");
  const MAX_BASE_RELAYS = 3;
  let NODES = {};

  // Simplified hand-traced continents live in data.js (LAND); real geography, fictional actors.

  function svg(tag, attrs, parent) {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function relayLimit() { return MAX_BASE_RELAYS + (AL.save.upgrades.relaySlot | 0); }

  function buildNodes() {
    const H = AL.DATA.HOME;
    const nodes = { home: { id: "home", name: H.name, city: H.city, ip: H.ip, x: H.x, y: H.y, type: "home" } };
    AL.DATA.RELAYS.forEach(function (r, i) {
      nodes[r.id] = { id: r.id, name: r.name, ip: r.ip, x: r.x, y: r.y, side: r.side, type: "relay", locked: i >= relayLimit() };
    });
    const t = AL.currentJob.target;
    nodes.target = { id: "target", name: t.name, city: t.city, ip: t.ip, x: t.x, y: t.y, side: t.side, type: "target" };
    return nodes;
  }

  function draw() {
    NODES = buildNodes();
    world.innerHTML = "";
    const defs = svg("defs", {}, world);
    defs.innerHTML = '<pattern id="dots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="#3b4c74"/></pattern>' +
      '<radialGradient id="sea" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#0b1426"/><stop offset="1" stop-color="#04070d"/></radialGradient>';
    svg("rect", { x: 0, y: 0, width: 1000, height: 440, fill: "url(#sea)" }, world);
    const gLand = svg("g", {}, world);
    AL.DATA.LAND.forEach(function (d) { svg("path", { d: d, class: "coast" }, gLand); svg("path", { d: d, class: "land" }, gLand); svg("path", { d: d, class: "land-dots" }, gLand); });
    const gCab = svg("g", {}, world);
    AL.DATA.CABLES.forEach(function (c) {
      const sp = c.id === "spine" ? " spine" : "";
      svg("path", { d: c.d, class: "cable" + sp }, gCab);
      svg("path", { d: c.d, class: "cable-flow" + sp }, gCab);
      if (c.id === "spine") svg("text", { x: AL.DATA.SPINE_LABEL[0], y: AL.DATA.SPINE_LABEL[1], class: "cable-label", "text-anchor": "middle" }, gCab).textContent = "AZIMUTH SPINE";
    });
    svg("g", { id: "route-layer" }, world);
    Object.keys(NODES).forEach(function (id) {
      const n = NODES[id];
      const g = svg("g", { class: "node " + n.type + (n.locked ? " locked" : ""), "data-id": id, transform: "translate(" + n.x + "," + n.y + ")" }, world);
      svg("circle", { r: 32, class: "hit" }, g);
      svg("circle", { r: 24, class: "halo" }, g);
      svg("circle", { r: 14, class: "ring" }, g);
      svg("circle", { r: 7, class: "core" }, g);
      const below = n.side === "below";
      const flip = n.side ? n.side === "left" : n.x > 760;
      const lx = below ? 0 : flip ? -22 : 22, ly = below ? 32 : -4, anchor = below ? "middle" : flip ? "end" : "start";
      svg("text", { x: lx, y: ly, class: "lbl", "text-anchor": anchor }, g).textContent = n.locked ? n.name + " \u00b7 locked" : n.name;
      svg("text", { x: lx, y: ly + 16, class: "ip", "text-anchor": anchor }, g).textContent = (n.city ? n.city + " \u00b7 " : "") + n.ip;
      if (n.type === "relay" && !n.locked) {
        g.addEventListener("click", function (e) { e.preventDefault(); AL.Audio.unlock(); AL.sfx("tap"); toggle(id); });
      }
    });
    redraw(false);
  }

  function toggle(id) {
    const m = AL.mission;
    if (m.connected || m.gameOver || !NODES[id] || NODES[id].locked) return;
    const idx = m.route.indexOf(id);
    if (idx >= 0) m.route.splice(idx, 1); else m.route.push(id);
    redraw(false); AL.updateChrome();
  }
  function clear() {
    const m = AL.mission;
    if (m.connected || m.gameOver) return;
    m.route = []; redraw(false); AL.updateChrome();
  }
  function points() {
    const pts = [NODES.home];
    AL.mission.route.forEach(function (id) { if (NODES[id]) pts.push(NODES[id]); });
    pts.push(NODES.target);
    return pts;
  }
  function pathD() {
    const pts = points();
    let d = "M" + pts[0].x + "," + pts[0].y;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - Math.min(60, Math.abs(b.x - a.x) * 0.18);
      d += " Q" + mx.toFixed(1) + "," + my.toFixed(1) + " " + b.x + "," + b.y;
    }
    return d;
  }

  function redraw(animate) {
    const layer = AL.$("route-layer");
    if (!layer) return;
    layer.innerHTML = "";
    const d = pathD(), m = AL.mission;
    if (m.connected) {
      svg("path", { d: d, class: "route-glow" }, layer);
      const live = svg("path", { d: d, class: "route-live", id: "route-path" }, layer);
      if (animate && !AL.reduceMotion()) {
        const len = live.getTotalLength();
        live.style.strokeDasharray = len; live.style.setProperty("--len", len); live.classList.add("route-draw");
      }
      svg("path", { d: d, class: "trace-glow", id: "trace-glow" }, layer).style.strokeDasharray = "0 99999";
      svg("path", { d: d, class: "route-trace", id: "trace-path" }, layer).style.strokeDasharray = "0 99999";
      svg("circle", { r: 6, class: "trace-head", id: "trace-dot", cx: NODES.target.x, cy: NODES.target.y, opacity: 0 }, layer);
    } else {
      svg("path", { d: d, class: "route-preview", id: "route-path" }, layer);
    }
    // Packet pulses travelling along the route (decorative)
    if (!AL.reduceMotion()) {
      [0, 0.5].forEach(function (k) {
        const c = svg("circle", { r: m.connected ? 4.5 : 3.5, class: "route-pulse" }, layer);
        svg("animateMotion", { dur: m.connected ? "1.4s" : "2.4s", begin: (k * (m.connected ? 1.4 : 2.4)) + "s", repeatCount: "indefinite", path: d }, c);
      });
    }
    Object.keys(NODES).forEach(function (id) {
      const g = world.querySelector('.node[data-id="' + id + '"]');
      if (!g) return;
      const hop = m.route.indexOf(id);
      g.classList.toggle("in-route", hop >= 0);
      const old = g.querySelector(".hop-badge"); if (old) old.remove();
      if (hop >= 0) {
        const b = svg("g", { class: "hop-badge" }, g);
        svg("circle", { cx: -15, cy: -17, r: 10, class: "hop-c" }, b);
        svg("text", { x: -15, y: -13, "text-anchor": "middle", class: "hop-t" }, b).textContent = String(hop + 1);
      }
    });
    ladder();
  }

  // Mobile hop ladder: the route as a list, plus big tap targets for every relay.
  function ladder() {
    const box = AL.$("hop-ladder");
    if (!box) return;
    const m = AL.mission, per = 9;
    const row = function (n, cls, badge, meta) {
      return '<div class="hop ' + cls + '"><span class="hop-n">' + badge + '</span><span class="hop-name">' + AL.esc(n.name) +
        '</span><span class="hop-ip">' + AL.esc((n.city ? n.city + " \u00b7 " : "") + n.ip) + '</span><span class="hop-meta">' + meta + "</span></div>";
    };
    let html = '<div class="ladder-h">Route</div>' + row(NODES.home, "home", "\u25cf", "origin");
    m.route.forEach(function (id, i) { html += row(NODES[id], "relay", String(i + 1), "+" + per + "s"); });
    html += row(NODES.target, "target", "\u25ce", "target");
    const spare = AL.DATA.RELAYS.filter(function (r) { return m.route.indexOf(r.id) < 0; });
    if (!m.connected && spare.length) {
      html += '<div class="ladder-h">Relays \u00b7 tap to add</div><div class="relay-picks">';
      spare.forEach(function (r) {
        const n = NODES[r.id];
        html += '<button type="button" class="relay-pick' + (n.locked ? " locked" : "") + '" data-relay="' + r.id + '"' + (n.locked ? " disabled" : "") + ">" +
          AL.ART.icon(n.locked ? "lock" : "relay", 16) + "<span>" + AL.esc(n.name) + "</span></button>";
      });
      html += "</div>";
    }
    box.innerHTML = html;
    box.querySelectorAll(".relay-pick:not(.locked)").forEach(function (b) {
      b.addEventListener("click", function () { AL.sfx("tap"); toggle(b.getAttribute("data-relay")); });
    });
  }

  // The trace runs from the target back along the route toward the rig.
  function traceVisual(p) {
    const path = AL.$("route-path"), tr = AL.$("trace-path"), gl = AL.$("trace-glow"), dot = AL.$("trace-dot");
    if (!path || !tr) return;
    const len = path.getTotalLength(), drawn = len * p;
    const dash = drawn + " " + (len + 10), off = String(-(len - drawn));
    tr.style.strokeDasharray = dash; tr.style.strokeDashoffset = off;
    if (gl) { gl.style.strokeDasharray = dash; gl.style.strokeDashoffset = off; }
    if (dot) { const pt = path.getPointAtLength(len - drawn); dot.setAttribute("cx", pt.x); dot.setAttribute("cy", pt.y); dot.setAttribute("opacity", 1); }
  }
  function markTraced() { world.querySelectorAll(".node").forEach(function (g) { g.classList.add("traced"); }); }

  AL.map = {
    draw: draw, toggle: toggle, clear: clear, points: points, redraw: redraw,
    traceVisual: traceVisual, markTraced: markTraced, relayLimit: relayLimit,
    nodes: function () { return NODES; }
  };
})(window.AL);
