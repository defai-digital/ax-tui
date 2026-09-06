import { RGBA, type ColorInput } from "./lib/RGBA.js"
import { type RenderLib, type SyntaxStyleHandle } from "./zig.js"
/** Style definition. */
export interface StyleDefinition {
  fg?: RGBA
  bg?: RGBA
  bold?: boolean
  italic?: boolean
  underline?: boolean
  dim?: boolean
}
/** Style definition input. */
export interface StyleDefinitionInput {
  fg?: ColorInput
  bg?: ColorInput
  bold?: boolean
  italic?: boolean
  underline?: boolean
  dim?: boolean
}
/** Merged style. */
export interface MergedStyle {
  fg?: RGBA
  bg?: RGBA
  attributes: number
}
/** Theme token style. */
export interface ThemeTokenStyle {
  scope: string[]
  style: {
    foreground?: ColorInput
    background?: ColorInput
    bold?: boolean
    italic?: boolean
    underline?: boolean
    dim?: boolean
  }
}
/** Convert theme to styles. */
export declare function convertThemeToStyles(theme: ThemeTokenStyle[]): Record<string, StyleDefinition>
/** Named highlight style set applied to syntax-highlighted text. */
export declare class SyntaxStyle {
  private lib
  private stylePtr
  private _destroyed
  private nameCache
  private styleDefs
  private mergedCache
  constructor(lib: RenderLib, ptr: SyntaxStyleHandle)
  static create(): SyntaxStyle
  static fromTheme(theme: ThemeTokenStyle[]): SyntaxStyle
  static fromStyles(styles: Record<string, StyleDefinitionInput>): SyntaxStyle
  private guard
  registerStyle(name: string, style: StyleDefinitionInput): number
  resolveStyleId(name: string): number | null
  getStyleId(name: string): number | null
  get ptr(): SyntaxStyleHandle
  getStyleCount(): number
  clearNameCache(): void
  getStyle(name: string): StyleDefinition | undefined
  mergeStyles(...styleNames: string[]): MergedStyle
  clearCache(): void
  getCacheSize(): number
  getAllStyles(): Map<string, StyleDefinition>
  getRegisteredNames(): string[]
  destroy(): void
}
