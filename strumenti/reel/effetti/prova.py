#!/usr/bin/env python3
"""Prova degli effetti: da una mini-specifica a un foglio di fotogrammi, senza voce e senza video.

Uso:  python3 prova.py spec.json foglio.png [--cartella DIR] [--video]

spec.json = un reel.json ridotto (style, cover facoltativa, chapters, outro facoltativo), SENZA marker:
prova.py mette i marker (marker.py), fa voce guida e tempi, poi per ogni step cattura 3 istanti
(inizio+0.15s, meta', fine) e li impagina in un foglio (miniature 1/4) con l'etichetta del tempo.
--video renderizza anche l'mp4 (senza voce) in DIR/prova.mp4; --senza-foglio fa solo il video.
I motori usati sono quelli accanto a questa cartella (../render.js, ../timing.py, ../marker.py,
../../voce_guida.py) e gli effetti di questa cartella: per provare un file isolato usa --cartella,
che copia motore + base.js + SOLO i .js elencati in --solo (es. --solo testo.js).
"""
import json, os, shutil, subprocess, sys
from PIL import Image, ImageDraw

a = sys.argv[1:]
if len(a) < 2: sys.exit(__doc__)
spec, out = a[0], a[1]
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H); S = os.path.dirname(R)
W = a[a.index("--cartella") + 1] if "--cartella" in a else "/tmp/fxprova"
solo = a[a.index("--solo") + 1].split(",") if "--solo" in a else None
os.makedirs(os.path.join(W, "effetti"), exist_ok=True); os.makedirs(os.path.join(W, "brand"), exist_ok=True)
for f in ("render.js", "timing.py", "marker.py", "sfx.py"): shutil.copy(os.path.join(R, f), W)
shutil.copy(os.path.join(S, "voce_guida.py"), W)
br = os.path.join(os.path.dirname(S), "brand", "gg-simbolo.svg")
if os.path.exists(br): shutil.copy(br, os.path.join(W, "brand"))
for f in os.listdir(os.path.join(W, "effetti")): os.remove(os.path.join(W, "effetti", f))
for f in os.listdir(H):
    if f.endswith(".js") and f != "catalogo.js" and (solo is None or f == "base.js" or f in solo): shutil.copy(os.path.join(H, f), os.path.join(W, "effetti"))
d = json.load(open(spec)); d.setdefault("lang", "en"); d["audio"] = "voce.wav"
rj = os.path.join(W, "reel.json"); json.dump(d, open(rj, "w"), ensure_ascii=False, indent=1)
def run(*c):
    r = subprocess.run(list(c), cwd=W, capture_output=True, text=True)
    if r.returncode: sys.exit("ERRORE in %s:\n%s" % (" ".join(c), (r.stdout + r.stderr)[-1500:]))
    return r.stdout
run("python3", "marker.py", "reel.json")
run("python3", "voce_guida.py", "reel.json", "voce.wav")
run("python3", "timing.py", "reel.json", "tl.json")
tl = json.load(open(os.path.join(W, "tl.json")))
ts, labs = [], []
for s in tl["segments"]:
    a0, b0 = s["start"], s["vend"]
    for x in (a0 + 0.15, (a0 + b0) / 2, b0 - 0.05):
        ts.append(round(x, 2)); labs.append("%s %s %.2fs" % (s["kind"], "%d.%d" % (s["ci"] + 1, s["si"] + 1) if s["kind"] == "step" else "", x))
if "--senza-foglio" in a:
    run("node", "render.js", "reel.json", "tl.json", "prova.mp4"); print("video:", os.path.join(W, "prova.mp4")); sys.exit(0)
run("node", "render.js", "reel.json", "tl.json", "p", "--preview", ",".join(map(str, ts)))
js = lambda t: ("%.3f" % t).rstrip("0").rstrip(".")   # come Number.toString di JavaScript
th = [Image.open(os.path.join(W, "p_%s.png" % js(t))).convert("RGB").resize((270, 480)) for t in ts]
cols = 6; rows = (len(th) + cols - 1) // cols
sheet = Image.new("RGB", (cols * 280, rows * 510), "white"); dr = ImageDraw.Draw(sheet)
for i, (im, lb) in enumerate(zip(th, labs)):
    x, y = (i % cols) * 280, (i // cols) * 510; sheet.paste(im, (x + 5, y + 25)); dr.text((x + 6, y + 6), lb, fill="black")
sheet.save(out); print("foglio:", out, "(%d fotogrammi)" % len(th))
if "--video" in a:
    run("node", "render.js", "reel.json", "tl.json", "prova.mp4"); print("video:", os.path.join(W, "prova.mp4"))
