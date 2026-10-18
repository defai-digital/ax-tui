import { TextBuffer } from "../core/text-buffer.js"
import type { EditBufferRenderable } from "../renderables/EditBufferRenderable.js"
import { InputRenderable } from "../renderables/Input.js"
import {
  applyAutocomplete,
  type AutocompleteItem,
  type AutocompleteRequest,
  type AutocompleteResult,
} from "./autocomplete.js"

/** Convert the native editor's display-width cursor to the provider's UTF-16 cursor. */
export function getEditorAutocompleteRequest(editor: EditBufferRenderable): AutocompleteRequest {
  return { text: editor.plainText, cursor: editor.editBuffer.getTextRange(0, editor.cursorOffset).length }
}

/** Apply a current suggestion as one undoable edit using the renderer's own Unicode width rules. */
export function applyEditorAutocomplete(
  editor: EditBufferRenderable,
  result: AutocompleteResult,
  item: AutocompleteItem,
): boolean {
  if (editor.isDestroyed || editor.hasSelection()) return false
  const replacement = applyAutocomplete(getEditorAutocompleteRequest(editor), result, item)
  if (!replacement) return false
  const cursor = editor instanceof InputRenderable
    ? replacement.text.slice(0, replacement.cursor).replace(/[\n\r]/g, "").length
    : replacement.cursor
  editor.replaceText(replacement.text)
  if (editor.isDestroyed) return true
  const measurement = TextBuffer.create(editor.ctx.widthMethod)
  try {
    // InputRenderable may sanitize/truncate the replacement. Always measure the resulting text.
    measurement.setText(editor.plainText.slice(0, cursor))
    editor.cursorOffset = measurement.length + measurement.getLineCount() - 1
  } finally {
    measurement.destroy()
  }
  return true
}
