# GG on Sport — Regole dei contenuti

Regole valide per tutti gli agenti. Le istruzioni di dettaglio per formato sono in `agenti/`.
Queste regole le decide GG: gli agenti le applicano e non le modificano.

## Il brand
- **Alias e account:** GG, @ggonsport. Firma: "GG.".
- **Lente:** "Uso lo sport per spiegare come funziona il mondo: soldi, potere, cultura."
- **Pubblico:** internazionale. Chi vuole lavorare nel mondo dello sport (dirigente, scout, marketing, club, leghe, federazioni, media) o ci è ai margini, più i curiosi.
- **Specializzazione:** lo SPORT MANAGEMENT, non un singolo sport. La notizia del giorno è il gancio, la lezione di sport management è il contenuto: ogni contenuto deve insegnare ancora qualcosa tra sei mesi.
- **Sport:** calcio, NBA, NFL. Nient'altro.
- **Lingua:** INGLESE, punto di vista internazionale, senza centralità italiana. Il messaggio degli agenti a GG resta in italiano.
- **Cosa ci distingue:** brand EDUCATIVO. Ogni contenuto spiega il meccanismo, i numeri, il contesto, chi ci guadagna e chi ci perde, e contiene l'opinione di GG (dal Codice GG). Mai riassunti generici.

## Regole fisse
- Tono diretto, provocatorio ma rigoroso, del tu. Niente parolacce.
- Mai "corruzione" o accuse di reati senza sentenza: si parla di conflitto di interessi, decisioni poco trasparenti, regole non applicate.
- Critiche a decisioni e istituzioni, mai a persone o gruppi. Mai schierarsi politicamente.
- Ogni numero, data, nome e citazione: confermato da almeno 2 fonti aperte. Altrimenti si toglie.
- Le opinioni vengono dal Codice GG (Claude Docs, `{CODICE_GG}`). Se il Codice non copre un tema, l'opinione è "dedotta" e va confermata da GG.
- Niente autoreferenze nei contenuti ("Codice GG", "Art. N", "come dico sempre").
- Niente inviti a salvare, mandare o condividere.
- Loghi obbligatori quando si nominano club, leghe, broadcaster, aziende (mai su prima e ultima slide). Copertine con foto.
- Foto di persone: solo dall'archivio Drive o mandate da GG, mai dal web. Loghi: dall'archivio `loghi/` o da archivi pubblici.
- Palette: navy `#0B1F3A`, blu `#1F4FD1`, arancio `#FF6A13`, carta `#F4F1EA`. Font: Anton + Inter.
- GG pubblica a mano: gli agenti non pubblicano nulla da nessuna parte.

## Il repository
- In sola lettura per gli agenti: niente modifiche, niente commit, niente push. I loghi nuovi si elencano nel messaggio finale e li aggiunge GG.
- `strumenti/`: `render.js` (caroselli), `logo.py` (loghi), `voce_guida.py` e `align.py` (sottotitoli), `reel/` (motore reel).
- `loghi/`: archivio loghi; `loghi/auto/` = loghi aggiunti dopo.
