import { readFileSync } from "node:fs"

const packageVersion: unknown = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version
const jsrVersion: unknown = JSON.parse(readFileSync(new URL("../jsr.json", import.meta.url), "utf8")).version
const tag = process.argv[2]

if (typeof packageVersion !== "string" || packageVersion !== jsrVersion) {
  throw new Error("package.json and jsr.json must have matching version strings")
}
if (tag !== `v${packageVersion}`) {
  throw new Error(`Release tag must be v${packageVersion}, received ${tag ?? "no tag"}`)
}
console.log(`Validated ${tag} against package.json and jsr.json`)
