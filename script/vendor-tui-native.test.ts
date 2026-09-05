import { describe, expect, test } from "vitest"
import { spawnSync } from "node:child_process"
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { assertBinaryFormat, checkVendorTree, listTarballNames } from "./vendor-tui-native"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const VENDOR = join(ROOT, "vendor")

describe("script.vendor-tui-native", () => {
  test("committed vendor tree matches manifest (offline integrity check)", () => {
    expect(checkVendorTree()).toEqual([])
  })

  test("manifest records provenance for all 8 upstream targets", () => {
    const manifest = JSON.parse(readFileSync(join(VENDOR, "manifest.json"), "utf8"))
    expect(manifest.upstream).toMatchObject({ version: expect.any(String), license: "MIT" })
    for (const [key, entry] of Object.entries<any>(manifest.targets)) {
      expect(entry.package, key).toBe(`@opentui/core-${key}`)
      expect(entry.tarballIntegrity, key).toMatch(/^sha512-/)
      expect(entry.lib.sha256, key).toMatch(/^[0-9a-f]{64}$/)
      expect(entry.lib.size, key).toBeGreaterThan(1_000_000)
      expect(entry.licenseSha256, key).toMatch(/^[0-9a-f]{64}$/)
    }
  })

  test("tar listing preserves full entry names, including paths with spaces", () => {
    const fixture = mkdtempSync(join(tmpdir(), "ax-tui-tar-listing-"))
    try {
      mkdirSync(join(fixture, "package"), { recursive: true })
      writeFileSync(join(fixture, "package", "my file.txt"), "x")
      writeFileSync(join(fixture, "package", "plain.txt"), "x")
      const tgz = join(fixture, "pkg.tgz")
      const res = spawnSync("tar", ["-czf", tgz, "-C", fixture, "package"], { encoding: "utf8" })
      expect(res.status, res.stderr).toBe(0)

      const names = listTarballNames(tgz)
      // A whitespace-split verbose listing would truncate this to "file.txt",
      // defeating the traversal and duplicate-entry checks.
      expect(names).toContain("package/my file.txt")
      expect(names).toContain("package/plain.txt")
    } finally {
      rmSync(fixture, { recursive: true, force: true })
    }
  })

  test("binary format validation accepts matching and rejects mismatched targets", () => {
    const dylibArm64 = readFileSync(join(VENDOR, "darwin-arm64", "libopentui.dylib"))
    expect(() => assertBinaryFormat(dylibArm64, { os: "darwin", cpu: "arm64", key: "darwin-arm64" })).not.toThrow()
    expect(() => assertBinaryFormat(dylibArm64, { os: "darwin", cpu: "x64", key: "darwin-x64" })).toThrow()
    expect(() => assertBinaryFormat(dylibArm64, { os: "linux", cpu: "arm64", key: "linux-arm64" })).toThrow()

    const elf = readFileSync(join(VENDOR, "linux-x64", "libopentui.so"))
    expect(() => assertBinaryFormat(elf, { os: "linux", cpu: "x64", key: "linux-x64" })).not.toThrow()
    expect(() => assertBinaryFormat(elf, { os: "linux", cpu: "arm64", key: "linux-arm64" })).toThrow()

    const dll = readFileSync(join(VENDOR, "win32-arm64", "opentui.dll"))
    expect(() => assertBinaryFormat(dll, { os: "win32", cpu: "arm64", key: "win32-arm64" })).not.toThrow()
    expect(() => assertBinaryFormat(dll, { os: "win32", cpu: "x64", key: "win32-x64" })).toThrow()

    expect(() =>
      assertBinaryFormat(Buffer.from("not a binary at all"), { os: "linux", cpu: "x64", key: "linux-x64" }),
    ).toThrow()
  })
})
