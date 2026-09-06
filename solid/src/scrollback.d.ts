import { type CliRenderer, type ScrollbackRenderContext, type ScrollbackWriter } from "ax-tui"
import { type JSX } from "solid-js"
/** Solid scrollback writer options. */
export interface SolidScrollbackWriterOptions {
  width?: number
  height?: number
  rowColumns?: number
  startOnNewLine?: boolean
  trailingNewline?: boolean
}
/** Solid scrollback node. */
export type SolidScrollbackNode = (ctx: ScrollbackRenderContext) => JSX.Element
/** Create scrollback writer. */
export declare function createScrollbackWriter(
  node: SolidScrollbackNode,
  options?: SolidScrollbackWriterOptions,
): ScrollbackWriter
/** Write solid to scrollback. */
export declare function writeSolidToScrollback(
  renderer: CliRenderer,
  node: SolidScrollbackNode,
  options?: SolidScrollbackWriterOptions,
): void
