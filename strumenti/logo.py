#!/usr/bin/env python3
# GG on Sport — loghi automatici da archivi pubblici su GitHub (raggiungibili dal container)
# Uso: python3 logo.py "Nome" out.png        es. python3 logo.py "TNT" foto/tnt.png
#      python3 logo.py "Nome" out.png --tipo club   (club|lega|tv|marchio: per club e leghe non usa mai i canali TV)
#      python3 logo.py --cerca "Nome"        mostra i candidati senza scaricare
#      python3 logo.py --file "tv: countries/united-states/nbc-us.png" out.png   usa un candidato preciso di --cerca
# Uscita: "OK" = logo giusto; "ATTENZIONE" = nome non identico, guardalo prima di usarlo; "NON TROVATO" = va nei Loghi mancanti.
# Ordine: 1) archivio GG nel repository (cartella loghi/), 2) archivi pubblici su GitHub.
# Fonti: tv-logo/tv-logos (canali TV e streaming, a colori), luukhopman/football-logos (club di calcio europei),
#        klunn91/team-logos (NBA, NFL, MLB e leghe USA), simple-icons (marchi e sponsor, nel colore del brand).
import json, os, re, subprocess, sys, unicodedata, warnings
warnings.filterwarnings("ignore")

CACHE = os.path.expanduser("~/.gg-loghi")
REPOS = {"tv": "https://github.com/tv-logo/tv-logos.git", "calcio": "https://github.com/luukhopman/football-logos.git",
         "usa": "https://github.com/klunn91/team-logos.git", "marchi": "https://github.com/simple-icons/simple-icons.git"}
# nomi frequenti -> file preciso (il resto si trova con la ricerca)
ALIAS = {
 "nbc": ("tv", "countries/united-states/nbc-us.png"), "tnt": ("tv", "countries/united-states/tnt-us.png"),
 "espn": ("tv", "countries/united-states/espn-us.png"), "espn+": ("tv", "misc/media/espn-plus.png"),
 "abc": ("tv", "countries/united-states/abc-us.png"), "fox": ("tv", "countries/united-states/fox-us.png"),
 "nfl network": ("tv", "countries/united-states/nfl-network-us.png"), "prime video": ("tv", "misc/media/prime-video.png"),
 "amazon prime video": ("tv", "misc/media/prime-video.png"), "amazon": ("tv", "misc/media/amazon.png"),
 "netflix": ("tv", "misc/media/netflix.png"), "apple tv": ("tv", "misc/media/apple-tv-plus.png"),
 "youtube": ("tv", "misc/media/youtube.png"), "dazn": ("tv", "countries/international/dazn-int.png"),
 "sky sport": ("tv", "countries/italy/sky-sport-it.png"), "sky": ("tv", "countries/italy/sky-sport-it.png"),
 "rai sport": ("tv", "countries/italy/rai-sport-it.png"), "rai": ("tv", "countries/italy/rai-1-it.png"),
 "canale 5": ("tv", "countries/italy/canale5-it.png"), "mediaset": ("tv", "countries/italy/canale5-it.png"),
 "bein sports": ("tv", "countries/international/beinsports/old/stacked/bein-sports-int.png"),
 "cbs": ("marchi", "cbs"), "cbs sports": ("marchi", "cbs"),
 # 10 nov 2026: in simple-icons "paramountplus" è la sola montagna Paramount e "hbomax" è il vecchio "max": si usano i file TV giusti
 "paramount+": ("tv", "countries/united-states/paramount-plus-us.png"), "paramount plus": ("tv", "countries/united-states/paramount-plus-us.png"),
 "hbo max": ("tv", "countries/united-states/hbo-max-us.png"), "max": ("tv", "countries/united-states/hbo-max-color-us.png"),
 "fox sports": ("tv", "countries/united-states/fox-sports-us.png"), "sky sports": ("tv", "countries/united-kingdom/sky-sports-hz-uk.png"),
 "tnt sports": ("tv", "countries/world-latin-america/tnt-sports-lam.png"), "tnt sports uk": ("tv", "countries/world-latin-america/tnt-sports-lam.png"),
 "disney+": ("tv", "countries/united-states/disney-plus-us.png"), "disney plus": ("tv", "countries/united-states/disney-plus-us.png"),
 "nba": ("usa", "NBA/_NBA_logo.png"), "nfl": ("usa", "NFL/_NFL_logo.png"), "premier league": ("usa", "Premier_League/_PremierLeague_logo.png"),
}
# nomi che NON hanno un logo affidabile negli archivi: meglio "non trovato" che il marchio sbagliato
SENZA_LOGO = {"disney": "c'è solo Disney+ (\"Disney+\") o i canali Disney Jr./XD, non il marchio Walt Disney Company",
              "skydance": "nessun archivio pubblico ha il marchio Skydance Media"}
NOTE = {"tnt sports": "marchio TNT Sports di UK e America Latina (cerchio rosa); negli USA si usa \"TNT\"",
        "max": "vecchio marchio Max (2023-2025); dal luglio 2025 il servizio si chiama di nuovo HBO Max: usa \"HBO Max\""}

def norm(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", s).strip()

def repo(k):
    d = os.path.join(CACHE, k)
    if not os.path.isdir(d):
        os.makedirs(CACHE, exist_ok=True)
        subprocess.run(["git", "clone", "--depth", "1", "--filter=blob:none", "--no-checkout", "-q", REPOS[k], d], check=True)
    lst = os.path.join(d, ".files")
    if not os.path.exists(lst):
        out = subprocess.run(["git", "-C", d, "ls-tree", "-r", "--name-only", "HEAD"], capture_output=True, text=True, check=True).stdout
        open(lst, "w").write(out)
    return d, open(lst).read().splitlines()

def checkout(k, path):
    d, _ = repo(k)
    subprocess.run(["git", "-C", d, "checkout", "-q", "HEAD", "--", path], check=True)
    return os.path.join(d, path)

def candidates(name):
    q = norm(name); out = []
    for k in ("calcio", "usa", "tv"):
        _, files = repo(k)
        for f in files:
            if not f.lower().endswith(".png"): continue
            if k == "calcio" and not f.startswith("logos/"): continue
            if k == "tv" and "/hd/" in f: continue
            base = norm(os.path.splitext(os.path.basename(f))[0])
            base = re.sub(r"\b(us|uk|it|de|es|fr|int)\b$", "", base).strip()
            if base == q: score = 0
            elif q in base.split() or base.startswith(q + " "): score = 1 + len(base) / 100
            elif q in base: score = 2 + len(base) / 100
            else: continue
            out.append((score, k, f))
    d, files = repo("marchi")
    p = checkout("marchi", "data/simple-icons.json")
    data = json.load(open(p)); data = data["icons"] if isinstance(data, dict) else data
    for ic in data:
        t = norm(ic["title"]); slug = ic.get("slug") or re.sub(r"[^a-z0-9]", "", t)
        if t == q: out.append((0.5, "marchi", slug))
        elif q in t.split(): out.append((2.5 + len(t) / 100, "marchi", slug))
    return sorted(out)[:8]

def svg_png(slug, dst):
    import cairosvg
    p = checkout("marchi", f"icons/{slug}.svg")
    data = json.load(open(checkout("marchi", "data/simple-icons.json")))
    data = data["icons"] if isinstance(data, dict) else data
    hexc = next((i["hex"] for i in data if (i.get("slug") or re.sub(r"[^a-z0-9]", "", norm(i["title"]))) == slug), "0B1F3A")
    if hexc.upper() in ("FFFFFF", "FFF"): hexc = "0B1F3A"
    svg = open(p).read().replace("<svg ", f'<svg fill="#{hexc}" ', 1)
    cairosvg.svg2png(bytestring=svg.encode(), write_to=dst, output_width=512, output_height=512)

ARCH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "loghi")

def archive(name):
    # cerca nell'archivio GG (loghi/): nome file senza "_logo" e senza estensione, confronto normalizzato
    q = norm(name); out = []
    for root, _, fs in os.walk(ARCH):
        for f in fs:
            if not f.lower().endswith((".png", ".jpg", ".jpeg", ".webp", ".svg")): continue
            base = norm(re.sub(r"_logo.*$", "", os.path.splitext(f)[0], flags=re.I))
            words = base.split()
            if base == q: s = 0
            elif q.split() == words[:len(q.split())] or q in words: s = 1 + len(base) / 100
            elif q in base: s = 2 + len(base) / 100
            else: continue
            out.append((s, os.path.join(root, f)))
    if not out:
        q2 = " ".join(w for w in q.split() if w not in ("lega", "fc", "the", "ac", "club"))
        if q2 and q2 != q: return archive(q2)
    return sorted(out)

def save(k, f, dst):
    os.makedirs(os.path.dirname(os.path.abspath(dst)), exist_ok=True)
    if k == "marchi": svg_png(f, dst)
    else:
        import shutil; shutil.copy(checkout(k, f), dst)
    fix_light(dst)

def get(name, dst, tipo=None):
    # tipo: "club" o "lega" = mai canali TV; "tv" = solo canali TV e streaming; "marchio" = solo marchi e sponsor
    key = name.lower().strip()
    a = archive(name)
    if a and a[0][0] < 2:
        from PIL import Image
        os.makedirs(os.path.dirname(os.path.abspath(dst)), exist_ok=True)
        Image.open(a[0][1]).convert("RGBA").save(dst)
        fix_light(dst)
        print(f"OK {name} -> {dst}  (archivio GG: {os.path.relpath(a[0][1], os.path.dirname(ARCH))})"); return True
    if key in SENZA_LOGO:
        print(f"NON TROVATO: {name} ({SENZA_LOGO[key]}). Mettilo nei Loghi mancanti."); return False
    if key in ALIAS:
        k, f = ALIAS[key]; save(k, f, dst)
        print(f"OK {name} -> {dst}  ({k}: {f})" + (f"  NOTA: {NOTE[key]}" if key in NOTE else "")); return True
    c = candidates(name)
    if tipo in ("club", "lega"): c = [x for x in c if x[1] != "tv"]
    elif tipo == "tv": c = [x for x in c if x[1] == "tv"]
    elif tipo == "marchio": c = [x for x in c if x[1] == "marchi"]
    esatti = [x for x in c if x[0] < 1]
    if esatti:
        _, k, f = esatti[0]; save(k, f, dst)
        print(f"OK {name} -> {dst}  ({k}: {f})"); return True
    # nessun nome identico: un canale TV con nome simile (es. "Birmingham" -> una TV locale di Birmingham) non si usa mai da solo
    simili = [x for x in c if x[1] != "tv"]
    if simili:
        _, k, f = simili[0]; save(k, f, dst)
        print(f"ATTENZIONE {name} -> {dst}  ({k}: {f}): il nome del file non è identico a \"{name}\". "
              f"Guarda il logo con Read: se non è il marchio giusto cancellalo e mettilo nei Loghi mancanti.")
        return True
    altri = "; ".join(f"{k}: {f}" for _, k, f in c[:4])
    print(f"NON TROVATO: {name}" + (f" (solo nomi simili, non usati: {altri}. Se uno è davvero quello giusto: "
          f"python3 logo.py --file \"<archivio>: <percorso>\" out.png)" if altri else "")); return False

def fix_light(p):
    # loghi bianchi o chiarissimi (pensati per fondi scuri) diventano blu scuro, così si vedono nel cerchio bianco
    from PIL import Image
    im = Image.open(p).convert("RGBA"); px = im.getdata()
    vis = [(r, g, b) for r, g, b, a in px if a > 128]
    if not vis: return
    lum = sum(0.299 * r + 0.587 * g + 0.114 * b for r, g, b in vis) / len(vis)
    if lum > 200:
        im.putdata([(11, 31, 58, a) if a > 0 and 0.299 * r + 0.587 * g + 0.114 * b > 150 else (r, g, b, a) for r, g, b, a in px])
    bbox = im.getbbox()
    if bbox: im = im.crop(bbox)
    im.save(p)

if __name__ == "__main__":
    args = sys.argv[1:]; tipo = None
    if "--tipo" in args:
        i = args.index("--tipo"); tipo = args[i + 1]; del args[i:i + 2]
    if args[0] == "--cerca":
        for s, f in archive(args[1])[:8]: print(f"{s:.2f}  archivio GG: {os.path.relpath(f, os.path.dirname(ARCH))}")
        for s, k, f in candidates(args[1]): print(f"{s:.2f}  {k}: {f}")
    elif args[0] == "--file":
        # usa un file preciso scelto da --cerca, es. --file "tv: countries/united-states/nbc-us.png" out.png
        k, f = [x.strip() for x in args[1].split(":", 1)]
        if k == "archivio GG":
            from PIL import Image
            Image.open(os.path.join(os.path.dirname(ARCH), f)).convert("RGBA").save(args[2]); fix_light(args[2])
        else: save(k, f, args[2])
        print(f"OK -> {args[2]}  ({k}: {f})")
    else:
        sys.exit(0 if get(args[0], args[1], tipo) else 1)
