/* Original inline SVG art: portraits (with expressions), icons, contract art. */
window.ASHLINE_ART = (function () {
  "use strict";
  let uid = 0;

  const PEOPLE = {
    kite: { skin: "#e8b89a", skinShade: "#c98f74", hair: "#1b1033", hairHi: "#7c3aed", bg1: "#7c3aed", bg2: "#1e1b4b", style: "undercut", acc: "earpiece", jacket: "#231a3d", trim: "#a78bfa" },
    lena: { skin: "#f1c9a8", skinShade: "#d4a383", hair: "#8a4b2a", hairHi: "#b8693f", bg1: "#0ea5e9", bg2: "#0c2a4a", style: "bob", acc: "glasses", jacket: "#1f2f45", trim: "#4fd1ff" },
    mira: { skin: "#c68f6a", skinShade: "#a5714f", hair: "#151515", hairHi: "#3a3a3a", bg1: "#14b8a6", bg2: "#06302c", style: "beanie", acc: "none", jacket: "#183a35", trim: "#34d399" },
    ren: { skin: "#e0b28c", skinShade: "#bf8f6b", hair: "#0f0f12", hairHi: "#2b2b33", bg1: "#f43f5e", bg2: "#3b0a17", style: "short", acc: "collar", jacket: "#2a1620", trim: "#fb7185" }
  };

  function mouth(expr) {
    if (expr === "smirk") return '<path d="M43 74 Q52 79 60 72" stroke="#5b2a2a" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    if (expr === "worried") return '<path d="M44 77 Q50 72 57 77" stroke="#5b2a2a" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    return '<path d="M44 75 Q50 77 56 75" stroke="#5b2a2a" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
  }
  function brows(expr, color) {
    if (expr === "worried") return '<path d="M34 50 L44 47" stroke="' + color + '" stroke-width="3" stroke-linecap="round"/><path d="M56 47 L66 50" stroke="' + color + '" stroke-width="3" stroke-linecap="round"/>';
    if (expr === "smirk") return '<path d="M34 48 L44 48" stroke="' + color + '" stroke-width="3" stroke-linecap="round"/><path d="M56 46 L66 44" stroke="' + color + '" stroke-width="3" stroke-linecap="round"/>';
    return '<path d="M34 48 L44 47" stroke="' + color + '" stroke-width="3" stroke-linecap="round"/><path d="M56 47 L66 48" stroke="' + color + '" stroke-width="3" stroke-linecap="round"/>';
  }
  function hairBack(p) {
    if (p.style === "bob") return '<path d="M24 52 Q22 24 50 20 Q78 24 76 52 L76 70 Q70 74 66 68 L66 46 L34 46 L34 68 Q30 74 24 70 Z" fill="' + p.hair + '"/>';
    return "";
  }
  function hairFront(p) {
    switch (p.style) {
      case "undercut":
        return '<path d="M28 46 Q28 20 54 19 Q74 20 74 40 Q62 30 46 34 Q36 37 28 46 Z" fill="' + p.hair + '"/>' +
               '<path d="M52 20 Q68 22 72 36 Q64 28 54 28 Z" fill="' + p.hairHi + '" opacity=".9"/>';
      case "bob":
        return '<path d="M28 44 Q30 22 50 21 Q72 22 72 44 Q60 32 50 33 Q38 33 28 44 Z" fill="' + p.hair + '"/>' +
               '<path d="M56 23 Q68 27 70 38" stroke="' + p.hairHi + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
      case "beanie":
        return '<path d="M26 42 Q26 16 50 15 Q74 16 74 42 Z" fill="#2dd4bf"/><rect x="25" y="37" width="50" height="8" rx="4" fill="#0f766e"/>';
      default:
        return '<path d="M29 42 Q30 22 50 21 Q70 22 71 42 Q64 32 50 31 Q36 32 29 42 Z" fill="' + p.hair + '"/>';
    }
  }
  function accessory(p) {
    if (p.acc === "glasses") return '<g fill="none" stroke="#1e293b" stroke-width="2.2"><circle cx="40" cy="56" r="7"/><circle cx="60" cy="56" r="7"/><path d="M47 56 L53 56"/></g>';
    if (p.acc === "earpiece") return '<circle cx="26" cy="60" r="4" fill="#a78bfa"/><path d="M26 64 Q30 74 40 76" stroke="#a78bfa" stroke-width="1.6" fill="none"/>';
    if (p.acc === "collar") return '<path d="M38 92 L50 100 L62 92" stroke="#e2e8f0" stroke-width="3" fill="none"/>';
    return "";
  }

  const IRIS = { kite: "#8b5cf6", lena: "#2563eb", mira: "#065f46", ren: "#7c2d12" };
  function portrait(who, expr, size) {
    const p = PEOPLE[who] || PEOPLE.kite;
    const n = ++uid, bg = "pg" + n, sk = "ps" + n, jk = "pj" + n, hr = "ph" + n, rim = "pr" + n;
    const e = expr || "neutral";
    const eyeY = e === "worried" ? 57 : 56, lid = e === "smirk" ? 1.9 : 3.1;
    const iris = IRIS[who] || "#334155";
    function eye(cx) {
      return '<ellipse cx="' + cx + '" cy="' + eyeY + '" rx="4.6" ry="' + lid + '" fill="#f8fafc"/>' +
        '<circle cx="' + (cx + 0.6) + '" cy="' + eyeY + '" r="' + Math.min(2.7, lid) + '" fill="' + iris + '"/>' +
        '<circle cx="' + (cx + 0.6) + '" cy="' + eyeY + '" r="1.2" fill="#0b0b12"/>' +
        '<circle cx="' + (cx + 1.6) + '" cy="' + (eyeY - 1) + '" r=".9" fill="#fff"/>' +
        '<path d="M' + (cx - 5) + " " + (eyeY - lid + 0.4) + " Q" + cx + " " + (eyeY - lid - 1.6) + " " + (cx + 5) + " " + (eyeY - lid + 0.4) + '" stroke="#1a1020" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
    }
    return '<svg class="portrait" viewBox="0 0 100 100" width="' + (size || 40) + '" height="' + (size || 40) + '" aria-hidden="true">' +
      "<defs>" +
      '<linearGradient id="' + bg + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + p.bg1 + '"/><stop offset="1" stop-color="' + p.bg2 + '"/></linearGradient>' +
      '<radialGradient id="' + sk + '" cx="42%" cy="40%" r="70%"><stop offset="0" stop-color="' + p.skin + '"/><stop offset=".75" stop-color="' + p.skin + '"/><stop offset="1" stop-color="' + p.skinShade + '"/></radialGradient>' +
      '<linearGradient id="' + jk + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.jacket + '"/><stop offset="1" stop-color="#05070c"/></linearGradient>' +
      '<linearGradient id="' + hr + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + p.hairHi + '"/><stop offset=".45" stop-color="' + p.hair + '"/></linearGradient>' +
      '<radialGradient id="' + rim + '" cx="80%" cy="15%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      "</defs>" +
      '<rect width="100" height="100" rx="22" fill="url(#' + bg + ')"/>' +
      '<path d="M0 30 H100 M0 50 H100 M0 70 H100 M30 0 V100 M70 0 V100" stroke="#fff" stroke-opacity=".05" stroke-width=".6"/>' +
      '<rect width="100" height="100" rx="22" fill="url(#' + rim + ')"/>' +
      hairBack(p).replace('fill="' + p.hair + '"', 'fill="url(#' + hr + ')"') +
      '<path d="M14 100 Q18 80 50 78 Q82 80 86 100 Z" fill="url(#' + jk + ')"/>' +
      '<path d="M14 100 Q18 80 50 78 Q82 80 86 100" fill="none" stroke="' + p.trim + '" stroke-width="1.6" opacity=".85"/>' +
      '<path d="M40 79 L50 92 L60 79" fill="none" stroke="' + p.trim + '" stroke-width="1.2" opacity=".5"/>' +
      '<path d="M43 68 h14 v14 q-7 5 -14 0 Z" fill="' + p.skinShade + '"/>' +
      '<ellipse cx="29" cy="58" rx="3.6" ry="5.5" fill="' + p.skinShade + '"/><ellipse cx="71" cy="58" rx="3.6" ry="5.5" fill="' + p.skinShade + '"/>' +
      '<path d="M29 52 Q29 30 50 30 Q71 30 71 52 Q71 70 58 78 Q50 82 42 78 Q29 70 29 52 Z" fill="url(#' + sk + ')"/>' +
      '<path d="M70.5 46 Q72 60 63 75" stroke="' + p.bg1 + '" stroke-width="1.4" fill="none" opacity=".4" stroke-linecap="round"/>' +
      eye(40) + eye(60) +
      '<path d="M50 58 Q47.5 66 50.5 67.5" stroke="' + p.skinShade + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
      brows(e, p.hair === "#151515" ? "#222" : p.hair) +
      mouth(e) +
      '<ellipse cx="35" cy="66" rx="4" ry="2.2" fill="#f87171" opacity=".2"/><ellipse cx="65" cy="66" rx="4" ry="2.2" fill="#f87171" opacity=".2"/>' +
      hairFront(p).replace('fill="' + p.hair + '"', 'fill="url(#' + hr + ')"') +
      accessory(p) +
      '<rect x=".5" y=".5" width="99" height="99" rx="21.5" fill="none" stroke="#fff" stroke-opacity=".14"/>' +
      "</svg>";
  }

  // ---- Icons (24px stroke set) ----
  const I = {
    play: '<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    back: '<path d="M15 18l-6-6 6-6"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    map: '<path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/>',
    term: '<path d="M4 17l6-6-6-6M12 19h8"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    relay: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19.1 4.9a10 10 0 0 1 0 14.2M4.9 19.1a10 10 0 0 1 0-14.2"/>',
    radar: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><path d="M12 12l7-7"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    unlock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    data: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    star: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    sound: '<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    text: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
    motion: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    backspace: '<path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><path d="M18 9l-6 6M12 9l6 6"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
    wave: '<path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" opacity=".5"/>',
    news: '<path d="M4 4h13v16H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v10a2 2 0 0 1-2 2"/><path d="M8 8h5M8 12h5M8 16h3"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'
  };
  function icon(name, size) {
    return '<svg class="ic" viewBox="0 0 24 24" width="' + (size || 20) + '" height="' + (size || 20) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (I[name] || "") + "</svg>";
  }

  // ---- Contract card art (generated scene per job) ----
  function contractArt(kind) {
    const id = "ca" + (++uid);
    const palettes = {
      glasswing: ["#0ea5e9", "#1e1b4b", "#a78bfa"],
      driftnet: ["#14b8a6", "#062e2a", "#4fd1ff"],
      blackcurrent: ["#f43f5e", "#2a0712", "#fbbf24"]
    };
    const c = palettes[kind] || palettes.glasswing;
    let scene = "";
    if (kind === "glasswing") {
      scene = '<path d="M20 90 L60 40 L100 70 L140 30 L180 80 L220 50 L260 90" stroke="' + c[2] + '" stroke-width="2" fill="none" opacity=".8"/>' +
        '<rect x="200" y="20" width="60" height="44" rx="6" fill="none" stroke="' + c[0] + '" stroke-width="2"/><path d="M210 50 l12-14 12 10 14-16" stroke="' + c[0] + '" stroke-width="2" fill="none"/>';
    } else if (kind === "driftnet") {
      scene = '<path d="M0 70 Q40 60 80 70 T160 70 T240 70 T320 70" stroke="' + c[2] + '" stroke-width="1.5" fill="none" opacity=".6"/>' +
        '<path d="M0 95 Q60 80 120 92 T260 88" stroke="' + c[0] + '" stroke-width="3" fill="none"/>' +
        '<rect x="180" y="30" width="34" height="18" rx="4" fill="' + c[0] + '" opacity=".85"/><path d="M197 48 v34" stroke="' + c[0] + '" stroke-dasharray="3 3"/>';
    } else {
      scene = '<rect x="40" y="30" width="90" height="70" fill="none" stroke="' + c[0] + '" stroke-width="2"/>' +
        '<path d="M55 50h60M55 62h44M55 74h52" stroke="' + c[2] + '" stroke-width="2" opacity=".8"/>' +
        '<circle cx="210" cy="60" r="28" fill="none" stroke="' + c[0] + '" stroke-width="2"/><path d="M210 40v40M190 60h40" stroke="' + c[0] + '" stroke-width="1.5"/>';
    }
    return '<svg class="c-art" viewBox="0 0 280 110" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c[1] + '"/><stop offset="1" stop-color="#070a10"/></linearGradient></defs>' +
      '<rect width="280" height="110" fill="url(#' + id + ')"/>' +
      '<g opacity=".18" stroke="#fff">' + Array.from({ length: 8 }, function (_, i) { return '<path d="M' + (i * 40) + ' 0V110"/>'; }).join("") + "</g>" +
      scene + "</svg>";
  }

  return { portrait: portrait, icon: icon, contractArt: contractArt, PEOPLE: PEOPLE };
})();
