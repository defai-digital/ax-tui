import { TreeSitterClient } from "./client.js"
export * from "./client.js"
export * from "../tree-sitter-styled-text.js"
export * from "./types.js"
export * from "./resolve-ft.js"
/** Get tree sitter client. */
export declare function getTreeSitterClient(): TreeSitterClient
/** Destroy tree sitter client. */
export declare function destroyTreeSitterClient(): Promise<void>
