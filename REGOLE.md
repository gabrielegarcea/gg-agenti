# GG on Sport — Regole dei contenuti

Regole valide per tutti gli agenti. Le istruzioni di dettaglio per formato sono in `agenti/`.
Queste regole le decide GG: gli agenti le applicano e non le modificano.

## Il brand
- **Alias e account:** GG, @ggonsport. Firma: "GG.".
- **Lente:** "Uso lo sport per spiegare come funziona il mondo: soldi, potere, cultura."
- **Pubblico:** internazionale. Chi vuole lavorare nel mondo dello sport (dirigente, scout, marketing, club, leghe, federazioni, media) o ci è ai margini, più i curiosi.
- **Specializzazione:** lo SPORT MANAGEMENT, non un singolo sport. La notizia del giorno è il gancio, la lezione di sport management è il contenuto: ogni contenuto deve insegnare ancora qualcosa tra sei mesi.
- **Sport (GG, 18 nov 2026):** calcio e basket (NBA, NBA Europe, EuroLeague, campionati europei). La NFL solo per le storie di business enormi. Nient'altro. Quote per sport e area in `agenti/ricerca.md`.
- **Identità (GG, 18 nov 2026):** radici europee, sguardo internazionale. GG è un europeo che spiega lo sport business al mondo: il centro è il calcio europeo, l'America entra come termine di paragone o quando i suoi soldi e i suoi modelli arrivano in Europa.
- **Lingua:** INGLESE, senza centralità italiana (al massimo 1 contenuto italiano al giorno e 4 a settimana). Il messaggio degli agenti a GG resta in italiano.
- **Cosa ci distingue:** brand EDUCATIVO. Ogni contenuto spiega il meccanismo, i numeri, il contesto, chi ci guadagna e chi ci perde, e contiene l'opinione di GG (dal Codice GG). Mai riassunti generici.

## Regole fisse
- Tono diretto, provocatorio ma rigoroso, del tu. Niente parolacce.
- Mai "corruzione" o accuse di reati senza sentenza: si parla di conflitto di interessi, decisioni poco trasparenti, regole non applicate.
- Critiche a decisioni e istituzioni, mai a persone o gruppi. Mai schierarsi politicamente.
- Ogni numero, data, nome e citazione: confermato da almeno 2 fonti aperte. Due copie dello stesso articolo d'agenzia contano come una fonte sola (GG, 10 nov 2026). **Fonte unica (GG, 19 nov 2026):** mai nelle slide, nei grafici e nel testo del reel; in caption solo attribuita ("according to <testata>"); una notizia non si regge su fatti a fonte unica.
- **Opinioni solo dagli articoli del Codice GG** (Google Doc `{CODICE_GG}`, letto con `read_file_content`) (GG, 19 nov 2026). Se nessun articolo copre il tema, niente opinione: al posto di "My take" c'è "Your call", le due posizioni vere. I temi scoperti si annotano e Full Time propone a GG una bozza di articolo; entra nel Codice solo ciò che GG approva.
- **Caroselli sempre 3 (GG, 19 nov 2026):** le notizie restano delle ultime 36 ore; se mancano notizie forti si usa la scorta di caroselli senza scadenza (scheda `Scorta` dell'archivio), e le storie forti fuori finestra vanno nella scheda `Coda idee` invece di perdersi.
- **Pubblicato di default (GG, 19 nov 2026):** tutto ciò che è consegnato si considera pubblicato; GG segnala solo le eccezioni.
- Niente autoreferenze nei contenuti ("Codice GG", "Art. N", "come dico sempre").
- Niente inviti a salvare, mandare o condividere.
- Loghi obbligatori quando si nominano club, leghe, broadcaster, aziende; **mai sull'ultima slide**. **Copertina (GG, 16 nov 2026): foto se il soggetto è già nell'archivio Drive, altrimenti i loghi dei soggetti, grandi.** Il primo logo è il soggetto principale, gli altri fanno da contesto. La copertina non si chiede mai a GG: si consegna comunque.
- Foto di persone: solo dall'archivio Drive o mandate da GG, mai dal web. Loghi: dall'archivio `loghi/` o da archivi pubblici.
- Palette: navy `#0B1F3A`, blu `#1F4FD1`, arancio `#FF6A13`, carta `#F4F1EA`. Font: Anton + Inter.
- GG pubblica a mano: gli agenti non pubblicano nulla da nessuna parte.

## I reel (GG, 10 nov 2026)
- Tre format in rotazione, uno al giorno, mai lo stesso due giorni di fila: **Explainer** (il meccanismo e i numeri), **Confronto** (due soggetti a specchio, con un verdetto), **Storia in 3 atti** (una persona, un problema, una svolta). Descritti in `agenti/reel.md`; il format di turno lo scrive l'agente Ricerca negli appunti.
- In ogni reel, qualunque format: un elemento `term` (il concetto insegnato) e un capitolo "Who wins, who loses." subito prima di "My take.".
- Livello "tifoso curioso", un solo concetto per reel spiegato con un paragone di vita quotidiana, hook sulle persone e sul conflitto, max 3-4 numeri resi concreti, prova di comprensione prima del render.
- **Zone morte (GG, ribadito il 10 nov 2026):** via 250 px in alto, 320 in basso, 120 per lato, e in basso a destra la colonna dei pulsanti alta 768 px. La parte bassa a sinistra si usa (sottotitoli). Contenuto allineato a sinistra al titolo, mai centrato. Si verifica con `strumenti/reel/zone.py`.
- **Mai lo schermo vuoto (GG, 10 nov 2026):** al massimo 4 secondi senza qualcosa di nuovo e di vero sullo schermo; uno stemma o una nota a mano da soli non contano. Si verifica con `controllo.py --timeline`.

## La giornata (GG, 10 nov 2026)
Tre turni, tre sessioni separate che si passano un file di appunti su Drive: Ricerca (6:45) → Caroselli (7:45) → Reel (8:45) (orari dal 16 nov 2026: la Ricerca impiega circa 45 minuti). Ogni turno legge `agenti/comuni.md` + il proprio file. Le ricerche e i controlli pesanti si fanno fare a dei sotto-agenti. Chi viene dopo non rifà le ricerche di chi viene prima.

## Il repository
- In sola lettura per gli agenti: niente modifiche, niente commit, niente push. I loghi nuovi si elencano nel messaggio finale e li aggiunge GG.
- `strumenti/`: `render.js` (caroselli), `logo.py` (loghi), `voce_guida.py` e `align.py` (sottotitoli), `reel/` (motore reel), `controllo.py` (controllo automatico dei JSON prima del render: lunghezze, slide obbligatorie, loghi, numeri, marker doppi, parole italiane; con `--timeline` misura i buchi sullo schermo del reel), `reel/zone.py` (disegna le zone morte di Instagram sulle anteprime).
- `loghi/`: archivio loghi; `loghi/auto/` = loghi aggiunti dopo.
