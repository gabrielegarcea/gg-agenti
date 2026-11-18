// Rigenera catalogo.json ed EFFETTI.md da tutti i file di effetti (da lanciare dopo ogni modifica):
//   node catalogo.js        (dalla cartella strumenti/reel/effetti)
// catalogo.json serve a controllo.py per riconoscere nomi ed elementi; EFFETTI.md e' l'elenco per chi scrive il reel.
const fs = require('fs'), path = require('path'); const { chromium } = require('playwright');
(async () => {
  const D = __dirname, b = await chromium.launch(), p = await b.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message)); await p.setContent('<html><head></head><body></body></html>');
  const fl = fs.readdirSync(D).filter(f => f.endsWith('.js') && f !== 'catalogo.js').sort((a, c) => (a === 'base.js' ? -1 : c === 'base.js' ? 1 : a.localeCompare(c)));
  for (const f of fl) await p.addScriptTag({ content: fs.readFileSync(path.join(D, f), 'utf8') });
  const cat = await p.evaluate(() => FX.catalog); await b.close();
  if (errs.length) { console.error('ERRORE nei file di effetti: ' + errs.join(' | ')); process.exit(1); }
  const seen = {}, dup = []; cat.forEach(x => { const k = x.kind + ':' + x.name; if (seen[k]) dup.push(k); seen[k] = 1; });
  if (dup.length) { console.error('ERRORE nomi doppi: ' + dup.join(', ')); process.exit(1); }
  const out = {}; cat.forEach(x => { (out[x.kind] = out[x.kind] || {})[x.name] = { desc: x.desc, grafico: x.kind === 'els' && /^grafico\./i.test(x.desc) }; });
  fs.writeFileSync(path.join(D, 'catalogo.json'), JSON.stringify(out, null, 1));
  const T = { text: 'Testo: comparse di righe (`"anim"` su un elemento `text`), titoli dei capitoli (`style.titles` o `titleAnim` sul capitolo), titolo di copertina (`cover.anim`). Opzioni in `"fx":{...}` o sull\'elemento (vedi descrizione).',
    num: 'Numero gigante: `"anim"` su un elemento `bignum`.', els: 'Elementi nuovi: `{"type": "<nome>", ...}` dentro `els`. Quelli marcati GRAFICO contano come grafico (uno per tipo per reel). Con `items` ogni voce compare sul suo marker.',
    enter: 'Entrata di un elemento intero: `"enter": "<nome>"` su qualsiasi elemento (per i `logos`, ogni logo entra sul suo marker).',
    trans: 'Transizioni fra capitoli: `style.transition` per tutto il reel, `"transition"` sul capitolo per quello che entra.', cam: 'Camera sul capitolo: `style.camera` o `"camera"` sul capitolo.',
    bg: 'Sfondo animato discreto: `style.bg` (uno per reel), opzioni in `style.bgOpts` (`o` intensita\' 0-1, `mode`, `tint`, `speed`, `seed`).', kar: 'Stile dei sottotitoli: `style.kar`.' };
  let md = '# Effetti del motore dei reel\n\nGenerato da `catalogo.js` (non modificarlo a mano). Idee da Remocn (MIT), riscritte senza dipendenze. Tutti facoltativi: senza questi campi il reel e\' identico a prima.\n';
  for (const k of ['text', 'num', 'els', 'enter', 'trans', 'cam', 'bg', 'kar']) { const v = out[k] || {}; md += '\n## ' + k + ' (' + Object.keys(v).length + ')\n' + T[k] + '\n\n';
    Object.entries(v).forEach(([n, x]) => { md += '- `' + n + '`' + (x.grafico ? ' GRAFICO' : '') + ': ' + x.desc.replace(/^grafico\.\s*/i, '').replace(/\n/g, ' ') + '\n'; }); }
  fs.writeFileSync(path.join(D, 'EFFETTI.md'), md);
  console.log('catalogo OK: ' + Object.entries(out).map(([k, v]) => k + ' ' + Object.keys(v).length).join(', '));
})();
