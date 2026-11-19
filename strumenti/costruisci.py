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
      "soggetti": ["Juventus|club", "Serie A|lega"],   i protagonisti: diventano i loghi.
                                             "|club", "|lega", "|tv", "|marchio" = il --tipo di logo.py
                                             (per club e leghe mettilo sempre: evita i canali TV omonimi)
      "foto": "foto/x.jpg",                  facoltativo: se c'e', copertina con foto
      "focus": "center",                     facoltativo: con la foto
      "fonti": "Reuters, BBC (16/11/2026)",
      "successo": ["...", "...", "..."],     What happened: 2-4 PUNTI da max 12 parole, mai un paragrafo
      "funziona": [ {"tipo": "flow", "steps": [{"head": "...", "text": "...", "soggetto": "Juventus"}, ...]},
                    {...facoltativo: un secondo schema o grafico...} ],
      "grafico": {"tipo": "compare", "titolo": "...", "lettura": "...", ...dati...},
      "extra": [...],                        facoltativo, vedi sotto
      "la_mia": {"titolo": "...", "testo": "...", "articolo": "Art. 3"},   testo max 30 parole
                                             SOLO se un articolo del Codice copre il tema (GG, 19 nov 2026).
                                             Altrimenti, al posto di "la_mia":
      "aperta": {"titolo": "Two ways to read it",
                 "a": {"name": "...", "label": "says", "text": "...", "soggetto": "..."},
                 "b": {...}},                le due posizioni vere (fatti verificati), slide "Your call"
      "domanda": "Would you buy in?"
    }

PIU' SCHEMI, MENO TESTO (GG, 19 nov 2026: "i caroselli sono ancora troppo scritti,
servono grafici, schemi, infografiche"). Quindi:
- "How it works" e' SEMPRE uno schema `flow` (2-4 passi numerati), non un paragrafo.
- "What happened" e' una lista di punti, non un paragrafo.
- Ogni carosello ha almeno 3 slide visive (flow + grafico + almeno un altro schema
  o grafico) e al massimo UNA slide di solo paragrafo oltre a "My take".

I dati del grafico sono quelli di `agenti/caroselli.md`, sezione Schema, meno
`title`/`body`/`source` che mette lo script. Gli schemi in piu' rispetto ai grafici:
    flow    {"steps": [{"head" max 4 parole, "text" max 14 parole, "soggetto"}], "highlight"}
    versus  {"a": {"name", "label", "text" max 20 parole, "soggetto"}, "b": {...}}
    facts   {"items": [{"value" max 9 caratteri, "label" max 8 parole, "soggetto"}] 2-4, "highlight"}
    roster  {"items": [{"name" max 3 parole, "note" max 6 parole, "soggetto"}] 2-6, "highlight"}
Ovunque (anche nelle voci dei grafici) "soggetto": "Nome" diventa il logo: lo script lo
scarica con logo.py come i `soggetti`.

Le `extra` sono slide in piu' per le notizie lunghe: un grafico o uno schema come
sopra (con "tipo"), oppure `{"titolo","punti":[...]}` (2-4 punti da max 12 parole),
oppure `{"titolo","testo"}` (paragrafo, max 25 parole: al massimo UNO per carosello).
Se serve una forma che qui non c'e', si scrive il JSON a mano: questo script e' una
scorciatoia, non una gabbia.
"""
import json
import os
import re
import sys

TAG_VALIDI = ("Money", "Power", "Culture")
TIPI_GRAFICO = ("compare", "bars", "line", "donut", "h2h", "timeline", "split", "dots", "stat")
TIPI_SCHEMA = ("flow", "versus", "facts", "roster")
VISIVI = TIPI_GRAFICO + TIPI_SCHEMA

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

TIPI_LOGO = ("club", "lega", "tv", "marchio")


def nome_tipo(s):
    """'Benfica|club' -> ('Benfica', 'club'); 'NBA' -> ('NBA', None)."""
    nome, _, tipo = str(s).partition("|")
    tipo = tipo.strip().lower() or None
    return nome.strip(), (tipo if tipo in TIPI_LOGO else None)


def file_logo(nome):
    return "foto/" + re.sub(r"[^a-z0-9]+", "-", nome.lower()).strip("-") + ".png"


def carica_logo_py():
    """logo.py sta accanto a questo file nel repository; se questo file e' stato copiato
    in ~/gg (come dicono le istruzioni) si prende dal clone ~/gg-agenti. Fino al 19 nov 2026
    qui c'era solo il primo percorso, e da ~/gg lo script si fermava con ModuleNotFoundError."""
    for d in (os.path.dirname(os.path.abspath(__file__)),
              os.path.expanduser("~/gg-agenti/strumenti")):
        if os.path.exists(os.path.join(d, "logo.py")):
            sys.path.insert(0, d)
            import logo
            return logo
    raise SystemExit("ERRORE  logo.py non trovato ne' qui ne' in ~/gg-agenti/strumenti: "
                     "rilancia prepara.py caroselli")


def risolvi_loghi(soggetti, scarica):
    """Da ['Juventus|club', 'Serie A|lega'] ai percorsi dei file. Torna (percorsi, mancanti)."""
    percorsi, mancanti = [], []
    if not scarica:
        # senza --loghi si assume che i file siano gia' in foto/ col nome normalizzato
        for s in soggetti:
            nome, _ = nome_tipo(s)
            p = file_logo(nome)
            (percorsi if os.path.exists(p) else mancanti).append(p if os.path.exists(p) else nome)
        return percorsi, mancanti

    LOGO = carica_logo_py()
    os.makedirs("foto", exist_ok=True)
    for s in soggetti:
        nome, tipo = nome_tipo(s)
        dst = file_logo(nome)
        if os.path.exists(dst):
            percorsi.append(dst)
            continue
        try:
            esito = LOGO.get(nome, dst, tipo)
        except Exception as e:
            esito = "NON TROVATO (%s)" % e
        if os.path.exists(dst):
            percorsi.append(dst)
            if "ATTENZIONE" in str(esito):
                print("  ATTENZIONE  %s: nome non identico, guardalo prima di pubblicare" % nome)
        else:
            mancanti.append(nome)
    return percorsi, mancanti


def nomi_soggetto(nodo):
    """Tutti i valori di "soggetto" nella voce, a qualsiasi profondita'."""
    return [str(v) for v in trova(nodo, "soggetto")]


def metti_loghi(nodo, mappa):
    """Sostituisce "soggetto": "Nome" con "logo": "foto/nome.png" (se il logo c'e')."""
    if isinstance(nodo, dict):
        if "soggetto" in nodo:
            nome = str(nodo.pop("soggetto"))
            if mappa.get(nome):
                nodo["logo"] = mappa[nome]
        for v in nodo.values():
            metti_loghi(v, mappa)
    elif isinstance(nodo, list):
        for v in nodo:
            metti_loghi(v, mappa)


def punti(lista, dove, minimo=2):
    if isinstance(lista, str):
        dico(False, "%s: scrivi una LISTA di 2-4 punti da max 12 parole, non un paragrafo "
                    "(GG, 19 nov 2026: troppo testo)" % dove)
        return []
    lista = lista or []
    dico(minimo <= len(lista) <= 4, "%s: servono da %d a 4 punti (ora: %d)" % (dove, minimo, len(lista)))
    for k, p in enumerate(lista):
        lung(p, 12, "%s, punto %d" % (dove, k + 1))
    return lista


# ---------------------------------------------------------------- grafico

def slide_grafico(g, fonti, dove):
    tipo = g.get("tipo")
    if not dico(tipo in VISIVI, "%s: tipo '%s' inesistente. Validi: %s"
                % (dove, tipo, ", ".join(VISIVI))):
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
    elif tipo in TIPI_SCHEMA:
        pass  # lo schema si legge da solo: la frase di lettura e' facoltativa
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
    if tipo == "flow":
        st = g.get("steps") or []
        dico(2 <= len(st) <= 4, "%s: il flow vuole da 2 a 4 passi (ora: %d)" % (dove, len(st)))
        for k, x in enumerate(st):
            lung(x.get("head"), 4, "%s, passo %d, head" % (dove, k + 1))
            lung(x.get("text"), 14, "%s, passo %d, text" % (dove, k + 1))
    if tipo == "versus":
        for lato in ("a", "b"):
            x = g.get(lato) or {}
            dico(x.get("name") and x.get("text"), "%s: il versus vuole '%s' con name e text" % (dove, lato))
            lung(x.get("text"), 20, "%s, lato %s" % (dove, lato))
    if tipo == "facts":
        it = g.get("items") or []
        dico(2 <= len(it) <= 4, "%s: i facts vogliono da 2 a 4 numeri (ora: %d)" % (dove, len(it)))
        for k, x in enumerate(it):
            dico(len(str(x.get("value", ""))) <= 9, "%s, numero %d: 'value' max 9 caratteri" % (dove, k + 1))
            lung(x.get("label"), 8, "%s, numero %d, label" % (dove, k + 1))
    if tipo == "roster":
        it = g.get("items") or []
        dico(2 <= len(it) <= 6, "%s: il roster vuole da 2 a 6 voci (ora: %d)" % (dove, len(it)))
        for k, x in enumerate(it):
            lung(x.get("name"), 3, "%s, voce %d, name" % (dove, k + 1))
            lung(x.get("note"), 6, "%s, voce %d, note" % (dove, k + 1))

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
    dico(voce.get("successo"), "manca 'successo' (la slide What happened)")
    sl = {"type": "text", "title": "What happened",
          "points": punti(voce.get("successo"), "What happened"), "source": voce.get("fonti")}
    if loghi:
        sl["logos"] = loghi[:4]
    slides.append(sl)

    # --- How it works: e' la lezione, non si salta mai. Ed e' uno SCHEMA (GG, 19 nov 2026)
    blocchi = voce.get("funziona") or []
    if isinstance(blocchi, (str, dict)):
        blocchi = [blocchi]
    dico(1 <= len(blocchi) <= 2, "'funziona' vuole 1 o 2 blocchi (ora: %d). E' la LEZIONE "
                                 "del carosello, non si salta." % len(blocchi))
    for i, b in enumerate(blocchi):
        dove = "How it works %d" % (i + 1)
        if not dico(isinstance(b, dict) and b.get("tipo"),
                    "%s: non piu' paragrafi. Il primo blocco e' {\"tipo\":\"flow\",\"steps\":[...]}, "
                    "il secondo (facoltativo) uno schema o un grafico" % dove):
            continue
        if i == 0:
            dico(b.get("tipo") == "flow", "%s: il primo blocco e' sempre un 'flow' (i passi del "
                                          "meccanismo, numerati)" % dove)
        b = dict(b)
        b.setdefault("titolo", "How it works" if i == 0 else "How it works, cont.")
        if i == 0:
            b["titolo"] = "How it works"
        sl = slide_grafico(b, voce.get("fonti"), dove)
        if sl:
            slides.append(sl)

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
        elif e.get("punti"):
            dico(e.get("titolo"), "%s: manca il titolo" % dove)
            slides.append({"type": "text", "theme": "paper", "title": e.get("titolo"),
                           "points": punti(e.get("punti"), dove), "source": voce.get("fonti")})
        else:
            lung(e.get("testo"), 25, dove)
            dico(e.get("titolo"), "%s: manca il titolo" % dove)
            slides.append({"type": "text", "theme": "paper", "title": e.get("titolo"),
                           "body": e.get("testo"), "source": voce.get("fonti")})

    # --- My take (solo da un articolo del Codice) oppure Your call (GG, 19 nov 2026)
    m, ap = voce.get("la_mia"), voce.get("aperta")
    dico(bool(m) != bool(ap), "serve 'la_mia' (un articolo del Codice copre il tema) OPPURE "
                              "'aperta' (nessun articolo: le due posizioni). Non tutti e due, non nessuno")
    if m:
        dico(m.get("titolo") and m.get("testo"), "'la_mia' vuole titolo e testo")
        dico(str(m.get("articolo", "")).lower().startswith("art"),
             "'la_mia' vuole \"articolo\": \"Art. N\". Se nessun articolo copre il tema usa 'aperta': "
             "le opinioni dedotte dai principi non si pubblicano piu'")
        lung(m.get("testo"), 30, "My take")
        slides.append({"type": "text", "tag": "My take", "title": m.get("titolo"), "body": m.get("testo")})
    elif ap:
        b = dict(ap, tipo="versus")
        b.setdefault("titolo", "Two ways to read it")
        sl = slide_grafico(b, voce.get("fonti"), "Your call")
        if sl:
            sl["tag"] = "Your call"
            slides.append(sl)

    # --- la domanda. Mai loghi qui: il motore li rifiuta sull'ultima slide.
    dico(voce.get("domanda"), "manca 'domanda': l'ultima slide e' una domanda per i commenti")
    d = str(voce.get("domanda") or "")
    dico("*" in d, "domanda: vuole *una parte evidenziata* fra asterischi")
    slides.append({"type": "end", "title": d, "body": voce.get("sotto_domanda", "")})

    n = len(slides)
    dico(6 <= n <= 10, "il carosello ha %d slide: ne servono da 6 a 10. Aggiungi o togli "
                       "una 'extra'." % n)

    # --- piu' schemi, meno testo (GG, 19 nov 2026)
    visive = sum(1 for x in slides if x.get("type") in VISIVI)
    dico(visive >= 3, "solo %d slide visive (grafici o schemi): ne servono almeno 3. Trasforma "
                      "un'extra in facts, versus, roster o in un secondo grafico." % visive)
    paragrafi = sum(1 for x in slides if x.get("type") == "text" and x.get("body")
                    and str(x.get("tag", "")).lower() != "my take")
    dico(paragrafi <= 1, "%d slide di solo paragrafo oltre a My take: il massimo e' 1. "
                         "Usa 'punti' o uno schema." % paragrafi)

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
    # i "soggetto" dentro schemi e grafici diventano loghi
    altri = [n for n in dict.fromkeys(nomi_soggetto(voce))]
    mappa = {}
    for nome in altri:
        pp, mm = risolvi_loghi([nome], scarica)
        if pp:
            mappa[nome] = pp[0]
        elif nome not in mancanti:
            mancanti += mm
    voce = json.loads(json.dumps(voce))
    metti_loghi(voce, mappa)
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
