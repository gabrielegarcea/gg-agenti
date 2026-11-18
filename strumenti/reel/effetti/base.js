// GG Motion — libreria effetti (base). Caricata da render.js nella pagina, PRIMA del motore.
// Idee e matematica delle animazioni riprese da Remocn (https://github.com/Remocn/remocn, licenza MIT,
// vedi LICENSE-remocn.txt), riscritte in JavaScript semplice: niente React, niente Remotion, niente npm.
//
// REGOLA D'ORO: ogni funzione di disegno e' PURA nel tempo. Riceve il tempo e imposta gli stili;
// non accumula stato fra un fotogramma e l'altro (le anteprime chiamano draw(t) in ordine sparso).
// Lo stato ammesso e' solo quello di preparazione (testo spezzato in span, nodi creati una volta).
window.FX = window.FX || {};
['text', 'num', 'trans', 'bg', 'cam', 'els', 'enter', 'kar', 'emph'].forEach(k => { FX[k] = FX[k] || {}; });

FX.C = { paper: '#F4F1EA', ink: '#0B1F3A', blue: '#1F4FD1', orange: '#FF6A13', gray: '#B4AEA2', line: '#DDD7CB', mark: '#FFC9A3', mute: '#6E6A62' };

FX.css = (s) => { const st = document.createElement('style'); st.textContent = s; document.head.appendChild(st); };

FX.u = (() => {
  const clamp = (x, a = 0, b = 1) => Math.min(Math.max(x, a), b);
  const lerp = (a, b, p) => a + (b - a) * p;
  // come interpolate() di Remotion: mappa x da [i0..iN] a [o0..oN], a tratti lineari, con clamp di default
  const interp = (x, inR, outR, opt) => {
    const cl = !opt || opt.clamp !== false; const ez = (opt && opt.ease) || (p => p);
    if (x <= inR[0]) return cl ? outR[0] : outR[0] + (x - inR[0]) * (outR[1] - outR[0]) / (inR[1] - inR[0]);
    for (let i = 0; i < inR.length - 1; i++) if (x <= inR[i + 1]) { const p = (x - inR[i]) / (inR[i + 1] - inR[i]); return lerp(outR[i], outR[i + 1], ez(p)); }
    const n = inR.length - 1; return cl ? outR[n] : outR[n] + (x - inR[n]) * (outR[n] - outR[n - 1]) / (inR[n] - inR[n - 1]);
  };
  // come spring() di Remotion (forma chiusa): t in secondi, ritorna 0 -> 1 con eventuale rimbalzo
  const spring = (t, cfg) => {
    if (t <= 0) return 0;
    const c = Object.assign({ damping: 10, mass: 1, stiffness: 100 }, cfg || {});
    const w0 = Math.sqrt(c.stiffness / c.mass), z = c.damping / (2 * Math.sqrt(c.stiffness * c.mass));
    if (z < 1) { const wd = w0 * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t)); }
    if (z === 1) return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
    const r1 = -w0 * (z - Math.sqrt(z * z - 1)), r2 = -w0 * (z + Math.sqrt(z * z - 1)); const A = r2 / (r2 - r1), B = -r1 / (r2 - r1);
    return 1 - (A * Math.exp(r1 * t) + B * Math.exp(r2 * t));
  };
  const E = {
    lin: p => clamp(p), outCubic: p => 1 - Math.pow(1 - clamp(p), 3), inCubic: p => Math.pow(clamp(p), 3),
    inOutCubic: p => { p = clamp(p); return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; },
    outQuart: p => 1 - Math.pow(1 - clamp(p), 4), inOutQuart: p => { p = clamp(p); return p < .5 ? 8 * p ** 4 : 1 - Math.pow(-2 * p + 2, 4) / 2; },
    outExpo: p => { p = clamp(p); return p >= 1 ? 1 : 1 - Math.pow(2, -10 * p); },
    inExpo: p => { p = clamp(p); return p <= 0 ? 0 : Math.pow(2, 10 * p - 10); },
    inOutExpo: p => { p = clamp(p); return p === 0 ? 0 : p === 1 ? 1 : p < .5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2; },
    outBack: p => { p = clamp(p); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
    outElastic: p => { p = clamp(p); return p === 0 ? 0 : p === 1 ? 1 : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * (2 * Math.PI) / 3) + 1; },
    outBounce: p => { p = clamp(p); const n = 7.5625, d = 2.75; if (p < 1 / d) return n * p * p; if (p < 2 / d) return n * (p -= 1.5 / d) * p + .75; if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + .9375; return n * (p -= 2.625 / d) * p + .984375; },
  };
  // numeri pseudo-casuali deterministici
  const hash = (s) => { s = String(s); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
  const rnd = (seed, i) => hash(seed + ':' + i);
  // noise 1D liscio (per tremolii e derive), deterministico
  const noise = (x, seed) => { const i = Math.floor(x), f = x - i, a = rnd(seed || 'n', i), b = rnd(seed || 'n', i + 1), u = f * f * (3 - 2 * f); return lerp(a, b, u) * 2 - 1; };
  // spezza il testo di un nodo in span (lettere o parole) conservando <b> (evidenziato). Una volta sola.
  const split = (node, mode) => {
    if (node._fxSplit && node._fxSplit.mode === mode) return node._fxSplit.parts;
    const parts = []; const src = node._fxSrc || (node._fxSrc = node.innerHTML);
    const tmp = document.createElement('div'); tmp.innerHTML = src; const out = document.createDocumentFragment();
    const walk = (n, parent) => { n.childNodes.forEach(ch => {
      if (ch.nodeType === 3) {
        const toks = mode === 'chars' ? Array.from(ch.textContent) : ch.textContent.split(/(\s+)/);
        toks.forEach(tok => { if (tok === '') return; if (/^\s+$/.test(tok)) { parent.appendChild(document.createTextNode(tok)); return; }
          if (mode === 'chars' && tok === ' ') { parent.appendChild(document.createTextNode(' ')); return; }
          const sp = document.createElement('span'); sp.className = 'fxp'; sp.style.display = 'inline-block'; sp.style.whiteSpace = 'pre'; sp.textContent = tok; parent.appendChild(sp); parts.push(sp); });
      } else { const cl = ch.cloneNode(false); parent.appendChild(cl); walk(ch, cl); } }); };
    walk(tmp, out); node.innerHTML = ''; node.appendChild(out);
    node._fxSplit = { mode, parts }; return parts;
  };
  const unsplit = (node) => { if (node._fxSrc != null) { node.innerHTML = node._fxSrc; node._fxSplit = null; } };
  return { clamp, lerp, interp, spring, E, hash, rnd, noise, split, unsplit };
})();

// Registrazione con descrizione: FX.add('text', 'blur-in', {desc, prep, draw}) — l'elenco serve a SCHEMA e al campionario
FX.catalog = FX.catalog || [];
FX.add = (kind, name, def) => { FX[kind][name] = def; FX.catalog.push({ kind, name, desc: def.desc || '', from: def.from || '' }); };
