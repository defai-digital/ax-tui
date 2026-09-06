import { Renderable } from "./Renderable.js"
/** Create text attributes. */
export declare function createTextAttributes({
  bold,
  italic,
  underline,
  dim,
  blink,
  inverse,
  hidden,
  strikethrough,
}?: {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  dim?: boolean
  blink?: boolean
  inverse?: boolean
  hidden?: boolean
  strikethrough?: boolean
}): number
/** Attributes with link. */
export declare function attributesWithLink(baseAttributes: number, linkId: number): number
/** Get link id. */
export declare function getLinkId(attributes: number): number
/** Visualize renderable tree. */
export declare function visualizeRenderableTree(renderable: Renderable, maxDepth?: number): void
