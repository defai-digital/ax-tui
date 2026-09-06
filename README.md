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

The renderer and native libraries are derived from the
[OpenTUI](https://github.com/sst/opentui) project (pinned to the 0.4.1 native
baseline), published under the MIT license with attribution preserved. See
[UPSTREAM.md](./UPSTREAM.md), [DIVERGENCES.md](./DIVERGENCES.md),
[MAINTENANCE.md](./MAINTENANCE.md), and [LICENSE](./LICENSE).

## Install

```sh
pnpm add ax-tui@jsr:@defai-digital/ax-tui solid-js@1.9.12
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

### Subpath exports

| Export                        | Contents                                                    |
| ----------------------------- | ----------------------------------------------------------- |
| `ax-tui`                      | Native renderer, renderables, RGBA, Yoga helpers            |
| `ax-tui/solid`                | SolidJS reconciler, `render`, `testRender`, JSX runtime     |
| `ax-tui/solid/jsx-runtime`    | JSX runtime for `"jsxImportSource": "ax-tui/solid"`         |
| `ax-tui/solid/transform`      | Build-time JSX/Solid transform (Babel)                      |
| `ax-tui/spinner`              | `SpinnerRenderable` and presets                             |
| `ax-tui/spinner/solid`        | Solid `<spinner>` intrinsic registration                    |
| `ax-tui/chart`                | Ratatui-style charts: `ChartRenderable`, `SparklineRenderable`, `BarChartRenderable`, `GaugeRenderable`, braille grid |
| `ax-tui/chart/solid`          | Solid `<chart>`, `<sparkline>`, `<barchart>`, `<gauge>` intrinsic registration |
| `ax-tui/testing`              | Headless test renderer, mock input, frame capture           |
| `ax-tui/yoga`                 | Direct Yoga layout bindings                                 |
| `ax-tui/runtime-plugin`       | Runtime plugin glue (Bun/Node)                              |

## Provenance and maintenance

The renderer is a pinned, pre-bundled upstream snapshot plus a set of named,
idempotent local patches (Node FFI pointer pinning, FFI geometry guards,
vendored native resolution, Kitty keyboard opt-out, a reduced Solid intrinsic
catalogue, and AX runtime identity). The full ledger is in
[DIVERGENCES.md](./DIVERGENCES.md); the refresh workflow and verification
commands are in [MAINTENANCE.md](./MAINTENANCE.md); the pinned native baseline
and its hashes are recorded in [`vendor/manifest.json`](./vendor/manifest.json).

```sh
pnpm run check   # vendor integrity + patch contracts + spinner/chart dist freshness
```

## Design influences

Beyond OpenTUI, the framework's ergonomics and feature direction are informed
by studying other coding-agent CLIs as read-only design input — in particular
[Kimi Code](https://github.com/MoonshotAI/kimi-code) and
[Grok Build](https://github.com/xai-org/grok-build) — alongside the AX Code TUI
that ax-tui was extracted from. These projects influence design choices only;
no code is extracted from them, and their respective licenses and terms apply
to their own distributions.
