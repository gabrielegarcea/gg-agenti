// GG Motion — effetti di testo (parte A): comparse di righe, titoli e copertina, enfasi su una parola,
// piu' due elementi nuovi (index-list, marquee). Idee riprese dalla categoria "typography" di Remocn
// (https://github.com/Remocn/remocn, licenza MIT, vedi LICENSE-remocn.txt), riscritte in JS semplice.
// Opzioni: nel campo "fx" dello stesso oggetto che porta "anim" (elemento text, capitolo, cover),
// es. {"type":"text","anim":"mark-underline","fx":{"color":"blue"},"lines":["..."]}.
// Tutto e' puro nel tempo: lo stato ammesso e' solo la preparazione (span, nodi, misure di layout in cache).
(() => {
  const U = FX.u, C = FX.C, E = U.E, cl = U.clamp, lerp = U.lerp;
  const op = (o, k, d) => (o && o.fx && o.fx[k] != null ? o.fx[k] : d);
  const vis = (n, lt) => { n.style.opacity = lt < 0 ? '0' : '1'; return lt >= 0; };
  const gap = (N, tot, mx) => (N > 1 ? Math.min(mx, tot / (N - 1)) : 0);
  const words = n => U.split(n, 'words');
  // lettere, ma raggruppate per parola in span nowrap (cosi' la riga non va a capo a meta' parola)
  const chars = n => { const ps = U.split(n, 'chars'); if (!n._fxW) { n._fxW = 1; ps.forEach(p => { let w = p.previousSibling;
    if (!(w && w.nodeType === 1 && w.classList.contains('fxw'))) { w = document.createElement('span'); w.className = 'fxw'; p.parentNode.insertBefore(w, p); } w.appendChild(p); }); } return ps; };
  // involucro inline-block di tutta la riga (serve per trasformare anche i nodi inline della copertina)
  const inner = n => { if (n._fxL) return n._fxL; const w = document.createElement('span'); w.className = 'fxl'; while (n.firstChild) w.appendChild(n.firstChild); n.appendChild(w); return (n._fxL = w); };
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const rgb = s => (String(s).match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map(Number);
  const css = a => 'rgb(' + a.map(Math.round).join(',') + ')';
  const mix = (a, b, p) => { p = cl(p); return css(a.map((v, i) => v + (b[i] - v) * p)); };
  const colOf = p => { if (!p._c) { const c = getComputedStyle(p).color; if (c) p._c = rgb(c); } return p._c || hex(C.ink); };
  const pal = k => hex(C[k] || C.orange);
  // misure di layout una volta sola (offset*: non risentono delle trasformazioni)
  const meas = (n, ps) => { if (n._fxM) return true; if (!n.getClientRects().length) return false;
    ps.forEach(p => { p._w = p.offsetWidth; p._h = p.offsetHeight; p._x = p.offsetLeft; p._y = p.offsetTop; }); n._fxM = 1; return true; };
  const fsOf = el => { if (!el._fs) el._fs = parseFloat(getComputedStyle(el).fontSize) || 80; return el._fs; };
  const clr = (el, ...k) => k.forEach(x => { el.style[x] = ''; });
  // maschera fissa per un pezzo spostato in verticale di y px (il ritaglio resta dov'era il pezzo)
  const maskY = (p, y) => { if (Math.abs(y) < 0.05) { clr(p, 'transform', 'clipPath'); return; }
    p.style.transform = 'translateY(' + y.toFixed(2) + 'px)'; p.style.clipPath = 'inset(' + (-y).toFixed(2) + 'px -0.3em ' + y.toFixed(2) + 'px -0.3em)'; };
  // parole bersaglio dell'enfasi: i <b>, altrimenti l'ultima parola
  const targets = n => { if (n._fxT) return n._fxT; let t = [...n.querySelectorAll('b')];
    if (!t.length) { const tw = document.createTreeWalker(n, NodeFilter.SHOW_TEXT); let last = null; while (tw.nextNode()) if (/\S/.test(tw.currentNode.nodeValue)) last = tw.currentNode;
      if (last) { const m = last.nodeValue.match(/^([\s\S]*?)(\S+)(\s*)$/); const sp = document.createElement('span'); sp.className = 'fxt'; sp.textContent = m[2]; const pa = last.parentNode;
        if (m[1]) pa.insertBefore(document.createTextNode(m[1]), last); pa.insertBefore(sp, last); if (m[3]) pa.insertBefore(document.createTextNode(m[3]), last); pa.removeChild(last); t = [sp]; } }
    return (n._fxT = t); };
  // comparsa base della riga (0.35 s, sale di poco), usata dagli effetti di enfasi
  const baseIn = (n, lt) => { const w = inner(n), q = cl(lt / 0.35), e = E.outCubic(q); w.style.opacity = q >= 1 ? '' : e.toFixed(3); w.style.transform = q >= 1 ? '' : 'translateY(' + ((1 - e) * 0.3).toFixed(3) + 'em)'; };

  FX.css(`
.fxw{display:inline-block;white-space:nowrap}
.fxl{display:inline-block}
.cv-t .l.hi span.fxp,.cv-t .l.hi span.fxw,.cv-t .l.hi span.fxl,.cv-t .l.hi span.fxt,.cv-t .l.hi span.fx-was,.cv-t .l.hi span.fx-dots,.cv-t .l.hi span.fx-echo,.cv-t .l.hi span.fx-speed{background:none;padding:0;margin:0}
.fx-caret{display:inline-block;width:.08em;height:.92em;margin:0 -.11em 0 .03em;vertical-align:-.1em;background:var(--orange)}
.fx-speed{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}
.fx-speed i{position:absolute;left:0;height:.06em;border-radius:.03em;background:var(--orange)}
.fx-speed i:nth-child(1){top:-2%}.fx-speed i:nth-child(2){top:100%;background:var(--blue)}.fx-speed i:nth-child(3){top:106%;background:var(--ink);height:.035em}
.fx-mk{position:absolute;overflow:visible;pointer-events:none}
.fx-mk path{fill:none;stroke:var(--orange);stroke-linecap:round;stroke-linejoin:round}
.fx-was{display:inline-block;position:relative;white-space:pre;color:#6E6A62}
.fx-st{position:absolute;left:-.04em;top:52%;height:.075em;background:var(--orange);border-radius:.04em;width:0}
.fx-dots{position:absolute;left:0;top:50%;transform:translateY(-50%);display:flex;gap:.16em;pointer-events:none}
.fx-dots i{display:block;width:.2em;height:.2em;border-radius:50%;background:var(--orange)}
.fx-dots.lo{gap:.13em}.fx-dots.lo i{width:.32em;height:.32em;background:var(--line)}
.fx-blk{position:absolute;left:-.05em;right:-.05em;top:.1em;bottom:.08em;background:var(--blue);transform-origin:left center;transform:scaleX(0);pointer-events:none}
.fx-rule{position:absolute;height:.06em;background:var(--orange);pointer-events:none;transform:scaleX(0)}
.fx-echo{position:absolute;left:0;top:0;color:transparent;-webkit-text-stroke:2px var(--blue);pointer-events:none;opacity:0}
.fx-echo *{color:transparent!important}
.fx-boxw{color:#fff;-webkit-box-decoration-break:clone;box-decoration-break:clone;padding:.02em .2em;background-repeat:no-repeat;background-position:0 50%}
span.fx-boxw.fx-boxw b{color:var(--mark)}
.fx-ra,.fx-rb{position:absolute;left:0;top:0;white-space:nowrap}
.fx-idx{position:relative;width:715px}
.fx-idx .bd{position:absolute;left:-16px;right:-16px;background:var(--mark);opacity:0}
.fx-idx .ir{position:relative;display:flex;gap:26px;align-items:baseline;padding:16px 0 18px}
.fx-idx .ir .ru{position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--line);transform-origin:left;transform:scaleX(0)}
.fx-idx .nm{font:700 30px Mono;color:var(--orange);min-width:50px}
.fx-idx .tx{font:800 46px/1.15 Inter;color:var(--ink)}
.fx-idx .tx b{color:var(--blue)}
.fx-idx .ir.hi .tx{color:var(--blue)}
.fx-mq{width:715px;overflow:hidden}
.fx-mq .rw{overflow:hidden}.fx-mq .rw+.rw{margin-top:10px}.fx-mq .tk{display:flex;white-space:nowrap}.fx-mq .rw{padding:14px 0 10px;background:var(--ink);color:var(--paper);font:400 64px/1 Anton;text-transform:uppercase}
.fx-mq .rw.o{background:var(--orange);color:#fff}.fx-mq .rw.b{background:var(--blue);color:#fff}
.fx-mq .rw.p{background:transparent;color:var(--ink);border-top:4px solid var(--ink);border-bottom:4px solid var(--ink)}
.fx-mq .u{display:inline-flex;align-items:center;flex:0 0 auto}
.fx-mq .u i{display:inline-block;width:16px;height:16px;border-radius:50%;background:var(--orange);margin:0 30px}
.fx-mq .rw.o .u i{background:var(--ink)}
`);

  // ---------- COMPARSE PER LETTERA ----------
  FX.add('text', 'letter-rise', { desc: 'Letters rise into place one after another in a staircase (fx.dir: up, down, hop)', from: 'bottom-up-letters, edge-fit, letter-relay, a-to-z',
    prep(n) { chars(n); },
    draw(n, lt, o) { const ps = chars(n); if (!vis(n, lt)) return; const N = ps.length, s = gap(N, 0.5, 0.045), dir = op(o, 'dir', 'up');
      ps.forEach((p, i) => { const q = cl((lt - i * s) / 0.5), e = E.outQuart(q); let x = 0, y = (dir === 'down' ? -0.8 : 0.8) * (1 - e);
        if (dir === 'hop') { x = -0.55 * (1 - e); y = -Math.sin(Math.PI * e) * 0.4; }
        p.style.opacity = cl(q * 3).toFixed(3); p.style.transform = q >= 1 ? '' : 'translate(' + x.toFixed(3) + 'em,' + y.toFixed(3) + 'em)'; }); } });

  FX.add('text', 'fog-rise', { desc: 'Letters resolve out of a vertical blur streak from the centre outwards', from: 'fog-rise, chromatic-wave',
    prep(n) { chars(n).forEach(p => { p.style.transformOrigin = '50% 100%'; }); },
    draw(n, lt) { const ps = chars(n); if (!vis(n, lt)) return; const N = ps.length, mid = (N - 1) / 2;
      ps.forEach((p, i) => { const dl = Math.abs(i - mid) / Math.max(1, mid) * 0.35, q = cl((lt - dl) / 0.55), e = E.outCubic(q);
        p.style.opacity = cl(q * 2).toFixed(3); p.style.filter = q >= 1 ? '' : 'blur(' + ((1 - e) * 10).toFixed(2) + 'px)';
        p.style.transform = q >= 1 ? '' : 'translateY(' + (-(1 - e) * 0.2).toFixed(3) + 'em) scaleY(' + (1 + (1 - e) * 0.9).toFixed(3) + ')'; }); } });

  FX.add('text', 'type-on', { desc: 'Typed letter by letter behind an orange caret that blinks and leaves (fx.hot: letters start orange and cool to ink; fx.cps)', from: 'caret-letter, caret-swap, cooling-type, grid-cell',
    prep(n) { chars(n); const c = document.createElement('span'); c.className = 'fx-caret'; n._fxC = c; },
    draw(n, lt, o) { const ps = chars(n), c = n._fxC, N = ps.length; if (!vis(n, lt)) { c.style.display = 'none'; return; }
      const rate = Math.max(op(o, 'cps', 24), N / 0.9), k = Math.min(N, Math.floor(lt * rate)), tEnd = N / rate, hot = op(o, 'hot', false), HOT = pal('orange');
      ps.forEach((p, i) => { const a = lt - i / rate; const tc = hot ? colOf(p) : null; p.style.visibility = i < k ? '' : 'hidden';
        p.style.color = hot && a < 0.5 ? mix(HOT, tc, a / 0.5) : ''; });
      const on = lt < tEnd + 0.6 && (lt < tEnd || Math.floor((lt - tEnd) / 0.2) % 2 === 0);
      c.style.display = on ? '' : 'none'; if (on) { if (k > 0) ps[k - 1].after(c); else ps[0].before(c); } } });

  const GL = { u: 'ABCDEFGHJKLMNPQRSTUVWXYZ', l: 'abcdefghjkmnpqrstuvwxyz', d: '0123456789', s: '#%&$@+' };
  const glyph = (ch, r) => { const set = /[0-9]/.test(ch) ? GL.d : /[a-z]/.test(ch) ? GL.l : /[A-Z]/.test(ch) ? GL.u : GL.s; return set[Math.floor(r * set.length)]; };
  FX.add('text', 'decode', { desc: 'Scrambled orange glyphs resolve left to right into the real text', from: 'matrix-decode, ndot-resolve, kinetic-morph-text',
    prep(n) { chars(n).forEach(p => { p._t = p.textContent; }); },
    draw(n, lt) { const ps = chars(n); if (!vis(n, lt)) return; meas(n, ps); const N = ps.length, s = gap(N, 0.6, 0.035);
      ps.forEach((p, i) => { const at = 0.2 + i * s;
        if (lt >= at) { if (p.textContent !== p._t) p.textContent = p._t; clr(p, 'width', 'color', 'opacity', 'textAlign'); return; }
        p.textContent = glyph(p._t, U.rnd(p._t + i, Math.floor(lt * 22))); if (p._w) p.style.width = p._w + 'px'; p.style.textAlign = 'center';
        p.style.color = C.orange; p.style.opacity = lt >= i * s * 0.35 ? '1' : '0'; }); } });

  const FONTS = { mono: ['Mono', '700'], hand: ['Hand', '700'], anton: ['Anton', '400'], light: ['Inter', '500'] };
  FX.add('text', 'font-settle', { desc: 'Letters start in another typeface (mono, hand, or cycling) and flip one by one into the final face', from: 'mono-settle, mono-voice, idea-set, font-cycle',
    prep(n) { chars(n); },
    draw(n, lt, o) { const ps = chars(n); if (!vis(n, lt)) return; meas(n, ps); const N = ps.length, mode = op(o, 'font', 'mono'), s = gap(N, 0.55, 0.04);
      const cyc = ['mono', 'hand', 'anton', 'light'], cur = mode === 'cycle' ? cyc[Math.floor(lt / 0.09) % 4] : mode, F = FONTS[cur] || FONTS.mono;
      ps.forEach((p, i) => { const flip = mode === 'cycle' ? 0.62 : 0.12 + i * s;
        p.style.opacity = cl(lt / 0.12).toFixed(3);
        if (lt >= flip) { clr(p, 'fontFamily', 'fontWeight', 'width', 'textAlign', 'color'); p.style.transform = lt - flip < 0.12 ? 'scaleY(' + (0.85 + 0.15 * (lt - flip) / 0.12).toFixed(3) + ')' : ''; return; }
        p.style.fontFamily = F[0]; p.style.fontWeight = F[1]; if (p._w) p.style.width = p._w + 'px'; p.style.textAlign = 'center'; p.style.color = cur === 'mono' ? C.mute : ''; p.style.transform = ''; }); } });

  FX.add('text', 'case-flip', { desc: 'Each glyph flips from lowercase to uppercase and back to its final casing with a squash', from: 'case-flip',
    prep(n) { chars(n).forEach(p => { p.style.transformOrigin = '50% 85%'; }); },
    draw(n, lt) { const ps = chars(n); if (!vis(n, lt)) return; meas(n, ps); const N = ps.length, s = gap(N, 0.4, 0.03);
      ps.forEach((p, i) => { const t1 = 0.08 + i * s, t2 = 0.42 + i * s; p.style.opacity = cl(lt / 0.1).toFixed(3);
        const st = lt < t1 ? 'lowercase' : lt < t2 ? 'uppercase' : ''; p.style.textTransform = st;
        const k = lt < t2 ? (lt - t1) : (lt - t2), sq = k >= 0 && k < 0.14 ? U.interp(k, [0, 0.08, 0.14], [0.3, 1.06, 1]) : 1;
        p.style.transform = sq === 1 ? '' : 'scaleY(' + sq.toFixed(3) + ')';
        if (st && p._w) { p.style.width = p._w + 'px'; p.style.textAlign = 'center'; } else clr(p, 'width', 'textAlign'); }); } });

  FX.add('text', 'light-up', { desc: 'The line appears in grey, then ink sweeps through it letter by letter (highlighted words land in blue)', from: 'hidden-word, less-more, focus-pan-text, half-built',
    prep(n) { chars(n); },
    draw(n, lt) { const ps = chars(n); if (!vis(n, lt)) return; const N = ps.length, s = gap(N, 0.6, 0.03), G = pal('gray');
      n.style.opacity = cl(lt / 0.2).toFixed(3);
      ps.forEach((p, i) => { const q = cl((lt - 0.25 - i * s) / 0.15), tc = colOf(p); p.style.color = q >= 1 ? '' : mix(G, tc, q); }); } });

  FX.add('text', 'texture-fill', { desc: 'Letters start as a dot-matrix (or ruled lines) and refresh one by one into solid type (fx.texture: dots, lines)', from: 'ndot-resolve, dot-type, line-relief, glyph-anatomy',
    prep(n) { chars(n); },
    draw(n, lt, o) { const ps = chars(n); if (!vis(n, lt)) return; const N = ps.length, s = gap(N, 0.55, 0.035), tx = op(o, 'texture', 'dots');
      ps.forEach((p, i) => { const sw = 0.25 + i * s; p.style.opacity = cl((lt - i * s * 0.3) / 0.12).toFixed(3);
        const f = tx === 'lines' ? cl(0.3 + 0.7 * (lt - i * s * 0.6) / 0.6) : (lt >= sw ? 1 : 0);
        if (f >= 1) { clr(p, 'color', 'backgroundImage', 'backgroundSize', 'webkitBackgroundClip', 'backgroundClip'); p.style.transform = lt - sw < 0.08 && lt >= sw && tx !== 'lines' ? 'scaleY(.88)' : ''; return; }
        const c = css(colOf(p)); p.style.color = 'transparent'; p.style.webkitBackgroundClip = 'text'; p.style.backgroundClip = 'text'; p.style.transform = '';
        if (tx === 'lines') { const a = (0.1 * f).toFixed(4); p.style.backgroundImage = 'repeating-linear-gradient(180deg,' + c + ' 0 ' + a + 'em,transparent ' + a + 'em .1em)'; p.style.backgroundSize = ''; }
        else { p.style.backgroundImage = 'radial-gradient(circle,' + c + ' 0 44%,transparent 48%)'; p.style.backgroundSize = '.105em .105em'; } }); } });

  FX.add('text', 'kerning-snap', { desc: 'Loosely spaced letters snap one by one into tight kerning', from: 'kerning-snap, crunch, letter-relay',
    prep(n) { chars(n); },
    draw(n, lt) { const ps = chars(n); if (!vis(n, lt)) return; const N = ps.length, s = gap(N, 0.55, 0.05), k = Math.min(0.3, 1.6 / N), mid = (N - 1) / 2;
      ps.forEach((p, i) => { const t0 = 0.1 + i * s, sp = U.spring(lt - t0, { damping: 14, stiffness: 320 }), x = (i - mid) * k * (1 - sp);
        const fl = U.interp(lt - t0, [0, 0.04, 0.2], [0, 1, 0]); p.style.opacity = (lt < t0 ? 0.4 * cl(lt / 0.1) : 1).toFixed(3);
        p.style.transform = lt - t0 > 0.6 ? '' : 'translateX(' + x.toFixed(3) + 'em) scaleY(' + (1 - 0.12 * fl).toFixed(3) + ')'; }); } });

  FX.add('text', 'wave', { desc: 'A soft wave runs through the letters, lifting them and tinting them orange as it passes', from: 'chromatic-wave, edit-ripple, kinetic-warp',
    prep(n) { chars(n); },
    draw(n, lt) { const ps = chars(n); if (!vis(n, lt)) return; const N = ps.length, w = 0.16, c = (lt - 0.1) / 0.75 * (1 + 2 * w) - w, O = pal('orange');
      n.style.opacity = cl(lt / 0.2).toFixed(3);
      ps.forEach((p, i) => { const x = N > 1 ? i / (N - 1) : 0, b = lt >= 0.95 ? 0 : Math.exp(-Math.pow((x - c) / w, 2));
        if (b < 0.003) { clr(p, 'transform', 'color'); return; }
        p.style.transform = 'translateY(' + (-0.2 * b).toFixed(3) + 'em) scaleY(' + (1 + 0.12 * b).toFixed(3) + ')'; p.style.color = mix(colOf(p), O, b); }); } });

  FX.add('text', 'shuffle', { desc: 'Letters start scrambled into each other\'s places and slide home along small arcs (best on short lines and titles)', from: 'anagram-shuffle, magnet-letters, kinetic-morph-text',
    prep(n) { const ps = chars(n); const idx = ps.map((_, i) => i).sort((a, b) => U.rnd('sh' + n.textContent, a) - U.rnd('sh' + n.textContent, b)); ps.forEach((p, i) => { p._j = idx[i]; }); },
    draw(n, lt) { const ps = chars(n); if (!vis(n, lt)) return; meas(n, ps); const N = ps.length, s = gap(N, 0.25, 0.012);
      n.style.opacity = cl(lt / 0.15).toFixed(3);
      ps.forEach((p, i) => { const q = cl((lt - 0.1 - i * s) / 0.7), e = E.inOutCubic(q), J = ps[p._j];
        if (q >= 1 || p._x == null) { p.style.transform = ''; return; }
        const x = (J._x - p._x) * (1 - e), y = (J._y - p._y) * (1 - e) - (i % 2 ? 1 : -1) * Math.sin(Math.PI * e) * (p._h || 80) * 0.3;
        p.style.transform = 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px)'; }); } });

  FX.add('text', 'slot-roll', { desc: 'Every letter rolls through random glyphs like a slot machine and lands left to right', from: 'a-to-z, layover, glyph-relay',
    prep(n) { chars(n).forEach(p => { p._t = p.textContent; }); },
    draw(n, lt) { const ps = chars(n); if (!vis(n, lt)) return; meas(n, ps); const N = ps.length, s = gap(N, 0.5, 0.04);
      ps.forEach((p, i) => { const L = 0.3 + i * s, h = p._h || 80;
        if (lt >= L) { if (p.textContent !== p._t) p.textContent = p._t; clr(p, 'width', 'textAlign', 'color'); const q = cl((lt - L) / 0.18); maskY(p, q >= 1 ? 0 : -(1 - E.outBack(q)) * h * 0.5); return; }
        const f = lt * 18, fr = f - Math.floor(f); p.textContent = glyph(p._t, U.rnd(p._t + 'slot' + i, Math.floor(f)));
        if (p._w) p.style.width = p._w + 'px'; p.style.textAlign = 'center'; p.style.color = C.mute; maskY(p, -(1 - fr) * h * 0.45); }); } });

  FX.add('text', 'acronym', { desc: 'Only the initials show (in orange), then each word unfolds letter by letter into the full name, e.g. National Basketball Association', from: 'acronym-expand',
    prep(n) { chars(n).forEach(p => { p._ini = p.parentNode.firstChild === p; }); },
    draw(n, lt) { const ps = chars(n); if (!vis(n, lt)) return; meas(n, ps); const O = pal('orange'); let wk = -1, ki = 0;
      ps.forEach(p => { if (p._ini) { wk++; ki = 0; } else ki++;
        if (p._ini) { const q = cl(lt / 0.2); p.style.transform = q >= 1 ? '' : 'scale(' + (0.6 + 0.4 * E.outBack(q)).toFixed(3) + ')'; p.style.opacity = q.toFixed(3);
          const g = cl((lt - 0.95) / 0.3); p.style.color = g >= 1 ? '' : mix(O, colOf(p), g); return; }
        const g = E.outCubic(cl((lt - 0.35 - wk * 0.08 - ki * 0.025) / 0.25));
        if (g >= 1) { clr(p, 'marginRight', 'clipPath', 'opacity'); return; }
        p.style.marginRight = (-(p._w || 0) * (1 - g)).toFixed(2) + 'px'; p.style.clipPath = 'inset(-0.3em ' + ((1 - g) * 100).toFixed(1) + '% -0.3em 0)'; p.style.opacity = g.toFixed(3); }); } });

  // ---------- COMPARSE PER PAROLA ----------
  FX.add('text', 'mask-up', { desc: 'Words (fx.unit: words or line) slide up out of an invisible mask with a compact stagger; fx.accel: true speeds the rhythm up', from: 'mask-reveal-up, feature-headline, feature-trio, name-gloss, hook-uncurl, embargo-lift, hot-stage, chore-fold, factor-out, escalate-cards, negation-drop, and-you, answer-first',
    prep(n, o) { if (op(o, 'unit', 'words') === 'line') inner(n); else words(n); },
    draw(n, lt, o) { if (!vis(n, lt)) return; const ps = op(o, 'unit', 'words') === 'line' ? [inner(n)] : words(n), N = ps.length, acc = op(o, 'accel', false); let tt = 0;
      ps.forEach((p, i) => { const q = cl((lt - tt) / 0.55), e = E.outQuart(q); tt += acc ? 0.17 * Math.pow(0.8, i) : gap(N, 0.45, 0.08);
        maskY(p, q >= 1 ? 0 : (1 - e) * (p.offsetHeight || 90) * 1.05); p.style.opacity = q > 0 ? '1' : '0'; }); } });

  FX.add('text', 'blur-in', { desc: 'Words fade up out of a soft blur (fx.unit: words or line; fx.blur px; fx.weight: true also goes from light to heavy)', from: 'blur-out-up, focus-blur-resolve, fade-through, enhance-count, bokeh-title, depth-headline, intelligence-glow, focus-front-swap',
    prep(n, o) { if (op(o, 'unit', 'words') === 'line') inner(n); else words(n); },
    draw(n, lt, o) { if (!vis(n, lt)) return; const line = op(o, 'unit', 'words') === 'line', ps = line ? [inner(n)] : words(n), N = ps.length;
      const B = op(o, 'blur', line ? 14 : 8), W = op(o, 'weight', false), d = line ? 0.7 : 0.55, s = gap(N, 0.5, 0.08);
      ps.forEach((p, i) => { const q = cl((lt - i * s) / d), e = E.outCubic(q); p.style.opacity = q >= 1 ? '' : E.outCubic(cl(q * 1.6)).toFixed(3);
        p.style.filter = q >= 1 ? '' : 'blur(' + ((1 - e) * B).toFixed(2) + 'px)';
        p.style.transform = q >= 1 ? '' : 'translateY(' + ((1 - e) * (line ? 0.12 : 0.22)).toFixed(3) + 'em)' + (line ? ' scale(' + (1 + 0.02 * (1 - e)).toFixed(4) + ')' : '');
        if (W) p.style.fontWeight = q < 0.35 ? '500' : q < 0.7 ? '700' : ''; }); } });

  FX.add('text', 'scale-in', { desc: 'The line settles from a slightly different scale with a fade (fx.scale start, default 0.9; fx.blur px)', from: 'micro-scale-fade, gradient-scale-cut-text, cool-down, deadpan-box',
    prep(n) { inner(n).style.transformOrigin = '0 60%'; },
    draw(n, lt, o) { if (!vis(n, lt)) return; const w = inner(n), q = cl(lt / 0.55), e = E.outQuart(q), S = op(o, 'scale', 0.9), B = op(o, 'blur', 0);
      w.style.opacity = q >= 1 ? '' : cl(q * 2).toFixed(3); w.style.transform = q >= 1 ? '' : 'scale(' + lerp(S, 1, e).toFixed(4) + ')'; w.style.filter = q >= 1 || !B ? '' : 'blur(' + ((1 - e) * B).toFixed(2) + 'px)'; } });

  FX.add('text', 'slide-in', { desc: 'Words (or the line) slide in from the left, or from the right with a light blur (fx.dir, fx.unit, fx.indent px per line for stepped lines)', from: 'line-by-line-slide, kinetic-center-build, indent-steps',
    prep(n, o) { if (op(o, 'unit', 'words') === 'line') inner(n); else words(n); const ind = op(o, 'indent', 0);
      if (ind && n.parentNode && n.classList.contains('ln')) n.style.paddingLeft = ([...n.parentNode.children].indexOf(n) * ind) + 'px'; },
    draw(n, lt, o) { if (!vis(n, lt)) return; const ps = op(o, 'unit', 'words') === 'line' ? [inner(n)] : words(n), N = ps.length, R = op(o, 'dir', 'left') === 'right', s = gap(N, 0.45, 0.08);
      ps.forEach((p, i) => { const q = cl((lt - i * s) / 0.5), e = E.outQuart(q); p.style.opacity = q >= 1 ? '' : cl(q * 2.5).toFixed(3);
        p.style.transform = q >= 1 ? '' : R ? 'translateX(' + ((1 - e) * 1.4).toFixed(3) + 'em) scale(' + (0.92 + 0.08 * e).toFixed(4) + ')' : 'translateX(' + (-(1 - e) * 0.9).toFixed(3) + 'em)';
        p.style.filter = q >= 1 || !R ? '' : 'blur(' + ((1 - e) * 5).toFixed(2) + 'px)'; }); } });

  FX.add('text', 'speed-in', { desc: 'The line rides in slanted on speed strips, then snaps upright', from: 'italic-speed, comet-headline, kill-feed',
    prep(n) { inner(n); n.style.position = 'relative'; const sk = document.createElement('span'); sk.className = 'fx-speed'; sk.innerHTML = '<i></i><i></i><i></i>'; n.insertBefore(sk, n.firstChild); n._fxS = sk; },
    draw(n, lt) { if (!vis(n, lt)) return; const w = inner(n), q = cl(lt / 0.5), e = E.outExpo(q), sp = U.spring(lt - 0.28, { damping: 12, stiffness: 260 });
      w.style.opacity = q >= 1 ? '' : cl(q * 3).toFixed(3);
      w.style.transform = lt >= 1.1 ? '' : 'translateX(' + (-(1 - e) * 2.4).toFixed(3) + 'em) skewX(' + (-15 * (1 - sp)).toFixed(2) + 'deg)';
      [...n._fxS.children].forEach((b, k) => { const f = cl((lt - k * 0.04) / 0.55); b.style.width = ((1 - E.outCubic(f)) * (40 + 12 * k)).toFixed(1) + '%'; b.style.left = (E.outCubic(f) * 35 + k * 4).toFixed(1) + '%'; b.style.opacity = (1 - f).toFixed(3); }); } });

  FX.add('text', 'slam', { desc: 'Words slam down one at a time from a larger size, with a short shake on each hit', from: 'full-bleed-type, got-em, exactly, double-take, cut-off, absorb-stack, ko-count',
    prep(n) { words(n).forEach(p => { p.style.transformOrigin = '50% 60%'; }); inner(n); },
    draw(n, lt) { if (!vis(n, lt)) return; const ps = words(n), w = inner(n), N = ps.length, s = gap(N, 0.55, 0.13); let sh = 0;
      ps.forEach((p, i) => { const q = cl((lt - i * s) / 0.2), e = E.outQuart(q); p.style.opacity = cl(q * 4).toFixed(3);
        p.style.transform = q >= 1 ? '' : 'scale(' + (1.35 - 0.35 * e).toFixed(4) + ')'; const a = lt - i * s - 0.2; if (a >= 0 && a < 0.14) sh = Math.max(sh, 1 - a / 0.14); });
      w.style.transform = sh > 0 ? 'translate(' + (U.noise(lt * 60, 'slx') * 5 * sh).toFixed(2) + 'px,' + (U.noise(lt * 60, 'sly') * 4 * sh).toFixed(2) + 'px)' : ''; } });

  FX.add('text', 'feather', { desc: 'Words drift down swaying like feathers and settle on the line (fx.style: drop for a straight fall with a squash)', from: 'feather-settle, baseline-drop',
    prep(n) { words(n).forEach(p => { p.style.transformOrigin = '50% 100%'; }); },
    draw(n, lt, o) { if (!vis(n, lt)) return; const ps = words(n), N = ps.length, drop = op(o, 'style', 'sway') === 'drop', s = gap(N, 0.5, drop ? 0.09 : 0.1);
      ps.forEach((p, i) => { const t = lt - i * s;
        if (drop) { const q = cl(t / 0.32), a = t - 0.32; p.style.opacity = cl(q * 4).toFixed(3); const sq = a >= 0 && a < 0.18 ? Math.sin(Math.PI * a / 0.18) * 0.12 : 0;
          p.style.transform = q < 1 ? 'translateY(' + (-(1 - q * q) * 1.1).toFixed(3) + 'em)' : sq ? 'scale(' + (1 + sq * 0.6).toFixed(3) + ',' + (1 - sq).toFixed(3) + ')' : ''; return; }
        const k = cl(t / 0.8), e = E.outCubic(k); p.style.opacity = cl(k * 4).toFixed(3);
        p.style.transform = k >= 1 ? '' : 'translate(' + (Math.sin(k * Math.PI * 2.2) * 0.22 * (1 - e)).toFixed(3) + 'em,' + (-(1 - e) * 1.1).toFixed(3) + 'em) rotate(' + (Math.sin(k * Math.PI * 2.2 + 0.6) * 9 * (1 - e)).toFixed(2) + 'deg)'; }); } });

  FX.add('text', 'elastic', { desc: 'Words land squashed and wide, then spring back to their shape like an elastic variable font', from: 'axis-flex, long-vowel, crunch, chunk-stack',
    prep(n) { words(n).forEach(p => { p.style.transformOrigin = '50% 100%'; }); },
    draw(n, lt) { if (!vis(n, lt)) return; const ps = words(n), N = ps.length, s = gap(N, 0.5, 0.09);
      ps.forEach((p, i) => { const t = lt - i * s, sp = U.spring(t, { damping: 11, stiffness: 220 }); p.style.opacity = cl(t / 0.1).toFixed(3);
        p.style.transform = t > 1.1 ? '' : 'scale(' + (1 + 0.4 * (1 - sp)).toFixed(4) + ',' + (1 - 0.45 * (1 - sp)).toFixed(4) + ')'; }); } });

  FX.add('text', 'outline-fill', { desc: 'Words appear as outlines, then fill with ink from left to right one by one', from: 'half-built, glyph-anatomy, line-relief',
    prep(n) { words(n); },
    draw(n, lt) { if (!vis(n, lt)) return; const ps = words(n), N = ps.length, s = gap(N, 0.45, 0.12); n.style.opacity = cl(lt / 0.2).toFixed(3);
      ps.forEach((p, i) => { const f = E.inOutCubic(cl((lt - 0.2 - i * s) / 0.35));
        if (f >= 1) { clr(p, 'color', 'webkitTextStroke', 'backgroundImage', 'webkitBackgroundClip', 'backgroundClip'); return; }
        const c = css(colOf(p)); p.style.color = 'transparent'; p.style.webkitTextStroke = Math.max(1.5, fsOf(p) * 0.028).toFixed(1) + 'px ' + c;
        p.style.webkitBackgroundClip = 'text'; p.style.backgroundClip = 'text'; p.style.backgroundImage = 'linear-gradient(90deg,' + c + ' ' + (f * 100).toFixed(1) + '%,transparent ' + (f * 100).toFixed(1) + '%)'; }); } });

  FX.add('text', 'ellipsis', { desc: 'Three orange dots pulse where the line will be, then the words resolve out of a blur (fx.wait seconds of dots)', from: 'ellipsis-resolve, answer-first, got-em',
    prep(n) { words(n); n.style.position = 'relative'; const d = document.createElement('span'); d.className = 'fx-dots'; d.innerHTML = '<i></i><i></i><i></i>'; n.appendChild(d); n._fxD = d; },
    draw(n, lt, o) { if (!vis(n, lt)) return; const W = op(o, 'wait', 0.6), ps = words(n), N = ps.length, s = gap(N, 0.4, 0.07), d = n._fxD;
      d.style.opacity = (cl(lt / 0.12) * (1 - cl((lt - W + 0.1) / 0.15))).toFixed(3);
      [...d.children].forEach((b, j) => { const pu = 0.5 + 0.5 * Math.sin(2 * Math.PI * (lt * 2.2 - j * 0.18)); b.style.transform = 'scale(' + (0.6 + 0.4 * pu).toFixed(3) + ')'; });
      ps.forEach((p, i) => { const q = cl((lt - W - i * s) / 0.45), e = E.outCubic(q); p.style.opacity = q >= 1 ? '' : e.toFixed(3);
        p.style.filter = q >= 1 ? '' : 'blur(' + ((1 - e) * 8).toFixed(2) + 'px)'; p.style.transform = q >= 1 ? '' : 'translateY(' + ((1 - e) * 0.15).toFixed(3) + 'em)'; }); } });

  FX.add('text', 'block-wipe', { desc: 'A solid blue block wipes across and pulls away to reveal the text (fx.unit: line or words; fx.color)', from: 'block-swap, aspect-slit, gooey-morph, beam-split, kill-feed',
    prep(n, o) { const per = op(o, 'unit', 'line') === 'words', ps = per ? words(n) : [inner(n)];
      ps.forEach(p => { p.style.position = 'relative'; const b = document.createElement('span'); b.className = 'fx-blk'; if (op(o, 'color', null)) b.style.background = C[op(o, 'color')] || op(o, 'color'); p.appendChild(b); p._fxB = b; }); n._fxBP = ps; },
    draw(n, lt, o) { if (!vis(n, lt)) return; const ps = n._fxBP, N = ps.length, s = gap(N, 0.4, 0.08);
      ps.forEach((p, i) => { const t = lt - i * s, g = E.inOutCubic(cl(t / 0.28)), r = E.inOutCubic(cl((t - 0.3) / 0.28)), b = p._fxB;
        p.style.color = t < 0.28 ? 'transparent' : ''; [...p.querySelectorAll('b')].forEach(x => { x.style.color = t < 0.28 ? 'transparent' : ''; });
        if (r >= 1) { b.style.transform = 'scaleX(0)'; return; }
        b.style.transformOrigin = t < 0.29 ? 'left center' : 'right center'; b.style.transform = 'scaleX(' + (t < 0.29 ? g : 1 - r).toFixed(4) + ')'; }); } });

  FX.add('text', 'slit-open', { desc: 'An orange rule draws across, then the line opens vertically out of it like a film slit', from: 'aspect-slit, beam-split, headline-to-line, intelligence-glow, cover-ring',
    prep(n) { inner(n); n.style.position = 'relative'; const r = document.createElement('span'); r.className = 'fx-rule'; n.appendChild(r); n._fxR = r; },
    draw(n, lt) { if (!vis(n, lt)) return; const w = inner(n), r = n._fxR, a = E.inOutCubic(cl(lt / 0.25)), op2 = E.inOutCubic(cl((lt - 0.2) / 0.4));
      r.style.left = w.offsetLeft + 'px'; r.style.width = w.offsetWidth + 'px'; r.style.top = (w.offsetTop + w.offsetHeight / 2 - 3) + 'px';
      r.style.transform = 'scaleX(' + a.toFixed(4) + ')'; r.style.opacity = (1 - cl((lt - 0.45) / 0.2)).toFixed(3);
      w.style.clipPath = op2 >= 1 ? '' : 'inset(' + ((1 - op2) * 50).toFixed(2) + '% -0.3em ' + ((1 - op2) * 50).toFixed(2) + '% -0.3em)'; } });

  FX.add('text', 'echo', { desc: 'The line focuses in while blue outline copies unfold above and below it and fade away', from: 'echo-stack, absorb-stack, loop-break',
    prep(n) { const w = inner(n); n.style.position = 'relative'; n._fxE = [-2, -1, 1, 2].map(k => { const c = document.createElement('span'); c.className = 'fx-echo'; c.setAttribute('aria-hidden', 'true'); c.innerHTML = w.innerHTML; c._k = k; n.insertBefore(c, w); return c; }); },
    draw(n, lt) { if (!vis(n, lt)) return; const w = inner(n), q = cl(lt / 0.45), e = E.outCubic(q), sp = E.outCubic(cl((lt - 0.05) / 0.6)), fade = cl(lt / 0.15) * (1 - cl((lt - 0.5) / 0.4));
      w.style.opacity = q >= 1 ? '' : cl(q * 2).toFixed(3); w.style.filter = q >= 1 ? '' : 'blur(' + ((1 - e) * 8).toFixed(2) + 'px)';
      n._fxE.forEach(c => { if (fade <= 0) { c.style.opacity = '0'; return; } c.style.width = w.offsetWidth + 'px'; c.style.left = w.offsetLeft + 'px'; c.style.top = w.offsetTop + 'px';
        c.style.transform = 'translateY(' + (c._k * fsOf(w) * 0.95 * lerp(0.15, 1, sp)).toFixed(2) + 'px)'; c.style.opacity = ((Math.abs(c._k) === 1 ? 0.6 : 0.3) * fade).toFixed(3); }); } });

  FX.add('text', 'extrude-pop', { desc: 'The line pops up out of the page on a solid orange 3D body, then sinks back flat (fx.keep px to keep some depth; fx.color)', from: 'extrude-pop',
    prep(n) { inner(n); },
    draw(n, lt, o) { if (!vis(n, lt)) return; const w = inner(n), D = fsOf(w) * op(o, 'depth', 0.12), K = op(o, 'keep', 0), col = C[op(o, 'color', 'orange')] || C.orange;
      const up = E.outBack(cl(lt / 0.3)), dn = E.inOutCubic(cl((lt - 0.6) / 0.35)), d = lt >= 0.95 ? K : lerp(0, D, up) * (1 - dn) + K * dn;
      w.style.opacity = cl(lt / 0.1).toFixed(3);
      if (d < 0.3) { clr(w, 'textShadow', 'transform'); return; } const st = Math.max(2, Math.round(d / 1.5)), sh = [];
      for (let k = 1; k <= st; k++) { const v = (k * d / st).toFixed(1); sh.push(v + 'px ' + v + 'px 0 ' + col); }
      w.style.textShadow = sh.join(','); w.style.transform = 'translate(' + (-d * 0.6).toFixed(2) + 'px,' + (-d * 0.6).toFixed(2) + 'px)'; } });

  FX.add('text', 'handwrite', { desc: 'The line is written in the hand font (Caveat) a few letters per stop-motion pose, with a slight wobble while writing (fx.font: false keeps the normal font)', from: 'handwrite, hand-count',
    prep(n, o) { chars(n); const w = inner(n); if (op(o, 'font', true) !== false) { w.style.fontFamily = 'Hand'; w.style.fontWeight = '700'; w.style.fontSize = '1.2em'; w.style.letterSpacing = '0'; } },
    draw(n, lt) { const ps = chars(n); if (!vis(n, lt)) return; const N = ps.length, per = Math.max(1.6, N / (0.85 * 12)), step = Math.floor(lt * 12), shown = Math.floor((step + 1) * per), done = shown >= N && lt > N / (per * 12) + 0.25;
      ps.forEach((p, i) => { p.style.visibility = i < shown ? '' : 'hidden'; if (done || i >= shown) { p.style.transform = ''; return; }
        const fresh = i >= shown - Math.ceil(per), r = U.rnd('hw' + i, step), r2 = U.rnd('hy' + i, step);
        p.style.transform = 'translateY(' + ((r2 - 0.5) * 0.05).toFixed(3) + 'em) rotate(' + ((r - 0.5) * (fresh ? 8 : 4)).toFixed(2) + 'deg)' + (fresh ? ' scale(1.08)' : ''); }); } });

  FX.add('text', 'box-in', { desc: 'A flat blue box grows behind the line and the words punch in white (highlighted words in peach)', from: 'deadpan-box, double-take, block-swap, negation-drop',
    prep(n) { const ps = words(n); const b = document.createElement('span'); b.className = 'fx-boxw'; while (n.firstChild) b.appendChild(n.firstChild); n.appendChild(b); n._fxX = b; ps.forEach(p => { p._c = null; }); },
    draw(n, lt) { if (!vis(n, lt)) return; const b = n._fxX, ps = words(n), N = ps.length, s = gap(N, 0.3, 0.05), gw = E.outQuart(cl(lt / 0.3)), gh = E.outQuart(cl((lt - 0.05) / 0.3));
      b.style.backgroundImage = 'linear-gradient(' + C.blue + ',' + C.blue + ')'; b.style.backgroundSize = (gw * 100).toFixed(2) + '% ' + (lerp(0.08, 1, gh) * 100).toFixed(2) + '%';
      ps.forEach((p, i) => { const q = cl((lt - 0.22 - i * s) / 0.3), e = E.outBack(q); p.style.opacity = q >= 1 ? '' : cl(q * 3).toFixed(3); p.style.transform = q >= 1 ? '' : 'translateY(' + ((1 - e) * 0.25).toFixed(3) + 'em)'; }); } });

  FX.add('text', 'recede', { desc: 'The line rises in normally, then after fx.hold seconds (default 1.4) dims to grey so the next line stands out (fx.scale to also shrink)', from: 'less-more, in-proportion, no-buts, not-yet, loop-break, focus-pan-text, coy-denial',
    prep(n) { inner(n).style.transformOrigin = '0 50%'; },
    draw(n, lt, o) { if (!vis(n, lt)) return; const w = inner(n), q = cl(lt / 0.4), e = E.outCubic(q), H = op(o, 'hold', 1.4), S = op(o, 'scale', 1), dm = E.inOutCubic(cl((lt - H) / 0.45)), M = pal('mute');
      w.style.opacity = q >= 1 ? '' : e.toFixed(3); const sc = lerp(1, S, dm);
      w.style.transform = (q < 1 ? 'translateY(' + ((1 - e) * 0.3).toFixed(3) + 'em) ' : '') + (sc !== 1 ? 'scale(' + sc.toFixed(4) + ')' : '');
      if (!w._c) w._c = rgb(getComputedStyle(w).color); w.style.color = dm > 0 ? mix(w._c, M, dm) : '';
      [...w.querySelectorAll('b')].forEach(x => { x.style.color = ''; if (dm > 0) x.style.color = mix(colOf(x), M, dm * 0.85); }); } });

  FX.add('text', 'lights-out', { desc: 'Five start lights come on one by one, go out together, and the line slams in (motorsport start)', from: 'lights-out, drop-timer',
    prep(n) { inner(n); n.style.position = 'relative'; const d = document.createElement('span'); d.className = 'fx-dots lo'; d.innerHTML = '<i></i><i></i><i></i><i></i><i></i>'; n.appendChild(d); n._fxD = d; },
    draw(n, lt) { if (!vis(n, lt)) return; const w = inner(n), d = n._fxD, out = 0.85, q = cl((lt - out - 0.05) / 0.2), e = E.outQuart(q), a = lt - out - 0.25;
      d.style.opacity = lt < out ? cl(lt / 0.1).toFixed(3) : (1 - cl((lt - out) / 0.08)).toFixed(3);
      [...d.children].forEach((b, j) => { b.style.background = lt >= 0.1 + j * 0.13 && lt < out ? C.orange : ''; });
      w.style.opacity = lt < out + 0.05 ? '0' : q >= 1 ? '' : cl(q * 4).toFixed(3);
      const sh = a >= 0 && a < 0.15 ? 1 - a / 0.15 : 0;
      w.style.transform = q < 1 ? 'scale(' + (1.12 - 0.12 * e).toFixed(4) + ') skewX(' + (-8 * (1 - e)).toFixed(2) + 'deg)' : sh ? 'translateX(' + (U.noise(lt * 60, 'lo') * 5 * sh).toFixed(2) + 'px)' : ''; } });

  FX.add('text', 'macro-pan', { desc: 'Starts as a close-up on the first letters, pans across them, then pulls back to the whole line (fx.zoom, default 2.4)', from: 'macro-pan, macro-letter-pan',
    prep(n) { inner(n).style.transformOrigin = '0 50%'; },
    draw(n, lt, o) { if (!vis(n, lt)) return; const w = inner(n), Z = op(o, 'zoom', 2.4), W = w.offsetWidth || 600, pan = E.inOutCubic(cl(lt / 0.55)), pull = E.inOutCubic(cl((lt - 0.5) / 0.5));
      w.style.opacity = cl(lt / 0.12).toFixed(3);
      if (pull >= 1) { clr(w, 'transform'); n.style.clipPath = ''; return; }
      const S = lerp(Z, 1, pull), tx = lerp(-(Z - 1) * W * 0.45 * pan, 0, pull);
      n.style.clipPath = 'inset(-0.1em 0 -0.15em 0)'; w.style.transform = 'translateX(' + tx.toFixed(2) + 'px) scale(' + S.toFixed(4) + ')'; } });

  // ---------- ENFASI SU UNA PAROLA (i <b> della riga, o l'ultima parola) ----------
  const svgEl = (t, cls) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('class', 'fx-mk ' + cls); const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('pathLength', '1'); s.appendChild(p); t.appendChild(s); return s; };
  const markFx = (kind, desc, from) => FX.add('text', 'mark-' + kind, { desc, from,
    prep(n, o) { const ts = targets(n); inner(n);
      ts.forEach(t => { if (kind === 'underline' || kind === 'circle') { t.style.position = 'relative'; t.style.whiteSpace = 'nowrap'; t._s = svgEl(t, kind); }
        if (kind === 'marker' || kind === 'pill') { t.style.webkitBoxDecorationBreak = 'clone'; t.style.boxDecorationBreak = 'clone'; t.style.backgroundRepeat = 'no-repeat'; }
        if (kind === 'pill') { t.style.padding = '0 .14em'; t.style.borderRadius = '.28em'; } }); },
    draw(n, lt, o) { if (!vis(n, lt)) return; baseIn(n, lt); const ts = targets(n), tq = Math.floor(lt * 12) / 12;
      ts.forEach((t, j) => { const t0 = 0.35 + j * 0.15, p = cl((lt - t0) / (kind === 'circle' ? 0.5 : 0.4)), e = E.inOutCubic(p);
        if (kind === 'marker') { t.style.backgroundImage = 'linear-gradient(' + C.mark + ',' + C.mark + ')'; t.style.backgroundPosition = '0 88%'; t.style.backgroundSize = (e * 100).toFixed(2) + '% 62%'; }
        else if (kind === 'pill') { const bc = C[op(o, 'color', 'blue')] || C.blue; t.style.backgroundImage = 'linear-gradient(' + bc + ',' + bc + ')'; t.style.backgroundSize = (e * 100).toFixed(2) + '% 100%';
          const tc = colOf(t); t.style.color = e > 0.4 ? mix(tc, [255, 255, 255], (e - 0.4) / 0.3) : ''; }
        else if (kind === 'color') { const tc = colOf(t); t.style.color = mix(tc, pal(op(o, 'color', 'orange')), e); }
        else { const s = t._s, path = s.firstChild, W = t.offsetWidth, H = t.offsetHeight, fs = fsOf(t), pq = cl((tq - t0) / (kind === 'circle' ? 0.5 : 0.4)), pose = pq >= 1 ? 'end' : Math.floor(tq * 12);
          const jr = k => (U.rnd('mk' + j + kind + pose, k) - 0.5);
          if (kind === 'underline') { const h = fs * 0.32; s.setAttribute('viewBox', '0 0 ' + W + ' ' + h); s.style.left = '0'; s.style.bottom = (-fs * 0.16).toFixed(1) + 'px'; s.setAttribute('width', W); s.setAttribute('height', h);
            path.setAttribute('d', 'M' + (-fs * 0.04 + jr(1) * 4).toFixed(1) + ' ' + (h * 0.62 + jr(2) * 3).toFixed(1) + ' Q' + (W * 0.45).toFixed(1) + ' ' + (h * 0.3 + jr(3) * 5).toFixed(1) + ' ' + (W + fs * 0.06 + jr(4) * 4).toFixed(1) + ' ' + (h * 0.45 + jr(5) * 3).toFixed(1));
            path.style.strokeWidth = (fs * 0.075).toFixed(1); }
          else { const px = fs * 0.24, py = fs * 0.12, cw = W + 2 * px, ch = H + 2 * py; s.setAttribute('viewBox', '0 0 ' + cw + ' ' + ch); s.setAttribute('width', cw); s.setAttribute('height', ch); s.style.left = (-px) + 'px'; s.style.top = (-py) + 'px';
            const pts = []; for (let k = 0; k <= 48; k++) { const a = -2.2 + k / 48 * (2 * Math.PI + 0.55), wob = 1 + 0.03 * Math.sin(k * 0.7 + j) + jr(10 + (k >> 3)) * 0.04, sp = 1 - 0.06 * k / 48;
              pts.push(((cw / 2) + Math.cos(a) * (cw / 2 - 4) * wob * sp).toFixed(1) + ' ' + ((ch / 2) + Math.sin(a) * (ch / 2 - 4) * wob).toFixed(1)); }
            path.setAttribute('d', 'M' + pts.join(' L')); path.style.strokeWidth = (fs * 0.055).toFixed(1); }
          if (op(o, 'color', null)) path.style.stroke = C[op(o, 'color')] || op(o, 'color');
          path.style.strokeDasharray = '1 1'; path.style.strokeDashoffset = (1 - E.outCubic(pq)).toFixed(4); s.style.opacity = pq > 0 ? '1' : '0'; } }); } });
  markFx('marker', 'The line rises in, then a peach marker block draws behind the highlighted words (or the last word)', 'marker-highlight, chunk-stack, inline-highlight, comet-headline, filler-cut');
  markFx('underline', 'The line rises in, then a hand-drawn orange ink stroke underlines the highlighted words in a few stop-motion poses (fx.color)', 'ink-underline, italic-speed, not-yet');
  markFx('circle', 'The line rises in, then a hand-drawn orange loop circles the highlighted words (fx.color)', 'ink-underline, hidden-word');
  markFx('pill', 'The line rises in, then a blue pill fills behind the highlighted words and turns them white (fx.color)', 'glass-capsule, inline-pill-takeover, block-swap, feature-headline');
  markFx('color', 'The line rises in, then the highlighted words shift colour to orange (fx.color)', 'inline-highlight, keep-words, edit-ripple');

  FX.add('text', 'word-roll', { desc: 'The highlighted word (or last word) rolls through the alternatives in fx.roll, stopping briefly on each, before landing on the real word', from: 'inline-word-roll, layover, flick-swap, flank-roll-swap, changed-mind, layout-swap',
    prep(n, o) { const t = targets(n)[0]; inner(n); if (!t) return; const fin = t.innerHTML; t.innerHTML = '<span class="fx-rp">' + fin + '</span><span class="fx-ra"></span><span class="fx-rb"></span>';
      Object.assign(t.style, { display: 'inline-block', position: 'relative', whiteSpace: 'nowrap', verticalAlign: 'baseline' }); n._fxR = { t, list: [...op(o, 'roll', ['']).map(String), t.textContent] }; },
    draw(n, lt) { if (!vis(n, lt)) return; baseIn(n, lt); const R = n._fxR; if (!R) return; const { t, list } = R, [P, A, B] = t.children, m = list.length - 1;
      if (!R.w && t.getClientRects().length) { R.w = list.map((x, i) => { if (i === m) return P.offsetWidth; A.textContent = x; return A.offsetWidth; }); R.h = t.offsetHeight; }
      const dur = Math.min(1.2, Math.max(0.5, 0.28 * m)), u = cl((lt - 0.2) / dur), f = u >= 1 ? m : Math.floor(u * m) + E.inOutCubic((u * m) % 1);
      if (f >= m || !R.w) { clr(t, 'width', 'clipPath'); P.style.visibility = ''; A.style.display = B.style.display = 'none'; return; }
      const i0 = Math.floor(f), fr = f - i0, h = R.h; P.style.visibility = 'hidden'; A.style.display = B.style.display = '';
      A.textContent = list[i0]; B.textContent = list[i0 + 1]; A.style.transform = 'translateY(' + (-fr * h).toFixed(2) + 'px)'; B.style.transform = 'translateY(' + ((1 - fr) * h).toFixed(2) + 'px)';
      t.style.width = lerp(R.w[i0], R.w[i0 + 1], E.inOutCubic(fr)).toFixed(2) + 'px'; t.style.clipPath = 'inset(0 -0.1em)'; } });

  FX.add('text', 'strike-swap', { desc: 'A wrong word (fx.was) is struck through in orange and collapses while the real highlighted word grows in; or fx.cut: [words] are struck and cut out', from: 'diff-swap, magnet-letters, filler-cut, negation-drop, changed-mind, liquid-word',
    prep(n, o) { const cut = op(o, 'cut', null);
      if (cut) { const L = cut.map(x => String(x).toLowerCase()); words(n).forEach(p => { if (!L.includes(p.textContent.toLowerCase().replace(/[^\p{L}\p{N}']/gu, ''))) return;
          const nx = p.nextSibling; if (nx && nx.nodeType === 3) { p.textContent += nx.nodeValue; nx.remove(); }
          p._cut = 1; p.style.position = 'relative'; p.style.color = C.mute; const s = document.createElement('i'); s.className = 'fx-st'; p.appendChild(s); }); inner(n); return; }
      const t = targets(n)[0]; inner(n); if (!t || op(o, 'was', null) == null) return;
      const ws = document.createElement('span'); ws.className = 'fx-was'; ws.textContent = op(o, 'was') + ' '; const s = document.createElement('i'); s.className = 'fx-st'; ws.appendChild(s); t.parentNode.insertBefore(ws, t);
      Object.assign(t.style, { display: 'inline-block', whiteSpace: 'nowrap' }); n._fxSW = { t, ws }; },
    draw(n, lt, o) { if (!vis(n, lt)) return; baseIn(n, lt); const st = E.inOutCubic(cl((lt - 0.35) / 0.25)), c = E.inOutCubic(cl((lt - 0.65) / 0.35));
      const col = (el, w) => { if (c >= 1) { el.style.display = 'none'; return; } el.style.display = ''; el.style.marginRight = (-w * c).toFixed(2) + 'px'; el.style.clipPath = 'inset(-0.3em ' + (c * 100).toFixed(1) + '% -0.3em 0)'; el.style.opacity = (1 - c).toFixed(3); el.querySelector('.fx-st').style.width = 'calc(' + (st * 100).toFixed(1) + '% - .2em)'; };
      if (op(o, 'cut', null)) { words(n).forEach(p => { if (!p._cut) return; if (p._w == null && p.getClientRects().length) p._w = p.offsetWidth; col(p, p._w || 0); }); return; }
      const S = n._fxSW; if (!S) return; const { t, ws } = S; if (S.w == null && ws.getClientRects().length) { S.w = ws.offsetWidth; S.tw = t.offsetWidth; }
      col(ws, S.w || 0); const g = c;
      if (g >= 1) { clr(t, 'marginRight', 'clipPath', 'opacity', 'transform'); return; }
      t.style.marginRight = (-(S.tw || 0) * (1 - g)).toFixed(2) + 'px'; t.style.clipPath = 'inset(-0.3em ' + ((1 - g) * 100).toFixed(1) + '% -0.3em 0)'; t.style.opacity = g.toFixed(3); } });

  // ---------- ELEMENTI NUOVI ----------
  // index-list: elenco numerato che si disegna riga per riga, poi una banda scende fino alla riga evidenziata (classifiche, top 5)
  FX.add('els', 'index-list', { desc: 'Numbered list drawn row by row (items: [{text}]), then a peach band travels down to the highlighted row (highlight, default last; start = first number)', from: 'index-list, moves-up, changelog-scroll, crew-of-one',
    build(e) { const n = document.createElement('div'); n.className = 'el fx-idx'; const bd = document.createElement('div'); bd.className = 'bd'; n.appendChild(bd);
      const f = s => (typeof md === 'function' ? md(s) : String(s)); const st = e.start != null ? e.start : 1;
      const rows = e.items.map((it, k) => { const r = document.createElement('div'); r.className = 'ir'; r.innerHTML = '<span class="nm">' + String(st + k).padStart(2, '0') + '</span><span class="tx">' + f(it.text) + '</span><i class="ru"></i>'; n.appendChild(r); return r; });
      const H = e.highlight != null ? e.highlight : rows.length - 1;
      return { n, upd(lt, t, t0) { let last = t0;
        rows.forEach((r, k) => { const s = T(e.items[k].at, t0 + k * 0.5); last = Math.max(last, s); const q = cl((t - s) / 0.45), ee = E.outCubic(q);
          r.style.opacity = cl(q * 2.5).toFixed(3); const tx = r.children[1]; tx.style.transform = q >= 1 ? '' : 'translateY(' + ((1 - ee) * 28).toFixed(1) + 'px)'; tx.style.clipPath = q >= 1 ? '' : 'inset(-10px -10px ' + ((1 - ee) * 28).toFixed(1) + 'px -10px)';
          r.children[2].style.transform = 'scaleX(' + E.inOutCubic(cl((t - s - 0.1) / 0.5)).toFixed(4) + ')'; });
        const bs = last + 0.7, b = E.inOutCubic(cl((t - bs) / 0.7)), r0 = rows[0], rh = rows[Math.min(H, rows.length - 1)];
        bd.style.opacity = cl((t - bs) / 0.15).toFixed(3); bd.style.top = lerp(r0.offsetTop, rh.offsetTop, b).toFixed(1) + 'px'; bd.style.height = lerp(r0.offsetHeight, rh.offsetHeight, b).toFixed(1) + 'px';
        rows.forEach((r, k) => r.classList.toggle('hi', k === H && b > 0.85)); } }; } });

  // marquee: striscia di testo che scorre senza fine (fascia di separazione, slogan, nome della competizione)
  FX.add('els', 'marquee', { desc: 'Endless horizontal strip of condensed caps (text; color: ink, orange, blue, paper; speed px/s; text2 adds a second strip running the other way)', from: 'infinite-marquee, feature-chips-flow',
    build(e) { const n = document.createElement('div'); n.className = 'el fx-mq'; const esc2 = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
      const cls = { orange: 'o', blue: 'b', paper: 'p' }; const mk = (txt, c) => { const r = document.createElement('div'); r.className = 'rw ' + (cls[c] || ''); r.innerHTML = '<div class="tk">' + Array(12).fill('<span class="u">' + esc2(txt) + '<i></i></span>').join('') + '</div>'; n.appendChild(r); return r.firstChild; };
      const rs = [mk(e.text, e.color || 'ink')]; if (e.text2) rs.push(mk(e.text2, e.color2 || 'paper'));
      return { n, upd(lt) { rs.forEach((r, k) => { const u = r.firstChild.offsetWidth || 400, x = (lt * (e.speed || 140)) % u; r.style.transform = 'translateX(' + (k % 2 ? x - u : -x).toFixed(2) + 'px)'; }); } }; } });
})();
