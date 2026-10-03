/*
 * MI ballloons — малювання кульок і композицій у SVG.
 * Одна логіка для каталогу, сторінки товару, конструктора та головної.
 */
(function (MB) {
  'use strict';

  /* Розміри в умовних одиницях (≈ 2,4 одиниці на 1 см) */
  const SIZE = {
    latex12: { r: 36 },
    latex18: { r: 52 },
    latex36: { r: 96 },
    confetti: { r: 36 },
    bubble: { r: 74 },
    orb: { r: 50 },
    heart: { s: 52 },
    star: { s: 56 },
    number: { h: 240 },
    letter: { h: 224 },
  };
  const TALL = { number: true, letter: true };
  const TAU = Math.PI * 2;
  const INK = '#2b0f1d';
  let uid = 0;

  /* ---------- утиліти ---------- */
  const f = (n) => Math.round(n * 10) / 10;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function hexToRgb(hex) {
    let h = String(hex || '#000').replace('#', '');
    if (h.length === 3) h = h.replace(/./g, (c) => c + c);
    const n = parseInt(h, 16) || 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function toHex(rgb) {
    return '#' + rgb.map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
  }
  function mix(a, b, t) {
    const A = hexToRgb(a);
    const B = hexToRgb(b);
    return toHex(A.map((v, i) => v + (B[i] - v) * t));
  }
  const light = (c, t) => mix(c, '#ffffff', t);
  const dark = (c, t) => mix(c, INK, t);
  function lum(hex) {
    const [r, g, b] = hexToRgb(hex).map((v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function hash(str) {
    let h = 2166136261;
    str = String(str);
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function rng(seed) {
    let a = seed >>> 0 || 1;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  let colorMap = null;
  function color(id, type) {
    if (!colorMap) {
      colorMap = new Map();
      (MB.palette || []).forEach((c) => colorMap.set(c.id, c));
    }
    const fallback = ((MB.types || {})[type] || {}).defaultColor;
    return colorMap.get(id) || colorMap.get(fallback) || { id: 'blush', name: 'Пудра', hex: '#F1BFCC', finish: 'pastel' };
  }
  function listHex(list, id, fallback) {
    const hit = (list || []).find((x) => x.id === id);
    return hit ? hit.hex : fallback;
  }

  /* ---------- defs ---------- */
  function Defs(prefix) {
    this.p = prefix;
    this.m = new Map();
  }
  Defs.prototype.add = function (key, build) {
    const id = this.p + '-' + String(key).replace(/[^a-z0-9-]/gi, '');
    if (!this.m.has(id)) this.m.set(id, build(id));
    return id;
  };
  Defs.prototype.unique = function (key, build) {
    const id = this.p + '-' + key + '-' + ++uid;
    this.m.set(id, build(id));
    return id;
  };
  Defs.prototype.html = function () {
    return this.m.size ? '<defs>' + Array.from(this.m.values()).join('') + '</defs>' : '';
  };

  function stops(list) {
    return list
      .map((s) => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`)
      .join('');
  }
  function radial(id, list, g) {
    g = g || {};
    return `<radialGradient id="${id}" cx="${g.cx ?? 0.42}" cy="${g.cy ?? 0.38}" r="${g.r ?? 0.68}" fx="${g.fx ?? 0.34}" fy="${g.fy ?? 0.27}">${stops(list)}</radialGradient>`;
  }
  function linear(id, list, g) {
    g = g || {};
    const units = g.user ? ' gradientUnits="userSpaceOnUse"' : '';
    return `<linearGradient id="${id}" x1="${g.x1 ?? 0}" y1="${g.y1 ?? 0}" x2="${g.x2 ?? 1}" y2="${g.y2 ?? 1}"${units}>${stops(list)}</linearGradient>`;
  }

  /* ---------- фарби ---------- */
  function latexPaint(defs, c) {
    return defs.add('lx-' + c.id, (id) => {
      const h = c.hex;
      if (c.finish === 'chrome') {
        return radial(id, [[0, light(h, 0.82)], [0.16, light(h, 0.42)], [0.34, h], [0.52, dark(h, 0.46)], [0.68, light(h, 0.2)], [0.8, h], [0.92, dark(h, 0.4)], [1, light(h, 0.12)]], { cx: 0.42, cy: 0.38, r: 0.66, fx: 0.33, fy: 0.25 });
      }
      if (c.finish === 'pearl') {
        return radial(id, [[0, light(h, 0.85)], [0.3, light(h, 0.45)], [0.66, h], [0.9, dark(h, 0.1)], [1, dark(h, 0.2)]]);
      }
      if (c.finish === 'clear' || c.finish === 'confetti') {
        return radial(id, [[0, '#ffffff', 0.06], [0.6, '#ffffff', 0.12], [0.86, '#e4ebf3', 0.36], [1, '#c3cfdd', 0.66]], { cx: 0.5, cy: 0.48, r: 0.56, fx: 0.42, fy: 0.36 });
      }
      const deep = c.finish === 'bright';
      const white = lum(h) > 0.82;
      return radial(id, [
        [0, light(h, deep ? 0.42 : 0.72)],
        [0.28, light(h, deep ? 0.12 : 0.3)],
        [0.64, h],
        [0.9, dark(h, deep ? 0.28 : white ? 0.09 : 0.14)],
        [1, dark(h, deep ? 0.46 : white ? 0.16 : 0.25)],
      ]);
    });
  }
  function foilPaint(defs, c) {
    return defs.add('fl-' + c.id, (id) => {
      const h = c.hex;
      const k = lum(h) < 0.06;
      return linear(id, [[0, light(h, k ? 0.32 : 0.6)], [0.24, h], [0.45, light(h, k ? 0.2 : 0.4)], [0.62, dark(h, 0.16)], [0.82, light(h, k ? 0.12 : 0.26)], [1, dark(h, 0.32)]], { x1: 0.1, y1: 0, x2: 0.9, y2: 1 });
    });
  }
  function foilRadial(defs, c) {
    return defs.add('fr-' + c.id, (id) => {
      const h = c.hex;
      const k = lum(h) < 0.06;
      return radial(id, [[0, light(h, k ? 0.4 : 0.72)], [0.3, light(h, k ? 0.12 : 0.26)], [0.62, h], [0.84, dark(h, 0.22)], [0.94, light(h, 0.16)], [1, dark(h, 0.32)]], { cx: 0.45, cy: 0.42, r: 0.6, fx: 0.36, fy: 0.3 });
    });
  }
  function glyphPaint(defs, c) {
    return defs.add('gl-' + c.id, (id) => {
      const h = c.hex;
      const k = lum(h) < 0.06;
      return linear(id, [[0, light(h, k ? 0.3 : 0.55)], [0.22, h], [0.42, light(h, k ? 0.18 : 0.36)], [0.6, dark(h, 0.18)], [0.8, light(h, k ? 0.1 : 0.22)], [1, dark(h, 0.34)]], { x1: 0, y1: 0, x2: 100, y2: 150, user: true });
    });
  }
  function shine(defs) {
    return defs.add('shine', (id) => radial(id, [[0, '#ffffff', 0.95], [0.45, '#ffffff', 0.42], [1, '#ffffff', 0]], { cx: 0.5, cy: 0.5, r: 0.5, fx: 0.5, fy: 0.5 }));
  }
  function vignette(defs) {
    return defs.add('vig', (id) => radial(id, [[0, INK, 0], [0.7, INK, 0], [1, INK, 0.2]], { cx: 0.44, cy: 0.4, r: 0.64, fx: 0.44, fy: 0.4 }));
  }
  function floorShadow(defs) {
    return defs.add('floor', (id) => radial(id, [[0, INK, 0.2], [1, INK, 0]], { cx: 0.5, cy: 0.5, r: 0.5, fx: 0.5, fy: 0.5 }));
  }

  const TEXT_HEX = { white: '#ffffff', ink: '#231a1f', gold: '#c09347', silver: '#a9b0ba', rose: '#cf8e7c', pink: '#de6e96' };
  function textPaint(defs, key) {
    const h = TEXT_HEX[key] || TEXT_HEX.ink;
    if (key !== 'gold' && key !== 'silver' && key !== 'rose') return h;
    return 'url(#' + defs.add('tx-' + key, (id) => linear(id, [[0, dark(h, 0.18)], [0.32, light(h, 0.45)], [0.5, h], [0.72, light(h, 0.28)], [1, dark(h, 0.26)]], { x1: 0, y1: 0, x2: 1, y2: 0.7 })) + ')';
  }
  function defaultTextColor(colorId, type) {
    const c = color(colorId, type);
    if (c.finish === 'clear' || c.finish === 'confetti') return 'ink';
    return lum(c.hex) < 0.28 ? 'white' : 'ink';
  }

  /* ---------- текст на кульках ---------- */
  const FONTS = {
    script: { fam: "'Great Vibes', cursive", w: 400, st: 'normal', lh: 0.98, k: 1.2 },
    hand: { fam: "'Bad Script', cursive", w: 400, st: 'normal', lh: 1.08, k: 1 },
    classic: { fam: "'Cormorant Garamond', serif", w: 600, st: 'italic', lh: 1, k: 1.08 },
    modern: { fam: 'Unbounded, sans-serif', w: 600, st: 'normal', lh: 1.14, k: 0.84, up: true },
  };
  let mctx = null;
  function measure(str, F) {
    if (typeof document === 'undefined') return str.length * 50;
    mctx = mctx || document.createElement('canvas').getContext('2d');
    mctx.font = `${F.st} ${F.w} 100px ${F.fam}`;
    return mctx.measureText(str).width;
  }
  function balance(words, n, F) {
    const target = measure(words.join(' '), F) / n;
    const out = [];
    let cur = '';
    words.forEach((w) => {
      const next = cur ? cur + ' ' + w : w;
      if (cur && out.length < n - 1 && measure(next, F) > target * 1.1) {
        out.push(cur);
        cur = w;
      } else cur = next;
    });
    if (cur) out.push(cur);
    return out;
  }
  function splitLines(value, F) {
    let lines = String(value).replace(/\r/g, '').split('\n').map((s) => s.trim()).filter(Boolean);
    if (lines.length === 1) {
      const words = lines[0].split(/\s+/);
      if (words.length > 1 && lines[0].length > 11) {
        lines = balance(words, lines[0].length > 26 && words.length > 2 ? 3 : 2, F);
      }
    }
    return lines.slice(0, 3);
  }
  function textBlock(defs, t, boxW, boxH, maxFs, cy) {
    const F = FONTS[t.font] || FONTS.script;
    let lines = splitLines(t.value || '', F);
    if (F.up) lines = lines.map((s) => s.toLocaleUpperCase('uk'));
    if (!lines.length) return '';
    const widest = Math.max.apply(null, lines.map((l) => measure(l, F))) || 1;
    let fs = Math.min(maxFs * F.k, (boxW * 100) / widest, boxH / (lines.length * F.lh));
    fs = Math.max(fs, 5);
    const lh = fs * F.lh;
    const y0 = cy - (lh * (lines.length - 1)) / 2;
    const spans = lines.map((l, i) => `<tspan x="0" y="${f(y0 + i * lh)}" dominant-baseline="central">${esc(l)}</tspan>`).join('');
    return `<text class="mb-ink" text-anchor="middle" dominant-baseline="central" font-family="${F.fam}" font-weight="${F.w}" font-style="${F.st}" font-size="${f(fs)}" fill="${textPaint(defs, t.color)}">${spans}</text>`;
  }

  /* ---------- форми кульок ---------- */
  function balloonPath(r) {
    return `M0 ${f(-1.08 * r)}C${f(0.57 * r)} ${f(-1.08 * r)} ${f(r)} ${f(-0.65 * r)} ${f(r)} ${f(-0.08 * r)}C${f(r)} ${f(0.45 * r)} ${f(0.56 * r)} ${f(0.9 * r)} ${f(0.12 * r)} ${f(1.05 * r)}Q0 ${f(1.09 * r)} ${f(-0.12 * r)} ${f(1.05 * r)}C${f(-0.56 * r)} ${f(0.9 * r)} ${f(-r)} ${f(0.45 * r)} ${f(-r)} ${f(-0.08 * r)}C${f(-r)} ${f(-0.65 * r)} ${f(-0.57 * r)} ${f(-1.08 * r)} 0 ${f(-1.08 * r)}Z`;
  }
  function knot(r, hex) {
    return `<path d="M${f(-0.075 * r)} ${f(1.03 * r)}L${f(0.075 * r)} ${f(1.03 * r)}L${f(0.13 * r)} ${f(1.17 * r)}Q0 ${f(1.22 * r)} ${f(-0.13 * r)} ${f(1.17 * r)}Z" fill="${hex}"/>`;
  }
  function gloss(defs, r, k) {
    const g = shine(defs);
    const cx = f(-0.37 * r);
    const cy = f(-0.5 * r);
    const sx = f(-0.47 * r);
    const sy = f(-0.64 * r);
    return (
      `<ellipse cx="${cx}" cy="${cy}" rx="${f(0.23 * r)}" ry="${f(0.38 * r)}" transform="rotate(34 ${cx} ${cy})" fill="url(#${g})" opacity="${k}"/>` +
      `<ellipse cx="${sx}" cy="${sy}" rx="${f(0.05 * r)}" ry="${f(0.095 * r)}" transform="rotate(34 ${sx} ${sy})" fill="#fff" opacity="${Math.min(1, k + 0.12)}"/>` +
      `<path d="M${f(0.74 * r)} ${f(0.3 * r)}Q${f(0.6 * r)} ${f(0.78 * r)} ${f(0.14 * r)} ${f(0.97 * r)}" fill="none" stroke="#fff" stroke-opacity="${f(k * 40) / 100}" stroke-width="${f(0.05 * r)}" stroke-linecap="round"/>`
    );
  }
  function confettiDots(it, c, r) {
    const rand = rng(hash((it.id || '') + c.id));
    const cols = c.multi || [c.hex, light(c.hex, 0.4), dark(c.hex, 0.14)];
    let s = '';
    for (let i = 0; i < 30; i++) {
      const a = rand() * TAU;
      const u = Math.sqrt(rand()) * 0.96;
      const x = Math.cos(a) * u * 0.78 * r;
      const y = Math.sin(a) * u * 0.84 * r + rand() * 0.12 * r - 0.04 * r;
      const col = cols[Math.floor(rand() * cols.length)];
      const z = (0.035 + rand() * 0.035) * r;
      if (rand() < 0.68) s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(z)}" fill="${col}"/>`;
      else s += `<rect x="${f(x - z)}" y="${f(y - z * 0.45)}" width="${f(z * 2)}" height="${f(z * 0.9)}" rx="${f(z * 0.3)}" transform="rotate(${Math.round(rand() * 180)} ${f(x)} ${f(y)})" fill="${col}"/>`;
    }
    return s;
  }

  function drawLatex(defs, it, c, r) {
    const d = balloonPath(r);
    const clear = c.finish === 'clear' || c.finish === 'confetti';
    const pale = !clear && c.finish !== 'chrome' && lum(c.hex) > 0.72;
    const edge = clear
      ? ` stroke="#a9b8ca" stroke-opacity=".7" stroke-width="${f(r * 0.024)}"`
      : pale
        ? ` stroke="${dark(c.hex, 0.2)}" stroke-opacity=".35" stroke-width="${f(r * 0.018)}"`
        : '';
    let s = `<path d="${d}" fill="url(#${latexPaint(defs, c)})"${edge}/>`;
    if (c.finish === 'confetti') s += confettiDots(it, c, r);
    if (!clear) s += `<path d="${d}" fill="url(#${vignette(defs)})"/>`;
    if (it.text && it.text.value) s += textBlock(defs, it.text, r * 1.36, r * 1.0, r * 0.52, -0.08 * r);
    const k = clear || c.finish === 'chrome' ? 0.95 : c.finish === 'pearl' ? 0.8 : c.finish === 'bright' ? 0.48 : 0.62;
    s += gloss(defs, r, k);
    s += knot(r, clear ? '#c2cdda' : dark(c.hex, 0.2));
    return s;
  }

  function miniBalloon(defs, c, r) {
    return `<path d="${balloonPath(r)}" fill="url(#${latexPaint(defs, c)})"/>` + gloss(defs, r, 0.55) + knot(r, dark(c.hex, 0.2));
  }
  function innerBalloons(defs, it, r) {
    const c = color(it.inner, 'latex12');
    const pos = [[-0.5, 0.2, 0.17, -32], [0.4, 0.2, 0.17, 22], [-0.16, 0.3, 0.19, -10], [0.18, 0.32, 0.19, 12], [-0.42, 0.5, 0.2, -22], [0.44, 0.48, 0.2, 26], [0.02, 0.58, 0.22, 4]];
    return '<g opacity=".95">' + pos.map((p) => `<g transform="translate(${f(p[0] * r)} ${f(p[1] * r)}) rotate(${p[3]})">${miniBalloon(defs, c, p[2] * r)}</g>`).join('') + '</g>';
  }
  function drawBubble(defs, it, r) {
    const paint = defs.add('bub', (id) => radial(id, [[0, '#ffffff', 0.5], [0.62, '#ffffff', 0.46], [0.86, '#eef3f8', 0.5], [0.97, '#c9d5e2', 0.66], [1, '#aebdcf', 0.8]], { cx: 0.5, cy: 0.5, r: 0.5, fx: 0.44, fy: 0.4 }));
    let s = `<path d="M${f(-0.08 * r)} ${f(0.98 * r)}L${f(0.08 * r)} ${f(0.98 * r)}L${f(0.05 * r)} ${f(1.1 * r)}L${f(-0.05 * r)} ${f(1.1 * r)}Z" fill="#c4cfdc"/>`;
    s += `<circle r="${r}" fill="url(#${paint})" stroke="#a6b6c9" stroke-opacity=".6" stroke-width="${f(r * 0.018)}"/>`;
    let ty = 0;
    if (it.inner) {
      s += innerBalloons(defs, it, r);
      ty = -0.3 * r;
    }
    if (it.text && it.text.value) s += textBlock(defs, it.text, it.inner ? r * 1.5 : r * 1.52, it.inner ? r * 0.84 : r * 1.12, r * 0.48, ty);
    const g = shine(defs);
    const hx = f(-0.44 * r);
    const hy = f(-0.5 * r);
    s += `<ellipse cx="${hx}" cy="${hy}" rx="${f(0.18 * r)}" ry="${f(0.32 * r)}" transform="rotate(38 ${hx} ${hy})" fill="url(#${g})" opacity=".8"/>`;
    s += `<path d="M${f(0.566 * r)} ${f(-0.674 * r)}A${f(0.88 * r)} ${f(0.88 * r)} 0 0 1 ${f(0.866 * r)} ${f(-0.153 * r)}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="${f(0.03 * r)}" stroke-linecap="round"/>`;
    s += `<path d="M${f(-0.44 * r)} ${f(0.762 * r)}A${f(0.88 * r)} ${f(0.88 * r)} 0 0 1 ${f(-0.85 * r)} ${f(0.228 * r)}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="${f(0.025 * r)}" stroke-linecap="round"/>`;
    s += `<circle cx="${f(-0.56 * r)}" cy="${f(-0.66 * r)}" r="${f(0.032 * r)}" fill="#fff"/>`;
    return s;
  }

  function heartPath(s) {
    return `M0 ${f(-0.44 * s)}C${f(0.16 * s)} ${f(-0.96 * s)} ${f(1.04 * s)} ${f(-0.98 * s)} ${f(1.04 * s)} ${f(-0.28 * s)}C${f(1.04 * s)} ${f(0.26 * s)} ${f(0.46 * s)} ${f(0.62 * s)} 0 ${f(0.98 * s)}C${f(-0.46 * s)} ${f(0.62 * s)} ${f(-1.04 * s)} ${f(0.26 * s)} ${f(-1.04 * s)} ${f(-0.28 * s)}C${f(-1.04 * s)} ${f(-0.98 * s)} ${f(-0.16 * s)} ${f(-0.96 * s)} 0 ${f(-0.44 * s)}Z`;
  }
  function drawHeart(defs, it, c, s) {
    const d = heartPath(s);
    let o = `<path d="${d}" fill="url(#${foilPaint(defs, c)})" stroke="${dark(c.hex, 0.3)}" stroke-width="${f(s * 0.03)}" stroke-linejoin="round"/>`;
    o += `<path d="${heartPath(s * 0.86)}" transform="translate(0 ${f(-s * 0.03)})" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="${f(s * 0.05)}"/>`;
    o += `<path d="${d}" fill="url(#${vignette(defs)})" opacity=".8"/>`;
    if (it.text && it.text.value) o += textBlock(defs, it.text, s * 1.3, s * 0.8, s * 0.44, -0.14 * s);
    const g = shine(defs);
    const ax = f(-0.56 * s);
    const ay = f(-0.46 * s);
    const bx = f(0.52 * s);
    const by = f(-0.54 * s);
    o += `<ellipse cx="${ax}" cy="${ay}" rx="${f(0.16 * s)}" ry="${f(0.3 * s)}" transform="rotate(40 ${ax} ${ay})" fill="url(#${g})" opacity=".85"/>`;
    o += `<ellipse cx="${bx}" cy="${by}" rx="${f(0.09 * s)}" ry="${f(0.16 * s)}" transform="rotate(-35 ${bx} ${by})" fill="url(#${g})" opacity=".5"/>`;
    return o;
  }

  function starPoints(R, ri) {
    const p = [];
    for (let k = 0; k < 10; k++) {
      const a = -Math.PI / 2 + (k * Math.PI) / 5;
      const rr = k % 2 ? ri : R;
      p.push([Math.cos(a) * rr, Math.sin(a) * rr]);
    }
    return p;
  }
  function drawStar(defs, it, c, s) {
    const R = s * 0.9;
    const p = starPoints(R, R * 0.5);
    const d = 'M' + p.map((q) => f(q[0]) + ' ' + f(q[1])).join('L') + 'Z';
    const paint = foilPaint(defs, c);
    let o = `<path d="${d}" fill="${dark(c.hex, 0.32)}" stroke="${dark(c.hex, 0.32)}" stroke-width="${f(s * 0.22)}" stroke-linejoin="round"/>`;
    o += `<path d="${d}" fill="url(#${paint})" stroke="url(#${paint})" stroke-width="${f(s * 0.18)}" stroke-linejoin="round"/>`;
    for (let k = 0; k < 10; k++) {
      const a = p[k];
      const b = p[(k + 1) % 10];
      o += `<path d="M0 0L${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}Z" fill="${k % 2 ? '#fff' : INK}" opacity="${k % 2 ? 0.17 : 0.08}"/>`;
    }
    const hx = f(-0.2 * s);
    const hy = f(-0.4 * s);
    o += `<ellipse cx="${hx}" cy="${hy}" rx="${f(0.06 * s)}" ry="${f(0.2 * s)}" transform="rotate(22 ${hx} ${hy})" fill="url(#${shine(defs)})" opacity=".85"/>`;
    return o;
  }

  function drawOrb(defs, it, c, r) {
    let o = `<circle r="${r}" fill="url(#${foilRadial(defs, c)})" stroke="${dark(c.hex, 0.32)}" stroke-width="${f(r * 0.025)}"/>`;
    o += `<circle r="${f(r * 0.9)}" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="${f(r * 0.05)}"/>`;
    if (it.text && it.text.value) o += textBlock(defs, it.text, r * 1.42, r * 1.02, r * 0.44, 0);
    const hx = f(-0.4 * r);
    const hy = f(-0.46 * r);
    o += `<ellipse cx="${hx}" cy="${hy}" rx="${f(0.19 * r)}" ry="${f(0.3 * r)}" transform="rotate(40 ${hx} ${hy})" fill="url(#${shine(defs)})" opacity=".8"/>`;
    o += `<path d="M${f(-0.07 * r)} ${f(0.99 * r)}L${f(0.07 * r)} ${f(0.99 * r)}L${f(0.04 * r)} ${f(1.06 * r)}L${f(-0.04 * r)} ${f(1.06 * r)}Z" fill="${dark(c.hex, 0.3)}"/>`;
    return o;
  }

  /* Скелети цифр у полі 100×150 — обводяться товстою «надутою» лінією */
  const DIGITS = {
    0: 'M50 18C70 18 82 42 82 75C82 108 70 132 50 132C30 132 18 108 18 75C18 42 30 18 50 18Z',
    1: 'M34 40L58 18L58 132',
    2: 'M22 46C22 28 34 18 50 18C67 18 80 30 80 46C80 64 66 76 50 90C36 102 24 114 20 132L82 132',
    3: 'M22 28C30 21 40 18 50 18C68 18 80 28 80 44C80 60 68 72 48 72C70 72 82 86 82 102C82 122 68 132 50 132C38 132 28 128 20 120',
    4: 'M66 132L66 18L18 98L84 98',
    5: 'M78 18L32 18L28 66C36 60 44 58 52 58C70 58 82 72 82 94C82 118 68 132 50 132C38 132 28 128 20 120',
    6: 'M76 26C68 20 60 18 52 18C32 18 20 40 20 78C20 112 32 132 52 132C70 132 82 118 82 98C82 78 70 64 52 64C36 64 24 74 20 88',
    7: 'M18 18L82 18C66 50 54 90 46 132',
    8: 'M50 72C34 72 24 62 24 46C24 29 36 18 50 18C64 18 76 29 76 46C76 62 66 72 50 72C31 72 20 85 20 102C20 121 33 132 50 132C67 132 80 121 80 102C80 85 69 72 50 72Z',
    9: 'M24 124C32 130 41 132 48 132C68 132 80 110 80 72C80 38 68 18 48 18C30 18 20 32 20 52C20 72 32 86 48 86C64 86 76 76 80 62',
  };
  function drawNumber(defs, it, c, h) {
    const ch = String(it.char ?? '0').slice(0, 1);
    const d = DIGITS[ch] || DIGITS[0];
    const k = h / 150;
    const sw = 34;
    const paint = glyphPaint(defs, c);
    const mask = defs.unique('nm', (id) => `<mask id="${id}" maskUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="190"><path d="${d}" fill="none" stroke="#fff" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></mask>`);
    const P = (attrs) => `<path d="${d}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${attrs}/>`;
    return (
      `<g transform="scale(${f(k * 100) / 100}) translate(-50 -75)">` +
      P(`stroke="${dark(c.hex, 0.34)}" stroke-width="${sw + 3}"`) +
      P(`stroke="url(#${paint})" stroke-width="${sw}"`) +
      `<g mask="url(#${mask})">` +
      P(`stroke="${INK}" stroke-opacity=".16" stroke-width="16" transform="translate(6 7)"`) +
      P(`stroke="#fff" stroke-opacity=".42" stroke-width="11" transform="translate(-6 -7)"`) +
      P(`stroke="#fff" stroke-opacity=".85" stroke-width="2.4" stroke-dasharray="10 46" transform="translate(-9 -10)"`) +
      '</g></g>'
    );
  }

  const LETTER_FONT = { fam: 'Unbounded, sans-serif', w: 800, st: 'normal' };
  /* Розмір шрифту літери: висота як у цифр, але широкі літери (Ж, Ш, W) трохи менші */
  function letterSize(ch, h) {
    const glyph = String(ch || 'A').slice(0, 1).toLocaleUpperCase('uk');
    let fs = h / 0.9;
    const w = (measure(glyph, LETTER_FONT) * fs) / 100 + fs * 0.17;
    if (w > h * 0.78) fs *= (h * 0.78) / w;
    return fs;
  }
  function letterWidth(ch, h) {
    const fs = letterSize(ch, h);
    return (measure(String(ch || 'A').slice(0, 1).toLocaleUpperCase('uk'), LETTER_FONT) * fs) / 100 + fs * 0.17;
  }
  function drawLetter(defs, it, c, h) {
    const ch = esc(String(it.char || 'A').slice(0, 1).toLocaleUpperCase('uk'));
    const fs = letterSize(it.char, h);
    const paint = foilPaint(defs, c);
    const base = `x="0" y="${f(fs * 0.36)}" text-anchor="middle" font-family="Unbounded, sans-serif" font-weight="800" font-size="${f(fs)}" stroke-linejoin="round"`;
    const mask = defs.unique('lt', (id) => `<mask id="${id}" maskUnits="userSpaceOnUse" x="${f(-fs)}" y="${f(-fs)}" width="${f(2 * fs)}" height="${f(2 * fs)}"><text ${base} fill="#fff" stroke="#fff" stroke-width="${f(fs * 0.14)}">${ch}</text></mask>`);
    return (
      `<text ${base} fill="${dark(c.hex, 0.34)}" stroke="${dark(c.hex, 0.34)}" stroke-width="${f(fs * 0.17)}">${ch}</text>` +
      `<text ${base} fill="url(#${paint})" stroke="url(#${paint})" stroke-width="${f(fs * 0.14)}">${ch}</text>` +
      `<g mask="url(#${mask})">` +
      `<text ${base} fill="none" stroke="#fff" stroke-opacity=".32" stroke-width="${f(fs * 0.04)}" transform="translate(${f(-fs * 0.025)} ${f(-fs * 0.035)})">${ch}</text>` +
      `<text ${base} fill="none" stroke="${INK}" stroke-opacity=".1" stroke-width="${f(fs * 0.06)}" transform="translate(${f(fs * 0.03)} ${f(fs * 0.04)})">${ch}</text>` +
      '</g>'
    );
  }

  /* ---------- габарити ---------- */
  function dims(it) {
    const S = SIZE[it.type] || SIZE.latex12;
    switch (it.type) {
      case 'heart':
        return { cr: S.s * 0.96, top: S.s * 0.84, bottom: S.s * 0.98, half: S.s * 1.06, attach: S.s * 0.98 };
      case 'star':
        return { cr: S.s * 0.88, top: S.s * 1.0, bottom: S.s * 0.84, half: S.s * 0.98, attach: S.s * 0.56 };
      case 'bubble':
        return { cr: S.r, top: S.r, bottom: S.r * 1.1, half: S.r, attach: S.r * 1.1 };
      case 'orb':
        return { cr: S.r, top: S.r, bottom: S.r * 1.06, half: S.r, attach: S.r * 1.06 };
      case 'number': {
        const w = S.h * (String(it.char) === '1' ? 0.5 : 0.66);
        return { w, h: S.h, top: S.h / 2, bottom: S.h / 2, half: w / 2, attach: S.h / 2 - 8 };
      }
      case 'letter': {
        const w = letterWidth(it.char, S.h);
        return { w, h: S.h, top: S.h / 2, bottom: S.h / 2, half: w / 2, attach: S.h / 2 - 8 };
      }
      default:
        return { cr: S.r, top: S.r * 1.08, bottom: S.r * 1.22, half: S.r, attach: S.r * 1.2 };
    }
  }

  function drawItem(defs, it) {
    const c = color(it.color, it.type);
    const S = SIZE[it.type] || SIZE.latex12;
    switch (it.type) {
      case 'bubble':
        return drawBubble(defs, it, S.r);
      case 'heart':
        return drawHeart(defs, it, c, S.s);
      case 'star':
        return drawStar(defs, it, c, S.s);
      case 'orb':
        return drawOrb(defs, it, c, S.r);
      case 'number':
        return drawNumber(defs, it, c, S.h);
      case 'letter':
        return drawLetter(defs, it, c, S.h);
      default:
        return drawLatex(defs, it, c, S.r);
    }
  }

  /* ---------- нормалізація ---------- */
  function normalize(spec, prefix) {
    const out = [];
    (spec.items || []).forEach((it, k) => {
      const n = Math.max(1, it.n || 1);
      for (let j = 0; j < n; j++) {
        const c = Object.assign({}, it);
        delete c.n;
        c.id = it.id ? (n > 1 ? it.id + '-' + j : it.id) : (prefix || 'i') + k + '-' + j;
        if (it.text) c.text = Object.assign({}, it.text);
        out.push(c);
      }
    });
    return out;
  }

  /* ---------- розкладка ---------- */
  function anchorFor(fmt, W, H) {
    if (fmt === 'box') return { x: W / 2, y: H - 236 };
    return { x: W / 2, y: H - 96 };
  }

  /* Кульки з написом, бабли й великі кулі тримаються в центрі композиції */
  function isFeatured(i) {
    return i.type === 'bubble' || i.type === 'latex36' || !!(i.text && i.text.value);
  }

  function relax(list, W, anchor, iters, minString) {
    const n = list.length;
    for (let t = 0; t < iters; t++) {
      const cool = 1 - (t / iters) * 0.6;
      for (let a = 0; a < n; a++) {
        const A = list[a];
        for (let b = a + 1; b < n; b++) {
          const B = list[b];
          let dx = B.x - A.x;
          let dy = B.y - A.y;
          let d = Math.hypot(dx, dy);
          const min = (A._r + B._r) * (A._f || B._f ? 0.94 : 0.84);
          if (d >= min) continue;
          if (A.pinned && B.pinned) continue;
          if (d < 0.01) {
            dx = a % 2 ? 0.6 : -0.6;
            dy = 0.3;
            d = Math.hypot(dx, dy);
          }
          const push = (min - d) * cool;
          const nx = dx / d;
          const ny = dy / d;
          const ma = A.pinned ? Infinity : A._m;
          const mb = B.pinned ? Infinity : B._m;
          const wa = A.pinned ? 0 : B.pinned ? 1 : mb / (ma + mb);
          const wb = B.pinned ? 0 : A.pinned ? 1 : ma / (ma + mb);
          A.x -= nx * push * wa;
          A.y -= ny * push * wa;
          B.x += nx * push * wb;
          B.y += ny * push * wb;
        }
      }
      for (const A of list) {
        if (A.pinned) continue;
        A.x += (A._tx - A.x) * A._gx;
        A.y += (A._ty - A.y) * A._gy;
        A.x = clamp(A.x, A._d.half + 4, W - A._d.half - 4);
        A.y = clamp(A.y, A._d.top + 4, anchor.y - minString * 0.55 - A._d.bottom);
      }
    }
  }

  function layoutBouquet(items, W, H, anchor, rand, iters) {
    const cluster = items.filter((i) => !TALL[i.type]);
    const tall = items.filter((i) => TALL[i.type]);
    cluster.forEach((i) => {
      i._d = dims(i);
      i._r = i._d.cr;
    });
    tall.forEach((i) => (i._d = dims(i)));
    const area = cluster.reduce((s, i) => s + Math.PI * i._r * i._r, 0);
    const Rc = Math.sqrt(area / Math.PI) * 0.92 + 8;
    const minString = 150;
    let cy = anchor.y - minString - Rc - (tall.length ? SIZE.number.h * 0.42 : 0);
    cy = Math.max(cy, Rc + 24);
    const center = { x: anchor.x, y: cy };

    const feat = cluster.filter(isFeatured);
    const fw = feat.reduce((s, i) => s + i._r * 1.7, 0);
    let fx = center.x - fw / 2;
    feat.forEach((i) => {
      i._tx = fx + i._r * 0.85;
      i._ty = center.y + (cluster.length > feat.length ? Rc * 0.2 : 0);
      i._gx = 0.06;
      i._gy = 0.06;
      i._m = 8;
      i._f = true;
      fx += i._r * 1.7;
    });
    cluster.forEach((i) => {
      if (feat.includes(i)) return;
      i._f = false;
      i._tx = center.x;
      i._ty = center.y;
      i._gx = 0.012;
      i._gy = 0.022;
      i._m = Math.pow(i._r / 36, 2);
    });

    const fresh = cluster.filter((i) => i.x == null || i.y == null);
    fresh.filter((i) => feat.includes(i)).forEach((i) => {
      i.x = i._tx;
      i.y = i._ty;
    });
    const rest = fresh.filter((i) => !feat.includes(i)).sort((a, b) => b._r - a._r);
    const placed = cluster.length - rest.length;
    rest.forEach((i, k) => {
      const idx = k + placed;
      const ang = idx * 2.399963 + rand() * 0.5;
      const dist = Math.sqrt(idx + 0.3) * 30;
      i.x = center.x + Math.cos(ang) * dist;
      i.y = center.y + Math.sin(ang) * dist * 0.85;
    });
    relax(cluster, W, anchor, iters, minString);

    if (tall.length) {
      const gap = -6;
      const total = tall.reduce((s, i) => s + i._d.w, 0) + gap * (tall.length - 1);
      let x = anchor.x - total / 2;
      tall.forEach((i) => {
        if (!(i.pinned && i.x != null)) {
          i.x = x + i._d.w / 2;
          i.y = anchor.y - 60 - i._d.h / 2;
        }
        x += i._d.w + gap;
      });
    }
  }

  function layoutCeiling(items, W, H, rand) {
    const order = items.slice();
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const n = order.length || 1;
    const rows = n > 14 ? 3 : n > 6 ? 2 : 1;
    const cols = Math.ceil(n / rows);
    const step = 46;
    const x0 = W / 2 - ((cols - 1) * step) / 2;
    order.forEach((i, k) => {
      i._d = dims(i);
      const row = k % rows;
      const col = Math.floor(k / rows);
      if (i.x == null || i.y == null || !i.pinned) {
        i.x = x0 + col * step + (row % 2 ? step / 2 : 0) + (rand() - 0.5) * 12;
        i.y = 8 + i._d.top + row * 22 + rand() * 10;
      }
      i.rot = (rand() - 0.5) * 18;
      i._len = H * (0.26 + rand() * 0.2);
      i._z = row * 1000 + rand() * 100;
    });
  }

  /*
   * Розраховує позиції кульок. Повертає копії з x, y.
   * opts.warm — коротке доуточнення для конструктора (зберігає наявні позиції).
   */
  function layout(spec, W, H, opts) {
    opts = opts || {};
    W = W || 640;
    H = H || 800;
    const fmt = spec.format || 'bouquet';
    const items = (opts.normalized ? spec.items : normalize(spec, spec.seed || 'i')).map((it) => Object.assign({}, it));
    const rand = rng(hash(opts.seed || spec.seed || items.map((i) => i.id).join('|')));
    const anchor = anchorFor(fmt, W, H);
    if (fmt === 'ceiling') layoutCeiling(items, W, H, rand);
    else layoutBouquet(items, W, H, anchor, rand, opts.warm ? 90 : 260);
    return { items, anchor, format: fmt, W, H };
  }

  function tilt(i, anchor) {
    if (i.rot != null && i._fixedRot) return i.rot;
    const dx = anchor.x - i.x;
    const dy = anchor.y - i.y;
    const a = (Math.atan2(-dx, dy) * 180) / Math.PI;
    const k = i.type === 'bubble' || i.type === 'orb' ? 0.3 : i.type === 'heart' || i.type === 'star' ? 0.55 : TALL[i.type] ? 0.12 : 0.85;
    return clamp(a * k, -40, 40);
  }
  function attachPoint(i) {
    const a = ((i.rot || 0) * Math.PI) / 180;
    const L = i._d.attach;
    return { x: i.x - Math.sin(a) * L, y: i.y + Math.cos(a) * L, a };
  }
  function stringPath(p, anchor) {
    const dy = anchor.y - p.y;
    const len = Math.hypot(anchor.x - p.x, dy);
    const c1x = p.x - Math.sin(p.a) * len * 0.32;
    const c1y = p.y + Math.cos(p.a) * len * 0.32;
    const c2x = anchor.x + (p.x - anchor.x) * 0.16;
    const c2y = anchor.y - dy * 0.2;
    return `M${f(p.x)} ${f(p.y)}C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(anchor.x)} ${f(anchor.y)}`;
  }
  function curlPath(x, y, len, dir, turns, amp) {
    let d = `M${f(x)} ${f(y)}`;
    const steps = turns * 14;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const th = t * turns * TAU;
      const a = amp * (1 - t * 0.35);
      d += `L${f(x + dir * t * 22 + Math.sin(th) * a)} ${f(y + t * len + (1 - Math.cos(th)) * a * 0.9)}`;
    }
    return d;
  }
  function hangPath(p, len, rand) {
    const sway = (rand() - 0.5) * 30;
    const x2 = p.x + sway;
    const y2 = p.y + len;
    return {
      d: `M${f(p.x)} ${f(p.y)}C${f(p.x - sway * 0.6)} ${f(p.y + len * 0.35)} ${f(x2 + sway * 0.5)} ${f(p.y + len * 0.7)} ${f(x2)} ${f(y2)}`,
      end: { x: x2, y: y2 },
    };
  }

  /* ---------- декор: грузик, коробка, тінь ---------- */
  function drawWeight(defs, spec, anchor, ribbon) {
    let s = '';
    s += `<path d="${curlPath(anchor.x, anchor.y + 2, 46, -1, 3, 6)}" fill="none" stroke="${ribbon}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<path d="${curlPath(anchor.x, anchor.y + 2, 56, 1, 4, 5.5)}" fill="none" stroke="${ribbon}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (spec.weight === 'cube') {
      const x = anchor.x - 18;
      const y = anchor.y + 10;
      const c = lum(ribbon) < 0.1 ? '#f4efec' : '#2c2629';
      const grad = defs.add('cube-' + c.replace('#', ''), (id) => linear(id, [[0, light(c, 0.25)], [1, dark(c, 0.12)]], { x1: 0, y1: 0, x2: 0, y2: 1 }));
      s += `<rect x="${f(x)}" y="${f(y + 6)}" width="36" height="28" rx="3" fill="url(#${grad})"/>`;
      s += `<rect x="${f(x - 2)}" y="${f(y)}" width="40" height="8" rx="2" fill="${light(c, 0.12)}" stroke="${dark(c, 0.15)}" stroke-width=".8"/>`;
      s += `<rect x="${f(anchor.x - 3)}" y="${f(y)}" width="6" height="34" fill="${ribbon}"/>`;
      s += `<path d="M${f(anchor.x)} ${f(y)}c-4 -9 -15 -10 -13 -3c1 4 8 4 13 3c4 -9 15 -10 13 -3c-1 4 -8 4 -13 3Z" fill="${ribbon}" stroke="${dark(ribbon, 0.2)}" stroke-width=".8"/>`;
    } else if (spec.weight !== 'none') {
      const c = color(spec.weightColor || 'foil-rose', 'heart');
      s += `<g transform="translate(${f(anchor.x)} ${f(anchor.y + 15)})">${drawHeart(defs, {}, c, 16)}</g>`;
    }
    return s;
  }

  function boxGeometry(anchor) {
    const bw = 236;
    const bh = 186;
    const x = anchor.x - bw / 2;
    const y = anchor.y + 10;
    return { x, y, bw, bh };
  }
  function drawBoxBack(spec, anchor) {
    const g = boxGeometry(anchor);
    const c = listHex(MB.boxColors, (spec.box || {}).color, '#FBF8F6');
    const inside = dark(c, 0.45);
    const flap = dark(c, 0.08);
    let s = '';
    s += `<path d="M${f(g.x + 26)} ${f(g.y - 24)}L${f(g.x + g.bw - 26)} ${f(g.y - 24)}L${f(g.x + g.bw - 12)} ${f(g.y - 82)}L${f(g.x + 12)} ${f(g.y - 82)}Z" fill="${flap}" stroke="${dark(c, 0.16)}" stroke-width="1"/>`;
    s += `<path d="M${f(g.x)} ${f(g.y)}L${f(g.x + 26)} ${f(g.y - 24)}L${f(g.x + g.bw - 26)} ${f(g.y - 24)}L${f(g.x + g.bw)} ${f(g.y)}Z" fill="${inside}"/>`;
    return s;
  }
  function drawBoxFront(defs, spec, anchor) {
    const g = boxGeometry(anchor);
    const box = spec.box || {};
    const c = listHex(MB.boxColors, box.color, '#FBF8F6');
    const grad = defs.add('box-' + (box.color || 'white'), (id) => linear(id, [[0, light(c, 0.3)], [1, dark(c, 0.1)]], { x1: 0, y1: 0, x2: 0, y2: 1 }));
    let s = '';
    s += `<path d="M${f(g.x)} ${f(g.y)}L${f(g.x + 26)} ${f(g.y - 24)}L${f(g.x - 10)} ${f(g.y - 70)}L${f(g.x - 44)} ${f(g.y - 40)}Z" fill="${dark(c, 0.05)}" stroke="${dark(c, 0.16)}" stroke-width="1"/>`;
    s += `<path d="M${f(g.x + g.bw)} ${f(g.y)}L${f(g.x + g.bw - 26)} ${f(g.y - 24)}L${f(g.x + g.bw + 10)} ${f(g.y - 70)}L${f(g.x + g.bw + 44)} ${f(g.y - 40)}Z" fill="${dark(c, 0.05)}" stroke="${dark(c, 0.16)}" stroke-width="1"/>`;
    s += `<rect x="${f(g.x)}" y="${f(g.y)}" width="${g.bw}" height="${g.bh}" fill="url(#${grad})" stroke="${dark(c, 0.16)}" stroke-width="1"/>`;
    s += `<rect x="${f(g.x)}" y="${f(g.y)}" width="${g.bw}" height="10" fill="${INK}" opacity=".06"/>`;
    if (box.text) {
      const tc = lum(c) < 0.3 ? 'gold' : 'ink';
      s += `<g transform="translate(${f(anchor.x)} ${f(g.y + g.bh * 0.52)})">${textBlock(defs, { value: box.text, font: box.font || 'script', color: box.textColor || tc }, g.bw * 0.8, g.bh * 0.6, 54, 0)}</g>`;
    }
    return s;
  }

  /* ---------- фотозона (гірлянда) ---------- */
  function neon(defs, text, x, y, maxW, warm) {
    const F = FONTS.script;
    const fs = Math.min((maxW * 100) / (measure(text, F) || 1), 96);
    const glow = defs.add('glow', (id) => `<filter id="${id}" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>`);
    const base = `x="${f(x)}" y="${f(y)}" text-anchor="middle" dominant-baseline="central" font-family="${F.fam}" font-size="${f(fs)}"`;
    const glowCol = warm ? '#ffcf8a' : '#ff6f9f';
    const core = warm ? '#fff8ec' : '#ffd3e2';
    return `<text ${base} fill="${glowCol}" stroke="${glowCol}" stroke-width="6" filter="url(#${glow})" opacity=".95">${esc(text)}</text>` + `<text ${base} fill="${core}" stroke="#fff" stroke-width=".6">${esc(text)}</text>`;
  }
  function plinth(defs, x, y, w, h, c) {
    const grad = defs.add('pl-' + c.replace('#', ''), (id) => linear(id, [[0, dark(c, 0.1)], [0.4, light(c, 0.35)], [1, dark(c, 0.16)]], { x1: 0, y1: 0, x2: 1, y2: 0 }));
    const ry = w * 0.12;
    return `<path d="M${f(x - w / 2)} ${f(y - h)}L${f(x - w / 2)} ${f(y)}A${f(w / 2)} ${f(ry)} 0 0 0 ${f(x + w / 2)} ${f(y)}L${f(x + w / 2)} ${f(y - h)}Z" fill="url(#${grad})"/><ellipse cx="${f(x)}" cy="${f(y - h)}" rx="${f(w / 2)}" ry="${f(ry)}" fill="${light(c, 0.3)}" stroke="${dark(c, 0.12)}" stroke-width="1"/>`;
  }
  function drawGarland(defs, spec, W, H) {
    const rand = rng(hash(spec.seed || spec.neon || 'garland'));
    const night = !!spec.dark;
    const cx = W / 2;
    const cy = H * 0.44;
    const R = W * 0.33;
    const base = spec.backdrop || '#FBF6F2';
    const bgrad = defs.add('bd-' + base.replace('#', ''), (id) => radial(id, [[0, light(base, 0.3)], [0.8, base], [1, dark(base, 0.06)]], { cx: 0.45, cy: 0.4, r: 0.65, fx: 0.4, fy: 0.35 }));
    let s = '';
    s += `<ellipse cx="${f(cx)}" cy="${f(cy + R + 40)}" rx="${f(R * 1.35)}" ry="18" fill="url(#${floorShadow(defs)})"/>`;
    s += `<rect x="${f(cx - R * 0.5)}" y="${f(cy + R - 4)}" width="${f(R)}" height="${f(44)}" rx="6" fill="${night ? '#17121a' : '#e6dcd6'}"/>`;
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R)}" fill="url(#${bgrad})" stroke="${night ? '#000' : dark(base, 0.12)}" stroke-opacity=".3"/>`;
    if (spec.neon) s += neon(defs, spec.neon, cx, cy - R * 0.06, R * 1.25, night);

    const pool = [];
    (spec.colors || [['blush', 1]]).forEach(([id, w]) => {
      for (let i = 0; i < w; i++) pool.push(id);
    });
    const balls = [];
    const N = 86;
    for (let k = 0; k < N; k++) {
      const t = k / (N - 1);
      const ang = ((148 + t * 210) * Math.PI) / 180;
      const thick = 20 + 44 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.08)), 0.8);
      const rr = R + (rand() - 0.42) * thick * 1.5;
      const pick = rand();
      const r = pick > 0.9 ? 34 + rand() * 9 : pick > 0.58 ? 21 + rand() * 8 : 10 + rand() * 9;
      balls.push({ x: cx + Math.cos(ang) * rr + (rand() - 0.5) * 12, y: cy + Math.sin(ang) * rr + (rand() - 0.5) * 12, r, rot: Math.round(rand() * 360), c: pool[Math.floor(rand() * pool.length)], id: 'g' + k });
    }
    balls.sort((a, b) => b.r - a.r);
    balls.forEach((b) => {
      s += `<g transform="translate(${f(b.x)} ${f(b.y)}) rotate(${b.rot})">${drawLatex(defs, { id: b.id }, color(b.c, 'latex12'), b.r)}</g>`;
    });
    const pc = night ? '#2b2328' : '#f4ede8';
    s += plinth(defs, cx + R * 0.62, cy + R + 44, 92, 128, pc);
    s += plinth(defs, cx + R * 0.02, cy + R + 50, 116, 74, pc);
    // кілька кульок на підлозі
    const floor = [[cx - R * 0.78, cy + R + 22, 30], [cx - R * 0.5, cy + R + 30, 22], [cx - R * 0.98, cy + R + 32, 20]];
    floor.forEach((p, k) => {
      s += `<g transform="translate(${f(p[0])} ${f(p[1])}) rotate(${k * 40 - 30})">${drawLatex(defs, { id: 'fl' + k }, color(pool[(k * 3) % pool.length], 'latex12'), p[2])}</g>`;
    });
    return { html: s, bounds: [cx - R - 80, cy - R - 70, cx + R + 80, cy + R + 64] };
  }

  /* ---------- збірка SVG ---------- */
  function Bounds() {
    this.x0 = Infinity;
    this.y0 = Infinity;
    this.x1 = -Infinity;
    this.y1 = -Infinity;
  }
  Bounds.prototype.add = function (x0, y0, x1, y1) {
    this.x0 = Math.min(this.x0, x0);
    this.y0 = Math.min(this.y0, y0);
    this.x1 = Math.max(this.x1, x1);
    this.y1 = Math.max(this.y1, y1);
  };
  function fitBox(b, aspect, pad, align, minW) {
    let x0 = b.x0 - pad;
    let y0 = b.y0 - pad;
    let w = b.x1 - b.x0 + pad * 2;
    let h = b.y1 - b.y0 + pad * 2;
    if (w / h > aspect) {
      const nh = w / aspect;
      y0 -= (nh - h) * (align === 'bottom' ? 1 : 0.5);
      h = nh;
    } else {
      const nw = h * aspect;
      x0 -= (nw - w) / 2;
      w = nw;
    }
    if (minW && w < minW) {
      const nw = minW;
      const nh = minW / aspect;
      x0 -= (nw - w) / 2;
      y0 -= (nh - h) * (align === 'bottom' ? 1 : 0.5);
      w = nw;
      h = nh;
    }
    return [x0, y0, w, h];
  }

  function itemLabel(it) {
    const t = (MB.types || {})[it.type] || {};
    const c = color(it.color, it.type);
    let s = [t.name, t.size, c.name].filter(Boolean).join(', ');
    if (it.char != null && t.glyph) s = `${t.name} «${it.char}», ${c.name}`;
    if (it.text && it.text.value) s += `, напис «${String(it.text.value).replace(/\n/g, ' ')}»`;
    return s;
  }

  /*
   * spec: { format, items, ribbon, weight, weightColor, box, ... }
   * o: { w, h, fit, aspect, pad, align, positioned, interactive, selected, sway, label, className }
   */
  function render(spec, o) {
    o = o || {};
    const W = o.w || 640;
    const H = o.h || 800;
    const defs = new Defs('mb' + ++uid);
    const fmt = spec.format || 'bouquet';
    const B = new Bounds();
    let body = '';

    if (fmt === 'garland') {
      const g = drawGarland(defs, spec, W, H);
      body = g.html;
      B.add.apply(B, g.bounds);
    } else {
      let items;
      let anchor;
      if (o.positioned) {
        items = spec.items.map((it) => Object.assign({}, it, { _d: dims(it) }));
        anchor = anchorFor(fmt, W, H);
      } else {
        const L = layout(spec, W, H, o);
        items = L.items;
        anchor = L.anchor;
      }
      const ribbon = listHex(MB.ribbons, spec.ribbon, '#F4EEEC');
      const rand = rng(hash('s' + items.map((i) => i.id).join('')));
      items.forEach((i) => {
        if (fmt !== 'ceiling' && fmt !== 'single') i.rot = tilt(i, anchor);
        if (fmt === 'single') i.rot = 0;
      });

      let strings = '';
      let balloons = '';
      let front = '';
      let under = '';
      let over = '';

      if (fmt !== 'single' && fmt !== 'ceiling' && items.length) {
        under += `<ellipse cx="${f(anchor.x)}" cy="${f(fmt === 'box' ? anchor.y + 196 : anchor.y + 66)}" rx="${fmt === 'box' ? 170 : 58}" ry="${fmt === 'box' ? 16 : 9}" fill="url(#${floorShadow(defs)})"/>`;
      }
      if (fmt === 'box') {
        under += drawBoxBack(spec, anchor);
        const g = boxGeometry(anchor);
        B.add(g.x - 46, g.y - 84, g.x + g.bw + 46, g.y + g.bh + 18);
      }

      const order = items.slice().sort((a, b) => zOf(a) - zOf(b));
      order.forEach((i, k) => {
        const tall = TALL[i.type];
        const d = i._d;
        if (fmt === 'single') {
          strings += `<path d="M0 ${f(d.attach)}c-6 18 8 30 -2 52" fill="none" stroke="${ribbon}" stroke-width="1.4"/>`;
          B.add(-d.half, d.attach, d.half, d.attach + 54);
        } else if (fmt === 'ceiling') {
          const p = attachPoint(i);
          const hp = hangPath(p, i._len, rand);
          const end = hp.end;
          strings += `<path d="${hp.d}" fill="none" stroke="${ribbon}" stroke-width="1.3" stroke-opacity=".95"/>`;
          strings += `<path d="${curlPath(end.x, end.y, 26, rand() > 0.5 ? 1 : -1, 2, 4)}" fill="none" stroke="${ribbon}" stroke-width="1.3" stroke-linecap="round"/>`;
          B.add(p.x - 20, p.y, p.x + 20, end.y + 34);
        } else {
          const p = attachPoint(i);
          strings += `<path d="${stringPath(p, anchor)}" fill="none" stroke="${ribbon}" stroke-width="1.3" stroke-opacity=".95"/>`;
        }
        const x = fmt === 'single' ? 0 : i.x;
        const y = fmt === 'single' ? 0 : i.y;
        B.add(x - d.half, y - d.top, x + d.half, y + d.bottom);
        const attrs = o.interactive
          ? ` class="mb-bl" data-id="${esc(i.id)}" tabindex="0" role="button" aria-label="${esc(itemLabel(i))}${o.selected === i.id ? ', вибрано' : ''}"`
          : '';
        const pop = o.stagger ? ` style="--i:${k}"` : o.popIds && o.popIds.includes(i.id) ? ' data-new' : '';
        const g = `<g${attrs} transform="translate(${f(x)} ${f(y)}) rotate(${f(i.rot || 0)})"><g class="mb-pop"${pop}>${drawItem(defs, i)}</g></g>`;
        if (tall) front += g;
        else balloons += g;
      });

      if (fmt === 'bouquet' && items.length) {
        over += drawWeight(defs, spec, anchor, ribbon);
        B.add(anchor.x - 60, anchor.y, anchor.x + 60, anchor.y + 76);
      }
      if (fmt === 'box') over += drawBoxFront(defs, spec, anchor);

      if (o.interactive && o.selected) {
        const s = items.find((i) => i.id === o.selected);
        if (s) {
          const rr = TALL[s.type] ? Math.max(s._d.w, s._d.h) / 2 + 10 : Math.max(s._d.half, (s._d.top + s._d.bottom) / 2) + 10;
          const cyy = s.y + (TALL[s.type] ? 0 : (s._d.bottom - s._d.top) / 2 * 0.4);
          over += `<circle class="mb-sel" cx="${f(s.x)}" cy="${f(cyy)}" r="${f(rr)}" fill="none"/>`;
        }
      }

      const swayOpen = o.sway && fmt !== 'single' ? `<g class="mb-sway" style="transform-origin:${f(anchor.x)}px ${f(anchor.y)}px">` : '<g>';
      body = under + swayOpen + strings + balloons + front + '</g>' + over;
      if (!items.length) B.add(W * 0.3, H * 0.3, W * 0.7, H * 0.7);
    }

    let vb = [0, 0, W, H];
    if (o.viewBox) vb = o.viewBox;
    else if (o.fit) vb = fitBox(B, o.aspect || W / H, o.pad ?? 24, o.align || 'bottom', o.minW);
    const cls = o.className ? ` class="${o.className}"` : '';
    const a11y = o.interactive
      ? ` role="group" aria-label="${esc(o.label || 'Композиція')}"`
      : o.label
        ? ` role="img" aria-label="${esc(o.label)}"`
        : ' aria-hidden="true" focusable="false"';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(f).join(' ')}" preserveAspectRatio="${o.par || 'xMidYMax meet'}"${cls}${a11y}>${defs.html()}${body}</svg>`;
  }

  function zOf(i) {
    if (i.z != null) return i.z;
    if (i._z != null) return i._z;
    let z = i.y || 0;
    if (i.text && i.text.value) z += 400;
    if (i.type === 'bubble') z += 260;
    if (i.type === 'heart' || i.type === 'star' || i.type === 'orb') z += 60;
    return z + (hash(i.id) % 40);
  }

  MB.art = {
    render,
    layout,
    normalize,
    dims,
    color,
    itemLabel,
    defaultTextColor,
    fonts: FONTS,
    textHex: TEXT_HEX,
    sizes: SIZE,
    util: { mix, light, dark, lum, hash, rng, esc, clamp },
  };
})(window.MB);
