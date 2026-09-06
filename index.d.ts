/**
 * SolidJS terminal UI framework with a native renderer.
 *
 * `ax-tui` combines a Yoga-layout renderable tree, a SolidJS reconciler
 * (`ax-tui/solid`), headless test utilities (`ax-tui/testing`), spinners
 * (`ax-tui/spinner`), and ratatui-style charts (`ax-tui/chart`).
 *
 * Native rendering on Node.js needs Node 26+ with `--experimental-ffi`.
 * Registry installs download the current platform's native library from the
 * matching GitHub release (`v` + package version) and verify it against
 * `vendor/manifest.json`. Use 0.1.1 or later; 0.1.0 has no native-asset
 * release.
 *
 * @example
 * ```tsx
 * import { render, useKeyboard } from "ax-tui/solid"
 *
 * function App() {
 *   useKeyboard((key) => {
 *     if (key.name === "q") process.exit(0)
 *   })
 *   return (
 *     <box width="100%" height="100%" justifyContent="center" alignItems="center">
 *       <text fg="#7ee787">Hello from ax-tui — press q to quit</text>
 *     </box>
 *   )
 * }
 *
 * await render(() => <App />)
 * ```
 *
 * @example
 * ```ts
 * import { RGBA, TextRenderable } from "ax-tui"
 * import { render, useKeyboard } from "ax-tui/solid"
 * import { SpinnerRenderable } from "ax-tui/spinner"
 * import "ax-tui/spinner/solid"
 * import { ChartRenderable, SparklineRenderable } from "ax-tui/chart"
 * import "ax-tui/chart/solid"
 * ```
 *
 * @module
 */
export * from "./Renderable.js"
export * from "./types.js"
export * from "./utils.js"
export * from "./buffer.js"
export * from "./text-buffer.js"
export * from "./text-buffer-view.js"
export * from "./edit-buffer.js"
export * from "./editor-view.js"
export * from "./syntax-style.js"
export * from "./post/effects.js"
export * from "./post/filters.js"
export * from "./post/matrices.js"
export * from "./animation/Timeline.js"
export * from "./lib/index.js"
export * from "./renderer.js"
export * from "./plugins/types.js"
export * from "./plugins/registry.js"
export * from "./plugins/core-slot.js"
export * from "./NativeSpanFeed.js"
export * from "./audio.js"
export * from "./renderables/index.js"
export * from "./zig.js"
export * from "./console.js"
/** Yoga layout engine namespace used by the renderer. */
export * as Yoga from "./yoga.js"
