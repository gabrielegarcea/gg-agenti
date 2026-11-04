# Logo GG on Sport

Simbolo: monogramma "GG." (Anton, con punto arancione) dentro l'anello dello stadio, su cerchio navy. Scelto da GG il 4 nov 2026.

- `gg-simbolo` (.svg, -1080.png, -320.png) — avatar di tutti i profili
- `gg-simbolo-chiaro` — senza cerchio, per fondi scuri e foto (reel, copertine)
- `gg-simbolo-scuro` — senza cerchio, per fondi carta
- `gg-logo-orizzontale` / `-scuro` — simbolo + "GG ON SPORT" (Substack, LinkedIn, newsletter)
- `gg-banner` — testata 1500x500 (X, LinkedIn, Substack), senza slogan

Colori: navy `#0B1F3A`, blu `#1F4FD1`, arancio `#FF6A13`, carta `#F4F1EA`. Le lettere sono tracciati: non serve il font.
Per rigenerare: `python3 make_logo.py <anton-latin-400-normal.woff> <cartella>` (fonttools, brotli, cairosvg).
