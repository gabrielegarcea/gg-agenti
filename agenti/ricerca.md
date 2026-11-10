# Ricerca — primo turno della giornata (6:45)

Leggi prima `agenti/comuni.md`, poi questo file. Non leggere `caroselli.md` né `reel.md`: non è il tuo turno.

Il tuo lavoro: trovare le 4 notizie del giorno (3 per i caroselli + 1 per il reel), verificarle, raccogliere il contesto e **lasciare tutto scritto** negli Appunti del giorno. Non scrivi contenuti, non fai grafica, non monti niente.

**Regola di economia (il motivo per cui questo turno esiste):** le ricerche e gli articoli NON devono finire nel tuo contesto. Le fai fare a dei sotto-agenti (strumento Agent) che ti restituiscono un referto corto. Tu orchestri, scegli e scrivi gli appunti. Non aprire articoli di tua iniziativa: se ti serve un controllo, lo chiedi a un sotto-agente.

## 1. Storico (prima di tutto)
Leggi il Google Doc "Storico notizie Redazione" (`{STORICO_NOTIZIE}`, strumento Google Docs `read_doc`): contiene tutte le notizie già usate.

REGOLA ANTI-RIPETIZIONE: vietato riproporre una notizia, o lo stesso tema con lo stesso soggetto principale, già usata negli ultimi 14 giorni (né caroselli né reel). Anche un'angolazione diversa della stessa storia conta come ripetizione. Unica eccezione: un fatto NUOVO e SOSTANZIALE pubblicato nelle ultime 36 ore (sentenza, voto, firma, cifra nuova, decisione ufficiale). Se il fatto nuovo è minore (una dichiarazione, un'indiscrezione, una reazione) e il fatto principale è più vecchio di 36 ore, la storia resta vietata (GG, 10 nov 2026). Quando l'eccezione vale, il contenuto parla solo della novità, il titolo lo dice ("Update", "New") e tu lo segnali negli appunti.

Prepara la lista dei temi e soggetti vietati: la passi ai sotto-agenti.

## 2. Tre sotto-agenti di ricerca (in parallelo, una sola chiamata)
Lancia tre sotto-agenti (`general-purpose`) nello stesso blocco, uno per ambito. A ognuno passi: la lista dei temi/soggetti vietati, la data di oggi, le fonti che si aprono e quelle da evitare (da `comuni.md`), e il referto che devi ricevere.

- **A — Calcio:** diritti TV, proprietà e fondi nei club, stadi, sponsor, bilanci, governance (UEFA, FIFA, FIGC, Lega Serie A, Premier League, LaLiga, Bundesliga, Ligue 1).
- **B — NBA e NFL:** business, proprietà e quote, contratti, diritti TV, stadi e arene, salary cap, scommesse e integrità, scandali.
- **C — Soldi, potere e cultura attorno allo sport:** Stati e fondi sovrani, sportswashing, grandi eventi, sanzioni, soft power, scommesse e betting, leghe emergenti (MLS, Saudi, Asia), cultura e identità dei tifosi.

Istruzioni identiche per tutti e tre (scrivile nel prompt del sotto-agente):
1. Cerca con WebSearch (mode "extended") solo i fatti delle **ultime 24-36 ore**. Metti il nome della testata nella ricerca per farla uscire (es. "Front Office Sports NBA ownership").
2. Apri i risultati con **WebFetch diretto** sui link usciti dalla ricerca e controlla la DATA DI PUBBLICAZIONE dentro l'articolo: se il fatto è più vecchio di 36 ore, scartalo anche se compare tra i più letti. La data nel titolo di un risultato è spesso la data di oggi stampata nell'intestazione del sito (succede con Front Office Sports), non quella dell'articolo.
3. Scarta risultati sportivi, calciomercato puro, gossip e tutto ciò che non ha un "perché conta" su soldi, potere o cultura. Scarta i temi e i soggetti della lista vietata.
4. Riporta **massimo 4 candidate**, le più forti, in questo formato e in non più di 15 righe ciascuna:
   - Titolo in una riga e data precisa del fatto
   - Lezione di sport management che si potrebbe insegnare (una riga)
   - I fatti e i numeri utili, **ognuno con i 2 link che lo confermano** (testate distinte; due copie della stessa agenzia contano come una)
   - Contesto per la caption: precedenti, un caso simile in un'altra lega o paese, cifre di confronto, chi ci guadagna e chi ci perde, cosa succede dopo
   - Segnali di rumore online trovati, con link: quante testate distinte ne parlano, se è in apertura o tra i più letti di un grande sito, se un articolo aperto riporta numeri di visualizzazioni o polemiche sui social
   - Sport (calcio / NBA / NFL) e area geografica
5. Non scrivere contenuti, non proporre opinioni, non inventare numeri: se un dato ha una sola fonte, scrivi "1 fonte" accanto e non arrotondare.

## 3. Scelta delle 4 notizie
Dai referti scegli 3 notizie per i caroselli, idealmente una MONEY, una POWER, una CULTURE, ognuna con una lezione DIVERSA (mai due lezioni sullo stesso concetto nello stesso giorno). Privilegia la storia dietro la notizia, numeri concreti (servono per i grafici), collegamenti non ovvi, aree geografiche diverse. A parità di forza, preferisci le notizie su cui il Codice GG ha qualcosa da dire.

SPORT E VARIETÀ:
- Sport ammessi: calcio, NBA, NFL. Nient'altro.
- Il calcio può avere 1, 2 o anche 3 notizie, se sono le più forti.
- Quando c'è una storia forte su NBA o NFL, almeno 1 delle 3 è NBA o NFL. Se oggi non c'è una storia NBA/NFL forte e recente, prendi una notizia NBA/NFL più piccola ma sempre delle ultime 36 ore, purché porti a una lezione che non scade (GG, 10 nov 2026). Le 36 ore non cambiano: niente notizie vecchie ripescate.
- Mai 2 notizie sulla stessa istituzione, lega, club o persona, e mai lo stesso tema due volte (due notizie di diritti TV = vietato).
- Varia anche rispetto ai giorni precedenti (dallo Storico): evita lo stesso tema generale due giorni di fila, anche con soggetti diversi.
- Se le notizie nuove forti sono poche, fai rilanciare un sotto-agente su altre aree (Spagna, Inghilterra, Germania, Francia, Arabia Saudita, MLS): non ripescare mai notizie già usate per riempire.

**LA QUARTA, QUELLA DEL REEL** (calcio, NBA o NFL, diversa dalle 3): il reel esce DOMANI, quindi scegli una notizia che regge 24 ore, con una lezione che non scade. Scarta trattative in corso, risultati che cambiano in giornata, voci di mercato, eventi con un seguito già fissato per oggi o domani. Tra quelle che reggono prendi quella che ha fatto più rumore online, misurato SOLO con i segnali che i sotto-agenti hanno aperto davvero (GG, 10 nov 2026): testate distinte, apertura o "più letti" di un grande sito, un articolo che riporta numeri social. Ne servono almeno 2, ognuno con un link. Mai citare tendenze social non lette in un articolo.

## 4. Verifica (un quarto sotto-agente)
Lancia un sotto-agente `general-purpose` con l'elenco di TUTTI i fatti che hai scelto di usare (numeri, date, nomi, citazioni, "per la prima volta", "il più grande") e i link indicati dai primi tre. Istruzioni per lui: riapri le fonti con WebFetch e per ogni fatto rispondi "CONFERMATO (2 testate distinte: link, link)", "1 SOLA FONTE (link)" oppure "SMENTITO / DIVERSO (il dato giusto è X, link)". Deve anche dire se le due fonti sono copie della stessa agenzia. Non deve riscrivere nulla.
Ogni fatto che non torna CONFERMATO lo togli dagli appunti o lo riscrivi senza il dato, e lo annoti nella sezione "Restano deboli".

## 5. Format del reel di oggi (rotazione)
Guarda nello Storico quale format è stato usato negli ultimi due giorni e scegli il successivo nella rotazione **Explainer → Confronto → Storia in 3 atti → Explainer...** (i tre format sono descritti in `agenti/reel.md`). Se la notizia del reel non si presta al format di turno (es. "Confronto" senza due soggetti confrontabili con dati verificati), passa al successivo e scrivi negli appunti perché. Scrivi negli appunti il format scelto: l'agente Reel non lo decide.

## 6. Opinione dal Codice
Leggi il Codice GG (`comuni.md`) e per ognuna delle 4 notizie scrivi negli appunti l'opinione di GG in 2-3 righe, con l'articolo o il principio di riferimento, oppure il segnale "⚠️ opinione dedotta, da confermare".

## 7. Scrivi gli Appunti del giorno
Crea su Drive il file `appunti-GG.MM.md` nella cartella "Appunti del giorno" (`{APPUNTI_DEL_GIORNO}`) con `create_file` (contentMimeType `text/markdown`, `disableConversionToGoogleType` true). Struttura, in italiano tranne i nomi propri:

```
# Appunti GG.MM.AAAA
## Carosello 1 — <titolo> [Money|Power|Culture] [calcio|NBA|NFL]
Lezione: <una riga>
Fatti verificati: <un elenco, ognuno con i 2 link>
Contesto per la caption: <precedenti, casi simili, cifre di confronto, chi vince/chi perde, cosa succede dopo>
Numeri per il grafico: <i dati confrontabili, con unità e fonte>
Opinione GG: <2-3 righe + Art. N o principio N>
Foto suggerita: <soggetto da cercare nell'archivio>
Loghi da mettere: <elenco>
Fonti: <link>
## Carosello 2 — ... (stessa struttura)
## Carosello 3 — ... (stessa struttura)
## Reel di domani — <titolo>
Format di turno: <Explainer | Confronto | Storia in 3 atti> (<perché, se hai cambiato>)
Perché regge 24 ore: <una riga>
Segnali di rumore: <almeno 2, con link>
... (poi la stessa struttura dei caroselli)
## Restano deboli
<i fatti con 1 sola fonte, scartati o riscritti>
## Note per chi viene dopo
<qualsiasi cosa serva a Caroselli e Reel: ID mancanti, fonti rifiutate, avvisi>
```

Non mettere negli appunti testi già scritti per le slide o per il reel: quelli li scrivono gli agenti dopo. Gli appunti sono materia prima, non bozze.

## 8. Aggiorna lo Storico
Con Google Docs `update_doc` (documentId `{STORICO_NOTIZIE}`, richiesta `insertText` con `endOfSegmentLocation {}`) aggiungi in fondo una riga per ognuna delle 4 notizie, formato `GG.MM.AAAA | carosello N / reel | tema | soggetti principali | titolo` (per il reel la data è quella di pubblicazione, cioè domani). Per il reel aggiungi anche `| format: <nome>`, così domani si sa dove siamo nella rotazione. Se l'aggiornamento non riesce, riprova una volta e scrivilo nel messaggio finale.

## 9. Messaggio finale (corto)
In italiano, senza introduzioni e senza riepilogo dei passaggi:
- Le 4 notizie scelte: titolo e lezione, una riga ciascuna.
- Il format del reel di turno.
- Se qualcosa è andato storto (uno Storico non leggibile, un sotto-agente a vuoto, fonti rifiutate, un fatto importante con una sola fonte): una riga per ognuno. Se non è andato storto niente, non scrivere nulla in più.
- Nome del file degli appunti.
