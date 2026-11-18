#!/usr/bin/env python3
"""Lo stile del reel di un giorno: fa girare TUTTI gli effetti, senza ripetizioni (GG, 18 nov 2026).

Decisione di GG: per il primo mese ogni reel usa un abbinamento diverso di effetti; l'Analista incrocia
lo stile (scritto nell'archivio) con i numeri, e a fine mese si tiene quello che ha funzionato.

Uso:  python3 stile.py AAAA-MM-GG          (la data di PUBBLICAZIONE del reel)
Stampa un blocco JSON da copiare nel reel.json e la riga "Stile:" da mettere nell'archivio.

Ogni famiglia (titoli, transizione, sottotitoli, ...) ha il suo ordine mescolato una volta per sempre
(seme fisso) e avanza di uno al giorno: lo stesso effetto torna solo dopo che sono passati tutti gli altri.
"""
import datetime, json, os, random, sys

ESCLUSI = {"trans": {"strobe"},   # strobe: lampeggio a ~14 Hz, rischio per chi soffre di epilessia fotosensibile
           "text": {"word-roll", "strike-swap", "lead-flip", "recede", "acronym"},
           "num": {"roman"}}   # roman e acronym hanno senso solo su dati scritti apposta (edizioni, sigle)   # servono parole scritte apposta o lasciano il testo grigio: si usano solo a mano
D0 = datetime.date(2026, 11, 23)  # giorno 0 = lancio
H = os.path.dirname(os.path.abspath(__file__))

def famiglia(cat, kind, seme):
    nomi = sorted(n for n in cat.get(kind, {}) if n not in ESCLUSI.get(kind, set()))
    random.Random(seme).shuffle(nomi)
    return nomi

def main():
    if len(sys.argv) < 2: sys.exit(__doc__)
    giorno = datetime.date.fromisoformat(sys.argv[1]); k = (giorno - D0).days
    cat = json.load(open(os.path.join(H, "catalogo.json"), encoding="utf-8"))
    pick = lambda kind, seme, off=0: (lambda L: L[(k + off) % len(L)])(famiglia(cat, kind, seme))
    testo = famiglia(cat, "text", "testo")
    s = {
        "style": {"titles": pick("text", "titoli"), "transition": pick("trans", "trans"),
                  "camera": pick("cam", "cam"), "kar": pick("kar", "kar"),
                  "bg": pick("bg", "bg"), "bgOpts": {"o": 0.5}},
        "cover.anim": pick("text", "cover"),
        "text.anim": testo[(k + 7) % len(testo)],
        "bignum.anim": pick("num", "num"),
        "enter": pick("enter", "enter"),
    }
    print(json.dumps(s, indent=1))
    st = s["style"]
    print("Stile: titoli=%s; transizione=%s; camera=%s; sottotitoli=%s; sfondo=%s; copertina=%s; righe=%s; numero=%s; entrate=%s"
          % (st["titles"], st["transition"], st["camera"], st["kar"], st["bg"], s["cover.anim"], s["text.anim"], s["bignum.anim"], s["enter"]))

main()
