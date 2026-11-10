#!/usr/bin/env python3
"""zone.py - disegna le zone morte di Instagram sopra le anteprime di un reel.

Uso:
    python3 zone.py anteprima1.png anteprima2.png ... --out foglio.png

Schema di GG (4 nov 2026, ribadito il 10 nov): 250 px in alto, 320 in basso,
120 ai lati, e la colonna dei pulsanti (like, commenti, condividi) da 768 px
in basso a DESTRA. La colonna e' solo a destra: la parte bassa a sinistra si
usa (li' stanno i sottotitoli).

Le zone morte escono in rosso trasparente. Se un testo, un numero o un
grafico tocca il rosso, il reel e' da correggere. Il foglio mette le
anteprime una accanto all'altra, cosi' si controllano tutte con una sola
lettura (un'immagine costa token: un foglio solo invece di dieci).
"""
import sys
from PIL import Image, ImageDraw

W, H = 1080, 1920
ALTO, BASSO, LATI = 250, 320, 120
PULSANTI_H = 768          # altezza della colonna dei pulsanti, dal fondo
PULSANTI_X = 835          # da qui a destra, sotto H - PULSANTI_H, e' coperto


def zone(img):
    img = img.convert("RGBA").resize((W, H))
    over = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    rosso = (230, 30, 30, 70)
    d.rectangle([0, 0, W, ALTO], fill=rosso)
    d.rectangle([0, H - BASSO, W, H], fill=rosso)
    d.rectangle([0, ALTO, LATI, H - BASSO], fill=rosso)
    d.rectangle([W - LATI, ALTO, W, H - BASSO], fill=rosso)
    d.rectangle([PULSANTI_X, H - PULSANTI_H, W - LATI, H - BASSO], fill=rosso)
    # bordo della zona utile
    d.line([(LATI, ALTO), (W - LATI, ALTO), (W - LATI, H - PULSANTI_H),
            (PULSANTI_X, H - PULSANTI_H), (PULSANTI_X, H - BASSO),
            (LATI, H - BASSO), (LATI, ALTO)], fill=(230, 30, 30, 255), width=4)
    return Image.alpha_composite(img, over).convert("RGB")


def main(args):
    if "--out" not in args or args.index("--out") + 1 >= len(args):
        print(__doc__)
        return 2
    k = args.index("--out")
    out, files = args[k + 1], args[:k] + args[k + 2:]
    if not files:
        print(__doc__)
        return 2
    cols = min(5, len(files))
    tw = 300
    th = int(tw * H / W)
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * tw, rows * th), "white")
    for i, f in enumerate(files):
        sheet.paste(zone(Image.open(f)).resize((tw, th)), ((i % cols) * tw, (i // cols) * th))
    sheet.save(out)
    print("foglio con le zone morte: %s (%d anteprime)" % (out, len(files)))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
