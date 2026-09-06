import type { TextChunk } from "../text-buffer.js"
import { type ColorInput } from "./RGBA.js"
declare const BrandedStyledText: unique symbol
/** Color. */
export type Color = ColorInput
/** Style attrs. */
export interface StyleAttrs {
  fg?: Color
  bg?: Color
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  dim?: boolean
  reverse?: boolean
  blink?: boolean
}
/** Is styled text. */
export declare function isStyledText(obj: any): obj is StyledText
/** Styled text class. */
export declare class StyledText {
  [BrandedStyledText]: boolean
  chunks: TextChunk[]
  constructor(chunks: TextChunk[])
}
/** String to styled text. */
export declare function stringToStyledText(content: string): StyledText
/** Stylable input. */
export type StylableInput = string | number | boolean | TextChunk
/** Black. */
export declare const black: (input: StylableInput) => TextChunk
/** Red. */
export declare const red: (input: StylableInput) => TextChunk
/** Green. */
export declare const green: (input: StylableInput) => TextChunk
/** Yellow. */
export declare const yellow: (input: StylableInput) => TextChunk
/** Blue. */
export declare const blue: (input: StylableInput) => TextChunk
/** Magenta. */
export declare const magenta: (input: StylableInput) => TextChunk
/** Cyan. */
export declare const cyan: (input: StylableInput) => TextChunk
/** White. */
export declare const white: (input: StylableInput) => TextChunk
/** Bright black. */
export declare const brightBlack: (input: StylableInput) => TextChunk
/** Bright red. */
export declare const brightRed: (input: StylableInput) => TextChunk
/** Bright green. */
export declare const brightGreen: (input: StylableInput) => TextChunk
/** Bright yellow. */
export declare const brightYellow: (input: StylableInput) => TextChunk
/** Bright blue. */
export declare const brightBlue: (input: StylableInput) => TextChunk
/** Bright magenta. */
export declare const brightMagenta: (input: StylableInput) => TextChunk
/** Bright cyan. */
export declare const brightCyan: (input: StylableInput) => TextChunk
/** Bright white. */
export declare const brightWhite: (input: StylableInput) => TextChunk
/** Bg black. */
export declare const bgBlack: (input: StylableInput) => TextChunk
/** Bg red. */
export declare const bgRed: (input: StylableInput) => TextChunk
/** Bg green. */
export declare const bgGreen: (input: StylableInput) => TextChunk
/** Bg yellow. */
export declare const bgYellow: (input: StylableInput) => TextChunk
/** Bg blue. */
export declare const bgBlue: (input: StylableInput) => TextChunk
/** Bg magenta. */
export declare const bgMagenta: (input: StylableInput) => TextChunk
/** Bg cyan. */
export declare const bgCyan: (input: StylableInput) => TextChunk
/** Bg white. */
export declare const bgWhite: (input: StylableInput) => TextChunk
/** Bold. */
export declare const bold: (input: StylableInput) => TextChunk
/** Italic. */
export declare const italic: (input: StylableInput) => TextChunk
/** Underline. */
export declare const underline: (input: StylableInput) => TextChunk
/** Strikethrough. */
export declare const strikethrough: (input: StylableInput) => TextChunk
/** Dim. */
export declare const dim: (input: StylableInput) => TextChunk
/** Reverse. */
export declare const reverse: (input: StylableInput) => TextChunk
/** Blink. */
export declare const blink: (input: StylableInput) => TextChunk
/** Fg. */
export declare const fg: (color: Color) => (input: StylableInput) => TextChunk
/** Bg. */
export declare const bg: (color: Color) => (input: StylableInput) => TextChunk
/** Link. */
export declare const link: (url: string) => (input: StylableInput) => TextChunk
/**
 * Template literal handler for styled text (non-cached version).
 * Returns a StyledText object containing chunks of text with optional styles.
 */
export declare function t(strings: TemplateStringsArray, ...values: StylableInput[]): StyledText
export {}
