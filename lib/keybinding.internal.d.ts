/** Key binding like. */
export interface KeyBindingLike {
  name: string
  ctrl?: boolean
  shift?: boolean
  meta?: boolean
  super?: boolean
}
/** Key binding. */
export interface KeyBinding<Action extends string = string> extends KeyBindingLike {
  action: Action
}
/** Key binding lookup. */
export interface KeyBindingLookup extends KeyBindingLike {
  baseCode?: number
}
/** Key alias map. */
export type KeyAliasMap = Record<string, string>
/** Default key aliases. */
export declare const defaultKeyAliases: KeyAliasMap
/** Merge key aliases. */
export declare function mergeKeyAliases(defaults: KeyAliasMap, custom: KeyAliasMap): KeyAliasMap
/** Merge key bindings. */
export declare function mergeKeyBindings<Action extends string>(
  defaults: KeyBinding<Action>[],
  custom: KeyBinding<Action>[],
): KeyBinding<Action>[]
/** Get key binding key. */
export declare function getKeyBindingKey(binding: KeyBindingLike): string
/** Get key binding keys. */
export declare function getKeyBindingKeys(binding: KeyBindingLookup): string[]
/** Get key binding action. */
export declare function getKeyBindingAction<Action extends string>(
  map: Map<string, Action>,
  binding: KeyBindingLookup,
): Action | undefined
/** Matches key binding. */
export declare function matchesKeyBinding(binding: KeyBindingLookup, match: KeyBindingLike): boolean
/** Build key bindings map. */
export declare function buildKeyBindingsMap<Action extends string>(
  bindings: KeyBinding<Action>[],
  aliasMap?: KeyAliasMap,
): Map<string, Action>
/**
 * Converts a key binding to a human-readable string representation
 * @param binding The key binding to stringify
 * @returns A string like "ctrl+shift+y" or just "escape"
 * @example
 * keyBindingToString({ name: "y", ctrl: true, shift: true }) // "ctrl+shift+y"
 * keyBindingToString({ name: "escape" }) // "escape"
 * keyBindingToString({ name: "c", ctrl: true }) // "ctrl+c"
 * keyBindingToString({ name: "s", super: true }) // "super+s"
 */
export declare function keyBindingToString<Action extends string>(binding: KeyBinding<Action>): string
