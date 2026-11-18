// GG Motion — transizioni fra capitoli (trans) e movimenti di camera (cam).
// Idee riprese da Remocn (categorie transitions e camera, licenza MIT, vedi LICENSE-remocn.txt), riscritte
// in JavaScript semplice con i colori del brand. Contratto in base.js.
//
// trans: draw(el, p, phase, view, t). phase 'in' = p 0->1 copre la vista USCENTE; 'out' = p 0->1 scopre
// la vista ENTRANTE. p arriva gia' addolcito (easeIO del motore): lin(p) lo riporta lineare (per molle e ritardi).
// Il motore azzera transform/filter/clipPath/opacity della vista a ogni fotogramma.
// Alcune transizioni (glitch, tear) clonano la vista nel livello: la copia e' fatta a ogni fotogramma (pura nel tempo).
(() => {
  const U = FX.u, C = FX.C, E = U.E, I = U.interp, cl = U.clamp;
  const W = 1080, H = 1920;
  const lin = p => (p < 0.5 ? Math.pow(Math.max(p, 0) / 8, 0.25) : 1 - Math.pow(2 * Math.max(1 - p, 0), 0.25) / 2);
  // il livello del motore ha classe 'fxtr': avvolgo l'html in un div .fx-<nome> e passo quello a draw
  const T = (name, def) => { const d0 = def.draw; FX.add('trans', name, Object.assign({}, def, {
    html: '<div class="fx-' + name + '" style="position:absolute;inset:0">' + (def.html || '') + '</div>',
    draw: (el, p, ph, v, t) => d0(el.firstChild, p, ph, v, t) })); };
  const R = (seed, i) => hr(Math.round(i), (U.hash(seed) * 2147483647) | 0); // come FX.u.rnd ma senza correlazioni fra indici vicini
  // hash intero ben mescolato (per griglie fitte: niente righe correlate)
  const hr = (i, s) => { let h = Math.imul((i | 0) ^ Math.imul(s | 0, 0x27d4eb2d), 0x9e3779b1); h ^= h >>> 15; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  const K = (name, def) => FX.add('cam', name, def);
  const px = v => v.toFixed(1) + 'px';
  const poly = pts => 'polygon(' + pts.map(q => px(q[0]) + ' ' + px(q[1])).join(',') + ')';
  const svgPts = pts => pts.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ');
  const cloneView = (view) => { const c = view.cloneNode(true); ['transform', 'filter', 'clipPath', 'opacity'].forEach(k => c.style[k] = ''); c.style.display = 'block'; return c; };
  const rep = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');
  // buco circolare in un fondo pieno: div con box-shadow enorme (raggio r, centro cx,cy)
  const hole = (d, cx, cy, r) => { d.style.width = d.style.height = px(2 * r); d.style.left = px(cx - r); d.style.top = px(cy - r); };

  FX.css(`
.fx-ab{position:absolute;left:0;top:0}
.fx-full{position:absolute;inset:0}
.fx-hole{position:absolute;border-radius:50%;box-shadow:0 0 0 4000px ${C.ink}}
.fx-whip i{position:absolute;left:0;right:0;height:5px;background:${C.ink};border-radius:3px}
.fx-card-swipe .cd{position:absolute;left:-210px;top:-240px;width:1500px;height:2400px;border-radius:70px;background:${C.ink};box-shadow:0 40px 90px rgba(11,31,58,.30)}
.fx-card-swipe .cd::after{content:'';position:absolute;inset:150px 250px;border:10px solid ${C.orange};border-radius:40px}
.fx-rings .dk{position:absolute;left:540px;top:860px;width:2600px;height:2600px;margin:-1300px 0 0 -1300px;border-radius:50%}
.fx-rings .fx-hole{border:16px solid ${C.orange};box-sizing:border-box}
.fx-shape-cut .sh{position:absolute;width:400px;height:400px;margin:-200px 0 0 -200px;border-radius:22%;background:${C.orange}}
.fx-blinds .sd{position:absolute;left:0;right:0;background:${C.ink}}
.fx-bands .b{position:absolute;left:0;width:100%;height:241px}
.fx-columns .c{position:absolute;top:0;height:100%;width:181px}
.fx-bars .wrap{position:absolute;left:-560px;top:0;height:100%;width:2300px;transform:skewX(-16deg)}
.fx-bars .b{position:absolute;top:0;height:100%}
.fx-tiles .q{position:absolute;width:184px;height:184px;margin:-92px 0 0 -92px}
.fx-dots .q{position:absolute;width:180px;height:180px;margin:-90px 0 0 -90px;border-radius:50%}
.fx-glitch .sl{position:absolute;inset:0;overflow:hidden}
.fx-glitch .bk{position:absolute}
.fx-melt .c{position:absolute;top:0;height:100%;width:42px;background:${C.ink};border-radius:0 0 21px 21px;transform-origin:top}
.fx-scatter .s{position:absolute;width:300px;height:300px;margin:-150px 0 0 -150px}
.fx-wash .bl{position:absolute;width:1700px;height:1700px;margin:-850px 0 0 -850px;border-radius:50%}
.fx-slit .ln{position:absolute;left:0;width:100%;height:6px;margin-top:-3px;background:${C.orange}}
.fx-caret .cr{position:absolute;top:26%;height:48%;width:14px;margin-left:-7px;background:${C.blue};border-radius:7px}
.fx-tear .hf{position:absolute;inset:0}
.fx-tear .hf>div{position:absolute;inset:0}
.fx-doors .d{position:absolute;top:0;width:541px;height:100%;background:${C.ink};overflow:hidden}
.fx-doors .d span{position:absolute;top:50%;margin-top:-330px;font:400 600px/660px Anton;color:${C.paper}}
.fx-doors .d.l{left:0;border-right:12px solid ${C.orange}}
.fx-doors .d.r{left:539px;border-left:12px solid ${C.orange}}
.fx-doors .d.l span{right:-8px}.fx-doors .d.r span{left:-8px}
.fx-stinger .s{position:absolute;top:-10px;height:1940px;width:1900px;left:-100px;transform-origin:0 0}
.fx-swirl .sw{position:absolute;left:540px;top:900px;width:2500px;height:2500px;margin:-1250px 0 0 -1250px;border-radius:50%;
  background:repeating-conic-gradient(from 0deg,${C.ink} 0deg 15deg,${C.blue} 15deg 30deg)}
.fx-speed-lines .fl{position:absolute;inset:0;background:${C.paper}}
`);

  // ---------------------------------------------------------------- MOVIMENTO DELLA VISTA
  // whip-pan: frustata laterale con mosso; la velocita' e' massima al taglio
  const whip = (axis) => ({
    desc: 'Whip pan ' + (axis === 'x' ? 'sideways' : 'upwards') + ': the camera snaps away with motion blur and speed lines, the next chapter flies in from the other side',
    from: 'whip-pan', dur: 0.32,
    html: rep(7, i => `<i style="top:${(12 + i * 12.5).toFixed(1)}%;opacity:0"></i>`),
    draw(el, p, ph, v) {
      const q = lin(p), tr = ph === 'in' ? p : p - 1, vel = Math.sin(Math.PI * (ph === 'in' ? q / 2 : 0.5 + q / 2));
      const off = tr * 110, st = 1 + vel * 0.12;
      v.style.transform = axis === 'x' ? `translateX(${-off}%) scale(${st},1)` : `translateY(${-off}%) scale(1,${st})`;
      v.style.filter = `blur(${(vel * 22).toFixed(1)}px)`;
      el.style.transform = axis === 'x' ? '' : 'rotate(90deg) scale(1.8)';
      el.querySelectorAll('i').forEach((d, i) => { const w = 0.3 + 0.6 * R('wh', i); d.style.opacity = (vel * 0.5).toFixed(2);
        d.style.left = (100 * R('wx', i) * (1 - w)).toFixed(1) + '%'; d.style.right = 'auto'; d.style.width = (w * 100 * vel).toFixed(1) + '%'; });
    },
  });
  T('whip', Object.assign(whip('x'), { from: 'whip-pan' }));
  T('whip-up', Object.assign(whip('y'), { from: 'whip-pan' }));

  T('push', {
    desc: 'Push-through: dolly into the outgoing chapter until it blurs away, the next one comes up from the depth and settles',
    from: 'push-through,ripple-zoom,warp-dissolve,zoom-blur', dur: 0.36, html: '',
    draw(el, p, ph, v) {
      if (ph === 'in') { v.style.transform = `scale(${1 + 1.4 * E.inCubic(lin(p))})`; v.style.filter = `blur(${I(p, [0.2, 1], [0, 14]).toFixed(1)}px)`; v.style.opacity = I(p, [0.6, 1], [1, 0]); }
      else { v.style.transform = `scale(${I(p, [0, 0.85, 1], [0.7, 1.015, 1])})`; v.style.filter = `blur(${I(p, [0, 0.75], [10, 0]).toFixed(1)}px)`; v.style.opacity = I(p, [0, 0.35], [0, 1]); }
    },
  });

  T('focus', {
    desc: 'Rack focus: the chapter breathes out of focus and brightens into paper, the next one sharpens back in',
    from: 'focus-pull,zoom-blur', dur: 0.34, html: '',
    draw(el, p, ph, v) {
      if (ph === 'in') { v.style.transform = `scale(${1 + 0.05 * p})`; v.style.filter = `blur(${(16 * p * p).toFixed(1)}px) brightness(${1 + 0.3 * p})`; v.style.opacity = I(p, [0.55, 1], [1, 0]); }
      else { v.style.transform = `scale(${0.97 + 0.03 * p})`; v.style.filter = `blur(${(16 * (1 - p) * (1 - p)).toFixed(1)}px) brightness(${1 + 0.25 * (1 - p)})`; v.style.opacity = I(p, [0, 0.4], [0, 1]); }
    },
  });

  T('lens-punch', {
    desc: 'Lens punch-in: a hard cut hidden in a fast zoom with camera shake and a brief blue/orange colour split',
    from: 'lens-zoom', dur: 0.24, html: '<div class="fx-full" style="background:' + C.paper + ';opacity:0"></div>',
    draw(el, p, ph, v, t) {
      const k = ph === 'in' ? p : 1 - p; // intensita'
      const sc = ph === 'in' ? 1 + 0.32 * E.inExpo(lin(p)) : 1 + 0.22 * (1 - E.outExpo(lin(p)));
      const sx = U.noise(t * 40, 'lx') * 16 * k, sy = U.noise(t * 40, 'ly') * 16 * k, sp = (9 * k).toFixed(1);
      v.style.transform = `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) scale(${sc})`;
      v.style.filter = k > 0.02 ? `blur(${(4 * k).toFixed(1)}px) drop-shadow(${sp}px 0 0 rgba(255,106,19,.55)) drop-shadow(-${sp}px 0 0 rgba(31,79,209,.55))` : '';
      el.firstChild.style.opacity = (ph === 'in' ? I(p, [0.75, 1], [0, 0.9]) : I(p, [0, 0.3], [0.9, 0])).toFixed(2);
    },
  });

  T('slide', {
    desc: 'Slide swap: the chapter is shoved off to the left and the next one springs in from the right',
    from: 'slide-swap,cue-word', dur: 0.4, html: '',
    draw(el, p, ph, v) {
      if (ph === 'in') { v.style.transform = `translateX(${(-105 * Math.pow(lin(p), 2.2)).toFixed(2)}%)`; return; }
      const q = lin(p), s = U.spring(q * 0.4, { damping: 15, stiffness: 260, mass: 0.6 });
      v.style.transform = `translateX(${(65 * (1 - s)).toFixed(2)}%)`; v.style.opacity = 1 - Math.pow(1 - Math.min(1, q / 0.35), 2);
    },
  });

  T('settle', {
    desc: 'Spring settle: the chapter shrinks away as one block, the stage stays empty for a beat, the next drops in from above and lands with a spring',
    from: 'spring-settle', dur: 0.42, html: '',
    draw(el, p, ph, v) {
      v.style.transformOrigin = '50% 45%';
      if (ph === 'in') { v.style.transform = `scale(${1 - 0.3 * p})`; v.style.opacity = I(p, [0.2, 0.8], [1, 0]); return; }
      const q = lin(p), s = U.spring(Math.max(0, q - 0.25) * 0.42, { damping: 12, stiffness: 300, mass: 0.5 });
      v.style.transform = `translateY(${(-420 * (1 - s)).toFixed(1)}px)`; v.style.opacity = q < 0.25 ? 0 : cl((q - 0.25) / 0.2);
    },
  });

  const pose = (x, n) => Math.min(n - 1, Math.floor(cl(x) * n)) / (n - 1);
  T('page-turn', {
    desc: 'Page turn: the chapter lifts away like a notebook page in stop-motion poses, the next page drops into place the same way',
    from: 'page-turn', dur: 0.42, html: '',
    draw(el, p, ph, v) {
      const q = lin(p), ps = ph === 'in' ? pose(q * q * q, 8) : pose(Math.pow(1 - q, 2.4), 7);
      v.style.transformOrigin = '18% 100%';
      v.style.transform = `translateY(${(-ps * H * 1.28).toFixed(1)}px) rotate(${(-7 * ps).toFixed(2)}deg)`;
    },
  });

  // ---------------------------------------------------------------- TAGLI E TENDE
  T('diagonal', {
    desc: 'Diagonal split: a slanted seam with an orange edge slides across, pushing the chapter out and then revealing the next one behind it',
    from: 'diagonal-split', dur: 0.36,
    html: `<svg class="fx-full" viewBox="0 0 ${W} ${H}"><polygon fill="${C.orange}"/><polygon fill="${C.ink}"/></svg>`,
    draw(el, p, ph, v) {
      const k = 560, s = (W + k + 60) * (1 - p);
      if (ph === 'in') { v.style.clipPath = poly([[0, 0], [s, 0], [s - k, H], [0, H]]); v.style.transform = `translateX(${(-50 * p).toFixed(1)}px)`; }
      else v.style.clipPath = poly([[s, 0], [W + 10, 0], [W + 10, H], [s - k, H]]);
      const [a, b] = el.querySelectorAll('polygon');
      a.setAttribute('points', svgPts([[s, 0], [s + 26, 0], [s + 26 - k, H], [s - k, H]]));
      b.setAttribute('points', svgPts([[s + 26, 0], [s + 34, 0], [s + 34 - k, H], [s + 26 - k, H]]));
    },
  });

  T('card-swipe', {
    desc: 'Card swipe: a tilted navy card with an orange frame swipes across, covers the chapter and carries on to reveal the next',
    from: 'card-swipe-cover', dur: 0.36, html: '<div class="cd"></div>',
    draw(el, p, ph, v) {
      const cd = el.firstChild;
      if (ph === 'in') { cd.style.transform = `translateX(${(1700 * (1 - p)).toFixed(1)}px) rotate(${(14 * (1 - p)).toFixed(2)}deg)`; v.style.transform = `scale(${1 - 0.05 * p})`; }
      else { cd.style.transform = `translateX(${(-1800 * p).toFixed(1)}px) rotate(${(-14 * p).toFixed(2)}deg)`; v.style.transform = `scale(${0.95 + 0.05 * p})`; }
    },
  });

  // cartoon iris: si chiude su un punto, lo tiene un attimo, poi si apre sul capitolo nuovo
  T('iris-dot', {
    desc: 'Cartoon iris: a navy iris closes onto the chapter, lingers as a small dot, snaps shut and opens on the next one',
    from: 'iris-wipe', dur: 0.45, html: '<div class="fx-hole"></div>',
    draw(el, p, ph) {
      const q = lin(p), hold = 120, COVER = 1250;
      const r = ph === 'in' ? (q >= 0.97 ? 0 : hold * (1 - Math.pow(q, 3)) + (COVER - hold) * Math.pow(1 - q, 5)) : COVER * E.inCubic(q);
      hole(el.firstChild, 540, 800, Math.max(0, r));
    },
  });

  T('rings', {
    desc: 'Ring burst: concentric peach, orange, blue and navy discs burst from the centre; the next chapter opens out of the last ring with an orange rim',
    from: 'ring-burst,ring-cut,bloom-ring,smoke-dissolve', dur: 0.4,
    html: [C.mark, C.orange, C.blue, C.ink].map(c => `<div class="dk" style="background:${c}"></div>`).join('') + '<div class="fx-hole"></div>',
    draw(el, p, ph) {
      const dk = el.querySelectorAll('.dk'), h = el.querySelector('.fx-hole'), q = lin(p);
      if (ph === 'in') { h.style.display = 'none'; dk.forEach((d, i) => { const s = E.outCubic((q - i * 0.16) / 0.52); d.style.display = 'block'; d.style.transform = `scale(${s.toFixed(4)})`; }); return; }
      dk.forEach(d => d.style.display = 'none'); h.style.display = 'block'; hole(h, 540, 860, 1300 * E.inOutCubic(q));
    },
  });

  T('shape-cut', {
    desc: 'Shape cut: an orange rounded square spins and swells to cover the chapter, then shrinks into a small mark next to the new chapter label',
    from: 'shape-cut,hot-slab-morph', dur: 0.4, html: '<div class="sh"></div>',
    draw(el, p, ph) {
      const s = el.firstChild, q = lin(p);
      if (ph === 'in') { s.style.left = '540px'; s.style.top = '960px'; s.style.opacity = 1; s.style.transform = `rotate(${(45 * (1 - p)).toFixed(2)}deg) scale(${(7 * E.inCubic(q)).toFixed(4)})`; return; }
      const m = E.inOutCubic(q);
      s.style.left = px(U.lerp(540, 128, m)); s.style.top = px(U.lerp(960, 282, m));
      s.style.transform = `rotate(${(-90 * m).toFixed(2)}deg) scale(${U.lerp(7, 0.06, E.outCubic(q)).toFixed(4)})`;
      s.style.opacity = I(q, [0.75, 1], [1, 0]);
    },
  });

  const NS = 12;
  T('blinds', {
    desc: 'Venetian blinds: the chapter splits into horizontal slats that turn edge-on in a staggered ripple; the next one turns back in',
    from: 'venetian-blinds', dur: 0.42,
    html: `<svg width="0" height="0" style="position:absolute"><defs><clipPath id="fx-blinds-cp" clipPathUnits="userSpaceOnUse">${rep(NS, () => '<rect x="0" width="' + W + '"/>')}</clipPath></defs></svg>` + rep(NS, () => '<div class="sd"></div>'),
    draw(el, p, ph, v) {
      const q = lin(p), rs = el.querySelectorAll('rect'), sd = el.querySelectorAll('.sd'), hh = H / NS, stg = 0.55;
      for (let i = 0; i < NS; i++) {
        const u = E.inOutCubic((q - (i / (NS - 1)) * stg) / (1 - stg)), open = ph === 'in' ? 1 - u : u; // quota aperta della lamella
        const h = hh * open + (open > 0 ? 0.6 : 0), y = i * hh + (hh - h) / 2;
        rs[i].setAttribute('y', y.toFixed(1)); rs[i].setAttribute('height', Math.max(0, h).toFixed(1));
        sd[i].style.top = px(y); sd[i].style.height = px(Math.max(0, h)); sd[i].style.opacity = (0.22 * (1 - open) * (open > 0 ? 1 : 0)).toFixed(3);
      }
      v.style.clipPath = 'url(#fx-blinds-cp)';
      if (ph === 'out') v.style.transform = `scale(${1.05 - 0.05 * E.outCubic(q)})`;
    },
  });

  // ---------------------------------------------------------------- BANDE, BARRE, TESSERE
  const BC = [C.ink, C.blue, C.ink, C.orange, C.ink, C.blue, C.ink, C.blue];
  T('bands', {
    desc: 'Band shift: eight horizontal navy, blue and orange bands slide across in a stagger, alternating sides, and swap the chapters',
    from: 'band-shift,band-open', dur: 0.4,
    html: BC.map((c, i) => `<div class="b" style="top:${i * 240}px;background:${c}"></div>`).join(''),
    draw(el, p, ph) {
      const q = lin(p);
      el.querySelectorAll('.b').forEach((b, i) => { const dir = i % 2 ? 1 : -1, u = E.inOutCubic((q - i * 0.055) / (1 - 7 * 0.055));
        b.style.transform = `translateX(${(ph === 'in' ? dir * 100 * (1 - u) : -dir * 100 * u).toFixed(2)}%)`; });
    },
  });

  T('columns', {
    desc: 'Column slide: six vertical columns drop and rise in alternation, staggered, to swap the chapters',
    from: 'column-slide', dur: 0.4,
    html: rep(6, i => `<div class="c" style="left:${i * 180}px;background:${i % 3 === 1 ? C.blue : C.ink}"></div>`),
    draw(el, p, ph) {
      const q = lin(p);
      el.querySelectorAll('.c').forEach((c, i) => { const dir = i % 2 ? 1 : -1, u = E.inOutCubic((q - i * 0.07) / (1 - 5 * 0.07));
        c.style.transform = `translateY(${(ph === 'in' ? dir * 100 * (1 - u) : -dir * 100 * u).toFixed(2)}%)`; });
    },
  });

  const BW = [150, 90, 230, 60, 190, 120, 270, 80, 210, 140, 250, 110, 180], BK = [C.orange, C.ink, C.blue, C.mark, C.ink, C.orange, C.blue, C.ink, C.blue, C.ink, C.orange, C.blue, C.ink];
  T('bars', {
    desc: 'Colour bars: slanted bars of different widths in the brand colours whip across the frame and swap the chapters',
    from: 'color-bars', dur: 0.36,
    html: '<div class="wrap">' + (() => { let x = 0; return BW.map((w, i) => { const s = `<div class="b" style="left:${x}px;width:${w + 2}px;background:${BK[i]}"></div>`; x += w; return s; }).join(''); })() + '</div>',
    draw(el, p, ph) {
      const q = lin(p);
      el.querySelectorAll('.b').forEach((b, i) => { const u = E.inOutCubic((q - i * 0.03) / (1 - 12 * 0.03));
        b.style.transform = `translateX(${(ph === 'in' ? 2400 * (1 - u) : -2600 * u).toFixed(1)}px)`; });
    },
  });

  // griglia con un'onda diagonale: quadrati (tiles) o dischi a mezzatinta (dots)
  const grid = (cw, chh, cols, rows) => { const a = []; for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) a.push([i, j, cw * (i + 0.5), chh * (j + 0.5)]); return a; };
  const TG = grid(180, 180, 6, 11);
  T('tiles', {
    desc: 'Tile wave: a diagonal wave grows a grid of navy tiles over the chapter and shrinks them away on the next one',
    from: 'tile-wave,grid-wave', dur: 0.42,
    html: TG.map(([i, j, x, y]) => `<div class="q" style="left:${x}px;top:${y}px;background:${R('tl', i * 31 + j) < 0.14 ? C.blue : C.ink}"></div>`).join(''),
    draw(el, p, ph) {
      const q = lin(p);
      el.querySelectorAll('.q').forEach((d, k) => { const [i, j] = TG[k], dl = (i + j) / 15 * 0.5, u = E.inOutCubic((q - dl) / 0.5), s = ph === 'in' ? u : 1 - u;
        d.style.transform = `scale(${s.toFixed(3)}) rotate(${((1 - s) * 45).toFixed(1)}deg)`; d.style.borderRadius = ((1 - s) * 40).toFixed(1) + '%'; });
    },
  });

  const DG = grid(120, 120, 9, 16);
  T('dots', {
    desc: 'Halftone cut: a diagonal wave of blue and orange halftone dots swells over the chapter and shrinks away on the next one',
    from: 'halftone-cut,disc-pop', dur: 0.42,
    html: DG.map(([i, j, x, y]) => `<div class="q" style="left:${x}px;top:${y}px;background:${R('dt', i * 37 + j) < 0.18 ? C.orange : C.blue}"></div>`).join(''),
    draw(el, p, ph) {
      const q = lin(p);
      el.querySelectorAll('.q').forEach((d, k) => { const [i, j] = DG[k], dl = ((8 - i) + (15 - j)) / 23 * 0.5, u = E.inOutCubic((q - dl) / 0.5), s = ph === 'in' ? u : 1 - u;
        d.style.transform = `scale(${s.toFixed(3)})`; });
    },
  });

  // ---------------------------------------------------------------- DISSOLVENZE (canvas)
  const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  T('dither', {
    desc: 'Dither dissolve: a field of square navy and blue pixels (ordered dither) eats the chapter and then thins out onto the next one',
    from: 'dither-dissolve,particle-dissolve', dur: 0.4,
    html: `<canvas width="${W}" height="${H}" class="fx-full"></canvas>`,
    draw(el, p, ph, v) {
      const cv = el.firstChild, g = cv.getContext('2d'), S = 24, q = lin(p); g.clearRect(0, 0, W, H);
      for (let y = 0; y < H / S; y++) for (let x = 0; x < W / S; x++) {
        const th = 0.55 * (BAY[(y % 4) * 4 + (x % 4)] + 0.5) / 16 + 0.45 * hr(y * 64 + x, 1) * 0.98;
        const on = ph === 'in' ? th < q : th >= q; if (!on) continue;
        g.fillStyle = hr(y * 64 + x, 2) < 0.2 ? C.blue : C.ink; g.fillRect(x * S, y * S, S, S);
      }
      if (ph === 'in') v.style.filter = `blur(${(3 * q).toFixed(1)}px)`;
    },
  });

  // campo di rumore (fisso) per burn: calcolato una volta sola
  let NF = null; const NW = 135, NH = 240;
  const field = () => { if (NF) return NF; NF = new Float32Array(NW * NH);
    const vn = (x, y, s) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), w = yf * yf * (3 - 2 * yf), r = (a, b) => R(s, a * 1013 + b);
      return U.lerp(U.lerp(r(xi, yi), r(xi + 1, yi), u), U.lerp(r(xi, yi + 1), r(xi + 1, yi + 1), u), w); };
    for (let y = 0; y < NH; y++) for (let x = 0; x < NW; x++) { const n = 0.55 * vn(x / 18, y / 18, 'b1') + 0.3 * vn(x / 8, y / 8, 'b2') + 0.15 * vn(x / 3, y / 3, 'b3');
      NF[y * NW + x] = 0.5 * (1 - y / NH) + 0.5 * n; }
    return NF; };
  T('burn', {
    desc: 'Burn: a ragged noise front with an orange ember edge burns the chapter to navy from the bottom up, then burns the navy away onto the next one',
    from: 'ember-burn,perlin-dissolve,grain-dissolve', dur: 0.42,
    html: `<canvas width="${W}" height="${H}" class="fx-full"></canvas>`,
    draw(el, p, ph) {
      const f = field(), cv = el.firstChild, g = cv.getContext('2d'), q = lin(p);
      if (!el._sm) { el._sm = document.createElement('canvas'); el._sm.width = NW; el._sm.height = NH; }
      const sg = el._sm.getContext('2d'), im = sg.createImageData(NW, NH), d = im.data, B = 0.07;
      const ink = [11, 31, 58], org = [255, 106, 19];
      const thr = ph === 'in' ? q * 1.14 : q * 1.14 - B;
      for (let i = 0; i < NW * NH; i++) { const v = f[i]; let c = null;
        if (ph === 'in') { if (v < thr - B) c = ink; else if (v < thr) c = org; }
        else { if (v > thr) c = ink; else if (v > thr - B) c = org; }
        if (c) { d[i * 4] = c[0]; d[i * 4 + 1] = c[1]; d[i * 4 + 2] = c[2]; d[i * 4 + 3] = 255; } }
      sg.putImageData(im, 0, 0); g.clearRect(0, 0, W, H); g.imageSmoothingEnabled = true; g.drawImage(el._sm, 0, 0, W, H);
    },
  });

  const GLY = '01234567890%+-=#:.';
  T('ascii', {
    desc: 'Data dissolve: a field of navy cells carrying mono digits and symbols spreads over the chapter and drifts away on the next one',
    from: 'ascii-dissolve', dur: 0.42,
    html: `<canvas width="${W}" height="${H}" class="fx-full"></canvas>`,
    draw(el, p, ph, v, t) {
      const cv = el.firstChild, g = cv.getContext('2d'), CW = 36, CH = 56, q = lin(p); g.clearRect(0, 0, W, H);
      g.font = '700 34px Mono'; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (let y = 0; y < Math.ceil(H / CH); y++) for (let x = 0; x < W / CW; x++) {
        const k = y * 40 + x, th = 0.6 * hr(k, 3) + 0.4 * (y / (H / CH));
        const on = ph === 'in' ? th < q * 1.02 : th >= q; if (!on) continue;
        g.fillStyle = C.ink; g.fillRect(x * CW, y * CH, CW, CH);
        const ch = GLY[Math.floor(hr(k, 4) * GLY.length + t * 18 * (0.5 + hr(k, 5))) % GLY.length];
        g.fillStyle = hr(k, 6) < 0.12 ? C.orange : (hr(k, 6) < 0.4 ? C.blue : '#2A3E5C'); g.fillText(ch, x * CW + CW / 2, y * CH + CH / 2 + 2);
      }
    },
  });

  T('melt', {
    desc: 'Melt: navy columns drip down over the chapter at different speeds, then slide down column by column to drop the next one in',
    from: 'pixel-sort', dur: 0.42,
    html: rep(26, i => `<div class="c" style="left:${(i * 1080 / 26 - 0.5).toFixed(1)}px"></div>`),
    draw(el, p, ph, v) {
      const q = lin(p);
      el.querySelectorAll('.c').forEach((c, i) => { const r = R('ml', i), u = E.inOutCubic((q - 0.4 * r) / 0.6);
        c.style.transform = ph === 'in' ? `scaleY(${(u * 1.03).toFixed(4)})` : `translateY(${(u * 104).toFixed(2)}%)`;
        c.style.borderRadius = ph === 'in' ? '0 0 21px 21px' : '21px 21px 0 0'; });
      if (ph === 'in') { v.style.transformOrigin = '50% 0'; v.style.transform = `scaleY(${1 + 0.05 * q})`; }
    },
  });

  // ---------------------------------------------------------------- FORME E LUCE (versione brand: niente bagliori)
  const SH = { c: '<circle cx="50" cy="50" r="48"/>', s: '<rect x="4" y="4" width="92" height="92" rx="16"/>', t: '<polygon points="50,2 98,92 2,92"/>', p: '<polygon points="36,0 64,0 64,36 100,36 100,64 64,64 64,100 36,100 36,64 0,64 0,36 36,36"/>' };
  const SCN = 54, SCC = [C.ink, C.blue, C.ink, C.orange, C.blue, C.ink];
  T('scatter', {
    desc: 'Shape scatter: a field of circles, squares, triangles and plus signs in the brand colours swells over the cut and scatters away',
    from: 'icon-scatter,gravity-pile', dur: 0.42,
    html: '<div class="fx-full bgf" style="background:' + C.ink + '"></div>' + rep(SCN, i => { const k = 'cstp'[Math.floor(R('sk', i) * 4)];
      return `<svg class="s" viewBox="0 0 100 100" style="left:${((i % 6) + 0.2 + 0.6 * R('sx', i)) * 180}px;top:${(Math.floor(i / 6) + 0.2 + 0.6 * R('sy', i)) * 213}px;fill:${SCC[i % 6]}">${SH[k]}</svg>`; }),
    draw(el, p, ph) {
      const q = lin(p), bg = el.querySelector('.bgf');
      bg.style.opacity = ph === 'in' ? I(q, [0.85, 1], [0, 1]) : I(q, [0.05, 0.3], [1, 0]);
      el.querySelectorAll('.s').forEach((s, i) => { const dl = R('sd', i) * 0.35, u = ph === 'in' ? E.outBack((q - dl) / 0.6) : 1 - E.inCubic((q - dl * 0.6) / 0.65);
        const ang = (R('sr', i) - 0.5) * 240 * (1 - u), dx = ph === 'out' ? ((i % 6) - 2.5) * 70 * (1 - u) : 0, dy = ph === 'out' ? (Math.floor(i / 6) - 4) * 50 * (1 - u) : 0;
        s.style.transform = `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) rotate(${ang.toFixed(1)}deg) scale(${Math.max(0, u * 1.05).toFixed(3)})`; });
    },
  });

  T('wash', {
    desc: 'Warm wash: soft peach blots drift across the frame and blow out to plain paper at the cut, then cool off on the next chapter',
    from: 'light-leak,flash-sweep,beam-sweep', dur: 0.42,
    html: [0, 1, 2].map(i => `<div class="bl" style="background:radial-gradient(circle,rgba(255,201,163,${[0.85, 0.6, 0.7][i]}) 0,rgba(255,201,163,0) 68%)"></div>`).join('') + `<div class="fx-full pf" style="background:${C.paper}"></div>`,
    draw(el, p, ph, v) {
      const q = lin(p), g = ph === 'in' ? q * 0.5 : 0.5 + q * 0.5;
      el.querySelectorAll('.bl').forEach((b, i) => { b.style.left = px(-500 + g * 2100 + [0, -260, 180][i]); b.style.top = px([500, 1200, 1700][i] - g * 300); b.style.opacity = Math.sin(Math.PI * g).toFixed(3); });
      el.querySelector('.pf').style.opacity = (ph === 'in' ? I(q, [0.35, 1], [0, 1], { ease: E.inCubic }) : I(q, [0, 0.65], [1, 0])).toFixed(3);
      v.style.filter = `blur(${(ph === 'in' ? 6 * q : 6 * (1 - q)).toFixed(1)}px)`;
    },
  });

  T('slit', {
    desc: 'Hairline: the chapter collapses into an orange hairline across the frame, which then opens like a slit onto the next chapter',
    from: 'hairline-open,slit-reveal,light-burn-to-line,band-open', dur: 0.4,
    html: '<div class="ln"></div><div class="ln"></div>',
    draw(el, p, ph, v) {
      const q = lin(p), [a, b] = el.querySelectorAll('.ln'), cy = 900;
      if (ph === 'in') { const s = 1 - Math.pow(q, 4); v.style.transformOrigin = `50% ${cy}px`; v.style.transform = `scaleY(${Math.max(0.003, s).toFixed(4)})`;
        a.style.top = b.style.top = px(cy); a.style.opacity = b.style.opacity = I(q, [0.55, 0.85], [0, 1]); a.style.transform = b.style.transform = `scaleX(${I(q, [0.5, 1], [0.2, 1]).toFixed(3)})`; return; }
      const o = E.inOutCubic((q - 0.12) / 0.88), top = cy * (1 - o), bot = cy + (H - cy) * o;
      v.style.clipPath = `inset(${px(top)} 0 ${px(H - bot)} 0)`;
      a.style.top = px(top); b.style.top = px(bot); a.style.transform = b.style.transform = ''; a.style.opacity = b.style.opacity = I(q, [0.6, 1], [1, 0]);
    },
  });

  T('caret', {
    desc: 'Caret wipe: a blue text caret sweeps across, wiping the chapter away behind it and then typing the next one into view',
    from: 'caret-wipe,caret-collapse', dur: 0.36, html: '<div class="cr"></div>',
    draw(el, p, ph, v) {
      const x = p * 100; el.firstChild.style.left = (x * W / 100).toFixed(1) + 'px';
      if (ph === 'in') { v.style.clipPath = `inset(0 0 0 ${x.toFixed(2)}%)`; v.style.transform = `translateY(${(-6 * p).toFixed(1)}px)`; v.style.filter = `blur(${(4 * p).toFixed(1)}px)`; }
      else { v.style.clipPath = `inset(0 ${(100 - x).toFixed(2)}% 0 0)`; v.style.filter = `blur(${(3 * (1 - p)).toFixed(1)}px)`; }
    },
  });

  // ---------------------------------------------------------------- STRAPPI E PORTE
  const TEAR = (() => { const a = []; for (let y = -40; y <= H + 40; y += 32) a.push([540 + (R('tr', y) - 0.5) * 44 + Math.sin(y / 170) * 24, y]); return a; })();
  T('tear', {
    desc: 'Paper tear: the chapter rips down the middle with fibrous paper edges and both halves fling apart over navy; the navy then tears open onto the next one',
    from: 'paper-tear', dur: 0.42,
    html: '<div class="fx-full bgt" style="background:' + C.ink + '"></div>' + rep(2, () => '<div class="hf"><div class="rim" style="background:' + C.paper + '"></div><div class="c"></div></div>'),
    draw(el, p, ph, v) {
      const q = lin(p), hs = el.querySelectorAll('.hf'), m = E.inCubic(q);
      el.querySelector('.bgt').style.display = ph === 'in' ? 'block' : 'none';
      hs.forEach((h, k) => { const sg = k ? 1 : -1, rim = h.firstChild, c = h.lastChild;
        const edge = TEAR.map(([x, y]) => [x, y]), edgeR = TEAR.map(([x, y]) => [x - sg * (9 + 6 * R('fb', y)), y]);
        const side = k ? [[W + 40, H + 40], [W + 40, -40]] : [[-40, H + 40], [-40, -40]];
        c.style.clipPath = poly(edge.concat(side)); rim.style.clipPath = poly(edgeR.concat(side));
        c.style.background = ph === 'in' ? C.paper : C.ink;
        if (ph === 'in') { c.replaceChildren(cloneView(v)); } else c.replaceChildren();
        h.style.transformOrigin = k ? '100% 100%' : '0 100%';
        h.style.transform = `translateX(${(sg * 760 * m).toFixed(1)}px) translateY(${(60 * m).toFixed(1)}px) rotate(${(sg * 7 * m).toFixed(2)}deg)`; });
      if (ph === 'in') v.style.opacity = 0;
    },
  });

  T('doors', {
    desc: 'Gate: two navy doors with orange edges slam shut, their giant letters meeting as GG, then swing open onto the next chapter',
    from: 'letter-gate,band-open', dur: 0.38,
    html: '<div class="d l"><span>G</span></div><div class="d r"><span>G</span></div>',
    draw(el, p, ph, v) {
      const q = lin(p), [l, r] = el.querySelectorAll('.d'), o = ph === 'in' ? 1 - E.outCubic(q) : E.inOutCubic(q);
      l.style.transform = `translateX(${(-102 * o).toFixed(2)}%)`; r.style.transform = `translateX(${(102 * o).toFixed(2)}%)`;
      if (ph === 'out') v.style.transform = `scale(${1.06 - 0.06 * E.outCubic(q)})`;
    },
  });

  T('stinger', {
    desc: 'Broadcast stinger: three slanted slabs, orange, blue and navy, sweep in one after the other like a replay wipe and peel off onto the next chapter',
    from: 'replay-wipe,flash-sweep,window-trail', dur: 0.42,
    html: [C.orange, C.blue, C.ink].map(c => `<div class="s" style="background:${c}"></div>`).join(''),
    draw(el, p, ph) {
      const q = lin(p);
      el.querySelectorAll('.s').forEach((s, i) => { const u = ph === 'in' ? E.outCubic((q - i * 0.18) / 0.64) : E.inCubic((q - (2 - i) * 0.18) / 0.64);
        const x = ph === 'in' ? 1700 * (1 - u) : -2900 * u; s.style.transform = `translateX(${x.toFixed(1)}px) skewX(-18deg)`; });
    },
  });

  T('strobe', {
    desc: 'Strobe: a quick flicker of solid navy, orange and blue frames between the two chapters, landing clean on the next one',
    from: 'strobe-montage', dur: 0.4, html: '<div class="fx-full"></div>',
    draw(el, p, ph, v, t) {
      const q = lin(p), d = el.firstChild, k = Math.floor(t * 14), cols = [C.ink, C.orange, C.blue];
      const solid = ph === 'in' ? (q > 0.88 || (q > 0.25 && k % 2 === 0)) : (q < 0.12 || (q < 0.7 && k % 2 === 0));
      d.style.display = solid ? 'block' : 'none'; d.style.background = (ph === 'in' && q > 0.88) || (ph === 'out' && q < 0.12) ? C.ink : cols[Math.floor(k / 2) % 3];
      v.style.transform = `scale(${ph === 'in' ? 1 + 0.06 * q : 1.06 - 0.06 * q})`;
    },
  });

  // ---------------------------------------------------------------- TUNNEL, VORTICE, ONDA, TELO
  const NL = 64;
  T('speed-lines', {
    desc: 'Speed lines: radial streaks stretch from the centre while the camera dives into the chapter, a paper flash, then the next one lands',
    from: 'hyperspace,shader-spiral-pass,ripple-zoom', dur: 0.4,
    html: `<svg class="fx-full" viewBox="0 0 ${W} ${H}">${rep(NL, i => `<line stroke="${i % 5 === 0 ? C.orange : i % 2 ? C.blue : C.ink}" stroke-linecap="round"/>`)}</svg><div class="fl"></div>`,
    draw(el, p, ph, v) {
      const q = lin(p), g = ph === 'in' ? q : 1 + q, cx = 540, cy = 880;
      el.querySelectorAll('line').forEach((l, i) => { const a = (i / NL) * 2 * Math.PI + R('sa', i) * 0.09, r0 = 90 + R('sr', i) * 520;
        const r1 = r0 * (1 + 2.2 * g * g), r2 = r1 + 40 + 700 * Math.sin(Math.PI * g / 2) * (0.5 + R('sl', i));
        l.setAttribute('x1', (cx + Math.cos(a) * r1).toFixed(1)); l.setAttribute('y1', (cy + Math.sin(a) * r1).toFixed(1));
        l.setAttribute('x2', (cx + Math.cos(a) * r2).toFixed(1)); l.setAttribute('y2', (cy + Math.sin(a) * r2).toFixed(1));
        l.setAttribute('stroke-width', (3 + 7 * R('sw', i)).toFixed(1)); l.setAttribute('opacity', (ph === 'in' ? cl(q * 3) : 1 - q).toFixed(2)); });
      el.querySelector('.fl').style.opacity = (ph === 'in' ? I(q, [0.65, 1], [0, 1]) : I(q, [0, 0.45], [1, 0])).toFixed(3);
      v.style.transformOrigin = `${cx}px ${cy}px`;
      v.style.transform = `scale(${ph === 'in' ? 1 + 0.7 * E.inCubic(q) : 0.86 + 0.14 * E.outCubic(q)})`;
      v.style.filter = `blur(${(ph === 'in' ? 6 * q : 4 * (1 - q)).toFixed(1)}px)`;
    },
  });

  T('swirl', {
    desc: 'Pinwheel swirl: a navy and blue pinwheel spins open from the centre to cover the chapter, then a hole widens in its middle onto the next one',
    from: 'swirl-dissolve,shader-spiral-pass,shader-seam', dur: 0.42, html: '<div class="sw"></div>',
    draw(el, p, ph, v) {
      const q = lin(p), s = el.firstChild;
      if (ph === 'in') { s.style.transform = `rotate(${(220 * q).toFixed(1)}deg) scale(${E.inCubic(q).toFixed(4)})`; s.style.webkitMaskImage = s.style.maskImage = 'none'; v.style.transform = `rotate(${(-6 * q).toFixed(2)}deg) scale(${1 - 0.06 * q})`; return; }
      const r = 1300 * E.inCubic(q);
      s.style.transform = `rotate(${(220 + 160 * q).toFixed(1)}deg)`;
      s.style.webkitMaskImage = s.style.maskImage = `radial-gradient(circle at 50% 50%, transparent ${r.toFixed(0)}px, #000 ${(r + 2).toFixed(0)}px)`;
      v.style.transform = `rotate(${(6 * (1 - q)).toFixed(2)}deg) scale(${0.94 + 0.06 * q})`;
    },
  });

  const wavePath = (edge, A, ph0, up) => { // regione sotto (up=false) o sopra (up=true) un bordo a onda
    let d = up ? `M0,-20 L${W},-20 ` : `M0,${H + 20} L${W},${H + 20} `;
    for (let x = W; x >= 0; x -= 30) d += `L${x},${(edge + A * Math.sin(x / W * 2.6 * Math.PI + ph0)).toFixed(1)} `;
    return d + 'Z'; };
  T('wave', {
    desc: 'Wave wipe: a navy wave with a blue crest rolls up over the chapter and carries on upwards to uncover the next one',
    from: 'wave-wipe', dur: 0.42,
    html: `<svg class="fx-full" viewBox="0 0 ${W} ${H}"><path fill="${C.blue}"/><path fill="${C.ink}"/></svg>`,
    draw(el, p, ph, v, t) {
      const q = lin(p), [b, a] = el.querySelectorAll('path'), A = 70, G = 150, ph0 = t * 6;
      if (ph === 'in') { const e = (H + A + G) - (H + 2 * A + G) * E.inOutCubic(q); a.setAttribute('d', wavePath(e, A, ph0, false)); b.setAttribute('d', wavePath(e - G, A, ph0 + 1.2, false)); return; }
      const e = (H + A) - (H + 2 * A + G) * E.inOutCubic(q); a.setAttribute('d', wavePath(e, A, ph0, true)); b.setAttribute('d', wavePath(e + G, A, ph0 + 1.2, true));
      v.style.transform = `translateY(${(80 * (1 - E.outCubic(q))).toFixed(1)}px)`;
    },
  });

  // telo: cala dall'alto con l'orlo che ondeggia, poi viene strappato via dall'angolo in basso a destra (piega blu)
  const clipHalf = (pts, n, f, keepLess) => { const out = [], dd = q => q[0] * n[0] + q[1] * n[1] - f;
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], da = dd(a), db = dd(b), ina = keepLess ? da < 0 : da >= 0, inb = keepLess ? db < 0 : db >= 0;
      if (ina) out.push(a); if (ina !== inb) { const k = da / (da - db); out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]); } }
    return out; };
  T('cloth', {
    desc: 'Cloth: a navy sheet drops over the chapter with a fluttering hem, then is yanked away from the bottom-right corner, folding over to show its blue back',
    from: 'cloth-reveal', dur: 0.45,
    html: `<svg class="fx-full" viewBox="0 0 ${W} ${H}"><polygon fill="${C.ink}"/><polygon fill="${C.blue}"/></svg>`,
    draw(el, p, ph, v, t) {
      const q = lin(p), [a, b] = el.querySelectorAll('polygon');
      if (ph === 'in') { const e = -120 + (H + 260) * E.inOutCubic(q), A = 60 * (1 - q) + 6, pts = [[0, -10], [W, -10]];
        for (let x = W; x >= 0; x -= 40) pts.push([x, e + A * Math.sin(x / W * 3 * Math.PI + t * 9)]);
        a.setAttribute('points', svgPts(pts)); b.setAttribute('points', ''); return; }
      const rect = [[0, 0], [W, 0], [W, H], [0, H]], ang = 0.95 + 0.08 * Math.sin(t * 7), n = [Math.cos(ang) * 0.6, Math.sin(ang)]; const nl = Math.hypot(n[0], n[1]); n[0] /= nl; n[1] /= nl;
      const L = W * n[0] + H * n[1], f = L * (1 - 1.03 * E.inOutCubic(q));
      const keep = clipHalf(rect, n, f, true), gone = clipHalf(rect, n, f, false).map(([x, y]) => { const d = x * n[0] + y * n[1] - f; return [x - 2 * d * n[0], y - 2 * d * n[1]]; });
      a.setAttribute('points', svgPts(keep)); b.setAttribute('points', svgPts(gone));
    },
  });

  T('glitch', {
    desc: 'Glitch cut: the frame tears into displaced horizontal slices with a blue/orange split and blocky artefacts, and snaps back on the next chapter',
    from: 'glitch-cut,displacement', dur: 0.3,
    html: rep(5, () => '<div class="sl"></div>') + rep(7, () => '<div class="bk"></div>'),
    draw(el, p, ph, v, t) {
      const k = ph === 'in' ? E.inCubic(lin(p)) : 1 - E.outCubic(lin(p)), st = Math.floor(t * 24), sp = (10 * k).toFixed(1);
      const fx = `drop-shadow(${sp}px 0 0 rgba(255,106,19,.6)) drop-shadow(-${sp}px 0 0 rgba(31,79,209,.6))`;
      v.style.transform = `translateX(${((R('gx', st) - 0.5) * 40 * k).toFixed(1)}px)`; v.style.filter = k > 0.05 ? fx : '';
      el.querySelectorAll('.sl').forEach((s, i) => { const on = k > 0.15 && R('gs', st * 7 + i) < 0.4 + 0.6 * k;
        if (!on) { s.style.display = 'none'; s.replaceChildren(); return; }
        const y = R('gy', st * 11 + i) * 90, hh = 2 + R('gh', st * 13 + i) * 9 * (0.4 + k);
        s.style.display = 'block'; s.style.clipPath = `inset(${y.toFixed(1)}% 0 ${Math.max(0, 100 - y - hh).toFixed(1)}% 0)`; s.style.background = C.paper;
        s.style.transform = `translateX(${((R('go', st * 17 + i) - 0.5) * 260 * k).toFixed(1)}px)`; s.style.filter = fx; s.replaceChildren(cloneView(v)); s.firstChild.style.transform = v.style.transform; });
      el.querySelectorAll('.bk').forEach((b, i) => { const on = k > 0.45 && R('gb', st * 5 + i) < k * 0.8;
        b.style.display = on ? 'block' : 'none'; if (!on) return;
        b.style.left = px(R('bx', st * 3 + i) * 900); b.style.top = px(R('by', st * 3 + i) * 1800); b.style.width = px(40 + R('bw', st + i) * 260); b.style.height = px(10 + R('bh', st + i) * 60);
        b.style.background = [C.ink, C.blue, C.orange][i % 3]; });
    },
  });

  // ================================================================ CAMERA (sul capitolo)
  // Si usano le proprieta' singole translate/scale/rotate: si sommano al transform che il motore mette sull'area.
  const kids = col => [...col.children];
  K('dolly', {
    desc: 'Slow dolly-in on the chapter (about 3%), anchored top-left so the column never crosses the safe margins',
    from: 'dolly-zoom',
    draw(col, tc, D) { const k = E.inOutCubic(tc / Math.max(1, D)); col.style.transformOrigin = '0 0'; col.style.scale = (1 + 0.03 * k).toFixed(4); col.style.translate = `0 ${(-10 * k).toFixed(2)}px`; },
  });
  K('parallax', {
    desc: 'Parallax drift: label, title, subtitle and content slide at different speeds as the camera trucks slowly, for a sense of depth',
    from: 'parallax-depth,layered-cutout',
    draw(col, tc, D) { const k = E.inOutCubic(tc / Math.max(1, D)), sp = [4, 10, 7, 16];
      col.style.translate = ''; kids(col).forEach((c, i) => { const s = sp[Math.min(i, 3)]; c.style.translate = `${(s * k).toFixed(2)}px ${(-s * 0.8 * k).toFixed(2)}px`; }); },
  });
  K('slam', {
    desc: 'Impact: the chapter slams down from above with a squash, a damped camera jolt and a two-frame colour split',
    from: 'impact-shake',
    draw(col, tc) {
      const fall = 0.2, y = tc < fall ? -260 * (1 - E.inCubic(tc / fall)) : 0, a = tc - fall;
      const sq = a > 0 ? Math.exp(-a * 14) * Math.cos(a * 40) : 0, sh = a > 0 ? Math.exp(-a * 9) : 0;
      col.style.transformOrigin = '0 100%';
      col.style.translate = `${(U.noise(tc * 30, 'sx') * 12 * sh).toFixed(1)}px ${(y + U.noise(tc * 30, 'sy') * 16 * sh).toFixed(1)}px`;
      col.style.scale = `${(1 + 0.025 * sq).toFixed(4)} ${(1 - 0.05 * sq).toFixed(4)}`;
      col.style.opacity = tc < 0 ? 0 : cl(tc / 0.08);
      col.style.filter = a > 0 && a < 0.07 ? 'drop-shadow(7px 0 0 rgba(255,106,19,.55)) drop-shadow(-7px 0 0 rgba(31,79,209,.55))' : '';
    },
  });
  K('pile', {
    desc: 'Gravity pile: label, title, subtitle and content drop in one after the other and bounce as they land',
    from: 'gravity-pile',
    draw(col, tc) { col.style.translate = ''; kids(col).forEach((c, i) => { const u = E.outBounce((tc - i * 0.09) / 0.6); c.style.translate = `0 ${(-320 * (1 - u)).toFixed(1)}px`; }); },
  });
  K('assemble', {
    desc: 'Exploded view: the chapter parts start spread apart and offset, then spring together and click into place',
    from: 'exploded-view',
    draw(col, tc) { const off = [[-30, -90], [-15, -40], [15, 40], [30, 110]];
      col.style.translate = ''; kids(col).forEach((c, i) => { const s = U.spring(tc - i * 0.05, { damping: 13, stiffness: 140, mass: 0.8 }), o = off[Math.min(i, 3)];
        c.style.translate = `${(Math.max(0, o[0] * (1 - s))).toFixed(1)}px ${(o[1] * (1 - s)).toFixed(1)}px`; }); },
  });
  K('orbit', {
    desc: 'Turntable: the chapter swings in on a vertical hinge with perspective, then keeps a slow gentle sway',
    from: 'turntable,tiny-planet',
    draw(col, tc) { const s = U.spring(tc, { damping: 14, stiffness: 90, mass: 1 }), a = -32 * (1 - s) + 1.6 * Math.sin(tc * 0.9) * cl(tc / 1.5);
      col.style.transformOrigin = '0 50%'; col.style.transform = `perspective(1800px) rotateY(${a.toFixed(2)}deg)`; col.style.opacity = cl(tc / 0.15); },
  });
  K('depth', {
    desc: 'Depth push: the chapter parts arrive from slightly in front of the camera in layers, like a dolly through cut paper sheets',
    from: 'layered-cutout,dolly-zoom',
    draw(col, tc) { col.style.translate = ''; kids(col).forEach((c, i) => { const u = E.outCubic((tc - i * 0.08) / 0.7);
      c.style.transformOrigin = '0 0'; c.style.scale = (1 + 0.14 * (1 - u)).toFixed(4); c.style.filter = u < 1 ? `blur(${(5 * (1 - u)).toFixed(1)}px)` : ''; }); },
  });
})();
