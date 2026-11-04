#!/usr/bin/env python3
import json, re, subprocess, sys, os, tempfile
cfg = json.load(open(sys.argv[1], encoding="utf-8"))
says = []
if cfg.get("cover"): says.append(cfg["cover"]["say"])
for ch in cfg.get("chapters", []):
    for st in ch["steps"]: says.append(st["say"])
if cfg.get("outro"): says.append(cfg["outro"]["say"])
tmp = tempfile.mkdtemp(); parts = []
sil = os.path.join(tmp, "sil.wav")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=22050:cl=mono", "-t", "0.7", sil], check=True)
for i, s in enumerate(says):
    txt = re.sub(r"\{\w+\}", "", s).replace("*", "")
    f = os.path.join(tmp, f"{i}.wav")
    subprocess.run(["espeak-ng", "-v", cfg.get("lang", "en"), "-s", "165", "-w", f, txt], check=True)
    g = os.path.join(tmp, f"{i}r.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f, "-ar", "22050", "-ac", "1", g], check=True)
    parts += [g, sil]
lst = os.path.join(tmp, "l.txt"); open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c:a", "pcm_s16le", sys.argv[2]], check=True)
print(f"voce guida OK: {len(says)} frasi -> {sys.argv[2]}")
