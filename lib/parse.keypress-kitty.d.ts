import type { ParsedKey } from "./parse.keypress.js";
export declare const kittyNamedSingleStrokeKeys: string[];
/**
 * Decode a Kitty-protocol modifier mask (with the conventional `+1` bias
 * already removed) into individual modifier flags. Shared with the
 * modifyOtherKeys (CSI 27;mod;code~) decode path in parse.keypress.ts.
 */
export declare function fromKittyMods(mod: number): {
    shift: boolean;
    alt: boolean;
    ctrl: boolean;
    super: boolean;
    hyper: boolean;
    meta: boolean;
    capsLock: boolean;
    numLock: boolean;
};
export declare function parseKittyKeyboard(sequence: string): ParsedKey | null;
