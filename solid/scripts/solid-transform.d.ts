/**
 * Build-time Babel transform for ax-tui SolidJS JSX.
 *
 * @module
 */
/** Maps a module specifier to a file path, or `null` to leave it unchanged. */
export type ResolveImportPath = (specifier: string) => string | null
/** Transform solid source options. */
export interface TransformSolidSourceOptions {
  filename: string
  moduleName?: string
  resolvePath?: ResolveImportPath
}
/** Strip query and hash. */
export declare function stripQueryAndHash(path: string): string
/** Is node modules path. */
export declare function isNodeModulesPath(path: string): boolean
/** Resolve node solid runtime import. */
export declare function resolveNodeSolidRuntimeImport(specifier: string): string | null
/** Transform SolidJS/TSX source for the ax-tui JSX runtime. */
export declare function transformSolidSource(code: string, options: TransformSolidSourceOptions): Promise<string>
