#!/usr/bin/env python3
"""controllo.py - controllo automatico dei contenuti GG on Sport prima del render.

Uso:
    python3 controllo.py n1.json n2.json n3.json      # caroselli (anche uno solo)
    python3 controllo.py reel/reel.json               # reel
    python3 controllo.py n1.json caption1.txt         # anche le caption (.txt)

Stampa ERRORE (da correggere sempre) e AVVISO (da guardare e decidere).
Esce con codice 1 se c'e' almeno un ERRORE: cosi' si vede subito se e' pulito.

Serve a non guardare tutti i PNG a grandezza piena: prende i refusi di
lunghezza, le slide mancanti, i loghi, i numeri incoerenti, i marker doppi
e le parole italiane rimaste. Il controllo visivo resta solo sulle copertine
e su quello che questo script segnala con un AVVISO.
"""

import json
import re
import sys

ERRORI = []
AVVISI = []


def err(dove, msg):
    ERRORI.append("ERRORE   %-28s %s" % (dove, msg))


def avv(dove, msg):
    AVVISI.append("AVVISO   %-28s %s" % (dove, msg))


# ---------------------------------------------------------------- italiano
# Parole italiane che in un testo inglese non compaiono mai. Niente parole
# corte ambigue ("la" sta in "La Liga", "e" e "in" stanno in inglese).
ITALIANE = {
    "della", "delle", "degli", "dello", "dei", "dal", "dalla", "dalle",
    "nel", "nella", "nelle", "nello", "sul", "sulla", "sulle",
    "perche", "perché", "piu", "più", "cosi", "così", "anche", "quindi",
    "oppure", "invece", "mentre", "questo", "questa", "quello", "quella",
    "sono", "abbiamo", "hanno", "essere", "fare", "dice", "dire",
    "verdetto", "dipende", "dimmelo", "soldi", "squadra", "partita",
    "allenatore", "dirigente", "scommesse", "proprieta", "proprietà",
    "miliardi", "milioni", "stagione", "societa", "società",
}
# Nomi propri che contengono parole italiane: si togliono prima di cercare.
ECCEZIONI = [
    "la liga", "serie a", "lega serie a", "il sole", "la gazzetta",
    "calcio e finanza", "la casa", "della valle", "dei rossoneri",
]


def testo_slide(d):
    """Tutte le stringhe di una slide/capitolo, concatenate."""
    out = []

    def giu(x):
        if isinstance(x, str):
            out.append(x)
        elif isinstance(x, dict):
            for k, v in x.items():
                if k not in ("image", "focus", "logo", "logos", "photo",
                             "at", "type", "audio", "source"):
                    giu(v)
        elif isinstance(x, list):
            for v in x:
                giu(v)

    giu(d)
    return " ".join(out)


def cerca_italiano(dove, testo):
    t = testo.lower()
    for e in ECCEZIONI:
        t = t.replace(e, " ")
    trovate = sorted({w for w in re.findall(r"[a-zà-ù]+", t) if w in ITALIANE})
    if trovate:
        err(dove, "parole italiane nel testo inglese: %s" % ", ".join(trovate))


def parole(s):
    return len(re.findall(r"\S+", s or ""))


INVITI = ("save this", "send this", "share this", "tag a friend",
          "follow for more", "double tap")


def cerca_inviti(dove, testo):
    for invito in INVITI:
        if invito in testo.lower():
            err(dove, "invito vietato nel testo: %r" % invito)


def asterischi(dove, testo):
    n = testo.count("*")
    if n % 2:
        err(dove, "asterischi dispari: un *evidenziato* non si chiude")
    elif n > 4:
        avv(dove, "%d evidenziati: il massimo e' 2 per slide" % (n // 2))


# ---------------------------------------------------------------- grafici
GRAFICI = {"compare", "bars", "line", "donut", "h2h", "timeline", "split",
           "dots", "stat", "bignum", "cards"}


def controlla_grafico(dove, s):
    t = s.get("type")
    if t == "donut":
        v = s.get("value")
        if not isinstance(v, (int, float)) or not 0 <= v <= 100:
            err(dove, "donut: 'value' deve essere una percentuale 0-100 (ora: %r)" % v)
        d = str(s.get("display", ""))
        m = re.fullmatch(r"\s*(\d+(?:[.,]\d+)?)\s*%\s*", d)
        if m and isinstance(v, (int, float)):
            if abs(float(m.group(1).replace(",", ".")) - float(v)) > 0.01:
                err(dove, "donut: 'display' %s non corrisponde a 'value' %s "
                          "(il numero sale fino a value)" % (d, v))
    if t == "split":
        parts = s.get("parts") or []
        tot = sum(p.get("value", 0) for p in parts if isinstance(p.get("value"), (int, float)))
        if parts and abs(tot - 100) > 1.5:
            avv(dove, "split: le fette sommano %g, non 100" % tot)
        if not 2 <= len(parts) <= 5:
            err(dove, "split: servono da 2 a 5 fette (ora: %d)" % len(parts))
    if t == "bars":
        items = s.get("items") or []
        if not 3 <= len(items) <= 6:
            avv(dove, "bars: previste 3-6 voci (ora: %d)" % len(items))
    if t == "line":
        pts = s.get("points") or []
        if not 3 <= len(pts) <= 6:
            avv(dove, "line: previsti 3-6 punti (ora: %d)" % len(pts))
    if t == "timeline":
        for i, e in enumerate(s.get("events") or []):
            if parole(e.get("text")) > 10:
                err("%s ev.%d" % (dove, i + 1), "timeline: testo di %d parole, max 10"
                    % parole(e.get("text")))
    if t == "dots":
        n, hi = s.get("n"), s.get("hi")
        if isinstance(n, int) and n > 100:
            err(dove, "dots: 'n' e' %d, il massimo e' 100" % n)
        if isinstance(n, int) and isinstance(hi, int) and hi > n:
            err(dove, "dots: 'hi' (%d) e' maggiore di 'n' (%d)" % (hi, n))
    if t == "h2h":
        rows = s.get("rows") or []
        if not 2 <= len(rows) <= 4:
            avv(dove, "h2h: previste 2-4 voci (ora: %d)" % len(rows))
        for i, r in enumerate(rows):
            for lato in ("a", "b"):
                if not isinstance(r.get(lato), (int, float)):
                    err("%s voce %d" % (dove, i + 1),
                        "h2h: '%s' deve essere un numero (ora: %r)" % (lato, r.get(lato)))
    # display corti
    for chiave in ("display", "da", "db"):
        v = s.get(chiave)
        if isinstance(v, str) and len(v) > 9:
            err(dove, "'%s' = %r: %d caratteri, il massimo e' 9" % (chiave, v, len(v)))
    for gruppo in ("items", "points", "parts"):
        for i, it in enumerate(s.get(gruppo) or []):
            d = it.get("display")
            if isinstance(d, str) and len(d) > 9:
                err("%s voce %d" % (dove, i + 1),
                    "'display' = %r: %d caratteri, il massimo e' 9" % (d, len(d)))
            if parole(it.get("label")) > 5:
                err("%s voce %d" % (dove, i + 1),
                    "etichetta di %d parole, il massimo e' 5" % parole(it.get("label")))
    for lato in ("a", "b"):
        o = s.get(lato)
        if isinstance(o, dict) and parole(o.get("label")) > 5:
            err(dove, "etichetta '%s' di %d parole, il massimo e' 5"
                % (lato, parole(o.get("label"))))
    if t == "donut" and parole(s.get("label")) > 8:
        err(dove, "'label' di %d parole, il massimo e' 8" % parole(s.get("label")))
    if s.get("body") and parole(s["body"]) > 20:
        avv(dove, "frase di lettura di %d parole, consigliate max 20" % parole(s["body"]))


# ---------------------------------------------------------------- carosello
def controlla_carosello(path, d):
    nome = path.split("/")[-1]
    slides = d.get("slides") or []
    if not slides:
        err(nome, "nessuna slide")
        return []

    if not re.fullmatch(r"\d{2}\.\d{2}", str(d.get("date", ""))):
        err(nome, "'date' deve essere GG.MM (ora: %r)" % d.get("date"))

    n = len(slides)
    if not 6 <= n <= 10:
        err(nome, "%d slide: il carosello ne vuole da 6 a 10" % n)

    if slides[0].get("type") != "cover":
        err(nome, "la prima slide deve essere 'cover'")
    if slides[-1].get("type") != "end":
        err(nome, "l'ultima slide deve essere 'end'")

    titoli = [str(s.get("title", "")).lower() for s in slides]
    if not any("what happened" in t for t in titoli):
        err(nome, "manca la slide 'What happened'")
    if not any("how it works" in t for t in titoli):
        err(nome, "manca la slide 'How it works' (e' la lezione, obbligatoria)")
    if not any(str(s.get("tag", "")).lower() == "my take" for s in slides):
        err(nome, "manca la slide con tag 'My take' (l'opinione, obbligatoria)")
    if len(slides) >= 2 and str(slides[-2].get("tag", "")).lower() != "my take":
        avv(nome, "'My take' dovrebbe essere la penultima slide")

    tipi_grafico = [s.get("type") for s in slides if s.get("type") in GRAFICI]
    if not tipi_grafico:
        err(nome, "nessun grafico: ne serve almeno uno per carosello")

    con_loghi = 0
    for i, s in enumerate(slides):
        dove = "%s sl.%02d" % (nome, i + 1)
        t = s.get("type")
        testo = testo_slide(s)
        cerca_italiano(dove, testo)
        cerca_inviti(dove, testo)
        asterischi(dove, testo)

        if t == "cover":
            if parole(s.get("title")) > 10:
                err(dove, "titolo di copertina di %d parole, il massimo e' 10"
                    % parole(s.get("title")))
            if parole(s.get("sub")) > 18:
                err(dove, "sottotitolo di %d parole, il massimo e' 18" % parole(s.get("sub")))
            if str(s.get("tag", "")) not in ("Money", "Power", "Culture"):
                err(dove, "tag di copertina: serve Money, Power o Culture (ora: %r)"
                    % s.get("tag"))
            if not s.get("image"):
                avv(dove, "copertina senza foto: va chiesta a GG")
        if t == "text" and parole(s.get("body")) > 35:
            err(dove, "corpo di %d parole, il massimo e' 35" % parole(s.get("body")))
        if t in GRAFICI:
            controlla_grafico(dove, s)
        if (t not in ("cover", "end") and t in {"text", "stat"} | GRAFICI
                and str(s.get("tag", "")).lower() != "my take"):
            if not s.get("source"):
                avv(dove, "manca 'source'")

        ha_loghi = bool(s.get("logos")) or bool(s.get("logo"))
        for gruppo in ("items", "events"):
            if any(x.get("logo") for x in (s.get(gruppo) or [])):
                ha_loghi = True
        for lato in ("a", "b"):
            if isinstance(s.get(lato), dict) and s[lato].get("logo"):
                ha_loghi = True
        if ha_loghi:
            con_loghi += 1
            if i == 0 or i == n - 1:
                err(dove, "loghi sulla prima o ultima slide: non si fa mai")

    if con_loghi < 2:
        err(nome, "solo %d slide con loghi: ne servono almeno 2-3" % con_loghi)

    return tipi_grafico


# ---------------------------------------------------------------- reel
def controlla_reel(path, d):
    nome = path.split("/")[-1]
    if d.get("lang") != "en":
        err(nome, "manca \"lang\": \"en\" (ora: %r)" % d.get("lang"))

    caps = d.get("chapters") or d.get("capitoli") or []
    if not caps:
        err(nome, "nessun capitolo trovato ('chapters')")
        return

    # marker: unici fra elementi diversi (dentro un elemento lo stesso marker
    # si puo' ripetere, es. due righe di 'text' che compaiono insieme)
    proprietario = {}
    doppi = set()
    testo_tutto = [testo_slide(d.get("cover") or {}), testo_slide(d.get("outro") or {})]

    def marker_di(x, out):
        if isinstance(x, dict):
            for k, v in x.items():
                if k in ("at", "id"):
                    for m in ([v] if isinstance(v, str) else (v or [])):
                        if isinstance(m, str) and m:
                            out.add(m)
                else:
                    marker_di(v, out)
        elif isinstance(x, list):
            for v in x:
                marker_di(v, out)

    def elementi(c):
        """gli els stanno dentro gli steps; accetta anche le forme vecchie"""
        out = list(c.get("elements") or []) + list(c.get("els") or [])
        for st in (c.get("steps") or []):
            out += list(st.get("els") or [])
        return out

    tipi = []
    ha_term = ha_ledger = False
    titoli = []
    for i, c in enumerate(caps):
        dove = "%s cap.%d" % (nome, i + 1)
        titoli.append(str(c.get("title", "")).strip().lower())
        testo_tutto.append(testo_slide(c))
        for j, e in enumerate(elementi(c)):
            chiave = "%s el.%d" % (dove, j + 1)
            miei = set()
            marker_di(e, miei)
            for m in miei:
                if m in proprietario and proprietario[m] != chiave:
                    doppi.add(m)
                proprietario.setdefault(m, chiave)
            t = e.get("type")
            if t == "term":
                ha_term = True
                if i == 0:
                    err(dove, "il 'term' non va nel primo capitolo (mai nel primo secondo)")
                if parole(e.get("term")) > 4:
                    err(dove, "'term' di %d parole, il massimo e' 4" % parole(e.get("term")))
                if parole(e.get("def")) > 20:
                    err(dove, "'def' di %d parole, il massimo e' 20" % parole(e.get("def")))
            elif t == "ledger":
                ha_ledger = True
                for col in ("wins", "loses"):
                    voci = e.get(col) or []
                    if not 2 <= len(voci) <= 3:
                        err(dove, "ledger '%s': %d voci, servono 2 o 3" % (col, len(voci)))
                    for v in voci:
                        if parole(v.get("text")) > 6:
                            err(dove, "ledger '%s': voce di %d parole, il massimo e' 6"
                                % (col, parole(v.get("text"))))
            elif t in GRAFICI:
                tipi.append(t)
                controlla_grafico(dove, e)

    visti = proprietario
    if doppi:
        err(nome, "marker usati da due elementi diversi (uno non apparira'): %s"
            % ", ".join(sorted(doppi)))
    if not ha_term:
        err(nome, "manca l'elemento 'term' (key term): obbligatorio in ogni reel")
    if not ha_ledger:
        err(nome, "manca l'elemento 'ledger': obbligatorio in ogni reel")
    if not any("who wins" in t for t in titoli):
        err(nome, "manca il capitolo 'Who wins, who loses.'")
    if not any("my take" in t for t in titoli):
        err(nome, "manca il capitolo 'My take.'")
    elif "my take" not in titoli[-1] and not any(
            "my take" in t for t in titoli[-2:]):
        avv(nome, "'My take.' dovrebbe essere l'ultimo capitolo prima dell'outro")
    for t in set(tipi):
        if tipi.count(t) > 1:
            err(nome, "il grafico '%s' e' usato %d volte: nello stesso reel mai due volte"
                % (t, tipi.count(t)))

    outro = d.get("outro") or {}
    tit = outro.get("title")
    righe = tit if isinstance(tit, list) else str(tit or "").split("\n")
    if len(righe) > 2:
        err(nome + " outro", "titolo su %d righe: il massimo e' 2" % len(righe))
    for riga in righe:
        if len(str(riga)) > 18:
            avv(nome + " outro", "riga di %d caratteri: oltre ~18 rischia di coprire il sondaggio (%r)"
                % (len(str(riga)), riga))

    cerca_italiano(nome, " ".join(testo_tutto))
    cerca_inviti(nome, " ".join(testo_tutto))

    says = []
    for c in caps:
        for s in (c.get("steps") or []):
            if s.get("say"):
                says.append(s["say"])
    if not says:
        avv(nome, "nessun 'say' trovato: senza testo parlato i sottotitoli non si allineano")
    for s in says:
        if parole(re.sub(r"\{\w+\}", "", s)) > 26:
            avv(nome, "un 'say' di %d parole: una frase per step, corta (%r)"
                % (parole(s), s[:60]))
    # ogni {marker} dentro un 'say' deve corrispondere a un id o a un at
    citati = set()
    for s in says + [str((d.get("cover") or {}).get("say", "")),
                     str((d.get("outro") or {}).get("say", ""))]:
        citati |= set(re.findall(r"\{(\w+)\}", s))
    orfani = sorted(citati - set(visti))
    if orfani:
        err(nome, "marker citati in un 'say' ma senza elemento (non appariranno): %s"
            % ", ".join(orfani))
    mai_citati = sorted(set(visti) - citati)
    if mai_citati:
        avv(nome, "elementi senza marker nel 'say' (compaiono all'inizio dello step): %s"
            % ", ".join(mai_citati))


# ---------------------------------------------------------------- caption
def controlla_caption(path, testo):
    nome = path.split("/")[-1]
    n = len(testo)
    if n > 2200:
        err(nome, "%d caratteri: Instagram taglia a 2.200" % n)
    elif not 1900 <= n <= 2150:
        avv(nome, "%d caratteri: la caption sta tra 1.900 e 2.150" % n)
    prima = testo.strip().split("\n")[0]
    if len(prima) > 125:
        err(nome, "prima riga di %d caratteri: oltre 125 non si vede prima di \"altro\"" % len(prima))
    cerca_inviti(nome, testo)
    if testo.count("📖") == 0:
        avv(nome, "non trovo la sezione 📖 Key terms")


# ---------------------------------------------------------------- main
def main(paths):
    if not paths:
        print(__doc__)
        return 2

    grafici_caroselli = {}
    for p in paths:
        try:
            if p.endswith(".txt"):
                with open(p, encoding="utf-8") as f:
                    controlla_caption(p, f.read())
                continue
            with open(p, encoding="utf-8") as f:
                d = json.load(f)
        except FileNotFoundError:
            err(p, "file non trovato")
            continue
        except json.JSONDecodeError as e:
            err(p, "JSON non valido: %s" % e)
            continue

        if "chapters" in d or "capitoli" in d:
            controlla_reel(p, d)
        elif "slides" in d:
            grafici_caroselli[p] = controlla_carosello(p, d)
        else:
            err(p, "non riconosciuto: manca 'slides' (carosello) o 'chapters' (reel)")

    if len(grafici_caroselli) == 3:
        primi = [g[0] for g in grafici_caroselli.values() if g]
        if len(set(primi)) < 3:
            err("i 3 caroselli", "i grafici principali sono %s: servono 3 tipi DIVERSI"
                % ", ".join(primi))
    elif grafici_caroselli and len(grafici_caroselli) < 3:
        avv("i 3 caroselli", "controllati solo %d caroselli: la regola dei 3 tipi "
            "diversi si verifica passandoli tutti e tre insieme" % len(grafici_caroselli))

    for r in ERRORI:
        print(r)
    for r in AVVISI:
        print(r)
    print("\n%d ERRORE/I, %d AVVISO/I" % (len(ERRORI), len(AVVISI)))
    if not ERRORI and not AVVISI:
        print("Tutto pulito: puoi renderizzare.")
    return 1 if ERRORI else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
