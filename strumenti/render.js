// GG on Sport — motore caroselli 1080x1350 (v5: grafici compare, bars, line, donut, h2h, timeline, split, dots, stat + loghi)
// Uso: node render.js slides.json cartella_output
// Rubriche con copertina propria: Explained (arancione), Case Study (foto/blu), Power Play (chiara), Deep Dive (blu)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const [, , input = 'slides.json', outDir = 'out'] = process.argv;
const data = JSON.parse(fs.readFileSync(input, 'utf8'));
const baseDir = path.dirname(path.resolve(input));
fs.mkdirSync(outDir, { recursive: true });

const font = (pkg, file) =>
  'data:font/woff2;base64,' +
  fs.readFileSync(path.join(__dirname, 'node_modules/@fontsource', pkg, 'files', file)).toString('base64');

const css = `
@font-face{font-family:Anton;src:url(${font('anton', 'anton-latin-400-normal.woff2')})}
@font-face{font-family:Anton;src:url(${font('anton', 'anton-latin-ext-400-normal.woff2')});unicode-range:U+0100-024F}
@font-face{font-family:Inter;font-weight:400;src:url(${font('inter', 'inter-latin-400-normal.woff2')})}
@font-face{font-family:Inter;font-weight:600;src:url(${font('inter', 'inter-latin-600-normal.woff2')})}
@font-face{font-family:Inter;font-weight:800;src:url(${font('inter', 'inter-latin-800-normal.woff2')})}
:root{--navy:#0B1F3A;--blue:#1F4FD1;--orange:#FF6A13;--paper:#F4F1EA}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px}
.s{position:relative;width:1080px;height:1350px;overflow:hidden;font-family:Inter;
   --bg:var(--navy);--fg:var(--paper);--acc:var(--orange);--kbg:var(--orange);--kfg:var(--navy);
   background:var(--bg);color:var(--fg);padding:96px 88px}
.t-paper{--bg:var(--paper);--fg:var(--navy);--acc:var(--blue);--kbg:var(--navy);--kfg:var(--paper)}
.t-orange{--bg:var(--orange);--fg:var(--navy);--acc:var(--paper);--kbg:var(--navy);--kfg:var(--paper)}
.t-blue{--bg:var(--blue);--fg:var(--paper);--acc:var(--orange);--kbg:var(--orange);--kfg:var(--navy)}
.bg{position:absolute;inset:0;background-size:cover;background-position:center}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,31,58,.15) 0%,rgba(11,31,58,.55) 45%,rgba(11,31,58,.96) 78%)}
.has-img{--fg:var(--paper)}
.z{position:relative;z-index:2;height:100%;display:flex;flex-direction:column}
.top{display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:26px;letter-spacing:.08em;text-transform:uppercase;gap:16px}
.kick{background:var(--kbg);color:var(--kfg);padding:10px 18px;font-weight:800}
.meta{display:flex;gap:20px;align-items:center}
.date{font-weight:800;border:3px solid currentColor;padding:6px 14px}
.n{opacity:.7}
.grow{flex:1}
.fit{flex:0 0 auto}
.grow{min-height:0}
.tag{display:inline-block;align-self:flex-start;font-weight:800;font-size:30px;letter-spacing:.12em;text-transform:uppercase;color:var(--acc);border-bottom:5px solid var(--acc);padding-bottom:6px;margin-bottom:36px}
h1{font-family:Anton;font-weight:400;text-transform:uppercase;line-height:.98;letter-spacing:.005em}
.cover h1{font-size:var(--h,132px)}
.text h1{font-size:var(--h,84px);margin-bottom:40px}
.end h1{font-size:var(--h,96px)}
h1 em{font-style:normal;color:var(--acc)}
.sub{font-size:var(--b,38px);line-height:1.3;font-weight:600;margin-top:32px;max-width:880px}
.body{font-size:var(--b,42px);line-height:1.38;font-weight:400;max-width:880px}
.body b,.sub b,.cta b,.lab b{font-weight:800;color:var(--acc)}
.bar{width:120px;height:12px;background:var(--acc);margin-bottom:40px}
.stat .num{white-space:nowrap;font-family:Anton;font-size:var(--h,280px);line-height:.92;color:var(--acc)}
.stat .lab{font-size:var(--b,46px);font-weight:600;line-height:1.25;margin-top:24px;max-width:880px}
.src{font-size:22px;opacity:.65;margin-top:28px}
.foot{display:flex;justify-content:space-between;align-items:flex-end;font-size:26px;font-weight:600;margin-top:40px}
.sig{font-family:Anton;font-size:64px;letter-spacing:.02em;line-height:1}
.sig span{color:var(--acc)}
.t-orange .sig span{color:var(--paper)}
.t-paper .sig span{color:var(--orange)}
.swipe{opacity:.8}
.cta{font-size:var(--b,40px);line-height:1.35;margin-top:40px;font-weight:600}
.compare h1,.bars h1{font-size:var(--h,72px);margin-bottom:48px}
.bars{display:flex;flex-direction:column;gap:30px}
.row .lb{display:flex;justify-content:space-between;align-items:baseline;font-size:var(--b,34px);font-weight:600;margin-bottom:12px;gap:24px}
.row .lb .v{font-family:Anton;font-size:calc(var(--b,34px)*1.45);font-weight:400;white-space:nowrap}
.track{height:44px;background:color-mix(in srgb,var(--fg) 12%,transparent)}
.fill{height:100%;background:color-mix(in srgb,var(--fg) 55%,transparent)}
.row.hi .fill{background:var(--acc)}
.row.hi .v{color:var(--acc)}
.cmp{display:flex;align-items:flex-end;gap:40px}
.cmp .col{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:flex-end}
.cmp .blk{background:color-mix(in srgb,var(--fg) 45%,transparent)}
.cmp .col.hi .blk{background:var(--acc)}
.cmp .val{font-family:Anton;font-size:var(--n,110px);line-height:1;margin-bottom:16px;white-space:nowrap}
.cmp .col.hi .val{color:var(--acc)}
.cmp .cl{font-size:30px;font-weight:600;margin-top:18px;line-height:1.25}
.arrow{font-family:Anton;font-size:90px;color:var(--acc);align-self:center;padding-bottom:60px}
.note{font-size:var(--b,36px);line-height:1.35;font-weight:600;margin-top:44px;max-width:880px}
.note b{color:var(--acc);font-weight:800}
.line h1,.donut h1{font-size:var(--h,72px);margin-bottom:40px}
.lc svg{display:block;overflow:visible}
.lc .pl{fill:none;stroke:color-mix(in srgb,var(--fg) 55%,transparent);stroke-width:8;stroke-linejoin:round;stroke-linecap:round}
.lc .ar{fill:color-mix(in srgb,var(--fg) 8%,transparent)}
.lc .pt{fill:var(--bg);stroke:var(--fg);stroke-width:6}
.lc .pt.hi{fill:var(--acc);stroke:var(--acc)}
.lc .vl{font-family:Anton;font-size:44px;fill:var(--fg);text-anchor:middle}
.lc .vl.hi{fill:var(--acc)}
.lc .xl{font-family:Inter;font-weight:600;font-size:28px;fill:var(--fg);opacity:.75;text-anchor:middle}
.dn{display:flex;align-items:center;gap:56px}
.dn svg{flex:0 0 auto}
.dn .rt{fill:none;stroke:color-mix(in srgb,var(--fg) 14%,transparent)}
.dn .rv{fill:none;stroke:var(--acc);stroke-linecap:butt}
.dn .dv{font-family:Anton;font-size:var(--n,120px);fill:var(--acc);text-anchor:middle;dominant-baseline:central}
.dn .dl{font-size:var(--b,40px);font-weight:600;line-height:1.3}
.dn .dl b{color:var(--acc);font-weight:800}
.h2h h1,.timeline h1,.split h1,.dots h1{font-size:var(--h,72px);margin-bottom:40px}
.hh .nm{display:flex;justify-content:space-between;font-family:Anton;font-size:52px;text-transform:uppercase;margin-bottom:26px;gap:24px}
.hh .nm .b{color:var(--acc);text-align:right}
.hh .r{margin-bottom:26px}
.hh .rl{text-align:center;font-size:26px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;opacity:.75;margin-bottom:10px}
.hh .rb{display:flex;align-items:center;gap:8px}
.hh .sd{flex:1;display:flex;align-items:center;gap:14px}
.hh .sd.a{justify-content:flex-end}
.hh .br{height:46px;background:color-mix(in srgb,var(--fg) 55%,transparent)}
.hh .sd.b .br{background:var(--acc)}
.hh .vv{font-family:Anton;font-size:42px;white-space:nowrap}
.hh .sd.b .vv{color:var(--acc)}
.hh .r.win-a .sd.a .br{background:var(--fg)}
.tl{position:relative;padding-left:64px}
.tl:before{content:'';position:absolute;left:17px;top:14px;bottom:14px;width:6px;background:color-mix(in srgb,var(--fg) 25%,transparent)}
.tl .ev{position:relative;margin-bottom:34px}
.tl .ev:last-child{margin-bottom:0}
.tl .ev:before{content:'';position:absolute;left:-60px;top:8px;width:28px;height:28px;border-radius:50%;background:var(--bg);border:6px solid var(--fg)}
.tl .ev.hi:before{background:var(--acc);border-color:var(--acc)}
.tl .dt{font-family:Anton;font-size:46px;line-height:1;text-transform:uppercase}
.tl .ev.hi .dt{color:var(--acc)}
.tl .tx{font-size:var(--b,32px);line-height:1.3;font-weight:600;margin-top:6px;max-width:820px}
.sp .bar100{display:flex;height:130px;width:904px;margin-bottom:40px}
.sp .seg{height:100%;display:flex;align-items:center;justify-content:center;font-family:Anton;font-size:44px;color:var(--bg);overflow:hidden;white-space:nowrap}
.sp .lg{display:flex;flex-direction:column;gap:18px}
.sp .li{display:flex;align-items:center;gap:20px;font-size:var(--b,34px);font-weight:600}
.sp .sq{width:34px;height:34px;flex:0 0 auto}
.sp .li .v{margin-left:auto;font-family:Anton;font-size:44px;font-weight:400}
.sp .li.hi .v{color:var(--acc)}
.dg{display:flex;align-items:center;gap:50px}
.dg .grid{display:grid;gap:14px;flex:0 0 auto}
.dg .grid i{border-radius:50%;background:color-mix(in srgb,var(--fg) 18%,transparent)}
.dg .grid i.on{background:var(--acc)}
.dg .dd{font-family:Anton;font-size:var(--n,100px);line-height:1;color:var(--acc);white-space:nowrap}
.dg .dl2{font-size:var(--b,36px);font-weight:600;line-height:1.3;margin-top:14px}
.dg .dl2 b{color:var(--acc);font-weight:800}
.lgs{display:flex;gap:18px;margin-bottom:30px;align-items:center}
.lgo{width:var(--lg,92px);height:var(--lg,92px);border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;flex:0 0 auto;box-shadow:0 0 0 4px color-mix(in srgb,var(--fg) 15%,transparent)}
.lgo img{width:80%;height:80%;object-fit:contain}
.lgo.sm{--lg:58px}
.lb .nmw{display:flex;align-items:center;gap:16px}
.hh .nm .side{display:flex;align-items:center;gap:16px}
.hh .nm .side.b{flex-direction:row-reverse}
.cmp .lgo{margin-bottom:18px}
.tl .ev .lgo{position:absolute;right:0;top:0}
`;

const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fmt = s => esc(s).replace(/\*(.+?)\*/g, '<b>$1</b>');
const fmtH = s => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');

function img(p) {
  const abs = path.resolve(baseDir, p);
  const ext = path.extname(abs).slice(1).toLowerCase().replace('jpg', 'jpeg');
  return `data:image/${ext};base64,${fs.readFileSync(abs).toString('base64')}`;
}

const LG = (p, cls = '') => p ? `<div class="lgo ${cls}"><img src="${img(p)}"></div>` : '';
const RUB = {
  'explained': 't-orange', 'case study': '', 'power play': 't-paper', 'deep dive': 't-blue',
};

function slide(s, i, total) {
  const rub = (s.kicker || data.rubrica || 'GG on Sport');
  const isCover = s.type === 'cover';
  let theme = s.theme ? 't-' + s.theme : (isCover ? (RUB[rub.toLowerCase()] ?? '') : '');
  const bg = s.image ? `<div class="bg" style="background-image:url(${img(s.image)});background-position:${s.focus || 'center'}"></div><div class="shade"></div>` : '';
  if (s.image) theme = 'has-img';
  const date = (isCover && data.date) ? `<div class="date">${esc(data.date)}</div>` : '';
  const top = `<div class="top"><div class="kick">${esc(rub)}</div><div class="meta">${date}<div class="n">${i + 1}/${total}</div></div></div>`;
  const last = i === total - 1;
  const foot = `<div class="foot"><div class="sig">GG<span>.</span></div><div class="swipe">${last ? '@ggonsport' : 'swipe →'}</div></div>`;
  const tag = (s.tag ? `<div class="tag">${esc(s.tag)}</div>` : '') + ((s.logos && !isCover && s.type !== 'end') ? `<div class="lgs">${s.logos.map(p => LG(p)).join('')}</div>` : '');
  const src = s.source ? `<div class="src">Source: ${esc(s.source)}</div>` : '';
  let inner;
  switch (s.type) {
    case 'cover':
      inner = `<div class="grow"></div><div class="fit">${tag}<div class="bar"></div><h1>${fmtH(s.title)}</h1>${s.sub ? `<div class="sub">${fmt(s.sub)}</div>` : ''}</div>`; break;
    case 'stat':
      inner = `<div class="grow"></div><div class="fit">${tag}<div class="num">${esc(s.stat)}</div><div class="lab">${fmt(s.body)}</div>${src}</div><div class="grow"></div>`; break;
    case 'bars': {
      // items: [{label, value (numero), display (testo mostrato)}], highlight: indice da evidenziare
      const max = Math.max(...s.items.map(x => x.value));
      const rows = s.items.map((x, k) => `<div class="row${k === s.highlight ? ' hi' : ''}"><div class="lb"><span class="nmw">${LG(x.logo, 'sm')}${esc(x.label)}</span><span class="v">${esc(x.display ?? x.value)}</span></div><div class="track"><div class="fill" style="width:${Math.max(2, x.value / max * 100)}%"></div></div></div>`).join('');
      inner = `<div class="grow"></div><div class="fit">${tag}${s.title ? `<h1>${fmtH(s.title)}</h1>` : ''}<div class="bars">${rows}</div>${s.body ? `<div class="note">${fmt(s.body)}</div>` : ''}${src}</div><div class="grow"></div>`; break;
    }
    case 'compare': {
      // a, b: {label, value (numero), display}; la colonna b è evidenziata
      const max = Math.max(s.a.value, s.b.value), H = 340;
      const col = (x, hi) => `<div class="col${hi ? ' hi' : ''}">${LG(x.logo, 'sm')}<div class="val">${esc(x.display ?? x.value)}</div><div class="blk" style="height:${Math.max(16, x.value / max * H)}px"></div><div class="cl">${esc(x.label)}</div></div>`;
      inner = `<div class="grow"></div><div class="fit">${tag}${s.title ? `<h1>${fmtH(s.title)}</h1>` : ''}<div class="cmp">${col(s.a, false)}<div class="arrow">→</div>${col(s.b, true)}</div>${s.body ? `<div class="note">${fmt(s.body)}</div>` : ''}${src}</div><div class="grow"></div>`; break;
    }
    case 'line': {
      // points: [{label (asse x, es. anno), value (numero), display}], highlight: indice (default ultimo)
      const P = s.points, W = 904, H = 400, pad = 60, hi = s.highlight ?? P.length - 1;
      const vs = P.map(p => p.value), mn = s.min ?? Math.min(0, ...vs), mx = s.max ?? Math.max(...vs);
      const X = k => pad + k * (W - 2 * pad) / Math.max(1, P.length - 1), Y = v => 70 + (1 - (v - mn) / ((mx - mn) || 1)) * (H - 70);
      const d = P.map((p, k) => `${k ? 'L' : 'M'}${X(k).toFixed(1)} ${Y(p.value).toFixed(1)}`).join(' ');
      const area = `${d} L${X(P.length - 1).toFixed(1)} ${H} L${X(0).toFixed(1)} ${H} Z`;
      const pts = P.map((p, k) => `<circle class="pt${k === hi ? ' hi' : ''}" cx="${X(k)}" cy="${Y(p.value)}" r="${k === hi ? 16 : 11}"/><text class="vl${k === hi ? ' hi' : ''}" x="${X(k)}" y="${Y(p.value) - 30}">${esc(p.display ?? p.value)}</text><text class="xl" x="${X(k)}" y="${H + 50}">${esc(p.label)}</text>`).join('');
      const svg = `<svg width="${W}" height="${H + 70}"><path class="ar" d="${area}"/><path class="pl" d="${d}"/>${pts}</svg>`;
      inner = `<div class="grow"></div><div class="fit">${tag}${s.title ? `<h1>${fmtH(s.title)}</h1>` : ''}<div class="lc">${svg}</div>${s.body ? `<div class="note">${fmt(s.body)}</div>` : ''}${src}</div><div class="grow"></div>`; break;
    }
    case 'donut': {
      // value: percentuale 0-100, display: testo al centro (es. "62%"), label: cosa rappresenta
      const R = 170, SW = 64, C = 2 * Math.PI * R, v = Math.max(0, Math.min(100, s.value));
      const svg = `<svg width="${2 * R + SW}" height="${2 * R + SW}" viewBox="0 0 ${2 * R + SW} ${2 * R + SW}"><g transform="rotate(-90 ${R + SW / 2} ${R + SW / 2})"><circle class="rt" cx="${R + SW / 2}" cy="${R + SW / 2}" r="${R}" stroke-width="${SW}"/><circle class="rv" cx="${R + SW / 2}" cy="${R + SW / 2}" r="${R}" stroke-width="${SW}" stroke-dasharray="${(C * v / 100).toFixed(1)} ${C.toFixed(1)}"/></g><text class="dv" x="${R + SW / 2}" y="${R + SW / 2}">${esc(s.display ?? v + '%')}</text></svg>`;
      inner = `<div class="grow"></div><div class="fit">${tag}${s.title ? `<h1>${fmtH(s.title)}</h1>` : ''}<div class="dn">${svg}<div class="dl">${fmt(s.label)}</div></div>${s.body ? `<div class="note">${fmt(s.body)}</div>` : ''}${src}</div><div class="grow"></div>`; break;
    }
    case 'h2h': {
      // a, b: {name}; rows: [{label, a (numero), b (numero), da, db (testo mostrato)}]; b è il lato evidenziato
      const rows = s.rows.map(r => { const m = Math.max(r.a, r.b) || 1;
        return `<div class="r${r.a > r.b ? ' win-a' : ''}"><div class="rl">${esc(r.label)}</div><div class="rb"><div class="sd a"><span class="vv">${esc(r.da ?? r.a)}</span><div class="br" style="width:${Math.max(6, r.a / m * 300)}px"></div></div><div class="sd b"><div class="br" style="width:${Math.max(6, r.b / m * 300)}px"></div><span class="vv">${esc(r.db ?? r.b)}</span></div></div></div>`; }).join('');
      inner = `<div class="grow"></div><div class="fit">${tag}${s.title ? `<h1>${fmtH(s.title)}</h1>` : ''}<div class="hh"><div class="nm"><span class="side">${LG(s.a.logo, 'sm')}${esc(s.a.name)}</span><span class="side b">${LG(s.b.logo, 'sm')}<span class="b">${esc(s.b.name)}</span></span></div>${rows}</div>${s.body ? `<div class="note">${fmt(s.body)}</div>` : ''}${src}</div><div class="grow"></div>`; break;
    }
    case 'timeline': {
      // events: [{date, text}], highlight: indice (default ultimo)
      const hi = s.highlight ?? s.events.length - 1;
      const evs = s.events.map((e, k) => `<div class="ev${k === hi ? ' hi' : ''}">${LG(e.logo, 'sm')}<div class="dt">${esc(e.date)}</div><div class="tx">${fmt(e.text)}</div></div>`).join('');
      inner = `<div class="grow"></div><div class="fit">${tag}${s.title ? `<h1>${fmtH(s.title)}</h1>` : ''}<div class="tl">${evs}</div>${src}</div><div class="grow"></div>`; break;
    }
    case 'split': {
      // parts: [{label, value (numero), display}] che sommano il totale; highlight: indice
      const tot = s.parts.reduce((a, p) => a + p.value, 0) || 1, hi = s.highlight ?? 0;
      const shades = [70, 45, 28, 16, 9]; let j = 0;
      const col = k => k === hi ? 'var(--acc)' : `color-mix(in srgb,var(--fg) ${shades[Math.min(j++, 4)]}%,transparent)`;
      const cols = s.parts.map((p, k) => col(k));
      const segs = s.parts.map((p, k) => `<div class="seg" style="width:${p.value / tot * 100}%;background:${cols[k]}">${p.value / tot > 0.14 ? esc(p.display ?? p.value) : ''}</div>`).join('');
      const lg = s.parts.map((p, k) => `<div class="li${k === hi ? ' hi' : ''}"><div class="sq" style="background:${cols[k]}"></div><span>${esc(p.label)}</span><span class="v">${esc(p.display ?? p.value)}</span></div>`).join('');
      inner = `<div class="grow"></div><div class="fit">${tag}${s.title ? `<h1>${fmtH(s.title)}</h1>` : ''}<div class="sp"><div class="bar100">${segs}</div><div class="lg">${lg}</div></div>${s.body ? `<div class="note">${fmt(s.body)}</div>` : ''}${src}</div><div class="grow"></div>`; break;
    }
    case 'dots': {
      // n: totale pallini (max 100), hi: quanti evidenziati, cols: colonne, display: es. "7 su 20", label
      const n = Math.min(s.n || 10, 100), cols = s.cols || (n <= 10 ? 5 : 10), rows = Math.ceil(n / cols);
      const sz = Math.floor(Math.min((440 - 14 * (cols - 1)) / cols, (440 - 14 * (rows - 1)) / rows));
      const g = Array.from({ length: n }, (_, k) => `<i class="${k < (s.hi || 0) ? 'on' : ''}" style="width:${sz}px;height:${sz}px"></i>`).join('');
      inner = `<div class="grow"></div><div class="fit">${tag}${s.title ? `<h1>${fmtH(s.title)}</h1>` : ''}<div class="dg"><div class="grid" style="grid-template-columns:repeat(${cols},${sz}px)">${g}</div><div><div class="dd">${esc(s.display ?? s.hi)}</div><div class="dl2">${fmt(s.label)}</div></div></div>${s.body ? `<div class="note">${fmt(s.body)}</div>` : ''}${src}</div><div class="grow"></div>`; break;
    }
    case 'end':
      inner = `<div class="grow"></div><div class="fit"><div class="bar"></div><h1>${fmtH(s.title)}</h1><div class="cta">${fmt(s.body)}</div></div><div class="grow"></div>`; break;
    default:
      inner = `<div class="grow"></div><div class="fit">${tag}${s.title ? `<h1>${fmtH(s.title)}</h1>` : ''}<div class="body">${fmt(s.body)}</div>${src}</div><div class="grow"></div>`;
  }
  return `<div class="s ${s.type || 'text'} ${theme}">${bg}<div class="z">${top}${inner}${foot}</div></div>`;
}

// Riduce titolo e testo finché il contenuto entra nella slide; segnala se non ci sta.
async function fit(page) {
  return page.evaluate(() => {
    const s = document.querySelector('.s');
    const wide = sel => [...s.querySelectorAll(sel)].some(e => e.scrollWidth > e.clientWidth + 2);
    // 1) numeri del confronto: rimpiccioliscili finché stanno nella colonna
    let n = 110, steps = 0;
    while (wide('.cmp .val') && n > 50) { n *= 0.95; s.style.setProperty('--n', n + 'px'); steps++; }
    // 2) spazio verticale e parole troppo larghe: rimpicciolisci titolo e testo
    const h = s.querySelector('h1,.num'), b = s.querySelector('.body,.sub,.lab,.cta,.note,.lb,.tx,.dl,.dl2');
    const top = s.querySelector('.top').getBoundingClientRect(), ft = s.querySelector('.foot').getBoundingClientRect();
    const over = () => { const f = s.querySelector('.fit').getBoundingClientRect();
      return f.top < top.bottom + 24 || f.bottom > ft.top - 24 || wide('h1,.num,.lb'); };
    let hs = h ? parseFloat(getComputedStyle(h).fontSize) : 0, bs = b ? parseFloat(getComputedStyle(b).fontSize) : 0;
    let k = 0;
    while (over() && k < 40) {
      if (h && hs > 60) { hs *= 0.94; s.style.setProperty('--h', hs + 'px'); }
      if (b && bs > 28 && k % 2) { bs *= 0.96; s.style.setProperty('--b', bs + 'px'); }
      k++;
    }
    return { ok: !over() && !wide('.cmp .val'), steps: steps + k };
  });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  const total = data.slides.length;
  let problems = 0;
  for (let i = 0; i < total; i++) {
    await page.setContent(`<html><head><style>${css}</style></head><body>${slide(data.slides[i], i, total)}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    const r = await fit(page);
    const f = path.join(outDir, `${String(i + 1).padStart(2, '0')}.png`);
    await page.screenshot({ path: f });
    if (!r.ok) { problems++; console.log(`${f}  ATTENZIONE: testo troppo lungo, accorcialo`); }
    else console.log(f + (r.steps ? `  (testo ridotto ${r.steps}x)` : ''));
  }
  await browser.close();
  if (problems) process.exit(2);
})();
