// GG Motion — reel animati 1080x1920 in stile data-explainer
// Uso: node render.js reel.json timeline.json out.mp4 [--preview secondi,secondi,...]
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const [, , cfgPath, tlPath, outPath, flag, flagVal] = process.argv;
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const tl = JSON.parse(fs.readFileSync(tlPath, 'utf8'));
const base = path.dirname(path.resolve(cfgPath));
const NST = cfg.style || {};
const FPS = cfg.fps || (NST.fps60 ? 60 : 30);
const LOGO_SVG = (() => { try { return fs.readFileSync(path.join(__dirname, '..', '..', 'brand', 'gg-simbolo.svg'), 'utf8').replace(/ width="\d+" height="\d+"/, ''); } catch (e) { return ''; } })();
const rel = p => (path.isAbsolute(p) ? p : path.join(base, p));

const font = (pkg, file) => 'data:font/woff2;base64,' +
  fs.readFileSync(path.join(__dirname, 'node_modules/@fontsource', pkg, 'files', file)).toString('base64');
const imgData = p => {
  const ext = path.extname(p).slice(1).toLowerCase().replace('jpg', 'jpeg');
  return `data:image/${ext};base64,${fs.readFileSync(rel(p)).toString('base64')}`;
};
// immagini incorporate come data URI
const walk = o => { if (o && typeof o === 'object') for (const k in o) { if ((k === 'photo' || k === 'src' || k === 'logo') && typeof o[k] === 'string' && !o[k].startsWith('data:')) o[k] = imgData(o[k]); else if (k === 'logos' && Array.isArray(o[k])) o[k] = o[k].map(p => p.startsWith('data:') ? p : imgData(p)); else walk(o[k]); } };
walk(cfg);

const CSS = `
@font-face{font-family:Inter;font-weight:500;src:url(${font('inter', 'inter-latin-500-normal.woff2')})}
@font-face{font-family:Inter;font-weight:700;src:url(${font('inter', 'inter-latin-700-normal.woff2')})}
@font-face{font-family:Inter;font-weight:800;src:url(${font('inter', 'inter-latin-800-normal.woff2')})}
@font-face{font-family:Inter;font-weight:900;src:url(${font('inter', 'inter-latin-900-normal.woff2')})}
@font-face{font-family:Mono;font-weight:400;src:url(${font('jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff2')})}
@font-face{font-family:Mono;font-weight:700;src:url(${font('jetbrains-mono', 'jetbrains-mono-latin-700-normal.woff2')})}
@font-face{font-family:Anton;font-weight:400;src:url(${font('anton', 'anton-latin-400-normal.woff2')})}
@font-face{font-family:Hand;font-weight:700;src:url(${font('caveat', 'caveat-latin-700-normal.woff2')})}
:root{--paper:#F4F1EA;--ink:#0B1F3A;--blue:#1F4FD1;--orange:#FF6A13;--gray:#B4AEA2;--line:#DDD7CB;--mark:#FFC9A3}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;background:var(--paper);overflow:hidden}
body{font-family:Inter;color:var(--ink)}
.view{position:absolute;inset:0;display:none}
.prog{display:none}
.prog i{flex:1;height:6px;background:var(--line);position:relative;overflow:hidden}
.prog i b{position:absolute;left:0;top:0;bottom:0;background:var(--ink)}
.prog i.cur b{background:var(--orange)}
.col{position:absolute;left:120px;right:120px;top:262px;bottom:760px;display:flex;flex-direction:column}
.chn{font:700 26px Mono;color:var(--orange);letter-spacing:.08em}
.ttl{margin-top:10px;margin-right:130px;font:400 88px/1.02 Anton;text-transform:uppercase;letter-spacing:.005em}
.sub{margin-top:14px;font:400 25px Mono;color:#6E6A62}
.area{flex:1;min-height:0;margin-top:40px;display:flex;flex-direction:column;justify-content:center;gap:34px}
.kar{position:absolute;left:120px;width:715px;top:1230px;text-align:left;font:700 44px/1.25 Inter;z-index:5}
.kar span{color:var(--gray);padding:0 2px}
.kar span.on{color:var(--ink)}
.kar span.hi.on{background:linear-gradient(transparent 12%,var(--mark) 12%,var(--mark) 92%,transparent 92%)}
.foot{position:absolute;right:120px;top:258px;width:112px;height:112px;z-index:6}.foot svg{width:100%;height:100%;display:block}
.foot .gg{font:900 44px Inter;letter-spacing:-.02em}.foot .gg em{font-style:normal;color:var(--orange)}
.foot .h{font:400 24px Mono;color:#6E6A62}
/* cover */
.cv-t{position:absolute;left:120px;right:250px;top:270px;font:400 136px/0.98 Anton;text-transform:uppercase}
.cv-t .l{display:block}
.cv-t .l.hi span{color:var(--orange);background:linear-gradient(transparent 8%,var(--mark) 8%,var(--mark) 94%,transparent 94%);padding:0 6px;margin-left:-6px}
.cv-s{position:absolute;left:122px;right:120px;font:600 40px/1.3 Inter}
.cv-ph{position:absolute;left:0;right:0;top:660px;height:440px;overflow:hidden}
.cv-ph .disc{position:absolute;left:50%;top:0;height:100%;aspect-ratio:1;transform:translateX(-50%);border-radius:50%;background:var(--orange)}
.cv-ph img{position:absolute;left:50%;bottom:0;height:100%;transform:translateX(-50%);filter:drop-shadow(14px 8px 0 var(--blue))}
.cv-ph img.box{height:auto;width:760px;bottom:auto;top:60px;border-radius:24px;box-shadow:18px 14px 0 var(--blue)}
.note{position:absolute;font:700 64px Hand;color:var(--orange);white-space:nowrap}
/* elementi */
.el{opacity:0}
.big{white-space:nowrap;font:400 220px/0.95 Anton;color:var(--blue)}
.big-l{font:600 34px/1.3 Inter;margin-top:18px}
.lab{font:400 24px Mono;color:#6E6A62;margin-top:14px}
.dots{display:grid;gap:10px;justify-content:start}
.dots i{border-radius:50%;background:#C9C3B6;transform:scale(0)}
.bars{display:flex;flex-direction:column;gap:30px}
.br .bl{display:flex;justify-content:space-between;font:800 36px Inter;margin-bottom:12px}
.br .bl .v{font:800 40px Inter;color:var(--blue)}
.br.hi .bl .v{color:var(--orange)}
.br .tr{height:58px;background:var(--line);position:relative}
.br .fl{position:absolute;left:0;top:0;bottom:0;background:var(--blue)}
.br.hi .fl{background:var(--orange)}
.cards{display:flex;gap:28px;flex-wrap:wrap}
.card{padding:26px 34px 30px;color:#fff;background:var(--blue);min-width:300px;transform-origin:left bottom}
.card.o{background:var(--orange)}.card.w{background:#fff;color:var(--blue);border:4px solid var(--blue)}
.card .k{font:700 24px Mono;letter-spacing:.08em;text-transform:uppercase;opacity:.9}
.card .n{font:400 110px/1 Anton;margin-top:10px}
.txt .ln{font:800 66px/1.15 Inter;letter-spacing:-.02em;opacity:0}
.txt .ln b{color:var(--blue)}.txt .ln .x{color:var(--orange)}
.line svg{overflow:visible}
.poll{margin:0 auto;width:760px;background:#fff;border:5px solid var(--ink);border-radius:26px;padding:34px 40px 44px;box-shadow:14px 14px 0 var(--ink);position:relative}
.poll .k{font:700 24px Mono;text-align:center;letter-spacing:.1em;color:#6E6A62;margin-bottom:26px}
.poll .op{font:800 36px Inter;text-align:center;border:4px solid var(--ink);border-radius:60px;padding:12px;margin-top:16px;text-transform:uppercase}
.poll .op:nth-child(2){border-color:var(--blue);color:var(--blue)}.poll .op:nth-child(4){border-color:var(--orange);color:var(--orange)}
.poll .op.sel{background:var(--blue);color:#fff;border-color:var(--blue)}
.cursor{position:absolute;width:64px;height:64px}
.dnut{display:flex;align-items:center;gap:44px}
.dnut svg{flex:0 0 auto;overflow:visible}
.dnut .dl{font:700 40px/1.25 Inter}
.dnut .dl b{color:var(--orange)}
.splt .b100{display:flex;height:120px;width:100%;background:var(--line)}
.splt .sg{height:100%;width:0;display:flex;align-items:center;justify-content:center;font:900 40px Inter;color:#fff;overflow:hidden;white-space:nowrap}
.splt .lg{margin-top:34px;display:flex;flex-direction:column;gap:18px}
.splt .li{display:flex;align-items:center;gap:20px;font:700 38px Inter;opacity:0}
.splt .sq{width:38px;height:38px;flex:0 0 auto}
.splt .li .v{margin-left:auto;font:900 44px Inter}
.splt .li.hi .v{color:var(--orange)}
.hh2 .nm{display:flex;justify-content:space-between;font:400 60px Anton;text-transform:uppercase;margin-bottom:24px}
.hh2 .nm .b{color:var(--orange)}
.hh2 .r{margin-bottom:30px;opacity:0}
.hh2 .rl{text-align:center;font:700 24px Mono;letter-spacing:.08em;text-transform:uppercase;color:#6E6A62;margin-bottom:10px}
.hh2 .rb{display:flex;align-items:center;gap:8px}
.hh2 .sd{flex:1;display:flex;align-items:center;gap:14px}
.hh2 .sd.a{justify-content:flex-end}
.hh2 .br{height:56px;width:0;background:var(--ink)}
.hh2 .sd.b .br{background:var(--orange)}
.hh2 .vv{font:900 46px Inter;white-space:nowrap}
.hh2 .sd.b .vv{color:var(--orange)}
.tln{position:relative;padding-left:76px}
.tln .ax{position:absolute;left:21px;top:16px;width:8px;background:var(--ink);height:0}
.tln .ev{position:relative;margin-bottom:46px;opacity:0}
.tln .ev:last-child{margin-bottom:0}
.tln .ev .pt{position:absolute;left:-74px;top:4px;width:46px;height:46px;border-radius:50%;background:var(--paper);border:8px solid var(--ink)}
.tln .ev.hi .pt{background:var(--orange);border-color:var(--orange)}
.tln .dt{font:400 52px/1 Anton;color:var(--blue)}
.tln .ev.hi .dt{color:var(--orange)}
.tln .tx{font:600 36px/1.3 Inter;margin-top:8px}
.tln .tx b{color:var(--blue)}
.lgo{width:var(--lg,72px);height:var(--lg,72px);border-radius:50%;background:#fff;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;box-shadow:0 0 0 4px var(--line),6px 6px 0 var(--blue);vertical-align:middle}
.lgo img{width:80%;height:80%;object-fit:contain}
.lgo.big{--lg:150px}
.lgr{display:flex;gap:34px;justify-content:center;align-items:center;flex-wrap:wrap}
.br .bl .nw{display:flex;align-items:center;gap:16px}
.hh2 .nm .sd2{display:flex;align-items:center;gap:16px}
.hh2 .nm .sd2.b{flex-direction:row-reverse}
.tln .ev .lgo{position:absolute;right:0;top:0}
.ttl .wm{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em;margin-bottom:-.08em}
.ttl .wm>span{display:inline-block;will-change:transform}
.trov{position:absolute;inset:0;z-index:50;pointer-events:none;display:none}
.trov .ir{position:absolute;left:50%;top:50%;width:2400px;height:2400px;margin:-1200px 0 0 -1200px;border-radius:50%;background:var(--orange)}
.trov .pn{position:absolute;inset:0;background:var(--ink)}
.trov .pn2{position:absolute;inset:0;background:var(--orange)}
.trov .rg{position:absolute;left:50%;top:50%;width:900px;height:580px;margin:-290px 0 0 -450px;border-radius:50%;background:var(--ink);box-shadow:0 0 0 46px var(--paper),0 0 0 64px var(--orange)}
.term{background:#fff;border:4px solid var(--ink);padding:26px 34px 30px;box-shadow:12px 12px 0 var(--blue)}
.term .k{font:700 24px Mono;letter-spacing:.12em;color:var(--orange)}
.term .tmw{font:400 76px/1.05 Anton;text-transform:uppercase;margin-top:8px}
.term .tm{background:linear-gradient(var(--mark),var(--mark)) no-repeat left 88%/0% 22%;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.term .df{font:600 36px/1.3 Inter;margin-top:12px}
.ldg{display:flex;gap:26px}
.ldg .cl{flex:1}
.ldg .hd{font:400 50px Anton;text-transform:uppercase;padding-bottom:10px;border-bottom:6px solid var(--blue);color:var(--blue)}
.ldg .cl.l .hd{border-color:var(--orange);color:var(--orange)}
.ldg .it{font:700 34px/1.25 Inter;margin-top:20px;opacity:0;padding-left:44px;position:relative}
.ldg .it::before{content:'+';position:absolute;left:0;top:-6px;font:900 44px Inter;color:var(--blue)}
.ldg .cl.l .it::before{content:'−';color:var(--orange)}
`;

const page_js = `
const cfg = window.CFG, tl = window.TL;
const $ = (h) => { const d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; };
const LGO = (src, cls) => src ? '<span class="lgo ' + (cls || '') + '"><img src="' + src + '"></span>' : '';
const ST = cfg.style || {};
const ease = ST.ease === 'expo' ? (p => { p = Math.min(Math.max(p, 0), 1); return p >= 1 ? 1 : 1 - Math.pow(2, -10 * p); }) : (p => 1 - Math.pow(1 - Math.min(Math.max(p, 0), 1), 3));
const easeIO = p => { p = Math.min(Math.max(p, 0), 1); return p < .5 ? 8 * p * p * p * p : 1 - Math.pow(-2 * p + 2, 4) / 2; };
const clamp = p => Math.min(Math.max(p, 0), 1);
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;');
const md = s => esc(s).replace(/\\*(.+?)\\*/g, '<b>$1</b>');
const fmtN = (v, d) => v.toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
const segs = tl.segments;
const nCh = (cfg.chapters || []).length;

// tempo di comparsa di ogni marker {id}
const markT = {};
segs.forEach(s => s.words.forEach(w => { (w.m || []).forEach(id => markT[id] = w.start); (w.m_after || []).forEach(id => markT[id] = w.end); }));
const stepStart = (ci, si) => { const s = segs.find(x => x.kind === 'step' && x.ci === ci && x.si === si); return s ? s.start : 0; };
const T = (id, fb) => (id != null && markT[id] != null) ? markT[id] : fb;

const root = document.body;
const footer = () => '<div class="foot">' + (window.LOGO || '') + '</div>';
const kar = $('<div class="kar"></div>');

// ---------- COVER ----------
let cover = null;
if (cfg.cover) {
  const c = cfg.cover;
  cover = $('<div class="view"></div>');
  const tt = $('<div class="cv-t"></div>');
  (c.title || []).forEach(l => { const hi = /^\\*.*\\*$/.test(l); tt.appendChild($('<span class="l' + (hi ? ' hi' : '') + '"><span>' + esc(l.replace(/\\*/g, '')) + '</span></span>')); });
  cover.appendChild(tt);
  const sub = $('<div class="cv-s">' + md(c.sub || '') + '</div>'); cover.appendChild(sub);
  if (c.photo) {
    const ph = $('<div class="cv-ph">' + (c.disc !== false && c.cutout !== false ? '<div class="disc"></div>' : '') + '<img class="' + (c.cutout === false ? 'box' : '') + '" src="' + c.photo + '"></div>');
    cover.appendChild(ph);
  }
  if (!c.photo && c.big) cover.appendChild($('<div class="cv-ph"><div class="bigc" style="position:absolute;left:120px;top:0;font:400 430px/0.9 Anton;color:var(--blue)">' + esc(c.big) + '</div></div>'));
  if (c.note) cover.appendChild($('<div class="note" style="left:' + (c.note.x ?? 140) + 'px;top:' + (c.note.y ?? 1110) + 'px;transform:rotate(' + (c.note.rot ?? -8) + 'deg)">' + esc(c.note.text) + '</div>'));
  cover.insertAdjacentHTML('beforeend', footer());
  root.appendChild(cover);
}

// ---------- CAPITOLI ----------
const builders = {
  bignum(e) { const n = $('<div class="el"><div class="big"></div>' + (e.label ? '<div class="big-l">' + md(e.label) + '</div>' : '') + (e.note ? '<div class="lab">' + esc(e.note) + '</div>' : '') + '</div>');
    if (e.color) n.querySelector('.big').style.color = 'var(--' + e.color + ')';
    let fitted = false;
    return { n, upd(lt) { const bg = n.querySelector('.big'); if (!fitted) { bg.textContent = (e.prefix || '') + fmtN(e.to || 0, e.decimals) + (e.suffix || ''); const w = bg.scrollWidth; if (w > bg.clientWidth) bg.style.fontSize = Math.floor(230 * bg.clientWidth / w) + 'px'; fitted = true; }
      if (e.punch) { const q = ease(lt / 0.55); bg.style.transform = 'scale(' + (1.6 - 0.6 * q) + ')'; bg.style.transformOrigin = 'left center'; }
      const v = (e.from || 0) + ((e.to || 0) - (e.from || 0)) * ease(lt / (e.dur || 0.9)); n.querySelector('.big').textContent = (e.prefix || '') + fmtN(v, e.decimals) + (e.suffix || ''); } }; },
  dots(e) { const N = e.n || 100, cols = e.cols || 20, W = 840, gap = 10, rows = Math.ceil(N / cols); const sz = Math.min(Math.floor((W - gap * (cols - 1)) / cols), Math.floor(((e.h || 460) - gap * (rows - 1)) / rows));
    const n = $('<div class="el"><div class="dots" style="grid-template-columns:repeat(' + cols + ',' + sz + 'px)"></div>' + (e.label ? '<div class="lab">' + esc(e.label) + '</div>' : '') + '</div>');
    const g = n.firstChild; const idx = [...Array(N).keys()]; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    if (!e.ordered) for (let i = N - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    const hiSet = new Set(idx.slice(0, e.hi || 0));
    const ds = []; for (let i = 0; i < N; i++) { const d = document.createElement('i'); d.style.width = d.style.height = sz + 'px'; g.appendChild(d); ds.push(d); }
    const tHi = T(e.hiAt, null);
    return { n, upd(lt, t) { const sp = e.dur || 1.0; ds.forEach((d, i) => { const p = ease((lt - i / N * sp) / 0.25); d.style.transform = 'scale(' + p + ')';
      const on = hiSet.has(i) && (tHi == null ? lt > sp + 0.2 : t >= tHi); d.style.background = on ? 'var(--' + (e.hiColor || 'orange') + ')' : (e.color ? 'var(--' + e.color + ')' : '#C9C3B6'); }); } }; },
  bars(e) { const n = $('<div class="el bars"></div>'); const max = e.max || Math.max(...e.items.map(x => x.value));
    const rows = e.items.map((it, k) => { const r = $('<div class="br' + (k === e.highlight ? ' hi' : '') + '"><div class="bl"><span class="nw">' + LGO(it.logo) + esc(it.label) + '</span><span class="v"></span></div><div class="tr"><div class="fl"></div></div></div>'); n.appendChild(r); return r; });
    return { n, upd(lt, t, t0) { rows.forEach((r, k) => { const it = e.items[k]; const s = T(it.at, t0 + k * 0.35); const p = ease((t - s) / 0.8);
      r.style.opacity = clamp((t - s) / 0.25); r.querySelector('.fl').style.width = (it.value / max * 100 * p) + '%';
      r.querySelector('.v').textContent = it.display != null ? (p > 0.6 ? it.display : '') : fmtN(it.value * p, e.decimals); }); } }; },
  cards(e) { const n = $('<div class="el cards"></div>');
    const cs = e.items.map(it => { const c = $('<div class="card ' + (it.color === 'orange' ? 'o' : it.color === 'white' ? 'w' : '') + '"><div class="k">' + esc(it.label) + '</div><div class="n"></div></div>'); n.appendChild(c); return c; });
    return { n, upd(lt, t, t0) { cs.forEach((c, k) => { const it = e.items[k]; const s = T(it.at, t0 + k * 0.5); const p = ease((t - s) / 0.45);
      c.style.opacity = clamp((t - s) / 0.15); c.style.transform = 'scale(' + (0.85 + 0.15 * p) + ') translateY(' + (1 - p) * 30 + 'px)';
      const v = it.value * ease((t - s) / 0.8); c.querySelector('.n').textContent = (it.prefix || '') + (typeof it.value === 'number' ? fmtN(v, it.decimals) : it.value) + (it.suffix || ''); }); } }; },
  text(e) { const n = $('<div class="el txt"></div>'); const ls = e.lines.map(l => { const d = $('<div class="ln">' + md(l).replace(/^(×|x)\\s/, '<span class="x">×</span> ') + '</div>'); n.appendChild(d); return d; });
    if (e.size) ls.forEach(d => d.style.fontSize = e.size + 'px');
    return { n, upd(lt, t, t0) { ls.forEach((d, k) => { const at = (e.at || [])[k]; const s = T(at, t0 + k * 0.6); const p = ease((t - s) / 0.35); d.style.opacity = p; d.style.transform = 'translateY(' + (1 - p) * 24 + 'px)'; }); } }; },
  line(e) { const W = 952, H = e.h || 520, pts = e.points, mn = e.min ?? Math.min(...pts), mx = e.max ?? Math.max(...pts);
    const X = i => i / (pts.length - 1) * W, Y = v => H - (v - mn) / (mx - mn || 1) * H;
    const d = pts.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ');
    const n = $('<div class="el line"><svg width="' + W + '" height="' + (H + 40) + '"><line x1="0" y1="' + H + '" x2="' + W + '" y2="' + H + '" stroke="#C9C3B6" stroke-width="2"/><path d="' + d + '" fill="none" stroke="var(--' + (e.color || 'blue') + ')" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><circle r="12" fill="var(--orange)"/><text x="0" y="' + (H + 34) + '" font-family="Mono" font-size="22" fill="#6E6A62">' + esc(e.x0 || '') + '</text><text x="' + W + '" y="' + (H + 34) + '" text-anchor="end" font-family="Mono" font-size="22" fill="#6E6A62">' + esc(e.x1 || '') + '</text></svg>' + (e.label ? '<div class="lab">' + esc(e.label) + '</div>' : '') + '</div>');
    const p = n.querySelector('path'), c = n.querySelector('circle'); let L = 0;
    return { n, upd(lt) { if (!L) { L = p.getTotalLength(); p.style.strokeDasharray = L; } const k = ease(lt / (e.dur || 1.6)); p.style.strokeDashoffset = L * (1 - k); const pt = p.getPointAtLength(L * k); c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y); } }; },
  donut(e) { const R = 230, SW = 84, Z = 2 * R + SW, C = 2 * Math.PI * R, v = Math.max(0, Math.min(100, e.value));
    const n = $('<div class="el dnut"><svg width="' + Z + '" height="' + Z + '"><g transform="rotate(-90 ' + Z / 2 + ' ' + Z / 2 + ')"><circle cx="' + Z / 2 + '" cy="' + Z / 2 + '" r="' + R + '" fill="none" stroke="#DDD7CB" stroke-width="' + SW + '"/><circle class="rv" cx="' + Z / 2 + '" cy="' + Z / 2 + '" r="' + R + '" fill="none" stroke="var(--orange)" stroke-width="' + SW + '" stroke-dasharray="0 ' + C + '"/></g><text x="' + Z / 2 + '" y="' + Z / 2 + '" text-anchor="middle" dominant-baseline="central" font-family="Inter" font-weight="900" font-size="120" fill="var(--ink)"></text></svg>' + (e.label ? '<div class="dl">' + md(e.label) + '</div>' : '') + '</div>');
    const rv = n.querySelector('.rv'), tx = n.querySelector('text');
    return { n, upd(lt) { const p = ease(lt / (e.dur || 1.4)); rv.setAttribute('stroke-dasharray', (C * v / 100 * p) + ' ' + C);
      tx.textContent = p >= 0.999 && e.display ? e.display : fmtN(v * p, e.decimals) + (e.suffix ?? '%'); } }; },
  split(e) { const tot = e.parts.reduce((a, p) => a + p.value, 0) || 1, hi = e.highlight ?? 0; const sh = ['#0B1F3A', '#1F4FD1', '#8A93A6', '#B4AEA2', '#DDD7CB'];
    let j = 0; const cols = e.parts.map((p, k) => k === hi ? 'var(--orange)' : sh[Math.min(j++, 4)]);
    const n = $('<div class="el splt"><div class="b100"></div><div class="lg"></div></div>'); const bar = n.querySelector('.b100'), lg = n.querySelector('.lg');
    const sg = e.parts.map((p, k) => { const d = $('<div class="sg" style="background:' + cols[k] + '"></div>'); bar.appendChild(d);
      const l = $('<div class="li' + (k === hi ? ' hi' : '') + '"><div class="sq" style="background:' + cols[k] + '"></div><span>' + esc(p.label) + '</span><span class="v">' + esc(p.display ?? p.value) + '</span></div>'); lg.appendChild(l); return [d, l]; });
    return { n, upd(lt, t, t0) { e.parts.forEach((p, k) => { const s = T(p.at, t0 + k * 0.5); const q = ease((t - s) / 0.6); const [d, l] = sg[k];
      d.style.width = (p.value / tot * 100 * q) + '%'; d.textContent = (q > 0.8 && p.value / tot > 0.14) ? (p.display ?? p.value) : ''; l.style.opacity = clamp((t - s) / 0.3); }); } }; },
  h2h(e) { const n = $('<div class="el hh2"><div class="nm"><span class="sd2">' + LGO(e.a.logo) + esc(e.a.name) + '</span><span class="sd2 b">' + LGO(e.b.logo) + '<span class="b">' + esc(e.b.name) + '</span></span></div></div>');
    const rs = e.rows.map(r => { const m = Math.max(r.a, r.b) || 1; const d = $('<div class="r"><div class="rl">' + esc(r.label) + '</div><div class="rb"><div class="sd a"><span class="vv">' + esc(r.da ?? r.a) + '</span><div class="br"></div></div><div class="sd b"><div class="br"></div><span class="vv">' + esc(r.db ?? r.b) + '</span></div></div></div>'); n.appendChild(d); return { d, wa: Math.max(8, r.a / m * 230), wb: Math.max(8, r.b / m * 230) }; });
    return { n, upd(lt, t, t0) { rs.forEach((x, k) => { const s = T(e.rows[k].at, t0 + 0.3 + k * 0.6); const q = ease((t - s) / 0.7); const bs = x.d.querySelectorAll('.br');
      x.d.style.opacity = clamp((t - s) / 0.2); bs[0].style.width = (x.wa * q) + 'px'; bs[1].style.width = (x.wb * q) + 'px'; }); } }; },
  timeline(e) { const hi = e.highlight ?? e.events.length - 1; const n = $('<div class="el tln"><div class="ax"></div></div>'); const ax = n.querySelector('.ax');
    const evs = e.events.map((v, k) => { const d = $('<div class="ev' + (k === hi ? ' hi' : '') + '"><div class="pt"></div>' + LGO(v.logo) + '<div class="dt">' + esc(v.date) + '</div><div class="tx">' + md(v.text) + '</div></div>'); n.appendChild(d); return d; });
    return { n, upd(lt, t, t0) { let reach = 0; evs.forEach((d, k) => { const s = T(e.events[k].at, t0 + k * 0.9); const q = ease((t - s) / 0.45);
      d.style.opacity = q; d.style.transform = 'translateX(' + (1 - q) * 40 + 'px)'; if (t >= s) reach = d.offsetTop + 20; });
      ax.style.height = Math.max(0, reach - 16) + 'px'; } }; },
  logos(e) { const n = $('<div class="el lgr"></div>'); const ls = (e.logos || []).map(src => { const d = $(LGO(src, 'big')); n.appendChild(d); return d; });
    return { n, upd(lt, t, t0) { ls.forEach((d, k) => { const s = T((e.at || [])[k], t0 + k * 0.3); const q = ease((t - s) / 0.35); d.style.opacity = clamp((t - s) / 0.15); d.style.transform = 'scale(' + (0.6 + 0.4 * q) + ')'; }); } }; },
  photo(e) { const n = $('<div class="el" style="position:relative;height:' + (e.h || 560) + 'px"><img src="' + e.src + '" style="position:absolute;left:50%;bottom:0;height:100%;transform:translateX(-50%);filter:drop-shadow(12px 8px 0 var(--blue))"></div>');
    return { n, upd() {} }; },
  term(e) { const n = $('<div class="el term"><div class="k">' + esc(e.kicker || 'KEY TERM') + '</div><div class="tmw"><span class="tm">' + esc(e.term) + '</span></div><div class="df">' + md(e.def) + '</div></div>');
    const tm = n.querySelector('.tm');
    return { n, upd(lt) { tm.style.backgroundSize = (ease((lt - 0.35) / 0.6) * 100) + '% 22%'; } }; },
  ledger(e) { const col = (cls, label, items) => '<div class="cl ' + cls + '"><div class="hd">' + esc(label) + '</div>' + (items || []).map(x => '<div class="it">' + md(x.text ?? x) + '</div>').join('') + '</div>';
    const n = $('<div class="el ldg">' + col('w', e.winsLabel || 'Who wins', e.wins) + col('l', e.losesLabel || 'Who loses', e.loses) + '</div>');
    const its = [...n.querySelectorAll('.cl.w .it')].map((d, k) => [d, (e.wins[k] || {}).at]).concat([...n.querySelectorAll('.cl.l .it')].map((d, k) => [d, (e.loses[k] || {}).at]));
    return { n, upd(lt, t, t0) { its.forEach(([d, at], k) => { const s = T(at, t0 + 0.3 + k * 0.5); const q = ease((t - s) / 0.4); d.style.opacity = q; d.style.transform = 'translateX(' + (1 - q) * 30 + 'px)'; }); } }; },
  note(e) { const n = $('<div class="el note" style="position:relative;align-self:' + (e.align || 'flex-end') + ';transform:rotate(' + (e.rot ?? -6) + 'deg)">' + esc(e.text) + '</div>');
    return { n, upd(lt) { const p = ease(lt / 0.7); n.style.clipPath = 'inset(0 ' + (100 - p * 100) + '% 0 0)'; } }; },
};

const chapters = (cfg.chapters || []).map((ch, ci) => {
  const v = $('<div class="view"></div>');
  const prog = $('<div class="prog">' + Array.from({ length: nCh }, (_, k) => '<i class="' + (k === ci ? 'cur' : '') + '"><b style="width:' + (k < ci ? 100 : 0) + '%"></b></i>').join('') + '</div>');
  v.appendChild(prog);
  const col = $('<div class="col"></div>'); v.appendChild(col);
  col.appendChild($('<div class="chn">CH. ' + String(ci + 1).padStart(2, '0') + '</div>'));
  const ttl = $('<div class="ttl"></div>'); col.appendChild(ttl);
  if (ST.titles === 'rise') ttl.innerHTML = ch.title.split(' ').map(w => '<span class="wm"><span>' + esc(w) + '</span></span>').join(' ');
  const sub = $('<div class="sub">' + esc(ch.sub || '') + '</div>'); col.appendChild(sub);
  const area = $('<div class="area"></div>'); col.appendChild(area);
  if (ch.justify) area.style.justifyContent = ch.justify;
  const els = [];
  ch.steps.forEach((st, si) => (st.els || []).forEach(e => { const b = builders[e.type](e); area.appendChild(b.n); els.push({ e, b, t0: T(e.id, stepStart(ci, si) + (e.delay || 0)) }); }));
  v.insertAdjacentHTML('beforeend', footer());
  root.appendChild(v);
  const cs = segs.filter(s => s.kind === 'step' && s.ci === ci); const a = cs[0].start, z = cs[cs.length - 1].vend;
  return { v, ch, ttl, sub, prog, els, a, z };
});

// ---------- OUTRO ----------
let outro = null;
if (cfg.outro) {
  const o = cfg.outro; outro = $('<div class="view"></div>');
  outro.appendChild($('<div class="chn" style="position:absolute;left:120px;top:270px;color:#6E6A62">' + esc(o.kicker || 'YOUR CALL') + '</div>'));
  const tt = $('<div class="ttl" style="position:absolute;left:120px;top:306px;margin:0;right:250px;font-size:104px"></div>');
  (o.title || []).forEach((l, i) => tt.appendChild($('<div style="' + (i ? 'color:var(--blue)' : '') + '">' + esc(l.replace(/\\*/g, '')) + '</div>')));
  outro.appendChild(tt);
  const poll = $('<div class="poll" style="position:absolute;left:160px;top:660px"><div class="k">' + esc(o.pollLabel || 'YOUR TAKE?') + '</div>' + (o.options || []).map(x => '<div class="op">' + esc(x) + '</div>').join('') + '</div>');
  outro.appendChild(poll);
  const cur = $('<svg class="cursor" viewBox="0 0 24 24"><path d="M4 2l15 9-6.5 1.6L16 20l-3 1.4-3.4-7.4L4 18z" fill="#fff" stroke="#0B1F3A" stroke-width="1.6" stroke-linejoin="round"/></svg>');
  outro.appendChild(cur);
  if (o.note) outro.appendChild($('<div class="note" style="left:420px;top:548px;transform:rotate(-5deg)">' + esc(o.note) + '</div>'));
  outro.insertAdjacentHTML('beforeend', footer());
  root.appendChild(outro);
  outro._p = { tt, poll, cur };
}
root.appendChild(kar);
const trov = $('<div class="trov"></div>'); root.appendChild(trov);
const TR = ST.transition || 'cut';
if (TR === 'iris') trov.innerHTML = '<div class="ir"></div>'; else if (TR === 'ring') trov.innerHTML = '<div class="rg"></div>'; else if (TR === 'wipe') trov.innerHTML = '<div class="pn2"></div>'; else if (TR === 'rise') trov.innerHTML = '<div class="pn"></div>';
const switches = [];
chapters.forEach(c => switches.push(c.a));
{ const ou = segs.find(s => s.kind === 'outro'); if (cfg.outro && ou) switches.push(ou.start); }
const LOOP_T = ST.loop ? tl.duration - 0.45 : null;
if (LOOP_T != null) switches.push(LOOP_T);
function drawTrans(t) {
  if (TR === 'cut') { trov.style.display = 'none'; return; }
  const D = 0.28; const s0 = switches.find(x => t >= x - D && t < x + D);
  if (s0 == null) { trov.style.display = 'none'; return; }
  trov.style.display = 'block'; const el = trov.firstChild;
  if (t < s0) { const p = easeIO((t - (s0 - D)) / D);
    if (TR === 'iris') el.style.transform = 'scale(' + p + ')';
    else if (TR === 'ring') el.style.transform = 'scale(' + (3.8 * p) + ')';
    else if (TR === 'wipe') el.style.transform = 'translateX(' + (-100 + 100 * p) + '%)';
    else el.style.transform = 'translateY(' + (100 - 100 * p) + '%)'; }
  else { const p = easeIO((t - s0) / D);
    if (TR === 'iris') el.style.transform = 'scale(' + (1 - p) + ')';
    else if (TR === 'ring') el.style.transform = 'scale(' + (3.8 * (1 - p)) + ')';
    else if (TR === 'wipe') el.style.transform = 'translateX(' + (100 * p) + '%)';
    else el.style.transform = 'translateY(' + (-100 * p) + '%)'; }
}

// ---------- KARAOKE ----------
function chunks(words) { const out = []; let cur = [];
  words.forEach((w, i) => { cur.push(w); const brk = /[.!?;:,]$/.test(w.w) && cur.length >= 3; if (cur.length >= 6 || brk || i === words.length - 1) { out.push(cur); cur = []; } }); return out; }
segs.forEach(s => s._ch = chunks(s.words));
let lastKey = '';
function drawKar(t) {
  const s = segs.find(x => t >= x.start - 0.05 && t < x.vend) || segs[segs.length - 1];
  let ch = s._ch[0]; for (const c of s._ch) if (t >= c[0].start - 0.05) ch = c;
  const key = s.start + ':' + ch[0].start;
  if (key !== lastKey) { kar.innerHTML = ch.map(w => '<span class="' + (w.hi ? 'hi' : '') + '">' + esc(w.w) + '</span>').join(' '); lastKey = key; }
  [...kar.children].forEach((sp, i) => sp.classList.toggle('on', t >= ch[i].start));
}


// ---------- EFFETTI SONORI (tempi) ----------
window.EVENTS = function () {
  const E = []; const add = (t, k, x) => E.push(Object.assign({ t: +t.toFixed(3), k }, x || {}));
  const cvSeg = segs.find(s => s.kind === 'cover'); const ouSeg = segs.find(s => s.kind === 'outro');
  if (cover && cvSeg) { const a = cvSeg.start; (cfg.cover.title || []).forEach((l, i) => add(a + i * 0.35, 'thump'));
    if (cfg.cover.photo || cfg.cover.big) add(a + 0.3, 'pop', { g: 0.8 }); if (cfg.cover.note) add(a + 1.4, 'pen', { d: 0.7 }); }
  chapters.forEach((c, ci) => { add(c.a - 0.12, 'whoosh'); if (ST.hits && ci > 0) add(c.a, 'hit', { g: 0.7 }); if (c.ch.riser) add(c.a - 1.4, 'riser', { d: 1.4 });
    const L = c.ch.title.length, D = Math.max(0.35, L * 0.025);
    for (let i = 0; i < L; i += 2) if (c.ch.title[i] !== ' ') add(c.a + i / L * D, 'tick');
    c.els.forEach(x => { const e = x.e, t0 = x.t0;
      if (e.type === 'bignum') { add(t0, 'pop'); if (e.punch) add(t0, 'hit'); }
      else if (e.type === 'dots') { add(t0, 'roll', { d: e.dur || 1.0 }); if (e.hi) add(T(e.hiAt, t0 + (e.dur || 1.0) + 0.2), 'pop', { g: 0.7 }); }
      else if (e.type === 'bars') e.items.forEach((it, k) => add(T(it.at, t0 + k * 0.35), 'fill'));
      else if (e.type === 'cards') e.items.forEach((it, k) => add(T(it.at, t0 + k * 0.5), 'pop'));
      else if (e.type === 'text') e.lines.forEach((l, k) => add(T((e.at || [])[k], t0 + k * 0.6), 'pop', { g: 0.6 }));
      else if (e.type === 'line') add(t0, 'pen', { d: e.dur || 1.6 });
      else if (e.type === 'note') add(t0, 'pen', { d: 0.7 });
      else if (e.type === 'term') { add(t0, 'pop', { g: 0.7 }); add(t0 + 0.35, 'pen', { d: 0.6 }); }
      else if (e.type === 'ledger') { const its = (e.wins || []).concat(e.loses || []); its.forEach((x, k) => add(T(x.at, t0 + 0.3 + k * 0.5), 'pop', { g: 0.6 })); }
      else if (e.type === 'donut') { add(t0, 'pen', { d: e.dur || 1.4 }); add(t0 + (e.dur || 1.4), 'pop', { g: 0.8 }); }
      else if (e.type === 'split') e.parts.forEach((p, k) => add(T(p.at, t0 + k * 0.5), 'fill'));
      else if (e.type === 'h2h') e.rows.forEach((r, k) => add(T(r.at, t0 + 0.3 + k * 0.6), 'fill'));
      else if (e.type === 'timeline') e.events.forEach((v, k) => add(T(v.at, t0 + k * 0.9), 'pop', { g: 0.7 }));
      else if (e.type === 'logos') (e.logos || []).forEach((v, k) => add(T((e.at || [])[k], t0 + k * 0.3), 'pop', { g: 0.6 }));
      else add(t0, 'pop', { g: 0.6 });
    });
  });
  if (outro && ouSeg) { const a = ouSeg.start; add(a - 0.12, 'whoosh'); add(a + 0.5, 'pop'); if (ST.hits) add(a, 'hit', { g: 0.7 });
    (cfg.outro.cursor || [0, 1, 2]).forEach((o, i) => add(a + 0.9 + i * 0.6 + 0.6, 'click'));
    if (cfg.outro.note) add(a + 0.9 + (cfg.outro.cursor || [0, 1, 2]).length * 0.6, 'pen', { d: 0.7 }); }
  if (LOOP_T != null) add(LOOP_T, 'whoosh');
  return E.sort((p, q) => p.t - q.t);
};

// ---------- FRAME ----------
window.draw = function (t) {
  const views = [];
  const cvSeg = segs.find(s => s.kind === 'cover'); const ouSeg = segs.find(s => s.kind === 'outro');
  let active = null;
  if (cover && cvSeg && t < cvSeg.vend) active = cover;
  chapters.forEach(c => { if (t >= c.a && t < c.z) active = c.v; });
  if (outro && ouSeg && t >= ouSeg.start) active = outro;
  if (!active) active = cover || chapters[0].v;
  const looping = LOOP_T != null && cover && t >= LOOP_T; if (looping) { active = cover; }
  [cover, outro, ...chapters.map(c => c.v)].forEach(v => { if (v) v.style.display = v === active ? 'block' : 'none'; });

  if (active === cover) { const c = cfg.cover, a = looping ? -10 : (cvSeg ? cvSeg.start : 0);
    const ls = cover.querySelectorAll('.cv-t .l'); ls.forEach((l, i) => { const p = ease((t - a - i * 0.35) / 0.4); l.style.opacity = p; l.style.transform = 'translateY(' + (1 - p) * 40 + 'px)'; });
    const tt = cover.querySelector('.cv-t'); const sub = cover.querySelector('.cv-s'); sub.style.top = (270 + tt.offsetHeight + 26) + 'px'; sub.style.opacity = ease((t - a - 0.8) / 0.4);
    const ph = cover.querySelector('.cv-ph'); if (ph) { const top = sub.offsetTop + sub.offsetHeight + 24; ph.style.top = top + 'px'; ph.style.height = Math.max(200, 1200 - top) + 'px'; const bg = ph.querySelector('.bigc'); if (bg) bg.style.fontSize = Math.round(Math.max(200, 1200 - top) * 0.95) + 'px';
    const p = ease((t - a - 0.3) / 0.6); ph.style.opacity = p; ph.style.transform = 'translateY(' + (1 - p) * 60 + 'px) scale(' + (1 + 0.04 * clamp((t - a) / 6)) + ')'; }
    const nt = cover.querySelector('.note'); if (nt) { const p = ease((t - a - 1.4) / 0.7); nt.style.clipPath = 'inset(0 ' + (100 - p * 100) + '% 0 0)'; }
  }
  chapters.forEach((c, ci) => { if (c.v !== active) return;
    const full = c.ch.title; const k = clamp((t - c.a) / Math.max(0.35, full.length * 0.025)); if (ST.titles === 'rise') c.ttl.querySelectorAll('.wm>span').forEach((w, i) => { const q = ease((t - c.a - i * 0.09) / 0.6); w.style.transform = 'translateY(' + (1 - q) * 110 + '%)'; });
    else c.ttl.textContent = full.slice(0, Math.round(full.length * k));
    c.sub.style.opacity = ease((t - c.a - 0.3) / 0.4);
    c.els.forEach(x => { const lt = t - x.t0; const p = ease(lt / 0.35); x.b.n.style.opacity = x.e.type === 'bars' || x.e.type === 'cards' || x.e.type === 'text' ? (lt >= 0 ? 1 : 0) : p;
      if (!['bars','cards','text','note'].includes(x.e.type)) x.b.n.style.transform = 'translateY(' + (1 - p) * 26 + 'px)';
      if (lt >= -0.01) x.b.upd(Math.max(lt, 0), t, x.t0); });
    { const area = c.v.querySelector('.area'); c.els.forEach(x => { if (x.e.type === 'bignum' && t < x.t0) x.b.upd(0, t, x.t0); }); if (c.fit == null) { let h = 0; [...area.children].forEach(x => h += x.offsetHeight); h += 34 * Math.max(0, area.children.length - 1); c.fit = Math.min(0.96, area.clientHeight / Math.max(1, h * 1.05)); }
      const dr = ST.drift ? 1 + 0.035 * clamp((t - c.a) / Math.max(1, c.z - c.a)) : 1; area.style.transform = 'scale(' + (c.fit * dr) + ')'; }
  });
  if (active === outro) { const a = ouSeg.start, P = outro._p;
    P.tt.style.opacity = ease((t - a) / 0.4);
    const pp = ease((t - a - 0.5) / 0.5); P.poll.style.opacity = pp; P.poll.style.transform = 'translateY(' + (1 - pp) * 40 + 'px) rotate(' + (-2 * pp) + 'deg)';
    const ops = P.poll.querySelectorAll('.op'); const order = cfg.outro.cursor || [0, 1, 2];
    const steps = order.map((o, i) => a + 0.9 + i * 0.6);
    let x = 900, y = 1500; const tg = o => { const r = ops[o].getBoundingClientRect(); return [r.left + r.width * 0.62, r.top + r.height * 0.55]; };
    let sel = -1; let prev = [x, y];
    steps.forEach((s0, i) => { const [tx, ty] = tg(order[i]); const p = ease((t - s0) / 0.6); if (t >= s0) { x = prev[0] + (tx - prev[0]) * p; y = prev[1] + (ty - prev[1]) * p; if (p >= 1) sel = order[i]; } prev = t >= s0 + 0.6 ? [tx, ty] : prev; });
    P.cur.style.left = x + 'px'; P.cur.style.top = y + 'px'; P.cur.style.opacity = pp;
    ops.forEach((o, i) => o.classList.toggle('sel', i === sel));
    const nt = outro.querySelector('.note'); if (nt) { const p = ease((t - a - 0.9 - order.length * 0.6) / 0.7); nt.style.clipPath = 'inset(0 ' + (100 - p * 100) + '% 0 0)'; }
  }
  drawKar(t);
  kar.style.visibility = looping ? 'hidden' : 'visible';
  drawTrans(t);
};
`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.setContent(`<html><head><style>${CSS}</style></head><body></body></html>`);
  await page.evaluate(async () => { for (const f of ['500 20px Inter', '700 20px Inter', '800 20px Inter', '900 20px Inter', '400 20px Mono', '700 20px Mono', '700 20px Hand', '400 20px Anton']) await document.fonts.load(f, 'Aa0€'); });
  await page.evaluate(([c, t, l]) => { window.CFG = c; window.TL = t; window.LOGO = l; }, [cfg, tl, LOGO_SVG]);
  await page.addScriptTag({ content: page_js });
  await page.evaluate(() => document.fonts.ready);
  if (flag === '--preview') {
    const ts = flagVal.split(',').map(Number);
    for (const t of ts) { await page.evaluate(t => draw(t), t); await page.screenshot({ path: `${outPath}_${t}.png` }); console.log(`${outPath}_${t}.png`); }
    await browser.close(); return;
  }
  const audio = rel(cfg.audio), N = Math.ceil(tl.duration * FPS);
  const tmp = outPath.replace(/\.mp4$/, '') + '_video.mp4', evPath = outPath.replace(/\.mp4$/, '') + '_events.json', sfxPath = outPath.replace(/\.mp4$/, '') + '_sfx.wav';
  fs.writeFileSync(evPath, JSON.stringify(await page.evaluate(() => EVENTS())));
  const ff = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    ...(NST.blur ? ['-vf', 'tmix=frames=3:weights=1 2 1'] : []), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p', tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) {
    await page.evaluate(t => draw(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % (FPS * 5) === 0) process.stdout.write(`\r${(f / FPS).toFixed(0)}s / ${tl.duration.toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  const sh = (cmd, args) => { const r = require('child_process').spawnSync(cmd, args, { stdio: 'inherit' }); if (r.status) process.exit(r.status); };
  const sfxOn = cfg.sfx !== false;
  if (sfxOn) sh('python3', [path.join(__dirname, 'sfx.py'), evPath, String(tl.duration), sfxPath]);
  const g = cfg.sfxVolume ?? 0.55;
  const mix = sfxOn ? ['-i', sfxPath, '-filter_complex', `[1:a]apad[v];[2:a]volume=${g}[s];[v][s]amix=inputs=2:duration=first:normalize=0[a]`, '-map', '0:v', '-map', '[a]']
                    : ['-filter_complex', '[1:a]apad[a]', '-map', '0:v', '-map', '[a]'];
  sh('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', tmp, '-i', audio, ...mix, '-t', tl.duration.toFixed(2), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', outPath]);
  fs.unlinkSync(tmp);
  console.log(`\nOK ${outPath} (${N} frame, ${((Date.now() - t0) / 1000).toFixed(0)}s di rendering)`);
})();
