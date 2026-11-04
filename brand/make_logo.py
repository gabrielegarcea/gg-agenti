"""Genera il logo GG on Sport (direzione A: monogramma "GG." dentro il catino dello stadio).
Lettere in Anton convertite in tracciati: il logo non dipende da font installati."""
import os, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
import cairosvg

NAVY, BLUE, ORANGE, PAPER = '#0B1F3A', '#1F4FD1', '#FF6A13', '#F4F1EA'
FONT = TTFont(sys.argv[1])
OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)
gs, cmap, upm = FONT.getGlyphSet(), FONT.getBestCmap(), FONT['head'].unitsPerEm
CAP = BoundsPen(gs); gs[cmap[ord('H')]].draw(CAP); CAP_H = CAP.bounds[3]


def text(s, x, base, cap, track=0.0):
    """Tracciato della stringa con altezza delle maiuscole = cap. Ritorna (d, larghezza)."""
    k = cap / CAP_H
    pen = SVGPathPen(gs)
    cx = 0
    for ch in s:
        g = cmap[ord(ch)]
        if ch != ' ':
            gs[g].draw(TransformPen(pen, (k, 0, 0, -k, x + cx, base)))
        cx += gs[g].width * k + track * cap
    return pen.getCommands(), cx - track * cap


def width(s, cap, track=0.0):
    return text(s, 0, 0, cap, track)[1]


def mark(cx, cy, r, ink=PAPER, ring=PAPER, dot=ORANGE, bg=NAVY):
    """Il simbolo: cerchio (se bg), anello dello stadio, GG e punto. r = raggio del cerchio."""
    out = []
    if bg:
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{bg}"/>')
    out.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{r*0.83:.1f}" ry="{r*0.535:.1f}" fill="none" stroke="{ring}" stroke-width="{r*0.072:.1f}"/>')
    cap = r * 0.56
    dot_r, gap = cap * 0.13, cap * 0.07
    w = width('GG', cap, 0.04)
    total = w + gap + 2 * dot_r
    x0, base = cx - total / 2, cy + cap / 2
    d, _ = text('GG', x0, base, cap, 0.04)
    out.append(f'<path d="{d}" fill="{ink}"/>')
    out.append(f'<circle cx="{x0 + w + gap + dot_r:.1f}" cy="{base - dot_r:.1f}" r="{dot_r:.1f}" fill="{dot}"/>')
    return '\n'.join(out)


def svg(w, h, body, bg=None):
    rect = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{rect}{body}</svg>'


def save(name, s, png_widths=()):
    open(f'{OUT}/{name}.svg', 'w').write(s)
    for pw in png_widths:
        suffix = '' if len(png_widths) == 1 else f'-{pw}'
        cairosvg.svg2png(bytestring=s.encode(), write_to=f'{OUT}/{name}{suffix}.png', output_width=pw)


# 1. Simbolo (avatar): cerchio navy
save('gg-simbolo', svg(1000, 1000, mark(500, 500, 500)), (1080, 320))
# 2. Simbolo senza cerchio, chiaro: da mettere sopra foto o fondi scuri (reel, copertine)
save('gg-simbolo-chiaro', svg(1000, 660, mark(500, 330, 600, bg=None)), (600,))
# 3. Simbolo senza cerchio, scuro: per fondi carta
save('gg-simbolo-scuro', svg(1000, 660, mark(500, 330, 600, ink=NAVY, ring=NAVY, bg=None)), (600,))


def lockup(name, page, word):
    H = 400
    cap = H * 0.30
    pad = 60
    words = 'GG ON SPORT'
    ww = width(words, cap, 0.03)
    W = int(pad + H + 70 + ww + pad)
    d, _ = text(words, pad + H + 70, H / 2 + cap / 2 + pad, cap, 0.03)
    body = mark(pad + H / 2, pad + H / 2, H / 2) + f'<path d="{d}" fill="{word}"/>'
    save(name, svg(W, H + 2 * pad, body, page), (1600,))


# 4. Logo orizzontale: simbolo + "GG ON SPORT" (Substack, LinkedIn, newsletter, copertine)
lockup('gg-logo-orizzontale', PAPER, NAVY)
lockup('gg-logo-orizzontale-scuro', NAVY, PAPER)
# 5. Banner per le testate (X, LinkedIn, Substack): 1500x500, navy, senza slogan (la frase si decide con le bio)
cap = 110
words = 'GG ON SPORT'
ww = width(words, cap, 0.03)
H = 300
x0 = (1500 - (H + 60 + ww)) / 2
d, _ = text(words, x0 + H + 60, 250 + cap / 2, cap, 0.03)
body = mark(x0 + H / 2, 250, H / 2, bg=BLUE) + f'<path d="{d}" fill="{PAPER}"/>'
save('gg-banner', svg(1500, 500, body, NAVY), (1500,))
print('ok')
