#!/usr/bin/env python3
"""GG on Sport — costruisce il JSON di un carosello da una "voce" compatta.

Perche' esiste (GG, 16 nov 2026). Prima chi scriveva doveva produrre a mano tre
JSON interi da 8-10 slide: tipi di slide, ordine, `theme`, `source` ripetuta,
array di `logos`, la slide finale. Tanto testo da scrivere, e soprattutto tanta
superficie su cui sbagliare: `controllo.py` segnalava, si correggeva, si
rilanciava. Qui si scrive solo il CONTENUTO — cosa e' successo, come funziona,
il grafico, l'opinione — e lo script costruisce le slide.

E' l'idea di monta.py sulla SSD di GLAP: le regole non sono scritte in un
manuale che si dimentica, sono codice che si rifiuta di partire. La zona
sicura la', qui le lunghezze, i loghi obbligatori e l'ordine delle slide.

Uso:
    python3 costruisci.py voce1.json n1.json
    python3 costruisci.py voce1.json n1.json --loghi    # scarica anche i loghi

La voce (tutti i campi obbligatori tranne quelli segnati "facoltativo"):

    {
      "rubrica": "Explained",
      "tag": "Money",                        Money | Power | Culture
      "titolo": "Juventus wants *money*",    max 10 parole, una parte fra *asterischi*
      "sottotitolo": "...",                  max 18 parole
      "soggetti": ["Juventus", "Serie A"],   i protagonisti: diventano i loghi
      "foto": "foto/x.jpg",                  facoltativo: se c'e', copertina con foto
      "focus": "center",                     facoltativo: con la foto
      "fonti": "Reuters, BBC (16/11/2026)",
      "successo": "...",                     What happened, max 35 parole
      "funziona": ["...", "..."],            How it works, 1 o 2 blocchi da max 35 parole
      "grafico": {"tipo": "compare", "titolo": "...", "lettura": "...", ...dati...},
      "extra": [...],                        facoltativo, vedi sotto
      "la_mia": {"titolo": "...", "testo": "..."},
      "domanda": "Would you buy in?"
    }

I dati del grafico sono quelli di `agenti/caroselli.md`, sezione Schema, meno
`title`/`body`/`source` che mette lo script. Le `extra` sono slide in piu' per
le notizie lunghe: `{"titolo","testo"}` per un testo, oppure un altro grafico
come sopra. Se serve una forma che qui non c'e', si scrive il JSON a mano:
questo script e' una scorciatoia, non una gabbia.
"""
import json
import os
import re
import sys

TAG_VALIDI = ("Money", "Power", "Culture")
TIPI_GRAFICO = ("compare", "bars", "line", "donut", "h2h", "timeline", "split", "dots", "stat")

errori = []


def dico(cond, msg):
    if not cond:
        errori.append(msg)
    return cond


def parole(s):
    return len(re.sub(r"\*", "", str(s or "")).split())


def lung(testo, massimo, dove):
    n = parole(testo)
    dico(n <= massimo, "%s: %d parole, il massimo e' %d. Taglia, non spostare altrove." % (dove, n, massimo))


# ---------------------------------------------------------------- loghi

def risolvi_loghi(soggetti, scarica):
    """Da ['Juventus', 'Serie A'] ai percorsi dei file. Torna (percorsi, mancanti)."""
    percorsi, mancanti = [], []
    if not scarica:
        # senza --loghi si assume che i file siano gia' in foto/ col nome normalizzato
        for s in soggetti:
            p = "foto/" + re.sub(r"[^a-z0-9]+", "-", str(s).lower()).strip("-") + ".png"
            (percorsi if os.path.exists(p) else mancanti).append(p if os.path.exists(p) else s)
        return percorsi, mancanti

    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import logo as LOGO
    os.makedirs("foto", exist_ok=True)
    for s in soggetti:
        dst = "foto/" + re.sub(r"[^a-z0-9]+", "-", str(s).lower()).strip("-") + ".png"
        if os.path.exists(dst):
            percorsi.append(dst)
            continue
        try:
            esito = LOGO.get(str(s), dst)
        except Exception as e:
            esito = "NON TROVATO (%s)" % e
        if os.path.exists(dst):
            percorsi.append(dst)
            if "ATTENZIONE" in str(esito):
                print("  ATTENZIONE  %s: nome non identico, guardalo prima di pubblicare" % s)
        else:
            mancanti.append(str(s))
    return percorsi, mancanti


# ---------------------------------------------------------------- grafico

def slide_grafico(g, fonti, dove):
    tipo = g.get("tipo")
    if not dico(tipo in TIPI_GRAFICO, "%s: tipo di grafico '%s' inesistente. Validi: %s"
                % (dove, tipo, ", ".join(TIPI_GRAFICO))):
        return None

    s = {k: v for k, v in g.items() if k not in ("tipo", "titolo", "lettura")}
    s["type"] = tipo
    if g.get("titolo"):
        s["title"] = g["titolo"]
    if tipo != "stat":
        dico(g.get("titolo"), "%s: manca il titolo del grafico" % dove)
    if g.get("lettura"):
        lung(g["lettura"], 20, "%s, frase di lettura" % dove)
        s["body"] = g["lettura"]
    else:
        dico(False, "%s: manca la frase di lettura. Un grafico senza una riga che lo "
                    "legge fa scorrere via la slide." % dove)
    s["source"] = fonti

    # controlli specifici che altrimenti si scoprono solo guardando il PNG
    if tipo == "timeline":
        for e in g.get("events") or []:
            lung(e.get("text"), 10, "%s, tappa '%s'" % (dove, e.get("date")))
    if tipo == "donut":
        v = g.get("value")
        dico(isinstance(v, (int, float)) and 0 <= v <= 100,
             "%s: nel donut 'value' e' una percentuale da 0 a 100 (ora: %r)" % (dove, v))
    if tipo == "split":
        parti = g.get("parts") or []
        dico(2 <= len(parti) <= 5, "%s: lo split vuole da 2 a 5 fette (ora: %d)" % (dove, len(parti)))
    if tipo == "bars":
        n = len(g.get("items") or [])
        dico(3 <= n <= 6, "%s: le bars vogliono da 3 a 6 voci (ora: %d)" % (dove, n))
    if tipo == "dots":
        dico((g.get("n") or 0) <= 100, "%s: nei dots 'n' non supera 100" % dove)

    for campo in ("display", "da", "db"):
        for v in trova(s, campo):
            dico(len(str(v)) <= 9, "%s: '%s' e' di %d caratteri, il massimo e' 9" % (dove, v, len(str(v))))
    return s


def trova(nodo, chiave):
    """Tutti i valori di `chiave` a qualsiasi profondita'."""
    out = []
    if isinstance(nodo, dict):
        for k, v in nodo.items():
            if k == chiave and not isinstance(v, (dict, list)):
                out.append(v)
            else:
                out += trova(v, chiave)
    elif isinstance(nodo, list):
        for v in nodo:
            out += trova(v, chiave)
    return out


# ---------------------------------------------------------------- costruzione

def costruisci(voce, data, loghi, mancanti):
    slides = []

    # --- copertina: foto se c'e', altrimenti i loghi (GG, 16 nov 2026)
    cover = {"type": "cover", "tag": voce.get("tag"), "title": voce.get("titolo"),
             "sub": voce.get("sottotitolo")}
    dico(voce.get("tag") in TAG_VALIDI,
         "copertina: tag '%s' non valido, deve essere Money, Power o Culture" % voce.get("tag"))
    lung(voce.get("titolo"), 10, "copertina, titolo")
    lung(voce.get("sottotitolo"), 18, "copertina, sottotitolo")
    dico("*" in str(voce.get("titolo") or ""),
         "copertina: il titolo vuole *una parte evidenziata* fra asterischi")
    if voce.get("foto"):
        cover["image"] = voce["foto"]
        cover["focus"] = voce.get("focus", "center")
    elif loghi:
        cover["logos"] = loghi[:3]
    else:
        dico(False, "copertina: non c'e' ne' una foto ne' un logo. Metti almeno un "
                    "soggetto in 'soggetti' o una foto in 'foto'.")
    slides.append(cover)

    # --- What happened
    lung(voce.get("successo"), 35, "What happened")
    dico(voce.get("successo"), "manca 'successo' (la slide What happened)")
    sl = {"type": "text", "title": "What happened", "body": voce.get("successo"),
          "source": voce.get("fonti")}
    if loghi:
        sl["logos"] = loghi[:4]
    slides.append(sl)

    # --- How it works: e' la lezione, non si salta mai
    blocchi = voce.get("funziona") or []
    if isinstance(blocchi, str):
        blocchi = [blocchi]
    dico(1 <= len(blocchi) <= 2, "'funziona' vuole 1 o 2 blocchi (ora: %d). E' la LEZIONE "
                                 "del carosello, non si salta." % len(blocchi))
    for i, b in enumerate(blocchi):
        lung(b, 35, "How it works %d" % (i + 1))
        slides.append({"type": "text", "title": "How it works" if i == 0 else "How it works, cont.",
                       "body": b, "source": voce.get("fonti")})

    # --- il grafico, obbligatorio
    g = voce.get("grafico")
    if dico(isinstance(g, dict), "manca 'grafico': ogni carosello ne ha uno"):
        s = slide_grafico(g, voce.get("fonti"), "grafico")
        if s:
            slides.append(s)

    # --- extra facoltative
    for i, e in enumerate(voce.get("extra") or []):
        dove = "extra %d" % (i + 1)
        if e.get("tipo"):
            s = slide_grafico(e, voce.get("fonti"), dove)
            if s:
                slides.append(s)
        else:
            lung(e.get("testo"), 35, dove)
            dico(e.get("titolo"), "%s: manca il titolo" % dove)
            slides.append({"type": "text", "theme": "paper", "title": e.get("titolo"),
                           "body": e.get("testo"), "source": voce.get("fonti")})

    # --- My take
    m = voce.get("la_mia") or {}
    dico(m.get("titolo") and m.get("testo"),
         "manca 'la_mia': l'opinione di GG dal Codice, con titolo e testo")
    lung(m.get("testo"), 35, "My take")
    slides.append({"type": "text", "tag": "My take", "title": m.get("titolo"), "body": m.get("testo")})

    # --- la domanda. Mai loghi qui: il motore li rifiuta sull'ultima slide.
    dico(voce.get("domanda"), "manca 'domanda': l'ultima slide e' una domanda per i commenti")
    d = str(voce.get("domanda") or "")
    dico("*" in d, "domanda: vuole *una parte evidenziata* fra asterischi")
    slides.append({"type": "end", "title": d, "body": voce.get("sotto_domanda", "")})

    n = len(slides)
    dico(6 <= n <= 10, "il carosello ha %d slide: ne servono da 6 a 10. Aggiungi o togli "
                       "una 'extra'." % n)

    con_loghi = sum(1 for s in slides if s.get("logos") or trova(s, "logo"))
    if con_loghi < 2:
        print("  ATTENZIONE  solo %d slide con loghi: la regola ne vuole 2-3. Metti un "
              "'logo' nelle voci del grafico." % con_loghi)

    return {"rubrica": voce.get("rubrica", "Explained"), "date": data, "slides": slides}


def main(argv):
    if len(argv) < 3:
        print(__doc__)
        return 2
    sorgente, destinazione = argv[1], argv[2]
    scarica = "--loghi" in argv

    with open(sorgente, encoding="utf-8") as f:
        voce = json.load(f)

    import datetime
    data = voce.get("date") or datetime.date.today().strftime("%d.%m")

    loghi, mancanti = risolvi_loghi(voce.get("soggetti") or [], scarica)
    fuori = costruisci(voce, data, loghi, mancanti)

    if mancanti:
        print("  LOGHI MANCANTI (vanno nell'elenco per GG): " + ", ".join(mancanti))

    if errori:
        for e in errori:
            print("ERRORE  " + e)
        print("\n%d ERRORE/I: non ho scritto %s." % (len(errori), destinazione))
        return 1

    with open(destinazione, "w", encoding="utf-8") as f:
        json.dump(fuori, f, ensure_ascii=False, indent=1)
    print("  %s: %d slide." % (destinazione, len(fuori["slides"])))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
