import { PasteEvent, Selection, Timeline, type CliRenderer, type KeyEvent, type TimelineOptions } from "ax-tui"
/** Renderer context. */
export declare const RendererContext: import("solid-js").Context<CliRenderer | undefined>
/** Access the current {@link CliRenderer} from SolidJS context. */
export declare const useRenderer: () => CliRenderer
/** On resize. */
export declare const onResize: (callback: (width: number, height: number) => void) => void
/** Use terminal dimensions. */
export declare const useTerminalDimensions: () => import("solid-js").Accessor<{
  width: number
  height: number
}>
/** Use keyboard options. */
export interface UseKeyboardOptions {
  /** Include release events - callback receives events with eventType: "release" */
  release?: boolean
}
/**
 * Subscribe to keyboard events.
 *
 * By default, only receives press events (including key repeats with `repeated: true`).
 * Use `options.release` to also receive release events.
 *
 * @example
 * // Basic press handling (includes repeats)
 * useKeyboard((e) => console.log(e.name, e.repeated ? "(repeat)" : ""))
 *
 * // With release events
 * useKeyboard((e) => {
 *   if (e.eventType === "release") keys.delete(e.name)
 *   else keys.add(e.name)
 * }, { release: true })
 */
export declare const useKeyboard: (callback: (key: KeyEvent) => void, options?: UseKeyboardOptions) => void
/** Use paste. */
export declare const usePaste: (callback: (event: PasteEvent) => void) => void
/**
 * @deprecated renamed to useKeyboard
 */
export declare const useKeyHandler: (callback: (key: KeyEvent) => void, options?: UseKeyboardOptions) => void
/** On focus. */
export declare const onFocus: (callback: () => void) => void
/** On blur. */
export declare const onBlur: (callback: () => void) => void
/** Use selection handler. */
export declare const useSelectionHandler: (callback: (selection: Selection) => void) => void
/** Use timeline. */
export declare const useTimeline: (options?: TimelineOptions) => Timeline
