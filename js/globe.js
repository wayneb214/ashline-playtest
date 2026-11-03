/* ASHLINE globe.js — plain-WebGL 3D globe that sits over the flat map.
   It wraps AL.map (same interface): map.js still owns the route state, the hop ladder and the
   hidden SVG; the globe draws ocean, coastlines, cables, pins and bounce arcs, and taps relays.
   No libraries. Capped at 30fps, pauses when hidden. Falls back to the flat SVG map on any failure. */
(function (AL) {
  "use strict";
  const flat = AL.map, wrap = document.querySelector(".map-wrap");
  if (!flat || !wrap) return;
  let forced = false;
  try { forced = /[?&]flat=1/.test(location.search) || localStorage.getItem("ashline_flatmap") === "1"; } catch (e) {}

  const D2R = Math.PI / 180;
  const toLL = function (x, y) { return [75 - y * 135 / 440, x / 1000 * 360 - 180]; };
  const vec = function (lat, lon) { const c = Math.cos(lat * D2R); return [c * Math.sin(lon * D2R), Math.sin(lat * D2R), c * Math.cos(lon * D2R)]; };
  const parse = function (d) {
    const pts = [];
    d.replace(/(-?[\d.]+),(-?[\d.]+)/g, function (_, x, y) { pts.push(toLL(+x, +y)); return ""; });
    return pts;
  };

  // ---------- WebGL setup ----------
  const cv = document.createElement("canvas"), ov = document.createElement("canvas");
  cv.className = "globe-gl"; ov.className = "globe-ov";
  cv.setAttribute("aria-hidden", "true");
  ov.setAttribute("role", "img"); ov.setAttribute("aria-label", "Globe showing your bounce route. Drag to rotate, tap a relay to add it.");
  let gl = null;
  try { if (!forced) gl = cv.getContext("webgl", { antialias: true, alpha: false, premultipliedAlpha: false }) || cv.getContext("experimental-webgl"); } catch (e) { gl = null; }
  if (!gl) { AL.globe = { active: false, reason: forced ? "forced" : "no-webgl" }; return; }

  const VS_Q = "attribute vec2 p;varying vec2 v;void main(){v=p;gl_Position=vec4(p,0.,1.);}";
  const FS_Q = [
    "precision mediump float;varying vec2 v;uniform vec2 asp;uniform float R;uniform mat3 inv;uniform float t;",
    "float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
    "void main(){vec2 q=v*asp;float r=length(q)/R;",
    // backdrop: deep navy, faint grid, sparse twinkling stars
    "vec3 c=mix(vec3(.012,.02,.045),vec3(.03,.045,.09),1.-length(v)*.6);",
    "vec2 g=abs(fract(q*6.)-.5);c+=vec3(.05,.12,.2)*.18*step(.485,max(g.x,g.y));",
    "vec2 sc=floor(q*90.);float s=h(sc);if(s>.985){float tw=.5+.5*sin(t*2.+s*90.);c+=vec3(.6,.8,1.)*tw*.6*(1.-length(fract(q*90.)-.5)*2.5);}",
    "if(r<1.){vec3 n=vec3(q/R,sqrt(1.-r*r));vec3 w=inv*n;",
    "float lat=asin(clamp(w.y,-1.,1.));float lon=atan(w.x,w.z);",
    "float diff=.35+.65*max(dot(n,normalize(vec3(-.4,.5,.8))),0.);",
    "vec3 o=vec3(.02,.05,.11)*diff+vec3(.0,.03,.06);",
    "float gl=min(abs(fract(lat/0.2618+.5)-.5),abs(fract(lon/0.2618+.5)-.5)*max(cos(lat),.05));",
    "o+=vec3(.05,.25,.35)*.25*(1.-smoothstep(0.,.025,gl));",
    "float fr=pow(1.-n.z,2.5);o+=vec3(.15,.7,.9)*fr*.55+vec3(.6,.2,.8)*pow(1.-n.z,6.)*.4;",
    "c=o;}else{float a=exp(-(r-1.)*14.);c+=vec3(.18,.75,1.)*a*.55+vec3(.7,.25,.95)*exp(-(r-1.)*5.)*.12;}",
    "gl_FragColor=vec4(c,1.);}"
  ].join("\n");
  const VS_L = "attribute vec3 p;uniform mat3 rot;uniform vec2 asp;uniform float R;varying float z;void main(){vec3 w=rot*p;z=w.z;gl_Position=vec4(w.xy*R/asp,-w.z*.5,1.);}";
  const FS_L = "precision mediump float;uniform vec4 col;varying float z;void main(){if(z<-.02)discard;gl_FragColor=vec4(col.rgb,col.a*smoothstep(-.02,.35,z));}";

  function prog(vs, fs) {
    const mk = function (type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("link"); return p;
  }
  let PQ, PL, quadBuf, landBuf, cabBuf, landRanges = [], cabRanges = [];
  function lineBuf(list, ranges) {
    const arr = []; let off = 0;
    list.forEach(function (pts, k) {
      const closed = k >= 0 && list.closed;
      for (let i = 0; i < pts.length - 1 + (closed ? 1 : 0); i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        for (let s = 0; s < 4; s++) { // subdivide so lines hug the sphere
          const u = s / 4, u2 = (s + 1) / 4;
          [u, u2].forEach(function (f) { arr.push.apply(arr, vec(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f)); });
        }
      }
      ranges.push([off, arr.length / 3 - off]); off = arr.length / 3;
    });
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
    return buf;
  }
  try {
    PQ = prog(VS_Q, FS_Q); PL = prog(VS_L, FS_L);
    quadBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const land = AL.DATA.LAND.map(parse); land.closed = true;
    landBuf = lineBuf(land, landRanges);
    cabBuf = lineBuf(AL.DATA.CABLES.map(function (c) { return parse(c.d); }), cabRanges);
  } catch (e) { AL.globe = { active: false, reason: "gl-init: " + e.message }; return; }

  wrap.appendChild(cv); wrap.appendChild(ov);
  document.body.classList.add("globe-on");
  const ctx = ov.getContext("2d");

  // ---------- view state ----------
  let yaw = 40 * D2R, pitch = -25 * D2R, vy = 0, vp = 0, W = 0, H = 0, dpr = 1, R = 1, cx = 0, cy = 0;
  let traceP = -1, traced = false, connectedAt = 0, focusTo = null, dragging = false, last = 0, raf = 0, t0 = performance.now();

  function rotM() { // world -> view: yaw about Y, then pitch about X
    const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    // column-major mat3 for GL
    return [cyw, sp * syw, -cp * syw, 0, cp, sp, syw, -sp * cyw, cp * cyw];
  }
  function proj(v, m) {
    const x = m[0] * v[0] + m[3] * v[1] + m[6] * v[2], y = m[1] * v[0] + m[4] * v[1] + m[7] * v[2], z = m[2] * v[0] + m[5] * v[1] + m[8] * v[2];
    return [cx + x * R, cy - y * R, z];
  }
  function transpose(m) { return [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]; }
  function slerp(a, b, f) {
    const d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])), om = Math.acos(d);
    if (om < 1e-4) return a.slice();
    const s = Math.sin(om), ka = Math.sin((1 - f) * om) / s, kb = Math.sin(f * om) / s;
    return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];
  }

  function nodes() { return flat.nodes(); }
  function nodeVec(n) { if (!n._v) { const ll = toLL(n.x, n.y); n._v = vec(ll[0], ll[1]); } return n._v; }
  function arcPts() {
    const pts = flat.points().map(nodeVec), out = [];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], d = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
      const lift = 0.04 + d * 0.16, N = 24;
      for (let s = i === 1 ? 0 : 1; s <= N; s++) {
        const f = s / N, v = slerp(a, b, f), k = 1 + lift * Math.sin(Math.PI * f);
        out.push([v[0] * k, v[1] * k, v[2] * k]);
      }
    }
    return out;
  }
  function focus() { // aim the view at the middle of home + target
    const ns = nodes(); if (!ns.home || !ns.target) return;
    const a = nodeVec(ns.home), b = nodeVec(ns.target), m = slerp(a, b, 0.6);
    focusTo = [-Math.atan2(m[0], m[2]), Math.asin(m[1]) * 0.85];
  }

  function size() {
    const r = wrap.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (r.width < 2 || r.height < 2) return false;
    if (r.width !== W || r.height !== H) {
      W = r.width; H = r.height;
      [cv, ov].forEach(function (c) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
    }
    R = Math.min(W, H) * 0.44; cx = W / 2; cy = H / 2;
    return true;
  }

  function renderGL(m, t) {
    gl.viewport(0, 0, cv.width, cv.height);
    const asp = [W / Math.min(W, H), H / Math.min(W, H)], Rn = R / (Math.min(W, H) / 2);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
    gl.useProgram(PQ);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    let loc = gl.getAttribLocation(PQ, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2fv(gl.getUniformLocation(PQ, "asp"), asp); gl.uniform1f(gl.getUniformLocation(PQ, "R"), Rn);
    gl.uniformMatrix3fv(gl.getUniformLocation(PQ, "inv"), false, transpose(m)); gl.uniform1f(gl.getUniformLocation(PQ, "t"), t);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.disableVertexAttribArray(loc);
    gl.useProgram(PL); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.uniformMatrix3fv(gl.getUniformLocation(PL, "rot"), false, m);
    gl.uniform2fv(gl.getUniformLocation(PL, "asp"), asp); gl.uniform1f(gl.getUniformLocation(PL, "R"), Rn);
    const col = gl.getUniformLocation(PL, "col");
    loc = gl.getAttribLocation(PL, "p"); gl.enableVertexAttribArray(loc);
    gl.bindBuffer(gl.ARRAY_BUFFER, landBuf); gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
    gl.uniform4f(col, 0.37, 0.96, 1.0, 0.9); gl.drawArrays(gl.LINES, 0, landRanges.reduce(function (s, r) { return s + r[1]; }, 0));
    gl.bindBuffer(gl.ARRAY_BUFFER, cabBuf); gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
    gl.uniform4f(col, 0.55, 0.45, 1.0, 0.45); gl.drawArrays(gl.LINES, 0, cabRanges.reduce(function (s, r) { return s + r[1]; }, 0));
    gl.disableVertexAttribArray(loc);
  }

  function renderOverlay(m, t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const mis = AL.mission, ns = nodes(), still = AL.reduceMotion();
    if (!ns.home) return;
    // bounce arcs
    const P = arcPts().map(function (v) { return proj(v, m); });
    const seg = function (from, to, style, w) {
      ctx.beginPath(); let pen = false;
      for (let i = Math.max(0, from); i <= Math.min(P.length - 1, to); i++) {
        const p = P[i]; if (p[2] < -0.05) { pen = false; continue; }
        if (!pen) { ctx.moveTo(p[0], p[1]); pen = true; } else ctx.lineTo(p[0], p[1]);
      }
      ctx.strokeStyle = style; ctx.lineWidth = w; ctx.stroke();
    };
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    const live = mis.connected;
    let draw = P.length - 1;
    if (live && !still) draw = Math.min(P.length - 1, Math.floor((t - connectedAt) * 90));
    seg(0, draw, live ? "rgba(95,245,255,.18)" : "rgba(255,95,210,.14)", 9);
    if (live) seg(0, draw, "rgba(95,245,255,.95)", 2.4);
    else { ctx.setLineDash([6, 7]); ctx.lineDashOffset = still ? 0 : -t * 22; seg(0, draw, "rgba(255,95,210,.9)", 2); ctx.setLineDash([]); }
    if (live && traceP > 0) { // trace eats back from the target toward the rig
      const k = Math.floor((P.length - 1) * (1 - traceP));
      seg(k, P.length - 1, "rgba(255,77,109,.3)", 10); seg(k, P.length - 1, "#ff4d6d", 3);
      const h = P[k]; if (h && h[2] > -0.05) { ctx.beginPath(); ctx.arc(h[0], h[1], 5, 0, 7); ctx.fillStyle = "#fff"; ctx.shadowColor = "#ff4d6d"; ctx.shadowBlur = 14; ctx.fill(); ctx.shadowBlur = 0; }
    }
    if (!still && P.length > 1) { // packets
      [0, 0.5].forEach(function (o) {
        const f = ((t / (live ? 1.4 : 2.4)) + o) % 1, p = P[Math.floor(f * (P.length - 1))];
        if (p[2] < -0.05) return;
        ctx.beginPath(); ctx.arc(p[0], p[1], live ? 3.6 : 3, 0, 7);
        ctx.fillStyle = live ? "#e9feff" : "#ffd6f4"; ctx.shadowColor = live ? "#5ff5ff" : "#ff5fd2"; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0;
      });
    }
    // pins + labels
    const small = W < 600;
    ctx.font = "700 " + (small ? 11 : 12) + "px system-ui, -apple-system, sans-serif"; ctx.textBaseline = "middle";
    Object.keys(ns).forEach(function (id) {
      const n = ns[id], p = proj(nodeVec(n), m); n._s = p;
      if (p[2] < 0.05) return;
      const hop = mis.route.indexOf(id), a = Math.min(1, p[2] * 3);
      const col = n.type === "target" ? "255,95,210" : n.type === "home" ? "52,211,153" : n.locked ? "120,135,170" : "95,245,255";
      ctx.globalAlpha = a;
      const pulse = still ? 0 : (Math.sin(t * 3 + n.x) + 1) / 2;
      if (!n.locked) { ctx.beginPath(); ctx.arc(p[0], p[1], 9 + pulse * 5, 0, 7); ctx.fillStyle = "rgba(" + col + "," + (0.16 - pulse * 0.08) + ")"; ctx.fill(); }
      ctx.beginPath(); ctx.arc(p[0], p[1], hop >= 0 || n.type !== "relay" ? 5.5 : 4.5, 0, 7);
      ctx.fillStyle = "rgb(" + col + ")"; ctx.shadowColor = "rgb(" + col + ")"; ctx.shadowBlur = n.locked ? 0 : 10; ctx.fill(); ctx.shadowBlur = 0;
      ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.stroke();
      if (hop >= 0) {
        ctx.beginPath(); ctx.arc(p[0] - 10, p[1] - 11, 7.5, 0, 7); ctx.fillStyle = "#ff5fd2"; ctx.fill();
        ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.fillText(String(hop + 1), p[0] - 10, p[1] - 10.5);
      }
      if (n.locked && small) { ctx.globalAlpha = 1; return; }
      const right = p[0] < cx + R * 0.55, label = n.locked ? n.name + " \u00b7 locked" : n.name;
      ctx.textAlign = right ? "left" : "right";
      const lx = p[0] + (right ? 11 : -11);
      ctx.lineWidth = 4; ctx.strokeStyle = "rgba(2,6,16,.85)"; ctx.strokeText(label, lx, p[1]);
      ctx.fillStyle = n.locked ? "rgba(170,185,215,.7)" : n.type === "relay" && hop < 0 ? "rgba(225,245,255,.85)" : "#fff";
      ctx.fillText(label, lx, p[1]);
      ctx.globalAlpha = 1;
    });
    if (traced) { ctx.fillStyle = "rgba(255,40,80,.12)"; ctx.fillRect(0, 0, W, H); }
  }

  function visible() { return !document.hidden && wrap.offsetParent !== null && W > 0; }
  function frame(now) {
    raf = 0;
    if (!size() || !visible()) return; // resumes via kick()
    const moving = dragging || Math.abs(vy) + Math.abs(vp) > 1e-4 || focusTo;
    if (now - last >= 33 || !last) { // 30fps cap
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0.033; last = now;
      if (!dragging) {
        yaw += vy; pitch += vp; vy *= Math.pow(0.04, dt); vp *= Math.pow(0.04, dt);
        if (focusTo) {
          let dy = focusTo[0] - yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
          const k = AL.reduceMotion() ? 1 : 1 - Math.pow(0.02, dt);
          yaw += dy * k; pitch += (focusTo[1] - pitch) * k;
          if (Math.abs(dy) < 0.002 && Math.abs(focusTo[1] - pitch) < 0.002) focusTo = null;
        }
      }
      pitch = Math.max(-1.2, Math.min(1.2, pitch));
      const m = rotM(), t = (now - t0) / 1000;
      renderGL(m, t); renderOverlay(m, t);
    }
    if (!AL.reduceMotion() || moving) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  // ---------- input: drag to rotate with inertia, tap to pick a relay ----------
  let sx = 0, sy = 0, px = 0, py = 0, moved = 0, lt = 0;
  ov.addEventListener("pointerdown", function (e) {
    dragging = true; focusTo = null; moved = 0; sx = px = e.clientX; sy = py = e.clientY; lt = performance.now(); vy = vp = 0;
    try { ov.setPointerCapture(e.pointerId); } catch (_) {}
    kick();
  });
  ov.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    const dx = e.clientX - px, dy = e.clientY - py, now = performance.now(), k = 1 / R;
    yaw += dx * k; pitch -= dy * k; px = e.clientX; py = e.clientY;
    moved = Math.max(moved, Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy));
    const f = 33 / Math.max(8, now - lt); vy = dx * k * f * 0.35; vp = -dy * k * f * 0.35; lt = now;
    kick();
  });
  const up = function (e) {
    if (!dragging) return; dragging = false;
    if (performance.now() - lt > 80) { vy = vp = 0; }
    if (moved < 8) {
      const r = ov.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, ns = nodes();
      let best = null, bd = 30;
      Object.keys(ns).forEach(function (id) {
        const n = ns[id]; if (n.type !== "relay" || n.locked || !n._s || n._s[2] < 0.1) return;
        const d = Math.hypot(n._s[0] - x, n._s[1] - y); if (d < bd) { bd = d; best = id; }
      });
      if (best) { AL.Audio.unlock(); AL.sfx("tap"); flat.toggle(best); }
    }
    kick();
  };
  ov.addEventListener("pointerup", up); ov.addEventListener("pointercancel", up);
  document.addEventListener("visibilitychange", kick);
  window.addEventListener("resize", kick);
  cv.addEventListener("webglcontextlost", function (e) { e.preventDefault(); disable("context-lost"); });
  if ("IntersectionObserver" in window) new IntersectionObserver(kick).observe(wrap);
  if ("ResizeObserver" in window) new ResizeObserver(kick).observe(wrap);
  document.addEventListener("click", function (e) { if (e.target.closest(".tab, .tab-bar, [data-tab]")) setTimeout(kick, 30); }, true);

  function disable(why) {
    document.body.classList.remove("globe-on"); cv.remove(); ov.remove();
    AL.map = flat; AL.globe = { active: false, reason: why };
  }

  // ---------- same interface as map.js ----------
  AL.map = Object.assign({}, flat, {
    draw: function () { flat.draw(); traceP = -1; traced = false; focus(); kick(); },
    redraw: function (animate) { flat.redraw(animate); if (AL.mission.connected) connectedAt = (performance.now() - t0) / 1000 - (animate ? 0 : 99); else { traceP = -1; traced = false; } kick(); },
    toggle: function (id) { flat.toggle(id); kick(); },
    clear: function () { flat.clear(); kick(); },
    traceVisual: function (p) { flat.traceVisual(p); traceP = p; kick(); },
    markTraced: function () { flat.markTraced(); traced = true; kick(); }
  });
  // keep relay picks in the ladder (bound to flat.toggle) waking the globe too
  document.addEventListener("click", function (e) { if (e.target.closest(".relay-pick, #btn-map-clear, #btn-map-connect")) setTimeout(kick, 0); });
  AL.globe = { active: true, kick: kick, view: function () { return { yaw: yaw, pitch: pitch }; }, spin: function (dy) { yaw += dy; kick(); } };
})(window.AL);
