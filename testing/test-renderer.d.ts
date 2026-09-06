import { CliRenderer, type CliRendererConfig } from "../renderer.js"
import type { NativeRenderStats } from "../zig.js"
import { createMockKeys } from "./mock-keys.js"
import { createMockMouse } from "./mock-mouse.js"
import type { CapturedFrame } from "../types.js"
/** Test renderer options. */
export interface TestRendererOptions extends CliRendererConfig {
  width?: number
  height?: number
  kittyKeyboard?: boolean
  otherModifiersMode?: boolean
}
/** Test renderer. */
export type TestRenderer = CliRenderer
/** Mock input. */
export type MockInput = ReturnType<typeof createMockKeys>
/** Mock mouse. */
export type MockMouse = ReturnType<typeof createMockMouse>
/** Test flush options. */
export interface TestFlushOptions {
  maxPasses?: number
}
/** Test visual idle options. */
export interface TestVisualIdleOptions {
  quietFrames?: number
  maxFrames?: number
}
/** Test wait for options. */
export interface TestWaitForOptions {
  maxPasses?: number
}
/** Test external output commit. */
export interface TestExternalOutputCommit {
  text: string
  rows: string[]
  width: number
  height: number
  rowColumns: number
  startOnNewLine: boolean
  trailingNewline: boolean
}
/** Test external output. */
export interface TestExternalOutput {
  take(): TestExternalOutputCommit[]
  takeText(): string
  clear(): void
}
/** Handles returned by {@link createTestRenderer}. */
export interface TestRendererSetup {
  renderer: TestRenderer
  mockInput: MockInput
  mockMouse: MockMouse
  renderOnce: () => Promise<void>
  flush: (options?: TestFlushOptions) => Promise<void>
  waitFor: (predicate: () => boolean | Promise<boolean>, options?: TestWaitForOptions) => Promise<void>
  waitForFrame: (
    predicate: (frame: string) => boolean | Promise<boolean>,
    options?: TestWaitForOptions,
  ) => Promise<string>
  waitForVisualIdle: (options?: TestVisualIdleOptions) => Promise<void>
  externalOutput: TestExternalOutput
  getNativeStats: () => NativeRenderStats
  captureCharFrame: () => string
  captureSpans: () => CapturedFrame
  resize: (width: number, height: number) => void
}
/** Create a headless {@link CliRenderer} for frame assertions. */
export declare function createTestRenderer(options: TestRendererOptions): Promise<TestRendererSetup>
