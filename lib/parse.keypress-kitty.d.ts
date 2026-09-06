import type { ParsedKey } from "./parse.keypress.js"
/** Kitty named single stroke keys. */
export declare const kittyNamedSingleStrokeKeys: string[]
/** Parse kitty keyboard. */
export declare function parseKittyKeyboard(sequence: string): ParsedKey | null
