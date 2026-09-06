import { TextareaRenderable } from "../Textarea.js"
import { type TestRenderer } from "../../testing/test-renderer.js"
import { type TextareaOptions } from "../Textarea.js"
import type { DiffRenderable } from "../Diff.js"
import type { MockTreeSitterClient } from "../../testing/mock-tree-sitter-client.js"
import type { ManualClock } from "../../testing/manual-clock.js"
/** Create textarea renderable. */
export declare function createTextareaRenderable(
  renderer: TestRenderer,
  renderOnce: () => Promise<void>,
  options: TextareaOptions,
): Promise<{
  textarea: TextareaRenderable
  root: any
}>
/** Settle diff highlighting. */
export declare function settleDiffHighlighting(
  diff: DiffRenderable,
  client: MockTreeSitterClient,
  render: () => Promise<void>,
): Promise<void>
/** Simulate frames. */
export declare function simulateFrames(
  clock: ManualClock,
  renderOnce: () => Promise<void>,
  ms: number,
  frameInterval?: number,
): Promise<void>
