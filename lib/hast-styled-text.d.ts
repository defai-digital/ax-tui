import { StyledText } from "./styled-text.js"
import { SyntaxStyle } from "../syntax-style.js"
/** HASTText. */
export interface HASTText {
  type: "text"
  value: string
}
/** HASTElement. */
export interface HASTElement {
  type: "element"
  tagName: string
  properties?: {
    className?: string
  }
  children: HASTNode[]
}
/** HASTNode. */
export type HASTNode = HASTText | HASTElement
export type { StyleDefinition } from "../syntax-style.js"
/** Hast to styled text. */
export declare function hastToStyledText(hast: HASTNode, syntaxStyle: SyntaxStyle): StyledText
