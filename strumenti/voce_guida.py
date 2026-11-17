#!/usr/bin/env python3
# GG Motion — voce guida: serve SOLO a calcolare i tempi dei sottotitoli, non si sente mai nel video.
# Uso: python3 voce_guida.py reel.json voce-guida.wav
# Con espeak-ng usa la sintesi vera. Senza espeak-ng (sessioni senza rete per apt, 17 nov 2026)
# genera una traccia "a blocchi": un suono per parola, lungo quanto la parola detta a voce normale,
# e 0,7 s di silenzio fra una frase e l'altra. timing.py ricava i confini dai silenzi, quindi i tempi
# per frase restano giusti; quelli per parola sono una stima, come gia' con espeak (li sistema align.py
# o timing.py sulla voce vera di GG).
import json, re, subprocess, sys, os, shutil, tempfile, wave
import numpy as np

cfg = json.load(open(sys.argv[1], encoding="utf-8"))
says = []
if cfg.get("cover"): says.append(cfg["cover"]["say"])
for ch in cfg.get("chapters", []):
    for st in ch["steps"]: says.append(st["say"])
if cfg.get("outro"): says.append(cfg["outro"]["say"])
pulisci = lambda s: re.sub(r"\{\w+\}", "", s).replace("*", "")
SR = 22050
esp = shutil.which("espeak-ng") or shutil.which("espeak")

if esp:
    tmp = tempfile.mkdtemp(); parts = []
    sil = os.path.join(tmp, "sil.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=22050:cl=mono", "-t", "0.7", sil], check=True)
    for i, s in enumerate(says):
        f = os.path.join(tmp, f"{i}.wav"); g = os.path.join(tmp, f"{i}r.wav")
        subprocess.run([esp, "-v", cfg.get("lang", "en"), "-s", "165", "-w", f, pulisci(s)], check=True)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f, "-ar", "22050", "-ac", "1", g], check=True)
        parts += [g, sil]
    lst = os.path.join(tmp, "l.txt"); open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c:a", "pcm_s16le", sys.argv[2]], check=True)
    print(f"voce guida OK (espeak-ng): {len(says)} frasi -> {sys.argv[2]}")
    sys.exit(0)

def sillabe(w):
    w = w.lower()
    if re.search(r"\d", w):                      # numeri: circa due sillabe per cifra ("110" = one hundred ten)
        return 2 * len(re.sub(r"\D", "", w)) + 1
    w = re.sub(r"[^a-z]", "", w)
    if not w: return 1
    n = len(re.findall(r"[aeiouy]+", w))
    if w.endswith("e") and n > 1 and not w.endswith(("le", "ee")): n -= 1
    return max(1, n)

def durata(w):                                   # ~165 parole al minuto, come espeak -s 165
    d = 0.08 + 0.16 * sillabe(w)
    if re.search(r"[.!?]$", w): d += 0.1
    return d

def blocco(d):
    t = np.arange(int(d * SR)) / SR
    x = 0.35 * np.sin(2 * np.pi * 180 * t) * (0.6 + 0.4 * np.sin(2 * np.pi * 4 * t))
    r = min(len(x) // 4, int(0.015 * SR))
    if r: x[:r] *= np.linspace(0, 1, r); x[-r:] *= np.linspace(1, 0, r)
    return x

pezzi = []
gap = np.zeros(int(0.04 * SR))                   # fra parole: sotto i 0,12 s che timing.py considera pausa
for s in says:
    ws = pulisci(s).split()
    for k, w in enumerate(ws):
        pezzi.append(blocco(durata(w)))
        if k < len(ws) - 1: pezzi.append(gap)
    pezzi.append(np.zeros(int(0.7 * SR)))
y = np.concatenate(pezzi) if pezzi else np.zeros(SR)
with wave.open(sys.argv[2], "wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
print(f"voce guida OK (senza espeak-ng, traccia a blocchi): {len(says)} frasi, {len(y)/SR:.1f}s -> {sys.argv[2]}")
