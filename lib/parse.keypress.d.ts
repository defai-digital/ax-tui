import { Buffer } from "node:buffer"
/** Non alphanumeric keys. */
export declare const nonAlphanumericKeys: string[]
/** Terminal named single stroke keys. */
export declare const terminalNamedSingleStrokeKeys: string[]
/** Key event type. */
export type KeyEventType = "press" | "repeat" | "release"
/** Parsed key. */
export interface ParsedKey {
  name: string
  ctrl: boolean
  meta: boolean
  shift: boolean
  option: boolean
  sequence: string
  number: boolean
  raw: string
  eventType: KeyEventType
  source: "raw" | "kitty"
  code?: string
  super?: boolean
  hyper?: boolean
  capsLock?: boolean
  numLock?: boolean
  baseCode?: number
  repeated?: boolean
}
/** Parse keypress options. */
export type ParseKeypressOptions = {
  useKittyKeyboard?: boolean
}
/** Parse keypress. */
export declare const parseKeypress: (s?: Buffer | string, options?: ParseKeypressOptions) => ParsedKey | null
