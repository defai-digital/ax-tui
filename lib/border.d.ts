import type { ColorInput } from "./RGBA.js"
/** Border characters. */
export interface BorderCharacters {
  topLeft: string
  topRight: string
  bottomLeft: string
  bottomRight: string
  horizontal: string
  vertical: string
  topT: string
  bottomT: string
  leftT: string
  rightT: string
  cross: string
}
/** Border style. */
export type BorderStyle = "single" | "double" | "rounded" | "heavy"
/** Border sides. */
export type BorderSides = "top" | "right" | "bottom" | "left"
/** Is valid border style. */
export declare function isValidBorderStyle(value: unknown): value is BorderStyle
/** Parse border style. */
export declare function parseBorderStyle(value: unknown, fallback?: BorderStyle): BorderStyle
/** Border chars. */
export declare const BorderChars: Record<BorderStyle, BorderCharacters>
/** Border config. */
export interface BorderConfig {
  borderStyle: BorderStyle
  border: boolean | BorderSides[]
  borderColor?: ColorInput
  customBorderChars?: BorderCharacters
}
/** Box draw options. */
export interface BoxDrawOptions {
  x: number
  y: number
  width: number
  height: number
  borderStyle: BorderStyle
  border: boolean | BorderSides[]
  borderColor: ColorInput
  customBorderChars?: BorderCharacters
  backgroundColor: ColorInput
  shouldFill?: boolean
  title?: string
  titleAlignment?: "left" | "center" | "right"
  bottomTitle?: string
  bottomTitleAlignment?: "left" | "center" | "right"
}
/** Border sides config. */
export interface BorderSidesConfig {
  top: boolean
  right: boolean
  bottom: boolean
  left: boolean
}
/** Get border from sides. */
export declare function getBorderFromSides(sides: BorderSidesConfig): boolean | BorderSides[]
/** Get border sides. */
export declare function getBorderSides(border: boolean | BorderSides[]): BorderSidesConfig
/** Border chars to array. */
export declare function borderCharsToArray(chars: BorderCharacters): Uint32Array
/** Border char arrays. */
export declare const BorderCharArrays: Record<BorderStyle, Uint32Array>
