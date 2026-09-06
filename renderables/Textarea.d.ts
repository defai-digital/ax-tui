import type { KeyEvent, PasteEvent } from "../lib/KeyHandler.js"
import { RGBA, type ColorInput } from "../lib/RGBA.js"
import { type RenderContext } from "../types.js"
import { EditBufferRenderable, type EditBufferOptions } from "./EditBufferRenderable.js"
import { type KeyBinding as BaseKeyBinding } from "../lib/keybinding.internal.js"
import { type StyledText } from "../lib/styled-text.js"
import type { ExtmarksController } from "../lib/extmarks.js"
/** Textarea action. */
export type TextareaAction =
  | "move-left"
  | "move-right"
  | "move-up"
  | "move-down"
  | "select-left"
  | "select-right"
  | "select-up"
  | "select-down"
  | "line-home"
  | "line-end"
  | "select-line-home"
  | "select-line-end"
  | "visual-line-home"
  | "visual-line-end"
  | "select-visual-line-home"
  | "select-visual-line-end"
  | "buffer-home"
  | "buffer-end"
  | "select-buffer-home"
  | "select-buffer-end"
  | "delete-line"
  | "delete-to-line-end"
  | "delete-to-line-start"
  | "backspace"
  | "delete"
  | "newline"
  | "undo"
  | "redo"
  | "word-forward"
  | "word-backward"
  | "select-word-forward"
  | "select-word-backward"
  | "delete-word-forward"
  | "delete-word-backward"
  | "select-all"
  | "submit"
/** Key binding. */
export type KeyBinding = BaseKeyBinding<TextareaAction>
/** Textarea key alias map. */
export type TextareaKeyAliasMap = Record<string, string>
/** Default textarea key bindings. */
export declare const defaultTextareaKeyBindings: KeyBinding[]
/** Submit event. */
export interface SubmitEvent {}
/** Textarea options. */
export interface TextareaOptions extends EditBufferOptions {
  initialValue?: string
  backgroundColor?: ColorInput
  textColor?: ColorInput
  focusedBackgroundColor?: ColorInput
  focusedTextColor?: ColorInput
  placeholder?: StyledText | string | null
  placeholderColor?: ColorInput
  keyBindings?: KeyBinding[]
  keyAliasMap?: TextareaKeyAliasMap
  onSubmit?: (event: SubmitEvent) => void
}
/** Multi-line editable text renderable backed by the native edit buffer. */
export declare class TextareaRenderable extends EditBufferRenderable {
  private _placeholder
  private _placeholderColor
  private _unfocusedBackgroundColor
  private _unfocusedTextColor
  private _focusedBackgroundColor
  private _focusedTextColor
  private _keyBindingsMap
  private _keyAliasMap
  private _keyBindings
  private _actionHandlers
  private _initialValueSet
  private _submitListener
  private static readonly defaults
  constructor(ctx: RenderContext, options: TextareaOptions)
  private applyPlaceholder
  private buildActionHandlers
  handlePaste(event: PasteEvent): void
  handleKeyPress(key: KeyEvent): boolean
  private updateColors
  focus(): void
  blur(): void
  get placeholder(): StyledText | string | null
  set placeholder(value: StyledText | string | null | undefined)
  get placeholderColor(): RGBA
  set placeholderColor(value: ColorInput)
  get backgroundColor(): RGBA
  set backgroundColor(value: RGBA | string | undefined)
  get textColor(): RGBA
  set textColor(value: RGBA | string | undefined)
  set focusedBackgroundColor(value: ColorInput)
  set focusedTextColor(value: ColorInput)
  set initialValue(value: string)
  submit(): boolean
  set onSubmit(handler: ((event: SubmitEvent) => void) | undefined)
  get onSubmit(): ((event: SubmitEvent) => void) | undefined
  set keyBindings(bindings: KeyBinding[])
  set keyAliasMap(aliases: TextareaKeyAliasMap)
  get extmarks(): ExtmarksController
}
