import type { RendererHandle, RenderLib } from "../zig.js"
/** Clipboard target enumeration. */
export declare enum ClipboardTarget {
  Clipboard = 0,
  Primary = 1,
  Secondary = 2,
  Query = 3,
}
/** Encode osc52 payload. */
export declare function encodeOsc52Payload(text: string, encoder?: TextEncoder): Uint8Array
/** Clipboard class. */
export declare class Clipboard {
  private lib
  private rendererPtr
  constructor(lib: RenderLib, rendererPtr: RendererHandle)
  copyToClipboardOSC52(text: string, target?: ClipboardTarget): boolean
  clearClipboardOSC52(target?: ClipboardTarget): boolean
  isOsc52Supported(): boolean
}
