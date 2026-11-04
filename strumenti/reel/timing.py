#!/usr/bin/env python3
# GG Motion — tempi parola per parola: stima dalla voce reale (pause) + durata fonetica di ogni parola (espeak-ng)
# Uso: python3 timing.py reel.json timeline.json
import json, os, re, subprocess, sys, wave, io, shutil

cfg = json.load(open(sys.argv[1], encoding="utf-8"))
base = os.path.dirname(os.path.abspath(sys.argv[1]))
audio = cfg["audio"] if os.path.isabs(cfg["audio"]) else os.path.join(base, cfg["audio"])

def run(c):
    return subprocess.run(c, capture_output=True)

dur = float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", audio]).stdout)

# segmenti parlati nell'ordine: cover, ogni step di ogni capitolo, outro
segs = []
if cfg.get("cover"): segs.append(("cover", 0, 0, cfg["cover"]["say"]))
for ci, ch in enumerate(cfg.get("chapters", [])):
    for si, st in enumerate(ch["steps"]):
        segs.append(("step", ci, si, st["say"]))
if cfg.get("outro"): segs.append(("outro", 0, 0, cfg["outro"]["say"]))

TOK = re.compile(r"\{(\w+)\}|(\S+)")
def words_of(say):
    out, pend = [], []
    for m in TOK.finditer(say):
        if m.group(1):
            pend.append(m.group(1)); continue
        raw = m.group(2)
        hi = raw.startswith("*") or (out and out[-1]["open"])
        opened = hi and not raw.rstrip(".,;:!?»\"'").endswith("*")
        txt = raw.replace("*", "")
        if not txt:
            continue
        out.append({"w": txt, "hi": bool(hi), "open": bool(opened), "m": pend}); pend = []
    if pend and out: out[-1]["m_after"] = pend
    for w in out: w.pop("open", None)
    return out

esp = shutil.which("espeak-ng") or shutil.which("espeak")
cache = {}
def weight(w):
    k = re.sub(r"[^\wàèéìòù']", "", w.lower())
    if not k: return 0.05
    if k in cache: return cache[k]
    v = None
    if esp:
        r = run([esp, "-v", cfg.get("lang", "it"), "-s", "175", "--stdout", k])
        try:
            with wave.open(io.BytesIO(r.stdout)) as f:
                v = f.getnframes() / f.getframerate()
        except Exception:
            v = None
    if v is None: v = 0.06 * len(k) + 0.08
    cache[k] = v
    return v

def wweight(w):
    x = weight(w["w"])
    if re.search(r"[.!?…]$", w["w"]): x += 0.35
    elif re.search(r"[,;:]$", w["w"]): x += 0.18
    return x

S = []
for kind, a, b, say in segs:
    ws = words_of(say)
    S.append({"kind": kind, "ci": a, "si": b, "words": ws, "W": sum(wweight(w) for w in ws) + 0.25})

# overhead di espeak (silenzio prima/dopo ogni parola sintetizzata da sola)
_ov = None
def overhead():
    global _ov
    if _ov is None:
        _ov = 0.0
        if esp:
            k = cache.pop("a", None); _ov = max(weight("a") - 0.06, 0.0); cache.pop("a", None)
    return _ov
def wweight2(w):
    x = max(weight(w["w"]) - overhead(), 0.05)
    if re.search(r"[.!?…]$", w["w"]): x += 0.35
    elif re.search(r"[,;:]$", w["w"]): x += 0.18
    return x
wweight = wweight2
for s in S:
    s["W"] = sum(wweight(w) for w in s["words"]) + 0.25

sil = run(["ffmpeg", "-hide_banner", "-i", audio, "-af", "silencedetect=noise=-32dB:d=0.12", "-f", "null", "-"]).stderr.decode()
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", sil)]
en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", sil)]
lead = en[0] if st and st[0] < 0.05 and en else 0.0
trail = st[-1] if st and len(st) > len(en) - (1 if lead else 0) and st[-1] > dur - 2 else dur
allp = [(s_, e_) for s_, e_ in zip(st, en) if s_ > 0.05 and e_ < dur - 0.05]

def align(est, pauses, t0, t1, sigma):
    """sceglie, in ordine, una pausa per ogni confine stimato (programmazione dinamica)"""
    K, M = len(est), len(pauses)
    if K == 0: return []
    if M < K: return [(c, c) for c in est]
    INF = float("inf")
    def cost(k, j):
        p = pauses[j]; mid = (p[0] + p[1]) / 2; ln = p[1] - p[0]
        return ((mid - est[k]) / sigma) ** 2 - 1.2 * math.log(ln / 0.12 + 1)
    D = [[INF] * M for _ in range(K)]; B = [[-1] * M for _ in range(K)]
    for j in range(M): D[0][j] = cost(0, j)
    for k in range(1, K):
        best, bj = INF, -1
        for j in range(M):
            if j > 0 and D[k - 1][j - 1] < best: best, bj = D[k - 1][j - 1], j - 1
            if bj >= 0: D[k][j] = best + cost(k, j); B[k][j] = bj
    j = min(range(M), key=lambda j: D[K - 1][j]); out = []
    for k in range(K - 1, -1, -1):
        out.append(pauses[j]); j = B[k][j]
    return out[::-1]

import math
span = trail - lead
tot = sum(s["W"] for s in S)
acc, est = 0, []
for s in S[:-1]:
    acc += s["W"]; est.append(lead + acc / tot * span)
big = [p for p in allp if p[1] - p[0] >= 0.2] or allp
snapped = align(est, big, lead, trail, 1.8)
starts = [lead] + [p[1] for p in snapped]
ends = [p[0] for p in snapped] + [trail]
for i, s in enumerate(S):
    s["start"], s["end"] = round(starts[i], 3), round(max(ends[i], starts[i] + 0.4), 3)
    # dentro il segmento: agganci alla punteggiatura usando le pause piccole
    ws = s["words"]; W = sum(wweight(w) for w in ws) or 1
    cut_idx = [k for k, w in enumerate(ws[:-1]) if re.search(r"[.,;:!?…]$", w["w"])]
    inner = [p for p in allp if p[0] > s["start"] + 0.15 and p[1] < s["end"] - 0.15]
    pieces_b = [s["start"]]
    if cut_idx and inner:
        acc, est2 = 0, []
        for k, w in enumerate(ws):
            acc += wweight(w)
            if k in cut_idx: est2.append(s["start"] + acc / W * (s["end"] - s["start"]))
        sn = align(est2, inner, s["start"], s["end"], 0.6)
        marks = {k: p for k, p in zip(cut_idx, sn)}
    else:
        marks = {}
    # distribuzione parola per parola tra i punti fissi
    k0, t0 = 0, s["start"]
    keys = sorted(marks) + [len(ws) - 1]
    for kk in keys:
        grp = ws[k0:kk + 1]
        t1 = marks[kk][0] if kk in marks else s["end"]
        Wg = sum(wweight(w) for w in grp) or 1; t = t0
        for w in grp:
            d = wweight(w) / Wg * (t1 - t0); w["start"], w["end"] = round(t, 3), round(t + d, 3); t += d
        k0 = kk + 1; t0 = marks[kk][1] if kk in marks else t1
# il segmento visivo dura fino all'inizio del successivo
for i in range(len(S) - 1):
    S[i]["vend"] = S[i + 1]["start"]
S[-1]["vend"] = dur + 1.5
json.dump({"duration": dur + 1.5, "segments": S}, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"tempi OK: {len(S)} segmenti, {dur:.1f}s")
for s in S:
    print(f"  {s['start']:6.2f}-{s['end']:6.2f} {s['kind']} {' '.join(w['w'] for w in s['words'])[:70]}")
