# Reel — terzo turno della giornata (8:45)

Leggi prima `agenti/comuni.md`, poi questo file. Non leggere `ricerca.md` né `caroselli.md`.

Il tuo lavoro: dalla quarta notizia degli Appunti del giorno al reel di DOMANI, in **due tempi** (decisione di GG, 19 nov 2026):
1. **Prima il testo, niente video.** Scrivi il reel, lo controlli (marker, JSON, ritmo sulla voce guida) e mandi a GG SOLO il testo da leggere. Nessun render, nessuna anteprima, nessun file.
2. **Poi un solo render, con la voce vera.** Quando GG manda l'audio in questa chat, monti il reel con la sua voce e i sottotitoli precisi e lo mandi. È l'unico video della giornata.

**Perché:** fino al 18 nov il reel si renderizzava due volte (bozza muta + versione con la voce). La bozza muta GG non la usava: costava render, anteprime e controlli visivi per un video da buttare. Un render solo = meno token e contenuti pronti prima.

## 0. Prendi gli appunti
Cerca su Drive il file `appunti-GG.MM.md` di oggi nella cartella `{APPUNTI_DEL_GIORNO}` e leggi la sezione "Reel di domani". **Non rifare le ricerche:** i fatti sono verificati e il format di turno è già scelto. Se ti serve un dato che non c'è, fai cercare SOLO quel dato a un sotto-agente `general-purpose` (risposta: il dato e i 2 link). Se il file non c'è: aspetta 10 minuti e riprova due volte, poi scegli tu la notizia seguendo `ricerca.md` punto 3b e scrivilo nel messaggio finale.

## 1. I tre format in rotazione (GG, 10 nov 2026)
Il format di oggi è scritto negli appunti: **non cambiarlo** se non è impossibile da applicare (in quel caso passa al successivo nella rotazione Explainer → Confronto → Storia in 3 atti e spiega perché nel messaggio finale). La rotazione serve a non far sembrare il feed sempre uguale: lo stesso format non esce mai due giorni di fila.

In **tutti e tre** valgono gli elementi fissi decisi da GG: un elemento `term` (il concetto che il reel insegna, mai nel primo secondo, dentro il capitolo dove la voce lo spiega) e un capitolo `Who wins, who loses.` con l'elemento `ledger`, subito prima del capitolo `My take.`. Chi vince e chi perde sono fatti verificati, non opinioni.

**`My take.` solo da un articolo del Codice (GG, 19 nov 2026).** Se negli appunti c'è `nessun articolo → Your call`, il capitolo si chiama `Your call.`: le due posizioni vere, una frase ciascuna, attribuite a chi le sostiene ("LaLiga says...", "Real Madrid argues..."), con un elemento `text` a due righe; nessuna opinione di GG. Il sondaggio dell'outro chiede da che parte sta lo spettatore.

### Format A — Explainer (quello di sempre, più stretto)
Quando: la notizia ha un meccanismo da spiegare e 2-4 numeri buoni.
Capitoli: cosa è successo (una frase) → perché ti riguarda → il meccanismo spiegato semplice (qui il `term`) → i numeri → `Who wins, who loses.` → `My take.` → outro.
Target: **55-75 secondi**. Non è un limite: se la notizia ha davvero bisogno di più, prendilo. Ma ogni frase deve guadagnarsi il posto, e una frase che ripete un'altra si taglia. Il collaudo del 10 nov ha prodotto 82 secondi con frasi tutte della stessa lunghezza: alterna frasi corte e lunghe, così la voce non diventa piatta.
Grafico: quello che si costruisce meglio davanti agli occhi (`donut`, `split`, `bars`, `line`).

### Format B — Confronto (due cose a specchio)
Quando: ci sono due soggetti confrontabili con dati verificati dello stesso livello (due club, due leghe, due stadi, due contratti, prima/dopo di una stessa cosa). Se i due soggetti non sono dello stesso livello, questo format non si usa.
Capitoli: l'hook è la domanda del confronto ("One of these two clubs makes twice the money. Guess which.") → i due soggetti presentati in una frase ciascuno → il confronto con `h2h` (le barre che crescono dal centro, una voce alla volta, ognuna con il suo marker sulla voce) → **la sorpresa**: il numero che non ti aspetti, e perché → il meccanismo che spiega la differenza (qui il `term`) → `Who wins, who loses.` → `My take.` → outro.
Target: 50-70 secondi. L'h2h è il protagonista: non metterci un secondo grafico dello stesso tipo.
Regola: il confronto deve avere un verdetto. Se alla fine non si capisce quale dei due sta meglio e perché, il reel è venuto male.

### Format C — Storia in 3 atti
Quando: c'è una persona o un club al centro, con un problema e una svolta (un proprietario che vende, un dirigente che cambia regola, un club che risale, un giocatore dentro uno scandalo).
Capitoli: hook sulla persona e sul conflitto → **Atto 1, il problema**: chi è e cosa non andava (una `timeline` o un `text`) → **Atto 2, la mossa**: cosa ha fatto, e qui il meccanismo con il `term` → **Atto 3, il risultato**: il numero che chiude la storia (`bignum` con `punch`, o `donut`) → `Who wins, who loses.` → `My take.` → outro.
Target: 60-85 secondi (è il format che può permettersi di essere il più lungo, perché la storia tira).
Regola: una persona sola al centro. Se nella storia ci sono tre protagonisti, scegline uno e gli altri diventano contesto.

## 1b. Le due regole che GG non deve più ripetere (10 nov 2026)
**1. Le zone morte.** La zona utile del reel NON è il riquadro 1080x1920. Sono via 250 px in alto, 320 in basso, 120 per lato, e in basso a DESTRA la colonna dei pulsanti di Instagram, alta 768 px (da x=835 in poi, sotto y=1152). La parte bassa a SINISTRA si usa: lì stanno i sottotitoli. Il motore è impostato così (contenuto allineato a sinistra al titolo, largo 715 px, sottotitoli a y=1470): non spostare niente a mano e non centrare niente. Prima del render si controlla con `zone.py` (punto 6.5, con la voce vera): se un testo, un numero o un grafico tocca il rosso, si corregge.

**2. Mai lo schermo vuoto.** Ogni 4 secondi al massimo deve comparire qualcosa di NUOVO e di vero sullo schermo: una riga di testo, una voce di un grafico, un numero, una tappa della timeline. Uno stemma o una nota scritta a mano da soli NON contano: con uno stemma sullo schermo per dieci secondi lo spettatore scorre via. In pratica:
- il primo elemento di ogni capitolo compare sulla PRIMA parola della prima frase e una frase lunga ha almeno due cose che compaiono: **questo non lo scrivi tu, lo fa `marker.py`** (punto 3b). Tu scrivi le frasi e gli elementi;
- uno step che ha solo `logos` o `note` è vietato;
- i grafici a più voci (timeline, testo a più righe, ledger, bars, split, h2h) si costruiscono un pezzo alla volta mentre la voce li nomina: è quello che tiene vivo lo schermo.
`controllo.py` con `--timeline` misura tutto questo sui tempi veri e blocca il reel se c'è un buco: non si renderizza finché non dà zero errori.

## 2. Regole di scrittura del reel (valide per tutti i format)
SEMPLICE PRIMA DI TUTTO (GG, 9 nov 2026: il reel deve poter diventare virale, non solo di nicchia):
1. Livello "tifoso curioso": scrivi per chi segue lo sport ma non sa niente di finanza o di gestione.
2. UN SOLO CONCETTO per reel (quello del `term`), spiegato con un paragone di vita quotidiana (leveraged buyout = "you buy a house with a mortgage, then make the house pay the mortgage"; quota di minoranza = "your slice of the pizza is yours, but somebody else picks the toppings"). Ogni altro termine tecnico si toglie o si dice con parole normali.
3. Hook sulle persone e sul conflitto, non sul concetto. Il numero o il nome stanno nelle prime parole, non alla fine della frase. Mai aprire con "X explained".
4. Pochi numeri, al massimo 3-4, ognuno reso concreto con un paragone o una traduzione ("that's X per season", "about one share in thirty").
5. PROVA DI COMPRENSIONE prima del render: rileggi lo script come un sedicenne tifoso che non sa nulla di business. Ogni frase che non capirebbe al primo ascolto va riscritta. Nel messaggio finale scrivi "Prova di comprensione: fatta, riscritte N frasi".
6. Il testo parlato (`say`) è lo script IN INGLESE che GG leggerà, e nel reel.json metti `"lang": "en"`: frasi brevi, una frase per step, una pausa tra una frase e l'altra. Le frasi dello script e i `say` del reel.json sono **le stesse frasi, parola per parola**, con una sola differenza: nello script da leggere i numeri si scrivono in lettere come si pronunciano ("two hundred fifty million"), nei `say` in cifre ("250 million"), perché i `say` diventano i sottotitoli. (Chiarito il 19 nov 2026: prima questa riga diceva le due cose insieme.)

## 3. Schema del reel.json
Lo schema del reel.json è in `~/gg-agenti/strumenti/reel/SCHEMA.md` (scritto dal codice del motore il 17 nov 2026): leggi quello. **La skill `gg-motion` NON serve e nelle attività pianificate non c'è**: non cercarla. Dal collaudo del 10 nov 2026 valgono in più queste regole:
- I loghi si prendono SOLO con `logo.py` (`comuni.md`), mai dall'archivio Drive.
- Tutto il testo a schermo è in INGLESE, compresi `kicker` e `pollLabel` dell'outro e `kicker` del `term`: Se non hai un'etichetta migliore, ometti `kicker` e `pollLabel`: il motore mette "YOUR CALL" e "YOUR TAKE?".
- Il numero di capitoli lo decide il format qui sopra.

Gli elementi fissi:
- `term` (KEY TERM): `{"type":"term","term":"Salary cap","def":"A limit on what a team can spend on *player salaries*."}` — `term` max 4 parole, `def` max 20 parole, `*x*` = grassetto, `kicker` opzionale.
- `ledger` (chi vince / chi perde): `{"type":"ledger","wins":[{"text":"The club: a *new stadium*","at":"w1"}],"loses":[{"text":"Taxpayers: *the bill*","at":"l1"}]}` — 2-3 voci per colonna, max 6 parole ciascuna; `winsLabel`/`losesLabel` opzionali.
- Elementi disponibili nel motore: `bignum`, `bars`, `h2h`, `split`, `donut`, `line`, `timeline`, `dots`, `cards`, `text`, `note`, `logos`, `term`, `ledger`.

Regole del motore:
- **NON SCRIVERE NESSUN MARKER E NESSUN `at` (GG, 16 nov 2026).** Nei `say` scrivi solo le parole, negli elementi solo i contenuti. I marker li calcola `marker.py` al punto 3b: primo sulla prima parola, gli altri distribuiti lungo la frase, mai sull'ultima, e con id unici in tutto il reel. Finche' i marker si piazzavano a mano il controllo del ritmo passava al terzo o quarto giro, e ogni giro rigenera audio, tempi e controllo.
- **Una frase per `say`, corta, senza punti ne' virgole interne** (dal collaudo del 13 nov 2026): `timing.py` ricava i confini dei segmenti dai silenzi della voce guida, e una pausa dentro la frase viene scambiata per la fine del segmento, allungando o accorciando i tempi anche del doppio.
- Servono circa due cose che compaiono per step. Se un elemento non ha abbastanza voci (`text` a 5-8 righe, `ledger` a 3 voci per colonna) `marker.py` te lo dice e spezzi lo step.
- **FOTO (GG, 18 nov 2026):** se negli appunti c'è una "Foto suggerita", la foto va in copertina (`photo`, meglio una `_cut.png`) **e** in almeno un capitolo, con l'elemento `photo` (`{"type":"photo","src":"...","h":520}`) insieme a un `text` o a un grafico nello stesso step (da sola è un elemento debole e `controllo.py` la blocca). Foto da Drive come in `comuni.md`.
- COVER senza foto con `big`: il numero gigante conta già come momento firma, usane uno diverso dal punch dei capitoli. `bigLabel` = 2-6 parole sotto il numero che dicono cosa conta (`"big":"$2.5bn","bigLabel":"for a *minority stake*"`, `*x*` = arancione). Usala quando il numero da solo non si capisce.
- DONUT: `value` è la percentuale vera (0-100) e `display` il testo finale. Se `display` è una percentuale deve essere lo stesso numero di `value` (il motore fa salire il numero fino a quello). Se è un testo diverso ("3 in 5"), lo mostra fisso.
- OUTRO: titolo al massimo 2 righe corte (~12 caratteri per riga), altrimenti copre il sondaggio. Controllalo nell'anteprima. Nello stesso reel non usare due volte lo stesso tipo di grafico.
- LOGHI OBBLIGATORI quando un capitolo nomina club, leghe, federazioni, broadcaster o aziende: almeno in 2-3 capitoli.

**UNO SCHEMA PER CAPITOLO (GG, 20 nov 2026).** Come nei caroselli: una slide, un'idea, uno schema. Ogni capitolo ha UN elemento grafico che si costruisce voce per voce mentre la voce lo nomina, più al massimo due righe di testo. Due schemi nello stesso capitolo non si usano: la colonna accumula gli elementi di tutti gli step e li rimpicciolisce finché non si leggono più. Se la notizia chiede due schemi, si spezza in due capitoli più corti: meglio otto capitoli da una o due frasi che cinque capitoli pieni di righe di testo.

**Gli elementi che si costruiscono e quelli che arrivano tutti insieme.** `controllo.py --timeline` boccia il capitolo in cui non compare niente di nuovo per più di 4 secondi. Si costruiscono voce per voce (una voce per marker): `fact-table`, `index-list`, `stamp-list`, `steps`, `dim-list`, `cards`, `bars`, `h2h`, `versus`, `timeline`, `ledger`, `orbit`, `balance`, `waffle`, `rank`, `breakdown`. Arrivano tutti insieme e da soli lasciano un buco: `quote`, `stamp`, `walkout`, `fraction`, `bignum`, `donut`, `term`, `photo`. Questi si usano come colpo finale, sempre accanto a un elemento che si costruisce o a due righe di testo.

**Lo schema si sceglie dal dato, non dal gusto**, e lo stesso tipo non torna due giorni di fila: un confronto chiede `h2h` o `versus`, una scomposizione di ricavi `breakdown` o `waterfall`, una crescita `growth`, una classifica che cambia `rank`, una quota `share-donut` o `waffle`, una regola uguale per tutti `balance`, una rete di rapporti `orbit`. L'elenco completo è in `effetti/EFFETTI.md`: leggere solo la riga che serve con `grep`, mai il file intero.

Salva la bozza in `~/gg/reel/reel.json`, **senza marker e senza `at`**.

**Effetti: lo stile del giorno (GG, 18 nov 2026).** Il primo mese ogni reel usa un abbinamento diverso di effetti, così a fine mese si vede con i dati quale funziona. Lo sceglie uno script, non tu: `python3 ~/gg-agenti/strumenti/reel/effetti/stile.py <data di DOMANI AAAA-MM-GG>`. Applicalo così: il blocco `style` va in `style` del reel.json; `cover.anim` in `cover.anim`; `text.anim` come `anim` su OGNI elemento `text`; `bignum.anim` come `anim` sul `bignum` (se c'è); `enter` come `enter` sugli elementi `logos`. La riga `Stile: ...` che stampa la copi nell'archivio, nella colonna `Grafico / Format reel` dopo il format. Non leggere `EFFETTI.md` intero (40 KB): se negli appunti c'è un dato che sta meglio in uno dei 60 elementi nuovi (gauge, waffle, rank, waterfall, versus, quote...), leggi solo la sua riga con `grep -n '<nome>' ~/gg-agenti/strumenti/reel/effetti/EFFETTI.md`. Se `controllo.py` segnala un effetto che non va, toglilo (torna lo standard) e scrivilo in una riga nel messaggio.

**3b. I marker, con lo script (obbligatorio, prima di ogni altra cosa):**
`cp ~/gg-agenti/strumenti/reel/marker.py ~/gg/ && cd ~/gg && python3 marker.py reel/reel.json`
Mette i `{id}` nei `say` e gli `at` sugli elementi, da solo. Se dice ERRORE non ha scritto niente: vuol dire che uno step ha piu' cose da far comparire che parole per dirle — spezza lo step in due o togli una voce al grafico, e rilancia. Lo script e' idempotente: se rilanciato lascia stare gli step che hanno gia' i marker.

**3c. Poi il controllo del JSON:** `cp ~/gg-agenti/strumenti/controllo.py ~/gg/ && cd ~/gg && python3 controllo.py reel/reel.json` (elementi fissi presenti, parole italiane, lunghezze, coerenza donut, `lang`, marker doppi). Correggi ogni `ERRORE` e rilancialo.

## 4. Prima consegna: il testo bloccato (NIENTE render)
Il testo che GG legge deve essere quello definitivo: dopo che ha registrato non si cambia più. Per questo prima di mandarlo controlli il RITMO sulla voce guida, che non costa render.
1. **Prepara la cartella, senza installare niente:** `python3 ~/gg-agenti/strumenti/prepara.py reel`. Copia in `~/ggm` motore, `timing.py`, `sfx.py`, `marker.py`, `zone.py`, `voce_guida.py`, `align.py`, `controllo.py` e il simbolo, verifica font, ffmpeg e Chromium e chiude con `PRONTO` o `NON PRONTO: <cosa>`. **Non lanciare mai `npm`, `pip` o `apt-get`** (17 nov 2026: nelle attività pianificate i registri dei pacchetti rispondono 403): i font stanno in `strumenti/fonts`, la voce guida si fa anche senza espeak-ng, i loghi SVG senza cairosvg. Se dice `NON PRONTO`, fermati con il messaggio di una riga riportando quella riga.
2. `voce_guida.py` serve SOLO a calcolare i tempi e non si sente mai. Senza espeak-ng genera una traccia "a blocchi" (un suono per parola, 0,7 s fra le frasi): basta per misurare il ritmo.
3. `mkdir -p ~/ggm/lavoro && cp ~/gg/reel/reel.json ~/ggm/lavoro/ && cd ~/ggm && python3 voce_guida.py lavoro/reel.json lavoro/voce-guida.wav && python3 timing.py lavoro/reel.json lavoro/timeline.json` (con `"audio":"voce-guida.wav"` nel reel.json di lavoro).
4. **CONTROLLO DEL RITMO, obbligatorio:** `python3 controllo.py lavoro/reel.json --timeline lavoro/timeline.json`. Misura i buchi sullo schermo (regola 2 del punto 1b). Se dà un ERRORE, correggi il reel.json (spezza lo step, aggiungi una riga o una voce al grafico), rilancia `timing.py` e il controllo. Si va avanti solo con zero errori: se il ritmo si sistema DOPO la registrazione, GG deve rileggere.
5. **STOP: niente `render.js`, niente `--preview`, niente `zone.py`, niente `muto.wav`.** Si fanno una volta sola, con la voce vera (punto 6). Copia il reel.json di lavoro definitivo in `~/gg/reel/reel.json` e la durata stimata dalla timeline: ti servono dopo.
6. **Copia di sicurezza su Drive (19 nov 2026).** La voce di GG può arrivare ore dopo, e nel frattempo la cartella di lavoro può sparire. Carica `~/gg/reel/reel.json` (quello con i marker) nella cartella Appunti del giorno come `reel-GG.MM.json` (`create_file`, contentMimeType `text/plain`, `disableConversionToGoogleType` true). Al punto 6.1, se `~/gg/reel/reel.json` non c'è più, riprendilo da lì con `download_file_content`.

## 5. Consegna del testo
Nessun `SendUserFile`: in questa fase non c'è nessun file da mandare. Solo il messaggio. Vale la regola di `comuni.md`: **solo materiale e azioni.** Niente lezione, niente opinione, niente articolo del Codice, niente fonti, niente segnali di rumore, niente prova di comprensione, niente stile degli effetti: sono negli appunti e nell'archivio. Struttura esatta:

```
🎙️ REEL DI DOMANI — <titolo corto in italiano> (circa 68 secondi)

<il TESTO DA LEGGERE, in un blocco di codice>

━━━━━━━━━━━━━━━━━━
🔴 COSA DEVI FARE
━━━━━━━━━━━━━━━━━━
ORA:
• registra il testo qui sopra con Memo Vocali (NON la nota vocale di WhatsApp: comprime
  troppo e si sente). Impostazioni > Memo Vocali > Qualità audio > Senza perdita.
• stanza silenziosa, telefono a un palmo dalla bocca, niente auto e niente altoparlante
• una frase alla volta, con una pausa netta di circa un secondo fra una frase e l'altra:
  è da lì che il motore capisce dove finisce ogni frase
• se sbagli una frase fermati, aspetta un secondo e rileggila intera da capo: la falsa
  partenza la tolgo io
• mandami il file così com'è. Se cambi qualche parola, dimmelo.
• se vuoi, allegami un PNG scontornato di <protagonista> per la copertina
• mandami il logo <nome> (manca nel capitolo <N>)

Appena ricevo la voce ti mando il reel finito, con caption e i 3 hook per i Trial Reels.
DOMANI alle 20:00 lo pubblichi su Instagram e TikTok.
```

Le cinque righe sulla registrazione ci sono SEMPRE, identiche ogni giorno (GG, 20 nov 2026: «fammelo ricordare ogni volta come fare l'audio, che sennò me lo scordo»). Se non serve niente oltre alla voce, nel blocco restano solo quelle. I loghi nuovi da archiviare vanno in una riga sotto il blocco: `🆕 Loghi nuovi da archiviare: <nome> (fonte)`.

## 5b. Scrivi nell'archivio
**Solo dopo aver mandato il video finito** (punto 6.6), mai dopo il solo testo (regola di `comuni.md`: la riga si scrive quando il contenuto esiste) aggiungi la riga del reel nel foglio "Archivio Sport Management" (`{ARCHIVIO}`) come dice `comuni.md`: una chiamata `append_values` su `Contenuti!A1`, 19 colonne (A-S), **con la data di DOMANI** (è il giorno di pubblicazione) in formato AAAA-MM-GG. Nella colonna `Grafico / Format reel` scrivi il format usato (Explainer, Confronto o Storia in 3 atti) e il tipo di grafico principale, perché è da lì che domani la Ricerca capisce dove siamo nella rotazione. Nella colonna `Key terms` metti il `term` del reel. Se la chiamata non riesce, riprova una volta e aggiungi al messaggio una riga `⚠️ archivio non aggiornato`.

## 6. Quando GG manda la voce: l'unico render
0. Applica prima le correzioni di GG al reel.json (testi, numeri, grafici, ordine). Ogni numero nuovo segue la regola delle 2 fonti.
1. Se `~/ggm` non c'è più, ricostruiscila con `prepara.py reel` (punto 4.1). Se manca anche `~/gg/reel/reel.json`, scarica `reel-GG.MM.json` dalla cartella Appunti del giorno (punto 4.6). Copia l'audio (e l'eventuale PNG scontornato e i loghi) in `~/ggm/lavoro/`, parti da `~/gg/reel/reel.json` (quello con i marker) e metti `audio` = il file di GG, i loghi e `photo` nella cover (quella nuova se l'ha mandata, altrimenti quella dell'archivio, meglio una `_cut.png`; foto normale con `"cutout": false`).
2. SOTTOTITOLI SULLA VOCE VERA: `cd ~/ggm && python3 align.py lavoro/reel.json lavoro/timeline.json`. Con librosa ed espeak-ng allinea parola per parola; **nelle attività pianificate non ci sono** (verificato il 19 nov 2026), quindi `align.py` lo dice in una riga e passa da solo a `timing.py`, che prende i tempi dalle pause della voce vera: i sottotitoli sono a tempo frase per frase, e dentro la frase le parole si accendono a tempo stimato. Va bene così, non provare a installarli. È il motivo per cui GG deve fare una piccola pausa tra una frase e l'altra.
3. I `say` devono contenere esattamente le parole che GG ha detto: se ha cambiato qualche parola leggendo (te lo dice, o lo vedi dai tempi stampati: una frase troppo lunga o troppo corta rispetto alle altre), correggi i `say` e rilancia `align.py`.
4. Ritmo sui tempi veri: `python3 controllo.py lavoro/reel.json --timeline lavoro/timeline.json`. Zero errori prima di andare avanti (stessa regola del punto 4.4, senza cambiare le parole: si sposta un marker o si aggiunge una voce al grafico).
5. **CONTROLLO VISIVO PRIMA DEL RENDER (economico, un giro solo):** anteprime alla FINE di ogni capitolo (schermo più pieno), più la cover, l'outro e 3-4 istanti a metà di frasi diverse per i sottotitoli: `node render.js lavoro/reel.json lavoro/timeline.json lavoro/p --preview <istanti>`. Poi `python3 zone.py lavoro/p_*.png --out lavoro/zone.png` e guarda con Read SOLO quel foglio: le zone morte sono in rosso, niente deve toccarle; niente al centro col vuoto attorno; la parola evidenziata nei sottotitoli è quella che GG sta dicendo in quell'istante (confronta con i tempi stampati). Correggi e rifai le anteprime solo dei capitoli toccati.
6. **Il render, una volta sola:** `node render.js lavoro/reel.json lavoro/timeline.json lavoro/reel.mp4` (circa 2 minuti per 70 secondi). Controlla 2 fotogrammi passati da `zone.py` e che l'audio sia la voce di GG. Manda `reel.mp4` con `SendUserFile` (status "proactive", display "render"), caption `Reel di domani – <titolo> (pronto)`. Se il render fallisce due volte, fermati con il messaggio di una riga.
7. Il messaggio che accompagna il video finito è quello che GG userà domani per pubblicare, quindi contiene solo questo:
```
🎙️ <titolo corto> — pronto (<durata> secondi)

<caption del reel: 2-3 righe + 3-5 hashtag, in un blocco di codice>

3 hook per i Trial Reels:
① <max 12 parole, con un numero o un nome>
② <...>
③ <...>

━━━━━━━━━━━━━━━━━━
🔴 COSA DEVI FARE
━━━━━━━━━━━━━━━━━━
DOMANI alle 20:00: pubblica questo reel su Instagram e TikTok con la caption qui sopra.
Per i Trial Reels usa un hook diverso per ogni prova.
```
Poi scrivi la riga nell'archivio (punto 5b). Se GG non manda la voce in giornata, la riga non si scrive.

**Se GG scrive che il reel non l'ha pubblicato:** `no` nella colonna Q (`Pubblicato`) della sua riga con `update_values`, e una riga di risposta. Vuoto = pubblicato (GG, 19 nov 2026).
