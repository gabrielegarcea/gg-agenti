# Schema del reel.json (motore `strumenti/reel/render.js`)

Scritto il 17 nov 2026 dal codice del motore: sostituisce la skill `gg-motion`, che nelle attività pianificate non c'è. Se questo file e `render.js` non dicono la stessa cosa, vale `render.js`.

```json
{
 "lang": "en",
 "audio": "voce-guida.wav",
 "style": {"titles": "rise", "transition": "ring", "hits": true},
 "cover": {...},
 "chapters": [{"title": "...", "sub": "...", "steps": [{"say": "...", "els": [...]}]}],
 "outro": {...}
}
```

- `style`: `titles` = `"rise"` (parole che salgono) o niente; `transition` = `ring` (anello del logo), `iris`, `wipe`, `rise`, `cut`; `hits` = colpo sonoro all'inizio dei capitoli; `loop` = torna alla cover alla fine. `sfx: false` (fuori da `style`) toglie gli effetti.
- I percorsi delle immagini (`photo`, `logo`, `logos`) sono relativi alla cartella del reel.json: da `~/ggm/lavoro/` i loghi in `~/gg/foto/` sono `"../../gg/foto/nome_logo.png"`.
- `*x*` = evidenziato, dove il testo passa da `md()` (cover `sub`/`bigLabel`, `text`, `timeline.text`, `term.def`, `ledger`, `bignum.label`, `donut.label`). Altrove (`title` dei capitoli, `sub`, etichette di `cards`/`bars`/`h2h`) gli asterischi si vedono: non usarli.

## cover
`{"title": ["One referee.", "*Two games.*"], "sub": "...", "say": "..."}` + UNO fra:
- `"photo": "file.png"` (scontornata; per una foto normale `"cutout": false`), oppure
- `"big": "2", "bigLabel": "NFL games, *one referee*"` (numero gigante; diverso dal `punch` dei capitoli).
Righe di `title` tra asterischi = riga arancione evidenziata. `note: {"text": "...", "x": 140, "y": 1110, "rot": -8}` facoltativa.

## chapters
`title` (corto, finisce col punto), `sub` (riga piccola, testo semplice), `steps`: ogni step = UNA frase `say` (corta, senza punti né virgole interne) + `els`. Gli elementi di tutti gli step del capitolo si accumulano nella stessa colonna: se sono troppi il motore rimpicciolisce tutto (controllalo nell'anteprima).

## outro
`{"title": ["Worth the", "spare tire?"], "options": ["Yes", "No", "Depends"], "say": "..."}`; facoltativi `kicker` (default YOUR CALL), `pollLabel` (default YOUR TAKE?), `cursor` (ordine dei clic, default `[0,1,2]`), `note`. Titolo: massimo 2 righe di ~12 caratteri.

## Elementi (`els`)
Nessun `at` e nessun `{marker}`: li mette `marker.py`. Fra parentesi lo slot che `marker.py` usa.

| tipo | campi | compare |
|---|---|---|
| `text` | `lines: ["...", "..."]`, `size` (px, facoltativo) | una riga per marker (`at` parallelo) |
| `logos` | `logos: ["file.png", ...]` | uno per marker. **Debole: mai da solo in uno step** |
| `timeline` | `events: [{"date": "FRI 13", "text": "max 10 parole", "logo": "facoltativo"}]`, `highlight` (default l'ultimo) | un evento per marker |
| `cards` | `items: [{"label": "max 5 parole", "value": 17, "prefix", "suffix", "color": "orange"/"white"}]` (`value` numero che sale, o testo fisso) | una card per marker |
| `bars` | `items: [{"label", "value", "display", "logo"}]`, `highlight` (indice), `max` | una barra per marker; 3-6 voci |
| `h2h` | `a: {"name", "logo"}`, `b: {...}`, `rows: [{"label", "a": 1, "b": 2, "da": "testo", "db": "testo"}]` | una riga per marker; 2-4 righe |
| `split` | `parts: [{"label", "value", "display"}]` (somma 100), `highlight` | una fetta per marker; 2-5 fette |
| `ledger` | `wins: [{"text": "max 6 parole"}]`, `loses: [...]`, `winsLabel`, `losesLabel` | una voce per marker; 2-3 per colonna |
| `bignum` | `to`, `from`, `prefix`, `suffix`, `decimals`, `label`, `note` (riga piccola, es. le fonti), `punch: true`, `color` | con lo step (nessuno slot) |
| `donut` | `value` (0-100), `display`, `label` (max 8 parole), `dur` | con lo step |
| `line` | `points` (3-6), `x0`, `x1`, `label`, `min`, `max`, `h` | con lo step |
| `dots` | `n` (max 100), `hi`, `cols`, `label`, `ordered` | con lo step; `hiAt` accende i pallini |
| `term` | `term` (max 4 parole), `def` (max 20), `kicker` | con lo step; mai nel capitolo 1 |
| `note` | `text`, `align`, `rot` | **debole: mai da solo** |
| `photo` | `src`, `h` | **debole: mai da solo** |

Gli elementi "con lo step" sono un solo evento per il controllo del ritmo: se la frase dura più di ~3 secondi, nello stesso step metti anche un `text` a 2-3 righe, o il controllo trova un buco sopra i 4 secondi.
Nello stesso reel ogni grafico (`timeline`, `cards`, `bars`, `h2h`, `split`, `bignum`, `donut`, `line`, `dots`) si usa una volta sola; `text`, `logos`, `term`, `ledger`, `note` si possono ripetere.
