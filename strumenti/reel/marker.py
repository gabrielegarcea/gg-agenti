#!/usr/bin/env python3
"""GG Motion — mette da solo i marker nel reel.json.

Perche' esiste (GG, 16 nov 2026): finche' i marker li piazzava a mano chi scriveva,
il controllo del ritmo passava dopo tre o quattro giri, e ogni giro rigenera l'audio,
i tempi e il controllo. Il 13 nov il reel di Chicago e' passato al quarto giro.
Qui i marker non si scrivono: si calcolano. Stessa idea di monta.py sulla SSD di GLAP,
dove le regole sono codice e non prosa.

Chi scrive il reel.json NON mette nessun {marker} nei "say" e nessun "at" negli
elementi: scrive le frasi e gli elementi, e basta. Ci pensa questo script.

Uso:
    python3 marker.py reel.json            # scrive i marker nel file
    python3 marker.py reel.json --prova    # stampa cosa farebbe, non tocca niente
    python3 marker.py reel.json --rifai    # rifa' anche gli step che ne hanno gia'

Regole applicate (da agenti/reel.md, punto 1b):
- il primo elemento di uno step compare sulla PRIMA parola della frase;
- gli altri sono distribuiti lungo la frase, mai sull'ultima parola;
- ogni id e' unico in TUTTO il reel (il motore non avvisa sui doppioni: un
  elemento semplicemente non comparirebbe mai);
- se uno step ha piu' elementi che parole utili, lo dice invece di stringersi.
"""
import json
import re
import sys

MARKER = re.compile(r"\{(\w+)\}")

# Dove ogni tipo di elemento tiene i suoi punti di comparsa, nell'ordine in cui
# compaiono sullo schermo. "lista" = sotto-voci con un "at" ciascuna;
# "parallelo" = un array "at" accanto all'array dei contenuti.
SLOT_LISTA = {
    "bars": "items",
    "cards": "items",
    "split": "parts",
    "h2h": "rows",
    "timeline": "events",
}
SLOT_PARALLELO = {
    "text": "lines",
    "logos": "logos",
}


def slot_elemento(el):
    """Gli slot di un elemento, come lista di funzioni (leggi, scrivi)."""
    t = el.get("type")
    slot = []

    if t in SLOT_LISTA:
        voci = el.get(SLOT_LISTA[t]) or []
        for v in voci:
            if isinstance(v, dict):
                slot.append((lambda v=v: v.get("at"), lambda x, v=v: v.__setitem__("at", x)))

    elif t == "ledger":
        for colonna in ("wins", "loses"):
            for v in el.get(colonna) or []:
                if isinstance(v, dict):
                    slot.append((lambda v=v: v.get("at"), lambda x, v=v: v.__setitem__("at", x)))

    elif t in SLOT_PARALLELO:
        n = len(el.get(SLOT_PARALLELO[t]) or [])
        if n:
            el.setdefault("at", [None] * n)
            while len(el["at"]) < n:
                el["at"].append(None)
            for k in range(n):
                slot.append((lambda k=k, el=el: el["at"][k],
                             lambda x, k=k, el=el: el["at"].__setitem__(k, x)))

    elif t == "dots":
        # un solo momento: quando si accendono i pallini evidenziati
        slot.append((lambda: el.get("hiAt"), lambda x: el.__setitem__("hiAt", x)))

    # line, donut, term, note, photo, bignum: compaiono con lo step, nessuno slot
    return slot


def parole(say):
    """Le parole della frase, senza i marker gia' presenti."""
    return [p for p in MARKER.sub("", say).split() if p.strip()]


def posizioni(n_parole, k):
    """Dove mettere k marker in una frase di n_parole.

    Il primo sempre sulla parola 0. Gli altri distribuiti, mai sull'ultima
    parola: qualcosa deve comparire PRIMA che la frase finisca.
    """
    if k <= 0:
        return []
    if k == 1:
        return [0]
    ultima = max(1, n_parole - 1)          # l'ultima parola resta libera
    passo = ultima / k
    pos = [min(ultima - 1, int(round(i * passo))) for i in range(k)]
    pos[0] = 0
    # niente due marker sulla stessa parola
    for i in range(1, len(pos)):
        if pos[i] <= pos[i - 1]:
            pos[i] = pos[i - 1] + 1
    return [p for p in pos if p < n_parole]


def inserisci(say, pos_id):
    """Rimette insieme la frase con i {marker} davanti alle parole scelte."""
    ps = parole(say)
    dove = dict(pos_id)
    fuori = []
    for i, p in enumerate(ps):
        if i in dove:
            fuori.append("{%s}" % dove[i])
        fuori.append(p)
    return " ".join(fuori)


def segmenti(cfg):
    """Tutti i pezzi parlati del reel, con un prefisso per gli id."""
    out = []
    if cfg.get("cover"):
        out.append(("cover", "cov", cfg["cover"]))
    for ci, ch in enumerate(cfg.get("chapters") or []):
        for si, st in enumerate(ch.get("steps") or []):
            out.append(("cap.%d step %d" % (ci + 1, si + 1), "c%ds%d" % (ci + 1, si + 1), st))
    if cfg.get("outro"):
        out.append(("outro", "out", cfg["outro"]))
    return out


def lavora(cfg, rifai=False):
    note, errori, usati = [], [], set()

    for nome, prefisso, seg in segmenti(cfg):
        say = seg.get("say") or ""
        gia = MARKER.findall(say)

        if gia and not rifai:
            for m in gia:
                if m in usati:
                    errori.append("%s: marker '%s' gia' usato altrove" % (nome, m))
                usati.add(m)
            continue

        slot = []
        for el in seg.get("els") or []:
            slot += slot_elemento(el)

        if not slot:
            continue

        ps = parole(say)
        if not ps:
            errori.append("%s: ha %d elementi da far comparire ma nessuna frase" % (nome, len(slot)))
            continue

        k = len(slot)
        pos = posizioni(len(ps), k)
        if len(pos) < k:
            errori.append(
                "%s: %d cose da far comparire in %d parole. Spezza lo step in due, "
                "o togli una voce da un grafico." % (nome, k, len(ps)))
            continue

        ids = []
        for i in range(k):
            n = "%s_%d" % (prefisso, i + 1)
            if n in usati:
                errori.append("%s: id '%s' gia' in uso" % (nome, n))
            usati.add(n)
            ids.append(n)

        for (_, scrivi), i in zip(slot, ids):
            scrivi(i)
        seg["say"] = inserisci(say, list(zip(pos, ids)))

        if k == 1 and len(ps) > 7:
            note.append("%s: frase di %d parole con una cosa sola che compare. "
                        "Sopra le 7 parole servono due marker: aggiungi una riga "
                        "al testo o una voce al grafico." % (nome, len(ps)))
        note.append("%s: %d marker su %d parole" % (nome, k, len(ps)))

    return note, errori


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    path = argv[1]
    prova = "--prova" in argv
    rifai = "--rifai" in argv

    with open(path, encoding="utf-8") as f:
        cfg = json.load(f)

    note, errori = lavora(cfg, rifai=rifai)

    for n in note:
        print("  " + n)
    for e in errori:
        print("ERRORE  " + e)

    if errori:
        print("\n%d ERRORE/I: il file NON e' stato scritto." % len(errori))
        return 1

    if prova:
        print("\n--prova: non ho scritto niente.")
        return 0

    with open(path, "w", encoding="utf-8") as f:
        json.dump(cfg, f, ensure_ascii=False, indent=1)
    print("\nMarker scritti in %s." % path)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
