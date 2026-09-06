import type { TextChunk } from "../text-buffer.js"
import { StyledText } from "./styled-text.js"
import { SyntaxStyle } from "../syntax-style.js"
import { TreeSitterClient } from "./tree-sitter/client.js"
import type { SimpleHighlight } from "./tree-sitter/types.js"
interface TextChunkOptions {
  enabled?: boolean
  baseHighlight?: string
}
/** Tree sitter to text chunks. */
export declare function treeSitterToTextChunks(
  content: string,
  highlights: SimpleHighlight[],
  syntaxStyle: SyntaxStyle,
  options?: TextChunkOptions,
): TextChunk[]
/** Tree sitter to styled text options. */
export interface TreeSitterToStyledTextOptions {
  conceal?: Pick<TextChunkOptions, "enabled">
  baseHighlight?: string
}
/** Tree sitter to styled text. */
export declare function treeSitterToStyledText(
  content: string,
  filetype: string,
  syntaxStyle: SyntaxStyle,
  client: TreeSitterClient,
  options?: TreeSitterToStyledTextOptions,
): Promise<StyledText>
export {}
