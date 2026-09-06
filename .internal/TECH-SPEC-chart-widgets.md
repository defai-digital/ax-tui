# Tech Spec: ax-tui chart package

Status: implementation blueprint (2026-09-05)
Reference: ratatui v0.30.2 (`ratatui-widgets/src/{chart,canvas,sparkline,gauge,barchart}.rs`,
`ratatui-core/src/symbols/*`). All algorithms below are faithful ports unless
listed in "Deviations".
Related: `.internal/PRD-chart-widgets.md`, `.internal/ADR-0001-chart-widgets-package.md`

## 1. Module map

```
chart/
  src/
    symbols.ts     glyph tables (no imports)
    cells.ts       Cell model, merge, cellsToFrame (no imports)
    grid.ts        Grid interface, CharGrid, BrailleGrid, layers (imports cells, symbols)
    painter.ts     world->pixel mapping, Cohen-Sutherland clip, Bresenham (imports grid)
    sparkline.ts   SparklineOptions + layoutSparkline (imports symbols, cells)
    gauge.ts       GaugeOptions + layoutGauge (imports symbols, cells)
    barchart.ts    BarChartOptions + layoutBarChart (imports symbols, cells)
    chart.ts       ChartOptions + layoutChart: axis/plot/legend stages
                   (imports symbols, cells, grid, painter)
    types.ts       shared types (Marker, GraphType, Dataset, AxisOptions);
                   type-only import of ColorInput from "ax-tui"
    renderables.ts SparklineRenderable, GaugeRenderable, BarChartRenderable,
                   ChartRenderable (runtime imports: "ax-tui" + layout modules)
    index.ts       public exports (renderables, layout fns, grids, symbols, types)
    solid.ts       extend({ sparkline, gauge, barchart, chart }) + module augmentation
  tsconfig.json        (mirror spinner: strict, NodeNext, verbatimModuleSyntax, noEmit)
  tsconfig.build.json  (mirror spinner: emit to dist/, declaration)
  README.md
```

Pure modules (`symbols`, `cells`, `grid`, `painter`, `sparkline`, `gauge`,
`barchart`, `chart`) have no runtime dependency on `ax-tui`; unit tests import
them directly. Only `renderables.ts` and `solid.ts` touch the framework at
runtime.

## 2. symbols.ts

```
BAR_LEVELS   = ["▁","▂","▃","▄","▅","▆","▇","█"]   // one_eighth..full (bottom-aligned)
BAR_EMPTY    = " "
BLOCK_EIGHTHS = ["▏","▎","▍","▌","▋","▊","▉","█"]  // left-aligned vertical partials (gauge unicode)
LINE_HORIZONTAL = "─"  LINE_VERTICAL = "│"  LINE_BOTTOM_LEFT = "└"
LEGEND corners/edges: "┌","┐","└","┘","─","│"
DOT = "•"
BRAILLE_BASE = 0x2800
```

`symbolForHeight(ticks)`: `ticks <= 0 -> BAR_EMPTY`; `1..8 -> BAR_LEVELS[ticks-1]`;
`>= 8 -> "█"`.

## 3. cells.ts

```ts
interface Cell { x: number; y: number; char: string; fg?: ColorInput; bg?: ColorInput }
```

- `mergeCell(target, source)`: attribute-level override — `char` always
  replaces; `fg`/`bg` replace only when defined on source (ratatui LayerCell
  semantics: symbol/fg/bg independently overridable).
- `cellsToFrame(cells, width, height, fill = " ")`: string[] rows for
  deterministic assertions.

Widget layout functions return `Cell[]` in paint order (later entries win).

## 4. grid.ts + painter.ts

### Grid (port of ratatui `Grid` trait)

```ts
interface Grid {
  readonly cellWidth: number; readonly cellHeight: number
  resolution(): { x: number; y: number }        // pixel dims = cells * per-cell res
  paint(px: number, py: number, color: ColorInput): void   // out-of-range: silent no-op
  save(): LayerCell[]                            // {x,y (cell coords), symbol?, fg?, bg?}
}
```

- `CharGrid(cellW, cellH, char, paintBg: boolean)` — resolution (cellW, cellH)
  i.e. 1x1 per cell. Used by `dot` (char "•", fg only) and `block` (char "█",
  fg AND bg = color, per ratatui Block marker). Last-write-wins color.
- `BrailleGrid(cellW, cellH)` — resolution (2*cellW, 4*cellH).
  - Bit layout: the Unicode braille dot numbering, stored directly —
    `bit = (py % 4 === 3) ? 6 + (px % 2) : (px % 2) * 3 + (py % 4)`.
    ratatui v0.30 stores row-major bits in `PatternGrid` and translates them
    through its 256-entry `symbols::braille::BRAILLE` lookup table; storing
    the Unicode pattern directly renders the identical characters.
  - Cell index: `(floor(py/4) * cellW) + floor(px/2)`.
  - `pattern: Uint8Array`, `color: (ColorInput|undefined)[]`.
  - `save()`: pattern === 0 -> no cell; else
    `symbol = String.fromCodePoint(BRAILLE_BASE + pattern)`, `fg = color`
    (single fg per cell; collisions last-write-wins — documented, tested).

### Painter (port of `Painter::get_point`)

```
getPoint(wx, wy, bounds{x:[l,r], y:[b,t]}, resolution):
  if wx < l || wx > r || wy < b || wy > t -> null
  w = r - l; h = t - b
  if w <= 0 || h <= 0 -> null                    // reversed/degenerate bounds
  px = round((wx - l) * (resolution.x - 1) / w)
  py = round((t - wy) * (resolution.y - 1) / h)  // y flip: world up, pixels down
  return {px, py}
```

Non-finite inputs -> null (guard before math).

### Line drawing (port of canvas/line.rs)

1. **Cohen-Sutherland clip** of the world-space segment against
   `[l, r] x [b, t]`; fully outside -> skip; partial -> clip endpoints.
2. Project both endpoints with `getPoint`.
3. **Integer Bresenham** over pixel space (standard two-octant variant with
   axis-aligned fast paths); paint every pixel.

No floating-point interpolation between data points (ratatui parity: project
endpoints, then rasterize).

## 5. sparkline.ts (port of sparkline.rs)

Options: `data: readonly (number | null | undefined)[]`, `max?: number`,
`direction?: "ltr" | "rtl"` (default ltr), `color?`, `backgroundColor?`,
`barColor?: (value, index) => ColorInput` (optional per-bar color).

```
layoutSparkline(opts, width, height): Cell[]
  if width <= 0 || height <= 0 -> []
  max = opts.max ?? max(finite values) ; if none finite -> 1 ; if max <= 0 -> scale yields 0
  n = min(width, data.length)
  for i in 0..n-1:
    x = direction ltr ? i : width - 1 - i
    v = data[i]
    if v missing/non-finite:
      for row in 0..height-1: cell(x, row) = BAR_EMPTY (absent value)
    else:
      ticks = max <= 0 ? 0 : min(floor(v * height * 8 / max), height * 8)   // v<0 -> 0
      for row = height-1 down to 0:                                          // bottom-up
        cell(x, row) = symbolForHeight(ticks)
        ticks = ticks > 8 ? ticks - 8 : 0
```

8 ticks per cell; multi-row bars stack seamlessly because glyphs are
bottom-aligned eighths. If `backgroundColor` set, paint every cell bg.

## 6. gauge.ts (port of gauge.rs, clamping deviation)

Options: `ratio?: number` (default 0), `label?: string | null` (default
`${round(ratio*100)}%`; `null` suppresses), `color?` (fill, default "white"),
`labelColor?` (default = `color`), `backgroundColor?`, `unicode?: boolean`
(default false — partial eighth-block at the fill edge).

```
layoutGauge(opts, width, height): Cell[]
  if width <= 0 || height <= 0 -> []
  ratio = clamp(finite(ratio) ? ratio : 0, 0, 1)          // ratatui panics; we clamp
  filled = width * ratio
  end = unicode ? floor(filled) : round(filled)
  every row:
    x in 0..end-1: cell '█' fg=color bg=color? -> NO: fg=color, bg=backgroundColor|undefined
    unicode && ratio < 1 && end < width:
      idx = round((filled % 1) * 8); if idx in 1..8: cell BLOCK_EIGHTHS[idx-1] at (end,row)
  label (if any): truncate to width; col = floor((width - len)/2); row = floor(height/2)
    chars at x < end:  fg=labelColor (default: terminal default), bg=color
    chars at x >= end: fg=labelColor ?? color, bg=backgroundColor
    // inside the fill the fill color becomes the label background, mirroring
    // ratatui's blank+swap pass: the bar stays continuous behind the text
```

## 7. barchart.ts (port of barchart.rs vertical, flat bars)

Options: `data: readonly (Bar | number)[]` where
`Bar = { value: number; label?: string; color?: ColorInput; textValue?: string }`,
`barWidth? = 1`, `barGap? = 1`, `max?: number`, `showValues? = true`,
`showLabels? = true`, `color?`, `backgroundColor?`.

```
layoutBarChart(opts, width, height): Cell[]
  if width <= 0 || height <= 0 || data empty || barWidth <= 0 -> []
  hasLabels = showLabels && any bar has a label
  labelRows = hasLabels ? 1 : 0
  barsHeight = height - labelRows ; if barsHeight <= 0 -> []
  max = opts.max ?? max(finite values, 0)               // no clamp; ticks guard max > 0
  maxTicks = barsHeight * 8
  x = 0
  for each bar while x + barWidth <= width:
    v = finite(bar.value) ? max(0, bar.value) : 0
    ticks = max > 0 ? min(floor(v * maxTicks / max), maxTicks) : 0
    // bar body, bottom-up per row (same consumption as sparkline)
    t = ticks
    for row = barsHeight-1 down to 0:
      sym = symbolForHeight(t)
      if sym != " ": for c in 0..barWidth-1: cell(x+c, row) = sym, fg = bar.color ?? color
      t = t > 8 ? t - 8 : 0
    // value label: overlaid on the BOTTOM bar row (ratatui placement)
    if showValues && v != 0:
      text = bar.textValue ?? String(bar.value)
      if text.length < barWidth || (text.length == barWidth && ticks >= 8):
        paint centered at row barsHeight-1: x + floor((barWidth - text.length)/2)
      // text exactly covering the bar is shown only over a full block row, so
      // a partial bar glyph is never erased by the value (ratatui render_value)
    // bar label: centered, truncated to barWidth, row barsHeight
    if hasLabels && bar.label: paint truncated/centered at row barsHeight
    x += barWidth + barGap
```

Bars that do not fit are dropped (ratatui truncation semantics).

## 8. chart.ts (port of chart.rs + canvas.rs)

### Types

```ts
type Marker = "dot" | "block" | "braille"           // default "braille"
type GraphType = "line" | "scatter" | "bar"         // default "scatter" (ratatui default)
interface Dataset {
  name?: string
  data: ReadonlyArray<readonly [number, number]>
  marker?: Marker
  graphType?: GraphType
  color?: ColorInput                                // default "white"
}
interface AxisOptions {
  bounds?: readonly [number, number]                // REQUIRED when axis object given
  labels?: readonly string[]
  title?: string
  labelsAlignment?: "left" | "center" | "right"     // default "left" (ratatui)
  color?: ColorInput
}
interface ChartOptions {
  datasets?: readonly Dataset[]
  xAxis?: AxisOptions
  yAxis?: AxisOptions
  legendPosition?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "none"  // default top-right
  hiddenLegendConstraints?: readonly [number, number]  // default [1/4, 1/4]
  color?: ColorInput          // default axis/label/title color "white"
  backgroundColor?: ColorInput
}
```

Validation: if `xAxis`/`yAxis` present, `bounds` must be a finite pair
(throw `TypeError` otherwise — the one hard error, per review bounds-contract).
Axes omitted -> auto bounds from finite data (`[min,max]`; empty -> `[0,1]`;
`min === max` -> `[min - 0.5, max + 0.5]`).

### Layout stage (faithful port)

```
if width <= 0 || height <= 0 -> []
x = 0; y = height - 1
labelRowX = null; axisRowX = null
if xLabels non-empty && y > 0: labelRowX = y; y -= 1
if xLabels non-empty && y > 0: axisRowX = y; y -= 1
yLabelWidth = 0; axisColY = null
if yLabels non-empty:
  w = max(display length of each y label)
  if xLabels non-empty:                       // first x label may intrude into slot
    a = xLabelsAlignment
    w += a == "left" ? len(xLabels[0]) - 1 : a == "center" ? floor(len(xLabels[0])/2) : 0
  yLabelWidth = min(w, floor(width / 3))      // ratatui clamp
  if yLabelWidth + 1 < width:                 // room for slot + axis column? (x + maxW < right)
    axisColY = yLabelWidth                    // column of '│' (x was 0)
    x = yLabelWidth + 1
graphLeft = x; graphTop = 0; graphWidth = width - x; graphHeight = y + 1
if graphWidth <= 0 || graphHeight <= 0 -> data-less fallback (labels only if they fit)
```

Axis lines (only when the corresponding axis has labels — ratatui rule):
- `axisRowX != null`: '─' from (axisColY ?? -1)+1 .. width-1 at row axisRowX.
- `axisColY != null`: '│' from row 0 .. (axisRowX ?? height-1)-1 at column axisColY.
- Both: '└' at (axisColY, axisRowX).

Titles (require graphHeight > 2 and fit, else skipped):
- x title: right-aligned ending at column width-1, row = axisRowX ?? labelRowX ?? graph bottom.
- y title: at (0, 0) — top-left corner.

### Labels stage

- X labels: need >= 2 and labelRowX. `tickW = floor(graphWidth / n)`.
  - First (ratatui `first_x_label_area` + reversed alignment mapping):
    area "left" -> [0, graphLeft) (EMPTY without a y-axis slot -> label
    omitted), "center" -> [0, graphLeft + min(tickW, len)), "right" ->
    [graphLeft - 1, graphLeft + tickW). Truncated to the area, then aligned
    Left=>right / Center=>center / Right=>left within it.
  - Middle i (1..n-2): area (graphLeft + i*tickW + 1, tickW - 1), centered,
    TRUNCATED to the area (upstream truncates via render_label; it does not
    skip over-wide labels).
  - Last: right-aligned ending at column width-1.
- Y labels: need >= 2 and yLabelWidth > 0. For i in 0..n-1:
  `dy = floor(i * (graphHeight - 1) / (n - 1))`; row = graphBottom - dy
  (first label at bottom, last at top — ratatui order). Text aligned in slot
  [0, yLabelWidth) per labelsAlignment (default left). Truncate to slot.

### Data stage (Canvas port)

```
layers: ordered cell layers                         // ONE layer per dataset
for dataset in datasets (order preserved):
  pts = dataset.data filtered to finite pairs
  if pts empty: continue
  grid = makeGrid(dataset.marker, graphWidth, graphHeight)   // fresh per dataset —
    // ratatui v0.30 Context::marker() finish()es the current grid and starts a
    // new one for EACH dataset, even when adjacent datasets share a marker
  color = dataset.color ?? "white"
  // points always painted (ratatui: Points drawn for every graph type)
  for (wx, wy) in pts: p = getPoint(...); if p: grid.paint(p, color)
  if graphType == "line":
    for consecutive pairs (original data order, windows(2)):
      clipped = cohenSutherland(a, b, bounds); if clipped:
        p0 = getPoint(clipped.a); p1 = getPoint(clipped.b)
        if p0 && p1: bresenham(p0, p1, (px,py) => grid.paint(px, py, color))
  if graphType == "bar":
    for (wx, wy) in pts:                       // base is y = 0.0, NOT yBounds[0]
      clipped = cohenSutherland((wx, 0), (wx, wy), bounds)
      ... same projection + Bresenham (vertical run)
  layers.push(grid.save())
cells = compositeLayers(layers)                // attribute-level merge, bottom-up;
  // a later braille dataset REPLACES the whole cell it touches (no dot union)
offset every cell by (graphLeft, graphTop)
```

### Legend stage

```
named = datasets with non-empty name
if legendPosition != "none" && named.length:
  innerW = max(name length); legendW = innerW + 2; legendH = named.length + 2
  maxW = floor(graphWidth * hiddenLegendConstraints[0])
  maxH = floor(graphHeight * hiddenLegendConstraints[1])
  heightMargin = graphHeight - legendH - (xTitle ? 1 : 0) - (yTitle ? 1 : 0)
  if innerW > 0 && legendW <= maxW && legendH <= maxH && heightMargin >= 0:
    position per legendPosition inside graph area; title-collision rules
    (ratatui LegendPosition::layout): top-right yields one row when
    legendW + yTitleWidth > graphWidth, top-left when a y title exists,
    bottom-left when xTitleWidth + legendW > graphWidth, bottom-right when an
    x title exists
    reset fg/bg (NOT the glyph) of every cell under the legend box — ratatui
    buf.set_style(legend_area, original_style); we approximate original_style
    with the chart backgroundColor / terminal default
    draw bordered box; row i: '│' + name (dataset color, NOT padded — upstream
    leaves non-name cells at their reset glyphs) + '│'
```

Paint order overall: axis lines/labels -> data -> titles -> legend (ratatui
order; text always over data).

## 9. renderables.ts + solid.ts

Each renderable: `extends Renderable`, stores options, exposes getters/setters
(setters call `requestRender()`), and:

```ts
protected override renderSelf(buffer: OptimizedBuffer): void {
  if (!this.visible) return
  const cells = layoutX(this._opts, this.width, this.height)
  for (const cell of cells)
    buffer.drawText(cell.char, this.x + cell.x, this.y + cell.y,
      parseColor(cell.fg ?? defaultFg), parseColor(cell.bg ?? "transparent"))
}
```

Defaults: Sparkline height 1, Gauge height 1, BarChart height 8, Chart height
10; all widths "100%". Constructor applies defaults only when the option is
undefined.

solid.ts (mirror spinner/src/solid.ts):

```ts
extend({ sparkline: SparklineRenderable, gauge: GaugeRenderable,
         barchart: BarChartRenderable, chart: ChartRenderable })
```

with `declare module "ax-tui/solid"` augmentation of `AxTuiComponents`.

## 10. Test matrix (fixtures defined before implementation, per review)

Pure-layout tests (no mocks): `test/chart-layout.test.ts`
- symbols: table sanity (8 levels, braille base).
- grid: braille bit layout (single dots -> exact codepoints 0x2801/0x2808/
  0x2840/0x2880 corners), pattern OR accumulation, last-write-wins color,
  CharGrid dot/block save semantics, out-of-range paint no-op.
- painter: getPoint corners/center for 2x4 resolution, reversed bounds -> null,
  out-of-bounds -> null, non-finite -> null; Cohen-Sutherland cases (inside,
  outside, partial both ends); Bresenham horizontal/vertical/diagonal/steep.
- sparkline: single-row frame golden, multi-row stacking (2 rows: `▂▄▆█`-style
  upper remainder), max=0 -> blanks, all-missing data, rtl direction, more
  data than width (truncate), NaN entries -> gaps, negative values -> 0.
- gauge: 0/0.5/1 ratios golden frames, label default `50%`, label:null,
  ratio NaN -> 0, ratio 1.7 -> clamped 1, 1x1, unicode partial block.
- barchart: golden frame with labels+values, value-on-bottom-row overlay rule
  (`len == barWidth` shown only over a full block row, i.e. `ticks >= 8`), barWidth/barGap spacing,
  bars dropped when out of room, max scaling, value 0 not printed, negative
  and NaN values -> empty bar.
- chart: no labels -> no axis lines (ratatui rule); with labels -> '└' corner;
  y-slot clamp to width/3; x labels need >= 2; y label order bottom-to-top;
  legend auto-hide when > 1/4 constraints; legend hidden when no names;
  braille dataset golden frame; line interpolation connects points;
  bar graphType baseline y=0; out-of-bounds points dropped; reversed bounds
  -> no data but axes still drawn; empty datasets -> axes only; 1x1 -> data
  only or empty; two datasets colliding in one braille cell -> last color wins.
- cellsToFrame helper round-trip.

Renderable tests (mock `ax-tui`, spinner-renderable.test.ts pattern):
`test/chart-renderable.test.ts`
- constructor defaults (width/height), option passthrough.
- setters trigger requestRender.
- renderSelf paints via fake buffer.drawText at this.x/this.y offsets.
- chart throws TypeError on non-finite axis bounds; accepts omitted axes.

Package tests: extend `test/package-integrity.test.ts` with `./chart` and
`./chart/solid` export shape + dist file existence.

## 11. Deviations from ratatui v0.30.2 (documented, deliberate)

1. Gauge clamps out-of-range ratio instead of panicking.
2. Gauge label styling is a single `labelColor` instead of a full
   `label_style`; the fill color behind the label inside the filled region
   mirrors ratatui's blank+swap pass.
3. Chart axes are optional with auto-bounds convenience (ratatui requires
   both axes); explicit bounds remain required when an axis object is given.
4. Markers limited to dot/block/braille; GraphType limited to
   line/scatter/bar; BarChart vertical flat bars only; no Canvas/LineGauge.
5. Label display width uses string length (ASCII assumption) instead of
   unicode width measurement; wide-glyph axis labels may misalign (v2: use
   encodeUnicode like spinner does).
6. Legend positions limited to four corners + none (ratatui has 8); dataset
   names are plain strings (no styled-Line per-name alignment).
7. BarChart empty-row background styling (bar_style on blank cells) not
   painted; only non-empty glyphs are written.
8. The legend under-box style reset approximates the buffer's pre-render
   style with `backgroundColor`/terminal default (ratatui captures the actual
   top-left cell style before rendering).

## 12. Wiring checklist

- package.json: `files += "chart/dist"`; exports `./chart`, `./chart/solid`;
  `build` = rm both dists + tsc both projects; `typecheck` = both tsconfigs;
  new `check:chart-dist`; `check` += `check:chart-dist`.
- script/check-tui-chart-dist.ts: mirror of check-tui-spinner-dist.ts.
- script/tui-dist.ts: DENY_PREFIXES += "chart/src".
- jsr.json: exports += `./chart`, `./chart/solid`; publish.include +=
  "chart/dist". (No new bare npm imports; self-imports resolve via package
  exports — per JSR publish memory.)
- test/package-integrity.test.ts: chart export assertions.
- README.md: subpath export table rows + short usage example.
- AGENTS.md: project map += chart/ line; maintenance loop mentions chart dist.
- MAINTENANCE.md: verification commands mention check:chart-dist.
