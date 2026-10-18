# ax-tui

SolidJS terminal UI framework with a native renderer, extracted from the
[AX Code](https://github.com/defai-digital/ax-code) monorepo as a standalone,
general-purpose package. It combines:

- a native terminal renderer (Zig shared libraries, vendored per platform) with
  a Yoga-layout-based renderable tree;
- a SolidJS reconciler and JSX runtime for declarative terminal UIs
  (`ax-tui/solid`);
- headless test utilities for rendering and asserting on frames without a real
  terminal (`ax-tui/testing`, plus `testRender` from `ax-tui/solid`);
- a spinner component (`ax-tui/spinner`, `ax-tui/spinner/solid`);
- ratatui-style chart widgets (`ax-tui/chart`, `ax-tui/chart/solid`).

AX TUI owns its TypeScript renderer, SolidJS reconciler, and Zig/C native source.
It began as a source fork of [OpenTUI](https://github.com/anomalyco/opentui) 0.4.1
and is maintained and built independently, with MIT attribution preserved. See
[UPSTREAM.md](./UPSTREAM.md), [DIVERGENCES.md](./DIVERGENCES.md),
[MAINTENANCE.md](./MAINTENANCE.md), and [LICENSE](./LICENSE).

## Install

```sh
pnpm add ax-tui@jsr:@defai-digital/ax-tui solid-js@1.9.17
```

The command keeps `ax-tui` as the import alias for the JSR package. Native rendering on Node.js requires Node 26+
with `--experimental-ffi`; Node 24 can run non-rendering maintenance tools. Headless rendering uses the same
native backend through the test utilities and does not require a TTY.

On first use, registry installations download the current platform's native library and license from the matching
GitHub release and verify them against the package manifest. Use `AX_CODE_TUI_NATIVE_CACHE_DIR` to choose a cache
location and `AX_CODE_TUI_NATIVE_OFFLINE=1` to require already prepared assets. 0.1.0 has no matching native-asset
release and is not installable without workarounds; use 0.1.1 or later.

## Quick start

Render a SolidJS component tree to the terminal:

```tsx
import { render, useKeyboard } from "ax-tui/solid"

function App() {
  useKeyboard((key) => {
    if (key.name === "q") process.exit(0)
  })
  return (
    <box width="100%" height="100%" justifyContent="center" alignItems="center">
      <text fg="#7ee787">Hello from ax-tui — press q to quit</text>
    </box>
  )
}

await render(() => <App />)
```

Headless-test the same component without a terminal:

```tsx
import { testRender } from "ax-tui/solid"

const { captureCharFrame, waitForVisualIdle } = await testRender(() => <App />)
await waitForVisualIdle()
console.log(captureCharFrame())
```

## Imports

Application code should use only the documented package exports. Do not import
files from the package directory directly.

```ts
import { RGBA, TextRenderable } from "ax-tui"
import { render, useKeyboard } from "ax-tui/solid"
import { SpinnerRenderable } from "ax-tui/spinner"
import "ax-tui/spinner/solid"
import { ChartRenderable, SparklineRenderable } from "ax-tui/chart"
import "ax-tui/chart/solid"
```

### Autocomplete

The root export provides reusable completion providers and an editor adapter:

```ts
import {
  AutocompleteController,
  combineAutocompleteProviders,
  createSlashCommandProvider,
  createFilePathProvider,
  getEditorAutocompleteRequest,
  applyEditorAutocomplete,
} from "ax-tui"

const completions = new AutocompleteController(combineAutocompleteProviders(
  createSlashCommandProvider([{ name: "help", description: "Show available commands" }]),
  createFilePathProvider({ cwd: process.cwd(), maxResults: 50 }),
))

// editor is an attached TextareaRenderable or InputRenderable.
// Call again after each input/cursor change; handle provider errors in the caller.
const result = await completions.request(getEditorAutocompleteRequest(editor))
// Render result.items in your suggestion UI, then accept the user's selected item:
if (result?.items[0]) applyEditorAutocomplete(editor, result, result.items[0])

// Cancel when dismissing suggestions; dispose when the owning UI is destroyed.
completions.cancel()
completions.dispose()
```

Requests and replacement ranges use JavaScript UTF-16 indices. An item's optional
`cursorOffset` positions the caret inside its inserted text; quoted directory
completion uses it to keep subsequent typing inside the quotes. The adapter
converts through AX's native display-width rules, preserves undo, rejects stale
text/cursor snapshots, and declines edits while text is selected. Input replacement
retains its single-line and maximum-length constraints. Custom providers receive
an `AbortSignal`; superseded results are ignored even if the provider ignores it.
Cancellation suppresses errors from cancelled work; other provider errors reject
the request promise and should be handled by the application.

Slash completion applies to the first token at the beginning of the input.
Providers run in order; the first non-null result wins, including an empty list.
With slash completion first, leading `/` belongs to commands; use the path provider
alone for absolute POSIX paths, or `./`, `../`, `~/`, and `@` paths in a combined
provider. File completion reads one directory asynchronously, supports double-quoted
paths with spaces, and bounds the number of returned suggestions. It is not a shell
parser: backslashes are literal characters or Windows separators, and quotes/control
characters in filenames are excluded. Matching symlinks in the bounded result set
are checked for directory targets without recursively traversing them.

### Overlays

```ts
import { InputRenderable, getOverlayManager } from "ax-tui"

const input = new InputRenderable(renderer, { id: "dialog-input", width: "100%" })
const dialog = getOverlayManager(renderer).show(input, {
  width: "60%",
  height: 3,
  anchor: "center",
  margin: 1,
  visible: (width) => width >= 20,
})

dialog.setHidden(true)  // Keep the content alive and release its focus.
dialog.setHidden(false)
dialog.focus()          // Re-showing alone does not steal focus.
dialog.close()          // Permanently remove and destroy owned content; safe to repeat.
```

Each renderer has one shared manager. Content must be unattached and belong to
that renderer; showing it transfers ownership to the manager. A wrapper clips the
content and positions it above existing ordinary root children when shown or
focused. Dimensions can be cell
counts or percentages of the viewport remaining after margins. Anchors support
center, corners, and edge centers; offsets are clamped to the available area.
Responsive visibility is evaluated on show and renderer resize.

For a container with an embedded input, pass that input as `focus`. A focusable
content root is the default target. `nonCapturing: true` leaves keyboard focus in
the editor, which is useful for suggestion lists. This controls initial keyboard
focus, not mouse click-through. Overlays do not implement a modal focus trap,
Escape handling, or list navigation; those policies belong to the application.
Closing or hiding restores previous eligible focus only when focus remains inside
the overlay. Nested overlays support out-of-order closure and skip hidden or
destroyed restoration targets. Renderer destruction cleans up all overlays.

In Solid components, `useOverlay()` from `ax-tui/solid` returns a scoped `show`
method with the same arguments. Its handles close automatically when that owner
is disposed, without closing sibling owners' overlays. Use imperative renderables
as content; already mounted JSX/Portal nodes must not be reparented into overlays.

### Scoped keymaps

`getKeymap(renderer)` shares an opt-in dispatcher across one renderer. Layers
can target a focused renderable, its focused descendants (the default), or the
whole renderer when `target` is omitted:

```ts
import { getKeymap } from "ax-tui"

const keys = getKeymap(renderer)
const unregister = keys.register({
  target: panel,
  scope: "focus-within",
  priority: 10,
  enabled: () => !busy,
  bindings: [
    { id: "save", keys: "ctrl+s", description: "Save", handler: save },
    { id: "top", keys: ["g", "g"], description: "First row", handler: () => list.scrollToIndex(0) },
  ],
})

const help = keys.getActiveBindings() // Eligible bindings in dispatch order, including shadowed entries.
unregister()                         // Idempotent; does not destroy the target.
```

Higher priority wins, then the nearest focus scope, then the newest registration.
Hidden, detached, destroyed, and disabled scopes do not handle input. A matching
layer consumes the key before focused editor handlers. Earlier global input
listeners can still cancel it. Chords use exact modifier matching with `ctrl`,
`shift`, `alt`/`meta`, `super`, and `hyper`; `enter`, `esc`, `space`, and `plus`
are accepted aliases. Names match parsed key events, not physical keyboard codes.

The first matching layer owns a sequence. If an exact binding also prefixes a
longer binding, it waits up to 750 ms; configure `sequenceTimeoutMs` on the first
`getKeymap` call to change this. Escape, paste, focus change, terminal blur,
registration changes, and disposal cancel pending input. A mismatch discards the
old prefix and retries only the current key. Prefixes are never replayed into
editors. Held-key repeats do not advance pending sequences; single-key bindings
can repeat. `pendingKeys` and `cancelSequence()` support application hints.

In Solid, `useKeymap()` exposes `register`, `getActiveBindings`, `pendingKeys`,
and `cancelSequence`. Owner cleanup removes only that owner's registrations.
Keep `enabled` predicates pure. The shared dispatcher is disposed with the renderer.

### Virtual lists

`VirtualListRenderable<T>` extends the vertical ScrollBox with stable keys,
variable row heights, and viewport-sized mounting:

```ts
import { TextRenderable, VirtualListRenderable } from "ax-tui"

const list = new VirtualListRenderable(renderer, {
  width: "100%",
  height: 20,
  items: records,
  getKey: record => record.id,
  estimateHeight: 2,
  overscan: 3,
  renderItem: (record, index, context) => new TextRenderable(context, {
    content: record.text, width: "100%", wrapMode: "word",
  }),
})
renderer.root.add(list)
list.scrollToIndex(500, "start") // Also supports center/end; settles after native layout.
list.items = nextRecords        // Immutable updates; preserves the first visible key and row offset.
```

Keys must be unique strings or finite numbers. Heights are terminal cell counts;
`overscan` is extra cells above and below the viewport, not an item count. Rows
are measured after native layout; unmounted rows retain estimated or cached
heights. Width changes invalidate measurements. Updating data is O(n), while
height updates and offset lookups are O(log n). `VirtualListModel` exports this
height index separately for custom views, without constructing a renderer.

`renderItem` must return an unattached renderable from the supplied context.
The list owns and destroys mounted rows; row factories should have no unrelated
side effects. Use intrinsic row heights and widths relative to the viewport.
The item identity and index determine whether an existing row is reused: changed
items or indices remount, so keep persistent edit state in application data.
An offscreen focused row stays mounted while unchanged; removing or remounting
it moves focus to the list. `mountedCount` includes this possible extra row.
Empty lists release all rows. The virtual content container is managed internally;
use `items` rather than inherited child insertion or content-layout mutation.

Solid's `VirtualList` component from `ax-tui/solid` accepts the same options and
a `ref` callback. `items` and layout props are reactive; `getKey`, `renderItem`,
`estimateHeight`, and `overscan` are constructor options. Its owner destroys the
list on cleanup. Row factories return imperative renderables, not mounted JSX:

```tsx
<VirtualList items={records()} getKey={record => record.id} height={20}
  renderItem={(record, index, context) => new TextRenderable(context, { content: record.text })} />
```

See [the runnable example](./examples/virtual-list.mjs). From a source checkout,
run `node --experimental-ffi examples/virtual-list.mjs` on Node 26+; arrows and
the wheel scroll, `g g` jumps to the first record, Shift+G to the last, and Q quits.
Add `--smoke` for a headless frame and mount-count report.

### Subpath exports

| Export                     | Contents                                                                                                              |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `ax-tui`                   | Native renderer, renderables, RGBA, Yoga helpers                                                                      |
| `ax-tui/solid`             | SolidJS reconciler, `render`, `testRender`, JSX runtime                                                               |
| `ax-tui/solid/jsx-runtime` | JSX runtime for `"jsxImportSource": "ax-tui/solid"`                                                                   |
| `ax-tui/solid/transform`   | Build-time JSX/Solid transform (Babel)                                                                                |
| `ax-tui/spinner`           | `SpinnerRenderable` and presets                                                                                       |
| `ax-tui/spinner/solid`     | Solid `<spinner>` intrinsic registration                                                                              |
| `ax-tui/chart`             | Ratatui-style charts: `ChartRenderable`, `SparklineRenderable`, `BarChartRenderable`, `GaugeRenderable`, braille grid |
| `ax-tui/chart/solid`       | Solid `<chart>`, `<sparkline>`, `<barchart>`, `<gauge>` intrinsic registration                                        |
| `ax-tui/testing`           | Headless test renderer, mock input, frame capture                                                                     |
| `ax-tui/yoga`              | Direct Yoga layout bindings                                                                                           |
| `ax-tui/runtime-plugin`    | Runtime plugin glue (Bun/Node)                                                                                        |

## Provenance and maintenance

Edit `src/`, `solid/source/`, and `native/source/` for TypeScript changes.
TypeScript 7 checks these modules and generates the committed JavaScript and
declarations. Edit `native/renderer/` for Zig/C changes; Zig 0.15.2 builds all
eight supported native targets. No OpenTUI package is needed for these builds.

The behavior ledger is in [DIVERGENCES.md](./DIVERGENCES.md), the build and
release workflow is in [MAINTENANCE.md](./MAINTENANCE.md), and source/binary
hashes are recorded in [`vendor/manifest.json`](./vendor/manifest.json).

```sh
pnpm run build
pnpm run typecheck
pnpm run check
pnpm test
pnpm run test:native        # requires Zig 0.15.2
pnpm run build:native --all # macOS targets also require an Apple SDK
```

## Design influences

Beyond OpenTUI, the framework's ergonomics and feature direction are informed
by studying other coding-agent CLIs as read-only design input — in particular
[Kimi Code](https://github.com/MoonshotAI/kimi-code) and
[Grok Build](https://github.com/xai-org/grok-build) — alongside the AX Code TUI
that ax-tui was extracted from. These projects influence design choices only;
no code is extracted from them, and their respective licenses and terms apply
to their own distributions.
