# ADR-0001: Chart widgets as a top-level `chart/` package

Status: accepted (2026-09-05, autonomous mode)
Context owners: ax-tui maintainers
Related: `.internal/PRD-chart-widgets.md`, `.internal/TECH-SPEC-chart-widgets.md`

## Context

ax-tui needs ratatui-style chart widgets (Sparkline, Gauge, BarChart, Chart).
The repository has hard constraints:

- The renderer is a pinned, pre-bundled upstream snapshot (OpenTUI 0.4.1
  lineage). Changes to hashed chunks must go through named, idempotent patch
  contracts (`patches/`, `script/tui-patches.ts`); hand-edits are forbidden.
- `spinner/` established the precedent for AX-authored widget packages:
  TypeScript sources in `src/`, committed `dist/` built by `tsc`, subpath
  exports (`ax-tui/spinner`, `ax-tui/spinner/solid`), Solid intrinsic
  registration via `extend()` from `ax-tui/solid`, a dist-freshness check
  script, and vitest coverage without a native renderer.
- Application code must use only documented package exports.
- External design review (claude-sonnet-5, substituting for unreachable
  DeepSeek/GLM council members) recommended shrinking v1 scope, composable
  chart internals, a shared glyph module, and an explicit braille color
  policy.

## Decision

Add a new top-level `chart/` package mirroring `spinner/` exactly in
mechanics, containing pure-TS renderables that draw through the existing
`Renderable` + `OptimizedBuffer` surface. No native, vendored-snapshot, or
patch-contract changes.

### D1. Package shape

- `chart/src/` (TypeScript, strict, NodeNext) compiled by
  `chart/tsconfig.build.json` to a committed `chart/dist/`.
- Subpath exports `./chart` and `./chart/solid` in `package.json` and
  `jsr.json`; `chart/dist` added to npm `files` and JSR `publish.include`.
- `check:chart-dist` script (mirror of `check-tui-spinner-dist.ts`) wired into
  `pnpm run check`; `build` and `typecheck` scripts extended to both packages.
- `script/tui-dist.ts` deny-prefixes gain `chart/src` (dist-only shipping,
  same policy as spinner).

### D2. Layered internals (composable stages per review)

1. `symbols.ts` — shared glyph tables (bar nine-levels, block eighths, line
   characters, dot, braille base). One source of truth for Sparkline,
   BarChart, Gauge, Chart (review finding: avoid divergent glyph sets).
2. `grid.ts` — `Grid` abstraction parameterized by per-cell resolution
   (`CharGrid` 1x1 for dot/block markers, `BrailleGrid` 2x4), plus layer
   compositing with per-attribute (symbol/fg/bg) override, faithful to
   ratatui's Canvas layer model. Exported as a documented utility of
   `ax-tui/chart` (not a separate subpath) so a future Canvas widget can
   reuse it without a new public surface commitment.
3. `painter.ts` — the single world-to-pixel coordinate mapping shared by all
   markers (review finding: switching markers must not fork layout code),
   Cohen-Sutherland clipping, integer Bresenham.
4. `cells.ts` — cell/paint-list model, attribute-level merge, `cellsToFrame`
   for deterministic frame assertions.
5. Per-widget pure layout functions (`layoutSparkline`, `layoutGauge`,
   `layoutBarChart`, `layoutChart`) with zero runtime `ax-tui` imports
   (type-only imports allowed). `layoutChart` composes axis-layout,
   marker-plotter, and legend-layout stages.
6. `renderables.ts` — thin `Renderable` subclasses that call the layout
   functions and paint via `buffer.drawText`. `solid.ts` registers
   `<sparkline>`, `<gauge>`, `<barchart>`, `<chart>` via `extend()`.

### D3. Behavioral contracts (from review + ratatui study)

- Explicit-bounds model: when `xAxis`/`yAxis` objects are provided, their
  `bounds` are required and must be finite; degenerate/reversed bounds draw no
  data (ratatui behavior, no throw). When axes are omitted entirely, bounds
  are auto-derived from finite data points as a documented convenience.
- Non-finite data points are filtered before any layout math.
- Zero/negative widget size: layout returns an empty cell list.
- Braille color collisions: last-write-wins per cell (ratatui has a single fg
  per braille cell); tested with colliding datasets.
- Axis lines render only when the corresponding axis has labels (ratatui
  v0.30 rule); y-label slot clamped to 1/3 width; x labels require >= 2.
- Legend auto-hides when it exceeds the hidden-legend ratio constraints
  (default 1/4 of graph width and height, ratatui parity) or no dataset is
  named.
- Gauge clamps ratio to [0,1] instead of ratatui's panic; label cells replace
  fill characters directly (equivalent outcome to ratatui's swap trick).

### D4. v1 scope cuts (deliberate)

- Markers: `dot`, `block`, `braille` only. HalfBlock/Quadrant/Sextant/Octant
  and `GraphType::Area` deferred (the `Grid` abstraction already
  parameterizes resolution, so additions are table-driven).
- BarChart: vertical only, flat bars (no groups), no horizontal direction.
- No `Canvas`, no `LineGauge`.
- Label collision avoidance: match ratatui (none beyond slot clamping).

## Alternatives considered

1. **Patch the vendored snapshot** (add renderables into `renderables/` via
   patch contracts): rejected — patch contracts exist for divergences from
   upstream, not new features; every upstream refresh would carry the burden;
   spinner already proved the out-of-snapshot path.
2. **Compose existing Text/Box renderables** into charts at the Solid level:
   rejected — no sub-cell braille resolution, O(cells) renderable overhead,
   no shared clipping/scaling math; unusable for line charts.
3. **Canvas-first general painter, charts as thin wrappers** (ratatui's own
   structure): partially adopted — the grid/painter substrate is
   Canvas-shaped, but the public Canvas widget is deferred to keep v1
   reviewable (review finding: prevent scope creep).
4. **Children-based JSX API** (`<chart><dataset .../></chart>`): rejected for
   v1 — requires catalogue/reconciler work for child element types;
   prop-based configuration matches spinner and keeps the intrinsic
   registration to one `extend()` call.
5. **Shipping as a separate npm package** (`ax-tui-chart`): rejected — the
   monorepo subpath pattern already exists, versioning stays atomic, and the
   dist-freshness tooling is shared.

## Consequences

- Positive: zero upstream-refresh coupling; deterministic pure-function
  testing; ratatui-faithful semantics with documented deviations; substrate
  ready for a v2 Canvas.
- Negative: `chart/dist` becomes another committed build artifact with a
  freshness gate (maintenance cost identical to spinner's); widget set is a
  deliberate subset of ratatui's, so users porting ratatui code must check
  the deviation list in the tech spec.
- Obligations: README export table, AGENTS.md project map, and MAINTENANCE.md
  verification commands must mention the chart package in the same change.
