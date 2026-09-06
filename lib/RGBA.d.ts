/** RGBTriplet. */
export type RGBTriplet = readonly [number, number, number]
/** Color intent. */
export type ColorIntent = "rgb" | "indexed" | "default"
/** Color accepted by the renderer: a CSS/hex string or an {@link RGBA} value. */
export type ColorInput = string | RGBA
/** DEFAULT FOREGROUND RGB. */
export declare const DEFAULT_FOREGROUND_RGB: RGBTriplet
/** DEFAULT BACKGROUND RGB. */
export declare const DEFAULT_BACKGROUND_RGB: RGBTriplet
/** Normalized color value. */
export interface NormalizedColorValue {
  rgba: RGBA
}
/** Normalize indexed color index. */
export declare function normalizeIndexedColorIndex(index: number): number
/** Ansi256 index to rgb. */
export declare function ansi256IndexToRgb(index: number): RGBTriplet
/** Premultiplied RGBA color stored in a packed buffer. */
export declare class RGBA {
  buffer: Uint16Array
  constructor(buffer: Uint16Array)
  static fromArray(array: Uint16Array): RGBA
  static fromValues(r: number, g: number, b: number, a?: number): RGBA
  static clone(rgba: RGBA): RGBA
  static fromInts(r: number, g: number, b: number, a?: number): RGBA
  static fromHex(hex: string): RGBA
  static fromIndex(index: number, snapshot?: ColorInput): RGBA
  static defaultForeground(snapshot?: ColorInput): RGBA
  static defaultBackground(snapshot?: ColorInput): RGBA
  toInts(): [number, number, number, number]
  get r(): number
  set r(value: number)
  get g(): number
  set g(value: number)
  get b(): number
  set b(value: number)
  get a(): number
  set a(value: number)
  get meta(): number
  get intent(): ColorIntent
  get slot(): number
  map<R>(fn: (value: number) => R): [R, R, R, R]
  toString(): string
  equals(other?: RGBA): boolean
}
/** Normalize color value. */
export declare function normalizeColorValue(value: ColorInput | null | undefined): NormalizedColorValue | null
/** Hex to rgb. */
export declare function hexToRgb(hex: string): RGBA
/** Rgb to hex. */
export declare function rgbToHex(rgb: RGBA): string
/** Hsv to rgb. */
export declare function hsvToRgb(h: number, s: number, v: number): RGBA
/** Parse color. */
export declare function parseColor(color: ColorInput): RGBA
