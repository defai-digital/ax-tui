import type { TextChunk } from "../text-buffer.js"
import type { SimpleHighlight } from "./tree-sitter/types.js"
/** Detect links. */
export declare function detectLinks(
  chunks: TextChunk[],
  context: {
    content: string
    highlights: SimpleHighlight[]
  },
): TextChunk[]
