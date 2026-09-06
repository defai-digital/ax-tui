#!/usr/bin/env bun
/** Update options. */
export interface UpdateOptions {
  /** Path to parsers-config.json */
  configPath: string
  /** Directory where .wasm and .scm files will be downloaded */
  assetsDir: string
  /** Path where the generated TypeScript file will be written */
  outputPath: string
}
declare function main(options?: Partial<UpdateOptions>): Promise<void>
/** Run update assets cli. */
export declare function runUpdateAssetsCli(): Promise<void>
export { main as updateAssets }
