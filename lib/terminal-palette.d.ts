import { RGBA } from "./RGBA.js"
import { type Clock } from "./clock.js"
type Hex = string | null
/** Write function. */
export type WriteFunction = (data: string | Buffer) => boolean
/** Terminal colors. */
export interface TerminalColors {
  palette: Hex[]
  defaultForeground: Hex
  defaultBackground: Hex
  cursorColor: Hex
  mouseForeground: Hex
  mouseBackground: Hex
  tekForeground: Hex
  tekBackground: Hex
  highlightBackground: Hex
  highlightForeground: Hex
}
/** Get palette options. */
export interface GetPaletteOptions {
  timeout?: number
  size?: number
}
/** Terminal palette detector. */
export interface TerminalPaletteDetector {
  detect(options?: GetPaletteOptions): Promise<TerminalColors>
  detectOSCSupport(timeoutMs?: number): Promise<boolean>
  cleanup(): void
}
/** Normalized terminal palette. */
export interface NormalizedTerminalPalette {
  palette: RGBA[]
  defaultForeground: RGBA
  defaultBackground: RGBA
}
/** Osc subscription source. */
export type OscSubscriptionSource = {
  subscribeOsc(handler: (sequence: string) => void): () => void
}
/** Terminal palette options. */
export interface TerminalPaletteOptions {
  stdin: NodeJS.ReadStream
  stdout: NodeJS.WriteStream
  writeFn?: WriteFunction
  isLegacyTmux?: boolean
  isTmux?: boolean
  oscSource?: OscSubscriptionSource
  clock?: Clock
}
/** Terminal palette class. */
export declare class TerminalPalette implements TerminalPaletteDetector {
  private stdin
  private stdout
  private writeFn
  private activeQuerySessions
  private inLegacyTmux
  private inTmux
  private oscSource?
  private readonly clock
  constructor(options: TerminalPaletteOptions)
  private writeOsc
  cleanup(): void
  private subscribeInput
  private createQuerySession
  detectOSCSupport(timeoutMs?: number): Promise<boolean>
  private queryPalette
  private querySpecialColors
  detect(options?: GetPaletteOptions): Promise<TerminalColors>
}
/** Create terminal palette. */
export declare function createTerminalPalette(options: TerminalPaletteOptions): TerminalPaletteDetector
/** Normalize terminal palette. */
export declare function normalizeTerminalPalette(colors?: TerminalColors | null): NormalizedTerminalPalette
/** Build terminal palette signature. */
export declare function buildTerminalPaletteSignature(colors?: TerminalColors | null): string
export {}
