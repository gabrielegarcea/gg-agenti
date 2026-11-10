# gg-agenti

Istruzioni e strumenti degli agenti automatici di GG on Sport (@ggonsport).

- `REGOLE.md` — regole dei contenuti, valide per tutti
- `agenti/` — istruzioni di ogni agente:
  - `comuni.md` — le regole che leggono tutti gli agenti della giornata (linea, lingua, Codice GG, fact-check, loghi, foto)
  - `ricerca.md` — primo turno (6:45): trova e verifica le 4 notizie, scrive gli Appunti del giorno
  - `caroselli.md` — secondo turno (7:25): i 3 caroselli con caption e hook
  - `reel.md` — terzo turno (8:15): il reel di domani, montato senza voce
  - `full-time.md` — newsletter del sabato
  - `analista.md` — report della domenica
  - `mini-tesi.md` — approfondimenti, in chat
- `strumenti/` — script per caroselli, loghi, sottotitoli e reel, più `controllo.py` (controllo automatico dei JSON prima del render)
- `loghi/` — archivio loghi

Gli agenti clonano questo repository e lo usano in sola lettura.

**La giornata è spezzata in tre turni** (10 nov 2026) perché una sessione unica ri-paga tutto il contesto accumulato a ogni chiamata: tre sessioni pulite che si passano un file di appunti su Drive consumano molto meno. Ogni turno legge `comuni.md` + il proprio file, non gli altri. Le ricerche e i controlli pesanti si fanno fare a dei sotto-agenti, così articoli e immagini non entrano nel contesto principale.
