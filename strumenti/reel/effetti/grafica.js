// GG Motion — effetti grafici: sfondi animati (bg), entrate (enter) ed elementi grafici (els).
// Idee riprese da Remocn (MIT, vedi LICENSE-remocn.txt): motion-graphics, effects, filters, graphic-looks,
// shaders, layout, compositions. Gli shader WebGL sono rifatti in canvas 2D a bassa risoluzione, nei colori del brand.
// Opzioni degli sfondi: "style": {"bg": "topo", "bgOpts": {"o": 1, "mode": "...", "tint": "blue", "speed": 1, "seed": 1}}.
// Opzioni delle entrate e degli elementi: campi sull'elemento (es. {"enter": "blocks", "order": "rows"}).
(() => {
  const U = FX.u, C = FX.C, E = U.E, clamp = U.clamp, lerp = U.lerp, TAU = Math.PI * 2;
  const RGB = { blue: [31, 79, 209], orange: [255, 106, 19], ink: [11, 31, 58], mark: [255, 201, 163], gray: [180, 174, 162], paper: [244, 241, 234] };
  const rgba = (c, a) => { const v = RGB[c] || RGB.blue; return 'rgba(' + v[0] + ',' + v[1] + ',' + v[2] + ',' + (+a).toFixed(3) + ')'; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const md = s => esc(s).replace(/\*(.+?)\*/g, '<b>$1</b>');
  const $ = h => { const d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; };
  const SVGNS = 'http://www.w3.org/2000/svg';
  // hash con rimescolamento finale (FNV-1a da solo da' valori correlati per chiavi simili)
  const R = (s, i) => { s = s + ':' + i; let h = 2166136261; for (let k = 0; k < s.length; k++) { h ^= s.charCodeAt(k); h = Math.imul(h, 16777619); }
    h = Math.imul(h ^ (h >>> 13), 2246822519); h = Math.imul(h ^ (h >>> 16), 3266489917); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

  // ---------- noise 3D deterministico (value noise) ----------
  const P = new Uint8Array(512), G = new Float32Array(256);
  { const a = []; for (let i = 0; i < 256; i++) a.push(i); for (let i = 255; i > 0; i--) { const j = Math.floor(R('ggperm', i) * (i + 1)); const x = a[i]; a[i] = a[j]; a[j] = x; }
    for (let i = 0; i < 512; i++) P[i] = a[i & 255]; for (let i = 0; i < 256; i++) G[i] = R('ggval', i) * 2 - 1; }
  const n3 = (x, y, z) => {
    const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z), fx = x - X, fy = y - Y, fz = z - Z, xi = X & 255, yi = Y & 255, zi = Z & 255;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
    const a = P[xi] + yi, b = P[xi + 1] + yi, aa = P[a] + zi, ab = P[a + 1] + zi, ba = P[b] + zi, bb = P[b + 1] + zi;
    const l1 = G[P[aa]] + (G[P[ba]] - G[P[aa]]) * u, l2 = G[P[ab]] + (G[P[bb]] - G[P[ab]]) * u;
    const l3 = G[P[aa + 1]] + (G[P[ba + 1]] - G[P[aa + 1]]) * u, l4 = G[P[ab + 1]] + (G[P[bb + 1]] - G[P[ab + 1]]) * u;
    const m1 = l1 + (l2 - l1) * v, m2 = l3 + (l4 - l3) * v; return m1 + (m2 - m1) * w;
  };
  const fbm = (x, y, z, o) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < (o || 3); i++) { s += a * n3(x * f, y * f, z * f + i * 17.3); a *= 0.5; f *= 2.03; } return s; };
  const sstep = (a, b, x) => { const p = clamp((x - a) / (b - a)); return p * p * (3 - 2 * p); };

  // ---------- aiuti per gli sfondi ----------
  const opts = (cfg, d) => Object.assign({ o: 1, speed: 1, seed: 1, tint: 'blue', accent: 'orange' }, d || {}, ((cfg && cfg.style) || {}).bgOpts || {});
  const canvas = (layer, w, h, pix) => { const c = document.createElement('canvas'); c.width = w; c.height = h; c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;' + (pix ? 'image-rendering:pixelated' : ''); layer.appendChild(c); return c.getContext('2d'); };
  const setup = (layer, cfg, d, w, h, pix) => { const o = opts(cfg, d); layer._o = o; layer.style.opacity = o.o; layer._g = canvas(layer, w || 1080, h || 1920, pix); return o; };
  // raster a bassa risoluzione: fn(x, y, out) scrive out = [r, g, b, a(0..1)]
  const raster = (g, fn) => { const w = g.canvas.width, h = g.canvas.height; const img = g._img || (g._img = g.createImageData(w, h)); const d = img.data, out = [0, 0, 0, 0];
    for (let y = 0, k = 0; y < h; y++) for (let x = 0; x < w; x++, k += 4) { out[3] = 0; fn(x, y, out); d[k] = out[0]; d[k + 1] = out[1]; d[k + 2] = out[2]; d[k + 3] = out[3] * 255; }
    g.putImageData(img, 0, 0); };
  const grainURL = (() => { let u = null; return () => { if (u) return u; const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const im = g.createImageData(256, 256);
    for (let i = 0; i < 256 * 256; i++) { const v = R('grain', i); im.data[i * 4] = 11; im.data[i * 4 + 1] = 31; im.data[i * 4 + 2] = 58; im.data[i * 4 + 3] = v > 0.5 ? (v - 0.5) * 2 * 255 : 0; } g.putImageData(im, 0, 0); return (u = c.toDataURL()); }; })();
  const grainLayer = (layer, a) => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;inset:-260px;background-image:url(' + grainURL() + ');background-size:256px 256px;opacity:' + a; layer.appendChild(d); return d; };
  const grainMove = (d, t) => { const s = Math.floor(t * 12); d.style.transform = 'translate(' + Math.round(R('gx', s) * 256) + 'px,' + Math.round(R('gy', s) * 256) + 'px)'; };

  // =====================================================================
  // SFONDI (bg)
  // =====================================================================

  // flow: particelle su un campo vettoriale con scie (o solo punti che derivano)
  FX.add('bg', 'flow', { desc: 'Fine particle trails riding a slowly changing flow field (mode: trails|dots)', from: 'flow-field,shader-simplex-noise,dot-field-morph',
    prep(layer, cfg) { const o = setup(layer, cfg, { n: 190, mode: 'trails' });
      const r = k => R('flow' + o.seed, k), base = r('b') * TAU;
      layer._w = [0, 1, 2, 3].map(k => ({ fx: (r('fx' + k) * 2 - 1) * (0.9 + k * 0.8), fy: (r('fy' + k) * 2 - 1) * (0.9 + k * 0.8), ph: r('p' + k) * TAU, dr: 0.6 + r('d' + k) * 0.9, amp: 1.6 / (1 + k * 1.4) }));
      layer._f = (x, y, tau) => { let a = base; for (const w of layer._w) a += w.amp * Math.sin(w.fx * x + w.fy * y + w.ph + w.dr * Math.sin(tau + w.ph)); return a; }; },
    draw(layer, t) { const o = layer._o, g = layer._g, F = layer._f; g.clearRect(0, 0, 1080, 1920);
      const loop = 360, life = 120, trail = o.mode === 'dots' ? 2 : 60, travel = life - trail, time = t * 30 * o.speed, STEP = 0.0042, spanY = 1920 / 1080;
      const paths = [[new Path2D(), new Path2D(), new Path2D()], [new Path2D(), new Path2D(), new Path2D()]], dots = [new Path2D(), new Path2D()];
      for (let i = 0; i < o.n; i++) {
        const local = time + R('ffo' + o.seed, i) * life, cyc = Math.floor(local / life), age = local - cyc * life, head = Math.min(age, travel), tail = Math.max(0, age - trail);
        if (head - tail < 0.05) continue; const key = 'ffp' + o.seed + ':' + i + ':' + (cyc % 3);
        let x = -0.08 + R(key, 'x') * 1.16, y = -0.08 + R(key, 'y') * (spanY + 0.16); const birth = time - age, steps = Math.ceil(head), pts = [x, y];
        for (let s = 0; s < steps; s++) { const a = F(x, y, TAU * (birth + s) / loop); x += Math.cos(a) * STEP; y += Math.sin(a) * STEP; pts.push(x, y); }
        const acc = R('ffa' + o.seed, i) < 0.1 ? 1 : 0;
        if (o.mode === 'dots') { const k = pts.length - 2, al = Math.min(1, age / 20, (life - age) / 20); if (al > 0.3) dots[acc].arc(pts[k] * 1080, pts[k + 1] * 1080, 3.2, 0, TAU), dots[acc].closePath(); continue; }
        for (let b = 0; b < 3; b++) { const f0 = Math.max(tail, age - trail * (b + 1) / 3), f1 = Math.min(head, age - trail * b / 3); if (f1 - f0 <= 0.5) continue;
          const j0 = Math.floor(f0), j1 = Math.min(Math.ceil(f1), steps); const p = paths[acc][b]; p.moveTo(pts[j0 * 2] * 1080, pts[j0 * 2 + 1] * 1080); for (let j = j0 + 1; j <= j1; j++) p.lineTo(pts[j * 2] * 1080, pts[j * 2 + 1] * 1080); } }
      g.lineCap = 'round'; g.lineWidth = 2.2;
      if (o.mode === 'dots') { g.fillStyle = rgba(o.tint, 0.2); g.fill(dots[0]); g.fillStyle = rgba(o.accent, 0.35); g.fill(dots[1]); return; }
      [0.18, 0.1, 0.045].forEach((al, b) => { g.strokeStyle = rgba(o.tint, al); g.stroke(paths[0][b]); g.strokeStyle = rgba(o.accent, al * 1.8); g.stroke(paths[1][b]); }); } });

  // topo: curve di livello che respirano (marching squares)
  FX.add('bg', 'topo', { desc: 'Breathing topographic contour lines with index contours and one accent line', from: 'topo-lines,shader-perlin-noise',
    prep(layer, cfg) { const o = setup(layer, cfg, { levels: 14, peaks: 3 }); const r = k => R('topo' + o.seed, k), w = 1, h = 1920 / 1080, m = o.peaks, turn = r('t') * TAU;
      layer._pk = Array.from({ length: m }, (_, k) => { const a = turn + k * TAU / m + (r('j' + k) - 0.5) * 0.8, sp = m === 1 ? 0.06 : 0.24 + r('d' + k) * 0.06;
        return { x: w / 2 + Math.cos(a) * sp * w, y: h / 2 + Math.sin(a) * sp * h * 1.1, amp: k ? 0.7 + r('a' + k) * 0.22 : 1, ph: r('p' + k) * TAU, orb: 0.025 + r('o' + k) * 0.025, l2: r('l2' + k) * TAU, l3: r('l3' + k) * TAU }; });
      layer._rp = [0, 1, 2].map(k => ({ fx: (r('rx' + k) * 2 - 1) * (3 + k * 2), fy: (r('ry' + k) * 2 - 1) * (3 + k * 2), ph: r('rp' + k) * TAU })); },
    draw(layer, t) { const o = layer._o, g = layer._g; g.clearRect(0, 0, 1080, 1920); const tau = TAU * t * o.speed / 14, S = 0.045, step = 1 / 42;
      const nx = Math.ceil(1 / step) + 1, ny = Math.ceil(1920 / 1080 / step) + 1, F = new Float32Array(nx * ny);
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const x = i * step, y = j * step; let s = 0;
        for (const p of layer._pk) { const dx = x - p.x - Math.cos(tau + p.ph) * p.orb, dy = y - p.y - Math.sin(tau + p.ph) * p.orb, th = Math.atan2(dy, dx);
          const wp = 1 + 0.14 * Math.sin(2 * th + p.l2 + tau) + 0.08 * Math.sin(3 * th + p.l3 - tau); s += Math.exp((p.amp * (1 + 0.05 * Math.sin(tau + p.ph)) - Math.hypot(dx, dy) * wp / 0.95) / S); }
        let v = S * Math.log(s); for (const q of layer._rp) v += 0.03 * Math.sin(q.fx * x + q.fy * y + q.ph + Math.sin(tau + q.ph) * 1.4); F[j * nx + i] = v; }
      const L = o.levels, cs = step * 1080, hl = Math.round(L * 0.6);
      for (let l = 0; l < L; l++) { const th = 0.04 + l * 0.9 / L, p = new Path2D();
        for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
          const a = F[j * nx + i], b = F[j * nx + i + 1], c = F[(j + 1) * nx + i + 1], d = F[(j + 1) * nx + i];
          const idx = (a > th ? 8 : 0) | (b > th ? 4 : 0) | (c > th ? 2 : 0) | (d > th ? 1 : 0); if (idx === 0 || idx === 15) continue;
          const X = i * cs, Y = j * cs, T_ = [X + cs * (th - a) / (b - a), Y], R_ = [X + cs, Y + cs * (th - b) / (c - b)], B_ = [X + cs * (th - d) / (c - d), Y + cs], L_ = [X, Y + cs * (th - a) / (d - a)];
          const seg = (p1, p2) => { p.moveTo(p1[0], p1[1]); p.lineTo(p2[0], p2[1]); };
          switch (idx) { case 1: case 14: seg(L_, B_); break; case 2: case 13: seg(B_, R_); break; case 3: case 12: seg(L_, R_); break; case 4: case 11: seg(T_, R_); break;
            case 5: seg(L_, T_); seg(B_, R_); break; case 6: case 9: seg(T_, B_); break; case 7: case 8: seg(L_, T_); break; case 10: seg(T_, R_); seg(L_, B_); break; } }
        g.lineCap = 'round'; const idx = l % 4 === 0; g.lineWidth = l === hl ? 3 : idx ? 2.6 : 1.6; g.strokeStyle = l === hl ? rgba(o.accent, 0.28) : rgba(o.tint, idx ? 0.2 : 0.11); g.stroke(p); } } });

  // strata: strati orizzontali spostati dal rumore, oppure onde armoniche che si sommano
  FX.add('bg', 'strata', { desc: 'Fine horizontal layers displaced by noise, each drifting at its own depth (mode: strata|waves)', from: 'shader-strata,fourier-sum,squiggle',
    prep(layer, cfg) { setup(layer, cfg, { mode: 'strata', y: 0.62 }); },
    draw(layer, t) { const o = layer._o, g = layer._g; g.clearRect(0, 0, 1080, 1920); g.lineCap = 'round'; const tt = t * o.speed;
      if (o.mode === 'waves') { const cy = o.y * 1920, A = 110, ks = [1, 3, 5, 7], sum = new Path2D();
        ks.forEach((k, n) => { const p = new Path2D(); for (let x = 0; x <= 1080; x += 8) { const ph = TAU * k * x / 1080 * 1.2 - tt * 0.8 * k * 0.5; const y = cy + A / k * Math.sin(ph); x ? p.lineTo(x, y) : p.moveTo(x, y); } g.strokeStyle = rgba(o.tint, 0.1); g.lineWidth = 2; g.stroke(p); });
        for (let x = 0; x <= 1080; x += 6) { let y = cy; ks.forEach(k => { y += A / k * Math.sin(TAU * k * x / 1080 * 1.2 - tt * 0.8 * k * 0.5); }); x ? sum.lineTo(x, y) : sum.moveTo(x, y); }
        g.strokeStyle = rgba(o.accent, 0.22); g.lineWidth = 3.5; g.stroke(sum); return; }
      const N = 36, gap = 1920 / N;
      for (let i = 0; i <= N; i++) { const p = new Path2D(), sp = 0.02 + R('st' + o.seed, i) * 0.05, y0 = i * gap;
        for (let x = -20; x <= 1100; x += 18) { const y = y0 + 70 * fbm(x * 0.0018 + tt * sp, i * 0.11, tt * 0.04, 3) + 18 * n3(x * 0.006, i * 0.5, tt * 0.1); x > -20 ? p.lineTo(x, y) : p.moveTo(x, y); }
        const acc = i === Math.round(N * 0.7), idx = i % 6 === 0; g.lineWidth = acc ? 3 : idx ? 2.4 : 1.4; g.strokeStyle = acc ? rgba(o.accent, 0.35) : rgba(o.tint, idx ? 0.17 : 0.09); g.stroke(p); } } });

  // weave: trama e ordito che si incrociano sopra/sotto su una griglia deformata
  FX.add('bg', 'weave', { desc: 'Woven warp and weft threads crossing over and under on a gently warped grid', from: 'shader-weave',
    prep(layer, cfg) { setup(layer, cfg, { gap: 54 }); },
    draw(layer, t) { const o = layer._o, g = layer._g, S = o.gap, tt = t * o.speed * 0.12; g.clearRect(0, 0, 1080, 1920); g.lineCap = 'butt'; g.lineWidth = 6;
      const wx = (x, y) => 14 * n3(x * 0.003, y * 0.003, tt), wy = (x, y) => 14 * n3(x * 0.003 + 40, y * 0.003, tt);
      const thread = (vert, k) => { const p = new Path2D(); for (let s = -S; s <= (vert ? 1920 : 1080) + S; s += 12) { const x = vert ? k * S : s, y = vert ? s : k * S; const X = x + wx(x, y), Y = y + wy(x, y); s > -S ? p.lineTo(X, Y) : p.moveTo(X, Y); } return p; };
      g.setLineDash([S * 2 - 16, 16]);
      for (let k = 0; k <= 1920 / S + 1; k++) { g.lineDashOffset = (k % 2 ? 0 : S) + 8 - S / 2 + S; g.strokeStyle = rgba(o.tint, 0.07); g.stroke(thread(false, k)); }
      for (let k = 0; k <= 1080 / S + 1; k++) { g.lineDashOffset = (k % 2 ? S : 0) + 8 - S / 2; g.strokeStyle = rgba(k % 7 === 3 ? o.accent : 'ink', k % 7 === 3 ? 0.14 : 0.07); g.stroke(thread(true, k)); }
      g.setLineDash([]); } });

  // truchet: tessere a quarti di cerchio che scattano di 90° al passaggio di un'onda
  FX.add('bg', 'truchet', { desc: 'Quarter-circle tiles snap a quarter turn as a wave crosses the grid, rewiring the lines', from: 'truchet-flip,pattern-tile',
    prep(layer, cfg) { setup(layer, cfg, { size: 96, every: 6 }); },
    draw(layer, t) { const o = layer._o, g = layer._g, S = o.size, cols = Math.ceil(1080 / S), rows = Math.ceil(1920 / S), Pd = o.every / o.speed; g.clearRect(0, 0, 1080, 1920);
      g.lineWidth = 4; g.lineCap = 'round'; const pl = new Path2D(), pa = new Path2D(); const far = Math.hypot(cols, rows) / 2;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const key = 'tr' + o.seed + ':' + r + ':' + c, d = Math.hypot(c + 0.5 - cols / 2, r + 0.5 - rows / 2) / far * 2.2; let rot = R(key, 'o') < 0.5 ? 0 : 1;
        for (let k = 0; k <= Math.floor(t / Pd); k++) { const tk = 1 + k * Pd + d; if (t < tk) break; if (R(key, k) < 0.55) rot += U.spring(t - tk, { damping: 11, stiffness: 160 }); }
        const a = rot * Math.PI / 2, cx = c * S + S / 2, cy = r * S + S / 2, ca = Math.cos(a), sa = Math.sin(a), h = S / 2;
        const tr = (x, y) => [cx + x * ca - y * sa, cy + x * sa + y * ca], p = R(key, 'acc') < 0.05 ? pa : pl;
        [[-h, -h, 0], [h, h, Math.PI]].forEach(([ox, oy, st]) => { const [X, Y] = tr(ox, oy); p.moveTo(X + h * Math.cos(st + a), Y + h * Math.sin(st + a)); p.arc(X, Y, h, st + a, st + a + Math.PI / 2); }); }
      g.strokeStyle = rgba(o.tint, 0.1); g.stroke(pl); g.strokeStyle = rgba(o.accent, 0.28); g.stroke(pa); } });

  // life: Gioco della vita di Conway, nati in arancio, morti che si restringono
  const lifeCache = {};
  const lifeGens = (seed, nx, ny, n) => { const key = seed + ':' + nx + 'x' + ny; const L = lifeCache[key] || (lifeCache[key] = []);
    if (!L.length) { const f = new Uint8Array(nx * ny); for (let i = 0; i < f.length; i++) f[i] = R('life' + seed, i) < 0.26 ? 1 : 0; L.push(f); }
    while (L.length <= n) { const p = L[L.length - 1], q = new Uint8Array(nx * ny);
      for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) { let s = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) s += p[((y + dy + ny) % ny) * nx + (x + dx + nx) % nx];
        q[y * nx + x] = s === 3 || (p[y * nx + x] && s === 2) ? 1 : 0; } L.push(q); } return L; };
  FX.add('bg', 'life', { desc: "Conway's Game of Life on a faint lattice: newborn cells flash in the accent, dying ones shrink", from: 'life-grid,path-search',
    prep(layer, cfg) { setup(layer, cfg, { cell: 40, gen: 0.3, epoch: 50 }); },
    draw(layer, t) { const o = layer._o, g = layer._g, S = o.cell, nx = Math.ceil(1080 / S), ny = Math.ceil(1920 / S); g.clearRect(0, 0, 1080, 1920);
      const G_ = Math.floor(t * o.speed / o.gen), ep = Math.floor(G_ / o.epoch), gl = G_ % o.epoch, loc = (t * o.speed / o.gen) - G_, L = lifeGens(o.seed + '-' + ep, nx, ny, gl), now = L[gl], bef = gl ? L[gl - 1] : now;
      const fade = Math.min(1, gl / 3, (o.epoch - gl - loc) / 3), tile = S * 0.84, lat = new Path2D(), al = new Path2D(), nw = new Path2D();
      const sq = (p, i, s) => { if (s < 0.5) return; const x = (i % nx) * S + (S - s) / 2, y = Math.floor(i / nx) * S + (S - s) / 2; p.rect(x, y, s, s); };
      for (let i = 0; i < now.length; i++) { lat.rect((i % nx) * S + S / 2 - 1.5, Math.floor(i / nx) * S + S / 2 - 1.5, 3, 3);
        if (now[i]) { if (!bef[i] && gl) { sq(nw, i, tile * (0.35 + 0.65 * E.outBack(loc))); } else sq(al, i, tile); } else if (bef[i]) sq(al, i, tile * (1 - E.inCubic(Math.min(1, loc * 1.6)))); }
      g.fillStyle = rgba('gray', 0.35); g.fill(lat); g.fillStyle = rgba(o.tint, 0.1 * fade); g.fill(al); g.fillStyle = rgba(o.accent, 0.22 * fade); g.fill(nw); } });

  // grid: carta millimetrata da progetto, pavimento prospettico o reticolo isometrico
  FX.add('bg', 'grid', { desc: 'Drafting grid that drifts slowly with crosshair marks (mode: blueprint|floor|iso)', from: 'blueprint,synthwave,isometric-build',
    prep(layer, cfg) { setup(layer, cfg, { mode: 'blueprint', sun: true }); },
    draw(layer, t) { const o = layer._o, g = layer._g, tt = t * o.speed; g.clearRect(0, 0, 1080, 1920); g.lineCap = 'butt';
      if (o.mode === 'floor') { const hor = 1180, vx = 540; g.lineWidth = 2;
        if (o.sun) { g.save(); g.beginPath(); g.rect(0, 0, 1080, hor); g.clip(); for (let k = 0; k < 9; k++) { const y0 = hor - 300 + k * 36, hgt = 36 - Math.max(2, k * 3.4); g.save(); g.beginPath(); g.rect(0, y0, 1080, Math.max(4, hgt)); g.clip(); g.beginPath(); g.arc(vx, hor, 300, Math.PI, TAU); g.fillStyle = rgba(o.accent, 0.1); g.fill(); g.restore(); } g.restore(); }
        g.strokeStyle = rgba(o.tint, 0.16); g.beginPath(); g.moveTo(0, hor); g.lineTo(1080, hor); g.stroke();
        const ph = (tt * 0.8) % 1; for (let k = 0; k < 18; k++) { const z = k + 1 - ph; if (z <= 0.15) continue; const y = hor + 300 / z; if (y > 1920) continue; g.strokeStyle = rgba(o.tint, Math.min(0.15, 0.03 + 0.4 / z)); g.beginPath(); g.moveTo(0, y); g.lineTo(1080, y); g.stroke(); }
        for (let k = -14; k <= 14; k++) { g.strokeStyle = rgba(o.tint, 0.1); g.beginPath(); g.moveTo(vx + k * 18, hor); g.lineTo(vx + k * 210, 1920 + 400); g.stroke(); } return; }
      if (o.mode === 'iso') { const S = 64, dx = (tt * 6) % (S * 2), p = new Path2D(), k3 = Math.tan(Math.PI / 6);
        for (let c = -40; c < 60; c++) { const b = c * S / Math.cos(Math.PI / 6) + dx; p.moveTo(0, b); p.lineTo(1080, b + 1080 * k3); p.moveTo(1080, b); p.lineTo(0, b + 1080 * k3); }
        for (let x = (dx * Math.cos(Math.PI / 6)) % (S * 2 * Math.cos(Math.PI / 6)) - 300; x < 1180; x += S * Math.cos(Math.PI / 6)) { p.moveTo(x, 0); p.lineTo(x, 1920); }
        g.lineWidth = 1.5; g.strokeStyle = rgba(o.tint, 0.08); g.stroke(p); return; }
      const m = 36, M = m * 5, ox = (tt * 7) % M, oy = (tt * 4) % M, p1 = new Path2D(), p2 = new Path2D();
      for (let x = ox - M; x < 1080 + M; x += m) { const big = Math.abs(((x - ox) / m) % 5) < 0.01; (big ? p2 : p1).moveTo(x, 0); (big ? p2 : p1).lineTo(x, 1920); }
      for (let y = oy - M; y < 1920 + M; y += m) { const big = Math.abs(((y - oy) / m) % 5) < 0.01; (big ? p2 : p1).moveTo(0, y); (big ? p2 : p1).lineTo(1080, y); }
      g.lineWidth = 1; g.strokeStyle = rgba(o.tint, 0.06); g.stroke(p1); g.lineWidth = 2; g.strokeStyle = rgba(o.tint, 0.12); g.stroke(p2);
      const tk = new Path2D(); for (let y = oy; y < 1920; y += m) { const big = Math.abs(((y - oy) / m) % 5) < 0.01; tk.moveTo(40, y); tk.lineTo(40 + (big ? 30 : 14), y); } g.strokeStyle = rgba(o.tint, 0.22); g.stroke(tk);
      for (let k = 0; k < 4; k++) { const x = ox + M * (1 + Math.floor(R('cr' + o.seed, k) * 5)), y = oy + M * (1 + Math.floor(R('cr' + o.seed, k + 9) * 9)), pu = 0.5 + 0.5 * Math.sin(tt * 2 + k * 1.7);
        g.strokeStyle = rgba(o.accent, 0.25 + 0.2 * pu); g.lineWidth = 2.5; g.beginPath(); g.moveTo(x - 16, y); g.lineTo(x + 16, y); g.moveTo(x, y - 16); g.lineTo(x, y + 16); g.stroke(); g.beginPath(); g.arc(x, y, 8 + 4 * pu, 0, TAU); g.stroke(); } } });

  // orbit: anelli di punti che ruotano e si allineano, girasole a spirale aurea, tunnel di cornici
  FX.add('bg', 'orbit', { desc: 'Concentric dotted rings rotating into alignment (mode: orbit|phyllo|tunnel|ripple)', from: 'shader-dot-orbit,ring-align,phyllotaxis,shader-light-tunnel,shader-smoke-ring',
    prep(layer, cfg) { setup(layer, cfg, { mode: 'orbit', cx: 0.5, cy: 0.5 }); },
    draw(layer, t) { const o = layer._o, g = layer._g, tt = t * o.speed, cx = o.cx * 1080, cy = o.cy * 1920; g.clearRect(0, 0, 1080, 1920);
      if (o.mode === 'phyllo') { const n = 520, mr = 640, c = mr / Math.sqrt(n), spin = tt * 4 * Math.PI / 180, pl = new Path2D(), ac = new Path2D(), pulse = ((tt - 2.5) / 2.5) % 1;
        for (let i = 1; i <= n; i++) { const s = E.outBack(clamp((tt - 2.2 * Math.sqrt(i / n)) / 0.33)); if (s <= 0) continue; const rr = c * Math.sqrt(i), th = i * 137.508 * Math.PI / 180 + spin, x = cx + Math.cos(th) * rr, y = cy + Math.sin(th) * rr;
          let b = c * 0.42 * (0.55 + 0.45 * Math.sqrt(i / n)) * s; const arm = i % 21 === 0 && tt > 2.2; if (arm && tt > 2.5) b *= 1 + 0.9 * Math.exp(-(((Math.sqrt(i / n) - pulse * 1.4 + 0.2) / 0.09) ** 2));
          const p = arm ? ac : pl; p.moveTo(x + b, y); p.arc(x, y, b, 0, TAU); }
        g.fillStyle = rgba(o.tint, 0.1); g.fill(pl); g.fillStyle = rgba(o.accent, 0.3); g.fill(ac); return; }
      if (o.mode === 'tunnel' || o.mode === 'ripple') { const N = 9, ph = (tt * 0.12) % 1;
        for (let k = 0; k < N; k++) { const s = Math.pow((k + ph) / N, 2) * 1.25, al = 0.14 * Math.min(1, s * 4) * Math.min(1, (1.25 - s) * 3); g.lineWidth = 2 + 4 * s; g.strokeStyle = rgba(k % 4 === 1 ? o.accent : o.tint, al); g.beginPath();
          if (o.mode === 'ripple') g.arc(cx, cy, s * 1150, 0, TAU); else { const w = 1080 * s, h = 1920 * s; g.roundRect(cx - w / 2, cy - h / 2, w, h, 60 * s); } g.stroke(); } return; }
      const pl = new Path2D(), ac = new Path2D(), sw = Math.sin(TAU * tt / 24);
      for (let k = 0; k < 11; k++) { const r = 130 + k * 92, n = Math.round(TAU * r / 30), rot = -Math.PI / 2 + (R('ob' + o.seed, k) * 2 - 1) * 2.4 * sw + (k % 2 ? 1 : -1) * 0.0;
        for (let i = 3; i < n; i++) { const a = rot + TAU * i / n, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; if (x < -10 || x > 1090 || y < -10 || y > 1930) continue; const p = i === Math.floor(n / 2) ? ac : pl; p.moveTo(x + 3.4, y); p.arc(x, y, 3.4, 0, TAU); } }
      g.fillStyle = rgba(o.tint, 0.14); g.fill(pl); g.fillStyle = rgba(o.accent, 0.4); g.fill(ac); } });

  // pendulum: fila di pendoli con periodi accordati: linea, onde, trecce, riallineamento
  FX.add('bg', 'pendulum', { desc: 'A row of tuned pendulums drifting from a line into travelling waves and back', from: 'pendulum-wave',
    prep(layer, cfg) { setup(layer, cfg, { n: 15, loop: 40, cycles: 6 }); },
    draw(layer, t) { const o = layer._o, g = layer._g, n = o.n, tt = t * o.speed, mx = 70, gap = (1080 - 2 * mx) / (n - 1), cy = 980, amp = 640; g.clearRect(0, 0, 1080, 1920);
      const ph = (i, s) => TAU * s * (o.cycles + i) / o.loop, pts = [];
      g.setLineDash([3, 12]); g.lineWidth = 2; g.strokeStyle = rgba(o.tint, 0.07); for (let i = 0; i < n; i++) { const x = mx + i * gap; g.beginPath(); g.moveTo(x, cy - amp); g.lineTo(x, cy + amp); g.stroke(); } g.setLineDash([]);
      for (let i = 0; i < n; i++) { const c = Math.cos(ph(i, tt)); pts.push([mx + i * gap, cy - amp * c, 11 * (1 - 0.22 * c)]); }
      g.beginPath(); pts.forEach((p, i) => { if (!i) return g.moveTo(p[0], p[1]); const a = pts[i - 2] || pts[i - 1], b = pts[i - 1], d = pts[i + 1] || p; g.bezierCurveTo(b[0] + (p[0] - a[0]) / 6, b[1] + (p[1] - a[1]) / 6, p[0] - (d[0] - b[0]) / 6, p[1] - (d[1] - b[1]) / 6, p[0], p[1]); });
      g.lineWidth = 3; g.strokeStyle = rgba(o.accent, 0.28); g.stroke();
      g.fillStyle = rgba(o.tint, 0.18); pts.forEach(p => { g.beginPath(); g.arc(p[0], p[1], p[2], 0, TAU); g.fill(); }); } });

  // strings: fili tesi tra i chiodi di un anello come tabellina (cardioide, nefroide, ...)
  FX.add('bg', 'strings', { desc: 'Threads strung around a ring of pins as a times table, morphing from cardioid to nephroid and beyond', from: 'string-art,chord-ring',
    prep(layer, cfg) { setup(layer, cfg, { pins: 180, from: 2, to: 5, cx: 0.5, cy: 0.52, r: 0.46 }); },
    draw(layer, t) { const o = layer._o, g = layer._g, n = o.pins, tt = t * o.speed, cx = o.cx * 1080, cy = o.cy * 1920, rad = o.r * 1080; g.clearRect(0, 0, 1080, 1920);
      const steps = Math.max(1, Math.ceil(o.to - o.from)), u = clamp((tt - 3) / 50) * steps, st = Math.min(steps - 1, Math.floor(u)), k = o.from + st + E.inOutCubic(clamp((u - st) / 0.7)) * (u >= steps ? 1 : 1);
      const kk = u >= steps ? o.to : k, pt = i => { const a = Math.PI + TAU * i / n; return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]; };
      const strung = clamp(tt / 3) * n, head = strung + Math.max(0, tt - 3) * 25, pl = new Path2D(), ac = new Path2D();
      for (let i = 0; i < Math.ceil(strung); i++) { const [x0, y0] = pt(i), [x1, y1] = pt(i * kk), f = Math.min(1, strung - i), d = (head - i + n * 10) % n, p = d < 14 ? ac : pl; p.moveTo(x0, y0); p.lineTo(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f); }
      g.lineWidth = 1.4; g.strokeStyle = rgba(o.tint, 0.08); g.stroke(pl); g.strokeStyle = rgba(o.accent, 0.3); g.stroke(ac);
      g.fillStyle = rgba(o.tint, 0.22); for (let i = 0; i < n; i += 2) { const [x, y] = pt(i); g.fillRect(x - 1.5, y - 1.5, 3, 3); } } });

  // swirl: bande a spirale attorno a un centro, oppure raggi di luce da una sorgente fuori campo
  FX.add('bg', 'swirl', { desc: 'Soft spiral bands turning around a point, or slow light rays from an off-screen source (mode: spiral|rays|sunburst)', from: 'shader-swirl,shader-spiral,shader-god-rays,radial-burst,candy,citrus,ember,hypno,lilac,neon,retro,sunburst,tide',
    prep(layer, cfg) { const o = opts(cfg, { mode: 'spiral' }); if (o.mode === 'spiral') setup(layer, cfg, { mode: 'spiral', cx: 0.5, cy: 0.45, arms: 5, twist: 3 }, 90, 160); else setup(layer, cfg, { mode: o.mode, cx: o.mode === 'rays' ? 1.15 : 0.5, cy: o.mode === 'rays' ? -0.1 : 1.08, n: 16 }); },
    draw(layer, t) { const o = layer._o, g = layer._g, tt = t * o.speed;
      if (o.mode === 'spiral') { const cx = o.cx * 90, cy = o.cy * 160, A = RGB[o.tint], B = RGB[o.accent];
        raster(g, (x, y, out) => { const dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy) + 0.01, a = Math.atan2(dy, dx), v = Math.sin(o.arms * a + o.twist * Math.log(r) * 2 - tt * 0.6), band = Math.floor(((o.arms * a + o.twist * Math.log(r) * 2 - tt * 0.6) / TAU + 100) % 3);
          const al = sstep(0.25, 0.65, v) * 0.07 * Math.min(1, r / 18); const c = band === 1 ? B : A; out[0] = c[0]; out[1] = c[1]; out[2] = c[2]; out[3] = al; }); return; }
      g.clearRect(0, 0, 1080, 1920); const sx = o.cx * 1080, sy = o.cy * 1920, L = 2600;
      for (let k = 0; k < o.n; k++) { const w = 0.025 + R('ry' + o.seed, k) * 0.05, base = o.mode === 'rays' ? Math.PI * 0.55 + 0.75 * (k + 0.5) / o.n : Math.PI + Math.PI * (k + 0.5) / o.n;
        const a = base + 0.06 * Math.sin(tt * 0.25 + k * 1.3) + (o.mode === 'sunburst' ? tt * 0.02 : 0), al = (o.mode === 'rays' ? 0.05 : 0.06) * (0.6 + 0.4 * Math.sin(tt * 0.5 + k * 2.1));
        const gr = g.createRadialGradient(sx, sy, 0, sx, sy, L); gr.addColorStop(0, rgba(k % 3 ? o.accent : o.tint, al * 1.6)); gr.addColorStop(1, rgba(k % 3 ? o.accent : o.tint, 0));
        g.fillStyle = gr; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + Math.cos(a - w) * L, sy + Math.sin(a - w) * L); g.lineTo(sx + Math.cos(a + w) * L, sy + Math.sin(a + w) * L); g.closePath(); g.fill(); } } });

  // wash: campiture morbide che derivano (mesh gradient, warp, metaballs, fumo, pannelli) + grana
  const PAL = { brand: ['blue', 'mark', 'orange'], blue: ['blue', 'ink', 'blue'], warm: ['orange', 'mark', 'mark'], ink: ['ink', 'gray', 'ink'] };
  FX.add('bg', 'wash', { desc: 'Very soft drifting colour fields in brand inks, with optional film grain (mode: mesh|warp|blobs|smoke|panels; palette: brand|blue|warm|ink)',
    from: 'shader-mesh-gradient,shader-grain-gradient,shader-warp,shader-metaballs,shader-gem-smoke,shader-liquid-metal,shader-smoke-ring,shader-color-panels,shader-perlin-noise,aurora,dusk,ember,ink,lagoon,lavender,mint,peach,synthwave,arcade,blush,dune,horizon,nebula,orb,sunrise,tide,ultraviolet,acid,cream,deep-sea,marble,ocean,rose-gold,silk,storm,sunset,backdrop',
    prep(layer, cfg) { const o = setup(layer, cfg, { mode: 'mesh', palette: 'brand', grain: true, a: 0.16 }, 54, 96); if (o.grain) layer._gr = grainLayer(layer, 0.05); },
    draw(layer, t) { const o = layer._o, g = layer._g, tt = t * o.speed, pal = (PAL[o.palette] || PAL.brand).map(c => RGB[c]), PA = RGB.paper; if (layer._gr) grainMove(layer._gr, t);
      if (o.mode === 'panels') { g.clearRect(0, 0, 54, 96); g.save(); g.translate(27, 48); g.rotate(-0.22);
        for (let k = 0; k < 5; k++) { const w = 14 + R('pn' + o.seed, k) * 18, x = ((R('pn' + o.seed, k + 7) * 120 + tt * (2 + k) * (k % 2 ? 1 : -1)) % 120 + 120) % 120 - 60; g.fillStyle = rgba(['blue', 'orange', 'mark', 'blue', 'mark'][k], o.a * 0.45); g.fillRect(x, -80, w, 160); }
        g.restore(); return; }
      const pts = [0, 1, 2, 3].map(k => [27 + 30 * Math.sin(tt * 0.11 * (1 + k * 0.3) + k * 2.1), 48 + 50 * Math.cos(tt * 0.09 * (1 + k * 0.25) + k * 1.3)]);
      raster(g, (x, y, out) => { let c, a;
        if (o.mode === 'warp') { const px = x * 0.032, py = y * 0.032, q1 = fbm(px, py, tt * 0.05, 2), q2 = fbm(px + 5.2, py + 1.3, tt * 0.05, 2), v = fbm(px + 3 * q1, py + 3 * q2, tt * 0.04, 3) * 1.6 + 0.5;
          const s = clamp(v); c = s < 0.5 ? pal[0] : pal[2]; a = Math.abs(s - 0.5) * 1.3 * o.a; c = s > 0.62 && s < 0.7 ? pal[1] : c; }
        else if (o.mode === 'blobs') { let f = 0; pts.forEach((p, k) => { const d2 = (x - p[0]) ** 2 + (y - p[1]) ** 2; f += (k === 3 ? 90 : 160) / (d2 + 1); }); const f2 = 90 / ((x - pts[3][0]) ** 2 + (y - pts[3][1]) ** 2 + 1);
          a = sstep(0.8, 1.1, f) * o.a * 0.8; c = f2 > f * 0.5 ? pal[2] : pal[0]; }
        else if (o.mode === 'smoke') { const dx = x - 27, dy = (y - 46) * 0.56, r = Math.hypot(dx, dy), an = Math.atan2(dy, dx), R0 = 16 + 4 * n3(Math.cos(an) * 1.5, Math.sin(an) * 1.5, tt * 0.15);
          const v = Math.exp(-((r - R0) ** 2) / (30 + 25 * (fbm(x * 0.08, y * 0.08, tt * 0.1) + 0.5))); a = v * o.a * 0.9; c = pal[0]; }
        else { let ws = 0, r = 0, gg = 0, b = 0; pts.forEach((p, k) => { const w = 1 / Math.pow((x - p[0]) ** 2 + (y - p[1]) ** 2 + 40, 1.3), cc = k === 3 ? PA : pal[k]; ws += w; r += w * cc[0]; gg += w * cc[1]; b += w * cc[2]; });
          c = [r / ws, gg / ws, b / ws]; a = o.a * (0.55 + 0.45 * Math.min(1, (Math.abs(c[0] - PA[0]) + Math.abs(c[2] - PA[2])) / 120)); }
        out[0] = c[0]; out[1] = c[1]; out[2] = c[2]; out[3] = a; }); } });

  // caustics: filamenti di luce rifratta (o rete neurale di rumore), a bassa risoluzione
  FX.add('bg', 'caustics', { desc: 'Rippling caustic filaments of refracted light, or a slowly morphing neural-web noise (mode: caustics|water|neuro)', from: 'shader-caustics,shader-water,shader-neuro-noise,underwater-ripple',
    prep(layer, cfg) { setup(layer, cfg, { mode: 'caustics' }, 72, 128); },
    draw(layer, t) { const o = layer._o, g = layer._g, tt = t * o.speed * 0.35 + 23, col = RGB[o.tint], sc = o.mode === 'water' ? 0.75 / 72 : 1.15 / 72;
      raster(g, (x, y, out) => { let v;
        if (o.mode === 'neuro') { let ux = (x - 36) / 72 * 1.2, uy = (y - 64) / 72 * 1.2, sx = 0, sy = 0, res = 0, s = 8; const c1 = Math.cos(1), s1 = Math.sin(1);
          for (let j = 0; j < 12; j++) { let nx = c1 * ux - s1 * uy, ny = s1 * ux + c1 * uy; ux = nx; uy = ny; nx = c1 * sx - s1 * sy; ny = s1 * sx + c1 * sy; sx = nx; sy = ny;
            const lx = ux * s + j + sx - tt * 0.6, ly = uy * s + j + sy - tt * 0.6; sx += Math.sin(lx); sy += Math.sin(ly); res += (0.5 + 0.5 * Math.cos(lx)) / s + (0.5 + 0.5 * Math.cos(ly)) / s; s *= 1.2; }
          v = Math.pow(clamp(res * 1.3 - 0.35), 3) * 0.6; }
        else { const px = (x * sc * TAU) % TAU - 250, py = (y * sc * TAU) % TAU - 250; let ix = px, iy = py, c = 1;
          for (let n = 0; n < 4; n++) { const t2 = tt * (1 - 3.5 / (n + 1)); const nx = px + Math.cos(t2 - ix) + Math.sin(t2 + iy), ny = py + Math.sin(t2 - iy) + Math.cos(t2 + ix); ix = nx; iy = ny;
            c += 1 / Math.hypot(px / (Math.sin(ix + t2) / 0.005), py / (Math.cos(iy + t2) / 0.005)); }
          c = 1.17 - Math.pow(c / 4, 1.4); v = Math.pow(Math.abs(c), 8); }
        out[0] = col[0]; out[1] = col[1]; out[2] = col[2]; out[3] = Math.min(1, v) * 0.22; }); } });

  // voronoi: celle che si spostano e si ri-tassellano
  FX.add('bg', 'voronoi', { desc: 'Voronoi cells shifting and re-tessellating, drawn as fine edges with a few tinted cells', from: 'shader-voronoi,brick-mosaic',
    prep(layer, cfg) { setup(layer, cfg, { n: 22, fill: true }, 108, 192); },
    draw(layer, t) { const o = layer._o, g = layer._g, tt = t * o.speed, col = RGB[o.tint], acc = RGB[o.accent];
      const S = Array.from({ length: o.n }, (_, k) => [108 * (0.5 + 0.48 * Math.sin(tt * (0.05 + R('vo' + o.seed, k) * 0.07) + R('vo' + o.seed, k + 50) * TAU)), 192 * (0.5 + 0.48 * Math.cos(tt * (0.04 + R('vo' + o.seed, k + 20) * 0.06) + R('vo' + o.seed, k + 80) * TAU))]);
      raster(g, (x, y, out) => { let d1 = 1e9, d2 = 1e9, k1 = 0; for (let k = 0; k < S.length; k++) { const d = (x - S[k][0]) ** 2 + (y - S[k][1]) ** 2; if (d < d1) { d2 = d1; d1 = d; k1 = k; } else if (d < d2) d2 = d; }
        const e = Math.sqrt(d2) - Math.sqrt(d1), edge = 1 - sstep(0.4, 1.6, e); const tint = o.fill && k1 % 5 === 2 ? 0.04 : 0;
        const c = k1 % 5 === 2 && o.fill ? acc : col; out[0] = c[0]; out[1] = c[1]; out[2] = c[2]; out[3] = Math.max(edge * 0.13, tint); }); } });

  // dither: sfumatura animata resa a puntini ordinati (matrice di Bayer), pixel netti
  const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  FX.add('bg', 'dither', { desc: 'Ordered (Bayer) dithering over a slowly moving gradient field, crisp square pixels', from: 'shader-dithering,arcade,pixelate-region',
    prep(layer, cfg) { setup(layer, cfg, { cell: 16 }, Math.ceil(1080 / (opts(cfg).cell || 16)), Math.ceil(1920 / (opts(cfg).cell || 16)), true); },
    draw(layer, t) { const o = layer._o, g = layer._g, tt = t * o.speed, col = RGB[o.tint], acc = RGB[o.accent], h = g.canvas.height, w = g.canvas.width;
      raster(g, (x, y, out) => { const v = 0.5 + fbm(x * 0.035, y * 0.035, tt * 0.08, 3) * 1.1 + (y / h - 0.65) * 0.7, th = (BAY[(y % 4) * 4 + (x % 4)] + 0.5) / 16;
        if (v > th) { const c = v > 1.02 ? acc : col; out[0] = c[0]; out[1] = c[1]; out[2] = c[2]; out[3] = v > 1.02 ? 0.12 : 0.07; } }); } });

  // halftone: retino di punti ruotato, una o due lastre leggermente fuori registro (riso)
  FX.add('bg', 'halftone', { desc: 'Rotated halftone dot screen whose dots swell with a drifting tone; plates: 2 adds an off-register accent plate', from: 'halftone-print,riso-print,duotone-beat,comic-panels',
    prep(layer, cfg) { setup(layer, cfg, { cell: 30, plates: 1 }); },
    draw(layer, t) { const o = layer._o, g = layer._g, tt = t * o.speed, S = o.cell; g.clearRect(0, 0, 1080, 1920);
      const plate = (ang, col, al, ox, oy, z) => { const ca = Math.cos(ang), sa = Math.sin(ang), p = new Path2D(), N = Math.ceil(2300 / S);
        for (let i = -N; i < N; i++) for (let j = -N; j < N; j++) { const u = i * S, v = j * S, x = 540 + u * ca - v * sa + ox, y = 960 + u * sa + v * ca + oy; if (x < -S || x > 1080 + S || y < -S || y > 1920 + S) continue;
          const tone = clamp(0.5 + fbm(x * 0.0016, y * 0.0016, tt * 0.05 + z, 3) * 1.4 + (y / 1920 - 0.6) * 0.5), r = S * 0.5 * Math.sqrt(tone) * 0.92; if (r < 1) continue; p.moveTo(x + r, y); p.arc(x, y, r, 0, TAU); }
        g.fillStyle = rgba(col, al); g.fill(p); };
      plate(Math.PI / 12, o.tint, 0.065, 0, 0, 0); if (o.plates > 1) plate(Math.PI * 5 / 12, o.accent, 0.06, 4 + 3 * Math.sin(tt * 0.3), 3, 7); } });

  // ascii: campo di caratteri monospaziati la cui densità segue un rumore che scorre
  FX.add('bg', 'ascii', { desc: 'A faint field of monospaced characters whose density follows a drifting noise', from: 'ascii-render,led-ticker',
    prep(layer, cfg) { setup(layer, cfg, { cell: 26, ramp: ' .:-=+*#%@' }); },
    draw(layer, t) { const o = layer._o, g = layer._g, tt = t * o.speed, S = o.cell, rp = o.ramp; g.clearRect(0, 0, 1080, 1920); g.font = '700 ' + Math.round(S * 0.8) + 'px Mono'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = rgba('ink', 0.13); const acc = [];
      for (let y = S / 2; y < 1920; y += S) for (let x = S / 2; x < 1080; x += S) { const v = clamp(0.45 + fbm(x * 0.0025, y * 0.0025 - tt * 0.04, tt * 0.06, 3) * 1.5); const k = Math.floor(v * (rp.length - 0.01)); if (k <= 0) continue;
        if (k >= rp.length - 1) { acc.push([x, y, rp[k]]); continue; } g.fillText(rp[k], x, y); }
      g.fillStyle = rgba(o.accent, 0.3); acc.forEach(a => g.fillText(a[2], a[0], a[1])); } });

  // border: cornice sottile che pulsa sul bordo, con un tratto che la percorre; vignettatura facoltativa
  FX.add('bg', 'border', { desc: 'A thin frame around the edges that pulses, with an accent segment running along it; optional vignette', from: 'shader-pulsing-border,crt-screen,camera-lens',
    prep(layer, cfg) { setup(layer, cfg, { inset: 40, vignette: false }); },
    draw(layer, t) { const o = layer._o, g = layer._g, tt = t * o.speed, m = o.inset, w = 1080 - 2 * m, h = 1920 - 2 * m, per = 2 * (w + h) - 8 * 48 + TAU * 48; g.clearRect(0, 0, 1080, 1920);
      if (o.vignette) { const gr = g.createRadialGradient(540, 960, 600, 540, 960, 1200); gr.addColorStop(0, rgba('ink', 0)); gr.addColorStop(1, rgba('ink', 0.08)); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1920); }
      const pu = 0.5 + 0.5 * Math.sin(tt * 2.2); g.lineWidth = 4 + 2 * pu; g.strokeStyle = rgba(o.tint, 0.12 + 0.08 * pu); g.beginPath(); g.roundRect(m, m, w, h, 48); g.stroke();
      g.lineWidth = 7; g.lineCap = 'round'; g.strokeStyle = rgba(o.accent, 0.5); g.setLineDash([420, per - 420]); g.lineDashOffset = -tt * 260; g.beginPath(); g.roundRect(m, m, w, h, 48); g.stroke(); g.setLineDash([]); } });

  // grain: grana di pellicola che cambia 12 volte al secondo, righe di scansione e banda VHS facoltative
  FX.add('bg', 'grain', { desc: 'Film grain over the paper, re-rolled 12 times a second; lines: true adds faint scanlines and a slow tape band', from: 'security-cam,vhs-filter,crt-screen,hologram,shader-grain-gradient',
    prep(layer, cfg) { const o = opts(cfg, { a: 0.07, lines: false }); layer._o = o; layer.style.opacity = o.o; layer._gr = grainLayer(layer, o.a);
      if (o.lines) { const s = document.createElement('div'); s.style.cssText = 'position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(11,31,58,.035) 0 2px,transparent 2px 6px)'; layer.appendChild(s);
        layer._band = document.createElement('div'); layer._band.style.cssText = 'position:absolute;left:0;right:0;height:140px;background:linear-gradient(transparent,rgba(31,79,209,.05),transparent)'; layer.appendChild(layer._band); } },
    draw(layer, t) { grainMove(layer._gr, t); if (layer._band) layer._band.style.top = (((t * 90) % 2200) - 200) + 'px'; } });

  // =====================================================================
  // ENTRATE (enter): lt < 0 invisibile, lt >= durata stato normale e pulito
  // =====================================================================
  const hide = n => { n.style.opacity = '0'; };
  const clean = n => { const s = n.style; s.opacity = '1'; s.transform = ''; s.filter = ''; s.clipPath = ''; s.maskImage = s.webkitMaskImage = ''; s.transformOrigin = ''; if (n._fxo) n._fxo.style.display = 'none'; };
  const rel = n => { if (!n._fxRel) { if (getComputedStyle(n).position === 'static') n.style.position = 'relative'; n._fxRel = 1; } };
  const overlay = (n, html) => { rel(n); if (!n._fxo) { n._fxo = $('<div class="fx-ov" style="position:absolute;inset:0;pointer-events:none;overflow:visible">' + (html || '') + '</div>'); n.appendChild(n._fxo); } n._fxo.style.display = ''; return n._fxo; };
  const mask = (n, W, H, body) => { const u = 'url("data:image/svg+xml;utf8,' + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 " + W + ' ' + H + "' preserveAspectRatio='none'>" + body + '</svg>') + '")';
    const s = n.style; s.maskImage = s.webkitMaskImage = u; s.maskSize = s.webkitMaskSize = '100% 100%'; s.maskRepeat = s.webkitMaskRepeat = 'no-repeat'; };
  let fid = 0;
  const svgFilter = (n, inner) => { if (!n._fxf) { const id = 'fxf' + (++fid), s = document.createElementNS(SVGNS, 'svg'); s.setAttribute('width', 0); s.setAttribute('height', 0); s.style.position = 'absolute';
      s.innerHTML = '<filter id="' + id + '" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">' + inner + '</filter>'; document.body.appendChild(s); n._fxf = { id, el: s }; } return n._fxf; };

  FX.add('enter', 'wipe', { desc: 'Scanner wipe: a bar sweeps across and reveals the element behind it (dir: right|left|down|up)', from: 'blueprint,x-ray-scan',
    draw(n, lt, e) { if (lt < 0) return hide(n); const D = 0.7; if (lt >= D) return clean(n);
      const p = E.inOutCubic(lt / D), d = e.dir || 'right', ov = overlay(n, '<i style="position:absolute;background:' + C.orange + '"></i><i style="position:absolute;background:rgba(31,79,209,.12)"></i>'), [bar, band] = ov.children, q = (p * 100).toFixed(2) + '%';
      n.style.opacity = '1'; n.style.clipPath = d === 'right' ? 'inset(0 ' + (100 - p * 100) + '% 0 0)' : d === 'left' ? 'inset(0 0 0 ' + (100 - p * 100) + '%)' : d === 'down' ? 'inset(0 0 ' + (100 - p * 100) + '% 0)' : 'inset(' + (100 - p * 100) + '% 0 0 0)';
      const H = d === 'right' || d === 'left'; Object.assign(bar.style, H ? { top: 0, bottom: 0, width: '6px', height: '', left: d === 'right' ? 'calc(' + q + ' - 6px)' : 'calc(' + (100 - p * 100) + '%)', top_: 0 } : { left: 0, right: 0, height: '6px', width: '', top: d === 'down' ? 'calc(' + q + ' - 6px)' : (100 - p * 100) + '%' });
      Object.assign(band.style, H ? { top: 0, bottom: 0, width: '90px', height: '', left: d === 'right' ? 'calc(' + q + ' - 96px)' : 'calc(' + (100 - p * 100) + '% + 6px)' } : { left: 0, right: 0, height: '90px', width: '', top: d === 'down' ? 'calc(' + q + ' - 96px)' : 'calc(' + (100 - p * 100) + '% + 6px)' }); } });

  FX.add('enter', 'blocks', { desc: 'Mosaic reveal in square blocks (order: random|rows bricks dropping from the bottom|diag; size px)', from: 'pixelate-region,brick-mosaic,isometric-build',
    draw(n, lt, e) { if (lt < 0) return hide(n); const s = e.size || 44, W = n.offsetWidth || 1, H = n.offsetHeight || 1, cols = Math.ceil(W / s), rows = Math.ceil(H / s), ord = e.order || 'random', span = 0.55, cell = ord === 'rows' ? 0.28 : 0.18;
      if (lt >= span + cell) { n.style.maskImage = n.style.webkitMaskImage = ''; n.style.opacity = '1'; return; } n.style.opacity = '1'; let b = '';
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const st = ord === 'rows' ? (rows - 1 - r) / Math.max(1, rows) * span + c * 0.004 : ord === 'diag' ? (c + r) / (cols + rows) * span : R('blk', r * 97 + c) * span, q = (lt - st) / cell; if (q <= 0) continue;
        if (ord === 'rows') { const y = r * s - (1 - E.outBounce(q)) * s * 1.2; b += "<rect x='" + c * s + "' y='" + y.toFixed(1) + "' width='" + (s + 0.6) + "' height='" + (s + 0.6) + "'/>"; }
        else { const z = s * E.outBack(clamp(q)), o = (s - z) / 2; b += "<rect x='" + (c * s + o).toFixed(1) + "' y='" + (r * s + o).toFixed(1) + "' width='" + (z + 0.6).toFixed(1) + "' height='" + (z + 0.6).toFixed(1) + "'/>"; } }
      mask(n, W, H, b); } });

  FX.add('enter', 'shutter', { desc: 'Stripes slide open one after another like cut panels (n stripes, dir: h|v, alt: alternate sides)', from: 'mondrian-split,comic-panels',
    draw(n, lt, e) { if (lt < 0) return hide(n); const N = e.n || 6, W = n.offsetWidth || 1, H = n.offsetHeight || 1, st = 0.07, d = 0.38; if (lt >= st * (N - 1) + d) { n.style.maskImage = n.style.webkitMaskImage = ''; n.style.opacity = '1'; return; }
      n.style.opacity = '1'; let b = ''; const v = e.dir === 'v', alt = e.alt !== false;
      for (let k = 0; k < N; k++) { const p = E.outCubic((lt - k * st) / d); if (p <= 0) continue; const fl = alt && k % 2;
        if (!v) { const h = H / N, w = W * p; b += "<rect x='" + (fl ? W - w : 0).toFixed(1) + "' y='" + (k * h).toFixed(1) + "' width='" + w.toFixed(1) + "' height='" + (h + 0.6).toFixed(1) + "'/>"; }
        else { const w = W / N, h = H * p; b += "<rect x='" + (k * w).toFixed(1) + "' y='" + (fl ? H - h : 0).toFixed(1) + "' width='" + (w + 0.6).toFixed(1) + "' height='" + h.toFixed(1) + "'/>"; } }
      mask(n, W, H, b); } });

  FX.add('enter', 'glitch', { desc: 'Short broadcast-glitch entrance: flicker, sliced bands and a blue/orange channel split that resolve clean', from: 'sustained-glitch,vhs-filter,security-cam,hologram',
    draw(n, lt, e) { if (lt < 0) return hide(n); const D = e.dur || 0.6; if (lt >= D) return clean(n); const s = Math.floor(lt * 20), r = k => R('gl' + (e.id || ''), s * 7 + k), q = 1 - lt / D;
      n.style.opacity = r(0) < 0.25 + 0.75 * (1 - q) ? '1' : '0.25'; const k = (8 + 10 * r(1)) * q;
      n.style.filter = 'drop-shadow(' + k.toFixed(1) + 'px 0 0 rgba(255,106,19,.85)) drop-shadow(' + (-k).toFixed(1) + 'px 0 0 rgba(31,79,209,.85))';
      n.style.transform = 'translateX(' + ((r(2) - 0.5) * 34 * q).toFixed(1) + 'px) skewX(' + ((r(3) - 0.5) * 8 * q).toFixed(1) + 'deg)';
      const a = r(4) * 60, b = r(5) * 30; n.style.clipPath = r(6) < 0.6 * q ? 'inset(' + a.toFixed(0) + '% 0 ' + b.toFixed(0) + '% 0)' : ''; } });

  FX.add('enter', 'tv-on', { desc: 'Tube switch-on: a thin bright line opens horizontally, then springs open vertically into the picture', from: 'tv-power-off,crt-screen',
    draw(n, lt) { if (lt < 0) return hide(n); if (lt >= 0.6) return clean(n); const p1 = E.outCubic(lt / 0.16), p2 = clamp((lt - 0.16) / 0.44);
      n.style.opacity = '1'; n.style.transformOrigin = 'center center'; n.style.transform = 'scale(' + (0.02 + 0.98 * p1).toFixed(3) + ',' + (lt < 0.16 ? 0.012 : 0.012 + 0.988 * E.outBack(p2)).toFixed(3) + ')';
      n.style.filter = 'brightness(' + (1 + 0.8 * (1 - p2)).toFixed(2) + ') contrast(' + (1 + 0.4 * (1 - p2)).toFixed(2) + ')'; } });

  FX.add('enter', 'halftone', { desc: 'The element prints in as a halftone dot screen whose dots swell until they merge (size px)', from: 'halftone-print,duotone-beat,comic-panels',
    draw(n, lt, e) { if (lt < 0) return hide(n); const D = 0.75; if (lt >= D) return clean(n); const s = e.size || 16, r = s * 0.74 * E.inOutCubic(lt / D) + 0.5;
      n.style.opacity = '1'; const m = 'radial-gradient(circle, #000 ' + r.toFixed(2) + 'px, transparent ' + (r + 1).toFixed(2) + 'px)'; n.style.maskImage = n.style.webkitMaskImage = m;
      n.style.maskSize = n.style.webkitMaskSize = s + 'px ' + s + 'px'; n.style.maskRepeat = n.style.webkitMaskRepeat = 'repeat'; n.style.transform = 'scale(' + (1.03 - 0.03 * E.outCubic(lt / D)).toFixed(4) + ')'; } });

  FX.add('enter', 'riso', { desc: 'Risograph entrance: an orange plate slides in off-register and settles behind the element (keep: leave a hair of misregistration)', from: 'riso-print,duotone-beat',
    draw(n, lt, e) { if (lt < 0) return hide(n); const D = 0.85, k = e.keep ? 1 : 0; if (lt >= D) { clean(n); if (k) n.style.filter = 'drop-shadow(3px 2px 0 rgba(255,106,19,.85))'; return; }
      const sp = U.spring(lt, { damping: 13, stiffness: 120 }), dx = 34 * (1 - sp) + 3 * k * sp, dy = -22 * (1 - sp) + 2 * k * sp, fade = k ? 1 : 1 - clamp((lt - 0.55) / 0.3);
      n.style.opacity = clamp(lt / 0.12).toFixed(3); n.style.transform = ''; n.style.filter = 'drop-shadow(' + dx.toFixed(1) + 'px ' + dy.toFixed(1) + 'px 0 rgba(255,106,19,' + (0.85 * fade).toFixed(3) + '))'; } });

  FX.add('enter', 'ripple', { desc: 'The element surfaces through moving water: a refraction ripple that calms to flat (mode: water|flutes for fluted glass)', from: 'underwater-ripple,shader-water,fluted-glass,glass-lens',
    draw(n, lt, e) { if (lt < 0) return hide(n); const D = 0.95; if (lt >= D) return clean(n); const fl = e.mode === 'flutes';
      const f = svgFilter(n, '<feTurbulence type="' + (fl ? 'turbulence' : 'fractalNoise') + '" baseFrequency="' + (fl ? '0.045 0.0005' : '0.012 0.035') + '" numOctaves="2" seed="3" result="t"/><feOffset in="t" result="o"/><feDisplacementMap in="SourceGraphic" in2="o" xChannelSelector="R" yChannelSelector="G"/>');
      const q = E.outCubic(lt / D); f.el.querySelector('feOffset').setAttribute('dx', (lt * (fl ? 0 : 90)).toFixed(1)); f.el.querySelector('feOffset').setAttribute('dy', (lt * (fl ? 0 : 30)).toFixed(1));
      f.el.querySelector('feDisplacementMap').setAttribute('scale', ((fl ? 70 : 46) * (1 - q)).toFixed(2)); n.style.filter = 'url(#' + f.id + ')'; n.style.opacity = clamp(lt / 0.3).toFixed(3); n.style.transform = ''; } });

  FX.add('enter', 'boil', { desc: 'Stop-motion entrance: the element pops on twos with hand-placed jitter and a boiling outline, then settles (hold: keep a slight paper wobble)', from: 'line-boil,paper-wobble,ink-arrow',
    draw(n, lt, e) { if (lt < 0) return hide(n); const D = 0.9, hold = !!e.hold; if (lt >= D && !hold) return clean(n); const s = Math.floor(lt * 10), q = clamp(lt / D), amp = (1 - q) * 5 + (hold ? 1.2 : 0);
      const r = k => R('boil' + (e.id || ''), s * 5 + k) * 2 - 1; const sc = U.spring(Math.floor(lt * 10) / 10, { damping: 9, stiffness: 160 });
      n.style.opacity = '1'; n.style.transform = 'translate(' + (r(0) * amp).toFixed(1) + 'px,' + (r(1) * amp).toFixed(1) + 'px) rotate(' + (r(2) * amp * 0.25).toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
      if (lt < D) { const f = svgFilter(n, '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="1"/><feDisplacementMap in="SourceGraphic" xChannelSelector="R" yChannelSelector="G"/>');
        f.el.querySelector('feTurbulence').setAttribute('seed', String(1 + (s % 5))); f.el.querySelector('feDisplacementMap').setAttribute('scale', (7 * (1 - q)).toFixed(2)); n.style.filter = 'url(#' + f.id + ')'; } else n.style.filter = ''; } });

  FX.add('enter', 'frost', { desc: 'Frosted glass clears outward from the centre: blur and veil lift to a sharp element', from: 'frosted-clear,camera-lens,glass-lens',
    draw(n, lt) { if (lt < 0) return hide(n); const D = 0.85; if (lt >= D) return clean(n); const p = E.outCubic(lt / D), r = 140 * p;
      n.style.opacity = clamp(lt / 0.2).toFixed(3); n.style.filter = 'blur(' + (14 * (1 - p)).toFixed(2) + 'px)'; n.style.transform = 'scale(' + (1.035 - 0.035 * p).toFixed(4) + ')';
      const m = 'radial-gradient(ellipse at 50% 50%, #000 ' + r.toFixed(1) + '%, rgba(0,0,0,.3) ' + (r + 35).toFixed(1) + '%)'; n.style.maskImage = n.style.webkitMaskImage = m; n.style.maskSize = n.style.webkitMaskSize = '100% 100%'; n.style.maskRepeat = n.style.webkitMaskRepeat = 'no-repeat'; } });

  FX.add('enter', 'shadow', { desc: 'Flat pop-in that casts a long shadow; the light swings and the shadow sweeps round, then retracts', from: 'long-shadow',
    draw(n, lt) { if (lt < 0) return hide(n); const D = 1.2; if (lt >= D) return clean(n); const sc = U.spring(lt, { damping: 11, stiffness: 170 }), L = 70 * Math.sin(Math.PI * clamp(lt / D)), a = lerp(Math.PI * 0.75, Math.PI * 0.2, E.inOutCubic(lt / D));
      const dx = Math.cos(a) * L / 5, dy = Math.sin(a) * L / 5, ds = 'drop-shadow(' + dx.toFixed(1) + 'px ' + dy.toFixed(1) + 'px 0 rgba(180,174,162,.5))';
      n.style.opacity = '1'; n.style.transformOrigin = 'left center'; n.style.transform = 'scale(' + (0.6 + 0.4 * sc).toFixed(4) + ')'; n.style.filter = L > 1 ? [ds, ds, ds, ds, ds].join(' ') : ''; } });

  FX.add('enter', 'speed', { desc: 'Speed-line entrance: the element shoots in trailing streaks and lands with a squash (mode: slide|impact for radial manga lines; dir: left|right)', from: 'speed-lines',
    draw(n, lt, e) { if (lt < 0) return hide(n); const D = 0.8; if (lt >= D) return clean(n); const W = n.offsetWidth || 1, H = n.offsetHeight || 1;
      if (e.mode === 'impact') { const ov = overlay(n, '<svg width="100%" height="100%" style="position:absolute;inset:0;overflow:hidden"></svg>'), sv = ov.firstChild, p = clamp(lt / 0.45), cx = W / 2, cy = H / 2, R0 = Math.hypot(W, H) / 2; let d = '';
        for (let k = 0; k < 22; k++) { const a = TAU * k / 22 + R('im', k) * 0.25, r1 = R0 * (1 - 0.55 * E.outCubic(p)) * (0.9 + R('im', k + 40) * 0.2), r0 = r1 - R0 * 0.35 * (1 - p) - 10; if (p >= 1) break;
          d += 'M' + (cx + Math.cos(a) * r1).toFixed(1) + ' ' + (cy + Math.sin(a) * r1).toFixed(1) + 'L' + (cx + Math.cos(a) * Math.max(r0, 0)).toFixed(1) + ' ' + (cy + Math.sin(a) * Math.max(r0, 0)).toFixed(1); }
        sv.innerHTML = '<path d="' + d + '" stroke="' + C.ink + '" stroke-width="4" stroke-linecap="round" opacity="' + (0.5 * (1 - p)).toFixed(3) + '"/>';
        const sc = 1.25 - 0.25 * U.spring(lt - 0.05, { damping: 12, stiffness: 220 }); n.style.opacity = '1'; n.style.transformOrigin = 'center center'; n.style.transform = 'scale(' + sc.toFixed(4) + ')'; return; }
      const sg = e.dir === 'left' ? -1 : 1, X = x => -sg * 160 * (1 - E.outExpo(x / 0.42)), x0 = X(lt), v = Math.abs(x0 - X(lt - 0.033)) / 0.033, land = lt - 0.42;
      const sq = land > 0 ? Math.exp(-land * 9) * Math.sin(land * 26) * 0.06 : 0, sx = 1 + Math.min(0.12, v * 0.00035) - sq, sy = 1 + sq;
      n.style.opacity = '1'; n.style.transformOrigin = (sg > 0 ? 'right' : 'left') + ' center'; n.style.transform = 'translateX(' + x0.toFixed(1) + 'px) scale(' + sx.toFixed(4) + ',' + sy.toFixed(4) + ')';
      const ov = overlay(n, '<svg width="100%" height="100%" style="position:absolute;inset:0;overflow:hidden"></svg>'), sv = ov.firstChild; let d = '';
      for (let k = 0; k < 7; k++) { const y = H * (0.12 + 0.76 * k / 6) + (R('sl', k) - 0.5) * 12, len = Math.min(W * 0.45, v * 0.12 * (0.5 + R('sl', k + 9))), xs = sg > 0 ? 0 : W; if (len < 4) continue; d += 'M' + xs + ' ' + y.toFixed(1) + 'h' + (sg * len).toFixed(1); }
      sv.innerHTML = '<path d="' + d + '" stroke="' + C.blue + '" stroke-width="5" stroke-linecap="round" opacity=".45"/>'; } });

  FX.add('enter', 'burst', { desc: 'Pop-in punctuated by short strokes shooting out and vanishing in flight (mode: strokes|confetti; ox, oy origin 0-1)', from: 'trim-burst,radial-burst,confetti',
    draw(n, lt, e) { if (lt < 0) return hide(n); const D = e.mode === 'confetti' ? 1.5 : 0.75; if (lt >= D) return clean(n); const W = n.offsetWidth || 1, H = n.offsetHeight || 1, ox = (e.ox ?? 0.5) * W, oy = (e.oy ?? 0.5) * H;
      const sc = U.spring(lt, { damping: 10, stiffness: 190 }); n.style.opacity = '1'; n.style.transformOrigin = (e.ox ?? 0.5) * 100 + '% ' + (e.oy ?? 0.5) * 100 + '%'; n.style.transform = 'scale(' + (0.7 + 0.3 * sc).toFixed(4) + ')';
      const ov = overlay(n, '<svg width="100%" height="100%" style="position:absolute;inset:0;overflow:visible"></svg>'), sv = ov.firstChild; let h = '';
      if (e.mode === 'confetti') { const cols = [C.blue, C.orange, C.ink, C.mark];
        for (let k = 0; k < 36; k++) { const r = j => R('cf' + (e.id || ''), k * 9 + j), a = -Math.PI / 2 + (r(0) - 0.5) * 2.4, v0 = 520 + r(1) * 420, tt = lt, x = ox + Math.cos(a) * v0 * tt * Math.exp(-tt * 1.2), y = oy + Math.sin(a) * v0 * tt * Math.exp(-tt * 1.2) + 420 * tt * tt;
          const op = clamp(lt / 0.05) * (1 - clamp((lt - 0.9) / 0.6)), rot = (r(2) * 720 + lt * 540 * (r(3) - 0.5)) % 360, fl = Math.abs(Math.cos(lt * 9 + r(4) * 6));
          h += '<rect x="-7" y="-4" width="14" height="8" fill="' + cols[k % 4] + '" opacity="' + op.toFixed(3) + '" transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + rot.toFixed(0) + ') scale(1 ' + fl.toFixed(2) + ')"/>'; } }
      else { const base = Math.max(W, H) * 0.25, N = 10;
        for (let k = 0; k < N; k++) { const a = TAU * k / N + (R('tb', k) - 0.5) * 0.4, l0 = (lt - k * 0.012) / 0.5, head = E.outExpo(l0), tail = E.inOutCubic((lt - 0.12 - k * 0.012) / 0.45); if (l0 <= 0 || tail >= 1) continue;
          const r0 = Math.min(W, H) * 0.35 + base * tail, r1 = Math.min(W, H) * 0.35 + base * head; h += '<line x1="' + (ox + Math.cos(a) * r0).toFixed(1) + '" y1="' + (oy + Math.sin(a) * r0).toFixed(1) + '" x2="' + (ox + Math.cos(a) * r1).toFixed(1) + '" y2="' + (oy + Math.sin(a) * r1).toFixed(1) + '"/>'; }
        h = '<g stroke="' + C.orange + '" stroke-width="6" stroke-linecap="round">' + h + '</g>'; }
      sv.innerHTML = h; } });

  // =====================================================================
  // ELEMENTI GRAFICI NUOVI (els)
  // =====================================================================
  FX.css(`
.fx-arrow{position:relative;width:715px}
.fx-arrow .lb{position:absolute;font:700 56px/1 Hand;color:var(--orange);white-space:nowrap}
.fx-scribble{position:relative;font:800 60px/1.18 Inter;color:var(--ink)}
.fx-scribble b{color:var(--blue);font-weight:900}
.fx-scribble svg{position:absolute;left:0;top:0;overflow:visible;pointer-events:none}
.fx-stamp{align-self:flex-start}
.fx-stamp .st{display:inline-block;padding:16px 34px 12px;border:8px solid currentColor;box-shadow:inset 0 0 0 6px var(--paper,#F4F1EA),inset 0 0 0 10px currentColor;text-align:center;transform-origin:center}
.fx-stamp .st .a{font:400 104px/1 Anton;text-transform:uppercase;letter-spacing:.02em}
.fx-stamp .st .b{font:700 24px Mono;letter-spacing:.14em;text-transform:uppercase;margin-top:6px}
.fx-callout .cap{font:600 34px/1.3 Inter;margin-top:8px}.fx-callout .cap b{color:var(--orange)}
.fx-progress .hd{display:flex;justify-content:space-between;align-items:baseline;font:800 36px Inter;margin-bottom:14px}
.fx-progress .hd .v{font:400 72px/1 Anton;color:var(--blue)}
.fx-led canvas{display:block;border-radius:14px}
.fx-venn .cap,.fx-orbit .cap,.fx-iso .cap{font:600 34px/1.3 Inter;margin-top:10px}.fx-venn .cap b,.fx-orbit .cap b,.fx-iso .cap b{color:var(--orange)}
`);
  const svgEl = (tag, at) => { const x = document.createElementNS(SVGNS, tag); for (const k in at) x.setAttribute(k, at[k]); return x; };
  const pathD = (pts, n) => { let d = ''; for (let i = 0; i < Math.min(n, pts.length); i++) d += (i ? 'L' : 'M') + pts[i][0].toFixed(1) + ' ' + pts[i][1].toFixed(1); return d; };
  const POSE = 12; // pose al secondo (stop-motion)

  // arrow: freccia disegnata a mano che si traccia da un punto a un altro, a pose
  FX.add('els', 'arrow', { desc: 'Hand-drawn arrow that draws itself in stop-motion poses, with an optional handwritten label. Fields: label, from [x,y], to [x,y], h, bend, tint, dur', from: 'ink-arrow',
    build(e) { const W = 715, H = e.h || 240, A = e.from || [40, H - 100], B = e.to || [W - 70, 50], bend = e.bend ?? 0.3, col = C[e.tint || 'orange'] || C.orange, dur = e.dur || 0.7;
      const n = $('<div class="el fx-arrow" style="height:' + H + 'px"><svg width="' + W + '" height="' + H + '" style="overflow:visible;position:absolute;left:0;top:0"></svg>' + (e.label ? '<div class="lb">' + esc(e.label) + '</div>' : '') + '</div>');
      const sv = n.querySelector('svg'), sh = svgEl('path', { fill: 'none', stroke: col, 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }), hd = svgEl('path', { fill: 'none', stroke: col, 'stroke-width': 8, 'stroke-linecap': 'round' }); sv.append(sh, hd);
      const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1, cx = (A[0] + B[0]) / 2 - dy / L * bend * L, cy = (A[1] + B[1]) / 2 + dx / L * bend * L;
      const Q = s => [(1 - s) ** 2 * A[0] + 2 * (1 - s) * s * cx + s * s * B[0], (1 - s) ** 2 * A[1] + 2 * (1 - s) * s * cy + s * s * B[1]], N = 40;
      const lb = n.querySelector('.lb'); if (lb) { lb.style.left = Math.max(0, Math.min(A[0] - 20, W - 300)) + 'px'; lb.style.top = Math.max(0, A[1] - 72) + 'px'; }
      return { n, upd(lt) { const ls = Math.floor(lt * POSE) / POSE, pose = Math.floor(lt * POSE), j = (k, a) => (R('ar' + pose, k) - 0.5) * a, p = E.inOutCubic(ls / dur);
        const pts = []; for (let i = 0; i <= N; i++) { const q = Q(i / N), w = Math.sin(Math.PI * i / N); pts.push([q[0] + j(i, 3) * w, q[1] + j(i + 99, 3) * w]); }
        sh.setAttribute('d', pathD(pts, Math.max(1, Math.round(p * N) + 1))); const tip = pts[N], pr = Q(0.94), a = Math.atan2(tip[1] - pr[1], tip[0] - pr[0]), h = clamp((ls - dur) / 0.17), hl = 46 * E.outBack(h);
        hd.setAttribute('d', h > 0 ? 'M' + (tip[0] - Math.cos(a - 0.62) * hl).toFixed(1) + ' ' + (tip[1] - Math.sin(a - 0.62) * hl).toFixed(1) + 'L' + tip[0].toFixed(1) + ' ' + tip[1].toFixed(1) + 'L' + (tip[0] - Math.cos(a + 0.75) * hl * 0.9).toFixed(1) + ' ' + (tip[1] - Math.sin(a + 0.75) * hl * 0.9).toFixed(1) : '');
        if (lb) { lb.style.opacity = clamp((ls - 0.1) / 0.25); lb.style.transform = 'rotate(' + (-4 + j(7, 2)).toFixed(1) + 'deg)'; } } }; } });

  // scribble: frase con un segno a mano attorno alla parola tra asterischi (cerchio, sottolineatura, riquadro, barrato)
  FX.add('els', 'scribble', { desc: 'A line of text whose *highlighted* word gets a hand-drawn mark. Fields: text, mark (circle|underline|box|strike), size, tint', from: 'scribble-circle,squiggle,line-boil',
    build(e) { const n = $('<div class="el fx-scribble"' + (e.size ? ' style="font-size:' + e.size + 'px"' : '') + '><div class="tx">' + md(e.text) + '</div></div>'); const col = C[e.tint || 'orange'] || C.orange, mk = e.mark || 'circle';
      const sv = svgEl('svg', { width: 10, height: 10 }), pa = svgEl('path', { fill: 'none', stroke: col, 'stroke-width': mk === 'strike' ? 9 : 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }); sv.appendChild(pa); n.appendChild(sv);
      let pts = null;
      const geo = () => { const b = n.querySelector('b'); if (!b) return []; const x = b.offsetLeft, y = b.offsetTop, w = b.offsetWidth, h = b.offsetHeight, W = n.offsetWidth, out = [], r = k => R('scr' + (e.id || e.text), k) - 0.5;
        if (mk === 'circle') { const rx = w / 2 + 16, ry = h / 2 + 9, cx = Math.max(rx - 30, Math.min(W - rx + 30, x + w / 2)), cy = y + h / 2, M = 64, laps = 1.18, a0 = -2.5;
          for (let i = 0; i <= M; i++) { const s = i / M, a = a0 + laps * TAU * s, k = 1 + 0.05 * Math.sin(3 * a + r(1) * 6) + (s - 0.5) * 0.08; out.push([cx + rx * k * Math.cos(a), cy + ry * k * Math.sin(a) + (s - 0.5) * 8]); } }
        else if (mk === 'box') { const p = [[x - 18, y - 4], [x + w + 18, y - 10], [x + w + 14, y + h + 6], [x - 14, y + h + 2], [x - 20, y + 2]]; for (let i = 0; i < p.length - 1; i++) for (let s = 0; s < 1; s += 0.1) out.push([lerp(p[i][0], p[i + 1][0], s) + r(i * 11 + s * 10) * 3, lerp(p[i][1], p[i + 1][1], s) + r(i * 13 + s * 10 + 50) * 3]); out.push(p[4]); }
        else if (mk === 'strike') { for (let i = 0; i <= 20; i++) out.push([x - 8 + (w + 16) * i / 20, y + h * 0.56 + Math.sin(i * 0.9) * 2 - i * 0.3]); }
        else { for (let i = 0; i <= 50; i++) { const s = i / 50; out.push([x - 4 + (w + 8) * s, y + h + 2 + 7 * Math.sin(s * 14) * (1 - s * 0.6)]); } }
        return out; };
      return { n, upd(lt) { const tx = n.firstChild; tx.style.opacity = E.outCubic(lt / 0.3); if (!pts) { pts = geo(); sv.setAttribute('width', n.offsetWidth); sv.setAttribute('height', n.offsetHeight); }
        const ls = Math.floor(lt * POSE) / POSE, p = E.inOutCubic((ls - 0.35) / 0.6), pose = Math.floor(lt * POSE), jt = lt < 1.1 ? 1.4 : 0.6;
        const q = pts.map((v, i) => [v[0] + (R('sp' + pose, i) - 0.5) * jt, v[1] + (R('sp' + pose, i + 300) - 0.5) * jt]); pa.setAttribute('d', p > 0 ? pathD(q, Math.max(2, Math.round(p * q.length))) : ''); } }; } });

  // stamp: timbro che sbatte sulla pagina con inchiostro consumato
  let inkURL = null;
  const inkMask = () => { if (inkURL) return inkURL; const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), im = g.createImageData(256, 256);
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { const v = fbm(x * 0.05, y * 0.05, 3.3, 3) + R('ink', y * 256 + x) * 0.5; im.data[(y * 256 + x) * 4 + 3] = v > 0.3 ? 40 : 255; } g.putImageData(im, 0, 0); return (inkURL = c.toDataURL()); };
  FX.add('els', 'stamp', { desc: 'A rubber stamp that slams onto the page with worn ink and a small shake. Fields: text, sub, rot, tint', from: 'comic-panels,embossed-mark,long-shadow',
    build(e) { const col = C[e.tint || 'orange'] || C.orange; const n = $('<div class="el fx-stamp"><div class="st" style="color:' + col + '"><div class="a">' + esc(e.text || 'OFFICIAL') + '</div>' + (e.sub ? '<div class="b">' + esc(e.sub) + '</div>' : '') + '</div></div>');
      const st = n.firstChild; st.style.maskImage = st.style.webkitMaskImage = 'url(' + inkMask() + ')'; st.style.maskSize = st.style.webkitMaskSize = '256px 256px'; const rot = e.rot ?? -7;
      return { n, upd(lt) { const p = clamp(lt / 0.16), land = lt - 0.16, s = Math.floor(lt * 20), sh = land > 0 && land < 0.25 ? (1 - land / 0.25) * 6 : 0;
        st.style.opacity = p > 0 ? 1 : 0; st.style.transform = 'translate(' + ((R('stx', s) - 0.5) * sh).toFixed(1) + 'px,' + ((R('sty', s) - 0.5) * sh).toFixed(1) + 'px) rotate(' + (rot + (1 - p) * 8).toFixed(2) + 'deg) scale(' + (2.3 - 1.3 * E.inCubic(p)).toFixed(3) + ')'; } }; } });

  // callout: quota tecnica da disegno (linea con frecce, valore al centro) + didascalia
  FX.add('els', 'callout', { desc: 'Technical-drawing dimension: extension ticks, a dimension line with arrowheads that extends from the centre, the measure on it and a caption. Fields: value, text, w (0-1)', from: 'blueprint,x-ray-scan',
    build(e) { const W = Math.round(715 * (e.w || 1)), H = 150, y = 112, col = C[e.tint || 'blue'] || C.blue;
      const n = $('<div class="el fx-callout"><svg width="' + W + '" height="' + H + '" style="overflow:visible;display:block"><g stroke="' + col + '" stroke-width="4" stroke-linecap="round" fill="none"><path class="tk"/><path class="ln"/><path class="ah"/></g><text x="' + W / 2 + '" y="' + (y - 26) + '" text-anchor="middle" font-family="Anton" font-size="78" fill="' + col + '">' + esc(e.value || '') + '</text></svg>' + (e.text ? '<div class="cap">' + md(e.text) + '</div>' : '') + '</div>');
      const tk = n.querySelector('.tk'), ln = n.querySelector('.ln'), ah = n.querySelector('.ah'), tx = n.querySelector('text'), cap = n.querySelector('.cap');
      return { n, upd(lt) { const a = E.outCubic(lt / 0.25), b = E.inOutCubic((lt - 0.15) / 0.5), c = E.outCubic((lt - 0.5) / 0.35), d = E.outCubic((lt - 0.7) / 0.35), h = 34 * a, x0 = W / 2 - (W / 2 - 4) * b, x1 = W / 2 + (W / 2 - 4) * b;
        tk.setAttribute('d', 'M4 ' + (y + 20) + 'v' + (-h - 20 * a) + 'M' + (W - 4) + ' ' + (y + 20) + 'v' + (-h - 20 * a)); ln.setAttribute('d', b > 0 ? 'M' + x0.toFixed(1) + ' ' + y + 'H' + x1.toFixed(1) : '');
        ah.setAttribute('d', b > 0 ? 'M' + (x0 + 18).toFixed(1) + ' ' + (y - 11) + 'L' + x0.toFixed(1) + ' ' + y + 'L' + (x0 + 18).toFixed(1) + ' ' + (y + 11) + 'M' + (x1 - 18).toFixed(1) + ' ' + (y - 11) + 'L' + x1.toFixed(1) + ' ' + y + 'L' + (x1 - 18).toFixed(1) + ' ' + (y + 11) : '');
        tx.setAttribute('opacity', c); tx.setAttribute('transform', 'translate(0 ' + ((1 - c) * 16).toFixed(1) + ')'); if (cap) { cap.style.opacity = d; cap.style.transform = 'translateY(' + (1 - d) * 16 + 'px)'; } } }; } });

  // progress: barra di avanzamento su righello, con scintille all'arrivo
  FX.add('els', 'progress', { desc: 'Progress bar on a ruler that fills to a value, counting up, with a stroke burst on arrival. Fields: label, value, max, display, suffix, hi, dur', from: 'blueprint,trim-burst',
    build(e) { const W = 715, max = e.max || 100, v = Math.max(0, Math.min(max, e.value || 0)), col = e.hi ? C.orange : C.blue, dur = e.dur || 1.3;
      let tk = ''; for (let k = 0; k <= 20; k++) { const x = 2 + (W - 4) * k / 20; tk += 'M' + x.toFixed(1) + ' 60v' + (k % 10 === 0 ? 22 : k % 2 === 0 ? 14 : 8); }
      const n = $('<div class="el fx-progress"><div class="hd"><span>' + esc(e.label || '') + '</span><span class="v"></span></div><svg width="' + W + '" height="118" style="overflow:visible;display:block"><rect x="0" y="0" width="' + W + '" height="50" fill="' + C.line + '"/><rect class="f" x="0" y="0" height="50" fill="' + col + '"/><path d="' + tk + '" stroke="' + C.gray + '" stroke-width="3"/><text x="0" y="112" font-family="Mono" font-size="22" fill="#6E6A62">0</text><text x="' + W / 2 + '" y="112" text-anchor="middle" font-family="Mono" font-size="22" fill="#6E6A62">' + max / 2 + '</text><text x="' + W + '" y="112" text-anchor="end" font-family="Mono" font-size="22" fill="#6E6A62">' + max + '</text><g class="b" stroke="' + C.orange + '" stroke-width="5" stroke-linecap="round"></g></svg></div>');
      const f = n.querySelector('.f'), vt = n.querySelector('.v'), bg = n.querySelector('.b');
      return { n, upd(lt) { const p = E.inOutCubic(lt / dur), X = (W * v / max) * p; f.setAttribute('width', X.toFixed(1));
        vt.textContent = e.display != null ? (p > 0.85 ? e.display : (Math.round(v * p) + (e.suffix || ''))) : (Math.round(v * p) + (e.suffix || ''));
        const b = lt - dur; let h = ''; if (b > 0 && b < 0.6) for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.42, hd = 14 + 46 * E.outExpo(b / 0.4), tl = 14 + 46 * E.inOutCubic((b - 0.1) / 0.45); if (tl >= hd - 0.5) continue;
          h += '<line x1="' + (X + Math.cos(a) * tl).toFixed(1) + '" y1="' + (25 + Math.sin(a) * tl).toFixed(1) + '" x2="' + (X + Math.cos(a) * hd).toFixed(1) + '" y2="' + (25 + Math.sin(a) * hd).toFixed(1) + '"/>'; } bg.innerHTML = h; } }; } });

  // led: insegna a matrice di punti (font 5x7) che fa scorrere il testo e si ferma leggibile; parole *evidenziate* in arancio
  const F57 = { A: '0E11111F111111', B: '1E11111E11111E', C: '0E11101010110E', D: '1E11111111111E', E: '1F10101E10101F', F: '1F10101E101010', G: '0E11101711110F', H: '1111111F111111', I: '0E04040404040E', J: '0702020202120C', K: '11121418141211', L: '1010101010101F', M: '111B1515111111', N: '11111915131111', O: '0E11111111110E', P: '1E11111E101010', Q: '0E11111115120D', R: '1E11111E141211', S: '0F10100E01011E', T: '1F040404040404', U: '1111111111110E', V: '11111111110A04', W: '1111111515150A', X: '11110A040A1111', Y: '11110A04040404', Z: '1F01020408101F',
    0: '0E11131519110E', 1: '040C040404040E', 2: '0E11010204081F', 3: '1F02040201110E', 4: '02060A121F0202', 5: '1F101E0101110E', 6: '0608101E11110E', 7: '1F010204080808', 8: '0E11110E11110E', 9: '0E11110F01020C',
    $: '040F140E051E04', '%': '18190204081303', '.': '00000000000C0C', ',': '000000000C0408', '!': '04040404040004', '?': '0E110102040004', '-': '0000001F000000', '+': '0004041F040400', '/': '01010204081010', ':': '000C0C000C0C00', "'": '04040800000000', '&': '0C12140815120D', '€': '07081E081E0807', '£': '0609081C08081F' };
  FX.add('els', 'led', { desc: 'Dot-matrix LED sign (5x7 font): each line scrolls in and stops readable; *highlighted* words light up orange. Fields: text, speed', from: 'led-ticker',
    build(e) { const W = 715, raw = String(e.text || '').toUpperCase(), words = []; let hi = false;
      raw.split(/(\*)/).forEach(t => { if (t === '*') { hi = !hi; return; } t.split(/\s+/).forEach(w => { if (w) words.push({ w, hi }); }); });
      const len = ws => ws.reduce((s, x) => s + x.w.length, 0) + ws.length - 1, tot = len(words); let pitch = Math.min(14, Math.floor((W - 30) / (tot * 6 + 1))), lines = [words];
      if (pitch < 7) { pitch = 7; const mx = Math.floor((W - 30) / pitch / 6); lines = [[]]; words.forEach(w => { const L = lines[lines.length - 1]; if (L.length && len(L.concat([w])) > mx) lines.push([w]); else L.push(w); }); }
      const cols = Math.floor((W - 30) / pitch), RW = 9, H = lines.length * RW * pitch + 30 + (lines.length - 1) * pitch;
      const bms = lines.map(L => { const cs = []; L.forEach((w, k) => { if (k) for (let i = 0; i < 6; i++) cs.push(0); [...w.w].forEach(ch => { const g = F57[ch] || F57['?']; for (let c = 0; c < 5; c++) { let m = 0; for (let r = 0; r < 7; r++) if (parseInt(g.substr(r * 2, 2), 16) & (16 >> c)) m |= 1 << r; cs.push(m ? (w.hi ? -m : m) : 0); } cs.push(0); }); }); return cs; });
      const n = $('<div class="el fx-led"><canvas width="' + W + '" height="' + H + '"></canvas></div>'), g = n.firstChild.getContext('2d'), sp = e.speed || 60;
      return { n, upd(lt) { g.clearRect(0, 0, W, H); g.fillStyle = C.ink; g.beginPath(); g.roundRect(0, 0, W, H, 14); g.fill();
        bms.forEach((bm, li) => { const tw = bm.length, fin = 0, l0 = lt - li * 0.35, off = Math.max(fin, Math.round(cols - l0 * sp)), fl = l0 - cols / sp, y0 = 15 + li * (RW + 1) * pitch;
          for (let c = 0; c < cols; c++) for (let r = 0; r < RW; r++) { const k = c - off, m = k >= 0 && k < tw ? bm[k] : 0, on = r >= 1 && r <= 7 && m && (Math.abs(m) & (1 << (r - 1))), h = m < 0;
            g.fillStyle = on ? (h ? (fl > 0 && fl < 0.6 && Math.floor(fl * 10) % 2 ? C.mark : C.orange) : C.paper) : 'rgba(244,241,234,.08)'; g.beginPath(); g.arc(15 + c * pitch + pitch / 2, y0 + r * pitch + pitch / 2, pitch * (on ? 0.42 : 0.34), 0, TAU); g.fill(); } }); } }; } });

  // venn: due cerchi che scivolano fino a sovrapporsi; la lente si riempie d'arancio
  FX.add('els', 'venn', { desc: 'Two labelled circles slide together; the overlap fills orange with its own label, then a caption lands. Fields: a, b, mid, caption', from: 'venn-merge',
    build(e) { const W = 715, H = 430, r = 180, cy = 210, dx = 108, uid = 'vn' + Math.round(R('venn', e.a + e.b) * 1e6);
      const n = $('<div class="el fx-venn"><svg width="' + W + '" height="' + H + '" style="display:block"><defs><clipPath id="' + uid + '"><circle class="ca2" cx="0" cy="' + cy + '" r="' + r + '"/></clipPath></defs><circle class="ca" cy="' + cy + '" r="' + r + '" fill="rgba(31,79,209,.10)" stroke="' + C.ink + '" stroke-width="5"/><circle class="cb" cy="' + cy + '" r="' + r + '" fill="rgba(31,79,209,.10)" stroke="' + C.ink + '" stroke-width="5"/><circle class="lens" cy="' + cy + '" r="' + r + '" fill="' + C.orange + '" clip-path="url(#' + uid + ')"/><text class="ta" y="' + (cy + 12) + '" text-anchor="middle" font-family="Inter" font-weight="800" font-size="34" fill="' + C.ink + '">' + esc(e.a || '') + '</text><text class="tb" y="' + (cy + 12) + '" text-anchor="middle" font-family="Inter" font-weight="800" font-size="34" fill="' + C.ink + '">' + esc(e.b || '') + '</text><text class="tm" x="' + W / 2 + '" y="' + (cy + 10) + '" text-anchor="middle" font-family="Inter" font-weight="900" font-size="28" fill="#fff">' + esc(e.mid || '') + '</text></svg>' + (e.caption ? '<div class="cap">' + md(e.caption) + '</div>' : '') + '</div>');
      const q = s => n.querySelector(s), ca = q('.ca'), cb = q('.cb'), c2 = q('.ca2'), ln = q('.lens'), ta = q('.ta'), tb = q('.tb'), tm = q('.tm'), cap = q('.cap');
      return { n, upd(lt) { const p = E.outCubic(lt / 0.9), off = lerp(r + 4 - 6, dx, p), xa = W / 2 - off, xb = W / 2 + off; [ca, c2].forEach(c => c.setAttribute('cx', xa)); [cb, ln].forEach(c => c.setAttribute('cx', xb));
        ta.setAttribute('x', xa - r * 0.42); tb.setAttribute('x', xb + r * 0.42); const f = E.outCubic((lt - 0.8) / 0.4); ln.setAttribute('opacity', f); tm.setAttribute('opacity', f);
        if (cap) { const c = E.outCubic((lt - 1.1) / 0.4); cap.style.opacity = c; cap.style.transform = 'translateY(' + (1 - c) * 16 + 'px)'; } } }; } });

  // orbit: un centro e i suoi satelliti, uno per marker, con raggi che pulsano e corde fra vicini
  FX.add('els', 'orbit', { desc: 'A centre disc with satellites that join one per marker: spokes draw in, pulses travel along them, chords link neighbours. Fields: center, items [{label}], highlight, caption', from: 'chord-ring,ecosystem-constellation',
    build(e) { const W = 715, H = 690, cx = W / 2, cy = 330, Rr = 250, its = e.items || [], N = Math.max(1, its.length);
      const pos = k => { const a = -Math.PI / 2 + TAU * k / N; return [cx + Math.cos(a) * Rr, cy + Math.sin(a) * Rr]; };
      let h = '<circle cx="' + cx + '" cy="' + cy + '" r="' + Rr + '" fill="none" stroke="' + C.gray + '" stroke-width="3" stroke-dasharray="2 12" stroke-linecap="round"/><g class="ch"></g>';
      its.forEach((it, k) => { const [x, y] = pos(k), hi = k === e.highlight; h += '<g class="it"><line x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="' + (hi ? C.orange : C.blue) + '" stroke-width="4"/><circle class="pl" r="7" fill="' + (hi ? C.orange : C.blue) + '"/><g class="sat" transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"><circle r="44" fill="' + (hi ? C.orange : '#fff') + '" stroke="' + (hi ? C.orange : C.ink) + '" stroke-width="5"/><text y="' + (y > cy + 10 ? 82 : -60) + '" text-anchor="middle" font-family="Inter" font-weight="800" font-size="27" fill="' + C.ink + '">' + esc(it.label || '') + '</text><text y="11" text-anchor="middle" font-family="Anton" font-size="32" fill="' + (hi ? '#fff' : C.blue) + '">' + esc(it.short || String(k + 1)) + '</text></g></g>'; });
      h += '<circle cx="' + cx + '" cy="' + cy + '" r="96" fill="' + C.ink + '"/><text x="' + cx + '" y="' + (cy + 15) + '" text-anchor="middle" font-family="Anton" font-size="44" fill="' + C.paper + '">' + esc(e.center || '') + '</text>';
      const n = $('<div class="el fx-orbit"><svg width="' + W + '" height="' + H + '" style="display:block;overflow:visible">' + h + '</svg>' + (e.caption ? '<div class="cap">' + md(e.caption) + '</div>' : '') + '</div>');
      const G = [...n.querySelectorAll('.it')], ch = n.querySelector('.ch'), cap = n.querySelector('.cap');
      return { n, upd(lt, t, t0) { const st = its.map((it, k) => T(it.at, t0 + k * 0.5)); let chords = '';
        G.forEach((g_, k) => { const s = t - st[k], [x, y] = pos(k), ln = g_.children[0], pl = g_.children[1], sat = g_.children[2], a = E.inOutCubic(s / 0.35), b = U.spring(s - 0.25, { damping: 11, stiffness: 180 });
          g_.style.display = s < 0 ? 'none' : ''; ln.setAttribute('x2', lerp(cx, x, a).toFixed(1)); ln.setAttribute('y2', lerp(cy, y, a).toFixed(1)); sat.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + Math.max(0, b).toFixed(3) + ')');
          const ph = ((s - 0.6) / 1.6) % 1; pl.setAttribute('opacity', s > 0.6 ? Math.sin(Math.PI * ph).toFixed(3) : 0); pl.setAttribute('cx', lerp(cx, x, ph).toFixed(1)); pl.setAttribute('cy', lerp(cy, y, ph).toFixed(1));
          const k2 = (k + 1) % N; if (N > 2 && k2 !== k && t - st[k2] > 0.5 && s > 0.5) { const [x2, y2] = pos(k2); chords += '<path d="M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'Q' + cx + ' ' + cy + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '" fill="none" stroke="' + C.orange + '" stroke-width="3" opacity="' + (0.45 * E.outCubic((Math.min(t - st[k2], s) - 0.5) / 0.4)).toFixed(3) + '"/>'; } });
        ch.innerHTML = chords; if (cap) { const c = E.outCubic((t - st[N - 1] - 0.6) / 0.4); cap.style.opacity = c; } } }; } });

  // iso-bars: blocchi isometrici che salgono uno per marker, la torre evidenziata in arancio
  const shade = (hex, k) => { const v = parseInt(hex.slice(1), 16), f = c => Math.round(c * k); return 'rgb(' + f(v >> 16) + ',' + f((v >> 8) & 255) + ',' + f(v & 255) + ')'; };
  FX.add('els', 'iso-bars', { desc: 'Isometric block chart: one block per marker springs up to its value, the highlighted tower in orange. Fields: items [{label, value, display}], highlight, max, caption', from: 'isometric-build',
    build(e) { const W = 715, H = 560, its = e.items || [], N = Math.max(1, its.length), max = e.max || Math.max(...its.map(i => i.value || 0), 1), gap = (W - 60) / N, s = Math.min(92, gap / 1.85 / 0.866), a = s * 0.866, b = s * 0.5, by = H - 70, top = 120;
      let h = ''; its.forEach((it, k) => { h += '<g class="bk"><path class="l"/><path class="r"/><path class="t"/><text class="v" text-anchor="middle" font-family="Anton" font-size="46"></text><text class="lb" text-anchor="middle" font-family="Mono" font-size="22" fill="#6E6A62">' + esc(it.label || '') + '</text></g>'; });
      const n = $('<div class="el fx-iso"><svg width="' + W + '" height="' + H + '" style="display:block;overflow:visible"><path d="M10 ' + (by + 4) + 'H' + (W - 10) + '" stroke="' + C.line + '" stroke-width="4"/>' + h + '</svg>' + (e.caption ? '<div class="cap">' + md(e.caption) + '</div>' : '') + '</div>'), G = [...n.querySelectorAll('.bk')], cap = n.querySelector('.cap');
      return { n, upd(lt, t, t0) { G.forEach((g_, k) => { const it = its[k], s0 = T(it.at, t0 + k * 0.5), q = Math.max(0, U.spring(t - s0, { damping: 12, stiffness: 120 })), hi = k === e.highlight, hh = Math.max(2, (H - top - 70) * (it.value || 0) / max * q), x = 30 + gap * (k + 0.5), y = by - b;
          const base = hi ? C.orange : C.blue, pts = (arr) => 'M' + arr.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';
          const F = [x, y + b], Lp = [x - a, y], Rp = [x + a, y], Bk = [x, y - b], up = p => [p[0], p[1] - hh];
          g_.style.display = t < s0 ? 'none' : ''; const [l, r, tp, v, lb] = g_.children;
          l.setAttribute('d', pts([F, Lp, up(Lp), up(F)])); l.setAttribute('fill', hi ? shade(C.orange, 0.78) : C.ink); r.setAttribute('d', pts([F, Rp, up(Rp), up(F)])); r.setAttribute('fill', shade(base, 0.82)); tp.setAttribute('d', pts([up(F), up(Lp), up(Bk), up(Rp)])); tp.setAttribute('fill', base);
          v.setAttribute('x', x); v.setAttribute('y', (y - b - hh - 16).toFixed(1)); v.setAttribute('fill', hi ? C.orange : C.ink); v.textContent = it.display != null ? (q > 0.7 ? it.display : '') : Math.round((it.value || 0) * Math.min(1, q)); v.setAttribute('opacity', clamp((t - s0 - 0.2) / 0.3));
          lb.setAttribute('x', x); lb.setAttribute('y', by + 44); });
        if (cap) { const c = E.outCubic((t - T(its[N - 1] && its[N - 1].at, t0 + (N - 1) * 0.5) - 0.7) / 0.4); cap.style.opacity = c; } } }; } });

  // frieze: fascia decorativa che si costruisce (forme Bauhaus che rotolano, tessere a quarto di disco, griglia Mondrian)
  FX.add('els', 'frieze', { desc: 'Decorative band that builds itself: Bauhaus shapes tumbling in, quarter-disc tiles, or a Mondrian split. Fields: style (bauhaus|tiles|mondrian), h', from: 'bauhaus-build,pattern-tile,mondrian-split',
    build(e) { const W = 715, H = e.h || 120, sty = e.style || 'bauhaus', cols = [C.blue, C.orange, C.ink, C.mark], n = $('<div class="el fx-frieze"><svg width="' + W + '" height="' + H + '" style="display:block;overflow:hidden"></svg></div>'), sv = n.firstChild;
      if (sty === 'mondrian') { const xs = [0, 0.18, 0.46, 0.63, 0.86, 1].map(v => v * W), ys = [0, 0.55, 1].map(v => v * H); let h = '';
        for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < 2; j++) { const c = R('mo', i * 2 + j); h += '<rect class="c" x="' + xs[i] + '" y="' + ys[j] + '" width="' + (xs[i + 1] - xs[i]) + '" height="' + (ys[j + 1] - ys[j]) + '" fill="' + (c < 0.25 ? C.blue : c < 0.45 ? C.orange : c < 0.55 ? C.mark : 'transparent') + '"/>'; }
        xs.slice(1, -1).forEach(x => h += '<rect class="v" x="' + (x - 4) + '" y="0" width="8" height="0" fill="' + C.ink + '"/>'); h += '<rect class="hz" x="0" y="' + (ys[1] - 4) + '" height="8" width="0" fill="' + C.ink + '"/>'; sv.innerHTML = h;
        const cs = [...sv.querySelectorAll('.c')], vs = [...sv.querySelectorAll('.v')], hz = sv.querySelector('.hz');
        return { n, upd(lt) { vs.forEach((v, k) => v.setAttribute('height', H * E.outCubic((lt - k * 0.08) / 0.3))); hz.setAttribute('width', W * E.inOutCubic((lt - 0.2) / 0.4)); cs.forEach((c, k) => c.setAttribute('opacity', E.outCubic((lt - 0.55 - k * 0.04) / 0.2))); } }; }
      const N = sty === 'tiles' ? Math.floor(W / (H / 2)) : Math.floor(W / H), S = sty === 'tiles' ? H / 2 : H; let h = '';
      if (sty === 'tiles') { for (let r = 0; r < 2; r++) for (let c = 0; c < N; c++) { const rot = ((c + r * 2) % 4) * 90, col = (c + r) % 3 === 0 ? C.orange : C.blue; h += '<g class="g" data-x="' + (c * S + S / 2) + '" data-y="' + (r * S + S / 2) + '" data-r="' + rot + '"><path d="M' + (-S / 2) + ' ' + (-S / 2) + 'h' + S + 'a' + S + ' ' + S + ' 0 0 1 ' + (-S) + ' ' + S + 'z" fill="' + col + '"/></g>'; } }
      else for (let c = 0; c < N; c++) { const k = Math.floor(R('bh', c) * 5), col = cols[c % 4], col2 = cols[(c + 2) % 4], s = S;
        const shp = k === 0 ? '<circle cx="0" cy="0" r="' + s / 2 + '" fill="' + col + '"/>' : k === 1 ? '<path d="M' + -s / 2 + ' ' + s / 2 + 'A' + s / 2 + ' ' + s / 2 + ' 0 0 1 ' + s / 2 + ' ' + s / 2 + 'Z" fill="' + col + '"/><rect x="' + -s / 2 + '" y="' + -s / 2 + '" width="' + s + '" height="' + s / 2 + '" fill="' + col2 + '" opacity=".0"/>' : k === 2 ? '<path d="M' + -s / 2 + ' ' + -s / 2 + 'h' + s + 'a' + s + ' ' + s + ' 0 0 1 ' + -s + ' ' + s + 'z" fill="' + col + '"/>' : k === 3 ? '<path d="M' + -s / 2 + ' ' + s / 2 + 'L0 ' + -s / 2 + 'L' + s / 2 + ' ' + s / 2 + 'Z" fill="' + col + '"/>' : '<rect x="' + -s / 2 + '" y="' + -s / 2 + '" width="' + s + '" height="' + s + '" fill="' + col + '"/><circle r="' + s / 4 + '" fill="' + C.paper + '"/>';
        h += '<g class="g" data-x="' + (c * (W / N) + W / N / 2) + '" data-y="' + S / 2 + '" data-r="0">' + shp + '</g>'; }
      sv.innerHTML = h; const gs = [...sv.querySelectorAll('.g')];
      return { n, upd(lt) { gs.forEach((g_, k) => { const x = +g_.dataset.x, y = +g_.dataset.y, r0 = +g_.dataset.r, s = lt - k * (sty === 'tiles' ? 0.035 : 0.12);
        if (sty === 'tiles') { const q = U.spring(s, { damping: 12, stiffness: 200 }); g_.setAttribute('transform', 'translate(' + x + ' ' + y + ') rotate(' + (r0 + (1 - Math.min(q, 1.2)) * 90).toFixed(1) + ') scale(' + Math.max(0, Math.min(q, 1.08)).toFixed(3) + ')'); return; }
        const q = U.spring(s, { damping: 10, stiffness: 140 }), off = (1 - q); g_.setAttribute('transform', 'translate(' + (x - off * 140).toFixed(1) + ' ' + (y - Math.max(0, off) * 30).toFixed(1) + ') rotate(' + (-off * 180).toFixed(1) + ')'); g_.setAttribute('opacity', s > 0 ? 1 : 0); }); } }; } });

  // squiggle: linea divisoria che si disegna ondeggiando e poi si calma
  FX.add('els', 'squiggle', { desc: 'Divider line that draws itself while its wave swims forward, then calms to a gentle ripple. Fields: w (0-1), tint, label', from: 'squiggle,fourier-sum',
    build(e) { const W = Math.round(715 * (e.w || 0.6)), col = C[e.tint || 'orange'] || C.orange, n = $('<div class="el fx-sq"><svg width="' + W + '" height="56" style="display:block;overflow:visible"><path fill="none" stroke="' + col + '" stroke-width="7" stroke-linecap="round"/></svg>' + (e.label ? '<div class="lab">' + esc(e.label) + '</div>' : '') + '</div>'), pa = n.querySelector('path');
      return { n, upd(lt) { const p = E.outQuart(lt / 0.7), calm = E.inOutCubic((lt - 0.2) / 1.2), A = 16 - 11 * calm, ph = lt * 5 * (1 - 0.7 * calm); let d = '';
        for (let x = 0; x <= W * p; x += 4) { const tp = Math.min(1, x / 40, (W * p - x) / 40 + 0.3); d += (x ? 'L' : 'M') + x.toFixed(1) + ' ' + (28 + A * tp * Math.sin(x / 48 * TAU - ph)).toFixed(1); } pa.setAttribute('d', d); } }; } });
})();
