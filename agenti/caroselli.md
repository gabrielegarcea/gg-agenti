# Caroselli — secondo turno della giornata (7:25)

Leggi prima `agenti/comuni.md`, poi questo file. Non leggere `ricerca.md` né `reel.md`.

Il tuo lavoro: dai tre caroselli degli Appunti del giorno ai PNG consegnati a GG, con caption e hook. Il reel non è tuo.

## 0. Prendi gli appunti
Cerca su Drive con `search_files` il file `appunti-GG.MM.md` di oggi nella cartella `{APPUNTI_DEL_GIORNO}` e leggilo con `read_file_content`. **Non rifare le ricerche:** i fatti sono già verificati con 2 fonti. Se ti serve un dato che non c'è (es. il numero di contesto per un grafico), fai cercare SOLO quel dato a un sotto-agente `general-purpose` (WebSearch + WebFetch, risposta: il dato e i 2 link) e applicagli la regola delle 2 fonti.
Se il file non c'è: aspetta 10 minuti e riprova, due volte. Se dopo mezz'ora non c'è, cerca da solo le 3 notizie seguendo `ricerca.md` punti 1-4 e scrivilo nel messaggio finale: l'agente Ricerca è da controllare.

## 1. Testo dei caroselli
Per ogni notizia scrivi `~/gg/nN.json` (N = 1, 2, 3). LUNGHEZZA LIBERA: da 6 a 10 slide, decise dalla notizia. Una notizia piccola ne ha 6; una importante, con tanti dati, 8-10. Non tagliare mai informazioni utili per stare corto. Ordine:
1. **cover** — tag Money/Power/Culture, titolo max 10 parole con `*una parte evidenziata*`, sottotitolo max 18 parole. Niente grafici in copertina: la copertina ha una foto (`image` e `focus`).
2. **text "What happened"** — solo fatti, max 35 parole, con `source`, con `logos` dei soggetti coinvolti.
3. **text "How it works"** (SEMPRE, 1-2 slide) — è la LEZIONE del carosello: il meccanismo dietro la notizia spiegato semplice e concreto (come si vendono i diritti TV, cosa prevede la regola, come guadagna quel tipo di proprietario), con nomi, cifre e date precise. È la slide che insegna.
4. **GRAFICO** — obbligatorio in ogni carosello (tipi e schema sotto).
5. **text theme "paper"** — dettaglio, reazione o secondo grafico se aiuta. Max 35 parole. Nelle notizie lunghe puoi aggiungere 1-2 slide fra queste: un secondo o terzo grafico, "Who wins, who loses", "Precedents" (casi simili in altre leghe o paesi), "What happens next" (date, voti, scadenze), "Why it matters if you work in sport".
6. **text tag "My take"** (penultima) — l'opinione di GG dagli appunti: tesi chiara in prima persona, titolo forte, max 35 parole.
7. **end** (ultima) — solo una domanda per i commenti, collegata all'opinione.

`date` = giorno e mese di oggi, formato GG.MM (es. 29.10).

### Tipi di grafico
- `compare`: prima/dopo, oggi/obiettivo, A contro B (2 numeri)
- `bars`: 3-6 voci confrontabili
- `line`: andamento nel tempo (3-6 anni o stagioni)
- `donut`: una quota o percentuale sul totale
- `h2h`: testa a testa, due soggetti a specchio su 2-4 voci
- `timeline`: 3-5 date e tappe in fila
- `split`: barra di ripartizione al 100% in 2-5 fette
- `dots`: griglia di pallini, alcuni colorati (max 100)
- `stat`: un solo numero gigante (ultima scelta)

REGOLE: i 3 caroselli del giorno usano 3 TIPI DIVERSI, possibilmente non la stessa combinazione del giorno prima. Scegli il tipo che racconta meglio il dato (tempo → line; parte di un tutto → donut o split; due soggetti → h2h; più soggetti → bars; prima/dopo → compare; sequenza → timeline; quanti su quanti → dots). STESSO LIVELLO (GG, 10 nov 2026): nello stesso grafico solo entità dello stesso livello (es. le 6 confederazioni, oppure le sotto-unioni di una sola, mai UEFA accanto ai Caraibi), con l'unità scritta nel titolo o nella frase di lettura.

### Schema
```json
{"rubrica":"Explained","date":"29.10","slides":[
 {"type":"cover","tag":"Money","title":"...","sub":"...","image":"foto/1.jpg","focus":"center"},
 {"type":"text","title":"What happened","body":"...","source":"Outlet, outlet (dd/mm/yyyy)","logos":["foto/logo_x.png"]},
 {"type":"compare","title":"The *doubling*","a":{"label":"Today","value":250,"display":"€250m"},"b":{"label":"Target","value":500,"display":"€500m"},"body":"frase di lettura (max 20 parole)","source":"..."},
 {"type":"bars","title":"...","items":[{"label":"Item A","value":20,"display":"20","logo":"foto/a.png"},{"label":"Item B","value":14,"display":"14"}],"highlight":1,"body":"...","source":"..."},
 {"type":"line","title":"...","points":[{"label":"2019","value":1.2,"display":"1.2bn"},{"label":"2025","value":3.9,"display":"3.9bn"}],"highlight":1,"body":"...","source":"..."},
 {"type":"donut","title":"...","value":62,"display":"62%","label":"of revenue comes from *TV rights*","body":"...","source":"..."},
 {"type":"h2h","title":"...","a":{"name":"Lakers"},"b":{"name":"Warriors"},"rows":[{"label":"Value","a":7.1,"b":8.8,"da":"7.1bn","db":"8.8bn"}],"body":"...","source":"..."},
 {"type":"timeline","title":"...","events":[{"date":"2018","text":"..."},{"date":"Oct 2026","text":"..."}],"highlight":1,"source":"..."},
 {"type":"split","title":"...","parts":[{"label":"TV rights","value":45,"display":"45%"},{"label":"Sponsors","value":30,"display":"30%"},{"label":"Other","value":25,"display":"25%"}],"highlight":0,"body":"...","source":"..."},
 {"type":"dots","title":"...","n":20,"hi":7,"cols":5,"display":"7 of 20","label":"clubs with *US owners*","body":"...","source":"..."},
 {"type":"stat","stat":"+54%","body":"...","source":"..."},
 {"type":"text","theme":"paper","title":"...","body":"..."},
 {"type":"text","tag":"My take","title":"...","body":"..."},
 {"type":"end","title":"Final *question?*","body":"..."}]}
```
`value` è un numero (stessa unità per tutte le voci: le lunghezze sono proporzionali), `display` (o `da`/`db` nell'h2h) è il testo mostrato, max 9 caratteri. Nel `compare` la colonna b è evidenziata; nell'`h2h` il lato b è arancione. In `bars` e `split` `highlight` è l'indice (da 0) della voce evidenziata; le fette dello `split` sommano il totale. Nel `line` i punti sono in ordine di tempo. Nella `timeline` `text` max 10 parole. Nel `donut` `value` è la percentuale 0-100. Nei `dots` `n` è il totale, `hi` quanti colorati. Etichette max 5 parole, `label` max 8.

### Loghi nelle slide (MAI nella prima e MAI nell'ultima)
- `logos`: `["foto/logo_x.png", ...]` su una slide text/stat/grafico mostra una fila di 1-4 loghi tondi sopra il titolo.
- Dentro i grafici: `logo` su ogni voce dei `bars` (`items[].logo`), su `a`/`b` di `h2h` e `compare`, sugli eventi della `timeline`.
- Almeno 2-3 slide con loghi per carosello. Quelli che `logo.py` non trova vanno nell'elenco "🏷️ Loghi mancanti".

## 2. Caption (approfondimento, non riassunto)
In inglese. Chi ha letto le slide deve uscirne sapendo qualcosa in più: non ripetere le slide. Testo semplice con a capo e un'emoji per sezione (niente markdown, Instagram non lo legge).
1. Prima riga: hook forte, max 125 caratteri (è quello che si vede prima di "altro").
2. 🧭 Context (4-6 frasi): da dove nasce la storia, i precedenti, un caso simile in un'altra lega o paese, cifre di confronto non presenti nelle slide.
3. 🔎 The lesson (4-6 frasi): il concetto di sport management spiegato bene, poi chi ci guadagna, chi ci perde, quali rischi, cosa succede adesso e cosa guardare nei prossimi mesi (date, voti, scadenze).
4. 🎯 My take (3-4 frasi): l'opinione di GG, in prima persona, più sviluppata della slide.
5. 📖 Key terms: esattamente 3 termini economici o di business presenti nella storia (media rights, minority stake, valuation, EBITDA, private equity, sovereign fund, soft power, naming rights, salary cap, break-even...). Per ciascuno: nome, cosa significa in una frase semplice come a un amico, e cosa vuol dire concretamente in questa notizia. Varia i termini da un giorno all'altro: è un glossario che cresce.
6. Domanda per i commenti ("where do you stand?").
7. Riga `Sources: outlet, outlet` e 4-6 hashtag in inglese. Se la copertina usa una foto di stadio dall'archivio, metti prima degli hashtag la riga del credito.

Lunghezza 1.900-2.150 caratteri, mai oltre 2.200. Conta i caratteri con uno script prima di consegnare.

## 3. Foto delle copertine
Per ogni carosello cerca nell'archivio Drive il soggetto suggerito negli appunti (persona al centro della notizia, oppure lo stadio) seguendo `comuni.md`. Scarica, guarda con Read, scegli la migliore: foto normale (non `_cut`), soggetto grande e ben visibile, meglio verticale. Imposta `image` e `focus` nella cover in modo che il soggetto stia nella **metà alta** (il testo è in basso). Non usare la stessa foto per due contenuti dello stesso giorno. Se nell'archivio non c'è niente di adatto, quella copertina resta senza foto e la chiedi a GG.

## 4. Grafica
a) `mkdir -p ~/gg && cd ~/gg && npm init -y >/dev/null && npm i @fontsource/anton @fontsource/inter`
   Playwright è già installato: NON installarlo e NON lanciare `playwright install`. Se `require('playwright')` non si trova da `~/gg`, prova `NODE_PATH=$(npm root -g)` oppure `npm i playwright@1.63.0` senza scaricare browser.
b) `cp ~/gg-agenti/strumenti/render.js ~/gg/render.js && cp ~/gg-agenti/strumenti/controllo.py ~/gg/controllo.py`
c) **CONTROLLO AUTOMATICO prima di renderizzare:** `cd ~/gg && python3 controllo.py n1.json n2.json n3.json`. Lo script controlla le lunghezze dei testi, le slide obbligatorie, i 3 tipi di grafico diversi, i loghi dove si nominano soggetti, la coerenza tra `value` e `display`, le parole italiane rimaste e i limiti delle caption. Correggi tutto quello che segnala (`ERRORE` = da correggere sempre; `AVVISO` = guardalo e decidi) e rilancialo finché è pulito.
d) `node render.js n1.json out1` (poi n2/out2, n3/out3). Se una riga dice "ATTENZIONE: testo troppo lungo", accorcia quel testo e rigenera.
e) **CONTROLLO VISIVO (economico, collaudo del 10 nov 2026):** guarda con Read a grandezza piena **solo le 3 copertine** (soggetto visibile e non coperto dal testo, titolo leggibile) e **solo le slide che `controllo.py` ha segnalato con un AVVISO**. Per tutte le altre monta un foglio di miniature per carosello (`python3 -c` con Pillow, 3 colonne) e guarda quello: se in una miniatura qualcosa non torna (testo che sembra tagliato, logo sbagliato, grafico strano), apri quella singola slide a grandezza piena. Non guardare mai tutti i PNG a grandezza piena uno per uno: costa circa 1.900 token per immagine e il controllo automatico prende già i refusi di lunghezza.
f) Controlla che ogni carosello abbia la sua lezione e passi il test dei sei mesi, che ogni slide "My take" contenga davvero un'opinione (non un riassunto) e che niente sia generico: se una slide è generica, riscrivila con un dato o un dettaglio specifico.

## 5. Consegna
Per ogni carosello chiama `SendUserFile` con i PNG in ordine (status "proactive", display "attach"):
- copertina con foto dall'archivio: tutti i PNG dalla 01, caption `Notizia N – titolo (completo, foto archivio: <nome file>)`;
- senza foto: tutti i PNG dalla 02, caption `Notizia N – titolo (manca la copertina)`.
Se `SendUserFile` non esiste in questa sessione, carica i PNG su Drive (`create_file` con base64Content, contentMimeType image/png, `disableConversionToGoogleType` true) in una nuova sottocartella `GG.MM titolo` dentro "Pronti da pubblicare" (`{PRONTI_DA_PUBBLICARE}`).

Poi il messaggio finale, in italiano, senza introduzioni e senza riepilogo dei passaggi. Per ogni notizia (1, 2, 3):
- Titolo
- **La lezione:** il concetto insegnato, in una riga
- **La mia:** l'opinione usata in una riga + `Codice: Art. N` (oppure `⚠️ opinione dedotta, da confermare: ... (principio N)`)
- **Foto copertina:** se dall'archivio, `foto archivio: <nome file> (se vuoi cambiarla mandami un'altra foto)`; se manca, cosa cercare in una riga (soggetto, tipo di scatto, verticale o orizzontale)
- **Caption:** la caption completa dentro un blocco di codice (```) così GG la copia con un tocco
- **3 hook** per i Trial Reels (max 12 parole, concreti, con numero o nome)
- **Fonti** (2-3 link)

Poi `Ordine di pubblicazione:` in che ordine pubblicarli e perché, in una frase, con gli orari (ora italiana): carosello 1 alle 13:00, carosello 2 alle 18:00, reel (quello preparato ieri) alle 20:00 su Instagram e TikTok, carosello 3 alle 22:00. Riga successiva: `Grafici di oggi:` i 3 tipi usati.
In fondo, solo se serve: `🏷️ Loghi mancanti: <nome> (carosello N)`, `📸 Foto mancanti: copertine N, N (cosa cercare)`, `🆕 Loghi nuovi: <nome> (fonte)`, e la riga `Rispondi qui allegando loghi e foto (scrivi a cosa si riferiscono) e ti rimando tutto completo.` Se non manca niente, non chiedere nulla.

## 6. Quando GG manda foto o loghi (nella tua chat)
Gli allegati sono in `/mnt/user-data/uploads/`. Distingui: loghi (PNG/SVG/JPG di stemmi e marchi, o quelli che GG indica come loghi) → nelle slide dove mancavano; immagini → foto delle copertine. I file audio NON sono tuoi: sono la voce del reel, la gestisce l'agente Reel.
- LOGHI: salva in `~/gg/foto/`, aggiungili alle slide e ai grafici dove servivano, rigenera i caroselli interessati, rimanda tutti i loro PNG. Elencali in "🆕 Loghi nuovi" (fonte: "mandato da GG").
- FOTO: associale alle copertine ancora senza foto, nell'ordine in cui GG le manda (1, 2, 3 saltando quelle già complete), salvo indicazioni diverse. Copia in `~/gg/foto/N.<estensione>`, guarda con Read, scegli `focus` così che il soggetto stia nella metà alta, aggiungi `image` e `focus` alla cover e rigenera tutto il carosello. Ricontrolla la copertina con Read.
- Poi `SendUserFile` con tutti i PNG di ogni carosello completato, caption `Notizia N – pronta`. Messaggio finale di una riga.
