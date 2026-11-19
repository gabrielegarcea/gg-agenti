# gg-agenti

Istruzioni e strumenti degli agenti automatici di GG on Sport (@ggonsport).

- `REGOLE.md` — regole dei contenuti, valide per tutti
- `agenti/` — istruzioni di ogni agente:
  - `comuni.md` — le regole che leggono tutti gli agenti della giornata (linea, lingua, Codice GG, fact-check, loghi, foto)
  - `ricerca.md` — primo turno (6:45): trova e verifica le 4 notizie, scrive gli Appunti del giorno
  - `caroselli.md` — secondo turno (7:45): i 3 caroselli con caption e hook
  - `reel.md` — terzo turno (8:45): il reel di domani in due tempi: prima il testo, poi un solo render con la voce di GG
  - `full-time.md` — newsletter del sabato
  - `analista.md` — report della domenica
  - `mini-tesi.md` — approfondimenti, in chat
- `strumenti/` — script per caroselli (`prepara.py reel|caroselli` prepara la cartella di lavoro senza installare niente; i font sono in `strumenti/fonts`, licenza OFL; lo schema del reel.json è in `strumenti/reel/SCHEMA.md`), loghi, sottotitoli e reel, più `controllo.py` (controllo automatico dei JSON prima del render; con `--timeline` misura i buchi sullo schermo del reel) e `reel/zone.py` (zone morte di Instagram disegnate sulle anteprime)
- `loghi/` — archivio loghi

Gli agenti clonano questo repository e lo usano in sola lettura.

**Identità dei contenuti (18 nov 2026):** radici europee, sguardo internazionale. Calcio europeo al centro, poi il basket (europeo e NBA); la NFL solo per le storie di business enormi. Le regole sono in `REGOLE.md`, le quote per sport e area in `agenti/ricerca.md` (sezione 3).

**La giornata è spezzata in tre turni** (10 nov 2026) perché una sessione unica ri-paga tutto il contesto accumulato a ogni chiamata: tre sessioni pulite che si passano un file di appunti su Drive consumano molto meno. Ogni turno legge `comuni.md` + il proprio file, non gli altri. Le ricerche e i controlli pesanti si fanno fare a dei sotto-agenti, così articoli e immagini non entrano nel contesto principale.
