// GG Motion — entrate (loghi e altri elementi) e stili dei sottotitoli.
// Idee riprese dalle categorie "logo-stings" e "captions" di Remocn (https://github.com/Remocn/remocn, MIT,
// vedi LICENSE-remocn.txt), riscritte in JavaScript semplice per il motore dei reel.
//
// enter: draw(node, lt, e). Se il nodo e' un elemento `logos` (.lgr) ogni logo (.lgo) entra da solo, al suo
//   marker (e.at[k]); altrimenti entra il nodo intero. Opzioni facoltative sull'elemento: vedi `desc`.
// kar:   draw(kar, words, t). Gli span delle parole restano figli diretti di #kar (il motore li conta).
(() => {
  const C = FX.C, U = FX.u, E = U.E, cl = U.clamp, lerp = U.lerp;
  const S = (t, d, k, m) => U.spring(t, { damping: d, stiffness: k, mass: m });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const px = v => v.toFixed(1) + 'px';

  FX.css(`
.fx-ent{position:relative;isolation:isolate}
.fx-u{opacity:var(--o,1)!important;transform:var(--tf,none)!important;position:relative}
.fx-ov{position:absolute;pointer-events:none}
.fx-ov svg{position:absolute;left:0;top:0;overflow:visible}
.fx-ls-pc{position:absolute;inset:0;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center}
.fx-ls-pc img{width:80%;height:80%;object-fit:contain}
.fx-ls-g{display:inline-grid!important}
.fx-ls-g>i{grid-area:1/1;font-style:normal}
.fx-ls-c>i{font-style:normal}
`);

  // ---------------------------------------------------------------- ENTER: infrastruttura
  // tempo relativo del logo k rispetto all'inizio dell'elemento (marker e.at[k]; T e' la funzione del motore)
  const rel = (e, k) => {
    const a = (e.at || [])[k];
    try {
      if (a != null && typeof T === 'function') {
        const x = T(a, null); const b = e.id != null ? T(e.id, null) : T((e.at || [])[0], null);
        if (x != null && b != null) return Math.max(0, x - b);
      }
    } catch (_) {}
    return k * 0.3;
  };
  const units = (node, lt, e) => {
    const ls = node.classList.contains('lgr') ? [...node.querySelectorAll(':scope > .lgo')] : [];
    if (!ls.length) return [{ el: node, node, lt, k: 0, n: 1, logo: false, w: node.offsetWidth, h: node.offsetHeight, x0: 0, room: 0 }];
    const W = node.clientWidth;
    return ls.map((el, k) => ({ el, node, lt: lt - rel(e, k), k, n: ls.length, logo: true, w: el.offsetWidth, h: el.offsetHeight,
      x0: el.offsetLeft, y0: el.offsetTop, room: Math.max(0, W - el.offsetLeft - el.offsetWidth) }));
  };
  const hide = host => host.querySelectorAll(':scope > .fx-ov').forEach(d => { d.style.display = 'none'; });
  const img0 = el => el.querySelector(':scope > img');
  const base = u => {
    const el = u.el; el.classList.add('fx-u'); el.style.setProperty('--o', 1); el.style.setProperty('--tf', 'none');
    el.style.clipPath = ''; el.style.filter = ''; el.style.transformOrigin = '';
    if (u.logo) { el.style.background = ''; el.style.boxShadow = ''; el.style.borderRadius = ''; el.style.backfaceVisibility = ''; const im = img0(el); if (im) { im.style.opacity = ''; im.style.clipPath = ''; } }
    else [...el.children].forEach(c => { if (!c.classList.contains('fx-ov')) c.style.clipPath = ''; });
  };
  const set = (u, o, tf, origin) => { u.el.style.setProperty('--o', o); u.el.style.setProperty('--tf', tf || 'none'); if (origin) u.el.style.transformOrigin = origin; };
  // overlay DENTRO l'unita' (si muove e si ritaglia con lei)
  const ov = (u, key, init) => {
    let d = u.el.querySelector(':scope > .fx-ov.fx-ls-' + key);
    if (!d) { d = document.createElement('div'); d.className = 'fx-ov fx-ls-' + key; if (init) init(d); u.el.appendChild(d); }
    d.style.display = ''; return d;
  };
  // livello SOPRA l'unita' ma fuori dal suo ritaglio: per i loghi e' figlio del nodo, posizionato sul logo
  const layer = (u, key, z, init) => {
    const host = u.logo ? u.node : u.el; const cls = 'fx-ls-' + key + '-' + u.k;
    let d = host.querySelector(':scope > .' + cls);
    if (!d) { d = document.createElement('div'); d.className = 'fx-ov ' + cls; if (init) init(d); host.appendChild(d); }
    d.style.cssText = 'position:absolute;pointer-events:none;left:' + (u.logo ? u.x0 : 0) + 'px;top:' + (u.logo ? u.y0 : 0) + 'px;width:' + u.w + 'px;height:' + u.h + 'px;z-index:' + (z == null ? 2 : z);
    return d;
  };
  // livello del nodo intero (per i loghi: la riga)
  const nlayer = (node, key, z, init) => {
    let d = node.querySelector(':scope > .fx-ls-' + key);
    if (!d) { d = document.createElement('div'); d.className = 'fx-ov fx-ls-' + key; if (init) init(d); node.appendChild(d); }
    d.style.cssText = 'position:absolute;pointer-events:none;left:0;top:0;width:' + node.clientWidth + 'px;height:' + node.clientHeight + 'px;z-index:' + (z == null ? 2 : z);
    return d;
  };
  const svgIn = (d, inner) => { if (!d.firstChild) d.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">' + inner + '</svg>'; const s = d.firstChild; s.setAttribute('width', d.style.width); s.setAttribute('height', d.style.height); return s; };
  const poly = pts => 'polygon(' + pts.map(p => px(p[0]) + ' ' + px(p[1])).join(',') + ')';
  // ritaglio di rivelazione in coordinate dell'unita' (null = niente ritaglio). Per un nodo generico si ritagliano i figli.
  const clip = (u, pts) => {
    if (u.logo) { u.el.style.clipPath = pts ? poly(pts) : ''; return; }
    [...u.el.children].forEach(c => { if (c.classList.contains('fx-ov')) return; c.style.clipPath = pts ? poly(pts.map(p => [p[0] - c.offsetLeft, p[1] - c.offsetTop])) : ''; });
  };
  const M = 30; // margine per non tagliare ombre e anelli quando il ritaglio tocca il bordo
  const rect = (u, x0, y0, x1, y1) => { if (x0 <= 0) x0 = -M; if (y0 <= 0) y0 = -M; if (x1 >= u.w) x1 = u.w + M; if (y1 >= u.h) y1 = u.h + M; if (x1 < x0) x1 = x0; if (y1 < y0) y1 = y0; return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]; };
  const NONE = [[0, 0], [0, 0], [0, 0]];

  const ENT = (name, def) => FX.add('enter', name, { desc: def.desc, from: def.from, draw(node, lt, e) {
    node.classList.add('fx-ent'); node.style.opacity = lt < 0 ? 0 : 1;
    hide(node);
    const us = units(node, lt, e);
    us.forEach(u => { if (u.logo) hide(u.el); base(u); if (u.lt < 0) { set(u, 0); return; } def.one(u, e); });
    if (def.node) def.node(node, lt, e, us);
  } });

  // ---------------------------------------------------------------- ENTER: effetti
  ENT('slam', { desc: 'Slams in from 1.5x with a short shake and an impact ring; banner:true slices an orange band in behind first', from: 'bass-drop,play-of-the-game',
    one(u, e) {
      const t = u.lt - (e.banner ? 0.18 : 0); if (t < 0) { set(u, 0); return; }
      const s0 = u.logo ? 1.55 : 1.12, s = t < 0.14 ? lerp(s0, 0.97, E.inCubic(t / 0.14)) : lerp(0.97, 1, E.outCubic((t - 0.14) / 0.16));
      const sh = t > 0.14 ? Math.exp(-(t - 0.14) * 14) : 0;
      const dx = 10 * sh * U.noise(t * 40, 'sx' + u.k), dy = 6 * sh * U.noise(t * 40, 'sy' + u.k);
      set(u, cl(t / 0.06), 'translate(' + px(dx) + ',' + px(dy) + ') scale(' + s + ')', u.logo && u.x0 > 40 ? 'center center' : 'left center');
      const q = (t - 0.14) / 0.45;
      if (u.logo && q > 0 && q < 1) { const r = layer(u, 'ring', 3); const g = u.logo ? 26 * E.outCubic(q) : 0;
        r.style.border = '6px solid ' + C.orange; r.style.borderRadius = u.logo ? '50%' : '14px'; r.style.boxSizing = 'border-box';
        r.style.opacity = 1 - q; r.style.transform = 'scale(' + (1 + g / u.w * 2) + ')'; }
    },
    node(node, lt, e) {
      if (!e.banner) return; const b = nlayer(node, 'banner', -1); const p = E.outExpo(lt / 0.32);
      b.style.top = (node.clientHeight * 0.2) + 'px'; b.style.height = (node.clientHeight * 0.6) + 'px'; b.style.background = C.orange;
      b.style.transform = 'skewY(-3deg)'; b.style.clipPath = 'inset(0 ' + ((1 - p) * 100) + '% 0 0)';
    } });

  const NEON = [[0, 1], [0.05, 0], [0.1, 0.9], [0.16, 0], [0.24, 1], [0.32, 0.15], [0.36, 1], [0.5, 0], [0.56, 1]];
  ENT('flicker', { desc: 'Flickers on like a neon tube (stutter, one drop-out, hold); mode:"beat" blinks in a fixed rhythm with small jumps instead', from: 'neon-sign,blink-cut',
    one(u, e) {
      const t = u.lt;
      if (e.mode === 'beat') { const i = Math.floor(t / 0.11); if (t >= 0.66) { set(u, 1); return; }
        const on = i % 2 === 0; const j = U.rnd('bk' + u.k, i); set(u, on ? 1 : 0, 'translate(' + px((j - 0.5) * 16) + ',0) scale(' + (1 + (on ? 0.05 : 0) * (1 - i / 6)) + ')'); return; }
      let o = 1; for (const [a, v] of NEON) if (t >= a) o = v; set(u, o);
    } });

  ENT('bounce', { desc: 'Drops from above and bounces with squash on each hit; for logos a line underneath dents under the impact (dent:false to hide it)', from: 'bounce-logo,gravity-grid',
    one(u, e) {
      const t = u.lt, H = u.logo ? 150 : 90, p = cl(t / 0.8), y = -H * (1 - E.outBounce(p));
      let sq = 0; [[1 / 2.75, 0.2], [2 / 2.75, 0.09], [2.5 / 2.75, 0.04], [1, 0.02]].forEach(([c, a]) => { sq = Math.max(sq, a * cl(1 - Math.abs(p - c) / 0.06)); });
      if (!u.logo) sq *= 0.3; set(u, cl(t / 0.12), 'translateY(' + px(y) + ') scale(' + (1 + sq * 0.6) + ',' + (1 - sq) + ')', u.logo ? 'center bottom' : 'left bottom');
      if (u.logo && e.dent !== false && t < 1.1) {
        const d = layer(u, 'dent', 1); d.style.top = (u.y0 + u.h + 10) + 'px'; d.style.height = '30px';
        const s = svgIn(d, '<path fill="none" stroke-width="4" stroke-linecap="round"/>');
        const dep = 26 * sq / 0.2 + 8 * (1 - p); const w = u.w;
        s.firstChild.setAttribute('d', 'M ' + (-0.1 * w) + ' 2 Q ' + (w / 2) + ' ' + (2 + dep * 2) + ' ' + (1.1 * w) + ' 2');
        s.firstChild.setAttribute('stroke', C.ink); d.style.opacity = cl((p - 0.2) / 0.15) * (1 - cl((t - 0.8) / 0.3));
      }
    } });

  ENT('brackets', { desc: 'Two orange brackets open from the centre and close around the logo or element; they stay on a single logo, fade on rows and elements (keep:true/false)', from: 'bracket-index',
    one(u, e) {
      const t = u.lt, p = S(t, 14, 160, 0.7), keep = e.keep != null ? e.keep : (u.logo && u.n === 1);
      const fade = keep ? 1 : 1 - cl((t - 1.0) / 0.3);
      if (fade > 0) {
        const W = 22, th = 6, out = u.logo ? 10 : -th, hw = u.w / 2;
        const off = lerp(hw - 4, -out, p); // distanza dal bordo dell'unita' verso l'interno
        ['L', 'R'].forEach(sd => { const b = layer(u, 'br' + sd, 3); b.style.top = ((u.logo ? u.y0 : 0) - (u.logo ? 10 : 0)) + 'px'; b.style.height = (u.h + (u.logo ? 20 : 0)) + 'px';
          b.style.width = W + 'px'; b.style.boxSizing = 'border-box'; b.style.border = th + 'px solid ' + C.orange; b.style.opacity = fade * cl(t / 0.08);
          if (sd === 'L') { b.style.borderRight = 'none'; b.style.left = ((u.logo ? u.x0 : 0) + off - W / 2 * (1 - p)) + 'px'; }
          else { b.style.borderLeft = 'none'; b.style.left = ((u.logo ? u.x0 : 0) + u.w - off - W + W / 2 * (1 - p)) + 'px'; } });
      }
      const g = cl(p); const x0 = half(u) * (1 - g), x1 = u.w - x0;
      clip(u, g >= 0.999 ? null : rect(u, x0, 0, x1, u.h)); set(u, cl(t / 0.1), u.logo ? 'scale(' + (0.8 + 0.2 * g) + ')' : 'none');
    } });
  function half(u) { return u.w / 2; }

  ENT('lockup', { desc: 'Logos glide in together from the right and lock with an orange × between them: club × sponsor, club × club', from: 'collab-lockup',
    one(u) {
      const t = u.lt, p = S(t, 22, 170, 0.9), d0 = u.logo ? Math.min(u.room, 160 + 50 * u.k) : 80;
      set(u, cl(t / 0.15), 'translateX(' + px(d0 * (1 - p)) + ')');
    },
    node(node, lt, e, us) {
      if (!us[0].logo) return;
      for (let k = 0; k < us.length - 1; k++) {
        const a = us[k], b = us[k + 1]; if (Math.abs(a.y0 - b.y0) > 5) continue;
        const q = S(b.lt - 0.35, 11, 220, 0.6); if (q <= 0) continue;
        const x = nlayer(node, 'x' + k, 3, d => { d.textContent = '×'; });
        x.style.width = 'auto'; x.style.height = 'auto';
        x.style.left = ((a.x0 + a.w + b.x0) / 2) + 'px'; x.style.top = (a.y0 + a.h / 2) + 'px';
        x.style.font = '900 52px/1 Inter'; x.style.color = C.orange; x.style.transform = 'translate(-50%,-55%) scale(' + q + ') rotate(' + ((1 - q) * 90) + 'deg)';
      }
    } });

  // ---- griglie su canvas: pixel / cells / ripple
  const smallImg = (im, N) => {
    im._fxs = im._fxs || {}; if (im._fxs[N]) return im._fxs[N];
    const c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d');
    const iw = im.naturalWidth || 1, ih = im.naturalHeight || 1, sc = Math.min(N * 0.8 / iw, N * 0.8 / ih);
    x.drawImage(im, (N - iw * sc) / 2, (N - ih * sc) / 2, iw * sc, ih * sc); im._fxs[N] = c; return c;
  };
  // per un elemento generico la tela sborda di 30 px in basso: i figli del motore entrano anche dal basso
  const canv = (u) => {
    const d = ov(u, 'cv', d => { d.appendChild(document.createElement('canvas')); }), H = u.h + (u.logo ? 0 : 30);
    d.style.cssText = 'position:absolute;left:0;top:0;width:' + u.w + 'px;height:' + H + 'px;z-index:3;overflow:hidden;border-radius:' + (u.logo ? '50%' : '0');
    const c = d.firstChild; if (c.width !== u.w) c.width = u.w; if (c.height !== H) c.height = H; const x = c.getContext('2d'); x.clearRect(0, 0, u.w, H); return x;
  };
  // ord(cx,cy,i) -> 0..1 ordine di comparsa delle celle; shape: 'sq' | 'squircle' | 'dot'
  const cells = (u, t, dur, cell, ord, shape, col) => {
    const x = canv(u), nx = Math.ceil(u.w / cell), ny = Math.ceil((u.h + (u.logo ? 0 : 30)) / cell);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const o = ord(i / Math.max(1, nx - 1), j / Math.max(1, ny - 1), j * nx + i), q = (t / dur - o * 0.65) / 0.35;
      if (q >= 1) continue; const X = i * cell, Y = j * cell;
      if (q < 0) { x.fillStyle = u.logo ? C.paper : C.paper; x.fillRect(X, Y, cell + 0.5, cell + 0.5); continue; }
      const s = cell * (shape === 'sq' ? 1 : 0.92) * (1 - E.inCubic(q)); x.fillStyle = q < 0.35 ? (col || C.blue) : C.blue; x.globalAlpha = shape === 'sq' ? 1 - q : 1;
      const cx = X + cell / 2, cy = Y + cell / 2;
      if (shape === 'dot') { x.beginPath(); x.arc(cx, cy, s / 2, 0, 6.2832); x.fill(); }
      else if (shape === 'squircle') { const r = s * 0.32; x.beginPath(); x.roundRect ? x.roundRect(cx - s / 2, cy - s / 2, s, s, r) : x.rect(cx - s / 2, cy - s / 2, s, s); x.fill(); }
      else x.fillRect(cx - s / 2, cy - s / 2, s, s);
      x.globalAlpha = 1;
    }
    return x;
  };

  ENT('pixel', { desc: 'Logos resolve from coarse pixels to sharp (style:"dots" = LED dot matrix); other elements are rebuilt from random pixel blocks', from: 'quadtree-mark,cta-collapse-mark,glyph-block-decode,glyph-matrix',
    one(u, e) {
      const t = u.lt, im = u.logo && img0(u.el);
      if (!u.logo) { if (t < 0.85) cells(u, t, 0.75, 36, (a, b, i) => U.rnd('px', i), 'sq', C.blue); return; }
      if (t >= 0.66 || !im || !im.complete || !im.naturalWidth) { if (t < 0.66 && im) im.style.opacity = 0; return; }
      const x = canv(u); im.style.opacity = 0; x.fillStyle = '#fff'; x.fillRect(0, 0, u.w, u.h);
      if (e.style === 'dots') {
        const N = t < 0.2 ? 10 : t < 0.4 ? 16 : 26, sm = smallImg(im, N), dt = sm.getContext('2d').getImageData(0, 0, N, N).data, c = u.w / N;
        for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const k = (j * N + i) * 4, a = dt[k + 3] / 255; if (a < 0.08) continue;
          const lum = (dt[k] + dt[k + 1] + dt[k + 2]) / 765; if (lum > 0.93) continue;
          const hop = cl((t - 0.05 - U.rnd('dm', i + j * N) * 0.15) / 0.12);
          x.fillStyle = 'rgb(' + dt[k] + ',' + dt[k + 1] + ',' + dt[k + 2] + ')'; x.beginPath(); x.arc((i + 0.5) * c, (j + 0.5) * c - (1 - E.outBack(hop)) * 10, c * 0.42 * a * hop, 0, 6.2832); x.fill(); }
      } else {
        const N = Math.round(4 * Math.pow(2, t / 0.15)), sm = smallImg(im, Math.min(N, 96));
        x.imageSmoothingEnabled = false; x.drawImage(sm, 0, 0, u.w, u.h);
      }
      set(u, 1, 'scale(' + (0.9 + 0.1 * E.outBack(cl(t / 0.3))) + ')');
    } });

  ENT('cells', { desc: 'A diagonal wave of blue rounded cells sweeps across and leaves the logo or element behind', from: 'squircle-wave',
    one(u) { const t = u.lt; if (t >= 0.95) return; cells(u, t, 0.85, u.logo ? 15 : 30, (a, b) => a * 0.75 + b * 0.25, 'squircle', C.orange); } });

  ENT('logo-ripple', { desc: 'Dots ripple outward from the centre with two rings and light the logo or element up', from: 'ripple-mark',
    one(u) {
      const t = u.lt; if (t >= 1.0) return;
      const x = cells(u, t, 0.85, u.logo ? 12 : 22, (a, b) => Math.min(1, Math.hypot(a - 0.5, (b - 0.5) * (u.h / u.w)) * 2), 'dot', u.logo ? C.orange : C.blue);
      if (!u.logo) return; const R = Math.hypot(u.w, u.h) / 2; x.lineWidth = 4; x.strokeStyle = C.orange;
      [0, 0.16].forEach(d => { const q = (t - d) / 0.6; if (q <= 0 || q >= 1) return; x.globalAlpha = 1 - q; x.beginPath(); x.arc(u.w / 2, u.h / 2, R * E.outCubic(q), 0, 6.2832); x.stroke(); });
      x.globalAlpha = 1;
    } });

  const SHAPES = [[0, '6%', 45, 0.32, C.blue], [0.14, '24%', -20, 0.55, C.orange], [0.28, '36%', 15, 0.78, C.ink], [0.42, '50%', 0, 1, '#fff']];
  ENT('morph', { desc: 'The badge cuts through shapes and colours on the beat (diamond, square, squircle) and lands as the round logo; elements open through morphing masks', from: 'shape-morph-o,dynamic-letter',
    one(u) {
      const t = u.lt; let i = 0; SHAPES.forEach((s, k) => { if (t >= s[0]) i = k; });
      const cur = SHAPES[i], prv = SHAPES[Math.max(0, i - 1)], q = S(t - cur[0], 12, 260, 0.5);
      if (u.logo) {
        const sc = lerp(i ? prv[3] : 0, cur[3], q), rot = lerp(prv[2], cur[2], cl(q));
        set(u, 1, 'rotate(' + rot + 'deg) scale(' + sc + ')');
        if (i < 3) { u.el.style.background = cur[4]; u.el.style.borderRadius = cur[1]; u.el.style.boxShadow = 'none'; const im = img0(u.el); if (im) im.style.opacity = 0; }
        else { const im = img0(u.el); if (im) im.style.opacity = cl((t - 0.42) / 0.1); }
        return;
      }
      const W = u.w, H = u.h, cx = W / 2, cy = H / 2, R = Math.hypot(W, H) / 2;
      const fr = [0.08, 0.3, 0.6, 1.05][i], frp = [0, 0.08, 0.3, 0.6][i], r = R * lerp(frp, fr, cl(q)), sides = [4, 4, 6, 40][i], rot = [45, 0, 15, 0][i] * Math.PI / 180;
      if (i === 3 && q >= 0.99) { clip(u, null); return; }
      const pts = []; for (let k = 0; k < sides; k++) { const a = rot + k / sides * Math.PI * 2; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
      clip(u, pts);
    } });

  ENT('sweep', { desc: 'An orange bar of light sweeps left to right and reveals the logo or element as it passes, with a warm trail', from: 'first-light,light-signature,introducing,noise-forge-sting',
    one(u) {
      const t = u.lt, x = E.inOutCubic(t / 0.6) * u.w;
      clip(u, t >= 0.6 ? null : rect(u, 0, 0, x, u.h));
      const o = 1 - cl((t - 0.6) / 0.2); if (o <= 0) return;
      const tr = layer(u, 'tr', 3); tr.style.left = (parseFloat(tr.style.left) + Math.max(0, x - 80)) + 'px'; tr.style.width = Math.min(80, x) + 'px';
      tr.style.background = 'linear-gradient(90deg,rgba(255,106,19,0),rgba(255,106,19,.35))'; tr.style.opacity = o;
      const b = layer(u, 'bar', 4); b.style.left = (parseFloat(b.style.left) + Math.max(0, x - 6)) + 'px'; b.style.width = '6px'; b.style.top = (parseFloat(b.style.top) - 10) + 'px'; b.style.height = (u.h + 20) + 'px';
      b.style.background = C.orange; b.style.opacity = o;
    } });

  ENT('flare', { desc: 'A point stretches into a horizontal orange line that opens up into the logo or element; noise:true starts it as a noisy scope trace that calms down', from: 'anamorphic-flare,signal-resolve',
    one(u, e) {
      const t = u.lt, g = E.outExpo(t / 0.3), o = E.outCubic((t - 0.28) / 0.35), h2 = u.h / 2;
      clip(u, o >= 1 ? null : rect(u, 0, h2 * (1 - o), u.w, h2 * (1 + o) + (o > 0 ? 0 : 0)));
      if (o <= 0) clip(u, NONE);
      const lo = 1 - cl((t - 0.5) / 0.25); if (lo <= 0) return;
      const d = layer(u, 'ln', 4); const s = svgIn(d, '<polyline fill="none" stroke-width="4" stroke-linejoin="round"/>');
      const A = e.noise ? 22 * (1 - cl(t / 0.45)) : 0, x0 = u.w / 2 * (1 - g), x1 = u.w / 2 * (1 + g), n = 48, pts = [];
      const yc = h2 * (1 - o);
      for (let i = 0; i <= n; i++) { const xx = lerp(x0, x1, i / n); const y = yc + A * (0.6 * U.noise(i * 0.5 + t * 30, 'sg') + 0.4 * Math.sin(i * 1.3 + t * 50)); pts.push(xx.toFixed(1) + ',' + y.toFixed(1)); }
      const pl = s.firstChild; pl.setAttribute('points', pts.join(' ')); pl.setAttribute('stroke', C.orange); d.style.opacity = lo;
      if (o > 0) { const d2 = layer(u, 'ln2', 4); d2.style.top = (parseFloat(d2.style.top) + h2 * (1 + o) - 2) + 'px'; d2.style.height = '4px'; d2.style.background = C.orange; d2.style.opacity = lo; }
    } });

  ENT('flip', { desc: 'Logos spin in like a tossed coin (axis:"x" flips them like a split-flap); elements flip down from the top edge', from: 'flip-sting,split-match',
    one(u, e) {
      const t = u.lt;
      if (u.logo) { const a = 540 * (1 - E.outCubic(t / 0.9)); u.el.style.backfaceVisibility = 'hidden';
        set(u, cl(t / 0.05), 'perspective(700px) ' + (e.axis === 'x' ? 'rotateX(' : 'rotateY(') + a + 'deg)'); return; }
      const p = S(t, 12, 120, 0.8); set(u, cl(t / 0.12), 'perspective(1400px) rotateX(' + (-95 * (1 - p)) + 'deg)', 'center top');
    } });

  ENT('flood', { desc: 'A blue disc floods out behind the logo and drains away as it pops in; elements get a blue panel that wipes across and off', from: 'flood-sting',
    one(u) {
      const t = u.lt;
      if (u.logo) {
        const g = E.outCubic(t / 0.3) * (1 - E.inCubic((t - 0.55) / 0.35)); if (g > 0) {
          const D = u.w * 1.3, d = layer(u, 'disc', -1), cx = Math.max(u.x0 + u.w / 2, D / 2);
          d.style.left = (cx - D / 2) + 'px'; d.style.top = (u.y0 + u.h / 2 - D / 2) + 'px'; d.style.width = D + 'px'; d.style.height = D + 'px';
          d.style.borderRadius = '50%'; d.style.background = C.blue; d.style.transform = 'scale(' + g + ')'; }
        const p = S(t - 0.18, 12, 200, 0.6); set(u, t < 0.18 ? 0 : 1, 'scale(' + (0.5 + 0.5 * p) + ')'); return;
      }
      const a = E.inOutCubic(t / 0.3), b = E.inOutCubic((t - 0.36) / 0.3);
      if (b < 1) { const d = layer(u, 'panel', 5); d.style.background = C.blue; d.style.transformOrigin = b > 0 ? 'right center' : 'left center'; d.style.transform = 'scaleX(' + (b > 0 ? 1 - b : a) + ')'; }
      clip(u, t < 0.32 ? NONE : null);
    } });

  ENT('zoom', { desc: 'Starts giant and faint and settles to size on a spring (logos grow only to the right, inside the column); elements settle from 0.86', from: 'giant-mark-backdrop,sequel-numeral',
    one(u) {
      const t = u.lt, p = S(t, 14, 120, 0.9);
      if (u.logo) { const s0 = Math.min(2.4, (u.room + u.w) / u.w); set(u, lerp(0.15, 1, cl(t / 0.45)), 'scale(' + lerp(s0, 1, p) + ')', 'left center'); return; }
      set(u, cl(t / 0.25), 'scale(' + lerp(0.86, 1, p) + ')', 'left top');
    } });

  ENT('inflate', { desc: 'A flat sliver puffs up like a balloon, overshoots and wobbles into shape', from: 'inflate',
    one(u) {
      const t = u.lt, pf = S(t, 8, 150, 0.6), sy = lerp(u.logo ? 0.04 : 0.25, 1, pf), sx = lerp(1.12, 1, cl(t / 0.25)) * (1 - 0.5 * (pf - 1));
      set(u, cl(t / 0.08), 'scale(' + Math.min(sx, 1.12) + ',' + sy + ')', u.logo ? 'center bottom' : 'left bottom');
    } });

  const blob = (cx, cy, R, wob, t, seed) => { const pts = []; for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; const r = R * (1 + wob * U.noise(i * 0.55 + t * 4, seed)); pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return pts; };
  ENT('bloom', { desc: 'A drop of ink falls and blooms outward in an uneven blob that reveals the logo or element', from: 'ink-bloom',
    one(u) {
      const t = u.lt, cx = u.logo ? u.w / 2 : Math.min(u.w / 2, 160), cy = u.h / 2;
      const f = E.inCubic(t / 0.22); if (t < 0.24) { const d = layer(u, 'drop', 4); d.style.left = (parseFloat(d.style.left) + cx - 10) + 'px'; d.style.top = (parseFloat(d.style.top) + lerp(-90, cy - 10, f)) + 'px';
        d.style.width = '20px'; d.style.height = (20 + 10 * f) + 'px'; d.style.borderRadius = '50%'; d.style.background = C.ink; }
      const p = E.inOutCubic((t - 0.2) / 0.7); if (p >= 1) return;
      const R = (Math.hypot(Math.max(cx, u.w - cx), Math.max(cy, u.h - cy)) + 30) * p, pts = blob(cx, cy, R, 0.16 * (1 - p), t, 'bl' + u.k);
      clip(u, p > 0 ? pts : NONE);
      if (p > 0) { const d = layer(u, 'ring', 4); const s = svgIn(d, '<polygon fill="none" stroke-width="5"/>'); s.firstChild.setAttribute('points', pts.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' '));
        s.firstChild.setAttribute('stroke', C.ink); d.style.opacity = 1 - p; d.style.overflow = 'hidden'; if (u.logo) d.style.borderRadius = '50%'; }
    } });

  ENT('liquid', { desc: 'A drop falls into the empty outline and the logo or element fills up from the bottom with a sloshing surface', from: 'liquid-fill',
    one(u) {
      const t = u.lt, p = E.inOutCubic((t - 0.18) / 0.6);
      if (u.logo && p < 1) { const r = layer(u, 'out', 1); r.style.borderRadius = '50%'; r.style.boxShadow = '0 0 0 4px ' + C.line + ',6px 6px 0 ' + C.blue; r.style.opacity = cl(t / 0.1); }
      if (t < 0.22) { const cx = u.w / 2, f = E.inCubic(t / 0.2), d = layer(u, 'drop', 4);
        d.style.left = (parseFloat(d.style.left) + cx - 9) + 'px'; d.style.top = (parseFloat(d.style.top) + lerp(-70, u.h - 26, f)) + 'px'; d.style.width = '18px'; d.style.height = '22px'; d.style.borderRadius = '50% 50% 50% 50% / 60% 60% 40% 40%'; d.style.background = C.blue; }
      if (p >= 1) return;
      const L = u.h * (1 - p), A = 9 * (1 - p) * cl(p * 6), pts = [];
      for (let i = 0; i <= 30; i++) { const x = lerp(-M, u.w + M, i / 30); pts.push([x, L + A * Math.sin(x / u.w * 9.4 + t * 13)]); }
      clip(u, p > 0 ? pts.concat([[u.w + M, u.h + M], [-M, u.h + M]]) : NONE);
      if (p > 0) { const d = layer(u, 'crest', 4); if (u.logo) { d.style.borderRadius = '50%'; d.style.overflow = 'hidden'; }
        const s = svgIn(d, '<polyline fill="none" stroke-width="4"/>'); s.firstChild.setAttribute('points', pts.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ')); s.firstChild.setAttribute('stroke', C.blue); }
    } });

  ENT('trace', { desc: 'An orange pen traces the outline (ring for logos, frame for elements) and the content inks in; guides:true first draws blueprint construction lines', from: 'light-trail-write,heat-trace,logo-construct',
    one(u, e) {
      const t0 = u.lt, g = e.guides ? 0.3 : 0, t = t0 - g;
      if (e.guides && t0 < 1.0 + g) {
        const d = layer(u, 'gd', 3), W = u.w, H = u.h, ex = u.logo ? 10 : 0;
        const s = svgIn(d, '<g fill="none" stroke-width="2"><line/><line/><circle stroke-dasharray="6 6"/><rect stroke-dasharray="6 6"/></g>'); const gg = s.firstChild; gg.setAttribute('stroke', C.blue);
        const q = E.outCubic(t0 / 0.3), [l1, l2, ci, re] = gg.children;
        l1.setAttribute('x1', W / 2 - (W / 2 + ex) * q); l1.setAttribute('x2', W / 2 + (W / 2 + ex) * q); l1.setAttribute('y1', H / 2); l1.setAttribute('y2', H / 2);
        l2.setAttribute('y1', H / 2 - (H / 2 + ex) * q); l2.setAttribute('y2', H / 2 + (H / 2 + ex) * q); l2.setAttribute('x1', u.logo ? W / 2 : 0); l2.setAttribute('x2', u.logo ? W / 2 : 0);
        if (u.logo) { ci.setAttribute('cx', W / 2); ci.setAttribute('cy', H / 2); ci.setAttribute('r', W * 0.31 * q); re.setAttribute('width', 0); }
        else { re.setAttribute('x', 2); re.setAttribute('y', 2); re.setAttribute('width', Math.max(0, (W - 4) * q)); re.setAttribute('height', Math.max(0, H - 4)); ci.setAttribute('r', 0); }
        d.style.opacity = 0.7 * (1 - cl((t0 - 0.75 - g) / 0.3));
      }
      if (t < 0) { set(u, 0); return; }
      const dr = E.inOutCubic(t / 0.55), so = 1 - cl((t - 0.6) / 0.25);
      if (so > 0) { const d = layer(u, 'pen', 4); const s = svgIn(d, '<path fill="none" stroke-width="5" stroke-linecap="round"/><circle r="7"/>');
        const [pa, dot] = s.children; let D;
        if (u.logo) { const r = u.w / 2 + 2, c = u.w / 2; D = 'M ' + c + ' ' + (c - r) + ' a ' + r + ' ' + r + ' 0 1 1 -0.01 0'; }
        else { const W = u.w - 4, H = u.h - 4, R = 14; D = 'M 2 ' + (2 + R) + ' a ' + R + ' ' + R + ' 0 0 1 ' + R + ' ' + (-R) + ' h ' + (W - 2 * R) + ' a ' + R + ' ' + R + ' 0 0 1 ' + R + ' ' + R + ' v ' + (H - 2 * R) + ' a ' + R + ' ' + R + ' 0 0 1 ' + (-R) + ' ' + R + ' h ' + (-(W - 2 * R)) + ' a ' + R + ' ' + R + ' 0 0 1 ' + (-R) + ' ' + (-R) + ' Z'; }
        if (pa.getAttribute('d') !== D) pa.setAttribute('d', D); const L = pa.getTotalLength();
        pa.setAttribute('stroke', C.orange); pa.setAttribute('stroke-dasharray', L + ' ' + L); pa.setAttribute('stroke-dashoffset', L * (1 - dr));
        const P = pa.getPointAtLength(L * dr); dot.setAttribute('cx', P.x); dot.setAttribute('cy', P.y); dot.setAttribute('fill', C.orange); dot.style.opacity = dr < 1 ? 1 : 0;
        d.style.opacity = so; }
      const c = cl((t - 0.38) / 0.3); set(u, c, 'scale(' + (0.95 + 0.05 * E.outCubic(c)) + ')');
    } });

  ENT('orbit', { desc: 'Three brand-colour moons ride shrinking tilted orbits into the centre, a ring flashes and the logo or element springs into place', from: 'orbit-lock',
    one(u) {
      const t = u.lt, cx = u.w / 2, cy = u.h / 2, RX = u.logo ? Math.min(90, u.x0 + u.w / 2 - 8, u.room + u.w / 2 - 8) : u.w * 0.42, RY = u.logo ? 34 : Math.min(60, u.h * 0.4), k = cl(t / 0.55);
      if (t < 0.55) [C.orange, C.blue, C.ink].forEach((c, i) => {
        const r = 1 - E.inCubic(k), a = i * 2.094 + 6 * k + 9 * k * k, tilt = -0.35 + i * 0.35;
        const x = r * RX * Math.cos(a), y = r * RY * Math.sin(a); const X = cx + x * Math.cos(tilt) - y * Math.sin(tilt), Y = cy + x * Math.sin(tilt) + y * Math.cos(tilt);
        const d = layer(u, 'm' + i, 4); d.style.left = (parseFloat(d.style.left) + X - 8) + 'px'; d.style.top = (parseFloat(d.style.top) + Y - 8) + 'px'; d.style.width = '16px'; d.style.height = '16px'; d.style.borderRadius = '50%'; d.style.background = c; });
      const q = (t - 0.55) / 0.4;
      if (q > 0 && q < 1) { const d = layer(u, 'flash', 3); d.style.borderRadius = u.logo ? '50%' : '16px'; d.style.boxSizing = 'border-box'; d.style.border = '5px solid ' + C.orange;
        d.style.opacity = 1 - q; d.style.transform = 'scale(' + (u.logo ? lerp(0.4, 1.25, E.outCubic(q)) : lerp(0.9, 1, E.outCubic(q))) + ')'; }
      const p = S(t - 0.55, 11, 170, 0.7); set(u, t < 0.55 ? 0 : u.logo ? 1 : cl((t - 0.55) / 0.12), 'scale(' + (u.logo ? p : lerp(0.85, 1, p)) + ')', u.logo ? '' : 'left center');
    } });

  ENT('route', { desc: 'A dotted path flies a paper plane from stop to stop and each logo pops in as it lands (a career or transfer route); line:"metro" draws a solid transit line with stations instead', from: 'paper-plane,transit-lines',
    one(u) {
      const t = u.lt - 0.25;
      if (u.logo) { if (t < 0) { set(u, 0); return; } const p = S(t, 10, 220, 0.6); set(u, cl(t / 0.06), 'scale(' + (0.4 + 0.6 * p) + ')'); return; }
      const h = E.inOutCubic(u.lt / 0.7); clip(u, h >= 1 ? null : rect(u, 0, 0, h * u.w, u.h));
    },
    node(node, lt, e, us) {
      const metro = e.line === 'metro', d = nlayer(node, 'route', -1);
      const s = svgIn(d, '<polyline fill="none" stroke-linecap="round" stroke-linejoin="round"/><g/><path/>'); const [pl, st, pn] = s.children;
      let P, at;
      if (us[0].logo) { P = [[0, us[0].y0 + us[0].h / 2]].concat(us.map(v => [v.x0 + v.w / 2, v.y0 + v.h / 2])); at = [0].concat(us.map(v => lt - v.lt + 0.25)); }
      else { const y = node.clientHeight - 4; P = [[0, y], [node.clientWidth, y]]; at = [0, 0.7]; }
      // posizione della testa
      let hx = P[0][0], hy = P[0][1], seg = 0, done = lt >= at[at.length - 1]; const pts = [P[0]];
      for (let i = 1; i < P.length; i++) { const a0 = at[i - 1], a1 = at[i]; if (lt >= a1) { pts.push(P[i]); hx = P[i][0]; hy = P[i][1]; seg = i; continue; }
        if (lt > a0) { const q = E.inOutCubic((lt - a0) / Math.max(0.01, a1 - a0)); hx = lerp(P[i - 1][0], P[i][0], q); hy = lerp(P[i - 1][1], P[i][1], q) - Math.sin(q * Math.PI) * (metro ? 0 : 40); pts.push([hx, hy]); seg = i; }
        break; }
      pl.setAttribute('points', pts.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' '));
      pl.setAttribute('stroke', metro ? C.blue : C.orange); pl.setAttribute('stroke-width', metro ? 10 : 5); pl.setAttribute('stroke-dasharray', metro ? 'none' : '2 13');
      st.innerHTML = metro ? P.slice(1).filter((q, i) => lt >= at[i + 1] - 0.02).map(q => '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="12" fill="#fff" stroke="' + C.ink + '" stroke-width="5"/>').join('') : '';
      const fade = us[0].logo ? 1 - cl((lt - at[at.length - 1]) / 0.2) : 1 - cl((lt - 0.7) / 0.3);
      if (!metro && fade > 0) { const p0 = pts[Math.max(0, pts.length - 2)], ang = Math.atan2(hy - p0[1], hx - p0[0]) * 180 / Math.PI;
        pn.setAttribute('d', 'M 16 0 L -12 -11 L -6 0 L -12 11 Z'); pn.setAttribute('fill', C.ink); pn.setAttribute('transform', 'translate(' + hx + ',' + hy + ') rotate(' + (pts.length > 1 ? ang : 0) + ')'); pn.style.opacity = fade; }
      else pn.style.opacity = 0;
      if (!us[0].logo) d.style.opacity = metro ? 1 - cl((lt - 0.9) / 0.3) : 1 - cl((lt - 0.9) / 0.3);
      if (metro && !done) { /* testa: stazione in arrivo */ }
    } });

  ENT('gather', { desc: 'Scattered and tilted, the logos or the element fly together into place on a spring', from: 'photo-halo,word-burst-cards,title-converge',
    one(u) {
      const t = u.lt, p = S(t, 18, 160, 0.8), r = i => U.rnd('ga' + u.k, i);
      const dx = u.logo ? cl(lerp(-170, 170, r(1)), -u.x0, u.room) : 0, dy = u.logo ? lerp(-120, 120, r(2)) : lerp(40, 80, r(2)), rot = u.logo ? lerp(-35, 35, r(3)) : lerp(-3, 3, r(3));
      set(u, cl(t / 0.12), 'translate(' + px(dx * (1 - p)) + ',' + px(dy * (1 - p)) + ') rotate(' + (rot * (1 - p)) + 'deg) scale(' + lerp(0.75, 1, p) + ')');
    } });

  // pezzi del logo (puzzle / snap): copie del cerchio bianco con il logo, ritagliate
  const pieces = (u, n, clips) => {
    const src = (img0(u.el) || {}).src || '';
    const out = []; for (let i = 0; i < n; i++) { const d = ov(u, 'pc' + i, d => { d.innerHTML = '<div class="fx-ls-pc"><img src="' + src + '"></div>'; });
      d.style.cssText = 'position:absolute;inset:0;z-index:2;clip-path:' + clips[i]; out.push(d); }
    u.el.style.background = 'transparent'; u.el.style.boxShadow = 'none'; const im = img0(u.el); if (im) im.style.opacity = 0; return out;
  };
  const sparks = (u, q, n, r0, r1) => { if (q <= 0 || q >= 1) return; const d = layer(u, 'sp', 4); const s = svgIn(d, '<g stroke-width="5" stroke-linecap="round"></g>'); const g = s.firstChild; g.setAttribute('stroke', C.orange);
    let h = ''; for (let i = 0; i < n; i++) { const a = i / n * 6.2832 + 0.3, ra = r0 + (r1 - r0) * E.outCubic(q), rb = ra + 18 * (1 - q); h += '<line x1="' + (u.w / 2 + ra * Math.cos(a)) + '" y1="' + (u.h / 2 + ra * Math.sin(a)) + '" x2="' + (u.w / 2 + rb * Math.cos(a)) + '" y2="' + (u.h / 2 + rb * Math.sin(a)) + '"/>'; }
    g.innerHTML = h; d.style.opacity = 1 - q; };
  const QC = ['polygon(50% 50%,50% -5%,-5% -5%,-5% 50%)', 'polygon(50% 50%,50% -5%,105% -5%,105% 50%)', 'polygon(50% 50%,-5% 50%,-5% 105%,50% 105%)', 'polygon(50% 50%,105% 50%,105% 105%,50% 105%)'];
  ENT('puzzle', { desc: 'The logo arrives as four spinning pieces that snap together with sparks; elements fly in tilted and snap', from: 'puzzle-snap',
    one(u) {
      const t = u.lt;
      if (!u.logo) { const p = S(t, 9, 260, 0.5); set(u, cl(t / 0.1), 'translateY(' + px(60 * (1 - p)) + ') rotate(' + (-4 * (1 - p)) + 'deg)'); return; }
      if (t < 0.62) { const ps = pieces(u, 4, QC);
        ps.forEach((d, i) => { const q = S(t - i * 0.05, 12, 150, 0.6), sx = i % 2 ? 1 : -1, sy = i < 2 ? -1 : 1;
          let dx = sx * lerp(70, 120, U.rnd('pz' + u.k, i)); if (u.x0 + dx < 0) dx = -u.x0 * 0.5; if (dx > u.room) dx = u.room;
          const dy = sy * lerp(60, 110, U.rnd('pzy' + u.k, i)), r = sx * lerp(90, 200, U.rnd('pzr' + u.k, i));
          d.style.transform = 'translate(' + px(dx * (1 - q)) + ',' + px(dy * (1 - q)) + ') rotate(' + (r * (1 - q)) + 'deg)'; d.style.opacity = cl((t - i * 0.05) / 0.08); }); }
      sparks(u, (t - 0.55) / 0.3, 8, u.w / 2 + 6, u.w / 2 + 40);
    } });

  ENT('snap', { desc: 'The two halves of the logo slam together at a seam with a click; elements open from a centre seam with a flash and a shake', from: 'snap-click',
    one(u) {
      const t = u.lt, k = E.inCubic(t / 0.24), sh = t > 0.24 ? Math.exp(-(t - 0.24) * 16) : 0;
      if (u.logo) { if (t < 0.24) { const ps = pieces(u, 2, ['polygon(-5% -5%,105% -5%,105% 50%,-5% 50%)', 'polygon(-5% 50%,105% 50%,105% 105%,-5% 105%)']);
          ps[0].style.transform = 'translateY(' + px(-60 * (1 - k)) + ')'; ps[1].style.transform = 'translateY(' + px(60 * (1 - k)) + ')'; ps.forEach(d => { d.style.opacity = cl(t / 0.06); }); }
        set(u, 1, 'translateY(' + px(5 * sh * U.noise(t * 50, 'sn')) + ')');
      } else { clip(u, t < 0.24 ? rect(u, 0, u.h / 2 * (1 - k), u.w, u.h / 2 * (1 + k)) : null); if (t < 0.02) clip(u, NONE);
        set(u, 1, 'translateX(' + px(5 * sh * U.noise(t * 50, 'sn')) + ')'); }
      const q = (t - 0.24) / 0.3; if (q > 0 && q < 1) { const d = layer(u, 'seam', 4); d.style.top = (parseFloat(d.style.top) + u.h / 2 - 3) + 'px'; d.style.height = '6px'; d.style.background = C.orange;
        d.style.transform = 'scaleX(' + (1 - q * 0.3) + ')'; d.style.opacity = 1 - q; }
    } });

  ENT('spell', { desc: 'Logos drop in one at a time with dashes between them, then the row closes up and an orange line draws beneath; elements drop in and get the line', from: 'spell-out',
    one(u, e) {
      const t = u.lt, p = S(t, 12, 200, 0.6);
      let gx = 0; if (u.logo) { const last = u.lt + rel(e, u.k) - rel(e, u.n - 1); const close = E.inOutCubic((last - 0.6) / 0.35); u._close = close;
        const row = u.node.clientWidth, right = u.node.querySelector(':scope > .lgo:last-of-type'); const spare = right ? row - right.offsetLeft - right.offsetWidth : 0;
        gx = u.k * Math.min(40, spare / Math.max(1, u.n - 1)) * (1 - close); }
      set(u, cl(t / 0.08), 'translate(' + px(gx) + ',' + px(-70 * (1 - p)) + ')');
    },
    node(node, lt, e, us) {
      const lg = us[0].logo; const lastT = lg ? lt - us[us.length - 1].lt : 0, close = lg ? E.inOutCubic((lt - lastT - 0.6) / 0.35) : 1;
      if (lg) { const sp = Math.min(40, (node.clientWidth - us[us.length - 1].x0 - us[us.length - 1].w) / Math.max(1, us.length - 1));
        for (let k = 0; k < us.length - 1; k++) { const a = us[k], b = us[k + 1]; if (b.lt < 0.1 || close >= 1 || Math.abs(a.y0 - b.y0) > 5) continue;
          const d = nlayer(node, 'dash' + k, 3); d.style.width = '22px'; d.style.height = '7px'; d.style.background = C.ink;
          d.style.left = ((a.x0 + a.w + k * sp * (1 - close) + b.x0 + (k + 1) * sp * (1 - close)) / 2 - 11) + 'px'; d.style.top = (a.y0 + a.h / 2 - 3) + 'px'; d.style.opacity = cl((b.lt - 0.1) / 0.1) * (1 - close); } }
      const q = E.outCubic((lt - (lg ? lastT + 0.9 : 0.35)) / 0.45); if (q <= 0) return;
      const last = us[us.length - 1], W = lg ? last.x0 + last.w : node.clientWidth, Y = lg ? Math.max(...us.map(v => v.y0 + v.h)) + 22 : node.clientHeight + 8;
      const d = nlayer(node, 'ul', 1); d.style.top = Y + 'px'; d.style.height = '7px'; d.style.width = W + 'px'; d.style.background = C.orange; d.style.transformOrigin = 'left center'; d.style.transform = 'scaleX(' + q + ')';
    } });

  ENT('spotlight', { desc: 'The row or element sits in the dark while a spotlight searches, overshoots and lands on each logo in turn, then the house lights come up', from: 'spotlight',
    one(u) { const t = u.lt; if (u.logo) set(u, 1, 'scale(' + (0.92 + 0.08 * E.outCubic(t / 0.3)) + ')'); },
    node(node, lt, e, us) {
      const W = node.clientWidth, H = node.clientHeight, lg = us[0].logo, Rr = lg ? 100 : Math.min(260, Math.max(H, 140) * 0.75);
      const tg = us.map(v => [lg ? v.x0 + v.w / 2 : W / 2, lg ? v.y0 + v.h / 2 : H / 2, lt - v.lt]);
      let X = lerp(0.1 * W, 0.9 * W, E.inOutCubic(lt / 0.4)), Y = H * 0.5;
      if (lt > 0.4) { const l = S(lt - 0.4, 11, 120, 0.8); X = lerp(0.9 * W, tg[0][0], l); Y = tg[0][1]; }
      for (let k = 1; k < tg.length; k++) { const s0 = tg[k][2] + 0.4; if (lt > s0) { const l = S(lt - s0, 11, 120, 0.8); X = lerp(tg[k - 1][0], tg[k][0], l); Y = lerp(tg[k - 1][1], tg[k][1], l); } }
      const end = tg[tg.length - 1][2] + 1.0, o = 1 - cl((lt - end) / 0.35); if (o <= 0) return;
      const d = nlayer(node, 'spot', 5); d.style.top = '-16px'; d.style.height = (H + 32) + 'px';
      d.style.background = 'radial-gradient(circle at ' + px(X) + ' ' + px(Y + 16) + ',rgba(11,31,58,0) ' + px(Rr) + ',rgba(11,31,58,.88) ' + px(Rr + 34) + ')'; d.style.opacity = o * cl(lt / 0.08 + 0.6);
    } });

  ENT('unfold', { desc: 'A tight paper zigzag unfolds sideways into the flat logo or element, pleat shading fading as it opens', from: 'accordion-unfold',
    one(u) {
      const t = u.lt, p = S(t, 15, 70, 0.9), op = cl(p); set(u, cl(t / 0.1), 'scaleX(' + lerp(0.08, 1, p) + ')', u.logo ? 'center center' : 'left center');
      if (u.logo && op < 0.98) { const d = ov(u, 'pl'); const n = 6, sw = u.w / n; d.style.cssText = 'position:absolute;inset:0;z-index:3;border-radius:' + (u.logo ? '50%' : '0') + ';opacity:' + Math.pow(1 - op, 0.7) +
        ';background:repeating-linear-gradient(90deg,rgba(11,31,58,.28) 0,rgba(11,31,58,0) ' + px(sw) + ',rgba(11,31,58,.28) ' + px(sw * 2) + ')'; }
    } });

  // ---------------------------------------------------------------- KAR: stili dei sottotitoli
  const KAR = (name, def) => FX.add('kar', name, def);
  const spans = kar => [...kar.children];
  const ACT = (words, t) => { let a = -1; for (let i = 0; i < words.length; i++) if (t >= words[i].start) a = i; return a; };
  const IB = sp => { sp.style.display = 'inline-block'; };
  const lay = (sp, f) => { if (!sp._fxl) { sp._fxl = 1; sp.innerHTML = f(sp.textContent); } };
  const chars = w => Array.from(w).map(c => '<i>' + esc(c) + '</i>').join('');
  const org = (sp, kar) => { const x = sp.offsetLeft, w = sp.offsetWidth, W = kar.clientWidth; return x + w > W - 70 ? 'right bottom' : x < 30 ? 'left bottom' : 'center bottom'; };
  // ingresso della frase (sale di poco, come in Remocn)
  const pin = (kar, words, t) => { const s0 = words[0].start - 0.05; const e = t < s0 ? 1 : E.outCubic((t - s0) / 0.16); kar.style.transform = 'translateY(' + px((1 - e) * 12) + ')'; kar.style.opacity = t < s0 ? 1 : cl((t - s0) / 0.12); };
  const dur = (w, m) => Math.max((w.end || w.start + 0.3) - w.start, m);

  KAR('pop', { desc: 'The spoken word turns orange and springs up in scale, then settles as the voice moves on', from: 'caption-active-pop',
    draw(kar, words, t) { pin(kar, words, t); const a = ACT(words, t);
      spans(kar).forEach((sp, i) => { IB(sp); let s = 1, col = ''; const w = words[i];
        if (i === a) { s = 1 + 0.16 * S(t - w.start, 12, 220, 0.6); col = C.orange; }
        else if (i === a - 1) s = 1 + 0.16 * (1 - S(t - words[a].start, 20, 200, 0.6));
        sp.style.transformOrigin = org(sp, kar); sp.style.transform = 'scale(' + s + ')'; sp.style.color = col; }); } });

  KAR('weight', { desc: 'The spoken word swells from a light to a heavy weight and relaxes after, with no layout shift', from: 'caption-weight',
    draw(kar, words, t) { pin(kar, words, t); const a = ACT(words, t);
      spans(kar).forEach((sp, i) => { lay(sp, w => '<i style="visibility:hidden;font-weight:900">' + esc(w) + '</i><i>' + esc(w) + '</i>'); sp.classList.add('fx-ls-g'); sp.style.justifyItems = 'start';
        const v = sp.children[1], w = words[i]; let wt = 500;
        if (t >= w.start) { const r = cl((t - w.start) / 0.15); wt = r < 0.34 ? 700 : r < 0.67 ? 800 : 900;
          if (i < a) { const rl = cl((t - words[i + 1].start) / 0.22); wt = rl < 0.34 ? Math.min(wt, 900) : rl < 0.67 ? 800 : 700; } }
        v.style.fontWeight = wt; }); } });

  KAR('blur-in', { desc: 'Each word resolves out of a soft blur the moment it is spoken', from: 'caption-blur-in',
    draw(kar, words, t) { spans(kar).forEach((sp, i) => { IB(sp); const p = E.outCubic((t - words[i].start) / 0.22);
      sp.style.opacity = t < words[i].start ? 0 : p; sp.style.filter = p < 1 ? 'blur(' + px((1 - p) * 12) + ')' : ''; }); } });

  KAR('bounce-in', { desc: 'Each word springs up into place with a little overshoot as it is spoken; the phrase builds word by word', from: 'caption-bounce-in',
    draw(kar, words, t) { spans(kar).forEach((sp, i) => { IB(sp); const d = t - words[i].start, p = S(d, 10, 220, 0.6);
      sp.style.opacity = d < 0 ? 0 : cl(d / 0.09); sp.style.transformOrigin = 'center bottom'; sp.style.transform = 'translateY(' + ((1 - p) * 0.5).toFixed(3) + 'em) scale(' + (0.55 + 0.45 * p) + ')'; }); } });

  KAR('drop', { desc: 'Each word falls into place from above with a tilt and a bounce; the phrase drops out if the speaker pauses', from: 'caption-drop',
    draw(kar, words, t) { const last = words[words.length - 1], le = (last.end || last.start + 0.4);
      spans(kar).forEach((sp, i) => { IB(sp); const d = t - words[i].start, p = S(d, 9, 180, 0.7), tilt = (U.rnd('dp', i + words[0].start) - 0.5) * 14;
        const ex = cl((t - le - 0.6 - i * 0.06) / 0.3);
        sp.style.opacity = d < 0 ? 0 : cl(d / 0.08) * (1 - ex);
        sp.style.transform = 'translateY(' + (-(1 - p) * 0.9 + E.inCubic(ex) * 0.6).toFixed(3) + 'em) rotate(' + (tilt * (1 - p)).toFixed(2) + 'deg)'; }); } });

  KAR('rise', { desc: 'Each word slides up out of a mask at its baseline as it is spoken, no bounce, no scale', from: 'caption-rise',
    draw(kar, words, t) { spans(kar).forEach((sp, i) => { lay(sp, w => '<i style="display:inline-block;font-style:normal">' + esc(w) + '</i>'); IB(sp);
      sp.style.clipPath = 'inset(-0.2em -0.3em 0 -0.3em)'; const p = E.outCubic((t - words[i].start) / 0.26); sp.firstChild.style.transform = 'translateY(' + ((1 - p) * 105).toFixed(1) + '%)'; }); } });

  KAR('slice', { desc: 'Each word arrives cut in two, top half from the left and bottom half from the right, locking as it is spoken', from: 'caption-slice',
    draw(kar, words, t) { spans(kar).forEach((sp, i) => { lay(sp, w => '<i>' + esc(w) + '</i><i>' + esc(w) + '</i>'); sp.classList.add('fx-ls-g');
      const d = t - words[i].start, p = E.outCubic(d / 0.24), [a, b] = sp.children; sp.style.opacity = d < 0 ? 0 : cl(d / 0.09);
      a.style.clipPath = 'inset(-0.2em -0.2em 52% -0.2em)'; b.style.clipPath = 'inset(48% -0.2em -0.2em -0.2em)';
      a.style.transform = 'translateX(' + (-(1 - p) * 0.7).toFixed(3) + 'em)'; b.style.transform = 'translateX(' + ((1 - p) * 0.7).toFixed(3) + 'em)'; }); } });

  KAR('karaoke', { desc: 'The whole phrase is readable in grey and each word fills with ink left to right exactly as it is spoken', from: 'caption-karaoke,caption-dim-progress',
    draw(kar, words, t) { pin(kar, words, t); spans(kar).forEach((sp, i) => { lay(sp, w => '<i>' + esc(w) + '</i><i>' + esc(w) + '</i>'); sp.classList.add('fx-ls-g');
      const w = words[i], f = cl((t - w.start) / dur(w, 0.12)), [b, o] = sp.children; b.style.color = C.gray; o.style.color = C.ink;
      o.style.clipPath = 'inset(-0.2em ' + ((1 - f) * 100).toFixed(1) + '% -0.2em -0.2em)'; }); } });

  // riquadro / sottolineatura che viaggia di parola in parola: vive DENTRO il primo span (il motore conta i figli di #kar)
  const travel = (kar, words, t, kind) => {
    const ss = spans(kar), a = ACT(words, t), s0 = ss[0]; if (!s0) return; s0.style.position = 'relative';
    let o = s0.querySelector('.fx-ls-tv'); if (!o) { o = document.createElement('b'); o.className = 'fx-ls-tv'; s0.appendChild(o); }
    ss.forEach((sp, i) => { sp.style.color = ''; });
    if (a < 0) { o.style.display = 'none'; return; }
    const R = i => { const s = ss[i]; return [s.offsetLeft, s.offsetTop, s.offsetWidth, s.offsetHeight]; };
    const q = a > 0 ? E.outCubic((t - words[a].start) / 0.12) : 1, A = R(Math.max(0, a - 1)), B = R(a), r = A.map((v, k) => lerp(v, B[k], q));
    const W = kar.clientWidth; let x0 = r[0] - (kind === 'box' ? 6 : -2), x1 = r[0] + r[2] + (kind === 'box' ? 6 : -2); x0 = Math.max(0, x0); x1 = Math.min(W, x1);
    const st = o.style; st.display = 'block'; st.position = 'absolute'; st.zIndex = -1; st.left = px(x0 - s0.offsetLeft); st.width = px(x1 - x0);
    if (kind === 'box') { st.top = px(r[1] - s0.offsetTop + r[3] * 0.06); st.height = px(r[3] * 0.9); st.background = C.blue; st.borderRadius = '8px'; if (q > 0.5) ss[a].style.color = '#fff'; }
    else { st.top = px(r[1] - s0.offsetTop + r[3] - 7); st.height = '6px'; st.background = C.orange; st.borderRadius = '3px'; }
  };
  KAR('box', { desc: 'A solid blue box slides behind the word being spoken, travelling from word to word', from: 'caption-highlight-box',
    draw(kar, words, t) { pin(kar, words, t); travel(kar, words, t, 'box'); } });
  KAR('underline', { desc: 'An orange bar slides under the word being spoken, travelling from word to word; the text stays still', from: 'caption-underline',
    draw(kar, words, t) { pin(kar, words, t); travel(kar, words, t, 'line'); } });

  KAR('marker', { desc: 'Highlighted words (*word* in say) get a highlighter swipe at the pace they are spoken', from: 'caption-marker',
    draw(kar, words, t) { pin(kar, words, t); spans(kar).forEach((sp, i) => { const w = words[i]; if (!w.hi) return; const p = cl((t - w.start) / dur(w, 0.22));
      sp.style.backgroundImage = 'linear-gradient(' + C.mark + ',' + C.mark + ')'; sp.style.backgroundRepeat = 'no-repeat'; sp.style.backgroundPosition = '0 75%'; sp.style.backgroundSize = (p * 100).toFixed(1) + '% 72%'; }); } });

  KAR('stamp', { desc: 'Highlighted words (*word* in say) slam down as an orange rubber stamp the moment they are spoken', from: 'caption-stamp',
    draw(kar, words, t) { pin(kar, words, t); spans(kar).forEach((sp, i) => { const w = words[i]; if (!w.hi) return; IB(sp); const d = t - w.start;
      sp.style.padding = '0 10px'; sp.style.margin = '0 4px'; sp.style.textTransform = 'uppercase'; sp.style.fontWeight = 900; sp.style.color = C.orange; sp.style.background = 'none';
      sp.style.boxShadow = 'inset 0 0 0 4px ' + C.orange; sp.style.borderRadius = '6px';
      const s = d < 0.09 ? lerp(1.8, 0.96, E.inCubic(d / 0.09)) : lerp(0.96, 1, E.outCubic((d - 0.09) / 0.08));
      sp.style.opacity = d < 0 ? 0 : cl(d / 0.05 + 0.3); sp.style.transform = 'rotate(-3deg) scale(' + s + ')'; }); } });

  KAR('redact', { desc: 'The phrase starts blacked out like a declassified file and each bar pulls away as its word is spoken', from: 'caption-redact',
    draw(kar, words, t) { pin(kar, words, t); spans(kar).forEach((sp, i) => { const w = words[i], p = E.outCubic((t - w.start) / dur(w, 0.18)), on = t >= w.start;
      sp.style.color = C.ink; const bar = 'linear-gradient(' + C.ink + ',' + C.ink + ')';
      sp.style.backgroundImage = w.hi && on ? bar + ',linear-gradient(' + C.mark + ',' + C.mark + ')' : bar; sp.style.backgroundRepeat = 'no-repeat';
      sp.style.backgroundSize = ((1 - p) * 100).toFixed(1) + '% 80%' + (w.hi && on ? ',100% 80%' : ''); sp.style.backgroundPosition = 'right 60%' + (w.hi && on ? ',0 60%' : ''); }); } });

  const GL = 'abcdefghkmnoprstuvwxyz', GU = 'ABCDEFGHKMNPRSTUVWXYZ';
  KAR('scramble', { desc: 'Each word arrives as random letters when spoken and decodes left to right into the real word', from: 'caption-scramble',
    draw(kar, words, t) { spans(kar).forEach((sp, i) => { lay(sp, w => '<i style="visibility:hidden;font-style:normal">' + esc(w) + '</i><i style="position:absolute;left:2px;top:0;white-space:nowrap;font-style:normal"></i>');
      sp.style.position = 'relative'; const w = words[i], s = Array.from(w.w), d = t - w.start, v = sp.children[1];
      if (d < 0) { v.textContent = ''; return; } const p = cl(d / Math.min(dur(w, 0.12), 0.3)), r = Math.floor(p * s.length), f = Math.floor(t * 24);
      v.textContent = p >= 1 ? w.w : s.map((c, k) => k < r || !/[a-z]/i.test(c) ? c : (c === c.toUpperCase() ? GU : GL)[Math.floor(U.rnd('sc' + i + ':' + k, f) * 21)]).join(''); }); } });

  KAR('typewriter', { desc: 'Monospaced: each word types out letter by letter at the pace it is spoken, with an orange caret that blinks in pauses', from: 'caption-typewriter',
    draw(kar, words, t) { kar.style.font = '700 38px/1.3 Mono'; const a = ACT(words, t);
      spans(kar).forEach((sp, i) => { lay(sp, chars); sp.classList.add('fx-ls-c'); const w = words[i], cs = sp.children, d = t - w.start;
        const n = d < 0 ? 0 : Math.ceil(cl(d / Math.max(dur(w, 0.05) - 0.02, 0.05)) * cs.length);
        [...cs].forEach((c, k) => { c.style.visibility = k < n ? 'visible' : 'hidden'; c.style.boxShadow = ''; });
        if (i === a && n > 0) { const typing = t < (w.end || w.start + 0.3), on = typing || Math.floor((t - (w.end || 0)) / 0.5) % 2 === 0; if (on) cs[n - 1].style.boxShadow = '4px 0 0 ' + C.orange; } }); } });

  KAR('handwrite', { desc: 'Words are inked in by hand (Caveat) left to right at the pace they are spoken, each at its own slight angle', from: 'caption-handwrite',
    draw(kar, words, t) { kar.style.font = '700 58px/1.1 Hand'; spans(kar).forEach((sp, i) => { IB(sp); const w = words[i], p = cl((t - w.start) / dur(w, 0.2));
      sp.style.color = C.ink; sp.style.transform = 'rotate(' + ((U.rnd('hw', i + words[0].start) - 0.5) * 5).toFixed(2) + 'deg)';
      sp.style.clipPath = 'inset(-0.3em ' + ((1 - p) * 100).toFixed(1) + '% -0.3em -0.2em)'; }); } });

  KAR('label-maker', { desc: 'Each word is punched letter by letter into a strip of blue embossing tape (orange for highlighted words) as it is spoken', from: 'caption-label-maker',
    draw(kar, words, t) { kar.style.font = '700 30px/1.85 Mono';
      spans(kar).forEach((sp, i) => { lay(sp, w => chars(w.toUpperCase())); sp.classList.add('fx-ls-c'); IB(sp); const w = words[i], cs = [...sp.children], d = t - w.start;
        const n = d < 0 ? 0 : Math.ceil(cl(d / Math.max(dur(w, 0.08) - 0.02, 0.06)) * cs.length);
        Object.assign(sp.style, { position: 'relative', background: w.hi ? C.orange : C.blue, color: C.paper, padding: '1px 12px', borderRadius: '5px', letterSpacing: '.08em', lineHeight: '1.3', textShadow: '0 2px 0 rgba(0,0,0,.28)',
          transform: 'rotate(' + ((U.rnd('lm', i + words[0].start) - 0.5) * 3).toFixed(2) + 'deg)', visibility: n ? 'visible' : 'hidden' });
        cs.forEach((c, k) => { c.style.display = 'inline-block'; c.style.visibility = k < n ? 'visible' : 'hidden'; c.style.transform = k === n - 1 && n < cs.length ? 'translateY(2px)' : ''; });
        const re = n ? cs[n - 1].offsetLeft + cs[n - 1].offsetWidth + 12 : 0; sp.style.clipPath = n >= cs.length ? '' : 'inset(-4px ' + Math.max(0, sp.offsetWidth - re) + 'px -4px -4px)'; }); } });

  const FL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  KAR('split-flap', { desc: 'Every letter sits on its own dark flap tile and clatters through a few characters before landing as the word is spoken, like a departure board', from: 'caption-split-flap',
    draw(kar, words, t) { kar.style.font = '700 30px/1.55 Mono';
      spans(kar).forEach((sp, i) => { lay(sp, w => chars(w.toUpperCase())); sp.classList.add('fx-ls-c'); const w = words[i], cs = [...sp.children], txt = Array.from(w.w.toUpperCase()), win = dur(w, 0.35);
        sp.style.background = 'none'; sp.style.padding = '0';
        cs.forEach((c, k) => { const eT = w.start + win * (0.55 + 0.45 * k / Math.max(1, cs.length)), fl = 3 + Math.floor(U.rnd('sf' + i, k) * 3), ft = Math.min(0.06, (eT - w.start) / fl), sT = eT - fl * ft;
          let ch = ' ', sy = 1; if (t >= eT) ch = txt[k]; else if (t >= sT) { const j = Math.floor((t - sT) / ft); ch = FL[Math.floor(U.rnd('sg' + i + ':' + k, j) * FL.length)]; sy = 0.7 + 0.3 * Math.abs(Math.cos(((t - sT) / ft - j) * Math.PI)); }
          if (c.textContent !== ch) c.textContent = ch;
          Object.assign(c.style, { display: 'inline-block', background: (w.hi ? C.orange : C.ink) + ' linear-gradient(transparent 49%,rgba(244,241,234,.22) 49%,rgba(244,241,234,.22) 53%,transparent 53%)', color: C.paper, padding: '0 3px', margin: '0 1px', borderRadius: '3px', lineHeight: '1.35', transform: 'scaleY(' + sy + ')' }); }); }); } });

  KAR('cube', { desc: 'Each new phrase turns into view as the next face of a cube, hinged on a horizontal axis', from: 'caption-cube',
    draw(kar, words, t) { const s0 = words[0].start - 0.05, q = t < s0 ? 1 : E.outCubic((t - s0) / 0.32);
      kar.style.transformOrigin = 'center center'; kar.style.transform = 'perspective(900px) translateZ(-28px) rotateX(' + ((1 - q) * -90).toFixed(1) + 'deg) translateZ(28px)'; kar.style.opacity = cl(q * 3); } });

  KAR('slot', { desc: 'Each new phrase rolls up into place from below, like a slot machine reel', from: 'caption-slot',
    draw(kar, words, t) { const s0 = words[0].start - 0.05, q = t < s0 ? 1 : E.outCubic((t - s0) / 0.26); kar.style.clipPath = 'inset(-4px -20px -4px -20px)';
      spans(kar).forEach(sp => { IB(sp); sp.style.transform = 'translateY(' + ((1 - q) * 1.4).toFixed(3) + 'em)'; }); } });

  KAR('outline', { desc: 'Words wait as hollow outlines, the spoken word fills orange and said words fill ink', from: 'caption-outline',
    draw(kar, words, t) { pin(kar, words, t); kar.style.fontWeight = 900; const a = ACT(words, t);
      spans(kar).forEach((sp, i) => { const said = t >= words[i].start; sp.style.webkitTextStroke = said && i !== a ? '0' : '2px ' + C.ink; sp.style.color = !said ? 'transparent' : i === a ? C.orange : C.ink; }); } });

  KAR('plate', { desc: 'Broadcast subtitles on a navy plate; words wait faint and punch out in paper colour as they are spoken, highlighted words in orange', from: 'caption-subtitle,caption-knockout',
    draw(kar, words, t) { const s0 = words[0].start - 0.05; Object.assign(kar.style, { background: 'rgba(11,31,58,.94)', padding: '12px 20px', borderRadius: '8px', width: 'fit-content', maxWidth: '715px', boxSizing: 'border-box', font: '700 42px/1.22 Inter', opacity: t < s0 ? 1 : cl((t - s0) / 0.12) });
      const a = ACT(words, t); spans(kar).forEach((sp, i) => { IB(sp); const w = words[i], d = t - w.start; sp.style.background = 'none';
        sp.style.color = d < 0 ? 'rgba(244,241,234,.36)' : w.hi ? C.orange : C.paper; sp.style.transform = i === a ? 'scale(' + lerp(1.08, 1, E.outCubic(d / 0.12)) + ')' : ''; }); } });

  KAR('prosody', { desc: 'Word size follows the delivery: drawn-out words land larger, rushed words smaller; each rises in as spoken (kept to two lines)', from: 'caption-prosody',
    draw(kar, words, t) { kar.style.lineHeight = '1.12'; const ss = spans(kar), key = words[0].start + ':' + words.length;
      if (kar._fxpk !== key) { kar._fxpk = key; const r = words.map(w => dur(w, 0.05) / Math.max(1, w.w.length)), lo = Math.min(...r), hi = Math.max(...r);
        let f = 1; const sz = r.map(v => 38 + 16 * (hi > lo ? (v - lo) / (hi - lo) : 0.4));
        for (let it = 0; it < 6; it++) { ss.forEach((sp, i) => { IB(sp); sp.style.fontSize = px(sz[i] * f); }); if (kar.offsetHeight <= 128) break; f *= 0.9; } kar._fxps = sz.map(v => v * f); }
      ss.forEach((sp, i) => { IB(sp); sp.style.fontSize = px(kar._fxps[i] || 44); const d = t - words[i].start, ap = E.outCubic(d / 0.18);
        sp.style.opacity = d < 0 ? 0 : ap; sp.style.transform = 'translateY(' + ((1 - ap) * 0.3).toFixed(3) + 'em)'; }); } });

  KAR('word-pop', { desc: 'One big Anton word at a time, each popping in on a spring as it is spoken (highlighted words in orange)', from: 'caption-word-pop',
    draw(kar, words, t) { const a = Math.max(0, ACT(words, t)), W = kar.clientWidth;
      spans(kar).forEach((sp, i) => { if (i !== a) { sp.style.display = 'none'; return; }
        Object.assign(sp.style, { display: 'inline-block', font: '400 112px/1 Anton', textTransform: 'uppercase', color: words[i].hi ? C.orange : C.ink, background: 'none', transformOrigin: 'left bottom' });
        if (sp.offsetWidth > W) sp.style.fontSize = px(112 * W / sp.offsetWidth * 0.98);
        const d = t - words[i].start, p = S(d, 11, 240, 0.6); sp.style.opacity = d < 0 ? 0 : cl(d / 0.05); sp.style.transform = 'scale(' + (0.6 + 0.4 * p) + ')'; }); } });
})();
