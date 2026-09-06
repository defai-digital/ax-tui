/**
 * Ensures a value is initialized once per process,
 * persists across Bun hot reloads, and is type-safe.
 */
export declare function singleton<T>(key: string, factory: () => T): T
/** Get singleton. */
export declare function getSingleton<T>(key: string): T | undefined
/** Destroy singleton. */
export declare function destroySingleton(key: string): void
/** Has singleton. */
export declare function hasSingleton(key: string): boolean
