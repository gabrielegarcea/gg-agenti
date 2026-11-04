#!/usr/bin/env python3
# GG Motion — effetti sonori sincronizzati, generati da zero (nessun file esterno, nessun copyright)
# Uso: python3 sfx.py events.json durata_secondi sfx.wav
import json, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
rng = np.random.default_rng(7)
ev = json.load(open(sys.argv[1]))
dur = float(sys.argv[2])
out = np.zeros(int((dur + 2) * SR))

def env(n, a=0.002, d=0.05):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)

def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], btype="band", fs=SR, output="sos"), x)

def tick():
    n = int(0.03 * SR); f = rng.uniform(2200, 3200); t = np.arange(n) / SR
    return (0.6 * bp(rng.standard_normal(n), 1500, 7000) * env(n, 0.0005, 0.004) + 0.4 * np.sin(2 * np.pi * f * t) * env(n, 0.0005, 0.008)) * rng.uniform(0.18, 0.28)

def pop():
    n = int(0.12 * SR); t = np.arange(n) / SR
    f = 950 * np.exp(-t / 0.035) + 260; ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(n, 0.001, 0.04) * 0.5

def thump():
    n = int(0.25 * SR); t = np.arange(n) / SR
    f = 160 * np.exp(-t / 0.08) + 55; ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * env(n, 0.001, 0.09) + 0.3 * bp(rng.standard_normal(n), 800, 4000) * env(n, 0.0005, 0.006)) * 0.6

def whoosh():
    n = int(0.42 * SR); x = rng.standard_normal(n); t = np.arange(n) / n
    y = np.zeros(n); seg = n // 8
    for i in range(8):  # filtro passa-banda che sale
        lo = 300 + 2200 * i / 8; s = slice(i * seg, (i + 1) * seg if i < 7 else n)
        y[s] = bp(x, lo, lo * 2.2)[s]
    return y * np.sin(np.pi * t) ** 2 * 0.35

def fill():
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 280 + 520 * (t / t[-1]) ** 0.7; ph = 2 * np.pi * np.cumsum(f) / SR
    e = np.sin(np.pi * t / t[-1]) ** 0.6
    return (np.sin(ph) * 0.6 + 0.4 * bp(rng.standard_normal(n), 2000, 6000)) * e * 0.18

def click():
    n = int(0.06 * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for off in (0, int(0.028 * SR)):
        m = n - off; tt = np.arange(m) / SR
        y[off:] += (bp(rng.standard_normal(m), 1500, 8000) * env(m, 0.0003, 0.003) + 0.5 * np.sin(2 * np.pi * 1800 * tt) * env(m, 0.0003, 0.006))
    return y * 0.45

def pen(d=0.7):
    n = int(d * SR); t = np.arange(n) / SR
    am = 0.55 + 0.45 * np.sin(2 * np.pi * (9 + 4 * np.sin(2 * np.pi * 0.7 * t)) * t)
    return bp(rng.standard_normal(n), 2500, 7000) * am * np.minimum(1, t / 0.03) * np.minimum(1, (t[-1] - t) / 0.08 + 0.001) * 0.12

def roll(d=1.0):
    n = int(d * SR); y = np.zeros(n)
    for k in range(18):
        p = int((k / 18) ** 1.3 * (n - 2000)); s = tick() * 0.7; y[p:p + len(s)] += s[: n - p]
    return y

def hit():
    n = int(0.6 * SR); t = np.arange(n) / SR
    f = 90 * np.exp(-t / 0.12) + 42; ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * env(n, 0.001, 0.22) * 0.8 + 0.35 * bp(rng.standard_normal(n), 300, 5000) * env(n, 0.0005, 0.05)) * 0.7

def riser(d=1.4):
    n = int(d * SR); t = np.arange(n) / SR; x = rng.standard_normal(n); y = np.zeros(n); seg = n // 12
    for i in range(12):
        lo = 200 + 3000 * i / 12; s = slice(i * seg, (i + 1) * seg if i < 11 else n)
        y[s] = bp(x, lo, lo * 1.8)[s]
    f = 120 + 600 * (t / t[-1]) ** 2; ph = 2 * np.pi * np.cumsum(f) / SR
    return (y * 0.5 + np.sin(ph) * 0.3) * (t / t[-1]) ** 2 * 0.4

SOUNDS = {"tick": tick, "pop": pop, "thump": thump, "whoosh": whoosh, "fill": fill, "click": click, "hit": hit}
for e in ev:
    k, t0 = e["k"], max(0.0, float(e["t"]))
    if k == "pen": s = pen(e.get("d", 0.7))
    elif k == "roll": s = roll(e.get("d", 1.0))
    elif k == "riser": s = riser(e.get("d", 1.4))
    elif k in SOUNDS: s = SOUNDS[k]()
    else: continue
    s = s * e.get("g", 1.0)
    i = int(t0 * SR); j = min(len(out), i + len(s)); out[i:j] += s[: j - i]

out = out[: int(dur * SR)]
peak = np.max(np.abs(out)) or 1
if peak > 0.95: out *= 0.95 / peak
with wave.open(sys.argv[3], "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print(f"sfx OK: {len(ev)} effetti")
