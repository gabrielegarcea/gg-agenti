#!/usr/bin/env python3
"""GG on Sport — prepara la cartella di lavoro SENZA installare niente (17 nov 2026).

Uso:  python3 ~/gg-agenti/strumenti/prepara.py reel        -> ~/ggm
      python3 ~/gg-agenti/strumenti/prepara.py caroselli   -> ~/gg

Perche' esiste: il 17 nov 2026 il Reel si e' fermato perche' la sessione pianificata non
raggiungeva npm, pypi e apt (403 dal proxy, DNS assente). Da qui in avanti niente si
installa: font in strumenti/fonts, voce guida senza espeak-ng, loghi SVG senza cairosvg,
align.py che ripiega su timing.py. Servono solo cose gia' presenti nell'immagine
(node, Playwright con Chromium, ffmpeg, python con numpy/scipy/Pillow).

Copia gli strumenti, controlla tutto e chiude con UNA riga: "PRONTO" oppure
"NON PRONTO: <cosa manca>". Non rilanciarlo piu' di due volte.
"""
import os, shutil, subprocess, sys

S = os.path.dirname(os.path.abspath(__file__))
R = os.path.join(S, "reel")
HOME = os.path.expanduser("~")
FONT = ["anton-latin-400-normal", "anton-latin-ext-400-normal", "caveat-latin-700-normal",
        "inter-latin-400-normal", "inter-latin-500-normal", "inter-latin-600-normal", "inter-latin-700-normal",
        "inter-latin-800-normal", "inter-latin-900-normal", "jetbrains-mono-latin-400-normal", "jetbrains-mono-latin-700-normal"]
rotto, info = [], []

def cp(src, dst):
    if not os.path.exists(src): rotto.append("manca " + src); return
    os.makedirs(os.path.dirname(dst), exist_ok=True); shutil.copy(src, dst)

def run(cmd, cwd=None, t=60):
    try:
        r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=t)
        return r.returncode, (r.stdout + r.stderr).strip()
    except Exception as e:
        return 1, str(e)

modo = (sys.argv[1:] or [""])[0]
if modo == "reel":
    W = os.path.join(HOME, "ggm")
    for f in ("render.js", "timing.py", "sfx.py", "marker.py", "zone.py"): cp(os.path.join(R, f), os.path.join(W, f))
    for f in ("voce_guida.py", "align.py", "controllo.py"): cp(os.path.join(S, f), os.path.join(W, f))
    cp(os.path.join(os.path.dirname(S), "brand", "gg-simbolo.svg"), os.path.join(W, "brand", "gg-simbolo.svg"))
    E = os.path.join(R, "effetti")   # effetti facoltativi (EFFETTI.md): base.js e gli altri .js, piu' catalogo.json
    if os.path.isdir(E):
        for f in os.listdir(E):
            if f.endswith((".js", ".json")) and f != "catalogo.js": cp(os.path.join(E, f), os.path.join(W, "effetti", f))
    os.makedirs(os.path.join(W, "lavoro"), exist_ok=True)
    os.makedirs(os.path.join(HOME, "gg", "reel"), exist_ok=True); os.makedirs(os.path.join(HOME, "gg", "foto"), exist_ok=True)
elif modo == "caroselli":
    W = os.path.join(HOME, "gg")
    for f in ("render.js", "controllo.py"): cp(os.path.join(S, f), os.path.join(W, f))
    os.makedirs(os.path.join(W, "foto"), exist_ok=True)
else:
    sys.exit(__doc__)

# font nel repository (render.js li cerca li': nessun npm)
manca = [f for f in FONT if not os.path.exists(os.path.join(S, "fonts", f + ".woff2"))]
if manca: rotto.append("font mancanti in strumenti/fonts: " + ", ".join(manca))

# programmi dell'immagine
for p in ("node", "ffmpeg", "ffprobe", "git"):
    if not shutil.which(p): rotto.append(p + " non c'e'")
c, o = run([sys.executable, "-c", "import numpy, scipy, PIL"])
if c: rotto.append("python: " + o.splitlines()[-1])

# Playwright + Chromium: si avvia davvero (e' quello che fa il render)
c, o = run(["node", "-e", "require('playwright').chromium.launch().then(b=>b.close()).then(()=>console.log('ok'))"], cwd=W, t=90)
if c or "ok" not in o: rotto.append("Chromium non parte: " + (o.splitlines() or ["?"])[-1][:160])

# facoltativi: se mancano si usa il ripiego, non e' un errore
info.append("espeak-ng " + ("si" if shutil.which("espeak-ng") else "no -> voce guida a blocchi"))
c, _ = run([sys.executable, "-c", "import librosa"])
if modo == "reel": info.append("librosa " + ("si" if c == 0 else "no -> align.py usa timing.py"))
c, _ = run([sys.executable, "-c", "import cairosvg"])
info.append("cairosvg " + ("si" if c == 0 else ("no -> rsvg-convert" if shutil.which("rsvg-convert") else "no -> Chromium")))

print("cartella:", W, "| " + " | ".join(info))
print("PRONTO" if not rotto else "NON PRONTO: " + "; ".join(rotto))
sys.exit(1 if rotto else 0)
