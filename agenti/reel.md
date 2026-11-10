# Reel — terzo turno della giornata (8:15)

Leggi prima `agenti/comuni.md`, poi questo file. Non leggere `ricerca.md` né `caroselli.md`.

Il tuo lavoro: dalla quarta notizia degli Appunti del giorno al reel montato **senza voce**, consegnato a GG con il testo da leggere. Il reel esce DOMANI: GG registra la voce oggi e tu rimonti con i sottotitoli precisi quando ti manda l'audio.

## 0. Prendi gli appunti
Cerca su Drive il file `appunti-GG.MM.md` di oggi nella cartella `{APPUNTI_DEL_GIORNO}` e leggi la sezione "Reel di domani". **Non rifare le ricerche:** i fatti sono verificati e il format di turno è già scelto. Se ti serve un dato che non c'è, fai cercare SOLO quel dato a un sotto-agente `general-purpose` (risposta: il dato e i 2 link). Se il file non c'è: aspetta 10 minuti e riprova due volte, poi scegli tu la notizia seguendo `ricerca.md` punto 3b e scrivilo nel messaggio finale.

## 1. I tre format in rotazione (GG, 10 nov 2026)
Il format di oggi è scritto negli appunti: **non cambiarlo** se non è impossibile da applicare (in quel caso passa al successivo nella rotazione Explainer → Confronto → Storia in 3 atti e spiega perché nel messaggio finale). La rotazione serve a non far sembrare il feed sempre uguale: lo stesso format non esce mai due giorni di fila.

In **tutti e tre** valgono gli elementi fissi decisi da GG: un elemento `term` (il concetto che il reel insegna, mai nel primo secondo, dentro il capitolo dove la voce lo spiega) e un capitolo `Who wins, who loses.` con l'elemento `ledger`, subito prima del capitolo `My take.`. Chi vince e chi perde sono fatti verificati, non opinioni.

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

## 2. Regole di scrittura del reel (valide per tutti i format)
SEMPLICE PRIMA DI TUTTO (GG, 9 nov 2026: il reel deve poter diventare virale, non solo di nicchia):
1. Livello "tifoso curioso": scrivi per chi segue lo sport ma non sa niente di finanza o di gestione.
2. UN SOLO CONCETTO per reel (quello del `term`), spiegato con un paragone di vita quotidiana (leveraged buyout = "you buy a house with a mortgage, then make the house pay the mortgage"; quota di minoranza = "your slice of the pizza is yours, but somebody else picks the toppings"). Ogni altro termine tecnico si toglie o si dice con parole normali.
3. Hook sulle persone e sul conflitto, non sul concetto. Il numero o il nome stanno nelle prime parole, non alla fine della frase. Mai aprire con "X explained".
4. Pochi numeri, al massimo 3-4, ognuno reso concreto con un paragone o una traduzione ("that's X per season", "about one share in thirty").
5. PROVA DI COMPRENSIONE prima del render: rileggi lo script come un sedicenne tifoso che non sa nulla di business. Ogni frase che non capirebbe al primo ascolto va riscritta. Nel messaggio finale scrivi "Prova di comprensione: fatta, riscritte N frasi".
6. Il testo parlato (`say`) è lo script IN INGLESE che GG leggerà, e nel reel.json metti `"lang": "en"`: frasi brevi, una frase per step, una pausa tra una frase e l'altra. Nello script da leggere i numeri si scrivono in lettere come si pronunciano; nel reel.json normalmente ("250 million"). Le frasi dello script e i `say` del reel.json devono dire **esattamente le stesse parole** (servono a sincronizzare i sottotitoli con la voce vera).

## 3. Schema del reel.json
Carica la skill `gg-motion` con lo strumento Skill e seguine lo schema reel.json (compresa la sezione "Stile del reel"). **ATTENZIONE: il MOTORE è quello di `~/gg-agenti/strumenti/reel/`**, non quello della skill; la skill serve solo per lo schema. Dove la skill dice altro, vale questo file (collaudo del 10 nov 2026):
- I loghi si prendono SOLO con `logo.py` (`comuni.md`), mai dall'archivio Drive come dice la skill.
- Tutto il testo a schermo è in INGLESE, compresi `kicker` e `pollLabel` dell'outro e `kicker` del `term`: l'esempio della skill ("IL VERDETTO", "Sì/No/Dipende") è in italiano, non copiarlo. Se non hai un'etichetta migliore, ometti `kicker` e `pollLabel`: il motore mette "YOUR CALL" e "YOUR TAKE?".
- Il numero di capitoli lo decide il format qui sopra, non i "3-4 capitoli" della skill.
- Lo stile `ring` (l'anello del logo che si apre) funziona con questo motore anche se non è nella skill.

Elementi in più rispetto alla skill:
- `term` (KEY TERM): `{"type":"term","term":"Salary cap","def":"A limit on what a team can spend on *player salaries*."}` — `term` max 4 parole, `def` max 20 parole, `*x*` = grassetto, `kicker` opzionale.
- `ledger` (chi vince / chi perde): `{"type":"ledger","wins":[{"text":"The club: a *new stadium*","at":"w1"}],"loses":[{"text":"Taxpayers: *the bill*","at":"l1"}]}` — 2-3 voci per colonna, max 6 parole ciascuna; `winsLabel`/`losesLabel` opzionali.
- Elementi disponibili nel motore: `bignum`, `bars`, `h2h`, `split`, `donut`, `line`, `timeline`, `dots`, `cards`, `text`, `note`, `logos`, `term`, `ledger`.

Regole del motore:
- **OGNI MARKER DEVE ESSERE UNICO IN TUTTO IL REEL**, non solo nel capitolo: se lo stesso id compare in due capitoli il motore non avvisa e un elemento non appare. Usa prefissi per capitolo (c1a, c2a, ...) e controlla i doppioni prima del render (lo fa anche `controllo.py`).
- Usa i marker `{id}` e `at` per far comparire ogni pezzo quando la voce lo nomina.
- COVER senza foto con `big`: il numero gigante conta già come momento firma, usane uno diverso dal punch dei capitoli. `bigLabel` = 2-6 parole sotto il numero che dicono cosa conta (`"big":"$2.5bn","bigLabel":"for a *minority stake*"`, `*x*` = arancione). Usala quando il numero da solo non si capisce.
- DONUT: `value` è la percentuale vera (0-100) e `display` il testo finale. Se `display` è una percentuale deve essere lo stesso numero di `value` (il motore fa salire il numero fino a quello). Se è un testo diverso ("3 in 5"), lo mostra fisso.
- OUTRO: titolo al massimo 2 righe corte (~12 caratteri per riga), altrimenti copre il sondaggio. Controllalo nell'anteprima. Nello stesso reel non usare due volte lo stesso tipo di grafico.
- LOGHI OBBLIGATORI quando un capitolo nomina club, leghe, federazioni, broadcaster o aziende: almeno in 2-3 capitoli.

Salva la bozza in `~/gg/reel/reel.json`. Poi **controlla con lo script**: `cp ~/gg-agenti/strumenti/controllo.py ~/gg/ && cd ~/gg && python3 controllo.py reel/reel.json` (marker doppi, elementi fissi presenti, parole italiane, lunghezze, coerenza donut, `lang`). Correggi ogni `ERRORE` e rilancialo.

## 4. Reel montato senza voce
GG vuole il reel completo, con i sottotitoli del testo proposto, ma **senza nessuna voce**: la voce la mette lui dopo. Nessuna voce sintetica deve sentirsi nel video.
1. `mkdir -p ~/ggm/brand && cd ~/ggm && npm init -y >/dev/null && npm i @fontsource/inter @fontsource/jetbrains-mono @fontsource/caveat @fontsource/anton && cp ~/gg-agenti/strumenti/reel/render.js ~/gg-agenti/strumenti/reel/timing.py ~/gg-agenti/strumenti/reel/sfx.py ~/ggm/ && cp ~/gg-agenti/brand/gg-simbolo.svg ~/ggm/brand/`
   espeak-ng si installa con DUE comandi separati: prima `apt-get update`, poi `DEBIAN_FRONTEND=noninteractive apt-get install -y espeak-ng` (senza `apt-get update` fallisce; senza DEBIAN_FRONTEND si blocca su una domanda). Playwright, ffmpeg, numpy e scipy sono già presenti. Il motore è già in inglese e tiene tutto dentro le zone sicure di Instagram: non spostare gli elementi a mano.
2. `cp ~/gg-agenti/strumenti/voce_guida.py ~/ggm/voce_guida.py` — serve SOLO a calcolare i tempi dei sottotitoli, non deve mai sentirsi nel video.
3. `mkdir -p ~/ggm/lavoro && cp ~/gg/reel/reel.json ~/ggm/lavoro/ && cd ~/ggm && python3 voce_guida.py lavoro/reel.json lavoro/voce-guida.wav && python3 timing.py lavoro/reel.json lavoro/timeline.json` (con `"audio":"voce-guida.wav"` nel reel.json di lavoro).
4. Traccia muta della stessa durata: `ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t $(ffprobe -v error -show_entries format=duration -of csv=p=0 lavoro/voce-guida.wav) lavoro/muto.wav`; poi nel reel.json di lavoro metti `"audio":"muto.wav"` (i tempi restano quelli di timeline.json), i loghi e, se c'è, `photo` nella cover (preferisci una `_cut.png` dall'archivio, altrimenti una foto normale con `"cutout": false`).
5. Render del video come da skill, salvato in `~/ggm/lavoro/reel-bozza.mp4`.
6. **CONTROLLO VISIVO ECONOMICO:** guarda con Read **un foglio di miniature** delle anteprime (non le anteprime una per una) più **2 fotogrammi** del video, scelti dove c'è più testo a schermo. Apri a grandezza piena solo la cover e l'outro, che sono le due che si rompono più spesso. Verifica che non si senta nessuna voce (solo gli effetti) e che i sottotitoli si leggano. Nella bozza i tempi dei sottotitoli possono essere imprecisi verso la fine (`timing.py` lavora sulla voce guida): non perderci tempo, li sistema `align.py` con la voce vera.

## 5. Consegna
Manda `reel-bozza.mp4` con `SendUserFile` (status "proactive", display "render"), caption `Reel di domani – titolo (montato senza voce, da rifare con la tua voce)`.
Poi il messaggio finale, in italiano, senza introduzioni:
- `🎙️ REEL DI DOMANI (registra la voce oggi)`: titolo e notizia con 2 link fonte
- `Format:` quale dei tre e perché calza
- `Perché questa:` i segnali di rumore online (dagli appunti) e perché regge fino a domani
- `La mia:` l'opinione usata + articolo o principio del Codice
- Foto usata dall'archivio (o "nessuna"), durata, `Stile:` gli effetti usati
- `Prova di comprensione: fatta, riscritte N frasi`
- Il TESTO DA LEGGERE dentro un blocco di codice
- La riga: `Leggi il testo così com'è (se cambi qualche parola dimmelo), con una piccola pausa tra una frase e l'altra, e mandami qui l'audio insieme alle correzioni che vuoi (testi, numeri, grafici): monto il reel con i sottotitoli sincronizzati sulla tua voce. Se vuoi un'altra foto del protagonista (meglio PNG scontornato), allegala.`
- In fondo, se serve: `🏷️ Loghi mancanti`, `🆕 Loghi nuovi`.

## 6. Quando GG manda la voce (e le correzioni)
0. Applica prima le correzioni di GG al reel.json (testi, numeri, grafici, ordine). Ogni numero nuovo segue la regola delle 2 fonti.
1. Se `~/ggm` non c'è più, ricostruiscila come al punto 4.1. Copia l'audio (e l'eventuale PNG scontornato e i loghi) in `~/ggm/lavoro/`, usa il reel.json corretto e metti `audio` = il file di GG (e `photo` nella cover: quella nuova se l'ha mandata, altrimenti quella dell'archivio).
2. SOTTOTITOLI PRECISI: al posto di `timing.py` usa `align.py`, che allinea parola per parola sulla voce vera. Una volta per sessione: `pip install --break-system-packages librosa`; `cp ~/gg-agenti/strumenti/align.py ~/ggm/align.py`. Poi `cd ~/ggm && python3 align.py lavoro/reel.json lavoro/timeline.json`. Se librosa non si installa, usa `timing.py` e scrivilo nel messaggio finale.
3. I `say` devono contenere esattamente le parole che GG ha detto: se ha cambiato qualche parola leggendo (te lo dice, o lo vedi dai tempi stampati: una frase troppo lunga o troppo corta rispetto alle altre), correggi i `say` e rilancia `align.py`.
4. Controlla i sottotitoli: genera le anteprime (`--preview`) in 6-8 istanti a metà di frasi diverse, mettile in un foglio di miniature e verifica con Read che la parola evidenziata sia quella che GG sta dicendo in quel momento (confronta con i tempi stampati). Poi genera il video, controlla 2-3 fotogrammi, manda `reel.mp4` con `SendUserFile` e nel messaggio finale una caption breve per il reel (2-3 righe + 3-5 hashtag) in un blocco di codice.
