import { mkdtempSync, mkdirSync, writeFileSync, rmSync, renameSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test } from "vitest"
import { selectNativeTargets } from "./build-native.js"
import { nativeSourceDigest } from "./native-source.js"

test("native build target selection requires an exact supported target", () => {
  expect(selectNativeTargets([], "linux-x64-musl").map((target) => target.zig)).toEqual(["x86_64-linux-musl"])
  expect(selectNativeTargets(["--target=win32-arm64"])[0]?.zig).toBe("aarch64-windows-gnu")
  expect(selectNativeTargets(["--all"])).toHaveLength(8)
  expect(() => selectNativeTargets(["--target=linux"])).toThrow("Unsupported native target")
  expect(() => selectNativeTargets(["--all", "--target=darwin-arm64"])).toThrow("Usage")
  expect(() => selectNativeTargets(["--unknown"])).toThrow("Usage")
})

test("native source digest covers file names and bytes but excludes compiler outputs", () => {
  const fixture = mkdtempSync(join(tmpdir(), "ax-tui-native-source-"))
  try {
    writeFileSync(join(fixture, "lib.zig"), "source")
    const initial = nativeSourceDigest(fixture)
    for (const dir of ["lib", "zig-out", ".zig-cache"]) {
      mkdirSync(join(fixture, dir))
      writeFileSync(join(fixture, dir, "compiled"), "output")
    }
    expect(nativeSourceDigest(fixture)).toBe(initial)
    renameSync(join(fixture, "lib.zig"), join(fixture, "other.zig"))
    const renamed = nativeSourceDigest(fixture)
    expect(renamed).not.toBe(initial)
    writeFileSync(join(fixture, "other.zig"), "changed")
    expect(nativeSourceDigest(fixture)).not.toBe(renamed)
  } finally {
    rmSync(fixture, { recursive: true, force: true })
  }
})
