/** Extension to filetype. */
export declare const extensionToFiletype: Map<string, string>
/** Basename to filetype. */
export declare const basenameToFiletype: Map<string, string>
/** Ext to filetype. */
export declare function extToFiletype(extension: string): string | undefined
/** Path to filetype. */
export declare function pathToFiletype(path: string): string | undefined
/** Info string to filetype. */
export declare function infoStringToFiletype(infoString: string): string | undefined
