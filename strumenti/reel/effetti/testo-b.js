// GG Motion — effetti di testo, seconda parte (Remocn typography, da "on-approach" a "zoom-words").
// Idee e tempi ripresi da Remocn (MIT, vedi LICENSE-remocn.txt), riscritti in JavaScript semplice.
// Tutte le funzioni di disegno sono pure nel tempo: lo stato ammesso e' solo quello di preparazione
// (testo spezzato, nodi clonati una volta, misure di layout lette una volta).
(() => {
  const U = FX.u, C = FX.C, cl = U.clamp, E = U.E, L = U.lerp;
  const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const mdx = s => esc(s).replace(/\*(.+?)\*/g, '<b>$1</b>');
  const h = html => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; };
  const opt = (o, k, d) => (o && o[k] != null ? o[k] : d);
  const hex = c => { c = c.replace('#', ''); return [0, 2, 4].map(i => parseInt(c.substr(i, 2), 16)); };
  const mix = (a, b, p) => { const A = hex(a), B = hex(b); p = cl(p); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * p)).join(',') + ')'; };
  const col = k => C[k] || k || C.blue;
  // un nodo inline (riga della copertina) diventa inline-block, cosi' accetta transform e clip
  const inl = n => { if (n.tagName === 'SPAN') n.style.display = 'inline-block'; };
  const rel = n => { inl(n); if (!n.style.position) n.style.position = 'relative'; };
  // lettere: come FX.u.split, ma ogni parola resta intera a fine riga (gruppo nowrap)
  const chars = n => {
    if (n._fxSplit && n._fxSplit.mode === 'chars') return n._fxSplit.parts;
    const ps = U.split(n, 'chars'); let w = null;
    ps.forEach(p => { if (w && p.previousSibling === w) w.appendChild(p); else { const pv = p.previousSibling; w = document.createElement('span'); w.className = 'fxb-w'; p.parentNode.insertBefore(w, p);
      if (pv && pv.nodeType === 1 && pv.tagName === 'B') { const g = document.createElement('span'); g.className = 'fxb-w'; pv.parentNode.insertBefore(g, pv); g.appendChild(pv); g.appendChild(w); } w.appendChild(p); } });
    return ps;
  };
  // parole: la punteggiatura attaccata a una parola evidenziata ("*one summer*.") non va a capo da sola
  const words = n => { const fresh = !(n._fxSplit && n._fxSplit.mode === 'words'); const ps = U.split(n, 'words');
    if (fresh) ps.forEach(p => { const pv = p.previousSibling; if (pv && pv.nodeType === 1 && pv.tagName === 'B') { const g = document.createElement('span'); g.className = 'fxb-w'; pv.parentNode.insertBefore(g, pv); g.appendChild(pv); g.appendChild(p); } });
    return ps; };
  const parts = (n, by) => (by === 'words' ? words(n) : chars(n));
  // ritardo fra le parti: default, ma la comparsa intera non supera "max" secondi
  const stg = (n, def, max, o) => (o && o.stagger != null ? o.stagger : Math.min(def, n > 1 ? max / (n - 1) : def));
  const clr = p => { p.style.transform = ''; p.style.opacity = ''; p.style.filter = ''; };
  const inB = p => !!(p.closest && p.closest('b'));
  const baseCol = p => { if (!p._fxCol) { const c = getComputedStyle(p.parentNode).color.match(/\d+/g) || [11, 31, 58]; p._fxCol = '#' + c.slice(0, 3).map(v => (+v).toString(16).padStart(2, '0')).join(''); } return p._fxCol; };
  // contenuto originale avvolto in uno span (per nasconderlo mentre animano i cloni)
  const wrapOrig = (n, cls, disp) => { if (n._fxO) return n._fxO; n._fxH = n._fxH || n.innerHTML; const s = document.createElement('span'); s.className = cls; if (disp) s.style.display = disp;
    while (n.firstChild) s.appendChild(n.firstChild); n.appendChild(s); n._fxO = s; return s; };
  const clone = (n, cls, css) => { const c = document.createElement('div'); c.className = cls; c.setAttribute('aria-hidden', 'true'); c.innerHTML = n._fxH;
    c.style.cssText = 'position:absolute;left:0;top:0;width:100%;pointer-events:none;' + (css || ''); n.appendChild(c); return c; };

  FX.css(`
.fxb-w{white-space:nowrap}
.cv-t .l.hi span .fxp,.cv-t .l.hi span .fxb-w,.cv-t .l.hi span [class^="fx-tb-"],.cv-t .l.hi span .fx-period-drop-dot{background:none;padding:0;margin:0}
.fx-tb-tx,.fx-tb-tx *{color:transparent!important}
.fx-rgb-split-c{mix-blend-mode:multiply}
.fx-rgb-split-c,.fx-rgb-split-c *{color:var(--fxc)!important}
.fx-outline-trace-ol{-webkit-text-stroke:.022em ${C.ink}}
.fx-outline-trace-ol b{-webkit-text-stroke-color:${C.blue}}
.fx-repeater-c{-webkit-text-stroke:.018em ${C.blue}}
.fx-tb-in{display:inline-block;position:relative;vertical-align:top}
.fx-tb-box{position:absolute;inset:0;overflow:hidden;pointer-events:none}
`);

  // fabbrica per gli effetti "a parti" (lettere o parole), ognuna col suo tempo locale l
  const per = (name, def) => FX.add('text', name, {
    desc: def.desc, from: def.from,
    prep(n, o) { if (def.node) inl(n); parts(n, def.by === 'opt' ? opt(o, 'by', 'chars') : def.by); if (def.prep) def.prep(n, o); },
    draw(n, lt, o) {
      const by = def.by === 'opt' ? opt(o, 'by', 'chars') : def.by; const ps = parts(n, by);
      if (lt < 0) { n.style.opacity = 0; return; }
      n.style.opacity = 1; const st = stg(ps.length, by === 'words' ? def.sw || 0.08 : def.sc || 0.03, def.max || 0.5, o);
      ps.forEach((p, i) => def.fn(p, lt - i * st, i, ps, o, n));
      if (def.after) def.after(n, lt, ps, st, o);
    },
  });

  // ---------- comparse a lettere ----------
  per('char-rise', { by: 'chars', desc: 'Letters slide up from below one by one, crisp and without blur', from: 'per-character-rise',
    fn(p, l) { if (l < 0) { p.style.opacity = 0; return; } if (l >= 0.4) return clr(p); const k = E.outCubic(l / 0.4); p.style.opacity = cl(l / 0.15); p.style.transform = 'translateY(' + (1 - k) * 0.55 + 'em)'; } });

  per('soft-blur', { by: 'chars', desc: 'Letters fade in one by one with a gentle blur and a small upward drift', from: 'soft-blur-in,shader-text-reveal',
    fn(p, l) { if (l < 0) { p.style.opacity = 0; return; } if (l >= 0.5) return clr(p); const k = E.outCubic(l / 0.5); p.style.opacity = cl(l / 0.3); p.style.transform = 'translateY(' + (1 - k) * 0.2 + 'em)'; p.style.filter = 'blur(' + ((1 - k) * 10).toFixed(2) + 'px)'; } });

  per('letter-drop', { by: 'chars', sc: 0.04, max: 0.6, desc: 'Letters fall from above in a staircase; opts.tumble=true makes them tumble and bounce like stacked blocks', from: 'top-down-letters,stack-letters',
    fn(p, l, i, ps, o) { const D = o && o.tumble ? 0.7 : 0.45; if (l < 0) { p.style.opacity = 0; return; } if (l >= D) return clr(p); p.style.opacity = cl(l / 0.12);
      if (o && o.tumble) { const k = E.outBounce(l / D), r = (U.rnd('ld', i) - 0.5) * 70 * (1 - E.outCubic(l / 0.5)); p.style.transform = 'translateY(' + (-(1 - k) * 1.6) + 'em) rotate(' + r + 'deg)'; }
      else p.style.transform = 'translateY(' + (-(1 - E.outCubic(l / D)) * 0.8) + 'em)'; } });

  per('squeeze-in', { by: 'chars', sc: 0.035, max: 0.6, node: 1, desc: 'Characters appear one by one, then the whole line squeezes as the last one lands', from: 'squeeze-in',
    fn(p, l) { if (l < 0) { p.style.opacity = 0; return; } if (l >= 0.12) return clr(p); p.style.opacity = cl(l / 0.06); p.style.transform = 'scale(' + (0.7 + 0.3 * E.outCubic(l / 0.12)) + ')'; },
    after(n, lt, ps, st) { const q = lt - (ps.length - 1) * st - 0.05; n.style.transformOrigin = 'left center';
      n.style.transform = q > 0 && q < 0.4 ? 'scaleX(' + (1 - 0.09 * Math.sin(Math.PI * q / 0.4)) + ') scaleY(' + (1 + 0.04 * Math.sin(Math.PI * q / 0.4)) + ')' : ''; } });

  per('tracking-in', { by: 'chars', sc: 0, desc: 'Wide letter-spacing collapses to normal with a springy settle while a light blur clears', from: 'tracking-in,pull-in',
    fn(p, l, i, ps) { if (l >= 0.95) return clr(p); const c = (ps.length - 1) / 2, s = 1 - U.spring(l, { damping: 18, stiffness: 90 });
      p.style.opacity = cl(l / 0.4); p.style.transform = 'translateX(' + ((i - c) / Math.max(c, 1)) * 1.2 * s + 'em)'; p.style.filter = 'blur(' + (s * 6).toFixed(2) + 'px)'; } });

  per('stretch-in', { by: 'chars', sc: 0.025, max: 0.4, desc: 'Letters fly in from the right and smear horizontally on the way, then snap to shape', from: 'stretch-in',
    fn(p, l) { if (l < 0) { p.style.opacity = 0; return; } if (l >= 0.55) return clr(p); const k = E.outExpo(l / 0.55); p.style.opacity = cl(l / 0.08);
      p.style.transformOrigin = 'left center'; p.style.transform = 'translateX(' + (1 - k) * 120 + 'px) scaleX(' + (1 + (1 - k) * 2.2) + ')'; } });

  per('crest', { by: 'chars', sc: 0.03, max: 0.6, desc: 'A wave travels across the line raising each letter as it appears, then the highlighted word swells once', from: 'weight-wave',
    fn(p, l) { if (l < 0) { p.style.opacity = 0; return; } if (l >= 0.4) return clr(p); p.style.opacity = cl(l / 0.1); p.style.transform = 'translateY(' + (-0.28 * Math.sin(Math.PI * l / 0.4)) + 'em)'; },
    after(n, lt, ps, st) { const q = lt - (ps.length - 1) * st - 0.4; if (q <= 0 || q >= 0.45) return; const s = 1 + 0.14 * Math.sin(Math.PI * q / 0.45);
      ps.forEach(p => { if (inB(p)) p.style.transform = 'scale(' + s + ')'; }); } });

  per('color-sweep', { by: 'opt', sc: 0.035, sw: 0.1, max: 0.6, desc: 'Muted text brightens as an orange front sweeps across it; opts.by="words" for word by word, opts.flash=false for no orange', from: 'shimmer-sweep,spotlight-text,sheen-slide-in,scrub-reveal',
    fn(p, l, i, ps, o) { if (l < 0) { p.style.opacity = 0.2; p.style.color = ''; return; } p.style.opacity = ''; p.style.color = l < 0.2 && opt(o, 'flash', true) ? C.orange : ''; },
    after(n, lt) { n.style.opacity = cl(lt / 0.15); } });

  // ---------- comparse a parole ----------
  per('word-rise', { by: 'words', desc: 'Words slide up and fade in one after another like a wave', from: 'staggered-fade-up',
    fn(p, l) { if (l < 0) { p.style.opacity = 0; return; } if (l >= 0.5) return clr(p); p.style.opacity = cl(l / 0.25); p.style.transform = 'translateY(' + (1 - E.outCubic(l / 0.5)) * 0.6 + 'em)'; } });

  per('word-pop', { by: 'words', desc: 'Words pop in one by one with a soft spring overshoot', from: 'spring-scale-in,tagline-justify',
    fn(p, l) { if (l < 0) { p.style.opacity = 0; return; } if (l >= 0.8) return clr(p); p.style.opacity = cl(l / 0.15); p.style.transform = 'scale(' + (0.7 + 0.3 * U.spring(l, { damping: 12, stiffness: 180 })) + ')'; } });

  per('word-drop', { by: 'words', sw: 0.09, desc: 'Words drop in from above and land with a small overshoot', from: 'short-slide-down',
    fn(p, l) { if (l < 0) { p.style.opacity = 0; return; } if (l >= 0.5) return clr(p); p.style.opacity = cl(l / 0.2); p.style.transform = 'translateY(' + (-(1 - E.outBack(l / 0.5)) * 0.7) + 'em)'; } });

  per('word-push', { by: 'words', max: 0.45, node: 1, desc: 'The line glides in from the side while its words fade in one by one; opts.dir="left" to come from the left', from: 'word-push,short-slide-right,word-stream,zoom-words',
    fn(p, l, i, ps, o) { const d = opt(o, 'dir', 'right') === 'left' ? -1 : 1; if (l < 0) { p.style.opacity = 0; return; } if (l >= 0.45) return clr(p); p.style.opacity = cl(l / 0.25); p.style.transform = 'translateX(' + d * (1 - E.outCubic(l / 0.45)) * 0.6 + 'em)'; },
    after(n, lt, ps, st, o) { const d = opt(o, 'dir', 'right') === 'left' ? -1 : 1, k = E.outCubic(lt / 0.9); n.style.transform = k >= 1 ? '' : 'translateX(' + d * (1 - k) * 90 + 'px)'; } });

  per('punch-in', { by: 'words', sw: 0.14, max: 0.7, node: 1, desc: 'Words slam in one by one from big to final size with a short shake; opts.flash=true adds an orange flash behind each hit', from: 'round-slam,two-hit,strobe-words',
    fn(p, l, i, ps, o) { p.style.background = ''; p.style.color = '';
      if (l < 0) { p.style.opacity = 0; return; } if (l >= 0.32) return clr(p); p.style.opacity = cl(l / 0.04);
      const s = l < 0.12 ? 1.9 - 0.9 * Math.pow(l / 0.12, 2) : 1 - 0.05 * Math.sin(Math.PI * (l - 0.12) / 0.2); p.style.transform = 'scale(' + s + ')';
      if (o && o.flash && l >= 0.12 && l < 0.2) { p.style.background = C.orange; p.style.color = C.paper; } },
    after(n, lt, ps, st) { let sh = 0; ps.forEach((p, i) => { const q = lt - i * st - 0.12; if (q >= 0 && q < 0.25) sh += Math.exp(-q / 0.05); });
      n.style.transform = sh > 0.01 ? 'translate(' + U.noise(lt * 60, 'sx') * 7 * sh + 'px,' + U.noise(lt * 60, 'sy') * 5 * sh + 'px)' : ''; } });

  per('turn-up', { by: 'words', sw: 0.1, desc: 'Words arrive turned on their side like book spines, then swing upright into one line', from: 'tategaki-turn,spine-turn',
    fn(p, l) { if (l < 0) { p.style.opacity = 0; return; } if (l >= 0.9) return clr(p); const k = U.spring(l, { damping: 13, stiffness: 140 });
      p.style.opacity = cl(l / 0.12); p.style.transformOrigin = '0.3em 60%'; p.style.transform = 'rotate(' + 90 * (1 - k) + 'deg)'; } });

  per('capsule', { by: 'words', sw: 0.09, desc: 'Each word rides in on a stretchy capsule (ink, blue for highlighted words) that then melts away', from: 'oval-type',
    prep(n) { words(n).forEach(p => { if (p._fxCap) return; p.style.position = 'relative'; p.style.isolation = 'isolate'; const b = document.createElement('span'); b.className = 'fx-capsule-bg';
      b.style.cssText = 'position:absolute;left:-.14em;right:-.14em;top:.06em;bottom:.02em;border-radius:999px;z-index:-1;transform-origin:left center;background:' + (inB(p) ? C.blue : C.ink); p.appendChild(b); p._fxCap = b; }); },
    fn(p, l) { const b = p._fxCap; if (l < 0) { p.style.opacity = 0; return; } if (l >= 0.75) { clr(p); p.style.color = ''; b.style.opacity = 0; return; }
      const k = U.spring(l, { damping: 14, stiffness: 200 }), f = cl((l - 0.45) / 0.25); p.style.opacity = cl(l / 0.1);
      b.style.transform = 'scaleX(' + k + ')'; b.style.opacity = 1 - f; p.style.color = mix(C.paper, baseCol(p), f); } });

  per('key-slow', { by: 'words', sw: 0.06, desc: 'Plain words land fast, then time slows on the highlighted word (*x*), which grows in and cools from orange to blue', from: 'speed-ramp-word',
    fn(p, l, i, ps) { const key = ps.some(inB) ? inB(p) : i === ps.length - 1;
      if (!key) { if (l < 0) { p.style.opacity = 0; return; } if (l >= 0.3) return clr(p); p.style.opacity = cl(l / 0.2); p.style.transform = 'translateY(' + (1 - E.outCubic(l / 0.3)) * 0.4 + 'em)'; return; }
      const q = l - 0.15; if (q < 0) { p.style.opacity = 0; return; } if (q >= 0.9) { clr(p); p.style.color = ''; return; }
      const k = E.outCubic(q / 0.9); p.style.opacity = cl(q / 0.35); p.style.transform = 'scale(' + (1.35 - 0.35 * k) + ')'; p.style.color = mix(C.orange, baseCol(p), k); } });

  // ---------- la riga intera ----------
  const lineIn = (n) => { if (!n._fxIn) { const w = wrapOrig(n, 'fx-tb-in'); n._fxIn = w; } return n._fxIn; };

  FX.add('text', 'line-rise', { desc: 'The whole line rises out of an invisible mask under its baseline', from: 'serif-rise,parallax-lockup,out-of-context,word-stack',
    prep(n) { inl(n); lineIn(n); },
    draw(n, lt) { const w = lineIn(n); if (lt < 0) { n.style.opacity = 0; return; } n.style.opacity = 1; if (lt >= 0.65) { n.style.clipPath = ''; w.style.transform = ''; return; }
      n.style.clipPath = 'inset(-0.3em -1em -0.12em -1em)'; w.style.transform = 'translateY(' + (1 - E.outQuart(lt / 0.65)) * 125 + '%)'; } });

  FX.add('text', 'crop-in', { desc: 'The line opens from a tight crop and settles down from a slight zoom, like a poster being framed', from: 'poster-crop',
    prep(n) { lineIn(n); },
    draw(n, lt) { const w = lineIn(n); if (lt < 0) { n.style.opacity = 0; return; } n.style.opacity = 1; if (lt >= 0.7) { w.style.clipPath = ''; w.style.transform = ''; return; }
      const k = E.outQuart(lt / 0.7); w.style.clipPath = 'inset(' + (1 - k) * 42 + '% ' + (1 - k) * 55 + '% ' + (1 - k) * 42 + '% 0)'; w.style.transformOrigin = 'left center'; w.style.transform = 'scale(' + (1.15 - 0.15 * k) + ')'; } });

  FX.add('text', 'squeeze-out', { desc: 'The line starts condensed and springs out to its full width; opts.axis="y" squashes the height instead', from: 'squeeze-out,wrapped-squash,perspective-squeeze',
    prep(n) { lineIn(n); },
    draw(n, lt, o) { const w = lineIn(n); if (lt < 0) { n.style.opacity = 0; return; } n.style.opacity = cl(lt / 0.15); if (lt >= 0.9) { w.style.transform = ''; return; }
      const s = 0.45 + 0.55 * U.spring(lt, { damping: 14, stiffness: 170 });
      if (opt(o, 'axis', 'x') === 'y') { w.style.transformOrigin = 'left bottom'; w.style.transform = 'scaleY(' + s + ')'; } else { w.style.transformOrigin = 'left center'; w.style.transform = 'scaleX(' + s + ')'; } } });

  FX.add('text', 'settle', { desc: 'A restrained premium entrance: the line fades in while settling down from a slight zoom; opts.zoom sets the start scale (default 1.06)', from: 'scale-down-fade,shared-axis-z',
    prep(n) { inl(n); },
    draw(n, lt, o) { if (lt < 0) { n.style.opacity = 0; return; } n.style.opacity = cl(lt / 0.35); if (lt >= 0.7) { n.style.transform = ''; return; }
      n.style.transformOrigin = 'left center'; n.style.transform = 'scale(' + L(opt(o, 'zoom', 1.06), 1, E.outCubic(lt / 0.7)) + ')'; } });

  FX.add('text', 'pullback', { desc: 'The camera starts tight on the highlighted word (or the first word) and pulls back to reveal the whole line; opts.zoom (default 1.6)', from: 'word-pullback,zoom-words',
    prep(n) { rel(n); },
    draw(n, lt, o) { if (lt < 0) { n.style.opacity = 0; return; } n.style.opacity = cl(lt / 0.2); if (lt >= 0.9) { n.style.transform = ''; return; }
      if (!n._fxOr) { const b = n.querySelector('b'); if (b) { const r = b.getClientRects()[0], R = n.getBoundingClientRect(), s = R.width / (n.offsetWidth || 1); n._fxOr = r ? ((r.left - R.left) / s + r.width / s / 2) + 'px ' + ((r.top - R.top) / s + r.height / s / 2) + 'px' : 'left center'; } else n._fxOr = '1.5em 50%'; }
      n.style.transformOrigin = n._fxOr; n.style.transform = 'scale(' + L(opt(o, 'zoom', 1.6), 1, E.inOutCubic(lt / 0.9)) + ')'; } });

  FX.add('text', 'typewriter', { desc: 'Typed character by character with an orange caret that blinks and then disappears; opts.by="words" types word by word', from: 'typewriter,photo-caret,unmask-line,typed-split-wipe',
    prep(n, o) { rel(n); parts(n, opt(o, 'by', 'chars')); if (!n._fxCar) { const c = document.createElement('span'); c.className = 'fx-typewriter-car'; c.style.cssText = 'position:absolute;width:.07em;height:.9em;background:' + C.orange + ';display:none'; n.appendChild(c); n._fxCar = c; } },
    draw(n, lt, o) { const by = opt(o, 'by', 'chars'), ps = parts(n, by), c = n._fxCar; if (lt < 0) { n.style.opacity = 0; return; } n.style.opacity = 1;
      const st = opt(o, 'stagger', by === 'words' ? Math.min(0.12, 0.9 / ps.length) : Math.min(0.04, 0.9 / ps.length)), k = Math.min(ps.length, Math.floor(lt / st) + 1), end = ps.length * st;
      ps.forEach((p, i) => { p.style.visibility = i < k ? '' : 'hidden'; });
      const on = lt < end || (lt < end + 0.75 && Math.floor((lt - end) / 0.25) % 2 === 1);
      if (!on) { c.style.display = 'none'; return; } const q = ps[k - 1]; let x = q.offsetLeft + q.offsetWidth, y = q.offsetTop; let a = q.offsetParent; while (a && a !== n) { x += a.offsetLeft; y += a.offsetTop; a = a.offsetParent; }
      c.style.display = 'block'; c.style.left = (x + 4) + 'px'; c.style.top = (y + q.offsetHeight * 0.1) + 'px'; } });

  FX.add('text', 'rgb-split', { desc: 'A brief chromatic split: blue and orange copies jitter around the line for a few frames, then lock onto it', from: 'rgb-glitch-text,rush-type',
    prep(n) { rel(n); n._fxH = n._fxH || n.innerHTML; if (!n._fxRgb) n._fxRgb = [C.blue, C.orange].map(c => { const d = clone(n, 'fx-rgb-split-c'); d.style.setProperty('--fxc', c); return d; }); },
    draw(n, lt) { const cs = n._fxRgb; if (lt < 0) { n.style.opacity = 0; return; } n.style.opacity = cl(lt / 0.08);
      cs.forEach((c, j) => { if (lt >= 0.45) { c.style.display = 'none'; return; } const a = 1 - lt / 0.45, sg = j ? 1 : -1; c.style.display = 'block'; c.style.opacity = 0.85 * a;
        c.style.transform = 'translate(' + (sg * 5 + U.noise(lt * 30, 'rx' + j) * 12) * a + 'px,' + U.noise(lt * 30, 'ry' + j) * 6 * a + 'px)'; }); } });

  // tendina: barra piena (block), barra inclinata (slash), linea di scansione (line), porte (doors), foglio strappato (torn), strisce (stripes)
  FX.add('text', 'wipe', { desc: 'A bar wipes the line into view; opts.wipe = block (default) | slash | line | doors | torn | stripes, opts.wipeColor = ink | orange | blue', from: 'shadow-sweep-text,slash-wipe,wake-wipe,scan-reveal,slide-doors,torn-edge,stripe-mask',
    prep(n, o) { const w = lineIn(n); if (w._fxBox) return; const c0 = document.createElement('span'); c0.style.display = 'inline-block'; while (w.firstChild) c0.appendChild(w.firstChild); w.appendChild(c0); w._fxC = c0;
      const b = document.createElement('div'); b.className = 'fx-tb-box'; w.appendChild(b); w._fxBox = b; const m = opt(o, 'wipe', 'block'), c = col(opt(o, 'wipeColor', m === 'line' ? 'orange' : 'ink'));
      if (m === 'doors') b.innerHTML = '<i style="position:absolute;left:0;top:0;bottom:0;width:50.5%;background:' + c + '"></i><i style="position:absolute;right:0;top:0;bottom:0;width:50.5%;background:' + c + '"></i>';
      else if (m === 'torn') { let pts = []; for (let i = 0; i <= 16; i++) pts.push(((i % 2) * 5 + U.rnd('torn', i) * 4).toFixed(1) + '% ' + (i * 100 / 16).toFixed(1) + '%'); b.innerHTML = '<i style="position:absolute;inset:0;background:' + c + ';clip-path:polygon(100% 0,' + pts.join(',') + ',100% 100%)"></i>'; }
      else if (m !== 'stripes') b.innerHTML = '<i style="position:absolute;top:0;bottom:0;background:' + c + '"></i>'; },
    draw(n, lt, o) { const b = lineIn(n)._fxBox, w = lineIn(n)._fxC, m = opt(o, 'wipe', 'block'), i = b.firstChild; if (lt < 0) { n.style.opacity = 0; return; } n.style.opacity = 1;
      const D = m === 'block' ? 0.6 : 0.7; if (lt >= D) { b.style.display = 'none'; w.style.clipPath = ''; w.style.webkitMaskImage = ''; return; } b.style.display = 'block';
      if (m === 'block') { const a = lt < 0.3; const k = E.inOutCubic(a ? lt / 0.28 : (lt - 0.3) / 0.28); w.style.clipPath = a ? 'inset(0 100% 0 0)' : '';
        i.style.left = 0; i.style.right = 0; i.style.transformOrigin = a ? 'left' : 'right'; i.style.transform = 'scaleX(' + (a ? k : 1 - k) + ')'; }
      else if (m === 'slash' || m === 'line') { const bw = m === 'line' ? 0.012 : 0.16, x = L(-bw, 1 + bw, E.inOutCubic(lt / D)); w.style.clipPath = 'inset(-0.2em ' + (100 - cl(x) * 100) + '% -0.2em -0.2em)';
        i.style.left = (x - bw / 2) * 100 + '%'; i.style.width = Math.max(bw * 100, 0.6) + '%'; i.style.transform = m === 'slash' ? 'skewX(-18deg)' : ''; }
      else if (m === 'doors') { const k = E.inOutCubic(lt / D); b.children[0].style.transform = 'translateX(' + (-k * 101) + '%)'; b.children[1].style.transform = 'translateX(' + (k * 101) + '%)'; }
      else if (m === 'torn') { const k = E.inOutCubic(lt / D); i.style.transform = 'translateX(' + k * 112 + '%)'; }
      else { const k = E.inOutCubic(lt / D) * 36; w.style.webkitMaskImage = 'repeating-linear-gradient(115deg,#000 0 ' + k.toFixed(1) + 'px,transparent ' + k.toFixed(1) + 'px 36px)'; } } });

  // strisce: la riga tagliata a bande che arrivano da lati alterni (orizzontali) o fette verticali (slit-scan)
  FX.add('text', 'bands', { desc: 'The line is cut into bands that slide together from alternating sides and lock; opts.bands (default 6), opts.dir="v" for vertical slices', from: 'stripe-type,slit-scan',
    prep(n, o) { rel(n); wrapOrig(n, 'fx-tb-o'); if (n._fxBd) return; const N = opt(o, 'bands', 6), v = opt(o, 'dir', 'h') === 'v'; n._fxBd = [];
      for (let i = 0; i < N; i++) { const a = (i * 100 / N).toFixed(2), z = (100 - (i + 1) * 100 / N).toFixed(2); n._fxBd.push(clone(n, 'fx-bands-c', 'clip-path:' + (v ? 'inset(-0.2em ' + z + '% -0.2em ' + a + '%)' : 'inset(' + a + '% -0.2em ' + z + '% -0.2em)'))); } },
    draw(n, lt, o) { const bd = n._fxBd, N = bd.length, v = opt(o, 'dir', 'h') === 'v', D = 0.55 + (N - 1) * 0.04; if (lt < 0) { n.style.opacity = 0; return; } n.style.opacity = 1;
      if (lt >= D) { n._fxO.style.visibility = ''; bd.forEach(c => { c.style.display = 'none'; }); return; } n._fxO.style.visibility = 'hidden';
      bd.forEach((c, i) => { const k = E.outCubic(cl((lt - i * 0.04) / 0.55)), d = (i % 2 ? 1 : -1) * (1 - k); c.style.display = 'block'; c.style.opacity = cl((lt - i * 0.04) / 0.12);
        c.style.transform = v ? 'translateY(' + d * 0.9 + 'em)' : 'translateX(' + d * 1.2 + 'em)'; }); } });

  FX.add('text', 'repeater', { desc: 'Outlined blue copies unfold above the line like a repeater, breathe, then fold back into it', from: 'type-repeater,rep-stack,type-fossil',
    prep(n) { rel(n); n._fxH = n._fxH || n.innerHTML; if (!n._fxEc) n._fxEc = [1, 2, 3].map(() => clone(n, 'fx-repeater-c fx-tb-tx', 'display:none')); },
    draw(n, lt) { if (lt < 0) { n.style.opacity = 0; return; } n.style.opacity = cl(lt / 0.2); const s = Math.sin(Math.PI * cl(lt / 1.0));
      n._fxEc.forEach((c, j) => { if (lt >= 1.0) { c.style.display = 'none'; return; } c.style.display = 'block'; c.style.opacity = (0.75 - j * 0.2) * cl(s * 3); c.style.transform = 'translateY(' + (-(j + 1) * 0.3 * s) + 'em)'; }); } });

  FX.add('text', 'outline-trace', { desc: 'The line is first traced as an outline from left to right, then the solid fill wipes up inside it and the outline fades', from: 'outline-trace,outline-fill-track-text,photo-fill-type',
    prep(n) { rel(n); wrapOrig(n, 'fx-tb-o'); if (!n._fxOf) n._fxOf = [clone(n, 'fx-outline-trace-ol fx-tb-tx'), clone(n, 'fx-outline-trace-fill')]; },
    draw(n, lt) { const [a, b] = n._fxOf; if (lt < 0) { n.style.opacity = 0; return; } n.style.opacity = 1;
      if (lt >= 0.95) { n._fxO.style.visibility = ''; a.style.display = b.style.display = 'none'; return; } n._fxO.style.visibility = 'hidden'; a.style.display = b.style.display = 'block';
      const p1 = E.inOutCubic(lt / 0.45), p2 = E.inOutCubic((lt - 0.3) / 0.5); a.style.clipPath = 'inset(-0.2em ' + (1 - p1) * 100 + '% -0.2em -0.2em)'; a.style.opacity = 1 - cl((lt - 0.7) / 0.25);
      b.style.clipPath = 'inset(' + (1 - p2) * 100 + '% -0.2em -0.2em -0.2em)'; } });

  // punto finale che cade, rimbalza e diventa il punto della frase (resta arancione)
  FX.add('text', 'period-drop', { desc: 'Words rise, then an orange dot falls from above, bounces with squash and stretch and settles as the full stop (opts.dot=true adds one if missing)', from: 'period-drop,point-intro,point-expand,run-on',
    prep(n, o) { const ps = words(n); if (n._fxDot !== undefined) return; n._fxDot = null; const p = ps[ps.length - 1]; if (!p) return; const has = /\.$/.test(p.textContent); if (!has && !(o && o.dot)) return;
      if (has) p.textContent = p.textContent.slice(0, -1); const w = document.createElement('span'); w.className = 'fxb-w'; p.parentNode.insertBefore(w, p); w.appendChild(p);
      const d = document.createElement('span'); d.className = 'fx-period-drop-dot'; d.textContent = '.'; d.style.cssText = 'display:inline-block;transform-origin:50% 85%;color:' + C.orange; w.appendChild(d); n._fxDot = d; },
    draw(n, lt) { const ps = words(n), st = stg(ps.length, 0.07, 0.4); if (lt < 0) { n.style.opacity = 0; return; } n.style.opacity = 1;
      ps.forEach((p, i) => { const l = lt - i * st; if (l < 0) { p.style.opacity = 0; return; } if (l >= 0.4) return clr(p); p.style.opacity = cl(l / 0.2); p.style.transform = 'translateY(' + (1 - E.outCubic(l / 0.4)) * 0.5 + 'em)'; });
      const d = n._fxDot; if (!d) return; const f = lt - (ps.length - 1) * st - 0.3; if (f < 0) { d.style.opacity = 0; return; } d.style.opacity = 1; if (f >= 0.62) { d.style.transform = ''; return; }
      const y = f < 0.32 ? -2.4 * (1 - Math.pow(f / 0.32, 2)) : -0.35 * Math.sin(Math.PI * cl((f - 0.32) / 0.24)); const sq = Math.exp(-Math.pow((f - 0.32) / 0.035, 2)) + 0.5 * Math.exp(-Math.pow((f - 0.56) / 0.03, 2));
      d.style.transform = 'translateY(' + y + 'em) scale(' + (1 + 0.45 * sq) + ',' + (1 - 0.4 * sq) + ')'; } });

  // puntini della i che cadono per ultimi (solo testo minuscolo: nei titoli in maiuscolo resta una comparsa a lettere)
  FX.add('text', 'tittle-drop', { desc: 'Letters rise, then the dots of every i drop in last with a little bounce (titles in caps just rise)', from: 'tittle-drop',
    prep(n) { chars(n).forEach(p => { if (p.textContent !== 'i' || p._fxTd) return; p.style.position = 'relative'; p.innerHTML = '<span style="display:inline-block">i</span>'; p._fxG = p.firstChild; const d = document.createElement('span'); d.textContent = 'i';
      d.style.cssText = 'position:absolute;left:0;top:0;clip-path:inset(0 0 calc(100% - 0.37em) 0);display:none'; p.appendChild(d); p._fxTd = d; }); },
    draw(n, lt) { const ps = chars(n), st = stg(ps.length, 0.03, 0.5); if (lt < 0) { n.style.opacity = 0; return; } n.style.opacity = 1;
      if (n._fxUp == null) n._fxUp = getComputedStyle(n).textTransform === 'uppercase';
      const T0 = (ps.length - 1) * st + 0.25; let j = 0;
      ps.forEach((p, i) => { const l = lt - i * st; if (l < 0) p.style.opacity = 0; else if (l >= 0.4) clr(p); else { p.style.opacity = cl(l / 0.15); p.style.transform = 'translateY(' + (1 - E.outCubic(l / 0.4)) * 0.5 + 'em)'; }
        const d = p._fxTd; if (!d) return; if (n._fxUp) { d.style.display = 'none'; p._fxG.style.clipPath = ''; return; } const f = lt - T0 - (j++) * 0.06;
        if (f >= 0.5) { d.style.display = 'none'; p._fxG.style.clipPath = ''; return; } p._fxG.style.clipPath = 'inset(0.37em -0.2em -0.3em -0.2em)'; if (f < 0) { d.style.display = 'none'; return; }
        d.style.display = 'block'; d.style.color = C.orange; d.style.transform = 'translateY(' + (-(1 - E.outBounce(f / 0.5)) * 1.6) + 'em)'; }); } });

  FX.add('text', 'path-settle', { desc: 'Letters start scattered along a loose curved path and straighten onto a clean baseline; opts.messy=true scatters them at random and slides a ruler under the line', from: 'path-text,path-ride,ruler-align',
    prep(n) { rel(n); chars(n); if (!n._fxRu) { const r = document.createElement('span'); r.style.cssText = 'position:absolute;left:0;right:0;bottom:-.04em;height:5px;background:' + C.orange + ';transform-origin:left;display:none'; n.appendChild(r); n._fxRu = r; } },
    draw(n, lt, o) { const ps = chars(n), m = o && o.messy, st = stg(ps.length, 0.02, 0.4); if (lt < 0) { n.style.opacity = 0; return; } n.style.opacity = 1;
      const k = E.outCubic((lt - 0.1) / 0.8);
      ps.forEach((p, i) => { const a = lt - i * st; if (a < 0) { p.style.opacity = 0; return; } if (lt >= 0.9) return clr(p); p.style.opacity = cl(a / 0.15);
        const y = m ? (U.rnd('ps', i) - 0.5) * 0.6 : Math.sin(i * 0.5) * 0.35, r = m ? (U.rnd('pr', i) - 0.5) * 28 : Math.cos(i * 0.5) * 16; p.style.transform = 'translateY(' + y * (1 - k) + 'em) rotate(' + r * (1 - k) + 'deg)'; });
      const ru = n._fxRu, show = m || (o && o.ruler); if (!show || lt >= 1.2) { ru.style.display = 'none'; return; } ru.style.display = 'block'; ru.style.transform = 'scaleX(' + E.outCubic(lt / 0.45) + ')'; ru.style.opacity = 1 - cl((lt - 0.9) / 0.3); } });

  FX.add('text', 'pulse-underline', { desc: 'The line rises while an orange pulse line draws beneath it and flattens into a straight underline that stays; opts.wave = beat (default) | sine', from: 'pulse-line,waveform-title',
    prep(n) { const w = lineIn(n); if (w._fxSv) return; const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('style', 'position:absolute;left:0;top:100%;width:100%;height:.6em;margin-top:-.2em;overflow:visible;pointer-events:none');
      s.innerHTML = '<path fill="none" stroke="' + C.orange + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'; w.appendChild(s); w._fxSv = s; },
    draw(n, lt, o) { const w = lineIn(n), s = w._fxSv, pa = s.firstChild; if (lt < 0) { n.style.opacity = 0; return; } n.style.opacity = 1;
      const k = E.outCubic(lt / 0.5); w.style.transform = lt >= 0.5 ? '' : 'translateY(' + (1 - k) * 0.4 + 'em)'; w.style.opacity = cl(lt / 0.25);
      const W = w.offsetWidth || 700, H = s.clientHeight || 40, y0 = H * 0.35, f = E.inOutCubic(cl(lt / 0.6)), amp = (1 - E.inOutCubic(cl((lt - 0.45) / 0.55))) * H * 0.9, N = 80, beat = opt(o, 'wave', 'beat') !== 'sine';
      let d = ''; for (let j = 0; j < N; j++) { const x = W * j / (N - 1); if (x > W * f + 0.5) break; let y;
        if (beat) { const u = (x / W - f * 0.9 + 0.05) * 14; y = (Math.abs(u) < 1.5 ? (u < -0.5 ? 0.3 * Math.sin(Math.PI * (u + 1.5)) : u < 0.5 ? -Math.sin(Math.PI * (u + 0.5)) : 0.6 * Math.sin(Math.PI * (u - 0.5))) : 0); }
        else y = Math.sin(x / W * Math.PI * 6 - lt * 9) * 0.5;
        d += (j ? 'L' : 'M') + x.toFixed(1) + ' ' + (y0 + y * amp).toFixed(1); }
      pa.setAttribute('d', d || 'M0 0'); pa.style.display = d ? '' : 'none'; } });

  FX.add('text', 'lead-flip', { desc: 'The line rises, then its first word flips over into another word in blue (opts.flip, default "You")', from: 'they-are-you,turnabout',
    prep(n) { const ps = words(n); if (ps[0] && ps[0]._fxOrig == null) ps[0]._fxOrig = ps[0].textContent; },
    draw(n, lt, o) { const ps = words(n), st = stg(ps.length, 0.07, 0.4); if (lt < 0) { n.style.opacity = 0; return; } n.style.opacity = 1;
      ps.forEach((p, i) => { const l = lt - i * st; if (l < 0) { p.style.opacity = 0; return; } if (l >= 0.4) return clr(p); p.style.opacity = cl(l / 0.2); p.style.transform = 'translateY(' + (1 - E.outCubic(l / 0.4)) * 0.5 + 'em)'; });
      const p = ps[0]; if (!p || inB(p)) return; const f = lt - (ps.length - 1) * st - 0.4 - opt(o, 'flipDelay', 0.5); if (f < 0) { p.textContent = p._fxOrig; p.style.color = ''; return; }
      const nw = opt(o, 'flip', 'You'); if (f < 0.15) { p.textContent = p._fxOrig; p.style.color = ''; p.style.transform = 'perspective(400px) rotateX(' + 90 * E.inCubic(f / 0.15) + 'deg)'; return; }
      p.textContent = nw; p.style.color = col(opt(o, 'flipColor', 'blue')); p.style.transform = f < 0.32 ? 'perspective(400px) rotateX(' + (-90 * (1 - E.outCubic((f - 0.15) / 0.17))) + 'deg)' : ''; } });

  // =====================================================================================
  // ELEMENTI NUOVI (els)
  // =====================================================================================
  FX.css(`
.fx-swap{font:800 80px/1.15 Inter;letter-spacing:-.02em;color:${C.ink}}
.fx-swap b{color:${C.blue}}
.fx-swap .slot{display:inline-block;position:relative;line-height:1.15;white-space:nowrap}
.fx-swap .slot>.bl{position:static}
.fx-swap .slot>*{position:absolute;left:0;top:0;white-space:nowrap}
.fx-swap .w{will-change:transform}
.fx-swap .gl{top:auto;bottom:100%;font:700 24px/1.2 Mono;letter-spacing:.04em;text-transform:uppercase;color:${C.orange};margin-bottom:-2px}
.fx-swap.glo{line-height:1.75}
.fx-swap .sk{top:56%;height:.09em;background:${C.orange};transform-origin:left}
.fx-swap .sel{top:.06em;height:1.04em;background:${C.mark};transform-origin:left}
.fx-swap .bar{top:.04em;height:1.08em;background:${C.ink}}
.fx-swap .ca{width:.06em;height:.9em;top:.12em;background:${C.orange}}
.fx-swap .hl{top:52%;height:4px;background:${C.orange};transform-origin:left}
.fx-swap .ms{visibility:hidden}
`);
  const swapModes = 'slide flip reel cross zoom strike select cut wipe stretch press track';
  FX.add('els', 'swap', {
    desc: 'A sentence with one slot whose word changes at each marker (lead + slot + tail). Fields: lead, tail, first (word shown before the first change), items [{w, gloss}], mode = ' + swapModes.split(' ').join(' | ') + ', dir="down" (slide), keep=true (strike keeps the struck word), lock=true (fixed slot width), size, dur',
    from: 'value-swap,on-approach,shared-axis-y,width-lock,pinned-word,rolodex-flip,turnabout,they-are-you,slot-machine-roll,word-ladder,phrase-list-bridge,per-word-crossfade,your-name-here,plain-license,shared-axis-z,strikethrough-replace,typo-fix,select-replace,scissors-cut,split-word,pass-swap,rewrite-bars,rubberband-word,ruby-press,pull-in,word-insert',
    build(e) {
      const n = h('<div class="el fx-swap">' + (e.lead ? '<span class="ld">' + mdx(e.lead) + '</span> ' : '') + '<span class="slot"><span class="sel"></span><span class="w a"></span><span class="w a2"></span><span class="w b"></span><span class="st"></span><span class="sk"></span><span class="hl"></span><span class="bar"></span><span class="ca"></span><span class="gl"></span><span class="ms"></span><span class="bl">\u200b</span></span>' + (e.tail ? (/^[.,;:!?]/.test(e.tail) ? '' : ' ') + '<span class="tl">' + mdx(e.tail) + '</span>' : '') + '</div>');
      if (e.size) n.style.fontSize = e.size + 'px';
      const q = s => n.querySelector('.slot .' + s), S = n.querySelector('.slot'), A = q('a'), A2 = q('a2'), B = q('b'), ST = q('st'), SK = q('sk'), SEL = q('sel'), BAR = q('bar'), CA = q('ca'), GL = q('gl'), HL = q('hl'), MS = q('ms');
      const its = e.items || [], W = [e.first != null ? String(e.first) : ''].concat(its.map(i => String(i.w ?? ''))), G = [e.firstGloss || ''].concat(its.map(i => i.gloss || ''));
      if (G.some(Boolean)) n.classList.add('glo');
      const mode = swapModes.split(' ').includes(e.mode) ? e.mode : 'slide', D = e.dur || ({ strike: 0.9, select: 0.9, cut: 0.8, reel: 0.8, stretch: 0.7 }[mode] || 0.5);
      const colr = k => (k === 0 && e.first != null ? C.ink : col(e.color || 'blue'));
      let ws = null; const wid = s => { MS.textContent = s; return s ? MS.offsetWidth : 0; };
      const all = [A, A2, B, ST, SK, SEL, BAR, CA, HL];
      const word = (el, k) => { el.textContent = W[k]; el.style.color = colr(k); };
      return { n, upd(lt, t, t0) {
        if (!ws) { ws = W.map(wid); ws.max = Math.max(...ws); ws.gap = wid(' '); }
        const tk = its.map((it, k) => T(it.at, t0 + (e.first != null ? 0.8 : 0) + k * 0.9)); let j = 0; tk.forEach((x, k) => { if (t >= x) j = k + 1; });
        all.forEach(x => { x.style.cssText = ''; x.style.display = 'none'; }); GL.style.opacity = 1; S.style.clipPath = '';
        const p = j ? cl((t - tk[j - 1]) / D) : 1, a = j ? j - 1 : 0, b = j;
        const setW = w => { S.style.width = (e.lock ? ws.max : w) + 'px'; };
        GL.textContent = G[b]; GL.style.display = G[b] || (p < 1 && G[a]) ? 'block' : 'none';
        if (p < 0.5 && G[a] && G[a] !== G[b]) { GL.textContent = G[a]; GL.style.opacity = 1 - p * 2; } else if (G[b] && G[a] !== G[b]) GL.style.opacity = cl(p * 2 - 1);
        if (!j || p >= 1) { word(B, b); B.style.display = 'block'; setW(mode === 'strike' && e.keep && j ? ws[a] + ws.gap + ws[b] : ws[b]);
          if (mode === 'strike' && e.keep && j) { word(A, a); A.style.display = 'block'; A.style.color = C.gray; SK.style.display = 'block'; SK.style.width = ws[a] + 'px'; B.style.left = (ws[a] + ws.gap) + 'px'; }
          return; }
        const k = E.inOutCubic(p), show = (el, kk) => { word(el, kk); el.style.display = 'block'; };
        setW(L(ws[a], ws[b], k));
        if (!W[a]) { const g = E.inOutCubic(cl(p / 0.6)), f = E.outCubic(cl((p - 0.35) / 0.65)); setW(ws[b] * g); S.style.clipPath = 'inset(-0.6em 0 -0.6em -0.6em)'; show(B, b); B.style.opacity = f; B.style.transform = 'translateY(' + (1 - f) * 0.35 + 'em)'; return; }
        if (mode === 'slide') { const d = e.dir === 'down' ? -1 : 1; S.style.clipPath = 'inset(0 -0.5em)'; show(A, a); show(B, b); A.style.transform = 'translateY(' + (-d * 110 * k) + '%)'; B.style.transform = 'translateY(' + (d * 110 * (1 - k)) + '%)'; }
        else if (mode === 'flip') { if (p < 0.5) { show(A, a); A.style.transform = 'perspective(500px) rotateX(' + 90 * E.inCubic(p * 2) + 'deg)'; } else { show(B, b); B.style.transform = 'perspective(500px) rotateX(' + (-90 * (1 - E.outCubic(p * 2 - 1))) + 'deg)'; } }
        else if (mode === 'reel') { S.style.clipPath = 'inset(0 -0.5em)'; const seq = [W[a]]; for (let i = 0; i < 4; i++) seq.push(W[1 + Math.floor(U.rnd('reel' + j, i) * (W.length - 1))] || W[b]); seq.push(W[b]);
          ST.style.display = 'block'; ST.innerHTML = seq.map((s, i) => '<div style="height:1.15em;color:' + (i === seq.length - 1 ? colr(b) : i ? C.gray : colr(a)) + '">' + esc(s) + '&nbsp;</div>').join('');
          ST.style.transform = 'translateY(' + (-(seq.length - 1) * 1.15 * E.outCubic(p)) + 'em)'; setW(L(ws[a], ws[b], E.outCubic(p))); }
        else if (mode === 'cross') { show(A, a); show(B, b); A.style.opacity = 1 - k; B.style.opacity = k; A.style.transform = 'translateY(' + (-k * 0.25) + 'em)'; B.style.transform = 'translateY(' + (1 - k) * 0.25 + 'em)'; }
        else if (mode === 'zoom') { show(A, a); show(B, b); const z = E.outCubic(p); A.style.opacity = 1 - z; B.style.opacity = cl(z * 1.5); A.style.transform = 'scale(' + (1 - 0.4 * z) + ')'; B.style.transform = 'scale(' + (1.4 - 0.4 * z) + ')'; A.style.transformOrigin = B.style.transformOrigin = 'left center'; }
        else if (mode === 'strike') { const s1 = E.inOutCubic(cl(p / 0.4)); show(A, a); A.style.color = mix(C.ink, C.gray, s1); SK.style.display = 'block'; SK.style.width = ws[a] + 'px'; SK.style.transform = 'scaleX(' + s1 + ')';
          const k2 = E.inOutCubic(cl((p - 0.45) / 0.55));
          if (e.keep) { setW(ws[a] + (ws.gap + ws[b]) * k2); show(B, b); B.style.left = (ws[a] + ws.gap) + 'px'; B.style.opacity = k2; B.style.transform = 'translateY(' + (1 - k2) * 0.3 + 'em)'; }
          else { const f = cl((p - 0.45) / 0.2); A.style.opacity = SK.style.opacity = 1 - f; setW(L(ws[a], ws[b], k2)); if (p > 0.5) { show(B, b); B.style.opacity = k2; B.style.transform = 'translateY(' + (1 - k2) * 0.3 + 'em)'; } } }
        else if (mode === 'select') { if (p < 0.45) { show(A, a); setW(ws[a]); SEL.style.display = 'block'; SEL.style.width = ws[a] + 'px'; SEL.style.transform = 'scaleX(' + E.outCubic(p / 0.35) + ')'; }
          else { const m = Math.round(W[b].length * cl((p - 0.45) / 0.5)), s = W[b].slice(0, m); B.textContent = s; B.style.color = colr(b); B.style.display = 'block'; const w = wid(s); setW(w); CA.style.display = 'block'; CA.style.left = (w + 3) + 'px'; } }
        else if (mode === 'cut') { const c1 = E.outCubic(cl(p / 0.2)), c2 = E.inCubic(cl((p - 0.15) / 0.45)), c3 = E.outCubic(cl((p - 0.4) / 0.6)); setW(L(ws[a], ws[b], c3));
          HL.style.display = 'block'; HL.style.width = Math.max(ws[a], ws[b]) + 'px'; HL.style.transform = 'scaleX(' + c1 + ')'; HL.style.opacity = 1 - cl((p - 0.5) / 0.3);
          if (c2 < 1) { show(A, a); show(A2, a); A.style.clipPath = 'inset(-0.2em -0.2em 48% -0.2em)'; A2.style.clipPath = 'inset(52% -0.2em -0.2em -0.2em)'; A.style.opacity = A2.style.opacity = 1 - c2;
            A.style.transform = 'translate(' + (-c2 * 0.4) + 'em,' + (-c2 * 0.5) + 'em) rotate(' + (-c2 * 6) + 'deg)'; A2.style.transform = 'translate(' + c2 * 0.4 + 'em,' + c2 * 0.5 + 'em) rotate(' + c2 * 6 + 'deg)'; }
          if (p > 0.4) { show(B, b); B.style.opacity = c3; B.style.clipPath = 'inset(-0.2em -0.2em -0.2em ' + (1 - c3) * 100 + '%)'; B.style.transform = 'translateX(' + (1 - c3) * 0.3 + 'em)'; } }
        else if (mode === 'wipe') { const half = p < 0.5, kk = E.inOutCubic(half ? p * 2 : p * 2 - 1); setW(half ? ws[a] : ws[b]); BAR.style.display = 'block'; BAR.style.left = '-0.08em'; BAR.style.right = '-0.08em';
          BAR.style.transformOrigin = half ? 'left' : 'right'; BAR.style.transform = 'scaleX(' + (half ? kk : 1 - kk) + ')'; if (half) show(A, a); else show(B, b); }
        else if (mode === 'stretch') { if (p < 0.45) { show(A, a); setW(ws[a]); const s = E.inCubic(p / 0.45); A.style.transformOrigin = 'left center'; A.style.transform = 'scale(' + (1 + 0.55 * s) + ',' + (1 - 0.12 * s) + ')'; }
          else { show(B, b); setW(ws[b]); const sp = U.spring((p - 0.45) * D, { damping: 9, stiffness: 260 }); B.style.transformOrigin = 'left center'; B.style.transform = 'scaleX(' + (1.55 - 0.55 * sp) + ')'; } }
        else if (mode === 'press') { const k1 = E.inCubic(cl(p / 0.45)), k2 = E.outBack(cl((p - 0.4) / 0.6)); show(A, a); A.style.transformOrigin = B.style.transformOrigin = 'center bottom'; A.style.transform = 'scaleY(' + (1 - k1) + ')'; A.style.opacity = 1 - k1;
          if (p > 0.4) { show(B, b); B.style.transform = 'scaleY(' + k2 + ')'; } }
        else if (mode === 'track') { show(A, a); A.style.opacity = 1 - cl(p / 0.3); if (p > 0.15) { const k3 = E.outCubic(cl((p - 0.15) / 0.85)); show(B, b); B.style.opacity = cl((p - 0.15) / 0.3); B.style.letterSpacing = L(0.6, -0.02, k3) + 'em'; } }
      } };
    },
    sfx(e, t0, T, add) { (e.items || []).forEach((it, k) => add(T(it.at, t0 + (e.first != null ? 0.8 : 0) + k * 0.9), 'pop', { g: 0.5 })); },
  });

  FX.css(`
.fx-blanks{font:800 64px/1.75 Inter;letter-spacing:-.02em;color:${C.ink}}
.fx-blanks b{color:${C.blue}}
.fx-blanks .bk{display:inline-block;position:relative;min-width:2.2em;vertical-align:top;height:1.15em;line-height:1.15;margin-top:.3em}
.fx-blanks .bk .wd{display:inline-block;color:${C.blue};white-space:nowrap}
.fx-blanks .bk .ul{position:absolute;left:0;right:0;bottom:-.02em;height:6px;background:${C.gray}}
.fx-blanks .bk .lb{position:absolute;left:0;top:100%;margin-top:6px;font:700 22px/1 Mono;letter-spacing:.06em;text-transform:uppercase;color:${C.mute};white-space:nowrap}
`);
  FX.add('els', 'blanks', {
    desc: 'A one-line pitch with underlined blanks and small labels; each blank fills with its word at its marker. Fields: line (use {} for each blank), items [{w, label}], size',
    from: 'pitch-blanks',
    build(e) { const segs = String(e.line || '').split('{}'), its = e.items || []; let html = '';
      segs.forEach((s, i) => { html += mdx(s); if (i < segs.length - 1) { const it = its[i] || {}; html += '<span class="bk"><span class="wd">' + esc(it.w || '') + '</span><span class="ul"></span><span class="lb">' + esc(it.label || '') + '</span></span>'; } });
      const n = h('<div class="el fx-blanks">' + html + '</div>'); if (e.size) n.style.fontSize = e.size + 'px'; const bk = [...n.querySelectorAll('.bk')];
      return { n, upd(lt, t, t0) { bk.forEach((b, k) => { const it = its[k] || {}, s = T(it.at, t0 + 0.5 + k * 0.7), l = t - s, wd = b.firstChild, ul = b.children[1];
        if (l < 0) { wd.style.visibility = 'hidden'; ul.style.background = C.gray; return; } const q = E.outBack(cl(l / 0.4)); wd.style.visibility = ''; wd.style.opacity = cl(l / 0.2);
        wd.style.transform = l >= 0.4 ? '' : 'translateY(' + (-(1 - q) * 0.5) + 'em)'; ul.style.background = mix(C.gray, C.orange, cl(l / 0.3)); }); } };
    },
    sfx(e, t0, T, add) { (e.items || []).forEach((it, k) => add(T(it.at, t0 + 0.5 + k * 0.7), 'pop', { g: 0.6 })); },
  });

  FX.css(`
.fx-dim-list{display:flex;flex-direction:column;gap:20px}
.fx-dim-list .r{position:relative;font:800 60px/1.12 Inter;letter-spacing:-.02em;color:${C.ink}}
.fx-dim-list .r b{color:${C.blue}}
.fx-dim-list .r .mk{position:absolute;left:-.12em;right:auto;bottom:.04em;height:.42em;background:${C.mark};z-index:-1;transform-origin:left}
.fx-dim-list .r .tx{position:relative}
`);
  FX.add('els', 'dim-list', {
    desc: 'A column of claims arrives one per marker, then all but one dim away and the survivor gets a marker swipe. Fields: items [{text}], keep (index, default last), dimAt (marker id, optional), size',
    from: 'what-sticks,tldr-on-top',
    build(e) { const its = e.items || [], keep = e.keep != null ? e.keep : its.length - 1; const n = h('<div class="el fx-dim-list" style="isolation:isolate"></div>');
      const rs = its.map(it => { const r = h('<div class="r"><span class="mk"></span><span class="tx">' + mdx(it.text) + '</span></div>'); if (e.size) r.style.fontSize = e.size + 'px'; n.appendChild(r); return r; });
      return { n, upd(lt, t, t0) { const ts = its.map((it, k) => T(it.at, t0 + k * 0.6)), td = T(e.dimAt, Math.max(...ts, t0) + 1.0);
        rs.forEach((r, k) => { const l = t - ts[k], mk = r.firstChild; r.style.opacity = l < 0 ? 0 : cl(l / 0.25); r.style.transform = l >= 0.45 || l < 0 ? '' : 'translateY(' + (1 - E.outCubic(l / 0.45)) * 30 + 'px)';
          if (k === keep) { const m = E.inOutCubic((t - td) / 0.45); mk.style.width = m > 0 ? r.lastChild.offsetWidth * 1.0 + 'px' : '0'; mk.style.transform = 'scaleX(' + m + ')'; }
          else { const m = E.inOutCubic((t - td - k * 0.12) / 0.4); if (l >= 0) r.style.opacity = 1 - 0.78 * m; } }); } };
    },
  });

  FX.css(`
.fx-stamp-list{display:flex;flex-direction:column;gap:24px}
.fx-stamp-list .r{display:grid;grid-template-columns:var(--kw,210px) 1fr;align-items:baseline;column-gap:14px;position:relative;padding-top:16px}
.fx-stamp-list.stack .r{grid-template-columns:1fr;row-gap:6px}
.fx-stamp-list .r .rl{position:absolute;left:0;right:0;top:0;height:3px;background:${C.line};transform-origin:left}
.fx-stamp-list .k{font:700 30px/1.2 Mono;letter-spacing:.05em;text-transform:uppercase;color:${C.orange}}
.fx-stamp-list .v{font:800 50px/1.12 Inter;letter-spacing:-.02em;color:${C.ink}}
.fx-stamp-list .v b{color:${C.blue}}
`);
  FX.add('els', 'stamp-list', {
    desc: 'A list of stamped lines (day, time, hinge phrase or clue number + text), one per marker. Fields: items [{k, text, tone: low|hi}] (low = the snag drops and dims, hi = lights up in blue), layout = row (default) | stack, kw (label column width px)',
    from: 'week-shipped,overnight,story-dip,which-means,riddle-clues',
    build(e) { const its = e.items || []; const n = h('<div class="el fx-stamp-list' + (e.layout === 'stack' ? ' stack' : '') + '"></div>'); if (e.kw) n.style.setProperty('--kw', e.kw + 'px');
      const rs = its.map(it => { const r = h('<div class="r"><i class="rl"></i><div class="k">' + esc(it.k || '') + '</div><div class="v">' + mdx(it.text) + '</div></div>'); n.appendChild(r); return r; });
      return { n, upd(lt, t, t0) { rs.forEach((r, k) => { const it = its[k], l = t - T(it.at, t0 + k * 0.7), [rl, kk, v] = r.children;
        if (l < 0) { r.style.opacity = 0; return; } r.style.opacity = 1; rl.style.transform = 'scaleX(' + E.outCubic(l / 0.4) + ')';
        kk.style.clipPath = 'inset(0 ' + (1 - E.outCubic(cl(l / 0.3))) * 100 + '% 0 0)'; const q = E.outCubic(cl((l - 0.1) / 0.45)); v.style.opacity = cl((l - 0.1) / 0.25);
        let y = (1 - q) * 30; const z = E.inOutCubic(cl((l - 0.7) / 0.5)); v.style.color = '';
        if (it.tone === 'low') { y += 14 * z; v.style.opacity = cl((l - 0.1) / 0.25) * (1 - 0.6 * z); kk.style.opacity = 1 - 0.6 * z; }
        if (it.tone === 'hi') v.style.color = mix(C.ink, C.blue, z);
        v.style.transform = y ? 'translateY(' + y + 'px)' : ''; }); } };
    },
  });

  FX.css(`
.fx-steps{position:relative;display:flex;flex-direction:column;gap:30px;padding-left:44px}
.fx-steps .rail{position:absolute;left:10px;top:40px;bottom:40px;width:4px;background:${C.line}}
.fx-steps .dot{position:absolute;left:0;width:24px;height:24px;border-radius:50%;background:${C.orange}}
.fx-steps .r{display:grid;grid-template-columns:96px 1fr;column-gap:22px;align-items:start;position:relative}
.fx-steps .nu{font:400 104px/0.9 Anton;color:${C.gray};text-align:center;background:${C.paper};position:relative}
.fx-steps .ti{font:800 48px/1.1 Inter;letter-spacing:-.02em;color:${C.ink};padding-top:4px}
.fx-steps .de{font:500 30px/1.3 Inter;color:${C.mute};margin-top:8px}
`);
  FX.add('els', 'steps', {
    desc: 'Numbered steps along a vertical rail: at each marker an orange dot travels to the next numeral, which lights up blue with its title and detail. Fields: items [{title, detail}] (2-4)',
    from: 'three-steps',
    build(e) { const its = e.items || []; const n = h('<div class="el fx-steps"><i class="rail"></i></div>');
      const rs = its.map((it, k) => { const r = h('<div class="r"><div class="nu">' + (k + 1) + '</div><div><div class="ti">' + mdx(it.title) + '</div>' + (it.detail ? '<div class="de">' + mdx(it.detail) + '</div>' : '') + '</div></div>'); n.appendChild(r); return r; });
      const dot = h('<i class="dot"></i>'); n.appendChild(dot);
      return { n, upd(lt, t, t0) { const ts = its.map((it, k) => T(it.at, t0 + k * 0.8)), ys = rs.map(r => r.offsetTop + 40);
        let y = null; rs.forEach((r, k) => { const l = t - ts[k], nu = r.firstChild, tx = r.lastChild; tx.style.opacity = cl((l - 0.15) / 0.3); tx.style.transform = l >= 0.6 ? '' : 'translateY(' + (1 - E.outCubic(cl((l - 0.15) / 0.45))) * 24 + 'px)';
          nu.style.color = mix(C.gray, C.blue, cl((l - 0.25) / 0.25)); nu.style.transform = l > 0.25 && l < 0.6 ? 'scale(' + (1 + 0.12 * Math.sin(Math.PI * (l - 0.25) / 0.35)) + ')' : '';
          if (l >= 0) y = k === 0 ? ys[0] : L(ys[k - 1], ys[k], E.inOutCubic(l / 0.35)); });
        dot.style.display = y == null ? 'none' : 'block'; if (y != null) dot.style.top = (y - 12) + 'px'; } };
    },
  });

  FX.css(`
.fx-qa{display:flex;flex-direction:column;gap:26px}
.fx-qa .r{font:700 50px/1.18 Inter;letter-spacing:-.015em;color:${C.ink}}
.fx-qa .r b{color:${C.blue}}
.fx-qa .tg{display:inline-block;margin-left:.3em;padding:.04em .32em .02em;border-radius:12px;background:${C.orange};color:${C.paper};font:900 44px/1.1 Inter;vertical-align:.04em;transform-origin:30% 60%}
`);
  FX.add('els', 'qa', {
    desc: 'Short questions arrive one per marker and each is answered by the same bold orange tag that pops in beside it. Fields: items [{q}], tag (default "Yes")',
    from: 'yes-run',
    build(e) { const its = e.items || []; const n = h('<div class="el fx-qa"></div>');
      const rs = its.map(it => { const r = h('<div class="r"><span class="q">' + mdx(it.q) + '</span><span class="tg">' + esc(e.tag || 'Yes') + '</span></div>'); n.appendChild(r); return r; });
      return { n, upd(lt, t, t0) { rs.forEach((r, k) => { const l = t - T(its[k].at, t0 + k * 0.8), q = r.firstChild, tg = r.lastChild;
        q.style.opacity = l < 0 ? 0 : cl(l / 0.25); r.style.transform = l < 0 || l >= 0.45 ? '' : 'translateY(' + (1 - E.outCubic(l / 0.45)) * 26 + 'px)';
        const m = l - 0.5; tg.style.opacity = m < 0 ? 0 : 1; tg.style.transform = m < 0 ? 'scale(0)' : m >= 0.8 ? 'rotate(-3deg)' : 'scale(' + U.spring(m, { damping: 10, stiffness: 260 }) + ') rotate(' + (-3 - 9 * (1 - cl(m / 0.3))) + 'deg)'; }); } };
    },
    sfx(e, t0, T, add) { (e.items || []).forEach((it, k) => add(T(it.at, t0 + k * 0.8) + 0.5, 'pop', { g: 0.7 })); },
  });

  FX.css(`
.fx-walkout .kk{font:700 30px/1.2 Mono;letter-spacing:.14em;text-transform:uppercase;color:${C.orange};margin-bottom:10px}
.fx-walkout .nm{font:400 150px/0.94 Anton;text-transform:uppercase;color:${C.ink};white-space:nowrap;transform-origin:left center}
.fx-walkout .nm b{color:${C.orange}}
.fx-walkout .bd{display:inline-block;margin-top:22px;background:${C.ink};color:${C.paper};font:700 36px/1 Mono;letter-spacing:.08em;padding:14px 22px 12px;text-transform:uppercase}
.fx-walkout .nk{font:700 66px/1 Hand;color:${C.blue};margin-top:16px;transform:rotate(-3deg);transform-origin:left center}
`);
  FX.add('els', 'walkout', {
    desc: 'A fighter-style name card: kicker, name lines that slam in one by one with a shake, then an ink band (record, stat) and a handwritten nickname. Fields: kicker, lines ["NAME", "*SURNAME*"], band, nick',
    from: 'walkout-name,we-call-it,round-slam,two-hit',
    build(e) { const n = h('<div class="el fx-walkout">' + (e.kicker ? '<div class="kk">' + esc(e.kicker) + '</div>' : '') + '</div>');
      const ls = (e.lines || []).map(l => { const d = h('<div class="nm"><span>' + mdx(l) + '</span></div>'); n.appendChild(d); return d; });
      const bd = e.band ? n.appendChild(h('<div><span class="bd">' + esc(e.band) + '</span></div>')).firstChild : null, nk = e.nick ? n.appendChild(h('<div class="nk">' + esc(e.nick) + '</div>')) : null, kk = n.querySelector('.kk');
      let fit = 0;
      return { n, upd(lt) { if (!fit) { const mw = Math.max(1, ...ls.map(d => d.firstChild.offsetWidth)); fit = Math.min(1, 715 / mw); ls.forEach(d => { d.style.fontSize = (150 * fit) + 'px'; }); }
        if (kk) kk.style.opacity = cl(lt / 0.3); let sh = 0;
        ls.forEach((d, k) => { const l = lt - 0.25 - k * 0.32; d.style.opacity = l < 0 ? 0 : cl(l / 0.04); if (l < 0) return;
          const s = l < 0.13 ? 1.6 - 0.6 * Math.pow(l / 0.13, 2) : 1 - 0.04 * Math.sin(Math.PI * cl((l - 0.13) / 0.2)); d.style.transform = l >= 0.35 ? '' : 'scale(' + s + ')'; if (l > 0.13 && l < 0.35) sh += Math.exp(-(l - 0.13) / 0.05); });
        n.style.transform = sh > 0.01 ? 'translate(' + U.noise(lt * 60, 'wx') * 8 * sh + 'px,' + U.noise(lt * 60, 'wy') * 6 * sh + 'px)' : '';
        const tb = 0.25 + ls.length * 0.32 + 0.25; if (bd) { const q = E.inOutCubic((lt - tb) / 0.4); bd.style.clipPath = 'inset(0 ' + (1 - q) * 100 + '% 0 0)'; }
        if (nk) { const q = E.inOutCubic((lt - tb - (bd ? 0.4 : 0)) / 0.6); nk.style.clipPath = 'inset(-20% ' + (1 - q) * 100 + '% -20% 0)'; } } };
    },
    sfx(e, t0, T, add) { (e.lines || []).forEach((l, k) => add(t0 + 0.25 + k * 0.32 + 0.12, 'hit', { g: 0.6 })); if (e.nick) add(t0 + 0.25 + (e.lines || []).length * 0.32 + 0.65, 'pen', { d: 0.6 }); },
  });

  FX.css(`
.fx-dict .hw{font:400 128px/1 Anton;text-transform:uppercase;color:${C.ink};letter-spacing:.005em}
.fx-dict .pr{font:400 30px/1.3 Mono;color:${C.mute};margin:6px 0 18px}
.fx-dict .se{display:grid;grid-template-columns:auto 1fr;column-gap:18px;align-items:baseline;margin-top:16px}
.fx-dict .ps{font:700 28px/1.2 Mono;color:${C.orange};text-transform:lowercase;font-style:italic}
.fx-dict .df{font:700 44px/1.18 Inter;letter-spacing:-.01em;color:${C.ink}}
.fx-dict .df b{color:${C.blue}}
.fx-dict .ex{margin-top:26px;padding-left:22px;border-left:6px solid ${C.orange};font:500 36px/1.3 Inter;font-style:italic;color:${C.mute}}
.fx-dict .ex b{color:${C.blue};font-style:normal}
`);
  FX.add('els', 'dict', {
    desc: 'A dictionary entry: headword and pronunciation, then one sense per marker (earlier senses dim, e.g. noun then verb), then an example line. Fields: word, pron, items [{pos, def}], example',
    from: 'verbed',
    build(e) { const its = e.items || []; const n = h('<div class="el fx-dict"><div class="hw">' + esc(e.word || '') + '</div>' + (e.pron ? '<div class="pr">' + esc(e.pron) + '</div>' : '') + '</div>');
      const hw = n.firstChild, pr = n.querySelector('.pr');
      const ss = its.map((it, k) => n.appendChild(h('<div class="se"><div class="ps">' + (k + 1) + ' ' + esc(it.pos || '') + '</div><div class="df">' + mdx(it.def) + '</div></div>')));
      const ex = e.example ? n.appendChild(h('<div class="ex">' + mdx(e.example) + '</div>')) : null;
      return { n, upd(lt, t, t0) { hw.style.clipPath = 'inset(-10% ' + (1 - E.outCubic(lt / 0.5)) * 100 + '% -10% 0)'; if (pr) pr.style.opacity = cl((lt - 0.3) / 0.3);
        const ts = its.map((it, k) => T(it.at, t0 + 0.5 + k * 1.0));
        ss.forEach((s, k) => { const l = t - ts[k], nx = k + 1 < ts.length ? E.inOutCubic((t - ts[k + 1]) / 0.4) : 0; s.style.opacity = (l < 0 ? 0 : cl(l / 0.3)) * (1 - 0.65 * nx); s.style.transform = l < 0 || l >= 0.45 ? '' : 'translateY(' + (1 - E.outCubic(l / 0.45)) * 24 + 'px)'; });
        if (ex) { const l = t - (Math.max(t0, ...ts) + 0.7); ex.style.opacity = cl(l / 0.35); ex.style.clipPath = 'inset(-10% ' + (1 - E.outCubic(cl(l / 0.5))) * 100 + '% -10% 0)'; } } };
    },
  });

  FX.css(`
.fx-fact-table .hd{font:900 66px/1.04 Inter;letter-spacing:-.025em;color:${C.ink};margin-bottom:22px}
.fx-fact-table .hd b{color:${C.blue}}
.fx-fact-table .r{display:grid;grid-template-columns:170px 1fr;align-items:baseline;position:relative;padding:18px 0 12px}
.fx-fact-table .r .rl{position:absolute;left:0;right:0;top:0;height:3px;background:${C.ink};transform-origin:left}
.fx-fact-table .k{font:700 26px/1.2 Mono;letter-spacing:.08em;text-transform:uppercase;color:${C.mute}}
.fx-fact-table .v{font:800 46px/1.12 Inter;letter-spacing:-.015em;color:${C.ink}}
.fx-fact-table .v b{color:${C.blue}}
.fx-fact-table .r.hi .v{color:${C.orange}}
`);
  FX.add('els', 'fact-table', {
    desc: 'A headline, then a what / when / where table that builds one ruled row per marker. Fields: title, items [{k, v}], hi (index of the row in orange)',
    from: 'rsvp',
    build(e) { const its = e.items || []; const n = h('<div class="el fx-fact-table">' + (e.title ? '<div class="hd">' + mdx(e.title) + '</div>' : '') + '</div>'); const hd = n.querySelector('.hd');
      const rs = its.map((it, k) => n.appendChild(h('<div class="r' + (k === e.hi ? ' hi' : '') + '"><i class="rl"></i><div class="k">' + esc(it.k || '') + '</div><div class="v">' + mdx(it.v) + '</div></div>')));
      return { n, upd(lt, t, t0) { if (hd) { hd.style.opacity = cl(lt / 0.3); hd.style.transform = lt >= 0.45 ? '' : 'translateY(' + (1 - E.outCubic(lt / 0.45)) * 24 + 'px)'; }
        rs.forEach((r, k) => { const l = t - T(its[k].at, t0 + 0.5 + k * 0.6), [rl, kk, v] = r.children; r.style.opacity = l < 0 ? 0 : 1; if (l < 0) return;
          rl.style.transform = 'scaleX(' + E.outCubic(l / 0.4) + ')'; kk.style.opacity = cl((l - 0.1) / 0.25); v.style.opacity = cl((l - 0.15) / 0.25); v.style.transform = l >= 0.6 ? '' : 'translateY(' + (1 - E.outCubic(cl((l - 0.15) / 0.45))) * 20 + 'px)'; }); } };
    },
  });

  FX.css(`
.fx-quote{position:relative;padding-top:70px}
.fx-quote .qm{position:absolute;left:-6px;top:-20px;font:400 220px/1 Anton;color:${C.orange}}
.fx-quote .ask{font:500 38px/1.3 Inter;font-style:italic;color:${C.mute};margin-bottom:22px}
.fx-quote .tx{font:800 62px/1.14 Inter;letter-spacing:-.02em;color:${C.ink}}
.fx-quote .tx b{color:${C.blue}}
.fx-quote .tx b .fxp{box-shadow:inset 0 -.16em ${C.mark}}
.fx-quote .who{margin-top:30px;display:flex;align-items:baseline;gap:16px;flex-wrap:wrap}
.fx-quote .who .ru{width:48px;height:5px;background:${C.orange};align-self:center}
.fx-quote .who .nm{font:800 36px/1.2 Inter;color:${C.ink}}
.fx-quote .who .ro{font:400 26px/1.2 Mono;color:${C.mute};text-transform:uppercase;letter-spacing:.04em}
`);
  FX.add('els', 'quote', {
    desc: 'A big pull quote: optional question above (overheard), the quote rising word by word with *highlighted* words on a soft marker, then the attribution with an orange rule. Fields: text, who, role, ask',
    from: 'quote-hero,said-who,overheard',
    build(e) { const n = h('<div class="el fx-quote"><div class="qm">“</div>' + (e.ask ? '<div class="ask">' + mdx(e.ask) + '</div>' : '') + '<div class="tx">' + mdx(e.text) + '</div>' +
        (e.who || e.role ? '<div class="who"><i class="ru"></i><span class="nm">' + esc(e.who || '') + '</span><span class="ro">' + esc(e.role || '') + '</span></div>' : '') + '</div>');
      const qm = n.querySelector('.qm'), ask = n.querySelector('.ask'), tx = n.querySelector('.tx'), who = n.querySelector('.who'); let ws = null;
      return { n, upd(lt) { if (!ws) ws = words(tx); qm.style.opacity = cl(lt / 0.3); qm.style.transform = lt >= 0.5 ? '' : 'translateY(' + (1 - E.outBack(lt / 0.5)) * -40 + 'px)';
        if (ask) ask.style.opacity = cl(lt / 0.35); const tq = ask ? 0.8 : 0.15, st = Math.min(0.06, 1.2 / ws.length);
        ws.forEach((p, i) => { const l = lt - tq - i * st; if (l < 0) { p.style.opacity = 0; return; } if (l >= 0.45) return clr(p); p.style.opacity = cl(l / 0.25); p.style.transform = 'translateY(' + (1 - E.outCubic(l / 0.45)) * 0.5 + 'em)'; });
        if (who) { const l = lt - tq - ws.length * st - 0.3; who.style.opacity = cl(l / 0.3); who.style.transform = l >= 0.45 ? '' : 'translateX(' + (1 - E.outCubic(cl(l / 0.45))) * -30 + 'px)'; } } };
    },
  });
})();
