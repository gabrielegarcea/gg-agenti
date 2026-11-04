#!/usr/bin/env python3
# GG Motion — sottotitoli precisi: allinea parola per parola il testo del reel alla voce vera di GG
# Metodo: voce sintetica di riferimento (espeak-ng, parola per parola) + confronto acustico MFCC con DTW.
# Nessun servizio esterno, nessun modello da scaricare. Serve: pip install librosa (una volta).
# Uso: python3 align.py reel.json timeline.json   (stesso output di timing.py, ma preciso)
import json, os, re, subprocess, sys, tempfile, wave
import numpy as np
import librosa

cfg = json.load(open(sys.argv[1], encoding="utf-8"))
base = os.path.dirname(os.path.abspath(sys.argv[1]))
audio = cfg["audio"] if os.path.isabs(cfg["audio"]) else os.path.join(base, cfg["audio"])
SR, HOP = 16000, 320  # 20 ms per frame
LANG = cfg.get("lang", "en")

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
        if not txt: continue
        out.append({"w": txt, "hi": bool(hi), "open": bool(opened), "m": pend}); pend = []
    if pend and out: out[-1]["m_after"] = pend
    for w in out: w.pop("open", None)
    return out

def load(path):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32)

tmp = tempfile.mkdtemp()
def synth(word):
    k = re.sub(r"[^\wàèéìòù'%€$.,]", "", word)
    if not k: return np.zeros(int(0.05 * SR), dtype=np.float32)
    f = os.path.join(tmp, "w.wav")
    subprocess.run(["espeak-ng", "-v", LANG, "-s", "170", "-w", f, k], check=True, capture_output=True)
    y = load(f)
    yt, _ = librosa.effects.trim(y, top_db=35)
    return yt if len(yt) else y

# 1) voce di riferimento con confini noti per ogni parola
S, ref, pos = [], [], 0
gap_w = np.zeros(int(0.06 * SR), dtype=np.float32)
gap_s = np.zeros(int(0.45 * SR), dtype=np.float32)
for kind, a, b, say in segs:
    ws = words_of(say)
    for w in ws:
        y = synth(w["w"]); w["_rs"] = pos; ref.append(y); pos += len(y); w["_re"] = pos
        p = gap_s if re.search(r"[.!?…]$", w["w"]) else (np.zeros(int(0.2 * SR), np.float32) if re.search(r"[,;:]$", w["w"]) else gap_w)
        ref.append(p); pos += len(p)
    S.append({"kind": kind, "ci": a, "si": b, "words": ws, "_r0": ws[0]["_rs"], "_r1": ws[-1]["_re"]})
ref = np.concatenate(ref)
real = load(audio)
dur = len(real) / SR

# 2) caratteristiche acustiche (MFCC normalizzati) e allineamento DTW
def feats(y):
    m = librosa.feature.mfcc(y=y, sr=SR, n_mfcc=20, hop_length=HOP, n_fft=640)[1:]
    m = (m - m.mean(axis=1, keepdims=True)) / (m.std(axis=1, keepdims=True) + 1e-6)
    e = np.log(librosa.feature.rms(y=y, frame_length=640, hop_length=HOP)[0] + 1e-5)
    e = (e - e.mean()) / (e.std() + 1e-6)
    n = min(m.shape[1], len(e))
    return np.vstack([m[:, :n], np.repeat(e[None, :n], 4, axis=0)])
def dtw_map(Fa, Fb):
    _, p = librosa.sequence.dtw(X=Fa, Y=Fb, metric="euclidean", step_sizes_sigma=np.array([[1, 1], [0, 1], [1, 0], [2, 1], [1, 2]]), weights_add=np.array([0, 1, 1, 1, 1]))
    p = p[::-1]; mp = np.full(Fa.shape[1], -1)
    for i, j in p:
        if mp[i] < 0: mp[i] = j
    for i in range(1, len(mp)):
        if mp[i] < 0: mp[i] = mp[i - 1]
    return mp
Fr, Fv = feats(ref), feats(real)
r2v = dtw_map(Fr, Fv)
def to_real(sample):
    fi = min(len(r2v) - 1, max(0, int(sample / HOP)))
    return float(r2v[fi] * HOP / SR)

# 3) tempi delle parole sulla voce vera, ritoccati sull'energia (una parola non inizia nel silenzio)
rms = librosa.feature.rms(y=real, frame_length=640, hop_length=HOP)[0]
floor = np.percentile(rms, 10); thr = max(floor * 4, np.percentile(rms, 30) * 0.5)
voiced = rms > thr
def snap_start(t, lim):
    i, j = int(t * SR / HOP), int(lim * SR / HOP)
    while i < min(j, len(voiced) - 1) and not voiced[i]: i += 1
    return i * HOP / SR
def snap_end(t, lim):
    i, j = int(t * SR / HOP), int(lim * SR / HOP)
    while i > max(j, 0) and i < len(voiced) and not voiced[i - 1]: i -= 1
    return i * HOP / SR
# 3a) confini delle frasi (passata globale + energia)
for s in S:
    s["_v0"] = snap_start(to_real(s["_r0"]), to_real(s["_r1"]))
for k, s in enumerate(S):
    lim = S[k + 1]["_v0"] if k + 1 < len(S) else dur
    s["_v1"] = snap_end(max(to_real(s["_r1"]), s["_v0"] + 0.3) if k + 1 == len(S) else lim, s["_v0"] + 0.2)
# 3b) passata locale frase per frase: parole dentro la frase
for s in S:
    r0, r1 = s.pop("_r0"), s.pop("_r1"); v0, v1 = s.pop("_v0"), s.pop("_v1")
    seg_ref = ref[r0:r1]; seg_real = real[int(v0 * SR):max(int(v1 * SR), int(v0 * SR) + HOP * 4)]
    mp = dtw_map(feats(seg_ref), feats(seg_real))
    loc = lambda smp: v0 + float(mp[min(len(mp) - 1, max(0, int((smp - r0) / HOP)))] * HOP / SR)
    for w in s["words"]:
        st = snap_start(loc(w.pop("_rs")), v1); en = loc(w.pop("_re"))
        w["start"], w["end"] = round(st, 3), round(min(max(en, st + 0.06), v1), 3)
    s["words"][-1]["end"] = round(max(v1, s["words"][-1]["start"] + 0.06), 3)
    s["start"], s["end"] = s["words"][0]["start"], s["words"][-1]["end"]
for i in range(len(S) - 1):
    S[i]["vend"] = S[i + 1]["start"]
S[-1]["vend"] = dur + 1.5
json.dump({"duration": dur + 1.5, "segments": S}, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"allineamento OK: {len(S)} segmenti, {dur:.1f}s")
for s in S:
    print(f"  {s['start']:6.2f}-{s['end']:6.2f} {s['kind']} {' '.join(w['w'] for w in s['words'])[:70]}")
