// @ts-self-types="./index.d.ts"
import { fileURLToPath } from "node:url"
import { prepareNativeLibraryFrom } from "./resolve.js"

/** Prepare a manifest-pinned native library for rendering or downstream staging. */
export function prepareNativeLibrary(target, options) {
  return prepareNativeLibraryFrom(fileURLToPath(new URL("../", import.meta.url)), target, options)
}
