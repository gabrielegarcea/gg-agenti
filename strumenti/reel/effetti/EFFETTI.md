# Effetti del motore dei reel

Generato da `catalogo.js` (non modificarlo a mano). Idee da Remocn (MIT), riscritte senza dipendenze. Tutti facoltativi: senza questi campi il reel e' identico a prima.

## text (71)
Testo: comparse di righe (`"anim"` su un elemento `text`), titoli dei capitoli (`style.titles` o `titleAnim` sul capitolo), titolo di copertina (`cover.anim`). Opzioni in `"fx":{...}` o sull'elemento (vedi descrizione).

- `letter-rise`: Letters rise into place one after another in a staircase (fx.dir: up, down, hop)
- `fog-rise`: Letters resolve out of a vertical blur streak from the centre outwards
- `type-on`: Typed letter by letter behind an orange caret that blinks and leaves (fx.hot: letters start orange and cool to ink; fx.cps)
- `decode`: Scrambled orange glyphs resolve left to right into the real text
- `font-settle`: Letters start in another typeface (mono, hand, or cycling) and flip one by one into the final face
- `case-flip`: Each glyph flips from lowercase to uppercase and back to its final casing with a squash
- `light-up`: The line appears in grey, then ink sweeps through it letter by letter (highlighted words land in blue)
- `texture-fill`: Letters start as a dot-matrix (or ruled lines) and refresh one by one into solid type (fx.texture: dots, lines)
- `kerning-snap`: Loosely spaced letters snap one by one into tight kerning
- `wave`: A soft wave runs through the letters, lifting them and tinting them orange as it passes
- `shuffle`: Letters start scrambled into each other's places and slide home along small arcs (best on short lines and titles)
- `slot-roll`: Every letter rolls through random glyphs like a slot machine and lands left to right
- `acronym`: Only the initials show (in orange), then each word unfolds letter by letter into the full name, e.g. National Basketball Association
- `mask-up`: Words (fx.unit: words or line) slide up out of an invisible mask with a compact stagger; fx.accel: true speeds the rhythm up
- `blur-in`: Words fade up out of a soft blur (fx.unit: words or line; fx.blur px; fx.weight: true also goes from light to heavy)
- `scale-in`: The line settles from a slightly different scale with a fade (fx.scale start, default 0.9; fx.blur px)
- `slide-in`: Words (or the line) slide in from the left, or from the right with a light blur (fx.dir, fx.unit, fx.indent px per line for stepped lines)
- `speed-in`: The line rides in slanted on speed strips, then snaps upright
- `slam`: Words slam down one at a time from a larger size, with a short shake on each hit
- `feather`: Words drift down swaying like feathers and settle on the line (fx.style: drop for a straight fall with a squash)
- `elastic`: Words land squashed and wide, then spring back to their shape like an elastic variable font
- `outline-fill`: Words appear as outlines, then fill with ink from left to right one by one
- `ellipsis`: Three orange dots pulse where the line will be, then the words resolve out of a blur (fx.wait seconds of dots)
- `block-wipe`: A solid blue block wipes across and pulls away to reveal the text (fx.unit: line or words; fx.color)
- `slit-open`: An orange rule draws across, then the line opens vertically out of it like a film slit
- `echo`: The line focuses in while blue outline copies unfold above and below it and fade away
- `extrude-pop`: The line pops up out of the page on a solid orange 3D body, then sinks back flat (fx.keep px to keep some depth; fx.color)
- `handwrite`: The line is written in the hand font (Caveat) a few letters per stop-motion pose, with a slight wobble while writing (fx.font: false keeps the normal font)
- `box-in`: A flat blue box grows behind the line and the words punch in white (highlighted words in peach)
- `recede`: The line rises in normally, then after fx.hold seconds (default 1.4) dims to grey so the next line stands out (fx.scale to also shrink)
- `lights-out`: Five start lights come on one by one, go out together, and the line slams in (motorsport start)
- `macro-pan`: Starts as a close-up on the first letters, pans across them, then pulls back to the whole line (fx.zoom, default 2.4)
- `mark-marker`: The line rises in, then a peach marker block draws behind the highlighted words (or the last word)
- `mark-underline`: The line rises in, then a hand-drawn orange ink stroke underlines the highlighted words in a few stop-motion poses (fx.color)
- `mark-circle`: The line rises in, then a hand-drawn orange loop circles the highlighted words (fx.color)
- `mark-pill`: The line rises in, then a blue pill fills behind the highlighted words and turns them white (fx.color)
- `mark-color`: The line rises in, then the highlighted words shift colour to orange (fx.color)
- `word-roll`: The highlighted word (or last word) rolls through the alternatives in fx.roll, stopping briefly on each, before landing on the real word
- `strike-swap`: A wrong word (fx.was) is struck through in orange and collapses while the real highlighted word grows in; or fx.cut: [words] are struck and cut out
- `char-rise`: Letters slide up from below one by one, crisp and without blur
- `soft-blur`: Letters fade in one by one with a gentle blur and a small upward drift
- `letter-drop`: Letters fall from above in a staircase; opts.tumble=true makes them tumble and bounce like stacked blocks
- `squeeze-in`: Characters appear one by one, then the whole line squeezes as the last one lands
- `tracking-in`: Wide letter-spacing collapses to normal with a springy settle while a light blur clears
- `stretch-in`: Letters fly in from the right and smear horizontally on the way, then snap to shape
- `crest`: A wave travels across the line raising each letter as it appears, then the highlighted word swells once
- `color-sweep`: Muted text brightens as an orange front sweeps across it; opts.by="words" for word by word, opts.flash=false for no orange
- `word-rise`: Words slide up and fade in one after another like a wave
- `word-pop`: Words pop in one by one with a soft spring overshoot
- `word-drop`: Words drop in from above and land with a small overshoot
- `word-push`: The line glides in from the side while its words fade in one by one; opts.dir="left" to come from the left
- `punch-in`: Words slam in one by one from big to final size with a short shake; opts.flash=true adds an orange flash behind each hit
- `turn-up`: Words arrive turned on their side like book spines, then swing upright into one line
- `capsule`: Each word rides in on a stretchy capsule (ink, blue for highlighted words) that then melts away
- `key-slow`: Plain words land fast, then time slows on the highlighted word (*x*), which grows in and cools from orange to blue
- `line-rise`: The whole line rises out of an invisible mask under its baseline
- `crop-in`: The line opens from a tight crop and settles down from a slight zoom, like a poster being framed
- `squeeze-out`: The line starts condensed and springs out to its full width; opts.axis="y" squashes the height instead
- `settle`: A restrained premium entrance: the line fades in while settling down from a slight zoom; opts.zoom sets the start scale (default 1.06)
- `pullback`: The camera starts tight on the highlighted word (or the first word) and pulls back to reveal the whole line; opts.zoom (default 1.6)
- `typewriter`: Typed character by character with an orange caret that blinks and then disappears; opts.by="words" types word by word
- `rgb-split`: A brief chromatic split: blue and orange copies jitter around the line for a few frames, then lock onto it
- `wipe`: A bar wipes the line into view; opts.wipe = block (default) | slash | line | doors | torn | stripes, opts.wipeColor = ink | orange | blue
- `bands`: The line is cut into bands that slide together from alternating sides and lock; opts.bands (default 6), opts.dir="v" for vertical slices
- `repeater`: Outlined blue copies unfold above the line like a repeater, breathe, then fold back into it
- `outline-trace`: The line is first traced as an outline from left to right, then the solid fill wipes up inside it and the outline fades
- `period-drop`: Words rise, then an orange dot falls from above, bounces with squash and stretch and settles as the full stop (opts.dot=true adds one if missing)
- `tittle-drop`: Letters rise, then the dots of every i drop in last with a little bounce (titles in caps just rise)
- `path-settle`: Letters start scattered along a loose curved path and straighten onto a clean baseline; opts.messy=true scatters them at random and slides a ruler under the line
- `pulse-underline`: The line rises while an orange pulse line draws beneath it and flattens into a straight underline that stays; opts.wave = beat (default) | sine
- `lead-flip`: The line rises, then its first word flips over into another word in blue (opts.flip, default "You")

## num (21)
Numero gigante: `"anim"` su un elemento `bignum`.

- `odometer`: digits roll on reels and land left to right; e.mode "reel" (default: each digit spins to its value) or "carry" (true odometer: low digits spin, high ones tick over on the carry); e.dur (1.4)
- `slot`: every digit spins like a slot reel, then they lock one by one left to right with a small bounce; e.stagger (0.12 s)
- `scramble`: digits flicker through random values (gray) and lock into place (brand color) one by one; e.order "left" (default) or "random"
- `flip`: flip-clock digits: each digit flips through the values up to its own, with a hinge line that disappears at the end
- `steps`: hard cuts through a few values with a punch on every cut (no smooth count); e.steps (6), e.every (step size, e.g. 1 for a shot clock 24 to 0), e.tick (s per step when e.every), e.bpm (cuts on the beat), e.dur (1.2)
- `lean`: the figure counts in three surges; every surge leans it forward and it snaps back upright
- `push`: the figure grows one digit at a time (4, 48, 482, 4,821, 48,216) and the camera pulls back at every push
- `diminuendo`: counts up while each trailing digit group is set quieter than the one before (1, 0.62, 0.42...): the eye reads the big part first
- `thin`: the figure arrives heavy (thick outline) and slims down to its normal weight while it counts
- `tall`: a tall squeezed figure opens to full width and settles while counting; e.mode "open" (default) or "stretch" (the strokes shoot up tall and spring back)
- `fill`: the figure appears as an outline and fills with ink; e.mode "rise" (wavy level, default), "sweep" (left to right), "stripes" (vertical stripes), "hatch" (pen hatching in passes), "draw" (outline drawn first, then filled); e.count to count while filling
- `pixel`: the figure is built from pixels on a canvas, then turns crisp; e.mode "res" (coarse blocks to sharp, default), "paint" (tiles painted by a scan line, orange then blue), "halftone" (dots that swell into the figure), "mosaic" (a field of ticking digits where the figure lights up), "weave" (row by row like a loom)
- `slices`: the figure is cut in horizontal slices that slide in from alternating sides and lock into one piece; e.n slices (7)
- `flash`: a fast count that lands with a camera-flash pop; e.bar draws an orange bar under the figure at the flash (lap-time freeze)
- `sticker`: sticker-style figure: while it counts, a new outline ring (paper, orange, paper, ink) is stacked around it every time it crosses a power of ten
- `compact`: counts up the long form (2,400,000) then retracts into the compact figure (2.4M) with the unit letter popping in; uses e.full or derives it from suffix K/M/B/bn
- `roman`: only for edition numbers up to 3999 (above that it counts normally): counts in Roman numerals with hard cuts (editions: Super Bowl LX, Olympiad XXXIII) and lands on the Roman form of e.to; prefix and suffix kept
- `turn`: the figure counts, then its unit sign (x, +, %, $) turns into place and the figure swells once; an x arrives as a plus that turns 45 degrees
- `focus`: four orange viewfinder brackets fly in and snap tight around the figure while it counts; e.tag adds a small mono chip beside it
- `ruler`: the figure counts above a ruler of ticks while an orange marker slides along it (e.mode "slide", default) or the ticks scrub under a fixed marker ("scrub"); ends show e.from and e.to
- `strike`: the old value (e.from) is struck through in orange and set aside small and gray, while the new value (e.to) spins in on digit reels

## els (60)
Elementi nuovi: `{"type": "<nome>", ...}` dentro `els`. Quelli marcati GRAFICO contano come grafico (uno per tipo per reel). Con `items` ogni voce compare sul suo marker.

- `arrow`: Hand-drawn arrow that draws itself in stop-motion poses, with an optional handwritten label. Fields: label, from [x,y], to [x,y], h, bend, tint, dur
- `scribble`: A line of text whose *highlighted* word gets a hand-drawn mark. Fields: text, mark (circle|underline|box|strike), size, tint
- `stamp`: A rubber stamp that slams onto the page with worn ink and a small shake. Fields: text, sub, rot, tint
- `callout`: Technical-drawing dimension: extension ticks, a dimension line with arrowheads that extends from the centre, the measure on it and a caption. Fields: value, text, w (0-1)
- `progress`: Progress bar on a ruler that fills to a value, counting up, with a stroke burst on arrival. Fields: label, value, max, display, suffix, hi, dur
- `led`: Dot-matrix LED sign (5x7 font): each line scrolls in and stops readable; *highlighted* words light up orange. Fields: text, speed
- `venn`: Two labelled circles slide together; the overlap fills orange with its own label, then a caption lands. Fields: a, b, mid, caption
- `orbit`: A centre disc with satellites that join one per marker: spokes draw in, pulses travel along them, chords link neighbours. Fields: center, items [{label}], highlight, caption
- `iso-bars`: Isometric block chart: one block per marker springs up to its value, the highlighted tower in orange. Fields: items [{label, value, display}], highlight, max, caption
- `frieze`: Decorative band that builds itself: Bauhaus shapes tumbling in, quarter-disc tiles, or a Mondrian split. Fields: style (bauhaus|tiles|mondrian), h
- `squiggle`: Divider line that draws itself while its wave swims forward, then calms to a gentle ripple. Fields: w (0-1), tint, label
- `rings` GRAFICO: Concentric progress rings (max 3) that lap toward their goal, legend values counting beside them. items:[{label,value (0-100),display}]
- `circles` GRAFICO: Discs whose AREA is proportional to the value, side by side (layout "side", default) or nested on one baseline ("nested"); optional big stat. items:[{label,value,display}], layout, stat, highlight
- `balance` GRAFICO: A seesaw: the first item lands and tips the beam, the second lands and the beam swings to the heavier side. items:[{label,value,display}] (2 items)
- `race` GRAFICO: Lanes race on one shared clock: each runner reaches the line in proportion to its time (lower value = faster, e.higher for "more is faster"); the winner lands first in orange; optional stat. items:[{label,value,display}], stat, dur (race seconds, 1.4)
- `columns` GRAFICO: Vertical columns: mode "spring" (overshoot, default), "pixel" (LED cells light up), "iso" (3D blocks rising like a skyline), "log" (rescales to a log axis after the last column so small values become visible); target draws a dashed goal line that the highlight can break through. items:[{label,value,display}], highlight, max, target:{value,label}, mode
- `tree` GRAFICO: A tree that branches level by level from one root into many nodes (e.g. 1 club, 4 academies, 40 coaches), then lands the leaf count. items:[{n,label}] (one per level, n up to 40), display, label
- `bubbles` GRAFICO: Packed bubbles sized by value grow in one by one around the biggest (highlighted) one. items:[{label,value,display}], highlight (default the biggest)
- `calendar` GRAFICO: A month calendar draws itself, tagged days get a dot and a line below (fixtures, deadlines), the key day is ringed in orange. month (1-12), year, items:[{day,label}], highlight (day)
- `candles` GRAFICO: Candlesticks (blue up, orange down) build left to right and rally past the prior high, then a tag and a price land. values:[closing prices, 8-24], prev (prior high), tag (default ALL-TIME HIGH), display, label, dur
- `divide` GRAFICO: Dots split by cell division 1, 2, 4... up to n (power of two, max 128) with the count beside; e.reverse runs it backwards (a knockout: 64 teams to 1). n, reverse, label, dur
- `heatmap` GRAFICO: A calendar-style pixel heatmap fills in on a diagonal sweep (blue intensity levels), then a total lands. cols (26), rows (7), values (optional array 0-1, cols*rows, column by column), display, label
- `peak` GRAFICO: A dot plot appears, then orange crosshair lines slide in and lock on the peak with a ring and a callout. points:[values, 8-30], display (callout), x0, x1 (axis ends), label
- `curve-shift` GRAFICO: A distribution curve (first item, kept as a dashed ghost) morphs into the second one; the new average is marked. items:[{label,mean,sd}] (2 items), min, max, display (marker text)
- `ridgeline` GRAFICO: Stacked ridgeline distributions, one per row (seasons, years), drawn one by one; the highlighted row (default the last) is filled blue. items:[{label,mean,sd}], min, max, highlight, unit
- `dot-map` GRAFICO: A dotted world map sweeps in west to east, then cities light up one by one in orange while a counter rises. items:[{label,lon,lat}], value (final count), display, label, bbox:[lonW,latS,lonE,latN] to zoom on a region
- `dot-sort` GRAFICO: 100 mixed gray dots; group by group they take their color and fly into sorted rows, with a legend line per group. items:[{label,value (percent)}], highlight
- `dumbbell` GRAFICO: One row per item: the "before" dot appears, then the "after" dot slides away from it along the axis, stretching the bar between them. items:[{label,a,b,da,db}], min, max, aLabel, bLabel, highlight
- `growth` GRAFICO: A smooth growth curve draws through milestones; every milestone gets a dot and its figure, the last one in orange. items:[{label,value,display}], log (true for exponential data)
- `fraction` GRAFICO: One bar splits into halves, quarters, eighths (or straight into n parts), then the "hi" parts fill orange under a headline like "1 in 8". of (parts, 8), hi (filled, 1), display, label
- `waffle` GRAFICO: A 10x10 grid of cells (square, dot or hex) fills group by group, legend on the right with each share. items:[{label,value (cells out of 100),display}], shape ("square"|"dot"|"hex"), highlight
- `rank` GRAFICO: A ranked table (final order, top first) appears row by row with the hero row at its starting rank, then the hero climbs, swapping places one row at a time, to its final rank. items:[{label,value,display}] (final order, max 8), hero (index in items, default 0), from (starting rank, default last)
- `breakdown` GRAFICO: A big total splits down a bracket into one bar per part, each with its own figure (revenue into matchday, broadcast, commercial). total:{display,label}, items:[{label,value,display}]
- `waterfall` GRAFICO: A waterfall: each item is a gain (blue) or a loss (orange) floating from the running total, then the total column lands in ink. items:[{label,value (+/-),display}], total:{label,display}
- `quadrant` GRAFICO: A quadrant plot: competitors drop in as ink dots, the hero lands in orange with a ring in its corner. items:[{label,x,y}] (0-1, or any scale with xmax/ymax), hero (index), xLabel, yLabel, q:[top-left,top-right,bottom-left,bottom-right] corner names
- `radar` GRAFICO: A radar chart: the rival outline (gray, dashed) is there from the start, the hero polygon (blue) grows axis by axis over it. items:[{label,a (hero),b (rival)}] (3-8 axes), max, aName, bName
- `radial-bars` GRAFICO: Bars around a dial sweep up one after another to a peak (orange) while the center figure counts. values:[numbers, 8-36] (e.g. goals per 5-minute slot), display (center), label, ticks (optional labels at quarters)
- `sankey` GRAFICO: Flows from several sources (left) pour one by one into one target block (right) that ends on the total. items:[{label,value,display}], total:{display,label}
- `share-donut` GRAFICO: A donut of several shares sweeping in one by one (the highlight in orange, its figure in the center), legend beside it. items:[{label,value (percent),display}], highlight
- `slope` GRAFICO: A slope chart: each line joins a "before" value (left) to an "after" value (right), drawn one by one; the hero line is thick and orange. items:[{label,a,b,da,db}], hero (index), aLabel, bLabel
- `stack-shift` GRAFICO: One 100% stacked bar morphs from year to year (each item is a year) while the year cuts in above it; the highlighted series is orange, the legend shows the current shares. series:[names], items:[{label (year),values:[one per series]}], highlight (series index)
- `treemap` GRAFICO: A treemap: tiles sized by value drop in one by one, the highlight (default the biggest) in orange. items:[{label,value,display}], highlight
- `measure` GRAFICO: Two (or three) slabs measured with technical-drawing dimension lines: each slab grows with its dimension line and figure; optional stat lands below (e.g. "14x faster"). items:[{label,value,display}], stat, highlight (default last)
- `gauge` GRAFICO: A half-dial gauge: segments light up to the value, the needle swings and locks with a small overshoot, the figure counts in the middle; optional marker for last year. value, min (0), max (100), display, label, marker, markerLabel
- `meter` GRAFICO: A segmented bar fills cell by cell to the value (like an XP bar), with an optional marker (last year, target) and a delta chip next to the figure. value, max, display, label, marker, markerLabel, delta, segments (20)
- `versus` GRAFICO: A diagonal split header (A in ink, B in orange, VS in the seam) then stat rows slide in from both sides; the better side of each row is set bold in its color. a:{name}, b:{name}, items:[{label,a,b,da,db,low (true if lower is better)}]
- `form-strip` GRAFICO: A season strip: one tick per match (W blue tall, D gray, L orange short) sweeps in, the longest winning run gets a bracket and a chip ("12 IN A ROW"), then the figure lands. results ("WWDLW..."), display, label, streakLabel
- `clock` GRAFICO: A match clock (90 minutes by default, or 60): the hand sweeps from "from" to "to" painting an orange wedge (e.g. goals after the 75th minute), figure and caption beside it. from, to, max (90), display, label
- `index-list`: Numbered list drawn row by row (items: [{text}]), then a peach band travels down to the highlighted row (highlight, default last; start = first number)
- `marquee`: Endless horizontal strip of condensed caps (text; color: ink, orange, blue, paper; speed px/s; text2 adds a second strip running the other way)
- `swap`: A sentence with one slot whose word changes at each marker (lead + slot + tail). Fields: lead, tail, first (word shown before the first change), items [{w, gloss}], mode = slide | flip | reel | cross | zoom | strike | select | cut | wipe | stretch | press | track, dir="down" (slide), keep=true (strike keeps the struck word), lock=true (fixed slot width), size, dur
- `blanks`: A one-line pitch with underlined blanks and small labels; each blank fills with its word at its marker. Fields: line (use {} for each blank), items [{w, label}], size
- `dim-list`: A column of claims arrives one per marker, then all but one dim away and the survivor gets a marker swipe. Fields: items [{text}], keep (index, default last), dimAt (marker id, optional), size
- `stamp-list`: A list of stamped lines (day, time, hinge phrase or clue number + text), one per marker. Fields: items [{k, text, tone: low|hi}] (low = the snag drops and dims, hi = lights up in blue), layout = row (default) | stack, kw (label column width px)
- `steps`: Numbered steps along a vertical rail: at each marker an orange dot travels to the next numeral, which lights up blue with its title and detail. Fields: items [{title, detail}] (2-4)
- `qa`: Short questions arrive one per marker and each is answered by the same bold orange tag that pops in beside it. Fields: items [{q}], tag (default "Yes")
- `walkout`: A fighter-style name card: kicker, name lines that slam in one by one with a shake, then an ink band (record, stat) and a handwritten nickname. Fields: kicker, lines ["NAME", "*SURNAME*"], band, nick
- `dict`: A dictionary entry: headword and pronunciation, then one sense per marker (earlier senses dim, e.g. noun then verb), then an example line. Fields: word, pron, items [{pos, def}], example
- `fact-table`: A headline, then a what / when / where table that builds one ruled row per marker. Fields: title, items [{k, v}], hi (index of the row in orange)
- `quote`: A big pull quote: optional question above (overheard), the quote rising word by word with *highlighted* words on a soft marker, then the attribution with an orange rule. Fields: text, who, role, ask

## enter (39)
Entrata di un elemento intero: `"enter": "<nome>"` su qualsiasi elemento (per i `logos`, ogni logo entra sul suo marker).

- `wipe`: Scanner wipe: a bar sweeps across and reveals the element behind it (dir: right|left|down|up)
- `blocks`: Mosaic reveal in square blocks (order: random|rows bricks dropping from the bottom|diag; size px)
- `shutter`: Stripes slide open one after another like cut panels (n stripes, dir: h|v, alt: alternate sides)
- `glitch`: Short broadcast-glitch entrance: flicker, sliced bands and a blue/orange channel split that resolve clean
- `tv-on`: Tube switch-on: a thin bright line opens horizontally, then springs open vertically into the picture
- `halftone`: The element prints in as a halftone dot screen whose dots swell until they merge (size px)
- `riso`: Risograph entrance: an orange plate slides in off-register and settles behind the element (keep: leave a hair of misregistration)
- `ripple`: The element surfaces through moving water: a refraction ripple that calms to flat (mode: water|flutes for fluted glass)
- `boil`: Stop-motion entrance: the element pops on twos with hand-placed jitter and a boiling outline, then settles (hold: keep a slight paper wobble)
- `frost`: Frosted glass clears outward from the centre: blur and veil lift to a sharp element
- `shadow`: Flat pop-in that casts a long shadow; the light swings and the shadow sweeps round, then retracts
- `speed`: Speed-line entrance: the element shoots in trailing streaks and lands with a squash (mode: slide|impact for radial manga lines; dir: left|right)
- `burst`: Pop-in punctuated by short strokes shooting out and vanishing in flight (mode: strokes|confetti; ox, oy origin 0-1)
- `slam`: Slams in from 1.5x with a short shake and an impact ring; banner:true slices an orange band in behind first
- `flicker`: Flickers on like a neon tube (stutter, one drop-out, hold); mode:"beat" blinks in a fixed rhythm with small jumps instead
- `bounce`: Drops from above and bounces with squash on each hit; for logos a line underneath dents under the impact (dent:false to hide it)
- `brackets`: Two orange brackets open from the centre and close around the logo or element; they stay on a single logo, fade on rows and elements (keep:true/false)
- `lockup`: Logos glide in together from the right and lock with an orange × between them: club × sponsor, club × club
- `pixel`: Logos resolve from coarse pixels to sharp (style:"dots" = LED dot matrix); other elements are rebuilt from random pixel blocks
- `cells`: A diagonal wave of blue rounded cells sweeps across and leaves the logo or element behind
- `logo-ripple`: Dots ripple outward from the centre with two rings and light the logo or element up
- `morph`: The badge cuts through shapes and colours on the beat (diamond, square, squircle) and lands as the round logo; elements open through morphing masks
- `sweep`: An orange bar of light sweeps left to right and reveals the logo or element as it passes, with a warm trail
- `flare`: A point stretches into a horizontal orange line that opens up into the logo or element; noise:true starts it as a noisy scope trace that calms down
- `flip`: Logos spin in like a tossed coin (axis:"x" flips them like a split-flap); elements flip down from the top edge
- `flood`: A blue disc floods out behind the logo and drains away as it pops in; elements get a blue panel that wipes across and off
- `zoom`: Starts giant and faint and settles to size on a spring (logos grow only to the right, inside the column); elements settle from 0.86
- `inflate`: A flat sliver puffs up like a balloon, overshoots and wobbles into shape
- `bloom`: A drop of ink falls and blooms outward in an uneven blob that reveals the logo or element
- `liquid`: A drop falls into the empty outline and the logo or element fills up from the bottom with a sloshing surface
- `trace`: An orange pen traces the outline (ring for logos, frame for elements) and the content inks in; guides:true first draws blueprint construction lines
- `orbit`: Three brand-colour moons ride shrinking tilted orbits into the centre, a ring flashes and the logo or element springs into place
- `route`: A dotted path flies a paper plane from stop to stop and each logo pops in as it lands (a career or transfer route); line:"metro" draws a solid transit line with stations instead
- `gather`: Scattered and tilted, the logos or the element fly together into place on a spring
- `puzzle`: The logo arrives as four spinning pieces that snap together with sparks; elements fly in tilted and snap
- `snap`: The two halves of the logo slam together at a seam with a click; elements open from a centre seam with a flash and a shake
- `spell`: Logos drop in one at a time with dashes between them, then the row closes up and an orange line draws beneath; elements drop in and get the line
- `spotlight`: The row or element sits in the dark while a spotlight searches, overshoots and lands on each logo in turn, then the house lights come up
- `unfold`: A tight paper zigzag unfolds sideways into the flat logo or element, pleat shading fading as it opens

## trans (36)
Transizioni fra capitoli: `style.transition` per tutto il reel, `"transition"` sul capitolo per quello che entra.

- `whip`: Whip pan sideways: the camera snaps away with motion blur and speed lines, the next chapter flies in from the other side
- `whip-up`: Whip pan upwards: the camera snaps away with motion blur and speed lines, the next chapter flies in from the other side
- `push`: Push-through: dolly into the outgoing chapter until it blurs away, the next one comes up from the depth and settles
- `focus`: Rack focus: the chapter breathes out of focus and brightens into paper, the next one sharpens back in
- `lens-punch`: Lens punch-in: a hard cut hidden in a fast zoom with camera shake and a brief blue/orange colour split
- `slide`: Slide swap: the chapter is shoved off to the left and the next one springs in from the right
- `settle`: Spring settle: the chapter shrinks away as one block, the stage stays empty for a beat, the next drops in from above and lands with a spring
- `page-turn`: Page turn: the chapter lifts away like a notebook page in stop-motion poses, the next page drops into place the same way
- `diagonal`: Diagonal split: a slanted seam with an orange edge slides across, pushing the chapter out and then revealing the next one behind it
- `card-swipe`: Card swipe: a tilted navy card with an orange frame swipes across, covers the chapter and carries on to reveal the next
- `iris-dot`: Cartoon iris: a navy iris closes onto the chapter, lingers as a small dot, snaps shut and opens on the next one
- `rings`: Ring burst: concentric peach, orange, blue and navy discs burst from the centre; the next chapter opens out of the last ring with an orange rim
- `shape-cut`: Shape cut: an orange rounded square spins and swells to cover the chapter, then shrinks into a small mark next to the new chapter label
- `blinds`: Venetian blinds: the chapter splits into horizontal slats that turn edge-on in a staggered ripple; the next one turns back in
- `bands`: Band shift: eight horizontal navy, blue and orange bands slide across in a stagger, alternating sides, and swap the chapters
- `columns`: Column slide: six vertical columns drop and rise in alternation, staggered, to swap the chapters
- `bars`: Colour bars: slanted bars of different widths in the brand colours whip across the frame and swap the chapters
- `tiles`: Tile wave: a diagonal wave grows a grid of navy tiles over the chapter and shrinks them away on the next one
- `dots`: Halftone cut: a diagonal wave of blue and orange halftone dots swells over the chapter and shrinks away on the next one
- `dither`: Dither dissolve: a field of square navy and blue pixels (ordered dither) eats the chapter and then thins out onto the next one
- `burn`: Burn: a ragged noise front with an orange ember edge burns the chapter to navy from the bottom up, then burns the navy away onto the next one
- `ascii`: Data dissolve: a field of navy cells carrying mono digits and symbols spreads over the chapter and drifts away on the next one
- `melt`: Melt: navy columns drip down over the chapter at different speeds, then slide down column by column to drop the next one in
- `scatter`: Shape scatter: a field of circles, squares, triangles and plus signs in the brand colours swells over the cut and scatters away
- `wash`: Warm wash: soft peach blots drift across the frame and blow out to plain paper at the cut, then cool off on the next chapter
- `slit`: Hairline: the chapter collapses into an orange hairline across the frame, which then opens like a slit onto the next chapter
- `caret`: Caret wipe: a blue text caret sweeps across, wiping the chapter away behind it and then typing the next one into view
- `tear`: Paper tear: the chapter rips down the middle with fibrous paper edges and both halves fling apart over navy; the navy then tears open onto the next one
- `doors`: Gate: two navy doors with orange edges slam shut, their giant letters meeting as GG, then swing open onto the next chapter
- `stinger`: Broadcast stinger: three slanted slabs, orange, blue and navy, sweep in one after the other like a replay wipe and peel off onto the next chapter
- `strobe`: Strobe: a quick flicker of solid navy, orange and blue frames between the two chapters, landing clean on the next one
- `speed-lines`: Speed lines: radial streaks stretch from the centre while the camera dives into the chapter, a paper flash, then the next one lands
- `swirl`: Pinwheel swirl: a navy and blue pinwheel spins open from the centre to cover the chapter, then a hole widens in its middle onto the next one
- `wave`: Wave wipe: a navy wave with a blue crest rolls up over the chapter and carries on upwards to uncover the next one
- `cloth`: Cloth: a navy sheet drops over the chapter with a fluttering hem, then is yanked away from the bottom-right corner, folding over to show its blue back
- `glitch`: Glitch cut: the frame tears into displaced horizontal slices with a blue/orange split and blocky artefacts, and snaps back on the next chapter

## cam (7)
Camera sul capitolo: `style.camera` o `"camera"` sul capitolo.

- `dolly`: Slow dolly-in on the chapter (about 3%), anchored top-left so the column never crosses the safe margins
- `parallax`: Parallax drift: label, title, subtitle and content slide at different speeds as the camera trucks slowly, for a sense of depth
- `slam`: Impact: the chapter slams down from above with a squash, a damped camera jolt and a two-frame colour split
- `pile`: Gravity pile: label, title, subtitle and content drop in one after the other and bounce as they land
- `assemble`: Exploded view: the chapter parts start spread apart and offset, then spring together and click into place
- `orbit`: Turntable: the chapter swings in on a vertical hinge with perspective, then keeps a slow gentle sway
- `depth`: Depth push: the chapter parts arrive from slightly in front of the camera in layers, like a dolly through cut paper sheets

## bg (19)
Sfondo animato discreto: `style.bg` (uno per reel), opzioni in `style.bgOpts` (`o` intensita' 0-1, `mode`, `tint`, `speed`, `seed`).

- `flow`: Fine particle trails riding a slowly changing flow field (mode: trails|dots)
- `topo`: Breathing topographic contour lines with index contours and one accent line
- `strata`: Fine horizontal layers displaced by noise, each drifting at its own depth (mode: strata|waves)
- `weave`: Woven warp and weft threads crossing over and under on a gently warped grid
- `truchet`: Quarter-circle tiles snap a quarter turn as a wave crosses the grid, rewiring the lines
- `life`: Conway's Game of Life on a faint lattice: newborn cells flash in the accent, dying ones shrink
- `grid`: Drafting grid that drifts slowly with crosshair marks (mode: blueprint|floor|iso)
- `orbit`: Concentric dotted rings rotating into alignment (mode: orbit|phyllo|tunnel|ripple)
- `pendulum`: A row of tuned pendulums drifting from a line into travelling waves and back
- `strings`: Threads strung around a ring of pins as a times table, morphing from cardioid to nephroid and beyond
- `swirl`: Soft spiral bands turning around a point, or slow light rays from an off-screen source (mode: spiral|rays|sunburst)
- `wash`: Very soft drifting colour fields in brand inks, with optional film grain (mode: mesh|warp|blobs|smoke|panels; palette: brand|blue|warm|ink)
- `caustics`: Rippling caustic filaments of refracted light, or a slowly morphing neural-web noise (mode: caustics|water|neuro)
- `voronoi`: Voronoi cells shifting and re-tessellating, drawn as fine edges with a few tinted cells
- `dither`: Ordered (Bayer) dithering over a slowly moving gradient field, crisp square pixels
- `halftone`: Rotated halftone dot screen whose dots swell with a drifting tone; plates: 2 adds an off-register accent plate
- `ascii`: A faint field of monospaced characters whose density follows a drifting noise
- `border`: A thin frame around the edges that pulses, with an accent segment running along it; optional vignette
- `grain`: Film grain over the paper, re-rolled 12 times a second; lines: true adds faint scanlines and a slow tape band

## kar (24)
Stile dei sottotitoli: `style.kar`.

- `pop`: The spoken word turns orange and springs up in scale, then settles as the voice moves on
- `weight`: The spoken word swells from a light to a heavy weight and relaxes after, with no layout shift
- `blur-in`: Each word resolves out of a soft blur the moment it is spoken
- `bounce-in`: Each word springs up into place with a little overshoot as it is spoken; the phrase builds word by word
- `drop`: Each word falls into place from above with a tilt and a bounce; the phrase drops out if the speaker pauses
- `rise`: Each word slides up out of a mask at its baseline as it is spoken, no bounce, no scale
- `slice`: Each word arrives cut in two, top half from the left and bottom half from the right, locking as it is spoken
- `karaoke`: The whole phrase is readable in grey and each word fills with ink left to right exactly as it is spoken
- `box`: A solid blue box slides behind the word being spoken, travelling from word to word
- `underline`: An orange bar slides under the word being spoken, travelling from word to word; the text stays still
- `marker`: Highlighted words (*word* in say) get a highlighter swipe at the pace they are spoken
- `stamp`: Highlighted words (*word* in say) slam down as an orange rubber stamp the moment they are spoken
- `redact`: The phrase starts blacked out like a declassified file and each bar pulls away as its word is spoken
- `scramble`: Each word arrives as random letters when spoken and decodes left to right into the real word
- `typewriter`: Monospaced: each word types out letter by letter at the pace it is spoken, with an orange caret that blinks in pauses
- `handwrite`: Words are inked in by hand (Caveat) left to right at the pace they are spoken, each at its own slight angle
- `label-maker`: Each word is punched letter by letter into a strip of blue embossing tape (orange for highlighted words) as it is spoken
- `split-flap`: Every letter sits on its own dark flap tile and clatters through a few characters before landing as the word is spoken, like a departure board
- `cube`: Each new phrase turns into view as the next face of a cube, hinged on a horizontal axis
- `slot`: Each new phrase rolls up into place from below, like a slot machine reel
- `outline`: Words wait as hollow outlines, the spoken word fills orange and said words fill ink
- `plate`: Broadcast subtitles on a navy plate; words wait faint and punch out in paper colour as they are spoken, highlighted words in orange
- `prosody`: Word size follows the delivery: drawn-out words land larger, rushed words smaller; each rises in as spoken (kept to two lines)
- `word-pop`: One big Anton word at a time, each popping in on a spring as it is spoken (highlighted words in orange)
