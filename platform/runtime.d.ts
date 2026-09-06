/** Write file options. */
export interface WriteFileOptions {
  createPath?: boolean
  mode?: number
}
interface FileImportModule {
  default: string
}
type FilePathFallback = string | URL | (() => string | URL)
/** Sleep. */
export declare const sleep: (msOrDate: number | Date) => Promise<void>
/** String width. */
export declare const stringWidth: (text: string) => number
/** Strip ANSI. */
export declare const stripANSI: (text: string) => string
/** Write file. */
export declare const writeFile: (
  destination: string | URL,
  data: string | ArrayBufferView,
  options?: WriteFileOptions,
) => Promise<number>
/** Resolve bundled file path. */
export declare function resolveBundledFilePath(
  loadBundledFile: () => Promise<FileImportModule>,
  fallbackPath: FilePathFallback,
  metaUrl: string,
): Promise<string>
export {}
