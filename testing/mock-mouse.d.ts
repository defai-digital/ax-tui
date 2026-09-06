import type { CliRenderer } from "../renderer.js"
/** Mouse buttons. */
export declare const MouseButtons: {
  readonly LEFT: 0
  readonly MIDDLE: 1
  readonly RIGHT: 2
  readonly WHEEL_UP: 64
  readonly WHEEL_DOWN: 65
  readonly WHEEL_LEFT: 66
  readonly WHEEL_RIGHT: 67
}
/** Mouse button. */
export type MouseButton = (typeof MouseButtons)[keyof typeof MouseButtons]
/** Mouse position. */
export interface MousePosition {
  x: number
  y: number
}
/** Mouse modifiers. */
export interface MouseModifiers {
  shift?: boolean
  alt?: boolean
  ctrl?: boolean
}
/** Mouse event type. */
export type MouseEventType = "down" | "up" | "move" | "drag" | "scroll"
/** Mouse event options. */
export interface MouseEventOptions {
  button?: MouseButton
  modifiers?: MouseModifiers
  delayMs?: number
}
/** Create mock mouse. */
export declare function createMockMouse(renderer: CliRenderer): {
  moveTo: (x: number, y: number, options?: MouseEventOptions) => Promise<void>
  click: (x: number, y: number, button?: MouseButton, options?: MouseEventOptions) => Promise<void>
  doubleClick: (x: number, y: number, button?: MouseButton, options?: MouseEventOptions) => Promise<void>
  pressDown: (x: number, y: number, button?: MouseButton, options?: MouseEventOptions) => Promise<void>
  release: (x: number, y: number, button?: MouseButton, options?: MouseEventOptions) => Promise<void>
  drag: (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    button?: MouseButton,
    options?: MouseEventOptions,
  ) => Promise<void>
  scroll: (
    x: number,
    y: number,
    direction: "up" | "down" | "left" | "right",
    options?: MouseEventOptions,
  ) => Promise<void>
  getCurrentPosition: () => MousePosition
  getPressedButtons: () => MouseButton[]
  emitMouseEvent: (
    type: MouseEventType,
    x: number,
    y: number,
    button?: MouseButton,
    options?: Omit<MouseEventOptions, "button">,
  ) => Promise<void>
}
