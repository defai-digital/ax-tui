export type NativeTarget =
  | "darwin-arm64"
  | "darwin-x64"
  | "linux-arm64"
  | "linux-arm64-musl"
  | "linux-x64"
  | "linux-x64-musl"
  | "win32-arm64"
  | "win32-x64"

export interface NativeLibraryOptions {
  cacheDir?: string
  offline?: boolean
  signal?: AbortSignal
}

export interface NativeLibraryPaths {
  libraryPath: string
  licensePath: string
}

export declare function prepareNativeLibrary(
  target: NativeTarget,
  options?: NativeLibraryOptions,
): Promise<NativeLibraryPaths>
