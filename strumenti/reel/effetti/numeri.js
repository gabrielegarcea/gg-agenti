// GG Motion — effetti "numeri": animazioni del numero gigante (num) ed elementi grafici nuovi (els)
// per spiegare numeri di sport business. Idee e matematica da Remocn (MIT, vedi LICENSE-remocn.txt),
// categoria "numbers", riscritte in JavaScript semplice nello stile GG (carta, navy, blu, arancio).
// Tutto e' puro nel tempo: lo stato ammesso e' solo quello di preparazione (nodi creati, misure).
(() => {
const C = FX.C, U = FX.u, E = U.E, cl = U.clamp, lerp = U.lerp, I = U.interp;
const oc = E.outCubic, io = E.inOutCubic;
const es = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
const mdx = s => es(s).replace(/\*(.+?)\*/g, '<b>$1</b>');
const fm = (v, d) => (+v).toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
const H = h => { const d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; };
const NS = 'http://www.w3.org/2000/svg';
const S = (tag, a, par) => { const n = document.createElementNS(NS, tag); for (const k in a) n.setAttribute(k, a[k]); if (par) par.appendChild(n); return n; };
// tempo di comparsa della voce k di e.items (marker, oppure t0 + k*gap)
const tAt = (e, k, t0, gap) => T(e.items && e.items[k] && e.items[k].at, t0 + k * (gap == null ? 0.5 : gap));
const fin = e => (e.prefix || '') + fm(e.to || 0, e.decimals) + (e.suffix || '');
const vs = (e, v) => (e.prefix || '') + fm(v, e.decimals) + (e.suffix || '');
const disp = it => it.display != null ? String(it.display) : fm(it.value || 0, it.decimals);
const col = c => c ? (C[c] || c) : null;
const pal = [C.ink, C.blue, '#8A93A6', C.gray, C.line];
const W = 715;

// ============================================================ NUM
// ogni effetto mette il contenuto in un involucro .fx-nw (inline-block): cosi' non tocca la transform
// del nodo .big (la usa il motore per "punch")
FX.css(`.fx-nw{display:inline-block;position:relative;white-space:nowrap;transform-origin:left 60%}
.fx-nw .c{display:inline-block}
.fx-rw{display:inline-block;position:relative;overflow:hidden;height:1em;line-height:1em;vertical-align:top}
.fx-rw>i{visibility:hidden;font-style:normal}
.fx-rw>span{position:absolute;left:0;right:0;top:0;text-align:center}.fx-rw>span>span{display:block;height:1em}
.fx-sym{display:inline-block;line-height:1em;vertical-align:top}`);
const wrap = (el, html) => { el.innerHTML = '<span class="fx-nw">' + (html || '') + '</span>'; return el.firstChild; };
// scompone il testo finale: prefisso, cifre (con posto decimale), separatori, suffisso
const parts = e => { const pre = e.prefix || '', num = fm(e.to || 0, e.decimals), suf = e.suffix || ''; const out = [];
  Array.from(pre).forEach(c => out.push({ c, k: 'p' })); Array.from(num).forEach(c => out.push({ c, k: /\d/.test(c) ? 'd' : 's' })); Array.from(suf).forEach(c => out.push({ c, k: 'p' }));
  let n = out.filter(x => x.k === 'd').length, j = 0; out.forEach(x => { if (x.k === 'd') { x.j = j; x.place = n - 1 - j; x.d = +x.c; j++; } }); out.nd = n; return out; };
// rulli: una finestra alta 1em con una striscia di cifre 0..9 ripetuta
const reels = (w, e, reps) => parts(e).map(x => { if (x.k !== 'd') { const s = H('<span class="fx-sym">' + es(x.c) + '</span>'); w.appendChild(s); x.n = s; return x; }
  const win = H('<span class="fx-rw"><i>' + x.c + '</i><span>' + Array.from({ length: 10 * (reps || 3) }, (_, k) => '<span>' + (k % 10) + '</span>').join('') + '</span></span>'); w.appendChild(win); x.n = win; x.strip = win.lastChild; return x; });
const setReel = (x, pos) => { x.strip.style.transform = 'translateY(' + (-pos) + 'em)'; };
const colorOf = el => getComputedStyle(el).color;

FX.add('num', 'odometer', { desc: 'digits roll on reels and land left to right; e.mode "reel" (default: each digit spins to its value) or "carry" (true odometer: low digits spin, high ones tick over on the carry); e.dur (1.4)', from: 'figure-reels,live-ticker,carry-count,churn-count,row-count',
  prep(el, e) { const w = wrap(el); el._r = reels(w, e, 3); },
  draw(el, lt, e) { const R = el._r, D = e.dur || 1.4, nd = R.nd;
    if (e.mode === 'carry') { const dec = e.decimals || 0, k = io(lt / D), V = Math.round(lerp(e.from || 0, e.to || 0, k) * 10 ** dec), done = lt >= D;
      let vis = false; R.forEach(x => { if (x.k === 'd') { const q = V / 10 ** x.place, lowest = x.place === 0; let pos;
          if (done) pos = x.d; else if (lowest) pos = q % 10; else { const f = (V % 10 ** x.place) / 10 ** x.place; pos = Math.floor(q) % 10 + U.E.inOutCubic((f - 0.85) / 0.15); }
          setReel(x, pos % 10 + 10); vis = done || x.place <= dec || V >= 10 ** x.place * 0.999; x.n.style.display = vis ? '' : 'none'; }
        else if (x.k === 's') x.n.style.display = vis ? '' : 'none'; });
      return; }
    R.forEach(x => { if (x.k !== 'd') { x.n.style.opacity = cl(lt / 0.2); return; }
      const land = D * (0.55 + 0.45 * (nd > 1 ? x.j / (nd - 1) : 1)), turns = x.j >= nd / 2 ? 2 : 1;
      setReel(x, (turns * 10 + x.d) * E.inOutQuart(lt / land)); }); } });

FX.add('num', 'slot', { desc: 'every digit spins like a slot reel, then they lock one by one left to right with a small bounce; e.stagger (0.12 s)', from: 'price-slate,ipo-open',
  prep(el, e) { const w = wrap(el); el._r = reels(w, e, 3); },
  draw(el, lt, e) { const st = e.stagger || 0.12, sp = 16;
    el._r.forEach(x => { if (x.k !== 'd') { x.n.style.opacity = cl(lt / 0.2); return; }
      const L = 0.35 + x.j * st, at = s => (s * sp + x.j * 3.7) % 10;
      if (lt < L) { setReel(x, at(Math.max(0, lt)) ); x.n.style.filter = lt > 0.03 ? 'blur(1.5px)' : ''; return; }
      const p0 = at(L), base = Math.floor(p0), tgt = base + ((x.d - base + 10) % 10 || 10);
      setReel(x, lerp(p0, tgt, E.outBack((lt - L) / 0.3))); x.n.style.filter = ''; }); } });

FX.add('num', 'scramble', { desc: 'digits flicker through random values (gray) and lock into place (brand color) one by one; e.order "left" (default) or "random"', from: 'number-mosaic,core-sum',
  prep(el, e) { const w = wrap(el); el._p = parts(e).map(x => { const s = H('<span class="c">' + es(x.c) + '</span>'); w.appendChild(s); x.n = s; return x; }); el._c = colorOf(el); },
  draw(el, lt, e) { el._p.forEach(x => { if (x.k !== 'd') { x.n.style.opacity = cl(lt / 0.15); return; }
    const L = e.order === 'random' ? 0.3 + U.rnd('scr', x.j) * 0.6 : 0.25 + x.j * 0.08, done = lt >= L;
    x.n.textContent = done ? x.c : String(Math.floor(U.rnd('sc' + x.j, Math.floor(Math.max(lt, 0) * 22)) * 10));
    x.n.style.color = done ? el._c : C.gray; const q = done ? 1 + 0.12 * (1 - oc((lt - L) / 0.2)) : 1; x.n.style.transform = 'scale(' + q + ')'; }); } });

FX.add('num', 'flip', { desc: 'flip-clock digits: each digit flips through the values up to its own, with a hinge line that disappears at the end', from: 't-minus',
  prep(el, e) { const w = wrap(el); w.style.perspective = '900px'; el._p = parts(e).map(x => { const s = H('<span class="c">' + es(x.c) + '</span>'); w.appendChild(s); x.n = s; return x; });
    el._h = H('<i style="position:absolute;left:-6px;right:-6px;top:52%;height:6px;background:' + C.paper + '"></i>'); w.appendChild(el._h);
    const fs = String(Math.round(Math.abs(e.from || 0) * 10 ** (e.decimals || 0))); el._p.forEach(x => { if (x.k === 'd') { const ch = fs[fs.length - 1 - x.place]; x.s = ch ? +ch : 0; } }); },
  draw(el, lt, e) { const f = 0.075; let end = 0;
    el._p.forEach(x => { if (x.k !== 'd') { x.n.style.opacity = cl(lt / 0.15); return; }
      const cnt = ((x.d - x.s + 10) % 10) + (x.place === 0 ? 10 : 0), st = 0.05 * x.j, k = Math.floor((lt - st) / f), ph = ((lt - st) / f) - k; end = Math.max(end, st + cnt * f);
      if (lt < st || k >= cnt) { x.n.textContent = lt < st ? x.s : x.c; x.n.style.transform = ''; return; }
      const cur = (x.s + k) % 10; if (ph < 0.5) { x.n.textContent = cur; x.n.style.transform = 'rotateX(' + ph * 180 + 'deg)'; } else { x.n.textContent = (cur + 1) % 10; x.n.style.transform = 'rotateX(' + (-(1 - ph) * 180) + 'deg)'; } });
    el._h.style.opacity = 1 - cl((lt - end) / 0.25); } });

FX.add('num', 'steps', { desc: 'hard cuts through a few values with a punch on every cut (no smooth count); e.steps (6), e.every (step size, e.g. 1 for a shot clock 24 to 0), e.tick (s per step when e.every), e.bpm (cuts on the beat), e.dur (1.2)', from: 'smash-count,gear-shift,module-count,beat-count,countdown,shot-clock',
  prep(el, e) { el._w = wrap(el); const a = e.from || 0, b = e.to || 0; let vals = [];
    if (e.every) { const n = Math.min(60, Math.round(Math.abs(b - a) / e.every)); for (let k = 0; k <= n; k++) vals.push(a + Math.sign(b - a) * e.every * k); vals[vals.length - 1] = b; }
    else { const n = e.steps || 6; for (let k = 0; k <= n; k++) vals.push(lerp(a, b, k / n)); }
    const n = vals.length - 1, D = e.dur || 1.2; let ts = [];
    if (e.bpm || e.tick) { const g = e.tick || 60 / e.bpm; ts = vals.map((_, k) => k * g); }
    else { const w = vals.map((_, k) => lerp(1.7, 0.7, k / Math.max(1, n))); const tot = w.slice(1).reduce((s, x) => s + x, 0); let acc = 0; ts = vals.map((_, k) => { if (k) acc += w[k] / tot * D; return acc; }); }
    el._v = vals; el._t = ts; },
  draw(el, lt, e) { const ts = el._t; let k = 0; while (k + 1 < ts.length && lt >= ts[k + 1]) k++;
    const v = el._v[k]; el._w.textContent = k === ts.length - 1 ? fin(e) : vs(e, e.decimals ? v : Math.round(v));
    const age = lt - ts[k], q = 1 + (k ? 0.1 : 0) * (1 - oc(age / 0.16)); el._w.style.transform = 'scale(' + q + ')'; } });

FX.add('num', 'lean', { desc: 'the figure counts in three surges; every surge leans it forward and it snaps back upright', from: 'lean-count',
  prep(el) { el._w = wrap(el); el._w.style.transformOrigin = 'left bottom'; },
  draw(el, lt, e) { const at = [0, 0.45, 0.9], to = [0.45, 0.8, 1]; let k = 0; while (k < 2 && lt >= at[k + 1]) k++;
    const p = oc((lt - at[k]) / 0.32), f = lerp(k ? to[k - 1] : 0, to[k], p), age = lt - at[k];
    el._w.textContent = lt >= at[2] + 0.32 ? fin(e) : vs(e, lerp(e.from || 0, e.to || 0, f));
    el._w.style.transform = 'skewX(' + (-13 * (1 - U.spring(age, { damping: 11, stiffness: 260 }))) + 'deg)'; } });

FX.add('num', 'push', { desc: 'the figure grows one digit at a time (4, 48, 482, 4,821, 48,216) and the camera pulls back at every push', from: 'magnitude-push,row-count',
  prep(el, e) { const w = el._w = wrap(el); const to = Math.floor(Math.abs(e.to || 0)), n = String(to).length; const st = [];
    for (let k = 1; k <= n; k++) st.push(k === n ? fin(e) : (e.prefix || '') + fm(Math.floor(to / 10 ** (n - k)), 0));
    el._s = st.map(s => { w.textContent = s; return { s, w: w.offsetWidth }; }); w.textContent = fin(e); },
  draw(el, lt, e) { const st = el._s, n = st.length, g = Math.min(0.24, 1.2 / n), Wf = st[n - 1].w || 1; let k = Math.min(n - 1, Math.floor(Math.max(0, lt) / g));
    const sc = i => Math.min(1.3, Wf / Math.max(1, st[i].w)); const p = U.spring(lt - k * g, { damping: 16, stiffness: 220 });
    el._w.textContent = st[k].s; el._w.style.transform = 'scale(' + lerp(k ? sc(k - 1) : sc(0) * 1.05, sc(k), p) + ')'; } });

FX.add('num', 'diminuendo', { desc: 'counts up while each trailing digit group is set quieter than the one before (1, 0.62, 0.42...): the eye reads the big part first', from: 'diminuendo',
  prep(el) { el._w = wrap(el); },
  draw(el, lt, e) { const s = vs(e, lerp(e.from || 0, e.to || 0, oc(lt / (e.dur || 1.3)))), op = [1, 0.62, 0.42, 0.3, 0.24];
    const g = s.split(','); el._w.innerHTML = g.map((x, i) => '<span style="opacity:' + op[Math.min(i, 4)] + '">' + (i ? ',' : '') + es(x) + '</span>').join(''); } });

FX.add('num', 'thin', { desc: 'the figure arrives heavy (thick outline) and slims down to its normal weight while it counts', from: 'weight-cut',
  prep(el) { el._w = wrap(el); },
  draw(el, lt, e) { const p = oc(lt / (e.dur || 1.2)); el._w.textContent = lt >= (e.dur || 1.2) ? fin(e) : vs(e, lerp(e.from || 0, e.to || 0, p));
    el._w.style.webkitTextStroke = (0.075 * (1 - p)).toFixed(4) + 'em currentColor'; } });

FX.add('num', 'tall', { desc: 'a tall squeezed figure opens to full width and settles while counting; e.mode "open" (default) or "stretch" (the strokes shoot up tall and spring back)', from: 'tall-count,stem-stretch',
  prep(el) { el._w = wrap(el); el._w.style.transformOrigin = 'left bottom'; },
  draw(el, lt, e) { const D = e.dur || 1.0, p = oc(lt / D); el._w.textContent = lt >= D ? fin(e) : vs(e, lerp(e.from || 0, e.to || 0, p));
    if (e.mode === 'stretch') { const s = lt < 0.25 ? lerp(0.2, 1.5, oc(lt / 0.25)) : 1 + 0.5 * (1 - U.spring(lt - 0.25, { damping: 9, stiffness: 150 })); el._w.style.transform = 'scaleY(' + s + ')'; }
    else el._w.style.transform = 'translateY(' + (1 - p) * 30 + 'px) scale(' + lerp(0.4, 1, p) + ',' + lerp(1.25, 1, p) + ')'; } });

FX.add('num', 'fill', { desc: 'the figure appears as an outline and fills with ink; e.mode "rise" (wavy level, default), "sweep" (left to right), "stripes" (vertical stripes), "hatch" (pen hatching in passes), "draw" (outline drawn first, then filled); e.count to count while filling', from: 'slim-count,stripe-count,packed-count,hatch-shade,single-stroke,moire-reveal',
  prep(el, e) { const c = colorOf(el), t = es(fin(e)); const w = el._w = wrap(el, '<span class="o" style="color:transparent;-webkit-text-stroke:4px ' + c + '">' + t + '</span>');
    const lay = (st) => { const s = H('<span style="position:absolute;left:0;top:0;' + st + '">' + t + '</span>'); w.appendChild(s); return s; };
    el._o = w.firstChild;
    if (e.mode === 'hatch') { el._h1 = lay('color:transparent;background:repeating-linear-gradient(45deg,' + c + ' 0 4px,transparent 4px 15px);-webkit-background-clip:text;background-clip:text');
      el._h2 = lay('color:transparent;background:repeating-linear-gradient(-45deg,' + c + ' 0 4px,transparent 4px 15px);-webkit-background-clip:text;background-clip:text'); }
    el._f = lay('color:' + c); },
  draw(el, lt, e) { const D = e.dur || 1.2, p = cl(lt / D), m = e.mode || 'rise', f = el._f;
    if (e.count) { const s = lt >= D ? fin(e) : vs(e, lerp(e.from || 0, e.to || 0, oc(p))); [el._o, f, el._h1, el._h2].forEach(x => { if (x) x.textContent = s; }); }
    el._o.style.opacity = cl(lt / 0.15); const ins = q => 'inset(-10% ' + ((1 - q) * 100).toFixed(2) + '% -10% -2%)';
    if (m === 'sweep') f.style.clipPath = ins(io(p));
    else if (m === 'stripes') { const n = 9; let pts = ['0% 110%']; for (let i = 0; i < n; i++) { const h = 110 - 120 * oc((p - i * 0.05) / 0.55); pts.push((i / n * 100) + '% 110%', (i / n * 100) + '% ' + h + '%', ((i + 1) / n * 100 + 0.3) + '% ' + h + '%', ((i + 1) / n * 100 + 0.3) + '% 110%'); } f.style.clipPath = 'polygon(' + pts.join(',') + ')'; }
    else if (m === 'hatch') { el._h1.style.clipPath = ins(io(p / 0.4)); el._h2.style.clipPath = ins(io((p - 0.35) / 0.35)); f.style.clipPath = ins(io((p - 0.65) / 0.35)); }
    else if (m === 'draw') { el._o.style.clipPath = ins(io(p / 0.55)); f.style.clipPath = 'none'; f.style.opacity = cl((p - 0.6) / 0.4); }
    else { const L = 105 - 112 * io(p), A = 5 * (1 - p); let pts = []; for (let i = 0; i <= 20; i++) pts.push(i * 5 + '% ' + (L + A * Math.sin(i / 20 * 9.4 + lt * 7)).toFixed(2) + '%'); pts.push('100% 110%', '0% 110%'); f.style.clipPath = p >= 1 ? 'none' : 'polygon(' + pts.join(',') + ')'; } } });

FX.add('num', 'pixel', { desc: 'the figure is built from pixels on a canvas, then turns crisp; e.mode "res" (coarse blocks to sharp, default), "paint" (tiles painted by a scan line, orange then blue), "halftone" (dots that swell into the figure), "mosaic" (a field of ticking digits where the figure lights up), "weave" (row by row like a loom)', from: 'res-climb,raster-paint,figure-to-label,number-mosaic,thread-weave,module-count',
  prep(el, e) { const w = el._w = wrap(el, '<span class="t">' + es(fin(e)) + '</span><i style="display:inline-block;width:0;height:0;vertical-align:baseline"></i>'); el._c = colorOf(el);
    const cv = el._cv = document.createElement('canvas'); cv.style.cssText = 'position:absolute;left:0;top:0'; w.appendChild(cv); },
  draw(el, lt, e) { const w = el._w, cv = el._cv, tx = w.querySelector('.t'), D = e.dur || 1.3;
    if (!el._d) { const Wd = Math.ceil(w.offsetWidth) + 4, Hd = Math.ceil(w.offsetHeight); if (!Wd || !Hd) return; const base = w.querySelector('i').offsetTop;
      cv.width = Wd; cv.height = Hd; const o = document.createElement('canvas'); o.width = Wd; o.height = Hd; const x = o.getContext('2d');
      x.font = getComputedStyle(el).fontSize + ' Anton'; x.fillStyle = '#000'; x.fillText(fin(e), 0, base); el._d = { W: Wd, H: Hd, a: x.getImageData(0, 0, Wd, Hd).data }; }
    const d = el._d, g = cv.getContext('2d'), m = e.mode || 'res', A = (x, y) => (x < 0 || y < 0 || x >= d.W || y >= d.H) ? 0 : d.a[(Math.floor(y) * d.W + Math.floor(x)) * 4 + 3] / 255;
    const cov = (x, y, b) => (A(x + b * .25, y + b * .25) + A(x + b * .75, y + b * .25) + A(x + b * .25, y + b * .75) + A(x + b * .75, y + b * .75) + 2 * A(x + b / 2, y + b / 2)) / 6;
    const end = cl((lt - D) / 0.25); tx.style.opacity = end; cv.style.opacity = 1 - end; g.clearRect(0, 0, d.W, d.H); if (end >= 1) return;
    if (m === 'res') { const sz = [44, 26, 15, 8, 4], k = Math.min(4, Math.floor(cl(lt / D) * 5)), b = sz[k]; g.fillStyle = el._c; g.globalAlpha = cl(lt / 0.15);
      for (let y = 0; y < d.H; y += b) for (let x = 0; x < d.W; x += b) if (cov(x, y, b) > 0.42) g.fillRect(x, y, b - (b > 6 ? 2 : 0), b - (b > 6 ? 2 : 0)); }
    else if (m === 'halftone') { const b = 14, gr = lerp(0.15, 1.25, io(lt / D)); g.fillStyle = el._c;
      for (let y = 0; y < d.H; y += b) for (let x = 0; x < d.W; x += b) { const c = cov(x, y, b); if (c > 0.05) { g.beginPath(); g.arc(x + b / 2, y + b / 2, b / 2 * Math.sqrt(c) * gr, 0, 7); g.fill(); } } }
    else if (m === 'mosaic') { const b = 24; g.font = '700 19px Mono'; g.textAlign = 'center'; g.textBaseline = 'middle'; const k = Math.floor(Math.max(lt, 0) * 12);
      for (let y = 0; y < d.H; y += b) for (let x = 0; x < d.W; x += b) { const c = cov(x, y, b) > 0.4, r = U.rnd('mo' + x + ':' + y, c ? Math.floor(k / 3) : k);
        const on = c && lt > 0.2 + U.rnd('mz', x * 7 + y) * D * 0.6; g.globalAlpha = on ? 1 : 0.32 * (1 - cl(lt / D)); g.fillStyle = on ? el._c : C.gray;
        g.font = (on ? '700 23px' : '400 17px') + ' Mono'; g.fillText(String(Math.floor(r * 10)), x + b / 2, y + b / 2 + 1); } }
    else if (m === 'weave') { const b = 12, rows = Math.ceil(d.H / b), cols = Math.ceil(d.W / b), dur = D * 0.9; g.fillStyle = el._c;
      for (let r = 0; r < rows; r++) { const rp = cl((lt - r / rows * dur * 0.7) / (dur * 0.3)); const nC = Math.floor(rp * cols);
        for (let c = 0; c < nC; c++) { const cx = r % 2 ? cols - 1 - c : c, x = cx * b, y = r * b; if (cov(x, y, b) > 0.45) g.fillRect(x, y + 1, b - 1, b - 2); } } }
    else { const b = 12, sx = d.W * io(lt / (D * 0.85)) ; g.globalAlpha = 1;
      for (let y = 0; y < d.H; y += b) for (let x = 0; x < d.W; x += b) { if (x + b / 2 > sx) continue; if (cov(x, y, b) <= 0.45) continue;
        const age = (sx - x) / (d.W * 0.18); g.fillStyle = age < 1 ? C.orange : el._c; g.fillRect(x, y, b - 1, b - 1); }
      if (lt < D * 0.85) { g.fillStyle = C.orange; g.fillRect(sx, 0, 4, d.H); } } } });

FX.add('num', 'slices', { desc: 'the figure is cut in horizontal slices that slide in from alternating sides and lock into one piece; e.n slices (7)', from: 'line-cascade,version-hero,thread-weave',
  prep(el, e) { const n = e.n || 7, t = es(fin(e)); const w = el._w = wrap(el, '<span class="b" style="opacity:0">' + t + '</span>');
    el._s = Array.from({ length: n }, (_, i) => { const s = H('<span style="position:absolute;left:0;top:0;clip-path:inset(' + (i / n * 100) + '% -5% ' + (100 - (i + 1) / n * 100 - 0.4) + '% -5%)">' + t + '</span>'); w.appendChild(s); return s; }); },
  draw(el, lt, e) { const n = el._s.length, D = 0.5; let done = true;
    el._s.forEach((s, i) => { const p = E.outQuart((lt - i * 0.055) / D); if (p < 1) done = false; s.style.transform = 'translateX(' + ((i % 2 ? 1 : -1) * 80 * (1 - p)).toFixed(1) + 'px)'; s.style.opacity = cl((lt - i * 0.055) / 0.12); s.style.display = ''; });
    el._w.firstChild.style.opacity = done ? 1 : 0; if (done) el._s.forEach(s => s.style.display = 'none'); } });

FX.add('num', 'flash', { desc: 'a fast count that lands with a camera-flash pop; e.bar draws an orange bar under the figure at the flash (lap-time freeze)', from: 'flash-count,split-flash',
  prep(el, e) { const w = el._w = wrap(el, '<span class="t"></span><i style="position:absolute;left:-30px;right:-30px;top:-20px;bottom:-20px;background:#fff;opacity:0"></i>' + (e.bar ? '<b style="position:absolute;left:0;bottom:-4px;height:14px;width:0;background:' + C.orange + '"></b>' : '')); },
  draw(el, lt, e) { const w = el._w, L = e.dur || 0.8, a = lt - L; w.querySelector('.t').textContent = lt >= L ? fin(e) : vs(e, lerp(e.from || 0, e.to || 0, E.outExpo(lt / L)));
    w.querySelector('i').style.opacity = a < 0 ? 0 : 0.85 * (1 - oc(a / 0.32)); w.style.transform = 'scale(' + (a < 0 ? 1 : 1 + 0.07 * (1 - oc(a / 0.3))) + ')';
    const b = w.querySelector('b'); if (b) { b.style.width = (oc(a / 0.25) * 100) + '%'; b.style.opacity = a < 0 ? 0 : 1; } } });

FX.add('num', 'sticker', { desc: 'sticker-style figure: while it counts, a new outline ring (paper, orange, paper, ink) is stacked around it every time it crosses a power of ten', from: 'fuchidori-count',
  prep(el, e) { const t = es(fin(e)); const rings = [[0.12, C.ink], [0.09, C.paper], [0.06, C.orange], [0.03, C.paper]];
    const w = el._w = wrap(el, rings.map(r => '<span class="r" style="position:absolute;left:0;top:0;color:' + r[1] + ';-webkit-text-stroke:' + r[0] + 'em ' + r[1] + '">' + t + '</span>').join('') + '<span class="t" style="position:relative">' + t + '</span>'); el._rs = [...w.querySelectorAll('.r')].reverse(); },
  draw(el, lt, e) { const D = e.dur || 1.3, a = Math.max(1, e.from || 0), b = Math.max(1, e.to || 0), v = lt >= D ? b : a * Math.pow(b / a, oc(lt / D));
    const s = lt >= D ? fin(e) : vs(e, e.decimals ? v : Math.round(v)); el._w.querySelectorAll('span').forEach(x => x.textContent = s);
    const pw = []; for (let k = Math.floor(Math.log10(a)) + 1; k <= Math.floor(Math.log10(b)); k++) pw.push(k); const sh = pw.slice(-4);
    let last = -9; el._rs.forEach((r, i) => { const at = i < sh.length ? null : D + (i - sh.length) * 0.07; const on = at == null ? v >= 10 ** sh[i] : lt >= at; r.style.opacity = on ? 1 : 0; });
    el._w.style.transform = 'scale(' + (1 + 0.035 * Math.sin(Math.PI * cl((lt - D) / 0.3))) + ')'; } });

FX.add('num', 'compact', { desc: 'counts up the long form (2,400,000) then retracts into the compact figure (2.4M) with the unit letter popping in; uses e.full or derives it from suffix K/M/B/bn', from: 'compact-stat,point-hop',
  prep(el, e) { const m = { k: 1e3, K: 1e3, M: 1e6, m: 1e6, B: 1e9, bn: 1e9, b: 1e9, T: 1e12 }[String(e.suffix || '').trim()];
    el._full = e.full || (m ? (e.to || 0) * m : null); const w = el._w = wrap(el, '<span class="a"></span><span class="b" style="position:absolute;left:0;top:0"></span>');
    const A = w.firstChild; A.textContent = (e.prefix || '') + fm(el._full || 0, 0); const wa = A.offsetWidth, cw = el.clientWidth || W; el._sc = Math.min(1, cw / Math.max(1, wa));
    A.style.display = 'inline-block'; A.style.transformOrigin = 'left 60%';
    const pr = e.prefix || '', num = fm(e.to || 0, e.decimals), suf = e.suffix || '';
    w.lastChild.innerHTML = '<span>' + es(pr + num) + '</span><span class="u" style="display:inline-block;transform-origin:left 70%">' + es(suf) + '</span>'; },
  draw(el, lt, e) { const w = el._w, A = w.firstChild, B = w.lastChild, L = 0.9, R = 0.35;
    if (!el._full) { A.textContent = ''; B.style.opacity = 1; B.style.position = 'static'; B.firstChild.textContent = vs({ prefix: e.prefix, decimals: e.decimals }, lerp(e.from || 0, e.to || 0, oc(lt / 1.2))); return; }
    const p = oc(lt / L), r = cl((lt - L) / R);
    A.textContent = (e.prefix || '') + fm(Math.round(el._full * p), 0); A.style.transform = 'scale(' + lerp(el._sc, 1, io(r)) + ')';
    A.style.clipPath = 'inset(-10% ' + (io(r) * 62) + '% -10% -5%)'; A.style.opacity = 1 - cl((r - 0.6) / 0.4);
    B.style.opacity = cl((r - 0.55) / 0.3); const u = B.querySelector('.u'), q = E.outBack((lt - L - R * 0.6) / 0.35); u.style.transform = 'scale(' + (lt < L + R * 0.6 ? 0 : q) + ')'; } });

const roman = n => { n = Math.max(1, Math.round(n)); const t = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let s = ''; t.forEach(([v, r]) => { while (n >= v) { s += r; n -= v; } }); return s; };
FX.add('num', 'roman', { desc: 'only for edition numbers up to 3999 (above that it counts normally): counts in Roman numerals with hard cuts (editions: Super Bowl LX, Olympiad XXXIII) and lands on the Roman form of e.to; prefix and suffix kept', from: 'roman-edition',
  prep(el, e) { el._w = wrap(el); if ((e.to || 0) > 3999) el._noRoman = 1; const a = Math.max(1, e.from || 1), b = Math.max(1, e.to || 1), n = Math.min(8, Math.abs(b - a)); const v = []; for (let k = 0; k <= n; k++) { const x = Math.round(lerp(a, b, k / Math.max(1, n))); if (!v.includes(x)) v.push(x); } el._v = v; },
  draw(el, lt, e) { if (el._noRoman) { el._w.textContent = (e.prefix || '') + fm(lerp(e.from || 0, e.to || 0, oc(lt / 0.9)), e.decimals) + (e.suffix || ''); return; } const v = el._v, n = v.length - 1, D = e.dur || 1.1; let k = 0; const at = i => D * (1 - Math.pow(1 - i / Math.max(1, n), 1.6)); while (k < n && lt >= at(k + 1)) k++;
    el._w.textContent = (e.prefix || '') + roman(v[k]) + (e.suffix || ''); const age = lt - at(k); el._w.style.transform = 'translateY(' + (k ? 26 * (1 - oc(age / 0.12)) : 0) + 'px)'; } });

FX.add('num', 'turn', { desc: 'the figure counts, then its unit sign (x, +, %, $) turns into place and the figure swells once; an x arrives as a plus that turns 45 degrees', from: 'times-turn,plus-open,zero-stretch',
  prep(el, e) { const sym = c => '<span class="fx-sym s" style="transform-origin:50% 55%">' + es(c) + '</span>'; const num = fm(e.to || 0, e.decimals);
    el._w = wrap(el, Array.from(e.prefix || '').map(sym).join('') + '<span class="n"></span>' + Array.from(e.suffix || '').map(sym).join('')); el._w.querySelector('.n').textContent = num; },
  draw(el, lt, e) { const w = el._w, D = 0.8; w.querySelector('.n').textContent = fm(lt >= D ? e.to || 0 : lerp(e.from || 0, e.to || 0, oc(lt / D)), e.decimals);
    w.querySelectorAll('.s').forEach((s, i) => { const a = lt - D + 0.15 + i * 0.06, x = /^[x×X]$/.test(s.textContent); const q = cl(a / 0.45);
      s.style.transform = a < 0 ? 'scale(0)' : 'rotate(' + ((x ? 45 : -180) * (1 - E.outBack(q))) + 'deg) scale(' + oc(q / 0.6) + ')'; });
    const b = lt - D - 0.35; w.style.transform = 'scale(' + (b > 0 ? 1 + 0.06 * Math.sin(Math.PI * cl(b / 0.4)) : 1) + ')'; } });

FX.add('num', 'focus', { desc: 'four orange viewfinder brackets fly in and snap tight around the figure while it counts; e.tag adds a small mono chip beside it', from: 'bracket-focus,crosshair-lock',
  prep(el, e) { const k = (x, y, r) => '<svg class="k" width="54" height="54" style="position:absolute;' + x + ';' + y + ';transform-origin:center"><path d="M5 49 V5 H49" fill="none" stroke="' + C.orange + '" stroke-width="9" transform="rotate(' + r + ' 27 27)"/></svg>';
    el._w = wrap(el, '<span class="t" style="position:relative;display:inline-block">' + es(fin(e)) + k('left:-26px', 'top:0.02em', 0) + k('right:-26px', 'top:0.02em', 90) + k('right:-26px', 'bottom:0.0em', 180) + k('left:-26px', 'bottom:0.0em', 270) + '</span>' + (e.tag ? '<span class="g" style="display:inline-block;vertical-align:middle;margin-left:46px;font:700 26px Mono;letter-spacing:.08em;color:#fff;background:' + C.orange + ';padding:8px 14px">' + es(e.tag) + '</span>' : '')); },
  draw(el, lt, e) { const t = el._w.querySelector('.t'), D = 0.9; t.firstChild.textContent = lt >= D ? fin(e) : vs(e, lerp(e.from || 0, e.to || 0, oc(lt / D)));
    t.querySelectorAll('.k').forEach((k, i) => { const s = U.spring(lt - 0.3 - i * 0.05, { damping: 13, stiffness: 170 }), dx = [-1, 1, 1, -1][i], dy = [-1, -1, 1, 1][i];
      k.style.transform = 'translate(' + dx * 90 * (1 - s) + 'px,' + dy * 70 * (1 - s) + 'px)'; k.style.opacity = cl((lt - 0.3 - i * 0.05) / 0.12); });
    const g = el._w.querySelector('.g'); if (g) { const q = oc((lt - 0.75) / 0.3); g.style.opacity = q; g.style.transform = 'translateX(' + (1 - q) * -20 + 'px)'; } } });

FX.add('num', 'ruler', { desc: 'the figure counts above a ruler of ticks while an orange marker slides along it (e.mode "slide", default) or the ticks scrub under a fixed marker ("scrub"); ends show e.from and e.to', from: 'pitch-over,ruler-scrub',
  prep(el, e) { el._w = wrap(el); const sv = el._sv = document.createElementNS(NS, 'svg'); sv.setAttribute('width', W); sv.setAttribute('height', 92); sv.style.cssText = 'display:block;margin-top:6px;overflow:hidden'; el.appendChild(sv);
    const g = el._g = S('g', {}, sv), n = e.mode === 'scrub' ? 120 : 40; for (let i = 0; i <= n; i++) { const x = i * W / 40, maj = i % 5 === 0; S('rect', { x: x - 1.5, y: maj ? 8 : 26, width: 3, height: maj ? 48 : 30, fill: maj ? C.ink : C.gray }, g); }
    if (e.mode !== 'scrub') [[0, 'start', e.from || 0], [W, 'end', e.to || 0]].forEach(([x, a, v]) => { const t = S('text', { x, y: 86, 'text-anchor': a, 'font-family': 'Mono', 'font-size': 22, fill: C.mute }, sv); t.textContent = fm(v, e.decimals); });
    el._m = S('g', {}, sv); S('rect', { x: -3, y: 0, width: 6, height: 64, fill: C.orange }, el._m); S('path', { d: 'M-14 0 H14 L0 16 Z', fill: C.orange }, el._m); },
  draw(el, lt, e) { const D = e.dur || 1.3, p = io(lt / D); el._w.textContent = lt >= D ? fin(e) : vs(e, lerp(e.from || 0, e.to || 0, p));
    if (e.mode === 'scrub') { el._m.setAttribute('transform', 'translate(' + W / 2 + ',0)'); el._g.setAttribute('transform', 'translate(' + (-p * W * 2) + ',0)'); }
    else el._m.setAttribute('transform', 'translate(' + (6 + p * (W - 12)) + ',0)'); el._sv.style.opacity = cl(lt / 0.2); } });

FX.add('num', 'strike', { desc: 'the old value (e.from) is struck through in orange and set aside small and gray, while the new value (e.to) spins in on digit reels', from: 'price-slate',
  prep(el, e) { const w = el._w = wrap(el, '<span class="o" style="position:absolute;left:0;top:0;color:' + C.gray + ';transform-origin:left top;white-space:nowrap">' + es(vs(e, e.from || 0)) + '<i style="position:absolute;left:-2%;top:50%;height:0.07em;background:' + C.orange + ';width:0"></i></span><span class="n"></span>');
    el._r = reels(w.querySelector('.n'), e, 3); const o = w.firstChild, ow = o.offsetWidth, nw = w.querySelector('.n').offsetWidth, cw = el.clientWidth || W; el._side = nw + 30 + ow * 0.3 <= cw ? nw + 30 : null; },
  draw(el, lt, e) { const o = el._w.firstChild, i = o.querySelector('i'), n = el._w.querySelector('.n'); i.style.width = oc((lt - 0.1) / 0.3) * 104 + '%';
    const m = io((lt - 0.5) / 0.45); o.style.transform = el._side != null ? 'translate(' + m * el._side + 'px,' + m * 0.04 + 'em) scale(' + lerp(1, 0.3, m) + ')' : 'translateY(' + (-m * 40) + 'px) scale(' + lerp(1, 0.6, m) + ')';
    o.style.opacity = el._side != null ? 1 : 1 - m; n.style.opacity = cl((lt - 0.55) / 0.15);
    el._r.forEach(x => { if (x.k !== 'd') return; const L = 1.05 + x.j * 0.08; setReel(x, (10 + x.d) * E.outQuart((lt - 0.55) / (L - 0.55))); }); } });

// ============================================================ ELS (elementi nuovi)
FX.css(`.fx-k{font:700 22px Mono;letter-spacing:.06em;color:#6E6A62;text-transform:uppercase}
.fx-l{font:700 30px/1.2 Inter;color:${C.ink}}
.fx-v{font:900 36px Inter;color:${C.blue}}
.fx-big{font:400 110px/1 Anton;color:${C.blue};white-space:nowrap}
.fx-cap{font:700 36px/1.25 Inter;color:${C.ink}}.fx-cap b{color:${C.blue}}
.el svg{overflow:visible}`);
const box = (name, html, st) => H('<div class="el fx-' + name + '"' + (st ? ' style="' + st + '"' : '') + '>' + (html || '') + '</div>');
// conta fino al numero contenuto in un testo ("$1.2bn", "38%"); se il testo non ha un solo numero resta fisso
const cnum = (txt, p) => { txt = String(txt ?? ''); const m = txt.match(/^([^0-9]*)([0-9][0-9,]*(?:\.[0-9]+)?)(.*)$/); if (!m || /[0-9]/.test(m[3]) || p >= 1) return txt;
  const n = parseFloat(m[2].replace(/,/g, '')), d = (m[2].split('.')[1] || '').length; return m[1] + (m[2].includes(',') ? fm(n * p, d) : (n * p).toFixed(d)) + m[3]; };
const txt = (par, a, s) => { const t = S('text', Object.assign({ 'font-family': 'Inter', 'font-weight': 700, 'font-size': 26, fill: C.ink }, a), par); t.textContent = s ?? ''; return t; };
const svgN = (w, h) => { const s = document.createElementNS(NS, 'svg'); s.setAttribute('width', w); s.setAttribute('height', h); s.style.display = 'block'; return s; };
const capHtml = e => (e.label ? '<div class="fx-cap" style="margin-top:14px">' + mdx(e.label) + '</div>' : '');
const hiCol = (k, hi, i) => k === hi ? C.orange : [C.blue, C.ink, '#8A93A6', C.gray][(i ?? k) % 4];
const ITEMS = e => (e.items || []);
// sfx: un "fill" per voce
const sfxFill = (e, t0, T, add) => ITEMS(e).forEach((it, k) => add(T(it && it.at, t0 + k * 0.5), 'fill'));
const sfxPop = (e, t0, T, add) => ITEMS(e).forEach((it, k) => add(T(it && it.at, t0 + k * 0.5), 'pop', { g: 0.6 }));

// ---------- rings: anelli concentrici (fino a 3 metriche) con la legenda che conta
FX.add('els', 'rings', { desc: 'grafico. Concentric progress rings (max 3) that lap toward their goal, legend values counting beside them. items:[{label,value (0-100),display}]', from: 'activity-rings',
  build(e) { const its = ITEMS(e).slice(0, 3), Z = 360, cols = [C.blue, C.orange, C.ink], RR = [158, 112, 66], SW = 36;
    const n = box('rings', '', 'display:flex;align-items:center;gap:34px'); const sv = svgN(Z, Z); n.appendChild(sv); const lg = H('<div style="flex:1;display:flex;flex-direction:column;gap:22px"></div>'); n.appendChild(lg);
    const R = its.map((it, k) => { const r = RR[k], c = 2 * Math.PI * r; S('circle', { cx: Z / 2, cy: Z / 2, r, fill: 'none', stroke: C.line, 'stroke-width': SW }, sv);
      const a = S('circle', { cx: Z / 2, cy: Z / 2, r, fill: 'none', stroke: cols[k], 'stroke-width': SW, 'stroke-linecap': 'round', transform: 'rotate(-90 ' + Z / 2 + ' ' + Z / 2 + ')', 'stroke-dasharray': '0 ' + c }, sv);
      const l = H('<div><div class="fx-k">' + es(it.label) + '</div><div style="font:400 72px/1 Anton;color:' + cols[k] + '"></div></div>'); lg.appendChild(l); return { a, c, l, v: l.lastChild }; });
    return { n, upd(lt, t, t0) { R.forEach((x, k) => { const it = its[k], s = tAt(e, k, t0), p = oc((t - s) / 1.1); x.a.setAttribute('stroke-dasharray', (x.c * Math.min(100, it.value) / 100 * p) + ' ' + x.c);
      x.a.style.opacity = t >= s ? 1 : 0; x.l.style.opacity = cl((t - s) / 0.3); x.v.textContent = cnum(it.display ?? (it.value + '%'), p); }); } }; }, sfx: sfxFill });

// ---------- circles: aree a confronto (affiancate o una dentro l'altra)
FX.add('els', 'circles', { desc: 'grafico. Discs whose AREA is proportional to the value, side by side (layout "side", default) or nested on one baseline ("nested"); optional big stat. items:[{label,value,display}], layout, stat, highlight', from: 'area-compare,concentric-scale',
  build(e) { const its = ITEMS(e), mx = Math.max(...its.map(i => i.value)) || 1, hi = e.highlight ?? its.length - 1, nest = e.layout === 'nested';
    const rs = its.map(i => Math.sqrt(i.value / mx)); const sum = rs.reduce((a, b) => a + b, 0); const Rm = nest ? 220 : Math.min(200, (W - 30 * (its.length - 1)) / (2 * sum));
    const Hh = 2 * Rm + 90; const n = box('circles', '<svg width="' + W + '" height="' + Hh + '"></svg>' + (e.stat ? '<div class="fx-big" style="color:' + C.orange + ';margin-top:6px">' + es(e.stat) + '</div>' : '') + capHtml(e)); const sv = n.firstChild;
    let x = 0; const G = its.map((it, k) => { const r = rs[k] * Rm; const cx = nest ? Rm : x + r; x += 2 * r + 30; const cy = 2 * Rm - r;
      const g = S('g', { transform: 'translate(' + cx + ' ' + cy + ')' }, sv); const c = S('circle', { r, fill: hiCol(k, hi), 'fill-opacity': nest && k !== hi ? 0.18 : 1, stroke: nest ? hiCol(k, hi) : 'none', 'stroke-width': 3 }, g);
      const ly = nest ? -r + 34 : r + 46; const l = txt(g, { x: 0, y: ly, 'text-anchor': 'middle', 'font-size': nest ? 24 : 26, fill: nest && k === hi ? C.paper : C.ink }, (it.label || '') + (nest ? '  ' : ' · ') + disp(it));
      if (nest) { l.setAttribute('y', k === hi ? 8 : -r + 34); } return { g, c, l }; });
    if (nest) G.slice().reverse().forEach(x => sv.appendChild(x.g));
    const st = n.querySelector('.fx-big');
    return { n, upd(lt, t, t0) { G.forEach((x, k) => { const s = tAt(e, k, t0), p = U.spring(t - s, { damping: 14, stiffness: 140 }); x.c.setAttribute('transform', 'scale(' + p + ')'); x.l.style.opacity = cl((t - s - 0.3) / 0.3); });
      if (st) { const s = tAt(e, its.length - 1, t0) + 0.6, q = oc((t - s) / 0.4); st.style.opacity = q; st.style.transform = 'translateY(' + (1 - q) * 20 + 'px)'; } } }; } });

// ---------- balance: altalena che pende verso il peso maggiore
FX.add('els', 'balance', { desc: 'grafico. A seesaw: the first item lands and tips the beam, the second lands and the beam swings to the heavier side. items:[{label,value,display}] (2 items)', from: 'balance-beam',
  build(e) { const its = ITEMS(e).slice(0, 2), Hh = 420, cx = W / 2, cy = 330, L = 300, mx = Math.max(...its.map(i => i.value)) || 1;
    const n = box('balance', '<svg width="' + W + '" height="' + Hh + '"></svg>' + capHtml(e)); const sv = n.firstChild;
    S('path', { d: 'M' + cx + ' ' + (cy + 4) + ' L' + (cx - 46) + ' ' + (cy + 80) + ' H' + (cx + 46) + ' Z', fill: C.ink }, sv); S('rect', { x: 40, y: cy + 80, width: W - 80, height: 6, fill: C.line }, sv);
    const beam = S('g', {}, sv); S('rect', { x: cx - L, y: cy - 8, width: 2 * L, height: 16, rx: 8, fill: C.ink }, beam);
    const B = its.map((it, k) => { const h = 60 + 150 * it.value / mx, x = k ? cx + L - 150 : cx - L; const g = S('g', {}, beam);
      S('rect', { x, y: cy - 8 - h, width: 150, height: h, fill: k ? C.orange : C.blue }, g); txt(g, { x: x + 75, y: cy - 22 - h, 'text-anchor': 'middle', 'font-size': 44, 'font-weight': 900, fill: k ? C.orange : C.blue }, disp(it));
      txt(g, { x: x + 75, y: cy - 22 - h - 50, 'text-anchor': 'middle', 'font-size': 24 }, it.label); return g; });
    const th = (w0, w1) => 11 * (w1 - w0) / Math.max(1, w0 + w1);
    return { n, upd(lt, t, t0) { const s0 = tAt(e, 0, t0), s1 = tAt(e, 1, t0), a0 = its[0] ? its[0].value : 0, a1 = its[1] ? its[1].value : 0; const sp = x => U.spring(x, { damping: 7, stiffness: 60 });
      const ang = th(a0, 0) * sp(t - s0) + (th(a0, a1) - th(a0, 0)) * sp(t - s1); beam.setAttribute('transform', 'rotate(' + ang + ' ' + cx + ' ' + cy + ')');
      B.forEach((g, k) => { const s = k ? s1 : s0, q = oc((t - s) / 0.35); g.style.opacity = cl((t - s) / 0.15); g.setAttribute('transform', 'translate(0 ' + (-(1 - q) * 120) + ')'); }); } }; } });

// ---------- race: corsie su un cronometro comune
FX.add('els', 'race', { desc: 'grafico. Lanes race on one shared clock: each runner reaches the line in proportion to its time (lower value = faster, e.higher for "more is faster"); the winner lands first in orange; optional stat. items:[{label,value,display}], stat, dur (race seconds, 1.4)', from: 'benchmark-race,timer-duel',
  build(e) { const its = ITEMS(e), n = box('race', '<div class="ln"></div>' + (e.stat ? '<div class="fx-big" style="color:' + C.orange + ';margin-top:20px">' + es(e.stat) + '</div>' : '') + capHtml(e)); const ln = n.firstChild, TW = W - 170;
    const vals = its.map(i => i.value), best = e.higher ? Math.max(...vals) : Math.min(...vals), slow = e.higher ? Math.min(...vals) : Math.max(...vals);
    const L = its.map((it, k) => { const d = H('<div style="margin-bottom:26px"><div class="fx-l" style="margin-bottom:8px">' + es(it.label) + '</div><div style="position:relative;height:44px"><i style="position:absolute;left:0;top:20px;height:4px;width:' + TW + 'px;background:' + C.line + '"></i><i style="position:absolute;left:' + TW + 'px;top:0;width:4px;height:44px;background:' + C.ink + '"></i><b style="position:absolute;top:0;width:44px;height:44px;border-radius:50%;background:' + (it.value === best ? C.orange : C.blue) + '"></b><span class="fx-v" style="position:absolute;left:' + (TW + 20) + 'px;top:-2px;opacity:0;color:' + (it.value === best ? C.orange : C.ink) + '">' + es(disp(it)) + '</span></div></div>'); ln.appendChild(d);
      const fT = (e.dur || 1.4) * (e.higher ? (slow / Math.max(1e-9, it.value)) : it.value / Math.max(1e-9, slow)) * (e.higher ? 1 : 1); return { d, b: d.querySelector('b'), v: d.querySelector('span'), f: Math.min(e.dur || 1.4, fT) }; });
    const st = n.querySelector('.fx-big');
    return { n, upd(lt, t, t0) { const go = tAt(e, its.length - 1, t0) + 0.25; L.forEach((x, k) => { const s = tAt(e, k, t0); x.d.style.opacity = cl((t - s) / 0.25);
      const p = cl((t - go) / x.f); x.b.style.left = (p * (TW - 44)) + 'px'; x.v.style.opacity = cl((t - go - x.f) / 0.15); });
      if (st) { const q = oc((t - go - Math.min(...L.map(x => x.f)) - 0.2) / 0.35); st.style.opacity = q; st.style.transform = 'scale(' + (0.8 + 0.2 * q) + ')'; st.style.transformOrigin = 'left center'; } } }; },
  sfx(e, t0, T, add) { const its = ITEMS(e); its.forEach((it, k) => add(T(it.at, t0 + k * 0.5), 'pop', { g: 0.5 })); add(T(its.length ? its[its.length - 1].at : null, t0 + (its.length - 1) * 0.5) + 0.35, 'roll', { d: e.dur || 1.4 }); } });

// ---------- columns: colonne verticali con varianti
FX.add('els', 'columns', { desc: 'grafico. Vertical columns: mode "spring" (overshoot, default), "pixel" (LED cells light up), "iso" (3D blocks rising like a skyline), "log" (rescales to a log axis after the last column so small values become visible); target draws a dashed goal line that the highlight can break through. items:[{label,value,display}], highlight, max, target:{value,label}, mode', from: 'spring-bars,pixel-bars,off-the-charts,log-rescale,block-city,cut-stat',
  build(e) { const its = ITEMS(e), m = e.mode || 'spring', hi = e.highlight ?? its.length - 1, Hc = 380, top = 60, nI = its.length, gap = Math.max(16, 60 - nI * 6), cw = (W - gap * (nI - 1)) / nI;
    const mx = e.max || Math.max(...its.map(i => i.value), e.target ? e.target.value : 0) || 1; const lmin = Math.log10(Math.max(1e-9, Math.min(...its.map(i => i.value)) / 2)), lmax = Math.log10(mx);
    const n = box('columns', '<svg width="' + W + '" height="' + (Hc + top + 50) + '"></svg>' + capHtml(e)); const sv = n.firstChild; const base = top + Hc;
    S('rect', { x: 0, y: base, width: W, height: 3, fill: C.ink }, sv);
    let tg = null; if (e.target) { tg = S('g', {}, sv); const y = base - Hc * e.target.value / mx; S('line', { x1: 0, x2: W, y1: y, y2: y, stroke: C.orange, 'stroke-width': 3, 'stroke-dasharray': '12 9' }, tg); txt(tg, { x: 0, y: y - 10, 'text-anchor': 'start', 'font-family': 'Mono', 'font-size': 20, fill: C.orange }, e.target.label || 'TARGET'); }
    const lg = m === 'log' ? txt(sv, { x: 0, y: 20, 'font-family': 'Mono', 'font-size': 20, fill: C.mute }, 'LOG SCALE') : null;
    const Cs = its.map((it, k) => { const x = k * (cw + gap), g = S('g', {}, sv), col = k === hi ? C.orange : C.blue; let r = null, cells = [], side = null, topf = null;
      if (m === 'pixel') { const cs = 16, cols = Math.max(1, Math.floor(cw / (cs + 4))), rows = Math.floor(Hc / (cs + 4)); for (let rr = 0; rr < rows; rr++) for (let c = 0; c < cols; c++) cells.push(S('rect', { x: x + c * (cs + 4) + (cw - cols * (cs + 4)) / 2, y: base - 6 - (rr + 1) * (cs + 4) + 4, width: cs, height: cs, fill: C.line }, g)); cells.rows = rows; cells.cols = cols; }
      else { r = S('rect', { x, width: cw, fill: col }, g); if (m === 'iso') { side = S('path', { fill: k === hi ? '#C24E0C' : C.ink }, g); topf = S('path', { fill: k === hi ? C.mark : '#8FA6EA' }, g); } }
      const v = txt(g, { x: x + cw / 2, 'text-anchor': 'middle', 'font-size': cw < 90 ? 26 : 34, 'font-weight': 900, fill: col }, disp(it)); const l = txt(g, { x: x + cw / 2, y: base + 34, 'text-anchor': 'middle', 'font-family': 'Mono', 'font-size': cw < 90 ? 18 : 22, fill: C.mute }, it.label);
      return { g, r, cells, side, topf, v, l, x }; });
    const ends = () => tAt(e, nI - 1, 0) ;
    return { n, upd(lt, t, t0) { const tl = tAt(e, nI - 1, t0) + 0.9, lp = m === 'log' ? io((t - tl) / 0.8) : 0; if (lg) lg.style.opacity = lp; if (tg) tg.style.opacity = cl(lt / 0.3);
      Cs.forEach((c, k) => { const it = its[k], s = tAt(e, k, t0); const lin = it.value / mx, lgv = (Math.log10(Math.max(1e-9, it.value)) - lmin) / (lmax - lmin || 1); const fr = lerp(lin, lgv, lp);
        const p = m === 'spring' ? U.spring(t - s, { damping: 9, stiffness: 110 }) : m === 'iso' ? E.outBack((t - s) / 0.7) : oc((t - s) / 0.7); const h = Math.max(0, Hc * fr * p);
        c.g.style.opacity = t >= s ? 1 : 0;
        if (m === 'pixel') { const on = Math.round(c.cells.rows * fr * cl((t - s) / 0.6)); c.cells.forEach((q, i) => { const rr = Math.floor(i / c.cells.cols); q.setAttribute('fill', rr < on ? (k === hi ? (rr % 2 ? C.orange : C.blue) : C.blue) : C.line); }); c.v.setAttribute('y', base - Hc * fr * cl((t - s) / 0.6) - 14); }
        else { c.r.setAttribute('y', base - h); c.r.setAttribute('height', h); c.v.setAttribute('y', base - h - (m === 'iso' ? 30 : 14));
          if (m === 'iso') { const d = Math.min(18, cw * 0.18); c.side.setAttribute('d', 'M' + (c.x + cw) + ' ' + base + ' V' + (base - h) + ' l' + d + ' ' + (-d) + ' V' + (base - d) + ' Z'); c.topf.setAttribute('d', 'M' + c.x + ' ' + (base - h) + ' h' + cw + ' l' + d + ' ' + (-d) + ' h' + (-cw) + ' Z'); } }
        c.v.style.opacity = cl((t - s - 0.35) / 0.25); }); } }; }, sfx: sfxFill });

// ---------- tree: da una radice a tante foglie, livello per livello
FX.add('els', 'tree', { desc: 'grafico. A tree that branches level by level from one root into many nodes (e.g. 1 club, 4 academies, 40 coaches), then lands the leaf count. items:[{n,label}] (one per level, n up to 40), display, label', from: 'branch-tree',
  build(e) { const its = ITEMS(e), rowH = 118, Hh = its.length * rowH + 20; const n = box('tree', '<svg width="' + W + '" height="' + Hh + '"></svg>' + (e.display ? '<div class="fx-big" style="margin-top:10px">' + es(e.display) + '</div>' : '') + capHtml(e)); const sv = n.firstChild;
    const pos = its.map((it, k) => { const m = Math.min(40, it.n || 1); return Array.from({ length: m }, (_, i) => [m === 1 ? W / 2 : 30 + i * (W - 60) / (m - 1), 30 + k * rowH + 26]); });
    const L = its.map((it, k) => { const g = S('g', {}, sv), ed = [], nd = []; const r = Math.max(6, Math.min(20, (W - 60) / Math.max(1, pos[k].length) * 0.32));
      pos[k].forEach((p, i) => { if (k) { const pp = pos[k - 1][Math.floor(i * pos[k - 1].length / pos[k].length)]; ed.push(S('line', { x1: pp[0], y1: pp[1], x2: pp[0], y2: pp[1], stroke: C.gray, 'stroke-width': 3 }, g)); ed[ed.length - 1]._a = pp; ed[ed.length - 1]._b = p; }
        nd.push(S('circle', { cx: p[0], cy: p[1], r, fill: k === its.length - 1 ? C.orange : k ? C.blue : C.ink }, g)); });
      const lb = txt(g, { x: 0, y: 30 + k * rowH - 8, 'font-family': 'Mono', 'font-size': 20, fill: C.mute }, (it.n + ' ' + (it.label || '')).toUpperCase()); return { g, ed, nd, lb }; });
    L.slice().reverse().forEach(l => l.ed.forEach(x => sv.insertBefore(x, sv.firstChild)));
    const big = n.querySelector('.fx-big');
    return { n, upd(lt, t, t0) { L.forEach((l, k) => { const s = tAt(e, k, t0), p = io((t - s) / 0.45);
      l.ed.forEach(x => { x.setAttribute('x2', lerp(x._a[0], x._b[0], p)); x.setAttribute('y2', lerp(x._a[1], x._b[1], p)); x.style.opacity = t >= s ? 1 : 0; });
      l.nd.forEach((c, i) => { const q = E.outBack((t - s - 0.3 - i * 0.008) / 0.3); c.setAttribute('transform', 'translate(' + c.getAttribute('cx') + ' ' + c.getAttribute('cy') + ') scale(' + Math.max(0, q) + ') translate(' + (-c.getAttribute('cx')) + ' ' + (-c.getAttribute('cy')) + ')'); });
      l.lb.style.opacity = cl((t - s) / 0.3); });
      if (big) { const s = tAt(e, its.length - 1, t0) + 0.7; big.style.opacity = cl((t - s) / 0.3); big.textContent = cnum(e.display, oc((t - s) / 0.6)); } } }; }, sfx: sfxPop });

// ---------- bubbles: bolle impacchettate
const pack = rs => { const P = []; rs.forEach((r, i) => { if (!i) { P.push([0, 0, r]); return; } let best = null;
  P.forEach(q => { for (let a = 0; a < 48; a++) { const an = a / 48 * Math.PI * 2, x = q[0] + Math.cos(an) * (q[2] + r + 6), y = q[1] + Math.sin(an) * (q[2] + r + 6) * 0.9;
    if (P.every(o => Math.hypot(o[0] - x, o[1] - y) >= o[2] + r + 5)) { const d = Math.hypot(x * 0.8, y * 1.3); if (!best || d < best[3]) best = [x, y, r, d]; } } }); P.push(best.slice(0, 3)); }); return P; };
FX.add('els', 'bubbles', { desc: 'grafico. Packed bubbles sized by value grow in one by one around the biggest (highlighted) one. items:[{label,value,display}], highlight (default the biggest)', from: 'bubble-pack,shape-pack',
  build(e) { const its = ITEMS(e), mx = Math.max(...its.map(i => i.value)) || 1, hi = e.highlight ?? its.findIndex(i => i.value === mx);
    const ord = its.map((it, k) => k).sort((a, b) => its[b].value - its[a].value); const P0 = pack(ord.map(k => Math.sqrt(its[k].value / mx) * 100));
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; P0.forEach(p => { x0 = Math.min(x0, p[0] - p[2]); x1 = Math.max(x1, p[0] + p[2]); y0 = Math.min(y0, p[1] - p[2]); y1 = Math.max(y1, p[1] + p[2]); });
    const sc = Math.min(W / (x1 - x0), 520 / (y1 - y0)), Hh = (y1 - y0) * sc; const n = box('bubbles', '<svg width="' + W + '" height="' + Hh + '"></svg>' + capHtml(e)); const sv = n.firstChild;
    const B = []; ord.forEach((k, j) => { const p = P0[j], it = its[k], cx = (p[0] - x0) * sc + (W - (x1 - x0) * sc) / 2, cy = (p[1] - y0) * sc, r = p[2] * sc; const g = S('g', { transform: 'translate(' + cx + ' ' + cy + ')' }, sv); const ig = S('g', {}, g);
      S('circle', { r, fill: hiCol(k, hi, j) }, ig); const fc = hiCol(k, hi, j) === C.gray ? C.ink : C.paper;
      if (r > 62) { txt(ig, { y: -6, 'text-anchor': 'middle', 'font-size': Math.min(26, r / 3.2), fill: fc }, it.label); txt(ig, { y: r > 90 ? 44 : 30, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-weight': 400, 'font-size': Math.min(64, r / 2.1), fill: fc }, disp(it)); }
      else txt(ig, { y: 9, 'text-anchor': 'middle', 'font-size': Math.max(16, r / 2.6), 'font-weight': 800, fill: fc }, disp(it));
      B[k] = ig; });
    return { n, upd(lt, t, t0) { B.forEach((g, k) => { const s = tAt(e, k, t0); g.setAttribute('transform', 'scale(' + Math.max(0, U.spring(t - s, { damping: 12, stiffness: 150 })) + ')'); }); } }; }, sfx: sfxPop });

// ---------- calendar: un mese, giorni segnati
FX.add('els', 'calendar', { desc: 'grafico. A month calendar draws itself, tagged days get a dot and a line below (fixtures, deadlines), the key day is ringed in orange. month (1-12), year, items:[{day,label}], highlight (day)', from: 'calendar-pick,launch-date',
  build(e) { const its = ITEMS(e), y = e.year || 2026, m = (e.month || 1) - 1, first = (new Date(y, m, 1).getDay() + 6) % 7, nd = new Date(y, m + 1, 0).getDate(), MN = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const rows = Math.ceil((first + nd) / 7), cw = W / 7, ch = 74, Hh = 110 + rows * ch; const n = box('calendar', '<svg width="' + W + '" height="' + Hh + '"></svg><div class="tg" style="margin-top:16px;display:flex;flex-direction:column;gap:8px"></div>'); const sv = n.firstChild;
    txt(sv, { x: 0, y: 50, 'font-family': 'Anton', 'font-weight': 400, 'font-size': 56 }, MN[m] + ' ' + y); ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((d, i) => txt(sv, { x: i * cw + cw / 2, y: 96, 'text-anchor': 'middle', 'font-family': 'Mono', 'font-size': 20, fill: C.mute }, d));
    const D = []; for (let d = 1; d <= nd; d++) { const i = first + d - 1, cx = (i % 7) * cw + cw / 2, cy = 110 + Math.floor(i / 7) * ch + ch / 2; const g = S('g', {}, sv);
      const rg = S('circle', { cx, cy: cy - 2, r: 32, fill: 'none', stroke: C.orange, 'stroke-width': 6, opacity: 0 }, g); const dt = S('circle', { cx, cy: cy + 22, r: 5, fill: C.orange, opacity: 0 }, g);
      const tx = txt(g, { x: cx, y: cy + 8, 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 700, fill: (i % 7) > 4 ? C.mute : C.ink }, d); D[d] = { g, rg, dt, tx, cx, cy }; }
    const tg = n.querySelector('.tg'); const T2 = its.map(it => { const l = H('<div class="fx-l" style="font-size:28px"><span style="font:700 24px Mono;color:' + C.orange + ';margin-right:14px">' + String(it.day).padStart(2, '0') + ' ' + MN[m].slice(0, 3) + '</span>' + es(it.label) + '</div>'); tg.appendChild(l); return l; });
    return { n, upd(lt, t, t0) { for (let d = 1; d <= nd; d++) D[d].g.style.opacity = cl((lt - d * 0.018) / 0.2);
      its.forEach((it, k) => { const s = tAt(e, k, t0), x = D[it.day]; if (!x) return; const on = t >= s; x.dt.setAttribute('opacity', on ? 1 : 0); if (on && !(e.highlight === it.day)) x.tx.setAttribute('fill', C.blue); T2[k].style.opacity = cl((t - s) / 0.3); });
      const h = D[e.highlight]; if (h) { const k = its.findIndex(i => i.day === e.highlight); const s = k >= 0 ? tAt(e, k, t0) : t0 + 0.8, q = E.outBack((t - s) / 0.4); h.rg.setAttribute('opacity', t >= s ? 1 : 0); h.rg.setAttribute('r', 32 * Math.max(0, q)); h.tx.setAttribute('fill', t >= s ? C.orange : C.ink); } } }; }, sfx: sfxPop });

// ---------- candles: candele che superano il massimo precedente
FX.add('els', 'candles', { desc: 'grafico. Candlesticks (blue up, orange down) build left to right and rally past the prior high, then a tag and a price land. values:[closing prices, 8-24], prev (prior high), tag (default ALL-TIME HIGH), display, label, dur', from: 'candle-rally',
  build(e) { const v = e.values || [], N = v.length, Hc = 380, top = 30; const O = v.map((c, i) => i ? v[i - 1] : c * 0.97), Hi = v.map((c, i) => Math.max(c, O[i]) * (1 + 0.012 + 0.02 * U.rnd('ch', i))), Lo = v.map((c, i) => Math.min(c, O[i]) * (1 - 0.012 - 0.02 * U.rnd('cl', i)));
    const mn = Math.min(...Lo, e.prev ?? Infinity), mx = Math.max(...Hi, e.prev ?? -Infinity), Y = x => top + Hc - (x - mn) / (mx - mn || 1) * Hc, cw = W / N;
    const n = box('candles', '<svg width="' + W + '" height="' + (Hc + top + 20) + '"></svg>' + (e.display ? '<div style="display:flex;align-items:center;gap:22px;margin-top:6px"><div class="fx-big">' + es(e.display) + '</div><div class="tg" style="font:700 24px Mono;letter-spacing:.06em;color:#fff;background:' + C.orange + ';padding:8px 14px">' + es(e.tag || 'ALL-TIME HIGH') + '</div></div>' : '') + capHtml(e)); const sv = n.firstChild;
    let pv = null; if (e.prev != null) { pv = S('g', {}, sv); S('line', { x1: 0, x2: W, y1: Y(e.prev), y2: Y(e.prev), stroke: C.mute, 'stroke-width': 2, 'stroke-dasharray': '8 8' }, pv); txt(pv, { x: 0, y: Y(e.prev) - 10, 'font-family': 'Mono', 'font-size': 20, fill: C.mute }, 'PRIOR HIGH ' + fm(e.prev, 0)); }
    const K = v.map((c, i) => { const up = c >= O[i], col = up ? C.blue : C.orange, x = i * cw + cw / 2, g = S('g', {}, sv); S('line', { x1: x, x2: x, y1: Y(Hi[i]), y2: Y(Lo[i]), stroke: col, 'stroke-width': 3 }, g);
      S('rect', { x: x - cw * 0.32, width: cw * 0.64, y: Y(Math.max(c, O[i])), height: Math.max(3, Math.abs(Y(c) - Y(O[i]))), fill: col }, g); return g; });
    const tail = n.querySelector('.fx-big') && n.querySelector('.fx-big').parentNode;
    return { n, upd(lt) { const D = e.dur || 1.6; if (pv) pv.style.opacity = cl(lt / 0.3); K.forEach((g, i) => { const s = i / N * D, q = oc((lt - s) / 0.18); g.style.opacity = q; g.setAttribute('transform', 'translate(0 ' + (1 - q) * 16 + ')'); });
      if (tail) { const q = oc((lt - D - 0.1) / 0.35); tail.style.opacity = q; tail.style.transform = 'translateY(' + (1 - q) * 20 + 'px)'; } } }; },
  sfx(e, t0, T, add) { add(t0, 'roll', { d: e.dur || 1.6 }); add(t0 + (e.dur || 1.6) + 0.1, 'pop'); } });

// ---------- divide: i pallini si dividono (o si dimezzano: eliminazione)
FX.add('els', 'divide', { desc: 'grafico. Dots split by cell division 1, 2, 4... up to n (power of two, max 128) with the count beside; e.reverse runs it backwards (a knockout: 64 teams to 1). n, reverse, label, dur', from: 'cell-divide',
  build(e) { const G = Math.max(1, Math.min(7, Math.round(Math.log2(e.n || 64)))), Bw = 450, Bh = 450, lay = g => ({ c: 2 ** Math.ceil(g / 2), r: 2 ** Math.floor(g / 2) });
    const n = box('divide', '<div style="display:flex;align-items:center;gap:30px"><svg width="' + Bw + '" height="' + Bh + '"></svg><div><div class="fx-big" style="font-size:150px"></div><div class="fx-cap" style="font-size:32px">' + mdx(e.label || '') + '</div></div></div>'); const sv = n.querySelector('svg'), big = n.querySelector('.fx-big');
    const P = (g, i) => { const L = lay(g), cc = i % L.c, rr = Math.floor(i / L.c); return [(cc + 0.5) * Bw / L.c, (rr + 0.5) * Bh / L.r, Math.min(Bw / L.c, Bh / L.r) * 0.38]; };
    const par = (g, i) => { const L = lay(g), cc = i % L.c, rr = Math.floor(i / L.c), Lp = lay(g - 1); return g % 2 ? rr * Lp.c + Math.floor(cc / 2) : Math.floor(rr / 2) * Lp.c + cc; };
    const ds = Array.from({ length: 2 ** G }, () => S('circle', { fill: C.blue }, sv));
    return { n, upd(lt) { const D = e.dur || 1.8, f = cl(lt / D) * G, gf = e.reverse ? G - f : f, g = Math.min(G, Math.ceil(gf - 1e-9)), k = io(gf - (g - 1));
      const cnt = 2 ** Math.max(0, Math.min(G, e.reverse ? Math.ceil(gf - 1e-9) : Math.floor(gf + 1e-9))); big.textContent = cnt;
      ds.forEach((d, i) => { if (g < 1 || i >= 2 ** g) { if (g < 1 && i === 0) { const p = P(0, 0); d.setAttribute('cx', p[0]); d.setAttribute('cy', p[1]); d.setAttribute('r', p[2] * oc(lt / 0.3)); d.style.display = ''; } else d.style.display = 'none'; return; }
        const a = P(g - 1, par(g, i)), b = P(g, i), q = Math.min(1, k); d.style.display = ''; d.setAttribute('cx', lerp(a[0], b[0], q)); d.setAttribute('cy', lerp(a[1], b[1], q)); d.setAttribute('r', lerp(a[2] * 0.75, b[2], q));
        d.setAttribute('fill', e.reverse && g <= 1 ? C.orange : C.blue); }); } }; },
  sfx(e, t0, T, add) { add(t0, 'roll', { d: e.dur || 1.8 }); } });

// ---------- heatmap: griglia a pixel che si riempie
FX.add('els', 'heatmap', { desc: 'grafico. A calendar-style pixel heatmap fills in on a diagonal sweep (blue intensity levels), then a total lands. cols (26), rows (7), values (optional array 0-1, cols*rows, column by column), display, label', from: 'contribution-heatmap',
  build(e) { const cols = e.cols || 26, rows = e.rows || 7, g = 5, cs = (W - g * (cols - 1)) / cols, Hh = rows * (cs + g); const lv = [C.line, '#C3CDEB', '#8EA5E6', '#5578DB', C.blue];
    const n = box('heatmap', '<svg width="' + W + '" height="' + Hh + '"></svg>' + (e.display ? '<div class="fx-big" style="margin-top:22px">' + es(e.display) + '</div>' : '') + capHtml(e)); const sv = n.firstChild;
    const R = []; for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) { const i = c * rows + r, v = e.values ? (e.values[i] ?? 0) : cl(0.5 + 0.55 * U.noise(c * 0.35 + r * 0.9, 'hm') + 0.25 * (U.rnd('hv', i) - 0.5) + c / cols * 0.3);
      R.push({ c, r, q: S('rect', { x: c * (cs + g), y: r * (cs + g), width: cs, height: cs, rx: 3, fill: C.line }, sv), col: lv[Math.min(4, Math.floor(v * 5))] }); }
    const big = n.querySelector('.fx-big');
    return { n, upd(lt) { R.forEach(x => { const s = (x.c / cols + x.r / rows * 0.25) * 1.2, a = lt - s; x.q.setAttribute('fill', a < 0 ? C.line : a < 0.12 ? C.orange : x.col); });
      if (big) { const q = oc((lt - 1.3) / 0.6); big.style.opacity = cl((lt - 1.3) / 0.2); big.textContent = cnum(e.display, q); } } }; },
  sfx(e, t0, T, add) { add(t0, 'roll', { d: 1.3 }); add(t0 + 1.3, 'pop'); } });

// ---------- peak: mirino che si blocca sul massimo
FX.add('els', 'peak', { desc: 'grafico. A dot plot appears, then orange crosshair lines slide in and lock on the peak with a ring and a callout. points:[values, 8-30], display (callout), x0, x1 (axis ends), label', from: 'crosshair-lock',
  build(e) { const P = e.points || [], N = P.length, Hh = 360, mn = Math.min(...P), mx = Math.max(...P), im = P.indexOf(mx), X = i => 20 + i * (W - 40) / Math.max(1, N - 1), Y = v => 30 + (1 - (v - mn) / (mx - mn || 1)) * (Hh - 60);
    const n = box('peak', '<svg width="' + W + '" height="' + (Hh + 40) + '"></svg>' + capHtml(e)); const sv = n.firstChild; S('rect', { x: 0, y: Hh, width: W, height: 3, fill: C.ink }, sv);
    [[0, 'start', e.x0], [W, 'end', e.x1]].forEach(([x, a, s]) => s && txt(sv, { x, y: Hh + 34, 'text-anchor': a, 'font-family': 'Mono', 'font-size': 20, fill: C.mute }, s));
    const ds = P.map((v, i) => S('circle', { cx: X(i), cy: Y(v), r: 9, fill: i === im ? C.ink : '#8A93A6' }, sv));
    const vl = S('line', { y1: 0, y2: Hh, stroke: C.orange, 'stroke-width': 3 }, sv), hl = S('line', { x1: 0, x2: W, stroke: C.orange, 'stroke-width': 3 }, sv), rg = S('circle', { cx: X(im), cy: Y(mx), fill: 'none', stroke: C.orange, 'stroke-width': 6 }, sv);
    const lab = S('g', {}, sv), right = X(im) > W - 260; const lw = (e.display || '').length * 21 + 30; S('rect', { x: right ? X(im) - 36 - lw : X(im) + 36, y: Y(mx) - 26 + (Y(mx) < 60 ? 40 : 0), width: lw, height: 52, fill: C.orange }, lab);
    txt(lab, { x: right ? X(im) - 36 - lw / 2 : X(im) + 36 + lw / 2, y: Y(mx) + 10 + (Y(mx) < 60 ? 40 : 0), 'text-anchor': 'middle', 'font-family': 'Mono', 'font-size': 28, fill: '#fff' }, e.display || fm(mx, 0));
    return { n, upd(lt) { ds.forEach((d, i) => d.setAttribute('r', 9 * E.outBack((lt - i * 0.025) / 0.3)));
      const a = io((lt - 0.7) / 0.5), b = io((lt - 0.8) / 0.5); vl.setAttribute('x1', lerp(-20, X(im), a)); vl.setAttribute('x2', lerp(-20, X(im), a)); vl.style.opacity = cl((lt - 0.7) / 0.1);
      hl.setAttribute('y1', lerp(Hh + 20, Y(mx), b)); hl.setAttribute('y2', lerp(Hh + 20, Y(mx), b)); hl.style.opacity = cl((lt - 0.8) / 0.1);
      const s = U.spring(lt - 1.3, { damping: 10, stiffness: 180 }); rg.setAttribute('r', Math.max(0, 22 * s)); rg.style.opacity = lt > 1.3 ? 1 : 0; ds[im].setAttribute('fill', lt > 1.3 ? C.orange : C.ink);
      lab.style.opacity = oc((lt - 1.45) / 0.25); } }; },
  sfx(e, t0, T, add) { add(t0, 'roll', { d: 0.7 }); add(t0 + 1.3, 'click'); } });

// ---------- curve-shift: la distribuzione si sposta
const gauss = (x, m, s) => Math.exp(-0.5 * ((x - m) / (s || 1)) ** 2);
FX.add('els', 'curve-shift', { desc: 'grafico. A distribution curve (first item, kept as a dashed ghost) morphs into the second one; the new average is marked. items:[{label,mean,sd}] (2 items), min, max, display (marker text)', from: 'distribution-shift,beeswarm,galton-stack',
  build(e) { const its = ITEMS(e).slice(0, 2), a = its[0] || { mean: 0, sd: 1 }, b = its[1] || a, mn = e.min ?? Math.min(a.mean - 3 * a.sd, b.mean - 3 * b.sd), mx = e.max ?? Math.max(a.mean + 3 * a.sd, b.mean + 3 * b.sd), Hh = 340;
    const X = x => (x - mn) / (mx - mn) * W, pk = Math.max(1 / a.sd, 1 / b.sd);
    const path = (m, s, close) => { let d = ''; for (let i = 0; i <= 80; i++) { const x = mn + (mx - mn) * i / 80, y = Hh - gauss(x, m, s) / s / pk * (Hh - 60); d += (i ? 'L' : 'M') + X(x).toFixed(1) + ' ' + y.toFixed(1); } return close ? d + 'L' + W + ' ' + Hh + 'L0 ' + Hh + 'Z' : d; };
    const n = box('curve-shift', '<svg width="' + W + '" height="' + (Hh + 44) + '"></svg>' + capHtml(e)); const sv = n.firstChild; S('rect', { x: 0, y: Hh, width: W, height: 3, fill: C.ink }, sv);
    [[0, 'start', fm(mn, e.decimals)], [W, 'end', fm(mx, e.decimals)]].forEach(([x, an, s]) => txt(sv, { x, y: Hh + 34, 'text-anchor': an, 'font-family': 'Mono', 'font-size': 20, fill: C.mute }, s + (e.unit || '')));
    const gh = S('path', { d: path(a.mean, a.sd), fill: 'none', stroke: C.gray, 'stroke-width': 4, 'stroke-dasharray': '10 8' }, sv), ga = txt(sv, { x: X(a.mean), y: 40, 'text-anchor': 'middle', 'font-family': 'Mono', 'font-size': 20, fill: C.mute }, a.label || '');
    const ar = S('path', { fill: C.blue, 'fill-opacity': 0.16 }, sv), ln = S('path', { fill: 'none', stroke: C.blue, 'stroke-width': 6, 'stroke-linejoin': 'round' }, sv);
    const mk = S('g', {}, sv); S('line', { x1: X(b.mean), x2: X(b.mean), y1: 24, y2: Hh, stroke: C.orange, 'stroke-width': 4 }, mk); const tw = String(e.display || b.label || '').length * 15 + 24, tx = Math.min(W - tw, Math.max(0, X(b.mean) - tw / 2));
    S('rect', { x: tx, y: -16, width: tw, height: 40, fill: C.orange }, mk); txt(mk, { x: tx + tw / 2, y: 12, 'text-anchor': 'middle', 'font-family': 'Mono', 'font-size': 24, fill: '#fff' }, e.display || b.label || '');
    return { n, upd(lt, t, t0) { const s1 = its[1] ? tAt(e, 1, t0) : t0 + 1, p = io((t - s1) / 0.9), m = lerp(a.mean, b.mean, p), sd = lerp(a.sd, b.sd, p), dr = oc(lt / 0.6);
      ar.setAttribute('d', path(m, sd, true)); ln.setAttribute('d', path(m, sd)); ln.style.clipPath = 'inset(0 ' + (1 - dr) * 100 + '% 0 0)'; ar.style.opacity = dr;
      gh.style.opacity = t > s1 ? 1 : 0; ga.style.opacity = cl((t - s1) / 0.3); mk.style.opacity = oc((t - s1 - 0.8) / 0.3); } }; } });

// ---------- ridgeline: una distribuzione per riga, l'ultima accesa
FX.add('els', 'ridgeline', { desc: 'grafico. Stacked ridgeline distributions, one per row (seasons, years), drawn one by one; the highlighted row (default the last) is filled blue. items:[{label,mean,sd}], min, max, highlight, unit', from: 'ridgeline',
  build(e) { const its = ITEMS(e), hi = e.highlight ?? its.length - 1, lw = 100, PW = W - lw, rh = 64, ph = 120, Hh = its.length * rh + ph - rh + 40;
    const mn = e.min ?? Math.min(...its.map(i => i.mean - 3 * i.sd)), mx = e.max ?? Math.max(...its.map(i => i.mean + 3 * i.sd)), X = x => lw + (x - mn) / (mx - mn) * PW;
    const n = box('ridgeline', '<svg width="' + W + '" height="' + Hh + '"></svg>' + capHtml(e)); const sv = n.firstChild;
    const R = its.map((it, k) => { const by = ph + k * rh, g = S('g', {}, sv); let d = ''; for (let i = 0; i <= 70; i++) { const x = mn + (mx - mn) * i / 70; d += (i ? 'L' : 'M') + X(x).toFixed(1) + ' ' + (by - gauss(x, it.mean, it.sd) * ph * 0.95).toFixed(1); }
      S('path', { d: d + 'L' + W + ' ' + by + 'L' + lw + ' ' + by + 'Z', fill: k === hi ? C.blue : C.paper, stroke: k === hi ? C.blue : C.ink, 'stroke-width': 3 }, g);
      txt(g, { x: 0, y: by - 6, 'font-family': 'Mono', 'font-size': 22, fill: k === hi ? C.blue : C.mute, 'font-weight': k === hi ? 700 : 400 }, it.label); return g; });
    const by = ph + (its.length - 1) * rh; [[lw, 'start', mn], [W, 'end', mx]].forEach(([x, a, v]) => txt(sv, { x, y: by + 34, 'text-anchor': a, 'font-family': 'Mono', 'font-size': 20, fill: C.mute }, fm(v, e.decimals) + (e.unit || '')));
    return { n, upd(lt, t, t0) { R.forEach((g, k) => { const s = tAt(e, k, t0); g.style.clipPath = 'inset(-200px ' + (1 - io((t - s) / 0.6)) * 100 + '% -10px 0)'; g.style.opacity = t >= s ? 1 : 0; }); } }; }, sfx: sfxFill });

// ---------- dot-map: mappa del mondo a puntini
const MASK = (() => { const rows = ["l.d.5.f.11.5.o","u.4.7.c.q.1.8.e.i","7.4.j.7.5.b.f.1.c.v.8","0.1.4.y.3.7.g.8.1.1a","5.y.4.4.5.3.9.3.1.1g","5.o.5.5.5.2.g.4.1.1f.2","7.2.6.e.5.6.i.1.5.2.2.13.5.3.5","g.f.3.6.i.1.8.13.6.2.6","h.o.g.4.1.19.5.1.7","i.n.j.1b.d","j.l.j.h.2.s.e","j.i.k.5.1.6.4.3.1.s.2.1.c","j.g.m.3.5.1.1.1.1.7.2.p.h","j.g.m.3.4.1.2.1.1.8.1.m.2.1.3.1.d","k.e.o.5.9.s.4.2.e","l.c.o.9.1.2.3.s.k","n.5.4.1.n.f.1.4.1.n.k","n.4.s.g.1.5.3.k.k","p.2.5.2.l.h.1.7.3.f.m","p.3.2.1.5.1.i.o.5.5.2.4.p","r.4.n.j.1.4.6.3.4.5.4.1.j","u.2.m.m.9.2.6.3.o","v.1.3.4.g.m.8.2.8.1.o","y.6.g.k.p.1.i","y.9.e.1.4.e.m.2.k","x.a.k.c.h.1.1.1.1.3.l","x.c.i.b.j.1.3.2.1.1.j","x.e.h.9.l.1.5.1.4.3.c","x.f.g.9.n.2.8.3.b","y.e.h.8.1b","z.c.h.9.3.1.q.2.2.1.c","10.b.h.9.2.2.o.5.1.2.b","11.a.h.8.3.1.o.9.b","11.9.j.7.2.2.m.c.a","10.8.l.6.r.d.9","10.8.l.6.r.d.9","10.7.n.4.s.d.9","10.6.1l.1.6.4.a","z.6.1u.3.8.1.1","z.4.27.1.1","z.3.26.1.3","z.3.2a","z.2.2b","z.2.2b","3c"]; return rows.map(r => { let s = '', on = false; r.split('.').forEach(x => { s += (on ? '1' : '0').repeat(parseInt(x, 36)); on = !on; }); return s; }); })();
FX.add('els', 'dot-map', { desc: 'grafico. A dotted world map sweeps in west to east, then cities light up one by one in orange while a counter rises. items:[{label,lon,lat}], value (final count), display, label, bbox:[lonW,latS,lonE,latN] to zoom on a region', from: 'dot-map,dot-globe',
  build(e) { const its = ITEMS(e), cols = MASK[0].length, rows = MASK.length, bb = e.bbox || [-180, -57, 180, 78], st = Math.min(W / ((bb[2] - bb[0]) / 3), 460 / ((bb[3] - bb[1]) / 3));
    const X = lon => (lon - bb[0]) / 3 * st, Y = lat => (bb[3] - lat) / 3 * st, Hh = (bb[3] - bb[1]) / 3 * st;
    const n = box('dot-map', '<svg width="' + W + '" height="' + Hh + '" style="overflow:hidden"></svg><div class="fx-big" style="margin-top:18px"></div>' + capHtml(e)); const sv = n.firstChild, big = n.querySelector('.fx-big');
    const land = S('g', { fill: '#C9C3B6' }, sv); MASK.forEach((r, y) => { for (let x = 0; x < cols; x++) if (r[x] === '1') { const lon = -180 + (x + 0.5) * 3, lat = 78 - (y + 0.5) * 3; if (lon < bb[0] - 2 || lon > bb[2] + 2 || lat < bb[1] - 2 || lat > bb[3] + 2) continue; S('circle', { cx: X(lon), cy: Y(lat), r: st * 0.32 }, land); } });
    const P = its.map((it, k) => { const g = S('g', { transform: 'translate(' + X(it.lon) + ' ' + Y(it.lat) + ')' }, sv); const rg = S('circle', { r: 10, fill: 'none', stroke: C.orange, 'stroke-width': 3 }, g); S('circle', { r: 9, fill: C.orange, stroke: C.paper, 'stroke-width': 3 }, g);
      const left = X(it.lon) > W - 170; const l = txt(g, { x: left ? -16 : 16, y: k % 2 ? 26 : -10, 'text-anchor': left ? 'end' : 'start', 'font-size': 22, 'font-weight': 800 }, it.label || ''); return { g, rg, l }; });
    const fv = e.value ?? its.length;
    return { n, upd(lt, t, t0) { land.style.clipPath = 'inset(0 ' + (1 - io(lt / 0.8)) * 100 + '% 0 0)'; let lit = 0;
      P.forEach((x, k) => { const s = tAt(e, k, t0), a = t - s; if (a >= 0) lit++; x.g.style.opacity = a >= 0 ? 1 : 0; x.rg.setAttribute('r', 8 + 26 * oc(a / 0.6)); x.rg.style.opacity = 1 - cl(a / 0.6); });
      const last = its.length ? tAt(e, its.length - 1, t0) : t0, done = t >= last + 0.3; big.textContent = done ? (e.display ?? fm(fv, 0)) : cnum(e.display ?? fm(fv, 0), its.length ? lit / its.length * 0.999 : 0); big.style.opacity = cl((t - (its.length ? tAt(e, 0, t0) : t0)) / 0.3); } }; }, sfx: sfxPop });

// ---------- dot-sort: i pallini si ordinano per gruppo
FX.add('els', 'dot-sort', { desc: 'grafico. 100 mixed gray dots; group by group they take their color and fly into sorted rows, with a legend line per group. items:[{label,value (percent)}], highlight', from: 'dot-sort',
  build(e) { const its = ITEMS(e), hi = e.highlight ?? 0, cols = 20, gp = W / cols, r = gp * 0.36, rowsN = 5, Hh = rowsN * gp;
    const n = box('dot-sort', '<svg width="' + W + '" height="' + Hh + '"></svg><div class="lg" style="margin-top:22px;display:flex;flex-direction:column;gap:10px"></div>'); const sv = n.firstChild, lg = n.querySelector('.lg');
    const idx = [...Array(100).keys()]; for (let i = 99; i > 0; i--) { const j = Math.floor(U.rnd('ds', i) * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    const own = []; let c = 0; its.forEach((it, k) => { const m = Math.round(it.value); for (let q = 0; q < m && c < 100; q++) own[c++] = k; });
    const D = idx.map((pos, i) => ({ d: S('circle', { r, fill: '#C9C3B6' }, sv), a: [(pos % cols + 0.5) * gp, (Math.floor(pos / cols) + 0.5) * gp], b: [(i % cols + 0.5) * gp, (Math.floor(i / cols) + 0.5) * gp], g: own[i] }));
    const L = its.map((it, k) => { const l = H('<div style="display:flex;align-items:center;gap:16px" class="fx-l"><i style="width:30px;height:30px;border-radius:50%;background:' + hiCol(k, hi) + '"></i>' + es(it.label) + '<span class="fx-v" style="margin-left:auto;color:' + hiCol(k, hi) + '">' + es(it.display ?? (fm(it.value, 0) + '%')) + '</span></div>'); lg.appendChild(l); return l; });
    return { n, upd(lt, t, t0) { D.forEach((x, i) => { const k = x.g, s = k != null ? tAt(e, k, t0) : Infinity, p = io((t - s - (i % 20) * 0.006) / 0.6); x.d.setAttribute('cx', lerp(x.a[0], x.b[0], p)); x.d.setAttribute('cy', lerp(x.a[1], x.b[1], p));
      x.d.setAttribute('fill', t >= s ? hiCol(k, hi) : '#C9C3B6'); x.d.setAttribute('r', r * E.outBack((lt - i * 0.004) / 0.3)); });
      L.forEach((l, k) => l.style.opacity = cl((t - tAt(e, k, t0)) / 0.3)); } }; }, sfx: sfxPop });

// ---------- dumbbell: prima e dopo per riga
FX.add('els', 'dumbbell', { desc: 'grafico. One row per item: the "before" dot appears, then the "after" dot slides away from it along the axis, stretching the bar between them. items:[{label,a,b,da,db}], min, max, aLabel, bLabel, highlight', from: 'dumbbell-shift',
  build(e) { const its = ITEMS(e), vals = its.flatMap(i => [i.a, i.b]), mn = e.min ?? Math.min(...vals), mx = e.max ?? Math.max(...vals), X = v => 30 + (v - mn) / (mx - mn || 1) * (W - 60);
    const n = box('dumbbell', '<div class="fx-k" style="margin-bottom:20px"><span style="color:' + C.mute + '">● ' + es(e.aLabel || 'BEFORE') + '</span>&nbsp;&nbsp;&nbsp;<span style="color:' + C.blue + '">● ' + es(e.bLabel || 'AFTER') + '</span></div>');
    const R = its.map((it, k) => { const hc = k === e.highlight ? C.orange : C.blue; const d = H('<div style="margin-bottom:22px"><div class="fx-l" style="margin-bottom:6px">' + es(it.label) + '</div></div>'); n.appendChild(d); const sv = svgN(W, 78); d.appendChild(sv);
      S('line', { x1: 0, x2: W, y1: 30, y2: 30, stroke: C.line, 'stroke-width': 2 }, sv); const bar = S('line', { y1: 30, y2: 30, stroke: hc, 'stroke-width': 10, 'stroke-opacity': 0.35 }, sv);
      const ca = S('circle', { cx: X(it.a), cy: 30, r: 16, fill: C.gray }, sv), cb = S('circle', { cy: 30, r: 18, fill: hc }, sv);
      const ta = txt(sv, { x: X(it.a), y: 74, 'text-anchor': 'middle', 'font-family': 'Mono', 'font-size': 20, fill: C.mute }, it.da ?? fm(it.a, e.decimals)), tb = txt(sv, { y: 74, 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 900, fill: hc }, it.db ?? fm(it.b, e.decimals));
      return { d, bar, cb, tb, ta }; });
    return { n, upd(lt, t, t0) { R.forEach((x, k) => { const it = its[k], s = tAt(e, k, t0), p = io((t - s - 0.25) / 0.7), xb = lerp(X(it.a), X(it.b), p); x.d.style.opacity = cl((t - s) / 0.25);
      x.bar.setAttribute('x1', X(it.a)); x.bar.setAttribute('x2', xb); x.cb.setAttribute('cx', xb); x.tb.setAttribute('x', xb); x.tb.style.opacity = cl((p - 0.7) / 0.3); x.cb.style.opacity = t > s + 0.25 ? 1 : 0; }); } }; }, sfx: sfxFill });

// ---------- growth: curva di crescita con tappe
FX.add('els', 'growth', { desc: 'grafico. A smooth growth curve draws through milestones; every milestone gets a dot and its figure, the last one in orange. items:[{label,value,display}], log (true for exponential data)', from: 'growth-line,max-q',
  build(e) { const its = ITEMS(e), N = its.length, Hh = 400, f = v => e.log ? Math.log10(Math.max(1e-9, v)) : v, vs2 = its.map(i => f(i.value)), mn = e.log ? Math.min(...vs2) : Math.min(0, ...vs2), mx = Math.max(...vs2);
    const P = its.map((it, k) => [30 + k * (W - 100) / Math.max(1, N - 1), 40 + (1 - (vs2[k] - mn) / (mx - mn || 1)) * (Hh - 80)]);
    let d = 'M' + P[0][0] + ' ' + P[0][1]; for (let i = 0; i < N - 1; i++) { const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2; d += ' C' + (p1[0] + (p2[0] - p0[0]) / 6) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6) + ' ' + (p2[0] - (p3[0] - p1[0]) / 6) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6) + ' ' + p2[0] + ' ' + p2[1]; }
    const n = box('growth', '<svg width="' + W + '" height="' + (Hh + 30) + '"></svg>' + capHtml(e)); const sv = n.firstChild; S('rect', { x: 0, y: Hh, width: W, height: 3, fill: C.ink }, sv);
    const pa = S('path', { d, fill: 'none', stroke: C.blue, 'stroke-width': 7, 'stroke-linecap': 'round' }, sv);
    const M = P.map((p, k) => { const g = S('g', {}, sv), last = k === N - 1; S('circle', { cx: p[0], cy: p[1], r: last ? 16 : 11, fill: last ? C.orange : C.paper, stroke: last ? C.orange : C.blue, 'stroke-width': 5 }, g);
      txt(g, { x: p[0], y: p[1] - 30, 'text-anchor': k === 0 ? 'start' : 'middle', 'font-size': last ? 40 : 28, 'font-weight': 900, fill: last ? C.orange : C.ink }, disp(its[k]));
      txt(g, { x: p[0], y: Hh + 28 + (k % 2 && N > 4 ? 0 : 0), 'text-anchor': k === 0 ? 'start' : k === N - 1 ? 'end' : 'middle', 'font-family': 'Mono', 'font-size': 20, fill: C.mute }, its[k].label || ''); return g; });
    let L = 0, cum = [];
    return { n, upd(lt, t, t0) { if (!L) { L = pa.getTotalLength(); pa.style.strokeDasharray = L; let j = 0; for (let s = 0; s <= L; s += 2) { const q = pa.getPointAtLength(s); while (j < N && q.x >= P[j][0] - 0.5) cum[j++] = s; } while (j < N) cum[j++] = L; }
      let reach = 0; its.forEach((it, k) => { const s = tAt(e, k, t0), p = io((t - s) / 0.6); const from = k ? cum[k - 1] : 0; if (t >= s) reach = Math.max(reach, lerp(from, cum[k], p)); M[k].style.opacity = cl((t - s - 0.45) / 0.2); });
      pa.style.strokeDashoffset = L - reach; } }; }, sfx: sfxPop });

// ---------- fraction: una barra che si divide a meta', quarti, ottavi
FX.add('els', 'fraction', { desc: 'grafico. One bar splits into halves, quarters, eighths (or straight into n parts), then the "hi" parts fill orange under a headline like "1 in 8". of (parts, 8), hi (filled, 1), display, label', from: 'fraction-split',
  build(e) { const N = Math.max(2, Math.min(32, e.of || 8)), hi = e.hi ?? 1, lv = Math.log2(N), pow2 = Number.isInteger(lv);
    const n = box('fraction', '<div class="bx" style="display:flex;height:130px"></div>' + (e.display ? '<div class="fx-big" style="margin-top:26px">' + es(e.display) + '</div>' : '') + capHtml(e)); const bx = n.firstChild;
    const B = Array.from({ length: N }, (_, i) => { const d = H('<div style="flex:1;background:' + C.ink + '"></div>'); bx.appendChild(d); let L = 1; if (i && pow2) { let b = i, z = 0; while (b % 2 === 0) { b /= 2; z++; } L = lv - z; } return { d, L }; });
    const big = n.querySelector('.fx-big');
    return { n, upd(lt) { const g = 0.38; B.forEach((b, i) => { b.d.style.marginLeft = i ? (14 * oc((lt - 0.2 - (b.L - 1) * g) / 0.3)) + 'px' : '0';
      const f = lt > 0.25 + (pow2 ? lv : 1) * g + i * 0.04; b.d.style.background = i < hi ? (f ? C.orange : C.ink) : (f ? C.line : C.ink); });
      if (big) { const q = oc((lt - 0.4 - (pow2 ? lv : 1) * g) / 0.35); big.style.opacity = q; big.style.transform = 'translateY(' + (1 - q) * 20 + 'px)'; } } }; },
  sfx(e, t0, T, add) { const lv = Number.isInteger(Math.log2(e.of || 8)) ? Math.log2(e.of || 8) : 1; for (let k = 0; k < lv; k++) add(t0 + 0.2 + k * 0.38, 'tick'); add(t0 + 0.25 + lv * 0.38, 'pop'); } });

// ---------- waffle: 10x10 celle per gruppi
FX.add('els', 'waffle', { desc: 'grafico. A 10x10 grid of cells (square, dot or hex) fills group by group, legend on the right with each share. items:[{label,value (cells out of 100),display}], shape ("square"|"dot"|"hex"), highlight', from: 'unit-grid,hex-fill',
  build(e) { const its = ITEMS(e), hi = e.highlight ?? 0, sh = e.shape || 'square', cs = 40, g = 7, Gw = 10 * (cs + g);
    const n = box('waffle', '<div style="display:flex;gap:34px;align-items:center"><div class="gr" style="position:relative;width:' + (Gw + (sh === 'hex' ? cs / 2 : 0)) + 'px;height:' + (10 * (cs + g) * (sh === 'hex' ? 0.9 : 1)) + 'px"></div><div class="lg" style="flex:1;display:flex;flex-direction:column;gap:22px"></div></div>');
    const gr = n.querySelector('.gr'), lg = n.querySelector('.lg'); const own = []; let c = 0; its.forEach((it, k) => { for (let q = 0; q < Math.round(it.value) && c < 100; q++) own[c++] = k; });
    const cells = Array.from({ length: 100 }, (_, i) => { const r = 9 - Math.floor(i / 10), cc = i % 10; const d = document.createElement('i');
      d.style.cssText = 'position:absolute;width:' + cs + 'px;height:' + cs + 'px;left:' + (cc * (cs + g) + (sh === 'hex' && r % 2 ? cs / 2 : 0)) + 'px;top:' + (r * (cs + g) * (sh === 'hex' ? 0.9 : 1)) + 'px;background:' + C.line + ';' + (sh === 'dot' ? 'border-radius:50%;' : sh === 'hex' ? 'clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);' : '');
      gr.appendChild(d); return d; });
    let base = 0; const L = its.map((it, k) => { const l = H('<div><div class="fx-k">' + es(it.label) + '</div><div style="font:400 70px/1 Anton;color:' + hiCol(k, hi) + '">' + es(it.display ?? (fm(it.value, 0) + '%')) + '</div></div>'); lg.appendChild(l); const o = { l, a: base }; base += Math.round(it.value); return o; });
    return { n, upd(lt, t, t0) { cells.forEach((d, i) => { const k = own[i]; if (k == null) { d.style.transform = 'scale(' + oc((lt - i * 0.003) / 0.25) + ')'; return; } const s = tAt(e, k, t0) + (i - L[k].a) * 0.008;
      d.style.background = t >= s ? hiCol(k, hi) : C.line; d.style.transform = 'scale(' + (t >= s ? 1 + 0.25 * (1 - oc((t - s) / 0.2)) : oc((lt - i * 0.003) / 0.25)) + ')'; });
      L.forEach((x, k) => x.l.style.opacity = cl((t - tAt(e, k, t0)) / 0.3)); } }; }, sfx: sfxFill });

// ---------- rank: classifica in cui l'eroe scala posizioni
FX.add('els', 'rank', { desc: 'grafico. A ranked table (final order, top first) appears row by row with the hero row at its starting rank, then the hero climbs, swapping places one row at a time, to its final rank. items:[{label,value,display}] (final order, max 8), hero (index in items, default 0), from (starting rank, default last)', from: 'rank-climb,timing-tower,high-score',
  build(e) { const its = ITEMS(e), N = its.length, h = e.hero ?? 0, f = Math.min(N, Math.max(h + 1, e.from || N)) - 1, rh = 86;
    const n = box('rank', '', 'position:relative;height:' + (N * rh) + 'px');
    for (let i = 0; i < N; i++) n.appendChild(H('<div style="position:absolute;left:0;top:' + (i * rh) + 'px;width:64px;height:' + (rh - 12) + 'px;display:flex;align-items:center;font:400 46px Anton;color:' + C.mute + '">' + (i + 1) + '</div>'));
    const R = its.map((it, i) => { const hero = i === h; const d = H('<div style="position:absolute;left:72px;right:0;height:' + (rh - 12) + 'px;display:flex;align-items:center;padding:0 22px;gap:16px;background:' + (hero ? C.orange : '#fff') + ';' + (hero ? 'z-index:2;' : '') + '"><span style="font:800 34px Inter;color:' + (hero ? '#fff' : C.ink) + '">' + es(it.label) + '</span><span style="margin-left:auto;font:900 34px Inter;color:' + (hero ? '#fff' : C.blue) + '">' + es(disp(it)) + '</span></div>'); n.appendChild(d);
      const ii = i < h ? i : i - 1, s0 = hero ? f : (ii < f ? ii : ii + 1); return { d, s0, hero }; });
    const ord = R.map((r, i) => i).sort((a, b) => R[a].s0 - R[b].s0);
    return { n, upd(lt, t, t0) { const tl = tAt(e, N - 1, t0) + 0.4, steps = f - h, g = 0.32, c = steps ? cl((t - tl) / (steps * g)) * steps : 0, hp = f - (Math.floor(c) + io(c - Math.floor(c)));
      R.forEach((r, i) => { const k = ord.indexOf(i), s = tAt(e, k, t0); r.d.style.opacity = cl((t - s) / 0.25);
        const y = (r.hero ? hp : (r.s0 >= h && r.s0 < f ? r.s0 + cl(r.s0 + 1 - hp) : r.s0)) * rh;
        r.d.style.top = y + 'px'; r.d.style.transform = 'translateX(' + (1 - oc((t - s) / 0.35)) * 40 + 'px)' + (r.hero && t > tl && c < steps ? ' scale(1.02)' : ''); }); } }; },
  sfx(e, t0, T, add) { const its = ITEMS(e), N = its.length, h = e.hero ?? 0, f = Math.min(N, Math.max(h + 1, e.from || N)) - 1; its.forEach((it, k) => add(T(it.at, t0 + k * 0.5), 'tick'));
    const tl = T(its[N - 1] && its[N - 1].at, t0 + (N - 1) * 0.5) + 0.4; for (let k = 0; k < f - h; k++) add(tl + k * 0.32, 'whoosh'); add(tl + (f - h) * 0.32, 'pop'); } });

// ---------- breakdown: un totale che si divide in parti
FX.add('els', 'breakdown', { desc: 'grafico. A big total splits down a bracket into one bar per part, each with its own figure (revenue into matchday, broadcast, commercial). total:{display,label}, items:[{label,value,display}]', from: 'number-split',
  build(e) { const its = ITEMS(e), tot = its.reduce((a, b) => a + b.value, 0) || 1, mx = Math.max(...its.map(i => i.value)), t = e.total || {};
    const n = box('breakdown', '<div class="fx-big" style="font-size:130px">' + es(t.display || fm(tot, 0)) + '</div>' + (t.label ? '<div class="fx-k" style="margin-top:6px">' + es(t.label) + '</div>' : '') + '<div class="rw" style="position:relative;margin-top:26px;padding-left:56px"></div>');
    const rw = n.querySelector('.rw'), ax = H('<i style="position:absolute;left:18px;top:-20px;width:5px;background:' + C.ink + '"></i>'); rw.appendChild(ax);
    const R = its.map((it, k) => { const d = H('<div style="position:relative;margin-bottom:24px"><i style="position:absolute;left:-38px;top:52px;width:30px;height:5px;background:' + C.ink + '"></i><div style="display:flex;justify-content:space-between" class="fx-l"><span>' + es(it.label) + '</span><span class="fx-v" style="color:' + pal[k % 3 + (k ? 0 : 1)] + '"></span></div><div style="height:40px;margin-top:6px;background:' + C.line + '"><b style="display:block;height:100%;width:0;background:' + [C.blue, C.ink, '#8A93A6', C.gray, C.orange][k % 5] + '"></b></div></div>');
      rw.appendChild(d); return { d, b: d.querySelector('b'), v: d.querySelector('.fx-v') }; });
    return { n, upd(lt, t, t0) { let reach = 0; R.forEach((x, k) => { const it = its[k], s = tAt(e, k, t0), p = oc((t - s) / 0.6); x.d.style.opacity = cl((t - s) / 0.2); x.b.style.width = it.value / mx * 100 * p + '%'; x.v.textContent = cnum(disp(it), p);
      if (t >= s) reach = x.d.offsetTop + 54; }); ax.style.height = Math.max(0, reach + 20) + 'px'; } }; }, sfx: sfxFill });

// ---------- waterfall: guadagni e perdite fino al totale
FX.add('els', 'waterfall', { desc: 'grafico. A waterfall: each item is a gain (blue) or a loss (orange) floating from the running total, then the total column lands in ink. items:[{label,value (+/-),display}], total:{label,display}', from: 'waterfall-chart',
  build(e) { const its = ITEMS(e), N = its.length + 1, Hc = 380, top = 50, gap = 14, cw = (W - gap * (N - 1)) / N; let run = 0; const seg = its.map(it => { const a = run; run += it.value; return [a, run]; }); const tot = run;
    const lo = Math.min(0, ...seg.flat()), hi = Math.max(...seg.flat(), tot), Y = v => top + (1 - (v - lo) / (hi - lo || 1)) * Hc;
    const n = box('waterfall', '<svg width="' + W + '" height="' + (Hc + top + 50) + '"></svg>' + capHtml(e)); const sv = n.firstChild; S('rect', { x: 0, y: Y(0), width: W, height: 3, fill: C.ink }, sv);
    const mk = (k, a, b, col, lab, dsp) => { const x = k * (cw + gap), g = S('g', {}, sv); const r = S('rect', { x, width: cw, fill: col }, g); if (k < N - 1) S('line', { x1: x + cw, x2: x + cw + gap, y1: Y(b), y2: Y(b), stroke: C.mute, 'stroke-width': 2, 'stroke-dasharray': '4 4' }, g);
      const v = txt(g, { x: x + cw / 2, y: Math.min(Y(a), Y(b)) - 12, 'text-anchor': 'middle', 'font-size': cw < 100 ? 22 : 28, 'font-weight': 900, fill: col }, dsp);
      txt(g, { x: x + cw / 2, y: top + Hc + 40, 'text-anchor': 'middle', 'font-family': 'Mono', 'font-size': cw < 100 ? 16 : 20, fill: C.mute }, lab); return { g, r, a, b, v }; };
    const B = its.map((it, k) => mk(k, seg[k][0], seg[k][1], it.value >= 0 ? C.blue : C.orange, it.label, it.display ?? ((it.value >= 0 ? '+' : '') + fm(it.value, e.decimals))));
    const tt = e.total || {}; B.push(mk(N - 1, 0, tot, C.ink, tt.label || 'TOTAL', tt.display ?? fm(tot, e.decimals)));
    return { n, upd(lt, t, t0) { B.forEach((b, k) => { const s = k < its.length ? tAt(e, k, t0) : tAt(e, its.length - 1, t0) + 0.6, p = oc((t - s) / 0.45); const y1 = Y(b.a), y2 = lerp(Y(b.a), Y(b.b), p);
      b.r.setAttribute('y', Math.min(y1, y2)); b.r.setAttribute('height', Math.max(1, Math.abs(y2 - y1))); b.g.style.opacity = t >= s ? 1 : 0; b.v.style.opacity = cl((p - 0.6) / 0.4); }); } }; },
  sfx(e, t0, T, add) { const its = ITEMS(e); its.forEach((it, k) => add(T(it.at, t0 + k * 0.5), 'fill')); add(T(its.length ? its[its.length - 1].at : null, t0 + (its.length - 1) * 0.5) + 0.6, 'pop'); } });

// ---------- quadrant: chi sta nell'angolo buono
FX.add('els', 'quadrant', { desc: 'grafico. A quadrant plot: competitors drop in as ink dots, the hero lands in orange with a ring in its corner. items:[{label,x,y}] (0-1, or any scale with xmax/ymax), hero (index), xLabel, yLabel, q:[top-left,top-right,bottom-left,bottom-right] corner names', from: 'quadrant-plot',
  build(e) { const its = ITEMS(e), Hh = 560, xm = e.xmax || Math.max(1, ...its.map(i => i.x)), ym = e.ymax || Math.max(1, ...its.map(i => i.y)), X = v => 20 + v / xm * (W - 40), Y = v => Hh - 30 - v / ym * (Hh - 60);
    const n = box('quadrant', '<svg width="' + W + '" height="' + (Hh + 10) + '"></svg>' + capHtml(e)); const sv = n.firstChild;
    S('line', { x1: W / 2, x2: W / 2, y1: 0, y2: Hh, stroke: C.ink, 'stroke-width': 3 }, sv); S('line', { x1: 0, x2: W, y1: Hh / 2, y2: Hh / 2, stroke: C.ink, 'stroke-width': 3 }, sv);
    (e.q || []).forEach((q, i) => q && txt(sv, { x: i % 2 ? W - 6 : 6, y: i < 2 ? 26 : Hh - 10, 'text-anchor': i % 2 ? 'end' : 'start', 'font-family': 'Mono', 'font-size': 20, fill: i === 1 ? C.orange : C.mute }, q.toUpperCase()));
    if (e.xLabel) txt(sv, { x: W - 6, y: Hh / 2 + 28, 'text-anchor': 'end', 'font-family': 'Mono', 'font-size': 20, fill: C.ink }, e.xLabel.toUpperCase() + ' →');
    if (e.yLabel) txt(sv, { x: W / 2 + 12, y: 56, 'font-family': 'Mono', 'font-size': 20, fill: C.ink }, '↑ ' + e.yLabel.toUpperCase());
    const P = its.map((it, k) => { const h = k === e.hero, g = S('g', { transform: 'translate(' + X(it.x) + ' ' + Y(it.y) + ')' }, sv); const ig = S('g', {}, g); const rg = h ? S('circle', { r: 30, fill: 'none', stroke: C.orange, 'stroke-width': 4 }, ig) : null;
      S('circle', { r: h ? 18 : 12, fill: h ? C.orange : C.ink }, ig); const right = X(it.x) > W - 200; txt(ig, { x: right ? -24 : 24, y: 8, 'text-anchor': right ? 'end' : 'start', 'font-size': h ? 28 : 22, 'font-weight': h ? 900 : 700, fill: h ? C.orange : C.ink }, it.label); return { ig, rg, h }; });
    return { n, upd(lt, t, t0) { P.forEach((p, k) => { const s = tAt(e, k, t0), a = t - s; p.ig.setAttribute('transform', 'translate(0 ' + (-(1 - E.outBounce(a / 0.5)) * 40) + ')'); p.ig.style.opacity = cl(a / 0.12);
      if (p.rg) p.rg.setAttribute('r', 18 + 22 * oc((a - 0.4) / 0.4)), p.rg.style.opacity = cl((a - 0.4) / 0.2); }); } }; }, sfx: sfxPop });

// ---------- radar: il profilo dell'eroe sopra quello del rivale
FX.add('els', 'radar', { desc: 'grafico. A radar chart: the rival outline (gray, dashed) is there from the start, the hero polygon (blue) grows axis by axis over it. items:[{label,a (hero),b (rival)}] (3-8 axes), max, aName, bName', from: 'radar-compare',
  build(e) { const its = ITEMS(e), N = its.length, R = 210, cx = W / 2, cy = 270, mx = e.max || Math.max(...its.flatMap(i => [i.a, i.b])) || 1, ang = k => -Math.PI / 2 + k * 2 * Math.PI / N, pt = (k, v) => [cx + Math.cos(ang(k)) * R * v / mx, cy + Math.sin(ang(k)) * R * v / mx];
    const n = box('radar', '<div class="fx-k" style="margin-bottom:6px"><span style="color:' + C.blue + '">■ ' + es(e.aName || 'A') + '</span>&nbsp;&nbsp;&nbsp;<span>▢ ' + es(e.bName || 'B') + '</span></div><svg width="' + W + '" height="540"></svg>'); const sv = n.querySelector('svg');
    [0.33, 0.66, 1].forEach(f => S('polygon', { points: its.map((_, k) => pt(k, mx * f).join(',')).join(' '), fill: 'none', stroke: C.line, 'stroke-width': 2 }, sv));
    its.forEach((it, k) => { const p = pt(k, mx), q = pt(k, mx * 1.13); S('line', { x1: cx, y1: cy, x2: p[0], y2: p[1], stroke: C.line, 'stroke-width': 2 }, sv); txt(sv, { x: q[0], y: q[1] + 8, 'text-anchor': Math.abs(q[0] - cx) < 10 ? 'middle' : q[0] > cx ? 'start' : 'end', 'font-size': 24 }, it.label); });
    const rb = S('polygon', { points: its.map((it, k) => pt(k, it.b).join(',')).join(' '), fill: 'none', stroke: C.mute, 'stroke-width': 4, 'stroke-dasharray': '10 8' }, sv);
    const ra = S('polygon', { fill: C.blue, 'fill-opacity': 0.2, stroke: C.blue, 'stroke-width': 6, 'stroke-linejoin': 'round' }, sv); const ds = its.map(() => S('circle', { r: 8, fill: C.blue }, sv));
    return { n, upd(lt, t, t0) { rb.style.opacity = cl(lt / 0.3); const P = its.map((it, k) => pt(k, it.a * Math.max(0, U.spring(t - tAt(e, k, t0), { damping: 11, stiffness: 140 }))));
      ra.setAttribute('points', P.map(p => p.join(',')).join(' ')); ds.forEach((d, k) => { d.setAttribute('cx', P[k][0]); d.setAttribute('cy', P[k][1]); }); } }; }, sfx: sfxFill });

// ---------- radial-bars: barre attorno a un quadrante
FX.add('els', 'radial-bars', { desc: 'grafico. Bars around a dial sweep up one after another to a peak (orange) while the center figure counts. values:[numbers, 8-36] (e.g. goals per 5-minute slot), display (center), label, ticks (optional labels at quarters)', from: 'radial-bars',
  build(e) { const v = e.values || [], N = v.length, mx = Math.max(...v) || 1, im = v.indexOf(mx), Z = 520, c = Z / 2, r0 = 120, L = 120;
    const n = box('radial-bars', '<div style="position:relative;width:' + Z + 'px;height:' + Z + 'px"><svg width="' + Z + '" height="' + Z + '"></svg><div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><div class="fx-big" style="font-size:96px"></div></div></div>' + capHtml(e)); const sv = n.querySelector('svg'), big = n.querySelector('.fx-big');
    S('circle', { cx: c, cy: c, r: r0 - 12, fill: 'none', stroke: C.line, 'stroke-width': 3 }, sv); (e.ticks || []).forEach((tk, i, a) => { const an = -Math.PI / 2 + i / a.length * 2 * Math.PI; txt(sv, { x: c + Math.cos(an) * (r0 - 34), y: c + Math.sin(an) * (r0 - 34) + 7, 'text-anchor': 'middle', 'font-family': 'Mono', 'font-size': 18, fill: C.mute }, tk); });
    const B = v.map((x, k) => S('line', { x1: c, y1: c - r0, x2: c, y2: c - r0, stroke: k === im ? C.orange : C.blue, 'stroke-width': Math.max(6, Math.min(22, 2 * Math.PI * r0 / N * 0.6)), 'stroke-linecap': 'round', transform: 'rotate(' + (k / N * 360) + ' ' + c + ' ' + c + ')' }, sv));
    return { n, upd(lt) { const D = e.dur || 1.4; B.forEach((b, k) => { const p = E.outBack((lt - k / N * D) / 0.4); b.setAttribute('y2', c - r0 - Math.max(0, p) * L * v[k] / mx); b.style.opacity = lt >= k / N * D ? 1 : 0; });
      big.textContent = cnum(e.display ?? fm(mx, 0), oc((lt - 0.2) / D)); } }; },
  sfx(e, t0, T, add) { add(t0, 'roll', { d: e.dur || 1.4 }); add(t0 + (e.dur || 1.4), 'pop'); } });

// ---------- sankey: piu' fonti confluiscono in un totale
FX.add('els', 'sankey', { desc: 'grafico. Flows from several sources (left) pour one by one into one target block (right) that ends on the total. items:[{label,value,display}], total:{display,label}', from: 'sankey-flow',
  build(e) { const its = ITEMS(e), tot = its.reduce((a, b) => a + b.value, 0) || 1, Hh = 460, gp = 26, avail = Hh - gp * (its.length - 1), x0 = 250, x1 = W - 60, tg = e.total || {};
    const n = box('sankey', '<svg width="' + W + '" height="' + Hh + '"></svg>' + '<div style="display:flex;align-items:baseline;gap:18px;margin-top:14px"><div class="fx-big tt" style="color:' + C.ink + '">' + es(tg.display || fm(tot, 0)) + '</div><div class="fx-k">' + es(tg.label || '') + '</div></div>'); const sv = n.firstChild;
    const T0 = S('rect', { x: x1, y: 0, width: 60, height: 0, fill: C.ink }, sv); let ys = 0, yt = 0; const cols = [C.blue, C.orange, '#8A93A6', C.ink, C.gray];
    const F = its.map((it, k) => { const h = it.value / tot * avail, ht = it.value / tot * Hh, a = ys, b = yt; ys += h + gp; yt += ht; const g = S('g', {}, sv), col = cols[k % 5];
      S('rect', { x: x0 - 20, y: a, width: 20, height: h, fill: col }, g); const p = S('path', { d: 'M' + x0 + ' ' + a + ' C' + (x0 + x1) / 2 + ' ' + a + ' ' + (x0 + x1) / 2 + ' ' + b + ' ' + x1 + ' ' + b + ' V' + (b + ht) + ' C' + (x0 + x1) / 2 + ' ' + (b + ht) + ' ' + (x0 + x1) / 2 + ' ' + (a + h) + ' ' + x0 + ' ' + (a + h) + ' Z', fill: col, 'fill-opacity': 0.45 }, g);
      txt(g, { x: x0 - 34, y: a + h / 2 - 4, 'text-anchor': 'end', 'font-size': 26 }, it.label); txt(g, { x: x0 - 34, y: a + h / 2 + 28, 'text-anchor': 'end', 'font-size': 28, 'font-weight': 900, fill: col === C.gray ? C.ink : col }, disp(it)); return { g, p, bot: b + ht }; });
    const tt = n.querySelector('.tt').parentNode;
    return { n, upd(lt, t, t0) { let fill = 0; F.forEach((f, k) => { const s = tAt(e, k, t0), q = io((t - s) / 0.7); f.g.style.opacity = cl((t - s) / 0.2); f.p.style.clipPath = 'inset(0 ' + (1 - q) * 100 + '% 0 0)'; if (q >= 1) fill = f.bot; else if (t >= s) fill = Math.max(fill, (k ? F[k - 1].bot : 0)); });
      T0.setAttribute('height', fill); const sl = tAt(e, its.length - 1, t0) + 0.75; tt.style.opacity = cl((t - sl) / 0.3); n.querySelector('.tt').textContent = cnum(tg.display || fm(tot, 0), oc((t - sl) / 0.5)); } }; }, sfx: sfxFill });

// ---------- share-donut: ciambella a piu' fette con legenda
FX.add('els', 'share-donut', { desc: 'grafico. A donut of several shares sweeping in one by one (the highlight in orange, its figure in the center), legend beside it. items:[{label,value (percent),display}], highlight', from: 'share-donut',
  build(e) { const its = ITEMS(e), hi = e.highlight ?? 0, R = 150, SW = 62, Z = 2 * R + SW, C2 = 2 * Math.PI * R;
    const n = box('share-donut', '<div style="display:flex;align-items:center;gap:36px"><svg width="' + Z + '" height="' + Z + '"></svg><div class="lg" style="flex:1;display:flex;flex-direction:column;gap:16px"></div></div>'); const sv = n.querySelector('svg'), lg = n.querySelector('.lg');
    S('circle', { cx: Z / 2, cy: Z / 2, r: R, fill: 'none', stroke: C.line, 'stroke-width': SW }, sv); let acc = 0; const cs = [C.blue, C.ink, '#8A93A6', C.gray];
    const G = its.map((it, k) => { const col = k === hi ? C.orange : cs[(k - (k > hi ? 1 : 0)) % 4]; const a = acc; acc += it.value;
      const c = S('circle', { cx: Z / 2, cy: Z / 2, r: R, fill: 'none', stroke: col, 'stroke-width': SW, transform: 'rotate(' + (-90 + a * 3.6) + ' ' + Z / 2 + ' ' + Z / 2 + ')', 'stroke-dasharray': '0 ' + C2 }, sv);
      const l = H('<div style="display:flex;align-items:center;gap:14px" class="fx-l"><i style="width:26px;height:26px;background:' + col + ';flex:0 0 auto"></i><span>' + es(it.label) + '</span><span class="fx-v" style="margin-left:auto;color:' + (k === hi ? C.orange : C.ink) + '">' + es(it.display ?? fm(it.value, 0) + '%') + '</span></div>'); lg.appendChild(l); return { c, l, col }; });
    const ct = txt(sv, { x: Z / 2, y: Z / 2 + 26, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-weight': 400, 'font-size': 76, fill: C.orange }, '');
    return { n, upd(lt, t, t0) { G.forEach((g, k) => { const it = its[k], s = tAt(e, k, t0), p = io((t - s) / 0.6); g.c.setAttribute('stroke-dasharray', Math.max(0, C2 * it.value / 100 * p - 3) + ' ' + C2); g.l.style.opacity = cl((t - s) / 0.3); });
      const it = its[hi]; if (it) { const s = tAt(e, hi, t0); ct.textContent = t >= s ? cnum(it.display ?? fm(it.value, 0) + '%', oc((t - s) / 0.6)) : ''; } } }; }, sfx: sfxFill });

// ---------- slope: prima e dopo con linee inclinate
FX.add('els', 'slope', { desc: 'grafico. A slope chart: each line joins a "before" value (left) to an "after" value (right), drawn one by one; the hero line is thick and orange. items:[{label,a,b,da,db}], hero (index), aLabel, bLabel', from: 'slope-chart',
  build(e) { const its = ITEMS(e), Hh = 470, xa = 210, xb = W - 150, vals = its.flatMap(i => [i.a, i.b]), mn = Math.min(...vals), mx = Math.max(...vals), Y = v => 50 + (1 - (v - mn) / (mx - mn || 1)) * (Hh - 80);
    const n = box('slope', '<svg width="' + W + '" height="' + Hh + '"></svg>' + capHtml(e)); const sv = n.firstChild;
    [[xa, e.aLabel || 'BEFORE'], [xb, e.bLabel || 'AFTER']].forEach(([x, l]) => { S('line', { x1: x, x2: x, y1: 30, y2: Hh, stroke: C.line, 'stroke-width': 3 }, sv); txt(sv, { x, y: 16, 'text-anchor': 'middle', 'font-family': 'Mono', 'font-size': 22, fill: C.mute }, l); });
    const L = its.map((it, k) => { const h = k === e.hero, col = h ? C.orange : '#8A93A6', g = S('g', {}, sv);
      const ln = S('line', { x1: xa, y1: Y(it.a), x2: xa, y2: Y(it.a), stroke: col, 'stroke-width': h ? 8 : 4, 'stroke-linecap': 'round' }, g); S('circle', { cx: xa, cy: Y(it.a), r: h ? 11 : 7, fill: col }, g); const cb = S('circle', { cx: xb, cy: Y(it.b), r: h ? 11 : 7, fill: col }, g);
      txt(g, { x: xa - 22, y: Y(it.a) + 9, 'text-anchor': 'end', 'font-size': h ? 26 : 22, 'font-weight': h ? 900 : 700, fill: h ? C.orange : C.ink }, it.label + '  ' + (it.da ?? fm(it.a, e.decimals)));
      const tb = txt(g, { x: xb + 22, y: Y(it.b) + 9, 'font-size': h ? 30 : 24, 'font-weight': 900, fill: h ? C.orange : C.ink }, it.db ?? fm(it.b, e.decimals)); return { g, ln, cb, tb, it }; });
    L.filter(l => l.it === its[e.hero]).forEach(l => sv.appendChild(l.g));
    return { n, upd(lt, t, t0) { L.forEach((l, k) => { const s = tAt(e, k, t0), p = io((t - s) / 0.6); l.g.style.opacity = t >= s ? 1 : 0; l.ln.setAttribute('x2', lerp(xa, xb, p)); l.ln.setAttribute('y2', lerp(Y(l.it.a), Y(l.it.b), p)); l.cb.style.opacity = l.tb.style.opacity = p >= 1 ? 1 : 0; }); } }; }, sfx: sfxFill });

// ---------- stack-shift: una barra al 100% che cambia negli anni
FX.add('els', 'stack-shift', { desc: 'grafico. One 100% stacked bar morphs from year to year (each item is a year) while the year cuts in above it; the highlighted series is orange, the legend shows the current shares. series:[names], items:[{label (year),values:[one per series]}], highlight (series index)', from: 'stacked-shift,streamgraph,time-breakdown',
  build(e) { const its = ITEMS(e), sr = e.series || [], hi = e.highlight ?? 0, cs = [C.blue, C.ink, '#8A93A6', C.gray]; const col = k => k === hi ? C.orange : cs[(k - (k > hi ? 1 : 0)) % 4];
    const n = box('stack-shift', '<div class="yr" style="font:400 90px/1 Anton;color:' + C.ink + '"></div><div class="bar" style="display:flex;height:120px;margin-top:16px;background:' + C.line + '"></div><div class="lg" style="margin-top:26px;display:flex;flex-direction:column;gap:12px"></div>');
    const yr = n.querySelector('.yr'), bar = n.querySelector('.bar'), lg = n.querySelector('.lg');
    const sg = sr.map((s, k) => { const d = H('<div style="height:100%;background:' + col(k) + ';display:flex;align-items:center;justify-content:center;font:900 34px Inter;color:#fff;overflow:hidden;white-space:nowrap"></div>'); bar.appendChild(d); return d; });
    const lv = sr.map((s, k) => { const l = H('<div class="fx-l" style="display:flex;align-items:center;gap:14px"><i style="width:26px;height:26px;background:' + col(k) + '"></i>' + es(s) + '<span class="fx-v" style="margin-left:auto;color:' + (k === hi ? C.orange : C.ink) + '"></span></div>'); lg.appendChild(l); return l.querySelector('.fx-v'); });
    const norm = v => { const s = v.reduce((a, b) => a + b, 0) || 1; return v.map(x => x / s * 100); };
    return { n, upd(lt, t, t0) { let k = 0; its.forEach((it, i) => { if (t >= tAt(e, i, t0)) k = i; }); const s = tAt(e, k, t0), p = k ? io((t - s) / 0.7) : oc(lt / 0.6);
      const a = norm(k ? its[k - 1].values : its[0].values.map(() => 0)), b = norm(its[k].values); yr.textContent = its[k].label; yr.style.transform = 'translateY(' + (1 - oc((t - s) / 0.2)) * 16 + 'px)';
      sr.forEach((_, j) => { const w = k ? lerp(a[j], b[j], p) : b[j] * p; sg[j].style.width = w + '%'; sg[j].textContent = w > 12 ? Math.round(w) + '%' : ''; lv[j].textContent = Math.round(w) + '%'; }); } }; }, sfx: sfxFill });

// ---------- treemap: tessere proporzionali
const squarify = (vals, x, y, w, h) => { const out = []; let items = vals.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v); const tot = items.reduce((a, b) => a + b.v, 0) || 1; items.forEach(o => o.a = o.v / tot * w * h);
  const worst = (row, s) => { const sum = row.reduce((a, b) => a + b.a, 0), mx = Math.max(...row.map(r => r.a)), mn = Math.min(...row.map(r => r.a)); return Math.max(s * s * mx / (sum * sum), sum * sum / (s * s * mn)); };
  while (items.length) { const s = Math.min(w, h); let row = [items[0]], k = 1; while (k < items.length && worst(row.concat(items[k]), s) <= worst(row, s)) { row.push(items[k]); k++; }
    const sum = row.reduce((a, b) => a + b.a, 0); if (w >= h) { const rw = sum / h; let yy = y; row.forEach(r => { out[r.i] = [x, yy, rw, r.a / rw]; yy += r.a / rw; }); x += rw; w -= rw; } else { const rh = sum / w; let xx = x; row.forEach(r => { out[r.i] = [xx, y, r.a / rh, rh]; xx += r.a / rh; }); y += rh; h -= rh; }
    items = items.slice(k); } return out; };
FX.add('els', 'treemap', { desc: 'grafico. A treemap: tiles sized by value drop in one by one, the highlight (default the biggest) in orange. items:[{label,value,display}], highlight', from: 'treemap-split,shape-pack',
  build(e) { const its = ITEMS(e), Hh = 500, mx = Math.max(...its.map(i => i.value)), hi = e.highlight ?? its.findIndex(i => i.value === mx), R = squarify(its.map(i => i.value), 0, 0, W, Hh); const cs = [C.blue, C.ink, '#8A93A6', '#5F79C9', C.gray];
    const n = box('treemap', '', 'position:relative;height:' + Hh + 'px'); let j = 0;
    const Tl = its.map((it, k) => { const r = R[k], col = k === hi ? C.orange : cs[j++ % 5], big = r[2] > 150 && r[3] > 110;
      const d = H('<div style="position:absolute;left:' + (r[0] + 3) + 'px;top:' + (r[1] + 3) + 'px;width:' + (r[2] - 6) + 'px;height:' + (r[3] - 6) + 'px;background:' + col + ';color:' + (col === C.gray ? C.ink : '#fff') + ';padding:14px 16px;box-sizing:border-box;overflow:hidden;transform-origin:left top">' + (r[2] > 90 && r[3] > 60 ? '<div style="font:700 ' + (big ? 26 : 20) + 'px/1.15 Inter">' + es(it.label) + '</div><div style="font:400 ' + (big ? 60 : 34) + 'px/1.1 Anton">' + es(disp(it)) + '</div>' : '') + '</div>'); n.appendChild(d); return d; });
    return { n, upd(lt, t, t0) { Tl.forEach((d, k) => { const s = tAt(e, k, t0), p = U.spring(t - s, { damping: 14, stiffness: 170 }); d.style.opacity = cl((t - s) / 0.15); d.style.transform = 'scale(' + Math.max(0, p) + ')'; }); } }; }, sfx: sfxPop });

// ---------- measure: due misure con le quote da disegno tecnico
FX.add('els', 'measure', { desc: 'grafico. Two (or three) slabs measured with technical-drawing dimension lines: each slab grows with its dimension line and figure; optional stat lands below (e.g. "14x faster"). items:[{label,value,display}], stat, highlight (default last)', from: 'measure-dim,thin-slab,cut-stat',
  build(e) { const its = ITEMS(e), mx = Math.max(...its.map(i => i.value)) || 1, hi = e.highlight ?? its.length - 1;
    const n = box('measure', '<div class="rw"></div>' + (e.stat ? '<div class="fx-big st" style="color:' + C.orange + ';margin-top:10px">' + es(e.stat) + '</div>' : '') + capHtml(e)); const rw = n.firstChild;
    const R = its.map((it, k) => { const w = Math.max(10, it.value / mx * W), col = k === hi ? C.orange : C.blue; const sv = svgN(W, 150); rw.appendChild(sv); const g = S('g', {}, sv);
      txt(g, { x: 0, y: 26, 'font-family': 'Mono', 'font-size': 22, fill: C.mute }, (it.label || '').toUpperCase()); const dm = S('g', {}, g);
      S('line', { x1: 0, x2: 0, y1: 50, y2: 120, stroke: C.ink, 'stroke-width': 2 }, dm); const e2 = S('line', { y1: 50, y2: 120, stroke: C.ink, 'stroke-width': 2 }, dm); const dl = S('line', { x1: 0, y1: 62, y2: 62, stroke: C.ink, 'stroke-width': 3 }, dm);
      const ah = S('path', { fill: C.ink }, dm); S('path', { d: 'M0 62 l14 -7 v14 Z', fill: C.ink }, dm); const tx = txt(g, { y: 52, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 900, fill: col }, disp(it));
      const sl = S('rect', { x: 0, y: 84, height: 30, fill: col }, g); return { g, e2, dl, ah, tx, sl, w }; });
    const st = n.querySelector('.st');
    return { n, upd(lt, t, t0) { R.forEach((r, k) => { const s = tAt(e, k, t0), p = io((t - s) / 0.7), w = r.w * p; r.g.style.opacity = cl((t - s) / 0.2);
      r.sl.setAttribute('width', w); r.e2.setAttribute('x1', w); r.e2.setAttribute('x2', w); r.dl.setAttribute('x2', w); r.ah.setAttribute('d', 'M' + w + ' 62 l-14 -7 v14 Z'); r.tx.setAttribute('x', Math.max(80, w / 2)); r.tx.style.opacity = cl((p - 0.5) / 0.5); });
      if (st) { const s = tAt(e, its.length - 1, t0) + 0.8, q = oc((t - s) / 0.35); st.style.opacity = q; st.style.transform = 'translateY(' + (1 - q) * 18 + 'px)'; } } }; }, sfx: sfxFill });

// ---------- gauge: tachimetro a semicerchio
FX.add('els', 'gauge', { desc: 'grafico. A half-dial gauge: segments light up to the value, the needle swings and locks with a small overshoot, the figure counts in the middle; optional marker for last year. value, min (0), max (100), display, label, marker, markerLabel', from: 'speed-trap,radial-bars,max-q',
  build(e) { const mn = e.min ?? 0, mx = e.max ?? 100, R = 300, cx = W / 2, cy = 330, Ns = 36, fr = v => cl((v - mn) / (mx - mn || 1)), A = f => Math.PI * (1 + f);
    const n = box('gauge', '<svg width="' + W + '" height="490"></svg>' + capHtml(e)); const sv = n.firstChild;
    const segs = Array.from({ length: Ns }, (_, i) => { const a0 = A(i / Ns) + 0.012, a1 = A((i + 1) / Ns) - 0.012, ro = R, ri = R - 52; const p = [[ro, a0], [ro, a1], [ri, a1], [ri, a0]].map(([r, a]) => (cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1));
      return S('polygon', { points: p.join(' '), fill: C.line }, sv); });
    [[mn, 'start', cx - R], [mx, 'end', cx + R]].forEach(([v, an, x]) => txt(sv, { x, y: cy + 40, 'text-anchor': an, 'font-family': 'Mono', 'font-size': 22, fill: C.mute }, fm(v, 0)));
    if (e.marker != null) { const a = A(fr(e.marker)); S('line', { x1: cx + Math.cos(a) * (R + 6), y1: cy + Math.sin(a) * (R + 6), x2: cx + Math.cos(a) * (R + 34), y2: cy + Math.sin(a) * (R + 34), stroke: C.ink, 'stroke-width': 6 }, sv);
      txt(sv, { x: cx + Math.cos(a) * (R + 46), y: cy + Math.sin(a) * (R + 46), 'text-anchor': Math.cos(a) > 0.2 ? 'start' : Math.cos(a) < -0.2 ? 'end' : 'middle', 'font-family': 'Mono', 'font-size': 20, fill: C.ink }, (e.markerLabel || 'LAST') + ' ' + fm(e.marker, 0)); }
    const nd = S('g', {}, sv); S('path', { d: 'M0 -9 L' + (R - 70) + ' 0 L0 9 Z', fill: C.ink }, nd); S('circle', { r: 20, fill: C.ink }, nd);
    const big = txt(sv, { x: cx, y: cy + 150, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-weight': 400, 'font-size': 110, fill: C.blue }, '');
    return { n, upd(lt) { const f = fr(e.value ?? 0), s = U.spring(lt - 0.1, { damping: 9, stiffness: 90 }), cur = f * s; nd.setAttribute('transform', 'translate(' + cx + ' ' + cy + ') rotate(' + (180 + cur * 180) + ')');
      segs.forEach((p, i) => p.setAttribute('fill', (i + 0.5) / Ns <= Math.min(f, cur) ? ((i + 0.5) / Ns > 0.8 ? C.orange : C.blue) : C.line)); big.textContent = cnum(e.display ?? fm(e.value ?? 0, e.decimals), oc(lt / 1.2)); } }; },
  sfx(e, t0, T, add) { add(t0, 'roll', { d: 0.9 }); add(t0 + 0.9, 'click'); } });

// ---------- meter: barra a segmenti con indicatore
FX.add('els', 'meter', { desc: 'grafico. A segmented bar fills cell by cell to the value (like an XP bar), with an optional marker (last year, target) and a delta chip next to the figure. value, max, display, label, marker, markerLabel, delta, segments (20)', from: 'level-up,speed-trap,uptime-strip',
  build(e) { const mx = e.max || 100, Ns = e.segments || 20, g = 6, cw = (W - g * (Ns - 1)) / Ns;
    const n = box('meter', '<div style="display:flex;align-items:center;gap:22px"><div class="fx-big"></div>' + (e.delta ? '<div class="dl" style="font:700 30px Mono;color:#fff;background:' + C.orange + ';padding:8px 14px">' + es(e.delta) + '</div>' : '') + '</div><div class="br" style="position:relative;display:flex;gap:' + g + 'px;height:84px;margin-top:20px"></div>' + capHtml(e));
    const br = n.querySelector('.br'), big = n.querySelector('.fx-big'), dl = n.querySelector('.dl'); const cells = Array.from({ length: Ns }, () => { const d = H('<i style="flex:1;background:' + C.line + '"></i>'); br.appendChild(d); return d; });
    if (e.marker != null) br.appendChild(H('<div style="position:absolute;left:' + (e.marker / mx * W - 3) + 'px;top:-14px;bottom:-14px;width:6px;background:' + C.ink + '"><span style="position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:6px;font:700 20px Mono;color:' + C.ink + ';white-space:nowrap">' + es((e.markerLabel || 'LAST') + ' ' + fm(e.marker, 0)) + '</span></div>'));
    if (e.marker != null) n.querySelector('.fx-cap') && (n.querySelector('.fx-cap').style.marginTop = '46px');
    return { n, upd(lt) { const D = e.dur || 1.2, f = cl((e.value || 0) / mx), on = f * Ns * oc(lt / D); cells.forEach((c, i) => { c.style.background = i < Math.floor(on + 1e-6) ? (i + 1 > (e.marker != null ? e.marker / mx * Ns : Ns) ? C.orange : C.blue) : C.line; c.style.transform = 'scaleY(' + (i < on && i >= on - 1.5 ? 1.15 : 1) + ')'; });
      big.textContent = cnum(e.display ?? fm(e.value || 0, e.decimals), oc(lt / D)); if (dl) { const q = E.outBack((lt - D) / 0.35); dl.style.transform = 'scale(' + Math.max(0, q) + ')'; } } }; },
  sfx(e, t0, T, add) { add(t0, 'roll', { d: e.dur || 1.2 }); if (e.delta) add(t0 + (e.dur || 1.2), 'pop'); } });

// ---------- versus: intestazione divisa in diagonale e righe di statistiche
FX.add('els', 'versus', { desc: 'grafico. A diagonal split header (A in ink, B in orange, VS in the seam) then stat rows slide in from both sides; the better side of each row is set bold in its color. a:{name}, b:{name}, items:[{label,a,b,da,db,low (true if lower is better)}]', from: 'versus-split',
  build(e) { const its = ITEMS(e), a = e.a || {}, b = e.b || {};
    const n = box('versus', '<div class="hd" style="position:relative;height:150px"><div class="A" style="position:absolute;inset:0;background:' + C.ink + ';clip-path:polygon(0 0,56% 0,44% 100%,0 100%);display:flex;align-items:center;padding-left:28px;font:400 56px Anton;color:#fff;text-transform:uppercase">' + es(a.name) + '</div><div class="B" style="position:absolute;inset:0;background:' + C.orange + ';clip-path:polygon(56% 0,100% 0,100% 100%,44% 100%);display:flex;align-items:center;justify-content:flex-end;padding-right:28px;font:400 56px Anton;color:#fff;text-transform:uppercase">' + es(b.name) + '</div><div class="V" style="position:absolute;left:50%;top:50%;width:84px;height:84px;margin:-42px 0 0 -42px;border-radius:50%;background:' + C.paper + ';display:flex;align-items:center;justify-content:center;font:400 40px Anton;color:' + C.ink + '">VS</div></div><div class="rs" style="margin-top:18px"></div>');
    const rs = n.querySelector('.rs'); const R = its.map(it => { const wa = it.low ? it.a < it.b : it.a > it.b, wb = it.low ? it.b < it.a : it.b > it.a;
      const d = H('<div style="display:flex;align-items:center;padding:16px 0;border-bottom:2px solid ' + C.line + '"><span class="x" style="flex:1;font:' + (wa ? 900 : 500) + ' 44px Inter;color:' + (wa ? C.ink : C.mute) + '">' + es(it.da ?? fm(it.a, it.decimals)) + '</span><span class="fx-k" style="flex:1.2;text-align:center">' + es(it.label) + '</span><span class="y" style="flex:1;text-align:right;font:' + (wb ? 900 : 500) + ' 44px Inter;color:' + (wb ? C.orange : C.mute) + '">' + es(it.db ?? fm(it.b, it.decimals)) + '</span></div>'); rs.appendChild(d); return d; });
    const A = n.querySelector('.A'), B = n.querySelector('.B'), V = n.querySelector('.V');
    return { n, upd(lt, t, t0) { const p = io(lt / 0.4); A.style.transform = 'translateX(' + (-(1 - p) * 60) + '%)'; B.style.transform = 'translateX(' + (1 - p) * 60 + '%)'; V.style.transform = 'scale(' + Math.max(0, E.outBack((lt - 0.35) / 0.3)) + ')';
      R.forEach((d, k) => { const s = Math.max(tAt(e, k, t0), t0 + 0.4 + k * 0.15), q = oc((t - s) / 0.35); d.style.opacity = q; d.querySelector('.x').style.transform = 'translateX(' + (-(1 - q) * 60) + 'px)'; d.querySelector('.y').style.transform = 'translateX(' + (1 - q) * 60 + 'px)'; }); } }; }, sfx: sfxPop });

// ---------- form-strip: la striscia dei risultati (W D L)
FX.add('els', 'form-strip', { desc: 'grafico. A season strip: one tick per match (W blue tall, D gray, L orange short) sweeps in, the longest winning run gets a bracket and a chip ("12 IN A ROW"), then the figure lands. results ("WWDLW..."), display, label, streakLabel', from: 'uptime-strip,combo-counter',
  build(e) { const r = String(e.results || '').toUpperCase().replace(/[^WDL]/g, ''), N = r.length || 1, g = N > 30 ? 4 : 6, cw = (W - g * (N - 1)) / N, Hh = 120; let bs = 0, bl = 0, cs = 0, cl2 = 0;
    for (let i = 0; i < N; i++) { if (r[i] === 'W') { if (!cl2) cs = i; cl2++; if (cl2 > bl) { bl = cl2; bs = cs; } } else cl2 = 0; }
    const n = box('form-strip', '<svg width="' + W + '" height="' + (Hh + 70) + '"></svg>' + (e.display ? '<div class="fx-big" style="margin-top:6px">' + es(e.display) + '</div>' : '') + capHtml(e)); const sv = n.firstChild;
    const tk = Array.from(r).map((c, i) => S('rect', { x: i * (cw + g), y: Hh - (c === 'W' ? Hh : c === 'D' ? Hh * 0.55 : Hh * 0.3), width: cw, height: c === 'W' ? Hh : c === 'D' ? Hh * 0.55 : Hh * 0.3, fill: c === 'W' ? C.blue : c === 'D' ? C.gray : C.orange }, sv));
    const br = S('g', {}, sv); if (bl > 2) { const x0 = bs * (cw + g), x1 = (bs + bl) * (cw + g) - g; S('path', { d: 'M' + x0 + ' ' + (Hh + 12) + ' v14 H' + x1 + ' v-14', fill: 'none', stroke: C.ink, 'stroke-width': 4 }, br); const lb = (e.streakLabel || bl + ' IN A ROW'), lw = lb.length * 14 + 24, xm = Math.min(W - lw, Math.max(0, (x0 + x1) / 2 - lw / 2));
      S('rect', { x: xm, y: Hh + 30, width: lw, height: 38, fill: C.ink }, br); txt(br, { x: xm + lw / 2, y: Hh + 57, 'text-anchor': 'middle', 'font-family': 'Mono', 'font-size': 22, fill: '#fff' }, lb); }
    const big = n.querySelector('.fx-big');
    return { n, upd(lt) { const D = e.dur || 1.2; tk.forEach((q, i) => { const p = oc((lt - i / N * D) / 0.2); q.setAttribute('transform', 'translate(0 ' + (1 - p) * Hh + ') '); q.style.opacity = p > 0 ? 1 : 0; });
      br.style.opacity = cl((lt - D - 0.1) / 0.25); if (big) { big.style.opacity = cl((lt - D - 0.3) / 0.2); big.textContent = cnum(e.display, oc((lt - D - 0.3) / 0.5)); } } }; },
  sfx(e, t0, T, add) { add(t0, 'roll', { d: e.dur || 1.2 }); add(t0 + (e.dur || 1.2) + 0.1, 'pop'); } });

// ---------- clock: uno spicchio di partita sul quadrante
FX.add('els', 'clock', { desc: 'grafico. A match clock (90 minutes by default, or 60): the hand sweeps from "from" to "to" painting an orange wedge (e.g. goals after the 75th minute), figure and caption beside it. from, to, max (90), display, label', from: 'clock-sweep,countdown',
  build(e) { const mx = e.max || 90, R = 200, Z = 2 * R + 30, c = Z / 2, a = m => -Math.PI / 2 + m / mx * 2 * Math.PI;
    const n = box('clock', '<div style="display:flex;align-items:center;gap:30px"><svg width="' + Z + '" height="' + Z + '"></svg><div style="flex:1"><div class="fx-big" style="color:' + C.orange + '"></div><div class="fx-cap" style="font-size:32px">' + mdx(e.label || '') + '</div></div></div>'); const sv = n.querySelector('svg'), big = n.querySelector('.fx-big');
    S('circle', { cx: c, cy: c, r: R, fill: '#fff', stroke: C.ink, 'stroke-width': 6 }, sv); const wd = S('path', { fill: C.orange, 'fill-opacity': 0.85 }, sv);
    for (let m = 0; m < mx; m += mx / 60) { const maj = Math.abs(m % (mx / 6)) < 1e-6, an = a(m); S('line', { x1: c + Math.cos(an) * (R - (maj ? 30 : 14)), y1: c + Math.sin(an) * (R - (maj ? 30 : 14)), x2: c + Math.cos(an) * (R - 6), y2: c + Math.sin(an) * (R - 6), stroke: maj ? C.ink : C.gray, 'stroke-width': maj ? 5 : 2 }, sv);
      if (maj) txt(sv, { x: c + Math.cos(an) * (R - 56), y: c + Math.sin(an) * (R - 56) + 8, 'text-anchor': 'middle', 'font-family': 'Mono', 'font-size': 22, fill: C.mute }, Math.round(m)); }
    const hd = S('line', { x1: c, y1: c, stroke: C.ink, 'stroke-width': 8, 'stroke-linecap': 'round' }, sv); S('circle', { cx: c, cy: c, r: 12, fill: C.ink }, sv);
    return { n, upd(lt) { const f = e.from || 0, to = e.to ?? mx, D = e.dur || 1.2, hIn = oc(lt / 0.3), m = lerp(f, to, io((lt - 0.3) / D)), an = a(lt < 0.3 ? f * hIn : m);
      hd.setAttribute('x2', c + Math.cos(an) * (R - 40)); hd.setAttribute('y2', c + Math.sin(an) * (R - 40));
      if (lt > 0.3 && m > f) { const a0 = a(f), a1 = a(m), lg = (m - f) / mx > 0.5 ? 1 : 0; wd.setAttribute('d', 'M' + c + ' ' + c + ' L' + (c + Math.cos(a0) * (R - 6)) + ' ' + (c + Math.sin(a0) * (R - 6)) + ' A' + (R - 6) + ' ' + (R - 6) + ' 0 ' + lg + ' 1 ' + (c + Math.cos(a1) * (R - 6)) + ' ' + (c + Math.sin(a1) * (R - 6)) + ' Z'); } else wd.setAttribute('d', '');
      big.textContent = cnum(e.display ?? (Math.round(to - f) + "'"), oc((lt - 0.3) / D)); big.style.opacity = cl((lt - 0.3) / 0.2); } }; },
  sfx(e, t0, T, add) { add(t0 + 0.3, 'pen', { d: e.dur || 1.2 }); } });
})();
