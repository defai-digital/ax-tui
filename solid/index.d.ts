/**
 * SolidJS reconciler, `render`, `testRender`, and terminal JSX hooks.
 *
 * @module
 */
import { CliRenderer, type CliRendererConfig } from "ax-tui"
import { type TestRendererOptions } from "ax-tui/testing"
import type { JSX } from "./jsx-runtime.js"
/** Render a SolidJS component tree to the terminal. */
export declare const render: (
  node: () => JSX.Element,
  rendererOrConfig?: CliRenderer | CliRendererConfig,
) => Promise<void>
/** Render a SolidJS tree with the headless test renderer. */
export declare const testRender: (
  node: () => JSX.Element,
  renderConfig?: TestRendererOptions,
) => Promise<import("ax-tui/testing").TestRendererSetup>
export * from "./src/reconciler.js"
export * from "./src/elements/index.js"
export * from "./src/scrollback.js"
export * from "./src/time-to-first-draw.js"
export * from "./src/plugins/slot.js"
export * from "./src/types/elements.js"
export { type JSX }
